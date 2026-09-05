# 跨包契约（波次 1 冻结）

本文件由波次 1 的工作包写入：WP-A 写数据契约，WP-0 写验收脚本用法。后续包只读不改；
需要新增字段或参数，写进各自的完成报告「跨包请求」。

---

## 验收脚本用法（WP-0）

工装位于 `frontend/`：`playwright.config.js`（共享配置）、`scripts/shots.mjs`、
`scripts/a11y-check.mjs`、`scripts/check-tokens.mjs`。浏览器已预装在 `/opt/pw-browsers`，
**不要运行 `playwright install`**；脚本自动从 `PLAYWRIGHT_BROWSERS_PATH`（默认 `/opt/pw-browsers`）
定位 Chromium 可执行文件。依赖是 `playwright-core`（非 `@playwright/test`）。

### 1. `npm run shots` —— 三档视口全页截图

```bash
npm run shots -- --label wp-d                       # 默认六条路由 × 三档视口
npm run shots -- --label wp-f --routes "#/atlas,#/atlas/form-anatomy"
npm run shots -- --label wp-b --reduced-motion      # 以 prefers-reduced-motion: reduce 渲染
```

- 先 `vite build`，再起 `vite preview`（默认端口 4183，`--port` 可改），截完自动关闭。
- 视口固定三档：390×844 / 768×1024 / 1440×900（方案 §9.0 第 4 条）。
- 产物：`frontend/docs/verification/<label>/<route>-<width>.png`（全页）与 `report.json`。
  文件名由 hash 路由推导：`#/` → `home`，`#/site/shadcn-ui` → `site--shadcn-ui`。
- `report.json` 每条记录：`scrollWidth` / `innerWidth` / `horizontalOverflow` / `overflowPx`、
  `consoleErrors` / `pageErrors`、`renderedHash`、`rootHtmlLength`（用于识别「路由没实现、
  静默落回首页」或空白渲染）。
- **本脚本只报告不拦截**（退出码始终 0，除非工装自身崩了）。是否通过由人工看图 +
  `report.json` 判定；请在完成报告里逐张说明。
- 参数：`--label`（默认 `baseline`）、`--routes`（逗号分隔，覆盖默认集）、`--reduced-motion`、`--port`。
- 默认路由集：`#/`、`#/sites`、`#/site/shadcn-ui`、`#/atlas`、`#/atlas/form-anatomy`、`#/about`。
  路由尚未实现时不报错，照样截当前渲染结果。

**重设计前的对照基线已生成**：`frontend/docs/verification/baseline/`（18 张 + `report.json`，
用当前老代码跑出，供改版前后对比）。请勿覆盖这个 label。

### 2. `npm run a11y` —— 键盘可达性检查

```bash
npm run a11y -- --label wp-c
npm run a11y -- --label wp-e --routes "#/site/shadcn-ui" --width 390 --height 844
npm run a11y -- --label wp-x --soft                  # 只报告，不因 error 退出 1
```

- 每条路由 Tab 遍历前 40 个焦点元素（`--max` 可改），输出顺序表：tag / role /
  可访问名 / 焦点环来源（outline / shadow / none）/ 命中区尺寸 / 是否重复。
- error 级：焦点元素命中 `:focus-visible` 却 `outline` 与 `box-shadow` 都是 `none`；
  打开态 `[role=dialog]` 按 Esc 未关闭；导航失败。
- warn 级：无可访问名；命中区任一边 < 24px（触摸目标目标值 44×44，见方案 §7.2.9）。
- 默认视口 1440×900（`--width` / `--height` 可改）。产物 `docs/verification/<label>/a11y.json`，
  终端同时打印人可读摘要。
- **有 error 即退出码 1**（`--soft` 关掉）。焦点陷阱与「关闭态浮层不可 Tab 进入」这两条
  9.0 要求脚本只能部分覆盖（它不会主动打开浮层），仍需人工键盘走一遍。

