import assert from 'node:assert/strict'
import test from 'node:test'

const taxonomy = await import('../src/data/curation-taxonomy.js')

const EXPECTED_CATEGORIES = [
  ['ui-implementation', '组件与设计系统'],
  ['visual-implementation', '动效、3D 与数据可视化实现'],
  ['templates-design-files', '模板与设计文件'],
  ['visual-assets', '图标、字体与视觉素材'],
  ['creation-tools', '设计与内容创作工具'],
  ['delivery-development-tools', '建站、交付与开发工具'],
  ['research-quality-tools', '研究、测试与无障碍工具'],
  ['reference-standards', '规范、术语与参考'],
  ['learning-editorial', '教程、课程与行业内容'],
  ['case-inspiration-collections', '案例与灵感集合'],
  ['directories-indexes', '资源目录与索引'],
  ['community-marketplaces', '社区、人才与市场平台'],
  ['single-site-showcase', '单站案例与作品展示'],
]

const EXPECTED_SUBCATEGORIES = {
  'ui-implementation': [
    ['design-system-suites', '设计系统与完整组件套件'],
    ['headless-accessible-primitives', '无样式、无障碍原语'],
    ['general-ui-components', '通用界面组件库'],
    ['page-blocks-embeddable-controls', '页面区块与可嵌入复合控件'],
  ],
  'visual-implementation': [
    ['motion-interaction-code', '动效与微交互代码'],
    ['data-visualization-code', '图表与数据可视化代码'],
    ['three-d-spatial-code', '3D、WebGL 与空间实现'],
    ['creative-generative-code', '创意编程与生成式视觉代码'],
  ],
  'templates-design-files': [
    ['site-app-starters', '网站、应用模板与项目启动器'],
    ['ui-kits-design-files', 'UI Kit 与设计源文件'],
    ['presentation-editorial-templates', '演示、编辑与出版模板'],
    ['mockup-brand-showcase-templates', '样机、品牌与展示模板'],
  ],
  'visual-assets': [
    ['icons-symbols', '图标与符号'],
    ['fonts-typefaces', '字体与字族'],
    ['illustrations-vectors', '插画与矢量素材'],
    ['photos-images-textures', '摄影、位图与纹理'],
    ['video-motion-assets', '视频、Lottie 与动效素材'],
    ['audio-sound-assets', '音乐与音效'],
    ['three-d-models-materials', '3D 模型与材质'],
  ],
  'creation-tools': [
    ['ui-prototyping-whiteboard', 'UI/UX 设计、原型与白板'],
    ['image-vector-layout-creation', '图像、矢量与版式创作'],
    ['video-motion-audio-creation', '视频、动效与音频创作'],
    ['three-d-spatial-creation', '3D 与空间创作'],
    ['brand-presentation-content-creation', '品牌、演示与内容生成'],
  ],
  'delivery-development-tools': [
    ['site-app-builders', '网站与应用构建器'],
    ['design-to-code-handoff', '设计转代码、交付与开发协作'],
    ['build-deploy-dev-workflow', '构建、部署与开发工作流'],
    ['asset-conversion-optimization', '素材转换、压缩与优化'],
  ],
  'research-quality-tools': [
    ['research-recruiting-interviews', '研究、招募与访谈'],
    ['usability-testing-experimentation', '可用性测试与实验'],
    ['behavior-analytics-feedback', '行为分析与反馈'],
    ['accessibility-audit-remediation', '无障碍审计、模拟与修复'],
  ],
  'reference-standards': [
    ['terminology-glossaries', '术语与词汇表'],
    ['ui-patterns-anatomy', '界面模式与结构解剖'],
    ['standards-guidelines-checklists', '标准、规范与检查清单'],
    ['design-system-governance-methods', '设计系统治理与方法参考'],
  ],
  'learning-editorial': [
    ['tutorials-courses-workshops', '教程、课程与工作坊'],
    ['articles-books-publications', '书籍、文章、博客、杂志与通讯'],
    ['podcasts-talks-video', '播客、演讲与视频'],
    ['news-trends-industry-intelligence', '新闻、趋势与行业情报'],
  ],
  'case-inspiration-collections': [
    ['website-landing-page-cases', '网站与落地页案例'],
    ['product-ui-screen-flow-cases', '产品界面、截图与流程'],
    ['brand-packaging-editorial-cases', '品牌、包装、编辑与海报案例'],
    ['motion-three-d-spatial-cases', '动效、3D 与空间案例'],
    ['multi-author-portfolios-curations', '多作者作品集与精选集合'],
  ],
  'directories-indexes': [
    ['general-resource-directories', '综合资源导航'],
    ['component-package-indexes', '组件、软件包与实现索引'],
    ['tool-service-directories', '工具与服务目录'],
    ['asset-directories', '素材目录'],
    ['learning-content-indexes', '学习与内容索引'],
  ],
  'community-marketplaces': [
    ['communities-professional-networks', '社区与专业网络'],
    ['asset-template-service-markets', '素材、模板与服务市场'],
    ['talent-jobs-collaboration-markets', '招聘、人才与合作撮合'],
  ],
  'single-site-showcase': [
    ['product-company-sites', '产品与公司官网'],
    ['agency-studio-sites', '代理机构与工作室官网'],
    ['individual-portfolios', '个人作品集'],
    ['campaign-editorial-experimental-sites', '品牌活动、编辑叙事与实验微站'],
  ],
}

