/**
 * SEO GSC Monitor CLI (Phase 3.15).
 *
 *   npm run seo:gsc                # fetch → normalize → analyze → print → save
 *   npm run seo:gsc -- --dry-run   # fetch/analyze, do NOT persist
 *   npm run seo:gsc -- --days=28   # 7 | 14 | 28 | 30 | 90
 *   npm run seo:gsc -- --dimensions=query,page,country,device
 *
 * Honest states: CONNECTED (real Google data) / NOT_CONFIGURED / UNAVAILABLE /
 * ERROR. NEVER fabricates clicks/impressions/CTR/position.
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const daysArg = args.find(a => a.startsWith('--days='))
const days = daysArg ? Number(daysArg.split('=')[1]) : 28
const VALID_DAYS = [7, 14, 28, 30, 90]
const PROPERTY = process.env.SEO_GSC_PROPERTY || process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL || 'https://megatoolsx.com/'
const GSC_BASE = 'https://searchconsole.googleapis.com/webmasters/v3'

if (!VALID_DAYS.includes(days)) { console.error(`Invalid --days=${days} (allowed: ${VALID_DAYS.join(', ')})`); process.exit(2) }

const token = process.env.GOOGLE_ACCESS_TOKEN
const serviceAcct = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS

console.log('MegaToolsX SEO Monitor')
console.log('Property: ' + PROPERTY)
console.log('Search Console: ' + (token || serviceAcct ? 'CONFIGURED' : 'NOT_CONFIGURED'))

if (!token && !serviceAcct) {
  console.log('\nRESULT: NOT_CONFIGURED (credentials not configured — no metrics fabricated)')
  process.exit(0)
}

const end = new Date()
const start = new Date(Date.now() - (days - 1) * 86400000)
const iso = d => d.toISOString().slice(0, 10)

const GSC_ROW_LIMIT = 25000
const GSC_MAX_PAGES = 20
const GSC_MAX_ROWS = 100000

async function fetchAnalyticsPage(siteUrl, accessToken, startDate, endDate, dimensions, startRow) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)
  try {
    const res = await fetch(`${GSC_BASE}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ startDate, endDate, dimensions, rowLimit: GSC_ROW_LIMIT, startRow }),
      signal: controller.signal,
    })
    if (!res.ok) {
      if (res.status === 429 || res.status >= 500) return retryAnalyticsPage(siteUrl, accessToken, startDate, endDate, dimensions, startRow)
      throw new Error(`gsc-${res.status}`)
    }
    const body = await res.json()
    return { rows: body.rows ?? [] }
  } finally {
    clearTimeout(timer)
  }
}

async function retryAnalyticsPage(siteUrl, accessToken, startDate, endDate, dimensions, startRow) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    await new Promise(r => setTimeout(r, 400 * attempt))
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 15000)
    try {
      const res = await fetch(`${GSC_BASE}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ startDate, endDate, dimensions, rowLimit: GSC_ROW_LIMIT, startRow }),
        signal: controller.signal,
      })
      if (res.ok) {
        const body = await res.json()
        return { rows: body.rows ?? [] }
      }
    } finally {
      clearTimeout(timer)
    }
  }
  throw new Error('gsc-retries-exhausted')
}

async function fetchSearchAnalytics(siteUrl, accessToken, startDate, endDate, dimensions = ['query', 'page', 'country', 'device']) {
  const allRows = []
  let startRow = 0
  let pagesFetched = 0

  while (true) {
    if (pagesFetched >= GSC_MAX_PAGES || allRows.length >= GSC_MAX_ROWS) break
    const page = await fetchAnalyticsPage(siteUrl, accessToken, startDate, endDate, dimensions, startRow)
    allRows.push(...page.rows)
    pagesFetched++
    if (page.rows.length < GSC_ROW_LIMIT) break
    startRow += GSC_ROW_LIMIT
  }

  return {
    rows: allRows,
    rowsFetched: allRows.length,
    pagesFetched,
    truncated: allRows.length >= GSC_MAX_ROWS || pagesFetched >= GSC_MAX_PAGES,
  }
}

function classifyGscError(status) {
  switch (status) {
    case 401: return 'UNAUTHORIZED'
    case 403: return 'FORBIDDEN'
    case 429: return 'RATE_LIMITED'
    case 404: return 'INVALID_PROPERTY'
    case 0: return 'NETWORK_ERROR'
    default:
      return status >= 500 ? 'GOOGLE_API_ERROR' : 'UNKNOWN_ERROR'
  }
}

/** Validate and normalize GSC rows */
function normalizeSearchAnalytics(fetchResult) {
  const stats = { rowsReceived: fetchResult.rows.length, rowsAccepted: 0, rowsRejected: 0 }
  const validRows = []

  for (const r of fetchResult.rows) {
    const keys = r.keys ?? []
    const query = keys[0]
    const page = keys[1]
    const date = keys[2]
    const clicks = r.clicks
    const impressions = r.impressions
    const position = r.position

    if (typeof clicks !== 'number' || typeof impressions !== 'number' || typeof position !== 'number') {
      stats.rowsRejected++
      continue
    }
    if (!Number.isFinite(clicks) || !Number.isFinite(impressions) || !Number.isFinite(position)) {
      stats.rowsRejected++
      continue
    }
    if (clicks < 0 || impressions < 0 || position <= 0) {
      stats.rowsRejected++
      continue
    }
    const ctr = impressions > 0 ? clicks / impressions : 0
    if (!Number.isFinite(ctr) || ctr < 0 || ctr > 1) {
      stats.rowsRejected++
      continue
    }

    validRows.push({ query, page, date, clicks, impressions, ctr, position })
    stats.rowsAccepted++
  }

  const clicks = validRows.reduce((a, r) => a + r.clicks, 0)
  const impressions = validRows.reduce((a, r) => a + r.impressions, 0)
  const weightedCtr = impressions > 0 ? clicks / impressions : 0
  const avgPosition = validRows.length ? validRows.reduce((a, r) => a + r.position, 0) / validRows.length : 0

  return {
    rows: validRows,
    totals: { clicks, impressions, ctr: weightedCtr, position: avgPosition },
    stats,
    fetchMeta: {
      rowsFetched: fetchResult.rowsFetched,
      pagesFetched: fetchResult.pagesFetched,
      truncated: fetchResult.truncated,
    },
  }
}

