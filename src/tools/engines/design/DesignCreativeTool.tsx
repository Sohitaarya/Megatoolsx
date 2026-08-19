import { useCallback, useEffect, useRef, useState } from 'react'
import type { CsvTool } from '@/data/csvData'
import { capabilityForDesign } from '@/data/designCreativeCapabilities'
import { Alert, Progress } from '@/components/ui'
import { RefreshCw, Download, Sparkles } from 'lucide-react'
import {
  makeCanvas, drawTextLayer, drawMark, canvasToBlob, downloadBlob, seededRand,
} from './canvasEngine'
import { analyticsApi } from '@/analytics'

/**
 * Design/Creative — per-family tool workbench. Each family renders a DISTINCT
 * workflow (poster/thumbnail vs logo vs generative art) with real canvas output
 * and real PNG/JPG export. Honest status for tools that don't run in-browser.
 */
export function DesignCreativeTool({ tool }: { tool: CsvTool }) {
  const cap = capabilityForDesign(tool.slug, tool.name)

  const [title, setTitle] = useState(tool.name)
  const [subtitle, setSubtitle] = useState('MegatoolsX')
  const [background, setBackground] = useState('#1e1b4b')
  const [accent, setAccent] = useState('#6366f1')
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9) >>> 0)
  const [complexity, setComplexity] = useState(6)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const workspaceRef = useRef<HTMLDivElement>(null)
  const [exported, setExported] = useState(false)

  // Honest non-working states first.
  if (cap.status === 'needs-data-fix') {
    return (
      <Alert variant="warning" title="Not implemented">
        {tool.name} is an auto-generated CSV name with no real design function. It is NOT marked as working.
        Replace the CSV tool name with a real design capability to implement it.
      </Alert>
    )
  }
  if (cap.status === 'requires-configuration') {
    return (
      <Alert variant="info" title="Requires configuration">
        Real 3D model generation needs an external 3D AI service + API key. Not marked as working until configured.
      </Alert>
    )
  }

  const dims = cap.dimensions ?? { width: 1024, height: 1024 }

  const render = useCallback(() => {
    setBusy(true); setError(null); setExported(false)
    try {
      const canvas = makeCanvas(dims.width, dims.height, background, cap.family === 'generative-art' ? undefined : accent)
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas not available')

      switch (cap.family) {
        case 'thumbnail':
          drawTextLayer(ctx, dims.width, dims.height, { title, titleColor: '#fff', accent, fontSizeRatio: 0.11, verticalPos: 0.5 })
          break
        case 'canvas-designer':
          drawTextLayer(ctx, dims.width, dims.height, { title, titleColor: '#fff', accent, fontSizeRatio: 0.09, verticalPos: 0.45 })
          ctx.fillStyle = accent
          ctx.font = `500 ${Math.round(dims.width * 0.028)}px Inter, sans-serif`
          ctx.textAlign = 'center'
          ctx.fillText(subtitle, dims.width / 2, dims.height * 0.62)
          break
        case 'logo':
          drawMark(ctx, dims.width / 2, dims.height * 0.42, dims.width * 0.3, tool.name, accent, '#fff')
          drawTextLayer(ctx, dims.width, dims.height, { title, titleColor: '#fff', verticalPos: 0.85, fontSizeRatio: 0.08 })
          break
        case 'generative-art': {
          const rand = seededRand(seed)
          const palette = [background, accent, '#ffffff', `${accent}88`]
          for (let i = 0; i < complexity * 80; i++) {
            ctx.fillStyle = palette[Math.floor(rand() * palette.length)]
            ctx.globalAlpha = 0.4 + rand() * 0.5
            const x = rand() * dims.width, y = rand() * dims.height, s = rand() * dims.width * 0.08 + 4
            ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill()
          }
          ctx.globalAlpha = 1
          break
        }
      }

      // Replace the displayed canvas (imperative — React doesn't own the canvas node).
      workspaceRef.current?.replaceChildren(canvas)
      analyticsApi.trackEvent('design_tool_run', { tool: tool.slug })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Render failed')
      analyticsApi.trackEvent('design_tool_failed', { tool: tool.slug })
    } finally {
      setBusy(false)
    }
  }, [cap.family, dims.width, dims.height, background, accent, title, subtitle, seed, complexity, tool.slug])

  // Render once on mount so the workspace is never blank.
  useEffect(() => { render() }, [render])

  const exportImage = async (format: 'png' | 'jpg') => {
    const canvas = workspaceRef.current?.firstChild as HTMLCanvasElement | undefined
    if (!canvas) return
    try {
      const blob = await canvasToBlob(canvas, format)
      downloadBlob(blob, `${tool.slug}.${format}`)
      setExported(true)
      analyticsApi.trackEvent('design_tool_export', { tool: tool.slug, format })
    } catch { setError('Export failed') }
  }

  const reset = () => {
    setTitle(tool.name); setSubtitle('MegatoolsX'); setBackground('#1e1b4b'); setAccent('#6366f1')
    setSeed(Math.floor(Math.random() * 1e9) >>> 0); setError(null)
    analyticsApi.trackEvent('design_tool_reset', { tool: tool.slug })
  }

  return (
    <div className="space-y-5">
      {error && <Alert variant="danger">{error}</Alert>}

      <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-6">
        {/* Workspace */}
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div ref={workspaceRef} className="min-h-[280px] w-full max-h-[560px] overflow-auto flex items-center justify-center bg-[radial-gradient(circle_at_center,#ffffff0a,transparent)]" />
          {busy && <div className="mt-3"><Progress value={60} label="Rendering" /></div>}
        </div>

        {/* Properties — tool-specific controls */}
        <div className="space-y-4">
          {(cap.family === 'canvas-designer' || cap.family === 'thumbnail' || cap.family === 'logo') && (
            <>
              <Field label="Title / Brand name" value={title} onChange={setTitle} />
              {cap.family === 'canvas-designer' && <Field label="Subtitle" value={subtitle} onChange={setSubtitle} />}
              <Field label="Background" value={background} onChange={setBackground} type="color" />
              <Field label="Accent" value={accent} onChange={setAccent} type="color" />
            </>
          )}
          {cap.family === 'generative-art' && (
            <>
              <Field label="Seed" value={String(seed)} onChange={v => setSeed(Number(v) >>> 0)} />
              <Field label="Complexity" value={String(complexity)} onChange={v => setComplexity(Math.max(1, Math.min(20, Number(v) || 6)))} type="range" />
            </>
          )}

          <div className="flex flex-wrap gap-2">
            <Btn onClick={render} icon={<Sparkles className="w-4 h-4" />} label={busy ? 'Rendering…' : 'Generate'} primary />
            <Btn onClick={reset} icon={<RefreshCw className="w-4 h-4" />} label="Reset" />
          </div>
          <div className="flex flex-wrap gap-2">
            {cap.export.includes('png') && <Btn onClick={() => exportImage('png')} icon={<Download className="w-4 h-4" />} label="Export PNG" outline />}
            {cap.export.includes('jpg') && <Btn onClick={() => exportImage('jpg')} icon={<Download className="w-4 h-4" />} label="Export JPG" outline />}
            {exported && <span className="text-xs text-emerald-400 self-center">Saved ✓</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm text-gray-400">{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      />
    </label>
  )
}

function Btn({ onClick, icon, label, primary, outline }: { onClick: () => void; icon: React.ReactNode; label: string; primary?: boolean; outline?: boolean }) {
  const cls = primary
    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
    : outline
      ? 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
      : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${cls}`}>
      {icon}{label}
    </button>
  )
}