# 竞品深调：策展 / 灵感库赛道现状（2026-09-05）

## 结论先行（10 行）

1. 这个赛道在 2025–2026 完成了一次身份切换：从"给人看的图片墙"变成"给 Agent 供料的检索后端"。Mobbin（2026-05-11）、Refero（2026-03-10）、Gummble、Appllama 都已上线 MCP，且**全部锁在付费墙后**。
2. 谁做到"不靠分类树也能逛"？**没有一个真正做到**。Refero 用"风格词 + AI 搜索"最接近，Toools 的 finder 只是两维筛选器，其余全是分类树 + 计数徽章。任务式入口在整个赛道是空白。
3. 老式画廊正在收缩或改名：Godly.website 现 302 跳转到 recent.design；Nicelydone 仍活但节奏稀（最新 changelog 为 2026-08）；Siteinspire 的 About 说"8,000+"，首页切面计数只有 2,376。
4. 数字诚实度整体很差。Refero 官方口径在半年内从 66,000 → 125,000 → 135,000 → 150,000；Refero Styles 首页说"2,000+"，自己的子页说"1,200+"，Tailwind 页说"203"。
5. Refero 详情页的信息节奏（`northStar` → 白话 → token → dos/donts → 导出）已被其官方 MCP 数据模型公开确认，**但数据模型里没有任何字段把某条判断连回具体页面证据**。这是 VisLexicon 唯一能打、且有一手证据支撑的差异点。
6. 卡片最佳实践：Appllama 把"月收入 / 下载量 / 评分 / 已抓帧数"放上卡片——判断依据而非装饰标签；反例是 Awwwards 的卡（分数+奖章+日期，全是元数据，零内容判断）。
7. 视频/动态预览在这一赛道**远没有普及**：recent.design 用静态 WebP 海报，Awwwards 目录卡无 hover 视频，Mobbin 把 animations 做成付费墙内的独立内容层。Refero 的卡上视频仍是少数派做法。
8. 商业模式高度趋同：$6–$15/月的个人订阅 + 团队按席位。Land-book 的做法最值得警惕——它把**筛选和搜索本身**做成付费功能。
9. "URL → DESIGN.md"已经不是空白：designmd.cc、uiscanner.com、mydesignmd.com 三个 2026 年产品都在做，且都免费或近免费。VisLexicon 第三阶段的这个工具**已经没有先发优势**。
10. 版权姿态普遍虚伪：Mobbin 条款明文禁止"用 AI/ML 制作衍生品或竞品"，同时自己卖 MCP 把 621,500 张他人截图喂给 AI 编码工具。

---

## 方法与可信度说明

本轮只能用 WebSearch + WebFetch，出站 curl 被代理拒绝。多数竞品是 SPA，WebFetch 只拿到 meta 标签（Refero 主站、Refero Styles 单个风格页、Mobbin 主站/pricing、Screenlane、Land-book 首页、oreo.design 均属此类）。因此：

- **凡标"官方页面"的事实**，都来自 WebFetch 成功渲染的该产品自有域名页面。
- **凡标"第三方"的事实**，来自评测站/比价站/新闻稿，可信度低一级，已逐条标注。
- **凡我没能亲自看到的**，写"未核实"。特别地：Refero 主站首屏结构、卡片视频参数、Mobbin 前台切面结构，本轮**未能独立复核**。
- 所有 URL 访问日期均为 **2026-09-05**。
- Gummble 自己的博客用于描述 Gummble 时视为官方口径，用于描述 Mobbin/Refero 时视为**有利益冲突的第三方**。

---

# 一、逐个产品档案

## 1. Refero / Refero Styles

**定位。** "Design research for humans and AI"（Product Hunt 产品页 tagline，https://www.producthunt.com/products/refero ，2026-09-05）。主站 meta 自述为 "The largest collection of UI/UX references and design inspiration for web and iOS"（https://refero.design/ ，2026-09-05）。

**目标用户。** 产品设计师 + 用 Cursor/Claude Code/v0/Lovable 写界面的工程师，以及这些人的 Agent。官方 Skill 仓库把自己定义为 "Research-first design skill for AI agents"（https://github.com/referodesign/refero_skill ，2026-09-05）。

**内容规模与更新节奏（这一段本身就是证据）。** 官方口径在一年内翻了一倍多，且**同时存在互相矛盾的多个数字**：

| 数字 | 出处 | 日期 |
|---|---|---|
| 66,000+ web 和 iOS 设计 | Product Hunt 上 Refero 3.0 描述 | 2024-06-20 |
| 6,000+ user flows + AI search | Product Hunt 上 Refero 4.0 描述 | 2025-05-29 |
| 125,000+ screens / 400+ products | everydev.ai 收录页（第三方） | 标注 2026-03 |
| 135,000+ screens listed | gummble.com 对比页（**竞品**，标注核价日 2026-08-25） | 2026-08-25 |
| 150,000+ real app screens、6,000+ user flows | **官方** refero_skill README | 2026-09-05 读取 |
| 2,000+ AI-readable design systems | **官方** styles.refero.design 首页 | 2026-09-05 |
| 1,200+ curated design references / 1,200+ styles | **官方** styles.refero.design/design-md/design-md-for-ai-agents 与 /ai-agents/design-md-examples | 2026-09-05 |
| "24 curated references from 203 matching styles" | **官方** styles.refero.design/ai-agents/tailwind-design-tokens | 2026-09-05 |
| "fetches all styles from the Refero API (~60 styles across 3 pages)" | 第三方 MCP 实现者的观测，mcpservers.org/servers/faridjafarlee/refero-styles-mcp-server | 2026-09-05 |

同一产品的 styles 数量出现 2,000 / 1,200 / 203 / ~60 四个口径。最后一个是第三方按公开 API 实际翻页得到的，未独立复核，但它和官方首页差 33 倍，值得记一笔。

**商业模式与价格。** Free / Pro / Team / Lifetime / Enterprise（官方 https://doc.refero.design/help/plans ，2026-09-05）。官方文档**不写价格**，把人推到 SPA 的 /pricing 页（本轮抓不到正文）。第三方口径：Pro $10/月按年付、Team $12/席/月、免费层约为全库 3%（gummble.com/compare/refero-alternative，2026-08-25，竞品来源）；everydev.ai 写 £10 / £12（2026-03）。官方明确的两条：**无免费试用**、学生 Pro 打 6 折。

**首页首屏。** 未能独立复核（SPA）。Ben 的实测记录（`context/01-design-review-brief.md` 第 4.3 节）：自然语言搜索框 + 一组会变化的风格词入口 + Trending/Popular/Newest 三种排序 + 三列卡片流 + 海报加短视频。本轮无法证实或证伪。

**发现方式。** 官方 MCP 工具集反向暴露了它的切面维度（https://doc.refero.design/mcp/tools ，2026-09-05）：screen 记录带 `page_types`、`ux_patterns`、`ui_elements`、`hex_colors`、`fonts`；site 带 `categories`。第三方描述其前台筛选为"tag、company、font、color、page type、pattern、element"，并支持**上传图片找视觉相似**（everydev.ai，2026-03）。有 AI 搜索（Refero 4.0 起，Product Hunt）。**没有任务式入口。**

**卡片解剖。** 未核实（SPA）。

**点击后行为与详情页信息顺序。** 前台详情页未能复核，但官方 MCP 数据模型公开了 style 对象的字段顺序，这等价于详情页的信息骨架（https://doc.refero.design/mcp/data-model ，2026-09-05）：

`uuid / title / url / platform / preview_url` → **`northStar`（视觉论点一句话）** → `theme` → `colors`（带语义角色）→ `typography` / `typeScale` / `spacing` / `layout` → `elevation` + **`elevationPhilosophy`** → `components` → `imagery` → **`dos` / `donts`** → `customSections`。

文档原话："Styles are guidance, not templates. Preserve token roles and media roles instead of copying."

**这条证据同时确认了 Refero 的强项和它的洞。** 强项：`northStar` 和 `elevationPhilosophy` 说明它刻意把"判断/哲学"放在"数值"之前——先给人一个能记住的说法，再给数字。洞：**整个数据模型里没有任何字段把某条 color/spacing/component 判断连回具体页面、画面区域或截图坐标**。screen 和 flow 只有 `content.description` 这样的散文摘要。用户无法判断某条规则是量出来的还是推出来的。Ben 在简报 4.3 里的判断，本轮拿到了一手证据支持。

**内容质量控制。** 未见公开的审核流程、投稿流程或证据标准说明。Product Hunt 评论里有用户要求"更频繁地更新已改版产品的设计"（https://www.producthunt.com/products/refero ，2026-09-05）——即存量条目会过时。

**移动端。** 未核实。

**面向 Agent / 开发者的接口（这是它 2026 年的主战场）。**
- **Refero MCP**，2026-03-10 上线（Product Hunt）。端点 `https://api.refero.design/mcp`，OAuth，只读。
- 工具全集（官方 https://doc.refero.design/mcp/tools ，2026-09-05）：`refero_search_site`、`refero_search_app`、`refero_search_styles`、`refero_get_style`（支持一次取 10 个）、`refero_search_screens`（必填 `platform`: web|ios）、`refero_get_screen`、`refero_get_similar_screens`、`refero_get_screen_image`（`image_size`: thumbnail|full）、`refero_search_flows`、`refero_get_flow`。每个工具都支持 `response_format: "md" | "json"`——**同一份数据两种渲染，md 给 Agent 直接塞 prompt，json 给程序**。
- **配额：每位授权用户每个计费周期 8,000 次 MCP 工具调用，不结转**（官方 https://doc.refero.design/mcp/getting-started ，2026-09-05）。需 Pro / Team / Lifetime。
- **llms.txt**：`https://doc.refero.design/llms.txt` 存在，自述为 "Machine-readable index of Refero MCP, tools, data model, examples, Skill, and product documentation"（2026-09-05）。另有 OpenAPI spec。
- **Agent Skill**：`referodesign/refero_skill`，**MIT 许可**，可装到 Codex / Claude Code / Cursor / Gemini CLI，manifest 里不含 token（2026-09-05）。
- Figma 插件（付费层）。
- 至少两个**第三方**非官方 MCP 在爬 styles.refero.design：`faridjafarlee/refero-styles-mcp-server`（工具 `refero_list_styles` / `refero_search_styles` / `refero_get_design_md` / `refero_match_style`）和 `fidgetcoding/refero-design-mcp`（2026-09-05）。官方对此无公开表态。

**版权/合规姿态。** `doc.refero.design/legal/copyright` 与 `/legal/terms` 本轮均返回 404（2026-09-05），只在 llms.txt 索引里看到这些条目名。**Refero 的具体版权条款本轮未核实**——Ben 简报 4.3 记录的"禁止批量抓取、再分发、建立竞争数据集、训练或评测模型"来自更早的阅读，本轮无法复核。值得注意的是它自己在 MCP 文档里写 "all data stays server-side. Only the results your agent requested come back"——这是把版权风险转成技术约束的写法。

**最可学的 1–2 点。**
1. **同一份结构化数据的两种渲染（`response_format: md | json`）**。这正是 v2 反馈 3.2 想要的"同一数据层，两种渲染"，Refero 已经在生产里跑了，且是在 MCP 层而不是页面层做的。
2. **把"判断"字段化**：`northStar`、`elevationPhilosophy`、`dos`/`donts` 不是散文，是 schema 里的一等公民。这意味着编辑判断可以被检索、被 Agent 消费，而不只是页面上的一句话。

**最明显的 1–2 个缺陷。**
1. **判断与证据脱钩**：数据模型无证据回链字段，用户无法分辨测量与推断。
2. **数字失控**：2,000 / 1,200 / 203 三个 styles 口径同时挂在自己域名的不同页面上。这不是营销夸张，是内部没有单一事实源。

---

## 2. Mobbin

**定位。** "The world's largest mobile & web design reference library"（Mobbin 在 darkmodedesign.com 上的赞助位文案，2026-09-05）。

**目标用户。** 产品设计师、UX 研究、做竞品对标的团队；2026 年起明确加上 AI 编码工具用户。

**内容规模与更新节奏。** 官方新闻稿（2026-05-11，https://www.businesswire.com/news/home/20260511053592/en/Mobbin-Launches-MCP-Server-Giving-AI-Tools-621500-Real-App-Screens-to-Reference ）：**621,500+ 真实 app 截图、142,200+ flows、200,000+ 设计师与团队用户**，覆盖 fintech / e-commerce / health / productivity / social / SaaS，含区域锁定和难找的小众应用，**每周更新**。

第三方口径明显落后且互相打架：uxmagic.ai 写"over 600,000 screens"（2026 评测），coolcuration 写"over 500,000 screens and 1,000 apps"（文章 2026-02-08，更新 2026-08-22）。**引用 Mobbin 规模时应只用 621,500 这个官方新闻稿数字。**

