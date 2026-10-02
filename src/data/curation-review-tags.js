import { CURATION_FACET_AXES } from './curation-taxonomy.js'

// The public release taxonomy intentionally stays on its v3 compatibility
// surface.  The review workbench gets a richer, private registry so a curator
// can separate price, login, source availability, licence and commercial use
// without changing published records.
const value = (id, label, aliases = []) => Object.freeze({ id, label, aliases })
const add = (axis, rows) => Object.freeze([
  ...(CURATION_FACET_AXES[axis] ?? []),
  ...rows.map(([id, label, aliases]) => value(id, label, aliases)),
])

export const REVIEW_FACET_AXES = Object.freeze({
  entryRole: Object.freeze([
    ['tool', '工具'], ['library', '代码 / 组件库'], ['template-library', '模板库'],
    ['asset-library', '素材库'], ['directory-index', '目录 / 索引'], ['reference-standard', '规范 / 参考'],
    ['learning-publisher', '学习 / 出版'], ['case-gallery', '案例集合'], ['community', '社区'],
    ['marketplace', '市场'], ['service-platform', '服务平台'], ['showcase-site', '单站作品展示'],
    ['company-product', '公司 / 产品官网'], ['api-service', 'API 服务'], ['repository', '代码仓库'],
    ['unknown', '未知'],
  ].map(([id, label]) => value(id, label))),
  scenarios: add('scenarios', [
    ['developer-tools', '开发者工具'], ['design-systems', '设计系统'], ['analytics-data', '分析 / 数据'],
    ['productivity', '生产力'], ['social-community', '社交 / 社区'], ['healthcare', '医疗健康'],
    ['enterprise', '企业'], ['consumer', '消费者'], ['accessibility', '无障碍'], ['unknown', '未知'],
  ]),
  deliverables: add('deliverables', [
    ['pattern', '交互模式'], ['texture', '纹理'], ['material', '材质'], ['plugin-extension', '插件 / 扩展'],
    ['dataset', '数据集'], ['tutorial', '教程'], ['article', '文章 / 出版物'], ['course', '课程 / 工作坊'],
    ['podcast-talk', '播客 / 演讲'], ['case-study', '案例研究'], ['job-posting', '职位'],
    ['service-offer', '服务报价'], ['api', 'API'], ['collection', '集合'], ['source-code', '源代码'],
    ['unknown', '未知'],
  ]),
  actions: add('actions', [
    ['filter', '筛选'], ['customize', '定制'], ['configure', '配置'], ['run', '运行'], ['fork', '派生'],
    ['integrate', '集成'], ['contribute', '贡献'], ['comment', '评论'], ['rate', '评价'], ['subscribe', '订阅'],
    ['bookmark', '收藏'], ['license-check', '查许可证'],
  ]),
  media: add('media', [['code', '代码'], ['text', '文本'], ['spatial', '空间'], ['data', '数据']]),
  platforms: add('platforms', [
    ['figjam', 'FigJam'], ['adobe', 'Adobe'], ['canva', 'Canva'], ['github', 'GitHub'], ['npm', 'npm'],
    ['storybook', 'Storybook'], ['unknown', '未知'],
  ]),
  technologies: add('technologies', [
    ['python', 'Python', ['py']], ['node-js', 'Node.js', ['node']], ['vite', 'Vite'], ['next-js', 'Next.js', ['nextjs']],
    ['nuxt', 'Nuxt'], ['astro', 'Astro'], ['d3', 'D3', ['d3.js']], ['p5-js', 'p5.js', ['p5']],
    ['babylon-js', 'Babylon.js', ['babylonjs']], ['webgpu', 'WebGPU'], ['wasm', 'WebAssembly', ['webassembly']],
    ['graphql', 'GraphQL'], ['rest', 'REST'], ['openapi', 'OpenAPI', ['swagger']], ['docker', 'Docker'],
  ]),
  workflowStages: add('workflowStages', [['maintain', '维护']]),
  audiences: add('audiences', [
    ['product-manager', '产品经理'], ['marketer', '营销人员'], ['agency-studio', '代理 / 工作室'],
    ['accessibility-specialist', '无障碍专业人员'], ['open-source-maintainer', '开源维护者'], ['buyer', '采购 / 买方'],
    ['unknown', '未知'],
  ]),
  pricing: Object.freeze([
    ['free', '免费'], ['freemium', '免费增值'], ['paid-one-time', '一次性付费'], ['paid-subscription', '订阅付费'],
    ['quote', '询价'], ['donation', '捐赠'], ['trial', '试用'], ['not-offered', '不适用'], ['unknown', '未知'],
  ].map(([id, label]) => value(id, label))),
  accountAccess: Object.freeze([
    ['public', '公开可用'], ['login-optional', '可选登录'], ['login-required', '必须登录'], ['invite-only', '邀请制'],
    ['paywall', '付费墙'], ['region-restricted', '地区限制'], ['age-restricted', '年龄限制'], ['unknown', '未知'],
  ].map(([id, label]) => value(id, label))),
  sourceAvailability: Object.freeze([
    ['not-applicable', '不适用'], ['open-source', '开源'], ['source-available', '源码可见但受限'],
    ['source-visible', '可查看源码'], ['binary-only', '仅二进制 / 在线服务'], ['downloadable-assets', '可下载素材'],
    ['api-only', '仅 API'], ['unknown', '未知'],
  ].map(([id, label]) => value(id, label))),
  licenses: add('licenses', [
    ['no-license-stated', '未声明许可证'], ['custom-license', '自定义许可证'], ['multiple', '多许可证'],
    ['not-applicable', '不适用'],
  ]),
  commercialUse: Object.freeze([
    ['allowed', '允许商用'], ['allowed-with-attribution', '允许商用但需署名'],
    ['allowed-share-alike', '允许商用但需相同方式共享'], ['non-commercial', '不得商用'],
    ['no-redistribution', '不得再分发'], ['platform-only', '仅限平台内使用'], ['unknown', '未知'], ['not-applicable', '不适用'],
  ].map(([id, label]) => value(id, label))),
  contentOrganization: add('contentOrganization', [
    ['author-feed', '作者 feed'], ['discussion-forum', '讨论论坛'], ['repository-index', '仓库索引'],
    ['api-catalog', 'API 目录'], ['documentation-tree', '文档树'], ['video-channel', '视频频道'], ['sales-catalog', '销售目录'],
  ]),
  languages: add('languages', [
    ['pt', '葡萄牙语'], ['ru', '俄语'], ['ar', '阿拉伯语'], ['hi', '印地语'], ['id', '印度尼西亚语'], ['vi', '越南语'], ['unknown', '未知'],
  ]),
})

export const REVIEW_AXIS_LABELS = Object.freeze({
  entryRole: '入口角色', scenarios: '场景', deliverables: '交付物', actions: '动作', media: '媒介',
  platforms: '平台 / 分发面', technologies: '技术', workflowStages: '流程阶段', audiences: '受众',
  pricing: '价格形态', accountAccess: '账户访问', sourceAvailability: '源码 / 素材取得', licenses: '许可证',
  commercialUse: '商业使用权限', contentOrganization: '内容组织', languages: '内容语言',
})

export const REVIEW_AXIS_MODES = Object.freeze({
  entryRole: 'one', pricing: 'one', accountAccess: 'one', sourceAvailability: 'one', commercialUse: 'one',
  licenses: 'many', languages: 'many', scenarios: 'many', deliverables: 'many', actions: 'many', media: 'many',
  platforms: 'many', technologies: 'many', workflowStages: 'many', audiences: 'many', contentOrganization: 'many',
})
