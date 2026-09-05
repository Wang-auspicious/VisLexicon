import assert from 'node:assert/strict'
import test from 'node:test'

const signals = await import('../src/data/mining-signals.js')
const gate = await import('../src/lib/mining-threshold.js')

const {
  MINING_BATCH_BREAKERS,
  MINING_ROUTES,
  SIGNAL_TAGS,
  SIGNAL_TAG_IDS,
  evaluateSignalTag,
  evaluateSignalTags,
  miningRoute,
} = signals

const {
  MINED_STATUS,
  completenessErrors,
  consistencyErrors,
  evaluateMinedBatch,
  evaluateMinedRecord,
  vetoReasons,
} = gate

/* -------------------------------------------------------------------------- */
/* 字典不变量                                                                  */
/* -------------------------------------------------------------------------- */

test('routes are unique, namespaced and map onto known categories', () => {
  const ids = MINING_ROUTES.map((route) => route.id)
  assert.deepEqual(ids, ['R1', 'R2', 'R3', 'R4', 'R5', 'R6'])
  assert.equal(new Set(ids).size, ids.length)
  for (const route of MINING_ROUTES) {
    assert.ok(route.allowedCategories.length > 0, `${route.id} needs allowed categories`)
    assert.ok(route.requiredProbes.length >= 3, `${route.id} needs required probes`)
    assert.equal(new Set(route.requiredProbes).size, route.requiredProbes.length)
  }
  assert.equal(miningRoute('R9'), null)
})

test('every signal tag carries a machine-measurable condition', () => {
  assert.equal(new Set(SIGNAL_TAG_IDS).size, SIGNAL_TAG_IDS.length)
  for (const tag of SIGNAL_TAGS) {
    assert.match(tag.id, /^(?:motion|style|craft)\.[a-z0-9-]+$/u)
    assert.ok(tag.label.length > 0)
    const metrics = collectMetrics(tag.condition)
    assert.ok(metrics.size > 0, `${tag.id} must read at least one metric`)
  }
})

function collectMetrics(condition, into = new Set()) {
  if (!condition || typeof condition !== 'object') return into
  if (Array.isArray(condition.allOf)) {
    for (const child of condition.allOf) collectMetrics(child, into)
  } else if (Array.isArray(condition.anyOf)) {
    for (const child of condition.anyOf) collectMetrics(child, into)
  } else if (typeof condition.metric === 'string') {
    into.add(condition.metric)
  }
  return into
}

test('registries are frozen', () => {
  assert.throws(() => { SIGNAL_TAGS.push({ id: 'x' }) }, TypeError)
  assert.throws(() => { MINING_ROUTES[0].requiredProbes.push('x') }, TypeError)
})

/* -------------------------------------------------------------------------- */
/* 信号标签评估                                                                */
/* -------------------------------------------------------------------------- */

const COHERENT_MOTION = {
  motionDeclarations: 47,
  dominantEasingShare: 0.71,
  medianDuration: 0.5,
  durationFamilies: 2,
}

test('a supported tag records the exact measurements that triggered it', () => {
  const result = evaluateSignalTag('motion.coherent', COHERENT_MOTION)
  assert.equal(result.supported, true)
  assert.deepEqual(result.evidence, COHERENT_MOTION)
})

test('a missing metric never counts as support', () => {
  const partial = { ...COHERENT_MOTION }
  delete partial.durationFamilies
  const result = evaluateSignalTag('motion.coherent', partial)
  assert.equal(result.supported, false)
  assert.ok(!Object.hasOwn(result.evidence, 'durationFamilies'))
})

test('out-of-band measurements fail the between condition', () => {
  const result = evaluateSignalTag('motion.coherent', { ...COHERENT_MOTION, medianDuration: 1.4 })
  assert.equal(result.supported, false)
})

test('anyOf conditions accept any single satisfied branch', () => {
  assert.equal(
    evaluateSignalTag('style.pixel-art', { imageRenderingPixelated: true }).supported,
    true,
  )
  assert.equal(
    evaluateSignalTag('style.pixel-art', { pixelFontMatch: true }).supported,
    true,
  )
})

