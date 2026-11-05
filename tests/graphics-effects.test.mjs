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
  assert.equal(effects.length,1)
  const [effect]=effects
  assert.equal(effect.resourceType,'image-effect')
  assert.equal(effect.category,'graphics')
  assert.equal(graphicsScope.units.length,1)
  assert.equal(graphicsScope.units[0].nameZh,effect.titleZh)
  assert.deepEqual(creativeResources.filter(item=>item.category==='graphics').map(item=>item.id),[effect.id])
  assert.ok(effect.prompt.length>100)
  assert.match(effect.prompt,/【替换成你的文字】/u)
  assert.match(effect.prompt,/沿球面形成清晰的浅弧线/u)
  assert.match(effect.prompt,/靠近两侧的字形明显变窄/u)
  assert.match(effect.prompt,/保持球体形状、视角、背景、构图和光线不变/u)
  assert.equal(new Set([effect.comparison.before,effect.comparison.after]).size,2)
  for(const src of [effect.comparison.before,effect.comparison.after]){
    const bytes=fs.readFileSync(root+'/public'+src)
    assert.ok(bytes.length>1000)
    assert.ok(src.startsWith('/image-effects/'))
  }
  const before=fs.readFileSync(root+'/public'+effect.comparison.before)
  const after=fs.readFileSync(root+'/public'+effect.comparison.after)
  assert.notEqual(createHash('sha256').update(before).digest('hex'),createHash('sha256').update(after).digest('hex'))
  assert.equal(resourceHref(effect),'#/graphics?id=sphere-text-wrap-001')
})
