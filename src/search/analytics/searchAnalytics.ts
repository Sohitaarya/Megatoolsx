/**
 * Search — analytics.
 * Typed search funnel events forwarded to the analytics layer (GA4 or future
 * providers). No-op when analytics is disabled.
 */

import { analyticsApi } from '@/analytics'

export const searchAnalytics = {
  /** User started typing a query. */
  started(query: string): void {
    analyticsApi.trackSearch({ query: query.slice(0, 60), action: 'submit' })
  },

  /** User picked an autocomplete suggestion. */
  suggestionSelected(query: string, suggestion: string): void {
    analyticsApi.trackSearch({ query: query.slice(0, 60), action: 'suggestion_click' })
    analyticsApi.trackEvent('search_suggestion_selected', { query: query.slice(0, 60), suggestion: suggestion.slice(0, 60) })
  },

  /** User clicked / opened a result. */
  resultClicked(query: string, tool: string, source: 'csv' | 'ai'): void {
    analyticsApi.trackEvent('search_result_clicked', { query: query.slice(0, 60), tool, source })
  },

  /** Zero results returned for a query. */
  noResults(query: string): void {
    analyticsApi.trackSearch({ query: query.slice(0, 60), action: 'no_results' })
  },

  /** A category/filter was applied. */
  filterApplied(filter: string, query: string): void {
    analyticsApi.trackEvent('search_filter_applied', { filter, query: query.slice(0, 60) })
  },

  /** Timing for how long a search interaction took (ms). */
  durationMs(query: string, ms: number): void {
    analyticsApi.trackEvent('search_duration', { query: query.slice(0, 60), ms: Math.round(ms) })
  },
}
