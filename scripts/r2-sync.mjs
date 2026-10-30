#!/usr/bin/env node
/**
 * Upload the R2 half of the site (component media + per-unit search cards) to the
 * vislexicon-media bucket through R2's S3 API. Reads data/deploy/r2-upload.tsv,
 * written by scripts/build-cloudflare.mjs. Resumable: data/deploy/r2-uploaded.json
 * records the sha256 of every object already sent, so a rerun only uploads changes.
 *
 *   node scripts/r2-sync.mjs            upload new and changed objects
 *   node scripts/r2-sync.mjs --dry-run  only count them
 *   node scripts/r2-sync.mjs --cors     also set the bucket CORS rule (cards are fetched cross-origin)
 *
 * Credentials come from the environment or .env.local (never commit them):
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET (default vislexicon-media)
 *   SITE_ORIGINS (CORS, default https://vislexicon.com,https://www.vislexicon.com)
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const LIST = path.join(ROOT, 'data/deploy/r2-upload.tsv')
const LEDGER = path.join(ROOT, 'data/deploy/r2-uploaded.json')
const CONCURRENCY = 16

const envFile = path.join(ROOT, '.env.local')
if (fs.existsSync(envFile)) for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
  const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line)
  if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2')
}
const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = process.env
const BUCKET = process.env.R2_BUCKET || 'vislexicon-media'
const dryRun = process.argv.includes('--dry-run')

const TYPES = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.json': 'application/json', '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8' }
const sha256 = (data, encoding) => crypto.createHash('sha256').update(data).digest(encoding)
const hmac = (key, data) => crypto.createHmac('sha256', key).update(data).digest()

/** AWS Signature V4 for R2 (region "auto", service "s3"). */
async function s3(method, key, { body = Buffer.alloc(0), query = '', headers = {} } = {}) {
  const host = `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
  const pathname = `/${BUCKET}${key ? '/' + key.split('/').map(encodeURIComponent).join('/') : ''}`
  const amzDate = new Date().toISOString().replace(/[-:]|\.\d{3}/g, '')
  const day = amzDate.slice(0, 8)
  const payloadHash = sha256(body, 'hex')
  const signed = { ...Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v])), host, 'x-amz-content-sha256': payloadHash, 'x-amz-date': amzDate }
  const names = Object.keys(signed).sort()
  const canonical = [method, pathname, query, ...names.map((n) => `${n}:${String(signed[n]).trim()}`), '', names.join(';'), payloadHash].join('\n')
  const scope = `${day}/auto/s3/aws4_request`
  const toSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256(canonical, 'hex')].join('\n')
  const signingKey = ['auto', 's3', 'aws4_request'].reduce(hmac, hmac(`AWS4${R2_SECRET_ACCESS_KEY}`, day))
  const authorization = `AWS4-HMAC-SHA256 Credential=${R2_ACCESS_KEY_ID}/${scope}, SignedHeaders=${names.join(';')}, Signature=${crypto.createHmac('sha256', signingKey).update(toSign).digest('hex')}`
  const response = await fetch(`https://${host}${pathname}${query ? '?' + query : ''}`, { method, headers: { ...signed, authorization }, body: body.length ? body : undefined })
  if (!response.ok) throw new Error(`${method} ${key || BUCKET}${query ? '?' + query : ''}: HTTP ${response.status} ${(await response.text()).slice(0, 300)}`)
  return response
}

if (!fs.existsSync(LIST)) throw new Error('data/deploy/r2-upload.tsv is missing; run node scripts/build-cloudflare.mjs first')
const rows = fs.readFileSync(LIST, 'utf8').split('\n').filter(Boolean).map((line) => line.split('\t'))
const ledger = fs.existsSync(LEDGER) ? JSON.parse(fs.readFileSync(LEDGER, 'utf8')) : {}
const pending = []
for (const [file, key] of rows) {
  const bytes = fs.readFileSync(path.join(ROOT, file))
  const digest = sha256(bytes, 'hex')
  if (ledger[key] !== digest) pending.push({ file, key, bytes, digest })
}
const pendingBytes = pending.reduce((sum, item) => sum + item.bytes.length, 0)
console.log(`[r2] ${rows.length} objects listed, ${pending.length} new or changed (${(pendingBytes / 1e6).toFixed(0)} MB) → ${BUCKET}`)
if (dryRun) process.exit(0)
if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) throw new Error('Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY (environment or .env.local)')

if (process.argv.includes('--cors')) {
  const origins = (process.env.SITE_ORIGINS || 'https://vislexicon.com,https://www.vislexicon.com').split(',').map((o) => o.trim()).filter(Boolean)
  const xml = `<CORSConfiguration><CORSRule>${origins.map((o) => `<AllowedOrigin>${o}</AllowedOrigin>`).join('')}<AllowedMethod>GET</AllowedMethod><AllowedMethod>HEAD</AllowedMethod><AllowedHeader>*</AllowedHeader><MaxAgeSeconds>86400</MaxAgeSeconds></CORSRule></CORSConfiguration>`
  const body = Buffer.from(xml)
  await s3('PUT', '', { query: 'cors=', body, headers: { 'content-type': 'application/xml', 'content-md5': crypto.createHash('md5').update(body).digest('base64') } })
  console.log(`[r2] CORS set for ${origins.join(', ')}`)
}

let done = 0, failed = 0, last = Date.now()
const save = () => fs.writeFileSync(LEDGER, JSON.stringify(ledger))
async function worker() {
  while (pending.length) {
    const item = pending.shift()
    try {
      await s3('PUT', item.key, { body: item.bytes, headers: {
        'content-type': TYPES[path.extname(item.key).toLowerCase()] || 'application/octet-stream',
        // Names that carry a content hash never change; previews and cards can.
        'cache-control': /[-.][0-9a-f]{12,}\.[a-z0-9]+$/.test(item.key) ? 'public, max-age=31536000, immutable' : 'public, max-age=3600' } })
      ledger[item.key] = item.digest
      done++
    } catch (error) {
      failed++
      console.error(`[r2] ✗ ${item.key}: ${error.message}`)
    }
    if (Date.now() - last > 5000) { last = Date.now(); save(); console.log(`[r2] ${done} uploaded, ${failed} failed, ${pending.length} left`) }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker))
save()
console.log(`[r2] done: ${done} uploaded, ${failed} failed`)
if (failed) process.exit(1)
