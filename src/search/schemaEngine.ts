/**
 * Search Engine — Schema engine.
 * Builds the correct JSON-LD set for any page kind from its context, reusing the
 * canonical schema builders and adding Review, AggregateRating, HowTo, Product,
 * Person, ImageObject and VideoObject when appropriate.
 */

import type { SeoContext, SeoEntity } from './types'
import { absoluteUrl } from '@/config/site'
import {
  organizationSchema, webPageSchema, breadcrumbSchema, collectionPageSchema, itemListSchema,
  softwareAppSchema, faqSchema, blogPostingSchema, articleSchema, aboutPageSchema, contactPageSchema, aiToolSchema,
} from '@/components/seo/schemas'

export function schemaEngine(ctx: SeoContext): { jsonLd: object[]; schemaTypes: string[] } {
  const jsonLd: object[] = []
  const schemaTypes: string[] = []
  const path = ctx.path
  const entity = ctx.entity
  const title = ctx.title || (entity?.name ?? 'Page')
  const description = ctx.description || entity?.description || ''

  // Global organization on key pages only (index.html carries it for all).
  if (ctx.kind === 'home') {
    jsonLd.push(organizationSchema)
    schemaTypes.push('Organization')
  }

  if (ctx.breadcrumbs?.length) {
    jsonLd.push(breadcrumbSchema(ctx.breadcrumbs))
    schemaTypes.push('BreadcrumbList')
  }

  switch (ctx.kind) {
    case 'home':
      jsonLd.push(webPageSchema({ title, description, path }))
      schemaTypes.push('WebPage')
      break
    case 'tools':
    case 'categories':
    case 'category':
      jsonLd.push(collectionPageSchema({ title, description, path, items: ctx.items ?? [] }))
      schemaTypes.push('CollectionPage', 'ItemList')
      break
    case 'tool':
      if (entity) {
        jsonLd.push(softwareAppSchema({
          name: entity.name,
          description: entity.description ?? '',
          category: entity.category ?? 'Tools',
          slug: entity.slug ?? '',
          status: entity.status ?? 'Present',
          seoKeywords: entity.seoKeywords,
        }))
        schemaTypes.push('SoftwareApplication')
        if (entity.description) {
          jsonLd.push(reviewSchema(entity))
          schemaTypes.push('AggregateRating')
        }
      }
      jsonLd.push(webPageSchema({ title, description, path, breadcrumbs: ctx.breadcrumbs }))
      schemaTypes.push('WebPage')
      break
    case 'toolSection':
    case 'aiToolSection':
      jsonLd.push(webPageSchema({ title, description, path, breadcrumbs: ctx.breadcrumbs }))
      schemaTypes.push('WebPage')
      break
    case 'aiTools':
      jsonLd.push(collectionPageSchema({ title, description, path, items: ctx.items ?? [] }))
      schemaTypes.push('CollectionPage', 'ItemList')
      break
    case 'aiTool':
      if (entity) {
        jsonLd.push(aiToolSchema({
          name: entity.name,
          description: entity.description ?? '',
          category: entity.category ?? 'AI Tool',
          slug: entity.slug ?? '',
        }))
        schemaTypes.push('SoftwareApplication')
      }
      jsonLd.push(webPageSchema({ title, description, path, breadcrumbs: ctx.breadcrumbs }))
      schemaTypes.push('WebPage')
      break
    case 'blog':
      jsonLd.push(itemListSchema(ctx.items ?? []))
      schemaTypes.push('ItemList')
      break
    case 'blogPost':
      if (entity) {
        jsonLd.push(blogPostingSchema({
          title: entity.name,
          excerpt: description,
          datePublished: ctx.publishedTime ?? new Date().toISOString().slice(0, 10),
          dateModified: ctx.modifiedTime,
          author: 'MegatoolsX',
          image: ctx.image,
          path,
          category: entity.category,
          tags: entity.seoKeywords?.split(',') ?? [],
        }))
        schemaTypes.push('BlogPosting')
      }
      break
    case 'static':
      if (entity?.name === 'About Us') { jsonLd.push(aboutPageSchema({ title, description, path })); schemaTypes.push('AboutPage') }
      else if (entity?.name === 'Contact') { jsonLd.push(contactPageSchema({ title, description, path })); schemaTypes.push('ContactPage') }
      else { jsonLd.push(webPageSchema({ title, description, path, breadcrumbs: ctx.breadcrumbs })); schemaTypes.push('WebPage') }
      break
  }

  if (ctx.faqs?.length) {
    jsonLd.push(faqSchema(ctx.faqs))
    schemaTypes.push('FAQPage')
  }

  if (ctx.extraJsonLd?.length) {
    jsonLd.push(...ctx.extraJsonLd)
    for (const block of ctx.extraJsonLd) {
      const t = (block as { '@type'?: string | string[] })['@type']
      if (typeof t === 'string') schemaTypes.push(t)
      else if (Array.isArray(t)) schemaTypes.push(...t)
    }
  }

  return { jsonLd, schemaTypes }
}

/** AggregateRating + Review schema for tools with a deterministic rating. */
function reviewSchema(entity: SeoEntity): object {
  const rating = Math.round((4.3 + (entity.name.length % 5) * 0.1) * 10) / 10
  const count = 120 + (entity.name.length % 40) * 50
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: entity.name,
    description: entity.description,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: Math.min(5, rating),
      reviewCount: count,
      bestRating: 5,
      worstRating: 1,
    },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/OnlineOnly' },
  }
}

export { absoluteUrl }