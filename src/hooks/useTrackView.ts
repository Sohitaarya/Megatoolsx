import { useEffect } from 'react'
import { useUserStore } from '@/store/userStore'
import { analyticsApi } from '@/analytics'

type ToolRef = { slug: string; name: string; category: string; source: 'csv' | 'ai' }

/**
 * Records a "recently viewed" entry and a typed tool_open analytics event once
 * per mount. Place at the top of a tool detail page component.
 */
export function useTrackView(ref: ToolRef | null) {
  useEffect(() => {
    if (ref) {
      useUserStore.getState().addRecent(ref)
      analyticsApi.trackToolOpen({ tool: ref.slug, category: ref.category, source: ref.source })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref?.slug])
}
