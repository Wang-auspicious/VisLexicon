import { createHash } from 'node:crypto'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const DEMO_ROOT = resolve(SCRIPT_DIR, '..')
const DEFAULT_TOOOLS_INPUT = resolve(DEMO_ROOT, 'data/sources/toools-design.raw.json')
const DEFAULT_EXTERNAL_INPUT = resolve(
  DEMO_ROOT,
  'data/sources/design-resources-for-developers.raw.json',
)
const DEFAULT_TRANSLATIONS_INPUT = resolve(
  DEMO_ROOT,
  'data/sources/site-descriptions.zh.raw.json',
)
const DEFAULT_SAASLANDINGPAGE_INPUT = resolve(DEMO_ROOT, 'data/sources/saaslandingpage.raw.json')
const DEFAULT_NPM_INPUT = resolve(DEMO_ROOT, 'data/sources/npm-resources.raw.json')
const DEFAULT_OUTPUT = resolve(DEMO_ROOT, 'src/data/site-catalog.json')
const DEFAULT_PUBLIC_INDEX = resolve(DEMO_ROOT, 'public/data/site-catalog-index.json')

export const ALLOWED_CATEGORIES = [
  'AI 设计工具',
  '灵感与案例',
  'UI 组件与设计系统',
  '视觉素材与字体',
  '设计创作与原型',
  'UX 研究与学习',
  '前端开发与动效',
  '协作与效率',
  '品牌与营销',
]

const TRACKING_PARAMS = new Set([
  '_from',
  '_encoding',
  'afsrc',
  'aff',
  'aff_id',
  'affiliate',
  'affiliate_id',
  'ascsubtag',
  'campaign',
  'campaignid',
  'cjdata',
  'cjevent',
  'clickid',
  'dclid',
  'dib',
  'dib_tag',
  'experiment_id',
  'fbclid',
  'from',
  'gclid',
  'igshid',
  'impact_click_id',
  'im_ref',
  'irclickid',
  'irgwc',
  'iradid',
  'iradtype',
  'irmptype',
  'irpid',
  'language',
  'linkcode',
  'linkid',
  'mc_cid',
  'mc_eid',
  'msclkid',
  'mediaid',
  'mp',
  'mp_value1',
  'mpid',
  'partner',
  'promocode',
  'qid',
  'ref',
  'si',
  'sharedid',
  'source',
  'srsltid',
  'subid',
  'sr',
  'tab',
  'tag',
  'trafcat',
  'via',
])

