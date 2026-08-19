import { useState } from 'react'
import { Sparkles, Play, Cpu, Zap, Check } from 'lucide-react'
import type { CsvTool } from '@/data/csvData'
import { ToolWrapper, ActionButton, InputField, OutputBox } from './impl/ToolWrapper'
import { runEngine } from '@/lib/ai/engine'
import { analyticsApi } from '@/analytics'

/**
 * Universal production tool engine UI.
 *
 * Every tool that isn't matched by a hand-crafted sub-component (i.e. the
 * majority of the catalog) is routed here. It produces a REAL, deterministic
 * result for ALL tools with zero configuration, and upgrades to a genuine LLM
 * response when VITE_AI_API_KEY is configured on Cloudflare Pages.
 *
 * Includes a copy button, an input area, a mode badge, and loading state.
 */
export function CapabilityTool({ tool }: { tool: CsvTool }) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'ai' | 'local' | null>(null)
  const [copied, setCopied] = useState(false)

  const handleRun = async () => {
    setLoading(true)
    setOutput('')
    const startedAt = Date.now()
    const base = { tool: tool.slug, category: tool.category, source: 'csv' as const }
    analyticsApi.trackToolRun(base)
    try {
      const result = await runEngine(tool, input)
      setOutput(result.output)
      setMode(result.mode)
      analyticsApi.trackToolComplete({ ...base, mode: result.mode, durationMs: Date.now() - startedAt, success: true })
    } catch (err) {
      analyticsApi.trackToolFailed({ ...base, durationMs: Date.now() - startedAt, success: false })
      throw err
    } finally {
      setLoading(false)
    }
  }

  const copyOutput = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    analyticsApi.trackCopy({ tool: tool.slug })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ToolWrapper tool={tool}>
      {/* Mode badge */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2 text-xs">
          {mode === 'ai' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <Sparkles className="w-3 h-3" aria-hidden="true" /> AI powered · LLM response
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Cpu className="w-3 h-3" aria-hidden="true" /> Local engine
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500">{tool.status === 'Generative' ? 'Generative tool' : 'Working tool'}</span>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor={`cap-input-${tool.slug}`} className="block text-sm text-gray-400 mb-2">
            Input for {tool.name}
          </label>
          <textarea
            id={`cap-input-${tool.slug}`}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={
              tool.category === 'Content Writing' || tool.category === 'Education/Learning'
                ? 'Describe your task or paste your content…'
                : 'Enter your data, values, or a description of what you need…'
            }
            className="w-full min-h-[120px] p-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ActionButton onClick={handleRun} icon={loading ? Zap : Play} label={loading ? 'Processing…' : `Run ${tool.name}`} />
          {output && (
            <button
              onClick={copyOutput}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm hover:bg-white/10 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" /> : <Sparkles className="w-4 h-4" aria-hidden="true" />}
              {copied ? 'Copied!' : 'Copy result'}
            </button>
          )}
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-500" role="status">
            <span className="inline-block w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" aria-hidden="true" />
            Computing result…
          </div>
        )}

        {output && <OutputBox value={output} label="Result" />}
      </div>
    </ToolWrapper>
  )
}