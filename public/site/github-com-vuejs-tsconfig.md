---
version: "3"
releaseId: release-35315ecedf56c3d5
revision: b025d5167610f91e45d0ff4120620bc8b446caa6c7a799933b7795a93aaf263e
status: APPROVED
name: vuejs/tsconfig
description: "extends 引走 tsconfig.json 等三份预设"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://github.com/vuejs/tsconfig
checkedAt: 2026-09-15T11:54:59.569Z
license: MIT
licenseEvidence: https://github.com/vuejs/tsconfig
confidence: 1
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/github-com-vuejs-tsconfig"
---

## Overview

Vue 3 项目可以直接 extend 的 tsconfig 预设：tsconfig.json 是运行时无关的基础配置，浏览器环境换 tsconfig.dom.json，Node 环境再叠一层 lib 配置，README 要求 TypeScript >= 5.8、Vue.js >= 3.4。

## Do's and Don'ts

- 许可登记为 MIT（宽松 SPDX），再分发时须保留版权与许可声明。
- 许可原始记录 MIT：仓库页右侧 About 栏的 MIT license，README 标题旁也挂同一许可（证据：https://github.com/vuejs/tsconfig）
