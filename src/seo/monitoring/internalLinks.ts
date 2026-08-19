/**
 * SEO Monitoring — internal link opportunity detection.
 * Reuses the existing internal-link graph. Flags pages with real impressions
 * but weak inbound link counts. Does not create link farms.
 */

import type { SearchPerformanceRow } from './types'
import { matchPageToEntity, type PageEntity } from './analysis'

export interface InternalLinkOpportunity {
  page: string
  entityType: string
  slug: string
  impressions: number
  clicks: number
  position: number
  inboundLinkCount: number
  recommendedLinks: number
  confidence: number
  impact: number
  effort: number
  priority: 'High' | 'Medium' | 'Low'
  priorityTier: 'P0' | 'P1' | 'P2' | 'P3'
  writtenReason: string
  action: string
}

export function scoreOpportunity(impact: number, confidence: number, effort: number): 'High' | 'Medium' | 'Low' {
  if (effort === 0) return 'High'
  const score = (impact * confidence) / effort
  if (score >= 0.8) return 'High'
  if (score >= 0.35) return 'Medium'
  return 'Low'
}

export function scoreToPriorityTier(priority: 'High' | 'Medium' | 'Low'): 'P0' | 'P1' | 'P2' | 'P3' {
  if (priority === 'High') return 'P1'
  if (priority === 'Medium') return 'P2'
  return 'P3'
}

export function detectInternalLinkOpportunities(
  rows: SearchPerformanceRow[],
  getInboundCount: (url: string) => number = () => 0,
  opts: { minImpressions?: number; maxInbound?: number; maxResults?: number } = {}
): InternalLinkOpportunity[] {
  const minImpressions = opts.minImpressions ?? 100
  const maxInbound = opts.maxInbound ?? 3
  const maxResults = opts.maxResults ?? 25

  const byPage = new Map<string, SearchPerformanceRow[]>()
  for (const r of rows) {
    if (!r.page) continue
    const list = byPage.get(r.page) || []
    list.push(r)
    byPage.set(r.page, list)
  }

  const out: InternalLinkOpportunity[] = []
  for (const [page, list] of byPage) {
    const impressions = list.reduce((a, r) => a + r.impressions, 0)
    const clicks = list.reduce((a, r) => a + r.clicks, 0)
    const position = list.length ? list.reduce((a, r) => a + r.position, 0) / list.length : 0
    if (impressions < minImpressions) continue

    const entity: PageEntity = matchPageToEntity(page)
    const inboundCount = getInboundCount(page)
    if (inboundCount > maxInbound) continue

    const impact = 0.4
    const confidence = Math.min(0.9, 0.4 + (inboundCount === 0 ? 0.3 : 0.1) + (impressions >= 500 ? 0.2 : 0))
    const effort = 0.4
    const priority = scoreOpportunity(impact, confidence, effort)
    const tier = scoreToPriorityTier(priority)
    const recommended = Math.min(5, Math.max(2, Math.ceil((maxInbound - inboundCount) / 2)))

    out.push({
      page,
      entityType: entity.type,
      slug: entity.slug ?? page,
      impressions,
      clicks,
      position,
      inboundLinkCount: inboundCount,
      recommendedLinks: recommended,
      confidence,
      impact,
      effort,
      priority,
      priorityTier: tier,
      writtenReason: `impact=${impact} confidence=${confidence.toFixed(2)} effort=${effort} score=${((impact * confidence) / effort).toFixed(2)} → ${priority}`,
      action: `Add ${recommended} contextual internal links from related ${entity.type} pages. Do not create irrelevant links.`,
    })
  }

  return out.sort((a, b) => b.impressions - a.impressions).slice(0, maxResults)
}
