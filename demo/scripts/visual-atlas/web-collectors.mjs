/* Atlas web-source collectors：从可达的、许可清晰的组件库官网采集一手组件记录。
 * GitHub 在此网络不可达，因此这些源以"官网页面 + 内容指纹 revision"形式取证，
 * 不使用 GitHub API；license 均取官方仓库/官网声明的开放许可。
 */
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'

import {
  FIGMA_PLUGIN_VOCABULARIES,
  parseFigmaPluginVocabulary,
  parseGoogleFontsAxisTextproto,
} from './source-parsers.mjs'

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'

export const WEB_SOURCE_MANIFEST = {
  'react-aria': {
    name: 'React Aria Interactions',
    url: 'https://react-spectrum.adobe.com/react-aria',
    repository: 'adobe/react-spectrum',
    branch: 'main',
    license: 'Apache-2.0',
    licenseUrl: 'https://github.com/adobe/react-spectrum/blob/main/LICENSE',
    verifiedCount: 37,
    sourceCategory: 'interaction-behavior',
    bindings: ['web/react'],
  },
  'use-gesture': {
    name: '@use-gesture',
    url: 'https://use-gesture.netlify.app/docs',
    repository: 'pmndrs/use-gesture',
    branch: 'main',
    license: 'MIT',
    licenseUrl: 'https://github.com/pmndrs/use-gesture/blob/main/LICENSE',
    verifiedCount: 36,
    sourceCategory: 'gesture',
    bindings: ['web'],
  },
  'mdn-css': {
    name: 'MDN CSS Reference',
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference',
    repository: 'mdn/content',
    branch: 'main',
    license: 'CC-BY-SA-2.5',
    licenseUrl: 'https://github.com/mdn/content/blob/main/LICENSE.md',
    verifiedCount: 751,
    sourceCategory: 'css-reference',
    bindings: ['web'],
  },
  'figma-plugin-vocabularies': {
    name: 'Figma Plugin API Type Vocabularies',
    url: 'https://developers.figma.com/docs/plugins/api/api-reference/',
    repository: 'figma/plugin-typings',
    branch: 'master',
    license: 'MIT',
    licenseUrl: 'https://github.com/figma/plugin-typings/blob/master/LICENSE',
    verifiedCount: 84,
    sourceCategory: 'figma-plugin-vocabulary',
    bindings: ['design/figma-plugin'],
  },
  'google-fonts-axis-registry': {
    name: 'Google Fonts Axis Registry',
    url: 'https://fonts.google.com/variablefonts#axis-definitions',
    repository: 'googlefonts/axisregistry',
    branch: 'main',
    license: 'Apache-2.0',
    licenseUrl: 'https://github.com/googlefonts/axisregistry/blob/main/LICENSE.txt',
    verifiedCount: 57,
    sourceCategory: 'variable-font-axis',
    bindings: ['font/opentype', 'web/css'],
  },
  'web-awesome': {
    name: 'Web Awesome (Shoelace)',
    url: 'https://webawesome.com/docs/components',
    repository: 'shoelace-style/webawesome',
    branch: 'next',
    license: 'MIT',
    licenseUrl: 'https://github.com/shoelace-style/webawesome/blob/next/LICENSE.md',
    verifiedCount: 89,
    sourceCategory: 'web-component',
    bindings: ['web'],
  },
  vuetify: {
    name: 'Vuetify',
    url: 'https://vuetifyjs.com/en/components/all/',
    repository: 'vuetifyjs/vuetify',
    branch: 'master',
    license: 'MIT',
    licenseUrl: 'https://github.com/vuetifyjs/vuetify/blob/master/LICENSE.md',
    verifiedCount: 105,
    sourceCategory: 'vue-component',
    bindings: ['web/vue'],
  },
  quasar: {
    name: 'Quasar',
    url: 'https://quasar.dev/vue-components',
    repository: 'quasarframework/quasar',
    branch: 'dev',
    license: 'MIT',
    licenseUrl: 'https://github.com/quasarframework/quasar/blob/dev/LICENSE',
    verifiedCount: 72,
    sourceCategory: 'vue-component',
    bindings: ['web/vue'],
  },
  'ark-ui': {
    name: 'Ark UI',
    url: 'https://ark-ui.com/docs/components',
    repository: 'chakra-ui/ark',
    branch: 'main',
    license: 'MIT',
    licenseUrl: 'https://github.com/chakra-ui/ark/blob/main/LICENSE',
    verifiedCount: 66,
    sourceCategory: 'headless-component',
    bindings: ['web/react', 'web/vue', 'web/solid'],
  },
  polaris: {
    name: 'Shopify Polaris',
    url: 'https://polaris.shopify.com/components',
    repository: 'Shopify/polaris',
    branch: 'main',
    license: 'MIT',
    licenseUrl: 'https://github.com/Shopify/polaris/blob/main/LICENSE.md',
    verifiedCount: 52,
    sourceCategory: 'react-component',
    bindings: ['web/react'],
  },
  mantine: {
    name: 'Mantine',
    url: 'https://mantine.dev',
    repository: 'mantinedev/mantine',
    branch: 'master',
    license: 'MIT',
    licenseUrl: 'https://github.com/mantinedev/mantine/blob/master/LICENSE',
    verifiedCount: 242,
    sourceCategory: 'react-component',
    bindings: ['web/react'],
  },
  'radix-ui': {
    name: 'Radix UI Primitives',
    url: 'https://www.radix-ui.com/primitives',
    repository: 'radix-ui/primitives',
    license: 'MIT',
    licenseUrl: 'https://github.com/radix-ui/primitives/blob/main/LICENSE',
    verifiedCount: 30,
    sourceCategory: 'react-primitive',
    bindings: ['web/react'],
  },
  mui: {
    name: 'Material UI (MUI)',
    url: 'https://mui.com/material-ui/all-components/',
    repository: 'mui/material-ui',
    license: 'MIT',
    licenseUrl: 'https://github.com/mui/material-ui/blob/master/LICENSE',
    verifiedCount: 53,
    sourceCategory: 'react-component',
    bindings: ['web/react'],
  },
  'ant-design': {
    name: 'Ant Design',
    url: 'https://ant.design/components/',
    repository: 'ant-design/ant-design',
    license: 'MIT',
    licenseUrl: 'https://github.com/ant-design/ant-design/blob/master/LICENSE',
    verifiedCount: 70,
    sourceCategory: 'react-component',
    bindings: ['web/react'],
  },
  bootstrap: {
    name: 'Bootstrap',
    url: 'https://getbootstrap.com/docs/5.3/components/',
    repository: 'twbs/bootstrap',
    license: 'MIT',
    licenseUrl: 'https://github.com/twbs/bootstrap/blob/main/LICENSE',
    verifiedCount: 24,
    sourceCategory: 'css-component',
    bindings: ['web'],
  },
  bulma: {
    name: 'Bulma',
    url: 'https://bulma.io/documentation/',
    repository: 'jgthms/bulma',
    license: 'MIT',
    licenseUrl: 'https://github.com/jgthms/bulma/blob/master/LICENSE',
    verifiedCount: 35,
    sourceCategory: 'css-component',
    bindings: ['web'],
  },
  'chakra-ui': {
    name: 'Chakra UI',
    url: 'https://chakra-ui.com/docs/components',
    repository: 'chakra-ui/chakra-ui',
    license: 'MIT',
    licenseUrl: 'https://github.com/chakra-ui/chakra-ui/blob/main/LICENSE',
    verifiedCount: 100,
    sourceCategory: 'react-component',
    bindings: ['web/react'],
  },
  primer: {
    name: 'Primer (GitHub Design System)',
    url: 'https://primer.style/product/components',
    repository: 'primer/react',
    license: 'MIT',
    licenseUrl: 'https://github.com/primer/react/blob/main/LICENSE',
    verifiedCount: 62,
    sourceCategory: 'react-component',
    bindings: ['web/react'],
  },
  'headless-ui': {
    name: 'Headless UI',
    url: 'https://headlessui.com/react/overview',
    repository: 'tailwindlabs/headlessui',
    license: 'MIT',
    licenseUrl: 'https://github.com/tailwindlabs/headlessui/blob/main/LICENSE',
    verifiedCount: 16,
    sourceCategory: 'react-primitive',
    bindings: ['web/react'],
  },
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': UA },
    redirect: 'follow',
    signal: AbortSignal.timeout(20_000),
  })
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`)
  return response.text()
}

function clean(value) {
  return String(value ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

export function extractSlugs(html, pattern) {
  return [...new Set([...html.matchAll(pattern)].map((match) => match[1]))].sort()
}

function contentRevision(...parts) {
  return createHash('sha256').update(parts.join('\u0000')).digest('hex').slice(0, 40)
}

/** 归一化来源文本：解码 HTML 实体、统一弯引号，保证缓存键一致 */
export function normalizeSourceText(value) {
  return String(value ?? '')
    .replace(/&#0*39;|&#x27;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&nbsp;/gi, ' ')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .trim()
}

const JUNK_PATTERNS = [/^@layer/i, /^\.css-/, /^\.chakra/, /^:root/, /\{[\s\S]*\}/]

function isJunkParagraph(text) {
  if (text.length < 40) return true
  if (JUNK_PATTERNS.some((pattern) => pattern.test(text))) return true
  const braces = (text.match(/[{}]/g) ?? []).length
  if (braces > 2) return true
  return false
}

/** 取 <main> 内（或 h1 之后）第一个像样的段落；返回 {paragraph, afterH1} */
export function firstGoodParagraph(html, { afterH1 = false } = {}) {
  let scope = html
  if (!afterH1) {
    const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/is)?.[1]
    if (main) scope = main
  }
  const h1Match = scope.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  if (afterH1 && h1Match) {
    scope = scope.slice(h1Match.index + h1Match[0].length)
  } else if (h1Match) {
    // keep paragraphs after h1 when main is absent
    scope = scope.slice(h1Match.index + h1Match[0].length)
  }
  const paragraphs = [...scope.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => clean(match[1]))
    .filter((text) => !isJunkParagraph(text))
  return paragraphs[0] ?? ''
}

function firstMetaDescription(html) {
  const match = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
  return match ? clean(match[1]) : ''
}

function titleFromSlug(value) {
  return String(value)
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toLocaleUpperCase('en-US') + word.slice(1))
    .join(' ')
}

async function mapConcurrent(values, limit, mapper) {
  const results = new Array(values.length)
  let cursor = 0
  const workers = Array.from({ length: Math.min(limit, values.length) }, async () => {
    while (cursor < values.length) {
      const index = cursor
      cursor += 1
      results[index] = await mapper(values[index], index)
    }
  })
  await Promise.all(workers)
  return results
}

function envelope(sourceId, manifest, revision, records) {
  if (records.length !== manifest.verifiedCount) {
    throw new Error(`${sourceId} count drift: expected ${manifest.verifiedCount}, received ${records.length}`)
  }
  const ids = new Set()
  for (const record of records) {
    record.termEn = normalizeSourceText(record.termEn)
    record.sourceDefinition = normalizeSourceText(record.sourceDefinition)
    if (!record.sourceRecordId || !record.termEn || !record.sourceDefinition) {
      throw new Error(`${sourceId} emitted an incomplete raw record`)
    }
    if (ids.has(record.sourceRecordId)) {
      throw new Error(`${sourceId} emitted duplicate id ${record.sourceRecordId}`)
    }
    ids.add(record.sourceRecordId)
  }
  return {
    schemaVersion: 1,
    source: {
      id: sourceId,
      name: manifest.name,
      url: manifest.url,
      repository: manifest.repository ? `https://github.com/${manifest.repository}` : manifest.url,
      license: manifest.license,
      licenseUrl: manifest.licenseUrl,
      retrievedAt: new Date().toISOString().slice(0, 10),
      revision,
      verifiedCount: manifest.verifiedCount,
      countedAtlas: true,
      retrieval: 'live-site',
    },
    records,
  }
}

