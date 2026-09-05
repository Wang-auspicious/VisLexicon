# VisLexicon · 数字视觉与交互全景本体图谱与专精资源地图
## The Definitive Visual & Interaction Master Taxonomy & Specialized Resource Map

**文件版本：** v1.0 · 权威基线  
**日期：** 2026-09-03  
**状态：** 体系设计完成，作为全站视元建档、舞台手写与资源策展的唯一定盘星  
**定位：** 穷尽人类已命名的数字界面视觉、排版、动效、交互与场景视元，形成“从底层物理到顶层实战”的完整坐标系，并双向绑定专门收录/生成各领域组件的全球专精站点。

---

## 0. 为什么必须建立全景本体谱系与资源地图

此前 VisLexicon 在构建词典与舞台时陷入的断层，本质在于**缺乏全局坐标系**：
1. **见木不见林**：容易陷入某一个局部例子（如仅盯着聊天输入框），而忽略了排版学中浩瀚的字形解剖、字号阶梯、艺术字材质以及文字动力学。
2. **碎片无序采集**：脱离分类学去 GitHub 盲目爬取组件库，抓回来的只是零散的控件名词，漏掉了真正的设计原语（如 Baseline Grid、Squircle、Spring Stiffness、Rubberband）。
3. **词典与资源库割裂**：用户在词典中看到一个“艺术字”或“弹簧手势”，却不知道全网哪个开源库做得最好、哪个生成器能实时调节。

本规范确立**八大一级领域（Master Domains）**，下设 **40 个二级细分群（Sub-domains）**，细化到 **500+ 个绝对视元节点**，并为每个节点建立**“视元正名 + 视觉/物理参数 + 专精网站/代码库”**的三元绑定。

---

## 1. 知识大厦总体架构地图

```
VisLexicon 视元知识大厦
├── 01. 文字与排版体系 (Typography & Kinetic Text) ───────── 视觉与信息的核心传递
├── 02. 色彩、光影与材质 (Color, Light & Surface) ───────── 视觉深度与感知物理
├── 03. 几何、轮廓与装饰 (Geometry, Contours & Motifs) ─── 形状与边缘构成语言
├── 04. 空间拓扑与布局 (Spatial Layout & Grids) ────────── 视口与信息编排骨架
├── 05. 交互控件与原语 (Controls & Component Primitives) ─ 基础交互功能构件
├── 06. 动力学与微动效 (Motion Physics & Choreography) ──── 时间与物理运动法则
├── 07. 输入模态与手势 (Modality, Gestures & Haptics) ──── 人机触点与操作感知
└── 08. 复合场景与界面范式 (Composite Scenarios & Archetypes) 完整商业与智能体实战
```

---

## 2. 八大领域详实图谱与专精资源映射

---

### 领域 01 · 文字与排版体系 (Typography & Kinetic Text)
> 文字是界面的第一介质。涵盖从微观字形解剖、排版韵律、艺术字特效到前沿文字动力学。

#### 1.1 字形解剖与微观度量 (Typeface Anatomy & Micro-Metrics)
* **纵向基准标尺**：
  - `Baseline`（基线）：所有字符坐落的无形水平线。
  - `X-Height`（x 字高）：小写字母 x 的高度，直接决定正文阅读的开阔感。
  - `Cap-Height`（大写字高）：大写正体字（如 H、T）的顶部基准线。
  - `Ascender Line`（升部线）：小写字母上升笔画（如 b、d、h）延伸到的最高线。
  - `Descender Line`（降部线）：小写字母下沉笔画（如 p、q、y）跌破基线的最低线。
* **字形笔画与腔体解剖**：
  - `Stem`（字干）：字母主要的垂直或倾斜主笔画。
  - `Bowl`（字碗）：包围椭圆封闭区域的曲状笔画（如 b, d, p 的弧形腹部）。
  - `Counter`（字谷/字圈）：字碗完全闭合或半闭合的内部负空间（如 o 内腔、e 的开口）。
  - `Serif`（衬线）：笔画起始与收尾处的装饰性细线或微投影突起。
  - `Terminal`（字尾）：没有衬线的笔画末端收笔（平头、圆头或泪滴状）。
  - `Crossbar / Cross-stroke`（横杠/交笔）：如 A、H 的横杠，t、f 穿过主干的横笔。
  - `Ligature`（连字）：两个或多个字母并合为一个字形（经典如 fi, fl, ff；现代代码字体如 =>, !=, ===）。
* **微观字距物理**：
  - `Kerning`（字偶距微调）：特定字符对之间（如 AV, To, Wa）的独立距离补偿。
  - `Tracking / Letter-spacing`（全局字距）：一整段文本中所有字母间距的等量缩放。
  - `Leading / Line-height`（行高/行距）：相邻两行文字基线之间的垂直距离。
  - `Measure`（行度/行长）：一整行正文字符的长度，黄金阅读标准为 45~75 字符（60ch）。

#### 1.2 字体谱系与分类流派 (Font Classifications & Eras)
* **遵循国际 Vox-ATypI 与现代数字字体标准**：
  - **古典衬线 (Serif)**：
    - `Humanist / Venetian`（人文主义体）：保留手写笔触与倾斜轴线（如 Centaur）。
    - `Garalde / Old Style`（旧风格体）：横竖粗细反差增大，圆角衬线（如 Garamond, Caslon）。
    - `Transitional`（过渡体）：走向几何规整与垂直轴线（如 Times New Roman, Baskerville）。
    - `Didone / Modern`（现代衬线体）：极高横竖粗细反差、发丝级水平衬线（如 Bodoni, Didot）。
    - `Slab Serif / Mechanistic`（粗衬线/埃及体）：方块状粗实厚衬线（如 Rockwell, Courier）。
  - **现代无衬线 (Sans-Serif)**：
    - `Grotesque`（早期怪异体）：19 世纪初出现，粗粝工业感（如 Franklin Gothic）。
    - `Neo-Grotesque`（新怪异体/瑞士现代主义）：中性、克制、纯粹无装饰（如 Helvetica, Arial, Inter）。
    - `Geometric`（几何无衬线）：严格源于圆形、正方形和三角形构造（如 Futura, Avant Garde）。
    - `Humanist Sans`（人文主义无衬线）：呼应书法笔势，开放式字谷，高易读性（如 Gill Sans, Frutiger）。
  - **书写、展示与专用族**：
    - `Display Typography`（大号标题展示体）：极具个性，专为 36px 以上视觉冲击设计。
    - `Monospace`（等宽字体）：每个字形占用相同字宽，程序代码与终端核心（如 JetBrains Mono, Fira Code）。
    - `Pixel / Bitmap Fonts`（像素字体）：复古 8-bit/16-bit 严格对齐网格的位图字。
    - `Blackletter / Gothic`（哥特黑体/织锦体）：12-15 世纪手抄本密集浓黑字风。
  - **中文字形谱系 (CJK Typography)**：
    - 宋体/明体（横细竖粗、带角，典雅人文）、黑体（现代数字界面通用）、楷体（书写手笔韵味）、仿宋体（公文与图纸规范标准）。

