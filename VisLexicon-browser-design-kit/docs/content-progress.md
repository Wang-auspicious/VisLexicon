# 策展内容进度

按 `docs/策展内容生产手册-给AI员工.md` 顺序执行。主控：Grok。开始：2026-09-05。

## 当前阶段

**第 8 节语料欠账：已清完。** `npm run data` 通过，12 条 APPROVED。下一步按第 6 节做新站。

## 第 8 节清单

| 项 | 状态 | 备注 |
|---|---|---|
| origin-ui 身份/许可 | 完成 | 保留 `entryId: origin-ui`。产品（apps/ui）MIT，仓库其余 AGPL-3.0-or-later。facets 两者都标。 |
| a11y-project proof「可勾选控制」 | 完成 | HTML 有 64 个真实 checkbox。identity/breadth 截图与 URL 曾对调，已按画面改 URL。 |
| 9 条空 `noteZh` | 完成 | 见下表。每条独立 commit 并 push。 |
| 英文模板 `shot.alt` | 完成 | ecomm-design、a11y-project、laws-of-ux |
| facts.evidence 拼「独立复核来源」 | 完成 | a11y / ecomm 已删 |

## 9 条 noteZh

| entryId | 状态 | curator | reviewer | commit |
|---|---|---|---|---|
| 21st-dev | 已发布 | curator-1 | swarm-reviewer-grok | 247146d |
| magic-ui | 已发布 | curator-1 | swarm-reviewer-grok（改正「Marquee 排在最前」） | 4e14866 |
| hover-dev | 已发布 | curator-1 | swarm-reviewer-grok | c1c6a5a |
| origin-ui | 已发布 | curator-2 | swarm-reviewer-grok | 83beefe |
| entry-chakra-ui-react | 已发布 | curator-2 | swarm-reviewer-grok | 93c50aa |
| entry-ant-design-react | 已发布 | curator-2 | swarm-reviewer-grok | be8e948 |
| a11y-project | 已发布 | curator-3 | swarm-reviewer-grok | c0d8c89 |
| ecomm-design | 已发布 | curator-3 | swarm-reviewer-grok | 6dc00dd |
| entry-shadcn-studio-blocks | 已发布 | curator-3 | swarm-reviewer-grok | de7a04e |

样例未改人话：`shadcn-ui`、`uiverse`、`laws-of-ux`。

## 第 6 节新站

| entryId | 状态 | 备注 |
|---|---|---|
| base-ui | APPROVED | 无样式原语。入组「组件与区块」。commit `dd31307` |
| lucide | APPROVED | 图标素材。成员不够 3，未开新组，只出现在全部站点。commit `3f2d41d` |
| radix-ui | DRAFT | 首页是 Themes、目录/证明是 Primitives，entity 与 Site Entry 可能要拆。见 `drafts/radix-ui.questions.md`。未 APPROVED。 |

`npm run data` 现为 14 条 APPROVED。

## 日志

- 2026-09-05：拉 swarm（3 curator + 主控复核），开始第 8 节。
- 2026-09-05：第 8 节清完，`npm run data` 12 条通过。
- 2026-09-05：新站 swarm 进站；base-ui、lucide 复核后发布；radix-ui 因拆分问题留 drafts。
