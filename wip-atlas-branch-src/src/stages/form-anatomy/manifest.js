/* 舞台 · 表单解剖
 * 与 Agent 界面台同构：一整张表单摆开，鼠标扫到哪块就报出那块的正名。
 * 表单是术语密度最高的地方，也是最容易把"控件"和"控件组"混着叫的地方——
 * checkbox 与 checkboxes、radio button 与 radio group，界面上是不同的东西。
 */
export default {
  id: 'form-anatomy',
  titleZh: '表单解剖',
  titleEn: 'Form Anatomy',
  summaryZh: '一张完整表单。鼠标扫过任意控件即报出正名；单个控件与控件组分开命名，别混着叫。',
  specimen: { title: '创建工作区' },
  baseVariantZh: '常态',

  claims: [
    { termId: 'atlas-component-component-fieldset', termZhFix: '字段组', slot: 'hotspot', node: 'form.fieldset' },
    { termId: 'atlas-component-component-text-input', termZhFix: '单行文本框', slot: 'hotspot', node: 'form.text' },
    { termId: 'atlas-component-component-search-input', slot: 'hotspot', node: 'form.search' },
    { termId: 'atlas-component-component-password-input', slot: 'hotspot', node: 'form.password' },
    { termId: 'atlas-component-component-number-input', termZhFix: '数字输入框', slot: 'hotspot', node: 'form.number' },
    { termId: 'atlas-component-component-date-input', slot: 'hotspot', node: 'form.date' },
    {
      termId: 'atlas-component-component-datepicker',
      slot: 'hotspot',
      node: 'form.date.picker',
      noteZh: '日期输入是那个框，日期选择器是它弹出的那张日历。两者可以分开存在。',
    },
    { termId: 'atlas-component-component-select', termZhFix: '原生下拉框', slot: 'hotspot', node: 'form.select' },
    {
      termId: 'atlas-component-component-dropdown-select', termZhFix: '自绘下拉框',
      slot: 'hotspot',
      node: 'form.dropdown',
      noteZh: '自绘的下拉，不是原生 select。样式自由，无障碍要自己补齐。',
    },
    {
      termId: 'atlas-component-component-combobox',
      slot: 'hotspot',
      node: 'form.combobox',
      noteZh: '可输入 + 可筛选的下拉。只能选不能打字的那种不叫 combobox。',
    },
    {
      termId: 'atlas-component-component-checkbox',
      slot: 'hotspot',
      node: 'form.checkbox',
      noteZh: '单个复选框。',
    },
    {
      termId: 'atlas-component-component-checkboxes', termZhFix: '复选框组',
      slot: 'hotspot',
      node: 'form.checkbox.group',
      noteZh: '复选框组。一组共享一个问题，所以需要一个组级说明，而不是每个都自带标签。',
    },
    { termId: 'atlas-component-component-radio-button', slot: 'hotspot', node: 'form.radio' },
    {
      termId: 'atlas-component-component-radio-group', termZhFix: '单选组',
      slot: 'hotspot',
      node: 'form.radio.group',
      noteZh: '单选组内部只有一个 tab 停靠点，方向键在组内移动。这是它和复选框组最大的行为差别。',
    },
    { termId: 'atlas-component-component-switch', slot: 'hotspot', node: 'form.switch' },
    { termId: 'atlas-component-component-slider', slot: 'hotspot', node: 'form.slider' },
    { termId: 'atlas-component-component-slider-multi-thumb', termZhFix: '多滑块滑杆', slot: 'hotspot', node: 'form.slider.multi' },
    { termId: 'atlas-component-component-textarea', termZhFix: '多行文本框', slot: 'hotspot', node: 'form.textarea' },
    {
      termId: 'atlas-component-component-character-count', termZhFix: '字数计数',
      slot: 'hotspot',
      node: 'form.charcount',
      noteZh: '超限后要能继续输入并给出提示，硬截断会丢用户已写的内容。',
    },
    { termId: 'atlas-component-component-file-upload', slot: 'hotspot', node: 'form.upload' },
    { termId: 'atlas-component-component-error-message', slot: 'hotspot', node: 'form.error' },
  ],

  /* 分区：按表单里的功能块切，每区 3–7 条。
   * 「多选与单选」这一区就是对照组 form-choice-controls 的舞台。 */
  zones: [
    {
      id: 'text-entry',
      labelZh: '文本录入',
      descriptionZh: '让人打字的那些框，差别在于输入的是什么类型的值。',
      hotspotIds: [
        'atlas-component-component-text-input',
        'atlas-component-component-password-input',
        'atlas-component-component-number-input',
        'atlas-component-component-date-input',
        'atlas-component-component-datepicker',
        'atlas-component-component-search-input',
      ],
    },
    {
      id: 'choice-pickers',
      labelZh: '选择控件',
      descriptionZh: '从既有选项里挑一个：原生下拉、自绘下拉、可输入筛选的组合框。',
      hotspotIds: [
        'atlas-component-component-select',
        'atlas-component-component-dropdown-select',
        'atlas-component-component-combobox',
      ],
    },
    {
      id: 'multi-single-select',
      labelZh: '多选与单选',
      descriptionZh: '同一个问题问一次还是问多次，界面上是不同的东西；单件与组也是。',
      hotspotIds: [
        'atlas-component-component-checkbox',
        'atlas-component-component-checkboxes',
        'atlas-component-component-radio-button',
        'atlas-component-component-radio-group',
        'atlas-component-component-switch',
      ],
    },
    {
      id: 'range-longform',
      labelZh: '范围与长文',
      descriptionZh: '取值是一段区间，或者内容长到一行装不下。',
      hotspotIds: [
        'atlas-component-component-slider',
        'atlas-component-component-slider-multi-thumb',
        'atlas-component-component-textarea',
        'atlas-component-component-character-count',
      ],
    },
    {
      id: 'submit-feedback',
      labelZh: '分组与反馈',
      descriptionZh: '把字段圈成一组、收文件、以及出错时说话的那一行。',
      hotspotIds: [
        'atlas-component-component-fieldset',
        'atlas-component-component-file-upload',
        'atlas-component-component-error-message',
      ],
    },
  ],

  /* 对照组。判据只取自本清单的批注与语料里该术语的定义/来源，写不出「会改变
   * 实现的那条需求」的格子一律留 null，前台显示为「—」。 */
  compareSets: [
    {
      id: 'form-choice-controls',
      titleZh: '复选框 / 单选 / 开关：五个近义控件',
      zoneId: 'multi-single-select',
      termIds: [
        'atlas-component-component-checkbox',
        'atlas-component-component-checkboxes',
        'atlas-component-component-radio-button',
        'atlas-component-component-radio-group',
        'atlas-component-component-switch',
      ],
      axes: [
        { id: 'focus', labelZh: '焦点' },
        { id: 'keyboard', labelZh: '键盘' },
        { id: 'dismissal', labelZh: '消解方式' },
        { id: 'modality', labelZh: '模态性' },
        { id: 'persistence', labelZh: '持久性' },
      ],
      cells: {
        'atlas-component-component-checkbox': {
          focus: null,
          keyboard: null,
          dismissal: '双状态之间来回切：再触发一次就回到未选中。',
          modality: null,
          persistence: '可选支持第三种「部分选中」态，实现要多带一个状态值。',
        },
        'atlas-component-component-checkboxes': {
          focus: '组内每个选项各自是一个 tab 停靠点。',
          keyboard: '方向键不在组内移动，逐个 Tab 走。',
          dismissal: '各项独立开关，选中一项不会取消另一项。',
          modality: null,
          persistence: '一组共享一个问题，所以要一个组级说明，而不是每个都自带标签。',
        },
        'atlas-component-component-radio-button': {
          focus: null,
          keyboard: null,
          dismissal: '互斥：选中它就排除同组其余选项。',
          modality: null,
          persistence: null,
        },
        'atlas-component-component-radio-group': {
          focus: '整组只有一个 tab 停靠点。',
          keyboard: '方向键在组内移动选中项。',
          dismissal: '同一时刻至多一个被选中，只能被另一项替换。',
          modality: null,
          persistence: '可以初始化为全未选中，用来强制用户在往下走之前先选一个。',
        },
        'atlas-component-component-switch': {
          focus: null,
          keyboard: null,
          dismissal: '二值来回切：on 与 off，没有第三个落点。',
          modality: null,
          persistence: '只能承载二值输入；复选框与切换按钮可以有中间态，它不行。',
        },
      },
    },
  ],

  /* 这一台整屏就是主内容区里的一张表单。 */
  positionRegions: [
    {
      region: 'main-form',
      termIds: [
        'atlas-component-component-fieldset',
        'atlas-component-component-text-input',
        'atlas-component-component-search-input',
        'atlas-component-component-password-input',
        'atlas-component-component-number-input',
        'atlas-component-component-date-input',
        'atlas-component-component-datepicker',
        'atlas-component-component-select',
        'atlas-component-component-dropdown-select',
        'atlas-component-component-combobox',
        'atlas-component-component-checkbox',
        'atlas-component-component-checkboxes',
        'atlas-component-component-radio-button',
        'atlas-component-component-radio-group',
        'atlas-component-component-switch',
        'atlas-component-component-slider',
        'atlas-component-component-slider-multi-thumb',
        'atlas-component-component-textarea',
        'atlas-component-component-character-count',
        'atlas-component-component-file-upload',
        'atlas-component-component-error-message',
      ],
    },
  ],

  knobs: [
    { key: 'fieldGap', label: '字段间距', min: 6, max: 34, step: 1, unit: 'px', default: 16 },
    { key: 'controlRadius', label: '控件圆角', min: 0, max: 20, step: 1, unit: 'px', default: 9 },
    { key: 'controlHeight', label: '控件高度', min: 28, max: 52, step: 1, unit: 'px', default: 36 },
  ],
}
