# React Aria 进站报告 · 2026-09-05

访问方式：真实 HTTP GET。未改 `approved-v3`、`collections.js`、jsx、css。`status` 保持 `DRAFT`，无 `reviewerId`。本条目是 **React Aria**，不是 React Spectrum / Adobe Spectrum。

## 打开过的页

| 角色 | URL | 最终地址 | `<title>` | HTTP |
|---|---|---|---|---|
| 旧文档入口 / identity | https://react-spectrum.adobe.com/react-aria/ | https://react-aria.adobe.com/ | React Aria | 200 |
| 新首页 | https://react-aria.adobe.com/ | 同左 | React Aria | 200 |
| Getting started / breadth | https://react-aria.adobe.com/getting-started.html | 同左 | Getting started \| React Aria | 200 |
| ComboBox / proof | https://react-aria.adobe.com/ComboBox.html | 同左 | ComboBox \| React Aria | 200 |
| components.html（拟作目录） | https://react-aria.adobe.com/components.html | — | Error 404: Page not found | 404 |
| Examples | https://react-aria.adobe.com/examples/ | 同左 | Examples \| React Aria | 200 |
| LICENSE | https://github.com/adobe/react-spectrum/blob/main/LICENSE | 同左 | Apache License 2.0 / Copyright 2019 Adobe | 200 |
| RAC package.json | https://raw.githubusercontent.com/adobe/react-spectrum/main/packages/react-aria-components/package.json | 同左 | name react-aria-components | 200 |

无登录墙。

## 首页看到什么

跨域跳转到 `https://react-aria.adobe.com/`。`<title>` = React Aria。meta description = **Craft world-class accessible components with custom styles.** JSON-LD author = Adobe Inc，publisher = Adobe。正文：**Over 50 components with built-in behavior, adaptive interactions, top-tier accessibility, and internationalization out of the box, ready for your styles.** Get started / Explore Components。示例窗标注 Popover、Tooltip、SearchField、Table、Modal、Checkbox、ToggleButton、Menu。页脚 Copyright © 2026 Adobe。

独立组件目录页 `components.html` 返回 404。breadth 改用 Getting started（安装 + 全套 Storybook starter kits + shadcn CLI `npx shadcn@latest add @react-aria/css`）。

## Getting started 与 ComboBox

Install：`npm install react-aria-components`。Quick start 用 Select 示例。Storybook starter kits：**These include every component**。ComboBox：**A combo box combines a text input with a listbox…** Favorite Animal 演示、Vanilla CSS / Tailwind、源码与 API 表。

## 许可与价格

Apache License 2.0，Copyright 2019 Adobe。`react-aria-components` package.json `license` = Apache-2.0，`version` 1.21.1，description = A library of styleable components built using React Aria。仓库 https://github.com/adobe/react-spectrum（同一仓库还有 React Spectrum，本条目不收录那套视觉组件）。文档免费。

## 截图

三张均 1280×900 PNG。identity 为 accessible components 标题与示例窗。breadth 为 Getting started（侧栏已列出 Components）。proof 为 ComboBox。

## 分类与人话

- 一级 `ui-implementation` / 小类 `headless-accessible-primitives`。分类 `needs-review`。
- `atlasTerms`：ComboBox → `atlas-component-component-combobox`。

## 未做

无独立 components index URL（404）。未写入 `approved-v3`。
