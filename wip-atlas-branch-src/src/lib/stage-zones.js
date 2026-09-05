/* ============ 舞台分区与位置索引 ============
 * 舞台的第二层导航：分区（zone）。
 *
 * 为什么要这一层：单台挂 14–39 个热区，一次只亮一个标签，用户没法知道
 * 「这屏一共几个名字」「哪几个是一组的」。分区把每台切成 3–7 个一组，
 * 落回行业解剖图的标注密度区间（research/03 §4.1 实测：namethatui 3、
 * uianatomy 6、Carbon 6）。分区按**空间或功能**切，不按 slot 类型切——
 * 用户不会想「我要找一个 hotspot」，他会想「我要找输入框旁边那个东西」。
 *
 * 本模块是纯函数，不含任何统计量字面量：位置索引的每个数字都由 manifest 算出。
 */
import { MANIFESTS } from '../stages/manifests.js'

/* 每个分区的成员数硬区间。超出即构建期报错（见 stage-index.js）。 */
export const ZONE_MIN_MEMBERS = 3
export const ZONE_MAX_MEMBERS = 7

/* 七个页面位置区域（方案 §3.2）。顺序即索引页上的版面顺序。
 * 为 0 的区域也要返回——「这一区还没有台」比藏起来诚实。 */
export const POSITION_REGIONS = [
  { id: 'header', labelZh: '顶栏 / 服务级' },
  { id: 'sidebar', labelZh: '侧栏 / 目录' },
  { id: 'main-table', labelZh: '主内容区 · 表格' },
  { id: 'main-form', labelZh: '主内容区 · 表单' },
  { id: 'overlay', labelZh: '浮层 / 遮罩' },
  { id: 'composer', labelZh: '底部输入区' },
  { id: 'state', labelZh: '加载与空态' },
]

export const POSITION_REGION_IDS = POSITION_REGIONS.map((r) => r.id)

/* 对照组的五轴，取自 namethatui.org 的行为矩阵（research/03 §1.4）。
 * 判据是「会改变实现的那条需求」，不是「长得像不像」。 */
export const COMPARE_AXES = [
  { id: 'focus', labelZh: '焦点' },
  { id: 'keyboard', labelZh: '键盘' },
  { id: 'dismissal', labelZh: '消解方式' },
  { id: 'modality', labelZh: '模态性' },
  { id: 'persistence', labelZh: '持久性' },
]

function manifestById(stageId, manifests) {
  return (manifests || []).find((m) => m.id === stageId) || null
}

/* 一个分区的成员 id：三种挂法各自一个数组，合起来就是这一区的全部术语。
 * 分开写是为了让 manifest 自己说清「这一区装的是热区还是参数」。 */
export function zoneMemberIds(zone) {
  if (!zone) return []
  return [
    ...(zone.hotspotIds || []),
    ...(zone.variantIds || []),
    ...(zone.paramIds || []),
  ]
}

/* 某台的全部分区。找不到这台就返回空数组，不抛——调用方多半在渲染中。 */
export function zonesForStage(stageId, manifests = MANIFESTS) {
  const manifest = manifestById(stageId, manifests)
  return manifest?.zones ? manifest.zones : []
}

/* 某个热区属于哪个分区。第二个参数既接受术语 id，也接受舞台里的 data-node 名，
 * 因为调用方有时手上只有 DOM 上那个名字（反向悬停就是这种情况）。 */
export function zoneOfHotspot(stageId, hotspotId, manifests = MANIFESTS) {
  const manifest = manifestById(stageId, manifests)
  if (!manifest || !hotspotId) return null
  const byNode = (manifest.claims || []).find((c) => c.node === hotspotId)
  const termId = byNode ? byNode.termId : hotspotId
  return (manifest.zones || []).find((zone) => zoneMemberIds(zone).includes(termId)) || null
}

/* 术语 → 分区 的反查表（单台）。 */
export function zoneIndexForStage(stageId, manifests = MANIFESTS) {
  const index = new Map()
  for (const zone of zonesForStage(stageId, manifests)) {
    for (const termId of zoneMemberIds(zone)) index.set(termId, zone)
  }
  return index
}

/* 位置索引：七个页面区域 → 各台各术语。
 * 七个区域一律返回，命中 0 条的区域 count 为 0、stages 为空数组——
 * 索引页据此显示「这一区还没有台」，不隐藏（research/03 §1.15）。 */
export function positionIndex(manifests = MANIFESTS) {
  const list = manifests || []
  const regions = POSITION_REGIONS.map((region) => {
    const stages = []
    for (const manifest of list) {
      const hit = (manifest.positionRegions || []).find((r) => r.region === region.id)
      if (!hit || !hit.termIds?.length) continue
      stages.push({
        stageId: manifest.id,
        titleZh: manifest.titleZh,
        termIds: [...hit.termIds],
        count: hit.termIds.length,
      })
    }
    return {
      region: region.id,
      labelZh: region.labelZh,
      stages,
      count: stages.reduce((sum, s) => sum + s.count, 0),
    }
  })

  /* 未落进任何区域的术语数：七个区域装不下的那些（导航台主区、三个变体台）。
   * 这是缺口，要显式给出来，不能让它在总数里消失。 */
  const claimed = list.reduce((sum, m) => sum + (m.claims?.length || 0), 0)
  const placed = regions.reduce((sum, r) => sum + r.count, 0)
  return { regions, claimed, placed, unplaced: claimed - placed }
}

/* 某台的对照组。没有可靠判据的台一律是空数组，不凑数。 */
export function compareSetsForStage(stageId, manifests = MANIFESTS) {
  const manifest = manifestById(stageId, manifests)
  return manifest?.compareSets ? manifest.compareSets : []
}
