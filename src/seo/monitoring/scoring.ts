/**
 * SEO Monitoring — deterministic SEO Opportunity Score model.
 *
 * The score is explainable, reproducible, and based only on real observed data.
 * It does NOT predict Google rankings. It ranks optimization opportunities
 * by a consistent impact/confidence/effort formula.
 */

export type PriorityTier = 'P0' | 'P1' | 'P2' | 'P3'

export interface ScoreInput {
  impressions: number
  clicks: number
  ctr: number
  position: number
  trendDirection?: 'improving' | 'stable' | 'declining' | 'insufficient_history'
  queryCount?: number
  nonBrandRatio?: number
  pageType?: string
  contentCompleteness?: number
  internalLinkCount?: number
  indexability?: boolean
  canonicalCorrect?: boolean
}

export interface ScoredOpportunity {
  impact: number
  confidence: number
  effort: number
  priority: 'High' | 'Medium' | 'Low'
  priorityTier: PriorityTier
  writtenReason: string
}

export function scoreOpportunity(input: ScoreInput): ScoredOpportunity {
  const {
    impressions,
    clicks,
    ctr,
    position,
    trendDirection = 'insufficient_history',
    queryCount = 0,
    nonBrandRatio = 0,
    pageType = 'unknown',
    contentCompleteness = 0.5,
    internalLinkCount = 0,
    indexability = true,
    canonicalCorrect = true,
  } = input

  let impact = 0.3
  let confidence = 0.4
  let effort = 0.5

  if (impressions >= 1000) impact += 0.2
  else if (impressions >= 500) impact += 0.15
  else if (impressions >= 100) impact += 0.1

  if (ctr === 0 && clicks === 0 && impressions >= 200) impact += 0.15
  else if (ctr < 0.02 && impressions >= 500) impact += 0.1

  if (position >= 4 && position <= 10) impact += 0.15
  else if (position >= 11 && position <= 20) impact += 0.1

  if (trendDirection === 'declining') impact += 0.1
  else if (trendDirection === 'improving') impact -= 0.05

  if (queryCount >= 5) confidence += 0.15
  else if (queryCount >= 2) confidence += 0.1
  else if (queryCount === 0) confidence -= 0.1

  if (nonBrandRatio >= 0.7) confidence += 0.1
  else if (nonBrandRatio <= 0.2) confidence -= 0.05

  if (pageType === 'tool' || pageType === 'category') confidence += 0.1
  else if (pageType === 'unknown') confidence -= 0.1

  if (contentCompleteness >= 0.8) effort -= 0.15
  else if (contentCompleteness <= 0.3) effort += 0.15

  if (internalLinkCount >= 5) effort -= 0.1
  else if (internalLinkCount <= 1) effort += 0.1

  if (!indexability) { impact += 0.1; confidence += 0.1 }
  if (!canonicalCorrect) { impact += 0.05; confidence -= 0.05 }

  impact = Math.max(0, Math.min(1, impact))
  confidence = Math.max(0, Math.min(1, confidence))
  effort = Math.max(0.05, Math.min(1, effort))

  const priority = scoreToPriority(impact, confidence, effort)
  const priorityTier = scoreToPriorityTier(impact, confidence, effort, priority)
  const writtenReason = `impact=${impact.toFixed(2)} confidence=${confidence.toFixed(2)} effort=${effort.toFixed(2)} score=${((impact * confidence) / effort).toFixed(2)} → ${priority}`

  return { impact, confidence, effort, priority, priorityTier, writtenReason }
}

export function scoreToPriority(impact: number, confidence: number, effort: number): 'High' | 'Medium' | 'Low' {
  if (effort === 0) return 'High'
  const score = (impact * confidence) / effort
  if (score >= 0.8) return 'High'
  if (score >= 0.35) return 'Medium'
  return 'Low'
}

export function scoreToPriorityTier(impact: number, confidence: number, effort: number, priority: 'High' | 'Medium' | 'Low'): PriorityTier {
  if (priority === 'High') return 'P1'
  if (priority === 'Medium') return 'P2'
  return 'P3'
}
