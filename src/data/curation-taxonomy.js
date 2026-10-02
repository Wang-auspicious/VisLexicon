const category = (id, label) => Object.freeze({ id, label })
const subcategory = (id, label) => Object.freeze({ id, label })
const subcategories = (records) => Object.freeze(
  records.map(([id, label]) => subcategory(id, label)),
)

export const CURATION_CATEGORIES = Object.freeze([
  category('ui-implementation', '组件与设计系统'),
  category('visual-implementation', '动效、3D 与数据可视化实现'),
  category('templates-design-files', '模板与设计文件'),
  category('visual-assets', '图标、字体与视觉素材'),
  category('creation-tools', '设计与内容创作工具'),
  category('delivery-development-tools', '建站、交付与开发工具'),
  category('research-quality-tools', '研究、测试与无障碍工具'),
  category('reference-standards', '规范、术语与参考'),
  category('learning-editorial', '教程、课程与行业内容'),
  category('case-inspiration-collections', '案例与灵感集合'),
  category('directories-indexes', '资源目录与索引'),
  category('community-marketplaces', '社区、人才与市场平台'),
  category('single-site-showcase', '单站案例与作品展示'),
])

export const CURATION_SUBCATEGORIES = Object.freeze({
  'ui-implementation': subcategories([
    ['design-system-suites', '设计系统与完整组件套件'],
    ['headless-accessible-primitives', '无样式、无障碍原语'],
    ['general-ui-components', '通用界面组件库'],
    ['page-blocks-embeddable-controls', '页面区块与可嵌入复合控件'],
  ]),
  'visual-implementation': subcategories([
    ['motion-interaction-code', '动效与微交互代码'],
    ['data-visualization-code', '图表与数据可视化代码'],
    ['three-d-spatial-code', '3D、WebGL 与空间实现'],
    ['creative-generative-code', '创意编程与生成式视觉代码'],
  ]),
  'templates-design-files': subcategories([
    ['site-app-starters', '网站、应用模板与项目启动器'],
    ['ui-kits-design-files', 'UI Kit 与设计源文件'],
    ['presentation-editorial-templates', '演示、编辑与出版模板'],
    ['mockup-brand-showcase-templates', '样机、品牌与展示模板'],
  ]),
  'visual-assets': subcategories([
    ['icons-symbols', '图标与符号'],
    ['fonts-typefaces', '字体与字族'],
    ['illustrations-vectors', '插画与矢量素材'],
    ['photos-images-textures', '摄影、位图与纹理'],
    ['video-motion-assets', '视频、Lottie 与动效素材'],
    ['audio-sound-assets', '音乐与音效'],
    ['three-d-models-materials', '3D 模型与材质'],
  ]),
  'creation-tools': subcategories([
    ['ui-prototyping-whiteboard', 'UI/UX 设计、原型与白板'],
    ['image-vector-layout-creation', '图像、矢量与版式创作'],
    ['video-motion-audio-creation', '视频、动效与音频创作'],
    ['three-d-spatial-creation', '3D 与空间创作'],
    ['brand-presentation-content-creation', '品牌、演示与内容生成'],
  ]),
  'delivery-development-tools': subcategories([
    ['site-app-builders', '网站与应用构建器'],
    ['design-to-code-handoff', '设计转代码、交付与开发协作'],
    ['build-deploy-dev-workflow', '构建、部署与开发工作流'],
    ['asset-conversion-optimization', '素材转换、压缩与优化'],
  ]),
  'research-quality-tools': subcategories([
    ['research-recruiting-interviews', '研究、招募与访谈'],
    ['usability-testing-experimentation', '可用性测试与实验'],
    ['behavior-analytics-feedback', '行为分析与反馈'],
    ['accessibility-audit-remediation', '无障碍审计、模拟与修复'],
  ]),
  'reference-standards': subcategories([
    ['terminology-glossaries', '术语与词汇表'],
    ['ui-patterns-anatomy', '界面模式与结构解剖'],
    ['standards-guidelines-checklists', '标准、规范与检查清单'],
    ['design-system-governance-methods', '设计系统治理与方法参考'],
  ]),
  'learning-editorial': subcategories([
    ['tutorials-courses-workshops', '教程、课程与工作坊'],
    ['articles-books-publications', '书籍、文章、博客、杂志与通讯'],
    ['podcasts-talks-video', '播客、演讲与视频'],
    ['news-trends-industry-intelligence', '新闻、趋势与行业情报'],
  ]),
  'case-inspiration-collections': subcategories([
    ['website-landing-page-cases', '网站与落地页案例'],
    ['product-ui-screen-flow-cases', '产品界面、截图与流程'],
    ['brand-packaging-editorial-cases', '品牌、包装、编辑与海报案例'],
    ['motion-three-d-spatial-cases', '动效、3D 与空间案例'],
    ['multi-author-portfolios-curations', '多作者作品集与精选集合'],
  ]),
  'directories-indexes': subcategories([
    ['general-resource-directories', '综合资源导航'],
    ['component-package-indexes', '组件、软件包与实现索引'],
    ['tool-service-directories', '工具与服务目录'],
    ['asset-directories', '素材目录'],
    ['learning-content-indexes', '学习与内容索引'],
  ]),
  'community-marketplaces': subcategories([
    ['communities-professional-networks', '社区与专业网络'],
    ['asset-template-service-markets', '素材、模板与服务市场'],
    ['talent-jobs-collaboration-markets', '招聘、人才与合作撮合'],
  ]),
  'single-site-showcase': subcategories([
    ['product-company-sites', '产品与公司官网'],
    ['agency-studio-sites', '代理机构与工作室官网'],
    ['individual-portfolios', '个人作品集'],
    ['campaign-editorial-experimental-sites', '品牌活动、编辑叙事与实验微站'],
  ]),
})

