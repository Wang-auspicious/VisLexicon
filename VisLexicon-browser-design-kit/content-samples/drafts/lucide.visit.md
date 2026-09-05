# Lucide 进站报告 · 2026-09-05

访问方式：`curl.exe -sL https://r.jina.ai/https://…`，并用浏览器 UA 拉原始 HTML 核 `<title>` / 页脚；截图用本机 Chrome headless CDP，视口 1280×900，`captureBeyondViewport: false`。未改 `approved-v3`、`collections.js`、jsx、css。`status` 保持 `DRAFT`，无 `reviewerId`。

## 打开过的页

| 角色 | URL | 最终地址 | `<title>` |
|---|---|---|---|
| 首页 / identity | https://lucide.dev/ | https://lucide.dev/ | Lucide |
| 图标目录 / breadth | https://lucide.dev/icons/ | https://lucide.dev/icons/ | Icons – Lucide |
| 单项 / proof | https://lucide.dev/icons/house | https://lucide.dev/icons/house | house icon details – Lucide |
| 许可 | https://lucide.dev/license | https://lucide.dev/license | License – Lucide |
| 包列表 | https://lucide.dev/packages | https://lucide.dev/packages | Lucide Icons（Jina）/ 页内 H1 Packages |
| 指南 | https://lucide.dev/guide/ | https://lucide.dev/guide/ | Lucide Icons（Jina） |
| 仓库 | https://github.com/lucide-icons/lucide | 同左 | GitHub - lucide-icons/lucide: Beautiful & consistent icon toolkit… |
| LICENSE 文件 | https://github.com/lucide-icons/lucide/blob/main/LICENSE | 同左 | lucide/LICENSE at main · lucide-icons/lucide |

首页 HTTP 200，Vercel，无跳转。`og:title` = Lucide Icons；`meta description` = Beautiful & consistent icon toolkit made by the community.

## 首页看到什么

深色顶栏：Icons / Guide / Resources / Packages / Showcase / Merch。大标题 **Beautiful & consistent icons**，副标题 **Made by the community.** 三个按钮 View all icons / Get Started / GitHub，下面搜索框占位 **Search 1813 icons...**（只记进站，不写进 `noteZh`）。右侧是带节点的螺旋线标。首屏特性卡：Lightweight & Scalable（SVG）、Clean & consistent、Customizable；再往下 Packages support、Tree shakable、Active community。

页脚（HTML 抽出，首屏截图未滚到）：License / Contribute / Changelog / GitHub / Issues；**Released under the ISC License. Copyright © 2026 Lucide Icons**。GitHub 链到 `https://github.com/lucide-icons/lucide`。版本徽章 v1.41.0。Meet the team：Eric Fennis = Creator of Lucide；Karsa Rigó、Jakob Guddas = Maintainer。另有 `/llms.txt` 提示。

## 图标目录

左侧 Customizer：Color `#ffffff`、Stroke width 2px、Size 24px、Absolute stroke width。Include external libs / Lab。View All，Categories 从 Accessibility、Accounts & access、Animals、Arrows 往下排。主区搜索框 + Popularity，深色圆角图标格（x、check、search、house…）。右下角实时叠了一块 **ADS VIA CARBON**（BigQuery），截图如实保留，未遮挡主体网格。

## house 单项

标题 house；标签 home / living / building / residence；类别 Buildings、Home、Navigation。按钮 **Copy SVG**、**Copy JSX**。代码页签 Vanilla / React / Vue / Svelte / Preact / Solid / Angular / Icon font。Vanilla 示例：`import { createIcons, House } from 'lucide'`。React 示例为 `tsx`：`import { House } from 'lucide-react'`。Created v0.0.0，Last changed v0.543.0。下方 See this icon in action。同类：house-heart、house-plug、house-plus、house-wifi、map-pin-house。

## 许可与价格

`/license` 主体 **ISC License**，Copyright (c) 2026 Lucide Icons and Contributors。同页列出一批从 Feather 派生的图标名，那些图标另适用 MIT（Copyright Cole Bemis）。仓库 LICENSE 文件与此一致。GitHub README：**Lucide is totally free for commercial use and personal use, this software is licensed under the ISC License.** 图标浏览/复制无登录墙。导航有 Merch（`https://merch.lucide.dev/`），那是周边店，不计入本入口定价。

## 仓库与包

README 自称 community 开源图标库、Feather Icons 的 fork；链 Icons / Guide / Packages / License / Showcase。官方包页列出 lucide、lucide-react、@lucide/vue、@lucide/svelte、lucide-solid、lucide-react-native、@lucide/angular、lucide-preact、@lucide/astro、lucide-static。另有第三方 Laravel / Flutter 等，不当成官方交付。GitHub 另有 Figma plugin 段（Figma Community plugin/939567362549682242），故 facets.platforms 含 `figma`。

## 截图

| 文件 | 视口 | bytes | sha256 |
|---|---|---|---|
| `frontend/public/shots/lucide/v2-identity.png` | 1280×900 | 198223 | `292a766f3009682f937638fef74774a9628ff0fa0efcde49a30b4429ab8173d7` |
| `frontend/public/shots/lucide/v2-breadth.png` | 1280×900 | 129922 | `c76a30ca559a0d6fa7fb20bffe781139ee19fe92012f7ce107e0987d60f9318b` |
| `frontend/public/shots/lucide/v2-proof.png` | 1280×900 | 103844 | `9d1d619844c17d95fbd80fdacf8e8fa784b57626cb145fb1f745b601442d0b32` |

三张不同 URL、不同画面。identity 无 cookie 墙。breadth 含 Carbon 广告，属当时首屏。

## 分类与人话

- 一级 `visual-assets` / 小类 `icons-symbols`。分类 `needs-review`，待独立复核，未标 APPROVED。
- `noteZh` 去空白 157 字。`takeawayZh` 去空白 18 字。三条 `selectionRationale` 均 ≤40。
- `atlasTerms` 空：目录是图标名，不是图鉴里的组件解剖术语。

## 未做

无 `questions.md`（未卡住）。未写入 `approved-v3`，未改 collections / 前端代码。
