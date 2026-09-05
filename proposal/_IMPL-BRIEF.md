# 实现代理共用简报（每个工作包代理先读）

## 你在做什么
按 `/root/workspace/proposal/VisLexicon-重设计方案与实现规格-2026-09-05.md`（下称「方案」）实现指定的一个工作包（WP）。方案第 9 节定义了工作包、文件所有权、验收标准；第 4/5/7 节是线框与 token；第 2.2 节是导流链接点；第 8 节是诚实性修复清单。

代码仓库：`/root/workspace/VisLexicon-browser-design-kit/frontend/`（已 `npm install`，`npm run build` 可用；git 已初始化，baseline commit 存在，可用 `git diff` 自查）。
调研背景（按需查阅）：`/root/workspace/research/00-current-state-audit.md`（含文件行号）与 `01`–`04`。
产品硬约束：`/root/workspace/research/_BRIEF-for-agents.md`。

## 铁律
1. **只改你工作包拥有的文件**（方案 §9.1 表格里的新建/修改/删除列）。其他包在并行工作，碰了别人的文件会冲突。若确实必须改别人的文件，不要改——写进你的完成报告「跨包请求」。
2. **不虚构**：不写任何字面量数字当作统计（数字必须由数据算出）；不造站点、术语、来源、许可证；找不到就 `unknown`/留空并显示为「未知」。不出现「Verified」「已对齐生产级规范」之类没有代码支撑的文案。
3. **跨包契约**在 `/root/workspace/proposal/docs-contracts.md`（波次 1 由 WP-A 负责写数据契约、WP-0 写脚本用法；后续包只读不改，需要新增字段就在完成报告里提出）。路由段名固定：`#/`、`#/sites`、`#/site/<entryId>`、`#/atlas`、`#/atlas/<stageId>`、`#/atlas/<stageId>/<termId>`、`#/about`。
4. **完成前必须自测**：`npm run build` 与 `npm run lint` 退出码 0；涉及 UI 的包用 Playwright（浏览器已在 `/opt/pw-browsers`，`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`，不要 `playwright install`）在 390×844 / 768×1024 / 1440×900 截图并**用 Read 看图**逐张检查（无横向溢出、无文字裁切、无重叠、层级正确），产物放 `frontend/docs/verification/<wp>/`。键盘检查：Tab 顺序、focus-visible、浮层焦点陷阱与 Esc。
5. 中文界面文案；代码注释简洁；不引入新依赖除非方案明确（WP-0 的 @playwright/test 除外）。若 `@playwright/test` 尚未装好而你需要截图，可用 `node` 直接 `require('playwright')` 或 `playwright-core`——检查 `node_modules` 里有什么，没有就 `npm i -D playwright-core`（记录在报告里）。
6. 完成报告（作为你的最终回复）：改了哪些文件（新建/修改/删除）、验收标准逐条结果（通过/未通过+原因）、跨包请求、你对方案的偏离与理由、遗留问题。诚实，不夸大。
