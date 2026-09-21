---
version: "3"
releaseId: release-35315ecedf56c3d5
revision: 2ec2cfa05a9cfedefe03840ce75c742c0ba588e32e0113ea08615af933fb6a49
status: APPROVED
name: shawicx/scx-core
description: "读 packages 目录，抄 monorepo 与发布配置"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://github.com/shawicx/scx-core
checkedAt: 2026-09-15T11:50:28.602Z
license: unknown
licenseEvidence: https://github.com/shawicx/scx-core
confidence: 1
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/github-com-shawicx-scx-core"
---

## Overview

shawicx 名下的 pnpm monorepo 仓库，packages/ 里按包拆分以 @scxfe 为前缀的包，构建配置统一收在 build-configs/，用 changeset 打版本发布四个包。仓库没有写描述也没有 license 文件，README 正文没渲染出来。

## Do's and Don'ts

- 站点上未找到明确的许可声明，本条记录按 v3 规格记为 unknown；再分发或商用前必须自行确认。
- 许可原始记录 unknown：About 栏没有 license 一行，根目录文件列表里也没有 LICENSE 文件，故写 unknown（证据：https://github.com/shawicx/scx-core）
