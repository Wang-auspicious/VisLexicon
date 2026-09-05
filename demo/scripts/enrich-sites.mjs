/* 站点富化 worker：真实访问目录里的每个网站，提取
 *  - 站名/站方自述（meta description）
 *  - 作者 / GitHub / 社交链接
 *  - 技术栈信号
 *  - 深链（找到 2 个关键页面）并三图截图（JPEG 1280×900）
 *  - 组合一条人话中文简介（描述里有什么、是否教学、是否有真代码可拿）
 * 断点续跑：data/enrichment/state.json 记录已完成集合。
 *
 * 用法：
 *   node scripts/enrich-sites.mjs                     # 全量（跳过已完成）
 *   node scripts/enrich-sites.mjs --limit 20          # 只处理前 20 条
 *   node scripts/enrich-sites.mjs --ids id1,id2       # 指定条目
 *   node scripts/enrich-sites.mjs --offset 0 --limit 500 --workers 3
 */
import { spawn } from 'node:child_process'
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const DEMO_ROOT = resolve(SCRIPT_DIR, '..')
const CATALOG = resolve(DEMO_ROOT, 'src/data/site-catalog.json')
const STATE_DIR = resolve(DEMO_ROOT, 'data/enrichment')
const STATE_FILE = resolve(STATE_DIR, 'state.json')
const SITES_DIR = resolve(STATE_DIR, 'sites')
const SHOTS_DIR = resolve(DEMO_ROOT, 'public/shots')
const LOG_FILE = resolve(STATE_DIR, 'progress.log')
const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
]
const SHOT_WIDTH = 1280
const SHOT_HEIGHT = 900
const SETTLE_MS = 1000
const LOAD_TIMEOUT_MS = 9000
const PAGE_RECREATE_EVERY = 30
const DEEP_LINK_KEYWORDS = [
  'component', 'docs', 'documentation', 'gallery', 'showcase', 'examples', 'pattern',
  'element', 'block', 'template', 'library', 'icon', 'font', 'color', 'animation',
  'screen', 'page', 'section', 'kit', 'theme', 'inspiration', 'explore', 'browse',
  'work', 'project', 'design', 'asset', 'resource', 'download', 'figma', 'ui',
]
const NOISE_PATHS = new Set([
  'login', 'signup', 'sign-in', 'sign-up', 'register', 'cart', 'checkout', 'account',
  'admin', 'privacy', 'terms', 'about', 'contact', 'pricing', 'careers', 'jobs',
  'press', 'legal', 'newsletter', 'subscribe', 'search', 'sitemap', 'rss', 'feed',
  'blog', 'news', 'support', 'help', 'faq', 'status', 'upgrade', 'billing', 'settings',
  'logout', 'wishlist', 'compare', 'affiliate', 'partner', 'team', 'imprint', 'cookie',
])

async function sleep(ms) {
  await new Promise((resolveDelay) => setTimeout(resolveDelay, ms))
}

async function getJson(url, method = 'GET') {
  const response = await fetch(url, { method })
  if (!response.ok) throw new Error(`${response.status} ${url}`)
  return response.json()
}

class CdpPage {
  constructor(wsUrl) {
    this.wsUrl = wsUrl
    this.nextId = 0
    this.pending = new Map()
    this.eventWaiters = new Map()
    this.alive = true
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl)
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      if (message.id && this.pending.has(message.id)) {
        const entry = this.pending.get(message.id)
        this.pending.delete(message.id)
        if (message.error) entry.reject(new Error(`${message.error.message} (method ${entry.method})`))
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
    await new Promise((resolvePromise, reject) => {
      this.ws.onopen = resolvePromise
      this.ws.onerror = reject
    })
  }

