# Animate.css 进站报告 · 2026-09-05

访问方式：`curl.exe -sL https://r.jina.ai/https://…`。未改 `approved-v3`、`collections.js`、jsx、css。`status` 保持 `DRAFT`，无 `reviewerId`。

## 打开过的页

| 角色 | URL | 最终地址 | `<title>` | HTTP |
|---|---|---|---|---|
| 首页 / identity | https://animate.style/ | https://animate.style/ | Animate.css \| A cross-browser library of CSS animations. | 200 |
| 动画名锚点 / breadth | https://animate.style/#attention_seekers | https://animate.style/ | 同上（单页 hash） | 200 |
| v4 迁移 / proof | https://animate.style/#migration | https://animate.style/ | 同上（单页 hash） | 200 |
| 仓库 | https://github.com/animate-css/animate.css | 同左 | GitHub - animate-css/animate.css | 200 |
| LICENSE | https://raw.githubusercontent.com/animate-css/animate.css/main/LICENSE | 同左 | Hippocratic License 2.1 | 200 |

站点是单页文档。三条证据用 `/`、`#attention_seekers`、`#migration`。另确认 `#best-practices`、`#gotchas` 存在于正文链接。无登录墙。

## 首页看到什么

顶部警告：Animate.css v4 brought some **breaking changes**，链到 `#migration`。

定义：a library of ready-to-use, cross-browser animations… Great for emphasis, home pages, sliders, and attention-guiding hints.

安装：`npm install animate.css --save`；Yarn；`import 'animate.css'`；CDN `https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css`。

基本用法：

```
<h1 class="animate__animated animate__bounce">An animated element</h1>
```

动画名链到 `#attention_seekers`。另有 `@keyframes`、CSS 变量 `--animate-duration`、delay / slow / repeat 工具 class、JS 里 `animate__bounceOutLeft`。

## 许可与作者

License and Contributing：**Animate.css is licensed under the Hippocratic License**（firstdonoharm.dev）。

Core Team：Daniel Eden = Animate.css Creator；Elton Mesquita = Maintainer；Waren Gonzaga = Core Contributor。

仓库 LICENSE：Animate.css Copyright 2021 Daniel Eden (“Licensor”)。**Hippocratic License Version Number: 2.1.** 含人权原则 / 人权法律条款，不是 OSI MIT。taxonomy 无 Hippocratic，`facts.license` 写全名，`facets.licenses` = `custom`，`access` = free + source-available。

## 截图

`frontend/public/shots/animate-css/` 不存在。`sha256` / `bytes` 标 **pending**。

## 分类与人话

- 一级 `visual-implementation` / 小类 `motion-interaction-code`。分类 `needs-review`。
- `noteZh` 去空白 126 字。`takeawayZh` 去空白 16 字。
- `atlasTerms` 空。

## 未做

无 `questions.md`（hash 变体可区分 identity / 动画名 / v4 API）。未写入 `approved-v3`。
