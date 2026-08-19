/**
 * GET /api/seo/monitoring — live SEO monitoring (ADMIN ONLY).
 *
 * Server-side only. Reads Google/Cloudflare secrets from environment, NEVER from
 * the browser. When Search Console is not configured, returns
 * `{ status: 'unavailable', reason: 'credentials_not_configured' }` — never
 * fabricated numbers.
 *
 * Auth: `Authorization: Bearer <SEO_ADMIN_TOKEN>` (server env).
 *   - SEO_ADMIN_TOKEN unset  → 503 "monitoring disabled" (safe default)
 *   - token mismatch          → 401
 *   - token match             → 200
 */
import { resolveSearchConsoleConfig, buildSearchConsoleReport, aggregatePerformance, type SearchConsoleConfig, type NormalizedSearchAnalytics } from '../../src/seo/monitoring/searchConsole'
import { validateMonitoringConfig, type ConfigHealth } from '../../src/seo/monitoring/config'
import { runLiveHttpCheck, summarizeHttp, REPRESENTATIVE_URLS } from '../../src/seo/monitoring/liveHttp'
import { buildSeoReport, type ReportInput } from '../../src/seo/monitoring/reports'
import { resolveSnapshotStore, emptySnapshot } from '../../src/seo/monitoring/history'
import { buildAlerts, DEFAULT_THRESHOLDS } from '../../src/seo/monitoring/alerts'
import { buildAllOpportunities } from '../../src/seo/monitoring/orchestrator'

interface Env {
  SEO_ADMIN_TOKEN?: string
  SEO_MONITORING_ENABLED?: string
  GOOGLE_ACCESS_TOKEN?: string
  GOOGLE_SERVICE_ACCOUNT_CREDENTIALS?: string
  GOOGLE_SEARCH_CONSOLE_SITE_URL?: string
  SEO_INSPECTION_LIMIT?: string
  SITE_URL?: string
  SEO_HISTORY_PROVIDER?: string
  SEO_HISTORY_RETENTION_DAYS?: string
  SEO_SNAPSHOT_KV?: unknown
  SEO_SNAPSHOT_D1?: unknown
}

const HOST = 'https://megatoolsx.com'

function site(env: Env): string { return env.SITE_URL || HOST }

function respond(body, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300, must-revalidate', // 5 min
    },
  })
}

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }): Promise<Response> => {
  // Enabled gate.
  if (env.SEO_MONITORING_ENABLED === 'false') return respond({ status: 'disabled' }, 503)

  // Auth gate (admin token).
  const token = env.SEO_ADMIN_TOKEN
  if (!token) return respond({ status: 'unauthorized', reason: 'monitoring_disabled' }, 503)
  const auth = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!auth || auth !== token) return respond({ status: 'unauthorized' }, 401)

  const base = site(env)
  const health: ConfigHealth = validateMonitoringConfig(env)

  // Live HTTP.
  const http = await runLiveHttpCheck(base, REPRESENTATIVE_URLS)
  const httpSummary = summarizeHttp(http)

  // Search Console — real data only when configured.
  let searchConsole: { status: string; total?: { clicks: number; impressions: number; ctr: number; position: number } } = { status: 'unavailable', reason: 'credentials_not_configured' }
  let indexing = { status: 'unavailable' as const }
  let normalized: NormalizedSearchAnalytics | undefined
  if (health.searchConsole === 'CONNECTED') {
    try {
      const report = await buildSearchConsoleReport(env)
      if (report.performance.status === 'available' && report.performance.data) {
        normalized = report.performance.data
        searchConsole = { status: 'available', total: normalized.totals }
      } else {
        searchConsole = { status: 'error', reason: report.performance.status }
      }
    } catch {
      searchConsole = { status: 'unavailable', reason: 'gsc_api_error' }
    }
  }

  // History + alerts.
  const historyStore = resolveSnapshotStore({
    provider: (env.SEO_HISTORY_PROVIDER as 'd1' | 'kv' | 'memory') || 'memory',
    kv: env.SEO_SNAPSHOT_KV as any,
    d1: env.SEO_SNAPSHOT_D1 as any,
    retentionDays: Number(env.SEO_HISTORY_RETENTION_DAYS || 90),
  })
  const history = historyStore.status === 'available' ? await historyStore.data.list() : []
  const alerts = buildAlerts(history, DEFAULT_THRESHOLDS)

  // Opportunities + trends + tool insights.
  let opportunities: any[] = []
  let trends: any = null
  let toolInsights: any[] = []
  if (normalized) {
    const orchestrated = await buildAllOpportunities({
      rows: normalized.rows,
      siteUrl: base,
      history,
      getInboundCount: () => 0,
    })
    opportunities = orchestrated.opportunities
    trends = orchestrated.trends.overall
    toolInsights = orchestrated.toolInsights
  }

  // CWV status.
  const cwvStatus = 'unavailable'

  // Build report.
  const reportInput: ReportInput = {
    siteUrl: base,
    http,
    searchConsole: normalized ? { status: 'available', data: { rows: normalized.rows } } : { status: searchConsole.status as any, reason: (searchConsole as any).reason },
    indexing,
    sitemap: undefined,
    history,
    cwvStatus,
    optimizationProposals: [],
  }
  const report = buildSeoReport(reportInput)

  return respond({
    status: 'ok',
    health,
    generatedAt: new Date().toISOString(),
    searchConsole,
    indexing,
    searchPerformance: searchConsole,
    sitemap: { status: searchConsole.status },
    http,
    httpSummary,
    cwv: { status: cwvStatus },
    alerts: report.alerts,
    opportunities,
    trends,
    toolInsights,
    optimizationProposals: report.optimizationProposals,
  })
}
