---
version: "3"
releaseId: release-35315ecedf56c3d5
revision: 1d653a4c8ee370a2ff1698a2c0efd4b4eb270682931910bfdd827808f1f4bb3c
status: APPROVED
name: chalk/ansi-styles
description: "要更底层就直接用 styles.green.open 这类成对转义码"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://github.com/chalk/ansi-styles
checkedAt: 2026-09-15T12:47:26.393Z
license: MIT
licenseEvidence: https://github.com/chalk/ansi-styles
confidence: 1
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/github-com-chalk-ansi-styles"
---

## Overview

终端样式最底层的积木：把 ANSI 转义码按 open/close 成对导出，chalk 就是搭在它上面的高层封装。

## Do's and Don'ts

- 许可登记为 MIT（宽松 SPDX），再分发时须保留版权与许可声明。
- 许可原始记录 MIT：右侧 About 栏 MIT license 与 README 栏上方的同名牌（证据：https://github.com/chalk/ansi-styles）
