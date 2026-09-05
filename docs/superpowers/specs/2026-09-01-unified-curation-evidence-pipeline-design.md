# VisLexicon 统一策展、分类、去重与逐站证据生产规格

**日期：** 2026-09-01  
**状态：** 已按用户直接执行授权批准  
**范围：** 网站策展频道、候选实体去重、投稿查重、逐站探索与发布生产线  
**后续独立范围：** Visual Atlas 500+ 收口，不与本规格混成一次迁移

> **2026-09-01 纠偏通知：** 本文的第 3、4、8、9 节中有关“7 类 / 59 小类”、类别固定分数、`agent-ai-ui` 优先线与页面布局的内容已被用户否决。分类、标签、对象层级与去分数的现行规格以 [站点实体、入口、内容单元与分类标签 v3](./2026-09-01-site-entry-taxonomy-v3-design.md) 为准；页面布局已冻结，等待用户后续方案。本文的去重、三页证据、截图 QA、独立复核与事务发布门禁仍有效。

## 1. 目标

VisLexicon 的策展频道不再存在“少量精品卡片 + 大量低标准目录”两套产品。

每个公开网站都必须满足同一份出版合同：

1. 已确认它是一个真实、独立、与设计有关的实体，而不是重复 URL、npm 噪声或目录误命中。
2. 策展 Agent 真实进入官网探索，并能用一句内部本质定义说明它是什么、为谁服务、提供什么。
3. 有恰好三张互补、有效、有来源 URL 的关键截图。
4. 有 60–120 字中文人话简介，说明用途、内容/交付物、适用对象和重要限制；不得重复标签凑字数。
5. 一级分类、小分类、权重、作者/组织、源码、许可、价格等事实均有证据或明确写为未知。
6. 经过机器技术 QA 和独立 Agent 语义 QA；边界项再经过编辑 QA。

`site-catalog.json` 当前 8,684 条只叫“候选观察”，不叫“网站数量”，也不直接进入公开前端。

## 2. 产品原则

- **统一外观，分层排序。** 灵感站、组件库、工具和知识库使用同一套卡片与详情结构；价值差异体现在明确分类和客观权重，不体现在低配 UI。
- **先过发布门，再谈权重。** 截图完整不等于合格；高分不能绕过真实探索、去重或证据门槛。
- **实体不是 URL。** 官网、文档、源码仓库、商店页、旧域名和镜像可以属于同一实体。
- **来源不是分类。** Toools、npm、SaaS Landing Page 只说明从哪里发现，不说明网站本身是什么。
- **机器负责预采集，Agent 负责判断。** 关键词只能推荐深页、分类和标签，不能直接发布。
- **错误属于一次 attempt，不属于网站。** 浏览器崩溃、网络错误或机器人墙不得永久把官网标成失效。
- **过程可见但不伪造完成度。** 左侧进度竖轴展示真实小分类状态和已批准数量；没有证据的候选不显示成完成卡片。

## 3. 分类体系

每个实体只有一个 `resourceEssence`。技术、媒介、交付物、动作、提供者角色和访问限制使用正交标签。

### 3.1 七个公开主类

| Code | 主类 | 决定性判断 | 基础权重带 |
|---|---|---|---:|
| `reusable-implementation` | 可复用实现 | 可复制、安装或取得可集成的组件、代码、模板、区块或规范实现 | 80–100 |
| `reusable-asset` | 可复用素材 | 可下载或导出可用于项目的视觉/声音/三维素材 | 80–100 |
| `knowledge-vocabulary` | 专业知识与命名 | 核心价值是定义、解释、规范、方法、教程或专业术语 | 80–100 |
| `operational-tool` | 可操作工具 | 用户在站内创建、编辑、测试、研究、协作或交付 | 60–79 |
| `resource-aggregator` | 资源聚合与导航 | 核心产品是索引、筛选和导向其他网站、库或资源 | 45–64 |
| `inspiration-collection` | 灵感与案例 | 核心产品是托管并浏览多个截图、流程、案例或作品 | 35–59 |
| `showcase-commercial` | 单站展示与商业官网 | 该网站自身是主要案例，核心是展示一个产品、品牌、机构或个人 | 10–34 |

内部还有 `out-of-scope`，用于无设计价值、身份错误、死链、薄 npm 包和明显误命中；它永不公开。

### 3.2 小分类

#### 可复用实现

- `ui-components-general`：综合 Web UI 组件库
- `agent-ai-ui`：Agent / AI / 对话 / 工具调用 / 推理界面组件
- `design-system-primitives`：设计系统、无样式原语、可访问性原语、tokens
- `application-dashboard-ui`：应用壳、后台、表格、图表和数据密集组件
- `marketing-sections`：落地页区块、营销组件和页面片段
- `motion-interaction-code`：动效、微交互和动画实现
- `data-visualization-code`：图表、可视化和数据叙事实现
- `three-d-webgl-code`：3D、WebGL、shader 与空间界面实现
- `mobile-native-ui`：iOS、Android、React Native、Flutter 等移动组件
- `email-editorial-ui`：邮件、编辑器、文档和富文本组件
- `templates-starters`：项目模板、页面模板、starter 和可复制完整界面

