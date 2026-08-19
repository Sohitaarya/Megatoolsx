/**
 * Discovery — recommendation ranker.
 * Produces a typed Recommendation with a reason, confidence score, relationship
 * type and popularity score — so every recommendation is explainable and auditable.
 */

import type { ToolNode } from '../entities/catalog'

export type RelationshipType =
  | 'same_category' | 'similar' | 'popular' | 'trending' | 'new_release'
  | 'users_also_used' | 'frequently_used_together' | 'editor_pick' | 'alternative'

export interface Recommendation {
  tool: ToolNode
  /** 0..1 relevance. */
  confidence: number
  /** 0..1. */
  popularityScore: number
  relationshipType: RelationshipType
  reason: string
}

/** Merge content-similarity with popularity/recency/recency boosts into a rank. */
export function rankRecommendation(
  tool: ToolNode,
  similarityScore: number,
  relationshipType: RelationshipType,
  reason: string,
): Recommendation {
  const popularityScore = tool.popularity
  const confidence = Math.min(1, (similarityScore * 0.7) + (tool.popularity * 0.15) + (tool.rating / 5) * 0.15)
  return { tool, confidence, popularityScore, relationshipType, reason }
}

/** Sort recommendations by a weighted blend of confidence + popularity (desc). */
export function rankRecommendations(list: Recommendation[], limit = 6): Recommendation[] {
  return list
    .filter(r => r.tool.slug)
    .sort((a, b) =>
      (b.confidence * 0.75 + b.popularityScore * 0.25) - (a.confidence * 0.75 + a.popularityScore * 0.25),
    )
    .slice(0, limit)
}