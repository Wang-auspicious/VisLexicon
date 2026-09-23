import test from 'node:test'
import assert from 'node:assert/strict'
import { selectJevCandidates } from '../src/lib/use-jev-search.js'
import { searchAll } from '../src/lib/search-index.js'

test('global Jev candidate refinements only visit completed matches from an 8000-item set', t => {
  const units=Array.from({length:8000},(_,i)=>({
    id:`button-${i}`,kind:'website-component',componentType:'button',nameZh:`按钮 ${i}`,
    tags:['按钮'],descriptionZh:'可点击按钮',visual:{style:'solid',computed:{background:i%2?'rgb(0,100,220)':'rgb(220,220,220)',color:'rgb(255,255,255)'}},
  }))
  const start=performance.now(),first=selectJevCandidates('按钮',units,null)
  const initialMs=performance.now()-start
  assert.equal(first.sourceCandidateCount,8000)
  assert.equal(first.candidates.length,50)
  assert.ok(selectJevCandidates('按钮 7999',units,null).candidates.some(unit=>unit.id==='button-7999'))
  const matches=first.candidates.slice(0,24)
  let fullReads=0
  const guarded=new Proxy(units,{get(target,key,receiver){
    if(key==='length')return Reflect.get(target,key,receiver)
    fullReads++;throw new Error(`full corpus read: ${String(key)}`)
  }})
  const refinedStart=performance.now(),second=selectJevCandidates('按钮 蓝色',guarded,{query:'按钮',matches})
  const refinedMs=performance.now()-refinedStart
  assert.equal(second.refined,true)
  assert.equal(second.sourceCandidateCount,24)
  assert.ok(second.candidates.every(unit=>matches.includes(unit)))
  assert.equal(fullReads,0)
  const repeated=selectJevCandidates('按钮 蓝色',guarded,{query:'按钮 蓝色',candidates:second.candidates,matches:second.candidates})
  assert.deepEqual(repeated.candidates.map(unit=>unit.id),second.candidates.map(unit=>unit.id))
  const deleted=selectJevCandidates('按钮',units,{query:'按钮 蓝色',matches:second.candidates})
  assert.equal(deleted.refined,false)
  assert.equal(deleted.sourceCandidateCount,8000)
  t.diagnostic(`8000 initial units ${initialMs.toFixed(1)} ms; refined 24 units ${refinedMs.toFixed(1)} ms; full-index reads ${fullReads}`)
})

test('global lexical groups reuse full previous matches, not only visible six', () => {
  const sites=Array.from({length:8000},(_,i)=>({id:`site-${i}`,kind:'site',name:`Button ${i}`,domain:`site${i}.example`,text:`button ${i} ${i%2?'blue':'gray'}`}))
  const first=searchAll({terms:[],sites},'button 17',Infinity)
  assert.ok(first.siteTotal>6)
  const second=searchAll({terms:first.terms,sites:first.sites},'button 17 blue',Infinity)
  assert.ok(second.siteTotal<=first.siteTotal)
  assert.ok(second.sites.every(site=>first.sites.some(previous=>previous.id===site.id)))
})
