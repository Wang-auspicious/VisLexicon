# curator-3 进站报告 · 2026-09-05

访问方式：`curl.exe -sL https://r.jina.ai/https://…`，失败或缺控件时用浏览器 UA 拉原始 HTML。未改截图、未改 `entryId`/`status`。

## Job A · a11y-project

访问：

- https://www.a11yproject.com/
- https://www.a11yproject.com/about/
- https://www.a11yproject.com/checklist/
- https://www.a11yproject.com/checklist/#use-plain-language-and-avoid-figures-of-speech-idioms-and-complicated-metaphors

**Checklist 有没有真 checkbox：有。** 原始 HTML 里 `input type="checkbox"` 共 64 个，每条检查项包在 `c-checklist__checkbox` 里，第一条是 `id="use-plain-language-checkbox"`。画面左侧空方框就是这些控件，不是纯装饰。proof `selectionRationale` 因此保留「能勾选」，改成导览句（33 字）：「先看 Content 第一条：左边能勾选，展开后是 WCAG 3.1.5。」

`facts[].evidence` 已去掉「；独立复核来源：…」。

补写 `noteZh`（162 字）并设 `editorialVoice.status: written`。

### alt

按截图画面写，不写英文模板句：

| role | 画面 | 新 alt |
|---|---|---|
| identity | `v2-identity.png` 实际是 About：蓝底金字 About | About 页蓝底金字大标题 About，中间横条写 All about this project |
| breadth | `v2-breadth.png` 实际是首页：深绿底紫字 a11y | 首页深绿底紫色大字 a11y，黑卡片解释 accessibility 缩写 |
| proof | Checklist Content 区 | Checklist 的 Content 区：左侧空勾选框，第一条展开显示 WCAG 3.1.5 |

### 问题（未改 shot / URL）

`pages[identity].sourceUrl` 是首页，但 `v2-identity.png` 是 About；`pages[breadth].sourceUrl` 是 About，但 `v2-breadth.png` 是首页。alt 跟画面走。截图在 `public/`，本任务不改。

## Job B · ecomm-design

访问：

- https://ecomm.design/about/
- https://ecomm.design/
- https://ecomm.design/ecommerce-website-templates/

About：站点自称电商网站合集，少追前端口味、多看转化和 UX；团队 Catalin / Bogdan / Raj / Anna / Ben；右侧 Shopify 广告和订阅。首页：商店长图墙，Filter By 平台/品类，近卡有 Gielly Green、Elev8 H2O、Reale Actives、Polestar。模板页：Praise、StyleScape 等 Shopify 主题外链，按 Platform / Price 筛。许可未统一声明。

`noteZh` 159 字。`editorialVoice.status: written`。

### alt

| role | 新 alt |
|---|---|
| identity | About 页左侧介绍站点定位和团队 Catalin，右侧 Shopify 广告与邮件订阅框 |
| breadth | 首页案例墙：Gielly Green、Elev8 H2O、Reale Actives 等商店长图卡片 |
| proof | Polestar 案例页：左侧四款车型商品图，右侧 Product Page Example 说明 |

### 问题（未改 shot / URL）

`pages[proof].sourceUrl` 是模板列表页；`v2-proof.png` 是 Polestar 商品页长图（更像 `/site/polestar/`）。alt 跟画面走。

## Job C · entry-shadcn-studio-blocks

访问：

- https://shadcnstudio.com/
- https://shadcnstudio.com/blocks
- https://shadcnstudio.com/blocks/marketing-ui/hero-section
- https://shadcnstudio.com/license（页脚 Legal 链出，核许可）

首页：大标题 + 落地页预览条，Get all access。Blocks：营销 / 后台 / 电商 / 数据表 / Bento / Free。Hero Section：Get Code、Copy Prompt、下载、`npx shadcn add hero-section-42`，预览是 Brandly 首屏。页脚写 “open-source collection”；许可页是 MIT + Commons Clause，付费资源另有条款。`noteZh` 写了这层限制。

`noteZh` 156 字。`editorialVoice.status: written`。alt 原本已是中文画面句，未改。

## 顺手 · laws-of-ux

只改三条模板 alt，**未动** `noteZh` / `editorialVoice`：

| role | 新 alt |
|---|---|
| identity | Info 页深色底，INFO 导航高亮，大段介绍心理学启发式，下方 Hick's Law 卡片拼贴 |
| breadth | 首页三列定律卡：Aesthetic-Usability Effect、Choice Overload、Chunking |
| proof | Hick's Law 条目页：蓝底芯片图标、决策时间定义句，下方 Takeaways |

## noteZh 字数

按去空白字符计（样例 laws-of-ux 为 169）：

| entryId | 字数 | 句数 |
|---|---|---|
| a11y-project | 162 | 4 |
| ecomm-design | 159 | 4 |
| entry-shadcn-studio-blocks | 156 | 4 |

均在 120–180。a11y proof `selectionRationale` 33 字（≤40）。
