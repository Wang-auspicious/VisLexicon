# 图鉴 · 一族一舞台（Atlas Stage Model）设计

日期：2026-09-03
状态：已实现并通过浏览器验证
范围：仅图鉴。拼装台是独立后续项目，见文末。

更新：2026-09-03 第二轮，舞台 2 → 5 台，已入台术语 30 → 81。
更新：2026-09-03 第三轮，舞台 5 → 8 台，已入台 81 → 123，并加入译名订正与依附变体两条契约。
更新：2026-09-03 第四轮，转向把语料做厚：**词条 419 → 659**，六条历史失败清零，新增行为层来源与指针手势台（第 9 台），参数类型泛化为连续/开关/枚举。

## 问题

图鉴此前是 wiki 文件树 + 单条演示（`src/views/Lexicon.jsx`）。一条术语一张卡片的形态有两个硬伤：

1. 同构度极高的一族效果（文字浮现的十几种演法）被拆成十几个互不相邻的条目，用户无法横向对比，而横向对比正是"记住它叫什么"的唯一有效方式。
2. 结构性术语（agent 界面上的 composer、附件芯片、推理块）一旦离开它在界面里的位置，就再也拼不回去。位置本身就是索引，卡片把这个索引扔了。

## 决策

**舞台（Stage）是图鉴的组织单元，不是术语。** 一族效果聚成一个舞台，术语作为该舞台的挂点存在。

舞台注册表是开放可生长的，不预设数量。归族按**效果形态**，不按来源：动效库里属于"文字浮现"形态的条目认领进文字浮现台，而不是另开一个"GSAP 台"。

### 三种挂法

| slot | 含义 | 交互 |
| --- | --- | --- |
| `variant` | 可切换变体 | 点它，中间换一种演法 |
| `hotspot` | 部件热区 | 悬停它，中间对应部件描边跑一圈；反向悬停部件则报出正名 |
| `param` | 参数 | 调它，中间实时跟着变。三种类型：`range` 连续量、`boolean` 开关、`enum` 枚举 |

另有 `knobs`：**没有对应术语**的纯微调旋钮（composer 距底几像素、圆角、消息间距）。这类细节正是要能调的地方，但它们没有正名，所以不伪造术语 id，也不参与术语路由。

### 依附变体的热区

有些部件只在某个状态下存在：骨架屏只在加载态里，流光只扫在骨架上。这类热区用 `underVariant` 指向同台的一个变体术语，点它时舞台先切到那个变体再描边。校验保证它指向的变体真实存在且确实是 variant。

### 译名订正

语料里的中文名大量是机器翻译，`Composer` 译成"作曲家"、`Skeleton` 译成"骷髅"、`Loader` 译成"装载机"。`visual-atlas.json` 是流水线产物，订正不能写回去。所以订正落在认领侧：`claim.termZhFix` 覆盖显示名，语料原译在右栏照样摊开给人看，已订正的条目不再挂"机器译名 · 待校"标记。

不做全量校对，只保证**上了台的条目不丢人**。校验挡掉与原译相同的冗余订正（第三、四轮共挡下 5 条）。`machineNameDebt()` 把欠账量化：当前台上 108 条已订正、55 条仍挂机器译名。

### 认领关系写在舞台侧

`visual-atlas.json` 带 `generatedAt` / `revision`，是采集流水线的产物。认领关系若写进它，下一次 `npm run atlas:build` 就会冲掉。因此由 manifest 声明「本台认领哪些术语」，外壳构建反向索引。人写的归人，机器生成的归机器。

### 未入台术语

`unrouted = 语料全集 − 已认领`，进"待建档"伪台：左栏灰置可见，右栏照常给释义与来源，中间给诚实空态。当前 162 / 659 已入台，497 待建档——缺口是显式可见的，不是被藏起来的。左栏不再截断列表：截断过的列表就是在悄悄丢词。

## 文件

