---
version: "3"
releaseId: release-35315ecedf56c3d5
revision: a338f1cadc0e72b7c365e1594de1c34b508bd55ad16169093aecb1ae7d9d4300
status: APPROVED
name: Qix-/color-string
description: "把 hex、rgb、hsl、hwb 各种写法读成数值数组"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://github.com/Qix-/color-string
checkedAt: 2026-09-15T12:52:17.761Z
license: MIT
licenseEvidence: https://github.com/Qix-/color-string
confidence: 1
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/github-com-qix-color-string"
---

## Overview

解析与生成 CSS 颜色字符串的 JS 库：colorString.get('#FFF') 或 get('hwb(60, 3%, 60%)') 会返回 {model, value} 形式的结构，get.rgb() / get.hsl() 则直接给出数值数组。

## Do's and Don'ts

- 许可登记为 MIT（宽松 SPDX），再分发时须保留版权与许可声明。
- 许可原始记录 MIT：右侧 About 区的 MIT license 标签、文件列表中的 LICENSE 条目，以及 README 区块标题旁的 MIT license。（证据：https://github.com/Qix-/color-string）