#### 1.3 字阶、层级与排版尺度 (Type Sizing, Hierarchy & Scale)
* **经典音乐与几何字阶 (Modular Scales)**：
  - `Minor Second (1.067)` / `Major Second (1.125)`：轻微级差，适合密集仪表盘。
  - `Major Third (1.250)` / `Perfect Fourth (1.333)`：经典网页比例，层次清晰平衡。
  - `Golden Ratio (1.618)`：戏剧性巨幅跨度，适合杂志风大画报与极简落地页。
* **排版层级要素 (Hierarchy Tokens)**：
  - `Display / Hero Title`：巨型冲击标题（48px~96px）。
  - `Heading 1~4`：分级正题与章节标。
  - `Subhead`：副标解释短语。
  - `Body Text`：常规正文（14px~16px，行高 1.5~1.65）。
  - `Caption / Footnote`：小字注释与附录（11px~12px）。
  - `Overline / Eyebrow`：标题上方的小型大写全角副标签，强化主题。
* **数字与符号形态 (Numeral Variants)**：
  - `Tabular Figures`（等宽数字）：数字宽度完全一致，在数据报表、价格表、计数器中防止跳动。
  - `Proportional Figures`（不等宽数字）：数字宽度自适应字形，在正文中行文流畅。
  - `Lining Numerals`（等高数字）：数字高度与大写字母平齐。
  - `Old Style / Non-lining Numerals`（下沉古体数字）：数字有升部与降部（如 3、4、5、7、9 下沉），在长文中优雅自然。
* **流体字号自适应**：
  - `Fluid Typography via clamp()`：无需写多个媒体查询断点，字号随视口在 `clamp(min, preferred, max)` 之间平滑无极缩放。
  - `Optical Sizing (opsz)`：可变字体自带的光学缩放轴，小字时自动增粗横笔加宽字谷防粘连，大字时收细笔画保留精致度。

#### 1.4 艺术字修辞与视觉材质 (Display Art Text Treatments)
* **色彩与轮廓**：
  - `Gradient Fill Text`（多色渐变填充字）：背景渐变剪裁至文字（`background-clip: text`）。
  - `Text Stroke / Outline`（空心/描边字）：只保留 `-webkit-text-stroke`，内部透明。
  - `Knockout / Reverse Text`（挖空反白字）：文字作为底图或底色的反向透明遮罩。
* **物理光影与空间幻象**：
  - `Multi-layered Drop Shadow`（多层微渐进投影）：制造文字悬浮于背景之上的三维悬空感。
  - `Long Shadow`（复古扁平长投影）：向 45 度角无限延伸的硬边阴影。
  - `Letterpress / Inset Deboss`（压凹/活版印刷字）：内阴影（`inset shadow`）制造凹陷刻痕质感。
  - `Bevel & Emboss`（浮雕与斜面倒角）：模拟金属、塑料或石质物理反光与阴暗面。
  - `Neon Glow`（多重辉光霓虹字）：多层高斯模糊不同半径的鲜艳投影叠加，模拟气体放电发光。
* **材质风味与极端表现力**：
  - `Retro Chrome / 80s Metallic`（复古镀铬金属字）：高对比折射渐变模拟镜面反射合金光泽。
  - `Liquid Mercury`（液态水银融流字）：高光折射与液态表面张力流体文字。
  - `Glitch / RGB Split`（色散故障撕裂字）：红蓝绿通道错位伪影与行扫描线撕扯。
  - `Foil Stamp`（烫金/镭射激光覆膜）：随视角光照折射彩色光谱的烫印感。
  - `Text Behind Objects`（景深层叠）：文字置于前景物体（如模特、产品、3D 物体）之后，产生前后空间穿透感。
* **可变字体动力轴 (Variable Font Axes)**：
  - 注册轴：`wght`（粗细）、`wdth`（宽度）、`slnt`（倾斜）、`ital`（斜体）、`opsz`（光学尺寸）。
  - 实验轴：`TRMN`（终端倒角）、`GRAD`（不改变度量的微膨胀渐变）、`BLOD`（融化/融滴度）。

#### 1.5 字体动力学与文字动效 (Kinetic Typography & Text Motion)
* **登场与涌现序列**：
  - `Typewriter`（经典机械打字机）：单字符推进附带跳动闪烁光标。
  - `Streaming Text Tokenizer`（AI 流式 Token 涌现）：模拟大模型思维流的成块涌出，带柔和淡入与光标跟随。
  - `Staggered Blur-in Reveal`（交错模糊聚焦浮现）：字符从 `blur(12px) translateY(8px)` 渐变为清亮静止。
  - `Text Scramble / Decrypt`（黑客乱码矩阵重构）：字符在随机符号、乱码中高频变幻，最终定格为可读文本。
  - `Masked Slide Split`（遮罩切片推入）：文字从不可见的 `overflow: hidden` 或 `clip-path` 边界外滑入视口。
  - `3D Flip In Words`（三维翻转揭示）：词组沿 X 轴翻滚俯冲入场。
* **持续动力与环境态**：
  - `Marquee / Ticker Tape`（无缝循环跑马灯）：横向无限平移，鼠标悬停时平滑阻尼减速。
  - `Shimmer / Sheen Wash`（流光扫掠）：一道斜向高光掠过文字，常用于“生成中”或“尊贵会员”标识。
  - `Wave Sine Distortion`（正弦波浪涌）：文字字符按正弦相位差上下起伏波浪跳动。
  - `Velocity Text Stretch`（滚动速度弹性拉伸）：页面滚动速度越快，文字被沿速度矢量动态拉长。
