---
version: "3"
releaseId: release-35315ecedf56c3d5
revision: c780cb7630f4ac289c91de8cdfcdf390d387c06117fe0d48717427ecc1fa750a
status: APPROVED
name: Stack
description: "一份 config 定权限，agent 生成的接口默认安全"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://stack.opensaas.au/
checkedAt: 2026-09-15T11:47:29.106Z
license: unknown
licenseEvidence: unknown
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/stack-opensaas-au"
---

## Overview

OpenSaas 出的 Stack 是一个 config-first 的 Next.js 框架，把访问规则集中写在一份 opensaas.config.ts 里，每次数据库查询、创建、更新、删除都过一遍访问控制引擎。目标是让 AI agent 生成的功能默认就不越权。

## Do's and Don'ts

- 站点上未找到明确的许可声明，本条记录按 v3 规格记为 unknown；再分发或商用前必须自行确认。
