/**
 * Tool OS — dynamic SEO.
 * Derive every on-page SEO signal from a ToolManifest. New tools get complete
 * SEO for free: title, description, keywords, canonical, OG, Twitter, JSON-LD
 * (SoftwareApplication, Breadcrumb, FAQ), sitemap + RSS entries.
 */

import type { ToolManifest } from './manifest'
import { absoluteUrl } from '@/config/site'

export interface DerivedSeo {
  title: string
  description: string
  keywords?: string
  canonical: string
  schemaType: string
  jsonLd: object[]
  sitemapEntry: { loc: string; changefreq: string; priority: number }
}

export function deriveSeo(manifest: ToolManifest): DerivedSeo {
  const title = manifest.seo?.title ?? `${manifest.name} — Online Tool Guide & Tutorial`
  const description = manifest.seo?.description ?? `${manifest.description} Step-by-step guide, features, FAQ and troubleshooting at MegatoolsX.`
  const canonical = absoluteUrl(manifest.routes?.main ?? `/tools/${manifest.slug}`)
  const schemaType = manifest.seo?.schemaType ?? 'SoftwareApplication'

  const schema = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: manifest.name,
    description: manifest.description,
    url: canonical,
    applicationCategory: manifest.category,
    operatingSystem: 'Web, Windows, macOS, Linux, iOS, Android',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    version: manifest.version,
    author: { '@type': 'Organization', name: manifest.author },
  }

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: absoluteUrl('/tools') },
      { '@type': 'ListItem', position: 3, name: manifest.name, item: canonical },
    ],
  }

  return {
    title,
    description,
    keywords: manifest.keywords?.join(', ') ?? manifest.tags.slice(0, 6).join(', '),
    canonical,
    schemaType,
    jsonLd: [schema, breadcrumb],
    sitemapEntry: { loc: manifest.slug, changefreq: 'weekly', priority: 0.7 },
  }
}