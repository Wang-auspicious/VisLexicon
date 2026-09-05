# VisLexicon 站点实体、入口、内容单元与分类标签 v3 规格

**日期：** 2026-09-01  
**状态：** 用户已明确授权直接重新规划并实施  
**范围：** 底层对象、分类、标签、去重、审核与发布门禁  
**冻结范围：** 页面布局与视觉展示不在本规格内

> **2026-09-02 评审对齐说明：** 独立设计评审指出，分类树不应成为前台产品的核心体验，且 8,684 条候选不能被当作公开成果。本规格中的 13 个一级类 / 57 个小类因此只承担后台证据校验、覆盖审计、去重与可解释的二级筛选职责；它们不是公开导航、全局排序或规模承诺。公开 revision 只投影通过证据门的少量 Site Entry，任务路线与编辑判断另行承载。

## 1. 这次重做要解决什么

旧“7 个资源本质 / 59 个小类”不是名字难听，而是建模对象和维度混在了一起：

- 把整个公司、一个站内入口、一个具体模板当成同一层。
- 把 AI、Agent、React、移动端、电商、招聘等场景或技术写进互斥分类。
- 把“这是什么”与“它永久有多大价值”绑定，给组件站 90 分、单站官网 22 分。
- 把来源目录的标签当成目的站事实，导致 npm 测试库被分成字体、图标、动效或图表。
- 没有证据时仍用 `Others` 或套话伪造确定答案。

本规格使用两轮独立审查作为输入：320 条分层候选、30+ 官方入口、92 个边界反例。结论是：分类必须保留，但必须先统一被分类的对象。

## 2. 领域对象

### 2.1 `SourceEntity` 来源实体

回答“这是谁或哪个稳定项目”。例如 Figma、Adobe、Lucide、21st.dev。

必备字段：

```js
{
  entityId,
  canonicalName,
  nameAliases,
  primaryUrl,
  urlAliases,
  providerType,
  status,
  revision
}
```

**实体不携带唯一主分类。** Figma 同时有设计工具、Community、Make 等独立入口，把整个 Figma 压成“工具”会丢失真实结构。

### 2.2 `SiteEntry` 站内入口

回答“用户进入这个具体 URL，主要能完成什么”。这是站点策展的默认分类对象。

```js
{
  entryId,
  entityId,
  canonicalUrl,
  entryRole,
  classification,
  facets,
  evidenceStatus,
  revision
}
```

同一实体可以有多个入口，但不能因为“功能很多”就复制同一 URL 制造多张卡。拆入口必须同时满足：

1. URL 或稳定入口身份不同。
2. 主要动作或交付物不同。
3. 能分别完成身份、范围、实例三页证据。

`entityId` 与 `entryId` 属于不同身份命名空间，不得在迁移中为省事强制设为同一值。即使一个实体当前只有一个入口，也必须保留未来拆分兄弟入口的可能。

### 2.3 `ContentUnit` 内容单元

回答“这一个具体组件、模板、图标包、文章或案例是什么”。

```js
{
  unitId,
  entryId,
  entityId,
  canonicalUrl,
  classification,
  facets,
  evidenceStatus,
  revision
}
```

内容单元按自己的交付物分类，不继承容器站的类别。Creative Market 首页是市场，其中一个演示模板是模板；Dribbble 首页是社区，`/shots/popular` 入口是案例集合。

### 2.4 不可变的过程对象

- `SourceObservation`：目录采集、用户提交、仓库或包观测的原始记录；先记录，再去重。
- `RedirectObservation`：输入 URL、完整跳转链、最终 URL、时间与通道。
- `DedupDecision`：`merge / keep-distinct / split / undo`、证据、决策人与算法版本。
- `EvidenceAttempt`：每次真实浏览、三页选择、截图、编辑与 QA 的完整快照。

## 3. 一级分类与小类

一级分类回答具体入口或内容单元的主要交付物 / 主要动作。它不回答技术、场景、平台、价格或质量。

小类数量由真实边界决定，不追求形式对称。本版自然得到 13 个一级类、57 个小类，数量分布为 `4/4/4/7/5/4/4/4/4/5/5/3/4`。

### 3.1 `ui-implementation` 组件与设计系统

- `design-system-suites` 设计系统与完整组件套件
- `headless-accessible-primitives` 无样式、无障碍原语
- `general-ui-components` 通用界面组件库
- `page-blocks-embeddable-controls` 页面区块与可嵌入复合控件

