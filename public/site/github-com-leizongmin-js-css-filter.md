---
version: "3"
releaseId: release-35315ecedf56c3d5
revision: 3d94febb0c515ba0b9ace8eb98394f069e812c7ea92783057296e91549158a37
status: APPROVED
name: leizongmin/js-css-filter
description: "给用户提交的 CSS 过一遍白名单，滤掉危险声明"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://github.com/leizongmin/js-css-filter
checkedAt: 2026-09-15T11:57:36.563Z
license: MIT
licenseEvidence: https://github.com/leizongmin/js-css-filter
confidence: 1
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/github-com-leizongmin-js-css-filter"
---

## Overview

按白名单过滤不可信 CSS 的 JS 库，不在白名单里的声明（例如 position:fixed）会被整段丢掉。白名单可以写 true、正则或函数，还能挂 onAttr / onIgnoreAttr 回调改写输出。

## Do's and Don'ts

- 许可登记为 MIT（宽松 SPDX），再分发时须保留版权与许可声明。
- 许可原始记录 MIT：右侧 About 的 MIT license、README 的 MIT license 行与正文 The MIT License 一段（证据：https://github.com/leizongmin/js-css-filter）
