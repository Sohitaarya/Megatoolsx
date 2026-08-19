/**
 * Related Searches — deterministic engine.
 * Derives real, relevant related-search queries from a tool's family + name.
 * Never fabricated volume; these link to the real /tools?q= search page.
 */

import type { CsvTool } from '@/data/csvData'
import { mapEveryTool } from '@/data/designCreativeCapabilities'
import { canonicalToolName } from '@/data/designCreativeToolNames'
import { toolIntentModel } from '@/seo/intent/toolIntent'

const FAMILY_EXTRA: Record<string, string[]> = {
  'image-edit': ['image resizer', 'image converter', 'image cropper', 'photo compressor'],
  color: ['gradient generator', 'contrast checker', 'color shades'],
  gradient: ['color palette', 'mesh gradient', 'gradient background'],
  qr: ['url to qr', 'wifi qr', 'email qr'],
  svg: ['svg viewer', 'svg editor', 'png to svg'],
  meme: ['caption generator', 'image meme'],
  drawing: ['sketch pad', 'pixel art'],
  'canvas-designer': ['flyer maker', 'banner maker', 'event poster'],
  thumbnail: ['video thumbnail', 'podcast thumbnail', 'youtube banner'],
  logo: ['logo text', 'brand mark', 'logo badge'],
  'generative-art': ['procedural pattern', 'abstract art'],
  'model-3d': ['3d preview'],
}

/** Related searches for a tool (family + intent derived). */
export function relatedQueriesForTool(tool: CsvTool): string[] {
  const family = mapEveryTool(tool.slug, tool.name).family
  const intent = toolIntentModel(tool)
  const display = canonicalToolName(tool).toLowerCase()
  return Array.from(new Set([...intent.sampleQueries, ...(FAMILY_EXTRA[family] ?? []), display])).slice(0, 8)
}

/** Link path for a related search — the real, working ToolFeed search page. */
export function relatedSearchUrl(query: string): string {
  return `/tools?q=${encodeURIComponent(query)}`
}