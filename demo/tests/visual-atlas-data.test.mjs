import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import {
  buildVisualAtlas,
  buildVisualAtlasIndex,
  COUNTED_SOURCE_IDS,
} from '../scripts/build-visual-atlas.mjs'
import {
  duplicateKey,
  mergeCandidates,
  normalizeTerm,
  stableAtlasId,
} from '../scripts/visual-atlas/normalize.mjs'
import { translationKey } from '../scripts/translate-visual-atlas.mjs'

function candidate({
  termEn = 'Tool call',
  axis = 'component',
  recordType = 'component',
  sourceId = 'assistant-ui',
  sourceRecordId = 'tool-call',
} = {}) {
  return {
    termEn,
    termZh: '工具调用',
    definitionZh: '一次工具调用。',
    sourceDefinition: 'One tool invocation.',
    axis,
    recordType,
    aliases: [],
    scenes: ['agent-gui'],
    mediaBindings: [],
    status: 'candidate',
    translationQuality: 'machine',
    sourceEvidence: [{ sourceId, sourceRecordId, url: `https://example.com/${sourceRecordId}` }],
  }
}

test('term normalization is Unicode-stable and punctuation-insensitive', () => {
  assert.equal(normalizeTerm('  Fade in / Fade out  '), 'fade-in-fade-out')
  assert.equal(normalizeTerm('Drag & Drop'), 'drag-and-drop')
  assert.equal(normalizeTerm('Ｆｏｃｕｓ　Ｒｉｎｇ'), 'focus-ring')
})

test('term normalization preserves semantic CSS syntax namespaces', () => {
  assert.equal(normalizeTerm('@view-transition'), 'at-rule-view-transition')
  assert.equal(normalizeTerm(':focus-visible'), 'pseudo-class-focus-visible')
  assert.equal(normalizeTerm('::view-transition'), 'pseudo-element-view-transition')
  assert.equal(normalizeTerm(':host()'), 'pseudo-class-host-function')
})

test('duplicate keys and stable ids include axis and record type', () => {
  const record = candidate()
  assert.equal(duplicateKey(record), 'tool-call|component|component')
  assert.equal(stableAtlasId(record), 'atlas-component-component-tool-call')
})

test('exact duplicate keys merge evidence without erasing distinct axes', () => {
  const base = candidate()
  const duplicate = candidate({
    termEn: 'tool-call',
    sourceId: 'ai-elements',
    sourceRecordId: 'tool',
  })
  const motion = candidate({
    termEn: 'Tool call',
    axis: 'motion',
    recordType: 'design-phenomenon',
    sourceId: 'animations-dev',
    sourceRecordId: 'tool-call-motion',
  })

  const merged = mergeCandidates([base, duplicate, motion])

  assert.equal(merged.length, 2)
  assert.equal(
    merged.find(({ axis }) => axis === 'component').sourceEvidence.length,
    2,
  )
  assert.equal(merged.find(({ axis }) => axis === 'motion').sourceEvidence.length, 1)
})

test('merged arrays are unique and source inputs are not mutated', () => {
  const base = candidate()
  const duplicate = {
    ...candidate({ sourceId: 'ai-elements', sourceRecordId: 'tool' }),
    aliases: ['tool invocation', 'tool invocation'],
    scenes: ['agent-gui', 'agent-gui'],
    mediaBindings: ['assistant-ui'],
  }
  const before = structuredClone([base, duplicate])

  const [merged] = mergeCandidates([base, duplicate])

  assert.deepEqual([base, duplicate], before)
  assert.deepEqual(merged.aliases, ['tool invocation'])
  assert.deepEqual(merged.scenes, ['agent-gui'])
  assert.deepEqual(merged.mediaBindings, ['assistant-ui'])
})

