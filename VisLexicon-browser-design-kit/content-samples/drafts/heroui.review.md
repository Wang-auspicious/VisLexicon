# heroui review addendum · 2026-09-05 · swarm-reviewer-grok-b

复核通道：open_page / web_fetch 打开活页，Node crypto 重算 PNG。无登录墙。三张截图左下角均有 HeroUI Pro 弹窗，但标题、目录、Button 导入仍可读，未当登录墙。

## Redirect

`https://www.heroui.com/` → `https://heroui.com/`。
`/docs/components` → `/en/docs/react/components`。
`/docs/components/button` → `/en/docs/react/components/button`。

## Pages reopened

| role | final | title | 与截图 |
|---|---|---|---|
| identity | https://heroui.com/ | HeroUI（首页首屏 Beautiful by default） | 匹配；未见 Previously NextUI 字样（该说法在 GitHub README） |
| breadth | https://heroui.com/en/docs/react/components | HeroUI React Components – Accessible UI Library | 匹配 All Components (React) / Buttons |
| proof | https://heroui.com/en/docs/react/components/button | HeroUI Button – Accessible React Button Component | 匹配 `import { Button } from '@heroui/react'` |

三张 PNG 互异，1280×900。

## License scope（复核改写）

- `@heroui/react` v3.2.4 `packages/react/package.json` 与 npm 均为 MIT。
- 默认分支 v3 根 LICENSE 现为 Apache-2.0，Copyright 2025 NextUI Inc.。
- `heroui-native` npm 为 Apache License 2.0。
- 本条 facts[license]=MIT，范围仅 @heroui/react，不覆盖 Native / 根 LICENSE / Pro 模板。

## Other facts

- About：Y Combinator S24 company founded by Junior Garcia。
- 顶栏：HeroUI Pro is live - Components, templates & AI tooling。
- access 改为 freemium + open-source。confirmed 分类去掉 alternatives。

## Result

APPROVED。入组 `components-and-blocks`。
