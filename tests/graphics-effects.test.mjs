import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { resourceHref } from '../src/lib/creative-resources.js'
import creativeResources from '../src/lib/creative-practices.js'

const root=fileURLToPath(new URL('..',import.meta.url))
const effects=JSON.parse(fs.readFileSync(new URL('../src/data/graphics-effects.json',import.meta.url),'utf8'))
const graphicsScope=JSON.parse(fs.readFileSync(new URL('../public/data/discovery/scopes/graphics.json',import.meta.url),'utf8'))

test('image-processing cards expose only reviewed effect examples with real, distinct before/after images and prompts',()=>{
  assert.equal(effects.length,2)
  assert.equal(new Set(effects.map(effect=>effect.id)).size,effects.length)
  assert.equal(new Set(effects.map(effect=>effect.sourceUrl)).size,effects.length)
  assert.equal(graphicsScope.units.length,effects.length)
  assert.deepEqual(creativeResources.filter(item=>item.category==='graphics').map(item=>item.id).sort(),effects.map(item=>item.id).sort())
  for(const effect of effects){
    assert.equal(effect.resourceType,'image-effect')
    assert.equal(effect.category,'graphics')
    assert.ok(effect.prompt.length>100)
    assert.ok(effect.promptEn.length>100)
    assert.ok(effect.prompt.includes('【替换成你的文字】')||effect.prompt.includes('【replace with your text】'))
    assert.equal(new Set([effect.comparison.before,effect.comparison.after]).size,2)
    assert.ok(graphicsScope.units.some(unit=>unit.nameZh===effect.titleZh))
    for(const src of [effect.comparison.before,effect.comparison.after]){
      const bytes=fs.readFileSync(root+'/public'+src)
      assert.ok(bytes.length>1000)
      assert.ok(src.startsWith('/image-effects/'))
    }
    const before=fs.readFileSync(root+'/public'+effect.comparison.before)
    const after=fs.readFileSync(root+'/public'+effect.comparison.after)
    assert.notEqual(createHash('sha256').update(before).digest('hex'),createHash('sha256').update(after).digest('hex'))
    assert.equal(resourceHref(effect),`#/graphics?id=${effect.id}`)
  }
  const sphere=effects.find(effect=>effect.id==='sphere-text-wrap-001')
  const fabric=effects.find(effect=>effect.id==='fabric-fold-text-print-002')
  assert.match(sphere.prompt,/沿球面形成清晰的浅弧线/u)
  assert.match(sphere.prompt,/靠近两侧的字形明显变窄/u)
  assert.match(fabric.prompt,/明显布褶横穿多个字母/u)
  assert.match(fabric.prompt,/织物凹陷处压缩笔画/u)
  assert.doesNotMatch(fabric.prompt,/球面/u)
})
