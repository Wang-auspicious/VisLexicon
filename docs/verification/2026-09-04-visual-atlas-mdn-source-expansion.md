# Visual Atlas · MDN CSS 一手源扩充验证记录

日期：2026-09-04  
范围：只扩充图鉴语料、翻译、分类与生成产物；未修改页面布局、组件结构或视觉样式。

## 1. 接续点与决策

本批次接续 2026-09-04 13:12 后被中断的 Claude 工作。用户此前已明确选择“先加源，把东西堆齐，再逐步归类整理”。因此本批次没有优先粉饰既有未入台数字，而是完成已经写好但未落地的 `mdn-css` 采集器。

## 2. 一手来源

- 来源：[MDN CSS Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference)
- 仓库：[mdn/content](https://github.com/mdn/content)
- 固定 revision：`366bcbeeeb196a0bc34eaa4e6cdbf244c4ee8354`
- 许可：[CC-BY-SA-2.5](https://github.com/mdn/content/blob/main/LICENSE.md)
- 原始记录：751
- 原始记录 ID：751 个，全部唯一
- 必填证据缺失：0

来源类别守恒：

| 类别 | 数量 |
|---|---:|
| CSS property | 489 |
| CSS shorthand property | 77 |
| CSS pseudo-class | 96 |
| CSS pseudo-element | 53 |
| CSS at-rule | 22 |
| CSS selector | 9 |
| CSS combinator | 5 |
| 合计 | 751 |

## 3. 实施内容

- 将 `mdn-css` 加入编译器和翻译器的显式来源白名单。
- 新增可测试的 `classifySourceRecord()`：MDN 条目按名称与页面类型落入 motion、layout、interaction、aesthetic；selector、combinator、at-rule 作为 pattern，其余作为 design phenomenon。
- 媒介绑定写为 `web/css`。
- `generatedAt` 不再钉死为 `2026-08-31`，改为所有计数源和 coverage 源中最新的 `retrievedAt`，当前为 `2026-09-04`。
- 修复 CSS 身份冲突：`@rule`、`:pseudo-class`、`::pseudo-element` 与尾随 `()` 函数形式在规范化 ID 中保留语义命名空间。修复前 `::view-transition`、`@view-transition` 会误绑普通 `View transition`；修复后 MDN 751 条记录对应 751 条独立候选证据，MDN 自动发布数为 0。
- Google 公共翻译端点返回 HTTP 429 后，改用隔离的 Argos Translate `en_zh 1.9` 离线模型补齐 1500 条缺失翻译。仅在 1500/1500 成功、0 failure 后原子替换缓存；所有新增项仍标记 `quality: machine`，未冒充人工校对。

## 4. 数据变化

| 指标 | 批次前 | 批次后 | 变化 |
|---|---:|---:|---:|
| 计数源 | 24 | 25 | +1 |
| 原始来源记录 | 1,555 | 2,306 | +751 |
| 去重 Atlas 条目 | 1,046 | 1,791 | +745 |
| aesthetic | 10 | 419 | +409 |
| component | 776 | 776 | 0 |
| interaction | 188 | 312 | +124 |
| layout | 0 | 162 | +162 |
| motion | 72 | 122 | +50 |
| published | 6 | 6 | 0 |
| candidate | 1,040 | 1,785 | +745 |

MDN 自身分类：aesthetic 411、interaction 124、layout 162、motion 54；design phenomenon 715、pattern 36。

舞台认领仍为 173 个 claim / 170 个唯一词条；未入台从 876 增至 1,621。这是“先加源”的诚实结果，不应伪装成已完成舞台建档。

## 5. 产物与哈希

| 文件 | 字节 | SHA-256 |
|---|---:|---|
| `demo/data/visual-atlas-sources/mdn-css.raw.json` | 487,662 | `C41C26A4AC3A90D9D5531D3BC11118ACD79470B68C336D9D06D091678F8D086F` |
| `demo/data/visual-atlas-translations.zh.json` | 1,168,670 | `6472BD5CA756AF3CDE4406E75D35151F3C6D1CB62E2D78FC41E970CEC3053195` |
| `demo/src/data/visual-atlas.json` | 3,718,656 | `4B337C75EB72DC44280300BE76E774D408013091A5029C126A8707BF1337F1AF` |
| `demo/public/data/visual-atlas-index.json` | 1,300,006 | `6A94E8C8F2F16C9687FC41F313A72B3AB688E592B56B4ECF9AED582E64A77B94` |

静态详情端点：1,791 个。第二次实际重建的四个哈希与第一次完全一致。

## 6. 验证

- `npm run atlas:test`：31 / 31 PASS
- `node --test tests/stage-index.test.mjs`：13 / 13 PASS
- `node --test tests/*.test.mjs`：441 / 441 PASS
- 变更文件定向 `oxlint`：0 warning / 0 error
- 全量 `npm run lint`：退出码 0；仍输出既有历史 warnings，本批次未扩大处理范围
- `npm run build`：PASS；Vite 仍提示既有大 chunk 警告
- 实际 Atlas 连续重建：字节与 SHA-256 稳定

## 7. 下一步

继续遵循“先加源”：优先验证并接入已经在来源审计中列明的 Figma Plugin API 类型词汇（82 个 namespaced options），再评估开放许可的字体/排版与设计 token 一手源。新源必须先保存原始记录、固定 revision 和许可，再翻译、编译；不得用手造列表填数字，也不得触碰冻结布局。

