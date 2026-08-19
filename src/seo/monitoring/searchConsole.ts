/**
 * SEO Monitoring — Google Search Console provider (SERVER-SIDE ONLY).
 *
 * Real, read-only, official Search Console API. Returns explicit DataAvailability
 * states — 'not_configured' | 'unavailable' | 'error' | 'available' — never
 * fabricated zeros. Credentials are read from server env, never VITE_*.
 */

import type { DataAvailability, SearchPerformanceRow, SearchConsoleStatus } from './types'
import { hasSearchConsoleCredentials, resolveGscProperty } from './config'

const GSC_BASE = 'https://searchconsole.googleapis.com/webmasters/v3'

export type GscErrorCategory =
  | 'NOT_CONFIGURED' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'RATE_LIMITED' | 'INVALID_PROPERTY'
  | 'NETWORK_ERROR' | 'GOOGLE_API_ERROR' | 'UNKNOWN_ERROR'

export function classifyGscError(status: number): GscErrorCategory {
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

export type SearchConsoleConfig =
  | { status: 'configured'; siteUrl: string; authMethod: 'service_account' | 'access_token'; accessToken: string }
  | { status: 'not_configured'; reason: string }

export function resolveSearchConsoleConfig(env: NodeJS.ProcessEnv = process.env): SearchConsoleConfig {
  const siteUrl = resolveGscProperty(env)
  const token = env.GOOGLE_ACCESS_TOKEN
  if (token) return { status: 'configured', siteUrl, authMethod: 'access_token', accessToken: token }
  if (hasSearchConsoleCredentials(env)) return { status: 'configured', siteUrl, authMethod: 'service_account', accessToken: '' }
  return { status: 'not_configured', reason: 'credentials_not_configured' }
}

/* ── Client (official API, retry with backoff, timeout) ─────────────── */
export const GSC_ROW_LIMIT = 25000
export const GSC_MAX_PAGES = 20
export const GSC_MAX_ROWS = 100000

export interface GscRow {
  keys: string[]
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export interface GscFetchResult {
  rows: GscRow[]
  rowsFetched: number
  pagesFetched: number
  truncated: boolean
}

async function fetchAnalyticsPage(siteUrl: string, accessToken: string, startDate: string, endDate: string, dimensions: string[], startRow: number): Promise<{ rows: GscRow[] }> {
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
    const body = (await res.json()) as { rows?: GscRow[] }
    return { rows: body.rows ?? [] }
  } finally {
    clearTimeout(timer)
  }
}

async function retryAnalyticsPage(siteUrl: string, accessToken: string, startDate: string, endDate: string, dimensions: string[], startRow: number): Promise<{ rows: GscRow[] }> {
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
        const body = (await res.json()) as { rows?: GscRow[] }
        return { rows: body.rows ?? [] }
      }
    } finally {
      clearTimeout(timer)
    }
  }
  throw new Error('gsc-retries-exhausted')
}

/**
 * Fetch Search Analytics with pagination. Keeps fetching until all rows are
 * retrieved OR configured safety limits are reached. Exposes `truncated` instead
 * of silently pretending the dataset is complete.
 */
export async function fetchSearchAnalytics(siteUrl: string, accessToken: string, startDate: string, endDate: string, dimensions: string[] = ['query', 'page', 'country', 'device']): Promise<GscFetchResult> {
  const allRows: GscRow[] = []
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

/* ── Normalize → typed rows with validation ── */
export interface NormalizedSearchAnalytics {
  rows: SearchPerformanceRow[]
  totals: { clicks: number; impressions: number; ctr: number; position: number }
  fetchMeta: { rowsReceived: number; rowsFetched: number; pagesFetched: number; truncated: boolean; rowsAccepted: number; rowsRejected: number }
}

export interface NormalizationStats {
  rowsReceived: number
  rowsAccepted: number
  rowsRejected: number
}

/**
 * Normalize raw GSC rows into typed SearchPerformanceRow[], with validation.
 * Rejects: NaN, Infinity, negative clicks/impressions, impossible CTR (>1).
 * Does not crash on bad rows — records rejected count.
 */
export function normalizeSearchAnalytics(fetchResult: GscFetchResult): NormalizedSearchAnalytics {
  const stats: NormalizationStats = { rowsReceived: fetchResult.rows.length, rowsAccepted: 0, rowsRejected: 0 }
  const validRows: SearchPerformanceRow[] = []

  for (const r of fetchResult.rows) {
    const keys = r.keys ?? []
    const query = keys[0]
    const page = keys[1]
    const date = keys[2]
    const clicks = r.clicks
    const impressions = r.impressions
    const position = r.position

    // Validation
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
    fetchMeta: {
      rowsReceived: stats.rowsReceived,
      rowsFetched: fetchResult.rowsFetched,
      pagesFetched: fetchResult.pagesFetched,
      truncated: fetchResult.truncated,
      rowsAccepted: stats.rowsAccepted,
      rowsRejected: stats.rowsRejected,
    },
  }
}

/** Backward-compatible aggregate (used by the API). */
export function aggregatePerformance(raw: unknown): { status: string; total?: { clicks: number; impressions: number; ctr: number; position: number } } {
  const n = normalizeSearchAnalytics(raw as GscFetchResult)
  return { status: 'available', total: n.totals }
}

export interface BuildReportOptions {
  startDate?: string
  endDate?: string
  days?: 7 | 14 | 28 | 30 | 90
  dimensions?: string[]
}

const DEFAULT_DAYS = 28

/* ── Report ────────────────────────────────────────────────────── */
export async function buildSearchConsoleReport(env: NodeJS.ProcessEnv = process.env, opts: BuildReportOptions = {}): Promise<{ performance: DataAvailability<NormalizedSearchAnalytics>; indexing: DataAvailability<unknown> }> {
  const cfg = resolveSearchConsoleConfig(env)
  if (cfg.status === 'not_configured') {
    return { performance: { status: 'not_configured', reason: cfg.reason }, indexing: { status: 'not_configured', reason: cfg.reason } }
  }
  const end = opts.endDate ? new Date(opts.endDate) : new Date()
  const days = opts.days ?? DEFAULT_DAYS
  const start = opts.startDate ? new Date(opts.startDate) : new Date(Date.now() - (days - 1) * 86400000)
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  const dimensions = opts.dimensions ?? ['query', 'page', 'country', 'device']
  try {
    const fetchResult = await fetchSearchAnalytics(cfg.siteUrl, cfg.accessToken, iso(start), iso(end), dimensions)
    const normalized = normalizeSearchAnalytics(fetchResult)
    return { performance: { status: 'available', data: normalized }, indexing: { status: 'unavailable', reason: 'url_inspection_not_configured' } }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'gsc_error'
    const category = message.startsWith('gsc-') ? classifyGscError(Number(message.replace('gsc-', ''))) : 'UNKNOWN_ERROR'
    return { performance: { status: 'error', message: category as SearchConsoleStatus }, indexing: { status: 'unavailable', reason: category } }
  }
}

/** Fetch with explicit date range for CLI/scheduler use. */
export async function fetchSearchAnalyticsRange(
  siteUrl: string,
  accessToken: string,
  startDate: string,
  endDate: string,
  dimensions: string[] = ['query', 'page', 'country', 'device']
): Promise<GscFetchResult> {
  return fetchSearchAnalytics(siteUrl, accessToken, startDate, endDate, dimensions)
}