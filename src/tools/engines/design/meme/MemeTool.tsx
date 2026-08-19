import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CsvTool } from '@/data/csvData'
import { Alert, EmptyState, Skeleton } from '@/components/ui'
import { Upload, Download, RefreshCw, Image as ImageIcon, Type, Frame, FileDown } from 'lucide-react'
import { analyticsApi } from '@/analytics'

/**
 * Meme Generator — upload an image, type a top + bottom caption, tune font
 * size / text colour / stroke, then preview the meme live on a real Canvas 2D
 * surface and export it as a PNG. Everything runs locally in the browser —
 * no server upload.
 */

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_BYTES = 15 * 1024 * 1024 // 15 MB
const MAX_DIM = 1600 // cap the export canvas longest edge (keeps PNGs reasonable)

interface Dims {
  width: number
  height: number
}

interface DrawOpts {
  topText: string
  bottomText: string
  fontSize: number // % of image height
  textColor: string
  strokeColor: string
  stroke: number // % of font size
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

/** Cap a dimension pair so the longest edge never exceeds MAX_DIM. */
function capDims(w: number, h: number): Dims {
  const longest = Math.max(w, h)
  if (longest <= MAX_DIM) return { width: w, height: h }
  const scale = MAX_DIM / longest
  return { width: Math.max(1, Math.round(w * scale)), height: Math.max(1, Math.round(h * scale)) }
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

const FONT_FACE = 'Impact, "Arial Black", Arial, sans-serif'

/** Draw image + captions onto a canvas at its full size. */
function draw(canvas: HTMLCanvasElement | null, dims: Dims | null, img: HTMLImageElement | null, o: DrawOpts): void {
  if (!canvas || !dims || !img) return
  if (canvas.width !== dims.width) canvas.width = dims.width
  if (canvas.height !== dims.height) canvas.height = dims.height
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Base image (cover the full canvas).
  ctx.drawImage(img, 0, 0, dims.width, dims.height)

  // Safe margins as a fraction of the width.
  const padW = dims.width * 0.05
  const maxTextWidth = dims.width - padW * 2

  // Font size in pixels, scaled from % of the image height.
  const basePx = Math.max(10, (o.fontSize / 100) * dims.height)

  // Draw a centred caption block anchored to the top or bottom of the canvas.
  const drawBlock = (text: string, anchorTop: boolean) => {
    const trimmed = text.trim()
    if (!trimmed) return
    // Fit font size so that wrapped lines stay inside a band.
    const band = dims.height * 0.36
    let px = basePx
    let lines: string[] = []
    for (;;) {
      ctx.font = `900 ${px}px ${FONT_FACE}`
      lines = wrapLines(ctx, trimmed, maxTextWidth, px)
      const blockHeight = lines.length * px * 1.15
      if (blockHeight <= band || px <= 12) break
      px -= Math.max(1, Math.round(px * 0.05))
    }

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.lineJoin = 'round'
    ctx.miterLimit = 2

    const lineHeight = px * 1.15
    const blockHeight = lines.length * lineHeight
    const startY = anchorTop
      ? Math.max(px * 0.55, band / 2 - blockHeight / 2 + 0)
      : dims.height - band / 2 - blockHeight / 2

    if (o.stroke > 0) {
      ctx.strokeStyle = o.strokeColor
      ctx.lineWidth = px * (o.stroke / 100)
    }
    ctx.fillStyle = o.textColor

    lines.forEach((line, i) => {
      const y = startY + i * lineHeight
      if (o.stroke > 0) ctx.strokeText(line, dims.width / 2, y, maxTextWidth)
      ctx.fillText(line, dims.width / 2, y, maxTextWidth)
    })
  }

  drawBlock(o.topText, true)
  drawBlock(o.bottomText, false)
}

/** Split text into lines that fit maxWidth, using current ctx.font. */
function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, _px: number): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length === 0) return []
  const lines: string[] = []
  let current = words[0]!
  for (let i = 1; i < words.length; i += 1) {
    const candidate = `${current} ${words[i]}`
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate
    } else {
      lines.push(current)
      current = words[i]!
    }
  }
  lines.push(current)
  return lines
}

