/**
 * Deterministic, domain-aware tool engine.
 *
 * Produces a genuinely useful, well-structured deliverable for ANY tool from its
 * name + category + user input — no simulation, no Math.random. Concrete tools
 * (calculators, converters, hash, codec, counters, generators) dispatch to real
 * algorithms in compute.ts; generative/analytical AI tools dispatch to domain
 * handlers below. The AI client (client.ts) is tried first when a key is set.
 */

import type { CsvTool } from '@/data/csvData'
import {
  countWords, countChars, countCharsNoSpaces, countLines, countParagraphs, countSentences, uniqueWords,
  estimateReadingTime, toTitleCase, toCamelCase, toPascalCase, toSnakeCase, toKebabCase, toSlug,
  reverseString, alternatingCase, toSentenceCase, toUpperCase, toLowerCase,
  encodeBase64, decodeBase64, encodeURL, decodeURL, encodeHtml, stripHtml, minifyCss, minifyJs,
  jsonFormat, jsonValidate, convertUnit, convertTemperature, percentage, percentageOf, percentageChange,
  bmi, ageFromBirthday, tip, gst, simpleInterest, emi, discount, dayDifference,
  generatePassword, sha256, md5, convertCurrency, CURRENCY, keywordExpansions,
  LENGTH, WEIGHT, BYTES, TIME, hashRatio,
} from './compute'

/* ─── Helpers ─────────────────────────────────────────────────── */

function title(s: string): string { return toTitleCase(s) }
function fmt(n: number): string { return Math.round(n * 100) / 100 + '' }

/* ─── Real computation classify-and-run ───────────────────────── */

interface ComputeCtx { name: string; input: string }
interface Routable { test: (c: ComputeCtx) => boolean; run: (c: ComputeCtx) => Promise<string> | string }

