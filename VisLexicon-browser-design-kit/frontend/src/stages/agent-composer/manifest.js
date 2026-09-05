/* 舞台 · Agent 对话界面
 * 这台的主戏是热区：鼠标碰到哪一块，就报出那块的专业名词。
 * 覆盖现代旗舰级 Agent UI 的完整核心：Composer、思维链、工具瀑布流、产物画布。
 */
export default {
  id: 'agent-composer',
  titleZh: 'Agent 智能体交互界面',
  titleEn: 'Agentic Chat & Workspace UI',
  summaryZh: '旗舰级 Agent 交互全景。鼠标扫过任意部件报出正名；支持思考流光、工具调用瀑布流、产物协同分栏与像素级微调。',
  specimen: { model: 'Claude Opus 5' },
  baseVariantZh: '桌面 · 常态',

  claims: [
    /* ---- 热区：界面上每一块叫什么 ---- */
    { termId: 'atlas-component-component-thread-list-sidebar', termZhFix: '会话列表侧栏', slot: 'hotspot', node: 'shell.sidebar' },
    { termId: 'atlas-component-component-chat-header', termZhFix: '会话标题栏', slot: 'hotspot', node: 'shell.header' },
    { termId: 'atlas-component-component-message-avatar', slot: 'hotspot', node: 'thread.msg.avatar' },
    { termId: 'atlas-component-component-message-actions', slot: 'hotspot', node: 'thread.msg.actions' },
    {
      termId: 'atlas-component-component-reasoning-block', termZhFix: '思考过程块',
      slot: 'hotspot',
      node: 'thread.msg.reasoning',
      noteZh: '折叠的思考过程。展开态与收起态是两个不同部件，带有微光呼吸动画。',
    },
    { termId: 'atlas-component-component-reasoning-effort', termZhFix: '推理强度', slot: 'hotspot', node: 'thread.msg.effort' },
    { termId: 'atlas-component-component-chain-of-thought', termZhFix: '思维链', slot: 'hotspot', node: 'thread.msg.cot' },
    { termId: 'atlas-component-component-inline-citation', slot: 'hotspot', node: 'thread.msg.citation' },
    { termId: 'atlas-component-component-tool-call', slot: 'hotspot', node: 'thread.toolcall' },
    { termId: 'atlas-component-component-trace-waterfall', termZhFix: '执行轨迹瀑布流', slot: 'hotspot', node: 'thread.waterfall' },
    { termId: 'atlas-component-component-follow-up-suggestions', slot: 'hotspot', node: 'thread.followups' },
    {
      termId: 'atlas-component-component-composer', termZhFix: '输入区',
      slot: 'hotspot',
      node: 'composer.root',
      noteZh: '整个输入区叫 composer，不是 input。这是最常被叫错的一个。',
    },
    { termId: 'atlas-component-component-prompt-input', termZhFix: '提示词输入框', slot: 'hotspot', node: 'composer.input' },
    { termId: 'atlas-component-component-composer-toolbar', termZhFix: '输入区工具栏', slot: 'hotspot', node: 'composer.toolbar' },
    { termId: 'atlas-component-component-attachment-chip', termZhFix: '多模态附件胶囊', slot: 'hotspot', node: 'composer.attachment' },
    { termId: 'atlas-component-component-model-selector', termZhFix: '模型选择器', slot: 'hotspot', node: 'composer.model' },
    { termId: 'atlas-component-component-token', termZhFix: '词元容量计量', slot: 'hotspot', node: 'composer.tokens' },
    { termId: 'atlas-component-component-speech-input', slot: 'hotspot', node: 'composer.mic' },
    { termId: 'atlas-component-component-suggestion-chips', termZhFix: '建议标签', slot: 'hotspot', node: 'composer.suggestions' },
    {
      termId: 'atlas-component-component-streaming-text', termZhFix: '流式文本',
      slot: 'hotspot',
      node: 'thread.msg.stream',
      noteZh: '同一条术语在"文字浮现"台是可切换的变体，在这里是界面上的一块。跨台互引见右栏。',
    },
    {
      termId: 'atlas-component-component-artifact', termZhFix: '产物画布',
      slot: 'hotspot',
      node: 'workspace.artifact',
      noteZh: '当 Agent 生成独立代码、文档或可视化产物时，右侧独立展开的交互协同空间。',
    },
    {
      termId: 'atlas-component-component-code-diff', termZhFix: '代码差异对比',
      slot: 'hotspot',
      node: 'artifact.diff',
      noteZh: '展示行内红绿代码修改比对与采纳操作。',
    },

    /* ---- 变体：整屏换一种形态 ---- */
    {
      termId: 'atlas-component-component-mobile-composer', termZhFix: '移动端输入区',
      slot: 'variant',
      render: { preset: 'mobile' },
      noteZh: '窄屏下工具栏收进省略键、附件降级为角标，不是等比缩小。',
    },
    {
      termId: 'atlas-component-component-composer-trigger-popover', termZhFix: '输入区触发弹层',
      slot: 'variant',
      render: { preset: 'popover' },
    },
    {
      termId: 'atlas-component-component-edit-a-sent-message',
      slot: 'variant',
      render: { preset: 'editing' },
    },

    /* ---- 参数 ---- */
    {
      termId: 'atlas-component-component-message-timing', termZhFix: '消息节奏',
      slot: 'param',
      param: { key: 'streamMs', label: '成块间隔', min: 0, max: 400, step: 10, unit: 'ms', default: 70 },
    },
  ],

  /* 微调旋钮：支持像素级微调、呼吸光强度与分栏控制 */
  knobs: [
    { key: 'composerInset', label: 'composer 距底', min: 0, max: 48, step: 1, unit: 'px', default: 18 },
    { key: 'radius', label: '圆角半径', min: 0, max: 28, step: 1, unit: 'px', default: 14 },
    { key: 'gap', label: '消息间距', min: 4, max: 40, step: 1, unit: 'px', default: 16 },
    { key: 'glowIntensity', label: '微光强度', min: 0, max: 100, step: 5, unit: '%', default: 75 },
    { key: 'showArtifact', label: '展开产物画布', type: 'boolean', default: true },
  ],
}