test('a small palette alone is minimalism, not pixel art', () => {
  // 这条曾经是 style.pixel-art 的第三支，真实抓取里在 example.com 上就误命中了。
  const result = evaluateSignalTag('style.pixel-art', {
    uniqueColors: 2,
    gradientDeclarations: 0,
    imageRenderingPixelated: false,
    pixelFontMatch: false,
  })
  assert.equal(result.supported, false)
  assert.equal(result.state, 'false')
})

test('a decidably false clause refutes the tag even with metrics still missing', () => {
  // allOf 里有一项确定为假，整条就已经确定为假——零动效的站不该卡在无法判定。
  const result = evaluateSignalTag('motion.coherent', { motionDeclarations: 0 })
  assert.equal(result.state, 'false')
  assert.ok(result.missingMetrics.includes('medianDuration'))
})

test('a tag stays unknown only when nothing decides it', () => {
  const result = evaluateSignalTag('motion.coherent', { durationFamilies: 2 })
  assert.equal(result.state, 'unknown')
  assert.equal(result.supported, false)
})

test('anyOf goes false only when every branch is decidably false', () => {
  assert.equal(evaluateSignalTag('style.3d-webgl', { hasWebGLContext: false }).state, 'unknown')
  assert.equal(
    evaluateSignalTag('style.3d-webgl', { hasWebGLContext: false, threeJsSignature: false }).state,
    'false',
  )
})

test('unknown tags are reported rather than silently accepted', () => {
  const result = evaluateSignalTag('style.vibes', { uniqueColors: 2 })
  assert.equal(result.known, false)
  assert.equal(result.supported, false)
})

test('model claims without measured support are separated out', () => {
  const result = evaluateSignalTags(COHERENT_MOTION, [
    'motion.coherent',
    'style.brutalist',
    'style.hand-wavy',
  ])
  assert.deepEqual(result.supported.map((entry) => entry.tag), ['motion.coherent'])
  assert.deepEqual(result.unsupportedTagClaims, ['style.brutalist'])
  assert.deepEqual(result.unknownTagClaims, ['style.hand-wavy'])
})

test('measurement, not the model, is the authority on tagging', () => {
  const result = evaluateSignalTags({ ...COHERENT_MOTION, backdropBlurRules: 4 }, [])
  const tags = result.supported.map((entry) => entry.tag)
  assert.ok(tags.includes('style.glass'))
  assert.deepEqual(result.unsupportedTagClaims, [])
})

/* -------------------------------------------------------------------------- */
/* 夹具                                                                        */
/* -------------------------------------------------------------------------- */

function probe(key, value) {
  return {
    key,
    value,
    evidenceUrl: `https://example.com/${key}`,
    evidenceReachable: true,
    checkedAt: '2026-09-02T00:00:00.000Z',
  }
}

// 一条走 R3 且三层门全过的记录。
function healthyDirectoryRecord(overrides = {}) {
  return {
    minedId: 'mined-example',
    lane: 'mined',
    route: 'R3',
    fetch: { finalStatus: 200, timeoutProbes: 0 },
    robots: { disallowed: false },
    page: { mainTextLength: 5200, canvasCount: 0, contentImageCount: 24 },
    flags: { parkedDomain: false, prohibitedContent: [] },
    routeSignals: { channelA: ['R3'], channelB: 'R3', channelBDesignRelevant: true, conflict: false },
    classification: {
      recordLevel: 'entry',
      primaryCategory: 'directories-indexes',
      subcategory: 'component-package-indexes',
      status: 'machine-confirmed',
    },
    facets: { access: ['free'], licenses: [] },
    rights: { restrictiveClauses: [], repositoryReachable: false },
    collectionSubject: {
      ofCategory: 'ui-implementation',
      ofSubcategory: 'general-ui-components',
      scenarios: ['agent', 'ai'],
      evidenceUrl: 'https://example.com/agent-ui',
    },
    probes: [
      probe('outboundSample', 42),
      probe('collectionSubject', 'agent ui components'),
      probe('internalTaxonomy', ['category', 'framework']),
      probe('freshnessSignal', '2026-08-30'),
      probe('affiliateDisclosure', false),
    ],
    metrics: { ...COHERENT_MOTION },
    claimedSignalTags: ['motion.coherent'],
    signalTags: [{ tag: 'motion.coherent', evidence: COHERENT_MOTION }],
    language: { declared: 'en', measured: 'en' },
    editorial: { description: '收录 agent 界面组件的目录，按框架与场景分区。', literalOverlapWithSource: 0.18 },
    ...overrides,
  }
}

