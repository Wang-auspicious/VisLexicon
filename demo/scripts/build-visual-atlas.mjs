import { randomUUID } from 'node:crypto'
import { mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

import { ENTRIES as LOCAL_LEXEMES } from '../src/entries.js'
import { mergeCandidates, normalizeTerm } from './visual-atlas/normalize.mjs'
import { translationKey } from './translate-visual-atlas.mjs'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const DEMO_ROOT = resolve(SCRIPT_DIR, '..')
const DEFAULT_RAW_DIR = resolve(DEMO_ROOT, 'data/visual-atlas-sources')
const DEFAULT_TRANSLATIONS = resolve(DEMO_ROOT, 'data/visual-atlas-translations.zh.json')
const DEFAULT_OUTPUT = resolve(DEMO_ROOT, 'src/data/visual-atlas.json')
const DEFAULT_INDEX_OUTPUT = resolve(DEMO_ROOT, 'public/data/visual-atlas-index.json')
const DEFAULT_DETAIL_DIR = resolve(DEMO_ROOT, 'public/atlas')
export const COUNTED_SOURCE_IDS = [
  'animations-dev',
  'assistant-ui',
  'govuk-design-system',
  'ai-elements',
  'prompt-kit',
  'loquix',
  'wai-aria-apg',
  'open-ui',
  'radix-ui',
  'mui',
  'ant-design',
  'bootstrap',
  'bulma',
  'chakra-ui',
  'primer',
  'headless-ui',
  'react-aria',
  'use-gesture',
  'web-awesome',
  'vuetify',
  'quasar',
  'ark-ui',
  'polaris',
  'mantine',
  'mdn-css',
  'figma-plugin-vocabularies',
  'google-fonts-axis-registry',
]
const COVERAGE_FILE_ID = 'ai-interaction-atlas.coverage'
const ALLOWED_AXES = new Set(['layout', 'interaction', 'aesthetic', 'motion', 'component'])
const ALLOWED_TYPES = new Set(['design-phenomenon', 'component', 'pattern', 'artifact', 'scene'])

const LOCAL_BY_TERM_AND_AXIS = new Map(
  LOCAL_LEXEMES.map(({ id, term, axis }) => [`${normalizeTerm(term)}|${axis}`, id]),
)

function translated(cache, original) {
  const item = cache.translations[translationKey(original)]
  if (!item || item.original !== original || !item.translationZh || item.quality !== 'machine') {
    throw new Error(`Missing exact machine translation for: ${original}`)
  }
  return item.translationZh
}

function animationClassification(sourceCategory) {
  if (sourceCategory === 'Feedback & Interaction') {
    return { axis: 'interaction', recordType: 'design-phenomenon' }
  }
  if (sourceCategory === 'Polish & Effects') {
    return { axis: 'aesthetic', recordType: 'design-phenomenon' }
  }
  if (sourceCategory === 'Performance' || sourceCategory === 'Principles to Know') {
    return { axis: 'motion', recordType: 'pattern' }
  }
  return { axis: 'motion', recordType: 'design-phenomenon' }
}

const MDN_MOTION_NAME = /^(?:animation(?:-|$)|interpolate-size$|offset(?:-|$)|rotate$|scale$|scroll-behavior$|scroll-timeline(?:-|$)|timeline-scope$|transform(?:-|$)|transition(?:-|$)|translate$|view-timeline(?:-|$)|view-transition(?:-|$))/
const MDN_LAYOUT_NAME = /^(?:align-|alignment-baseline$|anchor-|aspect-ratio$|block-size$|bottom$|box-sizing$|break-|caption-side$|clear$|column-|columns$|contain(?:-|$)|container(?:-|$)|display$|flex(?:-|$)|float$|gap$|grid(?:-|$)|height$|inline-size$|inset(?:-|$)|justify-|left$|margin(?:-|$)|max-(?:height|width)$|min-(?:height|width)$|object-position$|order$|overflow(?:-|$)|padding(?:-|$)|place-|position(?:-|$)|right$|scroll-margin(?:-|$)|scroll-padding(?:-|$)|scroll-snap(?:-|$)|table-layout$|top$|vertical-align$|width$|z-index$|zoom$)/
const MDN_INTERACTION_NAME = /^(?:accent-color$|appearance$|caret(?:-|$)|cursor$|interactivity$|nav-|pointer-events$|resize$|scrollbar-gutter$|scrollbar-width$|touch-action$|user-select$)/

function classifyMdnCss(record) {
  const term = String(record.termEn ?? '').trim().toLowerCase()
  const category = String(record.sourceCategory ?? '').trim().toLowerCase()

  if (category === 'css-combinator' || category === 'css-selector') {
    return { axis: 'interaction', recordType: 'pattern' }
  }
  if (category === 'css-pseudo-class') {
    return { axis: 'interaction', recordType: 'design-phenomenon' }
  }
  if (category === 'css-at-rule') {
    if (/^@(?:keyframes|starting-style|view-transition)$/.test(term)) {
      return { axis: 'motion', recordType: 'pattern' }
    }
    if (/^@(?:container|media|page|position-try|scope|supports)$/.test(term)) {
      return { axis: 'layout', recordType: 'pattern' }
    }
    return { axis: 'aesthetic', recordType: 'pattern' }
  }
  if (category === 'css-pseudo-element' && term.startsWith('::view-transition')) {
    return { axis: 'motion', recordType: 'design-phenomenon' }
  }
  if (MDN_MOTION_NAME.test(term)) {
    return { axis: 'motion', recordType: 'design-phenomenon' }
  }
  if (MDN_LAYOUT_NAME.test(term)) {
    return { axis: 'layout', recordType: 'design-phenomenon' }
  }
  if (MDN_INTERACTION_NAME.test(term)) {
    return { axis: 'interaction', recordType: 'design-phenomenon' }
  }
  return { axis: 'aesthetic', recordType: 'design-phenomenon' }
}

export function classifySourceRecord(sourceId, record) {
  if (sourceId === 'animations-dev') return animationClassification(record.sourceCategory)
  if (sourceId === 'mdn-css') return classifyMdnCss(record)
  if (sourceId === 'figma-plugin-vocabularies') {
    if (record.sourceCategory === 'figma-motion') {
      return { axis: 'motion', recordType: 'design-phenomenon' }
    }
    if (record.sourceCategory === 'figma-layout') {
      return { axis: 'layout', recordType: 'design-phenomenon' }
    }
    if (record.sourceCategory === 'figma-aesthetic') {
      return { axis: 'aesthetic', recordType: 'design-phenomenon' }
    }
    throw new Error(`Unknown Figma vocabulary category: ${record.sourceCategory}`)
  }
  if (sourceId === 'google-fonts-axis-registry') {
    return { axis: 'aesthetic', recordType: 'design-phenomenon' }
  }
  if (['assistant-ui', 'ai-elements', 'prompt-kit', 'loquix', 'wai-aria-apg', 'open-ui'].includes(sourceId)) {
    return { axis: 'component', recordType: 'component' }
  }
  if (['radix-ui', 'mui', 'ant-design', 'bootstrap', 'bulma', 'chakra-ui', 'primer', 'headless-ui'].includes(sourceId)) {
    return { axis: 'component', recordType: 'component' }
  }
  if (['web-awesome', 'vuetify', 'quasar', 'ark-ui', 'polaris'].includes(sourceId)) {
    return { axis: 'component', recordType: 'component' }
  }
  /* Mantine 的 hooks 是行为层：它们命名的是"发生了什么"，不是界面上的一块。 */
  if (sourceId === 'mantine') {
    return record.sourceCategory === 'react-hook'
      ? { axis: 'interaction', recordType: 'design-phenomenon' }
      : { axis: 'component', recordType: 'component' }
  }
  if (sourceId === 'govuk-design-system') {
    return record.sourceCategory === 'component'
      ? { axis: 'component', recordType: 'component' }
      : { axis: 'interaction', recordType: 'pattern' }
  }
  /* 行为层来源落在 interaction 轴：它们命名的是"指针和手指在做什么"，
   * 不是界面上的一块。手势与其配置项是被命名的现象，钩子之外的工具是模式。 */
  if (sourceId === 'react-aria') {
    return record.sourceCategory === 'interaction-behavior'
      ? { axis: 'interaction', recordType: 'design-phenomenon' }
      : { axis: 'interaction', recordType: 'pattern' }
  }
  if (sourceId === 'use-gesture') {
    return { axis: 'interaction', recordType: 'design-phenomenon' }
  }
  throw new Error(`Unknown source mapping: ${sourceId}`)
}

function sourceAliases(sourceId, record) {
  /* Web Awesome 的 synonyms / use-cases 与 Polaris 的 keywords 是现成的别名，
   * 收进来直接让搜索能命中"用户会怎么叫它"，而不是只能命中官方名。 */
  if (['govuk-design-system', 'web-awesome', 'polaris', 'figma-plugin-vocabularies', 'google-fonts-axis-registry'].includes(sourceId)) {
    return record.sourceMetadata.aliases ?? []
  }
  return []
}

function sourceScenes(sourceId) {
  if (['assistant-ui', 'ai-elements', 'prompt-kit', 'loquix'].includes(sourceId)) return ['agent-gui']
  if (sourceId === 'govuk-design-system') return ['government-service']
  return []
}

function sourceBindings(sourceId) {
  if (sourceId === 'animations-dev') return ['web']
  if (sourceId === 'assistant-ui') return ['web/react']
  if (sourceId === 'ai-elements' || sourceId === 'prompt-kit') return ['web/react']
  if (sourceId === 'loquix') return ['web/web-components']
  if (sourceId === 'wai-aria-apg' || sourceId === 'open-ui') return ['web']
  if (sourceId === 'govuk-design-system') return ['web']
  if (sourceId === 'mdn-css') return ['web/css']
  if (sourceId === 'figma-plugin-vocabularies') return ['design/figma-plugin']
  if (sourceId === 'google-fonts-axis-registry') return ['font/opentype', 'web/css']
  if (['radix-ui', 'mui', 'ant-design', 'chakra-ui', 'primer', 'headless-ui'].includes(sourceId)) {
    return ['web/react']
  }
  if (['bootstrap', 'bulma'].includes(sourceId)) return ['web']
  return []
}

function evidence(snapshot, record) {
  return {
    sourceId: snapshot.source.id,
    sourceName: snapshot.source.name,
    sourceRecordId: record.sourceRecordId,
    url: record.sourceUrl,
    sourcePath: record.sourcePath,
    sourceCategory: record.sourceCategory,
    sourceDefinition: record.sourceDefinition,
    license: snapshot.source.license,
    licenseUrl: snapshot.source.licenseUrl,
    retrievedAt: snapshot.source.retrievedAt,
    revision: snapshot.source.revision,
    sourceMetadata: record.sourceMetadata,
  }
}

function toCandidate(snapshot, record, translations) {
  const { axis, recordType } = classifySourceRecord(snapshot.source.id, record)
  const localLexemeId = LOCAL_BY_TERM_AND_AXIS.get(`${normalizeTerm(record.termEn)}|${axis}`)
  const nativeZh = record.sourceMetadata?.nativeZh
  const termZh = nativeZh?.termZh ?? translated(translations, record.termEn)
  const definitionZh = nativeZh?.definitionZh ?? translated(translations, record.sourceDefinition)
  return {
    termEn: record.termEn,
    termZh,
    definitionZh,
    sourceDefinition: record.sourceDefinition,
    axis,
    recordType,
    aliases: sourceAliases(snapshot.source.id, record),
    scenes: sourceScenes(snapshot.source.id),
    mediaBindings: sourceBindings(snapshot.source.id),
    status: localLexemeId ? 'published' : 'candidate',
    countedAtlas: true,
    ...(localLexemeId ? { localLexemeId } : {}),
    translationQuality: nativeZh ? 'native' : 'machine',
    sourceEvidence: [evidence(snapshot, record)],
  }
}

function countBy(entries, key) {
  return Object.fromEntries(
    [...entries.reduce((counts, entry) => {
      const value = entry[key]
      counts.set(value, (counts.get(value) ?? 0) + 1)
      return counts
    }, new Map())].sort(([left], [right]) => left.localeCompare(right, 'en')),
  )
}

export function validateVisualAtlas(atlas) {
  const errors = []
  if (atlas.schemaVersion !== 1) errors.push('schemaVersion must be 1')
  /* 不钉死总数：语料是要长的，钉死的常量只会在下一次进货时变成噪音。
   * 真正要守的是守恒——申报的原始记录数必须等于各源自报之和，
   * 且下面每条证据都数得上，一条都不许在合并里蒸发。 */
  const declaredBySources = atlas.sources.reduce((sum, { recordCount }) => sum + recordCount, 0)
  if (atlas.sourceRecordCount !== declaredBySources) {
    errors.push(
      `sourceRecordCount ${atlas.sourceRecordCount} does not match the sum of per-source counts ${declaredBySources}`,
    )
  }
  if (atlas.coverageRecordCount !== 194) errors.push('coverageRecordCount must be 194')
  if (!Array.isArray(atlas.entries) || atlas.entries.length < 500) {
    errors.push('counted atlas must contain at least 500 entries')
  }
  const ids = new Set()
  let evidenceCount = 0
  for (const entry of atlas.entries ?? []) {
    if (!entry.id || ids.has(entry.id)) errors.push(`duplicate or missing id: ${entry.id}`)
    ids.add(entry.id)
    if (!ALLOWED_AXES.has(entry.axis)) errors.push(`unknown axis: ${entry.axis}`)
    if (!ALLOWED_TYPES.has(entry.recordType)) errors.push(`unknown record type: ${entry.recordType}`)
    if (!['candidate', 'published'].includes(entry.status)) errors.push(`unknown status: ${entry.status}`)
    if (entry.countedAtlas !== true) errors.push(`counted entry lacks countedAtlas=true: ${entry.id}`)
    if (entry.status === 'published' && !entry.localLexemeId) {
      errors.push(`published record lacks localLexemeId: ${entry.id}`)
    }
    if (!entry.localLexemeId && entry.status !== 'candidate') {
      errors.push(`non-local record is not a candidate: ${entry.id}`)
    }
    if (!['machine', 'native'].includes(entry.translationQuality)) {
      errors.push(`translation quality missing: ${entry.id}`)
    }
    if (!entry.termZh || !entry.definitionZh) errors.push(`translation missing: ${entry.id}`)
    if (!Array.isArray(entry.sourceEvidence) || entry.sourceEvidence.length === 0) {
      errors.push(`source evidence missing: ${entry.id}`)
    }
    evidenceCount += entry.sourceEvidence?.length ?? 0
    for (const item of entry.sourceEvidence ?? []) {
      if (!COUNTED_SOURCE_IDS.includes(item.sourceId)) errors.push(`unapproved counted source: ${item.sourceId}`)
    }
  }
  if (evidenceCount !== atlas.sourceRecordCount) {
    errors.push(
      `source evidence count must equal sourceRecordCount ${atlas.sourceRecordCount}, received ${evidenceCount}`,
    )
  }
  if (!Array.isArray(atlas.coverageDimensions) || atlas.coverageDimensions.length !== 194) {
    errors.push('coverageDimensions must contain 194 records')
  }
  for (const record of atlas.coverageDimensions ?? []) {
    if (record.countedAtlas !== false) errors.push(`coverage record is counted: ${record.id}`)
    if (record.sourceEvidence?.[0]?.sourceId !== 'ai-interaction-atlas') {
      errors.push(`coverage source mismatch: ${record.id}`)
    }
  }
  return errors
}

export function buildVisualAtlasIndex(atlas) {
  const entries = atlas.entries.map((entry) => ({
    id: entry.id,
    termEn: entry.termEn,
    termZh: entry.termZh,
    definitionZh: entry.definitionZh,
    sourceDefinition: entry.sourceDefinition,
    axis: entry.axis,
    recordType: entry.recordType,
    aliases: entry.aliases,
    scenes: entry.scenes,
    mediaBindings: entry.mediaBindings,
    status: entry.status,
    translationQuality: entry.translationQuality,
    ...(entry.localLexemeId ? { localLexemeId: entry.localLexemeId } : {}),
    sourceIds: [...new Set(entry.sourceEvidence.map(({ sourceId }) => sourceId))].sort((left, right) =>
      left.localeCompare(right, 'en'),
    ),
  }))

  return {
    schemaVersion: 1,
    generatedAt: atlas.generatedAt,
    totalEntries: entries.length,
    candidateEntries: entries.filter(({ status }) => status === 'candidate').length,
    publishedMatches: entries.filter(({ status }) => status === 'published').length,
    entries,
  }
}

function parseArgs(argv) {
  const options = {
    rawDir: DEFAULT_RAW_DIR,
    translations: DEFAULT_TRANSLATIONS,
    output: DEFAULT_OUTPUT,
    indexOutput: DEFAULT_INDEX_OUTPUT,
    detailDir: DEFAULT_DETAIL_DIR,
  }
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index]
    if (value === '--raw-dir') options.rawDir = resolve(argv[++index])
    else if (value === '--translations') options.translations = resolve(argv[++index])
    else if (value === '--output') options.output = resolve(argv[++index])
    else if (value === '--index-output') options.indexOutput = resolve(argv[++index])
    else if (value === '--detail-dir') options.detailDir = resolve(argv[++index])
    else throw new Error(`Unknown argument: ${value}`)
  }
  return options
}

