import test from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import { once } from 'node:events'
import { discoveryPlugin } from '../server/discovery-api.mjs'
import { createRefinementStore, createProvisionalSearchStore, projectDiscoveryCard, selectDiscoveryCandidates, summarizeDiscoveryIndex } from '../server/discovery-refinement.mjs'

function corpus(count = 8000) {
  const units = Array.from({ length: count }, (_, i) => ({
    id: `button-${String(i).padStart(5, '0')}`,
    kind: 'website-component',
    componentType: 'button',
    nameZh: `按钮 ${i}`,
    nameEn: `Button ${i}`,
    tags: ['button'],
    descriptionZh: '可点击的按钮组件',
    visual: { style: 'solid', computed: { background: 'rgb(0, 100, 220)', color: 'rgb(255, 255, 255)' } },
    scope: 'curation',
    theme: 'button',
  }))
  const index = { scope: 'curation', theme: 'button', generatedAt: 'revision-1', units }
  return { index, byId: new Map(units.map(unit => [unit.id, unit])) }
}

test('appending narrows all qualified results, including matches beyond the first 12 cards, without traversing 8000 units', t => {
  const { index, byId } = corpus()
  const store = createRefinementStore()
  const initialStarted = performance.now()
  const first = selectDiscoveryCandidates('button', index, byId, store)
  const initialMs = performance.now() - initialStarted
  assert.equal(first.sourceCandidateCount, 8000)
  assert.equal(first.candidates.length, 32)
  assert.ok(selectDiscoveryCandidates('button 7999', index, byId, store).candidates.some(({ unit }) => unit.id === 'button-07999'))
  const firstRows = first.candidates.map(({ unit }) => ({ id: unit.id, score: 2 }))
  const firstToken = store.save('button', index, first.candidates, firstRows)
  assert.equal(firstToken.length, 32)

  // A refined search must never iterate or index the complete corpus.
  let fullIndexReads = 0
  const guarded = { ...index, units: new Proxy(index.units, {
    get(target, property, receiver) {
      if (property === 'length') return Reflect.get(target, property, receiver)
      fullIndexReads++
      throw new Error(`full index was traversed: ${String(property)}`)
    },
  }) }
  const refinedStarted = performance.now()
  const second = selectDiscoveryCandidates('button blue', guarded, byId, store, firstToken)
  const refinedMs = performance.now() - refinedStarted
  assert.equal(second.refinement, 'refined')
  assert.equal(second.sourceCandidateCount, 32)
  assert.ok(second.candidates.every(({ unit }) => firstRows.some(row => row.id === unit.id)))
  const secondRows = second.candidates.map(({ unit }, i) => ({ id: unit.id, score: i < 5 ? 2 : 0 }))
  const secondToken = store.save('button blue', guarded, second.candidates, secondRows)
  const third = selectDiscoveryCandidates('button blue white', guarded, byId, store, secondToken)
  assert.equal(third.refinement, 'refined')
  assert.equal(third.sourceCandidateCount, 5)
  assert.ok(third.candidates.every(({ unit }) => secondRows.slice(0, 5).some(row => row.id === unit.id)))
  assert.equal(fullIndexReads, 0)
  t.diagnostic(`8000 indexed units, initial ${initialMs.toFixed(1)} ms; refined source sizes 32 then 5, first refinement ${refinedMs.toFixed(1)} ms; full-index reads after refinement: ${fullIndexReads}`)
})

test('index summary and card pages never send the full search records', () => {
  const { index, byId } = corpus()
  const summary = summarizeDiscoveryIndex({ ...index, themes: ['button'], counts: {}, examples: [] })
  assert.equal(summary.themeMeta[''].componentCount, 8000)
  assert.equal(summary.themeMeta.button.componentCount, 8000)
  assert.equal(Object.hasOwn(summary, 'units'), false)
  const store = createRefinementStore()
  const selected = selectDiscoveryCandidates('button', index, byId, store)
  const token = store.save('button', index, selected.candidates, selected.candidates.map(({ unit }) => ({ id: unit.id, score: 2 })))
  const first = store.page(token, index, byId, 0, 12)
  const second = store.page(token, index, byId, 12, 12)
  assert.equal(first.total, 32)
  assert.equal(first.units.length, 12)
  assert.equal(second.units.length, 12)
  assert.equal(new Set([...first.units, ...second.units].map(unit => unit.id)).size, 24)
  const cards = first.units.map(projectDiscoveryCard)
  assert.ok(cards.every(unit => !Object.hasOwn(unit, 'visual') && !Object.hasOwn(unit, 'evidence')))
  assert.ok(Buffer.byteLength(JSON.stringify(summary)) < 2000)
})

