import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useToolsStore } from '@/store/toolsStore'
import { ExternalLink, Sparkles } from 'lucide-react'
import { SEOHead } from '@/components/seo/SEOHead'
import { collectionPageSchema, breadcrumbSchema } from '@/components/seo/schemas'

const aiCategories = [
  { name: 'All AI Tools', slug: 'all' },
  { name: 'AI Chatbots', slug: 'ai-chatbots' },
  { name: 'AI Writing', slug: 'ai-writing' },
  { name: 'AI Image Generation', slug: 'ai-image-generation' },
  { name: 'AI Video', slug: 'ai-video' },
  { name: 'AI Audio', slug: 'ai-audio' },
  { name: 'AI Coding', slug: 'ai-coding' },
  { name: 'AI Search', slug: 'ai-search' },
  { name: 'AI Design', slug: 'ai-design' },
  { name: 'AI Productivity', slug: 'ai-productivity' },
]

export function AiTools() {
  const { aiTools } = useToolsStore()
  const description = 'Curated collection of the best AI-powered tools and platforms. Guides, how-to tutorials, downloads, pricing, and FAQs for ChatGPT, Claude, Gemini, Midjourney and more.'
  const breadcrumbs = [{ name: 'Home', path: '/' }, { name: 'AI Tools', path: '/ai-tools' }]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEOHead
        title="AI Tools Collection"
        description={description}
        path="/ai-tools"
        jsonLd={[
          collectionPageSchema({
            title: 'AI Tools Collection',
            description,
            path: '/ai-tools',
            items: aiTools.map(t => ({ name: t.name, path: `/ai-tools/${t.slug}` })),
          }),
          breadcrumbSchema(breadcrumbs),
        ]}
      />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">AI Tools Collection</h1>
        </div>
        <p className="text-gray-400 mb-8">
          Curated collection of the best AI-powered tools and platforms
        </p>
      </motion.div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {aiCategories.map((cat) => (
          <button
            key={cat.slug}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-400 transition-all"
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* AI Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {aiTools.map((tool, i) => (
          <motion.div
            key={tool.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
            className="group p-5 rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.08] to-transparent hover:border-indigo-500/20 hover:bg-gradient-to-b hover:from-indigo-500/10 hover:to-transparent transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {tool.name.charAt(0)}
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">
                {tool.category}
              </span>
            </div>
            <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-indigo-400 transition-colors">
              {tool.name}
            </h3>
            <p className="text-gray-500 text-xs mb-4 line-clamp-2">{tool.description}</p>
            <div className="flex items-center gap-2">
              <Link
                to={`/ai-tools/${tool.slug}`}
                className="flex-1 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs text-center hover:bg-indigo-500/20 transition-all"
              >
                Open Guide
              </Link>
              <a
                href={`https://${tool.slug}.com`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-xs hover:text-white hover:bg-white/10 transition-all"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