const CATEGORY_MAP = {
  'AI Tools': ['AI 设计工具', 'AI 设计工具'],
  'AI Graphic Design Tools': ['AI 设计工具', 'AI 图形设计'],
  'AI 设计工具': ['AI 设计工具', 'AI 设计工具'],
  'AI 图像生成': ['AI 设计工具', 'AI 图形设计'],
  Inspiration: ['灵感与案例', '综合设计灵感'],
  'Design Inspiration': ['灵感与案例', '网站与界面灵感'],
  Icons: ['视觉素材与字体', '图标库'],
  'Icon Fonts': ['视觉素材与字体', '图标字体'],
  Favicons: ['视觉素材与字体', '网站图标'],
  Illustrations: ['视觉素材与字体', '插画'],
  'Vectors & Clip Art': ['视觉素材与字体', '矢量与剪贴画'],
  'UI Graphics': ['视觉素材与字体', 'UI 图形'],
  Logos: ['品牌与营销', 'Logo 与标识'],
  'Stock Photos': ['视觉素材与字体', '图库与影像'],
  'Stock Videos': ['视觉素材与字体', '视频素材'],
  'Stock Music & Sound Effects': ['视觉素材与字体', '音乐与音效'],
  Fonts: ['视觉素材与字体', '字体与排版'],
  Typography: ['视觉素材与字体', '字体与排版'],
  Colors: ['视觉素材与字体', '色彩'],
  'Color Tools': ['视觉素材与字体', '色彩工具'],
  'Product & Image Mockups': ['UI 组件与设计系统', '产品与图像样机'],
  'Mocks + UI Kits': ['UI 组件与设计系统', '样机与 UI 套件'],
  'UI Components & Kits': ['UI 组件与设计系统', 'UI 组件与套件'],
  'Design Systems & Style Guides': ['UI 组件与设计系统', '设计系统与样式指南'],
  'React UI Libraries': ['UI 组件与设计系统', 'React UI 库'],
  'Vue UI Libraries': ['UI 组件与设计系统', 'Vue UI 库'],
  'Angular UI Libraries': ['UI 组件与设计系统', 'Angular UI 库'],
  'Svelte UI Libraries': ['UI 组件与设计系统', 'Svelte UI 库'],
  'React Native UI Libraries': ['UI 组件与设计系统', 'React Native UI 库'],
  'Online Design Tools': ['设计创作与原型', '在线设计工具'],
  'Downloadable Design Software': ['设计创作与原型', '桌面设计软件'],
  'Design Tools': ['设计创作与原型', '综合设计工具'],
  'Web Builders': ['设计创作与原型', '无代码与网站构建'],
  'Image Compression': ['设计创作与原型', '图像压缩与优化'],
  Learning: ['UX 研究与学习', '设计学习'],
  'UX Tools': ['UX 研究与学习', 'UX 研究与测试工具'],
  'Blogs & Mags': ['UX 研究与学习', '博客与杂志'],
  Podcasts: ['UX 研究与学习', '设计播客'],
  Books: ['UX 研究与学习', '设计书籍'],
  Community: ['协作与效率', '设计社区'],
  Productivity: ['协作与效率', '生产力与协作'],
  'Chrome Extensions': ['协作与效率', 'Chrome 扩展'],
  'Firefox Extensions': ['协作与效率', 'Firefox 扩展'],
  Marketing: ['品牌与营销', '营销工具'],
  'HTML & CSS Templates': ['前端开发与动效', 'HTML 与 CSS 模板'],
  'CSS Frameworks': ['前端开发与动效', 'CSS 框架'],
  'CSS Methodologies': ['前端开发与动效', 'CSS 方法论'],
  'CSS Animations': ['前端开发与动效', 'CSS 动效'],
  'Javascript Animation Libraries': ['前端开发与动效', 'JavaScript 动效库'],
  'Javascript Chart Libraries': ['前端开发与动效', 'JavaScript 图表库'],
  Others: ['设计创作与原型', '其他设计资源'],
  'Landing Pages': ['灵感与案例', '落地页灵感'],
}

