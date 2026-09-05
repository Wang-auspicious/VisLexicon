import { spawn } from 'node:child_process'

const PORT = 9361
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
async function getJson(path, method = 'GET') {
  const r = await fetch(`http://127.0.0.1:${PORT}${path}`, { method })
  if (!r.ok) throw new Error(`${r.status} ${path}`)
  return r.json()
}
const proc = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${process.env.TEMP}/vlx-chrome-debug`,
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
    else if (m.method === 'Runtime.exceptionThrown') { console.log('EXCEPTION:', JSON.stringify(m.params.exceptionDetails).slice(0, 600)) }
    else if (m.method === 'Log.entryAdded') { console.log('LOG:', m.params.entry.text?.slice(0, 200)) }
  }
  await new Promise((r) => { ws.onopen = r })
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { resolve: res, reject: rej }); ws.send(JSON.stringify({ id: i, method, params })) })
  await send('Page.enable')
  await send('Runtime.enable')
  await send('Log.enable')
  await send('Page.navigate', { url: 'http://[::1]:5173/#/index' })
  await new Promise((r) => setTimeout(r, 9000))
  const { result } = await send('Runtime.evaluate', {
    expression: `({ html: document.body.innerHTML.slice(0, 400), text: (document.body.innerText || '').slice(0, 300), url: location.href })`,
    returnByValue: true,
  })
  console.log('URL:', result.value.url)
  console.log('TEXT:', result.value.text)
  console.log('HTML:', result.value.html)
  process.exit(0)
} catch (e) {
  console.error('FAIL', e)
  process.exit(1)
} finally {
  proc.kill()
}

