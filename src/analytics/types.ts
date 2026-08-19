/**
 * Analytics — shared types.
 * Strongly-typed event payloads and provider contracts. No `any`.
 */

export type AnalyticsProviderId = 'ga4' | 'clarity' | 'cloudflare' | 'plausible' | 'posthog' | 'mixpanel' | 'none'

export interface AnalyticsConfig {
  enabled: boolean
  provider: AnalyticsProviderId
  /** GA4 measurement id (only read for the 'ga4' provider). */
  gaMeasurementId?: string
}

/** Base event params — only anonymous, non-sensitive data is allowed. */
export interface BaseEventParams {
  [key: string]: string | number | boolean | undefined
}

/** Page view. */
export interface PageViewParams extends BaseEventParams {
  page_path: string
}

export interface ToolEventParams extends BaseEventParams {
  tool: string
  category?: string
  source?: 'csv' | 'ai'
  /** Elapsed ms when applicable (tool run/completed). */
  durationMs?: number
  /** Whether the tool call succeeded. */
  success?: boolean
  mode?: 'ai' | 'local'
}

export interface SearchEventParams extends BaseEventParams {
  query: string
  /** 'submit' | 'suggestion_click' | 'category_filter' | 'no_results'. */
  action: 'submit' | 'suggestion_click' | 'category_filter' | 'no_results'
  category?: string
}

export interface DownloadEventParams extends BaseEventParams {
  tool?: string
  fileType?: string
}

export interface ErrorEventParams extends BaseEventParams {
  message: string
  /** Where the error originated: 'runtime' | 'api' | 'promise' | 'boundary'. */
  origin: 'runtime' | 'api' | 'promise' | 'boundary'
  /** Stripped stack trace (no URLs/keys). */
  stack?: string
}

export interface PurchaseEventParams extends BaseEventParams {
  plan?: string
  value?: number
  currency?: string
}

/**
 * Provider contract. Implement this to add any analytics backend without
 * touching application code.
 */
export interface AnalyticsProvider {
  readonly id: AnalyticsProviderId
  /** Whether the provider is configured and should load. */
  enabled(): boolean
  /** Load the provider's script (must be lazy + non-blocking). */
  init(): void
  /** Send a named event with anonymous params. */
  track(event: string, params?: BaseEventParams): void
}
