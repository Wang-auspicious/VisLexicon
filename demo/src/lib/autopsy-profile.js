const TIMED_AXES = new Set(['motion', 'interaction'])

function numericParam(entry, values, names) {
  const param = (entry?.params || []).find((item) => names.includes(item.k))
  if (!param) return null
  const value = Number(values?.[param.k] ?? param.def)
  return Number.isFinite(value) ? value : null
}

export function autopsyProfileFor(entry, values = {}) {
  const code = String(entry?.code || '')
  const notation = String(entry?.notation || '')
  const timed = TIMED_AXES.has(entry?.axis) || /animation|transition|duration|spring|ease/i.test(`${code} ${notation}`)
  const rawDuration = numericParam(entry, values, ['duration', 'durationMs', 'time'])
  const durationMs = rawDuration == null ? (timed ? (entry?.axis === 'motion' ? 1200 : 600) : null) : rawDuration
  const overshoot = numericParam(entry, values, ['overshoot'])
  const easing = timed ? (overshoot == null ? [0.34, 1.3, 0.5, 1] : [0.3, 1 + overshoot / 100, 0.46, 1]) : null
  const notationTrajectory = notation.split('·').slice(1).join('·').trim()
  const geneTrajectory = (entry?.genes || []).slice(0, 2).map((gene) => `${gene.g}:${gene.v}`).join(' · ')

  let render = '样式与绘制'
  if (/display\s*:\s*grid|grid-template/i.test(code)) render = '布局计算（Grid）'
  else if (/display\s*:\s*flex/i.test(code)) render = '布局计算（Flex）'
  else if (/transform/i.test(code)) render = 'transform 合成层（GPU）'
  else if (/opacity/i.test(code)) render = 'opacity 合成层'
  else if (/filter|box-shadow|background/i.test(code)) render = '绘制层（Paint）'

  return {
    durationMs,
    easing,
    trajectory: notationTrajectory || geneTrajectory || '不适用',
    render,
  }
}
