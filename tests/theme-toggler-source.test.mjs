import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'

const root = path.resolve('public/data/component-code')
const id = 'registry-magicui-design-animated-theme-toggler-8aafddb4'
const json = async file => JSON.parse(await readFile(file, 'utf8'))

test('theme toggler keeps original source, license, working preview assets and real parameters', async () => {
  const [{ units }, item, scope] = await Promise.all([
    json(path.join(root, 'discovery.json')),
    json(path.join(root, 'items', `${id}.json`)),
    json('public/data/discovery/scopes/curation.json'),
  ])
  assert.equal(units.filter(unit => unit.id === id).length, 1)
  assert.equal(scope.units.filter(unit => unit.id === id).length, 1)
  assert.equal(item.preview.status, 'verified')
  assert.equal(item.license.spdx, 'MIT')
  assert.match(item.license.text, /Copyright \(c\) Magic UI/)
  assert.match(item.license.url, new RegExp(item.commit))
  for (const file of item.files) {
    const bytes = Buffer.from(file.content, 'utf8')
    assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256)
    assert.equal(createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'), file.gitBlob)
    assert.match(file.sourceUrl, new RegExp(item.commit))
  }
  assert.deepEqual(item.controls.map(control => control.key), ['duration', 'fromCenter', 'variant'])
  assert.deepEqual(item.controls.find(control => control.key === 'variant').options, ['circle', 'square', 'triangle', 'diamond', 'hexagon', 'rectangle', 'star'])
  const previewPath = path.join(root, item.preview.url.slice('/data/component-code/'.length))
  const html = await readFile(previewPath, 'utf8')
  for (const match of html.matchAll(/\/data\/component-code\/shared\/([\w.-]+)/g)) await readFile(path.join(root, 'shared', match[1]))
  await readFile(path.join(root, item.preview.posterUrl.slice('/data/component-code/'.length)))
  const headers = await readFile('public/_headers', 'utf8')
  assert.match(headers, /\/data\/component-code\/shared\/\*\s+Access-Control-Allow-Origin: \*/)
})
