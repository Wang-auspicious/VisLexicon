# radix-colors visit report · 2026-09-05

访问方式：`curl.exe -sL https://r.jina.ai/https://…`，辅以 GitHub raw 与 `.md` 文档。截图用本机 Chrome headless，视口 1280×900。无登录墙。`status` 保持 `DRAFT`，无 `reviewerId`。

**finalUrl:** `https://www.radix-ui.com/colors`（HTTP 200）  
**checkedAt:** `2026-09-05T23:15:00.000Z`  
**curatorId:** `swarm-batch-radix-split`

拆自混合草案。本条只覆盖 **Radix Colors**（色阶系统）。

## Opened

- 首页 / identity `https://www.radix-ui.com/colors` → 200，`<title>Radix Colors</title>`
- Installation / breadth `https://www.radix-ui.com/colors/docs/overview/installation` → 200，`Installation – Radix Colors`（另取 `.md` 核安装命令）
- Scales `https://www.radix-ui.com/colors/docs/palette-composition/scales` → 200，列出 Gray→Sky 等色阶及 Alpha / Dark 变体
- Custom palette / proof `https://www.radix-ui.com/colors/custom` → 200，`Create a custom palette – Radix Colors`
- 仓库 `https://github.com/radix-ui/colors`
- LICENSE `https://raw.githubusercontent.com/radix-ui/colors/main/LICENSE`

## Quoted

1. 首页：「A gorgeous, accessible color system for user interfaces」；页脚「A project by WorkOS」。
2. 色阶用途标签：Backgrounds / Interactive components / Borders and separators / Solid colors / Accessible text；步号 1–12。
3. Installation：Current version is `3.0.0`；`npm install @radix-ui/colors`；CDN `cdn.jsdelivr.net/npm/@radix-ui/colors@latest/…css`（注明 production 不推荐 CDN）。
4. Custom palette：Accent / Gray / Background 输入与 Copy；「Please upgrade to the new version.」
5. LICENSE：MIT；Copyright (c) 2021-2022 Modulz；Copyright (c) 2022-Present WorkOS。
6. README Authors：Colm Tuite、Vlad Moroz。

## Screenshots

| role | URL | title | bytes | sha256 |
|---|---|---|---|---|
| identity | `https://www.radix-ui.com/colors` | Radix Colors | 104298 | `ebe0cc03…c8d96448` |
| breadth | `https://www.radix-ui.com/colors/docs/overview/installation` | Installation – Radix Colors | 61369 | `b09663aa…53a509a7` |
| proof | `https://www.radix-ui.com/colors/custom` | Create a custom palette | 116176 | `88c91ef9…4af756d9` |

## Classification gap

一级 `visual-assets` 正确（色彩是可安装的视觉素材）。`CURATION_SUBCATEGORIES.visual-assets` **没有 color-palette / color-scales 小类**。

不可用：

- `icons-symbols`：不是图标
- `fonts-typefaces`：不是字体
- `visual-implementation`：不是动效/3D 代码
- `creation-tools`：不是创作软件

暂挂 `illustrations-vectors`（视觉素材里相对最近、且不属于摄影/视频/音频/3D）。备选 `templates-design-files` / `ui-kits-design-files`。`classification.status: needs-review`。请复核人决定是否补小类。

## 未做

未写入 `approved-v3`，未改 `collections.js`。
