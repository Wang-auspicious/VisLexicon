---
version: "3"
releaseId: release-35315ecedf56c3d5
revision: d06df7cf8d5528057b0b896331d27c72f7bc4d746a98c68cd788a3222f8252bb
status: APPROVED
name: kevinbeaty/any-promise
description: "让库代码不挑 Promise 实现，交给调用方注册"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://github.com/kevinbeaty/any-promise
checkedAt: 2026-09-15T12:47:42.059Z
license: MIT
licenseEvidence: https://github.com/kevinbeaty/any-promise
confidence: 1
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/github-com-kevinbeaty-any-promise"
---

## Overview

让库代码不锁定某一种 Promise 实现：库只 require 这个包，由应用方决定注册 bluebird 还是用全局 Promise。

## Do's and Don'ts

- 许可登记为 MIT（宽松 SPDX），再分发时须保留版权与许可声明。
- 许可原始记录 MIT：README 顶部标 MIT license，右栏 About 也有 MIT license 条目，仓库根目录是 LICENSE（证据：https://github.com/kevinbeaty/any-promise）
