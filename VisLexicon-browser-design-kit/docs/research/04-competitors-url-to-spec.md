# URL / 截图 → 设计语言、Design tokens、DESIGN.md、提示词：竞品与生态调研

调研执行日期：2026-09-05。除特别注明外，所有页面均于当日访问。

---

## 结论先行

1. 这个赛道在 2026 年 4 月之后从「小众脚本」变成了**有开放标准的红海**：Google Labs 于 2026-04-21 把 Stitch 的 `DESIGN.md` 开源为 Apache-2.0 草案规范，一夜之间统一了输出格式。
2. 「URL → DESIGN.md」本身已经是**免费商品**：至少 4 个网页服务与 2 个 Chrome 扩展在做，其中一个扩展装机 40,000，另一个网页服务 $9/月无限次。VisLexicon 再做一遍通用转换器，没有任何位置。
3. Refero Styles 是这批里信息节奏最好的，但它**不是 URL 工具**——它是 2,000+ 条预先拆解好的策展库，用户不能提交 URL；且它的每条规则**不回链任何证据**、不区分实测与推断、不覆盖移动端、不允许用户修正。
4. 「JSON 为事实源 / 派生视图 / 每条规则可回链证据 / 用户可逐条修正」四条合起来，**市面上没有任何一家做到**。最接近的是 MIT 开源的 `jpoindexter/design-md-extractor`（做到约 6 成：evidence.json 是事实源、有频次置信度、三档视口、真实触发交互态），但它没有回链到具体页面区域，也没有任何用户修正界面。
5. 版权姿态两极：Refero 用条款禁止抓取/再分发/训练（保护自己的库），而 URL 工具几乎全部**不写免责**。唯一写清楚的是 designmd.cc：「测量得到的 token 作结构参考，不要复制品牌标识，遵守来源站条款」。这句话应当被 VisLexicon 采纳并做得更严。
6. VisLexicon 已经拥有整条赛道最贵的那一半：`frontend/src/lib/mining-extractor/` 里的 Tier1（Project Wallace css-analyzer）+ Tier2（三档视口浏览器探针），带**逐度量 provenance、冲突记录、supported / refuted / undecidable 三态**。这套「undecidable ≠ 没有」的纪律，市面上没有第二家有。
7. 因此判断：**通用「URL → DESIGN.md 工作台」应该继续压到第三阶段（同意 v2）；但「半自动测量」作为编辑部内部工具必须提到第一阶段（不同意 v2 把整件事一起推后）。** 理由是它降低第一阶段成本，而不是增加范围。
8. 产品位置：不该是独立顶栏频道。应为「内部编辑工具 → 站点详情页里的『实测事实』区块 → 第三阶段才开放任意 URL 分析动作」三步。
9. 输出 schema 应以 W3C DTCG（稳定版 2025.10）为 token 层，把证据、状态、修正记录挂在 `$extensions` 命名空间下，DESIGN.md / Tailwind / CSS 变量 / 提示词全部为派生视图。
10. 一个需要立刻修的诚实性缺口：`components/CodeExportModal.jsx` 的页脚写死了「已自动对齐生产级无障碍规范与 Tailwind 4.0 语法」，而代码里并没有任何无障碍校验；tokens 里的 `unitSystem: "8pt-grid"`、`colorSpace: "OKLCH / sRGB"` 也是硬编码常量，不是测量结果。这与项目自己的内容纪律直接冲突。

---

## 一、调研方法与证据边界

本轮全部采用公开可访问页面（WebSearch + WebFetch），不登录、不抓取受限内容、不复制任何竞品文案。以下几类事实我明确标注为**未核实**：

- GitHub 的 star / fork 数：本会话没有 GitHub API 权限（`api.github.com` 返回 "GitHub access to this repository is not enabled for this session"），星数只能来自网页渲染结果，可能被页面上的其他榜单数字污染。凡涉及星数，我都标注「页面显示，未经 API 复核」。特别地，`VoltAgent/awesome-design-md` 的抓取结果给出了一个「101,000+ stars」的数字，我判断**极可能是误读**（同组织另有超大 awesome 仓库），故不采用。
- Refero Styles 首页说「2,000+ AI-readable design systems」，而其 `/ai-agents/tailwind-design-tokens` 子页说「24 token-friendly styles selected from 203 available styles」。两个数字**互相矛盾或指不同集合**，我不采用任何单一数字作为该站规模的结论。
- 各家定价页多为客户端渲染，`refero.design/pricing` 抓取只返回 meta，没有正文；Refero 具体价格**未核实**，只采用其官方文档中明确写出的「MCP 需要 Pro / Team / Lifetime 付费计划」。

---

## 二、逐个工具档案

### A. 策展型「设计语言库」——Refero Styles

**定位。** 首页标语是「High-quality DESIGN.md examples for AI agents」，自述为「leading product websites 的 AI 可读设计系统」的集合。
（https://styles.refero.design/ ，2026-09-05）

**输入。** 关键事实：**用户不能提交 URL**。它是策展库，浏览既有条目，不是分析工具。这一点简报 4.3 描述得偏乐观了——它的详情页确实精彩，但它的产品形态与「URL → spec」工具不是一回事。

**输出格式。** 详情页末尾提供 **CSS custom properties 与 Tailwind v4 theme** 两种导出；同时提供 Refero MCP 供 Agent 直接检索。DESIGN.md 可免费浏览与复制。没有见到公开的 DTCG / JSON token 导出。
（https://styles.refero.design/style/c4e125b6-e3a3-4509-b06f-f0169216a394 ；https://styles.refero.design/ai-agents/tailwind-design-tokens ，2026-09-05）

**详情页信息节奏（实测一条样本条目的段落顺序）：**
1. 风格隐喻一句话 + 白话铺陈；
2. 颜色（3 色，每色带角色说明）；
3. 字体（2 款字体，含字重、字号、fallback、比例 1.2 的音阶，19px–104px）；
4. 间距与形状（基础单位 4px、最大宽 1200px、区块间距 59px、三档圆角 5/9/9999px）；
5. Do / Don't（7 条 do、3 条 don't）；
6. 组件（9 条具体规格）；
7. 表面、投影、图像调性、布局；
8. Agent Prompt Guide（5 条示例提示词 + 4 个相似品牌）；
9. 导出格式；
10. 相关风格。

简报 4.3 对这条路径的概括是准确的。

**事实与推断是否区分：不区分。** 抓取核对结果明确：规则没有引用任何截图或 URL，全部以叙述句呈现（例如「导航是浮在内容上的胶囊」），读者无法判断 59px 的区块间距是量出来的还是概括出来的。

**证据回链：无。** 这正是简报 4.3 自己发现的那个缺口，本轮独立核实成立。

**多页面合并：无。** 是单一风格快照，不覆盖站内多页或流程。

**用户逐条修正：无。** 纯展示，没有编辑入口。

**移动端与交互态：几乎不覆盖。** 只见到一条 focus 态（输入框边框加粗 2px），hover / active / 移动端断点均缺席。

**商业模式。** 免费浏览 DESIGN.md；**MCP 需要 Pro / Team / Lifetime 付费计划**，每个授权用户每月上限 8,000 次 MCP 工具调用，不结转。MCP 端点 `https://api.refero.design/mcp`，支持 Bearer token 或 OAuth，提供 Sites & Apps / Styles / Screens / Flows / Images 五层检索。
（https://doc.refero.design/mcp/getting-started ，2026-09-05）

**版权姿态（最严格的一家）。** 使用条款（最后更新 2026-08-03）禁止：以抓取/爬取/自动化方式系统性提取内容；用平台内容训练、微调、评测机器学习模型或建数据集；构建竞争性产品、数据集或检索索引；转售、再分发、再授权。第三方截图、Logo、商标归各自权利人，收录不代表背书。允许：把学到的洞察用于自己的产品设计工作，放进演示、moodboard、Figma 与内部设计文档。侵权投诉走 support@refero.design，不强制 DMCA 格式。
（https://doc.refero.design/legal/terms-of-use ，2026-09-05）

