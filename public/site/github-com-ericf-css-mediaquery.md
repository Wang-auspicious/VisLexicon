---
version: "3"
releaseId: release-35315ecedf56c3d5
revision: 6cb95afe6b843afbb483b7ec3d6d2711f5877a11b3a8611eb74be077cdd609c0
status: APPROVED
name: ericf/css-mediaquery
description: "用 match() 判断媒体查询是否命中当前设备"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://github.com/ericf/css-mediaquery
checkedAt: 2026-09-15T11:57:25.964Z
license: unknown
licenseEvidence: unknown
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/github-com-ericf-css-mediaquery"
---

## Overview

一个 npm 包，把 CSS 媒体查询串解析成 AST，并判断它跟某组设备值是否匹配，对外只有 parse() 和 match() 两个导出。README 举的例子是 screen and (min-width: 40em) 对 { type: 'screen', width: '1024px' }。

## Do's and Don'ts

- 站点上未找到明确的许可声明，本条记录按 v3 规格记为 unknown；再分发或商用前必须自行确认。
