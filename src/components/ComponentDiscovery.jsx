import { useEffect, useMemo, useRef, useState } from 'react'
import { wantsComponentInstance } from '../lib/component-discovery.js'
import { DISCOVERY_SCOPES, colorSegments, descriptionSections, queryRequirements, offerMatches } from '../lib/discovery-scopes.js'
import { useStore } from '../store.js'
import { CURATION_CATEGORIES } from '../data/curation-taxonomy.js'
import '../styles/discovery.css'

const sessions=new Map()
async function searchWithBusyRetry(payload,signal) {
  for(let attempt=0;attempt<=4;attempt++) {
    if(signal.aborted)throw new Error('SEARCH_ABORTED')
    const res=await fetch('/api/discovery/search',{method:'POST',headers:{'Content-Type':'application/json'},signal,body:JSON.stringify(payload)})
    const data=await res.json()
    if(res.status!==429||data.error!=='MODEL_BUSY'||attempt===4)return {res,data}
    await new Promise(resolve=>setTimeout(resolve,350*(attempt+1)))
  }
}
const THEME_LABELS={shadow:['阴影','Shadow'],loading:['加载动效','Loading'],hover:['悬停交互','Hover'],'grid-study':['网格与比例','Grid studies'],'ui-implementation':['组件与设计系统','UI implementation'],'visual-assets':['视觉素材','Visual assets'],'type-study':['排版研究','Typography studies'],design:['设计规范','Design rules'],image:['生图方法','Image methods']}
const themeLabel=(id,en)=>THEME_LABELS[id]?.[en?1:0]||CURATION_CATEGORIES.find(x=>x.id===id)?.label||id.replaceAll('-',' ')
const external=url=>/^https?:\/\//i.test(url||'')
function ColorText({text}) {
  return colorSegments(text).map((part,i)=>part.color?<span className="discovery-color" key={i}>{part.text}<span className="discovery-swatch" style={{backgroundColor:part.color}} aria-hidden="true"/></span>:part.text)
}
function SourceLink({source,url}) {
  const [failed,setFailed]=useState(false)
  return <a className="discovery-source" href={url} target={external(url)?'_blank':undefined} rel={external(url)?'noreferrer':undefined}>
    {source?.iconUrl&&!failed?<img src={source.iconUrl} alt="" width="18" height="18" loading="lazy" onError={()=>setFailed(true)}/>:<span className="discovery-source-initial" aria-hidden="true">{source?.name?.slice(0,1)||'V'}</span>}
    <span>{source?.name||'VisLexicon'}</span>
  </a>
}
function Offers({offers,en}) {
  if(!offers?.length)return null
  return <div className="discovery-offers">{offers.map(offer=><div key={offer.id}>
    <div className="discovery-offer-badges">
      {['free','partial-free'].includes(offer.access)&&<span>{offer.access==='partial-free'?(en?'Free portion':'有免费部分'):(en?'Free access':'免费使用')}</span>}
      {offer.sourceAvailable&&<a href={offer.sourceUrl} target="_blank" rel="noreferrer">{offer.sourceCost==='free'?(en?'Free source code':'免费源码'):(en?'Source available':'可获取源码')}</a>}
      {offer.license&&<a href={offer.licenseUrl} target="_blank" rel="noreferrer">{offer.license}</a>}
    </div>
    {offer.scope&&!/^(free|免费)[.。\s]*$/iu.test(offer.scope)&&<p><ColorText text={en?(offer.scopeEn||offer.scope):(offer.scopeZh||offer.scope)}/></p>}
  </div>)}</div>
}
function DiscoveryCard({unit,en,pinned,toggle,isPinned,query}) {
  const sections=(en?unit.sectionsEn:unit.sectionsZh)||descriptionSections(en?unit.descriptionEn:unit.descriptionZh)
  const requirements=queryRequirements(query), hasRequirements=Object.values(requirements).some(Boolean)
  const related=(unit.relatedSites||[]).filter(site=>!hasRequirements||(site.offers||[]).some(offer=>offerMatches(requirements,offer)))
  const tags=unit.tags.filter(x=>en?/^[a-z\s-]+$/i.test(x):/\p{Script=Han}/u.test(x)).slice(0,3)
  const tagTone=tag=>['shape','material','color','motion'].some(axis=>unit.tagFacets?.[axis]?.includes(tag))?'style':'comp'
  return <article className="discovery-card">
    {unit.previewUrl&&<div className="discovery-preview">{unit.previewKind==='image'?<img src={unit.previewUrl} alt={en?unit.nameEn:unit.nameZh} loading="lazy"/>:<iframe loading="lazy" sandbox="" src={unit.previewUrl} title={`${en?'Live preview':'实时预览'} · ${en?unit.nameEn:unit.nameZh}`}/>}</div>}
    <div className="discovery-card-body">
      <div className="discovery-card-heading"><div className="discovery-title-line"><h3>{en?unit.nameEn:unit.nameZh}</h3><div className="discovery-tags">{tags.map(tag=><span className={`discovery-tag-${tagTone(tag)}`} key={tag}>{tag}</span>)}</div></div>{toggle&&<button type="button" aria-pressed={pinned} aria-label={`${pinned?(en?'Unpin':'取消保留'):(en?'Pin':'保留')} ${unit.nameZh}`} onClick={()=>toggle(unit.id)}>{pinned?'✓':'+'}</button>}</div>
      <dl className="discovery-description">{sections.map((section,i)=><div key={i}>{section.label&&<dt>{section.label}{en?':':'：'}</dt>}<dd><ColorText text={section.text}/></dd></div>)}</dl>
      {unit.kind==='image-prompt'&&unit.detailUrl&&<a className="discovery-source" href={unit.detailUrl}>{unit.resourceType==='skill'?(en?'View Skill & examples':'查看 Skill 与效果'):(en?'View & copy prompt':'查看并复制提示词')}</a>}
      {unit.kind==='atlas-effect'?<div className="discovery-related">
        <p className="discovery-related-label">{en?'Original websites with this pattern':'包含这类效果的原网站'}</p>
        {related.length?related.map(site=><div className="discovery-related-site" key={`${site.entryId}/${site.url}`}><SourceLink source={site} url={site.url}/>{site.noteZh&&<p>{en?(site.noteEn||site.noteZh):site.noteZh}</p>}<Offers offers={site.offers} en={en}/></div>):<p className="discovery-related-empty">{en?'No original website has been verified for this example yet.':'这个实例的原网站关联还在补充。'}</p>}
      </div>:<><SourceLink source={unit.source} url={unit.sourceUrl}/>{unit.kind==='website-component'&&!unit.offers?.length?<p className="discovery-related-empty">{en?'Access, source code and license await verification.':'获取方式、源码与许可待核验。'}</p>:<Offers offers={unit.offers} en={en}/>}</>}
      {isPinned&&<span className="discovery-pin-note">{en?'Kept in this topic':'已保留在当前主题'}</span>}
    </div>
  </article>
}
function SearchSession({index,scope,theme,en,reload,initialQuery}) {
  const sessionKey=`${scope}/${theme}`, saved=sessions.get(sessionKey), initial=saved?.indexVersion===index.generatedAt?saved:{query:saved?.query||'',pinnedCards:[]}
  const [query,setQuery]=useState(initialQuery||initial.query),[pinnedCards,setPinnedCards]=useState(initial.pinnedCards||[]),[composing,setComposing]=useState(false)
  const [response,setResponse]=useState(null),[status,setStatus]=useState('idle'),[retry,setRetry]=useState(0),[expanded,setExpanded]=useState(true)
  const [loadingMore,setLoadingMore]=useState(false),[pageError,setPageError]=useState(false)
  const sequence=useRef(0),lastCompleted=useRef(null),knownUnits=useRef(new Map((initial.pinnedCards||[]).map(unit=>[unit.id,unit]))),versionSeen=useRef(index.generatedAt),config=DISCOVERY_SCOPES[scope]
  const topic=index.themeMeta?.[theme]||index.themeMeta?.['']||{count:0,componentCount:0,curatedSiteCount:0,examples:[]}
  useEffect(()=>{sessions.set(sessionKey,{query,pinnedCards,indexVersion:index.generatedAt})},[sessionKey,query,pinnedCards,index.generatedAt])
  useEffect(()=>{
    if(versionSeen.current===index.generatedAt)return
    versionSeen.current=index.generatedAt;lastCompleted.current=null;knownUnits.current.clear();setPinnedCards([]);setResponse(null);setStatus(query.trim()?'waiting':'idle')
  },[index.generatedAt,query])
  const updateQuery=value=>{
    const previous=lastCompleted.current
    if(previous&&(!value.startsWith(previous.query)||value.length<previous.query.length))lastCompleted.current=null
    setQuery(value);setResponse(null);setStatus(value.trim()?'waiting':'idle');setExpanded(true);setPageError(false)
  }
  useEffect(()=>{
    const version=++sequence.current,controller=new AbortController()
    if(!query.trim()||composing)return()=>controller.abort()
    const timer=setTimeout(async()=>{
      setStatus('ranking')
      try {
        const previous=lastCompleted.current
        const refineToken=previous?.indexVersion===index.generatedAt&&query.startsWith(previous.query)&&query.length>previous.query.length?previous.token:null
        const {res,data}=await searchWithBusyRetry({query,scope,theme,requestId:version,refineToken},controller.signal)
        if(!res.ok)throw new Error(data.error||'MODEL_UNAVAILABLE')
        if(version!==sequence.current||controller.signal.aborted)return
        if(data.scope!==scope||data.theme!==theme)throw new Error('SCOPE_MISMATCH')
        if(data.indexVersion!==index.generatedAt){reload();return}
        for(const unit of data.units||[])knownUnits.current.set(unit.id,unit)
        lastCompleted.current={query,token:data.refineToken,indexVersion:data.indexVersion}
        setResponse({...data,query});setStatus('ready')
      }catch{if(!controller.signal.aborted&&version===sequence.current)setStatus('fallback')}
    },850)
    return()=>{clearTimeout(timer);controller.abort()}
  },[query,index,scope,theme,composing,retry,reload])
  const currentResponse=response?.query===query?response:null
  const ranked=currentResponse?.mode==='jev'?currentResponse.units||[]:[]
  const pinned=pinnedCards
  const toggle=id=>setPinnedCards(old=>old.some(unit=>unit.id===id)?old.filter(unit=>unit.id!==id):[...old,knownUnits.current.get(id)].filter(Boolean).slice(-8))
  const card=(unit,isPinned=false)=><DiscoveryCard key={unit.id} unit={unit} en={en} pinned={pinnedCards.some(x=>x.id===unit.id)} toggle={toggle} isPinned={isPinned} query={query}/>
  const examples=theme?topic.examples:index.examples
  const componentQuery=scope==='curation'&&wantsComponentInstance(query)
  const componentCount=topic.componentCount
  const hint=status==='ranking'||status==='waiting'?(en?'Comparing within this topic…':'正在当前主题内比较…'):status==='ready'?(currentResponse?.mode==='empty'?(en?'No eligible candidates':'没有符合条件的候选'):(en?`Jev · ${currentResponse?.candidateCount} candidates compared`:`Jev 已比较 ${currentResponse?.candidateCount} 个候选`)):status==='fallback'?(en?'Jev is temporarily unavailable':'Jev 暂不可用'):(en?`${topic.count} entries in this topic`:`当前主题可检索 ${topic.count} 条`)
  const loadMore=async()=>{
    if(!currentResponse||loadingMore)return
    const token=currentResponse.refineToken,offset=currentResponse.units.length,responseQuery=currentResponse.query
    setLoadingMore(true);setPageError(false)
    try {
      const params=new URLSearchParams({scope,theme,token,offset:String(offset),limit:'12'})
      const res=await fetch(`/api/discovery/page?${params}`),data=await res.json()
      if(!res.ok||data.scope!==scope||data.theme!==theme||data.indexVersion!==index.generatedAt||data.offset!==offset)throw new Error('PAGE_UNAVAILABLE')
      for(const unit of data.units)knownUnits.current.set(unit.id,unit)
      setResponse(old=>old?.refineToken===token&&old.query===responseQuery?{...old,units:[...old.units,...data.units]}:old)
    }catch{setPageError(true)}finally{setLoadingMore(false)}
  }
  return <>
    <div className="discovery-input-wrap"><textarea id={`discovery-query-${scope}`} aria-label={en?`Search ${config.en}`:`搜索${config.zh}`} value={query} maxLength={1500} rows={2} onChange={e=>updateQuery(e.target.value)} onCompositionStart={()=>setComposing(true)} onCompositionEnd={()=>setComposing(false)} placeholder={en?config.promptEn:config.promptZh} aria-describedby={`discovery-hint-${scope}`}/><button className="discovery-clear" type="button" onClick={()=>updateQuery('')} hidden={!query}>{en?'Clear':'清空'}</button></div>
    <div className="discovery-under"><span id={`discovery-hint-${scope}`} role="status" aria-live="polite">{hint}{currentResponse?.mode==='jev'?(en?` · ${currentResponse.matchCount} matches`:` · ${currentResponse.matchCount} 条匹配`):''}{String(currentResponse?.cost)==='0'?' · Free':''}</span><span>{en?'Only this topic. Refine freely.':'仅检索当前主题，随时修改描述。'}</span></div>
    {scope==='curation'&&<p className="discovery-notice">{en?`${topic.curatedSiteCount} website entries · ${componentCount} published components`:`${topic.curatedSiteCount} 个网站入口 · ${componentCount} 个已发布组件`}</p>}
    {!query&&examples?.length>0&&<div className="discovery-examples">{examples.map(example=><button key={example} type="button" onClick={()=>updateQuery(example)}>{example}</button>)}</div>}
    {status==='fallback'&&<p className="discovery-notice">{en?'Jev is unavailable. Results are not presented as semantic matches.':'Jev 暂不可用，请重试；不显示未经 Jev 判断的搜索结果。'} <button type="button" onClick={()=>setRetry(x=>x+1)}>{en?'Retry Jev':'重试 Jev'}</button></p>}
    {pinned.length>0&&<div className="discovery-pins"><h2>{en?'Kept in this topic':'当前主题保留的方向'} <small>{pinned.length}/8</small></h2><div className="discovery-grid">{pinned.map(unit=>card(unit,true))}</div></div>}
    {query.trim()&&<div className="discovery-results" aria-busy={status==='ranking'}><div className="discovery-results-heading"><h2>{en?config.en:config.zh} <small>{en?'Matches':'匹配结果'}</small></h2><button type="button" aria-expanded={expanded} onClick={()=>setExpanded(x=>!x)}>{expanded?(en?'Collapse':'收起结果'):(en?'Expand':'展开结果')}</button></div>
      {expanded&&(ranked.length?<div className="discovery-grid">{ranked.map(unit=>card(unit))}</div>:<p className="discovery-empty">{componentQuery&&!componentCount?(en?'No verified component instances are published in this topic yet. Website introductions cannot establish a specific button’s appearance or motion.':'当前主题尚无已发布的组件实例。网站介绍不能证明某一个按钮的外观和动效。'):status==='ranking'||status==='waiting'?(en?'Understanding your description…':'正在理解这段描述…'):(en?'No supported match in this topic yet.':'当前主题还没有证据充分的匹配。')}</p>)}
    </div>}
    {expanded&&currentResponse?.mode==='jev'&&query.trim()&&ranked.length<currentResponse.matchCount&&<button type="button" onClick={loadMore} disabled={loadingMore}>{pageError?(en?'Retry loading':'重试加载'):(en?'Show more components':'查看更多组件')}</button>}
  </>
}
export default function ComponentDiscovery({scope='curation',fixedTheme='',initialQuery=''}) {
  const {locale}=useStore(),en=locale==='en',config=DISCOVERY_SCOPES[scope]
  const [index,setIndex]=useState(null),[error,setError]=useState(false),[theme,setTheme]=useState(''),[revision,setRevision]=useState(0)
  const reload=useMemo(()=>()=>setRevision(x=>x+1),[])
  useEffect(()=>{let live=true,version=0;const refresh=()=>{const current=++version;fetch(`/api/discovery/index?scope=${scope}&summary=1`,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('index');return r.json()}).then(data=>{if(live&&current===version&&data.scope===scope){setIndex(data);setError(false)}}).catch(()=>{if(live&&current===version)setError(true)})};refresh();window.addEventListener('focus',refresh);return()=>{live=false;window.removeEventListener('focus',refresh)}},[scope,revision])
  const activeTheme=fixedTheme || (index?.themes.includes(theme)?theme:'')
  return <section className="discovery" aria-label={en?`${config.en} discovery`:`${config.zh}检索`}>
    <div className="discovery-heading"><label htmlFor={`discovery-query-${scope}`}>{en?`Find in ${config.en}`:`在${config.zh}里寻找`}</label><span className="discovery-eyebrow">Jev</span></div>
    {!fixedTheme&&index?.themes.length>1&&<label className="discovery-theme">{en?'Topic':'主题'}<select value={activeTheme} onChange={e=>setTheme(e.target.value)}><option value="">{en?'All in this section':'本栏全部'}</option>{index.themes.map(id=><option key={id} value={id}>{themeLabel(id,en)}</option>)}</select></label>}
    {error?<p className="discovery-notice">{en?'Index unavailable.':'索引暂未读到。'} <button onClick={reload}>{en?'Retry':'重试'}</button></p>:index?<SearchSession key={`${scope}/${activeTheme}/${initialQuery}`} initialQuery={initialQuery} index={index} scope={scope} theme={activeTheme} en={en} reload={reload}/>:<p role="status">{en?'Loading this section…':'读取当前栏目…'}</p>}
  </section>
}