#### 可复用素材

- `icons-symbols`：图标、符号和 pictogram 库
- `fonts-typefaces`：字体、字族和可用排版资源
- `illustrations-vectors`：插画、SVG、矢量与剪贴画
- `photos-images`：摄影、图片和纹理素材
- `video-motion-assets`：视频、Lottie、动效素材
- `audio-sound`：音效、音乐和 UI 声音
- `three-d-assets`：模型、材质、HDRI 与 3D 场景
- `mockups`：设备、包装、品牌和产品样机
- `ui-kits-design-files`：Figma/Sketch/UI kit 和设计源文件
- `patterns-backgrounds`：背景、pattern、gradient 和生成纹理

#### 专业知识与命名

- `terminology-vocabulary`：术语、别名、命名和跨媒介词汇
- `ui-patterns-anatomy`：组件模式、结构、anatomy 与交互模式
- `design-system-guidance`：设计系统方法、规范和治理
- `accessibility-standards`：无障碍标准、清单和实现指导
- `ux-research-methods`：UX 研究、测试与服务设计方法
- `tutorials-courses`：课程、教程和逐步实践
- `books-articles-newsletters`：书籍、博客、杂志和 newsletter
- `podcasts-talks`：播客、演讲和访谈

#### 可操作工具

- `ui-design-prototyping`：界面设计、原型和白板
- `ai-design-generation`：AI 图像、视频、界面和品牌生成
- `no-code-site-builder`：无代码、低代码和网站构建
- `design-to-code-handoff`：设计转代码、handoff、检查和开发协作
- `image-video-editing`：图像、视频、动效和声音编辑
- `ux-research-testing`：研究招募、测试、分析和反馈工具
- `accessibility-audit`：无障碍检查、模拟和修复工具
- `color-typography-tool`：配色、对比、字体配对和排版工具
- `asset-optimization`：压缩、转换、清理和格式优化
- `collaboration-workflow`：设计协作、项目、评审和版本管理
- `presentation-storytelling`：演示、数据叙事和发布工具

#### 资源聚合与导航

- `design-resource-directory`：综合设计资源导航
- `component-library-index`：组件库、设计系统和 registry 索引
- `tool-directory`：设计/AI/开发工具目录
- `asset-directory`：字体、图标、图片、3D 等素材目录
- `awesome-repository-list`：awesome list、仓库和包索引
- `learning-resource-index`：教程、课程、书籍和知识来源导航

#### 灵感与案例

- `website-gallery`：网站、落地页和网页案例
- `ui-screen-flow-gallery`：界面截图、用户流程和产品模式
- `brand-logo-gallery`：品牌、Logo、包装和视觉识别
- `motion-interaction-gallery`：品牌动效、交互和 motion 案例
- `editorial-poster-gallery`：编辑、海报、排版与出版案例
- `portfolio-collection`：多人/多工作室作品集合
- `three-d-spatial-gallery`：3D、空间、装置和沉浸案例

#### 单站展示与商业官网

- `product-saas-marketing`：产品与 SaaS 营销站
- `agency-studio`：代理机构与设计工作室官网
- `individual-portfolio`：个人作品集
- `brand-campaign`：品牌、活动和 campaign 官网
- `experimental-microsite`：实验性、叙事性和创意微站
- `commerce-retail`：零售、电商和消费品牌展示

### 3.3 歧义规则

1. 能直接复制、安装或下载时，优先进入可复用实现/素材，而不是因画廊外观进入灵感。
2. 主要动作是创建、编辑、测试或协作时进入工具，即使它因精美落地页被目录发现。
3. 导向外部资源是聚合；自己托管案例图片/流程是灵感集合。
4. 术语、模式、规范或教程是主要价值时进入知识，而不是组件或灵感。
5. 单一产品、品牌、机构、作品集和 campaign 进入商业展示。
6. 同域多路径只有在交付物和主要动作独立、且能分别完成三图核验时才拆成子实体。
7. 同名永不自动合并；同公司也不等于同产品。

## 4. 权重

```text
score = clampToEssenceBand(base(resourceEssence) + modifiers)
```

基础分：可复用实现 90、可复用素材 88、专业知识与命名 88、工具 70、聚合 54、灵感 48、商业展示 22。

客观调整：

