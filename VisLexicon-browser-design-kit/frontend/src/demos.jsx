import { useEffect, useRef, useState } from 'react'

/* ============ 交互原语（JS 驱动） ============ */

function Tilt({ p, children }) {
  const ref = useRef(null)
  const max = Number(p?.max) || 12
  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(640px) rotateY(${(x * max * 2).toFixed(2)}deg) rotateX(${(-y * max * 2).toFixed(2)}deg)`
  }
  const reset = () => {
    if (ref.current) ref.current.style.transform = 'perspective(640px) rotateY(0deg) rotateX(0deg)'
  }
  return (
    <div className="tilt-wrap" onMouseMove={onMove} onMouseLeave={reset}>
      <div ref={ref} className="tilt-card">{children}</div>
    </div>
  )
}

function Magnetic({ p, children }) {
  const ref = useRef(null)
  const s = Number(p?.strength) || 0.4
  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.parentElement.getBoundingClientRect()
    const dx = e.clientX - (r.left + r.width / 2)
    const dy = e.clientY - (r.top + r.height / 2)
    el.style.transform = `translate(${(dx * s).toFixed(1)}px, ${(dy * s).toFixed(1)}px)`
  }
  const reset = () => { if (ref.current) ref.current.style.transform = 'translate(0,0)' }
  return (
    <div className="magnet-wrap" onMouseMove={onMove} onMouseLeave={reset}>
      <div ref={ref}>{children}</div>
    </div>
  )
}

function Spotlight({ p, children, className = '' }) {
  const ref = useRef(null)
  const radius = Number(p?.radius) || 160
  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  return (
    <div ref={ref} className={className} onMouseMove={onMove} style={{ '--sp-r': `${radius}px` }}>
      {children}
    </div>
  )
}

function Parallax({ p, children }) {
  const ref = useRef(null)
  const depth = Number(p?.depth) || 24
  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--px', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3))
    el.style.setProperty('--py', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3))
  }
  const reset = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--px', 0)
    el.style.setProperty('--py', 0)
  }
  return (
    <div ref={ref} className="par-wrap" onMouseMove={onMove} onMouseLeave={reset} style={{ '--depth': `${depth}px` }}>
      {children}
    </div>
  )
}

const SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#________'

function useScramble(words, speed, active) {
  const [out, setOut] = useState(words[0])
  useEffect(() => {
    if (!active) {
      setOut(words[0])
      return undefined
    }
    let wi = 0
    let reveal = 0
    const id = setInterval(() => {
      const w = words[wi % words.length]
      reveal += 1
      if (reveal > w.length + 10) { wi += 1; reveal = 0 }
      let s = ''
      for (let i = 0; i < w.length; i++) {
        if (i < reveal) s += w[i]
        else if (w[i] === ' ') s += ' '
        else s += SCRAMBLE_CHARS[(Math.random() * SCRAMBLE_CHARS.length) | 0]
      }
      setOut(s)
    }, Math.max(16, Number(speed) || 55))
    return () => clearInterval(id)
  }, [words, speed, active])
  return out
}

/* ============ 微型零件 ============ */
const Dots = ({ dark }) => (
  <span className={`sc-dots ${dark ? 'dark' : ''}`}><i /><i /><i /></span>
)
const Av = ({ bg, ch, s = 18 }) => (
  <i className="sc-av" style={{ background: bg, width: s, height: s, fontSize: s * 0.44 }}>{ch}</i>
)
const Spark = ({ d, color = 'currentColor', fill = false }) => (
  <svg viewBox="0 0 100 32" className="sc-spark" aria-hidden>
    {fill && <path d={`${d} L100,32 L0,32 Z`} fill={color} opacity="0.12" />}
    <path d={d} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
  </svg>
)

/* ============ LAYOUT 场景 ============ */

const ScBento = () => (
  <div className="sc sc-bento">
    <div className="bn t1">
      <b>Ship faster.</b>
      <span>从想法到上线，一个工作流</span>
      <Spark d="M0,26 C10,24 14,18 22,19 C30,20 34,10 44,12 C54,14 58,8 68,9 C78,10 84,4 100,3" color="#7ee2b8" />
    </div>
    <div className="bn t2"><em>99.99%</em><span>uptime</span></div>
    <div className="bn t3 glass"><i className="blob" data-loop /><b>Edge Runtime</b></div>
    <div className="bn t4">
      <div className="bars"><i style={{ height: '38%' }} /><i style={{ height: '62%' }} /><i style={{ height: '50%' }} /><i style={{ height: '86%' }} /><i style={{ height: '100%' }} /></div>
      <span>deploys / wk</span>
    </div>
    <div className="bn t5">
      <div className="avs"><Av bg="linear-gradient(135deg,#f97316,#ef4444)" ch="K" /><Av bg="linear-gradient(135deg,#8b5cf6,#6366f1)" ch="M" /><Av bg="linear-gradient(135deg,#14b8a6,#0ea5e9)" ch="J" /></div>
      <span>12k makers</span>
    </div>
  </div>
)

const ScHolyGrail = () => (
  <div className="sc sc-grail">
    <header><Dots dark /><span className="ttl">工作台 · Console</span></header>
    <aside><b>导航</b><i className="on" />流量<i />订单<i />用户<i />设置</aside>
    <main>
      <b>总览</b>
      <div className="cards"><i /><i /><i /></div>
      <div className="chart" data-loop />
    </main>
    <aside className="r"><b>动态</b><i /><i /><i /></aside>
    <footer>© Console v2.3 · 状态正常</footer>
  </div>
)

const ScMasonry = () => (
  <div className="sc sc-masonry">
    {[['#f6c9a0,#e88d5d', 64, '陶土色卡'], ['#bcd4c2,#7fa88b', 44, 'sage 研究'], ['#b8d3ea,#6f9fce', 88, '天空日记'], ['#d8c7e8,#9b7fc4', 56, '薰衣草'], ['#f3e2a2,#d9b84a', 76, '黄油光线'], ['#eebbb4,#d9706a', 48, '珊瑚'], ['#c7e0dd,#6da8a2', 70, '薄荷湖'], ['#e8d5bf,#c0a284', 52, '牛皮纸样本']]
      .map(([g, h, t], i) => (
        <figure key={i} className="mi" style={{ height: h }}>
          <i style={{ background: `linear-gradient(160deg,${g})` }} />
          <figcaption>{t}</figcaption>
        </figure>
      ))}
  </div>
)

const ScSplit = () => (
  <div className="sc sc-split">
    <div className="l">
      <em>COLLECTION AW/26</em>
      <strong>北方<br />事务所</strong>
      <span>巴黎 · 上海</span>
    </div>
    <div className="spine" />
    <div className="r">
      <i className="art" data-loop />
      <small>LOOKBOOK — N°07</small>
    </div>
  </div>
)

const ScSidebar = () => (
  <div className="sc sc-sidebar">
    <aside>
      <b><i className="mark" /> Relume</b>
      <span className="on">◈ 收件箱</span>
      <span>◇ 今日待办</span>
      <span>◆ 产品路线图</span>
      <span>◇ 团队空间</span>
      <span>◆ 归档</span>
    </aside>
    <main>
      <h4>产品路线图</h4>
      <i className="ln w60" /><i className="ln w90" /><i className="ln w80" />
      <div className="todo"><i className="ck" />竞争分析草稿<i className="tag">进行中</i></div>
      <div className="todo"><i className="ck on" />用户访谈纪要<i className="tag done">已完成</i></div>
    </main>
  </div>
)

const ScSticky = () => (
  <div className="sc sc-sticky">
    <div className="col">
      <em>新特性</em>
      <b>主动降噪，<br />更进一步。</b>
      <p data-loop>自适应通透模式……</p>
      <p data-loop>个性化空间音频，</p>
      <p data-loop>单次充电聆听六小时。</p>
    </div>
    <div className="pin">
      <div className="device">
        <i className="island" />
        <i className="screen" data-loop />
      </div>
      <small>PINNED</small>
    </div>
  </div>
)

const ScKanban = () => (
  <div className="sc sc-kanban">
    <div className="kcol">
      <small>BACKLOG <b>3</b></small>
      <div className="kc"><i className="lb c1" />图标系统重构<span className="meta"><Av bg="#e2e5ec" ch="A" s={14} />2</span></div>
      <div className="kc"><i className="lb c2" />深色主题<i className="meta">▾</i></div>
    </div>
    <div className="kcol">
      <small>进行中 <b>2</b></small>
      <div className="kc drag" data-loop><i className="lb c3" />Spec 端点联调<span className="meta"><Av bg="linear-gradient(135deg,#8b5cf6,#6366f1)" ch="L" s={14} />8</span></div>
    </div>
    <div className="kcol">
      <small>已完成 <b>9</b></small>
      <div className="kc dim"><i className="lb c4" />词表 v1.0<span className="meta">✓</span></div>
    </div>
  </div>
)

const ScTimeline = () => (
  <div className="sc sc-timeline">
    <i className="axis" />
    <div className="nd l n0" data-loop><em>2025 Q3</em><span>词典 MVP 上线</span></div>
    <div className="nd r n1" data-loop><em>2025 Q4</em><span>生态索引 + MCP</span></div>
    <div className="nd l n2" data-loop><em>2026 Q1</em><span>Spec 选型器</span></div>
    <div className="nd r n3" data-loop><em>2026 Q3</em><span>灵感画廊</span></div>
  </div>
)

const ScCardStack = () => (
  <div className="sc sc-stack">
    <div className="cd c3" />
    <div className="cd c2" />
    <div className="cd c1" data-loop>
      <i className="ph" />
      <b>Mika · 24</b>
      <span>东京 · 插画师</span>
    </div>
    <small className="hint">← 滑走看下一张</small>
  </div>
)

const ScDock = () => (
  <div className="sc sc-dock">
    <div className="wall" />
    <div className="bar">
      {['linear-gradient(135deg,#4facfe,#0055ff)', 'linear-gradient(135deg,#34c759,#0ea84f)', 'linear-gradient(135deg,#ff9d2e,#ff5e3a)', 'linear-gradient(135deg,#bf5af2,#8e44ec)', 'linear-gradient(135deg,#5e5ce6,#3634a3)', 'linear-gradient(135deg,#1c1c1e,#3a3a3c)'].map((g, i) => (
        <i key={i} className={`ic ${i === 2 ? 'bounce' : ''}`} style={{ background: g }} data-loop={i === 2 ? true : undefined} />
      ))}
    </div>
  </div>
)

/* ============ INTERACTION 场景 ============ */

const ScTilt = ({ p }) => (
  <div className="sc sc-tilt">
    <div className="halo" />
    <Tilt p={p}>
      <div className="card3d">
        <i className="chip" />
        <span className="num">•••• •••• •••• 4921</span>
        <span className="nm">VISLEXICON DESIGNER</span>
        <i className="glare" />
      </div>
    </Tilt>
  </div>
)

const ScMagnetic = ({ p }) => (
  <div className="sc sc-magnetic">
    <Magnetic p={p}>
      <button type="button" className="btn">开始创造 <b>→</b></button>
    </Magnetic>
    <small>按钮被光标磁吸 · strength 控制 · 松手弹回</small>
  </div>
)

const ScSpotlight = ({ p }) => (
  <div className="sc sc-spotlight">
    <Spotlight p={p} className="sp-zone">
      <div className="panel">
        <div className="ph"><b>命令面板</b><kbd>⌘K</kbd></div>
        {['跳转到词条…', '导出 Design Spec', '切换亮暗主题'].map((t, i) => (
          <div key={t} className={`row ${i === 0 ? 'on' : ''}`}><span>{t}</span><kbd>↵</kbd></div>
        ))}
      </div>
    </Spotlight>
  </div>
)

const ScCursor = ({ p }) => (
  <div className="sc sc-cursor">
    <div className="grid-bg" />
    <span className="ghost-dot">·</span>
    <i className="ring" data-loop style={{ '--lag': Number(p?.lag) || 0.15 }} />
    <small>圆环以 lerp(0.15) 跟随光标</small>
  </div>
)

const ScHoverLift = ({ p }) => (
  <div className="sc sc-hoverlift">
    <div className="cd">
      <i className="img" />
      <b>基础卡</b><span>静态 · 无 hover</span>
    </div>
    <div className="cd lift" data-loop style={{ '--lift': `${Number(p?.lift) || 4}px` }}>
      <i className="img g2" />
      <b>hover 我</b><span>上移 {Number(p?.lift) || 4}px + 深影</span>
    </div>
  </div>
)

const ScUnderline = ({ p }) => (
  <div className="sc sc-underline">
    <em>设计系统手册 —</em>
    <nav>
      <a className="u" data-loop style={{ '--dur': `${Number(p?.dur) || 280}ms` }}>色彩系统</a>
      <a>字体层级</a>
      <a>栅格与间距</a>
    </nav>
    <small>下划线从左划入，离开从左划出</small>
  </div>
)

const ScScramble = ({ p, active }) => {
  const txt = useScramble(['DESIGN_ENGINEERING', 'VIEW_TRANSITION', 'lex:scramble_01'], p?.speed, active)
  return (
    <div className="sc sc-scramble">
      <code>{txt}</code>
      <span>PORTFOLIO_v3 — 握手完成 ▮</span>
    </div>
  )
}

const ScTicker = ({ p }) => (
  <div className="sc sc-ticker">
    <small>周活跃用户</small>
    <div className="num" style={{ '--tdur': `${Number(p?.dur) || 900}ms` }}>
      {'48201'.split('').map((d, i) => (
        <span key={i} className="digit"><i data-loop style={{ '--d': -Number(d), '--i': i }}>0<br />1<br />2<br />3<br />4<br />5<br />6<br />7<br />8<br />9</i></span>
      ))}
    </div>
    <em className="up">▲ 12.4%</em>
    <small>对比上周 · 数字逐位滚动</small>
  </div>
)

const ScMarquee = ({ p }) => (
  <div className="sc sc-marquee">
    <div className="track" data-loop style={{ '--mq-dur': `${p?.duration || 14}s` }}>
      {[0, 1].map((n) => (
        <span key={n} className="seg">
          <i className="f1">ACME<sup>®</sup></i><i className="f2">NORDHAUS</i><i className="f3">fjord&co</i><i className="f4">HELIOS</i><i className="f5">kumo*</i><i className="f1">VANTAGE</i>
        </span>
      ))}
    </div>
    <small>LOGO WALL — 无缝双轨 · hover 暂停</small>
  </div>
)

const ScDrag = () => (
  <div className="sc sc-drag">
    <div className="row"><i className="grip" />设计评审纪要<em>今天</em></div>
    <div className="row grab" data-loop><i className="grip" />Spec 端点联调<em>周三</em></div>
    <div className="row shift" data-loop><i className="grip" />组件索引巡检<em>周五</em></div>
    <div className="row"><i className="grip" />词表数据备份<em>下周</em></div>
  </div>
)

const ScReveal = () => (
  <div className="sc sc-reveal">
    <div className="mock-y" />
    <div className="stackcol">
      {[['◐', '玻璃材质', '毛玻璃 + 描边'], ['✦', '磁吸按钮', '光标吸附回弹'], ['➤', '弹簧物理', 'spring 过冲回位']].map(([g, t, s], i) => (
        <div key={t} className="blk" data-loop style={{ '--i': i }}>
          <i>{g}</i><b>{t}</b><span>{s}</span>
        </div>
      ))}
    </div>
  </div>
)

const ScCompare = () => (
  <div className="sc sc-compare">
    <div className="img before" />
    <div className="img after" data-loop />
    <i className="handle" data-loop><b>‹›</b></i>
    <em className="tag l">BEFORE</em><em className="tag r">AFTER</em>
  </div>
)

/* ============ AESTHETIC 场景 ============ */

const ScGlass = ({ p }) => (
  <div className="sc sc-glass" style={{ '--blur': `${p?.blur || 14}px` }}>
    <i className="blob b1" data-loop /><i className="blob b2" data-loop /><i className="blob b3" data-loop />
    <div className="cc">
      <div className="cell"><i className="t on">◈</i><i className="t">◇</i></div>
      <div className="cell col">
        <span className="sl"><i className="fill" style={{ height: '68%' }} /><b>☀</b></span>
        <span className="sl2"><i className="fillw" style={{ width: '42%' }} /></span>
      </div>
      <div className="cell wide"><i className="cover" /><b>Now Playing</b><span>Midnight City</span><i className="viz" data-loop><u /><u /><u /><u /></i></div>
    </div>
  </div>
)

const ScNeumorph = ({ p }) => (
  <div className="sc sc-neu" style={{ '--soft': `${p?.soft || 16}px` }}>
    <div className="knob"><i data-loop /><b>功放</b></div>
    <div className="tgl out on" data-loop><i /></div>
    <div className="tgl in"><i /></div>
    <small>同色底 · 双向影 · inset 按压</small>
  </div>
)

const ScClay = ({ p }) => (
  <div className="sc sc-clay" style={{ '--clay-soft': `${p?.softness || 14}px` }}>
    <div className="card">
      <div className="plus" data-loop><b>+</b></div>
      <div className="pill r" data-loop>捏我</div>
      <div className="pill o" />
    </div>
    <small>claymorphism — 大圆角 + 双层内阴影</small>
  </div>
)

const ScBrut = ({ p }) => (
  <div className="sc sc-brut" style={{ '--nb-off': `${p?.offset || 6}px` }}>
    <div className="card" data-loop>
      <small>NO.042</small>
      <b>大甩卖！</b>
      <span>全场硬阴影 −50%</span>
      <em>冲 →</em>
    </div>
    <i className="sticker">SALE</i>
  </div>
)

const ScFlat = () => (
  <div className="sc sc-flat">
    <h4>今日清单</h4>
    <div className="it"><i className="ck on">✓</i><s>整理索引数据</s></div>
    <div className="it"><i className="ck" />回复两个 issue</div>
    <div className="it acc"><i className="ck" />写新词条：视图过渡</div>
    <div className="it"><i className="ck" />跑步 5 公里</div>
  </div>
)

const ScSwiss = () => (
  <div className="sc sc-swiss">
    <i className="rule v" /><i className="rule h" />
    <b>GRAFIK<br />N°04</b>
    <i className="dot" />
    <span className="cap">HELVETICA · GRID 12 — ZÜRICH, 1957/2026</span>
  </div>
)

const ScEditorial = () => (
  <div className="sc sc-editorial">
    <header><span>视界 WEEKLY</span><span>Vol.12 · 设计与文明</span><span>¥ 24</span></header>
    <h3>排版的<em>秩序</em>，是隐形的</h3>
    <p>好的版式像空气：你感觉不到它，但它决定你能否自由呼吸。首字下沉是纸刊的仪式……</p>
  </div>
)

const ScTerminal = () => (
  <div className="sc sc-terminal">
    <div className="win">
      <div className="bar"><Dots dark /><span>agent — zsh — 80×24</span></div>
      <div className="body" data-loop>
        <p><em className="path">~/work/vislexicon</em> <em className="git">git:(main)</em> $ npx shadcn@latest mcp</p>
        <p className="dim">✓ registry connected — 12 libraries indexed</p>
        <p><em className="path">~/work/vislexicon</em> <em className="git">git:(main)</em> $ get lex:glassmorphism<span className="caret" /></p>
      </div>
    </div>
  </div>
)

const ScAurora = ({ p }) => (
  <div className="sc sc-aurora" style={{ filter: `hue-rotate(${p?.hue || 0}deg)` }}>
    <i className="a a1" data-loop /><i className="a a2" data-loop /><i className="a a3" data-loop />
    <div className="cap">
      <em>INTRODUCING</em>
      <b>为设计语境而生的词表</b>
      <span>hue-rotate {p?.hue || 0}°</span>
    </div>
  </div>
)

const ScSkeuo = () => (
  <div className="sc sc-skeuo">
    <div className="panel">
      <div className="knob" data-loop>
        <i className="ticks" />
        <i className="ptr" />
      </div>
      <div className="slot"><i className="track"><b data-loop /></i></div>
      <i className="led on" data-loop />
      <span>GAIN · 03</span>
    </div>
  </div>
)

const ScY2K = () => (
  <div className="sc sc-y2k">
    <i className="egg" data-loop />
    <i className="star s1" data-loop /><i className="star s2" data-loop />
    <b className="chrome">MILL★NNIUM</b>
    <span>hyper · chrome · 2000</span>
  </div>
)

const ScPixel = () => (
  <div className="sc sc-pixel">
    <i className="invader" data-loop />
    <b>▼ PRESS START</b>
    <span>STAGE 1 — 58 ENTRIES</span>
  </div>
)

/* ============ MOTION 场景 ============ */

const ScSpring = ({ p }) => {
  const ovs = (1 + Number(p?.overshoot ?? 18) / 100).toFixed(2)
  return (
    <div className="sc sc-spring" style={{ '--a': ovs }}>
      <div className="banner" data-loop>
        <i className="appic" />
        <div><b>弹簧物理</b><span>已按 spring(0.3, {ovs}) 落位</span></div>
        <em>now</em>
      </div>
      <small className="readout">cubic-bezier(.3, {ovs}, .55, 1) — 注意第一次过冲</small>
    </div>
  )
}

const ScStagger = ({ p }) => (
  <div className="sc sc-stagger" data-loop style={{ '--step': `${p?.step || 90}ms` }}>
    {[['#f59e0b', '构建索引', '1,204 条'], ['#10b981', '截图工厂', '队列空闲'], ['#6366f1', '词表 diff', '+3 词条'], ['#ef4444', '死链巡检', '全部通过']].map(([c, t, s], i) => (
      <div key={t} className="row" style={{ '--n': i }}>
        <i style={{ background: c }} />{t}<span>{s}</span>
      </div>
    ))}
  </div>
)

const ScFlip = () => (
  <div className="sc sc-flip">
    <div className="lane">
      {['◈', '◇', '◆', '◉', '✦'].map((g, i) => (
        <span key={i} className={`chip c${i} ${i === 0 ? 'mover' : ''} ${i > 0 && i < 5 ? 'shifter' : ''}`} data-loop={i < 5 ? true : undefined}>{g}</span>
      ))}
    </div>
    <small>FLIP — 首卡位移重排到队尾，其余补位</small>
  </div>
)

const ScShimmer = ({ p }) => (
  <div className="sc sc-shimmer" style={{ '--sh-dur': `${p?.duration || 1.6}s` }}>
    <div className="post">
      <i className="av" data-loop />
      <div className="col">
        <i className="ln w34" data-loop /><i className="ln w20" data-loop />
      </div>
      <i className="ln w92" data-loop /><i className="ln w84" data-loop /><i className="ln w58" data-loop />
      <i className="media" data-loop />
    </div>
    <small>骨架与真实内容同构 · {p?.duration || 1.6}s / 周期</small>
  </div>
)

const ScParallax = ({ p }) => (
  <div className="sc sc-parallax">
    <Parallax p={p}>
      <div className="scene">
        <i className="stars" />
        <i className="moon" />
        <i className="mt back" />
        <i className="mt front" />
        <span className="tag">景深 {p?.depth || 24}px</span>
      </div>
    </Parallax>
  </div>
)

const ScScrub = () => (
  <div className="sc sc-scrub">
    <div className="rail"><i className="thumb" data-loop /></div>
    <div className="stage">
      <div className="panel" data-loop><b>滚动即时间轴</b><span>rotate(p × 90°) · scale(p)</span></div>
      <i className="prog" data-loop />
    </div>
    <small>倒滚 = 倒放 · scrub:0.5</small>
  </div>
)

const ScViewTransition = () => (
  <div className="sc sc-vt">
    <div className="page old" data-loop><small>列表页</small><div className="cardrow"><i /><i /></div></div>
    <div className="page new" data-loop><em className="shared" data-loop>词条 A</em><i className="ln w70" /><i className="ln w88" /><i className="heroimg" /></div>
    <span className="badge">::view-transition</span>
  </div>
)

/* 容器变形：一个元素从圆 → 卡片，内容 fade-through，触点生长 */
const ScContainerTransform = ({ p }) => (
  <div
    className="sc sc-ct"
    style={{
      '--ct-dur': `${Number(p?.dur) || 340}ms`,
      '--ct-r': `${Number(p?.radius) ?? 16}px`,
      '--ct-ovs': 1 + (Number(p?.overshoot) ?? 18) / 100,
    }}
  >
    <div className="ct-canvas">
      <span className="ct-shell" data-loop>
        <i className="ct-old" data-loop>＋</i>
        <span className="ct-new" data-loop>
          <b>新建词条</b>
          <i className="ct-ln w80" />
          <i className="ct-ln w54" />
          <em className="ct-btn">提交 PR</em>
        </span>
      </span>
      <i className="ct-tap" data-loop />
    </div>
    <small>CT[circle→card] · fade-through · origin:tap · {Number(p?.dur) || 340}ms</small>
  </div>
)

const TYPE_TEXT = '你好，我是你的设计 Agent。今天从挑一个词条开始。'

const ScTypewriter = ({ p }) => (
  <div className="sc sc-typewriter">
    <div className="paper">
      <code
        className="type-line"
        data-loop
        style={{ '--cps': `${(22 / (Number(p?.cps) || 12)).toFixed(2)}s`, '--chars': TYPE_TEXT.length }}
      >{TYPE_TEXT}</code>
      <i className="caret" data-loop />
    </div>
    <small>逐字出现 · {Number(p?.cps) || 12} 字/s · 打完删除回打</small>
  </div>
)

const ScBlurIn = ({ p }) => (
  <div className="sc sc-blurin" data-loop style={{ '--bl': `${p?.blur || 12}px` }}>
    <b>对 焦</b>
    <span>模糊 + 透明 → 清晰</span>
    <em>BLUR-IN · 600MS</em>
  </div>
)

const ScSlideSwap = ({ p }) => (
  <div className="sc sc-swap" style={{ '--dur': `${p?.dur || 380}ms` }}>
    <div className="window">
      <div className="train" data-loop>
        <div className="slide a"><b>01 · 基调</b></div>
        <div className="slide b"><b>02 · 骨架</b></div>
        <div className="slide c"><b>03 · 细节</b></div>
      </div>
    </div>
    <div className="dots3"><i className="on" /><i /><i /></div>
    <small>前进向左 · 返回必须向右</small>
  </div>
)

const ScPathMorph = () => (
  <div className="sc sc-morph">
    <svg viewBox="0 0 24 24" className="ico" data-loop>
      <path stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none" d="M5 7 H19 M5 12 H19 M5 17 H19">
        <animate attributeName="d" dur="2.4s" repeatCount="indefinite"
          values="M5 7 H19 M5 12 H19 M5 17 H19; M6.4 6.4 L17.6 17.6 M12 12 L12 12 M6.4 17.6 L17.6 6.4; M5 7 H19 M5 12 H19 M5 17 H19" />
      </path>
    </svg>
    <small>SMIL d 插值：汉堡 ⇄ 叉，段结构必须一致</small>
  </div>
)

/* ============ COMPONENT 场景 ============ */

const ScHero = () => (
  <div className="sc sc-hero">
    <em className="badge">v2.0 · 全新发布</em>
    <strong>发布流程，<i>快人一步</i></strong>
    <span>从改动到上线，一条流水线看得见。</span>
    <div className="ctas"><i className="p">免费开始</i><i className="g">看演示 →</i></div>
    <div className="proof"><span className="avs"><Av bg="linear-gradient(135deg,#0ea5e9,#6366f1)" ch="S" s={16} /><Av bg="linear-gradient(135deg,#f59e0b,#ef4444)" ch="R" s={16} /><Av bg="linear-gradient(135deg,#10b981,#0d9488)" ch="T" s={16} /></span>2,000+ 团队在用</div>
  </div>
)

const ScNavbar = () => (
  <div className="sc sc-navbar">
    <div className="ghost">页面内容区……</div>
    <nav className="glassed">
      <b>◆ Relay</b>
      <span>产品</span><span>定价</span><span>文档</span><span className="blog">博客</span>
      <i className="cta">登录</i>
    </nav>
    <small>滚动后：玻璃化 + 收缩（sticky + blur）</small>
  </div>
)

const ScFeatureGrid = () => (
  <div className="sc sc-features">
    <h4>为什么选 Relay</h4>
    <div className="grid3">
      {[['⚡', '#fef3c7', '#b45309', '极速构建', '增量编译，秒级热更'], ['🛡', '#dbeafe', '#1d4ed8', '默认安全', '端到端签名与审计'], ['▦', '#dcfce7', '#15803d', '组件丰富', '58 词条 · 12 库索引']].map(([g, bg, fg, t, s]) => (
        <div key={t} className="cell"><i style={{ background: bg, color: fg }}>{g}</i><b>{t}</b><span>{s}</span></div>
      ))}
    </div>
  </div>
)

const ScPricing = () => (
  <div className="sc sc-pricing">
    <div className="tier"><small>免费版</small><b>¥0</b><span>每月 5 份 Spec</span><i className="btn g">开始用</i></div>
    <div className="tier pop"><em>最受欢迎</em><small>专业版</small><b>¥59<i>/月</i></b><span>无限 Spec · 图搜 · 私有板</span><i className="btn">升级</i></div>
    <div className="tier"><small>团队版</small><b>¥199</b><span>私有词表 · API 高配额</span><i className="btn g">联系我们</i></div>
  </div>
)

const ScTestimonial = () => (
  <div className="sc sc-testi">
    <div className="q">
      <header><Av bg="linear-gradient(135deg,#0ea5e9,#6366f1)" ch="K" /><b>Kirin Zhou</b><span>@kirin_z · 独立开发</span></header>
      <p>Agent 一次做对了 bento + 毛玻璃，没返工。Spec 里连 blur 半径都写好了。</p>
      <footer><i>♥</i>128<i className="rt">⟳</i>32</footer>
    </div>
    <div className="q">
      <header><Av bg="linear-gradient(135deg,#f59e0b,#ef4444)" ch="M" /><b>Mia Tang</b><span>@mia_builds</span></header>
      <p>「再改改」变成了改数值。参数滑块是设计沟通的第二次革命。</p>
      <footer><i>♥</i>96<i className="rt">⟳</i>18</footer>
    </div>
  </div>
)

const ScCta = () => (
  <div className="sc sc-cta">
    <div className="banner">
      <b>让下一次发布，一次做对。</b>
      <span>挑好词条，生成 Spec，丢给你的 Agent。</span>
      <i className="btn">开始挑选 →</i>
    </div>
  </div>
)

const ScForm = () => (
  <div className="sc sc-form">
    <div className="card">
      <h4>创建账户</h4>
      <label className="fld focus" data-loop><span>邮箱</span><i>dev@example.com</i></label>
      <label className="fld"><span>密码</span><i>••••••••••</i></label>
      <i className="btn">继续 <b>→</b></i>
      <small>已有账户？直接登录</small>
    </div>
  </div>
)

const ScModal = () => (
  <div className="sc sc-modal">
    <div className="ghost"><i className="ln w80" /><i className="ln w60" /><i className="ln w70" /></div>
    <div className="veil" />
    <div className="dlg" data-loop>
      <b>移至回收站？</b>
      <span>「 Spec 端点联调.md 」将被删除，30 天内可恢复。</span>
      <div className="btns"><i className="g">取消</i><i className="d">移到回收站</i></div>
    </div>
  </div>
)

const ScToast = () => (
  <div className="sc sc-toast">
    <div className="t ok" data-loop><i>✓</i><div><b>已创建 Spec</b><span>sp_9f3k2 · 4 词条</span></div><em>×</em></div>
    <div className="t warn" data-loop><i>!</i><div><b>检测到美学冲突</b><span>粗野 × 毛玻璃 互斥</span></div><em>×</em></div>
    <div className="t info" data-loop><i>i</i><div><b>索引已更新</b><span>+2 组件 · 巡检通过</span></div><em>×</em></div>
  </div>
)

const ScChart = () => (
  <div className="sc sc-chart">
    <div className="head"><span>周活跃用户</span><em className="up">▲ 12.4%</em></div>
    <b>48,201</b>
    <Spark d="M0,24 C8,22 12,26 20,20 C28,14 32,18 40,16 C48,14 52,8 60,10 C68,12 74,6 82,8 C90,10 94,4 100,2" color="#0d9488" fill />
    <div className="xaxis"><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span></div>
  </div>
)

const ScFaq = () => (
  <div className="sc sc-faq">
    <div className="q open" data-loop><b>Spec 是什么？<i className="ch">⌄</i></b><p>一份 Agent 可执行的 JSON 规格：词条引用、参数、验收清单。</p></div>
    <div className="q"><b>免费吗？<i className="ch">⌄</i></b></div>
    <div className="q"><b>支持哪些框架？<i className="ch">⌄</i></b></div>
    <div className="q"><b>数据可以引用吗？<i className="ch">⌄</i></b></div>
  </div>
)

const ScFooter = () => (
  <div className="sc sc-footer">
    <div className="cols">
      <div className="brand"><b>◆ 视元</b><span>词表是护城河，<br />演示即实现。</span></div>
      <div className="col"><b>产品</b><i>词典</i><i>索引</i><i>工具</i></div>
      <div className="col"><b>资源</b><i>llms.txt</i><i>MCP</i><i>JSON API</i></div>
      <div className="col"><b>公司</b><i>关于</i><i>提交</i><i>状态</i></div>
    </div>
    <div className="legal"><span>© 2026 VisLexicon</span><span className="ok">● 全部系统正常</span></div>
  </div>
)

const ScOnboarding = () => (
  <div className="sc sc-onboarding">
    <div className="steps">
      <span className="st done"><i>✓</i>创建项目</span><i className="conn" />
      <span className="st on"><b>2</b>连接仓库</span><i className="conn half" />
      <span className="st"><b>3</b>生成 Spec</span>
    </div>
    <div className="panel"><b>连接你的仓库</b><span>支持 GitHub / GitLab，只读权限即可。</span><i className="btn">选择仓库…</i></div>
  </div>
)

/* ============ 注册表 ============ */

export const DEMOS = {
  /* layout */
  'bento-grid': ScBento,
  'holy-grail': ScHolyGrail,
  masonry: ScMasonry,
  'split-screen': ScSplit,
  'sidebar-shell': ScSidebar,
  'sticky-scroll': ScSticky,
  kanban: ScKanban,
  timeline: ScTimeline,
  'card-stack': ScCardStack,
  dock: ScDock,
  /* interaction */
  'hover-tilt': ScTilt,
  'magnetic-button': ScMagnetic,
  'spotlight-card': ScSpotlight,
  'cursor-follower': ScCursor,
  'hover-lift': ScHoverLift,
  'link-underline': ScUnderline,
  'text-scramble': ScScramble,
  'number-ticker': ScTicker,
  marquee: ScMarquee,
  'drag-reorder': ScDrag,
  'scroll-reveal': ScReveal,
  'image-compare': ScCompare,
  /* aesthetic */
  glassmorphism: ScGlass,
  neumorphism: ScNeumorph,
  claymorphism: ScClay,
  'neo-brutalism': ScBrut,
  'minimal-flat': ScFlat,
  'swiss-intl': ScSwiss,
  editorial: ScEditorial,
  terminal: ScTerminal,
  'aurora-gradient': ScAurora,
  skeuomorphism: ScSkeuo,
  'y2k-chrome': ScY2K,
  'pixel-retro': ScPixel,
  /* motion */
  spring: ScSpring,
  'stagger-reveal': ScStagger,
  flip: ScFlip,
  shimmer: ScShimmer,
  parallax: ScParallax,
  'scroll-scrub': ScScrub,
  'view-transition': ScViewTransition,
  typewriter: ScTypewriter,
  'blur-in': ScBlurIn,
  'slide-swap': ScSlideSwap,
  'path-morph': ScPathMorph,
  'container-transform': ScContainerTransform,
  /* component */
  hero: ScHero,
  navbar: ScNavbar,
  'feature-grid': ScFeatureGrid,
  'pricing-table': ScPricing,
  testimonial: ScTestimonial,
  'cta-banner': ScCta,
  form: ScForm,
  modal: ScModal,
  toast: ScToast,
  'chart-card': ScChart,
  faq: ScFaq,
  footer: ScFooter,
  onboarding: ScOnboarding,
}
