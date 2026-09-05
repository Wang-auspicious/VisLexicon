# 竞品调研 · 术语 / 模式 / 结构 / 学习库

调研日期：2026-09-05（下文所有 URL 均为该日访问，另有注明者除外）
调研人：子代理
对应简报章节：`context/01-design-review-brief.md` §4.7、§12

---

## 结论先行（10 行）

1. VisLexicon 图鉴不是蓝海。`vocab.design` 已有 **1,124 词条 / 4,087 别名 / 每条都带 live demo / 全套 llms.txt + terms.json 导出**，在"术语 + 演示 + 机器可读"这条线上比 VisLexicon 更完整。
2. "不知道它叫什么"这个问题，`namethatui.com`（"If you called it…" 口语说法反查 + 24+ 组 /vs/ 对照）与 `namethatui.org`（诊断式描述 + 8 组歧义簇 + 行为矩阵）解得最好，且都是 2026 年新站。
3. 全行业解剖图的**标注密度是 3–7 个部件**（uianatomy.dev 6、namethatui.com 3、Carbon 6）。VisLexicon 单台挂 21–22 个热区，且一次只亮一个标签，是本轮发现的最严重结构错误。
4. 参数面板的行业范式是 **Storybook 式侧贴面板**（每控件一行）或 **Comeau 式贴着单个演示放 1–3 个控件**。VisLexicon 的底部三滑块横条既装不下 enum/boolean，也没把「有正名的 param」和「无正名的 knob」分开——违反项目自己的诚实契约。
5. 候选内容的诚实呈现，业内已有成熟做法：Growth.design 把 "Coming Soon" 直接印在同一列表里；namethatui.com 给每个风格标注**术语地位**（行业公认/厂商语言/追认标签/有争议）；uianatomy.dev 每条给 `Last reviewed 2026-05-05` 与逐源 fetch 日期。水位线塞在 10px 页脚不算诚实。
6. 术语页 ↔ 真实网站互链，**几乎没人做**。Component Gallery 只链到设计系统文档，Growth.design 做的是反向（真实截图上标注原理）。VisLexicon 右栏的「网站库已收录」是真差异化，但被压在长列表底部。
7. VisLexicon 内部数字自相矛盾（62 / 419 / 659 / 1,046 / 1,932），在做任何前台诚实标注前必须先收口。
8. 默认入口不应是舞台。三个可比对手的首页分别是：全量词表、"描述它"搜索框、组件网格——**没有一个默认打开某个场景**。
9. 应先做透的领域是 **06 动力学与微动效**、**01 文字动力学**、**02 材质与表面**——这三类"文字讲不清、必须调参数才懂"，且竞品全是纯文本。**05 交互控件与原语已被彻底饱和**，不应继续投入。
10. 竞品全线不做的三件事：截图/位置反查、跨术语同屏活体对照、术语→野生真实网站。这是 VisLexicon 唯一还站得住的三角。

---

## 一、逐个产品

### 1. The Component Gallery — 跨设计系统命名的标杆案例

**定位与规模。** 自称"an up-to-date repository of interface components based on examples from the world of design systems"。首页当日显示 **60 个组件 / 95 个设计系统 / 2,671 个示例**（https://component.gallery/ ，2026-09-05）。作者 Iain Bean，2019 年 3 月上线，最初只是"a hobby project: an opportunity to learn new tech and something to talk about in job interviews"；2024 年 3 月时为 57 组件 / 94 设计系统 / 2,628 示例——**两年半只涨了 3 个组件、1 个设计系统、43 个示例**，说明这类库的真实增长极慢（https://iainbean.com/posts/2024/five-years-of-component-gallery/ ，2026-09-05）。

**页面结构。** 以 Tabs 页为例（https://component.gallery/components/tabs/ ，2026-09-05）：定义一句话 → **Also known as: Tabbed interface** → 示例画廊（该页列出 80 个设计系统实现）→ Markup（W3C 推荐的可访问 HTML + ARIA）→ Styling（用 `aria-selected` 属性选择器）→ Interactivity（Tab / Space / Enter / 方向键）→ Usage Guidelines → Resources（外链 OpenUI 等）→ **Name distribution**。

**跨设计系统对比怎么做的（关键）。** 每个示例卡 = 缩略截图 + 组件名链接 + 所属设计系统名 + 技术标签（React / Web Components / Vue / Angular）+ 特性徽章（Code examples / Accessibility / Open source / Usage guidelines）。示例可按技术与特性两个维度筛选。页面底部有 **Name distribution** 区块，用图表呈现同一组件在各设计系统里被叫成什么、各有多少家在用——这是全行业唯一把"命名分歧"量化成图的做法。注：该区块由 JS 渲染，本次抓取拿不到具体数据，**图表内容未核实**，仅确认区块标题存在。

Segmented control 页给出 `Also known as: Toggle button group`，并列出 Related components：Radio button（"Radio, Radio group"）与 Button group（"Toolbar"）——**related 项自带别名串**，等于一次给出一族的命名地图（https://component.gallery/components/segmented-control/ ，2026-09-05）。

**发现方式。** 顶部三栏 Components / Design Systems / About；⌘K 搜索（Pagefind 驱动）；设计系统页可按平台（GitHub / Figma / Storybook）、技术、特性筛选，并按日期 / 名称 / 组件数排序（https://component.gallery/design-systems/ ，2026-09-05）。

**可交互演示 / 参数 / 导出。** 全部**没有**。纯参考文档 + 静态截图。

**候选内容标注。** About 页无任何 pending / unpublished 说明；但作者在五周年文章里承认存在"many unpublished systems"和"nearly 1,000 component examples"因不属于现有分类而未上架——**这批货是隐形的，前台看不见**。截图由 puppeteer 脚本自动生成，数据存 Airtable，站点 Astro + Cloudflare Pages，投稿走 Contribute 表单（https://component.gallery/about/ ，2026-09-05）。

**商业模式。** 无。作者自付约 $21/月，"I already have a full-time job, and maintenance costs are low enough that I'm fine to absorb them"。累计 834,000 独立访客 / 200 万 PV，工作日约 1–2 千访客。

**最值得学的两点。** ① Name distribution：把命名分歧做成可看的分布，而不是列一串同义词。② related 项直接带别名串，让"相邻概念"和"另一个名字"在同一个视野里出现。
**明显缺陷。** ① 零交互，看完不知道它怎么动。② 未上架的近千条示例完全不可见，规模数字只报好看的那一半。③ 二级分类僵化到作者自己都承认"Design Systems !== UI Frameworks !== Component Libraries"分不开。

---

### 2. vocab.design — 与 VisLexicon 图鉴正面重叠的最强对手

**定位与规模。** 自称"a linked dictionary of design and UI vocabulary: every term with a live demo"。当日首页显示 **1,124 terms · 4,087 aliases · 54 tags**，分 10 个类目：component、layout、pattern、aesthetic、interaction、motion、typography、color、surface、accessibility（https://vocab.design/ ，2026-09-05）。作者 @gkurt，开源，免费无广告。

**词条页结构。** 以 combobox 为例（https://vocab.design/combobox ，2026-09-05）：定义（并直言"the hardest common component to build correctly"）→ 交互 demo（带播放控制）→ 别名（Combo box 标注为 Apple HIG 用法、autocomplete）→ **易混淆对照表**（逐条区分 dropdown / select / search field / listbox / command palette / multi-select / inline autocomplete / typeahead）→ 相关概念（active descendant）→ 标签（forms、search）→ **implementations**（W3C APG、shadcn UI、Carbon Design System）→ 来源引用（APG combobox pattern）。内容配比约 **20% 演示、80% 文字与对照表**。

**发现方式。** A–Z、按类目浏览、按标签筛选、随机词条、关键词搜索（⌘Ctrl K）、以及一个专门的 glossary 页做别名反查。**首页即全量词表**，不是场景。

**机器可读导出（VisLexicon 最该警惕的一点）。** `/llms-full.txt` 给全部 1,124 条的定义；`terms.json` 给完整数据集（含 aliases、relations、tags、implementations）；`/{slug}.md` 给带 frontmatter 的原始 markdown；`/paths.json` 给 slug→headword 与 alias→canonical 的映射表。字段模型为：headword、definition、aliases、**relations（variants / parts / confused-with）**、tags、implementations、category（10 选 1）。无 API key、无限流、全静态（https://vocab.design/llms.txt ，2026-09-05）。

**最值得学的两点。** ① `relations` 三分为 variants / parts / confused-with——**parts 就是解剖、confused-with 就是歧义簇**，一个字段模型同时覆盖了 uianatomy.dev 和 namethatui.org 各自的核心机制。② alias→canonical 的 `paths.json` 让 agent 在引用前先做归一，这是 VisLexicon「机器译名待校」欠账的正解方向。
**明显缺陷。** ① 每条只有孤立小 demo，无参数、无跨条对照，"记住它叫什么"靠的仍是读字。② 1,124 条无明显分级或复核日期，质量深浅不可辨。③ 无位置索引——仍然要求你先知道大概叫什么。

---

### 3. NameThatUI（namethatui.com）— "不知道它叫什么"解得最好的一个

