import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Command, TrendingUp, ArrowRight, Sparkles } from 'lucide-react'
import { useSearchStore } from '@/store/searchStore'
import { useToolsStore } from '@/store/toolsStore'
import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export function SearchModal() {
  const { isOpen, query, setQuery, close } = useSearchStore()
  const { searchAll, csvTools, aiTools } = useToolsStore()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const results = searchAll(query)

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
        setSelectedIndex(i => Math.min(i + 1, results.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(i => Math.max(i - 1, 0))
      }
      if (e.key === 'Enter' && results[selectedIndex]) {
        const r = results[selectedIndex]
        const path = r.source === 'ai' ? `/ai-tools/${r.tool.slug}` : `/tools/${r.tool.slug}`
        navigate(path)
        close()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex, navigate, close])

  const handleSelect = (slug: string, source: 'ai' | 'csv') => {
    navigate(source === 'ai' ? `/ai-tools/${slug}` : `/tools/${slug}`)
    close()
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
          >
            <div className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                <Search className="w-5 h-5 text-gray-500" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search AI tools + 2500+ Mega Tools..."
                  className="flex-1 bg-transparent text-white text-lg placeholder-gray-600 focus:outline-none"
                />
                <button onClick={close} className="p-1 text-gray-600 hover:text-gray-400 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {query ? (
                  results.length > 0 ? (
                    <div className="p-2 space-y-0.5">
                      {results.map((result, i) => (
                        <button
                          key={`${result.source}-${result.tool.slug}`}
                          onClick={() => handleSelect(result.tool.slug, result.source)}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all',
                            i === selectedIndex ? 'bg-indigo-500/10 text-white' : 'text-gray-400 hover:bg-white/5'
                          )}
                        >
                          <div className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0',
                            result.source === 'ai' ? 'bg-gradient-to-br from-purple-500 to-pink-600' : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                          )}>
                            {result.tool.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{result.tool.name}</div>
                            <div className="text-xs text-gray-600 flex items-center gap-1">
                              {result.source === 'ai' ? <Sparkles className="w-3 h-3 text-purple-400" /> : null}
                              <span>{result.source === 'ai' ? 'AI Tool' : result.tool.category}</span>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-gray-500">No results found for "{query}"</p>
                    </div>
                  )
                ) : (
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-xs text-gray-600 uppercase tracking-wider mb-3 px-2">
                      <TrendingUp className="w-3 h-3" />
                      Quick Access
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {csvTools.slice(0, 12).map(tool => (
                        <button
                          key={tool.slug}
                          onClick={() => handleSelect(tool.slug, 'csv')}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all text-left"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                          <span className="truncate">{tool.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-white/5 bg-black/20">
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-gray-500 font-mono">↑↓</kbd>
                    <span>Navigate</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-gray-500 font-mono">Enter</kbd>
                    <span>Open</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-gray-500 font-mono">Esc</kbd>
                    <span>Close</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  <span>Searching AI + Mega Tools</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
