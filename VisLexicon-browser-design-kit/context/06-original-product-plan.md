# VisLexicon（视元）完整方案

> 一句话定位：**给人类用的"前端视觉选型器"，给 Agent 用的"设计上下文供给站"。**
> 人在这里"挑"，Agent 从这里"取"。挑的结果不是灵感，而是一份可执行的精确规格（Design Spec）。

---

## 0. 先纠正原始思路里的三个偏差

在展开方案之前，必须先把想法里三个隐含的错误假设摆正，否则后面全部工程都会歪：

**偏差一：以为产品是"聚合站"。**
聚合站（awesome-list 网页版）没有护城河，且已有大量竞品（uiverse.io、21st.dev、Mobbin、Godly、Awwwards、Component Party 等）。真正的空白不是"收集"，而是**"收集之后的结构化"**：把散乱资产收敛到一套受控词表（Controlled Vocabulary）上，并以机器可读的方式分发给 Agent。**词表 + 标注数据 + 分发协议才是产品，聚合只是原料采购。**

**偏差二：以为核心交付物是"代码"或"图"。**
用户最终要的既不是一张图也不是一段复制来的代码，而是**"我的 Agent 能一次做对"**。所以本站真正的输出物是一份**Design Spec（设计规格 JSON + 高清资产 URL 集）**——用户在站内点选、组合，站点生成规格，用户把一个链接丢给自己的 Agent，Agent 拉取规格与图像后进行 visual coding。图和代码都是规格的附件。

**偏差三：以为"把小红书/X 的图搬过来"是可行的。**
中心化抓取并二次分发社交平台图片，在版权和反爬两个维度上都是死路（详见 §9 法律架构）。正确做法是**"元数据中心化、像素分发去中心化"**：平台只存标签、嵌入向量、缩略图和原始链接；高清原图由**用户侧的开源取图组件（MCP Server / CLI / Skill）在用户机器上实时从源站获取**。这一个架构决策同时解决了版权、存储成本和反爬三个问题，是全方案最重要的一步棋。

---

## 1. 问题定义与价值主张

### 1.1 断层在哪里

| 环节 | 现状 | 痛点 |
|---|---|---|
| 想要什么 | 普通人视野有限，不知道好设计长什么样 | 见识不足 → 目标模糊 |
| 说出想要什么 | 自然语言描述交互/动效/排版极其低效 | 语义鸿沟："那种滑过去有点弹的感觉" |
| 找到参考 | 资产散落在几十个组件库、GitHub、社交平台 | 检索成本高，且找到的东西不可复用 |
| 交给 AI 做 | 把模糊描述丢给 Agent，产出平庸的"AI 味"页面 | 上下文里没有精确视觉信号 |
| 验收 | 用户说"不对，再改改" | 无标准，无限返工 |

### 1.2 VisLexicon 在每一环的解法

1. **见识**：视觉词典 + 灵感画廊，让用户"逛出"品味；
2. **表达**：每个视觉现象绑定行业标准术语 + 可交互演示，用户**点选代替描述**；
3. **检索**：全网开源组件库/GitHub 项目/社媒设计的统一索引，支持文字、图搜、"氛围"语义搜索；
4. **交付**：一键生成 Design Spec + Agent 可直读的高清资产端点（MCP / JSON API / llms.txt）；
5. **验收**：Spec 本身就是验收清单（断点、色板、动效参数逐项可核对）。

### 1.3 目标用户（按优先级）

- **P0：用 Claude Code / Cursor / Copilot 做前端的开发者与独立开发者**——付费意愿最强、传播最快、对 Agent 协议有真实需求；
- **P1：用 AI 建站的非程序员**（做落地页、作品集、小工具的人）——量大，需要"点选式"降门槛；
- **P2：设计师**——反向使用：用词典跟开发/AI 对齐术语；
- **P3：下游 Agent 本身**——长期看，Agent 是流量主体（AEO：Agent Engine Optimization，见 §11.4）。

---

## 2. 产品总体架构：四层模型