**定位与规模。** 视觉词典，主打用大白话描述反查正名。**76 个 UI 元素：44 个 web + 32 个 macOS**，另有 16 个视觉风格（https://namethatui.com/ ，2026-09-05）。sitemap 显示最近更新 2026-07-31，含 24+ 个 `/vs/` 对照页（https://namethatui.com/sitemap.xml ，2026-09-05）。URL 形态：`/web/{slug}`、`/macos/{slug}`、`/styles/{slug}`、`/vs/{a}-vs-{b}`。

**词条页结构（以 Tabs 为例，https://namethatui.com/web/tabs ，2026-09-05）。** 页头搜索 + 索引面包屑 + 收藏/分享 → 热度数字（"1,248 +12% from last week"）→ 标题 + ARIA role 标注 → **「If you called it…」口语说法区**（列出 "the row of labels that switches the panel below"、"sections with an underline under the active one" 这类说法）→ 正式定义 → **解剖区（3 个标注部件：tab list、active-tab indicator、tab panel，各配 ARIA 属性）** → **两段可一键复制的 agent 提示词**（一段用于"构建可访问的 tabs"，一段用于"排查常见失败"）→ 代码对照表（ARIA role 与 Radix 组件名）→ 相关元素（Accordion、Toggle Group、Carousel 等）→ 页脚含方法论与赞助说明。

**发现方式。** "Describe the thing…" 自然语言搜索框（⌘K）；筛选 All / macOS / Web / Newest / Popular / **Surprise me**；双击页面上任意词可弹出大白话释义。

**歧义对照。** `/vs/tabs-vs-segmented-control` 用三段式：概述 → **判定规则** → 并排样本。核心判据被压缩成一句可执行的话："Switching reveals completely different content → tabs. Switching re-renders the same data another way (list/grid, day/week) → segmented control."（https://namethatui.com/vs/tabs-vs-segmented-control ，2026-09-05）

**Name That Vibe（视觉风格图集）。** 16 个风格：Skeuomorphism、Neumorphism、Glassmorphism、Liquid Glass、Web Brutalism、Neobrutalism、Y2K Digital Aesthetic、Frutiger Aero、Flat Design、Minimalism、Claymorphism、Vernacular Web、Aqua、Windows Aero 等。每条含：正名、**术语地位（Industry-coined trend / Vendor design language / Retrospective label / Contested label 四选一）**、3–5 条判别信号、视觉样本、可复制 brief。站方明确声明"no honest list of all design styles"存在，只收有可信来源与可辩护信号的条目（https://namethatui.com/styles ，2026-09-05）。

**来源与商业模式。** 全部术语对照 Apple HIG、WAI-ARIA、WCAG、WHATWG、MDN 核验；赞助制，三个创始赞助位，内容免费，RSS 分发（https://designcompass.org/en/2026/08/25/namethatui-visual-dictionary/ ，发布日 2026-08-25，访问 2026-09-05）。

**最值得学的两点。** ① **「If you called it…」**：把用户可能说出口的错话直接写成正文并做成索引项。这是全行业唯一正面承接"我只会形容不会命名"的字段。② **术语地位四分法**：不是"已审核/候选"这种内部流程标签，而是"这个词在行业里到底算什么"的外部事实标签。
**明显缺陷。** ① 76 条规模很小。② 解剖是静态图，无参数、无活体演示。③ 热度数字（+12% from last week）与词典可信度无关，是噪音。

---

### 4. namethatui.org — 与上者同名不同站，"诚实标注"的标杆

**定位与规模。** 独立站点（canonical 明写 https://namethatui.org/ ），**44 个已复核模式（reviewed patterns）、8 个对照组，并明确宣称 "zero AI-generated confidence scores"**（2026-09-05）。

**发现方式（三条并列）。** ① 诊断式：描述一个未知部件的行为；② 模式搜索：可按 name / alias / purpose / definition 检索；③ 对照浏览：直接进 8 个歧义簇。词条页含行为图、定义、别名，再导向完整页与所属对照组。

**8 个歧义簇（https://namethatui.org/compare ，2026-09-05）。** Tooltip vs Popover vs Hover Card；Drawer vs Modal / Dialog / Sheet；Combobox vs Autocomplete vs Select；Dropdown vs Context vs Navigation Menu；Toast vs Banner / Alert / Notification；Accordion vs Disclosure vs Collapsible；Checkbox vs Radio vs Switch vs Toggle；Card vs Empty State vs Scrim。

**对照页机制。** **行为矩阵**（焦点、键盘、消解方式、模态性、持久性五轴）+ **决定性问题**（哪一条需求直接排除掉错误选项）+ 相关定义 + 面向实现的结论。方法论一句话点题：判据是"the requirement that changes the build"，不是长得像不像。

**商业模式。** 完全免费、无需账号。明确声明不生成生产代码，只返回"reviewed candidates"与"framework-neutral implementation brief"。

**最值得学的两点。** ① 用**行为五轴矩阵**而不是形容词来区分近义组件——这套轴可以直接搬进 VisLexicon 的舞台，因为舞台恰好能把五轴真的演出来。② 把"零 AI 置信度分数""44 条已复核"写在首屏当卖点——**规模小反而成了可信度证据**。这正是 VisLexicon 62 正式词条该采取的姿态。
**明显缺陷。** 44 条覆盖极窄；行为图为静态；无代码、无实现映射。

---

### 5. UI Anatomy（uianatomy.dev）— 解剖与跨库分歧做得最深

注意：`uianatomy.com` 是一个无关的 WordPress 哲学博客默认站（仅有 2023-04 的 "Hello world!"），与本项目无关（https://uianatomy.com/ ，2026-09-05）。有效站点是 **uianatomy.dev**。

**定位与规模。** 自称把 "W3C APG、MDN、WCAG、mature headless libraries、production design systems" 综合成一套 canonical reference。**47 个组件**（https://uianatomy.dev/ ，2026-09-05）。

**每个组件三视图。** Designer / Dev / Bridge。以 combobox 为例（https://uianatomy.dev/components/combobox ，2026-09-05）：

- **Designer view**：解剖图（标注 "Fig 1.1 · Combobox · Designer view"，基于 Figma，静态非可悬停 SVG）+ **6 个 slot**：input、clear-button、trigger-button、listbox、option、empty-state + 每 slot 的 Figma 组件类型与 token 用法。
- **Dev view**（https://uianatomy.dev/components/combobox/dev ，2026-09-05）：对照 4 个库——Angular Material（`MatAutocomplete`）、Headless UI、Radix（Popover + cmdk 组合）、React Aria。核心是**分歧表（divergence table）**，四列：**From（canonical 概念）/ Type（omitted、renamed、reshaped、extended）/ To（该库实际实现）/ Rationale（为何分歧）**。实例：canonical `strict: boolean` → Angular Material 叫 `requireSelection`（改名且极性反转），React Aria 叫 `allowsCustomValue: false`（反转，且 strict 是默认）；canonical `selectionChange` → Angular Material `optionSelected`（载荷形状 `{ source, option }`）、React Aria 与 Headless UI 都叫 `onChange`；canonical 的 `clear-button` slot 在 Angular Material 与 Headless UI **直接缺席**，"consumers must author their own clear button"。
- **Bridge view**（https://uianatomy.dev/components/combobox/bridge ，2026-09-05）：Figma↔code 属性映射表（`Variant`→`variant`、`Filter Mode`→`filterMode`、`State`→`data-state`、`Strict`→`strict`）；四类设计-开发错位（portal 渲染导致浮层逃出容器、**状态爆炸——6 个状态 × 尺寸 × 宽度 = 36+ 个 Figma variant 而代码只用伪类与 data 属性**、多选 chip 动态换行、busy 态在 Figma 看着是常驻而代码里会替换选项列表并触发 `aria-live`）；以及 Web Components / React / Angular signals / Vue 四种表达方式对照。

**来源与复核标注（最该学的地方）。** 每个实现块都带取数出处与日期，例如 "Source: github.com/angular/components blob src/material/autocomplete/autocomplete.ts (fetched 2026-05-04)"，页脚给 "Last reviewed 2026-05-05"。

**/compare 工具。** 选两个 canonical 组件（如 Card vs Tile）做结构 diff，比较维度：解剖 slot（必需 vs 可选）、变体、属性、交互状态、数据状态、schema 段落（motion / responsive / accessibility / performance）、可访问性规则（axe-core）。结果以韦恩式三分呈现：仅 A 有 / 仅 B 有 / 共有（https://uianatomy.dev/compare ，2026-09-05）。

**可交互演示 / 导出。** 均**无**。无 live demo，页面未见 copy-for-agent 导出。参考 reference 段含变体、属性、状态迁移、**常见错误（分 blockers / major / minor 三档）**、可访问性提示。

**商业模式。** 未见任何收费或订阅。

