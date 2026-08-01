import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  Info, BookOpen, Download, Settings, Grid3X3, DollarSign, ThumbsUp,
  Shuffle, HelpCircle, Shield, Lightbulb, Star, Play
} from 'lucide-react'

const sidebarLinks = [
  { label: 'Overview', icon: Info, path: '' },
  { label: 'How to Use', icon: BookOpen, path: 'how-to-use' },
  { label: 'Download', icon: Download, path: 'download' },
  { label: 'Installation', icon: Settings, path: 'installation' },
  { label: 'Features', icon: Grid3X3, path: 'features' },
  { label: 'Pricing', icon: DollarSign, path: 'pricing' },
  { label: 'Pros & Cons', icon: ThumbsUp, path: 'pros-cons' },
  { label: 'Alternatives', icon: Shuffle, path: 'alternatives' },
  { label: 'FAQ', icon: HelpCircle, path: 'faq' },
  { label: 'Security', icon: Shield, path: 'security' },
  { label: 'Tips & Tricks', icon: Lightbulb, path: 'tips' },
  { label: 'Try It Online', icon: Play, path: 'play' },
]

export function AiToolSidebar({ slug }: { slug: string }) {
  const location = useLocation()
  return (
    <nav className="space-y-0.5 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-hide pr-2">
      {sidebarLinks.map(({ label, icon: Icon, path }) => {
        const fullPath = `/ai-tools/${slug}${path ? '/' + path : ''}`
        const isActive = location.pathname === fullPath
        return (
          <Link
            key={path}
            to={fullPath}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200',
              isActive
                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
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
