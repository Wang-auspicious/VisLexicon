# VisLexicon 现状批判性审计（00）

审计对象：`/root/workspace/VisLexicon-browser-design-kit/`
审计日期：2026-09-05
证据基础：`context/01`–`07` 全文、`current-ui-screenshots/` 全部 **13** 张（简报写 14，实际目录下只有 13 个文件，见 A.0）、`frontend/src/` 全部关键源码、`content-samples/approved-v3/` 12 个 JSON、`frontend/src/data/visual-atlas.json` 220 条记录。
本报告只引用我实际打开过的文件与行号；凡未核实的一律标注「未核实」。

---

## 结论先行

1. **这不是一个做得差的产品，而是三个互不认识的产品共用一个顶栏。** 策展（IndexView + SiteCatalog）、图鉴（Atlas + 9 个舞台）、旧词典（entries.js + Entry/Key/Compare/Variants/SpecPanel）各有自己的数据模型、自己的搜索框、自己的详情形态，且旧词典在界面上**没有任何入口**，只能靠 ⌘K 进入（Palette.jsx:64）。
2. **最严重的问题不是审美，是诚信面上的自我拆台。** 代码里存在硬编码假数字（SiteCatalog.jsx:107 的 `'5,000+'`）、指向不存在端点的「真实可用」承诺（Tools.jsx:443–465，`public/` 下无 `lexicon/` 与 `llms.txt`）、生成假代码并自称「已自动对齐生产级无障碍规范」的导出器（CodeExportModal.jsx:35–68、156），以及 6 张 Unsplash 陌生人头像被当作开源作者头像（index.js:18/42/66/90/114/138）。这与「不得虚构」的硬约束正面冲突。
3. **v3 内容包里最贵的东西，前台一个字都没用。** `selectionRationale`、`facts[].evidence`、`classification.reasons`、`official.checkedAt` 在 `content-samples/approved-v3/*.json` 里齐备，但 `site-catalog.json` 的投影把它们全部丢弃，并把 12 个正交 facet 轴压平成一个 `tags` 袋子。产品唯一的护城河在渲染前就被抹掉了。
4. **策展首页把同样 6 个站展示了两遍，且两遍互相矛盾。** 上方 6 张卡来自未复核的 `data/curated-sites.js`，下方目录来自已复核的 v3 投影；同一个 `origin-ui` 上面写「Origin UI 官方演示站 / COSS 团队 / 508 个组件 / 全部开源」，下面写「Cal.com 团队 / 早期开发阶段」。
5. **图鉴的舞台是全仓最有价值的资产，但被一层假 macOS 窗框和默认关闭的抽屉挡住了。** `Atlas.jsx:43–44` 让左右两栏默认全关，首次进入看不到术语列表，也看不到任何释义。
6. **`candidate` 正在伪装成已审核内容。** `visual-atlas.json` 中 219/220 条 `status: "candidate"`、220/220 条 `translationQuality: "machine"`，而 `Atlas.jsx` 全文没有一处读取 `status`。
7. **不存在设计系统。** App.css 声明 25 个 token，却硬编码 **469 个** 不同 hex 色、**37 个** 圆角字面量、**85 个** 不同 box-shadow、**37 个** 字号字面量（含 4px 与 6.5px），并同时跑着三套调色板（Anthropic 暖灰 token / Tailwind 默认灰 / 一族未进 token 的靛紫）。
8. **无障碍是「有零件、没装上」。** `lib/modal-focus.js` 实现了正确的焦点陷阱，却只在 SpecPanel 与 Palette 使用；主力的 `SiteDetailModal` 与 `CodeExportModal` 都没有；图鉴抽屉关闭时只改 opacity/pointer-events，键盘仍能 Tab 进去（atlas.css:408–440）。`--text-2` 对比度 3.22:1，不达 AA。
9. **截图不能作为当前代码的证据。** 9 张图鉴截图是三栏常驻版（2026-09-03 21:53），代码已改为 mac 抽屉版；3 张策展截图顶栏还写「词典」（2026-08-31），代码已改为「图鉴」（App.jsx:21）。当前代码没有任何一张截图。
10. **v2 的方向大体成立，但它有一个致命盲区：它没看过代码和截图，因此完全不知道 9 个可交互舞台的存在**，从而给出了「工具降级、词典保留 62 词条」这种建立在错误库存上的频道结论。这一条必须推翻，理由见 F。

---

## A. 产品当前实际是什么（按代码事实）

### A.0 先纠正材料本身的三处不实

- **截图是 13 张不是 14 张。** `current-ui-screenshots/` 下：9 张 `atlas-*-1440.png`、`catalog-390x844.png`、`curation-1280x900.png`、`curation-390x844.png`、`curation-768x1024.png`。
- **截图与代码不同步。** 策展三张的顶栏第二项是「词典」，而 `App.jsx:21` 已改成「图鉴」；图鉴九张是常驻三栏布局，而 `Atlas.jsx:126–128` 已改成 `.ax-mac-desktop / .ax-mac-window` 的假窗口 + 双抽屉。**任何视觉判断都必须分别说明它针对的是截图还是代码。**
- **同一个数字在四处不一致。** README 说生产候选 8,684；`catalog-390x844.png` 页面上印着「3,229 条候选 · 9 个一级分类」；`SiteCatalog.jsx:107–108` 在数据加载完成前硬编码显示 `'5,000+'` 与 `9`；实际加载到的 `site-catalog.json` 是 12 条、4 个分类。也就是说，用户在页面上先看到 5,000+，点一下变成 12。

### A.1 路由表（`router.js:4–8`，`App.jsx:19–24, 124–134`）

hash 路由，`#/<seg>/<a>/<b>`，无 404：任何未知路径都落回 IndexView（App.jsx:132–134）。

| hash | 组件 | 顶栏是否可达 | 数据源 |
|---|---|---|---|
| `#/index`（默认） | `views/IndexView.jsx` | 是（策展） | `data/curated-sites.js`（6 条，未复核）+ `public/data/site-catalog-index.json`（12 条 v3 投影） |
| `#/atlas/<stage>/<term>` | `views/Atlas.jsx` | 是（图鉴） | `data/visual-atlas.json`（220 条）+ `stages/manifests.js` |
| `#/lexicon/...` | 同上（历史别名，App.jsx:124） | 否 | 同上 |
| `#/tools` | `views/Tools.jsx` | 是（工具） | 无（纯客户端图像计算） |
| `#/submit` | `views/Submit.jsx` | 是（提交） | localStorage + `fetch('/data/curation/manifest.json')`（**该文件不存在**） |
| `#/entry/<id>` | `views/Entry.jsx` | **否** | `entries.js`（旧 62 词条体系） |
| `#/key` | `views/KeyView.jsx` | **否** | `key.js` 二叉鉴定树 |
| `#/compare/<a>/<b>` | `views/Compare.jsx` | **否** | `entries.js` |
| `#/matrix/<fam>/<id>` | `views/Variants.jsx` | **否** | `variants.jsx` |

后四条只能通过 ⌘K 命令面板（Palette.jsx:9–13, 64）或从 Entry 页内部互跳进入。也就是说：**产品有 9 条路由、4 个顶栏入口、5 个隐藏页面。**

两个全局浮层不属于任何频道：`Palette`（⌘K / `?`，App.jsx:34–43）与 `SpecPanel`（只能从 Palette 里再打开，App.jsx:137–138）。

### A.2 四个频道的模块清单

**策展（IndexView.jsx，213 行）**
1. 头部：kicker「CURATED WEB INDEX」+ 大标题「外部网站策展」+ 计数徽章「n / 6 个已核验站点」+ 一句 deck（第 51–61 行）。
2. 控制区：搜索框（第 69–75）、技术栈 `<select>`（第 85–92）、用途 pill 行（第 96–119）——用途值来自 `curationFacets()` 对 6 条 legacy 数据 `site.category` 的去重（lib/curation.js:167），即**七个由手写自由文本产生的分类**（「动效与营销」「应用组件系统」「微交互与页面区块」…），与 v3 的 13 类、也与 catalog 的中文类名，三套互不相同。
3. 卡片墙：3 列 grid（App.css:838–842），每卡 = 三图（1 大 2 小）+ 名称 + scale + pricing + 技术栈 pill 行 + 主题 pill 无限跑马灯（第 134–190）。整卡是 `<button>`，点击开浮窗。
4. 下方直接嵌入 `<SiteCatalog />`（第 204），无任何过渡说明。
5. `SiteDetailModal`（第 207–210）。

