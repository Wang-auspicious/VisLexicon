---
version: "3"
releaseId: release-35315ecedf56c3d5
revision: da743dc390359253a01c1504a1582377b576e4a8f734f70fad5dcf546ebea2e6
status: APPROVED
name: tsconfig/bases
description: "extends 一个 @tsconfig 基座就够"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://github.com/tsconfig/bases
checkedAt: 2026-09-15T11:53:40.280Z
license: MIT
licenseEvidence: https://github.com/tsconfig/bases
confidence: 1
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/github-com-tsconfig-bases"
---

## Overview

社区维护的 TSConfig 基座集合，按运行时环境分门别类：从 @tsconfig/node10 一路排到 node26，另有 bun、next、svelte、vite-react、react-native、strictest、deno 等几十个可 extends 的配置。README 自称是「TSConfig 界的 Definitely Typed」。

## Do's and Don'ts

- 许可登记为 MIT（宽松 SPDX），再分发时须保留版权与许可声明。
- 许可原始记录 MIT：截图 About 栏的 MIT license 一行与 README 顶部 MIT license 徽标、根目录 LICENSE.md（证据：https://github.com/tsconfig/bases）