**最值得学的两点。** ① **canonical slot 模型 + 逐库分歧表**：先立一套正名，再诚实记录每个库怎么背离它、为什么——这正是 VisLexicon「一词多源、机器译名混乱」的正解结构。② 逐条来源附 fetch 日期 + 全页 Last reviewed，把"这条知识什么时候核过"变成页面一等公民。
**明显缺陷。** ① 全静态，看不到组件怎么动。② 解剖图是 Figma 导出的静态图，标签不可交互，也无法反向从图找名。③ 47 条，覆盖窄。

---

### 6. Laws of UX

**规模与结构。** 首页列 **32 条法则**，单一字母序（Aesthetic-Usability Effect → Zeigarnik Effect），无分类（https://lawsofux.com/ ，2026-09-05）。单条页结构：标题 + 一句定义 → **Takeaways（3 条编号）** → Origins（原始研究出处）→ Further Reading（外部文献含作者署名）→ 海报售卖与免费下载 → **Related Laws（3–4 张卡）** → 页脚（https://lawsofux.com/aesthetic-usability-effect/ ，2026-09-05）。

**可交互演示。** 无。仅静态主视觉图。多语言 + 明暗切换。

**商业模式。** 书（导航有 Book 入口）、与 Pip Decks 合作的卡组（**54 条心理学原则与 UX 方法**，https://lawsofux.com/cards/ ，2026-09-05）、BigCartel 上的大幅面索引海报，另有免费海报下载。

**最值得学的一点。** "一句定义 + 3 条 Takeaways" 是极高效的信息节奏：**先给能背下来的一句，再给能用上的三条**，然后才是学术出处。VisLexicon 右栏当前是"中文定义 + 英文定义 + 批注"三段并列，缺这个层级差。
**明显缺陷。** 32 条、纯静态、纯字母序，除了搜索没有任何按现象或任务的入口。

---

### 7. animations.dev + animation-vocabulary（Emil Kowalski）

**定位与规模。** animations.dev 是 Emil Kowalski（Linear 设计工程师，Sonner / Vaul 作者）的付费动效课。四大模块 + walkthroughs：模块一动效理论 8 课、模块二 CSS 动画、模块三 Motion / Framer Motion、模块四 Good vs Great；4 个 walkthrough 项目（Family Drawer、Dynamic Island、Navigation Menu、SVG Animations）共 15 课。附赠 Discord、**15 个动效 AI skills**、精选资源、专家访谈。**当前招生关闭，预计 2027 年重开 10 天**；团队授权 10–20% 折扣；waitlist 可看 2 节免费课（https://animations.dev/ ，2026-09-05）。

**animation-vocabulary skill（对 VisLexicon 更重要）。** 一个 agent 可读的动效词表，自我定位为"a reverse-lookup glossary designed to translate how a user 'sees' or 'feels' an animation…into the exact industry-standard term"，并明确"核心任务是命名，不是设计或实现"。**共 90 条术语，11 个类目 + 9 条 Principles to Know**：Entrances & Exits 6、Sequencing & Timing 8、Movement & Transforms 8、Transitions Between States 7、Scroll 5、Feedback & Interaction 9、Easing 6、Spring Animations 9、Looping & Ambient Motion 7、Polish & Effects 10、Performance 6（https://raw.githubusercontent.com/emilkowalski/skills/main/skills/animation-vocabulary/SKILL.md 与 https://www.ui-skills.com/skills/emilkowalski/animation-vocabulary/ ，均 2026-09-05）。条目形态极简：`Stagger — Animate several items one after another with a small delay between each, creating a cascade.`；`Rubber-banding — Resistance and snap-back when you drag past a boundary (the iOS overscroll feel).`；`Morph — One shape smoothly turns into another shape, e.g. Dynamic Island.` 使用契约要求"Descriptions from the glossary must be quoted exactly to maintain authority"，歧义时的处理顺序是：读意图 → 逐字准确 → 对比近义 → 无精确匹配则近似（https://deepwiki.com/emilkowalski/skills/7.1-animation-vocabulary:-motion-glossary-and-usage ，2026-09-05）。

注：该 skill 引用了一个 `/vocabulary` 页作为权威来源，但 `https://animations.dev/vocabulary` 当日返回 404，**该网页版是否存在未核实**。

**最值得学的两点。** ① 这 90 条**全是纯文字、没有一个演示**——而它们恰恰是最不可能靠文字讲清的一类词（rubber-banding、morph、overshoot）。这是 VisLexicon 参数化舞台最锋利的切入口。② 把词表做成 agent skill 分发，而不是只做成网页。
**明显缺陷。** 无演示、无解剖、无来源引用；正课付费且到 2027 年才开放。

---

### 8. Josh Comeau — 交互式教学页的范式

以 CSS Transitions 一文为例（https://www.joshwcomeau.com/animation/css-transitions/ ，2026-09-05）：文中嵌入**多个 HTML/CSS 编辑器 + 实时结果面板**（悬停位移按钮、四种 timing function 对照、`transform` vs `margin-top` 的硬件加速对照、非对称动效示例、结尾一个自由沙盒）。控件类型包括：**时间轴刮擦条**（逐帧检视）、**FPS 滑块**（模拟低帧率看性能劣化）、timing function 下拉、Ghost Opacity 复选框、Circle/Square 形状选择、播放/重置按钮。

布局范式：演示**穿插在正文中**，紧跟在对应概念解释之后；代码区分 HTML / CSS 两个 tab 且带语法高亮；改代码或调控件，结果立即更新。**每个演示只服务一个概念，控件通常 1–3 个。**

---

### 9. MDN 交互演示区

以 `transition-timing-function` 页为例（https://developer.mozilla.org/en-US/docs/Web/CSS/transition-timing-function ，2026-09-05）：页面**开头、Syntax 之前**放 "Try it" 区。机制是**预设值清单点选**（`linear`、`ease-in`、`steps(6, end)`、`cubic-bezier(0.29, 1.01, 1, -0.68)`），点一个就应用到示例元素，同时代码可编辑、结果实时更新。

范式要点：**演示在参考正文之前**，用预设值而不是空白参数让人一眼看出取值范围与差异。这与 VisLexicon 把滑块放在画布底部、且只给连续量不给预设的做法正好相反。

---

### 10. ARIA Authoring Practices Guide（APG）

**规模。** 34 个 pattern（https://www.w3.org/WAI/ARIA/apg/patterns/ ，2026-09-05）：Accordion、Alert、Alert and Message Dialogs、Breadcrumb、Button、Carousel、Checkbox、Combobox、Dialog (Modal)、Disclosure、Feed、Grid、Landmarks、Link、Listbox、Menu and Menubar、Menu Button、Meter、Radio Group、Slider、Slider (Multi-Thumb)、Spinbutton、Switch、Table、Tabs、Toolbar、Tooltip、Tree View、Treegrid、Window Splitter 等。

**页面结构。** About This Pattern → Examples（**只给链接，不内嵌**）→ Keyboard Interaction（按弹层类型分 listbox / grid / tree / dialog 四套子节）→ WAI-ARIA Roles, States, and Properties。示例是独立页面，实现是活的、带代码（https://www.w3.org/WAI/ARIA/apg/patterns/combobox/ ，2026-09-05）。

**值得学的一点。** 键盘行为按**弹层类型**分节，而不是按组件分节——这是"同一个名字底下其实是四种东西"的正确拆法。
**缺陷。** 演示与文档分离两跳，学习路径断裂；无别名、无跨系统命名。

---

### 11. Open UI（W3C Community Group）

**定位。** 让开发者能给内建控件（`<select>`、checkbox、radio、date/color picker）做样式与扩展。**35+ 个组件研究页**，URL 形态 `https://open-ui.org/components/{name}.research`（https://open-ui.org/ ，2026-09-05）。

**研究页结构（跨系统命名对比的另一个关键案例）。** 以 select 为例（https://open-ui.org/components/select.research/ ，2026-09-05）：**Names 区**列出各设计系统怎么称呼这个组件（Autocomplete / Select / Combobox / Dropdown）；**Concepts 区**把跨系统的属性/特性归并成"概念"，每个概念给：概念名 + **aliases（各系统的实际叫法）** + 视觉示例截图 + "无图的系统"清单。不是标准表格，而是概念聚合。

**具体命名分歧实例。** `closeMenuOnSelect` vs `closeOnSelect`；`isInvalid` vs `showError` vs `error`（三种）；`multiple` vs `isMulti` vs `isMultiSelect` vs `multiSelect`（四种）。

**值得学的一点。** 归并单位是**概念**而非组件——同一个概念在 N 个系统里有 N 个名字，先立概念再挂别名。这比 Component Gallery 的"组件级 name distribution"粒度更细，正好对应 VisLexicon 的 hotspot/param 粒度。
**缺陷。** 面向规范制定，可读性差，无演示，更新节奏取决于标准进程。

---

### 12. 大设计系统组件文档页

