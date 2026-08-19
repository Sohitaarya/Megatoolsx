import { describe, it, expect, beforeEach } from 'vitest'
import { normalizeSearchAnalytics, classifyGscError, fetchSearchAnalytics } from '@/seo/monitoring/searchConsole'
import { matchPageToEntity, buildToolSeoInsight, splitBrandNonBrand, analyzePositionOpportunities } from '@/seo/monitoring/analysis'
import { generateOpportunities, priorityFrom, priorityTier } from '@/seo/monitoring/opportunities'
import { isBrandQuery, summarizeBrandQueries } from '@/seo/monitoring/brandQueries'
import { InMemorySnapshotStore, emptySnapshot, snapshotKey, SNAPSHOT_SCHEMA_VERSION } from '@/seo/monitoring/history'
import { validateMonitoringConfig, resolveGscProperty, hasSearchConsoleCredentials, serverConfig, clientConfig, verifyGscConnection } from '@/seo/monitoring/config'
import { calculateTrend, analyzeTrends } from '@/seo/monitoring/trends'
import { scoreOpportunity, scoreToPriority, scoreToPriorityTier } from '@/seo/monitoring/scoring'
import { detectQueryPageMismatchesSync } from '@/seo/monitoring/queryMismatch'
import { detectContentGapsSync } from '@/seo/monitoring/contentGaps'
import { detectInternalLinkOpportunities } from '@/seo/monitoring/internalLinks'
import { createProposal, getProposal, listProposals, updateProposalStatus, rollbackProposal, clearProposals } from '@/seo/monitoring/optimization'
import { validateOptimizationProposal, validateSlugPreservation, validateSitemapInclusion, validateCanonicalMatch } from '@/seo/monitoring/changeSafety'
import type { GscFetchResult, GscRow, SearchPerformanceRow, SeoSnapshot } from '@/seo/monitoring/types'

describe('config', () => {
  it('returns NOT_CONFIGURED when no credentials', () => {
    const health = validateMonitoringConfig({})
    expect(health.searchConsole).toBe('NOT_CONFIGURED')
  })

  it('returns CONNECTED when GOOGLE_ACCESS_TOKEN is set', () => {
    const health = validateMonitoringConfig({ GOOGLE_ACCESS_TOKEN: 'token' })
    expect(health.searchConsole).toBe('CONNECTED')
  })

  it('returns CONNECTED when GOOGLE_SERVICE_ACCOUNT_CREDENTIALS is set', () => {
    const health = validateMonitoringConfig({ GOOGLE_SERVICE_ACCOUNT_CREDENTIALS: '{"type":"service_account"}' })
    expect(health.searchConsole).toBe('CONNECTED')
  })

  it('resolveGscProperty prefers SEO_GSC_PROPERTY', () => {
    const env = { SEO_GSC_PROPERTY: 'https://example.com/', GOOGLE_SEARCH_CONSOLE_SITE_URL: 'https://other.com/' }
    expect(resolveGscProperty(env as any)).toBe('https://example.com/')
  })

  it('resolveGscProperty falls back to GOOGLE_SEARCH_CONSOLE_SITE_URL', () => {
    expect(resolveGscProperty({} as any)).toBe('https://megatoolsx.com/')
  })

  it('hasSearchConsoleCredentials checks multiple env vars', () => {
    expect(hasSearchConsoleCredentials({})).toBe(false)
    expect(hasSearchConsoleCredentials({ GOOGLE_ACCESS_TOKEN: 't' })).toBe(true)
    expect(hasSearchConsoleCredentials({ GOOGLE_SERVICE_ACCOUNT_CREDENTIALS: '{}' })).toBe(true)
    expect(hasSearchConsoleCredentials({ GOOGLE_SEARCH_CONSOLE_CREDENTIALS: '{}' })).toBe(true)
  })
})

describe('classifyGscError', () => {
  it('maps HTTP status to error category', () => {
    expect(classifyGscError(401)).toBe('UNAUTHORIZED')
    expect(classifyGscError(403)).toBe('FORBIDDEN')
    expect(classifyGscError(429)).toBe('RATE_LIMITED')
    expect(classifyGscError(404)).toBe('INVALID_PROPERTY')
    expect(classifyGscError(0)).toBe('NETWORK_ERROR')
    expect(classifyGscError(500)).toBe('GOOGLE_API_ERROR')
    expect(classifyGscError(502)).toBe('GOOGLE_API_ERROR')
    expect(classifyGscError(400)).toBe('UNKNOWN_ERROR')
  })
})

