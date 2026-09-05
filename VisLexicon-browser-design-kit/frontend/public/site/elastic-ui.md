---
version: "3"
name: "Elastic UI"
description: "用 yarn 装 @elastic/eui，先看 EuiButton"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://eui.elastic.co/
checkedAt: 2026-09-06T22:00:00.000Z
license: "SSPL-1.0 OR Elastic-2.0"
licenseEvidence: https://github.com/elastic/eui/blob/main/LICENSE.txt
confidence: 1
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/elastic-ui"
---

## Overview

Elasticsearch B.V. 维护的 Elastic UI React 组件框架，现为 v120.0.0，以 yarn add @elastic/eui 安装。默认双许可 SSPL-1.0 或 Elastic-2.0，不是 MIT。

## Do's and Don'ts

- 许可不是通用宽松协议，逐条确认条款后再使用。SSPL-1.0 OR Elastic-2.0：LICENSE.txt 写默认 dual license under the Server Side Public License, v 1 and the Elastic License 2.0，除非文件头另标 Apache-2.0 compatible 或仅 Elastic-2.0。该组合不在 OSI 开源之列，故 facets.licenses 记 custom，access 记 source-available。覆盖 elastic/eui 默认源码，不把个别 Apache 头文件当成全仓许可。
- 许可原始记录 SSPL-1.0 OR Elastic-2.0：LICENSE.txt 写默认 dual license under the Server Side Public License, v 1 and the Elastic License 2.0，除非文件头另标 Apache-2.0 compatible 或仅 Elastic-2.0。该组合不在 OSI 开源之列，故 facets.licenses 记 custom，access 记 source-available。覆盖 elastic/eui 默认源码，不把个别 Apache 头文件当成全仓许可。（证据：https://github.com/elastic/eui/blob/main/LICENSE.txt）
