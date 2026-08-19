/**
 * Search Engine — public surface.
 * One import point for the whole automated SEO system.
 */
export { buildSeo, titleEngine, descriptionEngine, keywordEngine, canonicalEngine } from './seoEngine'
export { useSeo, SeoHeadFromContext } from './useSeo'
export { schemaEngine } from './schemaEngine'
export { canonicalVariants, internalLinkEngine } from './linkEngines'
export { validateSeo, summarizeReports } from './validation'
export type { SeoReport, SeoCheck } from './validation'
export { reportSeoHealth, auditSeo } from './monitor'
export type { SeoContext, SeoResult, SeoEntity, SeoBreadcrumb, SeoItem, SeoFaq, SeoLink, SeoKind } from './types'