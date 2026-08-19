/**
 * Design Engine — real browser canvas rendering + export.
 * Used by poster / thumbnail / logo / generative-art tools. Every draw function
 * produces a real canvas bitmap; exports return real PNG/JPG/WebP blobs.
 */

export interface RenderStyle {
  background: string
  accent: string
  title: string
  titleColor: string
  subtitle?: string
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.trim().split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w } else { line = test }
  }
  if (line) lines.push(line)
  return lines.slice(0, 6) // hard cap to avoid overflow
}

/** Create a canvas with a solid or vertical-gradient background. */
export function makeCanvas(w: number, h: number, bg: string, gradient?: string): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  const ctx = c.getContext('2d')
  if (!ctx) return c
  if (gradient) {
    const g = ctx.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, bg)
    g.addColorStop(1, gradient)
    ctx.fillStyle = g
  } else {
    ctx.fillStyle = bg
  }
  ctx.fillRect(0, 0, w, h)
  return c
}

/** Draw a title + optional subtitle onto the canvas with wrapping. */
export function drawTextLayer(ctx: CanvasRenderingContext2D, w: number, h: number, opts: {
  title: string
  titleColor?: string
  accent?: string
  fontSizeRatio?: number
  verticalPos?: number // 0..1
}): void {
  const title = opts.title.trim() || 'Your Title'
  const ratio = opts.fontSizeRatio ?? 0.12
  const size = Math.max(12, Math.round(w * ratio))
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const y = h * (opts.verticalPos ?? 0.5)
  const lines = wrapText(ctx, title, w * 0.85)
  const lineHeight = size * 1.15
  const startY = y - ((lines.length - 1) * lineHeight) / 2
  lines.forEach((ln, i) => {
    ctx.font = `800 ${size}px Inter, system-ui, sans-serif`
    ctx.fillStyle = opts.titleColor ?? '#fff'
    ctx.fillText(ln, w / 2, startY + i * lineHeight)
  })
  if (opts.accent) {
    ctx.fillStyle = opts.accent
    const barW = Math.max(30, w * 0.18)
    ctx.fillRect(w / 2 - barW / 2, startY + lines.length * lineHeight + 8, barW, Math.max(3, size * 0.12))
  }
}

/** Draw a monogram/character badge (used by logo + generative-art frames). */
export function drawMark(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, char: string, bg: string, fg: string): void {
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.fillStyle = bg
  ctx.fill()
  ctx.fillStyle = fg
  ctx.font = `700 ${Math.floor(radius * 1.1)}px Inter, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText((char || 'X').charAt(0).toUpperCase(), cx, cy)
}

/** Export the canvas to a real blob. */
export async function canvasToBlob(canvas: HTMLCanvasElement, format: 'png' | 'jpg' | 'webp', quality = 0.92): Promise<Blob> {
  const mime = `image/${format}`
  return new Promise((resolve, reject) => {
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Canvas export failed'))), mime, quality)
  })
}

/** Trigger a real browser download of a blob. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Deterministic PRNG (mulberry32) so generative art is reproducible from a seed. */
export function seededRand(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}