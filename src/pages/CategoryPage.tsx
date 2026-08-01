import { useParams, Link } from 'react-router-dom'
import { useToolsStore } from '@/store/toolsStore'
import { motion } from 'framer-motion'
import { ChevronRight, ExternalLink, Bookmark, Share2, Search } from 'lucide-react'
import { StatusBadge } from '@/components/ui'
import { getCsvCategoryColor } from '@/lib/utils'

export function CategoryPage() {
  const { categorySlug } = useParams()
  const { csvTools, csvCategories } = useToolsStore()

  // Find matching category
  const category = csvCategories.find(c => c.slug === categorySlug)
  const tools = category
    ? csvTools.filter(t => {
        const tSlug = t.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        return tSlug === categorySlug
      })
    : []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-indigo-400">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/tools" className="hover:text-indigo-400">Tools</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-white">{category?.name || categorySlug}</span>
      </nav>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white mb-2">{category?.name || categorySlug}</h1>
        <p className="text-gray-400 mb-8">{tools.length} tools in this category</p>
      </motion.div>

      {tools.length === 0 ? (
        <div className="text-center py-20">
          <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl text-white font-medium mb-2">Category not found</h3>
          <p className="text-gray-500">Browse all tools from the <Link to="/tools" className="text-indigo-400 hover:underline">Mega Tools</Link> page.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.01 }}
              className="group p-5 rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.08] to-transparent hover:border-indigo-500/20 hover:from-indigo-500/5 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${getCsvCategoryColor(tool.category)}, #6366f1)` }}
                >
                  {tool.name.charAt(0)}
                </div>
                <StatusBadge status={tool.status} />
              </div>
              <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-indigo-400 transition-colors truncate">{tool.name}</h3>
              <p className="text-gray-500 text-xs mb-4 line-clamp-2">{tool.description}</p>
              <div className="flex items-center gap-2">
                <Link to={`/tools/${tool.slug}`} className="flex-1 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs text-center hover:bg-indigo-500/20 transition-all">Open Guide</Link>
                <a href={`https://${tool.slug}.com`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-xs hover:text-white hover:bg-white/10 transition-all"><ExternalLink className="w-3 h-3" /></a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
