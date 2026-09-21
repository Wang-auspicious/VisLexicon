---
version: "3"
releaseId: release-35315ecedf56c3d5
revision: 270327e123fa9f6e9093ef852faa1d6e909b4d46ebe276b1390a37465c7ae152
status: APPROVED
name: vuejs/component-compiler-utils
description: "parse 把 .vue 拆成 descriptor 再逐块编译"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://github.com/vuejs/component-compiler-utils
checkedAt: 2026-09-15T11:54:56.159Z
license: unknown
licenseEvidence: https://github.com/vuejs/component-compiler-utils
confidence: 1
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/github-com-vuejs-component-compiler-utils"
---

## Overview

给打包器作者用的底层工具包：把 .vue 单文件组件用 parse 解成带 source map 的 descriptor，再交给 compileTemplate 等步骤分开处理，API 面故意做得极小，vue-loader 15 以上就用它。

## Do's and Don'ts

- 站点上未找到明确的许可声明，本条记录按 v3 规格记为 unknown；再分发或商用前必须自行确认。
- 许可原始记录 unknown：仓库页右侧 About 栏只列 Readme / Activity / Custom properties 与 stars、watching、forks，没有许可证一行（证据：https://github.com/vuejs/component-compiler-utils）
