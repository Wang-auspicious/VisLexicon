/* 从 ecosyste.ms（GitHub 镜像 API，本网络可达）按 topic 采集设计/前端资源仓库。
 * 输出：data/sources/ecosystem-repos.raw.json
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const DEMO_ROOT = resolve(SCRIPT_DIR, '..')
const OUTPUT = resolve(DEMO_ROOT, 'data/sources/ecosystem-repos.raw.json')
const UA = 'VisLexicon catalog collector/1.0 (+public ecosyste.ms research)'
const MIN_STARS = Number(process.env.MIN_STARS ?? 40)
const MAX_PAGES = Number(process.env.MAX_PAGES ?? 8)
const PER_PAGE = 100

const TOPICS = [
  ['design-system', 'Design Systems & Style Guides', '设计系统与样式指南'],
  ['ui-components', 'UI Components & Kits', 'UI 组件与套件'],
  ['ui-kit', 'UI Components & Kits', 'UI 组件与套件'],
  ['component-library', 'UI Components & Kits', 'UI 组件与套件'],
  ['web-components', 'UI Components & Kits', 'Web Components 库'],
  ['react-components', 'React UI Libraries', 'React UI 库'],
  ['vue-components', 'Vue UI Libraries', 'Vue UI 库'],
  ['svelte-components', 'Svelte UI Libraries', 'Svelte UI 库'],
  ['tailwindcss', 'React UI Libraries', 'Tailwind 组件'],
  ['tailwind-components', 'React UI Libraries', 'Tailwind 组件'],
  ['shadcn-ui', 'React UI Libraries', 'Tailwind 组件'],
  ['icon-library', 'Icons', '图标库'],
  ['icon-font', 'Icon Fonts', '图标字体'],
  ['animation-library', 'Javascript Animation Libraries', 'JavaScript 动效库'],
  ['chart-library', 'Javascript Chart Libraries', 'JavaScript 图表库'],
  ['color-palette', 'Color Tools', '色彩工具'],
  ['design-tokens', 'Design Systems & Style Guides', '设计令牌与变量'],
  ['figma-plugin', 'Design Tools', 'Figma 插件'],
  ['css-framework', 'CSS Frameworks', 'CSS 框架'],
  ['font-library', 'Fonts', '字体与排版'],
  ['illustration-library', 'Illustrations', '插画'],
  ['landing-page-template', 'HTML & CSS Templates', '落地页模板'],
  ['admin-template', 'HTML & CSS Templates', '后台管理模板'],
  ['ui-animation', 'Javascript Animation Libraries', 'UI 动效'],
  ['pattern-library', 'UI Components & Kits', 'UI 组件与套件'],
  ['framer-motion', 'Javascript Animation Libraries', 'Framer Motion'],
  ['three-js', 'Javascript Animation Libraries', 'Three.js 与 3D'],
  ['ai-image-generator', 'AI 设计工具', 'AI 图像生成'],
  ['micro-interactions', 'Javascript Animation Libraries', '微交互'],
  ['design-tools', 'Design Tools', '综合设计工具'],
]

function cleanUrl(value) {
  if (!value) return null
  try {
    const url = new URL(value)
    url.hash = ''
    url.search = ''
    return url.href.replace(/\/$/, '')
  } catch {
    return null
  }
}

async function fetchPage(topic, page) {
  const url = `https://repos.ecosyste.ms/api/v1/hosts/GitHub/repositories?topic=${encodeURIComponent(topic)}&per_page=${PER_PAGE}&page=${page}`
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000) })
      if (response.status === 429) {
        await new Promise((r) => setTimeout(r, 4000 * attempt))
        continue
      }
      if (!response.ok) throw new Error(`${response.status} ${url}`)
      return response.json()
    } catch (error) {
      if (attempt === 3) throw error
      await new Promise((r) => setTimeout(r, 1500 * attempt))
    }
  }
  return []
}

const seen = new Map()
let rawTotal = 0

for (const [topic, categoryOriginal, subcategoryZh] of TOPICS) {
  let fetched = 0
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    let repos
    try {
      repos = await fetchPage(topic, page)
    } catch (error) {
      console.log(`topic "${topic}" page ${page} failed: ${error.message}`)
      break
    }
    if (!Array.isArray(repos) || repos.length === 0) break
    fetched += repos.length
    rawTotal += repos.length
    for (const repo of repos) {
      if (repo.archived || repo.fork) continue
      if ((repo.stargazers_count ?? 0) < MIN_STARS) continue
      const description = (repo.description || '').trim()
      if (description.length < 30) continue
      const homepage = cleanUrl(repo.homepage)
      const repoUrl = repo.full_name ? `https://github.com/${repo.full_name}` : null
      const siteUrl = homepage && !/github\.com/.test(homepage) ? homepage : repoUrl
      if (!siteUrl) continue
      const key = siteUrl
      const record = {
        name: repo.full_name.split('/').at(-1),
        originalUrl: siteUrl,
        originalDescription: description,
        pricing: 'Free',
        categoryOriginal,
        subcategoryZh,
        repository: repoUrl,
        homepage,
        stars: repo.stargazers_count ?? 0,
        language: repo.language || null,
        topics: repo.topics ?? [],
      }
      const existing = seen.get(key)
      if (existing) {
        existing.stars = Math.max(existing.stars, record.stars)
        existing.topics = [...new Set([...(existing.topics ?? []), ...(record.topics ?? [])])]
        continue
      }
      seen.set(key, record)
    }
    if (repos.length < PER_PAGE) break
    await new Promise((r) => setTimeout(r, 200))
  }
  console.log(`topic "${topic}" fetched=${fetched} quality=${[...seen.values()].filter((r) => r.categoryOriginal === categoryOriginal).length} total=${seen.size}`)
}

const records = [...seen.values()].sort((a, b) => b.stars - a.stars)
const payload = {
  schemaVersion: 1,
  source: {
    id: 'ecosystem-repos',
    name: 'Ecosyste.ms GitHub mirror (design & frontend topics)',
    url: 'https://repos.ecosyste.ms/',
    description: 'GitHub repository metadata via the public Ecosyste.ms mirror, filtered to design and frontend resource topics.',
    collectedAt: new Date().toISOString().slice(0, 10),
    rawRecordCount: rawTotal,
    listingPages: TOPICS.map(([topic]) => ({ name: topic, path: `/api/v1/hosts/GitHub/repositories?topic=${topic}`, url: `https://repos.ecosyste.ms/api/v1/hosts/GitHub/repositories?topic=${topic}`, recordCount: 0 })),
    failures: [],
  },
  records,
}
await mkdir(dirname(OUTPUT), { recursive: true })
await writeFile(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`)
console.log(`ecosystem-repos: raw=${rawTotal} uniqueSites=${records.length}`)
