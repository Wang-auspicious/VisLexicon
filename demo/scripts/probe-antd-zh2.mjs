/* Try antd locale via query param */
import { spawn } from 'node:child_process'
const PORT = 9349
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
async function getJson(path, method = 'GET') {
  const r = await fetch(`http://127.0.0.1:${PORT}${path}`, { method })
  if (!r.ok) throw new Error(`${r.status} ${path}`)
  return r.json()
}
const proc = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${process.env.TEMP}/vlx-antd-q`,
  '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', 'about:blank',
], { stdio: 'ignore' })
try {
  for (let i = 0; i < 40; i++) { try { await getJson('/json/version'); break } catch { await new Promise((r) => setTimeout(r, 250)) } }
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
  const ev = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true })).result.value
  for (const url of [
    'https://ant.design/components/affix/?locale=zh-CN',
    'https://ant.design/components/affix/zh-CN',
    'https://ant.design/zh-CN/components/affix/',
  ]) {
    await send('Page.navigate', { url })
    await new Promise((r) => setTimeout(r, 8000))
    const ps = await ev(`Array.from((document.querySelector('article')||document.body).querySelectorAll('p')).map(p=>p.textContent.trim()).filter(t=>t.length>15).slice(0,1)`)
    const h1 = await ev(`(document.querySelector('article h1')||{}).textContent || (document.querySelector('h1')||{}).textContent || ''`)
    console.log(url, '->', 'h1:', JSON.stringify(h1.slice(0, 40)), 'p1:', JSON.stringify((ps[0] || '').slice(0, 60)))
  }
  process.exit(0)
} catch (e) { console.error('FAIL', e); process.exit(1) } finally {
  spawn('taskkill', ['/pid', String(proc.pid), '/T', '/F'], { stdio: 'ignore' })
}
