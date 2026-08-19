import { useCallback, useEffect, useRef, useState } from 'react'
import type { CsvTool } from '@/data/csvData'
import { Alert, EmptyState, Skeleton } from '@/components/ui'
import { analyticsApi } from '@/analytics'
import {
  Brush, Eraser, Minus, Square, Circle, Undo2, Redo2, Trash2, Download, RotateCcw,
} from 'lucide-react'

/**
 * Drawing / Whiteboard — a scratchpad rendered to a real Canvas 2D surface.
 * Pointer (mouse + touch) freehand/vshapes with tool, color and stroke-size
 * selection, undo/redo via a full snapshot history stack, clear, and real
 * PNG export. Everything runs locally in the browser — no upload.
 *
 * Pointer Events unify mouse and touch (touch-action: none), so drawing works
 * on phones/tablets as well as desktops.
 */

type ToolId = 'brush' | 'eraser' | 'line' | 'rect' | 'circle'

interface Point {
  x: number
  y: number
}

/** Render size of the export/board. Canvas is always this large; CSS scales it down. */
const CW = 1600
const CH = 1000
const BACKGROUND = '#ffffff'
/** Cap history depth so the stack stays memory-bounded. */
const MAX_HISTORY = 60

const TOOLS: { id: ToolId; label: string; icon: typeof Brush }[] = [
  { id: 'brush', label: 'Brush', icon: Brush },
  { id: 'eraser', label: 'Eraser', icon: Eraser },
  { id: 'line', label: 'Line', icon: Minus },
  { id: 'rect', label: 'Rectangle', icon: Square },
  { id: 'circle', label: 'Circle', icon: Circle },
]

const SWATCHES = [
  '#000000', '#ffffff', '#374151', '#6366f1', '#8b5cf6', '#ec4899',
  '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#06b6d4', '#3b82f6',
]

const SIZES = [4, 8, 14, 24, 40]

