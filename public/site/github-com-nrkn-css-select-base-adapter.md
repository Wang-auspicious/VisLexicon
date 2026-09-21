---
version: "3"
releaseId: release-35315ecedf56c3d5
revision: 95f9283c8b12caed11b1837ac789a1f193378fb5374207140472fcdee1f0f65d
status: APPROVED
name: nrkn/css-select-base-adapter
description: "只写六个必需函数，其余方法由它补全"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://github.com/nrkn/css-select-base-adapter
checkedAt: 2026-09-15T11:57:29.370Z
license: MIT
licenseEvidence: https://github.com/nrkn/css-select-base-adapter
confidence: 1
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/github-com-nrkn-css-select-base-adapter"
---

## Overview

给 css-select 写 adapter 时用的垫底实现：最少只要实现 isTag、getAttributeValue、getChildren、getName、getParent、getText 六个函数，isTag、existsOne、findAll 这些由它补齐。

## Do's and Don'ts

- 许可登记为 MIT（宽松 SPDX），再分发时须保留版权与许可声明。
- 许可原始记录 MIT：右侧 About 面板的 MIT license 与 README license 一节的 MIT License Copyright (c) 2018 Nik Coughlin（证据：https://github.com/nrkn/css-select-base-adapter）
