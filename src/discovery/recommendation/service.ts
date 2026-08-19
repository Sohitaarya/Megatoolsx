/**
 * Discovery — recommendation service.
 * Universal, explainable recommendations for tools, categories, trending, popular
 * and new releases. Deterministic and stateless (operates on the index + graph).
 */

import { catalog, type ToolNode } from '../entities/catalog'
import { entityGraph } from '../knowledge/entityGraph'
import { similarity } from '../similarity/content'
import { rankRecommendation, rankRecommendations, type Recommendation } from '../ranking/ranker'

const LIMIT = 6

/** Ensure the graph is built once from the catalog. */
function graph(): typeof entityGraph {
  if (entityGraph.size().edges === 0) entityGraph.build(catalog())
  return entityGraph
}

function list(): ToolNode[] { return catalog().tools }

/** Related + similar tools for a given tool (with reasons). */
export function recommendForTool(slug: string, limit = LIMIT): Recommendation[] {
  const tool = list().find(t => t.slug === slug)
  if (!tool) return []

  const out: Recommendation[] = []

  // 1) Same-category tools.
  for (const other of list()) {
    if (other.slug === slug || other.categorySlug !== tool.categorySlug) continue
    out.push(rankRecommendation(other, similarity(tool, other).score, 'same_category', `More ${tool.category} tools`))
  }

  // 2) Shared tags via the entity graph.
  for (const id of graph().relatedBySharedEntity(`tool:${slug}`, 'tag')) {
    const other = list().find(t => `tool:${t.slug}` === id)
    if (other && out.every(r => r.tool.slug !== other.slug)) {
      out.push(rankRecommendation(other, similarity(tool, other).score, 'similar', `Shares keywords with ${tool.name}`))
    }
  }

  // 3) Never leave a tool orphaned — pad with popular tools if empty.
  if (out.length < 3) {
    for (const t of list().filter(x => x.slug !== slug).sort((a, b) => b.popularity - a.popularity).slice(0, LIMIT)) {
      if (out.every(r => r.tool.slug !== t.slug)) {
        out.push(rankRecommendation(t, similarity(tool, t).score, 'popular', 'Popular on MegatoolsX'))
      }
    }
  }

  return rankRecommendations(out, limit)
}

/** Top tools in a category. */
export function recommendForCategory(categorySlug: string, limit = LIMIT): Recommendation[] {
  return catalog().tools
    .filter(t => t.categorySlug === categorySlug)
    .sort((a, b) => (b.popularity + b.rating / 5) - (a.popularity + a.rating / 5))
    .slice(0, limit)
    .map(t => rankRecommendation(t, 0.6, 'popular', `Top ${t.category} tools`))
}

/** Related categories (for category content hubs / internal linking). */
export function relatedCategories(current: string): Array<{ id: string; label: string; confidence: number }> {
  return catalog().categories
    .filter(c => c.slug !== current)
    .map(c => ({ id: c.slug, label: c.name, confidence: 0.5 }))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, LIMIT)
}

/** Trending (popularity × recency blend). */
export function trendingTools(limit = 8): Recommendation[] {
  return catalog().tools
    .sort((a, b) => (b.popularity + b.recency) - (a.popularity + a.recency))
    .slice(0, limit)
    .map(t => rankRecommendation(t, 0.5, 'trending', 'Trending now'))
}

/** Popular this week. */
export function popular(limit = 8): Recommendation[] {
  return catalog().tools
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit)
    .map(t => rankRecommendation(t, 0.4, 'popular', 'Popular this week'))
}

/** New releases (recency). */
export function newReleases(limit = 8): Recommendation[] {
  return catalog().tools
    .sort((a, b) => b.recency - a.recency)
    .slice(0, limit)
    .map(t => rankRecommendation(t, 0.4, 'new_release', 'Recently added'))
}