/**
 * SEO Monitoring — shared types. Strict, no fabricated metrics.
 * Every provider reports an availability status; "unavailable" is never faked
 * into zeros.
 */

export type Availability = 'available' | 'unavailable' | 'disabled' | 'not_configured' | 'error'

export type SearchConsoleStatus =
  | 'NOT_CONFIGURED'
  | 'CONNECTED'
  | 'UNAVAILABLE'
  | 'ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'RATE_LIMITED'
  | 'INVALID_PROPERTY'
  | 'NETWORK_ERROR'
  | 'GOOGLE_API_ERROR'
  | 'UNKNOWN_ERROR'

/**
 * Explicit data-availability state. The dashboard MUST know the difference between
 * "no data", "data is zero", "provider not configured", and "provider failed".
 */
export type DataAvailability<T> =
  | { status: 'available'; data: T }
  | { status: 'not_configured'; reason: string }
  | { status: 'unavailable'; reason: string }
  | { status: 'error'; message: string }

export interface SearchPerformanceRow {
  query?: string
  page?: string
  date?: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export interface SearchPerformance {
  status: Availability
  dateRange?: { start: string; end: string }
  total?: { clicks: number; impressions: number; ctr: number; position: number }
  byQuery?: SearchPerformanceRow[]
  byPage?: SearchPerformanceRow[]
  byDevice?: SearchPerformanceRow[]
  byCountry?: SearchPerformanceRow[]
  byTool?: SearchPerformanceRow[]
  byCategory?: SearchPerformanceRow[]
}

export interface IndexingStates {
  indexed: number
  discovered: number
  crawledNotIndexed: number
  excluded: number
  error: number
}

export interface IndexingMetrics {
  status: Availability
  states?: IndexingStates
  sitemap?: {
    submitted?: number
    lastDownloaded?: string
    errors?: number
    warnings?: number
  }
}

export interface CwvSample {
  route: string
  lcp?: number
  inp?: number
  cls?: number
  fcp?: number
  ttfb?: number
  deviceClass?: string
  connectionType?: string
}

export interface HttpResult {
  url: string
  status: number
  contentType?: string
  responseMs: number
  redirectChain: string[]
  finalUrl: string
}

export interface CwvSummary {
  status: Availability
  samples: CwvSample[]
  sampleCount: number
}

export interface SeoSnapshot {
  date: string
  schemaVersion?: number
  property?: string
  dateRange?: { start: string; end: string }
  generatedAt?: string
  status?: string
  indexed?: number
  discovered?: number
  clicks?: number
  impressions?: number
  ctr?: number
  position?: number
  metrics?: { clicks: number; impressions: number; ctr: number; position: number }
  entitySummaries?: Record<string, { clicks: number; impressions: number; position: number }>
  opportunities?: import('./opportunities').SeoOpportunity[]
  dataQuality?: { rowsReceived: number; rowsAccepted: number; rowsRejected: number; truncated: boolean }
  fetchMetadata?: { rowsFetched: number; pagesFetched: number; truncated: boolean }
  cwv?: Partial<CwvSample>
}

export type { SeoAlert } from './alerts'
export type { SeoOpportunity as Opportunity } from './opportunities'

/** Normalized, versioned daily Search Console snapshot (values only from Google). */
export interface SearchAnalyticsSnapshot {
  schemaVersion: number
  date: string
  startDate: string
  endDate: string
  property: string
  clicks: number
  impressions: number
  ctr: number
  position: number
  rows: SearchPerformanceRow[]
  status: 'available' | 'no_data' | 'not_configured' | 'error'
  source: 'google-search-console'
  fetchedAt: string
}

export interface SeoMonitoringReport {
  timestamp: string
  site: string
  searchConsole: SearchPerformance
  indexing: IndexingMetrics
  crawl: { status: Availability; http?: HttpResult[]; notes?: string[] }
  sitemap: IndexingMetrics['sitemap'] & { status: Availability }
  cwv: CwvSummary
  alerts: import('./alerts').SeoAlert[]
  opportunities: import('./opportunities').SeoOpportunity[]
  trends?: import('./trends').SnapshotTrend
  toolInsights?: import('./analysis').ToolSeoInsight[]
  optimizationProposals?: import('./optimization').OptimizationProposal[]
}

export type TrendDirection = 'improving' | 'stable' | 'declining' | 'insufficient_history'

export interface TrendDelta {
  clicks: number | null
  impressions: number | null
  ctr: number | null
  position: number | null
}

export interface SnapshotTrend {
  current: SeoSnapshot | null
  previous: SeoSnapshot | null
  direction: TrendDirection
  delta: TrendDelta
  periodsCompared: number
  dataSource: 'historical_snapshot' | 'insufficient_history'
}

export interface PageTrend {
  url: string
  entityType: string
  slug: string
  direction: TrendDirection
  delta: TrendDelta
  currentSnap: SeoSnapshot | null
  previousSnap: SeoSnapshot | null
}

export type OptimizationStatus = 'RECOMMENDED' | 'REVIEWED' | 'APPROVED' | 'APPLIED' | 'REJECTED'

export type OptimizationField =
  | 'title'
  | 'metaDescription'
  | 'intro'
  | 'internalLinks'
  | 'faq'
  | 'schema'
  | 'canonical'
  | 'contentSection'

export interface OptimizationProposal {
  id: string
  opportunityId: string
  url: string
  field: OptimizationField
  currentValue: string
  proposedValue: string
  reason: string
  evidence: string
  status: OptimizationStatus
  createdAt: string
  reviewedAt?: string
  appliedAt?: string
}
