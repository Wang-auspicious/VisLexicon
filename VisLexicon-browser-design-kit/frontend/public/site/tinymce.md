---
version: "3"
name: TinyMCE
description: "装 tinymce，GPL 或买商业许可"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://www.tiny.cloud/tinymce/
checkedAt: 2026-09-06T16:00:00.000Z
license: custom
licenseEvidence: https://raw.githubusercontent.com/tinymce/tinymce/main/LICENSE.md
confidence: 1
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/tinymce"
---

## Overview

Tiny Technologies 维护的富文本编辑器 TinyMCE，npm 包 tinymce 现为 v8.9.0。LICENSE.md 为 GPL-2.0-or-later；闭源商用需商业许可。Premium 与 Cloud 另售。

## Do's and Don'ts

- 许可不是通用宽松协议，逐条确认条款后再使用。custom：LICENSE.md 写 Licensed under the terms of GNU General Public License Version 2 or later。modules/tinymce/package.json license 为 GPL-2.0-or-later。字典无 GPL-2.0-or-later，facets 记 custom。覆盖核心编辑器源码。自托管需 license_key: 'gpl' 或商业密钥；Premium 插件与 Tiny Cloud 不在此 GPL 条款内。不是 MIT。
- 存在付费层：Freemium。
- 许可原始记录 custom：LICENSE.md 写 Licensed under the terms of GNU General Public License Version 2 or later。modules/tinymce/package.json license 为 GPL-2.0-or-later。字典无 GPL-2.0-or-later，facets 记 custom。覆盖核心编辑器源码。自托管需 license_key: 'gpl' 或商业密钥；Premium 插件与 Tiny Cloud 不在此 GPL 条款内。不是 MIT。（证据：https://raw.githubusercontent.com/tinymce/tinymce/main/LICENSE.md）
