import { Link } from 'react-router-dom'
import type { CsvTool } from '@/data/csvData'
import { relatedQueriesForTool, relatedSearchUrl } from '@/discovery/relatedQueries'
import { ToolSection } from './ToolSection'

/**
 * Related Searches — reusable block. Real <Link> anchors to the working
 * ToolFeed search page (/tools?q=…). No fake URLs, no doorway pages.
 */
export function RelatedSearches({ tool, queries }: { tool: CsvTool; queries?: string[] }) {
  const items = queries ?? relatedQueriesForTool(tool)
  if (!items.length) return null
  return (
    <ToolSection title="Related searches">
      <div className="flex flex-wrap gap-2">
        {items.map((q) => (
          <Link
            key={q}
            to={relatedSearchUrl(q)}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white hover:bg-indigo-500/10 transition-colors"
          >
            {q}
          </Link>
        ))}
      </div>
    </ToolSection>
  )
}