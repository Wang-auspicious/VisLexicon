import test from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import { once } from 'node:events'
import { discoveryPlugin } from '../server/discovery-api.mjs'
import { createRefinementStore, createProvisionalSearchStore, projectDiscoveryCard, selectDiscoveryCandidates, summarizeDiscoveryIndex } from '../server/discovery-refinement.mjs'
import { canRefineQuery, explicitConflicts } from '../src/lib/component-discovery.js'

function corpus(count=96) {
  const units=Array.from({length:count},(_,i)=>({id:`button-${String(i).padStart(5,'0')}`,kind:'website-component',componentType:'button',nameZh:`按钮 ${i}`,nameEn:`Button ${i}`,tags:['button'],descriptionZh:'可点击的按钮组件',visual:{style:'solid',computed:{background:i>=count-16?'rgb(0, 100, 220)':'rgb(220, 0, 0)',color:'rgb(255, 255, 255)'}},scope:'curation',theme:'button'}))
  const index={scope:'curation',theme:'button',generatedAt:'revision-1',themes:['button','card'],counts:{},examples:[],units}
  return {index,byId:new Map(units.map(unit=>[unit.id,unit]))}
}
const accept=async(_q,candidates)=>({mode:'jev',model:'test-ranker',cost:'0',rows:candidates.map(({unit})=>({id:unit.id,score:2}))})
async function api(t,{indexLoader,ranker=accept}={}) {
  let middleware
  discoveryPlugin({ranker,...(indexLoader?{indexLoader}:{})}).configureServer({middlewares:{use(fn){middleware=fn}}})
  const server=http.createServer((req,res)=>middleware(req,res,()=>{res.writeHead(404);res.end()}))
  server.listen(0,'127.0.0.1');await once(server,'listening')
  t.after(()=>{server.closeAllConnections();server.close()})
  const base=`http://127.0.0.1:${server.address().port}`
  return {base,post:async(query,extra={},endpoint='search')=>{
    const response=await fetch(`${base}/api/discovery/${endpoint}`,{method:'POST',signal:t.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({query,scope:'curation',theme:'button',...extra})})
    return {status:response.status,data:await response.json()}
  }}
}

test('complete 8000-record pool survives a 32-candidate model batch, including blue matches beyond that batch',()=>{
  const {index,byId}=corpus(8000),store=createRefinementStore()
  const first=selectDiscoveryCandidates('按钮',index,byId,store)
  assert.equal(first.candidates.length,32);assert.equal(first.eligible.length,8000)
  const token=store.save('按钮',index,first.eligible,first.candidates.map(({unit})=>({id:unit.id,score:2})))
  const page=store.page(token,index,byId)
  assert.equal(page.total,8000);assert.equal(page.judgedCount,32);assert.equal(page.remainingCount,7968)
  const second=selectDiscoveryCandidates('按钮 蓝色',index,byId,store,token)
  assert.equal(second.refinement,'refined');assert.equal(second.sourceCandidateCount,8000);assert.equal(second.eligible.length,16)
  assert.ok(second.eligible.every(({unit})=>Number(unit.id.slice(7))>=7984))
})

test('model rejection does not delete future recall; unknown IDs and invalid scores are never judgments',()=>{
  const {index,byId}=corpus(),store=createRefinementStore()
  const first=selectDiscoveryCandidates('按钮',index,byId,store)
  const token=store.save('按钮',index,first.eligible,[...first.candidates.map(({unit})=>({id:unit.id,score:0})),{id:'invented',score:3},{id:index.units.at(-1).id,score:NaN}])
  const page=store.page(token,index,byId)
  assert.equal(page.total,64);assert.equal(page.confirmedCount,0);assert.equal(page.remainingCount,64)
  const second=selectDiscoveryCandidates('按钮 蓝色',index,byId,store,token)
  assert.equal(second.eligible.length,16)
  assert.ok(second.eligible.every(({unit})=>unit.visual.computed.background==='rgb(0, 100, 220)'))
})

test('snapshot pages contain all eligible records and are stable while a later snapshot is ranked',()=>{
  const {index,byId}=corpus(),store=createRefinementStore()
  const selected=selectDiscoveryCandidates('按钮',index,byId,store)
  const token=store.save('按钮',index,selected.eligible)
  const before=store.page(token,index,byId,24,24)
  const next=store.save('按钮',index,selected.eligible,selected.candidates.map(({unit})=>({id:unit.id,score:0})),token)
  assert.deepEqual(store.page(token,index,byId,24,24),before)
  assert.equal(store.page(next,index,byId).total,64)
  const ids=[];for(let offset=0;offset<96;offset+=12)ids.push(...store.page(token,index,byId,offset,12).units.map(unit=>unit.id))
  assert.equal(new Set(ids).size,96)
  assert.ok(before.units.map(projectDiscoveryCard).every(unit=>!Object.hasOwn(unit,'visual')&&!Object.hasOwn(unit,'evidence')&&unit.matchStatus==='preliminary'))
  const summary=summarizeDiscoveryIndex(index)
  assert.equal(summary.themeMeta[''].componentCount,96);assert.equal(Object.hasOwn(summary,'units'),false)
})

