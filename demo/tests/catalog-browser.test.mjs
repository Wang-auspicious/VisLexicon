import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import {
  catalogFacets,
  catalogMetaLabels,
  catalogPage,
  filterCatalogEntries,
  prepareCatalogEntries,
} from '../src/lib/site-catalog-browser.js'

const FIXTURE = [
  {
    id: 'alpha',
    name: 'Alpha UI',
    canonicalUrl: 'https://alpha.example',
    descriptionZh: '面向 React 项目的界面组件库。',
    category: 'UI 组件与设计系统',
    subcategories: ['React UI 库'],
    tags: ['react', 'components'],
  },
  {
    id: 'beta',
    name: 'Beta Motion',
    canonicalUrl: 'https://beta.example',
    descriptionZh: '网页交互与动画开发工具。',
    category: '前端开发与动效',
    subcategories: ['JavaScript 动效库'],
    tags: ['motion', 'javascript'],
  },
]

test('catalog filtering intersects one primary category with normalized full-text search', () => {
  assert.deepEqual(
    filterCatalogEntries(FIXTURE, {
      category: 'UI 组件与设计系统',
      query: 'REACT components',
    }).map(({ id }) => id),
    ['alpha'],
  )
  assert.deepEqual(
    filterCatalogEntries(FIXTURE, {
      category: 'UI 组件与设计系统',
      query: 'motion',
    }),
    [],
  )
})

test('catalog search text is normalized once at load time and reused by filtering', () => {
  const prepared = prepareCatalogEntries(FIXTURE)
  assert.equal(prepared.length, FIXTURE.length)
  assert.match(prepared[0].searchText, /alpha ui/)
  assert.match(prepared[0].searchText, /react 项目的界面组件库/)
  assert.equal('searchText' in FIXTURE[0], false)
  assert.deepEqual(filterCatalogEntries(prepared, { query: 'ALPHA react' }).map(({ id }) => id), ['alpha'])
})

test('catalog filtering searches Chinese descriptions and subcategories', () => {
  assert.deepEqual(filterCatalogEntries(FIXTURE, { query: '动画 JavaScript' }).map(({ id }) => id), [
    'beta',
  ])
})

test('catalog filtering intersects fine category, tag, price, and source facets', () => {
  const entries = FIXTURE.map((entry, index) => ({
    ...entry,
    pricing: { model: index === 0 ? 'free' : 'paid' },
    sourceIds: [index === 0 ? 'toools-design' : 'external-directory'],
  }))

  assert.deepEqual(
    filterCatalogEntries(entries, {
      subcategory: 'React UI 库',
      tag: 'react',
      pricing: 'free',
      source: 'toools-design',
    }).map(({ id }) => id),
    ['alpha'],
  )
  assert.deepEqual(
    filterCatalogEntries(entries, { tag: 'react', pricing: 'paid' }),
    [],
  )
})

test('catalog facets expose counted fine categories, tags, prices, and sources', () => {
  const entries = FIXTURE.map((entry, index) => ({
    ...entry,
    pricing: { model: index === 0 ? 'free' : 'paid' },
    sourceIds: [index === 0 ? 'toools-design' : 'external-directory'],
  }))

  assert.deepEqual(catalogFacets(entries, { category: 'UI 组件与设计系统' }), {
    subcategories: [['React UI 库', 1]],
    tags: [['components', 1], ['react', 1]],
    pricing: [['free', 1]],
    sources: [['toools-design', 1]],
  })
})

test('catalog pagination exposes one hundred directly reachable results per page', () => {
  const entries = Array.from({ length: 205 }, (_, index) => ({ id: `entry-${index}` }))

  assert.deepEqual(catalogPage(entries, 2, 100), {
    items: entries.slice(100, 200),
    page: 2,
    pageCount: 3,
    total: 205,
    from: 101,
    to: 200,
  })
  assert.deepEqual(catalogPage(entries, 99, 100), {
    items: entries.slice(200),
    page: 3,
    pageCount: 3,
    total: 205,
    from: 201,
    to: 205,
  })
})

test('catalog metadata does not repeat the primary category as a subcategory', () => {
  assert.deepEqual(
    catalogMetaLabels({
      category: 'AI 设计工具',
      subcategories: ['AI 设计工具', '无代码与网站构建', 'AI 设计工具'],
    }),
    ['AI 设计工具', '无代码与网站构建'],
  )
})

