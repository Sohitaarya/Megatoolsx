import { useOutletContext, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { CsvTool } from '@/data/csvData'
import { getStatusInfo } from '@/data/csvData'
import { ToolSidebar, ToolActions } from '@/components/tool'
import { ToolEngine } from '@/components/tool-engine/ToolEngine'
import { useToolsStore } from '@/store/toolsStore'
import { useTrackView } from '@/hooks/useTrackView'
import { StatusBadge } from '@/components/ui'
import { getCsvCategoryColor } from '@/lib/utils'
import { ChevronRight, ExternalLink, Download, Globe, BookOpen, Sparkles, Play, Clock, Rocket } from 'lucide-react'
import { Helmet } from 'react-helmet-async'

export function CsvToolOverview() {
  const { tool, sameCategory } = useOutletContext<{ tool: CsvTool; sameCategory: CsvTool[] }>()
  const { aiTools } = useToolsStore()
  const catColor = getCsvCategoryColor(tool.category)
  const statusInfo = getStatusInfo(tool.status)

  useTrackView({ slug: tool.slug, name: tool.name, category: tool.category, source: 'csv' })

  return (
    <div className="min-h-screen bg-black">
      <Helmet>
        <title>{tool.name} - Use Online Free | MegatoolsX</title>
        <meta name="description" content={tool.description} />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-indigo-400">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/tools" className="hover:text-indigo-400">Tools</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">{tool.name}</span>
        </nav>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <ToolSidebar slug={tool.slug} />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Tool Header */}
              <div className="flex items-start gap-6 mb-8">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${catColor}, #6366f1)` }}
                >
                  {tool.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2">{tool.name}</h1>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <StatusBadge status={tool.status} size="md" />
                    <span
                      className="px-3 py-1 rounded-full text-sm border"
                      style={{ color: catColor, borderColor: `${catColor}40`, background: `${catColor}15` }}
                    >
                      {tool.category}
                    </span>
                  </div>
                  <p className="text-gray-400">{tool.description}</p>
                </div>
              </div>

              {/* Tool Actions: Save, Share, Compare, Rate, Print */}
              <ToolActions
                className="mb-8"
                ref={{ slug: tool.slug, name: tool.name, category: tool.category, source: 'csv' }}
              />

              {/* Tool Engine — differentiated by status */}
              <div className="mb-8">
                {tool.status === 'Future' ? (
                  <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-500/[0.05] to-transparent p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Clock className="w-5 h-5 text-amber-400" />
                      <span className="font-medium text-amber-300">{tool.name} is coming soon</span>
                    </div>
                    <p className="text-gray-400 leading-relaxed">
                      This tool is listed in our database as an upcoming release. We're preparing a full
                      interactive guide and a live version will appear here once it launches.
                      Meanwhile, explore the <Link to={`/category/${tool.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`} className="text-indigo-400 hover:underline">{tool.category}</Link> category for tools you can use right now.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-sm mb-4" style={{ color: tool.status === 'Generative' ? '#a855f7' : '#10b981' }}>
                      {tool.status === 'Generative'
                        ? <Rocket className="w-4 h-4" />
                        : <Play className="w-4 h-4" />}
                      <span className="font-medium">
                        {tool.status === 'Generative'
                          ? `Use ${tool.name} Online — New AI Tool`
                          : `Use ${tool.name} Online — Free Tool`}
                      </span>
                    </div>
                    <ToolEngine tool={tool} />
                  </>
                )}
              </div>

              {/* Main Content Card */}
              <div className="bg-gradient-to-b from-white/[0.03] to-transparent border border-white/5 rounded-2xl p-6 lg:p-8 space-y-8">
                <Section title={`What is ${tool.name}?`}>
                  <p className="text-gray-300 leading-relaxed">{tool.description}</p>
                </Section>

                <Section title="Category">
                  <Link to={`/category/${tool.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 text-sm hover:bg-indigo-500/20 transition-all">
                    {tool.category} <ChevronRight className="w-3 h-3" />
                  </Link>
                </Section>

                {tool.seoKeywords && (
                  <Section title="Keywords">
                    <div className="flex flex-wrap gap-2">
                      {tool.seoKeywords.split(',').map((kw, i) => (
                        <span key={i} className="px-2 py-1 rounded-lg bg-white/5 text-gray-400 text-xs">
                          {kw.trim()}
                        </span>
                      ))}
                    </div>
                  </Section>
                )}

                <Section title={`More in ${tool.category}`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {sameCategory.slice(0, 6).map(related => (
                      <Link key={related.slug} to={`/tools/${related.slug}`}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-indigo-500/5 hover:border-indigo-500/20 transition-all group">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                          style={{ background: `linear-gradient(135deg, ${getCsvCategoryColor(related.category)}, #6366f1)` }}
                        >
                          {related.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-white text-sm group-hover:text-indigo-400 transition-colors truncate">{related.name}</div>
                          <div className="text-gray-500 text-xs truncate">{related.category}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </Section>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
        <span className="w-1 h-6 bg-indigo-500 rounded-full inline-block" />
        {title}
      </h2>
      {children}
    </section>
  )
}
