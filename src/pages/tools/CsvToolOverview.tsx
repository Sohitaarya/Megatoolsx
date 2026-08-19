import { useOutletContext, Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { CsvTool } from '@/data/csvData'
import { categorySlug, toolMetaDescription, toolTitle } from '@/data/csvData'
import { getToolDisplayName } from '@/data/designCreativeToolNames'
import { ToolSidebar } from '@/components/tool'
import { ToolEngine } from '@/components/tool-engine/ToolEngine'
import { useToolsStore } from '@/store/toolsStore'
import { useTrackView } from '@/hooks/useTrackView'
import { SEOHead } from '@/components/seo/SEOHead'
import { breadcrumbSchema, softwareAppSchema, webPageSchema, faqSchema } from '@/components/seo/schemas'
import { ToolPageLayout, ToolDescription, ToolFeatures } from '@/components/tool-page'

export function CsvToolOverview() {
  const { tool, sameCategory } = useOutletContext<{ tool: CsvTool; sameCategory: CsvTool[] }>()
  const { aiTools } = useToolsStore()

  useTrackView({ slug: tool.slug, name: tool.name, category: tool.category, source: 'csv' })

  const description = toolMetaDescription(tool)
  const displayName = getToolDisplayName(tool)
  const path = `/tools/${tool.slug}`
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Tools', path: '/tools' },
    { name: tool.category, path: `/category/${categorySlug(tool.category)}` },
    { name: displayName, path },
  ]
  const faqs = [
    { q: `What is ${displayName}?`, a: `${displayName} is a ${tool.category.toLowerCase()} tool that ${tool.description.toLowerCase()}` },
    { q: `Is ${displayName} free?`, a: `MegatoolsX provides a free guide and overview for ${displayName}. Pricing varies by plan — check the official website for current rates.` },
    { q: `How do I get started with ${displayName}?`, a: `Visit the ${displayName} page, follow the step-by-step "How to Use" guide, and explore the FAQ section.` },
    { q: `What platforms does ${displayName} support?`, a: 'Most online tools in this category work on all major browsers and operating systems.' },
  ]

  const scrollToEngine = () => {
    document.getElementById('tool-engine')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-black">
      <SEOHead
        title={toolTitle(tool)}
        description={description}
        path={path}
        keywords={tool.seoKeywords}
        type="product"
        jsonLd={[
          webPageSchema({ title: `${displayName} — Guide`, description, path, breadcrumbs }),
          softwareAppSchema({ ...tool, name: displayName }),
          breadcrumbSchema(breadcrumbs),
          faqSchema(faqs),
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-indigo-400">Home</Link>
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
          <Link to="/tools" className="hover:text-indigo-400">Tools</Link>
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
          <Link to={`/category/${categorySlug(tool.category)}`} className="hover:text-indigo-400">{tool.category}</Link>
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
          <span className="text-white">{displayName}</span>
        </nav>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <ToolSidebar slug={tool.slug} />
            </div>
          </aside>

          {/* Main content — composed from the universal tool-page framework */}
          <div className="flex-1 min-w-0">
            <ToolPageLayout
              tool={tool}
              related={sameCategory}
              onRun={scrollToEngine}
              runLabel={`Use ${displayName} Online`}
              engine={
                <div id="tool-engine">
                  <ToolEngine tool={tool} />
                </div>
              }
            >
              <ToolDescription tool={tool} />
              <ToolFeatures tool={tool} />

              {tool.seoKeywords && (
                <section aria-label="Keywords" className="space-y-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <span className="w-1 h-6 bg-indigo-500 rounded-full inline-block" aria-hidden="true" />
                    Keywords
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {tool.seoKeywords.split(',').map((kw, i) => (
                      <span key={i} className="px-2 py-1 rounded-lg bg-white/5 text-gray-400 text-xs">{kw.trim()}</span>
                    ))}
                  </div>
                </section>
              )}
            </ToolPageLayout>
          </div>
        </div>
      </div>
    </div>
  )
}