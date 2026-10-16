import { useEffect, useState } from 'react'
import { useLocale } from '../i18n.js'
import { navigate } from '../router.js'
import '../styles/resource-kit.css'

// 资源框架（Spec v1 · Resource）：每条 = 完整代码 / 原文件 + 真实输出预览 + 一行可执行命令 + 出处与限制。
// 数据由 scripts/resources/build-index.mjs 生成到 /resources/index.json，MCP 读的也是这一份。
const SHELF_OF = { ppt: 'ppt', graphics: 'image', science: 'science' }
const COPY = {
  ppt: { zh: '可直接用的模板与原文件', en: 'Ready-to-use templates and originals' },
  image: { zh: '可直接跑的图像效果', en: 'Image effects you can run' },
  science: { zh: '可直接出图的样式与脚本', en: 'Figure styles and scripts that render' },
}
const ROLE = { code: ['代码', 'Code'], template: ['模板', 'Template'], original: ['原文件', 'Original'], output: ['输出', 'Output'], 'sample-input': ['示例输入', 'Sample input'], doc: ['说明', 'Doc'] }

let cache = null
function useKits() {
  const [data, setData] = useState(cache)
  useEffect(() => {
    if (cache) return
    let live = true
    fetch('/resources/index.json').then(r => (r.ok ? r.json() : null)).then(d => { cache = d; if (live) setData(d) }).catch(() => {})
    return () => { live = false }
  }, [])
  return data
}

const kb = (n) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`)

function CopyButton({ text, en }) {
  const [state, setState] = useState('idle')
  return <button type="button" className="rk-copy" onClick={async () => { try { await navigator.clipboard.writeText(text); setState('ok') } catch { setState('fail') } setTimeout(() => setState('idle'), 1600) }}>
    {state === 'ok' ? (en ? 'Copied' : '已复制') : state === 'fail' ? (en ? 'Select to copy' : '请手动选中复制') : (en ? 'Copy' : '复制')}
  </button>
}

export function KitDetail({ item, en, back }) {
  const [shot, setShot] = useState(0)
  const L = (t) => (en ? t?.en || t?.zh : t?.zh)
  const dir = item.files[0]?.path.replace(/\/[^/]+$/, '').replace(/\/previews$/, '')
  return <article className="rk-detail">
    <button type="button" className="rk-back" onClick={back}>← {en ? 'All resources' : '全部资源'}</button>
    <div className="rk-detail-grid">
      <div>
        <figure className="rk-stage"><img src={item.previews[shot].url} alt={L(item.name)} width={item.previews[shot].width} height={item.previews[shot].height} /></figure>
        {item.previews.length > 1 && <div className="rk-thumbs" role="tablist" aria-label={en ? 'Previews' : '预览'}>
          {item.previews.map((p, i) => <button key={p.url} type="button" role="tab" aria-selected={i === shot} onClick={() => setShot(i)}><img src={p.url} alt="" loading="lazy" /></button>)}
        </div>}
        <h1>{L(item.name)}</h1>
        <p className="rk-lead">{L(item.summary)}</p>
        <section className="rk-run">
          <div className="rk-run-head"><h2>{en ? 'Run it' : '一行命令'}</h2><CopyButton text={item.run.command} en={en} /></div>
          <pre><code>{item.run.command}</code></pre>
          <p className="rk-meta">{en ? 'Runtime' : '运行环境'}：{item.run.runtime}{item.run.requires?.length ? ` · ${item.run.requires.join(', ')}` : ''} · {en ? 'run inside' : '在目录内执行'} <code>{dir}</code></p>
          {item.run.inputs && <dl className="rk-io">{Object.entries(item.run.inputs).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>}
        </section>
      </div>
      <aside className="rk-side">
        <section><h2>{en ? 'Files' : '文件'}</h2>
          <ul className="rk-files">{item.files.map(f => <li key={f.path}>
            <a href={f.path} download>{f.path.split('/').pop()}</a>
            <span>{ROLE[f.role]?.[en ? 1 : 0] || f.role} · {kb(f.bytes)}</span>
          </li>)}</ul>
        </section>
        <section><h2>{en ? 'Limits' : '做不到的'}</h2><p>{L(item.run.limits)}</p></section>
        <section><h2>{en ? 'Provenance' : '出处'}</h2>
          <p>{item.provenance.origin === 'vislexicon-authored' ? (en ? 'Written and verified by VisLexicon' : 'VisLexicon 编写并实测') : item.provenance.author}{item.provenance.license ? ` · ${item.provenance.license}` : ''}</p>
          {item.provenance.sourceUrl && <p><a href={item.provenance.sourceUrl} target="_blank" rel="noreferrer">{en ? 'Original source' : '原始来源'} ↗</a></p>}
          {item.provenance.sampleInput && <p>{en ? 'Sample input' : '示例输入'}：{item.provenance.sampleInput.what} · <a href={item.provenance.sampleInput.copiedFrom} target="_blank" rel="noreferrer">↗</a></p>}
        </section>
        {item.tags?.length > 0 && <p className="rk-tags">{item.tags.map(t => <span key={t}>{t}</span>)}</p>}
      </aside>
    </div>
  </article>
}

export default function ResourceKit({ channel, kitId }) {
  const en = useLocale() === 'en'
  const data = useKits()
  const shelf = SHELF_OF[channel]
  const items = (data?.items || []).filter(i => i.shelf === shelf)
  const open = (id) => navigate(`#/${channel}${id ? `?kit=${encodeURIComponent(id)}` : ''}`)
  if (kitId) {
    const item = items.find(i => i.id === kitId)
    if (!data) return <p className="route-loading" role="status">{en ? 'Loading…' : '加载中…'}</p>
    if (item) return <KitDetail item={item} en={en} back={() => open(null)} />
  }
  if (!items.length) return null
  return <section className="rk-shelf" aria-labelledby="rk-shelf-title">
    <header><h2 id="rk-shelf-title">{COPY[shelf][en ? 'en' : 'zh']}</h2><span>{items.length}</span></header>
    <div className="rk-grid">
      {items.map(item => <button type="button" key={item.id} className="rk-card" onClick={() => open(item.id)}>
        <span className="rk-card-img"><img src={item.previews[0].url} alt="" loading="lazy" data-fit={item.shelf === 'science' ? 'contain' : undefined} width={item.previews[0].width} height={item.previews[0].height} /></span>
        <span className="rk-card-body">
          <strong>{en ? item.name.en : item.name.zh}</strong>
          <span>{en ? item.summary.en : item.summary.zh}</span>
          <em>{item.run.runtime} · {item.files.length} {en ? 'files' : '个文件'}</em>
        </span>
      </button>)}
    </div>
  </section>
}
