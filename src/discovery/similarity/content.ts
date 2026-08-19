/**
 * Discovery — content similarity.
 * Deterministic similarity between two tools from category + tag/keyword overlap.
 * Used for "related", "similar" and "users also used" style recommendations.
 */

import type { ToolNode } from '../entities/catalog'

export interface SimilarityResult {
  a: string
  b: string
  score: number
  /** Which signals drove the match. */
  signals: Array<'category' | 'tag' | 'keyword' | 'name'>
}

function jaccard<T>(x: Set<T>, y: Set<T>): number {
  if (x.size === 0 && y.size === 0) return 0
  let inter = 0
  for (const v of x) if (y.has(v)) inter++
  return inter / (x.size + y.size - inter || 1)
}

/** Score 0..1 similarity between two tools. */
export function similarity(a: ToolNode, b: ToolNode): SimilarityResult {
  const signals: SimilarityResult['signals'] = []
  let score = 0

  // Same category is the strongest signal.
  if (a.categorySlug === b.categorySlug) { score += 0.55; signals.push('category') }

  // Tag/keyword overlap.
  const aTags = new Set(a.tags.map(normalize))
  const bTags = new Set(b.tags.map(normalize))
  const tagJ = jaccard(aTags, bTags)
  if (tagJ > 0) { score += tagJ * 0.3; signals.push('tag') }

  const aKw = new Set(a.keywords.map(normalize))
  const bKw = new Set(b.keywords.map(normalize))
  const kwJ = jaccard(aKw, bKw)
  if (kwJ > 0) { score += kwJ * 0.1; signals.push('keyword') }

  // Shared significant word in the name.
  const aNameWords = new Set(a.name.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 3))
  const bNameWords = new Set(b.name.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 3))
  let shared = 0
  for (const w of aNameWords) if (bNameWords.has(w)) shared++
  if (shared > 0) { score += Math.min(0.15, shared * 0.05); signals.push('name') }

  return { a: a.slug, b: b.slug, score: Math.min(1, score), signals }
}

function normalize(s: string): string { return s.toLowerCase().trim() }