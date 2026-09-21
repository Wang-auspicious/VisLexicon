---
version: "3"
releaseId: release-35315ecedf56c3d5
revision: 45e85df17d4d71500fa5607c38ceb2905d6ec2ab39eb64411f6c52ccf55523a0
status: APPROVED
name: bluwy/svelte-parse-markup
description: "parse() 得到 AST，脚本样式原样保留"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://github.com/bluwy/svelte-parse-markup
checkedAt: 2026-09-15T12:09:51.254Z
license: MIT
licenseEvidence: https://github.com/bluwy/svelte-parse-markup
confidence: 1
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/github-com-bluwy-svelte-parse-markup"
---

## Overview

一个 Svelte markup 解析器：解析模板但跳过 script 和 style 标签，把它们整体塞成一个 Text 节点。README 建议拿它去对比 Svelte REPL 的 AST 输出。

## Do's and Don'ts

- 许可登记为 MIT（宽松 SPDX），再分发时须保留版权与许可声明。
- 许可原始记录 MIT：README 页签旁与右侧 About 栏都标着 MIT license（证据：https://github.com/bluwy/svelte-parse-markup）
