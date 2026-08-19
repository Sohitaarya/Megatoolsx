/**
 * Search Engine — monitoring.
 * Emits SEO health analytics and logs (works with the event bus + logger; a
 * Cloudflare Analytics proxy can consume the same events server-side).
 */

import { eventBus } from '@/os/events'
import { logger } from '@/core/infrastructure/logging/logger'
import { validateSeo, type SeoReport } from './validation'

/** Report a page's SEO health to analytics + logs. */
export function reportSeoHealth(report: SeoReport): void {
  eventBus.emit('analytics:event', {
    name: 'seo:health',
    props: { url: report.url, score: report.score, pass: report.pass },
  })
  if (!report.pass) {
    const failures = report.checks.filter(c => !c.pass).map(c => c.id)
    logger.warn('[seo] validation failures', { url: report.url, failures })
  }
}

/** Convenience: validate + report in one call. */
export function auditSeo(seo: Parameters<typeof validateSeo>[0], url: string): SeoReport {
  const report = validateSeo(seo, url)
  reportSeoHealth(report)
  return report
}