老代码基线（`docs/verification/baseline/a11y.json`）：error 82、warn 45，主要是 chip
按钮与输入框没有焦点环——这是 WP-B/WP-C 要消掉的存量，不是脚本误报。

### 3. `npm run tokens` —— 设计 token 门禁

```bash
npm run tokens            # 默认：只对基线之外的新增违规退出 1  ← 9.0 第 3 条用这条
npm run tokens:strict     # 全量违规都退出 1（收敛完成后再切）
npm run tokens:baseline   # 重新生成基线快照（改动基线要在完成报告里说明理由）
```

扫描 `frontend/src/**/*.{css,jsx,js}`，豁免 `src/styles/tokens.css`（未来路径，允许暂不存在）。
四类违规：

| kind | 命中什么 |
|---|---|
| `hex` | `#rgb` / `#rgba` / `#rrggbb` / `#rrggbbaa` 颜色字面量（`#root`、`#/site` 这类不会误伤） |
| `colorfn` | `rgb(` / `rgba(` / `hsl(` / `hsla(` 字面量 |
| `fontsize` | `font-size: <数字>px` 与 `fontSize: '<数字>px'` |
| `breakpoint` | `@media` 里非 768 / 1280 / 1440 的 `min-width`，以及任何 `max-width` |

CSS 块注释内的内容不计入。

**基线机制**：`frontend/docs/token-baseline.json` 记录生成时刻的违规，键是
`kind|字面量值` 的**出现次数**（不是文件:行号）——因为 WP-B 会把 `App.css` 拆成
`src/styles/*.css`，用行号做键会把搬家全部误报成新增。默认模式只在某个
`kind|值` 的出现次数**超过基线**时退出 1，并打印超出的种类与全部出现位置。

当前基线（老代码，2026-09-05 生成）：共 2050 条 —— `hex` 1205、`colorfn` 230、
`fontsize` 598、`breakpoint` 17。（方案 §7.3 引用的 469 是 CSS 文件内 hex 的口径，
本脚本口径更宽：含 `.jsx` / `.js` 内联样式，故数值更大。）

**给收敛中的包**：每删掉一个字面量，基线里的计数就多出富余，脚本不会因此报错。
收敛完成后由后续包决定何时把 CI 切到 `npm run tokens:strict`。
已知局限：同一个值「删一个又加一个」净变化为 0 时不会被拦住。

### 4. `npm run lint` 的范围变化（WP-0 顺手改的一处）

`lint` 原为裸 `oxlint`，会连 `node_modules` 一起扫（`oxlint` / `vite` / `picomatch` 已有告警）；
装上 `playwright-core` 后噪声涨到一万一千余条，`npm run lint` 的输出不再可读。
现改为 `oxlint src scripts playwright.config.js`——只扫本仓源码，退出码语义不变（当前 0）。

### 5. 一次完整自检的顺序

```bash
npm run build          # 退出码 0
npm run lint           # 退出码 0
npm run tokens         # 退出码 0（无新增字面量）
npm run shots -- --label <wp>    # 看图：无横向溢出 / 无裁切 / 无重叠
npm run a11y  -- --label <wp>    # 退出码 0，或逐条解释保留的 error
```

---

## 数据契约（WP-A）

生成方式：`node scripts/build-public-data.mjs`（`npm run data`，且已挂在 `prebuild` 上，
`npm run build` 会自动先跑）。输入是 `content-samples/approved-v3/*.json`，
**只投影 `status === "APPROVED"` 的 bundle**，输出全部落在 `frontend/public/` 下。脚本幂等：
每次运行先清空 `public/data/site`、`public/r`、`public/site` 三个目录再整体重写，
唯一会变的字段是 `generatedAt`。

站点根地址由环境变量 `VL_SITE_ORIGIN` 决定，默认 `https://vislexicon.com`。
它只影响 `/r/*.json`、`/site/*.md`、`/llms.txt` 里的绝对 URL；前台层（`/data/*`）一律用站内相对路径。