const RAW_SOURCES = [
  ['animations-dev', 91],
  ['assistant-ui', 120],
  ['govuk-design-system', 72],
  ['ai-elements', 48],
  ['prompt-kit', 21],
  ['loquix', 53],
  ['wai-aria-apg', 30],
  ['open-ui', 31],
  ['radix-ui', 30],
  ['mui', 53],
  /* 70 而非 74：原始快照自身声明 70 且实际 70 条，
   * 「计数快照合计」也只有取 70 才成立（取 74 会多出 4 条）。 */
  ['ant-design', 70],
  ['bootstrap', 24],
  ['bulma', 35],
  ['chakra-ui', 100],
  ['primer', 62],
  ['headless-ui', 16],
  /* 行为层来源：组件清单答不了"手指和指针在做什么"，这两个源专门补那一层。 */
  ['react-aria', 37],
  ['use-gesture', 36],
  /* 第五轮进货：先把料堆厚，归类随后跟上。 */
  ['web-awesome', 89],
  ['vuetify', 105],
  ['quasar', 72],
  ['ark-ui', 66],
  ['polaris', 52],
  ['mantine', 242],
  /* 第六轮进货：CSS 属性、伪类、伪元素、组合器与 at-rule 的微粒度一手参考。 */
  ['mdn-css', 751],
  /* Figma Plugin API 当前固定 revision 的 14 个命名空间化视觉/布局/转场选项。 */
  ['figma-plugin-vocabularies', 84],
  /* Google Fonts 官方 upstream Axis Registry：一份 textproto 等于一个可变字体轴。 */
  ['google-fonts-axis-registry', 57],
]

const COVERAGE_SOURCE = ['ai-interaction-atlas.coverage', 194]

async function loadRawSource(sourceId) {
  const url = new URL(`../data/visual-atlas-sources/${sourceId}.raw.json`, import.meta.url)
  return JSON.parse(await readFile(url, 'utf8'))
}

test('compiler allowlist matches the complete counted raw-source inventory', () => {
  assert.deepEqual(COUNTED_SOURCE_IDS, RAW_SOURCES.map(([sourceId]) => sourceId))
})

test('generated artifact date follows the freshest source snapshot', async () => {
  const snapshots = await Promise.all([
    ...RAW_SOURCES.map(([sourceId]) => loadRawSource(sourceId)),
    loadRawSource(COVERAGE_SOURCE[0]),
  ])
  const freshest = snapshots
    .map(({ source }) => source.retrievedAt)
    .sort()
    .at(-1)
  const atlasUrl = new URL('../src/data/visual-atlas.json', import.meta.url)
  const atlas = JSON.parse(await readFile(atlasUrl, 'utf8'))

  assert.equal(atlas.generatedAt, freshest)
})