test('append reuse is conservative: replacement, negation, alternatives, kind completion, deletions and revisions reset',()=>{
  assert.equal(canRefineQuery('按钮','按钮，蓝色的'),true)
  assert.equal(canRefineQuery('我要按钮，蓝色','我要按钮，蓝色字体'),true)
  assert.equal(canRefineQuery('按钮 蓝色','按钮 蓝色边框'),true)
  assert.equal(canRefineQuery('按钮 免费源码','按钮 免费源码也可以收费'),false)
  assert.equal(canRefineQuery('按钮 蓝色','按钮 蓝色背景 白字'),true)
  for(const query of ['按钮，不要蓝色','按钮，改成卡片','按钮或者卡片','按钮组件库'])assert.equal(canRefineQuery('按钮',query),false,query)
  const {index,byId}=corpus(),store=createRefinementStore({maxEntries:2})
  const selected=selectDiscoveryCandidates('按钮 蓝色',index,byId,store)
  const token=store.save('按钮 蓝色',index,selected.eligible)
  for(const [query,changed] of [['按钮',index],['按钮 紫色',index],['按钮 蓝色 白字',{...index,theme:'card'}],['按钮 蓝色 白字',{...index,generatedAt:'revision-2'}],['按钮 蓝色 白字',{...index,filterKey:'other'}]]) {
    const result=selectDiscoveryCandidates(query,changed,byId,store,token)
    assert.equal(result.refinement,'reset');assert.equal(result.sourceCandidateCount,96)
  }
  store.save('x',index,[]);store.save('y',index,[])
  assert.equal(selectDiscoveryCandidates('按钮 蓝色 白字',index,byId,store,token).resetReason,'expired')
})

test('visual roles and natural-language corrections preserve button type without conflating white text with fill',()=>{
  const blue={...corpus().index.units.at(-1)}
  assert.deepEqual(explicitConflicts('我要一个按钮组件，蓝色的，背景填充的，白色字体的组件',blue),[])
  assert.ok(explicitConflicts('按钮 蓝色 白色字体',{...blue,visual:{...blue.visual,computed:{...blue.visual.computed,color:'rgb(0,0,0)'}}}).length)
  assert.ok(explicitConflicts('按钮 背景填充',{...blue,visual:{...blue.visual,style:'outline'}}).length)
  const purple={...blue,visual:{...blue.visual,computed:{...blue.visual.computed,background:'rgb(128,0,255)'}}}
  assert.deepEqual(explicitConflicts('按钮 蓝色 改成紫色 白字',purple),[])
  assert.ok(explicitConflicts('按钮 蓝色 改成紫色 白字',{...purple,componentType:'card'}).length)
  assert.ok(explicitConflicts('按钮 不要蓝色',blue).length)
  assert.deepEqual(explicitConflicts('按钮 不要蓝色',purple),[])
  const red={...blue,visual:{...blue.visual,computed:{...blue.visual.computed,background:'#ff0000',color:'#fff'}}}
  assert.deepEqual(explicitConflicts('按钮 蓝色，改成红色，白字',red),[])
  assert.deepEqual(explicitConflicts('按钮 蓝色或者红色',blue),[])
  assert.deepEqual(explicitConflicts('按钮 蓝色或者红色',red),[])
  assert.ok(explicitConflicts('按钮 蓝色或者红色',purple).length)
  assert.ok(explicitConflicts('不要实心的按钮',blue).length)
})

test('provisional sessions preserve full recall before completion and reject stale commits/replays',async()=>{
  const {index,byId}=corpus(8000),store=createProvisionalSearchStore(),refinements=createRefinementStore()
  const sessionId='11111111-1111-4111-8111-111111111111',load=async()=>({index,byId,searchLimit:32})
  const first=await store.prepare({sessionId,requestId:1,query:'按钮',load,refinements})
  const second=await store.prepare({sessionId,requestId:2,query:'按钮 蓝色',load,refinements})
  assert.equal(first.eligible.length,8000);assert.equal(second.refinement,'refined');assert.equal(second.sourceCandidateCount,8000);assert.equal(second.eligible.length,16)
  assert.equal(store.commit(sessionId,1,'按钮',index,first.token),false)
  const replay=await store.prepare({sessionId,requestId:2,query:'按钮 蓝色',load,refinements})
  assert.equal(replay.token,second.token)
  assert.equal((await store.prepare({sessionId,requestId:1,query:'按钮',load,refinements})).stale,true)
  assert.equal((await store.prepare({sessionId,requestId:2,query:'卡片',load,refinements})).stale,true)
  const deleted=await store.prepare({sessionId,requestId:3,query:'按钮',load,refinements})
  assert.equal(deleted.refinement,'reset');assert.equal(deleted.eligible.length,8000)
})

