import { useEffect, useRef, useState } from 'react'
import { discoveryPageState } from '../lib/discovery-pagination.js'
import { useDiscoverySearch } from '../lib/use-discovery-search.js'
import { jevErrorMessage } from '../lib/jev-status.js'
import { useLocale } from '../i18n.js'
import { navigate, useRoute, currentHash } from '../router.js'
import { DiscoveryCard } from '../components/ComponentDiscovery.jsx'
import { englishText } from '../lib/localized-content.js'
import ComponentCodeDetail from '../components/ComponentCodeDetail.jsx'
import { readComponentDetail } from '../lib/component-code-details.js'
import '../styles/library-pages.css'
import '../styles/components.css'

const TYPE_ZH = { button: '按钮', 'button-group': '按钮组', card: '卡片', input: '输入框', checkbox: '复选框', radio: '单选框', select: '选择器', switch: '开关', toggle: '切换', badge: '徽标', alert: '提示', accordion: '折叠面板', avatar: '头像', breadcrumb: '面包屑', carousel: '轮播', dialog: '对话框', divider: '分隔线', drawer: '抽屉', dropdown: '下拉菜单', form: '表单', icon: '图标', link: '链接', list: '列表', menu: '菜单', modal: '模态框', navbar: '导航栏', navigation: '导航', pagination: '分页', popover: '浮层', progress: '进度条', slider: '滑块', spinner: '加载动效', table: '表格', tabs: '标签页', tooltip: '工具提示', typography: '排版', component: '组件', skeleton: '骨架屏', toast: '通知', separator: '分隔线', textarea: '文本域' }
const typeLabel = (id, en) => en ? id.replaceAll('-', ' ') : TYPE_ZH[id] || id.replaceAll('-', ' ')

