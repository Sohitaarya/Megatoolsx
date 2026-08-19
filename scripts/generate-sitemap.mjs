/**
 * MegatoolsX Sitemap Generator — Production
 *
 * Splits the site into per-type sitemaps (static, categories, blog, tools,
 * ai-tools, images) plus a sitemap-index.xml, so no single sitemap exceeds
 * Google's limits and the crawl budget stays clean.
 *
 * Run:    node scripts/generate-sitemap.mjs          → writes to public/
 *         node scripts/generate-sitemap.mjs --dist   → writes to dist/ (postbuild)
 *
 * Outputs:
 *   sitemap-index.xml       (sitemap index)
 *   sitemap-static.xml      (home + collection + company pages)
 *   sitemap-categories.xml  (/category/*)
 *   sitemap-blog.xml        (/blog + /blog/*)
 *   sitemap-tools-N.xml     (/tools/* + high-value sub-pages, auto-split)
 *   sitemap-ai-tools.xml    (/ai-tools + /ai-tools/* + sub-pages)
 *   sitemap-images.xml      (image entries for tool & blog pages)
 *   robots.txt              (points at sitemap-index.xml)
 *   rss.xml                 (blog feed)
 *   manifest.json           (PWA manifest)
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const PUBLIC_DIR = path.join(ROOT, 'public')
const CSV_PATH = path.join(PUBLIC_DIR, 'tools.csv')

const SITE_URL = 'https://megatoolsx.com'
const TODAY = new Date().toISOString().split('T')[0]
const IMAGE_URL = `${SITE_URL}/og-image.png`

/** Hard limit per sitemap file (Google allows 50,000 URLs / 50MB). */
const MAX_URLS_PER_SITEMAP = 45000

// ─── CSV Parsing (lightweight, no PapaParse dependency needed) ───
function parseCSV(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8').trim()
  const lines = raw.split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim())
  const tools = []

  for (let i = 1; i < lines.length; i++) {
    const vals = parseCSVLine(lines[i])
    if (vals.length < headers.length) continue

    const tool = {}
    headers.forEach((h, idx) => { tool[h] = (vals[idx] || '').trim() })

    if (tool['Tool Name'] && tool['Slug'] && ['Present', 'Generative', 'Future'].includes((tool['Status'] || '').trim())) {
      tools.push({
        name: tool['Tool Name'],
        slug: tool['Slug'],
        category: tool['Category'] || 'Uncategorized',
        description: tool['Description'] || '',
        metaDescription: tool['Meta Description'] || '',
        status: (tool['Status'] || '').trim(),
      })
    }
  }
  return tools
}

function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

function categorySlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

/**
 * Clean, deduped URL slug. The CSV "Slug" column is unreliable (spaces, wrong
 * values, duplicates), so sitemap URLs are derived from a sanitized, unique slug.
 * Existing VALID slugs are preserved byte-for-byte; only broken ones are cleaned.
 */
function cleanToolSlug(rawSlug, name, used) {
  let base = String(rawSlug || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  if (!base) base = categorySlug(name)
  let slug = base
  let i = 2
  while (used.has(slug)) slug = `${base}-${i++}`
  used.add(slug)
  return slug
}

function escapeXML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// ─── URL builders ───
/** Simple URL entry. */
function url(loc, priority, changefreq = 'weekly', lastmod = TODAY) {
  return { loc, priority, changefreq, lastmod }
}

/** URL entry with an <image:image> child for the images sitemap. */
function urlWithImage(loc, priority, changefreq = 'weekly', lastmod = TODAY, image = IMAGE_URL) {
  return { loc, priority, changefreq, lastmod, image }
}

// ─── XML builders ───
function buildUrlset(urls, withImages = false) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${withImages ? ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"' : ''}>`,
  ]

  for (const u of urls) {
    lines.push('  <url>')
    lines.push(`    <loc>${escapeXML(SITE_URL + u.loc)}</loc>`)
    lines.push(`    <lastmod>${u.lastmod}</lastmod>`)
    lines.push(`    <changefreq>${u.changefreq}</changefreq>`)
    lines.push(`    <priority>${u.priority.toFixed(1)}</priority>`)
    if (withImages && u.image) {
      lines.push('    <image:image>')
      lines.push(`      <image:loc>${escapeXML(u.image)}</image:loc>`)
      lines.push('    </image:image>')
    }
    lines.push('  </url>')
  }

  lines.push('</urlset>')
  lines.push('')
  return lines.join('\n')
}

