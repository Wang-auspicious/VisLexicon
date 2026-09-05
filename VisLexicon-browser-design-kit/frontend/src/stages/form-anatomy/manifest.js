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

  knobs: [
    { key: 'fieldGap', label: '字段间距', min: 6, max: 34, step: 1, unit: 'px', default: 16 },
    { key: 'controlRadius', label: '控件圆角', min: 0, max: 20, step: 1, unit: 'px', default: 9 },
    { key: 'controlHeight', label: '控件高度', min: 28, max: 52, step: 1, unit: 'px', default: 36 },
  ],
}
