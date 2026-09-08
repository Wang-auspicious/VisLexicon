# Effects Atlas Expansion Implementation Plan

**Goal:** 审计全部现有内容，基于一手需求证据扩展至 4000+ 有区分度的条目，为全部网页风格提供真实展示证据，统一语言与主题。

**Architecture:** `frontend/public/effects-atlas/fx` 是浏览器直接加载的数据；先对它和 `src/data/effects-fx` 做差异核验，再确定唯一发布源。保留用户指定 HTML 结构，新增独立数据校验与证据模块，避免继续创建不一致的副本。

**Tech Stack:** React、DC runtime、ES modules、Node.js 原生测试和审计脚本、Vite。

## Work order and gates

### 1. Reproducible baseline
- [ ] 创建 `frontend/scripts/audit-effects-atlas.mjs`：从实际发布目录导入模块，统计逐模块数量、缺失模块、重复身份、重复标题、精确重复 CSS、描述与说明完整度、有效 stage、缺失资源。
- [ ] 将 JSON 报告写入 `docs/research/effects-atlas-baseline.json`；重复项仅列候选，不自动删除。
- [ ] 核对下载截图压缩包及现有截图清单，保留原始文件，不给未知图片编造来源。
- [ ] 逐模块计算和等于总量；旧数据身份集合在扩展后不得无故丢失。

### 2. Language contract
Files: `frontend/public/effects-atlas/index.html`, `frontend/public/effects-atlas/fx/index.js`, `frontend/tests/effects-locale.test.mjs`.
- [ ] 在提示词首句去掉另一个语言的括号标题。
- [ ] 提示词生成函数只使用当前主站语言；删除独立的 prompt 语言开关。
- [ ] 卡片副标题仅在搜索时显示当前语言分类，正常模式不显示另一语言名。
- [ ] 风格列表标题、关键词、详情标题和总览组副标题不显示另一语言。
- [ ] 审计英文内容中的中文字符，逐条修正，保留代码标识符和品牌名。
- [ ] `node --test tests/effects-locale.test.mjs` 验证两种语言提示词不包含另一语言标题。
- [ ] 主站语言切换不丢失当前条目、参数与滚动位置；监听 iframe ready 后再同步。

### 3. Research and editorial inventory
Files: `docs/research/effects-atlas-coverage.md`, `docs/research/effects-atlas-sources.json`, `frontend/public/effects-atlas/fx`.
- [ ] 使用官方组件文档比较 APG、React Aria、Radix、Base UI、shadcn/ui、Ark UI、Ant Design、Material UI 的目录与行为约束。
- [ ] 保存来源 URL、获取日期、所支持的具体需求；按组件任务组织条目，避免同一组件以不同库名字重复计数。
- [ ] 对现有 19 个空模块和新发现的领域建立逐条候选清单，附与旧条目区别。
- [ ] 对真实场景补足失败恢复、键盘、异步、协作、触屏、移动布局；不能简单做组件 × 状态笛卡尔积。
- [ ] 首先把所有候选与既有中英文标题比较；语义近似项人工保留或合并并说明理由。

### 4. Expansion batches
- [ ] 视觉基本功：颜色、网格、图标、摄影与裁切，扩充设计系统语义。
- [ ] 核心组件：表格、树、拖放、键盘、命令、复杂表单、上传与选择器。
- [ ] 产品任务：搜索、认证、引导、编辑、地图、社交、日历、支付、通知与偏好。
- [ ] 运行状态：同步、离线、冲突、撤销、长任务、监控、可访问替代路径。
- [ ] 平台能力：CSS、原生 API、组件组合，按真实行为差异入库。
- [ ] 每批内容逐条具备双语说明、实现约束、真实 demo 和出处。涉及语义交互须以真实控件/事件示例呈现，不能把外观动画冒充完整实现。
- [ ] 每批运行审计；累计 4000+ 后做第二轮重复、描述相似和 demo 同质化审查。不达质量要求的内容回到草稿区，不计入总数。

### 5. Website style evidence
Files: `frontend/public/effects-atlas/style-evidence.json`, `frontend/public/effects-atlas/screenshots/`, `frontend/public/effects-atlas/index.html`.
- [ ] 枚举 51 个网页风格，逐条列出候选优秀网站、页面 URL 和风格匹配理由。
- [ ] 检视 ZIP 的 14 张截图，只在能确认原站和对应风格时复用；无法识别的保持未匹配状态。
- [ ] 打开真实网站确认，再截图并记录来源、采集时间、视口、文件哈希和证据说明。
- [ ] 将风格卡片右侧草图替换为真实截图，详情展示大图和可点击来源。
- [ ] 为无法立即取到的截图显示明确待核验状态，继续寻找替代优秀来源；所有 51 个风格完成证据核验后才满足交付条件。

### 6. Integrated verification
- [ ] 逐大组检查总览、分类、详情、参数、加载更多、提示词与截图；浏览器仅用于必要视觉/交互核验。
- [ ] 验证中文和英文模式、浅色和深色；效果预览的设计颜色不能被全局主题强制覆盖。
- [ ] 运行数据和语言测试、`npx vite build`，再运行完整 `npm run build` 检查发布门禁；不绕过已有审核状态门禁。
- [ ] 对所有改动明确列出验证覆盖与限制，检查提交只包含本目标文件，推送并核对远端提交。
- [ ] 最终逐项对照完整目标，未通过项继续工作，不用“系统可扩展”代替真正完成 4000+ 内容。