**定价归一化**：v3 语料里「没查到定价」被写成一句英文元说明（`"Pricing not stated in reviewed facts"`），
它是过程记录不是定价值。投影层把它换成 `"unknown"`，原句放进 `pricingNote`——
前台按「未知」渲染，不要把那句英文印到界面上。当前命中 2 条：`a11y-project`、`ecomm-design`。

**五条硬规则**（构建期断言，违反直接退出码非 0）：

1. `counts.approvedEntries` 由源文件数算出，与常量不符即失败。
2. `facets` 必须齐 12 个轴，缺一轴即失败；投影层原样保留，**绝不合并成 `tags[]`**。
3. `editorial.name`、`official.checkedAt`、`official.finalUrl`、`pages[].selectionRationale`、
   `pages[].sourceUrl`、`facts[]`、`classification.reasons[]` 缺任一即失败。
4. `attemptId` / `curatorId` / `reviewerId` / `qa` 在 `public/` 产物中零出现（写完后自动 grep 复查）。
5. `curation.atlasTerms[].termId` 必须能在 `src/data/visual-atlas.json` 里查到，查不到即失败——
   术语名在构建期解析（见下），前台没有第二个名字来源，漏一条界面上就会印出一串 id。

### 1. `public/data/site-index.json` —— 卡片与列表层（WP-A → WP-D）

顶层：`{ schemaVersion, generatedAt, counts: { approvedEntries }, items[] }`。
`counts` 只有已审核条目数；候选池数字**不出现在浏览层**（方案 §8 第 10 条），只在
`/r/registry.json` 与关于页口径表里。

| 字段 | 类型 | 来源 | 缺失时 |
|---|---|---|---|
| `entryId` | string | `entryId` | 不可缺 |
| `name` | string | `editorial.name` | 不可缺（构建期抛错） |
| `domain` | string \| null | `official.finalUrl` 的 hostname，去掉 `www.` | `null` |
| `homepage` | string | `official.finalUrl`（**不是 `canonicalUrl`**） | 不可缺 |
| `descriptionZh` | string \| null | `editorial.descriptionZh` | `null` |
| `takeawayZh` | string \| null | `editorial.takeawayZh`（WP-H 已补写 12/12） | **`null`** → 前台按 §4.2 显示「未写」标记，不得用简介截断冒充 |
| `noteZh` | string \| null | `editorial.noteZh`（编辑手记，2–4 句人话；当前 3/12 已写） | **`null`** → 详情页显示虚线占位「编辑手记尚未写」，**不得用 `descriptionZh` 顶替** |
| `voiceStatus` | string \| null | `editorialVoice.status`（当前只有 `"exemplar"`） | `null`。**内部盘点用，界面上不渲染任何标记**——不给条目贴「样例」 |
| `facets` | object | `facets` 的 **12 个轴，全部保留**，值均为字符串数组 | 轴缺失即构建失败 |
| `primaryCategory` | string \| null | `classification.primaryCategory` | 后台字段，**前台一处不渲染**（§3.5） |
| `subcategory` | string \| null | `classification.subcategory` | 同上 |
| `license` | string \| null | `facts[field=license].value`（原值，可能很长） | `null` |
| `licenses` | string[] | `facets.licenses`（短、可枚举：`MIT` / `Apache-2.0` / `custom` / `unknown`） | `[]` |
| `licenseSourceUrl` | string \| null | `facts[field=license].sourceUrl` | `null` |
| `access` | string[] | `facets.access` | `[]` |
| `checkedAt` | ISO string | `official.checkedAt` | 不可缺（构建期抛错） |
| `pricing` | string \| null | `editorial.pricing`，**归一化后**：匹配 `/^pricing not (stated\|specified\|available\|disclosed\|found)/i` 的英文元说明一律换成 `"unknown"` | `null` |
| `pricingNote` | string \| null | 被替换掉的原句（仅在归一化发生时非空），保留可追溯性 | `null` |
| `shot` | `{src, alt, width, height}` | `pages[role=identity].shot` | 无 identity 页即构建失败 |
| `atlasTerms` | object[] | `curation.atlasTerms`，每条 `{ stageId, termId, evidenceUrl, note, termEn, termZh }`（后两个由投影层解析，见下） | **`[]`** → 前台不渲染该段 |
| `atlasTermsStatus` | string \| null | `curation.atlasTermsStatus`（当前 12/12 为 `"editor-draft"`） | `null`；前台据此决定是否标「草稿」 |
| `independentlyReviewed` | boolean | `classification.curatorId !== reviewerId` | 缺 ID 时为 `false`；**只投影布尔，不投影 ID** |
| `detailUrl` / `designMdUrl` / `registryUrl` | string | 站内相对路径 | — |

