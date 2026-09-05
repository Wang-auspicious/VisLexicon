#!/usr/bin/env node
/**
 * WP-0：键盘可达性检查。
 *
 * 对每条路由：
 *  1. Tab 遍历前 N（默认 40）个焦点元素，记录 tag / role / 可访问名 / 顺序；
 *  2. 检查焦点元素在 :focus-visible 下 outline 或 box-shadow 非 none；
 *  3. 若页面存在打开态 [role=dialog]，按 Esc 检查是否关闭。
 *
 * 用法：npm run a11y -- --label wp-c --width 1440 [--soft] [--routes "#/,#/atlas"]
 * 产物：docs/verification/<label>/a11y.json + 终端摘要
 */
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright-core'
import {
  defaultRoutes,
  parseArgs,
  previewPort,
  resolveChromium,
  startPreview,
  verificationDir,
} from '../playwright.config.js'

const args = parseArgs(process.argv.slice(2))
const label = typeof args.label === 'string' ? args.label : 'a11y'
const routes =
  typeof args.routes === 'string'
    ? args.routes.split(',').map((s) => s.trim()).filter(Boolean)
    : defaultRoutes
const width = Number(args.width) || 1440
const height = Number(args.height) || 900
const maxStops = Number(args.max) || 40
const port = Number(args.port) || previewPort
const outDir = path.join(verificationDir, label)

/** 在页面里读取当前焦点元素的描述。 */
const DESCRIBE = () => {
  const el = document.activeElement
  if (!el || el === document.body || el === document.documentElement) {
    return { none: true, tag: el ? el.tagName.toLowerCase() : 'null' }
  }
  const cs = getComputedStyle(el)
  const name =
    el.getAttribute('aria-label') ||
    (el.getAttribute('aria-labelledby') &&
      (document.getElementById(el.getAttribute('aria-labelledby')) || {}).textContent) ||
    el.getAttribute('alt') ||
    el.getAttribute('title') ||
    el.getAttribute('placeholder') ||
    (el.textContent || '').trim() ||
    el.getAttribute('value') ||
    ''
  let focusVisible = false
  try {
    focusVisible = el.matches(':focus-visible')
  } catch {
    focusVisible = false
  }
  const rect = el.getBoundingClientRect()
  return {
    tag: el.tagName.toLowerCase(),
    role: el.getAttribute('role') || null,
    name: name.replace(/\s+/g, ' ').slice(0, 60),
    href: el.getAttribute('href') || null,
    tabindex: el.getAttribute('tabindex'),
    focusVisible,
    outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`,
    outlineVisible: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0,
    boxShadow: cs.boxShadow,
    boxShadowVisible: cs.boxShadow !== 'none' && cs.boxShadow !== '',
    rect: { w: Math.round(rect.width), h: Math.round(rect.height) },
    path: (() => {
      const parts = []
      let n = el
      for (let i = 0; n && i < 4; i += 1) {
        parts.unshift(n.tagName.toLowerCase() + (n.id ? `#${n.id}` : ''))
        n = n.parentElement
      }
      return parts.join('>')
    })(),
  }
}

