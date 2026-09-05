# VisLexicon 分流深挖流水线与自动化阈值 v1 规格

**日期：** 2026-09-02
**状态：** 用户已明确授权「阈值由实施方自行分析并落实，不再逐项确认」
**范围：** 开发者侧的 8,000+ 站自动化深挖、可解释标签、机器判定阈值、MCP 只读检索面
**冻结范围：** 页面布局与视觉展示不在本规格内
**上游规格：** `2026-09-01-site-entry-taxonomy-v3-design.md`（对象模型、13/57 分类、正交标签轴、去重与人工发布门禁），本规格不修改其中任何一条，只在其之上增加一条并行泳道。

---

## 0. 产品前提（本规格所有决策的依据）

1. **用户是自己筛的，系统不做问答式推荐。** 站点不提供「输入一句话返回一个结果」的语义检索或个性化排序。系统的职责是把每个站挖透并打上准确、穷尽、可解释的标签；筛选权在用户手里。
2. **站库是第一板块。** 「找到真东西」= 用户自己挑选时能筛到自己要的，不是算法替他挑。
3. **不登录。** 无账号、无个性化、无行为排序。
4. **Agent 是一等公民。** 本地 agent 通过只读 MCP 能拿到人在页面上能看到的全部内容，字段一致。人看的页面是同一套筛选函数的可视化壳。
5. **人来主要是学审美。** 因此风格档案与可实时调参的演示是人侧的核心，不是附属。
6. **8,000+ 的自动化是开发者侧的事。** 流水线里由 AI 模型读站并作判断，实施方设定阈值决定哪些结果可以直接进公开索引。

---

## 1. 两条泳道

上游 v3 规格要求发布必须有三页人工证据、人话简介和独立复核。这条标准不放宽，但它无法覆盖 8,000+ 站。因此增加第二条泳道，两条并行、字段共享、状态永不混淆。

| | Lane V `verified` 已实地考察 | Lane M `mined` 已机器挖透 |
|---|---|---|
| 产出者 | 人（curator）+ 独立 reviewer | 深挖流水线（硬信号抽取 + AI 阅读） |
| 证据 | identity / breadth / proof 三页真图 + 60–120 字人话简介 | 路由必答题，每条带直接证据 URL + 实测信号数值 |
| 规模 | 数十到数百 | 8,000+ |
| 公开 | 已在 `approved-v3` / public revision | 新增 `mined-v1` / 同一 public revision 的独立段 |
| 标注 | 卡片与 MCP 字段标 `lane: "verified"` | 卡片与 MCP 字段标 `lane: "mined"`，可被用户一键过滤掉 |

**硬约束：** `lane` 字段必须出现在每一条公开记录和每一个 MCP 返回值里。任何页面文案、统计、manifest 都不得把 mined 计入 verified，也不得用「已收录 N 个站」这种混合口径。两条泳道的计数分别列出。

一条记录可以先是 `mined`，后被人工补齐三页证据升级为 `verified`；升级只增不减，mined 期间抽取的信号全部保留为 `minedSignals` 历史。

---

## 2. 深挖 = 路由分流（Routed Deep-Mining）

一个站不该走同一套抓取。「专收 agent UI 的目录站」和「动效做得很好的一个 agency 官网」需要挖的东西完全不同。流水线因此先判路由，再按路由深挖。

### 2.1 七条路由

| Route | 含义 | 对应 v3 主类（典型） |
|---|---|---|
| `R1 code-implementation` | 能拿走代码：组件、区块、动效/图表/3D 实现 | `ui-implementation`、`visual-implementation` |
| `R2 visual-specimen` | 站点自身就是视觉样本：官网、agency、作品集、实验微站、案例集合 | `single-site-showcase`、`case-inspiration-collections` |
| `R3 directory-index` | 主要交付物是通往别处的链接 | `directories-indexes` |
| `R4 asset-library` | 原子素材：图标、字体、插画、图片、3D、音视频 | `visual-assets`、`templates-design-files` |
| `R5 editorial-content` | 读/听/学：文章、教程、课程、播客、规范文档、词汇表 | `learning-editorial`、`reference-standards` |
| `R6 tool-service` | 在站内完成一个任务：生成器、编辑器、测试与审计工具、构建器 | `creation-tools`、`delivery-development-tools`、`research-quality-tools` |
| `R0 reject` | 与设计无关、死链、噪声、停放域、不可抓取 | — |

