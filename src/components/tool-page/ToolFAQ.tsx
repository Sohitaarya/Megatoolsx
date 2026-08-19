import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { CsvTool } from '@/data/csvData'
import { ToolSection } from './ToolSection'

const FAQS = (tool: CsvTool): Array<{ q: string; a: string }> => [
  { q: `What is ${tool.name}?`, a: `${tool.name} is a ${tool.category.toLowerCase()} tool that ${tool.description.toLowerCase()}` },
  { q: `Is ${tool.name} free?`, a: 'Pricing varies by plan. Check the official website for the most up-to-date rates.' },
  { q: 'How do I get started?', a: 'Visit the official website, create an account, and follow the onboarding guide.' },
  { q: 'What platforms are supported?', a: 'Most online tools work on all major browsers and operating systems.' },
  { q: 'Is my data secure?', a: 'Always review the privacy policy and security measures on the official website.' },
]

/**
 * Tool Page — FAQ as an accessible accordion. Each Q/A is schema-ready (the
 * page already emits FAQPage JSON-LD for the same content).
 */
export function ToolFAQ({ tool }: { tool: CsvTool }) {
  const [open, setOpen] = useState(0)

  return (
    <ToolSection title={`Frequently Asked Questions`}>
      <div className="space-y-3">
        {FAQS(tool).map((faq, i) => {
          const isOpen = open === i
          return (
            <div key={i} className="rounded-xl border border-white/5 bg-white/[0.03] overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                id={`faq-button-${i}`}
                className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left"
              >
                <span className="text-white font-medium text-sm">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-indigo-400 flex-shrink-0 transition-transform duration-200 motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              {isOpen && (
                <div id={`faq-panel-${i}`} role="region" aria-labelledby={`faq-button-${i}`} className="px-4 pb-4">
                  <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </ToolSection>
  )
}