**Carbon（IBM）。** 以 Dropdown 为例（https://carbondesignsystem.com/components/dropdown/usage/ ，2026-09-05）：四个 tab —— **Usage / Style / Code / Accessibility**。Usage 内顺序为：**Live Demo（带主题选择器与变体选择器）** → Overview → **Formatting（解剖，标注 label、helper text、field、menu、option、parent checkbox 六个部件）** → Content → Universal Behaviors（方向、层级、滚动、状态、交互）→ Interactions（鼠标与键盘）→ 三个变体深入（Dropdown / Multiselect / Combo Box）→ Modifiers → **AI Presence（AI 变体样式）** → Related → References。全篇多组 Do/Don't。另有官方 **Carbon MCP**（https://carbondesignsystem.com/developing/carbon-mcp/overview/ 与 https://github.com/carbon-design-system/carbon-mcp ，2026-09-05）供 agent 查询组件、token、图标并生成代码。

**Atlassian。** 站点提供 `https://atlassian.design/llms.txt`（2026-09-05）。更重要的是其 **DESIGN.md** 实践文章（https://www.atlassian.com/blog/how-we-build/atlassians-design-md-is-here-what-we-learned-testing-portable-design-context-in-practice ，发布 2026-06-15，访问 2026-09-05）：DESIGN.md 是 Google 为 Stitch 创建的开源 Markdown 格式，用一个文件承载设计系统的品牌规范与 UI 模式；结构为 **YAML frontmatter（color / typography / shape 等 token，机器可读）+ Markdown 正文（设计理由，人与 agent 都可读）**，捕捉的是"the **intent**, rather than the full details"。Atlassian 拿它与自家 MCP server 对比做登录页：**DESIGN.md 耗 721 万 token，MCP 耗 375 万（多 92%）；耗时 6m46s vs 5m1s；DESIGN.md 跑次间方差高 2.7 倍**。结论是原型阶段好用，生产环境不如 MCP。

**Polaris（Shopify）。** 原组件 URL 已 302 跳转到 `https://shopify.dev/docs/api/polaris`，**当前文档结构未核实**（2026-09-05）。

**Material Design 3 / Apple HIG。** 两站均要求 JS 才渲染正文，本次抓取只拿到 metadata。M3 text-fields 页仅确认 meta 描述"Text fields let users enter text into a UI."；HIG segmented-controls 页仅确认"A segmented control is a linear set of two or more segments, each of which functions as a button"。**两者的分节结构、解剖图是否可交互、是否有实时演示，本次均未核实**，不据此下结论。

---

### 13. UI Patterns（ui-patterns.com）

两大族：**User Interface Design Patterns**（Getting input / Navigation / Dealing with data / Social / Miscellaneous / Onboarding）与 **Persuasive Design Patterns**（Cognition / Game mechanics / Perception and memory / Feedback / Social）。**页面未给出总条数**（https://ui-patterns.com/patterns ，2026-09-05）。商业模式：卡组（Persuasive Patterns、Validation Patterns）、newsletter、shop.learningloop.io 的头脑风暴工具与海报、以及 Product & UX 辅导服务。单条模式页的内容结构本次未取到，**未核实**。

---

### 14. Checklist Design / Design System Checklist

**Checklist Design**（https://www.checklist.design/ ，2026-09-05）：仅能核实其自述"Design checklists for websites, web apps, mobile, components, and flows. Check every detail, ship better work."，即按 website / web app / mobile / component / flow 五种对象组织。**清单数量、条目数、条目是否可勾选、是否有来源引用、商业模式，全部未核实**——该站正文由 JS 渲染，`/browse` 与 `/components` 两次抓取均只返回 metadata。

**Design System Checklist**（https://www.designsystemchecklist.com/ ，2026-09-05）：自述"An open-source checklist to help you plan, build and grow your design system."；确认开源、有 GitHub 仓库、支持 7 种语言（含简体中文）。条目数与进度保存功能**未核实**。

---

### 15. Growth.design

**规模与形态。** **53 个 UX case studies**，单篇 2–9 分钟，形态是可滚动的图文/漫画式流程，把心理学原理标注在真实产品截图上（Tinder、Airbnb、Trello、Uber、Tesla、Spotify、Adobe、Duolingo 等）（https://growth.design/case-studies ，2026-09-05）。

**原理库。** **106 条认知偏差与设计原则**，按用户决策周期分 4 类：Information（如何过滤信息）、Meaning（如何寻找意义）、Time（如何快速行动）、Memory（如何记住体验）。每条含 emoji 图标、名称、一句描述（如 "More options leads to harder decisions"）与可展开详情。**大量条目直接标注 "Coming Soon"**（https://growth.design/psychology ，2026-09-05）。

**商业模式。** 免费订阅，每月一篇新 case study；提供免费 PDF 速查表（每条原理一行）。该页未见卡组或定价。

**最值得学的两点。** ① **"Coming Soon" 与已完成条目同列同框**——不藏、不另开"待建档"分区，用户一眼看清哪些有货哪些没有。这是候选内容诚实呈现的最简可行解。② 按**用户决策周期**（信息→意义→时间→记忆）而非按学科分类——一个纯粹从用户处境出发的分类轴。
**明显缺陷。** 106 条里相当比例是空壳；案例更新极慢（每月一篇）。

---

### 16. The A11Y Project

自述"a community-driven effort to make digital accessibility easier"，三块内容：**Checklist**（基于 WCAG，明确声明"targets many, but not all level A and AA concerns"——**条目数页面未给出**）、Posts、Resources（工具、书、视频、播客、newsletter、专业服务）。社区驱动、开源、GitHub 运作，设 "Write for Us" 与 "Good First Issues"。商业模式为赞助（Go Make Things、Assistiv Labs、Fable、A11Y Collective）+ Open Collective 捐赠，Apache 2.0 授权（https://www.a11yproject.com/ ，2026-09-05）。

**最值得学的一点。** 主动声明覆盖边界（"many, but not all"）——把不完整写在产品自我介绍里，而不是等用户发现。

---

### 17. Interaction Design Foundation 术语/主题库

主题页 A–Z 排列（另设 # 段），**总数页面未给出，仅称数百个**。每个主题条目显示：标题 + 关联文章数 + 视频数 + "Read full topic"，例如 "Design Thinking：51 articles, 10 videos"；首页高亮 User Experience Design（157 articles）、Mobile UX Design（42）、Usability（48）。平台整体自述 1,760 篇免费文章、730 个视频/插图/模板、209 位专家。**会员定价该页未给出**（https://ixdf.org/literature/topics ，由 interaction-design.org 302 跳转而来，2026-09-05）。

**值得学的一点。** 每个术语条目直接标注"这个词背后有多少篇文章、多少个视频"——把**内容厚度做成条目上的可见数字**。VisLexicon 完全可以在每个术语上标"1 个舞台 / 3 个来源 / 2 个网站案例"。

---

### 18. Storybook Controls（可调参数 playground 的工业标准）

控件类型：boolean（开关）、number、**range（可配 min/max/step）**、text、radio / check / select / multi-select（含 inline 变体）、**color（带自定义预设色板）**、date、file（限定类型）、object/array（JSON 编辑器，支持 raw 模式）。控件面板与预览画布**并列展示**（文档未明说左右还是上下）。文档未提及自动代码导出；但支持从 Controls 面板直接创建/编辑 story 并写回文件，可用 `disableSaveFromUI` 关闭（https://storybook.js.org/docs/essentials/controls ，2026-09-05）。

**对 VisLexicon 的直接意义。** Storybook 的控件类型集（boolean / range / select / color / object）比 VisLexicon 当前的 range / boolean / enum 三类更宽，且 **color 与 object 正是 VisLexicon 的 02 色彩领域与 token 导出所需**。面板是**贴边独立面板、每控件一行**，不是底部横条。

---

### 19. UI Terms（uiterms.com）— 2026 新入场者

**64 个** components / layouts / interactions，站方措辞是 "with live demos you can poke at"。六个类目：Layouts 9、Components 25、Patterns 11、Interactions 9、Animations 10、Glossary A–Z，另有 **"Design eras"** 入口。词条页用问答式（"What's a popover?" / "How does it differ from a modal?"）配可交互演示与代码。作者 Naeem Noor，免费，侧栏推广其配套项目 modern.css（https://uiterms.com/ ，2026-09-05）。

**值得学的一点。** 问答式标题——"它和 modal 有什么区别"本身就是一个可被搜索到的用户问句。
**缺陷。** 64 条规模小，无来源引用，无别名体系。

---

### 20. 其他与边界说明

- **Use Your Interface**（useyourinterface.com）：真实 App 交互录屏库。**robots.txt 禁止抓取，本次未能核实任何细节**，不纳入对照矩阵。
- **Pattern Atlas**（patternatlas.github.io）：学术领域（云计算/量子）的模式管理工具，与 UI 术语无关，排除。
- **southleft/design-systems-mcp**（https://github.com/southleft/design-systems-mcp ，2026-09-05）：第三方设计系统 MCP，说明"设计系统知识→agent"这条通道已有多方在做。

---

## 二、对照矩阵

规模数字均为 2026-09-05 当日站点自报；"—" 表示无此功能；"未核实" 表示本次抓取未能确认。

