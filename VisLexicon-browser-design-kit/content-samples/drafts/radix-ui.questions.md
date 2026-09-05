# radix-ui remaining questions

未标 APPROVED。以下需独立复核后才能 confirmed。

## 1. 入口要不要拆？

同一域名下四个稳定产品，URL 与交付物都不同：

| 产品 | URL | 交付物 |
|---|---|---|
| Themes | `https://www.radix-ui.com/` | 预样式组件库，`@radix-ui/themes` |
| Primitives | `https://www.radix-ui.com/primitives` | 无样式无障碍原语，`radix-ui` / `@radix-ui/react-*` |
| Icons | `https://www.radix-ui.com/icons` | `@radix-ui/react-icons` |
| Colors | `https://www.radix-ui.com/colors` | 色板系统 |

规格要求分类的是 Site Entry 不是整个 Source Entity。本草案按任务做了**一条** `radix-ui`，identity 用首页（Themes），breadth/proof 用 Primitives。这是在混两个入口。

请复核人决定：

- A. 维持一条品牌入口，主类按 Primitives（当前草案）
- B. 维持一条品牌入口，主类改 `design-system-suites`（跟首页 Themes）
- C. 拆成至少两条：`radix-ui` / `radix-primitives`（以及是否另做 icons、colors）

## 2. `repository` 记哪一个？

- 首页 GitHub 图标 → `https://github.com/radix-ui/themes`
- Primitives 文档 GitHub → `https://github.com/radix-ui/primitives`
- Blog GitHub → `https://github.com/radix-ui`

本草案记 primitives。若入口被判定为首页 Themes，应改为 themes。

## 3. 分类主类

当前：`ui-implementation` / `headless-accessible-primitives`，备选 `design-system-suites`，`needs-review`。

Themes 入门页写明自己是 pre-styled，无样式请去 Primitives。若拆入口，Primitives 走原语类、Themes 走套件类，不再需要 alternatives。
