import { AXES, ENTRIES, axisTree } from '../entries.js'

export function familyNameFor(entry) {
  if (!entry) return '其他'
  if (entry.axis === 'toolkit') return '库'
  if (typeof entry.fam === 'string' && entry.fam.trim()) return entry.fam.trim()
  for (const families of Object.values(axisTree)) {
    const family = families.find((candidate) => candidate.items.some((item) => item.id === entry.id))
    if (family?.fam) return family.fam
  }
  return '其他'
}

export function buildLexiconOrder() {
  const seen = new Set()
  const ordered = []
  for (const axis of AXES) {
    for (const family of axisTree[axis.id] || []) {
      for (const entry of family.items) {
        if (seen.has(entry.id)) continue
        seen.add(entry.id)
        ordered.push({ ...entry, famName: family.fam || familyNameFor(entry) })
      }
    }
  }
  for (const entry of ENTRIES) {
    if (seen.has(entry.id)) continue
    seen.add(entry.id)
    ordered.push({ ...entry, famName: familyNameFor(entry) })
  }
  return ordered
}

function valuesFor(entry, overrides = {}) {
  return Object.fromEntries((entry?.params || []).map((param) => [param.k, overrides[param.k] ?? Number(param.def)]))
}

export function describeComparison(a, b, aValues = {}, bValues = {}) {
  if (!a || !b) return '缺少可比较词条'
  const av = valuesFor(a, aValues)
  const bv = valuesFor(b, bValues)
  const aKeys = Object.keys(av)
  const bKeys = Object.keys(bv)
  const shared = aKeys.filter((key) => bKeys.includes(key))
  const changed = shared.filter((key) => av[key] !== bv[key]).map((key) => `${key}:${av[key]}→${bv[key]}`)
  const onlyA = aKeys.filter((key) => !bKeys.includes(key))
  const onlyB = bKeys.filter((key) => !aKeys.includes(key))
  const parts = [a.axis === b.axis ? `同轴 ${a.axis}` : `跨轴 ${a.axis} / ${b.axis}`]
  parts.push(changed.length ? `共享参数差异 ${changed.join('、')}` : '共享参数当前相同')
  if (onlyA.length) parts.push(`${a.id} 独有 ${onlyA.join('、')}`)
  if (onlyB.length) parts.push(`${b.id} 独有 ${onlyB.join('、')}`)
  return parts.join('；')
}
