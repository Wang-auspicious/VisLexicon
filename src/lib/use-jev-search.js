import { useEffect, useMemo, useState } from 'react'
import { rerankPool } from './component-discovery.js'

export function asJevUnit(item) {
  const record=item.record||item
  return {id:String(item.key||record.id||record.entryId),
    kind:record.kind|| (item.group==='site'||record.entryId?'curated-site':record.prompt?'image-prompt':item.group==='term'?'term':'resource'),
    componentType:item.group||record.type||'resource',
    nameZh:record.nameZh||record.termZhFix||record.termZh||record.titleZh||record.title||record.zh||record.name||'',
    nameEn:record.termEn||record.titleEn||record.en||record.nameEn||'',
    descriptionZh:String(record.descriptionZh||record.definitionZh||record.dz||record.takeawayZh||'').slice(0,1600),
    descriptionEn:String(record.descriptionEn||record.de||'').slice(0,800),
    tags:[...(record.tags||[]),...(record.kz||[]),...(record.kw||[]),...(record.aliases||[])].slice(0,30),
    prompt:record.prompt?.slice(0,400),visual:record.visual,interaction:record.interaction,unknowns:record.unknowns,scope:'search',offers:record.offers||[]}
}

export function selectJevCandidates(query, units, previous, limit=50) {
  const normalized=query.trim()
  if(previous?.query===normalized)return {candidates:previous.candidates,sourceCandidateCount:previous.candidates.length,refined:false}
  const refining=previous&&normalized.startsWith(previous.query)&&normalized.length>previous.query.length
  const source=refining?previous.matches:units
  const lexicalQuery=normalized.replace(/免费|开源|源码|源代码|商用|free|open[- ]source|source code|commercial/giu,'')
  return {candidates:normalized?rerankPool(lexicalQuery,source,limit).map(row=>row.unit):[],sourceCandidateCount:source.length,refined:Boolean(refining)}
}

export function useJevSearch(query,items,scope,revision=0) {
  const [result,setResult]=useState(null)
  const [lastCompleted,setLastCompleted]=useState(null)
  const units=useMemo(()=>items.map(asJevUnit),[items])
  const byId=useMemo(()=>new Map(items.map(item=>[asJevUnit(item).id,item])),[items])
  const previous=lastCompleted?.items===items&&lastCompleted?.scope===scope&&lastCompleted?.revision===revision?lastCompleted:null
  const {candidates}=useMemo(()=>selectJevCandidates(query,units,previous,50),[query,units,previous])
  const payload=JSON.stringify({query:query.trim(),scope,candidates})
  useEffect(()=>{
    const request=JSON.parse(payload)
    if(!request.query)return
    const controller=new AbortController()
    const timer=setTimeout(async()=>{
      try {
        const response=await fetch('/api/discovery/rank',{method:'POST',headers:{'Content-Type':'application/json'},body:payload,signal:controller.signal})
        const data=await response.json()
        if(!response.ok||data.scope!==scope)throw Error('JEV_UNAVAILABLE')
        if(!controller.signal.aborted){
          const candidateIds=new Set(request.candidates.map(unit=>unit.id)),seen=new Set()
          const rows=(data.rows||[]).filter(row=>row.score>=1.4&&candidateIds.has(row.id)&&!seen.has(row.id)&&seen.add(row.id)).sort((a,b)=>b.score-a.score)
          const candidateById=new Map(request.candidates.map(unit=>[unit.id,unit]))
          setLastCompleted({query:request.query,scope,items,revision,candidates:request.candidates,matches:rows.map(row=>candidateById.get(row.id))})
          setResult({payload,data,matched:rows.map(row=>byId.get(row.id)).filter(Boolean),items,revision})
        }
      }catch{if(!controller.signal.aborted)setResult({payload,data:{mode:'error',rows:[]},matched:[],items,revision})}
    },650)
    return()=>{clearTimeout(timer);controller.abort()}
  },[payload,scope,items,byId,revision])
  const current=result?.payload===payload&&result.items===items&&result.revision===revision?result.data:null
  const matches=current?result.matched:[]
  const status=!query.trim()?'':!current?'Jev 正在判断…':current.mode==='error'?'Jev 暂不可用，请稍后重试':current.mode==='empty'?'没有可供判断的候选':`Jev 已判断 ${current.candidateCount} 个候选 · ${matches.length} 条匹配`
  return {items:query.trim()?matches:items,status,mode:current?.mode||'waiting'}
}
