---
version: "3"
releaseId: release-35315ecedf56c3d5
revision: c20678f7971a1fb45ac9e85773950bb6cc2ba9d7ffb5db6c8ca5f741385e0082
status: APPROVED
name: launchdarkly/launchpad-ui
description: "抄它给 AI 生成代码写的 AGENTS.md 约定"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://github.com/launchdarkly/launchpad-ui
checkedAt: 2026-09-15T11:44:46.129Z
license: Apache-2.0
licenseEvidence: https://github.com/launchdarkly/launchpad-ui
confidence: 1
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/github-com-launchdarkly-launchpad-ui"
---

## Overview

LaunchDarkly 的设计系统仓库，packages 下拆成一批 @launchpad-ui/* 包，另有 apps/vscode 与 docs 两个应用。README 还专门写了 AI code generation 与 Figma MCP server 的接入方式。

## Do's and Don'ts

- 许可登记为 Apache-2.0（宽松 SPDX），再分发时须保留版权与许可声明。
- 许可原始记录 Apache-2.0：About 栏 Apache-2.0 license；提交记录里有 chore: add Apache 2.0 license (#557)，文件列表里有 LICENSE（证据：https://github.com/launchdarkly/launchpad-ui）
