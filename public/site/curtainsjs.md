---
version: "3"
releaseId: release-1dd011f2bc156e6f
revision: f89b076f24c5557ea44466a5d557a938e677868ca6e9cd7964228c90238da911
status: APPROVED
name: curtains.js
description: "想把网页中的图片或视频接入 WebGL 平面时，先核对 shader 与类 API。"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://www.curtainsjs.com/
checkedAt: 2026-10-07T17:51:11.598Z
license: MIT
licenseEvidence: https://www.curtainsjs.com/
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/curtainsjs"
---

## Overview

curtains.js 把含图片、视频或 Canvas 的网页元素转成 WebGL 纹理平面，位置与尺寸仍可由 CSS 安排，再通过 shader 做动画和后期效果。文档按 Curtains、Plane、Texture 与 render target 等类组织；Simple plane 原例已加载舞台摄影平面，并连接源码。库代码的许可与演示照片、视频的权利分开核对。

## Do's and Don'ts

- 许可登记为 MIT（宽松 SPDX），再分发时须保留版权与许可声明。
- 许可原始记录 MIT：当前官方正文明确限定 library 的 MIT；照片署名 Marion Bornaz、视频 Analogue Production 不继承库许可。（证据：https://www.curtainsjs.com/）