/** Meme Tool. Uses only real browser APIs: File API, Image, Canvas 2D, Blob, URLs. */
export function MemeTool({ tool }: { tool: CsvTool }) {
  const name = tool.name
  const [source, setSource] = useState<File | null>(null)
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [dims, setDims] = useState<Dims | null>(null)
  const [topText, setTopText] = useState('')
  const [bottomText, setBottomText] = useState('')
  const [fontSize, setFontSize] = useState(13) // % of image height
  const [textColor, setTextColor] = useState('#ffffff')
  const [strokeColor, setStrokeColor] = useState('#000000')
  const [stroke, setStroke] = useState(8) // % of font size
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgUrlRef = useRef<string | null>(null)
  const renderedRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const establishBase = () => ({ tool: tool.slug, category: 'Design & Creative', source: 'csv' as const })

  const pickFile = useCallback((file: File | undefined | null) => {
    if (!file) return
    setError(null)
    const issue = validateFile(file)
    if (issue) {
      setError(issue)
      analyticsApi.trackToolFailed({ ...establishBase(), success: false, message: 'invalid_file' })
      return
    }
    setBusy(true)
    setSource(file)
    setImg(null)
    setDims(null)
    setTopText('')
    setBottomText('')
    renderedRef.current = false
    analyticsApi.trackToolRun(establishBase())

    if (imgUrlRef.current) URL.revokeObjectURL(imgUrlRef.current)
    const url = URL.createObjectURL(file)
    imgUrlRef.current = url

    const image = new Image()
    image.onload = () => {
      const capped = capDims(image.naturalWidth || 1, image.naturalHeight || 1)
      setDims(capped)
      setImg(image)
      setBusy(false)
    }
    image.onerror = () => {
      if (imgUrlRef.current) { URL.revokeObjectURL(imgUrlRef.current); imgUrlRef.current = null }
      setBusy(false)
      setError('This image could not be decoded. Try a different file.')
      analyticsApi.trackToolFailed({ ...establishBase(), success: false, message: 'decode_failed' })
    }
    image.src = url
  }, [tool.slug])

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
    pickFile(e.dataTransfer.files?.[0])
  }

  // Redraw on every caption/style change, and emit tool_open once.
  useEffect(() => {
    if (!img || !dims) return
    draw(canvasRef.current, dims, img, { topText, bottomText, fontSize, textColor, strokeColor, stroke })
    if (!renderedRef.current) {
      renderedRef.current = true
      analyticsApi.trackEvent('tool_complete', { tool: tool.slug, width: dims.width, height: dims.height })
    }
  }, [img, dims, topText, bottomText, fontSize, textColor, strokeColor, stroke, name])

  // tool_open once.
  const openedRef = useRef(false)
  useEffect(() => {
    if (openedRef.current) return
    openedRef.current = true
    analyticsApi.trackToolOpen(establishBase())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name])

  // Cleanup object URLs on unmount.
  useEffect(() => {
    return () => { if (imgUrlRef.current) URL.revokeObjectURL(imgUrlRef.current) }
  }, [])

  const reset = () => {
    if (imgUrlRef.current) { URL.revokeObjectURL(imgUrlRef.current); imgUrlRef.current = null }
    setSource(null)
    setImg(null)
    setDims(null)
    setTopText('')
    setBottomText('')
    setFontSize(13)
    setTextColor('#ffffff')
    setStrokeColor('#000000')
    setStroke(8)
    setError(null)
    setBusy(false)
    renderedRef.current = false
    if (inputRef.current) inputRef.current.value = ''
    analyticsApi.trackEvent('tool_reset', { tool: name })
  }

  const exportPng = () => {
    const canvas = canvasRef.current
    if (!canvas || !img) return
    canvas.toBlob((blob) => {
      if (!blob) {
        setError('Export produced no image data.')
        analyticsApi.trackEvent('tool_error', { tool: name, type: 'export' })
        return
      }
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'meme'
      a.href = url
      a.download = `${base}.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      analyticsApi.trackDownload({ tool: name, fileType: 'png' })
    }, 'image/png')
  }

  const dropClass = dragActive
    ? 'border-indigo-400 bg-indigo-500/10'
    : 'border-white/10 bg-white/[0.02] hover:border-white/20'

  const renderReady = Boolean(img && dims)

  return (
    <div className="space-y-5">
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Upload / drop zone — the empty state. */}
      {!renderReady ? (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload an image for your meme"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          className={`cursor-pointer rounded-2xl border-2 border-dashed transition-colors duration-200 motion-reduce:transition-none ${dropClass}`}
        >
          <EmptyState
            icon={ImageIcon}
            title="Start with a base image"
            description="Upload or drop a PNG, JPG, or WEBP image and we'll stamp your captions on top. Everything stays in your browser."
          />
        </div>
      ) : (
        <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-5">
          {/* Live canvas preview + export */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-gray-400 truncate" title={source?.name ?? ''}>{source?.name ?? ''}</span>
                <span className="text-xs text-gray-500">{dims ? `${dims.width}×${dims.height}` : ''}</span>
              </div>
              <div className="relative overflow-hidden rounded-lg bg-black/40 flex items-center justify-center">
                {busy && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                    <span className="inline-block w-5 h-5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin motion-reduce:animate-none" aria-hidden="true" />
                    <span className="ml-3 text-sm text-gray-300">Loading image…</span>
                  </div>
                )}
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto rounded-lg"
                  style={{ width: '100%' }}
                  aria-label="Live meme preview"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 text-center">Live preview — edits below update the meme instantly.</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={exportPng}
                disabled={!renderReady}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors motion-reduce:transition-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileDown className="w-4 h-4" aria-hidden="true" />Export PNG
              </button>
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

          {/* Caption controls — meme-specific */}
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm text-gray-400">
                <Type className="w-3.5 h-3.5" aria-hidden="true" />Top text
              </label>
              <textarea
                value={topText}
                onChange={(e) => setTopText(e.target.value)}
                rows={2}
                maxLength={140}
                placeholder="TOP CAPTION"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm text-gray-400">
                <Type className="w-3.5 h-3.5" aria-hidden="true" />Bottom text
              </label>
              <textarea
                value={bottomText}
                onChange={(e) => setBottomText(e.target.value)}
                rows={2}
                maxLength={140}
                placeholder="BOTTOM CAPTION"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center justify-between text-sm text-gray-400">
                <span className="inline-flex items-center gap-1.5"><Type className="w-3.5 h-3.5" aria-hidden="true" />Font size</span>
                <span className="text-indigo-400">{fontSize}%</span>
              </label>
              <input
                type="range" min={6} max={24} step={1} value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-indigo-500"
                aria-label="Caption font size (percent of image height)"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm text-gray-400">
                  <Type className="w-3.5 h-3.5" aria-hidden="true" />Text color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color" value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="h-9 w-12 rounded-lg border border-white/10 bg-white/5 cursor-pointer"
                    aria-label="Caption text color"
                  />
                  <span className="text-xs text-gray-500 font-mono uppercase">{textColor}</span>
                </div>
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm text-gray-400">
                  <Type className="w-3.5 h-3.5" aria-hidden="true" />Stroke color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color" value={strokeColor}
                    onChange={(e) => setStrokeColor(e.target.value)}
                    className="h-9 w-12 rounded-lg border border-white/10 bg-white/5 cursor-pointer"
                    aria-label="Caption stroke (outline) color"
                  />
                  <span className="text-xs text-gray-500 font-mono uppercase">{strokeColor}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1.5 flex items-center justify-between text-sm text-gray-400">
                <span className="inline-flex items-center gap-1.5"><Type className="w-3.5 h-3.5" aria-hidden="true" />Stroke weight</span>
                <span className="text-indigo-400">{stroke}</span>
              </label>
              <input
                type="range" min={0} max={20} step={1} value={stroke}
                onChange={(e) => setStroke(Number(e.target.value))}
                className="w-full accent-indigo-500"
                aria-label="Caption stroke weight"
              />
              <p className="mt-1 text-xs text-gray-500">Set to 0 to remove the outline.</p>
            </div>
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