function buildIndex(children) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ]
  for (const child of children) {
    lines.push('  <sitemap>')
    lines.push(`    <loc>${escapeXML(SITE_URL + '/' + child)}</loc>`)
    lines.push(`    <lastmod>${TODAY}</lastmod>`)
    lines.push('  </sitemap>')
  }
  lines.push('</sitemapindex>')
  lines.push('')
  return lines.join('\n')
}

/** Write a file safely, returning its size in KB (or null on failure). */
function writeXML(outDir, filename, content) {
  const filePath = path.join(outDir, filename)
  try {
    fs.writeFileSync(filePath, content, 'utf-8')
    return (Buffer.byteLength(content, 'utf-8') / 1024).toFixed(1)
  } catch (err) {
    console.error(`   ⚠️  Could not write ${filename}: ${err.message}`)
    return null
  }
}

/** Split a large array of URLs into multiple chunks, naming them base-N.xml. */
function splitUrls(urls, baseName, outDir) {
  const chunks = []
  for (let i = 0; i < urls.length; i += MAX_URLS_PER_SITEMAP) {
    chunks.push(urls.slice(i, i + MAX_URLS_PER_SITEMAP))
  }

  const written = []
  chunks.forEach((chunk, idx) => {
    const filename = `${baseName}-${idx + 1}.xml`
    const xml = buildUrlset(chunk)
    const size = writeXML(outDir, filename, xml)
    if (size !== null) {
      console.log(`   ✅ ${filename} (${size} KB, ${chunk.length} URLs)`)
      written.push(filename)
    }
  })
  return written
}

// ─── Data sources (must match src/data/*) ───
const AI_TOOLS = [
  'chatgpt', 'claude', 'gemini', 'copilot', 'midjourney', 'dall-e', 'stable-diffusion', 'adobe-firefly',
  'leonardo-ai', 'runway-ml', 'synthesia', 'elevenlabs', 'murf-ai', 'grammarly', 'jasper-ai', 'copy-ai',
  'writesonic', 'perplexity-ai', 'you-com', 'notion-ai', 'gamma-ai', 'beautiful-ai', 'canva-ai', 'heygen',
  'pictory', 'descript', 'otter-ai', 'sora', 'deepseek', 'grok',
]

/** Sub-pages with real, indexed content (mirrors CsvToolDetail — others are noindexed). */
const TOOL_SUB_ROUTES = ['how-to-use', 'features', 'faq', 'problems', 'solutions', 'download', 'resources']

const AI_SUB_ROUTES = ['how-to-use', 'download', 'installation', 'features', 'pricing', 'pros-cons', 'alternatives', 'faq', 'security', 'tips', 'play']

/** Smart collections (must match src/discovery/engine/DiscoveryEngine.collections()). */
const COLLECTIONS = ['best-ai', 'developer-essentials', 'trending-month', 'most-used', 'new-releases', 'best-pdf', 'best-image', 'seasonal']