  send(method, params = {}) {
    if (!this.alive) return Promise.reject(new Error('page closed'))
    const id = ++this.nextId
    return new Promise((resolvePromise, reject) => {
      this.pending.set(id, { resolve: resolvePromise, reject, method })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }

  once(method) {
    return new Promise((resolvePromise) => {
      const waiters = this.eventWaiters.get(method) ?? []
      waiters.push(resolvePromise)
      this.eventWaiters.set(method, waiters)
    })
  }

  async setup() {
    await this.send('Page.enable')
    await this.send('Runtime.enable')
    await this.send('Emulation.setDeviceMetricsOverride', {
      width: SHOT_WIDTH,
      height: SHOT_HEIGHT,
      deviceScaleFactor: 1,
      mobile: false,
    })
  }

  async navigate(url, waitLoad = false) {
    if (waitLoad) {
      const loaded = this.once('Page.loadEventFired')
      await this.send('Page.navigate', { url })
      await Promise.race([loaded, sleep(LOAD_TIMEOUT_MS)])
    } else {
      await this.send('Page.navigate', { url })
    }
    await sleep(SETTLE_MS)
  }

  async evaluate(expression) {
    const { result, exceptionDetails } = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    })
    if (exceptionDetails) throw new Error(exceptionDetails.text ?? 'evaluate failed')
    return result.value
  }

  async screenshot(filePath) {
    const { data } = await this.send('Page.captureScreenshot', {
      format: 'jpeg',
      quality: 62,
      fromSurface: true,
      captureBeyondViewport: false,
    })
    await writeFile(filePath, Buffer.from(data, 'base64'))
  }

  async close() {
    this.alive = false
    try { this.ws?.close() } catch { /* ignore */ }
  }
}

class ChromePool {
  constructor(chromePath, port, pageCount) {
    this.chromePath = chromePath
    this.port = port
    this.pageCount = pageCount
    this.pages = []
    this.pagesUsed = []
  }

  async start() {
    const profile = resolve(process.env.TEMP ?? '.', `vlx-chrome-${this.port}`)
    await rm(profile, { recursive: true, force: true }).catch(() => {})
    this.proc = spawn(
      this.chromePath,
      [
        '--headless=new',
        `--remote-debugging-port=${this.port}`,
        `--user-data-dir=${profile}`,
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-background-networking',
        '--disable-extensions',
        '--disable-sync',
        '--metrics-recording-only',
        '--mute-audio',
        '--window-size=1280,900',
        '--hide-scrollbars',
        'about:blank',
      ],
      { stdio: 'ignore', windowsHide: true },
    )
    this.proc.on('exit', () => {
      for (const page of this.pages) page.alive = false
    })
    // wait for devtools endpoint
    for (let attempt = 0; attempt < 40; attempt += 1) {
      try {
        await getJson(`http://127.0.0.1:${this.port}/json/version`)
        break
      } catch {
        await sleep(250)
      }
    }
  }

  async ensureAlive() {
    try {
      await getJson(`http://127.0.0.1:${this.port}/json/version`)
      return
    } catch {
      // browser died (e.g. external cleanup): restart it and drop stale pages
      for (const page of this.pages) {
        if (page) page.alive = false
      }
      this.pages = []
      this.pagesUsed = []
      this.proc?.kill()
      await this.start()
    }
  }

  async acquirePage(workerIndex = 0) {
    await this.ensureAlive()
    const page = this.pages[workerIndex]
    if (page && this.pagesUsed[workerIndex] % PAGE_RECREATE_EVERY === 0) {
      // periodically recycle the worker's page to avoid renderer leaks
      this.pages[workerIndex] = null
      await page.close().catch(() => {})
    }
    if (!this.pages[workerIndex]) {
      const created = await getJson(
        `http://127.0.0.1:${this.port}/json/new?about:blank`,
        'PUT',
      )
      const fresh = new CdpPage(created.webSocketDebuggerUrl)
      await fresh.connect()
      await fresh.setup()
      this.pages[workerIndex] = fresh
    }
    this.pagesUsed[workerIndex] = (this.pagesUsed[workerIndex] ?? 0) + 1
    return this.pages[workerIndex]
  }

  async stop() {
    for (const page of this.pages) await page.close().catch(() => {})
    try { await getJson(`http://127.0.0.1:${this.port}/json/close`) } catch { /* ignore */ }
    this.proc?.kill()
  }
}

