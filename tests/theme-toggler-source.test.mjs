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

test('gradient text preserves upstream component/example and exposes working parameters', async () => {
  const id = 'registry-magicui-design-animated-gradient-text-773676d2'
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
  assert.ok(item.files.some(file => file.originalPath.endsWith('/animated-gradient-text-demo.tsx')))
  for (const file of item.files) {
    const bytes = Buffer.from(file.content, 'utf8')
    assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256)
    assert.equal(createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'), file.gitBlob)
    assert.match(file.sourceUrl, new RegExp(item.commit))
  }
  assert.deepEqual(item.controls.map(control => control.key), ['speed', 'colorFrom', 'colorTo'])
  await readFile(path.join(root, item.preview.url.slice('/data/component-code/'.length)))
  await readFile(path.join(root, item.preview.posterUrl.slice('/data/component-code/'.length)))
})

test('shiny text preserves its original example and real shimmer width', async () => {
  const id = 'registry-magicui-design-animated-shiny-text-1cfac18d'
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
  assert.ok(item.files.some(file => file.originalPath.endsWith('/animated-shiny-text-demo.tsx')))
  for (const file of item.files) {
    const bytes = Buffer.from(file.content, 'utf8')
    assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256)
    assert.equal(createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'), file.gitBlob)
    assert.match(file.sourceUrl, new RegExp(item.commit))
  }
  assert.deepEqual(item.controls.map(control => control.key), ['shimmerWidth'])
  await readFile(path.join(root, item.preview.url.slice('/data/component-code/'.length)))
  await readFile(path.join(root, item.preview.posterUrl.slice('/data/component-code/'.length)))
})

test('animated grid preserves the upstream source and compatible Motion 12 notice', async () => {
  const id = 'registry-magicui-design-animated-grid-pattern-ebfe7efc'
  const [{ units }, item, scope, notices] = await Promise.all([
    json(path.join(root, 'discovery.json')),
    json(path.join(root, 'items', `${id}.json`)),
    json('public/data/discovery/scopes/curation.json'),
    json(path.join(root, 'shared', 'third-party.json')),
  ])
  assert.equal(units.filter(unit => unit.id === id).length, 1)
  assert.equal(scope.units.filter(unit => unit.id === id).length, 1)
  assert.equal(item.preview.status, 'verified')
  assert.equal(item.license.spdx, 'MIT')
  assert.match(item.license.text, /Copyright \(c\) Magic UI/)
  assert.match(item.license.url, new RegExp(item.commit))
  assert.ok(item.files.some(file => file.originalPath.endsWith('/animated-grid-pattern-demo.tsx')))
  for (const file of item.files) {
    const bytes = Buffer.from(file.content, 'utf8')
    assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256)
    assert.equal(createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'), file.gitBlob)
    assert.match(file.sourceUrl, new RegExp(item.commit))
  }
  assert.deepEqual(item.controls.map(control => control.key), ['width', 'height', 'x', 'y', 'strokeDasharray', 'numSquares', 'maxOpacity', 'duration', 'repeatDelay'])
  assert.ok(item.dependencies.includes('motion@^12.23.12'))
  const executable = await readFile(path.join(root, 'previews', id, 'component.mjs'), 'utf8')
  const notice = notices.find(n => n.package === 'motion' && n.version === '12.23.12' && n.module && executable.includes(n.module))
  assert.equal(notice?.license, 'MIT')
  assert.ok(notice.text.includes('Permission is hereby granted'))
  await readFile(path.join(root, 'shared', notice.module))
  await readFile(path.join(root, item.preview.url.slice('/data/component-code/'.length)))
  await readFile(path.join(root, item.preview.posterUrl.slice('/data/component-code/'.length)))
})

