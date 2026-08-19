/**
 * SEO Monitoring — public surface.
 */
export { clientConfig, serverConfig, hasSearchConsoleCredentials, validateMonitoringConfig, resolveGscProperty, type ConfigHealth } from './config'
export type { SeoMonitoringConfig } from './config'
export { useReportWebVitals } from './cwv'
export { runLiveHttpCheck, checkUrl, summarizeHttp, REPRESENTATIVE_URLS } from './liveHttp'
export { buildSeoReport, type ReportInput } from './reports'
export { resolveSnapshotStore, InMemorySnapshotStore, CloudflareKVSnapshotStore, CloudflareD1SnapshotStore, emptySnapshot, snapshotKey, SNAPSHOT_SCHEMA_VERSION, type SnapshotStore, type SnapshotRecord, type KvBinding, type D1Binding } from './history'
export { buildAlerts, DEFAULT_THRESHOLDS, type AlertType, type AlertSeverity, type AlertThresholds, type SeoAlert } from './alerts'
export { generateOpportunities, priorityFrom, priorityTier, type SeoOpportunity, type OpportunityType } from './opportunities'
export { resolveSearchConsoleConfig, fetchSearchAnalytics, normalizeSearchAnalytics, buildSearchConsoleReport, aggregatePerformance, classifyGscError, type SearchConsoleConfig, type NormalizedSearchAnalytics, type GscErrorCategory, type BuildReportOptions } from './searchConsole'
export { isBrandQuery, summarizeBrandQueries, type BrandPerformance } from './brandQueries'
// analysis
export { matchPageToEntity, buildToolSeoInsight, splitBrandNonBrand, analyzePositionOpportunities, type PageEntity, type PageEntityType, type ToolSeoInsight, type BrandSplit, type PositionOpportunity, type PositionOpportunityType } from './analysis'
// content engine
export { buildToolContent, toolHowToSteps } from '@/seo/content/toolContent'
// Phase 3.16
export { analyzeTrends, type SnapshotTrend, type PageTrend, type TrendDirection, type TrendDelta } from './trends'
export { scoreOpportunity, scoreToPriority, scoreToPriorityTier, type ScoredOpportunity, type PriorityTier } from './scoring'
export { detectQueryPageMismatches, detectQueryPageMismatchesSync, type QueryPageMismatch, type IntentCategory } from './queryMismatch'
export { detectContentGaps, detectContentGapsSync, type ContentGap } from './contentGaps'
export { detectInternalLinkOpportunities, type InternalLinkOpportunity } from './internalLinks'
export { createProposal, getProposal, listProposals, updateProposalStatus, rollbackProposal, clearProposals, type OptimizationProposal, type OptimizationStatus, type OptimizationField } from './optimization'
export { validateOptimizationProposal, validateSlugPreservation, validateSitemapInclusion, validateCanonicalMatch, type InvariantResult, type ChangeSafetyContext } from './changeSafety'
export { verifyGscConnection, type GscConnectionResult } from './config'
export { buildAllOpportunities, type OrchestratorInput, type OrchestratorResult } from './orchestrator'
export type {
  Availability, DataAvailability, SearchPerformance, SearchPerformanceRow, IndexingMetrics, IndexingStates,
  CwvSample, CwvSummary, HttpResult, SeoSnapshot, SeoMonitoringReport, SearchConsoleStatus,
} from './types'