/**
 * SaaS — public surface.
 */
export { PLANS, PLAN_LIST, planHasFeature, entitlements } from './plans'
export type { Plan, PlanId, PlanFeature, Entitlement } from './plans'
export { hasPermission, guardFor, highestRole, ROLE_LIST } from './rbac'
export type { Role, Permission } from './rbac'
export { CreditsLedger, creditsLedger, DEFAULT_ALLOWANCE } from './credits'
export type { CreditKind, CreditEntry, CreditEntryType } from './credits'
export { SandboxBillingProvider, getBillingProvider, registerBillingProvider, applyCoupon, withGst, COUPONS } from './billing'
export type { BillingProvider, CheckoutRequest, CheckoutResult, Invoice, Coupon } from './billing'
export { RateLimiter, MemoryRateStore, perHourLimiter } from './rateLimit'
export type { RateStore } from './rateLimit'
export { NotificationService, notificationService, inAppChannel } from './notifications'
export type { NotificationChannel, NotificationChannelAdapter, NotificationMessage } from './notifications'