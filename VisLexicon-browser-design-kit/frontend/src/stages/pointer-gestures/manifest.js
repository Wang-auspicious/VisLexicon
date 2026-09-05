/* 舞台 · 指针与手势
 * 组件库的清单只回答"界面上有哪些块"，回答不了"手指和指针在做什么"。
 * 这一族的词全在交互库文档里：阈值、轴锁、橡皮筋回弹、指针捕获、点击过滤。
 * 台上的每个参数都真的接到那个可拖的方块上——拖动阈值调到 40，
 * 就得挪够 40px 才开始跟手；关掉 filterTaps，一次轻点也会被算成拖拽。
 */
export default {
  id: 'pointer-gestures',
  titleZh: '指针与手势',
  titleEn: 'Pointer & Gestures',
  summaryZh: '一个真能拖的方块。左栏换手势类型，下方每个参数都实际生效——调完就知道这些词各自管什么。',
  specimen: { tile: '拖我' },
  baseVariantZh: '未绑定',

  claims: [
    /* ---- 变体：绑的是哪种手势 ---- */
    {
      termId: 'atlas-interaction-design-phenomenon-usedrag', termZhFix: '拖拽手势',
      slot: 'variant',
      render: { preset: 'drag' },
      noteZh: '指针按下并移动。它跟原生 HTML5 拖放不是一回事：原生拖放有系统接管的拖影和 drop 事件，这里只是指针位移。',
    },
    {
      termId: 'atlas-interaction-design-phenomenon-usemove', termZhFix: '移动手势',
      slot: 'variant',
      render: { preset: 'move' },
      noteZh: '不需要按下，指针移动即触发。悬停类效果用它，不用拖拽。',
    },
    {
      termId: 'atlas-interaction-design-phenomenon-usehover', termZhFix: '悬停手势',
      slot: 'variant',
      render: { preset: 'hover' },
      noteZh: '只关心进入和离开，不关心中间轨迹。触屏上没有悬停，所以悬停不能承载唯一入口。',
    },
    {
      termId: 'atlas-interaction-design-phenomenon-usescroll', termZhFix: '滚动手势',
      slot: 'variant',
      render: { preset: 'scroll' },
    },
    {
      termId: 'atlas-interaction-design-phenomenon-usewheel', termZhFix: '滚轮手势',
      slot: 'variant',
      render: { preset: 'wheel' },
      noteZh: '滚轮和滚动是两件事：滚轮是输入设备事件，滚动是容器位置变化。触控板惯性滚动会产生大量滚轮事件。',
    },
    {
      termId: 'atlas-interaction-design-phenomenon-usepinch', termZhFix: '捏合手势',
      slot: 'variant',
      render: { preset: 'pinch' },
      noteZh: '双指缩放。桌面上用 Ctrl + 滚轮模拟，本台即按此演示。',
    },
    {
      termId: 'atlas-interaction-design-phenomenon-usepress', termZhFix: '按压手势',
      slot: 'variant',
      render: { preset: 'press' },
      noteZh: '按下与抬起的完整一次。它比 click 早，也能被中途取消——手指滑出元素再抬起就不算数。',
    },
    {
      termId: 'atlas-interaction-design-phenomenon-uselongpress', termZhFix: '长按手势',
      slot: 'variant',
      render: { preset: 'longpress' },
      noteZh: '按住不动到时长阈值。移动端替代右键，但必须给出进度反馈，否则用户不知道要按多久。',
    },
    {
      termId: 'atlas-interaction-design-phenomenon-usegesture', termZhFix: '组合手势',
      slot: 'variant',
      render: { preset: 'gesture' },
      noteZh: '把多种手势绑在同一个元素上，冲突需要自己裁决：拖拽进行中就不该再响应滚动。',
    },

    /* ---- 热区：场景里被命名的那几块 ---- */
    {
      termId: 'atlas-interaction-design-phenomenon-drag', termZhFix: '拖拽',
      slot: 'hotspot',
      node: 'gesture.tile',
      noteZh: '被拖的那个东西。它和"拖拽手势"是一物两面：一个是名词，一个是绑上去的行为。',
    },
    {
      termId: 'atlas-component-component-drop-zone', termZhFix: '放置区',
      slot: 'hotspot',
      node: 'gesture.dropzone',
      noteZh: '接收放置的目标区域。必须在悬停时就给出可否放置的反馈，等松手才说不行是最差的做法。',
    },
    {
      termId: 'atlas-interaction-design-phenomenon-press-tap-feedback', termZhFix: '按压反馈',
      slot: 'hotspot',
      node: 'gesture.press',
      noteZh: '按下的那一刻就要有反应，不能等抬起。延迟超过 100ms 用户就会怀疑没点上。',
    },
    {
      termId: 'atlas-interaction-design-phenomenon-focusring', termZhFix: '焦点环',
      slot: 'hotspot',
      node: 'gesture.focusring',
      noteZh: '键盘用户的位置指示。鼠标点击时不该出现，这正是 focus-visible 要解决的问题。',
    },
    {
      termId: 'atlas-interaction-design-phenomenon-swipe-to-dismiss', termZhFix: '滑动关闭',
      slot: 'hotspot',
      node: 'gesture.dismiss',
      noteZh: '滑过阈值就移除。必须可撤销，否则一次误滑就丢东西。',
    },
    {
      termId: 'atlas-interaction-design-phenomenon-drag-to-reorder', termZhFix: '拖拽重排',
      slot: 'hotspot',
      node: 'gesture.reorder',
      noteZh: '拖动改变顺序。键盘也必须能重排，否则这条路径对键盘用户就是断的。',
    },

    /* ---- 参数：连续量 ---- */
    {
      termId: 'atlas-interaction-design-phenomenon-threshold', termZhFix: '启动阈值',
      slot: 'param',
      param: { key: 'threshold', label: '启动阈值', type: 'range', min: 0, max: 60, step: 1, unit: 'px', default: 0 },
      noteZh: '挪够这么多像素才算开始。列表里的可拖项必须设阈值，否则轻微抖动就把滚动吃掉了。',
    },
    {
      termId: 'atlas-interaction-design-phenomenon-axisthreshold', termZhFix: '轴判定阈值',
      slot: 'param',
      param: { key: 'axisThreshold', label: '轴判定阈值', type: 'range', min: 0, max: 40, step: 1, unit: 'px', default: 0 },
      noteZh: '走多远才判定用户想沿哪个轴走。太小会误判，太大会迟钝。',
    },
    {
      termId: 'atlas-interaction-design-phenomenon-tapsthreshold', termZhFix: '点击判定阈值',
      slot: 'param',
      param: { key: 'tapsThreshold', label: '点击判定阈值', type: 'range', min: 0, max: 20, step: 1, unit: 'px', default: 3 },
      noteZh: '位移在这个数以内就算点击而不是拖拽。手指比鼠标抖得多，触屏上要放宽。',
    },
    {
      termId: 'atlas-interaction-design-phenomenon-delay', termZhFix: '延迟触发',
      slot: 'param',
      param: { key: 'delay', label: '延迟触发', type: 'range', min: 0, max: 800, step: 20, unit: 'ms', default: 0 },
    },
    {
      termId: 'atlas-interaction-design-phenomenon-bounds',
      slot: 'param',
      param: { key: 'bounds', label: '边界内缩', type: 'range', min: 0, max: 80, step: 2, unit: 'px', default: 0 },
      noteZh: '可活动范围。配合橡皮筋才不会撞到边就硬停。',
    },
    {
      termId: 'atlas-interaction-design-phenomenon-rubberband', termZhFix: '橡皮筋回弹',
      slot: 'param',
      param: { key: 'rubberband', label: '橡皮筋', type: 'range', min: 0, max: 1, step: 0.05, unit: '', default: 0.15 },
      noteZh: '越界后按系数衰减位移，松手弹回。它把"到头了"变成手感而不是一堵墙。',
    },
    {
      termId: 'atlas-interaction-design-phenomenon-swipe-distance', termZhFix: '滑动距离阈值',
      slot: 'param',
      param: { key: 'swipeDistance', label: '滑动距离阈值', type: 'range', min: 10, max: 200, step: 5, unit: 'px', default: 50 },
    },
    {
      termId: 'atlas-interaction-design-phenomenon-swipe-velocity', termZhFix: '滑动速度阈值',
      slot: 'param',
      param: { key: 'swipeVelocity', label: '滑动速度阈值', type: 'range', min: 0, max: 2, step: 0.05, unit: 'px/ms', default: 0.5 },
      noteZh: '快速短滑也该算滑动，所以速度和距离是或的关系，不是与。',
    },
    {
      termId: 'atlas-interaction-design-phenomenon-swipe-duration', termZhFix: '滑动时限',
      slot: 'param',
      param: { key: 'swipeDuration', label: '滑动时限', type: 'range', min: 100, max: 1200, step: 50, unit: 'ms', default: 250 },
    },
    {
      termId: 'atlas-interaction-design-phenomenon-from', termZhFix: '起始偏移',
      slot: 'param',
      param: { key: 'from', label: '起始偏移', type: 'range', min: -80, max: 80, step: 4, unit: 'px', default: 0 },
    },
    {
      termId: 'atlas-interaction-design-phenomenon-anglebounds', termZhFix: '角度约束',
      slot: 'param',
      param: { key: 'angleBounds', label: '角度约束', type: 'range', min: 0, max: 90, step: 5, unit: '°', default: 90 },
    },
    {
      termId: 'atlas-interaction-design-phenomenon-scalebounds', termZhFix: '缩放上限',
      slot: 'param',
      param: { key: 'scaleBounds', label: '缩放上限', type: 'range', min: 1, max: 4, step: 0.1, unit: '×', default: 2 },
    },

    /* ---- 参数：开关 ---- */
    {
      termId: 'atlas-interaction-design-phenomenon-filtertaps', termZhFix: '过滤轻点',
      slot: 'param',
      param: { key: 'filterTaps', label: '过滤轻点', type: 'boolean', default: true },
      noteZh: '开着时，位移没超过点击阈值就不算拖拽。关掉试试：一次轻点也会被当成一次拖拽开始。',
    },
    {
      termId: 'atlas-interaction-design-phenomenon-preventscroll', termZhFix: '阻止滚动',
      slot: 'param',
      param: { key: 'preventScroll', label: '阻止滚动', type: 'boolean', default: true },
      noteZh: '触屏上不阻止，纵向拖拽会被页面滚动抢走。对应 CSS 的 touch-action。',
    },
    {
      termId: 'atlas-interaction-design-phenomenon-preventdefault', termZhFix: '阻止默认行为',
      slot: 'param',
      param: { key: 'preventDefault', label: '阻止默认行为', type: 'boolean', default: false },
    },
    {
      termId: 'atlas-interaction-design-phenomenon-pointer-capture', termZhFix: '指针捕获',
      slot: 'param',
      param: { key: 'pointerCapture', label: '指针捕获', type: 'boolean', default: true },
      noteZh: '把后续指针事件锁到这个元素上。关掉后手指滑出方块，拖拽就断了——这是拖拽最常见的 bug 来源。',
    },
    {
      termId: 'atlas-interaction-design-phenomenon-pointer-touch', termZhFix: '接受触摸指针',
      slot: 'param',
      param: { key: 'pointerTouch', label: '接受触摸指针', type: 'boolean', default: true },
    },
    {
      termId: 'atlas-interaction-design-phenomenon-pointer-lock', termZhFix: '指针锁定',
      slot: 'param',
      param: { key: 'pointerLock', label: '指针锁定', type: 'boolean', default: false },
      noteZh: '隐藏光标并只报相对位移，用于第一人称视角这类场景。跟指针捕获完全是两回事。',
    },
    {
      termId: 'atlas-interaction-design-phenomenon-triggerallevents', termZhFix: '上报全部事件',
      slot: 'param',
      param: { key: 'triggerAllEvents', label: '上报全部事件', type: 'boolean', default: false },
    },
    {
      termId: 'atlas-interaction-design-phenomenon-enabled', termZhFix: '启用',
      slot: 'param',
      param: { key: 'enabled', label: '启用', type: 'boolean', default: true },
    },

    /* ---- 参数：枚举 ---- */
    {
      termId: 'atlas-interaction-design-phenomenon-axis', termZhFix: '轴锁定',
      slot: 'param',
      param: { key: 'axis', label: '轴锁定', type: 'enum', choices: ['none', 'x', 'y', 'lock'], default: 'none' },
      noteZh: 'lock 是按用户起手方向自动定轴，跟写死 x 或 y 不一样。',
    },
    {
      termId: 'atlas-interaction-design-phenomenon-preventscrollaxis', termZhFix: '阻止滚动的轴',
      slot: 'param',
      param: { key: 'preventScrollAxis', label: '阻止滚动的轴', type: 'enum', choices: ['x', 'y', 'xy'], default: 'y' },
    },
    {
      termId: 'atlas-interaction-design-phenomenon-modifierkey', termZhFix: '修饰键',
      slot: 'param',
      param: { key: 'modifierKey', label: '修饰键', type: 'enum', choices: ['none', 'ctrlKey', 'altKey', 'metaKey'], default: 'none' },
    },
    {
      termId: 'atlas-interaction-design-phenomenon-pointer-buttons', termZhFix: '响应的按键',
      slot: 'param',
      param: { key: 'pointerButtons', label: '响应的按键', type: 'enum', choices: ['主键', '任意键'], default: '主键' },
    },
  ],

  knobs: [
    { key: 'tileSize', label: '方块尺寸', min: 44, max: 120, step: 2, unit: 'px', default: 76 },
    { key: 'radius', label: '圆角', min: 0, max: 38, step: 1, unit: 'px', default: 14 },
  ],
}
