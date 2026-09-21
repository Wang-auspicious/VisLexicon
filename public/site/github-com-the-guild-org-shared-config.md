---
version: "3"
releaseId: release-35315ecedf56c3d5
revision: 14ed592843c6571e675cbc24820103c364d878713238ba87f399c3f0ee5a2cbb
status: APPROVED
name: the-guild-org/shared-config
description: "extends 一份共享配置，lint 与发布流水线一起接上"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://github.com/the-guild-org/shared-config
checkedAt: 2026-09-15T11:53:17.522Z
license: MIT
licenseEvidence: https://github.com/the-guild-org/shared-config
confidence: 1
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/github-com-the-guild-org-shared-config"
---

## Overview

The Guild 把自家工具共用的 ESLint、Prettier、Tailwind 配置，连同 release 流水线与 GitHub Actions 收进一个仓库，供其他项目直接 extends。

## Do's and Don'ts

- 许可登记为 MIT（宽松 SPDX），再分发时须保留版权与许可声明。
- 许可原始记录 MIT：About 面板的 MIT license 行与文件列表中的 LICENSE（证据：https://github.com/the-guild-org/shared-config）