* **离场、形变与交互响应**：
  - `Text Morphing`（文字平滑形变）：两句不同文本的笔画路径或字符插值 Morph 变形。
  - `Particle Dissolve`（粒子崩解消散）：文字如细沙被风吹散瓦解为像素粒子。
  - `Magnetic Character Hover`（字符磁吸变形）：鼠标掠过时，就近的文字字符被轻微吸附倾斜排斥。

#### 1.6 专精网站、工具与开源组件库映射
| 分类 | 专门收录与制作的标杆网站 / 工具 / 开源库 | 核心价值与直达用途 |
| :--- | :--- | :--- |
| **字体鉴赏与搭配** | **Typewolf** (`typewolf.com`) | 全球公认网页排版圣经，收录最美真实网站排版案例与字体趋势 |
| **真实排版归档** | **Fonts in Use** (`fontsinuse.com`) | 索引全球图书、海报、包装、网站真实排版与用字，带字族鉴定 |
| **高品质开源字库** | **Fontshare** (`fontshare.com`) · **Google Fonts** (`fonts.google.com`) | 印度字体基金会推出的高质量免商用字库；WebFont 官方分发底座 |
| **字阶与比例计算器** | **Typescale** (`typescale.com`) · **Archetype** (`archetypeapp.com`) | 在线可视化调节 Modular Scale 调和字阶并一键导出 CSS 变量 |
| **艺术字与 CSS 特效** | **Uiverse.io** (`uiverse.io/all?category=text`) · **CodePen Text Tag** | 收集数千种社区纯 CSS/SVG 实现的霓虹、金属、故障、镂空艺术字代码 |
| **文字动效组件库** | **Magic UI** (`magicui.design/docs/components/text-reveal`) | 收录 Blur Fade, Text Reveal, Sparkles Text, Number Ticker, Word Rotate |
| **动效字形组件** | **Aceternity UI** (`aceternity.com/components`) | 提供 Typewriter Effect, Text Generate, Flip Words 等极具冲击力动画 |
| **可变字体实战实验** | **Axis-Praxis** (`axis-praxis.org`) · **v-fonts** (`v-fonts.com`) | 深度测试与调节 Variable Fonts 所有自定义轴的游乐场 |

---

### 领域 02 · 色彩、光影与材质 (Color, Light & Surface)
> 数字视觉的物理真实感与美学情绪载体。

#### 2.1 色彩科学与感知系统 (Color Science & Systems)
* **色彩空间与标准**：
  - `sRGB`：传统网页标准，色域狭窄。
  - `Display P3`：广色域标准，在苹果与现代 OLED 屏上呈现鲜艳 25% 以上的红绿极限色。
  - `OKLCH / OKLab`：现代 W3C 推荐色彩空间，**感知均匀**（相同色度与明度在任何色相下人眼感受到的亮度绝对一致，解决 HSL 蓝色暗黄色刺眼的物理缺陷）。
* **调色板构造法 (Palette Archetypes)**：
  - `Monochromatic`（单色调）：单一色相的不同明度/纯度阶梯，高级克制。
  - `Analogous`（邻近色）：色环上相邻 30~60 度的和谐过渡。
  - `Complementary`（互补色）：180 度对立高反差强调（如冷暖碰撞）。
  - `Tonal Surface Ramps`（灰阶表面阶梯）：基于背景基色的感知亮度阶梯系统（950, 900, 800... 50）。
* **无障碍与对比度标准**：
  - `WCAG 2.1 AA (4.5:1 / 3:1)`：传统对比度算法。
  - `APCA (Advanced Perceptual Contrast Algorithm)`：新一代基于人眼空间频率与字号的感知对比度算法。

#### 2.2 光影、遮蔽与三维纵深 (Light, Shadow & Elevation)
* **光源模型**：顶部直射光、45 度环境定向光、边缘高光（`Rim Light`）、局部辉光（`Glow`）。
* **投影形态学**：
  - `Ambient Occlusion (AO)`：环境光遮蔽，物体接触角落产生的深色微漫反射（紧贴缝隙）。
  - `Layered Diffuse Shadow`：多层复合阴影（结合硬轮廓接触阴影 + 极其广阔通透的远景漫反射扩散阴影，拒绝又黑又脏的原生 CSS shadow）。
  - `Color-tinted Shadow`：投影带有物体本身的低饱和主色，使阴影看起来像真实环境反光而非黑炭。
  - `Elevation Levels (Z-index + Shadow Scales)`：从 `Flat`（平坦 0dp）、`Raised`（卡片 2dp）、`Overlay`（浮层 8dp）、到 `Modal / Flyout`（顶级 24dp）。

#### 2.3 材质与表面美学范式 (Surface Materials & Styles)
* `Glassmorphism / Frosted Blur`（磨砂毛玻璃）：`backdrop-filter: blur()`, 半透明底色配 0.5px 发丝级渐变内描边。
* `Neumorphism / Soft UI`（新拟态）：凸起与凹陷双向高光+暗影，物体仿佛从背景材质中一体塑形挤压出来。
* `Claymorphism`（黏土拟态）：圆润可爱、带饱满内阴影与悬空深厚投影的 3D 橡皮泥/气球质感。
* `Neo-Brutalism`（新残酷主义）：纯饱和单色、粗粝不透明黑色实线框（2~3px）、无模糊硬边位移投影（`box-shadow: 4px 4px 0 #000`）。
* `Aurora / Gradient Mesh`（极光弥散网格渐变）：多个高饱和色块通过高斯模糊互相渗透溶化的流体背景。
* `Noise & Grain Texture`（胶片噪点与砂纸质感）：叠加 SVG 伪随机噪点层，消除数码单调感，赋予复古纸质或电影质感。

