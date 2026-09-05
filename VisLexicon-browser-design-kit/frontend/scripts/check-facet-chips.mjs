#!/usr/bin/env node
/**
 * WP-D 的可执行验收证据：在真实语料上跑一遍切面 chips 的准入规则。
 *
 *   node scripts/check-facet-chips.mjs
 *
 * 断言（方案 §9.3 WP-D 行）：
 *   1. 渲染出的轴恰好是 licenses / access / deliverables / actions / contentOrganization；
 *   2. media / audiences / languages 三轴不出现；
 *   3. 每个显示出来的值都满足「命中 ≥ 2 且命中率 ≤ 60%」，每条显示的轴至少有 2 个值。
 * 数字全部由 public/data/site-index.json 现算，脚本里没有任何统计量字面量。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { FACET_AXES } from '../src/lib/counts.js'
import {
  DECISION_AXES,
  MAX_HIT_RATE,
  MIN_HITS,
  MIN_VALUES_PER_AXIS,
  chipAxes,
  countAxis,
} from '../src/lib/facet-chips.js'

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const index = JSON.parse(fs.readFileSync(path.join(rootDir, 'public/data/site-index.json'), 'utf8'))
const items = index.items
const total = items.length
const failures = []

console.log(`语料：${total} 个已审核条目\n`)

console.log('全部 12 个轴的实测分布与裁决：')
for (const axis of FACET_AXES) {
  const values = countAxis(items, axis)
  const kept = values.filter((v) => v.count >= MIN_HITS && v.count / total <= MAX_HIT_RATE)
  const inDecision = DECISION_AXES.includes(axis)
  const shown = inDecision && kept.length >= MIN_VALUES_PER_AXIS
  const why = !inDecision ? '不是决策轴' : kept.length < MIN_VALUES_PER_AXIS ? '剩余值不足 2 个' : ''
  console.log(
    `  ${axis.padEnd(20)} ${String(values.length).padStart(2)} 个值 → 留下 ${String(kept.length).padStart(2)} 个` +
      `  ${shown ? '显示' : `不显示（${why}）`}`,
  )
}

const groups = chipAxes(items, {})
const rendered = groups.map((group) => group.axis)

console.log(`\n实际渲染的轴：${rendered.join(' / ')}`)
if (rendered.join(',') !== DECISION_AXES.join(',')) {
  failures.push(`渲染的轴与预期不符：${rendered.join(',')} ≠ ${DECISION_AXES.join(',')}`)
}

for (const forbidden of ['media', 'audiences', 'languages']) {
  if (rendered.includes(forbidden)) failures.push(`${forbidden} 轴不应出现在 chips 上`)
}

for (const group of groups) {
  if (group.values.length < MIN_VALUES_PER_AXIS) {
    failures.push(`轴 ${group.axis} 只剩 ${group.values.length} 个值，整条轴不该显示`)
  }
  for (const chip of group.values) {
    if (chip.count < MIN_HITS) failures.push(`${group.axis}.${chip.value} 命中 ${chip.count} < ${MIN_HITS}`)
    if (chip.count / total > MAX_HIT_RATE) {
      failures.push(`${group.axis}.${chip.value} 命中率 ${(chip.count / total).toFixed(3)} > ${MAX_HIT_RATE}`)
    }
  }
  console.log(`  ${group.label}：${group.values.map((chip) => `${chip.label} ${chip.count}`).join(' · ')}`)
}

if (failures.length) {
  console.error(`\n失败 ${failures.length} 条：`)
  for (const line of failures) console.error(`  - ${line}`)
  process.exit(1)
}
console.log('\n全部断言通过。')
