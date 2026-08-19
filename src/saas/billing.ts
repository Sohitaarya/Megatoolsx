/**
 * SaaS — Billing provider abstraction.
 *
 * The app depends on the BillingProvider interface, NOT on a payment vendor.
 * Live providers (Stripe / Razorpay / PayPal / UPI) are plug-ins configured
 * server-side (Cloudflare Pages Functions + secrets) and registered here. The
 * SandboxProvider is a REAL local implementation for development and tests — it
 * records invoices and grants entitlements without moving money. No provider is
 * hardcoded into business logic.
 */

import type { PlanId } from './plans'

export interface CheckoutRequest {
  planId: PlanId
  userId: string
  interval: 'month' | 'year' | 'once'
  couponCode?: string
  successUrl: string
  cancelUrl: string
}

export interface CheckoutResult {
  provider: string
  /** Redirect the user to this URL to complete payment (sandbox: fake URL). */
  checkoutUrl: string
  checkoutId: string
}

export interface Invoice {
  id: string
  provider: string
  userId: string
  planId: PlanId
  amount: number
  currency: string
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  createdAt: string
  /** Line item breakdown (for GST/VAT display). */
  breakdown: { label: string; amount: number }[]
}

export interface Coupon {
  code: string
  percentOff: number
  expiresAt?: string
  maxUses?: number
  used: number
}

export interface BillingProvider {
  id: 'stripe' | 'razorpay' | 'paypal' | 'upi' | 'sandbox'
  enabled(): boolean
  createCheckout(req: CheckoutRequest): Promise<CheckoutResult>
  getInvoice(id: string): Promise<Invoice | null>
  refund(invoiceId: string): Promise<Invoice>
}

/* ─── Coupon catalog (config-driven) ─────────────────────────────── */

export const COUPONS: Record<string, Coupon> = {
  WELCOME10: { code: 'WELCOME10', percentOff: 10, used: 0 },
  LAUNCH50: { code: 'LAUNCH50', percentOff: 50, used: 0 },
}

export function applyCoupon(amount: number, code?: string): { final: number; discount: number } {
  if (!code) return { final: amount, discount: 0 }
  const coupon = COUPONS[code.toUpperCase()]
  if (!coupon || (coupon.expiresAt && coupon.expiresAt < new Date().toISOString())) return { final: amount, discount: 0 }
  const discount = Math.round(amount * (coupon.percentOff / 100) * 100) / 100
  return { final: Math.max(0, amount - discount), discount }
}

/** Add GST to a net amount (configurable rate, India 18% default). */
export function withGst(net: number, rate = 18): { gst: number; total: number } {
  const gst = Math.round(net * (rate / 100) * 100) / 100
  return { gst, total: Math.round((net + gst) * 100) / 100 }
}

/* ─── Sandbox provider (real logic, no real charge) ─────────────── */

export class SandboxBillingProvider implements BillingProvider {
  id = 'sandbox' as const
  private invoices = new Map<string, Invoice>()

  enabled(): boolean { return true }

  async createCheckout(req: CheckoutRequest): Promise<CheckoutResult> {
    const net = NET_BY_PLAN[req.planId] ?? 0
    const { final } = applyCoupon(net, req.couponCode)
    const { gst, total } = withGst(final)
    const id = `sandbox_${crypto.randomUUID().slice(0, 8)}`
    const invoice: Invoice = {
      id, provider: 'sandbox', userId: req.userId, planId: req.planId,
      amount: total, currency: 'USD', status: 'paid', createdAt: new Date().toISOString(),
      breakdown: [
        { label: `${req.planId} (${req.interval})`, amount: final },
        { label: 'GST 18%', amount: gst },
      ],
    }
    this.invoices.set(id, invoice)
    return { provider: 'sandbox', checkoutUrl: `${req.successUrl}?sandbox_checkout=${id}`, checkoutId: id }
  }

  async getInvoice(id: string): Promise<Invoice | null> { return this.invoices.get(id) ?? null }

  async refund(invoiceId: string): Promise<Invoice> {
    const inv = this.invoices.get(invoiceId)
    if (!inv) throw new Error(`Invoice not found: ${invoiceId}`)
    inv.status = 'refunded'
    return inv
  }
}

const NET_BY_PLAN: Record<PlanId, number> = { free: 0, starter: 9, pro: 19, business: 49, enterprise: 199, lifetime: 99 }

/** Register a live provider (called from server wiring when a key is present). */
export function registerBillingProvider(p: BillingProvider): void {
  billingRegistry.set(p.id, p)
}

const billingRegistry = new Map<string, BillingProvider>()

/** Default registry — sandbox is always available; live providers plug in. */
export function getBillingProvider(id: BillingProvider['id'] = 'sandbox'): BillingProvider {
  const provider = billingRegistry.get(id) ?? billingRegistry.get('sandbox')
  if (provider) return provider
  const sandbox = new SandboxBillingProvider()
  billingRegistry.set('sandbox', sandbox)
  return sandbox
}

export const sandboxBilling = new SandboxBillingProvider()