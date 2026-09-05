# Heroicons 进站报告 · 2026-09-05

访问方式：`curl.exe -sL https://r.jina.ai/https://…`，并用浏览器 UA 拉原始 HTML 核 `<title>` / 首屏文案；LICENSE 走 GitHub。未改 `approved-v3`、`collections.js`、jsx、css。`status` 保持 `DRAFT`，无 `reviewerId`。

## 打开过的页

| 角色 | URL | 最终地址 | `<title>` | HTTP |
|---|---|---|---|---|
| 首页 / identity | https://heroicons.com/ | https://heroicons.com/ | Heroicons | 200 |
| Solid 目录 / breadth | https://heroicons.com/solid | https://heroicons.com/solid | Heroicons | 200 |
| 单图标路径 / proof | https://heroicons.com/home | https://heroicons.com/home | Heroicons | 200 |
| Outline 路径 | https://heroicons.com/outline | 同左 | Heroicons | 200 |
| 仓库 | https://github.com/tailwindlabs/heroicons | 同左 | GitHub - tailwindlabs/heroicons: A set of free MIT-licensed high-quality SVG icons for UI development. | 200 |
| LICENSE | https://github.com/tailwindlabs/heroicons/blob/master/LICENSE | 同左 | heroicons/LICENSE at master · tailwindlabs/heroicons | 200 |

站点是 Next.js catch-all `[[...slug]]`。`/outline`、`/solid`、`/home` 均 200，HTML 体积不同（home ~398924 B，outline ~398942 B，solid ~442574 B）。无跳转。无登录墙。

## 首页看到什么

`<title>` = Heroicons。meta description = Beautiful hand-crafted SVG icons, by the makers of Tailwind CSS.

首屏：大标题同上；旁标 **316 icons**、**MIT license**、**React & Vue libraries**（数字只记进站，不写进 `noteZh`）。顶栏可切 **Outline**（24x24, 1.5px stroke）、**Solid**（24x24, Solid fill）、**Mini**（20x20）、**Micro**（16x16）。默认 Outline 为当前档。图标名从 academic-cap 起铺成网格。

链接：GitHub `https://github.com/tailwindlabs/heroicons`；Figma Community file `https://www.figma.com/community/file/1143911270904274171`（Get Figma File）；Twitter 分享文案 **Check out Heroicons by @steveschoger and the @tailwindcss team**。

## 风格与单图标路径

`/solid` 将 Solid 标为当前档（`aria-label="Solid, 24x24, Solid fill"` 为选中态），HTML 明显大于 Outline，对应填色 SVG。`/home` 是单个图标名的 slug 入口；SSR 仍是同一套 SPA 壳，客户端是否自动打开 home 图标需截图核验。

## 许可与价格

仓库 LICENSE：**MIT License**，**Copyright (c) Tailwind Labs, Inc.** README：**This library is MIT licensed.** 首页写 MIT license。图标浏览无付费墙。官方包：`@heroicons/react`、`@heroicons/vue`，按 `24/outline`、`24/solid`、`20/solid`、`16/solid` 导入。

## 截图

`frontend/public/shots/heroicons/` 不存在。`sha256` / `bytes` 标 **pending**。

## 分类与人话

- 一级 `visual-assets` / 小类 `icons-symbols`。分类 `needs-review`，无 `reviewerId`。
- `noteZh` 去空白 147 字。`takeawayZh` 去空白 22 字。
- `atlasTerms` 空：目录是图标名，不是图鉴组件术语。

## 未做

无 `questions.md`（三条路径均 200）。未写入 `approved-v3`，未改 collections / 前端代码。

## 2026-09-06 截图补采

原 `v2-identity/breadth/proof` 三张 sha256 相同（`/solid`、`/home` 在 headless 下仍是首页）。删旧 PNG 后按 `frontend/scripts/capture-jobs-icons.json` 重采。`status` 仍 `DRAFT`，`curatorId` 不变。npm `heroicons` 返回 Cloudflare interstitial，proof 改用 `src/24/outline` 源文件目录。

| 角色 | URL | sha256 | bytes |
|---|---|---|---|
| identity | https://heroicons.com/ | `fcc334704c564b69cb536dc7745fb0eec0a61ebe3a6c4be1005e319dee3d44c6` | 176180 |
| breadth | https://github.com/tailwindlabs/heroicons | `76de3dad659fbf090e480e177adffff515f3971ae5bf12a0887dd2390eb914dd` | 121871 |
| proof | https://github.com/tailwindlabs/heroicons/tree/master/src/24/outline | `baea927d35f08adaeabc3133590d30e1265f0ca3ea92555ff00f322d6a54c6b9` | 115375 |

三张哈希互不相同。
