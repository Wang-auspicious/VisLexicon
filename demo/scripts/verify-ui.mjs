/* 验证策展页与新目录卡片 UI：渲染、卡片数量、点击弹窗、目录加载 */
import { spawn } from 'node:child_process'

const PORT = 9360
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'

async function getJson(path, method = 'GET') {
  const r = await fetch(`http://127.0.0.1:${PORT}${path}`, { method })
  if (!r.ok) throw new Error(`${r.status} ${path}`)
  return r.json()
}

const proc = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${process.env.TEMP}/vlx-chrome-ui-check`,
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
    if (m.id && pending.has(m.id)) { const e = pending.get(m.id); pending.delete(m.id); m.error ? e.reject(new Error(m.error.message)) : e.resolve(m.result) }
  }
  await new Promise((r) => { ws.onopen = r })
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { resolve: res, reject: rej }); ws.send(JSON.stringify({ id: i, method, params })) })
  await send('Page.enable')
  await send('Runtime.enable')
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 2000, deviceScaleFactor: 1, mobile: false })

  await send('Page.navigate', { url: 'http://[::1]:5173/#/index' })
  await new Promise((r) => setTimeout(r, 8000))
  const evalv = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.value

  const curation = await evalv(`({
    cards: document.querySelectorAll('.oreo-specimen-card').length,
    catalogBtn: !!document.querySelector('.catalog-load'),
    title: document.querySelector('.oreo-logo-text')?.textContent,
  })`)
  console.log('CURATION:', JSON.stringify(curation))

  // 点击第一张策展卡片 → 弹窗
  await evalv(`document.querySelector('.oreo-specimen-card')?.click()`)
  await new Promise((r) => setTimeout(r, 800))
  const modal = await evalv(`({
    open: !!document.querySelector('.site-modal'),
    name: document.querySelector('.site-modal-title-wrap h2')?.textContent,
    author: document.querySelector('.site-modal-meta-item dd')?.textContent,
    desc: (document.querySelector('.site-modal-desc')?.textContent || '').slice(0, 60),
    visit: !!document.querySelector('.site-modal-visit'),
  })`)
  console.log('MODAL:', JSON.stringify(modal))
  await evalv(`document.querySelector('.site-modal-close')?.click()`)
  await new Promise((r) => setTimeout(r, 400))

  // 加载完整目录
  await evalv(`document.querySelector('.catalog-load')?.click()`)
  await new Promise((r) => setTimeout(r, 6000))
  const catalog = await evalv(`({
    status: document.querySelector('.catalog-status')?.textContent || '',
    cardCount: document.querySelectorAll('.catalog-result-card').length,
    total: document.querySelector('.catalog-directory-stat strong')?.textContent,
    firstCard: document.querySelector('.catalog-result-card h3')?.textContent,
    hasTrio: !!document.querySelector('.catalog-result-card .site-trio'),
    pager: !!document.querySelector('.catalog-pager'),
  })`)
  console.log('CATALOG:', JSON.stringify(catalog))

  // 点击第一张目录卡片 → 弹窗
  await evalv(`document.querySelector('.catalog-result-card')?.click()`)
  await new Promise((r) => setTimeout(r, 800))
  const catalogModal = await evalv(`({
    open: !!document.querySelector('.site-modal'),
    name: document.querySelector('.site-modal-title-wrap h2')?.textContent,
    visit: !!document.querySelector('.site-modal-visit'),
  })`)
  console.log('CATALOG MODAL:', JSON.stringify(catalogModal))
  process.exit(0)
} catch (e) {
  console.error('FAIL', e)
  process.exit(1)
} finally {
  proc.kill()
}