**最值得学的两点：** ① 「隐喻 → 白话 → 数据 → Do/Don't → Agent 导出」这条从普通人到 Agent 的单向漏斗；② 把 MCP 当成产品的第二个前端，而不是附赠品。
**最明显缺陷：** 全部判断无证据、无修正、无移动端。它卖的是「品味」，不是「事实」——这恰好是 VisLexicon 可以打的那一枪。

---

### B. DESIGN.md 生态：格式已被标准化

#### B1. Google Labs `design.md` 规范（决定性事件）

2026-04-21，Google 在官方博客宣布把 Stitch 的 DESIGN.md **草案规范开源**，仓库 `github.com/google-labs-code/design.md`，**Apache-2.0**，标注 alpha。
（https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-design-md/ ；https://github.com/google-labs-code/design.md ，2026-09-05）

格式是**双层混合**：YAML front matter 承载机器可读 token（`colors` / `typography` / `rounded` / `spacing` / `components`，组件项映射 `backgroundColor` / `textColor` / `typography` / `rounded` / `padding`），markdown 正文承载人类可读的理由。八个规范章节（均为可选）：Overview、Colors、Typography、Layout、Elevation & Depth、Shapes、Components、Do's and Don'ts。规范内置到 **Tailwind v3 JSON config / Tailwind v4 CSS theme / W3C DTCG** 的导出。

覆盖情况：**交互态**通过「组件变体」表达（hover / active / pressed 作为独立组件条目）；**响应式未涉及**；**溯源 / 证据完全未涉及**。（仓库页面显示 26.3k stars，未经 API 复核。）

**对 VisLexicon 的意义：** 输出格式的仗已经打完了，不要自创 Markdown 模板。要打的仗是「这份 DESIGN.md 凭什么可信」——而规范里恰好缺的就是 provenance。

#### B2. Vercel 的 design.md 实践（方法论层面最值得抄的一家）

2026-08-31 的工程博客说明 Vercel 用 design.md 作为「任何 coding agent 都能加载的单一公开文件」来生成符合品牌的页面。系统由三部分组成：design.md（关于框架、结构、构图、文案、发布标准的散文式指引）+ 公开样式表（有界的 CSS class 与 token）+ **评测循环**（确定性检查抓机械性失败，人评主观质量）。文中说明 design.md 的每一行都是通过 7 个固定场景、200+ 次生成回归「挣来的」。
（https://vercel.com/blog/how-our-agents-build-on-brand-pages-with-design-md ，2026-09-05）

**这条是本轮最重要的方法论发现**，且它直接为 VisLexicon 现有的 `Tools.jsx` ΔE 收敛循环背书：确定性测量 + 固定场景 + 人做终审，正是 Vercel 的做法。

#### B3. `Paidax01/web-to-design-md`（简报里那个参考仓库）

页面显示 383 stars / 34 forks（未经 API 复核），**只有 1 个 commit，无 License**（README 的发布说明自己写着「应当补一个 license」）。主要语言 JavaScript（`.mjs`）。
（https://github.com/Paidax01/web-to-design-md ，2026-09-05）

流程：用 `agent-browser` 读真实网页，注入 evaluate 脚本采集 DOM 结构、computed styles、CSS 变量、样式表规则、可见文本、交互态；**明确不以截图优先**，截图只作 fallback 校验。输出 `design.md`（Stitch 格式）+ `design-preview.html`，含明暗两套主题。

简报 11 对它的判断成立：思路对（先证据后结论、样式比截图可靠、事实与推断应分开），但无 License / 无测试 / 无稳定接口，只能研究不能复制。**补充一条简报没写的：它只有一个 commit，意味着它更像一次性投稿而非在维护的项目，把它当作「参考仓库」的分量应当下调。**

#### B4. `jpoindexter/design-md-extractor`（本轮最接近 VisLexicon 论点的一家）

**MIT**，页面显示 21 stars / 1 fork（未经 API 复核），TypeScript 92.3%，尚无正式 release。
（https://github.com/jpoindexter/design-md-extractor ，2026-09-05）

- 抽取范围：colors、gradients、typography、spacing、radii、shadows、surfaces、components、layout、imagery、motion、interaction states。
- **三档视口**（desktop / tablet / mobile）；用 Playwright **真实触发** `:hover` `:focus` `:active` `:disabled`，而不是只解析样式表。
- **多页面**：自动发现站内页面，默认上限 5 页。
- 输出：`DESIGN.md`、**`evidence.json`（schema 校验过的结构化证据，自称 source of truth）**、`tokens.css`、`tailwind-theme.js`、`design-tokens.json`（W3C 格式）、`ai-prompt.txt`、`preview.html`、截图、以及 GUI 里的 `bundle.zip`。
- **置信度**：high / low，基于频次——出现频繁为 high，罕见为 low。
- **无版权免责声明**。

**最值得学的两点：** ① evidence.json 作为事实源、其余全为派生产物，这就是简报 11.1 的架构，已经有人实现了；② 频次置信度是一个便宜且诚实的近似。
**明显缺陷：** 证据只到「哪个 token 出现多少次」，**不回链到具体页面与画面区域**；没有任何用户修正界面；置信度只有两档且纯频次，无法表达「这条是推断出来的」。

#### B5. 商业化 URL 服务三家

| 产品 | 输入 | 输出 | 价格 | 关键差异 |
|---|---|---|---|---|
| **design-extractor.com** | 单个 URL（静态站 / SPA / SSR） | DESIGN.md（YAML token + markdown 理由）、Tailwind v4 config、CSS 变量、DTCG tokens | freemium，新用户送启动额度 | 章节沿用 Google 八节；未说明多页与方法论；页面无免责 |
| **designmd.cc** | 单个 URL | DESIGN.md、tokens JSON、live preview；约 12 秒 | 免费 5 次/日/IP，24 小时滚动重置，更多需联系 | **读 live DOM + CSSOM**，取 CSS 变量、computed styles、响应式断点、hover / focus 态，明说「不靠截图或猜」；有 benchmarks 页（Stripe / Linear / GitHub / Vercel / Notion / Airbnb） |
| **getdesignsystem.io** | URL 或浏览器扩展就地分析 | DESIGN.md、Tailwind v4、CSS 变量、DTCG tokens | 免费 5 次/日免注册；Pro **$9/月**无限 | 扩展端「100% 本地、不上传」；有 75+ 预分析目录 |

（三站均 2026-09-05 访问：https://www.design-extractor.com/ ；https://designmd.cc/ ；https://getdesignsystem.io/ ）

**designmd.cc 的免责是本轮找到的唯一一条正面样本：**「测量得到的 token 作为结构参考；不要复制品牌标识（logo、商标、品牌专属图像），并遵守各来源站的服务条款。」

#### B6. 两个 Chrome 扩展（市场规模的真实读数）

- **DESIGN.md Style Extractor（TypeUI，Bergside SRL，罗马尼亚）**：**40,000 用户**，5.0 星（13 个评分），v0.4.0，更新于 **2026-04-18**。分析页面 CSS 变量，生成 DESIGN.md / SKILL.md，面向 Google Stitch / Claude / Cursor。免费，声明不收集数据。开源仓库 `bergside/design-md-chrome`。
  （https://chromewebstore.google.com/detail/designmd-style-extractor/ogpdnchdjiibhobphelbbkemnnemkfma ，2026-09-05）
- **DESIGN.md extractor by getdesignsystem.io**：**74 用户**，v1.0.1，更新于 **2026-07-19**。输出 DESIGN.md / SKILL.md / JSON，提取 hex 色值、圆角、间距、字体阶梯、按钮/卡片/输入框的 CSS 片段。全本地运行，不需要账号。
  （https://chromewebstore.google.com/detail/designmd-extractor-by-get/kgekenpkhajkhnbmmckccfkhdjbackek ，2026-09-05）

**读数：** 40,000 vs 74，相差近三个数量级。说明这个需求真实存在，但**赢家通吃且发布窗口在 2026 年上半年已经关闭**。晚一年上线的通用转换器拿不到量。

#### B7. 开源 CLI / Agent Skill 两家