test('raw snapshots retain fixed first-party counts and source evidence', async () => {
  for (const [sourceId, expectedCount] of RAW_SOURCES) {
    const snapshot = await loadRawSource(sourceId)
    assert.equal(snapshot.schemaVersion, 1)
    assert.equal(snapshot.source.id, sourceId)
    assert.equal(snapshot.source.verifiedCount, expectedCount)
    assert.equal(snapshot.records.length, expectedCount)
    assert.match(snapshot.source.url, /^https:\/\//)
    assert.match(snapshot.source.revision, /^[a-f0-9]{40}$/)

    const ids = new Set()
    for (const record of snapshot.records) {
      assert.ok(record.sourceRecordId)
      assert.equal(ids.has(record.sourceRecordId), false, `${sourceId}: ${record.sourceRecordId}`)
      ids.add(record.sourceRecordId)
      assert.ok(record.termEn)
      assert.ok(record.sourceDefinition)
      assert.match(record.sourceUrl, /^https:\/\//)
      assert.ok(record.sourcePath)
    }
  }
})

test('the twenty-seven counted snapshots contain exactly 2447 source records', async () => {
  const snapshots = await Promise.all(RAW_SOURCES.map(([sourceId]) => loadRawSource(sourceId)))
  assert.equal(
    snapshots.reduce((total, snapshot) => total + snapshot.records.length, 0),
    2447,
  )
})

test('AI Interaction Atlas is a non-counted coverage snapshot', async () => {
  const [sourceId, expectedCount] = COVERAGE_SOURCE
  const snapshot = await loadRawSource(sourceId)
  assert.equal(snapshot.source.id, 'ai-interaction-atlas')
  assert.equal(snapshot.source.verifiedCount, expectedCount)
  assert.equal(snapshot.records.length, expectedCount)
  assert.ok(snapshot.records.every(({ countedAtlas }) => countedAtlas === false))
})

test('translation cache covers every exact source term and definition', async () => {
  const snapshots = await Promise.all([
    ...RAW_SOURCES.map(([sourceId]) => loadRawSource(sourceId)),
    loadRawSource(COVERAGE_SOURCE[0]),
  ])
  const cacheUrl = new URL('../data/visual-atlas-translations.zh.json', import.meta.url)
  const cache = JSON.parse(await readFile(cacheUrl, 'utf8'))
  const originals = new Set(
    snapshots.flatMap(({ records }) =>
      records
        .filter((record) => !record.sourceMetadata?.nativeZh)
        .flatMap(({ termEn, sourceDefinition }) => [termEn, sourceDefinition]),
    ),
  )

  assert.equal(cache.schemaVersion, 1)
  assert.equal(cache.failures.length, 0)
  assert.equal(
    cache.collectedAt,
    snapshots.map(({ source }) => source.retrievedAt).sort().at(-1),
  )
  for (const original of originals) {
    const item = cache.translations[translationKey(original)]
    assert.ok(item, `missing translation: ${original}`)
    assert.equal(item.original, original)
    assert.ok(item.translationZh.trim(), `empty translation: ${original}`)
    assert.equal(item.quality, 'machine')
  }
  assert.equal(cache.translationCount, Object.keys(cache.translations).length)
})

test('merged Visual Atlas artifact preserves candidate and published boundaries', async () => {
  const atlasUrl = new URL('../src/data/visual-atlas.json', import.meta.url)
  const atlas = JSON.parse(await readFile(atlasUrl, 'utf8'))
  const allowedAxes = new Set(['layout', 'interaction', 'aesthetic', 'motion', 'component'])
  const allowedTypes = new Set(['design-phenomenon', 'component', 'pattern', 'artifact', 'scene'])
  const approvedSources = new Set(RAW_SOURCES.map(([sourceId]) => sourceId))
  const ids = new Set()
  let evidenceCount = 0

  assert.equal(atlas.schemaVersion, 1)
  assert.equal(atlas.sourceRecordCount, 2447)
  assert.equal(atlas.coverageRecordCount, 194)
  assert.ok(atlas.entries.length >= 500, `only ${atlas.entries.length} counted records`)
  assert.equal(atlas.stats.totalEntries, atlas.entries.length)
  assert.equal(atlas.stats.mergedSourceRecords, 2447 - atlas.entries.length)
  assert.equal(atlas.coverageDimensions.length, 194)
  assert.ok(atlas.coverageDimensions.every(({ countedAtlas }) => countedAtlas === false))

  for (const entry of atlas.entries) {
    assert.match(entry.id, /^atlas-[a-z0-9-]+$/)
    assert.equal(ids.has(entry.id), false, `duplicate id: ${entry.id}`)
    ids.add(entry.id)
    assert.ok(entry.termEn)
    assert.ok(entry.termZh)
    assert.ok(entry.definitionZh)
    assert.ok(entry.sourceDefinition)
    assert.ok(allowedAxes.has(entry.axis), `unknown axis: ${entry.axis}`)
    assert.ok(allowedTypes.has(entry.recordType), `unknown type: ${entry.recordType}`)
    assert.ok(['candidate', 'published'].includes(entry.status))
    assert.equal(entry.countedAtlas, true)
    assert.ok(['machine', 'native'].includes(entry.translationQuality), `quality: ${entry.translationQuality}`)
    assert.ok(Array.isArray(entry.aliases))
    assert.ok(Array.isArray(entry.scenes))
    assert.ok(Array.isArray(entry.mediaBindings))
    assert.ok(Array.isArray(entry.sourceEvidence) && entry.sourceEvidence.length > 0)
    if (entry.status === 'published') assert.ok(entry.localLexemeId)
  if (!entry.localLexemeId) assert.equal(entry.status, 'candidate')

    evidenceCount += entry.sourceEvidence.length
    for (const evidence of entry.sourceEvidence) {
      assert.ok(approvedSources.has(evidence.sourceId), `unapproved source: ${evidence.sourceId}`)
      assert.match(evidence.url, /^https:\/\//)
      assert.match(evidence.revision, /^[a-f0-9]{40}$/)
      assert.ok(evidence.sourceRecordId)
    }
  }

  const publishedLocalIds = atlas.entries
    .filter(({ status }) => status === 'published')
    .map(({ localLexemeId }) => localLexemeId)
  assert.equal(
    new Set(publishedLocalIds).size,
    publishedLocalIds.length,
    'one local lexeme must not publish multiple Atlas records',
  )
  assert.ok(atlas.entries.some(({ id }) => id.endsWith('pseudo-class-heading')))
  assert.ok(atlas.entries.some(({ id }) => id.endsWith('pseudo-class-heading-function')))
  assert.ok(atlas.entries.some(({ id }) => id.endsWith('pseudo-class-host')))
  assert.ok(atlas.entries.some(({ id }) => id.endsWith('pseudo-class-host-function')))

  assert.equal(evidenceCount, 2447)
  assert.deepEqual(
    atlas.sources.map(({ id, recordCount }) => [id, recordCount]),
    RAW_SOURCES,
  )
  assert.equal(
    atlas.entries.some(({ sourceEvidence }) =>
      sourceEvidence.some(({ sourceId }) => sourceId === 'ai-interaction-atlas'),
    ),
    false,
  )
})

test('published Visual Atlas index is thin, complete, and bounded', async () => {
  const indexUrl = new URL('../public/data/visual-atlas-index.json', import.meta.url)
  const atlasUrl = new URL('../src/data/visual-atlas.json', import.meta.url)
  const rawIndex = await readFile(indexUrl)
  const index = JSON.parse(rawIndex)
  const atlas = JSON.parse(await readFile(atlasUrl, 'utf8'))
  const allowedEntryFields = new Set([
    'id',
    'termEn',
    'termZh',
    'definitionZh',
    'sourceDefinition',
    'axis',
    'recordType',
    'aliases',
    'scenes',
    'mediaBindings',
    'status',
    'translationQuality',
    'localLexemeId',
    'sourceIds',
  ])

  assert.equal(index.schemaVersion, 1)
  /* 钉死的数字会随语料增长过期，过期后就只是噪音。
   * 再加一层派生校验：已发布的索引必须跟产物同步，
   * 这样"源加了但产物没重建"这类漂移不会再靠改常量糊过去。 */
  assert.equal(index.totalEntries, atlas.entries.length)
  assert.equal(index.entries.length, atlas.entries.length)
  assert.equal(
    index.candidateEntries,
    atlas.entries.filter(({ status }) => status === 'candidate').length,
  )
  assert.equal(
    index.publishedMatches,
    atlas.entries.filter(({ status }) => status === 'published').length,
  )
  assert.ok(rawIndex.byteLength <= 1_450_000, `index is ${rawIndex.byteLength} bytes`)
  assert.equal(Object.hasOwn(index, 'coverageDimensions'), false)
  assert.deepEqual(index, buildVisualAtlasIndex(atlas))

  for (const entry of index.entries) {
    assert.equal(Object.hasOwn(entry, 'sourceEvidence'), false, entry.id)
    assert.ok(Object.keys(entry).every((key) => allowedEntryFields.has(key)), entry.id)
    assert.ok(Array.isArray(entry.sourceIds) && entry.sourceIds.length > 0, entry.id)
    assert.equal(entry.sourceIds.includes('ai-interaction-atlas'), false, entry.id)
  }
})

test('every Visual Atlas entry has a matching full-evidence endpoint', async () => {
  const atlasUrl = new URL('../src/data/visual-atlas.json', import.meta.url)
  const detailDirUrl = new URL('../public/atlas/', import.meta.url)
  const atlas = JSON.parse(await readFile(atlasUrl, 'utf8'))

  await Promise.all(
    atlas.entries.map(async (entry) => {
      const detailUrl = new URL(`../public/atlas/${entry.id}.json`, import.meta.url)
      const detail = JSON.parse(await readFile(detailUrl, 'utf8'))
      assert.deepEqual(detail, entry)
    }),
  )
  assert.deepEqual(
    (await readdir(detailDirUrl)).sort(),
    atlas.entries.map(({ id }) => `${id}.json`).sort(),
  )
})

test('Visual Atlas builds remove stale detail endpoints and remain byte deterministic', async (t) => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), 'vislexicon-atlas-'))
  const output = join(temporaryRoot, 'visual-atlas.json')
  const indexOutput = join(temporaryRoot, 'visual-atlas-index.json')
  const detailDir = join(temporaryRoot, 'atlas')
  t.after(() => rm(temporaryRoot, { recursive: true, force: true }))

  await mkdir(detailDir, { recursive: true })
  await writeFile(join(detailDir, 'atlas-stale.json'), '{}\n', 'utf8')
  await writeFile(join(detailDir, 'keep.json'), 'keep\n', 'utf8')

  const atlas = await buildVisualAtlas({ output, indexOutput, detailDir })
  const expectedFiles = atlas.entries.map(({ id }) => `${id}.json`).sort()
  const firstFiles = (await readdir(detailDir)).sort()
  assert.deepEqual(firstFiles, [...expectedFiles, 'keep.json'].sort())
  assert.equal(await readFile(join(detailDir, 'keep.json'), 'utf8'), 'keep\n')

  const readOutputs = async () =>
    Promise.all([
      readFile(output),
      readFile(indexOutput),
      ...expectedFiles.map((filename) => readFile(join(detailDir, filename))),
    ])
  const firstBuild = await readOutputs()
  await buildVisualAtlas({ output, indexOutput, detailDir })
  const secondBuild = await readOutputs()

  assert.deepEqual(secondBuild, firstBuild)
})

