#!/usr/bin/env node
/**
 * Build the deployable site for Cloudflare (docs/deploy/CLOUDFLARE.md).
 *
 *   node scripts/build-cloudflare.mjs            build dist-cf/ and the R2 upload list
 *   node scripts/build-cloudflare.mjs --skip-vite  reuse dist-cf/ (rebuild search, SEO, checks)
 *
 *   dist-cf/                  → Cloudflare Pages (wrangler pages deploy dist-cf; functions/ goes with it)
 *   dist-cf/search-data/      manifest + scope indexes (small, versioned by hash)
 *   data/deploy/r2-upload.tsv → R2 bucket vislexicon-media, served at media.vislexicon.com:
 *                               component media (data/discovery/local-public) and per-unit search cards
 *
 * The bundle runs search in the browser (VITE_STATIC_API=1); only /api/rank and
 * /api/submit run on the server. Fails if Pages limits would be exceeded.
 */
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = 'dist-cf'
const DIST = path.join(ROOT, OUT)
const MEDIA_ORIGIN = (process.env.VISLEXICON_MEDIA_ORIGIN || 'https://media.vislexicon.com').replace(/\/$/, '')
const PAGES_MAX_FILES = 20000
const PAGES_MAX_BYTES = 25 * 1024 * 1024

const env = { ...process.env, VITE_STATIC_API: '1', VISLEXICON_PRECOMPRESS: '0', VISLEXICON_MEDIA_ORIGIN: MEDIA_ORIGIN, VISLEXICON_DIST: OUT }
const run = (script, args = []) => execFileSync(process.execPath, [script, ...args], { cwd: ROOT, env, stdio: 'inherit' })

if (!process.argv.includes('--skip-vite')) run('node_modules/vite/bin/vite.js', ['build', '--outDir', OUT, '--emptyOutDir'])
run('scripts/build-static-search.mjs')

// Search indexes go with the site; the 18k per-unit cards go to R2 (manifest.cardsBase).
const SEARCH = path.join(ROOT, 'data/static-search')
fs.rmSync(path.join(DIST, 'search-data'), { recursive: true, force: true })
fs.mkdirSync(path.join(DIST, 'search-data'), { recursive: true })
for (const name of fs.readdirSync(SEARCH)) if (name.endsWith('.json')) fs.copyFileSync(path.join(SEARCH, name), path.join(DIST, 'search-data', name))

run('scripts/build-seo-pages.mjs')

const headers = path.join(DIST, '_headers')
fs.writeFileSync(headers, `${fs.readFileSync(headers, 'utf8').trimEnd()}
/search-data/*
  Cache-Control: public, max-age=31536000, immutable
/search-data/manifest.json
  Cache-Control: no-cache
/sponsors.json
  Cache-Control: no-cache
/sitemap.xml
  Cache-Control: public, max-age=3600
`)

// Pages limits
const files = fs.readdirSync(DIST, { recursive: true, withFileTypes: true }).filter((entry) => entry.isFile())
  .map((entry) => { const file = path.join(entry.parentPath, entry.name); return { file: path.relative(DIST, file).replaceAll('\\', '/'), bytes: fs.statSync(file).size } })
const total = files.reduce((sum, f) => sum + f.bytes, 0)
const tooBig = files.filter((f) => f.bytes > PAGES_MAX_BYTES)
const compressed = files.filter((f) => /\.(?:br|gz)$/.test(f.file))
console.log(`[cloudflare] ${OUT}: ${files.length} files, ${(total / 1e6).toFixed(0)} MB (Pages limit ${PAGES_MAX_FILES} files, 25 MiB each)`)
const problems = [
  files.length > PAGES_MAX_FILES && `${files.length} files is over the Pages limit of ${PAGES_MAX_FILES}`,
  ...tooBig.map((f) => `${f.file} is ${(f.bytes / 1048576).toFixed(1)} MiB, over 25 MiB: move it to R2`),
  compressed.length && `${compressed.length} precompressed .br/.gz files; Pages compresses on its own`,
  !files.some((f) => f.file === 'sitemap.xml') && 'sitemap.xml missing',
  !files.some((f) => f.file === 'search-data/manifest.json') && 'search-data/manifest.json missing',
].filter(Boolean)

// R2 upload list: local file ⇥ object key
const MEDIA = path.join(ROOT, 'data/discovery/local-public')
const upload = []
for (const dir of ['media', 'previews', 'evidence', 'fonts', 'v4']) {
  const base = path.join(MEDIA, dir)
  if (!fs.existsSync(base)) continue
  for (const entry of fs.readdirSync(base, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue
    const file = path.join(entry.parentPath, entry.name)
    upload.push([file, `data/discovery/${path.relative(MEDIA, file).replaceAll('\\', '/')}`])
  }
}
for (const name of fs.readdirSync(path.join(SEARCH, 'u'))) upload.push([path.join(SEARCH, 'u', name), `search-data/u/${name}`])
fs.mkdirSync(path.join(ROOT, 'data/deploy'), { recursive: true })
fs.writeFileSync(path.join(ROOT, 'data/deploy/r2-upload.tsv'), upload.map(([file, key]) => `${path.relative(ROOT, file).replaceAll('\\', '/')}\t${key}`).join('\n') + '\n')
console.log(`[cloudflare] R2: ${upload.length} objects → data/deploy/r2-upload.tsv (${MEDIA_ORIGIN})`)

if (problems.length) {
  for (const problem of problems) console.error(`[cloudflare] ✗ ${problem}`)
  process.exit(1)
}
console.log('[cloudflare] ✓ ready: npx wrangler pages deploy dist-cf --project-name vislexicon')
