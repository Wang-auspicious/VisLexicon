# GSAP 进站报告 · 2026-09-05

访问方式：真实 HTTP GET（PowerShell `Invoke-WebRequest` + WebFetch）。未改 `approved-v3`、`collections.js`、jsx、css。`status` 保持 `DRAFT`，无 `reviewerId`。

## 打开过的页

| 角色 | URL | 最终地址 | `<title>` | HTTP |
|---|---|---|---|---|
| 首页 / identity | https://gsap.com/ | https://gsap.com/ | Homepage \| GSAP | 200 |
| Plugins 总览 / breadth | https://gsap.com/docs/v3/Plugins/ | 同左 | Plugins \| GSAP \| Docs & Learning | 200 |
| ScrollTrigger / proof | https://gsap.com/docs/v3/Plugins/ScrollTrigger/ | 同左 | ScrollTrigger \| GSAP \| Docs & Learning | 200 |
| Installation | https://gsap.com/docs/v3/Installation | https://gsap.com/docs/v3/Installation/ | Installation \| GSAP \| Docs & Learning | 200 |
| Standard License | https://gsap.com/licensing | https://gsap.com/community/standard-license/ | Standard License - GSAP | 200 |
| 仓库 | https://github.com/greensock/GSAP | 同左 | GitHub - greensock/GSAP: GSAP (GreenSock Animation Platform)… | 200 |

无登录墙。核心文档可公开读。

## 首页看到什么

`<title>` = Homepage | GSAP。大标题 **Animate Anything**。副标题：**GSAP – A wildly robust JavaScript animation library built for professionals**。Get GSAP 链到 `/docs/v3/Installation`。Why GSAP：**GSAP allows you to effortlessly animate anything JS can touch.** 工具入口：Scroll `/scroll/`、SVG `/svg/`、Text `/text/`、UI Interactions `/ui/`。Showcase 区列出 ScrollTrigger、SplitText、Draggable 等。

## 文档与插件

Plugins 页：**A plugin adds extra capabilities to GSAP's core.** Plugin Overview 分组列出 Scroll Plugins（ScrollTrigger / ScrollTo / ScrollSmoother）、Text（SplitText / ScrambleText / Text Replacement）、SVG（DrawSVG / MorphSVG / MotionPath）、UI（Flip / Draggable / Inertia / Observer）等。Installation：**GSAP and all the plugins are now freely available on npm**，要求 **version 3.13 or later**。命令 `npm install gsap`。package.json `name` = `gsap`，`version` = `3.15.0`。

ScrollTrigger 页：jaw-dropping scroll-based animations；Simple example `gsap.to(".box", { scrollTrigger: ".box", x: 500 })`；Advanced example 含 `pin`、`scrub`、`snap`。

## 许可与价格

Standard “No Charge” GSAP License。**Webflow grants you a non-exclusive, worldwide license** for Permitted Uses。FAQ：**Can I really use GSAP in commercial projects without paying anything? Yes, really!** 原 members-only 插件（SplitText、MorphSVG）也可免费商用。禁止用于与 Webflow 视觉动画搭建器竞争的无代码工具。README：**GreenSock's standard "no charge" license**；**Copyright (c) 2008-2026, GreenSock.** package.json `license` 字段：**Standard 'no charge' license: https://gsap.com/standard-license.** 不是 MIT。

## 截图

三张均 1280×900 PNG，首屏。identity 可见顶栏 **GSAP is now free for everyone, thanks to Webflow's support!** 与 Animate Anything。breadth 为 Plugins / Plugin Overview。proof 为 ScrollTrigger 文档。

## 分类与人话

- 一级 `visual-implementation` / 小类 `motion-interaction-code`。分类 `needs-review`。
- `licenses` = custom，与 facts[license] 一致。
- `atlasTerms` 空。

## 未做

无 `questions.md`。未写入 `approved-v3`。