- **`designlang.app`**（MIT，全开源，CLI 免费无需注册）：headless 浏览器爬 live 站，输出 11+ 种格式——W3C DTCG（primitive / semantic / composite 三层）、Tailwind config、CSS 变量、Figma Variables JSON、shadcn/ui theme、React/Vue/Svelte theme、iOS SwiftUI extension、Android Compose `Theme.kt`、Flutter ThemeData、WordPress block theme、可印刷 brand-book PDF；带 **stdio MCP server**（Claude Code / Cursor / Windsurf）。自我定位为 design-extractor.com 的开源替代。未说明事实/推断区分、多页范围、免责。
  （https://www.designlang.app/ ，2026-09-05）
- **`arvindrk/extract-design-system`**（MIT）：skills-first，`npx skills add arvindrk/extract-design-system` 安装，另带 MCP。管线是 `raw.json` → `normalized.json` → `tokens.json`（W3C）+ `tokens.css`。**明确承认只做单页**，动态站可能残缺；结果自称「starter tokens，不是权威设计决策，采用前需复核」。安全声明写得好：「目标网站是不受信任的第三方输入」，建议只用于你愿意在运行时抓取和分析的公开站点。
  （https://github.com/arvindrk/extract-design-system ，2026-09-05）

#### B8. `VoltAgent/awesome-design-md`（内容侧的对手）

**MIT**，收录 **73 份** DESIGN.md，覆盖 Claude / OpenAI / Mistral / Cursor / Vercel / Raycast / MongoDB / Supabase / Figma / Framer / Stripe / Coinbase / Airbnb / Nike / Spotify / The Verge / Tesla / Ferrari，以及 Dell 1996、Nintendo 2001 这类怀旧站。每条含 `DESIGN.md` + `preview.html` + `preview-dark.html`。遵循 Stitch 九节格式（在八节基础上多出 Responsive Behavior 与 Agent Prompt Guide）。用户可以「请求」某个站点的 DESIGN.md。
（https://github.com/VoltAgent/awesome-design-md ，2026-09-05）

**免责原文（值得逐字参考其姿态，不照抄）：** 该仓库是从公开网站提取的设计系统文档的策展集合；所有 DESIGN.md 按「as is」提供、不作担保；提取出的 design token 代表的是**公开可见的 CSS 值**；不主张对任何站点的视觉标识拥有所有权。

**这是对 VisLexicon 策展定位的直接竞争提醒：** 一个 MIT 的、社区可提交的、73 条起步的免费 DESIGN.md 目录，正在占据「我要一个知名站的设计语言」这个入口。VisLexicon 的差异化不能是「我也有目录」，只能是「我的每一条都能查证」。

---

### C. 传统 CSS / token 测量工具（VisLexicon 的既有地基）

- **Project Wallace**：输入可以是 URL 也可以是粘贴的 CSS；输出完整 CSS 分析、design token 审计（颜色、字体、阴影、间距）、代码质量分、自定义属性、cascade layer 可视化、specificity、覆盖率与 diff。独立小工具「No signup. No paywall」。有 `/get-css` 的 CSS scraper。
  （https://www.projectwallace.com/ ；https://www.projectwallace.com/oss ，2026-09-05）
- **`@projectwallace/css-analyzer`**：**MIT**，**v9.9.0，发布于 2026-06-02**，150+ 指标。**只吃 CSS 字符串，自己不抓 URL。**
  （https://github.com/projectwallace/css-analyzer ，2026-09-05）
  → 这正是 VisLexicon `lib/mining-extractor/css-metrics.js` 头注释里写的输入来源，版本仍在活跃维护，地基是稳的。
- **CSS Stats**（`cssstats/cssstats`）：**MIT**，未归档，页面显示 2.8k stars / 698 commits（未经 API 复核）。可视化 CSS 统计：色板、字体、间距、specificity 图、design tokens。宿主站 cssstats.com 声称可分析任意网站的 CSS，未见导出格式与条款说明。
  （https://cssstats.com/ ；https://github.com/cssstats/cssstats ，2026-09-05）
- **Superposition**（Firstversionist B.V.，受 Adobe Fund for Design 与 Polypane 支持）：免费桌面应用（macOS / Windows / Linux），从站点 URL 提取颜色、字体、间距等 token，导出 CSS / Scss / JavaScript，以及 **Figma 与 Adobe XD**；Sketch / Swift / Android「即将」；付费的 design system generator 标为 Soon。
  （https://superposition.design/ ，2026-09-05）
  **推断（非事实）：** 导出目标里仍以 Adobe XD 为主、生成器长期停留在「Soon」、安装包被系统提示「下载次数不多」，这三点合起来指向该项目已基本停更。请勿把它当作活跃竞品，但它是「桌面本地分析」这条路线的先例。

### D. 浏览器扩展类（点选取样，不产出设计语言）

- **CSS Peeper**：点选元素看样式，色板可一键导出，另有字体、素材、对比度检查。页面自称 500,000+ 用户、4.6 分/350+ 评价，页脚 © 2025；有免费版与付费页。
  （https://csspeeper.com/ ，2026-09-05）
- **VisBug**（GoogleChromeLabs，Adam Argyle）：**Apache-2.0**，「给设计师的 FireBug」，点选编辑页面、hover inspect 看样式与无障碍信息、遍历 DOM、模拟延迟/媒体查询/屏幕尺寸。**没有 token 导出**；页面上最新 tagged release 是 0.3.0，日期 **2020-11-05**。
  （https://github.com/GoogleChromeLabs/ProjectVisBug ，2026-09-05）
- **Fonts Ninja / ColorZilla 一类**：本轮未取得可靠一手页面证据，**未核实**，不写入结论。它们的共同形态是单维度取样器（只管字体或只管颜色），不构成「设计语言」输出，对本课题只有「入口极轻」这一条启发。

**这一类的共同启发：** 它们赢在「零安装成本 + 就地」。TypeUI 的 40,000 用户说明，当分析发生在用户正在看的那一页时，转化率远高于「回到某个网站粘贴 URL」。这直接影响第七节的产品位置判断。

### E. Token 标准与管线

- **W3C Design Tokens Community Group 格式**：**首个稳定版 2025.10，发布于 2025-10-28**，支持多品牌主题、现代色彩空间（Display P3、Oklch、CSS Color Module 4）、通过继承与别名表达 token 关系、跨平台代码生成（iOS / Android / Web / Flutter）；参考实现包括 Style Dictionary、Tokens Studio、Terrazzo。
  （https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/ ，2026-09-05）
- **当前草案**（预览稿，2026-07-30 发布，明确写「不要按此版本实现」）：文件后缀 `.tokens` / `.tokens.json`，MIME `application/design-tokens+json`；每个 token 必有 `$value`，另有 `$type` / `$description` / `$extensions`（反向域名命名的厂商扩展）/ `$deprecated`；基础类型 color、dimension（px / rem）、fontFamily、fontWeight（1–1000 或具名）、duration（ms / s）、cubicBezier、number；复合类型 shadow、border、transition、gradient、typography、strokeStyle；分组不带语义；别名两种写法——`{group.token}` 花括号指向整个 token，`$ref: "#/path"`（RFC 6901 JSON Pointer）可精确到属性级；另有 `$extends` 继承与循环引用检测。
  （https://www.designtokens.org/tr/drafts/format/ ，2026-09-05）
- **Style Dictionary**：把 token 导出到 iOS / Android / CSS / JS / HTML / Sketch / 文档等，自述「forward-compatible with DTCG spec」；文档并存 v3 与 v4 及迁移指南。
  （https://styledictionary.com/ ，2026-09-05）
- **Tokens Studio**：Figma 插件 300,000 用户；定位「设计系统平台」，强调开放标准、无供应商锁定，走 Style Dictionary；**不做 URL 提取**。
  （https://tokens.studio/ ，2026-09-05）

**关键结论：** `$extensions`（反向域名）与属性级 `$ref` 这两个机制，恰好能承载 VisLexicon 需要的「每个 token 挂证据」与「规则引用到 token 的某个属性」，**不需要自造格式**。