test('ripple button preserves upstream source and its two actual props', async () => {
  const id = 'registry-magicui-design-ripple-button-febbe648'
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
  assert.ok(item.files.some(file => file.originalPath.endsWith('/ripple-button-demo.tsx')))
  for (const file of item.files) {
    const bytes = Buffer.from(file.content, 'utf8')
    assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256)
    assert.equal(createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'), file.gitBlob)
    assert.match(file.sourceUrl, new RegExp(item.commit))
  }
  assert.deepEqual(item.controls.map(control => control.key), ['rippleColor', 'duration'])
  const css = await readFile(path.join(root, 'previews', id, 'registry.css'), 'utf8')
  assert.match(css, /\.animate-rippling\{animation:rippling var\(--duration\) ease-out\}/)
  await readFile(path.join(root, item.preview.url.slice('/data/component-code/'.length)))
  await readFile(path.join(root, item.preview.posterUrl.slice('/data/component-code/'.length)))
})

test('rainbow button preserves upstream source and dependency notices', async () => {
  const id = 'registry-magicui-design-rainbow-button-5a6441fe'
  const [{ units }, item, scope, notices] = await Promise.all([
    json(path.join(root, 'discovery.json')),
    json(path.join(root, 'items', `${id}.json`)),
    json('public/data/discovery/scopes/curation.json'),
    json(path.join(root, 'shared', 'third-party.json')),
  ])
  assert.equal(units.filter(unit => unit.id === id).length, 1)
  assert.equal(scope.units.filter(unit => unit.id === id).length, 1)
  assert.equal(item.preview.status, 'verified')
  assert.equal(item.license.spdx, 'MIT')
  assert.match(item.license.text, /Copyright \(c\) Magic UI/)
  assert.match(item.license.url, new RegExp(item.commit))
  assert.ok(item.files.some(file => file.originalPath.endsWith('/rainbow-button-demo.tsx')))
  for (const file of item.files) {
    const bytes = Buffer.from(file.content, 'utf8')
    assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256)
    assert.equal(createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'), file.gitBlob)
    assert.match(file.sourceUrl, new RegExp(item.commit))
  }
  assert.deepEqual(item.controls.map(control => control.key), ['variant', 'size', 'disabled'])
  const js = await readFile(path.join(root, 'previews', id, 'component.mjs'), 'utf8')
  for (const [name, license] of [['@radix-ui/react-slot', 'MIT'], ['class-variance-authority', 'Apache-2.0']]) {
    const notice = notices.find(n => n.package === name && n.module && js.includes(n.module))
    assert.equal(notice?.license, license)
    assert.ok(notice.text.length > 100)
    await readFile(path.join(root, 'shared', notice.module))
  }
  assert.ok(notices.some(n => n.package === '@radix-ui/react-compose-refs' && n.license === 'MIT'))
  await readFile(path.join(root, item.preview.posterUrl.slice('/data/component-code/'.length)))
})

