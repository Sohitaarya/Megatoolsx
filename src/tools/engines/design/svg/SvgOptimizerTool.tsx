import { useCallback, useEffect, useRef, useState } from 'react'
import type { CsvTool } from '@/data/csvData'
import { Alert, Progress } from '@/components/ui'
import { Upload, Download, Check, FileSearch, Wand2, Trash2, ShieldAlert } from 'lucide-react'
import { analyticsApi } from '@/analytics'

/**
 * SVG Optimizer / Validator — paste or upload an SVG, parse it safely with
 * DOMParser (never executing scripts), validate with clear errors, compute the
 * before/after size, optimize by stripping comments + whitespace, preview the
 * result live via an <img> (not dangerouslySetInnerHTML), and download the
 * optimized .svg. All processing runs locally in the browser.
 *
 * Security: user SVG is only ever consumed through DOMParser + XMLSerializer
 * and rendered via a Blob URL in an <img>. Script elements, event-handler
 * attributes and javascript: hrefs are stripped. No dangerouslySetInnerHTML.
 */

/** Text-bearing SVG elements whose whitespace must be preserved. */
const TEXT_BEARING = new Set(['text', 'tspan', 'textPath', 'title', 'desc', 'altGlyph', 'style'])
const SVG_NS = 'http://www.w3.org/2000/svg'
const MAX_CHARS = 2_000_000 // guard against pathological inputs

interface OptimizeOptions {
  removeComments: boolean
  collapseWhitespace: boolean
}

interface ValidationResult {
  commentCount: number
  elementCount: number
  warnings: string[]
  valid: boolean
}

interface OptimizeResult {
  optimized: string
  originalBytes: number
  optimizedBytes: number
  reductionPct: number
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function svgToObjectUrl(svg: string): string {
  return URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
}

function baseName(name: string): string {
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return slug || 'icon'
}

/** Safe parse of SVG text via DOMParser. Returns a document or throws with a clear message. */
function parseSvg(text: string, warnings: string[]): Document {
  const trimmed = text.trim()
  if (!trimmed) throw new Error('The SVG source is empty. Paste or upload an SVG to continue.')
  if (trimmed.length > MAX_CHARS) throw new Error('The SVG is too large. Maximum input size is 2 MB.')

  let doc: Document
  try {
    doc = new DOMParser().parseFromString(trimmed, 'image/svg+xml')
  } catch {
    throw new Error('The browser could not parse this as XML. The markup may be malformed.')
  }

  const parserError = doc.querySelector('parsererror')
  if (parserError) {
    const detail = parserError.textContent?.replace(/\s+/g, ' ').trim().slice(0, 200) ?? 'unknown parse error'
    throw new Error(`Malformed SVG/XML — ${detail}`)
  }

  const root = doc.documentElement
  if (!root || root.nodeName.toLowerCase() !== 'svg') {
    throw new Error('The document root is not an <svg> element. Valid SVG must start with <svg>.')
  }
  if (!root.hasAttribute('viewBox') && !root.hasAttribute('width') && !root.hasAttribute('height')) {
    warnings.push('The <svg> has no viewBox or size attributes — it may render at an unexpected scale.')
  }
  return doc
}

/** Recursively strip unsafe nodes (script, foreignObject descendants) and attributes. */
function sanitize(node: Node, warnings: string[]): void {
  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as Element
    const tag = el.localName.toLowerCase()
    if (tag === 'script' || tag === 'foreignobject' || tag === 'iframe') {
      warnings.push(`Removed unsafe <${tag}> element for security.`)
      el.parentNode?.removeChild(el)
      return
    }
    // Remove inline event handlers and javascript: hrefs.
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase()
      if (name.startsWith('on')) {
        el.removeAttribute(attr.name)
        warnings.push(`Removed event-handler attribute "${attr.name}".`)
        continue
      }
      const value = attr.value.trim().toLowerCase()
      if (
        (name === 'href' || name === 'xlink:href' || name === 'src') &&
        (value.startsWith('javascript:') || value.startsWith('data:text/html'))
      ) {
        el.removeAttribute(attr.name)
        warnings.push(`Removed unsafe "${attr.name}" value for security.`)
      }
    }
  }
  for (const child of Array.from(node.childNodes)) {
    sanitize(child, warnings)
  }
}