**商业模式与价格。** Free / Pro / Team / Enterprise。官方 pricing 页 403，本轮未能核实。第三方口径互相矛盾且差距巨大：
- getpulsesignal.com（2026-09-05 读取）：Pro **$10/月**（按年），Team **$16/席/月**（按年），免费层只给"最新 4 个 app + 最新 4 个 site"、有限 flows、有限 animations、最多 3 个收藏夹；Finance+ 加购 $399/年（仅 Team/Enterprise）；并称 Mobbin 在 **2026-07 把 Pro 降价 37%**。
- coolcuration（2026-08-22 更新）：Pro £8/月按年、Team £12/成员/月按年，学生 5 折。
- vendr.com（B2B 采购比价，2026-09-05）：Starter $20/席/月、Pro $40/席/月、平均合同额 $4,000。

vendr 的数字与其余差一个量级，**很可能是企业签约口径而非公开牌价**。写进任何对外材料前必须以官方页面为准。

**首页首屏。** 未核实（403）。

**发现方式。** 未能直接复核。可确证的是它的 URL 结构体现分类树深度：`mobbin.com/explore/mobile/ui-elements/gallery`（三段：平台 → 维度 → 具体元素，来自搜索结果 URL，2026-09-05）。第三方描述其组织方式为"step-by-step user flows and patterns rather than isolated screenshots"（coolcuration，2026-08-22）。免费层的限制方式很说明问题：**限制的是"能看哪些 app"和"能不能搜"，不是"能看几张图"**——搜索本身是付费功能。

**卡片解剖 / 点击后行为 / 移动端。** 未核实。已知有 Figma 插件可把参考插入设计稿（uxmagic.ai，2026）。

**内容质量控制。** 未见公开审核标准。内容由 Mobbin 自己抓取而非投稿，这是它和画廊类站点的根本区别——**没有投稿流程，就没有"谁说这个值得收"的问题，但也没有作者署名**。

**面向 Agent 的接口。** **Mobbin MCP，2026-05-11 上线**，端点 `https://api.mobbin.com/mcp`，OAuth，beta，**要求付费 Pro 计划，免费账号不能用**（useloadout.com，2026-06-07）。支持 Claude、Cursor、Lovable。CEO Jiho Lim 的话：*"In the AI era, the challenge isn't generating interfaces — it's knowing what good looks like"*（新闻稿，2026-05-11）。**具体工具名未公开**——第三方评测明确写"the article omits specific tool method names"，Gummble 的对比文也说"Check the current Mobbin tool list rather than inferring absence"（2026-08-25）。这与 Refero 把工具表、参数表、数据模型全部公开成文档形成鲜明对比。
- `mobbin.com/llms.txt` 返回 403，**无法确认是否存在**（2026-09-05）。

**版权/合规姿态（这是全赛道最刺眼的一处）。** Mobbin 条款（https://mobbin.com/terms ，2026-09-05）：
- 截图版权归第三方权利人，"does not claim to have ownership of any features within these Screenshots"。
- 禁止 "recreating and replicating part of or whole of our Services"。
- **禁止用户 "use any automated tools such as artificial intelligence or machine learning" 制作衍生作品或竞争服务**。
- 禁止任何 scraper / robot / bot / spider / crawler。
- 下架流程：写信到新加坡实体地址；**没有正式 DMCA 流程**，援引的是新加坡 Copyright Act 2021。

也就是说：Mobbin 禁止你用 AI 处理它的内容，同时**自己卖一个把 621,500 张他人截图喂给 AI 的 MCP**，而新闻稿对这些截图的版权只字未提（新闻稿全文未提 copyright / licensing / IP）。这是这个赛道最典型的双标，也是 VisLexicon 可以正面区隔的地方。

**最可学的 1–2 点。**
1. **免费层限制"发现能力"而非"内容量"**：给你看最新 4 个 app，但不给你搜。这比"看 20 张就墙"更能逼出付费，也更不伤口碑。
2. **MCP 作为已有订阅的增值而非新 SKU**：所有付费计划直接包含，零额外定价决策。

**最明显的 1–2 个缺陷。**
1. **版权双标**，且下架流程是"写信到新加坡"。
2. **MCP 接口不公开工具表**，Agent 侧无法在接入前评估。这对一个自称给 Agent 供料的产品是硬伤。

---

## 3. Godly（现 recent.design）

**这是本轮最重要的一条赛道变动。** `https://godly.website/` 于 2026-09-05 返回 **302 Found，Location: https://recent.design/**（本轮直接观测）。第三方证实这是改名而非收购：*"Recent Design is the rebranded version of the formerly named Godly platform"*（uwarp.design，文章 2026-06-27）。未找到官方改名公告。

**定位。** "The best design inspiration on the Internet"（https://recent.design/ ，2026-09-05）。

**内容规模与更新节奏。** **官方不给任何总数**。自述"updated daily"（第三方 uwarp.design，2026-06-27）。

**首页首屏。** 干净的导航 + 主要分类可见 + 大图网格，**没有搜索 hero，没有大数字**。

**发现方式。** 顶层是**内容类型**而非题材：Design / Websites / OG Images / App Screenshots / App Icons（官方首页，2026-09-05）。第二层是题材筛选：All / Web / Interface / Branding / Product / Typography / Motion / Illustration / 3D / Editorial / Print / Packaging。第三方另提到 "Best of X" 主题合集和 "Skills/Info" 板块（uwarp.design，2026-06-27）。**分类树深度只有 2 层，且第一层是"东西的形态"不是"行业"**——这一点比 Land-book/Lapa Ninja 的 60–80 个行业标签健康得多。

**卡片解剖。** 静态 WebP 海报图（宽 810–1200px），设计师头像缩略图，链接式标题（如 "esports-controller-microinteractions"），多图时显示 "4 slides" 角标。**无正文覆盖、无 hover 预览描述**（官方首页，2026-09-05）。

**点击后行为。** 进站内详情页，URL 结构 `/i/[ID]-[title]`。

**内容质量控制。** 未见公开投稿流程或审核说明。

**移动端 / Agent 接口。** 未核实。未见 API / MCP / 导出。

**商业模式。** 职位板（首页挂 10 个在招职位）、信息流内赞助位、"Post a job"。**无订阅、无付费墙。**

**最可学的 1–2 点。**
1. **顶层导航按"媒体形态"切分（网站 / OG 图 / App 截图 / App 图标）**，而不是按行业。这直接对应 v2 反馈 6.1 的"三种卡片模板"思路——形态不同就该分开逛，而不是塞进同一个网格再用标签区分。
2. **不报总数**。一个日更画廊选择不报数字，反而没有诚实度问题。

**最明显的 1–2 个缺陷。**
1. **卡片标题是文件名**（"esports-controller-microinteractions"），没有一句人话判断。1.5 秒内只能靠图。
2. **改名没有公告**，老链接靠 302 兜住，品牌资产近乎归零。

---

## 4. Land-book

**定位。** 手工精选的落地页/网站画廊，走"筛选深度"路线。

**内容规模。** 官方 PRO 页（https://land-book.com/pro ，2026-09-05）：**20,000+ hand-picked website examples**、**200,000+ categorized website sections**。同页还有"月活用户"和"作为灵感来源的年数"两个数字显示为 **"0+"**——**官方页面上挂着占位符没填**（2026-09-05 观测）。这是"大数字营销"翻车的现场。

**发现方式（赛道里筛选维度最多的一档）。** 第三方整理为 7 个维度（toolradar.com，2026-09-05）：color（7 项）、typography（3 类）、style（含 3D Animation、Brutalism 等）、industry（Advertising、AI、Ecommerce…）、type（Agency、SaaS、Single Page）、platform（Figma、Framer、Shopify、Webflow、WordPress）。加上"sections"这一整套独立的页面区块库。

**商业模式与价格（这是它最值得研究的一点）。** 官方 PRO 页（2026-09-05）：**$9/月按月，或 $6/月按年（$72/年，省 33%）**。PRO 解锁的是：

> "Unlimited access to website categories"、"Unlimited access to sections"、"Unlimited filter & search results"、移动端预览、历史版本、截图下载、无广告、个人主页可展示 10 个网站 +"Hire me"按钮。

**把"无限制的分类访问"和"无限制的筛选与搜索结果"当作付费功能卖。** 即：免费用户能看内容，但**不能有效地找内容**。这和 Mobbin 是同一套策略，而且更露骨。

**内容质量控制（赛道里说得最清楚的一家）。** 官方投稿指南（https://land-book.com/submission-guidelines ，2026-09-05）：
- 网站和模板投稿**均免费**；模板被选中后需付费才能上架。
- 审核周期：网站 **2 天到 1 个月**（视队列），模板 **7 个工作日内**。
- 审核标准原文：*"current design trends, design aesthetics, website usability and accessibility, as well as content."*
- 投稿人可勾选"我是作者"。
- **"If you don't hear from us within a month, unfortunately it means that your submission won't be featured"** —— 用沉默表示拒绝。
- 不公布通过率，不公布审核人。

**Agent 接口 / 版权姿态。** 未见 API / MCP / 导出。版权条款未核实。

**最可学的 1–2 点。**
1. **"sections"是一个真正的二级内容层**：200,000+ 页面区块独立于 20,000+ 网站存在。这说明"一个站 = 一个条目"不是唯一切法，**页面区块可以是独立的可检索对象**。VisLexicon 的"三张证据图"其实已经在做类似的事，只是没把每张图当成可独立检索的对象。
2. 审核时限写得具体（2 天到 1 个月 / 7 个工作日），比"我们会尽快"诚实。

**最明显的 1–2 个缺陷。**
1. **把搜索和筛选做成付费墙**。这会把免费用户变成只会滚动的人，训练出的是错误的使用习惯。
2. **官方 PRO 页上的 "0+" 占位符**。一个卖"精选品质"的产品，自己的落地页有没填的数字。

---

## 5. Awwwards

**定位。** "recognize and promote the talent and effort of the best developers, designers and web agencies"（https://www.awwwards.com/ ，2026-09-05）。它不是画廊，是**评奖机构**。

**首页首屏。** Site of the Day 单站大展示（当日为 "Illoca"，得分 7.44/10）+ 导航（奖项分类 / trending / technology 筛选）。**首屏是一个带分数的编辑推荐，不是网格也不是搜索框。**

**评审机制（全赛道唯一把"质量"公式化的产品）。** 官方评审说明（https://www.awwwards.com/about-evaluation/ ，2026-09-05）：
- 权重原文：**"Design: 40% points, Usability: 30% points, Creativity: 20% points, Content: 10% points."**
- **至少 18 名评委**打分；系统自动剔除偏离均值最远的 3 个分数。
- 投票期 5 天；若拿到高评委分 + 至少 10 位 Professional 用户投票，可提前拿 SOTD。
- 阈值：**Honorable Mention ≥ 6.5**；**Developer Award ≥ 7.0**（仅对 SOTD 得主单独评）。
- 评委分数**不公开**，除非该站拿到 SOTD。
- 人工审核，提交到上线**最长一周**。

**商业模式与价格。** 官方 submit 页（https://www.awwwards.com/submit/ ，2026-09-05）：
- **单次提交 $65**；"Standard Submission + User Pro" **$165/年**。
- Pro 会员：Basic $6.70/月 或 $80.40/年；Professional $13.80/月 或 $165.60/年；International $324/月 或 $3,888/年（年付标称省 58%）。
- 会员按等级享 10–50% 的提交折扣，以及在 3 个 / 5 个分类中获得曝光。

**这是"付费参评"模型。** 被收录的前提是作者掏了 $65。这决定了它的语料**不是"网上最好的站"，而是"愿意花 65 美元参评的站"**——一个巨大的选择偏差，而且从不被承认。

**发现方式。** 目录页筛选维度（https://www.awwwards.com/websites/ ，2026-09-05）：Awards（SOTD/SOTM/SOTY/Developer/Honorable/Nominees）、Category（23 项）、Tag（50+，如 Animation、3D、Parallax、Typography、Microinteractions）、**Technology（120+，含 React、Vue、Next.js、Figma、Netlify、Vercel）**、**Country（80+）**、**Font（100+，Arial、Avenir、Barlow…）**、Color（十六进制）。另有 Directory 收录 **6,094 家 Agencies and Professionals**（官方首页，2026-09-05）。

**总站数未公开**（目录页不报总数，只有分页）。

**卡片解剖。** 缩略图 + 标题 + 工作室名（常带 "PRO" 徽章）+ 奖章（Developer Award / Site Of The Day / Honorable Mention）+ 获奖日期。**目录页 markup 中未见 hover 视频预览**（2026-09-05）。

**最可学的 1 点。** **把评判标准公式化并公开**：40/30/20/10、18 名评委、去掉 3 个极端分、6.5 和 7.0 两条线。不管这套权重是否合理，**它让"为什么这个站在这里"有了可复核的答案**。整个赛道只有它做到这件事。VisLexicon 的"核验"要想不沦为口号，需要一个同等级别的可公开规则。

**最明显的 2 个缺陷。**
1. **$65 提交费造成的语料偏差从不被承认**，却用"世界最好的网站"来营销。
2. **卡上全是元数据（分数、奖章、日期、工作室），没有一句内容判断**。用户看到 7.44 分，不知道这个站好在哪。这是"字段前置 = 数据库"的教科书反例。

