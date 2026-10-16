import test from 'node:test'
import assert from 'node:assert/strict'
import { createDiscoverySearch, discoveryStatus, displayDiscoveryResponse } from '../public/discovery-search-session.js'
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
const unit = id => ({ id, nameZh: id })
const snapshot = (extra = {}) => ({ scope: 'curation', theme: '', indexVersion: 'v1', mode: 'preliminary', units: [unit('blue')], refineToken: 'first', eligibleCount: 43, matchCount: 43, judgedCount: 0, confirmedCount: 0, remainingCount: 0, ...extra })
const ready = async predicate => { for (let n = 0; n < 100 && !predicate(); n++) await wait(5); assert.ok(predicate(), 'condition did not settle') }
test('editing a description keeps the previous cards until a replacement arrives, labelled as previous', async () => {
 let release
 const search = createDiscoverySearch({ scope: 'curation', delay: 0, request: async (_, payload) => payload.query==='按钮' ? snapshot() : new Promise(resolve=>release=resolve) })
 search.setQuery('按钮'); await ready(()=>search.getState().status==='ready')
 search.setQuery('按钮，蓝色的'); await ready(()=>release)
 assert.equal(search.getState().response.units[0].id, 'blue')
 assert.match(discoveryStatus(search.getState()), /暂保留上次结果/)
 release(snapshot({ units:[unit('new-blue')] }));await ready(()=>search.getState().status==='ready')
 assert.equal(search.getState().response.units[0].id,'new-blue');search.destroy()
})
test('IME does not issue partial Chinese searches; final composed input makes one request',async()=>{
 const calls=[];const search=createDiscoverySearch({scope:'curation',delay:5,request:async(_,payload)=>{calls.push(payload.query);return snapshot()}})
 search.setComposing(true);search.setQuery('lan');await wait(20);search.setQuery('蓝色');await wait(20);assert.equal(calls.length,0)
 search.setComposing(false);await ready(()=>calls.length===1);assert.deepEqual(calls,['蓝色']);search.destroy()
})
test('editing aborts the old query, and a late response cannot overwrite the new query',async()=>{
 let stale,signal;const search=createDiscoverySearch({scope:'curation',delay:0,request:async(_,payload,s)=>{if(payload.query==='按钮')return new Promise(resolve=>{stale=resolve;signal=s});return snapshot({units:[unit('card')]})}})
 search.setQuery('按钮');await ready(()=>stale);search.setQuery('换成卡片');assert.equal(signal.aborted,true);await ready(()=>search.getState().status==='ready')
 stale(snapshot({units:[unit('button')]}));await wait(10);assert.equal(search.getState().response.units[0].id,'card');search.destroy()
})
test('refinement token is sent for replacement/shorter text so the server decides widening',async()=>{
 const calls=[];const search=createDiscoverySearch({scope:'curation',delay:0,request:async(_,payload)=>{calls.push(payload);return snapshot({refineToken:'complete-universe-token'})}})
 search.setQuery('按钮蓝色白字');await ready(()=>search.getState().status==='ready');search.setQuery('卡片');await ready(()=>calls.length===2)
 assert.equal(calls[1].refineToken,'complete-universe-token');search.destroy()
})
test('preliminary rows remain usable when Jev is temporarily unavailable and are never called confirmed',async()=>{
 const search=createDiscoverySearch({scope:'curation',delay:0,request:async(path)=>{if(path.endsWith('prepare'))return snapshot({remainingCount:43});throw Error('MODEL_UNAVAILABLE')}})
 search.setQuery('按钮');await ready(()=>search.getState().status==='error');assert.equal(search.getState().response.units.length,1);assert.match(discoveryStatus(search.getState()),/确认 0 个/);assert.match(discoveryStatus(search.getState()),/43 个待判断/);search.destroy()
})
test('background review continues past the first model batch with exact progress',async()=>{
 const calls=[];const search=createDiscoverySearch({scope:'curation',delay:0,pageSize:1,request:async(path,payload)=>{calls.push({path,...payload});if(path.endsWith('prepare'))return snapshot({remainingCount:43});return snapshot({mode:'jev',refineToken:payload.reviewMore?'last':'middle',judgedCount:payload.reviewMore?43:32,remainingCount:payload.reviewMore?0:11,confirmedCount:payload.reviewMore?12:9})}})
 search.setQuery('按钮');await ready(()=>search.getState().status==='ready');assert.equal(calls.length,3);assert.equal(calls[2].reviewMore,true);assert.equal(calls[2].refineToken,'middle');assert.equal(search.getState().response.judgedCount,43);search.destroy()
})
test('pagination is aborted on edit; a late failure never poisons the new query',async()=>{
 let rejectPage,pageSignal;const search=createDiscoverySearch({scope:'curation',delay:0,request:async(path,payload,signal)=>{if(path.includes('/page?'))return new Promise((_,reject)=>{rejectPage=reject;pageSignal=signal});return snapshot()}})
 search.setQuery('按钮');await ready(()=>search.getState().status==='ready');const page=search.loadMore();await ready(()=>rejectPage);search.setQuery('卡片');assert.equal(pageSignal.aborted,true);rejectPage(Error('PAGE_UNAVAILABLE'));await page;await ready(()=>search.getState().status==='ready');assert.equal(search.getState().pageError,null);assert.equal(search.getState().loadingMore,false);search.destroy()
})
test('hiding a column aborts work; returning resumes from the complete token',async()=>{
 let signal,started=0;const search=createDiscoverySearch({scope:'curation',delay:0,request:async(_,p,s)=>{started++;signal=s;return snapshot()}})
 search.setQuery('按钮');await ready(()=>search.getState().status==='ready');search.setActive(false);assert.equal(signal.aborted,true);search.setQuery('蓝色按钮');await wait(10);assert.equal(started,1);search.setActive(true);await ready(()=>started===2);search.destroy()
})
test('background review preserves an expanded window beyond the 240-card response cap',async()=>{
 const units=Array.from({length:300},(_,i)=>unit(String(i)));let release
 const search=createDiscoverySearch({scope:'curation',delay:0,pageSize:240,request:async(path)=>{
  if(path.endsWith('/prepare'))return snapshot({units:units.slice(0,240),matchCount:300,remainingCount:1})
  if(path.endsWith('/search'))return new Promise(resolve=>release=()=>resolve(snapshot({units:units.slice(0,240).map(row=>({...row,matchStatus:'confirmed'})),refineToken:'reviewed',matchCount:300,judgedCount:300,confirmedCount:300,remainingCount:0})))
  const p=new URL(path,'http://local').searchParams,offset=Number(p.get('offset')),limit=Number(p.get('limit'));assert.ok(limit<=24)
  return snapshot({offset,units:units.slice(offset,offset+limit).map(row=>({...row,matchStatus:p.get('token')==='reviewed'?'confirmed':'preliminary'}))})
 }})
 search.setQuery('按钮');await ready(()=>release);await search.loadMore();assert.equal(search.getState().response.units.length,264);release();await ready(()=>search.getState().status==='ready');assert.equal(search.getState().response.units.length,264);assert.equal(search.getState().response.units.at(-1).id,'263');assert.equal(displayDiscoveryResponse(search.getState().response).units.length,264);await search.loadMore();assert.equal(displayDiscoveryResponse(search.getState().response).units.length,288);await search.loadMore();assert.equal(displayDiscoveryResponse(search.getState().response).units.length,300);search.destroy()
})
test('displayed results become confirmed-only while the complete pending universe stays intact',async()=>{
 const {displayDiscoveryResponse}=await import('../public/discovery-search-session.js')
 const pending=Array.from({length:11},(_,i)=>({...unit('p'+i),matchStatus:'preliminary'}))
 const raw=snapshot({units:[{...unit('yes'),matchStatus:'confirmed'},...pending],judgedCount:32,confirmedCount:1,remainingCount:68,matchCount:69,eligibleCount:100})
 const view=displayDiscoveryResponse(raw);assert.deepEqual(view.units.map(u=>u.id),['yes']);assert.equal(view.matchCount,1);assert.equal(raw.units.length,12);assert.equal(raw.matchCount,69)
 assert.equal(displayDiscoveryResponse({...raw,judgedCount:0,confirmedCount:0}).units.length,12)
 assert.equal(displayDiscoveryResponse({...raw,confirmedCount:0,units:pending}).matchCount,0)
 const later=displayDiscoveryResponse({...raw,units:Array.from({length:264},(_,i)=>({...unit(String(i)),matchStatus:'confirmed'})),confirmedCount:300});assert.equal(later.units.length,264);assert.equal(later.matchCount,300)
})
test('atlas study originals use their canonical IDs while code demos retain category IDs',async()=>{
 const {atlasDiscoveryId}=await import('../public/discovery-search-session.js')
 assert.equal(atlasDiscoveryId({id:'type-study',file:null,hasPractices:true},{id:'original'}),'study--original')
 assert.equal(atlasDiscoveryId({id:'form',file:'form',hasPractices:false},{id:'button'}),'atlas-term--form--button')
})
test('an expired page waits for an explicit retry, then prepares a fresh token',async()=>{
 let prepares=0,pages=0
 const search=createDiscoverySearch({scope:'curation',delay:0,request:async(path)=>{
  if(path.endsWith('/prepare'))return snapshot({refineToken:'token-'+(++prepares)})
  const p=new URL(path,'http://local').searchParams;pages++
  if(p.get('token')==='token-1')throw Error('SEARCH_EXPIRED')
  return snapshot({offset:1,units:[unit('second')]})
 }})
 search.setQuery('按钮');await ready(()=>search.getState().status==='ready');await search.loadMore();assert.equal(search.getState().pageError,'SEARCH_EXPIRED');await wait(30);assert.equal(pages,1);assert.equal(prepares,1)
 await search.loadMore();await ready(()=>search.getState().response?.refineToken==='token-2'&&search.getState().status==='ready');assert.equal(search.getState().pageError,null);assert.equal(pages,1)
 await search.loadMore();assert.equal(pages,2);assert.deepEqual(search.getState().response.units.map(u=>u.id),['blue','second']);search.destroy()
})
