// Batch renderer is part of the source-ingestion pipeline, not an assertion
// that a compile result, loading indicator or empty wrapper is a live example.
import fs from 'node:fs/promises'
import path from 'node:path'
import http from 'node:http'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
import { resolveChromium } from '../../playwright.config.js'
import { FRONT, PUBLIC, digest } from './build-previews.mjs'

const LOCAL = path.join(FRONT, 'data/ingest-v6/previews')
const mime = { '.mjs': 'text/javascript', '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg' }
export async function previewServer(root = PUBLIC) {
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost')
      if (url.pathname === '/verify') {
        const id = url.searchParams.get('id')
        if (!/^[a-zA-Z0-9_.-]+$/.test(id ?? '')) { res.writeHead(400).end(); return }
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(`<html><body style="margin:0"><iframe title="Component" sandbox="allow-scripts" src="/data/component-code/previews/${id}/index.html" style="border:0;width:800px;height:500px"></iframe></body></html>`)
        return
      }
      const target = path.resolve(root, '.' + decodeURIComponent(url.pathname.replace(/^\/data\/component-code/, '')))
      if (!target.startsWith(path.resolve(root) + path.sep)) { res.writeHead(403).end(); return }
      const body = await fs.readFile(target)
      res.writeHead(200, { 'Content-Type': mime[path.extname(target)] ?? 'application/octet-stream', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' }).end(body)
    } catch { res.writeHead(404).end() }
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  return { server, base: `http://127.0.0.1:${server.address().port}` }
}

export async function verifyPreviews({ onlyFailed = false, concurrency = 3, timeout = 18000 } = {}) {
  const builds = JSON.parse(await fs.readFile(path.join(LOCAL, 'build.json'), 'utf8'))
  let previous = []
  try { previous = JSON.parse(await fs.readFile(path.join(LOCAL, 'verified.json'), 'utf8')) } catch {}
  const finished = new Map(previous.map(r => [r.id, r]))
  const candidates = builds.filter(b => b.status === 'compiled' && !(finished.get(b.id)?.buildDigest === b.buildDigest && (!onlyFailed || finished.get(b.id)?.status === 'verified')))
  const { server, base } = await previewServer()
  const browser = await chromium.launch({ executablePath: resolveChromium(), args: ['--disable-dev-shm-usage'] })
  let cursor = 0
  await Promise.all(Array.from({ length: concurrency }, async () => {
    const page = await browser.newPage({ viewport: { width: 800, height: 500 }, deviceScaleFactor: 1, reducedMotion: 'no-preference' })
    for (;;) {
      const i = cursor++
      if (i >= candidates.length) break
      const build = candidates[i], errors = [], requests = [], badResponses = []
      const errorListener = error => errors.push(error.message)
      const requestListener = request => requests.push({ url: request.url(), error: request.failure()?.errorText })
      const responseListener = response => { if (response.status() >= 400) badResponses.push({ url: response.url(), status: response.status() }) }
      page.on('pageerror', errorListener); page.on('requestfailed', requestListener); page.on('response', responseListener)
      const record = { ...build, verifiedAt: new Date().toISOString(), status: 'failed' }
      try {
        await page.goto(`${base}/verify?id=${build.id}`, { waitUntil: 'domcontentloaded', timeout })
        let frame
        await page.waitForFunction(() => document.querySelector('iframe')?.contentWindow !== null, null, { timeout })
        frame = page.frames().find(f => f.url().includes('/previews/'))
        if (!frame) { await page.waitForTimeout(200); frame = page.frames().find(f => f.url().includes('/previews/')) }
        if (!frame) throw Error('Sandbox frame did not load')
        await frame.waitForFunction(() => window.__previewMounted || window.__previewError, null, { timeout })
        await frame.waitForTimeout(700)
        const state = await frame.evaluate(() => {
          const root = document.getElementById('root'), error = window.__previewError
          const elements = [...(root?.querySelectorAll('*') ?? [])].filter(el => {
            const r = el.getBoundingClientRect(), s = getComputedStyle(el)
            return r.width >= 4 && r.height >= 4 && s.visibility !== 'hidden' && Number(s.opacity) !== 0 && s.display !== 'none' && !el.matches('script,style')
          })
          const useful = elements.filter(el => el.textContent?.trim() || el.matches('canvas,img,svg,input,button,[role="slider"],[role="progressbar"]') || !['rgba(0, 0, 0, 0)', 'transparent'].includes(getComputedStyle(el).backgroundColor))
          const brokenImages = [...(root?.querySelectorAll('img') ?? [])].filter(img => !img.complete || img.naturalWidth === 0).length
          const busy = root?.querySelector('[aria-busy="true"],[data-loading="true"]')
          const unloadedStyles = [...document.querySelectorAll('link[rel="stylesheet"]')].filter(el => !el.sheet).length
          return { error, visibleElements: elements.length, usefulElements: useful.length, brokenImages, unloadedStyles, busy: Boolean(busy), text: root?.innerText.slice(0, 500) }
        })
        Object.assign(record, { evidence: state, errors, requests })
        if (state.error || errors.length) throw Error(state.error || errors[0])
        if (requests.length || badResponses.length) throw Error(`Required asset failed: ${JSON.stringify([...requests, ...badResponses]).slice(0, 900)}`)
        if (state.unloadedStyles) throw Error(`${state.unloadedStyles} required stylesheet(s) did not load`)
        if (/\bNaN\b|Invalid Date|undefined|Something went wrong/i.test(state.text ?? '')) throw Error('Invalid rendered example content')
        if (state.brokenImages) throw Error(`${state.brokenImages} image(s) have not loaded`)
        if (state.busy) throw Error('Example remains in loading state')
        if (state.usefulElements === 0) throw Error('No visible component content; empty wrapper rejected')
        const poster = path.join(PUBLIC, 'posters', build.id + '.jpg')
        await fs.mkdir(path.dirname(poster), { recursive: true })
        await page.locator('iframe').screenshot({ path: poster, type: 'jpeg', quality: 80 })
        record.posterUrl = `/data/component-code/posters/${build.id}.jpg`
        record.posterDigest = digest(await fs.readFile(poster))
        record.status = 'verified'; record.reason = ''
      } catch (error) { record.reason = String(error.message).slice(0, 1200); record.errors = errors; record.requests = requests }
      finished.set(build.id, record)
      page.off('pageerror', errorListener); page.off('requestfailed', requestListener); page.off('response', responseListener)
      if ((i + 1) % 25 === 0 || i + 1 === candidates.length) {
        console.log(`rendered ${i + 1}/${candidates.length}; live ${[...finished.values()].filter(r => r.status === 'verified').length}`)
        await fs.writeFile(path.join(LOCAL, 'verified.json'), JSON.stringify([...finished.values()]))
      }
    }
    await page.close()
  }))
  await browser.close(); await new Promise(resolve => server.close(resolve))
  await fs.writeFile(path.join(LOCAL, 'verified.json'), JSON.stringify([...finished.values()]))
  const summary = { attempted: finished.size, verified: [...finished.values()].filter(r => r.status === 'verified').length, failed: [...finished.values()].filter(r => r.status !== 'verified').length }
  console.log(JSON.stringify(summary))
  return summary
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await verifyPreviews({ onlyFailed: process.argv.includes('--retry-failed') })
