/* ============ 编辑分组 ============
 * 一组 = 一个标题 + 一句说明 + 一串 entryId。
 * 策展就是罗列：把编辑挑出来的站按主题摆好，不做跨站比较，不设共同轴。
 *
 * 组是可下架的编辑物，不是 schema。每组带 createdAt，复审时先看最老的。
 * 说明句里不写任何由数据算出的内容——写死的数字迟早和语料对不上。
 */

export const COLLECTIONS = [
  {
    id: 'components-and-blocks',
    titleZh: '组件与区块：拿走就能装进项目',
    titleEn: 'Components and blocks',
    blurbZh: '这些站交付的是界面代码，复制或安装之后可以直接接进现有项目。',
    blurbEn: 'Interface code. Copy or install into an existing project.',
    entryIds: [
      'shadcn-ui',
      '21st-dev',
      'uiverse',
      'magic-ui',
      'origin-ui',
      'hover-dev',
      'entry-chakra-ui-react',
      'entry-ant-design-react',
      'entry-shadcn-studio-blocks',
      'base-ui',
      'ariakit',
      'heroui',
      'material-ui',
      'radix-themes',
      'radix-primitives',
      'daisyui',
      'headless-ui',
      'ark-ui',
      'mantine',
      'react-aria',
      'aceternity-ui',
    ],
    createdAt: '2026-09-05',
  },
  {
    id: 'references-and-standards',
    titleZh: '参考与规范：先把话说对',
    titleEn: 'Reference and standards',
    blurbZh: '这些站交付的是说法、条款和样本，用来对齐术语与做法，不提供可安装的代码。',
    blurbEn: 'Terms, clauses, and samples. Alignment, not installable code.',
    entryIds: ['laws-of-ux', 'a11y-project', 'ecomm-design', 'web-dev', 'inclusive-components'],
    createdAt: '2026-09-05',
  },
  {
    id: 'motion-and-micro',
    titleZh: '动效与微交互：看它怎么动',
    titleEn: 'Motion and micro-interaction',
    blurbZh: '这些站交付的是会动的实现：时间轴、class 动画和弹簧，用来看效果怎么接到界面上。',
    blurbEn: 'Motion implementations: timelines, class animation, springs.',
    entryIds: ['motion', 'gsap', 'animate-css'],
    createdAt: '2026-09-06',
  },
  {
    id: 'icons-and-type',
    titleZh: '图标与字体：拿一套视觉语言',
    titleEn: 'Icons and type',
    blurbZh: '这些站交付的是可复制或安装的符号，用来给界面配上一套统一的线标。',
    blurbEn: 'Installable or copyable marks for a coherent symbol language.',
    entryIds: ['lucide', 'remixicon', 'radix-icons'],
    createdAt: '2026-09-06',
  },
]

export const COLLECTION_MIN_MEMBERS = 1

/* siteIndex 的形状由 WP-A 决定，这里只认「能拿到 entryId 集合」这一点：
 * 数组、{ entries: [] }、字符串数组都接受，其余形状直接报错而不是静默放行。 */
function entryIdsOf(siteIndex) {
  const list = Array.isArray(siteIndex) ? siteIndex : siteIndex?.entries ?? siteIndex?.items
  if (!Array.isArray(list)) {
    throw new Error('分组校验失败：siteIndex 必须是条目数组或带 entries 数组的对象')
  }
  return new Set(
    list.map((item) => {
      const id = typeof item === 'string' ? item : item?.entryId ?? item?.id
      if (!id) throw new Error('分组校验失败：siteIndex 中存在没有 entryId 的条目')
      return id
    }),
  )
}

/**
 * 构建期校验，只管三件事：
 *   1. 每个 entryId 在语料里真的存在（不引用不存在的站）
 *   2. 组内没有重复的 entryId、组之间没有重复的 id
 *   3. 每组至少 1 个成员（空组不上线）
 * 不限制组数、不限制成员上限——那是编辑的事，不是校验的事。
 */
export function validateCollections(collections, siteIndex) {
  if (!Array.isArray(collections)) throw new Error('分组校验失败：collections 必须是数组')
  const known = entryIdsOf(siteIndex)
  const seenIds = new Set()

  for (const group of collections) {
    if (!group?.id) throw new Error('分组校验失败：存在没有 id 的组')
    if (seenIds.has(group.id)) throw new Error(`分组校验失败：组 id 重复 ${group.id}`)
    seenIds.add(group.id)

    const ids = group.entryIds
    if (!Array.isArray(ids) || ids.length < COLLECTION_MIN_MEMBERS) {
      throw new Error(
        `分组校验失败：组 ${group.id} 的成员数为 ${ids?.length ?? 0}，下限是 ${COLLECTION_MIN_MEMBERS}`,
      )
    }
    if (new Set(ids).size !== ids.length) {
      throw new Error(`分组校验失败：组 ${group.id} 的成员有重复 entryId`)
    }
    for (const entryId of ids) {
      if (!known.has(entryId)) {
        throw new Error(`分组校验失败：组 ${group.id} 引用了不存在的条目 ${entryId}`)
      }
    }
  }
  return collections
}

export function collectionById(id) {
  return COLLECTIONS.find((group) => group.id === id) || null
}

export default COLLECTIONS
