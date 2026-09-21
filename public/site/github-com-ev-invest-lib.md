---
version: "3"
releaseId: release-35315ecedf56c3d5
revision: 104fe95e4a9dbccc3e314b0b4a2adfc167b35586ee231c14b2251dfb1d66dbd4
status: APPROVED
name: EV-invest/lib
description: "看 tokens.css 怎么把品牌拆成选项"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://github.com/EV-invest/lib
checkedAt: 2026-09-15T11:41:21.228Z
license: "BlueOak-1.0.0（不在受控词典枚举内，licenses 记 custom）"
licenseEvidence: https://github.com/EV-invest/lib
confidence: 1
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/github-com-ev-invest-lib"
---

## Overview

EV-invest 的内部共享库 monorepo，README 说每个库都是 opt-in，Rust 侧按 Cargo feature 挑、TypeScript 侧按 ts/ 下的包挑，仓库里同时躺着 tokens.css、motion.css 和 rust/、ts/ 两套实现。

## Do's and Don'ts

- 许可不是通用宽松协议，逐条确认条款后再使用。BlueOak-1.0.0（不在受控词典枚举内，licenses 记 custom）：About 栏的 BlueOak-1.0.0 license 一行
- 许可原始记录 BlueOak-1.0.0（不在受控词典枚举内，licenses 记 custom）：About 栏的 BlueOak-1.0.0 license 一行（证据：https://github.com/EV-invest/lib）