路由与 v3 主类不是同一个东西：路由决定**抓什么、怎么挖**，主类决定**用户看到的归属**。一条记录必须同时有 `route` 和 `classification`。

### 2.2 路由判定：硬信号优先，AI 只在不足时投票

判定分两路独立执行，最后交叉验证：

- **通道 A（硬信号，确定性）**：从渲染后的 DOM、HTTP 头、`package.json` / 仓库元数据、`robots.txt`、外链出度、内链结构、代码块与 `<canvas>` 计数等纯机器事实推出候选路由集合。规则示例：
  - 出站不同域链接 ≥ 40 且外链占全部链接 ≥ 60% → 强 `R3`
  - 页面存在可复制代码块 ≥ 5 且命中安装命令模式（`npm i`、`npx shadcn add`、`pnpm add`）→ 强 `R1`
  - 站点总内页 < 12 且无搜索、无列表分页、单一品牌叙事 → 强 `R2`
  - 存在批量下载入口（`.svg` / `.zip` / `.woff2` 直链 ≥ 20）→ 强 `R4`
  - 存在带日期的条目流 ≥ 10 且无代码块无下载 → 强 `R5`
  - 存在接受用户输入并产出结果的表单/画布，且结果不是搜索列表 → 强 `R6`
- **通道 B（AI 阅读，判断性）**：模型实际阅读首页 + 最多 6 个内页，用受控枚举返回 `route`、`classification`、`facets`、候选 `signalTags`，每一项必须附带它依据的 URL。

**交叉验证：** A 与 B 的路由一致 → 采用。不一致或 A 无强信号 → 记录 `routeConflict`，状态置 `NEEDS_REVIEW`，不进公开索引。**不做加权平均，不折中。**

### 2.3 各路由的必答题（Required Probes）

必答题是该路由下「不回答就等于没挖透」的字段。每条必答题必须携带 `evidenceUrl`（直接指向能看到该事实的页面）。

**R1 code-implementation**
1. 组件/实现清单页 URL 与可数条目数
2. 获取方式：`install` / `copy` / `download` 至少一种，附具体命令或按钮所在 URL
3. 许可：SPDX ID 或 `unknown`（`unknown` 不阻断，但禁止同时标 `access: open-source`）
4. 源仓库 URL（无则显式 `null` + 理由）
5. 最近更新时间（仓库最后提交 / 包最后发布 / 站内最新条目日期，三者任一）
6. 至少 1 个条目的可运行证据：站内可交互预览、沙箱链接或实测渲染截图

**R2 visual-specimen —— 必须扒干净**
1. **完整 Style Dossier**（见第 3 节），缺任一必需块即不达标
2. 3 张截图：首屏、一个内页、一个能体现其签名手法的局部
3. 站点角色（产品官网 / agency / 个人作品集 / 活动微站 / 案例集合）
4. 权利状态：默认 `reference-only`，除非有明确开放许可证据
5. 至少 1 条「它为什么值得作为样本」的可测支撑（来自第 4 节的 signal tag，不接受形容词裸奔）

**R3 directory-index**
1. 收录对象样本 ≥ 20 条外链（去重后的目的域）
2. `collectionSubject`：它专门收录什么（见 2.4）
3. 是否有站内分类结构，以及分类维度名称
4. 更新迹象：最新条目日期或站点声明的更新频率
5. 是否含 affiliate / 赞助位（检测 `?via=`、`?ref=`、`rel="sponsored"`），如实标注

> R3 的副产物直接回流采集层：抓到的外链全部作为新的 `SourceObservation` 落盘，遵守上游规格 9.2 的计数守恒，不在 collector 内静默去重。

