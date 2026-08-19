/**
 * SEO Monitoring — opportunity engine (decision support).
 * Generates recommendations ONLY from real data. Each opportunity has an
 * impact/confidence/effort model → a normalized priority. It recommends actions;
 * it NEVER auto-changes metadata.
 */

import type { DataAvailability, SearchPerformanceRow } from './types'
import { isBrandQuery } from './brandQueries'
import { splitBrandNonBrand, analyzePositionOpportunities } from './analysis'

export type OpportunityType =
  | 'POSITION_4_10'
  | 'POSITION_11_20'
  | 'HIGH_IMPRESSIONS_LOW_CTR'
  | 'ZERO_CLICK_HIGH_IMPRESSION'
  | 'BRAND_NON_BRAND_GAP'
  | 'QUERY_CANNIBALIZATION'
  | 'PAGE_QUERY_MISMATCH'
  | 'DECLINING_TRAFFIC'
  | 'DECLINING_IMPRESSIONS'
  | 'DECLINING_CTR'
  | 'DECLINING_POSITION'
  | 'CONTENT_GAP'
  | 'WEAK_INTERNAL_LINKING'
  | 'LOW_QUERY_COVERAGE'
  | 'LOW_NON_BRAND_VISIBILITY'
  | 'HIGH_IMPRESSION_LOW_CLICK'

export interface SeoOpportunity {
  type: OpportunityType
  severity: 'info' | 'warning' | 'critical'
  page: string
  query?: string
  metric: string
  value: number
  what: string
  why: string
  evidence: string
  action: string
  impact: number   // 0..1
  confidence: number // 0..1
  effort: number   // 0..1 (lower = easier)
  priority: 'High' | 'Medium' | 'Low'
  priorityTier: 'P0' | 'P1' | 'P2' | 'P3'
  writtenReason: string
}

export function priorityFrom(impact: number, confidence: number, effort: number): 'High' | 'Medium' | 'Low' {
  if (effort === 0) return 'High'
  const score = (impact * confidence) / effort
  if (score >= 0.8) return 'High'
  if (score >= 0.35) return 'Medium'
  return 'Low'
}

export function priorityTier(o: Pick<SeoOpportunity, 'type' | 'severity' | 'priority'>): 'P0' | 'P1' | 'P2' | 'P3' {
  if (o.severity === 'critical') return 'P0'
  if (o.priority === 'High') return 'P1'
  if (o.priority === 'Medium') return 'P2'
  return 'P3'
}

function rank(o: SeoOpportunity): number {
  const order = { P0: 0, P1: 1, P2: 2, P3: 3, High: 0, Medium: 1, Low: 2 }
  return order[o.priorityTier] * 1000 - Math.round(o.impact * 100)
}

/** Detect potential query cannibalization from real rows. */
function detectCannibalization(rows: SearchPerformanceRow[]): { query: string; pages: string[]; totalImpressions: number }[] {
  const byQuery = new Map<string, SearchPerformanceRow[]>()
  for (const r of rows) {
    if (!r.query || !r.page) continue
    const list = byQuery.get(r.query) || []
    list.push(r)
    byQuery.set(r.query, list)
  }
  const out: { query: string; pages: string[]; totalImpressions: number }[] = []
  for (const [query, list] of byQuery) {
    if (list.length <= 1) continue
    const pages = Array.from(new Set(list.map(r => r.page!).filter(Boolean))).slice(0, 5)
    const totalImpressions = list.reduce((a, r) => a + r.impressions, 0)
    out.push({ query, pages, totalImpressions })
  }
  return out.sort((a, b) => b.totalImpressions - a.totalImpressions).slice(0, 25)
}

