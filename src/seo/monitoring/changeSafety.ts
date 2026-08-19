/**
 * SEO Monitoring — change safety and invariant validation.
 *
 * Before applying any SEO optimization, validate that critical invariants
 * remain intact. If any invariant fails, return OPTIMIZATION_BLOCKED.
 *
 * This module does NOT modify production content. It only validates proposals.
 */

import type { OptimizationProposal, OptimizationField } from './optimization'

export type InvariantResult = { passed: boolean; reason?: string }

export interface ChangeSafetyContext {
  currentSlug: string
  canonical: string
  inSitemap: boolean
  hasNoindex: boolean
  titleLength: number
  descriptionLength: number
  hasH1: boolean
  hasJsonLd: boolean
  internalLinksCount: number
  duplicateTitle: boolean
}

const TITLE_MIN = 30
const TITLE_MAX = 70
const DESCRIPTION_MIN = 120
const DESCRIPTION_MAX = 165

export function validateOptimizationProposal(proposal: OptimizationProposal, ctx: ChangeSafetyContext): InvariantResult {
  if (proposal.status !== 'APPROVED') {
    return { passed: false, reason: `Proposal status is ${proposal.status}, expected APPROVED` }
  }

  switch (proposal.field) {
    case 'title': {
      const len = proposal.proposedValue.length
      if (len < TITLE_MIN) return { passed: false, reason: `Title too short (${len} < ${TITLE_MIN})` }
      if (len > TITLE_MAX) return { passed: false, reason: `Title too long (${len} > ${TITLE_MAX})` }
      break
    }
    case 'metaDescription': {
      const len = proposal.proposedValue.length
      if (len < DESCRIPTION_MIN) return { passed: false, reason: `Description too short (${len} < ${DESCRIPTION_MIN})` }
      if (len > DESCRIPTION_MAX) return { passed: false, reason: `Description too long (${len} > ${DESCRIPTION_MAX})` }
      break
    }
    case 'canonical': {
      if (proposal.proposedValue !== ctx.canonical) {
        return { passed: false, reason: `Canonical change requires explicit approval. Proposed: ${proposal.proposedValue}, current: ${ctx.canonical}` }
      }
      break
    }
    case 'contentSection':
    case 'faq':
    case 'internalLinks':
    case 'intro':
    case 'schema':
      break
    default:
      return { passed: false, reason: `Unsupported field: ${proposal.field}` }
  }

  if (ctx.hasNoindex && proposal.field !== 'canonical') {
    return { passed: false, reason: 'Page has noindex directive; cannot modify content without removing noindex first' }
  }

  if (!ctx.inSitemap) {
    return { passed: false, reason: 'Page is not in sitemap; verify inclusion before applying changes' }
  }

  if (ctx.duplicateTitle && proposal.field !== 'title') {
    return { passed: false, reason: 'Duplicate title detected; fix title before other changes' }
  }

  return { passed: true }
}

export function validateSlugPreservation(oldSlug: string, newSlug: string): InvariantResult {
  if (oldSlug !== newSlug) {
    return { passed: false, reason: `Slug change detected: ${oldSlug} -> ${newSlug}. Slug changes are not allowed without explicit approval.` }
  }
  return { passed: true }
}

export function validateSitemapInclusion(url: string, inSitemap: boolean): InvariantResult {
  if (!inSitemap) {
    return { passed: false, reason: `URL ${url} is not in sitemap` }
  }
  return { passed: true }
}

export function validateCanonicalMatch(url: string, canonical: string): InvariantResult {
  if (url !== canonical) {
    return { passed: false, reason: `URL ${url} does not match canonical ${canonical}` }
  }
  return { passed: true }
}
