import crypto from 'node:crypto'
import { applyModelRanking, discoveryCandidatePool, canRefineQuery } from '../src/lib/component-discovery.js'

const sameContext=(record,index)=>record.scope===index.scope&&record.theme===index.theme&&record.indexVersion===index.generatedAt&&(record.filterKey||'')===(index.filterKey||'')

// Immutable snapshots retain every hard-constraint-eligible ID. Model rejects
// affect the displayed results for this exact query, never future recall.
export function createRefinementStore({maxEntries=512}={}) {
  const snapshots=new Map()
  function get(token,index) {
    const record=snapshots.get(token)
    if(!record||!sameContext(record,index))return null
    snapshots.delete(token);snapshots.set(token,record)
    return record
  }
  function resolve(token,query,index) {
    if(!token)return {mode:'initial'}
    const snapshot=snapshots.get(token)
    if(!snapshot)return {mode:'reset',reason:'expired'}
    if(!sameContext(snapshot,index))return {mode:'reset',reason:'index-or-topic-changed'}
    if(query===snapshot.query)return {mode:'continued',ids:snapshot.eligibleIds,snapshot}
    if(!canRefineQuery(snapshot.query,query))return {mode:'reset',reason:'query-changed'}
    get(token,index)
    return {mode:'refined',ids:snapshot.eligibleIds,previousQuery:snapshot.query}
  }
  function save(query,index,eligible,rows=[],previousToken=null) {
    const previous=previousToken&&get(previousToken,index)
    const eligibleIds=[...new Set(eligible.map(row=>(row.unit||row).id))]
    const valid=new Set(eligibleIds)
    const judgments=new Map(previous?.query===query?previous.judgments:[])
    for(const row of applyModelRanking(query,eligible.map(row=>row.unit||row),rows))judgments.set(row.unit.id,{score:row.score,confidence:row.confidence})
    // Invalid/foreign IDs and incomplete model responses never become judgments.
    for(const id of judgments.keys())if(!valid.has(id))judgments.delete(id)
    const confirmed=eligibleIds.filter(id=>(judgments.get(id)?.score??-1)>=1.4)
      .sort((a,b)=>judgments.get(b).score-judgments.get(a).score)
    const pending=eligibleIds.filter(id=>!judgments.has(id))
    const token=crypto.randomBytes(16).toString('hex')
    snapshots.set(token,{query,scope:index.scope,theme:index.theme,indexVersion:index.generatedAt,filterKey:index.filterKey||'',
      eligibleIds,judgments,ids:[...confirmed,...pending],confirmedCount:confirmed.length,
      candidateDigest:crypto.createHash('sha256').update(JSON.stringify(eligibleIds)).digest('hex')})
    while(snapshots.size>maxEntries)snapshots.delete(snapshots.keys().next().value)
    return token
  }
  function batch(token,index,byId,limit=32) {
    const record=get(token,index)
    if(!record)return []
    return record.eligibleIds.filter(id=>!record.judgments.has(id)).slice(0,limit).map(id=>byId.get(id)).filter(Boolean).map(unit=>({unit}))
  }
  function page(token,index,byId,offset=0,limit=12,{allowRecordedFilter=false}={}) {
    const recorded=snapshots.get(token)
    const snapshot=get(token,allowRecordedFilter?{...index,filterKey:recorded?.filterKey}:index)
    if(!snapshot)return null
    return {total:snapshot.ids.length,eligibleCount:snapshot.eligibleIds.length,judgedCount:snapshot.judgments.size,
      confirmedCount:snapshot.confirmedCount,remainingCount:snapshot.eligibleIds.length-snapshot.judgments.size,
      units:snapshot.ids.slice(offset,offset+limit).map(id=>byId.get(id)).filter(Boolean).map(unit=>({...unit,matchStatus:snapshot.judgments.has(unit.id)?'confirmed':'preliminary'}))}
  }
  return {resolve,save,page,batch,get}
}

