---
version: "3"
name: Spline
description: "在浏览器里做可导出的交互 3D"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://spline.design/
checkedAt: 2026-09-06T20:30:00.000Z
license: "proprietary (editor); MIT (react-spline); unknown (runtime)"
licenseEvidence: https://github.com/splinetool/react-spline/blob/main/LICENSE
confidence: 1
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/spline"
---

## Overview

Spline, Inc. 的浏览器 3D 设计工具，可把场景导出到 Web、iOS 与 Android。编辑器免费档带水印；@splinetool/react-spline 为 MIT，运行时包未标 SPDX。

## Do's and Don'ts

- 站点上未找到明确的许可声明，本条记录按 v3 规格记为 unknown；再分发或商用前必须自行确认。
- 该条目登记了多个许可值（proprietary / MIT / unknown），目录之间可能不同，逐目录确认。
- 存在付费层：Free with watermark; Hobby from $12/seat/mo billed yearly。
- 许可原始记录 proprietary (editor); MIT (react-spline); unknown (runtime)：编辑器为专有 SaaS，定价页按席位收费。react-spline LICENSE 为 MIT License，Copyright (c) 2022 Spline, Inc.，覆盖 React 包装。registry.npmjs.org/@splinetool/runtime/latest 的 package.json 无 license 字段，故运行时记 unknown，不得标开源。（证据：https://github.com/splinetool/react-spline/blob/main/LICENSE）
