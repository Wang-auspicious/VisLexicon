# radix-themes visit report · 2026-09-05

访问方式：`curl.exe -sL https://r.jina.ai/https://…`，辅以 `curl.exe -sI` 核 HTTP 状态、GitHub raw LICENSE。截图用本机 Chrome headless，视口 1280×900 首屏 PNG。无登录墙、无地区拦截。`status` 保持 `DRAFT`，无 `reviewerId`。

**finalUrl:** `https://www.radix-ui.com/`（HTTP 200，未跳转）  
**checkedAt:** `2026-09-05T23:15:00.000Z`  
**curatorId:** `swarm-batch-radix-split`

拆自混合草案 `radix-ui.json`。本条只覆盖 **Radix Themes**（预样式组件库），与 Primitives / Icons / Colors 分列。

## Opened

- 首页 / identity `https://www.radix-ui.com/` → 200，`<title>Radix UI</title>`
- Getting started / breadth `https://www.radix-ui.com/themes/docs/overview/getting-started` → 200，`Getting started – Radix Themes`
- Dialog / proof `https://www.radix-ui.com/themes/docs/components/dialog` → 200，`Dialog – Radix Themes`
- Button 文档 `https://www.radix-ui.com/themes/docs/components/button`（备选 proof，未采用）
- Playground `https://www.radix-ui.com/themes/playground`
- 仓库 `https://github.com/radix-ui/themes`
- LICENSE `https://raw.githubusercontent.com/radix-ui/themes/main/LICENSE`
- README `https://raw.githubusercontent.com/radix-ui/themes/main/README.md`

**blocked / 404:** `https://www.radix-ui.com/themes/docs/components/overview` 返回 404（capture-jobs 旧 URL）。breadth 改用 Getting started：该页侧栏含完整 Theme / Layout / Components 清单。

## Quoted

1. 首页：「An open source component library optimized for fast development, easy maintenance, and accessibility. Just import and go—no configuration required.」
2. 页眉：Themes 为当前产品；Made by WorkOS；GitHub 指向 `radix-ui/themes`。
3. Getting started：「Radix Themes is a pre-styled component library that is designed to work out of the box with minimal configuration. If you are looking for the unstyled components, go to Radix Primitives。」
4. 安装：`npm install @radix-ui/themes`；`import "@radix-ui/themes/styles.css"`。
5. Dialog：「Modal dialog window displayed above the page。」演示按钮 Edit profile；源码 `Dialog.Root` / `Dialog.Trigger`。
6. LICENSE：「MIT License / Copyright (c) 2023 WorkOS」
7. README Authors：Benoît Grélard、Vlad Moroz、Andy Hook、Lucas Motta。
8. 首页 Pricing 卡（Basic $0 / Growth $49 / Pro $99）是 Themes 演示，不是 Radix 售价。

## Screenshots

| role | URL | title | bytes | sha256 |
|---|---|---|---|---|
| identity | `https://www.radix-ui.com/` | Radix UI | 494191 | `46f958ec…366a49` |
| breadth | `https://www.radix-ui.com/themes/docs/overview/getting-started` | Getting started – Radix Themes | 80831 | `2a330d96…91a5efe` |
| proof | `https://www.radix-ui.com/themes/docs/components/dialog` | Dialog – Radix Themes | 78466 | `3b36d5d6…48a52f3d` |

三张不同 URL、不同画面。identity 为深色首页。无 Cookie 横幅。

## Classification

`ui-implementation` / `design-system-suites`。Getting started 明确 pre-styled，与 Primitives 分流，不再需要 alternatives。

## 未做

未写入 `approved-v3`，未改 `collections.js`。待独立复核。