**完整资源目录（SiteCatalog.jsx，332 行）** — 挂在策展页底部，不是独立路由。
1. 头部 + 右侧大数字块（第 182–194，即 `5,000+` 占位）。
2. 「浏览 5,000+ 条完整目录」按需加载按钮（第 196–201）。
3. 加载后：搜索框 + **五个下拉**（一级分类 / 细分类 / 标签 / 价格 / 来源，第 226–276）+ 结果计数 + 清除筛选。
4. 顶部与底部各一个分页器，含「跳转到目录页」下拉（第 42–63）。
5. 结果卡：三图 + 名称 + 域名 + 描述 + 最多 3 个 meta 标签 + 价格（第 296–319）。
6. 同一个 `SiteDetailModal`（第 329）。

**图鉴（Atlas.jsx，597 行）**
1. 假 macOS 标题栏：三个红黄绿圆点（第 130–134，纯装饰、无功能）+ 领域徽章 + 舞台名 + 四个按钮（大纲 / 重演 / 导出代码 / 详情）。
2. 中央舞台：顶部变体胶囊坞（第 216–238）、舞台组件视口（第 241–266）、悬停浮标（第 260–265）、底部参数旋钮坞（第 269–312）。
3. 左抽屉（默认关）：8 大领域树（其中多数标「规划中」）、舞台搜索、按 slot 分组的术语流、底部水位「已入台 x / y · z 台」。
4. 右抽屉（默认关）：`TermPanel` = 术语名 / 中文名 / 轴与 slot chips / 定义（中英）/ 编辑批注 / 别名 / 媒介绑定 / 跨台互引 /「专精领域标杆库与工具」/ 来源 /「网站库已收录」。
5. `CodeExportModal`（第 451–458）。

**工具（Tools.jsx，470 行）**
1. Spec 提取器：截图 → k-means 取 6 色 → 角色推断 + 最近 Tailwind 色名 + 测量单 JSON。
2. Diff 描述器：两图重采样到 24×24 → CIEDE2000 → 三张热图 + 差异单 JSON + **明确写出重采样局限**（第 356–358）。
3. 「收敛循环」说明段。
4. 「协议安装」三卡：MCP / JSON API / llms.txt，标题写「全部为真实可用的开放协议与端点」（第 443），其中后两个端点在本仓库不存在。

**提交（Submit.jsx，233 行）**
1. 诚实的说明（「本站当前没有接收或审核后端」）。
2. Track 01 手工交付说明；Track 02 本机草稿表单（类型 / 名称 / 术语 / 链接 / 说明）。
3. 站点类型时的查重预检（第 61–96）——`fetch('/data/curation/manifest.json')` 恒 404，因此**五态查重在本构建里永远走 error 分支**，用户永远只看到「暂时无法读取公开查重索引」。
4. 复制 / 下载 JSON；「真实审核发送暂不可用」按钮 `disabled`。

---

## B. 信息架构问题：断点在哪里

### B.1 策展页内部就已经断成两半

`IndexView` 用 `CURATED_SITES`（data/curated-sites.js，6 条），`SiteCatalog` 用 `site-catalog-index.json`（12 条）。这 6 条**全部包含在**那 12 条里（id 对照：magic-ui / origin-ui / hover-dev / shadcn-ui / uiverse / 21st-dev）。于是同一屏内：

- 同一个站出现两次，用**两套不同截图**（`/shots/magic-ui/01.png` vs `/shots/magic-ui/v2-identity.png`，两套文件都躺在 `public/shots/` 里，18 张冗余）。
- 同一个站有**两个分类**：`curated-sites.js:13` 说 Magic UI 是「动效与营销」，`site-catalog.json` 说是「组件与设计系统」。
- 同一个站有**两段互相矛盾的权利描述**：`curated-sites.js:8` 说 Magic UI「全部开源（MIT）」；`magic-ui.json:15` 的复核结论是「Free core components + paid Magic UI Pro」。用户看到的第一张卡说的是没经过复核的那句。
- 最刺眼的一例：`curated-sites.js:39` 写「Origin UI 的官方演示站：508 个粒子级可筛选界面组件……全部开源」、作者「COSS 团队」；而下方目录里同一条 `origin-ui` 的复核描述是「Cal.com 团队公开构建……目前仍处早期开发阶段，可能随 Base UI 演进产生破坏性变更」。**归属、规模、成熟度三项全冲突，且两张卡相隔不到一屏。**

### B.2 策展 → 图鉴：零导流

`IndexView.jsx`、`SiteCatalog.jsx`、`SiteDetailModal.jsx` 三个文件中，`go(` 或 `href="#/atlas` 的出现次数为 **0**。用户在一个组件库详情页里，没有任何路径通向「这个站示范了哪些术语」。context/01 第 12.3 节明确要求这条链，代码里不存在。

### B.3 图鉴 → 策展：单向且断在半路

`Atlas.jsx:465` 通过 `catalogMatchesFor()`（lib/atlas-source-link.js）做**域名反查**：把术语的 `sourceEvidence[].url` 主机名和 catalog 条目的域名比对。这只在术语来源恰好是已收录站点时命中，命中后渲染一个「网站库已收录」区块（第 540–552），但那个区块**不可点击**——只有一个「去网站库 ↗」按钮，`go('index')`，把用户扔回策展首页顶部，不带任何筛选、不打开那个站的详情（第 550）。这是典型的"看起来连上了、实际断在最后一步"。

### B.4 图鉴 ↔ 旧词典：完全隔离

- 顶栏「图鉴」指向 `Atlas`（visual-atlas.json 的 220 条 candidate 记录）。
- 旧词典的 62 条正式词条（entries.js）拥有更完整的产品形态：可运行 demo（autopsy.jsx）、记谱法、基因族、最小实现代码、反模式、同源矩阵、Agent 端点、Spec 板。
- 两者**没有任何 id 映射、没有任何互链**。`App.jsx:21` 甚至把 `entry/key/compare/matrix` 都算作「图鉴」高亮态，但从图鉴页跳不过去。
- 唯一入口是 ⌘K，而 ⌘K 提示条 `.nav-cmdk` 只存在于 CSS（App.css:107–116），**App.jsx 从未渲染它**。也就是说这条入口对新用户是不可见的。
- 顺带：Palette 的动作项写「组件索引 · 开源生态」但 `run: () => go('index')`（Palette.jsx:11），而 `index` 现在是策展页，标签与目的地已经对不上。

### B.5 工具 → 一切：孤岛

Tools.jsx 里没有一处 `go(`。它既不从策展的站点详情被调起（context/01 §11.2 要求「分析这个网站」动作），也不接收图鉴的参数。它的两个工具都要求用户**自己先有截图**，而站内明明存在 36 张核验截图（`public/shots/`），没有一条「用这个站的证据图试试」的路径。

### B.6 提交 → 一切：孤岛且失效

Submit 页只有一个出口 `go('atlas')`（第 231 行，"先逛逛图鉴"）。反向没有任何页面链接到提交（顶栏除外）。查重预检因缺文件恒失败（B 节 A.2 第 5 条）。

### B.7 详情没有 URL

`SiteDetailModal` 由 `useState` 控制（IndexView.jsx:29、SiteCatalog.jsx:76），**没有路由**。后果：详情页不可分享、不可深链、浏览器后退直接跳出页面、不能被 Agent 引用、不能做 SSR/SEO。而卡片是 `<button>`（IndexView.jsx:126–133），所以**中键/⌘ 点击也无法在新标签打开源站**——v2 §6.3 建议的"老手直通"在结构上不可能实现。

### B.8 图鉴首屏是空的

`Atlas.jsx:43–44` 把 `leftOpen`/`rightOpen` 初始化为 `false`。首次进入 `#/atlas`：左边没有术语列表，右边没有释义，中间是 `stage.claims` 里第一个舞台的静止态，顶部只有一排中文变体胶囊。一个不知道「文字浮现台」是什么的用户，屏幕上没有任何一句话告诉他这是什么、能干什么。这个默认值把产品最难的「让人知道它叫什么」直接藏在了两个图标按钮后面。

---

## C. 视觉与交互问题

### C.1 逐张截图

> 提醒：策展三张摄于 2026-08-31（顶栏还写「词典」），图鉴九张摄于 2026-09-03（三栏常驻版）。以下缺陷凡在代码中仍然存在的，我会标注代码位置；凡已被后来的代码改动覆盖的，我会写明。

