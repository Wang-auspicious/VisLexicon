# Visual Atlas · Google Fonts 可变字体轴扩充验证记录

日期：2026-09-04  
范围：只扩充图鉴语料、解析器、翻译、分类与生成产物；未修改冻结的页面布局或视觉样式。

## 1. 一手来源

- 来源：[Google Fonts Axis Registry](https://github.com/googlefonts/axisregistry)
- 固定 revision：`c3bd6015d8c8f2a4c85f15226c631c72070c0e62`
- 数据目录：`Lib/axisregistry/data/*.textproto`
- 许可：[Apache-2.0](https://github.com/googlefonts/axisregistry/blob/c3bd6015d8c8f2a4c85f15226c631c72070c0e62/LICENSE.txt)
- 当前文件：57 份 textproto

该仓库是 Google Fonts Axis Registry 的官方 upstream；仓库说明 upstream 偶尔会领先线上产品。因此这 57 条全部作为 candidate，不把 upstream 身份冒充为已在生产产品最终发布。

## 2. 计数与边界

- 一份 textproto = 一条原始 axis observation。
- tag 57 / 57 唯一；sourceRecordId 57 / 57 唯一。
- 必填证据缺失 0；`min <= default <= max` 违规 0。
- 每条保留：tag、display name、官方 description、min/default/max、precision、fallbackOnly、固定 revision 与源文件路径。
- fallback 位置、刻度名称和 SVG illustration 只作源内元数据/素材，不另算词条。
- Atlas 名称使用 `Variable font axis: <display name>`；tag 与 display name 进入 aliases，避免与普通的 Weight、Width、Contrast 等词误合并。

## 3. 解析故障与修复

首次采集被 fail-closed 门拦下。根因是 3 份合法 textproto 在数值后带 `#` 行尾注释；第一版修复又误删了纯行尾空格容忍。两种真实形态均先写成失败测试，再将数值语法修正为“数字 + 可选空白 + 可选 `#` 注释”。修复后 57 份全部解析，失败过程没有生成半份快照。

## 4. 数据变化

| 指标 | 批次前 | 批次后 | 变化 |
|---|---:|---:|---:|
| 计数源 | 26 | 27 | +1 |
| 原始来源记录 | 2,390 | 2,447 | +57 |
| 去重 Atlas 条目 | 1,875 | 1,932 | +57 |
| aesthetic | 447 | 504 | +57 |
| component | 776 | 776 | 0 |
| interaction | 312 | 312 | 0 |
| layout | 193 | 193 | 0 |
| motion | 147 | 147 | 0 |
| candidate | 1,869 | 1,926 | +57 |
| published | 6 | 6 | 0 |

114 个新 SHA 翻译键由隔离 Argos `en_zh 1.9` 完成，114 / 114 成功、失败 0，缓存总量 4,766；新增译文均明确标记 machine。

舞台仍为 173 个 claim / 170 个唯一词条，未入台 1,762。该数字增长符合用户“先加源”的顺序，不代表舞台已完成建档。

## 5. 产物与哈希

| 文件 | 字节 | SHA-256 |
|---|---:|---|
| `demo/data/visual-atlas-sources/google-fonts-axis-registry.raw.json` | 50,019 | `D88AE74707291C63C2E130468BB1E3E7367BF59473CA7653BA8404F2A1083D90` |
| `demo/data/visual-atlas-translations.zh.json` | 1,246,538 | `FE1264C7E61B65550F2CA14D8C78835B09E9567EA8CBC47704FB422B2F692115` |
| `demo/src/data/visual-atlas.json` | 3,976,175 | `42432FB22B889BE310E02D3926BA6EFA3E6B223C872500E8B7CDB6D80AD08F60` |
| `demo/public/data/visual-atlas-index.json` | 1,407,348 | `895633AE50D5346BD5E0704738DE0C21216A66CF24728457378FF86646B41B86` |

静态详情端点：1,932。连续两次实际 Atlas 重建的上述哈希完全一致。

## 6. 验证

- `npm run atlas:test`：35 / 35 PASS
- `node --test tests/stage-index.test.mjs`：13 / 13 PASS
- `node --test tests/*.test.mjs`：445 / 445 PASS
- 变更文件定向 `oxlint`：0 warning / 0 error
- `npm run lint`：退出码 0；仍有既有项目 warnings
- `npm run build`：PASS；仍有既有大 chunk 提示

## 7. 三批合计

本次接续共新增三份一手源：MDN CSS 751、Figma Plugin API 84、Google Fonts Axis Registry 57，合计 892 条原始记录。Atlas 从 1,046 增至 1,932（+886），published 始终保持 6，没有把“已采集候选”冒充“已手写舞台/已审核发布”。

临时翻译环境清理被宿主安全策略在执行前拒绝，未删除任何文件。可复用或后续手工清理的精确路径记录在 `.learnings/ERRORS.md` 的 `ERR-20260904-004`；这不影响项目产物。
