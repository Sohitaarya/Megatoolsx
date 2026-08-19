/**
 * Self-contained QR Code (Model 2) encoder — byte mode.
 *
 * No dependencies. Implements the complete pipeline from the ISO/IEC 18004 (QR
 * Code) reference: version selection, byte-mode data framing with terminator +
 * padding, Reed-Solomon error correction with block interleaving, function
 * pattern placement (timing / finder / alignment / format / version), data
 * codeword zig-zag placement, and automatic mask selection via the standard
 * penalty score.
 *
 * Supports error-correction levels L / M / Q / H for versions 1..10 (a URL,
 * email, phone or WiFi string almost always fits; oversized input raises a
 * clear error).
 *
 * The GF arithmetic and tables follow the widely-validated QR implementation
 * (nayuki/QR-Code-generator), transcribed to strict TypeScript.
 */

export type QrEcc = 'L' | 'M' | 'Q' | 'H'

export interface QrResult {
  version: number
  /** QR-side size in modules (17 + 4 * version). */
  size: number
  /** matrix[row][col]; true = dark module. */
  matrix: boolean[][]
  mask: number
}

const GF_EXPONENT = 0x11d // primitive polynomial x^8 + x^4 + x^3 + x^2 + 1
const MAX_VERSION = 10

interface EccSpec {
  formatbits: number
  eccPerBlock: number[] // indexed by version (index 0 unused)
  numBlocks: number[] // indexed by version (index 0 unused)
}

const ECC_TABLE: Record<QrEcc, EccSpec> = {
  L: { formatbits: 1, eccPerBlock: [0, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18], numBlocks: [0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4] },
  M: { formatbits: 0, eccPerBlock: [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26], numBlocks: [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5] },
  Q: { formatbits: 3, eccPerBlock: [0, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24], numBlocks: [0, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8] },
  H: { formatbits: 2, eccPerBlock: [0, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28], numBlocks: [0, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8] },
}

/* ─── Galois field / Reed-Solomon ────────────────────────────────────────── */

/** GF(2^8/0x11D) multiply via Russian-peasant. */
function gfMul(x: number, y: number): number {
  let z = 0
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >> 7) * GF_EXPONENT)
    z ^= ((y >> i) & 1) * x
  }
  return z & 0xff
}

/** RS generator polynomial (degree = number of EC codewords). Length = degree. */
function rsDivisor(degree: number): number[] {
  const result: number[] = new Array<number>(degree - 1).fill(0)
  result.push(1) // leading term x^degree is implicit
  let root = 1
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      result[j] = gfMul(result[j], root)
      if (j + 1 < degree) result[j] ^= result[j + 1]
    }
    root = gfMul(root, 0x02)
  }
  return result
}

/** RS remainder (the EC codewords) for a data block. */
function rsRemainder(data: number[], divisor: number[]): number[] {
  const result: number[] = new Array<number>(divisor.length).fill(0)
  for (const b of data) {
    const factor = b ^ (result.shift() ?? 0)
    result.push(0)
    for (let i = 0; i < divisor.length; i++) result[i] ^= gfMul(divisor[i], factor)
  }
  return result
}

/* ─── Geometry helpers ───────────────────────────────────────────────────── */

function getSize(version: number): number {
  return 17 + 4 * version
}

/** Number of raw data modules (includes remainder bits — not a multiple of 8). */
function getNumRawDataModules(version: number): number {
  let result = (16 * version + 128) * version + 64
  if (version >= 2) {
    const numalign = Math.floor(version / 7) + 2
    result -= (25 * numalign - 10) * numalign - 55
    if (version >= 7) result -= 36
  }
  return result
}

function getNumDataCodewords(version: number, ecc: QrEcc): number {
  const spec = ECC_TABLE[ecc]
  return Math.floor(getNumRawDataModules(version) / 8) - spec.eccPerBlock[version] * spec.numBlocks[version]
}

function getAlignmentPositions(version: number): number[] {
  if (version === 1) return []
  const size = getSize(version)
  const numalign = Math.floor(version / 7) + 2
  const step = Math.floor((version * 8 + numalign * 3 + 5) / (numalign * 4 - 4)) * 2
  const result: number[] = []
  for (let i = 0; i < numalign - 1; i++) result.push(size - 7 - i * step)
  result.push(6)
  return result.reverse()
}