function healthySpecimenRecord(overrides = {}) {
  return healthyDirectoryRecord({
    route: 'R2',
    routeSignals: { channelA: ['R2'], channelB: 'R2', channelBDesignRelevant: true, conflict: false },
    classification: {
      recordLevel: 'entry',
      primaryCategory: 'single-site-showcase',
      subcategory: 'agency-studio-sites',
      status: 'machine-confirmed',
    },
    collectionSubject: null,
    probes: [
      probe('siteRole', 'agency'),
      probe('rightsStatus', 'reference-only'),
      probe('signatureTechniqueSupport', 'motion.coherent'),
    ],
    styleDossier: {
      colors: [
        { value: '#fffdf9', role: '承担全部正文与导航的近白' },
        { value: '#101010', role: '页面画布' },
        { value: '#495764', role: '内容区块背景' },
      ],
      typographyFamilies: [{ family: 'Neue Montreal', weights: [400, 700] }],
      typographyScale: [
        { size: 15, lineHeight: 1.2 },
        { size: 20, lineHeight: 1.2 },
        { size: 36, lineHeight: 1.5 },
        { size: 136, lineHeight: 1 },
      ],
      spacing: [16, 20, 40, 108],
      radii: { nav: 5, cards: 15, buttons: 0 },
      motion: { defaultDuration: 0.5, dominantEasingShare: 0.71 },
      layout: { pageMaxWidth: 1440, sectionGap: 108 },
      components: [{ name: 'Ghost Nav Button' }, { name: 'Outlined Contact Button' }, { name: 'Display Headline' }],
    },
    shots: [
      { role: 'hero', qaPassed: true },
      { role: 'inner', qaPassed: true },
      { role: 'signature', qaPassed: true },
    ],
    ...overrides,
  })
}

/* -------------------------------------------------------------------------- */
/* 第一层：硬否决                                                              */
/* -------------------------------------------------------------------------- */

test('a healthy record has nothing to veto', () => {
  assert.deepEqual(vetoReasons(healthyDirectoryRecord()), [])
})

test('dead links, robots blocks, parking and prohibited content are vetoed', () => {
  assert.equal(vetoReasons(healthyDirectoryRecord({ fetch: { finalStatus: 404 } })).length, 1)
  assert.equal(vetoReasons(healthyDirectoryRecord({ robots: { disallowed: true } })).length, 1)
  assert.equal(
    vetoReasons(healthyDirectoryRecord({ flags: { parkedDomain: true, prohibitedContent: [] } })).length,
    1,
  )
  assert.equal(
    vetoReasons(healthyDirectoryRecord({ flags: { parkedDomain: false, prohibitedContent: ['gambling'] } })).length,
    1,
  )
})

test('one network failure never kills a site', () => {
  assert.deepEqual(vetoReasons(healthyDirectoryRecord({ fetch: { finalStatus: 200, timeoutProbes: 1 } })), [])
  assert.equal(
    vetoReasons(healthyDirectoryRecord({ fetch: { finalStatus: 200, timeoutProbes: 3 } })).length,
    1,
  )
})