const facetValue = (id, label, aliases = []) => Object.freeze({
  id,
  label,
  aliases: Object.freeze(aliases),
})
const facetValues = (records) => Object.freeze(
  records.map(([id, label, aliases]) => facetValue(id, label, aliases)),
)

// Extend a facet dictionary by adding one reviewed [id, label, aliases] row here.
// Aliases are normalized with NFKC + case folding and may not collide within an axis.
export const CURATION_FACET_AXES = Object.freeze({
  scenarios: facetValues([
    ['ai', 'AI'],
    ['agent', 'Agent'],
    ['saas', 'SaaS'],
    ['ecommerce', '电商', ['e-commerce', '电子商务']],
    ['recruiting', '招聘', ['jobs']],
    ['marketing', '营销'],
    ['admin', '后台'],
    ['finance', '金融'],
    ['education', '教育'],
    ['gaming', '游戏'],
    ['mobile', '移动端', ['mobile-first']],
  ]),
  deliverables: facetValues([
    ['component', '组件'],
    ['primitive', '原语'],
    ['block', '区块'],
    ['full-page', '完整页面'],
    ['template', '模板'],
    ['design-file', '设计文件'],
    ['icon', '图标'],
    ['font', '字体'],
    ['image', '图片'],
    ['model', '模型'],
    ['standard', '规范'],
    ['case-screenshot', '案例截图'],
    ['starter', '启动器'],
    ['illustration', '插画'],
    ['video', '视频'],
    ['audio', '音频'],
    ['three-d-model', '3D 模型'],
    ['code-library', '代码库'],
    ['glossary', '词汇表'],
    ['user-flow', '用户流程'],
    ['report', '报告'],
    ['prompt', '提示词'],
  ]),
  actions: facetValues([
    ['browse', '浏览'],
    ['search', '搜索'],
    ['compare', '比较'],
    ['copy', '复制'],
    ['install', '安装'],
    ['download', '下载'],
    ['generate', '生成'],
    ['edit', '编辑'],
    ['prototype', '原型'],
    ['test', '测试'],
    ['audit', '审计'],
    ['learn', '学习'],
    ['export', '导出'],
    ['publish', '发布'],
    ['submit', '投稿'],
    ['purchase', '购买'],
    ['hire', '雇佣'],
    ['apply', '申请'],
    ['preview', '预览'],
    ['collaborate', '协作'],
    ['sell', '出售'],
  ]),
  media: facetValues([
    ['ui', 'UI'],
    ['icon', '图标'],
    ['font', '字体'],
    ['image', '图片'],
    ['video', '视频'],
    ['audio', '音频'],
    ['3d', '3D'],
    ['data-visualization', '数据可视化'],
    ['typography', '排版'],
    ['motion', '动效'],
  ]),
  platforms: facetValues([
    ['web', 'Web'],
    ['ios', 'iOS'],
    ['android', 'Android'],
    ['desktop', '桌面端'],
    ['browser-extension', '浏览器扩展', ['chrome 扩展', 'firefox 扩展']],
    ['figma', 'Figma'],
    ['framer', 'Framer'],
    ['webflow', 'Webflow'],
    ['cli', 'CLI'],
    ['api', 'API'],
    ['mcp', 'MCP'],
    ['sketch', 'Sketch'],
  ]),
  technologies: facetValues([
    ['react', 'React'],
    ['vue', 'Vue'],
    ['svelte', 'Svelte'],
    ['angular', 'Angular'],
    ['tailwind', 'Tailwind'],
    ['css', 'CSS'],
    ['javascript', 'JavaScript', ['js']],
    ['webgl', 'WebGL'],
    ['lottie', 'Lottie'],
    ['typescript', 'TypeScript', ['ts']],
    ['web-components', 'Web Components'],
    ['three-js', 'Three.js', ['threejs']],
    ['gsap', 'GSAP'],
    ['motion', 'Motion'],
    ['svg', 'SVG'],
    ['canvas', 'Canvas'],
    ['react-native', 'React Native'],
    ['flutter', 'Flutter'],
    ['radix-ui', 'Radix UI'],
    ['base-ui', 'Base UI'],
    ['shadcn-ui', 'shadcn/ui', ['shadcn ui']],
  ]),
  workflowStages: facetValues([
    ['discovery', '发现'],
    ['ideation', '构思'],
    ['design', '设计'],
    ['build', '构建'],
    ['test', '测试'],
    ['handoff', '交付'],
    ['publish', '发布'],
  ]),
  audiences: facetValues([
    ['designer', '设计师'],
    ['developer', '开发者'],
    ['researcher', '研究员'],
    ['content-creator', '内容创作者'],
    ['brand-team', '品牌团队'],
    ['educator', '教育工作者'],
  ]),
  access: facetValues([
    ['free', '免费'],
    ['freemium', 'Freemium'],
    ['paid', '付费'],
    ['trial', '试用'],
    ['login-required', '需登录'],
    ['invite-only', '邀请制'],
    ['open-source', '开源'],
    ['closed-source', '闭源'],
    ['source-available', '源码可见/受限', ['source available']],
  ]),
  licenses: facetValues([
    ['unknown', '未知'],
    ['MIT', 'MIT'],
    ['Apache-2.0', 'Apache-2.0'],
    ['GPL-3.0-only', 'GPL-3.0-only'],
    ['BSD-3-Clause', 'BSD-3-Clause'],
    ['CC0-1.0', 'CC0-1.0'],
    ['CC-BY-4.0', 'CC-BY-4.0'],
    ['ISC', 'ISC'],
    ['BSD-2-Clause', 'BSD-2-Clause'],
    ['LGPL-3.0-only', 'LGPL-3.0-only'],
    ['AGPL-3.0-only', 'AGPL-3.0-only'],
    ['AGPL-3.0-or-later', 'AGPL-3.0-or-later'],
    ['MPL-2.0', 'MPL-2.0'],
    ['OFL-1.1', 'OFL-1.1'],
    ['CC-BY-SA-4.0', 'CC-BY-SA-4.0'],
    ['proprietary', '专有授权'],
    ['custom', '自定义授权'],
  ]),
  contentOrganization: facetValues([
    ['single-work', '单一作品'],
    ['component-registry', '组件注册表'],
    ['asset-library', '素材库'],
    ['case-gallery', '案例图库'],
    ['flow-library', '流程库'],
    ['standards-documentation', '规范文档'],
    ['course', '课程'],
    ['editorial-feed', '编辑流'],
    ['external-link-directory', '外链目录'],
    ['community-feed', '社区 feed'],
    ['marketplace', '市场'],
    ['awards', '奖项评选'],
    ['searchable-directory', '可搜索目录'],
  ]),
  languages: facetValues([
    ['zh-hans', '简体中文', ['zh-cn']],
    ['zh-hant', '繁体中文', ['zh-tw', 'zh-hk']],
    ['en', '英语'],
    ['ja', '日语'],
    ['ko', '韩语'],
    ['fr', '法语'],
    ['de', '德语'],
    ['es', '西班牙语'],
    ['multi', '多语言'],
  ]),
})

