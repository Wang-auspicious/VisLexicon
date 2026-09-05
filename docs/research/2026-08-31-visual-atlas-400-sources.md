# VisLexicon 400 条视觉图鉴：一手来源地图、真实候选数据与采集接口

- 调研日期：2026-08-31（Asia/Shanghai）
- 研究范围：UI 命名/解剖、动效词典、跨媒介术语、设计模式、AI/Agent GUI taxonomy
- 数据边界：Visual Atlas Record ≠ Published Lexeme；所有导入记录保留一手证据，机器译文不冒充来源原文

## 结论

本轮共核实 **25 个一手来源**，其中所有来源当前可复核的记录合计 **1,971**；剔除三个明确改编自 animations.dev 的展示站后为 **1,693 个非衍生来源记录**。这些数字是来源记录，不是独立词条，不能直接相加宣传。

本轮同时落地了一个可复现的数据管线：从八个许可清晰的一手视觉/交互源采集 **466 个 counted source records**，精确去重后编译为 **419 个 counted unique Visual Atlas Records**，其中 **417 个 Atlas Candidate**、**2 个与现有本地词条精确匹配的 Published Lexeme**。AI Interaction Atlas 的 194 条另存为 `coverageDimensions`，全部 `countedAtlas:false`，直接 counted contribution 为 0。每个 counted entry 都保留英文原名、来源摘要、repository revision、许可、source path 和 URL；1,274 个唯一英文名称/摘要都有 `translationQuality: machine` 的中文缓存，0 失败。

这 419 条满足“视觉图鉴至少 400 个”的 counted 数据交付要求，但不等于已经完成 419 个本地演示。AI Interaction Atlas 的任务、数据、约束和触点只用于场景/缺口矩阵；没有独立 GUI 证据时既不进入 `entries`，也不参与 400 计数。

发布侧仍建议保持 400 的五桶容量目标 `100 / 95 / 65 / 80 / 60`，但把规范化预审池提高到约 **515**：`125 / 115 / 85 / 105 / 85`。当前 450→400 只允许淘汰 11.1%，对高重复、高许可风险的来源不够保守。

## 昨日断点与产品判断

昨日检索在第二轮深挖时因搜索服务 402 中断，断点包括：motion vocabulary、MCP/JSON 能力、AI GUI 部件 taxonomy，以及“用户不知道名称时如何发现”的路径。本轮已恢复并验证原先发现的 `uianatomy.dev`、`namethatui.com`、`motion-vocabulary.vercel.app`、`vocabulary.vikingz.me`、`component.gallery`、`uiguideline.com`、`animations.dev/vocabulary`，并继续扩展到 UI Terms、Moro、Motionary、W3C/Open UI、GOV.UK、Adobe/Figma/PowerPoint/Keynote 与四组 AI UI 来源。

恢复出的核心产品思想仍成立：

1. 知道名字的人用搜索/索引。
2. 不知道名字、但知道它长在界面哪里的人，应该从 **Scene Anatomy** 进入。Agent GUI、SaaS 控制台、落地页等熟悉场景提供可点击热区，再下钻到部件、子部件、状态和 Design Phenomenon。
3. 既不知道名字也说不清位置的人，才走闭集候选 + 动态追问 + 视觉二选一。

现有产品分别覆盖“口语找词”“单组件 anatomy”“组件画廊”“静态聊天界面 anatomy”“AI UI 代码库”，但本轮没有核实到一个产品同时提供：多场景空间热区、稳定 canonical ID、部件→状态→现象下钻、跨媒介绑定和机器接口。因此差异化不在“再建一个 UI glossary”，而在把这些已有碎片接成一条发现路径。

## 计数纪律

- `verifiedCount` 是某个一手索引、API 或官方仓库可复算的记录数。
- `source record`、`documentation page`、`registry item`、`route`、`demo`、`canonical lexeme` 是不同单位。
- 同一原始清单的镜像、翻译、可视化和 agent skill 归入一个 provenance cluster。
- 自动去重只处理 `NFKC 后名称 + recordType + axis` 的精确碰撞；语义近似项保留给人工审查，避免误合并。
- 最终发布计数只统计证据通过、许可允许、`dedupeDecision = unique` 且有唯一 primary bucket 的 Published Lexeme。

## 一手来源地图

### A. UI 命名、组件 anatomy 与模式库（412 个来源记录）

