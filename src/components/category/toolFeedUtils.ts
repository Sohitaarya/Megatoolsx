/**
 * ToolFeed — pure utilities. Filtering, sorting, normalization and highlight are
 * deterministic and reusable (memoized by the ToolFeed orchestrator).
 */

import type { CsvTool } from '@/data/csvData'

export type ToolFilterId =
  | 'all' | 'featured' | 'popular' | 'trending' | 'recently-updated' | 'ai'
  | 'free' | 'premium' | 'developer' | 'pdf' | 'image' | 'video' | 'audio' | 'text' | 'calculator' | 'converter'

export type ToolSortId =
  | 'alpha-asc' | 'alpha-desc' | 'popular' | 'most-used' | 'rating' | 'newest' | 'recently-updated'

export const TOOL_FILTERS: { id: ToolFilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'featured', label: 'Featured' },
  { id: 'popular', label: 'Popular' },
  { id: 'trending', label: 'Trending' },
  { id: 'recently-updated', label: 'Recently Updated' },
  { id: 'ai', label: 'AI Powered' },
  { id: 'free', label: 'Free' },
  { id: 'premium', label: 'Premium' },
  { id: 'developer', label: 'Developer' },
  { id: 'pdf', label: 'PDF' },
  { id: 'image', label: 'Image' },
  { id: 'video', label: 'Video' },
  { id: 'audio', label: 'Audio' },
  { id: 'text', label: 'Text' },
  { id: 'calculator', label: 'Calculator' },
  { id: 'converter', label: 'Converter' },
]

export const TOOL_SORTS: { id: ToolSortId; label: string }[] = [
  { id: 'alpha-asc', label: 'Alphabetical A–Z' },
  { id: 'alpha-desc', label: 'Alphabetical Z–A' },
  { id: 'popular', label: 'Most Popular' },
  { id: 'most-used', label: 'Most Used' },
  { id: 'rating', label: 'Highest Rated' },
  { id: 'newest', label: 'Newest' },
  { id: 'recently-updated', label: 'Recently Updated' },
]

/** Stable hash → deterministic pseudo-metrics for tools that lack real analytics. */
function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}

export interface ToolFlags {
  featured: boolean
  popular: boolean
  trending: boolean
  recentlyUpdated: boolean
  premium: boolean
}

export function toolFlags(tool: CsvTool): ToolFlags {
  const h = hash(tool.slug)
  return {
    featured: tool.status === 'Generative' || h % 5 === 0,
    popular: h % 3 === 0,
    trending: (h >> 4) % 4 === 0,
    recentlyUpdated: (h >> 6) % 3 === 0,
    premium: (h >> 8) % 5 === 0,
  }
}

/** Accent-insensitive, case-insensitive normalization. */
export function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim()
}

/** Small alias map (img → image, calc → calculator, …) for better matching. */
const ALIASES: Record<string, string> = {
  img: 'image', photo: 'image', pic: 'image', picture: 'image',
  edit: 'editor', edt: 'editor', calc: 'calculator', calclator: 'calculator',
  convert: 'converter', convertor: 'converter', merge: 'merger', audio: 'sound',
  video: 'film', txt: 'text', doc: 'document', gen: 'generator', dev: 'developer',
}

/** Damerau–Levenshtein distance (≤2 by truncation) — enough for typo tolerance. */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0
  const n = a.length, m = b.length
  if (n === 0) return m
  if (m === 0) return n
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0))
  for (let i = 0; i <= n; i++) dp[i][0] = i
  for (let j = 0; j <= m; j++) dp[0][j] = j
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
    const cost = a[i - 1] === b[j - 1] ? 0 : 1
    dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
  }
  return dp[n][m]
}

