/* 舞台 · Agent 对话界面
 * 这台的主戏是热区：鼠标碰到哪一块，就报出那块的专业名词。
 * 覆盖现代旗舰级 Agent UI 的完整核心：Composer、思维链、工具瀑布流、产物画布。
 */
export default {
  id: 'agent-composer',
  titleZh: 'Agent 智能体交互界面',
  titleEn: 'Agentic Chat & Workspace UI',
  summaryZh: '旗舰级 Agent 交互全景。鼠标扫过任意部件报出正名；支持思考流光、工具调用瀑布流、产物协同分栏与像素级微调。',
  /* 标本一律中性：模型胶囊里写占位名，不出现任何真实产品名或模型名
   * （方案 §7.1 第 4 条——只学信息节奏，不搬运外观）。 */
  specimen: { model: '模型 A' },
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

  /* 分区按界面上的空间块切。「执行与产物」把工具调用与产物画布归在一起：
   * 它们回答的是同一个问题——Agent 做了什么、做出了什么。 */
  zones: [
    {
      id: 'shell',
      labelZh: '会话外壳',
      descriptionZh: '装着这场会话的框：左边的会话列表、顶上的标题栏与推理强度。',
      hotspotIds: [
        'atlas-component-component-thread-list-sidebar',
        'atlas-component-component-chat-header',
        'atlas-component-component-reasoning-effort',
      ],
    },
    {
      id: 'message',
      labelZh: '消息与推理',
      descriptionZh: '一条回复由哪些块组成：头像、思考过程、正文、引用、操作与追问。',
      hotspotIds: [
        'atlas-component-component-message-avatar',
        'atlas-component-component-reasoning-block',
        'atlas-component-component-chain-of-thought',
        'atlas-component-component-streaming-text',
        'atlas-component-component-inline-citation',
        'atlas-component-component-message-actions',
        'atlas-component-component-follow-up-suggestions',
      ],
    },
    {
      id: 'execution-artifact',
      labelZh: '执行与产物',
      descriptionZh: 'Agent 调了什么工具、做出了什么东西——过程与结果这一路。',
      hotspotIds: [
        'atlas-component-component-tool-call',
        'atlas-component-component-trace-waterfall',
        'atlas-component-component-artifact',
        'atlas-component-component-code-diff',
      ],
    },
    {
      id: 'composer',
      labelZh: '输入区 composer',
      descriptionZh: '整个输入区叫 composer，不是 input——这是最常被叫错的一个。',
      hotspotIds: [
        'atlas-component-component-composer',
        'atlas-component-component-prompt-input',
        'atlas-component-component-attachment-chip',
        'atlas-component-component-suggestion-chips',
      ],
    },
    {
      id: 'composer-toolbar',
      labelZh: '输入区工具栏',
      descriptionZh: '贴在输入框底部的那一排：模型、容量、语音。',
      hotspotIds: [
        'atlas-component-component-composer-toolbar',
        'atlas-component-component-model-selector',
        'atlas-component-component-token',
        'atlas-component-component-speech-input',
      ],
    },
    {
      id: 'form-and-timing',
      labelZh: '形态与节奏',
      descriptionZh: '整屏换一种形态，或者改变消息到达的节奏。',
      variantIds: [
        'atlas-component-component-mobile-composer',
        'atlas-component-component-composer-trigger-popover',
        'atlas-component-component-edit-a-sent-message',
      ],
      paramIds: ['atlas-component-component-message-timing'],
    },
  ],

  compareSets: [],

  positionRegions: [
    {
      region: 'header',
      termIds: [
        'atlas-component-component-chat-header',
        'atlas-component-component-reasoning-effort',
      ],
    },
    {
      region: 'sidebar',
      termIds: ['atlas-component-component-thread-list-sidebar'],
    },
    {
      region: 'composer',
      termIds: [
        'atlas-component-component-composer',
        'atlas-component-component-prompt-input',
        'atlas-component-component-composer-toolbar',
        'atlas-component-component-attachment-chip',
        'atlas-component-component-model-selector',
        'atlas-component-component-token',
        'atlas-component-component-speech-input',
        'atlas-component-component-suggestion-chips',
      ],
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
