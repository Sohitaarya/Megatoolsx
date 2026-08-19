import type { CsvTool } from '@/data/csvData'
import { buildToolContent } from '@/seo/content/toolContent'
import { ToolSection } from './ToolSection'

/**
 * Tool Page — description block, family-aware. Uses the content engine so each
 * family (image/color/qr/svg/design/…) gets real, distinct copy instead of
 * identical filler. Progressive: overview → purpose → how it works → features →
 * use cases → privacy.
 */
export function ToolDescription({ tool }: { tool: CsvTool }) {
  const content = buildToolContent(tool)
  const intro = tool.description

  return (
    <div className="space-y-6">
      <ToolSection title={`What is ${tool.name}?`}>
        <p className="text-gray-300 leading-relaxed">{intro}</p>
        <p className="text-gray-400 text-sm mt-2">{content.intro} {content.purpose}</p>
      </ToolSection>

      <ToolSection title="How it works">
        <p className="text-gray-300 leading-relaxed text-sm">{content.howItWorks}</p>
      </ToolSection>

      <ToolSection title="Key features">
        <ul className="grid sm:grid-cols-2 gap-2">
          {content.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
              <span className="text-emerald-500 mt-0.5" aria-hidden="true">✓</span>{f}
            </li>
          ))}
        </ul>
      </ToolSection>

      <ToolSection title="Common use cases">
        <div className="flex flex-wrap gap-2">
          {content.useCases.map((u, i) => (
            <span key={i} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300">{u}</span>
          ))}
        </div>
      </ToolSection>

      <ToolSection title="Privacy">
        <p className="text-sm text-gray-400">{content.privacy}</p>
      </ToolSection>

      {content.limitations.length > 0 && (
        <ToolSection title="Limitations">
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
            {content.limitations.map((l, i) => <li key={i}>{l}</li>)}
          </ul>
        </ToolSection>
      )}
    </div>
  )
}