const FACET_AXIS_IDS = [
  'scenarios',
  'deliverables',
  'actions',
  'media',
  'platforms',
  'technologies',
  'workflowStages',
  'audiences',
  'access',
  'licenses',
  'contentOrganization',
  'languages',
]

function classification(overrides = {}) {
  return {
    name: 'Example resource',
    recordLevel: 'entry',
    entityId: 'entity-example',
    primaryCategory: 'ui-implementation',
    subcategory: 'general-ui-components',
    status: 'confirmed',
    alternatives: [],
    reasons: [{
      statement: '内容单元是可预览并复制的界面组件',
      evidenceUrl: 'https://example.com/components',
    }],
    curatorId: 'curator-a',
    reviewerId: 'reviewer-b',
    confirmedAt: '2026-09-01T00:00:00.000Z',
    ...overrides,
  }
}

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
    for (const nested of Object.values(value)) deepFreeze(nested)
  }
  return value
}

test('exports the v3 canonical contract instead of the legacy score-band contract', () => {
  for (const name of [
    'CURATION_CATEGORIES',
    'CURATION_SUBCATEGORIES',
    'CURATION_FACET_AXES',
    'classificationErrors',
    'facetsErrors',
    'isPublishableClassification',
    'canonicalizeFacets',
  ]) {
    assert.ok(name in taxonomy, `missing export ${name}`)
  }
  assert.equal('CURATION_ESSENCES' in taxonomy, false)
  assert.equal('scoreWithinEssenceBand' in taxonomy, false)
})

test('exposes the exact 13 ordered categories and asymmetric 57 subcategories', () => {
  assert.deepEqual(
    taxonomy.CURATION_CATEGORIES.map(({ id, label }) => [id, label]),
    EXPECTED_CATEGORIES,
  )
  assert.deepEqual(Object.keys(taxonomy.CURATION_SUBCATEGORIES), EXPECTED_CATEGORIES.map(([id]) => id))

  for (const [categoryId, expected] of Object.entries(EXPECTED_SUBCATEGORIES)) {
    assert.deepEqual(
      taxonomy.CURATION_SUBCATEGORIES[categoryId].map(({ id, label }) => [id, label]),
      expected,
    )
  }

  assert.deepEqual(
    Object.values(taxonomy.CURATION_SUBCATEGORIES).map((records) => records.length),
    [4, 4, 4, 7, 5, 4, 4, 4, 4, 5, 5, 3, 4],
  )
  const subcategoryIds = Object.values(taxonomy.CURATION_SUBCATEGORIES)
    .flat()
    .map(({ id }) => id)
  assert.equal(subcategoryIds.length, 57)
  assert.equal(new Set(subcategoryIds).size, 57)
})

test('registries are deeply frozen, globally unique, and contain no score bands', () => {
  const allRecords = [
    ...taxonomy.CURATION_CATEGORIES,
    ...Object.values(taxonomy.CURATION_SUBCATEGORIES).flat(),
  ]
  assert.equal(Object.isFrozen(taxonomy.CURATION_CATEGORIES), true)
  assert.equal(Object.isFrozen(taxonomy.CURATION_SUBCATEGORIES), true)
  assert.equal(Object.isFrozen(taxonomy.CURATION_FACET_AXES), true)
  assert.equal(allRecords.every(Object.isFrozen), true)
  assert.equal(Object.values(taxonomy.CURATION_SUBCATEGORIES).every(Object.isFrozen), true)
  assert.equal(Object.values(taxonomy.CURATION_FACET_AXES).every(Object.isFrozen), true)
  for (const record of allRecords) {
    assert.equal('baseScore' in record, false)
    assert.equal('minScore' in record, false)
    assert.equal('maxScore' in record, false)
  }
  assert.equal(new Set(taxonomy.CURATION_CATEGORIES.map(({ id }) => id)).size, 13)
  assert.equal(new Set(taxonomy.CURATION_CATEGORIES.map(({ label }) => label)).size, 13)
})

test('classification rejects entity-level categories and validates entry/unit relationships', () => {
  assert.deepEqual(taxonomy.classificationErrors(classification({ recordLevel: 'entity' })), [
    'entity records must not define a primary category',
    'entity records must not define a subcategory',
  ])
  assert.deepEqual(taxonomy.classificationErrors(classification({ entityId: '' })), [
    'entry records must reference entityId',
  ])
  assert.deepEqual(taxonomy.classificationErrors(classification({
    recordLevel: 'unit',
    entryId: '',
  })), ['unit records must reference entryId'])
  assert.deepEqual(taxonomy.classificationErrors(classification({
    recordLevel: 'unit',
    entryId: 'entry-example',
  })), [])
})

