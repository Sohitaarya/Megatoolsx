import { useUserStore } from '@/store/userStore'
import type { CsvTool } from '@/data/csvData'
import {
  Bookmark, Heart, Share2, Link as LinkIcon, Printer, Scale,
  Check, Copy, Star, X
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type ToolRef = { slug: string; name: string; category: string; source: 'csv' | 'ai' }

interface ToolActionsProps {
  ref: ToolRef
  className?: string
  onCompare?: () => void
}

export function ToolActions({ ref, className }: ToolActionsProps) {
  const {
    isBookmarked, toggleBookmark,
    isFavorite, toggleFavorite,
    isInCompare, toggleCompare,
    getRating, rateTool,
  } = useUserStore()

  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      setCopied(false)
    }
  }

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: ref.name, url: window.location.href })
        return
      } catch {
        /* user cancelled */
      }
    }
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  const myRating = getRating(ref.slug)

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {/* Copy Link */}
      <button
        onClick={copyLink}
        title="Copy link"
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-all"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <LinkIcon className="w-4 h-4" />}
        {copied ? 'Copied!' : 'Copy'}
      </button>

      {/* Share */}
      <button
        onClick={shareLink}
        title="Share"
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-all"
      >
        {shared ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
        {shared ? 'Done!' : 'Share'}
      </button>

      {/* Bookmark */}
      <button
        onClick={() => toggleBookmark(ref)}
        title="Bookmark"
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm transition-all',
          isBookmarked(ref.slug)
            ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
        )}
      >
        <Bookmark className={cn('w-4 h-4', isBookmarked(ref.slug) && 'fill-current')} />
        {isBookmarked(ref.slug) ? 'Saved' : 'Save'}
      </button>

      {/* Favorite */}
      <button
        onClick={() => toggleFavorite(ref)}
        title="Favorite"
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm transition-all',
          isFavorite(ref.slug)
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
        )}
      >
        <Heart className={cn('w-4 h-4', isFavorite(ref.slug) && 'fill-current')} />
        {isFavorite(ref.slug) ? 'Liked' : 'Like'}
      </button>

      {/* Compare */}
      <button
        onClick={() => toggleCompare(ref)}
        title="Add to compare"
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm transition-all',
          isInCompare(ref.slug)
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
        )}
      >
        <Scale className="w-4 h-4" />
        {isInCompare(ref.slug) ? 'In Compare' : 'Compare'}
      </button>

      {/* Print */}
      <button
        onClick={() => window.print()}
        title="Print guide"
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-all"
      >
        <Printer className="w-4 h-4" />
        Print
      </button>

      {/* Rating */}
      <div className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => rateTool(ref.slug, star)}
            title={`Rate ${star}/5`}
            className="transition-transform hover:scale-125"
          >
            <Star
              className={cn(
                'w-4 h-4',
                myRating && star <= myRating ? 'text-yellow-500 fill-current' : 'text-gray-600'
              )}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
