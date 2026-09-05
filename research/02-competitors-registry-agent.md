# 组件注册表 + 面向 Agent 的设计资源生态：竞品与标准调研

调研执行日期：**2026-09-05**（下文所有「访问日期」若未单独注明，均为 2026-09-05）
调研方式：WebSearch + WebFetch 实际访问。本机 `curl` 直连被出网代理策略拒绝（CONNECT 403），因此所有原始 JSON 端点无法逐字取回，凡涉及具体字段的内容均标注了取证方式与可信度。

---

## 0. 结论先行

1. **「人页面 + Agent JSON 同一数据层」在组件领域已经是既成事实标准**：shadcn 的 `/r/{name}.json` + `registry.json` 索引 + MCP 七件套工具，已被 292 个第三方注册表采用（shoogle.dev/directory）。VisLexicon 不需要发明协议，只需要**复用路径约定**。
2. **VisLexicon 声称的差异化「有证据、有许可边界的结构化设计上下文，市面上没有」——这个判断在 2026 年 9 月已经不成立了一半。** Refero Styles（2,000+ 站的 AI-readable design system + 官方 MCP）、getdesign.md（550+ 站）、designmd.app（562 个）正在做「真实网站 → 机器可读设计上下文」。
3. **但另一半成立，而且是更硬的一半**：这些产品输出的是 *风格提取*（颜色/字号/间距/氛围），**没有一个把「作者、组织、许可证、价格、核验时间、每条断言的 sourceUrl + evidence + confidence」当成一等字段**。VisLexicon 的 `facts[]` 数组是真正稀缺的东西。差异点要重述为「可审计的许可与出处层」，而不是「结构化设计上下文」。
4. **DESIGN.md 已被 Google Labs 开源成规范**（google-labs-code/design.md，Apache-2.0，26.3k stars），YAML frontmatter + 8 个可选 Markdown 章节。VisLexicon 应该**输出 DESIGN.md，而不是发明自己的导出格式**。
5. **llms.txt 是本轮调研里唯一有硬负面证据的路径**：约 900 个域名 7 个月的日志里 1,227 次 `llms.txt` 请求，**前沿 AI 实验室爬虫为 0 次**。v1 可以顺手放一个（成本 20 分钟），但不能把它当 Agent 通道。
6. **MCP 在「设计工具」侧是主流（Figma / Webflow / zeroheight / Supernova / Refero / 21st / Magic UI），但 2026 年出现了明确的向 Skills 迁移的信号**：Framer 明说「不需要 MCP」，改用 `npx @framer/agent setup` + Skills + 本地工具；Vercel 把 skills.sh 做成 Agent Skills 目录（1,299,814 次安装）。
7. **对 VisLexicon 的 v1 建议**：只做两个静态 JSON 端点（`/r/registry.json` 索引 + `/r/{entryId}.json` 详情）+ 一个 `DESIGN.md` 导出。MCP、搜索 API、Skill 包全部推迟到有人真的引用之后。
8. 应该抄的两件事：shadcn 的 **URL 路径即协议**（无需注册、无需鉴权、CLI 天然可消费）；Refero MCP 的**五类工具切分**（Sites / Apps / Styles / Screens / Flows）——它证明了「同一份策展语料可以按用户意图切成多个工具」。
9. 不该抄的：21st.dev 的**每日复制次数限制**（把人页面变成漏斗，直接摧毁「同一数据层」）；Hover.dev 的**禁止再分发条款**（Agent 时代等于自我封印）。
10. 顺序判断与 v2 反馈一致：**人工核验语料先存在，JSON 端点几乎免费，MCP 推迟**。但 v2 说「MCP、llms.txt、导出格式属于第三阶段」需要修正——**DESIGN.md 导出应提到 v1**，因为它是目前唯一有 Google 规范背书、且能被任何 Agent 零成本消费的格式。

---

## 1. 调研方法与可信度声明

- 所有产品均通过 WebFetch 实际访问其官网/文档/GitHub 页面获取，不依赖记忆。
- WebFetch 返回的是「小模型对页面 markdown 的摘要」，因此**逐字 JSON schema 无法保证 100% 精确**。凡是我无法逐字取回的字段，下文标为「（摘要转述，未逐字核验）」。
- 直连 `curl` 被代理拒绝（`gateway answered 403 to CONNECT`，日志见 `$HTTPS_PROXY/__agentproxy/status`），因此 `https://ui.shadcn.com/r/button.json`、`https://magicui.design/r/*.json` 等原始注册表响应**未能取回原文**。
- **移动端行为整体未核验**。本次调研没有设备模拟或视口切换能力，凡涉及移动端的段落，只写「页面结构可推断的部分」并明确标注未核验。这是本份报告最大的缺口，Ben 若要移动端结论需要单独一轮带浏览器的调研。
- 数量类断言优先采用官方页面自述，并注明「站方自述」；第三方媒体数字单独标注。

---

## 2. 产品档案

### A 组 · 组件注册表（人页面 + Agent 接口都成型的）

#### A1. shadcn/ui registry + shadcn MCP —— 事实标准，必须逐字理解

**定位**：不是组件库，是**分发协议**。官方原话是让你「distribute your custom components, hooks, pages, config, rules and other files to any project」（https://ui.shadcn.com/docs/directory ，2026-09-05）。

**给 Agent 的接口具体长什么样**——这是全篇最值得抄的部分。

*路径约定即协议*（https://ui.shadcn.com/docs/registry/api-reference ，2026-09-05）：

| 路径 | 返回 |
|---|---|
| `/r/registry.json` | 注册表索引：条目的 name / URL / homepage 数组 |
| `/r/{registry-name}.json` | 某命名空间的扁平目录（索引态，不含文件正文） |
| `/r/{item-name}.json` | 完整解析后的单条目，**含文件正文** |

*命名空间机制*（https://ui.shadcn.com/docs/registry/namespace ，2026-09-05）：消费方在 `components.json` 里写

```json
{
  "registries": {
    "@v0": "https://v0.dev/chat/b/{name}",
    "@acme": "https://registry.acme.com/resources/{name}.json",
    "@private": {
      "url": "https://api.company.com/registry/{name}.json",
      "headers": { "Authorization": "Bearer ${REGISTRY_TOKEN}" }
    }
  }
}
```

`{name}` 是唯一占位符，`${VAR}` 从环境变量展开。**没有中心注册、没有审核、没有 API key**——任何人放一个静态 JSON 文件在自己域名下，就进入了这个生态。这是它赢的根本原因。

*registry-item.json 的字段清单*（https://ui.shadcn.com/docs/registry/registry-item-json ，2026-09-05，摘要转述）：

- 元数据：`$schema`、`name`、`title`、`description`、`type`（`registry:block` / `registry:component` / `registry:ui` / `registry:font` 等）、`author`
- 依赖：`dependencies`（npm）、`devDependencies`、`registryDependencies`（可跨注册表、可指向 GitHub 托管的注册表）
- 文件与配置：`files[{ path, type, target }]`、`cssVars`（按 theme / light / dark 分组）、`css`（layer / utilities / keyframes）、`tailwind`（Tailwind v4 起废弃）
- 环境与文档：`envVars`、`font`、`docs`（自定义安装说明）、`categories`、`meta`（任意 key-value）

**关键观察：`registry-item.json` 里没有 `license` 字段，`registry.json` 顶层也没有。** 官方文档只有 `author`。这是整个 shadcn 生态最大的结构性漏洞——所有下游注册表（包括 21st.dev、Magic UI、Aceternity）都在分发**许可证不进 schema 的代码**。VisLexicon 的 `facts[].license` 在这里有真空位。

*MCP 工具清单*（https://raw.githubusercontent.com/shadcn-ui/ui/main/skills/shadcn/mcp.md ，2026-09-05，工具名逐字取回）：

1. `shadcn:get_project_registries` — 读 `components.json` 里的注册表名，无参数
2. `shadcn:list_items_in_registries` — 参数 `registries[]`、`types[]`、`limit`（默认 100）、`offset`
3. `shadcn:search_items_in_registries` — 模糊搜索，`query` 必填 + 上述可选参数
4. `shadcn:view_items_in_registries` — 参数 `items[]`（如 `@shadcn/button`），**返回文件全文**
5. `shadcn:get_item_examples_from_registries` — 找 demo / 用法示例及源码，`query` 必填
6. `shadcn:get_add_command_for_items` — 返回 CLI 安装命令
7. `shadcn:get_audit_checklist` — 返回校验清单（imports、deps、lint、TypeScript），无参数

安装：`pnpm dlx shadcn@latest mcp init --client [claude|cursor|vscode|codex]`（https://ui.shadcn.com/docs/mcp ，2026-09-05）。

**这七个工具值得逐条对照 VisLexicon**。注意它的切分逻辑：**发现（list/search）→ 详情（view）→ 示例（examples）→ 执行（add command）→ 验收（audit checklist）**。最后那个 `get_audit_checklist` 是最容易被忽略、也最有借鉴价值的一个：它承认 Agent 拿到代码之后还会犯错，所以主动给一份验收标准。VisLexicon 的简报第 2 节明确写了 Agent 需要「明确的验收标准」——shadcn 已经证明了这个东西该以什么形态存在。

**生态规模**：shadcn 本人 2026 年 10 月发推公布 Registry Directory（https://x.com/shadcn/status/1983190491052245002 ，经搜索结果确认存在，2026-09-05）；第三方目录 shoogle.dev/directory 显示 **292 个注册表**（2026-09-05 访问），每条展示 name（@ 前缀）、description、最后更新日期、GitHub 链接与 star 数，按最新/最旧排序。示例条目：`@afterglow`（终端 UI 系统，2026-08-30）、`@scrimui`（AI 界面组件：prompts / streaming / reasoning / tool calls / citations / agents / memory / voice / safety，2026-08-30）、`@onchain-ui`（Web3，2026-08-26）。

**卡片解剖（shoogle 目录）**：名字 + 一句功能描述 + 更新日期 + star + 两个动作按钮（View / Add）。**注意「Add」按钮**——目录页直接给可执行动作，不是只给链接。

**商业模式**：shadcn/ui 本体免费开源；协议本身不收费，Vercel 通过 v0 变现。

**最值得学的 1–2 点**：
1. **路径即协议**。不需要任何人批准就能加入。VisLexicon 上 `/r/{entryId}.json` 的边际成本接近零，收益是「被任何 shadcn 生态工具无意中兼容」。
2. **索引与详情分离**（`registry.json` 不含文件正文）。这直接决定了 VisLexicon 的索引端点不应该内嵌截图 base64 或全文事实。

**明显缺陷**：schema 里没有许可证、没有出处、没有核验时间。一个 `registry-item.json` 无法回答「这段代码我能不能商用」。

---

#### A2. 21st.dev（含 21st MCP，原 Magic MCP）—— 最激进的「每个组件都是一段 prompt」

**定位**：站方自述「The NPM for Design Engineers」。首页宣称 **12,000+ React 组件、700+ design engineer、3,460,512 builders**（https://21st.dev/ ，2026-09-05，站方自述）。分两大区：Marketing blocks 2,000+（animated heroes、shaders、liquid & metal effects、backgrounds、gradients、footers）与 UI components 2,100+（buttons、AI chats、cards & grids、galleries & 3D carousels、navigation menus、sign-in widgets、sections）。

**给人的界面**：社区门户 + 分类导航 + 个人/团队共享列表（收藏夹）。**卡片解剖**：视觉预览 + 标题描述 + 本周安装数（例：25,431 installs this week）+ 收藏数 + 作者头像与署名 + 分类标签。

**安装流程的 slogan 值得注意**：「Every component ships as a prompt」——主 CTA 是 **Copy prompt**（贴进 Claude Code / Cursor / v0 / Lovable），shadcn CLI 命令被降级为「classic approach」。这是 2026 年组件站的姿态转变：**主产品是提示词，代码是备选**。

