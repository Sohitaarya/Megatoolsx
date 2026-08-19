/**
 * SEO Monitoring — durable snapshot history (adapter-based).
 * schemaVersion is versioned for future migration. Retention is configurable;
 * snapshots are idempotent by (date + property + period). Adapters:
 *   - InMemorySnapshotStore      (dev / no backend)
 *   - CloudflareKVSnapshotStore  (production — KV)
 *   - CloudflareD1SnapshotStore  (production — D1)
 * Never browser localStorage for authoritative history.
 */

import type { DataAvailability, SeoSnapshot } from './types'

export const SNAPSHOT_SCHEMA_VERSION = 1

export interface SnapshotRecord {
  key: string
  date: string
  period: string
  schemaVersion: number
  data: SeoSnapshot
}

export interface SnapshotStore {
  save(snapshot: SeoSnapshot, period?: string): Promise<void>
  latest(): Promise<SeoSnapshot | null>
  list(range?: { from?: string; to?: string }): Promise<SeoSnapshot[]>
  prune(before: string): Promise<number>
}

export function snapshotKey(date: string, property: string, period = '28d'): string {
  return `seo:${property}:${date}:${period}`
}

/* ── InMemory (dev / fallback) ─────────────────────────────────── */
export class InMemorySnapshotStore implements SnapshotStore {
  private map = new Map<string, SnapshotRecord>()
  private retentionDays: number
  constructor(retentionDays = 90) { this.retentionDays = retentionDays }
  async save(snapshot: SeoSnapshot, period = '28d'): Promise<void> {
    const key = snapshotKey(snapshot.date, 'megatoolsx', period)
    if (this.map.has(key)) return // idempotent
    this.map.set(key, { key, date: snapshot.date, period, schemaVersion: SNAPSHOT_SCHEMA_VERSION, data: snapshot })
  }
  async latest(): Promise<SeoSnapshot | null> {
    const rows = Array.from(this.map.values()).sort((a, b) => a.date.localeCompare(b.date))
    return rows[rows.length - 1]?.data ?? null
  }
  async list(range: { from?: string; to?: string } = {}): Promise<SeoSnapshot[]> {
    return Array.from(this.map.values())
      .filter(r => (!range.from || r.date >= range.from) && (!range.to || r.date <= range.to))
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(r => r.data)
  }
  async prune(before: string): Promise<number> {
    let n = 0
    for (const [k, r] of this.map) if (r.date < before) { this.map.delete(k); n++ }
    return n
  }
}

/* ── Cloudflare KV ──────────────────────────────────────────────── */
export interface KvBinding { get(key: string): Promise<string | null>; put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>; delete(key: string): Promise<void>; list(options?: { prefix?: string }): Promise<{ keys: Array<{ name: string }> }> }

export class CloudflareKVSnapshotStore implements SnapshotStore {
  private kv: KvBinding
  private prefix: string
  private retentionDays: number
  constructor(kv: KvBinding, prefix = 'seo:', retentionDays = 90) { this.kv = kv; this.prefix = prefix; this.retentionDays = retentionDays }
  private key(date: string, period = '28d') { return `${this.prefix}${snapshotKey(date, 'megatoolsx', period)}` }
  async save(snapshot: SeoSnapshot, period = '28d'): Promise<void> {
    const k = this.key(snapshot.date, period)
    const existing = await this.kv.get(k)
    if (existing) return // idempotent
    const rec: SnapshotRecord = { key: k, date: snapshot.date, period, schemaVersion: SNAPSHOT_SCHEMA_VERSION, data: snapshot }
    await this.kv.put(k, JSON.stringify(rec), { expirationTtl: this.retentionDays * 86400 })
  }
  async latest(): Promise<SeoSnapshot | null> {
    const { keys } = await this.kv.list({ prefix: this.prefix })
    const names = keys.map(k => k.name).sort()
    if (!names.length) return null
    const raw = await this.kv.get(names[names.length - 1])
    return raw ? (JSON.parse(raw) as SnapshotRecord).data : null
  }
  async list(): Promise<SeoSnapshot[]> {
    const { keys } = await this.kv.list({ prefix: this.prefix })
    const out: SeoSnapshot[] = []
    for (const k of keys.sort()) {
      const raw = await this.kv.get(k.name)
      if (raw) out.push((JSON.parse(raw) as SnapshotRecord).data)
    }
    return out
  }
  async prune(before: string): Promise<number> {
    const { keys } = await this.kv.list({ prefix: this.prefix })
    let n = 0
    for (const k of keys) {
      if (k.name.includes(':' + before) || k.name < this.key(before)) { await this.kv.delete(k.name); n++ }
    }
    return n
  }
}