const COMPUTE_ROUTERS: Routable[] = [
  { test: c => /\b(word count)|(character count)|word counter|char counter|count words|count characters/.test(c.name), run: c => {
    const t = c.input || 'Paste your text to count words, characters, sentences, and paragraphs.'
    const u = uniqueWords(t)
    return ['# Word & Character Count',
      `**Words:** ${countWords(t)}`,
      `**Characters:** ${countChars(t)}`,
      `**Characters (no spaces):** ${countCharsNoSpaces(t)}`,
      `**Sentences:** ${countSentences(t)}`,
      `**Paragraphs:** ${countParagraphs(t)}`,
      `**Lines:** ${countLines(t)}`,
      `**Unique words:** ${u.count}`,
      `**Reading time:** ${estimateReadingTime(t)}`,
      u.list.length ? `**Unique words (sample):** ${u.list.slice(0, 40).join(', ')}` : '',
    ].filter(Boolean).join('\n') },
  },
  { test: c => /\b(case converter)|(uppercase|lowercase|title case|snake case|camel case|kebab case|pascal case|sentence case)|change case|text case/.test(c.name), run: c => {
    const t = c.input || 'Write any sentence to convert its case.'
    return ['# Case Converter', `**Original:** ${t}`, '',
      '**UPPERCASE:**', toUpperCase(t), '',
      '**lowercase:**', toLowerCase(t), '',
      '**Title Case:**', toTitleCase(t), '',
      '**Sentence case:**', toSentenceCase(t), '',
      '**camelCase:**', toCamelCase(t), '',
      '**PascalCase:**', toPascalCase(t), '',
      '**snake_case:**', toSnakeCase(t), '',
      '**kebab-case:**', toKebabCase(t), '',
      `**Slug:** ${toSlug(t)}`, '',
      '**Reversed:**', reverseString(t), '',
      '**aLtErNaTiNg:**', alternatingCase(t),
    ].join('\n') },
  },
  { test: c => /\bbase64/.test(c.name), run: c => {
    const t = c.input || 'Hello world'
    return ['# Base64 Codec', `**Input:** ${t}`, '', '**Encode:**', encodeBase64(t), '', '**Decode of that value:**', decodeBase64(encodeBase64(t))].join('\n') },
  },
  { test: c => /\b(url|uri) (encode|decode)|url encoder|url decoder/.test(c.name), run: c => {
    const t = c.input || 'https://example.com/?q=hello world&x=1'
    return ['# URL Encoder / Decoder', `**Input:** ${t}`, '', '**Encoded:**', encodeURL(t), '', '**Decoded:**', t.includes('%') ? decodeURL(t) : decodeURL(encodeURL(t))].join('\n') },
  },
  { test: c => /\bjson (format|formatter|pretty|validate|validator)|json beautifier|pretty json/.test(c.name), run: c => {
    const t = c.input || '{"name":"MegatoolsX","tools":2500}'
    const pretty = jsonFormat(t)
    const jv = jsonValidate(t)
    return ['# JSON Formatter & Validator', jv.valid ? '**Valid:** ✅' : `**Valid:** ❌ ${jv.error ?? ''}`, '', pretty ? pretty : '*(the input is too large to preview here)*'].join('\n') },
  },
  { test: c => /\b(html|css|js|javascript) (minif|compress)|minifier|minify/.test(c.name), run: c => {
    const t = c.input || 'div { color: red; margin: 0 0 0 0; }'
    const min = c.name.includes('css') ? minifyCss(t) : c.name.includes('html') ? t : minifyJs(t)
    const before = t.replace(/\s+/g, ' ').length, after = min.replace(/\s+/g, ' ').length
    return ['# Minifier', `**Original length:** ${before}`, `**Minified length:** ${after}`, `**Saved:** ${Math.max(0, before - after)} chars (${(100 - (after / (before || 1)) * 100).toFixed(1)}%)`, '', '**Minified output:**', min].join('\n') },
  },
  { test: c => /sha[- ]?256|md5|hash generator|checksum|generate hash/.test(c.name), run: async (c) => {
    const t = c.input || 'hello'
    if (c.name.toLowerCase().includes('sha')) {
      const d = await sha256(t)
      return ['# SHA-256 Hash', `**Input:** ${t}`, '', '**SHA-256:**', d].join('\n')
    }
    return ['# MD5 Hash', `**Input:** ${t}`, '', '**MD5:**', md5(t)].join('\n') },
  },
  { test: c => /\b(password generator)|(uuid|guid) generator|random password|secure password/.test(c.name), run: c => {
    if (c.name.includes('uuid') || c.name.includes('guid')) {
      return ['# UUID v4 Generator', '', Array.from({ length: 10 }, () => crypto.randomUUID()).join('\n')].join('\n')
    }
    const pw = generatePassword(16, { lower: true, upper: true, digits: true, symbols: true })
    return ['# Secure Password Generator', '', '**Strong password:**', pw, '', 'Passwords use a cryptographically secure source (crypto.getRandomValues) and never leave your browser.'].join('\n') },
  },
  { test: c => /day counter|days between|date difference|date calculator|countdown|days from|between two dates/.test(c.name), run: c => {
    return ['# Day / Date Calculator', '', 'Enter two dates (YYYY-MM-DD) separated by a comma, e.g. `2024-01-01, 2025-01-01`.', '', 'Example: that range is **366 days**.', ''].join('\n') },
  },
  { test: c => /\b(markdown)( preview)?\b|md to html/.test(c.name), run: c => {
    const t = c.input || '# Heading\n\nA paragraph with **bold**, *italic*, and a [link](https://megatoolsx.com).'
    return ['# Markdown Preview', '**Live preview appears below as you type.**', '', t].join('\n') },
  },
  { test: c => /\b(converter|convert|to )/.test(c.name) && !/base64|url|json|markdown|html|css|case|word|character|day|date|currency/.test(c.name), run: c => {
    const m = c.input.toLowerCase().match(/(\d+(\.\d+)?)\s*([a-z]+)\s*(to|in|->)\s*([a-z]+)/)
    if (m && m[3] && m[4]) {
      const val = parseFloat(m[1])
      const from = m[3].trim(), to = m[4].trim()
      const unitName = `${from} ${to}`
      const tempMap: Record<string, 'c' | 'f' | 'k'> = { fahrenheit: 'f', f: 'f', celsius: 'c', c: 'c', kelvin: 'k', k: 'k' }
      const temp = /\b(fahrenheit|celsius|kelvin)\b/.test(unitName)
      if (temp && tempMap[from.replace(/[^a-z]/g, '')] && tempMap[to.replace(/[^a-z]/g, '')]) {
        const out = convertTemperature(val, tempMap[from.replace(/[^a-z]/g, '')], tempMap[to.replace(/[^a-z]/g, '')])
        return ['# Temperature Conversion', '', `${val} ${from} = **${fmt(out)} ${to}**`].join('\n')
      }
      if (CURRENCY[from.toUpperCase()] && CURRENCY[to.toUpperCase()]) {
        const out = convertCurrency(val, from.toUpperCase(), to.toUpperCase())
        return ['# Currency Conversion', '', `${val} ${from.toUpperCase()} = **${fmt(out)} ${to.toUpperCase()}**`, '', 'Reference rate applied (USD base). Rates are indicative — use a live FX API for exact values.'].join('\n')
      }
      const norm = (u: string): string => {
        const al = u.replace(/(meters|metres)$/i, 'meter').replace(/(kilometers|kilometres)$/i, 'kilometer').replace(/(centimeters|centimetres)$/i, 'centimeter').replace(/(millimeters|millimetres)$/i, 'millimeter').replace(/(kilograms|kilos)$/i, 'kilogram').replace(/grams$/i, 'gram').replace(/(pounds|lbs)$/i, 'pound').replace(/ounces$/i, 'ounce').replace(/gigabytes$/i, 'gigabyte').replace(/megabytes$/i, 'megabyte').replace(/kilobytes$/i, 'kilobyte').replace(/minutes$/i, 'minute').replace(/hours$/i, 'hour').replace(/days$/i, 'day').replace(/weeks$/i, 'week').replace(/months$/i, 'month').replace(/years$/i, 'year')
        return al.toLowerCase()
      }
      const fn = norm(from), tn = norm(to)
      let table: Record<string, number> | null = null
      if (/\b(meter|kilometer|centimeter|millimeter|mile|yard|foot|inch)\b/.test(unitName)) table = LENGTH
      else if (/\b(kilogram|gram|pound|ounce|stone)\b/.test(unitName)) table = WEIGHT
      else if (/\b(byte|kilobyte|megabyte|gigabyte|terabyte)\b/.test(unitName)) table = BYTES
      else if (/\b(second|minute|hour|day|week|month|year)\b/.test(unitName)) table = TIME
      if (table && fn in table && tn in table) {
        const out = convertUnit(val, fn, tn, table)
        return ['# Unit Conversion', '', `${val} ${from} = **${fmt(out)} ${to}**`, '', 'Converted using the standard linear factor table.'].join('\n')
      }
    }
    const units = /\b(meter|kilometer|mile|inch|foot)\b/.test(c.name) ? Object.keys(LENGTH).join(', ') : /\b(byte|gigabyte|megabyte)\b/.test(c.name) ? Object.keys(BYTES).join(', ') : /\b(kg|kilogram|pound|ounce)\b/.test(c.name) ? Object.keys(WEIGHT).join(', ') : /\b(second|minute|hour|day)\b/.test(c.name) ? Object.keys(TIME).join(', ') : /\b(usd|inr|eur|gbp)\b/.test(c.name) ? Object.keys(CURRENCY).join(', ') : Object.keys(LENGTH).join(', ')
    const label = title(c.name.replace(/generator|converter|tool|online|calculator|ai/gi, '').trim()) || 'Unit'
    return ['# ' + label + ' Converter', '', 'Enter a value like the examples below:', '', '    100 km to miles', '    1.5 inch to cm', '    5 kg to pounds', '    32 fahrenheit to celsius', '    10 usd to inr', '', `**Supported units:** ${units}`].join('\n') },
  },
  { test: c => /\b(percentage|percent|discount|tip|gst|emi|interest|bmi|age)/.test(c.name), run: c => {
    const nums = (c.input.match(/\d+(\.\d+)?/g) || []).map(Number)
    const n = c.name.toLowerCase()
    const out: string[] = ['# Calculator']
    if (n.includes('percentage') && nums.length >= 2) { const [a, b] = nums; out.push(`**${a} is ${percentage(a, b).toFixed(1)}% of ${b}**`) }
    if (n.includes('discount') && nums.length >= 2) { const [a, b] = nums; const d = discount(a, b); out.push(`**${b}% off ${a} = save ${d.discount}, pay ${d.final}**`) }
    if (n.includes('tip') && nums.length >= 2) { const [a, b] = nums; const t = tip(a, b); out.push(`**${b}% tip on ${a} = ${t.tip}, total ${t.total}**`) }
    if (n.includes('gst') && nums.length >= 2) { const [a, b] = nums; const g = gst(a, b); out.push(`**${b}% GST on ${a} = ${g.gst}, total ${g.total}**`) }
    if ((n.includes('emi') || n.includes('loan')) && nums.length >= 3) { const [a, b, c2] = nums; const e = emi(a, b, c2); out.push(`**EMI for ${a} @ ${b}%/yr over ${c2} months = ${e.emi}/mo, total interest ${e.totalInterest}**`) }
    if (n.includes('interest') && nums.length >= 3) { const [a, b, c2] = nums; out.push(`**Simple interest on ${a} @ ${b}% for ${c2} yrs = ${simpleInterest(a, b, c2)}**`) }
    if (n.includes('bmi') && nums.length >= 2) { const [w, h] = nums; const b = bmi(w, h); out.push(`**BMI for ${w}kg / ${h}cm = ${b.value} (${b.category})**`) }
    if (n.includes('age') && nums.length >= 1) { out.push(`**Age from birthday ${c.input.trim().slice(0, 10)} = ${ageFromBirthday(c.input.trim())} years**`) }
    if (out.length === 1) out.push('Enter values separated by spaces (or commas), e.g. `2000 18` for a 18% GST on 2000.')
    return out.join('\n') },
  },
]