**给 Agent 的接口**（https://21st.dev/mcp ，2026-09-05，摘要转述）：以命令名而非标准 MCP tool name 呈现——`21st search`（搜索并安装组件，含依赖）、`21st generate`（文本生成 UI 变体）、设计方向探索、"build a screen in our style"、设计审计（design / a11y / responsiveness）、`21st publish-theme`（把项目 CSS 变量转成可分享主题）、`21st publish`、`21st components`（管理可见性与元数据）。全局安装 + 浏览器授权；CI 用 `--api-key $API_KEY_21ST`。

历史包袱：`21st-dev/magic-mcp` 仍在维护以兼容旧配置，README 描述的是 `/ui` 斜杠命令 + `API_KEY` 环境变量的用法，**并未暴露离散的 MCP tool 名**（https://github.com/21st-dev/magic-mcp/blob/main/README.md ，2026-09-05）。

**另一条线：agent-elements**（https://github.com/21st-dev/agent-elements ，2026-09-05）——**MIT 许可**的 shadcn 风格注册表，26 个 AI Agent 界面组件：`AgentChat`、工具卡片族（`BashTool`、`EditTool`、`SearchTool`、`TodoTool`、`PlanTool`、`SubagentTool`、`McpTool`）、输入族（`InputBar`、`Suggestions`、`ModelPicker`、`SendButton`、`AttachmentButton`）、工具类（Markdown renderer、`TextShimmer`、`SpiralLoader`）。安装：`npx shadcn@latest add https://agent-elements.21st.dev/r/agent-chat.json`。**并且它附带一个 skills.sh 集成**，让 AI 助手理解组件目录与组合模式。这是「同一批内容，MCP 和 Skill 两条路一起走」的实例。

**许可证与再分发姿态**：这是 21st.dev 最难看的地方，也是 VisLexicon 已经在样本里正确记录了的（见 `content-samples/approved-v3/21st-dev.json` 的 `facts[].license`）：条款说明代码/内容/材料由**相应作者与 21st Labs Inc. 分别拥有**，Marketplace 内容、预览和元数据的使用有限制，底层第三方组件可由作者另行授权，**不存在可扩大到全站的统一 SPDX 许可**（https://21st.dev/terms ，VisLexicon 核验时间 2026-09-01）。

**商业模式**（https://21st.dev/pricing ，2026-09-05）：Builder $6/月（年付，含无限复制、29,000 图标按语义搜索、MCP & CLI 搜索）；Builder + AI $15/月（含 500/1K/2K AI credits，多模型，React live sandbox，加购 +100 credits / $5 可结转）；Team $7.50 每席/月（2–50 席，共享收藏、私有团队组件、集中计费）。免费层每日有限次复制。

**移动端**：未核验。

**最值得学的 1–2 点**：
1. **「Copy prompt」作为一等公民 CTA**。VisLexicon 详情页应该有一个动作是「复制成 Agent 上下文」，而不是「复制链接」。
2. **`21st publish-theme`：把用户项目的 CSS 变量反向变成可分享资产**。这是双向数据流，值得 VisLexicon 在「工具」频道降级后仍保留在详情页动作里。

**明显缺陷**：
- **每日免费复制次数限制** = 人页面被漏斗化。这与「同一数据层、两种渲染」直接冲突：Agent 通道要付费，人通道被限流，那这份数据就不是公共层，是商品。VisLexicon 若走这条路，简报里「帮人快速判断值不值得打开」的承诺立刻崩塌。
- 许可证碎片化到无法机器判定。12,000 个组件、700 个作者、无统一 SPDX——这正是 VisLexicon 该攻击的靶心。

---

#### A3. Magic UI —— 有官方 MCP，但没有许可证元数据

**定位**：站方自述「UI library for Design Engineers」，shadcn/ui 的动效补充层。**150+ 免费开源动效组件**，Pro 提供 **50+ blocks and templates**（https://magicui.design/ ，2026-09-05，站方自述）。技术栈 React + TypeScript + Tailwind + Motion。作者 Dillion Verma，GitHub 22.1–22.2k stars（首页显示 22.2k，仓库页显示 22.1k，2026-09-05）。

**许可**：**MIT**（https://github.com/magicuidesign/magicui ，2026-09-05，仓库明确写明）。仓库根目录存在 `registry.json`（同上，页面文件列表可见）。

**给 Agent 的接口**：有官方 MCP。原话「Magic UI now has an official MCP server」，安装 `pnpm dlx @magicuidesign/cli@latest install cursor`（也支持 Windsurf / Claude / Cline / Roo-Cline），装完重启 IDE，然后自然语言「Add a blur fade text animation」「Add a grid background」「Add a vertical marquee of logos」（https://magicui.design/docs/mcp ，2026-09-05）。**文档没有列出离散 tool 名**——这是 2026 年 MCP 文档的普遍毛病：面向「怎么说话」而不是「暴露了什么」。

**商业模式**：Freemium，Magic UI Pro 付费。

**最值得学**：MIT + 官方 MCP + registry.json 三件套齐全，是「小团队最低成本进入 Agent 生态」的完整样板。VisLexicon 可以直接照抄这个组合的形状。

**明显缺陷**：MCP 文档只教用法不列工具，Agent 侧不可预测；registry item 里同样没有许可证字段（继承 shadcn schema 的缺陷）。

---

#### A4. Origin UI → **已被 Coss 吸收，域名 302 跳转**（本轮最重要的时效性发现）

**核验过程**：`https://originui.com/` 返回 **302 Found → https://coss.com/ui**（WebFetch，2026-09-05）。

**背景证据**：coss.com 官方账号发文「Origin UI is joining @calcom. It's now @coss_com, a more ambitious project, set to become the best infrastructure for the web」（https://x.com/coss_com/status/1976668768312123777 ，经搜索结果确认，2026-09-05）；原作者 Pasquale Vitiello 同步发文确认（https://x.com/pacovitiello/status/1976672108139921707 ）。GitHub 仓库 `origin-space/originui` 的 README 现已重定向到 `cosscom/coss`（搜索结果显示该 URL 的标题为 "coss/README.md at main · cosscom/coss"，2026-09-05）。

**Coss UI 现状**（https://coss.com/ui 与 https://github.com/cosscom/coss ，2026-09-05）：
- 定位：「A new, modern UI component library built on top of Base UI」，明确写着「designed to serve **developers and AI**」——**站方自己把 AI 列为一等用户**。
- 是 **Cal.com 官方设计系统**（GitHub 仓库描述原文：coss.com/ui is the official design system of Cal.com）。
- 规模：站上显示 508 个组件/particles；GitHub 10.5k stars、536 forks。
- **许可证是混合的**：`apps/origin/` 与 `apps/ui/` 为 **MIT**，其余目录为 **AGPLv3.0**。Origin UI 作为「pre-acquisition 的 Radix-based / shadcn-style 组件快照」保留在 `apps/origin/` 里，活跃开发转向新的 Particles 组件。
- 页脚：「© 2026 coss.com – open source, open heart, open mind」。
- **未发现 MCP / registry JSON / llms.txt**（页面与仓库概览均无提及，2026-09-05）。

**对 VisLexicon 的直接后果**：`content-samples/approved-v3/origin-ui.json` 这条已审核记录的 `official.finalUrl` **现在是错的**。这正好证明了 VisLexicon 的 `checkedAt` 字段是产品核心而不是装饰——一个域名在一年内可以从独立产品变成被收购项目的 legacy 快照，许可证从单一 MIT 变成 MIT/AGPL 混合。**任何不带核验时间戳的设计资源目录，在 2026 年都是在传播过期信息。这一条应该写进 VisLexicon 首页的承诺里。**

**混合许可证还有一个更硬的推论**：AGPLv3 的组件被 Agent 复制进闭源产品是许可证违规。目前**没有任何注册表协议能表达「这个仓库里 A 目录 MIT、B 目录 AGPL」**。VisLexicon 的 `facts[].license` + `evidence` 结构天然能表达它（value 写混合状态，evidence 写目录边界）。**这是差异点的最强单一证据。**

---

#### A5. Hover.dev —— 反面教材：明确禁止再分发

**定位**：站方自述「Addicting, interactive, animated UI components」，React + TailwindCSS + Framer Motion。分 Components 与 Templates 两类，30+ 组件品类（https://www.hover.dev/ ，2026-09-05）。

**给人的界面**：按类型分区（sections vs components）+ Popular 区 + **CODE toggle**（就地查看/复制源码）。部分组件标 Free，其余付费。首页未列具体价格。

**许可与再分发姿态**：页脚原文——「Components subject to copyright and may not be redistributed without the written consent of Hover.dev」（同上，2026-09-05）。

**给 Agent 的接口**：**无**。页面未提及任何 AI / agent / registry 能力。

**最值得学**：反过来学。在「每个组件都是一段 prompt」成为主流姿态的 2026 年，一个禁止再分发、无 registry、无 MCP 的组件站，等于把自己从 Agent 的可达世界里删除了。

**对 VisLexicon 的意义**：这类站恰恰是 VisLexicon 最该收录并明确标注的——用户和 Agent 都需要知道「这里的东西你看得到但不能拿」。`facets.access` 里的 `source-available` 与 `licenses: ["custom"]` 就是干这个的。**这个信号在市面上任何一个组件聚合站里都不存在。**

---

#### A6. Uiverse —— 最大的社区元素库，MIT，但没有任何 Agent 接口

**定位**：站方自述「The Largest Library of Open-Source UI elements」。**7,418 个社区元素**，**368,913 名贡献者/社区成员**（https://uiverse.io/ ，2026-09-05，站方自述；两个数字量级差异极大，疑为「元素数」与「注册用户数」，未进一步核验）。

**给人的界面**：按精选合集组织——Loading UI、Button Effects、Card Components、Modern Styles（neumorphism / gradients / dark mode / neon）、Forms & Inputs、Tooltips & Patterns。支持标签浏览、搜索、合集。

**卡片解剖**：视觉预览缩略图 + "Link to post" + "Get code" 双按钮 + 创作者署名 + 多格式选项。导出格式：HTML/CSS、Tailwind、React、Figma 兼容版。

**许可**：首页原话「All content (UI elements) on this site are published under the MIT License」（同上，2026-09-05）。注：`uiverse.io/license`、`/licence`、`/licenses`、`/faq` 四个路径均返回 404（WebFetch，2026-09-05），**逐字许可证文本未取回**，只有首页声明。

**给 Agent 的接口**：**无**。页面未提及 API 或 AI/agent 访问。

**商业模式**：完全免费，无明显变现。

**最值得学**：**同一元素多格式导出**（HTML/CSS → Tailwind → React → Figma）。这是「一份内容多种渲染」在**人的维度**上的实现——VisLexicon 的图鉴条目（术语 + 活舞台 + 参数 + 代码导出）本质是同一个想法，可以直接对标。

**明显缺陷**：7,418 个 MIT 元素、零 Agent 接口。这是 2026 年最大的一块「有内容没通道」的资产。它也说明一件事：**内容量不会自动变成 Agent 价值，结构化才会。**

---

#### A7. Aceternity UI / Cult UI / Animata —— 中型注册表三连，Agent 接口成色不一

**Aceternity UI**（https://ui.aceternity.com/ ，2026-09-05）：站方自述「The React component library for beautiful landing pages」，200+ production-ready components / blocks / templates，changelog 提到新增 80+ blocks，宣称 120,000+ 用户。Freemium + 一次性付费的 All-Access/Pro。页脚有 "shadcn Compatible Blocks"。**首页明确写着**「connect your AI agent to the Aceternity UI MCP server and let it build for you」。
> ⚠️ **但 `https://ui.aceternity.com/mcp` 返回 404**（WebFetch，2026-09-05）。搜索能找到的可用 MCP 全部是第三方：`rudra016/aceternityui-mcp`（npm 有包）、`devinoldenburg/aceternity-mcp`、`sammcj/mcp-devtools` 里的 aceternityui 工具。**官方 MCP 是否真实存在、入口在哪，本轮未核实。** 许可证条款页存在但首页未展开，未核验。

**Cult UI**（https://www.cult-ui.com/ ，2026-09-05）：78+ 动效组件，**MIT 且站方明确承诺「Our library stays MIT-licensed」**。三层商业结构：免费核心库 / Cult Pro（pro.cult-ui.com）/ AI SDK Agents（aisdkagents.com，100+ AI agent 模式 + 4 个全栈模板）。**未提及 MCP、llms.txt 或 registry JSON 端点**。

