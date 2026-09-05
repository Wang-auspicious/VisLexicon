import { useEffect, useMemo, useRef, useState } from 'react'
import { DemoFrame } from './ui.jsx'
import { autopsyProfileFor } from './lib/autopsy-profile.js'

/* ---------- cubic-bezier 求解 ---------- */
const BEZ = (a, b, t) => 3 * a * (1 - t) ** 2 + 3 * b * (1 - t) * t + t ** 3
function sampleBezier([x1, y1, x2, y2], u) {
  return [BEZ(x1, x2, u), BEZ(y1, y2, u)]
}
function solveU([x1, , x2], t) {
  let u = t
  for (let i = 0; i < 12; i++) {
    const x = BEZ(x1, x2, u)
    const dx = 3 * (1 - u) ** 2 * x1 + 6 * (1 - u) * u * (x2 - x1) + 3 * u ** 2 * (1 - x2)
    u -= (x - t) / (dx || 1e-6)
    if (u < 0) u = 0
    if (u > 1) u = 1
  }
  return u
}
function easingPoints(bez, n = 60) {
  const pts = []
  for (let i = 0; i <= n; i++) {
    const u = solveU(bez, i / n)
    pts.push(sampleBezier(bez, u))
  }
  return pts
}

function EasingChart({ bez, prog }) {
  const w = 300
  const h = 120
  const pad = 8
  const pts = useMemo(() => easingPoints(bez), [bez])
  const d = pts
    .map(([x, y], i) => `${i ? 'L' : 'M'}${(x * (w - pad * 2) + pad).toFixed(1)},${(h - pad - y * (h - pad * 2)).toFixed(1)}`)
    .join(' ')
  const u = solveU(bez, prog)
  const [px, py] = sampleBezier(bez, u)
  const dotX = px * (w - pad * 2) + pad
  const dotY = h - pad - py * (h - pad * 2)
  return (
    <svg className="easing-chart" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} className="ec-axis" />
      <line x1={pad} y1={h - pad} x2={pad} y2={pad} className="ec-axis" />
      <path d={d} className="ec-curve" fill="none" />
      <line x1={pad} y1={h - pad} x2={w - pad} y2={pad} stroke="rgba(128,128,128,.18)" strokeDasharray="3 4" />
      <circle cx={dotX} cy={dotY} r={4} className="ec-dot" />
    </svg>
  )
}