### 3.2 `visual-implementation` 动效、3D 与数据可视化实现

- `motion-interaction-code` 动效与微交互代码
- `data-visualization-code` 图表与数据可视化代码
- `three-d-spatial-code` 3D、WebGL 与空间实现
- `creative-generative-code` 创意编程与生成式视觉代码

### 3.3 `templates-design-files` 模板与设计文件

- `site-app-starters` 网站、应用模板与项目启动器
- `ui-kits-design-files` UI Kit 与设计源文件
- `presentation-editorial-templates` 演示、编辑与出版模板
- `mockup-brand-showcase-templates` 样机、品牌与展示模板

### 3.4 `visual-assets` 图标、字体与视觉素材

- `icons-symbols` 图标与符号
- `fonts-typefaces` 字体与字族
- `illustrations-vectors` 插画与矢量素材
- `photos-images-textures` 摄影、位图与纹理
- `video-motion-assets` 视频、Lottie 与动效素材
- `audio-sound-assets` 音乐与音效
- `three-d-models-materials` 3D 模型与材质

### 3.5 `creation-tools` 设计与内容创作工具

- `ui-prototyping-whiteboard` UI/UX 设计、原型与白板
- `image-vector-layout-creation` 图像、矢量与版式创作
- `video-motion-audio-creation` 视频、动效与音频创作
- `three-d-spatial-creation` 3D 与空间创作
- `brand-presentation-content-creation` 品牌、演示与内容生成

### 3.6 `delivery-development-tools` 建站、交付与开发工具

- `site-app-builders` 网站与应用构建器
- `design-to-code-handoff` 设计转代码、交付与开发协作
- `build-deploy-dev-workflow` 构建、部署与开发工流
- `asset-conversion-optimization` 素材转换、压缩与优化

### 3.7 `research-quality-tools` 研究、测试与无障碍工具

- `research-recruiting-interviews` 研究、招募与访谈
- `usability-testing-experimentation` 可用性测试与实验
- `behavior-analytics-feedback` 行为分析与反馈
- `accessibility-audit-remediation` 无障碍审计、模拟与修复

### 3.8 `reference-standards` 规范、术语与参考

- `terminology-glossaries` 术语与词汇表
- `ui-patterns-anatomy` 界面模式与结构解剖
- `standards-guidelines-checklists` 标准、规范与检查清单
- `design-system-governance-methods` 设计系统治理与方法参考

### 3.9 `learning-editorial` 教程、课程与行业内容

- `tutorials-courses-workshops` 教程、课程与工作坊
- `articles-books-publications` 书籍、文章、博客、杂志与通讯
- `podcasts-talks-video` 播客、演讲与视频
- `news-trends-industry-intelligence` 新闻、趋势与行业情报

### 3.10 `case-inspiration-collections` 案例与灵感集合

- `website-landing-page-cases` 网站与落地页案例
- `product-ui-screen-flow-cases` 产品界面、截图与流程
- `brand-packaging-editorial-cases` 品牌、包装、编辑与海报案例
- `motion-three-d-spatial-cases` 动效、3D 与空间案例
- `multi-author-portfolios-curations` 多作者作品集与精选集合

### 3.11 `directories-indexes` 资源目录与索引

- `general-resource-directories` 综合资源导航
- `component-package-indexes` 组件、软件包与实现索引
- `tool-service-directories` 工具与服务目录
- `asset-directories` 素材目录
- `learning-content-indexes` 学习与内容索引

### 3.12 `community-marketplaces` 社区、人才与市场平台

- `communities-professional-networks` 社区与专业网络
- `asset-template-service-markets` 素材、模板与服务市场
- `talent-jobs-collaboration-markets` 招聘、人才与合作撮合

### 3.13 `single-site-showcase` 单站案例与作品展示

- `product-company-sites` 产品与公司官网
- `agency-studio-sites` 代理机构与工作室官网
- `individual-portfolios` 个人作品集
- `campaign-editorial-experimental-sites` 品牌活动、编辑叙事与实验微站

第 13 类不表示“只要有官网就收”，而表示“该站点本身就是被研究的视觉样本”。它是最后判定，必须有三页截图、人工说明它值得作为样本的原因，且确认与设计任务相关。普通 SaaS 不能因为来自 Landing Page 目录就自动进入。

## 4. 正交标签轴

分类只给稳定浏览和统计提供一个主轴；用户真正的约束使用多值标签表达。