```
┌─────────────────────────────────────────────────────┐
│  L4 分发层  Agent Protocol（MCP Server / JSON API /  │
│            llms.txt / 用户侧取图组件）                │
├─────────────────────────────────────────────────────┤
│  L3 组装层  选型器 Configurator → Design Spec 生成    │
│            （用户点选 → 输出精确规格）                 │
├─────────────────────────────────────────────────────┤
│  L2 资产层  三大资产库：                              │
│            A 视觉词典  B 开源生态索引  C 灵感画廊      │
├─────────────────────────────────────────────────────┤
│  L1 本体层  受控词表 / 分类学 / 标注 Schema / 嵌入向量 │
└─────────────────────────────────────────────────────┘
```

L1 是护城河，L2 是内容，L3 是用户价值兑现点，L4 是增长引擎。以下逐层展开。

---

## 3. L1 本体层：受控词表与分类学（全方案的地基）

### 3.1 五轴分类体系

任何一个前端视觉资产，都用五个正交维度标注（一个资产可有多值）：

1. **Layout（布局模式）**：Bento Grid、Masonry、Split-Screen、Sticky Scroll Sections、Floating Dock、Sidebar Shell、Holy Grail、Card Stack、Timeline、Kanban…
2. **Interaction（交互/微动效）**：Hover Tilt / 3D Card、Magnetic Button、Text Scramble、Shimmer/Skeleton、Parallax、Scroll-Triggered Reveal、Marquee、Cursor Follower、Drag-to-Reorder、Infinite Scroll…
3. **Aesthetic（美学风格）**：Glassmorphism、Neo-Brutalism、Minimal Flat、Skeuomorphism、Cyberpunk/Terminal、Editorial/杂志风、Claymorphism、Aurora/Gradient Mesh、Swiss/International…
4. **Motion（动效技术特征）**：Spring 物理、Stagger 序列、FLIP、Morphing、Scroll-Linked（scrub）、View Transitions、Lottie、WebGL/Shader（Raymarching、Particle、Liquid Distortion）…
5. **Component（组件类型）**：Hero、Pricing Table、Navbar、Testimonial、Feature Grid、Footer、Form、Modal、Toast、Chart、Onboarding…

另加三个**属性轴**（非分类，是元数据）：技术栈依赖（React/Vue/Svelte/纯 CSS）、样式方案（Tailwind/vanilla/CSS-in-JS）、动效库（Framer Motion/GSAP/Three.js/anime.js/Lenis）。

### 3.2 词条 Schema（每个术语一个词条）

```yaml
id: glassmorphism            # 全站唯一 slug，永不变更
term_en: Glassmorphism
term_zh: 毛玻璃拟态
aliases: [frosted glass, 磨砂玻璃, backdrop blur 卡片]   # 同义词收敛，搜索全部命中
axis: aesthetic
definition_zh: <=80字的严格定义
definition_en: ...
demo: /demos/glassmorphism   # 可交互 iframe 实时演示（见 3.4）
media:
  poster: cdn://lexicon/glassmorphism/poster@2x.png     # 静态帧
  clip: cdn://lexicon/glassmorphism/loop.webm           # 3-6 秒循环
  keyframes: [f0.png, f1.png, f2.png, f3.png]           # 供不能看视频的 VLM 用
minimal_code:                # 最小可运行实现，MIT 授权，站方自写
  css: |
    .glass { backdrop-filter: blur(16px); background: rgb(255 255 255 / .08); ... }
tech_notes: 浏览器兼容性、性能陷阱（backdrop-filter 合成层开销）、无障碍注意点
common_pairings: [aurora-background, bento-grid]        # 常见搭配，用于推荐
anti_patterns: 低对比度文字可读性问题…                     # 什么时候不该用
related: [claymorphism, neumorphism]
sources: [首次流行出处、代表作品链接]
```

**关键决策：每个词条的演示必须是"真代码 iframe 实时渲染"，而不是录屏 GIF。** 演示即实现——用户看到的效果和 `minimal_code` 是同一份代码，杜绝"演示很美、代码做不出来"的欺骗感；同时录屏会过时，代码可持续维护。

