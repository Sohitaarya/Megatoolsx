/**
 * Search Engine — validation tools.
 * Runtime checks that every derived SeoResult is Google-ready. Used in dev (and
 * optionally on a /__seo debug route) to catch regressions before deploy.
 */

import type { SeoResult } from './types'

export interface SeoCheck {
  id: string
  pass: boolean
  message: string
}

export interface SeoReport {
  url: string
  pass: boolean
  score: number
  checks: SeoCheck[]
}

const LIMITS = {
  titleMin: 20,
  titleMax: 60,
  descMax: 158,
}

/** Validate a derived SeoResult. Returns a structured report. */
export function validateSeo(result: SeoResult, url: string): SeoReport {
  const checks: SeoCheck[] = []

  checks.push({
    id: 'title.present',
    pass: Boolean(result.title),
    message: result.title ? `Title present: "${result.title.slice(0, 50)}…"` : 'Missing <title>',
  })
  checks.push({
    id: 'title.length',
    pass: result.title.length >= LIMITS.titleMin && result.title.length <= LIMITS.titleMax,
    message: `Title length ${result.title.length} (target ${LIMITS.titleMin}–${LIMITS.titleMax})`,
  })
  checks.push({
    id: 'description.present',
    pass: Boolean(result.description),
    message: result.description ? 'Meta description present' : 'Missing meta description',
  })
  checks.push({
    id: 'description.length',
    pass: result.description.length <= LIMITS.descMax,
    message: `Description length ${result.description.length} (max ${LIMITS.descMax})`,
  })
  checks.push({
    id: 'canonical.absolute',
    pass: /^https:\/\/megatoolsx\.com\//.test(result.canonical),
    message: `Canonical: ${result.canonical}`,
  })
  checks.push({
    id: 'schema.present',
    pass: result.jsonLd.length > 0,
    message: `JSON-LD blocks: ${result.jsonLd.length} (${result.schemaTypes.join(', ') || 'none'})`,
  })
  checks.push({
    id: 'schema.softwareapp',
    pass: !result.schemaTypes.includes('SoftwareApplication') || result.schemaTypes.includes('BreadcrumbList'),
    message: result.schemaTypes.includes('SoftwareApplication') ? 'SoftwareApplication + Breadcrumb present' : 'No SoftwareApplication expected',
  })
  checks.push({
    id: 'robots.correct',
    pass: result.robots === 'index,follow' || result.robots === 'noindex,follow',
    message: `robots meta: ${result.robots}`,
  })
  checks.push({
    id: 'internal.links',
    pass: result.internalLinks.length >= 1,
    message: `Internal links: ${result.internalLinks.length}`,
  })
  checks.push({
    id: 'keywords.present',
    pass: Boolean(result.keywords),
    message: result.keywords ? `Keywords: ${result.keywords.slice(0, 60)}…` : 'No keywords',
  })

  const passed = checks.filter(c => c.pass).length
  return { url, pass: passed === checks.length, score: Math.round((passed / checks.length) * 100), checks }
}

/** Aggregate a set of reports into a single summary (used by CI / debug page). */
export function summarizeReports(reports: SeoReport[]): { total: number; passed: number; failed: number; avgScore: number } {
  const passed = reports.filter(r => r.pass).length
  const avgScore = reports.length ? Math.round(reports.reduce((a, r) => a + r.score, 0) / reports.length) : 0
  return { total: reports.length, passed, failed: reports.length - passed, avgScore }
}