**R4 asset-library**
1. 素材类型与数量级
2. 文件格式清单
3. 许可与是否要求署名
4. 是否可直接下载 / 是否需登录 / 是否有付费墙
5. 是否提供代码封装（React/Vue 包等），有则记为 `technologies` 标签，主类仍是素材

**R5 editorial-content**
1. 内容形态（文章 / 教程 / 课程 / 播客 / 视频 / 规范文档 / 词汇表）
2. 最近 3 条内容的发布日期
3. 主语言
4. 作者或组织身份
5. 是否有稳定的可订阅出口（RSS / newsletter）

**R6 tool-service**
1. 输入 → 输出的一句动词描述
2. 是否需登录 / 是否有免费额度 / 是否付费
3. 输出可导出的格式
4. 运行位置（纯前端 / 服务端 / 需装客户端 / 需 API key）
5. 一条实测：真实跑通一次最小任务的证据 URL 或截图

### 2.4 `collectionSubject`：让「专收 agent UI 的目录站」表达得出来

新增字段，只在 `R3` 与含聚合性质的 `R1` 上出现：

```js
collectionSubject: {
  ofCategory: 'ui-implementation',        // 它收录的对象属于哪个主类
  ofSubcategory: 'general-ui-components', // 可为 null
  scenarios: ['agent', 'ai'],             // 它专门面向的场景
  media: ['ui'],
  evidenceUrl: 'https://example.com/agent-ui'
}
```

于是一个专收 agent UI 的目录站的完整表达是：

```
classification.primaryCategory = 'directories-indexes'
classification.subcategory    = 'component-package-indexes'
facets.scenarios              = ['agent', 'ai']
collectionSubject.ofCategory  = 'ui-implementation'
collectionSubject.scenarios   = ['agent']
```

用户可以先筛「收录型」，再筛「收录的是 agent UI 组件」，两层互不冲突。**收录站不因为它收录组件就被判成组件库**，这是上游规格第 7 节已有的边界，本节只是把它变成可查询的结构。

---

## 3. Style Dossier：R2 的「扒干净」定义

用户明确要求：识别到是视觉参考类站点时，要过一遍 web-to-design，把它扒干净。产出物是可检索的结构化档案，不是一段散文。

### 3.1 必需块（缺一即 R2 不达标）

| 块 | 最低要求 |
|---|---|
| `colors` | ≥ 3 个 token，每个带 `value` + `role`（该色实际承担的职责，如「唯一近白，承担全部正文与导航」），role 必须由实测覆盖面积/出现位置导出 |
| `typography.families` | ≥ 1 个字族，含实际 `weights` 与 `sizes` 全集 |
| `typography.scale` | ≥ 4 档，每档含 `size` / `lineHeight` / `letterSpacing` |
| `spacing` | 基数单位 + ≥ 4 个实际间距值 |
| `radii` | 按元素类型分别记录（nav / card / button / tag），允许 `0` |
| `motion` | 默认时长、**主导 easing 曲线及其出现次数占比**、承担过渡的属性分布（transform/opacity vs color/border）、命名动画清单 |
| `layout` | 页面最大宽度、区块间距、卡片内边距 |
| `components` | ≥ 3 个可命名组件的解剖（填充、描边、圆角、内边距、字号、大小写） |

### 3.2 派生产物

- `designMd`：由结构化字段渲染出的 Markdown，供 agent 直接使用；**它是投影，不是数据源**，任何时候都可从字段重新生成，字节稳定。
- `cssVariables` / `tailwindTheme`：同样由字段渲染。
- `styleCoordinates`：把气质变成可筛的坐标，这是与只给一句诗的现有产品的关键差别：
  ```js
  {
    canvas: 'dark' | 'light' | 'duotone',
    weightStrategy: 'scale-not-weight' | 'bold-led' | 'mixed',
    buttonFill: 'none' | 'outlined' | 'filled',
    radiusLanguage: 'sharp' | 'soft' | 'pill' | 'mixed',
    motionCharacter: 'still' | 'restrained' | 'expressive' | 'playful',
    colorRestraint: 'monochrome' | 'restrained' | 'chromatic',
    density: 'compact' | 'comfortable' | 'airy'
  }
  ```
  每个坐标值都由第 4 节的实测信号推导，不接受模型直接给结论。

