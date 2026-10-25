// The bench catalog: a compact set of components across three source lanes.
// lane "registry"  — source read from the site's public shadcn registry (MIT)
// lane "github"    — source read from a GitHub repository at a pinned commit (MIT)
// lane "screenshot"— no public source; original-site screenshots and a direct link
//
// Live entries name the component API (`api`) and the parameters the bench exposes.
// `prop` is "Export.path" into that API; scripts/extract-props.mjs resolves each one
// against the component's own TypeScript types and fails if a prop does not exist.
// `demo: true` marks a parameter that only changes the demo content, not a prop.

export const CATEGORIES = [
  { id: 'data', zh: '数据展示', en: 'Data display' },
  { id: 'surface', zh: '背景与边框', en: 'Backgrounds & borders' },
  { id: 'button', zh: '按钮', en: 'Buttons' },
  { id: 'nav', zh: '导航', en: 'Navigation' },
  { id: 'feedback', zh: '反馈与加载', en: 'Feedback & loading' },
  { id: 'layout', zh: '布局', en: 'Layout' },
  { id: 'input', zh: '表单输入', en: 'Inputs' },
  { id: 'content', zh: '内容与图形', en: 'Content & diagrams' },
  { id: 'section', zh: '页面区块', en: 'Page sections' },
]

export const LANES = {
  registry: { zh: '站点 registry', en: 'Site registries', short: { zh: '源码 · 站点', en: 'Source · site' } },
  github: { zh: 'GitHub 仓库', en: 'GitHub repositories', short: { zh: '源码 · GitHub', en: 'Source · GitHub' } },
  npm: { zh: 'npm 包', en: 'npm packages', short: { zh: '源码 · npm', en: 'Source · npm' } },
  screenshot: { zh: '原站截图', en: 'Original screenshots', short: { zh: '截图 · 跳转原站', en: 'Shot · open site' } },
}

const MAGIC = { site: 'Magic UI', home: 'https://magicui.design', repo: 'magicuidesign/magicui', commit: 'efe76fc5755eca1142dd4f74c1d6f0ace2887e3c', license: 'MIT', licenseUrl: 'https://github.com/magicuidesign/magicui/blob/main/LICENSE.md' }
const FANCY = { site: 'fancy-ui', home: 'https://fancy-ui.rama.app', repo: 'RamaHerbin/fancy-ui', commit: '8ee4f6ac9811776fe7fdee5ce6fd8ddb1d70df59', license: 'MIT', licenseUrl: 'https://github.com/RamaHerbin/fancy-ui/blob/main/LICENSE' }

