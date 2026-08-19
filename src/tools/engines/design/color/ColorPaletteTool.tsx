import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import type { CsvTool } from '@/data/csvData'
import { analyticsApi } from '@/analytics'
import { Alert, EmptyState, Skeleton, Card, Badge } from '@/components/ui'
import { Copy, Check, Download, RefreshCw, Dices, Palette } from 'lucide-react'

/* -------------------------------------------------------------------------- */
/*  Color math — real HSL/RGB/HEX conversions (hue deg 0..360, s/l frac 0..1) */
/* -------------------------------------------------------------------------- */

interface Rgb {
  r: number
  g: number
  b: number
}

interface Hsl {
  h: number
  s: number
  l: number
}

interface Parsed extends Rgb {
  hex: string
}

const clampFrac = (x: number): number => Math.max(0, Math.min(1, x))
const normalizeHue = (h: number): number => ((h % 360) + 360) % 360

function toHex(r: number, g: number, b: number): string {
  const pad = (v: number): string => Math.round(v).toString(16).padStart(2, '0').toUpperCase()
  return `#${pad(r)}${pad(g)}${pad(b)}`
}

/** Parse #rgb / #rrggbb. Returns null when invalid. */
function parseHex(input: string): Parsed | null {
  let h = input.trim().replace(/^#/, '')
  if (h.length === 3 && /^[0-9a-fA-F]{3}$/.test(h)) h = h.split('').map((c) => c + c).join('')
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null
  const n = parseInt(h, 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return { r, g, b, hex: toHex(r, g, b) }
}

function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  const d = max - min
  if (d === 0) return { h: 0, s: 0, l }
  let h: number
  switch (max) {
    case rn:
      h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
      break
    case gn:
      h = (bn - rn) / d / 6 + 1 / 6
      break
    default:
      h = (rn - gn) / d / 6 + 2 / 6
  }
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  return { h: normalizeHue(h * 360), s: clampFrac(s), l: clampFrac(l) }
}

function hslToRgb({ h, s, l }: Hsl): Rgb {
  const sn = clampFrac(s)
  const ln = clampFrac(l)
  const hue = normalizeHue(h) / 360
  const hue2rgb = (p: number, q: number, t: number): number => {
    let tt = t
    if (tt < 0) tt += 1
    if (tt > 1) tt -= 1
    if (tt < 1 / 6) return p + (q - p) * 6 * tt
    if (tt < 1 / 2) return q
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6
    return p
  }
  if (sn === 0) {
    const v = Math.round(ln * 255)
    return { r: v, g: v, b: v }
  }
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn
  const p = 2 * ln - q
  return {
    r: Math.round(hue2rgb(p, q, hue + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hue) * 255),
    b: Math.round(hue2rgb(p, q, hue - 1 / 3) * 255),
  }
}

/** Readable foreground (dark/light) for text on top of a solid color. */
function textOn(hex: string): string {
  const p = parseHex(hex)
  if (!p) return '#ffffff'
  const lum = 0.299 * p.r + 0.587 * p.g + 0.114 * p.b
  return lum > 150 ? '#0b0f1a' : '#ffffff'
}

/* -------------------------------------------------------------------------- */
/*  Palette schemes — real additive HSL offsets from the base color.          */
/* -------------------------------------------------------------------------- */

type SchemeId = 'analogous' | 'complementary' | 'triadic' | 'shades' | 'split' | 'tetradic'

interface Scheme {
  label: string
  hint: string
  steps: { h: number; l: number; s: number }[]
}

const SCHEMES: Record<SchemeId, Scheme> = {
  analogous: {
    label: 'Analogous',
    hint: 'Neighbors on the wheel (±40°)',
    steps: [
      { h: -40, l: 0, s: 0 }, { h: -20, l: 0, s: 0 }, { h: 0, l: 0, s: 0 },
      { h: 20, l: 0, s: 0 }, { h: 40, l: 0, s: 0 },
    ],
  },
  complementary: {
    label: 'Complementary',
    hint: 'Base + 180° opposite',
    steps: [
      { h: -12, l: 0, s: 0 }, { h: 0, l: 0, s: 0 }, { h: 168, l: 0, s: 0 },
      { h: 180, l: 0, s: 0 }, { h: 192, l: 0, s: 0 },
    ],
  },
  triadic: {
    label: 'Triadic',
    hint: 'Three hues 120° apart',
    steps: [
      { h: 0, l: 0, s: 0 }, { h: 120, l: 0, s: 0 }, { h: 240, l: 0, s: 0 },
      { h: 0, l: 0.12, s: 0 }, { h: 120, l: 0.12, s: 0 },
    ],
  },
  shades: {
    label: 'Shades',
    hint: 'Single hue, lightness ramp',
    steps: [
      { h: 0, l: -0.26, s: 0 }, { h: 0, l: -0.13, s: 0 }, { h: 0, l: 0, s: 0 },
      { h: 0, l: 0.13, s: 0 }, { h: 0, l: 0.26, s: 0 },
    ],
  },
  split: {
    label: 'Split-complementary',
    hint: 'Base + the two split opposites',
    steps: [
      { h: -12, l: 0, s: 0 }, { h: 0, l: 0, s: 0 }, { h: 12, l: 0, s: 0 },
      { h: 150, l: 0, s: 0 }, { h: 210, l: 0, s: 0 },
    ],
  },
  tetradic: {
    label: 'Tetradic',
    hint: 'Two pairs 90° apart',
    steps: [
      { h: 0, l: 0, s: 0 }, { h: 90, l: 0, s: 0 }, { h: 180, l: 0, s: 0 },
      { h: 270, l: 0, s: 0 }, { h: 90, l: 0.12, s: 0 },
    ],
  },
}

interface Swatch {
  hex: string
  rgb: string
  hsl: string
  text: string
}

function buildPalette(base: Hsl, steps: Scheme['steps']): Swatch[] {
  return steps.map((o) => {
    const hsl = { h: normalizeHue(base.h + o.h), s: clampFrac(base.s + o.s), l: clampFrac(base.l + o.l) }
    const rgb = hslToRgb(hsl)
    const hex = toHex(rgb.r, rgb.g, rgb.b)
    return {
      hex,
      rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      hsl: `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%)`,
      text: textOn(hex),
    }
  })
}

const DEFAULT_HEX = '#2563EB'
const DEFAULT_SCHEME: SchemeId = 'analogous'

function randomHex(): string {
  const r = Math.floor(Math.random() * 256)
  const g = Math.floor(Math.random() * 256)
  const b = Math.floor(Math.random() * 256)
  return toHex(r, g, b)
}

function fileNameSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'palette'
}