function pathsOverlap(left, right) {
  const comparableLeft = process.platform === 'win32' ? left.toLowerCase() : left
  const comparableRight = process.platform === 'win32' ? right.toLowerCase() : right
  const fromLeft = relative(comparableLeft, comparableRight)
  const fromRight = relative(comparableRight, comparableLeft)
  const isContained = (value) =>
    value === '' || (value !== '..' && !value.startsWith(`..${sep}`) && !isAbsolute(value))
  return isContained(fromLeft) || isContained(fromRight)
}

function validateOutputNamespaces({ output, indexOutput, detailDir }) {
  const pairs = [
    ['output', output, 'indexOutput', indexOutput],
    ['output', output, 'detailDir', detailDir],
    ['indexOutput', indexOutput, 'detailDir', detailDir],
  ]
  for (const [leftName, left, rightName, right] of pairs) {
    if (pathsOverlap(left, right)) {
      throw new Error(
        `Visual Atlas output namespace collision: ${leftName} and ${rightName} must be disjoint`,
      )
    }
  }
}

async function writeAtomically(path, payload) {
  const temporary = `${path}.tmp-${process.pid}-${randomUUID()}`
  await mkdir(dirname(path), { recursive: true })
  try {
    await writeFile(temporary, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
    await rename(temporary, path)
  } finally {
    await rm(temporary, { force: true })
  }
}

async function removeStaleDetailEndpoints(detailDir, expectedFilenames) {
  const expected = new Set(expectedFilenames)
  const existing = await readdir(detailDir, { withFileTypes: true })
  await Promise.all(
    existing
      .filter(
        (item) =>
          item.isFile() &&
          item.name.startsWith('atlas-') &&
          item.name.endsWith('.json') &&
          !expected.has(item.name),
      )
      .map((item) => rm(resolve(detailDir, item.name), { force: true })),
  )
}

export async function buildVisualAtlas(options = {}) {
  const resolvedOptions = {
    rawDir: resolve(options.rawDir ?? DEFAULT_RAW_DIR),
    translations: resolve(options.translations ?? DEFAULT_TRANSLATIONS),
    output: resolve(options.output ?? DEFAULT_OUTPUT),
    indexOutput: resolve(options.indexOutput ?? DEFAULT_INDEX_OUTPUT),
    detailDir: resolve(options.detailDir ?? DEFAULT_DETAIL_DIR),
  }
  validateOutputNamespaces(resolvedOptions)
  const snapshots = await Promise.all(
    COUNTED_SOURCE_IDS.map(async (sourceId) =>
      JSON.parse(await readFile(resolve(resolvedOptions.rawDir, `${sourceId}.raw.json`), 'utf8')),
    ),
  )
  const coverageSnapshot = JSON.parse(
    await readFile(resolve(resolvedOptions.rawDir, `${COVERAGE_FILE_ID}.raw.json`), 'utf8'),
  )
  const translations = JSON.parse(await readFile(resolvedOptions.translations, 'utf8'))
  const sourceRecords = snapshots.flatMap((snapshot) =>
    snapshot.records.map((record) => toCandidate(snapshot, record, translations)),
  )
  const entries = mergeCandidates(sourceRecords)
  const coverageDimensions = coverageSnapshot.records
    .map((record) => ({
      id: `coverage-${record.sourceCategory}-${normalizeTerm(record.termEn)}`,
      termEn: record.termEn,
      termZh: translated(translations, record.termEn),
      definitionZh: translated(translations, record.sourceDefinition),
      sourceDefinition: record.sourceDefinition,
      dimension: record.sourceCategory,
      countedAtlas: false,
      sourceEvidence: [evidence(coverageSnapshot, record)],
    }))
    .sort((left, right) => left.id.localeCompare(right.id, 'en'))
  const generatedAt = [...snapshots, coverageSnapshot]
    .map(({ source }) => source.retrievedAt)
    .filter(Boolean)
    .sort()
    .at(-1)
  const atlas = {
    schemaVersion: 1,
    generatedAt,
    status: 'candidate-corpus',
    sourceRecordCount: sourceRecords.length,
    coverageRecordCount: coverageDimensions.length,
    sources: snapshots.map(({ source, records }) => ({
      id: source.id,
      name: source.name,
      url: source.url,
      license: source.license,
      revision: source.revision,
      recordCount: records.length,
    })),
    stats: {
      totalEntries: entries.length,
      mergedSourceRecords: sourceRecords.length - entries.length,
      byAxis: countBy(entries, 'axis'),
      byRecordType: countBy(entries, 'recordType'),
      byStatus: countBy(entries, 'status'),
    },
    coverageDimensions,
    entries,
  }
  const errors = validateVisualAtlas(atlas)
  if (errors.length > 0) throw new Error(`Visual Atlas validation failed:\n- ${errors.join('\n- ')}`)
  const index = buildVisualAtlasIndex(atlas)
  const detailFilenames = atlas.entries.map(({ id }) => `${id}.json`)
  await Promise.all(
    atlas.entries.map((entry) =>
      writeAtomically(resolve(resolvedOptions.detailDir, `${entry.id}.json`), entry),
    ),
  )
  await removeStaleDetailEndpoints(resolvedOptions.detailDir, detailFilenames)
  await writeAtomically(resolvedOptions.output, atlas)
  await writeAtomically(resolvedOptions.indexOutput, index)
  return atlas
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const atlas = await buildVisualAtlas(options)
  process.stdout.write(
    `${JSON.stringify({
      output: options.output,
      indexOutput: options.indexOutput,
      detailDir: options.detailDir,
      sourceRecords: atlas.sourceRecordCount,
      coverageRecords: atlas.coverageRecordCount,
      entries: atlas.entries.length,
      merged: atlas.stats.mergedSourceRecords,
      byStatus: atlas.stats.byStatus,
      byAxis: atlas.stats.byAxis,
      byRecordType: atlas.stats.byRecordType,
    }, null, 2)}\n`,
  )
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main()
}
