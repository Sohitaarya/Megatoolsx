/**
 * SEO Monitoring — typed alert engine. Threshold-based, only from real data,
 * no noise from tiny fluctuations.
 */

import type { SeoSnapshot } from './types'

export type AlertType =
  | 'INDEXING_DROP' | 'TRAFFIC_DROP' | 'IMPRESSIONS_DROP' | 'CTR_DROP' | 'POSITION_DROP'
  | 'SITEMAP_ERROR' | 'CANONICAL_MISMATCH' | 'ORPHAN_DETECTED' | 'BROKEN_INTERNAL_LINK'
  | 'CRAWL_ERROR' | 'CWV_REGRESSION'

export type AlertSeverity = 'info' | 'warning' | 'critical'

export interface SeoAlert {
  id: string
  type: AlertType
  severity: AlertSeverity
  title: string
  description: string
  createdAt: string
  source: string
  metric: string
  currentValue?: number
  previousValue?: number
  threshold?: number
  affectedUrls?: string[]
}

export interface AlertThresholds {
  indexedDropPercent: number
  clicksDropPercent: number
  impressionsDropPercent: number
  ctrDropPercent: number
  positionDrop: number
}

export const DEFAULT_THRESHOLDS: AlertThresholds = { indexedDropPercent: 20, clicksDropPercent: 30, impressionsDropPercent: 30, ctrDropPercent: 20, positionDrop: 3 }

function pct(current: number | undefined, previous: number | undefined): number | null {
  if (current === undefined || previous === undefined || previous === 0) return null
  return ((current - previous) / previous) * 100
}
function mk(i: number): string { return `${Date.now()}-${i}` }

/** Compare the latest snapshot vs the previous equivalent period. */
export function buildAlerts(history: SeoSnapshot[], thresholds: AlertThresholds = DEFAULT_THRESHOLDS): SeoAlert[] {
  const alerts: SeoAlert[] = []
  if (history.length < 2) return alerts
  const now = new Date().toISOString()
  const latest = history[history.length - 1]
  const prev = history[history.length - 2]

  const add = (a: Omit<SeoAlert, 'id' | 'createdAt'>, i: number) => alerts.push({ ...a, id: mk(i), createdAt: now })

  const indexedDrop = pct(latest.indexed, prev.indexed)
  if (indexedDrop !== null && indexedDrop < -thresholds.indexedDropPercent) add({ type: 'INDEXING_DROP', severity: 'critical', title: 'Indexed URLs dropped', description: `Indexed went from ${prev.indexed} to ${latest.indexed}.`, source: 'search-console', metric: 'indexed', currentValue: latest.indexed, previousValue: prev.indexed, threshold: -thresholds.indexedDropPercent }, 1)

  const clickDrop = pct(latest.clicks, prev.clicks)
  if (clickDrop !== null && clickDrop < -thresholds.clicksDropPercent) add({ type: 'TRAFFIC_DROP', severity: 'warning', title: 'Clicks dropped', description: `Clicks went from ${prev.clicks} to ${latest.clicks}.`, source: 'search-console', metric: 'clicks', currentValue: latest.clicks, previousValue: prev.clicks, threshold: -thresholds.clicksDropPercent }, 2)

  const impDrop = pct(latest.impressions, prev.impressions)
  if (impDrop !== null && impDrop < -thresholds.impressionsDropPercent) add({ type: 'IMPRESSIONS_DROP', severity: 'warning', title: 'Impressions dropped', description: `Impressions went from ${prev.impressions} to ${latest.impressions}.`, source: 'search-console', metric: 'impressions', currentValue: latest.impressions, previousValue: prev.impressions, threshold: -thresholds.impressionsDropPercent }, 3)

  const ctrDrop = pct(latest.ctr, prev.ctr)
  if (ctrDrop !== null && ctrDrop < -thresholds.ctrDropPercent) add({ type: 'CTR_DROP', severity: 'warning', title: 'CTR dropped', description: 'Click-through rate fell significantly.', source: 'search-console', metric: 'ctr', currentValue: latest.ctr, previousValue: prev.ctr, threshold: -thresholds.ctrDropPercent }, 4)

  const posDrop = pct(latest.position, prev.position)
  if (posDrop !== null && posDrop > 0 && (latest.position ?? 0) - (prev.position ?? 0) > thresholds.positionDrop) add({ type: 'POSITION_DROP', severity: 'info', title: 'Average position degraded', description: 'Average position worsened.', source: 'search-console', metric: 'position', currentValue: latest.position, previousValue: prev.position, threshold: thresholds.positionDrop }, 5)

  return alerts
}