const BLOG_POSTS = [
  { title: 'The Ultimate Guide to AI Tools in 2026', slug: 'ultimate-guide-ai-tools-2026', date: '2026-07-15', category: 'AI Tools', excerpt: 'Discover the best AI tools transforming how we work, create, and solve problems in 2026.' },
  { title: 'How to Master Any Digital Tool: A Step-by-Step Framework', slug: 'master-any-digital-tool-framework', date: '2026-07-10', category: 'Guides', excerpt: 'Learn our proven framework for mastering any digital tool quickly and effectively.' },
  { title: 'Top 10 Productivity Tools Every Professional Needs', slug: 'top-10-productivity-tools-2026', date: '2026-07-05', category: 'Productivity', excerpt: 'Boost your productivity with these essential tools for modern professionals.' },
  { title: 'Understanding AI: From Chatbots to Image Generation', slug: 'understanding-ai-chatbots-image-generation', date: '2026-06-28', category: 'AI', excerpt: 'A comprehensive overview of AI technologies and how they work in everyday tools.' },
  { title: 'Security Best Practices for Online Tools', slug: 'security-best-practices-online-tools', date: '2026-06-20', category: 'Security', excerpt: 'Stay safe online with these essential security practices for using digital tools.' },
  { title: 'The Future of Digital Tools: Trends to Watch', slug: 'future-digital-tools-trends', date: '2026-06-15', category: 'Trends', excerpt: 'Explore the emerging trends shaping the future of digital tools and technology.' },
]