const EXTRACTION_EXPRESSION = `(() => {
  const q = (sel) => Array.from(document.querySelectorAll(sel));
  const meta = (name) => {
    const el = document.querySelector('meta[name="' + name + '"]')
      || document.querySelector('meta[property="' + name + '"]');
    return el ? (el.getAttribute('content') || '').trim() : '';
  };
  const origin = location.origin;
  const links = q('a')
    .map((a) => ({ href: a.href, text: (a.textContent || '').trim().slice(0, 80) }))
    .filter((l) => l.href && l.href.startsWith(origin) && !l.href.startsWith('javascript:'))
    .filter((l) => !l.href.includes('#'))
    .filter((l) => !/\\\\.(png|jpe?g|gif|webp|svg|pdf|zip|rar|7z|mp4|mp3|woff2?|ttf|eot|css|js)$/i.test(new URL(l.href).pathname));
  const scripts = q('script[src]').map((s) => s.src).join(' ');
  const footer = (document.querySelector('footer') || {}).textContent || '';
  const github = q('a[href]')
    .map((a) => a.href)
    .filter((h) => /^https?:\\/\\/(www\\.)?github\\.com\\//i.test(h) || /github\\.io/i.test(h));
  const socials = q('a[href]').map((a) => a.href);
  const text = (document.body ? document.body.innerText : '').slice(0, 6000);
  return {
    title: (document.title || '').trim(),
    description: meta('description') || meta('og:description'),
    ogTitle: meta('og:title'),
    generator: meta('generator'),
    author: meta('author'),
    github: [...new Set(github)].slice(0, 3),
    socials: [...new Set(socials)].filter((h) => /twitter\\.com|instagram\\.com|dribbble\\.com|behance\\.net|linkedin\\.com|x\\.com/i.test(h)).slice(0, 6),
    links: links.slice(0, 300),
    scripts: scripts.slice(0, 3000),
    footer: footer.replace(/\\s+/g, ' ').slice(0, 500),
    text: text.replace(/\\s+/g, ' '),
  };
})()`

function detectTech(info) {
  const hay = `${info.scripts} ${info.generator} ${info.text.slice(0, 2000)}`.toLowerCase()
  const hints = [
    ['react', /react|reactjs|next\.js|remix|gatsby/i],
    ['vue', /vue\.js|nuxt|vite/i],
    ['angular', /angular|ng-|ngx/i],
    ['svelte', /svelte/i],
    ['tailwind', /tailwind/i],
    ['bootstrap', /bootstrap/i],
    ['framer-motion', /framer[ -]?motion/i],
    ['gsap', /gsap|greensock/i],
    ['three-js', /three\.js|webgl/i],
    ['shadcn', /shadcn/i],
    ['figma', /figma/i],
    ['webflow', /webflow/i],
    ['wordpress', /wordpress|wp-content/i],
    ['elementor', /elementor/i],
    ['css-animation', /css.*animat|animat.*css/i],
  ]
  const found = []
  for (const [name, pattern] of hints) {
    if (pattern.test(hay)) found.push(name)
    if (found.length >= 5) break
  }
  return found
}

