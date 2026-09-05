# VisLexicon 重设计 · 交接包（2026-09-05）

- `VisLexicon-browser-design-kit/`：重设计后的仓库（含 .git，master 分支 7 个提交，baseline→wave1→wave2→wave3→分组卡片墙→人话详情→docs）。已删 node_modules 与 dist；`cd frontend && npm install && npm run build` 即可。
  - `docs/策展内容生产手册-给AI员工.md`：交给内容 AI 员工的手册
  - `docs/VisLexicon-重设计方案与实现规格-2026-09-05.md`、`docs/contracts.md`、`docs/research/`
  - `frontend/docs/verification/`：各波次三档截图与验收 JSON
- `wip-atlas-branch-src/`：图鉴舞台页重排（WP-F）被打断时的半成品 `frontend/src` 快照，**未测试**；同内容也在仓库 `wip-atlas` 分支。
- `research/`、`proposal/`：调研与方案原始文件（与 docs/ 重复，含子代理简报 `_BRIEF-for-agents.md`、`_IMPL-BRIEF.md`、`docs-wave3-interfaces.md`、`docs-editorial-notes.md`）。

未完成：图鉴舞台页重排；origin-ui 语料事实过期；9 条条目 noteZh 待写。
