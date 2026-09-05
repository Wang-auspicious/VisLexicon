# VisLexicon 站点语料采集说明

更新时间：2026-08-31

## 当前交付状态

本批次建立的是可批量导入的候选语料层，不是已经具备三张真实截图的上线精选层。它与 `src/data/curated-sites.js` 分开，所有新记录均标记为 `reviewStatus: "candidate"`，不会绕过现有发布审核。

旧采集任务在完成技能读取与子任务分派后被中断。工作区遗留的 `toools-extracted.json` 只有 28 条首页链接误抽样；`parsed-design-sites.json` 有 1087 条英文记录，但缺少来源字段、URL 规范化与中文简介。本批次重新从公开一手目录采集，并保留旧文件而不覆盖用户数据。

当前快照：

| 指标 | 数量 |
| --- | ---: |
| 两个来源的原始记录 | 3421 |
| URL 规范化、去重后的候选条目 | 3229 |
| 合并的重复记录 | 192 |
| 同一来源内部重复 | 36 |
| 两个来源交叉重合 | 156 |
| 带逐条机器翻译中文简介 | 3224 |
| 使用保守分类摘要兜底 | 5 |
| 已解析联盟/短链跳转 | 140 |
| 仍明确标注为未解析跳转 | 4 |
| 浏览器精简索引 | 3229 条 / 1,330,874 bytes |

## 来源与覆盖

### TOOOLS.design

- 来源首页：`https://www.toools.design/`
- 公开类别页：18 / 18
- 原始记录：2333
- 规范化后仍有 Toools 证据的唯一条目：2305
- 类别页：AI Tools、Inspiration、Icons、Illustrations、Mocks + UI Kits、Stock Photos、Learning、Community、Blogs & Mags、Podcasts、Books、Productivity、Design Tools、UX Tools、Color Tools、Typography、Marketing、Web Builders
- 每条保留列表页 URL、Toools 原始目标 URL、英文原简介、定价标签、原始类别、采集日期；短链解析另保留最终 URL、HTTP 状态与解析状态。

### Design Resources for Developers

- 来源仓库：`https://github.com/bradtraversy/design-resources-for-developers`
- 官方 README：`master/readme.md`
- 采集 commit：`ceb5bf870bf653b8a66171ca753fb8929934db4b`
- 原始记录：1088
- 规范化后仍有该来源证据的唯一条目：1080
- 原始 33 个细分类全部保留为来源类别，并映射到 VisLexicon 主 taxonomy。

## 分类模型

一级分类固定为 9 个稳定用途面，二级保留更细的来源语义，搜索标签再覆盖技术栈和内容特征：

| 一级分类 | 当前条目 |
| --- | ---: |
| AI 设计工具 | 275 |
| 灵感与案例 | 235 |
| UI 组件与设计系统 | 352 |
| 视觉素材与字体 | 754 |
| 设计创作与原型 | 577 |
| UX 研究与学习 | 477 |
| 前端开发与动效 | 168 |
| 协作与效率 | 207 |
| 品牌与营销 | 184 |

每条只能有一个 `category`，可以有多个 `secondaryCategories` 和 `subcategories`。跨目录或跨类别出现的同一规范 URL 会合并证据与分类，不重复生成卡片候选。

## 可导入 schema

主文件：`src/data/site-catalog.json`

```json
{
  "id": "stable-name-8hexhash",
  "name": "站点或资源名称",
  "canonicalUrl": "https://example.com/meaningful-path",
  "domain": "example.com",
  "descriptionZh": "与英文来源简介对齐的中文简介。",
  "descriptionOriginal": "Original directory description.",
  "descriptionQuality": "machine-translation",
  "descriptionBasis": "source listing description translated to Simplified Chinese",
  "canonicalizationStatus": "normalized",
  "category": "一级分类",
  "secondaryCategories": [],
  "subcategories": ["细分类"],
  "tags": ["react", "open-source"],
  "pricing": {
    "model": "free|freemium|trial|paid|beta|unknown",
    "labelsOriginal": ["Free"]
  },
  "reviewStatus": "candidate",
  "evidenceLevel": "directory-listing",
  "sourceEvidence": [
    {
      "sourceId": "toools-design",
      "listingUrl": "https://www.toools.design/category-page",
      "originalUrl": "https://example.com/?ref=toools",
      "resolvedUrl": "https://example.com/",
      "resolutionStatus": "resolved",
      "resolutionHttpStatus": 200,
      "originalDescription": "Original directory description.",
      "categoryOriginal": "Source category",
      "pricingOriginal": "Free",
      "collectedAt": "2026-08-31"
    }
  ]
}
```

