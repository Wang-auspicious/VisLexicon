# 抽取器首次真实试跑记录（3 站）

**日期：** 2026-09-02
**范围：** Tier 1（静态 CSS）+ Tier 2（浏览器探针）在真实站点上的首次执行
**浏览器通道：** OpenCLI Browser Bridge（daemon :19825 + Edge 扩展 v1.0.24）
**原始读数：** `docs/verification/mining-trial/*.json`
**规格：** `docs/superpowers/specs/2026-09-02-routed-deep-mining-and-threshold-design.md`

本文件只记录这一次试跑观测到的事实与由此做出的修改，不是设计文档。

---

## 1. 试跑对象与选择理由

| 站点 | 选它的理由 | 结果 |
|---|---|---|
| `example.com` | 最小对照组，任何误命中都无处躲 | 暴露 2 个标签逻辑缺陷 |
| `vividand.co` | Refero Styles 对同一站有公开结论，可逐项比对 | 3 项对上，2 项不一致（见第 3 节） |
| `ui.shadcn.com` | Tailwind v4 + 现代颜色语法的代表 | 暴露 3 个解析缺口 |
| `lawsofux.com` | 原计划的第三站 | **不可达**，反而暴露了最严重的一个缺陷 |

---

## 2. 试跑暴露的缺陷与处置

### 2.1 浏览器错误页被当作站点数据（最严重）

`lawsofux.com` 从本机不可达。Node 侧 fetch 失败，浏览器则显示了 Edge 的网络错误页。探针照常测量并返回了读数：

```
headingFamilies: ["Segoe UI", Arial, "Microsoft Yahei", sans-serif]
radii.measuredElements: 15
hero.backgroundColor: rgb(45, 45, 45)
```

系统据此给这个站打上了 `style.dark-canvas`。

**为什么 origin 比对救不了：** 浏览器的网络错误页保留原始 URL，`window.location.href` 仍是 `https://lawsofux.com`。

**处置：** 探针新增 `page` 事实块（`title` / `domElementCount` / `styleSheetCount` / `mainTextLength` / `canvasCount` / `contentImageCount`），由 runner 交给规格 §5.1 已有的硬否决层判断——不新造机制。同时给否决层加一条针对性规则：**渲染后一个样式表都没加载、且 DOM 元素少于 60，判定为浏览器错误页**。真实站点几乎不可能同时满足这两条。

复跑确认：`lawsofux.com` 现在直接 VETOED，不产生任何标签。

### 2.2 `style.pixel-art` 在纯文本页上误命中

原条件的第三支是「主色 ≤16 且无渐变」。`example.com` 只有 2 个颜色、0 个渐变，直接命中像素风。

极简和像素风共享「调色板小」这个特征，但**调色板规模不是像素风的证据**。已删除该分支，只保留渲染意图（`image-rendering: pixelated`）与字体选择两条。

### 2.3 采样不足被读成「不合格」

`example.com` 只采到 4 组不透明对比色对（阈值要求 10），系统判 `craft.a11y-contrast-ok` **refuted**。这是错的——"没采够样本"和"对比度不达标"是两回事。

同类问题也出现在响应式：只测了 1 档视口，却会被读成"响应式不合格"。

**处置：** 两处都改成"达不到该标签所需的样本量就整块不发布度量"，让标签落到 `undecidable`。同时新增 `maxContrastRatio`（一个样本即有意义，`style.brutalist` 用它），与通过与否分开发布。

### 2.4 条件求值必须是三值逻辑

`example.com` 明确零动效，但 `motion.*` 全部落在 `undecidable`——因为条件里有一项度量缺失就整条放弃。

`allOf` 里只要有**一项确定为假**，整条就已经确定为假，不必等缺失的度量补齐。原实现把"缺任何度量"一律当作无法判定，是逻辑错误。

**处置：** 条件求值改为 Kleene 三值（`true` / `false` / `unknown`）。`allOf` 遇 `false` 立即为假；`anyOf` 遇 `true` 立即为真；只有在没有任何一项能决定结果时才 `unknown`。改后 `example.com` 的 `motion.*` 正确落入 refuted。

### 2.5 缓动藏在自定义属性里时，"主导曲线"会输出变量名

shadcn 上抓到：

```
dominantEasing = var(--tw-ease,var(--default-transition-timing-function))
dominantEasingShare = 0.4889
```

这是 Tailwind v4 的形态：缓动写在 `transition-timing-function` 长写属性里，值是自定义属性。把变量名当成"主导曲线"会得到一个看着精确、实际无意义的数字。

**处置：** 只有能真正解析成一条曲线的值才计入。可解析比例低于 0.8 时不发布 `dominantEasing` / `dominantEasingShare`，改为记 note。

### 2.6 现代颜色语法解析不了

两个独立的缺口，都是真实抓取量出来的：

- **`oklch()`**：Tailwind v4 起默认用它输出调色板。
- **`lab()`**：Chromium 把 oklch 作者色在 computed style 里**序列化成 `lab()`**。shadcn 的 hero 背景回传的就是 `lab(2.75381 0 0)`。

