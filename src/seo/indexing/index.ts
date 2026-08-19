/**
 * Index Discovery — public surface.
 * One import point for the whole indexing architecture.
 */
export { getAllIndexableUrls, type UrlInventory } from './urlInventory'
export { classifyToolUrl, simpleUrl, type IndexableUrl, type UrlClass } from './indexability'
export { buildInternalLinkGraph, toolHasInbound, type LinkGraph, type LinkGraphNode } from './internalLinkGraph'
export { planSitemaps, MAX_URLS_PER_SITEMAP, type SitemapGroup, type SitemapPlan } from './sitemapManager'
export { runIndexingAudit, INDEXABILITY_INVARIANTS, type IndexabilityReport } from './indexingMonitor'
export { getToolUrl, getToolAbsoluteUrl, normalizeSlug, cleanToolSlug } from './toolSlug'
export { slugRedirects, redirectFor, type SlugRedirect } from './slugRedirects'
export { classifyUrlStatus, crawlDepth, depthDistribution, type UrlIndexClass } from './crawlDepth'