const CATEGORY_BY_ID = new Map(CURATION_CATEGORIES.map((record) => [record.id, record]))
const SUBCATEGORY_CATEGORY_BY_ID = new Map(
  Object.entries(CURATION_SUBCATEGORIES).flatMap(([categoryId, records]) => (
    records.map(({ id }) => [id, categoryId])
  )),
)
const CLASSIFICATION_STATUSES = new Set(['confirmed', 'needs-review', 'excluded'])
const FACET_AXIS_IDS = Object.freeze(Object.keys(CURATION_FACET_AXES))
const FACET_AXIS_ID_SET = new Set(FACET_AXIS_IDS)

function normalizeFacetValue(value) {
  return value.normalize('NFKC').trim().toLocaleLowerCase('und')
}

const FACET_CANONICAL_IDS = new Map(FACET_AXIS_IDS.map((axisId) => {
  const aliases = new Map()
  for (const record of CURATION_FACET_AXES[axisId]) {
    for (const value of [record.id, record.label, ...record.aliases]) {
      const key = normalizeFacetValue(value)
      if (aliases.has(key) && aliases.get(key) !== record.id) {
        throw new TypeError(`duplicate ${axisId} facet alias: ${value}`)
      }
      aliases.set(key, record.id)
    }
  }
  return [axisId, aliases]
}))

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function isDirectEvidenceUrl(value) {
  if (!isNonEmptyString(value)) return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:'
  } catch {
    return false
  }
}