#### 2.4 专精网站、工具与开源组件库映射
| 分类 | 专门收录与制作的标杆网站 / 工具 / 开源库 | 核心价值与直达用途 |
| :--- | :--- | :--- |
| **现代色彩生成与预览** | **Realtime Colors** (`realtimecolors.com`) | 一键在完整真实网页 UI 上实时预览一整套调色板的对比与效果 |
| **OKLCH 色彩调控** | **OKLCH Color Picker** (`oklch.com`) | 最权威的感知均匀现代色盘工具，可视化色域与亮度阶梯 |
| **渐变与弥散背景生成** | **CSS Gradient** (`cssgradient.io`) · **Mesh Gradient Generator** | 生成复杂多焦点极光 Mesh 渐变与 CSS 代码 |
| **拟物拟态代码生成** | **Neumorphism.io** (`neumorphism.io`) | 专门可视化调节软阴影曲率、距离、模糊度的代码工坊 |
| **毛玻璃设计生成器** | **Glassmorphism Generator** (`hype4.academy/tools/glassmorphism-generator`) | 交互式生成磨砂玻璃反射与内边框代码 |
| **阴影精细调优** | **SmoothShadow** (`shadows.brumm.af`) | 调节多重贝塞尔曲线分布的顶级自然分层阴影生成工具 |

---

### 领域 03 · 几何、轮廓与装饰 (Geometry, Contours & Motifs)
> 决定界面是克制尖锐、柔和温润，还是先锋狂野的轮廓骨相。

#### 3.1 曲率与倒角拓扑 (Curvature & Corner Topology)
* **标准圆角与断层**：传统 CSS `border-radius` 是由直线与圆弧相切构成的，切点处曲率突变（`G1 连续`），在视觉上会呈现微弱的角点凸起感。
* **苹果平滑连续圆角 (`Squircle / G2 Superellipse`)**：曲率从直线到曲线平滑渐变连续过渡（`G2/G3 曲率连续`），彻底消除视觉硬折痕，极端优雅。
* **异构倒角语言**：
  - `Asymmetrical Radii`（非对称圆角）：如左上和右下圆角、卡片标签切角。
  - `Chamfer / Bevel Cut`（斜切折角）：45 度硬角切除，常见于机甲风、科幻 HUD、赛博游戏界面。
  - `Pill / Stadium`（胶囊跑道形）：两端半圆全封闭（`border-radius: 9999px`）。

#### 3.2 描边与边界修饰 (Strokes & Border Treatments)
* **微观发丝线**：
  - `0.5px Subpixel Hairline`：在 Retina 高分屏上使用半像素或 `scale(0.5)` 实现的极致精致微边框。
  - `Inset Gradient Stroke`：随光源角度渐变的微光内描边（常用于毛玻璃面板上沿迎光面亮、下沿背光面暗）。
* **动态与装饰边框**：
  - `Animated Laser Border`（流动激光光斑边框）：一簇高亮微光沿边界顺时针持续循环奔跑。
  - `Dashed / Dotted Custom Stroke`：定制端点形状、步长比例的虚线/点线（常用于拖放上传区、优惠券虚线打孔）。
  - `Double / Multi-Rail Border`：复古报纸或证件风格的双轨内外同心线。

#### 3.3 遮罩、路径与有机形态 (Masks, Paths & Blobs)
* **几何裁剪**：
  - `Clip-Path Polygons`：多边形硬折切片（三角折角、六边形芯片、梯形选项卡）。
  - `Wavy & Zigzag Dividers`：波浪线、锯齿状收据撕边、正弦波水平分隔带。
* **有机变形与印记**：
  - `SVG Organic Blobs`：流体水滴变形泡泡，作底层背景装饰。
  - `Stamp & Perforated Notch`：票据打孔半圆凹槽、邮票齿孔锯齿。
  - `Badge Ribbon / Corner Banner`：卡片右上角 45 度斜挂缎带徽章。

#### 3.4 专精网站、工具与开源组件库映射
| 分类 | 专门收录与制作的标杆网站 / 工具 / 开源库 | 核心价值与直达用途 |
| :--- | :--- | :--- |
| **CSS 几何裁剪工坊** | **Clippy (CSS clip-path maker)** (`bennettfeely.com/clippy`) | 可视化拖拽控制点生成多边形、星形、梯形等各种 clip-path 代码 |
| **平滑苹果连续圆角** | **Squircley** (`squircley.app`) | 生成真正 G2 曲率的 SVG 平滑超椭圆形状 |
| **有机水波形态生成器** | **Haikei** (`haikei.app`) · **Blobmaker** (`blobmaker.app`) | 生成 SVG 极简波浪、Blob 有机液态多边形与背景纹理 |
| **异形变形边框工具** | **Fancy Border Radius** (`9elements.github.io/fancy-border-radius`) | 8 个独立半径参数创造非对称流体轮廓 |
| **SVG 图形与装饰库** | **Shapes.fyi** (`shapes.fyi`) | 专门收录千百种极简几何图形、装饰符号与徽章原型 |

---

### 领域 04 · 空间拓扑与布局 (Spatial Layout & Grids)
> 组织信息密度的骨架网络与视口响应范式。

#### 4.1 网格系统与度量韵律 (Grid Systems & Rhythms)
* **间距度量单位**：
  - `4pt / 8pt Spatial Grid`：全界面的 margin, padding, gap 严格约束为 4 或 8 的倍数（4, 8, 12, 16, 24, 32, 48, 64），消除设计随意性。
* **网格拓扑模型**：
  - `12-Column Responsive Grid`：传统桌面端最强组合网格（可整除 1, 2, 3, 4, 6）。
  - `CSS Subgrid`：让深层嵌套的子组件直接对齐父级容器的网格线，彻底解决卡片标题高度不一导致按钮不对齐的历史痛点。
  - `Baseline Vertical Rhythm`：所有文本与盒模型的垂直节奏对齐底层横格线（如 8px 基线横纹），形成音乐般的节奏。

