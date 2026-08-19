import { useCallback, useEffect, useRef, useState } from 'react'
import type { CsvTool } from '@/data/csvData'
import { Alert, EmptyState, Skeleton, Progress } from '@/components/ui'
import { Upload, Download, RefreshCw, Image as ImageIcon } from 'lucide-react'
import { analyticsApi } from '@/analytics'

/**
 * Image Compressor — upload an image, pick a lossy/lossless format and quality,
 * compress it in-browser via Canvas 2D `canvas.toBlob`, preview before/after
 * with real size + reduction %, then download the actual compressed file.
 * All processing runs locally — nothing is uploaded.
 */

type Format = 'jpg' | 'png' | 'webp'

const MIME: Record<Format, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_BYTES = 15 * 1024 * 1024 // 15 MB
const QUALITY_MIN = 0.1
const QUALITY_MAX = 1

interface Result {
  blob: Blob
  width: number
  height: number
  size: number
  originalSize: number
  reductionPct: number
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

/** Decode a local image URL into an HTMLImageElement (natural dimensions). */
function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('This image could not be decoded.'))
    img.src = url
  })
}

/** Validate an uploaded File. Returns a human-readable error or null. */
function validateFile(file: File): string | null {
  if (!file) return 'No file was selected.'
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return `Unsupported file type "${file.type || 'unknown'}". Please upload a PNG, JPG, or WEBP image.`
  }
  if (file.size > MAX_BYTES) {
    return `File is too large (${formatBytes(file.size)}). Maximum size is ${formatBytes(MAX_BYTES)}.`
  }
  if (file.size === 0) return 'The selected file is empty.'
  return null
}

