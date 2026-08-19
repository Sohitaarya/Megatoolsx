/**
 * Discovery — multi-score ranking.
 * Each recommendation carries an 8-signal score vector blended into a final
 * explainable score. Personalization is additive (never required — anonymous).
 */

export interface ScoreVector {
  popularity: number   // 0..1
  quality: number      // 0..1 (rating-based)
  freshness: number    // 0..1 (recency)
  usage: number        // 0..1
  trending: number     // 0..1
  similarity: number   // 0..1 (content similarity to the source)
  personalization: number // 0..1 (session signals; 0 if none)
  confidence: number   // 0..1 (relevance certainty)
}

export interface ScoredRecommendation {
  slug: string
  scores: ScoreVector
  /** Blended 0..100. */
  final: number
  reason: string
}

const WEIGHTS = {
  similarity: 0.34, popularity: 0.16, quality: 0.12, freshness: 0.08,
  usage: 0.08, trending: 0.08, personalization: 0.08, confidence: 0.06,
}

/** Blend the vector into a final 0..100 score. */
export function blend(scores: ScoreVector): number {
  const final =
    scores.similarity * WEIGHTS.similarity +
    scores.popularity * WEIGHTS.popularity +
    scores.quality * WEIGHTS.quality +
    scores.freshness * WEIGHTS.freshness +
    scores.usage * WEIGHTS.usage +
    scores.trending * WEIGHTS.trending +
    scores.personalization * WEIGHTS.personalization +
    scores.confidence * WEIGHTS.confidence
  return Math.round(final * 1000) / 10 // 0..100 (1 decimal)
}

/** Sort scored recommendations by final score, highest first. */
export function rankScored(list: ScoredRecommendation[], limit = 6): ScoredRecommendation[] {
  return [...list].sort((a, b) => b.final - a.final).slice(0, limit)
}

/** Convenience: build a score vector from partial inputs (defaults 0). */
export function vector(partial: Partial<ScoreVector>): ScoreVector {
  return {
    popularity: partial.popularity ?? 0,
    quality: partial.quality ?? 0,
    freshness: partial.freshness ?? 0,
    usage: partial.usage ?? 0,
    trending: partial.trending ?? 0,
    similarity: partial.similarity ?? 0,
    personalization: partial.personalization ?? 0,
    confidence: partial.confidence ?? 0,
  }
}