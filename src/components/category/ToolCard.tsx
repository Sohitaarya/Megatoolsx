import { memo } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import type { CsvTool } from '@/data/csvData'
import { StatusBadge } from '@/components/ui'
import { getCsvCategoryColor } from '@/lib/utils'
import { prefetchRoute } from '@/shared/lib/prefetch'
import { highlightParts } from './toolFeedUtils'

/**
 * ToolFeed — shared tool card. One card implementation for every grid that lists
 * CSV tools. Memoized, and it prefetches its (code-split) route chunk on hover so
 * navigation feels instant.
 */
export const ToolCard = memo(function ToolCard({ tool, query = '' }: { tool: CsvTool; query?: string }) {
  const catColor = getCsvCategoryColor(tool.category)
  const to = `/tools/${tool.slug}`

  return (
    <Link
      to={to}
      onMouseEnter={() => prefetchRoute(to)}
      className="group p-5 rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.08] to-transparent hover:border-indigo-500/20 hover:from-indigo-500/5 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${catColor}, #6366f1)` }}
          aria-hidden="true"
        >
          {tool.name.charAt(0)}
        </div>
        <StatusBadge status={tool.status} />
      </div>
      <h2 className="text-white font-semibold text-sm mb-1 group-hover:text-indigo-400 transition-colors truncate">
        <Highlighted text={tool.name} query={query} />
      </h2>
      <p className="text-gray-500 text-xs mb-4 line-clamp-2">
        <Highlighted text={tool.description} query={query} />
      </p>
      <div className="flex items-center gap-2">
        <span className="flex-1 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs text-center group-hover:bg-indigo-500/20 transition-colors">
          Open Guide
        </span>
        <a
          href={`https://${tool.slug}.com`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          aria-label={`Open ${tool.name} website`}
          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-xs hover:text-white hover:bg-white/10 transition-all"
        >
          <ExternalLink className="w-3 h-3" aria-hidden="true" />
        </a>
      </div>
    </Link>
  )
})

/** Renders a name/description, wrapping matched query tokens in <mark>. */
function Highlighted({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>
  const parts = highlightParts(text, query)
  return (
    <>
      {parts.map((p, i) => (p.match
        ? <mark key={i} className="bg-indigo-500/30 text-white rounded px-0.5">{p.text}</mark>
        : <span key={i}>{p.text}</span>))}
    </>
  )
}