**Animata**（https://animata.design/ ，2026-09-05）：155+ 动效 React 组件，19 个品类，**MIT**，完全免费无付费层。站方自述 2,697+ GitHub stars、1,325+ 开发工时、425+ 研究工时（这种「工时」数字属营销叙事，无法核验）。支持 Next.js / Remix / Vite / Astro / Gatsby / TanStack。强调复制粘贴而非 npm 依赖。**无 AI/MCP 集成**。

**三者共同的启示**：MIT + copy-paste + 无 Agent 接口 = 2024 年的产品形态；2026 年只有加了 MCP 或 registry 的那些还在被 Agent 触达。**对 VisLexicon 的直接推论：这一批站的价值正在从「组件源」变成「许可证干净的可推荐对象」**——恰好是 VisLexicon 的 `facets.licenses` 能表达的。

---

### B 组 · AI / Agent 界面组件（简报 4.1 点名的小需求，2026 年已成独立赛道）

#### B1. Vercel AI Elements —— 官方背书的「AI 界面组件词表」

**定位**：官方原话「A component library and custom registry built on top of shadcn/ui to help you build AI-native applications faster」（https://elements.ai-sdk.dev/ ，2026-09-05）。

**安装**：`npx ai-elements@latest add conversation`。

**组件清单（五组）**——这份清单本身对 VisLexicon 图鉴极有价值，因为它是**大厂给出的 AI 界面术语表**：
- Chatbot：Conversation、Message、Prompt Input、Sources、Reasoning、Chain of Thought、Task、Plan、Suggestion
- Code：Code Block、Artifact、Agent、Terminal、File Tree、Stack Trace、Test Results、JSX Preview、Sandbox
- Voice：Speech Input、Audio Player、Transcription、Voice Selector、Mic Selector、Persona
- Workflow：Canvas、Node、Edge、Connection、Controls、Panel、Toolbar
- Utilities：Image、Open In Chat

**给 Agent 的接口**：本身就是 shadcn custom registry（继承 `/r/{name}.json` 路径约定）。页面未单列 license / llms.txt / MCP manifest（同上，2026-09-05，未逐字核验仓库 LICENSE）。

**最值得学**：**术语的权威化**。简报 12.2 说图鉴要解决「知道位置和作用，不知道名字」——AI Elements 已经把 Prompt Input、Chain of Thought、Sources、Reasoning、Artifact 这些名字钉死了。**VisLexicon 图鉴的 AI 界面部分应该直接对齐这份词表并注明来源，而不是自造同义词。** 这也正好呼应 v3 规格 4.2 节「不得由不同 Agent 自由造出同义词」。

---

#### B2. assistant-ui —— 唯一一个把 llms.txt 当产品特性摆在首页的

**定位**：「frontend library for AI agents」，primitives + runtime for production chat，通过 adapter 接任何后端（https://www.assistant-ui.com/ ，2026-09-05）。

**规模与许可**：**MIT**，12k GitHub stars，1.7M 周下载（站方自述）。Y Combinator 支持。平台覆盖 React / React Native / Ink。

**安装**：`npx assistant-ui init`（**不走 shadcn registry**，自建脚手架）。primitives（`ThreadPrimitive`、`ComposerPrimitive` 等）通过 CLI 复制进用户仓库。

**能力覆盖**：streaming、reasoning、tools、approval workflows、sources、attachments、branching、suggestions、voice、generative UI。集成 AI SDK / LangGraph / LangChain / Mastra。

**给 Agent 的接口**：提供 **`/llms.txt` 文档索引**，站方明确标为「for AI agents」的机器可读文档特性（同上，2026-09-05）。

**商业模式**：开源 + assistant-ui Cloud（托管 threads 与持久化）付费。

**最值得学**：它是本轮调研里**唯一把 llms.txt 当卖点写在首页**的产品。结合下文 §5.2 的负面证据看，这更像是**给人类开发者看的信号**（「我们对 Agent 友好」），而不是真的有 Agent 在读。**这个观察对 VisLexicon 很实用：llms.txt 的真实价值是姿态信号，不是数据通道——因此值得做，但不值得投入。**

---

#### B3. Prompt Kit —— llms.txt + llms-full.txt 双文件

**定位**：为 AI 应用（chat 界面、AI agents、autonomous assistants）设计的可定制 React 组件集（https://github.com/ibelick/prompt-kit ，2026-09-05；官网 `https://www.prompt-kit.com/` 对 WebFetch 返回 **403**，因此产品信息取自 GitHub）。

**安装**：`npx shadcn@latest add prompt-kit/[component]`——**走 shadcn CLI**。

**许可与规模**：**MIT**，2.9k stars、156 forks，TypeScript 82.5% / MDX 13.9%。

**给 Agent 的接口**：仓库内**同时存在 `llms.txt` 与 `llms-full.txt`**（同上，2026-09-05）。这是 llms.txt 规范里「索引 + 全文」双层的标准实现。

**最值得学**：`llms.txt`（链接索引）与 `llms-full.txt`（拼接全文）的分层，和 shadcn 的「索引不含文件正文 / 详情含正文」是同一个设计直觉。**VisLexicon 的两个端点应该照这个分层：索引轻、详情重。**

---

#### B4. LiveKit Agents UI —— 语音 Agent 界面的标准件，纯走 shadcn 命名空间

**定位**：LiveKit 官方的语音 AI 前端组件（https://docs.livekit.io/frontends/agents-ui/ ，2026-09-05）。

**组件清单**（同样是有价值的术语表）：
- Media controls：`AgentControlBar`、`AgentTrackControl`、`AgentTrackToggle`、`AgentDisconnectButton`、`StartAudioButton`
- Audio visualizers：`AgentAudioVisualizerBar`、`Grid`、`Radial`、`Wave`、`Aura`
- Chat：`AgentChatTranscript`、`AgentChatIndicator`

**安装**：完全走 shadcn 命名空间机制——
```
npx shadcn@latest init
npx shadcn@latest registry add @agents-ui
npx shadcn@latest add @agents-ui/{component-name}
```
可一次装全（`nextjs-api-token-route` 除外，需单独安装）。

**许可**：文档未明说，只提到「open source」与 GitHub 仓库（同上，未核验 LICENSE 文件）。

**MCP / llms.txt / Skill**：文档中**未提及**。（搜索结果中出现 mcpmarket.com 上的 "LiveKit Agents UI - Claude Code Skill for Voice AI Frontends"，但那是第三方目录条目，官方文档无对应说明，未核实。）

**最值得学**：一个大厂产品线**不自建注册表协议、直接注册一个 shadcn 命名空间** ——这是 shadcn 协议赢家通吃的最强证据。VisLexicon 若要做代码导出，应该同理：不发明格式。

---

#### B5. CopilotKit —— 从组件库升级成协议（AG-UI）

**定位**：站方自述「the frontend stack for agentic user experience」（https://docs.copilotkit.ai/ ，2026-09-05）。

**主要构件**：CopilotChat / CopilotSidebar / CopilotPopup 等 UI primitives；**AG-UI Protocol**（标准化接口，可接「any AG-UI compatible backend」）；内建 agent runtime；Rich Threads（跨会话消息与工具活动持久化）。

**Agent 相关**：支持 MCP servers 扩展 agent 能力；对接 Claude SDK、LangGraph 等。

**商业模式**：OSS + 云托管 "CopilotKit Intelligence"。

**最值得学**：**它从「组件库」演化成了「协议 + 组件库」**。这是这个赛道的终局形态提示——单纯的组件集合会被协议吸收。对 VisLexicon 的推论：**不要把 Agent 端点当成「导出功能」，要当成「协议表面」来设计**（稳定 URL、稳定字段名、版本号）。`schemaVersion: 3` 已经在样本里了，这个直觉是对的。

---

### C 组 · 「设计知识 → Agent」的新物种（2025–2026 新增，**这是对 VisLexicon 威胁最大的一组**）

#### C1. DESIGN.md 规范（Google Labs）—— 已经有事实标准了

**这是本轮最重要的发现之一。** VisLexicon 简报 11 节讲的「网页 URL 转提示词与 Design MD 的工具」，在 2026 年已经不是一个待发明的想法，而是**一个由 Google Labs 开源、Apache-2.0 授权、26.3k stars 的规范**。

**规范本体**（https://github.com/google-labs-code/design.md ，2026-09-05）：
- 仓库描述原文：「A format specification for describing a visual identity to coding agents. DESIGN.md gives agents a persistent, structured understanding of a design system.」
- 发布方：**google-labs-code**；许可：**Apache-2.0**；**26.3k stars、2.1k forks**。
- 文件是**两层结构**：`---` 围起的 **YAML front matter（设计 token）** + `##` 分节的 **Markdown 正文（设计理由）**。
- 章节顺序（全部 optional）：Overview → Colors → Typography → Layout → Elevation & Depth → Shapes → Components → Do's and Don'ts。
- YAML schema（摘要转述，未逐字核验）：
```yaml
version: <string>          # optional
name: <string>             # required
description: <string>      # optional
colors: { <name>: <Color> }
typography: { <name>: <Typography> }
rounded: { <scale>: <Dimension> }
spacing: { <scale>: <Dimension | number> }
components: { <name>: { <property>: <value> } }
```
- 规范另有官方文档页 `https://stitch.withgoogle.com/docs/design-md/specification`（该 URL 返回的页面 WebFetch 只取到 meta 标签，正文未取回，2026-09-05）。

**注意 `name` 是唯一必填字段**——这个设计很聪明：极低的准入门槛，任何人都能产出一个合法 DESIGN.md。

**对 VisLexicon 的意义（关键判断）**：
> **不要发明 VisLexicon 自己的「设计说明导出格式」。** 简报 11 节和 v2 反馈都把「Design MD」当成一个待做的工具能力，但规范已经存在、有 Google 背书、有 Apache-2.0 授权、有 26.3k stars 的社区。VisLexicon 应该做的是「**权威的 DESIGN.md 生产者**」，而不是「另一种 md 的定义者」。而且 DESIGN.md 的 YAML 里**没有出处、没有许可证、没有核验时间**——VisLexicon 可以在 frontmatter 里合法扩展这三项（YAML 允许额外 key），既兼容又差异化。

---

#### C2. Refero Styles —— **最直接的竞品，必须正面对待**

**定位**：站方自述「2,000+ AI-readable design systems from leading product websites」，每个提供 colors、typography、spacing、components 与一份 **DESIGN.md**（https://styles.refero.design/ ，2026-09-05，站方自述）。示例品牌：Apple、Stripe、Linear、Notion。

**这与 VisLexicon 的重合面**：
- 都是「真实产品网站 → 结构化设计上下文」
- 都强调「基于真实证据而非 AI 编造」（站方原话：让 Agent「design decisions based on real product evidence rather than AI-generated assumptions」）
- 都有截图（Refero 主站是「tens of thousands of screenshots with advanced search」）
- 都覆盖 Sites / Screens / Flows 三个粒度

**给 Agent 的接口（官方 MCP）**（https://doc.refero.design/mcp/getting-started ，2026-09-05）：
- **五类工具**：`Sites`（按公司/域名/行业/类别/主题/视觉方向发现 web 产品）、`Apps`（iOS 产品，同样的筛选轴）、`Styles`（视觉方向：typography / color / layout / spacing / surfaces / components / imagery）、`Screens`（具体 UI 模式：page structure / hierarchy / copy / states / components）、`Flows`（旅程逻辑：step count / decisions / friction / recovery paths / system responses）
- **MCP Server URL**：`https://api.refero.design/mcp`
- **鉴权**：OAuth 或 `Authorization: Bearer <token>`
- **计划要求**：**Pro / Team / Lifetime 付费计划**才可用
- **配额**：每个授权用户每月 **8,000 次 MCP tool calls**
- 另有可选的 **Refero Skill**（「research-first methodology」）——又一个 MCP + Skill 双轨的例子
- 文档自己指向 `https://doc.refero.design/llms.txt` 作为完整索引

