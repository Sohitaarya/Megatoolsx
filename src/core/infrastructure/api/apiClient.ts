/**
 * Unified API client.
 *
 * Features: typed requests, JSON handling, retries with backoff, timeout,
 * request coalescing/dedup, a request queue, and normalized error mapping.
 * Swap the transport (fetch → Cloudflare Workers → GraphQL) without touching
 * callers.
 */

import { AppError, NetworkError, RateLimitError, toAppError, UnauthorizedError, ValidationError } from '@/core/errors/appError'
import { logger } from '@/core/infrastructure/logging/logger'
import { cacheService } from '@/core/infrastructure/cache/cacheService'

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  query?: Record<string, string | number | boolean | undefined>
  body?: unknown
  headers?: Record<string, string>
  /** Cache GET responses for this many ms (0 = no cache). */
  cacheTtlMs?: number
  /** Max retries on transient failures (default 2). */
  retries?: number
  /** Timeout in ms (default 15000). */
  timeoutMs?: number
  /** Do not throw on HTTP errors — return { ok:false, error } instead. */
  soft?: boolean
  /** Attach auth token automatically. */
  authenticated?: boolean
}

export interface ApiErrorBody {
  ok: false
  error: AppError
  data?: never
}

export type ApiResult<T> = { ok: true; data: T } | ApiErrorBody

interface InflightEntry {
  promise: Promise<ApiResult<unknown>>
  expires: number
}

export class ApiClient {
  private inflight = new Map<string, InflightEntry>()
  private queue: Promise<unknown> = Promise.resolve()
  private baseUrl = ''

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  /** Serialize a task after prior tasks (request queue). */
  private enqueue<T>(task: () => Promise<T>): Promise<T> {
    const next = this.queue.then(task, task)
    // Keep the chain alive even if this task rejects.
    this.queue = next.then(() => undefined, () => undefined)
    return next
  }

  async request<T>(path: string, opts: ApiRequestOptions = {}): Promise<ApiResult<T>> {
    const key = this.cacheKey(path, opts)
    const method = opts.method ?? 'GET'

    if (method === 'GET' && opts.cacheTtlMs) {
      const hit = await cacheService.get<T>(key)
      if (hit !== null) return { ok: true, data: hit }
    }

    // Coalesce concurrent identical GETs.
    if (method === 'GET' && opts.cacheTtlMs && this.inflight.has(key)) {
      const existing = this.inflight.get(key)!
      if (existing.expires > Date.now()) {
        return (await existing.promise) as ApiResult<T>
      }
      this.inflight.delete(key)
    }

    const run = () => this.perform<T>(path, opts, key)
    const promise = this.enqueue(run)
    if (method === 'GET' && opts.cacheTtlMs) {
      this.inflight.set(key, { promise, expires: Date.now() + opts.cacheTtlMs })
    }

    const result = await promise
    if (method === 'GET' && opts.cacheTtlMs && result.ok) {
      await cacheService.set(key, result.data, opts.cacheTtlMs)
    }
    return result
  }

  private cacheKey(path: string, opts: ApiRequestOptions): string {
    const q = opts.query ? '?' + new URLSearchParams(this.stringify(opts.query)).toString() : ''
    return `${opts.method ?? 'GET'} ${path}${q}`
  }

  private stringify(q: Record<string, string | number | boolean | undefined>): Record<string, string> {
    const out: Record<string, string> = {}
    for (const [k, v] of Object.entries(q)) if (v !== undefined) out[k] = String(v)
    return out
  }

  private async perform<T>(path: string, opts: ApiRequestOptions, key: string): Promise<ApiResult<T>> {
    const retries = opts.retries ?? 2
    const timeoutMs = opts.timeoutMs ?? 15000

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await this.fetchWithTimeout(path, opts, timeoutMs)
        if (res.status === 401 && opts.authenticated) {
          logger.warn('[api] 401 received', { path, attempt })
        }
        if (res.status === 429) throw new RateLimitError('Rate limited', { cause: res.status })
        if (res.status === 0) throw new NetworkError('Network unreachable')

        const text = await res.text()
        const data = text ? safeJson(text) : undefined

        if (res.ok) return { ok: true, data: data as T }

        if (res.status === 400) throw new ValidationError(extractMessage(data) ?? 'Bad request')
        if (res.status === 401) throw new UnauthorizedError(extractMessage(data) ?? 'Unauthorized')
        if (res.status >= 500) throw new AppError('UPSTREAM', extractMessage(data) ?? `Upstream error ${res.status}`, { status: res.status })

        throw new AppError('UNKNOWN', extractMessage(data) ?? `Request failed with ${res.status}`, { status: res.status })
      } catch (err) {
        const appErr = toAppError(err)
        const retryable = appErr.code === 'NETWORK' || appErr.code === 'TIMEOUT' || appErr.code === 'UPSTREAM' || appErr.code === 'RATE_LIMITED'
        if (retryable && attempt < retries) {
          const delay = 300 * Math.pow(2, attempt) + Math.random() * 150
          await new Promise(r => setTimeout(r, delay))
          continue
        }
        if (opts.soft) return { ok: false, error: appErr }
        logger.error('[api] request failed', { path, code: appErr.code, message: appErr.message })
        throw appErr
      }
    }

    const err = new AppError('UNKNOWN', 'Unexpected request failure')
    if (opts.soft) return { ok: false, error: err }
    throw err
  }

  private async fetchWithTimeout(path: string, opts: ApiRequestOptions, timeoutMs: number): Promise<Response> {
    const url = this.baseUrl + path + (opts.query ? '?' + new URLSearchParams(this.stringify(opts.query)).toString() : '')
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      return await fetch(url, {
        method: opts.method ?? 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(opts.authenticated ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
          ...opts.headers,
        },
        body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
        signal: controller.signal,
      })
    } catch (err) {
      if ((err as Error).name === 'AbortError') throw new AppError('TIMEOUT', 'Request timed out')
      throw new NetworkError((err as Error).message)
    } finally {
      clearTimeout(timer)
    }
  }
}

/** Auth token provider — wired by the auth module. */
let authToken: string | null = null
export function setAuthToken(token: string | null): void { authToken = token }
function getAuthToken(): string { return authToken ?? '' }

function safeJson(text: string): unknown {
  try { return JSON.parse(text) } catch { return undefined }
}

function extractMessage(data: unknown): string | undefined {
  if (data && typeof data === 'object') {
    const anyData = data as Record<string, unknown>
    if (typeof anyData.message === 'string') return anyData.message
    if (typeof anyData.error === 'string') return anyData.error
  }
  return undefined
}

export const apiClient = new ApiClient()