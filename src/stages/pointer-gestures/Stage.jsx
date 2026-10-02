import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { makeNodeBinder } from '../node.js'

/* 指针与手势台。
 * 这台的参数不是摆设：阈值、轴锁、橡皮筋、指针捕获、点击过滤全部接在真实的
 * pointer 事件上。调一个值，方块当场换一种脾气——这比读十行定义管用。
 */

const REORDER = ['声音', '光', '重量']

function clampWithRubberband(value, limit, rubberband) {
  if (limit <= 0) return value
  const over = Math.abs(value) - limit
  if (over <= 0) return value
  const sign = Math.sign(value)
  /* 越界后按系数衰减，而不是硬停在边上。 */
  return sign * (limit + over * rubberband)
}

function angleAllowed(dx, dy, angleBounds) {
  if (angleBounds >= 90) return true
  if (dx === 0 && dy === 0) return true
  const angle = Math.abs((Math.atan2(dy, dx) * 180) / Math.PI)
  const fromHorizontal = Math.min(angle, Math.abs(180 - angle))
  return fromHorizontal <= angleBounds
}

export default function PointerGesturesStage({ stage, variant, values, activeNode, hoverNode, onHover, replayKey }) {
  const preset = variant?.render?.preset || 'idle'
  const node = makeNodeBinder({ activeNode, hoverNode, onHover })
  const {
    threshold = 0, axisThreshold = 0, tapsThreshold = 3, delay = 0, bounds = 0,
    rubberband = 0.15, swipeDistance = 50, swipeVelocity = 0.5, swipeDuration = 250,
    from = 0, angleBounds = 90, scaleBounds = 2,
    filterTaps = true, preventScroll = true, preventDefault = false,
    pointerCapture = true, pointerTouch = true, pointerLock = false,
    triggerAllEvents = false, enabled = true,
    axis = 'none', preventScrollAxis = 'y', modifierKey = 'none', pointerButtons = '主键',
    tileSize = 76, radius = 14,
  } = values

  const [offset, setOffset] = useState({ x: from, y: 0 })
  const [scale, setScale] = useState(1)
  const [phase, setPhase] = useState('idle')
  const [lockedAxis, setLockedAxis] = useState(null)
  const [verdict, setVerdict] = useState('—')
  const [metrics, setMetrics] = useState({ distance: 0, velocity: 0, events: 0 })
  const [hovering, setHovering] = useState(false)
  const [holdProgress, setHoldProgress] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  const start = useRef(null)
  const delayTimer = useRef(0)
  const holdTimer = useRef(0)

  const reset = useCallback(() => {
    setOffset({ x: from, y: 0 })
    setScale(1)
    setPhase('idle')
    setLockedAxis(null)
    setVerdict('—')
    setMetrics({ distance: 0, velocity: 0, events: 0 })
    setHoldProgress(0)
    setDismissed(false)
  }, [from])

  useEffect(() => {
    reset()
    return () => {
      clearTimeout(delayTimer.current)
      clearInterval(holdTimer.current)
    }
  }, [preset, replayKey, reset])

  const usesPointer = ['drag', 'press', 'longpress', 'gesture'].includes(preset)
  const limit = Math.max(0, 130 - bounds)

  const onPointerDown = (event) => {
    if (!enabled || !usesPointer) return
    if (!pointerTouch && event.pointerType === 'touch') { setVerdict('触摸指针已被拒绝'); return }
    if (pointerButtons === '主键' && event.button !== 0) { setVerdict('非主键，已忽略'); return }
    if (modifierKey !== 'none' && !event[modifierKey]) { setVerdict(`需要按住 ${modifierKey}`); return }
    if (preventDefault) event.preventDefault()
    /* 合成事件或已失效的 pointerId 会让捕获抛错，不能因此把整段手势掐死。 */
    if (pointerCapture) {
      try { event.currentTarget.setPointerCapture?.(event.pointerId) } catch { /* 捕获失败不影响手势本身 */ }
    }

    start.current = { x: event.clientX, y: event.clientY, t: performance.now(), base: offset }
    setVerdict('—')
    setLockedAxis(null)

    if (preset === 'longpress') {
      setPhase('holding')
      const began = performance.now()
      holdTimer.current = setInterval(() => {
        const ratio = Math.min(1, (performance.now() - began) / Math.max(120, delay || 500))
        setHoldProgress(ratio)
        if (ratio >= 1) {
          clearInterval(holdTimer.current)
          setPhase('long-pressed')
          setVerdict(`长按达成（${Math.round(delay || 500)}ms）`)
        }
      }, 30)
      return
    }

    setPhase('pressed')
    if (delay > 0) {
      delayTimer.current = setTimeout(() => setPhase('armed'), delay)
    } else {
      setPhase('armed')
    }
  }

  const onPointerMove = (event) => {
    if (preset === 'move') {
      const rect = event.currentTarget.getBoundingClientRect()
      setOffset({ x: event.clientX - rect.left - rect.width / 2, y: event.clientY - rect.top - rect.height / 2 })
      setMetrics((m) => ({ ...m, events: m.events + 1 }))
      return
    }
    if (!start.current || !usesPointer || preset === 'longpress') return
    if (phase === 'pressed') return

    let dx = event.clientX - start.current.x
    let dy = event.clientY - start.current.y
    const distance = Math.hypot(dx, dy)
    if (triggerAllEvents) setMetrics((m) => ({ ...m, events: m.events + 1 }))

    if (phase === 'armed') {
      if (distance < threshold) return
      if (filterTaps && distance <= tapsThreshold) return
      setPhase('dragging')
    }
    if (preset === 'press') return

    let effective = lockedAxis
    if (axis === 'lock' && !effective && distance > axisThreshold) {
      effective = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y'
      setLockedAxis(effective)
    }
    const lockTo = axis === 'x' || axis === 'y' ? axis : effective
    if (lockTo === 'x') dy = 0
    if (lockTo === 'y') dx = 0
    if (!angleAllowed(dx, dy, angleBounds)) return

    const base = start.current.base
    setOffset({
      x: clampWithRubberband(base.x + dx, limit, rubberband),
      y: clampWithRubberband(base.y + dy, limit, rubberband),
    })
    setMetrics((m) => ({ ...m, distance: Math.round(distance) }))
  }

  const onPointerUp = (event) => {
    clearTimeout(delayTimer.current)
    clearInterval(holdTimer.current)
    if (!start.current || !usesPointer) { setPhase('idle'); return }

    const dx = event.clientX - start.current.x
    const dy = event.clientY - start.current.y
    const distance = Math.hypot(dx, dy)
    const elapsed = performance.now() - start.current.t
    const velocity = distance / Math.max(1, elapsed)

    if (preset === 'longpress') {
      if (holdProgress < 1) setVerdict(`长按未达成（松手于 ${Math.round(elapsed)}ms）`)
      setPhase('idle')
      setHoldProgress(0)
      start.current = null
      return
    }

    if (distance <= tapsThreshold) {
      setVerdict(filterTaps ? '判定为轻点，已被 filterTaps 拦下' : '判定为轻点（未过滤，仍触发拖拽起手）')
    } else if ((distance >= swipeDistance || velocity >= swipeVelocity) && elapsed <= swipeDuration) {
      const direction = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? '右' : '左') : (dy > 0 ? '下' : '上')
      setVerdict(`判定为滑动 · 向${direction}`)
      if (Math.abs(dx) >= swipeDistance && Math.abs(dx) > Math.abs(dy)) setDismissed(true)
    } else {
      setVerdict('判定为拖拽')
    }

    setMetrics({ distance: Math.round(distance), velocity: Number(velocity.toFixed(2)), events: metrics.events })
    /* 松手回到边界内：橡皮筋只在拖拽过程中允许越界。 */
    setOffset((current) => ({
      x: Math.max(-limit, Math.min(limit, current.x)),
      y: Math.max(-limit, Math.min(limit, current.y)),
    }))
    setPhase('idle')
    start.current = null
  }

  const onWheel = (event) => {
    if (preset === 'pinch') {
      if (!event.ctrlKey) { setVerdict('捏合需要 Ctrl + 滚轮（桌面模拟双指）'); return }
      setScale((s) => Math.max(0.5, Math.min(scaleBounds, s - event.deltaY / 500)))
      setVerdict('捏合中')
      return
    }
    if (preset === 'wheel' || preset === 'gesture') {
      setOffset((o) => ({ x: o.x, y: clampWithRubberband(o.y + event.deltaY / 6, limit, rubberband) }))
      setMetrics((m) => ({ ...m, events: m.events + 1 }))
      setVerdict('滚轮事件')
    }
  }

  const touchAction = preventScroll
    ? (preventScrollAxis === 'xy' ? 'none' : preventScrollAxis === 'y' ? 'pan-x' : 'pan-y')
    : 'auto'

  const readout = useMemo(() => ([
    ['状态', phase],
    ['位移', `${Math.round(offset.x)}, ${Math.round(offset.y)}`],
    ['距离', `${metrics.distance}px`],
    ['速度', `${metrics.velocity}px/ms`],
    ['锁定轴', axis === 'lock' ? (lockedAxis || '未定') : axis],
    ['判定', verdict],
    ...(triggerAllEvents ? [['事件数', String(metrics.events)]] : []),
    ...(pointerLock ? [['指针锁定', '已声明（本台不真的接管光标）']] : []),
  ]), [phase, offset, metrics, axis, lockedAxis, verdict, triggerAllEvents, pointerLock])

  return (
    <div className="pg" style={{ '--pg-size': `${tileSize}px`, '--pg-radius': `${radius}px` }}>
      <div className="pg-main">
        <div
          className={`pg-frame ${preset === 'scroll' ? 'pg-frame-scroll' : ''}`}
          style={{ '--pg-bounds': `${bounds}px`, touchAction }}
          onPointerMove={preset === 'move' ? onPointerMove : undefined}
          onPointerEnter={preset === 'hover' ? () => { setHovering(true); setVerdict('进入') } : undefined}
          onPointerLeave={preset === 'hover' ? () => { setHovering(false); setVerdict('离开') } : undefined}
          onWheel={preset === 'wheel' || preset === 'pinch' || preset === 'gesture' ? onWheel : undefined}
          onScroll={preset === 'scroll' ? (e) => {
            setMetrics((m) => ({ ...m, distance: Math.round(e.currentTarget.scrollTop), events: m.events + 1 }))
            setVerdict('滚动中')
          } : undefined}
        >
          {bounds > 0 && <div className="pg-bounds" aria-hidden="true" />}

          {preset === 'scroll' && <div className="pg-scroll-filler" />}

          <div
            {...node('gesture.tile', 'pg-tile')} data-zone="scene-parts"
            role="button"
            tabIndex={0}
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              transition: phase === 'idle' ? 'transform 0.24s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
              opacity: enabled ? 1 : 0.4,
              touchAction,
            }}
            onPointerDown={onPointerDown}
            onPointerMove={preset === 'move' ? undefined : onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <span className={`pg-tile-label ${hovering ? 'on' : ''}`}>{stage.specimen.tile}</span>
            {preset === 'longpress' && (
              <i className="pg-hold" style={{ transform: `scaleX(${holdProgress})` }} aria-hidden="true" />
            )}
          </div>

          <div {...node('gesture.dropzone', 'pg-dropzone')} data-zone="scene-parts">放置区</div>
        </div>

        <div className="pg-side">
          <div {...node('gesture.press', 'pg-press')} data-zone="scene-parts" data-state={phase}>
            <i />按压反馈
          </div>
          <button type="button" {...node('gesture.focusring', 'pg-focusring')} data-zone="scene-parts">焦点环 · Tab 试试</button>
          <div {...node('gesture.dismiss', `pg-dismiss ${dismissed ? 'gone' : ''}`)} data-zone="scene-parts">
            {dismissed ? '已滑走 · 重演可恢复' : '横向快滑我'}
          </div>
          <div {...node('gesture.reorder', 'pg-reorder')} data-zone="scene-parts">
            {REORDER.map((item) => <i key={item}>⠿ {item}</i>)}
          </div>
        </div>
      </div>

      <dl className="pg-readout">
        {readout.map(([label, value]) => (
          <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
        ))}
      </dl>

      {preset === 'idle' && <p className="pg-hint">左栏点一种手势绑到方块上，下方参数随即生效。</p>}
    </div>
  )
}
