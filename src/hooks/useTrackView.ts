import { useEffect } from 'react'
import { useUserStore } from '@/store/userStore'

type ToolRef = { slug: string; name: string; category: string; source: 'csv' | 'ai' }

/**
 * Records a "recently viewed" entry once per mount.
 * Place at the top of a tool detail page component.
 */
export function useTrackView(ref: ToolRef | null) {
  useEffect(() => {
    if (ref) useUserStore.getState().addRecent(ref)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref?.slug])
}