---

## 6. Toools.design

**定位。** "A growing directory of 2,200+ design resources and tools, weekly updated for the community"（官方首页，2026-09-05）。**外链导航站**——它自己不承载内容。

**规模的自相矛盾。** 首页写 **2,200+**，其 /finder 页写 **"2,300+ hand-picked design tools"**（均为 2026-09-05 官方页面）。同一天同一站两个数字。

**发现方式。** 20+ 个主分类，分三组：素材库（AI Tools / Inspiration / Icons / Illustrations / Mocks + UI Kits / Stock Photos）、教育社区（Learning / Community / Blogs & Mags / Podcasts / Books）、专业工具（Productivity / Design Tools / UX Tools / Color Tools / Typography / Marketing / Web Builders）。**树深 2–3 层**。另有 8 个"设计师身份工具箱"（UI / UX / Product / Web / Graphic / Brand / Motion / Marketing designer）——**这是全赛道最接近"任务式入口"的东西，但它是按身份不是按任务切的**。

**/finder 是个筛选器，不是任务入口。** 官方 finder 页（2026-09-05）只有两个维度：Pricing（Free / Freemium / Free + Paid / Free Trial / Paid / Beta）和 Category。**不问用户要做什么。** 无结果时给 "No Tools Found" + 建议投稿。

**卡片解剖。** 纯文本卡：工具名 + 1–2 句描述 + 价格标（Free / Freemium / Paid / Free Trial / Beta）。**没有截图。** 这对一个设计资源站是很大胆的取舍——它赌的是"我知道这个工具叫什么"而不是"我认得这个界面"。

**点击后行为。** **直接外跳**，链接带 UTM（`?via=toools`）。有联署披露（带星号标记）。

**商业模式。** 联盟返佣（Figma、Webflow、Claude 等 9 个合作方 logo 在首屏下方）+ 赞助"Partner picks"+ 折扣码 + newsletter（**3,800+ 订阅者**，官方首页 2026-09-05）。**无订阅、无投稿费**，有 "Suggest a tool"。

**Agent 接口 / 版权。** 未见。外链导航站的版权风险最低。

**最可学的 1–2 点。**
1. **价格标是卡上四个信息之一**。对导航站来说，"免费还是收费"是比截图更强的判断依据。VisLexicon 的"权利/价格微标"（v2 反馈 6.2）方向一致，且有市场验证。
2. **披露联盟关系**（星号 + 声明）。这是内容诚实度上少数做对的一家。

**最明显的 1–2 个缺陷。**
1. **同一天两个总数**（2,200+ / 2,300+）。
2. **8 个"设计师工具箱"按身份切，不按任务切**。"我是 UI 设计师"这个入口的信息量，远低于"我要做一个带工具调用的 Agent 界面"。

---

## 7. Curated.design

**定位。** "Live websites and landing pages, reviewed one at a time"（官方首页，2026-09-05）。**"reviewed one at a time" 是全赛道少见的、把审核过程写进 tagline 的做法。**

**规模。** **不报总数**。首页显示 "Loading websites…"，自述 "growing gallery"（2026-09-05）。

**发现方式。** 内容类型三分：Websites / Sections / Templates。筛选维度：Industries（SaaS、beauty、vacation rental、fintech、portfolio、dental…）、Styles。

**商业模式与价格（结构最清晰的一家）。** 官方 /pricing（2026-09-05）：
- **Free $0**：完整网站库访问、Sections 免费样本、最多 5 个收藏、**基础筛选**、每周邮件精选。
- **Pro $9/月**（按月付，随时取消，7 天试用）：完整 Sections 库、无限收藏、**"Advanced + bookmark search"**、**"CSV / Notion ready" 导出**、优先支持。
- **投稿：标准免费**（排队数周）；**"Skip the queue" $29**，保证 7 天内审核，**含编辑反馈和一次免费重投**。

**$29 买的是审核速度和编辑反馈，不是收录结果。** 措辞上比 Awwwards 的 $65 提交费干净——它明确卖的是"排队权 + 一次编辑意见"，不是"参评资格"。但实质仍是付费影响语料构成。

**CSV / Notion 导出是这一赛道少见的机器可读出口**，虽然远不如 MCP 深。

**Agent 接口。** 未见 MCP / API。

**最可学的 1 点。** **"reviewed one at a time" 写进 tagline，$29 明码标出"7 天内审核 + 编辑反馈 + 一次重投"**。它把编辑劳动定价了，因此"我们真的看过"这句话变得可信——因为你能买到那份劳动。VisLexicon 的"每一个站，我们都真的进去看过"如果配不上任何可验证的机制，就只是口号。

**最明显的 1–2 个缺陷。**
1. **基础筛选 vs 高级搜索的分层**，又一次把"找得到"变成付费功能。
2. 首页 "Loading websites…" 状态被抓到，说明首屏内容完全靠客户端渲染——对 SEO 和 Agent 抓取都不友好。

---

## 8. Nicelydone

**定位。** 一位设计师（Bertrand）的个人截图档案演化成的 SaaS 界面参考库（官方 /about，2026-09-05）。

**内容规模（赛道里最激进的数字）。** 官方 /about（2026-09-05）：**201,600+ 截图、660+ SaaS apps、30,700+ UI components、12,600+ user flows**。

对照一下：Mobbin 用 621,500 张截图覆盖 1,000+ 个 app；Nicelydone 用 201,600 张覆盖 **660 个** app——**平均每个 app 305 张截图**。这不是"精选"，是"穷举一个产品的所有页面"。这解释了它为什么能同时报出 30,700 个组件和 12,600 条流程：都是从同一批穷举截图上切出来的派生对象。

**更新节奏（可核验）。** 官方 changelog（https://nicelydone.club/changelog ，2026-09-05）：最新条目 **2026-08**（新增 Steel、Riverside、Origin Financial、Axiom、Extend、Zaro），最早条目 **2016-05**。**十年连续更新且公开列出每次加了哪些产品**——这是全赛道最好的更新透明度实践，比任何"weekly updated"的口号都硬。

**发现方式。** 按页面类型建独立落地页（如 `/pages/gallery` 标题为 "Gallery Page Design Examples — 160+ SaaS UI Inspiration"，2026-09-05）——**每个页面类型带自己的计数**。

**版权姿态。** 官方 /about 明写 "all screenshots are copyrights of their respective owners"（2026-09-05）。表述比 Mobbin 简单，但同样把风险留给自己。

**价格 / 卡片 / 移动端 / Agent 接口。** 未核实（/about 页不含价格；无 MCP/API 迹象）。

**最可学的 1–2 点。**
1. **公开的、按月的、列出具体新增条目的 changelog**，且能追溯到 2016。这是"过程可见"（简报 3.6）最便宜也最有力的实现方式：VisLexicon 完全可以现在就开一个"本月核验了哪些站"的页面，成本接近零。
2. **按页面类型建带计数的独立落地页**，每个页面都是一个可分享、可被搜到的实体。

**最明显的 1–2 个缺陷。**
1. **201,600 这个数字是穷举的副产品，不是价值的度量**。它和 Mobbin 的 621,500 在同一个坐标系里比大小，但两者的"每张图的信息密度"完全不同，用户无从判断。
2. 十年老站，**未见任何 Agent 侧接口**。它拥有全赛道最结构化的 UI 组件语料（30,700 个），却没有把它变成可被 Agent 调用的东西。

---

## 9. Saaspo

**定位。** "The best SaaS web design inspiration"（官方首页，2026-09-05）。

**内容规模。** 官方首页（2026-09-05）：**3,097 pages、716 sections、379 OG image examples、46 templates**。**报的是精确到个位的实数，不是"3,000+"。** 这在整个赛道是独一份。

**发现方式（切面结构最值得抄的一家）。** 官方首页把每个切面值的**条目数直接标在旁边**（均为 2026-09-05 读取）：

- **Page Types（28 项）**：Landing (1,363)、Pricing (496)、Product (336)、About (191)、Blog (150)、Customers (112)、Careers (73)、Contact (65)、Integrations (56)、Partners (39)、404 (33)、Use Cases (31)、Book a Demo (26)、Enterprise (26)、Why Us (22)、Press (19)、FAQs (19)、How It Works (15)、Compare (14)、Templates (12)、Changelog (8)、Media Kit (8)、Affiliates (4)、Experts (4)。
- **Industries（60+ 项）**：AI (222)、Development (109)、Finance (94)、Design (87)、Marketing (61)、Developer Tools (53)、CRM (41)、HR (40)、Video (40)、Data (38)、Healthcare (33)、Ecommerce (33)…
- **Styles（18 项）**：Scroll Animations (93)、Dark Mode (91)、Gradients (63)、Boxed (59)、Colorful (45)、Bento (30)、Unique Footer (25)、Playful (20)、Ultra-detailed (17)、Black & White (15)、Greyscale (11)、Interesting Buttons (7)、Copy Focused (5)、Technical (4)、Thin Layout (2)、Corporate (2)。
- **Assets（11 类）**：Feature Abstracts (111)、Animated (66)、Images (54)、UI (34)、Vector (14)、Mascot (8)、3D (8)、Paintings (7)、AI Landscapes (6)、Hand Drawn (6)、ASCII (5)、Hover Animations (4)。
- **Tech Stacks（8 项）**：Webflow (387)、Next.js (339)、Other (177)、Framer (168)、Gatsby.js (45)、WordPress (37)、Nuxt.js (21)、Astro (9)。

**这份数据是本报告最有用的单一材料**，因为它暴露了长尾切面的真实分布：Styles 里有 6 个值的条目数是个位数（Corporate 只有 2 个，Thin Layout 只有 2 个）。**一个只命中 2 个条目的筛选值，是编辑部的内部语言，不是用户的导航。** 这正是 v2 反馈 4.4 提出的"词表准入机制（至少命中 5 个站）"的实证依据——Saaspo 在 3,097 个条目的规模下都养出了 2 命中的死值，VisLexicon 在 87 个站的规模下会更严重。

**商业模式。** **完全免费**，靠赞助 logo + newsletter + "Need design? Get a free quote" 导流设计服务（官方首页，2026-09-05）。

**卡片解剖。** 域名 + 站内链接路径 + 平台 logo（示例中多为 Framer 标）。信息很薄。

**Agent 接口。** 未见（2026-09-05）。

**最可学的 1–2 点。**
1. **报精确整数（3,097 / 716 / 379 / 46）而不是"3,000+"**。这一个决定就把它和整个赛道区分开了，而且成本为零。VisLexicon 的 v2 线框写"已核验 87 个站点 · 62 个词条"，方向完全正确，且有市场先例。
2. **每个切面值旁边标条目数**。用户点进去之前就知道会看到多少东西，且能一眼看出哪些值是死值。

**最明显的 1–2 个缺陷。**
1. **五个切面全部平铺在首页**，五组共 125+ 个可点标签。这是"一进首页就面对五个下拉框"的极端版本。
2. **卡上只有域名和平台 logo**，1.5 秒判断完全靠图。

---

## 10. SaaSFrame

**定位。** "Create websites, product interfaces and email sequences for your SaaS faster than ever"（官方首页，2026-09-05）。**tagline 里是三个动词性的产出物，不是"灵感"。**

**内容规模。** 官方首页（2026-09-05）：**5,000+ design examples、100+ SaaS brands（Raycast、Notion、Stripe、Linear 等）、40+ website page categories、50+ product interface patterns**。分类页举例：Landing pages 286、Pricing pages 211、Product dashboards 166、**Account setup flows 597**。

**发现方式。** 按内容类型分三个大区（网站页面 / 产品界面 / 邮件序列），再按页面类别、设计模式（modals、tables、forms、buttons）、色彩主题（明/暗）、设备（桌面/移动）筛选。有 **⌘K 搜索、⌘B 收藏**快捷键——**赛道里少见的把键盘操作做进去的**。

**卡片解剖。** 截图预览（桌面/移动）+ 带 emoji 的分类标签 + **示例数量** + 品牌名。

**点击后行为。** 卡片进分类页；Pro 用户可拿 Figma 文件。

**商业模式与价格。** Free（受限）/ Pro Monthly **$14/月** / Pro Yearly **$139/年**（官方首页，2026-09-05）。付费解锁：完整浏览、Figma 下载、移动端版本、**筛选与搜索**。又一次把搜索放进付费墙。

**Agent 接口 / 更新节奏。** 未核实。

**最可学的 1 点。** **"邮件序列"作为一等内容类型**。它承认了一个事实：用户要做的不只是"页面"。VisLexicon 的对应物是"提示词与 Agent 上下文"（v2 反馈 4.2 切面里已有），值得当成一等内容类型而不是标签。

**最明显的缺陷。** **Figma 文件下载是核心付费点**，这把它绑死在"给人用"的产品形态上——Agent 不需要 Figma 文件，需要 token 和结构。它没有 MCP，在 2026 年的这个赛道里是明确的落后。

---

## 11. Dark Mode Design

**定位。** 单主题极简画廊："dim the lights, lower your screen brightness, and enjoy"（官方首页，2026-09-05）。