### F. 设计→代码 / Figma 侧（相关但不同赛道）

- **html.to.design（divriots）**：URL 或粘贴 HTML → 完全可编辑的 Figma 设计，带图层、auto-layout、**含 hover 态变体的组件**、多视口（桌面/平板/手机）与明暗主题导入。免费版每月 10 次导入，Pro 无限 + 高清图 + 批量导入，另有团队版。页面**未提及生成 Figma variables 或 design tokens**；**没有任何关于导入第三方网站的版权说明**，反而把「benchmarking competitors」写成卖点。
  （https://html.to.design/home/ ，2026-09-05）
- **Anima**（2026 现状）：输入支持 Figma、**URL（可整站多页克隆）**、图片/截图、文本提示、以及从 Claude 等导入的 code artifact；输出 HTML（clean CSS / Tailwind / inline）或 React（TS/JS）。原文卖点里明确写着「导入设计系统组件、**从任意 URL 匹配品牌**，或使用 **Design.md** 文件保持每次生成的视觉一致」。
  （https://www.animaapp.com/ ，2026-09-05）
  → Anima 把 DESIGN.md 当作输入契约，这是格式标准化正在生效的第二个证据。
- **Locofy / Relume**：本轮只取到二手比较文章，**未核实其是否支持 URL → design tokens**。就已知形态而言，Locofy 是 Figma→代码、Relume 是 sitemap/wireframe 生成，二者都不产出「设计语言文档」，与本课题弱相关，不进入对照矩阵。
- **`abi/screenshot-to-code`**：**MIT**，页面显示 76.8k stars（未经 API 复核）。截图 / mockup / Figma / 录屏 → HTML+Tailwind、HTML+CSS、React+Tailwind、Vue+Tailwind、Bootstrap、Ionic+Tailwind。**仓库未提及提取 design tokens 或设计系统**。
  （https://github.com/abi/screenshot-to-code ，2026-09-05）
  → 这条路线的定位是「一次性复刻这一屏」，不是「抽象出可复用规则」。VisLexicon 要的是后者，不要被前者的成功指标带偏。

### G. 灵感馆是否提供 tokens：不提供

- **Godly**：`https://godly.website/` 于 2026-09-05 **302 跳转到 `https://recent.design/`**。recent.design 是分类灵感流（Web、Interface、Branding、Product、Typography、Motion、Illustration、3D、Editorial、Print、Packaging），另有 Websites / OG Images / App Screenshots / App Icons / Tools / Skills / Jobs 等栏目，条目仅显示海报与作者归属，**未见结构化颜色/字体元数据，未见 token 或 CSS 导出**。
- **Awwwards**：本轮检索只找到「字体合集」「排版类获奖站」这类编辑合集，**没有找到任何 per-site token 导出**的证据。

**结论：** 「灵感馆 + 可导出 tokens」这个组合目前是空的。Refero 是唯一试图跨过去的，但它跨过去的方式是人工/自动拆解成风格文档，而不是把测量结果给你。**这是 VisLexicon 现有资产（策展 + mining-extractor）唯一真正的空白地带。**

### H. 一个新的对手类型：Agent-first 设计研究库

**Lazyweb**（其自身的对比营销页，claims 需打折看）：自述 281k+ 真实 app 屏，提供 app tree、「Design.md-style app files」、屏幕版本历史；MCP 免费接入 Codex / Claude Code / Cursor / Antigravity；个人 $39/月，团队 $99/月（5 席）。**不做 URL 分析**，覆盖 iOS app 与营销页，Web app 流程尚未支持。
（https://www.lazyweb.com/vs/refero ，2026-09-05；该页为竞品自述，所有数字均为厂商声明）

---

## 三、对照矩阵

「事实/推断分离」「证据回链」「逐条修正」三列是本课题的核心，故单列。

| 工具 | 输入 | 主输出 | Token 标准 | 事实/推断分离 | 证据回链 | 多页合并 | 逐条修正 | 移动端 | 交互态 | 版权免责 | 商业模式 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Refero Styles | 无（策展库） | 风格文档 + DESIGN.md | CSS vars / Tailwind v4 | 否 | 无 | 单快照 | 否 | 否 | 仅 focus 一例 | 条款极严（保护自身库） | 免费浏览；MCP 需付费，8000 调用/月 |
| Google `design.md` 规范 | —（格式） | DESIGN.md（YAML+MD） | 可导 DTCG / Tailwind v3+v4 | 否 | 无 | 未涉及 | — | 未涉及 | 组件变体表达 | Apache-2.0（对格式本身） | 开源 |
| Vercel design.md | —（自家实践） | DESIGN.md + 样式表 + eval loop | 自家 token | 部分（eval 分机械/主观） | 无 | — | 人评回归 | 未说明 | 未说明 | 自家品牌，不涉他人 | 内部实践 |
| Paidax01/web-to-design-md | URL（agent-browser） | design.md + preview.html | 无标准 token | 声称区分 | 无 | 分别观察后合并（人工判断） | 否 | 弱 | 采集但依赖 Agent 补 | **无 License** | 研究原型 |
| jpoindexter/design-md-extractor | URL（Playwright） | **evidence.json** + DESIGN.md + 7 种派生 | **DTCG** | **是（频次置信 high/low）** | 到 token 频次，**不到页面区域** | **是（默认 5 页）** | 否 | **三档视口** | **真实触发 hover/focus/active/disabled** | 无 | MIT 开源 |
| designmd.cc | URL | DESIGN.md + tokens JSON + preview | 未明示 | 声称「读 DOM 不猜」 | 无 | 未说明 | 否 | 测断点 | hover/focus | **有（最佳样本）** | 免费 5/日/IP |
| design-extractor.com | URL | DESIGN.md + Tailwind v4 + CSS vars + DTCG | **DTCG** | 未说明 | 无 | 未说明 | 否 | 未说明 | 未说明 | 页面无 | freemium |
| getdesignsystem.io | URL / 扩展就地 | DESIGN.md + Tailwind v4 + CSS vars + DTCG | **DTCG** | 未说明 | 无 | 未说明 | 否 | 未说明 | 未说明 | 页面无 | 免费 5/日；Pro $9/月 |
| designlang.app | URL（headless 爬） | 11+ 格式 + MCP | **DTCG 三层** | 未说明 | 无 | 「爬站」但范围未明 | 否 | 未说明 | 未说明 | 无 | MIT，CLI 免费 |
| arvindrk/extract-design-system | URL（单页） | raw→normalized→tokens.json/css | **W3C 兼容** | 承认是 starter tokens | 无 | **明确只单页** | 否 | 否 | 否 | **有安全声明** | MIT + skills.sh |
| VoltAgent/awesome-design-md | —（73 条策展） | DESIGN.md + 明暗 preview | 无 | 否 | 无 | — | 社区提 issue | 有 Responsive 章节 | 未说明 | **有（可参考姿态）** | MIT 社区 |
| Project Wallace | URL / CSS | 150+ 指标 + token 审计 | 自有 | **是（纯测量，不下风格结论）** | 到 CSS 规则层 | 单表 | 否 | 媒体查询统计 | 否 | 未见 | 免费工具 + 平台 |
| CSS Stats | URL / CSS | 统计可视化 | 无 | 是（纯统计） | 弱 | 单表 | 否 | 否 | 否 | 未见 | MIT |
| Superposition | URL | CSS/Scss/JS/Figma/XD | 无 | 否 | 无 | 未说明 | 否 | 未说明 | 否 | 无 | 免费桌面版（疑似停更） |
| CSS Peeper | 点选元素 | 色板/字体/素材导出 | 无 | 是（就是取样） | 就地即证据 | 无 | — | 否 | 否 | 未见 | 免费 + 付费 |
| VisBug | 点选元素 | 无导出 | 无 | 是 | 就地 | 无 | — | 可模拟尺寸 | 可切状态 | Apache-2.0 | 开源（低维护） |
| html.to.design | URL / HTML | Figma 图层 + 组件变体 | 未提供 token | 否 | 无 | 多视口 + 明暗 | Figma 里手改 | **是** | **hover 变体** | **无，反把 benchmarking 竞品做卖点** | 免费 10/月，Pro 无限 |
| Anima | Figma/URL/图片/提示/代码 | HTML / React (+Tailwind) | 消费 Design.md | 否 | 无 | **整站多页克隆** | 编辑器里改 | 是 | 未说明 | 未见 | 订阅 |
| screenshot-to-code | 截图/录屏 | 6 种技术栈代码 | 无 | 否 | 无 | 单屏 | 改提示词 | 否 | 否 | 未见 | MIT |
| **VisLexicon 现有 mining-extractor** | URL（CSS + 三档视口探针） | metrics + provenance + 三态标签 | 尚无 token 层 | **三态（supported / refuted / undecidable）** | **逐度量 provenance + conflicts** | 尚未做跨页合并 | 尚无 UI | **三档视口内置** | 未覆盖 | 待定 | 非商业 |

