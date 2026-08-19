import Papa from 'papaparse'
import { getToolDisplayName } from './designCreativeToolNames'
import { cleanToolSlug } from '@/seo/indexing/toolSlug'

export type ToolStatus = 'Present' | 'Generative' | 'Future'

export interface CsvTool {
  category: string
  name: string
  status: string
  description: string
  seoKeywords: string
  metaDescription: string
  /** Raw CSV slug (un-normalized) — kept for redirects from legacy URLs. */
  rawSlug: string
  /** Normalized slug — the single source used by routing/sitemap/links. */
  slug: string
}

/** All active statuses shown on the site (working + upcoming). */
export const ACTIVE_STATUSES: ToolStatus[] = ['Present', 'Generative', 'Future']

/** Human-readable label + style per status. */
export const STATUS_INFO: Record<ToolStatus, { label: string; emoji: string; color: string; badge: string }> = {
  Present: {
    label: 'Working Tool',
    emoji: '✅',
    color: '#10b981',
    badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  },
  Generative: {
    label: 'New AI Tool',
    emoji: '🟣',
    color: '#a855f7',
    badge: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  },
  Future: {
    label: 'Coming Soon',
    emoji: '🔮',
    color: '#f59e0b',
    badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  },
}

export function getStatusInfo(status: string): { label: string; emoji: string; color: string; badge: string } {
  if (status === 'Present') return STATUS_INFO.Present
  if (status === 'Generative') return STATUS_INFO.Generative
  if (status === 'Future') return STATUS_INFO.Future
  return { label: status, emoji: '🔹', color: '#64748b', badge: 'bg-gray-500/10 text-gray-400 border border-gray-500/20' }
}

// AI Tools — separate featured collection (NOT from CSV)
export const AI_TOOLS = [
  { name: 'ChatGPT', slug: 'chatgpt', category: 'AI Chatbots', description: 'AI-powered conversational assistant by OpenAI' },
  { name: 'Claude', slug: 'claude', category: 'AI Chatbots', description: 'Anthropic\'s advanced AI assistant for complex tasks' },
  { name: 'Gemini', slug: 'gemini', category: 'AI Chatbots', description: 'Google\'s multimodal AI model' },
  { name: 'Copilot', slug: 'copilot', category: 'AI Coding', description: 'AI pair programmer by GitHub and Microsoft' },
  { name: 'Midjourney', slug: 'midjourney', category: 'AI Image Generation', description: 'AI-powered image generation from text prompts' },
  { name: 'DALL-E', slug: 'dall-e', category: 'AI Image Generation', description: 'OpenAI\'s image generation model' },
  { name: 'Stable Diffusion', slug: 'stable-diffusion', category: 'AI Image Generation', description: 'Open-source AI image generation model' },
  { name: 'Adobe Firefly', slug: 'adobe-firefly', category: 'AI Image Generation', description: 'Adobe\'s generative AI for creatives' },
  { name: 'Leonardo AI', slug: 'leonardo-ai', category: 'AI Image Generation', description: 'AI-powered art and image generation platform' },
  { name: 'Runway ML', slug: 'runway-ml', category: 'AI Video', description: 'AI-powered video editing and generation' },
  { name: 'Synthesia', slug: 'synthesia', category: 'AI Video', description: 'AI video generation with virtual avatars' },
  { name: 'ElevenLabs', slug: 'elevenlabs', category: 'AI Audio', description: 'AI voice synthesis and cloning platform' },
  { name: 'Murf AI', slug: 'murf-ai', category: 'AI Audio', description: 'AI voiceover and text-to-speech platform' },
  { name: 'Grammarly', slug: 'grammarly', category: 'AI Writing', description: 'AI-powered writing assistant' },
  { name: 'Jasper AI', slug: 'jasper-ai', category: 'AI Writing', description: 'AI content generation for marketing' },
  { name: 'Copy AI', slug: 'copy-ai', category: 'AI Writing', description: 'AI copywriting and content generation' },
  { name: 'Writesonic', slug: 'writesonic', category: 'AI Writing', description: 'AI writing platform for marketing content' },
  { name: 'Perplexity AI', slug: 'perplexity-ai', category: 'AI Search', description: 'AI-powered search engine and research assistant' },
  { name: 'You.com', slug: 'you-com', category: 'AI Search', description: 'AI search engine with chat capabilities' },
  { name: 'Notion AI', slug: 'notion-ai', category: 'AI Productivity', description: 'AI-powered writing and productivity assistant' },
  { name: 'Gamma AI', slug: 'gamma-ai', category: 'AI Presentations', description: 'AI-powered presentation creation' },
  { name: 'Beautiful AI', slug: 'beautiful-ai', category: 'AI Presentations', description: 'AI-powered slide deck design' },
  { name: 'Canva AI', slug: 'canva-ai', category: 'AI Design', description: 'AI-powered design features in Canva' },
  { name: 'HeyGen', slug: 'heygen', category: 'AI Video', description: 'AI video generation platform with avatars' },
  { name: 'Pictory', slug: 'pictory', category: 'AI Video', description: 'AI video creation from long-form content' },
  { name: 'Descript', slug: 'descript', category: 'AI Video/Audio', description: 'AI-powered video and audio editing' },
  { name: 'Otter AI', slug: 'otter-ai', category: 'AI Transcription', description: 'AI meeting transcription and note-taking' },
  { name: 'Sora', slug: 'sora', category: 'AI Video', description: 'OpenAI\'s text-to-video generation model' },
  { name: 'DeepSeek', slug: 'deepseek', category: 'AI Chatbots', description: 'Advanced AI language model' },
  { name: 'Grok', slug: 'grok', category: 'AI Chatbots', description: 'xAI\'s conversational AI assistant' },
]