test('HTTP search refines real published button captures and restores the full topic after deletion', async t => {
  const calls = []
  const plugin = discoveryPlugin({ ranker: async (_query, candidates) => {
    calls.push(candidates.length)
    return { mode: 'jev', model: 'test-ranker', cost: '0', rows: candidates.map(({ unit }) => ({ id: unit.id, score: 2 })) }
  } })
  let middleware
  plugin.configureServer({ middlewares: { use(fn) { middleware = fn } } })
  const server = http.createServer((req, res) => middleware(req, res, () => { res.writeHead(404); res.end() }))
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  t.after(() => server.close())
  const base = `http://127.0.0.1:${server.address().port}`
  const post = async (query, refineToken) => {
    const response = await fetch(`${base}/api/discovery/search`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, scope: 'curation', theme: 'button', refineToken }),
    })
    assert.equal(response.status, 200)
    return response.json()
  }
  const allIds = async result => {
    const ids = result.units.map(unit => unit.id)
    for (let offset = ids.length; offset < result.matchCount; offset += 12) {
      const params = new URLSearchParams({ scope: 'curation', theme: 'button', token: result.refineToken, offset: String(offset), limit: '12' })
      const response = await fetch(`${base}/api/discovery/page?${params}`)
      assert.equal(response.status, 200)
      const page = await response.json()
      assert.ok(page.units.length <= 12)
      ids.push(...page.units.map(unit => unit.id))
    }
    assert.equal(ids.length, result.matchCount)
    return new Set(ids)
  }

  const first = await post('按钮')
  const spaced = await post('按钮 ', first.refineToken)
  const second = await post('按钮 蓝色', spaced.refineToken)
  const third = await post('按钮 蓝色 白字 实心', second.refineToken)
  assert.deepEqual([first.refinement, spaced.refinement, second.refinement, third.refinement], ['initial', 'refined', 'refined', 'refined'])
  assert.ok(first.sourceCandidateCount >= 101)
  assert.equal(spaced.sourceCandidateCount, first.matchCount)
  assert.equal(second.sourceCandidateCount, spaced.matchCount)
  assert.equal(third.sourceCandidateCount, second.matchCount)
  assert.ok(first.matchCount >= second.matchCount)
  assert.ok(second.matchCount >= third.matchCount)
  const [firstIds, secondIds, thirdIds] = await Promise.all([allIds(first), allIds(second), allIds(third)])
  assert.ok([...secondIds].every(id => firstIds.has(id)))
  assert.ok([...thirdIds].every(id => secondIds.has(id)))
  assert.ok(first.units.every(unit => !Object.hasOwn(unit, 'visual') && !Object.hasOwn(unit, 'evidence')))
  const deleted = await post('按钮', third.refineToken)
  assert.equal(deleted.refinement, 'reset')
  assert.equal(deleted.sourceCandidateCount, first.sourceCandidateCount)
  assert.deepEqual(calls, [first.candidateCount, spaced.candidateCount, second.candidateCount, third.candidateCount]) // Deleted prefix is served from the cached full-topic result.
  t.diagnostic(`real published button topic: ${first.sourceCandidateCount} → ${first.matchCount} → ${second.matchCount} → ${third.matchCount}; deletion resets to ${deleted.sourceCandidateCount}`)
})

test('deletion, prefix rewrite, topic switch, revision change, and expired tokens reset to the full index', () => {
  const { index, byId } = corpus(80)
  const store = createRefinementStore({ maxEntries: 1 })
  const first = selectDiscoveryCandidates('button blue', index, byId, store)
  const token = store.save('button blue', index, first.candidates, first.candidates.map(({ unit }) => ({ id: unit.id, score: 2 })))
  for (const [query, changed] of [
    ['button', index],
    ['button red', index],
    ['button blue more', { ...index, theme: 'card' }],
    ['button blue more', { ...index, generatedAt: 'revision-2' }],
  ]) {
    const result = selectDiscoveryCandidates(query, changed, byId, store, token)
    assert.equal(result.refinement, 'reset')
    assert.equal(result.sourceCandidateCount, 80)
  }
  store.save('button blue more', index, first.candidates, [])
  const expired = selectDiscoveryCandidates('button blue more', index, byId, store, token)
  assert.equal(expired.refinement, 'reset')
  assert.equal(expired.resetReason, 'expired')
  assert.equal(expired.sourceCandidateCount, 80)
})

test('a zero-match refinement stays empty until the query is deleted or changed', () => {
  const { index, byId } = corpus(80)
  const store = createRefinementStore()
  const first = selectDiscoveryCandidates('button', index, byId, store)
  const token = store.save('button', index, first.candidates, [])
  const refined = selectDiscoveryCandidates('button blue', index, byId, store, token)
  assert.equal(refined.refinement, 'refined')
  assert.equal(refined.sourceCandidateCount, 0)
  assert.equal(refined.candidates.length, 0)
})

