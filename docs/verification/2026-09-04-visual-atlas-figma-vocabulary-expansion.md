# Visual Atlas · Figma Plugin API 词汇扩充验证记录

日期：2026-09-04  
范围：只扩充图鉴语料、解析器、分类、翻译与生成产物；未修改冻结的页面布局和视觉样式。

## 1. 一手来源与计数漂移

- 来源：[Figma Plugin API typings](https://github.com/figma/plugin-typings)
- 固定 revision：`9d38b4222b07c7499bc737fe148e85983ec3b95a`
- 数据文件：`plugin-api.d.ts`
- 官方 API 参考：[Figma Developer Docs](https://developers.figma.com/docs/plugins/api/api-reference/)
- 许可：[MIT](https://github.com/figma/plugin-typings/blob/master/LICENSE)

2026-08-31 的来源审计记录为 82 项。当前固定 revision 中 `AutoLayoutMixin.primaryAxisAlignItems` 新增 `SPACE_EVENLY` 与 `SPACE_AROUND`，因此真实可复核总数是 84。没有删除新值去迎合旧数字；漂移已写入 `.learnings/LEARNINGS.md`。

## 2. 十四个命名空间

| 命名空间 | 数量 | Atlas 轴 |
|---|---:|---|
| blend-mode | 19 | aesthetic |
| text-case | 6 | aesthetic |
| text-decoration | 3 | aesthetic |
| constraint | 5 | layout |
| overlay-position | 8 | layout |
| simple-transition | 3 | motion |
| directional-transition | 5 | motion |
| transition-direction | 4 | motion |
| easing | 13 | motion |
| auto-layout-mode | 4 | layout |
| auto-layout-wrap | 2 | layout |
| primary-axis-alignment | 6 | layout |
| counter-axis-alignment | 4 | layout |
| counter-axis-track-alignment | 2 | layout |
| 合计 | 84 | — |

同名 literal 不跨命名空间合并。例如 `CENTER` 在 constraint、overlay-position、primary-axis-alignment、counter-axis-alignment 中是四条不同记录。每条保留原 literal alias、声明位置和独立来源 ID。

## 3. 实施内容

- 新增 `parseFigmaPluginVocabulary()`，支持命名 union type 与 interface property union；接口解析使用括号深度，而不是依赖脆弱单行正则。
- 采集器固定 Git revision、读取一手 typings、逐命名空间核对数量，任何单组漂移或总数漂移均失败关闭。
- 原始快照 84 / 84、ID 全唯一、必填证据缺失 0。
- 新增 `figma-plugin-vocabularies` 分类与编译/翻译白名单；媒介绑定为 `design/figma-plugin`。
- 168 个新术语/定义使用隔离 Argos `en_zh 1.9` 翻译，168 / 168 成功、0 failure，仍明确标记 machine。
- 84 条记录全部形成独立 candidate，自动发布数为 0；没有因为与现有词相似而越过证据门。

## 4. 数据变化

| 指标 | 批次前 | 批次后 | 变化 |
|---|---:|---:|---:|
| 计数源 | 25 | 26 | +1 |
| 原始来源记录 | 2,306 | 2,390 | +84 |
| 去重 Atlas 条目 | 1,791 | 1,875 | +84 |
| aesthetic | 419 | 447 | +28 |
| component | 776 | 776 | 0 |
| interaction | 312 | 312 | 0 |
| layout | 162 | 193 | +31 |
| motion | 122 | 147 | +25 |
| candidate | 1,785 | 1,869 | +84 |
| published | 6 | 6 | 0 |

舞台仍为 173 个 claim / 170 个唯一词条，未入台 1,705；本批遵循“先加源”，未把自动分类冒充舞台建档。

## 5. 产物与哈希

| 文件 | 字节 | SHA-256 |
|---|---:|---|
| `demo/data/visual-atlas-sources/figma-plugin-vocabularies.raw.json` | 51,627 | `1320A747FB0323D10C0C74587959FCEF612B0ECC65A332796C6335BD0343042D` |
| `demo/data/visual-atlas-translations.zh.json` | 1,209,454 | `C1309A0071B0241D3474613A93E91FABE768C57FD1DA790D69F51EC797BD1F8B` |
| `demo/src/data/visual-atlas.json` | 3,855,580 | `46B6D2B102049ACB9F5844F283F8EEB28C391F843E4A6A62BE58BB8DB99CFCAA` |
| `demo/public/data/visual-atlas-index.json` | 1,356,756 | `2AB04673C94A724A7B0FAEBBFBF126C9B89662C4FABC40622BC9411332036DFE` |

静态详情端点：1,875。连续两次实际 Atlas 重建的上述哈希完全一致。

## 6. 验证

- `npm run atlas:test`：33 / 33 PASS
- `node --test tests/stage-index.test.mjs`：13 / 13 PASS
- `node --test tests/*.test.mjs`：443 / 443 PASS
- 变更文件定向 `oxlint`：0 warning / 0 error
- `npm run lint`：退出码 0；仍有既有项目 warnings
- `npm run build`：PASS；仍有既有大 chunk 提示

## 7. 下一步

优先补“文字与排版”领域的一手深度：Google Fonts Axis Registry 当前固定 revision 有 57 份 Apache-2.0 `textproto` 轴定义，包含 tag、display name、数值范围与官方描述。若接入，必须按 57 份原文件逐项保存，不把 fallback 刻度或示意 SVG 另算词条。

