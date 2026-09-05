# VisLexicon 策展内容生产手册（交给内容 AI 员工）

版本 2026-09-05 · 适用仓库分支 `master`（web 端重设计后）· 作者：Fable（规划）· 样例已落地 3 条

你接手的是**策展**（`#/` 首页与 `#/sites` 全部站点与 `#/site/<id>` 详情）的**内容生产**：把候选站点一条一条做成达到发布标准的条目，并按主题分组罗列。代码与版式已经做好，你不需要改任何 `.jsx`/`.css`；你的产出是 JSON 内容包 + 三张截图 + 分组表里的一行。量大、重复、需要判断，但每一步的标准都写在下面。

---

## 0. 先记住的六条铁律

1. **每个站都要真的进去看。** 脚本可以帮你截图、读标题，不能替你写判断。没进去看过的站不写。
2. **不得虚构。** 站点、数字、许可证、作者、截图、来源链接——凡是写进 JSON 的，必须能在 `sourceUrl` 指向的页面上找到。找不到就写 `"unknown"`，界面会显示「未知」；「未知」是诚实，不是缺陷。
3. **分类、标签、事实证据是三个维度**，分别落在 `classification` / `facets` / `facts`，不要为了好看互相顶替。
4. **候选不能伪装成已审核。** 只有 `status: "APPROVED"` 且通过第 7 节自检的条目才放进 `content-samples/approved-v3/`；半成品放 `content-samples/drafts/`（自行创建），构建脚本不会读它。
5. **人话优先，但事实不变。** `takeawayZh` / `noteZh` / `selectionRationale` 是给人读的，语气见第 4 节；它们改写的是说法，不是事实。
6. **页面上任何数字由数据算出。** 你不需要、也不允许在任何文案里写「收录 N 个站」这类数字。

---

## 1. 仓库里你会碰到的东西

```
VisLexicon-browser-design-kit/
├── content-samples/approved-v3/<entryId>.json   ← 你的主战场：一站一文件
├── frontend/public/shots/<entryId>/v2-identity.png | v2-breadth.png | v2-proof.png  ← 三张截图
├── frontend/src/data/collections.js              ← 首页分组表（一组 = 标题 + 一句 + entryId 列表）
├── frontend/scripts/build-public-data.mjs        ← 投影脚本（只读，不改）：把 JSON 变成前台与 Agent 用的产物
├── frontend/public/data/、public/r/、public/site/、public/llms.txt   ← 构建产物，不手改
└── frontend/docs/verification/                   ← 截图验收产物
```

常用命令（在 `frontend/` 下）：

| 命令 | 作用 |
|---|---|
| `npm run data` | 校验全部 JSON 并重新生成公开产物。**任何一条不合格整个构建失败并指出文件与字段**——这是你的第一道自检 |
| `npm run build` | 完整构建（自动先跑 data） |
| `npm run dev` | 本地预览 |
| `npm run shots -- --label <你的标签> --routes "#/,#/sites,#/site/<entryId>"` | 三档视口（390/768/1440）截图到 `docs/verification/<标签>/`，看版式有没有被你的长文案撑坏 |
| `npm run lint` / `npm run tokens` | 与你无关，但提交前跑一下确认没碰坏 |

---

## 2. 一个条目的完整结构（v3 JSON）

以 `content-samples/approved-v3/uiverse.json` 为范本。字段分四类：**必填（构建期强校验）**、**编辑字段（人话）**、**事实字段（有来源）**、**过程字段（不公开）**。

