---
version: "3"
releaseId: release-35315ecedf56c3d5
revision: cd441a090ea08b3af55607929154df7e58fbd103f38a4b2d971e75c9591253e0
status: APPROVED
name: looopy-ai/lib
description: "装 @looopy-ai/core，用它起一个流式 agent。"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://github.com/looopy-ai/lib
checkedAt: 2026-09-15T11:45:18.243Z
license: MIT
licenseEvidence: https://github.com/looopy-ai/lib
confidence: 0.7
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/github-com-looopy-ai-lib"
---

## Overview

用 TypeScript 和 RxJS 写的 AI agent 框架，core 里是 Agent 类、runLoop、工具与提示插件和流式助手，aws 包接 DynamoDB 与 Bedrock AgentCore，react 包供聊天界面。

## Do's and Don'ts

- 许可登记为 MIT（宽松 SPDX），再分发时须保留版权与许可声明。
- 许可原始记录 MIT：README 末尾 License 一节写 This project is licensed under the MIT License；不过 GitHub 的 license 接口对该仓库返回无许可证文件，LICENSE 文件可能未入库。（证据：https://github.com/looopy-ai/lib）
