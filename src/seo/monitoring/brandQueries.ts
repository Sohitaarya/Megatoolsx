/**
 * SEO Monitoring — branded search classification.
 * Classifies queries into brand / non-brand and summarizes brand performance.
 * ONLY reports rows Search Console actually returns — never fabricates a ranking.
 */

import type { SearchPerformanceRow } from './types'

const BRAND_TERMS = ['megatoolsx', 'megatool', 'mega tool', 'mega tools', 'megatools', 'megatoolsx tools', 'megar tool']

export function isBrandQuery(query: string): boolean {
  const q = query.toLowerCase().trim()
  return BRAND_TERMS.some(t => q === t || q.startsWith(t + ' ') || q.startsWith(t + '-'))
}

export interface BrandPerformance {
  rows: SearchPerformanceRow[]
  clicks: number
  impressions: number
  ctr: number
  position: number
}

/** Summarize brand performance from real rows (empty when no brand rows). */
export function summarizeBrandQueries(rows: SearchPerformanceRow[]): BrandPerformance | null {
  const brand = rows.filter(r => r.query && isBrandQuery(r.query))
  if (!brand.length) return null
  const clicks = brand.reduce((a, r) => a + r.clicks, 0)
  const impressions = brand.reduce((a, r) => a + r.impressions, 0)
  return {
    rows: brand,
    clicks,
    impressions,
    ctr: impressions > 0 ? clicks / impressions : 0,
    position: brand.length ? brand.reduce((a, r) => a + r.position, 0) / brand.length : 0,
  }
}