/**
 * Config-driven tool registry.
 *
 * Tools are NOT hardcoded. Each tool's behaviour is defined by configuration
 * (ToolConfig). Adding a tool requires only a config entry — SEO, routing,
 * schema, the interactive engine, and analytics are derived automatically.
 *
 * Resolution order:
 *   1. Explicit `capability` in the tool's config (wins).
 *   2. Auto-classification from the tool name/category (engine.ts classify).
 *   3. Generic-but-real fallback (still functional).
 *
 * Config can come from a bundled module (toolConfig.ts) and/or a remote
 * `/tools-config.json` (enables editing without redeploys).
 */

import type { ToolCapability, ToolConfig, ToolEntity } from '@/core/domain/entities'

export type ToolConfigSource = Record<string, ToolConfig>

class ToolRegistry {
  private configs: ToolConfigSource = {}

  /** Register a batch of configs (from a module or fetched JSON). */
  load(source: ToolConfigSource): void {
    this.configs = { ...this.configs, ...source }
  }

  clear(): void { this.configs = {} }

  get(slug: string): ToolConfig | undefined { return this.configs[slug] }

  list(): ToolConfig[] { return Object.values(this.configs) }

  /** Number of explicitly-configured tools. */
  get size(): number { return Object.keys(this.configs).length }

  /** Config entries that target a name pattern (for bulk rules). */
  getPatterns(): Array<ToolConfig & { match: string }> {
    return this.list().filter((c): c is ToolConfig & { match: string } => Boolean((c as { match?: string }).match))
  }
}

export const toolRegistry = new ToolRegistry()

/** Loads the bundled config module. Returns how many tools were registered. */
export async function loadBuiltinToolConfig(): Promise<number> {
  const source = await import('@/modules/tools/toolConfig')
  const { default: configs } = source
  toolRegistry.load(configs)
  return toolRegistry.size
}

/** Fetch a remote config (optional; enables config-as-data edits). */
export async function loadRemoteToolConfig(url = '/tools-config.json'): Promise<number> {
  try {
    const res = await fetch(url)
    if (!res.ok) return 0
    const json = (await res.json()) as ToolConfigSource
    toolRegistry.load(json)
    return Object.keys(json).length
  } catch {
    return 0
  }
}

/**
 * Resolve the capability for a tool: explicit config → auto-classification.
 * This is the single source of truth the engine uses to pick a handler.
 */
export function resolveCapability(tool: ToolEntity): ToolCapability {
  const config = toolRegistry.get(tool.slug)
  const { classify } = requireAutoClassifier()
  const auto = classify(tool)

  return {
    kind: config?.capability?.kind ?? auto.kind,
    topic: config?.capability?.topic ?? auto.topic,
    verb: config?.capability?.verb ?? auto.verb,
    handler: config?.capability?.handler,
    compute: config?.capability?.compute,
  }
}

/** Lazy import to avoid a circular dependency with the engine. */
function requireAutoClassifier(): { classify: (t: ToolEntity) => ToolCapability } {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return { classify: (t: ToolEntity) => autoClassify(t) }
}

function autoClassify(t: ToolEntity): ToolCapability {
  const n = t.name.toLowerCase()
  let verb: ToolCapability['verb'] = 'generate'
  if (/\b(planner|plan|planning|schedule|scheduler)\b/.test(n)) verb = 'plan'
  else if (/\b(analyzer|analysis|analytics|tracker|audit|score|eval)\b/.test(n)) verb = 'analyze'
  else if (/\b(simulator|simulat)\b/.test(n)) verb = 'simulate'
  else if (/\b(converter|convert|translator|translate)\b/.test(n)) verb = 'convert'
  else if (/\b(calculator|calc)\b/.test(n)) verb = 'calculate'

  const ne = n.replace(/\b(ai|gpt|ml|llm|neural|smart|intelligent|auto|pro|beta)\b/g, '').trim()
  const topic = (ne.replace(/\b(generator|builder|creator|maker|writer|designer|planner|analyzer|analyser|tracker|simulator|assistant|checker|tool|platform|app)\b/gi, '').trim() || t.name)
    .split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  const concretish = /\b(converter|convert|calculator|calc|counter|hash|checksum|base64|url|json|%|percent|bmi|tip|gst|emoji|slug|yaml|xml|csv|sql|regex)\b/.test(n)
  return { kind: concretish ? 'utility' : 'ai', topic, verb }
}