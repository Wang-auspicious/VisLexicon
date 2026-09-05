/* ============ 词典数据（62 个可运行正式词条 × 5 轴 × 17 基因族） ============
 * 每个词条 = 一个可解引用的「词位」（lexeme）。
 * L1 本体层：五轴分类 → 基因族（fam）→ 词条；hot=编辑精选，new=本周新收录。
 */

export const AXES = [
  {
    id: 'layout', zh: '布局', en: 'LAYOUT', glyph: '◧', n: '01',
    intro: '信息在画布上的骨架。先定骨架，再谈气质。',
    fams: ['网格', '分栏', '流', '浮层'],
  },
  {
    id: 'interaction', zh: '交互', en: 'INTERACT', glyph: '✦', n: '02',
    intro: '指针与输入的微反应。高级感一半藏在这里。',
    fams: ['指针驱动', '文字动效', '操作反馈'],
  },
  {
    id: 'aesthetic', zh: '美学', en: 'AESTHETIC', glyph: '◐', n: '03',
    intro: '材质、版式与时代风格——一眼定调的那层。',
    fams: ['材质', '格线', '时代风'],
  },
  {
    id: 'motion', zh: '动效', en: 'MOTION', glyph: '➤', n: '04',
    intro: '时间维度上的技术特征。参数即性格。',
    fams: ['物理', '序列', '滚动', '状态'],
  },
  {
    id: 'component', zh: '组件', en: 'COMPONENT', glyph: '▣', n: '05',
    intro: '页面上的功能器官，每类都有成熟范式。',
    fams: ['营销区', '功能区', '反馈区'],
  },
]