浏览器按需加载文件：`public/data/site-catalog-index.json`

该文件为单行压缩 JSON，保留顶层 `schemaVersion/generatedAt/total/categoryCounts`。每条只含 `id/name/canonicalUrl/descriptionZh/category/subcategories/tags/pricing.model/reviewStatus/evidenceLevel/sourceIds`，不携带英文原文和逐条 `sourceEvidence`，当前 3229 条共 1,330,874 bytes。需要审计来源时仍应读取完整主文件。

## URL 规范化与去重

构建器会：

1. 统一 HTTPS、主机名大小写、`www`、默认端口、尾斜杠与 `index.html`。
2. 删除 `utm_*`、`ref`、`via`、`gclid`、`irclickid` 等追踪参数，同时保留有意义的路径和查询参数。
3. 对明确的联盟/短链域做限并发 HEAD 跳转解析；140 条已落到实际目标站。
4. 将 Amazon 短链收敛到稳定的 `/dp/<ASIN>` URL。
5. 以完整规范 URL 去重；同域不同工具页、插件页或仓库路径不会被错误合并。
6. 4 个无法跳出的联盟链接保留原 URL，并标记 `canonicalizationStatus: "unresolved-redirect"`，不伪造目标地址。

## 中文简介策略

中文简介以每条来源英文简介为输入，按内容哈希与译文一一对齐。3216 个唯一英文简介中成功翻译 3213 个，对应 3224 条合并后候选；3 个翻译失败影响 5 条候选，这 5 条使用由原始细分类生成的保守中文摘要。

机器翻译不等于人工编辑审核，因此字段明确区分：

- `machine-translation`：逐条绑定到精确英文原文，可追溯，但仍需编辑抽检。
- `taxonomy-summary`：只陈述来源分类可证明的用途，不补写无法证实的功能。

英文原文始终保存在 `descriptionOriginal` 与 `sourceEvidence[].originalDescription` 中。后续人工润色必须保持原文证据，不应把宣传性推断写成事实。

## 可复现命令

在 `demo/` 目录运行：

```powershell
node scripts/collect-toools.mjs
node scripts/collect-design-resources.mjs
node scripts/build-site-catalog.mjs
node scripts/translate-site-descriptions.mjs
node scripts/build-site-catalog.mjs
node --test tests/site-catalog.test.mjs
```

采集脚本与主 catalog 分离。在线 GitHub 请求失败时，`collect-design-resources.mjs` 直接非零退出并保留已有原始文件，不会静默把旧缓存写成新采集。只有显式传入 `--offline` 才会生成带 `failures` 标记的离线回退数据；构建器会拒绝任何包含来源失败的 catalog。

构建器先在内存中完成合并与校验，校验为零错误后才写临时文件并原子替换完整 catalog 与浏览器索引。校验失败时两个现有产物均保持不变。

## 数据契约与限制

`tests/site-catalog.test.mjs` 当前校验：

- 3229 条规模与两个来源最低覆盖；
- ID、规范 URL 全局唯一；
- 18 个 Toools 类别页均有记录；
- 9 类 taxonomy 合法；
- 中文简介存在、长度受限、翻译与兜底统计一致；
- 每条至少一份完整证据；
- 原始数量、同源重复、跨源重合与最终数量守恒；
- 跳转无法确认时显式保留审计状态。
- 浏览器索引与完整 catalog 数量、分类统计一致，字段白名单固定且文件不超过 2 MB。

这些候选只有“目录列表证据”，尚未逐个完成官网存活、许可证、定价、技术栈、三张真实截图和人工视觉质量核验。只有通过现有 `curated-sites.js` 发布契约的条目才可进入上线精选层。
