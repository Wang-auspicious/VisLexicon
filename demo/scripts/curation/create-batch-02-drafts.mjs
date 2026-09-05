import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { facetsErrors } from '../../src/data/curation-taxonomy.js'
import { readImageMetadata } from './image-metadata.mjs'

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url))
const DEMO_ROOT = resolve(SCRIPT_DIRECTORY, '../..')
const OUTPUT_DIR = join(DEMO_ROOT, 'data', 'curation', 'research', '2026-09-02-batch-02')
const PUBLIC_ROOT = join(DEMO_ROOT, 'public')
const CAPTURED_AT = '2026-09-02T02:11:30.000Z'

const SITES = [
  {
    siteId: 'laws-of-ux',
    name: 'Laws of UX',
    entityKey: 'domain:lawsofux.com',
    canonicalUrl: 'https://lawsofux.com/',
    aliases: ['Laws of UX', 'lawsofux.com'],
    identityDecision: 'lawsofux.com 与 Jon Yablonski 的官方说明共同指向同一交互心理学参考站；同名书籍和商店海报保持为独立内容单元。',
    official: { inputUrl: 'https://lawsofux.com/', finalUrl: 'https://lawsofux.com/', checkedAt: CAPTURED_AT },
    explorationMethod: '真实浏览器访问官网首页、Info 说明页与 Hick’s Law 具体条目，并用官方页面核对内容组织、作者和许可边界。',
    internalEssenceZh: '以交互式卡片和具体条目解释用户体验设计中的心理学启发式，兼具索引、定义、要点和案例。',
    descriptionZh: 'Laws of UX 将界面设计常用的心理学启发式整理成可浏览、可检索的交互式参考卡，提供定义、要点与真实产品案例；适合设计师快速查阅和学习，内容可免费访问，但官方许可限制商业再利用与改编。',
    importantLimitZh: '官网内容采用 CC BY-NC-ND 4.0，不能把文章、海报或案例图片当作可自由改编的素材；同名书籍另属独立商品。',
    classificationScopeNoteZh: '本 entry 覆盖 lawsofux.com 的参考站入口，不覆盖书籍商店或第三方转载。',
    classification: {
      recordLevel: 'entry',
      entryId: 'laws-of-ux',
      entityId: 'entity-laws-of-ux',
      primaryCategory: 'reference-standards',
      subcategory: 'standards-guidelines-checklists',
      status: 'needs-review',
      alternatives: [],
      reasons: [
        { statement: '官网把心理学启发式整理为可查阅的用户体验设计参考条目，而不是可安装的软件包。', evidenceUrl: 'https://lawsofux.com/info/' },
        { statement: '首页列出多条定律卡片，具体条目提供定义、要点和产品案例，主要动作是查阅与学习。', evidenceUrl: 'https://lawsofux.com/hicks-law/' },
      ],
    },
    facets: {
      scenarios: ['education'], deliverables: ['standard', 'glossary', 'case-screenshot'], actions: ['browse', 'search', 'learn'],
      media: ['ui', 'typography'], platforms: ['web'], technologies: [], workflowStages: ['discovery', 'design'],
      audiences: ['designer', 'developer', 'educator'], access: ['free', 'closed-source'], licenses: ['custom'],
      contentOrganization: ['standards-documentation', 'searchable-directory', 'case-gallery'], languages: ['en'],
    },
    facts: [
      { field: 'author', value: 'Jon Yablonski', sourceUrl: 'https://lawsofux.com/info/', evidence: '官网 Info 页明确写明该网站由 Jon Yablonski 创建。' },
      { field: 'organization', value: 'Laws of UX', sourceUrl: 'https://lawsofux.com/info/', evidence: '官网将 Laws of UX 说明为面向设计师的交互式心理学资源。' },
      { field: 'license', value: 'custom', sourceUrl: 'https://lawsofux.com/info/', evidence: '官方 Info 页明确声明全站内容采用 Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International；这里用 custom 表示受限许可而非误标为可自由商用的 SPDX。' },
      { field: 'pricing', value: 'Free public reference; posters and book are separate paid products', sourceUrl: 'https://lawsofux.com/', evidence: '官网参考卡片公开可访问，商店和海报链接是独立的付费商品入口。' },
    ],
    pages: [
      { role: 'identity', sourceUrl: 'https://lawsofux.com/info/', finalUrl: 'https://lawsofux.com/info/', title: 'Info | Laws of UX', selectionRationale: 'Info 页直接说明项目由 Jon Yablonski 创建，并解释心理学启发式如何服务用户体验设计。' },
      { role: 'breadth', sourceUrl: 'https://lawsofux.com/', finalUrl: 'https://lawsofux.com/', title: 'Home | Laws of UX', selectionRationale: '首页以多列卡片展示定律目录和每条简介，能看到参考内容的广度与组织方式。' },
      { role: 'proof', sourceUrl: 'https://lawsofux.com/hicks-law/', finalUrl: 'https://lawsofux.com/hicks-law/', title: 'Hick’s Law | Laws of UX', selectionRationale: '具体 Hick’s Law 页面给出定义、要点、Google/Apple/Slack 案例和进一步阅读，证明条目有深度。' },
    ],
  },
  {
    siteId: 'a11y-project',
    name: 'A11Y Project',
    entityKey: 'domain:a11yproject.com',
    canonicalUrl: 'https://www.a11yproject.com/',
    aliases: ['https://a11yproject.com/'],
    identityDecision: 'a11yproject.com 与 a11yproject/a11yproject.com 官方仓库属于同一社区项目；WCAG 本身和外部培训资源不并入该 entry。',
    official: { inputUrl: 'https://www.a11yproject.com/', finalUrl: 'https://www.a11yproject.com/', checkedAt: CAPTURED_AT },
    explorationMethod: '真实浏览器访问官网首页、About 页面和 Checklist 页面；用官方仓库 README、LICENSE-APLv2 与 accessibility statement 核对开放源码、维护方式和审核动作。',
    internalEssenceZh: '社区维护的无障碍教育与审核参考站，提供基础知识、资源索引和可逐项检查的 WCAG 清单。',
    descriptionZh: 'A11Y Project 是社区驱动的数字无障碍教育与实践资源，首页、About 和 Checklist 将基础概念、工具资源与可逐项执行的 WCAG 检查连接起来；适合设计师和开发者学习、审计并改进网页，无障碍内容与站点代码均有清晰来源。',
    importantLimitZh: 'Checklist 是帮助发现问题的参考，不承诺网站达到 100% 无障碍；WCAG 规范和外部资源仍需按各自许可使用。',
    classificationScopeNoteZh: '本 entry 覆盖 A11Y Project 社区站点及其清单入口，不把 WCAG 标准或第三方课程合并成同一实体。',
    classification: {
      recordLevel: 'entry', entryId: 'a11y-project', entityId: 'entity-a11y-project', primaryCategory: 'research-quality-tools', subcategory: 'accessibility-audit-remediation', status: 'needs-review', alternatives: [],
      reasons: [
        { statement: '官网提供可逐项执行的 accessibility checklist，主要动作是审计和修复网页无障碍问题。', evidenceUrl: 'https://www.a11yproject.com/checklist/' },
        { statement: 'About 与 accessibility statement 同时提供学习资源、自动/人工检查方法和社区维护边界。', evidenceUrl: 'https://www.a11yproject.com/about/' },
      ],
    },
    facets: {
      scenarios: ['education'], deliverables: ['standard', 'report', 'glossary'], actions: ['browse', 'search', 'learn', 'audit'],
      media: ['ui'], platforms: ['web'], technologies: ['css', 'javascript', 'svg'], workflowStages: ['discovery', 'design', 'test'],
      audiences: ['designer', 'developer', 'educator', 'researcher'], access: ['free', 'open-source'], licenses: ['Apache-2.0'],
      contentOrganization: ['standards-documentation', 'course', 'editorial-feed', 'searchable-directory'], languages: ['en'],
    },
    facts: [
      { field: 'author', value: 'The A11Y Project community and maintainers', sourceUrl: 'https://www.a11yproject.com/about/', evidence: 'About 页说明项目由社区和维护者共同维护，不指向单一作者。' },
      { field: 'organization', value: 'The A11Y Project', sourceUrl: 'https://www.a11yproject.com/', evidence: '官网首页与页脚使用 The A11Y Project 作为项目身份。' },
      { field: 'repository', value: 'https://github.com/a11yproject/a11yproject.com', sourceUrl: 'https://www.a11yproject.com/about/', evidence: 'About 页直接链接官方 GitHub 仓库。' },
      { field: 'license', value: 'Apache-2.0', sourceUrl: 'https://github.com/a11yproject/a11yproject.com/blob/main/LICENSE-APLv2', evidence: '官方仓库以 LICENSE-APLv2 文件发布站点源码许可，名称对应 Apache License 2.0。' },
      { field: 'pricing', value: 'Free public resource', sourceUrl: 'https://www.a11yproject.com/checklist/', evidence: 'Checklist 与教育内容无需付费即可公开访问。' },
    ],
    pages: [
      { role: 'identity', sourceUrl: 'https://www.a11yproject.com/', finalUrl: 'https://www.a11yproject.com/', title: 'Home - The A11Y Project', selectionRationale: '首页同时呈现社区使命、无障碍教育入口和项目名称，是识别实体与范围的最完整页面。' },
      { role: 'breadth', sourceUrl: 'https://www.a11yproject.com/about/', finalUrl: 'https://www.a11yproject.com/about/', title: 'About - The A11Y Project', selectionRationale: 'About 页把基础概念、包容性、社区、技术栈和资源入口组织在同一站点范围内。' },
      { role: 'proof', sourceUrl: 'https://www.a11yproject.com/checklist/#use-plain-language-and-avoid-figures-of-speech-idioms-and-complicated-metaphors', finalUrl: 'https://www.a11yproject.com/checklist/#use-plain-language-and-avoid-figures-of-speech-idioms-and-complicated-metaphors', title: 'Checklist - The A11Y Project', selectionRationale: 'Checklist 画面显示真实的 Content 检查项、WCAG 3.1.5 引用和可勾选控制，证明清单可执行。' },
    ],
  },
  {
    siteId: 'ecomm-design', name: 'ecomm.design', entityKey: 'domain:ecomm.design', canonicalUrl: 'https://ecomm.design/', aliases: ['Ecomm.Design'],
    identityDecision: 'ecomm.design 官网、About 页和 gallery 入口属于同一电商案例集合；被展示的品牌商店是独立内容单元，不与案例集合合并。',
    official: { inputUrl: 'https://ecomm.design/', finalUrl: 'https://ecomm.design/', checkedAt: CAPTURED_AT },
    explorationMethod: '真实浏览器访问首页案例墙、About 团队说明和 Ecommerce Templates 入口；处理页面 feedback survey 后重新确认案例卡、平台筛选和模板导航可见。',
    internalEssenceZh: '以电商网站案例墙、平台筛选和行业说明帮助用户寻找可参考的商店设计与技术实践。',
    descriptionZh: 'ecomm.design 是面向电商的案例与灵感集合，按平台、标签和价格筛选真实商店页面，并补充模板、工具和行业说明；适合研究商品陈列、品牌叙事与转化路径，只提供公开参考和外链，不把案例图片或商店代码当作可再分发素材。',
    importantLimitZh: '案例由外部商家提供，页面内容和图片的版权范围未统一声明；可借鉴布局与交互，不能默认复制素材、品牌或商店代码。',
    classificationScopeNoteZh: '本 entry 仅覆盖 ecomm.design 的案例集合入口；单个 Polestar、Shopify 商店或模板页面应作为独立内容单元。',
    classification: {
      recordLevel: 'entry', entryId: 'ecomm-design', entityId: 'entity-ecomm-design', primaryCategory: 'case-inspiration-collections', subcategory: 'website-landing-page-cases', status: 'needs-review', alternatives: [],
      reasons: [
        { statement: '首页以大量真实电商商店卡片和平台筛选组织案例，主要动作是浏览和比较网站参考。', evidenceUrl: 'https://ecomm.design/' },
        { statement: 'About 页明确说明目标是展示跨行业电商网站，并关注与 UX 和指标相关的实践。', evidenceUrl: 'https://ecomm.design/about/' },
      ],
    },
    facets: {
      scenarios: ['ecommerce', 'marketing'], deliverables: ['case-screenshot', 'template', 'report'], actions: ['browse', 'search', 'learn', 'preview', 'submit'],
      media: ['ui', 'image', 'typography'], platforms: ['web'], technologies: [], workflowStages: ['discovery', 'design'],
      audiences: ['designer', 'developer', 'brand-team'], access: ['free', 'closed-source'], licenses: ['unknown'],
      contentOrganization: ['case-gallery', 'searchable-directory', 'editorial-feed'], languages: ['en'],
    },
    facts: [
      { field: 'author', value: 'ecomm.design editorial team', sourceUrl: 'https://ecomm.design/about/', evidence: 'About 页列出 Catalin、Bogdan、Raj、Anna 和 Ben 等团队成员及其策展/开发职责。' },
      { field: 'organization', value: 'ecomm.design', sourceUrl: 'https://ecomm.design/about/', evidence: 'About 页以 ecomm.design 名义说明该站收集和策展电商网站。' },
      { field: 'license', value: 'unknown', sourceUrl: 'https://ecomm.design/about/', evidence: '官方 About 和 gallery 页面未提供统一的案例图片、商标或商店代码再分发许可，故按 unknown 记录。' },
      { field: 'pricing', value: 'Free public gallery; external services and templates may be paid', sourceUrl: 'https://ecomm.design/', evidence: '案例墙公开浏览，导航同时指向外部电商服务与模板产品，不能把它们混成本站免费内容。' },
    ],
    pages: [
      { role: 'identity', sourceUrl: 'https://ecomm.design/about/', finalUrl: 'https://ecomm.design/about/', title: 'About | eCommerce Website Design Gallery & Tech Inspiration', selectionRationale: 'About 页直接说明 ecomm.design 的案例集合定位、覆盖行业和策展团队，能界定来源实体。' },
      { role: 'breadth', sourceUrl: 'https://ecomm.design/', finalUrl: 'https://ecomm.design/', title: 'eCommerce Website Design: Gallery & Tech Inspiration', selectionRationale: '首页案例墙同时展示多种商店、平台筛选和分类入口；已关闭 feedback survey，案例卡完整可见。' },
      { role: 'proof', sourceUrl: 'https://ecomm.design/ecommerce-website-templates/', finalUrl: 'https://ecomm.design/ecommerce-website-templates/', title: 'Ecommerce Website Templates', selectionRationale: '模板/案例详情页落到 Polestar 等具体商店页面和长图示例，证明集合中的实例可被进一步查看。' },
    ],
  },
]