```
demo/src/lib/stage-index.js        纯函数：manifests + atlas → 分组 / 反向索引 / 未入台余量
demo/src/lib/atlas-source-link.js  术语来源 → 网站库同域条目反查
demo/src/stages/manifests.js       纯数据汇总，node --test 可直接 import
demo/src/stages/registry.js        清单与组件配对，唯一碰 JSX 的一层
demo/src/stages/node.js            节点绑定器，热区双向联动
demo/src/stages/text-reveal/       文字浮现台（变体型，10 条）
demo/src/stages/agent-composer/    Agent 对话界面台（热区型，21 条）
demo/src/stages/overlay-layers/    浮层台（变体型 + 行为标注，14 条）
demo/src/stages/form-anatomy/      表单解剖台（热区型，21 条）
demo/src/stages/surface-transition/ 过渡形变台（变体型，四种演示外壳，16 条）
demo/src/stages/data-display/      数据展示台（热区型，四种表格类同屏对照，19 条）
demo/src/stages/state-loading/     状态与加载台（变体 + 依附变体热区，9 条）
demo/src/stages/navigation/        导航台（热区型 + 流程变体，14 条）
demo/src/stages/pointer-gestures/  指针与手势台（变体 + 热区 + 三类参数，39 条）
demo/src/views/Atlas.jsx           三列外壳
demo/src/atlas.css                 外壳与舞台样式，取 App.css 的 token
demo/tests/stage-index.test.mjs    认领校验
demo/scripts/verify-atlas.mjs      headless CDP 浏览器验证 + 截图
```

新增一族 = 新建目录、写 manifest、在 `manifests.js` 与 `registry.js` 各加一行。外壳零改动。

## 契约

`buildStageIndex(manifests, atlas)` 在 strict 模式（默认）下遇到以下情况直接抛，让构建期和测试挡住，而不是让某条术语在界面上悄无声息地消失：

- 认领了不存在的术语 id
- 未知的 slot
- 同一舞台内重复认领同一术语
- hotspot 缺 node
- param 非法：range 区间错（`min >= max`、`step <= 0`、默认值越界）、boolean 默认值不是布尔、enum 少于两个可选值或默认值不在其中
- `termZhFix` 与语料原译相同（是噪音，不是订正）
- `underVariant` 指向不存在或不是变体的术语

**允许**同一术语被多台认领。`Streaming text` 在文字浮现台是变体、在 Agent 界面台是部件，这不是冲突而是跨台互引，右栏显示"也出现在 X 台"并可直接跳过去。

## 路由

`#/atlas` → `#/atlas/<stageId>` → `#/atlas/<stageId>/<termId>`，术语可深链外发。`App.jsx` 对图鉴整段路由用同一个 `routeKey`，否则每点一条术语就重挂一次组件，参数微调全被重置。旧的 `#/lexicon` 仍落在图鉴上，历史链接不断。

## 右栏边界

释义、别名、媒介绑定、编辑批注、跨台互引、原始来源、网站库同域条目。

**不出包。** 导出 Design Spec、跨台拼装、组件搬运都属于拼装台，不在图鉴的职责里。图鉴只负责认识：看、调、知道叫什么、知道去哪个站找。

## 验证

- `node --test tests/stage-index.test.mjs`：13 项全过（认领真实性、错误 id 炸构建、非法挂法拦截、跨台互引、未入台守恒、初值、热区节点唯一、订正只落舞台侧、冗余订正拦截、依附变体校验、译名欠账可量化、搜索、来源反查）
- `node --test tests/*.test.mjs`：**435 项全过**。此前挂账的 6 条历史失败已在第四轮收口，见下节。
- `npx oxlint src`：退出码 0，无 error
- `npm run build`：通过
- `node scripts/verify-atlas.mjs`：57 项真实浏览器断言全过（含合成 pointer 事件驱动真实拖拽并核对判定结论），截图九张在 `docs/verification/images/atlas-*.png`

浏览器断言里有一条刻意不写死阈值：待建档条数必须等于左栏水位条算出的差额。每推进一台就改一次断言是假守卫，真正要守的是"一条都不能丢"。

## 第四轮 · 语料流水线收口与进货

图鉴的价值上限是语料，所以第四轮从"给现有条目分类"转向"把语料做厚"。做之前先收了 HANDOFF 里挂账的 6 条历史失败——往一条守卫失灵的流水线里灌新源，只会把账滚大。

