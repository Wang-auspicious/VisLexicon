---
version: "3"
releaseId: release-35315ecedf56c3d5
revision: b76f5a010a30cca6bc05dee44c976cede2699530bc922425a69fba0eb5900209
status: APPROVED
name: cerberauth/design-system
description: "取 @cerberauth/tokens 或 /ui 两个包"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://github.com/cerberauth/design-system
checkedAt: 2026-09-15T11:38:37.843Z
license: MIT
licenseEvidence: unknown
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/github-com-cerberauth-design-system"
---

## Overview

这是 CerberAuth 的内部设计系统 monorepo，对外发两个独立包：@cerberauth/tokens 放框架无关的 CSS design tokens，@cerberauth/ui 放基于 Shadcn/ui 的共享 React 组件。仓库自带 Storybook 8 + Vite 的组件文档应用和共享的 tsconfig、eslint-config。

## Do's and Don'ts

- 许可登记为 MIT（宽松 SPDX），再分发时须保留版权与许可声明。
