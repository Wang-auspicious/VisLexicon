import crypto from 'node:crypto'
import { applyModelRanking, rerankPool } from '../src/lib/component-discovery.js'

// A search response keeps the full qualified set, including matches beyond the
// first page of cards. The browser only carries a short, opaque handle.
export function createRefinementStore({ maxEntries = 512 } = {}) {
  const snapshots = new Map()

  function resolve(token, query, index) {
    if (!token) return { mode: 'initial' }
    const snapshot = snapshots.get(token)
    if (!snapshot) return { mode: 'reset', reason: 'expired' }
    if (snapshot.scope !== index.scope || snapshot.theme !== index.theme || snapshot.indexVersion !== index.generatedAt) {
      return { mode: 'reset', reason: 'index-or-topic-changed' }
    }
    if (!query.startsWith(snapshot.query) || query.length <= snapshot.query.length) {
      return { mode: 'reset', reason: 'query-changed' }
    }
    snapshots.delete(token)
    snapshots.set(token, snapshot)
    return { mode: 'refined', ids: snapshot.ids, previousQuery: snapshot.query }
  }

  function save(query, index, candidates, rows) {
    const ids = applyModelRanking(query, candidates.map(row => row.unit), rows)
      .filter(row => row.score >= 1.4)
      .map(row => row.unit.id)
    const token = crypto.randomBytes(16).toString('hex')
    const candidateDigest = crypto.createHash('sha256').update(JSON.stringify(ids)).digest('hex')
    snapshots.set(token, { query, scope: index.scope, theme: index.theme, indexVersion: index.generatedAt, ids, candidateDigest })
    while (snapshots.size > maxEntries) snapshots.delete(snapshots.keys().next().value)
    return token
  }

  function page(token, index, byId, offset = 0, limit = 12) {
    const snapshot = snapshots.get(token)
    if (!snapshot || snapshot.scope !== index.scope || snapshot.theme !== index.theme || snapshot.indexVersion !== index.generatedAt) return null
    snapshots.delete(token)
    snapshots.set(token, snapshot)
    return {
      total: snapshot.ids.length,
      units: snapshot.ids.slice(offset, offset + limit).map(id => byId.get(id)).filter(Boolean),
    }
  }

  return { resolve, save, page }
}

// A model request may still be pending when the next keystroke is sent. Keep
// its selected IDs server-side before ranking, so the next prefix only searches
// that bounded scope. Per-session preparation is ordered even on a cold index.
export function createProvisionalSearchStore({maxEntries=256}={}) {
  const sessions=new Map(),tails=new Map()
  const sameContext=(record,index)=>record.scope===index.scope&&record.theme===index.theme&&record.indexVersion===index.generatedAt
  const remember=(sessionId,record)=>{
    sessions.delete(sessionId);sessions.set(sessionId,record)
    while(sessions.size>maxEntries)sessions.delete(sessions.keys().next().value)
  }
  async function prepare({sessionId,requestId,query,load,refineToken,refinements}) {
    const preceding=tails.get(sessionId)||Promise.resolve()
    const operation=preceding.catch(()=>{}).then(async()=>{
      const {index,byId,searchLimit}=await load()
      const prior=sessions.get(sessionId)
      if(prior&&requestId<prior.requestId)return {stale:true}
      if(prior&&requestId===prior.requestId){
        if(prior.query!==query||!sameContext(prior,index))return {stale:true}
        return {index,byId,searchLimit,candidates:prior.selectedIds.map(id=>byId.get(id)).filter(Boolean).map(unit=>({unit})),sourceCandidateCount:prior.sourceCandidateCount,refinement:prior.refinement,resetReason:prior.resetReason}
      }
      let candidates,sourceCandidateCount,refinement,resetReason=null
      if(prior&&sameContext(prior,index)&&query.startsWith(prior.query)&&query.length>prior.query.length){
        const ids=prior.matchIds??prior.selectedIds
        const source=ids.map(id=>byId.get(id)).filter(Boolean)
        candidates=rerankPool(query,source,searchLimit)
        sourceCandidateCount=source.length
        refinement=prior.matchIds===null?'provisional':'refined'
      }else if(prior){
        candidates=rerankPool(query,index.units,searchLimit)
        sourceCandidateCount=index.units.length
        refinement='reset'
        resetReason=sameContext(prior,index)?'query-changed':'index-or-topic-changed'
      }else{
        const selected=selectDiscoveryCandidates(query,index,byId,refinements,refineToken,searchLimit)
        candidates=selected.candidates
        sourceCandidateCount=selected.sourceCandidateCount
        refinement=selected.refinement
        resetReason=selected.resetReason
      }
      remember(sessionId,{requestId,query,scope:index.scope,theme:index.theme,indexVersion:index.generatedAt,sourceCandidateCount,refinement,resetReason,selectedIds:candidates.map(({unit})=>unit.id),matchIds:null})
      return {index,byId,searchLimit,candidates,sourceCandidateCount,refinement,resetReason}
    })
    const tail=operation.then(()=>{},()=>{})
    tails.set(sessionId,tail)
    try{return await operation}finally{if(tails.get(sessionId)===tail)tails.delete(sessionId)}
  }
  function commit(sessionId,requestId,query,index,matchedIds) {
    const record=sessions.get(sessionId)
    if(!record||record.requestId!==requestId||record.query!==query||!sameContext(record,index))return false
    const selected=new Set(record.selectedIds)
    record.matchIds=[...new Set(matchedIds)].filter(id=>selected.has(id))
    remember(sessionId,record)
    return true
  }
  return {prepare,commit}
}

export function selectDiscoveryCandidates(query, index, byId, store, token, limit = 32) {
  const refinement = store.resolve(token, query, index)
  const source = refinement.mode === 'refined'
    ? refinement.ids.map(id => byId.get(id)).filter(Boolean)
    : index.units
  return {
    candidates: rerankPool(query, source, limit),
    sourceCandidateCount: source.length,
    refinement: refinement.mode,
    resetReason: refinement.reason,
  }
}

// Card payloads exclude the large measured/search-only fields. Ranking and
// explicit constraints have already been applied on the server.
export function projectDiscoveryCard(unit) {
  const { id, kind, nameZh, nameEn, descriptionZh, descriptionEn, sectionsZh, sectionsEn,
    previewUrl, previewKind, source, sourceUrl, offers, relatedSites, tags, tagFacets,
    detailUrl, resourceType } = unit
  return { id, kind, nameZh, nameEn, descriptionZh, descriptionEn, sectionsZh, sectionsEn,
    previewUrl, previewKind, source, sourceUrl, offers, relatedSites, tags, tagFacets,
    detailUrl, resourceType }
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
    themeMeta: Object.fromEntries(meta),
  }
}
