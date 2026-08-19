/**
 * SEO Monitoring — query/page mismatch detection.
 * Identifies cases where the query intent appears misaligned with the page content type.
 * Uses real GSC rows + existing tool intent + content models. Does not auto-flag every
 * edge case; confidence is reduced when signals are weak.
 */

import type { SearchPerformanceRow } from './types'
import { matchPageToEntity, type PageEntity } from './analysis'
import { toolIntentModel } from '@/seo/intent/toolIntent'
import type { CsvTool } from '@/data/csvData'
import { loadTools } from '@/data/csvData'

export type IntentCategory = 'informational' | 'navigational' | 'transactional' | 'problem-solving' | 'how-to' | 'comparison' | 'utility'

function intentCategory(toolIntent: string): IntentCategory {
  const map: Record<string, IntentCategory> = {
    informational: 'informational',
    navigational: 'navigational',
    transactional: 'transactional',
    'problem-solving': 'problem-solving',
    'how-to': 'how-to',
    comparison: 'comparison',
    utility: 'utility',
  }
  return map[toolIntent] ?? 'utility'
}

function queryIntent(query: string): IntentCategory {
  const q = query.toLowerCase()
  if (/\b(how to|guide|tutorial|tips|what is|why|how does)\b/.test(q)) return 'how-to'
  if (/\b(best|compare|vs|alternative|review)\b/.test(q)) return 'comparison'
  if (/\b(buy|cheap|price|cost|free|download|pricing)\b/.test(q)) return 'transactional'
  if (/\b(fix|solve|repair|remove|reduce|compress|convert)\b/.test(q)) return 'problem-solving'
  if (/\b(online|tool|calculator|generator|maker)\b/.test(q)) return 'utility'
  if (/\b(wiki|official|login|signup|account|dashboard)\b/.test(q)) return 'navigational'
  return 'informational'
}

function intentMismatchScore(queryInt: IntentCategory, pageInt: IntentCategory): number {
  if (queryInt === pageInt) return 0
  const conflicts: Record<IntentCategory, IntentCategory[]> = {
    informational: ['transactional'],
    navigational: ['informational', 'utility'],
    transactional: ['informational'],
    'problem-solving': ['informational'],
    'how-to': ['transactional'],
    comparison: ['informational', 'utility'],
    utility: ['navigational', 'transactional'],
  }
  const bad = conflicts[queryInt] ?? []
  if (bad.includes(pageInt)) return 0.8
  return 0.4
}

export interface QueryPageMismatch {
  query: string
  page: string
  entityType: string
  slug: string
  queryIntent: IntentCategory
  pageIntent: IntentCategory
  confidence: number
  impressions: number
  clicks: number
  position: number
}

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

export async function detectQueryPageMismatches(rows: SearchPerformanceRow[]): Promise<QueryPageMismatch[]> {
  const tools = await getTools()
  const out: QueryPageMismatch[] = []

  for (const r of rows) {
    if (!r.query || !r.page || r.impressions < 50) continue
    const entity: PageEntity = matchPageToEntity(r.page)
    if (entity.type !== 'tool' || !entity.slug) continue

    const tool = findToolBySlug(entity.slug)
    if (!tool) continue

    const pageIntentModel = toolIntentModel(tool)
    const pageIntent = intentCategory(pageIntentModel.primary)
    const qIntent = queryIntent(r.query)
    const mismatchScore = intentMismatchScore(qIntent, pageIntent)

    if (mismatchScore > 0.3) {
      out.push({
        query: r.query,
        page: r.page,
        entityType: entity.type,
        slug: entity.slug,
        queryIntent: qIntent,
        pageIntent,
        confidence: mismatchScore,
        impressions: r.impressions,
        clicks: r.clicks,
        position: r.position,
      })
    }
  }

  return out.sort((a, b) => b.impressions - a.impressions).slice(0, 50)
}

export function detectQueryPageMismatchesSync(rows: SearchPerformanceRow[]): QueryPageMismatch[] {
  const out: QueryPageMismatch[] = []
  for (const r of rows) {
    if (!r.query || !r.page || r.impressions < 50) continue
    const entity: PageEntity = matchPageToEntity(r.page)
    if (entity.type !== 'tool' || !entity.slug) continue

    const qIntent = queryIntent(r.query)
    const pageIntent: IntentCategory = 'utility'
    const mismatchScore = intentMismatchScore(qIntent, pageIntent)

    if (mismatchScore > 0.3) {
      out.push({
        query: r.query,
        page: r.page,
        entityType: entity.type,
        slug: entity.slug,
        queryIntent: qIntent,
        pageIntent,
        confidence: mismatchScore,
        impressions: r.impressions,
        clicks: r.clicks,
        position: r.position,
      })
    }
  }
  return out.sort((a, b) => b.impressions - a.impressions).slice(0, 50)
}