test('HTTP prepare returns all candidates immediately without a model call; sequential review reaches every ID once',async t=>{
  const {index}=corpus(),calls=[]
  const {post}=await api(t,{indexLoader:async()=>({...index,theme:''}),ranker:async(q,c)=>{calls.push(c.map(({unit})=>unit.id));return accept(q,c)}})
  const first=await post('按钮',{},'prepare')
  assert.equal(first.status,200);assert.equal(first.data.mode,'preliminary');assert.equal(calls.length,0)
  assert.equal(first.data.eligibleCount,96);assert.equal(first.data.judgedCount,0);assert.equal(first.data.units.length,12)
  let result=first.data
  for(let i=0;i<3;i++) {
    const response=await post('按钮',{refineToken:result.refineToken,reviewMore:i>0,limit:24})
    assert.equal(response.status,200);result=response.data
    assert.equal(result.units.length,24);assert.equal(result.judgedCount,(i+1)*32);assert.equal(result.remainingCount,96-(i+1)*32)
  }
  assert.equal(new Set(calls.flat()).size,96);assert.equal(result.confirmedCount,96);assert.equal(result.assessmentComplete,true)
})

test('HTTP regression: 16 blue matches beyond first top32 remain searchable by appending, replacing and paging',async t=>{
  const {index}=corpus(),{post,base}=await api(t,{indexLoader:async()=>({...index,theme:''})})
  const first=(await post('按钮')).data
  assert.equal(first.judgedCount,32);assert.equal(first.matchCount,96)
  const blue=(await post('按钮 蓝色',{refineToken:first.refineToken})).data
  assert.equal(blue.sourceCandidateCount,96);assert.equal(blue.eligibleCount,16);assert.equal(blue.confirmedCount,16)
  const page=await(await fetch(`${base}/api/discovery/page?scope=curation&theme=button&token=${blue.refineToken}&offset=12&limit=12`)).json()
  assert.equal(page.units.length,4);assert.equal(new Set([...blue.units,...page.units].map(u=>u.id)).size,16)
  const removed=(await post('按钮',{refineToken:blue.refineToken})).data
  assert.equal(removed.refinement,'reset');assert.equal(removed.eligibleCount,96)
  const alternate=(await post('按钮 不要蓝色',{refineToken:blue.refineToken})).data
  assert.equal(alternate.refinement,'reset');assert.equal(alternate.eligibleCount,80)
})

test('HTTP allowedIds intersects authoritative data, binds context and cannot introduce a record or cross scope',async t=>{
  const {index}=corpus(),{post,base}=await api(t,{indexLoader:async()=>({...index,theme:''})})
  const sessionId='44444444-4444-4444-8444-444444444444'
  const ids=index.units.slice(0,15).map(unit=>unit.id)
  const first=(await post('按钮',{sessionId,requestId:1,allowedIds:[...ids,'invented']})).data
  assert.equal(first.totalIndexed,15);assert.equal(first.eligibleCount,15)
  const pageResponse=await fetch(`${base}/api/discovery/page?scope=curation&theme=button&token=${first.refineToken}&offset=12&limit=12`)
  assert.equal(pageResponse.status,200);assert.equal((await pageResponse.json()).units.length,3)
  const changed=(await post('按钮 蓝色',{sessionId,requestId:2,allowedIds:index.units.slice(-16).map(unit=>unit.id),refineToken:first.refineToken})).data
  assert.equal(changed.refinement,'reset');assert.equal(changed.eligibleCount,16)
  assert.equal((await post('按钮',{allowedIds:[]})).data.eligibleCount,0)
  assert.equal((await post('按钮',{allowedIds:[{id:'button'}]})).status,400)
})

