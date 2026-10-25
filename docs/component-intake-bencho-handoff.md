# VisLexicon：Bencho 详情复现与后续组件入库交接

日期：2026-10-25。用户最新要求：**先交付一批真实可看的组件，详情内部按 Bencho 原站复现，再交给专用线程串行完成可入库组件。** 不要再做独立的组件网站。

后续执行约束（用户在本批收尾时明确追加）：另建一个 `gpt-6-luna` / `high` 线程持续处理所有符合条件的组件，**单模型、不得创建 subagent 或额外执行线程**。最多复用一个自有浏览器进程和一个页面，逐项运行、逐项释放；不操作用户已有窗口，不并发开大量浏览器。继续现有检查点并保留每项处置，不以固定批量或 20,000 条作为完成上限。监督任务每 30 分钟只读检查并按需发纠偏/续做消息；它不并行入库、不另开浏览器。

## 当前入口与实现位置

入口始终是综合网站原来的 `/#/components`。外层导航、原卡片、来源/类型筛选、分页与 Jev 检索继续使用原实现。点击卡片打开同一套详情；关闭后回到原来的列表和筛选位置。

研究工作区的前端目录是 `VisLexicon-browser-design-kit/frontend/`；GitHub 产品分支将此前端平铺在仓库根目录。以下路径均相对前端根目录。

| 文件 | 职责 |
|---|---|
| `src/components/ComponentCodeDetail.jsx` | 所有组件共用的 Bencho 详情结构、真实参数、代码、来源及交互 |
| `src/styles/component-detail-bencho.css` | 从原站测得的详情样式，限定在详情命名空间，不改综合网站外层 |
| `src/views/Components.jsx` | 原组件栏目、原检索与分页、打开/关闭详情 |
| `src/lib/component-code-details.js` | 详情请求共享、有限缓存；避免深链和 StrictMode 重复取同一份文件 |
| `src/lib/local-component-saves.js`、`src/views/Favorites.jsx` | 组件收藏可从原收藏页的组件分组重新打开；保留旧收藏 ID |
| `src/lib/playground-component-adapter.js`、`src/views/Playground.jsx` | 将选中实例及当前参数加入原工作台，支持实际预览、参数、删除和导出；不扩充左侧自动预览棚 |
| `server/component-code-index.mjs` | 只把有真实视觉预览的记录接入原索引 |
| `server/discovery-index.mjs` | 合并原索引；同一采集 ID 只补充详情能力，不重复计数 |
| `server/discovery-browse.mjs` | 索引对象级缓存来源、类型和排序，按页返回 |
| `server/component-bench.mjs` | 内部渲染器和逐项数据，不是新的用户页面 |
| `scripts/ingest-v6/seed-native.mjs` | 生成这批 20 个样例的详情和索引；14 个实时、6 个原站截图 |

`/component-bench/?solo=ID&embed=1` 只是选中组件的内部沙箱。直接访问 `/component-bench/` 回到原组件栏目，不能把它当作新的产品入口。

## Bencho 逆向依据与不可改动的设计

