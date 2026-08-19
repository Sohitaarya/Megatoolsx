import { Link } from 'react-router-dom'
import type { CsvTool } from '@/data/csvData'
import { categorySlug, getStatusInfo } from '@/data/csvData'
import { getToolDisplayName } from '@/data/designCreativeToolNames'
import { StatusBadge } from '@/components/ui'
import { getCsvCategoryColor } from '@/lib/utils'

/** Approx. reading time from text length (min(smaller: 1). */
function estimateReadTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

/**
 * Tool Page — hero. Icon, name, category, status and short description in a
 * consistent header across every tool.
 */
export function ToolHero({ tool, action }: { tool: CsvTool; action?: React.ReactNode }) {
  const catColor = getCsvCategoryColor(tool.category)
  const catSlug = categorySlug(tool.category)
  const displayName = getToolDisplayName(tool)

  return (
    <div className="flex items-start gap-5 sm:gap-6">
      <div
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${catColor}, #6366f1)` }}
        aria-hidden="true"
      >
        {displayName.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mr-1">{displayName}</h1>
          <StatusBadge status={tool.status} size="md" />
        </div>
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <Link
            to={`/category/${catSlug}`}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm border transition-colors hover:border-white/20"
            style={{ color: catColor, borderColor: `${catColor}40`, background: `${catColor}15` }}
          >
            {tool.category}
          </Link>
        </div>
        <p className="text-gray-400 text-sm sm:text-base">{tool.description}</p>
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
          <span aria-hidden="true">⏱</span> ~{estimateReadTime(tool.description)}
          <span aria-hidden="true">·</span> <span>Updated 2026</span>
          <span aria-hidden="true">·</span> <span>By MegatoolsX</span>
        </div>
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  )
}