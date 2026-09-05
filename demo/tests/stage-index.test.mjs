import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { MANIFESTS } from '../src/stages/manifests.js'
import {
  buildStageIndex, stageById, defaultValuesFor, crossRefs, coverageOf, matchTerm, machineNameDebt, SLOTS,
} from '../src/lib/stage-index.js'
import { hostOf, buildDomainIndex, catalogMatchesFor } from '../src/lib/atlas-source-link.js'

const require = createRequire(import.meta.url)
const atlas = require('../src/data/visual-atlas.json')
const catalog = require('../src/data/site-catalog.json')

test('每个舞台认领的术语都真实存在于图鉴语料里', () => {
  const index = buildStageIndex(MANIFESTS, atlas)
  assert.equal(index.errors.length, 0)
  assert.ok(index.stages.length >= 2)
  for (const stage of index.stages) {
    assert.ok(stage.claims.length > 0, `${stage.id} 没有认领任何术语`)
    for (const claim of stage.claims) {
      assert.ok(SLOTS.includes(claim.slot))
      assert.ok(claim.term.id === claim.termId)
      assert.ok(claim.term.termEn && claim.term.termZh)
    }
  }
})

test('写错的术语 id 在构建期直接炸，而不是悄悄从界面上消失', () => {
  const bad = [{ id: 'x', titleZh: '假台', claims: [{ termId: 'atlas-does-not-exist', slot: 'variant' }] }]
  assert.throws(() => buildStageIndex(bad, atlas), /不存在的术语/)
  const loose = buildStageIndex(bad, atlas, { strict: false })
  assert.equal(loose.errors.length, 1)
  assert.equal(loose.stages[0].claims.length, 0)
})

test('非法挂法、重复认领、越界参数都会被挡下', () => {
  const realId = atlas.entries[0].id
  const cases = [
    [{ termId: realId, slot: 'nonsense' }, /未知挂法/],
    [{ termId: realId, slot: 'hotspot' }, /没有 node/],
    [{ termId: realId, slot: 'param', param: { key: 'k', min: 10, max: 1, step: 1, default: 5 } }, /min 必须小于 max/],
    [{ termId: realId, slot: 'param', param: { key: 'k', min: 0, max: 10, step: 0, default: 5 } }, /step 必须为正数/],
    [{ termId: realId, slot: 'param', param: { key: 'k', min: 0, max: 10, step: 1, default: 99 } }, /落在区间外/],
  ]
  for (const [claim, pattern] of cases) {
    assert.throws(() => buildStageIndex([{ id: 'x', claims: [claim] }], atlas), pattern)
  }
  assert.throws(
    () => buildStageIndex([{ id: 'x', claims: [{ termId: realId, slot: 'variant' }, { termId: realId, slot: 'variant' }] }], atlas),
    /重复认领/,
  )
})

test('一条术语可被多台认领，并在跨台互引里互相看得见', () => {
  const index = buildStageIndex(MANIFESTS, atlas)
  const shared = [...index.byTerm.entries()].filter(([, claims]) => claims.length > 1)
  assert.ok(shared.length > 0, '至少要有一条术语被两个舞台同时认领，用来验证跨台互引')
  const [termId, claims] = shared[0]
  const refs = crossRefs(index, termId, claims[0].stageId)
  assert.equal(refs.length, claims.length - 1)
  assert.ok(refs.every((ref) => ref.stageId !== claims[0].stageId))
  assert.ok(refs.every((ref) => ref.titleZh && ref.titleZh !== ref.stageId))
})

test('未入台的术语一条不丢：已认领 + 待建档 = 语料总量', () => {
  const index = buildStageIndex(MANIFESTS, atlas)
  const coverage = coverageOf(index, atlas)
  assert.equal(coverage.total, atlas.entries.length)
  assert.equal(coverage.routed + index.unrouted.length, coverage.total)
  assert.equal(coverage.unrouted, index.unrouted.length)
  const routedIds = new Set(index.byTerm.keys())
  assert.ok(index.unrouted.every((entry) => !routedIds.has(entry.id)))
})