| 来源 | 官方定位与可复核数量 | 数据结构 / 接口 | 许可与使用边界 | 适合贡献 / 去重风险 | 一手证据 |
|---|---|---|---|---|---|
| UI Anatomy · `uianatomy.dev` | library-agnostic component anatomy；**41** canonical components | 41 YAML；`/api/components.json`；单组件 JSON；公开 HTTP MCP；GitHub | 仓库未见 LICENSE。可核对事实与链接，不应整库复制 YAML、原文或 SVG，除非取得授权 | Core component、anatomy slots、Designer/Dev/Bridge；与 APG、Open UI、Gallery 高重合 | [API](https://uianatomy.dev/api/components.json) · [Integrate](https://uianatomy.dev/integrate) · [GitHub](https://github.com/DominikPieper/uianatomy) |
| NameThatUI · `namethatui.com` | “不知道它叫什么”视觉词典；**76** term pages = Web 44 + macOS 32 | 首页/ sitemap 深链；描述式搜索；无公开 API/MCP/官方源码 | 未见开放许可。只保存名称、事实和链接；定义、示例与演示独立创作 | Web/macOS component、interaction、effect；平台同义词和 Web/macOS 重复风险高 | [首页](https://namethatui.com/) · [Sitemap](https://namethatui.com/sitemap.xml) · [Methodology](https://namethatui.com/methodology) |
| UI Terms · `uiterms.com` | 可交互 UI patterns/components 视觉词典；**64** terms，另有 163 alias strings | 页面内嵌 `application/json[data-search-index]`；10 animation / 25 component / 9 interaction / 9 layout / 11 pattern | 未见开放许可；可作命名发现和独立验证，不复制文案/演示 | 五轴补洞、别名；与 NameThatUI、animations.dev、core component 大量重合 | [首页与内嵌索引](https://uiterms.com/) |
| The Component Gallery · `component.gallery` | 聚合生产设计系统的 component reference；**60** component pages | 官方 `/components/{slug}`；GitHub 前端；完整 Airtable 数据库未公开 | 仓库未见 LICENSE，完整数据库 private。只作外链、命名对照和独立研究 | Core component 与 design-system crosswalk；与 UI Anatomy/APG 重合极高 | [Components](https://component.gallery/components/) · [GitHub](https://github.com/inbn/component-gallery) |
| UI Guideline · `uiguideline.com` | 基于 20 个设计系统研究 naming/anatomy/props；current catalog **38**；sitemap 可达 base routes **45** | current index 38；商业 Spec Pack 提供 PDF/MD/YAML/JSON；MCP 目前为 free preview | Full Library $149；未见开放再分发许可。不得搬运付费 anatomy、props、图像或文案 | Core component、属性/anatomy 竞品基准；38 与 45 是两个口径，不能相加 | [Components](https://www.uiguideline.com/components) · [Pricing](https://www.uiguideline.com/pricing) · [MCP preview](https://mcp.uiguideline.com/) |
| WAI-ARIA APG · `w3.org` | 权威无障碍交互模式；当前 **30** pattern directories | 官方 GitHub `content/patterns/*`；106 pattern/example HTML 文件 | W3C Software and Document License；按条款归因 | Component behavior、keyboard、focus、ARIA；不是视觉样式库，与 UI Anatomy/Open UI 重合 | [Patterns](https://www.w3.org/WAI/ARIA/apg/patterns/) · [Source](https://github.com/w3c/aria-practices/tree/main/content/patterns) · [License](https://github.com/w3c/aria-practices/blob/main/LICENSE.md) |
| Open UI · `open-ui.org` | 为 Web UI 建立开放标准和跨设计系统研究；**31** normalized research topics（41 research files） | MDX research/explainer/proposal source；GitHub | W3C Software and Document License / CLA | Naming、parts、behavior、platform convergence；proposal、research file 与 topic 不可多算 | [Source topics](https://github.com/openui/open-ui/tree/main/site/src/pages/components) · [License](https://github.com/openui/open-ui/blob/main/LICENSE.md) |
| GOV.UK Design System · `design-system.service.gov.uk` | 政务服务组件与 task patterns；**72** source directories = 37 components + 35 patterns | 每项 `index.md` frontmatter + examples；GitHub；本轮已生成 72 raw records | MIT 代码；若使用 Crown 内容/品牌资产需另查内容许可 | Core components + service/task patterns；5 个 archived pattern 无 description，使用其一手首段摘要并保留 archived 证据 | [Components source](https://github.com/alphagov/govuk-design-system/tree/main/src/components) · [Patterns source](https://github.com/alphagov/govuk-design-system/tree/main/src/patterns) · [License](https://github.com/alphagov/govuk-design-system/blob/main/LICENSE) |

七个核心组件来源（不含 UI Terms 的跨轴记录、只取 GOV.UK 37 components）有 313 条，精确 slug 并集 183。核心 UI 首发 100 有数量余量，但必须人工处理 `Dialog/Modal/Sheet/Drawer`、`Select/Dropdown/Combobox`、`Badge/Chip/Pill/Tag` 等语义簇。

### B. 动效词典、可视化与 React Native marketplace（474 个来源记录）

| 来源 | 官方定位与可复核数量 | 数据结构 / 接口 | 许可与使用边界 | 贡献 / 去重风险 | 一手证据 |
|---|---|---|---|---|---|
| animations.dev Vocabulary | Web/UI motion reverse-lookup glossary；**91** terms，12 类 | 公开页面；作者官方 MIT skill 完整镜像 91 条 | 官方 skill MIT；保留版权/许可通知 | Canonical motion、interaction、performance、principles；本轮 raw 导入 91 | [Vocabulary](https://animations.dev/vocabulary) · [MIT skill](https://github.com/emilkowalski/skills/blob/main/skills/animation-vocabulary/SKILL.md) · [License](https://github.com/emilkowalski/skills/blob/main/LICENSE) |
| The Vocabulary of Motion · `motion-vocabulary.vercel.app` | Framer Motion 交互展示；**96 displayed records** = 84 live + 12 reference | 静态 Next bundle；无稳定 JSON/API | 未见开放许可；页面明确 adapted from animations.dev | 仅作 specimen/交互参考，`derivativeCount = 0` | [Site](https://motion-vocabulary.vercel.app/) · [Canonical source](https://animations.dev/vocabulary) |
| Vikingz Motion Lab · `vocabulary.vikingz.me` | GSAP 可重播互动 glossary；**91** | 页面公开 12 类计数，无公开 API/source link | 未见开放许可；明确 adapted from animations.dev | 仅提供 GSAP 呈现思路，新增词数 0 | [Site](https://vocabulary.vikingz.me/) |
| Moro · `moro.davidumoru.me` | 91-term vocabulary + **15** interactive principle pages（15 是 91 的子集） | 公开源码与页面，无 LICENSE | 仓库未见 LICENSE；明确 adapted from Emil/animations.dev | 仅作调参/原则展示，新增词数 0 | [Vocabulary](https://moro.davidumoru.me/vocabulary) · [Principles](https://moro.davidumoru.me/) · [GitHub](https://github.com/davidumoru/moro) |
| easings.net | Easing Functions Cheat Sheet；**30** curve records | 页面 anchors + GitHub | GPL-3.0；不要把代码直接混入非 GPL 项目。名称/数学事实从标准或独立实现重建 | 细化 easing family；和 animations.dev 7 个 easing 概念部分重合 | [Site](https://easings.net/) · [GitHub](https://github.com/ai/easings.net) · [License](https://github.com/ai/easings.net/blob/master/LICENSE) |
| Adobe Animate Visual Glossary | Animate 工具、时间、元素、tween 视觉词典；**19** links = 3/5/8/3 | 4 个官方图文表格，无 API | Adobe Help 专有内容；只作术语与外链证据，不搬图文 | Animate binding、timeline/tween terminology；与 AE/Web motion 有同义关系 | [Visual glossary](https://helpx.adobe.com/animate/using/visual-glossary.html) |
| Motionary · `motionary.dev` | Premium React Native animation drops；当前 **56**，不是 500+ | `/animations/{slug}` index 56；sitemap 同为 56；商业资产 | 付费 marketplace 许可逐资产适用；不可复制源码、缩略图或付费描述 | React Native/Expo specimen 与场景；每个 drop 常为多现象复合 recipe，不能一 drop 一 canonical term | [Home](https://motionary.dev/) · [56-item index](https://motionary.dev/animations) · [Sitemap](https://motionary.dev/sitemap.xml) · [License](https://motionary.dev/license) |

animations.dev、motion-vocabulary、Vikingz、Moro 必须共用 `provenanceClusterId = animations-dev-vocabulary`；四个入口只贡献 91 个 canonical source records。

### C. 跨媒介术语与 Medium Binding（628 个来源记录）

| 来源 | 可复核数量 / 结构 | 接口 | 许可边界 | 适合贡献 / 去重风险 | 一手证据 |
|---|---|---|---|---|---|
| Figma Plugin API typings | 选定 14 个稳定 vocabulary 共 **82 namespaced options**；跨 namespace 去重后 73 literals | 官方 `plugin-api.d.ts`；GitHub | MIT | Figma binding：blend/text/constraint/overlay/transition/easing/auto-layout；同字面在不同 namespace 不等义 | [Transition docs](https://developers.figma.com/docs/plugins/api/Transition/) · [Typings](https://github.com/figma/plugin-typings/blob/master/plugin-api.d.ts) |
| PowerPoint MsoAnimEffect | **149** unique animation constants | Microsoft Learn + VBA Docs GitHub | VBA Docs CC BY 4.0，需归因 | PPT animation binding；大量方向、motion path、emphasis variants，必须折叠到 phenomenon | [EffectType](https://learn.microsoft.com/en-us/office/vba/api/powerpoint.effect.effecttype) · [Docs repo](https://github.com/MicrosoftDocs/VBA-Docs) |
| After Effects effect list | **290** effect rows，22 category tables（312 rows - 22 headers） | 官方 HTML table，无公开 JSON | Adobe Help 专有内容 | AE effect binding / discovery；obsolete、third-party、技术 filter 不能直接变 canonical term | [Effect list](https://helpx.adobe.com/after-effects/desktop/apply-effects-and-animation-presets/effects-and-animation-presets/effect-list.html) |
| Photoshop filter reference | **99** named reference records | 官方 Help page | Adobe Help 专有内容 | Material/color/form/image effect bindings；组合标题仍是一条 source record | [Filter reference](https://helpx.adobe.com/photoshop/using/filter-effects-reference.html) |
| Keynote animation docs | 官方文档显式命名下限 **8**：Opacity/Rotate/Scale/Move/Bounce/Flip/Push/Magic Move | 支持文档，无完整机器 inventory | Apple Support 专有内容 | Keynote binding；这是 documented lower bound，不声称完整 catalog | [Object animation](https://support.apple.com/guide/keynote/animate-objects-on-a-slide-tanf96d92cb6/mac) · [Transitions](https://support.apple.com/guide/keynote/add-transitions-between-slides-tanff5ae749e/mac) |

这些目录的正确角色主要是 Medium Binding 和候选发现，不是把 628 个产品命令原样变成 628 个 Design Phenomenon。举例：Figma Smart Animate、PowerPoint Morph、Keynote Magic Move、Web View Transitions 应挂在同一个 medium-independent phenomenon 下。

### D. AI / Agent GUI taxonomy（457 个来源记录）

| 来源 | 官方定位与可复核数 | 机器接口 | 许可 | 适合贡献 / 去重风险 | 一手证据 |
|---|---|---|---|---|---|
| AI Interaction Atlas | AI experiences shared language；**194** = 25 AI tasks + 24 human actions + 22 system ops + 47 data types + 38 constraints + 38 touchpoints | 权威 TS data；npm package；GitHub | Apache-2.0 | 只作 `coverageDimensions`；官方明确 Not a UI framework。全部 `countedAtlas:false`，直接视觉图鉴贡献为 0 | [Atlas](https://ai-interaction.com/atlas) · [Data](https://github.com/quietloudlab/ai-interaction-atlas/tree/main/data) · [License](https://github.com/quietloudlab/ai-interaction-atlas/blob/main/LICENSE) |
| assistant-ui | AI agent frontend library；**120 element docs** + 19 primitive API docs = 139 documentation records；registry 96，其中 2 helper，94 registry candidates | MDX source / GitHub；本轮只导入 120 elements | MIT | Agent GUI parts/states/recipes；120、19、96 是不同投影，不能相加声称独立组件 | [Elements](https://www.assistant-ui.com/elements) · [120 source docs](https://github.com/assistant-ui/assistant-ui/tree/main/apps/docs/content/elements) · [License](https://github.com/assistant-ui/assistant-ui/blob/main/LICENSE) |
| Vercel AI Elements | AI-native shadcn registry；live **48**，repo main **49**（`question` 尚未发布、live 404） | `/api/registry/{component}` JSON；GitHub | Apache-2.0 | Agent GUI components；首发计 live 48，repo ahead 1 单独监控 | [Live catalog](https://elements.ai-sdk.dev/components) · [Registry example](https://elements.ai-sdk.dev/api/registry/prompt-input) · [GitHub](https://github.com/vercel/ai-elements) |
| Prompt Kit | AI UI primitives/recipes；**23 registry items** = 21 UI + 2 composed recipes | first-party `/c/registry.json` | MIT | 21 atomic candidates；chatbot/tool-calling recipes 不在组成部分已收录后重复计数 | [Registry JSON](https://www.prompt-kit.com/c/registry.json) · [GitHub](https://github.com/ibelick/prompt-kit) |
| Loquix | framework-agnostic AI chat Web Components；**53** custom elements / 10 categories | `custom-elements.json` manifest | MIT | Agent GUI component/state/trust surfaces；React wrappers/stories/define files不加数 | [Site](https://loquix.dev/) · [Manifest](https://github.com/loquix-dev/loquix/blob/main/packages/core/custom-elements.json) · [License](https://github.com/loquix-dev/loquix/blob/main/LICENSE) |

assistant-ui 120、AI Elements live 48、Prompt Kit 21 UI、Loquix 53 共 242 条，精确 slug 并集 219；最终语义同义仍明显多于字符串重复。AI GUI 首发 80 有余量，但要人工处理 `Prompt input/Composer/Chat composer`、`Tool/Tool call/Tool list`、`Reasoning/Chain of thought`、`Approval/Permission/Confirmation` 等簇。

## 实际交付的数据集

### 八个 counted snapshots + 一个 coverage snapshot

- [`animations-dev.raw.json`](../../demo/data/visual-atlas-sources/animations-dev.raw.json)：91，revision `d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7`
- [`assistant-ui.raw.json`](../../demo/data/visual-atlas-sources/assistant-ui.raw.json)：120，revision `9c90252f0d36aa109510ef15aacee88f04337b60`
- [`govuk-design-system.raw.json`](../../demo/data/visual-atlas-sources/govuk-design-system.raw.json)：72，revision `71b861c1ad296b7d7e109eb2146628ed65212d21`
- [`ai-elements.raw.json`](../../demo/data/visual-atlas-sources/ai-elements.raw.json)：live 48，revision `6a9d5b1822ffb10bba4bd97175f01edd7d8651cd`
- [`prompt-kit.raw.json`](../../demo/data/visual-atlas-sources/prompt-kit.raw.json)：21 个 `registry:ui`，revision `de80375967400aa0c6ebab9d3ba4f9258ab79fcc`
- [`loquix.raw.json`](../../demo/data/visual-atlas-sources/loquix.raw.json)：53，revision `db423a9864feed441604a1f7b9fa1a043e46c572`
- [`wai-aria-apg.raw.json`](../../demo/data/visual-atlas-sources/wai-aria-apg.raw.json)：30，revision `7e4034b262bc0d25332e330d8a582aaf34113829`
- [`open-ui.raw.json`](../../demo/data/visual-atlas-sources/open-ui.raw.json)：31，revision `93671dc549f262b1a33e7c221caddfcd75e8f126`
- [`ai-interaction-atlas.coverage.raw.json`](../../demo/data/visual-atlas-sources/ai-interaction-atlas.coverage.raw.json)：194 coverage records，revision `34e2f276afd1884a571ab66da2080848e6031172`，全部不计数

### 合并结果

[`demo/src/data/visual-atlas.json`](../../demo/src/data/visual-atlas.json) 当前统计：

| 维度 | 数量 |
|---|---:|
| Counted source records | 466 |
| Counted unique Visual Atlas Records | 419 |
| Exact duplicate source records merged | 47 |
| Atlas Candidates | 417 |
| Published Lexeme exact matches | 2 |
| Counted source evidence objects | 466 |
| Non-counted coverage dimensions | 194；AI Atlas direct counted contribution = 0 |
| 机器翻译缓存 | 1,274，失败 0 |
| Axis: component / motion / interaction / aesthetic | 293 / 72 / 44 / 10 |
| Type: component / phenomenon / pattern | 293 / 76 / 50 |

精确去重合并了 47 个 source records，主要来自 assistant-ui、AI Elements、Prompt Kit、Loquix、GOV.UK、APG 与 Open UI 的同名组件。相近但不同名的记录仍以 candidate 保留；用模糊相似度自动合并 `Tooltip` 与 `Popover`、`Spinner` 与 `Progress` 会破坏行为差异。下一阶段仍应输出人工 dedupe ledger，而不是在导入时强并。

## 建议的 400 条构成

| 首发桶 | 目标 | 建议预审池 | 主要来源 | 验收要点 |
|---|---:|---:|---|---|
| Core UI component / anatomy | 100 | 125 | UI Anatomy、APG、Open UI、Gallery、NameThatUI、GOV.UK | 一个 canonical component；slots/states 不独立凑数 |
| Motion / interaction phenomenon | 95 | 115 | animations.dev 91、easings、Material/Apple/Adobe bindings | 派生展示不加数；跨桶词只选一个 primary |
| Form / Material / Color / Type visual effect | 65 | 85 | Figma、Photoshop、AE、UI Terms styles | 产品命令先归并成 medium-independent phenomenon；专有来源 link-only |
| AI / Agent GUI parts and states | 80 | 105 | assistant-ui、AI Elements、Prompt Kit、Loquix | 排除 helper、wrapper、recipe；通用 primitive 与 AI-specific 分层 |
| Task / feedback / trust / system pattern | 60 | 85 | GOV.UK patterns、AI UI trust surfaces、Atlas coverage dimensions | 每条必须有可观察 GUI 和交互契约；Atlas metadata 本身不算 Published Lexeme |
| **合计** | **400** | **515** |  | 允许第五桶不足时从已有一手 GUI 证据的桶补位，不用后台术语凑数 |

## 采集与构建接口

当前脚本入口：

```bash
cd demo
npm run atlas:collect    # 刷新八个 counted sources + AI Atlas coverage；计数漂移即失败
npm run atlas:translate  # 更新中文机器翻译缓存，保留 exact original
npm run atlas:build      # 完全离线、确定性合并到 src/data/visual-atlas.json
npm run atlas:test       # 数据契约、来源证据、计数、候选/正式边界
```

采集器内部契约可概括为：

```ts
interface SourceAdapter {
  id: string
  verifiedCount: number
  collect(revision: string): Promise<RawAtlasRecord[]>
}

interface RawAtlasRecord {
  sourceRecordId: string
  termEn: string
  sourceDefinition: string
  sourceCategory: string
  sourceUrl: string
  sourcePath: string
  sourceMetadata: unknown
}
```

每个 raw snapshot 记录官方 repository revision；只有 counted 466 与 coverage 194 都在内存中通过固定计数和字段校验后才写盘。编译器完全离线，按 exact key 合并 counted `sourceEvidence`，并只在 `termEn + axis` 与本地现有 lexeme 精确匹配时填 `localLexemeId` 与 `status: published`。AI Atlas 只进入 `coverageDimensions`，不会经过 counted candidate 映射。

下一步采集扩展应优先增加 permissive/attribution 许可且有结构数据的 adapter：WAI-ARIA APG、Open UI、Figma typings、AI Elements registry、Prompt Kit registry、Loquix manifest。无许可或商业来源只进入 discovery/link-only registry，不进入原文/图片/代码批量导入。

## 验证证据

- `npm run atlas:test`：18/18 通过。
- `node --test tests/*.test.mjs`：100/100 通过。
- `npm run build`：Vite production build 成功。
- `npm run lint`：退出 0；新增 atlas 脚本无警告，输出仅含项目既有 `demos.jsx` / `variants.jsx` Fast Refresh 等警告。
- 连续两次 `npm run atlas:build` 产物 SHA-256 完全一致：`3153C3DCBCE459C029195B8263316CA6EAB67AF58A44E0CCA32A88F3337DA846`。
- AI Atlas counted gate：`AiAtlasCountedEntries = 0`、`CoverageDimensions = 194`、`CoverageCountedViolations = 0`。
- 最终 counted gate：419 unique IDs、466 source evidence、47 exact merges、417 candidates、2 published matches。

## 最终判断

- 400 个 counted Visual Atlas Record：已超过，当前为 419。
- 400 个 Published Lexeme：尚未完成，本轮没有把 candidate 冒充 finished demo。
- “场景解剖图”方向：保留，并应优先用 assistant-ui 的 Agent GUI 部件和 AI Atlas touchpoints 建第一张空间索引；Atlas tasks/constraints 只做下钻和 coverage，不直接计发布词。
- 竞品风险：原材料大量存在，但尚未发现将 Scene Anatomy、canonical naming、动态识别、跨媒介 binding 与机器端点串成一体的已核实产品。
- 数据护城河：不是来源条数，而是后续积累的真实口语→候选→视觉确认映射、人工 dedupe ledger、跨媒介 binding 与可执行 specimen。