/* ---------- Radix UI Primitives (30) ---------- */
export async function collectRadix() {
  const sourceId = 'radix-ui'
  const manifest = WEB_SOURCE_MANIFEST[sourceId]
  const sidebar = await fetchText('https://www.radix-ui.com/primitives/docs/components/accordion')
  const slugs = extractSlugs(sidebar, /href="(\/primitives\/docs\/components\/[a-z0-9-]+)"/g)
  const records = await mapConcurrent(slugs, 8, async (path) => {
    const url = `https://www.radix-ui.com${path}`
    const html = await fetchText(url)
    const title = clean(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]) || titleFromSlug(path.split('/').at(-1))
    const description = firstGoodParagraph(html, { afterH1: true }) || firstMetaDescription(html)
    return {
      sourceRecordId: path.split('/').at(-1),
      termEn: title,
      sourceDefinition: description || `${title} is a Radix UI primitive.`,
      sourceCategory: manifest.sourceCategory,
      sourceUrl: url,
      sourcePath: path,
      sourceMetadata: { framework: 'react', summaryQuality: description ? 'source-prose' : 'taxonomy-summary' },
    }
  })
  return envelope(sourceId, manifest, contentRevision(sidebar, ...records.map((r) => r.sourceDefinition)), records)
}

/* ---------- MUI (70) ---------- */
const MUI_EXCLUDED = new Set([
  'react-css-baseline',
  'react-no-ssr',
  'react-portal',
  'react-popper',
  'react-click-away-listener',
  'react-init-color-scheme-script',
  'react-unstable-trap-focus',
  'react-unstable-masonry',
])

