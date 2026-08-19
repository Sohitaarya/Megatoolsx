import { readFileSync, writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
const CSV = resolve(__dirname, '..', 'public', 'tools.csv')

const POOL = {
  gradient: ['Gradient Generator','Linear Gradient Maker','Radial Gradient Maker','Gradient Background Generator','CSS Gradient Generator','Gradient Color Stops Maker'],
  'image-edit': ['Image Compressor', 'Image Optimizer', 'Image Resizer', 'Image Cropper', 'Image Rotator', 'Image Flipper', 'Image Converter', 'Image Filter Editor', 'Image Sharpener', 'Image Blur Tool', 'Image Brightness Editor', 'Image Contrast Tool', 'Image Saturation Editor', 'Image Grayscale Converter'],
  color: ['Color Picker', 'Color Palette Generator', 'Color Converter', 'Contrast Checker', 'Color Shades Generator', 'Color Tints Generator', 'Random Color Generator', 'Color Mixer'],
  svg: ['SVG Optimizer', 'SVG Viewer', 'SVG Editor', 'SVG Color Editor', 'SVG Path Viewer'],
  meme: ['Meme Generator', 'Image Meme Generator', 'Custom Meme Generator'],
  drawing: ['Online Drawing Tool', 'Sketch Pad', 'Digital Drawing Canvas', 'Pixel Drawing Tool'],
  'canvas-designer': ['Poster Maker','Banner Maker','Social Post Designer','Event Poster Maker','Business Poster Maker','Sale Poster Maker','Promotional Poster Maker','Festival Poster Maker','Education Poster Maker','Quote Poster Maker'],
  thumbnail: ['YouTube Thumbnail Maker','Video Thumbnail Maker','Podcast Thumbnail Maker','Blog Thumbnail Maker','Video Thumbnail Editor'],
  logo: ['Logo Maker','Logo Text Generator','Logo Badge Maker','Brand Mark Creator','Logo Concept Generator'],
  'generative-art': ['Generative Art Studio','Procedural Pattern Maker','Abstract Art Generator','NFT Art Creator','Generative Art Canvas'],
  qr: ['QR Code Generator','URL QR Generator','Text QR Generator','WiFi QR Generator','Email QR Generator','Phone QR Generator'],
  'model-3d': ['3D Model Generator'],
  unknown: ['Design Utility'],
}
const VARIANTS = ['', ' II', ' III', ' Pro', ' Studio', ' Plus', ' Express', ' Lite', ' Max']

function familyOf(slug, name) {
  const real = { 'poster-generator': 'canvas-designer', 'youtube-thumbnail-generator': 'thumbnail', 'ai-logo-generator': 'logo', 'nft-art-creator': 'generative-art', '3d-model-generator': 'model-3d' }
  if (real[slug]) return real[slug]
  const p = (name.replace(/\b(Auto|Cloud|Generative|Instant|NextGen|Smart|Virtual|AI)\b/g, ' ').trim().split(/\s+/)[0] || name).toLowerCase()
  if (p.includes('desi') || p.includes('pers')) return 'canvas-designer'
  if (p.includes('vide')) return 'thumbnail'
  if (p.includes('logo') || p.includes('brand')) return 'logo'
  if (p.includes('contwrit') || p.includes('seo') || p.includes('mark')) return 'image-edit'
  if (p.includes('gami') || p.includes('ent')) return 'generative-art'
  if (p.includes('spac') || p.includes('clim') || p.includes('educ')) return 'gradient'
  if (p.includes('deve') || p.includes('tech')) return 'svg'
  if (p.includes('heal') || p.includes('busi')) return 'color'
  if (p.includes('gene') || p.includes('iot')) return 'drawing'
  return 'image-edit'
}

// Parse Design/Creative rows.
const lines = readFileSync(CSV, 'utf-8').trim().split('\n').slice(1)
const rows = []
for (const l of lines) {
  const a = l.indexOf(','), b = l.indexOf(',', a + 1)
  if (a === -1 || b === -1) continue
  const cat = l.slice(0, a).trim()
  if (cat !== 'Design/Creative') continue
  const name = l.slice(a + 1, b).replace(/^\"/, '').trim()
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  rows.push({ name, slug, family: familyOf(slug, name) })
}

// Assign globally-unique canonical names by (family, sorted slug) like the TS.
const byFamily = {}
for (const r of rows) (byFamily[r.family] = byFamily[r.family] || []).push(r)
for (const fam in byFamily) byFamily[fam].sort((x, y) => x.slug.localeCompare(y.slug))
for (const r of rows) {
  const fam = r.family, pool = POOL[fam] || POOL.unknown
  const i = byFamily[fam].indexOf(r)
  r.canonical = pool[i % pool.length] + (VARIANTS[Math.floor(i / pool.length) % VARIANTS.length] || '')
}

const suspicious = rows.filter(r => /(Bot|Mixer|Mapper|Aligner|Composer|Detector|Toolkit|Synth)\b/.test(r.name.split(/\s+/).slice(-2).join(' ')))
const names = rows.map(r => r.canonical)
const dupName = names.length - new Set(names).size
const dupSlug = rows.length - new Set(rows.map(r => r.slug)).size
const families = {}
for (const r of rows) families[r.family] = (families[r.family] || 0) + 1

console.log('PHASE 3.5.2 DATA AUDIT')
console.log('Total Design/Creative:', rows.length)
console.log('Suspicious (old) names:', suspicious.length)
console.log('Duplicate canonical names:', dupName)
console.log('Duplicate slugs:', dupSlug)
console.log('Family distribution:', JSON.stringify(families))
writeFileSync(resolve(__dirname, '..', 'design-creative-data-report.json'), JSON.stringify({
  total: rows.length, suspicious: suspicious.length, duplicateNames: dupName, duplicateSlugs: dupSlug,
  familyDistribution: families,
  tools: rows.map(r => ({ slug: r.slug, oldName: r.name, canonicalName: r.canonical, family: r.family })),
}, null, 2))
console.log('Wrote design-creative-data-report.json')
