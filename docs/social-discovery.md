# 社交媒体设计站发现

`scripts/social-discovery.mjs` 是一个只读的 X / 小红书发现适配器。它借鉴了卡兹克 AIHOT 的调度思路（按来源轮询、保留请求尝试、对原始材料做稳定身份判重），但不复制 AIHOT 品牌或其后台代码。这里的目标对象是 VisLexicon 的 `SiteEntry` 线索，不是资讯文章。

运行前需要用户自己在受控浏览器会话中登录并安装 OpenCLI。适配器只调用 `opencli` 的读取命令：

```powershell
cd D:\Desktop\VisLexicon  视元
npm run social:watchlist
npm run social:collect -- --source=x-design-resource-search --resolve
npm run social:collect -- --source=xhs-design-websites --details --resolve
```

也可以把已经导出的 JSON / JSONL 作为离线输入，适合复核和重跑：

```powershell
npm run social:ingest -- --input=C:\path\to\x-export.json --platform=x --query="design tools" --resolve
npm run social:verify -- --run=C:\path\to\runtime\social-...\run.json
```

`data/social-discovery/watchlist.json` 是观察名单，不会调用 X 的 follow API，也不会点赞、回复、发帖或替用户登录。名单里的账号来自一次公开搜索样本，属于可调整的 seed，不是平台认证的“设计大佬”排名；关键词搜索始终保留，用来发现名单外的分享者。

小红书搜索源默认只保留搜索结果，避免每轮调度重复触发平台风控；在确认当前会话允许读取详情时，再在 watchlist 设置 `detail: true` 或命令行加 `--details`，把笔记正文和正文中的外链并回同一条原始观察。详情请求失败会作为独立 request attempt 保留，不会丢掉搜索命中，也不会把一次风控失败伪装成“没有内容”。搜索 URL 中的会话参数只在详情命令传给本地浏览器桥接，落盘的安全字段会被去除。

每次运行会在 `data/social-discovery/runtime/<run-id>/` 写入：

- `raw-observations.jsonl`：每条帖子一行，保留平台原生 ID、作者、发布时间、原文链接和原始字段。
- `post-dispositions.jsonl`：每条原始帖子恰有一个处置，重复帖子也保留。
- `link-dispositions.jsonl`：每个提取出的链接都有来源帖子、原链接、展开链接、规范 URL、解析状态和去重处置。
- `candidates.json`：只包含 `publish: false`、`classification.status: needs-review` 的站点线索。
- `summary.json` / `run.json`：请求尝试、数量守恒和内容摘要。

链接处置遵循现有站点身份规则：完全相同的规范 URL 才能标为 `known-alias` 或 `duplicate-link`；同一 origin 的不同路径只标 `suspected-duplicate`，不会自动合并。短链未展开、社交平台自身链接、无法通过公共 HTTP(S) 身份校验的链接会保留为 `unverifiable` / `not-a-design-link`，不会被伪造为站点。

`candidates.json` 是生产候选 inbox，不是 public index。候选仍需进入现有 `SiteEntry` / `ContentUnit` 分类、真实探索、identity/breadth/proof 三页截图、中文人工描述、直接事实来源和独立复核；适配器不会绕过 `capture:publish` 或现有的 `ingest` 状态机。小红书返回 URL 中的 `xsec_token` 等会话参数只用于当次读取，安全字段和落盘的 canonical URL 会去除这些参数。

卡兹克 AIHOT 的公开仓库只公开了 X 的 SocialData + cursor/shard + receipt/upsert 采集链路，并明确把小红书外部采集留给用户维护；它没有公开“设计链接自动变成站点条目”的模块。因此本适配器把那部分拆成可审计的 link/entity extractor，避免把资讯预筛的营销噪声门禁误用到站点线索上。