test('Visual Atlas builds reject colliding output namespaces before reading inputs', async (t) => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), 'vislexicon-atlas-paths-'))
  const missingRawDir = join(temporaryRoot, 'missing-inputs')
  const detailDir = join(temporaryRoot, 'atlas')
  t.after(() => rm(temporaryRoot, { recursive: true, force: true }))

  const cases = [
    {
      name: 'the full artifact and index are the same file',
      output: join(temporaryRoot, 'same.json'),
      indexOutput: join(temporaryRoot, 'same.json'),
      detailDir,
    },
    {
      name: 'the full artifact is inside the detail namespace',
      output: join(detailDir, 'visual-atlas.json'),
      indexOutput: join(temporaryRoot, 'index.json'),
      detailDir,
    },
    {
      name: 'the index matches the generated detail cleanup namespace',
      output: join(temporaryRoot, 'visual-atlas.json'),
      indexOutput: join(detailDir, 'atlas-index.json'),
      detailDir,
    },
  ]

  for (const options of cases) {
    await t.test(options.name, async () => {
      await assert.rejects(
        buildVisualAtlas({ ...options, rawDir: missingRawDir }),
        /Visual Atlas output namespace collision/,
      )
    })
  }
})

test('the published index remains unchanged when full artifact publication fails', async (t) => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), 'vislexicon-atlas-commit-'))
  const output = join(temporaryRoot, 'full-artifact-target')
  const indexOutput = join(temporaryRoot, 'visual-atlas-index.json')
  const detailDir = join(temporaryRoot, 'atlas')
  const marker = join(output, 'keep.txt')
  t.after(() => rm(temporaryRoot, { recursive: true, force: true }))

  await mkdir(output, { recursive: true })
  await writeFile(marker, 'keep\n', 'utf8')
  await writeFile(indexOutput, 'old index\n', 'utf8')

  await assert.rejects(buildVisualAtlas({ output, indexOutput, detailDir }))
  await new Promise((resolvePromise) => setTimeout(resolvePromise, 100))

  assert.equal(await readFile(indexOutput, 'utf8'), 'old index\n')
  assert.equal(await readFile(marker, 'utf8'), 'keep\n')
  assert.deepEqual(
    [
      ...(await readdir(temporaryRoot)),
      ...(await readdir(detailDir)),
    ].filter((filename) => filename.includes('.tmp-')),
    [],
  )
})

