import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import type { CsvTool } from '@/data/csvData'
import { ToolFeedToolbar } from './ToolFeedToolbar'
import { ToolFeedFilters } from './ToolFeedFilters'
import { ToolFeedGrid } from './ToolFeedGrid'
import { ToolFeedPagination } from './ToolFeedPagination'
import { EmptyResults } from './EmptyResults'
import { matchesQuery, matchesFilter, sortTools, type ToolFilterId, type ToolSortId } from './toolFeedUtils'
import { analyticsApi } from '@/analytics'

const DEFAULT_SORT: ToolSortId = 'alpha-asc'
const DEFAULT_LIMIT = 40

function parseFilters(raw: string | null): ToolFilterId[] {
  if (!raw) return []
  return raw.split(',').filter((f): f is ToolFilterId => Boolean(f)).filter(f => f !== 'all')
}

/**
 * ToolFeed — production search/sort/filter/paginate grid. URL-synced
 * (?q= ?sort= ?filter= ?page= ?limit=). Filtering is O(n), sorting only after
 * filtering, results deferred, infinite-scroll lazy rendering, route prefetch on
 * hover, and a skeleton during non-urgent updates (useTransition).
 */
export function ToolFeed({ tools, categoryName }: { tools: CsvTool[]; categoryName: string }) {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const topRef = useRef<HTMLDivElement>(null)
  const [isPending, startTransition] = useTransition()
  const [recents, setRecents] = useState<string[]>(() => loadRecents())

  const query = params.get('q') ?? ''
  const sort = (params.get('sort') as ToolSortId) ?? DEFAULT_SORT
  const activeFilters = parseFilters(params.get('filter'))
  const page = Math.max(1, Number(params.get('page')) || 1)
  const limit = Number(params.get('limit')) || DEFAULT_LIMIT

  // Stable updater — functional form avoids re-creating the callback.
  const update = useCallback((patch: Record<string, string | null>, opts: { replace?: boolean } = {}) => {
    setParams(prev => {
      const next = new URLSearchParams(prev)
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === '') next.delete(k); else next.set(k, v)
      }
      if (patch.filter !== undefined || patch.sort !== undefined) next.delete('page')
      return next
    }, opts)
  }, [setParams])

  const onQuery = useCallback((q: string) => {
    if (q.trim()) {
      const qt = q.trim()
      const next = [qt, ...recents.filter(x => x !== qt)].slice(0, 6)
      setRecents(next)
      saveRecents(next)
    }
    startTransition(() => update({ q: q || null, page: null }, { replace: true }))
  }, [update, recents])

  // Memoized pipeline: filter (query + filters) → sort → paginate.
  const filtered = useMemo(() => {
    const q = query.trim()
    return tools.filter(t => matchesQuery(t, q) && activeFilters.every(f => matchesFilter(t, f)))
  }, [tools, query, activeFilters])

  const sorted = useDeferredValue(useMemo(() => sortTools(filtered, sort), [filtered, sort]))
  const pageCount = Math.max(1, Math.ceil(filtered.length / limit))
  const safePage = Math.min(page, pageCount)
  const paged = useMemo(() => sorted.slice((safePage - 1) * limit, safePage * limit), [sorted, safePage, limit])

  // Analytics.
  useEffect(() => { if (query) analyticsApi.trackSearch({ query: query.slice(0, 60), action: 'submit' }) }, [query])
  useEffect(() => {
    if (filtered.length === 0 && (query || activeFilters.length)) analyticsApi.trackSearch({ query: query.slice(0, 60), action: 'no_results' })
  }, [filtered.length, query, activeFilters.length])

  const toggleFilter = useCallback((id: ToolFilterId) => {
    const next = id === 'all' ? [] : activeFilters.includes(id) ? activeFilters.filter(f => f !== id) : [...activeFilters, id]
    analyticsApi.trackEvent(next.includes(id) ? 'filter_applied' : 'filter_removed', { filter: id })
    startTransition(() => update({ filter: next.length ? next.join(',') : null }))
  }, [activeFilters, update])

  const changeSort = useCallback((s: ToolSortId) => {
    analyticsApi.trackEvent('sort_changed', { sort: s })
    startTransition(() => update({ sort: s }))
  }, [update])

  const changePage = useCallback((p: number) => {
    analyticsApi.trackEvent('pagination_changed', { page: p, limit })
    update({ page: String(p) })
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [update, limit])

  const changePer = useCallback((l: number) => {
    analyticsApi.trackEvent('items_per_page_changed', { limit: l })
    update({ limit: String(l), page: null })
  }, [update])

  const clearAll = useCallback(() => {
    analyticsApi.trackEvent('filters_cleared', {})
    startTransition(() => update({ filter: null, q: null }))
  }, [update])

  // Keyboard: Esc clears search, Enter opens the first visible result.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && query) { e.preventDefault(); update({ q: null }, { replace: true }) }
      if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey && !e.shiftKey && paged.length > 0 && !(e.target as HTMLElement)?.closest('button,input,select')) {
        e.preventDefault()
        navigate(`/tools/${paged[0].slug}`)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [query, paged, navigate, update])

  const popularForEmpty = useMemo(() => sortTools(tools, 'popular').slice(0, 6).map(t => t.name), [tools])
  const trendingForEmpty = useMemo(() => sortTools(tools, 'recently-updated').slice(0, 6).map(t => t.name), [tools])
  const relatedForEmpty = useMemo(() => Array.from(new Set(tools.map(t => t.category))).slice(0, 6), [tools])

  return (
    <div ref={topRef} className="space-y-4">
      {recents.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-sm">
          <span className="text-xs text-gray-500 uppercase tracking-wider">Recent:</span>
          {recents.slice(0, 5).map(r => (
            <button key={r} onClick={() => onQuery(r)} className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white">
              {r}
            </button>
          ))}
        </div>
      )}

      <ToolFeedToolbar
        query={query} onQuery={onQuery}
        sort={sort} onSort={changeSort}
        total={filtered.length} shown={paged.length}
        activeFilters={activeFilters}
        onRemoveFilter={toggleFilter}
        onClearFilters={clearAll}
        label={`Search ${categoryName} tools`}
      />
      <ToolFeedFilters selected={activeFilters} onToggle={toggleFilter} onClearAll={clearAll} />

      {filtered.length === 0 ? (
        <EmptyResults
          query={query}
          activeFilters={activeFilters}
          onClearFilters={clearAll}
          onBack={() => navigate('/tools')}
          popular={popularForEmpty}
          trending={trendingForEmpty}
          related={relatedForEmpty}
          onSearch={(term) => update({ q: term, page: null }, { replace: true })}
        />
      ) : (
        <>
          <ToolFeedGrid tools={paged} query={query} pending={isPending} />
          <ToolFeedPagination page={safePage} per={limit} total={filtered.length} onPage={changePage} onPer={changePer} />
        </>
      )}
    </div>
  )
}

const RECENTS_KEY = 'megatoolsx:category-recents'
function loadRecents(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENTS_KEY) ?? '[]') as string[] } catch { return [] }
}
function saveRecents(list: string[]): void {
  try { localStorage.setItem(RECENTS_KEY, JSON.stringify(list)) } catch { /* ignore */ }
}