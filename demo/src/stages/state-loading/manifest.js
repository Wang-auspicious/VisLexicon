/* 舞台 · 状态与加载
 * 同一块面板的四种状态：就绪、加载中、空、错误。
 * 这一族的正名混乱在于把"没有数据"和"加载失败"都叫空状态，
 * 以及把骨架屏、流光、转圈三者混着叫加载。它们解决的问题不同。
 */
export default {
  id: 'state-loading',
  titleZh: '状态与加载',
  titleEn: 'States & Loading',
  summaryZh: '同一块面板的四种状态轮流上。骨架屏、流光、转圈不是一回事：一个占位，一个示意还活着，一个只说在忙。',
  specimen: { title: '最近运行' },
  baseVariantZh: '就绪',

  claims: [
    {
      termId: 'atlas-aesthetic-design-phenomenon-skeleton-shimmer', termZhFix: '骨架屏 / 流光',
      slot: 'variant',
      render: { preset: 'loading' },
      noteZh: '骨架屏承诺了将要出现的版式，所以它的形状必须跟真实内容对得上，否则内容一到就跳版。',
    },
    {
      termId: 'atlas-component-component-empty-state',
      slot: 'variant',
      render: { preset: 'empty' },
      noteZh: '空状态要给出下一步动作，只画一张灰图说"暂无数据"等于把用户扔在原地。',
    },
    {
      termId: 'atlas-component-component-error-state',
      slot: 'variant',
      render: { preset: 'error' },
      noteZh: '错误状态必须可重试，并说清是谁的问题。它跟空状态是两回事，别共用一张插图。',
    },

    {
      termId: 'atlas-component-component-skeleton', termZhFix: '骨架屏',
      slot: 'hotspot',
      node: 'state.skeleton',
      underVariant: 'atlas-aesthetic-design-phenomenon-skeleton-shimmer',
      noteZh: '占位形状本身。',
    },
    {
      termId: 'atlas-component-component-shimmer', termZhFix: '流光',
      slot: 'hotspot',
      node: 'state.shimmer',
      underVariant: 'atlas-aesthetic-design-phenomenon-skeleton-shimmer',
      noteZh: '扫过骨架的那道高光。它只表示"还活着"，不表示进度。',
    },
    {
      termId: 'atlas-component-component-loader', termZhFix: '加载指示器',
      slot: 'hotspot',
      node: 'state.loader',
      noteZh: '转圈：只说在忙，不承诺时长也不承诺版式。超过几秒就该换成有进度的形态。',
    },
    {
      termId: 'atlas-component-component-job-progress', termZhFix: '任务进度',
      slot: 'hotspot',
      node: 'state.job',
      noteZh: '有确定进度的长任务。能给百分比就别用转圈。',
    },
    {
      termId: 'atlas-component-component-connection-state',
      slot: 'hotspot',
      node: 'state.conn',
    },
    {
      termId: 'atlas-component-component-number-ticker', termZhFix: '数字滚动',
      slot: 'hotspot',
      node: 'state.ticker',
      noteZh: '数值变化时滚动过去而不是直接跳。配等宽数字才不抖。',
    },
  ],

  knobs: [
    { key: 'skeletonRows', label: '骨架行数', min: 2, max: 8, step: 1, unit: '行', default: 4 },
    { key: 'radius', label: '圆角', min: 0, max: 20, step: 1, unit: 'px', default: 10 },
    { key: 'shimmerMs', label: '流光周期', min: 600, max: 3000, step: 100, unit: 'ms', default: 1600 },
  ],
}