// ─── Main generator ───
function generate(outDir = PUBLIC_DIR) {
  console.log('📂 Reading CSV...')
  const tools = parseCSV(CSV_PATH)
  console.log(`   Found ${tools.length} tools (status: Present/Generative/Future)`)

  // Assign clean, unique URL slugs (CSV "Slug" column is unreliable).
  const usedSlugs = new Set()
  for (const t of tools) t.urlSlug = cleanToolSlug(t.slug, t.name, usedSlugs)

  const categories = []
  for (const t of tools) {
    const slug = categorySlug(t.category)
    if (!categories.some(c => c.slug === slug)) categories.push({ name: t.category, slug })
  }
  console.log(`   Found ${categories.length} categories`)

  const sitemapFiles = []
  const staticUrls = [
    url('/', 1.0, 'daily'),
    url('/tools', 0.9, 'daily'),
    url('/ai-tools', 0.9, 'daily'),
    url('/categories', 0.8, 'weekly'),
    url('/trending', 0.7, 'daily'),
    url('/new-tools', 0.7, 'daily'),
    url('/popular', 0.7, 'daily'),
    url('/about', 0.5, 'monthly'),
    url('/contact', 0.5, 'monthly'),
    url('/privacy', 0.3, 'monthly'),
    url('/terms', 0.3, 'monthly'),
    url('/blog', 0.6, 'weekly'),
  ]

  // 1. Static sitemap
  const staticSize = writeXML(outDir, 'sitemap-static.xml', buildUrlset(staticUrls))
  console.log(`   ✅ sitemap-static.xml (${staticSize} KB, ${staticUrls.length} URLs)`)
  sitemapFiles.push('sitemap-static.xml')

  // 2. Categories sitemap
  const categoryUrls = categories.map(c => url(`/category/${c.slug}`, 0.8, 'weekly'))
  const catSize = writeXML(outDir, 'sitemap-categories.xml', buildUrlset(categoryUrls))
  console.log(`   ✅ sitemap-categories.xml (${catSize} KB, ${categoryUrls.length} URLs)`)
  sitemapFiles.push('sitemap-categories.xml')

  // 2b. Collections sitemap
  const collectionUrls = [url('/collections', 0.8, 'weekly'), ...COLLECTIONS.map(id => url(`/collections/${id}`, 0.7, 'weekly'))]
  const collSize = writeXML(outDir, 'sitemap-collections.xml', buildUrlset(collectionUrls))
  console.log(`   ✅ sitemap-collections.xml (${collSize} KB, ${collectionUrls.length} URLs)`)
  sitemapFiles.push('sitemap-collections.xml')

  // 3. Blog sitemap
  const blogUrls = [url('/blog', 0.6, 'weekly')]
  for (const post of BLOG_POSTS) {
    blogUrls.push(url(`/blog/${post.slug}`, 0.6, 'monthly', post.date))
  }
  const blogSize = writeXML(outDir, 'sitemap-blog.xml', buildUrlset(blogUrls))
  console.log(`   ✅ sitemap-blog.xml (${blogSize} KB, ${blogUrls.length} URLs)`)
  sitemapFiles.push('sitemap-blog.xml')

  // 4. Tools sitemap(s) — overview + high-value sub-pages, auto-split
  const toolUrls = []
  for (const tool of tools) {
    const toolLoc = `/tools/${tool.urlSlug}`
    toolUrls.push(url(toolLoc, 0.7, 'weekly'))
    for (const sub of TOOL_SUB_ROUTES) {
      toolUrls.push(url(`${toolLoc}/${sub}`, 0.5, 'monthly'))
    }
  }
  console.log(`\n🏗️  Splitting ${toolUrls.length} tool URLs into sitemap(s)...`)
  const toolFiles = splitUrls(toolUrls, 'sitemap-tools', outDir)
  sitemapFiles.push(...toolFiles)

  // 5. AI tools sitemap
  const aiUrls = [url('/ai-tools', 0.9, 'daily')]
  for (const aiSlug of AI_TOOLS) {
    aiUrls.push(url(`/ai-tools/${aiSlug}`, 0.7, 'weekly'))
    for (const sub of AI_SUB_ROUTES) {
      aiUrls.push(url(`/ai-tools/${aiSlug}/${sub}`, 0.5, 'monthly'))
    }
  }
  const aiSize = writeXML(outDir, 'sitemap-ai-tools.xml', buildUrlset(aiUrls))
  console.log(`   ✅ sitemap-ai-tools.xml (${aiSize} KB, ${aiUrls.length} URLs)`)
  sitemapFiles.push('sitemap-ai-tools.xml')

  // 6. Images sitemap — real image (favicon/OG) that is present on these pages
  const imageUrls = [
    ...staticUrls.slice(0, 4).map(s => urlWithImage(s.loc, s.priority, s.changefreq, s.lastmod)),
  ]
  for (const tool of tools) {
    imageUrls.push(urlWithImage(`/tools/${tool.urlSlug}`, 0.7, 'weekly', TODAY))
  }
  for (const post of BLOG_POSTS) {
    imageUrls.push(urlWithImage(`/blog/${post.slug}`, 0.6, 'monthly', post.date))
  }
  const imgSize = writeXML(outDir, 'sitemap-images.xml', buildUrlset(imageUrls, true))
  console.log(`   ✅ sitemap-images.xml (${imgSize} KB, ${imageUrls.length} URLs)`)
  sitemapFiles.push('sitemap-images.xml')

  // 7. Sitemap index — written as both sitemap.xml (canonical) and sitemap-index.xml
  const indexXML = buildIndex(sitemapFiles)
  const indexSize = writeXML(outDir, 'sitemap-index.xml', indexXML)
  writeXML(outDir, 'sitemap.xml', indexXML)
  console.log(`   ✅ sitemap-index.xml + sitemap.xml (${indexSize} KB, ${sitemapFiles.length} sitemaps)`)

  // 8. robots.txt — points at the sitemap index
  console.log('\n📝 Writing robots.txt...')
  fs.writeFileSync(path.join(outDir, 'robots.txt'), buildRobots(), 'utf-8')
  console.log('   ✅ robots.txt written')

  // 9. llms-full.txt — complete, machine-readable tool catalog for LLMs/AI crawlers
  console.log('📝 Writing llms-full.txt...')
  fs.writeFileSync(path.join(outDir, 'llms-full.txt'), buildLLMSFull(tools, categories), 'utf-8')
  console.log('   ✅ llms-full.txt written')

  // 10. rss.xml
  console.log('📝 Writing rss.xml...')
  fs.writeFileSync(path.join(outDir, 'rss.xml'), buildRSS(), 'utf-8')
  console.log('   ✅ rss.xml written')

  // 10. manifest.json
  console.log('📝 Writing manifest.json...')
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(buildManifest(), null, 2), 'utf-8')
  console.log('   ✅ manifest.json written')

  return { sitemaps: sitemapFiles.length, toolUrls: toolUrls.length, total: staticUrls.length + categoryUrls.length + blogUrls.length + toolUrls.length + aiUrls.length }
}

