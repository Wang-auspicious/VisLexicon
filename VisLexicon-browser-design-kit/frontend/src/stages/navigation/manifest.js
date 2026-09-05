/* 舞台 · 导航
 * 一整屏应用外壳，把"带人去别处"的部件全摆齐。
 * 这一族的混乱在于层级：服务导航、主菜单、菜单栏、标签页看着都是一排链接，
 * 但它们回答的是不同层级的问题——离开这个服务、换个大区域、换个视图。
 */
export default {
  id: 'navigation',
  titleZh: '导航',
  titleEn: 'Navigation',
  summaryZh: '一整屏应用外壳。同样是一排链接，服务导航、菜单栏、标签页回答的是不同层级的问题。',
  specimen: { app: '视元控制台' },
  baseVariantZh: '桌面',

  claims: [
    {
      termId: 'atlas-component-component-skip-link', termZhFix: '跳转到主内容链接',
      slot: 'hotspot',
      node: 'nav.skip',
      noteZh: '只在键盘聚焦时出现的第一个可聚焦元素，让键盘用户绕过整片导航。视觉上看不见不等于不存在。',
    },
    {
      termId: 'atlas-component-component-service-navigation', termZhFix: '服务级导航',
      slot: 'hotspot',
      node: 'nav.service',
      noteZh: '跨服务/跨产品那一层，通常在最顶上。它不属于当前页面的内容结构。',
    },
    {
      termId: 'atlas-component-component-language-navigation', termZhFix: '语言切换导航',
      slot: 'hotspot',
      node: 'nav.lang',
    },
    {
      termId: 'atlas-component-component-menu-and-menubar', termZhFix: '菜单与菜单栏',
      slot: 'hotspot',
      node: 'nav.menubar',
      noteZh: 'ARIA 的 menubar：一排常驻的菜单入口，键盘模型跟普通链接排不一样。',
    },
    {
      termId: 'atlas-component-component-menu-button',
      slot: 'hotspot',
      node: 'nav.menubtn',
      noteZh: '负责把菜单弹出来的那个按钮。它自己不是菜单。',
    },
    {
      termId: 'atlas-component-component-menu',
      slot: 'hotspot',
      node: 'nav.menu',
      noteZh: '弹出来的那张列表。里面装的是动作，不是页面链接——装页面链接的那种叫导航。',
    },
    { termId: 'atlas-component-component-toolbar', slot: 'hotspot', node: 'nav.toolbar' },
    {
      termId: 'atlas-component-component-breadcrumb',
      slot: 'hotspot',
      node: 'nav.breadcrumb',
      noteZh: '语料里还有一条来自另一来源的 Breadcrumbs，指的是同一个东西，等去重决策。',
    },
    {
      termId: 'atlas-component-component-tabs', termZhFix: '标签页',
      slot: 'hotspot',
      node: 'nav.tabs',
      noteZh: '同一层级里换视图，不改变"我在哪"。会改变地址层级的那种不是标签页，是导航。',
    },
    { termId: 'atlas-component-component-pagination', slot: 'hotspot', node: 'nav.pagination' },
    {
      termId: 'atlas-component-component-back-link', termZhFix: '返回上一级链接',
      slot: 'hotspot',
      node: 'nav.back',
      noteZh: '回到上一层级，不是回到浏览历史的上一页。两者经常被做成同一个按钮，然后就错了。',
    },
    {
      termId: 'atlas-component-component-scroll-anchor', termZhFix: '页内锚点',
      slot: 'hotspot',
      node: 'nav.anchor',
    },
    {
      termId: 'atlas-component-component-scroll-button', termZhFix: '回到顶部按钮',
      slot: 'hotspot',
      node: 'nav.scrollbtn',
    },
    {
      termId: 'atlas-interaction-pattern-navigate-a-service', termZhFix: '服务导航流程',
      slot: 'variant',
      render: { preset: 'journey' },
      noteZh: '不是一个部件而是一条完整路径：起点、分支、确认、结果页。导航部件只是它的零件。',
    },
  ],

  knobs: [
    { key: 'railWidth', label: '侧栏宽度', min: 120, max: 240, step: 4, unit: 'px', default: 168 },
    { key: 'navGap', label: '导航间距', min: 6, max: 30, step: 1, unit: 'px', default: 14 },
    { key: 'radius', label: '圆角', min: 0, max: 18, step: 1, unit: 'px', default: 8 },
  ],
}
