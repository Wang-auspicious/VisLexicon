/* WP-D 验收断言：1280×900 首屏契约、跨卡基线对齐、chips 五轴、卡片是 <a>、空结果态。
 * 用 playwright-core 直接跑，不动仓库里的脚本。 */
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright-core'
import { previewPort, resolveChromium, startPreview } from '../../../playwright.config.js'

const OUT = 'docs/verification/wp-d'
const results = []
const check = (name, pass, detail) => {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}\n      ${detail}`)
}

const preview = await startPreview({ port: previewPort + 3 })
const browser = await chromium.launch({
  executablePath: resolveChromium(),
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 })
const page = await context.newPage()

try {
  await page.goto(`${preview.origin}/#/`, { waitUntil: 'load' })
  await page.waitForTimeout(900)

  /* 1. 首屏 1280×900 内第一张台的第一行共同轴可见 */
  const firstAxis = await page.evaluate(() => {
    const bench = document.querySelector('.vl-bench')
    const cells = [...bench.querySelectorAll('.vl-bench-cell')]
    const keys = [...bench.querySelectorAll('.vl-bench-key')].slice(1)
    const r = cells[0].getBoundingClientRect()
    const k = keys[0].getBoundingClientRect()
    return {
      keyLabel: keys[0].textContent,
      keyTop: k.top, keyBottom: k.bottom,
      cellTop: r.top, cellBottom: r.bottom,
      viewportH: window.innerHeight,
      benchTop: bench.getBoundingClientRect().top,
    }
  })
  check(
    '1280×900 首屏内第一张台的第一行共同轴完整可见',
    firstAxis.cellBottom <= firstAxis.viewportH,
    `轴名「${firstAxis.keyLabel.trim()}」行 top=${firstAxis.cellTop.toFixed(1)} bottom=${firstAxis.cellBottom.toFixed(1)}，视口高 ${firstAxis.viewportH}`,
  )

  /* 2. 三条共同轴在各站之间基线对齐 */
  const rows = await page.evaluate(() => {
    const bench = document.querySelector('.vl-bench')
    const grid = bench.querySelector('.vl-bench-grid')
    const cells = [...grid.querySelectorAll('.vl-bench-cell')]
    const axes = Number(getComputedStyle(grid).getPropertyValue('--vl-bench-rows')) - 1
    const byRow = {}
    cells.forEach((cell, index) => {
      const row = index % axes
      const box = cell.getBoundingClientRect()
      const value = cell.querySelector('.vl-axis-value')
      const valueBox = value.getBoundingClientRect()
      byRow[row] = byRow[row] ?? []
      byRow[row].push({ top: box.top, bottom: box.bottom, textTop: valueBox.top })
    })
    return { axes, byRow, columns: cells.length / axes }
  })
  const spread = Object.entries(rows.byRow).map(([row, list]) => {
    const tops = list.map((x) => x.top)
    const textTops = list.map((x) => x.textTop)
    return {
      row,
      n: list.length,
      topSpread: Math.max(...tops) - Math.min(...tops),
      textSpread: Math.max(...textTops) - Math.min(...textTops),
    }
  })
  check(
    '三条共同轴跨全部卡片基线对齐',
    spread.every((s) => s.topSpread < 0.5 && s.textSpread < 0.5),
    spread.map((s) => `第${Number(s.row) + 1}轴 ${s.n} 列：行顶差 ${s.topSpread.toFixed(2)}px / 文字顶差 ${s.textSpread.toFixed(2)}px`).join('；'),
  )

  /* 3. 卡片是 <a>，且覆盖整卡 */
  await page.goto(`${preview.origin}/#/sites`, { waitUntil: 'load' })
  await page.waitForTimeout(700)
  const cardLinks = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.vl-card--grid')]
    return cards.map((card) => {
      const link = card.querySelector('a.vl-card-link')
      const after = link ? getComputedStyle(link, '::after') : null
      return {
        tag: link?.tagName,
        href: link?.getAttribute('href'),
        stretched: after ? after.position === 'absolute' && after.content !== 'none' : false,
        source: card.querySelector('.vl-card-source')?.getAttribute('target'),
      }
    })
  })
  check(
    '每张卡都有一个 <a href="#/site/…"> 且拉伸覆盖整卡；「去源站」另开标签',
    cardLinks.length === 12 &&
      cardLinks.every((c) => c.tag === 'A' && /^#\/site\//.test(c.href) && c.stretched && c.source === '_blank'),
    `${cardLinks.length} 张卡，首张 href=${cardLinks[0]?.href}`,
  )

  /* 4. chips 恰好五轴 */
  const axesRendered = await page.evaluate(() =>
    [...document.querySelectorAll('.vl-chips-row .vl-chips-label')].map((el) => el.textContent.trim()),
  )
  check(
    'chips 渲染出的轴恰好是 许可 / 获取方式 / 交付物 / 拿走方式 / 内容组织 五条',
    axesRendered.join(',') === '许可,获取方式,交付物,拿走方式,内容组织',
    `实际渲染：${axesRendered.join(' / ')}（${axesRendered.length} 条）`,
  )
  const forbidden = await page.evaluate(() => {
    const text = document.querySelector('.vl-chips')?.textContent ?? ''
    return ['媒体', '受众', '语言', 'ui', 'designer', 'developer', 'en'].filter((w) => text.includes(w))
  })
  check(
    'media / audiences / languages 三轴及其值不出现在 chips 上',
    forbidden.length === 0,
    forbidden.length ? `出现了：${forbidden.join(',')}` : '未出现任何这三轴的轴名或值',
  )

  /* 5. 空结果态 */
  await page.goto(`${preview.origin}/#/sites?q=zzzz&licenses=MIT`, { waitUntil: 'load' })
  await page.waitForTimeout(700)
  const empty = await page.evaluate(() => {
    const box = document.querySelector('.vl-empty')
    return {
      text: box ? box.textContent.replace(/\s+/g, ' ').trim() : null,
      hasButton: Boolean(box?.querySelector('.vl-empty-action')),
    }
  })
  check(
    '空结果态说清哪个条件排除得最多，并给出可点的清除按钮',
    Boolean(empty.text && /排除得最多/.test(empty.text) && empty.hasButton),
    empty.text ?? '未渲染空结果态',
  )

  /* 6. 深链筛选 */
  await page.goto(`${preview.origin}/#/sites?licenses=MIT`, { waitUntil: 'load' })
  await page.waitForTimeout(700)
  const deep = await page.evaluate(() => ({
    count: document.querySelectorAll('.vl-card--grid').length,
    label: document.querySelector('.vl-result-count')?.textContent.trim(),
    pressed: [...document.querySelectorAll('.vl-chip[aria-pressed="true"]')].map((el) => el.textContent.trim()),
  }))
  check(
    '深链 #/sites?licenses=MIT 直接进到已收口的结果',
    deep.count === 6 && deep.pressed.length === 1,
    `${deep.label}；选中 chip：${deep.pressed.join(',')}`,
  )

  /* 7. 附：滚到底再截三张图（懒加载的主图会补齐，供人工看图） */
  for (const [route, file] of [['#/', 'scrolled-home-1280.png'], ['#/sites', 'scrolled-sites-1280.png']]) {
    await page.goto(`${preview.origin}/${route}`, { waitUntil: 'load' })
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 60))
      }
      window.scrollTo(0, 0)
    })
    await page.waitForTimeout(1200)
    await page.screenshot({ path: path.join(OUT, file), fullPage: true })
  }
} finally {
  await browser.close()
  preview.stop()
}

fs.writeFileSync(path.join(OUT, 'wp-d-assertions.json'), `${JSON.stringify(results, null, 2)}\n`)
const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} 通过`)
process.exit(failed.length ? 1 : 0)
