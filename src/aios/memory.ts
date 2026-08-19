/**
 * AIOS — Global Memory.
 * Hierarchical memory: workspace → organization → user → project, plus prompt and
 * knowledge libraries. Backed by the abstract DB port (swap for D1/Redis/Postgres
 * without changing callers). Short/long-term distinction via TTL.
 */

import type { IDatabasePort } from '@/core/infrastructure/db/databasePort'
import { MemoryDatabase } from '@/core/infrastructure/db/databasePort'

export type MemoryScope = 'workspace' | 'organization' | 'user' | 'project' | 'prompt' | 'knowledge'

export interface MemoryRecord {
  scope: MemoryScope
  ownerId: string
  key: string
  value: string
  ttlMs?: number
  at: string
}

export class AiosMemory {
  private db: IDatabasePort
  constructor(db: IDatabasePort) { this.db = db }

  async remember(scope: MemoryScope, ownerId: string, key: string, value: string, ttlMs?: number): Promise<void> {
    const rec: MemoryRecord = { scope, ownerId, key, value, ttlMs, at: new Date().toISOString() }
    // Upsert by (scope, ownerId, key).
    const existing = await this.db.findOne<MemoryRecord>('memory', { scope, ownerId, key })
    if (existing) {
      await this.db.update('memory', { scope, ownerId, key }, { value, ttlMs, at: rec.at })
    } else {
      await this.db.insert<MemoryRecord>('memory', rec as Partial<MemoryRecord>)
    }
  }

  async recall(scope: MemoryScope, ownerId: string, key: string): Promise<string | undefined> {
    const rec = await this.db.findOne<MemoryRecord>('memory', { scope, ownerId, key })
    if (!rec) return undefined
    if (rec.ttlMs && Date.now() - new Date(rec.at).getTime() > rec.ttlMs) return undefined
    return rec.value
  }

  async search(scope: MemoryScope, ownerId: string, query: string): Promise<MemoryRecord[]> {
    const q = query.toLowerCase()
    const all = await this.db.find<MemoryRecord>('memory', { filter: { scope, ownerId } })
    return all.filter(r => r.key.toLowerCase().includes(q) || r.value.toLowerCase().includes(q)).slice(0, 20)
  }

  async forget(scope: MemoryScope, ownerId: string, key: string): Promise<void> {
    await this.db.remove('memory', { scope, ownerId, key })
  }

  async list(scope: MemoryScope, ownerId: string): Promise<MemoryRecord[]> {
    return this.db.find<MemoryRecord>('memory', { filter: { scope, ownerId } })
  }
}

// Boot-time instance over the default in-memory driver (swap in container.ts).
let mem: AiosMemory | null = null
export function aiosMemory(): AiosMemory {
  if (!mem) mem = new AiosMemory(new MemoryDatabase())
  return mem
}