#### 4.2 经典与先锋布局范式 (Layout Archetypes)
* **容器编排模式**：
  - `Bento Grid`（便当盒网格）：受日本便当盒与苹果宣传图启发，多尺寸圆角卡片严丝合缝镶嵌在一起，层级主次分明。
  - `Masonry / Waterfall`（瀑布流）：等宽不等高卡片自适应纵向交错落位（经典 Pinterest 模式）。
  - `Split-Screen Dual Canvas`（左右双栏视口）：一半固定高冲击力巨幅视觉，另一半承载交互表单或内容浏览。
  - `Sticky Stacking Cards`（吸顶叠层卡片）：向下滚动时，卡片依次向上滚动并吸顶叠放在前一张卡片之上（产生纵深堆叠感）。
  - `Holy Grail / App Shell`（圣杯与应用外壳）：Header + 可折叠 Sidebar + 宽主视口 + 辅助 Inspector 侧板。
  - `Floating Dock`（悬浮操作坞）：独立于主页面的底部或侧边胶囊栏，随滚动吸附漂浮（macOS Dock 风格）。
  - `Infinite Spatial Canvas`（无限画布空间）：支持像 Figma / Miro 一样在无界二维空间平移、缩放与排布节点。

#### 4.3 专精网站、工具与开源组件库映射
| 分类 | 专门收录与制作的标杆网站 / 工具 / 开源库 | 核心价值与直达用途 |
| :--- | :--- | :--- |
| **便当盒布局专精索引** | **Bento Grids** (`bentogrids.com`) | 全球最大的 Bento Grid 便当盒设计案例与开源模板合集 |
| **顶级落地页布局灵感** | **Land-book** (`land-book.com`) · **Godly** (`godly.website`) | 汇集全球最先锋、最前沿排版与布局结构的实战网站精选 |
| **CSS Grid 可视化工具** | **Layoutit Grid** (`grid.layoutit.com`) | 在线画网格生成现代化 CSS Grid 布局代码 |
| **移动端/全屏流范式** | **Mobbin** (`mobbin.com`) · **Page Flows** (`pageflows.com`) | 全球最详实的真机产品全流程排版与界面布局录屏拆解 |

---

### 领域 05 · 交互控件与原语 (Controls & Component Primitives)
> 界面功能的微观积木。强调严格的语义、状态完备性与专业命名。

#### 5.1 触发与动作执行 (Action Triggers)
* **按钮变体族**：`Solid Primary`（实心主操作）、`Secondary Outlined`（次级描边）、`Ghost / Flat`（幽灵隐形按钮）、`Destructive`（危险红警操作）、`Magnetic Button`（光标吸附磁力按钮）。
* **复合触发器**：`Split Button`（左主按钮右下拉箭头菜单）、`FAB (Floating Action Button)`（右下角悬浮大圆按钮）、`Expanding Morphing Button`（点击后原位展开成表单或弹窗的变形按钮）。

#### 5.2 数据采集与状态录入 (Inputs & Data Collection)
* **单行与多行录入**：
  - `Floating Label Input`：获得焦点时光标处的提示词上浮缩小变为微型标签（Material 经典）。
  - `Expanding Textarea`：输入内容增加时高度无断层自动向下撑开。
  - `Password Strength Meter`：内嵌多段彩色能量条的密码强度监测器。
  - `OTP / Pin Code Input`：4~6 个独立小方格，支持自动粘贴分配焦点、退格回跳。
* **选项与范围控制**：
  - `Segmented Control`（分段控制器）：带滑动滑块背板的高级单选选项胶囊。
  - `Dual Thumb Range Slider`（双滑块区间选择器）：调节最高与最低价格范围。
  - `Tag Combobox / Multi-select Chips`：输入搜索带标签回车生成与删除芯片。
  - `Stepper / Number Scrubber`：数值增减器，或支持在数字上左右横向拖拽调节大小。

#### 5.3 状态指示、反馈与瞬态提醒 (Feedback & Indicators)
* **加载与进程**：
  - `Skeleton Shimmer Screen`（骨架屏流光）：模拟页面真实结构的灰度色块，表面掠过白色高光。
  - `Indeterminate Spinner`（未定量旋转齿轮）：环形断裂或平滑旋转。
  - `Segmented Progress Bar`（多段步进进度条）：类似 Instagram Stories 上方的分段倒计时。
  - `Live Status Pulse Dot`（脉冲状态呼吸点）：如绿色呼吸灯表示“在线/已连接”。
* **通知与浮标**：
  - `Toast / Snackbar`：浮现在屏幕角落或顶部中心，带倒计时进度条、可撤销动作、可滑动手势丢弃。
  - `Interactive Hovercard`：悬停于用户名或链接上时，延迟弹出带头像、简介与关注操作的浮动微型名片。
  - `Numeric Badge with Overflow`：消息小红点（如 `99+` 徽标）。

#### 5.4 浮层、模态与层叠上下文 (Overlays, Modals & Sheets)
* **模态对话与抽屉**：
  - `Modal Dialog`（模态弹窗）：带遮罩背景高斯模糊（`backdrop blur`）、自动锁定底层滚动、严格焦点循环陷阱（`Focus Trap`）。
  - `Slide Drawer / Sheet`（侧边抽屉）：从屏幕左侧或右侧全高推入。
  - `Bottom Sheet`（底部抽屉）：移动端与触屏经典，支持半屏展开、全屏拖拽吸附（Snap points）与向下轻扫关闭。
* **菜单与瞬态定位**：
  - `Command Palette (Cmd+K)`：全局快捷指令弹窗，带键盘方向键快速过滤、分组高亮与快捷键徽章。
  - `Cascading Context Menu`（右键级联上下文菜单）：支持子菜单悬停精准对角线防脱落穿透。
  - `Tooltip vs Popover`：纯提示文本信息（Tooltip）对比可承载表单、按钮与复杂 DOM 的交互浮窗（Popover）。

#### 5.5 数据组织与表格架构 (Data Presentation)
* **表格矩阵**：
  - `Static HTML Table`：纯静态排版表格。
  - `Interactive Data Grid`：支持列宽拖拽、列拖拽重排、多列排序、行内行选（Checkbox Selection）、粘性固定表头与左侧固定列。
  - `ARIA Grid Keyboard Nav`：单元格成为可聚焦节点，支持方向键在二维网格内快速移动巡航。
  - `Tree Grid / Hierarchical Table`：支持父子行级联折叠展开、异步按需加载子树。
  - `Virtualized List / Table`（虚拟滚动）：百万级海量数据只渲染当前视口几十行，极致 60fps 性能。
* **度量与概览**：
  - `Stat / KPI Tile`：巨大主数值 + 趋势升降百分比微徽标 + 内嵌微型迷你折线图（Sparkline）。
  - `Activity Heatmap`（活动热力矩阵）：如 GitHub 绿色提交方格阵列。