---

## 四、四条标准的达成度：谁做到几成

四条标准（简报 11.1）：**① JSON 为事实源；② 其他格式为派生视图；③ 每条规则可回链证据；④ 用户可逐条修正。**

**没有任何一家四条全中。** 逐条说明：

**① JSON 事实源** — 做到的有：`jpoindexter/design-md-extractor`（evidence.json 明确自称 source of truth）、`arvindrk/extract-design-system`（raw→normalized→tokens 三段式）、designlang（DTCG 三层）。做不到的是所有以 Markdown 为中心的产品：Refero、design-extractor.com、awesome-design-md，它们的 Markdown 就是原件，token 是从文里挑出来的。Google 规范的 YAML front matter 是个折中——机器可读，但**结构表达力不足以承载证据**（没有为 provenance 留位置）。

**② 派生视图** — 这条是达成度最高的。DTCG 稳定版 + Style Dictionary + Terrazzo 让「一份 token 出多种格式」变成廉价的既有能力，designlang 一口气出 11 种就是证明。**这意味着「支持很多导出格式」不再是差异点，是入场券。** VisLexicon 不应该在这上面花时间证明自己。

**③ 证据回链** — **全行业为零。** 最好的一家（jpoindexter）只做到「这个 token 出现频次高/低」，回答不了「你说的 59px 区块间距是在哪一页、哪个区域量的」。Refero 完全不回链。Project Wallace 能回到 CSS 规则，但它不产出风格结论，所以谈不上「规则的证据」。**这是唯一一块完全空白的地，也是 VisLexicon 唯一可持续的差异化。**

**④ 逐条修正** — **全行业为零。** 所有工具的心智都是「一次生成、拿走」。Anima / html.to.design 让你在下游编辑器里改结果，但那是改产物，不是改判断——改完之后事实源没有变，下次重跑还是原样。Vercel 的 eval loop 有「人评 → 编码修正 → 重跑」的闭环，但那是一个团队的内部流程，不是产品功能。

**具体差距量化（对 VisLexicon 而言）：**

- ①：**已完成 ~70%**。`extractMetrics` 已经产出结构化 `metrics` + `provenance` + `conflicts` + 三态标签，比任何竞品的事实源都更诚实。缺的是把它升到 token 层（现在是 `zeroRadiusDeclarationShare` 这类分析指标，不是 `color.bg` 这类可导出 token）。
- ②：**已完成 ~15%**。`SpecPanel.jsx` 与 `CodeExportModal.jsx` 都在自造 JSON，且 token 值大量硬编码（`accent = '#6E56CF'`、`radius: '14px'`、`unitSystem: "8pt-grid"`），二者互不兼容，也不吃 mining-extractor 的输出。这是最该先修的接缝。
- ③：**已完成 ~40%，且方向独一份**。`provenance`（哪个 tier 测出来的）+ `conflicts`（声明层与渲染层分歧）已经是行业最强的溯源结构。缺的是**空间维度**：度量没有绑到「哪一页、哪个视口、哪个元素选择器、截图哪个矩形」。补上这一层，才叫回链证据。
- ④：**已完成 ~5%**。只有 `SpecPanel` 的移除按钮算是「修正」，且修正不回写事实源。

**一句话：市面上把简报 11.1 那四条做到最好的是 jpoindexter，约 6 成；VisLexicon 在 ① 和 ③ 上的地基比它更好，在 ② 和 ④ 上几乎是零。**

---

## 五、输出 schema 归纳与 VisLexicon 最小 schema 草案

### 5.1 行业共识 schema（八到九节）

把 Google 规范、Refero 详情页、awesome-design-md、design-extractor.com 四家对齐，共识字段是：

| 类目 | 各家的典型内容 | 共识度 |
|---|---|---|
| 气质 / Overview | 一句隐喻 + 几个形容词 + 白话概括 | 全部有 |
| 颜色角色 | hex + 语义角色（背景/前景/弱化文本/边框/强调）+ 用途说明 | 全部有 |
| 字体阶梯 | 字族 + fallback + 字重 + 尺寸序列 + 比例（如 1.2 minor third）+ 行高 | 全部有 |
| 间距 | 基础单位（4px / 8px）+ 区块间距 + 容器最大宽 | 全部有 |
| 圆角 | 2–4 档 + pill（9999px） | 全部有 |
| 阴影 / 层次 | 表面分级 + 是否使用投影 | 多数有 |
| 组件 | 按钮/卡片/输入框/导航/分隔线，每项一组样式 | 全部有 |
| 布局 | 网格、容器、对齐原则 | 多数有 |
| Do / Don't | 各 3–7 条 | 全部有 |
| 响应式 | 断点 | 仅少数（awesome-design-md、jpoindexter） |
| 交互态 | hover / focus / active / disabled | 仅少数（Google 用组件变体、jpoindexter 真实触发） |
| Agent Prompt Guide | 若干条示例提示词 | Refero、awesome-design-md |
| **证据 / 溯源** | — | **无人有** |

### 5.2 VisLexicon 最小 schema 草案

设计原则：**token 层严格走 DTCG（不自造），证据层走 `$extensions` 反向域名，规则层是独立数组并引用 token 的 JSON Pointer。** 这样任何 DTCG 工具（Style Dictionary、Terrazzo、Tokens Studio）能直接吃 token 层，忽略扩展；而 VisLexicon 自己吃全量。

顶层为一个包裹文件（不是纯 `.tokens.json`，因为要装证据与规则）：

