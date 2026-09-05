# VisLexicon 400 条图鉴 taxonomy / 覆盖量独立审计（草案）

- 审计日期：2026-08-31（Asia/Shanghai）
- 审计对象：首发 400 条的五桶构成 `100 / 95 / 65 / 80 / 60`；预审槽 `110 / 105 / 80 / 90 / 65`（合计 450）
- 范围：计数口径、AI / Agent GUI taxonomy、跨来源去重、许可与复用门槛
- 非范围：不生成词条，不判断具体 UI/CSS 实现，不修改主报告或来源 JSON

## 结论先行

**400 条总量可实现，五桶的难度却不均匀。** 核心 UI 100、视觉效果 65、AI / Agent GUI 80 都有明显的来源余量；动效 / 交互 95 可实现，但必须解决跨桶词（如 `Accordion / Collapse`、`Skeleton / Shimmer`、`Blur`、`Reduced motion`）；任务 / 反馈 / 信任 / 系统约束 60 是唯一不能仅凭来源数量称为“保守”的桶。

**当前 450 → 400 的预审缓冲不保守。** 总淘汰空间仅 50 条，即 11.1%；最含混的第五桶仅允许从 65 淘汰 5 条（7.7%），反而是五桶中缓冲最小者。建议首发 400 的宣传目标暂不变，但把规范化候选池扩大到约 **500–525** 条，再进入编辑 QA；建议最低候选池为 `125 / 115 / 85 / 105 / 85 = 515`。如果第五桶最终证据不足，宁可先保留 5–10 个空缺，也不要用 AI Interaction Atlas 的数据类型、后台任务或约束名称凑数。

**AI Interaction Atlas 的 194 条不能直接进入视觉词典。** 194 的构成为 25 AI tasks、24 human actions、22 system operations、47 data types、38 constraints、38 touchpoints；其官方 README 明确写明它“Not a UI framework”。因此 Atlas 对 VisLexicon 的直接词条贡献应记为 **0**，用途应是覆盖矩阵、缺口检查和候选生成；只有当某项有可观察的 GUI 表达、独立交互契约和一手界面证据时，才可转化为候选。