| 产品 | 规模（自报） | 条目页核心字段 | 发现方式 | 活体演示 | 可调参数 | 代码/导出 | 跨系统对比 | 候选标注 | 商业模式 |
|---|---|---|---|---|---|---|---|---|---|
| Component Gallery | 60 组件 / 95 系统 / 2,671 示例 | 定义、Also known as、80 个系统示例、Markup、Styling、Interactivity、Usage、Name distribution | 组件网格、系统网格、⌘K 搜索、技术/特性筛选 | — | — | 代码片段（markup） | **Name distribution 图 + 各系统截图并列** | 无前台标注；近千条未上架不可见 | 无（作者自付 $21/月） |
| vocab.design | **1,124 词 / 4,087 别名 / 54 标签** | 定义、live demo、别名、relations（variants/parts/**confused-with**）、tags、implementations、来源 | 首页即全量、A–Z、10 类目、标签、随机、⌘K、别名 glossary | **每条都有** | 未见 | **llms-full.txt / terms.json / {slug}.md / paths.json** | implementations 字段列出哪些系统有 | 无分级 | 免费开源无广告 |
| NameThatUI (.com) | 76 元素（44 web + 32 macOS）+ 16 风格 | **If you called it…**、定义、解剖（3 部件+ARIA）、两段 agent 提示词、代码对照表、相关元素 | **"Describe the thing…" 搜索**、平台筛选、Newest/Popular/Surprise me、24+ /vs/ 页、双击查词 | 静态样本 | — | **可复制 agent prompt** | ARIA role 与 Radix 名对照表 | **风格页有术语地位四分法** | 赞助（3 个位） |
| namethatui.org | **44 已复核模式 / 8 歧义簇** | 行为图、定义、别名 | **诊断式描述**、按 name/alias/purpose/definition 搜、8 簇浏览 | 静态行为图 | — | framework-neutral brief（不出生产代码） | — | **"zero AI-generated confidence scores"、"reviewed"** | 免费无账号 |
| UI Anatomy (.dev) | 47 组件 | Designer/Dev/Bridge 三视图、6 slot 解剖、**分歧表（From/Type/To/Rationale）**、Figma↔code 映射、常见错误三档、状态迁移 | 组件列表、/search、**/compare 双组件 diff** | — | — | 各库代码片段 | **逐库分歧表 + Figma↔code 映射** | **逐源 fetch 日期 + Last reviewed 2026-05-05** | 未见 |
| Laws of UX | 32 法则 | 一句定义、3 条 Takeaways、Origins、Further Reading、Related Laws | 字母序单表、搜索 | — | — | — | — | — | 书 + Pip Decks 卡组（54）+ 海报 |
| animation-vocabulary | **90 术语 / 11 类 + 9 原则** | 术语名 + 一句定义（要求逐字引用） | 按类目 | — | — | **本体即 agent skill** | — | — | 免费（正课付费，2027 开放） |
| Josh Comeau | 单篇文章 | 概念散文 + 嵌入式 playground | — | **多个可编辑 playground** | **刮擦条 / FPS 滑块 / 下拉 / 复选 / 形状选择器** | HTML/CSS 双 tab 实时编辑 | — | — | 付费课程 |
| MDN | CSS 属性全集 | Try it 区（正文之前）、Syntax、Examples | 站内搜索 | **有** | **预设值点选 + 可编辑代码** | 可编辑 | — | 浏览器兼容表 | 非营利 |
| APG | 34 patterns | About、Examples（外链）、Keyboard Interaction（按弹层类型分节）、ARIA 角色状态属性 | pattern 索引 | 示例页有（**需跳转**） | — | 示例页带代码 | — | — | W3C |
| Open UI | 35+ 研究页 | **Names 区 + Concepts 区（概念名 + aliases + 截图 + 无图系统清单）** | Research 导航 | — | — | — | **概念级别名归并** | 提案/开放问题 | W3C CG |
| Carbon | — | 四 tab；Usage 内：Live Demo → 解剖（6 部件）→ Content → Behaviors → Interactions → 变体 → **AI Presence** → Related → References | 组件索引 | **有（主题+变体选择器）** | 主题 / 变体两个选择器 | Code tab + **Carbon MCP** | — | — | IBM 内部投入 |
| Atlassian | — | 未核实 | 未核实 | 未核实 | 未核实 | **llms.txt + MCP + DESIGN.md 实验** | — | — | Atlassian |
| Growth.design | **53 案例 / 106 原理** | 原理：emoji + 名称 + 一句描述 + 可展开 | 按决策周期 4 类 | 滚动式图文标注 | — | 免费 PDF 速查表 | — | **"Coming Soon" 与成品同列** | 免费订阅 |
| A11Y Project | Checklist（条数未给） | 清单条目 + Posts + Resources | 三大板块 | — | — | — | — | **自述"many, but not all A/AA"** | 赞助 + Open Collective |
| IxDF | 数百主题（总数未给）；1,760 文章 / 730 视频 | 标题 + **文章数 + 视频数** + 全文入口 | A–Z | — | — | — | — | — | 会员制（定价未核实） |
| Storybook | — | story + Controls 面板 | — | **有** | **boolean/number/range/text/radio/select/multi-select/color/date/file/object** | 可写回 story 文件 | — | — | 开源 + Chromatic |
| UI Terms | 64 条 | 问答式标题 + 演示 + 代码 | 6 类目 + Glossary + Design eras | **有** | 未见 | 代码示例 | — | — | 免费（引流 modern.css） |
| UI Patterns | 未给出总数 | 未核实 | 两大族多层分组 | — | — | — | — | — | 卡组 + 海报 + 辅导 |
| **VisLexicon 现状** | 数字自相矛盾：62 正式 / 419 atlas / 659 词 / 170 之 1,046 / 1,932 | 正名、中文名、机器译名提示、tags、中英定义、编辑批注、别名、媒介绑定、标杆库、来源、网站库已收录 | 8 领域树 + 搜索 + 按 slot 分组的词表 | **9 台活体舞台（唯一）** | **range/boolean/enum 三类，底部横条** | 「导出规范与代码」按钮 | 跨台互引 | 页脚 10px 水位线 | 个人项目 |

**移动端。** 除 vocab.design 明确提及无障碍与键盘支持、Component Gallery 与 Laws of UX 有明暗主题切换外，**本次未对任何竞品做移动端实测，一律标为未核实**，不据此下判断。唯一确定的是：VisLexicon 当前的三列舞台外壳（左树 + 中舞台 + 右详情，1440 宽下已经很挤）在移动端不可能原样成立——这是简报硬约束里的必答题。

---

## 三、「我不知道它叫什么」谁解得最好

**答案：namethatui.com 在"从口语到正名"这一段最好；namethatui.org 在"两个词分不清"这一段最好；vocab.design 在"别名覆盖与归一"这一段最好。三者机制不同，可以叠加。**

把全行业用过的机制拆出来，一共只有八种，VisLexicon 占了其中一种半：

**机制一 · 口语说法反查（namethatui.com 独有）。** 每个词条页有 "If you called it…" 区块，把用户可能说出口的错话直接写成正文条目并进索引，例如 tabs 页收录 "the row of labels that switches the panel below"、"sections with an underline under the active one"。这不是别名（别名是另一个正式名字），而是**描述性错话**。配套是 "Describe the thing…" 自由文本搜索框（⌘K）。这是最直接命中用户处境的一招，且实现成本极低——本质是给每个词条加一个"用户会怎么形容它"的多值字段。

**机制二 · 诊断式描述（namethatui.org）。** 用户描述一个未知部件的**行为**，系统在浏览器内实时匹配，返回"reviewed candidates"而非唯一答案。关键在于它承认自己可能不确定，返回候选集加判据，而不是硬猜一个。

**机制三 · 别名规模与归一（vocab.design）。** 1,124 词配 4,087 别名，平均每词 3.6 个别名；并提供 `paths.json` 做 alias→canonical 映射，让 agent 在引用前先归一。**VisLexicon 当前 Tabs 页显示 7 个别名（fitted tabs、layout、list filters、list views、navigate、organize、scrollable、segmented controls），Checkboxes 显示 3 个——量级相当，但缺归一表和反查入口，别名只是展示品，不是索引项。**

**机制四 · 成对歧义页（namethatui.com 24+ 个 /vs/ 页；namethatui.org 8 个歧义簇）。** 前者给一句可执行判据（"切换后是完全不同的内容 → tabs；切换后是同一批数据换个呈现 → segmented control"）；后者给**五轴行为矩阵**：焦点、键盘、消解方式、模态性、持久性，再加"哪一条需求直接排除掉错误选项"。后者的方法论表述值得抄进 VisLexicon 的编辑规范：判据是 "the requirement that changes the build"，不是长得像不像。

**机制五 · 解剖图/slot 命名（uianatomy.dev、Carbon、namethatui.com）。** 给一张图、标 3–7 个部件。这是"我知道它在哪但不知道它叫什么"的标准解法，也是 VisLexicon 舞台 hotspot 的同源机制——但竞品全是静态图，VisLexicon 是活的，这是真优势。

**机制六 · 跨系统命名分布（Component Gallery 的 Name distribution、Open UI 的 Names/Concepts 区）。** 回答"这个东西在不同地方叫什么，哪个叫法最主流"。Open UI 的粒度更细，落到属性级：`isInvalid` vs `showError` vs `error`。

