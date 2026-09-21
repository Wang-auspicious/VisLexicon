/* ============ 切面 chips 的准入规则（方案 §3.4） ============
 * 切面只在「已经有结果集之后」出现，首页零筛选器。
 * 哪些值配出现在 chips 上，由规则算，不由人写清单——语料长大时规则会自己调整。
 *
 * 统计规则三条（方案 §3.4 原文）：
 *   1. 命中数 < 2 的值不显示（死值：点进去只剩一两个）。
 *   2. 命中率 > 60% 的值不显示（它不缩小任何东西）。
 *   3. 一个轴上剩余可显示的值 < 2 时，整条轴不显示（只剩一个值的轴不是切面）。
 *
 * 另有一条结构规则（DECISION_AXES）。为什么需要它见文件末尾的说明。
 */

export const MIN_HITS = 2
export const MAX_HIT_RATE = 0.6
export const MIN_VALUES_PER_AXIS = 2

/**
 * 结构规则：只有这五条轴进入 chips 的候选。
 *
 * 判据是「这条轴会不会改变我的选择」，不是「这条轴描述得准不准」：
 *   licenses            能不能用（权利）
 *   access              进得去进不去（获取方式）
 *   deliverables        拿到手的是什么东西
 *   actions             我能对它做什么
 *   contentOrganization 它是怎么组织的，决定怎么找
 * 其余七条轴（scenarios / media / platforms / technologies / workflowStages /
 * audiences / languages）描述的是站点本身，收口时用不上它们：
 * 按「我要 React 的」去筛，筛掉的是可选项而不是不合格项。
 *
 * 顺序即渲染顺序：先问权利，再问怎么拿，最后问长什么样。
 */
export const DECISION_AXES = [
  'licenses',
  'access',
  'deliverables',
  'actions',
  'contentOrganization',
]

export const AXIS_LABELS_ZH = {
  licenses: '许可',
  access: '取用',
  deliverables: '产物',
  actions: '动作',
  contentOrganization: '组织方式',
}

export const AXIS_LABELS_EN = {
  licenses: 'License',
  access: 'Access',
  deliverables: 'Output',
  actions: 'Action',
  contentOrganization: 'Structure',
}

/* 切面值是英文 slug。这里只做「同一个意思的中文说法」，不添加任何原值里没有的判断；
 * 没登记的值原样显示 slug，不猜、不编。许可证代码（MIT / Apache-2.0）本身就是术语，
 * 不翻译。 */
export const VALUE_LABELS_ZH = {
  /* licenses */
  custom: '自定条款',
  unknown: '未知',
  /* access */
  free: '免费',
  'open-source': '开源',
  freemium: '部分免费',
  'source-available': '源码可见',
  'closed-source': '闭源',
  'login-required': '需登录',
  paid: '付费',
  /* deliverables */
  component: '组件',
  block: '区块',
  template: '模板',
  standard: '规范条文',
  'code-library': '代码库',
  primitive: '无样式基元',
  prompt: '提示词',
  report: '报告',
  glossary: '词条释义',
  'case-screenshot': '案例截图',
  'full-page': '整页',
  /* actions */
  browse: '浏览',
  preview: '预览',
  copy: '复制',
  install: '安装',
  search: '搜索',
  learn: '学习',
  submit: '投稿',
  purchase: '购买',
  download: '下载',
  edit: '编辑',
  export: '导出',
  audit: '自查',
  /* contentOrganization */
  'component-registry': '组件注册表',
  'searchable-directory': '可搜索目录',
  'standards-documentation': '规范文档',
  'case-gallery': '案例库',
  'editorial-feed': '编辑更新流',
  'community-feed': '社区投稿流',
  marketplace: '市场',
  course: '课程',
}

export function axisLabel(axis, locale = 'zh') {
  if (locale === 'en') return AXIS_LABELS_EN[axis] ?? axis
  return AXIS_LABELS_ZH[axis] ?? axis
}

export function valueLabel(value, locale = 'zh') {
  if (locale === 'en') return VALUE_LABELS_EN[value] ?? value
  return VALUE_LABELS_ZH[value] ?? value
}

