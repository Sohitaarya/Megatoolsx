/**
 * URL & Slug Integrity — SINGLE source of truth for tool slugs + URLs.
 *
 * Every consumer (routing, canonical, sitemap, internal links, Discovery,
 * breadcrumbs, search) must resolve a tool URL through these functions so that:
 *   route == canonical == sitemap == link  ==  /tools/<same-normalized-slug>
 *
 * Rules (stable + deterministic):
 *   lowercase → trim → spaces→hyphens → strip invalid chars → collapse hyphens
 *   → strip leading/trailing hyphens → dedupe with a -N suffix.
 */

import { SITE_URL } from '@/config/site'

/** Normalize one slug (no dedupe). Pure + deterministic. */
export function normalizeSlug(raw: string): string {
  return String(raw || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Clean + dedupe a slug against a shared `used` set (call in catalog row order). */
export function cleanToolSlug(rawSlug: string, name: string, used: Set<string>): string {
  let base = normalizeSlug(rawSlug)
  if (!base) base = normalizeSlug(name)
  let slug = base
  let i = 2
  while (used.has(slug)) slug = `${base}-${i++}`
  used.add(slug)
  return slug
}

/** Relative canonical route for a tool. */
export function getToolUrl(slug: string): string {
  return `/tools/${slug}`
}

/** Absolute canonical URL for a tool. */
export function getToolAbsoluteUrl(slug: string): string {
  return `${SITE_URL}${getToolUrl(slug)}`
}