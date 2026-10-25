// Companion computed-DOM evidence. REA screenshots are recorded separately.
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
import { resolveChromium } from '../playwright.config.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const origin = process.argv.find(a => a.startsWith('--origin='))?.slice(9) || 'http://127.0.0.1:5291'
const phase = process.argv.find(a => a.startsWith('--phase='))?.slice(8) || 'geometry'
const out = path.join(root, 'data/bencho-reference/20261025', 'perf-' + phase)
await fs.mkdir(out, { recursive: true })
const report = { tool: 'Project Playwright, own isolated headless browser; computed measurements, not REA output', origin, at: new Date().toISOString(), failures: [], views: [] }
const browser = await chromium.launch({ executablePath: resolveChromium(), headless: true })
try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1, colorScheme: 'dark', isMobile: viewport.width < 500, hasTouch: viewport.width < 500 })
    await context.addInitScript(() => { if (window === window.top) localStorage.setItem('vl-locale', 'en') })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.route('**/api/discovery/search', route => route.abort('blockedbyclient'))
    await page.route('**/api/bench/jev*', route => route.abort('blockedbyclient'))
    await page.goto(origin + '/#/components?component=seed-stacked-bars', { waitUntil: 'domcontentloaded' })
    await page.locator('.vl-component-detail .dtl-shell').waitFor()
    await page.frameLocator('.vl-component-detail iframe').locator('.recharts-surface').first().waitFor()
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(1200)
    const collect = () => page.evaluate(() => {
      const selectors = ['.dtl-shell', '.dtl-block', '.dtl-side', '.dtl-head', '.dtl-ctls', '.dtl-foot', '.dtl-view', '.dtl-x', '.dtl-group-name', '.dtl-bar', '.dtl-bar-label', '.dtl-bar-val', '.cv-ai', '.cv-ai-btn', '.cv', '.cv-bar', '.cv-h', '.cv-src']
      const elements = {}
      for (const selector of selectors) {
        const el = document.querySelector('.vl-component-detail ' + selector)
        if (!el) continue
        const rect = el.getBoundingClientRect(), style = getComputedStyle(el)
        elements[selector] = { rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }, styles: Object.fromEntries(['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'color', 'backgroundColor', 'borderRadius', 'padding', 'gap', 'zIndex'].map(key => [key, style[key]])), scrollWidth: el.scrollWidth, clientWidth: el.clientWidth, scrollHeight: el.scrollHeight, clientHeight: el.clientHeight }
      }
      const close = document.querySelector('.vl-component-detail .dtl-x'), r = close.getBoundingClientRect()
      return { elements, interLoaded: document.fonts.check('500 13.5px "VL Bencho Inter"'), viewport: { width: innerWidth, height: innerHeight }, documentWidth: document.documentElement.scrollWidth, closeHit: document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)?.closest('.dtl-x') === close }
    })
    const view = { viewport, errors, preview: await collect() }
    await page.screenshot({ path: path.join(out, `preview-${viewport.width}.png`) })
    await page.getByRole('tab', { name: 'Code', exact: true }).click()
    await page.locator('.vl-component-detail .cv-bar').first().waitFor()
    await page.waitForTimeout(350)
    view.code = await collect()
    await page.screenshot({ path: path.join(out, `code-${viewport.width}.png`) })
    if (errors.length) report.failures.push(`${viewport.width}: page errors`)
    if (!view.preview.closeHit || !view.code.closeHit) report.failures.push(`${viewport.width}: Close occluded`)
    if (!view.preview.interLoaded) report.failures.push(`${viewport.width}: scoped Inter not loaded`)
    if (viewport.width === 1440) {
      const expected = { '.dtl-shell': [220, 130, 1000, 640], '.dtl-block': [220, 130, 688, 640], '.dtl-side': [920, 130, 300, 640], '.cv-bar': [232, 190, 664, 46] }
      for (const [selector, values] of Object.entries(expected)) {
        const r = view.code.elements[selector]?.rect
        if (!r || ['x', 'y', 'width', 'height'].some((key, i) => Math.abs(r[key] - values[i]) > .05)) report.failures.push(`Desktop ${selector} differs from captured Bencho geometry`)
      }
    }
    report.views.push(view)
    await context.close()
  }
} finally { await browser.close() }
report.passed = report.failures.length === 0
await fs.writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify({ path: path.join(out, 'report.json'), passed: report.passed, failures: report.failures }))
if (!report.passed) process.exitCode = 1