export const ENTRIES = [
  /* ================= layout ================= */
  {
    id: 'bento-grid', axis: 'layout', fam: '网格', term: 'Bento Grid', zh: '便当盒网格',
    alias: ['bento', '便当格', '不对称网格', '模块拼盘'], hot: true,
    def: '不等分网格拼贴，大小模块承载不同信息密度，一眼分层。',
    params: [], code: `.bento{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:96px;gap:12px}
.t1{grid-column:span 2;grid-row:span 2}`,
    pair: ['glassmorphism', 'aurora-gradient'], contrast: ['masonry'],
    notation: 'G[grid] · cells:4 · rows:96 · gap:12 · hero:span(2,2)',
    genes: [
      { g: '底框', v: 'repeat(4,1fr) · auto-rows 96px' },
      { g: '跨格', v: 'hero 占 2×2 打破对称' },
      { g: '信息密度', v: '大块=叙事，小块=数据' },
    ],
    wild: [
      { what: 'Apple 产品页', src: 'apple.com', note: 'bento 命名的出处，跨格图+数据混排的教科书' },
      { what: 'Linear App 首页', src: 'linear.app', note: '窄格布局，卡片即功能入口' },
    ],
    anti: '每个格子都想要跨格会退化成烂漫拼贴；先把信息分级，再决定谁占大。',
    tech: 'CSS Grid + grid-auto-rows 统一行高；跨格用 span；移动端塌陷为单列。',
    used: 'SaaS 落地页 · 功能展示 · 数据仪表盘首屏。',
  },
  {
    id: 'holy-grail', axis: 'layout', fam: '网格', term: 'Holy Grail', zh: '圣杯布局',
    alias: ['圣杯', '三栏布局', 'header-footer 布局'], hot: false, isNew: true,
    def: '顶栏 + 三栏主体 + 底栏的经典骨架，中栏自适应、两侧栏定宽。',
    params: [], code: `.grail{display:grid;grid-template:
  "hd hd hd" 56px "side main aside" 1fr "ft ft ft" 48px / 220px 1fr 220px}`,
    pair: ['sidebar-shell'], contrast: ['sidebar-shell'],
    notation: 'L[grail] · rows:hd/body/ft · cols:220/1fr/220',
    genes: [
      { g: '命名网格区', v: 'grid-template-areas 三行三列' },
      { g: '中栏弹性', v: '1fr 吃掉全部剩余宽度' },
      { g: '侧栏职责', v: '导航 vs 辅助信息分工' },
    ],
    wild: [
      { what: '各类文档站 / 后台', src: '普遍', note: '内容型产品的默认骨架' },
    ],
    anti: '移动端别硬塞三栏，塌成单列 + 抽屉侧栏是标准解。',
    tech: 'grid-template-areas 命名区域最可读；body 区内部再滚动，避免整页跳。',
    used: '后台系统 · 文档站 · 邮件客户端。',
  },
  {
    id: 'masonry', axis: 'layout', fam: '网格', term: 'Masonry', zh: '瀑布流',
    alias: ['瀑布流', '砖石布局', 'pinterest 布局'], hot: false,
    def: '按列堆叠的不等高卡片流，密度高而不乱。',
    params: [], code: `.masonry{columns:4;column-gap:12px}
.item{break-inside:avoid;margin-bottom:12px}`,
    pair: ['shimmer'], contrast: ['bento-grid'],
    notation: 'L[masonry] · cols:4 · gutter:12 · flow:column',
    genes: [
      { g: '列数', v: '4（桌面）→ 2（平板）' },
      { g: '排序', v: 'DOM 顺序 vs 视觉高度一致与否' },
    ],
    wild: [
      { what: 'Pinterest / 花瓣', src: 'pinterest.com', note: '图库瀑布流的代名词' },
    ],
    anti: '对「流式阅读」的正文用瀑布流是灾难；只适合等宽不定高卡片。',
    tech: 'CSS columns 最简单，break-inside:avoid 防断卡；原生 masonry 支持仍有限。',
    used: '灵感画廊 · 图片流 · 证言墙。',
  },
  {
    id: 'split-screen', axis: 'layout', fam: '分栏', term: 'Split Screen', zh: '分屏对峙',
    alias: ['左右分栏', '对半布局', '50/50'], hot: false,
    def: '垂直分割两个等权内容区，分界线即视觉锚点。',
    params: [], code: `.split{display:grid;grid-template-columns:1fr 1px 1fr}
.split .mid{border-inline:1px solid #fff2}`,
    pair: ['editorial'], contrast: ['sidebar-shell'],
    notation: 'L[split] · ratio:50/50 · spine:1px · mode:对峙',
    genes: [
      { g: '分栏比例', v: '50/50 · 60/40 · 锈蚀分割' },
      { g: '中轴', v: '硬分线 / 渐变带 / 元素侵入' },
    ],
    wild: [
      { what: '品牌车型页“纯电 vs 燃油”', src: '车企官网', note: '二分法最强的叙事用法' },
    ],
    anti: '内容明显不等权时别硬用 50/50，次要内容会浪费半屏。',
    tech: '1fr 1px 1fr 三列最稳；中轴用 1px 背景或渐变带制造分界。',
    used: '对比型 landing · 品牌叙事 · A/B 展示。',
  },
  {
    id: 'sidebar-shell', axis: 'layout', fam: '分栏', term: 'Sidebar Shell', zh: '侧栏外壳',
    alias: ['侧边栏', '侧栏导航', 'app shell'], hot: false, isNew: true,
    def: '定宽侧栏 + 自适应主区，工具型产品的标准外壳。',
    params: [], code: `.shell{display:grid;grid-template-columns:232px 1fr}
.side{border-inline-end:1px solid var(--line)}`,
    pair: ['holy-grail'], contrast: ['split-screen'],
    notation: 'L[shell] · side:232 · main:1fr · nav:sticky',
    genes: [
      { g: '栏宽', v: '200–260px 定宽，图标态 64px' },
      { g: '层级', v: '一级导航在侧栏，二级在主区顶栏' },
      { g: '折叠', v: '可折叠为图标栏（rail）' },
    ],
    wild: [
      { what: 'Notion / Slack / Linear', src: '普遍', note: '生产力工具几乎全是这个外壳' },
    ],
    anti: '内容型站点别乱用侧栏——阅读场景要的是单一主轴。',
    tech: 'sticky 侧栏 + 独立滚动主区；折叠动画只动 width 不动内容。',
    used: 'Dashboard · 工作台 · 编辑器。',
  },
  {
    id: 'sticky-scroll', axis: 'layout', fam: '分栏', term: 'Sticky Scroll', zh: '钉住滚动',
    alias: ['吸顶', 'sticky 区域', '滚动钉住'], hot: true,
    def: '一栏内容滚动、另一栏 position:sticky 钉住，形成叙事对比。',
    params: [], code: `.wrap{display:grid;grid-template-columns:1fr 1fr;align-items:start}
.card{position:sticky;top:20vh;height:60vh}`,
    pair: ['parallax'], contrast: ['scroll-scrub'],
    notation: 'L[sticky] · pin:20vh · span:60vh · scroll:right',
    genes: [
      { g: '钉住侧', v: '图钉在视口 20vh 起' },
      { g: '切换触发器', v: '滚动到该区块即钉住' },
    ],
    wild: [
      { what: 'Apple AirPods Pro 页', src: 'apple.com', note: '文字滚动、产品图钉住，长页叙事标配' },
    ],
    anti: '两侧都长且都在动时体验混乱；钉住侧要保持视觉焦点稳定。',
    tech: 'sticky 需要父容器撑高；align-items:start 否则不生效。',
    used: '产品长页 · 功能叙事 · 数据可视化滚动。',
  },
  {
    id: 'kanban', axis: 'layout', fam: '流', term: 'Kanban', zh: '看板',
    alias: ['看板', '任务板', '拖拽列'], hot: false,
    def: '按状态分列的卡片流，配合拖拽重排。',
    params: [], code: `.kanban{display:grid;grid-auto-flow:column;gap:16px;overflow-x:auto}
.col{min-width:260px}`,
    pair: ['flip'], contrast: ['timeline'],
    notation: 'L[kanban] · cols:TODO/DOING/DONE · flow:column',
    genes: [
      { g: '列聚合', v: '按状态/优先级/负责人' },
      { g: '重排', v: '同列排序 / 跨列移动 / 溢出回弹' },
    ],
    wild: [
      { what: 'Trello / Linear / Notion', src: 'trello.com', note: '看板从物理白板到软件的移植' },
    ],
    anti: '列数超过 5 或单列过长会失去「扫一眼」的效力。',
    tech: 'auto-flow:column + min-width 保底横向滚动；拖拽库负责 FLIP 过渡。',
    used: '项目管线 · CRM 泳道 · 版本计划。',
  },
  {
    id: 'timeline', axis: 'layout', fam: '流', term: 'Timeline', zh: '时间线',
    alias: ['时间轴', '历程线'], hot: false,
    def: '沿中轴交替展开的节点叙事。',
    params: [], code: `.tl{position:relative}
.node{width:50%}.node.r{margin-left:50%}`,
    pair: ['stagger-reveal'], contrast: ['kanban'],
    notation: 'L[timeline] · axis:center · nodes:alternating',
    genes: [
      { g: '中轴', v: '实线 / 虚线 / 点线' },
      { g: '节点侧', v: '左 / 右 / 交替' },
    ],
    wild: [
      { what: 'Notion 产品迭代页', src: 'notion.so', note: '中轴双列交替的经典' },
    ],
    anti: '节点过多时响应式塌陷成左侧单列，否则移动端拥挤。',
    tech: '定位+伪元素画轴线；nth-child(odd/even) 控制左右交替。',
    used: '路线图 · 履历 · 事件叙事。',
  },
  {
    id: 'card-stack', axis: 'layout', fam: '流', term: 'Card Stack', zh: '卡片堆叠',
    alias: ['卡片叠放', 'deck', ' tinder 滑卡'], hot: false, isNew: true,
    def: '多张卡片同位叠放，顶层滑走后露出下一张。',
    params: [], code: `.stack{position:relative}
.card{position:absolute;inset:0;transform:scale(calc(1 - var(--i)*0.05))}
.top{animation:flyOut .4s ease-in both}`,
    pair: ['spring'], contrast: ['flip'],
    notation: 'L[stack] · z:desc · scale:1-.05i · top:flyOut',
    genes: [
      { g: '层阶', v: '缩放/位移递减表达深度' },
      { g: '顶层去向', v: '滑出/上抛/缩小回收' },
    ],
    wild: [
      { what: 'Tinder 滑卡', src: 'tinder.com', note: '卡片堆叠决策交互的原型' },
      { what: '各类闪卡记忆应用', src: 'anki 类', note: '一屏一判断的注意力聚焦' },
    ],
    anti: '超过 3 层的可见堆叠会显乱；底层卡保持低对比即可。',
    tech: '绝对定位 + z 递减 + transform 递减；顶层交互结束再从 DOM 挪位。',
    used: '决策流 · 闪卡 · 简历筛选。',
  },
  {
    id: 'dock', axis: 'layout', fam: '浮层', term: 'Floating Dock', zh: '悬浮坞',
    alias: ['dock', '底部导航', 'macOS dock'], hot: false,
    def: '悬浮于底边的图标坞，hover 放大。',
    params: [], code: `.dock{position:fixed;bottom:16px;border-radius:999px}
.dock i:hover{transform:scale(1.3)}`,
    pair: ['spring'], contrast: ['sidebar-shell'],
    notation: 'L[dock] · pos:bottom · radius:999 · lift:pring',
    genes: [
      { g: '缩放', v: '就近放大 / 整体放大 + 邻位外扩' },
      { g: '弹出', v: '正常 / spring 物理' },
    ],
    wild: [
      { what: 'macOS Dock', src: 'Apple 系统', note: '放大镜式 dock 的最高形态' },
      { what: 'ig 移动端底部 dock', src: 'Instagram', note: '移动端主导航的现代形态' },
    ],
    anti: '桌面端吸底会挤压内容区；适合工具型短导航而非长菜单。',
    tech: 'fixed 底部 + 圆角胶囊容器；hover 邻位用 margin 微调防溢出。',
    used: '工具 App · 短导航 · 沉浸式界面。',
  },

  /* ================= interaction ================= */
  {
    id: 'hover-tilt', axis: 'interaction', fam: '指针驱动', term: 'Hover Tilt / 3D Card', zh: '3D 倾斜卡',
    alias: ['3d 卡片', 'tilt', '鼠标倾斜', '视差卡片'], hot: true,
    def: '卡片随光标做透视倾斜，深度由 rotateX/Y 与层级投影共同塑造。',
    params: [{ k: 'max', label: '倾斜上限', min: 4, max: 20, step: 1, unit: '°', def: 12 }],
    code: `el.addEventListener('pointermove', e=>{
  const x = (e.clientX/innerWidth - .5) * MAX;
  card.style.transform =
    \`perspective(640px) rotateY(\${x}deg) rotateX(\${-y}deg)\`;
});`,
    pair: ['spotlight-card', 'spring'], contrast: ['magnetic-button'],
    notation: 'I[persp] · axis:XY · max:12° · ease:linear/ease-out',
    genes: [
      { g: '透视基线', v: 'perspective(640px) 决定纵深' },
      { g: '旋转', v: 'rotateY = fx，rotateX = -fy' },
      { g: '复位', v: '离开时回零（可 spring）' },
    ],
    wild: [
      { what: 'Stripe 部分交互卡', src: 'stripe.com', note: '3D 倾斜卡推广者之一' },
    ],
    anti: '纯装饰性倾斜要克制 max 角（≤15°）；大幅倾斜会干扰点击目标。',
    tech: 'pointermove 算相对中心偏移；perspective 在父层；几十个倾斜卡要节流。',
    used: '产品卡 · 大图卡 · 可玩 hero。',
  },
  {
    id: 'magnetic-button', axis: 'interaction', fam: '指针驱动', term: 'Magnetic Button', zh: '磁吸按钮',
    alias: ['磁力按钮', '磁性按钮', '光标吸附'], hot: true,
    def: '按钮被光标“磁化”吸引，松手后 spring 回位。',
    params: [{ k: 'strength', label: '吸附强度', min: 0.1, max: 0.8, step: 0.05, unit: '', def: 0.4 }],
    code: `const dx = e.clientX - cx;
btn.style.transform = \`translate(\${dx*strength}px, \${dy*strength}px)\`;
// 离开时用 spring 过渡回原点`,
    pair: ['spring', 'aurora-gradient'], contrast: ['hover-tilt'],
    notation: 'I[magnet] · pull:s×Δ · relax:spring · reset:0',
    genes: [
      { g: '吸附', v: '位移 = 光标偏差 × strength' },
      { g: '回位', v: 'spring（overshoot）而非 ease-out' },
    ],
    wild: [
      { what: 'Framer 部分 CTA', src: 'framer.com', note: '磁吸 CTA 的常见舞台' },
    ],
    anti: '磁吸幅度别超过按钮自身尺寸的 1/3，否则像“拽走了”。',
    tech: '基于父区中心算偏差；离开缓冲用 cubic-bezier(.3,1.18,.55,1)。',
    used: '主 CTA · 图标 · 可玩按钮。',
  },
  {
    id: 'spotlight-card', axis: 'interaction', fam: '指针驱动', term: 'Spotlight Card', zh: '光斑卡片',
    alias: ['光晕边框', '鼠标高光', 'glow border', 'radial hover'], hot: true,
    def: 'radial-gradient 跟随光标，在边框与卡面点亮一圈光晕。',
    params: [{ k: 'radius', label: '光斑半径', min: 80, max: 300, step: 10, unit: 'px', def: 160 }],
    code: `card.style.setProperty('--mx', e.offsetX + 'px');
background: radial-gradient(160px circle at var(--mx) var(--my), …);`,
    pair: ['glassmorphism'], contrast: ['hover-tilt'],
    notation: 'I[spot] · shape:radial · r:radius · anchor:pointer',
    genes: [
      { g: '光形态', v: '填充 highlight / 边框 glow' },
      { g: '跟踪', v: '鼠标坐标 → CSS 变量' },
    ],
    wild: [
      { what: '21st.dev 卡片', src: '21st.dev', note: 'glow border 的推广者' },
    ],
    anti: '光斑别做成“跟踪白点”，要扩散成环境光才高级；radius 过大会盖住内容。',
    tech: 'CSS 变量 + radial-gradient 单层；border 发光可叠加 mask 合成。',
    used: '组件卡 · 可点网格 · 定价卡。',
  },
  {
    id: 'cursor-follower', axis: 'interaction', fam: '指针驱动', term: 'Cursor Follower', zh: '光标跟随物',
    alias: ['自定义光标', 'cursor blob', '跟随圆环'], hot: false, isNew: true,
    def: '一个装饰元素以弹性延迟跟随光标，替代或增强系统指针。',
    params: [{ k: 'lag', label: '跟随延迟', min: 0.05, max: 0.4, step: 0.05, unit: '', def: 0.15 }],
    code: `let x = 0; // 每帧：x += (mouseX - x) * lag
follower.style.transform = \`translate(\${x}px, \${y}px)\`;`,
    pair: ['hover-tilt'], contrast: ['magnetic-button'],
    notation: 'I[cursor] · follow:lag·0.15 · shape:ring+dot',
    genes: [
      { g: '跟随', v: 'lerp 插值，lag 越小越跟手' },
      { g: '形态', v: '圆环 / 斑点 / 混合（hover 时放大）' },
      { g: '降级', v: '触屏设备隐藏，保留系统指针' },
    ],
    wild: [
      { what: '大量作品集网站', src: 'awwwards 生态', note: '个性站点的第一件装饰品' },
    ],
    anti: '别替换掉系统光标本身——可用性优先，跟随物只做环境层。',
    tech: 'rAF + lerp；transform 合成层；pointer:fine 媒体查询里才启用。',
    used: '作品集 · 品牌站 · 沉浸式叙事。',
  },
  {
    id: 'hover-lift', axis: 'interaction', fam: '指针驱动', term: 'Hover Lift', zh: '悬浮抬升',
    alias: ['hover 浮起', '抬升阴影', 'elevate on hover'], hot: false, isNew: true,
    def: 'hover 时卡片整体上移数像素并加深投影，模拟被拿起。',
    params: [{ k: 'lift', label: '抬升量', min: 2, max: 12, step: 1, unit: 'px', def: 4 }],
    code: `.card{transition:transform .2s, box-shadow .2s}
.card:hover{transform:translateY(-4px);
  box-shadow:0 12px 24px -8px rgb(0 0 0/.25)}`,
    pair: ['spring'], contrast: ['hover-tilt'],
    notation: 'I[lift] · y:-4 · shadow:deepen · t:200ms',
    genes: [
      { g: '位移', v: '2–6px 够用，别飘' },
      { g: '影子', v: '同步放大下移，别只动 translate' },
    ],
    wild: [
      { what: 'Material Design 卡片', src: 'm3.material.io', note: '海拔体系的官方范式' },
    ],
    anti: '整页所有卡都抬升等于没有抬升；只给可点击卡。',
    tech: '只动 transform/box-shadow 两个合成友好属性；时长 150–250ms。',
    used: '卡片列表 · 商品卡 · 入口卡。',
  },
  {
    id: 'link-underline', axis: 'interaction', fam: '指针驱动', term: 'Link Underline Draw', zh: '下划线绘制',
    alias: ['下划线动画', '划线 hover', 'underline slide'], hot: false, isNew: true,
    def: 'hover 时下划线从一侧划入（或从中间长出），退场时从另一侧划出。',
    params: [{ k: 'dur', label: '时长', min: 120, max: 600, step: 20, unit: 'ms', def: 280 }],
    code: `a{background:linear-gradient(currentColor,currentColor)
  no-repeat 100% 100%/0 1.5px;transition:.28s}
a:hover{background-size:100% 1.5px;background-position:0 100%}`,
    pair: ['editorial'], contrast: ['marquee'],
    notation: 'I[uline] · from:left · 1.5px · t:280ms',
    genes: [
      { g: '方向', v: '左入右出 / 中间长出 / 粗细变化' },
      { g: '线型', v: '1.5px 实线 / 波浪 / 手绘抖动' },
    ],
    wild: [
      { what: 'NYT / 编辑类站点导航', src: 'nytimes.com', note: 'serif 站点的标准 hover' },
    ],
    anti: '正文里长段落的链接别加动画，成本高于收益；导航短词才用。',
    tech: 'background-size 动画或 ::after scaleX；transform-origin 控制方向。',
    used: '导航 · 页脚链接 · 编辑类站点。',
  },
  {
    id: 'text-scramble', axis: 'interaction', fam: '文字动效', term: 'Text Scramble', zh: '解码文字',
    alias: ['乱码文字', '解码动画', 'hacker text', '字符翻转'], hot: false,
    def: '字符随机翻滚后逐位落定，科技感文本进场。',
    params: [{ k: 'speed', label: '翻滚间隔', min: 20, max: 120, step: 5, unit: 'ms', def: 55 }],
    code: `const CHARS = '!<>-_\\\\/[]{}—=+*^?#';
// 每帧：已落定位照抄，未落定位随机字符`,
    pair: ['terminal'], contrast: ['typewriter'],
    notation: 'I[scramble] · frame:speed · resolve:fwd · charset:ascii',
    genes: [
      { g: '解码', v: '从右/随机位置逐位落定' },
      { g: '字符集', v: 'ASCII 乱码 / 中文混排' },
    ],
    wild: [
      { what: 'Netflix 大标题动效', src: 'netflix.com', note: 'text scramble 进入大众视野' },
    ],
    anti: '连续长段解码会累；只用于标题级一两次。',
    tech: 'rAF 轮换随机字符，已揭示位冻结；避免高频重建字符串。',
    used: '科技 hero · 加载标题 · 品牌词入场。',
  },
  {
    id: 'number-ticker', axis: 'interaction', fam: '文字动效', term: 'Number Ticker', zh: '数字滚动',
    alias: ['数字翻牌', 'odometer', 'count-up'], hot: false, isNew: true,
    def: '数值变化时沿纵向滚动到新数字，仪表盘的呼吸感。',
    params: [{ k: 'dur', label: '滚动时长', min: 300, max: 2000, step: 100, unit: 'ms', def: 900 }],
    code: `<span class="col">{digits.map(d =>
  <i style={{transform:\`translateY(\${-d}em)\`}}>0123456789</i>)}
</span>`,
    pair: ['stagger-reveal'], contrast: ['text-scramble'],
    notation: 'I[ticker] · axis:y · ease:ease-out · t:900ms',
    genes: [
      { g: '轨道', v: '每位一列 0-9 纵排，位移取余' },
      { g: '进位', v: '同步滚 vs 逐位延迟（更机械感）' },
    ],
    wild: [
      { what: 'Kinfolk 订阅页 / 股票 App', src: '普遍', note: '数字变动的仪式感' },
    ],
    anti: '整页十几个 ticker 同时滚会变成老虎机；只滚关键 KPI。',
    tech: '每位一个 overflow:hidden 视窗 + translateY；用 tabular-nums 防抖动。',
    used: '仪表盘 · 统计条 · 筹款进度。',
  },
  {
    id: 'marquee', axis: 'interaction', fam: '文字动效', term: 'Marquee', zh: '无缝跑马灯',
    alias: ['跑马灯', '滚动横幅', '无限滚动条'], hot: false,
    def: '内容首尾相接的无限横滚，需 duplicate 轨道实现无缝。',
    params: [{ k: 'duration', label: '一圈时长', min: 6, max: 30, step: 1, unit: 's', def: 14 }],
    code: `.track{animation:mq 14s linear infinite}
@keyframes mq{to{transform:translateX(-50%)}}`,
    pair: ['editorial'], contrast: ['number-ticker'],
    notation: 'I[marquee] · dir:x · loop:infinite · gap:none',
    genes: [
      { g: '无缝', v: '轨道翻倍，-50% 循环' },
      { g: '暂停', v: 'hover 暂停（accessibility）' },
    ],
    wild: [
      { what: '众多 branding 页', src: '多个作品集', note: 'Logo 墙、金句墙的常客' },
    ],
    anti: '不允许 motion 的用户应看到静态；给 aria 与 reduced-motion 处理。',
    tech: '轨道复制两份 translateX(-50%)；gap 打进单元内部才无缝。',
    used: 'Logo 墙 · 金句带 · 品牌动效。',
  },
  {
    id: 'drag-reorder', axis: 'interaction', fam: '操作反馈', term: 'Drag to Reorder', zh: '拖拽重排',
    alias: ['拖拽排序', 'sortable', '抓起重排'], hot: false, isNew: true,
    def: '按住卡片拖动，其余卡片实时让位，松手落位。',
    params: [], code: `onDragMove: 被拖卡 transform 跟手;
其余卡片按插入索引做 FLIP 位移过渡`,
    pair: ['flip'], contrast: ['card-stack'],
    notation: 'I[drag] · grabbed:scale1.03 · others:flip-shift',
    genes: [
      { g: '抓起态', v: '放大 1.02–1.05 + 深影 + 微旋转' },
      { g: '让位', v: 'FLIP 位移过渡，≤180ms' },
    ],
    wild: [
      { what: 'iOS 主屏图标重排', src: 'iOS', note: '让位抖动的鼻祖' },
      { what: 'Linear / Notion 拖拽', src: 'linear.app', note: '现代 web 实现' },
    ],
    anti: '触屏上必须与滚动手势区分（长按或手柄触发）。',
    tech: 'pointer events + FLIP；拖影用 transform 而非改布局。',
    used: '看板 · 播放列表 · 表单字段排序。',
  },
  {
    id: 'scroll-reveal', axis: 'interaction', fam: '操作反馈', term: 'Scroll Triggered Reveal', zh: '滚动进场',
    alias: ['滚动显现', 'reveal on scroll', 'aos'], hot: false,
    def: '元素进入视口时才播放进场动画，配合 stagger 更有节奏。',
    params: [], code: `const io = new IntersectionObserver(es =>
  es.forEach(e => e.isIntersecting && e.target.classList.add('in')))
.div{opacity:0;translate:0 16px;transition:.6s}
.div.in{opacity:1;translate:0 0}`,
    pair: ['stagger-reveal'], contrast: ['scroll-scrub'],
    notation: 'I[reveal] · trigger:io.2 · y:16→0 · once:true',
    genes: [
      { g: '触发线', v: '视口下缘 up 10–20% 处' },
      { g: '一次 or 往复', v: 'once:true 是主流' },
    ],
    wild: [
      { what: '所有现代 landing', src: '普遍', note: '长页叙事的基本节奏器' },
    ],
    anti: '所有东西都飞入等于没有进场；一屏一两个焦点即可。',
    tech: 'IntersectionObserver 懒触发；reduced-motion 直接显示。',
    used: '长页 · 功能区 · 案例流。',
  },
  {
    id: 'image-compare', axis: 'interaction', fam: '操作反馈', term: 'Image Compare', zh: '图像对比滑块',
    alias: ['对比滑块', 'before-after slider'], hot: false, isNew: true,
    def: '拖动分割线对比前后两张图，处理类产品的天然演示。',
    params: [], code: `.cmp input{position:absolute;inset:0;opacity:0}
.after{clip-path:inset(0 0 0 var(--x))}
线 + 手柄跟随 --x`,
    pair: ['split-screen'], contrast: ['drag-reorder'],
    notation: 'I[compare] · clip:inset-x · handle:1px+grip',
    genes: [
      { g: '裁切', v: 'clip-path inset 由滑杆值驱动' },
      { g: '手柄', v: '竖线 + 圆形把手，hover 放大' },
    ],
    wild: [
      { what: '各修图 / AI 生图产品', src: '普遍', note: 'before/after 的标准交互' },
    ],
    anti: '两张图必须像素级对齐，否则对比意义崩塌。',
    tech: 'input[type=range] 透明覆盖或 pointer events 驱动 clip-path。',
    used: '修图工具 · AI 生图 · 房产翻新。',
  },

  /* ================= aesthetic ================= */
  {
    id: 'glassmorphism', axis: 'aesthetic', fam: '材质', term: 'Glassmorphism', zh: '毛玻璃拟态',
    alias: ['毛玻璃', '磨砂玻璃', 'frosted glass', 'backdrop blur'], hot: true,
    def: '半透明面板 + backdrop blur + 细描边，悬浮于彩色背景之上。',
    params: [{ k: 'blur', label: '模糊半径', min: 4, max: 28, step: 1, unit: 'px', def: 14 }],
    code: `.glass{backdrop-filter:blur(14px);
  background:rgb(255 255 255/.08);
  border:1px solid rgb(255 255 255/.14);}`,
    pair: ['aurora-gradient', 'bento-grid'], contrast: ['claymorphism'],
    notation: 'A[glass] · blur:14 · tint:255/.08 · edge:1/.14',
    genes: [
      { g: '模糊', v: 'blur(14px) 决定虚实' },
      { g: '着色', v: '低饱和白叠加' },
      { g: '描边', v: '1px 半透明白描轮廓' },
    ],
    wild: [
      { what: 'Apple 控制中心 / 通知', src: 'iOS', note: 'backdrop blur 的祖师爷' },
      { what: 'Windows Fluent 界面', src: 'Win 11', note: '亚克力材质拟态' },
    ],
    anti: '背景平淡时玻璃感消失；压不住复杂背景就加渐变叠加。',
    tech: 'backdrop-filter 有合成层开销；低端设备降级为深色半透明纯色。',
    used: '浮层 · 导航 · 顶部面板 · 卡片。',
  },
  {
    id: 'neumorphism', axis: 'aesthetic', fam: '材质', term: 'Neumorphism', zh: '新拟物',
    alias: ['软 UI', 'soft ui', '凹凸拟物'], hot: false, isNew: true,
    def: '同色背景上用双向内外阴影挤出浅浮雕，控件像从面板上长出来。',
    params: [{ k: 'soft', label: '柔和度', min: 8, max: 32, step: 2, unit: 'px', def: 16 }],
    code: `.neu{background:#e8ebf2;border-radius:16px;
  box-shadow:8px 8px 16px #c9cedb,-8px -8px 16px #ffffff}`,
    pair: ['claymorphism'], contrast: ['neo-brutalism'],
    notation: 'A[neu] · bg:same · dual:in/out · soft:16',
    genes: [
      { g: '同色底', v: '背景与控件同色是前提' },
      { g: '双向影', v: '左上白光 + 右下深影' },
      { g: '凹凸', v: 'inset 反向阴影做按压态' },
    ],
    wild: [
      { what: '2020 一批音乐/智能家居概念稿', src: 'dribbble', note: ' soft UI 的黄金期' },
    ],
    anti: '对比度天生偏弱，正文按钮别用它；装饰控件才用。',
    tech: '阴影颜色取背景色的加深/提亮版本；按压态切 inset。',
    used: '音乐播放器 · 智能家居面板 · 概念稿。',
  },
  {
    id: 'claymorphism', axis: 'aesthetic', fam: '材质', term: 'Claymorphism', zh: '黏土拟物',
    alias: ['黏土风', '软糖风', 'clay', '3d 软按钮'], hot: false,
    def: '大圆角 + 双层内阴影，捏出软陶体积感。',
    params: [{ k: 'softness', label: '柔软度', min: 6, max: 24, step: 1, unit: 'px', def: 14 }],
    code: `.clay{border-radius:28px;
  box-shadow:inset -14px -14px 24px rgb(0 0 0/.18),
             inset 14px 14px 24px rgb(255 255 255/.5);}`,
    pair: ['spring'], contrast: ['glassmorphism'],
    notation: 'A[clay] · radius:28 · inner:soft · bevel:both',
    genes: [
      { g: '圆角', v: '28px 起，同色背景融为一体' },
      { g: '内阴影', v: '双向内阴影制造受光/背光' },
    ],
    wild: [
      { what: '众多“可爱”产品', src: '多个 App', note: '软陶果冻感的组件风' },
    ],
    anti: 'clay 需要同色系浅底才成立；放白底上内阴影会显脏。',
    tech: '两方向 inset 阴影，光源方向要一致；配同色浅背景。',
    used: '游戏化 · 儿童产品 · 情感化界面。',
  },
  {
    id: 'neo-brutalism', axis: 'aesthetic', fam: '格线', term: 'Neo-Brutalism', zh: '新粗野主义',
    alias: ['新粗野', '硬阴影', '粗边框', 'neobrutal'], hot: true,
    def: '高饱和撞色 + 硬描边 + 无模糊硬阴影，反精致。',
    params: [{ k: 'offset', label: '阴影偏移', min: 3, max: 10, step: 1, unit: 'px', def: 6 }],
    code: `.brut{border:2px solid #000;
  box-shadow:6px 6px 0 #000;
  transition:transform .15s}
.brut:hover{transform:translate(-2px,-2px)}`,
    pair: ['spring'], contrast: ['glassmorphism'],
    notation: 'A[brut] · edge:2px · shadow:offset · move:(-2,-2)',
    genes: [
      { g: '描边', v: '2px 硬边 vs 细边' },
      { g: '阴影', v: '硬阴影无模糊，offset 可调' },
      { g: '按压', v: 'hover 整体位移制造“按下”' },
    ],
    wild: [
      { what: 'Gumroad 部分页面', src: 'gumroad.com', note: '用硬阴影与粗框做“个性”' },
    ],
    anti: '全站高饱和对撞易疲劳；撞色控制在 1–2 个主色。',
    tech: 'box-shadow 硬位移即可；hover 位移 = -offset 制造体积按下。',
    used: '独立开发 · 无框线工具 · 个性品牌。',
  },
  {
    id: 'minimal-flat', axis: 'aesthetic', fam: '格线', term: 'Minimal Flat', zh: '极简扁平',
    alias: ['扁平化', '极简', 'minimalism'], hot: false, isNew: true,
    def: '去装饰、靠留白与层级说话；一个强调色点睛。',
    params: [], code: `.flat{background:#fff;color:#111;
  border:1px solid #eee;border-radius:10px}
.acc{color:#0055ff}`,
    pair: ['swiss-intl'], contrast: ['neo-brutalism'],
    notation: 'A[flat] · deco:none · space:8px网 · acc:1',
    genes: [
      { g: '装饰', v: '无阴影/渐变，边框细到 1px' },
      { g: '层级', v: '字号字重 + 留白，不靠色块' },
      { g: '强调', v: '全页只有一个主强调色' },
    ],
    wild: [
      { what: 'Notion / Things', src: 'notion.so', note: '内容优先产品的共同选择' },
    ],
    anti: '极简不等于简陋——留白节奏错了比华丽风更难看。',
    tech: '8px 网格 + 两档字重（400/600）撑层级；色板 ≤ 5。',
    used: '文档 · 笔记 · 工具类产品。',
  },
  {
    id: 'swiss-intl', axis: 'aesthetic', fam: '格线', term: 'Swiss / International', zh: '瑞士国际主义',
    alias: ['瑞士风', '国际主义风格', '网格排版'], hot: false, isNew: true,
    def: '严格网格、无衬线大字、不对称排版、大面积单色块。',
    params: [], code: `.swiss{display:grid;grid-template-columns:repeat(12,1fr)}
.swiss h1{font:800 clamp(2rem,8vw,6rem)/0.95 sans-serif;
  letter-spacing:-.04em;text-transform:uppercase}`,
    pair: ['minimal-flat'], contrast: ['editorial'],
    notation: 'A[swiss] · grid:12 · type:grot · align:flush-left',
    genes: [
      { g: '网格', v: '12 列，元素严格贴格' },
      { g: '字', v: 'Grotesque 无衬线，特大号，紧字距' },
      { g: '色', v: '黑 + 白 + 一个原色（红/蓝）' },
    ],
    wild: [
      { what: '众多设计工作室官网', src: 'awwwards', note: '海报逻辑搬上网页' },
    ],
    anti: '没有真的网格系统就只是「字很大」，会立刻露馅。',
    tech: '先画网格再放内容；大标题用 clamp + 负字距。',
    used: '工作室 · 展览 · 出版物。',
  },
  {
    id: 'editorial', axis: 'aesthetic', fam: '时代风', term: 'Editorial', zh: '杂志编辑风',
    alias: ['杂志风', '编辑排版', '刊物风', 'serif 大标题'], hot: true,
    def: '衬线大标题、首字下沉、细分栏线，纸刊排版的数字转译。',
    params: [], code: `.ed h3{font-family:Georgia,serif;font-size:clamp(2rem,6vw,4rem)}
.ed p::first-letter{float:left;font-size:3.2em;line-height:.8}`,
    pair: ['marquee'], contrast: ['terminal'],
    notation: 'A[ed] · display:serif · dropcap:yes · rule:1px',
    genes: [
      { g: '字体', v: '衬线 display + 非衬线正文' },
      { g: '首字下沉', v: '::first-letter 大号' },
      { g: '栏线', v: '细分界线 / 花饰分隔' },
    ],
    wild: [
      { what: 'NYT / 各类 literary 站', src: 'nytimes.com', note: '纸刊排版的数字继承' },
    ],
    anti: '字间距/行高不精致就像“没排版的 Word”；移动端降级 font clamp。',
    tech: 'clamp() 做响应式字号；首字下沉用 float 保证中文兼容。',
    used: '杂志 · 品牌长文 · 文化类落地。',
  },
  {
    id: 'terminal', axis: 'aesthetic', fam: '时代风', term: 'Cyberpunk / Terminal', zh: '终端机能风',
    alias: ['终端风', '黑客风', 'cyberpunk', '命令行'], hot: false,
    def: '等宽字体 + 荧光绿/琥珀 + 扫描线与光标闪烁。',
    params: [], code: `.term{font-family:ui-monospace;color:#4af626}
.caret{animation:blink 1s steps(1) infinite}`,
    pair: ['text-scramble'], contrast: ['editorial'],
    notation: 'A[term] · font:mono · accent:#4af6 · caret:blink',
    genes: [
      { g: '字体', v: 'ui-monospace 保底' },
      { g: '荧光色', v: '#4af626 绿 / 琥珀' },
      { g: '扫描线', v: '低透明细横线纹理' },
    ],
    wild: [
      { what: 'tmux 主题站 / CLI 工具官网', src: '多个 dev 站', note: 'CLI 美学的 web 化' },
    ],
    anti: '终端风必须真机可用（等宽+高对比）；装饰扫描线别压可读性。',
    tech: '等宽字 + 荧光 + caret blink steps() 制造机械感。',
    used: '个人站 · dev-tool · 赛博朋克品牌。',
  },
  {
    id: 'aurora-gradient', axis: 'aesthetic', fam: '时代风', term: 'Aurora / Gradient Mesh', zh: '极光渐变',
    alias: ['极光背景', '渐变网格', 'mesh gradient', '流体渐变'], hot: true,
    def: '多个大半径模糊色斑缓慢漂移，制造流动的极光底色。',
    params: [{ k: 'hue', label: '色相偏移', min: 0, max: 300, step: 10, unit: '°', def: 0 }],
    code: `.aurora i{position:absolute;width:40vmax;aspect-ratio:1;
  filter:blur(80px);border-radius:50%;
  animation:drift 18s ease-in-out infinite alternate}`,
    pair: ['glassmorphism'], contrast: ['y2k-chrome'],
    notation: 'A[aurora] · blot:3 · blur:80 · drift:18s',
    genes: [
      { g: '色斑', v: '2–4 个大半径渐变 blob' },
      { g: '模糊', v: 'blur(80px) 磨平边界' },
      { g: '漂移', v: '18s alternate 缓慢位移' },
    ],
    wild: [
      { what: 'Vercel / Linear 背景', src: 'vercel.com', note: '低饱和极光做公司色氛围' },
    ],
    anti: '色斑过艳=廉价；统一低饱和、大模糊、超慢动。',
    tech: '绝对定位 blob + blur + 各自 keyframes；blur 是合成层开销。',
    used: '背景基调 · hero · 卡片底层。',
  },
  {
    id: 'skeuomorphism', axis: 'aesthetic', fam: '时代风', term: 'Skeuomorphism', zh: '拟物化',
    alias: ['拟物', '仿真质感', 'skeuo'], hot: false, isNew: true,
    def: '复刻真实材质光影：皮革纹理、拉丝金属、按下有物理行程的按钮。',
    params: [], code: `.knob{border-radius:50%;
  background:radial-gradient(at 30% 30%,#f8f8f8,#c9c9cf 60%,#8f8f96);
  box-shadow:0 2px 6px rgb(0 0 0/.4), inset 0 1px 1px #fff}`,
    pair: ['neumorphism'], contrast: ['minimal-flat'],
    notation: 'A[skeuo] · light:top-left · mat:metal/leather',
    genes: [
      { g: '光源', v: '统一左上高光 + 右下投影' },
      { g: '材质', v: '渐变 + 纹理贴图模拟实物' },
      { g: '隐喻', v: '控件长得像它的实体原型' },
    ],
    wild: [
      { what: 'iOS 1–6 原生界面', src: 'Apple', note: '拟物的黄金时代' },
      { what: 'GarageBand / 仿真调音台', src: 'Apple', note: '功能性拟物的活标本' },
    ],
    anti: '信息密度高的现代产品别整体拟物；单个“实体感”控件点睛即可。',
    tech: '多层 radial/linear 渐变 + 内外阴影叠加；纹理用 SVG noise 成本最低。',
    used: '音乐/创作工具 · 复古品牌 · 游戏化界面。',
  },
  {
    id: 'y2k-chrome', axis: 'aesthetic', fam: '时代风', term: 'Y2K Chrome', zh: 'Y2K 金属',
    alias: ['y2k 风', '镀铬', '千禧风', 'liquid metal'], hot: false, isNew: true,
    def: '液态金属质感 + 星形闪光 + 高饱和蓝紫粉渐变，千禧复古未来。',
    params: [], code: `.y2k{background:linear-gradient(120deg,#cdd8ff,#f3c4ff 45%,#9df1ff);
  -webkit-background-clip:text;color:transparent}
.star{clip-path:polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)}`,
    pair: ['aurora-gradient'], contrast: ['minimal-flat'],
    notation: 'A[y2k] · grad:blue-purple-pink · glyph:star/wing',
    genes: [
      { g: '金属', v: '多段渐变 clip 到文字/形体' },
      { g: '图形', v: '四角星、翅膀、气泡字' },
      { g: '色', v: '蓝紫粉高饱和 + 银白高光' },
    ],
    wild: [
      { what: 'Spotify Wrapped 2023', src: 'spotify.com', note: 'Y2K 复兴的年度级案例' },
    ],
    anti: 'Y2K 是「事件风」，整年全站用会迅速过时；活动页限定。',
    tech: 'background-clip:text 做金属字；星形用 clip-path polygon。',
    used: '活动页 · 年度总结 · 音乐潮流品牌。',
  },
  {
    id: 'pixel-retro', axis: 'aesthetic', fam: '时代风', term: 'Pixel Retro', zh: '像素复古',
    alias: ['像素风', '8bit', 'retro pixel'], hot: false, isNew: true,
    def: '整数倍放大的低分辨率像素图 + 硬边无抗锯齿 + 有限色板。',
    params: [], code: `.pix{image-rendering:pixelated;width:64px;height:64px}
.pixfont{font-family:'Press Start 2P',monospace}`,
    pair: ['terminal'], contrast: ['editorial'],
    notation: 'A[pixel] · scale:int ×4 · aa:off · palette:8',
    genes: [
      { g: '缩放', v: '整数倍放大，image-rendering:pixelated' },
      { g: '色板', v: '≤16 色，自带复古滤镜' },
      { g: '字', v: '点阵字体，字号也走整数' },
    ],
    wild: [
      { what: 'itch.io 独立游戏页', src: 'itch.io', note: '像素游戏的天然主场' },
    ],
    anti: '像素风与大段正文互斥；信息密度高的界面别用。',
    tech: 'box-shadow 画像素或 SVG shape-rendering:crispEdges；禁平滑插值。',
    used: '独立游戏 · 潮玩品牌 · 彩蛋页。',
  },

  /* ================= motion ================= */
  {
    id: 'spring', axis: 'motion', fam: '物理', term: 'Spring Physics', zh: '弹簧物理',
    alias: ['弹性动画', '回弹', 'spring easing', 'overshoot'], hot: true,
    def: '用过冲曲线模拟弹簧，元素到位时轻微越界再回弹。',
    params: [{ k: 'overshoot', label: '过冲量', min: 0, max: 40, step: 2, unit: '%', def: 18 }],
    code: `transition:transform .6s cubic-bezier(.3, 1.18, .55, 1);
/* y > 1 即过冲；framer-motion: type:'spring' */`,
    pair: ['magnetic-button', 'stagger-reveal'], contrast: ['stagger-reveal'],
    notation: 'M[spring] · k:260 · c:20 · o:overshoot:18%',
    genes: [
      { g: '刚度', v: 'stiffness 越高越快' },
      { g: '阻尼', v: 'damping 越低越弹' },
      { g: '过冲', v: 'cubic-bezier y>1' },
    ],
    wild: [
      { what: 'iOS 系统交互', src: 'iOS', note: 'spring 让界面“活”起来' },
      { what: 'Framer Motion 默认动效', src: 'motion.dev', note: 'type:"spring" 的默认选择' },
    ],
    anti: '「进入消失」类动效用 spring 反而拖沓；入场用、退场用 ease-out。',
    tech: 'CSS 用 cubic-bezier(.3,1.18,.55,1) 近似；精确物理用 framer-motion。',
    used: '弹窗 · 磁吸 · 卡片回位。',
  },
  {
    id: 'stagger-reveal', axis: 'motion', fam: '序列', term: 'Stagger Reveal', zh: '交错入场',
    alias: ['交错动画', '逐项入场', '列表 stagger', '瀑布入场'], hot: true,
    def: '列表项按固定间隔依次进场，节奏感来自 delay 阶梯。',
    params: [{ k: 'step', label: '项间隔', min: 30, max: 300, step: 10, unit: 'ms', def: 90 }],
    code: `.row{animation:rise .5s both;animation-delay:calc(var(--n) * 90ms)}
@keyframes rise{from{opacity:0;transform:translateY(12px)}}`,
    pair: ['spring', 'shimmer'], contrast: ['shimmer'],
    notation: 'M[stagger] · d:90ms · step:var(--n) · ease:rise',
    genes: [
      { g: '步长', v: '每项延迟 90ms' },
      { g: '方向', v: '上移/左滑/展开' },
    ],
    wild: [
      { what: '众多 hero 列表', src: '各 SaaS', note: '首屏元素按序浮现的常规' },
    ],
    anti: '步长 > 200ms 显拖沓；列表过长时只对首屏交错。',
    tech: 'animation-delay: calc(var(--n) * step)；CSS 变量编号。',
    used: '列表 · 网格首屏 · 功能条目。',
  },
  {
    id: 'flip', axis: 'motion', fam: '物理', term: 'FLIP', zh: 'FLIP 重排',
    alias: ['flip 动画', '位移动画', '重排过渡', 'share element'], hot: false,
    def: 'First-Last-Invert-Play：先记终点，反向位移，再过渡到零。',
    params: [], code: `const dy = first.top - last.top;
el.style.transform = \`translateY(\${dy}px)\`;
requestAnimationFrame(()=>el.style.transform = '');`,
    pair: ['kanban'], contrast: ['drag-reorder'],
    notation: 'M[flip] · F→L·invert·play · prop:transform',
    genes: [
      { g: '四步', v: 'First → Last → Invert → Play' },
      { g: '作用属性', v: 'transform 可合成' },
    ],
    wild: [
      { what: '列表重排类 UI', src: '各类 Dashboard', note: 'FLIP 是“位置变化也能动画”的底牌' },
    ],
    anti: '布局突变前后都要同步测量；动画中途再变会丢第一帧。',
    tech: 'getBoundingClientRect 取首末，反向 transform 后过渡归零。',
    used: '看板重排 · 列表增删 · 共享元素。',
  },
  {
    id: 'shimmer', axis: 'motion', fam: '状态', term: 'Shimmer / Skeleton', zh: '骨架微光',
    alias: ['骨架屏', '加载 shimmer', '占位微光', 'skeleton screen'], hot: true,
    def: '灰阶占位块上扫过一道斜向高光，暗示“加载中”。',
    params: [{ k: 'duration', label: '周期', min: 0.8, max: 3, step: 0.1, unit: 's', def: 1.6 }],
    code: `.sk{background:linear-gradient(100deg,#2222 40%,#fff3 50%,#2222 60%);
  background-size:200% 100%;animation:sh 1.6s infinite}`,
    pair: ['masonry'], contrast: ['stagger-reveal'],
    notation: 'M[shimmer] · slope:100° · t:duration · pos:scan',
    genes: [
      { g: '斜度', v: '100° 高光扫过' },
      { g: '形状', v: '占位应与真实内容同构' },
    ],
    wild: [
      { what: '各种 feed 加载', src: '多平台', note: '骨架屏替代转圈成为事实标准' },
    ],
    anti: '已加载的内容不要残留骨架位；高频闪烁要克制。',
    tech: '渐变 background-size 200% 平移；尊重 reduced-motion。',
    used: '数据加载 · feed · 列表占位。',
  },
  {
    id: 'parallax', axis: 'motion', fam: '滚动', term: 'Parallax Layers', zh: '视差层',
    alias: ['视差', '多层滚动', '景深'], hot: false,
    def: '多层背景以不同速率移动，营造景深。',
    params: [{ k: 'depth', label: '层深', min: 8, max: 60, step: 2, unit: 'px', def: 24 }],
    code: `.grid{transform:translate(calc(var(--px)*24px),calc(var(--py)*24px))}
.ring{transform:translate(calc(var(--px)*48px),calc(var(--py)*48px))}`,
    pair: ['sticky-scroll'], contrast: ['scroll-scrub'],
    notation: 'M[parallax] · layers:2 · Δ:depth · drive:pointer',
    genes: [
      { g: '层数', v: '前景/中景/背景倍率递增' },
      { g: '驱动', v: '鼠标 / 滚动' },
    ],
    wild: [
      { what: '苹果产品页视差', src: 'apple.com', note: '滚动驱动的视差景深' },
    ],
    anti: '幅度别大，移动端滚动视差会卡；优先 transform 合成层。',
    tech: 'CSS 变量 + rAF 写 transform；避免触发 layout。',
    used: '场景 hero · 数据可视化 · 叙事长页。',
  },
  {
    id: 'scroll-scrub', axis: 'motion', fam: '滚动', term: 'Scroll Scrub', zh: '滚动擦洗',
    alias: ['滚动驱动', 'scrub 动画', 'scroll-linked'], hot: true, isNew: true,
    def: '动画进度直接映射滚动位置：滚到哪播到哪，倒滚也倒放。',
    params: [], code: `const p = scrollY / (docHeight - vh);
el.style.transform = \`rotate(\${p * 360}deg)\`;
/* GSAP: scrollTrigger:{scrub:0.5} */`,
    pair: ['sticky-scroll', 'parallax'], contrast: ['scroll-reveal'],
    notation: 'M[scrub] · map:scrollY→p · apply:direct · rev:true',
    genes: [
      { g: '映射', v: '滚动区间 → 动画时间轴' },
      { g: '平滑', v: 'scrub:0.5 = 轻微追赶延迟' },
    ],
    wild: [
      { what: 'Apple 产品页参数逐条点亮', src: 'apple.com', note: 'scrub 叙事的标准样本' },
    ],
    anti: '整页都在 scrub 会晕；只在叙事段使用并给跳过手段。',
    tech: 'scroll listener + 进度归一，或 GSAP scrollTrigger/Web Animations。',
    used: '产品叙事 · 数据故事 · 年度报告。',
  },
  {
    id: 'view-transition', axis: 'motion', fam: '滚动', term: 'View Transition', zh: '视图过渡',
    alias: ['页面过渡', 'shared element transition', 'vt'], hot: false, isNew: true,
    def: '浏览器原生 API：新旧两帧快照间做过渡，共享元素丝滑换位。',
    params: [], code: `document.startViewTransition(() => updateDOM());
::view-transition-old(root){animation:fade-out .2s}
::view-transition-new(root){animation:fade-in .25s}`,
    pair: ['flip'], contrast: ['stagger-reveal'],
    notation: 'M[vt] · api:stVT · old:fade-out · new:rise-in',
    genes: [
      { g: '快照', v: '旧页截图 → 改 DOM → 新页截图' },
      { g: '共享元素', v: 'view-transition-name 配对' },
      { g: '降级', v: '不支持时直接切换，无感退化' },
    ],
    wild: [
      { what: 'Chrome 111+ 各类 MPA 过渡', src: 'developer.chrome.com', note: 'same-document/跨文档都支持' },
    ],
    anti: '过渡超 400ms 用户开始等；快门感要轻。',
    tech: 'startViewTransition 包裹 DOM 更新；配 view-transition-name。',
    used: 'SPA 换页 · 列表→详情 · 主题切换。',
  },
  {
    id: 'typewriter', axis: 'motion', fam: '状态', term: 'Typewriter', zh: '打字机',
    alias: ['打字效果', 'typing effect', '逐字'], hot: false, isNew: true,
    def: '文字逐字出现，光标闪烁，可选删除回打形成循环。',
    params: [{ k: 'cps', label: '字速', min: 4, max: 30, step: 1, unit: '字/s', def: 12 }],
    code: `const id = setInterval(() =>
  out += text[i++ % text.length], 1000 / cps);
.caret{animation:blink 1s steps(1) infinite}`,
    pair: ['text-scramble', 'terminal'], contrast: ['text-scramble'],
    notation: 'M[type] · unit:char · cps:12 · caret:blink',
    genes: [
      { g: '粒度', v: '按字符 / 按词' },
      { g: '循环', v: '单次 / 打完删除回打' },
    ],
    wild: [
      { what: '各类 AI 产品输出流', src: '普遍', note: 'LLM token 流让打字机翻红' },
    ],
    anti: '长段落打字让人等得发慌；只用于一句话级文案。',
    tech: 'setInterval/rAF 递增子串；中英混排注意宽度抖动。',
    used: 'AI 对话 · hero 副文案 · 终端模拟。',
  },
  {
    id: 'blur-in', axis: 'motion', fam: '状态', term: 'Blur In', zh: '虚化入场',
    alias: ['模糊入场', 'focus-in', 'blur fade'], hot: false, isNew: true,
    def: '从模糊+透明过渡到清晰，比纯 fade 更有对焦仪式感。',
    params: [{ k: 'blur', label: '起始模糊', min: 4, max: 24, step: 2, unit: 'px', def: 12 }],
    code: `.in{animation:blurIn .6s both}
@keyframes blurIn{from{opacity:0;filter:blur(12px)}
  to{opacity:1;filter:blur(0)}}`,
    pair: ['stagger-reveal'], contrast: ['shimmer'],
    notation: 'M[blurIn] · from:blur(12px)+o0 · t:600ms',
    genes: [
      { g: '起点', v: 'blur(8–16px) + opacity 0' },
      { g: '节奏', v: '标题慢、正文快，制造对焦层次' },
    ],
    wild: [
      { what: 'Apple 发布会大屏文案', src: 'apple.com', note: '对焦式出场的最大舞台' },
    ],
    anti: 'filter:blur 是高开销属性，列表级元素别全用。',
    tech: '只在标题级用；与 opacity 同步过渡避免闪帧。',
    used: '标题进场 · 图片加载完成态 · 幻灯切换。',
  },
  {
    id: 'slide-swap', axis: 'motion', fam: '序列', term: 'Slide Swap', zh: '滑动换位',
    alias: ['轮播', 'carousel', '走马灯切换'], hot: false, isNew: true,
    def: '内容块沿固定轴向滑入滑出完成替换，方向即语义。',
    params: [{ k: 'dur', label: '时长', min: 200, max: 800, step: 50, unit: 'ms', def: 380 }],
    code: `.out{animation:slideOut .38s both}
.in{animation:slideIn .38s both}
@keyframes slideIn{from{translate:24px 0;opacity:0}}`,
    pair: ['spring'], contrast: ['flip'],
    notation: 'M[swap] · dir:x+ · old:-24 · new:+24 · t:380ms',
    genes: [
      { g: '方向', v: '前进向左 / 返回向右（方向语义）' },
      { g: '新旧交叠', v: '同时动（连贯）vs 先出后进（利落）' },
    ],
    wild: [
      { what: 'iOS 设置二级页推入', src: 'iOS', note: '方向即导航层级的教科书' },
    ],
    anti: '别让方向与导航语义打架：前进后退必须反向。',
    tech: '入场/退场各一套 keyframes；容器 overflow:hidden 裁切。',
    used: '轮播 · 分步表单 · 深层导航。',
  },
  {
    id: 'path-morph', axis: 'motion', fam: '序列', term: 'SVG Path Morph', zh: '路径变形',
    alias: ['路径动画', 'morph svg', '形变'], hot: false, isNew: true,
    def: '两个同点数 SVG path 之间插值，图标与图形的液态变形。',
    params: [], code: `<path d="M10 80 C 40 10, 65 10, 95 80 S 150 150, 180 80">
  <animate attributeName="d" dur="1.2s" repeatCount="indefinite"
    values="…;…;…"/></path>`,
    pair: ['view-transition'], contrast: ['flip'],
    notation: 'M[morph] · api:smil/flubber · pts:match · t:1.2s',
    genes: [
      { g: '点数匹配', v: '起止路径命令结构必须一致' },
      { g: '驱动', v: 'SMIL / WAAPI / flubber 库' },
    ],
    wild: [
      { what: '汉堡菜单 ⇄ 关闭叉', src: '普遍', note: '最小也最常见的 path morph' },
    ],
    anti: '形状差异过大时中间帧会“烂掉”；用中间关键帧垫一步。',
    tech: 'SMIL animate 或 flubber 插值；图标配对汉堡⇄叉最稳。',
    used: '图标切换 · 播放/暂停 · 装饰图形。',
  },
  {
    id: 'container-transform', axis: 'motion', fam: '序列', term: 'Container Transform', zh: '容器变形',
    alias: ['容器转场', 'circle to pill', '圆变胶囊', '卡片展开', 'shared element', '共享元素转场'],
    hot: true, isNew: true,
    def: '一个容器连续变形为另一个容器，形状、尺寸、圆角与内容同时过渡，空间连续性不断。',
    params: [
      { k: 'dur', label: '时长', min: 160, max: 900, step: 20, def: 340, unit: 'ms' },
      { k: 'radius', label: '终态圆角', min: 0, max: 40, step: 1, def: 16, unit: 'px' },
      { k: 'overshoot', label: '过冲', min: 0, max: 60, step: 1, def: 18, unit: '%' },
    ],
    code: `/* from/to 用同一个元素，别用两个元素做假淡入淡出 */
.ct{transition:width .34s var(--e),height .34s var(--e),border-radius .34s var(--e)}
.ct[data-state="closed"]{width:52px;height:52px;border-radius:999px}
.ct[data-state="open"]{width:100%;height:180px;border-radius:16px}
.ct .old{transition:opacity .12s linear}          /* 先出 */
.ct .new{transition:opacity .18s linear .12s}     /* 后入 = fade-through */`,
    pair: ['spring', 'view-transition', 'card-stack'], contrast: ['flip', 'view-transition'],
    notation: 'CT[circle→card] · corner:continuous · content:fade-through · spring(0.85,22) · origin:tap-point · 340ms',
    genes: [
      { g: '形状通道', v: 'circle → pill → card → sheet（from/to 各取一值）' },
      { g: '圆角通道', v: '线性插值 / 连续曲率(超椭圆) / 先方后圆' },
      { g: '内容通道', v: 'crossfade / fade-through / reflow / clip 显露' },
      { g: '原点通道', v: '原地 / 从触点生长 / 贴边展开' },
      { g: '时间通道', v: '时长档位 × 缓动族 × 是否 stagger 子元素' },
      { g: '逆过程', v: '对称收回 / 不对称收回 / 直接消失' },
    ],
    wild: [
      { what: 'Material 3 Container Transform', src: 'm3.material.io', note: '官方正式术语，本词条严格对齐其命名' },
      { what: 'iOS App 图标 → 全屏', src: 'iOS Springboard', note: '连续曲率圆角 + 触点生长的工业级样本' },
      { what: 'Arc 浏览器新建标签', src: 'arc.net', note: '胶囊 → 卡片，内容 reflow 而非淡入' },
    ],
    anti: '两个元素做假的淡入淡出不叫容器变形——用户看得出空间断了；也别在列表里给每一项都上，会晕。',
    tech: 'FLIP 或 View Transitions API 最稳；width/height 过渡触发布局，量大时改用 scale + 反向缩放子元素补偿。',
    used: 'FAB 展开 · 列表项进详情 · 搜索条展开 · 卡片进全屏。',
  },

  /* ================= component ================= */
  {
    id: 'hero', axis: 'component', fam: '营销区', term: 'Hero', zh: '首屏主视觉',
    alias: ['首屏', 'hero 区', 'banner 区', '头图'], hot: true,
    def: '第一屏主张 + 主 CTA，3–4 层元素交错进场。',
    params: [], code: `.hero strong{font-size:clamp(2.5rem,7vw,5.5rem);letter-spacing:-.04em}
.rise{animation:rise .7s both;animation-delay:var(--d)}`,
    pair: ['stagger-reveal', 'aurora-gradient'], contrast: ['pricing-table'],
    notation: 'C[hero] · layers:3-4 · stagger · cta:primary',
    genes: [
      { g: '元素', v: 'eyebrow / 大标题 / 副文案 / CTA' },
      { g: '进场', v: '交错 rise，间隔 120ms' },
    ],
    wild: [
      { what: '所有 SaaS 首页', src: '普遍', note: 'hero 是第一屏的通用结构' },
    ],
    anti: 'hero 不是横幅，别堆多个 CTA 和贴图；一句主张一个动作。',
    tech: 'clamp() 响应式大标题；letter-spacing 收紧平台感。',
    used: '落地页 · 主页 · 产品首屏。',
  },
  {
    id: 'navbar', axis: 'component', fam: '营销区', term: 'Navbar', zh: '导航栏',
    alias: ['顶栏', '导航条', 'header'], hot: false, isNew: true,
    def: '站点级导航：logo + 链接 + 行动点，滚动时收缩或变玻璃。',
    params: [], code: `.nav{position:sticky;top:0;backdrop-filter:blur(10px)}
.nav.scrolled{background:rgb(255 255 255/.72);border-bottom:1px solid #eee}`,
    pair: ['glassmorphism'], contrast: ['dock'],
    notation: 'C[nav] · sticky · blur:10 · shrink:on-scroll',
    genes: [
      { g: '结构', v: 'logo 左 / 链接中 / CTA 右' },
      { g: '滚动态', v: '收缩高度 / 上滑隐藏下滑出现' },
    ],
    wild: [
      { what: 'Stripe / Linear 导航', src: 'stripe.com', note: '玻璃化 + mega menu 的标杆' },
    ],
    anti: '链接超过 7 个就该收进 mega menu，别横向硬塞。',
    tech: 'sticky + 滚动方向判断；玻璃态配 backdrop-filter。',
    used: '全站 · landing · 文档站。',
  },
  {
    id: 'feature-grid', axis: 'component', fam: '营销区', term: 'Feature Grid', zh: '功能网格',
    alias: ['功能卡', '三列功能', 'features'], hot: false, isNew: true,
    def: '图标 + 标题 + 两行说明的等宽网格，功能叙事的默认容器。',
    params: [], code: `.feat{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.feat i{width:36px;height:36px;border-radius:10px}`,
    pair: ['bento-grid'], contrast: ['pricing-table'],
    notation: 'C[feat] · cols:3 · cell:icon+title+2line',
    genes: [
      { g: '节奏', v: '3 列 × 2 行是甜点区' },
      { g: '图标', v: '同族图标 + 统一底色 chip' },
    ],
    wild: [
      { what: '所有 SaaS 功能区', src: '普遍', note: '最通用也最容易被做平的区块' },
    ],
    anti: '六张卡每张都长一样时，读者一张也不会读。',
    tech: '图标用 lucide 等同源库；网格移动端塌单列。',
    used: 'landing 功能区 · 产品介绍页。',
  },
  {
    id: 'pricing-table', axis: 'component', fam: '营销区', term: 'Pricing Table', zh: '定价表',
    alias: ['价格表', '套餐表', '定价卡片'], hot: false,
    def: '三档卡片并排，Popular 档用强调色与放大打破对称。',
    params: [], code: `.price.pop{transform:scale(1.06);
  border-color:var(--acc);
  background:linear-gradient(180deg,var(--acc-bg),transparent)}`,
    pair: ['spring'], contrast: ['hero'],
    notation: 'C[pricing] · tiers:3 · pop:scale1.06 · cta:primary',
    genes: [
      { g: '档位', v: '3 档，中间为 Popular' },
      { g: '强调', v: 'scale 放大 + accent 描边' },
    ],
    wild: [
      { what: 'Stripe / Linear 定价页', src: 'stripe.com', note: '三档结构的稳定成熟范式' },
    ],
    anti: 'Popular 用“红”“荐”标签过度抢戏会廉价；温和放大+描边即可。',
    tech: '默认档 scale(1)；Popular 档用边框色与渐变垫高。',
    used: '定价页 · 套餐页 · 会员体系。',
  },
  {
    id: 'testimonial', axis: 'component', fam: '营销区', term: 'Testimonial', zh: '用户证言',
    alias: ['证言卡片', '用户评价', '口碑墙'], hot: false,
    def: '引言 + 头像署名，双列交错制造节奏。',
    params: [], code: `.testi{columns:2;column-gap:16px}
.q{break-inside:avoid;margin-bottom:16px}`,
    pair: ['shimmer'], contrast: ['pricing-table'],
    notation: 'C[testi] · cols:2 · attr:avatar · sync:rhythm',
    genes: [
      { g: '列排布', v: '双列/交错 masonry' },
      { g: '署名', v: '头像 + 人名 + 头衔' },
    ],
    wild: [
      { what: '各类落地页', src: '普遍', note: '社会证明的标准结构' },
    ],
    anti: '证言必须是真话；随机头像库一眼假。',
    tech: 'CSS columns 交错；证言与产品截图共处省空间。',
    used: '落地页 · 好评墙 · 案例区。',
  },
  {
    id: 'cta-banner', axis: 'component', fam: '营销区', term: 'CTA Banner', zh: '行动号召横幅',
    alias: ['cta 区', '结尾横幅', '转化块'], hot: false, isNew: true,
    def: '页尾前的最后一块高对比横幅：一句主张 + 一个按钮。',
    params: [], code: `.cta{background:var(--ink);color:#fff;
  border-radius:20px;padding:48px;text-align:center}
.cta .btn{background:#fff;color:var(--ink)}`,
    pair: ['hero'], contrast: ['footer'],
    notation: 'C[cta] · bg:ink-inverse · line:1 · btn:1',
    genes: [
      { g: '反色', v: '全页最深/最艳的色块' },
      { g: '文案', v: '一句主张 + 一个动作，无第二选择' },
    ],
    wild: [
      { what: '几乎所有 SaaS 页尾', src: '普遍', note: '转化收口的标准件' },
    ],
    anti: '别在这里塞次级链接或社交图标，那是 footer 的事。',
    tech: '大圆角容器 + 反色；按钮对比度过 WCAG AA。',
    used: 'landing 收尾 · 定价页底 · 文档转化位。',
  },
  {
    id: 'form', axis: 'component', fam: '功能区', term: 'Form Field', zh: '表单输入',
    alias: ['输入框', '表单', '文本框'], hot: false,
    def: 'focus 时描边变亮 + 外圈光晕，标签上浮。',
    params: [], code: `.field input:focus{outline:none;border-color:var(--acc);
  box-shadow:0 0 0 4px color-mix(in srgb,var(--acc) 22%,transparent)}`,
    pair: ['glassmorphism'], contrast: ['toast'],
    notation: 'C[form] · focus:accent+glow · label:float',
    genes: [
      { g: 'focus 态', v: '描边变亮 + 外圈光晕' },
      { g: '标签', v: 'placeholder 上浮/常驻 label' },
    ],
    wild: [
      { what: '各类表单页', src: '普遍', note: 'focus 视觉反馈的通用标准' },
    ],
    anti: '光晕半径别过大，focus 视觉要显眼且不闪烁。',
    tech: 'focus 用 box-shadow 外圈 + color-mix 做同系光晕。',
    used: '注册 · 登录 · 设置。',
  },
  {
    id: 'modal', axis: 'component', fam: '功能区', term: 'Modal', zh: '模态对话框',
    alias: ['弹窗', '对话框', 'dialog'], hot: false, isNew: true,
    def: '遮罩之上居中浮层，入场 scale+fade，焦点被圈住。',
    params: [], code: `.veil{background:rgb(0 0 0/.5);backdrop-filter:blur(2px)}
.modal{animation:pop .3s cubic-bezier(.3,1.3,.5,1) both}
@keyframes pop{from{scale:.92;opacity:0}}`,
    pair: ['spring', 'glassmorphism'], contrast: ['toast'],
    notation: 'C[modal] · veil:blur2 · enter:pop.3s · esc:close',
    genes: [
      { g: '遮罩', v: '半透明黑 + 轻模糊' },
      { g: '入场', v: 'scale .92→1 + spring' },
      { g: '约束', v: 'Esc / 点遮罩关闭，焦点圈定' },
    ],
    wild: [
      { what: 'Radix / shadcn Dialog', src: 'ui.shadcn.com', note: '可访问性事实标准' },
    ],
    anti: '别用 modal 呈现长内容；嵌套 modal 是设计失败。',
    tech: '原生 <dialog> 或 Radix；focus trap + 滚动锁定。',
    used: '确认操作 · 设置面板 · 快捷创建。',
  },
  {
    id: 'toast', axis: 'component', fam: '反馈区', term: 'Toast / Notification', zh: '吐司通知',
    alias: ['toast', '通知条', '消息提醒', 'snackbar'], hot: false,
    def: '角落堆叠滑入，自动消退，状态色区分语义。',
    params: [], code: `.toast{animation:slideIn .35s cubic-bezier(.3,1.2,.55,1) both}
.toast i{width:8px;border-radius:99px;background:var(--ok)}`,
    pair: ['spring'], contrast: ['modal'],
    notation: 'C[toast] · pos:top-right · slide:spring · auto:dismiss',
    genes: [
      { g: '位置', v: 'top-right 堆叠' },
      { g: '状态色', v: 'ok/warn/info 三态' },
    ],
    wild: [
      { what: 'Sonner（shadcn 生态）', src: 'sonner.emilkowal.ski', note: 'web toast 的当代默认' },
    ],
    anti: 'toast 过多=提醒轰炸；破坏性操作要配可撤销而非自动消退。',
    tech: '栈式堆叠 + 滑入 spring + 定时退场；区分必要/可选通知。',
    used: '操作反馈 · 系统消息 · 错误提示。',
  },
  {
    id: 'chart-card', axis: 'component', fam: '反馈区', term: 'Chart Card', zh: '图表卡',
    alias: ['图表', '统计卡', 'kpi card'], hot: false, isNew: true,
    def: '指标数字 + 趋势图 + 同比标记的仪表盘原子。',
    params: [], code: `.kpi strong{font-size:28px;font-variant-numeric:tabular-nums}
.up{color:#16a34a}svg path{fill:none;stroke:var(--acc)}`,
    pair: ['number-ticker'], contrast: ['feature-grid'],
    notation: 'C[chart] · num:tabular · trend:spark · delta:±%',
    genes: [
      { g: '数字', v: 'tabular-nums 防抖动' },
      { g: '趋势', v: 'sparkline 30d，涨绿跌红' },
      { g: '增量', v: '±x.x% 徽标，色随涨跌' },
    ],
    wild: [
      { what: 'Vercel / Stripe Dashboard', src: 'vercel.com', note: '克制的仪表盘配色范本' },
    ],
    anti: '一屏超过 6 张卡时，重点 KPI 必须在尺寸或位置上突出。',
    tech: 'sparkline 用 SVG polyline；数字滚动配 number-ticker。',
    used: '仪表盘 · 报表 · 监控。',
  },
  {
    id: 'faq', axis: 'component', fam: '反馈区', term: 'FAQ Accordion', zh: '折叠问答',
    alias: ['手风琴', 'accordion', '常见问题'], hot: false, isNew: true,
    def: '问题行 + 展开区，grid-rows 0fr→1fr 实现高度自然过渡。',
    params: [], code: `.faq div{display:grid;grid-template-rows:0fr;transition:.3s}
.faq.open div{grid-template-rows:1fr}
div>p{overflow:hidden}`,
    pair: ['spring'], contrast: ['timeline'],
    notation: 'C[faq] · open:0fr→1fr · chevron:rotate',
    genes: [
      { g: '展开', v: 'grid-rows 0fr→1fr 纯 CSS 高度动画' },
      { g: '指示', v: 'chevron 旋转 / 加减号切换' },
    ],
    wild: [
      { what: 'Stripe / Vercel FAQ', src: 'stripe.com', note: '单列窄容器是主流' },
    ],
    anti: '默认全部展开等于放弃该组件；也别超过 8 条，多的进文档。',
    tech: 'grid-template-rows 过渡免 JS 量高度；键盘可达性用原生 details 也可。',
    used: '定价页 · 帮助中心 · 产品页尾。',
  },
  {
    id: 'footer', axis: 'component', fam: '反馈区', term: 'Footer', zh: '页脚',
    alias: ['页尾', '网站底部', 'footer 栏'], hot: false, isNew: true,
    def: '多列链接 + 版权行 + 状态指示，站点收尾与 SEO 承重墙。',
    params: [], code: `.ft{display:grid;grid-template-columns:2fr repeat(4,1fr);gap:32px}
.ft small{color:#888}`,
    pair: ['navbar'], contrast: ['cta-banner'],
    notation: 'C[footer] · cols:brand+4 · legal:bottom-bar',
    genes: [
      { g: '结构', v: '品牌列 + 3–4 组链接列 + 法务行' },
      { g: '信号', v: '状态页链接 / 语言切换 / 社交' },
    ],
    wild: [
      { what: 'Apple / Vercel 页脚', src: 'apple.com', note: '信息架构最完整的页脚样本' },
    ],
    anti: '页脚不是垃圾场；塞 100 个 SEO 链接不如不放。',
    tech: 'grid 多列；移动端塌手风琴或简化为两列。',
    used: '全站 · landing · 文档。',
  },
  {
    id: 'onboarding', axis: 'component', fam: '反馈区', term: 'Onboarding Steps', zh: '引导步骤',
    alias: ['新手引导', 'stepper', '分步引导'], hot: false, isNew: true,
    def: '分步引导条 + 当前步高亮，完成态打勾推进。',
    params: [], code: `.step.done .dot{background:var(--ok)}
.step.on .dot{outline:2px solid var(--acc);outline-offset:3px}`,
    pair: ['slide-swap'], contrast: ['form'],
    notation: 'C[onb] · steps:3 · state:done/on/todo',
    genes: [
      { g: '步进器', v: '圆点/数字 + 连接线' },
      { g: '状态', v: 'done 打勾 / on 高亮 / todo 灰' },
    ],
    wild: [
      { what: '各家 SaaS 首次进入清单', src: '普遍', note: '激活率的第一杠杆' },
    ],
    anti: '超过 4 步的引导完成率断崖；合并或后置。',
    tech: '状态机驱动；连接线用伪元素按进度填充。',
    used: '注册后 · 首次配置 · 空状态。',
  },

  /* ================= 知识点 · 库与工具（图鉴扩展层，不算五轴） ================= */
  {
    id: 'gsap', axis: 'toolkit', fam: '库', term: 'GSAP', zh: 'GSAP 动画引擎',
    alias: ['gsap', 'greensock', 'tweenmax 继任', '时间线动画'], hot: true, isNew: true,
    def: 'JavaScript 动画引擎：时间线编排、跨浏览器一致性、3.13 起全部插件免费商用。',
    params: [], code: `gsap.timeline({ defaults: { ease: 'power3.out' } })
  .from('.hero', { y: 24, opacity: 0, stagger: 0.08 })
  .to('.card', { rotate: 6, yoyo: true, repeat: 1 });`,
    pair: ['spring', 'stagger-reveal'], contrast: ['motion-lib'],
    notation: 'T[gsap] · tl:seq · ease:power3 · stagger:0.08',
    genes: [
      { g: '时间线', v: 'timeline 串联/嵌套/定位标签' },
      { g: '插件族', v: 'ScrollTrigger / Flip / ScrambleText / MorphSVG' },
      { g: '许可', v: '3.13 起全插件免费（Webflow 收购后）' },
    ],
    wild: [
      { what: 'Awwwards 获奖站重度用户', src: 'awwwards', note: '叙事长页的事实标准引擎' },
      { what: '官方 Eases 文档内嵌可视化', src: 'gsap.com/docs/v3/Eases', note: '词条页内嵌交互工具的范本' },
    ],
    anti: '简单 UI 微交互别上 GSAP——CSS transition 更省；它强在编排与滚动联动。',
    tech: 'rAF 驱动，可控可暂停可倒放；ScrollTrigger 是滚动叙事的核心插件。',
    used: '叙事长页 · 创意站 · 数据故事。',
  },
  {
    id: 'motion-lib', axis: 'toolkit', fam: '库', term: 'Motion', zh: 'Motion（原 Framer Motion）',
    alias: ['framer motion', 'motion one', 'motion.dev', 'spring 库'], hot: false, isNew: true,
    def: 'React 生态动效库：声明式 spring 物理、手势、布局动画与 exit 编排。',
    params: [], code: `<motion.button
  whileHover={{ scale: 1.04 }}
  transition={{ type: 'spring', stiffness: 320, damping: 24 }}
/>`,
    pair: ['spring', 'magnetic-button'], contrast: ['gsap'],
    notation: 'T[motion] · type:spring · k:320 · c:24 · whileHover',
    genes: [
      { g: '声明式', v: '组件属性即动画，随状态重渲' },
      { g: 'spring 物理', v: 'stiffness/damping 而非时长' },
      { g: '布局动画', v: 'layout prop 自动 FLIP' },
    ],
    wild: [
      { what: 'shadcn 生态组件默认搭配', src: '21st.dev', note: 'React 组件动效的第一选择' },
      { what: '官方 docs 概念树', src: 'motion.dev/docs', note: '概念即导航的 docs 范式' },
    ],
    anti: '非 React 项目用 Motion One / 原生 WAAPI；巨型时间线编排 GSAP 更顺手。',
    tech: '布局动画内置 FLIP；exit 需要 AnimatePresence 包裹。',
    used: 'React 应用 · 组件微交互 · 共享元素。',
  },
  {
    id: 'lottie', axis: 'toolkit', fam: '库', term: 'Lottie', zh: 'Lottie 动画',
    alias: ['lottie', 'bodymovin', 'ae 导出动画'], hot: false, isNew: true,
    def: '把 After Effects 动画导出为 JSON，Web/端上矢量回放的行业标准。',
    params: [], code: `import lottie from 'lottie-web';
lottie.loadAnimation({
  container: el, renderer: 'svg', loop: true,
  path: '/anim/loading.json',
});`,
    pair: ['shimmer'], contrast: ['path-morph'],
    notation: 'T[lottie] · ae:json · renderer:svg · loop:true',
    genes: [
      { g: '管线', v: 'AE → Bodymovin 插件 → JSON' },
      { g: '渲染器', v: 'SVG / Canvas / HTML' },
      { g: '交换', v: '设计给动画、工程给承载' },
    ],
    wild: [
      { what: 'Airbnb 开源', src: 'airbnb.io/lottie', note: '设计工程协作动画的起点' },
      { what: 'lottiefiles.com 社区库', src: 'lottiefiles.com', note: '最大共享图床' },
    ],
    anti: '能 CSS 解决的别上 Lottie——JSON 体积与解析成本不值；复杂插画/序列帧才是主场。',
    tech: 'lottie-web 体积较大（可按需裁剪）；大量实例注意销毁动画实例防内存泄漏。',
    used: '空状态 · 引导插画 · 彩蛋反馈。',
  },
]

export const map = Object.fromEntries(ENTRIES.map((e) => [e.id, e]))

export const byAxis = Object.fromEntries(
  AXES.map((a) => [a.id, ENTRIES.filter((e) => e.axis === a.id)]),
)

/* 轴 → 基因族 → 词条（词典章节陈列的依据） */
export const axisTree = Object.fromEntries(
  AXES.map((a) => [
    a.id,
    a.fams.map((f) => ({ fam: f, items: ENTRIES.filter((e) => e.axis === a.id && e.fam === f) })),
  ]),
)

export const totals = ENTRIES.reduce((m, e) => {
  m[e.axis] = (m[e.axis] || 0) + 1
  m.total = (m.total || 0) + 1
  return m
}, {})

export const hotEntries = ENTRIES.filter((e) => e.hot)
export const newEntries = ENTRIES.filter((e) => e.isNew)
