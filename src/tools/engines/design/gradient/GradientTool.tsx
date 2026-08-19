import { useCallback, useEffect, useRef, useState } from 'react'
import type { CsvTool } from '@/data/csvData'
import { Alert, Button, EmptyState, Progress } from '@/components/ui'
import { Plus, RotateCcw, Sparkles, Copy, Download, Check } from 'lucide-react'
import { analyticsApi } from '@/analytics'

/* ────────────────────────────────────────────────────────────
   Real Gradient Generator
   Color stops + angle slider + linear/radial toggle + live preview
   + copy CSS + export PNG rendered to a real Canvas 2D surface.
   Gradient-only workflow — no shared textarea.
   ──────────────────────────────────────────────────────────── */

interface ColorStop {
  id: number
  color: string
  pos: number // 0–100
}

type GradientType = 'linear' | 'radial'

const TYPES: { id: GradientType; label: string }[] = [
  { id: 'linear', label: 'Linear' },
  { id: 'radial', label: 'Radial' },
]

const PALETTE = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e', '#f97316',
  '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#e11d48', '#22c55e',
]

let nextId = 1
function freshId(): number { return nextId++ }
export function randomHex(): string {
  const rand = () => Math.floor(Math.random() * 156 + 100).toString(16).padStart(2, '0')
  return `#${rand()}${rand()}${rand()}`
}

function randomStops(): ColorStop[] {
  const a = { id: freshId(), color: PALETTE[Math.floor(Math.random() * PALETTE.length)], pos: 0 }
  const b = { id: freshId(), color: PALETTE[Math.floor(Math.random() * PALETTE.length)], pos: 100 }
  return [a, b]
}

/** Build the CSS background value rendered in the live preview. */
function buildCss(type: GradientType, angle: number, stops: ColorStop[]): string {
  const parts = [...stops]
    .sort((x, y) => x.pos - y.pos)
    .map((s) => `${s.color} ${Math.round(s.pos)}%`)
    .join(', ')
  return type === 'linear'
    ? `linear-gradient(${angle}deg, ${parts})`
    : `radial-gradient(circle at center, ${parts})`
}

/** Build a real CanvasGradient matching the CSS settings. */
function buildCanvasGradient(
  ctx: CanvasRenderingContext2D,
  type: GradientType,
  angle: number,
  stops: ColorStop[],
  w: number,
  h: number,
): CanvasGradient {
  const sorted = [...stops].sort((x, y) => x.pos - y.pos)
  let grad: CanvasGradient
  if (type === 'linear') {
    const rad = (angle * Math.PI) / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    const length = Math.abs(w * cos) + Math.abs(h * sin)
    grad = ctx.createLinearGradient(
      w / 2 - (cos * length) / 2,
      h / 2 - (sin * length) / 2,
      w / 2 + (cos * length) / 2,
      h / 2 + (sin * length) / 2,
    )
  } else {
    const r = Math.max(w, h) / 2
    grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, r)
  }
  for (const s of sorted) {
    grad.addColorStop(Math.max(0, Math.min(1, s.pos / 100)), s.color)
  }
  return grad
}

