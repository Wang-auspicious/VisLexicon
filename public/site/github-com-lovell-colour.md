---
version: "3"
releaseId: release-35315ecedf56c3d5
revision: dbe2d107ebbea87df77b3319c29df936c3d7ab13ab2727348c06abe3421c6d44
status: APPROVED
name: lovell/colour
description: "让旧版 Node 也能 require 这个 ESM 颜色包"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://github.com/lovell/colour
checkedAt: 2026-09-15T12:33:11.661Z
license: "MIT（包装包与四个依赖同许可）"
licenseEvidence: https://github.com/lovell/colour
confidence: 0.9
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/github-com-lovell-colour"
---

## Overview

把只发 ESM 的 color 包及其依赖（color-convert、color-string、color-name）转成 CommonJS 的包装包，给还不支持 ESM 的 Node.js（20.19.0 以前）用，发布名是 @img/colour。

## Do's and Don'ts

- 许可登记为 MIT（宽松 SPDX），再分发时须保留版权与许可声明。
- 许可原始记录 MIT（包装包与四个依赖同许可）：README「This package converts the color package and its dependencies, all of which are MIT-licensed, to CommonJS.」（证据：https://github.com/lovell/colour）
