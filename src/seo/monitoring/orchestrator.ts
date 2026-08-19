/**
 * SEO Monitoring — opportunity orchestrator.
 * Coordinates all opportunity detectors into a single pass.
 * Reuses existing engines; does not duplicate logic.
 */

import type { SearchPerformanceRow } from './types'
import { generateOpportunities, type SeoOpportunity } from './opportunities'
import { analyzeTrends } from './trends'
import { detectQueryPageMismatchesSync } from './queryMismatch'
import { detectContentGapsSync } from './contentGaps'
import { detectInternalLinkOpportunities } from './internalLinks'
import { scoreOpportunity } from './scoring'
import { splitBrandNonBrand } from './analysis'
import { buildToolSeoInsight } from './analysis'

export interface OrchestratorInput {
  rows: SearchPerformanceRow[]
  siteUrl: string
  history?: import('./types').SeoSnapshot[]
  getInboundCount?: (url: string) => number
}

export interface OrchestratorResult {
  opportunities: SeoOpportunity[]
  trends: ReturnType<typeof analyzeTrends>
  toolInsights: ReturnType<typeof buildToolSeoInsight>
}

export async function buildAllOpportunities(input: OrchestratorInput): Promise<OrchestratorResult> {
  const { rows, siteUrl, history = [], getInboundCount } = input

  // Base opportunities from rows.
  const base = generateOpportunities({ status: 'available', data: { rows } }, siteUrl)

  // Trends.
  const trends = analyzeTrends(history)

  // Tool insights.
  const toolInsights = buildToolSeoInsight(rows)

  // Declining opportunities from trends.
  const decliningOpps: SeoOpportunity[] = []
  for (const et of trends.byEntity) {
    if (et.direction !== 'declining') continue
    const d = et.delta
    const score = scoreOpportunity({
      impressions: et.currentSnap?.impressions ?? 0,
      clicks: et.currentSnap?.clicks ?? 0,
      ctr: et.currentSnap?.ctr ?? 0,
      position: et.currentSnap?.position ?? 0,
      trendDirection: 'declining',
      pageType: et.entityType,
    })

    if (d.clicks !== null && d.clicks < -20) {
      decliningOpps.push({
        type: 'DECLINING_TRAFFIC', severity: 'warning', page: et.url, metric: 'clicks', value: d.clicks,
        what: `Traffic declining for ${et.slug}`,
        why: 'Click volume has dropped compared to the previous period.',
        evidence: `Click delta: ${d.clicks.toFixed(1)}%. Impression delta: ${d.impressions?.toFixed(1) ?? 'N/A'}%. CTR delta: ${d.ctr?.toFixed(1) ?? 'N/A'}%. Position delta: ${d.position?.toFixed(1) ?? 'N/A'}%.`,
        action: 'Review recent content changes, SERP features, and competitor activity. No guaranteed recovery.',
        ...score,
      })
    }
    if (d.impressions !== null && d.impressions < -20) {
      decliningOpps.push({
        type: 'DECLINING_IMPRESSIONS', severity: 'warning', page: et.url, metric: 'impressions', value: d.impressions,
        what: `Impressions declining for ${et.slug}`,
        why: 'Search visibility has decreased compared to the previous period.',
        evidence: `Impression delta: ${d.impressions.toFixed(1)}%. Click delta: ${d.clicks?.toFixed(1) ?? 'N/A'}%.`,
        action: 'Check ranking changes, search demand shifts, and index coverage. No guaranteed recovery.',
        ...scoreOpportunity({ impressions: Math.abs(d.impressions), clicks: 0, ctr: 0, position: 0, trendDirection: 'declining', pageType: et.entityType }),
      })
    }
    if (d.ctr !== null && d.ctr < -20) {
      decliningOpps.push({
        type: 'DECLINING_CTR', severity: 'warning', page: et.url, metric: 'ctr', value: d.ctr,
        what: `CTR declining for ${et.slug}`,
        why: 'Click-through rate has fallen despite maintained or increased impressions.',
        evidence: `CTR delta: ${d.ctr.toFixed(1)}%. Position delta: ${d.position?.toFixed(1) ?? 'N/A'}%.`,
        action: 'Review title tag, meta description, and SERP competition. No guaranteed improvement.',
        ...scoreOpportunity({ impressions: 0, clicks: 0, ctr: Math.abs(d.ctr) / 100, position: 0, trendDirection: 'declining', pageType: et.entityType }),
      })
    }
    if (d.position !== null && d.position > 3) {
      decliningOpps.push({
        type: 'DECLINING_POSITION', severity: 'info', page: et.url, metric: 'position', value: d.position,
        what: `Position declining for ${et.slug}`,
        why: 'Average ranking position has worsened.',
        evidence: `Position delta: +${d.position.toFixed(1)} (higher = worse).`,
        action: 'Improve content depth, internal links, and topical relevance. No guaranteed ranking change.',
        ...scoreOpportunity({ impressions: 0, clicks: 0, ctr: 0, position: 0, trendDirection: 'declining', pageType: et.entityType }),
      })
    }
  }

  // Query/page mismatches.
  const mismatches = detectQueryPageMismatchesSync(rows)
  const mismatchOpps: SeoOpportunity[] = mismatches.map(m => {
    const score = scoreOpportunity({ impressions: m.impressions, clicks: m.clicks, ctr: m.clicks / Math.max(1, m.impressions), position: m.position, pageType: m.entityType })
    return {
      type: 'PAGE_QUERY_MISMATCH', severity: 'info', page: m.page, query: m.query, metric: 'intent', value: m.confidence,
      what: `Query intent (${m.queryIntent}) may not align with page type (${m.pageIntent})`,
      why: 'A mismatch between search intent and page content can reduce CTR and satisfaction.',
      evidence: `Query: "${m.query}". Page: ${m.page}. Confidence: ${(m.confidence * 100).toFixed(0)}%.`,
      action: 'Review whether the page should address this query intent or if a dedicated page is warranted. No automatic changes.',
      ...score,
    }
  })

  // Content gaps.
  const gaps = detectContentGapsSync(rows)
  const gapOpps: SeoOpportunity[] = gaps.map(g => {
    const score = scoreOpportunity({ impressions: g.impressions, clicks: g.clicks, ctr: g.clicks / Math.max(1, g.impressions), position: g.position, pageType: g.entityType })
    return {
      type: 'CONTENT_GAP', severity: 'info', page: g.page, query: g.query, metric: 'content', value: g.missingSections.length,
      what: `Content may be missing sections relevant to "${g.query}"`,
      why: 'Gaps in content coverage can reduce relevance for specific queries.',
      evidence: `Missing: ${g.missingSections.join(', ')}. Impressions: ${g.impressions.toLocaleString()}.`,
      action: `Consider adding content for: ${g.missingSections.join(', ')}. Do not add keyword-stuffed filler.`,
      ...score,
    }
  })

  // Internal link opportunities.
  const linkOpps = detectInternalLinkOpportunities(rows, getInboundCount)
  const linkingOpps: SeoOpportunity[] = linkOpps.map(l => ({
    type: 'WEAK_INTERNAL_LINKING', severity: 'info', page: l.page, metric: 'internalLinks', value: l.inboundLinkCount,
    what: `Page has ${l.inboundLinkCount} inbound links but receives ${l.impressions.toLocaleString()} impressions`,
    why: 'Pages with traffic but weak internal linking may be missing contextual authority signals.',
    evidence: `Inbound links: ${l.inboundLinkCount}. Recommended: ${l.recommendedLinks} more.`,
    action: l.action,
    impact: l.impact, confidence: l.confidence, effort: l.effort, priority: l.priority, priorityTier: l.priorityTier,
    writtenReason: l.writtenReason,
  }))

  // Low non-brand visibility.
  const { nonBrand } = splitBrandNonBrand(rows)
  const nonBrandClicks = nonBrand.reduce((a, r) => a + r.clicks, 0)
  const nonBrandImpressions = nonBrand.reduce((a, r) => a + r.impressions, 0)
  const lowNonBrandOpps: SeoOpportunity[] = []
  if (nonBrandImpressions > 0) {
    const nonBrandCtr = nonBrandClicks / nonBrandImpressions
    if (nonBrandCtr < 0.02) {
      const score = scoreOpportunity({ impressions: nonBrandImpressions, clicks: nonBrandClicks, ctr: nonBrandCtr, position: 0, pageType: 'site' })
      lowNonBrandOpps.push({
        type: 'LOW_NON_BRAND_VISIBILITY', severity: 'warning', page: siteUrl, metric: 'ctr', value: nonBrandCtr,
        what: `Non-brand CTR is ${(nonBrandCtr * 100).toFixed(2)}% — below typical thresholds`,
        why: 'Low non-brand CTR suggests generic titles/descriptions or strong SERP competition.',
        evidence: `Non-brand: ${nonBrandImpressions.toLocaleString()} impressions, ${nonBrandClicks.toLocaleString()} clicks.`,
        action: 'Improve title/meta differentiation for non-brand queries. Review SERP features and competitors.',
        ...score,
      })
    }
  }

  // High impression low click (dedicated type alias).
  const highImpLowClickOpps: SeoOpportunity[] = []
  for (const r of rows) {
    if (r.impressions >= 500 && r.clicks === 0) {
      const score = scoreOpportunity({ impressions: r.impressions, clicks: 0, ctr: 0, position: r.position, pageType: 'tool' })
      highImpLowClickOpps.push({
        type: 'HIGH_IMPRESSION_LOW_CLICK', severity: 'warning', page: r.page ?? siteUrl, query: r.query, metric: 'clicks', value: 0,
        what: `Query has ${r.impressions.toLocaleString()} impressions but zero clicks`,
        why: 'Zero clicks on high-impression queries indicates weak SERP appeal.',
        evidence: `Impressions: ${r.impressions.toLocaleString()}, clicks: 0, position: ${r.position.toFixed(1)}.`,
        action: 'Evaluate SERP features and improve title/description relevance. No guaranteed outcome.',
        ...score,
      })
    }
  }

  const combined = [
    ...base,
    ...decliningOpps,
    ...mismatchOpps,
    ...gapOpps,
    ...linkingOpps,
    ...lowNonBrandOpps,
    ...highImpLowClickOpps,
  ]

  const ranked = combined.sort((a, b) => {
    const order = { P0: 0, P1: 1, P2: 2, P3: 3, High: 0, Medium: 1, Low: 2 }
    return (order[a.priorityTier] ?? 3) - (order[b.priorityTier] ?? 3) || b.impact - a.impact
  })

  return {
    opportunities: ranked.slice(0, 100),
    trends,
    toolInsights,
  }
}