**术语名在构建期解析**（索引层与详情层同一套）：

- `termEn` ← `src/data/visual-atlas.json` 里 `id === termId` 那条的 `termEn`。查不到即构建失败（硬规则 5）。
- `termZh` ← 九台 `manifest.claims[]` 里同 `termId` 的 **`termZhFix`**（人工校订名），没有就是 `null`。
  语料自带的 `termZh` 是机器翻译（`Skeleton` → 「骷髅」），**一律不投影、不上界面**。
  当前 30 条被引用的术语里 15 条有 `termZhFix`。
- 前台按 `termZh ?? termEn` 显示，两个都没有才退回 id。这样详情页不必再静态 import
  674kB 的 `visual-atlas.json`（原先 `SiteDetail` chunk 静态依赖整份图鉴语料）。

卡片微标建议用 `licenses`（`MIT` / `Apache-2.0` / `custom`→自定条款 / `unknown`→未知），
`license` 原值留给详情页与 tooltip。

### 2. `public/data/site/<entryId>.json` —— 详情层（WP-A → WP-E）

顶层：`schemaVersion`、`generatedAt`、`entryId`、`entityId`、`status`、`voiceStatus`、`domain`，加下面六块。
（`voiceStatus` = `editorialVoice.status`，缺失为 `null`，与索引层同义：内部盘点用，界面不渲染。）

| 块 | 内容 |
|---|---|
| `official` | `{ inputUrl, finalUrl, checkedAt }` 原样 |
| `editorial` | `{ name, descriptionZh, takeawayZh, noteZh, pricing, pricingNote }`，缺值为 `null`；`takeawayZh` 是详情页的标题级判断句，`noteZh` 是它下面的手记正文，`descriptionZh` 是正式简介（详情页收在档案区第一行，三者不互相顶替）；`pricing` 已按索引层同一规则归一化，原句在 `pricingNote` |
| `classification` | `{ recordLevel, primaryCategory, subcategory, status, alternatives[], reasons[], confirmedAt, independentlyReviewed }`；`reasons[]` 每条 `{ statement, evidenceUrl }`；**没有 curatorId / reviewerId** |
| `facets` | 12 轴完整对象，与索引层同形 |
| `pages[]` | `{ role, sourceUrl, finalUrl, title, selectionRationale, shot{src,sha256,width,height,bytes,alt} }`；`src` 是站内相对路径 `/shots/<id>/v2-*.png` |
| `facts[]` | `{ field, value, sourceUrl, evidence, confidence }` **原字段原样**。实测出现过的 `field`：`author` / `organization` / `license` / `pricing` / `repository` / `repositoryStatus` / `package` / `repositoryLicenseFile` / `officialRelationship`。前台按 §4.6 逐行渲染，缺失的 field 整行不渲染 |
| `curation` | `{ atlasTerms: [{ stageId, termId, evidenceUrl, note, termEn, termZh }], atlasTermsStatus }`；`termEn` / `termZh` 的来源与纪律见索引层那节；`stageId` 用于生成 `#/atlas/<stageId>/<termId>` 链接，`evidenceUrl` 是「这个站示范了这条术语」的出处；`atlasTermsStatus` 是这批标注的成色 |
| `agentGuidance` | 见下 |
| `designMdUrl` / `registryUrl` | 站内相对路径，供「复制为 Agent 上下文」按钮用 |

