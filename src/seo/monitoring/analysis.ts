/**
 * SEO Analysis — turns normalized Search Console rows into actionable insight.
 * Page→entity matching, per-tool intelligence, brand/non-brand split, and
 * conservative position-opportunity flags. Only real rows are analyzed; no data
 * is fabricated.
 */

import { getToolUrl } from '@/seo/indexing/toolSlug'
import { isBrandQuery } from './brandQueries'
import type { SearchPerformanceRow } from './types'

export type PageEntityType = 'tool' | 'category' | 'collection' | 'ai' | 'static' | 'blog' | 'unknown'

export interface PageEntity {
  type: PageEntityType
  slug?: string
}

/** Match a Search Console page URL to a platform entity (canonical route = key). */
export function matchPageToEntity(pageUrl: string): PageEntity {
  const raw = pageUrl.replace(/^https:\/\/megatoolsx\.com/, '').split('?')[0]
  const path = raw.replace(/\/+$/, '') || '/'
  if (/^\/tools\/[^/]+$/.test(path)) return { type: 'tool', slug: path.replace('/tools/', '') }
  if (/^\/category\/[^/]+$/.test(path)) return { type: 'category', slug: path.replace('/category/', '') }
  if (/^\/collections\/[^/]+$/.test(path)) return { type: 'collection', slug: path.replace('/collections/', '') }
  if (/^\/ai-tools\/[^/]+$/.test(path)) return { type: 'ai', slug: path.replace('/ai-tools/', '') }
  if (/^\/blog(\/.*)?$/.test(path)) return { type: 'blog', slug: path === '/blog' ? undefined : path.replace('/blog/', '') }
  if (['/', '/tools', '/categories', '/collections', '/about', '/contact', '/privacy', '/terms'].includes(path)) return { type: 'static' }
  return { type: 'unknown' }
}

export interface ToolSeoInsight {
  slug: string
  page: string
  clicks: number
  impressions: number
  ctr: number
  position: number
  topQueries: string[]
  brandClicks: number
  nonBrandClicks: number
  dataAvailability: 'available' | 'no_data'
}

/** Per-tool SEO intelligence from real rows. */
export function buildToolSeoInsight(rows: SearchPerformanceRow[], limit = 20): ToolSeoInsight[] {
  const bySlug = new Map<string, SearchPerformanceRow[]>()
  for (const r of rows) {
    if (!r.page) continue
    const entity = matchPageToEntity(r.page)
    if (entity.type !== 'tool' || !entity.slug) continue
    const list = bySlug.get(entity.slug) ?? []
    list.push(r)
    bySlug.set(entity.slug, list)
  }
  const out: ToolSeoInsight[] = []
  for (const [slug, list] of bySlug) {
    const clicks = list.reduce((a, r) => a + r.clicks, 0)
    const impressions = list.reduce((a, r) => a + r.impressions, 0)
    const weighted = impressions > 0 ? clicks / impressions : 0
    const position = list.length ? list.reduce((a, r) => a + r.position, 0) / list.length : 0
    const brandClicks = list.filter(r => r.query && isBrandQuery(r.query)).reduce((a, r) => a + r.clicks, 0)
    out.push({
      slug,
      page: getToolUrl(slug),
      clicks,
      impressions,
      ctr: weighted,
      position,
      topQueries: list.sort((a, b) => b.impressions - a.impressions).slice(0, 5).map(r => r.query ?? '').filter(Boolean),
      brandClicks,
      nonBrandClicks: clicks - brandClicks,
      dataAvailability: impressions > 0 || clicks > 0 ? 'available' : 'no_data',
    })
  }
  return out.sort((a, b) => b.impressions - a.impressions).slice(0, limit)
}

export interface BrandSplit { brand: SearchPerformanceRow[]; nonBrand: SearchPerformanceRow[] }

/** Split real rows into brand vs non-brand (only what Google returned). */
export function splitBrandNonBrand(rows: SearchPerformanceRow[]): BrandSplit {
  return {
    brand: rows.filter(r => r.query && isBrandQuery(r.query)),
    nonBrand: rows.filter(r => !r.query || !isBrandQuery(r.query)),
  }
}

export type PositionOpportunityType = 'POSITION_4_10' | 'POSITION_11_20' | 'HIGH_IMPRESSIONS_LOW_CTR'

export interface PositionOpportunity {
  type: PositionOpportunityType
  page: string
  position: number
  impressions: number
  ctr: number
  impact: number
  confidence: number
  effort: number
}

/** Conservative position/CTR opportunity flags from real rows. */
export function analyzePositionOpportunities(rows: SearchPerformanceRow[], minImpressions = 50): PositionOpportunity[] {
  const out: PositionOpportunity[] = []
  for (const r of rows) {
    if (r.impressions < minImpressions) continue
    const page = r.page ?? ''
    if (r.position >= 4 && r.position <= 10) {
      out.push({ type: 'POSITION_4_10', page, position: r.position, impressions: r.impressions, ctr: r.ctr, impact: 0.8, confidence: 0.6, effort: 0.5 })
    } else if (r.position >= 11 && r.position <= 20) {
      out.push({ type: 'POSITION_11_20', page, position: r.position, impressions: r.impressions, ctr: r.ctr, impact: 0.7, confidence: 0.5, effort: 0.5 })
    }
    if (r.impressions >= 500 && r.ctr < 0.02) {
      out.push({ type: 'HIGH_IMPRESSIONS_LOW_CTR', page, position: r.position, impressions: r.impressions, ctr: r.ctr, impact: 0.6, confidence: 0.7, effort: 0.4 })
    }
  }
  return out.sort((a, b) => b.impact - a.impact).slice(0, 50)
}