/* ── Cloudflare D1 ──────────────────────────────────────────────── */
export interface D1Binding {
  prepare(sql: string): D1Stmt
}
export interface D1Stmt { bind(...params: unknown[]): D1Stmt; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; run(): Promise<{ meta: { changes: number } }> }

export class CloudflareD1SnapshotStore implements SnapshotStore {
  private d1: D1Binding
  private retentionDays: number
  constructor(d1: D1Binding, retentionDays = 90) { this.d1 = d1; this.retentionDays = retentionDays }
  async save(snapshot: SeoSnapshot, period = '28d'): Promise<void> {
    const key = snapshotKey(snapshot.date, 'megatoolsx', period)
    const existing = await this.d1.prepare('SELECT key FROM seo_snapshots WHERE key = ?').bind(key).first()
    if (existing) return // idempotent
    await this.d1.prepare('INSERT INTO seo_snapshots (key, date, period, schema_version, data) VALUES (?, ?, ?, ?, ?)')
      .bind(key, snapshot.date, period, SNAPSHOT_SCHEMA_VERSION, JSON.stringify(snapshot)).run()
  }
  async latest(): Promise<SeoSnapshot | null> {
    const row = await this.d1.prepare('SELECT data FROM seo_snapshots ORDER BY date DESC LIMIT 1').first<{ data: string }>()
    return row ? (JSON.parse(row.data) as SeoSnapshot) : null
  }
  async list(range: { from?: string; to?: string } = {}): Promise<SeoSnapshot[]> {
    const sql = range.from || range.to
      ? 'SELECT data FROM seo_snapshots WHERE (? IS NULL OR date >= ?) AND (? IS NULL OR date <= ?) ORDER BY date ASC'
      : 'SELECT data FROM seo_snapshots ORDER BY date ASC'
    const rows = range.from || range.to
      ? await this.d1.prepare(sql).bind(range.from ?? null, range.from ?? null, range.to ?? null, range.to ?? null).all<{ data: string }>()
      : await this.d1.prepare(sql).all<{ data: string }>()
    return rows.results.map(r => JSON.parse(r.data) as SeoSnapshot)
  }
  async prune(before: string): Promise<number> {
    const res = await this.d1.prepare('DELETE FROM seo_snapshots WHERE date < ?').bind(before).run()
    return res.meta.changes
  }
}

/** Resolve the active store from config (D1 > KV > in-memory). */
export function resolveSnapshotStore(cfg: { provider: 'd1' | 'kv' | 'memory'; kv?: KvBinding; d1?: D1Binding; retentionDays: number }): DataAvailability<SnapshotStore> {
  if (cfg.provider === 'd1' && cfg.d1) return { status: 'available', data: new CloudflareD1SnapshotStore(cfg.d1, cfg.retentionDays) }
  if (cfg.provider === 'kv' && cfg.kv) return { status: 'available', data: new CloudflareKVSnapshotStore(cfg.kv, 'seo:', cfg.retentionDays) }
  if (cfg.provider === 'memory' || (!cfg.d1 && !cfg.kv)) return { status: 'available', data: new InMemorySnapshotStore(cfg.retentionDays) }
  return { status: 'not_configured', reason: 'history_storage_not_configured' }
}

export function emptySnapshot(date: string): SeoSnapshot {
  return {
    date,
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    status: 'not_configured',
    metrics: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
    dataQuality: { rowsReceived: 0, rowsAccepted: 0, rowsRejected: 0, truncated: false },
    fetchMetadata: { rowsFetched: 0, pagesFetched: 0, truncated: false },
  }
}