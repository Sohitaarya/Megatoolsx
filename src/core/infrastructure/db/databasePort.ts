/**
 * Database abstraction — a minimal hexagonal port.
 *
 * The application never talks to a specific database. It depends on these two
 * primitives (find / collect) and on higher-level repositories in
 * src/core/domain/repositories.ts. To switch backend (PostgreSQL, MySQL,
 * MongoDB, Firebase, Redis, SQLite, Cloudflare D1, localStorage) provide a new
 * driver that implements IDatabasePort and pass it to the repo constructors.
 */

export interface DbFilter {
  [field: string]: unknown
}

export interface DbFindOptions {
  filter?: DbFilter
  limit?: number
  offset?: number
  sort?: { field: string; dir: 'asc' | 'desc' }
}

export interface IDatabasePort {
  /** Read rows of a "table"/collection. */
  find<T>(collection: string, opts?: DbFindOptions): Promise<T[]>
  /** Return the first matching row or null. */
  findOne<T>(collection: string, filter: DbFilter): Promise<T | null>
  /** Insert/upsert a row; returns the row (with id/timestamps if applied). */
  insert<T>(collection: string, row: Partial<T>): Promise<T>
  /** Update rows matching a filter; returns the number modified. */
  update(collection: string, filter: DbFilter, patch: Record<string, unknown>): Promise<number>
  /** Delete rows matching a filter; returns the number removed. */
  remove(collection: string, filter: DbFilter): Promise<number>
  /** Count rows in a collection (optional filter). */
  count(collection: string, filter?: DbFilter): Promise<number>
  /** Health/availability signal for monitoring. */
  ping(): Promise<boolean>
}

/* ─── In-memory + localStorage driver (client-side) ────────────── */

export class LocalStorageDatabase implements IDatabasePort {
  private prefix: string

  constructor(prefix = 'megatoolsx:db:') {
    this.prefix = prefix
  }

  private key(c: string) { return this.prefix + c }

  private read<T>(c: string): T[] {
    try {
      const raw = localStorage.getItem(this.key(c))
      return raw ? (JSON.parse(raw) as T[]) : []
    } catch { return [] }
  }

  private write<T>(c: string, rows: T[]): void {
    try { localStorage.setItem(this.key(c), JSON.stringify(rows)) } catch { /* quota */ }
  }

  async find<T>(c: string, opts: DbFindOptions = {}): Promise<T[]> {
    let rows = this.read<T>(c)
    if (opts.filter) rows = rows.filter(r => Object.entries(opts.filter!).every(([k, v]) => (r as Record<string, unknown>)[k] === v))
    if (opts.sort) rows = [...rows].sort((a, b) => {
      const va = (a as Record<string, unknown>)[opts.sort!.field]
      const vb = (b as Record<string, unknown>)[opts.sort!.field]
      const cv = va == null || vb == null ? 0 : String(va).localeCompare(String(vb))
      return opts.sort!.dir === 'asc' ? cv : -cv
    })
    if (opts.offset) rows = rows.slice(opts.offset)
    if (opts.limit) rows = rows.slice(0, opts.limit)
    return rows
  }

  async findOne<T>(c: string, filter: DbFilter): Promise<T | null> {
    const rows = await this.find<T>(c, { filter })
    return rows[0] ?? null
  }

  async insert<T>(c: string, row: Partial<T>): Promise<T> {
    const rows = this.read<T>(c)
    const id = (row as Record<string, unknown>).id ?? crypto.randomUUID()
    const ts = new Date().toISOString()
    const record = { ...row, id, createdAt: ts } as T
    rows.push(record)
    this.write(c, rows)
    return record
  }

  async update(c: string, filter: DbFilter, patch: Record<string, unknown>): Promise<number> {
    const rows = this.read(c)
    let n = 0
    for (const r of rows) {
      if (Object.entries(filter).every(([k, v]) => (r as Record<string, unknown>)[k] === v)) {
        Object.assign(r as Record<string, unknown>, patch); n++
      }
    }
    this.write(c, rows)
    return n
  }

  async remove(c: string, filter: DbFilter): Promise<number> {
    const rows = this.read(c)
    const before = rows.length
    const next = rows.filter(r => !Object.entries(filter).every(([k, v]) => (r as Record<string, unknown>)[k] === v))
    this.write(c, next)
    return before - next.length
  }

  async count(c: string, filter?: DbFilter): Promise<number> {
    const rows = this.read(c)
    if (!filter) return rows.length
    return rows.filter(r => Object.entries(filter).every(([k, v]) => (r as Record<string, unknown>)[k] === v)).length
  }

  async ping(): Promise<boolean> { return typeof localStorage !== 'undefined' }
}

/** In-memory driver (test/dev) — same contract. */
export class MemoryDatabase extends LocalStorageDatabase {
  private mem: Record<string, unknown[]> = {}
  constructor() { super('__never_used__') }
  private readM<T>(c: string): T[] { return (this.mem[c] as T[]) ?? [] }
  private writeM<T>(c: string, rows: T[]) { this.mem[c] = rows }
  async find<T>(c: string, opts: DbFindOptions = {}): Promise<T[]> {
    let rows = this.readM<T>(c)
    if (opts.filter) rows = rows.filter(r => Object.entries(opts.filter!).every(([k, v]) => (r as Record<string, unknown>)[k] === v))
    if (opts.limit) rows = rows.slice(0, opts.limit)
    return rows
  }
  async findOne<T>(c: string, filter: DbFilter): Promise<T | null> { return (await this.find<T>(c, { filter }))[0] ?? null }
  async insert<T>(c: string, row: Partial<T>): Promise<T> {
    const rows = this.readM<T>(c)
    const record = { ...row, id: crypto.randomUUID() } as T
    rows.push(record); this.writeM(c, rows); return record
  }
  async update(c: string, filter: DbFilter, patch: Record<string, unknown>): Promise<number> {
    const rows = this.readM(c); let n = 0
    for (const r of rows) if (Object.entries(filter).every(([k, v]) => (r as Record<string, unknown>)[k] === v)) { Object.assign(r as Record<string, unknown>, patch); n++ }
    this.writeM(c, rows); return n
  }
  async remove(c: string, filter: DbFilter): Promise<number> {
    const rows = this.readM(c); const before = rows.length
    this.writeM(c, rows.filter(r => !Object.entries(filter).every(([k, v]) => (r as Record<string, unknown>)[k] === v)))
    return before - this.readM(c).length
  }
  async count(c: string, filter?: DbFilter): Promise<number> { if (!filter) return this.readM(c).length; return (await this.find(c, { filter })).length }
  async ping(): Promise<boolean> { return true }
  clear() { this.mem = {} }
}

/** Repository factory that ties concrete databases to repository contracts. */
export function repositories(db: IDatabasePort) {
  return {
    tools: db,
    users: db,
    savedTools: db,
    audit: db,
  }
}