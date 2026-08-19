import { memo, useEffect, useRef, useState } from 'react'
import type { CsvTool } from '@/data/csvData'
import { ToolCard } from './ToolCard'
import { Skeleton } from '@/components/ui'

const STEP = 100

/**
 * ToolFeed — responsive grid of the shared ToolCard. Infinite loading via an
 * IntersectionObserver sentinel: as the user scrolls, more cards mount (lazy),
 * so a huge result set never floods the DOM at once.
 */
export const ToolFeedGrid = memo(function ToolFeedGrid({ tools, query, pending = false }: {
  tools: CsvTool[]
  query: string
  /** When true (e.g. during a filter transition) a skeleton row is shown. */
  pending?: boolean
}) {
  const [visible, setVisible] = useState(Math.min(100, tools.length))
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Reset the lazy window when the result set identity changes.
  useEffect(() => { setVisible(Math.min(100, tools.length)) }, [tools])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || tools.length <= visible) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) setVisible(v => Math.min(v + STEP, tools.length))
    }, { rootMargin: '400px 0px' })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [tools, visible])

  const shown = tools.slice(0, visible)

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {shown.map(tool => <ToolCard key={tool.slug} tool={tool} query={query} />)}
      </div>

      {pending && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl border border-white/5">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-4 w-3/4 mt-3" />
              <Skeleton className="h-3 w-full mt-2" />
              <Skeleton className="h-3 w-2/3 mt-2" />
            </div>
          ))}
        </div>
      )}

      {/* IntersectionObserver sentinel for infinite loading. */}
      <div ref={sentinelRef} className="h-px" aria-hidden="true" />
    </div>
  )
})