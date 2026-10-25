// Capture a static poster for every live component from our own render
// (?solo=<id>, default parameters, 800×500). The gallery shows posters and only
// mounts a live preview for the card under the pointer.
// Usage: node scripts/posters.mjs [baseUrl]   (the dev or preview server must be running)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
import { pathToFileURL } from 'node:url'
import { CATALOG } from '../src/catalog.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const frontend = fs.existsSync(path.resolve(ROOT, '../frontend/playwright.config.js')) ? path.resolve(ROOT, '../frontend') : path.resolve(ROOT, '..')
const { resolveChromium } = await import(pathToFileURL(path.join(frontend, 'playwright.config.js')))
const base = process.argv[2] || 'http://127.0.0.1:5288'
const out = path.join(ROOT, 'public/posters')
fs.mkdirSync(out, { recursive: true })

const browser = await chromium.launch({ executablePath: resolveChromium(), args: ['--disable-dev-shm-usage'] })
const page = await browser.newPage({ viewport: { width: 800, height: 500 }, deviceScaleFactor: 1, reducedMotion: 'no-preference' })
const errors = []
page.on('pageerror', error => errors.push(error.message))
for (const entry of CATALOG.filter(e => e.lane !== 'screenshot')) {
  await page.goto(`${base}/?solo=${entry.id}`, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => window.__benchReady === true, null, { timeout: 15000 })
  await page.screenshot({ path: path.join(out, `${entry.id}.jpg`), type: 'jpeg', quality: 82 })
  console.log(`poster ${entry.id}`)
}
await browser.close()
if (errors.length) { console.error(errors.join('\n')); process.exit(1) }
