import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface AppState {
  theme: Theme
  setTheme: (theme: Theme) => void
  isDarkMode: boolean
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void
  fontScale: number
  setFontScale: (scale: number) => void
}

const AppContext = createContext<AppState | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('megatoolsx-theme')
    return (saved as Theme) || 'system'
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [fontScale, setFontScale] = useState(() => {
    const saved = localStorage.getItem('megatoolsx-font-scale')
    return saved ? Number(saved) : 100
  })

  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = () => {
      let dark: boolean
      if (theme === 'system') {
        dark = mediaQuery.matches
      } else {
        dark = theme === 'dark'
      }
      setIsDarkMode(dark)
      root.classList.toggle('dark', dark)
    }

    applyTheme()
    mediaQuery.addEventListener('change', applyTheme)
    return () => mediaQuery.removeEventListener('change', applyTheme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('megatoolsx-font-scale', String(fontScale))
    document.documentElement.style.fontSize = `${fontScale}%`
  }, [fontScale])

  const setTheme = (t: Theme) => {
    setThemeState(t)
    localStorage.setItem('megatoolsx-theme', t)
  }

  return (
    <AppContext.Provider value={{
      theme, setTheme, isDarkMode,
      sidebarOpen, setSidebarOpen,
      searchOpen, setSearchOpen,
      fontScale, setFontScale
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
