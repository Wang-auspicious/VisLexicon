# radix-ui visit report · 2026-09-05

访问方式：`curl.exe -sL https://r.jina.ai/https://URL`，辅以官网 HTML 与 GitHub raw LICENSE。无登录墙、无地区拦截、无崩溃。截图用本机 Chrome + 临时目录 `playwright-core`，视口 1280×900 首屏 PNG，非全页。

**finalUrl:** `https://www.radix-ui.com/`（未跳转）  
**checkedAt:** `2026-09-05T13:32:00.000Z`  
**curatorId:** `swarm-curator-new-1`  
**status:** `DRAFT`（未标 APPROVED，无 reviewerId）

---

## Opened

- 首页 `https://www.radix-ui.com/` → 200，`<title>Radix UI</title>`
- Primitives 产品页 `https://www.radix-ui.com/primitives`
- Primitives 文档总览 `https://www.radix-ui.com/primitives/docs`（落到 Introduction）
- Primitives 入门 `https://www.radix-ui.com/primitives/docs/overview/introduction`
- Primitives 安装教程 `https://www.radix-ui.com/primitives/docs/overview/getting-started`
- **组件目录** `https://www.radix-ui.com/primitives/docs/components`（breadth）
- **Dialog 文档** `https://www.radix-ui.com/primitives/docs/components/dialog`（proof）
- Themes 入门 `https://www.radix-ui.com/themes/docs/overview/getting-started`
- Icons `https://www.radix-ui.com/icons`
- Colors `https://www.radix-ui.com/colors`
- Blog `https://www.radix-ui.com/blog`
- GitHub `https://github.com/radix-ui/primitives`、`https://github.com/radix-ui/themes`
- LICENSE raw `https://raw.githubusercontent.com/radix-ui/primitives/main/LICENSE`、`https://raw.githubusercontent.com/radix-ui/themes/main/LICENSE`

**blocked:** 无。

---

## Quoted

1. 首页可见：「An open source component library optimized for fast development, easy maintenance, and accessibility. Just import and go—no configuration required.」
2. 首页 meta description：「Components, icons, and colors for building high‑quality, accessible UI. Free and open-source.」
3. 页眉：「Made by WorkOS」；Colors / Blog 页脚：「A project by WorkOS。」产品：Themes / Primitives / Colors / Icons。
4. 首页 GitHub 图标指向 `https://github.com/radix-ui/themes`；Primitives 文档 GitHub 指向 `https://github.com/radix-ui/primitives`。
5. Themes 入门：「Radix Themes is a pre-styled component library… If you are looking for the unstyled components, go to Radix Primitives。」
6. Primitives Introduction：「Radix Primitives is a low-level UI component library with a focus on accessibility, customization and developer experience。」Key Features 含 Accessible / Unstyled。
7. Components 目录题头：「Unstyled, accessible UI primitives for building high-quality design systems and web apps。」清单含 Accordion、Alert Dialog、Checkbox、Dialog、Tooltip 等；Form / OTP / Password Toggle 标 Preview。
8. Dialog：「A window overlaid on either the primary window or another dialog window, rendering the content underneath inert。」演示按钮「Edit profile」；源码 `import { Dialog } from "radix-ui"`；Features：「Supports modal and non-modal modes.」「Focus is automatically trapped within modal.」
9. primitives LICENSE：「MIT License / Copyright (c) 2022 WorkOS」
10. themes LICENSE：「MIT License / Copyright (c) 2023 WorkOS」
11. primitives README：「Licensed under the MIT License, Copyright © 2022-present WorkOS。」About：「Maintained by @workos。」
12. 首页中部 Pricing 卡片（Basic $0 / Growth $49 / Pro $99）是 Themes 的 Live examples，不是 Radix 售价。

---

## Three evidence pages

| role | URL | title | shot |
|---|---|---|---|
| identity | `https://www.radix-ui.com/` | Radix UI | `frontend/public/shots/radix-ui/v2-identity.png` 1280×900 / 393828 B |
| breadth | `https://www.radix-ui.com/primitives/docs/components` | Components – Radix Primitives | `v2-breadth.png` 1280×900 / 97685 B |
| proof | `https://www.radix-ui.com/primitives/docs/components/dialog` | Dialog – Radix Primitives | `v2-proof.png` 1280×900 / 176372 B |

截图无 Cookie 横幅、无登录墙。三张 URL 与画面均不同。

---

## Facts check

- **author / organization:** WorkOS（LICENSE 版权行；页眉 Made by WorkOS）。Themes README 另列 Benoît Grélard、Vlad Moroz、Andy Hook、Lucas Motta 为作者，版权仍是 WorkOS。
- **repository:** 本草案记 `https://github.com/radix-ui/primitives`。首页 GitHub 按钮实际是 `radix-ui/themes`。见 questions。
- **license:** MIT，覆盖对应仓库源码。
- **pricing:** Free / open-source。未见付费套餐。

---

## Classification note

入口 URL 是官网首页，当前产品是 **Radix Themes**（预样式组件库）。breadth / proof 按任务要求取了 **Primitives** 目录与 Dialog。主类暂放 `headless-accessible-primitives`，备选 `design-system-suites`，`classification.status: needs-review`。Themes / Primitives / Icons / Colors 是否拆成多个 Site Entry，见 questions。