test('concurrent Visual Atlas builds do not collide on temporary paths', async (t) => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), 'vislexicon-atlas-concurrent-'))
  const options = {
    output: join(temporaryRoot, 'visual-atlas.json'),
    indexOutput: join(temporaryRoot, 'visual-atlas-index.json'),
    detailDir: join(temporaryRoot, 'atlas'),
  }
  t.after(() => rm(temporaryRoot, { recursive: true, force: true }))

  const results = await Promise.allSettled([
    buildVisualAtlas(options),
    buildVisualAtlas(options),
  ])
  assert.ok(results.some(({ status }) => status === 'fulfilled'))
  for (const result of results) {
    if (result.status === 'rejected') {
      assert.notEqual(result.reason.code, 'ENOENT', 'temporary paths must be unique')
    }
  }

  assert.deepEqual(
    [
      ...(await readdir(temporaryRoot)),
      ...(await readdir(options.detailDir)),
    ].filter((filename) => filename.includes('.tmp-')),
    [],
  )
})

test('package scripts expose the reproducible Visual Atlas workflow', async () => {
  const packageUrl = new URL('../package.json', import.meta.url)
  const packageJson = JSON.parse(await readFile(packageUrl, 'utf8'))
  assert.equal(packageJson.scripts['atlas:collect'], 'node scripts/collect-visual-atlas.mjs')
  assert.equal(packageJson.scripts['atlas:translate'], 'node scripts/translate-visual-atlas.mjs')
  assert.equal(packageJson.scripts['atlas:build'], 'node scripts/build-visual-atlas.mjs')
  assert.equal(
    packageJson.scripts['atlas:test'],
    'node --test tests/visual-atlas-data.test.mjs tests/visual-atlas-parsers.test.mjs',
  )
})