- `+4` 两步内可复制、安装、下载或开始使用
- `+4` 有结构化定义、API、教程步骤或术语对照
- `+3` 许可清楚
- `+3` 有稳定、可检索的内容索引
- `+2` 近 12 个月有一手维护证据
- `+2` 核心内容无需登录
- `+4 / 0 / -8` 主要面向设计工作 / 邻接工作 / 普通商业用途
- `-3` 核心内容被登录或付费墙阻断
- `-4` 宣称可复用但许可不清
- `-5` 薄包装、单个微型包或无独立文档

不因“高级感”、奖项、品牌知名度、流量或动画数量加分。

## 5. 实体、观察和持续去重

### 5.1 核心对象

- `Entity`：稳定 `entityId`、实体类型、规范名称、名称别名、状态、主 URL、父子关系和 revision。
- `UrlAlias`：官网、文档、仓库、包、商店页、旧域、镜像、联盟入口等 URL 表现。
- `SourceObservation`：每次目录发现、用户投稿或 collector 命中的不可变原始记录。
- `RedirectObservation`：完整跳转链和核验时间；只追加，不覆盖。
- `Fingerprint`：平台稳定 ID、repo identity、package name、final URL、弱内容指纹等。
- `DedupDecision`：merge、keep-distinct、split、undo 的理由、信号、算法版本和审计人。
- `EvidenceTask`：实体级任务、租约、版本和证据缺口。

`entityId` 不由名称或 URL 哈希生成；换官网或重品牌不改变 ID。

### 5.2 去重优先级

1. 未撤销的人工 merge/split 决策。
2. 稳定平台 ID 相同。
3. 已确认旧域跳转新域或最终 URL 相同。
4. 完全相同的 identity URL。
5. 官网与仓库一手互链、官方 `sameAs`、仓库 homepage 回链。
6. 同注册域 + 名称/描述相符只进入复核，不自动合并。
7. 同名、同描述、logo、截图 pHash 和 embedding 只作弱信号。

合并不删除 loser：旧 ID、别名和证据保留 tombstone 并解析到 winner。拆分和撤销使用补偿事件。

### 5.3 全流程去重卡点

- 发现时：先写 observation，再规范化；不得在 collector 内静默丢数据。
- 入候选池：扫描 candidate、published、retired alias 和 merge tombstone。
- Agent 领取前：按 `entityKey + revision` 建唯一租约。
- 证据提交时：乐观并发重检；已合并则证据归入 winner。
- 发布前：全局重检；疑似重复、联盟链接未解析或身份不清时阻断。
- 投稿时：使用同一 resolver；重复投稿转为“补充证据”。
- 发布后：持续监测换域、重品牌与失效，但只追加历史。

## 6. 用户投稿查重

提交 URL 后返回一种明确状态：

- `已收录`：打开正式实体，允许补证据或报告更新。
- `候选中`：显示候选状态和证据缺口，允许补证据。
- `已知别名`：说明它是某实体的官网/仓库/旧地址/商店页。
- `疑似重复`：列出不超过三个候选和匹配原因，允许选择同一项或说明不同。
- `新链接`：建立 observation 和候选。
- `暂无法核验`：进入隔离，不宣称已收录。

在没有后端前，前端只做 resolver 预检和本地草稿，不能伪称已进入审核队列。

## 7. 逐站 Agent 证据生产线

### 7.1 状态机

```text
DISCOVERED → DEDUPED → READY → CLAIMED → PREFETCHED → EXPLORING
→ PAGES_SELECTED → CAPTURED → SELF_CHECKED → QA_TECH → QA_SEMANTIC
→ QA_EDITORIAL → APPROVED → PUBLISH_STAGED → PUBLISHED
```

分支：`RETRY_WAIT`、`BLOCKED_ROBOT`、`BLOCKED_AUTH`、`REJECTED_CAPTURE`、`REJECTED_SEMANTIC`、`AMBIGUOUS_IDENTITY`、`DUPLICATE_MERGED`、`SUPERSEDED`、`DEAD_CONFIRMED`。

`attempt.status` 与 `site.availability` 分离。只有两个独立时间和访问通道均失败才能写 `DEAD_CONFIRMED`。

### 7.2 每站步骤

1. 领取前实体去重与租约。
2. 机器预采集 HTML、meta、结构化数据、导航、重定向、候选深页和媒体信号。
3. Agent 真实浏览官网并写内部“站点本质句”。
4. Agent 选择三种互补页面角色：
   - `identity`：首页或真实产品入口。
   - `breadth`：目录、能力总览、集合或工作流。
   - `proof`：代表组件、资产、案例、教程或操作详情。
5. 等待语义和渲染就绪后截图，记录 viewport、滚动、交互和 readiness signals。
6. 逐字段记录作者、组织、源码、许可、价格和维护证据。
7. Agent 写 60–120 字中文简介并定分类/权重初稿。
8. 自检后提交不可变 attempt bundle，不能直接改公开索引。
9. 独立 QA 后由单一发布器原子发布。