```jsonc
{
  "schemaVersion": 3,
  "entryId": "uiverse",                 // 必填。小写 kebab-case，稳定不变，是 URL 与截图目录名
  "entityId": "entity-uiverse",         // 同一产品的官网/仓库/旧域名共用一个 entityId（去重用）
  "attemptId": "…",                     // 过程字段，不公开
  "status": "APPROVED",                 // 必填。只有 APPROVED 会进公开产物
  "official": {
    "inputUrl": "https://uiverse.io/",
    "finalUrl": "https://uiverse.io/",  // 必填。跟随重定向后的最终地址
    "checkedAt": "2026-09-01T07:38:55.493Z"   // 必填。你真的进站的时刻（ISO 8601）
  },
  "editorial": {
    "name": "Uiverse",                  // 必填。用官方写法（大小写、斜杠）
    "descriptionZh": "…",               // 正式简介（1–2 句，中性，可含规模/价格/许可），进档案区
    "takeawayZh": "…",                  // 人话一句「你从这里拿走什么」≤ 28 字，上卡片、上详情标题
    "noteZh": "…",                      // 编辑手记 2–4 句，120–180 字，详情页正文主体
    "pricing": "Free"                   // 价格事实；不知道写 "unknown"
  },
  "classification": {
    "recordLevel": "entry",
    "primaryCategory": "ui-implementation",   // 后台字段，前台不渲染；取值见 frontend/src/data/curation-taxonomy.js
    "subcategory": "…",
    "status": "confirmed",
    "reasons": [                         // 必填 ≥1。「为什么收录它」，每条带证据 URL
      { "statement": "…", "evidenceUrl": "https://…" }
    ],
    "curatorId": "…", "reviewerId": "…", "confirmedAt": "…"   // 过程字段；curatorId ≠ reviewerId 才算「独立复核」
  },
  "curation": {
    "atlasTerms": [                      // 这个站示范了图鉴里的哪些术语（可空数组，宁缺勿滥）
      { "stageId": "state-loading", "termId": "atlas-component-component-loader",
        "evidenceUrl": "https://uiverse.io/kennyotsu/fresh-lizard-20", "note": "一句为什么" }
    ],
    "atlasTermsStatus": "editor-draft"   // 没经第二人复核就写 editor-draft，界面显示「编辑草稿」
  },
  "facets": {                            // 必填：12 条轴一条都不能少，没有就给空数组 []
    "scenarios": [], "deliverables": ["component"], "actions": ["browse","copy"],
    "media": ["ui"], "platforms": ["web"], "technologies": ["css"],
    "workflowStages": ["build"], "audiences": ["designer","developer"],
    "access": ["free","open-source"], "licenses": ["MIT"],
    "contentOrganization": ["component-registry"], "languages": ["en"]
  },
  "pages": [                             // 必填：恰好三页，role 各不同，且必须有 identity
    { "role": "identity", "sourceUrl": "https://uiverse.io/", "finalUrl": "https://uiverse.io/",
      "title": "页面 <title>", "selectionRationale": "人话一句：先看什么、为什么",
      "shot": { "src": "/shots/uiverse/v2-identity.png", "sha256": "…", "width": 1280, "height": 900,
                "bytes": 191898, "alt": "一句描述截图里有什么（不是模板句）" } },
    { "role": "breadth", … },
    { "role": "proof",   … }
  ],
  "facts": [                             // 必填 ≥1。每条：字段名 / 值 / 来源 URL / 证据原句
    { "field": "author",     "value": "…", "sourceUrl": "https://…", "evidence": "页面上原话或你看到的具体位置" },
    { "field": "organization","value": "…", "sourceUrl": "…", "evidence": "…" },
    { "field": "repository", "value": "https://github.com/…", "sourceUrl": "…", "evidence": "…" },
    { "field": "license",    "value": "MIT", "sourceUrl": "…", "evidence": "…" },
    { "field": "pricing",    "value": "Free", "sourceUrl": "…", "evidence": "…" }
  ],
  "qa": { … },                           // 过程字段，不公开
  "editorialVoice": { "status": "exemplar" | "written" | "todo", "writtenAt": "YYYY-MM-DD" }
}
```

**取值表在哪**：`facets` 12 条轴与 `primaryCategory` 的合法值全部在 `frontend/src/data/curation-taxonomy.js`；不要发明新值——需要新值时在提交说明里提出，不要直接写进 JSON。

**五个 facts 是最低要求**：author、organization、repository（没有就 `repositoryStatus: "unknown"`）、license、pricing。许可证写 SPDX 短名（`MIT` / `Apache-2.0` / `GPL-3.0`…）；站方自拟条款写 `custom` 并在 `evidence` 里说清限制的是什么；找不到写 `unknown`。**注意许可的覆盖范围**：Apache-2.0 只覆盖仓库源码不覆盖站上内容、MIT 只对 `apps/ui/` 有效之类的限定，必须写进 `evidence`。

