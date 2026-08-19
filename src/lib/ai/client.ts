/**
 * Secure AI client.
 *
 * The browser NEVER holds an LLM API key. Requests go to the Cloudflare Pages
 * Function at /api/ai (see functions/api/ai.ts), which keeps the key server-side
 * via the `AI_API_KEY` environment variable. If no key is configured the function
 * returns 501 and this client falls back to the deterministic local engine, so
 * every tool still works.
 */

import { logger } from '@/core/infrastructure/logging/logger'

let probed = false
let available = false

/** Returns true once we know an LLM is reachable (cached for the session). */
export function aiConfigured(): boolean {
  return probed && available
}

export interface GenerateOptions {
  system?: string
  user: string
  temperature?: number
  maxTokens?: number
  json?: boolean
}

/**
 * Asks the /api/ai proxy for an LLM completion. Returns the assistant text, or
 * `null` when the LLM is not configured or the call fails (caller falls back).
 */
export async function generateText(opts: GenerateOptions): Promise<string | null> {
  // If we already know there's no key, skip the network round trip.
  if (probed && !available) return null

  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: opts.system,
        user: opts.user,
        temperature: opts.temperature,
        maxTokens: opts.maxTokens,
        json: opts.json,
      }),
    })

    probed = true
    if (res.status === 501 || res.status === 404) {
      // No API key configured on the server — use the local engine for the session.
      available = false
      return null
    }
    if (!res.ok) {
      logger.warn('[ai] proxy error', { status: res.status })
      available = true // configured, but this call failed
      return null
    }

    const data = await res.json()
    if (data?.ok && typeof data.output === 'string' && data.output.trim()) {
      available = true
      return data.output.trim()
    }
    available = true
    return null
  } catch (err) {
    logger.error('[ai] request failed', { message: err instanceof Error ? err.message : String(err) })
    return null
  }
}