export async function collectMui() {
  const sourceId = 'mui'
  const manifest = WEB_SOURCE_MANIFEST[sourceId]
  const listing = await fetchText('https://mui.com/material-ui/all-components/')
  const slugs = extractSlugs(listing, /href="(\/material-ui\/react-[a-z0-9-]+)\/"/g)
    .map((path) => path.replace(/\/$/, '').split('/').at(-1))
    .filter((slug) => !MUI_EXCLUDED.has(slug))
  const records = await mapConcurrent(slugs, 8, async (slug) => {
    const url = `https://mui.com/material-ui/${slug}/`
    const html = await fetchText(url)
    const title = clean(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]) || titleFromSlug(slug)
    let description = firstGoodParagraph(html)
    description = description.replace(/^\+\s*/, '').trim()
    if (!description) description = firstMetaDescription(html)
    return {
      sourceRecordId: slug,
      termEn: title,
      sourceDefinition: description || `${title} is a Material UI component.`,
      sourceCategory: manifest.sourceCategory,
      sourceUrl: url,
      sourcePath: `/material-ui/${slug}/`,
      sourceMetadata: { framework: 'react', summaryQuality: description ? 'source-prose' : 'taxonomy-summary' },
    }
  })
  return envelope(sourceId, manifest, contentRevision(listing, ...records.map((r) => r.sourceDefinition)), records)
}

/* ---------- Ant Design (70, CDP render, EN pages) ---------- */
async function withChrome(fn) {
  const port = 9341
  const profile = `${process.env.TEMP ?? '.'}/vlx-chrome-antd-${process.pid}`
  const proc = spawn(CHROME, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--hide-scrollbars',
    '--disable-background-networking',
    '--disable-features=OptimizationHints,MediaRouter',
    'about:blank',
  ], { stdio: 'ignore' })
  let ws
  try {
    const getJson = async (path, method = 'GET') => {
      const r = await fetch(`http://127.0.0.1:${port}${path}`, { method })
      if (!r.ok) throw new Error(`${r.status} ${path}`)
      return r.json()
    }
    for (let attempt = 0; attempt < 40; attempt += 1) {
      try { await getJson('/json/version'); break } catch { await new Promise((r) => setTimeout(r, 250)) }
    }
    const created = await getJson('/json/new?about:blank', 'PUT')
    ws = new WebSocket(created.webSocketDebuggerUrl)
    let id = 0
    const pending = new Map()
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      if (message.id && pending.has(message.id)) {
        const entry = pending.get(message.id)
        pending.delete(message.id)
        if (message.error) entry.reject(new Error(message.error.message))
        else entry.resolve(message.result)
      }
    }
    await new Promise((resolvePromise, reject) => {
      ws.onopen = resolvePromise
      ws.onerror = reject
    })
    const send = (method, params = {}) =>
      new Promise((resolvePromise, reject) => {
        const messageId = ++id
        pending.set(messageId, { resolve: resolvePromise, reject })
        ws.send(JSON.stringify({ id: messageId, method, params }))
      })
    await send('Page.enable')
    await send('Runtime.enable')
    await send('Network.enable')
    await send('Network.setExtraHTTPHeaders', { headers: { 'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.6' } })
    await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false })
    return await fn({ send, sleep: (ms) => new Promise((r) => setTimeout(r, ms)) })
  } finally {
    try { ws?.close() } catch { /* ignore */ }
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(proc.pid), '/T', '/F'], { stdio: 'ignore' })
    } else {
      proc.kill('SIGKILL')
    }
  }
}