**第三方 MCP 佐证**（https://github.com/faridjafarlee/refero-styles-mcp-server ，2026-09-05）：暴露四个工具 `refero_list_styles`（分页浏览）、`refero_search_styles`（按 keyword / mood / brand / color 搜索）、`refero_get_design_md`（取某个 style 的完整 design.md）、`refero_match_style`（按项目描述匹配，返回 top N + 评分理由 + top 1 的完整 design.md）。README 说明它走 Refero API（`src/services/referoApi.ts`）而非抓页面，并提到「fetches all styles from the Refero API (~60 styles across 3 pages)」——**这个 ~60 的数字与官网「2,000+」差距极大**，可能是该第三方只覆盖了公开 API 的一个子集，也可能官网数字含未开放部分。**未核实，不采信任一方。**

**最值得学的 1–2 点**：
1. **`refero_match_style` 这个工具设计**：输入是「项目描述」（模糊需求），输出是「排序后的候选 + 每条的入选理由 + 首选项的完整可粘贴内容」。这完美对应简报第 2 节「帮人把模糊感觉变成可继续行动的认识」——**Refero 已经把 VisLexicon 的核心用户故事做成 MCP 工具了。** VisLexicon 若要做 MCP，第一个工具就该是这个形状，而不是 `search`。
2. **五类工具按「用户在问什么」切分，不按「数据表」切分**。Sites / Styles / Screens / Flows 是四种不同的提问粒度。VisLexicon 的策展 + 图鉴天然是两种粒度，可以照此切。

**明显缺陷 / VisLexicon 的空档**：
- **MCP 锁在付费墙后**（Pro/Team/Lifetime）。人页面和 Agent 通道不是同一层，是两个商品。
- **没有出处与许可边界**。Refero 提取的是「Stripe 长什么样」，不回答「我能不能用」「这个数据什么时候核验的」「这段结论的来源 URL 是什么」。**这就是 VisLexicon `facts[{field, value, sourceUrl, evidence, confidence}]` 的真空位。**
- 覆盖的是**成品网站的视觉风格**，不覆盖**可复用资源的获取与授权**（组件库、图标库、工具）。VisLexicon 的 13 个主类（v3 规格 §3）比它宽得多。

---

#### C3. getdesign.md（VoltAgent 团队）—— DESIGN.md 目录 + 付费 Catalog Pass

**定位**：站方自述「Give your coding agent a reusable design reference: colors, type, spacing, components, and the reasoning behind them」，遵循「Google's official DESIGN.md spec」（https://getdesign.md/ ，2026-09-05）。

**规模**：**550+ 个已分析网站**（站方自述）。样本跨度很大：Apple、Figma、Stripe、Nike，到 Claude、Cursor、Mistral AI，再到历史参照（Nintendo 2001、Dell 1996）——**收录历史版本设计是一个有意思的差异点**。

**商业模式**：「Catalog Pass」+ 私有定制 DESIGN.md 按需付费（页面未给具体价格，未核验）。运营方：VoltAgent（AI agent 框架公司）。

**页面结构**：hero（价值主张）→ catalog 浏览 → featured design systems → CTA → 页脚。

**「State of DESIGN.md 2026」报告**（https://getdesign.md/state-of-design-md ，2026-09-05）：
- 站方称：102K+ GitHub stars、64K+ 注册用户（11 周内）、1M+ 下载与使用。
  > ⚠️ **「102K+ GitHub stars」与 google-labs-code/design.md 实际显示的 26.3k stars 矛盾。** 这很可能是把整个生态的多个仓库加总，或是营销夸大。**不采信该数字**，只采信仓库页直接显示的 26.3k。
- 构建者平台分布：64.3% 用 AI 编码助手（Claude / ChatGPT / Cursor），22% 用专门的 AI app 平台；AI app builder 内部 Lovable 61.9%、v0 23.3%；WordPress 在 no-code/CMS 类仍占 25.5%，但约一半用户愿意转向 AI 助手。
- 用户动机：「Improve how my site looks」59.4%、「匹配欣赏的设计」23.6%、「建立品牌来源」17%。
- 报告的一句话总结值得摘录：「**The web's next bottleneck is taste, not code generation.**」

**对 VisLexicon 的意义**：这句话就是 VisLexicon 的市场论据。但它同时说明——**这个论据已经被别人拿去做产品并卖钱了**。VisLexicon 不能再把「Agent 需要设计品味上下文」当成自己的洞察来讲，必须往下一层讲：**「Agent 需要的不只是品味，还是可审计的品味」**。

---

#### C4. designmd.app —— 开源版 DESIGN.md 库，按「美学流派」而非按品牌组织

**定位**：562 个 DESIGN.md 文件，按**美学风格**组织——Minimalism、Swiss Style 到 Steampunk、Cyber-Tribal（https://designmd.app/ ，2026-09-05）。作者 Fabricio Telles，引用 Google Labs 官方规范与 W3C Design Tokens 标准。

**文件结构**：YAML front matter 定义 colors / typography / spacing / component rules，Markdown 正文写理由与约束，**八个规范章节**（与 Google 规范一致）。示例展示 Overview / Colors / Typography / Components / Do's & Don'ts。

**使用流程**：选一个风格 → 复制 DESIGN.md 进仓库 → 按站上的 setup guide 配置 Agent（Claude Code、Cursor、Kiro、Windsurf、Cline 等）。

**定价/署名**：页面未明说，标为开源。

**关键差异（对 VisLexicon 有直接启发）**：**它不按「哪个品牌」组织，按「哪种美学」组织。** getdesign.md 和 Refero Styles 都是「Stripe 长什么样」，designmd.app 是「Swiss Style 长什么样」。这正好对应简报 12.2 的四种中立入口里的第 3 种（「我知道它大概属于哪种现象」）——**说明按现象/流派组织确实是一个独立且有人做的入口，v2 反馈里把分类树赶出前台的判断，不等于抛弃「按现象聚合」这个入口。**

---

#### C5. 三个 DESIGN.md 生态位的对照（这三家值得单独看清楚）

| | Refero Styles | getdesign.md | designmd.app |
|---|---|---|---|
| 组织维度 | 品牌/产品站 | 品牌/产品站（含历史版本） | 美学流派 |
| 规模（站方自述） | 2,000+ | 550+ | 562 |
| Agent 通道 | 官方 MCP（付费）+ 第三方 MCP | 未见 MCP | 未见 MCP，靠复制文件 |
| 商业模式 | Pro/Team/Lifetime 订阅 | Catalog Pass + 定制 | 开源 |
| 出处/证据链 | 无 | 无 | 无 |
| 许可边界 | 无 | 无 | 无 |
| 核验时间戳 | 未见 | 未见 | 未见 |

**这张表就是 VisLexicon 的市场空隙论证：三家都在做「设计知识给 Agent」，但最后三行全是空的。**

---

### D 组 · 设计工具的 Agent 接口

#### D1. Figma MCP Server —— 设计工具侧的标准答案

**部署形态**（https://developers.figma.com/docs/figma-mcp-server/ 与 https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server ，2026-09-05）：
- **Remote Server（官方推荐）**：不需要桌面 App，功能最全。**所有 seat 和 plan 都可用。**
- **Desktop Server**：本地运行，面向组织/企业，**所有付费计划需要 Dev 或 Full seat**；Figma for Government 必需（有已知限制）。
- 访问控制：「Only clients listed in the Figma MCP Catalog can connect to the Figma MCP Server.」——**这是一个白名单制的 MCP，与 shadcn 的开放路径约定形成鲜明对比。**

**工具清单**（https://deepwiki.com/figma/mcp-server-guide/5-tools-reference ，2026-09-05；DeepWiki 是对官方 `figma/mcp-server-guide` 仓库的第三方解析，工具名可信度中上，参数未逐字核验）：

读路径：
- `get_design_context`（旧名 `get_code`）— 「Primary tool for translating Figma into code」，返回 layout / typography / component structure 的结构化数据。Remote + Desktop
- `get_variable_defs` — 提取 design token（颜色、间距、排版）。**仅 Desktop**
- `get_code_connect_map` — Figma 节点 ↔ 代码库组件的映射，返回 `codeConnectSrc`（文件路径）与 `codeConnectName`。**仅 Desktop**
- `get_screenshot` — 给 LLM 做视觉校验。Remote + Desktop
- `get_metadata` — 「lightweight XML tree of the design」。Remote + Desktop
- `create_design_system_rules` — 项目级上下文生成。Remote + Desktop

写路径：
- `use_figma` — 对 Figma Plugin API 执行 JavaScript，创建 frame / component / auto-layout。**仅 Remote**

**最值得学的 1–2 点**：
1. **`get_metadata` 与 `get_design_context` 的分层**——先给一棵轻量树让 Agent 决定要什么，再取重内容。这是**为 token 预算设计的 API**，不是为人设计的。VisLexicon 的索引端点必须遵循同样的直觉：先让 Agent 用便宜的调用做筛选。
2. **`get_screenshot` 作为「视觉校验」而非「展示」**。VisLexicon 的三张证据图（身份/范围/事实证明）在 Agent 侧的正确用途是**让 Agent 自我校验判断**，不是给 Agent 看着好看。这一点应该写进端点的字段语义说明里。

**明显缺陷**：白名单客户端准入；关键的 token 与 Code Connect 工具**只在 Desktop 可用**且需付费 seat——**这就是「Agent 通道被商业化切割」的典型样本**，与 21st.dev 的每日复制上限同类。

---

#### D2. Webflow MCP —— 托管连接器，读写双向

（https://developers.webflow.com/mcp/reference/overview ，2026-09-05）
- 五个能力域：**Design and build**（响应式布局、元素、样式、组件、page branches、custom code、fonts、design systems）、**Manage**（CMS collections、assets、site data）、**Analyze**（站点活动与分析）、**Automate**、**Governance**。
- **云托管连接器**，不是自托管；可作为 connector/plugin 装进 Claude Code、Claude Desktop、ChatGPT、Codex、Cursor。
- 鉴权：一次授权对应**一个 workspace**，跨 workspace 需重新授权并重装连接器；遵循已有的 Webflow 权限与角色，Agent 不能改权限或加人。
- 写能力具体到：建布局、加元素、管 class 与 CSS 属性、创建带 variant 的组件、定义「variables、color schemes、typography scales、spacing systems」。
- 限制：不能自动化 Webflow Interactions、不能管远程托管字体、不能创建新的本地化 CMS item、不能改 workspace 访问设置；**视觉快照与读取当前页面状态需要 Designer 与 Bridge App**。

#### D3. Framer —— **明确拒绝 MCP，改走 Skills + 本地工具**（趋势信号）

（https://www.framer.com/help/articles/use-external-agents-with-framer/ ，2026-09-05）

Framer FAQ 原话：
> 「Framer doesn't require a separate MCP server. If you're searching for a Framer MCP, the native Framer Agent connection gives Claude Code, Cursor, Codex in ChatGPT, Gemini CLI, and other AI tools direct access to your canvas, components, CMS, and project context, without manual MCP setup.」

- 设置：`npx @framer/agent setup`，首次连接时浏览器授权。
- 适用范围：「any local agent harness that can work with **Skills** and can call local tools」。
- Agent 可读写：CMS collections（增删改）、localizations、redirects、canvas 与 components、project context。最适合内容更新、批量编辑、数据修改。
- 不能做：改站点设置/项目名/域名、给节点分配 override、访问分析数据。
- 计划要求：文档未说明。

**这是本轮调研里最重要的趋势证据之一**：一个主流设计工具在 2026 年公开说「你不需要 MCP」，改用 CLI setup + Skills + 本地工具。**对 VisLexicon 的推论：把 MCP 推迟是对的，但不是因为它太早，而是因为它可能不是终点。** v1 做静态 JSON + DESIGN.md 导出，恰好是 MCP 和 Skill 两条路都能消费的最小公分母。

---

#### D4. Google Stitch —— 生成侧，且是 DESIGN.md 的源头

（https://stitch.withgoogle.com/ ，2026-09-05：官网 WebFetch 只取到 meta 标签，正文未取回，仅确认 Beta 状态与定位「generates UIs for mobile and web applications」。以下细节来自第三方评测，标注来源与日期。）