function detectAuthor(info, domain) {
  if (info.author) return { author: info.author.trim().slice(0, 80), source: 'meta-author' }
  const social = info.socials[0]
  if (social) {
    const match = social.match(/(?:twitter|x)\.com\/([^/?#]+)/i)
    if (match) return { author: `@${match[1]}`, source: 'social', url: social }
  }
  const by = info.footer.match(
    /(?:made|built|crafted|created|designed|developed|maintained|powered|curated)\s+by\s+([^©|<]{2,60})/i,
  )
  if (by) return { author: by[1].replace(/\s+/g, ' ').trim().slice(0, 60), source: 'footer' }
  const handle = info.text.match(/@([a-z0-9_]{3,24})/i)
  if (handle) return { author: `@${handle[1]}`, source: 'body-handle' }
  return { author: '', source: 'none' }
}

const BOT_WALL_PATTERN =
  /attention required|just a moment|checking your browser|verify (you are|that you'?re) human|cf-browser-verification|enable javascript and cookies|access denied|error 1010|cloudflare|permission denied/i

function looksBlocked(info) {
  const hay = `${info.title} ${info.description} ${info.text.slice(0, 800)}`
  return BOT_WALL_PATTERN.test(hay)
}

function pickDeepLinks(info, origin, count = 2) {
  const currentPath = new URL(origin).pathname || '/'
  const scored = info.links
    .map((link) => {
      let url
      try { url = new URL(link.href) } catch { return null }
      const path = url.pathname.toLowerCase()
      if (NOISE_PATHS.has(path.split('/')[1])) return null
      const hay = `${path} ${link.text.toLowerCase()}`
      let score = 0
      for (const keyword of DEEP_LINK_KEYWORDS) {
        if (hay.includes(keyword)) score += keyword.length >= 6 ? 3 : 2
      }
      if (path === '/' || path === '') score = -10
      if (url.pathname === currentPath) score -= 5
      if (link.text.length < 2) score -= 2
      return { url: link.href, text: link.text, score }
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
  const seen = new Set()
  const picks = []
  for (const item of scored) {
    if (item.score <= 0) break
    const key = item.url.split('?')[0]
    if (seen.has(key)) continue
    seen.add(key)
    picks.push({ url: item.url, text: item.text })
    if (picks.length >= count) break
  }
  return picks
}

function composeChinese(entry, info, tech, author) {
  const summary = {
    'AI 设计工具': 'AI 设计工具站',
    '灵感与案例': '设计灵感与案例站',
    'UI 组件与设计系统': 'UI 组件与设计系统站',
    '视觉素材与字体': '视觉素材资源站',
    '设计创作与原型': '设计与原型工具站',
    'UX 研究与学习': 'UX 研究与学习资源站',
    '前端开发与动效': '前端开发与动效资源站',
    '协作与效率': '设计协作与效率工具站',
    '品牌与营销': '品牌与营销资源站',
  }
  const kind = summary[entry.category] ?? '设计资源站'
  const desc = info.description || ''
  const descLow = desc.toLowerCase()
  const contentBits = []
  if (/component|ui kit|ui library|design system/.test(descLow)) contentBits.push('站内收录成体系的组件与界面区块')
  if (/template/.test(descLow)) contentBits.push('提供可直接套用的模板')
  if (/icon/.test(descLow)) contentBits.push('提供可检索的图标资源')
  if (/font|typograph/.test(descLow)) contentBits.push('提供字体与排版资源')
  if (/color|palette|gradient/.test(descLow)) contentBits.push('提供配色方案与色彩灵感')
  if (/illustrat|vector/.test(descLow)) contentBits.push('提供插画与矢量素材')
  if (/learn|tutorial|course|guide|teach|education/.test(descLow)) contentBits.push('以教学为主，含教程与逐步讲解')
  if (/generat|ai|artificial/.test(descLow)) contentBits.push('用 AI 直接生成或辅助产出')
  if (/inspiration|showcase|gallery|collection|portfolio/.test(descLow)) contentBits.push('汇集大量精选案例供参考')
  if (/open source|open-source|github/i.test(`${info.github.join(' ')} ${descLow}`)) contentBits.push('开源项目，真实代码可从仓库获取')
  if (/download|free|免费|免费下载/.test(descLow)) contentBits.push('素材或文件可直接下载使用')
  if (contentBits.length === 0) {
    const sub = entry.subcategories?.[0]
    if (sub) contentBits.push(`归类为「${sub}」`)
    else contentBits.push('围绕设计与前端工作流提供资源')
  }
  const techBits = []
  if (tech.includes('react')) techBits.push('React')
  if (tech.includes('vue')) techBits.push('Vue')
  if (tech.includes('angular')) techBits.push('Angular')
  if (tech.includes('tailwind')) techBits.push('Tailwind CSS')
  if (tech.includes('bootstrap')) techBits.push('Bootstrap')
  if (tech.includes('figma')) techBits.push('Figma')
  if (tech.includes('three-js')) techBits.push('Three.js/WebGL')
  const techSentence = techBits.length > 0 ? `技术上可见 ${techBits.slice(0, 3).join('、')} 的痕迹，` : ''
  const authorSentence =
    author.author && entry.category !== 'AI 设计工具'
      ? `作者署名 ${author.author}；`
      : ''
  const pricingSentence = {
    free: '免费使用。',
    freemium: '免费可用，另有付费升级。',
    trial: '可免费试用。',
    paid: '以付费为主。',
    beta: '处于测试阶段。',
    unknown: '价格未标注。',
  }[entry.pricing?.model] ?? '价格未标注。'
  const first = contentBits.slice(0, 2).join('，')
  const sentence = `${entry.name}：${kind}。${techSentence}${first}${first ? '，' : ''}${authorSentence}${pricingSentence}`
  return sentence.replace(/\s+/g, ' ').trim()
}

async function processEntry(entry, pool, state, workerIndex) {
  const id = entry.id
  const result = {
    id,
    name: entry.name,
    canonicalUrl: entry.canonicalUrl,
    fetchedAt: new Date().toISOString(),
    httpStatus: null,
    liveTitle: '',
    liveDescription: '',
    author: { author: '', source: 'none', url: null },
    github: [],
    socials: [],
    tech: [],
    deepLinks: [],
    shots: [],
    descriptionZh: '',
    status: 'visited',
    error: null,
  }

  const page = await pool.acquirePage(workerIndex)
  try {
    await page.navigate(entry.canonicalUrl, true)
    const info = await page.evaluate(EXTRACTION_EXPRESSION)
    result.liveTitle = info.title || entry.name
    result.liveDescription = info.description || ''
    result.httpStatus = 200
    if (looksBlocked(info)) {
      result.status = 'bot-walled'
      result.error = 'bot verification wall (Cloudflare or similar)'
      result.descriptionZh = entry.descriptionZh || `${entry.name}：站点有反爬验证，无法直接预览。`
      await writeFile(resolve(SITES_DIR, `${id}.json`), `${JSON.stringify(result, null, 2)}\n`)
      state.completed[id] = result.status
      return result
    }
    const tech = detectTech(info)
    result.tech = tech
    result.author = detectAuthor(info, entry.domain)
    result.github = info.github.map((url) => url.split('?')[0])
    result.socials = info.socials
    const origin = new URL(entry.canonicalUrl).origin
    const deepLinks = pickDeepLinks(info, origin, 2)
    result.deepLinks = deepLinks

    const targets = [
      { url: entry.canonicalUrl, label: '首页', file: '01' },
      ...deepLinks.slice(0, 2).map((link, index) => ({
        url: link.url,
        label: link.text.slice(0, 40) || `页面 ${index + 2}`,
        file: String(index + 2).padStart(2, '0'),
      })),
    ]
    const shotDir = resolve(SHOTS_DIR, id)
    await mkdir(shotDir, { recursive: true })
    for (const target of targets) {
      try {
        await page.navigate(target.url)
        const shotPath = resolve(shotDir, `${target.file}.jpg`)
        await page.screenshot(shotPath)
        result.shots.push({
          src: `/shots/${id}/${target.file}.jpg`,
          sourceUrl: target.url,
          alt: `${entry.name} ${target.label}`,
        })
      } catch (error) {
        result.shots.push({
          src: null,
          sourceUrl: target.url,
          alt: `${entry.name} ${target.label}`,
          error: error.message,
        })
      }
    }
    result.descriptionZh = composeChinese(entry, info, tech, result.author)
    result.status = result.shots.some((shot) => shot.src) ? 'visited' : 'partial'
  } catch (error) {
    const message = `${error.message}`.slice(0, 200)
    const infraFailure = /fetch failed|ECONNREFUSED|page closed|WebSocket|Target |socket|EPIPE|ERR_CONNECTION/i.test(message)
    result.status = infraFailure ? 'retryable' : 'unreachable'
    result.error = message
  }

  await writeFile(resolve(SITES_DIR, `${id}.json`), `${JSON.stringify(result, null, 2)}\n`)
  if (result.status !== 'retryable') {
    state.completed[id] = result.status
  }
  state.failed = Object.values(state.completed).filter((value) => value === 'unreachable').length
  state.done = Object.keys(state.completed).length
  return result
}

async function main() {
  const args = process.argv.slice(2)
  const options = { limit: Infinity, offset: 0, workers: 3, ids: null }
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--limit') options.limit = Number(args[++index])
    else if (args[index] === '--offset') options.offset = Number(args[++index])
    else if (args[index] === '--workers') options.workers = Number(args[++index])
    else if (args[index] === '--ids') options.ids = args[++index].split(',').map((value) => value.trim()).filter(Boolean)
    else throw new Error(`Unknown argument: ${args[index]}`)
  }

  const catalog = JSON.parse(await readFile(CATALOG, 'utf8'))
  await mkdir(SITES_DIR, { recursive: true })
  let state = { schemaVersion: 1, completed: {}, done: 0, failed: 0 }
  try {
    state = JSON.parse(await readFile(STATE_FILE, 'utf8'))
  } catch { /* fresh start */ }

  let queue = catalog.entries
  if (options.ids) {
    const wanted = new Set(options.ids)
    queue = queue.filter((entry) => wanted.has(entry.id))
  }
  queue = queue.filter((entry) => !state.completed[entry.id])
  queue = queue.slice(options.offset, options.offset + options.limit)
  console.log(`enrich-sites: queue=${queue.length} done=${state.done} failed=${state.failed} workers=${options.workers}`)

  if (queue.length === 0) {
    console.log('nothing to do')
    return
  }

  const chromePath = process.env.CHROME_PATH
  const useChrome = chromePath || CHROME_CANDIDATES.find((path) => existsSync(path))
  if (!useChrome) throw new Error('Chrome/Edge not found')
  const pool = new ChromePool(useChrome, 9333, options.workers)
  await pool.start()

  let cursor = 0
  const log = async (line) => {
    await writeFile(LOG_FILE, `${line}\n`, { flag: 'a' }).catch(() => {})
  }

  const worker = async (workerIndex) => {
    while (cursor < queue.length) {
      const index = cursor
      cursor += 1
      const entry = queue[index]
      const started = Date.now()
      const result = await processEntry(entry, pool, state, workerIndex).catch(async (error) => {
        const failed = {
          id: entry.id,
          name: entry.name,
          canonicalUrl: entry.canonicalUrl,
          fetchedAt: new Date().toISOString(),
          status: 'error',
          error: `${error.message}`.slice(0, 200),
          shots: [],
        }
        await writeFile(resolve(SITES_DIR, `${entry.id}.json`), `${JSON.stringify(failed, null, 2)}\n`)
        state.completed[entry.id] = 'error'
        state.done = Object.keys(state.completed).length
        return failed
      })
      const elapsed = ((Date.now() - started) / 1000).toFixed(1)
      await log(`[${result.status}] ${entry.id} ${entry.canonicalUrl} ${elapsed}s shots=${result.shots?.filter((s) => s.src).length ?? 0}`)
      if ((index + 1) % 25 === 0 || index === queue.length - 1) {
        state.done = Object.keys(state.completed).length
        await writeFile(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`)
        console.log(`progress: ${state.done} done (${state.failed} failed) — ${elapsed}s last, ${queue.length - index - 1} left`)
      }
      await sleep(400)
    }
  }

  const workers = Array.from({ length: options.workers }, (_, workerIndex) => worker(workerIndex))
  await Promise.all(workers)
  await writeFile(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`)
  await pool.stop()
  console.log(`enrich-sites complete: done=${state.done} failed=${state.failed}`)
}

main().catch((error) => {
  console.error('FATAL', error)
  process.exit(1)
})
