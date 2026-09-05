# ark-ui visit report · 2026-09-05

访问方式：`curl.exe -sL https://r.jina.ai/https://URL`，辅以 GitHub raw。无登录墙。`status` 保持 `DRAFT`。截图缺失，sha256 `pending`。

- **inputUrl / finalUrl:** `https://ark-ui.com/`
- **checkedAt:** `2026-09-05T16:30:00.000Z`
- **opened:**
  - 首页 `https://ark-ui.com/`
  - 入门 `https://ark-ui.com/docs`（Getting Started）
  - Dialog `https://ark-ui.com/react/docs/components/dialog`
  - GitHub `https://github.com/chakra-ui/ark`
  - LICENSE raw
  - `packages/react/package.json` raw
- **blocked:** 无登录墙。下列目录 URL 返回 404，故 breadth 改用入门页，组件清单改引仓库 README：
  - `https://ark-ui.com/docs/overview/introduction` 404
  - `https://ark-ui.com/docs/components` 404
  - `https://ark-ui.com/react/docs/components` 404
  - `https://ark-ui.com/react/docs/overview/introduction` 404
- **quoted:**
  1. 首页 `<title>`：「Ark UI」
  2. 首页：「A headless library with 45+ accessible components. Bring your own styles and build a design system that works across React, Solid, Vue, and Svelte.」
  3. 首页：「Truly Headless / No default styles to fight.」「Accessible by Default / WAI-ARIA patterns baked in.」
  4. 首页示例：`import { Slider } from '@ark-ui/react/slider'`
  5. 入门 `<title>`：「Getting Started | Ark UI」；`npm install @ark-ui/react`；「Ark UI is a headless component library that doesn't include default styles.」
  6. Dialog `<title>`：「Dialog | Ark UI」；「A modal window that appears on top of the main content.」Anatomy：Trigger / Backdrop / Positioner / Content / Title / Description / CloseTrigger。Accessibility：「Complies with the Dialog WAI-ARIA design pattern。」
  7. GitHub README：「Unstyled, accessible UI components… Works in React, Vue, Solid, and Svelte.」Overlays 列出 Dialog、Tooltip；Forms 列出 Checkbox、Combobox。「Ark UI is maintained by Christian Schröter, Segun Adebayo, and the Chakra UI team.」
  8. LICENSE：「MIT License / Copyright (c) 2024 Chakra Systems Inc.」
  9. package.json：`"name": "@ark-ui/react"`，`"license": "MIT"`，`"homepage": "https://ark-ui.com"`
- **facts:** author=Christian Schröter, Segun Adebayo, and the Chakra UI team；organization=Chakra Systems Inc.；repository=https://github.com/chakra-ui/ark；license=MIT；pricing=Free；package=@ark-ui/react
- **screenshots:** 缺失，sha256 pending / bytes 0
- **noteZh:** 158 字
- **查重:** `approved-v3/` 无 ark-ui 条目。Chakra UI 是另一入口。
