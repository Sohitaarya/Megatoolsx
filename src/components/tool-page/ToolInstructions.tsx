import type { CsvTool } from '@/data/csvData'
import { ToolSection } from './ToolSection'

const STEPS = [
  { title: 'Access the Tool', desc: (t: CsvTool) => `Visit the ${t.name} website or open the app on your device.` },
  { title: 'Create an Account', desc: () => 'Sign up with your email address or log in if you already have an account.' },
  { title: 'Explore the Dashboard', desc: () => 'Familiarize yourself with the interface and available options.' },
  { title: 'Configure Settings', desc: () => 'Adjust settings to match your preferences and requirements.' },
  { title: 'Start Using', desc: (t: CsvTool) => `Begin using ${t.name} for your ${t.category.toLowerCase()} needs.` },
]

const TIPS = [
  'Use keyboard shortcuts to work faster',
  'Enable notifications to stay updated on changes',
  'Review the FAQ section for common questions',
]

const MISTAKES = [
  'Skipping account verification can block some features',
  'Leaving settings at defaults means missing optimisations',
]

/**
 * Tool Page — step-by-step instructions in a standardized format, plus tips and
 * common mistakes. Matches the HowTo schema emitted for the same content.
 */
export function ToolInstructions({ tool }: { tool: CsvTool }) {
  return (
    <div className="space-y-6">
      <ToolSection title="Step-by-Step Guide">
        <div className="space-y-6">
          {STEPS.map((s, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-bold flex-shrink-0" aria-hidden="true">
                {i + 1}
              </div>
              <div>
                <h3 className="text-white font-medium">{s.title}</h3>
                <p className="text-gray-400 text-sm mt-1">{s.desc(tool)}</p>
              </div>
            </div>
          ))}
        </div>
      </ToolSection>

      <ToolSection title="Pro Tips">
        <ul className="space-y-2">
          {TIPS.map((t, i) => <li key={i} className="text-sm text-gray-400 flex items-start gap-2"><span className="text-indigo-400 mt-0.5">💡</span>{t}</li>)}
        </ul>
      </ToolSection>

      <ToolSection title="Common Mistakes to Avoid">
        <ul className="space-y-2">
          {MISTAKES.map((m, i) => <li key={i} className="text-sm text-gray-400 flex items-start gap-2"><span className="text-amber-400 mt-0.5">⚠️</span>{m}</li>)}
        </ul>
      </ToolSection>
    </div>
  )
}