export const VALUE_LABELS_EN = {
  custom: 'Custom',
  unknown: 'Unknown',
  free: 'Free',
  'open-source': 'Open source',
  freemium: 'Freemium',
  'source-available': 'Source available',
  'closed-source': 'Closed source',
  'login-required': 'Sign-in required',
  paid: 'Paid',
  component: 'Component',
  block: 'Block',
  template: 'Template',
  standard: 'Standard',
  'code-library': 'Code library',
  primitive: 'Primitive',
  prompt: 'Prompt',
  report: 'Report',
  glossary: 'Glossary',
  'case-screenshot': 'Case screenshot',
  'full-page': 'Full page',
  browse: 'Browse',
  preview: 'Preview',
  copy: 'Copy',
  install: 'Install',
  search: 'Search',
  learn: 'Learn',
  submit: 'Submit',
  purchase: 'Purchase',
  download: 'Download',
  edit: 'Edit',
  export: 'Export',
  audit: 'Audit',
  'component-registry': 'Component registry',
  'searchable-directory': 'Searchable directory',
  'standards-documentation': 'Standards documentation',
  'case-gallery': 'Case gallery',
  'editorial-feed': 'Editorial feed',
  'community-feed': 'Community feed',
  marketplace: 'Marketplace',
  course: 'Course',
}

const asArray = (value) => (Array.isArray(value) ? value : [])

/** 某条轴上「值 → 命中条目数」，按命中数降序、同数按字母序。 */
export function countAxis(items, axis) {
  const counts = new Map()
  for (const item of asArray(items)) {
    for (const value of new Set(asArray(item?.facets?.[axis]))) {
      counts.set(value, (counts.get(value) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, 'en'))
}

/**
 * 按准入规则算出要渲染的 chips。
 *
 * @param {Array}  items       结果集之前的**全集**（chips 的分母始终是全集，
 *                             否则每点一个 chip 其余 chip 就会集体消失）
 * @param {object} selections  已选中的值 `{ axis: string[] }`。已选中的值
 *                             **一律保留**，哪怕它此刻不满足规则——否则用户
 *                             点完就看不到自己点了什么，也取消不掉。
 * @returns {Array} `[{ axis, label, values: [{ value, label, count, selected }] }]`
 */
export function chipAxes(items, selections = {}, locale = 'zh') {
  const list = asArray(items)
  const total = list.length
  const groups = []

  for (const axis of DECISION_AXES) {
    const chosen = new Set(asArray(selections[axis]))
    const values = countAxis(list, axis).filter(({ value, count }) => {
      if (chosen.has(value)) return true
      if (count < MIN_HITS) return false
      if (total > 0 && count / total > MAX_HIT_RATE) return false
      return true
    })
    if (values.length < MIN_VALUES_PER_AXIS) continue
    groups.push({
      axis,
      label: axisLabel(axis, locale),
      values: values.map(({ value, count }) => ({
        value,
        label: valueLabel(value, locale),
        count,
        selected: chosen.has(value),
      })),
    })
  }

  return groups
}

/* ------------------------------------------------------------------
 * 为什么在三条统计规则之外还要 DECISION_AXES
 *
 * 方案 §3.4 的表格断言「三条规则把 12 个轴收敛成 5 个」。用 WP-A 实际产出的
 * site-index.json 跑一遍，结论对不上：三条规则单独作用时只淘汰 audiences 与
 * languages 两条轴，剩下 10 条。差异来自方案写作时用的分布与最终语料不同
 * （例如方案记 media 为 ui 12/12，实际语料里 media 还有 motion 5 / typography 2）。
 *
 * 于是这里把方案的**结论**（五条轴：licenses / access / deliverables /
 * actions / contentOrganization）作为结构规则显式写出，统计规则在它之上继续裁剪。
 * 这样做的代价与收益都要说清楚：
 *   - 代价：轴的集合不再完全由语料自动决定，新增一条决策轴要改这个常量。
 *   - 收益：chips 只回答「会改变选择」的问题，且 media / audiences / languages
 *     这类描述性轴不会因为语料波动而重新冒出来。
 * 统计规则仍然完全由数据驱动：值的增删、整条轴的存亡都随语料变化。
 * ------------------------------------------------------------------ */