test('an empty shell is vetoed only when text, canvas and imagery are all absent', () => {
  const shell = { mainTextLength: 40, canvasCount: 0, contentImageCount: 0 }
  assert.equal(vetoReasons(healthyDirectoryRecord({ page: shell })).length, 1)
  assert.deepEqual(
    vetoReasons(healthyDirectoryRecord({ page: { ...shell, canvasCount: 1 } })),
    [],
  )
})

test('design irrelevance requires both channels to say no', () => {
  const onlyModelSaysNo = healthyDirectoryRecord({
    routeSignals: { channelA: ['R3'], channelB: 'R3', channelBDesignRelevant: false },
  })
  assert.deepEqual(vetoReasons(onlyModelSaysNo), [])

  const bothSayNo = healthyDirectoryRecord({
    routeSignals: { channelA: [], channelB: null, channelBDesignRelevant: false },
  })
  assert.equal(vetoReasons(bothSayNo).length, 1)
})

/* -------------------------------------------------------------------------- */
/* 第二层：必答完备                                                            */
/* -------------------------------------------------------------------------- */

test('every required probe must exist with reachable evidence', () => {
  assert.deepEqual(completenessErrors(healthyDirectoryRecord()), [])

  const missing = healthyDirectoryRecord({
    probes: [probe('outboundSample', 42), probe('collectionSubject', 'agent ui')],
  })
  const errors = completenessErrors(missing)
  assert.equal(errors.length, 3)
  assert.ok(errors.every((error) => error.startsWith('missing required probe')))
})

test('unreachable evidence urls fail completeness', () => {
  const record = healthyDirectoryRecord()
  record.probes = record.probes.map((entry) => (
    entry.key === 'freshnessSignal' ? { ...entry, evidenceReachable: false } : entry
  ))
  assert.deepEqual(completenessErrors(record), ['probe freshnessSignal evidenceUrl was not reachable'])
})

test('R2 is only complete when the style dossier is fully extracted', () => {
  assert.deepEqual(completenessErrors(healthySpecimenRecord()), [])

  const thin = healthySpecimenRecord()
  thin.styleDossier = { ...thin.styleDossier, colors: [{ value: '#000', role: '画布' }] }
  assert.deepEqual(
    completenessErrors(thin),
    ['styleDossier.colors needs at least 3 entries, got 1'],
  )

  const noMotion = healthySpecimenRecord()
  delete noMotion.styleDossier.motion
  assert.deepEqual(completenessErrors(noMotion), ['styleDossier.motion is missing'])
})

test('a color token without a measured role is not extracted, it is guessed', () => {
  const record = healthySpecimenRecord()
  record.styleDossier.colors = [
    { value: '#fffdf9', role: '正文' },
    { value: '#101010', role: '画布' },
    { value: '#495764' },
  ]
  assert.deepEqual(completenessErrors(record), ['styleDossier.colors[2] needs a measured role'])
})

test('R2 needs exactly three QA-passing shots', () => {
  const record = healthySpecimenRecord()
  record.shots = [{ role: 'hero', qaPassed: true }, { role: 'inner', qaPassed: false }]
  assert.deepEqual(
    completenessErrors(record),
    ['route R2 needs exactly 3 QA-passing shots, got 1'],
  )
})

/* -------------------------------------------------------------------------- */
/* 第三层：一致性                                                              */
/* -------------------------------------------------------------------------- */

test('a healthy record is internally consistent', () => {
  assert.deepEqual(consistencyErrors(healthyDirectoryRecord()), [])
  assert.deepEqual(consistencyErrors(healthySpecimenRecord()), [])
})

test('channel disagreement is never averaged away', () => {
  const conflicted = healthyDirectoryRecord({
    routeSignals: { channelA: ['R1'], channelB: 'R1', channelBDesignRelevant: true },
  })
  const errors = consistencyErrors(conflicted)
  assert.equal(errors.length, 2)
  assert.ok(errors.some((error) => error.includes('channel A')))
  assert.ok(errors.some((error) => error.includes('channel B')))
})

