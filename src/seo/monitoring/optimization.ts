/**
 * SEO Monitoring — optimization proposal workflow.
 *
 * Controlled review model: RECOMMENDED → REVIEWED → APPROVED → APPLIED → REJECTED.
 * No automatic production SEO changes. Proposals are reviewable artifacts.
 */

export type OptimizationStatus = 'RECOMMENDED' | 'REVIEWED' | 'APPROVED' | 'APPLIED' | 'REJECTED'

export type OptimizationField =
  | 'title'
  | 'metaDescription'
  | 'intro'
  | 'internalLinks'
  | 'faq'
  | 'schema'
  | 'canonical'
  | 'contentSection'

export interface OptimizationProposal {
  id: string
  opportunityId: string
  url: string
  field: OptimizationField
  currentValue: string
  proposedValue: string
  reason: string
  evidence: string
  status: OptimizationStatus
  createdAt: string
  reviewedAt?: string
  appliedAt?: string
  rollback?: { currentValue: string; appliedAt: string }
  approvedBy?: string
  auditTrail: Array<{ timestamp: string; action: string; detail: string }>
}

interface ProposalInput {
  opportunityId: string
  url: string
  field: OptimizationField
  currentValue: string
  proposedValue: string
  reason: string
  evidence: string
}

const store = new Map<string, OptimizationProposal>()

export function createProposal(input: ProposalInput): OptimizationProposal {
  const proposal: OptimizationProposal = {
    id: `opt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...input,
    status: 'RECOMMENDED',
    createdAt: new Date().toISOString(),
    auditTrail: [{ timestamp: new Date().toISOString(), action: 'created', detail: 'Proposal created' }],
  }
  store.set(proposal.id, proposal)
  return proposal
}

export function getProposal(id: string): OptimizationProposal | undefined {
  return store.get(id)
}

export function listProposals(status?: OptimizationStatus): OptimizationProposal[] {
  const all = Array.from(store.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return status ? all.filter(p => p.status === status) : all
}

export function updateProposalStatus(id: string, status: OptimizationStatus, approvedBy?: string): OptimizationProposal | undefined {
  const proposal = store.get(id)
  if (!proposal) return undefined
  proposal.status = status
  if (status === 'REVIEWED' || status === 'APPROVED' || status === 'APPLIED' || status === 'REJECTED') {
    proposal.reviewedAt = new Date().toISOString()
  }
  if (status === 'APPLIED') {
    proposal.appliedAt = new Date().toISOString()
    proposal.rollback = { currentValue: proposal.proposedValue, appliedAt: proposal.appliedAt }
    proposal.auditTrail.push({ timestamp: new Date().toISOString(), action: 'applied', detail: `Applied by ${approvedBy || 'system'}` })
  }
  if (status === 'REJECTED') {
    proposal.auditTrail.push({ timestamp: new Date().toISOString(), action: 'rejected', detail: 'Proposal rejected' })
  }
  if (approvedBy) proposal.approvedBy = approvedBy
  return proposal
}

export function rollbackProposal(id: string): OptimizationProposal | undefined {
  const proposal = store.get(id)
  if (!proposal || !proposal.rollback) return undefined
  const previousValue = proposal.rollback.currentValue
  proposal.proposedValue = proposal.currentValue
  proposal.status = 'REJECTED'
  proposal.auditTrail.push({ timestamp: new Date().toISOString(), action: 'rolled_back', detail: `Restored previous value: ${previousValue}` })
  delete proposal.rollback
  return proposal
}

export function clearProposals(): void {
  store.clear()
}
