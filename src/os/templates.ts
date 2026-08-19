/**
 * Tool OS — Auto Tool Builder.
 *
 * Generate a complete, working tool from a template. This is how new tools are
 * created without touching application code: pick a template + name, get a
 * validated manifest + capability config ready to install.
 */

import type { ToolManifest, ToolKind } from './manifest'

export interface ToolTemplate {
  kind: ToolKind
  label: string
  description: string
  /** Default capability config injected into the registry. */
  capability: { kind: 'ai' | 'utility'; verb: string }
  /** Placeholder hint for the input box. */
  placeholder: string
  /** Build a manifest for a concrete tool name/slug. */
  manifest: (name: string, slug: string, category: string) => ToolManifest
}

export const TOOL_TEMPLATES: Record<ToolKind, ToolTemplate> = {
  calculator: {
    kind: 'calculator', label: 'Calculator', description: 'Numeric calculator with real formulas',
    capability: { kind: 'utility', verb: 'calculate' }, placeholder: 'Enter two numbers, e.g. 25 200',
    manifest: (name, slug, category) => baseManifest(name, slug, category, 'calculator'),
  },
  converter: {
    kind: 'converter', label: 'Converter', description: 'Unit/value converter with real conversion factors',
    capability: { kind: 'utility', verb: 'convert' }, placeholder: 'e.g. 100 km to miles',
    manifest: (name, slug, category) => baseManifest(name, slug, category, 'converter'),
  },
  ai: {
    kind: 'ai', label: 'AI Tool', description: 'AI-natured tool (LLM when configured, deterministic otherwise)',
    capability: { kind: 'ai', verb: 'generate' }, placeholder: 'Describe your task…',
    manifest: (name, slug, category) => ({ ...baseManifest(name, slug, category, 'ai'), ai: { aiFirst: true } }),
  },
  text: {
    kind: 'text', label: 'Text Tool', description: 'Text processing (case, count, codecs, formatting)',
    capability: { kind: 'utility', verb: 'generate' }, placeholder: 'Paste your text…',
    manifest: (name, slug, category) => baseManifest(name, slug, category, 'text'),
  },
  code: {
    kind: 'code', label: 'Developer Tool', description: 'Developer utilities (hash, JSON, regex, generators)',
    capability: { kind: 'utility', verb: 'generate' }, placeholder: 'Paste input to process…',
    manifest: (name, slug, category) => baseManifest(name, slug, category, 'code'),
  },
  seo: {
    kind: 'seo', label: 'SEO Tool', description: 'SEO analysis and content utilities',
    capability: { kind: 'utility', verb: 'analyze' }, placeholder: 'Enter a URL or keyword…',
    manifest: (name, slug, category) => baseManifest(name, slug, category, 'seo'),
  },
  finance: {
    kind: 'finance', label: 'Finance Tool', description: 'Financial calculators (tax, EMI, GST, budget)',
    capability: { kind: 'utility', verb: 'calculate' }, placeholder: 'Enter your numbers…',
    manifest: (name, slug, category) => baseManifest(name, slug, category, 'finance'),
  },
  education: {
    kind: 'education', label: 'Education Tool', description: 'Learning / study / quiz utilities',
    capability: { kind: 'ai', verb: 'generate' }, placeholder: 'Topic or subject…',
    manifest: (name, slug, category) => baseManifest(name, slug, category, 'education'),
  },
  image: {
    kind: 'image', label: 'Image Tool', description: 'Image generation / enhancement (AI)',
    capability: { kind: 'ai', verb: 'generate' }, placeholder: 'Describe the image…',
    manifest: (name, slug, category) => baseManifest(name, slug, category, 'image'),
  },
  video: {
    kind: 'video', label: 'Video Tool', description: 'Video utilities / AI generation',
    capability: { kind: 'ai', verb: 'generate' }, placeholder: 'Describe the video…',
    manifest: (name, slug, category) => baseManifest(name, slug, category, 'video'),
  },
  audio: {
    kind: 'audio', label: 'Audio Tool', description: 'Audio / speech utilities',
    capability: { kind: 'ai', verb: 'generate' }, placeholder: 'Describe the audio task…',
    manifest: (name, slug, category) => baseManifest(name, slug, category, 'audio'),
  },
  pdf: {
    kind: 'pdf', label: 'PDF Tool', description: 'PDF utilities (merge, split, convert, extract)',
    capability: { kind: 'utility', verb: 'generate' }, placeholder: 'Upload or describe…',
    manifest: (name, slug, category) => baseManifest(name, slug, category, 'pdf'),
  },
  document: {
    kind: 'document', label: 'Document Tool', description: 'Document creation and conversion',
    capability: { kind: 'utility', verb: 'generate' }, placeholder: 'Describe the document…',
    manifest: (name, slug, category) => baseManifest(name, slug, category, 'document'),
  },
  ocr: {
    kind: 'ocr', label: 'OCR Tool', description: 'Text extraction from images (provider-backed)',
    capability: { kind: 'utility', verb: 'analyze' }, placeholder: 'Paste image text or upload…',
    manifest: (name, slug, category) => baseManifest(name, slug, category, 'ocr'),
  },
  security: {
    kind: 'security', label: 'Security Tool', description: 'Hashing, password, checksum utilities',
    capability: { kind: 'utility', verb: 'generate' }, placeholder: 'Enter input…',
    manifest: (name, slug, category) => baseManifest(name, slug, category, 'security'),
  },
  developer: {
    kind: 'developer', label: 'Developer Tool', description: 'Developer utilities (hash, JSON, regex, generators)',
    capability: { kind: 'utility', verb: 'generate' }, placeholder: 'Paste input to process…',
    manifest: (name, slug, category) => baseManifest(name, slug, category, 'developer'),
  },
  custom: {
    kind: 'custom', label: 'Custom Tool', description: 'Custom behaviour defined by the manifest',
    capability: { kind: 'ai', verb: 'generate' }, placeholder: 'Describe your task…',
    manifest: (name, slug, category) => baseManifest(name, slug, category, 'custom'),
  },
}