#### 5.6 专精网站、工具与开源组件库映射
| 分类 | 专门收录与制作的标杆网站 / 工具 / 开源库 | 核心价值与直达用途 |
| :--- | :--- | :--- |
| **全网组件命名分类圣经** | **The Component Gallery** (`component.gallery`) | 全球最完整的前端组件设计系统字典，收录所有知名系统的真实命名 |
| **现代前端原语事实标准** | **shadcn/ui** (`ui.shadcn.com`) · **Radix UI** (`radix-ui.com`) | 完全无样式、强无障碍支持、可拷贝源码的行业顶级原语标准 |
| **无障碍交互权威原语** | **React Aria** (`react-spectrum.adobe.com/react-aria`) | Adobe 出品，提供顶级键盘导航、屏幕阅读器与复杂交互基础钩子 |
| **高颜值扩展组件库** | **Origin UI** (`originui.com`) · **21st.dev** (`21st.dev`) | 专注于精美表单、输入框变体、按钮、卡片的开源 Tailwind 扩展合集 |
| **全功能企业级组件体系** | **Mantine** (`mantine.dev`) · **Ant Design** (`ant.design`) | 提供极度细分与庞大的完整表单、复杂数据表格、反馈与导航控件集 |

---

### 领域 06 · 动力学与微动效 (Motion Physics & Choreography)
> 赋予界面物理生命力。不是花哨的晃动，而是遵循物理法则的运动意图。

#### 6.1 物理动力公式与时间曲线 (Motion Physics Models)
* **缓动函数族 (Easing Curves)**：
  - `Ease-Out`（减速进场）：物体快速入场后缓缓停稳，适合大多数入场与响应用户操作。
  - `Ease-In`（加速离场）：物体从静止开始加速冲出视口，适合丢弃或关闭元素。
  - `Cubic-Bezier Parameters`：四阶贝塞尔曲线，如超调曲线（`cubic-bezier(0.34, 1.56, 0.64, 1)`）。
* **弹簧动力学 (Spring Physics)**：
  - `Stiffness`（刚度/刚性）：弹簧拉力强弱，数值越高收紧反弹越迅猛。
  - `Damping`（阻尼系数）：抵抗运动的摩擦阻力，阻尼过小会导致剧烈来回抖动，临界阻尼实现无振荡迅速停稳。
  - `Mass`（质量）：物体惯性，质量大者起步沉重迟缓，停止亦有厚重冲量。
* **速度感知动效 (Velocity Matching)**：
  - 手势拖拽松手瞬间，系统读取指针即时离开速度（`Velocity`），并以此初速度注入弹簧动画，实现完全不突兀的物理甩出与惯性滑行。

#### 6.2 微交互物理反馈 (Micro-interaction Feedbacks)
* `Hover Lift & Shadow Bloom`：鼠标悬停时卡片轻微向上位移 2~4px，底部投影同时柔和扩散变大，营造离地悬空感。
* `Button Active Depression`：点击鼠标瞬间按键轻微等比缩放（`scale: 0.96`），产生物理按键按压手感。
* `Magnetic Pull Effect`：光标靠近按钮边缘时，按钮与内部文字朝光标位置受控微量形变吸附（经典 Awwwards 动效）。
* `Ripple Effect`：点击点向外扩散并淡出的半透明水波涟漪（Material 核心）。
* `Toggle Flip & Squeeze`：开关拨动时内部圆球由于惯性发生轻微椭圆拉伸挤压（橡皮泥挤压感）。

#### 6.3 编排与空间拓扑过渡 (Choreography & Spatial Transitions)
* **多元素节奏编排**：
  - `Staggered Cascade Reveal`（交错瀑布涌现）：列表或网格中的多项子元素按恒定时间差（如 30ms）依次滑入，避免几十个元素同一时刻刷屏的杂乱感。
  - `Parent-Child Stagger Propagation`：容器打开时，子元素自动按树状深度继承交错延时展开。
* **连续空间形变 (Continuity & Morphing)**：
  - `FLIP (First, Last, Invert, Play)`：解决复杂布局变更动画的核心思想，计算元素起点与终点差异并通过 transform 反向补间。
  - `Shared Element Transition`（共享元素无缝形变）：列表中的小缩略图被点击后，原位放大无缝展开为全屏详情页的大画幅，容器连续扩张。
  - `View Transitions API`：浏览器原生支持的跨 DOM 状态或跨页面平滑快照交叉混合转场。
* **滚动联动与视差**：
  - `Scroll-Linked Scrubbing`：动效进度与页面滚动像素绝对一一绑定（不滚不走，倒滚倒放）。
  - `Multi-plane Parallax`：前景、中景、背景以不同运动速率移动，制造立体景深。

#### 6.4 专精网站、工具与开源组件库映射
| 分类 | 专门收录与制作的标杆网站 / 工具 / 开源库 | 核心价值与直达用途 |
| :--- | :--- | :--- |
| **全球动效词典与真实 App 录像** | **60fps.design** (`60fps.design`) | 收录数百种真实 iOS/Web 交互动效视频，带权威动画术语表与参数拆解 |
| **现代 React 动效事实标准** | **Framer Motion** (`motion.dev`) | 全球最成熟的弹簧物理、Layout 共享形变与手势动效库 |
| **工业级高性能 Web 动画引擎** | **GSAP (GreenSock)** (`gsap.com`) | 极端精细的时间轴编排 (Timeline)、ScrollTrigger 滚动联动驱动器 |
| **开源微交互动画库** | **Animata** (`animata.design`) · **Hover.dev** (`hover.dev`) | 专门收集纯净可复用的现代悬停、微交互、文字及按钮动效代码片段 |
| **贝塞尔曲线可视化工具** | **Cubic-bezier.com** (`cubic-bezier.com`) | 在线对比与调试贝塞尔曲线，对比不同加速度曲线时间差 |

---

### 领域 07 · 输入模态与手势 (Modality, Gestures & Haptics)
> 人体肌肉与设备表面的真实沟通契约。