export async function collectAntd() {
  const sourceId = 'ant-design'
  const manifest = WEB_SOURCE_MANIFEST[sourceId]
  const EXCLUDED = new Set(['config-provider', '_util', 'app', 'changelog', 'overview'])
  const rendered = await withChrome(async ({ send, sleep }) => {
    await send('Page.navigate', { url: 'https://ant.design/components/overview/?locale=zh-CN' })
    await sleep(12000)
    const { result } = await send('Runtime.evaluate', {
      expression: `Array.from(document.querySelectorAll('a[href]')).map(a => a.getAttribute('href')).filter(h => /^\\/components\\/[a-z0-9-]+$/.test(h || ''))`,
      returnByValue: true,
    })
    const slugs = [...new Set(result.value)]
      .map((href) => href.replace(/^\/components\//, ''))
      .filter((slug) => slug && !EXCLUDED.has(slug))
      .sort()
    const pages = []
    for (const slug of slugs) {
      try {
        await send('Page.navigate', { url: `https://ant.design/components/${slug}/?locale=zh-CN` })
        await sleep(6000)
        const evaluate = await send('Runtime.evaluate', {
          expression: `({
            title: document.title || '',
            h1: (document.querySelector('article h1') || document.querySelector('h1') || {}).textContent || '',
            desc: (() => {
              const article = document.querySelector('article') || document.querySelector('main') || document.body;
              const ps = Array.from(article.querySelectorAll('p')).map(p => p.textContent.trim()).filter(t => t.length > 20);
              return ps[0] || '';
            })()
          })`,
          returnByValue: true,
        })
        pages.push({ slug, ...evaluate.result.value })
      } catch (error) {
        pages.push({ slug, error: error.message })
      }
    }
    return { slugs, pages }
  })

  const records = rendered.slugs
    .map((slug) => {
      const page = rendered.pages.find((item) => item.slug === slug)
      if (!page || page.error) {
        return {
          sourceRecordId: slug,
          termEn: titleFromSlug(slug),
          sourceDefinition: `${titleFromSlug(slug)} is an Ant Design component.`,
          sourceCategory: manifest.sourceCategory,
          sourceUrl: `https://ant.design/components/${slug}/`,
          sourcePath: `/components/${slug}/`,
          sourceMetadata: { framework: 'react', summaryQuality: 'taxonomy-summary', renderError: page?.error },
        }
      }
      const h1 = (page.h1 || page.title).trim().split('\n')[0].trim()
      // antd 中文文档标题形如 "Button 按钮"：取中文名为原生翻译，英文名为术语
      const zhRun = h1.match(/([\u3400-\u9fff][\u3400-\u9fff·（）()、\s]*)$/)
      const nativeZh = zhRun ? { termZh: zhRun[1].trim() } : null
      const termEn = (nativeZh ? h1.slice(0, h1.length - zhRun[1].length).trim() : h1) || titleFromSlug(slug)
      const desc = page.desc || `${termEn} 是 Ant Design 的组件。`
      return {
        sourceRecordId: slug,
        termEn: termEn || titleFromSlug(slug),
        sourceDefinition: desc,
        sourceCategory: manifest.sourceCategory,
        sourceUrl: `https://ant.design/components/${slug}/`,
        sourcePath: `/components/${slug}/`,
        sourceMetadata: {
          framework: 'react',
          summaryQuality: page.desc ? 'native-zh' : 'taxonomy-summary',
          ...(nativeZh ? { nativeZh: { termZh: nativeZh.termZh, definitionZh: desc } } : {}),
        },
      }
    })
    .sort((a, b) => a.sourceRecordId.localeCompare(b.sourceRecordId))
  return envelope(
    sourceId,
    manifest,
    contentRevision(rendered.slugs.join(' '), ...records.map((r) => r.sourceDefinition)),
    records,
  )
}

/* ---------- Bootstrap (24) ---------- */
export async function collectBootstrap() {
  const sourceId = 'bootstrap'
  const manifest = WEB_SOURCE_MANIFEST[sourceId]
  const seed = await fetchText('https://getbootstrap.com/docs/5.3/components/accordion')
  const slugs = extractSlugs(seed, /href="(\/docs\/5\.3\/components\/[a-z0-9-]+)"/g)
    .map((path) => path.split('/').at(-1))
  const records = await mapConcurrent(slugs, 8, async (slug) => {
    const url = `https://getbootstrap.com/docs/5.3/components/${slug}/`
    const html = await fetchText(url)
    const title = clean(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]) || titleFromSlug(slug)
    const description = firstGoodParagraph(html) || firstMetaDescription(html)
    return {
      sourceRecordId: slug,
      termEn: title,
      sourceDefinition: description || `${title} is a Bootstrap component.`,
      sourceCategory: manifest.sourceCategory,
      sourceUrl: url,
      sourcePath: `/docs/5.3/components/${slug}/`,
      sourceMetadata: { framework: 'css', summaryQuality: description ? 'source-prose' : 'taxonomy-summary' },
    }
  })
  return envelope(sourceId, manifest, contentRevision(seed, ...records.map((r) => r.sourceDefinition)), records)
}

/* ---------- Bulma (46) ---------- */
export async function collectBulma() {
  const sourceId = 'bulma'
  const manifest = WEB_SOURCE_MANIFEST[sourceId]
  const index = await fetchText('https://bulma.io/documentation/')
  const pages = extractSlugs(index, /href="(https:\/\/bulma\.io\/documentation\/(?:components|elements|form|layout)\/[a-z-]+\/)"/g)
    .map((url) => new URL(url))
  const records = await mapConcurrent(pages, 8, async (url) => {
    const group = url.pathname.split('/')[2]
    const slug = url.pathname.split('/')[3]
    const html = await fetchText(url.href)
    const title = clean(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]) || titleFromSlug(slug)
    const description = firstGoodParagraph(html) || firstMetaDescription(html)
    return {
      sourceRecordId: `${group}:${slug}`,
      termEn: title,
      sourceDefinition: description || `${title} is a Bulma ${group} component.`,
      sourceCategory: `bulma-${group}`,
      sourceUrl: url.href,
      sourcePath: url.pathname,
      sourceMetadata: { framework: 'css', group, summaryQuality: description ? 'source-prose' : 'taxonomy-summary' },
    }
  })
  return envelope(sourceId, manifest, contentRevision(index, ...records.map((r) => r.sourceDefinition)), records)
}

/* ---------- Chakra UI (100) ---------- */
const CHAKRA_EXCLUDED = new Set([
  'theme', 'for', 'presence', 'environment-provider', 'client-only', 'portal',
  'radiomark', 'show', 'skip-nav', 'visually-hidden', 'format-number', 'format-byte',
  'checkmark', 'locale-provider',
])

export async function collectChakra() {
  const sourceId = 'chakra-ui'
  const manifest = WEB_SOURCE_MANIFEST[sourceId]
  const overview = await fetchText('https://chakra-ui.com/docs/components/concepts/overview')
  const slugs = extractSlugs(overview, /href="(\/docs\/components\/[a-z0-9-]+)"/g)
    .map((path) => path.split('/').at(-1))
    .filter((slug) => !slug.startsWith('concepts') && !CHAKRA_EXCLUDED.has(slug))
  const records = await mapConcurrent(slugs, 8, async (slug) => {
    const url = `https://chakra-ui.com/docs/components/${slug}`
    const html = await fetchText(url)
    const title = clean(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]) || titleFromSlug(slug)
    let description = firstGoodParagraph(html) || firstMetaDescription(html)
    if (isJunkParagraph(description)) description = firstMetaDescription(html)
    return {
      sourceRecordId: slug,
      termEn: title,
      sourceDefinition: description || `${title} is a Chakra UI component.`,
      sourceCategory: manifest.sourceCategory,
      sourceUrl: url,
      sourcePath: `/docs/components/${slug}`,
      sourceMetadata: { framework: 'react', summaryQuality: description ? 'source-prose' : 'taxonomy-summary' },
    }
  })
  return envelope(sourceId, manifest, contentRevision(overview, ...records.map((r) => r.sourceDefinition)), records)
}

