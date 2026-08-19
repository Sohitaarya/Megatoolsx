import { SearchX, ArrowLeft, TrendingUp, Sparkles } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ToolFilterId } from './toolFeedUtils'

/**
 * ToolFeed — empty state. Never leaves a blank screen: shows the query/filters,
 * recovery actions (clear filters, back), plus popular/trending tools and
 * related categories to search next.
 */
export function EmptyResults({ query, activeFilters, onClearFilters, onBack, popular, trending, related, onSearch }: {
  query: string
  activeFilters: ToolFilterId[]
  onClearFilters: () => void
  onBack: () => void
  popular: string[]
  trending: string[]
  related: string[]
  onSearch: (term: string) => void
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="py-12 text-center"
      role="status"
    >
      <SearchX className="w-12 h-12 text-gray-600 mx-auto mb-4" aria-hidden="true" />
      <h2 className="text-xl font-semibold text-white mb-1">No matching tools found</h2>
      {query && <p className="text-gray-500 text-sm mb-1">No results for “{query}”</p>}
      {activeFilters.length > 0 && (
        <p className="text-gray-500 text-xs mb-5">Active filters: {activeFilters.join(' · ')}</p>
      )}

      <div className="flex items-center justify-center gap-3 mb-8">
        <button onClick={onClearFilters} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">
          Clear filters
        </button>
        <button onClick={onBack} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to all tools
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
        <Recovery title="Popular tools" items={popular} onSearch={onSearch} icon={<Sparkles className="w-4 h-4" />} />
        <Recovery title="Trending now" items={trending} onSearch={onSearch} icon={<TrendingUp className="w-4 h-4" />} />
        <Recovery title="Related categories" items={related} onSearch={onSearch} icon={<SearchX className="w-4 h-4" />} />
      </div>
    </motion.div>
  )
}

function Recovery({ title, items, onSearch, icon }: { title: string; items: string[]; onSearch: (t: string) => void; icon: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
      <h3 className="flex items-center gap-2 text-sm font-medium text-white mb-2">{icon}{title}</h3>
      <div className="flex flex-wrap gap-1.5">
        {items.length === 0 && <span className="text-xs text-gray-600">—</span>}
        {items.map(item => (
          <button
            key={item}
            onClick={() => onSearch(item)}
            className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  )
}