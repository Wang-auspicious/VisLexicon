# WP-H 编辑内容补写 · 依据与遗留问题

本文件是 WP-H 的可核查记录：每条 `editorial.takeawayZh` 从哪个字段推导、每个
`curation.atlasTerms[]` 的依据是什么、以及补写过程中发现但**没有**擅自修改的数据问题。

- 改动范围：`content-samples/approved-v3/*.json`（12 个，纯新增字段）与新建
  `frontend/src/data/benches.js`。
- 既有事实字段（`name` / `descriptionZh` / `facts` / `official.checkedAt` /
  `classification` / `facets` / `pages`）**一个字都没有改**，本文第 4 节只列出存疑项。
- 所有站 ↔ 术语标注都带 `curation.atlasTermsStatus: "editor-draft"`。这是编辑草稿，
  没有第二人复核，前台必须如实显示为「编辑草稿」，不得渲染成已核验结论。

---

## 1. takeawayZh 逐条来源

规则：≤ 28 字，一句「用户从这里拿走什么」，只能从该 JSON 已有内容推导，
不得是 `descriptionZh` 的机械截断（已用脚本断言：没有一条是 `descriptionZh` 的前缀）。

| entryId | takeawayZh（字数） | 推导自哪些已有字段 |
|---|---|---|
| `shadcn-ui` | 把组件源码装进项目，之后由你自己维护和改（20） | `descriptionZh`「通过 registry 和 CLI 将组件源码装入项目，由使用者直接修改并组成自己的组件库」 |
| `21st-dev` | 社区组件连提示词一起拿走，免费复制有次数上限（22） | `descriptionZh`「可预览后复制 AI 提示词或用 CLI 安装。浏览免费但复制次数受限」；`facts[pricing].evidence`「首页说明浏览免费且每日有有限免费复制」 |
| `uiverse` | 单个元素的源码可复制或导出，站内统一 MIT 授权（25） | `descriptionZh`「给出实时效果和可复制的 HTML/CSS，并可导出 React……站内 UI 元素统一采用 MIT 许可」；`facts[license]` |
| `magic-ui` | 营销页面要的动效组件，复制后用 CLI 装进项目（24） | `descriptionZh`「面向营销页面的动效 UI 库……文档可实时预览、复制并用 shadcn CLI 安装」 |
| `origin-ui` | 复制走的 Base UI 组件，仍在早期，接口可能变（26） | `descriptionZh`「基于 Base UI……提供可复制到项目中自行维护的基础组件；目前仍处早期开发阶段，可能随 Base UI 演进产生破坏性变更」 |
| `hover-dev` | 动效区块可复制，但许可禁止转售或做同类站（20） | `descriptionZh`「可先预览再复制源码……受禁止单独转售或搭建竞品的自定义许可约束」；`facts[license].evidence` |
| `entry-chakra-ui-react` | 用令牌、配方和主题把组件拼成自己的设计系统（21） | `descriptionZh`「提供可安装组件……以及令牌、配方和主题能力，适合搭建设计系统」；`classification.reasons[0]` |
| `entry-ant-design-react` | 中后台要的整套组件、主题与国际化，规范一并给（22） | `descriptionZh`「面向企业级中后台……提供可安装的 React/TypeScript 组件、主题定制、国际化、设计规范」 |
| `entry-shadcn-studio-blocks` | 整段场景区块连提示词取走，但许可受限不是开源（22） | `descriptionZh`「按营销、后台、电商与数据表等场景提供可预览、复制、下载或用 CLI 安装的 React 区块，并附提示词；……均受限制性许可约束，不能按纯开源组件库理解」 |
| `laws-of-ux` | 查一条心理学定律的定义、要点和案例，不能商用（22） | `descriptionZh`「提供定义、要点与真实产品案例；……官方许可限制商业再利用与改编」；`pages[proof].selectionRationale`「给出定义、要点、案例和进一步阅读」 |
| `a11y-project` | 拿一份可逐项执行的无障碍检查清单去审页面（20） | `descriptionZh`「可逐项执行的 WCAG 检查……适合设计师和开发者学习、审计并改进网页」；`facets.actions` 含 `audit` |
| `ecomm-design` | 按平台筛真实商店页，看陈列与转化，只能参考（21） | `descriptionZh`「按平台、标签和价格筛选真实商店页面……适合研究商品陈列、品牌叙事与转化路径，只提供公开参考和外链」 |

