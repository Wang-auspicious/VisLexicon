/**
 * 人工撰写的短简介、风格判断、获取路径。
 * 风格聚焦组件与视觉资产本身的界面美学与设计语言，不用网站营销文案。
 */

const VOICE = {
  'shadcn-ui': {
    lede: {
      zh: '开源组件注册表。CLI 将源码写入项目仓库。',
      en: 'Open-source component registry. The CLI writes source into the project.',
    },
    style: {
      zh: '极简主义。中性黑白。精细几何圆角。高对比排印。现代无头。',
      en: 'Minimalist. Monochrome neutral. Precision radii. High-contrast typography. Modern headless.',
    },
    acquire: {
      zh: [
        { k: '命令行', v: 'npx shadcn@latest add <name>' },
        { k: '产物', v: '源码入仓，非闭源依赖' },
      ],
      en: [
        { k: 'CLI', v: 'npx shadcn@latest add <name>' },
        { k: 'Output', v: 'Source in-repo, not a closed package' },
      ],
    },
  },
  '21st-dev': {
    lede: {
      zh: '社区组件注册表。预览后复制 Prompt、源文件、图像或 CLI。',
      en: 'Community component registry. Preview, then copy prompt, source, image, or CLI.',
    },
    style: {
      zh: '现代极简。新粗野主义。毛玻璃拟态。赛博霓虹。暗黑科技。微动效交互。',
      en: 'Modern minimalist. Neo-brutalism. Glassmorphism. Cyberpunk dark glow. Dark tech. Micro-interactions.',
    },
    acquire: {
      zh: [
        { k: 'Prompt', v: 'Copy prompt' },
        { k: '源文件', v: '*.tsx' },
        { k: '图像', v: 'Copy image' },
        { k: '命令行', v: 'Copy CLI command' },
        { k: '编辑器', v: 'Claude Code · Codex · Cursor · Replit · Lovable · Bolt.new · v0' },
      ],
      en: [
        { k: 'Prompt', v: 'Copy prompt' },
        { k: 'Source', v: '*.tsx' },
        { k: 'Image', v: 'Copy image' },
        { k: 'CLI', v: 'Copy CLI command' },
        { k: 'Editors', v: 'Claude Code · Codex · Cursor · Replit · Lovable · Bolt.new · v0' },
      ],
    },
  },
  'uiverse': {
    lede: { zh: '开源社区 UI 微交互库。复制 HTML、CSS 或 React。', en: 'Open community UI micro-interactions. Copy HTML, CSS, or React.' },
    summary: {
      zh: 'Uiverse 是一个开源社区驱动的前端 UI 微交互与视觉设计元素库，专注于汇集基于纯原生 CSS、Tailwind CSS 与 React 生态的高表现力组件。平台聚合全球开发者提交的免依赖交互片段，覆盖从基础原子级表单控件到复杂动态卡片的全栈资产。其核心价值在于为现代 Web 工程提供兼具前沿美学实验性与即插即用特性的无框架绑定代码实现。',
      en: 'Uiverse is an open-source, community-driven library of UI micro-interactions and visual elements, collecting high-expression components in native CSS, Tailwind CSS, and React. It aggregates dependency-free interaction snippets from developers worldwide, from atomic form controls to complex animated cards. Its value is framework-agnostic, copy-ready code that also serves as a testing ground for contemporary visual styles.',
    },
    tech: {
      zh: ['React', 'Tailwind CSS', '原生 CSS', 'Figma'],
      en: ['React', 'Tailwind CSS', 'Pure CSS', 'Figma'],
    },
    components: {
      zh: ['按钮', '复选框', '切换开关', '卡片', '加载动效', '输入框', '单选框', '表单', '纯代码背景纹理'],
      en: ['Buttons', 'Checkboxes', 'Toggle switches', 'Cards', 'Loaders', 'Inputs', 'Radio buttons', 'Forms', 'Patterns'],
    },
    style: {
      zh: '玻璃拟态。新拟态。新粗野主义。赛博霓虹。纯代码几何纹理。力学微交互。',
      en: 'Glassmorphism. Neumorphism. Neo-brutalism. Cyberpunk dark glow. Pure CSS shaders. Dynamic micro-interactions.',
    },
    stylePills: {
      zh: ['玻璃拟态', '新拟态', '新粗野主义', '赛博霓虹', '纯代码几何纹理', '力学微交互'],
      en: ['Glassmorphism', 'Neumorphism', 'Neo-brutalism', 'Cyberpunk dark glow', 'Pure CSS shaders', 'Dynamic micro-interactions'],
    },
    styleDetail: {
      zh: '玻璃拟态：毛玻璃与半透明折射。新拟态：软阴影微凸起质感。新粗野主义：高饱和撞色与硬边阴影。赛博霓虹与暗黑微光。纯代码生成几何纹理。复杂力学微交互。',
      en: 'Glassmorphism: frosted glass and translucent refraction. Neumorphism: soft extruded shadow. Neo-brutalism: saturated clash and hard-edge shadow. Cyberpunk dark glow. Procedural pure-CSS geometry. Dynamic micro-interactions.',
    },
  },
  'magic-ui': {
    lede: { zh: 'React 动效组件。经 shadcn CLI 安装。', en: 'React motion components. Installed via the shadcn CLI.' },
    style: {
      zh: '流光边框。粒子星空。发光渐变。微质感动效。深色科技。',
      en: 'Shimmer borders. Particle fields. Aurora glow. Micro-textures. Dark tech.',
    },
  },
  'origin-ui': {
    lede: { zh: '可复制 React 组件。现属 Coss UI。', en: 'Copyable React components. Now Coss UI.' },
    style: {
      zh: '极简功能主义。无样式原语。精细线框。中性低饱和。高可访问性。',
      en: 'Functional minimalist. Unstyled primitives. Fine wireframes. Neutral desaturated. High accessibility.',
    },
  },
  'hover-dev': {
    lede: { zh: 'CSS 动效与微交互示例。', en: 'CSS motion and micro-interaction examples.' },
    style: {
      zh: '3D 视差微交互。磁吸悬停。流畅过渡。创意动态卡片。现代暗色。',
      en: '3D tilt & parallax. Magnetic hover. Fluid transitions. Creative dynamic cards. Modern dark.',
    },
  },
  'entry-chakra-ui-react': {
    lede: { zh: 'React 组件库。npm 安装。', en: 'React component library. Installed from npm.' },
    style: {
      zh: '模块化组件系统。语义设计令牌。自适应深浅色。友好圆角。响应式布局。',
      en: 'Modular component system. Semantic design tokens. Adaptive dark/light. Friendly radii. Responsive layout.',
    },
  },
  'entry-ant-design-react': {
    lede: { zh: '企业级 React 组件库。', en: 'Enterprise React component library.' },
    style: {
      zh: '企业级中后台。严谨网格对齐。高信息密度。功能优先。专业中性蓝。',
      en: 'Enterprise UI. Strict grid alignment. High information density. Function-first. Professional corporate blue.',
    },
  },
  'entry-shadcn-studio-blocks': {
    lede: { zh: 'shadcn 风格页面区块。', en: 'shadcn-styled page blocks.' },
    style: {
      zh: '模块化页面区块。商业落地页美学。极简网格。自适应排版。精细线框。',
      en: 'Modular landing blocks. Commercial landing aesthetic. Clean grid. Responsive layout. Refined borders.',
    },
  },
  'base-ui': {
    lede: { zh: '无样式 React 原语。', en: 'Unstyled React primitives.' },
    style: {
      zh: '无样式底层原语。精细交互解剖。无障碍默认。零多余样式。灵活结构。',
      en: 'Unstyled base primitives. Anatomical interaction. Accessible defaults. Zero CSS opinion. Flexible composition.',
    },
  },
  'ariakit': {
    lede: { zh: '无样式无障碍 React 原语。', en: 'Unstyled accessible React primitives.' },
    style: {
      zh: '无样式无障碍底座。键盘导航优先。语义化解耦。紧凑无冗余。原生体验。',
      en: 'Unstyled accessibility foundation. Keyboard-first navigation. Semantic decoupling. Compact unopinionated. Native feel.',
    },
  },
  'heroui': {
    lede: { zh: 'React 组件库。品牌化默认样式。', en: 'React component library with branded defaults.' },
    style: {
      zh: '品牌化现代美学。柔和阴影粉彩。大圆角微质感。活泼高饱和。开箱即用。',
      en: 'Branded modern aesthetic. Soft shadows & pastels. Large radii & subtle textures. Vibrant accents. Ready-to-use.',
    },
  },
  'material-ui': {
    lede: { zh: 'Material Design React 实现。', en: 'Material Design for React.' },
    style: {
      zh: 'Material Design 3。表面高度分层。经典水波纹。完备主题化。高辨识度系统。',
      en: 'Material Design 3. Surface elevation layers. Classic ripple feedback. Full theming. Recognizable design language.',
    },
  },
  'motion': {
    lede: { zh: '跨框架动效库。原 Framer Motion。', en: 'Cross-framework motion library. Formerly Framer Motion.' },
    style: {
      zh: '真实物理弹簧阻尼。流畅共享布局过渡。交互打断手势响应。硬件加速丝滑。',
      en: 'Real physics spring damping. Fluid shared-layout transitions. Interruptible gesture responses. Hardware-accelerated smoothness.',
    },
  },
  'lucide': {
    lede: { zh: '开源图标集。描边几何。', en: 'Open icon set. Stroke geometry.' },
    style: {
      zh: '极简线性描边。统一 24 网格。圆角线端。现代中性。高度一致几何。',
      en: 'Minimalist outline stroke. Uniform 24-grid. Rounded line-caps. Modern neutral. Highly consistent geometry.',
    },
  },
  'phosphor-icons': {
    lede: { zh: '六字重开源图标家族。', en: 'Open icon family in six weights.' },
    style: {
      zh: '六字重多维阶梯。严谨几何线框。灵活双色调。现代全场景图标。',
      en: 'Six weight scales. Rigorous geometric wireframes. Flexible duotone. Modern versatile iconography.',
    },
  },
  'tabler-icons': {
    lede: { zh: 'MIT 线型 SVG 图标。源码免费。', en: 'MIT outline SVG icons. Source is free.' },
    style: {
      zh: '纯粹线性极简。统一像素网格。细线中性。高覆盖符号库。干净严谨。',
      en: 'Pure outline minimalism. Uniform pixel grid. Fine-line neutral. High-coverage symbols. Clean & strict.',
    },
  },
  'heroicons': {
    lede: { zh: 'Tailwind Labs 出品的 MIT 图标。', en: 'MIT icons from Tailwind Labs.' },
    style: {
      zh: 'Tailwind 官方调校。微尺寸优化。精巧实心与描边双模。现代轻量。',
      en: 'Tailwind-tuned. Micro-scale optimized. Refined solid & outline dual-mode. Modern lightweight.',
    },
  },
  'flowbite': {
    lede: { zh: 'Tailwind 组件。文档即目录。', en: 'Tailwind components. Docs as catalog.' },
    style: {
      zh: '实用主义 Tailwind 组件。清晰表单控件。干净中性灰阶。高密度信息层。商业标准。',
      en: 'Pragmatic Tailwind components. Clear form controls. Clean neutral grays. High-density information layers. Business standard.',
    },
  },
  'park-ui': {
    lede: { zh: '多框架组件。Ark 原语加样式。', en: 'Multi-framework components. Ark primitives with style.' },
    style: {
      zh: '跨框架设计系统。中性灰黑线框。多主题切换。严谨比例。现代工业风。',
      en: 'Cross-framework design system. Neutral monochrome wireframes. Multi-theme switching. Strict scales. Modern industrial.',
    },
  },
  'bits-ui': {
    lede: { zh: 'Svelte 无样式无障碍原语。', en: 'Unstyled accessible primitives for Svelte.' },
    style: {
      zh: 'Svelte 现代化无头原语。纯净状态机解耦。无障碍开箱。极简零侵入。',
      en: 'Svelte modern headless primitives. Pure state-driven decoupling. Accessible out-of-box. Minimalist non-intrusive.',
    },
  },
  'fluent-ui': {
    lede: { zh: 'Fluent 2 Web React 组件。', en: 'Fluent 2 Web React components.' },
    style: {
      zh: '微软 Fluent 2。亚克力半透明材质。细腻层级光影。克制圆角。现代办公美学。',
      en: 'Microsoft Fluent 2. Acrylic translucent materials. Subtle lighting elevation. Restrained radii. Modern workplace aesthetic.',
    },
  },
  'polaris': {
    lede: { zh: 'Shopify 管理界面参考。Web Components。', en: 'Shopify admin interface reference. Web Components.' },
    style: {
      zh: 'Shopify 电商中后台。任务驱动高密度。严密状态反馈。稳重商业绿。防错表单体系。',
      en: 'Shopify ecommerce admin. Task-driven high density. Clear state feedback. Stable merchant green. Error-preventing forms.',
    },
  },
  'primer': {
    lede: { zh: 'GitHub Primer 产品界面。', en: 'GitHub Primer product UI.' },
    style: {
      zh: 'GitHub 产品级组件。高对比等宽与排印。开发者中性。紧凑功能主义。深浅双模调校。',
      en: 'GitHub product design. High-contrast typography & mono. Developer neutral. Compact functionalism. Calibrated dark/light.',
    },
  },
  'nivo': {
    lede: { zh: 'React 数据可视化。可配置图表。', en: 'React data visualization. Configurable charts.' },
    style: {
      zh: '高表现力交互图表。柔和渐变色盘。流畅动态切换动画。丰富悬停提示卡。',
      en: 'Expressive interactive charts. Soft palette gradients. Fluid transition animations. Rich hover tooltips.',
    },
  },
  'laws-of-ux': {
    lede: { zh: '界面心理学定律卡片。', en: 'UX psychology law cards.' },
    style: {
      zh: '界面人机工学法则。心理学启发式卡片。极简图解规范。经典交互理论。',
      en: 'Ergonomic UX heuristics. Psychological law cards. Minimalist visual diagrams. Classic interaction theory.',
    },
  },
  'a11y-project': {
    lede: { zh: '无障碍清单与参考。', en: 'Accessibility checklists and reference.' },
    style: {
      zh: '无障碍实践标准。高对比度可读性。WCAG 遵从模式。读屏与焦点规范。',
      en: 'Accessibility best practices. High-contrast readability. WCAG compliance patterns. Screen-reader & focus specs.',
    },
  },
  'ecomm-design': {
    lede: { zh: '电商界面模式图鉴。', en: 'E-commerce interface patterns.' },
    style: {
      zh: '电商转化体验模式。商品详情陈列。快速结算流程。突出行动号召。',
      en: 'Ecommerce conversion patterns. Product detail display. Frictionless checkout. Prominent CTAs.',
    },
  },
  'radix-themes': {
    lede: { zh: '预样式 React 组件。主题与布局一包提供。', en: 'Pre-styled React components. Theme and layout in one package.' },
    style: {
      zh: '现代精密设计系统。科学排印比例。中性冷灰阶。细腻高光描边。高级工业感。',
      en: 'Modern precision design system. Scientific typography scales. Neutral cool grays. Subtle border highlights. Refined industrial feel.',
    },
  },
  'radix-primitives': {
    lede: { zh: '无样式无障碍 React 原语。', en: 'Unstyled accessible React primitives.' },
    style: {
      zh: '无样式底层状态原语。严苛无障碍标准。全键盘焦点流。无缝自由定制。',
      en: 'Unstyled headless primitives. Strict accessibility standards. Complete keyboard focus flow. Frictionless styling freedom.',
    },
  },
  'radix-icons': {
    lede: { zh: '15×15 开源线型图标。', en: '15×15 open outline icons.' },
    style: {
      zh: '15x15 紧凑精细。极简细线描边。微尺寸 UI 专用。致密克制。',
      en: '15x15 compact precision. Minimalist hairline stroke. Micro-scale UI dedicated. Dense & restrained.',
    },
  },
  'radix-colors': {
    lede: { zh: '为界面设计的开源色阶。', en: 'Open color scales for interface design.' },
    style: {
      zh: '无障碍对比度优先。12 级功能性明度。深浅自然对偶反转。科学系统调色。',
      en: 'Accessibility contrast first. 12-step functional lightness. Natural dark/light dual inversion. Scientific system palette.',
    },
  },
  daisyui: {
    lede: { zh: 'Tailwind 插件。语义 class 组件。', en: 'Tailwind plugin. Semantic class components.' },
    style: { zh: '浅色营销文档。多主题标本。圆角按钮。', en: 'Light marketing docs. Multi-theme specimens. Rounded buttons.' },
  },
  'headless-ui': {
    lede: { zh: 'Tailwind Labs 无样式组件。', en: 'Unstyled components from Tailwind Labs.' },
    style: {
      zh: 'Tailwind Labs 官方原语。过渡动画配对。无样式交互状态。精简纯净。',
      en: 'Tailwind Labs official primitives. Seamless transition pairings. Unstyled interactive states. Minimalist & pure.',
    },
  },
  'ark-ui': {
    lede: { zh: '无头组件。多框架。', en: 'Headless components. Multiple frameworks.' },
    style: {
      zh: '状态机驱动解耦。多框架一致体验。无样式底层。严密交互规范。',
      en: 'State machine driven architecture. Multi-framework consistency. Headless foundation. Strict interaction specs.',
    },
  },
  mantine: {
    lede: { zh: 'React 组件库。钩子与表单配套。', en: 'React components with hooks and forms.' },
    style: { zh: '浅色文档。蓝色强调。控件目录。', en: 'Light docs. Blue accent. Control catalog.' },
  },
  'react-aria': {
    lede: { zh: 'Adobe 无样式无障碍 React 钩子与组件。', en: 'Adobe unstyled accessible React hooks and components.' },
    style: {
      zh: 'Adobe 严谨无障碍。复杂跨平台交互。国际化自适应。底层行为原语。工业级健壮。',
      en: 'Adobe rigorous accessibility. Complex cross-platform interaction. Internationalized adaptive. Behavior primitives. Industrial robustness.',
    },
  },
  'aceternity-ui': {
    lede: { zh: 'React 与 Tailwind 动效组件。许可非 MIT。', en: 'React and Tailwind motion components. License is not MIT.' },
    style: {
      zh: '3D 视差卡片。流光溢彩渐变。深色星空粒子。发光交互描边。高视觉冲击。',
      en: '3D parallax cards. Aurora gradients. Dark starfield particles. Glowing interactive borders. High visual impact.',
    },
  },
  godly: {
    lede: { zh: '设计灵感目录。现名 Recent。', en: 'Design inspiration directory. Now Recent.' },
    style: { zh: '深色海报瀑布。大图优先。编辑式封面。', en: 'Dark poster masonry. Image-led. Editorial covers.' },
  },
  gsap: {
    lede: { zh: 'JavaScript 时间轴动画库。', en: 'JavaScript timeline animation library.' },
    style: { zh: '深色动效营销。全出血演示。高对比绿强调。', en: 'Dark motion marketing. Full-bleed demos. High-contrast green accent.' },
  },
  d3: {
    lede: { zh: '数据驱动文档的可视化库。', en: 'Visualization library for data-driven documents.' },
    style: { zh: '浅色文档。等宽代码。图表标本。', en: 'Light docs. Monospace code. Chart specimens.' },
  },
  remixicon: {
    lede: { zh: '开源图标集。线型与填色。许可非 MIT。', en: 'Open icon set. Outline and filled. License is not MIT.' },
    style: { zh: '浅色图标网格。几何描边。高密度。', en: 'Light icon grid. Geometric stroke. High density.' },
  },
  'animate-css': {
    lede: { zh: 'CSS 关键帧动画 class。', en: 'CSS keyframe animation classes.' },
    style: {
      zh: '即用型关键帧动效。经典弹跳翻转淡入。CSS 类名驱动。纯净零脚本。',
      en: 'Ready-to-use keyframe motion. Classic bounce/flip/fade. CSS class driven. Pure zero-script.',
    },
  },
  'web-dev': {
    lede: { zh: 'Chrome 团队的 Web 开发参考。', en: 'Web development reference from the Chrome team.' },
    style: {
      zh: '现代 Web 最佳实践。核心网页指标。标准可访问性。现代排版参考。',
      en: 'Modern Web best practices. Core Web Vitals. Standard accessibility. Modern typographic reference.',
    },
  },
  'inclusive-components': {
    lede: { zh: '包容性界面模式文章。', en: 'Inclusive interface pattern essays.' },
    style: {
      zh: '包容性无障碍模式。通俗语义结构。渐进增强体验。零样式偏见。',
      en: 'Inclusive accessibility patterns. Semantic HTML structures. Progressive enhancement. Zero-bias markup.',
    },
  },
  iconoir: {
    lede: { zh: '24 网格开源线型图标。', en: '24-grid open outline icons.' },
    style: { zh: '浅色图标网格。等线描边。留白宽。', en: 'Light icon grid. Even stroke. Generous whitespace.' },
  },
  'simple-icons': {
    lede: { zh: '品牌 SVG 图标集。', en: 'Brand SVG icons.' },
    style: {
      zh: '纯色品牌矢量标识。精确几何还原。单色平铺规范。开源公共领域。',
      en: 'Monochrome brand vectors. Exact geometric reproduction. Single-color flat standard. Open public domain.',
    },
  },
  rive: {
    lede: { zh: '交互矢量动画。运行时开源，导出收费。', en: 'Interactive vector animation. Runtime is open; export is paid.' },
    style: { zh: '深色产品营销。全出血动效。高饱和强调。', en: 'Dark product marketing. Full-bleed motion. Saturated accents.' },
  },
  lottiefiles: {
    lede: { zh: 'Lottie 播放器与格式文档。', en: 'Lottie player and format documentation.' },
    style: { zh: '浅色文档。卡片分区。中性。', en: 'Light docs. Carded sections. Neutral.' },
  },
  recharts: {
    lede: { zh: '基于 D3 的 React 图表组件。', en: 'React chart components built on D3.' },
    style: { zh: '浅色文档。图表标本。中性灰。', en: 'Light docs. Chart specimens. Neutral gray.' },
  },
  chartjs: {
    lede: { zh: 'Canvas 图表库。', en: 'Canvas charting library.' },
    style: { zh: '浅色文档。简单折线标本。品牌绿。', en: 'Light docs. Simple line specimens. Brand green.' },
  },
  'every-layout': {
    lede: { zh: 'CSS 布局原语与教程。入门免费。', en: 'CSS layout primitives and tutorials. Rudiments are free.' },
    style: {
      zh: '组合式 CSS 布局原语。内在响应式。网格与堆叠算法。弹性无断点美学。',
      en: 'Composable CSS layout primitives. Intrinsic responsiveness. Grid & stack algorithms. Breakpoint-free flexibility.',
    },
  },
  bootstrap: {
    lede: { zh: 'HTML、CSS 与 JS 前端工具包。', en: 'HTML, CSS, and JS frontend toolkit.' },
    style: { zh: '浅色文档。紫色强调。示例与代码并置。', en: 'Light docs. Purple accent. Example beside code.' },
  },
  'toools-design': {
    lede: { zh: '设计资源外链目录。', en: 'Outbound directory of design resources.' },
    style: {
      zh: '设计工具索引目录。分类卡片流。高辨识度工具标本。清晰信息架构。',
      en: 'Design tool directory. Categorized card streams. High-clarity tool specimens. Clean info architecture.',
    },
  },
  'tailwind-css': {
    lede: { zh: 'Utility-first CSS 框架。核心 MIT，Plus 另售。', en: 'Utility-first CSS framework. Core is MIT; Plus is paid.' },
    style: {
      zh: '实用优先原子样式。一致设计令牌。响应式断点系统。低抽象无冗余。',
      en: 'Utility-first atomic styling. Consistent design tokens. Responsive breakpoints. Zero-bloat low abstraction.',
    },
  },
  'panda-css': {
    lede: { zh: '构建期 CSS-in-JS 引擎。', en: 'Build-time CSS-in-JS engine.' },
    style: {
      zh: '构建期类型安全样式。CSS 配方模式。设计系统令牌。零运行时开销。',
      en: 'Build-time type-safe styling. CSS recipe patterns. Design system tokens. Zero-runtime overhead.',
    },
  },
  zagjs: {
    lede: { zh: '无样式、框架无关状态机。', en: 'Unstyled, framework-agnostic state machines.' },
    style: { zh: '深色文档。状态图演示。中性。', en: 'Dark docs. State-diagram demos. Neutral.' },
  },
  kobalte: {
    lede: { zh: 'SolidJS 无样式无障碍原语。', en: 'Unstyled accessible primitives for SolidJS.' },
    style: { zh: '深色文档。代码块优先。低饱和。', en: 'Dark docs. Code-first. Low saturation.' },
  },
  diceui: {
    lede: { zh: 'shadcn 扩展组件。经 CLI 复制。', en: 'shadcn extension components. Copied via CLI.' },
    style: { zh: '浅色文档。中性灰。控件标本。', en: 'Light docs. Neutral gray. Control specimens.' },
  },
  tremor: {
    lede: { zh: 'React 图表与仪表盘组件。核心 Apache-2.0。', en: 'React chart and dashboard components. Core is Apache-2.0.' },
    style: { zh: '浅色文档。图表标本。克制圆角。', en: 'Light docs. Chart specimens. Restrained radii.' },
  },
  shadcnblocks: {
    lede: { zh: 'shadcn 页面区块目录。许可禁止转售。', en: 'shadcn page-block catalog. License forbids resale.' },
    style: { zh: '浅色区块画廊。卡片网格。产品营销。', en: 'Light block gallery. Card grid. Product marketing.' },
  },
  'react-bits': {
    lede: { zh: 'React 动效组件。MIT 加 Commons Clause。', en: 'React motion components. MIT plus Commons Clause.' },
    style: {
      zh: '创意动效组件。渐变流光文字。3D 悬浮形变。动态网格背景。前沿交互质感。',
      en: 'Creative motion components. Animated gradient type. 3D float & deform. Dynamic mesh backgrounds. Cutting-edge feel.',
    },
  },
  threejs: {
    lede: { zh: 'JavaScript 3D 库。WebGL 与 WebGPU。', en: 'JavaScript 3D library. WebGL and WebGPU.' },
    style: { zh: '深色文档。等宽代码。示例网格。', en: 'Dark docs. Monospace code. Example grid.' },
  },
  animejs: {
    lede: { zh: 'JavaScript 动画引擎。MIT。', en: 'JavaScript animation engine. MIT.' },
    style: { zh: '浅色文档。大号演示字。时间轴标本。', en: 'Light docs. Oversized demo type. Timeline specimens.' },
  },
  visx: {
    lede: { zh: 'Airbnb 的 React 可视化原语。', en: 'Airbnb React visualization primitives.' },
    style: { zh: '浅色文档。图表标本。中性。', en: 'Light docs. Chart specimens. Neutral.' },
  },
  echarts: {
    lede: { zh: 'Apache 的 JavaScript 图表库。', en: 'Apache JavaScript charting library.' },
    style: { zh: '浅色文档。示例编辑器。品牌蓝。', en: 'Light docs. Example editor. Brand blue.' },
  },
  sonner: {
    lede: { zh: 'React 通知条。npm 安装。', en: 'React toast. Installed from npm.' },
    style: { zh: '浅色单页文档。现场通知标本。', en: 'Light single-page docs. Live toast specimens.' },
  },
  vaul: {
    lede: { zh: 'React 抽屉。基于 Radix Dialog。', en: 'React drawer. Built on Radix Dialog.' },
    style: { zh: '浅色单页文档。抽屉标本。', en: 'Light single-page docs. Drawer specimens.' },
  },
  'floating-ui': {
    lede: { zh: '锚点定位原语。提示与弹出层。', en: 'Anchor positioning primitives. Tooltips and popovers.' },
    style: {
      zh: '智能浮层锚点定位。边界自适应翻转。平滑箭头偏移。气泡与菜单底座。',
      en: 'Smart floating anchor positioning. Boundary flip & shift. Smooth arrow offset. Popover & menu foundation.',
    },
  },
  storybook: {
    lede: { zh: '组件工坊。核心 MIT。', en: 'Component workshop. Core is MIT.' },
    style: { zh: '浅色文档。粉紫强调。侧栏目录。', en: 'Light docs. Magenta accent. Sidebar catalog.' },
  },
  'adobe-spectrum': {
    lede: { zh: 'Adobe Spectrum 设计系统。React 实现 Apache-2.0。', en: 'Adobe Spectrum design system. React implementation is Apache-2.0.' },
    style: {
      zh: 'Adobe 工业级设计系统。大中型专业生产力工具。精细状态阶梯。无障碍全面达标。',
      en: 'Adobe industrial design system. Professional productivity scale. Precise state tiers. Total accessibility.',
    },
  },
  'atlassian-design': {
    lede: { zh: 'Atlassian 设计系统。组件 Apache-2.0，附加条款自定。', en: 'Atlassian Design System. Components Apache-2.0; add-ons custom.' },
    style: {
      zh: 'Atlassian 协作套件风格。敏捷项目看板。清晰任务状态徽章。标准企业灰蓝。',
      en: 'Atlassian collaborative suite style. Agile kanban boards. Clear status badges. Corporate slate blue.',
    },
  },
  carbon: {
    lede: { zh: 'IBM Carbon 设计系统。Apache-2.0。', en: 'IBM Carbon design system. Apache-2.0.' },
    style: { zh: '浅色企业文档。高密度。克制圆角。', en: 'Light enterprise docs. High density. Restrained radii.' },
  },
  unocss: {
    lede: { zh: '即时按需原子 CSS 引擎。', en: 'On-demand atomic CSS engine.' },
    style: { zh: '深色文档。等宽代码。中性。', en: 'Dark docs. Monospace code. Neutral.' },
  },
  webawesome: {
    lede: { zh: 'Web Awesome 组件。核心 MIT，Pro 付费。', en: 'Web Awesome components. Core is MIT; Pro is paid.' },
    style: { zh: '浅色文档。品牌橙。控件标本。', en: 'Light docs. Brand orange. Control specimens.' },
  },
  'semi-design': {
    lede: { zh: 'Semi Design React 组件。MIT。', en: 'Semi Design React components. MIT.' },
    style: {
      zh: '字节跳动企业级设计。友好微圆角。高清晰信息架构。平衡中性蓝。组件全场景覆盖。',
      en: 'ByteDance enterprise design. Friendly subtle radii. Clear information hierarchy. Balanced corporate blue. Comprehensive coverage.',
    },
  },
  iconify: {
    lede: { zh: '多套图标的统一框架。框架 MIT，图标集许可各异。', en: 'Unified framework over many icon sets. Framework is MIT; sets vary.' },
    style: { zh: '浅色图标网格。检索优先。中性。', en: 'Light icon grid. Search-first. Neutral.' },
  },
  'google-fonts': {
    lede: { zh: 'Google 字体目录。字族许可各异。', en: 'Google Fonts catalog. Family licenses vary.' },
    style: {
      zh: '全球化多文种字族。现代无衬线。经典衬线与展示字。排印分级完备。',
      en: 'Global multi-script families. Modern sans. Classic serif & display. Complete typographic hierarchy.',
    },
  },
  fontsource: {
    lede: { zh: '自托管字体 npm 包。包装 MIT。', en: 'Self-hosted font npm packages. Packaging is MIT.' },
    style: { zh: '浅色文档。字体目录。中性。', en: 'Light docs. Font directory. Neutral.' },
  },
  coolors: {
    lede: { zh: '配色生成器。专有 SaaS。', en: 'Palette generator. Proprietary SaaS.' },
    style: { zh: '浅色工具台。大色块。高对比。', en: 'Light tool surface. Large swatches. High contrast.' },
  },
  'open-color': {
    lede: { zh: '开源色阶。MIT。', en: 'Open color scales. MIT.' },
    style: {
      zh: '为 UI 优化的开源色板。精细 10 级明度阶梯。自然饱和度曲线。高对比可读。',
      en: 'UI-optimized open color palette. 10-step precision lightness scale. Natural saturation curve. High contrast readability.',
    },
  },
  'embla-carousel': {
    lede: { zh: '无样式轮播库。MIT。', en: 'Unstyled carousel library. MIT.' },
    style: {
      zh: '极简物理惯性轮播。丝滑手势拖拽。无内置样式。高度可插拔架构。',
      en: 'Minimalist physical inertia carousel. Silky touch drag. Unstyled foundation. Highly pluggable architecture.',
    },
  },
  swiper: {
    lede: { zh: '轮播库。核心 MIT，Studio 付费。', en: 'Carousel library. Core is MIT; Studio is paid.' },
    style: { zh: '浅色营销文档。大号演示。品牌蓝。', en: 'Light marketing docs. Large demos. Brand blue.' },
  },
  lenis: {
    lede: { zh: '平滑滚动库。MIT。', en: 'Smooth-scroll library. MIT.' },
    style: { zh: '深色全出血营销。大号无衬线。动效即内容。', en: 'Dark full-bleed marketing. Oversized sans. Motion as content.' },
  },
  'observable-plot': {
    lede: { zh: 'Observable 的简明图表语法。ISC。', en: 'Concise chart grammar from Observable. ISC.' },
    style: {
      zh: '统计图形语法。高信息墨水比。极简坐标系。学术探索级严谨。',
      en: 'Grammar of graphics. High data-ink ratio. Clean coordinate systems. Rigorous exploratory stats.',
    },
  },
  apexcharts: {
    lede: { zh: 'JavaScript 图表。双许可，营收上限。', en: 'JavaScript charts. Dual license with a revenue cap.' },
    style: { zh: '浅色营销文档。大号图表标本。品牌蓝。', en: 'Light marketing docs. Large chart specimens. Brand blue.' },
  },
  downshift: {
    lede: { zh: '无样式下拉与组合框原语。MIT。', en: 'Unstyled select and combobox primitives. MIT.' },
    style: { zh: '浅色文档。代码与演示并置。', en: 'Light docs. Code beside demo.' },
  },
  'react-select': {
    lede: { zh: 'React 选择器组件。MIT。', en: 'React select component. MIT.' },
    style: {
      zh: '灵活多选组合框。异步数据过滤。自适应下拉气泡。高度可定制样式。',
      en: 'Flexible multi-select combobox. Async data filtering. Adaptive dropdown menu. Highly customizable.',
    },
  },
  'tanstack-table': {
    lede: { zh: '无头表格。MIT。本条只收 Table。', en: 'Headless table. MIT. This entry is Table only.' },
    style: {
      zh: '无头表格核心。完全自由 UI 定制。多维排序过滤。轻量解耦无样式。',
      en: 'Headless table engine. Complete UI styling freedom. Multi-column sort/filter. Lightweight unstyled.',
    },
  },
  'ag-grid': {
    lede: { zh: '数据表格。Community MIT，Enterprise 收费。', en: 'Data grid. Community is MIT; Enterprise is paid.' },
    style: {
      zh: '高密度企业级数据网格。固定表头列冻结。虚拟滚动极速渲染。复杂数据操作。',
      en: 'High-density enterprise data grid. Pinned headers & columns. Virtual scroll fast render. Complex data ops.',
    },
  },
  cva: {
    lede: { zh: 'Class Variance Authority。Apache-2.0。', en: 'Class Variance Authority. Apache-2.0.' },
    style: { zh: '浅色文档。等宽代码。留白宽。', en: 'Light docs. Monospace code. Generous whitespace.' },
  },
  'elastic-ui': {
    lede: { zh: 'Elastic UI。SSPL 或 Elastic-2.0，源码可见。', en: 'Elastic UI. SSPL or Elastic-2.0; source-available.' },
    style: {
      zh: 'Elastic 大规模数据监控。紧凑暗黑亮色仪表盘。密集指标卡片。运维级稳健。',
      en: 'Elastic large-scale data monitoring. Dense dark/light dashboards. Compact metric cards. Ops-grade robust.',
    },
  },
  tdesign: {
    lede: { zh: 'TDesign React 组件。MIT。本条只收 React。', en: 'TDesign React components. MIT. This entry is React only.' },
    style: { zh: '浅色文档。品牌蓝。控件标本。', en: 'Light docs. Brand blue. Control specimens.' },
  },
  'arco-design': {
    lede: { zh: 'Arco Design React 组件。MIT。本条只收 React。', en: 'Arco Design React components. MIT. This entry is React only.' },
    style: {
      zh: '企业级产品界面。清晰层次。克制投影。结构化排版。现代专业中性。',
      en: 'Enterprise product UI. Clear hierarchy. Restrained shadows. Structured typography. Modern professional neutral.',
    },
  },
  'naive-ui': {
    lede: { zh: 'Vue 3 组件库。MIT。', en: 'Vue 3 component library. MIT.' },
    style: {
      zh: 'Vue 3 轻量灵动。青色强调。极简线框。细腻悬停反馈。平滑转场。',
      en: 'Vue 3 agile aesthetic. Teal accent. Clean wireframes. Subtle hover feedback. Smooth transitions.',
    },
  },
  'element-plus': {
    lede: { zh: 'Vue 3 组件库。MIT。', en: 'Vue 3 component library. MIT.' },
    style: {
      zh: '国内企业级经典规范。明亮主蓝。紧凑表单表格。高识别度状态色。标准中后台。',
      en: 'Classic enterprise standard. Bright primary blue. Compact forms & tables. High-clarity status signals. Standard admin UI.',
    },
  },
  vuetify: {
    lede: { zh: 'Vuetify。核心 MIT，One 与模板另售。', en: 'Vuetify. Core is MIT; One and templates are paid.' },
    style: { zh: '浅色文档。Material 密度。品牌蓝。', en: 'Light docs. Material density. Brand blue.' },
  },
  quasar: {
    lede: { zh: 'Quasar Vue 组件。MIT。', en: 'Quasar Vue components. MIT.' },
    style: { zh: '浅色文档。品牌蓝。控件标本。', en: 'Light docs. Brand blue. Control specimens.' },
  },
  primereact: {
    lede: { zh: 'PrimeReact。现行专有许可，Community 有门槛。', en: 'PrimeReact. Current license is proprietary; Community has conditions.' },
    style: { zh: '浅色文档。品牌蓝。控件标本。', en: 'Light docs. Brand blue. Control specimens.' },
  },
  primevue: {
    lede: { zh: 'PrimeVue。现行专有许可，Community 有门槛。', en: 'PrimeVue. Current license is proprietary; Community has conditions.' },
    style: { zh: '浅色文档。品牌蓝。控件标本。', en: 'Light docs. Brand blue. Control specimens.' },
  },
  vant: {
    lede: { zh: 'Vue 3 移动端组件。MIT。', en: 'Vue 3 mobile components. MIT.' },
    style: { zh: '浅色文档。品牌蓝。移动控件标本。', en: 'Light docs. Brand blue. Mobile control specimens.' },
  },
  nutui: {
    lede: { zh: '京东 NutUI Vue H5 组件。MIT。本条不含 Taro。', en: 'JD NutUI Vue H5 components. MIT. This entry excludes Taro.' },
    style: { zh: '浅色文档。品牌红。移动控件标本。', en: 'Light docs. Brand red. Mobile control specimens.' },
  },
  'theatre-js': {
    lede: { zh: '动画编排。core Apache-2.0，studio AGPL。', en: 'Animation sequencing. Core is Apache-2.0; studio is AGPL.' },
    style: {
      zh: '电影级三维动效编排。关键帧时间轴曲线。复杂交互状态联动。高表现力叙事。',
      en: 'Cinematic 3D motion choreography. Keyframe timeline curves. Complex state orchestration. High-expression narrative.',
    },
  },
  'auto-animate': {
    lede: { zh: '零配置入场动画。MIT。', en: 'Zero-config enter/leave animation. MIT.' },
    style: {
      zh: '零配置平滑过渡。列表增删自适应。布局形变自动补间。极简自然。',
      en: 'Zero-config smooth transitions. Adaptive list inserts/deletes. Automatic layout morphing. Minimalist natural.',
    },
  },
  barba: {
    lede: { zh: '页面过渡库。MIT。', en: 'Page-transition library. MIT.' },
    style: { zh: '浅色文档。过渡演示。中性。', en: 'Light docs. Transition demos. Neutral.' },
  },
  fontshare: {
    lede: { zh: '可商用字体目录。Satoshi 闭源。', en: 'Commercial-free font catalog. Satoshi is closed source.' },
    style: { zh: '浅色字体标本。大号字样。编辑式。', en: 'Light type specimens. Oversized samples. Editorial.' },
  },
  p5js: {
    lede: { zh: '创意编程库。GNU LGPL-2.1。', en: 'Creative-coding library. GNU LGPL-2.1.' },
    style: { zh: '浅色文档。示例网格。品牌粉。', en: 'Light docs. Example grid. Brand pink.' },
  },
  pixijs: {
    lede: { zh: '2D WebGL 渲染器。MIT。', en: '2D WebGL renderer. MIT.' },
    style: { zh: '深色营销文档。示例网格。高饱和。', en: 'Dark marketing docs. Example grid. Saturated.' },
  },
  paperjs: {
    lede: { zh: '矢量图形脚本。MIT。', en: 'Vector graphics scripting. MIT.' },
    style: { zh: '浅色文档。示例画廊。中性。', en: 'Light docs. Example gallery. Neutral.' },
  },
  twojs: {
    lede: { zh: '二维绘图 API。MIT。', en: 'Two-dimensional drawing API. MIT.' },
    style: { zh: '浅色文档。示例网格。中性。', en: 'Light docs. Example grid. Neutral.' },
  },
  konva: {
    lede: { zh: '2D Canvas 框架。MIT。', en: '2D canvas framework. MIT.' },
    style: { zh: '浅色文档。代码与画布并置。', en: 'Light docs. Code beside canvas.' },
  },
  fabricjs: {
    lede: { zh: 'Canvas 对象模型。MIT。', en: 'Canvas object model. MIT.' },
    style: { zh: '浅色文档。交互画布标本。', en: 'Light docs. Interactive canvas specimens.' },
  },
  'matter-js': {
    lede: { zh: '2D 刚体物理引擎。MIT。', en: '2D rigid-body physics engine. MIT.' },
    style: {
      zh: '2D 真实刚体物理。碰撞回弹模拟。重力与绳索约束。高交互物理质感。',
      en: '2D rigid body physics. Collision & bounce simulation. Gravity & rope constraints. Tactile physical feel.',
    },
  },
  spline: {
    lede: { zh: '3D 设计编辑器。编辑器专有，React 包装 MIT。', en: '3D design editor. Editor is proprietary; React wrapper is MIT.' },
    style: { zh: '深色产品营销。全出血 3D。高饱和。', en: 'Dark product marketing. Full-bleed 3D. Saturated.' },
  },
  framework7: {
    lede: { zh: '移动端 HTML 框架。MIT。', en: 'Mobile HTML framework. MIT.' },
    style: { zh: '浅色文档。品牌红。移动控件标本。', en: 'Light docs. Brand red. Mobile control specimens.' },
  },
  'react-hook-form': {
    lede: { zh: 'React 表单钩子。MIT。', en: 'React form hooks. MIT.' },
    style: {
      zh: '高性能表单钩子。实时校验提示。微错误标记。流畅响应式输入。',
      en: 'High-performance form hooks. Real-time validation cues. Subtle error marks. Smooth responsive input.',
    },
  },
  formik: {
    lede: { zh: 'React 表单库。Apache-2.0。', en: 'React form library. Apache-2.0.' },
    style: { zh: '浅色文档。品牌蓝。API 页。', en: 'Light docs. Brand blue. API pages.' },
  },
  'react-spring': {
    lede: { zh: 'React 弹簧动画。MIT。与 Motion 不是同一库。', en: 'React spring animation. MIT. Distinct from Motion.' },
    style: {
      zh: '弹簧力学算法。无缝中断连续。高频流畅渲染。物理真实感交互。',
      en: 'Spring physics algorithms. Seamless continuous interruption. High-frequency fluid render. Tactile natural motion.',
    },
  },
  'use-gesture': {
    lede: { zh: '指针与手势钩子。MIT。', en: 'Pointer and gesture hooks. MIT.' },
    style: {
      zh: '细腻多点触摸。平滑拖放惯性。手势缩放旋转。精准位移捕捉。',
      en: 'Refined multi-touch. Smooth drag inertia. Pinch-to-zoom & rotate. Precision delta capture.',
    },
  },
  'pico-css': {
    lede: { zh: '语义 HTML 的极简 CSS 框架。MIT。', en: 'Minimal CSS framework for semantic HTML. MIT.' },
    style: {
      zh: '语义化纯 HTML 极简主义。优雅默认排版。原生无类名。明暗优雅自动适应。',
      en: 'Semantic HTML minimalism. Elegant default typography. Classless native. Clean dark/light auto-adaptation.',
    },
    acquire: {
      zh: [
        { k: '样式表', v: 'css/pico.min.css' },
        { k: '命令行', v: 'npm install @picocss/pico' },
      ],
      en: [
        { k: 'Stylesheet', v: 'css/pico.min.css' },
        { k: 'CLI', v: 'npm install @picocss/pico' },
      ],
    },
  },
  bulma: {
    lede: { zh: 'Flexbox CSS 框架。MIT。', en: 'Flexbox CSS framework. MIT.' },
    style: { zh: '浅色营销。超大无衬线标题。浮层粉彩标签。青绿主按钮。径向构造线。', en: 'Light marketing. Oversized sans title. Floating pastel tags. Teal primary button. Radial construction lines.' },
    acquire: {
      zh: [
        { k: '下载', v: 'bulma-1.0.4.zip' },
        { k: '命令行', v: 'npm install bulma' },
      ],
      en: [
        { k: 'Download', v: 'bulma-1.0.4.zip' },
        { k: 'CLI', v: 'npm install bulma' },
      ],
    },
  },
  tiptap: {
    lede: { zh: '无样式富文本编辑器框架。核心 MIT，Cloud 另售。', en: 'Headless rich-text editor framework. Core is MIT; Cloud is paid.' },
    style: { zh: '浅色产品营销。超大无衬线配斜体强调。柔和青绿光晕。胶囊导航。现场编辑器标本。', en: 'Light product marketing. Oversized sans with italic emphasis. Soft teal-green glow. Capsule nav. Live editor specimen.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install @tiptap/core' }],
      en: [{ k: 'CLI', v: 'npm install @tiptap/core' }],
    },
  },
  leaflet: {
    lede: { zh: '交互地图库。BSD-2-Clause。', en: 'Interactive map library. BSD-2-Clause.' },
    style: { zh: '浅色文档首页。衬线字标。绿色导航。嵌入 OSM 地图标本。', en: 'Light documentation homepage. Serif wordmark. Green navigation. Embedded OSM map specimen.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install leaflet' }],
      en: [{ k: 'CLI', v: 'npm install leaflet' }],
    },
  },
  'dnd-kit': {
    lede: { zh: '无样式拖放原语。MIT。', en: 'Unstyled drag-and-drop primitives. MIT.' },
    style: {
      zh: '现代触摸友好拖放。微动效碰撞回弹。排序列表与看板。无障碍键盘拖放。',
      en: 'Modern touch-friendly drag-and-drop. Collision bounce micro-motion. Sortable lists & boards. Accessible keyboard DnD.',
    },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install @dnd-kit/dom' }],
      en: [{ k: 'CLI', v: 'npm install @dnd-kit/dom' }],
    },
  },
  driverjs: {
    lede: { zh: '产品导览库。MIT。', en: 'Product-tour library. MIT.' },
    style: { zh: '高饱和黄英雄区。粗无衬线字标。角色插画。黑底滚动条。双胶囊按钮。', en: 'High-chroma yellow hero. Bold sans wordmark. Character illustration. Black ticker. Dual capsule buttons.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install driver.js' }],
      en: [{ k: 'CLI', v: 'npm install driver.js' }],
    },
  },
  babylonjs: {
    lede: { zh: 'WebGL 与 WebGPU 3D 引擎。Apache-2.0。', en: 'WebGL and WebGPU 3D engine. Apache-2.0.' },
    style: { zh: '深色产品营销。全出血星轨。等轴测立方徽标。轮播标题。', en: 'Dark product marketing. Full-bleed star trails. Isometric cube mark. Carousel title.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install babylonjs' }],
      en: [{ k: 'CLI', v: 'npm install babylonjs' }],
    },
  },
  'new-css': {
    lede: { zh: '无 class 的语义 HTML CSS 框架。MIT。', en: 'Classless CSS for semantic HTML. MIT.' },
    style: {
      zh: '极简无 class 默认皮肤。轻盈排印排版。原生表单优化。零配置纯净。',
      en: 'Ultra-minimal classless default skin. Clean typography layout. Native form polish. Zero-config pure.',
    },
    acquire: {
      zh: [
        { k: '样式表', v: 'cdn.jsdelivr.net/npm/@exampledev/new.css' },
        { k: '命令行', v: 'npm install @xz/new.css' },
      ],
      en: [
        { k: 'Stylesheet', v: 'cdn.jsdelivr.net/npm/@exampledev/new.css' },
        { k: 'CLI', v: 'npm install @xz/new.css' },
      ],
    },
  },
  'react-bootstrap': {
    lede: { zh: 'Bootstrap 的 React 组件。MIT。', en: 'Bootstrap components for React. MIT.' },
    style: {
      zh: 'React 原生 Bootstrap 5。经典通用组件。无多余依赖。标准工业基底。',
      en: 'React native Bootstrap 5. Classic general components. Zero extra dependencies. Standard industrial base.',
    },
    acquire: { zh: [{ k: '命令行', v: 'npm install react-bootstrap bootstrap' }], en: [{ k: 'CLI', v: 'npm install react-bootstrap bootstrap' }] },
  },
  'semantic-ui': {
    lede: { zh: '语义化 CSS 组件框架。MIT。', en: 'Semantic CSS component framework. MIT.' },
    style: {
      zh: '自然语言类名组件。清晰层级。经典微圆角。友好语义化。',
      en: 'Natural language semantic classes. Clear hierarchy. Classic soft radii. Friendly semantics.',
    },
    acquire: { zh: [{ k: '命令行', v: 'npm install semantic-ui' }], en: [{ k: 'CLI', v: 'npm install semantic-ui' }] },
  },
  refine: {
    lede: { zh: 'React 后台框架。核心 MIT，AI/Pro 另售。', en: 'React admin framework. Core is MIT; AI/Pro is paid.' },
    style: { zh: '深色产品营销。青绿强调。Cookie 弹层。提示输入框。', en: 'Dark product marketing. Teal accent. Cookie modal. Prompt input.' },
    acquire: { zh: [{ k: '命令行', v: 'npm install @refinedev/core' }], en: [{ k: 'CLI', v: 'npm install @refinedev/core' }] },
  },
  'jquery-ui': {
    lede: { zh: 'jQuery 界面控件。MIT。', en: 'jQuery UI widgets. MIT.' },
    style: {
      zh: 'Web 经典时代控件。拟物灰阶滑块。系统窗体边框。历史标本风格。',
      en: 'Classic Web era controls. Skeuomorphic gray sliders. System window chrome. Historical specimen style.',
    },
    acquire: { zh: [{ k: '下载', v: 'Custom Download v1.14.2' }], en: [{ k: 'Download', v: 'Custom Download v1.14.2' }] },
  },
  'material-react-table': {
    lede: { zh: 'Material UI 与 TanStack Table 的 React 表。MIT。', en: 'React table on Material UI and TanStack Table. MIT.' },
    style: {
      zh: 'Material 现代数据表格。丰富开箱功能。紧凑与舒适模式。现代阴影层级。',
      en: 'Material modern data tables. Rich built-in features. Compact & comfortable modes. Modern elevation.',
    },
    acquire: { zh: [{ k: '命令行', v: 'npm i material-react-table' }], en: [{ k: 'CLI', v: 'npm i material-react-table' }] },
  },
  gridstack: {
    lede: { zh: '拖放仪表盘网格。MIT。', en: 'Drag-and-drop dashboard grid. MIT.' },
    style: { zh: '浅色渐变营销。超大无衬线标题。紫胶囊按钮。', en: 'Light gradient marketing. Oversized sans title. Purple capsule button.' },
    acquire: { zh: [{ k: '命令行', v: 'npm install gridstack' }], en: [{ k: 'CLI', v: 'npm install gridstack' }] },
  },
  moveable: {
    lede: { zh: '可拖放缩放旋转的变换控件。MIT。', en: 'Draggable, resizable, rotatable transform control. MIT.' },
    style: { zh: '白画布编辑器。标尺。蓝变换框。黑底操作条。', en: 'White editor canvas. Rulers. Blue transform box. Black action bar.' },
    acquire: { zh: [{ k: '命令行', v: 'npm install moveable' }], en: [{ k: 'CLI', v: 'npm install moveable' }] },
  },
  'shopify-draggable': {
    lede: { zh: 'Shopify 拖放库。MIT。', en: 'Shopify drag-and-drop library. MIT.' },
    style: {
      zh: '弹性拖放排序。镜像占位镜像。流畅落位补间。友好移动端拖拽。',
      en: 'Elastic drag & drop sort. Mirror placeholder. Smooth drop tweening. Friendly mobile drag.',
    },
    acquire: { zh: [{ k: '命令行', v: 'npm install @shopify/draggable' }], en: [{ k: 'CLI', v: 'npm install @shopify/draggable' }] },
  },
  'react-modal': {
    lede: { zh: 'React 无障碍对话框。MIT。', en: 'Accessible React modal. MIT.' },
    style: {
      zh: '无障碍弹出对话框。背景遮罩锁定。焦点陷阱管理。无预设极简结构。',
      en: 'Accessible modal dialog. Backdrop scroll lock. Focus trap management. Unopinionated minimalist.',
    },
    acquire: { zh: [{ k: '命令行', v: 'npm install react-modal' }], en: [{ k: 'CLI', v: 'npm install react-modal' }] },
  },
  'react-joyride': {
    lede: { zh: 'React 产品导览。MIT。', en: 'React product tours. MIT.' },
    style: {
      zh: '向导导览提示框。高亮聚焦点。步骤指示指示器。友好引导气泡。',
      en: 'Product tour tooltips. Highlight spotlight. Step indicators. Friendly guiding bubbles.',
    },
    acquire: { zh: [{ k: '命令行', v: 'npm install react-joyride' }], en: [{ k: 'CLI', v: 'npm install react-joyride' }] },
  },
  'air-datepicker': {
    lede: { zh: '无依赖的 JavaScript 日期选择器。MIT。', en: 'Dependency-free JavaScript datepicker. MIT.' },
    style: {
      zh: '现代轻巧月历。圆角平滑翻页。范围高亮选中。简洁清新排印。',
      en: 'Modern lightweight calendar. Smooth page flip. Range highlight selection. Clean fresh typography.',
    },
    acquire: { zh: [{ k: '命令行', v: 'npm i air-datepicker -S' }], en: [{ k: 'CLI', v: 'npm i air-datepicker -S' }] },
  },
  'react-datepicker': {
    lede: { zh: 'React 日期选择组件。MIT。', en: 'React datepicker component. MIT.' },
    style: {
      zh: '经典日期与时间选择。弹出式月历。快捷预设范围。实用通用风格。',
      en: 'Classic date & time picker. Popover calendar. Quick preset ranges. Pragmatic universal.',
    },
    acquire: { zh: [{ k: '命令行', v: 'npm install react-datepicker --save' }], en: [{ k: 'CLI', v: 'npm install react-datepicker --save' }] },
  },
  'react-dnd': {
    lede: { zh: 'React 拖放原语。MIT。', en: 'React drag-and-drop primitives. MIT.' },
    style: {
      zh: 'HTML5 拖放原语。数据驱动拖放层。复杂嵌套拖放结构。',
      en: 'HTML5 drag-and-drop primitives. Data-driven drag layers. Complex nested DnD structures.',
    },
    acquire: { zh: [{ k: '命令行', v: 'npm install react-dnd' }], en: [{ k: 'CLI', v: 'npm install react-dnd' }] },
  },
  select2: {
    lede: { zh: '可搜索的 select 替换。MIT。', en: 'Searchable select replacement. MIT.' },
    style: { zh: '深灰文档。红蓝菱形徽标。描边按钮。四宫格卡片。', en: 'Dark-gray docs. Red-blue diamond mark. Outlined buttons. Four-up cards.' },
    acquire: { zh: [{ k: '命令行', v: 'npm install select2' }], en: [{ k: 'CLI', v: 'npm install select2' }] },
  },
  'a11y-dialog': {
    lede: { zh: '无障碍对话框脚本。MIT。', en: 'Accessible dialog script. MIT.' },
    style: {
      zh: '轻巧严谨无障碍弹窗。原生层级焦点流动。无侵入极简脚本。',
      en: 'Lightweight rigorous a11y dialog. Native focus flow. Non-intrusive minimalist script.',
    },
    acquire: { zh: [{ k: '命令行', v: 'npm install a11y-dialog' }], en: [{ k: 'CLI', v: 'npm install a11y-dialog' }] },
  },
  notistack: {
    lede: { zh: 'React 通知条。MIT。', en: 'React snackbars. MIT.' },
    style: { zh: '浅色营销。绿方徽标。蓝主按钮。圆形指标。', en: 'Light marketing. Green square mark. Blue primary. Circular metrics.' },
    acquire: { zh: [{ k: '命令行', v: 'npm install notistack' }], en: [{ k: 'CLI', v: 'npm install notistack' }] },
  },
  fancybox: {
    lede: { zh: 'JavaScript 灯箱。现行专有许可。', en: 'JavaScript lightbox. Current license is proprietary.' },
    style: { zh: '浅色文档。左侧目录。橙红导航。正文列表。', en: 'Light docs. Left-hand TOC. Orange-red nav. Body list.' },
    acquire: { zh: [{ k: '许可', v: 'Fancyapps UI，单站 €29' }], en: [{ k: 'License', v: 'Fancyapps UI, Single €29' }] },
  },
  'yet-another-react-lightbox': {
    lede: { zh: 'React 灯箱组件。MIT。', en: 'React lightbox component. MIT.' },
    style: {
      zh: '沉浸式画廊灯箱。平滑缩放手势。触摸滑动切换。深色聚焦点。',
      en: 'Immersive gallery lightbox. Smooth zoom gestures. Touch swipe flip. Dark focused stage.',
    },
    acquire: { zh: [{ k: '命令行', v: 'npm install yet-another-react-lightbox' }], en: [{ k: 'CLI', v: 'npm install yet-another-react-lightbox' }] },
  },
  vega: {
    lede: { zh: '可视化语法。BSD-3-Clause。', en: 'Visualization grammar. BSD-3-Clause.' },
    style: { zh: '浅色学术文档。靛蓝顶栏。可视化标本墙。衬线标题。', en: 'Light academic docs. Indigo top bar. Visualization specimen wall. Serif titles.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install vega' }],
      en: [{ k: 'CLI', v: 'npm install vega' }],
    },
  },
  tabler: {
    lede: { zh: 'Bootstrap 后台模板。开源 MIT，Pro 另售。', en: 'Bootstrap admin template. MIT for the OSS kit; Pro is paid.' },
    style: { zh: '深色营销。超大无衬线标题。饱和蓝主按钮。顶栏渐变促销条。订阅弹层压在仪表盘标本上。', en: 'Dark marketing. Oversized sans title. Saturated blue primary. Gradient promo bar. Subscribe modal over a dashboard specimen.' },
    acquire: {
      zh: [
        { k: '命令行', v: 'npm install @tabler/core' },
        { k: '下载', v: '开源模板 ZIP' },
      ],
      en: [
        { k: 'CLI', v: 'npm install @tabler/core' },
        { k: 'Download', v: 'OSS template ZIP' },
      ],
    },
  },
  'react-day-picker': {
    lede: { zh: 'React 日期选择组件。MIT。', en: 'React date picker. MIT.' },
    style: {
      zh: '无障碍多功能日历。WAI-ARIA 合规。单选与区间模式。纯净可定制单元格。',
      en: 'Accessible multi-mode calendar. WAI-ARIA compliant. Single & range selection. Clean customizable cells.',
    },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install @daypicker/react' }],
      en: [{ k: 'CLI', v: 'npm install @daypicker/react' }],
    },
  },
  photoswipe: {
    lede: { zh: 'JavaScript 图库灯箱。MIT。', en: 'JavaScript image gallery and lightbox. MIT.' },
    style: { zh: '浅色画廊首页。超大无衬线字标。风景拼图标本。细线顶栏。', en: 'Light gallery homepage. Oversized sans wordmark. Landscape mosaic specimen. Hairline top bar.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install photoswipe' }],
      en: [{ k: 'CLI', v: 'npm install photoswipe' }],
    },
  },
  splide: {
    lede: { zh: '无依赖无障碍轮播。MIT。', en: 'Dependency-free accessible carousel. MIT.' },
    style: { zh: '高饱和黄绿全出血。几何菱形徽标。居中卡片。双黑底胶囊按钮。', en: 'High-chroma yellow-green full bleed. Geometric diamond mark. Centered card. Dual black capsule buttons.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install @splidejs/splide' }],
      en: [{ k: 'CLI', v: 'npm install @splidejs/splide' }],
    },
  },
  milligram: {
    lede: { zh: '极简 CSS 框架。MIT。', en: 'Minimalist CSS framework. MIT.' },
    style: { zh: '浅灰极简。紫色水滴徽标。居中标题。单一紫主按钮。Carbon 广告卡。', en: 'Light-gray minimal. Purple drop mark. Centered title. Single purple primary. Carbon ad card.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install milligram' }],
      en: [{ k: 'CLI', v: 'npm install milligram' }],
    },
  },
  'vanilla-extract': {
    lede: { zh: '零运行时 CSS-in-TypeScript。MIT。', en: 'Zero-runtime CSS-in-TypeScript. MIT.' },
    style: {
      zh: '零运行时类型安全样式。主题变量分发。构建期 CSS 输出。严谨系统化。',
      en: 'Zero-runtime type-safe styles. Theme contract distribution. Build-time static CSS. Strict systematic.',
    },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install @vanilla-extract/css' }],
      en: [{ k: 'CLI', v: 'npm install @vanilla-extract/css' }],
    },
  },
  lexical: {
    lede: { zh: '可扩展文本编辑器框架。MIT。', en: 'Extensible text-editor framework. MIT.' },
    style: { zh: '浅色产品营销。超大无衬线标题。青蓝渐变强调词。右侧现场编辑器标本。', en: 'Light product marketing. Oversized sans title. Teal-to-green gradient emphasis. Live editor specimen on the right.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install lexical' }],
      en: [{ k: 'CLI', v: 'npm install lexical' }],
    },
  },
  quill: {
    lede: { zh: '富文本编辑器。BSD-3-Clause。', en: 'Rich-text editor. BSD-3-Clause.' },
    style: { zh: '浅色产品营销。超大无衬线标题。黄徽章。嵌入工具栏编辑器标本。', en: 'Light product marketing. Oversized sans title. Yellow badges. Embedded toolbar editor specimen.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install quill' }],
      en: [{ k: 'CLI', v: 'npm install quill' }],
    },
  },
  plate: {
    lede: { zh: 'React 富文本编辑器框架。MIT，Plus 另售。', en: 'React rich-text editor framework. MIT; Plus is paid.' },
    style: { zh: '浅色产品营销。超大无衬线标题。黑胶囊按钮。嵌入工具栏编辑器标本。', en: 'Light product marketing. Oversized sans title. Black capsule button. Embedded toolbar editor specimen.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npx shadcn@latest add @plate/editor' }],
      en: [{ k: 'CLI', v: 'npx shadcn@latest add @plate/editor' }],
    },
  },
  blocknote: {
    lede: { zh: '区块富文本编辑器。核心 MPL-2.0，XL 另计。', en: 'Block rich-text editor. Core is MPL-2.0; XL is separate.' },
    style: { zh: '浅色产品营销。衬线大标题。紫强调。右侧编辑器窗口标本。', en: 'Light product marketing. Serif display title. Purple accent. Editor window specimen on the right.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install @blocknote/core @blocknote/react @blocknote/mantine' }],
      en: [{ k: 'CLI', v: 'npm install @blocknote/core @blocknote/react @blocknote/mantine' }],
    },
  },
  editorjs: {
    lede: { zh: '块式编辑器。Apache-2.0。输出 JSON。', en: 'Block-style editor. Apache-2.0. JSON output.' },
    style: { zh: '浅色产品营销。超大无衬线标题。青蓝主按钮。圆形加号徽标。', en: 'Light product marketing. Oversized sans title. Cyan primary button. Circular plus mark.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm i @editorjs/editorjs' }],
      en: [{ k: 'CLI', v: 'npm i @editorjs/editorjs' }],
    },
  },
  milkdown: {
    lede: { zh: '无样式 Markdown 编辑器。MIT。', en: 'Headless Markdown editor. MIT.' },
    style: { zh: '深色全出血。超大无衬线字标。双胶囊按钮。墨迹底纹。', en: 'Dark full bleed. Oversized sans wordmark. Dual capsule buttons. Ink-blot ground.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install @milkdown/crepe' }],
      en: [{ k: 'CLI', v: 'npm install @milkdown/crepe' }],
    },
  },
  'ace-editor': {
    lede: { zh: '嵌入式网页代码编辑器。BSD-3-Clause。', en: 'Embeddable web code editor. BSD-3-Clause.' },
    style: {
      zh: '高性能代码编辑器。丰富语法高亮主题。代码折叠行号。专业 IDE 质感。',
      en: 'High-performance code editor. Rich syntax themes. Code folding & line numbers. Professional IDE feel.',
    },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install ace-builds' }],
      en: [{ k: 'CLI', v: 'npm install ace-builds' }],
    },
  },
  grapesjs: {
    lede: { zh: '开源网页构建框架。BSD-3-Clause。不含 Studio SDK。', en: 'Open-source web builder. BSD-3-Clause. Studio SDK is out of scope.' },
    style: { zh: '深紫全出血营销。超大无衬线标题。紫胶囊按钮。嵌入构建器标本。', en: 'Deep-purple full-bleed marketing. Oversized sans title. Purple capsule button. Embedded builder specimen.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm i grapesjs' }],
      en: [{ k: 'CLI', v: 'npm i grapesjs' }],
    },
  },
  'react-hot-toast': {
    lede: { zh: 'React 通知条。MIT。不是 Sonner。', en: 'React toast notifications. MIT. Not Sonner.' },
    style: {
      zh: '现代浮动轻提示。流畅滑入滑出。清晰状态图标。极简无干扰微交互。',
      en: 'Modern floating toast. Smooth slide-in/out. Clear status icons. Non-intrusive micro-interactions.',
    },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install react-hot-toast' }],
      en: [{ k: 'CLI', v: 'npm install react-hot-toast' }],
    },
  },
  kbar: {
    lede: { zh: 'React 命令面板。MIT。不是 cmdk。', en: 'React command palette. MIT. Not cmdk.' },
    style: { zh: '浅色文档首页。几何线标。居中标题。命令行安装块。', en: 'Light documentation homepage. Geometric line mark. Centered title. CLI install block.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install kbar' }],
      en: [{ k: 'CLI', v: 'npm install kbar' }],
    },
  },
  'taiga-ui': {
    lede: { zh: 'Angular 组件库。Apache-2.0。', en: 'Angular component library. Apache-2.0.' },
    style: {
      zh: 'Angular 现代设计体系。高扩展性。模块化层级。克制明快。企业级规范。',
      en: 'Angular modern design system. Highly extensible. Modular hierarchy. Clean & bright. Enterprise standard.',
    },
    acquire: {
      zh: [{ k: '命令行', v: 'ng add taiga-ui' }],
      en: [{ k: 'CLI', v: 'ng add taiga-ui' }],
    },
  },
  primeng: {
    lede: { zh: 'Angular 组件库。Community MIT，LTS 与 PRO 另售。', en: 'Angular component library. Community is MIT; LTS and PRO are paid.' },
    style: { zh: '深色产品营销。超大无衬线标题。白底与描边双按钮。底部组件标本坞。', en: 'Dark product marketing. Oversized sans title. White and outline dual CTAs. Component specimen dock.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install primeng' }],
      en: [{ k: 'CLI', v: 'npm install primeng' }],
    },
  },
  'shadcn-vue': {
    lede: { zh: 'Vue 组件注册表。CLI 写入源码。MIT。', en: 'Vue component registry. CLI writes source. MIT.' },
    style: {
      zh: '中性单色微质感。shadcn 生态规范。精细几何倒角。高对比极简。',
      en: 'Neutral monochrome micro-textures. shadcn ecosystem specs. Precision geometric chamfers. High-contrast minimalism.',
    },
    acquire: {
      zh: [{ k: '命令行', v: 'npx shadcn-vue@latest add button' }],
      en: [{ k: 'CLI', v: 'npx shadcn-vue@latest add button' }],
    },
  },
  patternfly: {
    lede: { zh: 'Red Hat 开源设计系统。MIT。', en: 'Red Hat open-source design system. MIT.' },
    style: { zh: '深色文档。左侧目录。紫提示条。Cookie 底栏。', en: 'Dark documentation. Left-hand TOC. Purple notice bar. Cookie footer.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install @patternfly/react-core' }],
      en: [{ k: 'CLI', v: 'npm install @patternfly/react-core' }],
    },
  },
  oruga: {
    lede: { zh: '无内置样式的 Vue 组件。MIT。', en: 'Unstyled Vue components. MIT.' },
    style: { zh: '浅色营销。绿色字标。毛虫徽标。四张特性卡。', en: 'Light marketing. Green wordmark. Caterpillar mark. Four feature cards.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install @oruga-ui/oruga-next' }],
      en: [{ k: 'CLI', v: 'npm install @oruga-ui/oruga-next' }],
    },
  },
  konsta: {
    lede: { zh: 'Tailwind 移动组件。MIT。不是 Framework7。', en: 'Tailwind mobile components. MIT. Not Framework7.' },
    style: { zh: '深色移动营销。橙色手机标。超大无衬线标题。版本徽章。', en: 'Dark mobile marketing. Orange phone mark. Oversized sans title. Version badge.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install konsta' }],
      en: [{ k: 'CLI', v: 'npm install konsta' }],
    },
  },
  nebular: {
    lede: { zh: 'Angular UI 套件。MIT。基于 Eva Design。', en: 'Angular UI kit. MIT. Based on Eva Design.' },
    style: { zh: '蓝紫全出血营销。超大无衬线标题。三枚白底按钮。产品插画。', en: 'Blue-violet full-bleed marketing. Oversized sans title. Three white CTAs. Product illustration.' },
    acquire: {
      zh: [{ k: '命令行', v: 'ng add @nebular/theme' }],
      en: [{ k: 'CLI', v: 'ng add @nebular/theme' }],
    },
  },
  filepond: {
    lede: { zh: 'JavaScript 文件上传库。核心 MIT，Pintura 另售。', en: 'JavaScript file-upload library. Core is MIT; Pintura is paid.' },
    style: { zh: '深色全出血营销。超大无衬线标题。居中上传槽。青色 GitHub 按钮。黄色 Beta 胶囊。', en: 'Dark full-bleed marketing. Oversized sans title. Centered upload slot. Cyan GitHub button. Yellow beta pill.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install filepond' }],
      en: [{ k: 'CLI', v: 'npm install filepond' }],
    },
  },
  'bunny-fonts': {
    lede: { zh: '隐私优先网页字体目录。字族许可各异。', en: 'Privacy-first web font catalog. Family licenses vary.' },
    style: {
      zh: '零追踪隐私字体目录。开源字族。跨语言排印标本。中性清晰。',
      en: 'Zero-tracking privacy fonts. Open-source families. Cross-language typography. Neutral & legible.',
    },
    acquire: {
      zh: [{ k: '替换主机', v: 'fonts.bunny.net/css' }],
      en: [{ k: 'Host swap', v: 'fonts.bunny.net/css' }],
    },
  },
  spartan: {
    lede: { zh: 'Angular 无样式原语。MIT。用 CLI 写入皮肤。', en: 'Unstyled Angular primitives. MIT. CLI writes the skin.' },
    style: { zh: '深色全出血。超大无衬线标题。标本卡网格。低对比导航。', en: 'Dark full-bleed. Oversized sans title. Specimen-card grid. Low-contrast nav.' },
    acquire: {
      zh: [{ k: '命令行', v: 'ng g @spartan-ng/cli:ui button' }],
      en: [{ k: 'CLI', v: 'ng g @spartan-ng/cli:ui button' }],
    },
  },
  'once-ui': {
    lede: { zh: 'Next.js 设计系统。核心 MIT，Pro 另售。', en: 'Next.js design system. Core is MIT; Pro is paid.' },
    style: {
      zh: '现代 Next.js 极简设计系统。暗黑微光。精细网格排印。精致科技感。',
      en: 'Modern Next.js minimalist design system. Dark micro-glow. Precise grid typography. Refined tech aesthetic.',
    },
    acquire: {
      zh: [{ k: '命令行', v: 'npx create-once-ui-app@latest' }],
      en: [{ k: 'CLI', v: 'npx create-once-ui-app@latest' }],
    },
  },
  'theme-ui': {
    lede: { zh: 'React 主题框架。MIT。', en: 'React theming framework. MIT.' },
    style: {
      zh: '约束驱动设计系统。排印级间距尺度。语义调色板。极简原子风格。',
      en: 'Constraint-driven design system. Typographic spacing scale. Semantic color palette. Minimalist atomic.',
    },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install theme-ui' }],
      en: [{ k: 'CLI', v: 'npm install theme-ui' }],
    },
  },
  cropperjs: {
    lede: { zh: 'JavaScript 图像裁剪库。MIT。', en: 'JavaScript image cropper. MIT.' },
    style: { zh: '深色文档。超大无衬线标题。蓝标。三张特性卡。页脚 MIT。', en: 'Dark docs. Oversized sans title. Blue mark. Three feature cards. MIT footer.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install cropperjs' }],
      en: [{ k: 'CLI', v: 'npm install cropperjs' }],
    },
  },
  uppy: {
    lede: { zh: '开源 JavaScript 文件上传器。MIT。', en: 'Open-source JavaScript file uploader. MIT.' },
    style: { zh: '浅色产品营销。粉顶栏。超大无衬线标题。左侧拖放坞。右侧框架代码。', en: 'Light product marketing. Pink top bar. Oversized sans title. Left-hand drop dock. Right-hand framework snippet.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install @uppy/core' }],
      en: [{ k: 'CLI', v: 'npm install @uppy/core' }],
    },
  },
  lightgallery: {
    lede: { zh: 'JavaScript 图库灯箱。开源 GPLv3，商用须付费许可。', en: 'JavaScript gallery lightbox. OSS is GPLv3; commercial use needs a paid license.' },
    style: { zh: '浅色营销。超大蓝字标。风景缩略图条。大量留白。', en: 'Light marketing. Oversized blue wordmark. Landscape thumbnail strip. Heavy whitespace.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install lightgallery' }],
      en: [{ k: 'CLI', v: 'npm install lightgallery' }],
    },
  },
  colorbrewer: {
    lede: { zh: '地图配色工具。Apache-2.0。', en: 'Cartographic color tool. Apache-2.0.' },
    style: { zh: '浅灰工具台。左侧方案面板。右侧分级设色地图。系统控件。', en: 'Light-gray tool surface. Left-hand scheme panel. Right-hand choropleth. System controls.' },
    acquire: {
      zh: [{ k: '导出', v: 'HEX' }],
      en: [{ k: 'Export', v: 'HEX' }],
    },
  },
  veui: {
    lede: { zh: 'Vue 企业级组件库。MIT。', en: 'Vue enterprise component library. MIT.' },
    style: { zh: '浅色文档。左侧目录。徽章条。中性卡片。', en: 'Light docs. Left-hand TOC. Badge row. Neutral cards.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install veui' }],
      en: [{ k: 'CLI', v: 'npm install veui' }],
    },
  },
  'tom-select': {
    lede: { zh: '轻量 select 控件。Apache-2.0。', en: 'Lightweight select control. Apache-2.0.' },
    style: {
      zh: '轻量混合下拉输入。标签化输入胶囊。自动补全搜索。干净原生质感。',
      en: 'Lightweight hybrid select/input. Tagged input pills. Autocomplete search. Clean native feel.',
    },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install tom-select' }],
      en: [{ k: 'CLI', v: 'npm install tom-select' }],
    },
  },
  bootswatch: {
    lede: { zh: 'Bootstrap 免费主题集。MIT。', en: 'Free Bootstrap theme pack. MIT.' },
    style: { zh: '浅紫全出血营销。超大无衬线标题。圆形图标。主题标本页。', en: 'Light-violet full-bleed marketing. Oversized sans title. Circular icons. Theme specimen pages.' },
    acquire: {
      zh: [{ k: '安装', v: 'npm install bootswatch' }],
      en: [{ k: 'Install', v: 'npm install bootswatch' }],
    },
  },
  'mamba-ui': {
    lede: { zh: 'Tailwind 组件与模板。MIT。复制 HTML。', en: 'Tailwind components and templates. MIT. Copy HTML.' },
    style: {
      zh: '现代响应式页面模块。Tailwind 清爽配色。大色块对比。扁平几何。',
      en: 'Modern responsive page modules. Clean Tailwind palettes. Bold color blocks. Flat geometric.',
    },
    acquire: {
      zh: [{ k: '复制', v: 'HTML / Vue / JSX' }],
      en: [{ k: 'Copy', v: 'HTML / Vue / JSX' }],
    },
  },
  'meraki-ui': {
    lede: { zh: 'Tailwind 组件。MIT。复制 HTML，支持 RTL。', en: 'Tailwind components. MIT. Copy HTML, with RTL.' },
    style: {
      zh: '现代卡片与落地页。Tailwind 柔和阴影。双色渐变微高光。RTL 支持。',
      en: 'Modern cards & landing pages. Tailwind soft shadows. Dual-tone gradients. RTL support.',
    },
    acquire: {
      zh: [{ k: '复制', v: 'HTML' }],
      en: [{ k: 'Copy', v: 'HTML' }],
    },
  },
  grommet: {
    lede: { zh: 'React 组件库。Apache-2.0。', en: 'React component library. Apache-2.0.' },
    style: { zh: '深色全出血。紫环徽标。薄荷绿字标。超大无衬线。几何窗口插画。胶囊导航。', en: 'Dark full-bleed. Purple ring mark. Mint wordmark. Oversized sans. Geometric window illustration. Capsule nav.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install grommet' }],
      en: [{ k: 'CLI', v: 'npm install grommet' }],
    },
  },
  preline: {
    lede: { zh: 'Tailwind 组件文档。开源仓 MIT 加 Fair Use；Pro 另售。', en: 'Tailwind component docs. OSS is MIT plus Fair Use; Pro is paid.' },
    style: { zh: '浅色产品营销。蓝字标。右侧悬浮界面标本。点阵底。双按钮与 npm 命令。', en: 'Light product marketing. Blue wordmark. Floating UI specimens. Dotted ground. Dual buttons and an npm command.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm i preline' }],
      en: [{ k: 'CLI', v: 'npm i preline' }],
    },
  },
  hyperui: {
    lede: { zh: '免费 Tailwind 组件示例。MIT。复制 HTML，无需安装。', en: 'Free Tailwind component examples. MIT. Copy HTML; no install.' },
    style: { zh: '浅色文档营销。超大无衬线字标。大量留白。黑底 GitHub 胶囊。搜索条。', en: 'Light documentation marketing. Oversized sans wordmark. Heavy whitespace. Black GitHub pill. Search field.' },
    acquire: {
      zh: [{ k: '复制', v: 'HTML' }],
      en: [{ k: 'Copy', v: 'HTML' }],
    },
  },
  'keen-slider': {
    lede: { zh: '无依赖轮播库。MIT。', en: 'Dependency-free slider. MIT.' },
    style: {
      zh: '高性能无依赖触摸轮播。平滑阻尼滚动。自适应虚拟化。轻量原语。',
      en: 'High-performance zero-dependency slider. Smooth damped scroll. Adaptive virtualization. Lightweight primitive.',
    },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install keen-slider' }],
      en: [{ k: 'CLI', v: 'npm install keen-slider' }],
    },
  },
  rsuite: {
    lede: { zh: 'React 企业组件套件。MIT。', en: 'React enterprise component suite. MIT.' },
    style: { zh: '深色网格。超大无衬线标题。紫粉渐变强调。原子形徽标。双胶囊按钮。', en: 'Dark grid. Oversized sans title. Violet-to-pink gradient emphasis. Atomic mark. Dual capsule buttons.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install rsuite' }],
      en: [{ k: 'CLI', v: 'npm install rsuite' }],
    },
  },
  'nuxt-ui': {
    lede: { zh: 'Vue UI 组件库。@nuxt/ui MIT。', en: 'Vue UI library. @nuxt/ui is MIT.' },
    style: {
      zh: 'Nuxt 原生现代组件。Tailwind 语义。深色调校。圆润精致。轻量微动效。',
      en: 'Nuxt native modern components. Tailwind semantic. Calibrated dark mode. Smooth rounding. Lightweight micro-motion.',
    },
    acquire: {
      zh: [{ k: '命令行', v: 'npx nuxi@latest module add ui' }],
      en: [{ k: 'CLI', v: 'npx nuxi@latest module add ui' }],
    },
  },
  ckeditor: {
    lede: { zh: 'CKEditor 5 富文本框架。GPL-2.0-or-later 或商业许可。', en: 'CKEditor 5 rich-text framework. GPL-2.0-or-later or commercial.' },
    style: { zh: '深紫全出血营销。超大无衬线标题。青绿强调词。协作气泡标本。', en: 'Deep-purple full-bleed marketing. Oversized sans title. Lime-green emphasis. Collaboration-bubble specimen.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install ckeditor5' }],
      en: [{ k: 'CLI', v: 'npm install ckeditor5' }],
    },
  },
  tinymce: {
    lede: { zh: '富文本编辑器。GPL-2.0-or-later；Premium 另售。', en: 'Rich-text editor. GPL-2.0-or-later; Premium is paid.' },
    style: { zh: '深色产品营销。等距插画。白蓝双按钮。几何编辑器图形。', en: 'Dark product marketing. Isometric illustration. White and blue dual buttons. Geometric editor graphics.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install tinymce' }],
      en: [{ k: 'CLI', v: 'npm install tinymce' }],
    },
  },
  'toast-ui-editor': {
    lede: { zh: 'Markdown 与所见即所得编辑器。MIT。', en: 'Markdown and WYSIWYG editor. MIT.' },
    style: {
      zh: '所见即所得双模编辑。分栏实时预览。丰富 Markdown 扩展。清晰内容排版。',
      en: 'WYSIWYG dual-mode editing. Split live preview. Rich Markdown extensions. Clean typography.',
    },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install @toast-ui/editor' }],
      en: [{ k: 'CLI', v: 'npm install @toast-ui/editor' }],
    },
  },
  vditor: {
    lede: { zh: '浏览器端 Markdown 编辑器。MIT。', en: 'In-browser Markdown editor. MIT.' },
    style: { zh: '浅色产品页。蓝字标。底部编辑器标本。中文导航。', en: 'Light product page. Blue wordmark. Editor specimen at the bottom. Chinese navigation.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install vditor' }],
      en: [{ k: 'CLI', v: 'npm install vditor' }],
    },
  },
  'angular-material': {
    lede: { zh: 'Angular Material 组件。MIT。不是 React MUI。', en: 'Angular Material components. MIT. Not React MUI.' },
    style: {
      zh: 'Angular 官方 Material 规范。标准涟漪触感。深度卡片层级。规范化排印。',
      en: 'Angular official Material specs. Standard ripple feedback. Elevation card layers. Standardized typography.',
    },
    acquire: {
      zh: [{ k: '命令行', v: 'ng add @angular/material' }],
      en: [{ k: 'CLI', v: 'ng add @angular/material' }],
    },
  },
  'ant-design-vue': {
    lede: { zh: 'Ant Design 的 Vue 实现。MIT。', en: 'Ant Design for Vue. MIT.' },
    style: {
      zh: 'Ant Design 规范 Vue 实现。严谨中后台。高密度数据。经典企业蓝。',
      en: 'Ant Design specs for Vue. Strict enterprise admin. High-density data. Classic corporate blue.',
    },
    acquire: {
      zh: [{ k: '命令行', v: 'npm i ant-design-vue' }],
      en: [{ k: 'CLI', v: 'npm i ant-design-vue' }],
    },
  },
  vuestic: {
    lede: { zh: 'Vue 3 UI 框架。MIT。', en: 'Vue 3 UI framework. MIT.' },
    style: { zh: '饱和蓝全出血。超大无衬线。白主按钮。叠层控件标本。', en: 'Saturated-blue full bleed. Oversized sans. White primary. Stacked control specimens.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm i vuestic-ui' }],
      en: [{ k: 'CLI', v: 'npm i vuestic-ui' }],
    },
  },
  skeleton: {
    lede: { zh: 'Tailwind 自适应设计系统。MIT。', en: 'Adaptive design system for Tailwind. MIT.' },
    style: { zh: '深色产品营销。王冠骷髅徽标。超大无衬线。框架圆形图标排。', en: 'Dark product marketing. Crowned-skull mark. Oversized sans. Framework icon row.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm i -D @skeletonlabs/skeleton' }],
      en: [{ k: 'CLI', v: 'npm i -D @skeletonlabs/skeleton' }],
    },
  },
  clarity: {
    lede: { zh: 'Angular 企业设计系统。MIT。不是微软分析。', en: 'Enterprise Angular design system. MIT. Not Microsoft analytics.' },
    style: { zh: '深蓝顶栏。VERSION 18 胶囊。等距纸飞机插画。白卡片三栏。', en: 'Navy top bar. VERSION 18 pill. Isometric paper-plane art. Three white cards.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm i @clr/angular @clr/ui' }],
      en: [{ k: 'CLI', v: 'npm i @clr/angular @clr/ui' }],
    },
  },
  'react-admin': {
    lede: { zh: 'React 后台框架。MIT。Enterprise 另售。', en: 'React admin framework. MIT. Enterprise is paid.' },
    style: {
      zh: 'B2B 管理后台专用。高密度数据流。清晰表单视图。快捷操作条。生产力优先。',
      en: 'B2B admin dashboard dedicated. High-density data streams. Clear CRUD views. Quick action bars. Productivity-first.',
    },
    acquire: {
      zh: [{ k: '命令行', v: 'npm i react-admin' }],
      en: [{ k: 'CLI', v: 'npm i react-admin' }],
    },
  },
  'ng-bootstrap': {
    lede: { zh: 'Angular 的 Bootstrap 组件。MIT。', en: 'Bootstrap widgets for Angular. MIT.' },
    style: {
      zh: 'Angular 原生 Bootstrap 5。经典网格体系。标准通用控件。干净中性。',
      en: 'Angular native Bootstrap 5. Classic grid system. Standard general controls. Clean neutral.',
    },
    acquire: {
      zh: [{ k: '命令行', v: 'ng add @ng-bootstrap/ng-bootstrap' }],
      en: [{ k: 'CLI', v: 'ng add @ng-bootstrap/ng-bootstrap' }],
    },
  },
  materialize: {
    lede: { zh: 'Material Design CSS 框架。MIT。站点 1.0.0。', en: 'Material Design CSS framework. MIT. Site is 1.0.0.' },
    style: { zh: '白底粉红字标。矩形粉按钮。侧栏 M。', en: 'White canvas. Pink wordmark. Rectangular pink buttons. Sidebar M.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm i materialize-css@next' }],
      en: [{ k: 'CLI', v: 'npm i materialize-css@next' }],
    },
  },
  uikit: {
    lede: { zh: '模块化前端框架。MIT。不含 Pro。', en: 'Modular front-end framework. MIT. Pro is separate.' },
    style: { zh: '通栏饱和蓝。白六边形标。白胶囊按钮。', en: 'Full-bleed saturated blue. White hex mark. White capsule buttons.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm i uikit' }],
      en: [{ k: 'CLI', v: 'npm i uikit' }],
    },
  },
  primeflex: {
    lede: { zh: 'Prime 配套 CSS 工具类。MIT。已 sunset。', en: 'Prime CSS utilities. MIT. Sunset.' },
    style: { zh: '深色营销。青色渐变大字。sunset 顶条。', en: 'Dark marketing. Cyan gradient display. Sunset banner.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm i primeflex' }],
      en: [{ k: 'CLI', v: 'npm i primeflex' }],
    },
  },
  'shadcn-svelte': {
    lede: { zh: 'shadcn 的 Svelte 移植。MIT。', en: 'Svelte port of shadcn. MIT.' },
    style: {
      zh: 'Svelte 极简现代。单色黑白灰。精巧细线边框。无缝代码复制。',
      en: 'Svelte minimalist modern. Monochrome black/white/gray. Fine line borders. Seamless copyable code.',
    },
    acquire: {
      zh: [{ k: '命令行', v: 'pnpm dlx shadcn-svelte@latest init' }],
      en: [{ k: 'CLI', v: 'pnpm dlx shadcn-svelte@latest init' }],
    },
  },
  'melt-ui': {
    lede: { zh: 'Svelte 无样式构建器。MIT。不是 Bits UI。', en: 'Svelte unstyled builders. MIT. Not Bits UI.' },
    style: {
      zh: 'Svelte 反应式无头原语。无预设样式。自由定制。纯净交互逻辑。',
      en: 'Svelte reactive headless primitives. Unopinionated. Full styling freedom. Pure interaction logic.',
    },
    acquire: {
      zh: [{ k: '命令行', v: 'npx @melt-ui/cli@latest init' }],
      en: [{ k: 'CLI', v: 'npx @melt-ui/cli@latest init' }],
    },
  },
  blueprint: {
    lede: { zh: 'React UI 工具包。Apache-2.0。', en: 'React UI toolkit. Apache-2.0.' },
    style: { zh: '浅色文档系统。立方徽标。左侧包目录。等宽安装命令。蓝顶栏版本条。', en: 'Light documentation system. Cube mark. Left-hand package TOC. Monospace install. Blue version bar.' },
    acquire: {
      zh: [{ k: '命令行', v: 'pnpm add @blueprintjs/core react react-dom' }],
      en: [{ k: 'CLI', v: 'pnpm add @blueprintjs/core react react-dom' }],
    },
  },
  aframe: {
    lede: { zh: 'WebXR 框架。MIT。用 HTML 搭 3D 场景。', en: 'WebXR framework. MIT. Build 3D scenes in HTML.' },
    style: { zh: '浅色文档。粉红字标 A-FRAME。左侧导航。衬线感标题列表。', en: 'Light docs. Pink A-FRAME wordmark. Left-hand nav. Serif-like title list.' },
    acquire: {
      zh: [{ k: '脚本', v: 'aframe.min.js' }],
      en: [{ k: 'Script', v: 'aframe.min.js' }],
    },
  },
  postcss: {
    lede: { zh: '用 JavaScript 变换 CSS。MIT。', en: 'Transform CSS with JavaScript. MIT.' },
    style: { zh: '浅色文献首页。雕刻圆章底。橙红字标。对照代码卡片。', en: 'Light documentary homepage. Engraved medallion ground. Orange-red wordmark. Before/after code cards.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install postcss' }],
      en: [{ k: 'CLI', v: 'npm install postcss' }],
    },
  },
  lightningcss: {
    lede: { zh: 'Rust CSS 解析与压缩。MPL-2.0。', en: 'Rust CSS parser and minifier. MPL-2.0.' },
    style: { zh: '深色产品营销。黄霓虹闪电图标与字标。星轨速度卡。', en: 'Dark product marketing. Yellow neon bolt and wordmark. Star-trail speed card.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install --save-dev lightningcss' }],
      en: [{ k: 'CLI', v: 'npm install --save-dev lightningcss' }],
    },
  },
  tachyons: {
    lede: { zh: '原子 CSS 类。MIT。', en: 'Atomic CSS classes. MIT.' },
    style: { zh: '浅色营销。超大无衬线标题。蓝下载按钮。黑底起步区。', en: 'Light marketing. Oversized sans title. Blue download buttons. Black getting-started band.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install tachyons' }],
      en: [{ k: 'CLI', v: 'npm install tachyons' }],
    },
  },
  'spectre-css': {
    lede: { zh: '轻量 CSS 框架。MIT。', en: 'Lightweight CSS framework. MIT.' },
    style: {
      zh: '轻量响应式。纯净无冗余。清晰网格。极简实用。基础排版。',
      en: 'Lightweight responsive. Pure zero-bloat. Clean grid. Minimalist practical. Base typography.',
    },
    acquire: {
      zh: [{ k: '样式表', v: 'spectre.min.css' }],
      en: [{ k: 'Stylesheet', v: 'spectre.min.css' }],
    },
  },
  'fomantic-ui': {
    lede: { zh: 'Semantic UI 社区分支。MIT。', en: 'Community fork of Semantic UI. MIT.' },
    style: {
      zh: '经典语义化组件。拟物平滑按钮。圆角卡片。丰富状态修饰符。结构化语言。',
      en: 'Classic semantic components. Smooth tactile buttons. Rounded cards. Rich status modifiers. Structured language.',
    },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install fomantic-ui' }],
      en: [{ k: 'CLI', v: 'npm install fomantic-ui' }],
    },
  },
  sass: {
    lede: { zh: 'CSS 扩展语言。Dart Sass MIT。', en: 'CSS extension language. Dart Sass is MIT.' },
    style: { zh: '浅色营销。粉红手写字标。超大无衬线标题。眼镜插画。品红版本条。', en: 'Light marketing. Pink script wordmark. Oversized sans title. Glasses illustration. Magenta release bar.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install -g sass' }],
      en: [{ k: 'CLI', v: 'npm install -g sass' }],
    },
  },
  purecss: {
    lede: { zh: '小型响应式 CSS 模块。BSD-3-Clause。', en: 'Small responsive CSS modules. BSD-3-Clause.' },
    style: { zh: '浅色文档。蓝 P 方标。彩色模块条。左侧黑导航。', en: 'Light docs. Blue P tile. Colored module bar. Black left nav.' },
    acquire: {
      zh: [{ k: '样式表', v: 'pure-min.css' }],
      en: [{ k: 'Stylesheet', v: 'pure-min.css' }],
    },
  },
  'cubic-bezier': {
    lede: { zh: 'CSS cubic-bezier() 缓动预览。MIT。', en: 'CSS cubic-bezier() easing preview. MIT.' },
    style: {
      zh: '数学缓动可视化。贝塞尔曲线控制柄。即时速度对照。物理加速度。',
      en: 'Mathematical easing visualization. Bezier curve handles. Real-time velocity contrast. Physical acceleration.',
    },
    acquire: {
      zh: [{ k: '打开', v: 'cubic-bezier.com' }],
      en: [{ k: 'Open', v: 'cubic-bezier.com' }],
    },
  },
  'wow-js': {
    lede: { zh: '滚动显现动画。MIT。', en: 'Scroll-reveal animations. MIT.' },
    style: {
      zh: '视口滚动显现。经典过渡触发。极简轻量。',
      en: 'Viewport scroll reveal. Classic transition triggers. Ultra-lightweight.',
    },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install wow.js' }],
      en: [{ k: 'CLI', v: 'npm install wow.js' }],
    },
  },
  tweenjs: {
    lede: { zh: 'JavaScript 缓动引擎。MIT。', en: 'JavaScript tweening engine. MIT.' },
    style: { zh: '浅色文档。黑无衬线标题。版本徽章。灰底代码标本。', en: 'Light docs. Black sans title. Version badges. Gray code specimen.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install @tweenjs/tween.js' }],
      en: [{ k: 'CLI', v: 'npm install @tweenjs/tween.js' }],
    },
  },
  curtainsjs: {
    lede: { zh: 'WebGL 平面库。MIT。', en: 'WebGL plane library. MIT.' },
    style: { zh: '粉顶栏。蓝粉渐变全出血。居中衬线字标。', en: 'Pink top bar. Blue-to-pink full-bleed gradient. Centered serif wordmark.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm i curtainsjs' }],
      en: [{ k: 'CLI', v: 'npm i curtainsjs' }],
    },
  },
  pagepiling: {
    lede: { zh: 'jQuery 全屏堆叠滚动。MIT。', en: 'jQuery stacked full-page scroll. MIT.' },
    style: { zh: '白底首屏。灰无衬线大字。叠色方块。蓝下载按钮。', en: 'White first screen. Gray sans display. Stacked color tiles. Blue download button.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install pagepiling.js' }],
      en: [{ k: 'CLI', v: 'npm install pagepiling.js' }],
    },
  },
  'react-transition-group': {
    lede: { zh: 'React 过渡阶段组件。BSD-3-Clause。', en: 'React transition-stage components. BSD-3-Clause.' },
    style: {
      zh: '声明式过渡状态机。CSS 类名切换生命周期。纯净基础原语。',
      en: 'Declarative transition state machine. CSS class lifecycle syncing. Pure base primitives.',
    },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install react-transition-group --save' }],
      en: [{ k: 'CLI', v: 'npm install react-transition-group --save' }],
    },
  },
  'pollen-css': {
    lede: { zh: 'CSS 变量构建系统。MIT。', en: 'CSS variables build system. MIT.' },
    style: {
      zh: 'CSS 变量设计令牌。一致比例间距。原子级系统变量。纯原生轻量。',
      en: 'CSS variable design tokens. Consistent proportional spacing. Atomic system variables. Pure native lightweight.',
    },
    acquire: {
      zh: [{ k: '命令行', v: 'npm i pollen-css' }],
      en: [{ k: 'CLI', v: 'npm i pollen-css' }],
    },
  },
  basscss: {
    lede: { zh: '低层 CSS 工具类。MIT。', en: 'Low-level CSS utilities. MIT.' },
    style: { zh: '白底。黑无衬线字标。十二宫格目录。三栏正文。', en: 'White field. Black sans wordmark. Twelve-up directory. Three-column body.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install basscss' }],
      en: [{ k: 'CLI', v: 'npm install basscss' }],
    },
  },
  'toast-ui-grid': {
    lede: { zh: 'TOAST UI 数据表格。MIT。', en: 'TOAST UI data grid. MIT.' },
    style: {
      zh: '复杂数据网格。树形展开收起。单元格直接编辑。企业级数据排版。',
      en: 'Complex data grid. Tree-grid hierarchy. Inline cell editing. Enterprise data layout.',
    },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install --save tui-grid' }],
      en: [{ k: 'CLI', v: 'npm install --save tui-grid' }],
    },
  },
  'vega-lite': {
    lede: { zh: '高级可视化语法。BSD-3-Clause。', en: 'High-level visualization grammar. BSD-3-Clause.' },
    style: {
      zh: '声明式统计图形。多图联动筛选。规范化图例坐标。高信息密度。',
      en: 'Declarative statistical graphics. Multi-view linked filtering. Standardized legends. High information density.',
    },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install vega-lite' }],
      en: [{ k: 'CLI', v: 'npm install vega-lite' }],
    },
  },
  csshake: {
    lede: { zh: 'CSS 抖动 class。MIT。', en: 'CSS shake classes. MIT.' },
    style: { zh: '青绿全出血。奶昔插画。白手写字标。v1.7.0。', en: 'Teal full bleed. Milkshake illustration. White script wordmark. v1.7.0.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm i csshake' }],
      en: [{ k: 'CLI', v: 'npm i csshake' }],
    },
  },
  'pattern-css': {
    lede: { zh: '纯 CSS 背景纹理。MIT。', en: 'Pure CSS background patterns. MIT.' },
    style: {
      zh: '纯 CSS 几何纹理。波点斜线网格背景。轻量装饰图样。免图片生成。',
      en: 'Pure CSS geometric textures. Dots, stripes & grid backgrounds. Lightweight patterns. Zero-image procedural.',
    },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install pattern.css' }],
      en: [{ k: 'CLI', v: 'npm install pattern.css' }],
    },
  },
  linaria: {
    lede: { zh: '零运行时 CSS-in-JS。MIT。', en: 'Zero-runtime CSS-in-JS. MIT.' },
    style: { zh: '品红粉渐变。白无衬线标题。深色代码卡。', en: 'Magenta-pink gradient. White sans title. Dark code card.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install @linaria/core @linaria/react' }],
      en: [{ k: 'CLI', v: 'npm install @linaria/core @linaria/react' }],
    },
  },
  griffel: {
    lede: { zh: '提前编译的 CSS-in-JS。MIT。', en: 'Ahead-of-time CSS-in-JS. MIT.' },
    style: { zh: '近黑。青绿几何英雄区。绿紫胶囊。代码块。', en: 'Near-black. Lime geometric hero. Green and purple capsules. Code block.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install @griffel/react' }],
      en: [{ k: 'CLI', v: 'npm install @griffel/react' }],
    },
  },
  atropos: {
    lede: { zh: '触摸友好的 3D 视差卡。MIT。', en: 'Touch-friendly 3D parallax cards. MIT.' },
    style: { zh: '紫渐变。山景视差卡。ATROPOS JS。胶囊按钮。', en: 'Purple gradient. Mountain parallax card. ATROPOS JS. Capsule button.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm i atropos' }],
      en: [{ k: 'CLI', v: 'npm i atropos' }],
    },
  },
  'vanilla-tilt': {
    lede: { zh: '无依赖 3D 倾斜。MIT。', en: 'Dependency-free 3D tilt. MIT.' },
    style: {
      zh: '3D 视差倾斜。光滑镜面反光。鼠标悬停位移。微交互卡片感。',
      en: '3D parallax tilt. Smooth specular glare. Mouse-driven hover shifts. Tactile card micro-interaction.',
    },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install vanilla-tilt' }],
      en: [{ k: 'CLI', v: 'npm install vanilla-tilt' }],
    },
  },
  'lottie-web': {
    lede: { zh: 'Airbnb Lottie Web 运行时。MIT。', en: 'Airbnb Lottie Web runtime. MIT.' },
    style: {
      zh: '矢量微交互动效。高保真动效插画。无损清晰度。平滑复杂动作。',
      en: 'Vector micro-interactions. High-fidelity animated illustrations. Lossless resolution. Smooth complex motion.',
    },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install lottie-web' }],
      en: [{ k: 'CLI', v: 'npm install lottie-web' }],
    },
  },
  reanimated: {
    lede: { zh: 'React Native 动画库。MIT。', en: 'React Native animation library. MIT.' },
    style: { zh: '粉紫沙漠渐变。马剪影。紫描边标题。', en: 'Pink-purple desert gradient. Horse silhouette. Purple boxed title.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install react-native-reanimated' }],
      en: [{ k: 'CLI', v: 'npm install react-native-reanimated' }],
    },
  },
  lesscss: {
    lede: { zh: 'CSS 语言扩展。Apache-2.0。', en: 'CSS language extension. Apache-2.0.' },
    style: { zh: '海军蓝营销首页。{less} 立体字标。等宽安装命令。', en: 'Navy marketing homepage. Extruded {less} wordmark. Monospace install commands.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install less -g' }],
      en: [{ k: 'CLI', v: 'npm install less -g' }],
    },
  },
  'antv-s2': {
    lede: { zh: '多维交叉分析表格。MIT。', en: 'Multidimensional pivot table. MIT.' },
    style: {
      zh: '多维交叉分析表格。透视行列聚合。指标对比高亮。商务智能看板。',
      en: 'Multi-dimensional pivot table. Dimension aggregation. KPI contrast highlight. Business intelligence style.',
    },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install @antv/s2' }],
      en: [{ k: 'CLI', v: 'npm install @antv/s2' }],
    },
  },
  'antv-x6': {
    lede: { zh: 'HTML/SVG 图编辑引擎。MIT。', en: 'HTML/SVG graph editor engine. MIT.' },
    style: {
      zh: '交互式图编辑引擎。可定制节点与锚点。智能连线路由。架构与流程图。',
      en: 'Interactive graph editing engine. Customizable nodes & ports. Smart link routing. Architecture & flowcharts.',
    },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install @antv/x6 --save' }],
      en: [{ k: 'CLI', v: 'npm install @antv/x6 --save' }],
    },
  },
  'antv-l7': {
    lede: { zh: 'WebGL 地理空间可视化。MIT。', en: 'WebGL geospatial visualization. MIT.' },
    style: {
      zh: '空间大数据可视化。高动态发光流线。热力与蜂窝图层。大屏深色科技。',
      en: 'Spatial big data visualization. Dynamic glowing flowlines. Heatmap & hexbin layers. Dark dashboard tech.',
    },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install --save @antv/l7' }],
      en: [{ k: 'CLI', v: 'npm install --save @antv/l7' }],
    },
  },
}

export function entryVoice(entryId) {
  return VOICE[entryId] || null
}

export function voiceText(entryId, field, locale) {
  const row = VOICE[entryId]?.[field]
  if (!row) return null
  return row[locale] || row.zh || null
}
