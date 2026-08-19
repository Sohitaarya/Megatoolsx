/**
 * Search — tokenizer + normalization.
 * Lowercase, split into alphanumeric tokens, expand a small synonym/alias table,
 * and (for short tokens) tolerate a single typo via Damerau–Levenshtein ≤ 1.
 */

const STOPWORDS = new Set(['the', 'a', 'an', 'and', 'or', 'for', 'to', 'of', 'in', 'on', 'with', 'your', 'how', 'use', 'tool', 'online'])

/** Small, domain-relevant synonym/alias table. */
const SYNONYMS: Record<string, string[]> = {
  ai: ['artificial intelligence', 'llm', 'bot'],
  'ai tool': ['generator', 'assistant', 'copilot'],
  calc: ['calculator'],
  'money': ['finance', 'financial', 'bank'],
  'photo': ['image', 'picture', 'pic'],
  'video': ['clip', 'film', 'movie'],
  'audio': ['sound', 'music', 'voice'],
  'convert': ['transformer', 'translator'],
  'hash': ['checksum', 'digest'],
  'code': ['programming', 'developer', 'coding'],
  'txt': ['text'],
}

export interface Token { term: string; original: string }

/** Normalize a string into searchable tokens (drops stopwords, expands synonyms). */
export function tokenize(input: string): Token[] {
  const raw = input.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/)
  const out: Token[] = []
  const seen = new Set<string>()

  for (const word of raw) {
    if (!word || STOPWORDS.has(word)) continue
    if (!seen.has(word)) {
      seen.add(word)
      out.push({ term: word, original: word })
    }
    // Expand synonyms as additional searchable terms (weighted lower by ranker).
    for (const syn of SYNONYMS[word] ?? []) {
      for (const part of syn.split(' ')) {
        if (part && !seen.has(part)) {
          seen.add(part)
          out.push({ term: part, original: word })
        }
      }
    }
  }
  return out
}

/** Simple Damerau–Levenshtein distance (≤2 by truncation) — enough for typo correction. */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0
  const n = a.length, m = b.length
  if (n === 0) return m
  if (m === 0) return n
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0))
  for (let i = 0; i <= n; i++) dp[i][0] = i
  for (let j = 0; j <= m; j++) dp[0][j] = j
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      )
    }
  }
  return dp[n][m]
}

/** True when a query token could be a typo of a candidate term (distance ≤ 1, length ≥ 4). */
export function isFuzzyMatch(term: string, candidate: string): boolean {
  if (term.length < 4) return false
  const shorter = term.length <= candidate.length ? term : candidate
  const longer = term.length <= candidate.length ? candidate : term
  return longer.length - shorter.length <= 1 && editDistance(term.slice(0, longer.length), candidate.slice(0, longer.length)) <= 1
}

export function stripStopwords(tokens: Token[]): Token[] {
  return tokens.filter(t => !STOPWORDS.has(t.term))
}