export function ImageCompressorTool({ tool }: { tool: CsvTool }) {
  const [source, setSource] = useState<File | null>(null)
  const [srcUrl, setSrcUrl] = useState<string | null>(null)
  const [srcDims, setSrcDims] = useState<{ width: number; height: number } | null>(null)

  const [format, setFormat] = useState<Format>('jpg')
  const [qualityPct, setQualityPct] = useState(75) // 0-100, mapped to 0..1 for toBlob
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const srcUrlRef = useRef<string | null>(null)
  const establishBase = () => ({ tool: tool.slug, category: tool.category, source: 'csv' as const })

  // Emit tool_open once on mount.
  useEffect(() => {
    analyticsApi.trackToolOpen(establishBase())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool.slug])

  // Revoke the latest object URL on unmount to avoid leaks.
  useEffect(() => {
    return () => { if (srcUrlRef.current) URL.revokeObjectURL(srcUrlRef.current) }
  }, [])

  const pickFile = useCallback((file: File | undefined | null) => {
    if (!file) return
    setError(null)
    const issue = validateFile(file)
    if (issue) {
      setError(issue)
      analyticsApi.trackToolFailed({ ...establishBase(), success: false, message: 'invalid_file' })
      return
    }
    setSource(file)
    setResult(null)
    setSrcDims(null)
    setSrcUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      const url = URL.createObjectURL(file)
      srcUrlRef.current = url
      return url
    })
  }, [tool.slug])

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    pickFile(file)
  }

  const compress = async () => {
    if (!source || !srcUrl) return
    setBusy(true)
    setError(null)
    const startedAt = Date.now()
    const base = establishBase()
    analyticsApi.trackToolRun(base)
    try {
      const img = await loadImageElement(srcUrl)
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas is not available in this browser.')

      // Flatten to white before lossy encoding so transparency doesn't turn black.
      if (format !== 'png') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      ctx.drawImage(img, 0, 0)

      const quality = format === 'png' ? undefined : Math.min(QUALITY_MAX, Math.max(QUALITY_MIN, qualityPct / 100))
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), MIME[format], quality)
      })
      if (!blob) throw new Error('Compression produced no output.')

      const reductionPct = ((source.size - blob.size) / source.size) * 100
      setResult({ blob, width: canvas.width, height: canvas.height, size: blob.size, originalSize: source.size, reductionPct })
      analyticsApi.trackToolComplete({ ...base, format, width: canvas.width, height: canvas.height, durationMs: Date.now() - startedAt, success: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Compression failed.'
      setError(message)
      analyticsApi.trackToolFailed({ ...base, durationMs: Date.now() - startedAt, success: false, message: format })
    } finally {
      setBusy(false)
    }
  }

  const baseName = (name: string) => name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'image'

  const download = () => {
    if (!result) return
    const url = URL.createObjectURL(result.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${baseName(tool.name)}.${format}`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    analyticsApi.trackDownload({ tool: tool.slug, fileType: format })
  }

  const reset = () => {
    if (srcUrlRef.current) URL.revokeObjectURL(srcUrlRef.current)
    srcUrlRef.current = null
    setSource(null)
    setSrcUrl(null)
    setSrcDims(null)
    setResult(null)
    setError(null)
    setFormat('jpg')
    setQualityPct(75)
    analyticsApi.trackEvent('tool_reset', establishBase())
    if (inputRef.current) inputRef.current.value = ''
  }

  const dropClass = dragActive
    ? 'border-indigo-400 bg-indigo-500/10'
    : 'border-white/10 bg-white/[0.02] hover:border-white/20'

  return (
    <div className="space-y-5">
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Upload / drop zone — shown when no image is loaded (empty state). */}
      {!source ? (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload an image"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          className={`cursor-pointer rounded-2xl border-2 border-dashed transition-colors duration-200 motion-reduce:transition-none ${dropClass}`}
        >
          <EmptyState
            icon={ImageIcon}
            title="Drop an image to compress"
            description="Drag & drop a PNG, JPG, or WEBP file (up to 15 MB), or click to browse. Compression runs entirely in your browser."
          />
        </div>
      ) : (
        <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-5">
          {/* Preview + before/after */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-gray-400 truncate" title={source.name}>{source.name}</span>
                <span className="text-xs text-gray-500">{srcDims ? `${srcDims.width}×${srcDims.height}` : formatBytes(source.size)}</span>
              </div>
              <div className="relative min-h-[220px] max-h-[420px] overflow-auto flex items-center justify-center bg-[radial-gradient(circle_at_center,#ffffff0a,transparent)]">
                {srcUrl && (
                  <img
                    src={srcUrl}
                    alt="Preview of the uploaded image"
                    className="max-w-full h-auto max-h-[420px] rounded-lg"
                    // onLoad derives natural dimensions for reporting.
                    onLoad={(e) => {
                      const el = e.currentTarget
                      setSrcDims({ width: el.naturalWidth, height: el.naturalHeight })
                    }}
                  />
                )}
                {srcUrl && !srcDims && !busy && (
                  <div className="absolute inset-0 p-3">
                    <Skeleton className="w-full h-full min-h-[196px]" />
                  </div>
                )}
                {busy && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 rounded-lg">
                    <span className="inline-block w-5 h-5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin motion-reduce:animate-none" aria-hidden="true" />
                    <span className="text-sm text-gray-300">Compressing…</span>
                  </div>
                )}
              </div>
              {busy && <div className="mt-3"><Progress value={90} label="Compressing image" /></div>}

              {result && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Stat label="Before" value={formatBytes(result.originalSize)} />
                  <Stat label="After" value={formatBytes(result.size)} />
                  <Stat label="Saved" value={`${result.reductionPct >= 0 ? formatBytes(result.originalSize - result.size) : formatBytes(0)}`} />
                  <Stat
                    label="Reduction"
                    value={result.reductionPct >= 0 ? `${Math.round(result.reductionPct)}%` : `${Math.round(result.reductionPct)}%`}
                    tone={result.reductionPct >= 0 ? 'good' : 'bad'}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Controls — tool-specific compressor panel. */}
          <div className="space-y-4">
            <div>
              <span className="block text-sm text-gray-400 mb-2">Output format</span>
              <div className="grid grid-cols-3 gap-2">
                {(['jpg', 'webp', 'png'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => { setFormat(f); setResult(null) }}
                    className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors motion-reduce:transition-none ${
                      format === f
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                {format === 'png'
                  ? 'PNG is lossless — quality below has no effect on file size.'
                  : 'Lossy encoding — lower quality means a smaller file.'}
              </p>
            </div>

            {format !== 'png' && (
              <label className="block">
                <span className="flex items-center justify-between text-sm text-gray-400 mb-2">
                  <span>Quality</span>
                  <span className="text-indigo-400 font-medium">{qualityPct}%</span>
                </span>
                <input
                  type="range"
                  min={Math.round(QUALITY_MIN * 100)}
                  max={100}
                  step={1}
                  value={qualityPct}
                  onChange={(e) => { setQualityPct(Number(e.target.value)); setResult(null) }}
                  className="w-full accent-indigo-500"
                  aria-label="Compression quality percentage"
                />
              </label>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                onClick={compress}
                disabled={busy}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors motion-reduce:transition-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? (
                  <><span className="inline-block w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin motion-reduce:animate-none" aria-hidden="true" />Compressing…</>
                ) : (
                  <><Download className="w-4 h-4" aria-hidden="true" />Compress</>
                )}
              </button>
              {result && (
                <button
                  onClick={download}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors motion-reduce:transition-none"
                >
                  <Download className="w-4 h-4" aria-hidden="true" />Download {format.toUpperCase()}
                </button>
              )}
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors motion-reduce:transition-none"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />Reset
              </button>
            </div>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors motion-reduce:transition-none"
            >
              <Upload className="w-4 h-4" aria-hidden="true" />Replace image…
            </button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => { pickFile(e.target.files?.[0]); e.currentTarget.value = '' }}
      />
    </div>
  )
}

function Stat({ label, value, accent, tone }: { label: string; value: string; accent?: boolean; tone?: 'good' | 'bad' }) {
  const toneCls = tone === 'good' ? 'text-emerald-400' : tone === 'bad' ? 'text-red-400' : accent ? 'text-indigo-400' : 'text-white'
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
      <div className="text-[11px] uppercase tracking-wider text-gray-500">{label}</div>
      <div className={`text-lg font-semibold ${toneCls}`}>{value}</div>
    </div>
  )
}