function isCanonicalIsoTimestamp(value) {
  if (!isNonEmptyString(value)) return false
  const timestamp = new Date(value)
  return !Number.isNaN(timestamp.valueOf()) && timestamp.toISOString() === value
}

const ARRAY_INDEX = /^(?:0|[1-9]\d*)$/u
const ALTERNATIVE_FIELDS = new Set(['primaryCategory', 'subcategory'])
const REASON_FIELDS = new Set(['statement', 'evidenceUrl'])
const CLASSIFICATION_FIELDS = new Set([
  'name',
  'recordLevel',
  'entityId',
  'entryId',
  'primaryCategory',
  'subcategory',
  'status',
  'alternatives',
  'reasons',
  'curatorId',
  'reviewerId',
  'confirmedAt',
])

function inspectPlainRecord(value, label, allowedFields, errors) {
  let isArray
  try {
    isArray = Array.isArray(value)
  } catch {
    errors.push(`${label} could not be inspected safely`)
    return null
  }
  if (value === null || typeof value !== 'object' || isArray) {
    errors.push(`${label} must be a plain object`)
    return null
  }

  let prototype
  let keys
  try {
    prototype = Reflect.getPrototypeOf(value)
    keys = Reflect.ownKeys(value)
  } catch {
    errors.push(`${label} could not be inspected safely`)
    return null
  }
  if (prototype !== Object.prototype && prototype !== null) {
    errors.push(`${label} must be a plain object`)
    return null
  }

  const values = new Map()
  const observedFields = new Set()
  for (const key of keys) {
    if (typeof key !== 'string') {
      errors.push(`${label} contains an unexpected symbol property`)
      continue
    }
    if (allowedFields && !allowedFields.has(key)) {
      errors.push(`${label}.${key} is not allowed`)
      continue
    }
    observedFields.add(key)

    let descriptor
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(value, key)
    } catch {
      errors.push(`${label}.${key} could not be inspected safely`)
      continue
    }
    if (!descriptor || !Object.hasOwn(descriptor, 'value')) {
      errors.push(`${label}.${key} must be a data property`)
      continue
    }
    values.set(key, descriptor.value)
  }
  values.observedFields = observedFields
  return values
}

