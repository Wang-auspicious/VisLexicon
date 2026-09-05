/* ============ L2-B 开源生态索引（组件级） ============
 * 每条记录 = Registry Schema 超集。
 * license_gate: green=可直接引用代码 / yellow=仅链接+截图 / red=仅收录名称。
 * 所有 site / repo / install 均为已验证的真实地址（2026-08 巡检）。
 */

/* ============ L2-B 开源生态与独立设计师名站策展 ============
 * 收录顶级个人设计师站点、独立实验室、开源 UI 库。
 * 纯外链模式：点击直接干脆跳转作者源站。
 * 视觉指纹卡：1 大 2 小三联实物视窗 + 1.5 秒扫透家底元数据。
 */

export const CURATED_SITES = [
  {
    id: 'magic-ui',
    name: 'Magic UI',
    author: 'Dillion Verma (@dillionverma)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    site: 'https://magicui.design',
    repo: 'magicuidesign/magicui',
    tagline: '面向营销落地页与高视觉冲击的动效组件库，与 shadcn 无缝兼容',
    scale: '150+ 动效组件',
    category: '动效与营销落地页',
    stack: 'React · Tailwind · Motion',
    license: 'MIT 免费开源',
    tags: ['Bento Grid', 'Aurora 渐变', 'Border Beam', '粒子动效'],
    heroSpec: {
      type: 'bento-aurora',
      title: 'Bento Grid & Aurora Flow',
      desc: '发光边框与平滑视差网格',
      gradient: 'linear-gradient(135deg, #09090b 0%, #171727 50%, #2e1065 100%)',
    },
    miniSpecs: [
      { title: 'Marquee', type: '跑马灯流', bg: 'linear-gradient(135deg, #18181b, #27272a)' },
      { title: 'Globe 3D', type: 'WebGL 球体', bg: 'linear-gradient(135deg, #0c1829, #1e3a8a)' },
    ],
  },
  {
    id: 'aceternity',
    name: 'Aceternity UI',
    author: 'Manu Arora (@mannupaaji)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    site: 'https://ui.aceternity.com',
    repo: 'mannupaaji/aceternity-ui',
    tagline: '全网公认 3D 卡片、聚光灯与未来科技感交互的天花板',
    scale: '90+ 交互组件',
    category: '3D 拟真与未来感',
    stack: 'React · Framer Motion · Three.js',
    license: '免费自用 · 复制即用',
    tags: ['3D Card Tilt', 'Spotlight 聚光灯', 'Macbook Scroll', '背景光斑'],
    heroSpec: {
      type: '3d-spotlight',
      title: '3D Card Tilt & Spotlight',
      desc: '随光标旋转的次世代立体卡片',
      gradient: 'linear-gradient(135deg, #020617 0%, #0f172a 60%, #1e1b4b 100%)',
    },
    miniSpecs: [
      { title: 'Text Sparkles', type: '乱码火花', bg: 'linear-gradient(135deg, #172554, #1e1b4b)' },
      { title: 'Lamp Effect', type: '顶灯渐变', bg: 'linear-gradient(135deg, #0f172a, #312e81)' },
    ],
  },
  {
    id: 'origin-ui',
    name: 'Origin UI',
    author: 'COSS Community (@coss)',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    site: 'https://coss.com/ui',
    repo: 'origin-space/originui',
    tagline: '极度克制、专注真实 SaaS / App 工业级后台的精细组件库',
    scale: '200+ 基础与复合组件',
    category: 'SaaS / 工业级后台',
    stack: 'React · Tailwind · Radix UI',
    license: 'MIT 免费开源',
    tags: ['输入框微交互', '浮动 Dock', '状态徽章', '标签页切换'],
    heroSpec: {
      type: 'dock-saas',
      title: 'Precision macOS Dock & Input Micro-states',
      desc: '极致对齐的像素级工业控件',
      gradient: 'linear-gradient(135deg, #18181b 0%, #27272a 50%, #3f3f46 100%)',
    },
    miniSpecs: [
      { title: 'Search Palette', type: '极速命令栏', bg: 'linear-gradient(135deg, #27272a, #52525b)' },
      { title: 'Dynamic Tabs', type: '平滑滑动条', bg: 'linear-gradient(135deg, #18181b, #27272a)' },
    ],
  },
  {
    id: 'hover-dev',
    name: 'Hover.dev',
    author: 'Tom Is Loading (@tomisloading)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    site: 'https://hover.dev',
    repo: '—',
    tagline: '全网最具魔性的按钮微动效、导航栏与极具个性的营销区块',
    scale: '120+ 微动效区块',
    category: '微交互与物理回弹',
    stack: 'React · Tailwind · Framer Motion',
    license: '免费自用 · 复制即用',
    tags: ['Magnetic 磁吸', 'Spring 回弹', '滑轨导航', '炫光按钮'],
    heroSpec: {
      type: 'magnetic-button',
      title: 'Fluid Magnetic Interactions & Shifting Tabs',
      desc: '让鼠标产生吸附质感的物理按钮',
      gradient: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #44403c 100%)',
    },
    miniSpecs: [
      { title: 'Encrypted Text', type: '黑客解码', bg: 'linear-gradient(135deg, #292524, #57534e)' },
      { title: 'Flyout Nav', type: '悬停平滑展开', bg: 'linear-gradient(135deg, #1c1917, #292524)' },
    ],
  },
  {
    id: 'uiverse',
    name: 'Uiverse.io',
    author: 'Open Source Community (@uiverse)',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    site: 'https://uiverse.io',
    repo: 'uiverse-io/galaxy',
    tagline: '全世界最大的社区共建纯 CSS / HTML / Tailwind 独立 UI 元素库',
    scale: '3500+ 单体元素',
    category: '纯 CSS / 单体创意',
    stack: '纯 CSS · HTML · Tailwind',
    license: 'MIT 免费开源',
    tags: ['霓虹加载器', '复古开关', '拟态卡片', '立体按钮'],
    heroSpec: {
      type: 'css-showcase',
      title: '3000+ Pure CSS Micro-creations',
      desc: '零依赖、拿来即跑的纯 CSS 创意池',
      gradient: 'linear-gradient(135deg, #09090b 0%, #1e1e24 60%, #311b92 100%)',
    },
    miniSpecs: [
      { title: 'Neon Switch', type: '发光微开关', bg: 'linear-gradient(135deg, #1a1a2e, #16213e)' },
      { title: 'Cube Loader', type: '3D 旋转方块', bg: 'linear-gradient(135deg, #0f3460, #533483)' },
    ],
  },
  {
    id: 'animata',
    name: 'Animata',
    author: 'Codse (@codse)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    site: 'https://animata.design',
    repo: 'codse/animata',
    tagline: '富有呼吸感的手绘插画风与生动故事叙述型交互组件',
    scale: '80+ 灵动组件',
    category: '生动叙事与插画微动效',
    stack: 'React · Tailwind · Lucide',
    license: 'MIT 免费开源',
    tags: ['手绘图表', '卡片翻转', '打字机效果', '悬停气泡'],
    heroSpec: {
      type: 'playful-story',
      title: 'Handcrafted Playful & Storytelling Micro-interactions',
      desc: '打破冷冰冰 AI 味的温润手感',
      gradient: 'linear-gradient(135deg, #1c1917 0%, #3b1d11 60%, #7c2d12 100%)',
    },
    miniSpecs: [
      { title: 'Flip Card', type: '3D 双面翻转', bg: 'linear-gradient(135deg, #451a03, #78350f)' },
      { title: 'Badge Pulse', type: '温润呼吸灯', bg: 'linear-gradient(135deg, #292524, #44403c)' },
    ],
  },
]

