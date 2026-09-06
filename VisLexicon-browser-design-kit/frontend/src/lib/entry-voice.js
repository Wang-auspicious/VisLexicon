/**
 * 人工撰写的短简介、风格判断、获取路径。
 * 风格按首页截图归纳，用设计术语，不用口语。
 */

const VOICE = {
  'shadcn-ui': {
    lede: {
      zh: '开源组件注册表。CLI 将源码写入项目仓库。',
      en: 'Open-source component registry. The CLI writes source into the project.',
    },
    style: {
      zh: '深色单色高对比。几何圆角。系统控件标本式陈列。',
      en: 'Dark-mode monochrome, high contrast. Geometric radii. Specimen-led system UI.',
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
      zh: '深色全出血营销。超大无衬线标题配斜体强调。横向组件标本轮播。低对比导航。饱和主按钮。',
      en: 'Dark full-bleed marketing. Oversized sans display with italic accent. Horizontal specimen carousel. Low-contrast nav. Saturated primary CTA.',
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
    lede: { zh: '社区 UI 元素库。复制 HTML / CSS。', en: 'Community UI elements. Copy HTML / CSS.' },
    style: { zh: '浅色画廊网格。卡片瀑布。社区标本。', en: 'Light gallery grid. Card masonry. Community specimens.' },
  },
  'magic-ui': {
    lede: { zh: 'React 动效组件。经 shadcn CLI 安装。', en: 'React motion components. Installed via the shadcn CLI.' },
    style: { zh: '深色动效营销。演示优先。高饱和点缀。', en: 'Dark motion marketing. Demo-first. Saturated accents.' },
  },
  'origin-ui': {
    lede: { zh: '可复制 React 组件。现属 Coss UI。', en: 'Copyable React components. Now Coss UI.' },
    style: { zh: '浅色文档系统。中性灰。控件目录。', en: 'Light documentation system. Neutral gray. Control catalog.' },
  },
  'hover-dev': {
    lede: { zh: 'CSS 动效与微交互示例。', en: 'CSS motion and micro-interaction examples.' },
    style: { zh: '深色演示台。交互即内容。', en: 'Dark demo stage. Interaction as content.' },
  },
  'entry-chakra-ui-react': {
    lede: { zh: 'React 组件库。npm 安装。', en: 'React component library. Installed from npm.' },
    style: { zh: '浅色文档。品牌青。API 页。', en: 'Light docs. Brand teal. API pages.' },
  },
  'entry-ant-design-react': {
    lede: { zh: '企业级 React 组件库。', en: 'Enterprise React component library.' },
    style: { zh: '浅色企业文档。蓝色强调。密集目录。', en: 'Light enterprise docs. Blue accent. Dense catalog.' },
  },
  'entry-shadcn-studio-blocks': {
    lede: { zh: 'shadcn 风格页面区块。', en: 'shadcn-styled page blocks.' },
    style: { zh: '深色积木式区块陈列。', en: 'Dark, block-modular composition.' },
  },
  'base-ui': {
    lede: { zh: '无样式 React 原语。', en: 'Unstyled React primitives.' },
    style: { zh: '浅色文档。中性。解剖式演示。', en: 'Light docs. Neutral. Anatomical demos.' },
  },
  'ariakit': {
    lede: { zh: '无样式无障碍 React 原语。', en: 'Unstyled accessible React primitives.' },
    style: { zh: '浅色文档。示例与源码并置。', en: 'Light docs. Example beside source.' },
  },
  'heroui': {
    lede: { zh: 'React 组件库。品牌化默认样式。', en: 'React component library with branded defaults.' },
    style: { zh: '深色品牌化组件营销。', en: 'Dark branded component marketing.' },
  },
  'material-ui': {
    lede: { zh: 'Material Design React 实现。', en: 'Material Design for React.' },
    style: { zh: '浅色 Material 文档。主色强调。规格表。', en: 'Light Material docs. Primary accent. Spec tables.' },
  },
  'motion': {
    lede: { zh: '跨框架动效库。原 Framer Motion。', en: 'Cross-framework motion library. Formerly Framer Motion.' },
    style: { zh: '深色动效文档。时间轴式演示。', en: 'Dark motion docs. Timeline demos.' },
  },
  'lucide': {
    lede: { zh: '开源图标集。描边几何。', en: 'Open icon set. Stroke geometry.' },
    style: { zh: '浅色图标网格。等线描边。', en: 'Light icon grid. Even stroke.' },
  },
  'phosphor-icons': {
    lede: { zh: '六字重开源图标家族。', en: 'Open icon family in six weights.' },
    style: { zh: '浅色图标网格。几何描边。字重可切换。', en: 'Light icon grid. Geometric stroke. Switchable weights.' },
  },
  'tabler-icons': {
    lede: { zh: 'MIT 线型 SVG 图标。源码免费。', en: 'MIT outline SVG icons. Source is free.' },
    style: { zh: '深色营销页。24 网格。统一线宽。', en: 'Dark marketing page. 24-grid. Uniform stroke.' },
  },
  'heroicons': {
    lede: { zh: 'Tailwind Labs 出品的 MIT 图标。', en: 'MIT icons from Tailwind Labs.' },
    style: { zh: '浅色图标网格。线型与填色并置。', en: 'Light icon grid. Outline beside solid.' },
  },
  'flowbite': {
    lede: { zh: 'Tailwind 组件。文档即目录。', en: 'Tailwind components. Docs as catalog.' },
    style: { zh: '浅色文档。中性灰。控件标本。', en: 'Light docs. Neutral gray. Control specimens.' },
  },
  'park-ui': {
    lede: { zh: '多框架组件。Ark 原语加样式。', en: 'Multi-framework components. Ark primitives with style.' },
    style: { zh: '浅色文档。品牌青。按钮标本。', en: 'Light docs. Brand teal. Button specimens.' },
  },
  'bits-ui': {
    lede: { zh: 'Svelte 无样式无障碍原语。', en: 'Unstyled accessible primitives for Svelte.' },
    style: { zh: '深色文档。代码与演示并置。', en: 'Dark docs. Code beside demo.' },
  },
  'fluent-ui': {
    lede: { zh: 'Fluent 2 Web React 组件。', en: 'Fluent 2 Web React components.' },
    style: { zh: '浅色企业文档。系统控件。圆角克制。', en: 'Light enterprise docs. System controls. Restrained radii.' },
  },
  'polaris': {
    lede: { zh: 'Shopify 管理界面参考。Web Components。', en: 'Shopify admin interface reference. Web Components.' },
    style: { zh: '浅色文档。绿色强调。管理后台密度。', en: 'Light docs. Green accent. Admin density.' },
  },
  'primer': {
    lede: { zh: 'GitHub Primer 产品界面。', en: 'GitHub Primer product UI.' },
    style: { zh: '浅色文档。中性。产品控件目录。', en: 'Light docs. Neutral. Product control catalog.' },
  },
  'nivo': {
    lede: { zh: 'React 数据可视化。可配置图表。', en: 'React data visualization. Configurable charts.' },
    style: { zh: '浅色图表画廊。标本式演示。', en: 'Light chart gallery. Specimen demos.' },
  },
  'laws-of-ux': {
    lede: { zh: '界面心理学定律卡片。', en: 'UX psychology law cards.' },
    style: { zh: '浅色编辑式卡片。衬线标题。', en: 'Light editorial cards. Serif titles.' },
  },
  'a11y-project': {
    lede: { zh: '无障碍清单与参考。', en: 'Accessibility checklists and reference.' },
    style: { zh: '浅色清单文档。高可读。', en: 'Light checklist docs. High readability.' },
  },
  'ecomm-design': {
    lede: { zh: '电商界面模式图鉴。', en: 'E-commerce interface patterns.' },
    style: { zh: '浅色模式图鉴。截图网格。', en: 'Light pattern atlas. Screenshot grid.' },
  },
  'radix-themes': {
    lede: { zh: '预样式 React 组件。主题与布局一包提供。', en: 'Pre-styled React components. Theme and layout in one package.' },
    style: { zh: '浅色文档。中性灰。开箱控件标本。圆角克制。', en: 'Light docs. Neutral gray. Out-of-the-box control specimens. Restrained radii.' },
  },
  'radix-primitives': {
    lede: { zh: '无样式无障碍 React 原语。', en: 'Unstyled accessible React primitives.' },
    style: { zh: '浅色文档。中性。解剖式演示。', en: 'Light docs. Neutral. Anatomical demos.' },
  },
  'radix-icons': {
    lede: { zh: '15×15 开源线型图标。', en: '15×15 open outline icons.' },
    style: { zh: '浅色图标网格。等线描边。高密度。', en: 'Light icon grid. Even stroke. High density.' },
  },
  'radix-colors': {
    lede: { zh: '为界面设计的开源色阶。', en: 'Open color scales for interface design.' },
    style: { zh: '浅色色阶标本。水平色带。系统化明度。', en: 'Light scale specimens. Horizontal swatches. Systematic lightness.' },
  },
  daisyui: {
    lede: { zh: 'Tailwind 插件。语义 class 组件。', en: 'Tailwind plugin. Semantic class components.' },
    style: { zh: '浅色营销文档。多主题标本。圆角按钮。', en: 'Light marketing docs. Multi-theme specimens. Rounded buttons.' },
  },
  'headless-ui': {
    lede: { zh: 'Tailwind Labs 无样式组件。', en: 'Unstyled components from Tailwind Labs.' },
    style: { zh: '浅色文档。中性。示例与 API 并置。', en: 'Light docs. Neutral. Example beside API.' },
  },
  'ark-ui': {
    lede: { zh: '无头组件。多框架。', en: 'Headless components. Multiple frameworks.' },
    style: { zh: '深色文档。品牌青。代码与演示分栏。', en: 'Dark docs. Brand teal. Code beside demo.' },
  },
  mantine: {
    lede: { zh: 'React 组件库。钩子与表单配套。', en: 'React components with hooks and forms.' },
    style: { zh: '浅色文档。蓝色强调。控件目录。', en: 'Light docs. Blue accent. Control catalog.' },
  },
  'react-aria': {
    lede: { zh: 'Adobe 无样式无障碍 React 钩子与组件。', en: 'Adobe unstyled accessible React hooks and components.' },
    style: { zh: '浅色 Spectrum 文档。中性。规格表。', en: 'Light Spectrum docs. Neutral. Spec tables.' },
  },
  'aceternity-ui': {
    lede: { zh: 'React 与 Tailwind 动效组件。许可非 MIT。', en: 'React and Tailwind motion components. License is not MIT.' },
    style: { zh: '深色全出血营销。高饱和点缀。组件即广告。', en: 'Dark full-bleed marketing. Saturated accents. Component-as-advert.' },
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
    style: { zh: '浅色演示页。大号交互标本。', en: 'Light demo page. Large interactive specimens.' },
  },
  'web-dev': {
    lede: { zh: 'Chrome 团队的 Web 开发参考。', en: 'Web development reference from the Chrome team.' },
    style: { zh: '浅色文档。蓝色强调。文章排版。', en: 'Light docs. Blue accent. Article typography.' },
  },
  'inclusive-components': {
    lede: { zh: '包容性界面模式文章。', en: 'Inclusive interface pattern essays.' },
    style: { zh: '浅色长文。衬线正文。编辑式。', en: 'Light long-form. Serif body. Editorial.' },
  },
  iconoir: {
    lede: { zh: '24 网格开源线型图标。', en: '24-grid open outline icons.' },
    style: { zh: '浅色图标网格。等线描边。留白宽。', en: 'Light icon grid. Even stroke. Generous whitespace.' },
  },
  'simple-icons': {
    lede: { zh: '品牌 SVG 图标集。', en: 'Brand SVG icons.' },
    style: { zh: '浅色品牌色网格。单色填色标志。', en: 'Light brand-color grid. Monochrome filled marks.' },
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
    style: { zh: '浅色编辑式。衬线标题。图解盒模型。', en: 'Light editorial. Serif titles. Diagrammed box model.' },
  },
  bootstrap: {
    lede: { zh: 'HTML、CSS 与 JS 前端工具包。', en: 'HTML, CSS, and JS frontend toolkit.' },
    style: { zh: '浅色文档。紫色强调。示例与代码并置。', en: 'Light docs. Purple accent. Example beside code.' },
  },
  'toools-design': {
    lede: { zh: '设计资源外链目录。', en: 'Outbound directory of design resources.' },
    style: { zh: '浅色目录网格。卡片索引。中性。', en: 'Light directory grid. Card index. Neutral.' },
  },
  'tailwind-css': {
    lede: { zh: 'Utility-first CSS 框架。核心 MIT，Plus 另售。', en: 'Utility-first CSS framework. Core is MIT; Plus is paid.' },
    style: { zh: '浅色营销文档。青绿强调。工具类标本。大号无衬线。', en: 'Light marketing docs. Cyan-green accent. Utility specimens. Oversized sans.' },
  },
  'panda-css': {
    lede: { zh: '构建期 CSS-in-JS 引擎。', en: 'Build-time CSS-in-JS engine.' },
    style: { zh: '浅色文档。品牌黄。代码与配方并置。', en: 'Light docs. Brand yellow. Code beside recipes.' },
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
    style: { zh: '深色全出血营销。高饱和点缀。动效即内容。', en: 'Dark full-bleed marketing. Saturated accents. Motion as content.' },
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
    style: { zh: '浅色文档。中性。解剖式演示。', en: 'Light docs. Neutral. Anatomical demos.' },
  },
  storybook: {
    lede: { zh: '组件工坊。核心 MIT。', en: 'Component workshop. Core is MIT.' },
    style: { zh: '浅色文档。粉紫强调。侧栏目录。', en: 'Light docs. Magenta accent. Sidebar catalog.' },
  },
  'adobe-spectrum': {
    lede: { zh: 'Adobe Spectrum 设计系统。React 实现 Apache-2.0。', en: 'Adobe Spectrum design system. React implementation is Apache-2.0.' },
    style: { zh: '浅色文档。光谱色阶。系统控件标本。', en: 'Light docs. Spectral scales. System control specimens.' },
  },
  'atlassian-design': {
    lede: { zh: 'Atlassian 设计系统。组件 Apache-2.0，附加条款自定。', en: 'Atlassian Design System. Components Apache-2.0; add-ons custom.' },
    style: { zh: '浅色文档。品牌蓝。管理后台密度。', en: 'Light docs. Brand blue. Admin density.' },
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
    style: { zh: '浅色文档。品牌蓝。企业控件目录。', en: 'Light docs. Brand blue. Enterprise control catalog.' },
  },
  iconify: {
    lede: { zh: '多套图标的统一框架。框架 MIT，图标集许可各异。', en: 'Unified framework over many icon sets. Framework is MIT; sets vary.' },
    style: { zh: '浅色图标网格。检索优先。中性。', en: 'Light icon grid. Search-first. Neutral.' },
  },
  'google-fonts': {
    lede: { zh: 'Google 字体目录。字族许可各异。', en: 'Google Fonts catalog. Family licenses vary.' },
    style: { zh: '浅色字体标本。大号字样。留白宽。', en: 'Light type specimens. Oversized samples. Generous whitespace.' },
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
    style: { zh: '浅色色阶标本。水平色带。系统化明度。', en: 'Light scale specimens. Horizontal swatches. Systematic lightness.' },
  },
  'embla-carousel': {
    lede: { zh: '无样式轮播库。MIT。', en: 'Unstyled carousel library. MIT.' },
    style: { zh: '浅色文档。现场轮播标本。中性。', en: 'Light docs. Live carousel specimens. Neutral.' },
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
    style: { zh: '浅色文档。图表标本。中性。', en: 'Light docs. Chart specimens. Neutral.' },
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
    style: { zh: '浅色文档。控件标本。中性。', en: 'Light docs. Control specimens. Neutral.' },
  },
  'tanstack-table': {
    lede: { zh: '无头表格。MIT。本条只收 Table。', en: 'Headless table. MIT. This entry is Table only.' },
    style: { zh: '深色文档。等宽代码。中性。', en: 'Dark docs. Monospace code. Neutral.' },
  },
  'ag-grid': {
    lede: { zh: '数据表格。Community MIT，Enterprise 收费。', en: 'Data grid. Community is MIT; Enterprise is paid.' },
    style: { zh: '浅色文档。高密度表格标本。品牌蓝。', en: 'Light docs. High-density grid specimens. Brand blue.' },
  },
  cva: {
    lede: { zh: 'Class Variance Authority。Apache-2.0。', en: 'Class Variance Authority. Apache-2.0.' },
    style: { zh: '浅色文档。等宽代码。留白宽。', en: 'Light docs. Monospace code. Generous whitespace.' },
  },
  'elastic-ui': {
    lede: { zh: 'Elastic UI。SSPL 或 Elastic-2.0，源码可见。', en: 'Elastic UI. SSPL or Elastic-2.0; source-available.' },
    style: { zh: '浅色文档。高密度。克制圆角。', en: 'Light docs. High density. Restrained radii.' },
  },
  tdesign: {
    lede: { zh: 'TDesign React 组件。MIT。本条只收 React。', en: 'TDesign React components. MIT. This entry is React only.' },
    style: { zh: '浅色文档。品牌蓝。控件标本。', en: 'Light docs. Brand blue. Control specimens.' },
  },
  'arco-design': {
    lede: { zh: 'Arco Design React 组件。MIT。本条只收 React。', en: 'Arco Design React components. MIT. This entry is React only.' },
    style: { zh: '浅色文档。品牌蓝。企业控件目录。', en: 'Light docs. Brand blue. Enterprise control catalog.' },
  },
  'naive-ui': {
    lede: { zh: 'Vue 3 组件库。MIT。', en: 'Vue 3 component library. MIT.' },
    style: { zh: '浅色文档。中性。控件标本。', en: 'Light docs. Neutral. Control specimens.' },
  },
  'element-plus': {
    lede: { zh: 'Vue 3 组件库。MIT。', en: 'Vue 3 component library. MIT.' },
    style: { zh: '浅色文档。品牌蓝。控件目录。', en: 'Light docs. Brand blue. Control catalog.' },
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
    style: { zh: '深色产品文档。时间轴演示。', en: 'Dark product docs. Timeline demos.' },
  },
  'auto-animate': {
    lede: { zh: '零配置入场动画。MIT。', en: 'Zero-config enter/leave animation. MIT.' },
    style: { zh: '浅色单页文档。现场列表标本。', en: 'Light single-page docs. Live list specimens.' },
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
    style: { zh: '浅色文档。现场物理演示。', en: 'Light docs. Live physics demos.' },
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
    style: { zh: '浅色文档。粉红强调。代码标本。', en: 'Light docs. Pink accent. Code specimens.' },
  },
  formik: {
    lede: { zh: 'React 表单库。Apache-2.0。', en: 'React form library. Apache-2.0.' },
    style: { zh: '浅色文档。品牌蓝。API 页。', en: 'Light docs. Brand blue. API pages.' },
  },
  'react-spring': {
    lede: { zh: 'React 弹簧动画。MIT。与 Motion 不是同一库。', en: 'React spring animation. MIT. Distinct from Motion.' },
    style: { zh: '浅色文档。弹簧演示。中性。', en: 'Light docs. Spring demos. Neutral.' },
  },
  'use-gesture': {
    lede: { zh: '指针与手势钩子。MIT。', en: 'Pointer and gesture hooks. MIT.' },
    style: { zh: '浅色文档。手势示意图。中性。', en: 'Light docs. Gesture diagrams. Neutral.' },
  },
  'pico-css': {
    lede: { zh: '语义 HTML 的极简 CSS 框架。MIT。', en: 'Minimal CSS framework for semantic HTML. MIT.' },
    style: { zh: '深色营销首页。居中无衬线。紫白渐变标题。双按钮。低对比海军底。', en: 'Dark marketing homepage. Centered sans. Violet-to-white gradient title. Dual buttons. Low-contrast navy ground.' },
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
    style: { zh: '深色文档系统。左侧目录。插画横幅。饱和紫强调。几何徽标。', en: 'Dark documentation system. Left-hand TOC. Illustrated banner. Saturated purple accent. Geometric mark.' },
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
  vega: {
    lede: { zh: '可视化语法。BSD-3-Clause。', en: 'Visualization grammar. BSD-3-Clause.' },
    style: { zh: '浅色学术文档。靛蓝顶栏。可视化标本墙。衬线标题。', en: 'Light academic docs. Indigo top bar. Visualization specimen wall. Serif titles.' },
    acquire: {
      zh: [{ k: '命令行', v: 'npm install vega' }],
      en: [{ k: 'CLI', v: 'npm install vega' }],
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