**`curation-1280x900.png`（策展 · 桌面）**
- 首屏 900px 里，前 290px 是空白 + 标题区，第一排卡片只露出约 340px、第二排刚露出一条边。**约 32% 的首屏没有内容**。
- 层级倒置：「外部网站策展」用超粗黑体大字，而真正的差异化承诺「6 / 6 个已核验站点」被排成灰色小字贴在标题右下角。产品唯一无法被抄袭的那句话，是页面上最小的一行。
- 「用途」pill 行在右端被**硬切**（最后一项只剩「应用」二字），没有渐隐、没有箭头、没有滚动提示。
- 卡片主题 pill 跑马灯**两端都在切字**：「ph Matrix」「aint buttons」「plication UI」。这不是遮罩效果，是词被砍掉了。原因在 App.css:2982–2988——覆盖层把动画从"悬停才跑"（App.css:1043–1045，8s）改成了"一直跑"（18s），6 张卡上 6 条永动的文字带同时在跑。
- 卡片信息密度失衡：一张卡上有 **9–11 个 chip**（4 个技术栈 + 5+ 个主题），却**没有一句"你能拿走什么"**。1.5 秒判断的承担者不存在。
- 两种 chip 配色（紫框 / 绿框）语义不明；紫色来自 App.css 里那族未进 token 的靛紫（#4f46e5 / #6366f1 等，共出现 30+ 次）。
- 三图卡的「身份 / 范围 / 事实证明」三种角色**在视觉上完全不可见**：两张副图缩到约 120×95px，是无法辨认的缩略图，也没有任何标签说明它们各自在证明什么。v3 数据里 `pages[].role` 和 `selectionRationale` 都在，界面一个字没用。

**`curation-768x1024.png`（策展 · 平板）**
- 两列布局，卡片变宽后主图裁切更狠：Coss UI 卡的主图标题变成「ern UI component / on top of Base UI.」——首字母被切。三图区用固定比例裁切原始 1280×900 截图，越宽越切。
- 反常识的是：**768 宽能完整显示 7 个用途 pill，1280 宽反而切掉**。原因是 1280 时头部改成"左标题 / 右搜索"两列（App.css `.oreo-frame-header`），pill 行被挤进左半区。视口越大可用筛选越少。

**`curation-390x844.png`（策展 · 手机）**
- 头部（kicker + 标题 + 计数 + deck + 搜索 + 技术栈下拉 + 用途行）吃掉 **375 / 844 ≈ 44%** 的首屏，第一张卡只露出图片部分。
- 顶栏在手机上塌成一个汉堡（App.jsx:91–101），**四个频道一个都看不见**。产品结构在移动端首屏是不可知的。
- 用途 pill 行同样在右端被切（「社区组件注册表」后直接断），且它是横向滚动区，但没有任何滚动提示。
- 三图卡在 390 宽退化最差：主图约 230px 宽，两张副图挤在右侧约 110px 的列里，完全不可读。它们既不能提供信息，又占掉 1/3 的卡面积。v2 §9 建议的「主图 + 角标 +2」没有实现。
- 主题 pill 依旧切字（「yph Matrix」）。

**`catalog-390x844.png`（完整目录 · 手机）**
- 页面上**最大的字是「3,229」**，含义是"没有被人核验过的候选数量"。一个靠"我们真的进去看过"立身的产品，把没看过的数量做成了移动端最大的视觉元素。
- 顶栏 `position: sticky` 且 `background: transparent`（App.css:74–80），所以卡片的主题 pill 直接**从 logo 底下穿过去**，截图上「HTML/CSS Tailwind CSS React Figma」和「VisLexicon」叠在一起。这是纯粹的实现缺陷，代码里仍在。
- 分节标题「COMPLETE RESOURCE CATALOG / 完整资源目录」与上方策展区之间只有一条 1px 灰线（App.css:3115），两种内容标准（已核验 / 未核验）在视觉上是同一级别。这正是 context/01 §3.1 要求消灭的断层，代码里它还在，而且是首页的默认状态。

**`atlas-text-reveal-1440.png`（文字与排版工坊）**
- 舞台画布约 785×525px，里面只有「hello world」六个字符 —— **约 60% 的像素预算是空白**。而这一台自称覆盖「微观字形度量、大号艺术字材质修辞与时间动力学」。
- 标本文本是 `hello world`（Stage.jsx 的默认值是 `Typographic Kinetics`，说明截图版与当前代码的默认值也不同）。用占位符演示排版，等于没演示。
- 12 个变体胶囊换行成两排，样式完全一致、无分组、无预览。用户要知道「文本变形」和「文字流光」的差别，只能一个个点。
- 右栏「专精领域标杆库与工具」6 张卡，占的纵向空间比术语自己的定义还多。这些卡来自 `lib/curated-resources.js`，全部是**硬编码、无核验时间、无许可、带最高级形容词**的条目（"全球公认的网页排版圣经"、"最权威"）。它们和正下方带 `MIT · 2026-08-31` 的「来源」块并排，同一个面板上两套证据标准。
- 底部 6 个滑块排成 3×2，时间量（逐字延迟 / 单字时长）、尺寸量（字号 / 位移 / 字距）与开关（显示排版标尺）混在一起，控件外观完全相同。

**`atlas-agent-composer-1440.png`（Agent 智能体交互界面）**
- 这一台是「AI 产品模板味」的震中：中间是一个高度仿真的 Claude 式聊天界面，模型胶囊上直接写着 `Claude Opus 5`，配色来自 App.css 第 1 行自述的「Anthropic 浅色暖调」。一个以署名和许可为立身之本的产品，把另一家公司的界面与配色照着做了一遍。这不是"学信息节奏"，是复刻外观。
- 示例内容本身是自吹自擂的营销体：用户气泡写「请帮我将 Agent UI 升级为世界第一流的现代设计审美」，回复写「采用 OKLCH 感知均匀色盘重构表面对比阶梯」。教学标本里塞广告词。
- 中间左侧有一列 5 个 emoji 图标（✦ 🎨 ⚡ 🍱），来自 Stage.jsx:13–18 的假会话列表。emoji 当图标 + 假数据，是模板味的第二个来源。
- 「Composer 作曲家」这个机器误译**被印在标本内部**（第 705 行位置的黑色 chip），而右栏同时写着「语料原译『作曲家』已在台上订正」。同一屏里既展示错误译名又声明已订正，互相拆台。
- 右栏 6 个区块（chips / 定义 / 批注 / 媒介绑定 / 专精库 / 来源 / 网站库）视觉权重完全一致，没有主次。
- 左栏底部「已入台 170 / 1046 · 9 台」——1046 是第四个互不相同的图鉴总量（README 说 1,932 生产 / 220 样本；context/04 说 659）。

**`atlas-overlay-modal-1440.png`（浮层）**
- 13 个变体胶囊两排，标签长短悬殊且中英混杂（「popover=hint（提示型弹层）」「Popover API（原生弹层）」）。这两个术语的差别对非专业用户不可解，而胶囊没有任何辅助说明。
- 舞台里 780×540 的灰底页面上，浮出来的对话框只有约 340×110 —— **约 70% 是没有信息的模糊底页**。而这一台要教的恰恰是「遮罩 / 焦点陷阱 / 底页惰性」这三件看不见的事，画面上只用了一个灰色叠层来表示。
- 右栏给「Dialog (Modal)」推荐的四个"专精工具"是 Realtime Colors、OKLCH.com、SmoothShadow、Neumorphism.io —— **四个色彩工具**。这是 `lib/curated-resources.js:65–67` 的兜底分支：凡是没命中关键字的术语一律返回 `DOMAIN_AUTHORITIES.surfaces`。截图直接证明了这个 bug。

**`atlas-state-loading-1440.png`（状态与加载）**
- 同样的兜底 bug：Skeleton 术语下推荐四个色彩工具。
- 舞台约 65% 空白；骨架屏演示只有 4 行灰条，与「流光」变体在静态截图上无从区分。
- 左栏被搜索框**切掉半行**：「状态与加载 9」这一项上半截可见、下半截被搜索框盖住。同一个缺陷在 `atlas-data-display-1440.png`（「05 交互控件与原语」组被切）、`atlas-pointer-gestures-1440.png`（「04 空间拓扑与布局」被切）、`atlas-surface-transition-1440.png`（「数据展示」被切）里重复出现——这是舞台列表容器高度与搜索框位置的固定冲突，四张截图四次复现。

**`atlas-data-display-1440.png`（数据展示）**
- 这是九台里信息设计最好的一台：四种表格类同屏对照，确实解决了「Table / Grid / Treegrid / Listbox 到底差在哪」。
- 但一屏塞了 10 个子面板，正文字号约 11px，密度已经越过可读边界。
- 悬停浮标「Treegrid 树形表格」是黑色实心 chip，**盖住了它要标注的那个面板的标题**（Atlas.jsx:260–265 的定位逻辑只算 top/left，不避让）。同样的遮挡在 `atlas-form-anatomy-1440.png`（「Checkboxes 复选框」盖住上一个字段）与 `atlas-navigation-1440.png`（「Tabs 选项卡」盖住面包屑）里复现。
- 右栏是一整块未分段的 WAI-ARIA 英文原文（约 90 词）塞进 300px 窄栏，中英两段之间没有任何视觉分隔。
- 顶部变体坞只有一个「常态」胶囊 —— 一个只有一个选项的切换器。

