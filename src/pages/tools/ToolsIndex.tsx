import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { useToolsStore } from '@/store/toolsStore'
import { motion } from 'framer-motion'
import { Search, ExternalLink } from 'lucide-react'
import type { CsvTool } from '@/data/csvData'
import { StatusBadge } from '@/components/ui'
import { getCsvCategoryColor } from '@/lib/utils'
import { SEOHead } from '@/components/seo/SEOHead'
import { collectionPageSchema, breadcrumbSchema } from '@/components/seo/schemas'
import { DiscoveryWidget } from '@/discovery'

const SORT_OPTIONS = ['Alphabetical', 'Newest', 'Category'] as const

/** Unique title/meta per collection route (/tools, /trending, /new-tools, /popular). */
function routeMeta(pathname: string): { title: string; description: string; breadcrumbs: { name: string; path: string }[] } {
  switch (pathname) {
    case '/trending':
      return {
        title: 'Trending Tools',
        description: 'Discover the trending digital tools right now. Step-by-step guides, tutorials, and solutions for the most popular tools being searched today.',
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'Trending Tools', path: '/trending' },
        ],
      }
    case '/new-tools':
      return {
        title: 'New Tools',
        description: 'Newly added digital tool guides. Explore the latest tools added to the MegatoolsX database with full tutorials, features, and FAQs.',
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'New Tools', path: '/new-tools' },
        ],
      }
    case '/popular':
      return {
        title: 'Popular Tools',
        description: 'The most popular digital tools and software. Complete guides with how-to tutorials, troubleshooting, and expert tips for the tools everyone uses.',
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'Popular Tools', path: '/popular' },
        ],
      }
    default:
      return {
        title: 'All Tools',
        description: `Browse ${'tools'} — the complete MegatoolsX database of digital tool guides, tutorials, and solutions across every category.`,
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'All Tools', path: '/tools' },
        ],
      }
  }
}

export function ToolsIndex() {
  const { csvTools, csvCategories, filterCsvTools } = useToolsStore()
  const { pathname } = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('Alphabetical')

  const meta = routeMeta(pathname)

  // Reflect the search box in the URL (?q=) so the SearchAction schema target works,
  // and initialize from the URL on first mount.
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (search.trim()) {
      setSearchParams({ q: search.trim() }, { replace: true })
    } else {
      // Clear the query param when the user empties the box (replace current entry).
      setSearchParams({}, { replace: true })
    }
  }, [search, setSearchParams])

  let displayed = filterCsvTools({ category: selectedCategory, sort: sortBy === 'Alphabetical' ? 'alphabetical' : undefined })

  if (search) {
    const q = search.toLowerCase()
    displayed = displayed.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q)
    )
  }

  const listItems = displayed.slice(0, 500).map(t => ({ name: t.name, path: `/tools/${t.slug}` }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEOHead
        title={meta.title}
        description={meta.description}
        path={pathname}
        jsonLd={[
          collectionPageSchema({ title: meta.title, description: meta.description, path: pathname, items: listItems }),
          breadcrumbSchema(meta.breadcrumbs),
        ]}
      />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white mb-2">{meta.title}</h1>
        <p className="text-gray-400 mb-8">
          Browse {csvTools.length}+ tools from the CSV database across {csvCategories.length} categories
        </p>
      </motion.div>

      {/* Discovery Widgets */}
      <div className="border-t border-white/10 mt-10 pt-10">
        <DiscoveryWidget widget='trendingToday' limit={6} className="mt-10" />
        <DiscoveryWidget widget='popularTools' limit={6} className="mt-10" />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" aria-hidden="true" />
          <label htmlFor="tools-search" className="sr-only">Search tools</label>
          <input
            id="tools-search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tools by name, category, or description..."
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
        <label htmlFor="tools-category" className="sr-only">Filter by category</label>
        <select
          id="tools-category"
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          <option value="all">All Categories</option>
          {csvCategories.map(cat => (
            <option key={cat.slug} value={cat.slug}>{cat.name} ({cat.count})</option>
          ))}
        </select>
        <label htmlFor="tools-sort" className="sr-only">Sort tools</label>
        <select
          id="tools-sort"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500 mb-6">
        Showing {displayed.length} tools
      </div>

      {/* Tool Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayed.map((tool, i) => (
          <CsvToolCard key={tool.slug} tool={tool} index={i} />
        ))}
      </div>

      {/* Empty State */}
      {displayed.length === 0 && (
        <div className="text-center py-20">
          <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl text-white font-medium mb-2">No tools found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}

function CsvToolCard({ tool, index }: { tool: CsvTool; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.01 }}
      className="group p-5 rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.08] to-transparent hover:border-indigo-500/20 hover:bg-gradient-to-b hover:from-indigo-500/5 hover:to-transparent transition-all"
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
      <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-indigo-400 transition-colors truncate">
        {tool.name}
      </h3>
      <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 mb-2">
        {tool.category}
      </span>
      <p className="text-gray-500 text-xs mb-4 line-clamp-2">{tool.description}</p>
      <div className="flex items-center gap-2">
        <Link
          to={`/tools/${tool.slug}`}
          className="flex-1 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs text-center hover:bg-indigo-500/20 transition-all"
        >
          Open Guide
        </Link>
        <a
          href={`https://${tool.slug}.com`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-xs hover:text-white hover:bg-white/10 transition-all flex items-center gap-1"
        >
          <ExternalLink className="w-3 h-3" /> Open Tool
        </a>
      </div>
    </motion.div>
  )
}
