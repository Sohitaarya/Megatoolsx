/**
 * Tool Content — family-aware content engine.
 *
 * Derives a structured content model for any tool. Content is DIFFERENT per
 * family (image/color/gradient/qr/svg/meme/drawing/design/logo/thumbnail/…), so
 * tools are never padded with identical paragraphs. Text describes the actual
 * capability — no keyword stuffing, no fake 1500-word filler.
 */

import type { CsvTool } from '@/data/csvData'
import { mapEveryTool } from '@/data/designCreativeCapabilities'
import { canonicalToolName } from '@/data/designCreativeToolNames'

export interface ToolContent {
  intro: string
  purpose: string
  howItWorks: string
  features: string[]
  useCases: string[]
  steps: string[]
  limitations: string[]
  privacy: string
  faq: { q: string; a: string }[]
}

type ContentTemplate = (tool: { name: string; display: string }) => ToolContent

/** Family → distinct content template. */
const FAMILY_CONTENT: Record<string, ContentTemplate> = {
  'image-edit': t => ({
    intro: `${t.display} is a browser-side image editing tool on MegatoolsX.`,
    purpose: `Resize, compress, convert and adjust image files without uploading them to a server.`,
    howItWorks: `You select an image, the tool reads it locally with the browser's canvas API, applies the chosen operation, and produces a new file for download.`,
    features: ['Resize', 'Compression quality', 'Format conversion (PNG/JPG/WebP)', 'Before/after size', 'Real download'],
    useCases: ['Optimizing images for the web', 'Preparing images for email or social', 'Converting between formats'],
    steps: ['Upload an image', 'Set width/height or quality', 'Preview the result', 'Download the output'],
    limitations: ['Output depends on the original file', 'Very large files may be slower'],
    privacy: 'Files are processed in your browser and are not uploaded by this tool.',
    faq: [
      { q: `Does ${t.display} upload my image?`, a: 'No. Processing happens in your browser using the Canvas API; your image is not uploaded.' },
      { q: `What formats does ${t.display} support?`, a: 'It supports the formats the browser can read and write (PNG, JPG, WebP where available).' },
    ],
  }),
  color: t => ({
    intro: `${t.display} is a color utility on MegatoolsX.`,
    purpose: 'Pick, convert and generate color palettes and harmonies from a real base color.',
    howItWorks: 'It converts between HEX/RGB/HSL/HSV using standard color math and derives complementary, analogous and triadic colors deterministically.',
    features: ['Color picker', 'HEX/RGB/HSL values', 'Harmony generation', 'Contrast information', 'One-click copy'],
    useCases: ['Designing a brand palette', 'Checking contrast for accessibility', 'Converting color codes'],
    steps: ['Choose a base color', 'Review the generated palette', 'Copy the values you need'],
    limitations: ['Palettes are generated from the selected color, not from a photo (unless supported)'],
    privacy: 'Colors are processed locally; nothing is uploaded.',
    faq: [
      { q: 'Is the palette generated from my color?', a: 'Yes — every harmony is calculated from the base color you pick.' },
      { q: 'Do you support HEX, RGB and HSL?', a: 'Yes, all three are shown for every color.' },
    ],
  }),
  gradient: t => ({
    intro: `${t.display} is a gradient generator on MegatoolsX.`,
    purpose: 'Build linear or radial gradients and export the CSS.',
    howItWorks: 'You choose color stops and an angle; the tool produces a live CSS gradient and can export a PNG of the same gradient.',
    features: ['Multiple color stops', 'Linear/radial', 'Angle control', 'Live preview', 'Copy CSS', 'PNG export'],
    useCases: ['Button and card backgrounds', 'Page heroes', 'Social media visuals'],
    steps: ['Pick color stops', 'Choose type and angle', 'Copy the CSS or export'],
    limitations: ['Gradient export is a static PNG snapshot'],
    privacy: 'Gradients are generated locally.',
    faq: [
      { q: 'Can I copy the CSS?', a: 'Yes — the exact CSS gradient string is shown and copyable.' },
      { q: 'Does the preview match the export?', a: 'Yes, both use the same gradient state.' },
    ],
  }),
  qr: t => ({
    intro: `${t.display} creates QR codes on MegatoolsX.`,
    purpose: 'Generate real, scannable QR codes for URLs, text, email, phone and WiFi networks.',
    howItWorks: 'It uses a tested QR encoder to place the modules, applies your color/size settings, and renders to a canvas for PNG or SVG download.',
    features: ['URL / Text / Email / Phone / WiFi', 'Size and margin', 'Foreground/background colors', 'Error correction', 'PNG + SVG download'],
    useCases: ['Sharing a link', 'WiFi login on posters', 'Business cards'],
    steps: ['Choose a content type', 'Enter the content', 'Adjust size/colors', 'Download PNG or SVG'],
    limitations: ['Very long content lowers error-correction capacity'],
    privacy: 'Content stays in your browser; it is not sent anywhere.',
    faq: [
      { q: 'Is the QR code scannable?', a: 'Yes — it is generated with a real QR encoder with configurable error correction.' },
      { q: 'Can I change the colors?', a: 'Yes, foreground/background and size are configurable.' },
    ],
  }),
  svg: t => ({
    intro: `${t.display} is an SVG utility on MegatoolsX.`,
    purpose: 'Validate, inspect and optimize SVG markup safely.',
    howItWorks: "It parses the SVG with the browser's XML parser (never executing scripts), removes safe comments/whitespace, and lets you download the result.",
    features: ['SVG upload/paste', 'Validation with clear errors', 'Size before/after', 'Optimized download'],
    useCases: ['Cleaning hand-written SVG', 'Shrinking icon files', 'Checking SVG validity'],
    steps: ['Paste or upload SVG', 'Review validation', 'Download the optimized file'],
    limitations: ['Optimization is conservative and safe — it does not rewrite paths'],
    privacy: 'Your SVG is parsed locally; it is not executed or uploaded.',
    faq: [
      { q: 'Is my SVG executed?', a: 'No — it is parsed as data and never executed, to prevent script injection.' },
      { q: 'What does the optimizer remove?', a: 'Comments and unnecessary whitespace, safely.' },
    ],
  }),
  meme: t => ({
    intro: `${t.display} is a meme generator on MegatoolsX.`,
    purpose: 'Add captions to an image and export a meme.',
    howItWorks: 'You upload an image, set top/bottom text and style, and the tool draws the image + captions on a canvas for PNG export.',
    features: ['Image upload', 'Top/bottom text', 'Font size/color/stroke', 'PNG export'],
    useCases: ['Social posts', 'Fun internal images', 'Quick captioned graphics'],
    steps: ['Upload an image', 'Add your text', 'Style it', 'Export PNG'],
    limitations: ['No bundled copyrighted templates are auto-injected'],
    privacy: 'Your image and text are processed locally.',
    faq: [
      { q: 'Can I use my own image?', a: 'Yes — upload any image you have the rights to use.' },
    ],
  }),
  drawing: t => ({
    intro: `${t.display} is a drawing canvas on MegatoolsX.`,
    purpose: 'Draw freehand with brushes, shapes, undo/redo, and export PNG.',
    howItWorks: 'It uses pointer events (mouse/touch/pen) on an HTML canvas with a history stack for undo/redo.',
    features: ['Brush/eraser', 'Line/rect/circle', 'Color + size', 'Undo/redo', 'Clear', 'PNG export'],
    useCases: ['Quick sketches', 'Whiteboard notes', 'Pixel-style art'],
    steps: ['Pick a tool and color', 'Draw on the canvas', 'Undo/redo as needed', 'Export PNG'],
    limitations: ['Vector export is not supported'],
    privacy: 'Drawings are local; nothing is uploaded.',
    faq: [
      { q: 'Does it support touch?', a: 'Yes — pointer events support mouse, touch and pen.' },
    ],
  }),
  'canvas-designer': t => ({
    intro: `${t.display} is a canvas-based poster/design tool on MegatoolsX.`,
    purpose: 'Create posters and social designs with text, colors and templates.',
    howItWorks: 'It composes title/subtitle, background and accent on a real canvas and exports PNG/JPG.',
    features: ['Templates', 'Title + subtitle', 'Background + accent', 'PNG/JPG export'],
    useCases: ['Event posters', 'Promotional graphics', 'Social post backgrounds'],
    steps: ['Pick a template', 'Edit text', 'Set colors', 'Export'],
    limitations: ['Designs are canvas-based; layers/effects are limited'],
    privacy: 'Designed locally; nothing is uploaded.',
    faq: [
      { q: 'Can I export my design?', a: 'Yes — PNG and JPG export are available.' },
    ],
  }),
  thumbnail: t => ({
    intro: `${t.display} creates video/social thumbnails on MegatoolsX.`,
    purpose: 'Build 16:9 thumbnails with a headline, background and accent.',
    howItWorks: 'It lays out text and color on a 1280x720 canvas and exports PNG/JPG.',
    features: ['16:9 preset', 'Headline', 'Background + accent', 'PNG/JPG export'],
    useCases: ['YouTube thumbnails', 'Video covers', 'Social preview images'],
    steps: ['Set the headline', 'Pick colors', 'Preview', 'Export'],
    limitations: ['No stock images are bundled'],
    privacy: 'Generated locally.',
    faq: [
      { q: 'Is it 16:9?', a: 'Yes — the default preset is 1280×720.' },
    ],
  }),
  logo: t => ({
    intro: `${t.display} creates logo concepts on MegatoolsX.`,
    purpose: 'Build a simple brand mark from a name, shape and palette.',
    howItWorks: 'It renders a monogram + wordmark on a canvas; AI-generated concepts require a configured provider.',
    features: ['Brand name', 'Shape + palette', 'PNG export', 'AI concepts when configured'],
    useCases: ['Rapid logo concepts', 'Placeholder brand marks', 'Starter branding'],
    steps: ['Enter the brand name', 'Pick a shape and palette', 'Preview the concept', 'Export PNG'],
    limitations: ['AI logo generation needs a configured AI provider'],
    privacy: 'Concepts are generated locally (or by your configured provider).',
    faq: [
      { q: 'Is this a full logo design?', a: 'It produces a concept; refinement needs a designer or AI provider.' },
    ],
  }),
  'generative-art': t => ({
    intro: `${t.display} produces generative art on MegatoolsX.`,
    purpose: 'Create deterministic, reproducible procedural art from a seed.',
    howItWorks: 'It uses a seeded random generator and a palette to place shapes, so the same seed always reproduces the same art.',
    features: ['Seed control', 'Palette', 'Complexity', 'PNG export'],
    useCases: ['Abstract backgrounds', 'NFT-style generative art', 'Creative experiments'],
    steps: ['Set a seed', 'Choose palette/complexity', 'Generate', 'Export'],
    limitations: ['Art is procedural, not AI-rendered'],
    privacy: 'Generated locally.',
    faq: [
      { q: 'Is it reproducible?', a: 'Yes — the same seed produces the same output.' },
    ],
  }),
}

