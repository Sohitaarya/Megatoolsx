/**
 * Search Engine — page context model.
 *
 * A single, structured descriptor for any page. The SEO engine derives every
 * signal (title, description, keywords, canonical, schema, links, robots) from
 * this — so adding/updating pages never requires manual SEO edits.
 */

export type SeoKind =
  | 'home'
  | 'tools' | 'categories' | 'category'
  | 'tool' | 'toolSection'
  | 'aiTools' | 'aiTool' | 'aiToolSection'
  | 'blog' | 'blogPost'
  | 'static'

export interface SeoEntity {
  name: string
  slug?: string
  category?: string
  description?: string
  status?: string
  seoKeywords?: string
  metaDescription?: string
}

export interface SeoBreadcrumb { name: string; path: string }
export interface SeoItem { name: string; path: string }
export interface SeoFaq { q: string; a: string }

export interface SeoContext {
  kind: SeoKind
  /** Route path, e.g. "/tools/chatgpt". Used for canonical + hreflang. */
  path: string
  /** Optional explicit overrides (win over derived values). */
  title?: string
  description?: string
  keywords?: string
  entity?: SeoEntity
  breadcrumbs?: SeoBreadcrumb[]
  items?: SeoItem[]
  faqs?: SeoFaq[]
  publishedTime?: string
  modifiedTime?: string
  image?: string
  noIndex?: boolean
  /** Additional page-specific JSON-LD to merge in. */
  extraJsonLd?: object[]
}

export interface SeoLink { label: string; path: string }

export interface SeoResult {
  title: string
  description: string
  keywords?: string
  canonical: string
  robots: 'index,follow' | 'noindex,follow'
  jsonLd: object[]
  relatedLinks: SeoLink[]
  internalLinks: SeoLink[]
  /** Which schema types were emitted (for validation/monitoring). */
  schemaTypes: string[]
}
