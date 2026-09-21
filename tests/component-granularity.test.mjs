import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { lexicalCandidates, rerankPool, applyModelRanking } from '../src/lib/component-discovery.js'
import { loadComponentDrafts } from '../server/component-drafts.mjs'

const site={id:'site--magic-ui',kind:'curated-site',componentType:'website',nameZh:'黑白动效按钮组件库',tags:['button'],descriptionZh:'按钮网站'}
const button={id:'button--example',kind:'website-component',componentType:'button',nameZh:'黑白动效按钮',tags:['button'],descriptionZh:'具体按钮'}
const query='我想找一套带动效的黑白风格的button组件'
test('component queries cannot substitute a whole website, even with a high model score',()=>{
  assert.deepEqual(lexicalCandidates(query,[site,button]).map(x=>x.unit.id),[button.id])
  assert.deepEqual(rerankPool(query,[site]).map(x=>x.unit.id),[])
  assert.deepEqual(applyModelRanking(query,[site,button],[{id:site.id,score:3},{id:button.id,score:2}]).map(x=>x.unit.id),[button.id])
})
test('an explicit request for component libraries still allows website results',()=>{
  assert.ok(rerankPool('有源码的免费组件库',[{...site,offers:[{verified:true,checkedAt:'2026-09-21',evidenceUrls:['https://example.org'],sourceAvailable:true,sourceUrl:'https://example.org',sourceCost:'free',access:'free'}]}]).length)
  assert.ok(rerankPool('推荐提供 button 的网站',[site]).length)
})
test('local draft projection preserves observed instances without exposing private evidence or publishing them',async t=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'vislexicon-button-drafts-'))
  t.after(()=>fs.rm(root,{recursive:true,force:true}))
  assert.deepEqual(await loadComponentDrafts(root),{units:[],count:0,variants:0})
  await fs.mkdir(path.join(root,'data/discovery'),{recursive:true})
  await fs.writeFile(path.join(root,'data/discovery/legacy-index.json'),JSON.stringify({units:[
    {...button,variantId:'v1',evidence:{rawFile:'private.json'},review:{status:'pending'}},
    {...button,id:'button--state',variantId:'v1'},
    {...site,kind:'atlas-effect'},
  ]}))
  const archive=await loadComponentDrafts(root)
  assert.equal(archive.count,2)
  assert.equal(archive.variants,1)
  assert.ok(archive.units.every(unit=>unit.verification==='draft'&&!unit.evidence&&!unit.review))
})
