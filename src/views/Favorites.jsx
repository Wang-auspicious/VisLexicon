import { useEffect, useMemo, useState } from 'react'
import { createFavoritesRepository } from '../lib/local-favorites.js'
import { exportBoard, readBoard, removeBoardItem, writeBoard } from '../lib/local-board.js'
import { loadPublicSiteIndex } from '../lib/public-data.js'
import { displayName, englishText } from '../lib/localized-content.js'
import { useLocale } from '../i18n.js'
import SiteCard from '../components/SiteCard.jsx'
import '../styles/library-pages.css'

function download(text, filename) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
function specName(item, en) {
  const selection = item.spec.selection
  const fallback = (selection.termId || selection.stageId || 'Design spec').replaceAll('-', ' ')
  return en ? englishText(selection.labelEn, englishText(selection.label, fallback)) : selection.label || fallback
}
export default function Favorites() {
  const locale = useLocale(), en = locale === 'en'
  const [repo] = useState(() => createFavoritesRepository())
  const [rows, setRows] = useState(null)
  const [index, setIndex] = useState(null)
  const [failed, setFailed] = useState(false)
  const [revision, setRevision] = useState(0)
  const [board, setBoard] = useState(() => readBoard())
  const [tab, setTab] = useState('sites')
  const [query, setQuery] = useState('')
  useEffect(() => {
    let live = true
    const refresh = () => {
      repo.listFavorites().then(data => { if (live) setRows(data.sort((a, b) => b.addedAt.localeCompare(a.addedAt))) })
      setBoard(readBoard())
    }
    refresh()
    window.addEventListener('vl-favorites-change', refresh)
    window.addEventListener('storage', refresh)
    window.addEventListener('focus', refresh)
    loadPublicSiteIndex({ reload: revision > 0 }).then(data => { if (live) { setIndex(data.items); setFailed(false) } }).catch(() => { if (live) setFailed(true) })
    return () => { live = false; window.removeEventListener('vl-favorites-change', refresh); window.removeEventListener('storage', refresh); window.removeEventListener('focus', refresh) }
  }, [repo, revision])
  const saved = useMemo(() => {
    const byId = new Map((index || []).map(item => [item.entryId, item]))
    return (rows || []).map(row => byId.get(row.entryId) || { entryId: row.entryId, name: row.entryId, unavailable: true })
  }, [rows, index])
  const filtered = (tab === 'sites' ? saved : board).filter(item => {
    const text = tab === 'sites' ? [displayName(item, locale), item.domain, item.entryId].join(' ') : specName(item, en)
    return text.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
  })
  const total = tab === 'sites' ? saved.length : board.length
  const removeSpec = key => setBoard(writeBoard(removeBoardItem(readBoard(), key)))
  const changeTab = next => { setTab(next); setQuery('') }
  return <section className="library-page favorites-page">
    <header className="library-head">
      <div><p className="library-eyebrow">{en ? 'YOUR LIBRARY' : '个人资料库'}</p><h1>{en ? 'Favorites' : '我的收藏'}</h1><p>{en ? 'Your references, saved in this browser.' : '想再次查看的参考，保存在当前浏览器。'}</p></div>
      {tab === 'specs' && board.length > 0 && <button className="library-button" onClick={() => download(exportBoard(board), 'vislexicon-board.json')}>{en ? 'Export all specs' : '导出全部规范'} <span aria-hidden="true">↓</span></button>}
    </header>
    <div className="library-toolbar">
      <div className="library-tabs" role="group" aria-label={en ? 'Favorite types' : '收藏类型'}>
        <button type="button" aria-pressed={tab === 'sites'} onClick={() => changeTab('sites')}>{en ? 'Websites' : '网站'}<small>{rows === null ? '—' : rows.length}</small></button>
        <button type="button" aria-pressed={tab === 'specs'} onClick={() => changeTab('specs')}>{en ? 'Design specs' : '设计规范'}<small>{board.length}</small></button>
      </div>
      <label className="library-search"><svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.4"/><path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.4"/></svg><input type="search" value={query} onChange={event => setQuery(event.target.value)} aria-label={en ? 'Search favorites' : '搜索收藏'} placeholder={en ? 'Search your favorites…' : '搜索收藏…'}/></label>
    </div>
    {tab === 'sites' && failed && <p className="library-feedback" role="alert">{en ? 'Website details could not load.' : '网站详情未能加载。'} <button className="library-button" onClick={() => setRevision(value => value + 1)}>{en ? 'Retry' : '重试'}</button></p>}
    {tab === 'sites' && (rows === null || (!index && !failed)) ? <p className="library-feedback" role="status">{en ? 'Loading favorites…' : '读取收藏…'}</p>
      : filtered.length ? <div className="saved-grid">{filtered.map(item => tab === 'sites'
        ? item.unavailable ? <article className="saved-spec" key={item.entryId}><h2>{displayName(item, locale)}</h2><p className="library-note">{en ? 'This website is currently unavailable.' : '这个网站暂不可用。'}</p><div className="saved-spec-actions"><button onClick={async () => { await repo.removeFavorite(item.entryId); window.dispatchEvent(new Event('vl-favorites-change')) }}>{en ? 'Remove' : '移除'}</button></div></article>
          : <SiteCard item={item} key={item.entryId}/>
        : <article className="saved-spec" key={item.key}><span className="library-eyebrow">DESIGN SPEC</span><h2>{specName(item, en)}</h2><time dateTime={item.addedAt}>{new Date(item.addedAt).toLocaleDateString(en ? 'en-US' : 'zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })}</time><div className="saved-spec-actions"><button onClick={() => download(exportBoard([item]), 'vislexicon-spec.json')}>{en ? 'Export' : '导出'} ↓</button><button onClick={() => removeSpec(item.key)}>{en ? 'Remove' : '移除'}</button></div></article>)}</div>
      : <div className="library-empty">
        <svg width="38" height="44" viewBox="0 0 38 44" fill="none" aria-hidden="true"><path d="M9 5h20v33l-10-7-10 7V5Z" stroke="currentColor" strokeWidth="1.4"/></svg>
        <h2>{query ? (en ? 'No matching favorites' : '没有匹配的收藏') : tab === 'sites' ? (en ? 'Keep your next reference here.' : '把下一份灵感留在这里。') : (en ? 'No saved design specs' : '还没有保存的设计规范')}</h2>
        <p>{query ? (en ? 'Try another name or clear the search.' : '换个名称，或清空搜索。') : tab === 'sites' ? (en ? 'Save a website from Curation to return to it later.' : '在策展中收藏网站，下次从这里继续。') : (en ? 'Your previously saved specs appear here for export.' : '已保存的设计规范会显示在这里，可随时导出。')}</p>
        {query ? <button className="library-button" onClick={() => setQuery('')}>{en ? 'Clear search' : '清空搜索'}</button> : <a className="library-button is-primary" href={tab === 'sites' ? '#/' : '#/atlas'}>{tab === 'sites' ? (en ? 'Explore curation' : '浏览策展') : (en ? 'Explore the atlas' : '浏览图鉴')} <span aria-hidden="true">↗</span></a>}
      </div>}
    {total > 0 && <p className="library-note" role="status">{en ? filtered.length + ' of ' + total + ' saved' : '共 ' + total + ' 项，当前显示 ' + filtered.length + ' 项'}</p>}
  </section>
}
