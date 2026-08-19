/**
 * Discovery — smart collections.
 * Config-driven collections ("Best AI Tools", "Developer Essentials", …) built
 * by the DiscoveryEngine. Adding a collection is a config entry.
 */

import { discoveryEngine, type CollectionDef } from '../engine/DiscoveryEngine'
import type { ScoredRecommendation } from '../ranking/scores'

export type { CollectionDef }

/** Build a collection by id (e.g. 'best-ai', 'developer-essentials'). */
export function buildCollection(id: string, limit = 8): ScoredRecommendation[] {
  return discoveryEngine.collections().find(c => c.id === id)?.build(limit) ?? []
}

export function listCollections(): CollectionDef[] {
  return discoveryEngine.collections()
}