### 3.3 权利边界

Style Dossier 记录的是**从公开页面观测到的事实**（色值、字号、时长），不复制其素材、字体文件、图片或文案。截图遵守现行三图 QA 与隔离规则。`rightsStatus` 默认 `reference-only`。

---

## 4. 审美标签必须绑定可测信号

这是本规格的核心机制。用户举的例子——「动效很连贯优秀」「像素风」——都是主观形容词。**主观形容词不能由模型裸奔给出**，否则 8,000 站的标签会立刻退化成玄学，重蹈旧「全局价值分」的覆辙。

规则：**每一个审美/风格标签，必须有一条纯机器可测的触发条件；标签落库时必须同时存下触发它的实测数值。** 模型可以提名标签，但提名不构成打标；只有实测条件成立才打标。模型提名而实测不成立 → 记 `unsupportedTagClaims`，该记录降级 `NEEDS_REVIEW`。

### 4.1 信号标签表（v1）

| Tag | 中文 | 触发条件（全部机器可测） |
|---|---|---|
| `motion.coherent` | 动效连贯 | 动画/过渡声明 ≥ 12；主导 easing 曲线出现占比 ≥ 55%；duration 中位数 0.15–0.8s；不同 duration 家族 ≤ 3 |
| `motion.still` | 克制近静 | 动画/过渡声明 ≥ 4；无 spring/bounce 关键帧；duration 中位数 ≥ 0.4s；无 scale-pop（scale 变化幅度 > 1.15 的关键帧为 0） |
| `motion.expressive` | 动效张扬 | 关键帧动画 ≥ 6；transform 维度 ≥ 3；或存在 spring/bounce 特征曲线 |
| `motion.scroll-driven` | 滚动驱动 | 命中 ScrollTrigger / `animation-timeline: scroll` / IntersectionObserver 且伴随 transform 变更 ≥ 5 处 |
| `style.dark-canvas` | 暗底画布 | 首屏背景相对亮度 < 0.2 且该背景覆盖 ≥ 70% 视口面积 |
| `style.pixel-art` | 像素风 | `image-rendering: pixelated` 出现；或字族命中像素字体字典；或去重主色板 ≤ 16 且渐变声明为 0 |
| `style.brutalist` | 粗野 | 圆角为 0 的元素占比 ≥ 80%；边框宽度 ≥ 3px 的元素 ≥ 5；存在对比度 ≥ 12:1 的主色对 |
| `style.editorial` | 编辑排版 | 存在衬线字族承担标题；字阶最大/最小比 ≥ 6；正文测量宽度 ≤ 80ch |
| `style.glass` | 玻璃拟态 | `backdrop-filter` 含 blur 的规则 ≥ 2 |
| `style.gradient-led` | 渐变主导 | 渐变声明 ≥ 6 且其中 ≥ 2 处作用于大面积容器（面积 ≥ 15% 视口） |
| `style.3d-webgl` | 3D / WebGL | 存在 WebGL context 或命中 three.js / r3f / babylon 特征 |
| `style.monochrome` | 单色 | 非中性色（色度 > 0.15）去重后 ≤ 1 |
| `craft.type-scale-disciplined` | 排版有纪律 | 去重字号 ≤ 10 档，且相邻档比值的标准差 ≤ 0.12 |
| `craft.color-restraint` | 用色克制 | 非中性色去重后 ≤ 3 |
| `craft.responsive-verified` | 响应式实测 | 320 / 768 / 1440 三档渲染均无横向溢出且无元素重叠检测命中 |
| `craft.a11y-contrast-ok` | 对比达标 | 采样正文/背景对 ≥ 10 组，全部 ≥ 4.5:1 |

标签值一律存为：

```js
{ tag: 'motion.coherent', evidence: { declarations: 47, dominantEasing: 'cubic-bezier(0.52,0.01,0,1)', dominantShare: 0.71, medianDuration: 0.5, durationFamilies: 2 }, measuredAt: '…' }
```

