import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { gzipSync } from 'node:zlib'
import { projectSiteCard } from '../scripts/site-list-projection.mjs'
import { heatScoreOf } from '../src/lib/curation-selectors.js'
import { isPublicAsset } from '../scripts/runtime-data-plugin.mjs'
import { mergeResourceKits, RESOURCE_KITS } from '../src/lib/resource-kits.js'
import { filterResources, resourceHref } from '../src/lib/creative-resources.js'

test('card projection preserves identity, visible rights and heat ordering without evidence payload', () => {
  const source=JSON.parse(fs.readFileSync(new URL('../public/data/site-index.json',import.meta.url))).items
  const projected=source.map(projectSiteCard)
  assert.ok(gzipSync(JSON.stringify(projected)).length<=150*1024)
  for(let i=0;i<source.length;i++){
    assert.deepEqual(heatScoreOf(projected[i]),heatScoreOf(source[i]))
    assert.deepEqual(projected[i].licenses,source[i].licenses)
    assert.equal(projected[i].evidenceSummary,undefined)
    assert.equal(projected[i].entryId,source[i].entryId)
  }
})
test('production boundary excludes the capture corpus but retains public scoped indexes',()=>{
  for(const file of ['data/discovery/index.json','data/discovery/v4/shots/a.jpg','data/discovery/evidence/a.json','data/curation-review/index.json'])assert.equal(isPublicAsset(file),false,file)
  assert.equal(isPublicAsset('data/discovery/scopes/science.json'),true)
})
test('all three kits are ordinary searchable resources and deduplicated before counts',()=>{
  const all=mergeResourceKits([...RESOURCE_KITS,{id:'old',category:'science',zh:'other'}])
  assert.equal(all.length,4)
  for(const kit of RESOURCE_KITS){
    assert.equal(filterResources(all,{category:kit.category,query:kit.zh})[0].id,kit.id)
    assert.equal(resourceHref(kit),`#/${kit.category}?id=${kit.id}`)
    assert.equal(filterResources([kit],{query:'免费 可商用'}).length,0)
  }
})
