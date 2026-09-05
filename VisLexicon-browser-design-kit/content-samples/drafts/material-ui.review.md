# material-ui review addendum · 2026-09-05 · swarm-reviewer-grok-b

复核通道：open_page / web_fetch 打开活页，Node crypto 重算 PNG。无登录墙。Cookie 条在右下，未盖住一半。

## Pages reopened

| role | URL | title | 与截图 |
|---|---|---|---|
| identity | https://mui.com/material-ui/ | Material UI: React components that implement Material Design | 匹配 Ready to use Material Design components + npm install |
| breadth | https://mui.com/material-ui/all-components/ | Material UI components - Material UI | 匹配 Inputs 卡片 |
| proof | https://mui.com/material-ui/react-button/ | React Button component - Material UI | 匹配 text / contained / outlined |

三张 PNG 互异，1280×900。独立 Dialog 文档 https://mui.com/material-ui/react-dialog/ 存在，但不在三页 URL 内，故去掉 Dialog atlasTerm。

## Facts re-quoted

- packages/mui-material/package.json：author MUI Team，name @mui/material，license MIT，homepage https://mui.com/material-ui/。
- LICENSE：MIT / Copyright (c) 2014 Call-Em-All。
- Privacy：MUI means Material-UI SAS（组织名按法律页，不用首页页脚猜测写法）。
- Pricing：Start using MUI's products for free! / MUI Core free forever；Material UI 列在 MUI Core (open-source)。未复核到草稿里的 $299，故不写入证据。
- 与已发布的 base-ui 同属 mui 组织、不同入口，不合并。

## Result

APPROVED。入组 `components-and-blocks`。confirmed 分类去掉 alternatives。