/** Match a page URL to entity type and slug */
function matchPageToEntity(pageUrl) {
  if (!pageUrl) return { type: 'unknown', slug: null }
  const path = pageUrl.replace(/^https:\/\/megatoolsx\.com/, '').split('?')[0].replace(/\/+$/, '')
  if (/^\/tools\/[^/]+$/.test(path)) return { type: 'tool', slug: path.replace('/tools/', '') }
  if (/^\/category\/[^/]+$/.test(path)) return { type: 'category', slug: path.replace('/category/', '') }
  if (/^\/collections\/[^/]+$/.test(path)) return { type: 'collection', slug: path.replace('/collections/', '') }
  if (/^\/ai-tools\/[^/]+$/.test(path)) return { type: 'ai', slug: path.replace('/ai-tools/', '') }
  if (['/', '/tools', '/categories', '/collections', '/blog', '/about', '/contact', '/privacy', '/terms'].includes(path)) return { type: 'static' }
  return { type: 'unknown' }
}

/** Brand query classifier (matches src/seo/monitoring/brandQueries.ts) */
const BRAND_PATTERNS = [
  /^megatoolsx$/i,
  /^mega\s*tools?\s*x?$/i,
  /^mega\s*tools?\s*online$/i,
  /^megatools\s*x?$/i,
]

function isBrandQuery(query) {
  if (!query) return false
  const q = query.trim().toLowerCase()
  return BRAND_PATTERNS.some(p => p.test(q))
}