**`atlas-form-anatomy-1440.png`（表单解剖）**
- 内容质量最高的一台：一张完整的真实感表单，热区覆盖 21 个术语。
- 右栏给「Checkboxes」推荐 Bento Grids / Component Gallery / Land-book —— 又是 `curated-resources.js:63–64` 的 `form-anatomy → layout` 硬映射，与复选框无关。
- 表单右列的两个滑块（并发上限 / 活跃时段）没有数值标签，只有轨道和圆点。
- 底部三个参数（字段间距 / 控件圆角 / 控件高度）与舞台内容脱节：改了也很难在这么密的表单里看出来。

**`atlas-navigation-1440.png`（导航）**
- 舞台下半部约 250px 完全空白。
- 演示里「更多」下拉是**默认展开**的，且里面有一项红色「删除」。教学标本里放一个高亮的破坏性动作，是纯噪音。
- 「跳转到主内容」skip link 被做成一个常显黑色 chip 贴在舞台左上角，看起来像标签而不是无障碍功能。
- 右栏又是 Bento Grids / Component Gallery / Land-book。

**`atlas-pointer-gestures-1440.png`（指针与手势）**
- 底部 **12+ 个滑块**排成 3 列并延伸到折叠线以下，外观完全一致，无分组（启动阈值 / 延迟触发 / 滑动距离阈值 / 轴判定阈值 / 边界内缩 / 橡皮筋 / 点击判定阈值 / 缩放上限…）。其中多个初始值为 0，滑块钮全部堆在最左端，视觉上像一堆没设置好的控件。
- 舞台右侧一列元素里混着「焦点环 · Tab 试试」这样的操作提示，把说明书写进了标本内容。
- 状态读数条（状态 / 位移 / 距离 / 速度 / 锁定轴 / 判定）是这一台真正的教学价值所在，却排在舞台下方一个不起眼的浅色块里。

**`atlas-surface-transition-1440.png`（过渡形变）**
- 16 个变体胶囊两排，是九台里最长的一组，同样无分组无预览。
- 标本是三个米色空盒（声音 / 光 / 重量）加一个大米色盒。**在静态截图上，一个讲"十六种从 A 到 B 的走法"的舞台完全不可读**：没有时间轴、没有 scrub、没有前后帧对照、没有轨迹。这一台的全部信息都藏在必须点击才发生的 520ms 动画里。
- 右栏 4 个动效工具（60fps.design / Framer Motion / GSAP / Animata），同样是硬编码的无核验条目。

### C.2 设计系统现状：不存在

`App.css:2–34` 声明了一组 token（25 个），然后整份文件用 **469 个不同的硬编码 hex** 把它们绕过去。量化：

| 维度 | token 数 | 实际字面量种数 | 证据 |
|---|---|---|---|
| 颜色 | 12 个语义色 | **469** 个不同 hex（App.css）+ 22 个（atlas.css） | `grep -o '#[0-9a-f]{3,8}' App.css \| sort -u` |
| 圆角 | 2（`--r:10px`、`--r-sm:8px`） | **37** 种字面量；`99px` 出现 46 次、`8px` 34 次、`var(--r)` 仅 24 次 | App.css |
| 阴影 | 1（`--shadow`） | **85** 种不同 `box-shadow` | App.css |
| 字号 | 0 | **37** 个 px 字面量（含 4px、6.5px、7.8px、8.5px…全部 0.5px 粒度）+ 17 个 `clamp()` | App.css |
| 间距 | **0 个 token** | 31 种不同 `gap` 值 | App.css |

更严重的是**三套调色板并存**：
1. token 里的 Anthropic 暖灰（`--bg:#f7f7f5`、`--text-h:#141413`，见 App.css:1 的自述「Anthropic 浅色暖调」）；
2. Tailwind 默认灰直接抄进 CSS（`#9ca3af` 16 次、`#111827` 16 次、`#6b7280` 10 次、`#374151` 6 次）；
3. 一族**完全不在 token 里的靛紫**（`#4f46e5` 11 次、`#6366f1` 10 次、`#6d28d9` 7 次、`#4b43b8` 7 次）——这就是策展卡片上紫色技术栈 pill 的来源，也是"AI 模板味"最直接的色彩证据。

还有两套并行的画布定义：全局 `--bg: #f7f7f5`（第 3 行）与策展页专用 `--oreo-page: #f9f9f8`（第 2385 行），靠 `.site[data-view='index']` 切换（第 2399）。两个值差 2/255，视觉上无差别，但保证了任何人都无法推理这个系统。

**分层结构本身已经崩了。** App.css 第 2370–2373 行自述：「VISLEXICON 2026 PRODUCTION OVERRIDES / Oreo 官方顶栏实测复刻；本段也是旧 shell 样式的最终覆盖层。」——即新样式是叠在旧样式之上的覆盖层，而不是替换。第 672 行更直白：「100% 像素级复刻 Oreo Design 完整外周底板与卡片系统」。对一个以「不搬运竞品文案、图片、代码」为原则的产品，把另一个产品的计算样式逐像素抄进自己的设计系统并写进注释，是自我否定。同一份文件里还留着 `--oreo-column-gap: 9px`（第 2389）——v2 §2.3 点名批评过的那个 9px。

**死 CSS 规模可观**：`.nav-logo`、`.nav-mark`、`.nav-pill`、`.nav-cmdk`、`.nav-theme` 有完整样式（App.css:79–120）但 App.jsx 从未渲染；`图鉴（wiki 形态）` 与 `图鉴 · wiki 文件树形态` 两大段（第 2168–2341）服务于已被删除的 `Lexicon.jsx`；`Demo 演示场景（58 词条 × 独立品牌）`（第 1143–1847，约 700 行）只服务于 ⌘K 才能到达的旧词条页。

**字体**：`@font-face` 加载 `inter-variable-latin.woff2`（App.css:2374–2380），但 `--sans` token 里根本没有 Inter（第 24 行），全站只有 4 处显式使用它。而这是一个**全中文界面**——Inter 是纯 Latin 子集，所有汉字一律落到 `system-ui` 兜底。也就是说：产品加载了一个网络字体，让它管理不到 90% 的可见文字，而真正承载中文的字体完全没有被选择过。这解释了为什么各页标题的字重与气质在截图里看起来不统一。

`index.html` 里 `<title>VisLexicon · 视元 — 视觉词典</title>` 和 meta description（"五轴受控词表 × 可玩演示 × Design Spec"）描述的是**两代之前的产品**；`<link rel="icon" href="/favicon.svg">` 指向不存在的文件。

### C.3 响应式

**断点清单**：App.css 有 `1214 / 1050 / 1024 / 960 / 900 / 768 / 700 / 680 / 600 / 360` 十个不同的 max-width，atlas.css 有 `1180 / 860` 两个。**十二个断点，没有一个共用的断点变量**。这不是响应式系统，是十二次局部救火。

**策展**：卡片 3 列 → 1050px 转 2 列 → 680px 转 1 列（App.css:838–854）。栅格本身没问题，问题在卡片内容不随之改变：三图比例、chip 数量、跑马灯在 390px 上和 1280px 上完全一样，于是副图变成不可读的邮票、chip 行溢出、跑马灯切字。

**图鉴**：这是最严重的一处。atlas.css 只有 1180 和 860 两个断点，而且它们操作的是 `.ax`、`.ax-rail`（`position: static`）、`.dd-grid`、`.fm-cols`、`.nv-body` —— 即**旧的三栏外壳**。当前 `Atlas.jsx` 渲染的是 `.ax-mac-desktop / .ax-mac-window / .ax-glass-drawer`，而这套新外壳**没有任何 media query**。具体后果：
- `.ax-panel { width: 400px }`（atlas.css:441–445）在 390px 视口上比屏幕还宽。
- `.ax-rail { width: 330px }`（第 424–429）在 390px 上占掉 85% 屏宽。
- `.ax-mac-desktop { height:100%; min-height:560px; overflow:hidden; padding: 6px 20px 16px }`（第 11–22）：在 844px 高的手机上，去掉顶栏后舞台高度不足，且 `overflow:hidden` 直接把溢出内容裁掉而不是滚动。
- 底部参数坞在手机上会与舞台内容重叠——`.ax-knobs-dock` 是 `position: absolute`（atlas.css 舞台段），舞台高度被压缩后没有回退方案。
- 简言之：**当前代码的图鉴在手机上没有被设计过**。截图证明不了这一点，因为截图拍的是旧版三栏（而旧版至少有 860 断点会把三栏叠成一栏）。

**没有任何一处使用 `dvh` 以外的移动端视口修正**，`min-height: calc(100dvh - var(--shell-header-height))`（App.css:2554）里的 `--shell-header-height: 80px`（第 2384）与实际顶栏高度不符——`.nav` 的 padding 是 `14px 22px 10px`（第 78），加上 26px 的品牌行，实际约 60px。20px 的常量误差直接变成每页底部多出的滚动。

### C.4 无障碍：零件齐全，装配缺失

