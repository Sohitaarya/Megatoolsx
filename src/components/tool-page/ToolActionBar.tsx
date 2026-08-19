import { Play, Download, ExternalLink, RotateCcw, Flag } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CsvTool } from '@/data/csvData'
import { ToolActions } from '@/components/tool'
import { analyticsApi } from '@/analytics'

/**
 * Tool Page — unified action bar. Reuses the existing ToolActions (copy, share,
 * bookmark, favorite, compare, print, rating) and adds Run / Download / Reset /
 * Open / Report — with analytics wired automatically.
 */
export function ToolActionBar({ tool, onRun, onReset, runLabel }: {
  tool: CsvTool
  onRun?: () => void
  onReset?: () => void
  runLabel?: string
}) {
  const base = { tool: tool.slug, category: tool.category }

  const handleDownload = () => {
    analyticsApi.trackDownload({ tool: tool.slug, fileType: 'app' })
    window.open(`https://${tool.slug}.com/download`, '_blank', 'noopener,noreferrer')
  }

  const handleOpen = () => {
    analyticsApi.trackEvent('tool_open_external', { tool: tool.slug })
    window.open(`https://${tool.slug}.com`, '_blank', 'noopener,noreferrer')
  }

  const handleReset = () => {
    analyticsApi.trackEvent('tool_reset', base)
    onReset?.()
  }

  const handleReport = () => {
    analyticsApi.trackEvent('tool_report', base)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {onRun && (
          <button
            onClick={() => { analyticsApi.trackToolRun(base); onRun() }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
          >
            <Play className="w-4 h-4" aria-hidden="true" /> {runLabel ?? `Run ${tool.name}`}
          </button>
        )}
        {onReset && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm hover:bg-white/10 transition-colors"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" /> Reset
          </button>
        )}
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm hover:bg-white/10 transition-colors"
        >
          <Download className="w-4 h-4" aria-hidden="true" /> Download
        </button>
        <button
          onClick={handleOpen}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm hover:bg-white/10 transition-colors"
        >
          <ExternalLink className="w-4 h-4" aria-hidden="true" /> Open
        </button>
        <Link
          to="/contact"
          onClick={handleReport}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm hover:bg-white/10 transition-colors"
        >
          <Flag className="w-4 h-4" aria-hidden="true" /> Report
        </Link>
      </div>
      <ToolActions
        ref={{ slug: tool.slug, name: tool.name, category: tool.category, source: 'csv' }}
      />
    </div>
  )
}