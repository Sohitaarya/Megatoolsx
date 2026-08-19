/**
 * Discovery — public surface.
 */
// Catalog / entities
export { catalog, buildCatalog, invalidateCatalog, toToolNode } from './entities/catalog'
export type { Catalog, ToolNode, CategoryNode, EntityKind } from './entities/catalog'
// Similarity
export { similarity } from './similarity/content'
export type { SimilarityResult } from './similarity/content'
// Knowledge graph
export { EntityGraph, entityGraph } from './knowledge/entityGraph'
export type { GraphNode, GraphEdge } from './knowledge/entityGraph'
// Ranking
export { vector, blend, rankScored, type ScoreVector, type ScoredRecommendation } from './ranking/scores'
// Intent
export { detectIntent, type Intent } from './intent/detect'
// Personalization
export { readSignals, emptySignals, type UserSignals } from './personalization/signals'
// Central engine + collections
export { discoveryEngine, type CollectionDef } from './engine/DiscoveryEngine'
export { DiscoveryEngine } from './engine/DiscoveryEngine'
// Hooks
export { useRecommendations, useCategoryTools, useCollection, useTrackDiscoveryClick, useSignals } from './hooks/useDiscovery'
// Widgets
export { WIDGET_DEFS, WIDGET_IDS, type WidgetId, type WidgetDef } from './widgets/definitions'
export { DiscoveryWidget } from './widgets/DiscoveryWidget'
// Recommendation service (backward-compatible path)
export {
  recommendForTool, recommendForCategory, relatedCategories, trendingTools, popular, newReleases,
} from './recommendation/service'
export { rankRecommendation, rankRecommendations, type Recommendation, type RelationshipType } from './ranking/ranker'
// Analytics + workers
export { discoveryAnalytics } from './analytics/events'
export { createDiscoveryWorker, type DiscoveryIndexMessage, type DiscoveryIndexReply } from './workers/worker'