test('classification reports unknown values and parent/child mismatch in stable order', () => {
  assert.deepEqual(taxonomy.classificationErrors(classification({
    primaryCategory: 'unknown-category',
    subcategory: 'unknown-subcategory',
    status: 'unknown-status',
  })), [
    'unknown primary category: unknown-category',
    'unknown subcategory: unknown-subcategory',
    'unknown classification status: unknown-status',
  ])
  assert.deepEqual(taxonomy.classificationErrors(classification({
    primaryCategory: 'ui-implementation',
    subcategory: 'icons-symbols',
  })), ['icons-symbols does not belong to ui-implementation'])
})

test('confirmed classification requires an independent reviewer and publishable evidence', () => {
  const sameReviewer = classification({ reviewerId: 'curator-a' })
  assert.match(taxonomy.classificationErrors(sameReviewer).join('\n'), /reviewerId must differ from curatorId/u)
  assert.equal(taxonomy.isPublishableClassification(sameReviewer), false)
  assert.equal(taxonomy.isPublishableClassification(classification({ alternatives: [
    { primaryCategory: 'visual-assets', subcategory: 'icons-symbols' },
  ] })), false)
  assert.equal(taxonomy.isPublishableClassification(classification({ reasons: [] })), false)
  assert.equal(taxonomy.isPublishableClassification(classification({
    reasons: [{ statement: '只有无来源判断', evidenceUrl: '' }],
  })), false)
  assert.equal(taxonomy.isPublishableClassification(classification()), true)
})

test('confirmed classification reports every missing review and canonical evidence gate', () => {
  assert.deepEqual(taxonomy.classificationErrors(classification({ curatorId: undefined })), [
    'confirmed classification requires curatorId',
  ])
  assert.deepEqual(taxonomy.classificationErrors(classification({ reviewerId: undefined })), [
    'confirmed classification requires reviewerId',
  ])
  assert.deepEqual(taxonomy.classificationErrors(classification({
    confirmedAt: '2026-09-01',
  })), ['confirmedAt must be a canonical ISO timestamp'])
  assert.deepEqual(taxonomy.classificationErrors(classification({
    reasons: [{ statement: '直接证据必须走加密链接', evidenceUrl: 'http://example.com' }],
  })), ['confirmed classification requires at least one HTTPS evidence reason'])
  assert.deepEqual(taxonomy.classificationErrors(classification({ reasons: [] })), [
    'confirmed classification requires at least one HTTPS evidence reason',
  ])
})

test('alternatives are plain, legal, distinct, normalized, and status-aware', () => {
  const needsReview = classification({
    status: 'needs-review',
    alternatives: [{
      primaryCategory: 'visual-assets',
      subcategory: 'icons-symbols',
    }],
  })
  assert.deepEqual(taxonomy.classificationErrors(needsReview), [])
  assert.deepEqual(taxonomy.classificationErrors(classification({
    status: 'needs-review',
    alternatives: [[]],
  })), ['alternatives[0] must be a plain object'])
  assert.deepEqual(taxonomy.classificationErrors(classification({
    status: 'needs-review',
    alternatives: [{
      primaryCategory: 'unknown-category',
      subcategory: 'icons-symbols',
    }],
  })), ['alternatives[0] unknown primary category: unknown-category'])
  assert.deepEqual(taxonomy.classificationErrors(classification({
    status: 'needs-review',
    alternatives: [{
      primaryCategory: 'ui-implementation',
      subcategory: 'icons-symbols',
    }],
  })), ['alternatives[0]: icons-symbols does not belong to ui-implementation'])
  assert.deepEqual(taxonomy.classificationErrors(classification({
    status: 'needs-review',
    alternatives: [{
      primaryCategory: 'UI-IMPLEMENTATION',
      subcategory: 'ＧＥＮＥＲＡＬ－ＵＩ－ＣＯＭＰＯＮＥＮＴＳ',
    }],
  })), ['alternatives[0] must differ from primary classification'])
  assert.deepEqual(taxonomy.classificationErrors(classification({
    status: 'needs-review',
    alternatives: [
      { primaryCategory: 'visual-assets', subcategory: 'icons-symbols' },
      { primaryCategory: 'ＶＩＳＵＡＬ－ＡＳＳＥＴＳ', subcategory: 'ICONS-SYMBOLS' },
    ],
  })), ['alternatives[1] duplicates an earlier alternative'])
  assert.deepEqual(taxonomy.classificationErrors(classification({
    alternatives: [{ primaryCategory: 'visual-assets', subcategory: 'icons-symbols' }],
  })), ['confirmed classifications must not have alternatives'])
})