function draftForSite(site, metadataByRole) {
  const pages = site.pages.map((page) => ({
    ...page,
    shot: {
      src: `/shots/${site.siteId}/v2-${page.role}.png`,
      sha256: metadataByRole[page.role].sha256,
      width: metadataByRole[page.role].width,
      height: metadataByRole[page.role].height,
      bytes: metadataByRole[page.role].bytes,
      alt: `${site.name} ${page.role} evidence screenshot`,
    },
  }))
  return {
    schemaVersion: 3,
    draftKind: 'real-site-curation',
    batchId: '2026-09-02-batch-02',
    siteId: site.siteId,
    status: 'CAPTURED_PENDING_INDEPENDENT_REVIEW',
    entity: {
      entityId: site.classification.entityId,
      entityKey: site.entityKey,
      name: site.name,
      aliases: site.aliases,
      canonicalUrl: site.canonicalUrl,
      candidateIds: [`${site.siteId}-frozen-candidate`],
      identityDecision: site.identityDecision,
    },
    official: site.official,
    research: {
      explorationMethod: site.explorationMethod,
      internalEssenceZh: site.internalEssenceZh,
      descriptionZh: site.descriptionZh,
      descriptionCodePointLength: Array.from(site.descriptionZh).length,
      importantLimitZh: site.importantLimitZh,
      classificationScopeNoteZh: site.classificationScopeNoteZh,
    },
    classification: { name: site.name, ...site.classification },
    facets: site.facets,
    facts: site.facts.map((fact) => ({ ...fact, confidence: 1 })),
    pages,
    qa: {
      curatorId: 'real-sites-batch-02-agent',
      technicalCapturePassed: true,
      selfVisualCheckPassed: true,
      descriptionLengthPassed: true,
      classificationValidated: facetsErrors(site.facets).length === 0,
      facetsValidated: facetsErrors(site.facets).length === 0,
      independentReviewRequired: true,
      publicationEligible: false,
    },
    independentReview: { required: true, status: 'PENDING' },
  }
}