**页面与 MCP 都必须能展开看到 `evidence`。** 标签可点开看为什么被打上，这是本站与所有同类产品的分界线。

### 4.2 标签的三态：支持 / 证否 / 无法判定

标签不是二元的。每个标签在一条记录上必须落在三态之一：

- `supported`：条件所需度量齐全且成立。
- `refuted`：度量齐全但条件不成立。
- `undecidable`：缺度量，无法判定，并列出**缺哪些度量**。

**`undecidable` 绝不能被折叠进 `refuted`。** 两者混淆等于让抽取失败伪装成风格判断——"这个站没有连贯动效" 和 "我们没量到它的动效" 是完全不同的两句话，前者是结论，后者是我们的短板。批次断路器里 "平均 tag 数 < 1.5" 之所以是断路条件，正是因为它通常意味着 undecidable 泛滥而不是语料真的乏味。

### 4.3 色度而非饱和度

判断"非中性色"用**色度**（通道极差 / 255），不用 HSL 饱和度。HSL 饱和度在明暗两端会失真：`#fffdf9` 这种近白色的 HSL 饱和度接近 1.0，会被误判成彩色，从而让"用色克制"和"单色"两个标签在几乎所有浅色站上失效。色度对"这个颜色带不带色"是稳定的。

### 4.4 抽取器：两层架构、依赖与许可边界

度量从哪里来，决定了这套标签能不能真的跑满 8,000 站。抽取器分两层，同名度量以渲染层为准，但分歧必须记录——"声明里写了一套、渲染出来是另一套"本身就值得复核。

| | Tier 1 静态 CSS 层 | Tier 2 渲染层 |
|---|---|---|
| 手段 | 取页面全部 CSS（内联 `<style>`、`<link>` 样式表、行内 `style`），交给 CSS 分析器做声明级统计 | 真实浏览器渲染，采样 computed style、三档视口、截图 |
| 成本 | 无浏览器，可全量跑 | 昂贵 |
| 覆盖 | 动效曲线与时长分布、颜色与渐变计数、字阶、圆角声明、`backdrop-filter` 计数 | 元素级圆角占比、首屏背景亮度与覆盖面、正文测量宽度、transform 维度、滚动驱动、WebGL、响应式溢出/重叠、对比度采样 |
| 何时跑 | 每一条记录 | `R2` 必跑；其余路由抽样，或在 Tier 1 产生过多 `undecidable` 时补跑 |

**依赖与许可（这条必须成立才能用）：**

- `@projectwallace/css-analyzer`（**MIT**，1 依赖，持续维护）承担 Tier 1 统计。它的 `values.animations.durations` 与 `timingFunctions` 直接给出"某条 easing 曲线出现了多少次"，正是 `motion.coherent` 需要的分母与分子。
- 浏览器层做 **adapter**，不绑定任何单一 CLI：CDP（复用用户已有 Chrome）与 Playwright（Apache-2.0，独立浏览器）两种实现，运行时择一。
- 本地 `references/web-to-design-md` **没有 LICENSE**（GitHub license metadata 为 null，README 明确要求发布前再加许可证）。因此只吸收其 evidence-first 方法论与 DESIGN.md 章节骨架的**思想**，**不复制其代码、模板或 preview shell**，实现为 clean-room。
- Refero Styles 的条款禁止批量抓取、再分发与建立竞争数据集。只借鉴其"分层披露 + 多格式导出"的信息节奏，不抓取其内容。

**命名纪律：** 只有当某一层真的能测准某个度量时，才允许使用规格里的正式度量名。声明级统计推不出元素级事实的，一律用带 `Declaration` 后缀的提示名（如 `zeroRadiusDeclarationShare`），正式名 `zeroRadiusShare` 只能由渲染层给出。**缺度量就让标签落到 `undecidable`，不许用近似量顶替。**

**探针合同带版本号。** 浏览器只负责"读"——量到什么报什么，不做判断、不做换算；亮度、对比度、占比等换算全部在 Node 侧完成，这样才能用夹具测试。版本不认识就整体拒绝该 payload，绝不按旧字段猜。

