---
version: "3"
releaseId: release-35315ecedf56c3d5
revision: ad49b72d620310eb94a0f109ff35f62b4d0a160c4ce5ef7c7c6c96a0c5eb306c
status: APPROVED
name: expo/react-native-action-sheet
description: "用 ActionSheetProvider 套出跨平台弹层菜单"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://github.com/expo/react-native-action-sheet
checkedAt: 2026-09-15T11:41:25.706Z
license: MIT
licenseEvidence: https://github.com/expo/react-native-action-sheet
confidence: 1
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/github-com-expo-react-native-action-sheet"
---

## Overview

Expo 维护的跨平台 ActionSheet 组件，iOS 上包原生 UIActionSheet、Android 上是纯 JS 实现，另有一个 web 版本；用法是先套 ActionSheetProvider，再调 showActionSheetWithOptions。

## Do's and Don'ts

- 许可登记为 MIT（宽松 SPDX），再分发时须保留版权与许可声明。
- 许可原始记录 MIT：About 栏的 MIT license 一行，根目录也有 LICENSE 文件（提交信息 Exponent -> Expo）（证据：https://github.com/expo/react-native-action-sheet）