async function checkRoute(context, origin, route) {
  const page = await context.newPage()
  const consoleErrors = []
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text())
  })
  const result = {
    route,
    viewport: { width, height },
    stops: [],
    findings: [],
    dialog: null,
    consoleErrors,
  }
  try {
    await page.goto(`${origin}/${route.startsWith('#') ? route : `#/${route}`}`, {
      waitUntil: 'load',
      timeout: 20000,
    })
    await page.waitForTimeout(600)
  } catch (err) {
    result.findings.push({ level: 'error', message: `导航失败：${err.message}` })
    await page.close()
    return result
  }

  // 从文档开头开始 Tab。
  await page.evaluate(() => {
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur()
    window.scrollTo(0, 0)
  })

  const seen = new Set()
  for (let i = 0; i < maxStops; i += 1) {
    await page.keyboard.press('Tab')
    const info = await page.evaluate(DESCRIBE)
    if (info.none) {
      result.findings.push({
        level: 'info',
        message: `第 ${i + 1} 次 Tab 后焦点回到 ${info.tag}（可聚焦元素已遍历完或焦点逃出文档）`,
      })
      break
    }
    const key = `${info.path}|${info.tag}|${info.name}`
    const repeat = seen.has(key)
    seen.add(key)
    result.stops.push({ order: i + 1, ...info, repeat })

    if (info.focusVisible && !info.outlineVisible && !info.boxShadowVisible) {
      result.findings.push({
        level: 'error',
        message: `#${i + 1} <${info.tag}> “${info.name || '(无名)'}” 命中 :focus-visible 但 outline 与 box-shadow 均为 none`,
      })
    }
    if (!info.name) {
      result.findings.push({
        level: 'warn',
        message: `#${i + 1} <${info.tag}> 无可访问名（aria-label / 文本 / alt 均空）`,
      })
    }
    if (info.rect.w > 0 && info.rect.h > 0 && (info.rect.w < 24 || info.rect.h < 24)) {
      result.findings.push({
        level: 'warn',
        message: `#${i + 1} <${info.tag}> “${info.name || '(无名)'}” 命中区仅 ${info.rect.w}×${info.rect.h}（触摸目标建议 ≥44×44）`,
      })
    }
  }

  // 打开态 dialog 的 Esc 行为。
  const dialogs = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll('[role=dialog], dialog[open]')]
    return nodes
      .filter((n) => {
        const cs = getComputedStyle(n)
        return cs.display !== 'none' && cs.visibility !== 'hidden' && n.getClientRects().length > 0
      })
      .map((n) => ({ role: n.getAttribute('role') || n.tagName.toLowerCase(), label: (n.getAttribute('aria-label') || '').slice(0, 60) }))
  })
  if (dialogs.length) {
    await page.keyboard.press('Escape')
    await page.waitForTimeout(400)
    const after = await page.evaluate(
      () =>
        [...document.querySelectorAll('[role=dialog], dialog[open]')].filter((n) => {
          const cs = getComputedStyle(n)
          return cs.display !== 'none' && cs.visibility !== 'hidden' && n.getClientRects().length > 0
        }).length,
    )
    result.dialog = { openBefore: dialogs, openAfterEsc: after, escCloses: after < dialogs.length }
    if (!result.dialog.escCloses) {
      result.findings.push({ level: 'error', message: 'Esc 未能关闭打开态 [role=dialog]' })
    }
  } else {
    result.dialog = { openBefore: [], note: '页面初始态无打开的 [role=dialog]，未检查 Esc' }
  }

  await page.close()
  return result
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true })
  const preview = await startPreview({ port })
  const browser = await chromium.launch({
    executablePath: resolveChromium(),
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  })
  const context = await browser.newContext({ viewport: { width, height } })
  const report = {
    label,
    generatedAt: new Date().toISOString(),
    viewport: { width, height },
    maxStops,
    routes: [],
  }
  try {
    for (const route of routes) {
      report.routes.push(await checkRoute(context, preview.origin, route))
    }
  } finally {
    await context.close()
    await browser.close()
    preview.stop()
  }

  const errors = report.routes.flatMap((r) =>
    r.findings.filter((f) => f.level === 'error').map((f) => ({ route: r.route, ...f })),
  )
  const warns = report.routes.flatMap((r) =>
    r.findings.filter((f) => f.level === 'warn').map((f) => ({ route: r.route, ...f })),
  )
  report.summary = { errors: errors.length, warnings: warns.length }
  fs.writeFileSync(path.join(outDir, 'a11y.json'), `${JSON.stringify(report, null, 2)}\n`)

  for (const r of report.routes) {
    console.log(`\n── ${r.route}  (${r.stops.length} 个焦点停靠点，视口 ${width}×${height})`)
    for (const s of r.stops) {
      const ring = s.outlineVisible ? 'outline' : s.boxShadowVisible ? 'shadow' : 'none'
      console.log(
        `  ${String(s.order).padStart(2)}. <${s.tag}>${s.role ? `[${s.role}]` : ''} ${s.name || '(无名)'} — 焦点环:${ring}${s.repeat ? ' (重复)' : ''}`,
      )
    }
    if (r.dialog && r.dialog.note) console.log(`  · ${r.dialog.note}`)
    else if (r.dialog) console.log(`  · dialog Esc 关闭：${r.dialog.escCloses ? '是' : '否'}`)
    for (const f of r.findings) console.log(`  [${f.level}] ${f.message}`)
  }
  console.log(
    `\n合计：error ${errors.length}，warn ${warns.length}。详见 ${path.relative(process.cwd(), path.join(outDir, 'a11y.json'))}`,
  )
  // 默认把 error 级发现当门禁（退出码 1）；--soft 只报告不拦。
  if (errors.length && !args.soft) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
