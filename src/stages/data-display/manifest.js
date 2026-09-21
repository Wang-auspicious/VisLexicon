/* 舞台 · 数据展示
 * 一块看板，把"把数据摆出来"的部件全摆齐。这一族最大的混乱是四种表格类东西
 * 长得几乎一样却各有正名：静态表格、可交互数据表、ARIA grid、树形网格。
 * 摆在同一屏里对照，差别才立得住。
 */
export default {
  id: 'data-display',
  titleZh: '数据展示',
  titleEn: 'Data Display',
  summaryZh: '一块看板。表格类的四种正名摆在一起对照，标记类、树类、图类各归各位。',
  specimen: { title: '运行看板' },
  baseVariantZh: '常态',

  claims: [
    {
      termId: 'atlas-component-component-data-table',
      slot: 'hotspot',
      node: 'data.table',
      noteZh: '可排序、可筛选、可选行的那种。交互能力是它跟静态表格的分界。',
    },
    {
      termId: 'atlas-component-component-table', termZhFix: '静态表格',
      slot: 'hotspot',
      node: 'data.table.static',
      noteZh: '只呈现不交互。语义上就是一张表，不需要 grid 的键盘模型。',
    },
    {
      termId: 'atlas-component-component-grid-interactive-tabular-data-or-layout-container', termZhFix: 'Grid（可交互表格）',
      slot: 'hotspot',
      node: 'data.grid',
      noteZh: 'ARIA 的 grid：单元格自己可聚焦，方向键在格子间走。跟 CSS 的 grid 布局同名不同物。',
    },
    {
      termId: 'atlas-component-component-treegrid', termZhFix: '树形表格',
      slot: 'hotspot',
      node: 'data.treegrid',
      noteZh: '行可展开的 grid。既有层级又有列。',
    },
    {
      termId: 'atlas-aesthetic-design-phenomenon-tabular-numbers', termZhFix: '等宽数字',
      slot: 'hotspot',
      node: 'data.numcol',
      noteZh: '数字等宽对齐，跳动时不抖。数据表里不开这个，刷新一次整列都在晃。',
    },

    { termId: 'atlas-component-component-list', slot: 'hotspot', node: 'data.list' },
    {
      termId: 'atlas-component-component-listbox', termZhFix: '列表选择框',
      slot: 'hotspot',
      node: 'data.listbox',
      noteZh: '可选中的列表，有选中态和键盘选择模型。普通列表没有。',
    },
    { termId: 'atlas-component-component-tree-view', termZhFix: '树形视图', slot: 'hotspot', node: 'data.tree' },
    { termId: 'atlas-component-component-file-tree', slot: 'hotspot', node: 'data.filetree' },

    { termId: 'atlas-component-component-avatar', slot: 'hotspot', node: 'data.avatar' },
    {
      termId: 'atlas-component-component-badge',
      slot: 'hotspot',
      node: 'data.badge',
      noteZh: '附着在别的东西上的计数或状态点，自己不独立存在。',
    },
    {
      termId: 'atlas-component-component-disclosure-badge', termZhFix: '展开标记',
      slot: 'hotspot',
      node: 'data.badge.disclosure',
      noteZh: '标示"这里还能展开"的那个小记号。',
    },
    {
      termId: 'atlas-component-component-tag',
      slot: 'hotspot',
      node: 'data.tag',
      noteZh: '独立存在的分类标记，通常可点可删。徽章不可以。',
    },
    { termId: 'atlas-component-component-timeline', slot: 'hotspot', node: 'data.timeline' },

    { termId: 'atlas-component-component-chart', slot: 'hotspot', node: 'data.chart' },
    {
      termId: 'atlas-component-component-activity-graph', termZhFix: '活动热力格',
      slot: 'hotspot',
      node: 'data.activity',
      noteZh: '按天成格的活动密度图。GitHub 那块绿格子就是它。',
    },
    { termId: 'atlas-component-component-heat-graph', termZhFix: '热力图', slot: 'hotspot', node: 'data.heat' },
    { termId: 'atlas-component-component-flow-graph', slot: 'hotspot', node: 'data.flow' },
    { termId: 'atlas-component-component-code-block', slot: 'hotspot', node: 'data.code' },
  ],

  /* 分区按看板上的四块摆位切：表格、列表与树、标记、图形。 */
  zones: [
    {
      id: 'tabular',
      labelZh: '表格类',
      descriptionZh: '四种长得几乎一样的表格类正名，加上让数字不抖的那条排版要求。',
      hotspotIds: [
        'atlas-component-component-data-table',
        'atlas-component-component-table',
        'atlas-component-component-grid-interactive-tabular-data-or-layout-container',
        'atlas-component-component-treegrid',
        'atlas-aesthetic-design-phenomenon-tabular-numbers',
      ],
    },
    {
      id: 'lists-trees',
      labelZh: '列表与树',
      descriptionZh: '一列条目，差别在于能不能选中、有没有层级。',
      hotspotIds: [
        'atlas-component-component-list',
        'atlas-component-component-listbox',
        'atlas-component-component-tree-view',
        'atlas-component-component-file-tree',
      ],
    },
    {
      id: 'markers',
      labelZh: '标记类',
      descriptionZh: '附着或独立的小记号：头像、徽章、标签、时间线。',
      hotspotIds: [
        'atlas-component-component-avatar',
        'atlas-component-component-badge',
        'atlas-component-component-disclosure-badge',
        'atlas-component-component-tag',
        'atlas-component-component-timeline',
      ],
    },
    {
      id: 'graphics-code',
      labelZh: '图形与代码',
      descriptionZh: '把数值画成形状，或者把内容原样摊开。',
      hotspotIds: [
        'atlas-component-component-chart',
        'atlas-component-component-activity-graph',
        'atlas-component-component-heat-graph',
        'atlas-component-component-flow-graph',
        'atlas-component-component-code-block',
      ],
    },
  ],

  /* 四种表格类的差别在交互模型，语料里没给出逐条可核的行为判据，
   * 写不出「会改变实现的那条需求」就不上对照组。 */
  compareSets: [],

  positionRegions: [
    {
      region: 'main-table',
      termIds: [
        'atlas-component-component-data-table',
        'atlas-component-component-table',
        'atlas-component-component-grid-interactive-tabular-data-or-layout-container',
        'atlas-component-component-treegrid',
        'atlas-aesthetic-design-phenomenon-tabular-numbers',
        'atlas-component-component-list',
        'atlas-component-component-listbox',
        'atlas-component-component-tree-view',
        'atlas-component-component-file-tree',
        'atlas-component-component-avatar',
        'atlas-component-component-badge',
        'atlas-component-component-disclosure-badge',
        'atlas-component-component-tag',
        'atlas-component-component-timeline',
        'atlas-component-component-chart',
        'atlas-component-component-activity-graph',
        'atlas-component-component-heat-graph',
        'atlas-component-component-flow-graph',
        'atlas-component-component-code-block',
      ],
    },
  ],

  knobs: [
    { key: 'rowHeight', label: '行高', min: 22, max: 48, step: 1, unit: 'px', default: 30 },
    { key: 'cardGap', label: '卡片间距', min: 6, max: 32, step: 1, unit: 'px', default: 14 },
    { key: 'radius', label: '圆角', min: 0, max: 20, step: 1, unit: 'px', default: 10 },
  ],
}
