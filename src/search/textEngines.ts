/**
 * Search Engine — Title / Description / Keyword engines.
 * Deterministic, length-optimized, de-duplicated text generation per page kind.
 */

import type { SeoContext, SeoEntity } from './types'

const SITE = 'MegatoolsX'
const MAX_TITLE = 60
const MAX_DESC = 158

function clip(s: string, max: number): string {
  const t = s.trim()
  if (t.length <= max) return t
  const cut = t.slice(0, max)
  return cut.slice(0, Math.max(0, cut.lastIndexOf(' ')) || max).replace(/[.,;:!?…-]+$/, '').trim() + '…'
}

/** Unique, human-friendly, keyword-fronted title. */
export function titleEngine(ctx: SeoContext): string {
  if (ctx.title) return clip(ctx.title, MAX_TITLE)
  const e = ctx.entity
  const word = (s: string) => `${s.charAt(0).toUpperCase()}${s.slice(1)}`

  switch (ctx.kind) {
    case 'home':
      return `${word('Master every digital tool in one place')} | ${SITE}`
    case 'tools':
      return `All ${word('online tools')} & Guides — 2,500+ | ${SITE}`
    case 'categories':
      return `Browse All ${word('categories')} — ${SITE}`
    case 'category':
      return `${e ? word(e.name) : 'Category'} ${word('tools')}: Guides, Tutorials & FAQ`
    case 'tool':
      return e ? `${word(e.name)} — ${word('how to use')}, ${word('features')} & FAQ` : `Tool Guide | ${SITE}`
    case 'toolSection':
      return e && ctx.breadcrumbs?.length ? `${word(ctx.breadcrumbs[ctx.breadcrumbs.length - 1].name)} — ${word(e.name)} | ${SITE}` : `Tool Guide | ${SITE}`
    case 'aiTools':
      return `AI ${word('tools')} Collection — ${word('guides')}, ${word('how-to')} & ${word('downloads')} | ${SITE}`
    case 'aiTool':
      return e ? `${word(e.name)} — AI ${word('tool')}: ${word('how to use')} & ${word('download')}` : `AI Tool | ${SITE}`
    case 'aiToolSection':
      return e && ctx.breadcrumbs?.length ? `${word(ctx.breadcrumbs[ctx.breadcrumbs.length - 1].name)} — ${word(e.name)} AI` : `AI Tool Guide | ${SITE}`
    case 'blog':
      return `Blog — ${word('guides')} & ${word('tutorials')} | ${SITE}`
    case 'blogPost':
      return e ? `${word(e.name)} | ${SITE} Blog` : `Blog Post | ${SITE}`
    case 'static':
      return `${e ? word(e.name) : 'Page'} | ${SITE}`
    default:
      return `${e ? word(e.name) : 'Page'} | ${SITE}`
  }
}

/** Unique, readable meta description with keyword lead. */
export function descriptionEngine(ctx: SeoContext): string {
  if (ctx.description) return clip(ctx.description, MAX_DESC)
  const e = ctx.entity
  const name = e?.name || 'This tool'
  const cat = e?.category ? e.category.toLowerCase() : 'digital'

  switch (ctx.kind) {
    case 'home':
      return `Free guides, tutorials, and solutions for 2,500+ ${word2('digital tools')}, AI tools, software and apps at ${SITE}.`
    case 'tools':
      return `Browse 2,500+ ${word2('online tools')} with step-by-step guides, features, FAQs and troubleshooting.`
    case 'categories':
      return `Explore every ${word2('tool category')} on ${SITE}: AI, writing, design, coding, finance, education and more.`
    case 'category':
      return `${name} ${word2('tools')} with guides, tutorials, features and FAQs. Learn how to use every ${cat} tool like a pro.`
    case 'tool':
      return `${name} — a ${cat} tool. Step-by-step guide, features, FAQ and troubleshooting. Use it online free at ${SITE}.`
    case 'aiTool':
      return `${name} — AI ${cat}. Guide, how-to-use, download and pricing. Explore features and alternatives at ${SITE}.`
    case 'blog':
      return `Latest ${word2('guides')}, tutorials and insights about digital tools, AI and technology.`
    case 'blogPost':
      return (e?.description ?? `${name}: a practical ${word2('guide')} with steps, tips and answers.`).slice(0, MAX_DESC)
    default:
      return `${name} — complete ${word2('guide')} with step-by-step instructions, features, FAQ and solutions at ${SITE}.`
  }
}

function word2(s: string): string { return s }

/** Keyword engine — primary/secondary/long-tail/semantic derived deterministically. */
export function keywordEngine(ctx: SeoContext): string {
  if (ctx.keywords) return ctx.keywords
  const e = ctx.entity
  const name = (e?.name || 'tool').toLowerCase()
  const cat = (e?.category || '').toLowerCase()
  const slug = (e?.slug || name).replace(/-/g, ' ')
  const set = new Set<string>([name, slug, cat, `online ${name} tool`, `${name} guide`, `${name} how to use`, `${name} faq`, `${name} tutorial`].filter(Boolean))
  return Array.from(set).slice(0, 10).join(', ')
}

/** Default SEO entity for static pages. */
export function staticEntity(name: string, description?: string): SeoEntity {
  return { name, description, slug: undefined, category: undefined }
}