export function templateForName(name: string): ToolTemplate {
  const n = name.toLowerCase()
  if (/\b(calculator|calc)\b/.test(n)) return TOOL_TEMPLATES.calculator
  if (/\b(converter|convert|to )\b/.test(n)) return TOOL_TEMPLATES.converter
  if (/\b(hash|password|checksum|encrypt|decrypt)\b/.test(n)) return TOOL_TEMPLATES.security
  if (/\b(pdf)\b/.test(n)) return TOOL_TEMPLATES.pdf
  if (/\b(ocr|extract.*text)\b/.test(n)) return TOOL_TEMPLATES.ocr
  if (/\b(json|regex|sql|api|code|css|html|minif)\b/.test(n)) return TOOL_TEMPLATES.code
  if (/\b(seo|keyword|rank|meta)\b/.test(n)) return TOOL_TEMPLATES.seo
  if (/\b(tax|gst|emi|budget|invoice|finance|loan|interest)\b/.test(n)) return TOOL_TEMPLATES.finance
  if (/\b(lesson|course|flashcard|quiz|study|exam|tutor|translator)\b/.test(n)) return TOOL_TEMPLATES.education
  if (/\b(video)\b/.test(n)) return TOOL_TEMPLATES.video
  if (/\b(audio|voice|music|speech)\b/.test(n)) return TOOL_TEMPLATES.audio
  if (/\b(image|photo|logo|thumbnail)\b/.test(n)) return TOOL_TEMPLATES.image
  if (/\b(ai|generator|writer|assistant|bot)\b/.test(n)) return TOOL_TEMPLATES.ai
  return TOOL_TEMPLATES.custom
}

function baseManifest(name: string, slug: string, category: string, kind: ToolKind): ToolManifest {
  const id = `org.megatoolsx.${slug}`
  return {
    schema: '1',
    id,
    slug,
    name,
    description: `${name} — a ${kind} tool on MegatoolsX.`,
    version: '1.0.0',
    author: 'MegatoolsX',
    license: 'MIT',
    tags: [kind, category, name.toLowerCase()],
    category,
    enabled: true,
    routes: { main: `/tools/${slug}` },
  }
}

/** Slugify a tool name into a URL slug. */
export function slugifyToolName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}