function inspectPlainArray(value, label, errors) {
  let isArray
  try {
    isArray = Array.isArray(value)
  } catch {
    errors.push(`${label} could not be inspected safely`)
    return null
  }
  if (!isArray) {
    errors.push(`${label} must be an array`)
    return null
  }

  let prototype
  let keys
  let lengthDescriptor
  try {
    prototype = Reflect.getPrototypeOf(value)
    keys = Reflect.ownKeys(value)
    lengthDescriptor = Reflect.getOwnPropertyDescriptor(value, 'length')
  } catch {
    errors.push(`${label} could not be inspected safely`)
    return null
  }
  if (prototype !== Array.prototype) {
    errors.push(`${label} must be a plain array`)
    return null
  }
  const length = lengthDescriptor?.value
  if (
    !lengthDescriptor ||
    !Object.hasOwn(lengthDescriptor, 'value') ||
    !Number.isSafeInteger(length) ||
    length < 0 ||
    length > 10_000
  ) {
    errors.push(`${label}.length must be a safe data property`)
    return null
  }

  const values = new Map()
  const observedIndexes = new Set()
  for (const key of keys) {
    if (key === 'length') continue
    if (typeof key !== 'string') {
      errors.push(`${label} contains an unexpected symbol property`)
      continue
    }
    if (!ARRAY_INDEX.test(key) || Number(key) >= length) {
      errors.push(`${label}.${key} is not allowed`)
      continue
    }
    observedIndexes.add(Number(key))

    let descriptor
    try {
      descriptor = Reflect.getOwnPropertyDescriptor(value, key)
    } catch {
      errors.push(`${label}[${key}] could not be inspected safely`)
      continue
    }
    if (!descriptor || !Object.hasOwn(descriptor, 'value')) {
      errors.push(`${label}[${key}] must be a data property`)
      continue
    }
    values.set(Number(key), descriptor.value)
  }
  for (let index = 0; index < length; index += 1) {
    if (!observedIndexes.has(index)) errors.push(`${label}[${index}] must be a data property`)
  }
  return { length, values }
}

function normalizeTaxonomyId(value) {
  return typeof value === 'string'
    ? value.normalize('NFKC').trim().toLocaleLowerCase('und')
    : value
}

function inspectAlternative(value, index, errors) {
  const label = `alternatives[${index}]`
  const fields = inspectPlainRecord(value, label, ALTERNATIVE_FIELDS, errors)
  if (!fields) return null
  if (!fields.has('primaryCategory') && !fields.observedFields.has('primaryCategory')) {
    errors.push(`${label}.primaryCategory must be a data property`)
  }
  if (!fields.has('subcategory') && !fields.observedFields.has('subcategory')) {
    errors.push(`${label}.subcategory must be a data property`)
  }
  if (!fields.has('primaryCategory') || !fields.has('subcategory')) return null
  return {
    primaryCategory: normalizeTaxonomyId(fields.get('primaryCategory')),
    subcategory: normalizeTaxonomyId(fields.get('subcategory')),
  }
}

function inspectReason(value, index, errors) {
  const label = `reasons[${index}]`
  const fields = inspectPlainRecord(value, label, REASON_FIELDS, errors)
  if (!fields) return null
  return {
    statement: fields.get('statement'),
    evidenceUrl: fields.get('evidenceUrl'),
  }
}

function snapshotClassification(record, errors) {
  const fields = inspectPlainRecord(record, 'classification', CLASSIFICATION_FIELDS, errors)
  if (!fields || errors.length > 0) return null
  const snapshot = {}
  for (const field of CLASSIFICATION_FIELDS) {
    if (!fields.has(field)) continue
    Object.defineProperty(snapshot, field, {
      enumerable: true,
      value: fields.get(field),
    })
  }
  return Object.freeze(snapshot)
}