**规模。** **完全不报数**。首屏 20 个站，靠 `?page=2` 分页（官方首页，2026-09-05）。

**发现方式。** **没有任何筛选、没有分类、没有搜索。** 只有一个按时间倒序的网格 + Next 按钮。这是全赛道最极端的"零切面"设计。

**卡片解剖。** 缩略图 + 站名（如 "Tiny Computer Co."）+ 链接。**三个元素，没有更多。**

**点击后行为。** 直接外跳。

**内容质量控制。** 官方 /about（2026-09-05）："All sites handpicked and curated by Cai Cardenas"。**署名到个人**。投稿方式：发邮件到 hello@darkmodedesign.com，主题 "Site Submission"。

**商业模式。** 首页网格下方一个 Mobbin 赞助位。**无订阅。**

**Agent 接口。** 无。

**最可学的 1 点。** **单一主题 + 策展人署名 + 零筛选 = 可信**。因为它只做一件事（暗色网站），用户不需要筛选就能理解自己在看什么。**这证明"分类树能不能退出前台"首先取决于语料的同质度。** VisLexicon 的语料横跨组件库、品牌官网、在线工具、术语站——同质度极低，所以 v2 反馈"分类树彻底退出前台"必须靠**任务货架**来补位，不能靠"内容自己解释自己"。

**最明显的缺陷。** 无搜索、无筛选、无总数、无更新日期。想找"某个暗色 SaaS 落地页"只能一页页翻。**这是"逛"做到极致但"找"完全缺席的样本。**

---

## 12. Page Flows

**定位。** 用户流程录屏库——把"用户如何走完一个流程"录成视频。

**内容规模。** 官方 /pricing（https://pageflows.com/pricing/ ，2026-09-05）：**"79,000+ screens library"、"10,000+ brands"、"100,000+ designers"**。注意后两个不是内容规模，是**用户数**，却和内容数字并排展示。官方 /user-flow 页写 "someone has recorded themself over 2,000 times going through different user flows"，**但不给流程总数**（2026-09-05）。

**商业模式与价格。** 官方 /pricing（2026-09-05）：
- Quarterly：**$13/用户/月**（$39/季），3 天免费试用。
- Yearly（标"Popular"）：**$8.25/用户/月**（$99/年），标 "Save 15% Best Value!"。
- Team：**$199/年**，3–10 人。
- 全计划包含："Unlimited access to all user flow recordings"、"Unlimited access to emails"、"Unlimited access to screens and UI elements"、增强搜索筛选、批量下载、无限收藏。
- **试用期后不退款。**

**注意一个数学问题**：$39/季 = $13/月，$99/年 = $8.25/月，从季付到年付实际省 36.5%，页面上却写 "Save 15%"。**官方页面上的折扣率与自己列的价格对不上**（2026-09-05 观测）。

**发现方式。** 按品牌或行业搜索；桌面/移动端区分。**流程类型的具体切面未在公开页展示。**

**内容形态（这是它在本报告里最重要的价值）。** **它是唯一一家把"视频录屏"当作主内容而非卡片装饰的产品**，并且把视频（flow recordings）、静图（screens）、邮件（emails）拆成三个平行内容层，付费权益逐层列出。这说明：**当动态内容是主内容时，它需要自己的浏览层，而不是塞进卡片里循环播放。**

**Agent 接口 / 版权。** 未见 MCP/API（2026-09-05）。版权条款未核实。

**最可学的 1 点。** **动态内容独立成层**。对照 v2 反馈 8：动态预览"是 B 型卡的媒体选项，不是新的内容层级"——Page Flows 的存在恰好说明反面：**一旦动态内容承载的是"过程"而不是"气质"，它就必须独立成层**。VisLexicon 的 5–8 秒品牌片段属于"气质"，判断成立；但图鉴的"活舞台"属于"过程"，那才是真正需要独立层的东西。

**最明显的 1–2 个缺陷。**
1. **把用户数（10,000+ brands、100,000+ designers）和内容数（79,000+ screens）并排放**，制造规模错觉。
2. **官方定价页的折扣率与自己的价格自相矛盾**（"Save 15%" vs 实际 36.5%）。

---

## 13. Screenlane

**本轮未能直接访问**：`screenlane.com` 与 `www.screenlane.com` 均返回 403（2026-09-05）。以下全部来自第三方，可信度低一级。

**定位。** "a premium UI design inspiration gallery showcasing real screens from mobile apps, marketing websites, and web applications"，前身是 UI Movement（plusuidesign.com，2026-09-05）。

**内容规模。** **未核实**。无第三方给出具体数字。

**发现方式。** 按 UI 组件类型（landing pages、pricing pages、notifications、charts、filters、timelines、forms、navigation、card layouts）+ 平台（移动 app / web dashboard / 营销站）（plusuidesign.com，2026-09-05）。

**商业模式。** 免费层给部分屏，付费解锁全库、收藏夹和新增内容（同上）。**具体价格未核实。**

**更新节奏。** 第三方称 "new screens are added continuously"（同上），**无可核验的日期证据**。

**Agent 接口 / 卡片 / 移动端 / 版权。** 全部未核实。

**判断。** 一个 403 的站 + 一个不报数的第三方描述 + 一个"前身是 UI Movement"的历史，说明它已不在这个赛道的主线上。**列出来是为了完整性，不建议作为参考对象投入时间。**

---

## 14. Siteinspire

**定位。** "A showcase of the web's finest design + talent"，日更（官方首页，2026-09-05）。

**内容规模（自己和自己打架）。** 官方首页的切面计数合计指向 **2,376 个网站**（2026-09-05）；官方 /about 页写 **"over 8,000 websites"**（2026-09-05）。**同一天，同一域名，两个差 3.4 倍的数字。** 可能的解释是 /about 是历史累计、首页是当前在线，但页面上没有任何说明。

**发现方式。** 四个切面：Styles / Types / Subjects / Platforms，**每个值带计数**（官方首页，2026-09-05）：
- Styles：Typographic (2,094)、Design & Art Direction (1,917)、Minimal (790)、Grid Layout (660)、Unusual Layout (656)。
- Types：Portfolio (1,409)、Web & Interactive Design (900)、E-Commerce (880)、Fashion (795)、Art (487)、Photography (470)。

**注意 Styles 的分布病态**：Typographic 命中 2,094，占了全部 2,376 个站的 88%。**一个命中 88% 的筛选值不是筛选，是噪音。** 这是长尾问题的另一端——Saaspo 的病是 2 命中的死值，Siteinspire 的病是 88% 命中的空值。**两端都说明"切面值必须有准入规则"，v2 反馈 4.4 的机制设计是对的。**

**卡片解剖。** 站名 + 缩略图 + **设计师/机构名（带个人主页链接）**。

**点击后行为。** **进站内详情页，不直接外跳**（官方首页观测，2026-09-05）。

**内容质量控制（赛道里姿态最干净的一家）。** 官方 /about（2026-09-05）：
- 由 **Daniel Howells 一人策展**，署名到个人。
- 选择标准："creativity and quality visuals, without adhering to rigid selection criteria" —— **承认自己没有硬标准**。
- **"none of the featured sites are sponsored entries."** —— 明确声明无付费收录。
- 投稿免费；用户可给自己参与的项目**补署名（add credits）**。

**商业模式。** **官方 /about 与首页均未见付费计划**（2026-09-05）。靠 newsletter。

**Agent 接口。** 未见。

**最可学的 1–2 点。**
1. **"none of the featured sites are sponsored entries" 是一句可被证伪的承诺**，而"我们精选"不是。VisLexicon 需要的正是这一类句子：说一件别人能拿出反例来打脸的事。
2. **允许用户给条目补署名（add credits）**。这把"署名完整性"变成社区维护的对象，而不是编辑部的负担——对照 v2 反馈第 7 节的"提交 = 给已有条目补证据"，这是同一个机制，且 Siteinspire 已经跑通。

**最明显的 1–2 个缺陷。**
1. **2,376 vs 8,000 的自相矛盾**，且无任何解释。
2. **88% 命中的 Typographic 标签**。切面无准入门槛的必然结果。

---

## 15. Minimal Gallery

**定位。** "a curated source of website design inspiration for creatives"，自 2013 年起，"hand-picked design inspiration, curated daily"（官方首页，2026-09-05）。**赛道里最老的一家。**

**规模。** **不报总数**，但分页显示至少 130 页（官方首页，2026-09-05）。

**发现方式。** 顶层三类：Websites / Templates / Tools。**内容标签 70+ 个带计数**：Portfolio (977)、Personal (799)、Agency (753)、E-commerce (140)、Startup (126)、One page (122)、Architecture & interior design (119)…；**平台**：Framer (123)、Readymag (22)、Webflow (18)、Shopify、Squarespace…（均为 2026-09-05 官方首页）。

同样的长尾病：前三个标签（Portfolio / Personal / Agency）合计 2,529 次命中，而 E-commerce 只有 140。

**卡片解剖。** 缩略图 + 站名 + **投稿日期**（赛道里少数在卡上给时间的）。

**点击后行为。** **双出口**：卡片进站内详情页，另有独立的 "Visit website" 链接直达源站。**这正是 v2 反馈 6.3 想要的"默认浮窗 + 把直接外跳留给老手"的静态版实现**——它不靠 Cmd 点击这种隐藏手势，而是把两个出口都画在界面上。

**商业模式。** 赞助横幅 + 付费模板区 + 订阅式邮件精选。投稿有 "Submit to gallery" 入口，**费用未披露**。

**Agent 接口。** 未见。

**最可学的 1 点。** **卡上同时给"进详情"和"去源站"两个明确出口**，不用隐藏手势。VisLexicon 的浮窗方案里"第一个元素就是通往源站的大链接"（v2 反馈 6.3）方向一致，但 Minimal Gallery 更进一步：**在卡上就分岔，扫读者根本不用打开浮窗**。

**最明显的 1–2 个缺陷。**
1. **70+ 个标签里前 3 个吃掉大半流量**，长尾标签基本是死的。
2. **13 年的站，不报总数、不报更新日期在页面级别**（只有单卡的投稿日期），无法判断这个月新增了多少。

---

## 16. Lapa Ninja

**定位。** 落地页设计合集，自 2015 年起。

**内容规模（同一页面上三个数字）。** 官方首页（2026-09-05）："over **7,300** landing page designs since 2015, along with **15,000+** full-page website screenshots"，而 browse all 区块标 **"⭐7478"**。7,300+ / 7,478 两个口径并存——这个还算无伤大雅（一个是四舍五入的营销数，一个是实数），但说明页面上没有单一数据源。

**发现方式（切面最多、也最失控的一家）。** 官方首页（2026-09-05）：
- **Categories 80+ 个**：Business、SaaS、Agency、Portfolio、Minimal、Studio、E-commerce、Technology、Corporate、Productivity、Creative、Design、Illustration、Fashion、Health & Fitness、Education、Entertainment、Finance、Fintech、AI，以及 Metaverse、NFT、Biotechnology 等极长尾。
- **Colors 17 种**：blue、black、white、gray、green、red、orange、purple、yellow、navy、teal、pink、brown、aqua、maroon、ultra violet、olive。
- **Platforms 7 种**：Webflow、Framer、WordPress、Shopify、Astro、Readymag、Gatsby。
- **Years**：2015–2026。

"Metaverse"和"NFT"这两个分类是**注意力化石的完美标本**——它们是 2021–2022 年对话的产物，2026 年还挂在导航里。这正是 v2 反馈 2.1 说的"分类体系是对话注意力的化石"。**Lapa Ninja 是这句话的实物证据。**

**卡片解剖。** favicon + 站名 + 一句 tagline 描述 + "visit" 链接 + 站内详情链接 + 2–3 个分类徽章（官方首页，2026-09-05）。**是本报告里卡上信息最全的一家**：有 favicon（身份）、有一句话（判断）、有双出口、有标签。

**点击后行为。** 双出口，外跳链接带 `?ref=lapaninja`。

**商业模式。** 联盟返佣（Webflow、Framer）+ 赞助横幅（Mobbin、Webflow、Framer 3.0）+ Pro 订阅 + 模板店（$29–$129）+ 信息流内 "Our Sponsored" 区块。**投稿走邮件，费用未披露。**

**Agent 接口 / 版权。** 未见。

**最可学的 1 点。** **卡上那句 tagline**。Lapa Ninja 是少数几家在卡片上给出一句话描述的——虽然多半是抓的站点 meta description 而非编辑判断。VisLexicon 的"一句拿走什么"（v2 反馈 6.2）如果是**编辑写的**而不是抓的 meta，那就是对这个赛道通行做法的一次实质升级，而不只是模仿。

**最明显的 1–2 个缺陷。**
1. **80+ 个分类里活着 Metaverse 和 NFT**。没有词表下架机制的代价。
2. **信息流内混入赞助卡片**（"Our Sponsored"），与自然内容同形。这直接损伤"精选"这个立身之本。

---

## 17. Oreo Design（原 oreo.design → 现 oreoui.com）

