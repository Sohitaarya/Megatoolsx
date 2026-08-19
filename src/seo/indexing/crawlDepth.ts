/**
 * Crawl Efficiency — URL classification + depth model.
 * Model: Home(0) → static(1) → Category/Collection/AI/Blog(2) → Tool(2).
 * Depth is the shortest internal-link path from the homepage.
 */

export type UrlIndexClass = 'INDEX' | 'NOINDEX' | 'EXCLUDED' | 'REDIRECT' | 'ERROR'

export interface UrlClassEntry {
  url: string
  type: string
  depth: number
  indexClass: UrlIndexClass
}

/** Classify a URL into an indexability class (static model, no live HTTP). */
export function classifyUrlStatus(path: string): UrlIndexClass {
  if (/^\/tools\//.test(path)) return 'INDEX'
  if (/^\/category\//.test(path) || /^\/collections/.test(path) || /^\/blog/.test(path) || /^\/ai-tools/.test(path)) return 'INDEX'
  if (['/', '/tools', '/ai-tools', '/categories', '/collections', '/about', '/contact', '/privacy', '/terms', '/blog', '/trending', '/new-tools', '/popular'].includes(path)) return 'INDEX'
  if (/\?q=|&sort=|&filter=|&page=/.test(path)) return 'NOINDEX' // search/filter combos are not landing pages
  if (/^\/admin|\/my-tools|\/compare/.test(path)) return 'NOINDEX'
  return 'EXCLUDED'
}

/** Shortest-path depth from the homepage for a route path. */
export function crawlDepth(path: string): number {
  if (path === '/') return 0
  if (path === '/tools' || path === '/categories' || path === '/collections' || path === '/blog' || path === '/ai-tools') return 1
  if (/^\/category\//.test(path) || /^\/collections\//.test(path) || /^\/blog\//.test(path) || /^\/ai-tools\//.test(path)) return 2
  if (/^\/tools\//.test(path)) return 2
  return 3
}

/** Summarize depth distribution over a set of URLs. */
export function depthDistribution(urls: string[]): { d0: number; d1: number; d2: number; d3: number; d4Plus: number; max: number } {
  const out = { d0: 0, d1: 0, d2: 0, d3: 0, d4Plus: 0, max: 0 }
  for (const u of urls) {
    const d = crawlDepth(u)
    out.max = Math.max(out.max, d)
    if (d <= 0) out.d0++
    else if (d === 1) out.d1++
    else if (d === 2) out.d2++
    else if (d === 3) out.d3++
    else out.d4Plus++
  }
  return out
}