---

## 3. 三张截图：各司其职，不是随手三张

| role | 回答的问题 | 通常截哪页 | 反例 |
|---|---|---|---|
| `identity` | 它是谁？ | 首页首屏，或 About/Info 页（当首页信息太少时） | Cookie 横幅盖住一半；登录墙 |
| `breadth` | 它有多大、里面都有什么？ | 目录页 / 组件总览 / 元素瀑布流 | 又截一次首页；空搜索结果 |
| `proof` | 它真的能做到吗？ | 一个具体条目页：一个组件的代码 + 预览、一条定律的完整解释、一个模板的详情 | 泛 AI 文章、404、纯白页 |

技术要求：1280×900 视口首屏（不是全页长图），PNG，存到 `frontend/public/shots/<entryId>/v2-<role>.png`；`shot.width/height/bytes/sha256` 用脚本算并填进去（`sha256sum`、`identify` 或 Node 都行），这四项是可核验性的一部分。三张必须互不重复（不同 URL、不同画面）。`alt` 写画面里有什么（「Elements 页的元素瀑布流，顶部是分类筛选」），不要模板句（「xxx breadth evidence screenshot」）。

出现登录墙 / 地区限制 / 崩溃时：换页；三页凑不齐就不发布（进 drafts，写明卡在哪）。

---

## 4. 人话怎么写：三个字段的语气规范

详情页上给人读的是三样东西，顺序也是这个顺序：`takeawayZh`（标题级一句）→ `noteZh`（正文段）→ 三条 `selectionRationale`（图下一句）。它们决定这个站在读者眼里是「有人看过」还是「数据库导出」。

### 4.1 `takeawayZh`（≤ 28 字）
回答「我从这里拿走什么」，用动词开头或直接说结果，允许带一个限定。不写「一个…平台」这种名词堆。

- ✅ `组件源码直接装进你的项目，之后归你自己改`
- ✅ `一个个小元素，看效果、复制代码，站内统一 MIT`
- ✅ `查一条心理学定律怎么讲、怎么用，看看就好，别拿去商用`
- ❌ `开源 UI 组件库与代码分发平台`（这是 descriptionZh 的活）
- ❌ `高质量精选设计资源`（空话）

### 4.2 `noteZh`（120–180 字，2–4 句）
这是「编辑手记」。写法：**我们进去看到了什么 → 最值得先点开哪里、为什么 → 一句适合谁/不适合谁或一个需要注意的地方（许可、质量参差、还在早期）**。第一人称复数「我们」，具体到页面和元素，句子有长短变化，不用感叹号，不用形容词堆叠，不复述 descriptionZh。

三条样例（已在 JSON 里，照这个密度写）：

> **shadcn/ui** — 我们进去先看首页那组拼好的示例，它把态度说清楚了：这里不给你一个黑盒依赖，而是把组件代码复制进你的仓库，之后怎么改是你的事。组件目录很长，但真正让我们停下来的是 Blocks 页——登录、后台、设置页这些整块界面已经拼好，能直接装。适合想把实现细节握在自己手里的人；如果只想 npm install 完就不管，这里会让你多做一些功课。

> **Uiverse** — 它长得像画廊，其实是代码库。我们随手点开一个社区做的 Loader，页面左边是它在动，右边就是 HTML/CSS，还能导出 React。按钮、卡片、开关、加载器按类别排开，量很大，质量参差是社区库的常态——挑的时候多看两眼。好在页脚写得明白：站内所有 UI 元素都是 MIT，复制走不用犹豫。

> **Laws of UX** — Jon Yablonski 一个人做的参考站，把界面设计常引用的心理学定律一条条整理成卡片。我们点开 Hick’s Law 那页：定义、要点、Google 和 Apple 的真实案例、延伸阅读，一页讲透一条，不啰嗦。适合开会前快速补一句「为什么这么做」。Info 页写明了全站许可是自定条款，限制商业再利用和改编——引用可以，搬走不行；海报和书是另外卖的。