const SUBCATEGORY_SUMMARIES = {
  'AI 设计工具': '面向设计工作的人工智能工具或 AI 方法资源。',
  'AI 图形设计': '使用人工智能生成、编辑或处理视觉内容的工具。',
  '综合设计灵感': '汇集设计案例与视觉参考，帮助发现创作方向。',
  '网站与界面灵感': '提供网站、产品与界面案例，便于查找设计参考。',
  图标库: '提供可检索、下载或定制的图标资源。',
  图标字体: '提供可在界面或前端项目中使用的图标字体。',
  网站图标: '用于生成、查找或制作 favicon 与网站图标。',
  插画: '提供可用于产品、网页或品牌项目的插画资源。',
  '矢量与剪贴画': '提供可编辑的矢量图形或剪贴画素材。',
  'UI 图形': '提供网页与界面设计所需的图形素材。',
  'Logo 与标识': '用于 Logo、标识与品牌视觉的参考或制作资源。',
  '图库与影像': '提供可用于设计项目的照片与图像素材。',
  视频素材: '提供可用于设计、演示或营销内容的视频素材。',
  音乐与音效: '提供配乐、环境声或界面音效素材。',
  字体与排版: '用于查找、识别、下载字体或研究排版。',
  色彩: '提供配色灵感、色值参考或色彩知识。',
  色彩工具: '用于生成、检查或管理设计配色。',
  产品与图像样机: '提供产品展示与图像呈现所需的样机资源。',
  '样机与 UI 套件': '提供界面套件、屏幕资源或产品样机。',
  'UI 组件与套件': '提供可复用的界面组件、区块或 UI 套件。',
  设计系统与样式指南: '提供设计系统、组件规范或品牌样式指南。',
  'React UI 库': '提供面向 React 项目的界面组件库。',
  'Vue UI 库': '提供面向 Vue 项目的界面组件库。',
  'Angular UI 库': '提供面向 Angular 项目的界面组件库。',
  'Svelte UI 库': '提供面向 Svelte 项目的界面组件库。',
  'React Native UI 库': '提供面向 React Native 移动项目的界面组件。',
  在线设计工具: '可在浏览器中完成视觉设计、编辑或生成任务。',
  桌面设计软件: '提供可下载的设计、编辑或创作软件。',
  综合设计工具: '服务于视觉设计、内容制作或创意工作流。',
  无代码与网站构建: '用于无代码、低代码或可视化网站构建。',
  图像压缩与优化: '用于压缩、转换或优化网页图像资源。',
  设计学习: '提供设计课程、教程、方法或练习材料。',
  'UX 研究与测试工具': '支持用户研究、可用性测试或体验分析。',
  博客与杂志: '持续发布设计文章、观点、案例或行业资讯。',
  设计播客: '以音频节目讨论设计实践、行业与职业经验。',
  设计书籍: '面向设计师的专业书籍与延伸阅读资源。',
  设计社区: '连接设计从业者，支持交流、分享与协作。',
  生产力与协作: '帮助设计团队管理任务、协作与日常工作流。',
  'Chrome 扩展': '通过 Chrome 扩展补充设计或开发工作流。',
  'Firefox 扩展': '通过 Firefox 扩展补充设计或开发工作流。',
  营销工具: '支持品牌传播、内容制作与营销设计工作。',
  'HTML 与 CSS 模板': '提供可复用的网站模板与前端页面起点。',
  'CSS 框架': '提供布局、样式或组件开发所需的 CSS 框架。',
  'CSS 方法论': '介绍组织与维护 CSS 代码的方法体系。',
  'CSS 动效': '提供基于 CSS 的动画效果与实现资源。',
  'JavaScript 动效库': '提供网页交互与动画开发所需的 JavaScript 库。',
  'JavaScript 图表库': '提供数据图表与可视化开发所需的 JavaScript 库。',
  其他设计资源: '补充设计、创意或前端工作流中的实用能力。',
  '落地页灵感': '汇集真实产品落地页案例，提供设计参考与灵感。',
  'Tailwind 组件': '提供基于 Tailwind CSS 的组件、区块与套件。',
  'Three.js 与 3D': '提供 Three.js、WebGL 或 3D 场景相关的库与资源。',
  表单构建: '用于构建、校验或管理表单的工具与组件。',
  富文本编辑器: '提供可嵌入的富文本编辑或排版能力。',
  设计令牌与变量: '提供设计令牌、主题变量或样式标记体系。',
  落地页模板: '提供可复用的落地页模板与页面起点。',
  'SaaS 起点与模板': '提供 SaaS 应用的模板、样板或起点工程。',
  后台管理模板: '提供后台管理界面或仪表盘的模板与套件。',
  原型工具: '用于快速搭建交互原型或线框图的工具。',
  玻璃拟态: '提供玻璃拟态（Glassmorphism）效果的样式与组件。',
  新拟态: '提供新拟态（Neumorphism）风格的组件与效果。',
  'Bento 布局': '提供 Bento 网格布局的组件、模板与灵感。',
  'AI 图形设计': '使用人工智能生成、编辑或处理视觉内容的工具。',
  'Web Components 库': '提供基于 Web Components 标准的组件库。',
  'Framer Motion': '围绕 Framer Motion 的组件、示例或教程资源。',
  'UI 动效': '提供界面交互动效的实现、示例或组件。',
  微交互: '提供按钮、图标等微交互细节的动效实现。',
}