### 3.3 词表怎么建（冷启动数据来源）

- 系统性扫描：Awwwards/CSSDA 获奖作品的技术拆解文章、ui-patterns.com、Mobbin 的 pattern 分类、CodePen 热门 tag、各大组件库（Aceternity、Magic UI、uiverse）的组件命名、Laws of UX、Google Material / Apple HIG 的模式命名；
- 中文侧：收集小红书/掘金上高赞"这个效果叫什么"类内容，反向建立**中文口语 → 标准术语**的别名映射（这是中文市场独有价值：别名表本身就是搜索引擎）；
- 规模节奏：首发 **150–200 词条**（每轴 30–40 个）即可覆盖 90% 日常需求，宁缺毋滥；之后每周 +5，由社区提交 + 编辑审核。

### 3.4 词条生产流水线（内部工具）

1. 编辑在 issue 里立项（术语、轴、参考链接）→ 2. 用 Claude Code + frontend-design skill 生成 minimal demo → 3. 人工审美验收（这一步不能省，是品味质检）→ 4. Playwright 自动截 poster/keyframes、录 webm → 5. 生成嵌入向量入库 → 6. 上线。
每步产物入 Git（词条数据本身开源，见 §10.2）。

---

## 4. L2-A 资产库一：视觉词典（面向"表达"）

即 §3 词条的前台呈现。页面结构：

- **词典首页**：五轴切换 + 瀑布流演示卡（卡片本身就是 live iframe，hover 播放）；
- **词条详情页**：演示（可调参数：如 blur 半径滑块）→ 定义 → 最小代码（一键复制）→ 使用该模式的真实案例（联动 L2-B/C）→ 常见搭配 → 反模式警告 → "加入我的 Spec"按钮（联动 L3）；
- **对比页**：容易混淆的词条并排（Glassmorphism vs Neumorphism vs Claymorphism），这是 SEO 利器；
- **每个词条页底部固定一个"复制给 Agent"块**：一段包含该词条 JSON 端点 URL 的短文本，用户粘贴给自己的 AI 即可。

**别人没想到的点：词条页要做"参数可玩"。** 用户拖滑块把 blur 从 8px 调到 24px、把 spring stiffness 从 100 调到 400，实时看效果——调完的参数值直接进 Spec。这把"挑"从二元选择升级为连续空间上的精确定位，是纯图库做不到的。

---

## 5. L2-B 资产库二：开源生态索引（面向"检索复用"）

### 5.1 索引对象

- **组件库整站**：Appica、Aceternity、Magic UI、uiverse、21st.dev、shadcn 生态变体、Hover.dev、Animata…（首发 50 个库）；
- **GitHub 仓库**：动效实现、模板、starter、优秀个人站源码；
- **AI 资产**：前端相关的 Claude Code skills、Cursor rules、系统提示词——这是市面聚合站都没做的增量（前端 Prompt/Skill Registry）；
- **单组件粒度**：库要拆到组件级索引（"Aceternity 的 3D Card"是一条记录，不是"Aceternity"是一条）。

### 5.2 每条记录的元数据

```json
{
  "id": "aceternity/3d-card-effect",
  "type": "component",
  "title": "3D Card Effect",
  "source": {"site": "aceternity", "url": "...", "repo": "...", "license": "MIT"},
  "tags": ["interaction:hover-tilt", "component:card"],      // 必须映射到 L1 词表
  "stack": {"framework": "react", "style": "tailwind", "motion": "framer-motion"},
  "install": "npx shadcn add https://.../3d-card.json",       // 一键安装指令（若有）
  "raw_links": ["https://raw.githubusercontent.com/..."],     // 源文件直链（仅宽松许可证）
  "screenshots": {"desktop@2x": "...", "keyframes": ["..."]},  // 站方自截，统一规格
  "health": {"last_verified": "2026-08-20", "stars": 18200, "maintained": true},
  "license_gate": "green"    // green=可直接给代码 / yellow=仅链接 / red=仅收录名字
}
```

### 5.3 采集与保鲜流水线

