// Transport-free core of /api/discovery/*. The local Vite middleware and the
// static production build (src/lib/static-discovery-api.js) run this same code,
// so search behaviour cannot drift between them. No Node built-ins here.
import { browseComponents } from './discovery-browse.mjs'
import { fnvDigest } from './fnv-digest.mjs'
import { DISCOVERY_SCOPES, inTheme } from '../src/lib/discovery-scopes.js'
import { createRefinementStore, createProvisionalSearchStore, projectDiscoveryCard, selectDiscoveryCandidates, summarizeDiscoveryIndex } from './discovery-refinement.mjs'

export const RANK_SCOPES=Object.freeze(['global','site-list','resource-list','atlas-terms'])
export const MAX_BODY_BYTES=Object.freeze({rank:512000,other:1500000})

const searchLimitOf=units=>units.length&&units.every(unit=>unit.kind==='image-prompt')?50:32

// Wraps a scope loader with the per-theme views the handler needs.
// `stampOf(scope)` lets a caller invalidate when its source files change.
export function createIndexContexts(loader,{stampOf=async()=>''}={}) {
  const cache=new Map()
  return async function getIndex(scope,theme='') {
    if(!Object.hasOwn(DISCOVERY_SCOPES,scope))throw new Error('INVALID_SCOPE')
    const stamp=await stampOf(scope),cached=cache.get(scope)
    let base
    if(cached?.stamp===stamp)base=await cached.promise
    else {
      const promise=loader(scope).then(index=>({index,byId:new Map(index.units.map(unit=>[unit.id,unit])),searchLimit:searchLimitOf(index.units),summary:summarizeDiscoveryIndex(index),topics:new Map()}))
      cache.set(scope,{stamp,promise})
      try{base=await promise}catch(error){if(cache.get(scope)?.promise===promise)cache.delete(scope);throw error}
    }
    if(!theme)return base
    if(!base.index.themes.includes(theme))throw new Error('INVALID_THEME')
    if(!base.topics.has(theme)) {
      const units=base.index.units.filter(unit=>inTheme(unit,theme))
      const index={...base.index,theme,units,counts:{indexedInstances:units.length,reviewedCaptures:units.filter(unit=>unit.verification==='capture-v2-reviewed').length}}
      base.topics.set(theme,{index,byId:new Map(units.map(unit=>[unit.id,unit])),searchLimit:searchLimitOf(units),summary:summarizeDiscoveryIndex(index)})
    }
    return base.topics.get(theme)
  }
}

const reply=(status,body)=>({status,body})
const indexError=error=>reply(/^INVALID_/.test(error.message)?400:503,{error:/^INVALID_/.test(error.message)?error.message:'INDEX_UNAVAILABLE'})
const MODEL_ERRORS=/^(JEV_HTTP_\d+|JEV_TUNNEL_DISCONNECTED|JEV_CONFIG_INVALID|JEV_CONFIG_UNAVAILABLE|JEV_DISABLED|JEV_QUEUE_TIMEOUT|MODEL_BUSY|FREE_MODEL_COST_CHANGED|UNEXPECTED_MODEL|INVALID_MODEL_SCORE|INVALID_MODEL_RESPONSE|LOCAL_CREDENTIAL_UNAVAILABLE|RANK_DAILY_LIMIT|RANK_RATE_LIMITED|RANK_UNAVAILABLE|INVALID_SCOPE|INVALID_THEME)$/

/**
 * @param {object} deps
 * @param {(scope:string,theme?:string)=>Promise<object>} deps.getIndex  from createIndexContexts
 * @param {(query:string,candidates:{unit:object}[],opts:{signal:AbortSignal})=>Promise<object>} deps.ranker
 * @param {()=>Promise<object>} [deps.statusReader]
 * @param {(cards:object[])=>Promise<object[]>} [deps.hydrate]  fills card fields a slim index left out
 * @returns handle({method,pathname,params,body,contentType,signal,closed}) → {status,body} | null (client gone)
 */