function decodeHtml(value = '') {
  return String(value)
    .replace(/&amp;/gi, '&')
    .replace(/&#0*38;/g, '&')
    .replace(/&#x0*26;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;|&#39;|&apos;/gi, "'")
}

function isTrackingParam(name) {
  const normalized = name.toLocaleLowerCase('en-US')
  return (
    TRACKING_PARAMS.has(normalized) ||
    normalized.startsWith('utm_') ||
    normalized.startsWith('affiliate_') ||
    normalized.startsWith('ref_')
  )
}

export function canonicalizeUrl(value) {
  const decoded = decodeHtml(value).trim()
  const withProtocol = /^https?:\/\//i.test(decoded) ? decoded : `https://${decoded.replace(/^\/\//, '')}`
  const url = new URL(withProtocol)

  url.protocol = 'https:'
  url.username = ''
  url.password = ''
  url.hash = ''
  url.hostname = url.hostname.toLocaleLowerCase('en-US').replace(/^www\./, '').replace(/\.$/, '')
  if (url.port === '80' || url.port === '443') url.port = ''

  for (const name of [...url.searchParams.keys()]) {
    if (isTrackingParam(name)) url.searchParams.delete(name)
  }
  url.searchParams.sort()

  url.pathname = url.pathname
    .replace(/\/{2,}/g, '/')
    .replace(/\/(?:index\.html?)$/i, '')
    .replace(/\/$/, '')

  if (/(?:^|\.)amazon\.[a-z.]+$/i.test(url.hostname)) {
    const asin = url.pathname.match(/\/(?:[^/]+\/)?(?:dp|gp\/product)\/([a-z0-9]{10})(?:\/|$)/i)?.[1]
    if (asin) {
      url.pathname = `/dp/${asin.toUpperCase()}`
      url.search = ''
    }
  }

  return url.href.replace(/\?$/, '').replace(/\/$/, '')
}

function sourcePriority(sourceId) {
  return sourceId === 'toools-design' ? 2 : 1
}

function classify(record) {
  const mapped = CATEGORY_MAP[record.categoryOriginal]
  if (!mapped) return ['设计创作与原型', '其他设计资源']
  // 新来源自带更细的子分类时优先使用，一级分类仍由映射决定
  if (record.subcategoryZh && record.subcategoryZh !== mapped[1]) {
    return [mapped[0], record.subcategoryZh]
  }
  return mapped
}

function pricingModel(values) {
  const normalized = values.join(' ').toLocaleLowerCase('en-US')
  if (/free\s*\+\s*paid|freemium/.test(normalized)) return 'freemium'
  if (/free trial/.test(normalized)) return 'trial'
  if (/\bfree\b/.test(normalized)) return 'free'
  if (/\bpaid\b/.test(normalized)) return 'paid'
  if (/\bbeta\b/.test(normalized)) return 'beta'
  return 'unknown'
}

function slugify(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('en-US')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 56)
    .replace(/-$/, '')
}

function stableId(name, canonicalUrl) {
  const fallback = new URL(canonicalUrl).hostname.split('.')[0]
  const slug = slugify(name) || slugify(fallback) || 'site'
  const hash = createHash('sha256').update(canonicalUrl).digest('hex').slice(0, 8)
  return `${slug}-${hash}`
}

function entryTags(record, categories) {
  const text = `${record.name} ${record.originalDescription} ${record.categoryOriginal}`.toLocaleLowerCase('en-US')
  const rules = [
    ['accessibility', /accessib|a11y|wcag/],
    ['ai', /\bai\b|artificial intelligence|machine learning|generative/],
    ['animation', /animat|motion|transition/],
    ['angular', /angular/],
    ['chart', /chart|data visuali/],
    ['color', /colou?r|palette|gradient/],
    ['css', /\bcss\b/],
    ['figma', /figma/],
    ['font', /font|typograph/],
    ['free', /\bfree\b/],
    ['icon', /icon/],
    ['illustration', /illustrat|vector|clip art/],
    ['javascript', /javascript|\bjs\b/],
    ['no-code', /no[- ]code|website builder/],
    ['open-source', /open[- ]source/],
    ['react', /react/],
    ['svelte', /svelte/],
    ['tailwind', /tailwind/],
    ['three-js', /three\.js|webgl|shader/],
    ['ui-kit', /ui kit|component/],
    ['ux', /\bux\b|user experience|usability/],
    ['vue', /\bvue\b/],
    ['webflow', /webflow/],
  ]
  const tags = rules.filter(([, pattern]) => pattern.test(text)).map(([tag]) => tag)
  tags.push(...categories.map((value) => slugify(value)).filter(Boolean))
  return [...new Set(tags)].sort()
}

function descriptionKey(value) {
  return createHash('sha256').update(String(value).trim()).digest('hex').slice(0, 16)
}

function buildChineseDescription(name, subcategories, translated) {
  const displayName = name.length > 48 ? `${name.slice(0, 47).trim()}…` : name
  if (translated && /[\u3400-\u9fff]/u.test(translated)) {
    const cleanTranslation = translated.replace(/\s+/g, ' ').trim().replace(/[。.!！]+$/, '')
    const statement =
      subcategories[0] === '设计书籍'
        ? `${displayName}：设计书籍；来源页署名或作者为 ${cleanTranslation}。`
        : `${displayName}：${cleanTranslation}。`
    return statement.length > 120 ? `${statement.slice(0, 119).trim()}…` : statement
  }
  const summary = SUBCATEGORY_SUMMARIES[subcategories[0]] ?? SUBCATEGORY_SUMMARIES['其他设计资源']
  return `${displayName}：${summary}`.slice(0, 120)
}

function evidenceFrom(record, sourceId, sourceListingUrl, sourceCollectedAt) {
  return {
    sourceId,
    listingUrl: record.listingUrl ?? sourceListingUrl,
    originalUrl: record.originalUrl,
    resolvedUrl: record.resolvedUrl ?? null,
    resolutionStatus: record.resolutionStatus ?? 'not-required',
    resolutionHttpStatus: record.resolutionHttpStatus ?? null,
    originalDescription: record.originalDescription,
    categoryOriginal: record.categoryOriginal,
    pricingOriginal: record.pricing || 'Unknown',
    collectedAt: record.collectedAt ?? sourceCollectedAt,
  }
}

function uniqueStrings(values) {
  return [...new Set(values.filter(Boolean))]
}

function mergeRecords(rawSources, translationCache) {
  const grouped = new Map()

  for (const raw of rawSources) {
    for (const record of raw.records) {
      let canonicalUrl
      try {
        canonicalUrl = canonicalizeUrl(record.resolvedUrl || record.originalUrl)
      } catch {
        continue
      }
      if (!/^https:\/\//.test(canonicalUrl)) continue

      const [category, subcategory] = classify(record)
      const existing = grouped.get(canonicalUrl)
      const evidence = evidenceFrom(record, raw.source.id, raw.source.url, raw.source.collectedAt)

      if (!existing) {
        grouped.set(canonicalUrl, {
          canonicalUrl,
          records: [{ ...record, sourceId: raw.source.id }],
          evidence: [evidence],
          categories: [category],
          subcategories: [subcategory],
        })
      } else {
        existing.records.push({ ...record, sourceId: raw.source.id })
        if (
          !existing.evidence.some(
            (item) =>
              item.sourceId === evidence.sourceId &&
              item.listingUrl === evidence.listingUrl &&
              item.originalUrl === evidence.originalUrl,
          )
        ) {
          existing.evidence.push(evidence)
        }
        existing.categories.push(category)
        existing.subcategories.push(subcategory)
      }
    }
  }

  return [...grouped.values()].map((group) => {
    const records = [...group.records].sort(
      (a, b) =>
        sourcePriority(b.sourceId) - sourcePriority(a.sourceId) ||
        b.originalDescription.length - a.originalDescription.length,
    )
    const preferred = records[0]
    const categories = uniqueStrings(group.categories)
    const category = categories.sort(
      (a, b) => ALLOWED_CATEGORIES.indexOf(a) - ALLOWED_CATEGORIES.indexOf(b),
    )[0]
    const subcategories = uniqueStrings(group.subcategories)
    const pricingLabels = uniqueStrings(records.map(({ pricing }) => pricing || 'Unknown'))
    const domain = new URL(group.canonicalUrl).hostname
    const key = descriptionKey(preferred.originalDescription)
    const translation = translationCache?.translations?.[key]?.translationZh ?? null
    const unresolvedRedirect = group.evidence.some(({ resolutionStatus }) => resolutionStatus === 'unchanged')

    return {
      id: stableId(preferred.name, group.canonicalUrl),
      name: preferred.name,
      canonicalUrl: group.canonicalUrl,
      domain,
      descriptionZh: buildChineseDescription(preferred.name, subcategories, translation),
      descriptionOriginal: preferred.originalDescription,
      descriptionQuality: translation ? 'machine-translation' : 'taxonomy-summary',
      descriptionBasis: translation
        ? 'source listing description translated to Simplified Chinese'
        : 'source listing name and category',
      translationKey: translation ? key : null,
      canonicalizationStatus: unresolvedRedirect ? 'unresolved-redirect' : 'normalized',
      category,
      secondaryCategories: categories.filter((value) => value !== category),
      subcategories,
      tags: entryTags(preferred, [...categories, ...subcategories]),
      pricing: { model: pricingModel(pricingLabels), labelsOriginal: pricingLabels },
      reviewStatus: 'candidate',
      evidenceLevel: 'directory-listing',
      sourceEvidence: group.evidence.sort(
        (a, b) =>
          a.sourceId.localeCompare(b.sourceId) ||
          a.listingUrl.localeCompare(b.listingUrl) ||
          a.originalUrl.localeCompare(b.originalUrl),
      ),
    }
  })
}

function sourceManifest(raw, entries) {
  const rawRecordCount = raw.rawRecordCount ?? raw.source.rawRecordCount ?? raw.records?.length ?? 0
  const recordCount = entries.filter((entry) =>
    entry.sourceEvidence.some(({ sourceId }) => sourceId === raw.source.id),
  ).length
  const listingPages = raw.listingPages?.map(({ name, path, url, recordCount: count }) => ({
    name,
    path,
    url,
    recordCount: count,
  })) ?? [
    {
      name: raw.source.readmePath || 'source listing',
      url: raw.source.readmeUrl || raw.source.url,
      recordCount: rawRecordCount,
    },
  ]

  return {
    id: raw.source.id,
    name: raw.source.name,
    url: raw.source.url,
    description: raw.source.description,
    collectedAt: raw.source.collectedAt,
    rawRecordCount,
    recordCount,
    listingPages,
    commitSha: raw.source.commitSha ?? null,
    failures: raw.failures ?? [],
  }
}

function catalogStats(entries, sources) {
  const rawRecords = sources.reduce((sum, { rawRecordCount }) => sum + rawRecordCount, 0)
  const uniqueSourceCoverage = sources.reduce((sum, { recordCount }) => sum + recordCount, 0)
  return {
    rawRecords,
    totalEntries: entries.length,
    mergedDuplicateRows: rawRecords - entries.length,
    withinSourceDuplicateRows: rawRecords - uniqueSourceCoverage,
    crossSourceOverlaps: uniqueSourceCoverage - entries.length,
    byCategory: Object.fromEntries(
      ALLOWED_CATEGORIES.map((category) => [
        category,
        entries.filter((entry) => entry.category === category).length,
      ]),
    ),
    sourceCoverage: Object.fromEntries(sources.map(({ id, recordCount }) => [id, recordCount])),
    chineseDescriptions: {
      machineTranslated: entries.filter(({ descriptionQuality }) => descriptionQuality === 'machine-translation').length,
      taxonomyFallback: entries.filter(({ descriptionQuality }) => descriptionQuality === 'taxonomy-summary').length,
    },
    redirectResolution: {
      resolved: entries.reduce(
        (count, entry) =>
          count + entry.sourceEvidence.filter(({ resolutionStatus }) => resolutionStatus === 'resolved').length,
        0,
      ),
      unresolved: entries.filter(({ canonicalizationStatus }) => canonicalizationStatus === 'unresolved-redirect').length,
    },
  }
}

export function validateSiteCatalog(catalog) {
  const errors = []
  if (!catalog || typeof catalog !== 'object') return ['catalog must be an object']
  if (catalog.schemaVersion !== 1) errors.push('schemaVersion must be 1')
  if (!Array.isArray(catalog.sources) || catalog.sources.length === 0) errors.push('sources required')
  if (!Array.isArray(catalog.entries)) return [...errors, 'entries must be an array']

  const sourceIds = new Set((catalog.sources ?? []).map(({ id }) => id))
  for (const source of catalog.sources ?? []) {
    if (Array.isArray(source.failures) && source.failures.length > 0) {
      errors.push(`${source.id}: source failures must be resolved before publication`)
    }
  }
  const ids = new Set()
  const urls = new Set()

  for (const [index, entry] of catalog.entries.entries()) {
    const label = entry?.id || `entries[${index}]`
    if (!entry || typeof entry !== 'object') {
      errors.push(`${label}: must be an object`)
      continue
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*-[a-f0-9]{8}$/.test(entry.id)) errors.push(`${label}: invalid id`)
    if (ids.has(entry.id)) errors.push(`${label}: duplicate id`)
    ids.add(entry.id)

    try {
      if (entry.canonicalUrl !== canonicalizeUrl(entry.canonicalUrl)) {
        errors.push(`${label}: URL is not canonical`)
      }
      if (entry.domain !== new URL(entry.canonicalUrl).hostname) errors.push(`${label}: domain mismatch`)
    } catch {
      errors.push(`${label}: invalid canonical URL`)
    }
    if (urls.has(entry.canonicalUrl)) errors.push(`${label}: duplicate canonical URL`)
    urls.add(entry.canonicalUrl)

    if (!entry.name?.trim()) errors.push(`${label}: name required`)
    if (!ALLOWED_CATEGORIES.includes(entry.category)) errors.push(`${label}: invalid category`)
    if (entry.reviewStatus !== 'candidate') errors.push(`${label}: reviewStatus must be candidate`)
    if (entry.evidenceLevel !== 'directory-listing') {
      errors.push(`${label}: evidenceLevel must be directory-listing`)
    }
    if (!Array.isArray(entry.subcategories) || entry.subcategories.length === 0) {
      errors.push(`${label}: subcategories required`)
    }
    if (!/[\u3400-\u9fff]/u.test(entry.descriptionZh || '')) errors.push(`${label}: Chinese intro required`)
    if (entry.descriptionZh?.length < 8 || entry.descriptionZh?.length > 120) {
      errors.push(`${label}: Chinese intro length out of range`)
    }
    if (!Array.isArray(entry.sourceEvidence) || entry.sourceEvidence.length === 0) {
      errors.push(`${label}: source evidence required`)
      continue
    }
    for (const evidence of entry.sourceEvidence) {
      if (!sourceIds.has(evidence.sourceId)) errors.push(`${label}: unknown source ${evidence.sourceId}`)
      if (!/^https:\/\//.test(evidence.listingUrl || '')) errors.push(`${label}: invalid listing URL`)
      if (!evidence.originalUrl?.trim()) errors.push(`${label}: original URL required`)
      if (!evidence.originalDescription?.trim()) errors.push(`${label}: original description required`)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(evidence.collectedAt || '')) {
        errors.push(`${label}: invalid collection date`)
      }
    }
  }
  return errors
}

export function buildPublicSiteIndex(catalog) {
  return {
    schemaVersion: 1,
    generatedAt: catalog.generatedAt,
    total: catalog.entries.length,
    categoryCounts: catalog.stats.byCategory,
    entries: catalog.entries.map((entry) => ({
      id: entry.id,
      name: entry.name,
      canonicalUrl: entry.canonicalUrl,
      descriptionZh: entry.descriptionZh,
      category: entry.category,
      subcategories: entry.subcategories,
      tags: entry.tags,
      pricing: { model: entry.pricing.model },
      reviewStatus: entry.reviewStatus,
      evidenceLevel: entry.evidenceLevel,
      sourceIds: [...new Set(entry.sourceEvidence.map(({ sourceId }) => sourceId))],
    })),
  }
}

async function writeCatalogOutputsAtomically({ output, indexOutput, catalog, publicIndex }) {
  const fullTemp = `${output}.${process.pid}.tmp`
  const indexTemp = `${indexOutput}.${process.pid}.tmp`
  await mkdir(dirname(output), { recursive: true })
  await mkdir(dirname(indexOutput), { recursive: true })

  try {
    await writeFile(fullTemp, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8')
    await writeFile(indexTemp, `${JSON.stringify(publicIndex)}\n`, 'utf8')
    await rename(fullTemp, output)
    await rename(indexTemp, indexOutput)
  } finally {
    await rm(fullTemp, { force: true })
    await rm(indexTemp, { force: true })
  }
}

function parseArgs(argv) {
  const options = {
    toools: DEFAULT_TOOOLS_INPUT,
    external: DEFAULT_EXTERNAL_INPUT,
    saaslandingpage: DEFAULT_SAASLANDINGPAGE_INPUT,
    npm: DEFAULT_NPM_INPUT,
    translations: DEFAULT_TRANSLATIONS_INPUT,
    output: DEFAULT_OUTPUT,
    indexOutput: DEFAULT_PUBLIC_INDEX,
    validateOnly: false,
  }
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index]
    if (value === '--toools') options.toools = resolve(argv[++index])
    else if (value === '--external') options.external = resolve(argv[++index])
    else if (value === '--saaslandingpage') options.saaslandingpage = resolve(argv[++index])
    else if (value === '--npm') options.npm = resolve(argv[++index])
    else if (value === '--translations') options.translations = resolve(argv[++index])
    else if (value === '--output') options.output = resolve(argv[++index])
    else if (value === '--index-output') options.indexOutput = resolve(argv[++index])
    else if (value === '--validate-only') options.validateOnly = true
    else throw new Error(`Unknown argument: ${value}`)
  }
  return options
}

export async function buildSiteCatalog(options) {
  const inputPaths = [
    options.toools,
    options.external,
    options.saaslandingpage,
    options.npm,
  ].filter(Boolean)
  const rawSources = await Promise.all(
    inputPaths.map(async (path) => JSON.parse(await readFile(path, 'utf8'))),
  )
  const translationCache = JSON.parse(await readFile(options.translations, 'utf8'))
  const entries = mergeRecords(rawSources, translationCache).sort(
    (a, b) =>
      ALLOWED_CATEGORIES.indexOf(a.category) - ALLOWED_CATEGORIES.indexOf(b.category) ||
      a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }) ||
      a.canonicalUrl.localeCompare(b.canonicalUrl),
  )
  const sources = rawSources.map((raw) => sourceManifest(raw, entries))

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString().slice(0, 10),
    purpose: 'Importable candidate corpus; entries are not published screenshot-verified showcases.',
    taxonomy: {
      primaryCategories: ALLOWED_CATEGORIES,
      model: 'one primary purpose category plus fine-grained subcategories and searchable tags',
    },
    transformations: {
      chineseDescriptions: {
        engine: translationCache.engine,
        endpoint: translationCache.endpoint,
        collectedAt: translationCache.collectedAt,
        uniqueTranslationCount: translationCache.translationCount,
        failureCount: translationCache.failures.length,
        policy: 'Machine translations are accepted only when keyed to the exact source description and containing Chinese text; otherwise a conservative taxonomy summary is used.',
      },
    },
    sources,
    stats: catalogStats(entries, sources),
    entries,
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  let catalog
  let publicIndex
  let publicIndexBytes
  if (options.validateOnly) catalog = JSON.parse(await readFile(options.output, 'utf8'))
  else {
    catalog = await buildSiteCatalog(options)
    publicIndex = buildPublicSiteIndex(catalog)
    const serializedIndex = `${JSON.stringify(publicIndex)}\n`
    publicIndexBytes = Buffer.byteLength(serializedIndex)
  }

  const errors = validateSiteCatalog(catalog)
  if (!options.validateOnly && errors.length === 0) {
    await writeCatalogOutputsAtomically({
      output: options.output,
      indexOutput: options.indexOutput,
      catalog,
      publicIndex,
    })
  }
  process.stdout.write(
    `${JSON.stringify(
      {
        output: options.output,
        publicIndex: options.validateOnly
          ? { output: options.indexOutput }
          : { output: options.indexOutput, total: publicIndex.total, bytes: publicIndexBytes },
        stats: catalog.stats,
        errors,
      },
      null,
      2,
    )}\n`,
  )
  if (errors.length > 0) process.exitCode = 1
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main()
}