`agentGuidance` 的每一项都是从 `facets` / `facts` **机械推导**的，不是人工法务判断，
产物里带 `basis` 字段自述这一点：

- `safeToRedistributeCode` / `requiresAttribution`：`licenses` 全为宽松 SPDX（MIT / Apache-2.0 /
  BSD-2 / BSD-3 / ISC / CC0-1.0）→ `true`；含 `unknown` → **`null`（数据不足以判定）**；其余 → `false`。
- `licenseMachineReadable`：`licenses` 里没有 `unknown` / `custom` 时为 `true`。
- `cautions[]`：由 `licenses` 是否 unknown / 是否宽松 / 是否多值，以及 `access` 是否含
  `login-required` / `paid` / `freemium` / `closed-source` 生成；许可非宽松时直接引用
  `facts[field=license].evidence` 原句。没有触发条件就是空数组。
- `recheckAfter`：`checkedAt + 180 天`，`recheckPolicy` 字段写明这是机械策略。

### 3. `public/r/registry.json` —— Agent 索引端点

```jsonc
{
  "$schema": "https://vislexicon.com/schema/registry.json",
  "name": "vislexicon",
  "homepage": "https://vislexicon.com",
  "schemaVersion": 3,
  "generatedAt": "2026-09-05T…Z",
  "counts": {
    "approvedEntries": 12,          // 由源文件数算出
    "candidateEntries": 8684,       // 样本包自述；取不到为 null
    "atlasTerms": 220,              // 数 visual-atlas.json 的 entries
    "atlasTermsOnStage": 170,       // 九台 manifest.claims ∩ 语料 id，去重
    "candidateEntriesSource": "src/data/site-catalog.json 的 sampleInfo.productionCandidateCount（样本包自述）",
    "note": "candidate 条目不出现在本索引中，仅计数公开。…"
  },
  "items": [{
    "entryId": "21st-dev",
    "name": "21st.dev",
    "url": "https://vislexicon.com/r/21st-dev.json",
    "homepage": "https://21st.dev/",
    "primaryCategory": "ui-implementation",
    "subcategory": "general-ui-components",
    "licenses": ["custom"],
    "access": ["freemium", "login-required", "source-available"],
    "checkedAt": "2026-09-01T07:36:27.507Z"
  }]
}
```

索引层**不给** `descriptionZh` / `facts` / `pages`。`licenses` / `access` / `checkedAt`
放在索引层是刻意的：它们是 Agent **筛选**时用的，不是阅读时用的（research/02 §6.1）。

### 4. `public/r/<entryId>.json` —— Agent 详情端点

与 `public/data/site/<entryId>.json` 同构（`voiceStatus`、`editorial.noteZh`、
`curation.atlasTerms[].termEn/termZh` 一并带上），四处不同：
加 `$schema`；`pages[].shot.src` 换成 **绝对 URL**（`sha256` / `width` / `height` / `bytes` 保留，
它们是可核验性的一部分）；加 `meta { vislexiconUrl, designMdUrl, checkedAt, license }` 兼容层；
不带 `detailUrl`。

### 5. `public/site/<entryId>.md` —— DESIGN.md

Google Labs 规范的两层结构。frontmatter：`version`、`name`（唯一必填）、
`description`（**只在 `takeawayZh` 存在时才出现**，缺就整键省略，不用简介截断顶替），
外加 VisLexicon 扩展 `source` / `checkedAt` / `license` / `licenseEvidence` /
`confidence` / `independentlyReviewed` / `vislexiconUrl`。

