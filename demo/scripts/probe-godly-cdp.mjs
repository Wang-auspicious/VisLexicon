/* Probe godly.website via CDP render */
import { spawn } from 'node:child_process'

const PORT = 9350
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'

async function getJson(path, method = 'GET') {
  const r = await fetch(`http://127.0.0.1:${PORT}${path}`, { method })
  if (!r.ok) throw new Error(`${r.status} ${path}`)
  return r.json()
}

const proc = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${process.env.TEMP}/vlx-chrome-godly`,
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
  await send('Page.navigate', { url: 'https://godly.website/' })
  await new Promise((r) => setTimeout(r, 10000))
  const { result } = await send('Runtime.evaluate', {
    expression: `(() => {
      const anchors = Array.from(document.querySelectorAll('a[href]')).map(a => ({ href: a.href, text: (a.textContent || '').trim().slice(0, 60) }));
      const external = anchors.filter(a => /^https?:\\/\\//.test(a.href) && !a.href.includes('godly.website')).slice(0, 30);
      const links = anchors.filter(a => a.href.includes('godly.website/')).slice(0, 15);
      return { external, links, bodyHead: (document.body.innerText || '').slice(0, 500) };
    })()`,
    returnByValue: true,
  })
  console.log('external anchors:', result.value.external.length)
  for (const a of result.value.external) console.log(' -', a.href, '|', a.text)
  console.log('internal links:', result.value.links.map((l) => l.href).join(', '))
  console.log('body head:', result.value.bodyHead.slice(0, 300))
  process.exit(0)
} catch (e) {
  console.error('FAIL', e)
  process.exit(1)
} finally {
  proc.kill()
}
