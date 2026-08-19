/**
 * SaaS — Role-Based Access Control.
 * A declarative role → permission matrix. Adding roles/permissions is config,
 * not code.
 */

export type Role = 'guest' | 'user' | 'premium' | 'developer' | 'moderator' | 'admin' | 'enterprise' | 'super_admin'

export type Permission =
  | 'tools:view' | 'tools:use' | 'tools:create' | 'tools:edit' | 'tools:delete'
  | 'ai:use' | 'ai:credits'
  | 'api:read' | 'api:write' | 'api:manage'
  | 'org:manage' | 'team:manage' | 'members:manage'
  | 'billing:view' | 'billing:manage'
  | 'marketplace:install' | 'plugin:manage'
  | 'admin:dashboard' | 'admin:users' | 'admin:settings' | 'admin:content'
  | 'audit:read'

const MATRIX: Record<Role, Permission[]> = {
  guest: ['tools:view'],
  user: ['tools:view', 'tools:use', 'ai:use'],
  premium: ['tools:view', 'tools:use', 'tools:create', 'ai:use', 'ai:credits', 'api:read'],
  developer: ['tools:view', 'tools:use', 'tools:create', 'tools:edit', 'ai:use', 'ai:credits', 'api:read', 'api:write', 'api:manage', 'plugin:manage'],
  moderator: ['tools:view', 'tools:use', 'tools:edit', 'tools:delete', 'ai:use', 'api:read', 'admin:content'],
  admin: ['tools:view', 'tools:use', 'tools:create', 'tools:edit', 'tools:delete', 'ai:use', 'ai:credits', 'api:read', 'api:write', 'api:manage', 'org:manage', 'team:manage', 'members:manage', 'billing:view', 'marketplace:install', 'plugin:manage', 'admin:dashboard', 'admin:users', 'admin:settings', 'admin:content', 'audit:read'],
  enterprise: ['tools:view', 'tools:use', 'tools:create', 'tools:edit', 'ai:use', 'ai:credits', 'api:read', 'api:write', 'org:manage', 'team:manage', 'members:manage', 'billing:view', 'marketplace:install'],
  super_admin: ['tools:view', 'tools:use', 'tools:create', 'tools:edit', 'tools:delete', 'ai:use', 'ai:credits', 'api:read', 'api:write', 'api:manage', 'org:manage', 'team:manage', 'members:manage', 'billing:view', 'billing:manage', 'marketplace:install', 'plugin:manage', 'admin:dashboard', 'admin:users', 'admin:settings', 'admin:content', 'audit:read'],
}

const ROLE_RANK: Record<Role, number> = { guest: 0, user: 1, premium: 2, developer: 3, enterprise: 4, moderator: 5, admin: 6, super_admin: 7 }

/** Whether a role has a permission (directly or inherited by rank). */
export function hasPermission(role: Role, permission: Permission): boolean {
  return MATRIX[role].includes(permission)
}

/** Guard factory — returns a checker bound to a set of roles. */
export function guardFor(roles: Role[]) {
  const effective = highestRole(roles)
  return {
    role: effective,
    can: (permission: Permission) => hasPermission(effective, permission),
    canAny: (...permissions: Permission[]) => permissions.some(p => hasPermission(effective, p)),
  }
}

/** Pick the highest-ranked role from a user's role list. */
export function highestRole(roles: Role[]): Role {
  if (!roles.length) return 'guest'
  return roles.reduce((a, b) => (ROLE_RANK[b] > ROLE_RANK[a] ? b : a))
}

export const ROLE_LIST: Role[] = Object.keys(MATRIX) as Role[]