**这是本轮第二条重要的赛道变动，且直接冲击 VisLexicon 的定位。**

`oreo.design` 在 2026-09-05 **DNS 解析失败**（Name or service not known）。搜索结果显示该品牌现在的域名是 `https://www.oreoui.com/`，页面标题为 **"Oreo Design – UI Library for AI Agents"**（另有镜像 `https://oreo-ui.vercel.app/`，同标题，2026-09-05）。

**正文本轮未能抓取**（页面为纯客户端渲染，WebFetch 只拿到 meta：`theme-color: #F9F9F8`、viewport）。因此以下均标注确定性：

- **已确证**：品牌已从 `oreo.design` 迁移，且 `<title>` 明确是 **"UI Library for AI Agents"**。
- **已确证**：`theme-color` 为 `#F9F9F8`——一个极浅的暖灰。这与简报 6 节记录的"温润浅灰画布"一致，说明视觉基调未变。
- **未核实**：内容规模、首屏结构、卡片尺寸（简报记的 380×330）、筛选维度、点击行为、价格、是否真有 MCP。

**这件事对 VisLexicon 的意义大于它的产品细节。** VisLexicon 当前策展页的版式参考对象，已经**把自己重新定位成"给 AI Agent 用的 UI 库"**。也就是说：

1. Ben 参考的那个"静态三列网格 + 浅灰画布"的形态，**它自己的作者可能已经不再认为那是产品的核心**——标题里的关键词是 AI Agents，不是 gallery、不是 inspiration。
2. v2 反馈 2.3 批评"把另一个产品的计算样式逐像素复刻"，本轮又添了一条更实际的理由：**被复刻的那个产品已经换了域名、换了定位**。锚定一个正在漂移的目标，是把自己的版式建在流沙上。

---

# 二、2025–2026 新出现的同类产品（自行补充 5 个）

## N1. Gummble —— 明码标价的 Mobbin 挑战者

**定位（tagline 原文）**："Mobbin alternative · from $9.99/mo"（https://gummble.com/ ，2026-09-05）。**把竞品名写进 tagline**，是这一代产品的典型打法。

**内容规模。** 官方首页（2026-09-05）：**300,000+ UI 截图、21,000+ user flows、1,500+ apps**，覆盖 iOS / Android / web。**注意它覆盖 Android，而 Refero 只有 web + iOS。**

**首页首屏。** logo + 导航（Apps / Pricing）+ **搜索框（"Search screens, flows, or apps..."）** + 价值主张 + "Start free" + 两个样例屏（Granola 登录、Duolingo 付费墙）+ 参考产品 logo 墙（Linear、Figma、Notion、Stripe、Shopify、Revolut）。**搜索框在首屏，且 placeholder 直接告诉你能搜三种东西。**

**价格。** Free（受限浏览 + 基础搜索）/ **Browse $9.99/月**（无限屏、下载、收藏、**含 MCP**）/ **Pro $14.99/月**（加高级搜索、Figma 导出）/ Team（单一发票、共享工作区、协作收藏、**屏上钉评论**）（官方首页 + /mcp，2026-09-05）。**按月付，可随时取消**——这是它对 Refero"必须年付"的直接攻击点。

**Agent 接口。** **Gummble MCP**，OAuth 远程只读服务器，带计划权限校验。官方 /mcp 页（2026-09-05）点名三个工具：
- `gummble_search_screens` —— 返回移动付费墙、UI 截图，带 app 上下文。
- `gummble_search_flows` —— 返回可供 Agent 分析和批评的分步用户旅程。
- `gummble_search_microcopy` —— **返回真实产品文案**，覆盖 onboarding、校验、错误恢复、空状态、付费墙。

同页称共有 **14 个只读工具**，但只列出 3 个。自己的博客也承认"directing readers to current Gummble MCP guide for complete documentation"（gummble.com/blog/gummble-mcp-vs-mobbin-mcp，2026-07-09，2026-08-25 更新）。**说 14 个只列 3 个，是本报告里另一个数字诚实度问题。**

**最值得注意的一点：`search_microcopy` 是一个全新的内容维度。** 没有任何一家传统画廊把"产品文案"当作可独立检索的对象。它证明了一件事：**当消费者是 Agent 时，"能被检索的最小单元"会变得比"一张截图"更细。** VisLexicon 的图鉴术语、"一句拿走什么"、Do/Don't，本质上都是这一类可独立检索的细粒度对象。

**内容诚实度姿态（值得单独表扬）。** 它的对比文章拒绝直接比数据："Competitor totals and feature matrices become stale quickly"，并建议读者**对两个服务跑同一个 prompt 自己判断证据质量**（2026-08-25）。在一篇竞品对比软文里说这句话，姿态比赛道平均水平高。

**缺陷。** 定位完全寄生在 Mobbin 身上；"14 个工具"没有兑现文档。

---

## N2. Appllama —— 把商业结果放上卡片

**定位（tagline 原文）**："Discover the designs that win"，副标："Find what to build and study why it wins — the onboarding, paywalls and live videos behind the App Store's top-earning iOS apps"（https://appllama.io/ ，2026-09-05）。

**规模（自己和自己打架）。** 官方首页：**46,600+ screens / 1,080+ top-earning iOS apps**，每周新增。但 Product Hunt 上的产品名是 "Study **45,000+** screens"，而更早的 launch 记录写 "Study **25,000+** screens"（hunted.space / launly.com，2026-09-05）。**三个月内从 25,000 涨到 46,600**，且 PH 页面的数字没跟着更新。

**卡片解剖（本报告里最值得学的一张卡）。** 官方首页 app 卡（2026-09-05）：
- app 名 + 分类
- **预估月收入**
- App Store 评分 + 下载量
- **已捕获的 screens / stills / videos 数量**
- 缩略图

**这四项没有一项是装饰性标签，全是判断依据。** "预估月收入"直接回答了"我为什么要看这个 app 的设计"；"已捕获帧数"直接回答了"点进去有多少东西"。对照 Awwwards 的"7.44 分 + 奖章 + 日期"，差距一目了然。

**发现方式。** 网格初显 21 个，全库 1,081。筛选：Category（Health & Fitness 357、Lifestyle 292、Education 168…，**带计数**）；排序：Recently added / Top revenue / Most downloaded / Recently launched / Highest rated / A→Z；视图切换（网格/行）。**"Top revenue" 作为排序维度是这个赛道的新东西。**

**价格。** 官方 /pricing（2026-09-05）：
- **Free**：每个 app 的欢迎屏 + **2 个最新 app 的全部内容**（轮换）+ 每屏的**精确 hex 色值** + 每屏字体 + **UI 元素溯源到出处** + 1080p 导出（可带水印）+ **无 MCP**。
- **Pro 年付 $10/月（$120/年）**，月付 $20/月；含全库搜索、**Appllama MCP 每月 1,500 credits**、收入/下载/评分数据、Studio Pro（4K 导出、收入卡）、全 app 视频章节。印度区 ₹750/月（₹8,999/年）。
- Team $16/席/月（年付），最少 2 席；Enterprise 20+ 席。

**免费层给"每屏 hex 色值 + 字体 + UI 元素溯源"，这是很激进的免费策略**——它把最像"事实"的部分免费开放，把"量"和"MCP"留给付费。

**Agent 接口。** 官方 /mcp（2026-09-05）：端点 `https://mcp.appllama.io/mcp`，支持 Claude、ChatGPT、Codex、Claude Code、Cursor、VS Code；可在 Claude 连接器目录一键添加；另有 skills 安装 `npx skills add appllama/appllama-skills`。**Pro 层每月 1,500 credits，每月 1 号重置**（对照 Refero 的 8,000 次/周期）。返回数据含每个 app 的收入、下载量、评分。

**最可学的 1–2 点。**
1. **卡上放"这个东西凭什么值得看"的外部客观指标**（收入、下载、评分、已捕获量），而不是内部标签。VisLexicon 的对应物是"核验时间"、"许可证"、"价格"、"三张证据图的数量"——这些同样是外部可核的事实，应该上卡而不是折进档案区。
2. **免费层开放"事实层"（色值、字体、溯源），付费层卖"覆盖面 + Agent 通道"**。这套切法和 VisLexicon 的内容纪律天然契合：事实是公共品，规模和接口是商品。

**最明显的 1–2 个缺陷。**
1. **规模数字在自己的三个渠道上是 25,000 / 45,000 / 46,600**。
2. **"预估月收入"没有标注方法论**——是第三方数据商还是自己估的？页面上未见说明（2026-09-05）。把一个估算值放在卡片最显眼处而不说来源，是内容诚实度的漏洞。

---

## N3. designmd.cc —— 免费的 URL → DESIGN.md

**定位（tagline 原文）**："Pour any website's design DNA into a spec."（https://designmd.cc/ ，2026-09-05）。

**它做什么。** 输入一个线上网站 URL，输出一份 DESIGN.md，含配色、排版、间距刻度、CSS 变量、响应式断点、交互状态、组件模式。

**技术姿态（这一段是关键）。** 官方页明确说明：**它读 DOM 和 CSSOM，不是截图、不是推断**——"measures real CSS variables, `@media` breakpoints, and interaction states from the production code"（2026-09-05）。

**这是对 Refero 的正面攻击。** Refero 的 style 对象给你 `northStar` + token，但**不告诉你这些值是量的还是推的**；designmd.cc 把"我是量出来的"当作核心卖点写在首页。**这也正是 VisLexicon 想打的那个点——但它已经被一个免费工具占了一半。**

**输出格式。** Markdown（DESIGN.md）、JSON（Tokens JSON）、实时预览。CLI "in progress"。

**规模与节奏。** 官方页显示 **已生成 6,252 份设计**，平均生成耗时约 12 秒（2026-09-05）。**报的是"生成量"不是"库存量"**——这是工具型产品的诚实数字。

**是否有策展库。** 有一个 "Benchmarks" 区，展示已抽取的大站分析（Stripe、Linear、GitHub、Vercel、Notion、Airbnb），带截图、字体选择和断点数量。**这是"工具产生策展内容"的路径**，与 VisLexicon 的"策展产生工具输入"方向相反。

**价格。** **完全免费，无需账号**；每 IP 每 24 小时滚动窗口 5 次分析（2026-09-05）。

**Agent 接口。** 面向 Cursor / Claude Code / GitHub Copilot / Windsurf，下载 DESIGN.md 塞进项目。**未见 MCP**（2026-09-05）。

**缺陷。** 无准确性声明、无核验说明、无 MCP、无 API、限流 5 次/天。

---

## N4. uiscanner.com —— URL 前缀 + MCP 的设计系统抽取器

**定位。** 粘贴任意公开 URL，返回"design tokens and a build-ready prompt, so your AI builds from a real design system instead of generic defaults"（https://uiscanner.com/ ，2026-09-05）。

**三个入口，其中一个很聪明。**
1. **浏览器地址栏前缀**：在任意网址前打 `uiscanner.com/`。**零安装、零跳转的调用方式。**
2. **MCP**：一条命令接入 Claude Code / Cursor / Codex，"returning real tokens, section structure, and a build prompt without ever leaving the chat"。
3. CLI。

**版权姿态（全报告里表述最干净的一句）。** 官方首页："reads systems **from the live page, never copy the assets**"（2026-09-05）。**它把"读结构不搬资产"写成产品声明**。这正是 VisLexicon 的硬约束（简报第 23 行"只学信息节奏和交互逻辑，不搬运任何竞品的文案、图片、视频、代码、数据"）——**别人已经把它变成了卖点，而不是内部纪律。**

**输出。** design tokens + 结构信息 + 给 AI builder 的 prompt。有 "Explore" 区展示已扫描的样例（Stripe、Linear、Vercel、Notion）。

**规模 / 价格。** 均未在首页披露（2026-09-05），**未核实**。

---

## N5. mydesignmd.com —— 走 W3C 标准的 token 抽取

**定位。** 粘贴公开 URL，并行做 CSS 解析 + DOM 检查 + 视觉分析，区分"有意的设计模式"和"一次性样式"，1 分钟内完成（https://www.mydesignmd.com/design-token-extractor ，2026-09-05）。

**输出四种文件（这是本报告里最完整的一套导出格式）：**
1. `DESIGN.md` —— 给 Claude / Cursor / Copilot / Windsurf 的 markdown。
2. `design-tokens.json` —— **"DTCG format (W3C Community Group spec)"**。
3. `variables.css` —— CSS 自定义属性。
4. `tailwind.config.v4.css` —— Tailwind v4 主题配置。

覆盖 colors、typography、spacing、border radius、box-shadow elevations。

**用它去 Figma**：可经 Tokens Studio 同步回 Figma。

**这里有一个 VisLexicon 必须正视的事实。** Refero 的 style 导出（DESIGN.md / Tailwind / CSS 变量 / Design Tokens，见简报 4.3）已经不是稀缺能力——**至少三个 2026 年的免费工具在做同一件事，其中一个还走了 W3C DTCG 标准。** 简报第 11 节规划的"URL → DESIGN.md 工作台"，如果只做到"输出四种格式"，2026 年已经没有任何差异化。

