import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { loadDiscoveryIndex } from '../server/discovery-index.mjs'
import { IMAGE_PROMPT_TOPICS, promptTheme } from '../src/lib/image-prompts.js'
import { applyModelRanking } from '../src/lib/component-discovery.js'
import { matchesRequirements } from '../src/lib/discovery-scopes.js'
import { resourceHref } from '../src/lib/creative-resources.js'
import { parseRoute } from '../src/router.js'
const root=fileURLToPath(new URL('..',import.meta.url))
const prompts=JSON.parse(fs.readFileSync(new URL('../src/data/image-prompts.json',import.meta.url),'utf8'))

test('image resources preserve the original adapted examples and add only reviewed source Skills',()=>{
  const adapted=prompts.filter(p=>p.resourceType!=='skill')
  const reviewed=prompts.filter(p=>p.verification==='source-reviewed-skill')
  assert.ok(adapted.length > 0)
  for(const skill of reviewed){
    assert.ok(skill.evidence?.length && skill.sourceDocumentUrl && skill.checkedAt)
    assert.equal(skill.promptKind,'original-source-link')
    assert.ok(skill.originalDocument?.unmodified, `${skill.id}: deliver the original file`)
    const documentBytes=fs.readFileSync(root+'/public'+skill.originalDocument.asset)
    assert.equal(createHash('sha256').update(documentBytes).digest('hex'),skill.originalDocument.sha256)
    if(skill.preview){
      const imageBytes=fs.readFileSync(root+'/public'+skill.preview)
      const digest=createHash('sha256').update(imageBytes).digest('hex')
      assert.ok(skill.sourceExamples.some(example=>example.status==='visually-reviewed'&&example.previewEligible&&example.sha256===digest),`${skill.id}: image must match reviewed original bytes`)
      assert.ok(['example','separate','combined'].includes(skill.comparison.kind))
      if(skill.comparison.kind==='separate'){
        for(const url of [skill.comparison.before,skill.comparison.after]){
          const bytes=fs.readFileSync(root+'/public'+url)
          const sha=createHash('sha256').update(bytes).digest('hex')
          assert.ok(skill.sourceExamples.some(example=>example.status==='visually-reviewed'&&example.sha256===sha))
        }
      }
      assert.equal(skill.exampleReproduced,false)
    }else{
      assert.ok(skill.originalDocument.excerpt && skill.originalDocument.licenseAsset, `${skill.id}: display a complete source document instead of an empty frame`)
    }
  }
  assert.equal(adapted.length, prompts.length - reviewed.length)
  assert.equal(new Set(prompts.map(p=>p.id)).size,prompts.length)
  assert.equal(new Set(adapted.map(p=>p.sourceUrl)).size,adapted.length)
  for(const p of adapted){
    assert.ok(p.prompt.length>=100)
    assert.equal(p.promptKind,'editorial-adaptation')
    assert.equal(p.exampleReproduced,false)
    assert.equal(Object.hasOwn(p,'originalPrompt'),false)
    assert.ok(p.imageCredit && p.sourceName && p.topicZh)
    assert.equal(new URL(p.sourceUrl).protocol,'https:')
    assert.match(p.preview,/^\/images\/image-prompts\/[a-z0-9-]+\.(jpg|png|webp)$/)
    assert.ok(fs.statSync(root+'/public'+p.preview).size>1000)
    const route=parseRoute(resourceHref(p))
    assert.equal(route.params.resourceType,'image')
    assert.equal(route.query.id,p.id)
  }
})

test('X additions carry dated original links, collection provenance and distinct examples',()=>{
  const additions=prompts.filter(p=>p.id.startsWith('x-'))
  assert.equal(additions.length, prompts.filter(p=>p.id.startsWith('x-')).length)
  const hashes=new Set()
  for(const p of additions){
    assert.match(p.sourceUrl,/^https:\/\/x\.com\/[^/]+\/status\/\d+$/)
    assert.ok(Number.isFinite(Date.parse(p.publishedAt)))
    assert.ok(p.collectorUrl && p.sourceVerification?.method && p.sourceVerification?.noteZh)
    const bytes=fs.readFileSync(root+'/public'+p.preview)
    const signature=createHash('sha256').update(bytes).digest('hex')
    assert.ok(!hashes.has(signature),`Duplicate example: ${p.id}`)
    hashes.add(signature)
  }
})

test('image search and selected subject reject cross-section and cross-topic model IDs',async()=>{
  const all=await loadDiscoveryIndex(root,'skills','image')
  assert.equal(all.units.length,prompts.length)
  assert.ok(all.units.every(u=>u.kind==='image-prompt'&&u.verification!=='capture-v2-reviewed'))
  const topic=prompts.find(p=>p.topicZh)?.topicZh || '全部',selected=await loadDiscoveryIndex(root,'skills',promptTheme(topic))
  assert.equal(selected.units.length,prompts.filter(p=>p.topicZh===topic).length)
  const wrong=all.units.find(u=>!u.themes.includes(promptTheme(topic)))
  if (wrong) assert.deepEqual(applyModelRanking('玩偶',selected.units,[{id:wrong.id,score:3},{id:'fabricated-prompt',score:3}]),[])
  assert.ok(all.units.every(u=>!matchesRequirements('免费模型可商用',u)))
  const atlas=await loadDiscoveryIndex(root,'atlas')
  assert.ok(atlas.units.every(u=>u.kind!=='image-prompt'))
})

test('invalid gallery topic falls back to the same image universe used by search',()=>{
  const topics=prompts.map(p=>p.topicZh)
  assert.ok([...new Set(topics)].every(topic => IMAGE_PROMPT_TOPICS.includes(topic)))
  assert.equal(promptTheme('不存在的分类',topics),'image')
  assert.equal(promptTheme('不存在的分类'),'image')
  assert.equal(promptTheme('全部',topics),'image')
  assert.equal(promptTheme('玩具与手办',topics),topics.includes('玩具与手办')?'image:玩具与手办':'image')
})