describe('normalizeSearchAnalytics', () => {
  const makeResult = (rows: GscRow[]): GscFetchResult => ({
    rows,
    rowsFetched: rows.length,
    pagesFetched: 1,
    truncated: false,
  })

  it('accepts valid rows and computes totals', () => {
    const rows: GscRow[] = [
      { keys: ['query1', 'https://megatoolsx.com/tools/a'], clicks: 10, impressions: 100, ctr: 0.1, position: 5 },
      { keys: ['query2', 'https://megatoolsx.com/tools/b'], clicks: 5, impressions: 50, ctr: 0.1, position: 8 },
    ]
    const result = normalizeSearchAnalytics(makeResult(rows))
    expect(result.rows).toHaveLength(2)
    expect(result.totals.clicks).toBe(15)
    expect(result.totals.impressions).toBe(150)
    expect(result.totals.ctr).toBeCloseTo(0.1)
    expect(result.fetchMeta.rowsAccepted).toBe(2)
    expect(result.fetchMeta.rowsRejected).toBe(0)
    expect(result.fetchMeta.rowsReceived).toBe(2)
  })

  it('rejects negative clicks', () => {
    const rows: GscRow[] = [
      { keys: ['q', 'https://megatoolsx.com/tools/a'], clicks: -1, impressions: 100, ctr: 0, position: 5 },
    ]
    const result = normalizeSearchAnalytics(makeResult(rows))
    expect(result.rows).toHaveLength(0)
    expect(result.fetchMeta.rowsRejected).toBe(1)
  })

  it('rejects negative impressions', () => {
    const rows: GscRow[] = [
      { keys: ['q', 'https://megatoolsx.com/tools/a'], clicks: 1, impressions: -100, ctr: 0, position: 5 },
    ]
    const result = normalizeSearchAnalytics(makeResult(rows))
    expect(result.rows).toHaveLength(0)
    expect(result.fetchMeta.rowsRejected).toBe(1)
  })

  it('rejects NaN and Infinity', () => {
    const rows: GscRow[] = [
      { keys: ['q', 'https://megatoolsx.com/tools/a'], clicks: NaN, impressions: 100, ctr: 0, position: 5 },
      { keys: ['q2', 'https://megatoolsx.com/tools/b'], clicks: 1, impressions: Infinity, ctr: 0, position: 5 },
    ]
    const result = normalizeSearchAnalytics(makeResult(rows))
    expect(result.rows).toHaveLength(0)
    expect(result.fetchMeta.rowsRejected).toBe(2)
  })

  it('rejects impossible CTR (>1)', () => {
    const rows: GscRow[] = [
      { keys: ['q', 'https://megatoolsx.com/tools/a'], clicks: 100, impressions: 50, ctr: 2, position: 5 },
    ]
    const result = normalizeSearchAnalytics(makeResult(rows))
    expect(result.rows).toHaveLength(0)
    expect(result.fetchMeta.rowsRejected).toBe(1)
  })

  it('computes zero CTR when impressions are zero', () => {
    const rows: GscRow[] = [
      { keys: ['q', 'https://megatoolsx.com/tools/a'], clicks: 0, impressions: 0, ctr: 0, position: 5 },
    ]
    const result = normalizeSearchAnalytics(makeResult(rows))
    expect(result.rows).toHaveLength(1)
    expect(result.totals.ctr).toBe(0)
  })

  it('does not crash on one bad row among good rows', () => {
    const rows: GscRow[] = [
      { keys: ['q1', 'https://megatoolsx.com/tools/a'], clicks: 10, impressions: 100, ctr: 0.1, position: 5 },
      { keys: ['q2', 'https://megatoolsx.com/tools/b'], clicks: -5, impressions: 100, ctr: 0, position: 5 },
      { keys: ['q3', 'https://megatoolsx.com/tools/c'], clicks: 20, impressions: 200, ctr: 0.1, position: 3 },
    ]
    const result = normalizeSearchAnalytics(makeResult(rows))
    expect(result.rows).toHaveLength(2)
    expect(result.totals.clicks).toBe(30)
    expect(result.fetchMeta.rowsRejected).toBe(1)
  })
})

describe('matchPageToEntity', () => {
  it('matches tool URLs', () => {
    const e = matchPageToEntity('https://megatoolsx.com/tools/generative-heal-detector')
    expect(e.type).toBe('tool')
    expect(e.slug).toBe('generative-heal-detector')
  })

  it('matches category URLs', () => {
    const e = matchPageToEntity('https://megatoolsx.com/category/design-creative')
    expect(e.type).toBe('category')
    expect(e.slug).toBe('design-creative')
  })

  it('matches collection URLs', () => {
    const e = matchPageToEntity('https://megatoolsx.com/collections/top-picks')
    expect(e.type).toBe('collection')
    expect(e.slug).toBe('top-picks')
  })

  it('matches ai tool URLs', () => {
    const e = matchPageToEntity('https://megatoolsx.com/ai-tools/chatgpt')
    expect(e.type).toBe('ai')
    expect(e.slug).toBe('chatgpt')
  })

  it('matches blog URLs', () => {
    expect(matchPageToEntity('https://megatoolsx.com/blog').type).toBe('blog')
    const e = matchPageToEntity('https://megatoolsx.com/blog/my-post')
    expect(e.type).toBe('blog')
    expect(e.slug).toBe('my-post')
  })

  it('matches static URLs', () => {
    expect(matchPageToEntity('https://megatoolsx.com/').type).toBe('static')
    expect(matchPageToEntity('https://megatoolsx.com/tools').type).toBe('static')
    expect(matchPageToEntity('https://megatoolsx.com/about').type).toBe('static')
  })

  it('returns unknown for unmatched URLs', () => {
    const e = matchPageToEntity('https://megatoolsx.com/some-random-page')
    expect(e.type).toBe('unknown')
  })
})

