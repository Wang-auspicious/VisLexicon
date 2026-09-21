---
version: "3"
releaseId: release-35315ecedf56c3d5
revision: 544a2c068c3ac133c5d773c2a6820a260dcbb3c506ca633bd08bee4c2b12a289
status: APPROVED
name: kubev2v/migration-planner-agent-ui
description: "照抄一个收集群凭据的 agent UI monorepo 骨架"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://github.com/kubev2v/migration-planner-agent-ui
checkedAt: 2026-09-15T11:47:37.375Z
license: unknown
licenseEvidence: https://github.com/kubev2v/migration-planner-agent-ui
confidence: 0.5
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/github-com-kubev2v-migration-planner-agent-ui"
---

## Overview

Migration Planner 这个虚拟机迁移工具的前端仓库：Yarn workspaces 管的 monorepo，apps/agent-ui 负责收集群凭据并显示连接状态，packages 里放各应用共享的包。给把 VM 迁到 OpenShift 的人用。

## Do's and Don'ts

- 站点上未找到明确的许可声明，本条记录按 v3 规格记为 unknown；再分发或商用前必须自行确认。
- 许可原始记录 unknown：About 区只列出指向 License 的链接与根目录 LICENSE 文件，本页未显示许可证名称，故记 unknown。（证据：https://github.com/kubev2v/migration-planner-agent-ui）
