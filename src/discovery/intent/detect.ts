/**
 * Discovery — intent detection.
 * Maps a tool/query onto audience intents so discovery can tailor the next-best
 * recommendation (developer → code tools, student → education tools, etc.).
 */

export type Intent =
  | 'developer' | 'student' | 'designer' | 'seo' | 'business' | 'pdf'
  | 'image' | 'video' | 'audio' | 'programming' | 'productivity' | 'ai' | 'general'

const RULES: Array<{ intents: Intent[]; re: RegExp }> = [
  { intents: ['developer', 'programming'], re: /code|coding|developer|git|api|sql|json|cli|terminal|deploy|language|framework|testing|debug/ },
  { intents: ['designer', 'image'], re: /design|image|photo|logo|thumbnail|ui|ux|color|vector|graphic/ },
  { intents: ['seo'], re: /seo|keyword|rank|backlink|search|analytics|meta|serp|traffic/ },
  { intents: ['business'], re: /business|finance|invoice|tax|crm|marketing|accounting|budget|billing/ },
  { intents: ['pdf'], re: /pdf|document|signature|scanner/ },
  { intents: ['video'], re: /video|film|movie|youtube|stream|editor/ },
  { intents: ['audio'], re: /audio|music|sound|voice|podcast|speech/ },
  { intents: ['student'], re: /education|learn|study|flashcard|tutor|exam|course|language/ },
  { intents: ['productivity'], re: /productivity|task|note|calendar|organizer|todo|project/ },
  { intents: ['ai'], re: /ai|gpt|llm|machine|neural|generator|assistant/ },
]

/** Detect intents for a tool or search query. */
export function detectIntent(name: string, category = ''): Intent[] {
  const haystack = `${name} ${category}`.toLowerCase()
  const matched = new Set<Intent>()
  for (const rule of RULES) if (rule.re.test(haystack)) rule.intents.forEach(i => matched.add(i))
  if (matched.size === 0) matched.add('general')
  return Array.from(matched)
}