**根因一：货在仓库里没上架。** 16 份原始快照共 856 条记录，但 `visual-atlas.json` 只合并了 8 个源、466 条。ant-design、mui、chakra-ui、primer、radix-ui、bootstrap、bulma、headless-ui 共 390 条采集完成后从未并入——因为 `translate-visual-atlas.mjs` 的 `SOURCE_IDS` 只列了最初 8 个源，这 8 个新源没有中文名，构建时被"缺少精确机器翻译"卡住。补齐翻译后重建：**词条 419 → 589**。

**根因二：钉死的常量过期成了噪音。** `ant-design` 在测试里写 74、快照实为 70；构建脚本把 `sourceRecordCount` 硬编码成 856；索引测试硬编码 419 条。修法不是把数字改新一遍就完事，而是**改成派生校验**：

- 构建：`sourceRecordCount` 必须等于各源自报之和，证据条数必须等于 `sourceRecordCount`——守的是守恒，不是某个具体数字。
- 索引测试：在钉死的快照数字之外，追加"索引计数必须等于产物计数"的派生断言，让"源加了但产物没重建"这类漂移无法再靠改常量糊过去。
- `ant-design` 取 70：快照自身声明 70 且实际 70 条，"计数快照合计"那条测试也只有取 70 才成立。

**根因三：语料只有组件清单，没有行为层。** 设计系统的组件表回答"界面上有哪些块"，回答不了"手指和指针在做什么"。新增两个行为层来源：

| 源 | 许可 | 条数 | 提供的词汇 |
| --- | --- | --- | --- |
| React Aria Interactions（adobe/react-spectrum） | Apache-2.0 | 37 | useDrag / useDrop / useLongPress / usePress / useMove / useFocusVisible / useDraggableCollection / FocusScope… |
| @use-gesture（pmndrs/use-gesture） | MIT | 36 | 7 个手势钩子 + 29 个配置项：threshold、axis、rubberband、filterTaps、pointer.capture、swipe.velocity… |

两者的 `useDrag` 被去重逻辑正确合并为一条、携带两份来源证据。采集器落在既有扩展点 `scripts/visual-atlas/web-collectors.mjs`，revision 取真实 commit SHA。**词条 589 → 659，interaction 轴 44 → 114。**

收货过程中三条守卫当场发挥作用，都不是我事后发现的：`use-gesture` 的条数漂移守卫报出真实条数（33→36）；译名订正守卫挡下 5 条与原译相同的冗余订正；浏览器断言"待建档条数必须等于水位差额"抓出左栏 `slice(0, 400)` 在语料涨过 400 后开始悄悄丢词。

## 已知欠账

- 台上 55 条仍挂机器译名，未入台的 497 条一条没校。全量校对仍是独立工作，`machineNameDebt()` 负责让这笔账一直可见。
- 语料存在跨来源重复未去重：`Breadcrumb` / `Breadcrumbs`、`Checkbox` / `Checkboxes`（后者是组，前者是单件，属于真差别）、两条同名的 `Number ticker`（一条 aesthetic 一条 component）。舞台侧只认领其中一条并在批注里点明，去重决策留给策展流水线。
- 九台，497 条待建档。下一批候选族：拖放（useDrop / useDraggableCollection / useDroppableCollection / 放置区）、焦点与按键（FocusScope / useFocusVisible / useKeyboard / VisuallyHidden）、空状态与反馈、卡片与表面。
- 语料仍偏组件清单：659 条里 463 条是 component 轴。行为层（interaction 轴）第四轮从 44 涨到 114，但相对真实世界的交互词汇量仍然很薄。

## 后续项目 · 拼装台（不在本设计内）

图鉴与网站库的衔接层，独立立项：

- 不用三列。正常网页比例优先，配置面板悬浮或碰边缘弹出。
- 面板内是细小 tag，点 tag 则主视觉对应部件描边高亮定位。
- 预置高级感组件库的件，自带基础 demo，不从零开始。
- 支持跨台组合、像素级微调、打包带走。
- 参考 Figma 与 [open-pencil/open-pencil](https://github.com/open-pencil/open-pencil)：文档本身是可查询、可 lint、可导出的节点树，编辑器只是它的一个客户端；配 headless CLI 与 MCP server。「点 tag 高亮部件」在那套模型里就是对节点树的一次 query。
