/**
 * Tool Intent — search-intent model per tool.
 * Maps a tool to primary/secondary intents + a small set of REAL, relevant sample
 * queries derived from its family + name. Never fabricates unrelated queries.
 */

import type { CsvTool } from '@/data/csvData'
import { mapEveryTool } from '@/data/designCreativeCapabilities'
import { canonicalToolName } from '@/data/designCreativeToolNames'

export type ToolIntent = 'informational' | 'navigational' | 'transactional' | 'problem-solving' | 'how-to' | 'comparison' | 'utility'

export interface ToolIntentModel {
  primary: ToolIntent
  secondary: ToolIntent[]
  sampleQueries: string[]
}

/** Family → realistic queries people actually search. */
const FAMILY_QUERIES: Record<string, string[]> = {
  'image-edit': ['compress image online', 'reduce image file size', 'resize image', 'convert image format', 'compress jpg', 'compress png'],
  color: ['color palette generator', 'color picker', 'hex to rgb', 'contrast checker', 'generate color palette'],
  gradient: ['gradient generator', 'css gradient generator', 'linear gradient', 'radial gradient', 'gradient background'],
  qr: ['qr code generator', 'create qr code', 'url to qr', 'wifi qr code', 'qr code from text'],
  svg: ['svg optimizer', 'minify svg', 'svg viewer', 'validate svg', 'compress svg'],
  meme: ['meme generator', 'make a meme', 'caption generator', 'image meme'],
  drawing: ['online drawing tool', 'sketch pad', 'drawing canvas', 'digital drawing'],
  'canvas-designer': ['poster maker', 'poster generator', 'banner maker', 'social post designer'],
  thumbnail: ['youtube thumbnail maker', 'thumbnail generator', 'video thumbnail', 'thumbnail template'],
  logo: ['logo maker', 'logo generator', 'logo concept', 'text logo'],
  'generative-art': ['generative art', 'procedural art', 'abstract art generator', 'nft art'],
  'model-3d': ['3d model generator'],
}

export function toolIntentModel(tool: CsvTool): ToolIntentModel {
  const family = mapEveryTool(tool.slug, tool.name).family
  const display = canonicalToolName(tool)
  const name = tool.name.toLowerCase()
  const q = FAMILY_QUERIES[family] ?? [`${display.toLowerCase()} tool`, `how to use ${display.toLowerCase()}`]

  // Primary intent by family.
  let primary: ToolIntent = 'utility'
  if (family === 'qr' || family === 'color' || family === 'gradient' || family === 'svg' || family === 'drawing' || family === 'thumbnail') primary = 'utility'
  else if (family === 'image-edit' || family === 'meme') primary = 'problem-solving'
  else if (family === 'logo' || family === 'canvas-designer' || family === 'generative-art') primary = 'transactional'
  else if (/\b(how to|guide|tutorial|tips)\b/.test(name)) primary = 'how-to'
  else if (/\b(best|compare|vs|alternative)\b/.test(name)) primary = 'comparison'

  const secondary: ToolIntent[] = ['informational']
  if (/\b(online|free|download|create|generate)\b/.test(name)) secondary.push('transactional')
  if (/\b(fix|reduce|compress|convert|remove|solve)\b/.test(name)) secondary.push('problem-solving')

  return { primary, secondary: Array.from(new Set(secondary)).slice(0, 3), sampleQueries: q.slice(0, 6) }
}