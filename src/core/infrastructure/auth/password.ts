/**
 * Password hashing — PBKDF2-SHA256 via Web Crypto.
 * Format: pbkdf2$<iterations>$<base64-salt>$<base64-key>
 * Salt is random per password; iterations are high (production-grade).
 */

const ITERATIONS = 150_000
const KEY_BITS = 256

function toBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin)
}

function fromBase64(b64: string): Uint8Array<ArrayBuffer> {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes as Uint8Array<ArrayBuffer>
}

async function deriveBits(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<ArrayBuffer> {
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  return crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, keyMaterial, KEY_BITS)
}

/** Hash a password → "pbkdf2$<iter>$<saltB64>$<hashB64>". */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const bits = await deriveBits(password, salt, ITERATIONS)
  return `pbkdf2$${ITERATIONS}$${toBase64(salt.buffer as ArrayBuffer)}$${toBase64(bits)}`
}

/** Verify a password against a stored "pbkdf2$..." hash (constant-time compare). */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$')
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false
  const iterations = Number(parts[1])
  const salt = fromBase64(parts[2])
  const expected = parts[3]
  const bits = await deriveBits(password, salt, iterations)
  const actual = toBase64(bits)
  return timingSafeEqual(actual, expected)
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}