describe('brand classification', () => {
  it('identifies brand queries', () => {
    expect(isBrandQuery('megatoolsx')).toBe(true)
    expect(isBrandQuery('MegatoolsX')).toBe(true)
    expect(isBrandQuery('megatoolsx tools')).toBe(true)
    expect(isBrandQuery('megatool')).toBe(true)
  })

  it('identifies non-brand queries', () => {
    expect(isBrandQuery('image compressor')).toBe(false)
    expect(isBrandQuery('qr code generator')).toBe(false)
  })

  it('summarizeBrandQueries returns null when no brand rows', () => {
    const rows: SearchPerformanceRow[] = [
      { query: 'image compressor', page: 'https://megatoolsx.com/tools/a', clicks: 10, impressions: 100, ctr: 0.1, position: 5 },
    ]
    expect(summarizeBrandQueries(rows)).toBeNull()
  })
})

describe('position opportunities', () => {
  it('flags positions 4-10', () => {
    const rows: SearchPerformanceRow[] = [
      { query: 'test', page: 'https://megatoolsx.com/tools/a', clicks: 10, impressions: 100, ctr: 0.1, position: 5 },
    ]
    const opps = analyzePositionOpportunities(rows, 50)
    expect(opps.some(o => o.type === 'POSITION_4_10')).toBe(true)
  })

  it('flags positions 11-20', () => {
    const rows: SearchPerformanceRow[] = [
      { query: 'test', page: 'https://megatoolsx.com/tools/a', clicks: 10, impressions: 100, ctr: 0.1, position: 15 },
    ]
    const opps = analyzePositionOpportunities(rows, 50)
    expect(opps.some(o => o.type === 'POSITION_11_20')).toBe(true)
  })

  it('flags high impressions low CTR', () => {
    const rows: SearchPerformanceRow[] = [
      { query: 'test', page: 'https://megatoolsx.com/tools/a', clicks: 1, impressions: 600, ctr: 0.001, position: 5 },
    ]
    const opps = analyzePositionOpportunities(rows, 50)
    expect(opps.some(o => o.type === 'HIGH_IMPRESSIONS_LOW_CTR')).toBe(true)
  })

  it('respects minImpressions threshold', () => {
    const rows: SearchPerformanceRow[] = [
      { query: 'test', page: 'https://megatoolsx.com/tools/a', clicks: 1, impressions: 10, ctr: 0.1, position: 5 },
    ]
    const opps = analyzePositionOpportunities(rows, 50)
    expect(opps).toHaveLength(0)
  })
})

describe('opportunity engine', () => {
  it('generates HIGH_IMPRESSIONS_LOW_CTR with WHAT/WHY/EVIDENCE/ACTION', () => {
    const rows: SearchPerformanceRow[] = [
      { query: 'image compressor', page: 'https://megatoolsx.com/tools/image-compressor', clicks: 1, impressions: 800, ctr: 0.001, position: 12 },
    ]
    const opps = generateOpportunities({ status: 'available', data: { rows } }, 'https://megatoolsx.com')
    const opp = opps.find(o => o.type === 'HIGH_IMPRESSIONS_LOW_CTR')
    expect(opp).toBeDefined()
    expect(opp!.what).toBeTruthy()
    expect(opp!.why).toBeTruthy()
    expect(opp!.evidence).toBeTruthy()
    expect(opp!.action).toBeTruthy()
    expect(opp!.writtenReason).toContain('impact=')
  })

  it('generates ZERO_CLICK_HIGH_IMPRESSION', () => {
    const rows: SearchPerformanceRow[] = [
      { query: 'qr code', page: 'https://megatoolsx.com/tools/qr-generator', clicks: 0, impressions: 300, ctr: 0, position: 8 },
    ]
    const opps = generateOpportunities({ status: 'available', data: { rows } }, 'https://megatoolsx.com')
    expect(opps.some(o => o.type === 'ZERO_CLICK_HIGH_IMPRESSION')).toBe(true)
  })

  it('generates QUERY_CANNIBALIZATION as potential', () => {
    const rows: SearchPerformanceRow[] = [
      { query: 'logo maker', page: 'https://megatoolsx.com/tools/logo-maker', clicks: 10, impressions: 100, ctr: 0.1, position: 5 },
      { query: 'logo maker', page: 'https://megatoolsx.com/tools/logo-generator', clicks: 5, impressions: 80, ctr: 0.06, position: 12 },
    ]
    const opps = generateOpportunities({ status: 'available', data: { rows } }, 'https://megatoolsx.com')
    expect(opps.some(o => o.type === 'QUERY_CANNIBALIZATION')).toBe(true)
  })

  it('returns empty array when status is not available', () => {
    expect(generateOpportunities({ status: 'not_configured', reason: 'none' }, 'https://megatoolsx.com')).toHaveLength(0)
  })
})

describe('priority scoring', () => {
  it('priorityFrom uses impact * confidence / effort', () => {
    expect(priorityFrom(0.8, 0.9, 0.1)).toBe('High')
    expect(priorityFrom(0.5, 0.5, 0.5)).toBe('Medium')
    expect(priorityFrom(0.1, 0.1, 0.9)).toBe('Low')
  })

  it('priorityTier maps correctly', () => {
    expect(priorityTier({ type: 'TECHNICAL_PROBLEM', severity: 'critical', priority: 'High' })).toBe('P0')
    expect(priorityTier({ type: 'HIGH_IMPRESSIONS_LOW_CTR', severity: 'info', priority: 'High' })).toBe('P1')
    expect(priorityTier({ type: 'CONTENT_GAP', severity: 'info', priority: 'Medium' })).toBe('P2')
    expect(priorityTier({ type: 'INDEXING_PROBLEM', severity: 'info', priority: 'Low' })).toBe('P3')
  })
})