// ─── CSV Loading (fetched at runtime, NOT bundled into JS) ───
let cachedTools: CsvTool[] | null = null
let loadPromise: Promise<CsvTool[]> | null = null

/**
 * Loads and parses tools.csv once, then caches it.
 * The CSV is fetched from the deployed site root (/tools.csv) instead of
 * being embedded in the JS bundle — this removes ~700KB from the initial
 * payload and dramatically improves LCP/TTFB.
 */
export function loadTools(): Promise<CsvTool[]> {
  if (cachedTools) return Promise.resolve(cachedTools)
  if (loadPromise) return loadPromise

  loadPromise = fetch('/tools.csv', { cache: 'no-cache' })
    .then(res => {
      if (!res.ok) throw new Error(`Failed to load tools.csv: ${res.status}`)
      return res.text()
    })
    .then(text => {
      cachedTools = parseCsvText(text)
      return cachedTools
    })
    .catch(err => {
      loadPromise = null
      throw err
    })
  return loadPromise
}

function parseCsvText(csvRaw: string): CsvTool[] {
  const result = Papa.parse(csvRaw, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => {
      const map: Record<string, string> = {
        'Category': 'category',
        'Tool Name': 'name',
        'Status': 'status',
        'Description': 'description',
        'SEO Keywords': 'seoKeywords',
        'Meta Description': 'metaDescription',
        'Slug': 'slug',
      }
      return map[h] || h.trim()
    }
  })

  const parsed = (result.data as CsvTool[]).filter(t =>
    t.name && t.slug && ACTIVE_STATUSES.includes(t.status as ToolStatus)
  )
  // Normalize every slug through the SINGLE slug pipeline (same as the sitemap),
  // preserving the raw CSV slug for legacy redirects. CSV order = stable dedupe.
  const used = new Set<string>()
  return parsed.map(t => {
    const rawSlug = (t.slug || '').trim()
    const slug = cleanToolSlug(rawSlug, t.name, used)
    return { ...t, rawSlug, slug }
  })
}

// ─── Query Helpers ──────────────────────────────────────────

export function getCategories(tools: CsvTool[]): { name: string; slug: string; count: number }[] {
  const map = new Map<string, number>()
  tools.forEach(t => {
    const cat = t.category
    map.set(cat, (map.get(cat) || 0) + 1)
  })
  return Array.from(map.entries())
    .map(([name, count]) => ({
      name,
      slug: categorySlug(name),
      count,
    }))
    .sort((a, b) => b.count - a.count)
}

/** Deterministic URL slug for a category name, e.g. "Video/Audio Tools" → "video-audio-tools". */
export function categorySlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

/** Human-friendly meta description for a tool, falling back to the CSV fields. */
export function toolMetaDescription(tool: CsvTool): string {
  const meta = tool.metaDescription?.trim()
  if (meta && meta.length > 24) return meta
  const desc = tool.description?.trim()
  if (desc && desc.length > 40) return desc
  const display = getToolDisplayName(tool)
  return `Use ${display} online free. Step-by-step guide, features, FAQ, and troubleshooting for the ${tool.category.toLowerCase()} tool.`
}

/** SEO title for a tool page. Uses the repaired canonical name for Design/Creative. */
export function toolTitle(tool: CsvTool): string {
  const display = getToolDisplayName(tool)
  return `${display} Guide: How to Use, Features & FAQ`
}

export function getToolsByCategory(tools: CsvTool[], category: string): CsvTool[] {
  return tools.filter(t => t.category === category)
}

export function findTool(tools: CsvTool[], slug: string): CsvTool | undefined {
  return tools.find(t => t.slug === slug)
}

export function searchCsvTools(tools: CsvTool[], query: string): CsvTool[] {
  const q = query.toLowerCase()
  return tools.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.category.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q)
  )
}

export function filterTools(
  tools: CsvTool[],
  opts: { category?: string; sort?: 'popularity' | 'newest' | 'alphabetical' }
): CsvTool[] {
  let filtered = [...tools]
  if (opts.category && opts.category !== 'all') {
    filtered = filtered.filter(t => t.category === opts.category)
  }
  if (opts.sort === 'alphabetical') {
    filtered.sort((a, b) => a.name.localeCompare(b.name))
  }
  return filtered
}
