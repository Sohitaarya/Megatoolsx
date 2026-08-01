import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  Info, BookOpen, Download, Settings, LogIn, UserPlus,
  Grid3X3, DollarSign, FileText, Keyboard, Code, Zap,
  Puzzle, Box, AlertTriangle, CheckCircle, Bug,
  HelpCircle, Shuffle, ThumbsUp, History, RefreshCw,
  Newspaper, Star, MessageCircle, Bookmark, ExternalLink
} from 'lucide-react'

const sidebarLinks = [
  { label: 'Overview', icon: Info, path: '' },
  { label: 'How to Use', icon: BookOpen, path: 'how-to-use' },
  { label: 'Installation', icon: Download, path: 'installation' },
  { label: 'Setup', icon: Settings, path: 'setup' },
  { label: 'Login', icon: LogIn, path: 'login' },
  { label: 'Sign Up', icon: UserPlus, path: 'signup' },
  { label: 'Features', icon: Grid3X3, path: 'features' },
  { label: 'Pricing', icon: DollarSign, path: 'pricing' },
  { label: 'Templates', icon: FileText, path: 'templates' },
  { label: 'Keyboard Shortcuts', icon: Keyboard, path: 'keyboard-shortcuts' },
  { label: 'API', icon: Code, path: 'api' },
  { label: 'Automation', icon: Zap, path: 'automation' },
  { label: 'Integrations', icon: Puzzle, path: 'integrations' },
  { label: 'Extensions', icon: Box, path: 'extensions' },
  { label: 'Plugins', icon: Puzzle, path: 'plugins' },
  { label: 'Problems', icon: AlertTriangle, path: 'problems' },
  { label: 'Solutions', icon: CheckCircle, path: 'solutions' },
  { label: 'Error Codes', icon: Bug, path: 'error-codes' },
  { label: 'FAQ', icon: HelpCircle, path: 'faq' },
  { label: 'Alternatives', icon: Shuffle, path: 'alternatives' },
  { label: 'Pros & Cons', icon: ThumbsUp, path: 'pros-cons' },
  { label: 'History', icon: History, path: 'history' },
  { label: 'Latest Update', icon: RefreshCw, path: 'latest-update' },
  { label: 'News', icon: Newspaper, path: 'news' },
  { label: 'Reviews', icon: Star, path: 'reviews' },
  { label: 'Community', icon: MessageCircle, path: 'community' },
  { label: 'Resources', icon: Bookmark, path: 'resources' },
  { label: 'Download', icon: Download, path: 'download' },
  { label: 'Official Links', icon: ExternalLink, path: 'official-links' },
]

export function ToolSidebar({ slug }: { slug: string }) {
  const location = useLocation()

  return (
    <nav className="space-y-0.5 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-hide pr-2">
      {sidebarLinks.map(({ label, icon: Icon, path }) => {
        const fullPath = `/tools/${slug}${path ? '/' + path : ''}`
        const isActive = location.pathname === fullPath

        return (
          <Link
            key={path}
            to={fullPath}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200',
              isActive
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
