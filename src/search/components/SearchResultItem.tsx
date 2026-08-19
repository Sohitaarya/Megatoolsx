import { ArrowRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SearchItem } from '../hooks/useSearch'

/**
 * Search — single result row with icon, name, category, popularity (capped star),
 * and a quick-action affordance. Used by the search modal and any result list.
 */
export function SearchResultItem({ item, active, onSelect }: {
  item: SearchItem
  active?: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all',
        active ? 'bg-indigo-500/10 text-white' : 'text-gray-400 hover:bg-white/5',
      )}
    >
      <div className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0',
        item.source === 'ai' ? 'bg-gradient-to-br from-purple-500 to-pink-600' : 'bg-gradient-to-br from-indigo-500 to-purple-600',
      )} aria-hidden="true">
        {item.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate group-hover:text-white">{item.name}</div>
        <div className="text-xs text-gray-600 flex items-center gap-1">
          {item.source === 'ai' && <Sparkles className="w-3 h-3 text-purple-400" aria-hidden="true" />}
          <span>{item.source === 'ai' ? 'AI Tool' : item.category}</span>
          {typeof item.rating === 'number' && <span className="text-gray-700">· ★ {item.rating.toFixed(1)}</span>}
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0" aria-hidden="true" />
    </button>
  )
}