正文只有两节：`## Overview`（= `descriptionZh`）与 `## Do's and Don'ts`。
后者的条目依次是：`agentGuidance.cautions[]`；许可为宽松 SPDX 时的保留声明提示；
以及 **原句照抄的 `facts[field=license].evidence` + 证据 URL**
（Ant Design / Chakra 的「仅限核心仓库」这类范围限定就写在那句话里，改写它等于把限定丢掉）。
一条都写不出来时整节省略。
`## Colors` / `## Typography` / `## Spacing` **一律不生成**——本轮语料没有色彩/字体/间距实测值。

### 6. `public/llms.txt`

llms.txt 结构：H1 → blockquote → `## 机器接口` → `## 已审核条目（N）` → `## Optional`。
只列真实存在的产物，条目数由数据算出。

### 7. `src/lib/counts.js` —— 唯一的数字出口

纯函数，**不 import 任何数据文件**，模块内没有任何表示统计量的字面量。
导出：`FACET_AXES`（12 轴名字，结构常量）、`countApprovedEntries`、`countFacetValues(siteIndex, axis)`、
`countFacetAxes`、`countIndependentlyReviewed`、`countUnknownLicense`、`countWithTakeaway`、
`countWithAtlasTerms`、`latestCheckedAt`、`countAtlasTerms`、`countAtlasByStatus`、
`countAtlasMachineTranslated`、`countAtlasTermsOnStage(atlas, manifests)`、`countStages`、
`countCandidateEntries(sampleInfo)`、`siteWideCounts({items, atlas, manifests, sampleInfo})`、
`COUNT_DEFINITIONS`（口径表行定义：`{id, labelZh, definitionZh, methodZh}`，**只有定义没有数值**）。

关于页与首页要显示的每个数字都从这里取；`siteWideCounts` 缺哪份数据，对应字段就是 `null`，
前台显示为「未知」，不许用别的数字顶替。

### 8. 已删除的旧产物

- `public/data/site-catalog-index.json` —— 被 `site-index.json` 取代。
  唯一引用方是 `src/SiteCatalog.jsx:132`（WP-D 负责删除该文件）。
- `public/shots/*/01|02|03.png` —— 18 张冗余截图（方案 §8 第 7 条）。
  唯一引用方是 `src/data/curated-sites.js`（18 处，WP-D 负责删除该文件）。
  `v2-identity/breadth/proof.png` 全部保留，v3 语料只引用这一套。

---

## 舞台契约（WP-G）

`src/stages/*/manifest.js` 在原有 `claims[]` / `knobs[]` 之外新增三个字段，
`buildStageIndex` 在 **strict 模式下全部校验**，并把它们原样透出到
`index.stages[i].zones / compareSets / positionRegions` 供 WP-F 渲染。
纯函数在 `src/lib/stage-zones.js`（分区与位置索引）与 `src/lib/atlas-status.js`（两套标签）。

### 1. `zones[]` —— 分区（方案 §5.2 的态二）

```jsonc
{
  "id": "multi-single-select",          // 本台内唯一，kebab-case
  "labelZh": "多选与单选",               // 分区导航上显示的名字
  "descriptionZh": "同一个问题问一次还是问多次…",  // 一句话，说清这一区收的是什么
  "hotspotIds": ["atlas-component-component-checkbox", "…"],  // slot=hotspot 的成员
  "variantIds": ["…"],                  // slot=variant 的成员
  "paramIds": ["…"]                     // slot=param 的成员
}
```

三个成员数组按 **slot 分开写**，合起来才是这一区的全部术语（`zoneMemberIds(zone)`）。
分开写是为了让清单自己说清「这一区装的是热区还是参数」，也让校验能挡住
「把一个 variant 写进 hotspotIds」这类错误。

**strict 下抛错的情形：**

| 情形 | 说明 |
|---|---|
| 缺少 `zones` / `id` / `labelZh` / `descriptionZh` | 分区是导航层，缺一项界面上就是一块无名区域 |
| 分区 id 在本台内重复 | — |
| 成员数 < 3 或 > 7 | 行业解剖图的标注密度区间（`research/03` §4.1） |
| 成员写进了错误的 slot 数组 | 例：把 param 写进 `hotspotIds` |
| 分区收了本台没有认领的术语 | — |
| **同一条术语属于两个分区** | 分区是划分，不是标签 |
| **有术语没有被任何分区覆盖** | 未覆盖的术语在分区态里永远出不来 |