test('HTTP newer prepare aborts an in-flight model immediately without restricting its full candidate pool', {timeout:15000},async t=>{
  const {index}=corpus(128),calls=[];let startedResolve
  const started=new Promise(resolve=>{startedResolve=resolve})
  const {post}=await api(t,{indexLoader:async()=>({...index,theme:''}),ranker:(q,c,{signal})=>{
    calls.push(c.map(({unit})=>unit.id))
    if(q==='按钮')return new Promise((resolve,reject)=>{startedResolve();signal.addEventListener('abort',()=>reject(Error('ABORTED')),{once:true})})
    return accept(q,c)
  }})
  const sessionId='22222222-2222-4222-8222-222222222222'
  const pending=post('按钮',{sessionId,requestId:1});await started
  const prepared=await post('按钮 蓝色',{sessionId,requestId:2},'prepare')
  assert.equal(prepared.status,200);assert.equal(prepared.data.eligibleCount,16);assert.equal(prepared.data.sourceCandidateCount,128);assert.equal(calls.length,1)
  const old=await pending;assert.equal(old.status,503)
  const final=await post('按钮 蓝色',{sessionId,requestId:2,refineToken:prepared.data.refineToken})
  assert.equal(final.status,200);assert.equal(final.data.confirmedCount,16)
  assert.equal((await post('按钮',{sessionId,requestId:1})).status,409)
})



test('HTTP unqualified blue retains blue-text surfaces so an explicit text role can narrow safely',async t=>{
  const {index}=corpus(96)
  index.units[0].visual.computed.color='rgb(0, 100, 220)'
  const {post}=await api(t,{indexLoader:async()=>({...index,theme:''})})
  const first=(await post('按钮 蓝色')).data
  assert.equal(first.eligibleCount,17)
  const changed=(await post('按钮 蓝色字体',{refineToken:first.refineToken})).data
  assert.equal(changed.refinement,'refined');assert.equal(changed.sourceCandidateCount,17)
  assert.deepEqual(changed.units.map(unit=>unit.id),[index.units[0].id])
})


test('HTTP component-browser filters match authoritative source and type; changed filters reset the pool',async t=>{
  const {index}=corpus()
  index.units.forEach((unit,i)=>{unit.sourceUrl=i<80?'https://a.example/components/button':'https://b.example/button'})
  const {post,base}=await api(t,{indexLoader:async()=>({...index,theme:''})})
  const sessionId='55555555-5555-4555-8555-555555555555'
  const first=(await post('按钮',{sessionId,requestId:1,filters:{kind:'website-component',source:'a.example',type:'button'}},'prepare')).data
  assert.equal(first.eligibleCount,80)
  const second=(await post('按钮 蓝色',{sessionId,requestId:2,refineToken:first.refineToken,filters:{kind:'website-component',source:'b.example',type:'button'}},'prepare')).data
  assert.equal(second.refinement,'reset');assert.equal(second.eligibleCount,16)
  const page=await(await fetch(base+'/api/discovery/page?scope=curation&theme=button&token='+second.refineToken+'&offset=12&limit=12')).json()
  assert.equal(page.units.length,4);assert.ok(page.units.every(unit=>unit.sourceUrl.startsWith('https://b.example/')))
  assert.equal((await post('按钮',{filters:{kind:'website-component',source:'b.example',type:'card'}})).data.eligibleCount,0)
  assert.equal((await post('按钮',{filters:{kind:'website-component',source:'b.example'},allowedIds:[index.units[0].id,index.units.at(-1).id]})).data.eligibleCount,1)
  for(const filters of [{kind:'private-draft'},{kind:'website-component',units:[]},{kind:'website-component',source:{}}])assert.equal((await post('按钮',{filters})).status,400)
})




test('missing visual fields remain unresolved; measured contradictions still exclude, and positive rights still require evidence',()=>{
  const unit=corpus().index.units.at(-1)
  assert.deepEqual(explicitConflicts('带图标的按钮',unit),[])
  assert.deepEqual(explicitConflicts('按钮悬停变蓝',unit),[])
  assert.ok(explicitConflicts('带图标的按钮',{...unit,visual:{...unit.visual,computed:{...unit.visual.computed,icon:false}}}).length)
  assert.ok(explicitConflicts('按钮悬停变蓝',{...unit,visual:{...unit.visual,computed:{...unit.visual.computed,hoverBackground:'rgb(255,0,0)'}}}).length)
  assert.ok(explicitConflicts('免费的源码可商用按钮',unit).length)
})

test('model payload carries the effective component after explicit Chinese and English corrections',async()=>{
  const {modelRequest}=await import('../server/discovery-api.mjs')
  for(const query of ['按钮，后来想换卡片','按钮，现在想要卡片','不是按钮，是卡片','I want a card rather than a button','button, instead I want a card','不是组件库，是按钮']) {
    assert.deepEqual(modelRequest(query,[]).state.parsed_constraints.effective_component_types,query==='不是组件库，是按钮'?['button']:['card'],query)
  }
  const revised=modelRequest('不要动画的卡片，改成带动画的卡片',[]).state.parsed_constraints
  assert.equal(revised.effective_features.motion,'required')
  assert.deepEqual(revised.excluded_attributes,[])
  assert.deepEqual(explicitConflicts('不要动画的卡片，改成带动画的卡片',{...corpus().index.units[0],componentType:'card',interaction:{activeMotion:true}}),[])
})
