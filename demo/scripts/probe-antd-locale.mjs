/* Probe antd locale storage mechanism */
import { spawn } from 'node:child_process'
const PORT = 9348
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
async function getJson(path, method = 'GET') {
  const r = await fetch(`http://127.0.0.1:${PORT}${path}`, { method })
  if (!r.ok) throw new Error(`${r.status} ${path}`)
  return r.json()
}
const proc = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${process.env.TEMP}/vlx-antd-locale`,
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
  await send('Page.navigate', { url: 'https://ant.design/components/affix/' })
  await new Promise((r) => setTimeout(r, 9000))
  const ev = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true })).result.value
  console.log('localStorage keys:', await ev('Object.keys(localStorage)'))
  console.log('locale value:', await ev('localStorage.getItem("locale") || localStorage.getItem("dcos_lang") || "none"'))
  console.log('cookies:', await ev('document.cookie'))
  // try setting zh and reload
  await ev('localStorage.setItem("locale", "zh-CN")')
  await send('Page.navigate', { url: 'https://ant.design/components/affix/' })
  await new Promise((r) => setTimeout(r, 9000))
  console.log('after reload title:', await ev('document.title'))
  console.log('after reload h1:', await ev('(document.querySelector("h1")||{}).textContent || ""'))
  console.log('after reload ps:', await ev(`Array.from((document.querySelector('article')||document.body).querySelectorAll('p')).map(p=>p.textContent.trim()).filter(t=>t.length>15).slice(0,2)`))
  process.exit(0)
} catch (e) { console.error('FAIL', e); process.exit(1) } finally {
  spawn('taskkill', ['/pid', String(proc.pid), '/T', '/F'], { stdio: 'ignore' })
}
