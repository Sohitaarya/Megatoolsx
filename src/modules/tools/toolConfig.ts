/**
 * Built-in tool configuration.
 *
 * Adding a new tool = adding one entry here (plus a row in tools.csv for SEO
 * + sitemap). Everything else — page, SEO, schema, breadcrumb, interactive
 * engine, analytics — is derived automatically. This is the "no hardcoded
 * tools" contract.
 */
import type { ToolConfigSource } from '@/core/infrastructure/tools/toolRegistry'

const toolConfig: ToolConfigSource = {
  // ── Compute utilities ─────────────────────────────────────────
  'word-counter': { slug: 'word-counter', placeholder: 'Paste text to count words, characters and sentences.' },
  'character-counter': { slug: 'character-counter', placeholder: 'Paste text to count characters (with and without spaces).' },
  'case-converter': { slug: 'case-converter', placeholder: 'Type any text to convert its case (upper, lower, title, snake, camel, kebab).' },
  'base64-encoder': { slug: 'base64-encoder', placeholder: 'Text to Base64 encode.' },
  'base64-decoder': { slug: 'base64-decoder', placeholder: 'Base64 to decode.' },
  'sha256-hash-generator': { slug: 'sha256-hash-generator', placeholder: 'Text to SHA-256 hash.' },
  'md5-hash-generator': { slug: 'md5-hash-generator', placeholder: 'Text to MD5 hash.' },
  'password-generator': { slug: 'password-generator', placeholder: 'Leave empty to generate a strong 16-char password.' },
  'uuid-generator': { slug: 'uuid-generator', placeholder: 'Click run to generate 10 UUIDs.' },
  'json-formatter': { slug: 'json-formatter', placeholder: 'Paste minified JSON to format/validate.' },
  'json-validator': { slug: 'json-validator', placeholder: 'Paste JSON to validate.' },
  'percentage-calculator': { slug: 'percentage-calculator', capability: { kind: 'utility', verb: 'calculate' }, placeholder: 'Enter two numbers, e.g. 25 200 (25 is X% of 200).' },
  'bmi-calculator': { slug: 'bmi-calculator', capability: { kind: 'utility', verb: 'calculate' }, placeholder: 'Enter weight-kg and height-cm, e.g. 70 175.' },
  'gst-calculator': { slug: 'gst-calculator', capability: { kind: 'utility', verb: 'calculate' }, placeholder: 'Enter amount and GST %, e.g. 1000 18.' },
  'unit-converter': { slug: 'unit-converter', capability: { kind: 'utility', verb: 'convert' }, placeholder: 'e.g. 100 km to miles, 32 fahrenheit to celsius.' },
  'currency-converter': { slug: 'currency-converter', capability: { kind: 'utility', verb: 'convert' }, placeholder: 'e.g. 100 usd to inr.' },

  // ── AI / generative tools (get real LLM output when a key is set) ──
  'resume-builder': { slug: 'resume-builder', aiFirst: true, placeholder: 'Job title on line 1, skills on line 2.' },
  'business-plan-generator': { slug: 'business-plan-generator', aiFirst: true, placeholder: 'Describe your business idea.' },
  'diet-planner': { slug: 'diet-planner', aiFirst: true, placeholder: 'Your target calories (e.g. 2000).' },
  'workout-planner': { slug: 'workout-planner', aiFirst: true, placeholder: 'Fitness goal (e.g. general fitness).' },
  'travel-planner': { slug: 'travel-planner', aiFirst: true, placeholder: 'Destination on line 1.' },
  'lesson-plan-generator': { slug: 'lesson-plan-generator', aiFirst: true, placeholder: 'Subject or course title.' },
  'blog-post-generator': { slug: 'blog-post-generator', aiFirst: true, placeholder: 'Topic for the article.' },
  'keyword-planner': { slug: 'keyword-planner', aiFirst: true, placeholder: 'Seed keyword (e.g. digital marketing).' },
  'email-writer': { slug: 'email-writer', aiFirst: true, placeholder: 'Purpose of the email (e.g. cold outreach).' },
  'story-generator': { slug: 'story-generator', aiFirst: true, placeholder: 'Genre on line 1, story idea on line 2.' },
  'invoice-generator': { slug: 'invoice-generator', placeholder: 'Client / items — the engine drafts a full invoice template.' },
  'carbon-footprint-calculator': { slug: 'carbon-footprint-calculator', placeholder: 'e.g. 300 kWh, 400 km.' },
  'meditation-guide': { slug: 'meditation-guide', aiFirst: true, placeholder: 'Session length in minutes (e.g. 5).' },
}

export default toolConfig