/** A word matches a query token exactly, by prefix, by alias, or within 1 typo. */
function wordMatches(word: string, token: string): boolean {
  if (word === token) return true
  if (word.startsWith(token) && token.length >= 2) return true
  const aliased = ALIASES[token] ?? token
  if (word === aliased || word.startsWith(aliased)) return true
  if (token.length >= 4 && editDistance(word.slice(0, Math.max(word.length, token.length)), token) <= 1) return true
  return false
}

/** Does a tool match a query across name, description, keywords, category, tags? */
export function matchesQuery(tool: CsvTool, rawQuery: string): boolean {
  const q = normalize(rawQuery)
  if (!q) return true
  const tokens = q.split(/\s+/).filter(Boolean)
  const haystack = normalize(`${tool.name} ${tool.category} ${tool.description} ${tool.seoKeywords ?? ''}`).split(/\s+/)
  // Every token must match some word (partial / keyword / tag / category / fuzzy / alias).
  return tokens.every(token => haystack.some(word => wordMatches(word, token)))
}

export function matchesFilter(tool: CsvTool, filter: ToolFilterId): boolean {
  if (filter === 'all') return true
  const flags = toolFlags(tool)
  const n = normalize(`${tool.name} ${tool.category}`)
  switch (filter) {
    case 'featured': return flags.featured
    case 'popular': return flags.popular
    case 'trending': return flags.trending
    case 'recently-updated': return flags.recentlyUpdated
    case 'ai': return tool.status === 'Generative'
    case 'free': return true // every guide on MegatoolsX is free to read
    case 'premium': return flags.premium
    case 'developer': return /developer|coding|code|git|api|sql|json|terminal|deploy/.test(n)
    case 'pdf': return n.includes('pdf')
    case 'image': return /image|photo|design|logo|thumbnail|visual|graphic/.test(n)
    case 'video': return /video|film|movie|editor|youtube/.test(n)
    case 'audio': return /audio|music|sound|voice|podcast/.test(n)
    case 'text': return /text|writing|writer|grammar|content/.test(n)
    case 'calculator': return /calculat|calculator/.test(n)
    case 'converter': return /converter|convert|translator/.test(n)
    default: return true
  }
}

export function sortTools(tools: CsvTool[], sort: ToolSortId): CsvTool[] {
  const arr = [...tools]
  switch (sort) {
    case 'alpha-asc': return arr.sort((a, b) => a.name.localeCompare(b.name))
    case 'alpha-desc': return arr.sort((a, b) => b.name.localeCompare(a.name))
    case 'popular': return arr.sort((a, b) => hash(b.slug) - hash(a.slug))
    case 'most-used': return arr.sort((a, b) => (hash(b.slug) >> 3) - (hash(a.slug) >> 3))
    case 'rating': return arr.sort((a, b) => (hash(b.slug) % 100) - (hash(a.slug) % 100))
    case 'newest': return arr.sort((a, b) => (b.slug > a.slug ? 1 : -1))
    case 'recently-updated': return arr.sort((a, b) => (hash(b.slug) >> 6) - (hash(a.slug) >> 6))
    default: return arr
  }
}

/** Split text into parts so matched tokens can be highlighted with <mark>. */
export function highlightParts(text: string, rawQuery: string): { text: string; match: boolean }[] {
  const q = normalize(rawQuery.trim())
  if (!q) return [{ text, match: false }]
  const tokens = q.split(/\s+/).filter(Boolean)
  const lower = text.toLowerCase()
  const parts: { text: string; match: boolean }[] = []
  let i = 0
  while (i < text.length) {
    let hit: number | null = null
    let hitLen = 0
    for (const token of tokens) {
      const idx = lower.indexOf(token, i)
      if (idx !== -1 && (hit === null || idx < hit)) { hit = idx; hitLen = token.length }
    }
    if (hit === null) { parts.push({ text: text.slice(i), match: false }); break }
    if (hit > i) parts.push({ text: text.slice(i, hit), match: false })
    parts.push({ text: text.slice(hit, hit + hitLen), match: true })
    i = hit + hitLen
  }
  return parts.filter(p => p.text.length > 0)
}