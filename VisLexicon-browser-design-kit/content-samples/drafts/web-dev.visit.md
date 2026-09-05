# web-dev visit report · 2026-09-05

访问方式：`curl.exe -sL https://r.jina.ai/https://…`，辅以 GitHub LICENSE。截图用本机 Chrome headless `--lang=en-US` 与 `?hl=en`，避免本机中文自动翻译。视口 1280×900。无登录墙（Sign in 仅保存进度）。`status` 保持 `DRAFT`，无 `reviewerId`。

**finalUrl:** `https://web.dev/`（HTTP 200）  
**checkedAt:** `2026-09-05T23:15:00.000Z`  
**curatorId:** `swarm-batch-radix-split`

## Opened

- 首页 / identity `https://web.dev/` → 200，`<title>web.dev</title>`
- Learn / breadth `https://web.dev/learn` → 200，`<title>Learn web development</title>`
- Learn Accessibility 课程目录 `https://web.dev/learn/accessibility`
- Welcome 文 / proof `https://web.dev/learn/accessibility/welcome` → 200，`<title>Welcome to Learn Accessibility!  | web.dev</title>`
- Why 文 `https://web.dev/learn/accessibility/why`
- About `https://web.dev/about`
- Blog `https://web.dev/blog`
- Articles 索引 `https://web.dev/articles`（落到 Discover）
- 仓库 `https://github.com/GoogleChrome/web.dev`（Archived / read-only）
- LICENSE `https://raw.githubusercontent.com/GoogleChrome/web.dev/main/LICENSE`

**404:** `https://web.dev/articles/accessible`（旧 capture-jobs proof）。改用 Learn Accessibility 欢迎文。

## Quoted

1. 首页：「Building a better web, together」「written by members of the Chrome team, and external experts」。
2. About：「Guidance from Chrome Developer Relations」；团队 Paul Kinlan、Philip Walton、Ali Spivak、Rachel Andrew。
3. Learn：「Explore our growing collection of courses on key web design and development subjects. An industry expert has written each course, helped by members of the Chrome team.」
4. Welcome：「Digital accessibility, commonly abbreviated a11y, is about designing and building websites and web apps that people with disabilities can interact with in a meaningful and equivalent way。」作者 Carie Fisher，审阅 Alexandra Klepper；链 MDN / WCAG。
5. LICENSE：「the content of this site is licensed under the Creative Commons Attribution 3.0 License, and code samples are licensed under the Apache 2.0 License。」分类树无 CC-BY-3.0，facts.license 记 `custom`。
6. 仓库 README：site migrated，不再合并 PR；内容问题走 issuetracker.google.com。

## Screenshots

| role | URL | title | bytes | sha256 |
|---|---|---|---|---|
| identity | `https://web.dev/` | web.dev | 130804 | `c53e3ccc…b032d601` |
| breadth | `https://web.dev/learn` | Learn web development | 125527 | `c3b1d440…c311cd92` |
| proof | `https://web.dev/learn/accessibility/welcome` | Welcome to Learn Accessibility! | 205639 | `dac8d631…ed2f2cf5` |

首轮无 `hl=en` 时首页/Learn 被翻成中文、proof 落到 404。已重截英文首屏。JSON 的 sourceUrl 用规范地址（无 `hl=en`）。

## Classification

`learning-editorial` / `tutorials-courses-workshops`。备选 `articles-books-publications`（About 也指向 blog / articles）。

## 未做

未写入 `approved-v3`，未改 `collections.js`。
