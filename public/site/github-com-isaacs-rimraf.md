---
version: "3"
releaseId: release-35315ecedf56c3d5
revision: 15628f997cbabbc9b05f65745643acce6175fbfabb2f6cd29e34721b199bab49
status: APPROVED
name: isaacs/rimraf
description: "在 Node 构建脚本里跨平台递归删目录，替代 rm -rf"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://github.com/isaacs/rimraf
checkedAt: 2026-09-15T12:06:51.159Z
license: BlueOak-1.0.0
licenseEvidence: https://github.com/isaacs/rimraf
confidence: 1
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/github-com-isaacs-rimraf"
---

## Overview

Node 里跨平台的 rm -rf 实现，用来递归删除文件与目录。README 开篇就是一整段安全警告：别把不可信输入喂给它，并通过 --impl=move-remove 与 --tmp 参数说明可以改成先移到临时目录再删。

## Do's and Don'ts

- 许可不是通用宽松协议，逐条确认条款后再使用。BlueOak-1.0.0：About 栏与文件列表里都标 BlueOak-1.0.0 license；本库许可证词表里没有这一项，故 facets.licenses 记作 custom
- 许可原始记录 BlueOak-1.0.0：About 栏与文件列表里都标 BlueOak-1.0.0 license；本库许可证词表里没有这一项，故 facets.licenses 记作 custom（证据：https://github.com/isaacs/rimraf）
