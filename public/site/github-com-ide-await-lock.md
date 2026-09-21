---
version: "3"
releaseId: release-35315ecedf56c3d5
revision: 565becc6fdb41743551d1e6fab3684a07b49668950683849118aa115a1cbc970
status: APPROVED
name: expo/await-lock
description: "npm i await-lock，给并发异步任务加一把锁"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://github.com/expo/await-lock
checkedAt: 2026-09-15T12:48:28.552Z
license: MIT
licenseEvidence: https://github.com/expo/await-lock
confidence: 1
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/github-com-ide-await-lock"
---

## Overview

给异步函数用的互斥锁库，靠 acquireAsync() 排队、release() 放行，让并发任务串行执行；只以 ES module 发布，要求 Node 20 以上。

## Do's and Don'ts

- 许可登记为 MIT（宽松 SPDX），再分发时须保留版权与许可声明。
- 许可原始记录 MIT：README 标题栏与右侧 About 面板都标着 MIT license（证据：https://github.com/expo/await-lock）
