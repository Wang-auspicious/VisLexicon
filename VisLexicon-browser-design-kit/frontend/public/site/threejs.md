---
version: "3"
name: three.js
description: "先建 Scene、相机和 WebGLRenderer，再往里放网格"
# —— 以下为 VisLexicon 扩展，规范未定义但不冲突
source: https://threejs.org/
checkedAt: 2026-09-06T02:50:00.000Z
license: MIT
licenseEvidence: https://github.com/mrdoob/three.js/blob/dev/LICENSE
confidence: 1
independentlyReviewed: true
vislexiconUrl: "https://vislexicon.com/#/site/threejs"
---

## Overview

mrdoob 等人维护的 JavaScript 3D 库，现为 r185。用 WebGL 与 WebGPU 在浏览器里建场景、相机与渲染器；npm 包 three 标 MIT，文档与示例公开。

## Do's and Don'ts

- 许可登记为 MIT（宽松 SPDX），再分发时须保留版权与许可声明。
- 许可原始记录 MIT：LICENSE 标题 The MIT License，Copyright © 2010-2026 three.js authors。package.json license 字段为 MIT。覆盖 three 包源码。（证据：https://github.com/mrdoob/three.js/blob/dev/LICENSE）