/* ─── Data codewords + ECC ───────────────────────────────────────────────── */

function pushBits(bits: number[], value: number, length: number): void {
  for (let i = length - 1; i >= 0; i--) bits.push((value >> i) & 1)
}

/** Encode UTF-8 bytes into a byte-mode bit stream padded to the data capacity. */
function buildDataCodewords(version: number, ecc: QrEcc, bytes: Uint8Array): number[] {
  const numDataBits = getNumDataCodewords(version, ecc) * 8
  const countBits = version <= 9 ? 8 : 16

  const bits: number[] = []
  pushBits(bits, 0b0100, 4) // Byte mode indicator
  pushBits(bits, bytes.length, countBits)
  for (const b of bytes) pushBits(bits, b, 8)

  // Terminator: up to 4 zero bits, then pad to a byte boundary.
  let terminator = Math.min(4, numDataBits - bits.length)
  while (terminator > 0) { bits.push(0); terminator-- }
  while (bits.length % 8 !== 0) bits.push(0)

  // Pad codewords 0xEC, 0x11 alternating.
  const pad = [0xec, 0x11]
  let i = 0
  for (; bits.length < numDataBits; i++) pushBits(bits, pad[i % 2], 8)

  const out: number[] = []
  for (let j = 0; j < bits.length; j += 8) {
    let byte = 0
    for (let k = 0; k < 8; k++) byte = (byte << 1) | (bits[j + k] & 1)
    out.push(byte)
  }
  return out
}

/** Add Reed-Solomon EC to each block and interleave into the final codeword stream. */
function addEccAndInterleave(data: number[], version: number, ecc: QrEcc): number[] {
  const spec = ECC_TABLE[ecc]
  const numBlocks = spec.numBlocks[version]
  const blockEccLen = spec.eccPerBlock[version]
  const rawCodewords = Math.floor(getNumRawDataModules(version) / 8)
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks)
  const shortBlockLen = Math.floor(rawCodewords / numBlocks)

  const rsdiv = rsDivisor(blockEccLen)
  const blocks: number[][] = []
  let k = 0
  for (let i = 0; i < numBlocks; i++) {
    const datLen = shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1)
    const dat = data.slice(k, k + datLen)
    k += datLen
    const eccBytes = rsRemainder(dat, rsdiv)
    if (i < numShortBlocks) dat.push(0)
    blocks.push(dat.concat(eccBytes))
  }

  const result: number[] = []
  for (let i = 0; i < blocks[0].length; i++) {
    for (let j = 0; j < numBlocks; j++) {
      if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks) {
        result.push(blocks[j][i])
      }
    }
  }
  return result
}

/* ─── Matrix construction ────────────────────────────────────────────────── */

interface Matrix {
  size: number
  /** matrix[y][x] */
  modules: boolean[][]
  isFunction: boolean[][]
}

function emptyMatrix(version: number): Matrix {
  const size = getSize(version)
  const modules: boolean[][] = []
  const isFunction: boolean[][] = []
  for (let y = 0; y < size; y++) {
    const row: boolean[] = []
    const fun: boolean[] = []
    for (let x = 0; x < size; x++) { row.push(false); fun.push(false) }
    modules.push(row)
    isFunction.push(fun)
  }
  return { size, modules, isFunction }
}

function setFunc(m: Matrix, x: number, y: number, dark: boolean): void {
  m.modules[y][x] = dark
  m.isFunction[y][x] = true
}

function bitAt(value: number, i: number): boolean {
  return ((value >> i) & 1) !== 0
}

function drawFinder(m: Matrix, cx: number, cy: number): void {
  for (let dy = -4; dy <= 4; dy++) {
    for (let dx = -4; dx <= 4; dx++) {
      const xx = cx + dx
      const yy = cy + dy
      if (xx >= 0 && xx < m.size && yy >= 0 && yy < m.size) {
        const rad = Math.max(Math.abs(dx), Math.abs(dy))
        setFunc(m, xx, yy, rad !== 2 && rad !== 4)
      }
    }
  }
}

function drawAlignment(m: Matrix, cx: number, cy: number): void {
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      setFunc(m, cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1)
    }
  }
}

