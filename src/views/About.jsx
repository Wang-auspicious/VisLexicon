import { useEffect, useState } from 'react'
import { useLocale } from '../i18n.js'
import { loadPublicSiteIndex } from '../lib/public-data.js'
import '../styles/library-pages.css'

const ENDPOINTS = [
  { path: '/r/registry.json', name: 'Registry', zh: '站点索引与详情入口', en: 'Site index and record links', type: 'json' },
  { path: '/site/shadcn-ui.md', name: 'DESIGN.md', zh: '单个站点的结构化记录', en: 'A structured site record', type: 'text' },
  { path: '/llms.txt', name: 'llms.txt', zh: '供 Agent 阅读的站点导览', en: 'A guide for agents', type: 'text' },
]
function Endpoint({ endpoint, en }) {
  const [status, setStatus] = useState('loading')
  useEffect(() => {
    const controller = new AbortController()
    fetch(endpoint.path, { signal: controller.signal }).then(async response => {
      const body = await response.text()
      if (!response.ok || /<!doctype html|<html/i.test(body)) throw Error('unavailable')
      if (endpoint.type === 'json') JSON.parse(body)
      setStatus('ready')
    }).catch(() => { if (!controller.signal.aborted) setStatus('error') })
    return () => controller.abort()
  }, [endpoint])
  return <li className="about-endpoint">
    <a href={endpoint.path} target="_blank" rel="noreferrer"><strong>{endpoint.name}</strong><span>{en ? endpoint.en : endpoint.zh}</span><span aria-hidden="true">↗</span></a>
    <span className={'endpoint-status is-' + status} role="status">{status === 'ready' ? (en ? 'Available' : '可访问') : status === 'error' ? (en ? 'Unavailable' : '暂不可用') : (en ? 'Checking…' : '检查中…')}</span>
  </li>
}
export default function About() {
  const en = useLocale() === 'en'
  const [counts, setCounts] = useState({ sites: null, components: null })
  useEffect(() => {
    let live = true
    loadPublicSiteIndex().then(data => { if (live) setCounts(old => ({ ...old, sites: data.items.length })) }).catch(() => {})
    fetch('/api/discovery/index?scope=curation&summary=1').then(r => r.ok ? r.json() : Promise.reject()).then(data => {
      if (live) setCounts(old => ({ ...old, components: data.themeMeta?.['']?.componentCount ?? null }))
    }).catch(() => {})
    return () => { live = false }
  }, [])
  const sections = [
    { href: '#/', title: en ? 'Curation' : '策展', text: en ? 'Find websites, libraries and original components.' : '寻找网站、资源库和原站组件。' },
    { href: '#/atlas', title: en ? 'Atlas' : '图鉴', text: en ? 'Compare visual patterns and interaction details.' : '比较视觉样式与交互细节。' },
    { href: '#/skills', title: en ? 'Creative resources' : '创作资源', text: en ? 'Explore skills, image prompts, slides and figures.' : '浏览 Skill、生图提示词、演示与科研绘图。' },
  ]
  const standards = en ? [
    ['Original sources', 'Screenshots and source links connect each record to its original example.'],
    ['Specific descriptions', 'Structure, dimensions, color and behavior are described at the component level.'],
    ['Clear boundaries', 'Access, source code and licensing are recorded separately. Unverified details stay unspecified.'],
  ] : [
    ['可追溯的来源', '截图与来源链接对应原始网站和具体实例。'],
    ['具体的描述', '按组件记录结构、尺寸、色彩与交互行为。'],
    ['明确的使用条件', '使用费用、源码与许可分别记录，未核实的信息不作推断。'],
  ]
  return <article className="library-page about-page">
    <header className="library-head about-head">
      <div><p className="library-eyebrow">VISLEXICON</p><h1>{en ? 'A reference for\nvisual decisions.' : '让视觉选择\n有据可循。'}</h1></div>
      <div className="about-intro"><p>{en ? 'Find components, inspect their details and open the original source.' : '查找组件、查看细节、追溯原站。'}</p><a className="library-text-link" href="#/components">{en ? 'Explore components' : '浏览组件'} <span aria-hidden="true">↗</span></a></div>
    </header>
    <section className="about-section" id="counts" aria-labelledby="about-library-title">
      <div><h2 id="about-library-title">{en ? 'The library' : '内容库'}</h2><p className="library-note">{en ? 'Published records, counted live.' : '按当前已发布内容统计。'}</p></div>
      <div><div className="about-counts">{[
        { key: 'sites', href: '#/sites', label: en ? 'Websites' : '网站' },
        { key: 'components', href: '#/components', label: en ? 'Components' : '组件' },
      ].map(row => <a href={row.href} key={row.key}><strong>{counts[row.key] === null ? '—' : counts[row.key].toLocaleString(en ? 'en-US' : 'zh-CN')}</strong><span>{row.label}<span aria-hidden="true"> ↗</span></span></a>)}</div>
      <nav className="about-directory" aria-label={en ? 'Explore the library' : '浏览内容库'}>{sections.map(section => <a key={section.href} href={section.href}><strong>{section.title}</strong><span>{section.text}</span><span aria-hidden="true">↗</span></a>)}</nav></div>
    </section>
    <section className="about-section" id="method" aria-labelledby="about-standards-title">
      <h2 id="about-standards-title">{en ? 'Editorial standards' : '收录标准'}</h2>
      <dl className="about-standards">{standards.map(([title, text]) => <div key={title}><dt>{title}</dt><dd>{text}</dd></div>)}</dl>
    </section>
    <section className="about-section" id="endpoints" aria-labelledby="about-agents-title">
      <div><h2 id="about-agents-title">{en ? 'For agents' : '供 Agent 使用'}</h2><p className="library-note">{en ? 'Read the same source records.' : '读取同一份来源记录。'}</p></div>
      <ul className="about-endpoints">{ENDPOINTS.map(endpoint => <Endpoint key={endpoint.path} endpoint={endpoint} en={en} />)}</ul>
    </section>
    <section className="about-section about-final" id="submit" aria-labelledby="about-check-title"><h2 id="about-check-title">{en ? 'Check a website' : '查找网站'}</h2><p>{en ? 'Use the URL lookup below to check whether a site is in the library. The lookup runs in your browser.' : '在下方输入网址，查询是否已收录。查询在当前浏览器内完成。'}</p></section>
  </article>
}