**价格 / 库存。** 页面未披露，**未核实**。

---

## 附带发现（非直接竞品，但影响赛道判断）

- **Gather**（Product Hunt "3 个月前"，即约 2026-06）："Save it once, never lose it again"，主打**对个人参考库做 AI 打标 + 自然语言搜索**（https://www.producthunt.com/categories/design-inspiration ，2026-09-05）。方向是"个人收藏的智能化"，不是公共策展。
- **Design Agent**（https://design-agent.dev/ ，2026-09-05）：2026-06-25 起发文，至 2026-09-04 已 100+ 篇，是一个**研究/批评实验室**，专门审计"教 Agent 做设计的生态"。其中一条发现值得记：它统计发现主流设计站**容器查询（container queries）采用率为零**，结论是"the ecosystem that teaches agents to design is resolution-biased"。**未独立复核该统计**，但这个批评角度本身，正是 VisLexicon 想占的"会查证"生态位——已经有人在做，而且是免费公开做。

---

# 三、综合分析

## 3.1 对照矩阵

**A. 规模、价格、Agent 接口**

| 产品 | 官方规模数字（2026-09-05） | 更新节奏证据 | 价格 | MCP | llms.txt |
|---|---|---|---|---|---|
| Refero | 150,000+ screens / 6,000+ flows（Skill README）；styles 口径 2,000+/1,200+/203 互斥 | 无公开日志 | Pro ~$10/月（年付，第三方） | ✅ 10 工具全公开，8,000 调用/周期 | ✅ doc.refero.design/llms.txt |
| Mobbin | 621,500+ screens / 142,200+ flows（新闻稿 2026-05-11） | "每周更新"，无日志 | Pro ~$10/月（第三方，口径分歧大） | ✅ 但**工具名不公开**，需 Pro | 403 未核实 |
| Gummble | 300,000+ screens / 21,000+ flows / 1,500+ apps | 未核实 | Browse $9.99/月，可月付 | ✅ 3 个工具公开（自称 14 个） | 未核实 |
| Appllama | 46,600+ screens / 1,080+ iOS apps | 每周 | Pro $10/月（年付） | ✅ 1,500 credits/月 | 未核实 |
| Nicelydone | 201,600+ 截图 / 660 apps / 30,700 组件 / 12,600 flows | ✅ **公开月度 changelog，2016-05 至 2026-08** | 未核实 | ❌ | 未核实 |
| Page Flows | 79,000+ screens（+用户数混排） | 未核实 | $8.25/月（年付） | ❌ | 未核实 |
| Land-book | 20,000+ 站 / 200,000+ sections（含 "0+" 占位符） | "daily"（第三方） | Pro $6/月（年付） | ❌ | 未核实 |
| SaaSFrame | 5,000+ 例 / 100+ 品牌 | 未核实 | Pro $139/年 | ❌ | 未核实 |
| Saaspo | **3,097 / 716 / 379 / 46（精确整数）** | 未核实 | 免费 | ❌ | 未核实 |
| Siteinspire | 首页 2,376 vs About "8,000+" | "daily" | 未见付费层 | ❌ | 未核实 |
| Toools.design | 首页 2,200+ vs finder 2,300+ | "weekly"（自述×2） | 免费（联盟返佣） | ❌ | 未核实 |
| Lapa Ninja | 7,300+ / 7,478 / 15,000+ 截图 | 未核实 | 免费 + Pro + 模板店 | ❌ | 未核实 |
| Awwwards | **不报总数**；Directory 6,094 家机构 | 每日 SOTD | 提交 $65/次；Pro $80.4–$3,888/年 | ❌ | 未核实 |
| Minimal Gallery | 不报总数（130+ 页） | "daily"，卡上有投稿日期 | 赞助 + 模板 | ❌ | 未核实 |
| recent.design（原 Godly） | **不报总数** | "daily"（第三方） | 职位板 + 赞助 | ❌ | 未核实 |
| Curated.design | **不报总数** | 未核实 | Pro $9/月；插队 $29 | ❌（有 CSV/Notion 导出） | 未核实 |
| Dark Mode Design | **不报总数** | 未核实 | 单个赞助位 | ❌ | 未核实 |
| Screenlane | 未核实（站点 403） | 未核实 | 未核实 | 未核实 | 未核实 |
| designmd.cc | 已生成 6,252 份（生成量） | — | 免费，5 次/天/IP | ❌ | 未核实 |
| uiscanner | 未披露 | — | 未披露 | ✅ | 未核实 |
| mydesignmd | 未披露 | — | 未披露 | ❌ | 未核实 |
| oreoui.com（原 oreo.design） | 未核实 | 未核实 | 未核实 | 未核实 | 未核实 |

**B. 发现方式与卡片**

| 产品 | 首屏第一句是什么 | 主导航切法 | 切面数 | 卡上信息项 | 点击后 |
|---|---|---|---|---|---|
| Refero | 未核实（据 Ben 实测：自然语言搜索 + 风格词） | 未核实 | ≥7（page type/pattern/element/color/font/company/tag） | 未核实 | 未核实 |
| Mobbin | 未核实 | 平台 → 维度 → 元素（URL 三段） | 未核实 | 未核实 | 未核实 |
| Gummble | **搜索框**（"Search screens, flows, or apps..."） | 平台 + app | 少 | app 图标 + 名 + tagline | app 详情页 |
| Appllama | 吉祥物 + 双 CTA + "Browse apps" | 分类（带计数） | 1 + 6 种排序 | **名/类/月收入/评分/下载/已捕获帧数** | app 详情页 |
| recent.design | 网格（无 hero 文案堆） | **内容形态**（网站/OG图/App截图/App图标） | 2 层 | 海报 + 头像 + 文件名式标题 + "4 slides" | 站内 `/i/…` |
| Saaspo | 标题 + newsletter + 赞助 logo | **5 个切面全平铺（125+ 标签）** | 5 | 域名 + 平台 logo | 站内 |
| Siteinspire | 一句话定位 + newsletter + 热门分类 | 4 切面带计数 | 4 | 站名 + 图 + **设计师署名链接** | **站内详情页** |
| Land-book | 未核实 | 7 切面（付费解锁） | 7 | 未核实 | 未核实 |
| Lapa Ninja | logo + 搜索 + 分类菜单 + 统计 | 分类/颜色/平台/年份 | 4（80+ 值） | **favicon + 名 + tagline + 双出口 + 2–3 标签** | 双出口 |
| Minimal Gallery | "For the love of beautiful & functional websites" | 内容类型 + 70+ 标签 + 平台 | 3 | 图 + 名 + **投稿日期** | **双出口（卡上分岔）** |
| Awwwards | **Site of the Day 单站 + 7.44 分** | 奖项/类目/标签/技术/国家/字体/颜色 | 7（技术 120+，字体 100+） | 图 + 名 + 工作室 + **奖章 + 分数 + 日期** | 站内 |
| Toools.design | 标题 + 合作 logo + 分类 | 20+ 类，2–3 层 + 8 个身份工具箱 | 2（finder：价格 + 类目） | **纯文本：名 + 描述 + 价格标** | **直接外跳（带 UTM）** |
| Dark Mode Design | 一句氛围文案 | **无** | **0** | 图 + 名 | **直接外跳** |
| SaaSFrame | 三个动词的 tagline + 6 个品牌 logo | 内容类型 → 类别 → 模式 → 主题 → 设备 | 4（+⌘K） | 图 + 分类标 + **示例数** + 品牌名 | 分类页 |
| Curated.design | "reviewed one at a time" | 内容类型 + 行业 + 风格 | 2（免费）/ 高级（付费） | 图 + 标题 + 描述 + 作者 + 价格 | 详情页 |

---

## 3.2 「发现方式」的五种范式，以及谁做到了「不靠分类树也能逛」

**范式一：零切面时间线（Dark Mode Design、recent.design）。** 没有筛选，只有倒序网格 + 分页。
- 优：进入成本为零；不会长出化石分类；"新"本身就是编辑判断。
- 劣：只支持"逛"，完全不支持"找"。想要某个具体东西的人只能一页页翻。
- **成立条件：语料同质。** Dark Mode Design 只收暗色站，所以不需要解释"我在看什么"。**VisLexicon 的语料横跨组件库、品牌官网、在线工具、术语站，同质度极低，直接照搬这个范式必死。**

**范式二：带计数的多切面平铺（Saaspo、Siteinspire、Minimal Gallery、Lapa Ninja、Awwwards）。** 这是赛道的绝对主流。
- 优：计数让用户在点击前知道会得到多少东西；专业用户能精确收口。
- 劣：**长尾必然病态**，且是两端都病：Saaspo 的 Styles 里有 2 命中的死值（Corporate、Thin Layout），Siteinspire 的 Typographic 命中 88% 等于没筛。Lapa Ninja 的 Metaverse/NFT 是三年前对话的化石。**没有一家有词表下架机制。**
- **这一条是 v2 反馈 4.4「至少命中 5 个站 + 每季度复审」的实证依据。Saaspo 在 3,097 条规模下都养出了 2 命中的死值；VisLexicon 在 87 站规模下，任何超过 15 个值的切面都会立刻长出死值。**

**范式三：付费墙式发现（Mobbin、Land-book、SaaSFrame、Curated.design）。** 免费给内容，收费给"找得到"。
- Land-book 卖的是 "Unlimited filter & search results"；Mobbin 免费层只给最新 4 个 app 且限制搜索；SaaSFrame 把筛选和搜索放进 Pro。
- 优：转化效率高，且不用把内容藏起来（口碑损伤小）。
- 劣：免费用户被训练成只会滚动的人，产品的"智能感"永远传达不到没付费的人。
- **对 VisLexicon 的含义：v1 阶段绝对不能学。87 个站的库，如果连搜索都要付费，产品直接没有存在感。**

**范式四：按"内容形态"而非"题材"切顶层（recent.design、SaaSFrame、Curated.design）。**
- recent.design：网站 / OG 图 / App 截图 / App 图标。SaaSFrame：网站页面 / 产品界面 / 邮件序列。Curated：Websites / Sections / Templates。
- 优：**顶层导航不会过时**（"OG 图"这个形态比"Metaverse"这个题材稳定得多），且天然对应不同的卡片模板。
- 劣：不回答"我要做什么"，只回答"我要看哪种东西"。
- **这是本报告认为最健康的传统范式，且直接支持 v2 反馈 6.1 的"三种卡片模板"。**

**范式五：Agent 优先的语义检索（Refero、Gummble、Appllama、Mobbin MCP）。**
- 这里发生了一件根本的事：**当消费者是 Agent 时，分类树彻底失效，因为 Agent 不点标签，它发查询。** Refero 的 MCP 只暴露 `query` 字符串 + `platform` 枚举 + 分页——**十个工具里没有一个接受"分类"参数**。Gummble 的三个工具同理。
- **这是本报告最重要的结论之一：赛道的领先者已经在 Agent 侧放弃了分类树，但在人类侧全都保留着。**

### 直接回答：谁做到了「不靠分类树也能逛」？

**严格意义上：没有一个。** 但有三个部分答案，各自的机制不同：

1. **Dark Mode Design 做到了，靠的是"取消选择"** ——它把语料窄到只有一个维度，于是分类树无必要。**这是靠牺牲范围换来的，不可复制到 VisLexicon。**

2. **recent.design 做到了一半，靠的是"把顶层换成形态 + 日更时间线"** ——你不需要选行业就能逛，因为"最近的"本身是排序，"什么形态"只有 5 个值。**这是靠降低切面基数 + 用时间做默认排序换来的，VisLexicon 可复制。**

3. **Refero 做到了最接近的一版，靠的是"风格词 + 自然语言搜索 + 三种排序"**（据 Ben 实测，本轮未独立复核）。它用"一组会变化的风格词"替代了固定分类树——**风格词是编辑策划的、可轮换的入口，不是 schema**。这与 v2 反馈 4.5 的"任务货架"是同一个机制的两个变体：**Refero 的入口是"感觉"（风格词），v2 提议的入口是"任务"。**

**关键机制总结：能不靠分类树逛的产品，都用同一招——把"可轮换的编辑策划入口"放在"固定 schema 分类"的位置上。** 风格词、Best of X 合集、日更时间线、任务货架，都是这一招。它们的共同点是：**入口是内容，不是字段**。一个字段一旦上了导航就必须永远在那里（于是 NFT 活到了 2026）；一条编辑策划的路径可以下个季度就撤掉。

**但要补一条 v2 反馈没说的话：这一招有个成本。** 编辑策划的入口**没有覆盖保证**。分类树至少保证每个条目都能被某条路径够到；货架不保证。所以货架必须配一个兜底出口——v2 线框里的"全部 87 个站点 →（进入卡片墙：三列节奏 + 二级切面筛选）"就是那个兜底，**这一格不能砍**。

---

## 3.3 卡片与详情页：最佳实践与反例

### 卡片

