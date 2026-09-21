---
version: "3"
releaseId: release-35315ecedf56c3d5
revision: b57a9e0b2e43be1b88fa17f50422209f79eb14025144d79baa565e05bf9adb25
status: APPROVED
name: CellarNode/cellarnode-auth
description: "OTP 登录的 token store 与 React 表单"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://github.com/CellarNode/cellarnode-auth
checkedAt: 2026-09-15T11:38:37.059Z
license: "MIT license"
licenseEvidence: https://github.com/CellarNode/cellarnode-auth
confidence: 1
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/github-com-cellarnode-cellarnode-auth"
---

## Overview

cellarnode-auth 是 CellarNode 各仪表盘共用的 OTP 认证包，里面是一个 token store、一个 API client，加上 RegisterForm 和 OTP 输入框这些 React 组件。框架无关的部分可以单独引，React 组件走同一个包的 React 入口。

## Do's and Don'ts

- 许可登记为 MIT（宽松 SPDX），再分发时须保留版权与许可声明。
- 许可原始记录 MIT license：About 栏与 Repository files navigation 均标注 MIT license（证据：https://github.com/CellarNode/cellarnode-auth）