describe('snapshot store', () => {
  it('dedupes by key', async () => {
    const store = new InMemorySnapshotStore(90)
    await store.save({ date: '2024-01-01', clicks: 10, impressions: 100 })
    await store.save({ date: '2024-01-01', clicks: 20, impressions: 200 })
    const latest = await store.latest()
    expect(latest?.clicks).toBe(10)
  })

  it('prunes old snapshots but keeps latest', async () => {
    const store = new InMemorySnapshotStore(90)
    await store.save({ date: '2023-01-01', clicks: 1 })
    await store.save({ date: '2024-06-01', clicks: 2 })
    await store.save({ date: '2024-06-02', clicks: 3 })
    const pruned = await store.prune('2024-06-01')
    const all = await store.list()
    expect(all.length).toBe(2)
    expect(all.find(s => s.date === '2024-06-01')).toBeDefined()
  })

  it('emptySnapshot has schemaVersion', () => {
    const snap = emptySnapshot('2024-01-01')
    expect(snap.schemaVersion).toBe(SNAPSHOT_SCHEMA_VERSION)
    expect(snap.status).toBe('not_configured')
  })

  it('snapshotKey encodes property and period', () => {
    expect(snapshotKey('2024-01-01', 'megatoolsx.com', '28d')).toBe('seo:megatoolsx.com:2024-01-01:28d')
  })
})

describe('brand vs non-brand split', () => {
  it('splits rows correctly', () => {
    const rows: SearchPerformanceRow[] = [
      { query: 'megatoolsx', page: 'https://megatoolsx.com/', clicks: 10, impressions: 100, ctr: 0.1, position: 1 },
      { query: 'image compressor', page: 'https://megatoolsx.com/tools/a', clicks: 5, impressions: 200, ctr: 0.025, position: 5 },
    ]
    const split = splitBrandNonBrand(rows)
    expect(split.brand).toHaveLength(1)
    expect(split.nonBrand).toHaveLength(1)
  })
})

describe('tool insights', () => {
  it('aggregates per-tool metrics', () => {
    const rows: SearchPerformanceRow[] = [
      { query: 'q1', page: 'https://megatoolsx.com/tools/a', clicks: 10, impressions: 100, ctr: 0.1, position: 5 },
      { query: 'q2', page: 'https://megatoolsx.com/tools/a', clicks: 5, impressions: 50, ctr: 0.1, position: 8 },
      { query: 'q3', page: 'https://megatoolsx.com/tools/b', clicks: 20, impressions: 200, ctr: 0.1, position: 3 },
    ]
    const insights = buildToolSeoInsight(rows)
    const toolA = insights.find(i => i.slug === 'a')
    expect(toolA?.clicks).toBe(15)
    expect(toolA?.impressions).toBe(150)
  })
})

describe('trends', () => {
  it('returns insufficient_history when no snapshots', () => {
    const result = analyzeTrends([])
    expect(result.overall.direction).toBe('insufficient_history')
  })

  it('returns insufficient_history when only one snapshot', () => {
    const history: SeoSnapshot[] = [{ date: '2024-01-01', status: 'CONNECTED', clicks: 10, impressions: 100 }]
    const result = analyzeTrends(history)
    expect(result.overall.direction).toBe('insufficient_history')
  })

  it('detects improving trend', () => {
    const history: SeoSnapshot[] = [
      { date: '2024-01-01', status: 'CONNECTED', clicks: 10, impressions: 100, ctr: 0.1, position: 10 },
      { date: '2024-01-08', status: 'CONNECTED', clicks: 20, impressions: 200, ctr: 0.15, position: 5 },
    ]
    const result = analyzeTrends(history)
    expect(result.overall.direction).toBe('improving')
    expect(result.overall.delta.clicks).toBeGreaterThan(0)
    expect(result.overall.delta.position).toBeLessThan(0)
  })

  it('detects declining trend', () => {
    const history: SeoSnapshot[] = [
      { date: '2024-01-01', status: 'CONNECTED', clicks: 20, impressions: 200, ctr: 0.15, position: 5 },
      { date: '2024-01-08', status: 'CONNECTED', clicks: 10, impressions: 100, ctr: 0.08, position: 10 },
    ]
    const result = analyzeTrends(history)
    expect(result.overall.direction).toBe('declining')
    expect(result.overall.delta.clicks).toBeLessThan(0)
    expect(result.overall.delta.position).toBeGreaterThan(0)
  })

  it('handles stable trend', () => {
    const history: SeoSnapshot[] = [
      { date: '2024-01-01', status: 'CONNECTED', clicks: 100, impressions: 1000, ctr: 0.1, position: 5 },
      { date: '2024-01-08', status: 'CONNECTED', clicks: 101, impressions: 1001, ctr: 0.1, position: 5.1 },
    ]
    const result = analyzeTrends(history)
    expect(result.overall.direction).toBe('stable')
  })
})

