import { useCallback, useEffect, useLayoutEffect, useState } from 'react'

/* ============ 标注层（方案 §5.2 态一） ============
 * 解剖图的全部价值就是「一眼看到全部命名」。总览态把本台每个热区的编号角标
 * 同时摆出来，而不是一次只亮一个。角标贴在部件左上角，互相压住时依次右移，
 * 位置由真实 DOM 量出来——舞台组件不需要为标注改一行代码。
 *
 * 分区态只亮本区：其余角标降透明度并让出点击，舞台里对应的部件由
 * `applyZoneDim` 打上 `axs-dim` 类（同样不改舞台组件）。
 */

/* 角标直径与最小间距。这是版面参数，不是统计量。 */
const BADGE = 26
const MIN_GAP = 24

function measure(host, items) {
  if (!host) return []
  const hostBox = host.getBoundingClientRect()
  const boxes = []
  for (const item of items) {
    if (!item.node) continue
    const el = host.querySelector(`[data-node="${CSS.escape(item.node)}"]`)
    if (!el) continue
    const rect = el.getBoundingClientRect()
    /* 舞台可以横向滚动（窄屏），所以位置要换算成内容坐标而不是视口坐标，
     * 角标才会跟着内容一起滚。 */
    boxes.push({
      ...item,
      x: rect.left - hostBox.left + host.scrollLeft,
      y: rect.top - hostBox.top + host.scrollTop,
      w: rect.width,
      h: rect.height,
    })
  }

  /* 去重叠：按纵横排序后逐个检查，撞上就沿 x 推开一格。 */
  const placed = []
  for (const box of boxes.slice().sort((a, b) => a.y - b.y || a.x - b.x)) {
    let bx = Math.max(box.x - BADGE / 2, 0)
    const by = Math.max(box.y - BADGE / 2, 0)
    let guard = 0
    while (
      guard < placed.length + 1
      && placed.some((p) => Math.abs(p.bx - bx) < MIN_GAP && Math.abs(p.by - by) < MIN_GAP)
    ) {
      bx += MIN_GAP
      guard += 1
    }
    placed.push({ ...box, bx, by })
  }
  return placed
}

/** 分区态：把不属于当前分区的部件打上 `axs-dim`。舞台组件本身零改动。 */
export function applyZoneDim(host, activeZoneId) {
  if (!host) return
  for (const el of host.querySelectorAll('[data-node]')) {
    const off = Boolean(activeZoneId) && el.getAttribute('data-zone') !== activeZoneId
    el.classList.toggle('axs-dim', off)
  }
}

export default function AnnotationLayer({
  hostRef, items, activeZoneId, selectedTermId, onSelect, onHover, signature,
}) {
  const [boxes, setBoxes] = useState([])

  const remeasure = useCallback(() => {
    setBoxes(measure(hostRef.current, items))
  }, [hostRef, items])

  useLayoutEffect(() => { remeasure() }, [remeasure, signature])

  useEffect(() => {
    const host = hostRef.current
    if (!host || typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(() => remeasure())
    observer.observe(host)
    for (const el of host.querySelectorAll('[data-node]')) observer.observe(el)
    window.addEventListener('resize', remeasure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', remeasure)
    }
  }, [hostRef, remeasure, signature])

  useEffect(() => {
    applyZoneDim(hostRef.current, activeZoneId)
    return () => applyZoneDim(hostRef.current, null)
  }, [hostRef, activeZoneId, signature])

  return (
    <div className="axa" aria-hidden={boxes.length ? undefined : 'true'}>
      {boxes.map((box) => {
        const off = Boolean(activeZoneId) && box.zoneId !== activeZoneId
        const on = box.termId === selectedTermId
        return (
          <button
            key={box.termId}
            type="button"
            data-annotation={box.n}
            data-zone={box.zoneId}
            className={`axa-badge ${off ? 'off' : ''} ${on ? 'on' : ''}`}
            style={{ insetInlineStart: `${box.bx}px`, insetBlockStart: `${box.by}px` }}
            onClick={() => onSelect(box.termId)}
            onMouseEnter={() => onHover?.(box.node)}
            onMouseLeave={() => onHover?.(null)}
            onFocus={() => onHover?.(box.node)}
            onBlur={() => onHover?.(null)}
            aria-label={`${box.n} ${box.termEn} ${box.displayZh}`}
          >
            <span aria-hidden="true">{box.n}</span>
          </button>
        )
      })}
    </div>
  )
}