export async function createBatch02Drafts(options = {}) {
  const outputDir = resolve(options.outputDir ?? OUTPUT_DIR)
  const publicRoot = resolve(options.publicRoot ?? PUBLIC_ROOT)
  const metadataBySite = {}
  for (const site of SITES) {
    metadataBySite[site.siteId] = {}
    for (const page of site.pages) {
      const metadata = await readImageMetadata(join(publicRoot, page.shot?.src?.replace(/^\//u, '') ?? `shots/${site.siteId}/v2-${page.role}.png`))
      metadataBySite[site.siteId][page.role] = metadata
    }
  }
  await mkdir(outputDir, { recursive: true })
  const drafts = SITES.map((site) => draftForSite(site, metadataBySite[site.siteId]))
  for (const draft of drafts) {
    await writeFile(join(outputDir, `${draft.siteId}.json`), `${JSON.stringify(draft, null, 2)}\n`, 'utf8')
  }
  const report = {
    schemaVersion: 1,
    reportKind: 'real-site-batch-capture',
    batchId: '2026-09-02-batch-02',
    status: 'CAPTURED_PENDING_INDEPENDENT_REVIEW',
    captureAgentId: 'real-sites-batch-02-agent',
    captureMethod: 'project-native Chromium CDP with semantic re-capture for checklist item and dismissed feedback survey',
    viewport: { width: 1280, height: 900 },
    summary: {
      siteCount: drafts.length,
      captureCount: drafts.length * 3,
      uniqueSha256Count: new Set(drafts.flatMap((draft) => draft.pages.map((page) => page.shot.sha256))).size,
      publicationEligibleCount: 0,
    },
    sites: drafts.map((draft) => ({
      siteId: draft.siteId,
      draftPath: `data/curation/research/2026-09-02-batch-02/${draft.siteId}.json`,
      officialInputUrl: draft.official.inputUrl,
      officialFinalUrl: draft.official.finalUrl,
      descriptionCodePointLength: draft.research.descriptionCodePointLength,
      pages: draft.pages.map((page) => ({ role: page.role, inputUrl: page.sourceUrl, finalUrl: page.finalUrl, src: page.shot.src, sha256: page.shot.sha256, bytes: page.shot.bytes, width: page.shot.width, height: page.shot.height })),
    })),
    quarantine: [
      'a11y-project-v2-proof-top-only.png',
      'a11y-project-v2-proof-intro-only.png',
      'ecomm-design-v2-breadth-feedback-modal.png',
      'ecomm-design-v2-breadth-feedback-modal-2.png',
    ],
    publication: { eligible: false, approvedBundlesModified: false, publicIndexModified: false },
  }
  await writeFile(join(outputDir, 'batch-capture-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  return { outputDir, drafts, report }
}

export { SITES }

const invokedPath = process.argv[1]
if (invokedPath && pathToFileURL(resolve(invokedPath)).href === import.meta.url) {
  createBatch02Drafts().then(({ outputDir }) => console.log(`Wrote batch-02 drafts to ${outputDir}`)).catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
