/**
 * SEO Monitoring — content gap detection.
 * Identifies queries for which the current page content appears insufficient.
 * Reuses existing family-aware content engine. Does not generate keyword-stuffed filler.
 */

import type { SearchPerformanceRow } from './types'
import { matchPageToEntity, type PageEntity } from './analysis'
import { buildToolContent } from '@/seo/content/toolContent'
import type { CsvTool } from '@/data/csvData'
import { loadTools } from '@/data/csvData'

export interface ContentGap {
  query: string
  page: string
  entityType: string
  slug: string
  currentSections: string[]
  missingSections: string[]
  impressions: number
  clicks: number
  position: number
  confidence: number
}

const ALL_SECTIONS = [
  'intro', 'purpose', 'howItWorks', 'features', 'useCases', 'steps',
  'limitations', 'privacy', 'faq',
]

let toolsCache: CsvTool[] | null = null
let toolsPromise: Promise<CsvTool[]> | null = null

async function getTools(): Promise<CsvTool[]> {
  if (toolsCache) return toolsCache
  if (toolsPromise) return toolsPromise
  toolsPromise = loadTools().then(t => { toolsCache = t; return t }).catch(() => [])
  return toolsPromise
}

function findToolBySlug(slug: string): CsvTool | undefined {
  const tools = toolsCache ?? []
  return tools.find(t => t.slug === slug)
}

function queryMentionsSection(query: string, section: string): boolean {
  const q = query.toLowerCase()
  const s = section.toLowerCase()
  if (s === 'faq' && /\b(how|what|why|can|does|is|are)\b/.test(q)) return true
  if (s === 'steps' && /\b(how to|step|tutorial|guide|process)\b/.test(q)) return true
  if (s === 'features' && /\b(feature|capability|function|does)\b/.test(q)) return true
  if (s === 'limitations' && /\b(limit|downside|drawback|issue|problem|risk)\b/.test(q)) return true
  if (s === 'privacy' && /\b(privacy|secure|safe|data|upload|server)\b/.test(q)) return true
  if (s === 'useCases' && /\b(use case|example|application|scenario)\b/.test(q)) return true
  if (s === 'comparison' && /\b(vs|versus|compare|alternative|difference)\b/.test(q)) return true
  if (s === 'pricing' && /\b(price|cost|free|pricing|plan|subscription)\b/.test(q)) return true
  return false
}

export async function detectContentGaps(rows: SearchPerformanceRow[]): Promise<ContentGap[]> {
  const _tools = await getTools()
  const gaps: ContentGap[] = []

  for (const r of rows) {
    if (!r.query || !r.page || r.impressions < 100) continue
    const query = r.query
    const entity: PageEntity = matchPageToEntity(r.page)
    if (entity.type !== 'tool' || !entity.slug) continue
    const tool = findToolBySlug(entity.slug)
    if (!tool) continue

    const content = buildToolContent(tool)
    const currentSections = Object.keys(content).filter(k => k !== 'faq' && Array.isArray((content as any)[k]) ? (content as any)[k].length > 0 : Boolean((content as any)[k]))
    const faqCount = content.faq?.length ?? 0
    if (faqCount > 0) currentSections.push('faq')

    const missing = ALL_SECTIONS.filter(s => !currentSections.includes(s) && queryMentionsSection(query, s))
    if (missing.length === 0) continue

    const confidence = Math.min(0.9, 0.4 + missing.length * 0.1 + (r.impressions >= 500 ? 0.1 : 0))
    gaps.push({
      query: r.query,
      page: r.page,
      entityType: entity.type,
      slug: entity.slug ?? r.page,
      currentSections,
      missingSections: missing,
      impressions: r.impressions,
      clicks: r.clicks,
      position: r.position,
      confidence,
    })
  }

  return gaps.sort((a, b) => b.impressions - a.impressions).slice(0, 50)
}

export function detectContentGapsSync(rows: SearchPerformanceRow[]): ContentGap[] {
  const gaps: ContentGap[] = []
  for (const r of rows) {
    if (!r.query || !r.page || r.impressions < 100) continue
    const query = r.query
    const entity: PageEntity = matchPageToEntity(r.page)
    if (entity.type !== 'tool' || !entity.slug) continue

    const currentSections: string[] = ['intro', 'purpose', 'howItWorks', 'features', 'useCases', 'steps', 'limitations', 'privacy']
    const missing = ALL_SECTIONS.filter(s => !currentSections.includes(s) && queryMentionsSection(query, s))
    if (missing.length === 0) continue

    const confidence = Math.min(0.9, 0.4 + missing.length * 0.1 + (r.impressions >= 500 ? 0.1 : 0))
    gaps.push({
      query: r.query,
      page: r.page,
      entityType: entity.type,
      slug: entity.slug ?? r.page,
      currentSections,
      missingSections: missing,
      impressions: r.impressions,
      clicks: r.clicks,
      position: r.position,
      confidence,
    })
  }
  return gaps.sort((a, b) => b.impressions - a.impressions).slice(0, 50)
}