/** Format bits (level + mask with BCH) → two 15-bit copies on the matrix. */
function drawFormat(m: Matrix, formatbits: number, mask: number): void {
  const data = (formatbits << 3) | mask
  let rem = data
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >> 9) * 0x537)
  const bits = ((data << 10) | rem) ^ 0x5412

  // First copy
  for (let i = 0; i <= 5; i++) setFunc(m, 8, i, bitAt(bits, i))
  setFunc(m, 8, 7, bitAt(bits, 6))
  setFunc(m, 8, 8, bitAt(bits, 7))
  setFunc(m, 7, 8, bitAt(bits, 8))
  for (let i = 9; i < 15; i++) setFunc(m, 14 - i, 8, bitAt(bits, i))

  // Second copy
  for (let i = 0; i < 8; i++) setFunc(m, m.size - 1 - i, 8, bitAt(bits, i))
  for (let i = 8; i < 15; i++) setFunc(m, 8, m.size - 15 + i, bitAt(bits, i))
  setFunc(m, 8, m.size - 8, true)
}

/** Version info block (versions >= 7). */
function drawVersion(m: Matrix, version: number): void {
  if (version < 7) return
  let rem = version
  for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >> 11) * 0x1f25)
  const bits = (version << 12) | rem
  for (let i = 0; i < 18; i++) {
    const val = bitAt(bits, i)
    const a = m.size - 11 + (i % 3)
    const b = Math.floor(i / 3)
    setFunc(m, a, b, val)
    setFunc(m, b, a, val)
  }
}

function drawFunctionPatterns(m: Matrix, version: number, ecc: QrEcc): void {
  const spec = ECC_TABLE[ecc]
  // Timing patterns
  for (let i = 0; i < m.size; i++) {
    setFunc(m, 6, i, i % 2 === 0)
    setFunc(m, i, 6, i % 2 === 0)
  }
  // Finder patterns at three corners.
  drawFinder(m, 3, 3)
  drawFinder(m, m.size - 4, 3)
  drawFinder(m, 3, m.size - 4)
  // Alignment patterns (skip the three finder corners).
  const align = getAlignmentPositions(version)
  const numalign = align.length
  const skips = new Set([`0-${0}`, `0-${numalign - 1}`, `${numalign - 1}-0`])
  for (let i = 0; i < numalign; i++) {
    for (let j = 0; j < numalign; j++) {
      if (!skips.has(`${i}-${j}`)) drawAlignment(m, align[i], align[j])
    }
  }
  // Format + version config (format overwritten after mask selection).
  drawFormat(m, spec.formatbits, 0)
  drawVersion(m, version)
}

function drawCodewords(m: Matrix, codewords: number[]): void {
  let i = 0
  for (let right = m.size - 1; right >= 1; right -= 2) {
    if (right <= 6) right -= 1
    for (let vert = 0; vert < m.size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j
        const upward = ((right + 1) & 2) === 0
        const y = upward ? m.size - 1 - vert : vert
        if (!m.isFunction[y][x] && i < codewords.length * 8) {
          m.modules[y][x] = bitAt(codewords[i >> 3], 7 - (i & 7))
          i++
        }
      }
    }
  }
}

/* ─── Masking + penalty ──────────────────────────────────────────────────── */

/** Returns true when a data module at (x, y) should be inverted for this mask. */
function shouldInvert(x: number, y: number, mask: number): boolean {
  switch (mask) {
    case 0: return (x + y) % 2 === 0
    case 1: return y % 2 === 0
    case 2: return x % 3 === 0
    case 3: return (x + y) % 3 === 0
    case 4: return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0
    case 5: return (x * y) % 2 + (x * y) % 3 === 0
    case 6: return ((x * y) % 2 + (x * y) % 3) % 2 === 0
    case 7: return (((x + y) % 2) + (x * y) % 3) % 2 === 0
    default: return false
  }
}

function applyMask(m: Matrix, mask: number): void {
  for (let y = 0; y < m.size; y++) {
    for (let x = 0; x < m.size; x++) {
      if (!m.isFunction[y][x] && shouldInvert(x, y, mask)) m.modules[y][x] = !m.modules[y][x]
    }
  }
}

