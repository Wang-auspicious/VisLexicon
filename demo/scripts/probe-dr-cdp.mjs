/* Probe designresourc.es rendered structure via CDP */
import { spawn } from 'node:child_process'

const PORT = 9355
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'

async function getJson(path, method = 'GET') {
  const r = await fetch(`http://127.0.0.1:${PORT}${path}`, { method })
  if (!r.ok) throw new Error(`${r.status} ${path}`)
  return r.json()
}

const proc = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${process.env.TEMP}/vlx-chrome-dr`,
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
  await send('Page.navigate', { url: 'https://designresourc.es/' })
  await new Promise((r) => setTimeout(r, 9000))
  const { result } = await send('Runtime.evaluate', {
    expression: `(() => {
      const anchors = Array.from(document.querySelectorAll('a[href]')).filter(a => a.href && /^https?:\\/\\//.test(a.href) && !a.href.includes('designresourc.es'));
      const seen = new Set();
      const items = [];
      for (const a of anchors) {
        const href = a.href.split('?')[0];
        if (seen.has(href)) continue;
        seen.add(href);
        items.push({ href, text: (a.textContent || '').trim().slice(0, 60) });
      }
      const headings = Array.from(document.querySelectorAll('h1,h2,h3')).map(h => h.textContent.trim()).slice(0, 20);
      return { items: items.slice(0, 40), headings, bodyHead: (document.body.innerText || '').slice(0, 400) };
    })()`,
    returnByValue: true,
  })
  console.log('items:', result.value.items.length)
  for (const i of result.value.items.slice(0, 20)) console.log(' -', i.href, '|', i.text)
  console.log('headings:', result.value.headings.join(' | '))
  console.log('body:', result.value.bodyHead.slice(0, 200))
  process.exit(0)
} catch (e) {
  console.error('FAIL', e)
  process.exit(1)
} finally {
  proc.kill()
}