第三方评测（https://vibecoding.app/blog/google-stitch-review ，发布日期 2026-06-17，2026-09-05 访问）：
- 文本或图片 → 界面设计；多变体；屏幕串成原型流程；导出 Figma 与代码。
- 仍在 Google Labs preview，**无付费层**；月配额约 350 次（标准模式 Gemini Flash）/ 200 次（实验模式 Gemini Pro）。
- 导出：「Paste to Figma」工作流；代码目标 HTML/CSS、Tailwind、Vue、Angular、Flutter、SwiftUI。
- 该评测**未提及** DESIGN.md、API 或 MCP。

**关联关系**：DESIGN.md 规范的官方文档路径挂在 `stitch.withgoogle.com/docs/design-md/specification` 下，仓库属 google-labs-code——**DESIGN.md 是 Stitch 团队向外开放的格式**。这意味着 DESIGN.md 有一个持续投入的大厂消费者，格式不会短期死掉。

---

#### D5. zeroheight MCP / Supernova Editor MCP / Frontify / Onbrand / Paper.design —— 企业设计系统侧全面 MCP 化

（综述来源：https://slidespeak.co/blog/best-design-mcp-servers ，发布日期 2026-06-10，2026-09-05 访问；另各自官网见下）

- **zeroheight MCP**（https://zeroheight.com/mcp/ ，2026-09-05）：暴露组件、design token、文档、使用规范与「validated design decisions」。站方原话：「your guidelines, usage rules, or validated decisions」作为「one source of truth, reviewed by your team, used by every agent」。对接 Figma agent、Cursor、VS Code、GitHub Copilot、Claude Code、Figma Make、v0、Replit、Lovable。**页面未说明计划要求与上线日期，未核验具体 tool 名。**
- **Supernova**（https://www.supernova.io/for-ai ，2026-09-05）：推出 **Editor MCP**，**可读可写**，站方称是「the first real step toward a fully agentic design system」。暴露 design token（经 Figma variables）、组件（含 API 文档与代码模式）、文档/指南/决策/品牌资产、code patterns。Agent 可以**提议修改设计系统**。定价「从个人到企业的弹性方案」，具体未列。
- **Frontify MCP**：企业品牌门户数据——logo、视觉系统、模板、tone-of-voice、messaging framework、campaign history、本地化信息。（据 SlideSpeak，2026 年 5 月上线。）
- **SlideSpeak Onbrand**：品牌规范——颜色、token、logo 变体、授权字体（含文件）、批准图片、图标库、命名幻灯片版式，以生产级 HTML/CSS 输出。
- **Paper.design**：共享画布，Agent 可读现有 artboard、可把 HTML 写回画布。
- 该综述指出的空档：Brandfolder、Bynder、Canva、Aprimo 等大型品牌资产平台**截至 2026-06 尚未推出第一方 MCP**。

**关键观察**：zeroheight 用的词是「**validated** decisions」、「reviewed by your team」。**企业侧已经把「谁审核过」当卖点了**——这与 VisLexicon 「每一个站，都有人真的进去看过」是同一个论证结构。区别在于 zeroheight 卖给企业内部（审核者是你自己团队），VisLexicon 面向公共互联网（审核者是 Ben）。**这条对标应该写进 VisLexicon 的定位表述里：VisLexicon 是「公共互联网的 zeroheight」。**

---

### E 组 · 通用 Agent 上下文基础设施

#### E1. Context7（Upstash）—— 文档层的「实时上下文」范式

（https://context7.com/ 与 https://context7.com/plans ，2026-09-05）

**定位**：为 Cursor、Claude Code、Codex、Devin Desktop、Antigravity 等「pull up-to-date, version-specific documentation and code examples for any library」。

**定价（逐条取回）**：
- Free：$0，**1,000 次 API 调用/月**，公开仓库、access control、OAuth 2.0
- Pro：**$10/席/月**，含 5,000 次/席/月，超出 $10 / 1,000 次；私有仓库解析 **$5 / 1M tokens**
- Enterprise：定制，同样 5,000/席起，SOC-2、SSO（SAML/OIDC）、可自托管

**MCP 工具名**：官网页面未确认（首页只有元数据层信息，未逐字核验 `resolve-library-id` / `get-library-docs` 这两个广为流传的工具名，**本轮标为未核实**）。站上有 Add Docs 提交入口与 Rankings 排行。

**最值得学**：**「版本化的上下文」这个卖点**。Context7 卖的不是「有文档」，是「文档是当前版本的」。这和 Origin UI→Coss 的案例合起来看，指向同一件事：**Agent 时代的稀缺品是新鲜度与版本准确性，不是内容量。** VisLexicon 的 `checkedAt` 应该在人页面和 JSON 端点上都做成显式的、可排序的、可筛选的一等信息，而不是详情页角落的小字。

---

#### E2. skills.sh / Vercel Agent Skills —— MCP 之外的第二条通道，且增长很快

（https://skills.sh/ 与 https://vercel.com/docs/agent-resources/skills ，2026-09-05）

- **定位**：「The Agent Skills Directory」。「Skills are reusable capabilities for AI agents」，用于「enhance your agents with access to **procedural knowledge**」。
- **运营方：Vercel**（页脚「Made with care by Vercel. Skills are open source on GitHub」）。
- **规模：1,299,814 次总安装**（站方自述）。
- **安装**：`npx skills add <owner/repo>`；多 skill 仓库用 `--skill <skill-name>`；搜索用 `npx skills find <query>`。
- **兼容性**：官方文档写 18+ agent，首页写 20+ agent（Claude Code、Cursor、GitHub Copilot、Windsurf、Gemini、Cline、VS Code 等）。
- **发现机制**：Leaderboard（按 8 周活跃度与总安装排序）、Topics 分类（React、Next.js、**Design & UI**、Databases、Testing、Marketing）、All / Trending (24h) / Hot / Official 分区、搜索（快捷键 `/`）。
- Vercel 官方 skill 目录分组包含 **Design and UI**（「Skills for building accessible, performant user interfaces」）。
- Vercel 文档页本身还有一个值得注意的细节：它输出的 markdown 带 **frontmatter**（`title` / `product` / `url` / `canonical_url` / `last_updated` / `type` / `prerequisites` / `related` / `summary`）和一个 `docsgraph:related` 区块，明写「**For AI agents:** Follow these links to understand how this page connects to the rest of the Vercel ecosystem」，还提供 `.graph.md` 交叉链接图与 `/docs/sitemap.md`。**这是「同一数据层两种渲染」在文档侧的完整实现，而且不靠 MCP，只靠 markdown 变体 URL。**

**最值得学的 1–2 点**：
1. **`.md` 变体 URL 是最便宜的 Agent 渲染**。Vercel 让 `vercel.com/docs/xxx` 与其 markdown 版本共存，Agent 直接 fetch 就有结构化 frontmatter。**VisLexicon 完全可以用同样的招：`/site/{entryId}` 是人页面，`/site/{entryId}.md` 是 DESIGN.md 风格的 markdown，`/r/{entryId}.json` 是完整 JSON。三种渲染，一份数据。**
2. **Leaderboard 按「8 周活跃度」而非总量排序**——这是对抗「早期条目永久霸榜」的具体机制，对 VisLexicon 未来做热门排序有直接参考价值。

---

#### E3. cursor.directory —— 规则集合的现状（已从 rules 站转向 plugins 站）

（https://cursor.directory/ ，2026-09-05）
- 现在同时列 rules/best practices 与 MCP servers，站上用词是「plugins」「community plugins」。
- 站方自述 87.7k+ 开发者贡献；页面可见 50+ plugin。
- 规则的命名极其规整：「{框架/语言} rules and best practices for Cursor」，按使用量排序（可见范围 1.4k–39.3k）。
- MCP 侧列的是 Drizzle Docs、Zendesk、Signoz、GitHub、Supabase、Notion、Stripe、Slack 等。
- 有「Submit a plugin」入口；**未发现公开 JSON API 或 MCP 端点**（页面未提供，2026-09-05）。

**观察**：Cursor rules 这条路径正在被 Skills 吸收——同一批「procedural knowledge」，skills.sh 有 130 万次安装与跨 20 家 agent 的兼容性，cursor.directory 只服务一个 IDE。**对 VisLexicon 的推论：不要做「VisLexicon Cursor rules」，要做的话直接做 Skill。**

---

## 3. 对照矩阵

### 3.1 主矩阵：给人的界面 vs 给 Agent 的接口

| 产品 | 定位 | Agent 接口形态 | 接口是否收费/限流 | 许可证进不进数据模型 | 出处/证据链 | 核验时间戳 |
|---|---|---|---|---|---|---|
| shadcn/ui registry | 分发协议 | `/r/*.json` + 7 个 MCP tool | 免费开放，无鉴权 | **否**（只有 author） | 否 | 否 |
| 21st.dev | 社区注册表+市场 | 21st MCP（命令式）+ CLI | 免费层每日限次；AI 需 credits | 否（条款层碎片化） | 否 | 否 |
| Magic UI | 动效组件 | 官方 MCP（CLI 安装）+ registry.json | 免费 | 仓库级 MIT，不进 item | 否 | 否 |
| Coss UI（原 Origin UI） | Cal.com 设计系统 | **未见** | — | 仓库级混合 MIT/AGPL | 否 | 否 |
| Hover.dev | 动效组件（闭源） | **无** | — | 禁止再分发（仅页脚文字） | 否 | 否 |
| Uiverse | 社区元素库 | **无** | — | 站级 MIT 声明 | 否 | 否 |
| Aceternity UI | 落地页组件 | 首页宣称官方 MCP（**入口 404，未核实**）；有第三方 MCP | Pro 付费 | 未核验 | 否 | 否 |
| Cult UI | 动效组件 | **未见** | — | 承诺永久 MIT | 否 | 否 |
| Animata | 动效组件 | **无** | — | MIT | 否 | 否 |
| AI Elements (Vercel) | AI 界面组件 | shadcn custom registry | 免费 | 未在页面核验 | 否 | 否 |
| assistant-ui | Agent 前端 runtime | **llms.txt**（首页卖点） | 免费（Cloud 付费） | MIT | 否 | 否 |
| Prompt Kit | AI 界面组件 | shadcn CLI + llms.txt/llms-full.txt | 免费 | MIT | 否 | 否 |
| LiveKit Agents UI | 语音 Agent 界面 | shadcn 命名空间 `@agents-ui` | 免费 | 未明说 | 否 | 否 |
| CopilotKit | Agent UX 栈 + AG-UI 协议 | 协议 + 支持 MCP | OSS + 云付费 | 未核验 | 否 | 否 |
| **Refero Styles** | **真实站的 AI-readable 设计系统** | **官方 MCP（5 类工具）+ Skill** | **Pro/Team/Lifetime，8,000 calls/月** | **否** | **否** | **否** |
| **getdesign.md** | **DESIGN.md 目录（550+ 站）** | 未见 MCP，复制文件 | Catalog Pass 付费 | 否 | 否 | 否 |
| **designmd.app** | **DESIGN.md 库（562 个，按流派）** | 复制文件 | 开源免费 | 否 | 否 | 否 |
| DESIGN.md 规范 | 格式标准 | 格式本身 | Apache-2.0 免费 | **规范里无 license 字段** | 否 | 否 |
| Figma MCP | 设计工具 | 6 读 + 1 写 tool | Remote 全计划；Desktop 需 Dev/Full seat；客户端白名单 | N/A | N/A | N/A |
| Webflow MCP | 建站工具 | 托管连接器，5 域 | 按 workspace 授权 | N/A | N/A | N/A |
| Framer | 建站工具 | **拒绝 MCP，走 Skills + 本地工具** | 未说明 | N/A | N/A | N/A |
| zeroheight MCP | 企业设计系统文档 | MCP | 未说明 | N/A | **卖点是 validated/reviewed** | 未见 |
| Supernova | 企业设计系统 | Editor MCP（**可写**） | 弹性计划 | N/A | N/A | N/A |
| Context7 | 库文档上下文 | MCP | Free 1,000 calls/月起 | N/A | N/A | **版本化是卖点** |
| skills.sh (Vercel) | Agent Skill 目录 | `npx skills add/find` + markdown 变体 + `.graph.md` | 免费 | 各 skill 自定 | 否 | 文档有 `last_updated` |
| cursor.directory | Cursor 规则/插件 | 无公开 API | 免费 | 否 | 否 | 否 |
| **VisLexicon（目标）** | **会查证的视觉知识层** | **待建** | **应免费开放** | **`facts[].license` + `facets.licenses`** | **`facts[].sourceUrl/evidence/confidence`** | **`official.checkedAt`** |

