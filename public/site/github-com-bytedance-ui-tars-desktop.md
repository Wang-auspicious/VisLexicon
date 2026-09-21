---
version: "3"
releaseId: release-35315ecedf56c3d5
revision: c54dd519199767974b5cec8a109beef1d18f3df38ea9c18f5b6cbcb12c2b9536
status: APPROVED
name: bytedance/UI-TARS-desktop
description: "把 mcp-browser 接进自己的 agent"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://github.com/bytedance/UI-TARS-desktop
checkedAt: 2026-09-15T11:54:00.145Z
license: Apache-2.0
licenseEvidence: https://github.com/bytedance/UI-TARS-desktop
confidence: 1
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/github-com-bytedance-ui-tars-desktop"
---

## Overview

字节跳动的多模态 AI Agent 栈单体仓库，README 分 Agent TARS 与 UI-TARS Desktop 两条产品线，packages 里则是 GUI Agent SDK、mcp-browser、mcp-http-server 这些可单独用的包。提交历史里已经出现 sunsetting agent tars desktop 这样的收尾动作。

## Do's and Don'ts

- 许可登记为 Apache-2.0（宽松 SPDX），再分发时须保留版权与许可声明。
- 许可原始记录 Apache-2.0：截图 About 栏 Apache-2.0 license 一行（证据：https://github.com/bytedance/UI-TARS-desktop）
