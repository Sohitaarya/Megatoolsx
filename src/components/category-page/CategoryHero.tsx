import { ChevronRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

/**
 * Category Hub — hero. Name, SEO description, tool count and a primary CTA that
 * lives inside the category.
 */
export function CategoryHero({ name, slug, description, toolCount }: {
  name: string
  description: string
  slug: string
  toolCount: number
}) {
  return (
    <section aria-label={`${name} tools overview`} className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-transparent p-6 sm:p-10">
      <div className="relative max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs mb-4">
          <Sparkles className="w-3 h-3" aria-hidden="true" />
          <span>{toolCount} tools · Updated 2026</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          {name} <span className="text-indigo-400">Tools</span>
        </h1>
        <p className="text-gray-300 leading-relaxed max-w-2xl">{description}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="#browse" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">
            Browse {name} Tools <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <Link to={`/tools`} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm hover:bg-white/10 transition-colors">
            All {name} Guides
          </Link>
        </div>
      </div>
    </section>
  )
}