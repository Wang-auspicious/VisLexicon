---
version: "3"
releaseId: release-35315ecedf56c3d5
revision: bb672825aee3f2a5201c29af9caa106fe94b3033d61aee87555ca6ad31440f2e
status: APPROVED
name: Acedomains/ui
description: "一份 ENS 域名读写函数清单，先看 setupENS"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://github.com/Acedomains/ui
checkedAt: 2026-09-15T11:35:58.167Z
license: BSD-2-Clause
licenseEvidence: https://github.com/Acedomains/ui
confidence: 1
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/github-com-acedomains-ui"
---

## Overview

ENS 应用共用的一套函数与组件库，README 列的是 setupENS、getOwner、setResolver 这类域名读写接口，外加子域名、反向记录、文本记录的处理。仓库三年没动，最后一次提交是在给空投合约补函数。

## Do's and Don'ts

- 许可登记为 BSD-2-Clause（宽松 SPDX），再分发时须保留版权与许可声明。
- 许可原始记录 BSD-2-Clause：右侧 About 栏的 BSD-2-Clause license 与 README 标题行的许可徽标（证据：https://github.com/Acedomains/ui）
