import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

const read = (path) => fs.readFile(new URL(path, import.meta.url), 'utf8')

test('curation renders only truthful discovery selectors', async () => {
  const source = await read('../src/views/Curation.jsx')
  assert.match(source, /selectRecentlyChecked/)
  assert.match(source, /selectCuratorPicks/)
  /* 热门排行走本地可复算的收录热度，不拿服务器访问量冒充：没有那数据。 */
  assert.match(source, /selectHeatRanked\(items, COLLECTIONS, 6\)/)
  assert.match(source, /checked: '最近核验'/)
  assert.match(source, /checked: 'Recently verified'/)
  /* 口径必须挂在标题上，别让读者以为这是访问量。 */
  assert.match(source, /note: heatNote/)
  assert.doesNotMatch(source, /const trending = eligible\.slice/)
})

test('heat ranking is reproducible from local corpus signals only', async () => {
  const { selectHeatRanked, heatScoreOf, collectionCountsOf, HEAT_METHOD_ZH } = await import('../src/lib/curation-selectors.js')
  const items = [
    { entryId: 'a', status: 'APPROVED', atlasRelations: [{ termId: 'x' }, { termId: 'y' }], evidenceSummary: { roles: ['identity'] }, independentlyReviewed: true },
    { entryId: 'b', status: 'APPROVED' },
    { entryId: 'c', status: 'CANDIDATE' },
  ]
  const counts = collectionCountsOf([{ entryIds: ['a', 'b'] }, { entryIds: ['b'] }])
  assert.equal(heatScoreOf(items[0], counts).score, 3 + 2 + 2 + 2 + 1)
  /* a = 图鉴关联 2 + 证据 1 + 复核 1（0 个合辑）⇒ 7；b = 合辑 1 ⇒ 3；c 未发布，不参与。 */
  assert.deepEqual(selectHeatRanked(items, [{ entryIds: ['b'] }], 6).map((i) => i.entryId), ['a', 'b'])
  /* 口径文案里必须写明不是访问量，否则这条排序又在冒充热度。 */
  assert.match(HEAT_METHOD_ZH, /不是访问量/)
})

test('site cards keep a stable entry handle and no atlas back-link', async () => {
  const source = await read('../src/components/SiteCard.jsx')
  assert.match(source, /data-entry-id=\{entryId\}/)
  /* 站点 → 图鉴是反向路径：图鉴才是入口，站点卡不再往回指。 */
  assert.doesNotMatch(source, /atlasRelations/)
  /* 证据角色是后台合同，不再作为卡面文案。 */
  assert.doesNotMatch(source, /EvidenceStatus/)
})

test('site detail drops the evidence rationale and atlas relation panels', async () => {
  const source = await read('../src/views/SiteDetail.jsx')
  assert.doesNotMatch(source, /selectionRationale/)
  assert.doesNotMatch(source, /atlasRelations|atlasTerms/)
  assert.doesNotMatch(source, /CoveragePanel/)
})

test('component catalog reads a build-time snapshot, never a live registry fetch', async () => {
  const catalog = await read('../src/lib/component-catalog.js')
  assert.match(catalog, /snapshotNames/)
  const head = await read('../src/components/DossierHead.jsx')
  assert.doesNotMatch(head, /fetchLiveCoverage|live-coverage/)
})

test('catalog snapshot rows carry a source url and capture date', async () => {
  const { CATALOG_SNAPSHOT } = await import('../src/lib/component-catalog-snapshot.js')
  const rows = Object.entries(CATALOG_SNAPSHOT)
  assert.ok(rows.length > 0, 'snapshot is empty — run npm run build:catalog')
  for (const [entryId, row] of rows) {
    assert.match(row.source, /^https:\/\//, `${entryId} source must be an https url`)
    assert.match(row.capturedAt, /^\d{4}-\d{2}-\d{2}$/, `${entryId} needs a capture date`)
    assert.ok(['registry', 'sitemap', 'curated-list'].includes(row.kind), `${entryId} has an unknown kind`)
    assert.ok(row.names.length >= 5, `${entryId} has too few names to be a real catalog`)
    /* 每个名字都要能定位到它在源站的页面：没单列的走 `source`（精度门禁靠这一栏）。 */
    for (const name of row.names) {
      assert.match(row.sources?.[name] ?? row.source, /^https:\/\//, `${entryId} :: ${name} needs an https source url`)
    }
    for (const key of Object.keys(row.sources ?? {})) {
      assert.ok(row.names.includes(key), `${entryId} sources has an unknown name ${key}`)
    }
    for (const item of row.dropped ?? []) {
      assert.ok(item.name && item.reason, `${entryId} dropped rows need name + reason`)
    }
    /* 变体后缀（-TS-TW / -cn）必须在采集期就归一，否则一个组件会占四行。 */
    assert.deepEqual([...new Set(row.names.map((n) => n.toLowerCase()))].length, row.names.length)
  }
})

test('atlas renders its deep-link error from state, not by poking the DOM', async () => {
  const atlas = await read('../public/effects-atlas/index.html')
  assert.doesNotMatch(atlas, /this\.setDeepLinkError\(/)
  assert.doesNotMatch(atlas, /getElementById\('atlas-deeplink-error'\)/)
  assert.match(atlas, /deepLinkErrorOn/)
  /* React 自托管：走 CDN 时每次打开图鉴要多等 2.3 秒。 */
  assert.doesNotMatch(atlas, /<script[^>]+unpkg\.com/)
  assert.match(atlas, /\.\/vendor\/react\.production\.min\.js/)
})

test('the atlas carries no bulk-generated filler entries', async () => {
  const dir = new URL('../public/effects-atlas/fx/', import.meta.url)
  const names = (await fs.readdir(dir)).filter((n) => n.endsWith('.js') && !['index.js', 'mapdata.js'].includes(n))
  let total = 0
  const filler = []
  for (const name of names) {
    const category = (await import(new URL(name, dir))).default
    total += category.items.length
    for (const item of category.items) {
      /* 「background 模式 30」这种批量生成的占位条目只会把总数撑大，演示还全都一样。 */
      if (/-pattern-\d+$/.test(item.id) && /^.+ 模式 \d+$/.test(item.zh || '')) {
        filler.push(`${category.id}/${item.id}`)
      }
    }
  }
  assert.deepEqual(filler, [], `atlas still carries filler entries: ${filler.slice(0, 5).join(', ')}`)
  assert.ok(total > 3000, `atlas shrank unexpectedly to ${total}`)
})

test('page-style references are a complete local map with source metadata', async () => {
  const manifest = JSON.parse(await read('../public/effects-atlas/assets/ref/manifest.json'))
  const mapSource = await read('../public/effects-atlas/assets/ref/map.js')
  const entries = Object.values(manifest).filter((row) => row.entryId)
  assert.ok(entries.length >= 40, `only ${entries.length} page-style references captured`)
  assert.match(mapSource, /window\.__FX_REF__\s*=\s*\{/, 'runtime reference map is missing')
  const mapIds = [...mapSource.matchAll(/^  "([^"]+)":/gm)].map((match) => match[1])
  assert.equal(new Set(mapIds).size, mapIds.length, 'runtime reference map contains duplicate entry ids')
  assert.equal(new Set(mapIds).size, new Set(entries.map((row) => row.entryId)).size)
  for (const row of entries) {
    assert.match(row.sourceUrl, /^https:\/\//, `${row.entryId} source must be https`)
    assert.match(mapSource, new RegExp(JSON.stringify(row.entryId).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }
})
