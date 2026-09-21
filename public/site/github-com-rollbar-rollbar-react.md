---
version: "3"
releaseId: release-35315ecedf56c3d5
revision: 0d968871a521c605699369e78f621953435ca67b7c9fb0137c31c85a05f46712
status: APPROVED
name: rollbar/rollbar-react
description: "用 ErrorBoundary 把报错送进 Rollbar"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://github.com/rollbar/rollbar-react
checkedAt: 2026-09-15T11:50:16.873Z
license: MIT
licenseEvidence: https://github.com/rollbar/rollbar-react
confidence: 1
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/github-com-rollbar-rollbar-react"
---

## Overview

Rollbar 官方的 React SDK，把 Rollbar.js 包成适配 React 的写法：ErrorBoundary、Provider 这类组件加一批 hooks，另做了 React server component 适配。仓库里带一个 Next.js 14 App Router 的示例工程。

## Do's and Don'ts

- 许可登记为 MIT（宽松 SPDX），再分发时须保留版权与许可声明。
- 许可原始记录 MIT：About 栏标 MIT license，README 文件表头同样显示 MIT license（证据：https://github.com/rollbar/rollbar-react）
