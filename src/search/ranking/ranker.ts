/**
 * Search — ranking.
 * Deterministic, field-weighted scoring: exact > prefix > word-in-name > category >
 * keyword/description. Popularity, rating and AI/upgrade boosts are applied on top.
 */

import type { Token } from '../engine/tokenizer'

export interface SearchRecordMeta {
  /** 0..1 popularity signal (derived from downloads/views). */
  popularity?: number
  /** 0..5 */
  rating?: number
  /** 0..1 recency signal (newer = closer to 1). */
  recency?: number
  /** Feature boost (featured tools rank higher). */
  featured?: boolean
}

export interface RankContext extends SearchRecordMeta {
  name: string
  slug: string
  category: string
  keywords?: string
  description?: string
}

/** Field weights. */
export const WEIGHTS = { exactName: 100, prefixName: 70, tokenName: 55, slug: 80, category: 25, keyword: 18, description: 6 }

export interface ScoredCandidate {
  id: string
  score: number
  matchedOn: Array<'name' | 'slug' | 'category' | 'keyword' | 'description'>
}

export interface ScoredMatch {
  id: string
  score: number
  matchedOn: Array<'name' | 'slug' | 'category' | 'keyword' | 'description'>
}

/** Tokenize-normalize a field for matching. */
function norm(s: string): string { return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() }

/** Score one record against the query tokens. Higher = better. */
export function rankMatch(item: RankContext, queryTokens: Token[], rawQuery: string): ScoredCandidate {
  let score = 0
  const matched = new Set<ScoredCandidate['matchedOn'][number]>()
  const nameNorm = norm(item.name)
  const slugNorm = norm(item.slug).replace(/\s/g, '')
  const queryNorm = norm(rawQuery)
  const queryCompact = queryNorm.replace(/\s/g, '')

  // Whole-name + whole-slug exactness (strongest signals).
  if (nameNorm === queryNorm) { score += WEIGHTS.exactName; matched.add('name') }
  if (slugNorm === queryCompact) { score += WEIGHTS.slug; matched.add('slug') }
  if (nameNorm.startsWith(queryNorm) && queryNorm.length >= 2) { score += WEIGHTS.exactName - 10; matched.add('name') }
  if (slugNorm.startsWith(queryCompact) && queryCompact.length >= 2) { score += WEIGHTS.slug - 5; matched.add('slug') }

  // Per-token matches.
  for (const tok of queryTokens) {
    if (nameNorm.includes(tok.term)) { score += WEIGHTS.tokenName; matched.add('name'); score += tok.original === tok.term ? 4 : 2 }
    if (nameNorm.split(' ').some(w => w.startsWith(tok.term) && tok.term.length >= 2)) score += 8
    if (norm(item.category).includes(tok.term)) { score += WEIGHTS.category; matched.add('category') }
    if (item.keywords && norm(item.keywords).includes(tok.term)) { score += WEIGHTS.keyword; matched.add('keyword') }
    if (item.description && norm(item.description).includes(tok.term)) { score += WEIGHTS.description; matched.add('description') }
  }

  // Secondary signals.
  score += Math.min(10, (item.popularity ?? 0) * 10)
  score += (item.rating ?? 0) * 3
  score += (item.recency ?? 0) * 4
  if (item.featured) score += 6

  return { id: item.slug, score, matchedOn: Array.from(matched) }
}

/** Sort scored candidates descending; ties broken by name length (shorter = better). */
export function rankResults<T>(scored: Array<ScoredCandidate & { item: T; name: string }>): T[] {
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score || a.name.length - b.name.length)
    .map(s => s.item)
}