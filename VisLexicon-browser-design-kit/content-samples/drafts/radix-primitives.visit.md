# radix-primitives visit report · 2026-09-05

访问方式：`curl.exe -sL https://r.jina.ai/https://…`，辅以 `curl.exe -sI` 与 GitHub raw LICENSE。截图用本机 Chrome headless，视口 1280×900。无登录墙。`status` 保持 `DRAFT`，无 `reviewerId`。

**finalUrl:** `https://www.radix-ui.com/primitives`（HTTP 200）  
**checkedAt:** `2026-09-05T23:15:00.000Z`  
**curatorId:** `swarm-batch-radix-split`

拆自混合草案 `radix-ui.json`。本条只覆盖 **Radix Primitives**（无样式无障碍原语）。

## Opened

- 产品页 / identity `https://www.radix-ui.com/primitives` → 200，`<title>Radix Primitives</title>`
- Introduction / breadth `https://www.radix-ui.com/primitives/docs/overview/introduction` → 200，`Introduction – Radix Primitives`
- 组件目录 `https://www.radix-ui.com/primitives/docs/components` → 200，`Components – Radix Primitives`（清单 Accordion→Tooltip；Form / OTP / Password Toggle 标 Preview）
- Dialog / proof `https://www.radix-ui.com/primitives/docs/components/dialog` → 200，`Dialog – Radix Primitives`
- 仓库 `https://github.com/radix-ui/primitives`
- LICENSE `https://raw.githubusercontent.com/radix-ui/primitives/main/LICENSE`

breadth 选用 Introduction（任务允许 intro or components catalog）：侧栏已列出全部原语，正文把 Unstyled / Accessible 说清。组件目录页已打开核对清单。

## Quoted

1. 产品页：「Unstyled, accessible, open source React primitives for high-quality web apps and design systems。」
2. Introduction：「Radix Primitives is a low-level UI component library with a focus on accessibility, customization and developer experience。」Key Features：Accessible、Unstyled。
3. Introduction 建议安装 `radix-ui` 包，也可按原语单独安装。
4. Dialog：「A window overlaid on either the primary window or another dialog window, rendering the content underneath inert。」`import { Dialog } from "radix-ui"`。Features：「Focus is automatically trapped within modal.」
5. LICENSE：「MIT License / Copyright (c) 2022 WorkOS」
6. 仓库 About：Maintained by @workos，回链 radix-ui.com/primitives。

## Screenshots

| role | URL | title | bytes | sha256 |
|---|---|---|---|---|
| identity | `https://www.radix-ui.com/primitives` | Radix Primitives | 619002 | `c59413f1…d8e844e6` |
| breadth | `https://www.radix-ui.com/primitives/docs/overview/introduction` | Introduction – Radix Primitives | 105162 | `11bf5e4e…e76fa69c` |
| proof | `https://www.radix-ui.com/primitives/docs/components/dialog` | Dialog – Radix Primitives | 176372 | `7b9969b4…adda8d75` |

proof 与旧混合草案 `radix-ui` 的 Dialog 截图为同一页、同一文件哈希，画面正确。

## Classification

`ui-implementation` / `headless-accessible-primitives`。与 Themes 拆开后不再需要 design-system-suites 备选。

## 未做

未写入 `approved-v3`，未改 `collections.js`。
