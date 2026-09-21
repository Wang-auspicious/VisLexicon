/**
 * 组件名只收源站目录里核验过的条目。不编造分类。
 *
 * Uiverse：2026-09-06 打开分类页，标题即下列英文名。
 *   /buttons /checkboxes /switches /cards /loaders
 *   /inputs /radio-buttons /forms /patterns /tooltips
 * 注册表快照（shadcn / magic-ui / origin-ui）用官方 slug，中文只译已对照的词。
 */

import { entryVoice } from './entry-voice.js'
import { snapshotNames } from './component-catalog-snapshot.js'

const UIVERSE = Object.freeze([
  { zh: '按钮', en: 'Buttons' },
  { zh: '复选框', en: 'Checkboxes' },
  { zh: '切换开关', en: 'Toggle switches' },
  { zh: '卡片', en: 'Cards' },
  { zh: '加载器', en: 'Loaders' },
  { zh: '输入框', en: 'Inputs' },
  { zh: '单选按钮', en: 'Radio buttons' },
  { zh: '表单', en: 'Forms' },
  { zh: '图案', en: 'Patterns' },
  { zh: '提示', en: 'Tooltips' },
])

const STATIC = Object.freeze({
  uiverse: UIVERSE,
})

/** 注册表 slug → 中文。没有的不猜，仍显示源站原名。 */
const SLUG_ZH = Object.freeze({
  accordion: '手风琴',
  alert: '警告条',
  'alert-dialog': '警告对话框',
  'aspect-ratio': '宽高比',
  avatar: '头像',
  badge: '徽章',
  breadcrumb: '面包屑',
  button: '按钮',
  'button-group': '按钮组',
  calendar: '日历',
  card: '卡片',
  carousel: '轮播',
  chart: '图表',
  checkbox: '复选框',
  collapsible: '折叠',
  combobox: '组合框',
  command: '命令面板',
  'context-menu': '上下文菜单',
  dialog: '对话框',
  drawer: '抽屉',
  'dropdown-menu': '下拉菜单',
  empty: '空状态',
  field: '字段',
  form: '表单',
  'hover-card': '悬停卡片',
  input: '输入框',
  'input-group': '输入组',
  'input-otp': '一次性密码',
  item: '列表项',
  kbd: '键盘键',
  label: '标签',
  menubar: '菜单栏',
  'navigation-menu': '导航菜单',
  pagination: '分页',
  popover: '弹出层',
  progress: '进度条',
  'radio-group': '单选组',
  resizable: '可调分割',
  'scroll-area': '滚动区',
  select: '选择器',
  separator: '分割线',
  sheet: '侧栏面板',
  sidebar: '侧边栏',
  skeleton: '骨架屏',
  slider: '滑块',
  sonner: '通知条',
  spinner: '加载器',
  switch: '开关',
  table: '表格',
  tabs: '选项卡',
  textarea: '多行输入',
  toast: '轻提示',
  toggle: '切换',
  'toggle-group': '切换组',
  tooltip: '提示',
})

function titleCaseSlug(value) {
  return String(value)
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function localizeComponentName(name, locale) {
  const raw = String(name || '').trim()
  if (!raw) return ''
  if (locale === 'zh') return SLUG_ZH[raw] || raw
  if (raw.includes(' ') || /[A-Z]/.test(raw)) return raw
  return titleCaseSlug(raw)
}

export function catalogNames(entryId, locale) {
  const lang = locale === 'en' ? 'en' : 'zh'
  const staticRows = STATIC[entryId]
  if (Array.isArray(staticRows) && staticRows.length > 0) {
    return staticRows.map((row) => row[lang]).filter(Boolean)
  }
  const voice = entryVoice(entryId)?.components?.[lang]
  if (Array.isArray(voice) && voice.length > 0) return voice.filter(Boolean)
  const snapshot = snapshotNames(entryId)
  if (Array.isArray(snapshot) && snapshot.length > 0) {
    return snapshot.map((name) => localizeComponentName(name, lang)).filter(Boolean)
  }
  return []
}
