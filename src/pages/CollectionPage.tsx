import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, Sparkles } from 'lucide-react'
import { SEOHead } from '@/components/seo/SEOHead'
import { collectionPageSchema, breadcrumbSchema } from '@/components/seo/schemas'
import { listCollections, buildCollection } from '@/discovery/collections'
import { useTrackDiscoveryClick } from '@/discovery/hooks/useDiscovery'

/**
 * Collection — renders a single smart collection (Best AI Tools, Developer
 * Essentials, …) as an ItemList with real links. Config-driven.
 */
export function CollectionPage() {
  const { collectionId } = useParams()
  const track = useTrackDiscoveryClick()
  const def = listCollections().find(c => c.id === collectionId)
  const items = def ? buildCollection(def.id, 24) : []
  const notFound = !def

  const path = `/collections/${collectionId ?? ''}`
  const title = notFound ? 'Collection Not Found' : `${def.label} — Tool Collection`
  const description = notFound
    ? 'The requested tool collection does not exist. Browse all collections at MegatoolsX.'
    : `${def.blurb ?? def.label} — a curated set of the best tools, updated automatically.`
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Collections', path: '/collections' },
    { name: def?.label ?? 'Collection', path },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEOHead
        title={title}
        description={description}
        path={path}
        noIndex={notFound}
        jsonLd={notFound ? [] : [
          collectionPageSchema({
            title: def.label, description, path,
            items: items.map(i => ({ name: i.slug.replace(/-/g, ' '), path: `/tools/${i.slug}` })),
          }),
          breadcrumbSchema(breadcrumbs),
        ]}
      />

      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-indigo-400">Home</Link>
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
        <Link to="/collections" className="hover:text-indigo-400">Collections</Link>
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
        <span className="text-white">{def?.label ?? 'Not found'}</span>
      </nav>

      {notFound ? (
        <div className="text-center py-20">
          <h1 className="text-xl text-white font-medium mb-2">Collection not found</h1>
          <p className="text-gray-500">Browse all collections from the <Link to="/collections" className="text-indigo-400 hover:underline">Collections</Link> page.</p>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs mb-3">
              <Sparkles className="w-3 h-3" aria-hidden="true" /> {items.length} tools
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{def.label}</h1>
            {def.blurb && <p className="text-gray-400">{def.blurb}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item, i) => (
              <motion.div key={item.slug} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.01 }}>
                <Link
                  to={`/tools/${item.slug}`}
                  onClick={() => track('collection', def.id, item.slug, 'collection_item')}
                  className="block p-5 rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.08] to-transparent hover:border-indigo-500/20 hover:from-indigo-500/5 transition-all"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm" aria-hidden="true">
                      {item.slug.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-white font-semibold text-sm capitalize truncate">{item.slug.replace(/-/g, ' ')}</div>
                  </div>
                  <div className="text-xs text-gray-500">{item.reason}</div>
                </Link>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}