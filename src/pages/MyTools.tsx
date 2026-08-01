import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Bookmark, Heart, Clock, Trash2 } from 'lucide-react'
import { useUserStore } from '@/store/userStore'
import { useToolsStore } from '@/store/toolsStore'
import { getColorForCategory } from '@/lib/utils'

type Tab = 'bookmarks' | 'favorites' | 'recent'

const TABS: { key: Tab; label: string; icon: typeof Bookmark }[] = [
  { key: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
  { key: 'favorites', label: 'Favorites', icon: Heart },
  { key: 'recent', label: 'Recently Viewed', icon: Clock },
]

export function MyTools() {
  const [tab, setTab] = useState<Tab>('bookmarks')
  const { bookmarks, favorites, recent, toggleBookmark, toggleFavorite } = useUserStore()
  const { csvTools } = useToolsStore()

  const list = tab === 'bookmarks' ? bookmarks : tab === 'favorites' ? favorites : recent

  const getPath = (source: 'csv' | 'ai') => source === 'ai' ? '/ai-tools' : '/tools'

  return (
    <div>
      <Helmet>
        <title>My Tools | MegatoolsX</title>
        <meta name="description" content="Your bookmarks, favorites, and recently viewed tools on MegatoolsX." />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">My Tools</h1>
          <p className="text-gray-400 text-lg">Your saved tools, stored locally in your browser.</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm transition-all ${
                tab === t.key
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              <span className="text-xs opacity-70">{list.length}</span>
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <div className="text-center py-20">
            <Bookmark className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl text-white font-medium mb-2">Nothing here yet</h3>
            <p className="text-gray-500 mb-8">Save tools with the <strong>Save</strong>, <strong>Like</strong>, or <strong>Compare</strong> buttons on any tool page.</p>
            <Link to="/tools" className="inline-flex px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-700 hover:to-purple-700 transition-all">
              Browse Tools
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((ref, i) => {
              const tool = ref.source === 'csv' ? csvTools.find(t => t.slug === ref.slug) : null
              return (
                <motion.div
                  key={ref.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="group p-5 rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.08] to-transparent hover:border-indigo-500/20 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Link to={`${getPath(ref.source)}/${ref.slug}`}>
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${getColorForCategory(ref.category)}, #6366f1)` }}
                      >
                        {ref.name.charAt(0)}
                      </div>
                    </Link>
                    <div className="flex items-center gap-1">
                      {tab === 'bookmarks' && (
                        <button
                          onClick={() => toggleBookmark(ref)}
                          title="Remove bookmark"
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-white/5 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      {tab === 'favorites' && (
                        <button
                          onClick={() => toggleFavorite(ref)}
                          title="Remove favorite"
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-white/5 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <Link to={`${getPath(ref.source)}/${ref.slug}`}>
                    <h3 className="text-white font-semibold mb-0.5 group-hover:text-indigo-400 transition-colors">{ref.name}</h3>
                  </Link>
                  <span className="text-xs text-indigo-400">{ref.category}</span>
                  {tool && <p className="text-gray-500 text-xs mt-2 line-clamp-2">{tool.description}</p>}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
