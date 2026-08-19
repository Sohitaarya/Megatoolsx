/**
 * AIOS — Recommendation engine.
 * Recommends tools, workflows, templates, plugins and articles from explicit
 * signals (views, category affinity) + implicit recency + popularity. Deterministic
 * scoring; the LLM is optional for natural-language explanations.
 */

export interface Recommendable {
  id: string
  category: string
  popularity: number
  createdAt: string
}

export interface UserSignals {
  /** (itemId, category) tuples the user engaged with. */
  views: Array<{ id: string; category: string }>
  recent?: string[]
}

export interface Recommendation {
  id: string
  score: number
  reason: string
}

/** Cosine-similarity is overkill for category affinity; a simple boost works. */
export function scoreItem(item: Recommendable, signals: UserSignals, now: number): Recommendation {
  let score = 0

  // Affinity: items in categories the user already views get a boost.
  const categoryCounts = new Map<string, number>()
  for (const v of signals.views) categoryCounts.set(v.category, (categoryCounts.get(v.category) ?? 0) + 1)
  const affinity = categoryCounts.get(item.category) ?? 0
  score += Math.min(affinity, 5) * 3

  // Popularity (normalized 0..10).
  score += Math.min(item.popularity, 10) * 2

  // Recency: newer items get a small decayed boost.
  const ageDays = (now - new Date(item.createdAt).getTime()) / 86400000
  score += Math.max(0, 10 - ageDays) * 0.5

  // Recent views penalty (don't recommend what they just saw).
  if (signals.recent?.includes(item.id)) score -= 5

  const reason =
    affinity > 0
      ? `Matches your interest in ${item.category}`
      : item.popularity > 7
        ? 'Popular with other users'
        : 'Recently added'

  return { id: item.id, score: Math.round(score * 10) / 10, reason }
}

export class Recommender {
  /** Rank a catalog for a user. Returns top-N with reasons. */
  recommend<T extends Recommendable>(catalog: T[], signals: UserSignals, limit = 8): Recommendation[] {
    const now = Date.now()
    return catalog
      .map(item => scoreItem(item, signals, now))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }
}

export const recommender = new Recommender()