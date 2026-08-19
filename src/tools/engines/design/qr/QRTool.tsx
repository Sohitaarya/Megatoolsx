import { useCallback, useEffect, useRef, useState } from 'react'
import type { CsvTool } from '@/data/csvData'
import { Alert, EmptyState, Progress } from '@/components/ui'
import { Download, RefreshCw, QrCode } from 'lucide-react'
import { buildPayload, renderQr, qrPng, qrSvg, type QrType } from './qrEngine'
import { analyticsApi } from '@/analytics'

/**
 * QR Generator — real workflow (URL/Text/Email/Phone/WiFi → QR → PNG/SVG).
 * Uses the tested `qrcode` library — never a fake QR.
 */
export function QRTool({ tool }: { tool: CsvTool }) {
  const [type, setType] = useState<QrType>('url')
  const [value, setValue] = useState('')
  const [wifi, setWifi] = useState({ ssid: '', password: '', encryption: 'WPA' })
  const [size, setSize] = useState(256)
  const [margin, setMargin] = useState(2)
  const [foreground, setForeground] = useState('#000000')
  const [background, setBackground] = useState('#ffffff')
  const [ec, setEc] = useState<'L' | 'M' | 'Q' | 'H'>('M')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [exported, setExported] = useState<string | null>(null)

  const content = buildPayload(type, value, type === 'wifi' ? wifi : undefined)
  const contentIsValid = content.trim().length > 0

  const render = useCallback(async () => {
    if (!contentIsValid) return
    const canvas = canvasRef.current
    if (!canvas) return
    setBusy(true); setError(null)
    try {
      await renderQr(canvas, content, { width: size, margin, foreground, background, errorCorrection: ec })
      analyticsApi.trackEvent('tool_complete', { tool: tool.slug, qrType: type })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not render QR')
      analyticsApi.trackEvent('tool_failed', { tool: tool.slug })
    } finally { setBusy(false) }
  }, [content, contentIsValid, size, margin, foreground, background, ec, type, tool.slug])

  useEffect(() => { render() }, [render])

  const downloadPng = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const blob = await qrPng(canvas)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'qr-code.png'
    document.body.appendChild(a); a.click(); a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setExported('png')
    analyticsApi.trackEvent('download', { tool: tool.slug, format: 'png' })
  }

  const downloadSvg = async () => {
    const svg = await qrSvg(content, { width: size, margin, foreground, background, errorCorrection: ec })
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'qr-code.svg'
    document.body.appendChild(a); a.click(); a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setExported('svg')
    analyticsApi.trackEvent('download', { tool: tool.slug, format: 'svg' })
  }

  const reset = () => {
    setType('url'); setValue(''); setWifi({ ssid: '', password: '', encryption: 'WPA' })
    setSize(256); setMargin(2); setForeground('#000000'); setBackground('#ffffff'); setEc('M')
    setError(null); setExported(null)
    analyticsApi.trackEvent('reset', { tool: tool.slug })
  }

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-6">
      <div className="rounded-2xl border border-white/10 bg-black/30 p-6 flex flex-col items-center justify-center min-h-[320px]">
        <canvas ref={canvasRef} className="max-w-full h-auto" aria-label="QR code preview" />
        {busy && <div className="mt-3 w-40"><Progress value={50} label="Rendering QR" /></div>}
        {!contentIsValid && !busy && (
          <EmptyState icon={QrCode} title="Enter content to generate" description="Add a URL, text, email, phone or WiFi network to see your QR code." />
        )}
      </div>

      <div className="space-y-4">
        {error && <Alert variant="danger">{error}</Alert>}

        <div className="space-y-2">
          <label className="text-sm text-gray-400" htmlFor="qr-type">Type</label>
          <select id="qr-type" value={type} onChange={e => setType(e.target.value as QrType)} className={inputCls}>
            <option value="url">URL</option><option value="text">Text</option>
            <option value="email">Email</option><option value="phone">Phone</option><option value="wifi">WiFi</option>
          </select>
        </div>

        {type === 'wifi' ? (
          <div className="space-y-2">
            <Field label="SSID" value={wifi.ssid} onChange={v => setWifi(w => ({ ...w, ssid: v }))} />
            <Field label="Password" value={wifi.password} onChange={v => setWifi(w => ({ ...w, password: v }))} />
            <Field label="Encryption" value={wifi.encryption} onChange={v => setWifi(w => ({ ...w, encryption: v }))} />
          </div>
        ) : (
          <Field label={type === 'url' ? 'URL' : type === 'phone' ? 'Phone number' : 'Content'} value={value} onChange={setValue} />
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Size" value={String(size)} onChange={v => setSize(Math.max(128, Math.min(1024, Number(v) || 256)))} type="range" />
          <Field label="Margin" value={String(margin)} onChange={v => setMargin(Math.max(0, Math.min(8, Number(v) || 2)))} type="range" />
          <Field label="Foreground" value={foreground} onChange={setForeground} type="color" />
          <Field label="Background" value={background} onChange={setBackground} type="color" />
          <label className="text-sm text-gray-400">Error correction</label>
          <select value={ec} onChange={e => setEc(e.target.value as 'L' | 'M' | 'Q' | 'H')} className={inputCls}>
            <option value="L">L (7%)</option><option value="M">M (15%)</option><option value="Q">Q (25%)</option><option value="H">H (30%)</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => render()} disabled={!contentIsValid} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium disabled:opacity-50">
            <QrCode className="w-4 h-4" aria-hidden="true" /> Generate
          </button>
          <button onClick={reset} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm"><RefreshCw className="w-4 h-4" aria-hidden="true" /> Reset</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {contentIsValid && (
            <>
              <button onClick={downloadPng} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm disabled:opacity-50"><Download className="w-4 h-4" aria-hidden="true" /> PNG</button>
              <button onClick={downloadSvg} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm disabled:opacity-50"><Download className="w-4 h-4" aria-hidden="true" /> SVG</button>
            </>
          )}
          {exported && <span className="text-xs text-emerald-400 self-center">Saved as {exported} ✓</span>}
        </div>
      </div>
    </div>
  )
}

const inputCls = 'w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50'
function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm text-gray-400">{label}</span>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} className={inputCls} />
    </label>
  )
}