> 覆盖要求比方案 §9.3 的字面严一档：不只是「所有热区」，而是**本台全部 claim**
> （variant / hotspot / param 都算）。变体台没有热区，只有把变体也纳入才谈得上分区。

**每台的分区数与成员数（实测，`node scripts/check-stages.mjs` 打印）：**

| 舞台 | 认领 | 分区 · 成员数 |
|---|---|---|
| form-anatomy | 21 | 5 区 · 6/3/5/4/3 |
| data-display | 19 | 4 区 · 5/4/5/5 |
| navigation | 14 | 4 区 · 4/4/3/3 |
| state-loading | 9 | 3 区 · 3/3/3 |
| overlay-layers | 14 | 3 区 · 4/6/4 |
| text-reveal | 15 | 4 区 · 3/3/5/4 |
| surface-transition | 16 | 4 区 · 4/5/4/3 |
| agent-composer | 26 | 6 区 · 3/7/4/4/4/4 |
| pointer-gestures | 39 | 7 区 · 5/4/6/6/6/6/6 |

**舞台组件侧的对应物：** 九个 `Stage.jsx` 里每个热区根元素带 `data-zone="<zoneId>"`，
与 `data-node` 并存。`zoneOfHotspot(stageId, x)` 的第二个参数**既接受术语 id 也接受
`data-node` 名**，反向悬停时手上只有节点名也能查到分区。

### 2. `compareSets[]` —— 对照组（方案 §3.3 的态四）

```jsonc
{
  "id": "overlay-four",
  "titleZh": "提示 / 弹层 / 对话框 / 模态：差别不在长相",
  "zoneId": "non-modal-hints",        // 可选。给了就必须是本台存在的分区 id
  "termIds": ["…", "…"],              // ≥2 条，必须都是本台认领过的术语
  "axes": [{ "id": "focus", "labelZh": "焦点" }, …],
  "cells": { "<termId>": { "<axisId>": "一句判据" | null } }
}
```

轴取 namethatui.org 的五轴，id 固定为
`focus` / `keyboard` / `dismissal` / `modality` / `persistence`
（中文：焦点 / 键盘 / 消解方式 / 模态性 / 持久性），常量在
`stage-zones.js` 的 `COMPARE_AXES`，写别的 id 会被挡下。

**编辑纪律（不进代码校验，但是上线门槛）：** 每个格子必须是「会改变实现的那条需求」，
不是「长得像不像」。判据只能来自本台清单里已有的 `noteZh`，或语料里该术语的
`definitionZh` / `sourceEvidence[].sourceDefinition`。**写不出来就写 `null`，
前台渲染为「—」，不许编。** 整列全 `null` 的轴，前台可以整列不显示。

本轮只有两组有据可依，其余七台一律 `compareSets: []`：

- `form-anatomy` / `form-choice-controls`：Checkbox · Checkboxes · Radio button ·
  Radio group · Switch（5 条，超出方案 §3.3 写的 `termIds[2..4]`，见 WP-G 报告）。
  25 格中 13 格有判据，12 格为 `null`（`modality` 整列为 null）。
- `overlay-layers` / `overlay-four`：Tooltip · Popover API · Dialog · Dialog (Modal)。
  20 格中 15 格有判据，5 格为 `null`。

### 3. `positionRegions[]` —— 页面位置区域（方案 §3.2 的位置索引）

```jsonc
[{ "region": "main-form", "termIds": ["…"] }]
```

`region` 只能取七个固定值（`stage-zones.js` 的 `POSITION_REGIONS`，顺序即版面顺序）：

| id | labelZh |
|---|---|
| `header` | 顶栏 / 服务级 |
| `sidebar` | 侧栏 / 目录 |
| `main-table` | 主内容区 · 表格 |
| `main-form` | 主内容区 · 表单 |
| `overlay` | 浮层 / 遮罩 |
| `composer` | 底部输入区 |
| `state` | 加载与空态 |

