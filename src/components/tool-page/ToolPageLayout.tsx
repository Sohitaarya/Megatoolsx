import type { ReactNode } from 'react'
import type { CsvTool } from '@/data/csvData'
import { ToolHero } from './ToolHero'
import { ToolStats } from './ToolStats'
import { ToolActionBar } from './ToolActionBar'
import { ToolRelated } from './ToolRelated'

/**
 * Tool Page — universal layout. Wraps the interactive engine and any page sections
 * with a consistent hero + stats + action bar + related block. Every tool page
 * composes through this, so there is exactly one layout for all 2,500 tools.
 */
export function ToolPageLayout({
  tool,
  engine,
  children,
  related,
  onRun,
  onReset,
  runLabel,
}: {
  tool: CsvTool
  /** The interactive tool engine (existing implementation). */
  engine?: ReactNode
  /** Extra content sections rendered below the engine. */
  children?: ReactNode
  /** Same-category tools computed by the caller. */
  related: CsvTool[]
  onRun?: () => void
  onReset?: () => void
  runLabel?: string
}) {
  return (
    <div className="space-y-8">
      <ToolHero
        tool={tool}
        action={<div className="flex flex-wrap gap-2"><RunChip tool={tool} /></div>}
      />

      <ToolStats tool={tool} />

      <ToolActionBar tool={tool} onRun={onRun} onReset={onReset} runLabel={runLabel} />

      {engine && (
        <section aria-label={`${tool.name} tool`}>
          {engine}
        </section>
      )}

      {children}

      {related.length > 0 && <ToolRelated tool={tool} related={related} />}
    </div>
  )
}

function RunChip({ tool }: { tool: CsvTool }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
      style={tool.status === 'Generative' ? { color: '#a855f7', borderColor: '#a855f740', background: '#a855f715' } : { color: '#10b981', borderColor: '#10b98140', background: '#10b98115' }}>
      {tool.status === 'Generative' ? '🟣 New AI Tool' : '✅ Working Tool'}
    </span>
  )
}