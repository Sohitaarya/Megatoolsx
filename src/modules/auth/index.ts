/**
 * Auth feature module — public surface.
 */
export { authService } from '@/core/application/authService'
export { EmailProvider, type StoredUser } from '@/core/infrastructure/auth/emailProvider'
export { hashPassword, verifyPassword } from '@/core/infrastructure/auth/password'
export { sessionStore } from '@/core/infrastructure/auth/authProvider'
export type { AuthProvider, AuthCredentials, ISessionStore } from '@/core/infrastructure/auth/authProvider'