export const CATALOG = [
  // ───────────── registry lane ─────────────
  {
    id: 'number-ticker', lane: 'registry', category: 'data',
    zh: '数字滚动计数', en: 'Number ticker',
    summaryZh: '数字从起始值弹簧式滚到目标值，进入视口才开始；可设方向、延迟和小数位。',
    summaryEn: 'Counts with a spring from a start value to the target once it enters the viewport.',
    tags: ['数字', '计数', '统计', '动画', 'counter', 'number', 'stat', 'kpi', 'spring'],
    source: { ...MAGIC, page: 'https://magicui.design/docs/components/number-ticker', registryItem: 'https://magicui.design/r/number-ticker.json', install: 'npx shadcn@latest add "https://magicui.design/r/number-ticker.json"', files: ['src/vendor/magicui/number-ticker.tsx'] },
    module: './vendor/magicui/number-ticker', api: ['NumberTicker'],
    params: [
      { key: 'value', prop: 'NumberTicker.value', min: 0, max: 100000, step: 1, default: 24182 },
      { key: 'startValue', prop: 'NumberTicker.startValue', min: 0, max: 50000, step: 1 },
      { key: 'direction', prop: 'NumberTicker.direction' },
      { key: 'delay', prop: 'NumberTicker.delay', min: 0, max: 3, step: 0.1, unit: 's' },
      { key: 'decimalPlaces', prop: 'NumberTicker.decimalPlaces', min: 0, max: 3, step: 1 },
    ],
    remountOn: ['value', 'startValue', 'direction', 'delay', 'decimalPlaces'],
  },
  {
    id: 'flickering-grid', lane: 'registry', category: 'surface',
    zh: '闪烁方格背景', en: 'Flickering grid',
    summaryZh: 'Canvas 绘制的方格阵列随机闪烁，离开视口自动暂停；适合做英雄区或卡片底纹。',
    summaryEn: 'A canvas grid of squares that flicker at random and pause offscreen.',
    tags: ['背景', '方格', '网格', '闪烁', 'canvas', 'background', 'grid', 'pattern', 'texture'],
    source: { ...MAGIC, page: 'https://magicui.design/docs/components/flickering-grid', registryItem: 'https://magicui.design/r/flickering-grid.json', install: 'npx shadcn@latest add "https://magicui.design/r/flickering-grid.json"', files: ['src/vendor/magicui/flickering-grid.tsx'] },
    module: './vendor/magicui/flickering-grid', api: ['FlickeringGrid'],
    params: [
      { key: 'squareSize', prop: 'FlickeringGrid.squareSize', min: 1, max: 16, step: 1, unit: 'px' },
      { key: 'gridGap', prop: 'FlickeringGrid.gridGap', min: 0, max: 16, step: 1, unit: 'px' },
      { key: 'flickerChance', prop: 'FlickeringGrid.flickerChance', min: 0, max: 1, step: 0.01 },
      { key: 'color', prop: 'FlickeringGrid.color', control: 'color', default: '#8b5cf6' },
      { key: 'maxOpacity', prop: 'FlickeringGrid.maxOpacity', min: 0.05, max: 1, step: 0.01, default: 0.5 },
    ],
  },
  {
    id: 'border-beam', lane: 'registry', category: 'surface',
    zh: '沿边流光', en: 'Border beam',
    summaryZh: '一段渐变光束沿容器边框绕行，用 CSS offset-path 实现；可调长度、速度、颜色和方向。',
    summaryEn: 'A gradient beam that travels around the border along a CSS offset path.',
    tags: ['边框', '流光', '描边', '光束', '卡片', 'border', 'beam', 'glow', 'outline', 'card'],
    source: { ...MAGIC, page: 'https://magicui.design/docs/components/border-beam', registryItem: 'https://magicui.design/r/border-beam.json', install: 'npx shadcn@latest add "https://magicui.design/r/border-beam.json"', files: ['src/vendor/magicui/border-beam.tsx'] },
    module: './vendor/magicui/border-beam', api: ['BorderBeam'],
    params: [
      { key: 'size', prop: 'BorderBeam.size', min: 10, max: 240, step: 1, unit: 'px', default: 90 },
      { key: 'duration', prop: 'BorderBeam.duration', min: 1, max: 20, step: 0.5, unit: 's' },
      { key: 'colorFrom', prop: 'BorderBeam.colorFrom', control: 'color' },
      { key: 'colorTo', prop: 'BorderBeam.colorTo', control: 'color' },
      { key: 'borderWidth', prop: 'BorderBeam.borderWidth', min: 1, max: 6, step: 1, unit: 'px', default: 2 },
      { key: 'reverse', prop: 'BorderBeam.reverse' },
    ],
  },
  {
    id: 'shimmer-button', lane: 'registry', category: 'button',
    zh: '流光按钮', en: 'Shimmer button',
    summaryZh: '按钮边缘有一道光沿圆周扫过，按下时内阴影加深；光色、速度、圆角、底色都可调。',
    summaryEn: 'A button with light sweeping around its edge; colour, speed, radius and fill are adjustable.',
    tags: ['按钮', '流光', '闪光', '主按钮', 'cta', 'button', 'shimmer', 'shine'],
    source: { ...MAGIC, page: 'https://magicui.design/docs/components/shimmer-button', registryItem: 'https://magicui.design/r/shimmer-button.json', install: 'npx shadcn@latest add "https://magicui.design/r/shimmer-button.json"', files: ['src/vendor/magicui/shimmer-button.tsx'] },
    module: './vendor/magicui/shimmer-button', api: ['ShimmerButton'],
    params: [
      { key: 'label', demo: true, control: 'text', default: 'Shimmer Button', labelZh: '按钮文字', labelEn: 'Label' },
      { key: 'shimmerColor', prop: 'ShimmerButton.shimmerColor', control: 'color' },
      { key: 'shimmerDuration', prop: 'ShimmerButton.shimmerDuration', control: 'slider', min: 0.5, max: 8, step: 0.1, unit: 's', default: 3 },
      { key: 'shimmerSize', prop: 'ShimmerButton.shimmerSize', control: 'slider', min: 0.01, max: 0.3, step: 0.01, unit: 'em', default: 0.05 },
      { key: 'borderRadius', prop: 'ShimmerButton.borderRadius', control: 'slider', min: 0, max: 100, step: 1, unit: 'px', default: 100 },
      { key: 'background', prop: 'ShimmerButton.background', control: 'color', default: '#000000' },
    ],
  },
  {
    id: 'circular-progress', lane: 'registry', category: 'data',
    zh: '环形进度表', en: 'Circular progress gauge',
    summaryZh: '两段圆弧组成的进度环，数值变化时弧长和缺口一起过渡；主色和底色可分开设。',
    summaryEn: 'A two-arc progress ring whose arcs and gap animate together when the value changes.',
    tags: ['进度', '环形', '仪表', '百分比', 'progress', 'gauge', 'ring', 'percent', 'donut'],
    source: { ...MAGIC, page: 'https://magicui.design/docs/components/animated-circular-progress-bar', registryItem: 'https://magicui.design/r/animated-circular-progress-bar.json', install: 'npx shadcn@latest add "https://magicui.design/r/animated-circular-progress-bar.json"', files: ['src/vendor/magicui/animated-circular-progress-bar.tsx'] },
    module: './vendor/magicui/animated-circular-progress-bar', api: ['AnimatedCircularProgressBar'],
    params: [
      { key: 'value', prop: 'AnimatedCircularProgressBar.value', min: 0, max: 100, step: 1, default: 62 },
      { key: 'max', prop: 'AnimatedCircularProgressBar.max', min: 10, max: 200, step: 1 },
      { key: 'gaugePrimaryColor', prop: 'AnimatedCircularProgressBar.gaugePrimaryColor', control: 'color', default: '#60a5fa' },
      { key: 'gaugeSecondaryColor', prop: 'AnimatedCircularProgressBar.gaugeSecondaryColor', control: 'color', default: '#27272a' },
    ],
  },
  {
    id: 'dock', lane: 'registry', category: 'nav',
    zh: 'macOS 放大坞', en: 'Magnifying dock',
    summaryZh: '鼠标靠近时图标按距离放大，像 macOS 程序坞；可调图标尺寸、放大倍数和感应距离。',
    summaryEn: 'Icons grow with pointer distance, like the macOS dock.',
    tags: ['程序坞', '放大', '图标栏', '导航', 'dock', 'magnify', 'macos', 'toolbar', 'icons'],
    source: { ...MAGIC, page: 'https://magicui.design/docs/components/dock', registryItem: 'https://magicui.design/r/dock.json', install: 'npx shadcn@latest add "https://magicui.design/r/dock.json"', files: ['src/vendor/magicui/dock.tsx'], note: { zh: 'registry 未声明 class-variance-authority 依赖，需手动安装。', en: 'The registry omits the class-variance-authority dependency.' } },
    module: './vendor/magicui/dock', api: ['Dock'],
    params: [
      { key: 'iconSize', prop: 'Dock.iconSize', min: 24, max: 64, step: 1, unit: 'px' },
      { key: 'iconMagnification', prop: 'Dock.iconMagnification', min: 24, max: 120, step: 1, unit: 'px' },
      { key: 'iconDistance', prop: 'Dock.iconDistance', min: 40, max: 320, step: 1, unit: 'px' },
      { key: 'disableMagnification', prop: 'Dock.disableMagnification' },
      { key: 'direction', prop: 'Dock.direction' },
    ],
  },
  {
    id: 'pixel-loader', lane: 'registry', category: 'feedback',
    zh: '像素波浪加载', en: 'Pixel loader',
    summaryZh: '像素点阵按对角线依次亮起，形成一道从左上到右下的波；纯 CSS 动画，无随机数。',
    summaryEn: 'A pixel grid lit along its anti-diagonals so a wave crosses it; pure CSS.',
    tags: ['加载', '像素', '等待', 'loading', 'loader', 'spinner', 'pixel', 'wave'],
    source: { ...FANCY, page: 'https://fancy-ui.rama.app/components/pixel-loader', registryItem: 'https://fancy-ui.rama.app/r/pixel-loader.json', install: 'npx shadcn@latest add "https://fancy-ui.rama.app/r/pixel-loader.json"', files: ['src/vendor/fancy/react/src/components/pixel-loader/PixelLoader.tsx', 'src/vendor/fancy/react/src/components/pixel-loader/pixel-loader.css'] },
    module: './vendor/fancy/react/src/components/pixel-loader', api: ['PixelLoader'],
    params: [
      { key: 'cols', prop: 'PixelLoader.cols', min: 2, max: 14, step: 1 },
      { key: 'rows', prop: 'PixelLoader.rows', min: 2, max: 14, step: 1 },
      { key: 'cellSize', prop: 'PixelLoader.cellSize', min: 2, max: 18, step: 1, unit: 'px', default: 10 },
      { key: 'gap', prop: 'PixelLoader.gap', min: 0, max: 8, step: 1, unit: 'px', default: 3 },
      { key: 'color', prop: 'PixelLoader.color', control: 'color', default: '#a78bfa' },
      { key: 'speed', prop: 'PixelLoader.speed', min: 0.2, max: 5, step: 0.1, unit: 's' },
    ],
  },
  {
    id: 'tick-nav', lane: 'registry', category: 'nav',
    zh: '刻度导航', en: 'Tick navigation',
    summaryZh: '每个菜单项左侧一根刻度线，鼠标经过时附近的刻度按距离伸长，当前项保持高亮。',
    summaryEn: 'Each row has a tick; ticks near the pointer stretch by distance and the current row stays lit.',
    tags: ['导航', '刻度', '菜单', '侧栏', 'nav', 'menu', 'ticks', 'sidebar', 'hover'],
    source: { ...FANCY, page: 'https://fancy-ui.rama.app/components/tick-nav', registryItem: 'https://fancy-ui.rama.app/r/tick-nav.json', install: 'npx shadcn@latest add "https://fancy-ui.rama.app/r/tick-nav.json"', files: ['src/vendor/fancy/react/src/components/tick-nav/TickNav.tsx', 'src/vendor/fancy/react/src/components/tick-nav/tick-nav-core.ts', 'src/vendor/fancy/react/src/components/tick-nav/tick-nav.css'] },
    module: './vendor/fancy/react/src/components/tick-nav', api: ['TickNav'],
    params: [
      { key: 'reach', prop: 'TickNav.reach', min: 0, max: 8, step: 1 },
      { key: 'minorTicks', prop: 'TickNav.minorTicks', min: 0, max: 6, step: 1 },
      { key: 'variant', prop: 'TickNav.variant' },
      { key: 'hdr', prop: 'TickNav.hdr' },
      { key: 'sound', prop: 'TickNav.sound', default: false },
    ],
  },

  // ───────────── GitHub lane ─────────────
  {
    id: 'stacked-bars', lane: 'github', category: 'data',
    zh: '堆叠柱状图', en: 'Stacked bar chart',
    summaryZh: 'shadcn/ui 的图表容器包住 Recharts 柱图：主题色由 config 注入为 CSS 变量，悬停出现分项提示。',
    summaryEn: 'shadcn/ui chart container around a Recharts bar chart; colours come from config as CSS variables.',
    tags: ['图表', '柱状图', '堆叠', '流量', '数据', 'chart', 'bar', 'stacked', 'recharts', 'analytics'],
    source: { site: 'shadcn/ui', home: 'https://ui.shadcn.com/charts', repo: 'shadcn-ui/ui', commit: 'e55b60b1014cccfb9ac62f97e0d20b5b649f4a54', path: 'apps/v4/registry/new-york-v4/ui/chart.tsx', license: 'MIT', licenseUrl: 'https://github.com/shadcn-ui/ui/blob/main/LICENSE.md', install: 'npx shadcn@latest add chart', files: ['src/vendor/shadcn/chart.tsx'], packages: ['recharts'] },
    module: './vendor/shadcn/chart', api: ['ChartContainer'], extraApi: [{ module: 'recharts', names: ['Bar', 'BarChart'] }],
    params: [
      { key: 'days', demo: true, min: 7, max: 40, step: 1, default: 20, labelZh: '天数', labelEn: 'Days' },
      { key: 'stacked', demo: true, control: 'toggle', default: true, labelZh: '堆叠', labelEn: 'Stacked' },
      { key: 'radius', prop: 'Bar.radius', control: 'slider', min: 0, max: 12, step: 1, unit: 'px', default: 3 },
      { key: 'barCategoryGap', prop: 'BarChart.barCategoryGap', control: 'slider', min: 0, max: 60, step: 1, unit: '%', default: 22 },
      { key: 'layout', prop: 'BarChart.layout', options: ['horizontal', 'vertical'] },
    ],
  },
  {
    id: 'flow-canvas', lane: 'github', category: 'content',
    zh: '节点流程画布', en: 'Node flow canvas',
    summaryZh: 'React Flow 的可拖拽节点图：节点可拖动连线，画布可平移缩放，背景点阵/线格可切换。',
    summaryEn: 'React Flow node graph: drag nodes, connect handles, pan and zoom; dot, line or cross backgrounds.',
    tags: ['流程图', '节点', '连线', '画布', '工作流', 'flow', 'graph', 'node', 'diagram', 'workflow', 'dag'],
    source: { site: 'xyflow', home: 'https://reactflow.dev', repo: 'xyflow/xyflow', commit: '8523d8dd9f1551954bc221dccabd6a3119ef9e22', license: 'MIT', licenseUrl: 'https://github.com/xyflow/xyflow/blob/main/LICENSE', install: 'npm i @xyflow/react', packages: ['@xyflow/react'], files: ["src/vendor/packages/flow-canvas/packages/react/src/container/ReactFlow/index.tsx"], fileOrigins: {"src/vendor/packages/flow-canvas/packages/react/src/container/ReactFlow/index.tsx":{"path":"packages/react/src/container/ReactFlow/index.tsx","url":"https://github.com/xyflow/xyflow/blob/8523d8dd9f1551954bc221dccabd6a3119ef9e22/packages/react/src/container/ReactFlow/index.tsx","gitBlob":"21e5f42c2a5e2f414eefa5328672ed6da789c083","sha256":"d866f64f483e23e54366b014dc884349080e1d74956003af1b8a5053bc387581","bytes":11133}} },
    module: '@xyflow/react', api: ['ReactFlow', 'Background'],
    params: [
      { key: 'variant', prop: 'Background.variant', options: ['dots', 'lines', 'cross'], default: 'dots' },
      { key: 'gap', prop: 'Background.gap', control: 'slider', min: 8, max: 60, step: 1, unit: 'px', default: 18 },
      { key: 'snapToGrid', prop: 'ReactFlow.snapToGrid' },
      { key: 'panOnDrag', prop: 'ReactFlow.panOnDrag', control: 'toggle', default: true },
      { key: 'animated', demo: true, control: 'toggle', default: true, labelZh: '连线流动', labelEn: 'Animated edges' },
    ],
  },
  {
    id: 'resizable-panels', lane: 'github', category: 'layout',
    zh: '可拖拽分栏', en: 'Resizable panels',
    summaryZh: '拖动分隔条改变面板宽度，最小/最大尺寸约束实时生效；支持横竖两个方向和键盘操作。',
    summaryEn: 'Drag separators to resize panels within min/max constraints; horizontal or vertical, keyboard-accessible.',
    tags: ['分栏', '拖拽', '布局', '面板', '编辑器', 'split', 'resizable', 'panels', 'layout', 'ide'],
    source: { site: 'react-resizable-panels', home: 'https://react-resizable-panels.vercel.app', repo: 'bvaughn/react-resizable-panels', commit: 'c19f0a93a96e4f214e9bd7b77eaec155f31f50d7', license: 'MIT', licenseUrl: 'https://github.com/bvaughn/react-resizable-panels/blob/main/LICENSE.md', install: 'npm i react-resizable-panels', packages: ['react-resizable-panels'], files: ["src/vendor/packages/resizable-panels/lib/components/group/Group.tsx","src/vendor/packages/resizable-panels/lib/components/panel/Panel.tsx"], fileOrigins: {"src/vendor/packages/resizable-panels/lib/components/group/Group.tsx":{"path":"lib/components/group/Group.tsx","url":"https://github.com/bvaughn/react-resizable-panels/blob/c19f0a93a96e4f214e9bd7b77eaec155f31f50d7/lib/components/group/Group.tsx","gitBlob":"6e7b8c29e8b734f51ba198a6e8ef49ada3feb2b0","sha256":"3b27d1216e52398ed81d3d4c5d8469ababdfa12ec5b6703a25a4218212ff296c","bytes":14828},"src/vendor/packages/resizable-panels/lib/components/panel/Panel.tsx":{"path":"lib/components/panel/Panel.tsx","url":"https://github.com/bvaughn/react-resizable-panels/blob/c19f0a93a96e4f214e9bd7b77eaec155f31f50d7/lib/components/panel/Panel.tsx","gitBlob":"d8e6ee53dd7b1a7d5f70da2ee849b80d0ae0d644","sha256":"6af870099a9aa813a7fbdcf274c488b40c0a56f6cbba0d336df7c1faddf1de2a","bytes":6215}} },
    module: 'react-resizable-panels', api: ['Group', 'Panel'],
    params: [
      { key: 'orientation', prop: 'Group.orientation', default: 'horizontal' },
      { key: 'panels', demo: true, min: 2, max: 4, step: 1, default: 3, labelZh: '面板数', labelEn: 'Panels' },
      { key: 'minSize', prop: 'Panel.minSize', control: 'slider', min: 5, max: 30, step: 1, unit: '%', default: 12 },
    ],
  },
  {
    id: 'grid-layout', lane: 'github', category: 'layout',
    zh: '拖拽网格布局', en: 'Draggable grid layout',
    summaryZh: '仪表盘式网格：卡片可拖动、可从右下角拉伸，其余卡片自动压实；列数、行高、间距可调。',
    summaryEn: 'Dashboard grid: drag and resize cards while the rest compact; columns, row height and margin adjustable.',
    tags: ['网格', '拖拽', '仪表盘', '布局', 'grid', 'dashboard', 'drag', 'layout', 'widgets'],
    source: { site: 'react-grid-layout', home: 'https://react-grid-layout.github.io/react-grid-layout/', repo: 'react-grid-layout/react-grid-layout', commit: '866f646fe9989f604a0d26dba756fab630f07d23', license: 'MIT', licenseUrl: 'https://github.com/react-grid-layout/react-grid-layout/blob/master/LICENSE', install: 'npm i react-grid-layout', packages: ['react-grid-layout'], files: ["src/vendor/packages/grid-layout/src/react/components/GridLayout.tsx"], fileOrigins: {"src/vendor/packages/grid-layout/src/react/components/GridLayout.tsx":{"path":"src/react/components/GridLayout.tsx","url":"https://github.com/react-grid-layout/react-grid-layout/blob/866f646fe9989f604a0d26dba756fab630f07d23/src/react/components/GridLayout.tsx","gitBlob":"b9f9d1fa033af711707faf438eec32e37fd1b37c","sha256":"0901ce397db4c4cf4154f24e42e446b389752d8db10e457a0da5f70275fc1650","bytes":41566}} },
    module: 'react-grid-layout', api: ['GridLayout'],
    params: [
      { key: 'cols', prop: 'GridLayout.gridConfig.cols', min: 2, max: 12, step: 1, default: 6 },
      { key: 'rowHeight', prop: 'GridLayout.gridConfig.rowHeight', min: 40, max: 140, step: 1, unit: 'px', default: 72 },
      { key: 'margin', prop: 'GridLayout.gridConfig.margin', control: 'slider', min: 0, max: 24, step: 1, unit: 'px', default: 10 },
      { key: 'dragEnabled', prop: 'GridLayout.dragConfig.enabled' },
      { key: 'resizeEnabled', prop: 'GridLayout.resizeConfig.enabled' },
    ],
  },
  {
    id: 'date-picker', lane: 'github', category: 'input',
    zh: '日期选择器', en: 'Date picker',
    summaryZh: '内联日历：可显示多个月、周数和时间列，周起始日可改；键盘可在日期间移动。',
    summaryEn: 'Inline calendar with multiple months, week numbers, a time column and a configurable first weekday.',
    tags: ['日期', '日历', '时间', '表单', 'date', 'calendar', 'datepicker', 'time', 'form'],
    source: { site: 'react-datepicker', home: 'https://reactdatepicker.com', repo: 'Hacker0x01/react-datepicker', commit: '548a1f3464c30741f2581c78f27fe1f20f9aeac6', license: 'MIT', licenseUrl: 'https://github.com/Hacker0x01/react-datepicker/blob/main/LICENSE', install: 'npm i react-datepicker', packages: ['react-datepicker'], files: ["src/vendor/packages/date-picker/src/index.tsx"], fileOrigins: {"src/vendor/packages/date-picker/src/index.tsx":{"path":"src/index.tsx","url":"https://github.com/Hacker0x01/react-datepicker/blob/548a1f3464c30741f2581c78f27fe1f20f9aeac6/src/index.tsx","gitBlob":"05fde7b811ffc9ecca8b9dc3bfb2c99e40757a5f","sha256":"f5f8d311703ad355ee604f64c89b8316be0cf151ee2b4ed4e34447e4ddd95233","bytes":61691}} },
    module: 'react-datepicker', api: ['default'],
    params: [
      { key: 'monthsShown', prop: 'default.monthsShown', min: 1, max: 2, step: 1, default: 1 },
      { key: 'showWeekNumbers', prop: 'default.showWeekNumbers' },
      { key: 'showTimeSelect', prop: 'default.showTimeSelect' },
      { key: 'calendarStartDay', prop: 'default.calendarStartDay', control: 'slider', min: 0, max: 6, step: 1, default: 1 },
    ],
  },
  {
    id: 'markdown', lane: 'github', category: 'content',
    zh: 'Markdown 渲染', en: 'Markdown renderer',
    summaryZh: '把 Markdown 安全地渲染成 React 元素（不走 innerHTML）；打开 GFM 后支持表格、任务列表、删除线。',
    summaryEn: 'Renders Markdown to React elements without innerHTML; GFM adds tables, task lists and strikethrough.',
    tags: ['markdown', '文档', '渲染', '富文本', 'md', 'renderer', 'gfm', 'docs', 'prose'],
    source: { site: 'react-markdown', home: 'https://remarkjs.github.io/react-markdown/', repo: 'remarkjs/react-markdown', commit: 'f9ca66ec73d218127bff56b41a583bba1fb96125', license: 'MIT', licenseUrl: 'https://github.com/remarkjs/react-markdown/blob/main/license', install: 'npm i react-markdown remark-gfm', packages: ['react-markdown', 'remark-gfm'], files: ["src/vendor/packages/markdown/lib/index.js"], fileOrigins: {"src/vendor/packages/markdown/lib/index.js":{"path":"lib/index.js","url":"https://github.com/remarkjs/react-markdown/blob/f9ca66ec73d218127bff56b41a583bba1fb96125/lib/index.js","gitBlob":"ea2c58f91212c28808c33149fa783eac119e876e","sha256":"9f4ccf2eebca4a13960f656148357c64ce27c82b48aa02a93df71ecb39ede501","bytes":13133}} },
    module: 'react-markdown', api: ['default'],
    params: [
      { key: 'children', prop: 'default.children', control: 'textarea', default: '## 发布清单\n\n- [x] 组件源码入库\n- [ ] 沙箱截图\n- [ ] ~~人工复核~~\n\n| 路线 | 条目 |\n|---|---:|\n| registry | 40 |\n| GitHub | 484 |\n' },
      { key: 'gfm', demo: true, control: 'toggle', default: true, labelZh: 'GFM 扩展', labelEn: 'GFM' },
      { key: 'skipHtml', prop: 'default.skipHtml' },
    ],
  },

  {
    id: 'gosrock-button-large', lane: 'github', category: 'button', fill: 'light',
    zh: '大号描边按钮', en: 'Large outlined button',
    summaryZh: 'Ticket Storybook 的 Large 变体：透明底、深灰字和内描边；原例文字为“按钮”。',
    summaryEn: 'The original Large story: transparent fill, dark text and an inset outline, with the source label “버튼”.',
    tags: ['按钮', '胶囊', '描边', '大号', 'button', 'pill', 'outlined', 'large'],
    source: {
      site: 'Ticket Storybook 21st', home: 'https://github.com/Gosrock/Ticket-Storybook-21st',
      repo: 'Gosrock/Ticket-Storybook-21st', commit: '09e4c43ca0c6fa9aac4f612fbc8709e0dd8ccc54',
      license: 'MIT', licenseUrl: 'https://github.com/Gosrock/Ticket-Storybook-21st/blob/09e4c43ca0c6fa9aac4f612fbc8709e0dd8ccc54/LICENSE',
      licenseCheckedAt: '2026-10-25T07:13:49.676827+00:00',
      page: 'https://github.com/Gosrock/Ticket-Storybook-21st/blob/09e4c43ca0c6fa9aac4f612fbc8709e0dd8ccc54/src/stories/Button/Button.stories.jsx#L31',
      install: 'git clone --filter=blob:none https://github.com/Gosrock/Ticket-Storybook-21st.git && git -C Ticket-Storybook-21st checkout 09e4c43ca0c6fa9aac4f612fbc8709e0dd8ccc54',
      packages: ['prop-types'],
      files: [
        'src/vendor/gosrock/src/stories/Button/Button.stories.jsx',
        'src/vendor/gosrock/src/stories/Button/Button.jsx',
        'src/vendor/gosrock/src/stories/Button/button.css',
      ],
      fileOrigins: {
        'src/vendor/gosrock/src/stories/Button/Button.stories.jsx': { path: 'src/stories/Button/Button.stories.jsx', url: 'https://github.com/Gosrock/Ticket-Storybook-21st/blob/09e4c43ca0c6fa9aac4f612fbc8709e0dd8ccc54/src/stories/Button/Button.stories.jsx', gitBlob: 'fd99f28f2bf54ba95f703723b825248eedeaee70', sha256: 'd080c8a5324aa5d91ded4e001b33e248ce1685e4e856a9a8259b0085d1a042cb', bytes: 1007 },
        'src/vendor/gosrock/src/stories/Button/Button.jsx': { path: 'src/stories/Button/Button.jsx', url: 'https://github.com/Gosrock/Ticket-Storybook-21st/blob/09e4c43ca0c6fa9aac4f612fbc8709e0dd8ccc54/src/stories/Button/Button.jsx', gitBlob: '93e4e220ebbd6ccf2120cd36ede38c845e97d771', sha256: '31e28831cb039f99e0a477e85bef2f02522bbb3b0972ea22e6e41eb3b1b519c4', bytes: 1078 },
        'src/vendor/gosrock/src/stories/Button/button.css': { path: 'src/stories/Button/button.css', url: 'https://github.com/Gosrock/Ticket-Storybook-21st/blob/09e4c43ca0c6fa9aac4f612fbc8709e0dd8ccc54/src/stories/Button/button.css', gitBlob: 'dc91dc76370b78ec277e634f8615b67ca55a5145', sha256: '0e25c32ea023d528e8f3fee604ba77383b62664a765e7acb61ed9679d81cdc51', bytes: 642 },
      },
    },
    offer: {
      id: 'source-seed-gosrock-button-large', verified: true, checkedAt: '2026-10-25T07:13:49.676827+00:00',
      subject: 'source-code', scope: 'Exact pinned Button Large story and its component/CSS files',
      access: 'free', sourceAvailable: true,
      sourceUrl: 'https://github.com/Gosrock/Ticket-Storybook-21st/blob/09e4c43ca0c6fa9aac4f612fbc8709e0dd8ccc54/src/stories/Button/Button.stories.jsx#L31',
      sourceCost: 'free', openSource: true, commercialUse: true, license: 'MIT',
      licenseUrl: 'https://github.com/Gosrock/Ticket-Storybook-21st/blob/09e4c43ca0c6fa9aac4f612fbc8709e0dd8ccc54/LICENSE',
      evidenceUrls: [
        'https://github.com/Gosrock/Ticket-Storybook-21st/blob/09e4c43ca0c6fa9aac4f612fbc8709e0dd8ccc54/src/stories/Button/Button.stories.jsx#L31',
        'https://github.com/Gosrock/Ticket-Storybook-21st/blob/09e4c43ca0c6fa9aac4f612fbc8709e0dd8ccc54/src/stories/Button/Button.jsx',
        'https://github.com/Gosrock/Ticket-Storybook-21st/blob/09e4c43ca0c6fa9aac4f612fbc8709e0dd8ccc54/LICENSE',
      ],
    },
    verification: 'actual-source-render-and-browser-verified',
    previewVerification: 'The original Large story was run in an isolated browser. The button, CSS and keyboard focus state were inspected; the default screenshot is a real 800×500 browser capture.',
    exampleArgs: { size: 'large', label: '버튼' },
    module: './vendor/gosrock/src/stories/Button/Button.jsx', api: ['Button'],
    params: [
      { key: 'size', prop: 'Button.size', control: 'segmented', default: 'large', options: ['small', 'medium', 'large'], labelZh: '尺寸', labelEn: 'Size' },
      { key: 'primary', prop: 'Button.primary', control: 'toggle', default: false, labelZh: '主按钮', labelEn: 'Primary' },
      { key: 'label', prop: 'Button.label', control: 'text', default: '버튼', labelZh: '按钮文字', labelEn: 'Label' },
    ],
  },

  // ───────────── screenshot lane ─────────────
  ...[
    ['hover-dev-77c2d907d817', 'button', ['按钮', '滴落', '液体', 'button', 'drip', 'paint', 'hover']],
    ['hover-dev-b85564df2672', 'section', ['定价', '价格卡', '几何', 'pricing', 'plan', 'card']],
    ['hover-dev-d49dc0cd0420', 'section', ['英雄区', '首屏', '星空', '光晕', 'hero', 'landing', 'gradient', 'stars']],
    ['hover-dev-ffad57a7427d', 'feedback', ['头像', '脉冲', '同心圆', 'avatar', 'pulse', 'ripple']],
    ['hover-dev-c4fb5a61b31b', 'nav', ['标签栏', '胶囊', '滑动', '导航', 'tabs', 'pill', 'slide', 'nav', 'menu']],
    ['entry-shadcn-studio-blocks-b6b7ef18a85f', 'section', ['地球', '点阵', '信任', '英雄区', 'globe', 'dots', 'trust', 'hero', 'logos']],
  ].map(([shotId, category, tags]) => ({ id: shotId, lane: 'screenshot', category, tags, shotId })),
]

