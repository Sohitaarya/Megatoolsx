import { ToolFeedSearch } from './ToolFeedSearch'
import { ToolFeedSort } from './ToolFeedSort'
import type { ToolFilterId, ToolSortId } from './toolFeedUtils'

/**
 * ToolFeed — toolbar. Search + sort + result info + active filter chips
 * (removable) with a Clear-all.
 */
export function ToolFeedToolbar({ query, onQuery, sort, onSort, total, shown, activeFilters, onRemoveFilter, onClearFilters, label }: {
  query: string
  onQuery: (q: string) => void
  sort: ToolSortId
  onSort: (s: ToolSortId) => void
  total: number
  shown: number
  activeFilters: ToolFilterId[]
  onRemoveFilter: (f: ToolFilterId) => void
  onClearFilters: () => void
  label: string
}) {
  return (
    <div className="space-y-3" role="toolbar" aria-label="Tool feed controls">
      <div className="flex flex-col sm:flex-row gap-3">
        <ToolFeedSearch value={query} onCommit={onQuery} label={label} />
        <ToolFeedSort value={sort} onChange={onSort} />
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {activeFilters.map(f => (
            <button
              key={f}
              onClick={() => onRemoveFilter(f)}
              aria-label={`Remove ${f} filter`}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-xs text-indigo-300 hover:bg-indigo-500/25"
            >
              {f} <span aria-hidden="true">×</span>
            </button>
          ))}
          <button onClick={onClearFilters} className="px-2 py-1 text-xs text-gray-500 hover:text-white underline underline-offset-2">
            Clear all
          </button>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Showing <span className="text-white">{shown}</span> of <span className="text-white">{total}</span> · Sort: <span className="text-gray-300">{sort}</span>
      </p>
    </div>
  )
}