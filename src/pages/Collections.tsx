import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import { SEOHead } from '@/components/seo/SEOHead'
import { listCollections, buildCollection } from '@/discovery/collections'

/**
 * Collections — index of every smart collection (Best AI Tools, Developer
 * Essentials, Trending This Month, …). Config-driven from the Discovery Engine.
 */
export function Collections() {
  const collections = listCollections()
  const description = `Curated tool collections — Best AI Tools, Developer Essentials, PDF, Image and more. Discover the right tools faster at MegatoolsX.`
  const breadcrumbs = [{ name: 'Home', path: '/' }, { name: 'Collections', path: '/collections' }]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEOHead
        title="Tool Collections"
        description={description}
        path="/collections"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Tool Collections',
            description,
            url: 'https://megatoolsx.com/collections',
            mainEntity: {
              '@type': 'ItemList',
              itemListElement: collections.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, url: `https://megatoolsx.com/collections/${c.id}` })),
            },
          },
          { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: breadcrumbs.map((b, i) => ({ '@type': 'ListItem', position: i + 1, name: b.name, item: `https://megatoolsx.com${b.path}` })) },
        ]}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Tool Collections</h1>
        <p className="text-gray-400">Curated sets of the best tools — updated automatically from the Discovery Engine.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map((col, i) => {
          const preview = buildCollection(col.id, 3)
          return (
            <Link key={col.id} to={`/collections/${col.id}`} className="group">
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="p-6 rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.06] to-transparent hover:border-indigo-500/20 hover:from-indigo-500/5 transition-all h-full"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-xs text-gray-500">{preview.length}+ tools</span>
                </div>
                <h2 className="text-white font-semibold mb-1 group-hover:text-indigo-400 transition-colors">{col.label}</h2>
                {col.blurb && <p className="text-gray-500 text-sm mb-3">{col.blurb}</p>}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {preview.map(p => (
                    <span key={p.slug} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-gray-400">{p.slug.replace(/-/g, ' ')}</span>
                  ))}
                </div>
                <span className="inline-flex items-center gap-1 text-indigo-400 text-sm">
                  View collection <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </span>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}