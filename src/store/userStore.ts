import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { analyticsApi } from '@/analytics'

/** Safe storage: falls back to in-memory on quota / private-browsing / corruption. */
const memoryStore = new Map<string, string>()
const safeStorage = createJSONStorage(() => ({
  getItem: (name: string): string | null => {
    try { return window.localStorage.getItem(name) } catch { return memoryStore.get(name) ?? null }
  },
  setItem: (name: string, value: string): void => {
    try { window.localStorage.setItem(name, value) } catch { memoryStore.set(name, value) }
  },
  removeItem: (name: string): void => {
    try { window.localStorage.removeItem(name) } catch { memoryStore.delete(name) }
  },
}))

export type ToolRef = { slug: string; name: string; category: string; source: 'csv' | 'ai' }

/** Versioned, anonymous, client-only activity store. No login, no sensitive data. */
interface UserStore {
  // Bookmarks (existing)
  bookmarks: ToolRef[]
  isBookmarked: (slug: string) => boolean
  toggleBookmark: (ref: ToolRef) => void

  // Favorites
  favorites: ToolRef[]
  isFavorite: (slug: string) => boolean
  toggleFavorite: (ref: ToolRef) => void

  // Recently viewed (existing)
  recent: ToolRef[]
  addRecent: (ref: ToolRef) => void
  recordToolView: (ref: ToolRef) => void

  // Recently used (or Continue Working)
  recentlyUsed: ToolRef[]
  recordUsed: (ref: ToolRef) => void
  recordToolUsage: (ref: ToolRef) => void

  // Favorite (typed add/remove alongside the backward-compatible toggle)
  addFavorite: (ref: ToolRef) => void
  removeFavorite: (slug: string) => void

  // Saved for later (typed save/remove alongside the backward-compatible toggle)
  saved: ToolRef[]
  isSaved: (slug: string) => boolean
  toggleSave: (ref: ToolRef) => void
  saveTool: (ref: ToolRef) => void
  removeSavedTool: (slug: string) => void

  // Recent searches
  recentSearches: string[]
  addRecentSearch: (query: string) => void
  removeRecentSearch: (query: string) => void
  clearRecentSearches: () => void

  // Usage telemetry (anonymous counts + last-used timestamps)
  toolUsage: Record<string, { count: number; lastUsed: number }>
  getUsageCount: (slug: string) => number
  getUsageTimestamp: (slug: string) => number | undefined

  // Category affinity (derived) + last visited
  favoriteCategories: string[]
  lastVisitedCategory: string | null
  lastVisitedTool: string | null
  setLastVisited: (categorySlug: string | null, toolSlug: string | null) => void
  setLastVisitedCategory: (categorySlug: string | null) => void
  setLastVisitedTool: (toolSlug: string | null) => void

  // Compare (existing, max 4)
  compare: ToolRef[]
  isInCompare: (slug: string) => boolean
  toggleCompare: (ref: ToolRef) => void
  clearCompare: () => void

  // Ratings (existing)
  ratings: Record<string, number>
  getRating: (slug: string) => number | undefined
  rateTool: (slug: string, rating: number) => void

  // Privacy controls
  clearHistory: () => void
  clearFavorites: () => void
  resetAll: () => void
}

const MAX_RECENT = 20
const MAX_RECENTLY_USED = 20
const MAX_FAVORITES = 100
const MAX_SAVED = 100
const MAX_SEARCHES = 20
const MAX_COMPARE = 4

function dedupe(list: ToolRef[], ref: ToolRef, max: number): ToolRef[] {
  return [ref, ...list.filter(x => x.slug !== ref.slug)].slice(0, max)
}

