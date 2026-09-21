---
version: "3"
releaseId: release-35315ecedf56c3d5
revision: 72335a12c81e6c953ba4615cf07a19a256ede90779cb80901e7b251b862993ea
status: APPROVED
name: styled-components/css-to-react-native
description: "粘一段 CSS，拿到能直接用的 RN style 对象"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://github.com/styled-components/css-to-react-native
checkedAt: 2026-09-15T11:57:32.500Z
license: MIT
licenseEvidence: https://github.com/styled-components/css-to-react-native
confidence: 1
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/github-com-styled-components-css-to-react-native"
---

## Overview

把 CSS 文本转成 React Native 的 stylesheet 对象：font-size: 18px 变 fontSize: 18，text-shadow-offset 拆成 width / height，transform 还会倒序重排以适配 RN。styled-components 组织维护，README 里有 Try it here 的在线试用。

## Do's and Don'ts

- 许可登记为 MIT（宽松 SPDX），再分发时须保留版权与许可声明。
- 许可原始记录 MIT：右侧 About 的 MIT license、README 顶部 MIT license 行与 LICENSE.md 文件（证据：https://github.com/styled-components/css-to-react-native）