// Per-session preparation is ordered even with a cold index. The only stored
// boundary is a full eligible snapshot, never a model batch or visible page.
export function createProvisionalSearchStore({maxEntries=256}={}) {
  const sessions=new Map(),tails=new Map()
  const remember=(id,record)=>{sessions.delete(id);sessions.set(id,record);while(sessions.size>maxEntries)sessions.delete(sessions.keys().next().value)}
  async function prepare({sessionId,requestId,query,load,refineToken,refinements}) {
    const preceding=tails.get(sessionId)||Promise.resolve()
    const operation=preceding.catch(()=>{}).then(async()=>{
      const context=await load(),{index,byId,searchLimit}=context
      const prior=sessions.get(sessionId)
      if(prior&&(requestId<prior.requestId||(requestId===prior.requestId&&(prior.query!==query||!sameContext(prior,index)))))return {stale:true}
      if(prior&&sameContext(prior,index)&&prior.query===query&&refinements.get(prior.token,index)) {
        const record={...prior,requestId}
        remember(sessionId,record)
        return {...context,candidates:refinements.batch(record.token,index,byId,searchLimit),eligible:refinements.get(record.token,index).eligibleIds.map(id=>({unit:byId.get(id)})).filter(row=>row.unit),
          sourceCandidateCount:record.sourceCandidateCount,refinement:record.refinement,resetReason:record.resetReason,token:record.token}
      }
      const selected=selectDiscoveryCandidates(query,index,byId,refinements,prior?.token||refineToken,searchLimit)
      const token=selected.token||refinements.save(query,index,selected.eligible)
      remember(sessionId,{requestId,query,scope:index.scope,theme:index.theme,indexVersion:index.generatedAt,filterKey:index.filterKey||'',token,
        sourceCandidateCount:selected.sourceCandidateCount,refinement:selected.refinement,resetReason:selected.resetReason})
      return {...context,...selected,token}
    })
    const tail=operation.then(()=>{},()=>{});tails.set(sessionId,tail)
    try{return await operation}finally{if(tails.get(sessionId)===tail)tails.delete(sessionId)}
  }
  function commit(sessionId,requestId,query,index,token) {
    const record=sessions.get(sessionId)
    if(!record||record.requestId!==requestId||record.query!==query||!sameContext(record,index))return false
    record.token=token;remember(sessionId,record);return true
  }
  return {prepare,commit}
}

export function selectDiscoveryCandidates(query,index,byId,store,token,limit=32) {
  const refinement=store.resolve(token,query,index)
  if(refinement.mode==='continued')return {candidates:store.batch(token,index,byId,limit),eligible:refinement.ids.map(id=>({unit:byId.get(id)})).filter(row=>row.unit),
    sourceCandidateCount:refinement.ids.length,refinement:'continued',resetReason:null,token}
  const source=refinement.mode==='refined'?refinement.ids.map(id=>byId.get(id)).filter(Boolean):index.units
  const eligible=discoveryCandidatePool(query,source)
  return {candidates:eligible.slice(0,limit),eligible,sourceCandidateCount:source.length,refinement:refinement.mode,resetReason:refinement.reason||null}
}

// Card payloads exclude the large measured/search-only fields. Ranking and
// explicit constraints have already been applied on the server.
export function projectDiscoveryCard(unit) {
  const { id, kind, nameZh, nameEn, descriptionZh, descriptionEn, sectionsZh, sectionsEn,
    previewUrl, previewKind, source, sourceUrl, offers, relatedSites, tags, tagFacets,
    detailUrl, resourceType, matchStatus } = unit
  return { id, kind, nameZh, nameEn, descriptionZh, descriptionEn, sectionsZh, sectionsEn,
    previewUrl, previewKind, source, sourceUrl, offers, relatedSites, tags, tagFacets,
    detailUrl, resourceType, matchStatus }
}

export function summarizeDiscoveryIndex(index) {
  const meta = new Map([['', { count: 0, componentCount: 0, curatedSiteCount: 0, examples: [] }]])
  for (const theme of index.themes) meta.set(theme, { count: 0, componentCount: 0, curatedSiteCount: 0, examples: [] })
  for (const unit of index.units) {
    const themes = new Set(['', unit.theme, ...(unit.themes || [])].filter(theme => theme !== undefined && theme !== null))
    for (const theme of themes) {
      const row = meta.get(theme)
      if (!row) continue
      row.count++
      if (unit.kind === 'website-component') row.componentCount++
      if (unit.kind === 'curated-site') row.curatedSiteCount++
      for (const example of unit.exampleQueries || []) {
        if (row.examples.length >= 4) break
        if (!row.examples.includes(example)) row.examples.push(example)
      }
    }
  }
  return {
    schemaVersion: index.schemaVersion,
    generatedAt: index.generatedAt,
    scope: index.scope,
    theme: index.theme,
    themes: index.themes,
    counts: index.counts,
    examples: index.examples,
    examplesEn: index.units.map(unit => unit.nameEn).filter(name => name && !/\p{Script=Han}/u.test(name)).slice(0, 4),
    themeMeta: Object.fromEntries([...meta].map(([theme, row]) => [theme, { ...row, examplesEn: index.units.filter(unit => !theme || unit.theme === theme || unit.themes?.includes(theme)).map(unit => unit.nameEn).filter(name => name && !/\p{Script=Han}/u.test(name)).slice(0, 4) }])),
  }
}