const gosrockLarge = CATALOG.find(entry => entry.id === 'gosrock-button-large')
CATALOG.push({
  ...gosrockLarge,
  id: 'gosrock-button-medium',
  zh: '中号描边按钮',
  en: 'Medium outlined button',
  summaryZh: 'Ticket Storybook 的 Secondary 变体沿用组件默认 medium 尺寸：透明底、深灰字和内描边；原例文字为“按钮”。',
  summaryEn: 'The original Secondary story uses the component’s default medium size, transparent fill, dark text and inset outline.',
  tags: ['按钮', '胶囊', '描边', '中号', 'button', 'pill', 'outlined', 'medium', 'secondary'],
  source: { ...gosrockLarge.source, page: 'https://github.com/Gosrock/Ticket-Storybook-21st/blob/09e4c43ca0c6fa9aac4f612fbc8709e0dd8ccc54/src/stories/Button/Button.stories.jsx#L26' },
  offer: {
    ...gosrockLarge.offer,
    id: 'source-seed-gosrock-button-medium',
    scope: 'Exact pinned Button Secondary story and its component/CSS files',
    sourceUrl: 'https://github.com/Gosrock/Ticket-Storybook-21st/blob/09e4c43ca0c6fa9aac4f612fbc8709e0dd8ccc54/src/stories/Button/Button.stories.jsx#L26',
    evidenceUrls: [
      'https://github.com/Gosrock/Ticket-Storybook-21st/blob/09e4c43ca0c6fa9aac4f612fbc8709e0dd8ccc54/src/stories/Button/Button.stories.jsx#L26',
      'https://github.com/Gosrock/Ticket-Storybook-21st/blob/09e4c43ca0c6fa9aac4f612fbc8709e0dd8ccc54/src/stories/Button/Button.jsx',
      'https://github.com/Gosrock/Ticket-Storybook-21st/blob/09e4c43ca0c6fa9aac4f612fbc8709e0dd8ccc54/LICENSE',
    ],
  },
  exampleArgs: { label: '버튼' },
  params: [
    { key: 'size', prop: 'Button.size', control: 'segmented', default: 'medium', options: ['small', 'medium', 'large'], labelZh: '尺寸', labelEn: 'Size' },
    { key: 'primary', prop: 'Button.primary', control: 'toggle', default: false, labelZh: '主按钮', labelEn: 'Primary' },
    { key: 'label', prop: 'Button.label', control: 'text', default: '버튼', labelZh: '按钮文字', labelEn: 'Label' },
  ],
  verification: 'actual-source-render-and-browser-verified',
  previewVerification: 'The original Secondary story was run in an isolated browser. Its DOM, CSS, hover, keyboard focus, Enter and pointer click states were inspected; the default poster is a real 800×500 browser capture.',
})