**做对的**：
- skip link（App.jsx:62，App.css:2401–2406）。
- `aria-current="page"`（App.jsx:82、112）。
- `.sr-only` 正确实现（App.css:2541–2551）。
- `aria-live="polite"` 用在计数上（IndexView.jsx:56、SiteCatalog.jsx:279）。
- 表单错误用 `role="alert"` + `aria-invalid`（Submit.jsx 各处）。
- 汉堡按钮有 `aria-expanded` / `aria-controls`（App.jsx:95–96）。
- **reduce-motion 实现得比大多数项目认真**：App.css:2338–2340 和 2526–2534 有两层全局兜底，2526 那层还处理了 `scroll-behavior`；App.css:3096–3109 单独处理跑马灯（改成可横向滚动 + 隐藏重复副本）；atlas.css:1865–1893 逐个点名 14 个舞台动画类，并且**给热区描边留了 `outline` 替代**（第 1888 行 `.sn-on::after { outline: 2px solid var(--acc) }`），这一条是真正的深思熟虑。SiteCatalog.jsx:116–117 在 JS 里也检查了 reduce-motion 再决定 `scrollIntoView` 的 behavior。

**做错的**：
1. **焦点陷阱只装了一半。** `lib/modal-focus.js` 实现了完整的 `trapTabKey`、`startModalFocusSession`、`restoreFocus`、`focusRemovalNeighbor`，`lib/use-modal-focus.js` 把它包成 hook。但全仓只有 **SpecPanel.jsx:31** 和 **Palette.jsx:22** 用了它。产品的主力浮窗 `SiteDetailModal.jsx:48–59` 只做了「聚焦容器 + Esc 关闭 + 恢复焦点」，**没有 Tab 陷阱**：键盘用户按 Tab 会走出浮窗、进到背后被遮住的卡片墙里，且背景没有 `inert`、没有 `aria-hidden`、没有滚动锁定。`CodeExportModal.jsx:14–26` 更差：只有 Esc 和 `body.overflow='hidden'`，没有焦点管理、没有 `aria-label`，而且把 `role="dialog" aria-modal="true"` 放在了**背景遮罩**上（第 112）而不是对话框本身。
2. **图鉴抽屉关闭时仍可被 Tab 进入。** atlas.css:430–435 / 447–452 的 `.closed` 状态只设 `transform / opacity / pointer-events`，没有 `visibility: hidden`、没有 `display:none`、JSX 里没有 `inert` 或 `hidden`（Atlas.jsx:316、424）。两个抽屉里加起来有上百个按钮，全部对键盘和屏幕阅读器可见。这在默认双关的设计下尤其糟：键盘用户按 Tab 会掉进一个屏幕上看不见的术语列表里。
3. **对比度不达标**（sRGB，WCAG 2.1 计算）：

| token | 值 | 底色 | 对比度 | AA 正文(4.5) |
|---|---|---|---|---|
| `--text-2` | #8c8a82 | #f7f7f5 | **3.22** | 不通过 |
| `--text-2` | #8c8a82 | #ffffff | **3.46** | 不通过 |
| `--lime` | #0d8a55 | #f7f7f5 | **4.09** | 不通过 |
| `--err` | #bf4d43 | #f7f7f5 | **4.49** | 不通过（差 0.01） |
| `--sky` | #6a9bcc | #f7f7f5 | **2.73** | 不通过 |
| `--warn` | #b08d3e | #f7f7f5 | **2.91** | 不通过 |
| `--text` | #6b695f | #f7f7f5 | 5.14 | 通过 |
| `--text-h` | #141413 | #f7f7f5 | 17.19 | 通过 |
| dark `--text-2` | #77756c | #141412 | **3.99** | 不通过 |

`--text-2` 是**次级文本的默认色**：导航未选中态、卡片元数据、`.x-mono` 全部用它。而 `.x-mono` 的字号是 `0.8rem`（App.css:65）= 约 11.6px。**11.6px + 3.2:1** 是页面上大量元数据的实际渲染参数。`--lime` 是策展卡片主题 pill 的绿色，也不达标。

4. **基础字号 14.5px**（App.css:32）偏小，且是一个非整数值，与 0.5px 粒度的 37 个字号字面量共同导致亚像素渲染不稳定。
5. **无 `prefers-color-scheme` 支持**：暗色主题只由 `html[data-theme='dark']` 触发（App.css:37），而**全仓没有任何一行 JS 设置这个属性**（`grep data-theme` 在 .js/.jsx 中零命中）。`store.js:10` 存了 `theme: 'light'` 但从未应用。CSS 里写了几百行暗色规则，全部不可达；`.nav-theme` 切换按钮只有样式没有元素。
6. **可点击的非按钮**：`stages/text-reveal/Stage.jsx:143–149` 用 `<p onClick>` 进入编辑态，无 `role`、无 `tabIndex`、无键盘触发。`views/Tools.jsx:129` 的拖放区是 `<div onClick>`，同样不可键盘操作。
7. **landmark 嵌套**：App.jsx:123 已有 `<main id="main-content">`，而 Tools.jsx:413、Submit.jsx、Entry.jsx:53 内部又各自渲染 `<main>`，形成嵌套 main。
8. **图鉴的方向键劫持**：Atlas.jsx:74–92 全局监听 ←/→ 切换术语，只排除了 INPUT/TEXTAREA，没有排除 `<select>`（参数坞里的 enum 控件，第 289–293）——用键盘操作 enum 下拉时会同时切换术语。
9. **图片 alt**：`SiteDetailModal.jsx:32,37` 在 `shot.alt` 缺失时回退成站点名，三张图会得到三个相同的 alt。

---

## D. 内容模型与前台的错配

### D.1 v3 条目的真实字段结构（从 4 个样本实测）

```
approved-v3/<id>.json
├─ schemaVersion: 3
├─ entryId, entityId, attemptId, status:"APPROVED"
├─ official { inputUrl, finalUrl, checkedAt }          ← 核验时间在这里
├─ editorial { name, descriptionZh, pricing }
├─ classification
│   ├─ recordLevel:"entry", entityId
│   ├─ primaryCategory, subcategory                     ← 13 类 / 57 小类
│   ├─ status:"confirmed", alternatives:[]
│   ├─ reasons[] { statement, evidenceUrl }             ← 分类理由 + 证据 URL
│   └─ curatorId, reviewerId, confirmedAt               ← 双人复核
├─ facets { 12 个正交轴 }
│   scenarios / deliverables / actions / media / platforms / technologies /
│   workflowStages / audiences / access / licenses / contentOrganization / languages
├─ pages[3] { role:"identity|breadth|proof", sourceUrl, finalUrl, title,
│              selectionRationale,                       ← 为什么选这一页
│              shot { src, sha256, width, height, bytes, alt } }
├─ facts[] { field, value, sourceUrl, evidence, confidence }   ← 逐条事实 + 证据句
└─ qa { curatorId, technicalPassed, semanticReviewerId, semanticPassed, editorialReviewerId }
```

### D.2 前台实际渲染了什么

`site-catalog.json` 的投影后字段：
```
{ id, name, canonicalUrl, domain, descriptionZh, category(中文标签),
  subcategories[], tags[], pricing{model,label}, reviewStatus, evidenceLevel,
  sourceIds[], shots[3]{role,src,sourceUrl,alt}, liveTitle, siteStatus }
```

对照结果：

| v3 字段 | 前台是否使用 | 位置 |
|---|---|---|
| `editorial.descriptionZh` | ✅ | SiteCatalog.jsx:312、SiteDetailModal.jsx:71 |
| `pages[].shot.src` | ✅ | SiteShotTrio / SiteDetailModal.jsx:30–41 |
| `pages[].role`（身份/范围/证明） | ❌ 投影保留了字段，界面**从不使用** | 三张图并排渲染，无角色标注 |
| `pages[].sourceUrl` | ❌ 投影保留，界面**从不链接** | 用户点不进那三页关键页面 |
| `pages[].selectionRationale` | ❌ **投影中已被丢弃** | — |
| `pages[].shot.sha256/width/height/bytes` | ❌ 丢弃 | — |
| `facts[]`（作者/仓库/许可/定价 + evidence 句 + sourceUrl） | ❌ **全部丢弃** | 详情页的「作者」栏靠 `site.author?.author \|\| site.authorName`（SiteDetailModal.jsx:74）读一个投影里根本不存在的字段，因此**12 条 v3 条目在浮窗里永远不显示作者**；只有 6 条 legacy 卡有作者 |
| `classification.reasons[]` | ❌ 丢弃 | — |
| `classification.curatorId / reviewerId / confirmedAt` | ❌ 丢弃 | 「双人复核」这个卖点前台无痕迹 |
| `official.checkedAt` | ❌ 丢弃 | 前台没有任何一处显示核验时间 |
| `facets`（12 轴） | ⚠️ **被压平成一个 `tags` 数组** | 见下 |
| `classification.primaryCategory` | ⚠️ 被替换成中文 `category` 标签 | SiteCatalog.jsx:229–235 的下拉 |
| `classification.subcategory` | ✅ 作为 `subcategories[]` | SiteCatalog.jsx:237–245 下拉 + catalogMetaLabels |
| `qa` | ❌ 丢弃 | — |

