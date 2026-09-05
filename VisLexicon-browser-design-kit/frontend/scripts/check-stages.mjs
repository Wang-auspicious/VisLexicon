#!/usr/bin/env node
/* 舞台数据自检（WP-G）。
 *
 * 仓里没有测试目录——`context/04` 提到的 435 项测试与 13 项 stage-index 测试
 * 不在这个精简包里（`find . -name "*.test.*"` 零命中）。这个脚本补上 WP-G
 * 需要的那部分守卫，并且是可执行的验收证据：
 *
 *   1. 九台在 strict 下通过 buildStageIndex
 *   2. 每台每个分区的成员数落在 3–7
 *   3. 全台术语被且只被一个分区覆盖
 *   4. 三类反例（zone 不存在 / 热区属于两个 zone / 对照组引用外台术语）必须抛错
 *   5. 位置索引七区域全部返回，为 0 也返回
 *   6. 220 条语料上跑一遍两套正交标签，打印分布
 *
 * 退出码：全过 0，任何一条不过 1。
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { MANIFESTS } from '../src/stages/manifests.js'
import { buildStageIndex } from '../src/lib/stage-index.js'
import {
  POSITION_REGIONS,
  ZONE_MAX_MEMBERS,
  ZONE_MIN_MEMBERS,
  positionIndex,
  zoneMemberIds,
  zoneOfHotspot,
} from '../src/lib/stage-zones.js'
import { depthOf, statusDistribution, termStatusOf } from '../src/lib/atlas-status.js'

const here = dirname(fileURLToPath(import.meta.url))
const atlas = JSON.parse(readFileSync(join(here, '../src/data/visual-atlas.json'), 'utf8'))

const failures = []
const check = (label, ok, detail = '') => {
  if (ok) console.log(`  ✓ ${label}${detail ? ` —— ${detail}` : ''}`)
  else { failures.push(label); console.log(`  ✗ ${label}${detail ? ` —— ${detail}` : ''}`) }
}

/* ---------- 1. strict 构建 ---------- */
console.log('\n[1] strict 模式构建九台')
let index = null
try {
  index = buildStageIndex(MANIFESTS, atlas, { strict: true })
  check('buildStageIndex 通过', true, `${index.stages.length} 台 · ${index.byTerm.size} 条唯一术语`)
} catch (error) {
  check('buildStageIndex 通过', false, error.message)
}

/* ---------- 2/3. 分区密度与覆盖 ---------- */
console.log(`\n[2] 每个分区的成员数必须落在 ${ZONE_MIN_MEMBERS}–${ZONE_MAX_MEMBERS}`)
for (const manifest of MANIFESTS) {
  const sizes = (manifest.zones || []).map((zone) => `${zone.labelZh} ${zoneMemberIds(zone).length}`)
  const bad = (manifest.zones || []).filter((zone) => {
    const n = zoneMemberIds(zone).length
    return n < ZONE_MIN_MEMBERS || n > ZONE_MAX_MEMBERS
  })
  const covered = new Set((manifest.zones || []).flatMap(zoneMemberIds))
  const missing = (manifest.claims || []).filter((c) => !covered.has(c.termId))
  check(
    `${manifest.id}（${manifest.claims.length} 条 / ${manifest.zones?.length || 0} 区）`,
    bad.length === 0 && missing.length === 0,
    `${sizes.join(' · ')}${missing.length ? ` | 未覆盖 ${missing.length} 条` : ''}`,
  )
}

/* ---------- 4. 反例 ---------- */
console.log('\n[3] 三类反例必须在 strict 下抛错')
const clone = (o) => JSON.parse(JSON.stringify(o))
const stripFns = MANIFESTS.map((m) => clone(m))

function expectThrow(label, mutate) {
  const mutated = stripFns.map(clone)
  mutate(mutated)
  let threw = null
  try {
    buildStageIndex(mutated, atlas, { strict: true })
  } catch (error) {
    threw = error.message
  }
  check(label, Boolean(threw), threw ? threw.split('\n').slice(1, 2).join('') : '没有抛错')
}

