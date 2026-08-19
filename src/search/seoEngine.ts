/**
 * Search Engine — central orchestrator.
 *
 * One function turns a SeoContext into every on-page SEO signal. This is the
 * single seam the app uses for search optimization: title, description,
 * keywords, canonical, schema, robots and internal links are all derived —
 * nothing is hand-maintained per page.
 */

import type { SeoContext, SeoLink, SeoResult } from './types'
import { titleEngine, descriptionEngine, keywordEngine } from './textEngines'
import { schemaEngine } from './schemaEngine'
import { canonicalEngine, internalLinkEngine } from './linkEngines'

export function buildSeo(
  ctx: SeoContext,
  related: SeoLink[] = [],
  extra: SeoLink[] = [],
): SeoResult {
  const title = titleEngine(ctx)
  const description = descriptionEngine(ctx)
  const keywords = keywordEngine(ctx)
  const canonical = canonicalEngine(ctx)
  const { jsonLd, schemaTypes } = schemaEngine(ctx)

  return {
    title,
    description,
    keywords,
    canonical,
    robots: ctx.noIndex ? 'noindex,follow' : 'index,follow',
    jsonLd,
    schemaTypes,
    relatedLinks: internalLinkEngine(ctx, related, extra),
    internalLinks: internalLinkEngine(ctx, related, extra),
  }
}

export { titleEngine, descriptionEngine, keywordEngine, canonicalEngine }