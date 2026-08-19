/**
 * Search Engine — Canonical + Internal-link engines.
 */

import { SITE_URL, absoluteUrl } from '@/config/site'
import type { SeoContext, SeoLink } from './types'

/** Normalize a path → absolute canonical URL (lowercase, no trailing slash except root). */
export function canonicalEngine(ctx: SeoContext | string): string {
  const path = typeof ctx === 'string' ? ctx : ctx.path
  let p = path || '/'
  if (p !== '/' && p.endsWith('/')) p = p.slice(0, -1)
  if (/[A-Z]/.test(p)) p = p.toLowerCase()
  return absoluteUrl(p)
}

/** Trailing-slash / casing variants to 301 (for docs + redirect monitoring). */
export function canonicalVariants(path: string): string[] {
  const variants = new Set<string>()
  if (path !== '/') variants.add(path + '/')
  variants.add(path.toUpperCase())
  if (path !== path.toLowerCase()) variants.add(path.toLowerCase() + '/')
  return Array.from(variants)
}

const FALLBACK_LINKS: SeoLink[] = [
  { label: 'All Tools', path: '/tools' },
  { label: 'AI Tools', path: '/ai-tools' },
  { label: 'Categories', path: '/categories' },
]

/**
 * Internal-link engine — builds contextual related links from the tool/category
 * context. `related` is provided by the caller (from the store); when empty it
 * returns the universally-safe navigation links (never empty).
 */
export function internalLinkEngine(
  ctx: SeoContext,
  related: SeoLink[] = [],
  extra: SeoLink[] = [],
): SeoLink[] {
  const seen = new Set<string>()
  const out: SeoLink[] = []

  const push = (l: SeoLink) => {
    if (seen.has(l.path)) return
    seen.add(l.path)
    out.push(l)
  }

  // Contextual category/tool links first.
  if (ctx.entity?.category) {
    const catSlug = categorySlug(ctx.entity.category)
    push({ label: `More ${ctx.entity.category} Tools`, path: `/category/${catSlug}` })
  }
  for (const l of related) push(l)
  for (const l of extra) push(l)

  // Always guarantee navigation links, but after contextual ones.
  for (const l of FALLBACK_LINKS) push(l)
  if (out.length === 0) push({ label: 'Home', path: '/' })

  // Cap to avoid link spam (Google prefers focused internal linking).
  return out.slice(0, 12)
}

function categorySlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export { SITE_URL }