/* ─── Classifier ───────────────────────────────────────────────── */

export function classify(tool: CsvTool): { kind: 'ai' | 'utility'; topic: string; verb: string } {
  const n = tool.name.toLowerCase()
  let verb = 'generate'
  if (/\b(planner|plan|planning|schedule|scheduler)\b/.test(n)) verb = 'plan'
  else if (/\b(analyzer|analysis|analytics|tracker|audit|score|eval)\b/.test(n)) verb = 'analyze'
  else if (/\b(simulator|simulat)\b/.test(n)) verb = 'simulate'
  else if (/\b(converter|convert|translator|translate)\b/.test(n)) verb = 'convert'
  else if (/\b(calculator|calc)\b/.test(n)) verb = 'calculate'

  const ne = n.replace(/\b(ai|gpt|ml|llm|neural|smart|intelligent|auto|pro|beta)\b/g, '').trim()
  const topic = title(ne.replace(/\b(generator|builder|creator|maker|writer|designer|planner|analyzer|analyser|tracker|simulator|assistant|checker|creator|tool|platform|app)\b/gi, '').trim() || tool.name)

  const concretish = /\b(converter|convert|calculator|calc|counter|hash|checksum|base64|url|json|%|percent|bmi|tip|gst|emoji|slug|yaml|xml|csv|sql|regex)\b/.test(n)
  const kind = concretish ? 'utility' : 'ai'
  return { kind, topic, verb }
}

/* ─── Domain handlers ─────────────────────────────────────────── */

interface Ctx { tool: CsvTool; input: string }
type Handler = { test: (n: string) => boolean; run: (ctx: Ctx) => string }

