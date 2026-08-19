/**
 * SEO Monitoring — Core Web Vitals / RUM (browser, privacy-conscious).
 * Samples a small % of visitors, observes LCP/CLS/INP/FCP/TTFB, and sends only
 * metric values + route via the existing analytics layer. Never collects PII,
 * full queries, tokens, or page contents.
 */

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { clientConfig } from './config'
import { analyticsApi } from '@/analytics'
import type { CwvSample } from './types'

interface MetricEntry { name: string; value: number }

function observe(name: string, callback: (m: MetricEntry) => void): void {
  try {
    const type = name === 'CLS' ? 'layout-shift' : name === 'INP' ? 'event' : 'largest-contentful-paint'
    const po = new PerformanceObserver(list => {
      for (const e of list.getEntries()) {
        const entry = e as PerformanceEntry & { startTime: number; value?: number; hadRecentInput?: boolean }
        if (name === 'CLS' && entry.hadRecentInput) continue
        callback({ name, value: name === 'CLS' ? entry.value ?? 0 : entry.startTime })
      }
    })
    po.observe({ type, buffered: true })
  } catch { /* observer unsupported — skip */ }
}

function measureNavigation(): { fcp?: number; ttfb?: number } {
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
  const fcp = performance.getEntriesByName('first-contentful-paint')[0]
  return {
    fcp: fcp ? (fcp as PerformanceEntry).startTime : undefined,
    ttfb: nav ? nav.responseStart : undefined,
  }
}

/** Mount once per page to sample + report Core Web Vitals. No-op when disabled. */
export function useReportWebVitals(): void {
  const { pathname } = useLocation()
  useEffect(() => {
    const cfg = clientConfig()
    if (!cfg.rum.enabled) return
    // Sample rate (e.g. 0.1 = 10%) — never send for every visitor.
    if (Math.random() > cfg.rum.sampleRate) return
    if (navigator.doNotTrack === '1' || navigator.doNotTrack === 'true') return // respect DNT

    const metrics: Partial<CwvSample> = {}
    const report = () => {
      const nav = measureNavigation()
      const sample: CwvSample = {
        route: pathname,
        lcp: metrics.lcp, cls: metrics.cls, inp: metrics.inp,
        fcp: nav.fcp ?? metrics.fcp, ttfb: nav.ttfb,
        deviceClass: window.innerWidth < 768 ? 'mobile' : 'desktop',
      }
      // Only scalar metric values + route — never content.
      analyticsApi.trackEvent('web_vital', {
        route: pathname.slice(0, 80),
        lcp: sample.lcp, cls: sample.cls, inp: sample.inp, fcp: sample.fcp, ttfb: sample.ttfb,
        deviceClass: sample.deviceClass,
      })
    }
    observe('LCP', m => { metrics.lcp = Math.round(m.value) })
    observe('CLS', m => { metrics.cls = Math.round(m.value * 1000) / 1000 })
    observe('INP', m => { metrics.inp = Math.round(m.value) })

    const t = window.setTimeout(report, 5000)
    return () => window.clearTimeout(t)
  }, [pathname])
}