test('alternative and reason accessors fail closed without being invoked', () => {
  let calls = 0
  const alternative = {}
  Object.defineProperty(alternative, 'primaryCategory', {
    enumerable: true,
    get() {
      calls += 1
      return 'visual-assets'
    },
  })
  Object.defineProperty(alternative, 'subcategory', {
    enumerable: true,
    value: 'icons-symbols',
  })
  assert.deepEqual(taxonomy.classificationErrors(classification({
    status: 'needs-review',
    alternatives: [alternative],
  })), ['alternatives[0].primaryCategory must be a data property'])

  const reason = {}
  Object.defineProperty(reason, 'statement', {
    enumerable: true,
    get() {
      calls += 1
      return '不得执行该 getter'
    },
  })
  Object.defineProperty(reason, 'evidenceUrl', {
    enumerable: true,
    value: 'https://example.com',
  })
  assert.deepEqual(taxonomy.classificationErrors(classification({ reasons: [reason] })), [
    'reasons[0].statement must be a data property',
    'confirmed classification requires at least one HTTPS evidence reason',
  ])
  assert.deepEqual(taxonomy.classificationErrors(classification({ reasons: [[]] })), [
    'reasons[0] must be a plain object',
    'confirmed classification requires at least one HTTPS evidence reason',
  ])
  assert.equal(calls, 0)
})

test('classification top-level objects use one allowed-field descriptor snapshot', () => {
  let getterCalls = 0
  const accessorRecord = classification()
  Object.defineProperty(accessorRecord, 'status', {
    enumerable: true,
    get() {
      getterCalls += 1
      return 'confirmed'
    },
  })
  assert.deepEqual(taxonomy.classificationErrors(accessorRecord), [
    'classification.status must be a data property',
  ])
  assert.equal(taxonomy.isPublishableClassification(accessorRecord), false)
  assert.equal(getterCalls, 0)

  const symbolRecord = classification()
  symbolRecord[Symbol('hidden')] = true
  assert.deepEqual(taxonomy.classificationErrors(symbolRecord), [
    'classification contains an unexpected symbol property',
  ])
  assert.deepEqual(taxonomy.classificationErrors({
    ...classification(),
    unexpected: true,
  }), ['classification.unexpected is not allowed'])

  const polluted = classification()
  Object.defineProperty(polluted, '__proto__', {
    enumerable: true,
    value: { polluted: true },
  })
  assert.deepEqual(taxonomy.classificationErrors(polluted), [
    'classification.__proto__ is not allowed',
  ])
  assert.equal(Object.prototype.polluted, undefined)
  assert.deepEqual(taxonomy.classificationErrors(Object.create(classification())), [
    'classification must be a plain object',
  ])
  assert.deepEqual(taxonomy.classificationErrors(new Proxy({}, {
    getPrototypeOf() {
      throw new Error('contained')
    },
  })), ['classification could not be inspected safely'])

  const descriptorProxy = new Proxy(classification(), {
    get() {
      throw new Error('ordinary property reads are forbidden')
    },
  })
  assert.deepEqual(taxonomy.classificationErrors(descriptorProxy), [])
  assert.equal(taxonomy.isPublishableClassification(descriptorProxy), true)
})

test('excluded records may omit taxonomy but require a plain stated exclusion reason', () => {
  const excluded = classification({
    status: 'excluded',
    primaryCategory: undefined,
    subcategory: undefined,
    reasons: [{ statement: '官方链接已确认为死链' }],
  })
  assert.deepEqual(taxonomy.classificationErrors(excluded), [])
  assert.deepEqual(taxonomy.classificationErrors({ ...excluded, reasons: [] }), [
    'excluded classification requires at least one exclusion reason',
  ])
  assert.equal(taxonomy.isPublishableClassification(excluded), false)
})

test('needs-review and excluded records never publish', () => {
  assert.deepEqual(taxonomy.classificationErrors(classification({ status: 'needs-review' })), [])
  assert.deepEqual(taxonomy.classificationErrors(classification({ status: 'excluded' })), [])
  assert.equal(taxonomy.isPublishableClassification(classification({ status: 'needs-review' })), false)
  assert.equal(taxonomy.isPublishableClassification(classification({ status: 'excluded' })), false)
})

test('publishing can fail closed against supplied entity and entry registries', () => {
  assert.equal(taxonomy.isPublishableClassification(classification(), {
    validEntityIds: ['another-entity'],
  }), false)
  assert.equal(taxonomy.isPublishableClassification(classification(), {
    validEntityIds: ['entity-example'],
  }), true)
  const unit = classification({ recordLevel: 'unit', entryId: 'entry-example' })
  assert.equal(taxonomy.isPublishableClassification(unit, {
    validEntityIds: ['entity-example'],
    validEntryIds: ['another-entry'],
  }), false)
  assert.equal(taxonomy.isPublishableClassification(unit, {
    validEntityIds: ['entity-example'],
    validEntryIds: ['entry-example'],
  }), true)
})

