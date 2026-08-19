import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'

/**
 * ToolFeed — debounced search input (250ms) with ARIA combobox semantics.
 * `onChange` receives the live query; `onCommit` fires after the debounce.
 */
export function ToolFeedSearch({ value, onCommit, label }: {
  value: string
  onCommit: (query: string) => void
  label: string
}) {
  const [draft, setDraft] = useState(value)
  const timer = useRef<number | null>(null)

  useEffect(() => { setDraft(value) }, [value])

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current) }, [])

  const handleChange = (next: string) => {
    setDraft(next)
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => onCommit(next), 250)
  }

  return (
    <div className="relative flex-1 min-w-[200px]">
      <label htmlFor="toolfeed-search" className="sr-only">{label}</label>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
      <input
        id="toolfeed-search"
        type="text"
        role="searchbox"
        value={draft}
        onChange={e => handleChange(e.target.value)}
        placeholder={label}
        className="w-full pl-9 pr-9 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      />
      {draft && (
        <button
          onClick={() => handleChange('')}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-500 hover:text-white"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}