/**
 * Analytics — public surface.
 *
 * Usage:
 *   import { initAnalytics, PageTracker, useAnalytics } from '@/analytics'
 *   initAnalytics()                      // once at app start (config-driven)
 *   <PageTracker />                      // inside the router — auto page_view
 *   const { trackToolOpen } = useAnalytics()
 *
 * Env config: VITE_ANALYTICS_ENABLED, VITE_ANALYTICS_PROVIDER, VITE_GA_MEASUREMENT_ID.
 * Disabled ⇒ NoopProvider ⇒ no script loads, no events fire.
 */

import { resolveConfig, providerRegistry, NoopProvider } from './provider'
import { ga4Provider } from './ga4'
import { useAnalytics, analyticsApi, PageTracker, initErrorTracking } from './hooks'
import { events, sanitizeParams, EVENT } from './events'
import type {
  AnalyticsConfig, AnalyticsProvider, AnalyticsProviderId, BaseEventParams,
  PageViewParams, ToolEventParams, SearchEventParams, DownloadEventParams, ErrorEventParams, PurchaseEventParams,
} from './types'

// Register the built-in providers. Future providers implement AnalyticsProvider
// and are registered here without touching application code.
providerRegistry.register(ga4Provider)

/** Lazily initialize the active analytics provider from the environment. */
export function initAnalytics(): void {
  const config = resolveConfig()
  ga4Provider.configure(config)
  const active = providerRegistry.activate(config)
  if (active.enabled()) active.init()
  // Capture runtime errors after the provider is ready.
  initErrorTracking()
}

export { useAnalytics, analyticsApi, PageTracker, initErrorTracking, events, sanitizeParams, EVENT, NoopProvider, providerRegistry }
export type {
  AnalyticsConfig, AnalyticsProvider, AnalyticsProviderId, BaseEventParams,
  PageViewParams, ToolEventParams, SearchEventParams, DownloadEventParams, ErrorEventParams, PurchaseEventParams,
}
