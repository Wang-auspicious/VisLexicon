# `src/lib/` 里都是什么

一页说明：每个文件归谁、干什么、当前有没有导入方。
「无导入方」不是形容词，是可复核的事实——用
`grep -rn "<文件名>" src --include=*.js --include=*.jsx` 自己查。

方案 §8 第 20 条明确：本轮**不删**这些无导入方的后台模块（它们不产生虚假界面），
但必须标注出来，免得有人误以为「证据校验、去重、发布门禁已经接进产品了」。
实际上前台没有一行代码调用过 `isPublishableClassification` 或 `evidenceBundleErrors`。

## 前台在用的

| 文件 | 归属 | 用途 |
|---|---|---|
| `counts.js` | WP-A | **全站唯一的数字出口**。纯函数，不 import 任何数据文件，模块内没有统计量字面量。关于页口径表与首页承诺句的每个数字都从这里取。 |
| `search-index.js` | WP-C | 跨语料搜索索引（术语 + 站点），纯前端子串匹配。给 `components/GlobalSearch.jsx` 用。 |
| `color-diff.js` | 存量 | CIEDE2000 色差。旧「工具」频道删除后，唯一调用方是关于页的 `components/DeltaEDemo.jsx`。 |
| `stage-index.js` | 存量 + WP-G | 九台清单的构建与校验（strict 模式构建期抛错）、跨台互引、未入台守恒。图鉴的地基。 |
| `stage-zones.js` | WP-G | 分区 / 对照组 / 位置索引的纯函数与常量。 |
| `atlas-status.js` | WP-G | 建档深度与术语地位两套正交标签、人工复核日期。 |
| `atlas-source-link.js` | 存量（WP-F 重构） | 域名反查：从术语的 `sourceEvidence[].url` 找回站点。覆盖率只有 1/12，是兜底不是主机制。 |
| `curated-resources.js` | 存量（WP-F 删除） | 术语 → 专精资源的硬编码表，有兜底 bug。仍被 `views/Atlas.jsx` 引用，WP-F 重写 Atlas 时一并删除。 |
| `modal-focus.js` / `use-modal-focus.js` | 存量 | 焦点会话、Tab 环绕、删除后邻居聚焦。浮层（站点详情）用。 |
| `site-browser.js` / `facet-chips.js` / `site-card-template.js` | WP-D | 站点列表的数据层：加载、筛选、切面 chips、卡片模板判定。 |
| `site-detail-labels.js` | WP-E | 详情页的字段中文标签与降级文案。 |

## 无导入方（本轮保留，标注在此）

| 文件 | 行数量级 | 说明 |
|---|---|---|
| `curation-evidence.js` | ~1,475 | 证据 bundle 校验。只被同样不可达的 `curation-queue.js` / `mining-threshold.js` 导入。**注意：它 import 的 `../data/curation-taxonomy-v2-legacy.js` 已在本轮删除**（方案 §8 第 20 条把这个文件列在 WP-C 的删除列里）。这个文件当前不可达，所以构建不受影响；谁要把它接回产品，必须先补上这条依赖。 |
| `curation-queue.js` | ~655 | 候选队列。零导入方。 |
| `mining-threshold.js` | ~509 | 采集阈值。零导入方（只 import `curation-evidence.js` 与 `data/mining-signals.js`）。 |
| `mining-extractor/*` | ~1,371（4 文件） | 浏览器探针 + CSS/DOM 度量。零导入方。 |
| `source-observation-ledger.js` | ~251 | 来源观察台账。零导入方。 |
| `submission-form.js` | — | 旧提交频道的表单校验。频道已降级为页脚查重框（本地比对，不发请求），不再需要它。 |
| `site-identity.js` | — | URL 归一化。只被 `curation-evidence.js`（不可达）导入。 |
| `store-core.js` | — | 旧 store 的「Spec 板」增删与状态归一化。`store.js` 本轮收敛成只管主题，不再导入它。 |

删除这一批是下一轮的事：它们不产生虚假界面，但也不产生任何价值。
