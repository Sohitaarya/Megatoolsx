/**
 * Discovery — recommendations (backward-compatible surface).
 * Re-exports the recommendation service + ranked types.
 */
export {
  recommendForTool, recommendForCategory, relatedCategories, trendingTools, popular, newReleases,
} from '../recommendation/service'
export type { Recommendation } from '../ranking/ranker'