# Effects Atlas Expansion and Evidence Design

## Goal

把效果图鉴从当前 2,339 条扩展为可持续维护的 4,000+ 条专业效果与组件模式库，同时补足现代产品界面缺口、真实网站证据和严格双语一致性。

## Current audit

- 55 个实际效果模块，2,339 条条目。
- 每条现有数据均有 `demo`、`zh`、`en`、`css`；已通过字段完整性和 CSS 大括号平衡检查。
- 索引预留但实际缺失 19 个模块：`dnd`、`keyboard`、`table`、`color`、`grid`、`icon`、`photo`、`motionsys`、`sync`、`search`、`auth`、`onboard`、`editor`、`map`、`social`、`calendar`、`fintech`、`cssnext`、`libs2`。
- 因 `basics` 组完全为空，首页编号曾出现 07 后直接 09；编号逻辑已修复为按可见组连续编号。
- 下载资源中的真实截图位于 `前端效果交互库原型 (10).zip`，当前只是归档，尚未与网页风格条目建立证据关系。

## Content expansion model

不以数量硬填。新增条目必须属于一个可区分的交互/视觉模式，并具备：

```text
id, zh, en, dz, de, pz, pe, demo, css,
sourceUrl?, screenshot?, capturedAt?, evidenceNote?, evidenceStatus?
```

扩展顺序：

1. 视觉基本功：颜色系统、网格、图标、图片裁切与媒体比例。
2. 现代组件行为：拖拽、键盘交互、表格、筛选、排序、分页、批量操作、命令菜单。
3. 产品状态：搜索、认证、引导、编辑器、地图、日历、社交、金融、同步与离线。
4. 工程与跨端：响应式策略、CSS 新能力、可观测性、性能反馈、错误恢复、无障碍和国际化的变体。
5. 库与引擎：补齐 CSS 新能力和常见运行时的真实差异，避免只把同一动画换名字。

每个模块先完成 25–80 个高区分度条目，再根据重复率和真实需求扩展，目标为 4,000+，但以覆盖矩阵和去重审查为准。

## Evidence model for website styles

网页风格类条目必须区分“概念示意”和“真实证据”：

- 概念示意继续用现有 CSS stage，只用于解释模式。
- 真实网站证据使用 `sourceUrl`、本地截图、`capturedAt` 和 `evidenceNote`。
- 截图必须来自真实可访问页面，保留来源 URL 和采集时间；不能用草图冒充网站展示。
- 卡片显示证据徽标；详情页显示截图、来源链接和证据说明。
- 页面无法访问或来源不稳定时标记为 `unverified`，不当作已核验。

## Bilingual contract

语言由主站 store 作为唯一来源传入底板。每次切换必须同时影响：

- 分类名、条目标题、卡片主副标签；
- 分类说明、条目描述、实现要点；
- 详情页提示词、来源按钮和状态文案；
- 真实网站证据说明。

禁止英文模式显示中文 fallback；字段缺失时显示同语言的明确缺失标记，而不是另一语言文本。新增条目在数据校验中强制要求中英文成对字段。

## Implementation phases

### Phase 1 — audit and schema

生成模块覆盖矩阵、重复候选和缺失字段报告；扩展数据校验脚本，检查数量守恒、双语成对字段、合法 demo、CSS 平衡和证据字段格式。

### Phase 2 — high-value module expansion

按上述顺序新增缺失模块，优先视觉基本功、组件行为和产品状态。每批模块独立构建、计数和浏览器抽查，累计达到 4,000+ 后再做去重审查。

### Phase 3 — real-site evidence

从真实优秀网站中为网页风格条目逐条补证据；保存截图与元数据，更新详情视图和来源入口。

### Phase 4 — bilingual and visual QA

统一底板与主站的语言、主题和搜索状态；抽查每个大组的 overview、wall、detail、load-more、prompt 和证据显示；修复发现的针对性问题。

### Phase 5 — release verification

运行数据校验、`npx vite build`、必要的应用测试和浏览器验收；检查 Git diff 只包含本目标相关文件后提交并推送。

## Acceptance criteria

- 实际条目数量达到 4,000+，且新增条目通过校验和去重审查。
- 19 个缺失模块全部有真实内容或有明确的“暂不纳入”审计结论；不再出现空分类造成的跳号或空白导航。
- 网页风格条目至少具备真实网站截图、来源 URL、采集时间和证据说明；概念草图不再冒充真实展示。
- 中文和英文模式下，卡片、详情、实现说明、prompt、证据说明不混用语言。
- 主站主题和语言切换无需底板重复控件，且状态同步可在浏览器中验证。
- 构建通过，远端分支包含最终提交。
