# Tabler Icons 进站报告 · 2026-09-05

访问方式：`curl.exe -sL https://r.jina.ai/https://…`。未改 `approved-v3`、`collections.js`、jsx、css。`status` 保持 `DRAFT`，无 `reviewerId`。

## 打开过的页

| 角色 | URL | 最终地址 | `<title>` | HTTP |
|---|---|---|---|---|
| 图标站 / identity | https://tabler.io/icons | https://tabler.io/icons | Tabler Icons: 6150+ free vector icons for web design | 200 |
| 文档 / breadth | https://tabler.io/docs/icons | https://tabler.io/docs/icons | Tabler Icons | 200 |
| home 图标 / proof | https://tabler.io/icons/icon/home | 同左 | Tabler Icons: 6150+ free vector icons for web design | 200 |
| React 库页（探测） | https://tabler.io/icons/libraries/react | 404，落到营销首页 | Tabler | 404 |
| 仓库 | https://github.com/tabler/tabler-icons | 同左 | GitHub - tabler/tabler-icons | 200 |
| LICENSE | https://github.com/tabler/tabler-icons/blob/main/LICENSE | 同左 | MIT / Copyright (c) 2020-2026 Paweł Kuna | 200 |

无登录墙。`/icons/libraries/react` 404，故 breadth 用文档页而非该 URL。

## 图标站看到什么

H2：**One Icon Set for Every Project**。副文：A complete icon set with 6184 icons… ready for Figma, apps, and design systems. 版本 **v3.46.0**。搜索框 **Search 5130 outline icons**（数字只记进站）。

能力卡：Ready-to-use（HTML 图 / 内联 SVG / sprite / React）；Multiple formats（Sketch, Illustrator, XD, Figma）；Customizable（24x24 grid, 2px stroke）；Free and open source。

价卡三张：

- **Open Source / Free**：Source code only；6150+ SVG icons；**MIT License**；Personal & Commercial License。
- **Bundle / $9**：PNG & PDF；Webfont；One-time payment。
- **All Package / $69**：premium icons 另含 HTML admin template、illustrations、email templates。

Contribute 链 `https://github.com/tabler/tabler-icons`。

`/icons/icon/home` 额外露出 **Customize icons**：Style / Size 32 / Stroke 2 / Color / Category。Jina 仍抽出整页壳，单项预览需截图核验。

## 文档页

Tabler Icons is a library of over 5,000 SVG icons drawn on a 24×24 grid. What's inside：React / Vue / Svelte / SolidJS / Preact / Astro 框架包、Webfont、Static SVG/PNG/PDF、Figma plugin。Quick start：`npm install @tabler/icons-react`，`import { IconArrowLeft } from '@tabler/icons-react'`。

仓库 README 另列 `@tabler/icons` 等包，LICENSE **MIT**，**Copyright (c) 2020-2026 Paweł Kuna**。

## 截图

`frontend/public/shots/tabler-icons/` 不存在。`sha256` / `bytes` 标 **pending**。

## 分类与人话

- 一级 `visual-assets` / 小类 `icons-symbols`。分类 `needs-review`。
- `noteZh` 去空白 136 字。`takeawayZh` 去空白 17 字。
- `access` = freemium + open-source：源码 MIT 免费，Bundle / All Package 另售。
- `atlasTerms` 空。

## 未做

无 `questions.md`。未写入 `approved-v3`。

## 2026-09-06 截图补采

原 `v2-identity/breadth/proof` 三张 sha256 相同（`/docs/icons` 会跳转、`/icons/icon/home` 在 headless 下仍是首页）。删旧 PNG 后按 `frontend/scripts/capture-jobs-icons.json` 重采。`status` 仍 `DRAFT`，`curatorId` 不变。`/icons/icon-font` 落到营销壳，breadth 用 GitHub 仓库；proof 用 `https://docs.tabler.io/icons`（不经 tabler.io 跳转）。

| 角色 | URL | sha256 | bytes |
|---|---|---|---|
| identity | https://tabler.io/icons | `187ec0088e48fd0181731ba8367ed1a38b84517d45865522dc8fec1e1f0cb5f1` | 127400 |
| breadth | https://github.com/tabler/tabler-icons | `79a69aeee0286a34ecd87cf9c16b3e3429522fa9cd96f92b11ffb82e41fef708` | 128245 |
| proof | https://docs.tabler.io/icons | `91e6536741425c1e80a156741ee1df03fa81bb361ddb8f064b554f1bbf9b4ebb` | 209070 |

三张哈希互不相同。