describe('scoring', () => {
  it('scores high impact for high impressions and good position', () => {
    const score = scoreOpportunity({ impressions: 1500, clicks: 100, ctr: 0.06, position: 5, pageType: 'tool' })
    expect(score.impact).toBeGreaterThan(0.5)
    expect(score.priority).toBe('Medium')
  })

  it('scores lower priority for low impressions', () => {
    const score = scoreOpportunity({ impressions: 10, clicks: 1, ctr: 0.1, position: 5, pageType: 'tool' })
    expect(score.priority).toBe('Low')
  })

  it('produces writtenReason with formula', () => {
    const score = scoreOpportunity({ impressions: 500, clicks: 10, ctr: 0.02, position: 15, pageType: 'tool' })
    expect(score.writtenReason).toContain('impact=')
    expect(score.writtenReason).toContain('confidence=')
    expect(score.writtenReason).toContain('effort=')
    expect(score.writtenReason).toContain('score=')
  })

  it('scoreToPriority maps deterministically', () => {
    expect(scoreToPriority(0.8, 0.9, 0.1)).toBe('High')
    expect(scoreToPriority(0.5, 0.5, 0.5)).toBe('Medium')
    expect(scoreToPriority(0.1, 0.1, 0.9)).toBe('Low')
  })

  it('scoreToPriorityTier maps correctly', () => {
    expect(scoreToPriorityTier(0.8, 0.9, 0.1, 'High')).toBe('P1')
    expect(scoreToPriorityTier(0.5, 0.5, 0.5, 'Medium')).toBe('P2')
    expect(scoreToPriorityTier(0.1, 0.1, 0.9, 'Low')).toBe('P3')
  })
})

describe('query mismatch', () => {
  it('detects mismatch for tool pages with non-utility query intent', () => {
    const rows: SearchPerformanceRow[] = [
      { query: 'how to use image compressor', page: 'https://megatoolsx.com/tools/image-compressor', clicks: 10, impressions: 200, ctr: 0.05, position: 8 },
    ]
    const mismatches = detectQueryPageMismatchesSync(rows)
    expect(mismatches.length).toBeGreaterThan(0)
    expect(mismatches[0].queryIntent).toBe('how-to')
  })

  it('returns empty for low impression rows', () => {
    const rows: SearchPerformanceRow[] = [
      { query: 'test', page: 'https://megatoolsx.com/tools/a', clicks: 1, impressions: 10, ctr: 0.1, position: 5 },
    ]
    expect(detectQueryPageMismatchesSync(rows)).toHaveLength(0)
  })
})

describe('content gaps', () => {
  it('detects missing sections for relevant queries', () => {
    const rows: SearchPerformanceRow[] = [
      { query: 'how to use image compressor', page: 'https://megatoolsx.com/tools/image-compressor', clicks: 10, impressions: 200, ctr: 0.05, position: 8 },
    ]
    const gaps = detectContentGapsSync(rows)
    expect(gaps.length).toBeGreaterThan(0)
    expect(gaps[0].missingSections).toContain('faq')
  })

  it('returns empty for low impression rows', () => {
    const rows: SearchPerformanceRow[] = [
      { query: 'test', page: 'https://megatoolsx.com/tools/a', clicks: 1, impressions: 10, ctr: 0.1, position: 5 },
    ]
    expect(detectContentGapsSync(rows)).toHaveLength(0)
  })
})

describe('internal links', () => {
  it('flags pages with impressions but low inbound count', () => {
    const rows: SearchPerformanceRow[] = [
      { query: 'test', page: 'https://megatoolsx.com/tools/a', clicks: 10, impressions: 200, ctr: 0.05, position: 8 },
    ]
    const opps = detectInternalLinkOpportunities(rows, () => 1, { minImpressions: 100, maxInbound: 2 })
    expect(opps.length).toBeGreaterThan(0)
    expect(opps[0]).toBeDefined()
    expect(opps[0].page).toBe('https://megatoolsx.com/tools/a')
    expect(opps[0].inboundLinkCount).toBe(1)
  })

  it('skips pages with sufficient inbound links', () => {
    const rows: SearchPerformanceRow[] = [
      { query: 'test', page: 'https://megatoolsx.com/tools/a', clicks: 10, impressions: 200, ctr: 0.05, position: 8 },
    ]
    const opps = detectInternalLinkOpportunities(rows, () => 5, { minImpressions: 100, maxInbound: 3 })
    expect(opps).toHaveLength(0)
  })
})

