---
version: "3"
releaseId: release-35315ecedf56c3d5
revision: 740671ebc03bf6191530d63ec080ea18aa2644a4e462df9ef8e3e7fd4955a7d9
status: APPROVED
name: isaacs/color-support
description: "先问终端支持几色，再决定输出降不降级"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://github.com/isaacs/color-support
checkedAt: 2026-09-15T12:52:22.093Z
license: ISC
licenseEvidence: https://github.com/isaacs/color-support
confidence: 1
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/github-com-isaacs-color-support"
---

## Overview

猜当前终端能显示几色的 Node 模块：按 stdout 是否 TTY、TERM、TERM_PROGRAM、COLORTERM、CI 变量逐条推断，返回的对象上带 has16m 这类标记，另有 bin.js 提供命令行入口。

## Do's and Don'ts

- 许可登记为 ISC（宽松 SPDX），再分发时须保留版权与许可声明。
- 许可原始记录 ISC：右侧 About 区的 ISC license 标签与 LICENSE 文件提交说明里的 isc。（证据：https://github.com/isaacs/color-support）