**这张表最后三列，除了 VisLexicon 那一行，几乎全是「否」。这就是差异点成立的形式化证据。**

### 3.2 副矩阵：卡片解剖对照（人的一面）

| 产品 | 卡片上的信息 | 是否有「可执行动作」按钮 |
|---|---|---|
| 21st.dev | 预览 + 标题描述 + 本周安装数 + 收藏数 + 作者头像 + 分类标签 | **Copy prompt**（主）/ CLI 命令（次） |
| Uiverse | 缩略图 + 创作者 + 多格式选项 | Link to post / **Get code** |
| shoogle 目录 | @名 + 描述 + 更新日期 + GitHub star | View / **Add** |
| skills.sh | 排行位次 + 安装数 + 8 周活跃度 + 分类 | `npx skills add` |
| VisLexicon 现状 | 三张证据图 + 简介 + 作者/仓库/许可/价格/来源/核验时间 | 待定（v2 建议默认浮窗） |

**共同规律：2026 年的资源卡片都在卡片层就给可执行动作，而不是「点进去再说」。** VisLexicon 的卡片如果只有「打开浮窗」一个动作，比同类少了一档。至少应该在卡片上有「复制为 Agent 上下文」。

---

## 4.「同一数据层、两种渲染」谁真的做到了

**先给结论：真正做到「同一份数据、人页面与机器接口平权、都免费、都完整」的只有两家半——shadcn/ui、Vercel Docs/skills.sh，半家是 Prompt Kit（体量小但结构对）。其余全部在某个环节切割。**

### 4.1 真的做到了：shadcn/ui

证据：
- 人页面 `https://ui.shadcn.com/docs/components/button` 与机器端点 `https://ui.shadcn.com/r/button.json` 是同一条目的两种渲染。
- 机器端点**无鉴权、无限流、无付费墙**。
- 索引与详情分层（`/r/registry.json` 不含文件正文，`/r/{item}.json` 含）。
- MCP 只是在这层之上的**便利层**，不是唯一通道——不装 MCP，`curl` 一个 URL 也拿得到全部。

**schema 例子**（基于 https://ui.shadcn.com/docs/registry/registry-item-json 的字段说明构造，2026-09-05；**注意：原始响应本轮未能取回，以下是按文档字段还原的形状，不是逐字抄录**）：

```jsonc
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "hello-world",
  "type": "registry:block",
  "title": "Hello World",
  "description": "A simple hello world component.",
  "author": "shadcn <hi@shadcn.com>",
  "dependencies": ["zod"],
  "devDependencies": ["@types/node"],
  "registryDependencies": ["button", "@acme/input"],
  "files": [
    { "path": "registry/new-york/hello-world/hello-world.tsx",
      "type": "registry:component",
      "target": "components/hello-world.tsx" }
  ],
  "cssVars": {
    "theme": { "font-heading": "Poppins, sans-serif" },
    "light":  { "brand": "20 14.3% 4.1%" },
    "dark":   { "brand": "20 14.3% 4.1%" }
  },
  "css": { "@layer components": { "card": { "background-color": "var(--color-white)" } } },
  "envVars": { "OPENAI_API_KEY": "" },
  "docs": "Remember to set OPENAI_API_KEY in .env",
  "categories": ["ai", "chat"],
  "meta": { "anything": "you want" }
}
```

**注意 `meta` 是任意 key-value 的逃生舱**——VisLexicon 若想让自己的条目被 shadcn 生态直接消费，`meta` 就是塞 `sourceUrl` / `checkedAt` / `license` 的地方。这是一个**零协商成本的兼容路径**。

### 4.2 真的做到了：Vercel Docs + skills.sh（且不靠 MCP）

证据：`https://vercel.com/docs/agent-resources/skills` 的 WebFetch 返回**直接是带 frontmatter 的 markdown**（`title` / `product` / `url` / `canonical_url` / `last_updated` / `type` / `prerequisites` / `related` / `summary`），文中嵌 `docsgraph:related` 区块并明文对 AI agent 说话，另提供 `.graph.md` 与 `/docs/sitemap.md`（2026-09-05 逐字取回）。

**这是全篇最值得 VisLexicon 抄的实现方式，因为它成本最低**：不需要 MCP server、不需要鉴权、不需要 SDK，只需要**同一路由的另一种 Content-Type 或另一个扩展名**。

### 4.3 只做到一半：Refero Styles / Figma / 21st.dev / Context7

- **Refero**：人页面免费浏览，MCP 锁 Pro/Team/Lifetime + 8,000 calls/月限额 → **不是同一层，是两个商品**。
- **Figma**：`get_variable_defs` 与 `get_code_connect_map` 这两个最有价值的读工具**只在 Desktop server 可用**且需 Dev/Full seat → 数据层按 seat 切割。
- **21st.dev**：免费层每日限次复制 → 人页面本身就被限流。
- **Context7**：Free 1,000 calls/月 → 有免费层但有硬上限。

### 4.4 完全没做：Uiverse / Hover.dev / Cult UI / Animata / Coss UI

7,418 个 MIT 元素（Uiverse）、508 个组件（Coss）、155 个（Animata）—— 全是只有人页面。

### 4.5 结论对 VisLexicon 的直接含义

> **「同一数据层、两种渲染」不是一个还没人做的创新，而是一个已经被 shadcn 和 Vercel 验证过、且被大多数商业产品主动放弃的做法。** VisLexicon 选它，不是选新，是选**不切割**——这本身就是定位表态。v2 反馈说「给每个正式条目加一个稳定 JSON 端点几乎免费，v1 就该做」，这个判断经得起本轮调研的检验。

---

## 5. Agent 消费设计知识的四条路径：成熟度、优劣与趋势

### 5.1 Registry JSON（路径约定）—— **成熟度：高。推荐 v1 采用。**

**证据**：292 个第三方注册表（shoogle.dev/directory，2026-09-05）；LiveKit、Vercel AI Elements、Prompt Kit、21st agent-elements 这些不同量级的团队都选择注册进 shadcn 命名空间而非自建协议；v0 官方文档要求设计系统以 `registry.json` 形式提供（https://v0.app/docs/design-systems-legacy ，2026-09-05）。

**优势**：静态文件即可，CDN 友好，无运行时，无鉴权，天然可缓存；索引/详情分层解决 token 预算；`meta` 逃生舱允许扩展。

**劣势**：schema 里没有许可证/出处/时间戳；语义局限在「可安装的代码」，表达「一个网站的设计知识」需要自行扩展。

**趋势判断**：**会继续赢**。原因是它的准入成本是零——不需要任何人批准。任何要求注册、审核或鉴权的协议（Figma MCP 的客户端白名单是反例）都会输给它。

### 5.2 llms.txt —— **成熟度：低，且有硬负面证据。v1 可做但只当姿态。**

**规范本身是清楚的**（https://llmstxt.org/ ，2026-09-05）：BOM（可选）→ H1 项目名（唯一真正必需）→ blockquote 摘要 → 可选正文（无标题）→ H2 分节的文件列表（markdown 链接 + 可选注释）→ 惯例上的 "Optional" 节（Agent 可跳过）。Jeremy Howard 提出，v1 在 2024 年。
> ⚠️ WebFetch 摘要还声称「v2 发布于 2024-09-03，最后修改 2026-08-10」以及「Chrome's Lighthouse audits sites for compliance」。这两条**未能独立核实**，尤其 Lighthouse 审计 llms.txt 一说存疑，**不采信**。

**决定性的负面证据**（https://www.digitalapplied.com/blog/llms-txt-in-practice-adoption-evidence-2026 ，2026-09-05 访问）：

- **采纳率随抽样口径剧烈变化**：开发者向的 219 主机样本中 51.8%（113/218，截至 2026-08-03）有 llms.txt；Tranco 前 1,000 站只有 8.7%（可达根域中 15.8%，2026-06 测）；约 30 万域名的普通池 10.13%（2025-11）。
- **真实抓取量为零**：约 900 个受监控域名、7 个月（2025-09 至 2026-04）共记录 **1,227 次 llms.txt 请求**——商业数据聚合商 794 次（64.7%）、人类浏览器 392 次（31.9%）、安全/审计扫描器 33 次（2.7%），**前沿 AI 实验室爬虫 0/1,227**。原文措辞：「Among the requesters there was not a single real AI bot」。
- **引用效果为空**：2025-11 一项约 30 万域名研究未发现 llms.txt 与 AI 引用量的可测关联；「removing the llms.txt feature actually improved model accuracy」。
- 另有多篇 2026 年文章标题直指同一结论（「Google says llms.txt does nothing for Search」「llms.txt in 2026: The Evidence Says It Does Nothing」，搜索结果，2026-09-05）。

**但为什么还是该做**：assistant-ui 把它放在首页当卖点、Prompt Kit 做了 llms.txt + llms-full.txt、Refero 文档主动指向自己的 llms.txt。**它是一个廉价的对外信号**：告诉人类开发者「这个站认真对待 Agent」。成本约 20 分钟（一个 H1 + 一个 blockquote + 几个 H2 链接列表）。

**趋势判断**：**作为爬虫通道会继续失败，作为品牌信号会继续存在。** 不要给它任何工程预算。

### 5.3 MCP —— **成熟度：中高，但正在分化。v1 推迟，判断正确。**

**已成熟的证据**：Figma（Remote 全计划可用 + 白名单客户端）、Webflow（托管连接器 + workspace 授权）、zeroheight、Supernova（可写）、Frontify（2026-05 上线）、Refero、21st、Magic UI、shadcn——设计与组件两侧都有第一方实现。

**分化的证据（三条，都是 2026 年的）**：
1. **Framer 明确说不需要 MCP**，改 `npx @framer/agent setup` + Skills + 本地工具（官方 FAQ 原话，见 §D3）。
2. **21st.dev 的 MCP 文档用「命令」而不是「tool 名」组织**（`21st search` / `21st generate` / `21st publish`），Magic UI 的 MCP 文档干脆只教怎么说话不列工具——**这些实质上已经是 Skill 的心智，只是跑在 MCP 传输上**。
3. **MCP + Skill 双轨成为常态**：Refero 有可选 Skill、21st agent-elements 附 skills.sh 集成、LiveKit 在第三方目录里以 Skill 形式出现。

**劣势（对 VisLexicon 尤其致命）**：MCP 需要一个**运行中的服务**（托管成本、可用性、鉴权、限流、版本），而 VisLexicon 目前是一个内容还没做实的个人产品。v2 反馈说「顺序不能反」是对的——**在语料不到几百条时上 MCP，等于给一个空数据库配一个 API 网关**。

**趋势判断**：MCP 在**有状态、需写入、需鉴权**的场景（Figma 画布、Webflow 站点、Supernova 设计系统）会长期存在；在**只读的公共内容**场景会被「静态 JSON + Skill」侵蚀，因为后者没有运行时成本。**VisLexicon 属于后者。**

### 5.4 Skills —— **成熟度：中，增速最快。v1.5 的正确选择。**

**证据**：skills.sh 由 **Vercel** 运营，**1,299,814 次安装**，兼容 18–20+ agent，有 Design & UI 分类，`npx skills add <owner/repo>` / `npx skills find <query>`（2026-09-05）。Framer 把 Skill 兼容性当作 Agent 接入的前提条件。Refero、21st 都提供可选 Skill。

**优势**：**零运行时**——一个 markdown 文件 + 前置元数据即可；跨 agent 兼容性比 MCP 更好（因为它只是文件）；天然适合传递「procedural knowledge」（怎么用 VisLexicon 挑资源、怎么读三张证据图、怎么判断许可边界）——这正好是 VisLexicon 想传达的东西。