/** Generic fallback for non-design categories (distinct by category, not identical). */
function genericContent(t: { name: string; display: string }, category: string): ToolContent {
  return {
    intro: `${t.display} is a ${category.toLowerCase()} tool on MegatoolsX.`,
    purpose: `Use ${t.display} to complete ${category.toLowerCase()} tasks with clear steps and a real result.`,
    howItWorks: `The tool runs its core operation in your browser and returns a result you can copy or download.`,
    features: ['Real input workflow', 'Live result', 'Copy/download output', 'Reset and error states'],
    useCases: [`Daily ${category.toLowerCase()} tasks`, 'Learning and practice', 'Quick utility work'],
    steps: ['Enter your input', 'Run the tool', 'Review the result', 'Copy or download'],
    limitations: ['Results depend on the input you provide'],
    privacy: 'Input is processed in your browser where the tool supports it.',
    faq: [
      { q: `How do I use ${t.display}?`, a: `Enter your input and run the tool; the result appears immediately.` },
      { q: 'Is it free to use?', a: 'Yes — every guide and tool on MegatoolsX is free to use.' },
    ],
  }
}

/** Build family-aware structured content for any tool. */
export function buildToolContent(tool: CsvTool): ToolContent {
  const display = canonicalToolName(tool)
  const family = mapEveryTool(tool.slug, tool.name).family
  const template = FAMILY_CONTENT[family]
  return template ? template({ name: tool.name, display }) : genericContent({ name: tool.name, display }, tool.category)
}

/** Family-specific steps for HowTo schema (kept distinct per family). */
export function toolHowToSteps(tool: CsvTool): { name: string; text: string }[] {
  const content = buildToolContent(tool)
  return content.steps.map((s, i) => ({ name: s, text: s }))
}

export { FAMILY_CONTENT }