1. **发现**：GitHub API 定期搜索（topic: ui/animation/tailwind-components 等）+ 人工提名 + 社区提交；
2. **准入**：编辑打分（设计质量 ≥ 阈值才收录——**策展是价值，全收录是垃圾场**）；
3. **截图工厂**：Playwright 集群，统一规格截图——1440×900 桌面 / 390×844 移动、DPR 2、亮暗两套主题、动效取 4 关键帧。**统一规格是给 VLM 喂图的前提**（各站自己的宣传图尺寸风格混乱，模型读起来噪声大）；
4. **标注**：VLM 预标注（把截图 + L1 词表喂给 Claude 打 tags）→ 人工抽检 20% → 争议项进标注队列；
5. **保鲜**：每周 CI 巡检死链、license 变更、仓库归档状态；失效条目降权并标记，而非直接删除（Agent 可能还缓存着它的 ID）。

### 5.4 许可证分级（license_gate）

- **green**（MIT/Apache/ISC）：可镜像 raw 代码、可入 Spec 直接引用；
- **yellow**（GPL/自定义"个人免费"/未声明）：只给链接和截图，不镜像代码，Spec 中标注"需自行确认授权"；
- **red**（明确禁止再分发）：只收录名称与外链。
这个分级要在 UI 上显式展示——它同时是对用户的合规提醒和对源作者的尊重，能换来源站方的好感与合作（见 §10.3）。

---

## 6. L2-C 资产库三：灵感画廊（面向"见识与筛选"）

### 6.1 内容形态

社媒（小红书/X/Dribbble/Behance）上的成品设计图与帖子。**平台侧只存**：

- 缩略图（≤480px，注明来源水印，属评论/索引性质合理使用范畴）；
- 原帖链接 + 作者署名 + 抓取时间；
- L1 词表标签 + CLIP 嵌入向量 + 提取的设计要素（主色板、字体猜测、布局骨架）；
- **不存高清原图**（见 §9）。

### 6.2 高清图如何到达用户的 Agent（核心机制）

发布开源组件 **`vislexicon-reader`**（同一逻辑三种形态：MCP Server / CLI / Claude Code Skill）：

1. 用户在画廊选中案例，复制形如 `https://vislexicon.dev/i/abc123` 的链接给自己的 Agent；
2. Agent 调用本地 `vislexicon-reader`，reader 向平台请求该 ID 的**清单**（原帖 URL 列表 + 平台侧元数据 + Spec）；
3. reader **在用户机器上**用带浏览器指纹的抓取逻辑从源站实时取回高清原图，直接以 base64/本地临时文件喂给 VLM——不落地到用户项目目录，不经过平台服务器；
4. 取图失败（原帖删除/反爬升级）时，reader 回退到平台缩略图 + 结构化 spec，并明确告知 Agent"图为低清，以 spec 字段为准"。

**这个架构的四重收益**：平台不二次分发原图（版权风险最小化）；平台无图片存储与带宽成本；抓取压力分散在用户端（不会因平台 IP 被封而全站瘫痪）；reader 组件本身是开源的获客入口（开发者装 MCP 的动作 = 转化）。

### 6.3 采集与合规姿势

- 优先**作者投稿/授权**：做"作者主页"功能，给设计师导流（署名 + 反链 + 数据看板），把"被抓取"变成"愿意入驻"——长期唯一可持续路线；
- 抓取仅限公开内容，尊重 robots 与平台 ToS 的灰度现实：小红书侧建议以"用户手动分享链接进画廊"（书签制）为主而非全量爬取；
- DMCA/删除通道：作者一键下架，24h 内响应，全站声明。

---

## 7. L3 组装层：选型器与 Design Spec（价值兑现点）

### 7.1 用户流程

```
浏览词典/画廊 → 把中意的词条、组件、案例"加入购物车"（My Board）
→ 选型器引导补全：目标页面类型？亮暗主题？品牌色？目标框架？
→ 冲突检测（选了 Neo-Brutalism 又选 Glassmorphism？提示美学冲突并给融合建议）
→ 生成 Design Spec（一个短链 + JSON 端点）
→ 用户把短链丢给自己的 Agent："按这个 spec 实现"
```

