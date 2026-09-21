---
version: "3"
releaseId: release-35315ecedf56c3d5
revision: d49941df518a4521a6c99766f46eef89d1a0ca4e91c13edf67462bc7f6cbec12
status: APPROVED
name: voyant-travel/voyant
description: "fork 这套 monorepo 改成自家预订平台"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://github.com/voyant-travel/voyant
checkedAt: 2026-09-15T11:54:49.131Z
license: Apache-2.0
licenseEvidence: https://github.com/voyant-travel/voyant
confidence: 1
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/github-com-voyant-travel-voyant"
---

## Overview

一套可自托管的旅行预订平台 monorepo：apps 下是能部署的应用、packages 下是模块，README 从 What is Voyant?、How it runs 讲到 The module surface 与 Extending the platform，许可已改为 Apache-2.0。

## Do's and Don'ts

- 许可登记为 Apache-2.0（宽松 SPDX），再分发时须保留版权与许可声明。
- 许可原始记录 Apache-2.0：右侧 About 栏显示 Apache-2.0 license，文件树里 LICENSE 的提交信息是 chore: relicense to Apache-2.0 and refresh README（证据：https://github.com/voyant-travel/voyant）