### 4.5 字典治理

- 新增 tag 必须同时提交触发条件，否则不入字典。
- 不允许同义标签（`dark` / `dark-mode` / `暗色` 归一到 `style.dark-canvas`）。
- tag 一律带命名空间前缀（`motion.` / `style.` / `craft.`），与 v3 的 12 条正交标签轴并存但不混用：v3 facets 描述**是什么、给谁、什么许可**；signal tags 描述**做得怎么样、什么调性**。

---

## 5. 阈值：三层门 + 流水线断路器

**阈值不是给每个站打分。** 上游规格已禁止用 0–1 伪精度替代复核。这里的阈值是**布尔条件集合**加**批次级健康度断路器**。

### 5.1 第一层：硬否决（Veto → `EXCLUDED`）

任一命中即排除，不进入后续深挖，但保留 observation 与否决理由：

1. 最终 URL 返回 4xx / 5xx，或连续 3 次不同时间探测均超时
2. `robots.txt` 禁止抓取该路径
3. 渲染后主文本 < 200 字符，且无 `<canvas>`、无 ≥ 3 张内容图片（空壳）
4. 命中域名停放 / 待售 / 默认建站占位特征
5. 成人、赌博、盗版分发、恶意软件
6. 与设计工作无关：通道 A 无任何设计相关硬信号（无设计相关词表命中、无素材、无组件、无案例结构）**且**通道 B 判定不相关 —— 必须两路同时否定

单次网络失败不构成否决（沿用上游规格第 13 节非目标）。

### 5.2 第二层：必答完备（Completeness → 不满足则 `NEEDS_REVIEW`）

- 该路由的全部必答题有值
- 每条必答题有可访问的 `evidenceUrl`（HEAD 探测 2xx/3xx）
- `R2` 的 Style Dossier 八个必需块齐全
- 截图数量与 QA 符合现行 capture 门禁（非骨架屏、非错误页、非空白）

缺项进 `NEEDS_REVIEW` 并写明缺哪一条，**不进 `EXCLUDED`**——缺证据不等于没价值。

### 5.3 第三层：一致性（Consistency → 不满足则 `NEEDS_REVIEW`）

1. 通道 A 强信号路由 == 通道 B 路由
2. `classification` 的主类与 `route` 落在第 2.1 节的允许配对内
3. 模型提名的每个 signal tag 都有实测支撑；`unsupportedTagClaims` 必须为空
4. `access` 与 `licenses` 不冲突：标 `open-source` 必须有非 `unknown` 的 SPDX **且**仓库 URL 可达；带 Commons Clause / 禁止转售条款的一律 `source-available`
5. `collectionSubject` 若存在，其 `ofCategory` 必须合法且不等于该记录自身的 `primaryCategory`
6. 声明的语言与实测主语言一致
7. 简介不含禁止套话（沿用现行 v3 editorial 禁语表），且不是机器直译痕迹（与源站原文的字面重合率 < 0.6）

三层全过 → `MINED_CONFIRMED`，可进公开索引的 mined 段。

### 5.4 批次断路器（真正的「人工设定的阈值」）

自动化最大的失效模式不是单站判错，是**门禁整体失灵后全量放行**。因此在批次层设四条断路器，任一触发即暂停该批次写入并要求人工抽样：

| 断路器 | 阈值 | 理由 |
|---|---|---|
| 通过率上限 | 单批 `MINED_CONFIRMED` 占比 > 85% | 真实语料噪声很大，过高通过率说明门禁没在起作用 |
| 通过率下限 | 单批 `MINED_CONFIRMED` 占比 < 15% | 抽取器或渲染环境坏了 |
| 路由塌缩 | 任一路由占比 > 60% | 路由判定退化成常量 |
| 标签塌缩 | 任一 signal tag 命中率 > 50%，或全批平均 tag 数 < 1.5 | 触发条件写错，或抽取器没拿到样式 |

