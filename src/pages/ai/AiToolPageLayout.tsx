import { Outlet, useParams, Link } from 'react-router-dom'
import { useToolsStore } from '@/store/toolsStore'
import { useTrackView } from '@/hooks/useTrackView'
import { getAiToolDetail } from '@/data/aiToolData'
import { AiToolSidebar } from './AiToolSidebar'
import { StatusBadge } from '@/components/ui'
import { getCsvCategoryColor } from '@/lib/utils'
import { SEOHead } from '@/components/seo/SEOHead'
import { ChevronRight, Sparkles } from 'lucide-react'

export function AiToolPageLayout() {
  const { aiToolSlug } = useParams()
  const { aiTools } = useToolsStore()
  const tool = aiTools.find(t => t.slug === aiToolSlug)

  useTrackView(tool ? { slug: tool.slug, name: tool.name, category: tool.category, source: 'ai' } : null)

  if (!tool) {
    return (
      <>
        <SEOHead
          title="AI Tool Not Found"
          description="The requested AI tool does not exist on MegatoolsX. Browse the AI tools collection instead."
          noIndex
        />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Sparkles className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">AI Tool Not Found</h2>
            <p className="text-gray-400 mb-6">The AI tool you're looking for doesn't exist in our collection.</p>
            <Link to="/ai-tools" className="inline-flex px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-700 hover:to-purple-700 transition-all">
              Browse All AI Tools
            </Link>
          </div>
        </div>
      </>
    )
  }

  const detail = getAiToolDetail(tool)
  const catColor = getCsvCategoryColor(tool.category)

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/ai-tools" className="hover:text-indigo-400 transition-colors">AI Tools</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">{tool.name}</span>
        </nav>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <AiToolSidebar slug={tool.slug} />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Tool header */}
            <div className="flex items-start gap-6 mb-8">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${catColor}, #d946ef)` }}
              >
                {tool.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="text-3xl font-bold text-white">{tool.name}</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-xs border border-purple-500/20">AI Tool</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="px-3 py-1 rounded-full text-sm border"
                    style={{ color: catColor, borderColor: `${catColor}40`, background: `${catColor}15` }}
                  >
                    {tool.category}
                  </span>
                </div>
                <p className="text-gray-400 mt-3">{tool.description}</p>
              </div>
              <a
                href={detail.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-all shrink-0"
              >
                Visit Website
              </a>
            </div>

            <Outlet context={{ tool, detail }} />
          </div>
        </div>
      </div>
    </div>
  )
}