**机制七 · 风格/美学命名 + 术语地位（namethatui.com 的 Name That Vibe）。** 16 个视觉风格，每个标注它在行业里到底算什么（行业公认趋势 / 厂商设计语言 / 事后追认标签 / 有争议标签），配 3–5 条判别信号。**这是"我形容不出这种感觉"的解法，也是 VisLexicon 02、03 两个 `规划中` 领域的现成蓝本。**

**机制八 · 位置索引 —— 全行业空白。** 没有任何一家提供"我知道它在页面底部/在侧栏顶部/在输入框右下角"这样的位置检索。VisLexicon 的舞台模型（`04-atlas-stage-model.md` 明写"位置本身就是索引"）是唯一在做这件事的，但**当前只把位置做成了浏览方式，没做成检索方式**：用户必须先选对舞台、再逐个悬停 21 个热区，才能撞上他要的那个。位置索引应该是一个入口（"它在界面的哪个位置？"→ 点一张抽象版面图的某个区域 → 列出该区域可能的术语），而不是一次穷举。

**还没人做的第九种：截图反查。** 没有任何竞品支持"上传/粘贴一张截图，圈出一块，告诉我它叫什么"。VisLexicon 的策展侧本来就在做真实网站截图，工具频道也已有视觉测量与设计说明提取——这是唯一能把三个频道串成一条动作链的机制，且技术上不需要新能力。

---

## 四、交互式舞台与参数 playground 的最佳实践

### 4.1 一个舞台里同时演示多少术语才合理

**行业实测数据（均 2026-09-05）：**

| 来源 | 单图/单演示的标注数 |
|---|---|
| namethatui.com · Tabs 解剖 | **3**（tab list、active-tab indicator、tab panel） |
| uianatomy.dev · Combobox slots | **6**（input、clear-button、trigger-button、listbox、option、empty-state） |
| Carbon · Dropdown 解剖 | **6**（label、helper text、field、menu、option、parent checkbox） |
| vocab.design | **1 词 1 演示**（占页面约 20%） |
| uiterms.com | **1 词 1 演示** |
| MDN Try it | **1 属性 1 演示** |
| Josh Comeau | **1 概念 1 演示，控件 1–3 个** |
| Emil 课程 | **1 课 1 交互示例** |

**收敛结论：解剖类 3–7 个标注；行为类 1 个术语 1 个演示。**

**VisLexicon 现状（截图实测）：** 导航台 1 变体 + 13 部件 = 14；表单解剖台 21 部件；Agent 交互界面台 3 变体 + 22 部件 = 25；指针与手势台按文档记 39 条。**是行业上限的 3–6 倍。**

这不是说舞台模型错了。`04-atlas-stage-model.md` 给出的两条理由——横向对比是记住名字的唯一有效方式、结构性术语离开位置就拼不回去——都成立，而且恰恰是竞品做不到的。错的是**把"一族聚在一个舞台"直接等同于"一屏平铺 22 个热区、一次只亮一个标签"**。

问题的严重性在截图里看得很清楚：Agent 台中间是一整屏高保真 Agent 界面，22 个部件散落其中，而任一时刻只有一个黑色标签芯片浮在被描边的那块上。用户没有任何办法知道"这屏上一共有几个有名字的东西""我还有哪些没看过""哪几个是一组的"。左栏那份按 slot 分的扁平列表是唯一的全貌，但它和中间的图之间没有空间对应关系——**位置索引在左栏被拍扁成了字母表，舞台最大的卖点在导航层被抵消掉了。**

**建议的三层结构（不改配色，只改结构）：**

1. **舞台总览态（新增，且应为默认态）。** 进舞台先给一张**全标注图**：所有热区同时显示编号或标签，旁边一列图例（编号 → 正名 → 中文名），点图例高亮对应部件，点部件跳图例——这就是 Carbon 与 M3 的解剖图范式，只是 VisLexicon 的版本是活的。用户第一眼看到的是"这屏一共 22 个名字"，而不是"这屏什么都没有，你自己去扫"。
2. **分区态（新增一层）。** 22 个部件按空间分区切成 4–5 组，每组 3–7 个，符合行业密度。Agent 台的自然分区是：会话列表侧栏 / 会话标题栏 / 消息与推理块 / 输入区 composer / 产物画布。分区是空间的，不是 slot 类型的——**左栏当前按 `变体 / 部件 / 参数` 分组是按数据模型分，不是按用户看到的世界分。用户不会想"我要找一个 hotspot"，他会想"我要找输入框附近那个东西"。**
3. **单词态（现状）。** 聚焦一条，右栏展开。

层级路径变成 `领域 → 舞台 → 分区 → 术语`，比现在的 `领域 → 舞台 → 术语` 多一层，但每层的分支数都落回 3–7。

### 4.2 热区与标注的范式

竞品全是静态图，**这一段 VisLexicon 没有对标物，但有可迁移的原则：**

- **标签必须能同时全开。** 静态解剖图的全部价值就在于"一眼看到全部命名"。VisLexicon 现在牺牲了这一点去换视觉整洁，代价是舞台退化成了寻宝游戏。总览态必须支持全标注。
- **标签芯片当前的放置是对的**（黑底白字芯片浮在描边区块上方），但只有单标签场景成立。多标签时需要引线 + 编号（M3/Carbon 的编号法），否则芯片会互相遮挡。
- **反向悬停已实现且是对的**（文档载明"反向悬停部件则报出正名"），但截图里没有任何视觉提示告诉用户"这张图是可以扫的"。需要一个静置提示或首次进入的一次性引导描边。
- **依附变体的热区**（骨架屏只在加载态存在）在总览态下必须被显式标记为"需切到 X 态才可见"，否则用户会以为清单不全或坏了。

### 4.3 参数条的布局范式

**行业两种范式：**

- **Storybook 式：贴边独立面板，每控件一行**，控件类型覆盖 boolean / number / range / text / radio / select / multi-select / color / date / file / object。
- **Comeau 式：控件紧贴它所影响的那个演示**，每处 1–3 个，穿插在正文里。
- **MDN 式：预设值点选**（`linear` / `ease-in` / `steps(6, end)` / `cubic-bezier(...)`），不给空白滑块，让人一眼看出取值区间与差异。
- **Carbon 式：主题与变体两个选择器放在 demo 上方**，只有两个，且都是切换而非微调。

**VisLexicon 现状与差距（截图实测）：**

三个滑块横排在画布底部，形式为 `标签 …… 数值` 一行、轨道一行。导航台是"侧栏宽度 168px / 导航间距 14px / 圆角 8px"，表单台是"字段间距 16px / 控件圆角 9px / 控件高度 36px"。差距有四条，且都不是审美问题：

1. **横条容量上限约 3–4 个。** 一旦某个舞台需要 8 个参数（动效台必然需要：duration、delay、stagger、easing、spring stiffness、damping、overshoot、reduce-motion），横条就装不下。侧贴面板可纵向无限延伸，这是范式选择问题，不是排版问题。
2. **文档说支持 range / boolean / enum 三类，截图里三个舞台全是 range。** enum 与 boolean 在横条里没有合理位置（下拉和开关的高度与滑块不齐）。侧面板每行一控件天然容纳异构控件。
3. **param 与 knob 视觉上完全一样，违反项目自己的契约。** `04-atlas-stage-model.md` 明确区分：`param` 是有正名的术语挂点，`knobs` 是"没有对应术语的纯微调旋钮……不伪造术语 id"。这个区分在数据层做得很干净，在界面上却一点痕迹都没有——"侧栏宽度"和"圆角"这两个是不是术语，用户无从判断。既然项目把"不伪造术语"当原则，界面就必须把这条原则可见化：术语参数带正名标记且可点进右栏，无名旋钮明确归入一个"微调"分组且不可路由。
4. **没有预设值，只有连续滑块。** MDN 的做法更适合教学：给 3–5 个有名字的档位（"iOS 默认弹簧""Material 标准缓动"），让人先看出差异，再用滑块微调。纯滑块的问题是用户不知道往哪拖才有意义。

另需补上 Storybook 有而 VisLexicon 没有、且 02 色彩领域必需的两类控件：**color（带预设色板）**与 **object（JSON 编辑）**。

### 4.4 演示与文字的位置关系

MDN 把 Try it 放在 **Syntax 之前**；Comeau 把演示**穿插在解释之后**；vocab.design 的配比是 **20% 演示 / 80% 文字**；Carbon 把 Live Demo 放在 Overview **之前**。

**共同点：演示永远在解释之前。** VisLexicon 的三列外壳其实做到了这一点（中间是演示，右边是文字），但代价是右栏那份长文档被挤成一条窄柱：Tabs 词条的右栏依次是标题、中文名、机器译名提示、两个 tag、中文定义、英文定义、绿色批注、别名（7 个）、媒介绑定、专精标杆库（3 张卡）、来源（3 张卡）、网站库已收录——**13 个区块塞在一条约 300px 宽的柱子里，且最有价值的原创内容（绿色编辑批注"同一层级里换视图，不改变'我在哪'"）排在第 7 位。**