/* ---------- Primer (95) ---------- */
export async function collectPrimer() {
  const sourceId = 'primer'
  const manifest = WEB_SOURCE_MANIFEST[sourceId]
  const listing = await fetchText('https://primer.style/product/components/')
  const slugs = extractSlugs(listing, /href="(\/product\/components\/[a-z0-9-]+)\/"/g)
    .map((path) => path.replace(/\/$/, '').split('/').at(-1))
  const EXCLUDED = new Set(['overview', 'getting-started'])
  const unique = [...new Set(slugs)].filter((slug) => !EXCLUDED.has(slug))
  const records = await mapConcurrent(unique, 8, async (slug) => {
    const url = `https://primer.style/product/components/${slug}`
    const html = await fetchText(url)
    const title = clean(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]) || titleFromSlug(slug)
    const description = firstGoodParagraph(html) || firstMetaDescription(html)
    return {
      sourceRecordId: slug,
      termEn: title,
      sourceDefinition: description || `${title} is a Primer (GitHub) component.`,
      sourceCategory: manifest.sourceCategory,
      sourceUrl: url,
      sourcePath: `/product/components/${slug}`,
      sourceMetadata: { framework: 'react', summaryQuality: description ? 'source-prose' : 'taxonomy-summary' },
    }
  })
  return envelope(sourceId, manifest, contentRevision(listing, ...records.map((r) => r.sourceDefinition)), records)
}

/* ---------- Headless UI (16) ---------- */
export async function collectHeadlessUi() {
  const sourceId = 'headless-ui'
  const manifest = WEB_SOURCE_MANIFEST[sourceId]
  const home = await fetchText('https://headlessui.com/')
  const slugs = extractSlugs(home, /href="(\/react\/[a-z0-9-]+)"/g).map((path) => path.split('/').at(-1))
  const records = await mapConcurrent(slugs, 8, async (slug) => {
    const url = `https://headlessui.com/react/${slug}`
    const html = await fetchText(url)
    const title = clean(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]) || titleFromSlug(slug)
    const description = firstGoodParagraph(html) || firstMetaDescription(html)
    return {
      sourceRecordId: slug,
      termEn: title,
      sourceDefinition: description || `${title} is a Headless UI component.`,
      sourceCategory: manifest.sourceCategory,
      sourceUrl: url,
      sourcePath: `/react/${slug}`,
      sourceMetadata: { framework: 'react', summaryQuality: description ? 'source-prose' : 'taxonomy-summary' },
    }
  })
  return envelope(sourceId, manifest, contentRevision(home, ...records.map((r) => r.sourceDefinition)), records)
}

/* ---- 行为层来源 ----
 * 组件库的清单只回答"界面上有哪些块"，回答不了"手指和指针在做什么"。
 * 拖拽、长按、指针捕获、橡皮筋回弹这类词只存在于交互库的文档里，
 * 而那正是颗粒度最细的一层。以下两个源专门补这一层。
 * GitHub 在当前网络可达，因此 revision 直接取 commit SHA，比内容指纹更硬。
 */

async function githubRevision(repository, branch) {
  const commit = JSON.parse(await fetchText(`https://api.github.com/repos/${repository}/commits/${branch}`))
  if (!/^[a-f0-9]{40}$/.test(commit.sha)) throw new Error(`${repository} returned an unusable revision`)
  return commit.sha
}

async function githubTreePaths(repository, revision) {
  const tree = JSON.parse(
    await fetchText(`https://api.github.com/repos/${repository}/git/trees/${revision}?recursive=1`),
  )
  if (tree.truncated) throw new Error(`${repository} returned a truncated Git tree`)
  return tree.tree.filter(({ type }) => type === 'blob').map(({ path }) => path)
}

/* React Aria 的文档把每个交互钩子的 section 与 description 写成了静态导出，
 * 所以可以确定性地取。只收 Interactions 与 Utilities 两个 section：
 * 它们是被命名的行为，Guides 是文章不是术语。 */
const REACT_ARIA_SECTIONS = new Set(['Interactions', 'Utilities'])
const RA_SECTION = /export const section = '([^']+)'/
const RA_DESCRIPTION = /export const description = '((?:[^'\\]|\\.)*)'/
const RA_TITLE = /^# (.+)$/m

