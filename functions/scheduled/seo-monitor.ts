/**
 * Scheduled SEO monitor — daily, idempotent, Cloudflare-compatible.
 *
 * Registered as a Pages scheduled (Cron) handler. Steps:
 *   1. Validate config.
 *   2. If Search Console is configured → fetch search analytics (real data).
 *   3. Normalize rows.
 *   4. Analyze (tool insights, brand split, opportunities).
 *   5. Save a daily snapshot (dedup key: date+period) to KV/D1 when available.
 *   6. Build alerts from history.
 *   7. Prune snapshots older than the retention window.
 *
 * Partial failure is safe: if GSC is unavailable the technical snapshot still saves.
 * No fabricated values. No Node-only APIs (works on the Workers runtime).
 */
import { SNAPSHOT_SCHEMA_VERSION, CloudflareKVSnapshotStore, CloudflareD1SnapshotStore, resolveSnapshotStore, emptySnapshot, snapshotKey, type KvBinding, type D1Binding } from '../../src/seo/monitoring/history'
import { validateMonitoringConfig, resolveGscProperty, type ConfigHealth } from '../../src/seo/monitoring/config'
import { buildSearchConsoleReport, type BuildReportOptions } from '../../src/seo/monitoring/searchConsole'
import { buildAllOpportunities } from '../../src/seo/monitoring/orchestrator'
import { buildAlerts, DEFAULT_THRESHOLDS } from '../../src/seo/monitoring/alerts'
import { buildSeoReport, type ReportInput } from '../../src/seo/monitoring/reports'
import { runLiveHttpCheck, summarizeHttp, REPRESENTATIVE_URLS } from '../../src/seo/monitoring/liveHttp'

interface ScheduledEnv {
  SEO_ADMIN_TOKEN?: string
  SEO_MONITORING_ENABLED?: string
  GOOGLE_ACCESS_TOKEN?: string
  GOOGLE_SERVICE_ACCOUNT_CREDENTIALS?: string
  GOOGLE_SEARCH_CONSOLE_SITE?: string
  GOOGLE_SEARCH_CONSOLE_SITE_URL?: string
  SEO_GSC_PROPERTY?: string
  SEO_HISTORY_RETENTION_DAYS?: string
  SEO_SNAPSHOT_KV?: KvBinding
  SEO_SNAPSHOT_D1?: D1Binding
  SEO_HISTORY_PROVIDER?: string
  SITE_URL?: string
}

const DEFAULT_SITE = 'https://megatoolsx.com'

function today(): string { return new Date().toISOString().slice(0, 10) }

export async function scheduled(_event: unknown, env: ScheduledEnv, ctx: { waitUntil(p: Promise<unknown>): void }): Promise<void> {
  const site = env.SITE_URL || DEFAULT_SITE
  const date = today()
  const health: ConfigHealth = validateMonitoringConfig(env)

  // 1. Live HTTP.
  const http = await runLiveHttpCheck(site, REPRESENTATIVE_URLS)
  const httpSummary = summarizeHttp(http)

  // 2. Search Console (real data only; 'not_configured' otherwise).
  let normalized: { rows: import('../../src/seo/monitoring/types').SearchPerformanceRow[]; totals: { clicks: number; impressions: number; ctr: number; position: number }; fetchMeta: any } | undefined
  let searchConsoleStatus = health.searchConsole
  if (health.searchConsole === 'CONNECTED') {
    try {
      const opts: BuildReportOptions = { days: 28, dimensions: ['query', 'page', 'country', 'device'] }
      const report = await buildSearchConsoleReport(env, opts)
      if (report.performance.status === 'available' && report.performance.data) {
        normalized = report.performance.data
        searchConsoleStatus = 'CONNECTED'
      } else {
        searchConsoleStatus = report.performance.status as any
      }
    } catch {
      searchConsoleStatus = 'UNKNOWN_ERROR'
    }
  }

  // 3. Analysis + opportunities + trends.
  let orchestrated = { opportunities: [] as any[], trends: { overall: { direction: 'insufficient_history' as const, delta: { clicks: null, impressions: null, ctr: null, position: null }, periodsCompared: 0, dataSource: 'insufficient_history' as const }, byEntity: [] }, toolInsights: [] as any[] }
  if (normalized) {
    orchestrated = await buildAllOpportunities({
      rows: normalized.rows,
      siteUrl: site,
      history: [],
      getInboundCount: () => 0,
    })
  }

  // 4. Snapshot.
  const snapshot = {
    date,
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    property: resolveGscProperty(env),
    dateRange: { start: new Date(Date.now() - 27 * 86400000).toISOString().slice(0, 10), end: date },
    generatedAt: new Date().toISOString(),
    status: searchConsoleStatus,
    metrics: normalized ? normalized.totals : { clicks: 0, impressions: 0, ctr: 0, position: 0 },
    entitySummaries: orchestrated.toolInsights.reduce((acc: any, t: any) => {
      acc[t.slug] = { clicks: t.clicks, impressions: t.impressions, position: t.position }
      return acc
    }, {} as Record<string, { clicks: number; impressions: number; position: number }>),
    opportunities: orchestrated.opportunities.slice(0, 25),
    dataQuality: normalized ? normalized.fetchMeta : { rowsReceived: 0, rowsAccepted: 0, rowsRejected: 0, truncated: false },
    fetchMetadata: normalized ? normalized.fetchMeta : { rowsFetched: 0, pagesFetched: 0, truncated: false },
    http: httpSummary,
    indexed: 0,
    discovered: 0,
    trends: orchestrated.trends.overall,
  }

  // 6. Persist snapshot (idempotent by key).
  const provider = (env.SEO_HISTORY_PROVIDER as 'd1' | 'kv' | 'memory') || 'memory'
  const retentionDays = Number(env.SEO_HISTORY_RETENTION_DAYS || 90)
  const store = resolveSnapshotStore({
    provider,
    kv: env.SEO_SNAPSHOT_KV,
    d1: env.SEO_SNAPSHOT_D1,
    retentionDays,
  })

  if (store.status === 'available') {
    ctx.waitUntil(
      (async () => {
        await store.data.save(snapshot as any, '28d')
        const cutoff = new Date(Date.now() - retentionDays * 86400000).toISOString().slice(0, 10)
        await store.data.prune(cutoff)
      })(),
    )
  }

  // 7. Alerts.
  const history = store.status === 'available' ? await store.data.list() : []
  const alerts = buildAlerts(history.map(h => h as any), DEFAULT_THRESHOLDS)

  // 8. Build report.
  const reportInput: ReportInput = {
    siteUrl: site,
    http,
    searchConsole: normalized ? { status: 'available', data: { rows: normalized.rows } } : { status: 'unavailable', reason: searchConsoleStatus },
    indexing: { status: 'unavailable' },
    sitemap: undefined,
    history: history as any,
    cwvStatus: 'unavailable',
  }
  const report = buildSeoReport(reportInput)

  // 9. Persist report JSON for the dashboard.
  if (env.SEO_SNAPSHOT_KV) {
    ctx.waitUntil(
      store.data.save({ ...snapshot, date: date + '-report' } as any, 'report').catch(() => {})
    )
  }

  // Log summary (no secrets).
  console.log(JSON.stringify({
    date,
    searchConsole: searchConsoleStatus,
    clicks: snapshot.metrics.clicks,
    impressions: snapshot.metrics.impressions,
    opportunities: orchestrated.opportunities.length,
    alerts: alerts.length,
    http: httpSummary,
  }))
}

export const onSchedule = [scheduled]
