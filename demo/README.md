# VisLexicon（视元）— demo

给人类用的「前端视觉选型器」，给 Agent 用的「设计上下文供给站」。

> 别描述效果，直接挑。调好参数 → 生成 Design Spec → 丢给你的 Agent，一次做对。

## 这是什么

一个完整的单页产品 demo，把完整方案（`../VisLexicon-完整方案.md`）的四层模型全部跑通：

- **L1 本体层**：28 词条 × 五轴受控词表（布局/交互/美学/动效/组件），中英口语别名，
  记谱法（Effect Notation）+ 基因位表。每一词条 = 一个可解引用 ID（`lex:id`）。
- **L2 资产层**：
  - 词典（首页）：可玩演示（滑参数实时改演示、参数直接进 Spec）；
  - 索引页：12 个库 + 组件级 Registry 超集索引，license_gate 三级许可门控；
  - 检索表：交互式二叉鉴定树——说不清？做选择题。
- **L3 组装层**：Spec 板（加入词条 → 目标配置 → 冲突检测 → Design Spec JSON，
  含参数、验收清单、agent_instructions_url）。
- **L4 分发层**：每词条 `.json` 端点、`llms.txt`、`llms-full.txt`、示例 `spec/sp_9f3k2.json` + `agent.md`（生成器 `scripts/gen-endpoints.mjs`，构建前自动跑）。

另有：词条详情页的 **动效解剖台**（scrub 时间轴 / X 光叠加 / 缓动曲线同步仪）、
**同属单变量对比页**、**测量工具**（浏览器内 k-means 提取色板 + Tailwind 映射、两图 ΔE 热图）、
**⌘K 全局命令面板**、亮/暗主题、Spec 板 localStorage 持久化。

## 运行

```bash
npm install
npm run dev      # 本地开发
npm run build    # prebuild 自动生成 L4 端点 + 产物到 dist/
npm run preview  # 预览产物
```

## 站点结构（hash 路由）

| 路由 | 页面 |
|---|---|
| `#/` | 词典（搜索 / 五轴筛选 / 可玩演示） |
| `#/entry/:id` | 词条详情（解剖台 / 记谱 / 基因位 / 最小实现 / 野外目击 / Agent 端点） |
| `#/index` | 组件索引（库 / 组件，许可分级） |
| `#/key` | 检索表（二叉鉴定树） |
| `#/tools` | 测量工具（Spec 提取器 / Diff 描述器 / 协议安装） |
| `#/submit` | 提交（GitHub-first 双轨） |
| `#/compare/:a/:b` | 同属单变量对比 |

## Agent 端点

- `https://vislexicon.dev/lexicon/{id}.json` —— 任意词条
- `https://vislexicon.dev/llms.txt` / `llms-full.txt` —— 全库索引
- `https://vislexicon.dev/spec/{id}.json` + `/agent.md` —— Design Spec
- MCP：`vislexicon-mcp`（search_patterns / get_lexicon_entry / get_component / resolve_spec）

## 技术栈

Vite + React 19，纯 CSS（设计系统全在 `src/App.css`），零运行时依赖。
数据为纯 JS 模块（`entries.js` / `index.js` / `key.js`），静态化即可被任何 RAG/Agent 引用。