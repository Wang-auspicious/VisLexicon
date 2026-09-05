# ariakit review addendum · 2026-09-05 · swarm-reviewer-grok-b

复核通道：open_page / web_fetch 打开活页，Node crypto 重算 PNG。无登录墙。

## Redirect

`https://ariakit.org/` → `https://ariakit.com/`（components / dialog / plus 同跳）。截图画面与 .com 活页一致。`official.finalUrl` 与 pages[].finalUrl 已改为 .com。

## Pages reopened

| role | source | final | title | 与截图 |
|---|---|---|---|---|
| identity | ariakit.org/ | ariakit.com/ | Ariakit - Toolkit for building accessible UIs | 匹配：Build accessible web apps with React |
| breadth | /components | ariakit.com/components | Components - Ariakit | 匹配：Button / Checkbox / Combobox / Dialog |
| proof | /components/dialog | ariakit.com/components/dialog | Dialog - Ariakit | 匹配：Show modal + `import * as Ariakit from "@ariakit/react"` |

三张 PNG 互异，均为 1280×900。

## Facts re-quoted

- README Core Team 第一条 Diego Haz。
- `packages/ariakit-react/license`：MIT License / Copyright (c) 2025-present Ariakit FZ-LLC。
- README Licensing 表：packages = MIT；Plus examples = Ariakit Plus License；app = proprietary。
- Plus 营销页本次 JS 抽取为空；定价证据改走 README + https://ariakit.com/plus/license。未见美元标价。
- access 改为 freemium + open-source（顶栏 Unlock Ariakit Plus）。

## Result

APPROVED。入组 `components-and-blocks`。