test('a route with no strong hard signal cannot be confirmed', () => {
  const weak = healthyDirectoryRecord({
    routeSignals: { channelA: [], channelB: 'R3', channelBDesignRelevant: true },
  })
  assert.deepEqual(consistencyErrors(weak), ['channel A produced no strong route signal'])
})

test('a category outside the route pairing is rejected', () => {
  const record = healthyDirectoryRecord()
  record.classification = { ...record.classification, primaryCategory: 'visual-assets' }
  assert.deepEqual(
    consistencyErrors(record),
    ['primary category visual-assets is not allowed on route R3'],
  )
})

test('mined records must not borrow the human-reviewed confirmed status', () => {
  const record = healthyDirectoryRecord()
  record.classification = { ...record.classification, status: 'confirmed' }
  assert.deepEqual(
    consistencyErrors(record),
    ['mined records must use classification.status "machine-confirmed"'],
  )
})

test('unsupported model tag claims degrade the record', () => {
  const record = healthyDirectoryRecord({ claimedSignalTags: ['motion.coherent', 'style.brutalist'] })
  assert.deepEqual(
    consistencyErrors(record),
    ['signal tag style.brutalist has no measured support'],
  )
})

test('open-source claims need a resolved license and a reachable repository', () => {
  const record = healthyDirectoryRecord({
    facets: { access: ['open-source'], licenses: ['unknown'] },
    rights: { restrictiveClauses: [], repositoryReachable: false },
  })
  const errors = consistencyErrors(record)
  assert.equal(errors.length, 2)
  assert.ok(errors.some((error) => error.includes('resolved SPDX license')))
  assert.ok(errors.some((error) => error.includes('reachable repository')))
})

test('a Commons Clause repository is source-available, never open source', () => {
  const record = healthyDirectoryRecord({
    facets: { access: ['open-source'], licenses: ['MIT'] },
    rights: { restrictiveClauses: ['commons-clause'], repositoryReachable: true },
  })
  assert.deepEqual(
    consistencyErrors(record),
    ['restrictive clause present: must be source-available, not open-source'],
  )
})

test('a directory cannot collect the very category it belongs to', () => {
  const record = healthyDirectoryRecord()
  record.collectionSubject = { ofCategory: 'directories-indexes', evidenceUrl: 'https://example.com/x' }
  assert.deepEqual(
    consistencyErrors(record),
    ['collectionSubject.ofCategory must differ from the record primary category'],
  )
})

test('collection subjects need their own evidence url', () => {
  const record = healthyDirectoryRecord()
  record.collectionSubject = { ofCategory: 'ui-implementation' }
  assert.deepEqual(consistencyErrors(record), ['collectionSubject requires an evidenceUrl'])
})

test('declared and measured language must agree', () => {
  const record = healthyDirectoryRecord({ language: { declared: 'zh', measured: 'en' } })
  assert.deepEqual(consistencyErrors(record), ['declared language zh disagrees with measured en'])
})

test('boilerplate phrasing and machine translation are caught', () => {
  const boilerplate = healthyDirectoryRecord({
    editorial: { description: '归类为设计资源目录。', literalOverlapWithSource: 0.1 },
  })
  assert.deepEqual(
    consistencyErrors(boilerplate),
    ['description contains forbidden phrase: 归类为'],
  )

  const copied = healthyDirectoryRecord({
    editorial: { description: '收录 agent 界面组件的目录。', literalOverlapWithSource: 0.82 },
  })
  assert.equal(consistencyErrors(copied).length, 1)
})

/* -------------------------------------------------------------------------- */
/* 组合门                                                                      */
/* -------------------------------------------------------------------------- */

test('all three layers passed means MINED_CONFIRMED', () => {
  const result = evaluateMinedRecord(healthyDirectoryRecord())
  assert.equal(result.status, MINED_STATUS.CONFIRMED)
  assert.equal(result.thresholdVersion, 'mining-threshold-v1')
})