/* -------------------------------------------------------------------------- */
/*  Small presentational helpers                                              */
/* -------------------------------------------------------------------------- */

function Btn({ onClick, icon, label, primary }: { onClick: () => void; icon: ReactNode; label: string; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors motion-reduce:transition-none ${
        primary ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function ValueRow({ label, value, copied, onCopy }: { label: string; value: string; copied: boolean; onCopy: () => void }) {
  const icon = copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-500 group-hover:text-white" />
  return (
    <button
      onClick={onCopy}
      title={`Copy ${label}`}
      className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-left hover:bg-white/5 group transition-colors motion-reduce:transition-none"
    >
      <span className="text-[10px] uppercase tracking-wide text-gray-500 font-medium">{label}</span>
      <span className="flex items-center gap-1.5 font-mono text-xs text-gray-300">{value}{icon}</span>
    </button>
  )
}

function SwatchCard({ swatch, index, copied, onCopy }: {
  swatch: Swatch
  index: number
  copied: string | null
  onCopy: (text: string, target: string) => void
}) {
  const isBase = index === 2
  const tag = isBase ? 'Base' : `C${index + 1}`
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden flex flex-col">
      <button
        onClick={() => onCopy(swatch.hex, `${index}-hex`)}
        className="relative h-24 w-full flex items-start p-2.5 transition-transform motion-reduce:transition-none hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        style={{ backgroundColor: swatch.hex }}
        title="Copy HEX"
      >
        <span
          className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide"
          style={{ color: swatch.text, backgroundColor: 'rgba(255,255,255,0.16)' }}
        >
          {tag}
        </span>
      </button>
      <div className="p-2 space-y-0.5">
        <ValueRow label={isBase ? 'Base HEX' : 'HEX'} value={swatch.hex} copied={copied === `${index}-hex`} onCopy={() => onCopy(swatch.hex, `${index}-hex`)} />
        <ValueRow label="RGB" value={swatch.rgb} copied={copied === `${index}-rgb`} onCopy={() => onCopy(swatch.rgb, `${index}-rgb`)} />
        <ValueRow label="HSL" value={swatch.hsl} copied={copied === `${index}-hsl`} onCopy={() => onCopy(swatch.hsl, `${index}-hsl`)} />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function ColorPaletteTool({ tool }: { tool: CsvTool }) {
  const slug = tool.slug || tool.name
  const baseName = fileNameSlug(tool.name)
  const [hexValue, setHexValue] = useState(DEFAULT_HEX)
  const [scheme, setScheme] = useState<SchemeId>(DEFAULT_SCHEME)
  const [palette, setPalette] = useState<Swatch[]>([])
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const previewRef = useRef<HTMLCanvasElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const baseParsed = parseHex(hexValue)

  /* Open event on mount. */
  useEffect(() => {
    analyticsApi.trackToolOpen({ tool: slug, category: 'Design/Creative', source: 'csv', mode: 'local' })
  }, [slug])

  /* Real, synchronous palette math re-runs whenever the controls change. */
  useEffect(() => {
    setBusy(true)
    setError(null)
    const parsed = parseHex(hexValue)
    if (!parsed) {
      setPalette([])
      setBusy(false)
      setError('Enter a valid 6-digit hex color (e.g. #2563EB) to build a palette.')
      analyticsApi.trackToolFailed({ tool: slug, source: 'csv', mode: 'local', success: false })
      return
    }
    const base = rgbToHsl(parsed)
    const result = buildPalette(base, SCHEMES[scheme].steps)
    analyticsApi.trackToolRun({ tool: slug, category: 'Design/Creative', source: 'csv', mode: 'local' })
    const frame = window.requestAnimationFrame(() => {
      setPalette(result)
      setBusy(false)
      analyticsApi.trackToolComplete({ tool: slug, category: 'Design/Creative', source: 'csv', mode: 'local', success: true })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [hexValue, scheme, slug])

  /* Live palette preview rendered to a real Canvas 2D node. */
  useEffect(() => {
    const canvas = previewRef.current
    if (!canvas || palette.length === 0) return
    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      const w = Math.max(1, rect.width)
      const h = Math.max(1, rect.height)
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.scale(dpr, dpr)
      const band = w / palette.length
      palette.forEach((sw, i) => {
        ctx.fillStyle = sw.hex
        ctx.fillRect(i * band, 0, band, h)
      })
    }
    draw()
  }, [palette])

  const clearCopied = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setCopied(null), 1600)
  }, [])

  const copyText = useCallback(
    (text: string, target: string) => {
      if (!navigator.clipboard) {
        setError('Clipboard is unavailable in this browser.')
        analyticsApi.trackCopy({ tool: slug, target })
        return
      }
      navigator.clipboard.writeText(text).then(() => {
        setCopied(target)
        clearCopied()
        analyticsApi.trackCopy({ tool: slug, target })
      }).catch(() => setError('Clipboard write failed.'))
    },
    [clearCopied, slug],
  )

  const reset = useCallback(() => {
    setHexValue(DEFAULT_HEX)
    setScheme(DEFAULT_SCHEME)
    setCopied(null)
    setError(null)
    analyticsApi.trackEvent('color_tool_reset', { tool: slug })
  }, [slug])

  const download = useCallback((filename: string, mime: string, content: string, fileType: string) => {
    try {
      const blob = new Blob([content], { type: mime })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      analyticsApi.trackDownload({ tool: slug, fileType })
    } catch {
      setError('Export failed to build a downloadable file.')
    }
  }, [slug])

  const exportCss = useCallback(() => {
    if (palette.length === 0) return
    const baseHex = baseParsed?.hex ?? palette[0].hex
    const lines = palette.map((s, i) => `  --palette-${i + 1}: ${s.hex};`)
    const content =
      `/* ${tool.name} — ${SCHEMES[scheme].label} palette (base ${baseHex}) */\n` +
      `:root {\n${lines.join('\n')}\n}\n\n` +
      palette.map((s, i) => `.swatch-${i + 1} { background-color: ${s.hex}; color: ${s.text}; }`).join('\n') +
      '\n'
    download(`palette-${baseName}.css`, 'text/css', content, 'css')
  }, [palette, baseParsed, scheme, tool.name, download, baseName])

  const exportJson = useCallback(() => {
    if (palette.length === 0) return
    const payload = {
      name: tool.name,
      scheme: SCHEMES[scheme].label,
      base: baseParsed?.hex ?? palette[0].hex,
      colors: palette.map((s) => ({ hex: s.hex, rgb: s.rgb, hsl: s.hsl })),
    }
    download(`palette-${baseName}.json`, 'application/json', JSON.stringify(payload, null, 2), 'json')
  }, [tool.name, palette, scheme, baseParsed, download, baseName])

  const copyAll = useCallback(() => {
    copyText(palette.map((s) => s.hex).join(', '), 'all')
  }, [palette, copyText])

  const schemeIds = Object.keys(SCHEMES) as SchemeId[]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Palette className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-lg">{tool.name}</h3>
          <p className="text-gray-500 text-sm">Real HSL math — pick a base color, then copy or export the palette.</p>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Controls */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
        <div className="grid md:grid-cols-[200px_1fr] gap-5 items-start">
          <div className="flex flex-col items-center gap-2">
            <input
              type="color"
              value={baseParsed?.hex ?? DEFAULT_HEX}
              onChange={(e) => setHexValue(e.target.value.toUpperCase())}
              aria-label="Base color"
              className="w-16 h-16 rounded-xl border border-white/10 bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <label className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400">{baseParsed ? 'HEX value' : 'Enter HEX'}</span>
              <input
                value={hexValue}
                onChange={(e) => setHexValue(e.target.value)}
                spellCheck={false}
                placeholder="#2563EB"
                className="w-32 text-center px-2 py-1.5 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </label>
            <Btn onClick={() => setHexValue(randomHex())} icon={<Dices className="w-4 h-4" />} label="Surprise" />
          </div>

          <div className="space-y-3">
            <span className="text-sm text-gray-400">Color scheme</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {schemeIds.map((id) => (
                <button
                  key={id}
                  onClick={() => setScheme(id)}
                  className={`text-left px-3 py-2 rounded-xl border text-sm transition-colors motion-reduce:transition-none ${
                    id === scheme
                      ? 'border-indigo-500/50 bg-indigo-500/10 text-white'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {SCHEMES[id].label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500">{SCHEMES[scheme].hint}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Btn
                onClick={copyAll}
                icon={copied === 'all' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                label={copied === 'all' ? 'Copied' : 'Copy all HEX'}
                primary
              />
              <Btn onClick={reset} icon={<RefreshCw className="w-4 h-4" />} label="Reset" />
            </div>
          </div>
        </div>
      </div>

      {/* Live preview */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge>Live preview</Badge>
          <span className="text-xs text-gray-500">Canvas render — real pixel colors</span>
        </div>
        {busy ? (
          <Skeleton className="h-16 w-full" />
        ) : palette.length > 0 ? (
          <canvas ref={previewRef} className="w-full h-16 rounded-xl border border-white/10" />
        ) : (
          <EmptyState title="No palette" description="Enter a valid hex color to generate a palette." />
        )}
      </Card>

      {/* Swatches */}
      {palette.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {palette.map((sw, i) => (
            <SwatchCard key={`${sw.hex}-${i}`} swatch={sw} index={i} copied={copied} onCopy={copyText} />
          ))}
        </div>
      ) : (
        !busy && (
          <EmptyState
            icon={Palette}
            title="Nothing to show"
            description="Choose a valid base color to preview swatches."
          />
        )
      )}

      {/* Export */}
      {palette.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
          <span className="text-sm text-gray-400 mr-1">Export:</span>
          <button onClick={exportCss} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 text-sm">
            <Download className="w-4 h-4" /> CSS variables
          </button>
          <button onClick={exportJson} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 text-sm">
            <Download className="w-4 h-4" /> JSON
          </button>
          <span className="text-xs text-gray-600 ml-auto">Downloads a real file of the palette.</span>
        </div>
      )}
    </div>
  )
}