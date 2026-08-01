import { Helmet } from 'react-helmet-async'
import type { CsvTool } from '@/data/csvData'
import { LANGUAGES, type Language } from '@/i18n/translations'

interface SEOProps {
  title?: string
  description?: string
  slug?: string
  image?: string
  type?: 'website' | 'article' | 'product'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  tool?: CsvTool
  lang?: Language
  noIndex?: boolean
}

export function AdvancedSEO({
  title = 'MegatoolsX - World\'s Largest Tools Platform',
  description = 'Free online tools, AI tools, and utilities. Use 2500+ working tools online at MegatoolsX.',
  slug = '',
  image = '/og-image.png',
  type = 'website',
  publishedTime,
  modifiedTime,
  author = 'MegatoolsX',
  tool,
  lang = 'en',
  noIndex = false,
}: SEOProps) {
  const baseUrl = 'https://megatoolsx.com'
  const url = slug ? `${baseUrl}/${slug}` : baseUrl
  const langPrefix = lang === 'en' ? '' : `/${lang}`
  const localizedUrl = `${baseUrl}${langPrefix}${slug ? '/' + slug : ''}`

  // Schema.org structured data
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MegatoolsX',
    url: baseUrl,
    description: 'Free online tools and AI tools platform with 2500+ working tools.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
  }

  // Tool schema for individual tool pages
  const toolSchema = tool ? {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description,
    operatingSystem: 'All',
    applicationCategory: tool.category,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Organization',
      name: 'MegatoolsX',
    },
  } : null

  // Breadcrumb schema
  const breadcrumbSchema = tool ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: `${baseUrl}/tools` },
      { '@type': 'ListItem', position: 3, name: tool.name, item: `${baseUrl}/tools/${tool.slug}` },
    ],
  } : null

  // FAQ schema
  const faqSchema = tool ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is ${tool.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${tool.name} is a ${tool.category.toLowerCase()} tool that helps users ${tool.description.toLowerCase()}`,
        },
      },
      {
        '@type': 'Question',
        name: `How to use ${tool.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `You can use ${tool.name} directly on MegatoolsX for free. Just visit the tool page and follow the instructions.`,
        },
      },
    ],
  } : null

  return (
    <Helmet>
      {/* Basic */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={localizedUrl} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      {/* Hreflang */}
      {LANGUAGES.map(l => (
        <link key={l.code} rel="alternate" hrefLang={l.code}
          href={`${baseUrl}${l.code === 'en' ? '' : '/' + l.code}${slug ? '/' + slug : ''}`} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={baseUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={localizedUrl} />
      <meta property="og:image" content={`${baseUrl}${image}`} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="MegatoolsX" />
      <meta property="og:locale" content={lang === 'en' ? 'en_US' : `${lang}_${lang.toUpperCase()}`} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${baseUrl}${image}`} />

      {/* Article meta */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}
      {tool?.seoKeywords && <meta name="keywords" content={tool.seoKeywords} />}

      {/* JSON-LD */}
      <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
      {toolSchema && <script type="application/ld+json">{JSON.stringify(toolSchema)}</script>}
      {breadcrumbSchema && <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>}
      {faqSchema && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}
    </Helmet>
  )
}
