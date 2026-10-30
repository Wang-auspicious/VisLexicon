# 海外上线：Cloudflare 部署方案

> 2026-10-29。域名 vislexicon.com 在腾讯云购买；网站先上 Cloudflare，备案后再考虑迁国内。

## 架构

| 部分 | 放在哪 | 现在的量 | 免费额度 |
|---|---|---|---|
| 网站本体（页面、站点条目、站点截图、资源） | Cloudflare Pages | 约 8,600 个文件、630 MB（2026-10-16 的构建） | 每站最多 2 万个文件、单文件 ≤ 25 MiB，流量不限 |
| 组件截图和录屏 | Cloudflare R2，绑定 `media.vislexicon.com` | 31,327 个文件、约 1.2 GB | 10 GB 存储，出流量免费 |
| 搜索、投稿、AI 精排 | Cloudflare Workers（Pages Functions） | — | 每天 10 万次请求 |

组件媒体必须放 R2：单是它就超过 Pages 的 2 万个文件上限。

最大的单文件是 `presentation-resources/…/JimLiu-baoyu-skills-….zip`，20.3 MB，在 25 MiB 以内；以后新增资源超过 25 MiB 的也要放 R2。

## 需要站长本人做的（按顺序）

1. **付款，并等域名实名审核通过**（腾讯云控制台显示"正常"）。
2. **注册 Cloudflare 账号**：用自己的邮箱，开两步验证。
3. **把域名加到 Cloudflare**：Add a domain → 输入 `vislexicon.com` → 选 Free 计划。Cloudflare 会给出两个名称服务器（nameserver）地址。
4. **在腾讯云改名称服务器**：域名控制台 → vislexicon.com → 修改 DNS 服务器 → 填上一步那两个地址。生效一般要几分钟到几小时。
5. **建 R2 存储桶**：R2 → 开通（要绑一张卡，免费额度内不扣费）→ 新建桶 `vislexicon-media` → Settings → Custom Domains → 绑 `media.vislexicon.com`。
6. **建两个 API 令牌，发给执行上线的 agent**（不要贴在聊天里，放进本机环境变量或 `.env.local`，该文件不进 git）：
   - Pages 部署用：`Cloudflare Pages: Edit` 权限；
   - R2 上传用：R2 → Manage API Tokens → Object Read & Write，只限 `vislexicon-media` 桶。会给出 Access Key ID、Secret Access Key 和 S3 地址。

做完这六步，其余部署（建 Pages 项目、上传、绑域名、配缓存）都可以交给 agent。

## 以后迁国内

备案下来后，把网站整体迁到阿里云 ESA 或腾讯 EdgeOne（免费版条款届时再核实），一个域名同时覆盖国内和海外。因为全站是静态文件，迁移就是重新上传一次、改一次解析。

## Agent 部署步骤（站长做完上面六步之后）

令牌放进 `frontend/.env.local`（不进 git）：

```
CLOUDFLARE_API_TOKEN=…        # Pages: Edit
CLOUDFLARE_ACCOUNT_ID=…
R2_ACCOUNT_ID=…               # 同上 account id
R2_ACCESS_KEY_ID=…
R2_SECRET_ACCESS_KEY=…
```

1. **构建**：`node scripts/build-cloudflare.mjs`
   - 产出 `dist-cf/`（站点、SEO 静态页、sitemap、搜索索引）和 `data/deploy/r2-upload.tsv`（组件媒体 + 每条组件卡片）；
   - 超过 Pages 限制（2 万个文件、单文件 25 MiB）会直接报错退出。
   - 构建不带 `.br/.gz` 预压缩文件，因为 Pages 会自己压缩。
2. **传 R2**：`node scripts/r2-sync.mjs --cors`
   - 第一次大约 5 万个对象、1.3 GB；
   - 之后只传有变化的文件，记录在 `data/deploy/r2-uploaded.json`；
   - `--cors` 允许 vislexicon.com 跨域读取卡片 JSON。
3. **建 KV 和 Pages 项目**（只做一次）：
   ```
   npx wrangler kv namespace create RANK_KV
   npx wrangler kv namespace create SUBMISSIONS
   npx wrangler pages project create vislexicon --production-branch main
   ```
   然后在 Pages 项目 → Settings → Bindings 绑定两个 KV（变量名 `RANK_KV`、`SUBMISSIONS`）。
4. **密钥**（只做一次，值不进 git，也不贴在聊天里）：
   ```
   npx wrangler pages secret put JEV_API_KEY --project-name vislexicon
   npx wrangler pages secret put TURNSTILE_SECRET --project-name vislexicon   # 可选
   ```
   可调的普通变量（Settings → Variables）：
   - `RANK_DAILY_LIMIT`：全站每天 AI 精排次数上限，默认 300；
   - `SUBMIT_DAILY_PER_IP`：每个 IP 每天投稿次数，默认 10；
   - `JEV_MODEL`：默认免费模型；
   - `JEV_ALLOW_COST=1`：允许付费模型，默认不允许。
5. **部署**：`npx wrangler pages deploy dist-cf --project-name vislexicon`
   - 在 `frontend/` 目录下执行，`functions/` 会一起上传，提供 `/api/rank` 和 `/api/submit`。
6. **绑域名**：Pages 项目 → Custom domains → `vislexicon.com` 和 `www.vislexicon.com`。
7. **验收**：
   - 打开 `/`、`/sites`、`/site/<任一条目>`、`/components`；
   - 搜一个词，先出初排结果，再出 AI 精排；
   - 看 `/sitemap.xml`；
   - 投一条测试稿后去 KV 里删掉。

### Key 的防护

Jev key 只在 Pages Function 里，浏览器拿不到。`/api/rank` 有以下限制：

- 只接受本站来源的请求；
- 请求体 ≤ 256 KB，每次 ≤ 60 个候选；
- 相同请求缓存 24 小时；
- 全站每天的次数受 `RANK_DAILY_LIMIT` 限制，超出后搜索退回初排结果，网站照常可用；
- 默认禁止付费模型。

最坏情况是有人刷满当天的次数，钱不会被花掉。
