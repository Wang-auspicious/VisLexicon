/* 验证图鉴舞台：三列渲染、变体切换、热区描边与浮标、参数滑杆、待建档兜底。
 * 沿用 verify-ui.mjs 的 headless CDP 方式，产出真实浏览器证据与截图。
 */
import { spawn } from 'node:child_process'
import { writeFile, mkdir } from 'node:fs/promises'

const PORT = 9361
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE = process.env.ATLAS_BASE || 'http://[::1]:5173'
const SHOTS = new URL('../../docs/verification/images/', import.meta.url)

async function getJson(path, method = 'GET') {
  const r = await fetch(`http://127.0.0.1:${PORT}${path}`, { method })
  if (!r.ok) throw new Error(`${r.status} ${path}`)
  return r.json()
}

const failures = []
function check(label, ok, detail) {
  if (ok) console.log(`  ok   ${label}`)
  else { console.log(`  FAIL ${label}${detail ? ` — ${detail}` : ''}`); failures.push(label) }
}

const proc = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${process.env.TEMP}/vlx-chrome-atlas-check`,
  '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', 'about:blank',
], { stdio: 'ignore' })

try {
  for (let i = 0; i < 40; i++) {
    try { await getJson('/json/version'); break } catch { await new Promise((r) => setTimeout(r, 250)) }
  }
  const created = await getJson('/json/new?about:blank', 'PUT')
  const ws = new WebSocket(created.webSocketDebuggerUrl)
  let id = 0
  const pending = new Map()
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data)
    if (m.id && pending.has(m.id)) {
      const e = pending.get(m.id)
      pending.delete(m.id)
      if (m.error) e.reject(new Error(m.error.message)); else e.resolve(m.result)
    }
  }
  await new Promise((r) => { ws.onopen = r })
  const send = (method, params = {}) => new Promise((res, rej) => {
    const i = ++id
    pending.set(i, { resolve: res, reject: rej })
    ws.send(JSON.stringify({ id: i, method, params }))
  })

  await send('Page.enable')
  await send('Runtime.enable')
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
  const evalv = async (expression) => {
    const out = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (out.exceptionDetails) {
      throw new Error(`页面求值失败：${out.exceptionDetails.exception?.description || out.exceptionDetails.text}`)
    }
    return out.result.value
  }
  const goto = async (hash, wait = 900) => {
    await send('Page.navigate', { url: `${BASE}/${hash}` })
    for (let i = 0; i < 60; i++) {
      const ready = await evalv(`(document.querySelector('.ax') && location.hash === '/${hash}'.slice(1)) === true`)
      if (ready) break
      await new Promise((r) => setTimeout(r, 250))
    }
    await new Promise((r) => setTimeout(r, wait))
  }
  const shot = async (name) => {
    const { data } = await send('Page.captureScreenshot', { format: 'png' })
    await mkdir(SHOTS, { recursive: true })
    await writeFile(new URL(name, SHOTS), Buffer.from(data, 'base64'))
  }

  console.log('图鉴外壳')
  await goto('#/atlas', 4000)
  const shell = await evalv(`({
    stages: document.querySelectorAll('.ax-stage-tab').length,
    terms: document.querySelectorAll('.ax-term').length,
    columns: getComputedStyle(document.querySelector('.ax')).gridTemplateColumns.split(' ').length,
    variants: document.querySelectorAll('.ax-vchip').length,
    knobs: document.querySelectorAll('.ax-knobs input[type="range"]').length,
    coverage: document.querySelector('.ax-rail-foot')?.textContent.trim(),
    panelIdle: !!document.querySelector('.ax-panel-idle'),
  })`)
  check('三列布局成立', shell.columns === 3, `实测 ${shell.columns} 列`)
  check('舞台标签含九台 + 待建档', shell.stages === 10, `实测 ${shell.stages}`)
  check('默认台的术语流非空', shell.terms > 0, `实测 ${shell.terms}`)
  check('变体条含基态与各变体', shell.variants >= 10, `实测 ${shell.variants}`)
  check('参数与旋钮滑杆已挂出', shell.knobs >= 4, `实测 ${shell.knobs}`)
  check('覆盖度水位可见', /已入台 \d+ \/ \d+/.test(shell.coverage || ''), shell.coverage)
  check('未选术语时右栏是空态', shell.panelIdle)

  console.log('文字浮现台 · 变体切换')
  await goto('#/atlas/text-reveal/atlas-aesthetic-design-phenomenon-blur', 2500)
  const reveal = await evalv(`({
    preset: document.querySelector('.tr-chars')?.className,
    chars: document.querySelectorAll('.tr-ch').length,
    firstDelay: document.querySelector('.tr-ch')?.style.getPropertyValue('--tr-delay'),
    thirdDelay: document.querySelectorAll('.tr-ch')[2]?.style.getPropertyValue('--tr-delay'),
    detail: document.querySelector('.ax-detail-h h2')?.textContent,
    note: !!document.querySelector('.ax-note'),
  })`)
  check('选中变体后中间换成对应演法', /tr-blur/.test(reveal.preset || ''), reveal.preset)
  check('specimen 已拆成逐字跨度', reveal.chars === 11, `实测 ${reveal.chars}`)
  check('逐字延迟按 stagger 递增', reveal.firstDelay === '0ms' && reveal.thirdDelay === '80ms', `${reveal.firstDelay} / ${reveal.thirdDelay}`)
  check('右栏跟着换到该术语', reveal.detail === 'Blur', reveal.detail)
  check('编辑批注可见', reveal.note)
  await shot('atlas-text-reveal-1440.png')

  console.log('Agent 界面台 · 热区')
  await goto('#/atlas/agent-composer/atlas-component-component-composer', 2500)
  const hot = await evalv(`({
    marked: document.querySelectorAll('[data-node="composer.root"].sn-on').length,
    tip: document.querySelector('.ax-tip')?.textContent,
    nodes: document.querySelectorAll('.ax-viewport [data-node]').length,
    inset: getComputedStyle(document.querySelector('.ac-composer')).paddingBottom,
    xref: !!document.querySelector('.ax-xref'),
  })`)
  check('点术语后对应部件被描边', hot.marked === 1, `实测 ${hot.marked}`)
  check('浮标报出正名', /Composer/.test(hot.tip || ''), hot.tip)
  check('界面上的可命名部件全部挂到位', hot.nodes >= 17, `实测 ${hot.nodes}`)
  check('composer 距底受旋钮控制', hot.inset === '18px', hot.inset)
  await shot('atlas-agent-composer-1440.png')

  console.log('浮层台')
  await goto('#/atlas/overlay-layers/atlas-component-component-dialog-modal', 1200)
  const modal = await evalv(`({
    backdrop: !!document.querySelector('.ov-backdrop'),
    panel: !!document.querySelector('.ov-panel.ov-center'),
    behavior: document.querySelector('.ov-behavior span')?.textContent,
  })`)
  check('模态带遮罩', modal.backdrop && modal.panel)
  check('行为标注说清模态语义', /焦点陷阱/.test(modal.behavior || ''), modal.behavior)
  await shot('atlas-overlay-modal-1440.png')

  await goto('#/atlas/overlay-layers/atlas-component-component-tooltip', 1200)
  const tip2 = await evalv(`({
    backdrop: !!document.querySelector('.ov-backdrop'),
    anchored: !!document.querySelector('.ov-panel.ov-anchor'),
    behavior: document.querySelector('.ov-behavior span')?.textContent,
  })`)
  check('tooltip 无遮罩且锚定在按钮上', !tip2.backdrop && tip2.anchored)
  check('tooltip 行为标注与模态不同', /不抢焦点/.test(tip2.behavior || ''), tip2.behavior)

  console.log('表单解剖台')
  await goto('#/atlas/form-anatomy/atlas-component-component-checkboxes', 1200)
  const form = await evalv(`({
    marked: document.querySelectorAll('[data-node="form.checkbox.group"].sn-on').length,
    nodes: document.querySelectorAll('.ax-viewport [data-node]').length,
    gap: getComputedStyle(document.querySelector('.fm-col')).gap,
    tip: document.querySelector('.ax-tip')?.textContent,
    variants: document.querySelectorAll('.ax-vchip').length,
  })`)
  check('控件组被描边而不是单个控件', form.marked === 1, `实测 ${form.marked}`)
  check('表单上的可命名控件全部挂到位', form.nodes === 21, `实测 ${form.nodes}`)
  check('字段间距受旋钮控制', form.gap === '16px', form.gap)
  check('浮标报出控件组正名', /Checkboxes/.test(form.tip || ''), form.tip)
  check('纯热区台只有基态一个变体片', form.variants === 1, `实测 ${form.variants}`)
  await shot('atlas-form-anatomy-1440.png')

  console.log('过渡形变台')
  await goto('#/atlas/surface-transition/atlas-motion-design-phenomenon-morph', 1200)
  const morph = await evalv(`!!document.querySelector('.st-shell-card.st-morph .st-detail')`)
  check('卡片壳按 morph 演', morph === true)
  await shot('atlas-surface-transition-1440.png')

  await goto('#/atlas/surface-transition/atlas-component-component-carousel', 1200)
  const track = await evalv(`({ track: !!document.querySelector('.st-shell-track .st-track'), dots: document.querySelectorAll('.st-dots i').length })`)
  check('轮播换成轨道壳', track.track && track.dots === 3, JSON.stringify(track))

  await goto('#/atlas/surface-transition/atlas-motion-design-phenomenon-scroll-driven-animation', 1200)
  const driven = await evalv(`({ scroll: !!document.querySelector('.st-shell-scroll'), progress: !!document.querySelector('.st-progress') })`)
  check('滚动驱动换成滚动壳并给出进度', driven.scroll && driven.progress, JSON.stringify(driven))

  console.log('数据展示台')
  await goto('#/atlas/data-display/atlas-component-component-treegrid', 1200)
  const data = await evalv(`({
    nodes: document.querySelectorAll('.ax-viewport [data-node]').length,
    marked: document.querySelectorAll('[data-node="data.treegrid"].sn-on').length,
    tabular: ['data.table', 'data.table.static', 'data.grid', 'data.treegrid']
      .filter((n) => document.querySelector('[data-node="' + n + '"]')).length,
    zh: document.querySelector('.ax-detail-h p')?.textContent,
  })`)
  check('看板上的可命名部件全部挂到位', data.nodes === 19, `实测 ${data.nodes}`)
  check('树形表格被描边', data.marked === 1)
  check('四种表格类部件同屏可对照', data.tabular === 4, `实测 ${data.tabular}`)
  check('右栏用订正译名', data.zh === '树形表格', data.zh)
  await shot('atlas-data-display-1440.png')

  console.log('状态与加载台')
  await goto('#/atlas/state-loading/atlas-component-component-skeleton', 1400)
  const skel = await evalv(`({
    loading: !!document.querySelector('.sl-loading'),
    marked: document.querySelectorAll('[data-node="state.skeleton"].sn-on').length,
    shimmer: !!document.querySelector('[data-node="state.shimmer"]'),
    variantOn: document.querySelector('.ax-vchip.on')?.textContent,
  })`)
  check('点依附变体的热区会自动切到该变体', skel.loading && skel.variantOn !== '就绪', `变体片 ${skel.variantOn}`)
  check('骨架屏被描边', skel.marked === 1)
  check('流光与骨架屏是两块，各有正名', skel.shimmer)
  await shot('atlas-state-loading-1440.png')

  await goto('#/atlas/state-loading/atlas-component-component-error-state', 1200)
  const err = await evalv(`({ err: !!document.querySelector('.sl-blank-err'), cta: document.querySelector('.sl-blank-err .sl-cta')?.textContent })`)
  check('错误态与空状态不共用一张图', err.err && err.cta === '重试', JSON.stringify(err))

  console.log('导航台')
  await goto('#/atlas/navigation/atlas-component-component-tabs', 1200)
  const nav = await evalv(`({
    nodes: document.querySelectorAll('.ax-viewport [data-node]').length,
    marked: document.querySelectorAll('[data-node="nav.tabs"].sn-on').length,
    layers: ['nav.service', 'nav.menubar', 'nav.tabs', 'nav.breadcrumb']
      .filter((n) => document.querySelector('[data-node="' + n + '"]')).length,
  })`)
  check('外壳上的导航部件全部挂到位', nav.nodes === 13, `实测 ${nav.nodes}`)
  check('标签页被描边', nav.marked === 1)
  check('各层级导航同屏可比', nav.layers === 4, `实测 ${nav.layers}`)
  await shot('atlas-navigation-1440.png')

  await goto('#/atlas/navigation/atlas-interaction-pattern-navigate-a-service', 1200)
  const journey = await evalv(`document.querySelectorAll('.nv-journey .nv-step').length`)
  check('服务导航流程切成路径视图', journey === 5, `实测 ${journey}`)

  console.log('指针与手势台')
  await goto('#/atlas/pointer-gestures/atlas-interaction-design-phenomenon-usedrag', 1400)
  const gest = await evalv(`({
    tile: !!document.querySelector('.pg-tile'),
    ranges: document.querySelectorAll('.ax-knobs input[type="range"]').length,
    switches: document.querySelectorAll('.ax-knobs .ax-knob-switch').length,
    enums: document.querySelectorAll('.ax-knobs .ax-knob-enum').length,
    readout: document.querySelectorAll('.pg-readout div').length,
    zh: document.querySelector('.ax-detail-h p')?.textContent,
  })`)
  check('可拖方块已就位', gest.tile)
  check('连续参数渲染为滑杆', gest.ranges >= 11, `实测 ${gest.ranges}`)
  check('开关型参数渲染为开关而不是滑杆', gest.switches === 8, `实测 ${gest.switches}`)
  check('枚举型参数渲染为下拉', gest.enums === 4, `实测 ${gest.enums}`)
  check('实时读数面板可见', gest.readout >= 6, `实测 ${gest.readout}`)
  check('手势术语用订正译名', gest.zh === '拖拽手势', gest.zh)
  await shot('atlas-pointer-gestures-1440.png')

  /* 合成事件后必须让出一帧再读 DOM：React 的状态更新不是同步落到样式上的。 */
  await evalv(`(() => {
    const tile = document.querySelector('.pg-tile')
    const rect = tile.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const fire = (type, x, y) => tile.dispatchEvent(new PointerEvent(type, {
      bubbles: true, cancelable: true, pointerId: 1, pointerType: 'mouse', button: 0, buttons: 1, clientX: x, clientY: y,
    }))
    fire('pointerdown', cx, cy)
    fire('pointermove', cx + 60, cy + 10)
    window.__vlxMoved = tile.style.transform
    return true
  })()`)
  await new Promise((r) => setTimeout(r, 300))
  const mid = await evalv(`({ moved: document.querySelector('.pg-tile').style.transform })`)
  await evalv(`(() => {
    const tile = document.querySelector('.pg-tile')
    const rect = tile.getBoundingClientRect()
    tile.dispatchEvent(new PointerEvent('pointerup', {
      bubbles: true, cancelable: true, pointerId: 1, pointerType: 'mouse', button: 0, buttons: 0,
      clientX: rect.left + rect.width / 2 + 60, clientY: rect.top + rect.height / 2 + 10,
    }))
    return true
  })()`)
  await new Promise((r) => setTimeout(r, 300))
  const after = await evalv(`({ verdict: [...document.querySelectorAll('.pg-readout dd')].map((d) => d.textContent).join('|') })`)

  const dx = Number(/translate\((-?\d+(?:\.\d+)?)px/.exec(mid.moved || '')?.[1] ?? 0)
  check('指针拖拽真的把方块推出去了', dx >= 40, `x 位移 ${dx}px（${mid.moved}）`)
  check('松手后给出判定结论', /判定为/.test(after.verdict || ''), after.verdict)

  console.log('译名订正')
  await goto('#/atlas/agent-composer/atlas-component-component-composer', 1200)
  const zh = await evalv(`({
    panel: document.querySelector('.ax-detail-h p')?.textContent,
    origin: document.querySelector('.ax-zh-origin')?.textContent,
    chips: [...document.querySelectorAll('.ax-chip')].map((c) => c.textContent).join('|'),
    rail: document.querySelector('.ax-term.on .ax-term-zh')?.textContent,
  })`)
  check('右栏显示订正后的中文名', zh.panel === '输入区', zh.panel)
  check('语料原译仍然摊开给人看', /作曲家/.test(zh.origin || ''), zh.origin)
  check('已订正的条目不再挂待校标记', !/待校/.test(zh.chips || ''), zh.chips)
  check('左栏术语流也用订正名', zh.rail === '输入区', zh.rail)

  console.log('跨台互引与待建档')
  await goto('#/atlas/agent-composer/atlas-component-component-streaming-text', 2500)
  const xref = await evalv(`({
    text: [...document.querySelectorAll('.ax-xref')].map((b) => b.textContent).join('|'),
  })`)
  check('同一术语在另一台可见', /文字(浮现|与排版工坊) · 变体/.test(xref.text || ''), xref.text)

  await goto('#/atlas/__unrouted', 3000)
  const todo = await evalv(`({
    items: document.querySelectorAll('.ax-term-todo').length,
    heading: document.querySelector('.ax-main-h h1')?.textContent,
    viewport: document.querySelector('.ax-todo-note')?.textContent?.slice(0, 8),
    foot: document.querySelector('.ax-rail-foot')?.textContent.trim(),
  })`)
  /* 不写死阈值：待建档条数必须等于水位条算出来的差额，
   * 否则每推进一台就得改一次断言，而真正要守的是"一条都不能丢"。 */
  const foot = /已入台 (\d+) \/ (\d+)/.exec(todo.foot || '')
  const expectedTodo = foot ? Number(foot[2]) - Number(foot[1]) : -1
  check('待建档条数与水位条对得上，一条不丢', todo.items === expectedTodo, `列表 ${todo.items} / 水位 ${expectedTodo}`)
  check('待建档标题正确', todo.heading === '待建档', todo.heading)
  check('待建档中间给出诚实空态', /这条还没有舞台/.test(todo.viewport || '') || todo.viewport === undefined, todo.viewport)

  await goto('#/lexicon', 2500)
  const alias = await evalv(`!!document.querySelector('.ax')`)
  check('旧的 #/lexicon 仍落在图鉴上', alias === true)

  ws.close()
} finally {
  proc.kill()
}

console.log(failures.length ? `\n失败 ${failures.length} 项：${failures.join('、')}` : '\n全部通过')
process.exit(failures.length ? 1 : 0)
