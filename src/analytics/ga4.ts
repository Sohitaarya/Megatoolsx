/**
 * Analytics — Google Analytics 4 provider.
 *
 * Lazily injects the gtag script only when enabled and a measurement id exists.
 * All tracking is anonymous; nothing personal is ever sent.
 */

import type { AnalyticsConfig, AnalyticsProvider, BaseEventParams } from './types'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export class Ga4Provider implements AnalyticsProvider {
  readonly id = 'ga4' as const
  private measurementId: string | undefined
  private loaded = false

  configure(config: AnalyticsConfig): void {
    this.measurementId = config.gaMeasurementId
  }

  enabled(): boolean {
    return Boolean(this.measurementId)
  }

  /** Load the gtag script once. Non-blocking; never called when disabled. */
  init(): void {
    if (!this.measurementId || this.loaded) return
    this.loaded = true
    window.dataLayer = window.dataLayer || []
    window.gtag = (...args: unknown[]) => window.dataLayer?.push(args)
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(this.measurementId)}`
    document.head.appendChild(script)
    window.gtag?.('js', new Date())
    window.gtag?.('config', this.measurementId)
  }

  track(event: string, params?: BaseEventParams): void {
    if (!this.loaded) return
    window.gtag?.('event', event, params ?? {})
  }
}

export const ga4Provider = new Ga4Provider()