test('marquee preserves upstream source and the CSS cascade for real controls', async () => {
  const id = 'registry-magicui-design-marquee-2bdeb1cc'
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
  assert.ok(item.files.some(file => file.originalPath.endsWith('/marquee-demo.tsx')))
  for (const file of item.files) {
    const bytes = Buffer.from(file.content, 'utf8')
    assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256)
    assert.equal(createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'), file.gitBlob)
    assert.match(file.sourceUrl, new RegExp(item.commit))
  }
  assert.deepEqual(item.controls.map(control => control.key), ['reverse', 'pauseOnHover', 'vertical', 'repeat'])
  const html = await readFile(path.join(root, 'previews', id, 'index.html'), 'utf8')
  const css = await readFile(path.join(root, 'previews', id, 'registry.css'), 'utf8')
  assert.ok(html.indexOf('registry.css') < html.indexOf('codex-marquee-controlled.css'))
  assert.match(css, /@layer utilities\{\.animate-marquee/)
  await readFile(path.join(root, item.preview.posterUrl.slice('/data/component-code/'.length)))
})

test('dual-row marquee retains original identity and verified source', async () => {
  const id = 'v4-magic-ui-bfbe2cc3a480'
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
  assert.ok(item.files.some(file => file.originalPath.endsWith('/marquee-demo.tsx')))
  for (const file of item.files) {
    const bytes = Buffer.from(file.content, 'utf8')
    assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256)
    assert.equal(createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'), file.gitBlob)
    assert.match(file.sourceUrl, new RegExp(item.commit))
  }
  assert.deepEqual(item.controls.map(control => control.key), ['reverse', 'pauseOnHover', 'repeat', 'duration'])
  assert.equal(item.controls.find(control => control.key === 'duration').prop, 'Marquee.style.--duration')
  await readFile(path.join(root, item.preview.url.slice('/data/component-code/'.length)))
  await readFile(path.join(root, item.preview.posterUrl.slice('/data/component-code/'.length)))
})

test('captured moon button keeps its ID and verified Magic UI source', async () => {
  const id = 'v4-magic-ui-3823db34ed4c'
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
  assert.ok(item.files.some(file => file.originalPath.endsWith('/animated-theme-toggler.tsx')))
  for (const file of item.files) {
    const bytes = Buffer.from(file.content, 'utf8')
    assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256)
    assert.equal(createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'), file.gitBlob)
    assert.match(file.sourceUrl, new RegExp(item.commit))
  }
  assert.deepEqual(item.controls.map(control => control.key), ['duration', 'fromCenter', 'variant'])
  await readFile(path.join(root, item.preview.url.slice('/data/component-code/'.length)))
  await readFile(path.join(root, item.preview.posterUrl.slice('/data/component-code/'.length)))
})

test('captured gradient pill retains its identity and original source', async () => {
  const id = 'v4-magic-ui-5ff58db41885'
  const [{ units }, item, scope] = await Promise.all([
    json(path.join(root, 'discovery.json')),
    json(path.join(root, 'items', `${id}.json`)),
    json('public/data/discovery/scopes/curation.json'),
  ])
  assert.equal(units.filter(unit => unit.id === id).length, 1)
  assert.equal(scope.units.filter(unit => unit.id === id).length, 0)
  const { loadDiscoveryIndex } = await import('../server/discovery-index.mjs')
  const merged = await loadDiscoveryIndex(process.cwd(), 'curation')
  assert.equal(merged.units.filter(unit => unit.id === id).length, 1)
  assert.equal(item.preview.status, 'verified')
  assert.equal(item.license.spdx, 'MIT')
  assert.match(item.license.text, /Copyright \(c\) Magic UI/)
  assert.match(item.license.url, new RegExp(item.commit))
  assert.ok(item.files.some(file => file.originalPath.endsWith('/animated-gradient-text-demo.tsx')))
  for (const file of item.files) {
    const bytes = Buffer.from(file.content, 'utf8')
    assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256)
    assert.equal(createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'), file.gitBlob)
    assert.match(file.sourceUrl, new RegExp(item.commit))
  }
  assert.deepEqual(item.controls.map(control => control.key), ['speed', 'colorFrom', 'colorTo'])
  await readFile(path.join(root, item.preview.url.slice('/data/component-code/'.length)))
  await readFile(path.join(root, item.preview.posterUrl.slice('/data/component-code/'.length)))
})

test('captured shiny pill keeps its identity and original source', async () => {
  const id = 'v4-magic-ui-1fc918e4ca23'
  const [{ units }, item, scope] = await Promise.all([
    json(path.join(root, 'discovery.json')),
    json(path.join(root, 'items', `${id}.json`)),
    json('public/data/discovery/scopes/curation.json'),
  ])
  assert.equal(units.filter(unit => unit.id === id).length, 1)
  assert.equal(scope.units.filter(unit => unit.id === id).length, 0)
  const { loadDiscoveryIndex } = await import('../server/discovery-index.mjs')
  const merged = await loadDiscoveryIndex(process.cwd(), 'curation')
  assert.equal(merged.units.filter(unit => unit.id === id).length, 1)
  assert.equal(item.preview.status, 'verified')
  assert.equal(item.license.spdx, 'MIT')
  assert.match(item.license.text, /Copyright \(c\) Magic UI/)
  assert.match(item.license.url, new RegExp(item.commit))
  assert.ok(item.files.some(file => file.originalPath.endsWith('/animated-shiny-text-demo.tsx')))
  for (const file of item.files) {
    const bytes = Buffer.from(file.content, 'utf8')
    assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256)
    assert.equal(createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'), file.gitBlob)
    assert.match(file.sourceUrl, new RegExp(item.commit))
  }
  assert.deepEqual(item.controls.map(control => control.key), ['shimmerWidth'])
  await readFile(path.join(root, item.preview.url.slice('/data/component-code/'.length)))
  await readFile(path.join(root, item.preview.posterUrl.slice('/data/component-code/'.length)))
})

test('captured typing animation keeps its identity and original source', async () => {
  const id = 'v4-magic-ui-0db70da7b778'
  const [{ units }, item, scope] = await Promise.all([
    json(path.join(root, 'discovery.json')),
    json(path.join(root, 'items', `${id}.json`)),
    json('public/data/discovery/scopes/curation.json'),
  ])
  assert.equal(units.filter(unit => unit.id === id).length, 1)
  assert.equal(scope.units.filter(unit => unit.id === id).length, 0)
  const { loadDiscoveryIndex } = await import('../server/discovery-index.mjs')
  const merged = await loadDiscoveryIndex(process.cwd(), 'curation')
  assert.equal(merged.units.filter(unit => unit.id === id).length, 1)
  assert.equal(item.preview.status, 'verified')
  assert.equal(item.license.spdx, 'MIT')
  assert.match(item.license.text, /Copyright \(c\) Magic UI/)
  assert.match(item.license.url, new RegExp(item.commit))
  assert.ok(item.files.some(file => file.originalPath.endsWith('/typing-animation-demo.tsx')))
  for (const file of item.files) {
    const bytes = Buffer.from(file.content, 'utf8')
    assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256)
    assert.equal(createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'), file.gitBlob)
    assert.match(file.sourceUrl, new RegExp(item.commit))
  }
  assert.deepEqual(item.controls.map(control => control.key), ['duration', 'delay', 'loop', 'showCursor', 'blinkCursor', 'cursorStyle'])
  await readFile(path.join(root, item.preview.url.slice('/data/component-code/'.length)))
  await readFile(path.join(root, item.preview.posterUrl.slice('/data/component-code/'.length)))
})

test('captured line shadow keeps its identity and original source', async () => {
  const id = 'v4-magic-ui-9616e077cfa4'
  const [{ units }, item, scope] = await Promise.all([
    json(path.join(root, 'discovery.json')),
    json(path.join(root, 'items', `${id}.json`)),
    json('public/data/discovery/scopes/curation.json'),
  ])
  assert.equal(units.filter(unit => unit.id === id).length, 1)
  assert.equal(scope.units.filter(unit => unit.id === id).length, 0)
  const { loadDiscoveryIndex } = await import('../server/discovery-index.mjs')
  const merged = await loadDiscoveryIndex(process.cwd(), 'curation')
  assert.equal(merged.units.filter(unit => unit.id === id).length, 1)
  assert.equal(item.preview.status, 'verified')
  assert.equal(item.license.spdx, 'MIT')
  assert.match(item.license.text, /Copyright \(c\) Magic UI/)
  assert.match(item.license.url, new RegExp(item.commit))
  assert.ok(item.files.some(file => file.originalPath.endsWith('/line-shadow-text-demo.tsx')))
  for (const file of item.files) {
    const bytes = Buffer.from(file.content, 'utf8')
    assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256)
    assert.equal(createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'), file.gitBlob)
    assert.match(file.sourceUrl, new RegExp(item.commit))
  }
  assert.deepEqual(item.controls.map(control => control.key), ['text', 'shadowColor'])
  await readFile(path.join(root, item.preview.url.slice('/data/component-code/'.length)))
  await readFile(path.join(root, item.preview.posterUrl.slice('/data/component-code/'.length)))
})
