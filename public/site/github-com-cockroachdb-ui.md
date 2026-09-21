---
version: "3"
releaseId: release-35315ecedf56c3d5
revision: 1bf7514c765c372856dc1b8fb5aff94f04fd2d463594080e615c42cb184a9b66
status: APPROVED
name: cockroachdb/ui
description: "取已归档的 Cockroach 设计 token 与图标包"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://github.com/cockroachdb/ui
checkedAt: 2026-09-15T11:39:12.080Z
license: MIT
licenseEvidence: https://github.com/cockroachdb/ui
confidence: 1
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/github-com-cockroachdb-ui"
---

## Overview

Cockroach Labs 把自家界面用的包集中放在这个 monorepo 里，含 eslint-config、design-tokens、icons 和 ui-components。仓库 2025 年 1 月已被归档为只读。

## Do's and Don'ts

- 许可登记为 MIT（宽松 SPDX），再分发时须保留版权与许可声明。
- 许可原始记录 MIT：About 侧栏写 MIT license，README 头部同样标 MIT license（证据：https://github.com/cockroachdb/ui）
