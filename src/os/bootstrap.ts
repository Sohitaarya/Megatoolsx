/**
 * Tool OS — bootstrap.
 *
 * Registers every tool from the CSV as an installed ToolManifest in the Tool
 * Engine at startup, so "unlimited tools" all flow through the same lifecycle,
 * routing and SEO derivation — even though the CSV is just a flat file. Explicit
 * behaviour overrides still come from the config registry.
 */

import { toolEngine } from './toolEngine'
import { eventBus } from './events'
import type { ToolManifest } from './manifest'
import { useToolsStore } from '@/store/toolsStore'
import { logger } from '@/core/infrastructure/logging/logger'

function toManifest(tool: { name: string; slug: string; category: string; description: string; status?: string; seoKeywords?: string }): ToolManifest {
  const id = `org.megatoolsx.${tool.slug}`
  return {
    schema: '1',
    id,
    slug: tool.slug,
    name: tool.name,
    description: tool.description,
    version: '1.0.0',
    author: 'MegatoolsX',
    license: 'MIT',
    tags: [tool.category, ...(tool.seoKeywords?.split(',').map(k => k.trim()).filter(Boolean) ?? [])],
    keywords: tool.seoKeywords?.split(',').map(k => k.trim()) ?? [],
    category: tool.category,
    status: (tool.status as ToolManifest['status']) ?? 'Present',
    routes: { main: `/tools/${tool.slug}` },
    seo: { keywords: tool.seoKeywords },
  }
}

/**
 * Waits for the CSV dataset to load, then installs every tool into the OS.
 * Returns the number of tools registered. Safe to call once.
 */
export async function bootstrapToolOS(): Promise<number> {
  // Wait for the async dataset.
  if (useToolsStore.getState().status !== 'ready') {
    await new Promise<void>(resolve => {
      const unsub = useToolsStore.subscribe(state => {
        if (state.status === 'ready') { unsub(); resolve() }
        if (state.status === 'error') { unsub(); resolve() }
      })
    })
  }

  const tools = useToolsStore.getState().csvTools
  if (!tools.length) return 0

  for (const tool of tools) {
    try {
      toolEngine.install(toManifest(tool))
    } catch {
      // A tool with an invalid/unexpected field is skipped, not fatal.
    }
  }

  logger.info('[os] bootstrap complete', { tools: toolEngine.count() })
  eventBus.emit('analytics:event', { name: 'os:bootstrap', props: { tools: toolEngine.count() } })
  return toolEngine.count()
}