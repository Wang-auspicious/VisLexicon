import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../i18n.js'
import { navigate, useRoute } from '../router.js'
import { DiscoveryCard } from '../components/ComponentDiscovery.jsx'
import { englishText } from '../lib/localized-content.js'
import '../styles/library-pages.css'
import '../styles/components.css'

const TYPE_ZH = { button: '按钮', 'button-group': '按钮组', card: '卡片', input: '输入框', checkbox: '复选框', radio: '单选框', select: '选择器', switch: '开关', toggle: '切换', badge: '徽标', alert: '提示', accordion: '折叠面板', avatar: '头像', breadcrumb: '面包屑', carousel: '轮播', dialog: '对话框', divider: '分隔线', drawer: '抽屉', dropdown: '下拉菜单', form: '表单', icon: '图标', link: '链接', list: '列表', menu: '菜单', modal: '模态框', navbar: '导航栏', navigation: '导航', pagination: '分页', popover: '浮层', progress: '进度条', slider: '滑块', spinner: '加载动效', table: '表格', tabs: '标签页', tooltip: '工具提示', typography: '排版', component: '组件', skeleton: '骨架屏', toast: '通知', separator: '分隔线', textarea: '文本域' }
const typeLabel = (id, en) => en ? id.replaceAll('-', ' ') : TYPE_ZH[id] || id.replaceAll('-', ' ')

export default function Components() {
  const en = useLocale() === 'en'
  const { query } = useRoute()
  const source = query.source || '', type = query.type || '', q = query.q || ''
  const page = Math.max(1, Number(query.page) || 1)
  const [view, setView] = useState({ key: '', status: 'loading', result: null })
  const [revision, setRevision] = useState(0)
  const requestKey = JSON.stringify([source, type, q, page, revision])
  const result = view.result
  const status = view.key === requestKey ? view.status : 'loading'
  const [preview, setPreview] = useState(null)
  const dialog = useRef(null)
  const heading = useRef(null)
  const update = patch => {
    const params = new URLSearchParams({ source, type, q, page: String(page), ...patch })
    for (const [key, value] of [...params]) if (!value || (key === 'page' && value === '1')) params.delete(key)
    navigate('#/components' + (params.size ? '?' + params : ''))
  }
  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/discovery/browse?' + new URLSearchParams({ source, type, q, page: String(page) }), { signal: controller.signal })
      .then(response => { if (!response.ok) throw Error('unavailable'); return response.json() })
      .then(data => { if (!controller.signal.aborted) { setView({ key: requestKey, result: data, status: 'ready' }) } })
      .catch(() => { if (!controller.signal.aborted) setView(old => ({ ...old, key: requestKey, status: 'error' })) })
    return () => controller.abort()
  }, [source, type, q, page, requestKey])
  useEffect(() => { if (preview) dialog.current?.showModal() }, [preview])
  const changePage = value => { update({ page: String(value) }); heading.current?.scrollIntoView({ block: 'start' }) }
  const clear = () => update({ source: '', type: '', q: '', page: '1' })
  return <section className="library-page components-page">
    <header className="library-head"><div><a className="library-text-link" href="#/">← {en ? 'Curation' : '策展'}</a><h1>{en ? 'All components' : '全部组件'}</h1><p>{en ? 'Original previews, descriptions and source links.' : '集中查看原站截图、组件描述与来源。'}</p></div><span className="component-total">{result?.allCount.toLocaleString(en ? 'en-US' : 'zh-CN') ?? '—'} <small>{en ? 'components' : '个组件'}</small></span></header>
    <div className="component-filters">
      <form className="library-search" onSubmit={event => { event.preventDefault(); update({ q: new FormData(event.currentTarget).get('q'), page: '1' }) }}><input key={source + type + q} name="q" type="search" defaultValue={q} maxLength={200} aria-label={en ? 'Filter by name or tag' : '按名称或标签筛选'} placeholder={en ? 'Name or tag…' : '名称或标签…'}/><button type="submit">{en ? 'Filter' : '筛选'}</button></form>
      <label><span>{en ? 'Source' : '来源'}</span><select aria-label={en ? 'Source' : '来源'} value={source} onChange={event => update({ source: event.target.value, page: '1' })}><option value="">{en ? 'All sources' : '全部来源'}</option>{result?.sources.map(item => <option key={item.id} value={item.id}>{en ? englishText(item.name, item.id) : item.name} · {item.count}</option>)}</select></label>
      <label><span>{en ? 'Type' : '类型'}</span><select aria-label={en ? 'Type' : '类型'} value={type} onChange={event => update({ type: event.target.value, page: '1' })}><option value="">{en ? 'All types' : '全部类型'}</option>{result?.types.map(item => <option key={item.id} value={item.id}>{typeLabel(item.id, en)} · {item.count}</option>)}</select></label>
      {(source || type || q) && <button type="button" className="library-text-link" onClick={clear}>{en ? 'Reset' : '重置'}</button>}
    </div>
    <div ref={heading} className="component-result-line" role="status">{status === 'loading' ? (en ? 'Loading components…' : '读取组件…') : status === 'error' ? (en ? 'Components could not load.' : '组件加载失败。') : en ? result.total.toLocaleString('en-US') + ' components · Page ' + result.page + ' of ' + result.pages : '共 ' + result.total.toLocaleString('zh-CN') + ' 个组件 · 第 ' + result.page + ' / ' + result.pages + ' 页'}</div>
    {status === 'error' ? <button className="library-button" onClick={() => setRevision(value => value + 1)}>{en ? 'Retry' : '重试'}</button>
      : status === 'ready' && (result.units.length ? <div className="discovery-grid">{result.units.map(unit => <DiscoveryCard key={unit.id} unit={unit} en={en} query="" onPreview={unit.previewKind === 'image' ? () => setPreview(unit) : undefined}/>)}</div> : <div className="library-empty"><h2>{en ? 'No matching components' : '没有匹配的组件'}</h2><p>{en ? 'Try another source, type or name.' : '试试其他来源、类型或名称。'}</p><button className="library-button" onClick={clear}>{en ? 'Reset filters' : '重置筛选'}</button></div>)}
    {status === 'ready' && result.pages > 1 && <nav className="component-pagination" aria-label={en ? 'Component pages' : '组件分页'}><button className="library-button" disabled={result.page === 1} onClick={() => changePage(result.page - 1)}>← {en ? 'Previous' : '上一页'}</button><label>{en ? 'Page' : '页码'}<input type="number" key={result.page} min="1" max={result.pages} defaultValue={result.page} aria-label={en ? 'Go to page' : '跳转页码'} onKeyDown={event => { if (event.key === 'Enter' && event.target.validity.valid) changePage(Number(event.target.value)) }}/><span>/ {result.pages}</span></label><button className="library-button" disabled={result.page === result.pages} onClick={() => changePage(result.page + 1)}>{en ? 'Next' : '下一页'} →</button></nav>}
    {preview && <dialog ref={dialog} className="component-lightbox" onClose={() => setPreview(null)} onClick={event => { if (event.target === event.currentTarget) dialog.current.close() }}><div><header><h2>{en ? preview.nameEn : preview.nameZh}</h2><button autoFocus onClick={() => dialog.current.close()} aria-label={en ? 'Close preview' : '关闭预览'}>×</button></header><img src={preview.previewUrl} alt={en ? preview.nameEn : preview.nameZh}/><a className="library-text-link" href={preview.sourceUrl} target="_blank" rel="noreferrer">{en ? 'View original source' : '查看原始来源'} ↗</a></div></dialog>}
  </section>
}