#### 7.1 光标与指针交互 (Pointer & Cursor Primitives)
* **自定义光标形态**：
  - `Trailing Fluid Cursor`（平滑拖尾光标）：随鼠标平滑插值跟随的圆环光标，悬停在链接或可点击物时自动扩张吸附并转为负片反色。
  - `Pointer Capture`（指针捕获）：即使鼠标快速甩出浏览器视口或元素边界，该元素依然能牢固捕获所有 `pointermove` 与 `pointerup` 事件（保证滑块调节、拖拽拉伸不中断脱轨）。
  - `System Cursor States`：严格遵循操作语义的系统光标（`grab / grabbing`, `col-resize`, `zoom-in`, `not-allowed`）。

#### 7.2 连续触控手势与手势动力学 (Touch Gestures & Physics)
* **经典单点与复合手势**：
  - `Drag & Drop Reorder`（拖拽排序）：长按拾起卡片产生微抬投影，移位时其他卡片自动弹簧让位，松手平滑落位。
  - `Swipe to Dismiss / Action Reveal`（滑动消除/露出操作）：横向划开卡片露出底层的红底删除或标记已读按钮；划过临界阈值触发自动滑出丢弃。
  - `Pinch to Zoom & Rotate`（双指捏合缩放与旋转）：以两指中心点为缩放原点（Origin），矩阵变换平滑贴合两指移动。
  - `Long Press Charge`（长按蓄力）：持续按压期间环形进度条逐渐充满，伴随震动，满格触发高权限操作。
* **边界碰撞与阻尼**：
  - `Rubberband Effect / Overscroll Bounce`（橡皮筋越界回弹）：列表拉到尽头时，再继续拖拽会感受到非线性阻尼（越拉越重），松手后以物理弹簧弹性回弹复位。
  - `Axis Locking`（轴向锁定判定）：用户开始滑动的头 10px 内检测角度，锁定为纯横向或纯纵向，防止对角线斜向误触。

#### 7.3 无障碍键盘与触觉感知 (Accessibility & Haptics)
* **键盘导航原语**：
  - `Focus-Visible Ring`：鼠标点击时不出现突兀外框，唯有用户使用 Tab 键在键盘操作时才亮起的高对比度聚焦双层光环（`outer offset ring`）。
  - `Focus Trap / Scope`：模态弹窗开启期间，Tab 键焦点只能在弹窗内部元素间循环，绝对防止“穿透到背景不可见元素”。
  - `Roving Tabindex`：工具栏或网格内部，仅当前活动项为 `tabindex="0"`，其余为 `-1`，通过方向键移动焦点。
* **触觉震动反馈 (Haptic Patterns)**：
  - `Selection Tick`：滑块刻度对齐或滚轮滚动时极微弱轻脆的卡塔感（10ms 微震）。
  - `Success Pulse`：操作成功的两段式轻快震颤。
  - `Warning / Error Buzz`：表单报错时的三连急促重击。

#### 7.4 专精网站、工具与开源组件库映射
| 分类 | 专门收录与制作的标杆网站 / 工具 / 开源库 | 核心价值与直达用途 |
| :--- | :--- | :--- |
| **Web 通用手势动力学引擎** | **@use-gesture** (`use-gesture.pmndrs.org`) | 支持 Drag, Pinch, Wheel, Scroll, Move, Hover 全模态，带阈值与橡皮筋算法 |
| **无障碍输入与手势规范** | **React Aria Interactions** (`react-spectrum.adobe.com`) | 工业级 usePress, useMove, useLongPress, useFocusVisible 行为层基石 |
| **经典触摸手势库** | **Hammer.js** (`hammerjs.github.io`) | 传统移动手势事件解析标杆与手势事件识别算法参考 |
| **W3C 无障碍设计模式官方指南** | **WAI-ARIA Authoring Practices** (`w3.org/WAI/ARIA/apg`) | W3C 官方定义的全部界面组件键盘规范、焦点流转与屏幕阅读器契约 |

---

### 领域 08 · 复合场景与界面范式 (Composite Scenarios & Archetypes)
> 将上述微观原语拼装融合为完整商业产品与智能体体验的宏观实战。

#### 8.1 现代 SaaS 与营销落地页范式 (Marketing & Conversion Archetypes)
* `Hero Section`（首屏大画幅）：巨型 Display 标题 + 视觉锚点（3D 浮动组件/视频模拟器）+ 双 CTA 按钮 + 客户社群背书（Social Proof Avatars）。
* `Feature Comparison Matrix`（功能对比矩阵）：黏性固定顶部的版本列 + 属性支持勾选点阵 + 分组可折叠章节。
* `Interactive Pricing Calculator`（交互式定价计算器）：包含月付/年付切换开关、席位滑块调节、阶梯折扣动态计算、高亮推荐卡片。
* `Testimonial Masonry / Marquee`（证言墙）：真实推文/评论卡片组合成的自动缓速滚动跑马灯墙。

#### 8.2 现代应用与高密度工作台 (Application & Workplace Archetypes)
* `Kanban Board`（看板工作流）：多泳道（Lanes）、卡片跨列拖拽排序、快速添加输入条、列统计徽标。
* `Master-Detail Pane`（主从列表分栏）：左侧高密度会话/邮件列表（支持未读点、摘要、标签），右侧展开全屏阅读与编辑主画布。
* `Realtime Metrics Dashboard`（实时数据监控屏）：KPI 瓦片、图表网格、活动日志流（带新日志滚动推入动效）。

#### 8.3 智能体与 AI 原生界面范式 (Agentic & AI-Native UI)
> 2024-2026 浪潮中诞生的全新人机交互视元族：
* **指令与构思域 (Composer Surface)**：
  - `Composer Root`：脱离传统 input 的多层复合底座，具备自适应高度与悬浮轻阴影。
  - `Context Capacity Meter`：实时显式当前对话上下文窗口消耗比例的微型仪表胶囊。
  - `Multi-modal Attachment Pills`：内嵌文件缩略图、体积、删除叉号与上传进度的附件胶囊。
  - `Model Cascade Trigger`：可切换推理模型及思考强度（Thinking Budget）的级联选择器。
  - `Slash Command Palette`：键入 `/` 触发的指令预设弹窗。
