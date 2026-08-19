import { Link } from 'react-router-dom'
import type { CsvTool } from '@/data/csvData'
import { getCsvCategoryColor } from '@/lib/utils'
import { useRecommendations } from '@/discovery/hooks/useDiscovery'
import { ToolSection } from './ToolSection'
import { RelatedSearches } from './RelatedSearches'

/**
 * Tool Page — related tools, powered by the Discovery Engine.
 * Shows scored recommendations (with reasons) when available, and always falls
 * back to same-category tools or site links so a tool page is never an orphan.
 */
export function ToolRelated({ tool, related, fallback }: {
  tool: CsvTool
  related: CsvTool[]
  fallback?: { name: string; path: string }[]
}) {
  const recommendations = useRecommendations(tool.slug, 6)
  const recSlugs = new Set(recommendations.map(r => r.slug))
  const sameCategory = related.filter(r => !recSlugs.has(r.slug)).slice(0, 6)
  const fallbacks = fallback ?? []

  return (
    <>
      {recommendations.length > 0 && (
        <ToolSection title="Related Tools" icon="✨">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recommendations.map((rec) => (
              <Link key={rec.slug} to={`/tools/${rec.slug}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-indigo-500/5 hover:border-indigo-500/20 transition-all group">
                <div
                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                  aria-hidden="true"
                >
                  {rec.slug.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-white text-sm group-hover:text-indigo-400 transition-colors truncate capitalize">{rec.slug.replace(/-/g, ' ')}</div>
                  <div className="text-gray-500 text-xs truncate">{rec.reason}</div>
                </div>
              </Link>
            ))}
          </div>
        </ToolSection>
      )}

      {sameCategory.length > 0 && (
        <ToolSection title={`More in ${tool.category}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sameCategory.map((rel) => {
              const color = getCsvCategoryColor(rel.category)
              return (
                <Link key={rel.slug} to={`/tools/${rel.slug}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-indigo-500/5 hover:border-indigo-500/20 transition-all group">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${color}, #6366f1)` }}
                    aria-hidden="true"
                  >
                    {rel.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-white text-sm group-hover:text-indigo-400 transition-colors truncate">{rel.name}</div>
                    <div className="text-gray-500 text-xs truncate">{rel.category}</div>
                  </div>
                </Link>
              )
            })}
          </div>
        </ToolSection>
      )}

      {recommendations.length === 0 && sameCategory.length === 0 && (
        <ToolSection title={`More in ${tool.category}`}>
          <div className="flex flex-wrap gap-2">
            {fallbacks.length ? fallbacks.map((l, i) => (
              <Link key={i} to={l.path} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white">{l.name}</Link>
            )) : <Link to="/tools" className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-400">Browse All Tools</Link>}
          </div>
        </ToolSection>
      )}

      <RelatedSearches tool={tool} />
    </>
  )
}