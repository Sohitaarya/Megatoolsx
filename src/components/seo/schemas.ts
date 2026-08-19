import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, LOGO_IMAGE, absoluteUrl } from '@/config/site'

/* ────────────────────────────────────────────────────────────────
 * Schema.org builders — every function returns a plain object that
 * gets rendered as JSON-LD. Keep them pure & deterministic.
 * ──────────────────────────────────────────────────────────────── */

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    '@id': `${SITE_URL}/#logo`,
    url: LOGO_IMAGE,
    width: 512,
    height: 512,
  },
  image: LOGO_IMAGE,
  description: SITE_DESCRIPTION,
  sameAs: [
    'https://x.com/megatoolsx',
    'https://github.com/megatoolsx',
  ],
}

// NOTE: the WebSite + SearchAction schema is declared statically in index.html so it is
// present for JS-less crawlers and never duplicated. Do not re-add a websiteSchema here.

export function webPageSchema(opts: {
  title: string
  description: string
  path: string
  breadcrumbs?: { name: string; path: string }[]
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: opts.title,
    description: opts.description,
    url: absoluteUrl(opts.path),
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#organization` },
    ...(opts.breadcrumbs && opts.breadcrumbs.length ? { breadcrumb: breadcrumbId(opts.breadcrumbs) } : {}),
  }
}

/** Stable @id for a breadcrumb list based on its path (deduplicates repeat renders). */
function breadcrumbId(items: { name: string; path: string }[]): { '@id': string } {
  const key = items.map(i => i.path).join('>')
  return { '@id': `${SITE_URL}/#breadcrumb-${key}` }
}

export function breadcrumbSchema(items: { name: string; path: string }[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': breadcrumbId(items)['@id'],
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function collectionPageSchema(opts: {
  title: string
  description: string
  path: string
  items: { name: string; path: string }[]
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: opts.title,
    description: opts.description,
    url: absoluteUrl(opts.path),
    isPartOf: { '@id': `${SITE_URL}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: opts.items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        url: absoluteUrl(item.path),
      })),
    },
  }
}

export function itemListSchema(items: { name: string; path: string }[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  }
}

export function softwareAppSchema(tool: {
  name: string
  description: string
  category: string
  slug: string
  status: string
  seoKeywords?: string
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description,
    url: absoluteUrl(`/tools/${tool.slug}`),
    image: LOGO_IMAGE,
    applicationCategory: tool.category,
    operatingSystem: 'Web, Windows, macOS, Linux, iOS, Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/OnlineOnly',
    },
    ...(tool.seoKeywords ? { keywords: tool.seoKeywords } : {}),
    ...(tool.status === 'Future' ? {} : { isAccessibleForFree: true }),
    publisher: { '@id': `${SITE_URL}/#organization` },
    author: { '@id': `${SITE_URL}/#organization` },
  }
}

export function faqSchema(faqs: { q: string; a: string }[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}

export function blogPostingSchema(post: {
  title: string
  excerpt: string
  datePublished: string
  dateModified?: string
  author: string
  image?: string
  path: string
  category?: string
  tags?: string[]
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.image || LOGO_IMAGE,
    datePublished: post.datePublished,
    dateModified: post.dateModified || post.datePublished,
    author: { '@type': 'Organization', name: post.author, url: SITE_URL },
    publisher: { '@id': `${SITE_URL}/#organization` },
    mainEntityOfPage: absoluteUrl(post.path),
    ...(post.category ? { articleSection: post.category } : {}),
    ...(post.tags?.length ? { keywords: post.tags.join(', ') } : {}),
  }
}

export function articleSchema(opts: {
  title: string
  description: string
  path: string
  datePublished: string
  dateModified?: string
  author: string
  image?: string
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    image: opts.image || LOGO_IMAGE,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified || opts.datePublished,
    author: { '@type': 'Organization', name: opts.author },
    publisher: { '@id': `${SITE_URL}/#organization` },
    mainEntityOfPage: absoluteUrl(opts.path),
  }
}

export function aboutPageSchema(opts: { title: string; description: string; path: string }): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: opts.title,
    description: opts.description,
    url: absoluteUrl(opts.path),
    mainEntity: { '@id': `${SITE_URL}/#organization` },
  }
}

export function contactPageSchema(opts: { title: string; description: string; path: string }): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: opts.title,
    description: opts.description,
    url: absoluteUrl(opts.path),
    mainEntity: { '@id': `${SITE_URL}/#organization` },
  }
}

export function aiToolSchema(tool: { name: string; description: string; category: string; slug: string }): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description,
    url: absoluteUrl(`/ai-tools/${tool.slug}`),
    applicationCategory: tool.category,
    operatingSystem: 'Web, iOS, Android, Windows, macOS',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@id': `${SITE_URL}/#organization` },
  }
}

/** SiteNavigationElement — mirrors the primary site nav. */
export function siteNavigationElementSchema(items: { name: string; path: string }[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'SiteNavigationElement',
    name: 'Primary Navigation',
    hasPart: items.map((item, i) => ({
      '@type': 'SiteNavigationElement',
      position: i + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  }
}

/** HowTo — real step-by-step content (used on tool how-to-use sections). */
export function howToSchema(opts: {
  name: string
  description: string
  steps: { name: string; text: string }[]
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: opts.name,
    description: opts.description,
    step: opts.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  }
}
