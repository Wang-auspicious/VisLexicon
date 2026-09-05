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
      zh: '深色全bleed动效营销。组件即广告。高饱和点缀。',
      en: 'Dark full-bleed motion marketing. Component-as-advert. Saturated accents.',
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
}

export function entryVoice(entryId) {
  return VOICE[entryId] || null
}

export function voiceText(entryId, field, locale) {
  const row = VOICE[entryId]?.[field]
  if (!row) return null
  return row[locale] || row.zh || null
}