反例（不要这样写）：
- ❌ 「该站点是一个功能强大的组件库，提供了丰富的组件和优秀的用户体验。」（谁都能写，等于没看）
- ❌ 「本站收录 500+ 组件…」（数字要有来源，且不进手记）
- ❌ 「强烈推荐！」「必备神器」（营销腔）
- ❌ 把 `facts` 里五条逐条念一遍（那是档案区的事）

### 4.3 `selectionRationale`（每条 ≤ 40 字）
写成「导览」而不是「说明」：告诉读者点进去先看哪、会看到什么。三条之间用「先看 / 再翻 / 最后开」这类顺序词串起来也可以，但不要机械套。

- ✅ `随便点开一个 Loader：左边在动，右边是源码。这一页就是它「能拿走」的证明。`
- ❌ `单个 Loader 页面同时展示实时效果和可复制的 HTML/CSS 源码。`（正确但像字段说明）

### 4.4 `descriptionZh`（正式简介）
保留中性、完整、1–2 句，可含规模/价格/许可等事实；它在档案区「正式简介」一行，也是 Agent 端点里的 `description` 来源。不要写人话手记的内容进去。

### 4.5 `reasons[].statement`（为什么收录）
一句判断 + 一个证据 URL。说清它凭什么值得占一个位置：「Blocks 页把组件组合成可安装的后台、登录区块，证明它超过单个原语而形成完整套件。」

---

## 5. 分组：`frontend/src/data/collections.js`

首页是**按主题分组罗列**的卡片墙：一组 = `titleZh`（主题：一句话说这类站交付什么）+ `blurbZh`（一句说明，不写数字）+ `entryIds[]`。**不做跨站比较，不写「谁比谁好」。**

规则：
- 一个站可以出现在多个组里（例如 Figma 既是「工具」也是「社区素材」），但同一组里不重复。
- 组名说的是「交付什么 / 用来做什么」，不是资源形态树。已有两组：`组件与区块：拿走就能装进项目`、`参考与规范：先把话说对`。新组的候选方向（成员够 3 个再开）：`图标与字体：拿一套视觉语言`、`动效与微交互：看它怎么动`、`品牌官网与微站：本身就是作品`、`Agent 界面组件：聊天流、工具调用、审批`、`工具：进去做事`、`导航站：帮你找别的站`。
- 每组带 `createdAt`；组是可下架的编辑物。
- 加了新组后跑 `npm run build`：`validateCollections` 会校验 entryId 存在、无重复、每组 ≥1。
- `#/sites` 全部站点页是兜底，任何进了 approved 的站都会在那里出现，不需要你做什么。

---

## 6. 一条从候选到发布的工序（照做）

1. **查重**：在 `approved-v3/` 与 drafts 里搜域名、产品名、GitHub 仓库名。官网 / 文档 / 仓库 / npm / 旧域名是**同一个** entity，只做一条；同名不同物（Pika、Motion、Spectrum）分开做并在 `descriptionZh` 里点明区别。
2. **进站**：用真实浏览器打开 `inputUrl`，记下 `finalUrl` 与当下时间 → `official`。
3. **读懂它**：至少打开首页、目录页、一个具体条目页、About/Pricing/License/页脚。回答四个问题：它是谁、你能拿走什么、它有多大、许可和价格是什么。
4. **五个 facts**：每条都要有 `sourceUrl` + `evidence`（页面原话或你看到的具体位置）。找不到 → `unknown`。
5. **三张截图**：按第 3 节。算 sha256/尺寸/字节，填 `shot`，写非模板 `alt`。
6. **facets 12 轴**：对照 `curation-taxonomy.js` 勾选；没有的轴给 `[]`。`licenses` 与 `facts[license]` 要一致（前者短名，后者可带范围说明）。
7. **写人话**：`takeawayZh` → `noteZh` → 三条 `selectionRationale` → `descriptionZh` → `reasons`。写完对照第 4 节反例自查。
8. **atlasTerms（可选）**：只有目录页明确列出、且能在图鉴 `frontend/src/stages/*/manifest.js` 里找到对应 `termId` 时才标；`evidenceUrl` 必须是本条目已有的 URL 之一；标了就写 `atlasTermsStatus: "editor-draft"`。凑不出就空数组。
9. **复核**：另一个人/另一个 Agent 独立复核 facts 与截图，`reviewerId ≠ curatorId`，通过后 `status: "APPROVED"`，`editorialVoice.status: "written"`。
10. **入组**：在 `collections.js` 加进合适的组（可以不入组，只出现在全部站点）。
11. **构建与看图**：`npm run build` 必须 0 退出；`npm run shots -- --label <entryId> --routes "#/,#/site/<entryId>"`，用眼睛看 390 与 1440：手记会不会太长把浮窗撑得只剩滚动、`takeawayZh` 有没有折成三行、截图有没有被裁。
12. **提交**：`git add content-samples/approved-v3/<id>.json frontend/public/shots/<id>/ frontend/src/data/collections.js frontend/public/` → commit 信息 `content: add <entryId>`。不要 add `frontend/dist/`。

