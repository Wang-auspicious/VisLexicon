import { useEffect, useRef, useState } from 'react'
import { AXES } from './entries.js'
import { DEMOS } from './demos.jsx'

export { AXES }

/* ---------- 参数滑块（受控：调完的值进 Spec，并实时驱动演示） ---------- */
export function Sliders({ entry, value, onChange }) {
  if (!entry.params || !entry.params.length) return null
  return (
    <div className="sliders">
      {entry.params.map((q) => {
        const v = Number(value?.[q.k] ?? q.def)
        return (
          <label key={q.k} className="slider">
            <span>{q.label} <em>{v}{q.unit}</em></span>
            <input
              type="range"
              min={q.min} max={q.max} step={q.step}
              value={v}
              onChange={(ev) => onChange?.({ ...value, [q.k]: Number(ev.target.value) })}
            />
          </label>
        )
      })}
    </div>
  )
}

/* ---------- 实时演示帧：视口内才激活 ---------- */
export function DemoFrame({ entry, active: forceActive, className = '' }) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  const [hover, setHover] = useState(false)
  const D = DEMOS[entry.id]
  const active = forceActive !== undefined ? forceActive : (inView && hover)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return undefined
    const io = new IntersectionObserver((es) => setInView(es[0].isIntersecting), { rootMargin: '120px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      className={`demo-frame ${active ? 'on' : ''} ${className}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {D ? <D {...entry} active={active} /> : <div className="demo-missing">no demo</div>}
    </div>
  )
}

/* ---------- 记谱法 ---------- */
export function Notation({ entry }) {
  if (!entry.notation) return null
  return (
    <div className="notation">
      <span className="notation-label">记谱</span>
      <code>{entry.notation}</code>
    </div>
  )
}

/* ---------- 单行分类徽标 ---------- */
export function AxisBadge({ axisId, small }) {
  const a = AXES.find((x) => x.id === axisId)
  if (!a) return null
  return (
    <span className={`axis-badge ${small ? 'sm' : ''}`}>
      <i>{a.glyph}</i>
      <b>{a.zh}</b>
      {!small && <em>{a.en}</em>}
    </span>
  )
}

/* ---------- 剪贴板按钮 ---------- */
export function CopyBtn({ text, label = '复制', done = '✓ 已复制' }) {
  const [ok, setOk] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(text)
    setOk(true)
    setTimeout(() => setOk(false), 1400)
  }
  return (
    <button type="button" className={`copy-btn ${ok ? 'ok' : ''}`} onClick={copy}>
      {ok ? done : label}
    </button>
  )
}

/* ---------- 高危标签 ---------- */
export function HotTag({ on }) {
  if (!on) return null
  return <span className="hot-tag">HOT</span>
}