/**
 * GSC Data Quality Audit (Phase 3.14).
 * Validates the generated snapshot/report data (schema, metrics, URLs, secrets).
 * NOT_CONFIGURED is a VALID state — it does not fail. Exit 0/1.
 */
import { existsSync, readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const fails = []
const snapshotPath = resolve(ROOT, 'reports', 'seo-gsc-snapshot.json')

console.log('GSC DATA QUALITY AUDIT (Phase 3.14)')

if (!existsSync(snapshotPath)) {
  console.log('No GSC snapshot file — Search Console likely NOT_CONFIGURED. This is a valid state.')
  console.log('RESULT: PASS ✅ (no snapshot to validate)')
  process.exit(0)
}

const snap = JSON.parse(readFileSync(snapshotPath, 'utf-8'))

// Schema
if (snap.schemaVersion !== 1) fails.push('schemaVersion != 1')
if (snap.property && !snap.property.includes('megatoolsx.com')) fails.push('property hostname mismatch')
// Metrics
const t = snap.totals || {}
if (typeof t.clicks !== 'number' || t.clicks < 0) fails.push('clicks invalid')
if (typeof t.impressions !== 'number' || t.impressions < 0) fails.push('impressions invalid')
if (t.ctr !== undefined && (t.ctr < 0 || t.ctr > 1)) fails.push('ctr out of range')
if (t.position !== undefined && t.position < 0) fails.push('position invalid')
// Rows
if (Array.isArray(snap.rows)) {
  const bad = snap.rows.filter(r => r.clicks < 0 || r.impressions < 0 || (r.ctr !== undefined && (r.ctr < 0 || r.ctr > 1)))
  if (bad.length) fails.push(`${bad.length} malformed rows`)
  const nonHost = snap.rows.filter(r => r.keys?.[1] && !r.keys[1].startsWith('https://megatoolsx.com'))
  if (nonHost.length) fails.push(`${nonHost.length} external-host URLs`)
}
// Secrets
const json = JSON.stringify(snap)
if (/BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY|client_secret|"access_token"\s*:\s*"[^"]{20,}/.test(json)) fails.push('possible secret leakage')

console.log(fails.length ? 'Failures: ' + fails.join(' | ') : 'All data-quality checks passed.')
console.log(fails.length ? 'RESULT: FAIL ❌' : 'RESULT: PASS ✅')
process.exit(fails.length ? 1 : 0)