test('Visit Website is never a publishable final name', () => {
  assert.equal(taxonomy.isPublishableClassification(classification({ name: 'Visit Website' })), false)
  assert.equal(taxonomy.isPublishableClassification(classification({ name: '  visit website  ' })), false)
})

test('single-site showcase requires explicit three-page and human rationale gates', () => {
  const showcase = classification({
    primaryCategory: 'single-site-showcase',
    subcategory: 'product-company-sites',
  })
  assert.equal(taxonomy.isPublishableClassification(showcase), false)
  assert.equal(taxonomy.isPublishableClassification(showcase, {
    evidencePageCount: 3,
    manualShowcaseReason: '该站的网格、排版和叙事结构可直接支持设计研究。',
    designRelevanceConfirmed: false,
  }), false)
  assert.equal(taxonomy.isPublishableClassification(showcase, {
    evidencePageCount: 2,
    manualShowcaseReason: '该站的网格、排版和叙事结构可直接支持设计研究。',
    designRelevanceConfirmed: true,
  }), false)
  assert.equal(taxonomy.isPublishableClassification(showcase, {
    evidencePageCount: 3,
    manualShowcaseReason: '该站的网格、排版和叙事结构可直接支持设计研究。',
    designRelevanceConfirmed: true,
  }), true)
})

test('facet registry covers all canonical axes and the values named by the specification', () => {
  assert.deepEqual(Object.keys(taxonomy.CURATION_FACET_AXES), FACET_AXIS_IDS)
  const expectedValues = {
    scenarios: ['ai', 'agent', 'saas', 'ecommerce', 'recruiting', 'marketing', 'admin', 'finance', 'education', 'gaming', 'mobile'],
    deliverables: ['component', 'primitive', 'block', 'full-page', 'template', 'design-file', 'icon', 'font', 'image', 'model', 'standard', 'case-screenshot', 'starter', 'illustration', 'video', 'audio', 'three-d-model', 'code-library', 'glossary', 'user-flow', 'report', 'prompt'],
    actions: ['browse', 'search', 'compare', 'copy', 'install', 'download', 'generate', 'edit', 'prototype', 'test', 'audit', 'learn', 'export', 'publish', 'submit', 'purchase', 'hire', 'apply', 'preview', 'collaborate', 'sell'],
    media: ['ui', 'icon', 'font', 'image', 'video', 'audio', '3d', 'data-visualization', 'typography', 'motion'],
    platforms: ['web', 'ios', 'android', 'desktop', 'browser-extension', 'figma', 'framer', 'webflow', 'cli', 'api', 'mcp', 'sketch'],
    technologies: ['react', 'vue', 'svelte', 'angular', 'tailwind', 'css', 'javascript', 'webgl', 'lottie', 'typescript', 'web-components', 'three-js', 'gsap', 'motion', 'svg', 'canvas', 'react-native', 'flutter', 'radix-ui', 'base-ui', 'shadcn-ui'],
    workflowStages: ['discovery', 'ideation', 'design', 'build', 'test', 'handoff', 'publish'],
    audiences: ['designer', 'developer', 'researcher', 'content-creator', 'brand-team', 'educator'],
    access: ['free', 'freemium', 'paid', 'trial', 'login-required', 'invite-only', 'open-source', 'closed-source', 'source-available'],
    licenses: ['unknown', 'MIT', 'ISC', 'BSD-2-Clause', 'LGPL-3.0-only', 'AGPL-3.0-only', 'AGPL-3.0-or-later', 'MPL-2.0', 'OFL-1.1', 'CC-BY-SA-4.0'],
    contentOrganization: ['single-work', 'component-registry', 'asset-library', 'case-gallery', 'flow-library', 'standards-documentation', 'course', 'editorial-feed', 'external-link-directory', 'community-feed', 'marketplace', 'awards', 'searchable-directory'],
    languages: ['zh-hans', 'zh-hant', 'en', 'multi'],
  }
  for (const [axisId, requiredIds] of Object.entries(expectedValues)) {
    const ids = taxonomy.CURATION_FACET_AXES[axisId].map(({ id }) => id)
    for (const id of requiredIds) assert.ok(ids.includes(id), `${axisId} is missing ${id}`)
  }
})

test('facets are controlled, reject unknown axes and values, and fail closed', () => {
  assert.deepEqual(taxonomy.facetsErrors({
    scenarios: ['ai', 'unknown-scenario'],
    unknownAxis: [],
  }), [
    'unknown facet axis: unknownAxis',
    'unknown scenarios facet: unknown-scenario',
  ])
  assert.deepEqual(taxonomy.facetsErrors({ technologies: 'react' }), [
    'facets.technologies must be an array',
  ])
  assert.throws(
    () => taxonomy.canonicalizeFacets({ scenarios: ['unknown-scenario'] }),
    { name: 'TypeError', message: 'unknown scenarios facet: unknown-scenario' },
  )
})

