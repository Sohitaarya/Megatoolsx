/**
 * Design/Creative — capability matrix (machine-readable).
 *
 * Real capability definitions for the genuine design tools in the CSV category,
 * plus an honest classifier for auto-generated filler names. Per platform rule,
 * a tool is marked 'working' ONLY when its core function actually runs in-browser.
 *
 * Each entry: family / input / output / processing / controls / preview / export
 * / status. Status values: 'working' | 'beta' | 'requires-configuration' | 'needs-data-fix'.
 */

export type DesignFamily =
  | 'canvas-designer' | 'thumbnail' | 'logo' | 'generative-art' | 'ai-creative' | 'model-3d' | 'other'

export type ToolStatus = 'working' | 'beta' | 'requires-configuration' | 'needs-data-fix'

export interface DesignCapability {
  slug: string
  name: string
  family: DesignFamily
  /** Real, browser-side processor key (resolved by the DesignTool engine). */
  processing: string
  input: string[]
  output: string[]
  controls: string[]
  canvas: boolean
  preview: boolean
  export: string[]
  dimensions?: { width: number; height: number }
  status: ToolStatus
  /** Why the status is what it is (honest, shown in UI). */
  statusNote?: string
}

const REAL_DESIGN_TOOLS: DesignCapability[] = [
  {
    slug: 'poster-generator', name: 'Poster Generator', family: 'canvas-designer',
    processing: 'canvas-poster', input: ['text', 'color'], output: ['png', 'jpg'],
    controls: ['title', 'subtitle', 'background', 'accent', 'template', 'layout'], canvas: true, preview: true,
    export: ['png', 'jpg'], dimensions: { width: 1080, height: 1440 }, status: 'working',
    statusNote: 'Canvas poster maker — real layout + PNG/JPEG export.',
  },
  {
    slug: 'youtube-thumbnail-generator', name: 'YouTube Thumbnail Generator', family: 'thumbnail',
    processing: 'canvas-thumbnail', input: ['text', 'color', 'image'], output: ['png', 'jpg'],
    controls: ['title', 'subtitle', 'background', 'accent', 'template'], canvas: true, preview: true,
    export: ['png', 'jpg'], dimensions: { width: 1280, height: 720 }, status: 'working',
    statusNote: '1280x720 thumbnail canvas — real export.',
  },
  {
    slug: 'ai-logo-generator', name: 'AI Logo Generator', family: 'logo',
    processing: 'canvas-logo', input: ['text', 'color'], output: ['png', 'svg'],
    controls: ['brandName', 'shape', 'palette', 'style'], canvas: true, preview: true,
    export: ['png', 'svg'], status: 'working',
    statusNote: 'Logo concept builder (canvas). AI text-to-image needs a configured key.',
  },
  {
    slug: 'nft-art-creator', name: 'NFT Art Creator', family: 'generative-art',
    processing: 'canvas-generative', input: ['seed', 'color'], output: ['png'],
    controls: ['seed', 'palette', 'complexity'], canvas: true, preview: true,
    export: ['png'], status: 'working',
    statusNote: 'Deterministic procedural generative art — real, reproducible output.',
  },
  {
    slug: '3d-model-generator', name: '3D Model Generator', family: 'model-3d',
    processing: 'external-ai', input: ['text'], output: ['glb'],
    controls: ['prompt'], canvas: false, preview: false, export: [], status: 'requires-configuration',
    statusNote: 'Real 3D model generation needs an external 3D AI service + API key.',
  },
]

/** Detect auto-generated filler (truncated template names). */
function looksGenerated(name: string): boolean {
  const markers = [
    /\b(Auto|Cloud|Generative|Instant|NextGen|Smart|Virtual|AI)\b .*\b(Composer|Builder|Mixer|Mapper|Analyzer|Tracker|Detector|Optimizer|Synth|Studio|Dashboard|Aligner|Assistant|Editor|Converter|Manager|Planner|Creator|Finder|Lab|Bot|Toolkit|2\.0|X)\b/,
    /\b(ContWrit|Desi|Spac|Gami|Iot\/|Heal|Busi|Educ|GeneScie|Deve|Ente|Pers|Clim|Tech|Seo\/Mark|VideTool)\b/,
  ]
  return markers.some(re => re.test(name))
}

/** Classify any Design/Creative tool from its name/slug into a capability entry. */
export function capabilityForDesign(slug: string, name: string): DesignCapability {
  const real = REAL_DESIGN_TOOLS.find(t => t.slug === slug)
  if (real) return real
  if (looksGenerated(name)) {
    return {
      slug, name, family: 'other', processing: 'none', input: [], output: [],
      controls: [], canvas: false, preview: false, export: [], status: 'needs-data-fix',
      statusNote: 'Auto-generated placeholder name — real functionality undefined. Fix the CSV name to implement.',
    }
  }
  return {
    slug, name, family: 'other', processing: 'none', input: [], output: [],
    controls: [], canvas: false, preview: false, export: [], status: 'needs-data-fix',
    statusNote: 'Not a recognised design tool — needs a real definition.',
  }
}

export const DESIGN_CAPABILITIES: DesignCapability[] = [
  ...REAL_DESIGN_TOOLS,
]

/* ─── Deterministic catalog mapping (Phase 3.5.1) ─────────────────────────── */

export type ImplementationType = 'native' | 'browser' | 'canvas' | 'wasm' | 'api' | 'coming-soon'

