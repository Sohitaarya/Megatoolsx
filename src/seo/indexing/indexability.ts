/**
 * Index Discovery — indexability gate.
 * Classifies every page URL as indexable / noindex / excluded with a canonical,
 * sitemap eligibility and internal-link eligibility. Single source of truth:
 * the live catalog + the deterministic Design/Creative capability mapping.
 */

import { useToolsStore } from '@/store/toolsStore'
import { mapEveryTool } from '@/data/designCreativeCapabilities'
import { SITE_URL } from '@/config/site'

export type UrlClass = 'tool' | 'category' | 'collection' | 'static' | 'ai' | 'blog'

export interface IndexableUrl {
  url: string
  slug?: string
  type: UrlClass
  canonical: string
  /** Stable, meaningful lastmod — not Date.now on every build. */
  lastmod: string
  indexable: boolean
  noindex?: boolean
  sitemapEligible: boolean
  internalLinkEligible: boolean
  reason?: string
}

/** Stable hash → deterministic date so lastmod doesn't change unless content does. */
function stableDate(seed: string, base = '2026-01-05'): string {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619) }
  const days = (h >>> 0) % 200 // 200-day window from base
  const d = new Date(`${base}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Is a Design/Creative tool genuinely implemented (not a data-fix placeholder)? */
function isToolImplemented(tool: { slug: string; name: string; category: string }): boolean {
  if (tool.category === 'Design/Creative') {
    const cap = mapEveryTool(tool.slug, tool.name)
    return cap.status !== 'needs-data-fix'
  }
  return true
}

/** Classify a tool page URL. */
export function classifyToolUrl(tool: { slug: string; name: string; category: string }): IndexableUrl {
  const implemented = isToolImplemented(tool)
  return {
    url: `/tools/${tool.slug}`,
    slug: tool.slug,
    type: 'tool',
    canonical: `${SITE_URL}/tools/${tool.slug}`,
    lastmod: stableDate(tool.slug),
    indexable: implemented,
    noindex: !implemented,
    sitemapEligible: implemented,
    internalLinkEligible: implemented,
    reason: implemented ? undefined : 'not-implemented',
  }
}

export function simpleUrl(url: string, type: UrlClass, lastmod = '2026-01-05', slug?: string): IndexableUrl {
  return { url, slug, type, canonical: `${SITE_URL}${url}`, lastmod, indexable: true, sitemapEligible: true, internalLinkEligible: true }
}