/* ============ 解剖台 ============ */
export function Autopsy({ entry, params, className = '' }) {
  const stageRef = useRef(null)
  const [play, setPlay] = useState(() => Boolean(autopsyProfileFor(entry, params).easing))
  const [slow, setSlow] = useState(false)
  const [xray, setXray] = useState(false)
  const [prog, setProg] = useState(0)
  const raf = useRef(0)

  const merged = useMemo(() => {
    const p = {}
    ;(entry.params || []).forEach((q) => { p[q.k] = Number(params?.[q.k] ?? q.def) })
    return p
  }, [entry, params])

  const profile = useMemo(() => autopsyProfileFor(entry, merged), [entry, merged])
  const bez = profile.easing || [0, 0, 1, 1]

  /* 播放时钟（周期取代表性时长；慢放 = 拉长周期） */
  useEffect(() => {
    if (!play || !profile.easing) return undefined
    const basePeriod = Math.max(0.35, (profile.durationMs || 1200) / 1000)
    const period = slow ? basePeriod * 4 : basePeriod
    const start = performance.now()
    const tick = (now) => {
      const t = ((now - start) / 1000) % period
      setProg(t / period)
    }
    raf.current = requestAnimationFrame(function step(now) {
      tick(now)
      raf.current = requestAnimationFrame(step)
    })
    return () => cancelAnimationFrame(raf.current)
  }, [play, slow, profile.durationMs, profile.easing])

  useEffect(() => {
    stageRef.current?.classList.toggle('paused', !play)
  }, [play])

  useEffect(() => {
    stageRef.current?.style.setProperty('--vl-rate', slow ? 4 : 1)
  }, [slow])

  /* 暂停状态拖 scrub：冻结 CSS 动画到对应帧 */
  const scrub = (v) => {
    setProg(v)
    if (play) return
    stageRef.current?.querySelectorAll('*').forEach((node) => {
      const d = parseFloat(getComputedStyle(node).animationDuration)
      if (Number.isFinite(d) && d > 0) node.style.animationDelay = `${-(d * v).toFixed(3)}s`
    })
  }

  return (
    <div className={`autopsy ${className}`}>
      <div className={`autopsy-stage ${xray ? 'xray' : ''}`} ref={stageRef}>
        <div className="stage-hud">
          <span className="stage-hud-id">APTOPSY · {entry.id.toUpperCase()}</span>
          <span className="stage-hud-param x-mono">{entry.notation?.split('·')[0]}</span>
        </div>
        <DemoFrame entry={{ ...entry, p: merged }} active={play} className="autopsy-frame" />
        {xray && <XrayOverlay entry={entry} />}
      </div>

      <div className="autopsy-panel">
        <div className="autopsy-ctrl">
          <button type="button" className={`ctrl-btn ${play ? 'on' : ''}`} onClick={() => setPlay(!play)} disabled={!profile.easing}>
            {profile.easing ? (play ? '⏸ 暂停' : '▶ 播放') : '静态标本'}
          </button>
          <button type="button" className={`ctrl-btn ${slow ? 'on' : ''}`} onClick={() => setSlow(!slow)}>
            0.25×
          </button>
          <button type="button" className={`ctrl-btn ${xray ? 'on' : ''}`} onClick={() => setXray(!xray)}>
            ⟠ X 光
          </button>
          <span className="autopsy-label x-mono">{(prog * 100).toFixed(0)}%</span>
        </div>
        <div className="autopsy-scrub">
          <span className="scrub-mark x-mono">scrub</span>
          <input
            type="range" min={0} max={1} step={0.001}
            value={prog}
            onInput={(ev) => scrub(Number(ev.target.value))}
          />
        </div>
        <div className="autopsy-readout">
          <div className="readout-row">
            <span className="readout-k">元素轨迹</span>
            <span className="readout-v">{profile.trajectory}</span>
          </div>
          <div className="readout-row">
            <span className="readout-k">缓动曲线</span>
            <span className="readout-v x-mono">{profile.easing ? bez.map((n) => n.toFixed(2)).join(', ') : '不适用'}</span>
          </div>
          <div className="readout-row">
            <span className="readout-k">渲染</span>
            <span className="readout-v">{profile.render}</span>
          </div>
          <div className="easing-box">
            {profile.easing ? (
              <>
                <EasingChart bez={bez} prog={prog} />
                <p>{profile.durationMs}ms 周期；曲线点与画面播放进度同步。</p>
              </>
            ) : (
              <p>该词条描述静态布局或材质，没有统一的时间曲线。</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- X 光叠加层 ---------- */
function XrayOverlay({ entry }) {
  return (
    <div className="xray-layer" aria-hidden>
      <svg className="xray-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <rect x="0.6" y="0.6" width="98.8" height="98.8" className="xr-rect" />
        <line x1="50" y1="0" x2="50" y2="100" className="xr-axis" />
        <line x1="0" y1="50" x2="100" y2="50" className="xr-axis" />
        <circle cx="50" cy="50" r="3" className="xr-origin" />
        <path d="M 2 30 A 28 28 0 0 1 30 2" className="xr-radius" />
        <text x="16" y="16" className="xr-text">r≈{entry.params?.[0]?.def ?? 12}px</text>
      </svg>
      <div className="xray-hud">
        <span>bbox</span>
        <span>transform-origin: center</span>
        <span>radius 可调 → 几何即参数</span>
      </div>
    </div>
  )
}
