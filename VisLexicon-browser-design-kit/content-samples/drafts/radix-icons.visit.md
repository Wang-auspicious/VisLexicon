# radix-icons visit report · 2026-09-05

访问方式：`curl.exe -sL https://r.jina.ai/https://…`，辅以 GitHub raw。截图用本机 Chrome headless，视口 1280×900。官网无登录墙。`status` 保持 `DRAFT`，无 `reviewerId`。

**finalUrl:** `https://www.radix-ui.com/icons`（HTTP 200）  
**checkedAt:** `2026-09-05T23:15:00.000Z`  
**curatorId:** `swarm-batch-radix-split`

拆自混合草案。本条只覆盖 **Radix Icons**。官网是单页画廊+安装说明，没有独立 docs 站点。

## Opened

- 图标页 / identity `https://www.radix-ui.com/icons` → 200，`<title>Radix Icons</title>`
- 仓库 / breadth `https://github.com/radix-ui/icons` → 200
- packages 目录 / proof `https://github.com/radix-ui/icons/tree/main/packages` → 200，含 `generate-icon-lib` 与 `radix-icons`
- LICENSE `https://raw.githubusercontent.com/radix-ui/icons/master/LICENSE`
- README Authors：Vlad Moroz、Colm Tuite、Pedro Duarte、Lochlan Bunn
- npm `https://www.npmjs.com/package/@radix-ui/react-icons`：Jina 可读到 `npm i @radix-ui/react-icons`、License MIT、v1.3.2；无头 Chrome 截图被 Cloudflare「Performing security verification」拦住，故 proof 不用 npm 页。

首页可见：A crisp set of 15×15 icons；`npm i @radix-ui/react-icons`；Open in Figma / Download SVG / View on GitHub；图标按 Typography、Arrows、Design、Music 分格。

## Quoted

1. 仓库 About：「A crisp set of 15×15 icons designed by the @workos team。」回链 radix-ui.com/icons。
2. README：「For full documentation, visit radix-ui.com/icons。」（即本入口，无第二套文档。）
3. LICENSE：「MIT License / Copyright (c) 2022 WorkOS」
4. 官网安装示例：`import { FaceIcon, ImageIcon, SunIcon } from "@radix-ui/react-icons"`

## Screenshots

| role | URL | title | bytes | sha256 |
|---|---|---|---|---|
| identity | `https://www.radix-ui.com/icons` | Radix Icons | 96195 | `4865eefe…2135cb1b` |
| breadth | `https://github.com/radix-ui/icons` | GitHub - radix-ui/icons | 120701 | `c1b565ba…5ad3e6fc` |
| proof | `https://github.com/radix-ui/icons/tree/main/packages` | icons/packages at main | 70713 | `d348a69f…3767a63` |

三张不同 URL。identity 含 Figma 与 npm 入口，故 `facets.platforms` 含 `figma`。

## Classification

`visual-assets` / `icons-symbols`。

## 未做

未写入 `approved-v3`，未改 `collections.js`。
