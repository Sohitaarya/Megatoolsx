import { useOutletContext, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, ExternalLink, Download, ChevronRight, Check, X, Star, Play } from 'lucide-react'
import { Button } from '@/components/ui'
import { ToolActions } from '@/components/tool'
import { getCsvCategoryColor } from '@/lib/utils'
import type { CsvTool } from '@/data/csvData'
import type { AiToolDetail } from '@/data/aiToolData'
import { SEOHead } from '@/components/seo/SEOHead'
import { aiToolSchema, breadcrumbSchema, webPageSchema, faqSchema } from '@/components/seo/schemas'

export function AiToolOverview() {
  const { tool, detail } = useOutletContext<{ tool: CsvTool; detail: AiToolDetail }>()
  const catColor = getCsvCategoryColor(tool.category)
  const path = `/ai-tools/${tool.slug}`
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'AI Tools', path: '/ai-tools' },
    { name: tool.name, path },
  ]

  return (
    <div>
      <SEOHead
        title={`${tool.name} — AI Tool Guide, How to Use & Download`}
        description={tool.description}
        path={path}
        keywords={`${tool.name}, ai tool, ${tool.category.toLowerCase()}`}
        type="product"
        jsonLd={[
          webPageSchema({ title: `${tool.name} — AI Tool Guide`, description: tool.description, path, breadcrumbs }),
          aiToolSchema(tool),
          breadcrumbSchema(breadcrumbs),
          faqSchema(detail.faqs.slice(0, 5)),
        ]}
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Tool actions */}
        <ToolActions
          className="mb-8"
          ref={{ slug: tool.slug, name: tool.name, category: tool.category, source: 'ai' }}
        />

        {/* Quick actions */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <a href={detail.website} target="_blank" rel="noopener noreferrer">
            <Button icon={ExternalLink} size="lg">Use {tool.name} Online</Button>
          </a>
          <Link to={`/ai-tools/${tool.slug}/download`}>
            <Button variant="outline" size="lg" icon={Download}>Download {tool.name}</Button>
          </Link>
          <Link to={`/ai-tools/${tool.slug}/how-to-use`}>
            <Button variant="secondary" size="lg" icon={Play}>How to Use</Button>
          </Link>
        </div>

        {/* Main content card */}
        <div className="bg-gradient-to-b from-white/[0.03] to-transparent border border-white/5 rounded-2xl p-6 lg:p-8 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-1 h-6 rounded-full inline-block" style={{ background: catColor }} />
              What is {tool.name}?
            </h2>
            <p className="text-gray-300 leading-relaxed">{tool.description}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-1 h-6 rounded-full inline-block" style={{ background: catColor }} />
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {detail.features.slice(0, 8).map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{f}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-1 h-6 rounded-full inline-block" style={{ background: catColor }} />
              Download {tool.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {detail.downloads.map((d, i) => (
                <a
                  key={i}
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group"
                >
                  <div className="text-white font-medium group-hover:text-purple-400 transition-colors">{d.platform}</div>
                  <div className="text-gray-500 text-xs mt-1">{d.description}</div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-purple-400 mt-2" />
                </a>
              ))}
            </div>
            <div className="mt-4">
              <Link to={`/ai-tools/${tool.slug}/download`} className="inline-flex items-center gap-1 text-purple-400 text-sm hover:text-purple-300 transition-colors">
                Full download guide <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-1 h-6 rounded-full inline-block" style={{ background: catColor }} />
              Pros & Cons
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                {detail.pros.map((p, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />{p}
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {detail.cons.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />{c}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-1 h-6 rounded-full inline-block" style={{ background: catColor }} />
              Pricing Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {detail.pricing.map((plan, i) => (
                <div key={i} className={`p-4 rounded-xl border ${plan.popular ? 'border-purple-500/40 bg-purple-500/5' : 'border-white/5 bg-white/[0.03]'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">{plan.plan}</span>
                    {plan.popular && <Star className="w-4 h-4 text-purple-400 fill-current" />}
                  </div>
                  <div className="text-2xl font-bold text-white mt-2">{plan.price}</div>
                  <ul className="mt-3 space-y-1">
                    {plan.features.slice(0, 3).map((f, j) => (
                      <li key={j} className="text-xs text-gray-400 flex items-start gap-1.5">
                        <Check className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />{f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-1 h-6 rounded-full inline-block" style={{ background: catColor }} />
              Explore {tool.name}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                ['How to Use', 'how-to-use'], ['Installation', 'installation'], ['Features', 'features'],
                ['Pricing', 'pricing'], ['Pros & Cons', 'pros-cons'], ['Alternatives', 'alternatives'],
                ['FAQ', 'faq'], ['Security', 'security'], ['Tips & Tricks', 'tips'],
              ].map(([label, path]) => (
                <Link key={path} to={`/ai-tools/${tool.slug}/${path}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group">
                  <span className="text-gray-300 text-sm group-hover:text-purple-400 transition-colors">{label}</span>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-purple-400" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  )
}