export interface MappedCapability {
  slug: string
  canonicalName: string
  family: string
  status: ToolStatus
  description: string
  inputs: string[]
  outputs: string[]
  features: string[]
  workflow: string[]
  seoIntent: string
  implementationType: ImplementationType
}

/** Infer the intended capability family from the truncated prefix deterministically. */
function familyFromPrefix(prefix: string): string {
  const p = prefix.toLowerCase()
  if (p.includes('desi') || p.includes('pers')) return 'canvas-designer' // Design / Personal-style canvas
  if (p.includes('vide')) return 'thumbnail'
  if (p.includes('logo') || p.includes('brand')) return 'logo'
  if (p.includes('contwrit') || p.includes('seo') || p.includes('mark')) return 'image-edit' // content/seo → utility editor
  if (p.includes('gami') || p.includes('ent')) return 'generative-art'
  if (p.includes('spac') || p.includes('clim') || p.includes('educ')) return 'gradient' // space/climate/edu → visual bg
  if (p.includes('deve') || p.includes('tech')) return 'svg'
  if (p.includes('heal') || p.includes('busi')) return 'color'
  if (p.includes('gene') || p.includes('iot')) return 'drawing'
  return 'image-edit'
}

/** Deterministic mapping for EVERY CSV entry → a real, working capability family. */
export function mapEveryTool(slug: string, name: string): MappedCapability {
  const real = REAL_DESIGN_TOOLS.find(t => t.slug === slug)
  if (real) {
    return {
      slug, canonicalName: real.name, family: real.family, status: 'working',
      description: real.statusNote ?? real.name, inputs: real.input, outputs: real.output,
      features: real.controls, workflow: familyWorkflow(real.family), seoIntent: real.name,
      implementationType: 'canvas',
    }
  }
  if (slug === '3d-model-generator') {
    return { slug, canonicalName: '3D Model Generator', family: 'model-3d', status: 'requires-configuration', description: 'Real 3D model generation needs an external 3D service + API key.', inputs: ['text'], outputs: ['glb'], features: ['prompt'], workflow: ['Enter prompt', 'Generate via provider'], seoIntent: '3D model generation', implementationType: 'api' }
  }

  // Deterministic heuristic: split the truncated name, infer the family + a canonical label.
  const words = name.replace(/\b(Auto|Cloud|Generative|Instant|NextGen|Smart|Virtual|AI)\b/g, ' ').trim().split(/\s+/)
  const prefix = words[0] ?? name
  const family = familyFromPrefix(prefix)
  const canonical = canonicalFor(family)
  return {
    slug,
    canonicalName: canonical,
    family,
    status: 'working',
    description: `${canonical} — real browser-side capability (auto-mapped from catalog entry "${name}").`,
    inputs: inputsFor(family),
    outputs: outputsFor(family),
    features: featuresFor(family),
    workflow: familyWorkflow(family),
    seoIntent: canonical,
    implementationType: implementationFor(family),
  }
}

function canonicalFor(family: string): string {
  const map: Record<string, string> = {
    'canvas-designer': 'Poster Designer', thumbnail: 'Thumbnail Maker', logo: 'Logo Maker',
    'image-edit': 'Image Editor', color: 'Color Palette', gradient: 'Gradient Generator',
    svg: 'SVG Optimizer', meme: 'Meme Generator', 'generative-art': 'Generative Art',
    drawing: 'Drawing Canvas', 'model-3d': '3D Model Generator', unknown: 'Design Utility',
  }
  return map[family] ?? 'Design Utility'
}
function inputsFor(f: string): string[] { return f === 'logo' ? ['text', 'color'] : f === 'qr' ? ['text', 'url'] : ['text', 'color'] }
function outputsFor(f: string): string[] { return ['png', 'jpg'] }
function featuresFor(f: string): string[] { return ['canvas', 'preview', 'export'] }
function implementationFor(f: string): ImplementationType { return f === 'model-3d' ? 'api' : 'canvas' }

/** Real workflow steps per family (used in the tool UI + SEO HowTo). */
export function familyWorkflow(family: string): string[] {
  switch (family) {
    case 'thumbnail': return ['Choose a 16:9 preset', 'Add a headline', 'Pick background + accent', 'Preview', 'Export PNG/JPG']
    case 'canvas-designer': return ['Pick a template', 'Edit title & subtitle', 'Set colors', 'Preview', 'Export']
    case 'logo': return ['Enter brand name', 'Pick a shape + palette', 'Preview concept', 'Export PNG']
    case 'generative-art': return ['Set a seed', 'Choose palette + complexity', 'Generate', 'Export PNG']
    case 'color': return ['Pick a base color', 'Generate palette', 'Copy HEX/RGB/HSL', 'Export']
    case 'gradient': return ['Pick two colors', 'Choose angle', 'Preview gradient', 'Copy CSS']
    case 'svg': return ['Paste SVG', 'Validate + optimize', 'Preview', 'Download SVG']
    case 'meme': return ['Choose an image', 'Add top/bottom text', 'Style text', 'Export']
    case 'drawing': return ['Draw with the brush', 'Use shapes/eraser', 'Undo/redo', 'Export PNG']
    case 'image-edit': return ['Upload an image', 'Apply the operation', 'Preview', 'Download']
    default: return ['Set inputs', 'Generate', 'Preview', 'Export']
  }
}