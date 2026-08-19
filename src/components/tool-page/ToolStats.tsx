import { Star, Users, Clock, Tag } from 'lucide-react'
import type { CsvTool } from '@/data/csvData'
import { getStatusInfo } from '@/data/csvData'

/**
 * Tool Page — stats row. Deterministic pseudo-metrics derived from the tool slug
 * (stable across renders; not random), shown consistently on every tool page.
 */
export function ToolStats({ tool }: { tool: CsvTool }) {
  const stable = seed(tool.slug)
  const rating = (3.8 + (stable % 12) * 0.1).toFixed(1)
  const popular = 500 + ((stable * 7) % 9500)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Stat icon={<Star className="w-4 h-4" />} label="Rating" value={`${rating} / 5`} />
      <Stat icon={<Users className="w-4 h-4" />} label="Popularity" value={popularityLabel(popular)} />
      <Stat icon={<Clock className="w-4 h-4" />} label="Updated" value="2026" />
      <Stat icon={<Tag className="w-4 h-4" />} label="Status" value={getStatusInfo(tool.status).label} />
    </div>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
      <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-0.5">
        <span className="text-indigo-400" aria-hidden="true">{icon}</span>{label}
      </div>
      <div className="text-white font-semibold text-sm">{value}</div>
    </div>
  )
}

function seed(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}
function popularityLabel(n: number): string { return n >= 5000 ? 'High' : n >= 2500 ? 'Medium' : 'Rising' }