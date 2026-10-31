---
version: "3"
releaseId: release-f4ac887f17c47614
revision: 9dccbd98370c566f690c2c4ac7fb989e6c12e48fb7a10dddb44c2a4ac7319929
status: APPROVED
name: "React Transition Group"
description: "管进出阶段，CSS 动画自己写"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://reactcommunity.org/react-transition-group/
checkedAt: 2026-09-07T01:44:00.000Z
license: BSD-3-Clause
licenseEvidence: https://raw.githubusercontent.com/reactjs/react-transition-group/master/LICENSE
confidence: 1
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/react-transition-group"
---

## Overview

React Community 维护的进入/退出过渡组件库 react-transition-group，现为 4.4.5。仓库 LICENSE 标 BSD-3-Clause。它不自己做样式动画，只暴露阶段并管理 class。

## Do's and Don'ts

- 许可登记为 BSD-3-Clause（宽松 SPDX），再分发时须保留版权与许可声明。
- 许可原始记录 BSD-3-Clause：LICENSE 标题 BSD 3-Clause License，Copyright (c) 2018, React Community。package.json license 为 BSD-3-Clause。覆盖 react-transition-group 源码，不覆盖第三方动画库。（证据：https://raw.githubusercontent.com/reactjs/react-transition-group/master/LICENSE）
