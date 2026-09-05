# inclusive-components visit report · 2026-09-05

访问方式：`curl.exe -sL https://r.jina.ai/https://…`，辅以 `curl.exe -sI`。截图用本机 Chrome headless，视口 1280×900。无登录墙。`status` 保持 `DRAFT`，无 `reviewerId`。

**finalUrl:** `https://inclusive-components.design/`（HTTP 200）  
**checkedAt:** `2026-09-05T23:15:00.000Z`  
**curatorId:** `swarm-batch-radix-split`

## Opened

- 首页 / identity `https://inclusive-components.design/` → 200，`<title>Inclusive Components</title>`
- About / breadth `https://inclusive-components.design/about-the-project` → 200，`<title>About The Project</title>`
- Toggle Buttons / proof `https://inclusive-components.design/toggle-button/` → 200，`<title>Toggle Buttons</title>`
- Cards `https://inclusive-components.design/cards/`（打开核对章节形态）

首页组件清单（The components）：Cards、Data Tables、Notifications、A Content Slider、Collapsible Sections、Tabbed Interfaces、A Theme Switcher、Tooltips & Toggletips、Menus & Menu Buttons、A Todo List、Toggle Buttons。无单独目录 URL，breadth 用 About 说明整库范围。

## Quoted

1. 首页：「A blog trying to be a pattern library. All about designing inclusive web interfaces, piece by piece。」
2. 页脚：「Designed, built, and maintained by Heydon Pickering。」
3. About：「Each post explores a common interface component and comes up with a better, more robust and accessible version of it。」Who are you?：「I'm Heydon Pickering。」
4. Toggle Buttons（2017-03-31）：从 checkbox / radio 当开关的问题讲到真正的 `<button>`。
5. 纸书：`http://book.inclusive-components.design/`（首页与章节页均推广）。Patreon：patreon.com/inclusicomps。
6. About / 首页 **未声明** 博文再分发许可 → `license: unknown`。无仓库链接 → `repositoryStatus: unknown`。

## Screenshots

| role | URL | title | bytes | sha256 |
|---|---|---|---|---|
| identity | `https://inclusive-components.design/` | Inclusive Components | 42416 | `17392f63…418fae1f4` |
| breadth | `https://inclusive-components.design/about-the-project` | About The Project | 70241 | `762b2f33…6dad64b` |
| proof | `https://inclusive-components.design/toggle-button/` | Toggle Buttons | 57897 | `c16d1719…bfc0581` |

proof 首屏是章节标题 + 纸书推广；正文 checkbox 讨论在首屏以下。三张 URL 不同。

## Classification

`reference-standards` / `ui-patterns-anatomy`。备选 `learning-editorial` / `articles-books-publications`。不是审计工具，故不放 `research-quality-tools`。

## 未做

未写入 `approved-v3`，未改 `collections.js`。
