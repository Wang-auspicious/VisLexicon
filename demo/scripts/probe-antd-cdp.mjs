/* Quick CDP render of ant.design overview to see if component data is extractable */
import { writeFileSync } from 'node:fs'

const PORT = 9335
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
import { spawn } from 'node:child_process'

async function getJson(url, method = 'GET') {
  const r = await fetch(url, { method })
  if (!r.ok) throw new Error(`${r.status} ${url}`)
  return r.json()
}

async function main() {
  const profile = `${process.env.TEMP}/vlx-chrome-antd`
  const proc = spawn(CHROME, [
    '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
    '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--hide-scrollbars',
    'about:blank',
  ], { stdio: 'ignore' })
  for (let i = 0; i < 40; i++) {
    try { await getJson(`http://127.0.0.1:${PORT}/json/version`); break } catch { await new Promise((r) => setTimeout(r, 250)) }
  }
  const created = await getJson(`http://127.0.0.1:${PORT}/json/new?about:blank`, 'PUT')
  const ws = new WebSocket(created.webSocketDebuggerUrl)
  let id = 0
  const pending = new Map()
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data)
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id) }
  }
  await new Promise((r) => { ws.onopen = r })
  const send = (method, params = {}) => new Promise((res) => {
    const i = ++id
    pending.set(i, res)
    ws.send(JSON.stringify({ id: i, method, params }))
  })
  await send('Page.enable')
  await send('Runtime.enable')
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false })

  for (const url of ['https://ant.design/components/overview/']) {
    await send('Page.navigate', { url })
    await new Promise((r) => setTimeout(r, 12000))
    const { result } = await send('Runtime.evaluate', {
      expression: `({
        title: document.title,
        text: (document.body.innerText || '').slice(0, 3000),
        cards: Array.from(document.querySelectorAll('a')).filter(a => /\\/components\\//.test(a.getAttribute('href')||'')).map(a => a.getAttribute('href')).slice(0, 120)
      })`,
      returnByValue: true,
    })
    console.log('TITLE:', result.value.title)
    console.log('TEXT HEAD:', result.value.text.slice(0, 400).replace(/\n+/g, ' | '))
    console.log('CARDS:', JSON.stringify(result.value.cards, null, 0))
  }
  proc.kill()
  process.exit(0)
}
main().catch((e) => { console.error('FAIL', e); process.exit(1) })
