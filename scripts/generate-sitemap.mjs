/**
 * MegatoolsX Sitemap Generator
 *
 * Reads tools.csv and generates a complete sitemap.xml
 * Run: node scripts/generate-sitemap.mjs
 * Output: public/sitemap.xml  (copied to dist/ during build)
 *         public/sitemap-static.xml  (for backup/verification)
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const PUBLIC_DIR = path.join(ROOT, 'public')
const CSV_PATH = path.join(PUBLIC_DIR, 'tools.csv')

const SITE_URL = 'https://megatoolsx.com'
const TODAY = new Date().toISOString().split('T')[0] // 2026-07-29

// ─── CSV Parsing (lightweight, no PapaParse dependency needed) ───
function parseCSV(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8').trim()
  const lines = raw.split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim())
  const tools = []

  for (let i = 1; i < lines.length; i++) {
    // Handle commas inside quoted fields
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

// ─── URL Builder ───
function url(loc, priority, changefreq = 'weekly', lastmod = TODAY) {
  return { loc: `${SITE_URL}${loc}`, priority, changefreq, lastmod }
}

// ─── AI Tools (hardcoded from csvData.ts) ───
const AI_TOOLS = [
  { name: 'ChatGPT', slug: 'chatgpt' },
  { name: 'Claude', slug: 'claude' },
  { name: 'Gemini', slug: 'gemini' },
  { name: 'Copilot', slug: 'copilot' },
  { name: 'Midjourney', slug: 'midjourney' },
  { name: 'DALL-E', slug: 'dall-e' },
  { name: 'Stable Diffusion', slug: 'stable-diffusion' },
  { name: 'Adobe Firefly', slug: 'adobe-firefly' },
  { name: 'Leonardo AI', slug: 'leonardo-ai' },
  { name: 'Runway ML', slug: 'runway-ml' },
  { name: 'Synthesia', slug: 'synthesia' },
  { name: 'ElevenLabs', slug: 'elevenlabs' },
  { name: 'Murf AI', slug: 'murf-ai' },
  { name: 'Grammarly', slug: 'grammarly' },
  { name: 'Jasper AI', slug: 'jasper-ai' },
  { name: 'Copy AI', slug: 'copy-ai' },
  { name: 'Writesonic', slug: 'writesonic' },
  { name: 'Perplexity AI', slug: 'perplexity-ai' },
  { name: 'You.com', slug: 'you-com' },
  { name: 'Notion AI', slug: 'notion-ai' },
  { name: 'Gamma AI', slug: 'gamma-ai' },
  { name: 'Beautiful AI', slug: 'beautiful-ai' },
  { name: 'Canva AI', slug: 'canva-ai' },
  { name: 'HeyGen', slug: 'heygen' },
  { name: 'Pictory', slug: 'pictory' },
  { name: 'Descript', slug: 'descript' },
  { name: 'Otter AI', slug: 'otter-ai' },
  { name: 'Sora', slug: 'sora' },
  { name: 'DeepSeek', slug: 'deepseek' },
  { name: 'Grok', slug: 'grok' },
]

// ─── Tool sub-routes (detailed pages) ───
const TOOL_SUB_ROUTES = [
  'overview', 'how-to-use', 'features', 'problems', 'solutions', 'faq',
  'alternatives', 'download', 'resources', 'installation', 'setup',
  'login', 'signup', 'pricing', 'templates', 'keyboard-shortcuts',
  'api', 'automation', 'integrations', 'extensions', 'plugins',
  'error-codes', 'pros-cons', 'history', 'latest-update', 'news',
  'reviews', 'community', 'official-links',
]

// ─── XML Builder ───
function buildXML(urls) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ]

  for (const u of urls) {
    lines.push('  <url>')
    lines.push(`    <loc>${escapeXML(u.loc)}</loc>`)
    lines.push(`    <lastmod>${u.lastmod}</lastmod>`)
    lines.push(`    <changefreq>${u.changefreq}</changefreq>`)
    lines.push(`    <priority>${u.priority.toFixed(1)}</priority>`)
    lines.push('  </url>')
  }

  lines.push('</urlset>')
  lines.push('') // trailing newline
  return lines.join('\n')
}

function escapeXML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// ─── Main Generator ───
function generate(outDir = PUBLIC_DIR) {
  console.log('📂 Reading CSV...')
  const tools = parseCSV(CSV_PATH)
  console.log(`   Found ${tools.length} tools (status: Present)`)

  // Collect unique categories
  const categoryMap = new Map()
  tools.forEach(t => {
    if (!categoryMap.has(t.category)) {
      categoryMap.set(t.category, {
        name: t.category,
        slug: t.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      })
    }
  })
  const categories = Array.from(categoryMap.values())
  console.log(`   Found ${categories.length} categories`)

  console.log('\n🏗️  Building URL list...')
  const urls = []

  // 1. Homepage
  urls.push(url('/', 1.0, 'daily'))

  // 2. Main static pages
  urls.push(url('/tools', 0.9, 'daily'))
  urls.push(url('/ai-tools', 0.9, 'daily'))
  urls.push(url('/categories', 0.8, 'weekly'))
  urls.push(url('/trending', 0.7, 'daily'))
  urls.push(url('/new-tools', 0.7, 'daily'))
  urls.push(url('/popular', 0.7, 'daily'))
  urls.push(url('/about', 0.5, 'monthly'))
  urls.push(url('/contact', 0.5, 'monthly'))
  urls.push(url('/privacy', 0.3, 'monthly'))
  urls.push(url('/terms', 0.3, 'monthly'))
  urls.push(url('/blog', 0.6, 'weekly'))

  // Blog posts
  for (const post of BLOG_POSTS) {
    urls.push(url(`/blog/${post.slug}`, 0.6, 'monthly'))
  }

  // 3. Category pages
  for (const cat of categories) {
    urls.push(url(`/category/${cat.slug}`, 0.8, 'weekly'))
  }

  // 4. Tool pages (main page + sub-pages)
  for (const tool of tools) {
    const toolLoc = `/tools/${tool.slug}`
    urls.push(url(toolLoc, 0.7, 'weekly'))

    // Sub-pages: only include high-value ones
    const highValueSubs = ['how-to-use', 'features', 'faq', 'alternatives', 'pricing']
    for (const sub of highValueSubs) {
      urls.push(url(`${toolLoc}/${sub}`, 0.5, 'monthly'))
    }
  }

  // 5. AI Tool pages + sub-pages
  const AI_SUB_ROUTES = ['how-to-use', 'download', 'installation', 'features', 'pricing', 'pros-cons', 'alternatives', 'faq', 'security', 'tips']
  for (const ai of AI_TOOLS) {
    urls.push(url(`/ai-tools/${ai.slug}`, 0.7, 'weekly'))
    for (const sub of AI_SUB_ROUTES) {
      urls.push(url(`/ai-tools/${ai.slug}/${sub}`, 0.5, 'monthly'))
    }
  }

  console.log(`   Total URLs: ${urls.length}`)

  // ─── Generate sitemap.xml (dynamic, full) ───
  console.log('\n📝 Writing sitemap.xml...')
  const xml = buildXML(urls)
  const outputPath = path.join(outDir, 'sitemap.xml')
  fs.writeFileSync(outputPath, xml, 'utf-8')
  const fileSize = (Buffer.byteLength(xml, 'utf-8') / 1024).toFixed(1)
  console.log(`   ✅ sitemap.xml written (${fileSize} KB, ${urls.length} URLs)`)

  // ─── Generate sitemap-static.xml (essential pages only) ───
  console.log('\n📝 Writing sitemap-static.xml...')
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
  for (const cat of categories) {
    staticUrls.push(url(`/category/${cat.slug}`, 0.8, 'weekly'))
  }
  for (const tool of tools) {
    staticUrls.push(url(`/tools/${tool.slug}`, 0.7, 'weekly'))
  }
  for (const ai of AI_TOOLS) {
    staticUrls.push(url(`/ai-tools/${ai.slug}`, 0.7, 'weekly'))
  }

  const staticXML = buildXML(staticUrls)
  const staticPath = path.join(outDir, 'sitemap-static.xml')
  fs.writeFileSync(staticPath, staticXML, 'utf-8')
  const staticSize = (Buffer.byteLength(staticXML, 'utf-8') / 1024).toFixed(1)
  console.log(`   ✅ sitemap-static.xml written (${staticSize} KB, ${staticUrls.length} URLs)`)

  // ─── Generate rss.xml (blog feed) ───
  console.log('\n📝 Writing rss.xml...')
  const rssXML = buildRSS()
  const rssPath = path.join(outDir, 'rss.xml')
  fs.writeFileSync(rssPath, rssXML, 'utf-8')
  const rssSize = (Buffer.byteLength(rssXML, 'utf-8') / 1024).toFixed(1)
  console.log(`   ✅ rss.xml written (${rssSize} KB)`)

  // ─── Generate robots.txt (auto) ───
  console.log('\n📝 Writing robots.txt...')
  const robots = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /my-tools',
    'Disallow: /compare',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n')
  fs.writeFileSync(path.join(outDir, 'robots.txt'), robots, 'utf-8')
  console.log(`   ✅ robots.txt written`)

  // ─── Generate manifest.json (auto, PWA) ───
  console.log('\n📝 Writing manifest.json...')
  const manifest = {
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
    ],
  }
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8')
  console.log(`   ✅ manifest.json written`)

  return { urls: urls.length, staticUrls: staticUrls.length }
}

// ─── Blog posts (must match src/data/blog.ts) ───
const BLOG_POSTS = [
  { title: 'The Ultimate Guide to AI Tools in 2026', slug: 'ultimate-guide-ai-tools-2026', date: '2026-07-15', category: 'AI Tools', excerpt: 'Discover the best AI tools transforming how we work, create, and solve problems in 2026.' },
  { title: 'How to Master Any Digital Tool: A Step-by-Step Framework', slug: 'master-any-digital-tool-framework', date: '2026-07-10', category: 'Guides', excerpt: 'Learn our proven framework for mastering any digital tool quickly and effectively.' },
  { title: 'Top 10 Productivity Tools Every Professional Needs', slug: 'top-10-productivity-tools-2026', date: '2026-07-05', category: 'Productivity', excerpt: 'Boost your productivity with these essential tools for modern professionals.' },
  { title: 'Understanding AI: From Chatbots to Image Generation', slug: 'understanding-ai-chatbots-image-generation', date: '2026-06-28', category: 'AI', excerpt: 'A comprehensive overview of AI technologies and how they work in everyday tools.' },
  { title: 'Security Best Practices for Online Tools', slug: 'security-best-practices-online-tools', date: '2026-06-20', category: 'Security', excerpt: 'Stay safe online with these essential security practices for using digital tools.' },
  { title: 'The Future of Digital Tools: Trends to Watch', slug: 'future-digital-tools-trends', date: '2026-06-15', category: 'Trends', excerpt: 'Explore the emerging trends shaping the future of digital tools and technology.' },
]

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

// ─── Run ───
console.log('='.repeat(50))
console.log('  MegatoolsX Sitemap Generator')
console.log('='.repeat(50))
console.log(`  Site: ${SITE_URL}`)
console.log(`  Date: ${TODAY}`)
console.log('='.repeat(50))

const isDist = process.argv.includes('--dist')
const outDir = isDist ? path.join(ROOT, 'dist') : PUBLIC_DIR

const result = generate(outDir)

console.log('\n' + '='.repeat(50))
console.log('  ✅ Sitemap Generation Complete!')
const label = isDist ? 'dist' : 'public'
console.log(`  📄 ${label}/sitemap.xml        → ${result.urls} URLs`)
console.log(`  📄 ${label}/sitemap-static.xml → ${result.staticUrls} URLs`)
console.log('='.repeat(50))
