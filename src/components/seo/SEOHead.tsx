import { Helmet } from 'react-helmet-async'
import {
  SITE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_DEFAULT_TITLE, OG_IMAGE, TWITTER_HANDLE,
} from '@/config/site'

interface SEOHeadProps {
  /** Page title (no site suffix — appended automatically unless `appendSiteName` is false). */
  title: string
  /** Meta description, 120–158 chars. */
  description: string
  /** Canonical path, e.g. "/tools/chatgpt". If omitted, no canonical is emitted. */
  path?: string
  /** Social preview image (absolute URL or root-relative path). */
  image?: string
  type?: 'website' | 'article' | 'product'
  publishedTime?: string
  modifiedTime?: string
  /** Optional schema.org objects rendered as JSON-LD. */
  jsonLd?: object | object[]
  /** Optional meta keywords (secondary signal). */
  keywords?: string
  noIndex?: boolean
  /** Append " | MegatoolsX" to the title. Defaults to true. */
  appendSiteName?: boolean
  /** Emit hreflang alternates. Only English exists today, so x-default + en are emitted. */
  noHreflang?: boolean
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

export function SEOHead({
  title,
  description,
  path,
  image = OG_IMAGE,
  type = 'website',
  publishedTime,
  modifiedTime,
  jsonLd,
  keywords,
  noIndex = false,
  appendSiteName = true,
  noHreflang = false,
}: SEOHeadProps) {
  const fullTitle = appendSiteName ? `${title} | ${SITE_NAME}` : title
  const canonical = path ? `${SITE_URL}${path}` : undefined
  const ogImage = image.startsWith('http') ? image : `${SITE_URL}${image}`

  const schemas = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : []

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={canonical} />}
      {noIndex && <meta name="robots" content="noindex,follow" />}
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="en_US" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Hreflang — only English exists, so x-default + en are the correct alternates. */}
      {!noHreflang && (
        <>
          <link rel="alternate" hrefLang="x-default" href={canonical || SITE_URL} />
          <link rel="alternate" hrefLang="en" href={canonical || SITE_URL} />
        </>
      )}

      {/* JSON-LD */}
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: escapeXml(JSON.stringify(schema)) }} />
      ))}
    </Helmet>
  )
}

/** Default head used by Layout as a fallback for routes that don't set their own. */
export function DefaultHead() {
  return (
    <Helmet>
      <title>{SITE_DEFAULT_TITLE}</title>
      <meta name="description" content={SITE_DESCRIPTION} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={SITE_DEFAULT_TITLE} />
      <meta property="og:description" content={SITE_DESCRIPTION} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  )
}