Laws of UX 的节奏值得直接借鉴：**一句能背下来的定义 → 3 条能用上的要点 → 才是出处与延伸。** VisLexicon 右栏应重排为：正名/中文名 → **编辑批注（升到第 2 位，这是全站唯一别人没有的内容）** → 一句定义 → 别名与易混淆 → 其余全部折叠（英文原文定义、媒介绑定、标杆库、来源、网站库合并成一个"证据与去处"折叠区）。

---

## 五、术语页与真实网站案例互链：谁做了，怎么做的

**结论：真正意义上的"术语 ↔ 野生真实网站"互链，全行业没有人做。** 现有的四种做法都只走了半步：

**做法一 · 术语 → 设计系统文档（Component Gallery）。** Tabs 页列出 80 个设计系统的实现，每个带缩略截图 + 名称链接 + 所属系统 + 技术标签 + 特性徽章。这是把"术语"连到"权威文档"，不是连到"真实产品"。价值在于证明这个词是真在用的，且能一眼看出各家长得多不一样。

**做法二 · 术语 → implementations 字段（vocab.design）。** combobox 页给出 APG / shadcn / Carbon 三个实现。比 Component Gallery 轻，只是个清单。

**做法三 · 真实产品截图 ← 原理标注（Growth.design，反向）。** 53 个案例把 106 条心理学原理标注在 Tinder、Airbnb、Spotify 等真实产品的截图上，逐屏走。**这是方向相反的做法：不是从词找案例，是从案例学词。** 对 VisLexicon 极有参考价值，因为策展频道本来就有每站三张截图（身份/范围/事实证明），在截图上标注图鉴词条是现成可做的动作。

**做法四 · 术语 → 代码库来源（uianatomy.dev）。** 每条实现带 GitHub 具体文件路径 + fetch 日期。这是"证据"而非"案例"。

**VisLexicon 已经在做但没做好的。** 右栏底部三个区块——「专精领域标杆库与工具」（Bento Grids、The Component Gallery、Land-book / assistant-ui、Vercel AI SDK Showcase、Open-Pencil、21st.dev）、「来源」（Ark UI、Bulma、Chakra UI / GOV.UK、Vuetify / assistant-ui Elements，各带许可证与核验日期）、「网站库已收录」（@assistant-ui/react-markdown 等）——**这三块合起来正是全行业没人做的那件事：一个词同时连到"哪个库最擅长它""这个词的定义从哪来""我们策展库里哪些真实网站有它"。**

但呈现方式毁掉了它：三个语义完全不同的东西（推荐去处 / 定义出处 / 站内互链）用了几乎一样的卡片样式，堆在一条窄柱的最底部，且都在首屏之外。来源卡带的 `MIT · 2026-09-03` 是全站最硬的可信度证据，被排在第 11 位。

**具体建议：**

1. **把三块合并为一个「去哪儿看真的」区**，但内部用三种明显不同的行式而非同款卡片：出处（带许可证与核验日期，最紧凑）、去处（带一句为什么推荐）、站内案例（带真实网站截图缩略图，因为策展库本来就有图）。
2. **补上 Growth.design 的反向路径。** 策展条目的三张证据截图上，允许编辑打点标注"这里用了 X 词条"，点开跳图鉴。这条链路建成后，图鉴与策展就不再是两个孤岛（简报 §12.3 的原话诉求），而且是**全行业独一份**——竞品要么只有词典没有真实网站库，要么只有网站库没有词典。
3. **在术语条目上显示厚度数字**（IxDF 的做法）：「1 个舞台 · 3 个来源 · 2 个真实网站 · 也出现在 2 台」。当前"也出现在 X 台"的跨台互引已实现但不在视野里。

---

## 六、对 VisLexicon 图鉴的具体建议

### 6.1 先解决数字自相矛盾，否则一切诚实标注都是空话

现有材料给出的规模互不相符：`_BRIEF-for-agents.md` 写生产环境 1,932 术语 / 27 来源 / 6 已发布、9 舞台 170 术语；`04-atlas-stage-model.md` 写词条 659、已入台 162、待建档 497；`01-design-review-brief.md` §12.1 写 62 个带本地演示的正式词条 + 419 条 Visual Atlas 记录（其中 417 候选）；三张截图的页脚统一显示「已入台 170 / 1046 · 9 台」。

**这里至少有四套互不兼容的分母（419 / 659 / 1,046 / 1,932）。** 对比 uianatomy.dev 每页盖 `Last reviewed 2026-05-05`、namethatui.org 首屏写"44 reviewed patterns / 0 AI-generated confidence scores"、Component Gallery 首页三个数字与 About 页口径一致——**竞品的可信度全部建立在"数字只有一套且当场可验"上。** 在前台做任何"诚实呈现候选"的设计之前，必须先定义清楚：什么叫一条术语、什么叫一个词条、什么叫已入台，并让全站只用这一套口径。这是本轮最优先、也最不需要设计能力的一件事。

### 6.2 默认入口应该是什么

**当前是舞台（截图里默认落在某个具体舞台，左栏 8 个领域中 3 个标 `规划中`）。三个可比对手没有一个这样做：** vocab.design 首页就是全量词表（"The vocabulary is on the front page, in full"）；namethatui.com 首页是 "Describe the thing…" 搜索框 + Newest/Popular 网格；Component Gallery 首页是三个规模数字 + 组件网格 + 设计系统网格。简报 §12.2 也已经明确否定过"默认打开 Bento Grid / Agent GUI"。

**建议：默认入口改为一个索引页，同屏并列四条入口（对应简报已确认的四种中立入口），且每条都给真实数字：**

1. **「描述它」自由文本框**（对应"我知道名称，或能描述它"）——同时吃正名、中文名、别名、口语描述。这是 namethatui.com 的 "Describe the thing…" 与 vocab.design 的别名 glossary 的合并版，也是投入产出比最高的一个新功能：别名数据（Tabs 有 7 个、Checkboxes 有 3 个）已经有了，缺的只是把它接进搜索索引并新增一个"口语说法"字段。
2. **「它在界面的哪个位置」**（对应"我知道自己正在做什么"）——一张抽象版面图（顶栏/侧栏/主区/底部输入区/浮层），点一个区域，列出该区域下的所有术语与所属舞台。**这是全行业空白，也是舞台模型唯一没被用起来的能力。**
3. **「它属于哪种现象」**——8 大领域，每个必须带真实的已建档数与总数，不能再有裸的 `规划中` 标签而不说规划中意味着多少条。
4. **「系统补全见识」**——舞台列表，每台标明部件数与已订正比例。

舞台从"首页"降为"从术语点进去的展示面"和"第四入口"，不再是必经之路。

### 6.3 62 个正式词条 vs 大量 candidate 怎么在前台诚实呈现

**现状是最差的一种：** 页脚一行 10px 的「已入台 170 / 1046 · 9 台」，左栏把未入台的灰置，未入台条目进"待建档"伪台。技术上是守恒的、诚实的，但**用户视角上等于没说**——没人会去读页脚，而灰置不告诉人"灰是因为还没做"还是"灰是因为不可用"。

**行业已验证的三种做法，建议全部采纳：**

**① 状态标签写在每一个条目上，且可筛选（学 Growth.design 与 namethatui.com）。** Growth.design 把 "Coming Soon" 直接印在 106 条原理的同一个列表里，成品与空壳同列同框；namethatui.com 给每个视觉风格标注**术语地位四分法**（Industry-coined trend / Vendor design language / Retrospective label / Contested label）。

VisLexicon 需要的是**两套正交标签，不要混成一个字段**（这也是简报硬约束里"分类、标签、事实证据是不同维度"的直接应用）：

- **建档深度**（我们做到哪一步了）：`已入台`（有活体演示，当前 170 条）/ `有证据`（有定义与来源但无演示）/ `仅采集`（只有来源里的一行）。
- **术语地位**（这个词在行业里算什么）：`标准术语`（APG/WHATWG/HIG 有正式定义）/ `行业通行`（多个主流设计系统在用）/ `厂商用语`（单一厂商）/ `有争议或追认`。第二套标签目前完全不存在，但它恰恰是图鉴区别于组件清单的地方——1,932 条里必然大量是某一个库的私有叫法，现在它们和 `Tabs` 混在同一个分母里。

**② 每条给复核日期（学 uianatomy.dev）。** 来源卡上已有 `MIT · 2026-09-03` 这类日期，但那是来源的采集日期，不是词条本身的复核日期。uianatomy.dev 的做法是逐源 fetch 日期 + 全页 Last reviewed 双层。VisLexicon 应在词条级加一个"人工复核于"，没复核的就空着——空着本身就是信息。

**③ 把规模的不完整写进产品自我介绍（学 A11Y Project 与 namethatui.com）。** A11Y Project 在首页写 checklist "targets many, but not all level A and AA concerns"；namethatui.com 在风格页写"no honest list of all design styles"存在，只收有可信来源与可辩护信号的条目。VisLexicon 的图鉴首页应该有一句同等分量的话，把 62 / 170 / 1,932 的关系一次讲清楚，并且**把 62 当卖点而不是当短板**——namethatui.org 拿"44 条已复核、零 AI 置信度分数"当首屏卖点，规模小反而成了可信度证据。1,932 条机器采集的清单在 vocab.design 的 1,124 条精编词条面前不占优势；**62 条真的能跑、真的能调、真的复核过的词条，才是别人抄不走的。**

