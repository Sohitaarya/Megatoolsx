/**
 * Tool OS — Universal Tool Engine.
 *
 * Manages the full tool lifecycle for an unlimited number of tools:
 * register → install → update → enable/disable → remove, all driven by
 * ToolManifest + ToolConfig. No tools are hardcoded. SEO, routing, AI and
 * rendering are derived automatically from the manifest.
 */

import { parseManifest, type ToolManifest } from './manifest'
import { eventBus } from './events'
import { hooks, type HookContext } from './hooks'
import { toolRegistry, type ToolConfigSource } from '@/core/infrastructure/tools/toolRegistry'
import type { ToolConfig } from '@/core/domain/entities'

export interface InstalledTool {
  manifest: ToolManifest
  state: 'installed' | 'enabled' | 'disabled'
  installedAt: string
  updatedAt: string
}

class ToolEngine {
  private tools = new Map<string, InstalledTool>()

  /** Register + install a tool from its manifest. Returns the installed entry. */
  install(raw: unknown): InstalledTool {
    const parsed = parseManifest(raw)
    if (!parsed.ok) throw new Error(`Invalid manifest: ${parsed.errors.join('; ')}`)
    const manifest = parsed.manifest
    awaitHooks('before:install', { slug: manifest.slug, tool: manifest })

    const existing = this.tools.get(manifest.slug)
    const now = new Date().toISOString()
    const entry: InstalledTool = existing
      ? { ...existing, manifest, state: 'enabled', updatedAt: now }
      : { manifest, state: 'enabled', installedAt: now, updatedAt: now }
    this.tools.set(manifest.slug, entry)

    // Push the tool's behaviour config into the capability registry (config-driven).
    this.pushConfig(manifest)

    awaitHooks('after:install', { slug: manifest.slug, tool: manifest })
    eventBus.emit(existing ? 'tool:updated' : 'tool:installed', { slug: manifest.slug, version: manifest.version })
    return entry
  }

  update(slug: string, raw: unknown): InstalledTool {
    if (!this.tools.has(slug)) throw new Error(`Tool not installed: ${slug}`)
    return this.install(raw)
  }

  enable(slug: string): void {
    const t = this.tools.get(slug)
    if (t) { t.state = 'enabled'; this.pushConfig(t.manifest) }
  }

  disable(slug: string): void {
    const t = this.tools.get(slug)
    if (t) { t.state = 'disabled' }
  }

  remove(slug: string): void {
    this.tools.delete(slug)
    eventBus.emit('tool:removed', { slug })
  }

  get(slug: string): InstalledTool | undefined { return this.tools.get(slug) }

  list(): InstalledTool[] { return Array.from(this.tools.values()) }

  count(): number { return this.tools.size }

  /** Enabled manifests only. */
  enabled(): ToolManifest[] {
    return this.list().filter(t => t.state === 'enabled' && t.manifest.enabled !== false).map(t => t.manifest)
  }

  /** Slugs for the dynamic router. */
  slugs(): string[] { return this.list().map(t => t.manifest.slug) }

  /** Convert a manifest into the capability-registry config entry. */
  private toConfig(manifest: ToolManifest): ToolConfig {
    return {
      slug: manifest.slug,
      name: manifest.name,
      category: manifest.category,
      placeholder: undefined,
      enabled: manifest.enabled,
      aiFirst: manifest.ai?.aiFirst,
      capability: manifest.ai?.capability ? { ...manifest.ai.capability } as ToolConfig['capability'] : undefined,
      seo: manifest.seo ? {
        title: manifest.seo.title,
        description: manifest.seo.description,
        image: manifest.seo.image,
      } : undefined,
    }
  }

  private pushConfig(manifest: ToolManifest): void {
    const batch: ToolConfigSource = { [manifest.slug]: this.toConfig(manifest) }
    toolRegistry.load(batch)
  }
}

async function awaitHooks(point: 'before:install' | 'after:install', ctx: HookContext): Promise<void> {
  await hooks.run(point, ctx)
}

/** Global singleton. */
export const toolEngine = new ToolEngine()