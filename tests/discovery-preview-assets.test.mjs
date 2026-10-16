import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { discoveryPreviewAssets } from '../server/discovery-preview-assets.mjs'
import { localRequestAllowed, discoveryPlugin } from '../server/discovery-api.mjs'

test('local preview serves only indexed images and never enlarges the static build', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'vislexicon-preview-test-'))
  const directory = path.join(root, 'public/data/discovery/v4/shots')
  const previewUrl = '/data/discovery/v4/shots/example.jpg'
  await fs.mkdir(directory, { recursive: true })
  await fs.writeFile(path.join(directory, 'example.jpg'), Buffer.from([255,216,255,217]))
  await fs.writeFile(path.join(directory, 'unindexed.jpg'), 'private')
  let index = { generatedAt: 'one', units: [{ kind: 'website-component', previewUrl }] }
  const middleware = discoveryPreviewAssets({ root, loadIndex: async () => index, isLocalRequest: localRequestAllowed })
  const request = async (url, patch = {}) => {
    const result = {}
    const req = { url, method: 'GET', socket: { remoteAddress: '127.0.0.1' }, headers: { host: '127.0.0.1:4176', 'sec-fetch-site': 'same-origin' }, ...patch }
    await middleware(req, { writeHead: (status, headers) => Object.assign(result, { status, headers }), end: bytes => { result.bytes = bytes } }, () => { result.next = true })
    return result
  }
  try {
    const image = await request(previewUrl)
    assert.equal(image.status, 200)
    assert.equal(image.headers['Content-Type'], 'image/jpeg')
    assert.deepEqual(image.bytes, Buffer.from([255,216,255,217]))
    const archive = path.join(root, 'data/discovery/local-public/v4/shots')
    await fs.mkdir(archive, { recursive: true })
    await fs.writeFile(path.join(archive, 'example.jpg'), Buffer.from([255,216,1,255,217]))
    assert.deepEqual((await request(previewUrl)).bytes, Buffer.from([255,216,1,255,217]), 'local archive takes precedence over legacy public files')
    await fs.unlink(path.join(directory, 'example.jpg'))
    assert.equal((await request(previewUrl)).status, 200, 'a migrated capture needs no public copy')
    assert.equal((await request(previewUrl, { method: 'HEAD' })).bytes, undefined)
    assert.equal((await request(previewUrl, { socket: { remoteAddress: '192.0.2.1' } })).status, 403)
    assert.equal((await request(previewUrl, { headers: { host: '127.0.0.1:4176', origin: 'https://example.org' } })).status, 403)
    assert.equal((await request(previewUrl, { method: 'POST' })).status, 405)
    assert.equal((await request('/data/discovery/v4/shots/unindexed.jpg')).status, 404)
    assert.equal((await request('/data/discovery/v4/shots/../secret.json')).status, 404)
    assert.equal((await request('/data/discovery/v4/shots/%2e%2e/secret.jpg')).status, 404)
    assert.equal((await request('/data/discovery/scopes/curation.json')).next, true)
    index = { generatedAt: 'two', units: [] }
    assert.equal((await request(previewUrl)).status, 404)
    await assert.rejects(fs.stat(path.join(root, 'dist')), { code: 'ENOENT' })
  } finally {
    const resolved = await fs.realpath(root), parent = await fs.realpath(os.tmpdir())
    assert.equal(path.dirname(resolved), parent)
    assert.ok(path.basename(resolved).startsWith('vislexicon-preview-test-'))
    await fs.rm(resolved, { recursive: true, force: true })
  }
})

test('preview mounts no local API or image middleware without explicit opt-in', () => {
  const previous = process.env.VISLEXICON_PREVIEW_API
  try {
    delete process.env.VISLEXICON_PREVIEW_API
    const mounted = []
    discoveryPlugin().configurePreviewServer({ middlewares: { use: middleware => mounted.push(middleware) } })
    assert.equal(mounted.length, 0)
    process.env.VISLEXICON_PREVIEW_API = '1'
    discoveryPlugin().configurePreviewServer({ middlewares: { use: middleware => mounted.push(middleware) } })
    assert.equal(mounted.length, 2)
  } finally {
    if (previous === undefined) delete process.env.VISLEXICON_PREVIEW_API
    else process.env.VISLEXICON_PREVIEW_API = previous
  }
})
