import { useParams, Link } from 'react-router-dom'
import { useToolsStore } from '@/store/toolsStore'
import { ChevronRight, Search } from 'lucide-react'
import { categorySlug } from '@/data/csvData'
import { SEOHead } from '@/components/seo/SEOHead'
import { collectionPageSchema, breadcrumbSchema } from '@/components/seo/schemas'
import { ToolFeed } from '@/components/category'
import { DiscoveryWidget } from '@/discovery'

export function CategoryPage() {
  const { categorySlug: categorySlugParam } = useParams()
  const { csvTools, csvCategories } = useToolsStore()

  const category = csvCategories.find(c => c.slug === categorySlugParam)
  const tools = csvTools.filter(t => categorySlug(t.category) === categorySlugParam)

  const name = category?.name || categorySlugParam || 'Category'
  const path = `/category/${categorySlugParam}`
  const title = `${name} Tools — Guides, Tutorials & FAQ`
  const description = `${tools.length} ${name.toLowerCase()} tools with step-by-step guides, tutorials, features, FAQs, and troubleshooting solutions. Learn how to use every ${name.toLowerCase()} tool like a pro at MegatoolsX.`
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Tools', path: '/tools' },
    { name: name, path },
  ]
  const listItems = tools.map(t => ({ name: t.name, path: `/tools/${t.slug}` }))

  const notFound = tools.length === 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEOHead
        title={notFound ? `Category Not Found` : title}
        description={notFound ? 'The requested tool category does not exist on MegatoolsX. Browse all available tool categories and guides.' : description}
        path={notFound ? undefined : path}
        noIndex={notFound}
        jsonLd={notFound ? [] : [
          collectionPageSchema({ title, description, path, items: listItems }),
          breadcrumbSchema(breadcrumbs),
        ]}
      />

      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-indigo-400">Home</Link>
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
        <Link to="/tools" className="hover:text-indigo-400">Tools</Link>
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
        <span className="text-white">{name}</span>
      </nav>

      {notFound ? (
        <div className="text-center py-20">
          <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" aria-hidden="true" />
          <h1 className="text-xl text-white font-medium mb-2">Category not found</h1>
          <p className="text-gray-500">Browse all tools from the <Link to="/tools" className="text-indigo-400 hover:underline">Mega Tools</Link> page.</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-1">{name} Tools</h1>
            <p className="text-gray-400">{tools.length} tools in this category</p>
          </div>
          {/* Universal category feed: search + sort + multi-select filters + grid + pagination,
              URL-synced, with empty-state recovery. Reuses the shared ToolCard.) */}
          <ToolFeed tools={tools} categoryName={name} />
          <section className="mt-14 space-y-4">
            <DiscoveryWidget widget='aiRecommended' limit={6} className="mt-10" />
            <DiscoveryWidget widget='popularTools' limit={6} className="mt-10" />
          </section>
        </>
      )}
    </div>
  )
}