/** Recursively remove comment + whitespace-only text nodes. Returns counts. */
function prune(node: Node, removeComments: boolean, counts: { comments: number; whitespace: number }): void {
  const children = Array.from(node.childNodes)
  for (const child of children) {
    if (child.nodeType === Node.COMMENT_NODE) {
      if (removeComments) {
        node.removeChild(child)
        counts.comments += 1
      }
      continue
    }
    if (child.nodeType === Node.TEXT_NODE) {
      const parent = (node as Element).localName
      const isTextBearing = TEXT_BEARING.has(parent)
      const hasText = /\S/.test(child.textContent ?? '')
      if (!isTextBearing && !hasText) {
        node.removeChild(child)
        counts.whitespace += 1
        continue
      }
    }
    if (child.nodeType === Node.ELEMENT_NODE) {
      prune(child, removeComments, counts)
    }
  }
}

/** Optimize a validated Document to a minified SVG string. */
function optimizeSource(doc: Document, opts: OptimizeOptions): string {
  const root = doc.documentElement
  const clone = root.cloneNode(true) as Element

  // Recreate an independent SVG document around the cloned root so the
  // original parsed doc stays untouched for the original preview.
  const outDoc = doc.implementation.createDocument(SVG_NS, 'svg', null)
  const outRoot = outDoc.documentElement
  // Copy the root's attributes across.
  for (const attr of Array.from(clone.attributes)) outRoot.setAttribute(attr.name, attr.value)
  while (clone.firstChild) outRoot.appendChild(clone.firstChild)

  const counts = { comments: 0, whitespace: 0 }
  prune(outRoot, opts.removeComments, counts)

  let xml = new XMLSerializer().serializeToString(outRoot)
  if (opts.collapseWhitespace) {
    xml = xml
      .replace(/>\s+</g, '><')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{2,}/g, '\n')
  }
  return xml.trim()
}