批次大小固定 200 条。触发断路器 → 该批全部落 `NEEDS_REVIEW`，人工抽 30 条复核后决定放行、调阈值或修抽取器。抽样结论写入 `thresholdCalibration` 日志，可追溯每次阈值变更的依据。

### 5.5 常态抽检

即使没触发断路器，每批仍随机抽 5% 交人工判对错，累计错误率 > 10% 时冻结流水线。抽检结果同样进 `thresholdCalibration`。

---

## 6. 记录结构

```js
{
  minedId,
  entityId, entryId,
  lane: 'mined',
  route: 'R2',
  routeSignals: { channelA: [...], channelB: 'R2', conflict: false },
  classification: { /* 复用 v3 结构，status: 'machine-confirmed' */ },
  facets: { /* v3 十二轴 */ },
  collectionSubject: null,
  probes: [ { key, value, evidenceUrl, checkedAt } ],
  signalTags: [ { tag, evidence, measuredAt } ],
  unsupportedTagClaims: [],
  styleDossier: null,          // R2 必填
  units: [],                   // R1 抓到的 Content Unit
  shots: [ /* 复用现行 capture 结构与 QA */ ],
  quality: { /* 复用 v3 quality facts */ },
  gate: {
    veto: [], completeness: [], consistency: [],
    status: 'MINED_CONFIRMED' | 'NEEDS_REVIEW' | 'EXCLUDED',
    thresholdVersion: 'mining-threshold-v1',
    batchId
  },
  provenance: { observationIds: [], minedAt, pipelineVersion }
}
```

`classification.status` 在 mined 泳道取 `machine-confirmed`，与 v3 的 `confirmed`（需人工独立复核）不是同一个值，禁止互相赋值。

---

## 7. MCP 只读检索面

不登录、无写操作。函数即筛选面，人的页面用同一组参数：

| 函数 | 说明 |
|---|---|
| `listFacets()` | 返回全部可筛维度：13/57 分类、12 条 facet 轴、signal tags、style coordinates，含中文标签与每个值的当前条目数 |
| `filterEntries(filters, cursor)` | 多维交集筛选，返回条目摘要 + `lane`。无排序算法，默认按稳定 ID 排序，可选按 `lastVerifiedAt` |
| `getEntry(id)` | 全量记录，含 probes 与 signalTags 的 evidence |
| `getStyleDossier(id)` | 结构化档案 + 派生 `designMd` / `cssVariables` / `tailwindTheme` |
| `listUnits(entryId, filters)` | R1 站点下的 Content Unit |
| `resolveUrl(url)` | 复用现行五态查重 resolver |

约束：MCP 返回的字段集合必须是页面可见字段的**超集或相等**，不得存在只给 agent 的隐藏内容，也不得存在页面有而 MCP 没有的字段。该不变量由测试守护。

---

## 8. 实施顺序

1. `signal tags` 字典 + 触发条件（纯数据 + 校验函数）
2. 阈值门纯函数：veto / completeness / consistency / batch 断路器
3. 路由判定：通道 A 硬信号规则 + 交叉验证
4. Style Dossier schema 与派生渲染（`designMd` 字节稳定）
5. 抽取器：渲染页面并产出信号原始度量（复用现行 capture 基础设施与 QA 门禁）
6. AI 阅读通道的受控输出 schema 与校验
7. 批处理 runner：200 条一批、断路器、`thresholdCalibration` 日志
8. mined 记录写入与 public revision 的 mined 段投影（沿用现行原子事务与 `protectedPaths`）
9. MCP 只读服务，字段一致性测试
10. 先跑 200 条试验批，人工复核 30 条，据此校准阈值，再放开全量

第 1–3 步是纯函数，先做，先测。

---

## 9. 非目标

- 不做问答式推荐、语义搜索、个性化排序或全局价值分。
- 不用 mined 数量冒充 verified 数量，不在页面出现混合口径的大数字。
- 不让模型直接给出主观标签而无实测支撑。
- 不因为一次网络失败判死站。
- 不在本规格内决定首页、卡片或详情页布局。
- 不做写操作的 MCP。
