/**
 * Discovery — recommendation analytics.
 * Tracks recommendation clicks and discovery paths through the analytics layer.
 */

import { analyticsApi } from '@/analytics'

export const discoveryAnalytics = {
  /** A recommended item was clicked from a discovery block. */
  recommendationClicked(block: string, from: string, to: string, relationshipType: string): void {
    analyticsApi.trackEvent('recommendation_clicked', { block, from, to, relationshipType })
  },

  /** A discovery-path navigation (category → tool, tool → related, etc.). */
  path(from: string, to: string, kind: 'category_to_tool' | 'tool_to_related' | 'tool_to_alternative' | 'tool_to_category'): void {
    analyticsApi.trackEvent('discovery_path', { from, to, kind })
  },

  /** Category hub seen (for category-flow analysis). */
  categoryViewed(category: string): void {
    analyticsApi.trackEvent('category_viewed', { category })
  },
}