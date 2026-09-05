# carbon blockers · swarm-reviewer-grok-e2 · 2026-09-06

不能 APPROVED。identity 成立，breadth/proof 不是站点上的组件证据。

1. `v2-identity.png` 是 carbondesignsystem.com 首页，IBM 开源设计系统写在首屏，可用。
2. `v2-breadth.png` 是 GitHub `carbon-design-system/carbon` 仓库树（packages/docs/examples），不是组件总览。仓库目录回答「源码仓有多大」，不回答「设计系统里有哪些可复用组件」。
3. `v2-proof.png` 是 GitHub `packages/react/src/components/Button` 文件列表（Button.tsx / Button.stories.js / Button.mdx）。这是源码树，不是组件演示。Handbook 要求 proof 是具体条目页上的预览或可复制实现，GitHub tree 不算。

复核时站点已可打开：

- 范围：https://carbondesignsystem.com/components/overview/components/
- 证明：https://carbondesignsystem.com/components/button/usage/（含 Live demo，并链到 react.carbondesignsystem.com Storybook）

请重截这两页 1280×900 首屏，改 `pages[breadth|proof]` 的 URL/title/alt/sha256 后再复核。保持 DRAFT。勿写入 `approved-v3`。