### 7.2 Design Spec Schema（v1）

```json
{
  "spec_version": "1.0",
  "spec_id": "sp_9f3k2",
  "intent": "SaaS landing page, dark, developer-tool vibe",
  "target": {"framework": "next.js", "style": "tailwind", "motion": "framer-motion"},
  "aesthetic": {"primary": "lex:minimal-dark", "accents": ["lex:aurora-background"]},
  "layout": [
    {"section": "hero", "pattern": "lex:split-screen", "ref_assets": ["i/abc123"]},
    {"section": "features", "pattern": "lex:bento-grid", "ref_components": ["magicui/bento-grid"]}
  ],
  "interactions": [
    {"target": "cta-button", "pattern": "lex:magnetic-button",
     "params": {"strength": 0.3, "spring": {"stiffness": 260, "damping": 20}}}
  ],
  "tokens": {
    "colors": {"bg": "#0A0A0B", "accent": "#6E56CF"},
    "type": {"heading": "Geist Sans", "body": "Inter"},
    "radius": "12px", "breakpoints": ["sm:640", "md:768", "lg:1024", "xl:1280"]
  },
  "assets": [{"id": "i/abc123", "fetch_via": "vislexicon-reader", "fallback_thumb": "cdn://..."}],
  "acceptance": [
    "bento grid 在 md 断点降为单列",
    "magnetic button 使用 spring 物理而非 linear ease",
    "对比度满足 WCAG AA"
  ],
  "agent_instructions_url": "https://vislexicon.dev/spec/sp_9f3k2/agent.md"
}
```

要点：

- **`lex:` 前缀引用词表 ID**——Agent 拿到 ID 可回查词条端点获取定义、minimal_code 和关键帧，形成"术语可解引用"的闭环；
- **`params` 携带用户在词条页调好的参数**（§4 的滑块），描述精度从"像那样"提升到具体数值；
- **`acceptance` 是给 Agent 的自检清单**，也是用户的验收清单——直接攻击"无限返工"痛点；
- **`agent_instructions_url`** 返回一份为 LLM 优化的 markdown（阅读顺序、取图方式、分步实现建议），等于把"如何用好这份 spec 的 prompt"也替用户写好了。

### 7.3 反向入口：图搜与"氛围搜索"

- 用户上传任意截图 → CLIP 检索相似案例 + VLM 拆解出词表标签（"你上传的图 = Bento Grid + Glassmorphism + Aurora 背景"）→ 一键生成 Spec 草稿。**这解决了"我在别处看到个好的但说不清"的最高频场景**；
- 自然语言氛围搜索："高级感、冷淡、像瑞士海报" → 嵌入检索 → 返回词条与案例组合。

---

## 8. L4 分发层：Agent Protocol

### 8.1 四个接口，一套数据

1. **MCP Server**（`npx vislexicon-mcp`）：工具集 `search_patterns / get_lexicon_entry / get_component / get_inspiration_bundle / resolve_spec`——开发者装一次，其 Agent 永久可查全库。**这是最高优先级接口**；
2. **纯 JSON API**：每个词条/组件/案例/Spec 都有稳定的 `.json` 端点，无鉴权可读（限流即可），保证任何 Agent 用一个 HTTP GET 就能消费；
3. **llms.txt / llms-full.txt**：站点根目录提供全库术语目录的 LLM 友好索引，让路过的 Agent 自行发现结构；
4. **vislexicon-reader**：用户侧取图组件（§6.2）。

### 8.2 给 VLM 喂图的工程细节（多数人会忽略）

- **分辨率分级**：`@2x` 全图（验收对照用）/ `1024px` 长边（常规阅读）/ `512px`（批量浏览）。清单里标明尺寸与字节数，让 Agent 按自己上下文预算选级别；
- **视频不可依赖**：多数 VLM 不吃视频——所有动效必须同时提供 **4–6 张关键帧序列图**，并在 JSON 中附一行动效的文字化描述（"卡片 hover 时绕 Y 轴倾斜 ≤15°，spring 回弹"）。**关键帧 + 参数文字，比 mp4 对 Agent 有用得多**；
- **图旁必附结构化摘要**：色板、字体猜测、布局骨架（简化 DOM 树），降低 VLM 幻觉——图负责"对不对味"，字段负责"准不准"；
- **稳定 URL 契约**：ID 一旦发布永不复用；资产更新走版本号后缀；404 时端点返回结构化的 `gone` JSON 而非 HTML，Agent 不至于拿 HTML 当数据解析。

