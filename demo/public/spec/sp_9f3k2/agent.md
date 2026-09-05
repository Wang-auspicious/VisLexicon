# Agent 指引：sp_9f3k2

按本 Spec 实现目标页面。阅读顺序与要点：

1. **先读要点中的 lex: 词条**：GET {origin}/lexicon/{id}.json 取定义、minimal_code、参数域与关键帧（VLM 无法看视频时用 keyframes 字段）。
2. **构图**：aesthetic 词条定基调 → layout 词条定分块 → interaction/motion 词条挂到具体元素。
3. **参数即验收**：interactions.params 与演示参数一致；acceptance 是自检清单，逐项核对。
4. **取图**：assets 用 vislexicon-reader 用户侧取回；失败时以 spec 字段为准，不用低清图猜。
5. **失败回退**：某词条实现不了时，保留结构、优先保证 acceptance 中层级与间距两项。
