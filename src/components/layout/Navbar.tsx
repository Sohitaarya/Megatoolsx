import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Menu, X, Moon, Sun, Command, Globe, ChevronDown, Sparkles } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useSearchStore } from '@/store/searchStore'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useState, useRef, useEffect } from 'react'
import { LANGUAGES, type Language } from '@/i18n/translations'

const navLinks = [
  { label: 'Mega Tools', path: '/tools' },
  { label: 'AI Tools', path: '/ai-tools' },
  { label: 'Categories', path: '/categories' },
  { label: 'Collections', path: '/collections' },
  { label: 'Trending', path: '/trending' },
  { label: 'New', path: '/new-tools' },
]

const utilityLinks = [
  { label: 'Compare', path: '/compare', icon: 'Scale' },
  { label: 'My Tools', path: '/my-tools', icon: 'Bookmark' },
]

export function Navbar() {
  const { isDarkMode, setTheme } = useApp()
  const openSearch = useSearchStore(s => s.open)
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)
  const [currentLang, setCurrentLang] = useState<Language>('en')

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl border-b border-white/5" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" aria-label="MegatoolsX — home" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold text-white">
              Megatools<span className="text-indigo-400">X</span>
            </span>
          </Link>

          {/* Nav Links - Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className="px-3 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <button
              onClick={openSearch}
              aria-label="Search 2500+ tools"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm hover:bg-white/10 hover:text-white transition-all"
            >
              <Search className="w-4 h-4" aria-hidden="true" />
              <span>Search 2500+ tools...</span>
              <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/10 text-[10px] text-gray-500 font-mono" aria-hidden="true">
                <Command className="w-2.5 h-2.5" />K
              </kbd>
            </button>

            {/* Mobile Search */}
            <button
              onClick={openSearch}
              aria-label="Search tools"
              className="sm:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Search className="w-5 h-5" aria-hidden="true" />
            </button>

            {/* Utility Links (Compare, My Tools) */}
            <nav className="hidden lg:flex items-center gap-1">
              {utilityLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="px-2.5 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
            >
              {isDarkMode ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
            </button>

            {/* Language Selector */}
            <div className="relative hidden sm:block" ref={langRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                aria-expanded={langOpen}
                aria-haspopup="menu"
                aria-label="Select language"
                className="flex items-center gap-1 px-2 py-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all text-sm"
              >
                <Globe className="w-4 h-4" aria-hidden="true" />
                <span className="hidden lg:inline">{LANGUAGES.find(l => l.code === currentLang)?.native}</span>
                <ChevronDown className="w-3 h-3" aria-hidden="true" />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    id="language-menu"
                    role="menu"
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 py-2 rounded-2xl bg-gray-900 border border-white/10 shadow-2xl shadow-black/50 z-50"
                  >
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        role="menuitem"
                        onClick={() => { setCurrentLang(lang.code); setLangOpen(false) }}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                          currentLang === lang.code ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span className="w-6 text-center">{lang.native === 'English' ? '🇬🇧' : lang.native === 'हिन्दी' ? '🇮🇳' : lang.native === 'Español' ? '🇪🇸' : lang.native === 'Français' ? '🇫🇷' : lang.native === 'Deutsch' ? '🇩🇪' : lang.native === '中文' ? '🇨🇳' : lang.native === 'العربية' ? '🇸🇦' : lang.native === 'Português' ? '🇧🇷' : lang.native === 'Русский' ? '🇷🇺' : '🇯🇵'}</span>
                        <span>{lang.native}</span>
                        <span className="text-gray-600 text-xs ml-auto">{lang.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
            >
              {mobileOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 bg-black/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-white/5 my-2" />
              {utilityLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