**劣势**：没有统一的 schema 校验；发现依赖目录站；无法传递大规模结构化数据（Skill 是给流程知识的，不是给数据库的）。

**趋势判断**：**Skill 会吃掉 Cursor rules，并与 registry JSON 形成互补**——JSON 供数据，Skill 供用法。**这是 VisLexicon 的最佳组合：`/r/*.json` 提供可验证的数据，一个 Skill 教 Agent 怎么用这些数据做设计判断。**

### 5.5 四条路径的一句话排序

> **对 VisLexicon 而言：registry JSON（v1，必做）> DESIGN.md 导出（v1，必做）> Skill（v1.5）> llms.txt（v1，20 分钟，只当信号）>> MCP（推迟到有真实调用需求）。**

---

## 6. 对 VisLexicon 的具体建议

### 6.1 v1 最低成本的 Agent 端点该长什么样

**设计原则（每条都对应上面的证据）**：

1. **路径抄 shadcn**，不发明新约定 → 见 §A1、§4.1。
2. **索引与详情分层**，索引不含证据全文与截图元数据 → 见 shadcn `/r/registry.json` 与 Figma `get_metadata`（§D1）。
3. **静态生成，无鉴权，无限流** → 这是与 Refero/21st/Figma 的定位分野（§4.3）。
4. **`facts[]` 原样保留**，这是唯一的差异化资产 → 见 §3.1 最后三列。
5. **同一路由三种渲染**：`/site/{entryId}`（人）、`/site/{entryId}.md`（DESIGN.md 风格）、`/r/{entryId}.json`（完整）→ 抄 Vercel Docs（§4.2）。
6. **`candidate` 绝不进这些端点**——只投影 `status: APPROVED` 的 bundle。这是 v3 规格第 21 条不变量的直接延伸，也是简报硬约束。

#### 端点一：`GET /r/registry.json`（索引，轻）

字段清单：`$schema`、`name`、`homepage`、`schemaVersion`、`generatedAt`、`counts`（诚实的分层计数）、`items[]`。每个 item 只给：`entryId`、`name`、`url`、`homepage`、`primaryCategory`、`subcategory`、`licenses`、`access`、`checkedAt`。**不给** description、facts、pages。

```json
{
  "$schema": "https://vislexicon.com/schema/registry.json",
  "name": "vislexicon",
  "homepage": "https://vislexicon.com",
  "schemaVersion": 3,
  "generatedAt": "2026-09-05T00:00:00.000Z",
  "counts": {
    "approvedEntries": 6,
    "candidateEntries": 8684,
    "atlasTerms": 1932,
    "atlasTermsWithLocalDemo": 62,
    "note": "candidate 条目不出现在本索引中，仅计数公开。"
  },
  "items": [
    {
      "entryId": "21st-dev",
      "name": "21st.dev",
      "url": "https://vislexicon.com/r/21st-dev.json",
      "homepage": "https://21st.dev/",
      "primaryCategory": "ui-implementation",
      "subcategory": "general-ui-components",
      "licenses": ["custom"],
      "access": ["freemium", "login-required", "source-available"],
      "checkedAt": "2026-09-01T07:36:27.507Z"
    }
  ]
}
```

**为什么索引里就放 `licenses` / `access` / `checkedAt`**：因为这三项是 Agent **筛选**时用的，不是**阅读**时用的。让 Agent 一次调用就能排除掉「不能商用」和「一年没核验过」的条目，而不必逐条拉详情。这是全篇最重要的单条设计建议——**把差异化字段放进索引层，而不是详情层。**

#### 端点二：`GET /r/{entryId}.json`（详情，重）

**直接投影 `content-samples/approved-v3/*.json`，几乎不需要改造**。基于真实样本 `21st-dev.json` 的字段草案：

```jsonc
{
  "$schema": "https://vislexicon.com/schema/registry-item.json",
  "schemaVersion": 3,
  "entryId": "21st-dev",
  "entityId": "entity-21st-dev",
  "status": "APPROVED",

  // —— 出处与新鲜度（Agent 判断可信度用；索引层已冗余 checkedAt）
  "official": {
    "inputUrl": "https://21st.dev/",
    "finalUrl": "https://21st.dev/",
    "checkedAt": "2026-09-01T07:36:27.507Z"
  },

  // —— 人话层（Agent 用来向用户复述；不要让 Agent 自己编）
  "editorial": {
    "name": "21st.dev",
    "descriptionZh": "21st Labs Inc. 运营社区 UI 注册表……",
    "pricing": "Freemium + paid membership/AI plans + per-template purchases"
  },

  // —— 分类（单主轴，带理由与证据 URL）
  "classification": {
    "recordLevel": "entry",
    "primaryCategory": "ui-implementation",
    "subcategory": "general-ui-components",
    "status": "confirmed",
    "reasons": [
      { "statement": "用户在站内搜索、预览并把社区组件以 AI 提示词或 shadcn CLI 安装到自己的项目……",
        "evidenceUrl": "https://21st.dev/" }
    ],
    "confirmedAt": "2026-09-01T16:45:57.625Z"
  },

  // —— 12 个正交切面（Agent 真正用于筛选的多值标签）
  "facets": {
    "scenarios": ["ai", "agent"],
    "deliverables": ["component", "block", "template", "prompt"],
    "actions": ["browse", "search", "copy", "install", "submit", "purchase", "preview"],
    "media": ["ui", "motion"],
    "platforms": ["web", "cli", "mcp"],
    "technologies": ["react", "tailwind", "shadcn-ui"],
    "workflowStages": ["discovery", "build"],
    "audiences": ["designer", "developer"],
    "access": ["freemium", "login-required", "source-available"],
    "licenses": ["custom"],
    "contentOrganization": ["component-registry", "community-feed", "marketplace", "searchable-directory"],
    "languages": ["en"]
  },

  // —— 三张证据图：给 Agent 的语义是「自我校验」，不是「展示」
  "pages": [
    { "role": "identity",
      "sourceUrl": "https://21st.dev/",
      "finalUrl": "https://21st.dev/",
      "title": "21st.dev — The NPM for Design Engineers",
      "selectionRationale": "首页呈现 21st.dev 的社区组件注册表身份与精选资源。",
      "shot": { "src": "https://vislexicon.com/shots/21st-dev/v2-identity.png",
                "sha256": "ccfa3b42…", "width": 1280, "height": 900,
                "alt": "21st.dev 首页的界面资源库主视觉与精选内容" } }
    // role: "breadth" / "proof" 同构
  ],

  // —— ★ 差异化核心：每条断言都可审计
  "facts": [
    { "field": "license",
      "value": "21st Marketplace Terms (per-author underlying licenses)",
      "sourceUrl": "https://21st.dev/terms",
      "evidence": "条款规定 Marketplace 内容、预览和元数据的使用限制，同时说明底层第三方组件可由作者另行授权；不存在可扩大到全站的统一 SPDX 许可。",
      "confidence": 1 }
    // field: author / organization / pricing 同构
  ],

  // —— ★ 抄 shadcn 的 get_audit_checklist：告诉 Agent 怎么验收自己的判断
  "agentGuidance": {
    "safeToRedistributeCode": false,
    "requiresAttribution": true,
    "licenseMachineReadable": false,
    "cautions": [
      "全站无统一 SPDX 许可，逐组件作者授权不同；把代码复制进闭源产品前必须逐条确认作者条款。",
      "免费层每日复制次数受限，批量抓取违反其 Marketplace 条款。"
    ],
    "recheckAfter": "2027-03-01"
  },

  // —— 兼容层：让 shadcn 生态的工具能顺手读到关键位
  "meta": {
    "vislexiconUrl": "https://vislexicon.com/site/21st-dev",
    "designMdUrl": "https://vislexicon.com/site/21st-dev.md",
    "checkedAt": "2026-09-01T07:36:27.507Z",
    "license": "custom"
  }
}
```

**相对现有样本，只新增两块**：`agentGuidance` 与 `meta`。其余全部是 `content-samples/approved-v3` 里已经存在的真实字段。**这意味着 v1 的 Agent 端点工作量约等于「写一个 JSON 投影函数 + 去掉 curatorId/reviewerId/attemptId/qa 这些内部字段 + 把 shot.src 换成绝对 URL」。** 这与 v2 反馈「几乎免费」的估计一致，可以确认。

**必须从公开端点里剥离的内部字段**：`attemptId`、`classification.curatorId`、`classification.reviewerId`、`qa.*`。这些是过程对象，公开会把内部流程暴露成攻击面，而且对 Agent 无用。若要体现「有人审核过」，用一个布尔或一个匿名化的 `reviewRound` 即可。

#### 端点三：`GET /site/{entryId}.md`（DESIGN.md 渲染）

抄 Google Labs 规范的两层结构，但**在 frontmatter 里合法扩展出处三件套**（YAML 允许额外 key，不破坏兼容）：

```markdown
---
version: "3"
name: 21st.dev
description: 社区 UI 注册表，12,000+ 组件/模板/shadcn 主题
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://21st.dev/
checkedAt: 2026-09-01T07:36:27.507Z
license: 21st Marketplace Terms (per-author underlying licenses)
licenseEvidence: https://21st.dev/terms
confidence: 1
---

## Overview
（editorial.descriptionZh）

## Do's and Don'ts
- 不要假设站上组件是统一 MIT。逐条确认作者授权。
- 不要批量抓取；免费层每日复制次数受限。
```

**为什么这个格式值得在 v1 就做**：DESIGN.md 有 Google Labs 的 Apache-2.0 规范、26.3k stars、Stitch 这个持续投入的大厂消费者，以及至少三家在做目录的产品（§C）。**VisLexicon 输出 DESIGN.md 等于免费接入一个已成型的消费端。** 而在 frontmatter 里加 `source` / `checkedAt` / `license`，等于**在别人的标准里插入自己的差异化字段**——如果这个扩展被别人抄走，那 VisLexicon 就赢了标准之争；如果没被抄走，VisLexicon 仍然是唯一带出处的 DESIGN.md 生产者。这是一个没有下行风险的动作。

#### 端点四（20 分钟，只当信号）：`/llms.txt`

```
# VisLexicon

> 会查证的视觉知识层。每个条目由人工进站核验，带来源 URL、许可证证据与核验时间戳。

## 机器接口
- [注册表索引](https://vislexicon.com/r/registry.json): 全部已审核条目的轻量索引，含许可证、访问方式与核验时间
- [条目 schema](https://vislexicon.com/schema/registry-item.json)

## 已审核条目
- [21st.dev](https://vislexicon.com/r/21st-dev.json): 社区 UI 注册表；无统一 SPDX 许可

## Optional
- [方法论与进度](https://vislexicon.com/about)
```

按 llmstxt.org 的结构（H1 → blockquote → H2 分节 → Optional 节）。**不要为它做任何自动化投入**——证据表明前沿 AI 爬虫 0 抓取（§5.2）。

### 6.2 哪些 Agent 功能应该推迟

| 功能 | 判断 | 理由（附证据） |
|---|---|---|
| **MCP server** | **推迟到有真实调用需求** | 需要运行时、鉴权、限流、版本；Framer 已公开表示不需要 MCP（§D3）；同类内容型产品（Refero）用 MCP 主要是为了收费墙，VisLexicon 不打算收费墙 |
| **搜索 API / 语义检索端点** | **推迟** | 6 个已发布条目做搜索 API 是荒谬的。索引端点足够 Agent 自己过滤。等到条目过 200 再说 |
| **Skill 包** | **v1.5** | 零运行时、跨 20+ agent，但需要先有稳定的 JSON 端点作为它教 Agent 去调用的对象。顺序是 JSON → Skill |
| **代码导出 / 组件级 registry** | **推迟或不做** | VisLexicon 不托管代码。做了就要面对许可证再分发问题，恰好是自己在攻击的靶心。让 `agentGuidance.safeToRedistributeCode` 说话就够了 |
| **「分析任意 URL → DESIGN.md」在线工具** | **推迟** | 简报 11 节和 v2 都提到。但 Refero Styles（2,000+）、getdesign.md（550+）已经在做，且做的是自动提取。VisLexicon 的优势是人工核验，自动提取会稀释这个优势。**先把 6→60 条人工核验条目做出来，再考虑工具** |
| **写入型接口（Agent 提交条目）** | **推迟** | v2 已建议提交降级为页脚查重框。Agent 写入会直接污染「人工核验」这个唯一资产 |
| **动态预览 / iframe 实时快照** | **推迟** | v2 §8 已有边界判断；且对 Agent 无用（Agent 消费的是 `pages[].shot` 的静态 URL + alt + selectionRationale） |

