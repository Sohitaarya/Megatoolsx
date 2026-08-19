/**
 * Repository (data-access) contracts.
 *
 * The application layer depends on these interfaces — NOT on any concrete
 * database. Swapping PostgreSQL → MySQL → MongoDB → Cloudflare D1 only requires
 * providing a new adapter that implements these contracts.
 */

import type { Page, SavedToolEntity, ToolEntity, UserEntity } from './entities'

export interface IToolRepository {
  list(): Promise<ToolEntity[]>
  findBySlug(slug: string): Promise<ToolEntity | null>
  count(): Promise<number>
}

export interface IUserRepository {
  findByEmail(email: string): Promise<UserEntity | null>
  findById(id: string): Promise<UserEntity | null>
  save(user: UserEntity): Promise<UserEntity>
  delete(id: string): Promise<void>
}

export interface ISavedToolRepository {
  listByUser(userId: string, kind?: SavedToolEntity['kind']): Promise<SavedToolEntity[]>
  add(item: SavedToolEntity): Promise<void>
  remove(userId: string, slug: string, kind: SavedToolEntity['kind']): Promise<void>
  isSaved(userId: string, slug: string, kind: SavedToolEntity['kind']): Promise<boolean>
}

export interface IAuditLogRepository {
  write(entry: { actorId?: string; action: string; entity?: string; meta?: Record<string, unknown> }): Promise<void>
  query(filter: { actorId?: string; limit?: number }): Promise<Page<{ id: string; actorId?: string; action: string; createdAt: string }>>
}

/** Generic paginated query contract used by search/admin features. */
export interface IQueryable<T> {
  query(opts: { page?: number; pageSize?: number; filter?: Record<string, unknown>; sort?: string }): Promise<Page<T>>
}
