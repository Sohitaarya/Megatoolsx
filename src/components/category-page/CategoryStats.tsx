import { Boxes, Star, Hash, TrendingUp } from 'lucide-react'
import type { CsvTool } from '@/data/csvData'

/**
 * Category Hub — stats row. Aggregates the tools in this category.
 */
export function CategoryStats({ tools }: { tools: CsvTool[] }) {
  const generative = tools.filter(t => t.status === 'Generative').length
  const future = tools.filter(t => t.status === 'Future').length
  return (
    <section aria-label={`${tools.length} tools`} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Stat icon={<Boxes className="w-4 h-4" />} label="Total tools" value={String(tools.length)} />
      <Stat icon={<Star className="w-4 h-4" />} label="AI powered" value={String(generative)} />
      <Stat icon={<TrendingUp className="w-4 h-4" />} label="Coming soon" value={String(future)} />
      <Stat icon={<Hash className="w-4 h-4" />} label="Guides" value={String(tools.length)} />
    </section>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
      <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-0.5"><span className="text-indigo-400">{icon}</span>{label}</div>
      <div className="text-lg font-bold text-white">{value}</div>
    </div>
  )
}