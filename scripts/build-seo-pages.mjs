#!/usr/bin/env node
/**
 * Static HTML for search engines and link previews, written into dist/ after `vite build`.
 *
 * The app is a client-side SPA. Each real URL gets its own HTML file so that a
 * crawler (or a WeChat / X link preview) sees the title, description, screenshot
 * and an outbound link without running JavaScript. The page body is plain HTML
 * inside #root; React replaces it on load, so people see the normal app.
 *
 *   dist/site/<entryId>.html      one per published site
 *   dist/<route>.html             sites, components, atlas, resources, about, submit, legal pages
 *   dist/sitemap.xml, dist/robots.txt
 *
 * Cloudflare Pages serves /site/<id> from /site/<id>.html (no trailing-slash redirect).
 * VISLEXICON_ORIGIN sets the canonical origin (default https://vislexicon.com),
 * VISLEXICON_DIST the build folder (default dist).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { CONTACT_EMAIL, LEGAL_PAGES, LEGAL_UPDATED } from '../src/data/site-info.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.resolve(ROOT, process.env.VISLEXICON_DIST || 'dist')
const PUBLIC = path.join(ROOT, 'public')
const ORIGIN = (process.env.VISLEXICON_ORIGIN || 'https://vislexicon.com').replace(/\/$/, '')
const BRAND = 'VisLexicon · 视元'

const esc = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const clip = (value, max) => { const text = String(value ?? '').replace(/\s+/g, ' ').trim(); return text.length > max ? `${text.slice(0, max - 1)}…` : text }
const abs = (src) => (src ? (/^https?:/.test(src) ? src : ORIGIN + src) : '')

const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
// #root holds a loading skeleton in index.html; the static pages replace it with their content.
const ROOT_BLOCK = /<div id="root">[\s\S]*?<\/div>(\s*<\/body>)/
if (!ROOT_BLOCK.test(template)) throw new Error(`${path.relative(ROOT, DIST)}/index.html has no #root at the end of body; run vite build first`)

function page({ route, title, description, image, body, jsonLd }) {
  const url = ORIGIN + (route === '/' ? '/' : route)
  const head = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="${route.startsWith('/site/') ? 'article' : 'website'}" />`,
    `<meta property="og:site_name" content="${BRAND}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    image ? `<meta property="og:image" content="${esc(image)}" />` : '',
    `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />`,
    jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>` : '',
    // Readable for the moment before React replaces it, and for no-JS readers.
    '<style>.seo-static{max-width:880px;margin:32px auto;padding:0 16px;font:15px/1.75 system-ui,sans-serif;color:#1f1f1f}.seo-static img{max-width:100%;height:auto}.seo-static nav{font-size:13px;margin-bottom:24px}.seo-static figure{margin:16px 0}</style>',
  ].filter(Boolean).join('\n    ')
  return template
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/\s*<meta name="description"[^>]*>/, '')
    .replace(/\s*<meta property="og:(?:title|description|image|type|url|site_name)"[^>]*>/g, '')
    .replace(/\s*<meta name="twitter:[^"]*"[^>]*>/g, '')
    .replace(/\s*<link rel="canonical"[^>]*>/, '')
    .replace('</head>', `    ${head}\n  </head>`)
    .replace(ROOT_BLOCK, (_match, script) => `<div id="root"><main class="seo-static">${body}</main></div>${script}`)
}
function write(route, html) {
  const file = route === '/' ? path.join(DIST, 'index.html') : path.join(DIST, `${route.slice(1)}.html`)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, html)
}
const nav = `<nav><a href="/">策展</a> · <a href="/sites">全部网站</a> · <a href="/components">全部组件</a> · <a href="/atlas">图鉴</a> · <a href="/skills">Skill</a> · <a href="/about">关于</a> · <a href="/submit">投稿</a></nav>`

const index = JSON.parse(fs.readFileSync(path.join(PUBLIC, 'data/site-index.json'), 'utf8'))
const sites = index.items
const urls = []

// Sites
const byCategory = new Map()
const details = new Map()
for (const item of sites) {
  const detail = JSON.parse(fs.readFileSync(path.join(PUBLIC, 'data/site', `${item.entryId}.json`), 'utf8'))
  details.set(item.entryId, detail)
  const category = detail.classification?.primaryCategory || 'other'
  if (!byCategory.has(category)) byCategory.set(category, [])
  byCategory.get(category).push(item)
}
for (const item of sites) {
  const detail = details.get(item.entryId)
  const ed = detail.editorial || {}
  const route = `/site/${item.entryId}`
  const identity = detail.pages?.find((p) => p.role === 'identity')
  const image = abs(identity?.shot?.display?.full || identity?.shot?.src)
  const description = clip(ed.descriptionZh || item.descriptionZh || ed.takeawayZh, 155)
  const related = (byCategory.get(detail.classification?.primaryCategory || 'other') || []).filter((other) => other.entryId !== item.entryId).slice(0, 8)
  const shots = (detail.pages || []).map((p) => `<figure><img src="${esc(p.shot?.display?.card || p.shot?.src)}" alt="${esc(p.shot?.alt || `${ed.name} ${p.role}`)}" width="720" height="506" loading="lazy" /><figcaption>${esc(p.title || p.role)}</figcaption></figure>`).join('')
  const body = `${nav}
<article><h1>${esc(ed.name || item.name)}</h1>
<p>${esc(ed.descriptionZh || item.descriptionZh || '')}</p>
${ed.takeawayZh ? `<p><strong>拿走什么：</strong>${esc(ed.takeawayZh)}</p>` : ''}
${ed.noteZh ? `<p>${esc(ed.noteZh)}</p>` : ''}
<p><a href="${esc(item.homepage || detail.official?.finalUrl)}" rel="noopener">访问原网站 ${esc(item.domain || '')}</a></p>
${shots}
${related.length ? `<h2>同类网站</h2><ul>${related.map((r) => `<li><a href="/site/${esc(r.entryId)}">${esc(r.name)}</a></li>`).join('')}</ul>` : ''}
</article>`
  write(route, page({ route, title: `${ed.name || item.name} · ${BRAND}`, description, image, body,
    jsonLd: { '@context': 'https://schema.org', '@type': 'WebPage', name: ed.name || item.name, url: ORIGIN + route, description, image: image || undefined, about: { '@type': 'WebSite', name: ed.name || item.name, url: item.homepage || detail.official?.finalUrl } } }))
  urls.push({ route, lastmod: (detail.generatedAt || index.generatedAt || '').slice(0, 10) })
}

// Channel and info pages
const siteList = `<ul>${sites.map((s) => `<li><a href="/site/${esc(s.entryId)}">${esc(s.name)}</a> — ${esc(clip(s.takeawayZh || s.descriptionZh, 60))}</li>`).join('')}</ul>`
const channels = [
  ['/', BRAND, `视元收录 ${sites.length} 个审核过的设计网站和上万个实测组件，用中文口语描述就能找到合适的组件、网站和设计资源。免费，不用注册。`, `<h1>视元 VisLexicon</h1><p>用一句话描述你要的组件或网站，视元帮你找出来：每条都有原站截图、实测数值和出处。</p>${siteList}`],
  ['/sites', `全部网站 · ${BRAND}`, `${sites.length} 个审核过的设计网站：组件库、设计系统、素材、工具与灵感合集，每个都有原站截图和中文介绍。`, `<h1>全部网站</h1>${siteList}`],
  ['/components', `全部组件 · ${BRAND}`, '上万个来自真实网站的界面组件，带原站截图、颜色、圆角、阴影等实测数值，可按类型和来源浏览。', '<h1>全部组件</h1><p>按类型和来源浏览来自真实网站的界面组件。</p>'],
  ['/atlas', `图鉴 · ${BRAND}`, '可交互的视觉图鉴：比较形状、颜色、尺寸与动效，调好参数后带走一份能直接实现的设计规格。', '<h1>图鉴</h1>'],
  ['/skills', `Skill 与 DESIGN.md · ${BRAND}`, '收录真实项目公开的 DESIGN.md、设计规范和设计 Skill 原文，可直接复制或下载。', '<h1>Skill 与 DESIGN.md</h1>'],
  ['/ppt', `PPT 资源 · ${BRAND}`, '完整的演示文稿原件、模板、主题和 PPT Skill。', '<h1>PPT 资源</h1>'],
  ['/graphics', `图像处理 · ${BRAND}`, 'Agent 可调用的图像效果与 PSD 操作，附完整代码、真实预览和使用限制。', '<h1>图像处理</h1>'],
  ['/science', `科研绘图 · ${BRAND}`, '科研绘图的版式、配色与可运行脚本。', '<h1>科研绘图</h1>'],
  ['/about', `关于 · ${BRAND}`, '视元是给人和 Agent 共用的视觉词典：每条记录都有原站截图、实测数值和出处，未核实的信息不作推断。', '<h1>关于视元</h1><p>截图来自原站，数值来自浏览器实测，许可与价格分别注明出处。</p>'],
  ['/submit', `投稿 · ${BRAND}`, '推荐一个值得收录的网站、组件库、工具或资源。投稿免费，不用注册，每条人工审核。', `<h1>投稿</h1><p>推荐网站、组件库、工具、素材或资源。也可以写信到 ${esc(CONTACT_EMAIL)}。</p>`],
]
for (const [route, title, description, body] of channels) {
  write(route, page({ route, title, description, body: `${nav}${body}` }))
  urls.push({ route, lastmod: index.generatedAt?.slice(0, 10) })
}
for (const [id, doc] of Object.entries(LEGAL_PAGES)) {
  const zh = doc.zh
  const body = `${nav}<article><h1>${esc(zh.title)}</h1><p>${esc(zh.intro)}</p><p>更新于 ${LEGAL_UPDATED}</p>${zh.sections.map((s) => `<h2>${esc(s.h)}</h2>${s.p.map((p) => `<p>${esc(p)}</p>`).join('')}`).join('')}</article>`
  write(`/${id}`, page({ route: `/${id}`, title: `${zh.title} · ${BRAND}`, description: clip(zh.intro + zh.sections[0].p[0], 155), body }))
  urls.push({ route: `/${id}`, lastmod: LEGAL_UPDATED })
}

fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${esc(ORIGIN + u.route)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`)
fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${ORIGIN}/sitemap.xml\n`)
console.log(`[seo] ${sites.length} site pages + ${channels.length + Object.keys(LEGAL_PAGES).length} channel pages, sitemap with ${urls.length} URLs → ${path.relative(ROOT, DIST)}/`)
