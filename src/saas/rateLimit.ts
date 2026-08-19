/**
 * SaaS — Rate limiting.
 * Sliding-window token bucket, in-memory. For multi-region production, back it
 * with a shared store (Redis / Cloudflare KV / D1) by implementing RateStore.
 */

export interface RateStore {
  get(key: string): Promise<{ tokens: number; last: number } | null>
  set(key: string, value: { tokens: number; last: number }, ttlMs: number): Promise<void>
}

export class RateLimiter {
  private store: RateStore
  private capacity: number
  private refillPerMs: number

  constructor(store: RateStore, capacity: number, refillPerMs: number) {
    this.store = store
    this.capacity = capacity
    this.refillPerMs = refillPerMs
  }

  /** Try to consume one token. Returns { allowed, retryAfterMs }. */
  async allow(key: string): Promise<{ allowed: boolean; retryAfterMs: number }> {
    const now = Date.now()
    const bucket = (await this.store.get(key)) ?? { tokens: this.capacity, last: now }

    // Refill tokens proportional to elapsed time.
    const elapsed = now - bucket.last
    const refill = Math.floor(elapsed * this.refillPerMs)
    const tokens = Math.min(this.capacity, bucket.tokens + refill)

    if (tokens >= 1) {
      await this.store.set(key, { tokens: tokens - 1, last: now }, 60_000)
      return { allowed: true, retryAfterMs: 0 }
    }

    const need = 1 - tokens
    const retryAfterMs = Math.ceil(need / this.refillPerMs)
    await this.store.set(key, { tokens, last: now }, 60_000)
    return { allowed: false, retryAfterMs }
  }
}

/** In-memory store (dev/test / single instance). */
export class MemoryRateStore implements RateStore {
  private map = new Map<string, { tokens: number; last: number; exp: number }>()
  async get(key: string) {
    const v = this.map.get(key)
    if (!v || v.exp < Date.now()) { this.map.delete(key); return null }
    return { tokens: v.tokens, last: v.last }
  }
  async set(key: string, value: { tokens: number; last: number }, ttlMs: number) {
    this.map.set(key, { ...value, exp: Date.now() + ttlMs })
  }
}

/** Build a limiter from a per-hour budget (e.g. plan.apiRateLimit). */
export function perHourLimiter(requestsPerHour: number): RateLimiter {
  return new RateLimiter(new MemoryRateStore(), requestsPerHour, requestsPerHour / 3_600_000)
}