/** Build per-tool SEO insights */
function buildToolInsights(rows) {
  const bySlug = new Map()
  for (const r of rows) {
    if (!r.page) continue
    const entity = matchPageToEntity(r.page)
    if (entity.type !== 'tool' || !entity.slug) continue
    const list = bySlug.get(entity.slug) || []
    list.push(r)
    bySlug.set(entity.slug, list)
  }

  const out = []
  for (const [slug, list] of bySlug) {
    const clicks = list.reduce((a, r) => a + r.clicks, 0)
    const impressions = list.reduce((a, r) => a + r.impressions, 0)
    const ctr = impressions > 0 ? clicks / impressions : 0
    const position = list.length ? list.reduce((a, r) => a + r.position, 0) / list.length : 0
    const brandClicks = list.filter(r => r.query && isBrandQuery(r.query)).reduce((a, r) => a + r.clicks, 0)
    const brandImpressions = list.filter(r => r.query && isBrandQuery(r.query)).reduce((a, r) => a + r.impressions, 0)
    out.push({
      slug,
      page: `https://megatoolsx.com/tools/${slug}`,
      clicks,
      impressions,
      ctr,
      position: Number(position.toFixed(1)),
      topQueries: list.sort((a, b) => b.impressions - a.impressions).slice(0, 5).map(r => r.query).filter(Boolean),
      brandClicks,
      brandImpressions,
      nonBrandClicks: clicks - brandClicks,
      nonBrandImpressions: impressions - brandImpressions,
      dataAvailability: impressions > 0 || clicks > 0 ? 'available' : 'no_data',
    })
  }
  return out.sort((a, b) => b.impressions - a.impressions).slice(0, 100)
}

/** Split brand vs non-brand */
function splitBrandNonBrand(rows) {
  const brand = rows.filter(r => r.query && isBrandQuery(r.query))
  const nonBrand = rows.filter(r => !r.query || !isBrandQuery(r.query))
  return { brand, nonBrand }
}

/** Aggregate by entity type */
function aggregateByEntity(rows) {
  const tools = {}
  const categories = {}
  const collections = {}
  const statics = {}
  const unknown = {}

  for (const r of rows) {
    const entity = matchPageToEntity(r.page)
    const bucket = entity.type === 'tool' ? tools : entity.type === 'category' ? categories : entity.type === 'collection' ? collections : entity.type === 'static' ? statics : unknown
    const key = entity.slug || r.page || 'unknown'
    const entry = bucket[key] || { clicks: 0, impressions: 0, positionSum: 0, count: 0, queries: new Set(), ctrSum: 0 }
    entry.clicks += r.clicks
    entry.impressions += r.impressions
    entry.positionSum += r.position
    entry.count++
    entry.ctrSum += r.ctr
    if (r.query) entry.queries.add(r.query)
    bucket[key] = entry
  }

  function toArray(obj) {
    return Object.entries(obj).map(([slug, v]) => ({
      slug,
      clicks: v.clicks,
      impressions: v.impressions,
      ctr: v.impressions > 0 ? v.clicks / v.impressions : 0,
      position: v.count ? Number((v.positionSum / v.count).toFixed(1)) : 0,
      queryCount: v.queries.size,
    })).sort((a, b) => b.impressions - a.impressions)
  }

  return { tools: toArray(tools), categories: toArray(categories), collections: toArray(collections), statics: toArray(statics), unknown: toArray(unknown) }
}

/** Analyze position opportunities */
function analyzePositionOpportunities(rows, minImpressions = 50) {
  const out = []
  for (const r of rows) {
    if (r.impressions < minImpressions) continue
    if (r.position >= 4 && r.position <= 10) {
      out.push({ type: 'POSITION_4_10', page: r.page, query: r.query, position: r.position, impressions: r.impressions, ctr: r.ctr })
    } else if (r.position >= 11 && r.position <= 20) {
      out.push({ type: 'POSITION_11_20', page: r.page, query: r.query, position: r.position, impressions: r.impressions, ctr: r.ctr })
    }
    if (r.impressions >= 500 && r.ctr < 0.02) {
      out.push({ type: 'HIGH_IMPRESSIONS_LOW_CTR', page: r.page, query: r.query, position: r.position, impressions: r.impressions, ctr: r.ctr })
    }
  }
  return out.sort((a, b) => b.impressions - a.impressions).slice(0, 100)
}

