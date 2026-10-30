---
version: "3"
releaseId: release-78922d67ab547862
revision: 3da23b583221113e3aa65f55d032fa132242af79dfdc6cd061106a5218dcaf96
status: APPROVED
name: d3-color
description: "查颜色解析、转换和格式输出的模块API"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://d3js.org/d3-color
checkedAt: 2026-10-15T06:40:38.329Z
license: ISC
licenseEvidence: https://github.com/d3/d3-color/blob/71c7f100f9fa85a1c70fcbaeb5f803ee8db5620d/LICENSE
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/d3-color-1241bf3b"
---

## Overview

d3-color 是 D3 的独立颜色模块，提供 RGB、HSL、Cubehelix、CIELAB、HCL 等色彩空间的表示、转换与操作。文档给出颜色解析、明暗调整、可显示性与格式输出示例；模块源码按 ISC 许可提供，颜色插值属于另一个模块。

## Do's and Don'ts

- 许可登记为 ISC（宽松 SPDX），再分发时须保留版权与许可声明。
- 许可原始记录 ISC：固定commit的完整许可原文与package.json的ISC声明一致，分发须保留版权和许可。（证据：https://github.com/d3/d3-color/blob/71c7f100f9fa85a1c70fcbaeb5f803ee8db5620d/LICENSE）
