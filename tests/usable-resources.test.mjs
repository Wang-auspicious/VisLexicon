import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createHash } from 'node:crypto'
import { parseRoute } from '../src/router.js'
import { filterResources, resourceHref } from '../src/lib/creative-resources.js'
import { USABLE_RESOURCE_TOPICS, matchesResourceTopic } from '../src/lib/usable-resource-topics.js'
const read = name => JSON.parse(fs.readFileSync(new URL(`../src/data/${name}.json`, import.meta.url)))
const ppt = read('presentation-resources'), graphics = read('graphics-resources')

test('new resources round-trip by ID and are searchable by either full title', () => {
  for (const row of [...ppt, ...graphics]) {
    const route = parseRoute(resourceHref(row))
    assert.equal(route.name, row.category)
    assert.equal(route.query.id, row.id)
    for (const query of [row.zh, row.en]) assert.ok(filterResources([...ppt, ...graphics], { category: row.category, query }).some(item => item.id === row.id), `${row.id}: ${query}`)
  }
  assert.equal(parseRoute('#/graphics/unknown').name, 'notfound')
  assert.ok(!read('resource-studies').some(row => row.category === 'ppt'))
  assert.ok([...ppt, ...graphics].every(row => !row.practice))
})

test('rights words query verified offers independently of title wording', () => {
  const source = ppt.find(row => row.offers?.some(offer => offer.sourceCost === 'free'))
  assert.ok(filterResources(ppt, {query: `免费 ${source.en}`}).some(row => row.id === source.id))
  const unknown = { ...source, offers: [{ ...source.offers[0], commercialUse: null }] }
  assert.deepEqual(filterResources([unknown], {query: `可商用 ${source.en}`}), [])
  const mixed = { ...source, offers: [{...source.offers[0],sourceAvailable:false},{...source.offers[0],sourceCost:'paid',access:'paid'}] }
  assert.deepEqual(filterResources([mixed], {query: '免费 源码'}), [])
  assert.equal(filterResources(graphics, {category:'ppt',query:'PSD'}).length, 0)
})

test('topic navigation remains short while covering every resource', () => {
  for (const [category, rows] of [['ppt',ppt],['graphics',graphics]]) {
    assert.ok(USABLE_RESOURCE_TOPICS[category].length <= 6)
    for (const row of rows) assert.ok(USABLE_RESOURCE_TOPICS[category].some(topic => matchesResourceTopic(row, topic.zh)), row.id)
  }
})

test('every graphics download is the exact displayed complete code', () => {
  for (const row of graphics) {
    const bytes = fs.readFileSync(new URL(`../public${row.source.localCodeUrl}`,import.meta.url))
    assert.equal(createHash('sha256').update(bytes).digest('hex'),row.codeSha256)
    assert.equal(bytes.toString('utf8'),row.execution.code)
    assert.equal(row.requiresPhotoshop,false)
    assert.equal(row.kz.length,row.kw.length)
    assert.ok(row.inputsEn?.length && row.outputsEn?.length && row.limitationsEn?.length)
  }
})
