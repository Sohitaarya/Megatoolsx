/**
 * Composition root (dependency injection).
 *
 * Wire the concrete database → repositories → application services here. To swap
 * the database (PostgreSQL/MySQL/MongoDB/D1/localStorage) only this file and the
 * driver change — application code depends on interfaces only.
 */

import { LocalStorageDatabase, MemoryDatabase, type IDatabasePort } from '@/core/infrastructure/db/databasePort'
import { ToolService } from '@/core/application/toolService'
import { AuthService } from '@/core/application/authService'
import { EmailProvider, type StoredUser } from '@/core/infrastructure/auth/emailProvider'
import { logger } from '@/core/infrastructure/logging/logger'

export interface Container {
  db: IDatabasePort
  tools: ToolService
  auth: AuthService
}

let instance: Container | null = null

/** Pick the active database driver from the environment. */
function pickDatabase(): IDatabasePort {
  const kind = import.meta.env.VITE_DB_DRIVER
  switch (kind) {
    case 'memory': return new MemoryDatabase()
    case 'local':
    default: return new LocalStorageDatabase('megatoolsx:db:')
  }
}

/** Build (or return the cached) application container. */
export function buildContainer(): Container {
  if (instance) return instance

  const db = pickDatabase()
  const tools = new ToolService({ list: async () => [], findBySlug: async () => null, count: async () => 0 })
  const auth = new AuthService()

  // Wire repositories over the active database.
  const userRepo = {
    findByEmail: async (email: string) => db.findOne<StoredUser>('users', { email }),
    findById: async (id: string) => db.findOne<StoredUser>('users', { id }),
    save: async (user: StoredUser) => { await db.insert<StoredUser>('users', user); return user },
    delete: async (id: string) => { await db.remove('users', { id }) },
  }

  auth.registerProvider(new EmailProvider(userRepo))

  logger.info('[container] built', { db: db.constructor.name })
  instance = { db, tools, auth }
  return instance
}

export function useContainer(): Container {
  if (!instance) return buildContainer()
  return instance
}