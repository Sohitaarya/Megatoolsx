/**
 * SEO Monitoring — report aggregation. Builds the SeoMonitoringReport with real
 * values only; any unavailable provider reports 'unavailable', never zero.
 */

import type { DataAvailability, HttpResult, IndexingMetrics, SeoMonitoringReport, SearchPerformanceRow } from './types'
import { generateOpportunities } from './opportunities'
import { buildAlerts, type AlertThresholds, DEFAULT_THRESHOLDS } from './alerts'
import type { SeoSnapshot } from './types'
import { analyzeTrends } from './trends'
import { buildToolSeoInsight } from './analysis'
import type { OptimizationProposal } from './optimization'

export interface ReportInput {
  siteUrl: string
  http: HttpResult[]
  searchConsole: DataAvailability<{ rows: SearchPerformanceRow[] }>
  indexing: IndexingMetrics
  sitemap: IndexingMetrics['sitemap'] | undefined
  history: SeoSnapshot[]
  thresholds?: Partial<AlertThresholds>
  cwvStatus: 'available' | 'unavailable'
  optimizationProposals?: import('./optimization').OptimizationProposal[]
}

export function buildSeoReport(input: ReportInput): SeoMonitoringReport {
  const opportunities = generateOpportunities(input.searchConsole, input.siteUrl)
  const alerts = buildAlerts(input.history, { ...DEFAULT_THRESHOLDS, ...input.thresholds })
  const trends = input.history.length >= 2 ? analyzeTrends(input.history) : { overall: { current: null, previous: null, direction: 'insufficient_history' as const, delta: { clicks: null, impressions: null, ctr: null, position: null }, periodsCompared: 0, dataSource: 'insufficient_history' as const }, byEntity: [] }
  const toolInsights = input.searchConsole.status === 'available' ? buildToolSeoInsight(input.searchConsole.data.rows) : []
  return {
    timestamp: new Date().toISOString(),
    site: input.siteUrl,
    searchConsole: input.searchConsole,
    indexing: input.indexing,
    crawl: {
      status: input.http.some(h => h.status === 0) ? 'unavailable' : 'available',
      http: input.http,
      notes: input.http.some(h => h.status >= 400) ? ['Some representative URLs returned 4xx/5xx.'] : undefined,
    },
    sitemap: { status: input.indexing.status, ...(input.sitemap ?? {}) },
    cwv: { status: input.cwvStatus, samples: [], sampleCount: 0 },
    alerts,
    opportunities,
    trends: trends.overall,
    toolInsights,
    optimizationProposals: input.optimizationProposals,
  }
}