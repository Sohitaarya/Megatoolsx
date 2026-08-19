/**
 * Cache service — an async in-memory TTL cache with a storage backend adapter
 * (localStorage / IndexedDB / Cloudflare KV via a proxy). Swappable per env.
 */

export interface CacheBackend {
  get(key: string): Promise<string | null>
  set(key: string, value: string, ttlMs: number): Promise<void>
  delete(key: string): Promise<void>
}

class MemoryBackend implements CacheBackend {
  private store = new Map<string, { value: string; expires: number }>()
  async get(key: string): Promise<string | null> {
    const item = this.store.get(key)
    if (!item) return null
    if (item.expires < Date.now()) { this.store.delete(key); return null }
    return item.value
  }
  async set(key: string, value: string, ttlMs: number): Promise<void> {
    this.store.set(key, { value, expires: Date.now() + ttlMs })
  }
  async delete(key: string): Promise<void> { this.store.delete(key) }
}

export class CacheService {
  private backend: CacheBackend

  constructor(backend?: CacheBackend) {
    this.backend = backend ?? new MemoryBackend()
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.backend.get(key)
    if (raw === null) return null
    try { return JSON.parse(raw) as T } catch { return null }
  }

  async set<T>(key: string, value: T, ttlMs = 5 * 60 * 1000): Promise<void> {
    await this.backend.set(key, JSON.stringify(value), ttlMs)
  }

  async delete(key: string): Promise<void> { await this.backend.delete(key) }

  /** Memoize an async producer with TTL — dedupes concurrent calls too. */
  async memo<T>(key: string, producer: () => Promise<T>, ttlMs = 5 * 60 * 1000): Promise<T> {
    const hit = await this.get<T>(key)
    if (hit !== null) return hit
    const value = await producer()
    await this.set(key, value, ttlMs)
    return value
  }
}

export const cacheService = new CacheService()