---

## 9. 法律与合规架构（生死线，单列一章）

| 资产类型 | 策略 |
|---|---|
| 开源代码/组件 | 按 §5.4 三级许可证门控；镜像时保留 LICENSE 与署名 |
| 站方自制词条 demo/截图 | 自有版权，词条数据以 CC BY-SA 开源（§10.2） |
| 社媒设计图 | 平台只存缩略图+链接+元数据；高清图用户侧实时获取（§6.2）；作者可一键下架 |
| 商标/品牌截图 | 案例中出现真实品牌页面时标注"仅供风格研究，勿复制品牌资产" |

- **主体与部署**：建议海外主体 + 海外部署（Cloudflare/Vercel），中文内容照做，但规避国内 ICP + 内容审核 + 版权环境的复合成本；国内访问速度用 CDN 边缘节点缓解；
- **用户生成内容**：书签/投稿内容进审核队列（VLM 初筛 NSFW/侵权 + 人工复核）；
- **对源站的姿态**：上线前主动给前 50 个组件库作者发邮件说明收录方式与反链机制，把潜在投诉者变成首批传播者。

---

## 10. 增长与护城河

### 10.1 冷启动顺序（先难后易是错的，这里先易后难）

1. **词典先行**：150 词条 + 可玩演示，本身就是可传播的独立产品（"前端效果到底叫什么名字"是社媒天然爆款选题，每个词条都是一条小红书/X 帖子素材）；
2. **MCP 上市集**：发布到 MCP 市场 / Claude Code 插件市场，吃"Agent 工具目录"的早期红利；
3. **索引跟上**：50 个库、~1500 个组件的精标注索引；
4. **画廊最后**：等 reader 组件与作者入驻机制成熟再开放，避免一上来就踩版权雷。

### 10.2 开源策略（数据开源，服务收费）

- **开源**：词表 Schema、全部词条数据（YAML 仓库，CC BY-SA）、vislexicon-reader、MCP Server——开源数据仓库会被别人的 Agent/RAG 引用，每次引用都带回品牌与反链；社区 PR 就是免费标注劳动力；
- **闭源**：嵌入向量库、图搜服务、Spec 生成器、截图工厂、画廊运营数据。

### 10.3 护城河排序（由弱到强）

1. 聚合广度（弱，可复制）→ 2. 统一规格截图库（中，有工程成本）→ 3. **中英别名映射 + 精标注数据集**（强，累积型）→ 4. **Spec 协议被下游 Agent 生态采纳**（最强，标准即护城河）→ 5. 作者入驻网络效应。

### 10.4 商业化（克制，后置）

免费：词典、搜索、每月 N 份 Spec。Pro（$8–12/月）：无限 Spec、图搜、私有 Board、API 高配额。B 端：组件库作者的推广位（明确标注 sponsored）、团队版设计系统私有词表。**前 6 个月不做任何收费，先把 MCP 装机量做起来。**

---

## 11. 技术选型与工程要点

### 11.1 栈

- 前端：Next.js（App Router）+ Tailwind；词条 demo 用独立 iframe 沙箱域（防 XSS 逃逸到主站）；
- 数据：Postgres + pgvector（元数据+嵌入一库搞定，初期不引专门向量库）；全文/中文分词搜索用 Meilisearch；
- 资产：Cloudflare R2 + Images（截图/缩略图/转码）；
- 采集：独立 worker 集群（Playwright + 队列），与主站物理隔离；
- 嵌入：图用 SigLIP/CLIP，文用多语言 embedding 模型；标注用 Claude API（batch 便宜）；
- reader：TypeScript 单包发 npm，MCP/CLI/Skill 三形态共享核心。

