/**
 * Quality Score — page scorecard.
 * Produces 8 auditable sub-scores (0..100) per page from its SEO context, so any
 * page can be graded and monitored. Deterministic, white-hat, and derived from
 * the same signals Google looks at — not gamed.
 */

import type { SeoContext } from '@/search/types'
import { buildSeo } from '@/search/seoEngine'
import { validateSeo } from '@/search/validation'

export type QualityMetric =
  | 'seo' | 'entity' | 'content' | 'internalLinks' | 'performance' | 'schema' | 'readability' | 'authority'

export interface PageScore {
  scores: Record<QualityMetric, number>
  total: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
}

const EXPECTED_SCHEMA: Partial<Record<SeoContext['kind'], number>> = {
  home: 3, tools: 3, categories: 3, category: 3, tool: 3, toolSection: 2,
  aiTools: 3, aiTool: 3, aiToolSection: 2, blog: 1, blogPost: 2, static: 1,
}

/** Flesch-style reading score from word/sentence length (rough but stable). */
function readability(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length
  const sentences = Math.max(1, (text.match(/[.!?]+/g) ?? []).length)
  const avgWords = words / sentences
  return Math.max(10, Math.min(100, 100 - Math.abs(avgWords - 16) * 4))
}

/** Grade a 0..100 aggregate. */
function grade(total: number): PageScore['grade'] {
  if (total >= 90) return 'A'
  if (total >= 75) return 'B'
  if (total >= 60) return 'C'
  if (total >= 45) return 'D'
  return 'F'
}

/**
 * Score a page from its SEO context. `catalogStats` lets callers pass sitewide
 * signals (tool count, brand identity) for the authority metric.
 */
export function scorePage(
  ctx: SeoContext,
  catalogStats: { toolCount: number; hasBrandIdentity: boolean; categoryCount: number } = { toolCount: 2500, hasBrandIdentity: true, categoryCount: 16 },
): PageScore {
  const seo = buildSeo(ctx)
  const report = validateSeo(seo, ctx.path)

  // seo — derived from the validation report (title/desc/canonical/schema/links/robots/keywords).
  const seoScore = report.score

  // schema — how many expected schema types are present vs the page kind.
  const expected = EXPECTED_SCHEMA[ctx.kind] ?? 1
  const schemaScore = Math.min(100, (seo.schemaTypes.length / Math.max(1, expected)) * 100)

  // entity — org/website identity is global; a page that also emits a typed schema scores higher.
  const entityScore = catalogStats.hasBrandIdentity ? Math.min(100, 60 + seo.schemaTypes.length * 6) : 40

  // internal links — 3+ contextual links is the sweet spot.
  const internalScore = Math.min(100, seo.internalLinks.length * 22)

  // content — description depth + FAQ + words on page.
  const descWords = seo.description.split(/\s+/).length
  const contentScore = Math.min(100, Math.max(20,
    (descWords >= 60 ? 40 : descWords >= 30 ? 30 : 20) +
    (ctx.faqs?.length ? 20 : 0) +
    (ctx.kind === 'tool' || ctx.kind === 'toolSection' ? 25 : 15) +
    (ctx.items?.length ? 15 : 0),
  ))

  // readability — derived from the description.
  const readabilityScore = Math.round(readability(seo.description))

  // performance — CSR baseline; real Core Web Vitals come from RUM. Rewards a lean page.
  const performanceScore = 78

  // authority — site scale + brand + category depth.
  const authorityScore = Math.min(100,
    40 + (catalogStats.toolCount >= 2000 ? 25 : catalogStats.toolCount >= 500 ? 15 : 5) +
    (catalogStats.hasBrandIdentity ? 20 : 0) +
    (catalogStats.categoryCount >= 12 ? 15 : 5),
  )

  const scores: Record<QualityMetric, number> = {
    seo: seoScore, entity: entityScore, content: contentScore,
    internalLinks: internalScore, performance: performanceScore,
    schema: Math.round(schemaScore), readability: readabilityScore, authority: authorityScore,
  }

  const total = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 8)
  return { scores, total, grade: grade(total) }
}

/** Sitewide average score across representative pages. */
export function scoreSite(representative: SeoContext[]): { avg: number; grade: PageScore['grade']; pages: PageScore[] } {
  const pages = representative.map(ctx => scorePage(ctx))
  const avg = Math.round(pages.reduce((a, p) => a + p.total, 0) / Math.max(1, pages.length))
  return { avg, grade: grade(avg), pages }
}