```js
facets: {
  scenarios: [],
  deliverables: [],
  actions: [],
  media: [],
  platforms: [],
  technologies: [],
  workflowStages: [],
  audiences: [],
  access: [],
  licenses: [],
  contentOrganization: [],
  languages: []
}
```

### 4.1 各轴职责

- `scenarios`：AI、Agent、SaaS、电商、招聘、营销、后台、金融、教育、游戏等使用场景。
- `deliverables`：组件、原语、区块、完整页面、模板、设计文件、图标、字体、图片、模型、规范、案例截图等。
- `actions`：浏览、搜索、比较、复制、安装、下载、生成、编辑、原型、测试、审计、学习、导出、发布、投稿、购买、雇佣、申请等。
- `media`：UI、图标、字体、图片、视频、音频、3D、数据可视化。
- `platforms`：Web、iOS、Android、桌面端、浏览器扩展、Figma、Framer、Webflow、CLI、API、MCP。
- `technologies`：React、Vue、Svelte、Angular、Tailwind、CSS、JavaScript、WebGL、Lottie 等。
- `workflowStages`：发现、构思、设计、构建、测试、交付、发布。
- `audiences`：设计师、开发者、研究员、内容创作者、品牌团队等。
- `access`：免费、freemium、付费、试用、需登录、邀请制、开源、源码可见但受限（source-available）、闭源。带 Commons Clause、不得竞争 / 转售等额外限制的仓库不得标为开源。
- `licenses`：SPDX ID 或受控状态；找不到必须是 `unknown`，不得猜。
- `contentOrganization`：单一作品、组件注册表、素材库、案例图库、流程库、规范文档、课程、编辑流、外链目录、社区 feed、市场、奖项评选。
- `languages`：内容语言，不是编程语言。

标签必须来自受控字典，经 Unicode 和大小写规范化后去重。新标签进入字典评审，不得由不同 Agent 自由造出同义词。

### 4.2 明确禁止的维度混用

- `AI` 和 `Agent` 只能是 `scenarios` 或有证据的能力标签，不能是类别。
- React、Vue、Tailwind 只能是 `technologies`。
- Chrome、Firefox 扩展只能是 `platforms`。
- 电商、营销、后台、移动端只能是场景、媒介或平台标签。“招聘”对 Kimi 招聘官网等内容站是场景标签；只有用户在该入口的主要动作就是发布职位、求职、雇佣或合作撮合时，才允许进 `talent-jobs-collaboration-markets`。
- 无障碍审计 / 修复是主要动作时归第 7 类；普通组件“支持无障碍”时只加标签。

## 5. 分类记录与发布门禁

```js
classification: {
  recordLevel: 'entry',
  primaryCategory: 'ui-implementation',
  subcategory: 'general-ui-components',
  status: 'confirmed',
  alternatives: [],
  reasons: [
    {
      statement: '内容单元是可预览并复制的界面组件',
      evidenceUrl: 'https://example.com/components'
    }
  ],
  curatorId: 'curator-a',
  reviewerId: 'reviewer-b',
  confirmedAt: '2026-09-01T00:00:00.000Z'
}
```

`status` 只能是：

- `confirmed`：对象层级、主类、小类和理由都被独立复核。
- `needs-review`：身份、入口粒度或主要动作仍存在歧义。
- `excluded`：与设计无关、噪声包、死链、身份错误或单站样本价值不成立。

不使用 0–1 的伪精确置信度替代复核。发布必须同时满足：

1. `recordLevel` 为 `entry` 或 `unit`，不是 `entity`。
2. `status === 'confirmed'`。
3. 主类与小类合法且只有一个主类。
4. `alternatives` 为空。
5. 至少一条具有直接证据 URL 的分类理由。
6. `curatorId !== reviewerId`。
7. 三页证据、真实简介、链接、权利与截图 QA 门禁同时通过。

`needs-review` 和 `excluded` 不得进入 public index，也不得靠“次要分类”掩盖没有做出决定。

## 6. 判定顺序