### 11.2 容易翻车的工程细节

- iframe demo 的性能：首页几十个 live demo 会卡死——用 IntersectionObserver 懒加载 + 视口外暂停动画 + 静态 poster 占位；
- 截图一致性：字体加载竞态导致截图闪字——Playwright 等 `document.fonts.ready` + 固定字体子集；
- 嵌入漂移：换 embedding 模型版本要全量重算，向量表带 `model_version` 字段从第一天做起；
- 限流分层：匿名 IP / 注册 key / Pro key 三档，Agent 流量的突发性远高于人类，按 token bucket 而非固定窗口。

---

## 12. 分阶段路线图与验收标准

### Phase 0（第 1–6 周）：视觉词典 MVP
- 交付：150 词条（五轴）、live demo、中英别名搜索、每词条 JSON 端点、llms.txt；
- 验收：任选 20 个"说不清的效果"口语描述，词典搜索命中率 ≥ 85%；随机 10 个词条 demo 代码复制即可运行。

### Phase 1（第 7–12 周）：生态索引 + MCP
- 交付：50 库 / ~1500 组件精标注索引、统一截图库、`vislexicon-mcp` 上架；
- 验收：MCP 装机 500+；用 Claude Code 接 MCP 做 5 个真实页面，主观还原度显著优于无 MCP 对照组（内部盲测）。

### Phase 2（第 13–20 周）：选型器 + Design Spec
- 交付：My Board、冲突检测、Spec 生成、agent.md、验收清单；
- 验收：**端到端北极星指标**——招募 20 名测试者（含 10 名非程序员），从"逛"到"Agent 产出可接受页面"的中位耗时 < 30 分钟，且一次生成满意率 ≥ 60%。

### Phase 3（第 21 周起）：灵感画廊 + reader + 图搜
- 交付：书签式画廊、vislexicon-reader、作者入驻、CLIP 图搜与氛围搜索；
- 验收：reader 端到端取图成功率 ≥ 90%；首批 30 位设计师主动入驻。

### 北极星指标
**"Spec 一次成功率"**：用户把 Spec 交给 Agent 后无需大改即接受产出的比例。所有功能迭代都对它负责。

---

## 13. 风险清单与预案

| 风险 | 概率 | 预案 |
|---|---|---|
| 社媒反爬升级导致 reader 失效 | 高 | reader 多策略降级 + 书签制（用户自己看得到就抓得到）+ 作者投稿替代抓取 |
| 版权投诉 | 中 | §9 架构已最小化；24h 下架 SLA；不碰 red 级资产 |
| 21st.dev/Mobbin 等做同类功能 | 中 | 差异点死守：中英别名词表、参数可玩 demo、Spec 协议、用户侧 reader——它们是图库基因，我们是"词表+协议"基因 |
| VLM 进步让"精确描述"不再稀缺 | 低 | 模型越强，越需要高质量结构化上下文；本站从"帮人表达"自然滑向"给 Agent 供数"，价值随模型增强而增强 |
| 词表标注质量滑坡 | 中 | 编辑终审制不放开；社区贡献只进队列不直接上线；每季度抽检重标 |
| 一个人做不完 | 高 | 严格按 Phase 0→3 顺序，任何时候砍需求先砍后面的 Phase，词典单独也是完整产品 |

---

## 14. 立即可执行的下一步（本周）

1. 建 GitHub org 与 `lexicon-data` 仓库，定稿词条 YAML Schema（§3.2）；
2. 手写前 10 个词条（每轴 2 个）跑通"立项→demo→截图→上线"流水线，度量单词条工时；
3. 注册域名，部署词典静态站骨架 + llms.txt；
4. 列出首批 50 个组件库清单，逐一记录 license 与 raw 可达性，完成 license_gate 初判；
5. 写 `vislexicon-mcp` 的工具接口草案（先 mock 数据），验证 Claude Code 端的实际调用体验——**协议设计要在数据规模化之前定型**。

---

*文档版本 v1.0 · 2026-08-28 · 后续修订记录追加于此。*
