---
version: "3"
releaseId: release-f4ac887f17c47614
revision: aa80dcfea97c2dcb2e59130ff60c336b94c4084d7b73bb8a0f66bd368cf06b53
status: APPROVED
name: pattern.css
description: "用文字色与背景色配合纹样类，再按尺寸类选择图案密度。"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://bansal.io/pattern-css
checkedAt: 2026-10-07T17:51:28.308Z
license: unknown
licenseEvidence: unknown
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/pattern-css"
---

## Overview

pattern.css 用 CSS 类生成背景纹样，颜色由透明区域与 currentColor 组合，尺寸则通过 sm、md、lg、xl 类名选择。原站给出 npm、CDN 和文件引入方法，并展示棋盘、网格、点阵和条纹等样式。当前 proof 完整比较四个棋盘尺寸，可把同一图案用在背景、文字或分隔区域；它交付的是 CSS 实现，而不是下载的静态纹理图片。

## Do's and Don'ts

- 站点上未找到明确的许可声明，本条记录按 v3 规格记为 unknown；再分发或商用前必须自行确认。
