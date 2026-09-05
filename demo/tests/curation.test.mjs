import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

import { CURATED_SITES } from '../src/data/curated-sites.js'
import {
  curationFacets,
  filterCuratedSites,
  validateCuratedSites,
} from '../src/lib/curation.js'

const demoRoot = fileURLToPath(new URL('..', import.meta.url))
const publicRoot = fileURLToPath(new URL('../public', import.meta.url))
const REQUIRED_TEXT_FIELDS = ['id', 'name', 'site', 'scale', 'pricing', 'category']
const REQUIRED_LIST_FIELDS = ['stacks', 'themes', 'keywords']

// These ids encode the outcome of human screenshot review. Automated checks below verify the
// publication contract, file integrity, and markup structure; they do not judge visual quality.
const VISUALLY_REJECTED_SITE_IDS = ['aceternity-ui', 'animata']

function validFixture(overrides = {}) {
  return {
    id: 'fixture-ui',
    name: 'Fixture UI',
    site: 'https://fixture.example',
    scale: '40+ components',
    pricing: 'Free',
    stacks: ['React', 'CSS'],
    themes: ['Editorial', 'Motion'],
    category: '组件库',
    keywords: ['interface', 'animation'],
    shots: [
      {
        src: '/shots/fixture-ui/01.png',
        sourceUrl: 'https://fixture.example/components/one',
        alt: 'Fixture UI component gallery',
      },
      {
        src: '/shots/fixture-ui/02.png',
        sourceUrl: 'https://docs.fixture.example/components/two',
        alt: 'Fixture UI documentation preview',
      },
      {
        src: '/shots/fixture-ui/03.png',
        sourceUrl: 'https://fixture.example/components/three',
        alt: 'Fixture UI animated card examples',
      },
    ],
    ...overrides,
  }
}

function htmlAttribute(tag, name) {
  return tag.match(new RegExp(`\\s${name}="([^"]*)"`, 'i'))?.[1]
}