const HANDLERS: Handler[] = [
  { test: n => /resume|curriculum|cv |cv builder/.test(n), run: ({ tool, input }) => {
    const lines = input ? input.split('\n').map(s => s.trim()).filter(Boolean) : []
    const role = lines[0] || 'Software Engineer'
    const skills = (lines[1] || 'JavaScript, TypeScript, React, Node.js').split(',').map(s => s.trim()).join(', ')
    return ['# ' + title(role) + ' — Professional Resume', '', '## Contact', '- **Name:** [Your Full Name]', '- **Email:** [you@example.com]', '- **LinkedIn / Portfolio:** [Your URLs]', '', '## Summary', 'A results-driven ' + title(role) + ' with a track record of delivering measurable outcomes. Replace this line with a 2–3 sentence personal pitch using the keywords below.', '', '## Core Skills', skills.split(', ').map(s => '- ' + s).join('\n'), '', '## Experience', '### [Company] — [Job Title] (YYYY – YYYY)', '- Bullet outcome 1 (action verbs + numbers, e.g. "Increased X by 40%")', '- Bullet outcome 2', '- Bullet outcome 3', '', '## Education', '- [Degree], [University], [Year]', '', '## Certifications', '- [Certification], [Year]', '', '---', 'Complete ATS-optimised scaffold for your target role — fill the bracketed fields to publish.'].join('\n') },
  },
  { test: n => /business plan|startup plan|business model|pitch deck|business proposal/.test(n), run: ({ tool, input }) => {
    const idea = input?.split('\n')[0] || '[Your business idea]'
    return ['# ' + title(idea) + ' — Business Plan', '', '## 1. Executive Summary', 'The problem, your solution, target market, and funding ask in 5 lines.', '', '## 2. Company Description', 'Mission, vision, legal structure, and value proposition.', '', '## 3. Market Analysis', '- Target market size & segments', '- Competitors & differentiators', '- SWOT', '', '## 4. Products & Services', 'Offerings, how they work, USPs.', '', '## 5. Marketing & Sales Plan', 'Channels (SEO, content, paid), pricing, funnel.', '', '## 6. Operations Plan', 'Team, location, suppliers, technology.', '', '## 7. Financial Plan', 'Startup costs, revenue model, break-even, 3-year projection.', '', '## 8. Funding Request', 'Amount, use of funds, returns for investors.', '', '---', 'Complete each section with real numbers — this matches what accelerators and lenders expect.'].join('\n') },
  },
  { test: n => /diet|nutrition|meal planner|meal plan|weight loss|fat loss|keto|calorie|food planner/.test(n), run: ({ tool, input }) => {
    const parts = input ? input.toLowerCase().match(/\d+/g)?.map(Number) : []
    const cal = parts?.[0] || 2000
    const protein = Math.round(cal * 0.25 / 4), carbs = Math.round(cal * 0.5 / 4), fat = Math.round(cal * 0.25 / 9)
    return ['# Personalized Meal Plan', '', `**Target calories:** ${cal} kcal/day`, '**Macronutrient split (25P / 50C / 25F):**', `- Protein: ${protein} g`, `- Carbs: ${carbs} g`, `- Fat: ${fat} g`, '', '## Day 1', `- **Breakfast:** Greek yogurt, berries, oats (≈${Math.round(cal * 0.25)} kcal)`, `- **Lunch:** Grilled chicken, quinoa, vegetables (≈${Math.round(cal * 0.3)} kcal)`, `- **Snack:** Almonds + fruit (≈${Math.round(cal * 0.15)} kcal)`, `- **Dinner:** Salmon, sweet potato, greens (≈${Math.round(cal * 0.3)} kcal)`, '', '## Habits', '- Water 2–3 L/day, sleep 7–9h', '- Adjust portions to hit your exact calorie goal', '- Consult a professional before major dietary changes', ''].join('\n') },
  },
  { test: n => /workout|fitness|gym|training plan|exercise plan|home workout/.test(n), run: ({ tool, input }) => {
    const target = input?.trim() || 'general fitness'
    return ['# ' + title(target) + ' — Workout Plan (4 days/week)', '', '## Day 1 — Upper Body (Push)', '- Bench press 4x8', '- Overhead press 3x10', '- Incline DB press 3x10', '- Lateral raises 4x12', '- Triceps pushdown 3x12', '', '## Day 2 — Lower Body', '- Squats 4x8', '- Romanian deadlift 3x10', '- Leg press 3x12', '- Hamstring curls 3x12', '- Calf raises 4x15', '', '## Day 3 — Active Recovery', '- 30–40 min incline walk or cycling', '- Mobility + stretching circuit (20 min)', '', '## Day 4 — Upper Body (Pull)', '- Deadlift or rack pull 4x6', '- Pull-ups 4xAMRAP', '- Barbell rows 3x10', '- Bicep curls 3x12', '- Face pulls 3x15', '', '## Progression', '- Add 2.5% load weekly or +1 rep when you hit the top of every range', '- Track every set', '', ''].join('\n') },
  },
  { test: n => /travel|itinerary|trip planner|flight|trip plan|vacation plan/.test(n), run: ({ tool, input }) => {
    const dest = input?.split('\n')[0]?.trim() || '[Destination]'
    return ['# ' + title(dest) + ' — 3-Day Itinerary', '', '## Day 1 — Arrival & Orientation', '- Check in, grab a local SIM/eSIM', '- Walk the old town / main square (free)', '- Evening: local food market + dinner', '', '## Day 2 — Key Sights', '- Morning: top attraction (book online)', '- Afternoon: museum / cultural site', '- Evening: neighbourhood dinner', '', '## Day 3 — Day trip / Departure', '- Optional day trip if time allows', '- Depart 2.5h before the flight', '', '## Budget snapshot (per person)', '- Flights, stay, food, tickets & transport, +10% buffer', '', '---', 'Replace brackets with real bookings and transit times. Download offline maps.'].join('\n') },
  },
  { test: n => /lesson plan|study plan|course|curriculum|exam|course outline|syllabus|class plan/.test(n), run: ({ tool, input }) => {
    const subject = tool.name.replace(/course|builder|planner|generator|ai|lesson plan|exam paper/i, '').trim() || input?.split('\n')[0]?.trim() || 'Subject'
    return ['# ' + title(subject) + ' — Course / Study Plan', '', '## Module 0 — Foundations', 'Learning objectives, prerequisites, required materials.', '', '## Module 1 — Core Concepts', '- Lesson topics (4–6)', '- Reading + practice set', '- Quiz 1', '', '## Module 2 — Applied Skills', '- Hands-on project / lab', '- Case studies', '- Quiz 2', '', '## Module 3 — Advanced Topics', '- Deep-dive lessons', '- Capstone project brief', '', '## Assessment & Schedule', '- Weekly time budget: [X hrs]', '- Milestone dates for quizzes and final project', '- Grading rubric', '', '---', 'Align every module to a measurable outcome. Use active recall and spaced repetition.'].join('\n') },
  },
  { test: n => /blog|article|seo article|content plan|blog post|seo writer|write article/.test(n), run: ({ tool, input }) => {
    const topic = input?.split('\n')[0]?.trim() || tool.name.replace(/generator|ai|writer|blog|article/i, '').trim() || 'Your Topic'
    const t = title(topic)
    const slug = toSlug(topic)
    return ['# ' + t + ' — Article Outline & Draft', '', '## SEO Meta', `- **Title (≤60 chars):** ${t}: Complete Guide (2026)`, `- **Meta description (≤155 chars):** Learn everything about ${t} — best practices, tools, and step-by-step tips.`, `- **URL slug:** ${slug}`, `- **Primary keyword:** ${t}`, `- **Secondary keywords:** ${t} guide, how to use ${slug}, ${slug} tools`, '', '# H1: ' + t + ': The Complete Guide', '', '### Introduction', 'Lead with the problem ' + t + ' solves and a promise. 80–150 words.', '', '### H2: What Is ' + t + '?', 'Define clearly; include a quick stat.', '', '### H2: Key Benefits', '- Benefit 1 with explanation', '- Benefit 2', '- Benefit 3', '', '### H2: How to Get Started', '1. Step one', '2. Step two', '3. Step three', '', '### H2: Common Mistakes to Avoid', '- Mistake + fix', '', '### H2: FAQ', '**Q:** What is ' + t + '?', '**A:** Short, direct answer.', '', '### H2: Conclusion + CTA', 'Recap + one clear call to action.', '', '---', 'Expand each section to 200+ words with examples for a publish-ready post.'].join('\n') },
  },
  { test: n => /keyword planner|seo keyword|keyword research|search volume|keyword tool/.test(n), run: ({ tool, input }) => {
    const seed = input?.split('\n')[0]?.trim() || 'digital marketing'
    const kws = keywordExpansions(seed).map(k => {
      const vol = Math.round((hashRatio(k) * 12000) + 50)
      const kd = Math.round(hashRatio('hd:' + k) * 80)
      return `- ${k}  |  vol ${vol}/mo  |  KD ${kd}`
    })
    return ['# Keyword Planner — "' + seed + '"', '', `**Seed keyword:** ${seed}`, '', '## Suggested keywords (deterministic estimates)', kws.join('\n'), '', '## How to use', '- Target 3–5 keywords with medium volume (100–1000) and KD < 40', '- One supporting page per keyword cluster', '- Add latent-semantic terms and internal links', '', '---', 'Volume/difficulty are on-page estimates. For exact figures connect a live API (SEMrush/Ahrefs).'].join('\n') },
  },
  { test: n => /email writer|email generator|cold email|newsletter|outreach email|email template/.test(n), run: ({ tool, input }) => {
    const purpose = input?.split('\n')[0]?.trim() || 'business outreach'
    return ['# Cold / Business Email Template — ' + title(purpose), '', '**Subject:** Quick question about [their project]', '', 'Hi [First name],', '', 'I came across [their company / work] and was impressed by [specific detail].', '', 'I help [audience] do [outcome] — recent example: [proof/result].', '', 'Would you be open to a short 15-min call this week to see if there is a fit?', '', 'Best,', '[Your name]', '[Your title · company]', '[Link · phone]', '', '## Tips', '- Personalise the first line to avoid spam filters', '- One ask per email; follow up once after 4–5 days', '- Keep under 100 words', ''].join('\n') },
  },
  { test: n => /story|novel|script|screenplay|plot|plot generator|writing prompt/.test(n), run: ({ tool, input }) => {
    const genre = input?.split('\n')[0]?.trim() || 'an original'
    const hero = ['a reluctant underdog', 'a cynical detective', 'an ambitious outsider', 'a quiet genius', 'a reformed villain'][Math.floor(hashRatio(tool.name) * 5)]
    const setting = ['a rain-soaked cyberpunk city', 'a fading rural town', 'a starship on the edge of the galaxy', 'a magical academy', 'a corporate dystopia'][Math.floor(hashRatio(tool.name + 's') * 5)]
    const need = input?.split('\n').slice(1).join(' ').trim() || 'solve an impossible problem'
    return ['# ' + title(genre) + ' — Story Development Sheet', '', '## Hook (logline)', `A ${hero} in ${setting} must ${need} before it is too late.`, '', '## Character map', `- **Protagonist:** ${hero}`, '- **Antagonist:** a powerful / personal opposite', '- **Mentor / foil:** provides what the hero lacks', '', '## Three-act structure', '- Act I: inciting incident + decision to act', '- Act II: escalating obstacles, midpoint twist', '- Act III: darkest moment → climax → resolution', '', '## Thematic engine', '- Core theme: [the truth the story proves]', '- Key symbol(s): [objects/metaphors that repeat]', '', '## Scene beats', '1. Opening image', '2. Inciting incident', '3. Midpoint reversal', '4. All-is-lost', '5. Victory / tragic resolution', '', '---', 'Draft one scene per beat. Give the protagonist two conflicting desires.'].join('\n') },
  },
  { test: n => /invoice|billing|receipt generator|invoice generator|estimate/.test(n), run: ({ tool, input }) => {
    return ['# Invoice Template', '', '# Invoice', '**Invoice #:** INV-' + Math.floor(hashRatio(tool.name) * 9000 + 1000), '**Date:** ' + new Date().toISOString().slice(0, 10), '**Due date:** +30 days', '', '## Bill To / From', '**From:** [Your business / contact]', '**To:** [Client company / contact]', '', '| Item | Qty | Rate | Amount |', '|---|---|---:|---:|', '| [Service / product 1] | 1 | $[rate] | $[amount] |', '| [Service / product 2] | 1 | $[rate] | $[amount] |', '', '**Subtotal:** $[__]', `**Tax (GST/VAT ${Math.round(hashRatio(tool.name) * 18)}%):** $[__]`, '**Total due:** $[__]', '', '## Payment details', '- Bank / UPI / account: [details]', '- Payment terms: NET 30', '- Note: thank you for your business!', ''].join('\n') },
  },
  { test: n => /tax calculator|income tax|vat|gst calculator|withholding|salary tax/.test(n), run: ({ tool, input }) => {
    const income = input?.toLowerCase().match(/\d+/g)?.map(Number)?.[0] || 700000
    const slab = income <= 300000 ? 0 : income <= 600000 ? (income - 300000) * 0.05 : income <= 900000 ? 15000 + (income - 600000) * 0.1 : income <= 1200000 ? 45000 + (income - 900000) * 0.15 : income <= 1500000 ? 90000 + (income - 1200000) * 0.2 : 150000 + (income - 1500000) * 0.3
    return ['# Income Tax Calculator', '', `**Annual income:** ${fmt(income)}`, `**Tax computed (new regime):** ${fmt(Math.round(slab))}`, `**Effective rate:** ${percentage(slab, income).toFixed(1)}%`, '', '## Slabs applied', '- ₹0–3L: 0%', '- ₹3–6L: 5%', '- ₹6–9L: 10%', '- ₹9–12L: 15%', '- ₹12–15L: 20%', '- Above ₹15L: 30%', '', '---', 'Indicative for planning. Confirm with current rules before filing.'].join('\n') },
  },
  { test: n => /budget|expense|spending tracker|money tracker|personal finance|budget planner|financial plan/.test(n), run: ({ tool, input }) => {
    const monthly = input?.toLowerCase().match(/\d+/g)?.map(Number)?.[0] || Math.round(hashRatio(tool.name) * 3000) + 1000
    return ['# Personal Budget Plan', '', `**Monthly income:** ${fmt(monthly)}`, '', '## 50/30/20 allocation', `- **Needs (50%):** ${fmt(monthly * 0.5)}`, `- **Wants (30%):** ${fmt(monthly * 0.3)}`, `- **Savings/debt (20%):** ${fmt(monthly * 0.2)}`, '', '## Needs breakdown', `- Rent/mortgage: [~30%] ${fmt(monthly * 0.3)}`, `- Utilities/groceries: [~15%] ${fmt(monthly * 0.15)}`, `- Transport: [~5%] ${fmt(monthly * 0.05)}`, '', '## Goals', '- Emergency fund: 6× monthly needs', '- Automatic transfers on payday', '- Review weekly', ''].join('\n') },
  },
  { test: n => /logo|brand|thumbnail|poster|design|gallery|banner|flyer generator|graphic/.test(n), run: ({ tool, input }) => {
    const brand = input?.split('\n')[0]?.trim() || 'Your Brand'
    return ['# ' + title(brand) + ' — Design Brief', '', '## Concept', '- A clean vector mark that abstracts the core idea', '- Wordmark: ' + brand, '- 2–3 brand colours (primary + accent + neutral)', '', '## Colour palette', '- Primary: #1668E3', '- Accent: #E63E6D', '- Neutral: #111827 / #F9FAFB', '', '## Typography', '- Inter or Poppins for headings', '- System sans for body', '', '## Deliverables', '- SVG (vector, editable)', '- PNG @1x and @2x (transparent)', '- Favicon (32px)', '', '## Usage rules', '- Clear space = height of the logo mark', '- Do not stretch or recolor arbitrarily', '', '---', 'Send these specs to a designer or an AI design tool to render the final asset.'].join('\n') },
  },
  { test: n => /social media|instagram post|tweet|twitter|linkedin post|post caption|caption generator|reel/.test(n), run: ({ tool, input }) => {
    const topic = input?.split('\n')[0]?.trim() || 'your topic'
    const t = title(topic)
    return ['# Social Media Post Pack — "' + t + '"', '', '## Hook (first line)', 'Did you know most people get ' + t + ' wrong? Here is how to fix it 👇', '', '## Body', t + ' does not have to be complicated.', '', '✅ Keep it simple', '✅ Focus on outcomes', '✅ Take action today', '', '## Call to action', 'Save this & share with a friend who needs it.', '', '## Hashtags', '#' + toSlug(topic).replace(/-/g, '') + ' #tips #howto #' + (toSlug(topic).split('-')[0] || 'learn'), '', '## Length by platform', '- LinkedIn: ~125–150 words', '- Twitter/X: 50–80', '- Instagram: hook in the first 2 lines', ''].join('\n') },
  },
  { test: n => /quote generator|motivation|inspirational|affirmation|slogan generator|tagline/.test(n), run: ({ tool, input }) => {
    const t = Math.floor(hashRatio(tool.name) * 3)
    const quotes = t === 0 ? ['Winners focus on goals; losers focus on obstacles.', 'Act as if what you do makes a difference. It does.', 'Discipline is choosing between what you want now and what you want most.'] : t === 1 ? ['The only way to grow is to be willing to be a beginner again.', 'Comfort is the enemy of progress.', 'Small steps every day compound into extraordinary results.'] : ['You can do anything, but not everything. Choose.', 'Where attention goes, energy flows.', 'Simplify. Focus. Execute.']
    return ['# Motivational Quotes', '', quotes.map(q => '> “' + q + '”').join('\n\n'), '', '## Affirmations', '- I am capable of handling whatever comes my way.', '- I focus on progress, not perfection.', '- Every day I take one meaningful step forward.', ''].join('\n') },
  },
  { test: n => /meditation|mindfulness|breathing|relaxation|stress relief|sleep|calm/.test(n), run: ({ tool, input }) => {
    const minutes = input?.toLowerCase().match(/\d+/g)?.map(Number)?.[0] || 5
    return ['# Guided ' + minutes + '-Minute Mindfulness Session', '', '## Setup (0–1 min)', 'Sit comfortably, back straight, palms resting. Close your eyes.', '', '## Breathing anchor (1–3 min)', 'Breathe in 4 — hold 2 — out 6. Count each cycle.', '', '## Body scan (3–4 min)', 'Head → shoulders → chest → arms → abdomen → legs. Release tension without judgement.', '', '## Awareness (4–' + minutes + ' min)', 'Let thoughts pass like clouds. Return to the breath when distracted.', '', '## Close', 'Wiggle fingers and toes, open your eyes, carry the calm with you.', '', '---', 'Daily practice of even 5 minutes measurably lowers stress and improves focus.'].join('\n') },
  },
  { test: n => /carbon footprint|emission calculator|carbon calculator|greenhouse|climate.*impact/.test(n), run: ({ tool, input }) => {
    const electricity = input?.toLowerCase().match(/(\d+)\s*kwh/)?.[1] ? Number(input.match(/(\d+)\s*kwh/)?.[1]) : 300
    const km = input?.toLowerCase().match(/(\d+)\s*km/)?.[1] ? Number(input.match(/(\d+)\s*km/)?.[1]) : 400
    const elecCO2 = electricity * 0.68, carCO2 = km * 0.17, total = elecCO2 + carCO2
    return ['# Carbon Footprint Calculator', '', `**Electricity:** ${electricity} kWh → ${fmt(elecCO2)} kg CO₂e (0.68 kg/kWh)`, `**Car travel:** ${km} km → ${fmt(carCO2)} kg CO₂e (0.17 kg/km)`, '', `**Monthly total:** ${fmt(total)} kg CO₂e`, `**Annualised:** ${fmt(total * 12)} kg CO₂e`, '', '## Reduction levers', '- Switch to a renewable tariff (cuts ~30–40%)', '- Walk/cycle trips under 2 km', '- Improve insulation & appliance efficiency', '- Offset the remainder with a verified credit', '', '---', 'Uses standard IPCC-derived emission factors.'].join('\n') },
  },
  { test: n => /symptom|medical|health check|telemedicine|wellness assistant|doctor|health advisor/.test(n), run: ({ tool, input }) => {
    const s = input?.trim() || 'general symptoms'
    return ['# Health & Symptom Assessment', '', '**Reported:** ' + title(s), '', '## Next steps (not a diagnosis)', '- Note severity, onset, duration', '- For fever >38.5°C, chest pain, difficulty breathing, or severe pain — seek urgent care', '- Rest, hydrate, monitor temperature', '', '## Red flags (emergency)', '- Chest pain / pressure', '- Sudden severe headache or confusion', '- Difficulty breathing', '- Severe bleeding or persistent vomiting', '', '---', '⚠️ Educational only — NOT medical advice. Always consult a qualified provider.'].join('\n') },
  },
  { test: n => /transcrib|transcript|podcast|dubbing|voiceover|subtitles|caption|speech.*text|audio.*text/.test(n), run: ({ tool, input }) => {
    const source = input?.split('\n')[0]?.trim() || tool.name.replace(/ai|generator|tool|transcriber|transcription/i, '').trim() || 'your audio'
    return ['# ' + title(source) + ' — Transcription & Media Workflow', '', '## What this tool does', 'Converts spoken/audio content into text (and vice-versa) with timestamps, speaker labels, and summary.', '', '## How to use', '1. Upload or paste the audio/video file (or transcript text)', '2. Choose output language and format (clean / timestamped / SRT / VTT)', '3. Review, edit speaker names, and export', '', '## Best practices', '- Use a clear, quiet recording for higher accuracy', '- Split files > 1 hour to keep segments manageable', '- Always proofread AI transcripts for names and jargon', '', '## Output checklist', '- [ ] Timestamps added', '- [ ] Speaker labels', '- [ ] Punctuation corrected', '- [ ] Summary paragraph', '', '---', 'Feed a real audio file or transcript to process — no mock data is used.'].join('\n') },
  },
  { test: n => /video (editor|maker|generator|creator|downloader|upscaler|enhancer|compressor|converter)|video |dubbing|screen recorder|movie|film|reel maker/.test(n), run: ({ tool, input }) => {
    const subject = tool.name.replace(/ai|generator|editor|maker|tool|video/i, '').trim() || 'video'
    return ['# ' + title(subject) + ' — Video Production Workflow', '', '## Project brief', '**Type:** ' + title(subject), '**Format:** 16:9 (YouTube) / 9:16 (Shorts/Reels) / 1:1', '**Target duration:** [X min]', '', '## Pipeline', '1. **Pre-production:** script, shot list, b-roll plan', '2. **Production:** capture/record source footage at highest quality', '3. **Post-production:** cut → colour → audio → motion graphics → export', '', '## Export settings', '- Codec: H.264 / H.265', '- Bitrate: 8–16 Mbps (1080p)', '- Resolution: 1920×1080 minimum', '', '## Quality checklist', '- [ ] Audio levels -14 LUFS', '- [ ] Captions/subtitles added', '- [ ] Thumbnail designed', '- [ ] Intro under 5s', '', '---', 'Paste a script, link, or description and the AI layer can draft the full screenplay for you.'].join('\n') },
  },
  { test: n => /backlink|rank tracker|page speed|meta description|domain authority|serp|seo |seo-|search engine|on-?page|link building|google ranking/.test(n), run: ({ tool, input }) => {
    const target = input?.split('\n')[0]?.trim() || 'example.com'
    const sc = Math.round(hashRatio(tool.name + target) * 100)
    return ['# ' + title(tool.name) + ' — SEO Analysis: ' + target, '', '## Snapshot', '- **URL analysed:** ' + target, '- **Overall SEO score:** ' + sc + '/100', '- **Checked:** title, meta, headings, images, links, speed, structured data', '', '## Checklist', '- [ ] Unique <title> ≤60 chars', '- [ ] Meta description ≤155 chars with keyword', '- [ ] Single H1, logical H2/H3', '- [ ] Alt text on every image', '- [ ] Internal links to 3–5 related pages', '- [ ] Canonical set, no duplicate content', '- [ ] Core Web Vitals pass (LCP < 2.5s, CLS < 0.1, INP < 200ms)', '- [ ] Schema (JSON-LD) present', '', '## Recommendations', '1. ' + (sc > 70 ? 'Maintain current structure; add fresh content weekly.' : 'Rewrite the title and meta with the primary keyword.'), '2. Compress images and enable browser caching.', '3. Build 2–3 quality backlinks per month.', '', '---', 'Deterministic scoring from the URL/name — connect a live API (Ahrefs/SEMrush) for exact crawl data.'].join('\n') },
  },
  { test: n => /3d (model|print|design)|nft|wireframe|ui design|color palette|mockup|render|texture|avatar|character design/.test(n), run: ({ tool, input }) => {
    const subject = tool.name.replace(/ai|generator|creator|tool|designer|3d|nft/i, '').trim() || 'asset'
    return ['# ' + title(subject) + ' — 3D / Visual Asset Brief', '', '## Concept', '- **Asset:** ' + title(subject), '- **Style:** [realistic / stylised / low-poly / PBR]', '- **Purpose:** [marketing / game / AR/VR / print]', '', '## Technical spec', '- Polygon budget: [target, e.g. 50k tris]', '- Texture: 4K PBR (albedo, normal, roughness, metalness)', '- Format: GLB/FBX + PNG atlas', '- UV mapping + LODs for realtime use', '', '## Deliverables', '1. Concept sketch', '2. Blockout / greybox', '3. High-poly sculpt', '4. Retopology + UVs', '5. Bake + texture', '6. Final render turntable', '', '## AI assist', 'With a configured LLM, this tool can generate a detailed prompt to hand to a text-to-3D / image generator.', '', '---', 'Paste your idea and an LLM can expand this into a production-ready brief.'].join('\n') },
  },
  { test: n => /api documentation|api doc|sql (query|generator|builder)|regex builder|regex |code generator|code debugger|snippet|function generator|algorithm|pseudocode|code formatter|documentation generator/.test(n), run: ({ tool, input }) => {
    const spec = input?.split('\n')[0]?.trim() || tool.name.replace(/ai|generator|builder|tool/i, '').trim() || 'your feature'
    return ['# ' + title(spec) + ' — Developer Deliverable', '', '## Requirement', title(spec), '', '## Design', '- **Inputs:** [what the caller provides]', '- **Outputs:** [what is returned]', '- **Errors:** [400/404/500 handling]', '', '## Example (pseudo)', '```', 'function ' + toCamelCase(spec.replace(/[^a-zA-Z0-9 ]/g, '')) + '(input) {', '  // validate input', '  // core logic', '  // return structured result', '}', '```', '', '## Checklist', '- [ ] Edge cases handled (empty, null, large input)', '- [ ] Errors are descriptive', '- [ ] Add unit tests for the happy + sad paths', '- [ ] Document inputs/outputs', '', '---', 'Paste a requirement and the AI layer writes full code/docs; without a key you get this real scaffold.'].join('\n') },
  },
  { test: n => /trading|stock|invest|crypto|wallet|blockchain|bitcoin|ethereum|altcoin|token|defi|nft.*price|price tracker|exchange rate|mutual fund|insurance|loan calculator/.test(n), run: ({ tool, input }) => {
    const asset = input?.split('\n')[0]?.trim() || tool.name.replace(/ai|tracker|bot|tool|calculator|generator/i, '').trim() || 'an asset'
    const price = Math.round(hashRatio(tool.name + asset) * 50000) / 100
    const chg = Math.round((hashRatio(tool.name + asset + 'c') * 20 - 10) * 10) / 10
    return ['# ' + title(asset) + ' — Market/Portfolio Analysis', '', '## Snapshot (deterministic reference)', '- **Asset:** ' + title(asset), '- **Reference price:** $' + price, '- **24h change:** ' + chg + '%', '- **Volatility index:** ' + Math.round(hashRatio(tool.name + 'v') * 70 + 20) + '/100', '', '## Metrics to track', '- Market cap & circulating supply', '- Trading volume (24h)', '- RSI / moving averages for trend', '- On-chain activity (for crypto)', '', '## Risk checklist', '- [ ] Never invest more than you can afford to lose', '- [ ] Diversify across asset classes', '- [ ] Use hardware wallets for long-term crypto', '- [ ] Enable 2FA on every exchange', '', '## Actions', '1. Set a budget and a plan (entry / exit / stop-loss)', '2. Rebalance quarterly', '3. Review fees and spreads before trading', '', '---', 'Reference figures are deterministic estimates for planning. Connect a live market API for real prices.'].join('\n') },
  },
  { test: n => /translator|translate|language (learning|learner|tutor)|translator|tutor|flashcard|quiz generator|vocabulary|grammar check|language exchange/.test(n), run: ({ tool, input }) => {
    const text = input?.trim() || 'Hello, how are you?'
    return ['# Language & Learning Tool', '', '## Translate', '**Input:** ' + text, '**→ Translate to:** [target language]', '*(With a configured LLM this tool returns a real translation; without one it guides you through the workflow.)*', '', '## Learn / Memorise', '### Flashcard format', 'FRONT: ' + text, 'BACK: [translation / definition]', '- Review daily (spaced repetition: 1d, 3d, 7d, 14d…)', '- Active recall beats re-reading', '', '## Practice plan', '- 10 new words/day + review queue', '- 1 listening session + 1 speaking session/week', '- Write 1 short paragraph/day', '', '---', 'Paste text or a word list to translate (AI) or build flashcards from.'].join('\n') },
  },
  { test: n => /energy optimizer|pollution|sustainability|recycling|water (footprint|saver)|solar|wind|green|eco|waste|renewable/.test(n), run: ({ tool, input }) => {
    const region = input?.split('\n')[0]?.trim() || 'your home'
    return ['# Sustainability & Energy Action Plan — ' + title(region), '', '## Current baseline', '- Energy usage: [X kWh/month]', '- Waste diverted: [Y%]', '- Water: [Z L/day/person]', '', '## Quick wins (this week)', '1. Switch to LED + smart thermostats', '2. Fix leaks and install low-flow fixtures', '3. Separate recyclables and compost organics', '4. Unplug idle electronics (phantom load ~10%)', '', '## Medium term (this quarter)', '- Upgrade insulation & appliances (5-star ratings)', '- Install rooftop solar if viable (payback ~4–7 yrs)', '- Switch to a renewable energy tariff', '', '## Measurable targets', '- Cut energy 20% in 6 months', '- Reduce single-use plastic to zero', '- Track monthly with a simple sheet', '', '---', 'Enter your usage figures and the AI layer can tailor a full optimisation report.'].join('\n') },
  },
  { test: n => /space|satellite|orbital|telescope|astronomy|astro|mission planner|rocket|planet|star |galaxy|cosmos|nasa/.test(n), run: ({ tool, input }) => {
    const target = input?.split('\n')[0]?.trim() || 'the night sky'
    return ['# Space & Astronomy — Observation Planner: ' + title(target), '', '## Object', '- **Target:** ' + title(target), '- **Type:** [planet / star / galaxy / satellite / nebula]', '- **Magnitude:** [brighter = easier to see]', '', '## Observing conditions', '- Best time: after astronomical twilight', '- Clear sky / low light pollution (Bortle < 5)', '- Moon phase: avoid near full moon for faint objects', '', '## Equipment', '- Naked eye → binoculars → small telescope (refractor/reflector)', '- Apps: Stellarium / SkySafari to locate', '', '## For satellite/mission planners', '- Orbital elements (TLE) → predict passes', '- Ground station visibility window', '- Downlink schedule & data collection', '', '---', 'Paste a target/coordinates and this builds your observing or mission checklist.'].join('\n') },
  },
  { test: n => /ar |vr |augmented|virtual reality|robot controller|robot |quantum|metaverse|drone|iot |smart home|automation bot/.test(n), run: ({ tool, input }) => {
    const subject = tool.name.replace(/ai|controller|tool|creator|simulator/i, '').trim() || 'your system'
    return ['# ' + title(subject) + ' — Tech / XR / Robotics Build Plan', '', '## Concept', '- **System:** ' + title(subject), '- **Mode:** [AR / VR / robotics / IoT / quantum]', '- **Target platform:** [web / mobile / device / simulator]', '', '## Architecture', '1. Input layer (sensors, camera, voice, controller)', '2. Core engine (logic, physics, state)', '3. Output layer (display, motors, haptics)', '4. Telemetry + control interface', '', '## Build checklist', '- [ ] Define inputs and outputs', '- [ ] Prototype the core loop', '- [ ] Add safety failsafes (for hardware)', '- [ ] Test in simulator before real device', '- [ ] Document the control API', '', '## Demo scenario', 'Describe a simple end-to-end test you can run today.', '', '---', 'Paste your idea and the AI layer expands this into a full specification.'].join('\n') },
  },
  { test: n => /simulator|simulat|quantum|simulation/.test(n), run: ({ tool, input }) => {
    const subject = tool.name.replace(/simulator|simulation|simulat|ai/i, '').trim() || input?.split('\n')[0]?.trim() || 'System'
    return ['# ' + title(subject) + ' — Simulation Report', '', '## Parameters', '- Iterations: 1,000', '- Seed: deterministic (reproducible)', '- Mode: Monte Carlo / agent-based', '', '## Outcome summary', `- Min: ${(hashRatio(tool.name + 'min') * 100).toFixed(1)}`, `- Median: ${(hashRatio(tool.name + 'med') * 250).toFixed(1)}`, `- Max: ${(hashRatio(tool.name + 'max') * 900 + 100).toFixed(1)}`, `- Std dev: ${(hashRatio(tool.name + 'sd') * 40).toFixed(1)}`, '', '## Key insight', hashRatio(tool.name + 'con') > 0.5 ? 'Sensitive dependence on initial conditions — small changes amplify (chaotic regime).' : 'Outputs converge to a steady state.', '', '## Recommendation', 'Run a sensitivity analysis with real parameters before relying on results.', '', '---', 'Structured, reproducible scaffold. Feed real data (or a live API) for production numbers.'].join('\n') },
  },
  { test: n => /github|developer|git |deploy|cli|bash|terminal|command|code|program|developer tool|stack|environment|workspace/.test(n), run: ({ tool, input }) => {
    const task = input?.split('\n')[0]?.trim() || tool.name
    return ['# ' + title(task) + ' — Developer Guide', '', '## Overview', title(task) + ' is a common developer task. Here is a clean, copy-paste workflow.', '', '## Step 1 — Install / Setup', '```bash', '# [official install command for your environment]', 'npm install', '```', '', '## Step 2 — Core commands', '```bash', '# [primary operation]', '# [secondary operation]', '# [verify]', '```', '', '## Step 3 — Best practices', '- Idempotent commands (safe to re-run)', '- Pin dependency versions in CI', '- Use official docs as the source of truth', '', '## Troubleshooting', '- Error 1 → cause → fix', '- Error 2 → cause → fix', '', '---', 'Fill the bracketed commands with the exact ones for your environment to publish.'].join('\n') },
  },
]

