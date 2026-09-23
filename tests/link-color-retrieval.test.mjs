import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {applyModelRanking,explicitConflicts,rerankPool,wantsComponentInstance} from '../src/lib/component-discovery.js'
import {visualConstraints} from '../src/lib/component-constraints.js'
import {createRefinementStore,selectDiscoveryCandidates} from '../server/discovery-refinement.mjs'

const published=JSON.parse(fs.readFileSync(new URL('../public/data/discovery/index.json',import.meta.url),'utf8'))
const links=published.units.filter(unit=>unit.kind==='website-component'&&unit.componentType==='link')
const primary=links.find(unit=>unit.nameEn?.toLowerCase().includes('primary')&&unit.visual?.computed?.color==='rgb(64, 158, 255)')
const defaultLink=links.find(unit=>unit.id.endsWith('0d955a02b98fbfcde08d'))

test('ambiguous Link color reaches Jev while explicit paint roles remain hard constraints',()=>{
  assert.equal(links.length,16)
  assert.ok(primary&&defaultLink)
  assert.equal(wantsComponentInstance('蓝色带下划线的链接'),true)
  for(const query of ['蓝色带下划线的链接','悬停变蓝的链接']){
    const pool=rerankPool(query,links)
    assert.ok(pool.length>0,query)
    assert.ok(pool.some(row=>row.unit.id===primary.id),query)
    assert.deepEqual(explicitConflicts(query,primary),[],query)
  }
  assert.ok(visualConstraints('蓝色带下划线的链接').some(item=>item.implicit))
  assert.ok(visualConstraints('悬停变蓝的链接').some(item=>item.implicit&&item.role==='hoverBackground'))
  assert.deepEqual(explicitConflicts('蓝色文字链接',primary),[])
  assert.ok(explicitConflicts('蓝色文字链接',defaultLink).length>0)
  assert.ok(explicitConflicts('蓝色背景的链接',primary).length>0)
})

test('ambiguous Link recall still requires a qualifying Jev score',()=>{
  const query='蓝色带下划线的链接',index={scope:'curation',theme:'link',generatedAt:'link-regression',units:links},byId=new Map(links.map(unit=>[unit.id,unit])),store=createRefinementStore()
  const selected=selectDiscoveryCandidates(query,index,byId,store)
  assert.equal(selected.sourceCandidateCount,16)
  assert.ok(selected.candidates.length>0)
  const rejected=selected.candidates.map(({unit})=>({id:unit.id,score:0}))
  const token=store.save(query,index,selected.candidates,rejected)
  assert.equal(store.page(token,index,byId).total,0)
  assert.equal(applyModelRanking(query,links,[{id:primary.id,score:2}]).length,1)
})

test('bare blue still constrains Button fill and Link requests exclude whole sites',()=>{
  const unit={id:'button-blue',kind:'website-component',componentType:'button',visual:{computed:{background:'rgb(64, 158, 255)',color:'rgb(255, 255, 255)'}},offers:[]}
  assert.deepEqual(explicitConflicts('蓝色按钮',unit),[])
  assert.ok(explicitConflicts('蓝色按钮',{...unit,id:'button-red',visual:{computed:{background:'rgb(245, 108, 108)',color:'rgb(255, 255, 255)'}}}).length>0)
  assert.ok(explicitConflicts('蓝色链接',{id:'site',kind:'curated-site',offers:[]}).includes('需要具体组件实例，不能用整站代替'))
})