export default function Components() {
  const en = useLocale() === 'en'
  const { query } = useRoute()
  const source = query.source || '', type = query.type || '', q = query.q || ''
  const requestedPage = discoveryPageState(query.page).page
  const [view, setView] = useState({ key: '', status: 'loading', result: null })
  const [revision, setRevision] = useState(0)
  const browsePage=q.trim()?1:requestedPage
  const requestKey = JSON.stringify([source, type, browsePage, revision])
  const [composing,setComposing]=useState(false)
  const jev=useDiscoverySearch({query:q,scope:'curation',filters:{kind:'website-component',source,type},composing,pageSize:24})
  const loadMore=jev.loadMore
  const currentSearch=jev.displayResponse?.query===q.trim()?jev.displayResponse:null
  const pageState=discoveryPageState(requestedPage,currentSearch?.matchCount)
  const page=q.trim()?pageState.page:requestedPage
  const pageNeedsClamp=Boolean(q.trim()&&currentSearch&&requestedPage!==page)
  useEffect(()=>{
    if(!pageNeedsClamp)return
    const [route,queryString='']=currentHash().split('?')
    if(route!=='#/components')return
    const params=new URLSearchParams(queryString)
    if(page===1)params.delete('page');else params.set('page',String(page))
    window.history.replaceState(window.history.state,'',route+(params.size?'?'+params:''))
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  },[pageNeedsClamp,page])
  const searchUnits=jev.displayResponse?.units||[]
  const result=q.trim()?{...view.result,allCount:view.result?.allCount||0,total:jev.displayResponse?.matchCount||0,page,pages:pageState.pages||1,units:searchUnits.slice((page-1)*24,page*24)}:view.result
  const waitingPage=Boolean(q.trim()&&page>1&&searchUnits.length<=(page-1)*24&&(jev.displayResponse?.matchCount||0)>(page-1)*24)
  const status=waitingPage?'loading':q.trim()?(searchUnits.length||(jev.status==='ready'&&!(jev.response?.remainingCount>0))?'ready':jev.status==='error'?'error':'loading'):(view.key === requestKey ? view.status : 'loading')
  useEffect(()=>{if(q.trim()&&page*24>searchUnits.length&&searchUnits.length<(jev.displayResponse?.matchCount||0)&&!jev.loadingMore&&!jev.pageError)loadMore()},[q,page,searchUnits.length,jev.displayResponse?.matchCount,jev.response?.refineToken,jev.loadingMore,jev.pageError,loadMore])
  const [preview, setPreview] = useState(null)
  const heading = useRef(null)
  const update = (patch,replace=false) => {
    if(Object.hasOwn(patch,'q'))jev.updateQuery(patch.q)
    const params = new URLSearchParams({ source, type, q, page: String(page), ...patch })
    for (const [key, value] of [...params]) if (!value || (key === 'page' && value === '1')) params.delete(key)
    const href='#/components' + (params.size ? '?' + params : '')
    if(replace){window.history.replaceState(null,'',href);window.dispatchEvent(new HashChangeEvent('hashchange'))}else navigate(href)
  }
  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/discovery/browse?' + new URLSearchParams({ source, type, q:'', page: String(browsePage) }), { signal: controller.signal })
      .then(response => { if (!response.ok) throw Error('unavailable'); return response.json() })
      .then(data => { if (!controller.signal.aborted) { setView({ key: requestKey, result: data, status: 'ready' }) } })
      .catch(() => { if (!controller.signal.aborted) setView(old => ({ ...old, key: requestKey, status: 'error' })) })
    return () => controller.abort()
  }, [source, type, browsePage, requestKey])
  useEffect(() => {
    if (!query.component || !/^[a-zA-Z0-9_.-]{1,180}$/.test(query.component)) return
    const controller = new AbortController()
    const detailUrl = `/data/component-code/items/${encodeURIComponent(query.component)}.json`
    readComponentDetail(detailUrl).then(item => {
      const title = item.title ?? item.name ?? item.id
      const zh = item.nameZh ?? (typeof title === 'object' ? title.zh ?? title.en : title)
      const english = item.nameEn ?? (typeof title === 'object' ? title.en ?? title.zh : title)
      if (!controller.signal.aborted) setPreview({ id: item.id, nameZh: zh, nameEn: english, sourceUrl: item.sourceUrl, codeResource: { detailUrl, initialItem: item } })
    }).catch(() => {})
    return () => controller.abort()
  }, [query.component])
  const changePage = value => { update({ page: String(value) }); heading.current?.scrollIntoView({ block: 'start' }) }
  const clear = () => update({ source: '', type: '', q: '', page: '1' })
  return <section className="library-page components-page">
    <header className="library-head"><div><a className="library-text-link" href="#/">← {en ? 'Curation' : '策展'}</a><h1>{en ? 'All components' : '全部组件'}</h1><p>{en ? 'Original screenshots, complete source and verified interactive previews.' : '原站截图、完整源码与通过验证的实时预览。'}</p></div><span className="component-total">{result?.allCount.toLocaleString(en ? 'en-US' : 'zh-CN') ?? '—'} <small>{en ? 'component resources' : '项组件资源'}</small></span></header>
    <div className="component-filters">
      <form className="library-search" onSubmit={event => { event.preventDefault(); update({ q: new FormData(event.currentTarget).get('q'), page: '1' }) }}><input name="q" type="search" value={q} maxLength={1500} aria-label={en ? 'Describe a component' : '描述要找的组件'} placeholder={en ? 'Describe appearance, color or motion…' : '描述外观、颜色或动效…'} onChange={event=>update({q:event.target.value,page:'1'},true)} onCompositionStart={()=>{jev.setComposing(true);setComposing(true)}} onCompositionEnd={event=>{jev.setComposing(false);setComposing(false);update({q:event.currentTarget.value,page:'1'},true)}}/><button type="submit">{en ? 'Filter' : '筛选'}</button></form>
      <label><span>{en ? 'Source' : '来源'}</span><select aria-label={en ? 'Source' : '来源'} value={source} onChange={event => update({ source: event.target.value, page: '1' })}><option value="">{en ? 'All sources' : '全部来源'}</option>{result?.sources?.map(item => <option key={item.id} value={item.id}>{en ? englishText(item.name, item.id) : item.name} · {item.count}</option>)}</select></label>
      <label><span>{en ? 'Type' : '类型'}</span><select aria-label={en ? 'Type' : '类型'} value={type} onChange={event => update({ type: event.target.value, page: '1' })}><option value="">{en ? 'All types' : '全部类型'}</option>{result?.types?.map(item => <option key={item.id} value={item.id}>{typeLabel(item.id, en)} · {item.count}</option>)}</select></label>
      {(source || type || q) && <button type="button" className="library-text-link" onClick={clear}>{en ? 'Reset' : '重置'}</button>}
    </div>
    <div ref={heading} className="component-result-line" role="status">{waitingPage?(en?'Loading this page…':'正在加载这一页…'):q.trim()?jev.statusText(en):status === 'loading' ? (en ? 'Loading components…' : '读取组件…') : status === 'error' ? (en ? 'Components could not load.' : '组件加载失败。') : en ? result.total.toLocaleString('en-US') + ' component resources · Page ' + result.page + ' of ' + result.pages : '共 ' + result.total.toLocaleString('zh-CN') + ' 项组件资源 · 第 ' + result.page + ' / ' + result.pages + ' 页'}</div>
    {q.trim()&&jev.response?.remainingCount>0&&searchUnits.length===0&&<p role="status">{en?'More candidates are awaiting Jev review.':'还有候选待 Jev 判断。'}</p>}
    {status === 'error' ? <button className="library-button" onClick={() => {if(q.trim())jev.retry();else setRevision(value => value + 1)}}>{en ? 'Retry' : '重试'}</button>
      : status === 'ready' && (result.units.length ? <div className="discovery-grid">{result.units.map(unit => <DiscoveryCard key={unit.id} unit={unit} en={en} query={q} onPreview={unit.previewKind === 'image' || unit.codeResource ? () => setPreview(unit) : undefined}/>)}</div> : <div className="library-empty"><h2>{en ? 'No matching components' : '没有匹配的组件'}</h2><p>{en ? 'Try another source, type or name.' : '试试其他来源、类型或名称。'}</p><button className="library-button" onClick={clear}>{en ? 'Reset filters' : '重置筛选'}</button></div>)}
    {q.trim()&&jev.error&&<p role="status">{jevErrorMessage(jev.error,en)} <button type="button" onClick={jev.retry}>{en?'Retry Jev':'重试 Jev'}</button></p>}
    {q.trim()&&jev.pageError&&<button type="button" onClick={jev.loadMore}>{en?'Retry loading':'重试加载'}</button>}
    {status === 'ready' && result.pages > 1 && <nav className="component-pagination" aria-label={en ? 'Component pages' : '组件分页'}><button className="library-button" disabled={result.page === 1} onClick={() => changePage(result.page - 1)}>← {en ? 'Previous' : '上一页'}</button><label>{en ? 'Page' : '页码'}<input type="number" key={result.page} min="1" max={result.pages} defaultValue={result.page} aria-label={en ? 'Go to page' : '跳转页码'} onKeyDown={event => { if (event.key === 'Enter' && event.target.validity.valid) changePage(Number(event.target.value)) }}/><span>/ {result.pages}</span></label><button className="library-button" disabled={result.page === result.pages} onClick={() => changePage(result.page + 1)}>{en ? 'Next' : '下一页'} →</button></nav>}
    {preview && <ComponentCodeDetail key={preview.id} unit={preview} en={en} onClose={() => setPreview(null)} />}
  </section>
}
