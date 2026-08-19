/**
 * Discovery — central DiscoveryEngine.
 * Recommend, rank, build collections, detect intent, suggest related queries and
 * track interactions. Stateless and deterministic given the catalog + session
 * signals, so it scales to 100k+ tools without architectural change.
 */

import { catalog, type ToolNode } from '../entities/catalog'
import { entityGraph } from '../knowledge/entityGraph'
import { similarity } from '../similarity/content'
import { vector, blend, rankScored, type ScoredRecommendation, type ScoreVector } from '../ranking/scores'
import { detectIntent, type Intent } from '../intent/detect'
import { discoveryAnalytics } from '../analytics/events'
import { emptySignals, type UserSignals } from '../personalization/signals'

export interface CollectionDef {
  id: string
  label: string
  blurb?: string
  build: (limit: number) => ScoredRecommendation[]
}

export class DiscoveryEngine {
  /** Ensure the graph is built once. */
  private graphReady(): void {
    if (entityGraph.size().edges === 0) entityGraph.build(catalog())
  }

  /** Core: score every candidate relative to a source tool. */
  recommendForTool(slug: string, signals: UserSignals = emptySignals(), limit = 6): ScoredRecommendation[] {
    this.graphReady()
    const tool = catalog().tools.find(t => t.slug === slug)
    if (!tool) return []
    const out: ScoredRecommendation[] = []
    const prefer = signals.recentCategories ?? []

    const push = (other: ToolNode, sim: number, reason: string) => {
      if (other.slug === slug || out.some(o => o.slug === other.slug)) return
      const scores = this.scoresFor(other, sim, prefer, signals.recentTools ?? [])
      out.push({ slug: other.slug, scores, final: blend(scores), reason })
    }

    for (const other of catalog().tools) {
      if (other.slug === slug || other.categorySlug !== tool.categorySlug) continue
      push(other, similarity(tool, other).score, `More ${tool.category} tools`)
    }
    for (const id of entityGraph.relatedBySharedEntity(`tool:${slug}`, 'tag')) {
      const other = catalog().tools.find(t => `tool:${t.slug}` === id)
      if (other) push(other, similarity(tool, other).score, `Shares keywords with ${tool.name}`)
    }
    if (out.length < 3) {
      for (const t of catalog().tools.filter(x => x.slug !== slug).sort((a, b) => b.popularity - a.popularity).slice(0, limit)) {
        push(t, similarity(tool, t).score, 'Popular on MegatoolsX')
      }
    }

    return rankScored(out, limit)
  }

  /** Top tools in a category, scored. */
  recommendForCategory(categorySlug: string, signals: UserSignals = emptySignals(), limit = 6): ScoredRecommendation[] {
    const prefer = signals.recentCategories ?? []
    return catalog().tools
      .filter(t => t.categorySlug === categorySlug)
      .map(t => {
        const scores = this.scoresFor(t, 0.6, prefer, [])
        return { slug: t.slug, scores, final: blend(scores), reason: `Top ${t.category} tools` }
      })
      .sort((a, b) => b.final - a.final)
      .slice(0, limit)
  }

  /** Build the 8-signal score vector for a candidate. */
  private scoresFor(candidate: ToolNode, similarityScore: number, preferCategories: string[], recentTools: string[]): ScoreVector {
    return vector({
      similarity: similarityScore,
      popularity: candidate.popularity,
      quality: candidate.rating / 5,
      freshness: candidate.recency,
      usage: Math.round(candidate.popularity * 100) / 100,
      trending: candidate.recency * candidate.popularity,
      // Anonymous personalization: boost candidates in categories the user viewed.
      personalization: preferCategories.includes(candidate.categorySlug) ? 0.8 : recentTools.includes(candidate.slug) ? -0.3 : 0,
      confidence: 0.6,
    })
  }

  /** Detect audience intents for a tool/query. */
  intentFor(name: string, category = ''): Intent[] {
    return detectIntent(name, category)
  }

  /** Related search queries derived from the entity graph. */
  relatedQueries(query: string, limit = 5): string[] {
    const tokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 2)
    const cats = new Set<string>()
    for (const t of catalog().tools) {
      const cat = t.category.toLowerCase()
      if (tokens.some(tok => cat.includes(tok))) cats.add(t.category)
    }
    const base = Array.from(cats).slice(0, limit)
    if (base.length < limit) base.push(...catalog().categories.slice(0, limit - base.length).map(c => c.name))
    return Array.from(new Set(base)).slice(0, limit)
  }

  /** Smart collections (config-driven). */
  collections(): CollectionDef[] {
    return [
      { id: 'best-ai', label: 'Best AI Tools', blurb: 'Top AI-powered tools', build: l => this.topBy('ai', l) },
      { id: 'developer-essentials', label: 'Developer Essentials', blurb: 'Essential coding & dev tools', build: l => this.topBy('developer', l) },
      { id: 'trending-month', label: 'Trending This Month', blurb: 'Moving fast right now', build: l => this.topBy('trending', l) },
      { id: 'most-used', label: 'Most Used', blurb: 'The tools everyone reaches for', build: l => this.topBy('popular', l) },
      { id: 'new-releases', label: 'New Releases', blurb: 'Recently added', build: l => this.topBy('new', l) },
      { id: 'best-pdf', label: 'Best PDF Tools', blurb: 'PDF & document utilities', build: l => this.topBy('pdf', l) },
      { id: 'best-image', label: 'Best Image Tools', blurb: 'Image & design utilities', build: l => this.topBy('image', l) },
      { id: 'seasonal', label: 'Seasonal Collections', blurb: 'Featured picks this season', build: l => this.topBy('popular', l) },
    ]
  }

  private topBy(mode: 'ai' | 'developer' | 'trending' | 'popular' | 'new' | 'pdf' | 'image', limit: number): ScoredRecommendation[] {
    const all = catalog().tools
    const pick = (pred: (t: ToolNode) => boolean, key: (t: ToolNode) => number) =>
      all.filter(pred).sort((a, b) => key(b) - key(a)).slice(0, limit).map(t => {
        const scores = this.scoresFor(t, 0.5, [], [])
        return { slug: t.slug, scores, final: blend(scores), reason: labelFor(mode) }
      })
    const n = (t: ToolNode) => `${t.name} ${t.category}`.toLowerCase()
    switch (mode) {
      case 'ai': return pick(t => t.status === 'Generative' || n(t).includes('ai'), t => t.popularity)
      case 'developer': return pick(t => /developer|coding|code|git|api|sql|json|terminal|deploy/.test(n(t)), t => t.popularity)
      case 'trending': return pick(() => true, t => t.popularity + t.recency)
      case 'popular': return pick(() => true, t => t.popularity)
      case 'new': return pick(() => true, t => t.recency)
      case 'pdf': return pick(t => n(t).includes('pdf'), t => t.popularity)
      case 'image': return pick(t => /image|photo|design|logo|thumbnail|graphic/.test(n(t)), t => t.popularity)
    }
  }

  /** Track an interaction through the analytics layer. */
  track(interaction: { block: string; from: string; to: string; relationshipType: string }): void {
    discoveryAnalytics.recommendationClicked(interaction.block, interaction.from, interaction.to, interaction.relationshipType)
  }
}

function labelFor(mode: string): string {
  const map: Record<string, string> = { ai: 'AI-powered', developer: 'Developer essential', trending: 'Trending', popular: 'Popular', new: 'New release', pdf: 'PDF tool', image: 'Image tool' }
  return map[mode] ?? 'Recommended'
}

export const discoveryEngine = new DiscoveryEngine()