/** Generate opportunities from real Search Console rows. Empty when unavailable. */
export function generateOpportunities(perf: DataAvailability<{ rows: SearchPerformanceRow[] }>, siteUrl: string): SeoOpportunity[] {
  if (perf.status !== 'available') return []
  const rows = perf.data.rows
  const out: SeoOpportunity[] = []

  // Reuse position opportunity detection from analysis.
  const posOpps = analyzePositionOpportunities(rows, 50)
  for (const p of posOpps) {
    const impact = p.impact
    const confidence = p.confidence
    const effort = p.effort
    const priority = priorityFrom(impact, confidence, effort)
    const tier = priorityTier({ type: p.type, severity: 'info', priority })
    const what = p.type === 'POSITION_4_10'
      ? `Page ranks in positions 4–10 for a query with ${Math.round(p.impressions).toLocaleString()} impressions`
      : `Page ranks in positions 11–20 for a query with ${Math.round(p.impressions).toLocaleString()} impressions`
    out.push({
      type: p.type, severity: 'info', page: p.page, metric: 'position', value: p.position,
      what,
      why: p.type === 'POSITION_4_10'
        ? 'Moving into the top 3 typically increases CTR significantly.'
        : 'Moving into the top 10 typically increases CTR and stabilizes traffic.',
      evidence: `Position ${p.position.toFixed(1)}, ${Math.round(p.impressions).toLocaleString()} impressions, CTR ${(p.ctr * 100).toFixed(2)}%`,
      action: p.type === 'POSITION_4_10'
        ? 'Strengthen title, meta description, and schema; add contextual internal links. No ranking guarantee.'
        : 'Improve content depth, intent match, and contextual internal links. No ranking guarantee.',
      impact, confidence, effort, priority, priorityTier: tier,
      writtenReason: `impact=${impact} confidence=${confidence} effort=${effort} score=${((impact * confidence) / (effort || 1)).toFixed(2)} → ${priority}`,
    })
  }

  // High impressions + low CTR.
  for (const r of rows) {
    if (r.impressions >= 500 && r.ctr < 0.02) {
      const impact = 0.6
      const confidence = 0.7
      const effort = 0.4
      const priority = priorityFrom(impact, confidence, effort)
      const tier = priorityTier({ type: 'HIGH_IMPRESSIONS_LOW_CTR', severity: 'warning', priority })
      out.push({
        type: 'HIGH_IMPRESSIONS_LOW_CTR', severity: 'warning', page: r.page ?? siteUrl, query: r.query, metric: 'ctr', value: r.ctr,
        what: `Query with high impressions (${Math.round(r.impressions).toLocaleString()}) but low CTR (${(r.ctr * 100).toFixed(2)}%)`,
        why: 'High impression count with low CTR signals weak title/meta or SERP competition.',
        evidence: `Impressions=${Math.round(r.impressions).toLocaleString()}, CTR=${(r.ctr * 100).toFixed(2)}%, position=${r.position.toFixed(1)}`,
        action: 'Review title tag and meta description for intent match; inspect SERP features; no guaranteed ranking change.',
        impact, confidence, effort, priority, priorityTier: tier,
        writtenReason: `impact=${impact} confidence=${confidence} effort=${effort} score=${((impact * confidence) / (effort || 1)).toFixed(2)} → ${priority}`,
      })
    }
  }

  // Zero-click high impression.
  for (const r of rows) {
    if (r.impressions >= 200 && r.clicks === 0) {
      const impact = 0.5
      const confidence = 0.6
      const effort = 0.4
      const priority = priorityFrom(impact, confidence, effort)
      const tier = priorityTier({ type: 'ZERO_CLICK_HIGH_IMPRESSION', severity: 'warning', priority })
      out.push({
        type: 'ZERO_CLICK_HIGH_IMPRESSION', severity: 'warning', page: r.page ?? siteUrl, query: r.query, metric: 'clicks', value: 0,
        what: `Query with ${Math.round(r.impressions).toLocaleString()} impressions and zero clicks`,
        why: 'Zero clicks on high-impression queries indicates the page is not compelling in SERP results.',
        evidence: `Impressions=${Math.round(r.impressions).toLocaleString()}, clicks=0, position=${r.position.toFixed(1)}`,
        action: 'Evaluate SERP features (FAQ, People Also Ask) and improve on-page title/description to increase click-through.',
        impact, confidence, effort, priority, priorityTier: tier,
        writtenReason: `impact=${impact} confidence=${confidence} effort=${effort} score=${((impact * confidence) / (effort || 1)).toFixed(2)} → ${priority}`,
      })
    }
  }

  // Brand vs non-brand gap.
  const { brand, nonBrand } = splitBrandNonBrand(rows)
  const brandClicks = brand.reduce((a, r) => a + r.clicks, 0)
  const nonBrandClicks = nonBrand.reduce((a, r) => a + r.clicks, 0)
  const brandImpressions = brand.reduce((a, r) => a + r.impressions, 0)
  const nonBrandImpressions = nonBrand.reduce((a, r) => a + r.impressions, 0)
  if (nonBrandImpressions > 0 && brandImpressions > 0) {
    const nonBrandCtr = nonBrandClicks / nonBrandImpressions
    const brandCtr = brandClicks / brandImpressions
    if (nonBrandCtr > 0 && brandCtr / nonBrandCtr < 0.5) {
      const impact = 0.5
      const confidence = 0.6
      const effort = 0.5
      const priority = priorityFrom(impact, confidence, effort)
      const tier = priorityTier({ type: 'BRAND_NON_BRAND_GAP', severity: 'info', priority })
      out.push({
        type: 'BRAND_NON_BRAND_GAP', severity: 'info', page: siteUrl, metric: 'ctr', value: brandCtr,
        what: `Brand CTR (${(brandCtr * 100).toFixed(2)}%) is significantly lower than non-brand CTR (${(nonBrandCtr * 100).toFixed(2)}%)`,
        why: 'Low brand CTR relative to non-brand may indicate weak brand SERP presence or competitor brand takeover.',
        evidence: `Brand: ${Math.round(brandImpressions).toLocaleString()} impressions, ${Math.round(brandClicks).toLocaleString()} clicks. Non-brand: ${Math.round(nonBrandImpressions).toLocaleString()} impressions, ${Math.round(nonBrandClicks).toLocaleString()} clicks.`,
        action: 'Review brand SERP assets (knowledge panel, sitelinks, social profiles). No guaranteed outcome.',
        impact, confidence, effort, priority, priorityTier: tier,
        writtenReason: `impact=${impact} confidence=${confidence} effort=${effort} score=${((impact * confidence) / (effort || 1)).toFixed(2)} → ${priority}`,
      })
    }
  }

  // Potential query cannibalization.
  const cannibalization = detectCannibalization(rows)
  for (const c of cannibalization.slice(0, 10)) {
    const impact = 0.4
    const confidence = 0.5
    const effort = 0.6
    const priority = priorityFrom(impact, confidence, effort)
    const tier = priorityTier({ type: 'QUERY_CANNIBALIZATION', severity: 'info', priority })
    out.push({
      type: 'QUERY_CANNIBALIZATION', severity: 'info', page: c.pages[0], query: c.query, metric: 'impressions', value: c.totalImpressions,
      what: `Query "${c.query}" appears to drive impressions across ${c.pages.length} pages`,
      why: 'Multiple pages ranking for the same query may split authority and confuse search intent.',
      evidence: `Pages: ${c.pages.join(', ')}. Total impressions: ${Math.round(c.totalImpressions).toLocaleString()}.`,
      action: 'Flag for manual review. Consider consolidating content or clarifying page purpose. No auto-redirect.',
      impact, confidence, effort, priority, priorityTier: tier,
      writtenReason: `impact=${impact} confidence=${confidence} effort=${effort} score=${((impact * confidence) / (effort || 1)).toFixed(2)} → ${priority}`,
    })
  }

  return out.sort((a, b) => rank(a) - rank(b)).slice(0, 50)
}
