import { Check } from 'lucide-react'
import type { CsvTool } from '@/data/csvData'
import { ToolSection } from './ToolSection'

const FEATURES = [
  'User-friendly interface', 'Fast, reliable performance', 'Cross-platform support',
  'Secure data handling', 'Regular updates', '24/7 customer support',
  'Integration capabilities', 'Customizable settings', 'Cloud synchronization',
]

/**
 * Tool Page — feature grid.
 */
export function ToolFeatures({ tool }: { tool: CsvTool }) {
  return (
    <ToolSection title={`Key Features of ${tool.name}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {FEATURES.map((f, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" aria-hidden="true" />
            <span className="text-gray-300 text-sm">{f}</span>
          </div>
        ))}
      </div>
    </ToolSection>
  )
}