/** Standard mask penalty score (lower is better). */
function getPenalty(m: Matrix): number {
  const size = m.size
  const modules = m.modules
  let penalty = 0

  const addHist = (runLength: number, history: number[]): void => {
    if (history[0] === 0) runLength += size // add light border to initial run
    history.unshift(runLength)
    if (history.length > 7) history.pop()
  }
  const countPatterns = (history: number[]): number => {
    const n = history[1]
    if (n <= 0) return 0
    const core = history[2] === n && history[3] === n * 3 && history[4] === n && history[5] === n
    const a = core && history[0] >= n * 4 && history[6] >= n
    const b = core && history[6] >= n * 4 && history[0] >= n
    return (a ? 1 : 0) + (b ? 1 : 0)
  }
  const terminate = (runColor: boolean, runLength: number, history: number[]): number => {
    if (runColor) {
      addHist(runLength, history)
      runLength = 0
    }
    runLength += size
    addHist(runLength, history)
    return countPatterns(history)
  }

  // Rows
  for (let y = 0; y < size; y++) {
    let runColor = false
    let runX = 0
    const history = [0, 0, 0, 0, 0, 0, 0]
    for (let x = 0; x < size; x++) {
      if (modules[y][x] === runColor) {
        runX++
        if (runX === 5) penalty += 3
        else if (runX > 5) penalty += 1
      } else {
        addHist(runX, history)
        if (!runColor) penalty += countPatterns(history) * 40
        runColor = modules[y][x]
        runX = 1
      }
    }
    penalty += terminate(runColor, runX, history) * 40
  }
  // Columns
  for (let x = 0; x < size; x++) {
    let runColor = false
    let runY = 0
    const history = [0, 0, 0, 0, 0, 0, 0]
    for (let y = 0; y < size; y++) {
      if (modules[y][x] === runColor) {
        runY++
        if (runY === 5) penalty += 3
        else if (runY > 5) penalty += 1
      } else {
        addHist(runY, history)
        if (!runColor) penalty += countPatterns(history) * 40
        runColor = modules[y][x]
        runY = 1
      }
    }
    penalty += terminate(runColor, runY, history) * 40
  }
  // 2x2 blocks of the same color
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      if (modules[y][x] === modules[y][x + 1] && modules[y][x] === modules[y + 1][x] && modules[y][x] === modules[y + 1][x + 1]) {
        penalty += 3
      }
    }
  }
  // Dark / light balance
  let dark = 0
  for (const row of modules) for (const c of row) if (c) dark++
  const total = size * size
  const k = Math.floor((Math.abs(dark * 20 - total * 10) + total - 1) / total) - 1
  penalty += k * 10

  return penalty
}

/* ─── Public API ─────────────────────────────────────────────────────────── */

/**
 * Generate a complete QR matrix for a UTF-8 byte string. Synchronous, pure.
 * @throws Error when the input is empty or too long for versions 1..10.
 */
export function generateQr(text: string, ecc: QrEcc): QrResult {
  const bytes = new TextEncoder().encode(text)
  if (bytes.length === 0) throw new Error('Content is empty')

  // Pick the smallest version 1..10 that fits the byte-mode bit stream.
  let version = -1
  for (let v = 1; v <= MAX_VERSION; v++) {
    const numDataBits = getNumDataCodewords(v, ecc) * 8
    const countBits = v <= 9 ? 8 : 16
    if (4 + countBits + bytes.length * 8 <= numDataBits) { version = v; break }
  }
  if (version < 0) {
    throw new Error(
      `Content is ${bytes.length} bytes — too long for a version 1–10 QR Code at level ${ecc}. ` +
      'Shorten the text or lower the error-correction level.'
    )
  }

  const m = emptyMatrix(version)
  drawFunctionPatterns(m, version, ecc)

  const data = buildDataCodewords(version, ecc, bytes)
  const codewords = addEccAndInterleave(data, version, ecc)
  drawCodewords(m, codewords)

  // Auto-select the lowest-penalty mask (reference algorithm).
  const { formatbits } = ECC_TABLE[ecc]
  let bestMask = 0
  let minPenalty = 1 << 30
  for (let mask = 0; mask < 8; mask++) {
    applyMask(m, mask)
    drawFormat(m, formatbits, mask)
    const p = getPenalty(m)
    if (p < minPenalty) {
      minPenalty = p
      bestMask = mask
    }
    applyMask(m, mask) // undo
  }

  applyMask(m, bestMask)
  drawFormat(m, formatbits, bestMask)

  return {
    version,
    size: m.size,
    mask: bestMask,
    matrix: m.modules.map(row => row.slice()),
  }
}