async function collectReactAria() {
  const sourceId = 'react-aria'
  const manifest = WEB_SOURCE_MANIFEST[sourceId]
  const revision = await githubRevision(manifest.repository, manifest.branch)
  const paths = await githubTreePaths(manifest.repository, revision)
  const dir = 'packages/dev/s2-docs/pages/react-aria/'
  const files = paths
    .filter((path) => path.startsWith(dir) && path.endsWith('.mdx') && !path.slice(dir.length).includes('/'))
    .sort()

  const parsed = await mapConcurrent(files, 8, async (path) => {
    const text = await fetchText(`https://raw.githubusercontent.com/${manifest.repository}/${revision}/${path}`)
    const section = RA_SECTION.exec(text)?.[1]
    const description = RA_DESCRIPTION.exec(text)?.[1]
    const title = RA_TITLE.exec(text)?.[1]
    if (!section || !description || !title) return null
    if (!REACT_ARIA_SECTIONS.has(section)) return null
    const slug = path.slice(dir.length, -'.mdx'.length)
    return {
      sourceRecordId: slug,
      termEn: clean(title),
      sourceDefinition: clean(description.replace(/\\'/g, "'")),
      sourceCategory: section === 'Interactions' ? 'interaction-behavior' : 'interaction-utility',
      sourceUrl: `${manifest.url}/${slug}`,
      sourcePath: path,
      sourceMetadata: { section, framework: 'react' },
    }
  })

  return envelope(sourceId, manifest, revision, parsed.filter(Boolean))
}

/* use-gesture 的配置项文档是 "### 选项名 + 一段解释" 的规整结构。
 * 这些选项名（rubberband、filterTaps、pointer.capture、swipe.velocity…）
 * 就是手势这一族里最细的一层，任何组件库清单都不会收。 */
function parseGestureDoc(markdown, { level, skip = new Set() }) {
  const marker = '#'.repeat(level)
  const pattern = new RegExp(`^${marker} (.+)$`, 'gm')
  const headings = [...markdown.matchAll(pattern)]
  const out = []
  for (let index = 0; index < headings.length; index += 1) {
    const name = headings[index][1].trim()
    if (skip.has(name)) continue
    const start = headings[index].index + headings[index][0].length
    const end = index + 1 < headings.length ? headings[index + 1].index : markdown.length
    const body = markdown.slice(start, end)
    const paragraph = body
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .find((block) =>
        block
        && !block.startsWith('#')
        && !block.startsWith('```')
        && !block.startsWith('<')
        && !block.startsWith('|')
        && !block.startsWith('import '))
    if (!paragraph) continue
    out.push({ name, definition: clean(paragraph.replace(/`/g, '')) })
  }
  return out
}

async function collectUseGesture() {
  const sourceId = 'use-gesture'
  const manifest = WEB_SOURCE_MANIFEST[sourceId]
  const revision = await githubRevision(manifest.repository, manifest.branch)
  const read = async (path) =>
    fetchText(`https://raw.githubusercontent.com/${manifest.repository}/${revision}/${path}`)

  const optionsPath = 'documentation/pages/docs/options.mdx'
  const gesturesPath = 'documentation/pages/docs/gestures.mdx'
  const [optionsDoc, gesturesDoc] = await Promise.all([read(optionsPath), read(gesturesPath)])

  const records = []
  const seen = new Set()
  const push = (name, definition, kind, sourcePath) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    if (!slug || seen.has(slug) || !definition) return
    seen.add(slug)
    records.push({
      sourceRecordId: slug,
      termEn: name,
      sourceDefinition: definition,
      sourceCategory: kind,
      sourceUrl: `${manifest.url}/${sourcePath.includes('options') ? 'options' : 'gestures'}`,
      sourcePath,
      sourceMetadata: { kind },
    })
  }

  /* 手势钩子取自文档里的表格，不取标题：标题里混着"React"、"Vanilla"
   * 这类章节名，它们不是术语。 */
  for (const [, hook, description] of gesturesDoc.matchAll(/^\|\s*`(use[A-Za-z]+)`\s*\|\s*([^|]+?)\s*\|/gm)) {
    push(hook, clean(description), 'gesture', gesturesPath)
  }

  /* 选项标题必须长得像标识符（axis、pointer.capture、swipe.velocity），
   * 这样"Shared options"这类分节标题自然被挡在外面。 */
  for (const { name, definition } of parseGestureDoc(optionsDoc, { level: 3 })) {
    const identifier = name.replace(/\s*\(.*\)\s*$/, '').trim()
    if (!/^[a-z][A-Za-z0-9]*(\.[A-Za-z0-9]+)*$/.test(identifier)) continue
    push(identifier, definition, 'gesture-option', optionsPath)
  }

  records.sort((left, right) => left.sourceRecordId.localeCompare(right.sourceRecordId))
  return envelope(sourceId, manifest, revision, records)
}

/* ---- 通用 frontmatter 采集器 ----
 * 下面几个源的文档都是 "YAML frontmatter + 正文" 的规整结构，差别只在字段名。
 * 与其一个源抄一遍取数逻辑，不如把差异收进配置，让新增一个同类源只是加一条配置。
 */

/* 极小的 frontmatter 解析：只认标量、一层嵌套、短横线列表。
 * 不引 YAML 依赖——这里要读的东西简单到不值得为它加一个依赖。 */
export function parseFrontmatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)
  if (!match) return null
  const data = {}
  let currentKey = null
  let currentIndent = 0
  for (const rawLine of match[1].split(/\r?\n/)) {
    if (!rawLine.trim() || rawLine.trim().startsWith('#')) continue
    const indent = rawLine.length - rawLine.trimStart().length
    const line = rawLine.trim()

    if (line.startsWith('- ')) {
      if (!currentKey) continue
      const value = unquote(line.slice(2))
      const holder = currentIndent > 0 ? data[currentKey] : data
      if (currentIndent > 0) {
        if (!Array.isArray(holder)) continue
        holder.push(value)
      } else {
        if (!Array.isArray(data[currentKey])) data[currentKey] = []
        data[currentKey].push(value)
      }
      continue
    }

    const pair = /^([\w-]+)\s*:\s*(.*)$/.exec(line)
    if (!pair) continue
    const [, key, rest] = pair
    if (indent === 0) {
      currentKey = key
      currentIndent = 0
      data[key] = rest === '' ? {} : unquote(rest)
      if (rest === '') data[key] = {}
    } else if (currentKey && typeof data[currentKey] === 'object' && !Array.isArray(data[currentKey])) {
      data[currentKey][key] = rest === '' ? [] : unquote(rest)
      if (rest === '') {
        currentIndent = indent
        currentKey = key
        data[key] = []
      }
    }
  }
  return data
}

function unquote(value) {
  const trimmed = String(value).trim()
  if (/^'(.*)'$/.test(trimmed)) return trimmed.slice(1, -1).replace(/''/g, "'")
  if (/^"(.*)"$/.test(trimmed)) return trimmed.slice(1, -1)
  return trimmed
}

function pick(data, path) {
  return path.split('.').reduce((value, key) => (value == null ? value : value[key]), data)
}

function makeFrontmatterCollector(sourceId, config) {
  return async function collect() {
    const manifest = WEB_SOURCE_MANIFEST[sourceId]
    const revision = await githubRevision(manifest.repository, manifest.branch)
    const paths = await githubTreePaths(manifest.repository, revision)
    const files = paths
      .filter((path) => config.dirs.some((dir) => path.startsWith(dir)))
      .filter((path) => /\.(mdx|md)$/.test(path))
      .filter((path) => !config.skip?.test(path))
      .sort()

    const parsed = await mapConcurrent(files, 8, async (path) => {
      const text = await fetchText(`https://raw.githubusercontent.com/${manifest.repository}/${revision}/${path}`)
      const data = parseFrontmatter(text)
      if (!data) return null
      const title = config.titleKeys.map((key) => pick(data, key)).find((value) => typeof value === 'string' && value.trim())
      let description = config.descriptionKeys
        .map((key) => pick(data, key))
        .find((value) => typeof value === 'string' && value.trim())
      /* 有的源（Web Awesome）frontmatter 里根本没有描述字段，
       * 只能退回正文第一段散文。跳过代码块、指令块和 JSX。 */
      if (!description && config.bodyFallback) {
        description = text
          .slice(text.indexOf('---', 3) + 3)
          .split(/\n{2,}/)
          .map((block) => block.trim())
          .find((block) =>
            block.length > 24
            && !block.startsWith('#')
            && !block.startsWith('```')
            && !block.startsWith(':::')
            && !block.startsWith('<')
            && !block.startsWith('|')
            && !block.startsWith('import '))
      }
      if (!title || !description) return null

      const aliasValue = config.aliasKeys?.map((key) => pick(data, key)).find(Array.isArray) ?? []
      const slug = path.replace(/\.(mdx|md)$/, '').split('/').pop()
      const category = config.categoryKey ? pick(data, config.categoryKey) : undefined
      return {
        sourceRecordId: config.idPrefix ? `${config.idPrefix(path)}-${slug}` : slug,
        termEn: clean(title),
        sourceDefinition: clean(description),
        sourceCategory: typeof category === 'string' && category ? category : manifest.sourceCategory,
        sourceUrl: config.url(slug, path),
        sourcePath: path,
        sourceMetadata: {
          ...(aliasValue.length > 0 ? { aliases: aliasValue.map((alias) => clean(alias)).filter(Boolean) } : {}),
          ...(category ? { docsCategory: category } : {}),
        },
      }
    })

    const records = []
    const seen = new Set()
    for (const record of parsed.filter(Boolean)) {
      if (seen.has(record.sourceRecordId)) continue
      seen.add(record.sourceRecordId)
      records.push(record)
    }
    return envelope(sourceId, manifest, revision, records)
  }
}

/* Mantine 不用 frontmatter，元数据集中在 TS 注册表里。
 * 82 个 hooks 是这一批里最有价值的部分——它们全是行为层词汇。 */
function parseMantineRegistry(source) {
  const out = []
  for (const block of source.matchAll(/\n {2}(\w+): \{([\s\S]*?)\n {2}\},/g)) {
    const [, key, body] = block
    if (/hideInSearch:\s*true/.test(body)) continue
    const title = /\n\s+title: '((?:[^'\\]|\\.)*)'/.exec(body)?.[1]
    const description = /\n\s+description: '((?:[^'\\]|\\.)*)'/.exec(body)?.[1]
    const slug = /\n\s+slug: '([^']*)'/.exec(body)?.[1]
    if (!title || !description || !slug) continue
    out.push({ key, title: title.replace(/\\'/g, "'"), description: description.replace(/\\'/g, "'"), slug })
  }
  return out
}

/* hooks 那一份不是对象字面量，而是 hDocs('useX', '描述') 的调用，单独认。 */
function parseMantineHooks(source) {
  const out = []
  for (const call of source.matchAll(/(\w+): hDocs\(\s*'([^']+)',\s*'((?:[^'\\]|\\.)*)'\s*,?\s*\)/g)) {
    const [, key, hook, description] = call
    const slug = hook.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
    out.push({ key, title: hook, description: description.replace(/\\'/g, "'"), slug: `/hooks/${slug}` })
  }
  return out
}

async function collectMantine() {
  const sourceId = 'mantine'
  const manifest = WEB_SOURCE_MANIFEST[sourceId]
  const revision = await githubRevision(manifest.repository, manifest.branch)
  const files = [
    ['apps/mantine.dev/src/mdx/data/mdx-core-data.ts', 'component', parseMantineRegistry],
    ['apps/mantine.dev/src/mdx/data/mdx-charts-data.ts', 'chart', parseMantineRegistry],
    ['apps/mantine.dev/src/mdx/data/mdx-dates-data.ts', 'date', parseMantineRegistry],
    ['apps/mantine.dev/src/mdx/data/mdx-others-data.ts', 'component', parseMantineRegistry],
    ['apps/mantine.dev/src/mdx/data/mdx-hooks-data.ts', 'hook', parseMantineHooks],
  ]
  const groups = await mapConcurrent(files, 3, async ([path, kind, parse]) => {
    const source = await fetchText(`https://raw.githubusercontent.com/${manifest.repository}/${revision}/${path}`)
    return parse(source).map((item) => ({
      sourceRecordId: `${kind}-${item.key}`,
      termEn: clean(item.title),
      sourceDefinition: clean(item.description),
      sourceCategory: kind === 'hook' ? 'react-hook' : 'react-component',
      sourceUrl: `https://mantine.dev${item.slug}`,
      sourcePath: path,
      sourceMetadata: { kind },
    }))
  })
  return envelope(sourceId, manifest, revision, groups.flat())
}

/* MDN 的 CSS 参考页是样式层颗粒度最细的一份清单：每个属性、每个伪类、
 * 每条 @规则 各自一页，页头带 page-type 标注，正文首段就是定义。
 * 收它是为了让图鉴不止有"组件叫什么"，还有"样式手段叫什么"。
 */
const MDN_CSS_DIRS = [
  ['properties', 'css-property'],
  ['selectors', 'css-selector'],
  ['at-rules', 'css-at-rule'],
]

/* 去掉 MDN 的宏与链接语法，留下人能读的散文。 */
function stripMdnMarkup(text) {
  return clean(
    text
      .replace(/\{\{\s*(?:cssxref|jsxref|domxref|htmlelement|glossary|HTTPHeader)\s*\(\s*"([^"]+)"[^)]*\)\s*\}\}/gi, '$1')
      .replace(/\{\{[^}]*\}\}/g, '')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/[`*_]/g, ''),
  )
}

function mdnFirstParagraph(markdown) {
  const body = markdown.replace(/^---[\s\S]*?\n---\n/, '')
  for (const block of body.split(/\n{2,}/)) {
    const trimmed = block.trim()
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('```') || trimmed.startsWith('>')) continue
    if (/^\{\{[^}]*\}\}$/.test(trimmed)) continue
    const prose = stripMdnMarkup(trimmed)
    if (prose.length >= 24) return prose
  }
  return ''
}

async function collectMdnCss() {
  const sourceId = 'mdn-css'
  const manifest = WEB_SOURCE_MANIFEST[sourceId]
  const revision = await githubRevision(manifest.repository, manifest.branch)
  const base = 'files/en-us/web/css/reference'

  const groups = await mapConcurrent(MDN_CSS_DIRS, 1, async ([dir, kind]) => {
    const listing = JSON.parse(await fetchText(
      `https://api.github.com/repos/${manifest.repository}/contents/${base}/${dir}?per_page=100&ref=${revision}`,
    ))
    const names = listing.filter((item) => item.type === 'dir').map((item) => item.name).sort()

    const parsed = await mapConcurrent(names, 8, async (name) => {
      const path = `${base}/${dir}/${name}/index.md`
      let text
      try {
        text = await fetchText(`https://raw.githubusercontent.com/${manifest.repository}/${revision}/${path}`)
      } catch {
        return null
      }
      const data = parseFrontmatter(text)
      if (!data) return null
      const pageType = String(data['page-type'] ?? '')
      if (!pageType.startsWith('css-')) return null
      if (pageType === 'css-module' || pageType === 'listing-page' || pageType === 'landing-page') return null

      const title = clean(String(data['short-title'] ?? data.title ?? '')).replace(/^`|`$/g, '')
      const definition = mdnFirstParagraph(text)
      if (!title || !definition) return null

      return {
        sourceRecordId: `${kind}-${name.toLowerCase()}`,
        termEn: title,
        sourceDefinition: definition,
        sourceCategory: pageType,
        sourceUrl: `https://developer.mozilla.org/en-US/docs/${String(data.slug ?? `Web/CSS/Reference/${dir}/${name}`)}`,
        sourcePath: path,
        sourceMetadata: {
          pageType,
          ...(data.status ? { status: data.status } : {}),
        },
      }
    })
    return parsed.filter(Boolean)
  })

  return envelope(sourceId, manifest, revision, groups.flat())
}

async function collectFigmaPluginVocabularies() {
  const sourceId = 'figma-plugin-vocabularies'
  const manifest = WEB_SOURCE_MANIFEST[sourceId]
  const revision = await githubRevision(manifest.repository, manifest.branch)
  const sourcePath = 'plugin-api.d.ts'
  const source = await fetchText(
    `https://raw.githubusercontent.com/${manifest.repository}/${revision}/${sourcePath}`,
  )
  const parsed = parseFigmaPluginVocabulary(source)
  const specs = new Map(FIGMA_PLUGIN_VOCABULARIES.map((spec) => [spec.namespace, spec]))
  const records = parsed.map((record) => {
    const spec = specs.get(record.sourceMetadata.namespace)
    if (!spec) throw new Error(`Unknown Figma vocabulary ${record.sourceMetadata.namespace}`)
    return {
      ...record,
      sourceUrl: `https://developers.figma.com/docs/plugins/api/${spec.doc}/`,
      sourcePath,
    }
  })

  for (const spec of FIGMA_PLUGIN_VOCABULARIES) {
    const actual = records.filter(
      ({ sourceMetadata }) => sourceMetadata.namespace === spec.namespace,
    ).length
    if (actual !== spec.expectedCount) {
      throw new Error(
        `${sourceId} namespace drift for ${spec.namespace}: expected ${spec.expectedCount}, received ${actual}`,
      )
    }
  }
  return envelope(sourceId, manifest, revision, records)
}

async function collectGoogleFontsAxisRegistry() {
  const sourceId = 'google-fonts-axis-registry'
  const manifest = WEB_SOURCE_MANIFEST[sourceId]
  const revision = await githubRevision(manifest.repository, manifest.branch)
  const tree = JSON.parse(
    await fetchText(
      `https://api.github.com/repos/${manifest.repository}/git/trees/${revision}?recursive=1`,
    ),
  )
  const paths = tree.tree
    .filter(
      (item) =>
        item.type === 'blob' &&
        /^Lib\/axisregistry\/data\/[^/]+\.textproto$/.test(item.path),
    )
    .map(({ path }) => path)
    .sort()
  if (paths.length !== manifest.verifiedCount) {
    throw new Error(
      `${sourceId} file count drift: expected ${manifest.verifiedCount}, received ${paths.length}`,
    )
  }

  const records = await mapConcurrent(paths, 8, async (sourcePath) => {
    const source = await fetchText(
      `https://raw.githubusercontent.com/${manifest.repository}/${revision}/${sourcePath}`,
    )
    const axis = parseGoogleFontsAxisTextproto(source)
    return {
      sourceRecordId: `axis-${axis.tag.toLocaleLowerCase('en-US')}`,
      termEn: `Variable font axis: ${axis.displayName}`,
      sourceDefinition: axis.description,
      sourceCategory: manifest.sourceCategory,
      sourceUrl: `https://github.com/${manifest.repository}/blob/${revision}/${sourcePath}`,
      sourcePath,
      sourceMetadata: {
        tag: axis.tag,
        minValue: axis.minValue,
        defaultValue: axis.defaultValue,
        maxValue: axis.maxValue,
        precision: axis.precision,
        fallbackOnly: axis.fallbackOnly,
        aliases: [axis.tag, axis.displayName],
        registryStatus: 'official-upstream',
      },
    }
  })
  return envelope(sourceId, manifest, revision, records)
}

export const WEB_COLLECTORS = {
  'mdn-css': collectMdnCss,
  'figma-plugin-vocabularies': collectFigmaPluginVocabularies,
  'google-fonts-axis-registry': collectGoogleFontsAxisRegistry,
  'react-aria': collectReactAria,
  'use-gesture': collectUseGesture,
  'web-awesome': makeFrontmatterCollector('web-awesome', {
    dirs: ['packages/webawesome/docs/docs/components/', 'packages/webawesome/docs/docs/utilities/'],
    titleKeys: ['title'],
    descriptionKeys: ['description', 'summary'],
    aliasKeys: ['synonyms', 'use-cases'],
    categoryKey: 'category',
    bodyFallback: true,
    url: (slug) => `https://webawesome.com/docs/components/${slug}`,
  }),
  vuetify: makeFrontmatterCollector('vuetify', {
    dirs: ['packages/docs/src/pages/en/components/'],
    titleKeys: ['meta.nav', 'meta.title'],
    descriptionKeys: ['meta.description'],
    url: (slug) => `https://vuetifyjs.com/en/components/${slug}/`,
  }),
  quasar: makeFrontmatterCollector('quasar', {
    dirs: ['docs/src/pages/vue-components/'],
    titleKeys: ['title'],
    descriptionKeys: ['desc'],
    url: (slug) => `https://quasar.dev/vue-components/${slug}`,
  }),
  'ark-ui': makeFrontmatterCollector('ark-ui', {
    dirs: ['website/src/content/pages/components/', 'website/src/content/pages/utilities/'],
    titleKeys: ['title'],
    descriptionKeys: ['description'],
    url: (slug, path) => `https://ark-ui.com/docs/${path.includes('/utilities/') ? 'utilities' : 'components'}/${slug}`,
  }),
  polaris: makeFrontmatterCollector('polaris', {
    dirs: ['polaris.shopify.com/content/components/'],
    skip: /\/index\.mdx$/,
    titleKeys: ['title'],
    descriptionKeys: ['shortDescription', 'description'],
    aliasKeys: ['keywords'],
    categoryKey: 'category',
    url: (slug) => `https://polaris.shopify.com/components/${slug}`,
  }),
  mantine: collectMantine,
  'radix-ui': collectRadix,
  mui: collectMui,
  'ant-design': collectAntd,
  bootstrap: collectBootstrap,
  bulma: collectBulma,
  'chakra-ui': collectChakra,
  primer: collectPrimer,
  'headless-ui': collectHeadlessUi,
}
