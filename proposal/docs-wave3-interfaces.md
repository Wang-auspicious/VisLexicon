# 波次 3 跨包接口（WP-C / WP-D / WP-E 必读，冻结）

## 路由（WP-C 在 `src/router.js` + `src/App.jsx` 实现）
| hash | 渲染 | 归属 |
|---|---|---|
| `#/` | `<Curation />`（策展首页） | WP-D `src/views/Curation.jsx` 默认导出 |
| `#/sites` `#/sites?q=&<axis>=<value>` | `<AllSites />`（全部站点） | WP-D `src/views/AllSites.jsx` 默认导出，自己读 `location.hash` 的 query |
| `#/site/<entryId>` | **底层继续渲染上一个列表路由**（默认 `#/`），其上叠 `<SiteDetail entryId onClose />` | WP-E `src/views/SiteDetail.jsx` 默认导出 |
| `#/atlas`、`#/atlas/<stageId>`、`#/atlas/<stageId>/<termId>` | 本波次仍渲染现有 `views/Atlas.jsx`（WP-F 下一波替换）；WP-C 只需把 hash 段解析出来传 `stageId`/`termId` props（Atlas.jsx 现有 props 形状不变就不传） | WP-C 只接线 |
| `#/about` `#/about#submit` | `<About />` | WP-C |
| 其他 | `<NotFound />` 真 404 页（含回首页/图鉴/关于三个链接） | WP-C |

`SiteDetail` props：`{ entryId: string, onClose: () => void }`。`onClose` 由 WP-C 提供：若 `history.state?.from` 存在则 `history.back()`，否则 `location.hash = '#/'`。WP-D 的卡片是 `<a href="#/site/<id>">`（⌘/中键可新开标签），点击时用 `history.pushState({from: 当前hash}, '', href)` 后触发 hashchange 事件（WP-C 在 router 里导出 `navigate(hash, state)` 帮助函数：`src/router.js` 导出 `navigate(hash, state?)`、`useRoute()`（返回 `{ name, params, query, hash }`）、`useHashQuery()`）。

## 数据（WP-A 已产出，见 docs-contracts.md）
- 列表：`fetch('/data/site-index.json')` → `{ counts, items[] }`。
- 详情：`fetch('/data/site/<entryId>.json')`。
- 计数：`import { siteWideCounts, COUNT_DEFINITIONS } from '../lib/counts.js'`。
- 对照台：`import { BENCHES, validateBenches, benchTitle, benchesForStage } from '../data/benches.js'`（已由 WP-H 建好，WP-D 只 import）。
- 舞台索引：`src/lib/stage-index.js`、`src/lib/stage-zones.js`、`src/lib/atlas-status.js`（WP-G）。

## 样式（WP-B 已产出）
- token 只用 `src/styles/tokens.css` 里的 `--vl-*`；不新增 hex；字号只用字号 token。
- 各包**只写自己的样式文件**：WP-C → `src/styles/shell.css`；WP-D → `src/styles/curation.css`；WP-E → `src/styles/site-detail.css`。可以删除文件里旧组件用不到的规则（旧组件也由同一包删除）。
- 断点只有 `min-width: 768px / 1280px / 1440px`。

## 通用组件
- 域名首字母块：WP-E 新建 `src/components/DomainMark.jsx`（从旧 SiteDetailModal 提取），WP-D 也要用——**WP-D 先在自己的 `SiteCard.jsx` 内部写一个同名最小实现**，波次结束后由集成步骤合并；不要互相 import 尚不存在的文件。
- 焦点陷阱：`src/lib/modal-focus.js` / `use-modal-focus.js`（WP-E 拥有）。WP-C 的移动菜单用 `inert` 属性 + 自己的简单 Esc 处理，不 import WP-E 的文件。

## 诚实性
- 页面上任何数字由数据算；`pricing === 'unknown'`、`license === 'unknown'` 渲染为「未知」；`atlasTermsStatus === 'editor-draft'` 显示「编辑草稿」标签；`takeawayZh` 为 null 显示「未写」。
- 不出现 8684 / 5,000+ / 3000+ 这类数字；候选池规模只在关于页口径表里出现，并注明来源。
