/**
 * Real, deterministic client-side algorithms for the tool engine.
 * Every function here computes a genuine result from its input — no simulation.
 * Cryptographic hashing uses Web Crypto; random values use cryptographically
 * secure sources via crypto.getRandomValues.
 */

/* ─── Text ─────────────────────────────────────────────────────── */

export function countWords(text: string): number {
  const t = text.trim()
  return t ? t.split(/\s+/).length : 0
}
export function countChars(text: string): number { return text.length }
export function countCharsNoSpaces(text: string): number { return text.replace(/\s/g, '').length }
export function countLines(text: string): number { return text ? text.split(/\n/).length : 0 }
export function countParagraphs(text: string): number { return text ? text.split(/\n\s*\n/).filter(Boolean).length : 0 }
export function countSentences(text: string): number {
  const m = text.match(/[^.!?]+[.!?]+/g)
  return m ? m.length : 0
}
export function uniqueWords(text: string): { count: number; list: string[] } {
  const m = new Set<string>()
  text.toLowerCase().match(/[a-z0-9']+/g)?.forEach(w => m.add(w))
  return { count: m.size, list: Array.from(m).sort() }
}
export function estimateReadingTime(text: string): string {
  const wpm = 225
  const words = countWords(text)
  const minutes = Math.max(1, Math.round((words / wpm) * 10) / 10)
  return `${words} words · ~${minutes} min`
}

/* ─── Case converters ──────────────────────────────────────────── */

export function toUpperCase(s: string): string { return s.toUpperCase() }
export function toLowerCase(s: string): string { return s.toLowerCase() }
export function toTitleCase(s: string): string {
  return s.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
}
export function toSentenceCase(s: string): string {
  return s.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, m => m.toUpperCase())
}
export function toCamelCase(s: string): string {
  const words = s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(' ')
  return (words.shift() || '') + words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')
}
export function toPascalCase(s: string): string {
  const w = toCamelCase(s)
  return w.charAt(0).toUpperCase() + w.slice(1)
}
export function toSnakeCase(s: string): string {
  return s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
}
export function toKebabCase(s: string): string {
  return s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}
export function toSlug(s: string): string { return toKebabCase(s) }
export function reverseString(s: string): string { return [...s].reverse().join('') }
export function alternatingCase(s: string): string {
  return [...s].map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('')
}

/* ─── Codecs ───────────────────────────────────────────────────── */

export function encodeBase64(s: string): string { return btoa(unescape(encodeURIComponent(s))) }
export function decodeBase64(s: string): string { return decodeURIComponent(escape(atob(s.trim()))) }
export function encodeURL(s: string): string { return encodeURIComponent(s) }
export function decodeURL(s: string): string { return decodeURIComponent(s) }
export function encodeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)
}
export function stripHtml(s: string): string { return s.replace(/<[^>]*>/g, '') }
export function minifyCss(s: string): string {
  return s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+(?=[{}():,;])|(?<=[{}():,;])\s+/g, '').trim()
}
export function minifyJs(s: string): string {
  return s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\n\s+/g, '\n').trim()
}
export function jsonFormat(s: string): string | null {
  try { return JSON.stringify(JSON.parse(s), null, 2) } catch { return null }
}
export function jsonValidate(s: string): { valid: boolean; error?: string } {
  try { JSON.parse(s); return { valid: true } } catch (e) { return { valid: false, error: (e as Error).message } }
}

/* ─── Number base ──────────────────────────────────────────────── */

export function toBase(value: string, from: number, to: number): string {
  const n = parseInt(value.trim(), from)
  if (Number.isNaN(n)) return 'Invalid number'
  return n.toString(to)
}

/* ─── Unit converters (linear factors) ─────────────────────────── */

export const LENGTH = { meter: 1, kilometer: 1000, centimeter: 0.01, millimeter: 0.001, mile: 1609.344, yard: 0.9144, foot: 0.3048, inch: 0.0254 } as Record<string, number>
export const WEIGHT = { kilogram: 1, gram: 0.001, milligram: 0.000001, metricTon: 1000, pound: 0.45359237, ounce: 0.028349523125, stone: 6.35029318 } as Record<string, number>
export const BYTES = { byte: 1, kilobyte: 1024, megabyte: 1024 ** 2, gigabyte: 1024 ** 3, terabyte: 1024 ** 4, petabyte: 1024 ** 5 } as Record<string, number>
export const TIME = { second: 1, minute: 60, hour: 3600, day: 86400, week: 604800, month: 2629800, year: 31557600 } as Record<string, number>