```jsonc
{
  "vislexiconSpecVersion": "2.0",
  "specId": "vlx-spec-…",                    // 沿用 store.specId

  // ── 来源与取证条件（缺了这一节，整份文件不许发布）
  "source": {
    "siteId": "…",                            // 关联策展条目；纯 URL 分析时为 null
    "origin": "https://example.com",
    "pages": [
      { "pageId": "p1", "url": "https://example.com/",        "role": "home",    "capturedAt": "2026-09-05T…Z" },
      { "pageId": "p2", "url": "https://example.com/pricing", "role": "pricing", "capturedAt": "2026-09-05T…Z" }
    ],
    "viewports": [ {"label":"mobile","w":320,"h":720}, {"label":"tablet","w":768,"h":1024}, {"label":"desktop","w":1440,"h":900,"primary":true} ],
    "extractorVersion": "mining-extractor-v1",  // 直接复用 EXTRACTOR_VERSION
    "probeContractVersion": 1
  },

  // ── 证据台账：所有 evidence 引用都指向这里的 id
  "evidence": [
    {
      "id": "ev-001",
      "kind": "computed-style",               // computed-style | css-declaration | screenshot-region | editor-note
      "pageId": "p2", "viewport": "desktop",
      "selector": "main > section:nth-of-type(2) .card",
      "sampleCount": 34,                       // 采到几个元素
      "raw": { "borderRadius": "9px" },
      "tier": "dom",                           // 对应 mergeMetricTiers 的 provenance
      "screenshot": { "assetId": "shot-p2-desktop", "rect": [120, 880, 460, 300] }  // 可空
    }
  ],

  // ── 事实源 token 层：DTCG 稳定版语义，唯一可信数值来源
  "tokens": {
    "$schema": "https://tr.designtokens.org/format/",
    "color": {
      "bg":     { "$type": "color", "$value": "#0B0B0E",
                  "$description": "页面主背景",
                  "$extensions": { "dev.vislexicon.fact": {
                      "status": "measured",          // measured | inferred | user
                      "confidence": 0.94,
                      "coverage": 0.71,               // 该值覆盖的采样面积占比
                      "evidence": ["ev-004", "ev-011"],
                      "role": "background"            // 语义角色，独立于色值
                  } } },
      "accent": { "$type": "color", "$value": "#6E56CF",
                  "$extensions": { "dev.vislexicon.fact": {
                      "status": "inferred", "confidence": 0.62,
                      "rationale": "仅出现在 CTA 与链接 hover，占比 1.8%，判为强调色而非表面色",
                      "evidence": ["ev-007"] } } }
    },
    "dimension": {
      "radius": { "sm": { "$type": "dimension", "$value": {"value": 5,  "unit": "px"} },
                  "md": { "$type": "dimension", "$value": {"value": 9,  "unit": "px"} },
                  "pill":{ "$type": "dimension", "$value": {"value": 9999,"unit":"px"} } },
      "space":  { "base": { "$type": "dimension", "$value": {"value": 4, "unit": "px"} } }
    },
    "typography": {
      "body":    { "$type": "typography", "$value": {
                     "fontFamily": ["Inter","system-ui","sans-serif"],
                     "fontSize": {"value":16,"unit":"px"}, "fontWeight": 400,
                     "lineHeight": 1.6, "letterSpacing": {"value":0,"unit":"px"} } },
      "display": { "$type": "typography", "$value": { "…": "…" } }
    },
    "duration": { "base": { "$type": "duration", "$value": {"value": 200, "unit": "ms"} } },
    "cubicBezier": { "standard": { "$type": "cubicBezier", "$value": [0.34, 1.3, 0.5, 1] } }
  },

  // ── 规则层：人能读的判断，每条必须挂状态与证据
  "rules": [
    {
      "id": "r-012",
      "scope": "color",                        // color|type|space|shape|elevation|layout|component|motion|a11y
      "statement": "薄荷色只作氛围，不承担交互语义。",
      "status": "inferred",                    // measured | inferred | user
      "confidence": 0.55,
      "evidence": ["ev-007", "ev-019"],
      "derivedFrom": ["#/tokens/color/accent"],  // RFC 6901，DTCG 草案的 $ref 同款寻址
      "lexicon": ["lex:accent-restraint"],       // 回链图鉴词条，双向链在这里落地
      "userState": null                          // 见 corrections
    }
  ],

  // ── 覆盖度声明：没测到的必须自己说出来（对应 undecidableTags）
  "coverage": {
    "pagesAnalyzed": 2, "viewportsAnalyzed": ["mobile","tablet","desktop"],
    "statesAnalyzed": ["default"],             // 未测 hover/focus/active/disabled 就如实写
    "undecidable": [ { "tag": "craft.a11y-contrast-ok", "missingMetrics": ["contrastSamples"] } ],
    "conflicts": [ { "metric": "medianDuration", "css": 300, "dom": 200, "resolvedBy": "dom" } ]
  },

  // ── 用户修正：只追加，不覆盖，事实源永远保留原判
  "corrections": [
    { "targetId": "r-012", "action": "reject", "at": "2026-09-05T…Z", "note": "首页 hero 的按钮就是薄荷色" }
    // action: keep | reject | demote(降为「偶然」) | pin(升为「必须遵守」) | edit
  ],

  // ── 生成目标：决定派生哪些视图，不影响事实源
  "target": { "framework": "react", "style": "tailwind", "motion": "css", "pageType": "landing", "theme": "dark" },

  // ── 合规声明：随文件走，导出到任何格式都要带
  "legal": {
    "sourceTermsUrl": "https://example.com/terms",
    "notice": "本文件记录的是该站点公开可见的 CSS 计算值与版面测量结果，不包含也不授权其 logo、商标、文案、图像或品牌标识。",
    "exportScope": "structure-only"
  }
}
```

**派生视图（全部由上面这一份生成，互不为源）：**
`DESIGN.md`（Google 八节，YAML front matter 直接由 `tokens` 降维；每节末尾可选加「证据」脚注）→ `tailwind-theme.css`（v4 `@theme`）→ `tokens.css`（CSS 变量）→ `tokens.json`（剥掉 `$extensions` 的纯 DTCG，给 Style Dictionary）→ `prompt.txt`（按 `target` 定制）→ `spec.json`（现有 SpecPanel 格式，见下）。

**与现有代码的兼容映射（这是能不能落地的关键）：**

| 现有字段 | 现有位置 | 新 schema 位置 |
|---|---|---|
| `spec_version` / `spec_id` | SpecPanel | `vislexiconSpecVersion` / `specId` |
| `target.{framework,style,motion}` + `pageType` + `theme` | SpecPanel | `target`（原样保留，字段名不变） |
| `aesthetic[] / layout[] / interactions[]`（`lex:` 数组） | SpecPanel | `rules[].lexicon`，按 `scope` 归组即可重建 |
| `tokens.colors.{bg,accent}` / `tokens.radius` / `tokens.font.{heading,body}` | SpecPanel（**当前为硬编码**） | `tokens.color.*` / `tokens.dimension.radius.*` / `tokens.typography.*`；硬编码值改为 `status:"user"` 的默认 token |
| `acceptance[]` | SpecPanel | `rules[]` 中 `status:"user"` 且带 `derivedFrom` 的子集 |
| `conflict_warnings[]` | SpecPanel（CONFLICTS 常量） | 保留为独立的 `lintWarnings`，与 `coverage.conflicts`（测量冲突）**不要混为一个字段** |
| `designTokens` + `unitSystem/colorSpace/elevation/borderWidth` | CodeExportModal（**全为硬编码常量**） | 前者进 `tokens`；后四项要么删除，要么变成 `status:"inferred"` 的规则并附证据 |
| `metrics / provenance / conflicts` | mining-extractor `extractMetrics` | `evidence[].tier` / `coverage.conflicts`，并新增 `pageId`+`selector`+`rect` |
| `signalTags / refutedTags / undecidableTags` | mining-extractor | `rules[]`（supported→measured）、`coverage.undecidable`（**绝不合并为「没有」**） |

**最小可行子集（如果只做一版）：** `source` + `evidence` + `tokens`（只要 color / dimension.radius / dimension.space / typography 四类）+ `rules` + `coverage` + `legal`。`corrections` 与 `target` 可以后补，但 `coverage` 一天都不能省——它是这份文件与市面上任何一份 DESIGN.md 的唯一区别。

---

## 六、版权与合规

### 6.1 各家的实际姿态（三种）

**姿态一：严格保护自己的库，对第三方素材做免责。** Refero 是范本。条款（2026-08-03 更新）禁止抓取、再分发、建竞争数据集、训练/微调/评测模型；同时声明第三方截图、Logo、商标归各自权利人，收录不代表背书；明确允许用户把学到的洞察用于自己的产品设计。这是「我把别人的东西整理了，你可以学，但不能把我的整理搬走」的双层结构。

**姿态二：把「公开可见的 CSS 值」当作免责的支点。** awesome-design-md 的措辞：策展集合、as-is 无担保、提取的 token 代表的是**公开可见的 CSS 值**、不主张对任何站点的视觉标识拥有所有权。designmd.cc 更进一步给了行为指引：token 作结构参考，**不要复制品牌标识（logo / 商标 / 品牌专属图像）**，遵守来源站条款。superdesign 的 2026 指南把边界说得最清楚：提取间距节奏与字体阶梯用来指导自己的设计是可以的；复制 logo、文案、摄影、精确版面与品牌标识则越界；建议把提取到的东西**重新造型成明确属于你自己的样子**。

**姿态三：什么都不写。** design-extractor.com、getdesignsystem.io、designlang、jpoindexter、html.to.design 页面上均未见针对第三方站点分析的免责。html.to.design 甚至把「benchmarking competitors」写成卖点。这一类是行业风险敞口，不是可效仿对象。

