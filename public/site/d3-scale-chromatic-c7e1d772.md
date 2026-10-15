---
version: "3"
releaseId: release-5d46865853640952
revision: 4d289485fcd9eabe64de5bb006a9d2d98e0b9857cd30390e9a9d5d73a80f45fa
status: APPROVED
name: d3-scale-chromatic
description: "拿走配好比例尺的分类顺序发散配色"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://d3js.org/d3-scale-chromatic
checkedAt: 2026-10-15T06:46:08.748Z
license: "ISC AND Apache-2.0"
licenseEvidence: https://github.com/d3/d3-scale-chromatic/blob/2c52792197299346b7bdb94322bb4dff8f554fea/LICENSE
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/d3-scale-chromatic-c7e1d772"
---

## Overview

d3-scale-chromatic 是 D3 的配色模块文档，提供顺序、发散、分类、循环四类配色，离散色板与连续插值器可配合 scaleOrdinal 和 scaleSequential 使用，大多源自 ColorBrewer。模块代码为 ISC 许可，ColorBrewer 软件与配色另按 Apache-2.0 许可。

## Do's and Don'ts

- 许可不是通用宽松协议，逐条确认条款后再使用。ISC AND Apache-2.0：完整LICENSE前半为ISC，后半明确ColorBrewer的Apache-2.0；package.json只写ISC不能覆盖掉后半要求。
- 许可原始记录 ISC AND Apache-2.0：完整LICENSE前半为ISC，后半明确ColorBrewer的Apache-2.0；package.json只写ISC不能覆盖掉后半要求。（证据：https://github.com/d3/d3-scale-chromatic/blob/2c52792197299346b7bdb94322bb4dff8f554fea/LICENSE）