test('a veto short-circuits before the expensive checks', () => {
  const result = evaluateMinedRecord(healthyDirectoryRecord({ robots: { disallowed: true } }))
  assert.equal(result.status, MINED_STATUS.EXCLUDED)
  assert.deepEqual(result.completeness, [])
  assert.deepEqual(result.consistency, [])
})

test('missing evidence means review, never exclusion', () => {
  const result = evaluateMinedRecord(healthyDirectoryRecord({ probes: [] }))
  assert.equal(result.status, MINED_STATUS.NEEDS_REVIEW)
  assert.equal(result.completeness.length, 5)
})

/* -------------------------------------------------------------------------- */
/* 批次断路器                                                                  */
/* -------------------------------------------------------------------------- */

const TAG_POOL = [
  'motion.coherent',
  'style.dark-canvas',
  'style.glass',
  'craft.color-restraint',
  'style.editorial',
]
const ROUTE_POOL = ['R1', 'R2', 'R3', 'R4', 'R5']

function batchRow(index, status) {
  return {
    status,
    route: ROUTE_POOL[index % ROUTE_POOL.length],
    signalTags: [
      { tag: TAG_POOL[index % TAG_POOL.length] },
      { tag: TAG_POOL[(index + 1) % TAG_POOL.length] },
    ],
  }
}

function balancedBatch(confirmedCount, total = 10) {
  return Array.from({ length: total }, (unused, index) => batchRow(
    index,
    index < confirmedCount ? MINED_STATUS.CONFIRMED : MINED_STATUS.NEEDS_REVIEW,
  ))
}

test('a balanced batch is released', () => {
  const report = evaluateMinedBatch(balancedBatch(5))
  assert.equal(report.released, true)
  assert.deepEqual(report.trippedBreakers, [])
  assert.equal(report.counts.confirmed, 5)
  assert.equal(report.averageTagsPerRecord, 2)
})

test('an implausibly high pass rate trips the breaker', () => {
  const report = evaluateMinedBatch(balancedBatch(9))
  assert.equal(report.released, false)
  assert.ok(report.trippedBreakers.some((reason) => reason.includes('exceeds 0.85')))
})

test('a collapsed pass rate trips the breaker too', () => {
  const report = evaluateMinedBatch(balancedBatch(1))
  assert.equal(report.released, false)
  assert.ok(report.trippedBreakers.some((reason) => reason.includes('below 0.15')))
})

test('route collapse is treated as a broken classifier, not a finding', () => {
  const rows = balancedBatch(5).map((row) => ({ ...row, route: 'R2' }))
  const report = evaluateMinedBatch(rows)
  assert.equal(report.released, false)
  assert.ok(report.trippedBreakers.some((reason) => reason.startsWith('route R2 share')))
})

test('a tag that fires on most of the batch means the condition is wrong', () => {
  const rows = balancedBatch(5).map((row) => ({
    ...row,
    signalTags: [{ tag: 'style.glass' }, { tag: 'motion.coherent' }],
  }))
  const report = evaluateMinedBatch(rows)
  assert.equal(report.released, false)
  assert.ok(report.trippedBreakers.some((reason) => reason.includes('style.glass hit rate')))
})

test('a batch that produced almost no tags means the extractor failed', () => {
  const rows = balancedBatch(5).map((row) => ({ ...row, signalTags: [] }))
  const report = evaluateMinedBatch(rows)
  assert.equal(report.released, false)
  assert.ok(report.trippedBreakers.some((reason) => reason.includes('average tags per record')))
})

test('routine sampling errors above the ceiling freeze the batch', () => {
  const report = evaluateMinedBatch(balancedBatch(5), { routineErrorRate: 0.2 })
  assert.equal(report.released, false)
  assert.ok(report.trippedBreakers.some((reason) => reason.includes('routine sample error rate')))
})

test('an empty batch is never released', () => {
  const report = evaluateMinedBatch([])
  assert.equal(report.released, false)
  assert.equal(report.manualSampleSize, MINING_BATCH_BREAKERS.manualSampleSize)
})
