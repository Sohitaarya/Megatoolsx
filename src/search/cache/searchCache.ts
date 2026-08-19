/**
 * Search — response cache.
 * Memoizes search results by (query, filter) with a bounded LRU so repeated
 * keystrokes don't re-ranks the whole catalog. Deterministic.
 */

interface Entry { results: unknown; suggestions: string[]; at: number }

export class SearchCache {
  private map = new Map<string, Entry>()
  private max = 200

  constructor(max = 200) { this.max = max }

  private key(query: string, filter?: string): string {
    return (filter ? `${filter}:` : '') + query.trim().toLowerCase()
  }

  get<T>(query: string, filter?: string): { results: T[]; suggestions: string[] } | null {
    const key = this.key(query, filter)
    const entry = this.map.get(key)
    if (!entry) return null
    // TTL 15 min.
    if (Date.now() - entry.at > 15 * 60 * 1000) { this.map.delete(key); return null }
    // LRU: refresh recency.
    this.map.delete(key); this.map.set(key, entry)
    return { results: entry.results as T[], suggestions: entry.suggestions }
  }

  set<T>(query: string, filter: string | undefined, results: T[], suggestions: string[]): void {
    const key = this.key(query, filter)
    this.map.set(key, { results, suggestions, at: Date.now() })
    if (this.map.size > this.max) {
      const oldest = this.map.keys().next().value
      if (oldest !== undefined) this.map.delete(oldest)
    }
  }

  clear(): void { this.map.clear() }
  size(): number { return this.map.size }
}