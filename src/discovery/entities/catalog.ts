/**
 * Discovery — entity catalog.
 * A normalized, typed catalog of tools, categories, tags and keywords built from
 * the tool store. This is the single source the discovery engine indexes.
 */

import type { CsvTool } from '@/data/csvData'
import { useToolsStore } from '@/store/toolsStore'

export type EntityKind = 'tool' | 'category' | 'tag' | 'keyword' | 'topic'

export interface ToolNode {
  kind: 'tool'
  id: string
  slug: string
  name: string
  category: string
  categorySlug: string
  description: string
  tags: string[]
  keywords: string[]
  popularity: number
  rating: number
  recency: number
  status: string
}

export interface CategoryNode {
  kind: 'category'
  id: string
  slug: string
  name: string
  toolCount: number
}

export interface Catalog {
  tools: ToolNode[]
  categories: CategoryNode[]
  /** Global popularity ordering (trending quick-access). */
  byPopularity: string[]
  byRecency: string[]
}

/** Hash a stable 0..1 pseudo-popularity. */
function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return (h >>> 0) / 4294967295
}

export function toToolNode(t: CsvTool): ToolNode {
  return {
    kind: 'tool',
    id: t.slug,
    slug: t.slug,
    name: t.name,
    category: t.category,
    categorySlug: t.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    description: t.description,
    tags: t.seoKeywords ? t.seoKeywords.split(',').map(s => s.trim()).filter(Boolean) : [],
    keywords: t.seoKeywords ? t.seoKeywords.split(',').map(s => s.trim()).filter(Boolean) : [],
    popularity: Math.round(hash(t.slug) * 1000) / 1000,
    rating: Math.round((3.8 + (hash(t.slug + t.name) * 12)) * 10) / 10,
    recency: Math.round(hash(t.slug + t.status) * 100) / 100,
    status: t.status,
  }
}

/** Build the immutable catalog from the live store (cached). */
export function buildCatalog(): Catalog {
  const { csvTools } = useToolsStore.getState()
  const tools = csvTools.map(toToolNode)
  const counts = new Map<string, number>()
  for (const t of tools) counts.set(t.categorySlug, (counts.get(t.categorySlug) ?? 0) + 1)
  const categories: CategoryNode[] = Array.from(counts.entries()).map(([slug, count]) => ({
    kind: 'category', id: `cat:${slug}`, slug, name: nameForSlug(slug, tools), toolCount: count,
  }))
  const byPopularity = [...tools].sort((a, b) => b.popularity - a.popularity).map(t => t.slug)
  const byRecency = [...tools].sort((a, b) => b.recency - a.recency).map(t => t.slug)
  return { tools, categories, byPopularity, byRecency }
}

function nameForSlug(slug: string, tools: ToolNode[]): string {
  const t = tools.find(x => x.categorySlug === slug)
  return t?.category ?? slug.replace(/-/g, ' ')
}

let cache: Catalog | null = null
export function catalog(): Catalog {
  if (!cache) cache = buildCatalog()
  return cache
}
export function invalidateCatalog(): void { cache = null }