test('facet objects fail closed on accessors, symbols, exotic prototypes, and proxy traps', () => {
  let getterCalls = 0
  const accessorFacets = {}
  Object.defineProperty(accessorFacets, 'scenarios', {
    enumerable: true,
    get() {
      getterCalls += 1
      return ['ai']
    },
  })
  assert.deepEqual(taxonomy.facetsErrors(accessorFacets), [
    'facets.scenarios must be a data property',
  ])
  assert.throws(
    () => taxonomy.canonicalizeFacets(accessorFacets),
    { name: 'TypeError', message: 'facets.scenarios must be a data property' },
  )
  assert.equal(getterCalls, 0)

  const symbolFacets = { scenarios: ['ai'] }
  symbolFacets[Symbol('hidden')] = []
  assert.deepEqual(taxonomy.facetsErrors(symbolFacets), [
    'facets contains an unexpected symbol property',
  ])
  assert.deepEqual(taxonomy.facetsErrors(Object.create({ scenarios: ['ai'] })), [
    'facets must be a plain object',
  ])
  assert.deepEqual(taxonomy.facetsErrors(new Proxy({}, {
    getPrototypeOf() {
      throw new Error('trap must be contained')
    },
  })), ['facets could not be inspected safely'])
})

test('facet arrays fail closed on sparse/accessor/symbol entries without invoking getters', () => {
  let getterCalls = 0
  const accessorValues = []
  Object.defineProperty(accessorValues, '0', {
    enumerable: true,
    get() {
      getterCalls += 1
      return 'ai'
    },
  })
  accessorValues.length = 1
  assert.deepEqual(taxonomy.facetsErrors({ scenarios: accessorValues }), [
    'facets.scenarios[0] must be a data property',
  ])
  assert.equal(getterCalls, 0)

  const symbolValues = ['ai']
  symbolValues[Symbol('hidden')] = 'agent'
  assert.deepEqual(taxonomy.facetsErrors({ scenarios: symbolValues }), [
    'facets.scenarios contains an unexpected symbol property',
  ])
  assert.deepEqual(taxonomy.facetsErrors({ scenarios: new Array(1) }), [
    'facets.scenarios[0] must be a data property',
  ])
})

test('__proto__ facet data is rejected without polluting canonical output prototypes', () => {
  const input = JSON.parse('{"__proto__":["polluted"],"scenarios":["ai"]}')
  assert.deepEqual(taxonomy.facetsErrors(input), ['unknown facet axis: __proto__'])
  assert.throws(
    () => taxonomy.canonicalizeFacets(input),
    { name: 'TypeError', message: 'unknown facet axis: __proto__' },
  )
  const canonical = taxonomy.canonicalizeFacets(Object.assign(Object.create(null), {
    scenarios: ['ai'],
  }))
  assert.equal(Object.getPrototypeOf(canonical), Object.prototype)
  assert.equal(Object.prototype.polluted, undefined)
})

test('facets canonicalize and deduplicate by Unicode compatibility and case without mutation', () => {
  const input = deepFreeze({
    scenarios: ['AI', 'Ａｉ', 'Agent', '电商', '招聘', '移动端'],
    technologies: ['React', 'ＲＥＡＣＴ', 'react', 'WebGL'],
    platforms: ['iOS', 'ANDROID', 'Chrome 扩展'],
    licenses: ['MIT', 'mit'],
    languages: ['ZH-Hans', 'zh-hans'],
  })
  assert.deepEqual(taxonomy.facetsErrors(input), [])
  assert.deepEqual(taxonomy.canonicalizeFacets(input), {
    scenarios: ['ai', 'agent', 'ecommerce', 'recruiting', 'mobile'],
    deliverables: [],
    actions: [],
    media: [],
    platforms: ['ios', 'android', 'browser-extension'],
    technologies: ['react', 'webgl'],
    workflowStages: [],
    audiences: [],
    access: [],
    licenses: ['MIT'],
    contentOrganization: [],
    languages: ['zh-hans'],
  })
  assert.deepEqual(input, {
    scenarios: ['AI', 'Ａｉ', 'Agent', '电商', '招聘', '移动端'],
    technologies: ['React', 'ＲＥＡＣＴ', 'react', 'WebGL'],
    platforms: ['iOS', 'ANDROID', 'Chrome 扩展'],
    licenses: ['MIT', 'mit'],
    languages: ['ZH-Hans', 'zh-hans'],
  })
})

test('source-available is a distinct controlled access state rather than open or closed source', () => {
  assert.deepEqual(taxonomy.facetsErrors({ access: ['源码可见/受限'] }), [])
  assert.deepEqual(taxonomy.canonicalizeFacets({ access: ['Source-Available'] }).access, [
    'source-available',
  ])
  assert.notEqual('source-available', 'open-source')
  assert.notEqual('source-available', 'closed-source')
})