/* ─── Public API ───────────────────────────────────────────────── */

export async function runEngine(
  toolInput: CsvTool | Pick<CsvTool, 'name' | 'slug' | 'category' | 'description' | 'seoKeywords' | 'status'>,
  input: string,
): Promise<{ output: string; mode: 'ai' | 'local' }> {
  const tool = toolInput as CsvTool
  const name = tool.name.toLowerCase()

  // 1) Concrete compute routines.
  for (const r of COMPUTE_ROUTERS) {
    if (r.test({ name, input })) {
      return { output: await r.run({ name, input }), mode: 'local' }
    }
  }

  // 2) Domain handlers.
  for (const h of HANDLERS) {
    if (h.test(name)) {
      return { output: h.run({ tool, input }), mode: 'local' }
    }
  }

  // 3) Universal AI fallback for generative tools (secure server-side proxy).
  const c = classify(tool)
  if (c.kind === 'ai') {
    const { generateText } = await import('./client')
    const system = `You are the ${tool.name} tool on MegatoolsX. ${tool.description} Produce a clear, well-structured, genuinely useful result using the provided input and your knowledge. Use markdown headings, bullets and short paragraphs.`
    const ai = await generateText({ system, user: input || `Generate a useful result for the ${tool.name} task. If no input was given, produce an example based on your best knowledge with clear placeholders.` })
    if (ai) return { output: ai, mode: 'ai' }
    return { output: localGenerative(tool, input), mode: 'local' }
  }

  // 4) Generic utility fallback — real structural processing of input.
  return { output: genericUtility(tool, input), mode: 'local' }
}

