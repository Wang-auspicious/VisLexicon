import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { loadDiscoveryIndex } from '../server/discovery-index.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))

test('a rebuilt atlas search catalog refreshes prose, identities, and refinement revision in the same process', async () => {
  const temporaryRoot = await fs.realpath(os.tmpdir())
  const fixture = await fs.mkdtemp(path.join(temporaryRoot, 'vislexicon-search-refresh-'))
  const atlas = path.join(fixture, 'public/effects-atlas')
  try {
    await fs.mkdir(atlas, { recursive: true })
    // Keep the former implementation runnable too, so this regression fails
    // on stale search content rather than on missing legacy module files.
    for (const directory of ['fx', 'units']) {
      const source = path.join(root, 'public/effects-atlas', directory)
      const exists = await fs.stat(source).then(() => true).catch(error => { if (directory === 'units' && error.code === 'ENOENT') return false; throw error })
      if (exists) await fs.cp(source, path.join(atlas, directory), { recursive: true })
    }
    await fs.writeFile(path.join(fixture, 'package.json'), '{"type":"module"}')
    await fs.mkdir(path.join(fixture, 'public/data/discovery/scopes'), { recursive: true })
    await fs.writeFile(path.join(fixture, 'public/data/discovery/index.json'), '{"units":[]}')
    await fs.writeFile(path.join(fixture, 'public/data/discovery/scopes/atlas.json'), '{"scope":"atlas","units":[]}')
    const manifest = JSON.parse(await fs.readFile(path.join(root, 'public/effects-atlas/catalog.json'), 'utf8'))
    const search = JSON.parse(await fs.readFile(path.join(root, 'public', manifest.searchIndex), 'utf8'))
    const publishCatalog = async () => {
      const body = JSON.stringify(search)
      const filename = `search-index.${createHash('sha256').update(body).digest('hex').slice(0, 16)}.json`
      await fs.writeFile(path.join(atlas, filename), body)
      await fs.writeFile(path.join(atlas, 'catalog.json'), JSON.stringify({ ...manifest, searchIndex: `/effects-atlas/${filename}` }))
    }
    await publishCatalog()
    const before = await loadDiscoveryIndex(fixture, 'atlas')
    const category = search.find(row => row.id === 'form')
    const original = category.items[0]
    original.dz = '已更新的收录描述，用于验证同进程索引刷新。'
    category.items.push({ id: 'newly-collected-regression', zh: '新增收录实例', en: 'Newly collected instance', dz: '真实构建目录的新记录', de: 'A newly built catalog record' })
    await publishCatalog()
    const after = await loadDiscoveryIndex(fixture, 'atlas')
    assert.match(after.units.find(row => row.id === `atlas-term--form--${original.id}`).descriptionZh, /已更新的收录描述/)
    assert.ok(after.units.some(row => row.id === 'atlas-term--form--newly-collected-regression'))
    assert.notEqual(after.generatedAt, before.generatedAt, 'query snapshots must expire when atlas content changes')
  } finally {
    const resolved = await fs.realpath(fixture)
    assert.equal(path.dirname(resolved).toLowerCase(), temporaryRoot.toLowerCase())
    assert.ok(path.basename(resolved).startsWith('vislexicon-search-refresh-'))
    await fs.rm(resolved, { recursive: true, force: true })
  }
})
