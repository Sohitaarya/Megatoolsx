/**
 * SEO Monitoring — trend analysis engine.
 * Compares historical snapshots to determine traffic/position trends.
 * Uses ONLY real stored data. Never fabricates trends when insufficient history exists.
 */

import type { SeoSnapshot } from './types'

export type TrendDirection = 'improving' | 'stable' | 'declining' | 'insufficient_history'

export interface TrendDelta {
  clicks: number | null
  impressions: number | null
  ctr: number | null
  position: number | null
}

export interface SnapshotTrend {
  current: SeoSnapshot | null
  previous: SeoSnapshot | null
  direction: TrendDirection
  delta: TrendDelta
  periodsCompared: number
  dataSource: 'historical_snapshot' | 'insufficient_history'
}

export interface PageTrend {
  url: string
  entityType: string
  slug: string
  direction: TrendDirection
  delta: TrendDelta
  currentSnap: SeoSnapshot | null
  previousSnap: SeoSnapshot | null
}

const DEFAULT_DAYS = 28

function safeNum(v: number | undefined, fallback = 0): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback
}

function calcDelta(current: number | undefined, previous: number | undefined, inverse = false): number | null {
  const c = safeNum(current, NaN)
  const p = safeNum(previous, NaN)
  if (!Number.isFinite(c) || !Number.isFinite(p) || p === 0) return null
  const delta = ((c - p) / p) * 100
  return Number.isFinite(delta) ? delta : null
}

export function calculateTrend(latest: SeoSnapshot | null, previous: SeoSnapshot | null, opts: { positionThreshold?: number; ctrThreshold?: number; clicksThreshold?: number; impressionsThreshold?: number } = {}): SnapshotTrend {
  const positionThreshold = opts.positionThreshold ?? 3
  const ctrThreshold = opts.ctrThreshold ?? 20
  const clicksThreshold = opts.clicksThreshold ?? 20
  const impressionsThreshold = opts.impressionsThreshold ?? 20

  if (!latest || !previous) {
    return {
      current: latest,
      previous,
      direction: 'insufficient_history',
      delta: { clicks: null, impressions: null, ctr: null, position: null },
      periodsCompared: 0,
      dataSource: 'insufficient_history',
    }
  }

  const clickDelta = calcDelta(latest.clicks, previous.clicks)
  const impDelta = calcDelta(latest.impressions, previous.impressions)
  const ctrDelta = calcDelta(latest.ctr, previous.ctr)
  const posDelta = calcDelta(latest.position, previous.position)

  const delta: TrendDelta = {
    clicks: clickDelta,
    impressions: impDelta,
    ctr: ctrDelta,
    position: posDelta,
  }

  let improving = 0
  let declining = 0

  if (clickDelta !== null && clickDelta > clicksThreshold) improving++
  else if (clickDelta !== null && clickDelta < -clicksThreshold) declining++

  if (impDelta !== null && impDelta > impressionsThreshold) improving++
  else if (impDelta !== null && impDelta < -impressionsThreshold) declining++

  if (ctrDelta !== null && ctrDelta > ctrThreshold) improving++
  else if (ctrDelta !== null && ctrDelta < -ctrThreshold) declining++

  if (posDelta !== null) {
    // Lower position number = better ranking.
    if (posDelta < -positionThreshold) improving++
    else if (posDelta > positionThreshold) declining++
  }

  let direction: TrendDirection = 'stable'
  if (declining > improving) direction = 'declining'
  else if (improving > declining) direction = 'improving'

  return {
    current: latest,
    previous,
    direction,
    delta,
    periodsCompared: 2,
    dataSource: 'historical_snapshot',
  }
}

export function analyzeTrends(history: SeoSnapshot[], opts?: { positionThreshold?: number; ctrThreshold?: number; clicksThreshold?: number; impressionsThreshold?: number }): { overall: SnapshotTrend; byEntity: PageTrend[] } {
  const sorted = history
    .filter(s => s.status === 'CONNECTED' || s.status === 'available')
    .sort((a, b) => a.date.localeCompare(b.date))

  if (sorted.length < 2) {
    return {
      overall: calculateTrend(sorted[sorted.length - 1] ?? null, null, opts),
      byEntity: [],
    }
  }

  const latest = sorted[sorted.length - 1]
  const previous = sorted[sorted.length - 2]

  const byEntity: PageTrend[] = []
  const entityKeys = new Set([
    ...Object.keys(latest.entitySummaries ?? {}),
    ...Object.keys(previous.entitySummaries ?? {}),
  ])

  for (const key of entityKeys) {
    const cur = latest.entitySummaries?.[key]
    const prev = previous.entitySummaries?.[key]
    if (!cur && !prev) continue

    const fakeLatest: SeoSnapshot = {
      date: latest.date,
      clicks: cur?.clicks ?? 0,
      impressions: cur?.impressions ?? 0,
      ctr: cur?.impressions && cur.clicks ? cur.clicks / cur.impressions : 0,
      position: cur?.position ?? 0,
    }
    const fakePrev: SeoSnapshot = {
      date: previous.date,
      clicks: prev?.clicks ?? 0,
      impressions: prev?.impressions ?? 0,
      ctr: prev?.impressions && prev.clicks ? prev.clicks / prev.impressions : 0,
      position: prev?.position ?? 0,
    }

    const trend = calculateTrend(fakeLatest, fakePrev, opts)
    byEntity.push({
      url: key,
      entityType: key.includes('/tools/') ? 'tool' : key.includes('/category/') ? 'category' : key.includes('/collections/') ? 'collection' : 'unknown',
      slug: key.split('/').pop() ?? key,
      direction: trend.direction,
      delta: trend.delta,
      currentSnap: fakeLatest,
      previousSnap: fakePrev,
    })
  }

  return {
    overall: calculateTrend(latest, previous, opts),
    byEntity: byEntity.sort((a, b) => {
      const order = { declining: 0, stable: 1, improving: 2, insufficient_history: 3 }
      return order[a.direction] - order[b.direction]
    }),
  }
}
