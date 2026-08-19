/**
 * Search Engine — useSeo hook.
 * Central, automated SEO for any page: pass a SeoContext (and optional related
 * links) and every on-page signal is derived + rendered by the engine. Pages
 * never maintain SEO manually.
 */

import { useMemo } from 'react'
import { SEOHead } from '@/components/seo/SEOHead'
import { buildSeo } from './seoEngine'
import type { SeoContext, SeoLink } from './types'

export function useSeo(ctx: SeoContext, related: SeoLink[] = [], extra: SeoLink[] = []) {
  return useMemo(() => buildSeo(ctx, related, extra), [ctx, related, extra])
}

/** Render the derived SEO head for a page context. */
export function SeoHeadFromContext({ ctx, related, extra }: { ctx: SeoContext; related?: SeoLink[]; extra?: SeoLink[] }) {
  const seo = useSeo(ctx, related, extra)
  return (
    <SEOHead
      title={seo.title}
      description={seo.description}
      path={ctx.path}
      keywords={seo.keywords}
      noIndex={ctx.noIndex}
      publishedTime={ctx.publishedTime}
      modifiedTime={ctx.modifiedTime}
      image={ctx.image}
      jsonLd={seo.jsonLd}
    />
  )
}