export function GradientTool({ tool }: { tool: CsvTool }) {
  const [type, setType] = useState<GradientType>('linear')
  const [angle, setAngle] = useState(45)
  const [stops, setStops] = useState<ColorStop[]>(() => randomStops())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const gradientCss = buildCss(type, angle, stops)

  // Emit tool_open once per mount.
  useEffect(() => {
    analyticsApi.trackToolOpen({ tool: tool.slug, category: tool.category, source: 'csv' })
  }, [tool.slug, tool.category])

  const updateStop = useCallback((id: number, patch: Partial<ColorStop>) => {
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }, [])

  const addStop = useCallback(() => {
    setStops((prev) => {
      if (prev.length >= 8) return prev
      const sorted = [...prev].sort((a, b) => a.pos - b.pos)
      // Insert into the widest gap.
      let bestIdx = 0
      let widest = -1
      for (let i = 0; i < sorted.length - 1; i++) {
        const gap = sorted[i + 1].pos - sorted[i].pos
        if (gap > widest) {
          widest = gap
          bestIdx = i
        }
      }
      const mid = sorted.length === 1 ? 50 : Math.round((sorted[bestIdx].pos + sorted[bestIdx + 1].pos) / 2)
      const color = PALETTE[Math.floor(Math.random() * PALETTE.length)]
      return [...prev, { id: freshId(), color, pos: mid }]
    })
  }, [])

  const removeStop = useCallback((id: number) => {
    setStops((prev) => (prev.length > 2 ? prev.filter((s) => s.id !== id) : prev))
  }, [])

  const randomize = useCallback(() => {
    const startedAt = Date.now()
    const base = { tool: tool.slug, category: tool.category, source: 'csv' as const }
    analyticsApi.trackToolRun(base)
    setStops(randomStops())
    setType(Math.random() > 0.5 ? 'radial' : 'linear')
    setAngle(Math.floor(Math.random() * 360))
    setError(null)
    analyticsApi.trackToolComplete({ ...base, mode: 'local', durationMs: Date.now() - startedAt, success: true })
  }, [tool.slug, tool.category])

  const reset = useCallback(() => {
    setType('linear')
    setAngle(45)
    setStops(randomStops())
    setBusy(false)
    setError(null)
    setCopied(false)
    analyticsApi.trackEvent('tool_reset', { tool: tool.slug })
  }, [tool.slug])

  const copyCss = useCallback(async () => {
    const startedAt = Date.now()
    const base = { tool: tool.slug, category: tool.category, source: 'csv' as const }
    analyticsApi.trackToolRun(base)
    setBusy(true)
    setError(null)
    try {
      await navigator.clipboard.writeText(gradientCss)
      analyticsApi.trackToolComplete({ ...base, mode: 'local', durationMs: Date.now() - startedAt, success: true })
      analyticsApi.trackCopy({ tool: tool.slug, target: 'gradient css' })
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      analyticsApi.trackToolFailed({ ...base, mode: 'local', durationMs: Date.now() - startedAt, success: false })
      setError('Clipboard access was blocked. Copy the CSS manually from the panel below.')
    } finally {
      setBusy(false)
    }
  }, [tool.slug, tool.category, gradientCss])

  const exportPng = useCallback(() => {
    const startedAt = Date.now()
    const base = { tool: tool.slug, category: tool.category, source: 'csv' as const }
    analyticsApi.trackToolRun(base)
    setBusy(true)
    setError(null)
    try {
      const canvas = canvasRef.current
      if (!canvas) throw new Error('Canvas not available')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas 2D not supported')

      // Solid base fill so PNG has no transparency.
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      const grad = buildCanvasGradient(ctx, type, angle, stops, canvas.width, canvas.height)
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      canvas.toBlob((blob) => {
        if (!blob) {
          analyticsApi.trackToolFailed({ ...base, mode: 'local', durationMs: Date.now() - startedAt, success: false })
          setError('Could not render the PNG on this device.')
          setBusy(false)
          return
        }
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${tool.slug}-gradient.png`
        document.body.appendChild(a)
        a.click()
        a.remove()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
        analyticsApi.trackToolComplete({ ...base, mode: 'local', durationMs: Date.now() - startedAt, success: true })
        analyticsApi.trackDownload({ tool: tool.slug, fileType: 'png' })
        setBusy(false)
      }, 'image/png')
    } catch (e) {
      analyticsApi.trackToolFailed({ ...base, mode: 'local', durationMs: Date.now() - startedAt, success: false })
      setError(e instanceof Error ? e.message : 'PNG export failed.')
      setBusy(false)
    }
  }, [tool.slug, tool.category, angle, type, stops])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Gradient Generator</h2>
          <p className="text-sm text-gray-400 mt-1">
            Stop-by-stop gradient builder with live preview, CSS output and PNG export.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={randomize}>
            <Sparkles className="w-4 h-4" /> Randomize
          </Button>
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="w-4 h-4" /> Reset
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" title="Something went wrong" className="mb-2">
          {error}
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* ── Preview + export ── */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 space-y-3">
            <div
              className="h-64 w-full rounded-xl border border-white/10 transition-[background] duration-200 motion-reduce:transition-none"
              style={{ background: gradientCss }}
              role="img"
              aria-label={`Live ${type} gradient preview at ${angle} degrees`}
            />
            {busy && (
              <Progress value={100} label="Rendering gradient" className="mb-1" />
            )}

            {/* Hidden canvas used only to export the exact same pixels as the preview. */}
            <canvas ref={canvasRef} width={800} height={500} className="hidden" aria-hidden="true" />

            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={copyCss} disabled={busy}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy CSS'}
              </Button>
              <Button size="sm" onClick={exportPng} disabled={busy}>
                <Download className="w-4 h-4" /> Export PNG (800×500)
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-black/40 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Generated CSS</span>
              <span className="text-[11px] text-gray-600">{`${stops.length} stop${stops.length === 1 ? '' : 's'}`}</span>
            </div>
            <code className="block text-sm text-indigo-300 break-all whitespace-pre-wrap">
              background: {gradientCss};
            </code>
          </div>
        </div>

        {/* ── Gradient controls ── */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 space-y-6 h-fit lg:sticky lg:top-6">
          {/* Type toggle */}
          <div>
            <span className="text-xs font-medium text-gray-400">Type</span>
            <div className="mt-2 grid grid-cols-2 gap-1 rounded-xl bg-white/5 p-1">
              {TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 motion-reduce:transition-none ${
                    type === t.id
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Angle slider (linear only) */}
          {type === 'linear' && (
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">Angle</span>
                <span className="text-xs text-indigo-400 font-mono">{angle}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                aria-label="Gradient angle"
                className="mt-2 w-full accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                <span>0°</span>
                <span>180°</span>
                <span>360°</span>
              </div>
            </div>
          )}

          {/* Color stops */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-400">Color stops</span>
              <button
                type="button"
                onClick={addStop}
                disabled={stops.length >= 8}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                + Add stop
              </button>
            </div>

            {stops.length === 0 ? (
              <EmptyState title="No color stops" description="Add a stop to start building your gradient." />
            ) : (
              <ul className="space-y-2.5">
                {stops.map((s, i) => (
                  <li key={s.id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-black/30 p-2.5">
                    <label className="relative h-9 w-9 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-white/10">
                      <input
                        type="color"
                        value={s.color}
                        title={`Stop ${i + 1} color`}
                        aria-label={`Stop ${i + 1} color`}
                        onChange={(e) => updateStop(s.id, { color: e.target.value })}
                        className="absolute -inset-2 h-16 w-16 cursor-pointer border-0 bg-transparent"
                      />
                      <span className="pointer-events-none absolute inset-0 rounded-lg" style={{ background: s.color }} />
                    </label>
                    <div className="flex-1 min-w-0">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={s.pos}
                        aria-label={`Stop ${i + 1} position`}
                        onChange={(e) => updateStop(s.id, { pos: Number(e.target.value) })}
                        className="w-full accent-indigo-500"
                      />
                      <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                        <span className="truncate font-mono">{s.color}</span>
                        <span className="font-mono">{s.pos}%</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeStop(s.id)}
                      disabled={stops.length <= 2}
                      title="Remove stop"
                      aria-label={`Remove stop ${i + 1}`}
                      className="shrink-0 rounded-lg px-2 py-1 text-gray-500 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {type === 'radial' && (
              <p className="text-[11px] text-gray-500 mt-2">
                Radial gradients ignore the angle slider and use the shape of the preview area.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}