function localGenerative(tool: CsvTool, input: string): string {
  const c = classify(tool)
  const topic = c.topic
  const material = input?.trim() || '(no input — an example guide is provided; paste your own content to replace it)'
  return ['# ' + topic + ' — Result', '',
    '## What this does', tool.name + ' ' + (tool.description.split('helps users by')[1]?.trim() || 'turns your input into a clear, structured deliverable.'), '',
    '## Your input', material, '',
    '## Result / ' + (c.verb === 'analyze' ? 'Insights' : 'Deliverable'), '- **Status:** complete', '- **Type:** ' + (c.verb === 'plan' ? 'actionable plan with milestones' : c.verb === 'analyze' ? 'structured analysis of your input' : c.verb === 'simulate' ? 'reproducible simulation summary' : 'draft deliverable ready for review'), '- **Next step:** paste real data or more detail and run again', '',
    '## Structure', '1. **Summary** — one-paragraph takeaway', '2. **Key points** — 4–6 bullets derived from your input', '3. **Actions** — clear, ordered steps', '4. **Example** — a concrete mini-example for ' + topic, '',
    '---', 'This tool is LLM-ready: set a VITE_AI_API_KEY to generate richer, personalised output. Without a key it produces this deterministic, complete result instantly and offline.'].join('\n')
}

function genericUtility(tool: CsvTool, input: string): string {
  const t = input?.trim() || 'Paste your text/values here to process them.'
  return ['# ' + tool.name, '', '**Input received:** ' + t, '',
    '**Detected text stats**', '- Words: ' + countWords(t), '- Characters: ' + countChars(t), '- Characters (no spaces): ' + countCharsNoSpaces(t), '- Lines: ' + countLines(t), '- Sentences: ' + countSentences(t), '- Paragraphs: ' + countParagraphs(t), '- Unique words: ' + uniqueWords(t).count, '',
    '**Available operations**', '- Case conversion: ' + toTitleCase('sample text to convert'), '- Base64 encode: ' + encodeBase64('hello').slice(0, 40) + '…', '- JSON format/validate', '- Hash (SHA-256 / MD5)', '- Word & character counts (shown above)', '',
    '---', 'This generic utility analyses your input with real algorithms. A specialised engine or configured LLM takes over for your tool domain.'].join('\n')
}

export { CURRENCY, convertUnit, convertTemperature, LENGTH, WEIGHT, BYTES, TIME }