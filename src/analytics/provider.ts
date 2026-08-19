/**
 * Analytics — provider registry + configuration resolution.
 *
 * Configuration is entirely env-driven:
 *   VITE_ANALYTICS_ENABLED=true|false
 *   VITE_ANALYTICS_PROVIDER=ga4|clarity|cloudflare|plausible|posthog|mixpanel|none
 *   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
 *
 * When disabled (or no provider configured) a NoopProvider is used: no script
 * loads, no events fire, and all calls are cheap no-ops.
 */

import type { AnalyticsConfig, AnalyticsProvider, AnalyticsProviderId } from './types'

/** Resolve config from the environment (Vite inlines at build time). */
export function resolveConfig(): AnalyticsConfig {
  const providerRaw = (import.meta.env.VITE_ANALYTICS_PROVIDER as AnalyticsProviderId | undefined) ?? 'ga4'
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined
  const explicitEnabled = import.meta.env.VITE_ANALYTICS_ENABLED as string | undefined

  // Enabled by default only when a provider + (for ga4) an id are present.
  const configured = providerRaw !== 'none' && (providerRaw !== 'ga4' || Boolean(gaId))
  const enabled = explicitEnabled !== undefined ? explicitEnabled !== 'false' : configured

  return { enabled, provider: providerRaw, gaMeasurementId: gaId }
}

/** No-op provider used when analytics is disabled or unconfigured. */
export class NoopProvider implements AnalyticsProvider {
  readonly id: AnalyticsProviderId = 'none'
  enabled(): boolean { return false }
  init(): void { /* intentionally nothing */ }
  track(): void { /* intentionally nothing */ }
}

class ProviderRegistry {
  private providers = new Map<AnalyticsProviderId, AnalyticsProvider>()
  private active: AnalyticsProvider = new NoopProvider()

  register(provider: AnalyticsProvider): void {
    this.providers.set(provider.id, provider)
  }

  /** Activate the provider matching the config; returns the active provider. */
  activate(config: AnalyticsConfig): AnalyticsProvider {
    if (!config.enabled) {
      this.active = new NoopProvider()
      return this.active
    }
    const candidate = this.providers.get(config.provider) ?? new NoopProvider()
    this.active = candidate.enabled() ? candidate : new NoopProvider()
    return this.active
  }

  get activeProvider(): AnalyticsProvider { return this.active }
}

export const providerRegistry = new ProviderRegistry()