function buildRobots() {
  return [
    '# MegatoolsX robots.txt — production',
    '# https://developers.google.com/search/docs/crawling-indexing/robots/intro',
    '',
    'User-agent: *',
    'Allow: /',
    '',
    '# User features / admin — no value in the index',
    'Disallow: /admin',
    'Disallow: /my-tools',
    'Disallow: /compare',
    '',
    '# App-like / utility paths that should never rank',
    'Disallow: /*?utm_',
    'Disallow: /*?ref=',
    'Disallow: /*?source=',
    '',
    'Sitemap: https://megatoolsx.com/sitemap.xml',
    'Sitemap: https://megatoolsx.com/sitemap-index.xml',
    '',
  ].join('\n')
}

/** Complete tool catalog in llms.txt format, grouped by category, for LLM/AI crawlers. */
function buildLLMSFull(tools, categories) {
  const lines = ['# MegatoolsX — Complete Tool Catalog', '']
  lines.push('> Machine-readable catalog of every tool guide on MegatoolsX (grouped by category).')
  lines.push('> Each tool links to its full guide. Format: [Tool Name](url) — short description.')
  lines.push('')

  for (const cat of categories) {
    lines.push(`## ${cat.name}`)
    lines.push('')
    const catTools = tools.filter(t => categorySlug(t.category) === cat.slug)
    for (const tool of catTools) {
      const desc = (tool.metaDescription || '') || (tool.description || '')
      lines.push(`- [${tool.name}](https://megatoolsx.com/tools/${tool.urlSlug}) — ${escapeXML(desc)}`)
    }
    lines.push('')
  }

  lines.push('## AI Tools Collection')
  lines.push('')
  for (const aiSlug of AI_TOOLS) {
    lines.push(`- [${aiSlug.replace(/-/g, ' ')}](https://megatoolsx.com/ai-tools/${aiSlug}) — featured AI tool guide`)
  }
  lines.push('')

  return lines.join('\n')
}

function buildRSS() {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    '    <title>MegatoolsX Blog</title>',
    '    <link>' + SITE_URL + '/blog</link>',
    '    <description>Guides, tutorials, and insights about digital tools, AI, and technology.</description>',
    '    <language>en-us</language>',
    '    <atom:link href="' + SITE_URL + '/rss.xml" rel="self" type="application/rss+xml" />',
  ]
  for (const post of BLOG_POSTS) {
    lines.push('    <item>')
    lines.push('      <title>' + escapeXML(post.title) + '</title>')
    lines.push('      <link>' + SITE_URL + '/blog/' + post.slug + '</link>')
    lines.push('      <guid>' + SITE_URL + '/blog/' + post.slug + '</guid>')
    lines.push('      <pubDate>' + new Date(post.date + 'T00:00:00Z').toUTCString() + '</pubDate>')
    lines.push('      <category>' + escapeXML(post.category) + '</category>')
    lines.push('      <description>' + escapeXML(post.excerpt) + '</description>')
    lines.push('    </item>')
  }
  lines.push('  </channel>')
  lines.push('</rss>')
  lines.push('')
  return lines.join('\n')
}

function buildManifest() {
  return {
    name: "MegatoolsX - World's Largest Digital Tools Knowledge Platform",
    short_name: 'MegatoolsX',
    description: 'Learn how to use any digital tool, AI tool, software, website, app, and browser extension. Step-by-step guides, tutorials, and solutions for 2,500+ tools.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#6366f1',
    orientation: 'portrait-primary',
    icons: [
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  }
}

// ─── Run ───
console.log('='.repeat(50))
console.log('  MegatoolsX Sitemap Generator (Production)')
console.log('='.repeat(50))
console.log(`  Site: ${SITE_URL}`)
console.log(`  Date: ${TODAY}`)
console.log('='.repeat(50))

const isDist = process.argv.includes('--dist')
const outDir = isDist ? path.join(ROOT, 'dist') : PUBLIC_DIR

const result = generate(outDir)

console.log('\n' + '='.repeat(50))
console.log('  ✅ Sitemap Generation Complete!')
console.log(`  📄 ${isDist ? 'dist' : 'public'}/sitemap-index.xml → ${result.sitemaps} sitemaps, ${result.total} total URLs`)
console.log('='.repeat(50))