test('site detail URLs prefer canonical catalog URLs while preserving legacy curated URLs', async () => {
  const { siteUrl } = await import('../src/lib/site-catalog-browser.js')

  assert.equal(typeof siteUrl, 'function')
  assert.equal(
    siteUrl({ canonicalUrl: 'https://catalog.example', url: 'https://legacy.example' }),
    'https://catalog.example',
  )
  assert.equal(siteUrl({ url: 'https://legacy.example' }), 'https://legacy.example')
})

test('site detail modal is portalled outside the animated route containing block', async () => {
  const source = await readFile(new URL('../src/components/SiteDetailModal.jsx', import.meta.url), 'utf8')

  assert.match(source, /import\s*{\s*createPortal\s*}\s*from 'react-dom'/)
  assert.match(source, /return createPortal\([\s\S]*document\.body\)/)
})

test('catalog index loading bypasses stale browser caches', async () => {
  const source = await readFile(new URL('../src/SiteCatalog.jsx', import.meta.url), 'utf8')

  assert.match(source, /fetch\('\/data\/site-catalog-index\.json',\s*{\s*cache:\s*'no-store'\s*}\)/)
  assert.doesNotMatch(source, /cache:\s*'force-cache'/)
})

test('catalog browser loads the thin public index on demand without bundling the full evidence file', async () => {
  const source = await readFile(new URL('../src/SiteCatalog.jsx', import.meta.url), 'utf8')
  const indexView = await readFile(new URL('../src/views/IndexView.jsx', import.meta.url), 'utf8')
  const css = await readFile(new URL('../src/App.css', import.meta.url), 'utf8')

  assert.match(source, /fetch\('\/data\/site-catalog-index\.json'/)
  assert.match(source, /useDeferredValue\(query\)/)
  assert.match(source, /prepareCatalogEntries\(payload\.entries\)/)
  assert.match(source, /目录候选不等于视觉核验上线/)
  assert.match(source, /const PAGE_SIZE = 60/)
  assert.match(source, /catalogMetaLabels\(entry\)/)
  assert.match(source, /细分类/)
  assert.match(source, /标签/)
  assert.match(source, /价格/)
  assert.match(source, /来源/)
  assert.match(source, />上一页</)
  assert.match(source, />下一页</)
  assert.match(source, /目录顶部分页/)
  assert.match(source, /目录底部分页/)
  assert.match(source, /role="region"/)
  assert.match(source, /aria-label={`目录结果，第 \$\{pageData\.page\} 页`}/)
  assert.doesNotMatch(source, /再显示/)
  assert.match(
    source,
    /function updateCategory\(value\)[\s\S]*?setPricing\(ALL_FACET\)[\s\S]*?setSource\(ALL_FACET\)/,
  )
  assert.match(source, /scrollIntoView\(\{ behavior:/)
  assert.match(source, /tabIndex={-1}/)
  assert.match(source, /searchRef\.current\?\.focus\(\)/)
  assert.match(source, /ref={searchRef}/)
  assert.doesNotMatch(source, /site-catalog\.json['"]/)
  assert.match(indexView, /import SiteCatalog from '\.\.\/SiteCatalog\.jsx'/)
  assert.match(indexView, /<SiteCatalog\s*\/>/)
  assert.match(
    css,
    /CATALOG DIRECTORY[\s\S]*?\.catalog-directory\s*{[\s\S]*?width:\s*min\(1174px,\s*100%\)[\s\S]*?margin:\s*96px auto 0/,
  )
  assert.match(
    css,
    /CATALOG DIRECTORY[\s\S]*?\.catalog-results\s*{[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)[\s\S]*?scroll-margin-top:\s*calc\(var\(--shell-header-height\) \+ 8px\)/,
  )
  assert.match(
    css,
    /CATALOG DIRECTORY[\s\S]*?\.catalog-browser-controls\s*{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)/,
  )
  assert.match(
    css,
    /CATALOG DIRECTORY[\s\S]*?\.catalog-facet-grid\s*{[\s\S]*?grid-template-columns:\s*repeat\(5,\s*minmax\(0,\s*1fr\)\)/,
  )
  assert.match(
    css,
    /CATALOG DIRECTORY[\s\S]*?\.catalog-pager\s*{[\s\S]*?justify-content:\s*space-between/,
  )
  assert.match(
    css,
    /@media \(max-width:\s*700px\)\s*{[\s\S]*?\.catalog-facet-grid\s*{\s*grid-template-columns:\s*minmax\(0,\s*1fr\)[\s\S]*?\.catalog-results\s*{\s*grid-template-columns:\s*minmax\(0,\s*1fr\)/,
  )
})