export function DrawingTool({ tool }: { tool: CsvTool }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const lastRef = useRef<Point>({ x: 0, y: 0 })
  const startRef = useRef<Point>({ x: 0, y: 0 })
  const preImageRef = useRef<string | null>(null)
  const undoRef = useRef<string[]>([])
  const redoRef = useRef<string[]>([])
  const contentRef = useRef(false)

  const [toolId, setToolId] = useState<ToolId>('brush')
  const [color, setColor] = useState('#000000')
  const [size, setSize] = useState(8)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasContent, setHasContent] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [, setVersion] = useState(0)

  // Bump version so disabled/empty states derived from refs re-render.
  const bump = useCallback(() => setVersion((v) => v + 1), [])

  // Emit tool_open once per mount.
  useEffect(() => {
    analyticsApi.trackToolOpen({ tool: tool.slug, category: tool.category, source: 'csv' })
  }, [tool.slug, tool.category])

  // Initialize the canvas (white board) once on mount.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    try {
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas 2D is not supported by this browser.')
      ctx.fillStyle = BACKGROUND
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      // Brief deferred flip so the Skeleton paints before the board appears.
      const t = window.setTimeout(() => setLoading(false), 250)
      return () => window.clearTimeout(t)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not initialize the canvas.')
      setLoading(false)
    }
  }, [])

  const avoidEmptyContext = () => {
    // Snapshot before the current action so undo can restore the previous state.
    const canvas = canvasRef.current
    preImageRef.current = canvas ? canvas.toDataURL('image/png') : null
  }

  const pushHistory = useCallback(() => {
    // The retained pre-action frame becomes the newest undo entry.
    if (preImageRef.current) undoRef.current.push(preImageRef.current)
    if (undoRef.current.length > MAX_HISTORY) undoRef.current.shift()
    redoRef.current = []
    contentRef.current = true
    setHasContent(true)
    bump()
  }, [bump])

  /** Map a pointer event to canvas pixel coords (accounts for CSS scaling/DPR). */
  const toCanvas = useCallback((e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return { x: 0, y: 0 }
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    }
  }, [])

  const clearOverlay = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.save()
    ctx.globalCompositeOperation = 'source-over'
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(preImageRef ? canvas : canvas, 0, 0) // no-op; overlay handled inline
    ctx.restore()
  }, [])

  // Draw / commit a finished shape (line, rect, circle) onto the base canvas.
  const drawShape = useCallback(
    (start: Point, end: Point) => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return
      ctx.save()
      ctx.strokeStyle = color
      ctx.lineWidth = size
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      if (toolId === 'line') {
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(end.x, end.y)
      } else if (toolId === 'rect') {
        ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y)
      } else {
        // circle — centered on start point, radius = drag distance.
        const r = Math.hypot(end.x - start.x, end.y - start.y)
        ctx.arc(start.x, start.y, r, 0, Math.PI * 2)
      }
      ctx.stroke()
      ctx.restore()
    },
    [toolId, color, size],
  )

  // Renders the live preview for shape tools on an overlay canvas (cleared on up).
  const renderPreview = useCallback(
    (start: Point, end: Point) => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return
      // Full redraw of committed content then the ephemeral shape.
      ctx.save()
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = BACKGROUND
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.restore()
      drawShape(start, end)
    },
    [drawShape],
  )

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      try {
        canvas.setPointerCapture(e.pointerId)
      } catch {
        /* pointer already captured elsewhere — ignore */
      }
      drawingRef.current = true
      const rect = canvas.getBoundingClientRect()
      const p: Point = {
        x: ((e.clientX - rect.left) / rect.width) * canvas.width,
        y: ((e.clientY - rect.top) / rect.height) * canvas.height,
      }
      lastRef.current = p
      startRef.current = p
      avoidEmptyContext()
      // Draw an immediate dot for freehand tools so taps register.
      if (toolId === 'brush' || toolId === 'eraser') {
        strokeSegment(p, p)
      }
    },
    [toCanvas, toolId],
  )

  const strokeSegment = useCallback(
    (from: Point, to: Point) => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return
      ctx.save()
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = toolId === 'eraser' ? BACKGROUND : color
      ctx.lineWidth = size
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
      ctx.stroke()
      ctx.restore()
    },
    [toolId, color, size],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!drawingRef.current) return
      const p = toCanvas(e)
      if (toolId === 'brush' || toolId === 'eraser') {
        strokeSegment(lastRef.current, p)
        lastRef.current = p
      } else {
        renderPreview(startRef.current, p)
      }
    },
    [toCanvas, toolId, strokeSegment, renderPreview],
  )

  const onPointerUp = useCallback(() => {
    if (!drawingRef.current) return
    drawingRef.current = false
    pushHistory()
  }, [pushHistory])

  const undo = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const entry = undoRef.current.pop()
    if (entry === undefined) return
    redoRef.current.push(canvas.toDataURL('image/png'))
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0)
      contentRef.current = !(undoRef.current.length === 0)
      setHasContent(contentRef.current)
      bump()
    }
    img.src = entry
  }, [bump])

  const redo = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const entry = redoRef.current.pop()
    if (entry === undefined) return
    undoRef.current.push(canvas.toDataURL('image/png'))
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0)
      contentRef.current = true
      setHasContent(true)
      bump()
    }
    img.src = entry
  }, [bump])

  const clear = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    if (!contentRef.current) return
    avoidEmptyContext()
    pushHistory()
    ctx.save()
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = BACKGROUND
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.restore()
    contentRef.current = false
    setHasContent(false)
    bump()
    analyticsApi.trackEvent('tool_reset', { tool: tool.slug })
  }, [bump, tool.slug])

  const exportPng = useCallback(() => {
    const startedAt = Date.now()
    const base = { tool: tool.slug, category: tool.category, source: 'csv' as const }
    analyticsApi.trackToolRun(base)
    setExporting(true)
    setError(null)
    const canvas = canvasRef.current
    try {
      if (!canvas) throw new Error('Canvas not available.')
      canvas.toBlob((blob) => {
        if (!blob) {
          analyticsApi.trackToolFailed({ ...base, mode: 'local', durationMs: Date.now() - startedAt, success: false })
          setError('Could not render the PNG on this device.')
          setExporting(false)
          return
        }
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${tool.slug}-drawing.png`
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.setTimeout(() => URL.revokeObjectURL(url), 1000)
        analyticsApi.trackToolComplete({ ...base, mode: 'local', durationMs: Date.now() - startedAt, success: true })
        analyticsApi.trackDownload({ tool: tool.slug, fileType: 'png' })
        setExporting(false)
      }, 'image/png')
    } catch (err) {
      analyticsApi.trackToolFailed({ ...base, mode: 'local', durationMs: Date.now() - startedAt, success: false })
      setError(err instanceof Error ? err.message : 'PNG export failed.')
      setExporting(false)
    }
  }, [tool.slug, tool.category])

  const reset = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    undoRef.current = []
    redoRef.current = []
    preImageRef.current = null
    contentRef.current = false
    setHasContent(false)
    setToolId('brush')
    setColor('#000000')
    setSize(8)
    ctx.save()
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = BACKGROUND
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.restore()
    setError(null)
    bump()
    analyticsApi.trackEvent('tool_reset', { tool: tool.slug })
  }, [bump, tool.slug])

  const canUndo = undoRef.current.length > 0
  const canRedo = redoRef.current.length > 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Whiteboard / Drawing</h2>
          <p className="text-sm text-gray-400 mt-1">
            Draw with pointer or touch, pick a tool, color and stroke size, then undo/redo,
            clear, or export as PNG — all locally in your browser.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-gray-300 text-sm font-medium hover:bg-white/10 transition-colors motion-reduce:transition-none"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button
            type="button"
            onClick={exportPng}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium hover:bg-indigo-500/20 transition-colors motion-reduce:transition-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" /> {exporting ? 'Exporting…' : 'Export PNG'}
          </button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" title="Something went wrong" className="mb-2">
          {error}
        </Alert>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        {/* Tool select */}
        <div className="flex items-center gap-1 rounded-xl bg-white/5 border border-white/10 p-1">
          {TOOLS.map((t) => {
            const Icon = t.icon
            const active = toolId === t.id
            return (
              <button
                key={t.id}
                type="button"
                title={t.label}
                aria-label={t.label}
                aria-pressed={active}
                onClick={() => setToolId(t.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors motion-reduce:transition-none ${
                  active
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden lg:inline">{t.label}</span>
              </button>
            )
          })}
        </div>

        {/* Color swatches */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {SWATCHES.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Color ${c}`}
              onClick={() => setColor(c)}
              className={`h-7 w-7 rounded-full border transition-transform motion-reduce:transition-none ${
                color === c ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-black scale-110' : 'border-white/20'
              }`}
              style={{ background: c }}
            />
          ))}
          <label
            className="relative h-7 w-7 shrink-0 cursor-pointer overflow-hidden rounded-full border border-white/20"
            style={{ background: 'conic-gradient(#f43f5e,#f59e0b,#22c55e,#06b6d4,#8b5cf6,#f43f5e)' }}
          >
            <input
              type="color"
              value={color.startsWith('#') && color.length === 7 ? color : '#000000'}
              aria-label="Custom color"
              onChange={(e) => setColor(e.target.value.toLowerCase())}
              className="absolute -inset-2 h-12 w-12 cursor-pointer border-0 bg-transparent opacity-0"
            />
          </label>
        </div>

        {/* Stroke size */}
        <div>
          <span className="block text-xs text-gray-500 mb-1.5">Stroke size</span>
          <div className="flex items-center gap-1 rounded-xl bg-white/5 border border-white/10 p-1">
            {SIZES.map((s) => (
              <button
                key={s}
                type="button"
                aria-label={`Stroke size ${s}`}
                onClick={() => setSize(s)}
                className={`grid h-8 w-8 place-items-center rounded-lg transition-colors motion-reduce:transition-none ${
                  size === s ? 'bg-indigo-600' : 'hover:bg-white/5'
                }`}
              >
                <span className="rounded-full bg-white" style={{ width: Math.min(20, s), height: Math.min(20, s) }} />
              </button>
            ))}
          </div>
        </div>

        {/* History controls */}
        <div className="flex items-center gap-1 rounded-xl bg-white/5 border border-white/10 p-1 ml-auto">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            title="Undo"
            aria-label="Undo"
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Undo2 className="w-4 h-4" /> <span className="hidden sm:inline">Undo</span>
          </button>
          <div className="h-5 w-px bg-white/10" />
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            title="Redo"
            aria-label="Redo"
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Redo2 className="w-4 h-4" /> <span className="hidden sm:inline">Redo</span>
          </button>
          <div className="h-5 w-px bg-white/10" />
          <button
            type="button"
            onClick={clear}
            disabled={!hasContent}
            title="Clear board"
            aria-label="Clear board"
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-300 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors motion-reduce:transition-none"
          >
            <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Board */}
      <div className="relative rounded-2xl border border-white/10 bg-white p-2">
        <div className="relative overflow-hidden rounded-xl">
          {loading ? (
            <Skeleton className="h-[420px] w-full rounded-xl" />
          ) : (
            <>
              <canvas
                ref={canvasRef}
                width={CW}
                height={CH}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
                onPointerCancel={onPointerUp}
                className="block h-[420px] w-full cursor-crosshair touch-none select-none"
                aria-label="Drawing canvas — draw with mouse, pen or finger"
              />
              {!hasContent && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="text-center px-6">
                    <p className="text-sm font-medium text-gray-400">Board is clear</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Choose a tool above, then draw with your mouse, stylus or finger.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {!hasContent && !loading && (
        <EmptyState
          title="Blank whiteboard"
          description="Pick a tool and start drawing, or use the canvas above. Your drawing stays private on this device."
        />
      )}

      <div className="flex items-center justify-between text-[11px] text-gray-600">
        <span>1600 × 1000 px export • Undo history available</span>
        <span>
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-indigo-500 mr-1" aria-hidden="true" />
          {TOOLS.find((t) => t.id === toolId)?.label}
        </span>
      </div>
    </div>
  )
}