**互相打架的设计**，具体三处：

1. **12 个正交轴被压平成一个袋子。** `magic-ui.json:38–88` 明确把 `marketing` 放在 scenarios、`component/block` 放在 deliverables、`browse/copy/install/preview` 放在 actions、`react/tailwind` 放在 technologies。而 `site-catalog.json` 里 21st-dev 的 `tags` 是：`["agent","ai","block","browse","component","copy","install","preview","prompt","purchase","react","search"]` —— **场景、动作、交付物、技术四个轴混成一列**。前台的「标签」下拉（SiteCatalog.jsx:247–255）因此把「react」和「purchase」并列成同一种筛选。这正是 `00-READ-ME-FIRST.md` 第 14 行禁止的事，而它已经发生在投影里了。投影脚本不在本包内，但产物是证据。
2. **`descriptionZh` 被要求同时干三件事。** v3 规格要求它是「不靠标签拼的人话简介」，实际它同时承载了定位、规模、价格、许可、限制（见 `entry-shadcn-studio-blocks.json` 那句 200 字长句）。前台把它渲染成卡片上的 3 行截断（App.css `.catalog-card-desc`）和浮窗里的一段（SiteDetailModal.jsx:122）。结果是：卡片上看到的是被截断的半句话，浮窗里看到的是一段没有断点的长文。**「一句拿走什么」这个字段在数据模型里不存在**，所以前台也造不出来。
3. **两套并存的站点模型。** `data/curated-sites.js` 的形状是 `{id,name,site,author,repo,about,scale,pricing,stacks[],themes[],category,keywords[],shots[]}`，与 v3 毫无关系；`lib/curation.js:59–133` 还专门为它写了一套独立的 `validateCuratedSites` 校验（要求恰好 3 张图、路径必须是 `/shots/<id>/`、sourceUrl 主机名必须匹配官网）。这套校验写得很严谨——但它校验的是一份**未经复核、且与已复核数据冲突**的数据。工程严谨性用在了错误的对象上。

### D.3 「删掉主分类字段」的工程代价

我逐处查了 `primaryCategory` 的依赖点：

| 文件 | 行号 | 性质 |
|---|---|---|
| `data/curation-taxonomy.js` | 354, 361, 511–512, 517–519, 552, 605–623, 711 | 校验：字段白名单、alternatives 校验、类目/小类归属校验、单站类三页证据门禁 |
| `lib/curation-evidence.js` | 86, 1443 | 快照字段列表 + `toPublicSite()` 投影时透传 |
| `lib/mining-threshold.js` | 306–310, 342 | 挖掘记录一致性校验：类目必须合法且在路线允许集合内 |
| **前台（views / components / SiteCatalog / Atlas）** | **0 处** | — |

前台完全不知道 `primaryCategory` 存在。它用的是投影后的中文 `category` 字符串（SiteCatalog.jsx:44、229–235）。

**更关键的一点**：上面三个校验模块**在当前应用里全部不可达**。我追了导入图：`curation-evidence.js` 只被 `curation-queue.js` 和 `mining-threshold.js` 导入；`curation-queue.js` 没有任何导入方；`mining-threshold.js` 没有任何导入方；`curation-taxonomy.js` 只被这两个死模块导入。即：

> **删除 `primaryCategory` 的前台代价 = 0。删除它的用户可感知收益 = 0。**

代价明细（如果真要删）：
- 前台改动：0 行。
- 数据改动：12 个 approved-v3 JSON 各删 2 行；但 `subcategory` 不能一起删——它是 `subcategories[]` 的唯一来源，前台的「细分类」下拉（SiteCatalog.jsx:237–245）和卡片 meta 行（`catalogMetaLabels`，site-catalog-browser.js:72–74）都依赖它，删了会让一个下拉和每张卡的 meta 行直接空掉。
- 校验改动：`curation-taxonomy.js` 第 305–758 行这块分类分析区里与主类直接相关的约 120 行；`curation-evidence.js` 2 处；`mining-threshold.js` 约 40 行。合计 200 行以内。
- 但 `isPublishableClassification` 的单站类门禁（第 711–715：`primaryCategory === 'single-site-showcase'` 时强制三页证据 + 人工理由 + 设计相关确认）会一起失效，这是**唯一一条真正在防止垃圾进库的规则**，删主分类必须先给它找到替代锚点（建议锚在 `facets.contentOrganization` 的 `single-work` 值上）。

**结论：v2 §4.1 那句「数据模型里删掉主分类字段本身」找错了病灶。** 前台的数据库味不来自 `primaryCategory`（用户从没见过它），来自三个具体的东西：(a) SiteCatalog.jsx:226–276 的五个下拉；(b) 被压平成一个袋子的 `tags`；(c) 浮窗里「作者 / 源码 / 定价 / 标签」的 `<dl>` 字段罗列（SiteDetailModal.jsx:130–164）。删这三样，比删一个不可见的字段有价值一百倍。

### D.4 图鉴 candidate / published：前台完全不区分

实测 `visual-atlas.json`：

- `stats.byStatus` = `{ candidate: 219, published: 1 }`
- `translationQuality` = `machine` × **220 / 220**
- `sources` 27 个；`coverageDimensions` 194 条（按 07-domain-glossary §15，这些**永远不计入图鉴数量**）

`Atlas.jsx` 全文**没有一处读取 `entry.status`**。`TermPanel`（第 463–555）渲染的 chips 只有 `term.axis`、`term.recordType`、`SLOT_LABEL[claim.slot]`，以及在 `translationQuality === 'machine' && !claim.zhFixed` 时的「机器译名 · 待校」（第 479）。也就是说：

> 一条 `candidate` 记录，被挂上一个手写舞台、配上参数滑块、配上"专精标杆库"、配上"网站库已收录"，在界面上与 `published` 完全无法区分。这正是硬约束第 2 条禁止的事。

而且这不是抽象风险，语料本身的质量支持这个担忧。我抽样的 10 条里：

