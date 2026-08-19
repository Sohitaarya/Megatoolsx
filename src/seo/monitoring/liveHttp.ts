/**
 * SEO Monitoring — live HTTP check (SERVER-SIDE).
 * Checks representative URLs against the deployed domain. Never runs in the
 * browser render path.
 */

import type { HttpResult } from './types'

export const REPRESENTATIVE_URLS = [
  '/', '/tools', '/category/design-creative', '/collections', '/tools/generative-heal-detector', '/sitemap.xml', '/robots.txt',
]

export async function checkUrl(base: string, path: string): Promise<HttpResult> {
  const start = Date.now()
  const redirectChain: string[] = []
  let finalUrl = `${base}${path}`
  try {
    const res = await fetch(finalUrl, { redirect: 'manual' })
    const status = res.status
    const contentType = res.headers.get('content-type') ?? undefined
    redirectChain.push(`${finalUrl} → ${status}`)
    return { url: finalUrl, status, contentType, responseMs: Date.now() - start, redirectChain, finalUrl }
  } catch {
    return { url: finalUrl, status: 0, responseMs: Date.now() - start, redirectChain, finalUrl }
  }
}

export async function runLiveHttpCheck(base: string, paths: string[] = REPRESENTATIVE_URLS): Promise<HttpResult[]> {
  const out: HttpResult[] = []
  for (const p of paths) {
    try { out.push(await checkUrl(base, p)) } catch { /* skip individual failures */ }
  }
  return out
}

export function summarizeHttp(results: HttpResult[]): { s200: number; s3xx: number; s4xx: number; s5xx: number; slow: string[] } {
  const s = { s200: 0, s3xx: 0, s4xx: 0, s5xx: 0, slow: [] as string[] }
  for (const r of results) {
    if (r.status >= 200 && r.status < 300) s.s200++
    else if (r.status >= 300 && r.status < 400) s.s3xx++
    else if (r.status >= 400 && r.status < 500) s.s4xx++
    else if (r.status >= 500) s.s5xx++
    if (r.responseMs > 1000) s.slow.push(r.url)
  }
  return s
}