/* 舞台 · 过渡形变
 * 一族"东西怎么从 A 变成 B"的术语。它们的差别在于：谁在动、动的是同一个元素
 * 还是两个元素、以及是什么驱动的（点击 / 滚动 / 自动）。
 * 台内按驱动方式分了四种演示外壳：卡片展开、结构展开、轨道、滚动。
 */
export default {
  id: 'surface-transition',
  titleZh: '过渡形变',
  titleEn: 'Transitions',
  summaryZh: '同一批卡片，十六种从 A 到 B 的走法。关键差别不在快慢，而在动的是同一个元素还是两个。',
  specimen: { cards: ['声音', '光', '重量'] },
  baseVariantZh: '静止',

  claims: [
    {
      termId: 'atlas-motion-design-phenomenon-morph', termZhFix: '形变',
      slot: 'variant',
      render: { preset: 'morph', shell: 'card' },
      noteZh: '同一个元素改变形状与尺寸，中间没有替身。',
    },
    {
      termId: 'atlas-motion-design-phenomenon-shared-element-transition', termZhFix: '共享元素过渡',
      slot: 'variant',
      render: { preset: 'shared-element', shell: 'card' },
      noteZh: '两个视图里各有一个元素，被认定为同一个东西，于是接力飞过去。这是它和 morph 的分界。',
    },
    {
      termId: 'atlas-motion-design-phenomenon-continuity-transition', termZhFix: '连续性过渡',
      slot: 'variant',
      render: { preset: 'continuity', shell: 'card' },
      noteZh: '圆角、边距、层级在整段过渡里连续可推，用户不会"丢"掉自己刚才点的是哪个。',
    },
    {
      termId: 'atlas-motion-design-phenomenon-direction-aware-transition', termZhFix: '方向感知过渡',
      slot: 'variant',
      render: { preset: 'direction-aware', shell: 'card' },
      noteZh: '进场方向由触发位置决定：点左边的卡从左来。方向携带了"我从哪来"的信息。',
    },
    {
      termId: 'atlas-motion-design-phenomenon-page-transition', termZhFix: '页面过渡',
      slot: 'variant',
      render: { preset: 'page', shell: 'card' },
    },
    {
      termId: 'atlas-motion-design-phenomenon-scale', termZhFix: '缩放',
      slot: 'variant',
      render: { preset: 'scale', shell: 'card' },
    },
    {
      termId: 'atlas-motion-design-phenomenon-scale-in', termZhFix: '缩放入场',
      slot: 'variant',
      render: { preset: 'scale-in', shell: 'card' },
    },
    {
      termId: 'atlas-motion-design-phenomenon-slide-in',
      slot: 'variant',
      render: { preset: 'slide-in', shell: 'card' },
    },
    {
      termId: 'atlas-motion-design-phenomenon-3d-tilt-flip',
      slot: 'variant',
      render: { preset: 'flip', shell: 'card' },
    },

    {
      termId: 'atlas-component-component-accordion',
      slot: 'variant',
      render: { preset: 'accordion', shell: 'stack' },
      noteZh: '组件意义上的手风琴：一组可折叠区块，通常互斥。',
    },
    {
      termId: 'atlas-motion-design-phenomenon-accordion-collapse', termZhFix: '折叠展开',
      slot: 'variant',
      render: { preset: 'collapse', shell: 'stack' },
      noteZh: '动效意义上的折叠：高度从内容量算出来，不能写死，否则内容一变就跳。',
    },

    {
      termId: 'atlas-component-component-carousel',
      slot: 'variant',
      render: { preset: 'carousel', shell: 'track' },
    },
    {
      termId: 'atlas-component-component-carousel-slide-show-or-image-rotator', termZhFix: '轮播（自动幻灯片）',
      slot: 'variant',
      render: { preset: 'rotator', shell: 'track' },
      noteZh: '自动轮播。无障碍上要求可暂停，否则读屏和低视力用户追不上。',
    },

    {
      termId: 'atlas-motion-design-phenomenon-parallax',
      slot: 'variant',
      render: { preset: 'parallax', shell: 'scroll' },
      noteZh: '多层以不同速率位移，制造景深。层间速率差太大会晕。',
    },
    {
      termId: 'atlas-motion-design-phenomenon-scroll-reveal',
      slot: 'variant',
      render: { preset: 'scroll-reveal', shell: 'scroll' },
      noteZh: '进入视口时触发一次，是离散事件。',
    },
    {
      termId: 'atlas-motion-design-phenomenon-scroll-driven-animation', termZhFix: '滚动驱动动画',
      slot: 'variant',
      render: { preset: 'scroll-driven', shell: 'scroll' },
      noteZh: '进度由滚动位置连续驱动，能倒着播。这是它和滚动显示的本质差别。',
    },
  ],

  knobs: [
    { key: 'duration', label: '过渡时长', min: 120, max: 1400, step: 20, unit: 'ms', default: 520 },
    { key: 'distance', label: '位移距离', min: 0, max: 120, step: 4, unit: 'px', default: 40 },
    { key: 'radius', label: '卡片圆角', min: 0, max: 28, step: 1, unit: 'px', default: 12 },
  ],
}
