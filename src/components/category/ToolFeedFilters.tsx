import { useState } from 'react'
import { X, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { TOOL_FILTERS, type ToolFilterId } from './toolFeedUtils'
import { cn } from '@/lib/utils'

/**
 * ToolFeed — multi-select filter chips with an active-count badge. Collapsible
 * (open by default) with proper aria-expanded, so mobile users can tuck it away.
 */
export function ToolFeedFilters({ selected, onToggle, onClearAll }: {
  selected: ToolFilterId[]
  onToggle: (id: ToolFilterId) => void
  onClearAll: () => void
}) {
  const [open, setOpen] = useState(true)

  return (
    <div className="border border-white/5 rounded-xl bg-white/[0.02]">
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-controls="toolfeed-filters"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4 text-gray-400" aria-hidden="true" />
          Filters
          {selected.length > 0 && (
            <span className="inline-flex items-center px-1.5 min-w-5 h-5 rounded-full bg-indigo-500 text-white text-[11px] font-bold" aria-label={`${selected.length} active filters`}>
              {selected.length}
            </span>
          )}
          <ChevronDown className={cn('w-4 h-4 text-gray-500 transition-transform', open ? 'rotate-180' : '')} aria-hidden="true" />
        </button>
        {selected.length > 0 && (
          <button onClick={onClearAll} className="ml-auto text-xs text-gray-500 hover:text-white underline underline-offset-2">
            Clear all
          </button>
        )}
      </div>

      {open && (
        <div id="toolfeed-filters" className="flex flex-wrap items-center gap-1.5 px-3 pb-3" role="group" aria-label="Filter tools">
          {TOOL_FILTERS.map(f => {
            const active = selected.includes(f.id)
            return (
              <button
                key={f.id}
                onClick={() => onToggle(f.id)}
                aria-pressed={active}
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border transition-colors',
                  active
                    ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10',
                  f.id === 'all' && 'font-medium',
                )}
              >
                {f.label}
                {active && <X className="w-3 h-3" aria-hidden="true" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}