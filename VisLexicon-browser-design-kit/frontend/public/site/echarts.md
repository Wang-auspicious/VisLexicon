---
version: "3"
name: "Apache ECharts"
description: "改 option 就能出柱状图，编辑器可当场跑"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://echarts.apache.org/en/index.html
checkedAt: 2026-09-06T02:50:00.000Z
license: Apache-2.0
licenseEvidence: https://github.com/apache/echarts/blob/master/LICENSE
confidence: 1
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/echarts"
---

## Overview

Apache 软件基金会的 JavaScript 可视化库，现为 6.1。内置二十余种图表，可在 Canvas 与 SVG 间切换；仓库 LICENSE 为 Apache-2.0，文档与示例公开。

## Do's and Don'ts

- 许可登记为 Apache-2.0（宽松 SPDX），再分发时须保留版权与许可声明。
- 许可原始记录 Apache-2.0：LICENSE 为 Apache License Version 2.0。package.json license 字段 Apache-2.0。附录注明部分 treemap/tree/graph 文件嵌入 d3.js 的 BSD 3-Clause。覆盖 echarts 包源码。（证据：https://github.com/apache/echarts/blob/master/LICENSE）
