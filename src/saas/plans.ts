/**
 * SaaS — subscription plans + entitlements.
 * Config-driven: adding a plan is a config change, not a code change.
 */

export type PlanId = 'free' | 'starter' | 'pro' | 'business' | 'enterprise' | 'lifetime'

export interface PlanFeature {
  /** Stable feature key, e.g. "ai.credits", "tools.offline", "api.rate". */
  key: string
  label: string
}

export interface Plan {
  id: PlanId
  name: string
  /** Monthly price in USD (0 for free/lifetime). */
  priceMonthly: number
  /** Annual price per month when billed yearly (0 = n/a). */
  priceYearlyMonthly: number
  billing: 'free' | 'recurring' | 'one-time'
  features: PlanFeature[]
  /** Monthly AI credits included. */
  aiCredits: number
  /** API requests/hour included. */
  apiRateLimit: number
  maxWorkspaces: number
  maxMembers: number
  /** Whether plan supports team/organization features. */
  teams: boolean
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free', name: 'Free', priceMonthly: 0, priceYearlyMonthly: 0, billing: 'free',
    features: [{ key: 'tools.basic', label: 'Access to 2,500+ tools' }, { key: 'ai.credits', label: '5 AI credits / month' }],
    aiCredits: 5, apiRateLimit: 60, maxWorkspaces: 1, maxMembers: 1, teams: false,
  },
  starter: {
    id: 'starter', name: 'Starter', priceMonthly: 9, priceYearlyMonthly: 7, billing: 'recurring',
    features: [{ key: 'tools.all', label: 'All tools + ad-free' }, { key: 'ai.credits', label: '100 AI credits / month' }, { key: 'export', label: 'Export & download' }],
    aiCredits: 100, apiRateLimit: 600, maxWorkspaces: 2, maxMembers: 1, teams: false,
  },
  pro: {
    id: 'pro', name: 'Pro', priceMonthly: 19, priceYearlyMonthly: 15, billing: 'recurring',
    features: [{ key: 'ai.credits', label: '1,000 AI credits / month' }, { key: 'api', label: 'API access + keys' }, { key: 'priority', label: 'Priority support' }],
    aiCredits: 1000, apiRateLimit: 3600, maxWorkspaces: 5, maxMembers: 1, teams: false,
  },
  business: {
    id: 'business', name: 'Business', priceMonthly: 49, priceYearlyMonthly: 39, billing: 'recurring',
    features: [{ key: 'teams', label: 'Teams (up to 10 members)' }, { key: 'api', label: 'Higher API limits' }, { key: 'analytics', label: 'Advanced analytics' }],
    aiCredits: 5000, apiRateLimit: 20000, maxWorkspaces: 10, maxMembers: 10, teams: true,
  },
  enterprise: {
    id: 'enterprise', name: 'Enterprise', priceMonthly: 199, priceYearlyMonthly: 159, billing: 'recurring',
    features: [{ key: 'teams', label: 'Unlimited teams' }, { key: 'sso', label: 'SSO + audit logs' }, { key: 'sla', label: 'SLA + dedicated support' }],
    aiCredits: 50000, apiRateLimit: 100000, maxWorkspaces: 100, maxMembers: 1000, teams: true,
  },
  lifetime: {
    id: 'lifetime', name: 'Lifetime', priceMonthly: 0, priceYearlyMonthly: 0, billing: 'one-time',
    features: [{ key: 'tools.all', label: 'All tools forever' }, { key: 'ai.credits', label: 'Credits never expire' }],
    aiCredits: 10000, apiRateLimit: 3600, maxWorkspaces: 5, maxMembers: 1, teams: false,
  },
}

export interface Entitlement {
  plan: Plan
  allowed: (featureKey: string) => boolean
  creditsRemaining: number
}

/** Check whether a plan includes a feature. */
export function planHasFeature(planId: PlanId, featureKey: string): boolean {
  return PLANS[planId].features.some(f => f.key === featureKey)
}

/** Build an entitlement check for a user with a plan + credit balance. */
export function entitlements(planId: PlanId, creditsRemaining: number): Entitlement {
  const plan = PLANS[planId]
  return {
    plan,
    allowed: (key) => planHasFeature(planId, key) || key === 'tools.basic',
    creditsRemaining,
  }
}

export const PLAN_LIST: Plan[] = Object.values(PLANS)