test('参数与旋钮给出初值，离散挂法不进值表', () => {
  const index = buildStageIndex(MANIFESTS, atlas)
  const stage = stageById(index, 'text-reveal')
  const values = defaultValuesFor(stage)
  assert.equal(values.stagger, 40)
  for (const knob of stage.knobs) assert.equal(values[knob.key], knob.default)
  const variantKeys = stage.claims.filter((c) => c.slot !== 'param').map((c) => c.termId)
  assert.ok(variantKeys.every((key) => !(key in values)))
})

test('热区节点名在同一舞台内唯一，否则描边会指到两个地方', () => {
  const index = buildStageIndex(MANIFESTS, atlas)
  for (const stage of index.stages) {
    const nodes = stage.claims.filter((c) => c.slot === 'hotspot').map((c) => c.node)
    assert.equal(new Set(nodes).size, nodes.length, `${stage.id} 存在重复的热区节点名`)
  }
})

test('订正译名只落在舞台侧，语料原译不动', () => {
  const index = buildStageIndex(MANIFESTS, atlas)
  const composer = index.byTerm.get('atlas-component-component-composer')[0]
  assert.equal(composer.displayZh, '输入区')
  assert.equal(composer.zhFixed, true)
  assert.equal(composer.term.termZh, '作曲家', '语料里的机器译名必须原样保留，订正不得写回生成物')

  const untouched = index.stages
    .flatMap((stage) => stage.claims)
    .find((claim) => !claim.zhFixed)
  assert.equal(untouched.displayZh, untouched.term.termZh)
})

test('与原译相同的订正是噪音，构建期挡掉', () => {
  const realId = atlas.entries[0].id
  const sameZh = atlas.entries[0].termZh
  assert.throws(
    () => buildStageIndex([{ id: 'x', claims: [{ termId: realId, termZhFix: sameZh, slot: 'variant' }] }], atlas),
    /与语料原译相同/,
  )
})

test('依附变体的热区必须指向同台真实存在的变体', () => {
  const index = buildStageIndex(MANIFESTS, atlas)
  for (const stage of index.stages) {
    for (const claim of stage.claims) {
      if (!claim.underVariant) continue
      const host = stage.claims.find((c) => c.termId === claim.underVariant)
      assert.ok(host, `${stage.id} 的 ${claim.termId} 找不到依附的变体`)
      assert.equal(host.slot, 'variant')
    }
  }
  const skeleton = index.byTerm.get('atlas-component-component-skeleton')[0]
  assert.equal(skeleton.underVariant, 'atlas-aesthetic-design-phenomenon-skeleton-shimmer')

  const realId = atlas.entries[0].id
  assert.throws(
    () => buildStageIndex([{ id: 'x', claims: [{ termId: realId, slot: 'hotspot', node: 'n', underVariant: 'nope' }] }], atlas),
    /依附于不存在的变体/,
  )
})

test('译名欠账可量化，不靠印象', () => {
  const index = buildStageIndex(MANIFESTS, atlas)
  const debt = machineNameDebt(index)
  assert.ok(debt.fixed > 0)
  assert.ok(debt.pending >= 0)
  const claimed = index.stages.reduce((sum, stage) => sum + stage.claims.length, 0)
  assert.ok(debt.fixed + debt.pending <= claimed)
})

test('搜索同时命中英文名、中文名与别名', () => {
  const term = { termEn: 'Stagger', termZh: '交错', aliases: ['cascade'] }
  assert.ok(matchTerm(term, ''))
  assert.ok(matchTerm(term, 'stag'))
  assert.ok(matchTerm(term, '交错'))
  assert.ok(matchTerm(term, 'CASCADE'))
  assert.ok(!matchTerm(term, '不存在的词'))
  assert.ok(matchTerm(term, '错峰', '错峰'), '订正后的名字也要能搜到')
})

test('术语来源能反查到网站库里的同域条目', () => {
  assert.equal(hostOf('https://www.Example.com/a/b'), 'example.com')
  assert.equal(hostOf('not a url'), '')
  const domains = buildDomainIndex(catalog)
  assert.ok(domains.size > 0)
  const fake = { sourceEvidence: [{ url: 'https://nope.invalid/x' }] }
  assert.deepEqual(catalogMatchesFor(fake, domains), [])
  const known = [...domains.keys()][0]
  const hit = catalogMatchesFor({ sourceEvidence: [{ url: `https://${known}/x` }] }, domains)
  assert.equal(hit.length, 1)
  assert.equal(hit[0].entry.domain, domains.get(known).domain)
})