**④ 机器译名欠账要在前台可见。** 文档记录台上 55 条仍挂机器译名、未入台 497 条一条没校。当前界面在 Tabs 页显示"语料原译「选项卡」已在台上订正"——**这条做得很好，是全站最诚实的一个微设计，应该推广而不是只在已订正条目上出现**：未订正的应显示"中文名为机器翻译，未经人工校对"，而不是默默显示一个可能是"作曲家""骷髅"的译名。

### 6.4 舞台 UI 的结构性重排（不涉及配色）

按优先级排列，每条都对应上文的具体证据：

**第一 · 新增舞台总览态并设为舞台默认。** 全热区标签同时可见（编号 + 引线 + 侧列图例）。理由：全行业解剖图的存在价值就是一眼看到全部命名；VisLexicon 当前一次只亮一个标签，把静态图的唯一优势丢了却没换来别的。

**第二 · 在舞台与术语之间插入"分区"层，每区 3–7 个部件。** 分区按空间划分（Agent 台：会话侧栏 / 标题栏 / 消息与推理块 / 输入区 / 产物画布）。理由：行业密度上限 3–7，VisLexicon 现为 14–25。

**第三 · 左栏改按分区组织，而不是按 slot 类型（变体 / 部件 / 参数）组织。** 理由：slot 是数据模型的概念，用户找的是"输入框旁边那个东西"。当前左栏还同时承载 8 领域树 + 搜索框 + 术语列表三种东西，搜索框夹在中间把列表切成两半——搜索应上提到栏首或全局。

**第四 · 参数从底部横条改为侧贴面板，每控件一行（Storybook 范式）。** 并做三件事：把 `param`（有正名，可点进右栏）与 `knob`（无正名，归入"微调"分组，不可路由）在视觉上分开；给 enum 与 boolean 留出合理行高；给关键连续量补 3–5 个有名字的预设档位（MDN 范式）。理由：横条容量上限 3–4，动效领域必然超出；且 param/knob 不分违反项目自己的契约。

**第五 · 右栏按 Laws of UX 的节奏重排：正名/中文名 → 编辑批注 → 一句定义 → 别名与易混淆 → 折叠的"证据与去处"。** 理由：当前 13 个区块塞在一条窄柱，最有价值的原创批注排第 7，最硬的可信证据（带许可证与日期的来源卡）排第 11。

**第六 · 新增 /vs/ 式歧义对照为一等路由。** 优先做 namethatui.org 那 8 个歧义簇里 VisLexicon 已有舞台覆盖的部分：Tabs vs Segmented Control（导航台已有 Tabs）、Checkbox vs Radio vs Switch vs Toggle（表单台三者齐备）、Combobox vs Autocomplete vs Select（表单台已有 Select / Dropdown Select / Combobox）、Tooltip vs Popover vs Hover Card（浮层台）。用 namethatui.org 的五轴行为矩阵（焦点 / 键盘 / 消解方式 / 模态性 / 持久性）当模板。

**这一条是 VisLexicon 唯一能碾压全部竞品的功能**：所有人的歧义对照都是静态图配文字，只有 VisLexicon 能把两个易混淆的东西**同屏、活体、同参数**摆在一起让人当场按一按。表单解剖台的截图里，Checkboxes 与其下方的 radio 组已经天然同屏了——把它变成一个有意为之的对照，成本极低。

**第七 · 移动端必须换外壳，不是压缩三列。** 三列在 1440 下已经很挤（中间舞台约占 50% 宽，参数条被压在底部）。移动端的可行形态是：舞台占满宽度 + 总览态全标注 → 点标签从底部升起术语抽屉 → 参数在抽屉内。这与后续「拼装台」文档里"不用三列、配置面板悬浮或碰边缘弹出"的方向一致，可以先在图鉴上验证。

### 6.5 八大领域应该先做透哪几个

判据两条：**(a) 这类词是不是"文字讲不清、必须调参数才懂"**（决定活体舞台的边际价值）；**(b) 竞品是否已经饱和**（决定投入是否浪费）。

**应先做：06 动力学与微动效。** Emil 的 animation-vocabulary 有 90 条术语、11 个类目，**全是纯文字、零演示**；animations.dev 正课付费且到 2027 年才重开；vocab.design 有 motion 类目但演示是孤立小 demo，无参数；Josh Comeau 只覆盖 CSS transitions 一个切面。而这类词（rubber-banding、morph、overshoot、stagger、spring stiffness/damping）**在文字里根本无法区分**——"resistance and snap-back when you drag past a boundary"这句话读十遍也不如把 rubberband 系数从 0 拖到 1 一次。VisLexicon 的 range/boolean/enum 参数模型在这里边际价值最高，指针与手势台（39 条，已含 threshold / axis / rubberband / filterTaps / swipe.velocity）已经是半成品。

**其次：01 文字与排版体系的动力学部分。** 文字浮现台已有 10 个变体在跑。Typewolf、Fonts in Use 是案例库不是术语演示；vocab.design 有 typography 类目但同样是静态小 demo。Text Scramble、Velocity Text Stretch、Magnetic Character Hover、Wave Sine Distortion 这类词同样只能靠调参数理解。且这是简报 §3 里点名的"排版学中浩瀚的字形解剖、字号阶梯、艺术字材质与文字动力学"缺口。

**第三：02 色彩、光影与材质（当前标 `规划中`）。** 竞品覆盖极薄——namethatui.com 的 16 个视觉风格是全行业最全的材质命名表，且它已经给出了**术语地位四分法**这个现成模板可以直接对齐。Glassmorphism / Neumorphism / Claymorphism / Neo-Brutalism / Aurora Mesh / Noise Grain 这些词的判别信号（模糊半径、内描边宽度、双向高光、硬边位移投影）**天生就是参数**。补上 Storybook 式 color 控件后，这个领域的舞台几乎是自动成立的。

**应停止投入：05 交互控件与原语。** 这是当前投入最重的领域（浮层 14 + 表单解剖 21 + 数据展示 19 + 导航 14 = 68 条，占已入台 170 的 40%），也是竞品最饱和的：Component Gallery 60 组件 / 95 系统 / 2,671 示例、uianatomy.dev 47 组件三视图带逐库分歧表、vocab.design 的 component 类目、APG 34 patterns、Open UI 35+ 研究页、外加每一个大厂设计系统自带的文档与 MCP。**VisLexicon 在这个领域拿不出任何一条别人没有的信息**，唯一的差异（活体可调）在按钮、复选框这类静态控件上边际价值最低——一个 checkbox 长什么样，静态图说得清清楚楚。

**08 复合场景与界面范式（Agent 界面）的处理要小心。** 客观上它是真空——没有任何竞品收录 Composer、Reasoning Block、Tool Call、Artifact Canvas 这套 2025–26 才成形的词汇，而 VisLexicon 的 Agent 台已有 25 个挂点，右栏还接了 assistant-ui、Vercel AI SDK Showcase、Open-Pencil、21st.dev 四个对口去处。**但简报 §12.2 已明确警告"Agent GUI 只是一个场景，不代表整个视觉设计世界"，不应占领默认首页。** 建议：作为差异化内容继续做深（它是唯一能带来"只有这里有"流量的领域），但严格约束在"从索引进入的一个场景"，不做默认入口，也不让它在导航层的权重超过任何一个一级领域。

**排序结论：06 动力学 > 01 文字动力学 > 02 材质与表面 > 08 Agent 场景（做深但不做首页）> 04 空间布局 > 07 输入模态 > 03 几何轮廓 > 05 交互控件（停止扩张，只维护）。**

---

## 附：本次未能核实的清单

以下事项本次抓取受阻，报告中未据此下任何结论，后续需用浏览器实测补齐：

- Component Gallery 的 **Name distribution 图表具体数据**（JS 渲染，仅确认区块标题存在）
- **Material Design 3** 与 **Apple HIG** 组件页的分节结构、解剖图是否可交互、是否有实时演示（两站均需 JS）
- **Checklist Design** 的清单数、条目数、可勾选与进度保存、来源引用、商业模式（`/browse` 与 `/components` 两次抓取均只返回 metadata）
- **Design System Checklist** 的条目数与进度功能
- **Polaris** 当前组件文档结构（原 URL 已 302 至 shopify.dev）
- **Atlassian Design System** 组件页的 tab 结构、props 表、解剖图（仅确认 llms.txt 存在）
- **UI Patterns** 单条模式页的内容结构与模式总数
- **animations.dev 的网页版 `/vocabulary` 页是否存在**（skill 引用了它，但 https://animations.dev/vocabulary 当日 404）
- **Use Your Interface**（robots.txt 禁止抓取，全部细节未知）
- **全部竞品的移动端表现**（本次未做移动端实测）
- **IxDF 会员定价**、**Laws of UX 书与卡组的具体价格**