test('AI, Agent, React, mobile, ecommerce, and recruiting are facets rather than taxonomy branches', () => {
  const categoryIds = taxonomy.CURATION_CATEGORIES.map(({ id }) => id)
  const subcategoryIds = Object.values(taxonomy.CURATION_SUBCATEGORIES).flat().map(({ id }) => id)
  for (const forbiddenId of ['ai', 'agent', 'react', 'mobile', 'ecommerce']) {
    assert.equal(categoryIds.some((id) => id.split('-').includes(forbiddenId)), false)
    assert.equal(subcategoryIds.some((id) => id.split('-').includes(forbiddenId)), false)
  }
  assert.deepEqual(taxonomy.facetsErrors({
    scenarios: ['ai', 'agent', 'mobile', 'ecommerce', 'recruiting'],
    technologies: ['react'],
  }), [])
})

const BOUNDARY_DECISION_LEDGER = [
  {
    id: 'testing-library-react',
    approvedTarget: ['research-quality-tools', 'usability-testing-experimentation'],
    rejectedTargets: [
      ['visual-assets', 'fonts-typefaces'],
      ['visual-assets', 'icons-symbols'],
      ['visual-implementation', 'data-visualization-code'],
      ['visual-implementation', 'motion-interaction-code'],
    ],
    facets: { technologies: ['react'], actions: ['test'] },
  },
  {
    id: 'd3-chart-package',
    approvedTarget: ['visual-implementation', 'data-visualization-code'],
    rejectedTargets: [['creation-tools', 'image-vector-layout-creation']],
    facets: { media: ['data-visualization'], technologies: ['javascript'] },
  },
  {
    id: 'react-wrapped-icon-library',
    approvedTarget: ['visual-assets', 'icons-symbols'],
    rejectedTargets: [['ui-implementation', 'general-ui-components']],
    facets: { deliverables: ['icon'], technologies: ['react'] },
  },
  {
    id: 'color-generator',
    approvedTarget: ['creation-tools', 'image-vector-layout-creation'],
    rejectedTargets: [['visual-assets', 'photos-images-textures']],
    facets: { actions: ['generate'] },
  },
  {
    id: 'mockup-generator',
    approvedTarget: ['creation-tools', 'brand-presentation-content-creation'],
    rejectedTargets: [['templates-design-files', 'mockup-brand-showcase-templates']],
    facets: { actions: ['generate'] },
  },
  {
    id: 'downloadable-figma-mockup',
    approvedTarget: ['templates-design-files', 'mockup-brand-showcase-templates'],
    rejectedTargets: [['creation-tools', 'brand-presentation-content-creation']],
    facets: { actions: ['download'], platforms: ['figma'] },
  },
  {
    id: 'onsite-gallery',
    approvedTarget: ['case-inspiration-collections', 'website-landing-page-cases'],
    rejectedTargets: [
      ['directories-indexes', 'general-resource-directories'],
      ['community-marketplaces', 'communities-professional-networks'],
    ],
    facets: { actions: ['browse'], contentOrganization: ['case-gallery'] },
  },
  {
    id: 'external-link-directory',
    approvedTarget: ['directories-indexes', 'general-resource-directories'],
    rejectedTargets: [
      ['case-inspiration-collections', 'website-landing-page-cases'],
      ['community-marketplaces', 'communities-professional-networks'],
    ],
    facets: { actions: ['search'], contentOrganization: ['external-link-directory'] },
  },
  {
    id: 'participatory-community',
    approvedTarget: ['community-marketplaces', 'communities-professional-networks'],
    rejectedTargets: [
      ['case-inspiration-collections', 'multi-author-portfolios-curations'],
      ['directories-indexes', 'general-resource-directories'],
    ],
    facets: { actions: ['publish'], contentOrganization: ['community-feed'] },
  },
  {
    id: 'accessible-component-library',
    approvedTarget: ['ui-implementation', 'headless-accessible-primitives'],
    rejectedTargets: [['research-quality-tools', 'accessibility-audit-remediation']],
    facets: { deliverables: ['primitive'] },
  },
  {
    id: '21st-dev-onsite-components',
    approvedTarget: ['ui-implementation', 'general-ui-components'],
    rejectedTargets: [
      ['directories-indexes', 'component-package-indexes'],
      ['community-marketplaces', 'communities-professional-networks'],
    ],
    facets: { actions: ['browse', 'install'], contentOrganization: ['community-feed'] },
  },
  {
    id: 'figma-design-entry',
    recordLevel: 'entry',
    approvedTarget: ['creation-tools', 'ui-prototyping-whiteboard'],
    rejectedTargets: [
      ['community-marketplaces', 'asset-template-service-markets'],
      ['templates-design-files', 'ui-kits-design-files'],
    ],
    facets: { actions: ['edit', 'prototype', 'collaborate'], platforms: ['figma'] },
  },
  {
    id: 'figma-community-entry',
    recordLevel: 'entry',
    approvedTarget: ['community-marketplaces', 'asset-template-service-markets'],
    rejectedTargets: [
      ['creation-tools', 'ui-prototyping-whiteboard'],
      ['templates-design-files', 'ui-kits-design-files'],
    ],
    facets: { actions: ['browse', 'publish'], contentOrganization: ['marketplace'] },
  },
  {
    id: 'figma-ui-kit-unit',
    recordLevel: 'unit',
    approvedTarget: ['templates-design-files', 'ui-kits-design-files'],
    rejectedTargets: [
      ['creation-tools', 'ui-prototyping-whiteboard'],
      ['community-marketplaces', 'asset-template-service-markets'],
    ],
    facets: { deliverables: ['design-file'], actions: ['preview', 'download'], platforms: ['figma'] },
  },
  {
    id: 'refero-styles-entry',
    approvedTarget: ['case-inspiration-collections', 'product-ui-screen-flow-cases'],
    rejectedTargets: [['directories-indexes', 'general-resource-directories']],
    facets: { actions: ['browse'], contentOrganization: ['case-gallery'] },
  },
  {
    id: 'toools-design-entry',
    approvedTarget: ['directories-indexes', 'general-resource-directories'],
    rejectedTargets: [['case-inspiration-collections', 'product-ui-screen-flow-cases']],
    facets: { actions: ['search'], contentOrganization: ['external-link-directory'] },
  },
  {
    id: 'kimi-recruiting-showcase-entry',
    approvedTarget: ['single-site-showcase', 'product-company-sites'],
    rejectedTargets: [['community-marketplaces', 'talent-jobs-collaboration-markets']],
    facets: { scenarios: ['recruiting'], contentOrganization: ['single-work'] },
  },
  {
    id: 'recruiting-market-entry',
    approvedTarget: ['community-marketplaces', 'talent-jobs-collaboration-markets'],
    rejectedTargets: [['single-site-showcase', 'product-company-sites']],
    facets: {
      scenarios: ['recruiting'],
      actions: ['publish', 'hire', 'apply'],
      contentOrganization: ['marketplace'],
    },
  },
]

