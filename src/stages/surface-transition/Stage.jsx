import { useEffect, useState } from 'react'

/* 过渡形变台。
 * 四种演示外壳按驱动方式分：卡片展开（点击驱动）、结构展开（折叠）、
 * 轨道（连续位移）、滚动（滚动位置驱动）。变体自己在 manifest 里声明走哪个壳。
 * 全部自动循环播放，不用用户点也能看出差别。
 */

const CARDS = ['声音', '光', '重量']

export default function SurfaceTransitionStage({ stage, variant, values, replayKey }) {
  const preset = variant?.render?.preset || 'idle'
  const shell = variant?.render?.shell || 'card'
  const { duration = 520, distance = 40, radius = 12 } = values

  const [open, setOpen] = useState(false)
  const [pick, setPick] = useState(0)
  const [slide, setSlide] = useState(0)

  /* 卡片壳与结构壳自动开合，轨道壳自动推进。 */
  useEffect(() => {
    setOpen(false)
    setSlide(0)
    if (preset === 'idle') return undefined
    if (shell === 'track') {
      const timer = setInterval(() => setSlide((s) => (s + 1) % CARDS.length), Math.max(700, duration * 2.2))
      return () => clearInterval(timer)
    }
    const timer = setInterval(() => setOpen((v) => !v), Math.max(700, duration * 2.2))
    return () => clearInterval(timer)
  }, [preset, shell, duration, replayKey])

  const style = {
    '--st-dur': `${duration}ms`,
    '--st-dist': `${distance}px`,
    '--st-radius': `${radius}px`,
    '--st-dir': pick === 0 ? '-1' : pick === CARDS.length - 1 ? '1' : '0',
  }

  if (preset === 'idle') {
    return (
      <div className="st" style={style}>
        <div className="st-cards">
          {CARDS.map((c) => <div key={c} className="st-card">{c}</div>)}
        </div>
        <p className="st-hint">左栏点一条术语，这批卡片就按那种走法从 A 变到 B。</p>
      </div>
    )
  }

  if (shell === 'stack') {
    return (
      <div className={`st st-shell-stack st-${preset}`} style={style}>
        <div className="st-rows">
          {CARDS.map((c, i) => {
            const on = preset === 'accordion' ? open && i === 1 : open
            return (
              <div key={c} className={`st-row ${on ? 'on' : ''}`}>
                <div className="st-row-h"><b>{c}</b><i>{on ? '−' : '+'}</i></div>
                <div className="st-row-body"><p>这一段的高度由内容量决定，写死高度会在内容变化时跳一下。</p></div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (shell === 'track') {
    return (
      <div className={`st st-shell-track st-${preset}`} style={style}>
        <div className="st-vp">
          <div className="st-track" style={{ transform: `translateX(calc(${-slide} * (100% / 3)))` }}>
            {CARDS.map((c, i) => (
              <div key={c} className={`st-slide ${i === slide ? 'on' : ''}`}><b>{c}</b></div>
            ))}
          </div>
        </div>
        <div className="st-dots">
          {CARDS.map((c, i) => <i key={c} className={i === slide ? 'on' : ''} />)}
        </div>
        {preset === 'rotator' && <p className="st-hint">自动推进中 · 无障碍要求可暂停</p>}
      </div>
    )
  }

  if (shell === 'scroll') {
    return (
      <div className={`st st-shell-scroll st-${preset}`} style={style} key={`${preset}-${replayKey}`}>
        <div className="st-scroll-vp">
          <div className="st-scroll-track">
            <div className="st-layer st-layer-back" />
            <div className="st-layer st-layer-mid" />
            <div className="st-scroll-items">
              {[...CARDS, ...CARDS].map((c, i) => (
                <div key={`${c}-${i}`} className="st-scroll-item" style={{ '--i': i }}>{c}</div>
              ))}
            </div>
          </div>
        </div>
        {preset === 'scroll-driven' && (
          <div className="st-progress"><i /></div>
        )}
      </div>
    )
  }

  return (
    <div className={`st st-shell-card st-${preset} ${open ? 'open' : ''}`} style={style}>
      <div className="st-cards">
        {CARDS.map((c, i) => (
          <button
            key={c}
            type="button"
            className={`st-card ${i === pick ? 'picked' : ''}`}
            onClick={() => { setPick(i); setOpen(true) }}
          >{c}</button>
        ))}
      </div>

      <div className="st-detail" aria-hidden={!open}>
        <div className="st-detail-hero">{CARDS[pick]}</div>
        <p>从卡片走到详情。看的是：动的是同一个元素，还是两个元素在接力。</p>
      </div>
    </div>
  )
}
