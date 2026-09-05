const essence = (id, label, baseScore, minScore, maxScore) => Object.freeze({
  id,
  label,
  baseScore,
  minScore,
  maxScore,
})

const subcategory = (id, label) => Object.freeze({ id, label })

const subcategories = (records) => Object.freeze(
  records.map(([id, label]) => subcategory(id, label)),
)

export const CURATION_ESSENCES = Object.freeze([
  essence('reusable-implementation', '可复用实现', 90, 80, 100),
  essence('reusable-asset', '可复用素材', 88, 80, 100),
  essence('knowledge-vocabulary', '专业知识与命名', 88, 80, 100),
  essence('operational-tool', '可操作工具', 70, 60, 79),
  essence('resource-aggregator', '资源聚合与导航', 54, 45, 64),
  essence('inspiration-collection', '灵感与案例', 48, 35, 59),
  essence('showcase-commercial', '单站展示与商业官网', 22, 10, 34),
])

export const CURATION_SUBCATEGORIES = Object.freeze({
  'reusable-implementation': subcategories([
    ['ui-components-general', '综合 Web UI 组件库'],
    ['agent-ai-ui', 'Agent、AI、对话与推理界面组件'],
    ['design-system-primitives', '设计系统、无样式与无障碍原语'],
    ['application-dashboard-ui', '应用、后台与数据密集界面组件'],
    ['marketing-sections', '落地页区块与营销组件'],
    ['motion-interaction-code', '动效、微交互与动画实现'],
    ['data-visualization-code', '图表、可视化与数据叙事实现'],
    ['three-d-webgl-code', '3D、WebGL 与空间界面实现'],
    ['mobile-native-ui', '移动端与原生界面组件'],
    ['email-editorial-ui', '邮件、编辑器与富文本组件'],
    ['templates-starters', '项目、页面模板与启动器'],
  ]),
  'reusable-asset': subcategories([
    ['icons-symbols', '图标、符号与象形图'],
    ['fonts-typefaces', '字体、字族与排版资源'],
    ['illustrations-vectors', '插画、SVG 与矢量素材'],
    ['photos-images', '摄影、图片与纹理素材'],
    ['video-motion-assets', '视频、Lottie 与动效素材'],
    ['audio-sound', '音效、音乐与界面声音'],
    ['three-d-assets', '模型、材质与 3D 场景'],
    ['mockups', '设备、包装与产品样机'],
    ['ui-kits-design-files', 'UI Kit 与设计源文件'],
    ['patterns-backgrounds', '背景、图案与生成纹理'],
  ]),
  'knowledge-vocabulary': subcategories([
    ['terminology-vocabulary', '术语、别名与跨媒介词汇'],
    ['ui-patterns-anatomy', '界面模式、结构与交互解剖'],
    ['design-system-guidance', '设计系统方法、规范与治理'],
    ['accessibility-standards', '无障碍标准、清单与实现指导'],
    ['ux-research-methods', '用户体验研究、测试与服务设计方法'],
    ['tutorials-courses', '课程、教程与逐步实践'],
    ['books-articles-newsletters', '书籍、文章、杂志与通讯'],
    ['podcasts-talks', '播客、演讲与访谈'],
  ]),
  'operational-tool': subcategories([
    ['ui-design-prototyping', '界面设计、原型与白板工具'],
    ['ai-design-generation', 'AI 图像、视频、界面与品牌生成工具'],
    ['no-code-site-builder', '无代码、低代码与网站构建工具'],
    ['design-to-code-handoff', '设计转代码、交付与开发协作工具'],
    ['image-video-editing', '图像、视频、动效与声音编辑工具'],
    ['ux-research-testing', '用户研究、测试、分析与反馈工具'],
    ['accessibility-audit', '无障碍检查、模拟与修复工具'],
    ['color-typography-tool', '配色、对比与排版工具'],
    ['asset-optimization', '素材压缩、转换与格式优化工具'],
    ['collaboration-workflow', '设计协作、项目、评审与版本工具'],
    ['presentation-storytelling', '演示、数据叙事与发布工具'],
  ]),
  'resource-aggregator': subcategories([
    ['design-resource-directory', '综合设计资源导航'],
    ['component-library-index', '组件库、设计系统与注册表索引'],
    ['tool-directory', '设计、AI 与开发工具目录'],
    ['asset-directory', '字体、图标、图片与 3D 素材目录'],
    ['awesome-repository-list', '精选列表、仓库与软件包索引'],
    ['learning-resource-index', '教程、课程、书籍与知识来源导航'],
  ]),
  'inspiration-collection': subcategories([
    ['website-gallery', '网站、落地页与网页案例'],
    ['ui-screen-flow-gallery', '界面截图、用户流程与产品模式'],
    ['brand-logo-gallery', '品牌、标志、包装与视觉识别'],
    ['motion-interaction-gallery', '品牌动效、交互与动态案例'],
    ['editorial-poster-gallery', '编辑、海报、排版与出版案例'],
    ['portfolio-collection', '多人及多工作室作品集合'],
    ['three-d-spatial-gallery', '3D、空间、装置与沉浸案例'],
  ]),
  'showcase-commercial': subcategories([
    ['product-saas-marketing', '产品与 SaaS 营销站'],
    ['agency-studio', '代理机构与设计工作室官网'],
    ['individual-portfolio', '个人作品集'],
    ['brand-campaign', '品牌、活动与营销官网'],
    ['experimental-microsite', '实验性、叙事性与创意微站'],
    ['commerce-retail', '零售、电商与消费品牌展示'],
  ]),
})

const ESSENCE_BY_ID = new Map(CURATION_ESSENCES.map((record) => [record.id, record]))
const SUBCATEGORY_ESSENCE_BY_ID = new Map(
  Object.entries(CURATION_SUBCATEGORIES).flatMap(([essenceId, records]) => (
    records.map(({ id }) => [id, essenceId])
  )),
)

export function taxonomySelectionErrors(record) {
  const { resourceEssence, subcategory: subcategoryId } = record ?? {}
  const errors = []
  const essenceRecord = ESSENCE_BY_ID.get(resourceEssence)
  const subcategoryEssenceId = SUBCATEGORY_ESSENCE_BY_ID.get(subcategoryId)

  if (!essenceRecord) {
    errors.push(`unknown resource essence: ${resourceEssence}`)
  }

  if (!subcategoryEssenceId) {
    errors.push(`unknown subcategory: ${subcategoryId}`)
  } else if (essenceRecord && subcategoryEssenceId !== resourceEssence) {
    errors.push(`${subcategoryId} does not belong to ${resourceEssence}`)
  }

  return errors
}

export function scoreWithinEssenceBand(essenceId, modifiers = []) {
  const essenceRecord = ESSENCE_BY_ID.get(essenceId)
  if (!essenceRecord) {
    throw new TypeError(`unknown resource essence: ${essenceId}`)
  }

  if (!Array.isArray(modifiers)) {
    throw new TypeError('modifiers must be an array')
  }

  modifiers.forEach((value, index) => {
    if (!Number.isFinite(value)) {
      throw new TypeError(`modifier at index ${index} must be a finite number`)
    }
  })

  const score = essenceRecord.baseScore + modifiers.reduce((sum, value) => sum + value, 0)
  return Math.max(essenceRecord.minScore, Math.min(essenceRecord.maxScore, score))
}
