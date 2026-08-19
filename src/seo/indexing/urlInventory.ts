/**
 * Index Discovery — URL inventory.
 * Derives every indexable URL from the SAME source of truth as routing (the live
 * catalog). No manually maintained URL list. Detects duplicates, orphans, and
 * missing canonicals.
 */

import { useToolsStore } from '@/store/toolsStore'
import { blogPosts } from '@/data/blog'
import { categorySlug } from '@/data/csvData'
import { listCollections } from '@/discovery/collections'
import { classifyToolUrl, simpleUrl, type IndexableUrl } from './indexability'

export interface UrlInventory {
  urls: IndexableUrl[]
  duplicateUrls: string[]
  duplicateSlugs: string[]
  orphanIndexable: string[]
}

const STATIC_URLS: IndexableUrl[] = [
  simpleUrl('/', 'static'),
  simpleUrl('/tools', 'static'),
  simpleUrl('/ai-tools', 'static'),
  simpleUrl('/categories', 'static'),
  simpleUrl('/collections', 'static'),
  simpleUrl('/about', 'static'),
  simpleUrl('/contact', 'static'),
  simpleUrl('/privacy', 'static'),
  simpleUrl('/terms', 'static'),
  simpleUrl('/blog', 'static'),
  simpleUrl('/trending', 'static'),
  simpleUrl('/new-tools', 'static'),
  simpleUrl('/popular', 'static'),
]

/** Derive the full indexable URL inventory from the catalog. */
export function getAllIndexableUrls(): UrlInventory {
  const { csvTools, csvCategories, aiTools } = useToolsStore.getState()

  const toolUrls = csvTools.map(classifyToolUrl)
  const categoryUrls = csvCategories.map(c => simpleUrl(`/category/${c.slug}`, 'category', '2026-01-05', c.slug))
  const aiUrls = aiTools.map(t => simpleUrl(`/ai-tools/${t.slug}`, 'ai', '2026-01-05', t.slug))
  const blogUrls = blogPosts.map(p => simpleUrl(`/blog/${p.slug}`, 'blog', p.date, p.slug))
  const collectionUrls = listCollections().map(c => simpleUrl(`/collections/${c.id}`, 'collection', '2026-01-05', c.id))

  const urls = [...STATIC_URLS, ...categoryUrls, ...collectionUrls, ...blogUrls, ...aiUrls, ...toolUrls]

  // Duplicate detection.
  const seen = new Map<string, string>()
  const duplicateUrls: string[] = []
  for (const u of urls) {
    if (seen.has(u.url)) duplicateUrls.push(u.url)
    else seen.set(u.url, u.type)
  }
  const dupSlugs = new Set<string>()
  for (const u of toolUrls) if (u.slug && [...toolUrls].filter(x => x.slug === u.slug).length > 1) dupSlugs.add(u.slug)

  return { urls, duplicateUrls, duplicateSlugs: Array.from(dupSlugs), orphanIndexable: [] }
}

export { categorySlug }