---
version: "3"
releaseId: release-35315ecedf56c3d5
revision: 2c0d8513c208353899c61dcd2d5c074caec2900661d41c906d99ae5169851e49
status: APPROVED
name: NMFR/optimize-css-assets-webpack-plugin
description: "压 CSS 资源；webpack 5 起改用官方插件"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://github.com/NMFR/optimize-css-assets-webpack-plugin
checkedAt: 2026-09-15T12:02:40.114Z
license: MIT
licenseEvidence: https://github.com/NMFR/optimize-css-assets-webpack-plugin
confidence: 1
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/github-com-nmfr-optimize-css-assets-webpack-plugin"
---

## Overview

一个在构建时搜出 CSS 资源并用 cssnano 压缩的 Webpack 插件，顺带解决 extract-text-webpack-plugin 合并 chunk 造成的 CSS 重复。README 开头一条醒目提示把 webpack 5 及以上指向官方替代品。

## Do's and Don'ts

- 许可登记为 MIT（宽松 SPDX），再分发时须保留版权与许可声明。
- 许可原始记录 MIT：README 标题行左侧的 MIT license 标签与右侧 About 栏的 MIT license（证据：https://github.com/NMFR/optimize-css-assets-webpack-plugin）
