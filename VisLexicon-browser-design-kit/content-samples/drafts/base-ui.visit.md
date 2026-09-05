# base-ui visit report · 2026-09-05

访问方式：`curl.exe -sL https://r.jina.ai/https://URL`，辅以官网 HTML 与 GitHub raw。PowerShell 的 `curl` 是 `Invoke-WebRequest` 别名，已改用 `curl.exe`。截图用本机 Chrome headless CDP，视口 1280×900，首屏 PNG。无登录墙、无地区拦截、无崩溃。`status` 保持 `DRAFT`，无 `reviewerId`。

---

## Base UI

- **inputUrl / finalUrl:** `https://base-ui.com/`（HTTP 200，无跳转）
- **checkedAt:** `2026-09-05T13:24:56.304Z`
- **opened:**
  - 首页 `https://base-ui.com/`
  - Quick start `https://base-ui.com/react/overview/quick-start`（及 `.md`）
  - About `https://base-ui.com/react/overview/about`
  - Community `https://base-ui.com/react/overview/community`
  - 组件目录 `https://base-ui.com/react/components`
  - Dialog 单项 `https://base-ui.com/react/components/dialog`
  - GitHub `https://github.com/mui/base-ui`
  - LICENSE `https://github.com/mui/base-ui/blob/master/LICENSE` 与 raw
  - `packages/react/package.json` raw
- **blocked:** 无。npm 页 `https://www.npmjs.com/package/@base-ui/react` 经 Jina 返回 403，未当作证据；安装命令改从官方 Quick start 取。
- **quoted:**
  1. 首页 `<title>`：「Unstyled UI components for accessible design systems · Base UI」
  2. 首页：「From the creators of Radix, Floating UI, and Material UI, Base UI is a comprehensive UI component library for building accessible user interfaces with React.」
  3. 首页 FAQ What is Base UI?：「Base UI is a library of unstyled UI components for building accessible component libraries, user interfaces, web applications, and websites with React.」
  4. 首页 FAQ 样式：「Yes. Base UI works with Tailwind, CSS Modules, CSS-in-JS, plain CSS, and any other styling library you prefer. … The package does not bundle any CSS」
  5. 首页 FAQ 商用：「Yes. Base UI is licensed under the MIT license, and is free for commercial use.」
  6. 页脚：`© Base UI`；链接 X / GitHub / Discord / npm / Bluesky
  7. About：「An open-source React component library for building accessible user interfaces.」Headless / Accessible / Composable。
  8. Quick start：`npm i @base-ui/react`；旧名 `@base-ui-components/react` 已更名。
  9. Community：GitHub 链到 `https://github.com/mui/base-ui`；并列出 shadcn/ui、coss ui 等 styled libraries。
  10. 组件目录标题 `Components · Base UI`，清单 Accordion … Tooltip。
  11. Dialog 标题 `Dialog · Base UI`：「A popup that opens on top of the entire page.」演示按钮「View notifications」；`import { Dialog } from '@base-ui/react/dialog'`。
  12. LICENSE：「MIT License / Copyright (c) 2019 Material-UI SAS」
  13. `packages/react/package.json`：`"author": "MUI Team"`，`"license": "MIT"`，`"homepage": "https://base-ui.com"`
- **facts:**
  - author = MUI Team
  - organization = Material-UI SAS（LICENSE 版权行；GitHub 组织名为 mui）
  - repository = https://github.com/mui/base-ui
  - license = MIT（覆盖本仓库源码，不覆盖 Community 页第三方库）
  - pricing = Free（FAQ 明确可商用）
  - package = @base-ui/react
- **screenshots:** 三张均为真实 1280×900 首屏 PNG，已写入 `frontend/public/shots/base-ui/v2-{identity,breadth,proof}.png`。
  - identity 72162 B / sha256 `bd8c1013a2372a3a00b973038a5708e8a06937bbb2e834087b16cc387ed547ed`
  - breadth 116201 B / sha256 `23b374ef15a2f57a539b8ed30e50e631573d4bdd162fe17dad1f1d53ae2f13ae`
  - proof 99547 B / sha256 `4c705fc2cbde96f922a4cbf2e0460f01602753312b2e5ec445effb50d960d052`
- **noteZh:** 168 字。写了首页无样式主张与 Radix/MUI 来历、目录 Accordion→Slider、Dialog 演示/源码/Anatomy、MIT 与 shadcn 分流。
- **查重:** `approved-v3/` 无 base-ui 条目。shadcn-ui / origin-ui 仅把 `base-ui` 当作技术面。本条是官网入口，`entityId` `entity-base-ui`。