export function SvgOptimizerTool({ tool }: { tool: CsvTool }) {
  const [input, setInput] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [optimizedUrl, setOptimizedUrl] = useState<string | null>(null)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [result, setResult] = useState<OptimizeResult | null>(null)

  const [opts, setOpts] = useState<OptimizeOptions>({ removeComments: true, collapseWhitespace: true })

  const inputRef = useRef<HTMLInputElement>(null)
  const originalUrlRef = useRef<string | null>(null)
  const optimizedUrlRef = useRef<string | null>(null)

  const establishBase = () => ({ tool: tool.slug, category: tool.category, source: 'csv' as const })

  // Emit tool_open once.
  useEffect(() => {
    analyticsApi.trackToolOpen(establishBase())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool.slug])

  // Revoke object URLs on unmount.
  useEffect(() => {
    return () => {
      if (originalUrlRef.current) URL.revokeObjectURL(originalUrlRef.current)
      if (optimizedUrlRef.current) URL.revokeObjectURL(optimizedUrlRef.current)
    }
  }, [])

  const resetUrls = useCallback(() => {
    if (originalUrlRef.current) { URL.revokeObjectURL(originalUrlRef.current); originalUrlRef.current = null }
    if (optimizedUrlRef.current) { URL.revokeObjectURL(optimizedUrlRef.current); optimizedUrlRef.current = null }
    setOriginalUrl(null)
    setOptimizedUrl(null)
  }, [])

  /** Parse + validate + sanitize the current input text. Returns void; sets state. */
  const validate = useCallback(() => {
    const source = input
    resetUrls()
    setResult(null)
    setError(null)
    setValidation(null)

    if (!source.trim()) {
      setError('The SVG source is empty. Paste or upload an SVG to continue.')
      return
    }

    setValidating(true)
    try {
      const warnings: string[] = []
      const doc = parseSvg(source, warnings)
      sanitize(doc, warnings)

      let commentCount = 0
      let elementCount = 0
      const walker = doc.createTreeWalker(doc, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT)
      let current = walker.nextNode()
      while (current) {
        if (current.nodeType === Node.COMMENT_NODE) commentCount += 1
        else elementCount += 1
        current = walker.nextNode()
      }

      const url = svgToObjectUrl(source)
      originalUrlRef.current = url
      setOriginalUrl(url)
      setValidation({ commentCount, elementCount, warnings, valid: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Validation failed.'
      setError(message)
      setValidation(null)
    } finally {
      setValidating(false)
    }
  }, [input])

  useEffect(() => {
    // Debounced live re-validate while the user is pasting/editing.
    if (!input.trim()) { resetUrls(); setError(null); setValidation(null); setResult(null); return }
    const t = setTimeout(() => validate(), 500)
    return () => clearTimeout(t)
  }, [input, validate, resetUrls])

  const pickFile = useCallback(async (file: File | undefined | null) => {
    if (!file) return
    setBusy(true)
    setError(null)
    const base = establishBase()
    try {
      const text = await file.text()
      setInput(text)
      setFileName(file.name)

      // Immediately validate + sanitize the uploaded SVG.
      const warnings: string[] = []
      const doc = parseSvg(text, warnings)
      sanitize(doc, warnings)

      let commentCount = 0
      let elementCount = 0
      const walker = doc.createTreeWalker(doc, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT)
      let node = walker.nextNode()
      while (node) {
        if (node.nodeType === Node.COMMENT_NODE) commentCount += 1
        else elementCount += 1
        node = walker.nextNode()
      }

      resetUrls()
      const url = svgToObjectUrl(text)
      originalUrlRef.current = url
      setOriginalUrl(url)
      setValidation({ valid: true, commentCount, elementCount, warnings })
      analyticsApi.trackToolComplete({ ...base, success: true, mode: 'local' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not read or validate that file.'
      setError(message)
      analyticsApi.trackToolFailed({ ...base, success: false, message })
    } finally {
      setBusy(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool.slug])

  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) await pickFile(file)
  }

  const optimize = () => {
    if (!input.trim()) { setError('Nothing to optimize. Paste or upload an SVG first.'); return }
    setError(null)
    const base = establishBase()
    const startedAt = Date.now()
    analyticsApi.trackToolRun(base)
    setBusy(true)
    try {
      const warnings: string[] = []
      const doc = parseSvg(input, warnings)
      // Optimize runs on the sanitized copy so unsafe content is never emitted.
      const optimized = optimizeSource(doc, opts)

      const originalBytes = new Blob([input]).size
      const optimizedBytes = new Blob([optimized]).size
      const reductionPct = ((originalBytes - optimizedBytes) / originalBytes) * 100

      if (optimizedUrlRef.current) { URL.revokeObjectURL(optimizedUrlRef.current); optimizedUrlRef.current = null }
      const url = svgToObjectUrl(optimized)
      optimizedUrlRef.current = url
      setOptimizedUrl(url)
      setResult({ optimized, originalBytes, optimizedBytes, reductionPct })
      setValidation((v) => (v ? { ...v, valid: v.warnings.length === 0 } : v))
      analyticsApi.trackToolComplete({ ...establishBase(), durationMs: Date.now() - startedAt, success: true, mode: 'local' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Optimization failed.'
      setError(message)
      analyticsApi.trackToolFailed({ ...establishBase(), durationMs: Date.now() - startedAt, success: false, message })
    } finally {
      setBusy(false)
    }
  }

  const download = () => {
    if (!result?.optimized) return
    const url = optimizedUrl ?? svgToObjectUrl(result.optimized)
    const stem = fileName ? baseName(fileName.replace(/\.svg$/i, '')) : baseName(tool.name)
    const a = document.createElement('a')
    a.href = url
    a.download = `${stem}.svg`
    document.body.appendChild(a)
    a.click()
    a.remove()
    if (!optimizedUrl) URL.revokeObjectURL(url)
    analyticsApi.trackDownload({ tool: tool.slug, fileType: 'svg' })
  }

  const reset = () => {
    setInput('')
    setFileName(null)
    setError(null)
    resetUrls()
    setValidation(null)
    setResult(null)
    setOpts({ removeComments: true, collapseWhitespace: true })
    analyticsApi.trackEvent('tool_reset', establishBase())
    if (inputRef.current) inputRef.current.value = ''
  }

  const hasSource = input.trim().length > 0
  const reduction = result ? Math.max(0, Math.round(result.reductionPct)) : 0

  return (
    <div className="space-y-5">
      {error && <Alert variant="danger">{error}</Alert>}
      {validation && validation.warnings.length > 0 && (
        <Alert variant="warning" title="Cleaned for safety">
          {validation.warnings.join(' ')}
        </Alert>
      )}

      {/* Input controls — paste or upload. */}
      <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-5">
        <div className="space-y-4">
          {/* Paste editor */}
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-gray-400">
                <FileSearch className="w-4 h-4" aria-hidden="true" />
                {fileName ? fileName : 'SVG source'}
              </span>
              <span className="text-xs text-gray-500">{input ? `${input.length.toLocaleString()} chars` : ''}</span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={'<svg viewBox="0 0 24 24">\n  <!-- your SVG markup -->\n</svg>'}
              spellCheck={false}
              className="w-full min-h-[240px] resize-y rounded-xl bg-white/5 border border-white/10 p-4 font-mono text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              aria-label="Paste SVG markup"
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={validate}
                disabled={validating}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors motion-reduce:transition-none disabled:opacity-50"
              >
                {validating ? (
                  <><span className="inline-block w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin motion-reduce:animate-none" aria-hidden="true" />Validating…</>
                ) : (
                  <><Check className="w-4 h-4" aria-hidden="true" />Validate & Preview</>
                )}
              </button>
              <button type="button" onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors motion-reduce:transition-none">
                <Upload className="w-4 h-4" aria-hidden="true" />Upload .svg
              </button>
            </div>
          </div>

          {/* Original preview (rendered via img — never dangerouslySetInnerHTML). */}
          {hasSource && (
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-gray-400">Original preview</span>
                {validation && <span className="text-xs text-emerald-400">Valid SVG ✓</span>}
              </div>
              <div className="flex items-center justify-center min-h-[160px] max-h-[320px] overflow-auto rounded-lg bg-[radial-gradient(circle_at_center,#ffffff0a,transparent)]">
                {originalUrl ? (
                  <img src={originalUrl} alt="Original SVG preview" className="max-w-full max-h-[300px]" />
                ) : (
                  <span className="text-sm text-gray-500">Waiting for a valid preview…</span>
                )}
              </div>
            </div>
          )}

          {/* Optimized preview + stats */}
          {result && (
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-gray-400">Optimized preview</span>
                {result.optimized && <span className="text-xs text-emerald-400">{reduction}% smaller</span>}
              </div>
              <div className="flex items-center justify-center min-h-[160px] max-h-[280px] overflow-auto rounded-lg bg-[radial-gradient(circle_at_center,#ffffff0a,transparent)]">
                {optimizedUrl ? (
                  <img src={optimizedUrl} alt="Optimized SVG preview" className="max-w-full max-h-[300px]" />
                ) : (
                  <span className="text-sm text-gray-500">Optimize to generate a preview.</span>
                )}
              </div>
              {result.optimized && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Stat label="Before" value={formatBytes(result.originalBytes)} />
                  <Stat label="After" value={formatBytes(result.optimizedBytes)} />
                  <Stat label="Saved" value={formatBytes(Math.max(0, result.originalBytes - result.optimizedBytes))} />
                  <Stat label="Reduction" value={`${reduction}%`} tone={reduction > 0 ? 'good' : 'bad'} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tool-specific controls */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-4">
            <div>
              <span className="block text-sm text-gray-400 mb-2">Optimization options</span>
            </div>
            <label className="flex items-center justify-between text-sm">
              <span className="text-gray-300 flex items-center gap-2"><Trash2 className="w-4 h-4" aria-hidden="true" />Remove comments</span>
              <input type="checkbox" checked={opts.removeComments} onChange={(e) => setOpts((o) => ({ ...o, removeComments: e.target.checked }))} className="accent-indigo-500" aria-label="Remove comments" />
            </label>
            <label className="flex items-center justify-between text-sm">
              <span className="text-gray-300 flex items-center gap-2"><Wand2 className="w-4 h-4" aria-hidden="true" />Collapse whitespace</span>
              <input type="checkbox" checked={opts.collapseWhitespace} onChange={(e) => setOpts((o) => ({ ...o, collapseWhitespace: e.target.checked }))} className="accent-indigo-500" aria-label="Collapse whitespace" />
            </label>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-gray-400">
              {validation
                ? <span><span className="text-indigo-400">{validation.elementCount}</span> elements · <span className="text-indigo-400">{validation.commentCount}</span> comments{validation.warnings.length ? ` · ${validation.warnings.length} safety fix(es)` : ''}</span>
                : 'Valid SVG only — scripts, event handlers and javascript: URLs are stripped.'}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={optimize}
              disabled={busy || !hasSource}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors motion-reduce:transition-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy ? (
                <><span className="inline-block w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin motion-reduce:animate-none" aria-hidden="true" />Optimizing…</>
              ) : (
                <><Wand2 className="w-4 h-4" aria-hidden="true" />Optimize</>
              )}
            </button>
            {result?.optimized && (
              <button
                onClick={download}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors motion-reduce:transition-none"
              >
                <Download className="w-4 h-4" aria-hidden="true" />Download .svg
              </button>
            )}
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors motion-reduce:transition-none"
            >
              <ShieldAlert className="w-4 h-4" aria-hidden="true" />Reset
            </button>
          </div>

          {busy && <Progress value={90} label="Optimizing SVG" />}
          <p className="text-xs text-gray-500">
            Processing runs entirely in your browser. Nothing is uploaded and no scripts in your SVG are executed.
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".svg,image/svg+xml"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => { pickFile(e.target.files?.[0]); e.currentTarget.value = '' }}
      />
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'bad' }) {
  const toneCls = tone === 'good' ? 'text-emerald-400' : tone === 'bad' ? 'text-red-400' : 'text-white'
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
      <div className="text-[11px] uppercase tracking-wider text-gray-500">{label}</div>
      <div className={`text-lg font-semibold ${toneCls}`}>{value}</div>
    </div>
  )
}