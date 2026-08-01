import { create } from 'zustand'
import { parseCsv, getCategories, getToolsByCategory, findTool, searchCsvTools, filterTools, AI_TOOLS, type CsvTool } from '@/data/csvData'

interface CsvCategory {
  name: string
  slug: string
  count: number
}

interface SearchResult {
  tool: CsvTool | typeof AI_TOOLS[number]
  source: 'csv' | 'ai'
  score: number
}

interface ToolsStore {
  // CSV mega tools
  csvTools: CsvTool[]
  csvCategories: CsvCategory[]
  // AI tools (separate collection)
  aiTools: typeof AI_TOOLS
  // Derived
  latestTools: CsvTool[]
  popularTools: CsvTool[]
  newestTools: CsvTool[]
  // Methods
  getToolBySlug: (slug: string) => CsvTool | undefined
  getAiToolBySlug: (slug: string) => typeof AI_TOOLS[number] | undefined
  getToolsByCategory: (category: string) => CsvTool[]
  searchAll: (query: string) => SearchResult[]
  getCsvCategories: () => CsvCategory[]
  filterCsvTools: (opts: { category?: string; sort?: string }) => CsvTool[]
  getRelatedTools: (tool: CsvTool, count: number) => CsvTool[]
}

export const useToolsStore = create<ToolsStore>((set, get) => {
  const csvTools = parseCsv()
  const csvCategories = getCategories(csvTools)
  const aiTools = AI_TOOLS

  return {
    csvTools,
    csvCategories,
    aiTools,

    latestTools: csvTools.slice(0, 24),
    popularTools: [...csvTools].sort(() => Math.random() - 0.5).slice(0, 24),
    newestTools: csvTools.slice(-24).reverse(),

    // ─── Methods ──────────────────────────────────────────

    getToolBySlug: (slug: string) => {
      return findTool(get().csvTools, slug)
    },

    getAiToolBySlug: (slug: string) => {
      return get().aiTools.find(t => t.slug === slug)
    },

    getToolsByCategory: (category: string) => {
      return getToolsByCategory(get().csvTools, category)
    },

    searchAll: (query: string) => {
      const q = query.toLowerCase().trim()
      if (!q) return []

      const results: SearchResult[] = []

      // Search AI tools
      get().aiTools.forEach(t => {
        let score = 0
        const nameLower = t.name.toLowerCase()
        if (nameLower === q) score += 100
        else if (nameLower.startsWith(q)) score += 80
        else if (nameLower.includes(q)) score += 60
        if (t.category.toLowerCase().includes(q)) score += 30
        if (score > 0) results.push({ tool: t, source: 'ai', score })
      })

      // Search CSV tools
      get().csvTools.forEach(t => {
        let score = 0
        const nameLower = t.name.toLowerCase()
        if (nameLower === q) score += 100
        else if (nameLower.startsWith(q)) score += 80
        else if (nameLower.includes(q)) score += 60
        if (t.category.toLowerCase().includes(q)) score += 30
        if (t.description.toLowerCase().includes(q)) score += 20
        if (score > 0) results.push({ tool: t, source: 'csv', score })
      })

      return results.sort((a, b) => b.score - a.score).slice(0, 20)
    },

    getCsvCategories: () => get().csvCategories,

    filterCsvTools: (opts: { category?: string; sort?: string }) => {
      let filtered = [...get().csvTools]
      if (opts.category && opts.category !== 'all') {
        filtered = filtered.filter(t => {
          const catSlug = t.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
          return catSlug === opts.category || t.category === opts.category
        })
      }
      if (opts.sort === 'alphabetical') {
        filtered.sort((a, b) => a.name.localeCompare(b.name))
      }
      return filtered
    },

    getRelatedTools: (tool: CsvTool, count: number) => {
      return get().csvTools
        .filter(t => t.name !== tool.name && t.category === tool.category)
        .slice(0, count)
    }
  }
})