function htmlText(fragment) {
  return fragment.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

test('published curation data satisfies the metadata and provenance contract', () => {
  assert.ok(CURATED_SITES.length >= 6, 'publish at least six manually approved sites')
  assert.ok(CURATED_SITES.length <= 12, 'keep the external curation intentionally bounded')
  assert.deepEqual(validateCuratedSites(CURATED_SITES), [])
})

test('published curation excludes sites rejected by human screenshot review', () => {
  const publishedIds = new Set(CURATED_SITES.map(({ id }) => id))

  for (const rejectedId of VISUALLY_REJECTED_SITE_IDS) {
    assert.equal(publishedIds.has(rejectedId), false, `${rejectedId} must remain unpublished`)
  }
})

test('every published screenshot file exists and no image bytes are reused', async () => {
  const hashes = new Map()

  for (const site of CURATED_SITES) {
    for (const shot of site.shots) {
      const relativePath = shot.src.replace(/^\//, '')
      const filePath = `${publicRoot}/${relativePath}`
      const fileStats = await stat(filePath)
      assert.ok(fileStats.isFile(), `${shot.src} must be a file`)
      assert.ok(fileStats.size > 20_000, `${shot.src} is too small to be a captured viewport asset`)

      const hash = createHash('sha256').update(await readFile(filePath)).digest('hex')
      assert.equal(
        hashes.has(hash),
        false,
        `${shot.src} reuses the same image bytes as ${hashes.get(hash)}`,
      )
      hashes.set(hash, shot.src)
    }
  }
})

test('validation reports duplicate ids, non-HTTPS sites, wrong source hostnames, and empty alt', () => {
  const malformed = validFixture({
    site: 'http://fixture.example',
    shots: [
      ...validFixture().shots.slice(0, 2),
      {
        src: '/shots/fixture-ui/03.png',
        sourceUrl: 'https://unrelated.example/three',
        alt: '',
      },
    ],
  })
  const errors = validateCuratedSites([malformed, validFixture()])

  assert.ok(errors.some((error) => error.includes('duplicate id')))
  assert.ok(errors.some((error) => error.includes('HTTPS')))
  assert.ok(errors.some((error) => error.includes('hostname')))
  assert.ok(errors.some((error) => error.includes('alt')))
})

for (const field of REQUIRED_TEXT_FIELDS) {
  test(`validation rejects an empty ${field} text field`, () => {
    const errors = validateCuratedSites([validFixture({ [field]: '  ' })])

    assert.ok(errors.some((error) => error.includes(`${field} must be non-empty`)))
  })
}

for (const field of REQUIRED_LIST_FIELDS) {
  test(`validation rejects an empty ${field} list`, () => {
    const errors = validateCuratedSites([validFixture({ [field]: [] })])

    assert.ok(errors.some((error) => error.includes(`${field} must contain non-empty values`)))
  })
}

test('validation rejects two screenshots', () => {
  const errors = validateCuratedSites([validFixture({ shots: validFixture().shots.slice(0, 2) })])

  assert.ok(errors.some((error) => error.includes('exactly three screenshots')))
})

test('validation rejects four screenshots', () => {
  const fourthShot = {
    src: '/shots/fixture-ui/04.png',
    sourceUrl: 'https://fixture.example/components/four',
    alt: 'Fixture UI fourth screenshot',
  }
  const errors = validateCuratedSites([
    validFixture({ shots: [...validFixture().shots, fourthShot] }),
  ])

  assert.ok(errors.some((error) => error.includes('exactly three screenshots')))
})

test('validation rejects duplicate screenshot paths independently of shot count', () => {
  const shots = validFixture().shots.map((shot) => ({ ...shot }))
  shots[2].src = shots[0].src
  const errors = validateCuratedSites([validFixture({ shots })])

  assert.ok(errors.some((error) => error.includes('unique')))
})

const INVALID_SCREENSHOT_PATHS = [
  ['a prefixed directory', '/other/shots/fixture-ui/01.png'],
  ['a parent traversal segment', '/shots/fixture-ui/../escape.png'],
  ['Windows path separators', '\\shots\\fixture-ui\\01.png'],
  ['a nested directory', '/shots/fixture-ui/nested/01.png'],
  ['a non-exact site id', '/shots/fixture-ui-copy/01.png'],
  ['a suffix after the file', '/shots/fixture-ui/01.png/extra'],
]

for (const [caseName, invalidPath] of INVALID_SCREENSHOT_PATHS) {
  test(`validation rejects screenshot paths using ${caseName}`, () => {
    const shots = validFixture().shots.map((shot) => ({ ...shot }))
    shots[0].src = invalidPath
    const errors = validateCuratedSites([validFixture({ shots })])

    assert.ok(errors.some((error) => error.includes('canonical /shots/fixture-ui/<file> path')))
  })
}

test('validation rejects an empty screenshot src', () => {
  const shots = validFixture().shots.map((shot) => ({ ...shot }))
  shots[0].src = '  '
  const errors = validateCuratedSites([validFixture({ shots })])

  assert.ok(errors.some((error) => error.includes('src must be non-empty')))
})

test('validation rejects an empty screenshot sourceUrl', () => {
  const shots = validFixture().shots.map((shot) => ({ ...shot }))
  shots[0].sourceUrl = '  '
  const errors = validateCuratedSites([validFixture({ shots })])

  assert.ok(errors.some((error) => error.includes('sourceUrl must be a valid HTTPS URL')))
})

test('validation rejects an HTTP screenshot sourceUrl', () => {
  const shots = validFixture().shots.map((shot) => ({ ...shot }))
  shots[0].sourceUrl = 'http://fixture.example/components/one'
  const errors = validateCuratedSites([validFixture({ shots })])

  assert.ok(errors.some((error) => error.includes('sourceUrl must be a valid HTTPS URL')))
})

test('filtering intersects category, stack, and normalized free-text search', () => {
  const sites = [
    validFixture(),
    validFixture({
      id: 'second-ui',
      name: 'Second UI',
      category: '动效实验',
      stacks: ['Vue', 'CSS'],
      themes: ['Aurora'],
      keywords: ['shader'],
      shots: validFixture().shots.map((shot, index) => ({
        ...shot,
        src: `/shots/second-ui/0${index + 1}.png`,
        sourceUrl: `https://fixture.example/second/${index + 1}`,
      })),
    }),
  ]

  assert.deepEqual(
    filterCuratedSites(sites, { category: '动效实验', stack: 'vue', query: 'SHADER' }).map(
      ({ id }) => id,
    ),
    ['second-ui'],
  )
  assert.deepEqual(filterCuratedSites(sites, { category: '组件库', stack: 'Vue' }), [])
})

test('curation facets are unique, sorted, and do not mutate the source data', () => {
  const sites = [
    validFixture({ category: '组件库', stacks: ['React', 'CSS'] }),
    validFixture({ id: 'second-ui', category: '动效实验', stacks: ['CSS', 'Vue'] }),
  ]
  const snapshot = structuredClone(sites)

  assert.deepEqual(curationFacets(sites), {
    categories: ['动效实验', '组件库'],
    stacks: ['CSS', 'React', 'Vue'],
  })
  assert.deepEqual(sites, snapshot)
})

test('IndexView SSR renders every published site as one contract-compliant detail button', async () => {
  const vite = await createServer({
    root: demoRoot,
    appType: 'custom',
    logLevel: 'silent',
    server: { middlewareMode: true },
  })

  try {
    const { default: IndexView } = await vite.ssrLoadModule('/src/views/IndexView.jsx')
    const html = renderToStaticMarkup(createElement(IndexView))
    const cards = html.match(
      /<button(?=[^>]*class="[^"]*\boreo-specimen-card\b[^"]*")[^>]*>[\s\S]*?<\/button>/g,
    ) ?? []
    const countBadge = html.match(
      /<span class="oreo-count-badge"[^>]*>([\s\S]*?)<\/span>/,
    )?.[1]

    assert.match(
      html,
      /<div class="oreo-curation-shell">[\s\S]*?<header class="oreo-frame-header">[\s\S]*?<\/header>[\s\S]*?<section class="oreo-board-frame" aria-label="已核验站点">[\s\S]*?<div class="oreo-cards-grid">/,
    )
    assert.equal(cards.length, CURATED_SITES.length)
    assert.equal(
      htmlText(countBadge ?? ''),
      `${CURATED_SITES.length} / ${CURATED_SITES.length} 个已核验站点`,
    )
    assert.doesNotMatch(cards.join('\n'), /Oreo Showcase|作者|评分|源站按钮|source button/i)

    CURATED_SITES.forEach((site, siteIndex) => {
      const card = cards[siteIndex]
      const openingButton = card.match(/^<button\b[^>]*>/)?.[0] ?? ''
      const images = card.match(/<img\b[^>]*>/g) ?? []
      const rowClasses = [...card.matchAll(/class="(oreo-meta-row[^"]*)"/g)].map(
        ([, className]) => className,
      )
      const renderedThemes = [
        ...card.matchAll(/<span class="oreo-green-theme-pill"[^>]*>([^<]*)<\/span>/g),
      ].map(([, theme]) => theme)

      assert.equal(htmlAttribute(openingButton, 'type'), 'button', `${site.id} button type`)
      assert.equal(
        htmlAttribute(openingButton, 'aria-label'),
        `查看 ${site.name} 详情`,
        `${site.id} detail label`,
      )
      assert.equal((card.match(/<a\b/g) ?? []).length, 0, `${site.id} has no nested anchor`)
      assert.equal((card.match(/<button\b/g) ?? []).length, 1, `${site.id} has one card button`)
      assert.equal(images.length, 3, `${site.id} has exactly three images`)

      images.forEach((image, shotIndex) => {
        const shot = site.shots[shotIndex]
        assert.equal(htmlAttribute(image, 'src'), shot.src, `${site.id} image ${shotIndex + 1} src`)
        assert.equal(htmlAttribute(image, 'alt'), shot.alt, `${site.id} image ${shotIndex + 1} alt`)
        assert.ok(shot.alt.trim(), `${site.id} image ${shotIndex + 1} has concrete alt text`)
        const aboveFoldMain = siteIndex < 3 && shotIndex === 0
        assert.equal(
          htmlAttribute(image, 'loading'),
          aboveFoldMain ? 'eager' : 'lazy',
          `${site.id} image loading`,
        )
        assert.equal(
          htmlAttribute(image, 'fetchPriority'),
          aboveFoldMain ? 'high' : undefined,
          `${site.id} image fetch priority`,
        )
        assert.equal(htmlAttribute(image, 'decoding'), 'async', `${site.id} image decoding`)
      })

      assert.deepEqual(rowClasses, [
        'oreo-meta-row1',
        'oreo-meta-row2',
        'oreo-meta-row3-marquee',
      ])
      assert.deepEqual(renderedThemes, [...site.themes, ...site.themes])
    })
  } finally {
    await vite.close()
  }
})
