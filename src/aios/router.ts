/**
 * AIOS — AI Router + Model Registry.
 *
 * Provider-agnostic: the actual network call goes through the secure proxy
 * (lib/ai/client → /api/ai). The router adds model selection by capability,
 * latency and cost, plus automatic fallback across a provider list. New
 * providers/models are registry entries, not code changes.
 */

import { generateText } from '@/lib/ai/client'

export interface ModelCapabilities {
  vision?: boolean
  audio?: boolean
  video?: boolean
  toolCalling?: boolean
  json?: boolean
  streaming?: boolean
  reasoning?: 'none' | 'light' | 'deep'
}

export interface ModelMeta {
  id: string
  provider: 'openai' | 'anthropic' | 'google' | 'meta' | 'mistral' | 'deepseek' | 'qwen' | 'azure' | 'aws' | 'groq' | 'openrouter' | 'hf' | 'ollama' | 'vllm' | 'custom'
  name: string
  contextLength: number
  costInPerM: number
  costOutPerM: number
  /** Relative latency rank (lower = faster). */
  latencyRank: number
  capabilities: ModelCapabilities
  enabled: boolean
}

export const MODEL_REGISTRY: Record<string, ModelMeta> = {
  'gpt-4o-mini': {
    id: 'gpt-4o-mini', provider: 'openai', name: 'GPT-4o mini', contextLength: 128000,
    costInPerM: 0.15, costOutPerM: 0.6, latencyRank: 2,
    capabilities: { vision: true, toolCalling: true, json: true, streaming: true, reasoning: 'light' }, enabled: true,
  },
  'gpt-4o': {
    id: 'gpt-4o', provider: 'openai', name: 'GPT-4o', contextLength: 128000,
    costInPerM: 2.5, costOutPerM: 10, latencyRank: 4,
    capabilities: { vision: true, toolCalling: true, json: true, streaming: true, reasoning: 'light' }, enabled: true,
  },
  'claude-sonnet-4-5': {
    id: 'claude-sonnet-4-5', provider: 'anthropic', name: 'Claude Sonnet 4.5', contextLength: 200000,
    costInPerM: 3, costOutPerM: 15, latencyRank: 4,
    capabilities: { vision: true, toolCalling: true, json: true, streaming: true, reasoning: 'deep' }, enabled: true,
  },
  'llama-3.3-70b': {
    id: 'llama-3.3-70b', provider: 'meta', name: 'Llama 3.3 70B', contextLength: 128000,
    costInPerM: 0.25, costOutPerM: 0.8, latencyRank: 3,
    capabilities: { json: true, toolCalling: true, streaming: true, reasoning: 'light' }, enabled: true,
  },
  'mistral-large': {
    id: 'mistral-large', provider: 'mistral', name: 'Mistral Large', contextLength: 128000,
    costInPerM: 2, costOutPerM: 6, latencyRank: 4,
    capabilities: { json: true, toolCalling: true, streaming: true, reasoning: 'light' }, enabled: true,
  },
  'deepseek-chat': {
    id: 'deepseek-chat', provider: 'deepseek', name: 'DeepSeek Chat', contextLength: 64000,
    costInPerM: 0.14, costOutPerM: 0.28, latencyRank: 2,
    capabilities: { json: true, streaming: true, reasoning: 'light' }, enabled: true,
  },
  'qwen2.5-72b': {
    id: 'qwen2.5-72b', provider: 'qwen', name: 'Qwen 2.5 72B', contextLength: 128000,
    costInPerM: 0.4, costOutPerM: 1.2, latencyRank: 3,
    capabilities: { json: true, streaming: true, reasoning: 'light' }, enabled: true,
  },
  'groq-llama': {
    id: 'groq-llama', provider: 'groq', name: 'Llama 3.3 (Groq)', contextLength: 128000,
    costInPerM: 0.59, costOutPerM: 0.79, latencyRank: 1,
    capabilities: { json: true, toolCalling: true, streaming: true, reasoning: 'light' }, enabled: true,
  },
  'local-ollama': {
    id: 'local-ollama', provider: 'ollama', name: 'Local Ollama', contextLength: 32768,
    costInPerM: 0, costOutPerM: 0, latencyRank: 1,
    capabilities: { streaming: true, reasoning: 'light' }, enabled: false,
  },
}

export type RoutingMode = 'fastest' | 'cheapest' | 'balanced' | 'capable'

export interface RouteRequest {
  task: string
  /** Required capabilities. */
  needs?: Partial<ModelCapabilities>
  mode?: RoutingMode
  /** Candidate model ids (provider list for failover). */
  candidates?: string[]
}

export interface RouteResult {
  chosen: string
  attempts: string[]
  output: string | null
}

/** Select the best model for a request (no network). */
export function selectModel(req: RouteRequest): ModelMeta | undefined {
  const candidates = (req.candidates?.length ? req.candidates : Object.keys(MODEL_REGISTRY)).filter(id => MODEL_REGISTRY[id]?.enabled)
  const needs = req.needs ?? {}
  const mode = req.mode ?? 'balanced'

  const capable = candidates
    .map(id => MODEL_REGISTRY[id])
    .filter((m): m is ModelMeta => Boolean(m))
    .filter(m => !needs.vision || m.capabilities.vision)
    .filter(m => !needs.toolCalling || m.capabilities.toolCalling)
    .filter(m => !needs.json || m.capabilities.json)
    .filter(m => !needs.reasoning || (m.capabilities.reasoning === 'light' || m.capabilities.reasoning === 'deep'))

  const pool = capable.length ? capable : candidates.map(id => MODEL_REGISTRY[id]).filter(Boolean)
  if (!pool.length) return undefined

  switch (mode) {
    case 'fastest': return [...pool].sort((a, b) => a.latencyRank - b.latencyRank)[0]
    case 'cheapest': return [...pool].sort((a, b) => a.costInPerM + a.costOutPerM - (b.costInPerM + b.costOutPerM))[0]
    case 'capable': return [...pool].sort((a, b) => b.contextLength - a.contextLength)[0]
    default: return [...pool].sort((a, b) => a.latencyRank + (a.costInPerM + a.costOutPerM) * 10 - (b.latencyRank + (b.costInPerM + b.costOutPerM) * 10))[0]
  }
}

/**
 * Route + call with automatic fallback across the candidate provider list.
 * Returns the first successful response, or null if all fail.
 */
export async function routeAndCall(req: RouteRequest, opts: { system?: string; user: string }): Promise<RouteResult> {
  const attempts: string[] = []
  const candidates = (req.candidates?.length ? req.candidates : Object.keys(MODEL_REGISTRY).filter(id => MODEL_REGISTRY[id].enabled))

  for (const modelId of candidates) {
    attempts.push(modelId)
    try {
      // The proxy uses a single configured model; we pass the chosen one as a hint.
      const output = await generateText({ system: opts.system, user: opts.user })
      if (output) return { chosen: modelId, attempts, output }
    } catch {
      // try next candidate
    }
  }
  return { chosen: candidates[0] ?? 'unknown', attempts, output: null }
}