1. **先定对象层级。** 这是来源实体、站内入口，还是具体内容单元？
2. **写一个动词句。** 用户进入这里，最直接能复制、下载、创作、构建、测试、查阅、学习、看案例、继续导航、参与交易，还是研究站点本身？
3. **看反复出现的内容单元。** 是组件、模板、素材、工具任务、规范、文章、案例、外链、作者商品，还是单一品牌叙事？
4. **具体交付物优先于容器。** 单个图标包不按它所在市场分类；单个模板不按它所在社区分类。
5. **可取得交付物。** 界面代码进 1，纯动效 / 数据 / 3D 实现进 2，可编辑完整起点进 3，原子素材进 4。
6. **执行工作。** 创作进 5，构建 / 交付 / 开发进 6，研究 / 评估 / 质量进 7。
7. **消费信息。** 定点查答案 / 标准进 8，系统学习 / 持续阅读或收听进 9。
8. **聚合平台。** 看站内案例进 10，找外部目的地进 11，参与 / 交易 / 招聘进 12。
9. **单站样本是最后判定。** 前面都不适用，且三页人工证据确认站点本身有可研究的视觉 / 叙事价值时才进 13。
10. **不确定就停。** 进 `needs-review`，禁止创建 `other`。

## 7. 必须能区分的边界

- 组件文档包含教程，不因此进学习类。
- 图标库有 React/Vue 包装，主价值仍是图标素材。
- 颜色生成器是创作工具，不是颜色素材。
- 样机生成器是创作工具；可下载 PSD/Figma 样机才是模板。
- “社区驱动”不等于社区类；账户、互动、发布、交易或撮合是主要动作时才进 12。
- gallery / directory / community 分别由“看站内案例 / 找外链 / 参与交易”判定。
- Refero Styles 是有站内深度分析证据的案例集合，不是纯外链目录。
- Toools.design 的内容单元是外部目的站，因此是目录索引。
- 21st.dev 能在站内预览并安装组件，因此主类是组件实现，社区结构是次要组织标签。
- Figma Design 是创作工具，Figma Community 是社区 / 市场，具体 Figma UI Kit 是模板或设计文件。
- Laws of UX 站点入口是规范参考，同名书籍单元是学习内容。
- `@testing-library/react`、`user-event`、Playwright testing library 必须进研究 / 测试与质量类，不得因关键词进字体、图标、图表或动效。
- D3 / chart 包不得因 `color` 或 `theme` 关键词进颜色工具。
- SaaS Landing Page 来源不得自动推出案例类或单站类。
- `Visit Website` 不是合法的最终名称。

## 8. 分类与质量 / 排序分离

删除类别中的 `baseScore / minScore / maxScore`，删除“组件站天生 90 分、单站天生 22 分”。

底层只保存可相对稳定的质量事实：

```js
quality: {
  identityVerified,
  sourceLinkHealthy,
  evidenceCompleteness,
  screenshotQaPassed,
  descriptionQaPassed,
  rightsStatus,
  verifiedAt
}
```

“对当前任务是否有用”不存成全局分数。Kimi 招聘官网对“安装 Agent 组件”不相关，对“做有品牌感的招聘页”可能是核心案例。任务相关性必须在查询时由当前意图、分类、标签和证据动态计算。

## 9. 去重与上传标准

### 9.1 自动合并只允许强信号

1. 未撤销的人工 merge/split/undo 决策。
2. 稳定平台 ID、包名或仓库身份相同。
3. 已证实的旧域跳转新域或最终 URL 相同。
4. 完全相同的规范 identity URL。
5. 官网与仓库的一手双向关联。

同域不同路径、同名、同描述、Logo、截图、embedding 只能建立待审核冲突簇，不得自动合并。

### 9.2 去重检查点

- 采集时先保存 observation，再规范化，不在 collector 内静默丢数据。
- collector 必须满足两组计数守恒：`returned raw hits = immutable observations`；`request attempts = successful requests + explicit request failures`。请求失败不能伪造成一条未知 hit，但必须作为独立 failure 保留。内存 `Map` 或按包名 / URL 去重只能发生在 observation 落盘之后。
- 历史目录当前只能从已聚合文件中恢复约 9,029 条来源 observation；早期报告的 14,843 次原始查询命中有一部分已在旧 collector 内先被折叠，必须标为历史 provenance debt，不得声称已完整恢复。
- 进候选池时同时检查 candidate、approved、retired aliases 和 merge tombstones。
- Agent 领取前按 `entityId + entryId + revision` 建唯一租约。
- 证据提交时重做去重，已合并的证据归入 winner。
- 发布前全局重检，疑似重复、联盟链接未解析或身份不清时阻断。
- 用户上传使用同一 resolver；已知实体的新提交转成“补充证据”，不新建重复站。
- 合并不删 loser；旧 ID、别名、观测和审计链保留 tombstone。

### 9.3 提交返回状态