function analyzeClassification(record) {
  const errors = []
  const value = snapshotClassification(record, errors)
  if (!value) return { errors, snapshot: null }
  const categoryId = value.primaryCategory
  const subcategoryId = value.subcategory
  const omitsExcludedTaxonomy = (
    value.status === 'excluded' &&
    !isNonEmptyString(categoryId) &&
    !isNonEmptyString(subcategoryId)
  )

  if (value.recordLevel === 'entity') {
    if (categoryId !== undefined && categoryId !== null && categoryId !== '') {
      errors.push('entity records must not define a primary category')
    }
    if (subcategoryId !== undefined && subcategoryId !== null && subcategoryId !== '') {
      errors.push('entity records must not define a subcategory')
    }
  } else if (!omitsExcludedTaxonomy) {
    const categoryRecord = CATEGORY_BY_ID.get(categoryId)
    const subcategoryCategoryId = SUBCATEGORY_CATEGORY_BY_ID.get(subcategoryId)
    if (!categoryRecord) errors.push(`unknown primary category: ${categoryId}`)
    if (!subcategoryCategoryId) {
      errors.push(`unknown subcategory: ${subcategoryId}`)
    } else if (categoryRecord && subcategoryCategoryId !== categoryId) {
      errors.push(`${subcategoryId} does not belong to ${categoryId}`)
    }
  }

  if (!CLASSIFICATION_STATUSES.has(value.status)) {
    errors.push(`unknown classification status: ${value.status}`)
  }

  if (value.recordLevel === 'entry') {
    if (!isNonEmptyString(value.entityId)) {
      errors.push('entry records must reference entityId')
    }
  } else if (value.recordLevel === 'unit') {
    if (!isNonEmptyString(value.entityId)) {
      errors.push('unit records must reference entityId')
    }
    if (!isNonEmptyString(value.entryId)) {
      errors.push('unit records must reference entryId')
    }
  } else if (value.recordLevel !== 'entity') {
    errors.push(`unknown record level: ${value.recordLevel}`)
  }

  const alternatives = inspectPlainArray(value.alternatives, 'alternatives', errors)
  if (alternatives) {
    const seen = new Set()
    const primaryKey = `${normalizeTaxonomyId(categoryId)}/${normalizeTaxonomyId(subcategoryId)}`
    for (let index = 0; index < alternatives.length; index += 1) {
      if (!alternatives.values.has(index)) continue
      const alternative = inspectAlternative(alternatives.values.get(index), index, errors)
      if (!alternative) continue
      const alternativeCategory = CATEGORY_BY_ID.get(alternative.primaryCategory)
      const alternativeParent = SUBCATEGORY_CATEGORY_BY_ID.get(alternative.subcategory)
      let isLegal = true
      if (!alternativeCategory) {
        errors.push(`alternatives[${index}] unknown primary category: ${alternative.primaryCategory}`)
        isLegal = false
      }
      if (!alternativeParent) {
        errors.push(`alternatives[${index}] unknown subcategory: ${alternative.subcategory}`)
        isLegal = false
      } else if (alternativeCategory && alternativeParent !== alternative.primaryCategory) {
        errors.push(
          `alternatives[${index}]: ${alternative.subcategory} does not belong to ${alternative.primaryCategory}`,
        )
        isLegal = false
      }
      if (!isLegal) continue

      const key = `${alternative.primaryCategory}/${alternative.subcategory}`
      if (key === primaryKey) {
        errors.push(`alternatives[${index}] must differ from primary classification`)
      } else if (seen.has(key)) {
        errors.push(`alternatives[${index}] duplicates an earlier alternative`)
      } else {
        seen.add(key)
      }
    }
  }

  const reasons = inspectPlainArray(value.reasons, 'reasons', errors)
  const inspectedReasons = []
  if (reasons) {
    for (let index = 0; index < reasons.length; index += 1) {
      if (!reasons.values.has(index)) continue
      const reason = inspectReason(reasons.values.get(index), index, errors)
      if (reason) inspectedReasons.push(reason)
    }
  }

  if (value.status === 'confirmed') {
    if (alternatives && alternatives.length > 0) {
      errors.push('confirmed classifications must not have alternatives')
    }
    if (!isNonEmptyString(value.curatorId)) {
      errors.push('confirmed classification requires curatorId')
    }
    if (!isNonEmptyString(value.reviewerId)) {
      errors.push('confirmed classification requires reviewerId')
    }
    if (
      isNonEmptyString(value.curatorId) &&
      isNonEmptyString(value.reviewerId) &&
      value.curatorId.trim() === value.reviewerId.trim()
    ) {
      errors.push('reviewerId must differ from curatorId')
    }
    if (!isCanonicalIsoTimestamp(value.confirmedAt)) {
      errors.push('confirmedAt must be a canonical ISO timestamp')
    }
    if (!inspectedReasons.some((reason) => (
      isNonEmptyString(reason.statement) && isDirectEvidenceUrl(reason.evidenceUrl)
    ))) {
      errors.push('confirmed classification requires at least one HTTPS evidence reason')
    }
  } else if (
    value.status === 'excluded' &&
    !inspectedReasons.some((reason) => isNonEmptyString(reason.statement))
  ) {
    errors.push('excluded classification requires at least one exclusion reason')
  }

  return { errors, snapshot: value }
}

