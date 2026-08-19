/**
 * Search Insights — anonymous, privacy-safe on-site search analytics.
 * Tracks only normalized query + result counts (no PII, no raw IP, no identities),
 * via the existing analytics layer. Aggregates zero-result + trend signals.
 */

import { analyticsApi } from '@/analytics'

export interface SearchSignal {
  query: string
  normalized: string
  resultCount: number
  zeroResults: boolean
  category?: string
}

export function normalizeQuery(q: string): string {
  return q.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

/** Emit a privacy-safe search signal (no-op when analytics disabled). */
export function trackSearchSignal(signal: SearchSignal): void {
  const q = normalizeQuery(signal.query)
  if (!q) return
  analyticsApi.trackEvent('search_signal', {
    q: q.slice(0, 60),
    results: signal.resultCount,
    zero: signal.zeroResults ? 1 : 0,
    category: signal.category?.slice(0, 40),
  })
}

/** Detect zero-result searches (surfaces content/discovery gaps). */
export function trackZeroResult(query: string, category?: string): void {
  trackSearchSignal({ query, normalized: normalizeQuery(query), resultCount: 0, zeroResults: true, category })
}

/** Privacy-safe local trend accumulator (session-scoped, no persistence). */
export class QueryTrendTracker {
  private counts = new Map<string, number>()
  record(query: string): void {
    const q = normalizeQuery(query)
    if (!q) return
    this.counts.set(q, (this.counts.get(q) ?? 0) + 1)
  }
  top(n = 20): Array<{ query: string; count: number }> {
    return Array.from(this.counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, n).map(([query, count]) => ({ query, count }))
  }
  zeroResults(queries: string[]): string[] {
    return queries.filter(q => !this.counts.has(normalizeQuery(q)))
  }
  clear(): void { this.counts.clear() }
}