**最佳实践 1：卡上放外部可核的客观事实，不放内部标签。**
Appllama 的卡给"预估月收入 / 下载量 / 评分 / 已捕获帧数"（官方首页，2026-09-05）。这四项都在回答"我为什么该点它"，且都是站外可验证的。Toools.design 只放"名 + 一句描述 + 价格标"，同理——价格是事实，不是分类。

**反例 1：Awwwards 的卡。** 缩略图 + 名 + 工作室 + 奖章 + 7.44 分 + 日期。**六个信息项，没有一项说这个站好在哪。** 分数是内部产物（18 个评委的加权平均），用户既不能核验也不能理解。这是"字段前置 = 数据库"的教科书样本（v2 反馈 6.4 的说法在这里得到市场验证）。

**反例 2：recent.design 的标题是文件名。** "esports-controller-microinteractions" 不是一句人话。1.5 秒判断完全压在图上。

**最佳实践 2：卡上就分岔出两个出口。**
Minimal Gallery 和 Lapa Ninja 都在卡上同时给"进详情页"和"Visit website"。v2 反馈 6.3 的方案（浮窗 + Cmd 点击外跳）依赖一个隐藏手势；**Minimal Gallery 证明可以把它画出来，扫读者根本不用打开浮窗**。建议 VisLexicon 采纳这个更明确的版本。

**最佳实践 3：卡上给时间。**
Minimal Gallery 在卡上给投稿日期。VisLexicon 有一个比它强得多的对应物——**核验时间**。这是 VisLexicon 全部内容纪律里最能上卡的一项，因为它同时是事实、是差异点、是"我们真的进去看过"的具体证据。**目前 v2 线框把它放在了折叠档案区（6.4 第 5 项），这是浪费。**

**最佳实践 4：卡上标"这里面有多少东西"。**
SaaSFrame 卡上有"示例数量"，Appllama 有"已捕获 screens/stills/videos 数"，Saaspo 和 Siteinspire 在切面值旁边标计数。**用户在点击前知道深度。** VisLexicon 的对应物：这个站我们放了几张证据图、关联了几个词条。

### 详情页

**最佳实践：判断在前，数据在后，导出在最后。**
Refero 的 style 数据模型公开确认了这个顺序（doc.refero.design/mcp/data-model，2026-09-05）：`northStar` → `theme` → `colors`（带语义角色）→ 排版/间距/布局 → `elevation` + `elevationPhilosophy` → `components` → `imagery` → `dos`/`donts` → `customSections`。

**注意两个细节，它们比"顺序"本身更重要：**
1. **`colors` 带的是语义角色（background / foreground / muted / border / accent），不是色值列表**（styles.refero.design/ai-agents/tailwind-design-tokens，2026-09-05）。角色是判断，色值是数据。
2. **有一个字段叫 `elevationPhilosophy`。** 一个纯数值维度（阴影/层级）被配了一个专门的"哲学"字段。这说明 Refero 认为：**每一组数字都需要一句解释它为什么是这样的话。**

**反例：Refero 自己在证据这一层。** 同一份数据模型里，**没有任何字段把某条 color / spacing / component 判断连回具体页面、画面区域或截图坐标**。screen 和 flow 只有 `content.description` 这样的散文摘要。文档自己写 "Styles are guidance, not templates"——**这句话诚实地承认了它给的是意见，但页面上没有任何东西提醒用户这一点。**

**这是整个赛道最大的空位，也是本报告能给 VisLexicon 的最硬的证据。**

---

## 3.4 视频 / 动态预览：赛道实际用法与加载策略

**先说一个反直觉的事实：动态预览在这个赛道远没有普及。**

- **recent.design**（日更、以视觉冲击为卖点）：卡片是**静态 WebP 海报**，宽 810–1200px，多图时用 "4 slides" 角标，**无 hover 预览**（官方首页观测，2026-09-05）。
- **Awwwards**（评的就是动效和交互）：目录页卡片 markup 中**未见 hover 视频预览**（官方 /websites/ 观测，2026-09-05）。
- **Mobbin**：把 "animations" 做成**免费层受限的独立内容维度**（getpulsesignal 列的免费层限制含 "Limited animations"，2026-09-05），即动效是可付费解锁的内容层，不是卡片装饰。
- **Page Flows**：**整个产品就是录屏库**，视频（flow recordings）与静图（screens）、邮件（emails）是三个平行的内容层，各自独立计费权益（官方 /pricing，2026-09-05）。
- **Appllama**：卡上标"已捕获 screens / **stills** / **videos** 数量"，付费层给"全 app 视频章节"（官方首页 + /pricing，2026-09-05）。**视频是分章节的长内容，不是循环片段。**
- **Refero**：卡上有短视频（Ben 实测：海报优先、静音、`playsinline`、`preload="none"`、进视口加载播放、离开暂停、结束重播、片长约 6.6–25 秒不等，见简报 4.3）。**本轮未能独立复核这些参数**——refero.design 是 SPA，WebFetch 只返回 meta 标签。

**能观测到的技术细节，坦率说很少。** 本轮唯一能直接确认的加载策略证据是 recent.design 用 WebP 海报（格式本身即为体积优化的选择）。Refero 的 IntersectionObserver 式策略只有 Ben 的实测记录，**没有第二个来源**。

**由此得出的判断（与 v2 反馈 8 一致，但理由更硬）：**

1. **短循环视频不是赛道标准动作，是 Refero 的个人选择。** 两家最有理由用它的产品（recent.design 主打视觉、Awwwards 主打动效）都没用。所以 VisLexicon 不做视频，不会显得落后；做了，也不会自动显得先进。

2. **赛道里真正跑通的动态内容做法是"独立成层"，不是"卡片装饰"。** Page Flows 把录屏做成主内容并单独定价；Mobbin 把 animations 做成可解锁维度；Appllama 把视频做成带章节的长内容。**三家不同的产品，三种不同的形态，共同点是：动态内容有自己的入口和自己的价值主张。**

3. **对 VisLexicon 的具体含义（这里我要修正 v2 反馈 8 的一半）：**
   - v2 说"动态预览是 B 型卡的媒体选项，不是新的内容层级"——**对于品牌官网的 5–8 秒气质片段，这个判断成立**，因为它承载的是"感觉"，属于卡片的职责。
   - **但图鉴的"活舞台"承载的是"过程"**（一个效果必须通过时间变化才能看懂）。Page Flows 的存在证明：**承载过程的动态内容必须独立成层**，塞进卡片会毁掉它。所以图鉴的舞台不该被当成"策展卡片的动态版"来设计，它是另一种东西。
   - **加载策略照 v2/简报 10.1 执行即可**（海报优先、进视口播、静音、`playsinline`、respect `prefers-reduced-motion`、移动端不自动播），这套做法在 web.dev 的 lazy-loading video 指南里是标准实践，不需要从竞品身上学。

---

## 3.5 内容诚实度：谁标注核验/来源，谁在用大数字营销

### 做得好的（可直接借鉴的具体做法）

| 做法 | 谁在做 | 证据 |
|---|---|---|
| **报精确整数而非"N+"** | Saaspo | 3,097 / 716 / 379 / 46（官方首页，2026-09-05） |
| **公开的、按月的、列出具体新增条目的 changelog** | Nicelydone | 2016-05 至 2026-08 连续（官方 /changelog，2026-09-05） |
| **策展人署名到个人** | Siteinspire（Daniel Howells）、Dark Mode Design（Cai Cardenas） | 官方 /about，2026-09-05 |
| **一句可被证伪的承诺** | Siteinspire："none of the featured sites are sponsored entries." | 官方 /about，2026-09-05 |
| **公开评审公式与阈值** | Awwwards：40/30/20/10、18 评委、去 3 个极端分、HM≥6.5、Dev≥7.0 | 官方 /about-evaluation/，2026-09-05 |
| **写明审核时限** | Land-book：网站 2 天–1 个月，模板 7 个工作日；一个月无回音即未入选 | 官方 /submission-guidelines，2026-09-05 |
| **披露联盟关系** | Toools.design（星号标记 + 声明） | 官方首页，2026-09-05 |
| **明确"读结构不搬资产"** | uiscanner："reads systems from the live page, never copy the assets" | 官方首页，2026-09-05 |
| **报"生成量"而非"库存量"** | designmd.cc：已生成 6,252 份 | 官方首页，2026-09-05 |
| **拒绝拿竞品总数做对比** | Gummble："Competitor totals and feature matrices become stale quickly" | gummble.com/blog，2026-08-25 |
| **不报总数** | recent.design、Dark Mode Design、Minimal Gallery、Curated.design、Awwwards | 各官方首页，2026-09-05 |

### 做得差的（每一条都是 VisLexicon 要避开的坑）

1. **同一域名不同页面数字互斥。**
   - Refero Styles：**2,000+ / 1,200+ / 203**（三个官方页面，同一天）。
   - Siteinspire：首页 **2,376** vs About **"8,000+"**。
   - Toools.design：首页 **2,200+** vs finder **2,300+**。
   - Lapa Ninja：**7,300+** vs **7,478**。
   - Appllama：官网 **46,600+** vs Product Hunt **45,000+** vs 早期 launch **25,000+**。

2. **官方页面上挂着没填的占位符。** Land-book 的 PRO 页把"月活用户"和"作为灵感来源的年数"显示为 **"0+"**（官方 /pro，2026-09-05）。一个卖精选品质的产品，落地页上有 "0+"。

3. **把用户数和内容数并排展示制造规模错觉。** Page Flows 首页/定价页并列 "79,000+ screens library"、"10,000+ brands"、"100,000+ designers"（官方 /pricing，2026-09-05）——只有第一个是内容。Mobbin 新闻稿并列 "621,500+ screens"、"142,200+ flows"、"200,000+ designers and product teams"（2026-05-11），同样的手法。

4. **官方定价页上的算术错误。** Page Flows：$39/季（=$13/月）到 $99/年（=$8.25/月），实际省 36.5%，页面标 **"Save 15%"**（官方 /pricing，2026-09-05）。

5. **付费影响语料构成但从不承认。** Awwwards 单次提交 **$65**，被收录的前提是作者付费——它的库不是"网上最好的站"，是"愿意付 65 美元的站"。Curated.design 的 **$29 插队**同理，虽然措辞更干净（卖的是排队权和编辑反馈）。**两家都没有在任何浏览页面上提示这个偏差。**

6. **自称的工具数与文档不符。** Gummble 官方 /mcp 称 14 个只读工具，只列出 3 个（2026-09-05）。

7. **规模数字增长速度可疑。** Refero 官方口径：2024-06 的 66,000+ → 2026-03 第三方 125,000+ → 2026-08 竞品口径 135,000+ → 2026-09 官方 Skill README 150,000+。**在没有任何公开更新日志的情况下，用户无法核验这条增长曲线。**

8. **版权双标。** Mobbin 条款禁止用户 "use any automated tools such as artificial intelligence or machine learning" 制作衍生作品，禁止一切 scraper/bot/crawler（https://mobbin.com/terms ，2026-09-05），同时自己卖 MCP 把 621,500 张第三方截图喂给 Claude/Cursor/Lovable，且新闻稿**全文不提版权**（2026-05-11）。下架流程是写信到新加坡地址，无 DMCA 流程。

**一句话总结这一节：这个赛道的数字几乎全部不可核验，而唯一低成本、高可信度的诚实机制是 Nicelydone 那种「列出本月新增了哪几个条目」的 changelog。**

---

## 3.6 对 VisLexicon 的具体启示

### A. 可以借用的信息节奏与交互（不搬任何资产）

**A1. 卡上放外部可核事实，不放内部标签。**
学 Appllama 的卡片哲学（收入/下载/评分/已捕获量），换成 VisLexicon 自己的事实项：

> 媒体 + 名称 + 一句"拿走什么" + **核验时间** + 权利/价格微标

**具体改动：把"核验时间"从 v2 反馈 6.4 的折叠档案区（第 5 项）提到卡片上。** 理由：它是外部可核的、是差异点、是"我们真的进去看过"的唯一具体证据。v2 反馈 6.2 定的四项（媒体+名称+一句话+权利/价格微标）**应该扩成五项**。这是本报告对 v2 的第一处修正。

**A2. 双出口画在卡上，不靠隐藏手势。**
学 Minimal Gallery / Lapa Ninja：卡片上同时存在"打开浮窗"（整卡）和"去源站"（一个明确的小链接/图标）。v2 反馈 6.3 的 Cmd 点击 / 中键 / Enter 三个手势保留，但**再加一个可见出口**。理由：老手不需要发现快捷键才能快，且这个可见出口本身传达了"我们不拦你"。

**A3. 顶层导航按"内容形态"切，不按题材切。**
学 recent.design（网站 / OG 图 / App 截图 / App 图标）和 SaaSFrame（网站页面 / 产品界面 / 邮件序列）。VisLexicon 的对应切法直接对应 v2 反馈 4.2 的"站点机制"切面——**它是唯一近似单选的那个，因此天然适合做导航**：站内承载 / 外链导航 / 自身即作品 / 在线工具 / 社区市场。