### 6.3 差异点是否成立？—— **半成立，必须重述**

**原表述（v2 §3.2）**：「Agent 故事是真差异化（有证据、有许可边界的结构化设计上下文，市面上没有）」。

**本轮调研的裁决**：

❌ **「结构化设计上下文，市面上没有」——这句已经错了。** 证据：
- Refero Styles：2,000+ 站的 AI-readable design system + 官方 MCP（5 类工具）+ Skill（§C2）
- getdesign.md：550+ 站的 DESIGN.md 目录 + Catalog Pass（§C3）
- designmd.app：562 个 DESIGN.md，按美学流派组织（§C4）
- DESIGN.md 本身已是 Google Labs 的 Apache-2.0 规范，26.3k stars（§C1）
- zeroheight / Supernova：企业侧的设计系统上下文 MCP，且 zeroheight 已在用「validated / reviewed by your team」当卖点（§D5）

**如果 Ben 继续用「市面上没有」这句话对外说，会在第一个懂行的人面前失去信用。必须改。**

✅ **「有证据、有许可边界」——这半句成立，而且比原来想的更强。** 证据（就是 §3.1 矩阵的最后三列全空）：

1. **没有任何一家把「每条断言的 sourceUrl + evidence + confidence」做成字段。** Refero 说自己基于「real product evidence」，但那是产品叙事，不是数据结构——它的 MCP 返回的是风格参数，不是「这个结论来自哪个 URL 的哪句话」。
2. **没有任何一家把许可证做成一等的、可机器筛选的字段。** shadcn 的 `registry-item.json` 没有 license 字段（§A1）；21st.dev 的许可证碎片到「无统一 SPDX」（§A2）；Uiverse 的 MIT 只是首页一句话，`/license` 路径 404（§A6）；Hover.dev 的「禁止再分发」只写在页脚（§A5）。
3. **没有任何一家有核验时间戳。** 而 Origin UI → Coss 的案例（§A4）证明了这个字段的实际价值：一年之内，域名 302、归属变更（并入 Cal.com）、许可证从单一 MIT 变成 **MIT/AGPLv3 混合**。**任何不带时间戳的设计资源目录，此刻正在传播错误的许可证信息。**
4. **混合许可证根本无法被现有协议表达。** `apps/origin/` MIT + 其余 AGPLv3——shadcn 的 registry schema、DESIGN.md 的 YAML、Refero 的 MCP 返回值，没有一个能表达「这个仓库里 A 目录和 B 目录许可证不同」。VisLexicon 的 `facts[{field:"license", value, sourceUrl, evidence}]` 可以。

**重述后的差异化表述（建议直接用这一句）**：

> **市面上已经有好几家在把设计知识喂给 Agent，但没有一家能回答「这个结论出自哪里、什么时候核验的、我拿来用是否合法」。VisLexicon 做的是可审计的那一份。**

**这句话的三个支撑动作，都必须在 v1 的界面上可见**：
- 卡片上显示 `checkedAt`（不是详情页角落的小字）
- 卡片上显示许可证状态徽标（`MIT` / `混合` / `禁止再分发` / `未知`）——**注意 v3 规格明确要求找不到必须是 `unknown`，不得猜**，这个「诚实的空值」本身就是差异化
- 详情页每条事实旁边有可点的 `sourceUrl`

**一个额外的战术建议**：把 Origin UI → Coss 这个案例做成 about 页上的一个具体故事（「我们的核验时间戳做了什么」）。它比任何抽象的方法论陈述都有说服力，而且是 Ben 自己的数据里真实发生的事——`content-samples/approved-v3/origin-ui.json` 现在指向一个 302。**诚实地展示「我们的一条已审核记录过期了，以及我们怎么发现的」，比展示 8,684 个候选站更能建立信任。**

### 6.4 三个不在 v2 反馈里、但本轮调研得出的补充建议

1. **图鉴的 AI 界面部分应该对齐现有权威词表，并注明来源。** Vercel AI Elements（Conversation / Message / Prompt Input / Sources / Reasoning / Chain of Thought / Task / Plan / Artifact / File Tree …）和 LiveKit Agents UI（AgentControlBar / AgentAudioVisualizer{Bar,Grid,Radial,Wave,Aura} / AgentChatTranscript …）已经把名字钉死了。**VisLexicon 图鉴每个 AI 界面词条应该有一个 `alsoKnownAs` 或 `standardizedBy` 字段指向这些来源**——这既符合 v3 规格 4.2「不得自由造同义词」，又让图鉴从「Ben 的命名」升级成「跨来源的命名对照表」，后者的价值高一个量级。

2. **卡片必须有可执行动作，不能只有「打开」。** 21st.dev（Copy prompt）、Uiverse（Get code）、shoogle（Add）、skills.sh（npx skills add）——2026 年同类产品的卡片全部在卡片层给动作。VisLexicon 卡片至少要有「复制为 Agent 上下文」（复制 `/site/{id}.md` 的内容或其 URL）。

3. **`counts` 字段要诚实分层，并放进公开端点。** 简报硬约束说「12 和 220 不是生产总量」。**把 approved / candidate / atlasTerms / atlasTermsWithLocalDemo 分开写进 `/r/registry.json` 的 `counts`**——这让「诚实」从一句人话变成一个机器可校验的字段。目前没有任何竞品在机器接口里公开自己的「未审核候选池」规模。这是一个几乎零成本、但极难被抄袭的信任动作（抄它意味着要公开承认自己有多少半成品）。

---

## 附录：来源清单（全部访问日期 2026-09-05）

**注册表与协议**
- https://ui.shadcn.com/docs/registry/registry-item-json — registry-item schema
- https://ui.shadcn.com/docs/registry/registry-json — registry.json schema
- https://ui.shadcn.com/docs/registry/namespace — 命名空间与鉴权
- https://ui.shadcn.com/docs/registry/api-reference — HTTP 路径约定
- https://ui.shadcn.com/docs/mcp — MCP 安装
- https://raw.githubusercontent.com/shadcn-ui/ui/main/skills/shadcn/mcp.md — **7 个 MCP 工具名（逐字）**
- https://ui.shadcn.com/docs/directory — Registry Directory
- https://shoogle.dev/directory — 292 个第三方注册表
- https://x.com/shadcn/status/1983190491052245002 — Registry Directory 发布

**组件站**
- https://21st.dev/ ; https://21st.dev/pricing ; https://21st.dev/mcp ; https://21st.dev/terms
- https://github.com/21st-dev/magic-mcp/blob/main/README.md ; https://github.com/21st-dev/agent-elements
- https://magicui.design/ ; https://magicui.design/docs/mcp ; https://github.com/magicuidesign/magicui
- https://originui.com/ （**302 → https://coss.com/ui**）; https://coss.com/ui ; https://github.com/cosscom/coss
- https://x.com/coss_com/status/1976668768312123777 ; https://x.com/pacovitiello/status/1976672108139921707
- https://www.hover.dev/ ; https://uiverse.io/ （`/license`、`/licence`、`/licenses`、`/faq` 均 404）
- https://ui.aceternity.com/ （`/mcp` 返回 404）; https://github.com/rudra016/aceternityui-mcp
- https://www.cult-ui.com/ ; https://animata.design/

**AI / Agent 界面组件**
- https://elements.ai-sdk.dev/ （由 https://ai-sdk.dev/elements/overview 302 而来）
- https://www.assistant-ui.com/ ; https://github.com/ibelick/prompt-kit （官网 403）
- https://docs.livekit.io/frontends/agents-ui/ ; https://docs.copilotkit.ai/

**DESIGN.md 生态**
- https://github.com/google-labs-code/design.md — **规范本体，Apache-2.0，26.3k stars**
- https://stitch.withgoogle.com/docs/design-md/specification （正文未取回）
- https://styles.refero.design/ ; https://doc.refero.design/mcp/getting-started — **Refero MCP 五类工具、付费门槛、8,000 calls/月**
- https://github.com/faridjafarlee/refero-styles-mcp-server/blob/main/README.md — 第三方 MCP 四工具
- https://getdesign.md/ ; https://getdesign.md/state-of-design-md ; https://designmd.app/
- https://styles.refero.design/design-md/design-md-template

**设计工具的 Agent 接口**
- https://developers.figma.com/docs/figma-mcp-server/ ; https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server ; https://deepwiki.com/figma/mcp-server-guide/5-tools-reference
- https://developers.webflow.com/mcp/reference/overview
- https://www.framer.com/help/articles/use-external-agents-with-framer/ — **「Framer doesn't require a separate MCP server」**
- https://stitch.withgoogle.com/ （仅 meta）; https://vibecoding.app/blog/google-stitch-review （2026-06-17）
- https://zeroheight.com/mcp/ ; https://www.supernova.io/for-ai ; https://slidespeak.co/blog/best-design-mcp-servers （2026-06-10）
- https://v0.app/docs/design-systems-legacy ; https://v0.app/docs/design-systems-2 ; https://docs.lovable.dev/features/design-systems

**Agent 基础设施与规范**
- https://llmstxt.org/ — 规范结构
- https://www.digitalapplied.com/blog/llms-txt-in-practice-adoption-evidence-2026 — **1,227 次请求中 AI 实验室爬虫 0 次**
- https://skills.sh/ ; https://vercel.com/docs/agent-resources/skills — **1,299,814 次安装；markdown+frontmatter 渲染**
- https://context7.com/ ; https://context7.com/plans ; https://cursor.directory/

**本地上下文**
- `/root/workspace/research/_BRIEF-for-agents.md`
- `/root/workspace/VisLexicon-browser-design-kit/context/01-design-review-brief.md`（§2、4.1、4.10、12）
- `/root/workspace/VisLexicon-browser-design-kit/context/02-latest-design-feedback-v2.md`（§3.2）
- `/root/workspace/VisLexicon-browser-design-kit/context/05-site-entry-taxonomy-v3.md`（§4 切面轴、§11 代码合同）
- `/root/workspace/VisLexicon-browser-design-kit/content-samples/approved-v3/21st-dev.json`（JSON 草案的字段依据）

---

## 未核实清单（诚实声明）

以下事项本轮**未能核实**，不应作为决策依据：

1. **所有产品的移动端行为**——无浏览器/视口能力，未做任何设备验证。
2. **原始 registry JSON 响应**——`curl` 被代理拒绝，`ui.shadcn.com/r/button.json` 等 WebFetch 返回 404 或空，所有 JSON 形状均由文档字段说明还原。
3. **Aceternity UI 是否有官方 MCP**——首页宣称有，`/mcp` 路径 404，能找到的都是第三方实现。
4. **Uiverse 的逐字许可证文本**——四个候选路径全部 404，只有首页一句 MIT 声明。
5. **Context7 的 MCP 工具名**（`resolve-library-id` / `get-library-docs`）——官网页面未确认。
6. **getdesign.md 声称的「102K+ GitHub stars」**——与 google-labs-code/design.md 页面显示的 26.3k 矛盾，不采信。
7. **Refero Styles 的规模**——官网称 2,000+，第三方 MCP README 称通过 API 只拉到 ~60 个（3 页），差距未解释。
8. **llmstxt.org 摘要中的「Chrome Lighthouse 审计 llms.txt」与 v2 发布日期**——未独立核实，不采信。
9. **AI Elements / LiveKit Agents UI 的具体 LICENSE 文件**——仅页面提及，未打开仓库 LICENSE。
10. **zeroheight MCP 的工具名、计划要求与上线日期**；**Supernova 的具体定价**。
