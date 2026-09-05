# 策展内容进度

按 `docs/策展内容生产手册-给AI员工.md` 顺序执行。主控：Grok。开始：2026-09-05。

## 当前阶段

**第 8 节语料欠账**（手册写明「顺手处理，不要绕过」）。未完成前不扩新站。

## 第 8 节清单

| 项 | 状态 | 负责 | 备注 |
|---|---|---|---|
| origin-ui 身份/许可（Coss / Cal.com，MIT vs MIT/AGPLv3） | 进行中 | curator-2 | 保留 `entryId: origin-ui`，只更新事实，除非证据证明必须改 id |
| a11y-project proof「可勾选控制」 | 进行中 | curator-3 | 人工开 Checklist 页核对 |
| 9 条空 `noteZh` | 进行中 | curator-1/2/3 | 见下表 |
| 英文模板 `shot.alt` | 进行中 | curator-3 为主 | ecomm-design、a11y-project；顺手扫 laws-of-ux |
| facts.evidence 拼「独立复核来源」 | 进行中 | 各 curator 改自己的文件 | 新写/改写时删掉该后缀 |

## 9 条 noteZh

| entryId | 状态 | curator | reviewer |
|---|---|---|---|
| 21st-dev | 进站中 | curator-1 | 待派 |
| magic-ui | 进站中 | curator-1 | 待派 |
| hover-dev | 进站中 | curator-1 | 待派 |
| origin-ui | 进站中 | curator-2 | 待派 |
| entry-chakra-ui-react | 进站中 | curator-2 | 待派 |
| entry-ant-design-react | 进站中 | curator-2 | 待派 |
| entry-shadcn-studio-blocks | 进站中 | curator-3 | 待派 |
| a11y-project | 进站中 | curator-3 | 待派 |
| ecomm-design | 进站中 | curator-3 | 待派 |

样例已有、不改人话：`shadcn-ui`、`uiverse`、`laws-of-ux`（`editorialVoice.status: exemplar`）。

## 编制

- 主控：收口、taxonomy、build、commit、push
- curator-1 / 2 / 3：并行进站，各 3 条
- reviewer：JSON 落地后独立复核（`reviewerId ≠ curatorId`）

## 提交约定

每条过复核后单独 commit：`content: write noteZh for <entryId>`，立刻 push。欠账全部清完后再按第 6 节做新站。

## 日志

- 2026-09-05：拉 swarm，开始第 8 节。
