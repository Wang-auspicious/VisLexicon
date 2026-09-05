/* 舞台 · 文字与排版工坊 (Typography & Art Text Workshop)
 * 同一句 specimen，换一种演法就是换一条术语。
 * 覆盖：排版学基线度量、艺术字材质修辞（复古金属、霓虹、活版压凹）、字体动力学。
 */
export default {
  id: 'text-reveal',
  titleZh: '文字与排版工坊',
  titleEn: 'Typography & Kinetic Text',
  summaryZh: '微观字形度量、大号艺术字材质修辞与时间动力学。支持基线标尺校准、金属镀铬与逐字涌现对比。',
  specimen: { text: 'hello world' },
  baseVariantZh: '静止',

  claims: [
    /* ---- 热区：排版学度量标尺 ---- */
    {
      termId: 'atlas-component-component-typography',
      termZhFix: '排版度量与基线',
      slot: 'hotspot',
      node: 'typo.metrics',
      noteZh: '文字在垂直空间的物理标尺：基线 (Baseline)、x 字高 (X-height)、大写字高 (Cap-height) 与行高间距。',
    },

    /* ---- 变体：艺术字修辞与动力学演法 ---- */
    {
      termId: 'atlas-component-component-display-text',
      termZhFix: '大号艺术展示字',
      slot: 'variant',
      render: { preset: 'chrome' },
      noteZh: '36px 以上的大号展示字（Display Typography），模拟 80 年代复古镜面镀铬金属质感。',
    },
    {
      termId: 'atlas-component-component-inset-text',
      termZhFix: '活版印刷凹版字',
      slot: 'variant',
      render: { preset: 'deboss' },
      noteZh: '模拟传统铅字活版印刷在厚质棉纸上的凹陷刻痕与内阴影（Letterpress / Inset Deboss）。',
    },
    {
      termId: 'atlas-aesthetic-design-phenomenon-typewriter',
      slot: 'variant',
      render: { preset: 'typewriter' },
      noteZh: '逐字符出现，光标跟随。与流文本的区别在于它是定速的表演，不是真实到达速率。',
    },
    {
      termId: 'atlas-component-component-streaming-text',
      termZhFix: '流式文本',
      slot: 'variant',
      render: { preset: 'streaming' },
      noteZh: '按 token 成块吐出，节奏不均匀。这是 agent 界面的真实到达形态。',
    },
    {
      termId: 'atlas-motion-design-phenomenon-fade-in-fade-out',
      slot: 'variant',
      render: { preset: 'fade' },
    },
    {
      termId: 'atlas-aesthetic-design-phenomenon-blur',
      slot: 'variant',
      render: { preset: 'blur' },
      noteZh: '浮现常配 blur→0 的解焦，比纯透明度更有"从景深里走出来"的感觉。',
    },
    {
      termId: 'atlas-motion-design-phenomenon-reveal',
      termZhFix: '遮罩揭示',
      slot: 'variant',
      render: { preset: 'mask' },
      noteZh: '遮罩擦除：字不动，露出它的那块窗口在动。',
    },
    {
      termId: 'atlas-motion-design-phenomenon-scroll-reveal',
      termZhFix: '洗色揭示 (Scrub Wipe)',
      slot: 'variant',
      render: { preset: 'scrub' },
      noteZh: '苹果官网常用的滑动洗色：文字本是暗色，遮罩按进度渐进划过点亮。',
    },
    {
      termId: 'atlas-motion-design-phenomenon-3d-tilt-flip',
      termZhFix: '3D 翻转浮现',
      slot: 'variant',
      render: { preset: 'tumble' },
      noteZh: '沿 X 轴 3D 翻转入场，增加空间景深感。',
    },
    {
      termId: 'atlas-motion-design-phenomenon-crossfade',
      slot: 'variant',
      render: { preset: 'crossfade' },
    },
    {
      termId: 'atlas-aesthetic-design-phenomenon-text-morph',
      slot: 'variant',
      render: { preset: 'morph' },
    },
    {
      termId: 'atlas-motion-design-phenomenon-marquee',
      termZhFix: '跑马灯',
      slot: 'variant',
      render: { preset: 'marquee' },
    },
    {
      termId: 'atlas-component-component-text-shimmer',
      termZhFix: '文字流光',
      slot: 'variant',
      render: { preset: 'shimmer' },
      noteZh: '常被误当作加载态；它是持续循环的高光扫过，不表示进度。',
    },

    /* ---- 参数 ---- */
    {
      termId: 'atlas-motion-design-phenomenon-stagger',
      slot: 'param',
      param: { key: 'stagger', label: '逐字延迟', min: 0, max: 200, step: 5, unit: 'ms', default: 40 },
      noteZh: '把这个拖到 0，逐字浮现立刻塌回整句浮现——交错本身就是效果。',
    },
  ],

  /* 变体台：分区就是变体分组。按「字本身长什么样」与「字怎么到达」切。 */
  zones: [
    {
      id: 'glyph-material',
      labelZh: '字形与材质',
      descriptionZh: '字不动的时候看什么：垂直度量，以及大号展示字的材质修辞。',
      hotspotIds: ['atlas-component-component-typography'],
      variantIds: [
        'atlas-component-component-display-text',
        'atlas-component-component-inset-text',
      ],
    },
    {
      id: 'per-char-arrival',
      labelZh: '逐字到达',
      descriptionZh: '字一个一个出现。定速的表演与真实到达速率是两回事。',
      variantIds: [
        'atlas-aesthetic-design-phenomenon-typewriter',
        'atlas-component-component-streaming-text',
      ],
      paramIds: ['atlas-motion-design-phenomenon-stagger'],
    },
    {
      id: 'reveal',
      labelZh: '浮现与揭示',
      descriptionZh: '整句一次到位，差别在于用什么方式从无到有。',
      variantIds: [
        'atlas-motion-design-phenomenon-fade-in-fade-out',
        'atlas-aesthetic-design-phenomenon-blur',
        'atlas-motion-design-phenomenon-reveal',
        'atlas-motion-design-phenomenon-scroll-reveal',
        'atlas-motion-design-phenomenon-3d-tilt-flip',
      ],
    },
    {
      id: 'swap-loop',
      labelZh: '替换与循环',
      descriptionZh: '不是出现一次，而是一直在换或一直在动。',
      variantIds: [
        'atlas-motion-design-phenomenon-crossfade',
        'atlas-aesthetic-design-phenomenon-text-morph',
        'atlas-motion-design-phenomenon-marquee',
        'atlas-component-component-text-shimmer',
      ],
    },
  ],

  compareSets: [],

  /* 排版标本不长在七个页面位置区域里的任何一格：它是一段文字本身，
   * 不是界面上的某一块。留空比硬塞一个区域诚实。 */
  positionRegions: [],

  knobs: [
    { key: 'duration', label: '单字时长', min: 120, max: 1600, step: 20, unit: 'ms', default: 620 },
    { key: 'fontSize', label: '字号', min: 28, max: 132, step: 2, unit: 'px', default: 68 },
    { key: 'travel', label: '位移', min: 0, max: 64, step: 2, unit: 'px', default: 18 },
    { key: 'letterSpacing', label: '字距 Tracking', min: -4, max: 24, step: 1, unit: 'px', default: 0 },
    { key: 'baselineGuide', label: '显示排版标尺', type: 'boolean', default: false },
  ],
}
