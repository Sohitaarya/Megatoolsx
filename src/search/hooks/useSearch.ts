/**
 * Search — useSearch hook.
 * Debounced, cached, ranked search over the whole tool catalog with suggestions,
 * recent searches, filters and zero-result recovery. Memoized so re-renders are
 * cheap. Analytics wired automatically.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { useToolsStore } from '@/store/toolsStore'
import { InvertedIndex, toSearchRecord, type SearchRecord } from '../engine/invertedIndex'
import { SearchCache } from '../cache/searchCache'
import { searchAnalytics } from '../analytics/searchAnalytics'

export type SearchSource = 'csv' | 'ai'
export type SearchItem = SearchRecord & { source: SearchSource }

const RECENTS_KEY = 'megatoolsx:recent-searches'
const RECENTS_MAX = 8

const index = new InvertedIndex<SearchItem>()
let indexBuilt = false

function buildIndex(): InvertedIndex<SearchItem> {
  if (indexBuilt) return index
  const { csvTools, aiTools } = useToolsStore.getState()
  const records: SearchItem[] = [
    ...csvTools.map(t => ({ ...toSearchRecord({ slug: t.slug, name: t.name, category: t.category, description: t.description, seoKeywords: t.seoKeywords, status: t.status }), source: 'csv' as const })),
    ...aiTools.map(t => ({
      id: t.slug, name: t.name, slug: t.slug, category: t.category,
      description: t.description, popularity: 0.9, rating: 4.5, recency: 0.9, featured: true,
      source: 'ai' as const,
    })),
  ]
  index.build(records)
  indexBuilt = true
  return index
}

const cache = new SearchCache()

function loadRecents(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENTS_KEY) ?? '[]') as string[] } catch { return [] }
}
function saveRecents(list: string[]): void { try { localStorage.setItem(RECENTS_KEY, JSON.stringify(list)) } catch { /* ignore */ } }

function filterRecords(items: SearchItem[], filter: string): SearchItem[] {
  if (filter === 'all') return items
  return items.filter(i => i.category.toLowerCase().includes(filter.toLowerCase()))
}

export function useSearch(rawQuery: string, debounceMs = 90) {
  const [filter, setFilterState] = useState('all')
  const [debounced, setDebounced] = useState(rawQuery)
  const [results, setResults] = useState<SearchItem[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [recents, setRecents] = useState<string[]>(loadRecents)
  const [searching, setSearching] = useState(false)
  const startedAt = useRef<number | null>(null)

  // Debounce the raw query.
  useEffect(() => {
    const id = setTimeout(() => setDebounced(rawQuery.trim()), debounceMs)
    return () => clearTimeout(id)
  }, [rawQuery, debounceMs])

  // Run the index search on the debounced query.
  useEffect(() => {
    const q = debounced
    if (!q) {
      setResults([]); setSuggestions([]); setSearching(false)
      startedAt.current = null
      return
    }

    // Analytics "started" once per keystroke-run.
    if (startedAt.current === null) { startedAt.current = Date.now(); searchAnalytics.started(q) }

    const idx = buildIndex()
    const cached = cache.get<SearchItem>(q, filter === 'all' ? undefined : filter)
    if (cached) {
      setResults(filterRecords(cached.results, filter))
      setSuggestions(q.length >= 2 ? cached.suggestions : [])
      setSearching(false)
      return
    }

    setSearching(true)
    const frame = requestAnimationFrame(() => {
      const out = idx.search(q, { limit: 30 })
      const suggestionsOut = q.length >= 2 ? idx.suggest(q, 5) : []
      cache.set<SearchItem>(q, filter === 'all' ? undefined : filter, out, suggestionsOut)
      const filtered = filterRecords(out, filter)
      setResults(filtered)
      setSuggestions(suggestionsOut)
      setSearching(false)
      if (filtered.length === 0) searchAnalytics.noResults(q)
    })
    return () => cancelAnimationFrame(frame)
  }, [debounced, filter])

  const setFilter = (f: string) => { setFilterState(f); searchAnalytics.filterApplied(f, debounced) }

  const addRecent = (q: string) => {
    if (!q.trim()) return
    setRecents(prev => {
      const next = [q, ...prev.filter(x => x !== q)].slice(0, RECENTS_MAX)
      saveRecents(next)
      return next
    })
  }
  const clearRecents = () => { setRecents([]); saveRecents([]) }

  // Trending / quick-access: most popular tools for the empty state.
  const trending = useMemo(() => {
    const { csvTools } = useToolsStore.getState()
    return [...csvTools]
      .sort((a, b) => slugHash(b.slug) - slugHash(a.slug))
      .slice(0, 12)
      .map(t => ({ ...toSearchRecord({ slug: t.slug, name: t.name, category: t.category, description: t.description, seoKeywords: t.seoKeywords, status: t.status }), source: 'csv' as const }))
  }, [])

  return { query: debounced, results, suggestions, recents, trending, searching, filter, setFilter, addRecent, clearRecents }
}

/** Stable hash used to derive a rough “popularity” ordering for the quick list. */
function slugHash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}