字数按 Unicode code point 计（含标点与英文缩写），最长 26。

---

## 2. atlasTerms 的依据

**术语准入**：`termId` 必须已被某个舞台 manifest 认领（脚本断言 `termId → stageId`
与 `src/stages/*/manifest.js` 完全一致）。`evidenceUrl` 必须是该 JSON 已有的
`pages[].sourceUrl` / `facts[].sourceUrl` / `classification.reasons[].evidenceUrl`
之一（脚本断言，无一新造）。

**证据分三档**，`note` 里已分别写清，复核时按档次决定复查成本：

- **A 档 · 语料反向引用（最强）**：`entry-chakra-ui-react`。`visual-atlas.json` 里
  有 33 条术语的 `sourceEvidence[].url` 直接指向 `chakra-ui.com/docs/components/*`，
  其中 31 条已被舞台认领。这是 12 站中**唯一**能自动成立的域名（复现了方案 §2.2
  「域名反查覆盖率 1/12」的实测结论）。我从中选了跨四个舞台的四条。
- **B 档 · 证据页自身就是那条术语**：`uiverse` 的 Loader 单项页、`entry-ant-design-react`
  的 Table 实例页、`origin-ui` 的 Calendar 日期选择器页、`a11y-project` 的 Checklist
  跳转链接 / 页内锚点 / 回到顶部。这几条在 JSON 的 `selectionRationale` 或
  `shot.alt` 里已有文字支持。
- **C 档 · 证据页的目录里列着该术语**：其余各站。依据是该 JSON 已收录的目录页
  （如 `ui.shadcn.com/docs/components`、`magicui.design/docs/components`、
  `shadcnstudio.com/blocks`、`21st.dev/community/components`、`hover.dev` 首页分类、
  `coss.com/ui/docs` 侧栏）当前列出的条目名。**这一档是我 2026-09-05 复看目录页得到的，
  不在原 bundle 的 `checkedAt`（2026-09-01 / 09-02）覆盖范围内**，所以整体标为
  `editor-draft`；复核人应把这些条目名与目录页再对一次。

| entryId | 术语数 | 舞台分布 | 备注 |
|---|---|---|---|
| `shadcn-ui` | 4 | form-anatomy / overlay-layers / state-loading / data-display | Command → 命令面板是名称映射，非同名 |
| `21st-dev` | 3 | agent-composer ×3 | 依据是 AI chats 一族的组件构成（提示词输入框 / 流式输出 / 模型选择器） |
| `uiverse` | 4 | state-loading / form-anatomy ×2 / overlay-layers | Loader 一条是 B 档 |
| `magic-ui` | 4 | text-reveal ×3 / state-loading | Animated Shiny Text → 文字流光、Morphing Text → 文字形变属名称映射 |
| `origin-ui` | 4 | form-anatomy ×3 / state-loading | Datepicker 一条是 B 档 |
| `hover-dev` | 4 | surface-transition ×2 / state-loading / navigation | 全部来自首页组件分类名 |
| `entry-chakra-ui-react` | 4 | form-anatomy / overlay-layers / state-loading / data-display | 全部 A 档 |
| `entry-ant-design-react` | 4 | data-display / form-anatomy / state-loading / navigation | Table 一条是 B 档 |
| `entry-shadcn-studio-blocks` | 4 | data-display ×2 / state-loading / form-anatomy | 全部来自 Blocks 总览的区块名 |
| `a11y-project` | 3 | navigation ×3 | 全部 B 档，三条都指向同一个带锚点的证据 URL |
| `laws-of-ux` | **0** | — | 见下 |
| `ecomm-design` | **0** | — | 见下 |

