import { memo, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { WIDGET_DEFS, type WidgetId } from './definitions'
import { useSignals, useTrackDiscoveryClick } from '../hooks/useDiscovery'
import { analyticsApi } from '@/analytics'
import type { ScoredRecommendation } from '../ranking/scores'

/**
 * Discovery — configurable widget block. Given a widget id (and an optional
 * source tool slug), it renders a titled list of recommended tools. Every widget
 * is config; nothing is hardcoded. Renders nothing when there are no results.
 */
export const DiscoveryWidget = memo(function DiscoveryWidget({ widget, sourceSlug, limit = 6, title, className }: {
  widget: WidgetId
  sourceSlug?: string
  limit?: number
  title?: string
  className?: string
}) {
  const def = WIDGET_DEFS[widget]
  const signals = useSignals()
  const track = useTrackDiscoveryClick()
  const items: ScoredRecommendation[] = useMemo(
    () => def.builder(sourceSlug ?? '', signals, limit),
    [def, sourceSlug, signals, limit],
  )

  // Impression analytics — once per mount (no-op when analytics disabled).
  useEffect(() => {
    if (items.length > 0) analyticsApi.trackEvent('widget_impression', { widget, source: sourceSlug ?? '' })
  }, [widget, sourceSlug, items.length])

  if (items.length === 0) return null

  return (
    <section aria-label={title ?? def.title} className={className}>
      <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
        {title ?? def.title}
        <span className="text-xs font-normal text-gray-500">{items.length}</span>
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map(item => (
          <li key={item.slug}>
            <Link
              to={`/tools/${item.slug}`}
              onClick={() => track(widget, sourceSlug ?? '', item.slug, 'recommended')}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-indigo-500/5 hover:border-indigo-500/20 transition-all group"
            >
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0" aria-hidden="true">
                {item.slug.charAt(0).toUpperCase()}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-white text-sm truncate group-hover:text-indigo-400 transition-colors">{item.slug.replace(/-/g, ' ')}</span>
                {item.reason && <span className="block text-xs text-gray-500 truncate">{item.reason}</span>}
              </span>
              <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
})