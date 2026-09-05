/* CDP smoke test: persistent headless Chrome driver via per-target WebSocket */
import { writeFileSync, readFileSync } from 'node:fs'

const PORT = 9223

async function getJson(url, method = 'GET') {
  const response = await fetch(url, { method })
  if (!response.ok) throw new Error(`${response.status} ${url}`)
  return response.json()
}

export class CdpPage {
  constructor(wsUrl) {
    this.wsUrl = wsUrl
    this.nextId = 0
    this.pending = new Map()
    this.eventWaiters = new Map()
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl)
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      if (message.id && this.pending.has(message.id)) {
        const entry = this.pending.get(message.id)
        this.pending.delete(message.id)
        if (message.error) entry.reject(new Error(`${message.error.message} (method ${entry.method ?? '?'})`))
        else entry.resolve(message.result)
        return
      }
      const waiters = this.eventWaiters.get(message.method)
      if (waiters?.length) {
        const waiter = waiters.shift()
        if (waiters.length === 0) this.eventWaiters.delete(message.method)
        waiter(message)
      }
    }
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve
      this.ws.onerror = reject
    })
  }

  send(method, params = {}) {
    const id = ++this.nextId
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject, method })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }

  once(method) {
    return new Promise((resolve) => {
      const waiters = this.eventWaiters.get(method) ?? []
      waiters.push(resolve)
      this.eventWaiters.set(method, waiters)
    })
  }

  async setup(width = 1280, height = 900) {
    await this.send('Page.enable')
    await this.send('Runtime.enable')
    await this.send('Emulation.setDeviceMetricsOverride', {
      width, height, deviceScaleFactor: 1, mobile: false,
    })
  }

  async navigate(url, settleMs = 8000) {
    const loaded = this.once('Page.loadEventFired')
    await this.send('Page.navigate', { url })
    await Promise.race([loaded, new Promise((r) => setTimeout(r, settleMs))])
    await new Promise((r) => setTimeout(r, 2000))
  }

  async evaluate(expression) {
    const { result, exceptionDetails } = await this.send('Runtime.evaluate', {
      expression, returnByValue: true, awaitPromise: true,
    })
    if (exceptionDetails) throw new Error(exceptionDetails.text ?? 'evaluate failed')
    return result.value
  }

  async screenshot(filePath, { format = 'jpeg', quality = 62 } = {}) {
    const { data } = await this.send('Page.captureScreenshot', {
      format, quality, fromSurface: true, captureBeyondViewport: false,
    })
    writeFileSync(filePath, Buffer.from(data, 'base64'))
    return filePath
  }
}

async function main() {
  const created = await getJson(`http://127.0.0.1:${PORT}/json/new?about:blank`, 'PUT')
  const page = new CdpPage(created.webSocketDebuggerUrl)
  await page.connect()
  await page.setup()
  await page.navigate('https://magicui.design/', 9000)
  const info = await page.evaluate(
    `({ title: document.title,
       desc: (document.querySelector('meta[name="description"]') || {}).content || '',
       github: Array.from(document.querySelectorAll('a[href*="github.com"]')).map(a => a.href).slice(0,3),
       links: document.querySelectorAll('a').length })`,
  )
  console.log('title:', info.title.slice(0, 60))
  console.log('desc:', info.desc.slice(0, 100))
  console.log('github:', JSON.stringify(info.github))
  console.log('links:', info.links)
  const shotPath = `${process.env.TEMP}/vlx-cdp-shot.jpg`
  await page.screenshot(shotPath)
  console.log('shot bytes:', readFileSync(shotPath).length)
  process.exit(0)
}

main().catch((error) => {
  console.error('FAIL', error)
  process.exit(1)
})
