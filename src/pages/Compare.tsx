import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Scale, X, Trash2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui'
import { useUserStore } from '@/store/userStore'
import { useToolsStore } from '@/store/toolsStore'
import { getColorForCategory } from '@/lib/utils'

export function Compare() {
  const { compare, clearCompare, toggleCompare, getRating } = useUserStore()
  const { csvTools } = useToolsStore()

  const items = compare.map(ref => {
    if (ref.source === 'ai') {
      return {
        ref,
        name: ref.name,
        category: ref.category,
        description: 'AI tool',
        path: `/ai-tools/${ref.slug}`,
      }
    }
    const tool = csvTools.find(t => t.slug === ref.slug)
    return {
      ref,
      name: tool?.name || ref.name,
      category: tool?.category || ref.category,
      description: tool?.description || 'CSV tool',
      path: `/tools/${ref.slug}`,
    }
  })

  const rows = [
    { label: 'Category', get: (i: typeof items[number]) => i.category },
    { label: 'Your Rating', get: (i: typeof items[number]) => {
      const r = getRating(i.ref.slug)
      return r ? `${r}/5` : '—'
    } },
    { label: 'Type', get: (i: typeof items[number]) => i.ref.source === 'ai' ? 'AI Tool' : 'Mega Tool' },
    { label: 'Description', get: (i: typeof items[number]) => i.description },
  ]

  return (
    <div>
      <Helmet>
        <title>Compare Tools | MegatoolsX</title>
        <meta name="description" content="Compare your favorite tools side by side on MegatoolsX." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm mb-6">
            <Scale className="w-4 h-4" />
            <span>Compare Tools</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Tool Comparison</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Compare up to 4 tools side by side. Use the <strong>Compare</strong> button on any tool page to add it here.
          </p>
        </motion.div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <Scale className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl text-white font-medium mb-2">No tools selected</h3>
            <p className="text-gray-500 mb-8">Browse tools and click "Compare" on any tool page to add it here.</p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/tools"><Button>Browse Mega Tools</Button></Link>
              <Link to="/ai-tools"><Button variant="outline">Browse AI Tools</Button></Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-end mb-4">
              <button
                onClick={clearCompare}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Clear All
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="w-40 p-4 text-left text-gray-500 font-medium">Property</th>
                    {items.map(item => (
                      <th key={item.ref.slug} className="p-4 text-left min-w-[200px]">
                        <div className="flex items-start gap-2">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                            style={{ background: `linear-gradient(135deg, ${getColorForCategory(item.category)}, #6366f1)` }}
                          >
                            {item.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <Link to={item.path} className="text-white font-semibold hover:text-indigo-400 transition-colors">
                              {item.name}
                            </Link>
                            <button
                              onClick={() => toggleCompare(item.ref)}
                              className="block mt-1 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 transition-colors"
                            >
                              <X className="w-3 h-3" /> Remove
                            </button>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={row.label} className={i % 2 === 0 ? 'bg-white/[0.02]' : ''}>
                      <td className="p-4 text-gray-500 font-medium border-t border-white/5">{row.label}</td>
                      {items.map(item => (
                        <td key={item.ref.slug} className="p-4 text-gray-300 border-t border-white/5">
                          {row.get(item)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td className="p-4 text-gray-500 font-medium border-t border-white/5">Open</td>
                    {items.map(item => (
                      <td key={item.ref.slug} className="p-4 border-t border-white/5">
                        <Link to={item.path} className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors">
                          View Guide <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-sm text-gray-600 mt-6">
              Compare up to {4} tools. Add more from any tool page with the <strong>Compare</strong> button.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
