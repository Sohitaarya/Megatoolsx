/**
 * Search — inverted index + unified search.
 *
 * Builds a term → record map once from the tool catalog, then serves instant
 * ranked search with prefix / partial / fuzzy / synonym matching. Fields are
 * weighted by the ranker. The index is small enough (2,500 records) to keep in
 * memory; a Web Worker wrapper can run it off the main thread for very large
 * catalogs.
 */

import { tokenize, isFuzzyMatch, type Token } from './tokenizer'
import { rankMatch, rankResults, type RankContext, type ScoredCandidate } from '../ranking/ranker'

export interface SearchRecord {
  id: string
  name: string
  slug: string
  category: string
  keywords?: string
  description?: string
  popularity?: number
  rating?: number
  recency?: number
  featured?: boolean
}

export interface SearchOptions {
  limit?: number
  fuzzy?: boolean
}

const MAX_LIMIT = 50

export class InvertedIndex<T extends SearchRecord> {
  private records = new Map<string, T>()
  private byTerm = new Map<string, Set<string>>()
  private nameTerms = new Map<string, string[]>()

  build(records: T[]): void {
    this.records.clear()
    this.byTerm.clear()
    this.nameTerms.clear()
    for (const r of records) {
      this.records.set(r.id, r)
      const fields = [r.name, r.slug, r.category, r.keywords ?? '', r.description ?? '']
      for (const field of fields) {
        for (const tok of tokenize(field)) {
          let set = this.byTerm.get(tok.term)
          if (!set) { set = new Set(); this.byTerm.set(tok.term, set) }
          set.add(r.id)
        }
      }
      // Name tokens used for prefix suggestions + fuzzy.
      this.nameTerms.set(r.id, tokenize(r.name).map(t => t.term))
    }
  }

  count(): number { return this.records.size }

  /** Candidate ids from a token (with optional fuzzy expansion). */
  private candidatesFor(token: Token, fuzzy: boolean): Set<string> {
    const exact = this.byTerm.get(token.term)
    const result = new Set<string>(exact ?? [])
    if (fuzzy) {
      for (const [term, ids] of this.byTerm) {
        if (isFuzzyMatch(token.term, term)) for (const id of ids) result.add(id)
      }
    }
    return result
  }

  /** Ranked search over the whole catalog. */
  search(query: string, opts: SearchOptions = {}): T[] {
    const q = query.trim()
    if (!q) return []
    const limit = Math.min(opts.limit ?? 12, MAX_LIMIT)
    const tokens = tokenize(q)
    if (!tokens.length) return []

    // Candidate set = intersection-friendly union: any record matching ≥1 token.
    const ids = new Set<string>()
    for (const tok of tokens) {
      const cands = this.candidatesFor(tok, opts.fuzzy ?? true)
      for (const id of cands) ids.add(id)
    }

    const scored: Array<ScoredCandidate & { item: T; name: string }> = []
    for (const id of ids) {
      const rec = this.records.get(id)
      if (!rec) continue
      const ctx: RankContext = {
        name: rec.name, slug: rec.slug, category: rec.category,
        keywords: rec.keywords, description: rec.description,
        popularity: rec.popularity, rating: rec.rating, recency: rec.recency, featured: rec.featured,
      }
      scored.push({ ...rankMatch(ctx, tokens, q), item: rec, name: rec.name })
    }

    return rankResults<T>(scored).slice(0, limit)
  }

  /** Prefix suggestions for autocomplete (from record names only). */
  suggest(query: string, limit = 6): string[] {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const matches: Array<{ term: string; name: string }> = []
    for (const [id, terms] of this.nameTerms) {
      for (const term of terms) {
        if (term.startsWith(q) && term !== q) matches.push({ term, name: this.records.get(id)?.name ?? '' })
      }
    }
    // Deduplicate by term, keep the first record name, sort shortest-first.
    const seen = new Set<string>()
    const uniq = matches.filter(m => !seen.has(m.term) && seen.add(m.term))
    return uniq.sort((a, b) => a.term.length - b.term.length).slice(0, limit).map(m => m.name)
  }
}

/** Build a search record from a raw tool row (deterministic metrics). */
export function toSearchRecord(tool: {
  slug: string; name: string; category: string; description?: string; seoKeywords?: string; status?: string
}): SearchRecord {
  const h = hash(tool.slug)
  return {
    id: tool.slug,
    name: tool.name,
    slug: tool.slug,
    category: tool.category,
    keywords: tool.seoKeywords,
    description: tool.description,
    popularity: ((h % 1000) / 1000),
    rating: 3.8 + ((h >> 3) % 12) * 0.1,
    recency: (h >> 5) % 100 / 100,
    featured: tool.status === 'Generative',
  }
}

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}