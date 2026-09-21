---
version: "3"
releaseId: release-35315ecedf56c3d5
revision: 03ee86d075d1721822629d0f7670f56ede24408630ea4bc20f53838ffab5e14a
status: APPROVED
name: shadcn-ui/ui
description: "把 shadcn/ui 组件源码拉进自己的仓库改动"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://github.com/shadcn-ui/ui
checkedAt: 2026-09-15T12:07:24.049Z
license: MIT
licenseEvidence: https://github.com/shadcn-ui/ui
confidence: 1
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/github-com-shadcn-ui-ui"
---

## Overview

shadcn/ui 的主仓库，组件以源码分发而不是打包成 npm 组件库，仓库里同时放着 registry、CLI、docs 与 templates。README 强调组件可组合、可访问，代码可以改成自己的。

## Do's and Don'ts

- 许可登记为 MIT（宽松 SPDX），再分发时须保留版权与许可声明。
- 许可原始记录 MIT：右侧 About 面板 Readme 下方写 MIT license，文件列表中也有 LICENSE.md（证据：https://github.com/shadcn-ui/ui）
