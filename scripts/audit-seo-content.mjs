/**
 * SEO Content Quality Audit (Phase 3.11) — title/meta/description quality.
 * Build-time, deterministic. Checks duplicate titles, missing/long meta
 * descriptions, and brand consistency. Exit 0/1.
 */
import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC = resolve(__dirname, '..', 'public')

function parseCsvLine(line) {
  const out = []; let cur = '', q = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') { if (q && line[i + 1] === '"') { cur += '"'; i++ } else q = !q }
    else if (ch === ',' && !q) { out.push(cur); cur = '' }
    else cur += ch
  }
  out.push(cur); return out
}

const lines = readFileSync(resolve(PUBLIC, 'tools.csv'), 'utf-8').trim().split('\n').slice(1)
const rows = []
for (const l of lines) {
  const p = parseCsvLine(l)
  if (p.length < 7) continue
  rows.push({ name: p[1]?.trim(), category: p[0]?.trim(), meta: p[5]?.trim(), rawSlug: p[6]?.trim() })
}

const titles = new Map()
const descs = []
const badBrand = []
let dupTitles = 0, missingDesc = 0, longDesc = 0
const DISPLAY = new Set(['Design/Creative'])
for (const r of rows) {
  const display = r.name // titles use the canonical display name in-app; approximated here by name
  const title = `${display} Guide: How to Use, Features & FAQ`
  if (titles.has(title)) dupTitles++
  titles.set(title, (titles.get(title) || 0) + 1)
  if (!r.meta || r.meta.length < 20) missingDesc++
  if (r.meta && r.meta.length > 165) longDesc++
  if (!/MegatoolsX/.test(r.meta || '') && r.category === 'Design/Creative') badBrand.push(r.name)
}

console.log('SEO CONTENT QUALITY AUDIT (Phase 3.11)')
console.log(`Total tools: ${rows.length}`)
console.log(`Duplicate titles: ${dupTitles}`)
console.log(`Missing/short descriptions: ${missingDesc}`)
console.log(`Over-long descriptions: ${longDesc}`)
console.log(`Design/Creative entries lacking brand in meta: ${badBrand.length}`)

const fail = dupTitles > 0 || missingDesc > 0
console.log(fail ? 'RESULT: FAIL' : 'RESULT: PASS ✅')
process.exit(fail ? 1 : 0)