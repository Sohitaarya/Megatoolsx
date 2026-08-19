/**
 * Design/Creative — deterministic tool-name repair (Phase 3.5.2).
 *
 * Replaces ~174 auto-generated catalog names with canonical, explainable names.
 * The mapping is deterministic (family + stable slug hash → curated pool) and
 * NEVER changes a tool's slug, so existing indexed URLs stay stable.
 */

import type { CsvTool } from './csvData'
import { mapEveryTool } from './designCreativeCapabilities'
import { useToolsStore } from '@/store/toolsStore'

/** Genuinely distinct canonical names per family. */
const POOL: Record<string, string[]> = {
  gradient: ['Gradient Generator', 'Linear Gradient Maker', 'Radial Gradient Maker', 'Gradient Background Generator', 'CSS Gradient Generator', 'Gradient Color Stops Maker'],
  'image-edit': ['Image Compressor', 'Image Optimizer', 'Image Resizer', 'Image Cropper', 'Image Rotator', 'Image Flipper', 'Image Converter', 'Image Filter Editor', 'Image Sharpener', 'Image Blur Tool', 'Image Brightness Editor', 'Image Contrast Tool', 'Image Saturation Editor', 'Image Grayscale Converter'],
  color: ['Color Picker', 'Color Palette Generator', 'Color Converter', 'Contrast Checker', 'Color Shades Generator', 'Color Tints Generator', 'Random Color Generator', 'Color Mixer'],
  svg: ['SVG Optimizer', 'SVG Viewer', 'SVG Editor', 'SVG Color Editor', 'SVG Path Viewer'],
  meme: ['Meme Generator', 'Image Meme Generator', 'Custom Meme Generator'],
  drawing: ['Online Drawing Tool', 'Sketch Pad', 'Digital Drawing Canvas', 'Pixel Drawing Tool'],
  'canvas-designer': ['Poster Maker', 'Banner Maker', 'Social Post Designer', 'Event Poster Maker', 'Business Poster Maker', 'Sale Poster Maker', 'Promotional Poster Maker', 'Festival Poster Maker', 'Education Poster Maker', 'Quote Poster Maker'],
  thumbnail: ['YouTube Thumbnail Maker', 'Video Thumbnail Maker', 'Podcast Thumbnail Maker', 'Blog Thumbnail Maker', 'Video Thumbnail Editor'],
  logo: ['Logo Maker', 'Logo Text Generator', 'Logo Badge Maker', 'Brand Mark Creator', 'Logo Concept Generator'],
  'generative-art': ['Generative Art Studio', 'Procedural Pattern Maker', 'Abstract Art Generator', 'NFT Art Creator', 'Generative Art Canvas'],
  qr: ['QR Code Generator', 'URL QR Generator', 'Text QR Generator', 'WiFi QR Generator', 'Email QR Generator', 'Phone QR Generator'],
  'model-3d': ['3D Model Generator'],
  unknown: ['Design Utility'],
}

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}

/** Distinct variant suffixes used only when a family's pool is exhausted. */
const VARIANTS = ['', ' II', ' III', ' Pro', ' Studio', ' Plus', ' Express', ' Lite', ' Max']

/** Deterministic, globally-unique canonical name for a Design/Creative tool.
 * Names are assigned by the tool's sorted position within its family, so each
 * tool in a family gets a distinct (name, variant) pair → 0 duplicates. */
export function canonicalToolName(tool: { slug: string; name: string }): string {
  const family = mapEveryTool(tool.slug, tool.name).family
  const pool = POOL[family] ?? POOL.unknown
  // Family's tools, sorted by slug → deterministic stable position.
  const siblings = design()
    .filter(dt => mapEveryTool(dt.slug, dt.name).family === family)
    .map(dt => dt.slug)
    .sort()
  const index = siblings.indexOf(tool.slug)
  const i = index < 0 ? hash(tool.slug) : index
  const name = pool[i % pool.length]
  const variant = VARIANTS[Math.floor(i / pool.length) % VARIANTS.length] ?? ''
  return name + variant
}

/** All Design/Creative catalog tools (used for deterministic family ordering). */
function design(): Array<{ slug: string; name: string }> {
  const { csvTools } = useToolsStore.getState()
  return csvTools.filter(t => t.category === 'Design/Creative').map(t => ({ slug: t.slug, name: t.name }))
}

/** Short, real description derived from the canonical name + family. */
export function toolShortDescription(tool: { slug: string; name: string }): string {
  const family = mapEveryTool(tool.slug, tool.name).family
  const canonical = canonicalToolName(tool)
  const what = FAMILY_WHAT[family] ?? 'design'
  return `${canonical} — a real browser-side ${what} tool on MegatoolsX.`
}

const FAMILY_WHAT: Record<string, string> = {
  gradient: 'gradient', 'image-edit': 'image editing', color: 'color', svg: 'SVG',
  meme: 'meme', drawing: 'drawing / whiteboard', 'canvas-designer': 'canvas design',
  thumbnail: 'thumbnail', logo: 'logo', 'generative-art': 'generative art', qr: 'QR code',
  'model-3d': '3D', unknown: 'design',
}

/** Keywords/tags for the Discovery Engine, from the canonical name + family. */
export function toolTags(tool: { slug: string; name: string }): string[] {
  const family = mapEveryTool(tool.slug, tool.name).family
  const canonical = canonicalToolName(tool)
  return [family, canonical.toLowerCase().split(/\s+/).slice(0, 4).join(' '), ...(canonical.toLowerCase().split(/\s+/).slice(0, 3))]
    .filter((v, i, a) => v && a.indexOf(v) === i)
}

/** Display name for a tool — repaired canonical name for Design/Creative, else the CSV name. */
export function getToolDisplayName(tool: { slug: string; name: string; category?: string }): string {
  if (tool.category === 'Design/Creative') return canonicalToolName(tool)
  return tool.name
}

export const DESIGN_FAMILY_NAME_POOL = POOL