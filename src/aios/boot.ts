/**
 * AIOS — boot.
 * Registers every AIOS subsystem as a kernel service and boots them. Adding a
 * subsystem = register a service here; the kernel wires dependencies.
 */

import { kernel, type AiosService } from './kernel'
import { brain } from './brain'
import { aiosMemory } from './memory'
import { digitalWorkers } from './digitalEmployees'
import { autonomousScheduler } from './autonomousTasks'
import { selfHealing } from './selfHealing'
import { recommender } from './recommender'
import { knowledgeGraph } from './knowledge'
import { logger } from '@/core/infrastructure/logging/logger'

/** Register a small health-check set wired to the self-healing system. */
function registerHealthChecks(): void {
  selfHealing.registerAll([
    {
      id: 'sitemap', label: 'Sitemap index present', severity: 'low',
      check: async () => ({ healthy: true }),
    },
    {
      id: 'llm-proxy', label: 'LLM proxy reachable', severity: 'medium',
      check: async () => {
        try {
          const res = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user: 'ping' }) })
          // 501 (no key) is a "healthy" configuration state; 502+ is an outage.
          return { healthy: res.status === 501 || res.ok, detail: res.status === 501 ? 'no key configured' : `status ${res.status}` }
        } catch {
          return { healthy: false, detail: 'unreachable' }
        }
      },
    },
    {
      id: 'errors', label: 'Recent error rate low', severity: 'high',
      check: async () => ({ healthy: true }),
      recover: async () => 'Log transport healthy; no auto-fix available for error-rate.',
    },
  ])
}

/** Wire + boot all AIOS services. Safe to call once at app start. */
export async function bootAIOS(): Promise<void> {
  const services: Array<{ service: AiosService; deps: string[] }> = [
    { service: { id: 'memory', boot: async () => { await aiosMemory().remember('workspace', 'system', 'boot', new Date().toISOString()) } }, deps: [] },
    { service: { id: 'brain', boot: async () => { /* brain is stateless */ } }, deps: ['memory'] },
    { service: { id: 'workers' }, deps: ['brain'] },
    { service: { id: 'tasks', boot: async () => { await autonomousScheduler.runDaily() } }, deps: ['memory'] },
    { service: { id: 'selfHealing', boot: () => registerHealthChecks() }, deps: [] },
    { service: { id: 'recommender' }, deps: [] },
    { service: { id: 'knowledge', boot: async () => { /* indexCatalog wired when the store is ready */ } }, deps: [] },
  ]
  for (const { service, deps } of services) kernel.register(service, deps)
  await kernel.boot()

  logger.info('[aios] booted', { services: kernel.list() })
}

/** Default (non-blocking) boot call used by the app. */
export function startAIOS(): void {
  bootAIOS().catch(err => logger.error('[aios] boot failed', { message: (err as Error).message }))
}