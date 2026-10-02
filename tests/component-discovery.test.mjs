import test from 'node:test'
import assert from 'node:assert/strict'
import { FREE_MODEL, rankWithJev } from '../server/discovery-api.mjs'

test('discovery sends compact candidate facts and splits before Jev token overflow',async()=>{
  const large='x'.repeat(2500)+'PRIVATE_TAIL_SENTINEL'
  const candidates=Array.from({length:20},(_,i)=>({unit:{
    id:`large-${i}`,kind:'website-component',componentType:'button',nameZh:`按钮 ${i}`,
    descriptionZh:'Measured blue button. '+large,tagFacets:Object.fromEntries(Array.from({length:10},(_,j)=>[`facet-${j}`,Array(4).fill(large)])),
    visual:{style:'solid',computed:{background:'rgb(64, 158, 255)',color:'rgb(255, 255, 255)'},unrelatedRawHtml:large},interaction:{activeMotion:false},tags:['button'],offers:[],
  }}))
  const sent=[]
  const result=await rankWithJev('蓝色按钮',candidates,{key:'test',fetchImpl:async(_url,options)=>{
    const request=JSON.parse(options.body)
    sent.push({bytes:Buffer.byteLength(options.body),ids:request.state.candidates.map(row=>row.id)})
    assert.equal(request.model,FREE_MODEL)
    assert.ok(Buffer.byteLength(options.body)<=48000)
    assert.ok(!options.body.includes('PRIVATE_TAIL_SENTINEL'))
    assert.ok(!options.body.includes('unrelatedRawHtml'))
    return {ok:true,json:async()=>({model:FREE_MODEL,cost:'0',answers:Object.fromEntries(Object.keys(request.questions).map(key=>[key,{type:'score',score:2}]))})}
  }})
  assert.ok(sent.length>1)
  assert.equal(result.rows.length,20)
  assert.equal(new Set(result.rows.map(row=>row.id)).size,20)
})

test('Jev max_tokens_exceeded halves a discovery batch without losing candidates',async()=>{
  const candidates=Array.from({length:3},(_,i)=>({unit:{id:`button-${i}`,kind:'website-component',componentType:'button',nameZh:`按钮 ${i}`,tags:['button']}}))
  const calls=[]
  const result=await rankWithJev('button',candidates,{key:'test',fetchImpl:async(_url,options)=>{
    const request=JSON.parse(options.body)
    calls.push(request.state.candidates.map(row=>row.id))
    if(request.state.candidates.length>1)return {ok:false,status:400,text:async()=>'{"detail":{"error_type":"max_tokens_exceeded"}}'}
    return {ok:true,json:async()=>({model:FREE_MODEL,cost:'0',answers:{candidate_0:{type:'score',score:2}}})}
  }})
  assert.equal(calls[0].length,3)
  assert.equal(result.rows.length,3)
  assert.equal(new Set(result.rows.map(row=>row.id)).size,3)
  assert.equal(result.usage.batches,3)
})