**animations.dev 的派生展示必须整簇去重。** canonical provenance 是公开的 [animations.dev Vocabulary](https://animations.dev/vocabulary) 与作者官方 MIT [animation-vocabulary skill](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/animation-vocabulary/SKILL.md)，共 91 条。`motion-vocabulary.vercel.app`、`vocabulary.vikingz.me`、Moro 的 91 条 vocabulary 都明确指回 / adapted from animations.dev；Moro 首页的 15 个 interactive principles 也是该 91 条的展示子集。所有这些页面合计只贡献 **91 个来源记录，不是 91 + 96 + 91 + 91 + 15**。

## 一、关键计数复核

### 1. 核心 UI / anatomy 来源

| 来源 | 2026-08-31 可复核数 | 口径与审计意见 |
|---|---:|---|
| [UI Anatomy API](https://uianatomy.dev/api/components.json) | 41 | `components.length = 41`；官方仓库也有 41 个 [`content/components/*.yaml`](https://github.com/DominikPieper/uianatomy/tree/f1f92d91b66800526607da10cbfa0da06a4f5e88/content/components)。 |
| [The Component Gallery](https://component.gallery/components/) | 60 | 官方页面自报并公开 60 个 `/components/{slug}`。它是参考画廊，不是 60 个可复制组件。 |
| [UI Guideline 组件索引](https://www.uiguideline.com/components) | 38 | 当前索引公开 38 个组件，且[定价页](https://www.uiguideline.com/pricing)仍写 “all 38 components”。sitemap 有 45 个可达 base 路由，但其中 7 个未列入当前索引，不能把 45 和 38 相加。 |
| [NameThatUI sitemap](https://namethatui.com/sitemap.xml) | 76 | 44 个 Web term pages + 32 个 macOS term pages。另有 14 个 style pages 与 18 个 comparison pages；比较页复用既有术语，不能加成新词。 |
| [WAI-ARIA APG patterns](https://github.com/w3c/aria-practices/tree/7e4034b262bc0d25332e330d8a582aaf34113829/content/patterns) | 30 | 当前官方目录为 30，不是 31。 |
| [Open UI research topics](https://github.com/openui/open-ui/tree/93671dc549f262b1a33e7c221caddfcd75e8f126/site/src/pages/components) | 31 | 将 `*.research*.mdx` 归一到 base topic 后为 31。 |
| [GOV.UK components](https://github.com/alphagov/govuk-design-system/tree/71b861c1ad296b7d7e109eb2146628ed65212d21/src/components) | 37 | 组件目录 37；另有 35 个 service patterns，但后者更适合第五桶，不应重复计入核心组件。 |

上述七组核心来源共有 313 个来源记录；只做小写 slug 的**精确字符串**去重后为 183。这个 183 仍包含 `dialog/modal`、`datepicker/date-picker`、`radio/radio-button` 等语义重复，但也说明核心 UI 首发 100 有足够余量。一个直观例子：UI Anatomy 的 41 与 Component Gallery 的 60 已有 **26 个完全相同 slug**；二者不能声称提供 101 个独立词。

### 2. AI / Agent GUI 来源

| 来源 | 可复核数 | 应用于 VisLexicon 的保守口径 |
|---|---:|---|
| [assistant-ui element docs](https://github.com/assistant-ui/assistant-ui/tree/0f17ba5bb0c048d5b639205900bd590db5b8824b/apps/docs/content/elements) | 120 | 这是文档记录数。官方 Elements registry 定义 96 项，其中 `elements-range`、`elements-surfaces` 是家族内部 helper，留下 94 个面向候选的 registry 项；120 与 96 不可相加。 |
| [assistant-ui primitive API docs](https://github.com/assistant-ui/assistant-ui/tree/0f17ba5bb0c048d5b639205900bd590db5b8824b/apps/docs/content/docs/(reference)/api-reference/primitives) | 19（不含 index） | 与 element docs 至少有 `assistant-modal`、`attachment`、`composer`、`thread`、`thread-list` 等直接重合；`120 + 19 = 139` 只能称“文档记录”，不能称 139 个组件词。 |
| [Vercel AI Elements live catalog](https://elements.ai-sdk.dev/components) | 48 | live index 为 48。仓库 main 目前有 49 个 MDX / source component，新增 `question` 尚未发布，live URL 返回 404；首发计数应取 48。 |
| [Prompt Kit registry](https://github.com/ibelick/prompt-kit/blob/de80375967400aa0c6ebab9d3ba4f9258ab79fcc/public/c/registry.json) | 23 | 21 个 `registry:ui` + 2 个组合 recipe（`chatbot`、`tool-calling`）。组合 recipe 不应在其原子组成均已收录时再算词。 |
| [Loquix custom-elements manifest](https://github.com/loquix-dev/loquix/blob/db423a9864feed441604a1f7b9fa1a043e46c572/packages/core/custom-elements.json) | 53 | 53 个 tagged declarations；React wrapper、Storybook story、同一 custom element 的 `define-*` 文件不是新增词。 |

以 assistant-ui 的 120 个 element docs、Vercel live 48、Prompt Kit 的 21 个 UI、Loquix 53 为四组输入，共 242 条；仅按 slug 精确去重后为 **219**。这并非最终独立词数，因为语义同义远多于字符串相同；但即使排除通用 UI primitive、组合 recipe、helper，并把信任 / 约束类移到第五桶，AI / Agent GUI 的 80 条仍有明显来源余量。

可复核的精确重复包括：

- AI Elements × Prompt Kit：`chain-of-thought`、`code-block`、`image`、`jsx-preview`、`message`、`prompt-input`、`reasoning`、`tool`（8 项）；
- assistant-ui docs × AI Elements：`file-tree`、`image`、`inline-citation`、`model-selector`、`reasoning`、`sources`、`web-preview`（7 项）；
- assistant-ui docs × Loquix：`follow-up-suggestions`、`message-actions`、`model-selector`、`scroll-anchor`、`tool-call`、`typing-indicator`（6 项）。

### 3. AI Interaction Atlas 194 条的正确角色

官方 [`data/`](https://github.com/quietloudlab/ai-interaction-atlas/tree/34e2f276afd1884a571ab66da2080848e6031172/data) 六个权威数组可复核为：

| 维度 | 数量 | 是否可直接作为视觉词条 |
|---|---:|---|
| AI tasks | 25 | 否；`Detect / Extract / Rank / Generate` 等是能力 / 任务分类。 |
| Human actions | 24 | 否；可用于检查界面是否支持 review、approve、feedback、delegate 等行为。 |
| System operations | 22 | 否；数据库 CRUD、webhook、cache、logging 等大多没有独立 GUI。 |
| Data types | 47 | 否；应作为输入 / 输出或 artifact metadata。 |
| Constraints | 38 | 否；可驱动 UI pattern（如置信度、超时、成本、隐私、人工审批），但约束名本身不是图鉴。 |
| Touchpoints | 38 | 否；Web、API、voice、kiosk、wearable 等是渠道 / 载体。 |

Atlas 自己将其定义为跨 human actions、AI tasks、system operations、data、constraints、touchpoints 的 shared language，并明确说明 [“Not a UI framework”](https://github.com/quietloudlab/ai-interaction-atlas/blob/34e2f276afd1884a571ab66da2080848e6031172/README.md)。建议数据模型把这六类存为 `coverage_dimensions`，不放入 `lexeme_count`。

### 4. 动效 canonical source 与派生展示

[作者官方 MIT skill](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/animation-vocabulary/SKILL.md) 的 12 类计数为 `6 / 8 / 8 / 7 / 5 / 9 / 7 / 9 / 7 / 10 / 6 / 9`，合计 **91**。它明确写明自己是 `/vocabulary` 的 curated snapshot，并要求两边保持同步。

派生关系：

- [The Vocabulary of Motion](https://motion-vocabulary.vercel.app/) 页面注明 “Vocabulary & definitions adapted from animations.dev” 与 “a representation of the animations.dev vocabulary”；其显示数变化不构成新 provenance。
- [Vikingz interactive glossary](https://vocabulary.vikingz.me/) 明示 “Terms are adapted from the animations.dev Animation Vocabulary page”。
- [Moro vocabulary](https://moro.davidumoru.me/vocabulary) 明示 91 terms 且 “adapted from Emil Kowalski’s animation vocabulary”；[Moro 首页](https://moro.davidumoru.me/)的 15 demonstrations 是 91 条的交互视图。

因此这四个展示入口必须共用同一 `provenance_cluster_id = animations-dev-vocabulary`，仅 canonical source 计数 91，其他全部 `derivative_count = 0`。

## 二、五桶审计

| 内容桶 | 预审 → 首发 | 独立结论 | 主要风险 | 建议最低规范化候选池 |
|---|---:|---|---|---:|
| 核心 UI 组件 / 解剖 | 110 → 100 | **保守，可保留 100** | 组件、pattern、platform control 混入同一平面；别把 anatomy slots 当独立组件。 | 125 |
| 动效 / 交互 | 105 → 95 | **可实现，但仅属中等保守** | canonical 91 中至少有若干跨桶词；派生站不得加数；easing 的方向变体不应无限拆分。 | 115 |
| 视觉 Form / Material / Color / Type 效果 | 80 → 65 | **数量保守，许可风险高于数量风险** | Adobe / 产品软件 effect list 是产品命令清单，不等于通用视觉术语；专有描述、图像与 demo 不可搬运。 | 85 |
| AI / Agent GUI 部件与状态 | 90 → 80 | **数量保守，可保留 80** | 通用组件、AI-specific 组件、状态、复合 recipe 混杂；四库高度同构。 | 105 |
| 任务 / 反馈 / 信任 / 系统约束模式 | 65 → 60 | **当前不保守，是最大风险桶** | Atlas 194 不能直入；每条都需要可观察 GUI 与交互契约；65→60 的淘汰空间仅 5。 | 85 |

建议保留首发结构 `100 / 95 / 65 / 80 / 60` 作为**容量上限**，但发布验收要允许第五桶未满。若项目必须在固定日期恰好发布 400 条，应先扩大预审池，而不是在最后一周把 Atlas 的 metadata 转写成虚假视觉词。

## 三、跨来源与跨桶去重规则

### 1. 唯一计数单位

一个最终词条必须满足：

1. 有独立、可观察的视觉或交互现象；
2. 有独立的用户任务 / 状态机 / 语义契约之一；
3. 可以用一个稳定 canonical name 描述，并把其他来源名称放入 alias；
4. 有至少一个一手证据 URL；高风险 / 新兴 AI pattern 建议两个互相独立的一手实现；
5. 不是另一词条的 demo、recipe、story、platform wrapper、内部 helper 或文档视图。

计数对象是 `canonical_lexeme_id`，不是 URL、文档页、代码文件、registry item 或截图。

### 2. 规范化顺序

1. 字符层：Unicode NFKC、小写、去标点、空格 / 连字符统一、单复数归一；保留平台前缀为 alias metadata。
2. 名称层：维护 `canonical_name + aliases[]`，不要靠 fuzzy matching 自动合并。
3. 语义层：比较触发、焦点 / 键盘模型、模态性、生命周期、状态机、用户结果；只有这些相同才合并。
4. 结构层：primitive、composite、state、motion facet、design token 分层，避免同层相加。
5. 来源层：同一原始清单的镜像、翻译、可视化、Skill、站点必须归入一个 provenance cluster。
6. 计数层：一个 canonical entry 只能有一个 `primary_bucket`；其他桶只能是 tags / facets，不能重复计数。

### 3. 必须人工审的高风险重复簇

下列名称来自已核对来源，用于说明去重风险，不是拟造的新词条：

- 基础组件：`Accordion / Disclosure / Collapse`；`Modal / Dialog / Sheet / Drawer`；`Popover / Dropdown menu / Tooltip / Hover card`；`Badge / Chip / Pill / Tag`；`Select / Dropdown / Combobox / Autocomplete`；`Toast / Snackbar / Alert / Callout / Banner`。
- 加载 / 反馈：`Loader / Loading state / Spinner / Progress ring / Progress bar / Skeleton / Shimmer / Thinking indicator / Typing indicator`。其中若状态机和信息承诺不同，应分开；仅动画皮肤不同应作为 variant。
- AI 输入：`Prompt input / Composer / Chat composer`；附件相关的 `Attachment / File upload / Drop zone`。
- AI 输出：`Message / Message item / Message content / Message pair`；`Source / Sources / Source list / Search sources / Inline citation / Citation popover`。
- Agent 工作：`Plan / Agent plan / Task / Todo list / Steps`；`Tool / Tool call / Tool-call list / Tool timeline`；`Reasoning / Reasoning panel / Reasoning block / Chain of thought`。
- 信任 / 控制：`Confirmation / Approval card / Permission grant`；`Confidence marker / Confidence indicator / Uncertainty marker / Score breakdown`；`Guardrail notice / Caveat notice / System message`。
- 复合页面：`Chat panel / Conversation / Chat container / Full chat app / Chatbot / Tool-calling recipe`。它们可作为 specimen / recipe，但不可在组成部分已计数后再次充当“组件词”。
- 跨桶：`Accordion / Collapse` 以核心组件为 primary、展开动画为 motion facet；`Skeleton / Shimmer` 只能在组件 / 反馈 / 动效中选一个 primary；`Blur / Mask / Clip-path / Tabular numbers` 优先视觉桶；`Reduced motion` 优先系统 / 无障碍约束桶。

### 4. “相似但不应合并”的边界

去重不是把外观相似者全部合并。Popover 与 Tooltip 的交互内容、焦点进入和关闭契约不同；Spinner 与 determinate Progress bar 的信息承诺不同；macOS window-attached Sheet 与移动端 edge sheet 也可能需要平台 variant 或独立子型。最终合并必须以行为 / 语义契约为准，而不是名称或截图相似度。

## 四、许可与复用门槛

这是一套产品运营门槛，不是法律意见。

| 来源 | 可复核许可 | VisLexicon 处理建议 |
|---|---|---|
| assistant-ui | [MIT](https://github.com/assistant-ui/assistant-ui/blob/0f17ba5bb0c048d5b639205900bd590db5b8824b/LICENSE) | 可按许可适配代码 / 文档片段；保留版权与许可通知。 |
| Vercel AI Elements | [Apache-2.0](https://github.com/vercel/ai-elements/blob/6a9d5b1822ffb10bba4bd97175f01edd7d8651cd/LICENSE) | 可按许可适配；保留 notice / license，注意商标不由软件许可自动授予。 |
| Prompt Kit | [MIT](https://github.com/ibelick/prompt-kit/blob/de80375967400aa0c6ebab9d3ba4f9258ab79fcc/LICENSE) | 可按许可适配并归因。 |
| Loquix | [MIT](https://github.com/loquix-dev/loquix/blob/db423a9864feed441604a1f7b9fa1a043e46c572/LICENSE) | 可按许可适配并归因。 |
| AI Interaction Atlas | [Apache-2.0](https://github.com/quietloudlab/ai-interaction-atlas/blob/34e2f276afd1884a571ab66da2080848e6031172/LICENSE) | 可使用结构化 taxonomy 做 coverage；不要把 194 原样当视觉条目。 |
| Emil animation vocabulary skill | [MIT](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/LICENSE) | 91 条是最清晰的可复用 canonical motion source；保留通知。 |
| WAI-ARIA APG / Open UI | [W3C Software and Document License](https://github.com/w3c/aria-practices/blob/7e4034b262bc0d25332e330d8a582aaf34113829/LICENSE.md) / [W3C licenses](https://github.com/openui/open-ui/blob/93671dc549f262b1a33e7c221caddfcd75e8f126/LICENSE.md) | 可作为规范证据；遵守对应文档 / 软件归因条件。 |
| GOV.UK Design System | [MIT](https://github.com/alphagov/govuk-design-system/blob/71b861c1ad296b7d7e109eb2146628ed65212d21/LICENSE) | 代码按 MIT；若另取 GOV.UK 站点内容 / Crown assets，要另查对应内容许可。 |
| UI Anatomy | 仓库未检测到 LICENSE，`package.json` 也无 license | 公开 API 可用于核对名称与事实；不要复制 YAML、原文、SVG 或代码，除非取得授权或后续出现明确许可。 |
| The Component Gallery | 仓库未检测到 LICENSE；[README](https://github.com/inbn/component-gallery/blob/9afa99919128f7e85393ade6cf86bc8dea21c855/README.md)说明完整 Airtable 数据库是 private | 只作链接 / 命名对照与独立研究；不批量搬运数据库、描述、截图。 |
| NameThatUI | 未发现公开源码或明确开放许可 | 名称与存在性可作事实核对；定义、示例、图像和交互演示应独立创作。 |
| UI Guideline | 商业目录，定价页销售完整 38 组件内容；未发现开放许可 | 只作发现 / 对照；不得把付费 anatomy、props、图像或文案复制进图鉴。 |
| easings.net（若采用） | [GPL-3.0](https://github.com/ai/easings.net/blob/d2563f0d32a511b5556774b838ec35c3a841b15d/LICENSE) | 不复制代码 / 数据，除非项目接受 GPL 义务；曲线名称和数学事实应从标准或独立实现重建。 |

对于无开放许可或商业来源，安全的最小策略是：只保存 canonical name、自己写的中文定义、自己实现的 demo、事实性参数与出处 URL；不保存原文描述、图片、截图合集、CSS / JS 或数据导出。

## 五、当前来源清单中应修正或注明的口径漂移

1. **WAI-ARIA APG：30，不是 31。** 当前 `content/patterns` 只有 30 个一级目录。
2. **UI Guideline：38 是 current catalog；45 是 sitemap 可达 base routes。** sitemap-only 七项为 `accordion`、`collapse`、`error-state`、`inline-alert`、`sidebar`、`success-state`、`tabs`，虽均返回 200，但当前索引和定价都只承诺 38。若字段叫 `exact-current-catalog`，应取 38；45 只能另记为 `routable_pages`，不能相加。
3. **Vercel AI Elements：live catalog 48；repo main 49。** `question.mdx` 已在仓库但 live `/components/question` 为 404。首发证据口径按 48；源码前瞻可另记 49。
4. **assistant-ui：139 是 documentation records，不是 139 independent components。** 120 element docs、19 primitive docs之间有直接和语义重复；安装 registry 又是另一投影（96 项、2 helper）。
5. **NameThatUI：76 term pages、14 style pages、18 comparison pages是三个不同单位。** comparison pages 不贡献新 canonical term；styles 应归视觉桶，不能同时进入核心组件桶。
6. **animations.dev 派生站显示数可漂移，但新增贡献始终为 0。** 页面当前可能显示 91 或 96，甚至把 live demos / reference records分开；只要明确 adapted from canonical vocabulary，就按 provenance cluster 去重。

## 六、建议的数据与验收约束

每个候选至少应有以下字段，才能让 400 的数字可审计：

```yaml
canonical_id: stable-kebab-id
canonical_name: Human-readable name
aliases: []
primary_bucket: core | motion | visual | ai_gui | system_pattern
facets: []
kind: primitive | component | composite | state | interaction | motion | visual_effect | constraint_pattern
source_records:
  - source_id: ...
    source_url: ...
    source_term: ...
    license_gate: permissive | attribution | copyleft | link_only | unknown
provenance_cluster_id: ...
derivative_of: null
evidence_status: verified | pending | rejected
dedupe_decision: unique | alias_of | variant_of | recipe_of | helper_excluded
```

首发计数 SQL / 构建逻辑应只统计：`evidence_status = verified`、`dedupe_decision = unique`、`primary_bucket` 非空、许可门槛允许当前呈现方式的记录。aliases、variants、recipes、helpers、derivative sources、coverage dimensions 都不得进入 `400`。

## 最终审计意见

- **保留 400 目标：通过。** 来源空间足够。
- **宣称“450 预审槽很保守”：不通过。** 需要扩大候选池或降低固定填满要求。
- **核心 100 / AI GUI 80 / 视觉 65：通过。**
- **动效 95：有条件通过。** 以 91 条 MIT canonical vocabulary 为主，并执行跨桶去重与独立来源补位。
- **系统模式 60：有条件通过，风险最高。** Atlas 194 直接贡献必须为 0；每条需由真实 GUI pattern 证据转化。
- **同源派生站加数：不通过。** animations.dev cluster 只能计一次。
- **许可门槛：必须进数据模型。** 无许可 / 商业来源只能 link-only + 独立创作，不能批量搬运。
