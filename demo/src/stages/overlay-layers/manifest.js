/* 舞台 · 浮层
 * 这一族是被叫错最多的：tooltip 说成弹窗、popover 说成 modal、
 * toast 说成通知。它们的差别不在长相而在行为——有没有遮罩、抢不抢焦点、
 * 点外面关不关、要不要用户回应。同一个底页反复弹，差别才看得出来。
 */
export default {
  id: 'overlay-layers',
  titleZh: '浮层',
  titleEn: 'Overlays',
  summaryZh: '同一个底页，十三种浮层轮流弹一遍。左栏切换即换浮层类型，右下角标出它的遮罩、焦点与关闭行为。',
  specimen: { page: '账户设置' },
  baseVariantZh: '无浮层',

  claims: [
    {
      termId: 'atlas-component-component-tooltip',
      slot: 'variant',
      render: { preset: 'tooltip' },
      noteZh: '只在悬停/聚焦时出现，不抢焦点，不能容纳可交互内容。里面放按钮就已经不是 tooltip 了。',
    },
    {
      termId: 'atlas-component-component-popover-hint-explainer', termZhFix: 'popover=hint（提示型弹层）',
      slot: 'variant',
      render: { preset: 'popover-hint' },
      noteZh: 'popover=hint：轻量提示层，不抢焦点，被更高层的 auto 浮层打开时不会互相关闭。',
    },
    {
      termId: 'atlas-component-component-popover-api-explainer', termZhFix: 'Popover API（原生弹层）',
      slot: 'variant',
      render: { preset: 'popover-auto' },
      noteZh: 'popover=auto：点外面自动关（light dismiss），Esc 关，同层互斥。原生能力，不需要遮罩。',
    },
    {
      termId: 'atlas-component-component-dialog',
      slot: 'variant',
      render: { preset: 'dialog' },
      noteZh: '非模态对话框：浮起来了，但底页还能用。没有遮罩就不叫 modal。',
    },
    {
      termId: 'atlas-component-component-dialog-modal',
      slot: 'variant',
      render: { preset: 'dialog-modal' },
      noteZh: '模态：遮罩 + 焦点陷阱 + 底页惰性。用户不回应就走不了。',
    },
    {
      termId: 'atlas-component-component-alert', termZhFix: '状态提示条',
      slot: 'variant',
      render: { preset: 'alert' },
      noteZh: '页面内的状态条，不打断操作。跟必须回应的 alertdialog 是两回事。',
    },
    {
      termId: 'atlas-component-component-alert-and-message-dialogs', termZhFix: '警示对话框',
      slot: 'variant',
      render: { preset: 'alertdialog' },
      noteZh: 'alertdialog：模态且要求即时回应的那一种，屏幕阅读器会打断当前朗读。破坏性操作才配用它。',
    },
    {
      termId: 'atlas-component-component-notification-banner',
      slot: 'variant',
      render: { preset: 'banner' },
    },
    {
      termId: 'atlas-component-component-toast', termZhFix: '轻提示',
      slot: 'variant',
      render: { preset: 'toast' },
      noteZh: '自动消失、不抢焦点。放"确认删除吗"这种需要回应的内容是误用。',
    },
    {
      termId: 'atlas-component-component-search-dialog',
      slot: 'variant',
      render: { preset: 'search-dialog' },
    },
    {
      termId: 'atlas-component-component-command-palette', termZhFix: '命令面板',
      slot: 'variant',
      render: { preset: 'command-palette' },
      noteZh: '跟搜索对话框长得像，但它检索的是"能做什么"而不是"有什么"。',
    },
    {
      termId: 'atlas-component-component-assistant-modal', termZhFix: '助手模态框',
      slot: 'variant',
      render: { preset: 'assistant-modal' },
    },
    {
      termId: 'atlas-component-component-feedback-dialog',
      slot: 'variant',
      render: { preset: 'feedback-dialog' },
    },

    {
      termId: 'atlas-component-component-tooltip-icon-button', termZhFix: '带提示的图标按钮',
      slot: 'hotspot',
      node: 'page.iconbtn',
      noteZh: '只有图标的按钮必须自带无障碍名，tooltip 是给鼠标看的，不能替代 aria-label。',
    },
  ],

  knobs: [
    { key: 'backdrop', label: '遮罩浓度', min: 0, max: 80, step: 2, unit: '%', default: 42 },
    { key: 'overlayRadius', label: '浮层圆角', min: 0, max: 28, step: 1, unit: 'px', default: 12 },
    { key: 'offset', label: '锚点偏移', min: 0, max: 24, step: 1, unit: 'px', default: 8 },
  ],
}
