# Godly / Recent 进站报告 · 2026-09-05

访问方式：真实 HTTP GET。未改 `approved-v3`、`collections.js`、jsx、css。`status` 保持 `DRAFT`，无 `reviewerId`。这是灵感目录，不是组件库。`entryId` 保留 `godly`，官方现名 Recent。

## 打开过的页

| 角色 | URL | 最终地址 | `<title>` | HTTP |
|---|---|---|---|---|
| 旧域名 / identity | https://godly.website/ | https://recent.design/?ref=godly | Recent — Design Inspiration | 200 |
| Recent 首页 | https://recent.design/ | 同左 | Recent — Design Inspiration | 200 |
| Websites / breadth | https://recent.design/websites | 同左 | Web Design Inspiration — Recent | 200 |
| 案例 / proof | https://recent.design/i/wu4fp5s-tensorlake-brand-website | 同左 | Recent | 200 |
| /web | https://recent.design/web | — | 404 | 404 |
| Jobs | https://recent.design/jobs | 同左 | Design Jobs — Recent | 200 |

无登录墙。灵感流可公开浏览。

## 首页看到什么

godly.website 跨域跳转到 `https://recent.design/?ref=godly`。`<title>` = Recent — Design Inspiration。meta description = **The best of recent design found on the Internet updated daily.** twitter:creator = @recentdesign。顶栏分类：All / Web / Interface / Branding / Product / Typography / Motion / Illustration / 3D / Editorial / Print / Packaging。首页海报含 Tensorlake brand website（`/i/wu4fp5s-tensorlake-brand-website`）、Bloom study 等，并穿插 Sponsor 与 Design jobs。

Websites 栏目独立 URL，标题 **Web Design Inspiration — Recent**，与首页 All 流画面不同，用作 breadth。

## 案例页

`/i/wu4fp5s-tensorlake-brand-website` HTML 约 17 KB，SSR `<title>` 仍为 Recent，og:title 亦为 Recent；slug 与首页链文案为 Tensorlake brand website。客户端渲染后应出现案例海报。截图若仍是空壳，记入 questions。

## 许可与价格

未见 LICENSE、定价页或源码仓库。浏览免费。招聘与赞助位存在，不改变浏览免费这一事实。license / repository 记 unknown。作者页未见自然人，twitter:creator=@recentdesign，author 记 unknown。

## 截图

godly.website 与 `/websites` 在带 virtual-time-budget 时超时。identity 改截 `https://recent.design/`（与 `?ref=godly` 同页），breadth 截 `/websites`，均去掉 virtual-time-budget 后成功。proof 一次成功：Tensorlake Brand & Website，作者 Ayush Soni（案例作者，不是站点作者）。

## 分类与人话

- 一级 `directories-indexes` / 小类 `general-resource-directories`。备选 `case-inspiration-collections` / `website-landing-page-cases`。分类 `needs-review`。
- `atlasTerms` 空。

## 未做

未写入 `approved-v3`。未把 Recent 拆成另一条 entry。