**覆盖率：12 站中 10 站 ≥ 2 条**（验收线是 ≥ 8）。

### 2.1 两个站为什么贴不上（不硬贴）

- **`laws-of-ux`**：交付物是 `standard` / `glossary` / `case-screenshot`，讲的是
  希克定律这类心理学启发式。图鉴当前 220 条术语全部是界面部件、动效现象与手势 API，
  与「定律」不在同一个本体层。把 Hick's Law 硬贴到某个组件上就是造关系。
- **`ecomm-design`**：交付物是整页商店截图与外链，`contentOrganization` 是
  `case-gallery`。它展示的是**整站**而不是某个部件；JSON 里的三页证据（About、
  首页案例墙、模板页）都没有把任何一个部件单独拎出来。要给它挂术语，需要先对
  某个具体案例页做部件级标注，那是新的核验工作，不是本包能顺手做的。

这两条空数组是结论，不是欠账占位——前台应显示为「这个站还没有标注术语」，
而不是隐藏该段落。

---

## 3. 两张对照台（`frontend/src/data/benches.js`）

| 台 id | 决定句（占位形态） | 成员数 | 共同轴 | atlasStageId |
|---|---|---|---|---|
| `take-components-into-your-project` | 要把组件装进自己的项目，这 {n} 个站差在哪 | 9 | `license` / `action` / `checkedAt` | `form-anatomy` |
| `references-you-can-quote` | 先把话说对：{n} 个可以引用的参考站 | 3 | `deliverable` / `license` / `checkedAt` | `null` |

- 决定句里的成员数是占位 `{n}`，由 `benchTitle(bench)` 在渲染时用
  `entryIds.length` 代入；文案里没有任何写死的统计数字。
- 台 1 的 `atlasStageId` 指向 `form-anatomy`，理由是这九个条目的
  `curation.atlasTerms` 落在表单解剖台的条数最多（可由数据复算）。这是一个
  编辑判断，不是算出来的唯一解，换台不影响数据正确性。
- 台 2 的 `atlasStageId` 是 `null`：这三个站没有集中落在任何一台上，
  按方案的诚实性要求宁可留空，前台不显示「这一族的术语在图鉴」这个链接点（L2）。
- `validateBenches(benches, siteIndex)` 在成员数 < 3、`entryId` 不存在、
  台数 > `min(6, floor(n / 4))`、台 id 重复、成员重复、共同轴为空时抛错。
  12 条语料下上限 3 台，实做 2 台。

---

## 4. 发现的数据问题（本包**没有**修改，需要重新核验才能动）

1. **`origin-ui.json` 的身份已经不是 Origin UI。** 文件名与 `entryId` / `entityId`
   仍是 `origin-ui`，但 `editorial.name` 是「Coss UI」，`official.finalUrl` 是
   `https://coss.com/ui`，`facts[organization]` 是 Cal.com, Inc.，仓库是
   `cosscom/coss`。也就是说 Origin UI 已并入 Coss，条目内容已迁移而标识符没迁。
   这会直接影响路由 `#/site/origin-ui`、截图目录 `/shots/origin-ui/` 与
   Agent 端点里的 id。改 id 是跨包的破坏性变更（WP-A 的投影、WP-D 的
   `benches.js` 成员、WP-E 的深链都要跟），**不在本包内擅自改**；建议由
   WP-A 决定是保留旧 id 并在详情页显示「原 Origin UI」，还是做一次带
   重定向的 id 迁移。本包的 `benches.js` 暂用 `origin-ui`。

