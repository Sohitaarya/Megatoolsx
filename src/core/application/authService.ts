/**
 * Auth application service — facade over registered auth providers + session.
 */

import type { SessionEntity } from '@/core/domain/entities'
import { NotFoundError } from '@/core/errors/appError'
import type { AuthCredentials, AuthProvider, ISessionStore } from '@/core/infrastructure/auth/authProvider'
import { sessionStore } from '@/core/infrastructure/auth/authProvider'
import { logger } from '@/core/infrastructure/logging/logger'

export class AuthService {
  private providers = new Map<AuthCredentials['provider'], AuthProvider>()
  private session: ISessionStore

  constructor(session: ISessionStore = sessionStore) { this.session = session }

  /** Register a provider. External providers are installed only when configured. */
  registerProvider(provider: AuthProvider): void {
    if (!provider.enabled()) return
    this.providers.set(provider.id, provider)
  }

  providersAvailable() {
    return Array.from(this.providers.values()).map(p => ({ id: p.id, label: p.label }))
  }

  async authenticate(credentials: AuthCredentials): Promise<SessionEntity> {
    const provider = this.providers.get(credentials.provider)
    if (!provider) throw new NotFoundError(`Auth provider not configured: ${credentials.provider}`)
    const session = await provider.authenticate(credentials)
    this.session.set(session)
    logger.info('[auth] sign-in', { provider: credentials.provider })
    return session
  }

  getSession(): SessionEntity | null { return this.session.get() }
  currentUserId(): string | null { return this.session.get()?.userId ?? null }
  logout(): void { this.session.clear() }
}

export const authService = new AuthService()