- **`swipe.duration`**（@use-gesture 配置项）：`definitionZh` 里带着未渲染的相对 markdown 链接原文「请参阅 [swipe](/docs/state/#swipe) 状态属性」——一个坏链被当成中文定义展示。
- **`axisThreshold`**：库的配置项，不是视觉现象。它出现在指针手势台上作为参数术语。
- **`Account connection`**（Shopify Polaris）：「用于将商店与各种帐户连接或断开连接，例如用于销售渠道的 Facebook」——一个 Shopify 业务组件，与视觉设计无关，却计入 `countedAtlas: true`。
- **`Popover API (Explainer)`**：`definitionZh` 是上游文档的一条 NOTE：「注意：此 Popover API 解释器在该功能的开发过程中非常有用……」。这不是定义，是关于文档自身的元说明。而这条术语**是浮层台上的一个变体胶囊**（截图 `atlas-overlay-modal-1440.png` 里的「Popover API（原生弹层）」）——用户点它，右栏会给他读这段废话。
- **`Tabular numbers`**：「对于行情自动收录机、计时器和计数器来说必不可少」——`tickers` 被机翻成「行情自动收录机」。
- **`ActionBar`**：这条记录的 `sourceEvidence` 有两个来源（mantine + primer），两者的 `sourceDefinition` 完全不同（Mantine: "A fixed-position bottom bar for bulk selection actions"；Primer: "A collection of horizontally aligned IconButtons..."），去重逻辑保留了 Primer 的定义作为记录级 `sourceDefinition`，中文名写成「操作栏（Primer）」，但界面上两个来源以**同等权重并列展示**（Atlas.jsx:530–538），不告诉用户上面那段定义来自哪一个。这是跨源合并把两个不同东西并成一条的实例。

context/04 已经诚实记录了这笔账（「台上 55 条仍挂机器译名」「语料存在跨来源重复未去重」），问题在于**界面没有把这笔账告诉用户**。左栏底部只有「已入台 170 / 1046 · 9 台」这一个水位数字，它衡量的是覆盖率，不是可信度。

---

## E. 技术债与可复用资产

### E.1 死代码规模

按导入图追踪，以下模块**没有任何路径能从 4 个顶栏页面到达**：

| 模块 | 行数 | 备注 |
|---|---|---|
| `lib/curation-evidence.js` | 1,475 | 只被两个同样不可达的模块导入 |
| `lib/mining-extractor/*`（4 文件） | 1,371 | 浏览器探针 + CSS/DOM 度量 |
| `data/curation-taxonomy.js` | 766 | 13 类 / 57 小类 registry + 校验 |
| `lib/curation-queue.js` | 655 | 零导入方 |
| `lib/mining-threshold.js` | 509 | 零导入方 |
| `data/mining-signals.js` | 477 | 只被 mining-threshold 导入 |
| `lib/source-observation-ledger.js` | 251 | 零导入方 |
| `data/curation-taxonomy-v2-legacy.js` | 145 | 旧 7 类，已被 v3 取代但仍在树里 |
| `lib/endpoints.js` | 4 | 返回一个不存在的路径 |
| **小计** | **≈5,650** | 占 `src/` 全部 22,893 行的 **≈25%** |

再加上：`src/index.js` 的 `CURATED_SITES` + `LIBRARIES`（约 160 行，只有 `COMPONENTS` 被 Palette 用）、App.css 里的 wiki 段（约 175 行）+ 死导航样式（约 45 行）。

这不是"以后要用"的储备，它们是**被上一代产品结构遗弃在原地的严谨代码**。它们的存在有一个真实伤害：让人误以为「证据校验、去重、发布门禁已经接进产品了」。实际上前台没有一行代码调用过 `isPublishableClassification` 或 `evidenceBundleErrors`。

### E.2 保留 / 重构 / 删除

**保留（质量足够，直接进下一版）**

| 项 | 一句理由 |
|---|---|
| `lib/stage-index.js` + `stages/*/manifest.js` + `registry.js` + `node.js` | 认领写在舞台侧、strict 模式构建期抛错、跨台互引、未入台守恒——全仓唯一一处把"不能悄悄丢东西"做成了机制而不是承诺。 |
| 三个舞台的信息设计：`data-display`、`form-anatomy`、`pointer-gestures` | 它们分别解决了"四种表格差在哪"、"表单每个零件叫什么"、"手势参数调了会怎样"，是产品里唯一无法被搜索引擎替代的内容。 |
| `lib/modal-focus.js` + `lib/use-modal-focus.js` | 焦点会话、Tab 环绕、删除后邻居聚焦都实现正确，只是没装到该装的地方。 |
| `lib/color-diff.js` + Tools 的 ΔE 工具 | 确定性测量，且 Tools.jsx:356–358 主动写出重采样的失真边界——全站唯一一处自己声明不确定性的地方。 |
| `Submit.jsx` 的文案纪律 | 每个状态都写「尚未发送」，disabled 按钮标题写「本站尚未接入审核服务」。这是产品应有的诚实基线。 |
| 四层 reduce-motion 实现（App.css:2338/2526/3096，atlas.css:1865） | 尤其 atlas.css:1888 给热区描边留了 outline 替代，是真正理解了"关掉动画不等于关掉信息"。 |
| `content-samples/approved-v3/*.json` 的数据结构 | `selectionRationale` + `facts[].evidence` + `reasons[].evidenceUrl` 三件套就是"我们真的看过"的可验证形态。 |
| `lib/site-catalog-browser.js` | 纯函数、无副作用、可单测，是前台唯一干净的数据层。 |

**重构（骨架可用，外壳要换）**

| 项 | 一句理由 |
|---|---|
| `views/Atlas.jsx` 外壳（保留舞台，重做壳） | 假 mac 窗框 + 默认双关抽屉 + 无移动端断点，把最好的内容藏在了最差的容器里。 |
| `components/SiteDetailModal.jsx` | 结构对（浮窗方向正确），但必须加路由、加焦点陷阱、把出场顺序从"字段"改成"判断 + 三页导览"。 |
| `IndexView.jsx` + `SiteCatalog.jsx` 合并 | 一个页面两套数据源两套搜索两套卡片，必须收敛成一个。 |
| App.css 的 token 层 | 保留暖灰方向，但要真的建立色/字/距/角/影五组 token，并把 469 个字面量收回去。 |
| `lib/curated-resources.js` | 想法对（术语 → 专精资源），实现全错：应改为从已核验的站点库派生，而不是硬编码 26 条无证据条目。 |
| `lib/atlas-source-link.js` 的域名反查 | 机制可用，但结果必须能点进那个站的详情，而不是把人扔回首页。 |
| `data/visual-atlas.json` 的前台呈现 | 数据本身要保留，但界面必须显式区分 candidate / published，并且给"这条其实是个库的配置项"一类记录一个诚实的降级展示。 |

**删除（现在就应该从树里拿掉）**

| 项 | 一句理由 |
|---|---|
| `components/CodeExportModal.jsx`（164 行） | 它导出的 React 组件不包含舞台的任何真实实现（第 51–66 行是一个写死的 slate-900 盒子加一行 "Live component extracted from VisLexicon Atlas Stage."），却在第 60 行盖上「Verified Spec」徽章、第 156 行声称「已自动对齐生产级无障碍规范与 Tailwind 4.0 语法」、第 38 行写入不存在的域名 `https://vislexicon.dev`；并且 context/04 第 99 行明文规定图鉴"不出包"。这是全仓最应该立刻删掉的文件。 |
| `data/curated-sites.js`（190 行） | 第二份未复核站点表，与已复核 v3 在归属、规模、许可上直接冲突，且它就渲染在同一屏的上半部。 |
| `src/index.js` 的 `CURATED_SITES` + `LIBRARIES`（第 13–170 行） | 6 张 Unsplash 陌生人照片被当作 Dillion Verma 等真实作者的头像（第 18/42/66/90/114/138），外加 `heroSpec` 用 CSS 渐变伪造站点预览图，而文件头第 4 行还写着「所有 site / repo / install 均为已验证的真实地址」。 |
| `data/curation-taxonomy-v2-legacy.js`（145 行） | 旧 7 类已被 v3 明确取代，留着只会让人以为还有人在用。 |
| Tools.jsx:454–465 的「JSON API」与「llms.txt」两张协议卡 | `public/` 下既无 `lexicon/` 目录也无 `llms.txt`，而卡片区标题写着「全部为真实可用的开放协议与端点」、卡内写着「点开即验证」。 |
| `public/shots/*/01.png|02.png|03.png`（18 个文件） | 与 `v2-identity/breadth/proof` 重复，是首页同一个站展示两遍的物理原因。 |
| App.css:672–1075「100% 像素级复刻 Oreo Design」段 + 2168–2341「图鉴 wiki 形态」段 | 前者是不该留在版本库里的复刻声明，后者服务于已删除的组件。 |
| SiteCatalog.jsx:107 的 `'5,000+'` 占位符 | 硬编码假数字，比展示 8,684 更严重，因为它连来源都没有。 |
| SiteCatalog.jsx:226–276 的五个下拉 | 它们让 12 条内容需要 5 个筛选器，是"数据库前台"最直接的形态。 |
| `store.js:10` 的 `theme` 字段与 App.css 全部 `html[data-theme='dark']` 规则（若不打算做暗色） | 没有任何代码设置这个属性，几百行暗色 CSS 永远不会生效；要么接上开关 + `prefers-color-scheme`，要么删干净。 |
| `lib/endpoints.js` | 4 行，返回一个 404 路径，零导入方。 |

---

## F. 与 v2 评审的对照

### F.1 v2 每条主要结论距离代码现状有多远

| v2 结论 | 代码现状 | 距离 |
|---|---|---|
| §0.1 7 大类 / 59 小类整体废弃 | 后台换成了 13 类 / 57 小类（`data/curation-taxonomy.js`，且 v3 文档第 8 行已声明它只承担后台职责）；**旧的 7 类文件仍在树里**（`curation-taxonomy-v2-legacy.js`）；前台仍然是分类下拉（SiteCatalog.jsx:229–245） | **未落地**。类目数从 7/59 变成 13/57，前台一步没退。 |
| §0.2 后台用切面、前台用任务路径、分类只在二级筛选 | 切面确实存在于 v3（12 轴，`magic-ui.json:38–88`），但投影把它压平成一个 `tags` 袋子；**任务路径在代码里零实现**；分类不是二级筛选，是一级下拉 | **半落地**：切面建好了又被压扁；任务路径完全没有。 |
| §0.3 先定语料规模，8,684 只做内部用 | 页面上仍然是最大的数字（`catalog-390x844.png` 的「3,229」、SiteCatalog.jsx:190–200 的「5,000+ / 条候选」）；README 与截图与代码三个数字互不相同 | **未落地，且退化**：多了一个硬编码假数。 |
| §0.4-a 砍公开候选目录与一切大数字 | SiteCatalog 仍嵌在首页（IndexView.jsx:204） | 未落地 |
| §0.4-b 砍分类树导航 + 全局价值分 + 多下拉 + 首页进度竖轴 | 全局价值分**已删**（v3 §8 明确删除 baseScore，代码里 grep 无命中）；首页进度竖轴**不存在**；多下拉**还在**；分类导航**还在** | **一半落地**——落地的那一半是删掉分数，这是唯一一条真正执行了的建议。 |
| §0.4-c 砍 v1 的自然语言首页与 URL 分析工作台 | 两者都没建 | 落地（靠没做） |
| §0.5 智能感 = 系统显示它已替你做过功课 | v3 里的功课（selectionRationale / facts.evidence / reasons / checkedAt / 双人复核）**在投影层被全部丢弃**，前台一条都不展示 | **反向落地**：功课做了，然后在渲染前被删掉了。这是全报告里最讽刺的一处。 |
| §3.3 v1 只留策展 + 词典，工具降级，提交降为页脚查重框，新增关于/进度页 | 仍是 4 频道（App.jsx:19–24）；无关于页；提交仍是独立频道且查重恒 404 | 未落地 |
| §4.5 逛（任务货架）/ 找（按切面分组）/ 缩（结果页才出筛选） | 货架 0；搜索结果不分组（SiteCatalog 平铺分页）；筛选在首屏 | 未落地 |
| §5 首页线框（承诺句 + 本周入库 + 2 条路径 + 深读 + 全部站点） | 首页是"标题 + 5 个筛选 + 卡片墙 + 候选目录" | 未落地 |
| §6.1 统一内容标准 ≠ 统一卡片形状，三种模板 | 只有一种三图模板，且它套在所有条目上 | 未落地 |
| §6.2 卡片最少四样：媒体 + 名称 + 一句"拿走什么" + 权利/价格微标 | 卡上有 9–11 个 chip，**没有那句话**（数据模型里也没有这个字段） | 未落地 |
| §6.3 默认浮窗 + ⌘/中键整卡直接外跳 | 浮窗有；**外跳结构上不可能**——卡片是 `<button>`（IndexView.jsx:126），且浮窗没有 URL | 未落地 |
| §6.4 浮窗按"判断 → 三个关键位置 → 拿走什么 + 权利 → 相关词条 → 折叠档案"排 | 实际顺序：名称 → 域名 → 三图 → 描述 → 作者/源码/定价 `<dl>` → 标签 → 访问源站（SiteDetailModal.jsx:102–171）。**判断没有、三页链接没有、相关词条没有、档案没折叠** | 未落地 |
| §7 核验时顺手标 2–3 个词条，做站 ↔ 词条双向链 | 站 → 词条：0；词条 → 站：靠域名反查，且点击后跳回首页顶部（Atlas.jsx:550） | 基本未落地 |
| §7 419 图鉴候选只做内部 backlog | 候选**就是**图鉴主体（219/220），且前台不标 candidate | 反向 |
| §10 阶段一每条目稳定 JSON 端点 | 端点不存在，但 Tools 页和 Entry 页都在展示端点 URL 并让用户复制 curl | **反向落地**：没有端点，却有端点的 UI。 |

一句话总结：**v2 提了大约 20 条可执行结论，代码里真正落地的是 1 条（删除全局价值分）**，另有 2 条靠"没有开工"而未违反。同时出现了 2 条反向落地（假端点 UI、投影丢弃证据）。

### F.2 v2 哪几条本身值得质疑

**质疑一（最重要）：v2 对图鉴的判断建立在错误的库存上，必须整体推翻。**
v2 §3.3 写「词典保留，62 个真词条撑得起一个频道」、「工具降级，撑不起顶栏一席」。但 v2 自己在开头声明只读了两份文档、没读代码、没看截图。事实是：代码里存在 **9 个手写可交互舞台**、170 个术语认领、三种挂载槽位（variant / hotspot / param）、跨台互引、构建期契约校验，并且据 context/04 有 435 项测试与 57 项真实浏览器断言。这是整个仓库里**唯一一处别人无法用一周复制的东西**，也是唯一一处"人和 Agent 都用得上"的具体形态。v2 把它当成"62 个词条"来处置，等于建议把最有价值的资产降级。任何以 v2 §3.3 为基础的频道方案都必须重做。

**质疑二：v2 §4.1「数据模型里删掉主分类字段本身」找错了病灶。**
代码事实（D.3）：`primaryCategory` 在前台有 **0 处**依赖，只活在三个**当前不可达**的后台校验模块里。删不删，用户一秒都感觉不到。而真正制造数据库味的三样东西——五个下拉、压平的 `tags`、浮窗里的字段 `<dl>`——v2 一样都没点名到字段级。更糟的是，删掉主分类会连带废掉 `isPublishableClassification` 里唯一一条实质性的准入规则（curation-taxonomy.js:711–715，单站类必须有三页证据 + 人工理由 + 设计相关确认）。**正确的手术对象是 `entry.tags` 这一次压平，不是 `primaryCategory` 这个字段。**

**质疑三：v2 §2.2 的规模测算把"不可压缩量"算错了，而且它自己在 §6.1 已经反驳了自己。**
v2 说 8,684 → 5,000 个产品 × 20–40 分钟 = 2,000–3,000 小时，因此必须降目标。方向我同意，但算法有问题：v3 规格的 `entity → entry → unit` 分层意味着一次实体级判断可以摊到多个 entry（`entry-shadcn-studio-blocks.json` 就是 `entity-shadcn-studio` 下的一个 entry），Figma 一个实体做透之后，Figma Community 的边际成本远小于 20 分钟。真正贵的不是"分类"，是"选三页 + 写人话简介"。而 v2 §6.1 自己说了 B 型（自身即作品）的卡"给它塞三联图是荒谬的"——**既然如此，就该同时松开发布门禁里"必须三页证据"这条刚性契约**，而不是只改卡片长相、保留同样贵的采集契约。v2 提了卡片的三种模板，却没有相应提出证据契约的三种档位，这是它内部的不自洽。

**质疑四：v2 §5「搜索框放顶栏、不做 hero」在这个产品上不成立。**
v2 的理由是"大输入框是每个 AI 产品的模板动作"，这个观察对。但代码现状是：**顶栏根本没有搜索框**（App.jsx:65–121），而 `IndexView`（第 69–75）、`SiteCatalog`（第 217–223）、`Atlas` 左抽屉（第 369–372）、`Palette`（第 26–40）各有一个互不相通的搜索框，共四个。VisLexicon 有站点和术语两个语料，**跨语料检索恰恰是把四个频道变回一个产品的唯一现成机制**（用户搜「skeleton」应当同时得到骨架屏舞台和 Chakra/Mantine 站点条目）。把搜索缩成顶栏一个图标，等于放弃这条。真正要避免的是"你现在想做什么？"式的提问框，不是搜索本身。

**质疑五：v2 §6.3 讨论"浮窗 vs 外跳"时漏掉了一个前提。**
当前浮窗由 `useState` 驱动、没有 URL（B.7）。在详情连自己的地址都没有之前，讨论"默认浮窗还是默认外跳"是空的：无论选哪个，用户都无法分享一个条目、Agent 都无法引用一个条目、后退键都会把人踢出页面。**先给详情一条路由**，再谈默认行为。

**质疑六：v2 §8「深读每周一篇」在当前阶段是净负债。**
在没有一条 JSON 端点、没有一个真实用户、核验语料只有 12 条的阶段引入周更栏目，是把编辑成本叠加到已经做不完的核验成本上。v2 自己在 §2.2 算过这笔账，却在 §8 又加了一项周更承诺。这两节应当合并，结论是：**第二阶段之前不要有任何"周更"承诺**。

**质疑七（对 v2 的一条补充，不是反驳）：v2 说"砍掉一切大数字"，但代码暴露的问题比这更深一层。**
`SiteCatalog.jsx:107` 的 `displayedTotal = status === 'ready' ? total : '5,000+'` 说明问题不是"要不要展示数字"，而是"数字从哪里来"。一个在加载前显示 5,000+、加载后显示 12 的组件，比诚实地展示 8,684 严重得多——它是**凭空写下的**。所以规则应当是：**页面上任何数字必须由当前已加载的数据算出，不允许存在任何数字字面量**。这条比"砍掉大数字"更可执行，也更能防止同类问题复发。

---

## 附：本次审计里最该先修的五件事（不是路线图，是止血）

1. 删掉 `CodeExportModal.jsx` 与 Tools.jsx:454–465 的两张假端点卡；删掉 `index.js` 的 Unsplash 头像；把 `SiteCatalog.jsx:107` 的 `'5,000+'` 改成不显示。——这四处是"不得虚构"硬约束的正面违反，与设计方向无关，今天就能改。
2. 删掉 `data/curated-sites.js`，首页 6 张卡改用同一份 v3 投影。——同一屏内自相矛盾的产品说明，比任何布局问题都更伤信任。
3. 修 `lib/curated-resources.js` 的兜底分支：术语命中不到就**不显示**这个区块，而不是塞四个色彩工具。——三张截图公开证明了这个 bug。
4. 给 `SiteDetailModal` 装上已经写好的 `useModalFocus`，给图鉴抽屉的 `.closed` 状态加 `inert`。——零件都在，装配是十几行。
5. 把 `Atlas.jsx:43–44` 的两个抽屉默认值改成"右栏默认开"。——一行改动，把"看不懂这是什么"变成"至少知道这个东西叫什么"。