/** Query cannibalization detection */
function detectCannibalization(rows) {
  const byQuery = new Map()
  for (const r of rows) {
    if (!r.query) continue
    const list = byQuery.get(r.query) || []
    list.push(r)
    byQuery.set(r.query, list)
  }

  const out = []
  for (const [query, list] of byQuery) {
    if (list.length <= 1) continue
    const sorted = list.sort((a, b) => a.position - b.position)
    const best = sorted[0]
    const second = sorted[1]
    if (second && best.position <= 10 && second.position <= 20 && second.impressions > best.impressions * 0.1) {
      out.push({ query, bestPage: best.page, bestPosition: best.position, secondPage: second.page, secondPosition: second.position, impressionShare: (second.impressions / list.reduce((a, r) => a + r.impressions, 0) * 100).toFixed(1) + '%' })
    }
  }
  return out.slice(0, 50)
}

try {
  const dimensions = ['query', 'page', 'country', 'device']
  const fetchResult = await fetchSearchAnalytics(PROPERTY, token, iso(start), iso(end), dimensions)
  const normalized = normalizeSearchAnalytics(fetchResult)

  const { rows, totals, stats, fetchMeta } = normalized

  console.log('Period: ' + iso(start) + ' → ' + iso(end))
  console.log('Rows received: ' + stats.rowsReceived)
  console.log('Rows accepted: ' + stats.rowsAccepted)
  console.log('Rows rejected: ' + stats.rowsRejected)
  console.log('Pages fetched: ' + fetchMeta.pagesFetched)
  console.log('Truncated: ' + (fetchMeta.truncated ? 'YES' : 'NO'))
  console.log('Clicks: ' + totals.clicks)
  console.log('Impressions: ' + totals.impressions)
  console.log('CTR: ' + (totals.ctr * 100).toFixed(2) + '%')
  console.log('Avg position: ' + totals.position.toFixed(1))

  // Analysis
  const toolInsights = buildToolInsights(rows)
  const { brand, nonBrand } = splitBrandNonBrand(rows)
  const brandClicks = brand.reduce((a, r) => a + r.clicks, 0)
  const brandImpressions = brand.reduce((a, r) => a + r.impressions, 0)
  const brandCtr = brandImpressions > 0 ? brandClicks / brandImpressions : 0
  const brandPosition = brand.length ? brand.reduce((a, r) => a + r.position, 0) / brand.length : 0
  const nonBrandClicks = nonBrand.reduce((a, r) => a + r.clicks, 0)
  const nonBrandImpressions = nonBrand.reduce((a, r) => a + r.impressions, 0)
  const nonBrandCtr = nonBrandImpressions > 0 ? nonBrandClicks / nonBrandImpressions : 0
  const nonBrandPosition = nonBrand.length ? nonBrand.reduce((a, r) => a + r.position, 0) / nonBrand.length : 0

  console.log('\n--- Brand vs Non-Brand ---')
  console.log('Brand clicks: ' + brandClicks + ' | impressions: ' + brandImpressions + ' | CTR: ' + (brandCtr * 100).toFixed(2) + '% | pos: ' + brandPosition.toFixed(1))
  console.log('Non-brand clicks: ' + nonBrandClicks + ' | impressions: ' + nonBrandImpressions + ' | CTR: ' + (nonBrandCtr * 100).toFixed(2) + '% | pos: ' + nonBrandPosition.toFixed(1))

  console.log('\n--- Top Tools (by impressions) ---')
  for (const t of toolInsights.slice(0, 20)) {
    console.log(`  ${t.slug}: ${t.impressions} imp | ${t.clicks} cl | ${(t.ctr*100).toFixed(2)}% | pos ${t.position} | brand ${t.brandClicks}/${t.clicks}`)
  }

  const byEntity = aggregateByEntity(rows)
  console.log('\n--- Categories (by impressions) ---')
  for (const c of byEntity.categories.slice(0, 15)) {
    console.log(`  ${c.slug}: ${c.impressions} imp | ${c.clicks} cl | ${(c.ctr*100).toFixed(2)}% | pos ${c.position} | ${c.queryCount} queries`)
  }

  console.log('\n--- Collections (by impressions) ---')
  for (const c of byEntity.collections.slice(0, 15)) {
    console.log(`  ${c.slug}: ${c.impressions} imp | ${c.clicks} cl | ${(c.ctr*100).toFixed(2)}% | pos ${c.position} | ${c.queryCount} queries`)
  }

  const opportunities = analyzePositionOpportunities(rows)
  console.log('\n--- Position Opportunities ---')
  const pos4_10 = opportunities.filter(o => o.type === 'POSITION_4_10').length
  const pos11_20 = opportunities.filter(o => o.type === 'POSITION_11_20').length
  const lowCtr = opportunities.filter(o => o.type === 'HIGH_IMPRESSIONS_LOW_CTR').length
  console.log('  POSITION_4_10: ' + pos4_10)
  console.log('  POSITION_11_20: ' + pos11_20)
  console.log('  HIGH_IMPRESSIONS_LOW_CTR: ' + lowCtr)
  for (const o of opportunities.slice(0, 20)) {
    console.log(`  ${o.type}: ${o.page} query="${o.query}" pos=${o.position} imp=${o.impressions} ctr=${(o.ctr*100).toFixed(2)}%`)
  }

  const cannibalization = detectCannibalization(rows)
  if (cannibalization.length) {
    console.log('\n--- Potential Cannibalization ---')
    for (const c of cannibalization.slice(0, 10)) {
      console.log(`  "${c.query}": best=${c.bestPage} (pos ${c.bestPosition}) vs ${c.secondPage} (pos ${c.secondPosition}) share ${c.impressionShare}`)
    }
  }

  // Unknown pages
  if (byEntity.unknown.length) {
    console.log('\n--- Unknown Pages (unmatched) ---')
    for (const u of byEntity.unknown.slice(0, 10)) {
      console.log(`  ${u.slug}: ${u.impressions} imp | ${u.clicks} cl`)
    }
  }

  if (!dryRun) {
    mkdirSync(resolve(ROOT, 'reports'), { recursive: true })
    const snapshot = {
      schemaVersion: 1,
      property: PROPERTY,
      dateRange: { start: iso(start), end: iso(end) },
      fetchedAt: new Date().toISOString(),
      status: 'CONNECTED',
      totals,
      fetchMeta: { ...fetchMeta, rowsAccepted: stats.rowsAccepted, rowsRejected: stats.rowsRejected },
      tools: toolInsights,
      brand: { clicks: brandClicks, impressions: brandImpressions, ctr: brandCtr, position: Number(brandPosition.toFixed(1)) },
      nonBrand: { clicks: nonBrandClicks, impressions: nonBrandImpressions, ctr: nonBrandCtr, position: Number(nonBrandPosition.toFixed(1)) },
      categories: byEntity.categories,
      collections: byEntity.collections,
      unknownPages: byEntity.unknown,
      opportunities: opportunities.map(o => ({ ...o, type: o.type })),
      cannibalization,
    }
    writeFileSync(resolve(ROOT, 'reports', 'seo-gsc-snapshot.json'), JSON.stringify(snapshot, null, 2))
    console.log('\nSnapshot saved: reports/seo-gsc-snapshot.json')
  } else {
    console.log('\nDry run — snapshot NOT saved.')
  }
  console.log('RESULT: CONNECTED')
} catch (err) {
  const msg = err instanceof Error ? err.message : 'UNKNOWN_ERROR'
  let result = msg
  if (msg.startsWith('gsc-')) {
    const status = Number(msg.replace('gsc-', ''))
    result = classifyGscError(status)
  }
  console.log('RESULT: ' + result)
  process.exit(1)
}