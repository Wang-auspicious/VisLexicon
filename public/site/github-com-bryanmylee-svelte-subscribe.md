---
version: "3"
releaseId: release-35315ecedf56c3d5
revision: aa795ed42fa9928883b0ceaef85771b8bda8478700afbaec787b6859bf0d95b4
status: APPROVED
name: bryanmylee/svelte-subscribe
description: "循环里的 store 交给 <Subscribe> 订阅"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://github.com/bryanmylee/svelte-subscribe
checkedAt: 2026-09-15T12:10:26.039Z
license: MIT
licenseEvidence: https://github.com/bryanmylee/svelte-subscribe
confidence: 1
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/github-com-bryanmylee-svelte-subscribe"
---

## Overview

解决 Svelte 里 store 必须声明在组件顶层的问题：把循环或嵌套里拿到的 store 交给 <Subscribe>，再用 let: 把值取出来。多个 store 可以一起传。

## Do's and Don'ts

- 许可登记为 MIT（宽松 SPDX），再分发时须保留版权与许可声明。
- 许可原始记录 MIT：README 标题行下方与右侧 About 栏都标着 MIT license（证据：https://github.com/bryanmylee/svelte-subscribe）
