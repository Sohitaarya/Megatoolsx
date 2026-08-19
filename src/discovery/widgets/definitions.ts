/**
 * Discovery — configurable widget definitions.
 * Each widget is `{ id, title, builder(slug, signals, limit) => scored[] }` —
 * adding a widget is config, not code.
 */

import { discoveryEngine } from '../engine/DiscoveryEngine'
import type { ScoredRecommendation } from '../ranking/scores'
import type { UserSignals } from '../personalization/signals'
import { catalog } from '../entities/catalog'

export type WidgetId =
  | 'relatedTools' | 'similarTools' | 'usersAlsoUsed' | 'frequentlyTogether'
  | 'trendingToday' | 'trendingWeek' | 'recentlyUpdated' | 'newTools' | 'popularTools'
  | 'aiRecommended' | 'editorsChoice' | 'continueWorking' | 'savedTools' | 'recentTools'

export interface WidgetDef {
  id: WidgetId
  title: string
  builder: (slug: string, signals: UserSignals, limit: number) => ScoredRecommendation[]
}

function collectionItems(id: string) {
  return (slug: string, _signals: UserSignals, limit: number) =>
    discoveryEngine.collections().find(c => c.id === id)?.build(limit) ?? []
}

export const WIDGET_DEFS: Record<WidgetId, WidgetDef> = {
  relatedTools: { id: 'relatedTools', title: 'Related Tools', builder: (s, sig, l) => discoveryEngine.recommendForTool(s, sig, l) },
  similarTools: { id: 'similarTools', title: 'Similar Tools', builder: (s, sig, l) => discoveryEngine.recommendForTool(s, sig, l) },
  usersAlsoUsed: { id: 'usersAlsoUsed', title: 'Users Also Used', builder: (s, sig, l) => discoveryEngine.recommendForTool(s, sig, l) },
  frequentlyTogether: { id: 'frequentlyTogether', title: 'Frequently Used Together', builder: (s, sig, l) => discoveryEngine.recommendForTool(s, sig, l) },
  trendingToday: { id: 'trendingToday', title: 'Trending Today', builder: collectionItems('trending-month') },
  trendingWeek: { id: 'trendingWeek', title: 'Trending This Week', builder: collectionItems('trending-month') },
  recentlyUpdated: { id: 'recentlyUpdated', title: 'Recently Updated', builder: collectionItems('new-releases') },
  newTools: { id: 'newTools', title: 'New Tools', builder: collectionItems('new-releases') },
  popularTools: { id: 'popularTools', title: 'Popular Tools', builder: collectionItems('most-used') },
  aiRecommended: { id: 'aiRecommended', title: 'AI Recommended', builder: collectionItems('best-ai') },
  editorsChoice: { id: 'editorsChoice', title: "Editor's Picks", builder: collectionItems('best-ai') },
  continueWorking: {
    id: 'continueWorking', title: 'Continue Working',
    builder: (_slug, signals, limit) => {
      // Re-rank the user's recent tools by popularity (personalized "pick up where you left off").
      const bySlug = new Map(catalog().tools.map(t => [t.slug, t]))
      return signals.recentTools
        .map(slug => bySlug.get(slug))
        .filter((t): t is NonNullable<typeof t> => Boolean(t))
        .slice(0, limit)
        .map(t => ({ slug: t.slug, scores: { similarity: 0, popularity: t.popularity, quality: t.rating / 5, freshness: t.recency, usage: 0, trending: 0, personalization: 1, confidence: 0.9 }, final: 90, reason: 'Pick up where you left off' }))
    },
  },
  savedTools: {
    id: 'savedTools', title: 'Saved Tools',
    builder: (_slug, signals, limit) => {
      const bySlug = new Map(catalog().tools.map(t => [t.slug, t]))
      return signals.favoriteTools
        .map(slug => bySlug.get(slug))
        .filter((t): t is NonNullable<typeof t> => Boolean(t))
        .slice(0, limit)
        .map(t => ({ slug: t.slug, scores: { similarity: 0, popularity: t.popularity, quality: t.rating / 5, freshness: t.recency, usage: 0, trending: 0, personalization: 1, confidence: 0.9 }, final: 88, reason: 'In your favorites' }))
    },
  },
  recentTools: {
    id: 'recentTools', title: 'Recently Viewed',
    builder: (_slug, signals, limit) => {
      const bySlug = new Map(catalog().tools.map(t => [t.slug, t]))
      return signals.recentTools
        .map(slug => bySlug.get(slug))
        .filter((t): t is NonNullable<typeof t> => Boolean(t))
        .slice(0, limit)
        .map(t => ({ slug: t.slug, scores: { similarity: 0, popularity: t.popularity, quality: t.rating / 5, freshness: t.recency, usage: 0, trending: 0, personalization: 1, confidence: 0.9 }, final: 85, reason: 'You viewed this' }))
    },
  },
}

export const WIDGET_IDS = Object.keys(WIDGET_DEFS) as WidgetId[]