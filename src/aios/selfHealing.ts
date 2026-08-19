/**
 * AIOS — Self-Healing.
 * Detectors watch for broken pages, failed APIs, slow responses, queue failures.
 * Recovery actions run automatically for low-impact fixes and require approval
 * for high-impact ones (per kernel.requireApproval).
 */

import { logger } from '@/core/infrastructure/logging/logger'
import { kernel } from './kernel'

export type Severity = 'low' | 'medium' | 'high'

export interface HealthCheck {
  id: string
  label: string
  severity: Severity
  check(): Promise<{ healthy: boolean; detail?: string }>
  /** Optional recovery action. High-severity recoveries are approval-gated. */
  recover?(): Promise<string>
}

export interface HealthReport {
  id: string
  label: string
  severity: Severity
  healthy: boolean
  detail?: string
  action: 'none' | 'auto' | 'pending-approval' | 'denied'
  at: string
}

export class SelfHealing {
  private checks: HealthCheck[] = []

  register(check: HealthCheck): void { this.checks.push(check) }
  registerAll(checks: HealthCheck[]): void { checks.forEach(c => this.register(c)) }
  list(): HealthCheck[] { return this.checks }

  /** Run all checks; recover where safe, gate high-severity actions. */
  async runAll(): Promise<HealthReport[]> {
    const reports: HealthReport[] = []
    for (const check of this.checks) {
      const at = new Date().toISOString()
      try {
        const result = await check.check()
        let action: HealthReport['action'] = 'none'
        if (result.healthy) {
          reports.push({ ...check, healthy: true, action, at })
          continue
        }
        if (!check.recover) {
          reports.push({ ...check, healthy: false, detail: result.detail, action: 'none', at })
          continue
        }
        if (check.severity === 'high' || kernel.requireApproval()) {
          // High-impact recovery requires approval — record and skip.
          action = kernel.requireApproval() ? 'denied' : 'pending-approval'
          logger.warn('[aios] recovery requires approval', { id: check.id })
        } else {
          action = 'auto'
          await check.recover()
        }
        reports.push({ ...check, healthy: false, detail: result.detail, action, at })
      } catch (err) {
        logger.error(`[aios] health check failed: ${check.id}`, { message: (err as Error).message })
        reports.push({ id: check.id, label: check.label, severity: check.severity, healthy: false, detail: (err as Error).message, action: 'none', at })
      }
    }
    return reports
  }
}

export const selfHealing = new SelfHealing()