另有一条**安全（而非版权）姿态**值得单独抄：`arvindrk/extract-design-system` 明确写「目标网站是不受信任的第三方输入」，建议只对你愿意在运行时抓取分析的公开站点使用。这提醒我们，URL 分析工具同时是一个 SSRF / 恶意内容摄入面。

### 6.2 法律与伦理的实际边界（我的判断，非法律意见）

三条线，从安全到危险：

1. **测量事实**（某元素的 computed `border-radius` 是 9px、正文 16px、断点在 768px）——这些是**功能性事实与数值**，不是有独创性的表达，本身不构成受著作权保护的客体。这条线上的输出（DTCG tokens、间距阶梯、字体尺寸序列）风险最低。
2. **对风格的自然语言描述**（「编辑式的克制，一个薄荷色作氛围」）——这是**你写的新表达**，著作权归你。但如果你逐字复制别家（如 Refero）写好的描述，那就是抄别人的文字，与原站无关，是抄二道贩子。**这是 VisLexicon 最需要守住的一条：可以独立生成自己的白话描述，绝不搬 Refero 的句子。**
3. **成品资产与标识**（logo、字体文件、图片、文案、完整版面）——受著作权与商标法保护，任何形式的提取与再分发都越界。「像素级复刻某站首页」这类 screenshot-to-code 的用法在这条线之外。

还有两条与著作权无关但同样有效的约束：**目标站的服务条款**（很多站禁止自动化访问）与 **robots.txt**；以及**登录态页面**——简报 11.2 已经写对了，登录态优先本地临时分析、不默认上传。

### 6.3 VisLexicon 应采用的姿态（建议逐条落到产品里）

1. **只导出「结构」，不导出「标识」。** 在 schema 层用 `legal.exportScope: "structure-only"` 固化，并在生成器里硬性排除：logo/图标资源、`content` 里的实际文案、背景图与摄影、字体文件本身（只留 font-family 名与 fallback，明确提示「你需要自行获得该字体的授权」）。这条比写一段免责有用得多，因为它是**代码强制的**。
2. **免责声明随文件走，不是只挂在页面上。** DESIGN.md、tokens.json、提示词三种导出都要带 `legal.notice`。市面上所有产品的免责都只在网页上，导出的文件是「裸」的——文件被复制到别人的仓库之后，边界信息就丢了。这是一个零成本的差异点。
3. **公开抓取遵守 robots.txt 与目标站条款，并把遵守结果写进 `coverage`。** 若某站 robots 禁止，就如实显示「该站不允许自动分析，本条目只有编辑人工核验的部分」，而不是静默降级。这与项目「undecidable ≠ 没有」的既有纪律完全一致。
4. **登录态与私有页面只在本机分析，不上传，不入库，不生成公开条目。**
5. **不建立「站点 → 完整设计文档」的可批量下载数据集。** 一旦 VisLexicon 提供整库 DESIGN.md 打包下载，它就变成了 Refero 条款里所说的「competing dataset」，同时也把自己置于被别人同样对待的位置。逐条目、按需生成是安全的产品形态。
6. **区分「策展条目的分析」与「任意 URL 的分析」两种法律面。** 前者是编辑部主动收录、已做人工核验、承担编辑责任；后者是用户自己粘贴的地址，产品应显示一句「你正在分析第三方网站，请确认你有权这样做并遵守该站条款」，并且**不默认把结果收进公开库**。
7. **在关于页写方法论与边界**，包括「我们测什么、不测什么、为什么某些条目只有部分数据」。这与 v2 建议的「关于页承载进度与方法论」是同一个动作。

---

## 七、对 VisLexicon 的判断

### 7.1 这个工具应该放在产品哪一层

**结论：不是独立频道。** 三层落位：

- **第一层（内部）：编辑部核验台。** 编辑做站点核验时，本来就要真进站、选关键页、截三张图。此时顺手跑一次三档视口测量，把 `metrics + provenance + conflicts + undecidable` 存进条目的 JSON。这是**零边际成本**的——与 v2 第 7 节「核验站点时顺手标注 2–3 个词条」是同一类杠杆，甚至更省人力（机器跑，人只复核）。
- **第二层（前台，站点详情页内）：「实测事实」区块。** 在浮窗/详情页里，紧挨着三张证据图，给一块可折叠的「我们量到了什么」：色板（带覆盖率）、字体阶梯、间距基数、圆角档位、三档视口是否验证过、对比度是否达标、哪些指标未能判定。每一条都可以点开看「在哪一页、哪个视口、采了多少个元素」。**这一块就是「会查证的视觉杂志」这句人设在页面上的物证**，也是全行业没有的东西。
- **第三层（第三阶段）：「分析这个站」/「分析任意 URL」动作。** 从第二层的区块里长出一个按钮：把这份事实源导出成 DESIGN.md / tokens / 提示词，或者换一个 URL 重新跑。此时才需要简报 11.1 描述的完整交互（目标选择、逐条修正、多格式派生）。

**为什么不做独立顶栏频道：** ① v2 已经论证四频道要砍到两个，再加回一个工具频道是自相矛盾；② TypeUI 扩展 40,000 用户 vs getdesignsystem 扩展 74 用户的对比说明，这类工具的胜负在「入口离用户正在看的东西有多近」，一个需要用户跳到某频道粘贴 URL 的页面在起跑线上就输了；③ VisLexicon 的入口优势天然在策展条目里——用户已经在看这个站了。

### 7.2 v2 说推到第三阶段，我同意一半

**同意的部分（并给出 v2 没有的证据）：面向用户的通用「URL → DESIGN.md 工作台」确实不该在 v1 做，而且理由比 v2 说的更硬。**

v2 的理由是「语料只有几十条时上 NL 搜索，是给空图书馆装检索台」——这个理由对 NL 搜索成立，但对 URL 工作台其实不成立（URL 工作台不依赖语料量）。真正的理由是市场：

- 格式已经被 Google 在 2026-04-21 标准化（Apache-2.0 开源规范），先发者的格式壁垒消失；
- 至少 4 个网页服务 + 2 个扩展 + 4 个开源仓库在做同一件事，其中免费额度普遍是「5 次/日」，付费只要 $9/月；
- 多格式导出已被 DTCG + Style Dictionary 商品化，designlang 一家就出 11 种格式且 MIT 免费；
- 装机量最大的那个扩展（40,000 用户）在 2026-04 就已更新到 0.4.0。

**所以：以「通用转换器」的身份晚进场，等于零。** 这一点比 v2 原本的理由更能说服人，也更能挡住后续「要不要提前做」的反复。

**不同意的部分：v2 把「测量能力」和「URL 工作台」当成同一件事一起推到第三阶段，这是错的，而且代价具体。**

证据与理由：

1. **昂贵的部分已经建好了，闲置在那里。** `frontend/src/lib/mining-extractor/` 已经有 Tier1（Project Wallace css-analyzer，MIT，v9.9.0 仍在维护）+ Tier2（三档视口注入式探针，contract 版本化）+ 合流层（逐度量 provenance、冲突记录、supported/refuted/undecidable 三态）+ 17 个信号标签（`motion.*` / `style.*` / `craft.*`）。把这套东西冻结两个阶段，等于把项目唯一的技术护城河放着长草，而竞品在这两年里会把「证据回链」这块空地占掉。
2. **第一阶段的验收条件里就写着要用测量。** v2 的阶段一验收要求「用真实浏览器截图对照参考做视觉回归」；`craft.a11y-contrast-ok`、`craft.responsive-verified` 这两个标签本身就是内容标准 3.2 的一部分。也就是说，**测量不是第三阶段的新范围，它是第一阶段内容标准的执行手段**。把它推后，第一阶段的「同一内容标准」就只能靠人眼，50–100 个站 × 三档视口 × 对比度采样，人力算不过来。
3. **它降低成本而不是增加成本。** v2 自己指出「8684 与同一内容标准是一对没有被承认的矛盾」——矛盾的核心是人力。半自动测量正是化解这个矛盾的唯一工具：机器给出可判定的部分，人只处理 undecidable 与 conflicts。**这是把它放在第一阶段的最强论据。**
4. **面向用户的那部分（工作台 UI、多格式导出、逐条修正界面、任意 URL 输入）确实很贵，且确实可以等。** 这部分晚做没有损失，因为它的价值来自「你的判断可查证」，而可查证性只有在有一批已核验条目之后才成立。