describe('optimization proposals', () => {
  beforeEach(() => clearProposals())

  it('creates a proposal in RECOMMENDED state', () => {
    const proposal = createProposal({
      opportunityId: 'opp-1',
      url: 'https://megatoolsx.com/tools/a',
      field: 'title',
      currentValue: 'Old title',
      proposedValue: 'New title',
      reason: 'Improve CTR',
      evidence: 'Low CTR observed',
    })
    expect(proposal.status).toBe('RECOMMENDED')
    expect(proposal.id).toBeTruthy()
  })

  it('retrieves proposal by id', () => {
    const proposal = createProposal({
      opportunityId: 'opp-1',
      url: 'https://megatoolsx.com/tools/a',
      field: 'title',
      currentValue: 'Old',
      proposedValue: 'New',
      reason: 'test',
      evidence: 'test',
    })
    const fetched = getProposal(proposal.id)
    expect(fetched?.url).toBe('https://megatoolsx.com/tools/a')
  })

  it('updates proposal status', () => {
    const proposal = createProposal({
      opportunityId: 'opp-1',
      url: 'https://megatoolsx.com/tools/a',
      field: 'title',
      currentValue: 'Old',
      proposedValue: 'New',
      reason: 'test',
      evidence: 'test',
    })
    const updated = updateProposalStatus(proposal.id, 'APPROVED')
    expect(updated?.status).toBe('APPROVED')
    expect(updated?.reviewedAt).toBeTruthy()
  })

  it('lists proposals filtered by status', () => {
    createProposal({ opportunityId: 'opp-1', url: 'https://megatoolsx.com/tools/a', field: 'title', currentValue: 'Old', proposedValue: 'New', reason: 'test', evidence: 'test' })
    createProposal({ opportunityId: 'opp-2', url: 'https://megatoolsx.com/tools/b', field: 'title', currentValue: 'Old', proposedValue: 'New', reason: 'test', evidence: 'test' })
    updateProposalStatus(listProposals()[0].id, 'APPROVED')
    const approved = listProposals('APPROVED')
    expect(approved.length).toBe(1)
    expect(approved[0].status).toBe('APPROVED')
  })
})

describe('new opportunity types from orchestrator', () => {
  it('generates DECLINING_TRAFFIC from trend data', async () => {
    const { buildAllOpportunities } = await import('@/seo/monitoring/orchestrator')
    const history: SeoSnapshot[] = [
      { date: '2024-01-01', status: 'CONNECTED', clicks: 20, impressions: 200, ctr: 0.1, position: 5, entitySummaries: { 'https://megatoolsx.com/tools/a': { clicks: 10, impressions: 100, position: 5 } } },
      { date: '2024-01-08', status: 'CONNECTED', clicks: 10, impressions: 100, ctr: 0.1, position: 5, entitySummaries: { 'https://megatoolsx.com/tools/a': { clicks: 5, impressions: 50, position: 5 } } },
    ]
    const rows: SearchPerformanceRow[] = [
      { query: 'test', page: 'https://megatoolsx.com/tools/a', clicks: 5, impressions: 50, ctr: 0.1, position: 5 },
    ]
    const result = await buildAllOpportunities({ rows, siteUrl: 'https://megatoolsx.com', history })
    expect(result.opportunities.some(o => o.type === 'DECLINING_TRAFFIC')).toBe(true)
    expect(result.trends.overall.direction).toBe('declining')
  })

  it('generates PAGE_QUERY_MISMATCH', async () => {
    const { buildAllOpportunities } = await import('@/seo/monitoring/orchestrator')
    const rows: SearchPerformanceRow[] = [
      { query: 'how to use image compressor', page: 'https://megatoolsx.com/tools/image-compressor', clicks: 10, impressions: 200, ctr: 0.05, position: 8 },
    ]
    const result = await buildAllOpportunities({ rows, siteUrl: 'https://megatoolsx.com' })
    expect(result.opportunities.some(o => o.type === 'PAGE_QUERY_MISMATCH')).toBe(true)
  })

  it('generates CONTENT_GAP', async () => {
    const { buildAllOpportunities } = await import('@/seo/monitoring/orchestrator')
    const rows: SearchPerformanceRow[] = [
      { query: 'how to use image compressor', page: 'https://megatoolsx.com/tools/image-compressor', clicks: 10, impressions: 200, ctr: 0.05, position: 8 },
    ]
    const result = await buildAllOpportunities({ rows, siteUrl: 'https://megatoolsx.com' })
    expect(result.opportunities.some(o => o.type === 'CONTENT_GAP')).toBe(true)
  })

  it('generates WEAK_INTERNAL_LINKING', async () => {
    const { buildAllOpportunities } = await import('@/seo/monitoring/orchestrator')
    const rows: SearchPerformanceRow[] = [
      { query: 'test', page: 'https://megatoolsx.com/tools/a', clicks: 10, impressions: 200, ctr: 0.05, position: 8 },
    ]
    const result = await buildAllOpportunities({ rows, siteUrl: 'https://megatoolsx.com', getInboundCount: () => 0 })
    expect(result.opportunities.some(o => o.type === 'WEAK_INTERNAL_LINKING')).toBe(true)
  })
})

describe('verifyGscConnection', () => {
  it('returns NOT_CONFIGURED when no credentials', async () => {
    const result = await verifyGscConnection({} as any)
    expect(result.status).toBe('NOT_CONFIGURED')
    expect(result.property).toBe('https://megatoolsx.com/')
    expect(result.rowsReceived).toBe(0)
    expect(result.safeMessage).toContain('not configured')
  })

  it('returns non-NOT_CONFIGURED status when credentials present', async () => {
    const mockEnv = { GOOGLE_ACCESS_TOKEN: 'token' }
    const result = await verifyGscConnection(mockEnv as any)
    expect(result.status).not.toBe('NOT_CONFIGURED')
    expect(result.latencyMs).toBeGreaterThanOrEqual(0)
  })
})

