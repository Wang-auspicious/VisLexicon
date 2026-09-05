# Refero Styles × web-to-design-md：面向 VisLexicon 的产品研究（只读）

- 研究日期：2026-09-01（Asia/Shanghai）
- 研究范围：Refero Styles、Refero 官方法律页面、`Paidax01/web-to-design-md` 官方 GitHub 仓库、VisLexicon 当前三图证据合同
- 本轮产物：产品研究与未来切面，不改实现、数据、截图或发布合同
- 证据口径：优先真实浏览器中的公开页面、公开 HTTP 响应、官方条款、GitHub README/源码/仓库 API；搜索与 Jina Reader 只用于定位或交叉读取，不把搜索摘要当证据

## 0. 读法与结论

本文使用三个标签：

- **事实**：2026-09-01 在公开页面、真实浏览器 DOM/媒体状态、HTTP 响应或官方源码中直接观察到。
- **推断**：由多个事实归纳出的产品或技术判断；不是 Refero 或仓库作者的公开承诺。
- **建议**：给 VisLexicon 的未来产品设计；本轮不实施。

核心结论：

1. **事实**：Refero Styles 的优秀之处不是单一“视频卡片”，而是“很快看懂氛围 → 逐层落到可执行规则 → 多格式带走”的连续体验。首页用海报/短视频建立直觉，详情页再把颜色、字体、间距、组件、Do/Don't 和 Agent Prompt Guide 分层展开，并提供 DESIGN.md、Tailwind v4、CSS Variables、Design Tokens 导出。[Refero Styles 首页](https://styles.refero.design/) · [Apple 风格详情](https://styles.refero.design/style/aecac5da-f397-4ddf-b71f-de1efc434cb8)
2. **事实**：卡片媒体采用 `poster + muted + playsinline + preload="none"`；进入视口才加载/播放，离开视口暂停。HTML 的 `loop` 为 `false`，但实际播放到结尾会被页面脚本重置继续播放。因此“循环”是行为事实，具体脚本机制是推断。[首页](https://styles.refero.design/) · [样本 MP4](https://images.refero.design/styles/refero.design/video/1f887521-04e4-41f5-ba4f-ef578bd2940b.mp4)
3. **事实**：Refero 的公开条款允许把所学洞察用于正常设计和产品改进，但明确限制批量抓取、再分发、建立竞争数据集、模型训练/评测等用途；第三方截图、Logo、商标仍归各自权利人。[Terms of Use，第 10、13、15 节](https://doc.refero.design/legal/terms-of-use) · [Copyright Policy](https://doc.refero.design/legal/copyright-policy)
4. **事实**：精确仓库是 [`Paidax01/web-to-design-md`](https://github.com/Paidax01/web-to-design-md)，当前远端 `main/HEAD` 为单一提交 [`8a08b3e8339bff21da059c6fb84380cb996e3fbf`](https://github.com/Paidax01/web-to-design-md/commit/8a08b3e8339bff21da059c6fb84380cb996e3fbf)。仓库没有 LICENSE；README 还明确写着公开发布前应选择并添加许可证，因此当前不能按开源代码直接复制进 VisLexicon。[README Publishing Notes](https://github.com/Paidax01/web-to-design-md/blob/8a08b3e8339bff21da059c6fb84380cb996e3fbf/README.md#L72-L74)
5. **建议**：VisLexicon 应把动态预览作为 `inspiration-collection` 的可选第四类媒体能力，而不是第四张“证据图”，更不能替代 `identity / breadth / proof` 三图合同。
6. **建议**：未来的“网页拉进来 → 提示词 / Design MD”工具，应以**证据可回看、推断可纠错、语言分层、目标媒介/Agent 可切换、版权状态可见**为差异点，而不是只生成一份看似权威的长文。

## 1. 研究方法与访问边界

### 1.1 实际使用的证据通道

- Agent Reach 体检确认：网页通道的有效后端为 Jina Reader；GitHub CLI 可执行但 Doctor 未实时确认认证。最终 GitHub 身份由本地克隆、`git ls-remote` 和 GitHub REST API 三者核对。
- Refero 动态交互由 Codex 应用内真实浏览器核验，读取公开 DOM、可访问媒体状态和 UI 控件；没有保存或修改截图，也没有下载媒体文件。
- 静态正文和法律页用 Jina Reader 交叉读取；robots、HTTP 头和 GitHub 数据直接访问一手 URL。

### 1.2 访问限制

- `web-access` 安装中，文档要求的 `scripts/check-deps.sh` 在 `C:\Users\zjz65\.agents\skills\web-access\` 与 `C:\Users\zjz65\.Codex\skills\web-access\` 均不存在；Windows 的 `bash` 又指向当前不可用的 WSL/Docker Desktop VHD。故未能按该 skill 的 CDP Proxy 前检运行，改用已验证可工作的应用内真实浏览器。
- 浏览器只读 Playwright 沙箱不暴露页面 `performance` 对象，所以没有用 Resource Timing 推断网络策略；媒体加载结论来自 HTMLMediaElement 状态、滚动前后状态和公开 HTTP 头。
- GitHub GraphQL `repo view` 一次返回 EOF；GitHub REST API、Issues API 与 `git ls-remote` 成功，因此仓库结论不依赖那次失败。
- Refero Styles 是 Beta 且内容持续变化；卡片顺序、推荐 chips 和样本媒体是 2026-09-01 的时间截面，不应固化成永久分类表。[首页](https://styles.refero.design/)

## 2. Refero Styles：真实产品结构

### 2.1 信息架构

| 层级 | 事实 | 证据 |
| --- | --- | --- |
| 品牌入口 | 顶部是 `Open Refero / Styles` 面包屑，页面标记 Beta。 | [首页](https://styles.refero.design/) |
| 定位 | H1 为 “High-quality DESIGN.md examples for AI agents”，说明文字主张 2,000+ AI-readable design systems，并点名 Cursor、Claude Code、Codex、v0、Lovable。 | [首页](https://styles.refero.design/) |
| 搜索 | 搜索框提示可按 brand、style、color、font、category 搜索；空输入时 Search 禁用。 | [首页](https://styles.refero.design/) |
| 快捷筛选 | 搜索框下方出现 8 个可按压 chips；具体文案会随页面状态/重载变化。实际见过 `Neo Brutal`、`Analog Editorial`、`High Contrast`、`Glassy`，也见过 `Spacious Minimal`、`Clean SaaS`、`Utilitarian`、`Neon` 等。 | [首页](https://styles.refero.design/) |
| 相关资源 | 三个固定入口：`DESIGN.md examples`、`AI design resources`、`Design prompts`。 | [首页](https://styles.refero.design/) |
| 默认浏览 | 未搜索时提供 `Trending / Popular / Newest` 三个排序 tab。 | [首页](https://styles.refero.design/) · [Popular](https://styles.refero.design/?sort=popular) |
| 内容流 | 桌面 1280px 宽度观察为三列卡片流；卡片包含品牌/站点名、压缩成一句的风格描述、图像或视频海报、favicon/Logo，并整卡进入 `/style/{uuid}`。列表中穿插 Refero MCP 横幅。 | [首页](https://styles.refero.design/) |
| 详情 | 面包屑、名称、短风格句、叙述性总览、原站 URL、预览、Tokens/组件/指南、相似项、导出区。 | [Apple 详情](https://styles.refero.design/style/aecac5da-f397-4ddf-b71f-de1efc434cb8) |

**推断**：首页并不是传统“固定分类树”。chips 更像可读的查询种子：点击 `Spacious Minimal` 后，URL 变为 `?q=spacious+minimalism`、输入框也出现该查询，默认排序 tabs 消失；因此不应把当前 8 个 chips 当成 Refero 的完整 taxonomy。[筛选结果](https://styles.refero.design/?q=spacious+minimalism)

### 2.2 搜索、筛选和排序

- **事实**：提交 `Linear` 后 URL 为 [`?q=Linear`](https://styles.refero.design/?q=Linear)，首项是 Linear，但后续还出现 Lazy、Literal、Parallel Web Systems、Ordinal 等，不是精确品牌匹配。
- **推断**：搜索至少是宽松匹配或带相关性扩展；公开页面没有说明算法，不能进一步宣称使用“语义搜索”。
- **事实**：点击 Popular 后 URL 为 [`?sort=popular`](https://styles.refero.design/?sort=popular)，`aria-selected` 从 Trending 切到 Popular，首批卡片也发生改变。
- **事实**：chips 有 `aria-pressed`，排序用 tab/`aria-selected`；这是可访问状态语义上做得好的细节。[首页](https://styles.refero.design/)
- **推断**：动态 chips 让非专家更容易从“我想要宽松、霓虹、编辑感”进入，但分类稳定性与可复现性较弱；VisLexicon 应保留稳定 taxonomy，同时把这些自然语言 chips 作为查询别名层。

### 2.3 卡片短视频/循环展示与加载策略

真实浏览器在 1280×720、DPR 2 下观察到：

| 观察项 | 事实 | 性质/限制 |
| --- | --- | --- |
| 初始 DOM | 首页初始有 6 个 `<video>`；均带 `poster`、`muted`、`playsinline`、`preload="none"`，无 controls。 | 页面事实；样本数量会变化。[首页](https://styles.refero.design/) |
| 首屏成本 | 视频元素在首屏下方时 `readyState=0`、无缓冲；海报可见。 | 行为事实。 |
| 进入视口 | 滚动到卡片后视频开始加载并播放；取样的三个片段时长为 15.316667s、6.566667s、25.05s，分辨率均为 1200×750。 | 行为事实；说明 Refero 并不统一为 5–8 秒。 |
| 循环 | `video.loop === false`，但取样看到 15.20s→2.03s、6.56s→0s、24.29s→1.25s 的回绕，且保持播放。 | “行为循环”是事实；由页面脚本监听结束并重播是合理推断，未精读其私有 minified bundle。 |
| 离开视口 | 视频离开视口后 `paused=true` 且 currentTime 不再前进；进入视口的下一行才播放。 | 行为事实，表明有视口感知播放控制。 |
| 动效降级 | 页面 CSS 含 `@media (prefers-reduced-motion: reduce)`，把全局 transition/animation duration 压到 0.01ms。 | CSS 事实；未证明 HTML 视频会因此停播。[首页](https://styles.refero.design/) |
| 媒体传输 | 一个样本 MP4 为 1,427,630 bytes，`video/mp4`、`Accept-Ranges: bytes`、`Cache-Control: public, max-age=31536000, immutable`，由 S3/CloudFront 提供；对应 poster 为 36,802 bytes JPEG，采用同样长期 immutable 缓存。 | 2026-09-01 HEAD 响应事实。[MP4](https://images.refero.design/styles/refero.design/video/1f887521-04e4-41f5-ba4f-ef578bd2940b.mp4) · [poster](https://images.refero.design/styles/refero.design/image/db890fdc-1c11-4b3e-8775-038a56523506.jpg) |

**推断**：这里的“几秒就懂”主要来自海报立即建立上下文、进入视口即播放、片段结束自动回绕，以及卡片文案极短；不是所有素材本身只有几秒。

### 2.4 详情页如何拆 prompt / DESIGN.md

以公开的 [Apple 风格详情](https://styles.refero.design/style/aecac5da-f397-4ddf-b71f-de1efc434cb8) 为样本，页面把同一设计系统分成四层语言：

1. **感性入口**：品牌名 + 一句可记忆的风格隐喻，例如 “white room with a single blue switch”。
2. **叙述性解释**：一段自然语言说明克制、留白、颜色职责、排版、产品摄影和段落节奏。
3. **结构化设计规则**：
   - Color Palette：Brand / Neutrals，每色含命名、HEX、角色说明和单项 Copy。
   - Typography：type scale、基础字号、字号/字重/行高/字距、font role/fallback；可 `Show all 12 steps`。
   - Spacing & Shape：density、base unit、max width、section/card/element gap、radius、shadow。
   - Guidelines：逐条 Do / Don't。
4. **Agent/实现层**：导出的 Extended DESIGN.md 进一步包含 Tokens、Components、Surfaces、Imagery、Layout、Agent Prompt Guide、Elevation Philosophy、Similar Brands、Quick Start（CSS Custom Properties 与 Tailwind v4）。

**事实**：当前 Apple Extended DESIGN.md 在页面 DOM 中约 19,244 字符；Compact 约 11,034 字符。Compact 仍保留 Colors、Typography、Spacing & Layout、Components、Do/Don't、Surfaces、Imagery、Layout、Similar Brands，只减少 token/Quick Start 等实现细节。[Apple 详情](https://styles.refero.design/style/aecac5da-f397-4ddf-b71f-de1efc434cb8)

**推断**：真正值得借鉴的是“先给普通人一句话，再允许技术读者一路钻到 token”的渐进披露，而不是照搬其长文结构或修辞。

### 2.5 复制与导出体验

- **事实**：详情页有 Preview / DESIGN.md / Tailwind v4 / CSS Variables / Design Tokens 视图；DESIGN.md 又有 Compact / Extended。[Apple 详情](https://styles.refero.design/style/aecac5da-f397-4ddf-b71f-de1efc434cb8)
- **事实**：每个颜色旁有 Copy；导出区有整体 Copy、按当前格式下载和 `Connect via MCP`。
- **事实**：下载扩展名会随格式切换：DESIGN.md → `.md`，Tailwind/CSS → `.css`，Design Tokens → `.json`。
- **事实**：Design Tokens JSON 使用 `$value / $type / $description`；Compact 顶层有 `color`、`font`、`$extensions`，Extended 顶层再增加 `typography`、`spacing`、`radius`、`shadow`、`surface`。`$extensions.com.refero.extraction` 记录 `url`、`siteName`、`extractedAt`、`variant`。[Apple 详情](https://styles.refero.design/style/aecac5da-f397-4ddf-b71f-de1efc434cb8)
- **局限事实**：该详情给出原站 URL 和整体 extraction metadata，但在当前公开页面中，没有看到每条色彩、布局或组件判断分别关联到具体页面、DOM selector 或画面区域。

**推断**：Refero 的导出“拿走即用”很强，但对需要审计或纠错的人，最终规则与原始证据之间仍有距离。这正是 VisLexicon 可以更人性化的切入口。

## 3. Refero 内容、视频与截图：能借鉴什么，不能搬什么

### 3.1 官方边界

Refero 的 [Terms of Use（2026-08-03 更新）](https://doc.refero.design/legal/terms-of-use) 对本项目最相关的是：

- **事实**：Refero Content 包括截图、metadata、tags、descriptions、flows、站点/应用信息及 Refero 选择、组织、生成或展示的其他内容。
- **事实**：这些内容可通过服务用于合法的设计研究、灵感、内部参考和普通产品设计工作。
- **事实**：未获明确许可时，不得再销售、再分发、再许可或商业聚合；不得用 scraping/crawling/automation/systematic extraction 在文档化下载能力之外复制；不得用于模型训练、微调、评测或数据集；不得移除 attribution/source context。
- **事实**：条款明确允许把从 Refero 学到的洞察用于研究、设计、构建和改进自己的产品，但不允许把 Refero 内容抽取、再发布、转售或变成竞争数据集/仓库/AI 资产。
- **事实**：MCP/API 的普通 self-service 使用限于内部设计研究和正常产品设计；面向客户的产品集成、高量自动化、再分发或数据服务需要单独 business plan/order form/书面协议。
- **事实**：Refero 及其 licensors 拥有 Service 的软件、设计、interfaces、databases、search systems、organization、metadata、原创内容等；第三方内容除外。

[Copyright Policy](https://doc.refero.design/legal/copyright-policy) 进一步说明：站内第三方截图、Logo、商标、产品名仍归各自权利人，Refero 收录不代表背书、赞助或关联；权利人可请求移除/纠正或走 DMCA。

### 3.2 robots 不是许可证

- **事实**：[Styles robots.txt](https://styles.refero.design/robots.txt) 对 Anthropic/Claude/GPTBot 等列名 AI bots 禁止全站，对通用 `*` 允许公开页面但禁止 `/api/`、`/admin/`、`/extract/`、`/playground/`；并列出公开 sitemaps。
- **事实**：[Refero 主站 robots.txt](https://refero.design/robots.txt) 对通用 crawler 无禁止，但单独禁止 GPTBot。
- **判断**：robots 只表达爬虫访问偏好，不授予版权、再分发或产品集成权。即使公开资源带长期缓存，也不等于可复制许可。

### 3.3 VisLexicon 的安全边界

| 可以做 | 不应做（除非取得明确书面许可） |
| --- | --- |
| 借鉴“poster → 视口播放 → 分层拆解 → 多格式导出”的交互逻辑，自行设计 UI 和代码。 | 下载、热链或重新托管 Refero 的 MP4、poster、截图、Logo、描述或完整 DESIGN.md 作为 VisLexicon 内容库。 |
| 用自己的目标站证据生成自己的分析；保留 source URL、时间、rights 状态和用户纠错。 | 批量抓取 Refero Styles、sitemap、MCP/API 来建立竞争索引、训练/评测数据集或离线镜像。 |
| 用短摘要说明对 Refero 产品的研究结论并链接一手页面。 | 复制 Refero 的品牌语言、页面视觉、风格命名、具体提示词段落或 UI 代码，造成近似复刻。 |
| 在未持久化第三方媒体的本地/临时会话中分析用户明确输入的公开 URL。 | 把“公开可访问”“robots allow”“CloudFront immutable”误写成“可商用/可再分发”。 |

**建议**：VisLexicon 动态预览的公开发布默认只接受三类来源：站点/作者明确提交并授权；存在可核验的可再分发许可证；项目自有内容。对仅可公开浏览但许可不清的站点，默认只保存 URL、分析文本和权利状态，动态媒体保持本地临时或不发布。

## 4. `web-to-design-md` 官方仓库精读

### 4.1 精确身份与状态

| 项 | 事实 |
| --- | --- |
| 官方仓库 | [`Paidax01/web-to-design-md`](https://github.com/Paidax01/web-to-design-md)；本地 `references/web-to-design-md/.git/config` 的 origin 与之相同。 |
| 远端 HEAD | [`8a08b3e8339bff21da059c6fb84380cb996e3fbf`](https://github.com/Paidax01/web-to-design-md/commit/8a08b3e8339bff21da059c6fb84380cb996e3fbf)，提交信息 `Initial website-to-design-md skill`，2026-04-18。2026-09-01 的 `git ls-remote` 与 GitHub REST commits 均返回该 SHA。 |
| 仓库描述 | `Convert any official website to design.md document`。[仓库主页](https://github.com/Paidax01/web-to-design-md) |
| 规模状态 | 一个提交；GitHub Issues API 返回 0，公开 [Issues 页](https://github.com/Paidax01/web-to-design-md/issues) 无 issue。这个状态会变化，只代表研究日期。 |
| License | 仓库树无 LICENSE/COPYING，GitHub license metadata 为 null；README 明确要求发布前再添加许可证。[README L72-L74](https://github.com/Paidax01/web-to-design-md/blob/8a08b3e8339bff21da059c6fb84380cb996e3fbf/README.md#L72-L74) |

**结论**：公开可读不等于开源授权。当前可以研究其接口和产品思路，但不能直接复制、修改或分发其代码/模板。若未来确需复用，先让作者添加明确许可证或取得书面许可；否则做 clean-room 独立实现。

### 4.2 输入、输出与工作方式

#### Skill 层

- **事实**：输入是一个或多个网站 URL；目标是由 agent 使用 `agent-browser open/wait/eval` 读取渲染 DOM、computed styles、CSS variables、可读 stylesheet rules、文本和交互状态，再综合出 DESIGN.md 与同名 HTML preview。[SKILL Browser Rule / Working Style](https://github.com/Paidax01/web-to-design-md/blob/8a08b3e8339bff21da059c6fb84380cb996e3fbf/SKILL.md#L16-L38)
- **事实**：多 URL 时要求先独立观察，只有视觉语言确实一致才综合。[SKILL Preflight](https://github.com/Paidax01/web-to-design-md/blob/8a08b3e8339bff21da059c6fb84380cb996e3fbf/SKILL.md#L41-L51)
- **事实**：默认输出 `DESIGN.md` 与 sibling `DESIGN-preview.html`；README 对外只承诺 markdown + preview HTML。[README](https://github.com/Paidax01/web-to-design-md/blob/8a08b3e8339bff21da059c6fb84380cb996e3fbf/README.md#L3-L12) · [README output](https://github.com/Paidax01/web-to-design-md/blob/8a08b3e8339bff21da059c6fb84380cb996e3fbf/README.md#L59-L70)
- **事实**：要求事实/推断分开，截图只作可选交叉验证，不是默认数据源。[SKILL](https://github.com/Paidax01/web-to-design-md/blob/8a08b3e8339bff21da059c6fb84380cb996e3fbf/SKILL.md#L27-L38)

#### 证据提取脚本

`scripts/extract-browser-evidence.mjs` 的命令接口是：

```text
node scripts/extract-browser-evidence.mjs <url> [outPath]
```

未给 `outPath` 时写入操作系统临时目录。入口定义见[源码 L10-L25](https://github.com/Paidax01/web-to-design-md/blob/8a08b3e8339bff21da059c6fb84380cb996e3fbf/scripts/extract-browser-evidence.mjs#L10-L25)。

实际 evidence JSON 结构可概括为：

```json
{
  "extractedAt": "ISO-8601",
  "url": "input URL",
  "pages": {
    "desktop": {
      "title": "...",
      "url": "...",
      "viewport": { "width": 0, "height": 0 },
      "root": {},
      "body": {},
      "nav": {},
      "footer": {},
      "heroHeading": {},
      "heroContainer": {},
      "headings": [],
      "buttons": [],
      "cards": [],
      "sections": [],
      "fonts": [],
      "colors": [],
      "textSnippets": [],
      "dom": {
        "htmlLang": "...",
        "bodyClass": "...",
        "bodyAttributes": {},
        "rootVariables": {},
        "bodyVariables": {},
        "inlineStyles": [],
        "styleSheets": [],
        "headHtml": "...",
        "bodyHtmlStart": "...",
        "mainHtml": "...",
        "keyNodes": { "header": [], "headings": [], "buttons": [], "cards": [] }
      },
      "documentHeight": 0,
      "imageCount": 0,
      "meta": { "finalUrl": "...", "contentLength": 0 }
    }
  },
  "interactions": {},
  "tooling": {
    "selectedTool": "agent-browser-eval",
    "browserPath": "...",
    "sessionId": "...",
    "preferredOrder": ["agent-browser-eval"],
    "fallbackNotes": []
  }
}
```

来源是[style probe 返回字段](https://github.com/Paidax01/web-to-design-md/blob/8a08b3e8339bff21da059c6fb84380cb996e3fbf/scripts/extract-browser-evidence.mjs#L31-L223)和[agent-browser 返回包装](https://github.com/Paidax01/web-to-design-md/blob/8a08b3e8339bff21da059c6fb84380cb996e3fbf/scripts/extract-browser-evidence.mjs#L355-L390)。

#### DESIGN.md 与 preview

- **事实**：`assets/DESIGN.template.md` 的主要章节是 Visual Theme、Color、Typography、Components、Layout、Depth、Do/Don't、Responsive、Agent Prompt Guide，另有 Interaction、Messaging、Observed Pages 附录。[模板](https://github.com/Paidax01/web-to-design-md/blob/8a08b3e8339bff21da059c6fb84380cb996e3fbf/assets/DESIGN.template.md)
- **事实**：`render-design-preview.mjs` 读取 markdown，按 heading/table/list 等启发式解析，再填固定 HTML shell；默认从 `design.md` 生成 `design-preview.html`。[renderer L6-L17](https://github.com/Paidax01/web-to-design-md/blob/8a08b3e8339bff21da059c6fb84380cb996e3fbf/scripts/render-design-preview.mjs#L6-L17)
- **事实**：preview shell 真正可切换的只有 Source / Preview，支持 Copy 与 Open `.md`。其顶部 `Design JSON / CSS Variables / Design Tokens` 是静态 `<span>` 标签，没有对应输出逻辑，不应误读成仓库支持这些导出。[preview shell](https://github.com/Paidax01/web-to-design-md/blob/8a08b3e8339bff21da059c6fb84380cb996e3fbf/assets/design-preview-shell.template.html)

### 4.3 依赖

- Node.js 标准库：`fs`、`path`、`os`、`child_process`、`module` 等。
- 外部关键依赖：`agent-browser` CLI。README 与 SKILL 都要求缺失时安装/暴露它，不应静默切 Playwright/Chrome。[README Requirements](https://github.com/Paidax01/web-to-design-md/blob/8a08b3e8339bff21da059c6fb84380cb996e3fbf/README.md#L34-L38)
- `check-browser-tooling.mjs` 用 `bash -lc "command -v …"` 检测 Node/npm/agent-browser；这会削弱原生 Windows 可移植性。[checker](https://github.com/Paidax01/web-to-design-md/blob/8a08b3e8339bff21da059c6fb84380cb996e3fbf/scripts/check-browser-tooling.mjs)
- 仓库没有 `package.json` 或 lockfile；renderer 使用内置模块，不提供版本固定、安装脚本或自动测试合同。[仓库树](https://github.com/Paidax01/web-to-design-md/tree/8a08b3e8339bff21da059c6fb84380cb996e3fbf)

### 4.4 可复用点与局限

| 模块/思想 | 可取之处 | 局限 | VisLexicon 处理 |
| --- | --- | --- | --- |
| evidence-first checklist | DOM、computed style、CSS variable、交互态优先，截图仅校验；事实/推断分离。 | 是 agent 操作规范，不是稳定 API。 | 吸收为产品原则；独立写 schema 与捕获器。 |
| style probe | 一次收集代表性节点、tokens、样式表、文案、区块。 | 大量 `slice` 截断；跨域 stylesheet 会 inaccessible；样本选择靠通用 selector。 | clean-room 重写，输出每条 evidence 的 ID、selector、state、confidence。 |
| evidence JSON | 有 final URL、viewport、DOM/tokens、tooling provenance。 | 当前 main 只产 `pages.desktop`，`interactions` 为空；schema 无版本号，也没有字段级 evidence linkage。 | 新建 versioned contract；把 desktop/mobile/state 变成明确数组。 |
| DESIGN.md template | 覆盖设计系统与 Agent Prompt Guide，容易给模型消费。 | Markdown 是叙述合同，不适合机器增量修改；renderer 对标题结构敏感。 | Markdown 只作派生导出，JSON 才是源数据。 |
| preview renderer | 把 Markdown 变成可扫视的 review board。 | 约 2,006 行自制解析/样式；格式 tabs 有展示性占位。 | 做更小的 schema-driven 预览，不解析任意 Markdown。 |
| browser abstraction | 真实渲染、滚动、hover 比静态抓取可靠。 | 强绑 `agent-browser`；原生 Windows checker 依赖 bash。 | 浏览器层做 adapter；捕获协议不绑定某个 CLI。 |

额外局限：

- **事实**：源码保留了 Chrome CDP 与 Playwright 的大段实现，但 `main()` 明确在缺少 `agent-browser` 时抛错，并只调用 `extractWithAgentBrowser`；这些 fallback 当前不可达。[main L862-L883](https://github.com/Paidax01/web-to-design-md/blob/8a08b3e8339bff21da059c6fb84380cb996e3fbf/scripts/extract-browser-evidence.mjs#L862-L883)
- **事实**：脚本顶部定义 desktop/mobile 两个 viewport，但 agent-browser 主路径只执行一次 desktop probe；SKILL 所要求的移动端、主题切换与交互检查需要 agent 手动完成，不由脚本合同保证。[viewport L23-L28](https://github.com/Paidax01/web-to-design-md/blob/8a08b3e8339bff21da059c6fb84380cb996e3fbf/scripts/extract-browser-evidence.mjs#L23-L28) · [agent path](https://github.com/Paidax01/web-to-design-md/blob/8a08b3e8339bff21da059c6fb84380cb996e3fbf/scripts/extract-browser-evidence.mjs#L355-L390)
- **事实**：没有 LICENSE、测试、release、issue 讨论或可声明稳定的 library API。
- **推断**：它更像“优秀的 agent skill / 研究原型”，不是可直接嵌入产品后端的成熟 SDK。

## 5. 与 VisLexicon 结合的后续产品切面

### 5.1 `inspiration-collection`：动态优秀参考

**建议的体验**：

- 卡片仍展示已核验的 1 大 + 2 小三图；大图区域在 hover/focus 或进入视口时可临时切为动态 preview，两个副图仍保留。
- 动态片段统一为 **5–8 秒**、无有意义音轨、`muted`、`playsInline`、可循环；这是一条 VisLexicon 预算规则，不是 Refero 的真实时长。
- 初始只加载 poster；`preload="none"`。IntersectionObserver 进入一屏预热区后再挂 `src`，真正可见时播放；离屏、tab hidden、卡片被覆盖时暂停。
- poster 必须是同一 clip 的稳定代表帧；视频失败时回退 poster，不让卡片空白。
- `prefers-reduced-motion: reduce` 时永不自动播放，只显示 poster 与显式“播放预览”按钮。
- 移动端默认 poster：只有 `saveData=false`、网络允许且当前卡片成为主焦点时才自动播放；始终提供 tap play/pause，不依赖 hover。
- 建议单 clip 目标不高于约 1 MB，稳定内容哈希文件名 + immutable 缓存；保留尺寸、时长、编码、bytes、sha256，发布器可做预算与重复校验。
- 只对 `resourceEssence === "inspiration-collection"` 且 rights 状态可发布的记录开放，其他类别不被动态化目标牵连。

**建议字段（额外媒体，不属于 `shots`）**：

```json
{
  "dynamicPreview": {
    "kind": "video",
    "src": "/previews/example/loop.mp4",
    "posterSrc": "/previews/example/poster.webp",
    "sourceUrl": "https://official.example/path",
    "durationMs": 7000,
    "width": 1200,
    "height": 750,
    "bytes": 850000,
    "sha256": "…",
    "muted": true,
    "loop": true,
    "playsInline": true,
    "reducedMotion": "poster",
    "capturedAt": "ISO-8601",
    "rights": {
      "status": "cleared",
      "basis": "publisher-submission | explicit-license | project-owned",
      "evidenceUrl": "https://…"
    }
  }
}
```

### 5.2 URL 输入 → 页面证据 → 拆解 → 可编辑 prompt → 导出

建议做成独立工作台，而不是卡片点击的强制中间层：

1. **输入**：粘贴 URL；选择分析范围（单页 / 同站 2–3 页）、目标设备、是否包含交互态。先显示 robots/登录/版权风险和可能发送的数据。
2. **页面证据**：记录 input/final URL、时间、viewport、DOM node/selector、computed value、CSS variable、可访问文本、媒体、交互 state。每条证据有稳定 `evidenceId`。
3. **视觉拆解**：生成颜色、排版、间距、布局、组件、动效、内容语气；每条 claim 标成 `observed / inferred / user-corrected`，并关联 `evidenceIds` 与 confidence。
4. **可编辑 prompt**：把分析拆成可开关 blocks；用户可以点“这条不对”、改值、锁定规则，再局部重生成。不要一改就重写全篇。
5. **目标适配**：选择媒介（网页 / 移动 App / 演示 / 海报 / 图像生成）与 Agent/技术栈（Codex、Claude Code、v0、Lovable、React/Tailwind、Flutter 等），输出不同粒度，而不是一份 prompt 到处用。
6. **导出**：以 versioned JSON 为源；派生 DESIGN.md Compact/Extended、prompt.txt、CSS Variables/Tailwind（仅在值有直接证据时）、evidence manifest。第三方媒体默认不打包。

建议的源 JSON 骨架：

```json
{
  "schemaVersion": 1,
  "source": {
    "inputUrl": "…",
    "finalUrl": "…",
    "capturedAt": "…",
    "access": { "robots": "allowed|blocked|unknown", "auth": "public|local-session" }
  },
  "captures": [
    { "id": "capture.desktop.default", "viewport": {}, "state": "default" }
  ],
  "evidence": [
    { "id": "ev-1", "captureId": "…", "type": "computed-style", "selector": "…", "property": "color", "value": "#…" }
  ],
  "claims": [
    { "id": "claim-1", "kind": "observed", "text": "…", "evidenceIds": ["ev-1"], "confidence": 1, "status": "accepted" }
  ],
  "designSystem": {},
  "promptProfiles": [],
  "rights": {}
}
```

### 5.3 比 Refero 更“人”的地方

| 需求 | 更人性化的设计 |
| --- | --- |
| 非设计用户 | 默认只显示“它给人的感觉 / 最值得学的 3 点 / 不要照抄的 2 点”，专业 tokens 放进第二层。 |
| 证据信任 | 每条判断旁有“来自哪里”按钮，定位到具体页面、画面区、DOM 属性；推断使用不同颜色，不伪装成测量值。 |
| 手动纠错 | 支持“值错了 / 证据选错 / 这只是偶发现象 / 不要用于 prompt”；修正后只重算依赖项。 |
| 分层语言 | 同一规则提供白话解释、设计术语、实现提示三种表述，可单独复制。 |
| 目标适配 | 先问“你要做网页、App、演示还是图像”，再给目标化 prompt；避免把 web breakpoint 规则硬塞给海报生成。 |
| Agent 适配 | 将事实层保持不变，只变格式、上下文长度与框架约束；用户能看见哪一层发生了变换。 |
| 版权安全 | 显示 rights badge、来源与可导出范围；品牌名、商标、受版权媒体默认不进入“可复用资产”；提供“抽象化风格”开关，移除可识别品牌复制指令。 |
| 隐私 | 登录态页面优先本地浏览器临时分析；默认去掉 URL 中 token/敏感 query；持久化前单独确认。 |

### 5.4 接入现有三图证据合同

当前 VisLexicon 规范明确要求三种互补页面：`identity`（首页/真实产品入口）、`breadth`（目录/能力总览/集合/工作流）、`proof`（组件/资产/案例/教程/操作详情），且技术 QA 要求恰好三张、角色不同、URL/哈希/尺寸完整。见本地 `docs/superpowers/specs/2026-09-01-unified-curation-evidence-pipeline-design.md` 第 229–261 行；测试 fixture 也把 `shots` 固定为三种角色。

因此未来必须满足：

- `dynamicPreview` 是 sibling optional field，**不进入** `pages[].shot` 或 public `shots` 数组。
- `evidenceBundleErrors()` 继续要求恰好 `identity / breadth / proof`；动态预览缺失或失败不能让已批准三图失效。
- public card renderer 只有在三图合同先通过、资源属于 `inspiration-collection`、rights 通过时才启用动态 preview。
- poster 可以视觉上与 identity 图接近，但不能把 poster 当 identity shot，也不能复用同一文件绕过三图唯一性。
- 详情里动态 preview 单独显示“Motion preview”，下方仍清楚展示三张证据的角色、source URL 与选择理由。
- 动态预览的 QA/rights 另行验证，不改变三图 `approvedTrio` 的不可变 revision 语义。

## 6. “现在记住”与“何时实施”

### 现在只记住

1. 学 Refero 的**信息节奏**，不搬它的内容、媒体、文案、品牌视觉或代码。
2. 动态 preview 是增强感知的可选媒体，不是证据替代品。
3. JSON 是事实源；DESIGN.md、prompt、Tailwind/CSS 是派生视图。
4. 每条分析必须能区分 observed / inferred / corrected，并能回到 evidence。
5. 公开 URL 不等于可再分发；rights、robots、ToS 和第三方权利必须进入产品流程。
6. `web-to-design-md` 当前无许可证，只能吸收思想或在获许可后复用；不要直接拷贝源码/模板。

### 何时实施

满足以下 gate 后再进入实现：

- 当前 unified curation foundation 与三图 evidence v2 发布合同稳定，避免同时改基础合同和动态媒体。
- 明确动态 preview 的 rights policy、存储/CDN、转码预算、QA 和删除/下架流程。
- URL 分析工作台先完成独立 schema 与本地证据原型，证明字段级引用和手动纠错可用。
- 对 `Paidax01/web-to-design-md` 获得明确许可证/许可，或完成 clean-room 设计记录并确认没有复制代码/模板。
- 安全评审覆盖 SSRF、私网 URL、重定向、认证内容、敏感 query、下载体积、恶意页面与 prompt injection。

### 建议拆成两个独立 spec

1. `docs/superpowers/specs/YYYY-MM-DD-inspiration-dynamic-preview-contract.md`
   - 只管 `inspiration-collection` 的 optional `dynamicPreview` schema、播放器状态机、poster/reduced-motion/mobile/save-data、预算、rights、QA、与三图合同兼容。
2. `docs/superpowers/specs/YYYY-MM-DD-web-evidence-to-design-md-workbench.md`
   - 只管 URL 输入、browser adapter、evidence/claim schema、编辑与纠错、prompt profiles、DESIGN.md/JSON/CSS 导出、版权/隐私/SSRF。

两者可以共享 evidence ID 和 rights vocabulary，但不要绑成一次大改：动态卡片可先使用已授权人工片段；网页分析工具也可以先只在本地工作台输出，不接公共策展。

## 7. 一手来源索引

### Refero

- [Refero Styles 首页](https://styles.refero.design/)
- [Popular 排序](https://styles.refero.design/?sort=popular)
- [Linear 搜索](https://styles.refero.design/?q=Linear)
- [Spacious Minimal 查询](https://styles.refero.design/?q=spacious+minimalism)
- [Apple 风格详情 / DESIGN.md 样本](https://styles.refero.design/style/aecac5da-f397-4ddf-b71f-de1efc434cb8)
- [Styles robots.txt](https://styles.refero.design/robots.txt)
- [Styles sitemap](https://styles.refero.design/sitemap.xml)
- [Refero 主站](https://refero.design/)
- [Refero Terms of Use](https://doc.refero.design/legal/terms-of-use)
- [Refero Copyright Policy](https://doc.refero.design/legal/copyright-policy)
- [Refero Privacy Policy](https://doc.refero.design/legal/privacy-policy)

### web-to-design-md

- [官方仓库](https://github.com/Paidax01/web-to-design-md)
- [固定提交 8a08b3e](https://github.com/Paidax01/web-to-design-md/tree/8a08b3e8339bff21da059c6fb84380cb996e3fbf)
- [README](https://github.com/Paidax01/web-to-design-md/blob/8a08b3e8339bff21da059c6fb84380cb996e3fbf/README.md)
- [SKILL.md](https://github.com/Paidax01/web-to-design-md/blob/8a08b3e8339bff21da059c6fb84380cb996e3fbf/SKILL.md)
- [extract-browser-evidence.mjs](https://github.com/Paidax01/web-to-design-md/blob/8a08b3e8339bff21da059c6fb84380cb996e3fbf/scripts/extract-browser-evidence.mjs)
- [render-design-preview.mjs](https://github.com/Paidax01/web-to-design-md/blob/8a08b3e8339bff21da059c6fb84380cb996e3fbf/scripts/render-design-preview.mjs)
- [DESIGN.template.md](https://github.com/Paidax01/web-to-design-md/blob/8a08b3e8339bff21da059c6fb84380cb996e3fbf/assets/DESIGN.template.md)
- [Issues](https://github.com/Paidax01/web-to-design-md/issues)

