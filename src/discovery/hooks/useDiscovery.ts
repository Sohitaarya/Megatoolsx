/**
 * Discovery — React hooks.
 * useRecommendations / useCollection / useDiscovery wrap the engine with the
 * current anonymous session signals, memoized for cheap re-renders.
 */

import { useCallback, useMemo } from 'react'
import { discoveryEngine } from '../engine/DiscoveryEngine'
import { readSignals, type UserSignals } from '../personalization/signals'
import type { ScoredRecommendation } from '../ranking/scores'

/** Memoized session signals for the current render. */
export function useSignals(): UserSignals {
  return useMemo(() => readSignals(), [])
}

/** Recommendations for a tool, personalization-aware. */
export function useRecommendations(slug: string, limit = 6): ScoredRecommendation[] {
  const signals = useSignals()
  return useMemo(() => discoveryEngine.recommendForTool(slug, signals, limit), [slug, signals, limit])
}

/** Top scored tools in a category. */
export function useCategoryTools(categorySlug: string, limit = 6): ScoredRecommendation[] {
  const signals = useSignals()
  return useMemo(() => discoveryEngine.recommendForCategory(categorySlug, signals, limit), [categorySlug, signals, limit])
}

/** Build a smart collection by id. */
export function useCollection(id: string, limit = 6): ScoredRecommendation[] {
  return useMemo(() => {
    const col = discoveryEngine.collections().find(c => c.id === id)
    return col ? col.build(limit) : []
  }, [id, limit])
}

/** Track a recommendation click (stable callback). */
export function useTrackDiscoveryClick(): (block: string, from: string, to: string, rel: string) => void {
  return useCallback((block, from, to, rel) => discoveryEngine.track({ block, from, to, relationshipType: rel }), [])
}