### 7.3 我建议的替代路线（分阶段，每步独立成立）

**阶段一（与 v2 的阶段一并行，不新增前台范围）：内部半自动测量。**
- 交付一个 CLI / 脚本：给定一个站点条目，跑三档视口，产出 `evidence[] + metrics + provenance + conflicts + undecidable`，写进该条目的 JSON。**不做任何 UI。**
- 给 `evidence` 补上空间维度：`pageId` + `viewport` + `selector` + `sampleCount` + 截图矩形。没有这一层，后面的「回链」永远做不出来。
- 前台只露出**最克制的一处**：在条目页显示三档视口是否验证过、对比度样本数是否达标。**不显示任何风格结论。**
- 验收：50–100 个站里，编辑的核验时间下降；每个条目的 `undecidable` 列表是显式的、可解释的。
- 顺手清理两处诚实性欠债：`CodeExportModal.jsx` 的「已自动对齐生产级无障碍规范」这句无据断言必须删；`SpecPanel.jsx` 与 `CodeExportModal.jsx` 里的硬编码 token（`#6E56CF`、`14px`、`8pt-grid`、`OKLCH / sRGB`）要么标注为「默认值，非测量结果」，要么接上真实数据。

**阶段二（与 v2 的阶段二并行）：把事实变成前台的「实测事实」区块 + 深读的证据层。**
- 条目页出现可折叠的实测区块，每条可点开看证据（页面、视口、选择器、采样数、截图区域）。
- 每周一篇的深读，把 Refero 的信息节奏（隐喻 → 白话 → 数据 → Do/Don't）套在**自己的实测数据**上——这就是 v2 第 8 节说的差异点，此时才有数据可套。
- 引入 token 层：把 metrics 升成 DTCG token，事实源 JSON 成型；导出先只做两种（`tokens.json` 纯 DTCG、`DESIGN.md`），验证派生管线。
- 引入 Vercel 式 eval loop 的雏形：用现有的 ΔE Diff 工具做「生成 → 截图 → 测量 → 判定」的固定场景回归。**这是 VisLexicon 已有但市面上没人做的第二个差异点，不要浪费。**

**阶段三（与 v2 一致）：面向用户的 URL 工作台。**
- 此时才做：任意 URL 输入、目标选择、逐条修正（`corrections` 只追加不覆盖）、多格式派生、「分析这个站」动作、MCP / llms.txt。
- 此时它的卖点不再是「我能转 DESIGN.md」（那时已彻底商品化），而是「**我的每一条判断都能点回它的证据，而且你可以改，改完只重算受影响的那几条**」。这个卖点只有在前两阶段的证据层建好之后才存在。

**这条路线与 v2 的实质分歧只有一处：把「测量」从第三阶段前移到第一阶段，并明确它以内部工具形态存在、不占前台。其余（不做独立频道、工作台推后、不做强制中间层、JSON 为事实源）我完全同意 v2。**

---

## 附：来源清单（全部于 2026-09-05 访问）

- Refero Styles 首页 — https://styles.refero.design/
- Refero Styles 风格详情样本 — https://styles.refero.design/style/c4e125b6-e3a3-4509-b06f-f0169216a394
- Refero Styles / Tailwind Design Tokens — https://styles.refero.design/ai-agents/tailwind-design-tokens
- Refero 使用条款（更新于 2026-08-03） — https://doc.refero.design/legal/terms-of-use
- Refero MCP 入门文档 — https://doc.refero.design/mcp/getting-started
- Google 官方博客：Stitch 的 DESIGN.md 开源（2026-04-21） — https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-design-md/
- google-labs-code/design.md 规范仓库 — https://github.com/google-labs-code/design.md
- Vercel 工程博客：用 design.md 生成品牌页（2026-08-31） — https://vercel.com/blog/how-our-agents-build-on-brand-pages-with-design-md
- Paidax01/web-to-design-md — https://github.com/Paidax01/web-to-design-md
- jpoindexter/design-md-extractor — https://github.com/jpoindexter/design-md-extractor
- arvindrk/extract-design-system — https://github.com/arvindrk/extract-design-system
- VoltAgent/awesome-design-md — https://github.com/VoltAgent/awesome-design-md
- Design Extractor — https://www.design-extractor.com/
- DesignMD — https://designmd.cc/
- getdesignsystem.io — https://getdesignsystem.io/
- designlang — https://www.designlang.app/
- Chrome 扩展：DESIGN.md Style Extractor（TypeUI / Bergside SRL） — https://chromewebstore.google.com/detail/designmd-style-extractor/ogpdnchdjiibhobphelbbkemnnemkfma
- Chrome 扩展：DESIGN.md extractor by getdesignsystem.io — https://chromewebstore.google.com/detail/designmd-extractor-by-get/kgekenpkhajkhnbmmckccfkhdjbackek
- Project Wallace — https://www.projectwallace.com/ ；开源列表 https://www.projectwallace.com/oss
- projectwallace/css-analyzer（MIT，v9.9.0，2026-06-02） — https://github.com/projectwallace/css-analyzer
- CSS Stats — https://cssstats.com/ ；仓库 https://github.com/cssstats/cssstats
- Superposition — https://superposition.design/
- CSS Peeper — https://csspeeper.com/
- VisBug — https://github.com/GoogleChromeLabs/ProjectVisBug
- html.to.design（divriots） — https://html.to.design/home/
- Anima — https://www.animaapp.com/
- abi/screenshot-to-code — https://github.com/abi/screenshot-to-code
- W3C DTCG 首个稳定版公告（2025.10，2025-10-28） — https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/
- DTCG 格式草案（预览稿，2026-07-30） — https://www.designtokens.org/tr/drafts/format/
- Style Dictionary — https://styledictionary.com/
- Tokens Studio — https://tokens.studio/
- Godly（302 跳转至 recent.design） — https://godly.website/ → https://recent.design/
- Lazyweb 对比页（厂商自述） — https://www.lazyweb.com/vs/refero
- Superdesign：2026 年从网站提取设计系统指南 — https://superdesign.dev/blog/extract-design-system-from-website

**本地代码依据（非网络来源）：**
- `/root/workspace/VisLexicon-browser-design-kit/frontend/src/lib/mining-extractor/index.js`（`EXTRACTOR_VERSION`、`mergeMetricTiers`、`tagDecidability`、`extractMetrics`）
- `/root/workspace/VisLexicon-browser-design-kit/frontend/src/lib/mining-extractor/css-metrics.js`（Tier1，输入为 @projectwallace/css-analyzer 结果）
- `/root/workspace/VisLexicon-browser-design-kit/frontend/src/lib/mining-extractor/browser-probe.js`（`DEFAULT_VIEWPORTS` 三档视口、`PROBE_SOURCE_VERSION`）
- `/root/workspace/VisLexicon-browser-design-kit/frontend/src/lib/mining-extractor/dom-metrics.js`（`PROBE_CONTRACT_VERSION`、对比度与响应式门槛）
- `/root/workspace/VisLexicon-browser-design-kit/frontend/src/data/mining-signals.js`（17 个信号标签 id）
- `/root/workspace/VisLexicon-browser-design-kit/frontend/src/views/Tools.jsx`（Spec 提取器、ΔE Diff 描述器、收敛循环、协议安装）
- `/root/workspace/VisLexicon-browser-design-kit/frontend/src/SpecPanel.jsx`（现有 spec JSON 字段与冲突表）
- `/root/workspace/VisLexicon-browser-design-kit/frontend/src/components/CodeExportModal.jsx`（三种导出与硬编码 token）
- `/root/workspace/VisLexicon-browser-design-kit/frontend/src/lib/autopsy-profile.js`（时长/缓动/轨迹/渲染层推断）