/** zustand persist state for a legacy storage version (repair target). */
function legacyState(raw: unknown): Partial<UserStore> {
  if (!raw || typeof raw !== 'object') return {}
  const r = raw as Record<string, unknown>
  return {
    bookmarks: Array.isArray(r.bookmarks) ? r.bookmarks as ToolRef[] : [],
    favorites: Array.isArray(r.favorites) ? r.favorites as ToolRef[] : [],
    recent: Array.isArray(r.recent) ? r.recent as ToolRef[] : [],
    compare: Array.isArray(r.compare) ? r.compare as ToolRef[] : [],
    ratings: (r.ratings && typeof r.ratings === 'object') ? r.ratings as Record<string, number> : {},
  }
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      favorites: [],
      recent: [],
      recentlyUsed: [],
      saved: [],
      recentSearches: [],
      toolUsage: {},
      favoriteCategories: [],
      lastVisitedCategory: null,
      lastVisitedTool: null,
      compare: [],
      ratings: {},

      isBookmarked: (slug) => get().bookmarks.some(b => b.slug === slug),
      toggleBookmark: (ref) => {
        const exists = get().bookmarks.some(b => b.slug === ref.slug)
        set({ bookmarks: exists ? get().bookmarks.filter(b => b.slug !== ref.slug) : dedupe(get().bookmarks, ref, 20) })
      },

      isFavorite: (slug) => get().favorites.some(f => f.slug === slug),
      toggleFavorite: (ref) => {
        const exists = get().favorites.some(f => f.slug === ref.slug)
        set({ favorites: exists ? get().favorites.filter(f => f.slug !== ref.slug) : dedupe(get().favorites, ref, 20) })
        analyticsApi.trackEvent(exists ? 'tool_remove_favorite' : 'tool_favorite', { tool: ref.slug })
      },

      addRecent: (ref) => {
        set({ recent: dedupe(get().recent, ref, MAX_RECENT) })
        const cats = Array.from(new Set([...get().favoriteCategories, ref.category]))
        set({ favoriteCategories: cats.slice(0, 12) })
        analyticsApi.trackEvent('tool_view', { tool: ref.slug, category: ref.category, source: ref.source })
      },

      recordToolView: (ref) => {
        get().addRecent(ref)
        set({ lastVisitedTool: ref.slug })
      },

      recordUsed: (ref) => {
        set({
          recentlyUsed: dedupe(get().recentlyUsed, ref, MAX_RECENTLY_USED),
          toolUsage: {
            ...get().toolUsage,
            [ref.slug]: { count: (get().toolUsage[ref.slug]?.count ?? 0) + 1, lastUsed: Date.now() },
          },
        })
        analyticsApi.trackEvent('tool_open', { tool: ref.slug })
      },

      recordToolUsage: (ref) => get().recordUsed(ref),

      addFavorite: (ref) => {
        if (!get().favorites.some(f => f.slug === ref.slug)) {
          set({ favorites: dedupe(get().favorites, ref, MAX_FAVORITES) })
          analyticsApi.trackEvent('tool_favorite', { tool: ref.slug })
        }
      },
      removeFavorite: (slug) => {
        if (get().favorites.some(f => f.slug === slug)) {
          set({ favorites: get().favorites.filter(f => f.slug !== slug) })
          analyticsApi.trackEvent('tool_remove_favorite', { tool: slug })
        }
      },

      isSaved: (slug) => get().saved.some(s => s.slug === slug),
      toggleSave: (ref) => {
        const exists = get().saved.some(s => s.slug === ref.slug)
        set({ saved: exists ? get().saved.filter(s => s.slug !== ref.slug) : dedupe(get().saved, ref, MAX_SAVED) })
        analyticsApi.trackEvent(exists ? 'tool_remove_save' : 'tool_save', { tool: ref.slug })
      },

      addRecentSearch: (query) => {
        const q = query.trim()
        if (!q) return
        set({ recentSearches: [q, ...get().recentSearches.filter(x => x !== q)].slice(0, MAX_SEARCHES) })
        analyticsApi.trackSearch({ query: q.slice(0, 60), action: 'submit' })
      },
      removeRecentSearch: (query) => set({ recentSearches: get().recentSearches.filter(x => x !== query) }),
      clearRecentSearches: () => set({ recentSearches: [] }),

      saveTool: (ref) => { if (!get().saved.some(s => s.slug === ref.slug)) { set({ saved: dedupe(get().saved, ref, MAX_SAVED) }); analyticsApi.trackEvent('tool_save', { tool: ref.slug }) } },
      removeSavedTool: (slug) => { if (get().saved.some(s => s.slug === slug)) { set({ saved: get().saved.filter(s => s.slug !== slug) }); analyticsApi.trackEvent('tool_remove_save', { tool: slug }) } },

      getUsageCount: (slug) => get().toolUsage[slug]?.count ?? 0,
      getUsageTimestamp: (slug) => get().toolUsage[slug]?.lastUsed,

      setLastVisited: (categorySlug, toolSlug) => set({ lastVisitedCategory: categorySlug, lastVisitedTool: toolSlug }),
      setLastVisitedCategory: (categorySlug) => set({ lastVisitedCategory: categorySlug }),
      setLastVisitedTool: (toolSlug) => set({ lastVisitedTool: toolSlug }),

      isInCompare: (slug) => get().compare.some(c => c.slug === slug),
      toggleCompare: (ref) => {
        const exists = get().compare.some(c => c.slug === ref.slug)
        if (exists) set({ compare: get().compare.filter(c => c.slug !== ref.slug) })
        else if (get().compare.length < MAX_COMPARE) set({ compare: [...get().compare, ref] })
      },
      clearCompare: () => set({ compare: [] }),

      getRating: (slug) => get().ratings[slug],
      rateTool: (slug, rating) => set(state => ({ ratings: { ...state.ratings, [slug]: rating } })),

      clearHistory: () => set({ recent: [], recentlyUsed: [], recentSearches: [], toolUsage: {}, lastVisitedCategory: null, lastVisitedTool: null }),
      clearFavorites: () => set({ favorites: [], saved: [], favoriteCategories: [] }),
      resetPersonalization: () => set({ recent: [], recentlyUsed: [], recentSearches: [], toolUsage: {}, favoriteCategories: [], lastVisitedCategory: null, lastVisitedTool: null, favorites: [], saved: [] }),
      resetAll: () => set({ bookmarks: [], favorites: [], recent: [], recentlyUsed: [], saved: [], recentSearches: [], toolUsage: {}, favoriteCategories: [], compare: [], ratings: {}, lastVisitedCategory: null, lastVisitedTool: null }),
    }),
    {
      name: 'megatoolsx:user:v1',
      version: 1,
      // Migration: import the pre-v1 "megatoolsx-user" blob and repair the shape.
      migrate: (persisted, version) => {
        const incoming = legacyState(persisted)
        if (version === 0) {
          try {
            const raw = window.localStorage.getItem('megatoolsx-user')
            if (raw) {
              const old = legacyState(JSON.parse(raw))
              return { ...old, ...incoming, ...emptyWorkspace() }
            }
          } catch { /* ignore */ }
        }
        return { ...incoming, ...emptyWorkspace() }
      },
      storage: safeStorage,
      partialize: (state) => ({
        bookmarks: state.bookmarks,
        favorites: state.favorites,
        recent: state.recent,
        recentlyUsed: state.recentlyUsed,
        saved: state.saved,
        recentSearches: state.recentSearches,
        toolUsage: state.toolUsage,
        favoriteCategories: state.favoriteCategories,
        lastVisitedCategory: state.lastVisitedCategory,
        lastVisitedTool: state.lastVisitedTool,
        compare: state.compare,
        ratings: state.ratings,
      }),
    }
  )
)

function emptyWorkspace(): Partial<UserStore> {
  return {
    recentlyUsed: [], saved: [], recentSearches: [], toolUsage: {},
    favoriteCategories: [], lastVisitedCategory: null, lastVisitedTool: null,
  }
}