* **思考与执行认知痕迹 (Cognition & Execution Traces)**：
  - `Thinking Disclosure`：带内部微光呼吸流光、耗时微标、可折叠伸缩的推理链条。
  - `Tool Call Waterfall`：工具调用步骤瀑布流，明确展示调用方法名、入参折叠卡、执行中脉冲圆点与毫秒耗时。
  - `Human-in-the-Loop Confirmation Barrier`：危险操作（如文件删除、代码推送）时的差异高亮确认门禁。
* **产物与渲染域 (Artifact & Output Canvas)**：
  - `Artifact Split Pane`：当模型生成代码、图表或独立文档时，右侧主舞台平滑拉出的独立交互协同画布。
  - `Code Diff Inspector`：行内与分栏代码修改红绿对比器，带一键复制与拒绝/采纳行级操作。
  - `Branch Regeneration Switcher`：多分支版本翻页器（`< 2/3 >`）与悬停操作坞（`Action Dock`）。

#### 8.4 专精网站、工具与开源组件库映射
| 分类 | 专门收录与制作的标杆网站 / 工具 / 开源库 | 核心价值与直达用途 |
| :--- | :--- | :--- |
| **现代应用实战录像与拆解** | **Page Flows** (`pageflows.com`) · **Mobbin** (`mobbin.com`) | 专门录制数百款主流 SaaS 应用的注册、支付、看板、设置等真实交互 |
| **开源 Agent UI 架构标准** | **assistant-ui** (`assistant-ui.com`) | 专门针对 AI 聊天界面与 Agent 工具调用构建的开源 React 原语库 |
| **开源 AI 交互全家桶展示** | **Vercel AI SDK Showcase** (`sdk.vercel.ai`) | 涵盖流式文本、生成式 UI、Artifacts 画布、多模态附件的官方前沿范式 |
| **现代设计编辑器架构参考** | **Open-Pencil** (`open-pencil/open-pencil`) | AI-native 开源设计编辑器，节点树驱动，支持代码导出与精确查询 |

---

## 3. 词典、活舞台与专精站点的双向联动机制

为了让这套庞大的知识大厦在 VisLexicon 中真正产生巨大的产品价值，我们设计**“词条—舞台—外站”三位一体闭环**：

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. 词典 (Lexicon & Definition)                                        │
│    · 术语标准英文、中文正名、易混淆别名纠偏 (如 Composer ≠ Input)      │
│    · 学科溯源与设计理论依据 (Vox-ATypI、WCAG、物理公式、Laws of UX)   │
└───────────────────▲────────────────────────────────▲───────────────────┘
                    │                                │
                    ▼                                ▼
┌────────────────────────────────────┐ ┌─────────────────────────────────┐
│ 2. 活舞台 (Live Playground Stage)  │ │ 3. 专精资源地图 (Ecosystem Map) │
│    · 1:1 像素级可操作真代码        │ │    · 专门研究此术语的标杆站点   │
│    · 悬停报正名，反向选中脉冲描边  │ │    · 收录此组件的高品质开源库   │
│    · 像素级滑块参数即时生效调参    │ │    · 源码直达 (GitHub / npm 包) │
│    · 满意后一键“📦 打包代码带走”  │ │    · 本地直接一键安装协议 (CLI) │
└────────────────────────────────────┘ └─────────────────────────────────┘
```

### 3.1 活舞台的四种挂载槽位 (Slot Types)
每一个视元收录后，在对应的舞台上以四种方式之一呈现：
1. `variant`（形态变体）：如文字浮现台里的“Typewriter”、“Blur-in”、“Decrypt”，切换时中间同一段文本换演法。
2. `hotspot`（部件热区）：如 Agent 界面台上的“Composer”、“Thinking Disclosure”、“Tool Waterfall”，鼠标扫过报正名，反向点选触发流光高亮。
3. `param`（物理/视觉参数）：如刚度 `stiffness`、字距 `tracking`、发丝描边宽度，调动时中间画面无级响应。
4. `curated_site`（专精收录源）：展示专门收录或生产该视元的权威工具链接，点击可在右侧抽屉或新窗口直达。

### 3.2 真正实现“微调满意后，打包带走”
用户不仅在这里学习和认识术语，还能完成创作与代码提炼：
- **微调面板**：提供 Figma / Linear 质感的高精度输入滑块（支持像素微调、贝塞尔曲线预览）。
- **一键导出代码 (Code Exporter)**：
  - 生成经过美学打磨的生产级 **Tailwind CSS + React (TSX)** 独立组件代码。
  - 导出纯净 **CSS 变量表 / Design Tokens**。
  - 附带下游 Agent Prompt 指令，供 Claude Code、Cursor、v0 等工具一键精准复现。

---

## 4. 实施落地推进路线图 (Execution Roadmap)

有了这份详实到每一个细分枝叶的元素周期表，后续开发不再盲目，严格按学科与视元批次推进：

1. **第一期（基石奠定 · 文字与排版先行）**：
   - 彻底建立 `文字解剖与度量台`（微调 baseline、x-height、kerning，直观标注笔画）。
   - 升级 `艺术字与材质工坊`（收录金属镀铬、霓虹发光、压凹活版、故障撕裂，打通 Uiverse 资源映射）。
   - 完善 `字体动力学舞台`（实现流式打字、乱码解密、文字平滑变形）。
2. **第二期（审美与实战突破 · Agent 旗舰交互台重铸）**：
   - 彻底颠覆旧版粗糙的 Agent 聊天气泡，建立涵盖 Composer、Thinking 流光、Tool Waterfall、Artifact 分栏的高级舞台。
   - 引入精致微光流边（Laser Border Glow）与悬浮 HUD，废黜刺眼的黑白蚂蚁线。
   - 接入“📦 一键导出 Tailwind/React 代码”功能。
3. **第三期（物理与交互深化 · 动效、手势与几何）**：
   - 建立 `弹簧动力学与微交互台`（可视化刚度、阻尼与质量）。
   - 建立 `触控手势与橡皮筋台`（集成 @use-gesture 与 React Aria 真实物理交互）。
   - 建立 `超椭圆与发丝轮廓台`（对比标准圆角与苹果 Squircle G2 连续）。
4. **第四期（全网词库清洗与全谱系贯通）**：
   - 将现有 1000+ 采集语料对齐到本图谱中，清除低级机翻，完成全网最全面视元建档。
