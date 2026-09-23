import { useJevSearch } from '../lib/use-jev-search.js'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { buildSearchIndex, searchAll, siteHref, termHref } from '../lib/search-index.js'
import { loadPublicSiteIndex } from '../lib/public-data.js'
import { navigate } from '../router.js'
import { useT } from '../i18n.js'
import { resourceHref, RESOURCE_SECTIONS } from '../lib/creative-resources.js'

/* ============ 顶栏全站搜索（方案 §3.6） ============
 * 跨「图鉴术语」「站点库」「创作练习」，练习有独立分组，
 * 每组最多 6 条，组尾一条「查看全部 →」跳到该语料的列表页（导流表 L10）。
 * ⌘K / Ctrl+K 聚焦本框——旧的独立命令面板已删除，键盘入口收在这里。
 *
 * 无障碍：input 是 role="combobox"，下拉是 role="listbox"，
 * 高亮项用 aria-activedescendant 指过去（焦点始终留在输入框）。
 */

/* 每组下拉里最多显示几条。这是版面参数，不是统计量。 */
const GROUP_LIMIT = 6

export default function GlobalSearch() {
  const t = useT()
  const [open, setOpen] = useState(false)      /* 移动端：搜索框是否展开 */
  const [keyword, setKeyword] = useState('')
  const [active, setActive] = useState(0)
  const [index, setIndex] = useState(null)
  const [resources, setResources] = useState([])
  const [componentResponse,setComponentResponse]=useState(null)
  const [searchSource,setSearchSource]=useState(null)
  const [searchRevision,setSearchRevision]=useState(0)
  const [loadState, setLoadState] = useState('idle')   /* idle | loading | ready | error */
  const inputRef = useRef(null)
  const rootRef = useRef(null)
  const searchHistory=useRef(null)
  const lastComponent=useRef(null)
  const domId = useId()

  /* 语料在第一次聚焦时才加载：图鉴语料有 220 条，没必要进首屏包。 */
  const ensureIndex = useCallback(() => {
    if (loadState !== 'idle') return
    setLoadState('loading')
    Promise.all([
      import('../data/visual-atlas.json').then((mod) => mod.default),
      import('../stages/manifests.js').then((mod) => mod.MANIFESTS),
      loadPublicSiteIndex().catch(() => null),
      import('../data/creative-practices.json').then((mod) => mod.default),
      import('../data/image-prompts.json').then((mod) => mod.default.map(item=>({...item,type:'prompt',category:'image',title:item.titleZh}))),
    ]).then(([atlas, manifests, siteIndex, creativeResources, imagePrompts]) => {
      setIndex(buildSearchIndex({ atlas, manifests, siteIndex }))
      setResources([...creativeResources,...imagePrompts])
      setLoadState('ready')
    }).catch(() => setLoadState('error'))
  }, [loadState])

  /* ⌘K / Ctrl+K：展开并聚焦。Esc 在输入框内部处理，这里不抢。 */
  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen(true)
        ensureIndex()
        window.setTimeout(() => inputRef.current?.focus(), 0)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ensureIndex])

  /* 点到框外收起下拉（移动端连搜索框一起收起）。 */
  useEffect(() => {
    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        searchHistory.current=null
        setSearchSource(null)
        setSearchRevision(value=>value+1)
        setKeyword('')
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  const results = useMemo(() => {
    if(!index)return {terms:[],sites:[],termTotal:0,siteTotal:0,termUncertain:false,siteUncertain:false,signals:[]}
    return searchAll(searchSource||index,keyword,Infinity)
  },[index,keyword,searchSource])
  useEffect(()=>{searchHistory.current=keyword.trim()&&index?{query:keyword.trim(),index,terms:results.terms,sites:results.sites}:null},[index,keyword,results])
  const updateKeyword=value=>{
    const query=value.trim(),previous=searchHistory.current
    const refining=previous?.index===index&&query.startsWith(previous.query)&&query.length>previous.query.length
    const old=keyword.trim()
    if(old&&(!query.startsWith(old)||query.length<old.length))setSearchRevision(value=>value+1)
    setSearchSource(refining?{terms:previous.terms,sites:previous.sites}:null)
    setKeyword(value);setActive(0)
  }


  /* 可用方向键走的扁平列表，包括新增资源目录的结果。 */
  const candidateOptions = useMemo(() => {
    const list = []
    for (const record of (index?.terms||[])) {
      list.push({ key: `term:${record.id}`, group: 'term', href: record.targetHref||undefined, record })
    }
    for (const record of (index?.sites||[])) {
      list.push({ key: `site:${record.id}`, group: 'site', href: siteHref(record), record })
    }
    for (const record of resources) {
      list.push({ key: `resource:${record.id}`, group: 'resource', href: resourceHref(record), record })
    }
    return list
  }, [index, resources])

  useEffect(()=>{
    const previous=lastComponent.current,query=keyword.trim()
    if(previous&&(!query.startsWith(previous.query)||query.length<previous.query.length))lastComponent.current=null
    if(!query)return
    const controller=new AbortController()
    const timer=setTimeout(async()=>{
      const prior=lastComponent.current
      const refineToken=prior&&query.startsWith(prior.query)&&query.length>prior.query.length?prior.token:null
      try {
        let response,data
        for(let attempt=0;attempt<3;attempt++){
          response=await fetch('/api/discovery/search',{method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,body:JSON.stringify({query,scope:'curation',theme:'',refineToken})})
          data=await response.json()
          if(response.status!==429||data.error!=='MODEL_BUSY')break
          await new Promise(resolve=>setTimeout(resolve,300*(attempt+1)))
        }
        if(!response.ok||data.scope!=='curation'||data.theme!=='')throw Error('COMPONENT_SEARCH_UNAVAILABLE')
        if(!controller.signal.aborted){lastComponent.current={query,token:data.refineToken};setComponentResponse({query:keyword,data})}
      }catch{if(!controller.signal.aborted)setComponentResponse({query:keyword,data:{mode:'error',units:[]}})}
    },850)
    return()=>{clearTimeout(timer);controller.abort()}
  },[keyword])

  const jev = useJevSearch(keyword,candidateOptions,'global',searchRevision)
  const currentComponents=componentResponse?.query===keyword?componentResponse.data:null
  const componentOptions=(currentComponents?.units||[]).filter(unit=>unit.kind==='website-component').slice(0,GROUP_LIMIT).map(record=>({key:`component:${record.id}`,group:'component',href:`#/?q=${encodeURIComponent(record.nameZh)}`,record}))
  const options=keyword.trim()?[...jev.items,...componentOptions]:[]
  const listOpen = keyword.trim().length > 0
  const listId = `${domId}-listbox`
  const activeId = options[active] ? `${domId}-opt-${active}` : undefined

  const closeAll = () => {
    searchHistory.current=null
    setSearchSource(null)
    setSearchRevision(value=>value+1)
    setKeyword('')
    setOpen(false)
  }

  const runOption = (option) => {
    if (!option) return
    navigate(option.href||(option.group==='term'?termHref(option.record,keyword.trim()):'#/'))
    setKeyword('')
    setOpen(false)
    inputRef.current?.blur()
  }

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      if (keyword) setKeyword('')
      else closeAll()
      return
    }
    if (!listOpen || options.length === 0) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((current) => (current + 1) % options.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((current) => (current - 1 + options.length) % options.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      runOption(options[active])
    }
  }

  const renderGroup = (group, headingZh, headingCount) => {
    const members = options.filter((option) => option.group === group)
    if (members.length === 0) return null
    const headingId = `${domId}-${group}-heading`
    return (
      <div className="gs-group" role="group" aria-labelledby={headingId}>
        <p id={headingId} className="gs-group-h">
          <span>{headingZh}</span>
          <em className="x-mono">{headingCount}</em>
        </p>
        {members.map((option) => {
          const position = options.indexOf(option)
          return (
            <a
              key={option.key}
              id={`${domId}-opt-${position}`}
              className={`gs-opt ${position === active ? 'on' : ''}`}
              role="option"
              aria-selected={position === active}
              href={option.href||(option.group==='term'?termHref(option.record,keyword.trim()):'#/')}
              tabIndex={-1}
              onMouseEnter={() => setActive(position)}
              onClick={(event) => { event.preventDefault(); runOption(option) }}
            >
              {option.all !== undefined ? (
                <span className="gs-opt-all">查看全部 {option.all} 条 →</span>
              ) : option.group === 'term' ? (
                <>
                  <b>{option.record.termZhFix || option.record.termZh || option.record.termEn}</b>
                  <code className="x-mono">{option.record.termEn}</code>
                  <em>{option.record.matchReasons?.length ? '命中：' + option.record.matchReasons.join(' / ') : (option.record.stageTitleZh ? `${option.record.stageTitleZh} · 已入台` : '未入台')}</em>
                </>
              ) : option.group === 'component' ? (<><b>{option.record.nameZh}</b><em>具体组件 · 已核验</em></>) : option.group === 'resource' ? (
                <>
                  <b>{option.record.title ?? option.record.zh}</b>
                  <code className="x-mono">{option.record.category === 'atlas' ? '图鉴 · 构图与排版' : RESOURCE_SECTIONS[option.record.category]?.titleZh ?? option.record.category}</code>
                  <em>{option.record.descriptionZh ?? option.record.dz}</em>
                </>
              ) : (
                <>
                  <b>{option.record.name}</b>
                  <code className="x-mono">{option.record.domain || '域名未知'}</code>
                  <em>{option.record.matchReasons?.length ? '命中：' + option.record.matchReasons.join(' / ') : (option.record.takeawayZh || '未写')}</em>
                </>
              )}
            </a>
          )
        })}
      </div>
    )
  }

  return (
    <div className={`gs ${open ? 'open' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="gs-toggle"
        aria-label={open ? '收起搜索' : '打开搜索'}
        aria-expanded={open}
        onClick={() => {
          const next = !open
          setOpen(next)
          if (next) { ensureIndex(); window.setTimeout(() => inputRef.current?.focus(), 0) }
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="5.25" stroke="currentColor" strokeWidth="1.4" />
          <path d="M12 12L16 16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>

      <div className="gs-field">
        <span className="gs-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
            <circle cx="8" cy="8" r="5.25" stroke="currentColor" strokeWidth="1.4" />
            <path d="M12 12L16 16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="text"
          className="gs-input"
          role="combobox"
          aria-label={t('search')}
          aria-expanded={listOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          autoComplete="off"
          placeholder={t('search')}
          value={keyword}
          onFocus={ensureIndex}
          onChange={(event) => updateKeyword(event.target.value)}
          onKeyDown={onKeyDown}
        />
        <kbd className="gs-kbd x-mono">⌘K</kbd>
      </div>

      <div
        id={listId}
        className="gs-list"
        role="listbox"
        aria-label="搜索结果"
        hidden={!listOpen}
      >
        {keyword.trim()&&<p className="gs-note" role="status">{jev.status}</p>}
        {currentComponents?.mode==='error'&&<p className="gs-note" role="status">组件 Jev 暂不可用，请重试。</p>}
        {loadState === 'loading' && <p className="gs-note">正在加载语料…</p>}
        {loadState === 'error' && <p className="gs-note" role="alert">语料没能加载，搜索暂不可用。</p>}
        {loadState === 'ready' && jev.mode==='jev' && options.length === 0 && (
          <p className="gs-note">没有命中。图鉴、站点库与创作资源都没有匹配的条目。</p>
        )}
        {loadState === 'ready' && (results.termUncertain || results.siteUncertain) && (
          <p className="gs-note" role="status">信息不足，请从候选中选择。</p>
        )}
        {renderGroup('term', '图鉴里的', options.filter(option=>option.group==='term').length)}
        {renderGroup('component','组件',options.filter(option=>option.group==='component').length)}
        {renderGroup('site', '站点库里的', options.filter(option=>option.group==='site').length)}
        {renderGroup('resource', '创作资源', options.filter(option=>option.group==='resource').length)}
      </div>
    </div>
  )
}
