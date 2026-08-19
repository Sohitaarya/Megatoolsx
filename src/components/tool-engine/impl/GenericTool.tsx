import type { CsvTool } from '@/data/csvData'
import { CapabilityTool } from '../CapabilityTool'

/**
 * Universal fallback for any tool not matched by a hand-crafted sub-component.
 * Delegates to the real capability engine (deterministic algorithms + optional
 * LLM), so EVERY tool in the catalog has genuine functionality — no simulated
 * or placeholder output.
 */
export function GenericTool({ tool }: { tool: CsvTool }) {
  return <CapabilityTool tool={tool} />
}