export function createDiscoveryHandler({getIndex,ranker,statusReader=async()=>({}),hydrate=async cards=>cards}) {
  const modelFlights=new Map()
  const cache=new Map()
  const refinements=createRefinementStore()
  const provisional=createProvisionalSearchStore()
  const cards=units=>hydrate(units.map(projectDiscoveryCard))

  return async function handle({method,pathname,params=new URLSearchParams(),body='',contentType='',signal,closed=()=>false}) {
    if(pathname==='/api/discovery/component-drafts')return reply(404,{error:'NOT_FOUND'})
    if(pathname==='/api/discovery/status'&&method==='GET')return reply(200,await statusReader())
    if(pathname==='/api/discovery/index'&&method==='GET') {
      try{const snapshot=await getIndex(params.get('scope'),params.get('theme')||'');return reply(200,params.get('summary')==='1'?snapshot.summary:snapshot.index)}
      catch(error){return indexError(error)}
    }
    if(pathname==='/api/discovery/browse'&&method==='GET') {
      try {
        const {index}=await getIndex('curation','')
        const result=browseComponents(index,{source:params.get('source')||'',type:params.get('type')||'',q:params.get('q')||'',page:Number(params.get('page')||1),limit:Number(params.get('limit')||24)})
        return reply(200,{...result,units:await hydrate(result.units)})
      } catch(error){return indexError(error)}
    }
    if(pathname==='/api/discovery/page'&&method==='GET') {
      const offset=Number(params.get('offset')),limit=Number(params.get('limit')||12)
      if(!Number.isSafeInteger(offset)||offset<0||!Number.isSafeInteger(limit)||limit<1||limit>24)return reply(400,{error:'INVALID_PAGE'})
      try {
        const {index,byId}=await getIndex(params.get('scope'),params.get('theme')||'')
        const page=refinements.page(params.get('token'),index,byId,offset,limit,{allowRecordedFilter:true})
        if(!page)return reply(410,{error:'SEARCH_EXPIRED'})
        return reply(200,{scope:index.scope,theme:index.theme,indexVersion:index.generatedAt,offset,total:page.total,eligibleCount:page.eligibleCount,judgedCount:page.judgedCount,confirmedCount:page.confirmedCount,remainingCount:page.remainingCount,units:await cards(page.units)})
      }catch(error){return indexError(error)}
    }
    if(!['/api/discovery/prepare','/api/discovery/search','/api/discovery/rank'].includes(pathname)||method!=='POST')return reply(405,{error:'METHOD_NOT_ALLOWED'})
    if(!String(contentType).startsWith('application/json'))return reply(415,{error:'JSON_REQUIRED'})
    try {
      const request=JSON.parse(body), query=typeof request.query==='string'?request.query.trimStart():''
      if(!query.trim()||query.length>1500)return reply(400,{error:'QUERY_LENGTH',message:'描述需在 1–1500 字符内。'})
      if(pathname==='/api/discovery/rank') {
        if(!RANK_SCOPES.includes(request.scope)||!Array.isArray(request.candidates)||request.candidates.length>60)return reply(400,{error:'INVALID_SCOPE'})
        const candidates=request.candidates.map(unit=>({unit})).filter(({unit})=>typeof unit.id==='string'&&typeof unit.nameZh==='string'&&Array.isArray(unit.tags))
        if(candidates.length!==request.candidates.length)return reply(400,{error:'INVALID_CANDIDATES'})
        if(candidates.some(row=>row.unit.kind==='curated-site')) {
          const published=(await getIndex('curation','')).index;const byId=new Map(published.units.map(unit=>[unit.id.replace(/^site--/,''),unit]))
          for(const row of candidates){const source=byId.get(row.unit.id.replace(/^site:|^site--/,''));if(row.unit.kind==='curated-site'&&source)row.unit={...source,id:row.unit.id}}
        }
        if(!candidates.length)return reply(200,{mode:'empty',rows:[],scope:request.scope})
        const cacheKey=fnvDigest(JSON.stringify({query,scope:request.scope,candidates}))
        const cachedRank=cache.get(cacheKey)
        if(cachedRank&&Date.now()-cachedRank.at<300000)return reply(200,{...cachedRank.result,cached:true})
        const result={...await ranker(query,candidates,{signal}),scope:request.scope,candidateCount:candidates.length}
        if(signal?.aborted||closed())return null
        cache.set(cacheKey,{at:Date.now(),result});if(cache.size>64)cache.delete(cache.keys().next().value)
        return reply(200,result)
      }
      const sessionId=request.sessionId??null,requestId=request.requestId
      if(sessionId!==null&&(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(sessionId)||!Number.isSafeInteger(requestId)||requestId<1))return reply(400,{error:'INVALID_SEARCH_SESSION'})
      if(request.allowedIds!==undefined&&(!Array.isArray(request.allowedIds)||request.allowedIds.length>5000||request.allowedIds.some(id=>typeof id!=='string'||id.length>240||!id.length)))return reply(400,{error:'INVALID_SCOPE_FILTER'})
      const filters=request.filters
      if(filters!==undefined&&(!filters||typeof filters!=='object'||Array.isArray(filters)||request.scope!=='curation'||filters.kind!=='website-component'||Object.keys(filters).some(key=>!['kind','source','type'].includes(key))||['source','type'].some(key=>filters[key]!==undefined&&(typeof filters[key]!=='string'||filters[key].length>253))))return reply(400,{error:'INVALID_SCOPE_FILTER'})
      const loadSearchIndex=async()=>{
        const context=await getIndex(request.scope,request.theme||'')
        if(request.allowedIds===undefined&&!filters)return context
        const allowed=request.allowedIds===undefined?null:new Set(request.allowedIds)
        const units=context.index.units.filter(unit=>{
          if(allowed&&!allowed.has(unit.id))return false
          if(!filters)return true
          if(unit.kind!==filters.kind||filters.type&&(unit.componentType||'component')!==filters.type)return false
          let source=unit.codeResource?.sourceId||'unknown';if(!unit.codeResource?.sourceId)try{source=new URL(unit.sourceUrl).hostname}catch{/* Same fallback as /browse. */}
          return !filters.source||source===filters.source
        })
        const filterKey=fnvDigest(JSON.stringify({ids:units.map(unit=>unit.id).sort(),filters:filters&&{kind:filters.kind,source:filters.source||'',type:filters.type||''}}))
        return {...context,index:{...context.index,units,filterKey},byId:new Map(units.map(unit=>[unit.id,unit]))}
      }
      const responseLimit=request.limit??12
      if(!Number.isSafeInteger(responseLimit)||responseLimit<1||responseLimit>240)return reply(400,{error:'INVALID_PAGE'})
      // New typing cancels obsolete model work before new preparation. This
      // endpoint never calls a model; only explicit, documented facts filter it.
      const older=sessionId?modelFlights.get(sessionId):null
      if(older&&older.requestId<requestId)older.controller.abort()
      let selected
      if(sessionId)selected=await provisional.prepare({sessionId,requestId,query,load:loadSearchIndex,refineToken:request.refineToken,refinements})
      else{const context=await loadSearchIndex();selected={...context,...selectDiscoveryCandidates(query,context.index,context.byId,refinements,request.refineToken,context.searchLimit)}}
      const {index,byId,eligible,candidates,sourceCandidateCount,refinement,resetReason,stale}=selected
      if(stale)return reply(409,{error:'STALE_SEARCH_SESSION'})
      if(closed())return null
      const initialToken=selected.token||refinements.save(query,index,eligible)
      const candidateIds=candidates.map(({unit})=>unit.id)
      const key=fnvDigest(JSON.stringify({indexVersion:index.generatedAt,filterKey:index.filterKey,scope:index.scope,theme:index.theme,query,candidateIds}))
      const metadata={candidateCount:candidates.length,sourceCandidateCount,totalIndexed:index.units.length,indexVersion:index.generatedAt,scope:index.scope,theme:index.theme,refinement,resetReason}
      const respond=async(ranked,token)=>{
        const {rows:_rows,...rest}=ranked
        const page=refinements.page(token,index,byId,0,responseLimit)
        if(sessionId&&!provisional.commit(sessionId,requestId,query,index,token))return reply(409,{error:'STALE_SEARCH_SESSION'})
        return reply(200,{...rest,eligibleCount:page.eligibleCount,judgedCount:page.judgedCount,confirmedCount:page.confirmedCount,
          remainingCount:page.remainingCount,assessmentComplete:page.remainingCount===0,
          matchCount:page.total,units:await cards(page.units),refineToken:token,requestId})
      }
      if(pathname==='/api/discovery/prepare')return respond({mode:eligible.length?'preliminary':'empty',...metadata,candidateCount:0,cost:null},initialToken)
      if(!candidates.length)return respond({mode:eligible.length?'jev':'empty',...metadata,cost:null},initialToken)
      const cached=cache.get(key)
      if(cached&&Date.now()-cached.at<300000)return respond({...cached.result,...metadata,cached:true},refinements.save(query,index,eligible,cached.result.rows,initialToken))
      const previousFlight=sessionId?modelFlights.get(sessionId):null
      if(previousFlight&&previousFlight.requestId<requestId){
        previousFlight.controller.abort()
        await Promise.race([previousFlight.done,new Promise(resolve=>setTimeout(resolve,500))])
      }
      const controller=new AbortController()
      let finishFlight
      const flight={sessionId,requestId,controller,done:new Promise(resolve=>{finishFlight=resolve})}
      const flightKey=sessionId||Symbol()
      modelFlights.set(flightKey,flight)
      const disconnect=()=>controller.abort()
      signal?.addEventListener('abort',disconnect)
      if(signal?.aborted||closed())controller.abort()
      try {
        let ranked
        try{ranked=await ranker(query,candidates,{signal:controller.signal})}
        catch(error){
          // The public rank function is capped; when it is spent or down, keep the
          // explicit-fact results instead of failing the whole search.
          if(!/^RANK_/.test(error.message)||controller.signal.aborted)throw error
          return respond({mode:'preliminary',...metadata,candidateCount:0,cost:null,rankError:error.message,
            message:error.message==='RANK_DAILY_LIMIT'?'今日 AI 精排额度已用完，以下是初筛结果。':error.message==='RANK_RATE_LIMITED'?'请求太频繁，AI 精排稍后再试；以下是初筛结果。':'AI 精排暂不可用，以下是初筛结果。'},initialToken)
        }
        const result={...ranked,...metadata}
        if(controller.signal.aborted||closed())return null
        cache.set(key,{at:Date.now(),result});if(cache.size>64)cache.delete(cache.keys().next().value)
        return respond(result,refinements.save(query,index,eligible,result.rows,initialToken))
      } finally {if(modelFlights.get(flightKey)===flight)modelFlights.delete(flightKey);finishFlight();signal?.removeEventListener('abort',disconnect)}
    } catch(error) {
      if(closed())return null
      // Do not echo upstream payloads, user text, auth paths or credentials.
      const code=MODEL_ERRORS.test(error.message)?error.message:'MODEL_UNAVAILABLE'
      const message=code==='JEV_TUNNEL_DISCONNECTED'?'Jev 未连接（隧道未开），请检查本机到 Kev 的网络连接。':code==='MODEL_BUSY'?'Jev 正在完成其他判断，请稍后重试。':code==='RANK_DAILY_LIMIT'?'今日 AI 精排额度已用完，已显示初筛结果。':code==='RANK_RATE_LIMITED'?'请求太频繁，请稍后再试。':'Jev 暂不可用，请稍后重试；不会切换收费模型。'
      return reply(error instanceof SyntaxError||/^INVALID_(SCOPE|THEME)$/.test(code)?400:['MODEL_BUSY','RANK_RATE_LIMITED'].includes(code)?429:503,{error:code,message})
    }
  }
}
