/**
 * SaaS — Credits ledger.
 * Tracks AI/image/video/OCR/PDF credits per user with monthly reset, purchase
 * and bonus entries. Deterministic and testable.
 */

export type CreditKind = 'ai' | 'image' | 'video' | 'ocr' | 'pdf'

export type CreditEntryType = 'allowance' | 'purchase' | 'bonus' | 'spend' | 'refund' | 'expire'

export interface CreditEntry {
  id: string
  userId: string
  kind: CreditKind
  type: CreditEntryType
  amount: number
  at: string
  ref?: string
}

/** Monthly allowance per plan (from the plan catalog). */
export const DEFAULT_ALLOWANCE: Record<CreditKind, number> = { ai: 5, image: 0, video: 0, ocr: 0, pdf: 0 }

export class CreditsLedger {
  private entries: CreditEntry[] = []

  apply(entry: Omit<CreditEntry, 'id' | 'at'>): CreditEntry {
    const record: CreditEntry = { ...entry, id: crypto.randomUUID(), at: new Date().toISOString() }
    this.entries.push(record)
    return record
  }

  /** Current balance for a kind (sum of all entries). */
  balance(userId: string, kind: CreditKind): number {
    return this.entries.filter(e => e.userId === userId && e.kind === kind).reduce((a, e) => a + e.amount, 0)
  }

  /** Spend credits; throws when insufficient. */
  spend(userId: string, kind: CreditKind, amount: number, ref?: string): CreditEntry {
    if (this.balance(userId, kind) < amount) throw new Error(`Insufficient ${kind} credits`)
    return this.apply({ userId, kind, type: 'spend', amount: -amount, ref })
  }

  /** Grant a monthly allowance (only if no allowance for the current month yet). */
  grantMonthlyAllowance(userId: string, month: string, allowance: Partial<Record<CreditKind, number>> = {}): void {
    const hasAllowance = this.entries.some(e => e.userId === userId && e.type === 'allowance' && e.at.startsWith(month))
    if (hasAllowance) return
    for (const kind of Object.keys(DEFAULT_ALLOWANCE) as CreditKind[]) {
      const amount = allowance[kind] ?? DEFAULT_ALLOWANCE[kind]
      if (amount > 0) this.apply({ userId, kind, type: 'allowance', amount })
    }
  }

  /** History for a user, newest first. */
  history(userId: string): CreditEntry[] {
    return this.entries.filter(e => e.userId === userId).sort((a, b) => b.at.localeCompare(a.at))
  }

  entriesCount(): number { return this.entries.length }
}

export const creditsLedger = new CreditsLedger()