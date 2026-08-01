import { Helmet } from 'react-helmet-async'

interface SEOHeadProps {
  title?: string
  description?: string
  slug?: string
  type?: 'website' | 'article'
  image?: string
}

export function SEOHead({
  title = 'MegatoolsX - World\'s Largest Digital Tools Knowledge Platform',
  description = 'Learn how to use any digital tool, AI tool, software, website, app, and browser extension. Step-by-step guides, tutorials, and solutions for 2500+ tools.',
  slug = '',
  type = 'website',
  image = '/og-image.png',
}: SEOHeadProps) {
  const url = `https://megatoolsx.com${slug ? '/' + slug : ''}`

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="MegatoolsX" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Schema.org */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': type === 'article' ? 'Article' : 'WebSite',
          name: title,
          description,
          url,
          publisher: {
            '@type': 'Organization',
            name: 'MegatoolsX',
            logo: 'https://megatoolsx.com/logo.png',
          },
        })}
      </script>
    </Helmet>
  )
}
