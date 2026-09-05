/* Quick test: one antd page with zh-CN header */
import { spawn } from 'node:child_process'
const PORT = 9347
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
async function getJson(path, method = 'GET') {
  const r = await fetch(`http://127.0.0.1:${PORT}${path}`, { method })
  if (!r.ok) throw new Error(`${r.status} ${path}`)
  return r.json()
}
const proc = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${process.env.TEMP}/vlx-antd-one`,
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
  await send('Network.enable')
  await send('Network.setExtraHTTPHeaders', { headers: { 'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.6' } })
  await send('Page.navigate', { url: 'https://ant.design/components/affix/' })
  await new Promise((r) => setTimeout(r, 9000))
  const { result } = await send('Runtime.evaluate', {
    expression: `({
      h1: (document.querySelector('h1') || {}).textContent || '',
      title: document.title || '',
      firstPs: Array.from((document.querySelector('article') || document.body).querySelectorAll('p')).map(p => p.textContent.trim()).filter(t => t.length > 20).slice(0, 3)
    })`,
    returnByValue: true,
  })
  console.log('h1:', JSON.stringify(result.value.h1))
  console.log('title:', result.value.title)
  console.log('ps:', JSON.stringify(result.value.firstPs))
  process.exit(0)
} catch (e) { console.error('FAIL', e); process.exit(1) } finally {
  spawn('taskkill', ['/pid', String(proc.pid), '/T', '/F'], { stdio: 'ignore' })
}
