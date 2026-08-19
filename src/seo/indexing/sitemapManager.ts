/**
 * Index Discovery — sitemap manager (planning + validation side).
 * Groups eligible URLs into per-type sitemaps, respects Google's 50k/50MB limits,
 * and validates invariants (no duplicates, no non-eligible URLs, https host).
 */

import { SITE_URL } from '@/config/site'
import { getToolUrl } from './getToolUrl'
import type { IndexableUrl } from './indexability'

export const MAX_URLS_PER_SITEMAP = 45000 // safety margin under Google's 50,000

export interface SitemapGroup {
  name: string
  urls: IndexableUrl[]
}

export interface SitemapPlan {
  groups: SitemapGroup[]
  sitemapFiles: string[]
  indexXml: string
  /** Invariant violations. */
  violations: string[]
}

const HOST = new URL(SITE_URL).host

/** Group eligible URLs by type into sitemaps. */
export function planSitemaps(urls: IndexableUrl[]): SitemapPlan {
  const eligible = urls.filter(u => u.indexable && u.sitemapEligible)
  const violations: string[] = []

  // Invariants.
  const seen = new Set<string>()
  for (const u of eligible) {
    if (seen.has(u.url)) violations.push(`duplicate URL: ${u.url}`)
    seen.add(u.url)
    if (!u.canonical.startsWith(SITE_URL)) violations.push(`wrong host: ${u.canonical}`)
    if (u.type === 'tool' && !u.url.startsWith('/tools/')) violations.push(`wrong /tools/ prefix: ${u.url}`)
  }

  // Group by type (deterministic split per group to respect limits).
  const groups: SitemapGroup[] = []
  const byType = new Map<IndexableUrl['type'], IndexableUrl[]>()
  for (const u of eligible) {
    const list = byType.get(u.type) ?? []
    list.push(u)
    byType.set(u.type, list)
  }
  for (const [type, list] of byType) {
    for (let i = 0; i < list.length; i += MAX_URLS_PER_SITEMAP) {
      const chunk = list.slice(i, i + MAX_URLS_PER_SITEMAP)
      groups.push({ name: `sitemap-${type}-${i / MAX_URLS_PER_SITEMAP + 1}.xml`, urls: chunk })
    }
  }

  const sitemapFiles = groups.map(g => g.name)
  const indexXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemapFiles.map(f => `  <sitemap><loc>${SITE_URL}/${f}</loc></sitemap>`),
    '</sitemapindex>',
    '',
  ].join('\n')

  return { groups, sitemapFiles, indexXml, violations }
}

export { getToolUrl, HOST }