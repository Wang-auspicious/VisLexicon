import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { parseRoute } from '../src/router.js'
import { filterResources, resourceHref, resourceSection, RESOURCE_SECTIONS } from '../src/lib/creative-resources.js'

const resources = JSON.parse(fs.readFileSync(new URL('../src/data/creative-resources.json', import.meta.url), 'utf8').replace(/^\uFEFF/, ''))

test('resource links round-trip to their category, including exact names and filters', () => {
  for (const resource of resources) {
    const route = parseRoute(resourceHref(resource))
    assert.equal(resourceSection(route.name, route.params.resourceType), resource.category)
    assert.equal(route.query.q, resource.title)
    assert.ok(filterResources(resources, { category: resource.category, query: route.query.q }).some((item) => item.id === resource.id))
  }
  assert.equal(parseRoute('#/skills').params.resourceType, 'design')
  for (const path of ['#/skills/unknown', '#/skills/design/extra', '#/ppt/extra', '#/science/extra']) {
    assert.equal(parseRoute(path).name, 'notfound')
  }
})

test('starter resources retain direct sources and collection provenance without claiming publication', () => {
  assert.equal(new Set(resources.map((item) => item.id)).size, resources.length)
  assert.equal(new Set(resources.map((item) => item.url)).size, resources.length)
  for (const category of new Set(resources.map(item => item.category))) {
    assert.ok(RESOURCE_SECTIONS[category])
    const members = filterResources(resources, { category })
    assert.ok(members.some((item) => item.type === 'collection'))
    assert.ok(members.some((item) => item.type === 'resource'))
  }
  for (const item of resources) {
    assert.equal(item.status, 'seed')
    assert.ok(item.descriptionZh && item.descriptionEn && item.tags.length)
    for (const link of [item.url, item.evidenceUrl, item.collectedFrom].filter(Boolean)) {
      assert.equal(new URL(link).protocol, 'https:')
      assert.equal(new URL(link).hostname, 'github.com')
    }
    if (item.type === 'resource') {
      assert.ok(resources.some((source) => source.type === 'collection' && source.url === item.collectedFrom))
    }
  }
})

test('directory search combines category, type, Chinese keywords, and normalized Latin queries', () => {
  assert.deepEqual(filterResources(resources, { category: 'image', kind: 'resource', query: '信息图 手绘' }).map((item) => item.id), ['image-hand-drawn-infographic'])
  assert.deepEqual(filterResources(resources, { category: 'design', kind: 'resource', query: '  ＭＩＮＩＭＡＬ  ' }).map((item) => item.id), ['design-minimal'])
  assert.equal(filterResources(resources, { category: 'science', query: 'reveal.js' }).length, 0)
  assert.equal(filterResources(resources, { query: 'absolutely-no-such-resource' }).length, 0)
  assert.equal(filterResources(resources, { query: '   ' }).length, resources.length)
})
