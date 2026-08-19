/**
 * Domain entities — the pure model of the platform.
 * These are framework-agnostic and database-agnostic.
 */

export type ToolStatus = 'Present' | 'Generative' | 'Future'

/** A single tool as loaded from the CSV / registry. */
export interface ToolEntity {
  category: string
  name: string
  status: ToolStatus | string
  description: string
  seoKeywords: string
  metaDescription: string
  slug: string
}

/** A category aggregation. */
export interface CategoryEntity {
  name: string
  slug: string
  count: number
}

/** Capability classification result for a tool. */
export interface ToolCapability {
  kind: 'ai' | 'utility'
  topic: string
  verb: 'generate' | 'plan' | 'analyze' | 'simulate' | 'convert' | 'calculate'
  /** Optional explicit handler key from the config registry. */
  handler?: string
  /** Optional explicit compute key from the config registry. */
  compute?: string
}

/** Config-driven tool definition (the "no hardcoded tools" contract). */
export interface ToolConfig {
  slug: string
  name?: string
  category?: string
  /** Explicit capability overrides. When present they win over auto-classification. */
  capability?: Partial<ToolCapability>
  /** Hint text shown in the input box. */
  placeholder?: string
  /** Whether this tool requires an AI backend to be useful. */
  aiFirst?: boolean
  /** Feature flags. */
  enabled?: boolean
  /** Extra metadata used by SEO (title template, image…). */
  seo?: {
    title?: string
    description?: string
    image?: string
  }
}

export type UserRole = 'guest' | 'user' | 'editor' | 'admin'

/** Authenticated user (subset — never stores the password hash client-side). */
export interface UserEntity {
  id: string
  email: string
  displayName: string
  provider: 'email' | 'google' | 'github' | 'microsoft' | 'apple' | 'otp' | 'magic-link' | 'passkey'
  roles: UserRole[]
  createdAt: string
  lastSeenAt?: string
}

/** Session token shape (JWT-compatible claims). */
export interface SessionEntity {
  token: string
  expiresAt: string
  userId: string
}

/** A saved tool in a user's collection (bookmarks/favorites/compare). */
export interface SavedToolEntity {
  userId: string
  slug: string
  source: 'csv' | 'ai'
  kind: 'bookmark' | 'favorite' | 'compare' | 'recent'
  createdAt: string
}

/** A paginated result envelope used by repositories/services. */
export interface Page<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
