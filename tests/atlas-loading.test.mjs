import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { createAtlasLoader } from '../public/effects-atlas/category-loader.js'
import { CATEGORY_FILES } from '../public/effects-atlas/fx/index.js'

test('overview and search do not import any preview modules; concurrent category requests are shared', async () => {
  const reads = [], imports = []
  const catalog = [{ id: 'form', file: 'form', items: [{ id: 'input', zh: '输入', en: 'Input' }], itemCount: 40 }, { id: 'nav', file: 'nav', items: [] }]
  const loader = createAtlasLoader({
    readJson: async url => { reads.push(url); return url.endsWith('catalog.json') ? { categories: catalog, searchIndex: '/effects-atlas/search-index.fixture.json' } : catalog },
    importCategory: async file => { imports.push(file); return { id: file, items: [{ id: 'input', css: '.fx{}' }] } },
    enrich: async categories => categories,
  })
  assert.equal((await loader.loadCategories())[0].itemCount, 40)
  await loader.loadSearchIndex()
  assert.deepEqual(imports, [])
  const [first, second] = await Promise.all([loader.loadCategory('form'), loader.loadCategory('form')])
  assert.equal(first, second)
  assert.equal(first.loaded, true)
  assert.deepEqual(imports, ['form'])
  assert.deepEqual(reads, ['/effects-atlas/catalog.json', '/effects-atlas/search-index.fixture.json', '/effects-atlas/lexicon.json'])
})

test('category loader merges only approved lexicon records into runtime items', async () => {
  const catalog = [{ id: 'form', file: 'form' }]
  const loader = createAtlasLoader({
    readJson: async url => url.endsWith('catalog.json') ? { categories: catalog } : ({ entries: {
      'form/input': { reviewStatus: 'approved', definition: 'A reviewed definition', aliases: [{ term: 'field' }] },
      'form/pending': { reviewStatus: 'pending-independent-digest-review', definition: 'Not public' },
    } }),
    importCategory: async () => ({ id: 'form', items: [{ id: 'input' }, { id: 'pending' }] }),
    enrich: async categories => categories,
  })
  const category = await loader.loadCategory('form')
  assert.equal(category.items[0].definition, 'A reviewed definition')
  assert.deepEqual(category.items[0].aliases, [{ term: 'field' }])
  assert.equal(category.items[1].definition, undefined)
  assert.equal(category.items[1].reviewStatus, undefined)
})

test('failed category requests can retry, and only study categories load practice data', async () => {
  let attempts = 0, practiceReads = 0
  const loader = createAtlasLoader({
    readJson: async () => ({ categories: [{ id: 'form', file: 'form' }, { id: 'type-study', hasPractices: true }] }),
    importCategory: async () => { if (++attempts === 1) throw Error('offline'); return { id: 'form', items: [] } },
    enrich: async categories => categories,
    practices: async categories => { practiceReads++; return categories.map(category => ({ ...category, items: [{ id: 'original-study' }] })) },
  })
  await assert.rejects(loader.loadCategory('form'), /offline/)
  await loader.loadCategory('form')
  assert.equal(practiceReads, 0)
  assert.equal((await loader.loadCategory('type-study')).items[0].id, 'original-study')
  assert.equal(practiceReads, 1)
  await assert.rejects(loader.loadCategory('missing'), /Unknown atlas category/)
})

test('generated overview preserves every category count and sample name without shipping CSS', async () => {
  const manifest = JSON.parse(await fs.readFile(new URL('../public/effects-atlas/catalog.json', import.meta.url), 'utf8'))
  const catalog = manifest.categories
  assert.match(manifest.searchIndex, /search-index\.[a-f0-9]{16}\.json$/)
  const search = JSON.parse(await fs.readFile(new URL(`../public${manifest.searchIndex}`, import.meta.url), 'utf8'))
  const lexicon = JSON.parse(await fs.readFile(new URL('../public/effects-atlas/lexicon.json', import.meta.url), 'utf8'))
  const publishedLexicon = JSON.parse(await fs.readFile(new URL('../src/data/atlas-lexicon-published.json', import.meta.url), 'utf8'))
  assert.ok(Object.values(lexicon.entries).every(row => row.reviewStatus === 'approved'))
  assert.deepEqual(publishedLexicon.entries, lexicon.entries)
  assert.ok(Object.values(publishedLexicon.entries).every(row => row.reviewStatus === 'approved' && !('evidence' in row) && !('review' in row)))
  assert.ok(Object.values(publishedLexicon.entries).every(row => !JSON.stringify(row).includes('evidenceIds')))
  assert.equal(catalog.length, search.length)
  assert.deepEqual(catalog.filter(category => category.file).map(category => category.file), CATEGORY_FILES)
  for (const category of catalog) {
    const full = search.find(row => row.id === category.id)
    assert.equal(category.itemCount, full.items.length, category.id)
    assert.deepEqual(category.items.map(row => [row.id, row.zh, row.en]), full.items.slice(0, 4).map(row => [row.id, row.zh, row.en]))
    assert.ok(category.items.every(row => !('css' in row)))
  }
  assert.equal(catalog.length, 80)
  assert.equal(catalog.reduce((sum, category) => sum + category.itemCount, 0), search.reduce((sum, category) => sum + category.items.length, 0))
})
