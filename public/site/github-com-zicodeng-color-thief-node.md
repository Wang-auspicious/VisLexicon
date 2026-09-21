---
version: "3"
releaseId: release-35315ecedf56c3d5
revision: 88b7a9e8c00e1e7c219a847d1d4c4cba06fa878d7ae4adc2f4cd06ae79c58432
status: APPROVED
name: zicodeng/color-thief-node
description: "在 Node 里给图片 URL 取主色与色板"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://github.com/zicodeng/color-thief-node
checkedAt: 2026-09-15T12:52:24.529Z
license: unknown
licenseEvidence: unknown
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/github-com-zicodeng-color-thief-node"
---

## Overview

color-thief 的 Node 端重写：原版靠浏览器 canvas 取像素，这里改用 node-canvas 在 Node 里模拟 canvas，源码重写成 ES6 并支持 promise，入口是 getColorFromURL 与 getPaletteFromURL 两个异步函数。

## Do's and Don'ts

- 站点上未找到明确的许可声明，本条记录按 v3 规格记为 unknown；再分发或商用前必须自行确认。