test('canonical regression decision ledger records approved and rejected targets without classifying', () => {
  for (const fixture of BOUNDARY_DECISION_LEDGER) {
    const [primaryCategory, subcategory] = fixture.approvedTarget
    const recordLevel = fixture.recordLevel ?? 'entry'
    assert.deepEqual(
      taxonomy.classificationErrors(classification({
        primaryCategory,
        subcategory,
        recordLevel,
        ...(recordLevel === 'unit' ? { entryId: 'entry-example' } : {}),
      })),
      [],
      `${fixture.id} approved target must remain canonical`,
    )
    assert.deepEqual(taxonomy.facetsErrors(fixture.facets), [], `${fixture.id} facets must be controlled`)
    for (const rejectedTarget of fixture.rejectedTargets) {
      assert.notDeepEqual(
        fixture.approvedTarget,
        rejectedTarget,
        `${fixture.id} approved and rejected decisions must differ`,
      )
      assert.deepEqual(
        taxonomy.classificationErrors(classification({
          primaryCategory: rejectedTarget[0],
          subcategory: rejectedTarget[1],
        })),
        [],
        `${fixture.id} rejected decision must still reference a canonical branch`,
      )
    }
  }
})

test('recruiting is a scenario except when participation and matching are the primary action', () => {
  const byId = new Map(BOUNDARY_DECISION_LEDGER.map((decision) => [decision.id, decision]))
  assert.deepEqual(byId.get('kimi-recruiting-showcase-entry'), {
    id: 'kimi-recruiting-showcase-entry',
    approvedTarget: ['single-site-showcase', 'product-company-sites'],
    rejectedTargets: [['community-marketplaces', 'talent-jobs-collaboration-markets']],
    facets: { scenarios: ['recruiting'], contentOrganization: ['single-work'] },
  })
  assert.deepEqual(byId.get('recruiting-market-entry').approvedTarget, [
    'community-marketplaces',
    'talent-jobs-collaboration-markets',
  ])
  assert.deepEqual(byId.get('recruiting-market-entry').facets.actions, [
    'publish',
    'hire',
    'apply',
  ])
})

test('classification and facet validation never mutate frozen inputs', () => {
  const record = deepFreeze(classification())
  const facets = deepFreeze({ scenarios: ['AI'], technologies: ['React'] })
  assert.deepEqual(taxonomy.classificationErrors(record), [])
  assert.equal(taxonomy.isPublishableClassification(record), true)
  assert.deepEqual(taxonomy.facetsErrors(facets), [])
  assert.deepEqual(record, classification())
  assert.deepEqual(facets, { scenarios: ['AI'], technologies: ['React'] })
})
