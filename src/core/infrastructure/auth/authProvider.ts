/**
 * Authentication providers.
 *
 * Every sign-in method is a provider behind this interface: email/password,
 * OTP, magic link, passkey, and OAuth (Google/GitHub/Microsoft/Apple). OAuth and
 * passkey providers need a server-side backend (Cloudflare Workers + database);
 * the interface isolates the UI from that. When a provider is not configured it
 * simply isn't registered.
 */

import type { SessionEntity, UserEntity } from '@/core/domain/entities'
export type { SessionEntity } from '@/core/domain/entities'

export interface AuthCredentials {
  email: string
  password?: string
  otp?: string
  provider: 'email' | 'otp' | 'magic-link' | 'passkey' | 'google' | 'github' | 'microsoft' | 'apple'
}

export interface AuthProvider {
  id: AuthCredentials['provider']
  /** Human-readable name for the UI button. */
  label: string
  /** True when the provider is configured and can be shown. */
  enabled(): boolean
  /** Sign in (or sign up if allowed) and return a session. */
  authenticate(credentials: AuthCredentials): Promise<SessionEntity>
  /** Begin an OAuth/OTP flow (returns a redirect URL or a challenge). */
  begin?(email?: string): Promise<{ redirectUrl?: string; challenge?: string }>
  /** Validate a one-time code for OTP / magic-link providers. */
  verifyCode?(email: string, code: string): Promise<SessionEntity>
}

export interface ISessionStore {
  get(): SessionEntity | null
  set(session: SessionEntity): void
  clear(): void
}

/** Session storage over localStorage (secure flag handled server-side). */
export class LocalSessionStore implements ISessionStore {
  private key = 'megatoolsx:session'
  get(): SessionEntity | null {
    try {
      const raw = localStorage.getItem(this.key)
      if (!raw) return null
      const s = JSON.parse(raw) as SessionEntity
      if (new Date(s.expiresAt).getTime() < Date.now()) { this.clear(); return null }
      return s
    } catch { return null }
  }
  set(session: SessionEntity): void { try { localStorage.setItem(this.key, JSON.stringify(session)) } catch { /* ignore */ } }
  clear(): void { try { localStorage.removeItem(this.key) } catch { /* ignore */ } }
}

export const sessionStore: ISessionStore = new LocalSessionStore()