export const LIBRARIES = CURATED_SITES.map(s => ({
  id: s.id,
  name: s.name,
  site: s.site,
  repo: s.repo,
  license: s.license,
  gate: s.license.includes('MIT') ? 'green' : 'yellow',
  stack: { framework: 'react', style: 'tailwind', motion: 'framer-motion' },
  note: s.tagline,
}))

export const COMPONENTS = [
  { id: 'magicui/bento-grid', lib: 'magic-ui', title: 'Bento Grid', site: 'https://magicui.design/docs/components/bento-grid', install: 'npx shadcn@latest add "https://magicui.design/r/bento-grid.json"', tags: ['lex:layout:bento-grid', 'lex:component:hero'], gate: 'green', stack: { framework: 'react', motion: 'framer-motion' }, note: '带 hover 光效的便当网格，结构性 SEO 组件。' },
  { id: 'aceternity/3d-card-effect', lib: 'aceternity', title: '3D Card Effect', site: 'https://ui.aceternity.com/components/3d-card-effect', install: '文档页复制（CLI 需 license key）', tags: ['lex:interaction:hover-tilt', 'lex:interaction:spotlight-card'], gate: 'yellow', stack: { framework: 'react', motion: 'framer-motion' }, note: '透视倾斜 + 内部元素视差，hover-tilt 的完整实现。' },
  { id: 'magicui/aurora-text', lib: 'magic-ui', title: 'Aurora Text', site: 'https://magicui.design/docs/components/aurora-text', install: 'npx shadcn@latest add "https://magicui.design/r/aurora-text.json"', tags: ['lex:aesthetic:aurora-gradient'], gate: 'green', stack: { framework: 'react', motion: 'framer-motion' }, note: '极光渐变流动字，标题级氛围担当。' },
  { id: 'magicui/marquee', lib: 'magic-ui', title: 'Marquee', site: 'https://magicui.design/docs/components/marquee', install: 'npx shadcn@latest add "https://magicui.design/r/marquee.json"', tags: ['lex:interaction:marquee'], gate: 'green', stack: { framework: 'react', motion: 'css' }, note: '无缝跑马灯，Logo 墙即插即用。' },
  { id: 'originui/dock', lib: 'origin-ui', title: 'Dock', site: 'https://coss.com/ui', install: 'npx shadcn@latest add "https://originui.com/r/dock.json"', tags: ['lex:layout:dock', 'lex:motion:spring'], gate: 'green', stack: { framework: 'react', motion: 'framer-motion' }, note: 'macOS 风格放大 dock。' },
  { id: 'hover/buttons', lib: 'hover-dev', title: 'Magnetic Button', site: 'https://hover.dev/components/buttons', install: '分类页复制代码', tags: ['lex:interaction:magnetic-button', 'lex:motion:spring'], gate: 'yellow', stack: { framework: 'react', motion: 'framer-motion' }, note: '磁吸 CTA，含 spring 回位。' },
  { id: 'uiverse/loaders', lib: 'uiverse', title: 'Shimmer Loader', site: 'https://uiverse.io/loaders', install: '复制 CSS', tags: ['lex:motion:shimmer'], gate: 'green', stack: { framework: 'css', motion: 'css' }, note: '纯 CSS 骨架屏占位。' },
  { id: 'gsap/scramble-text', lib: 'gsap', title: 'ScrambleTextPlugin', site: 'https://gsap.com/docs/v3/Plugins/ScrambleTextPlugin/', install: 'npm i gsap（3.13+ 全插件免费）', tags: ['lex:interaction:text-scramble'], gate: 'green', stack: { framework: 'js', motion: 'gsap' }, note: '解码乱码文字的工业级实现。' },
  { id: 'hover/pricing', lib: 'hover-dev', title: 'Pricing Sections', site: 'https://hover.dev/components/pricing', install: '分类页复制代码', tags: ['lex:component:pricing-table'], gate: 'yellow', stack: { framework: 'react', motion: 'framer-motion' }, note: '成套定价区块，三档结构现成。' },
  { id: 'shadcn/sonner', lib: 'shadcn', title: 'Sonner / Toast', site: 'https://ui.shadcn.com/docs/components/sonner', install: 'npx shadcn@latest add sonner', tags: ['lex:component:toast'], gate: 'green', stack: { framework: 'react', motion: '—' }, note: '吐司通知现成方案。' },
  { id: 'magicui/border-beam', lib: 'magic-ui', title: 'Border Beam', site: 'https://magicui.design/docs/components/border-beam', install: 'npx shadcn@latest add "https://magicui.design/r/border-beam.json"', tags: ['lex:interaction:spotlight-card'], gate: 'green', stack: { framework: 'react', motion: 'framer-motion' }, note: '沿边框流动的光束。' },
  { id: 'magicui/globe', lib: 'magic-ui', title: 'Globe', site: 'https://magicui.design/docs/components/globe', install: 'npx shadcn@latest add "https://magicui.design/r/globe.json"', tags: ['lex:interaction:parallax'], gate: 'green', stack: { framework: 'react', motion: 'three' }, note: 'Three.js 地球组件，展示型。' },
]

export const INDEX_FILTERS = {
  gate: ['green', 'yellow', 'red'],
  stack: ['react', 'css', 'icon', 'font', 'three', 'js'],
  axis: ['layout', 'interaction', 'aesthetic', 'motion', 'component'],
}