不支持这两个，等于在大量现代站点上丧失全部颜色度量——首轮 shadcn 试跑里 `color parse coverage 0.52`、`no contrast sample could be parsed` 就是这么来的。

**处置：** 实现 OKLab→sRGB 与 CIE Lab（D50 白点）→sRGB 转换，含 `oklch` / `oklab` / `lab` / `lch` 四种函数式与百分号分量。分量里含 `var()` / `calc()` 的一律判不可解析，不猜。

校准值：`lab(54.29 80.8 69.89)` 与 `lch(54.29 106.84 40.85)` 均得到纯红 `[255,0,0]`；`oklch(0.628 0.2577 29.23)` 同样得到纯红。

修复前后 shadcn 的判定变化：

| | 修复前 | 修复后 |
|---|---|---|
| supported | 2 | 3（新增 `craft.a11y-contrast-ok`，25 样本 0 失败） |
| undecidable | 5 | 2 |
| 颜色解析覆盖率 | 0.52（被门拦下） | 通过 |

---

## 3. 与 Refero Styles 对同一站（Vivid+Co）的比对

Refero 的公开结论来自其 `/style/8875b14e-…` 页面。

| 项 | Refero 的说法 | 本系统实测 | 判断 |
|---|---|---|---|
| 暗底 | `theme: dark`，画布 `#101010` | `heroBackgroundLuminance 0.0052`、`coverage 1.0` → `style.dark-canvas` | **一致**。`#101010` 的相对亮度理论值 0.00518 |
| 字体 | Neue Montreal 单字族，无衬线 | `hasSerifHeading false` | **一致** |
| 圆角 | nav 5px / cards 15px / buttons 0 | 声明级零圆角占比 0，元素级 `zeroRadiusShare 0.996` | **一致且互补**：所有圆角声明都非零，但绝大多数元素本来就没有圆角。两个数都对，正说明声明级与元素级必须分开命名 |
| 主导缓动 | `cubic-bezier(0.52,0.01,0,1)`，出现 150 次 | `dominantEasing = ease`，占比 0.336，共 133 条动效声明 | **不一致** |
| 用色 | 9 个 token，含 prism 红/青/绿三个饱和色 | `chromaticColors 1` → 判为单色 | **表面不一致，实质一致** |

### 3.1 关于"主导缓动"的不一致

这不是解析错误——`ease` 确实是该站出现最多的缓动。差异来自**框架默认过渡淹没了品牌签名曲线**：站点使用的建站框架自带大量默认 `ease` 过渡，把签名曲线的占比稀释到 33.6%。

后果是系统性的：`motion.coherent` 要求"主导曲线占比 ≥55%"，在任何框架生成的站点上都可能达不到，**不是因为它们动效不连贯，而是因为分母被框架默认值污染**。

这一条**暂不改阈值**——三个样本不足以确定该怎么改。可能的方向是把框架默认值（`ease` / `ease-in-out` 等关键字）与显式作者曲线分开统计，但需要更多样本才能定。已记入待办。

### 3.2 关于"单色"的表面不一致

Refero 自己写着：prism 三色 "appears only inside the brand illustration, **not as a UI token**"。

也就是说：该站的 **UI 层确实是单色的**，彩虹色散全在品牌插画（SVG/图像）里。本系统的 CSS 颜色统计看不到插画用色，因此得出"单色"——**测量是对的，是标签名让人误解**。

**处置：** `style.monochrome` 与 `craft.color-restraint` 的中文标签改为「UI 层单色」「UI 层用色克制」，并在代码注释里写明范围。人工描述与机器测量在这里指向同一件事，只是原标签名没说清它只覆盖 CSS 可控的界面色。

---

## 4. 已知未解决项

| 项 | 状态 |
|---|---|
| 视口宽度不可控 | OpenCLI 没有 emulation 接口，只能测浏览器窗口当前宽度一档。因此 `craft.responsive-verified` 永远 undecidable。需要换 CDP `Emulation.setDeviceMetricsOverride` 或 Playwright |
| `prefers-color-scheme` 未控制 | 站点主题会跟随浏览器的深浅色偏好，`style.dark-canvas` 的读数因此依赖运行环境。必须在探针协议里固定并记录该偏好 |
| 工具类 CSS 框架的 `uniqueColors` 失真 | shadcn 测得 340 个颜色，那是 Tailwind **可用**调色板，不是站点**用了**的颜色。声明级统计在 utility CSS 上系统性高估，需由渲染层的实际用色补正 |
| 框架默认缓动稀释签名曲线 | 见 3.1，样本不足，暂不调阈值 |
| Node 侧 fetch 与浏览器的网络路径不同 | 本机存在代理配置；Tier 1 失败而 Tier 2 成功（或反之）会造成两层覆盖不一致，需在批处理里记录并对齐 |

---

## 5. 本次验证结果

- 抽取器与阈值门单元测试：**83 / 83 通过**
- 全量 `node --test demo/tests/*.test.mjs`：**421 测试，415 通过，6 失败**
- 6 条失败全部是 `HANDOFF-2026-09-02.md` 第 14 节已记录的 Visual Atlas 历史线，**本次未新增失败，也未触碰该线**
- `oxlint` 对本次新增/修改文件：0 error 0 warning