- `published`：已正式收录，新提交只补证据。
- `candidate`：已在生产队列。
- `known-alias`：是已知实体的官网、仓库、旧域或商店页。
- `suspected-duplicate`：列出不超过三个候选及原因，不自动合并。
- `new-link`：建 observation 和候选。
- `unverifiable`：无法安全规范，进 quarantine。

## 10. 现有 6 个已审核站的 v3 迁移映射

这 6 个条目都是入口级对象，不再使用 `reusable-implementation`、不再携带类别分数，也没有 `agent-ai-ui` 特权分支。

| 条目 | 主类 | 小类 | 说明 |
|---|---|---|---|
| Magic UI | `ui-implementation` | `page-blocks-embeddable-controls` | 内容单元是可复制的界面组件 / 区块，动效是媒介与技术标签 |
| Coss UI | `ui-implementation` | `general-ui-components` | 大量可筛选界面 particles 与组件 |
| Hover.dev | `ui-implementation` | `page-blocks-embeddable-controls` | 主单元仍是可复制组件 / 区块，动效与 3D 为标签 |
| shadcn/ui | `ui-implementation` | `design-system-suites` | 可安装、自主修改的组件套件与 registry |
| Uiverse | `ui-implementation` | `general-ui-components` | 主动作是预览并复制 UI 源码，社区是内容组织标签 |
| 21st.dev | `ui-implementation` | `general-ui-components` | 站内预览并安装组件，不是纯外链目录 |

迁移后当前实施类不能被预设为 Agent/AI。生产队列从已去重且证据缺口清晰的入口中生成，实际领取到哪个小类才显示哪个小类。

## 11. 代码合同

新模块应暴露：

```js
CURATION_CATEGORIES
CURATION_SUBCATEGORIES
CURATION_FACET_AXES
classificationErrors(record)
facetsErrors(facets)
isPublishableClassification(record)
canonicalizeFacets(facets)
```

必须满足的不变量：

1. 主类 ID / label 唯一、顺序稳定。
2. 小类 ID 全局唯一且只属于一个主类。
3. 不断言每类小类数相同。
4. 主类 / 小类不得出现 AI、Agent、React、Vue、移动端、电商等场景或技术分支；人才 / 职位市场是“参与与撮合”的平台子类，不得被扩大成普通招聘网页类别。
5. 类别不得携带 `baseScore / minScore / maxScore`。
6. `entity` 不能携带唯一主类；已发布 `entry / unit` 必须恰有一个。
7. `entry` 必须指向合法 entity，`unit` 必须指向合法 entry。
8. `entityId` 与 `entryId` 使用独立命名空间，迁移不得强制两者相等。
9. 未知主类、未知小类、父子错配必须返回稳定错误。
10. 分类和标签函数不修改输入。
11. registry 深冻结。
12. 标签在 Unicode / 大小写规范化后去重。
13. `needs-review / excluded` 不可发布。
14. 单站类缺三页证据或人工理由时不可发布。
15. 生成器不得被当成它生成的素材 / 模板。
16. 图标的技术封装仍归图标素材。
17. gallery / directory / community 的主动作必须可区分。
18. 无障碍特性不能把普通组件升为无障碍工具。
19. 来源类别、套话简介和机器翻译不能单独确定主类。
20. `Visit Website` 不能作为发布名称。
21. public index 的分类、小类和标签必须从已审核 bundle 投影，不信任已有统计缓存。

## 12. 实施顺序

1. 先用本规格替换旧 7/59 registry 和引导性分数测试。
2. 建立 `entity -> entry -> unit` 关系验证和受控标签验证。
3. 将证据 bundle 升级为 v3：分类挂在 entry，删除类别分数，保留质量事实。
4. 按第 10 节迁移 6 个已批准条目，不放宽三图、独立复核或事务发布门禁。
5. 生成去重生产队列；旧 185 个三图候选保持 `QUARANTINED_LEGACY`。
6. 用 92 个边界回归样本压测，再审 npm 100、SaaS 100、147 个多类冲突、92 个样机和 60 个扩展。
7. 只有经过真实浏览、三页截图、人话简介和独立复核的条目才增加 approved 数。

## 13. 非目标

- 不在本规格里决定左侧竖轴、卡片、首页或详情页如何布局。
- 不将 8,684 条一次性机器改类并宣称完成。
- 不用一次网络失败判定死站。
- 不把“分类完整”当成“已经理解每个站”。
- 不设 Agent/AI 专属推进线，也不给用户刚举的例子预留特权位置。
