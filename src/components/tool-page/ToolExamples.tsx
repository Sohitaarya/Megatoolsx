import type { CsvTool } from '@/data/csvData'
import { ToolSection } from './ToolSection'

/**
 * Tool Page — input/output examples as paired cards.
 */
export function ToolExamples({ tool }: { tool: CsvTool }) {
  const examples = [
    { input: `Open ${tool.name} and start a new ${tool.category.toLowerCase()} task`, output: 'A clean workspace ready for your input.' },
    { input: 'Paste your content or values', output: `Instant, structured output powered by ${tool.name}.` },
    { input: `Explore the ${tool.name} guide and templates`, output: 'Best practices and shortcuts for faster results.' },
  ]

  return (
    <ToolSection title="Examples">
      <div className="space-y-4">
        {examples.map((e, i) => (
          <div key={i} className="grid sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-xs text-gray-500 mb-1">Input</div>
              <div className="text-sm text-gray-300 font-mono">{e.input}</div>
            </div>
            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/15">
              <div className="text-xs text-indigo-400 mb-1">Output</div>
              <div className="text-sm text-gray-300">{e.output}</div>
            </div>
          </div>
        ))}
      </div>
    </ToolSection>
  )
}