describe('serverConfig new fields', () => {
  it('includes opportunityMinImpressions with default', () => {
    const cfg = serverConfig({} as any)
    expect(cfg.opportunityMinImpressions).toBe(100)
  })

  it('includes lowCtrThreshold with default', () => {
    const cfg = serverConfig({} as any)
    expect(cfg.lowCtrThreshold).toBe(0.03)
  })

  it('includes maxGscPages and maxGscRows with defaults', () => {
    const cfg = serverConfig({} as any)
    expect(cfg.maxGscPages).toBe(20)
    expect(cfg.maxGscRows).toBe(100000)
  })

  it('includes monitorCronEnabled', () => {
    const cfg = serverConfig({} as any)
    expect(cfg.monitorCronEnabled).toBe(true)
  })
})

describe('clientConfig excludes secrets', () => {
  it('does not expose Google credentials', () => {
    const cfg = clientConfig()
    expect((cfg as any).searchConsole).toBeUndefined()
    expect((cfg as any).GOOGLE_ACCESS_TOKEN).toBeUndefined()
  })
})

describe('trend improvement and decline', () => {
  it('detects CTR improvement', () => {
    const history: SeoSnapshot[] = [
      { date: '2024-01-01', status: 'CONNECTED', clicks: 10, impressions: 100, ctr: 0.05, position: 5 },
      { date: '2024-01-08', status: 'CONNECTED', clicks: 12, impressions: 100, ctr: 0.08, position: 5 },
    ]
    const result = analyzeTrends(history)
    expect(result.overall.direction).toBe('improving')
  })

  it('detects CTR decline', () => {
    const history: SeoSnapshot[] = [
      { date: '2024-01-01', status: 'CONNECTED', clicks: 10, impressions: 100, ctr: 0.1, position: 5 },
      { date: '2024-01-08', status: 'CONNECTED', clicks: 8, impressions: 100, ctr: 0.05, position: 5 },
    ]
    const result = analyzeTrends(history)
    expect(result.overall.direction).toBe('declining')
  })
})

describe('unavailable data never becomes zero', () => {
  it('emptySnapshot uses not_configured status, not zero metrics', () => {
    const snap = emptySnapshot('2024-01-01')
    expect(snap.status).toBe('not_configured')
    expect(snap.clicks).toBeUndefined()
    expect(snap.impressions).toBeUndefined()
  })

  it('normalizeSearchAnalytics preserves no-data state', () => {
    const result = normalizeSearchAnalytics({ rows: [], rowsFetched: 0, pagesFetched: 0, truncated: false })
    expect(result.fetchMeta.rowsReceived).toBe(0)
    expect(result.rows).toHaveLength(0)
  })
})

describe('change safety', () => {
  it('blocks title too short', () => {
    const proposal = createProposal({
      opportunityId: 'opp-1',
      url: 'https://megatoolsx.com/tools/a',
      field: 'title',
      currentValue: 'Old',
      proposedValue: 'Short',
      reason: 'test',
      evidence: 'test',
    })
    updateProposalStatus(proposal.id, 'APPROVED')
    const result = validateOptimizationProposal(proposal, {
      currentSlug: 'a', canonical: 'https://megatoolsx.com/tools/a', inSitemap: true, hasNoindex: false, titleLength: 4, descriptionLength: 150, hasH1: true, hasJsonLd: true, internalLinksCount: 5, duplicateTitle: false,
    })
    expect(result.passed).toBe(false)
    expect(result.reason).toContain('too short')
  })

  it('blocks title too long', () => {
    const proposal = createProposal({
      opportunityId: 'opp-1',
      url: 'https://megatoolsx.com/tools/a',
      field: 'title',
      currentValue: 'Old',
      proposedValue: 'A'.repeat(71),
      reason: 'test',
      evidence: 'test',
    })
    updateProposalStatus(proposal.id, 'APPROVED')
    const result = validateOptimizationProposal(proposal, {
      currentSlug: 'a', canonical: 'https://megatoolsx.com/tools/a', inSitemap: true, hasNoindex: false, titleLength: 71, descriptionLength: 150, hasH1: true, hasJsonLd: true, internalLinksCount: 5, duplicateTitle: false,
    })
    expect(result.passed).toBe(false)
    expect(result.reason).toContain('too long')
  })

  it('blocks description too short', () => {
    const proposal = createProposal({
      opportunityId: 'opp-1',
      url: 'https://megatoolsx.com/tools/a',
      field: 'metaDescription',
      currentValue: 'Old',
      proposedValue: 'Short desc',
      reason: 'test',
      evidence: 'test',
    })
    updateProposalStatus(proposal.id, 'APPROVED')
    const result = validateOptimizationProposal(proposal, {
      currentSlug: 'a', canonical: 'https://megatoolsx.com/tools/a', inSitemap: true, hasNoindex: false, titleLength: 50, descriptionLength: 10, hasH1: true, hasJsonLd: true, internalLinksCount: 5, duplicateTitle: false,
    })
    expect(result.passed).toBe(false)
    expect(result.reason).toContain('too short')
  })

  it('blocks canonical change without explicit approval', () => {
    const proposal = createProposal({
      opportunityId: 'opp-1',
      url: 'https://megatoolsx.com/tools/a',
      field: 'canonical',
      currentValue: 'https://megatoolsx.com/tools/a',
      proposedValue: 'https://megatoolsx.com/tools/b',
      reason: 'test',
      evidence: 'test',
    })
    updateProposalStatus(proposal.id, 'APPROVED')
    const result = validateOptimizationProposal(proposal, {
      currentSlug: 'a', canonical: 'https://megatoolsx.com/tools/a', inSitemap: true, hasNoindex: false, titleLength: 50, descriptionLength: 150, hasH1: true, hasJsonLd: true, internalLinksCount: 5, duplicateTitle: false,
    })
    expect(result.passed).toBe(false)
    expect(result.reason).toContain('Canonical')
  })

  it('blocks modification when page has noindex', () => {
    const proposal = createProposal({
      opportunityId: 'opp-1',
      url: 'https://megatoolsx.com/tools/a',
      field: 'title',
      currentValue: 'Old',
      proposedValue: 'New title that is definitely long enough',
      reason: 'test',
      evidence: 'test',
    })
    updateProposalStatus(proposal.id, 'APPROVED')
    const result = validateOptimizationProposal(proposal, {
      currentSlug: 'a', canonical: 'https://megatoolsx.com/tools/a', inSitemap: true, hasNoindex: true, titleLength: 50, descriptionLength: 150, hasH1: true, hasJsonLd: true, internalLinksCount: 5, duplicateTitle: false,
    })
    expect(result.passed).toBe(false)
    expect(result.reason).toContain('noindex')
  })

  it('blocks modification when URL not in sitemap', () => {
    const proposal = createProposal({
      opportunityId: 'opp-1',
      url: 'https://megatoolsx.com/tools/a',
      field: 'title',
      currentValue: 'Old',
      proposedValue: 'New title that is definitely long enough',
      reason: 'test',
      evidence: 'test',
    })
    updateProposalStatus(proposal.id, 'APPROVED')
    const result = validateOptimizationProposal(proposal, {
      currentSlug: 'a', canonical: 'https://megatoolsx.com/tools/a', inSitemap: false, hasNoindex: false, titleLength: 50, descriptionLength: 150, hasH1: true, hasJsonLd: true, internalLinksCount: 5, duplicateTitle: false,
    })
    expect(result.passed).toBe(false)
    expect(result.reason).toContain('not in sitemap')
  })

  it('allows valid optimization proposal', () => {
    const proposal = createProposal({
      opportunityId: 'opp-1',
      url: 'https://megatoolsx.com/tools/a',
      field: 'title',
      currentValue: 'Old',
      proposedValue: 'New title that is definitely long enough for validation',
      reason: 'test',
      evidence: 'test',
    })
    updateProposalStatus(proposal.id, 'APPROVED')
    const result = validateOptimizationProposal(proposal, {
      currentSlug: 'a', canonical: 'https://megatoolsx.com/tools/a', inSitemap: true, hasNoindex: false, titleLength: 50, descriptionLength: 150, hasH1: true, hasJsonLd: true, internalLinksCount: 5, duplicateTitle: false,
    })
    expect(result.passed).toBe(true)
  })
})

