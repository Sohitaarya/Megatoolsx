/**
 * Discovery — anonymous personalization signals.
 * Session-only, no login: derives signals from the user store (recently viewed,
 * favorites) and derives category affinity. Never stores personal data.
 */

import { useUserStore } from '@/store/userStore'
import { catalog } from '../entities/catalog'
import type { ToolNode } from '../entities/catalog'

export interface UserSignals {
  recentTools: string[]
  recentCategories: string[]
  favoriteTools: string[]
}

function categoryOf(slug: string): string {
  return catalog().tools.find(t => t.slug === slug)?.categorySlug ?? ''
}

/** Read the current anonymous session signals from the store. */
export function readSignals(): UserSignals {
  const store = useUserStore.getState()
  const recentTools = store.recent.slice(0, 12).map(r => r.slug)
  const favoriteTools = store.favorites.slice(0, 12).map(f => f.slug)
  const cats = new Set<string>()
  for (const r of store.recent) { const c = categoryOf(r.slug); if (c) cats.add(c) }
  for (const f of store.favorites) { const c = categoryOf(f.slug); if (c) cats.add(c) }
  return { recentTools, recentCategories: Array.from(cats).slice(0, 8), favoriteTools }
}

/** Stable helper for callers that need the signals memoized per page. */
export function emptySignals(): UserSignals {
  return { recentTools: [], recentCategories: [], favoriteTools: [] }
}