---

## 7. 发布前自检清单（全部为是才可 APPROVED）

- [ ] 我真的打开过 `pages[]` 里的三个 URL，截图是那三页的首屏，三张互不重复
- [ ] 五个 facts 各有 `sourceUrl` 与 `evidence`；不知道的写了 `unknown` 而不是猜
- [ ] `licenses`（短名）与 `facts[license]`（含范围）一致，范围限定写进了 `evidence`
- [ ] `takeawayZh` ≤ 28 字，不是 `descriptionZh` 的截断，不含数字
- [ ] `noteZh` 120–180 字，有「我们看到 / 先点哪 / 注意什么」三个动作，无营销词、无感叹号
- [ ] 三条 `selectionRationale` 读起来像导览，不像字段说明
- [ ] `facets` 12 轴齐全，值都在 taxonomy 里
- [ ] `reasons` ≥1 条且带 `evidenceUrl`
- [ ] `atlasTerms` 里每个 `termId` 在某个 manifest 里存在，`evidenceUrl` 是本条目已有 URL
- [ ] `alt` 不是模板句
- [ ] `npm run build` 退出码 0；三档截图看过
- [ ] 有独立复核人（`reviewerId ≠ curatorId`）

---

## 8. 已知的语料欠账（顺手处理，不要绕过）

- `origin-ui.json`：站点已并入 Cal.com 的 Coss（`finalUrl` 已是 coss.com/ui），但 `entryId` 与截图目录仍叫 `origin-ui`，`facts[license]` 仍写单一 MIT，而现在仓库是 MIT/AGPLv3 混合。需要重新核验后决定：改 id（会连带 URL 与截图目录）还是保留 id 只更新事实。这是 `checkedAt` 价值的最佳实例，可写进关于页。
- `a11y-project.json`：`pages[proof]` 的 `selectionRationale` 提到「可勾选控制」，复看未能确认存在真正的 checkbox，请人工开页核对。
- 9 条条目 `noteZh` 为空（界面显示「编辑手记尚未写」）：21st-dev、magic-ui、origin-ui、hover-dev、entry-chakra-ui-react、entry-ant-design-react、entry-shadcn-studio-blocks、a11y-project、ecomm-design。按第 4 节补写，写完把 `editorialVoice.status` 改为 `written`。
- 部分 `pages[].shot.alt` 是英文模板句（如 ecomm-design），请改为画面描述。
- `facts[].evidence` 里有的条目末尾拼了「；独立复核来源：<url>」，有的没有；新条目统一**不要**在 evidence 里拼复核来源，复核信息走 `reviewerId`。

---

## 9. 你不该碰的东西

`frontend/src/**`（除 `data/collections.js`）、`frontend/src/styles/**`、`frontend/scripts/**`、图鉴相关的一切（`stages/`、`visual-atlas.json`）、`frontend/public/data|r|site|llms.txt`（构建产物）。发现版式问题（例如某条手记把卡片撑破）不要改 CSS，把截图和条目名记在 `frontend/docs/content-issues.md` 里。

## 10. 提问的方式

遇到分类拿不准、许可看不懂、同名产品分不清：**不要猜**。在 `content-samples/drafts/<entryId>.json` 里做到能做的部分，把卡住的问题写进同目录 `<entryId>.questions.md`，继续下一个站。