describe('rollback', () => {
  it('restores previous value on rollback', () => {
    const proposal = createProposal({
      opportunityId: 'opp-1',
      url: 'https://megatoolsx.com/tools/a',
      field: 'title',
      currentValue: 'Old',
      proposedValue: 'New',
      reason: 'test',
      evidence: 'test',
    })
    updateProposalStatus(proposal.id, 'APPLIED')
    const rolled = rollbackProposal(proposal.id)
    expect(rolled?.status).toBe('REJECTED')
    expect(rolled?.proposedValue).toBe('Old')
    expect(rolled?.rollback).toBeUndefined()
  })

  it('returns undefined when rolling back non-applied proposal', () => {
    const proposal = createProposal({
      opportunityId: 'opp-1',
      url: 'https://megatoolsx.com/tools/a',
      field: 'title',
      currentValue: 'Old',
      proposedValue: 'New',
      reason: 'test',
      evidence: 'test',
    })
    const rolled = rollbackProposal(proposal.id)
    expect(rolled).toBeUndefined()
  })
})

describe('slug and canonical preservation', () => {
  it('validateSlugPreservation blocks slug change', () => {
    const result = validateSlugPreservation('old-slug', 'new-slug')
    expect(result.passed).toBe(false)
    expect(result.reason).toContain('Slug change')
  })

  it('validateSlugPreservation allows same slug', () => {
    const result = validateSlugPreservation('my-slug', 'my-slug')
    expect(result.passed).toBe(true)
  })

  it('validateCanonicalMatch blocks mismatch', () => {
    const result = validateCanonicalMatch('https://other.com', 'https://megatoolsx.com/')
    expect(result.passed).toBe(false)
  })

  it('validateSitemapInclusion passes when in sitemap', () => {
    const result = validateSitemapInclusion('https://megatoolsx.com/tools/a', true)
    expect(result.passed).toBe(true)
  })
})

describe('pagination limits', () => {
  it('fetchSearchAnalytics respects max pages', async () => {
    const originalFetch = globalThis.fetch
    let callCount = 0
    globalThis.fetch = async () => {
      callCount++
      return { ok: true, status: 200, json: async () => ({ rows: [] }) } as Response
    }
    try {
      await fetchSearchAnalytics('https://megatoolsx.com/', 'token', '2024-01-01', '2024-01-28')
      expect(callCount).toBeLessThanOrEqual(20)
    } finally {
      globalThis.fetch = originalFetch
    }
  })
})