登记的是**术语 id 而不是分区 id**，因为一个分区可能横跨两个区域（导航台的应用层
既有侧栏里的菜单栏，也有主区里的工具栏），只有按术语登记，位置索引才能给出真实的清单与计数。
strict 校验：region 必须是七个之一、同一 region 不得重复声明、termIds 必须是本台认领过的术语。

**`positionIndex(manifests)` 的返回值：**

```jsonc
{
  "regions": [{ "region": "header", "labelZh": "顶栏 / 服务级",
                "stages": [{ "stageId": "navigation", "titleZh": "导航",
                             "termIds": ["…"], "count": 3 }],
                "count": 5 }],           // 七个区域一律返回，count 为 0 时 stages 为 []
  "claimed": 173, "placed": 79, "unplaced": 94
}
```

`unplaced` 是**显式给出的缺口**：三个变体台（text-reveal / surface-transition /
pointer-gestures）不长在任何固定页面位置，`positionRegions: []`；导航台主内容区里的
面包屑 / 标签页 / 翻页等也没有对应格——七个区域里没有「主内容区 · 通用」。
索引页要把 0 与缺口显示出来，不隐藏。

### 4. `src/lib/atlas-status.js` —— 两套正交标签（方案 §5.5）

四个纯函数，都只吃一条 `visual-atlas.json` 的 entry，不 import 数据文件。

| 函数 | 返回 | 判定规则 |
|---|---|---|
| `depthOf(record, stageIndex)` | `'staged'` 已入台 / `'evidenced'` 有证据 / `'collected'` 仅采集 | 依次：`stageIndex.byTerm` 里有这条 id → staged；`sourceEvidence` 非空 → evidenced；其余 → collected。**不看 `entry.status`** |
| `termStatusOf(record)` | `'standard'` 标准术语 / `'common'` 行业通行 / `'vendor'` 厂商用语 / `'pending'` 待定 | 依次：无来源 → pending；来源含 `STANDARD_SOURCE_IDS`（`wai-aria-apg` / `open-ui` / `mdn-css`）→ standard；去重来源数 ≥ 2 → common；= 1 → vendor。记录上若有合法的 `termStanding` 字段则人工覆盖优先 |
| `reviewedAt(record)` | ISO 日期字符串 或 `null` | 只认 `reviewedAt` / `humanReviewedAt` / `review.reviewedAt`。**采集时间 `retrievedAt` 不算人工复核，不得顶替**；当前 220 条全部返回 `null` |
| `statusDistribution(entries, stageIndex)` | `{ total, depth{}, termStatus{}, reviewed }` | 给关于页口径表用，数字全部由传入数据算出 |

配套导出：`DEPTH_LABEL` / `DEPTH_DEFINITION` / `TERM_STATUS_LABEL` /
`TERM_STATUS_DEFINITION`（中文标签与判定依据的说明文案）、`sourceIdsOf`、
`statusLabelsOf`（一次取齐右栏要显示的两套标签 + 复核日期 + 来源 id 列表）。

**220 条样本上的实测分布**（`node scripts/check-stages.mjs` 打印，不是写死的数字）：
建档深度 已入台 170 · 有证据 50 · 仅采集 0；
术语地位 标准术语 71 · 行业通行 28 · 厂商用语 121 · 待定 0；
有人工复核日期的 0 条。

### 5. `scripts/check-stages.mjs`

`node scripts/check-stages.mjs`，退出码 0 / 1。跑六段：strict 构建、分区密度与覆盖、
五个反例必须抛错、位置索引七区域、`zoneOfHotspot` 双向反查、两套标签分布与守恒。
仓里没有测试目录（`context/04` 提到的 435 项测试与 13 项 stage-index 测试不在本精简包里），
这个脚本是 WP-G 的可执行验收证据。