export function classificationErrors(record) {
  return analyzeClassification(record).errors
}

function collectionContains(collection, value) {
  if (collection instanceof Set) return collection.has(value)
  if (Array.isArray(collection)) return collection.includes(value)
  return false
}

export function isPublishableClassification(record, options = {}) {
  const { errors, snapshot } = analyzeClassification(record)
  if (!snapshot || errors.length > 0) return false
  if (snapshot.recordLevel !== 'entry' && snapshot.recordLevel !== 'unit') return false
  if (snapshot.status !== 'confirmed') return false

  const finalName = options.name ?? snapshot.name
  if (
    typeof finalName === 'string' &&
    normalizeFacetValue(finalName) === 'visit website'
  ) return false

  if (
    Object.hasOwn(options, 'validEntityIds') &&
    !collectionContains(options.validEntityIds, snapshot.entityId)
  ) return false
  if (
    snapshot.recordLevel === 'unit' &&
    Object.hasOwn(options, 'validEntryIds') &&
    !collectionContains(options.validEntryIds, snapshot.entryId)
  ) return false

  if (snapshot.primaryCategory === 'single-site-showcase') {
    if (options.evidencePageCount !== 3) return false
    if (!isNonEmptyString(options.manualShowcaseReason)) return false
    if (options.designRelevanceConfirmed !== true) return false
  }

  return true
}

function analyzeFacets(facets) {
  const errors = []
  const canonical = Object.fromEntries(FACET_AXIS_IDS.map((axisId) => [axisId, []]))
  const fields = inspectPlainRecord(facets, 'facets', null, errors)
  if (!fields) return { canonical, errors }

  for (const axisId of fields.keys()) {
    if (!FACET_AXIS_ID_SET.has(axisId)) {
      errors.push(`unknown facet axis: ${axisId}`)
    }
  }

  for (const axisId of FACET_AXIS_IDS) {
    if (!fields.has(axisId)) continue
    const inspected = inspectPlainArray(fields.get(axisId), `facets.${axisId}`, errors)
    if (!inspected) continue
    const canonicalIds = FACET_CANONICAL_IDS.get(axisId)
    const seen = new Set()
    for (let index = 0; index < inspected.length; index += 1) {
      if (!inspected.values.has(index)) continue
      const value = inspected.values.get(index)
      if (typeof value !== 'string') {
        errors.push(`facets.${axisId}[${index}] must be a string`)
        continue
      }
      const canonicalId = canonicalIds.get(normalizeFacetValue(value))
      if (!canonicalId) {
        errors.push(`unknown ${axisId} facet: ${value}`)
      } else if (!seen.has(canonicalId)) {
        seen.add(canonicalId)
        canonical[axisId].push(canonicalId)
      }
    }
  }

  return { canonical, errors }
}

export function facetsErrors(facets) {
  return analyzeFacets(facets).errors
}

export function canonicalizeFacets(facets) {
  const { canonical, errors } = analyzeFacets(facets)
  if (errors.length > 0) throw new TypeError(errors.join('; '))
  return canonical
}
