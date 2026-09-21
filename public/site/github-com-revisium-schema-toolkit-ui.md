---
version: "3"
releaseId: release-35315ecedf56c3d5
revision: 456f5c4b133782be90f5a818ab0bc18bdbbfddb6b390ea2c4d18e0e933a3dad5
status: APPROVED
name: revisium/schema-toolkit-ui
description: "用 schema 编辑组件生成可视化 diff"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://github.com/revisium/schema-toolkit-ui
checkedAt: 2026-09-15T11:49:55.069Z
license: MIT
licenseEvidence: https://github.com/revisium/schema-toolkit-ui
confidence: 1
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/github-com-revisium-schema-toolkit-ui"
---

## Overview

一组用来编辑 JSON Schema 并生成可视化 diff / patch 的 React 组件，底层是 @revisium/schema-toolkit。接入方式是 VM 配组件的写法，例如 new CreatingEditorVM(schema, callbacks) 交给 <CreatingSchemaEditor vm={vm} />，peer 依赖 Chakra UI 与 MobX。

## Do's and Don'ts

- 许可登记为 MIT（宽松 SPDX），再分发时须保留版权与许可声明。
- 许可原始记录 MIT：About 栏标 MIT license，README 文件表头同样显示 MIT license（证据：https://github.com/revisium/schema-toolkit-ui）
