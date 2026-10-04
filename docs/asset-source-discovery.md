# 素材来源发现种子

`data/social-discovery/asset-source-seeds-20261003.json` 是产品分支使用的只读发现种子，不是公开素材库存，也不会自动发布 `AssetEntry`。它把素材源分成 `redistributable_cc0`、`redistributable_open_license`、`api_preview_only`、`manual_curated_only` 和 `link_only`，让 agent 在拿取前先知道许可证、归因、API、速率和再分发边界。

运行时必须按每个 source 的 `requiredFields` 保存原始观察、来源页、许可证 URL、作者、取回时间和文件 hash。论坛、视频和社媒只产生发现线索；只有回到单个资产的原始许可页并通过人工复核，才可以进入候选队列。`publish` 保持 `false`，因此这次导出不会改变公开素材数量。

完整的历史工作流、论坛/社媒证据和官方许可核验保存在研究工作区，不进入产品运行时。