**注意：这不与"分类树退出前台"矛盾。** 形态切分只有 5 个值、描述结构不描述内容、且和三种卡片模板一一对应。它不是分类树，它是**卡片墙的分区**。首页仍然是货架，这 5 个值只在"全部站点"那一层出现。

**A4. 切面值旁边标计数（学 Saaspo / Siteinspire / Minimal Gallery）。**
好处有两个，第二个更重要：一是用户点前知道深度；**二是编辑部一眼就能看见哪些值已经死了**。这让 v2 反馈 4.4 的"每季度复审、命中率跌破阈值下架"变成一个看得见的日常动作，而不是一条写在文档里的制度。

**A5. 详情页/浮窗：判断在前，且每一组数字配一句"为什么"。**
Refero 的 `elevationPhilosophy` 是这一条最好的样本——**一个纯数值维度也配了一个专门的哲学字段**。VisLexicon 的浮窗（v2 反馈 6.4 的五段式）顺序正确，建议加一条纪律：**任何出现在浮窗里的数值或字段，都必须有一句人话解释它为什么值得注意；给不出这句话的字段，直接从浮窗删掉，只留在档案区。**

**A6. 立刻开一个公开的月度核验日志（学 Nicelydone）。**
"本月核验了这 9 个站：×××、×××……"，列具体名字。**成本接近零，是简报 3.6"过程要诚实可见"最便宜的落地方式**，而且十年后它会变成这个产品最有价值的资产（Nicelydone 的 changelog 能追到 2016-05）。

**A7. 投稿即"给已有条目补证据"（学 Siteinspire 的 add credits）。**
Siteinspire 允许用户给自己参与的项目补署名。v2 反馈第 7 节的"重复提交自动转为给已有条目补证据"是同一个机制，**且 Siteinspire 已经证明它跑得通**。可以更进一步：明确列出每个条目"缺什么"（缺作者？缺许可证？缺仓库？），把补全变成一个有明确任务的动作。

**A8. 报精确整数（学 Saaspo）。**
v2 线框写"已核验 87 个站点 · 62 个词条"，方向完全正确。**加一条纪律：全站任何位置不出现 "+" 号。** 87 就是 87。这一条零成本，且是这个赛道最稀缺的东西。

### B. 必须避开的坑（每条都有市场证据）

**B1. 不要把搜索或筛选放进付费墙。** Land-book 卖 "Unlimited filter & search results"，Mobbin 限制免费层搜索，SaaSFrame 把筛选放进 Pro。**87 个站的库如果连搜索都要付费，产品没有存在感。**

**B2. 不要让任何切面值的命中数低于 5 或高于 60%。**
证据：Saaspo 的 Corporate (2)、Thin Layout (2)；Siteinspire 的 Typographic 占 88%。**两端都是无效切面。** v2 反馈 4.4 的"至少命中 5 个站"是对的，**但漏了上限**——本报告建议加一条：**命中率超过 60% 的切面值同样下架**，因为它不缩小任何东西。这是对 v2 的第二处修正。

**B3. 不要让任何切面值来自"当下的热词"。**
证据：Lapa Ninja 的 Metaverse / NFT 活到 2026。v2 反馈 4.4 的"对话里出现的例子不构成建词理由"完全正确，**再加一条：任务词表必须带上架日期，复审时先看最老的。**

**B4. 不要在页面上并排展示用户数和内容数。** Page Flows 和 Mobbin 都在这么干。

**B5. 不要收任何影响收录结果的费用，且要主动说明。**
Awwwards $65、Curated $29 都在影响语料构成且从不承认。VisLexicon 如果永远不收费，那就**明说一句可被证伪的话**（学 Siteinspire 的 "none of the featured sites are sponsored entries"）。

**B6. 不要把版式锚定在 Oreo 上。**
`oreo.design` 已 DNS 失效，品牌迁到 `oreoui.com`，标题改为 **"UI Library for AI Agents"**（2026-09-05）。v2 反馈 2.3 批评逐像素复刻是姿态问题；本报告补一条更实际的理由：**被复刻的对象已经不在原地了。** 380×330 这个数字必须从 VisLexicon 自己的三种卡片形态推导。

**B7. 不要把"URL → DESIGN.md"当成差异化功能。**
designmd.cc（免费，5 次/天，读 DOM/CSSOM）、uiscanner（MCP + 地址栏前缀 + CLI）、mydesignmd（DESIGN.md + DTCG JSON + CSS 变量 + Tailwind v4，四种格式）——**三个 2026 年的产品在做同一件事，且都免费或近免费。** 简报第 11 节规划的工作台，如果只做到"输出四种格式"，2026 年零差异化。

**它唯一可能的差异点是简报 11.1 自己写出来的那条：JSON 为事实源、其余为派生视图、逐条判断可回证据、用户可逐条修正。** 前三个竞品**没有一个**提供逐条证据回链和用户修正。这一条必须保住，其余全是红海。

**B8. 不要在没有更新日志的情况下报增长中的规模数。** Refero 的 66,000→150,000 之所以可疑，是因为它没有任何公开日志。

### C. VisLexicon 唯一能打的差异点（基于证据）

**差异点：把每一条设计判断连回具体的页面证据，并公开这条链。**

**证据链如下（全部是本轮一手观测）：**

1. **Refero 的 style 数据模型公开可查，里面没有证据回链字段。**（https://doc.refero.design/mcp/data-model ，2026-09-05）`northStar`、`colors`、`typography`、`spacing`、`elevation`、`components`、`imagery`、`dos`、`donts`、`customSections`——十个字段，零个指向"这条判断出自哪个页面的哪个区域"。文档自己承认 "Styles are guidance, not templates"。**这是 Ben 在简报 4.3 的直觉，本轮拿到了官方文档级别的证据。**

2. **Refero 的 screen 和 flow 也没有。** `content.description` 是散文摘要，`refero_get_screen_image` 只返回 thumbnail 或 full 的整张图——**没有区域、没有坐标、没有"这条规则对应图上这一块"**。

3. **Mobbin 的 MCP 连工具名都不公开**（useloadout.com，2026-06-07；gummble 对比文，2026-08-25），Agent 侧无法评估返回什么。

4. **Gummble 自己承认返回的是 "captured product reference[s] requiring context verification before adaptation"**（2026-08-25）——即它明知返回的东西需要人去核验，但不提供核验所需的材料。

5. **designmd.cc 是唯一把"我是量出来的"当卖点的**（读 DOM/CSSOM，不是截图不是推断，2026-09-05），**但它只对单个 URL 做一次性抽取，不维护语料，也没有人工复核层。**

6. **整个赛道只有 Awwwards 公开了一套可复核的质量规则**（40/30/20/10、18 评委、去 3 个极端分、6.5/7.0 阈值），**而它评的是"这个站好不好"，不是"我们关于这个站说的话对不对"。**

**结论：市场上没有任何一家把"某条判断 ← 某个页面证据"这条链做出来并公开。** 领先者们在扩规模（62 万屏）、扩接口（MCP）、扩格式（四种导出），**没有一家在扩可核验性**。

**为什么这个差异点对 VisLexicon 成立而对它们不成立：**

- 它们的语料是机器批量抓的（Mobbin 62 万屏、Nicelydone 20 万张 = 每 app 305 张），**规模决定了不可能逐条挂证据**。
- VisLexicon 的语料是人真进站看过的、每站三张各司其职的证据图（简报 3.2/3.3）。**87 个站的规模，恰好是"每条判断挂证据"唯一可行的规模。**
- 也就是说：**VisLexicon 的"小"不是劣势，它是这个差异点唯一能成立的前提。** v2 反馈 2.2 指出的"8684 与同一内容标准是一对矛盾"，其解法在这里闭环了——**放弃 8684，才买得起可核验性；而可核验性是市场上唯一没人占的位置。**

**落地成什么（具体到字段和用户动作）：**

1. **三张证据图必须可被单独引用。** 每张图给一个稳定 id，浮窗里的每一句判断（"克制的留白"、"仅参考"、"包含可直接安装的工具调用卡片"）都指向其中一张图的一个区域。v2 反馈 6.4 第 2 项"三个关键位置，作为可点击链接，各带一句为什么"已经写到了这一步，**但要再往前一步：链接的方向要反过来——不是从图链到页面，是从判断链到图。**

2. **Land-book 的 "sections" 证明了页面区块可以是独立的可检索对象**（20,000 站 / 200,000 sections）。VisLexicon 的三张证据图应该按同样的逻辑对待：**它们不是站点条目的附件，它们是独立的、可被检索和引用的证据对象。**

3. **数据模型里加一个字段，学 Refero 但补上它缺的那半：**
   每条判断（claim）= `文本` + `evidence_ref`（指向哪张图 / 哪个区域 / 哪个来源 URL）+ `method`（**measured | observed | inferred**）+ `verified_at`。**`method` 这一个枚举字段，就是整个差异点的技术载体。** Refero 给不出它，因为它不知道自己的值是量的还是推的；designmd.cc 全是 measured 但没有人工判断层；VisLexicon 两者都有。

4. **同一份数据两种渲染，学 Refero 的 `response_format: md | json`。** 人看到的是浮窗，Agent 拿到的是同一条 claim 的 JSON——**带 `evidence_ref` 和 `method`。** 这才是 v2 反馈 3.2"同一数据层，两种渲染"的完整形态，也是第三阶段真要做 MCP 时唯一值得做的东西：**市场上不缺又一个返回截图的 MCP，缺的是一个返回"带证据和方法标注的设计判断"的 MCP。**

5. **对外只说一句可被证伪的话。** 不说"我们精选"，说：**"每一条判断都标注了它是量出来的、看出来的，还是推出来的，并链到具体证据。"** 这句话别人能拿反例来打，所以它有信息量——这正是 Siteinspire 那句 "none of the featured sites are sponsored entries" 的力量来源。

---

## 附录：本轮全部来源（访问日期均为 2026-09-05）

**官方一手页面（WebFetch 成功渲染）**
- https://refero.design/ · https://styles.refero.design/ · https://styles.refero.design/design-md/design-md-for-ai-agents · https://styles.refero.design/ai-agents/design-md-examples · https://styles.refero.design/ai-agents/tailwind-design-tokens
- https://doc.refero.design/mcp/getting-started · https://doc.refero.design/mcp/tools · https://doc.refero.design/mcp/data-model · https://doc.refero.design/help/plans · https://doc.refero.design/llms.txt
- https://github.com/referodesign/refero_skill
- https://mobbin.com/terms
- https://www.businesswire.com/news/home/20260511053592/en/Mobbin-Launches-MCP-Server-Giving-AI-Tools-621500-Real-App-Screens-to-Reference
- https://recent.design/ （https://godly.website/ 302 跳转至此）
- https://land-book.com/pro · https://land-book.com/submission-guidelines
- https://www.awwwards.com/ · https://www.awwwards.com/submit/ · https://www.awwwards.com/about-evaluation/ · https://www.awwwards.com/websites/
- https://www.toools.design/ · https://www.toools.design/finder
- https://curated.design/ · https://curated.design/pricing
- https://nicelydone.club/about · https://nicelydone.club/changelog
- https://www.saaspo.com/ · https://www.saasframe.io/
- https://www.darkmodedesign.com/ · https://www.darkmodedesign.com/about
- https://pageflows.com/pricing/ · https://pageflows.com/user-flow/
- https://www.siteinspire.com/ · https://www.siteinspire.com/about
- https://minimal.gallery/ · https://www.lapa.ninja/
- https://gummble.com/ · https://gummble.com/mcp
- https://appllama.io/ · https://appllama.io/pricing · https://appllama.io/mcp
- https://designmd.cc/ · https://uiscanner.com/ · https://www.mydesignmd.com/design-token-extractor
- https://design-agent.dev/

**第三方（可信度低一级，正文已逐条标注）**
- https://www.producthunt.com/products/refero · https://www.producthunt.com/categories/design-inspiration
- https://gummble.com/compare/refero-alternative · https://gummble.com/blog/gummble-mcp-vs-mobbin-mcp · https://gummble.com/blog/free-mobbin-alternatives-for-designers （竞品来源）
- https://www.everydev.ai/tools/refero · https://mcpservers.org/servers/faridjafarlee/refero-styles-mcp-server · https://notes.nicolasdeville.com/ai/refero-styles/
- https://useloadout.com/blog/mobbin-mcp-server-setup/ · https://uxmagic.ai/blog/mobbin-review-2026 · https://coolcuration.com/mobbin-review-is-it-worth-it · https://getpulsesignal.com/pricing/mobbin · https://www.vendr.com/marketplace/mobbin
- https://toolradar.com/tools/land-book · https://www.uwarp.design/blog/recent-design-inspirational-websites-guide · https://www.plusuidesign.com/resources/screenlane/

**本轮无法访问（已标注"未核实"）**
- mobbin.com/ 与 /pricing（403）· screenlane.com（403）· land-book.com/（403）· oreo.design（DNS 失败）· nicelydone.club/（robots/DNS）· refero.design 与 styles.refero.design 的具体风格页（SPA 只返回 meta）· doc.refero.design/legal/*（404）· www.oreoui.com 正文（纯客户端渲染）
