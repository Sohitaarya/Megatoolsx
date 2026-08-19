/**
 * Index Discovery — indexing monitor.
 * Builds the technical indexability report. This proves TECHNICAL discoverability
 * only — it does NOT measure or claim Google indexing.
 */

import { getAllIndexableUrls } from './urlInventory'
import { buildInternalLinkGraph } from './internalLinkGraph'
import { planSitemaps } from './sitemapManager'

export interface IndexabilityReport {
  totalCatalogTools: number
  totalRoutes: number
  indexable: number
  excluded: number
  missingCanonical: number
  invalidHostname: number
  wrongToolPrefix: number
  duplicateUrls: number
  duplicateSlugs: number
  orphanTools: number
  missingSitemap: number
  sitemapViolations: number
  totalSitemapUrls: number
  generatedAt: string
}

/** Run the full technical indexability audit (in-memory; caller persists the report). */
export function runIndexingAudit(): IndexabilityReport {
  const { urls, duplicateUrls, duplicateSlugs, orphanIndexable } = getAllIndexableUrls()
  const indexable = urls.filter(u => u.indexable)
  const excluded = urls.filter(u => !u.indexable)
  const missingCanonical = urls.filter(u => u.indexable && !u.canonical).length
  const invalidHostname = urls.filter(u => !u.canonical.startsWith('https://megatoolsx.com')).length
  const wrongToolPrefix = urls.filter(u => u.type === 'tool' && !u.url.startsWith('/tools/')).length

  const graph = buildInternalLinkGraph(urls)
  const plan = planSitemaps(urls)
  const totalSitemapUrls = plan.groups.reduce((a, g) => a + g.urls.length, 0)

  return {
    totalCatalogTools: urls.filter(u => u.type === 'tool').length,
    totalRoutes: urls.length,
    indexable: indexable.length,
    excluded: excluded.length,
    missingCanonical,
    invalidHostname,
    wrongToolPrefix,
    duplicateUrls: duplicateUrls.length,
    duplicateSlugs: duplicateSlugs.length,
    orphanTools: graph.orphanSlugs.length,
    missingSitemap: indexable.filter(u => !u.sitemapEligible).length,
    sitemapViolations: plan.violations.length,
    totalSitemapUrls,
    generatedAt: new Date().toISOString(),
  }
}

/** Expected invariants that the build pipeline enforces. */
export const INDEXABILITY_INVARIANTS = {
  duplicateUrls: 0,
  duplicateSlugs: 0,
  missingCanonical: 0,
  invalidHostname: 0,
  wrongToolPrefix: 0,
  orphanTools: 0,
  missingSitemap: 0,
  sitemapViolations: 0,
} as const