/**
 * SEO Monitoring — configuration.
 * All external credentials are SERVER-SIDE only (process.env, never VITE_*).
 * When a feature is disabled or unconfigured it safely uses a Noop provider.
 */

export interface SeoMonitoringConfig {
  enabled: boolean
  searchConsole: { enabled: boolean; siteUrl: string }
  cloudflare: { enabled: boolean }
  rum: { enabled: boolean; sampleRate: number }
  siteUrl: string
  alertThresholds: {
    indexedDropPercent: number
    impressionsDropPercent: number
    ctrDropPercent: number
    cwvLcpMs: number
    cwvInpMs: number
  }
  opportunityMinImpressions: number
  lowCtrThreshold: number
  maxGscPages: number
  maxGscRows: number
  allowedOrigin?: string
  monitorCronEnabled: boolean
}

/** Server-side config (used by the CLI and any server endpoint). */
export function serverConfig(env: NodeJS.ProcessEnv = process.env): SeoMonitoringConfig {
  return {
    enabled: env.SEO_MONITORING_ENABLED !== 'false',
    searchConsole: {
      enabled: env.GOOGLE_SEARCH_CONSOLE_ENABLED === 'true',
      siteUrl: env.GOOGLE_SEARCH_CONSOLE_SITE_URL || 'https://megatoolsx.com/',
    },
    cloudflare: { enabled: env.CLOUDFLARE_ANALYTICS_ENABLED === 'true' },
    rum: { enabled: env.RUM_ENABLED === 'true', sampleRate: Number(env.VITE_RUM_SAMPLE_RATE ?? 0.1) || 0.1 },
    siteUrl: env.VITE_SITE_URL || 'https://megatoolsx.com',
    alertThresholds: {
      indexedDropPercent: Number(env.SEO_ALERT_INDEXED_DROP_PERCENT ?? 20),
      impressionsDropPercent: Number(env.SEO_ALERT_IMPRESSIONS_DROP_PERCENT ?? 20),
      ctrDropPercent: Number(env.SEO_ALERT_CTR_DROP_PERCENT ?? 20),
      cwvLcpMs: Number(env.SEO_ALERT_LCP_MS ?? 2500),
      cwvInpMs: Number(env.SEO_ALERT_INP_MS ?? 200),
    },
    opportunityMinImpressions: Number(env.SEO_OPPORTUNITY_MIN_IMPRESSIONS ?? 100),
    lowCtrThreshold: Number(env.SEO_LOW_CTR_THRESHOLD ?? 0.03),
    maxGscPages: Number(env.SEO_MAX_GSC_PAGES ?? 20),
    maxGscRows: Number(env.SEO_MAX_GSC_ROWS ?? 100000),
    allowedOrigin: env.SEO_ALLOWED_ORIGIN,
    monitorCronEnabled: env.SEO_MONITOR_CRON_ENABLED !== 'false',
  }
}

/** Client-safe config (only non-secret values; never VITE_GOOGLE_*). */
export function clientConfig(): Pick<SeoMonitoringConfig, 'rum' | 'siteUrl'> {
  return {
    rum: { enabled: import.meta.env.VITE_RUM_ENABLED === 'true', sampleRate: Number(import.meta.env.VITE_RUM_SAMPLE_RATE ?? 0.1) || 0.1 },
    siteUrl: import.meta.env.VITE_SITE_URL || 'https://megatoolsx.com',
  }
}

/** True when Google service credentials are present server-side. */
export function hasSearchConsoleCredentials(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS || env.GOOGLE_SEARCH_CONSOLE_CREDENTIALS || env.GOOGLE_ACCESS_TOKEN)
}

import type { SearchConsoleStatus } from './types'

export interface ConfigHealth {
  monitoring: 'enabled' | 'disabled'
  searchConsole: SearchConsoleStatus
  history: 'available' | 'not_configured'
  rum: 'enabled' | 'disabled'
}

/** Validate config and report provider states clearly — never crashes. */
export function validateMonitoringConfig(env: NodeJS.ProcessEnv = process.env): ConfigHealth {
  const scStatus = hasSearchConsoleCredentials(env) ? 'CONNECTED' : 'NOT_CONFIGURED'
  return {
    monitoring: env.SEO_MONITORING_ENABLED === 'false' ? 'disabled' : 'enabled',
    searchConsole: scStatus,
    history: env.SEO_HISTORY_PROVIDER === 'kv' || env.SEO_HISTORY_PROVIDER === 'd1' ? 'available' : 'not_configured',
    rum: env.RUM_ENABLED === 'true' ? 'enabled' : 'disabled',
  }
}

/** Resolve the GSC property URL (supports URL-prefix and domain properties). */
export function resolveGscProperty(env: NodeJS.ProcessEnv = process.env): string {
  return env.SEO_GSC_PROPERTY || env.GOOGLE_SEARCH_CONSOLE_SITE_URL || env.GOOGLE_SEARCH_CONSOLE_SITE || 'https://megatoolsx.com/'
}

export interface GscConnectionResult {
  status: SearchConsoleStatus
  property: string
  checkedAt: string
  latencyMs: number
  rowsReceived: number
  errorCode?: string
  safeMessage: string
}

export async function verifyGscConnection(env: NodeJS.ProcessEnv = process.env): Promise<GscConnectionResult> {
  const property = resolveGscProperty(env)
  const checkedAt = new Date().toISOString()
  const start = Date.now()

  if (!hasSearchConsoleCredentials(env)) {
    return {
      status: 'NOT_CONFIGURED',
      property,
      checkedAt,
      latencyMs: Date.now() - start,
      rowsReceived: 0,
      safeMessage: 'Search Console credentials are not configured. Set GOOGLE_SERVICE_ACCOUNT_CREDENTIALS or GOOGLE_ACCESS_TOKEN.',
    }
  }

  try {
    const { buildSearchConsoleReport } = await import('./searchConsole')
    const report = await buildSearchConsoleReport(env, { days: 7 })
    const latencyMs = Date.now() - start

    if (report.performance.status === 'available' && report.performance.data) {
      return {
        status: 'CONNECTED',
        property,
        checkedAt,
        latencyMs,
        rowsReceived: report.performance.data.rows.length,
        safeMessage: `Connected. Fetched ${report.performance.data.rows.length} rows from ${property}.`,
      }
    }

    const errorCode = report.performance.status === 'error' ? report.performance.message : undefined
    return {
      status: report.performance.status === 'not_configured' ? 'NOT_CONFIGURED' : report.performance.status === 'unavailable' ? 'UNAVAILABLE' : 'ERROR',
      property,
      checkedAt,
      latencyMs,
      rowsReceived: 0,
      errorCode,
      safeMessage: errorCode ? `Search Console returned ${errorCode}. Check credentials and property permissions.` : 'Search Console returned no data.',
    }
  } catch (err) {
    const latencyMs = Date.now() - start
    const message = err instanceof Error ? err.message : 'unknown_error'
    const status = message.includes('401') ? 'UNAUTHORIZED' : message.includes('403') ? 'FORBIDDEN' : message.includes('429') ? 'RATE_LIMITED' : message.includes('404') ? 'INVALID_PROPERTY' : message.includes('network') || message.includes('timeout') ? 'NETWORK_ERROR' : 'UNKNOWN_ERROR'
    return {
      status,
      property,
      checkedAt,
      latencyMs,
      rowsReceived: 0,
      errorCode: status,
      safeMessage: `Search Console connection failed: ${status}. ${message}`,
    }
  }
}