test('pending server shortlist narrows before model completion and rejects late commits',async()=>{
  const {index,byId}=corpus(8000)
  const store=createProvisionalSearchStore(),refinements=createRefinementStore()
  const sessionId='11111111-1111-4111-8111-111111111111'
  const load=async()=>({index,byId,searchLimit:32})
  const first=await store.prepare({sessionId,requestId:1,query:'button',load,refinements})
  assert.equal(first.sourceCandidateCount,8000)
  assert.equal(first.candidates.length,32)
  const previous=new Set(first.candidates.map(({unit})=>unit.id))
  const guarded={...index,units:new Proxy(index.units,{get(target,property,receiver){if(property==='length')return Reflect.get(target,property,receiver);throw Error('full index traversed during append')}})}
  const appended=await store.prepare({sessionId,requestId:2,query:'button blue',load:async()=>({index:guarded,byId,searchLimit:32}),refinements})
  assert.equal(appended.refinement,'provisional')
  assert.equal(appended.sourceCandidateCount,32)
  assert.ok(appended.candidates.every(({unit})=>previous.has(unit.id)))
  assert.equal(store.commit(sessionId,1,'button',index,[first.candidates[0].unit.id]),false)
  assert.equal(store.commit(sessionId,2,'button blue',index,appended.candidates.slice(0,5).map(({unit})=>unit.id)),true)
  const third=await store.prepare({sessionId,requestId:3,query:'button blue white',load:async()=>({index:guarded,byId,searchLimit:32}),refinements})
  assert.equal(third.sourceCandidateCount,5)
  assert.equal(third.refinement,'refined')
  const replay=await store.prepare({sessionId,requestId:3,query:'button blue white',load:async()=>({index:guarded,byId,searchLimit:32}),refinements})
  assert.equal(replay.sourceCandidateCount,5)
  assert.deepEqual(replay.candidates.map(({unit})=>unit.id),third.candidates.map(({unit})=>unit.id))
  const stale=await store.prepare({sessionId,requestId:2,query:'button blue',load,refinements})
  assert.equal(stale.stale,true)
  const deleted=await store.prepare({sessionId,requestId:4,query:'button',load,refinements})
  assert.equal(deleted.refinement,'reset')
  assert.equal(deleted.sourceCandidateCount,8000)
  const changedTopic=await store.prepare({sessionId,requestId:5,query:'button blue',load:async()=>({index:{...index,theme:'card'},byId,searchLimit:32}),refinements})
  assert.equal(changedTopic.refinement,'reset')
  assert.equal(changedTopic.sourceCandidateCount,8000)
  const changedRevision=await store.prepare({sessionId,requestId:6,query:'button blue more',load:async()=>({index:{...index,theme:'card',generatedAt:'revision-2'},byId,searchLimit:32}),refinements})
  assert.equal(changedRevision.refinement,'reset')
  assert.equal(changedRevision.sourceCandidateCount,8000)
  const widerTopic=await store.prepare({sessionId:'33333333-3333-4333-8333-333333333333',requestId:1,query:'button',load:async()=>({index,byId,searchLimit:50}),refinements})
  assert.equal(widerTopic.candidates.length,50)
})

test('HTTP append uses pending session shortlist while first model request is in flight', {timeout:15000},async t=>{
  let signalFirstStarted
  const firstStarted=new Promise(resolve=>{signalFirstStarted=resolve})
  const calls=[]
  const ranker=(query,candidates,{signal})=>{
    calls.push({query,ids:candidates.map(({unit})=>unit.id)})
    if(query==='按钮')return new Promise((resolve,reject)=>{
      signalFirstStarted()
      signal.addEventListener('abort',()=>reject(Error('FIRST_ABORTED')),{once:true})
    })
    return Promise.resolve({mode:'jev',model:'test-ranker',cost:'0',rows:candidates.map(({unit})=>({id:unit.id,score:2}))})
  }
  let middleware
  discoveryPlugin({ranker}).configureServer({middlewares:{use(fn){middleware=fn}}})
  const server=http.createServer((req,res)=>middleware(req,res,()=>{res.writeHead(404);res.end()}))
  server.listen(0,'127.0.0.1')
  await once(server,'listening')
  t.after(()=>server.close())
  const base=`http://127.0.0.1:${server.address().port}`
  const sessionId='22222222-2222-4222-8222-222222222222'
  const post=async(query,requestId)=>{
    const response=await fetch(`${base}/api/discovery/search`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query,scope:'curation',theme:'button',sessionId,requestId})})
    return {status:response.status,data:await response.json()}
  }
  const firstResponse=post('按钮',1)
  await firstStarted
  const second=await post('按钮 蓝色',2)
  assert.equal(second.status,200)
  assert.equal(second.data.refinement,'provisional')
  assert.equal(second.data.sourceCandidateCount,calls[0].ids.length)
  assert.ok(calls[1].ids.every(id=>calls[0].ids.includes(id)))
  assert.equal(second.data.matchCount,calls[1].ids.length)
  const first=await firstResponse
  assert.equal(first.status,503)
  const third=await post('按钮 蓝色 白字',3)
  assert.equal(third.status,200)
  assert.equal(third.data.refinement,'refined')
  assert.equal(third.data.sourceCandidateCount,second.data.matchCount)
  const stale=await post('按钮',1)
  assert.equal(stale.status,409)
  const deletion=await post('按钮 白字',4)
  assert.equal(deletion.status,200)
  assert.equal(deletion.data.refinement,'reset')
  assert.equal(deletion.data.sourceCandidateCount,second.data.totalIndexed)
})