expectThrow('反例 A · 对照组指向不存在的 zone', (list) => {
  const stage = list.find((m) => m.id === 'overlay-layers')
  stage.compareSets[0].zoneId = 'no-such-zone'
})
expectThrow('反例 B · 一个热区同时属于两个 zone', (list) => {
  const stage = list.find((m) => m.id === 'form-anatomy')
  stage.zones[1].hotspotIds.push('atlas-component-component-text-input')
})
expectThrow('反例 C · 对照组引用不在本台的术语', (list) => {
  const stage = list.find((m) => m.id === 'form-anatomy')
  stage.compareSets[0].termIds.push('atlas-component-component-tooltip')
})
expectThrow('反例 D · 某条热区没有被任何 zone 覆盖', (list) => {
  const stage = list.find((m) => m.id === 'data-display')
  stage.zones[0].hotspotIds = stage.zones[0].hotspotIds.slice(1)
})
expectThrow('反例 E · 分区成员数超出 3–7', (list) => {
  const stage = list.find((m) => m.id === 'navigation')
  stage.zones[3].hotspotIds = [...stage.zones[2].hotspotIds.splice(0, 1), ...stage.zones[3].hotspotIds]
  stage.zones[2].hotspotIds = stage.zones[2].hotspotIds
})

/* ---------- 5. 位置索引 ---------- */
console.log('\n[4] 位置索引：七个区域一律返回（为 0 也返回）')
const pos = positionIndex(MANIFESTS)
check('区域数等于七', pos.regions.length === POSITION_REGIONS.length, `${pos.regions.length} 个`)
for (const region of pos.regions) {
  const detail = region.stages.length
    ? region.stages.map((s) => `${s.stageId} ${s.count}`).join(' · ')
    : '这一区还没有台'
  console.log(`    ${region.labelZh}：${region.count} —— ${detail}`)
}
console.log(`    认领总数 ${pos.claimed} · 已落位 ${pos.placed} · 未落位 ${pos.unplaced}`)

/* ---------- 6. 热区反查 ---------- */
console.log('\n[5] zoneOfHotspot 双向可查（术语 id 与 data-node 名）')
const byTerm = zoneOfHotspot('form-anatomy', 'atlas-component-component-checkbox')
const byNode = zoneOfHotspot('form-anatomy', 'form.checkbox')
check('术语 id 与节点名查到同一个分区', byTerm?.id === 'multi-single-select' && byNode?.id === byTerm?.id, byTerm?.labelZh || '未命中')

/* ---------- 7. 两套正交标签 ---------- */
console.log('\n[6] 两套正交标签在 220 条语料上的分布')
if (index) {
  const dist = statusDistribution(atlas.entries, index)
  console.log(`    总数 ${dist.total}`)
  console.log(`    建档深度：已入台 ${dist.depth.staged} · 有证据 ${dist.depth.evidenced} · 仅采集 ${dist.depth.collected}`)
  console.log(`    术语地位：标准术语 ${dist.termStatus.standard} · 行业通行 ${dist.termStatus.common} · 厂商用语 ${dist.termStatus.vendor} · 待定 ${dist.termStatus.pending}`)
  console.log(`    有人工复核日期的：${dist.reviewed}`)
  const sum = Object.values(dist.depth).reduce((a, b) => a + b, 0)
  const sum2 = Object.values(dist.termStatus).reduce((a, b) => a + b, 0)
  check('两套标签各自守恒（分档之和 = 总数）', sum === dist.total && sum2 === dist.total)
  check('已入台数等于反向索引里的唯一术语数', dist.depth.staged === index.byTerm.size, `${dist.depth.staged} / ${index.byTerm.size}`)

  const samples = ['atlas-component-component-combobox', 'atlas-component-component-tabs', 'atlas-aesthetic-design-phenomenon-backdrop-filter']
  for (const id of samples) {
    const record = atlas.entries.find((e) => e.id === id)
    if (record) console.log(`    抽样 ${record.termEn}：${termStatusOf(record)} / ${depthOf(record, index)}`)
  }
}

console.log(failures.length ? `\n未通过 ${failures.length} 项：\n- ${failures.join('\n- ')}` : '\n全部通过。')
process.exit(failures.length ? 1 : 0)
