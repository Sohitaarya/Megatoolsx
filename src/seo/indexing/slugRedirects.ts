/**
 * URL & Slug Integrity — legacy slug redirect map.
 *
 * Whenever the normalized slug differs from the raw CSV slug, the old URL must
 * permanently redirect to the new canonical URL. No redirect loops, no unrelated
 * tools. Built deterministically from the catalog (rawSlug → normalized slug).
 */

import { useToolsStore } from '@/store/toolsStore'

export interface SlugRedirect { from: string; to: string }

export function slugRedirects(): SlugRedirect[] {
  const { csvTools } = useToolsStore.getState()
  const out: SlugRedirect[] = []
  const seen = new Set<string>()
  for (const t of csvTools) {
    const from = t.rawSlug
    const to = t.slug
    if (!from || from === to) continue
    if (seen.has(from)) continue // no duplicates, no loops
    seen.add(from)
    out.push({ from, to })
  }
  return out
}

/** Look up a legacy redirect for a route slug, if any. */
export function redirectFor(slug: string): string | undefined {
  return slugRedirects().find(r => r.from === slug)?.to
}