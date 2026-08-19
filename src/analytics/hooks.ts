/**
 * Analytics — React hooks + global error tracking.
 *
 * useAnalytics() exposes typed trackers that are no-ops when the active provider
 * is disabled. PageTracker sends page_view on route changes (deduped). Error
 * listeners capture runtime errors and unhandled rejections.
 */

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { providerRegistry } from './provider'
import { events } from './events'
import type {
  DownloadEventParams, ErrorEventParams, PageViewParams, PurchaseEventParams, SearchEventParams, ToolEventParams,
} from './types'

const noopProviderId = 'none'

function send(name: string, params?: Record<string, string | number | boolean | undefined>): void {
  const provider = providerRegistry.activeProvider
  if (provider.id === noopProviderId) return
  provider.track(name, params)
}

export interface AnalyticsApi {
  trackPageView(path?: string): void
  trackEvent(name: string, params?: Record<string, string | number | boolean | undefined>): void
  trackSearch(p: SearchEventParams): void
  trackToolOpen(p: ToolEventParams): void
  trackToolRun(p: ToolEventParams): void
  trackToolComplete(p: ToolEventParams): void
  trackToolFailed(p: ToolEventParams): void
  trackDownload(p?: DownloadEventParams): void
  trackCopy(p?: { tool?: string; target?: string }): void
  trackShare(p?: { tool?: string; platform?: string }): void
  trackLogin(p?: { method?: string }): void
  trackSignup(p?: { method?: string }): void
  trackPurchase(p?: PurchaseEventParams): void
  trackWorkflow(p?: { workflow?: string; status?: string }): void
  trackError(p: ErrorEventParams): void
}

/** Typed analytics API (stable identity so it can be used in deps arrays). */
export const analyticsApi: AnalyticsApi = {
  trackPageView: (path?: string) => {
    const e = events.pageView({ page_path: path ?? window.location.pathname })
    send(e.name, e.params)
  },
  trackEvent: (name, params) => send(name, params),
  trackSearch: (p) => { const e = events.search(p); send(e.name, e.params) },
  trackToolOpen: (p) => { const e = events.toolOpen(p); send(e.name, e.params) },
  trackToolRun: (p) => { const e = events.toolRun(p); send(e.name, e.params) },
  trackToolComplete: (p) => { const e = events.toolComplete(p); send(e.name, e.params) },
  trackToolFailed: (p) => { const e = events.toolFailed(p); send(e.name, e.params) },
  trackDownload: (p) => { const e = events.download(p); send(e.name, e.params) },
  trackCopy: (p) => { const e = events.copy(p); send(e.name, e.params) },
  trackShare: (p) => { const e = events.share(p); send(e.name, e.params) },
  trackLogin: (p) => { const e = events.login(p); send(e.name, e.params) },
  trackSignup: (p) => { const e = events.signup(p); send(e.name, e.params) },
  trackPurchase: (p) => { const e = events.purchase(p); send(e.name, e.params) },
  trackWorkflow: (p) => { const e = events.workflow(p); send(e.name, e.params) },
  trackError: (p) => { const e = events.error(p); send(e.name, e.params) },
}

/** Hook returning the stable analytics API. */
export function useAnalytics(): AnalyticsApi {
  return analyticsApi
}

/** Auto page tracking on every route change — deduped (no duplicate events). */
export function PageTracker(): null {
  const { pathname, search } = useLocation()
  const key = pathname + search

  useEffect(() => {
    analyticsApi.trackPageView(key)
  }, [key])

  return null
}

let errorTrackingDone = false

/** Register global runtime-error + unhandled-rejection listeners (once). */
export function initErrorTracking(): void {
  if (typeof window === 'undefined' || errorTrackingDone) return
  errorTrackingDone = true

  window.addEventListener('error', (event: ErrorEvent) => {
    analyticsApi.trackError({
      message: event.message || 'Unknown runtime error',
      origin: 'runtime',
      stack: event.error?.stack ? String(event.error.stack).slice(0, 500) : undefined,
    })
  })

  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const reason = event.reason as Error | unknown
    analyticsApi.trackError({
      message: reason instanceof Error ? reason.message : 'Unhandled promise rejection',
      origin: 'promise',
    })
  })
}