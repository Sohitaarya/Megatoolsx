import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ToolRef = { slug: string; name: string; category: string; source: 'csv' | 'ai' }

interface UserStore {
  // Bookmarks
  bookmarks: ToolRef[]
  isBookmarked: (slug: string) => boolean
  toggleBookmark: (ref: ToolRef) => void

  // Favorites
  favorites: ToolRef[]
  isFavorite: (slug: string) => boolean
  toggleFavorite: (ref: ToolRef) => void

  // Recently viewed
  recent: ToolRef[]
  addRecent: (ref: ToolRef) => void

  // Compare (max 4)
  compare: ToolRef[]
  isInCompare: (slug: string) => boolean
  toggleCompare: (ref: ToolRef) => void
  clearCompare: () => void

  // Ratings
  ratings: Record<string, number>
  getRating: (slug: string) => number | undefined
  rateTool: (slug: string, rating: number) => void
}

const MAX_RECENT = 20
const MAX_COMPARE = 4

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      favorites: [],
      recent: [],
      compare: [],
      ratings: {},

      isBookmarked: (slug) => get().bookmarks.some(b => b.slug === slug),
      toggleBookmark: (ref) => {
        const { bookmarks } = get()
        const exists = bookmarks.some(b => b.slug === ref.slug)
        set({
          bookmarks: exists
            ? bookmarks.filter(b => b.slug !== ref.slug)
            : [ref, ...bookmarks],
        })
      },

      isFavorite: (slug) => get().favorites.some(f => f.slug === slug),
      toggleFavorite: (ref) => {
        const { favorites } = get()
        const exists = favorites.some(f => f.slug === ref.slug)
        set({
          favorites: exists
            ? favorites.filter(f => f.slug !== ref.slug)
            : [ref, ...favorites],
        })
      },

      addRecent: (ref) => {
        const { recent } = get()
        const filtered = recent.filter(r => r.slug !== ref.slug)
        set({ recent: [ref, ...filtered].slice(0, MAX_RECENT) })
      },

      isInCompare: (slug) => get().compare.some(c => c.slug === slug),
      toggleCompare: (ref) => {
        const { compare } = get()
        const exists = compare.some(c => c.slug === ref.slug)
        if (exists) {
          set({ compare: compare.filter(c => c.slug !== ref.slug) })
        } else if (compare.length < MAX_COMPARE) {
          set({ compare: [...compare, ref] })
        }
      },
      clearCompare: () => set({ compare: [] }),

      getRating: (slug) => get().ratings[slug],
      rateTool: (slug, rating) => {
        set(state => ({ ratings: { ...state.ratings, [slug]: rating } }))
      },
    }),
    {
      name: 'megatoolsx-user',
      partialize: (state) => ({
        bookmarks: state.bookmarks,
        favorites: state.favorites,
        recent: state.recent,
        compare: state.compare,
        ratings: state.ratings,
      }),
    }
  )
)
