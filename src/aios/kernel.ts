/**
 * AIOS — Kernel.
 *
 * The kernel is a typed service registry that every module communicates through.
 * It wires the AI router, brain, memory, agent manager, plugin manager, workflow
 * engine, security manager and monitoring manager into one composable system, and
 * boots them in dependency order. Adding a subsystem = registering a service.
 */

import { logger } from '@/core/infrastructure/logging/logger'

export interface AiosService {
  /** Unique service name. */
  id: string
  /** Called once at boot, after declared dependencies. */
  boot?(): void | Promise<void>
  /** Called on shutdown (flush, close pools). */
  shutdown?(): void | Promise<void>
}

export interface KernelOptions {
  /** When true, self-healing actions that need approval are auto-denied. */
  requireApproval?: boolean
}

class AiosKernel {
  private services = new Map<string, AiosService>()
  private order: string[] = []
  private options: KernelOptions

  constructor(options: KernelOptions = {}) { this.options = options }

  register(service: AiosService, deps: string[] = []): void {
    if (this.services.has(service.id)) throw new Error(`Service already registered: ${service.id}`)
    this.services.set(service.id, service)
    this.order.push(service.id)
    for (const d of deps) if (!this.services.has(d)) throw new Error(`Missing dependency ${d} for ${service.id}`)
  }

  get<T extends AiosService>(id: string): T | undefined { return this.services.get(id) as T | undefined }
  require<T extends AiosService>(id: string): T {
    const svc = this.get<T>(id)
    if (!svc) throw new Error(`Service not found: ${id}`)
    return svc
  }
  has(id: string): boolean { return this.services.has(id) }
  list(): string[] { return [...this.order] }
  requireApproval(): boolean { return this.options.requireApproval ?? false }

  /** Boot all services in registration order (dependencies first by array order). */
  async boot(): Promise<void> {
    for (const id of this.order) {
      const svc = this.services.get(id)!
      if (svc.boot) {
        try { await svc.boot() } catch (err) { logger.error('[aios] boot failed', { service: id, message: err instanceof Error ? err.message : String(err) }) }
      }
    }
  }

  async shutdown(): Promise<void> {
    for (let i = this.order.length - 1; i >= 0; i--) {
      const svc = this.services.get(this.order[i])!
      if (svc.shutdown) { try { await svc.shutdown() } catch { /* ignore */ } }
    }
  }
}

export const kernel = new AiosKernel()