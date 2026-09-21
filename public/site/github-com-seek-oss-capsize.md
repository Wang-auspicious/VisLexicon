---
version: "3"
releaseId: release-35315ecedf56c3d5
revision: e47741b6731bc85358e6d246c7b662d13d9da294c84cd2cdee5b2a70d77dedd2
status: APPROVED
name: seek-oss/capsize
description: "从字体文件算出 cap height 等度量并生成 CSS"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://github.com/seek-oss/capsize
checkedAt: 2026-09-15T12:16:57.996Z
license: MIT
licenseEvidence: https://github.com/seek-oss/capsize
confidence: 1
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/github-com-seek-oss-capsize"
---

## Overview

Capsize 用字体文件里的度量值来算排版：按大写字母高度定尺寸，并把 cap height 以上、基线以下的空隙削掉，让文字高度在 CSS 里可预测。

## Do's and Don'ts

- 许可登记为 MIT（宽松 SPDX），再分发时须保留版权与许可声明。
- 许可原始记录 MIT：About 栏 Readme 下方标注 MIT license，README 页签行同样写 MIT license（证据：https://github.com/seek-oss/capsize）
