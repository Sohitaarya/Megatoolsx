/**
 * Design/Creative — capability families.
 * Real families a tool can belong to. A tool is only assigned a family it can
 * genuinely perform; auto-generated filler is 'unknown' (honest).
 */

export type DesignCreativeFamily =
  | 'canvas-designer'   // poster / flyer / banner / social-post canvas
  | 'thumbnail'         // YouTube / social thumbnails
  | 'logo'              // logo + brand mark concepts
  | 'generative-art'    // deterministic procedural / NFT-style art
  | 'model-3d'          // 3D model generation (needs external service)
  | 'image-edit'        // resize / compress / crop / convert / filters
  | 'color'             // palette / gradient / contrast / converter
  | 'svg'               // SVG editor / optimizer / converter
  | 'typography'        // font pairing / text effects / wordmark
  | 'meme'              // meme / quote image generator
  | 'collage'           // photo collage / frame
  | 'mockup'            // device / browser mockup
  | 'diagram'           // flowchart / mind map / infographic
  | 'qr'                // QR / visual generator
  | 'ai-creative'       // AI image / art / logo / background generation
  | 'unknown'           // no real design function (auto-generated CSV filler)

export const DESIGN_FAMILY_LABELS: Record<DesignCreativeFamily, string> = {
  'canvas-designer': 'Canvas Designer',
  thumbnail: 'Thumbnail Maker',
  logo: 'Logo Designer',
  'generative-art': 'Generative Art',
  'model-3d': '3D Model',
  'image-edit': 'Image Editor',
  color: 'Color Tools',
  svg: 'SVG Tools',
  typography: 'Typography',
  meme: 'Meme Generator',
  collage: 'Collage Maker',
  mockup: 'Mockup Generator',
  diagram: 'Diagram / Flowchart',
  qr: 'QR & Visual',
  'ai-creative': 'AI Creative',
  unknown: 'Unclassified',
}

/** Detect a real design family from a name/slug when possible. */
export function familyFromName(name: string, slug: string): DesignCreativeFamily {
  const n = `${name} ${slug}`.toLowerCase()
  if (n.includes('thumbnail')) return 'thumbnail'
  if (n.includes('poster') || n.includes('banner') || n.includes('flyer')) return 'canvas-designer'
  if (n.includes('logo')) return 'logo'
  if (n.includes('nft') || n.includes('art')) return 'generative-art'
  if (n.includes('3d') || n.includes('model')) return 'model-3d'
  if (n.includes('compress') || n.includes('resiz') || n.includes('crop') || n.includes('convert') || n.includes('filter')) return 'image-edit'
  if (n.includes('palette') || n.includes('color') || n.includes('gradient') || n.includes('contrast')) return 'color'
  if (n.includes('svg')) return 'svg'
  if (n.includes('meme')) return 'meme'
  if (n.includes('collage')) return 'collage'
  if (n.includes('mockup')) return 'mockup'
  if (n.includes('diagram') || n.includes('flow') || n.includes('mind')) return 'diagram'
  if (n.includes('qr')) return 'qr'
  return 'unknown'
}