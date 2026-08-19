import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Command, TrendingUp, ArrowRight, Sparkles, Clock } from 'lucide-react'
import { useSearchStore } from '@/store/searchStore'
import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { useSearch, type SearchItem } from '@/search/hooks/useSearch'
import { SearchResultItem } from '@/search/components/SearchResultItem'
import { searchAnalytics } from '@/search/analytics/searchAnalytics'

export function SearchModal() {
  const { isOpen, query, setQuery, close } = useSearchStore()
  const { results, suggestions, recents, addRecent } = useSearch(query)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const items = results

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
    setSelectedIndex(0)
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        isOpen ? close() : useSearchStore.getState().open()
      }
      if (!isOpen) return
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(i => Math.min(i + 1, items.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(i => Math.max(i - 1, 0))
      }
      if (e.key === 'Enter' && items[selectedIndex]) {
        select(items[selectedIndex])
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, items, selectedIndex, navigate, close])

  const select = (item: SearchItem) => {
    searchAnalytics.resultClicked(query, item.slug, item.source)
    addRecent(item.name)
    navigate(item.source === 'ai' ? `/ai-tools/${item.slug}` : `/tools/${item.slug}`)
    close()
    useSearchStore.getState().setQuery('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={close} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl mx-4"
            role="dialog"
            aria-modal="true"
            aria-label="Search tools"
          >
            <div className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                <Search className="w-5 h-5 text-gray-500" aria-hidden="true" />
                <label htmlFor="global-search-input" className="sr-only">Search AI tools and Mega Tools</label>
                <input
                  id="global-search-input"
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => { setQuery(e.target.value); setSelectedIndex(0) }}
                  placeholder="Search AI tools + 2500+ Mega Tools..."
                  role="combobox"
                  aria-expanded="true"
                  aria-controls="search-results"
                  aria-activedescendant={items[selectedIndex] ? `result-${items[selectedIndex].slug}` : undefined}
                  autoComplete="off"
                  className="flex-1 bg-transparent text-white text-lg placeholder-gray-600 focus:outline-none"
                />
                <button onClick={close} aria-label="Close search" className="p-1 text-gray-600 hover:text-gray-400 transition-colors">
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              {/* Suggestions (autocomplete) */}
              {query && suggestions.length > 0 && (
                <div className="px-3 pt-3 flex flex-wrap gap-1.5" role="presentation">
                  {suggestions.map(s => (
                    <button
                      key={s}
                      onClick={() => { searchAnalytics.suggestionSelected(query, s); setQuery(s) }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-400" aria-hidden="true" /> {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Results */}
              <div id="search-results" className="max-h-[60vh] overflow-y-auto">
                {query ? (
                  items.length > 0 ? (
                    <div className="p-2 space-y-0.5">
                      {items.map((item, i) => (
                        <div key={`${item.source}-${item.slug}`} id={`result-${item.slug}`}>
                          <SearchResultItem item={item} active={i === selectedIndex} onSelect={() => select(item)} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-gray-500 mb-3">No results for "{query}"</p>
                      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-500">
                        <span>Try:</span>
                        {suggestions.length ? suggestions.slice(0, 4).map(s => (
                          <button key={s} onClick={() => setQuery(s)} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 hover:text-white">{s}</button>
                        )) : <span>a different spelling or a category name</span>}
                      </div>
                    </div>
                  )
                ) : (
                  <div className="p-4">
                    {recents.length > 0 && (
                      <>
                        <div className="flex items-center gap-2 text-xs text-gray-600 uppercase tracking-wider mb-2 px-2">
                          <Clock className="w-3 h-3" /> Recent
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-4 px-1">
                          {recents.map(r => (
                            <button key={r} onClick={() => setQuery(r)} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white">{r}</button>
                          ))}
                        </div>
                      </>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-600 uppercase tracking-wider mb-3 px-2">
                      <TrendingUp className="w-3 h-3" /> Quick Access
                    </div>
                    <div role="presentation">
                      <TrendingRow query={query} onSelect={(name) => setQuery(name)} />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-white/5 bg-black/20">
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-gray-500 font-mono">↑↓</kbd><span>Navigate</span></span>
                  <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-gray-500 font-mono">Enter</kbd><span>Open</span></span>
                  <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-gray-500 font-mono">Esc</kbd><span>Close</span></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Sparkles className="w-3 h-3 text-purple-500" /><span>Searching AI + Mega Tools</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Empty-state quick access — most popular tools (auto-improving). */
function TrendingRow({ query, onSelect }: { query: string; onSelect: (name: string) => void }) {
  const { trending } = useSearch(query)
  return (
    <div className="grid grid-cols-2 gap-1">
      {trending.map((t, i) => (
        <button
          key={t.slug}
          onClick={() => onSelect(t.name)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all text-left"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" aria-hidden="true" />
          <span className="truncate">{t.name}</span>
        </button>
      ))}
    </div>
  )
}