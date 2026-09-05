# curator-2 visit report · 2026-09-05

通道：`curl -sL https://r.jina.ai/https://…`；GitHub 用 `raw.githubusercontent.com` 与 `api.github.com/repos/cosscom/coss/license`。未改截图、entryId、status、takeawayZh。

## Job A · origin-ui 许可决定

**决定：KEEP `entryId` `origin-ui`。** 不是另一个产品。GitHub README 标题仍写 `coss.com/ui (formerly Origin UI)`；仓库保留 `apps/origin/` 作为收购前 Radix/shadcn 快照，活跃开发在 Coss UI / Particles。改 id 会连带 `#/site/origin-ui` 与 `/shots/origin-ui/`，无独立新实体证据。

**许可：混合，不得再写成单一 MIT。**

| 范围 | SPDX | 证据 |
|---|---|---|
| 仓库默认 / 根 LICENSE | GNU AGPLv3 正文；GitHub API `spdx_id: AGPL-3.0` | https://github.com/cosscom/coss/blob/main/LICENSE |
| 根 `package.json`、`packages/ui/package.json`（`@coss/ui`） | `AGPL-3.0-or-later` | raw package.json |
| `apps/ui/`（本入口，coss.com/ui 文档与 registry） | `MIT` | `apps/ui/package.json` `"license": "MIT"` |
| `apps/origin/` | `MIT` | `apps/origin/package.json` `"license": "MIT"` |
| 声明 | README + LICENSING.md：默认 AGPLv3.0；MIT 仅 `apps/origin/`、`apps/ui/`；其余目录 AGPLv3 | https://github.com/cosscom/coss 、 https://github.com/cosscom/coss/blob/main/LICENSING.md |

taxonomy 有 `MIT`、`AGPL-3.0-only`、`AGPL-3.0-or-later`，没有泛写的 `AGPL-3.0`。根 package.json 写的是 `AGPL-3.0-or-later`，facet 用这个短名。

**facts[license].value = `AGPL-3.0-or-later`**（仓库默认，不再假装整仓 MIT）。`facets.licenses = ["MIT", "AGPL-3.0-or-later"]`。范围写在 evidence，不写进 value：`curation-evidence.js` 要求 `facts.license.value` 与某一个 facet id 全等，混合串 `MIT; AGPL-3.0-or-later` 会报 `facets.licenses must match the trusted license fact`。未发明新 facet id。

`official.checkedAt` 更新为 `2026-09-05T13:10:00.000Z`。

现场：https://coss.com/ui 标题 *A new, modern UI component library built on top of Base UI - coss ui*；https://coss.com/ui/docs 写 copy/paste、Early Access、Cal.com 逐步采用；https://coss.com/ui/docs/components/calendar 有九月日历预览、源码、`pnpm dlx shadcn@latest add @coss/calendar`，页脚 *Built by and for the team of Cal.com, Inc.*。JSON 里 identity title 仍是旧的 `Coss UI — Origin UI Components`，与现标题不一致，未改 pages/截图。

## Job B · Chakra / Ant Design

均进站后写 noteZh。未改 takeawayZh、facts、entryId、status。Chakra/Ant 的 `checkedAt` 未改（Job A 只要求 origin-ui）。facts.evidence 未动，故未剥「；独立复核来源：…」。

**Chakra**（https://chakra-ui.com/ 、/docs/components/concepts/overview 、/docs/components/button）：首页 *component system for building products with speed*，`npm i @chakra-ui/react`，Tokens / Typography / Recipes；总览列出 Button、Dialog、Skeleton、Timeline 等；Button 页有尺寸/变体/颜色/禁用/加载与 `defineRecipe`。页顶 Premium / Pro 模板另售。页脚 Project by Chakra Systems，Maintained by Sage。

**Ant Design**（https://ant.design/index-cn 、/components/overview-cn 、/components/table-cn#table-demo-basic）：中文总览按通用/布局/导航/数据录入/数据展示/反馈分栏；表格基本用法有姓名地址行与操作列，后续筛选、树形。页脚「蚂蚁集团和 Ant Design 开源社区」。现首页 title 为英文 *The world's second most popular React UI framework*，JSON identity title 仍是中文旧句，未改。

## noteZh 字数（Unicode code point，含标点与英文）

| entryId | 字数 | 区间 120–180 |
|---|---:|---|
| origin-ui | 174 | 是 |
| entry-chakra-ui-react | 170 | 是 |
| entry-ant-design-react | 161 | 是 |

## 改动文件

- `VisLexicon-browser-design-kit/content-samples/approved-v3/origin-ui.json`
- `VisLexicon-browser-design-kit/content-samples/approved-v3/entry-chakra-ui-react.json`
- `VisLexicon-browser-design-kit/content-samples/approved-v3/entry-ant-design-react.json`
- `VisLexicon-browser-design-kit/content-samples/drafts/curator-2-visit.md`（本文件）
