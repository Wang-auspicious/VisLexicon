#!/usr/bin/env node
/**
 * WP-0：三档视口全页截图 + 横向溢出/控制台错误报告。
 *
 * 用法：
 *   npm run shots -- --label baseline
 *   npm run shots -- --label wp-d --routes "#/,#/sites"
 *   npm run shots -- --label wp-f --reduced-motion
 *
 * 产物：docs/verification/<label>/<route>-<width>.png 与 report.json
 * 路由不存在也不报错——照样截当前渲染结果（hash router 会静默落回首页）。
 */
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright-core'
import {
  defaultRoutes,
  parseArgs,
  previewPort,
  resolveChromium,
  routeSlug,
  startPreview,
  verificationDir,
  viewports,
} from '../playwright.config.js'

const args = parseArgs(process.argv.slice(2))
const label = typeof args.label === 'string' ? args.label : 'baseline'
const routes =
  typeof args.routes === 'string'
    ? args.routes.split(',').map((s) => s.trim()).filter(Boolean)
    : defaultRoutes
const reducedMotion = Boolean(args['reduced-motion'])
const port = Number(args.port) || previewPort
const outDir = path.join(verificationDir, label)

async function main() {
  fs.mkdirSync(outDir, { recursive: true })
  const preview = await startPreview({ port })
  const browser = await chromium.launch({
    executablePath: resolveChromium(),
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  })

  const report = {
    label,
    generatedAt: new Date().toISOString(),
    reducedMotion,
    origin: preview.origin,
    routes,
    viewports: viewports.map((v) => v.width),
    pages: [],
  }

  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
        reducedMotion: reducedMotion ? 'reduce' : 'no-preference',
      })
      for (const route of routes) {
        const page = await context.newPage()
        const consoleErrors = []
        const pageErrors = []
        page.on('console', (msg) => {
          if (msg.type() === 'error') consoleErrors.push(msg.text())
        })
        page.on('pageerror', (err) => pageErrors.push(String(err && err.message ? err.message : err)))

        const url = `${preview.origin}/${route.startsWith('#') ? route : `#/${route}`}`
        let navError = null
        try {
          await page.goto(url, { waitUntil: 'load', timeout: 20000 })
          // hash 变化不触发导航，主动等一帧让路由渲染完。
          await page.waitForTimeout(600)
        } catch (err) {
          navError = String(err && err.message ? err.message : err)
        }

        const metrics = await page
          .evaluate(() => ({
            scrollWidth: Math.max(
              document.documentElement.scrollWidth,
              document.body ? document.body.scrollWidth : 0,
            ),
            innerWidth: window.innerWidth,
            scrollHeight: document.documentElement.scrollHeight,
            title: document.title,
            hash: location.hash,
            rootHtmlLength: document.getElementById('root')
              ? document.getElementById('root').innerHTML.length
              : 0,
          }))
          .catch(() => null)

        const file = `${routeSlug(route)}-${viewport.width}.png`
        let shotError = null
        try {
          await page.screenshot({ path: path.join(outDir, file), fullPage: true })
        } catch (err) {
          shotError = String(err && err.message ? err.message : err)
        }

        const overflow = metrics ? metrics.scrollWidth > metrics.innerWidth : null
        report.pages.push({
          route,
          viewport: viewport.width,
          file,
          scrollWidth: metrics ? metrics.scrollWidth : null,
          innerWidth: metrics ? metrics.innerWidth : null,
          scrollHeight: metrics ? metrics.scrollHeight : null,
          horizontalOverflow: overflow,
          overflowPx: metrics ? Math.max(0, metrics.scrollWidth - metrics.innerWidth) : null,
          renderedHash: metrics ? metrics.hash : null,
          rootHtmlLength: metrics ? metrics.rootHtmlLength : null,
          consoleErrors,
          pageErrors,
          navError,
          shotError,
        })
        await page.close()
      }
      await context.close()
    }
  } finally {
    await browser.close()
    preview.stop()
  }

  const overflowing = report.pages.filter((p) => p.horizontalOverflow)
  const erroring = report.pages.filter((p) => p.consoleErrors.length || p.pageErrors.length)
  const empty = report.pages.filter((p) => (p.rootHtmlLength || 0) < 200)
  report.summary = {
    total: report.pages.length,
    horizontalOverflow: overflowing.length,
    pagesWithErrors: erroring.length,
    nearEmptyRenders: empty.length,
  }
  fs.writeFileSync(path.join(outDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`)

  console.log(`\n截图产物：${path.relative(process.cwd(), outDir)}`)
  console.log(`共 ${report.pages.length} 张（${routes.length} 路由 × ${viewports.length} 档）`)
  console.log(`横向溢出：${overflowing.length}`)
  for (const p of overflowing) {
    console.log(`  ✗ ${p.route} @${p.viewport}  scrollWidth=${p.scrollWidth} > ${p.innerWidth}`)
  }
  console.log(`有控制台/页面错误：${erroring.length}`)
  for (const p of erroring) {
    const first = [...p.pageErrors, ...p.consoleErrors][0]
    console.log(`  ! ${p.route} @${p.viewport}  ${first}`)
  }
  if (empty.length) {
    console.log(`几乎空白渲染（#root < 200 字符）：${empty.length}（路由可能尚未实现）`)
    for (const p of empty) console.log(`  · ${p.route} @${p.viewport}`)
  }
  // 截图脚本本身只报告，不因页面问题退出非 0——人工看图与 report.json 判定。
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