2. **`a11y-project.json` 的 proof 页描述与页面现状可能已不符。**
   `pages[proof].selectionRationale` 写「Checklist 画面显示真实的 Content 检查项、
   WCAG 3.1.5 引用和**可勾选控制**」。我 2026-09-05 复看该页时，能确认跳转链接、
   页内锚点分享链接与 Back to top，但**没能确认页面上存在真正可勾选的 checkbox 控件**
   （也可能是抓取管线丢了表单元素）。这是我把该站的术语标注选成
   skip-link / scroll-anchor / scroll-button 而**不是** checkbox 的原因。
   需要人工开页复核；`checkedAt` 与该段文字都不该由本包改。

3. **`a11y-project.json` 与 `ecomm-design.json` 的 `editorial.pricing` 是
   「Pricing not stated in reviewed facts」**——一句英文的元说明，不是价格事实，
   而且这两条的 `facts[]` 里确实没有 `pricing` 字段。卡片上的权利/价格微标
   若直接渲染这串英文会很难看。建议 WP-A 在投影时把它规范成 `unknown`
   并由前台显示「未知」（方案 §4.2 已规定 unknown 显示为「未知」）。本包不改。

4. **`licenses` 轴的取值粒度不一致。** `facets.licenses` 是受控值
   （`MIT` / `custom` / `Apache-2.0` / `unknown`），但 `facts[license].value`
   是长句（如 `21st Marketplace Terms (per-author underlying licenses)`、
   `MIT terms with Commons Clause restriction for the public repository; separate
   proprietary licenses for paid resources`）。对照台的 `license` 轴必须读
   `facets.licenses`（短值）而不是 `facts[license].value`，否则一格里会塞进一整段。
   另外 `laws-of-ux` 的 `facts[license].value` 直接就是字符串 `"custom"`，
   与其他条目的写法不同——它没有给出许可全名，`evidence` 只说「官网 Info 页
   明确给出全站许可」但没写是哪一个。这条值得回访补全。

5. **`a11y-project` 的 `licenses: ["Apache-2.0"]` 只覆盖站点源码，不覆盖内容。**
   `facts[license].evidence` 写的是「站点源码许可按官方仓库文件记录」。卡片上
   若把 Apache-2.0 当成「清单内容可自由使用」会误导。建议前台在许可微标旁
   保留 `facts[license].evidence` 的可点来源（方案 L5 已要求）。本包不改。

6. **`entry-chakra-ui-react` 与 `entry-ant-design-react` 的 `facts[].evidence`
   末尾拼了「；独立复核来源：<url>；<url>」**，是把复核来源塞进了自由文本，
   没有结构化成字段。批次 01/02 的条目有这个尾巴，批次
   `legacy-curation-v2-*` 的六条没有。这是投影层需要处理的不一致（要么解析出来
   做成来源列表，要么原样显示）。本包不改。

---

## 5. 跨包请求

- **`frontend/src/data/benches.js` 的所有权与 WP-D 重叠。** 方案 §9.1 把该文件
  列在 WP-D 的新建列，本包的任务书也把它指派给 WP-H。我按任务书建了这个文件，
  内容是数据与校验函数，不含任何 JSX 与样式。**请 WP-D 直接 import，不要重建**；
  若需要新增字段（例如每台的排序或折叠默认值），在 WP-D 的报告里提出。
- **新增数据字段需要 WP-A 在投影里透传**：`editorial.takeawayZh`（字符串）与
  `curation`（`{ atlasTerms: [{ stageId, termId, evidenceUrl, note }],
  atlasTermsStatus: 'editor-draft' }`）。`site-index.json` 至少要带 `takeawayZh`
  （卡片用），`site/<entryId>.json` 要带完整 `curation`（详情页 L3 用）。
  `atlasTermsStatus` 必须一并透传，否则前台无法把它显示为「编辑草稿」。
- **L3 的渲染约定**：chip 文案应使用舞台 manifest 的 `termZhFix`（若有）
  或语料 `termZh`，链接 `#/atlas/<stageId>/<termId>`，`note` 作为 title / 展开说明。
  分组前请加一行「以下为编辑草稿，未经第二人复核」。
