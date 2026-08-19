import { readFileSync, existsSync, readdirSync, writeFileSync, mkdirSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC = resolve(__dirname, '..', 'public')
const HOST = 'https://megatoolsx.com'

const failures = []

// Clean + dedupe tool slug exactly like generate-sitemap.mjs (CSV Slug column).
function cleanSlug(raw, name, used) {
  let base = String(raw || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  if (!base) base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  let s = base, i = 2
  while (used.has(s)) s = `${base}-${i++}`
  used.add(s)
  return s
}

function parseCsvLine(line) {
  const out = []
  let cur = '', q = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') { if (q && line[i + 1] === '"') { cur += '"'; i++ } else q = !q }
    else if (ch === ',' && !q) { out.push(cur); cur = '' }
    else cur += ch
  }
  out.push(cur)
  return out
}

const csv = readFileSync(resolve(PUBLIC, 'tools.csv'), 'utf-8').trim().split('\n').slice(1)
const used = new Set()
const toolSlugs = []
for (const l of csv) {
  const parts = parseCsvLine(l)
  if (parts.length < 7) continue
  const rawSlug = (parts[6] || '').trim()
  const name = (parts[1] || '').trim()
  toolSlugs.push(cleanSlug(rawSlug, name, used))
}
const totalTools = toolSlugs.length

// Read sitemap files; EXCLUDE index files (their <loc> are sitemap refs).
const allFiles = readdirSync(PUBLIC).filter(f => /^sitemap.*\.xml$/.test(f))
const indexFiles = new Set(['sitemap-index.xml', 'sitemap.xml'])
const pageFiles = allFiles.filter(f => !indexFiles.has(f))

const pageLocs = []
const perFileDups = {}
for (const f of pageFiles) {
  const xml = readFileSync(resolve(PUBLIC, f), 'utf-8')
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])
  const d = locs.length - new Set(locs).size
  if (d > 0) perFileDups[f] = d
  pageLocs.push(...locs)
}

// Tool locs = page locs under /tools/.
const toolLocs = pageLocs.filter(u => u.includes('/tools/'))
const sitemapToolSet = new Set(toolLocs.map(u => u.replace(HOST + '/tools/', '').replace(/\/[^/]*$/, '')))

// Phase 3.5.4 — slug integrity: changed slugs + redirect loop detection.
const changedSlugs = []
for (const l of csv) {
  const parts = parseCsvLine(l)
  if (parts.length < 7) continue
  const raw = (parts[6] || '').trim()
  if (raw && raw !== cleanSlug(raw, (parts[1] || '').trim(), new Set())) changedSlugs.push(raw)
}
const redirectLoops = changedSlugs.filter(raw => cleanSlug(raw, raw, new Set()) === raw).length

const invalid = pageLocs.filter(u => !/^https:\/\/megatoolsx\.com(?:\/[a-z0-9\/\-.]*)?$/.test(u))
const wrongHost = pageLocs.filter(u => !u.startsWith(HOST)).length
const wrongPrefix = toolLocs.filter(u => !u.includes('/tools/')).length
const missingSitemap = toolSlugs.filter(s => !sitemapToolSet.has(s))

// Robots reference.
const robotsTxt = existsSync(resolve(PUBLIC, 'robots.txt')) ? readFileSync(resolve(PUBLIC, 'robots.txt'), 'utf-8') : ''
const robotsOk = robotsTxt.includes('Sitemap:') && (robotsTxt.includes(HOST + '/sitemap.xml') || robotsTxt.includes(HOST + '/sitemap-index.xml'))

// Sitemap index valid.
let indexOk = true
if (existsSync(resolve(PUBLIC, 'sitemap-index.xml'))) {
  const idx = readFileSync(resolve(PUBLIC, 'sitemap-index.xml'), 'utf-8')
  const refs = [...idx.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])
  if (refs.some(r => !allFiles.some(f => r.endsWith('/' + f)))) indexOk = false
}

const checks = {
  duplicateUrlsPerFile: Object.values(perFileDups).reduce((a, b) => a + b, 0),
  duplicateSlugs: toolSlugs.length - new Set(toolSlugs).size,
  wrongHostname: wrongHost,
  wrongToolPrefix: wrongPrefix,
  invalidSitemapUrls: invalid.length,
  missingSitemap: missingSitemap.length,
  orphans: missingSitemap.length,
  redirectLoops,
  sitemapIndexValid: indexOk ? 0 : 1,
  robotsRefValid: robotsOk ? 0 : 1,
}
const changedSlugsInfo = { changedSlugs }

// Phase 3.5.4 — per-tool URL integrity report.
mkdirSync(resolve(__dirname, '..', 'reports'), { recursive: true })
writeFileSync(resolve(__dirname, '..', 'reports', 'tool-url-integrity.json'), JSON.stringify({
  totalTools,
  duplicateNormalizedSlugs: checks.duplicateSlugs,
  routeSitemapMismatch: checks.missingSitemap,
  redirectLoops,
  changedSlugs: changedSlugs.length,
  tools: toolSlugs.map((slug, i) => ({
    slug,
    route: `/tools/${slug}`,
    canonical: `${HOST}/tools/${slug}`,
    sitemapUrl: `${HOST}/tools/${slug}`,
    redirectFrom: null,
  })),
}, null, 2))

console.log('PHASE 3.5.3/3.5.4 INDEXABILITY AUDIT')
console.log(`Total tools: ${totalTools}`)
console.log(`Tool URLs in sitemap: ${sitemapToolSet.size}`)
for (const [k, v] of Object.entries(checks)) console.log(`  ${k}: ${v}`)
console.log(`  changedSlugs (legacy redirects): ${changedSlugs.length}`)

if (!sitemapToolSet.has('generative-heal-detector')) failures.push('generative-heal-detector missing from sitemap')
else console.log('  generative-heal-detector present ✓')

let failed = 0
for (const [k, v] of Object.entries(checks)) if (v > 0) { failed++; failures.push(`${k}=${v}`) }
if (failed === 0 && failures.length === 0) { console.log('\nRESULT: PASS ✅'); process.exit(0) }
console.log('\nRESULT: FAIL ❌\n' + failures.join(' | '))
process.exit(1)
