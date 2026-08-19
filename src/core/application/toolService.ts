/**
 * Tool application service — orchestrates the registry, repository and engine.
 * The UI depends on this service, never on the raw CSV or engine internals.
 */

import type { CategoryEntity, ToolEntity } from '@/core/domain/entities'
import type { IToolRepository } from '@/core/domain/repositories'
import { NotFoundError, ValidationError } from '@/core/errors/appError'
import { resolveCapability, toolRegistry } from '@/core/infrastructure/tools/toolRegistry'
import { logger } from '@/core/infrastructure/logging/logger'

export interface RunToolInput {
  slug: string
  input: string
}

export interface RunToolResult {
  output: string
  mode: 'ai' | 'local'
  capabilityKind: 'ai' | 'utility'
}

export class ToolService {
  private repo: IToolRepository
  constructor(repo: IToolRepository) { this.repo = repo }

  async list(): Promise<ToolEntity[]> {
    const tools = await this.repo.list()
    return tools
  }

  async getBySlug(slug: string): Promise<ToolEntity> {
    const tool = await this.repo.findBySlug(slug)
    if (!tool) throw new NotFoundError(`Tool not found: ${slug}`)
    return tool
  }

  async categories(): Promise<CategoryEntity[]> {
    const tools = await this.repo.list()
    const map = new Map<string, number>()
    for (const t of tools) map.set(t.category, (map.get(t.category) ?? 0) + 1)
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), count }))
      .sort((a, b) => b.count - a.count)
  }

  /** Run any tool by slug through the capability engine (AI-first, local fallback). */
  async run({ slug, input }: RunToolInput): Promise<RunToolResult> {
    const tool = await this.getBySlug(slug)
    if (input.length > 20000) throw new ValidationError('Input too large (max 20,000 chars)')

    const capability = resolveCapability(tool)
    const { runEngine } = await import('@/lib/ai/engine')
    const result = await runEngine(tool, input)

    logger.debug('[tools] run complete', { slug, mode: result.mode, kind: capability.kind })
    return { ...result, capabilityKind: capability.kind }
  }

  /** List tools explicitly configured in the registry (for admin/debug). */
  configuredTools() {
    return toolRegistry.list().map(c => ({ slug: c.slug, enabled: c.enabled ?? true }))
  }
}

/** Repository-backed helpers for the app layer. */
export function makeToolService(repo: IToolRepository): ToolService {
  return new ToolService(repo)
}