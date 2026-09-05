# Phosphor Icons 进站报告 · 2026-09-05

访问方式：`curl.exe -sL https://r.jina.ai/https://…`，辅以官网 HTML 与 GitHub raw LICENSE。未改 `approved-v3`、`collections.js`、jsx、css。`status` 保持 `DRAFT`，无 `reviewerId`。

## 打开过的页

| 角色 | URL | 最终地址 | `<title>` | HTTP |
|---|---|---|---|---|
| 首页 / identity | https://phosphoricons.com/ | https://phosphoricons.com/ | Phosphor Icons | 200 |
| Fill 字重 / breadth | https://phosphoricons.com/?weight=fill | 同左 | Phosphor Icons | 200 |
| 搜索 house / proof | https://phosphoricons.com/?q=house | 同左 | Phosphor Icons | 200 |
| Showcase | https://play.phosphoricons.com/ | 同左 | Phosphor Play | 200 |
| 仓库 | https://github.com/phosphor-icons/homepage | 同左 | GitHub - phosphor-icons/homepage | 200 |
| LICENSE | https://raw.githubusercontent.com/phosphor-icons/homepage/master/LICENSE | 同左 | MIT License / Copyright (c) 2020 Phosphor Icons | 200 |

官网是单页应用（HTML 壳约 4 KB + `/assets/index-*.js`）。查询参数 `?weight=fill`、`?q=house` 均 200，作为 identity / catalog / 单主题过滤的三条变体。无登录墙。

## 首页看到什么

meta description / 页上句子：**Phosphor is a flexible icon family for interfaces, diagrams, presentations — whatever, really.**

按钮：Get started / Explore icons。**Download all (9,072)**（数字只记进站）。Figma plugin / library、Sketch plugin、Showcase `https://play.phosphoricons.com/`、GitHub、Request an icon、Donate（Buy Me a Coffee / Ko-fi / Open Collective / Patreon）。

字重控件可见 **Regular**，搜索 **Ctrl + K**，尺寸 32px，颜色 `#000000`。网格从 acorn、address-book 铺开。

HTML `<meta name="author" content="Tobias Fried">`。页脚：**Phosphor is a passion project by Helena Zhang and Tobias Fried.** **Phosphor is free and open-source, licensed under MIT**，链到 raw LICENSE。联系 `hello@phosphoricons.com`。

## 仓库

homepage README：6 weights Thin / Light / Regular / Bold / Fill / Duotone；官方包含 web、React、Vue、Flutter 等。License 节：**MIT © Phosphor Icons**。

## 截图

`frontend/public/shots/phosphor-icons/` 不存在。`sha256` / `bytes` 标 **pending**。

## 分类与人话

- 一级 `visual-assets` / 小类 `icons-symbols`。分类 `needs-review`。
- `noteZh` 去空白 130 字。`takeawayZh` 去空白 15 字。
- `atlasTerms` 空。

## 未做

无 `questions.md`。未写入 `approved-v3`。

## 2026-09-06 截图补采

原 `v2-identity/breadth/proof` 三张 sha256 相同（`?weight=fill` / `?q=house` 在 headless 下仍是首页）。删旧 PNG 后按 `frontend/scripts/capture-jobs-icons.json` 重采。`status` 仍 `DRAFT`，`curatorId` 不变。npm `@phosphor-icons/react` 返回 Cloudflare interstitial，proof 改用 `core/assets` 字重目录。

| 角色 | URL | sha256 | bytes |
|---|---|---|---|
| identity | https://phosphoricons.com/ | `2f1de3d879e1f7cb635c62a8d4a72ccdeefdfe35534ed5b1d3a3f6c602ff7168` | 103514 |
| breadth | https://github.com/phosphor-icons/homepage | `9135ad53bbdc4df617957b9eb2ae574f6c7d5824bf68d2ef77bcc21e65e24b6c` | 118689 |
| proof | https://github.com/phosphor-icons/core/tree/main/assets | `e3943b25736182427ad373ef96e70f34e464bbeb47ba271c786cf4765d6ebe88` | 80354 |

三张哈希互不相同。