推荐批次：机器预采集 50 站；策展 Agent 普通站 4 站/租约、重交互站 2 站/租约；语义复审 8 站；每 25 个批准实体组成一个 revision。

### 7.3 QA

**机器技术 QA：**

- 恰好三张可解码图片，尺寸和比例正确。
- SHA-256、pHash、SSIM 去重。
- 亮度方差、熵、边缘密度检测空白/纯黑/骨架屏。
- OCR/DOM 检测 404、Access denied、Just a moment、浏览器错误页和登录墙。
- 三张角色不同、页面稳定且关键内容已加载。
- source/final URL、重定向与站外关联理由完整。

**独立 Agent 语义 QA：**

- 重新进入来源页，核验本质、两条深页、截图关键位置、简介事实和分类。
- 作者、GitHub、许可分别有正确官方证据。
- 不把仓库 MIT 许可扩展成站内图片/字体均可再分发。

**编辑 QA：**

- 精选、高权重、许可不清和边界分类 100% 复审；普通项抽样 15%。
- 统一描述语气、权重、卡片裁切效果与跨站重复检查。

现有自动富化的 185 个三图条目全部进入 `QUARANTINED_LEGACY`，不得继承发布资格。

## 8. 前端信息架构

### 8.1 单一页面与单一卡片

移除 `CURATED_SITES` 顶部板和 `SiteCatalog` 低配目录的分裂。页面只渲染 approved/public index：

- 统一搜索。
- 主类筛选与小类筛选。
- 统一三图卡片。
- 统一详情浮窗。
- 权重影响默认顺序；灵感和商业展示仍可搜索、筛选和直接访问。
- 候选池和失败 attempt 不作为卡片渲染。

卡片只接收 `approvedTrio`，不允许首字母、空白图或一图/二图补位。

### 8.2 左侧进度竖轴

桌面端在内容左侧放一条窄、无面板背景的 sticky 竖轴，而不是导航侧栏：

- 1px 主线、每个小类一个节点。
- 节点状态：未开始、预采集中、真实探索中、QA 中、已完成。
- 显示小类名称与 `已批准 / 实体候选`；当前实施小类强调显示。
- 点击节点可过滤到该小类，但视觉上仍是进度轴，不扩成抽屉或树形栏。
- 主类切换后竖轴只展示该主类的小类。
- 移动端转换成顶部横向进度条，避免占窄屏左侧。

进度来自实体任务和 approved bundles 统计，不手写宣传数字。

### 8.3 发布与缓存

- 公开索引使用 revision 文件：`site-catalog-index.<revision>.json`。
- 小型 manifest 最后原子更新，前端先以 `no-store` 读取 manifest，再读取 immutable revision。
- 禁止继续对固定同名索引使用 `force-cache`，避免旧 3,229 条长期滞留。

## 9. 迁移顺序

1. 固化 taxonomy、实体/观察/alias/decision/evidence task 合同和测试。
2. 修复 URL/Git 规范化、稳定实体 ID 和 observation 计数守恒。
3. 建 approved evidence bundle validator、QA gate 和 revision publisher。
4. 把现有 6 个已人工核验站转换为新合同；旧 185 条三图隔离。
5. 用单一 Unified Curation 页面替换双层 UI，并加入进度竖轴。
6. 接入投稿 resolver 的薄 alias 索引和诚实状态。
7. 以 `agent-ai-ui` 为第一小类运行真实探索 swarm，完成一个 revision 后再进入下一个小类。
8. 后续按权重和分类推进：综合组件 → 设计系统原语 → 图标 → 字体 → 专业命名/模式 → 工具 → 聚合 → 灵感 → 商业展示。

## 10. 验收

- 公开页面不存在精选/目录双层结构。
- 每张公开卡片有同一 schema、恰好三张已批准图和完整详情。
- 任何候选、空白图、重复图、错误页、模板简介或未复审分类均无法进入公开索引。
- 去重测试覆盖查询参数、Git URL、大小写仓库、官网/仓库、旧域、新域、同名异站、monorepo、商店 listing、merge/split/undo 和并发提交。
- 投稿 resolver 覆盖六种状态，重复提交只补证据。
- 进度竖轴由真实任务状态生成，能看到当前实施到哪个小类。
- manifest/revision 发布不会读取旧固定索引缓存。
- 1280px 与 390px 浏览器截图通过视觉和交互验收。
- 全量 tests、lint、build 通过后才声称阶段完成。

## 11. 非目标

- 本规格不把 8,684 条全部自动标成已完成。
- 不保留 npm 数量作为产品 KPI。
- 不自动搬运受版权或付费限制的站内素材。
- 不把一次网络失败写成死站。
- 不在本阶段同时重做 Visual Atlas；Atlas 的 500+ 数据收口使用独立规格和计划。
