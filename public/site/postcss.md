---
version: "3"
releaseId: release-1dd011f2bc156e6f
revision: 4932ca841d42de06a0d5c3e88f94bd9e883251e811b718ea9f983a9ffba26840
status: APPROVED
name: PostCSS
description: "先确定要做的CSS转换，再选择插件并查处理器接口。"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://postcss.org/
checkedAt: 2026-10-07T17:50:53.302Z
license: unknown
licenseEvidence: unknown
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/postcss"
---

## Overview

PostCSS 用 JavaScript 插件转换 CSS，首页通过前缀补全、现代语法转换和样式检查的输入输出解释用途。插件页按任务组织实现，API 页给出创建处理器、传入插件并读取 result.css 的完整调用。它嵌入样式构建过程，具体转换效果取决于选用的插件；可以先从所需任务找插件，再按处理器接口接入项目。

## Do's and Don'ts

- 站点上未找到明确的许可声明，本条记录按 v3 规格记为 unknown；再分发或商用前必须自行确认。
