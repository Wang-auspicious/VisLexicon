import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import http from 'node:http'
import { createComponentBenchMiddleware } from '../server/component-bench.mjs'

test('isolated sandbox modules get MIME and CORS, with local catalog and portable fallback', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'vislexicon-bench-assets-'))
  const local = path.join(temp, 'local'), portable = path.join(temp, 'portable'), app = path.join(temp, 'app')
  await Promise.all([local, portable, app].map(p => fs.mkdir(p)))
  await fs.writeFile(path.join(local, 'index.json'), '{"items":[{"id":"local"}]}')
  await fs.writeFile(path.join(local, 'large.json'), JSON.stringify({ content: 'x'.repeat(3000) }))
  await fs.writeFile(path.join(portable, 'module.mjs'), 'export const test = true')
  await fs.writeFile(path.join(app, 'index.html'), '<title>Bench</title>')
  const middleware = createComponentBenchMiddleware({ root: app, dataRoots: [local, portable] })
  const server = http.createServer((req, res) => middleware(req, res, error => { res.writeHead(error ? 500 : 404); res.end() }))
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  try {
    const base = `http://127.0.0.1:${server.address().port}`
    const index = await fetch(base + '/data/component-code/index.json')
    assert.equal((await index.json()).items[0].id, 'local')
    const module = await fetch(base + '/data/component-code/module.mjs', { headers: { Origin: 'null' } })
    assert.match(module.headers.get('content-type'), /^text\/javascript/)
    assert.equal(module.headers.get('access-control-allow-origin'), '*')
    assert.equal(await module.text(), 'export const test = true')
    const large = await fetch(base + '/data/component-code/large.json')
    assert.equal(large.headers.get('content-encoding'), 'gzip')
    assert.equal((await large.json()).content.length, 3000)
    const head = await fetch(base + '/component-bench/', { method: 'HEAD' })
    assert.equal(head.status, 200)
    assert.equal(await head.text(), '')
    const missing = await fetch(base + '/component-bench/does-not-exist.js')
    assert.equal(missing.status, 404)
    const traversal = await fetch(base + '/data/component-code/..%2f..%2fsecret')
    assert.equal(traversal.status, 400)
  } finally { await new Promise(resolve => server.close(resolve)); await fs.rm(temp, { recursive: true }) }
})
