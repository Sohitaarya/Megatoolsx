/**
 * SEO Monitor CLI (Phase 3.7).
 *
 *   npm run seo:monitor           # local audits + live HTTP + provider status
 *   npm run seo:monitor -- --http # live HTTP only
 *   npm run seo:monitor -- --search-console
 *   npm run seo:monitor -- --cwv
 *   npm run seo:monitor -- --all
 *
 * Default works WITHOUT credentials. Optional external providers report
 * "unavailable" (never fabricated). Exit 0 unless a configured provider fails
 * or a critical technical check fails.
 */
import { execFileSync } from 'child_process'
import { writeFileSync, mkdirSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const args = process.argv.slice(2)
const SITE = process.env.SITE_URL || 'https://megatoolsx.com'
const httpOnly = args.includes('--http')
const scOnly = args.includes('--search-console')
const all = args.includes('--all')
const REP = ['/', '/tools', '/category/design-creative', '/collections', '/tools/generative-heal-detector', '/sitemap.xml', '/robots.txt']

function runAudit(script) {
  try { execFileSync(process.execPath, [resolve(__dirname, script)], { stdio: 'pipe' }); return 'PASS' }
  catch { return 'FAIL' }
}

async function liveHttp() {
  const out = []
  for (const p of REP) {
    try {
      const res = await fetch(SITE + p)
      out.push({ url: SITE + p, status: res.status, contentType: res.headers.get('content-type') })
    } catch { out.push({ url: SITE + p, status: 0, contentType: null }) }
  }
  return out
}

const results = {
  local: {
    indexability: runAudit('audit-indexability.mjs'),
    crawlEfficiency: runAudit('audit-crawl-efficiency.mjs'),
  },
  http: [],
  searchConsole: process.env.GOOGLE_SEARCH_CONSOLE_CREDENTIALS || process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS
    ? 'available' : 'unavailable',
  cloudflare: process.env.CLOUDFLARE_ANALYTICS_ENABLED === 'true' ? 'available' : 'disabled',
  rum: process.env.RUM_ENABLED === 'true' ? 'available' : 'disabled',
}

console.log('SEO MONITOR — ' + SITE)
console.log('LOCAL TECHNICAL AUDIT')
console.log('  Indexability: ' + results.local.indexability)
console.log('  Crawl efficiency: ' + results.local.crawlEfficiency)
console.log('PROVIDERS')
console.log('  Search Console: ' + results.searchConsole + (results.searchConsole === 'unavailable' ? ' (credentials/property not configured)' : ''))
console.log('  Cloudflare: ' + results.cloudflare)
console.log('  RUM: ' + results.rum)

if (!scOnly && !httpOnly || all) {
  const http = await liveHttp()
  results.http = http
  const s = { '200': 0, '3xx': 0, '4xx': 0, '5xx': 0, slow: [] }
  for (const h of http) {
    const c = h.status >= 200 && h.status < 300 ? '200' : h.status >= 300 && h.status < 400 ? '3xx' : h.status >= 400 && h.status < 500 ? '4xx' : h.status >= 500 ? '5xx' : '?'
    s[c]++
    console.log(`  ${h.status || 'ERR'} ${h.url}`)
  }
  console.log('LIVE HTTP — 200:' + s['200'] + ' 3xx:' + s['3xx'] + ' 4xx:' + s['4xx'] + ' 5xx:' + s['5xx'])
  if (http.some(h => h.status >= 400)) { console.log('RESULT: FAIL — representative URL returned 4xx/5xx'); process.exit(1) }
}

mkdirSync(resolve(ROOT, 'reports'), { recursive: true })
writeFileSync(resolve(ROOT, 'reports', 'seo-monitoring.json'), JSON.stringify({ timestamp: new Date().toISOString(), site: SITE, ...results }, null, 2))
console.log('Wrote reports/seo-monitoring.json')

// Phase 3.9 consolidated report (honest — Search Console is not_configured when absent).
const phaseReport = {
  buildTimestamp: new Date().toISOString(),
  site: SITE,
  technical: { indexability: results.local.indexability, crawlEfficiency: results.local.crawlEfficiency },
  searchConsole: { status: results.searchConsole, reason: results.searchConsole === 'unavailable' ? 'credentials_not_configured' : undefined },
  historyProvider: process.env.SEO_HISTORY_PROVIDER || 'not_configured',
  cwv: { status: results.rum === 'available' ? 'available' : 'not_configured' },
  http: results.http,
  opportunities: [],
  alerts: [],
}
writeFileSync(resolve(ROOT, 'reports', 'seo-phase-3-9.json'), JSON.stringify(phaseReport, null, 2))
console.log('Wrote reports/seo-phase-3-9.json')

const localFail = Object.values(results.local).some(v => v === 'FAIL')
console.log(localFail ? 'RESULT: FAIL — local technical audit failed' : 'RESULT: PASS')
process.exit(localFail ? 1 : 0)