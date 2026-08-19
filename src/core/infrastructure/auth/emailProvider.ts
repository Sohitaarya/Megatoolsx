/**
 * Email/password auth provider — REAL local implementation.
 * Passwords are PBKDF2-hashed and stored via IUserRepository. Other providers
 * (Google/GitHub/Microsoft/Apple/OTP/Magic-link/Passkey) plug in behind the same
 * AuthProvider interface and are only installed when configured.
 */

import type { UserEntity } from '@/core/domain/entities'
import type { IUserRepository } from '@/core/domain/repositories'
import { UnauthorizedError, ValidationError } from '@/core/errors/appError'
import type { AuthCredentials, AuthProvider, SessionEntity } from './authProvider'
import { hashPassword, verifyPassword } from './password'

/** User record as stored (optionally carries a PBKDF2 password hash). */
export type StoredUser = UserEntity & { passwordHash?: string }

function newSession(userId: string): SessionEntity {
  const now = Date.now()
  return {
    token: crypto.randomUUID().replace(/-/g, '') + '.' + now.toString(36) + '.' + userId,
    userId,
    expiresAt: new Date(now + 30 * 24 * 3600 * 1000).toISOString(),
  }
}

export class EmailProvider implements AuthProvider {
  id = 'email' as const
  label = 'Email'
  private userRepo: IUserRepository
  constructor(userRepo: IUserRepository) { this.userRepo = userRepo }
  enabled(): boolean { return true }

  async authenticate(credentials: AuthCredentials): Promise<SessionEntity> {
    const email = normalize(credentials.email)
    if (!email) throw new ValidationError('Email is required')
    if (!credentials.password) throw new ValidationError('Password is required')

    const existing = await this.userRepo.findByEmail(email) as StoredUser | null
    if (!existing) {
      // Auto sign-up. Store a PBKDF2 hash — never plaintext.
      const hash = await hashPassword(credentials.password)
      const user: StoredUser = {
        id: crypto.randomUUID(),
        email,
        displayName: email.split('@')[0],
        provider: 'email',
        roles: ['user'],
        createdAt: new Date().toISOString(),
        passwordHash: hash,
      }
      await this.userRepo.save(user)
      return newSession(user.id)
    }

    const stored = existing.passwordHash
    if (!stored) throw new UnauthorizedError('Account uses another login method')
    const ok = await verifyPassword(credentials.password, stored)
    if (!ok) throw new UnauthorizedError('Invalid email or password')
    return newSession(existing.id)
  }
}

function normalize(email: string): string {
  return (email || '').trim().toLowerCase()
}