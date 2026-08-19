/**
 * Generates public/og-image.png — a branded 1200x630 raster used as the social
 * preview image (Meta/LinkedIn/X require raster, not SVG).
 *
 * Run:  node scripts/generate-og-image.mjs
 *       (also wired into the build prebuild step)
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '..', 'public', 'og-image.png')

// Self-contained SVG scene rendered by sharp (cairo/libvips supports SVG raster).
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#111827"/>
      <stop offset="55%" stop-color="#312e81"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </linearGradient>
    <linearGradient id="mark" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#a855f7"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1050" cy="90" r="240" fill="#6366f1" opacity="0.12"/>
  <circle cx="150" cy="560" r="260" fill="#a855f7" opacity="0.12"/>
  <!-- logo mark -->
  <rect x="92" y="250" width="120" height="120" rx="28" fill="url(#mark)"/>
  <text x="152" y="345" font-family="Inter, system-ui, sans-serif" font-size="72" font-weight="800" fill="#fff" text-anchor="middle">X</text>
  <!-- wordmark -->
  <text x="240" y="320" font-family="Inter, system-ui, sans-serif" font-size="76" font-weight="800" fill="#ffffff">
    Megatools<tspan fill="#a5b4fc">X</tspan>
  </text>
  <text x="242" y="360" font-family="Inter, system-ui, sans-serif" font-size="28" font-weight="500" fill="#c7d2fe">
    The World's Largest Digital Tools Platform
  </text>
  <!-- tagline -->
  <text x="120" y="470" font-family="Inter, system-ui, sans-serif" font-size="26" font-weight="400" fill="#e0e7ff">
    2,500+ tools · AI · guides · tutorials
  </text>
</svg>
`

try {
  await sharp(Buffer.from(svg)).png().toFile(OUT)
  const kb = (existsSync(OUT) && readFileSync(OUT).length / 1024).toFixed(1)
  console.log(`✅ public/og-image.png written (${kb} KB)`)
} catch (err) {
  console.error(`⚠️  og-image generation failed: ${err.message}`)
  process.exitCode = 1
}

/** Re-usable helper: raster an SVG text/image into a PNG file (used by themes). */
export async function svgToPng(svgString, outPath, width, height) {
  await sharp(Buffer.from(svgString)).resize(width, height).png().toFile(outPath)
}