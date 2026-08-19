import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const PAGE_SIZES = [20, 40, 60, 100]

/**
 * ToolFeed — pagination. Items-per-page (20/40/60/100), First/Prev/Next/Last,
 * jump-to-page, and a "Showing x–y of z" line. Fully keyboard + ARIA aware.
 */
export function ToolFeedPagination({ page, per, total, onPage, onPer }: {
  page: number
  per: number
  total: number
  onPage: (page: number) => void
  onPer: (per: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(total / per))
  const start = total === 0 ? 0 : (page - 1) * per + 1
  const end = Math.min(page * per, total)
  const pages = pageNumbers(page, totalPages)

  const go = (p: number) => {
    const clamped = Math.max(1, Math.min(p, totalPages))
    if (clamped !== page) onPage(clamped)
  }

  return (
    <nav aria-label="Pagination" className="mt-6 space-y-3">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-gray-500" aria-live="polite">
          Showing <span className="text-white">{start}–{end}</span> of <span className="text-white">{total}</span>
        </p>

        <div className="flex items-center gap-1 flex-wrap">
          <button onClick={() => go(1)} disabled={page <= 1} aria-label="First page" className={navBtn(page <= 1)}>
            <ChevronsLeft className="w-4 h-4" aria-hidden="true" />
          </button>
          <button onClick={() => go(page - 1)} disabled={page <= 1} aria-label="Previous page" className={navBtn(page <= 1)}>
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>

          {pages.map((p, i) => p === '…' ? (
            <span key={`gap-${i}`} className="px-1.5 text-gray-600 text-sm" aria-hidden="true">…</span>
          ) : (
            <button
              key={p}
              onClick={() => go(p)}
              aria-current={p === page ? 'page' : undefined}
              className={cn('px-3 py-1.5 rounded-lg text-sm transition-colors',
                p === page ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10')}
            >
              {p}
            </button>
          ))}

          <button onClick={() => go(page + 1)} disabled={page >= totalPages} aria-label="Next page" className={navBtn(page >= totalPages)}>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
          <button onClick={() => go(totalPages)} disabled={page >= totalPages} aria-label="Last page" className={navBtn(page >= totalPages)}>
            <ChevronsRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
        <span>Page {page} of {totalPages}</span>
        <label className="flex items-center gap-2">
          <span>Per page</span>
          <select
            value={per}
            onChange={e => onPer(Number(e.target.value))}
            className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            {PAGE_SIZES.map(s => <option key={s} value={s} className="bg-gray-900">{s}</option>)}
          </select>
        </label>
      </div>
    </nav>
  )
}

function navBtn(disabled: boolean): string {
  return cn('p-1.5 rounded-lg transition-colors',
    disabled ? 'text-gray-700 cursor-not-allowed' : 'text-gray-400 hover:text-white hover:bg-white/10')
}

/** Compact windowed page list with ellipses: [1 … 4 5 6 … 12]. */
function pageNumbers(current: number, total: number): Array<number | '…'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: Array<number | '…'> = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) pages.push('…')
  for (let p = start; p <= end; p++) pages.push(p)
  if (end < total - 1) pages.push('…')
  pages.push(total)
  return pages
}