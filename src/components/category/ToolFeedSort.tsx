import { TOOL_SORTS, type ToolSortId } from './toolFeedUtils'

/**
 * ToolFeed — sort dropdown (ARIA labelled, matches the app's input styling).
 */
export function ToolFeedSort({ value, onChange, label = 'Sort tools' }: {
  value: ToolSortId
  onChange: (sort: ToolSortId) => void
  label?: string
}) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="toolfeed-sort" className="sr-only">{label}</label>
      <select
        id="toolfeed-sort"
        value={value}
        onChange={e => onChange(e.target.value as ToolSortId)}
        className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      >
        {TOOL_SORTS.map(s => <option key={s.id} value={s.id} className="bg-gray-900">{s.label}</option>)}
      </select>
    </div>
  )
}