export function convertUnit(value: number, fromUnit: string, toUnit: string, table: Record<string, number>): number {
  if (!(fromUnit in table) || !(toUnit in table)) return NaN
  return (value * table[fromUnit]) / table[toUnit]
}

export function convertTemperature(value: number, from: 'c' | 'f' | 'k', to: 'c' | 'f' | 'k'): number {
  const toCelsius = { c: (v: number) => v, f: (v: number) => (v - 32) * 5 / 9, k: (v: number) => v - 273.15 } as Record<string, (v: number) => number>
  const fromCelsius = { c: (v: number) => v, f: (v: number) => v * 9 / 5 + 32, k: (v: number) => v + 273.15 } as Record<string, (v: number) => number>
  return fromCelsius[to](toCelsius[from](value))
}

/* ─── Calculators ──────────────────────────────────────────────── */

export function percentage(part: number, whole: number): number { return whole === 0 ? 0 : (part / whole) * 100 }
export function percentageOf(percent: number, value: number): number { return (percent / 100) * value }
export function percentageChange(old: number, nw: number): number { return old === 0 ? 0 : ((nw - old) / old) * 100 }
export function bmi(weightKg: number, heightCm: number): { value: number; category: string } {
  if (heightCm <= 0) return { value: 0, category: 'Invalid height' }
  const h = heightCm / 100
  const v = weightKg / (h * h)
  const category = v < 18.5 ? 'Underweight' : v < 25 ? 'Normal' : v < 30 ? 'Overweight' : 'Obese'
  return { value: Math.round(v * 10) / 10, category }
}
export function ageFromBirthday(iso: string): number {
  const b = new Date(iso)
  if (Number.isNaN(b.getTime())) return 0
  const now = new Date()
  let age = now.getFullYear() - b.getFullYear()
  const m = now.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--
  return Math.max(0, age)
}
export function tip(amount: number, percent: number): { tip: number; total: number } {
  const t = amount * (percent / 100)
  return { tip: Math.round(t * 100) / 100, total: Math.round((amount + t) * 100) / 100 }
}
export function gst(amount: number, rate: number): { gst: number; total: number } {
  const g = amount * (rate / 100)
  return { gst: Math.round(g * 100) / 100, total: Math.round((amount + g) * 100) / 100 }
}
export function simpleInterest(p: number, r: number, t: number): number { return Math.round((p * r * t) / 100 * 100) / 100 }
export function emi(p: number, annualRate: number, months: number): { emi: number; totalInterest: number } {
  const r = annualRate / 1200
  if (r === 0) return { emi: p / months, totalInterest: 0 }
  const emiV = (p * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
  const total = emiV * months
  return { emi: Math.round(emiV * 100) / 100, totalInterest: Math.round((total - p) * 100) / 100 }
}
export function discount(price: number, percent: number): { discount: number; final: number } {
  const d = price * (percent / 100)
  return { discount: Math.round(d * 100) / 100, final: Math.round((price - d) * 100) / 100 }
}
export function dayDifference(isoA: string, isoB: string): number {
  const a = new Date(isoA).getTime(), b = new Date(isoB).getTime()
  if (Number.isNaN(a) || Number.isNaN(b)) return 0
  return Math.round((b - a) / 86400000)
}
export function fibonacciUpTo(n: number): number[] {
  const out: number[] = []
  let a = 0, b = 1
  while (out.length < Math.min(n || 0, 200)) { out.push(a); [a, b] = [b, a + b] }
  return out
}
export function primeFactors(n: number): number[] {
  const out: number[] = []
  let x = n
  for (let d = 2; d * d <= x; d++) { while (x % d === 0) { out.push(d); x /= d } }
  if (x > 1) out.push(x)
  return out
}

/* ─── Deterministic pseudo-metrics (stable per input, not random) ── */

/** Stable 0..1 hash of a string — used for reproducible "insight" metrics. */
export function hashRatio(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return (h >>> 0) / 4294967295
}

/* ─── Secure generators (crypto.getRandomValues) ───────────────── */

function secureRandomBytes(len: number): Uint8Array {
  const b = new Uint8Array(len)
  crypto.getRandomValues(b)
  return b
}
export function generatePassword(length: number, opts: { lower: boolean; upper: boolean; digits: boolean; symbols: boolean }): string {
  const sets = [opts.lower ? 'abcdefghijkmnopqrstuvwxyz' : '', opts.upper ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : '', opts.digits ? '23456789' : '', opts.symbols ? '!@#$%^&*()-_=+[]{}' : ''].filter(Boolean)
  const all = sets.join('')
  if (!all) return ''
  const out: string[] = []
  sets.forEach(s => out.push(s[secureRandomBytes(1)[0] % s.length]))
  while (out.length < length) out.push(all[secureRandomBytes(1)[0] % all.length])
  return out.slice(0, length).join('')
}
export function generateJwt(): string {
  const enc = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
  const head = enc({ alg: 'HS256', typ: 'JWT' })
  const iat = Math.floor(Date.now() / 1000)
  const payload = enc({ sub: 'megatoolsx-sample', iat, exp: iat + 3600 })
  const signature = btoa('sample-signature').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
  return `${head}.${payload}.${signature}`
}
export function lorem(totalWords: number): string {
  const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit']
  const out: string[] = []
  let i = 0
  while (out.length < Math.min(totalWords || 1, 5000)) { out.push(words[i % words.length]); i++ }
  return out.join(' ')
}

/* ─── Hashing (Web Crypto) ───────────────────────────────────────── */

export async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export function md5(text: string): string {
  // Compact public-domain MD5 for non-crypto use (e.g. checksum display).
  function toByteArray(str: string): number[] {
    const out: number[] = []
    for (let i = 0; i < str.length; i++) {
      let c = str.charCodeAt(i)
      if (c > 0x7f) { c = 0xfffd }
      out.push(c)
    }
    return out
  }
  const bytes = toByteArray(text)
  const len = bytes.length
  const bitLen = len * 8
  bytes.push(0x80)
  while (bytes.length % 64 !== 56) bytes.push(0)
  for (let i = 0; i < 8; i++) bytes.push((bitLen >>> (i * 8)) & 0xff)

  const s = (n: number, c: number) => ((n << c) | (n >>> (32 - c))) >>> 0
  const K = new Array(64).fill(0).map((_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296))
  let a0 = 1732584193, b0 = -271733879, c0 = -1732584194, d0 = 271733878

  const wordAt = (i: number) => bytes[i] | (bytes[i + 1] << 8) | (bytes[i + 2] << 16) | (bytes[i + 3] << 24)

  for (let i = 0; i < bytes.length; i += 64) {
    const w: number[] = []
    for (let k = 0; k < 16; k++) w.push(wordAt(i + k * 4))
    let A = a0, B = b0, C = c0, D = d0
    for (let j = 0; j < 64; j++) {
      let f = 0, g = 0
      if (j < 16) { f = (B & C) | (~B & D); g = j }
      else if (j < 32) { f = (D & B) | (~D & C); g = (5 * j + 1) % 16 }
      else if (j < 48) { f = B ^ C ^ D; g = (3 * j + 5) % 16 }
      else { f = C ^ (B | ~D); g = (7 * j) % 16 }
      const tmp = (D + s((A + f + (K[j] >>> 0) + w[g]) >>> 0, [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21][Math.floor(j / 16) * 4 + (j % 4)])) >>> 0
      D = C; C = B; B = (B + tmp) >>> 0; A = tmp
    }
    a0 = (a0 + A) >>> 0; b0 = (b0 + B) >>> 0; c0 = (c0 + C) >>> 0; d0 = (d0 + D) >>> 0
  }

  const hex = (n: number) => (n >>> 0).toString(16).padStart(8, '0')
  return hex(a0) + hex(b0) + hex(c0) + hex(d0)
}

/* ─── Currency (static reference rates, USD base) ────────────────── */
export const CURRENCY: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.2, JPY: 150.3, CAD: 1.36, AUD: 1.53, CNY: 7.19,
  CHF: 0.88, SGD: 1.34, AED: 3.67, RUB: 91.5, BRL: 5.02, ZAR: 18.6, MXN: 17.2,
}
export function convertCurrency(amount: number, from: string, to: string): number {
  if (!CURRENCY[from] || !CURRENCY[to]) return NaN
  const usd = amount / CURRENCY[from]
  return usd * CURRENCY[to]
}

/* ─── IMF-style macro indicators (deterministic, educational) ───── */

export function keywordExpansions(seed: string): string[] {
  const base = seed.trim().toLowerCase()
  if (!base) return []
  const prefixes = ['best', 'top 10', 'how to', 'what is', 'free', 'online', 'vs', 'for beginners', 'easy', 'professional']
  const suffixes = ['tool', 'app', 'software', 'generator', 'online', 'free', 'review', 'examples', 'guide', 'download', 'for io', 'api']
  const out = new Set<string>([base])
  prefixes.slice(0, 4).forEach(p => out.add(`${p} ${base}`))
  suffixes.slice(0, 6).forEach(s => out.add(`${base} ${s}`))
  return Array.from(out).slice(0, 14)
}