原站：[Stacked bars](https://bencho.dev/blocks/stacked-bars)。本机 REA 可用入口：

```powershell
$reaCli = Join-Path $env:USERPROFILE 'projects/rea-npm/node_modules/rea-agents/scripts/rea.mjs'
node $reaCli --version
node $reaCli capture-browser-scenario --schema
```

本机 `projects/rea` 是源码工作树，尚无 compiled runtime；使用上面的已安装 REA 6.4.0，不必重装整个工具链。其说明在 `projects/rea/.agents/skills/reverse-engineer-anything/SKILL.md` 和 `docs/browser-scenario-contract.md`。

实际做过 REA 的 `capture-browser-scenario`，捕获原站 Preview、Code、Usage、Source 等状态的截图、DOM 与可访问性树；也用 `analyze-javascript-application` 分析了取回的原站入口脚本。后者证据 ID：`ev_20fe6a22ed09c046261232db3f141d14e5b8022fe82b0664c0c976bd74a496cb`。它是入口脚本的静态证据，不能冒称所有组件代码都已执行或全部逆向。

原站 CSS：`https://bencho.dev/assets/index-DtKa_Itu.css`，SHA-256：`d50125cc441c28d241e675194dd08a5ac56faa1bd153bdc4b3e9a8edd1825904`。证据与各状态截图留在本地 `data/bencho-reference/20261025/`；不能把 loading 空白页当成已完成的 Code 视图。

1440×900、DPR 1 的桌面参数来自原 CSS 与真实截图：

| 项目 | 原值 |
|---|---|
| 详情整体 | 1000×640，左 220、上 130 |
| 预览栏 / 参数栏 | 688 / 300 |
| 两栏间距 | 12 |
| 面板圆角 | 28 |
| 参数栏内边距 | 18；算上边框，内容左边距为 19 |
| 标题 | 17px、500、行高 1.25 |
| 简介 | 13px、行高 1.45 |
| 数值参数条 | 高 44、圆角 10，无可见原生滑块拇指 |
| 主界面字体 | 原站 Inter；本地 `public/fonts/bencho-inter-latin.woff2` |

Inter 取自原站引用的同一 Google Fonts v20 字体地址，48,256 字节；SHA-256 `3100e775e8616cd2611beecfa23a4263d7037586789b43f035236a2e6fbd4c62`。完整 OFL 和固定提交来源在 `public/fonts/INTER-OFL.txt`、`bencho-inter-source.json`。

必须复用当前详情组件和样式，不得为新组件另画一套面板。保留预览/代码图标切换、原样的数值填充条、分段选项、侧栏与底部操作结构。详情 Portal 到 `document.body`；支持 Escape、焦点恢复和窄屏。改字号、加装饰、放大侧栏、恢复旧“原生滑块＋大标题”面板，都不属于入库工作。

原站的内容与本库组件内容不同，不能用整张图相似率谎称组件本身逐像素相同。应核对共用外壳的实际尺寸、边距、圆角、字体、颜色、控件和状态；不同组件只替换真实预览、标题、简介、参数与代码。

## 最重要的发布边界：源码不是视觉预览

以下内容保留在私有采集数据库，不能进入视觉卡片：只有源码却没有可用预览、API route、后台 SDK、工具函数、hook、依赖元数据、空容器、安装页面、loading 页面、报错页、未经验证的截图。

`source-ready` 只表示拿到了代码，不表示组件已经可看、可交互或已发布。registry 的 `registry:block` 也不是视觉分类：真实 button 仍按 button 分类；后端文件不会因为登记为 component 就成为 UI。

视觉卡片必须有真实预览图。实时组件还要通过本地运行，截图组件则保留原站实拍和直接来源链接。**禁止用代码段、空色块、骨架屏当组件封面。**

这批 6 张截图样例通过原始采集 ID、原站 URL 和图片字节哈希复用了现有记录，没有复制成 6 个新的组件。原始观察及重复处置不能丢掉。

## 新增一个组件的实际做法

开始前阅读项目 `AGENTS.md`、`public/agents/component-handoff.md`、`public/agents/component-capture.md` 和相邻 `component-questionnaire.json`。网站组件的批量采集按用户已批准的 v4 方法（研究区 `frontend/docs/harvest-method.md`、`frontend/scripts/harvest/`）：原站实拍、computed-style 数字、一次视觉调用和自动 gate；它取代旧的逐组件问卷/本地重建/复核链，不要重新加人工停顿。源码样例的实际运行和封面验证也不能冒充原站采集证据。

1. 固定具体实例：原站详情/registry item/仓库文件，记录来源与版本。不要拿首页链接代替实例链接。
2. 先留原始响应与文件字节、哈希，再做分类和去重。许可证必须核对对应的完整 LICENSE、范围和提交；许可证的提交不自动等于实时 registry 文件的提交。
3. 优先取原作者的完整 example 或 Storybook story。组件要求必填 props 时使用原例的实际 args，不要凭空补数字、文字或 children 让页面勉强出现。`NaN`、空组件、未加载图片都应拒收。
4. 保存完整原始源码、依赖、出处和许可证。MIT/Apache/BSD 等也要保留完整声明；未知、混合许可、Commons Clause 等不能自动当作普通 MIT 再分发。
5. 在隔离的浏览器沙箱运行实际源码。不要为每个组件手写一份“长得像”的本地复刻。真实 example 不运行时退回私有待处理，记录缺什么依赖或上下文。
6. 从该组件自己的 TypeScript 类型/真实默认值提取参数。当前样例的 `params[].prop` 必须能被提取器解析。自定义演示文字等使用 `demo:true`；编辑器 slider 的取值范围不冒充组件 API 的限制。
7. 验证默认态和实际可用的交互；分别记录 hover、点击、键盘、动画等已测范围。只看到静态截图不能断言动效存在或不存在。
8. 生成真实封面，查看图片，确认没有文档控件、loading、截断、空白和错误。再把这个已通过的实例接入原组件索引。

批量时每个原始命中必须有一个明确去向：实例、同变体状态、重复观察、非组件、片段、待补全或阻塞。原始数量必须守恒。扫描队列、源码文件数、导出数量、成功编译数量，都不能当作已发布组件数量。

## 当前样例的数据形状

公共详情按项读取：`/data/component-code/items/ID.json`。

```json
{
  "id": "稳定实例 ID",
  "sourceName": "原作者或项目",
  "sourceUrl": "具体原始实例 URL",
  "lane": "registry",
  "license": { "spdx": "MIT", "url": "固定提交的许可链接", "text": "完整原文" },
  "files": [{ "path": "原始文件路径", "content": "完整原始文件" }],
  "dependencies": [],
  "preview": {
    "status": "verified",
    "url": "/component-bench/?solo=实际渲染入口&embed=1",
    "posterUrl": "/component-bench/posters/实际实例.webp",
    "controls": []
  }
}
```

截图记录用 `lane:"screenshot"`、真实 `frames` 和原站链接；不能把截图说成实时渲染。无源码归档不等于原作者没有公开源码。

列表只投影轻量身份、简述、标签、实际图片和详情地址。完整源码、LICENSE、API 表、参数配置按需读取。价格、源码费用和商业许可分别核验；正向过滤必须由同一份已核实 offer 同时满足，未知值不能顶替肯定条件。

## 样例扩展与构建命令

研究工作区的 renderer 在前端旁边的 `../component-bench/`；产品分支在前端根目录的 `component-bench/`。脚本已支持两种布局。

```powershell
# 在 renderer 目录：源码和类型提取；先核对来源，不把网络更新当作旧版本
npm ci
npm run props

# 回到前端根目录：先构建现有内部渲染器
npm run build:bench

# 本地服务启动后，实际截图，生成透明、无损 WebP 与逐项哈希清单
node scripts/generate-component-sample-posters.mjs --origin=http://127.0.0.1:5291

# 更新样例元数据，再构建一次以打入新图片清单
node scripts/ingest-v6/seed-native.mjs
npm run build:bench
npm run build

# 本地生产预览需显式启用本机 API；否则静态预览不会提供组件分页接口
$env:VISLEXICON_PREVIEW_API = '1'
npm run preview -- --host 127.0.0.1 --port 5292
```

新增 renderer 适配器应在 `component-bench/src/previews/` 中绑定原始源码/安装包；在 `src/catalog.js` 中写来源、具体实例、依赖、API export 与真实参数映射。不要复制本次 20 个样例的数据来凑数量。

`src/generated/posters.json` 保存图像 SHA、真实大小和路径。当前 14 个实时样例的无损 WebP 合计约 52KB；PNG 原件与解码/像素校验放在本地证据目录。图片扩展名必须符合实际编码。

14 个实时样例均有非空原始主文件。通过 npm 运行的 5 个样例另归档了固定提交的 6 个完整主文件，来源、原路径、Git blob 和 SHA-256 保存在 `component-bench/src/generated/package-source-receipts.json`；构建样例时逐项验证字节。主文件依赖的其他文件仍由安装包提供，不能把这 6 个文件说成 5 个项目的完整代码库。代码区支持逐文件查看、复制和下载，不能显示空 Code 区假充源码。

## 性能约束与验收

- 列表维持原分页，单页最多 24 张卡片；列表不挂载 iframe 或所有组件库。
- 每个组件单独分包；只打开当前选中的一个沙箱。重播只重置该组件。
- 先显示它真实的封面；实际组件 commit 加两帧后发出 `vislexicon:ready` 再切换。不能靠固定 sleep 或“模块下载完毕”假称渲染完成。
- Code 视图暂停重型组件的渲染，仍可生成当前参数对应的实际用法；返回 Preview 时恢复。
- 拖动输入即时更新，预览可延后处理；pointer move 每帧合并。不要在 drag 期间逐次请求服务端或重新加载 iframe。
- 详情请求共享且缓存有界；深链、详情面板和 StrictMode 不得重复拉取同一项。
- 按索引版本缓存来源、类型和稳定顺序，不能每次分页都重新排序全库。
- 关闭后 iframe、动画、观察器和事件监听必须释放，恢复焦点、滚动和原列表位置。

运行有明确失败条件的测试，再在生产构建上测相同用例：

```powershell
node --test tests/component-detail-cache.test.mjs tests/component-bench-assets.test.mjs tests/component-code-publication.test.mjs
node scripts/verify-component-sample-performance.mjs --phase=final --origin=http://127.0.0.1:生产预览端口
node scripts/verify-component-sample-performance.mjs --phase=final-cpu4 --cpu=4 --origin=http://127.0.0.1:生产预览端口
```

记录页面/详情冷暖加载、真实参数到用法/画面的延时、滚动帧间隔、长任务、网络大小和反复关闭后的 iframe/内存。必须写机器、viewport、开发/生产、CPU 降速条件；不能把暖缓存或开发态的数字冒充所有场景，也不能用“构建成功”替代视觉和交互验收。

已完成的本地视觉校验包括 REA 原站与本地浅/深色 Preview、Code、Usage、Source 截图，并另用独立 DOM 测量检查尺寸。1440×900 的本地壳体为 `(220,130,1000,640)`，左侧宽 688，间隔 12，右侧宽 300；首个 Code 条为 `(232,190,664,46)`。390×844 的壳体为 `(12,12,366,820)`，首个 Code 条为 `(24,72,342,46)`，无横向溢出，关闭按钮命中通过。Inter 已实际加载。组件本体采用各自来源实现及真实参数；几何核对不代表不同组件内容的整张截图零像素差。

### 本批最终结果（2026-10-25）

生产包根 HTML SHA-256：`16b315dc3e68eace058557747cd2effcd8689251da2940f9e14f7485c38584f3`，入口 `index-CwIiVmdz.js`。本机 Windows 11（10.0.26200）、i7-1360P、16 逻辑核、约 16GB RAM、Chrome 156.0.8078.47；1440×900、DPR 1、回环网络无降速。生产产品只带本批 20 项样例，属于单页数据；本地 17,699 项、每页 24 卡及翻页证据另在开发态保留，不能混称全库生产测试。

| 指标 | 正常 CPU | 4 倍 CPU 降速 |
|---|---:|---:|
| 列表滚动帧间隔 p95 | 16.9ms | 16.9ms |
| 图表滑杆反馈 p95 | 33.5ms | 17.3ms |
| 图表对应参数用法提交 p95 | 49.0ms | 161.1ms |
| 流程图滑杆反馈 p95 | 15.4ms | 17.0ms |
| 流程图对应参数用法提交 p95 | 22.9ms | 102.3ms |

正常 CPU 的真实冷加载 715.1ms、浏览器缓存重载 409.3ms；API 暖响应 3.9–6ms，20 项返回 30,645B。两组均没有页面报错；每组反复关闭 8 次后 iframe 均为 0；GC 后单文档约 5.88MB。正常组达到既定预算。**降速组的复杂组件用法提交仍超出 100ms 目标，该组报告保留 `passed:false`，不能宣称全场景零卡顿，也不能把用法事件当成绘制时间。** 降速组编辑器反馈仍及时，滚动无长任务。

最终证据：本地 `data/bencho-reference/20261025/perf-production-accepted-{normal,cpu4}/report.json`、`perf-geometry-production-accepted/report.json` 和 `combined-functional-report.json`。166 项单元/集成测试通过，原站保存→收藏→重开、真实参数、四个代码区、加入原工作台、源信息导出、重载、删除、回跳等 17 项浏览器检查通过。音效上下文已移出输入热路径；图表使用真实 `initialDimension` 避免首次错误尺寸重绘，静态数据与圆角引用已缓存，关闭编辑器内的持续 Bar JS 动画。完整上游源码文件未被修改。

## 尚未完成的大库只是私有输入

早先抓到的 registry、GitHub/npm 源码和候选 frontier 在 `data/ingest-v6/`。批量采集已按用户最新要求停止；`source-ready`、候选导出和未完成依赖环境不能直接发布。本批样例使用独立的 renderer 依赖环境。

目前有些私有依赖安装未完成审计，部分大型仓库尚未取完；不存在全库 `export-ready` 证明。后续 AI 应先查看 `code/partial-status-20261025.json`、`runtime/provisioning-stopped.json` 与逐项处置，选择可验证的实例补齐，不必重扫已有原始文件。

大批截图、原始网页、会话、临时证据和私有配置留本地。GitHub `main` 只导出可运行产品、采集/验证代码和少量样例。不要合并研究仓库的私有历史，也不要提交任何模型密钥。
