/**
 * Analytics — typed event builders.
 * Centralizes event naming and enforces the privacy rule: only anonymous,
 * non-sensitive params may be sent. Values that could contain personal data are
 * truncated/redacted before they reach a provider.
 */

import type {
  BaseEventParams, DownloadEventParams, ErrorEventParams, PageViewParams,
  PurchaseEventParams, SearchEventParams, ToolEventParams,
} from './types'

export const EVENT = {
  pageView: 'page_view',
  search: 'search',
  toolOpen: 'tool_open',
  toolRun: 'tool_run',
  toolComplete: 'tool_complete',
  toolFailed: 'tool_failed',
  download: 'download',
  copy: 'copy',
  share: 'share',
  login: 'login',
  signup: 'signup',
  purchase: 'purchase',
  workflow: 'workflow',
  error: 'error',
} as const

const MAX_STRING = 120

/** Sanitize a single value: keep scalars, truncate strings, drop objects/undefined. */
function sanitizeValue(value: string | number | boolean | undefined): string | number | boolean | undefined {
  if (typeof value === 'string') {
    const trimmed = value.replace(/[\r\n\t]+/g, ' ').trim()
    return trimmed.length > MAX_STRING ? trimmed.slice(0, MAX_STRING) + '…' : trimmed
  }
  return value
}

/** Build a safe param bag from a typed payload (drops undefined + sensitive keys). */
export function sanitizeParams<P extends BaseEventParams>(params: P | undefined): BaseEventParams | undefined {
  if (!params) return undefined
  const blocked = new Set(['password', 'token', 'secret', 'api_key', 'authorization', 'email', 'phone'])
  const out: BaseEventParams = {}
  for (const [k, v] of Object.entries(params)) {
    if (blocked.has(k)) continue
    const safe = sanitizeValue(v as string | number | boolean | undefined)
    if (safe !== undefined) out[k] = safe
  }
  return Object.keys(out).length ? out : undefined
}

export const events = {
  pageView: (p: PageViewParams) => ({ name: EVENT.pageView, params: sanitizeParams(p) }),
  search: (p: SearchEventParams) => ({ name: EVENT.search, params: sanitizeParams(p) }),
  toolOpen: (p: ToolEventParams) => ({ name: EVENT.toolOpen, params: sanitizeParams(p) }),
  toolRun: (p: ToolEventParams) => ({ name: EVENT.toolRun, params: sanitizeParams(p) }),
  toolComplete: (p: ToolEventParams) => ({ name: EVENT.toolComplete, params: sanitizeParams(p) }),
  toolFailed: (p: ToolEventParams) => ({ name: EVENT.toolFailed, params: sanitizeParams(p) }),
  download: (p?: DownloadEventParams) => ({ name: EVENT.download, params: sanitizeParams(p) }),
  copy: (p?: { tool?: string; target?: string }) => ({ name: EVENT.copy, params: sanitizeParams(p) }),
  share: (p?: { tool?: string; platform?: string }) => ({ name: EVENT.share, params: sanitizeParams(p) }),
  login: (p?: { method?: string }) => ({ name: EVENT.login, params: sanitizeParams(p) }),
  signup: (p?: { method?: string }) => ({ name: EVENT.signup, params: sanitizeParams(p) }),
  purchase: (p?: PurchaseEventParams) => ({ name: EVENT.purchase, params: sanitizeParams(p) }),
  workflow: (p?: { workflow?: string; status?: string }) => ({ name: EVENT.workflow, params: sanitizeParams(p) }),
  error: (p: ErrorEventParams) => ({ name: EVENT.error, params: sanitizeParams(p) }),
}