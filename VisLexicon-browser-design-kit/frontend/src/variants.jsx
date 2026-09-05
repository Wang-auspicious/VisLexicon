/* ================================================================
   变体矩阵 · Variant Matrix
   ----------------------------------------------------------------
   回答方案里那个核心问题：「同一个设计也能分成十几种不同的实现方式」。
   做法不是逐条枚举词条，而是把效果拆成「基因通道」（rebuttal §2.1 Effect Genome），
   再让同一份标本内容在一条通道上被并排实现 N 次 —— 单变量对照，差在哪一眼看见。

   六个族（family）：
     surface  材质通道   同一张卡片 × 12 种材质
     frame    骨架通道   同一批内容 × 10 种布局
     ease     时间通道   同一段位移 × 12 条缓动
     reveal   入场通道   同一个词   × 10 种揭示
     hover    指针通道   同一个按钮 × 10 种反馈
     morph    形变通道   容器变形的 from × to 二维矩阵（+ 三条修饰通道）

   每个格子都是活的实现，不是截图；标本内容恒定，只有那一位基因在变。
   ================================================================ */
import { useEffect, useRef, useState } from 'react'

/* ---------------- 恒定标本内容：所有族共用，保证只有一个变量在动 ---------------- */
function Unit({ tone = 'auto' }) {
  return (
    <div className={`vs-unit tone-${tone}`}>
      <span className="vs-u-top">
        <i className="vs-u-dot" />
        <em>SPECIMEN</em>
      </span>
      <b className="vs-u-title">视元</b>
      <span className="vs-u-line l1" />
      <span className="vs-u-line l2" />
      <span className="vs-u-cta">开始 →</span>
    </div>
  )
}

/* ================================================================
   1 · surface —— 材质通道
   ================================================================ */
const SURFACE = [
  { k: 'glass', term: 'Glassmorphism', zh: '毛玻璃', lex: 'glassmorphism', note: 'backdrop-blur 16 · 白 8%' },
  { k: 'neumorph', term: 'Neumorphism', zh: '新拟态', lex: 'neumorphism', note: '同色双向阴影，无边框' },
  { k: 'clay', term: 'Claymorphism', zh: '黏土', lex: 'claymorphism', note: '大圆角 + 内高光 + 彩色投影' },
  { k: 'brutal', term: 'Neo-Brutalism', zh: '新粗野', lex: 'neo-brutalism', note: '2px 硬边 + 实心位移影' },
  { k: 'flat', term: 'Minimal Flat', zh: '极简平面', lex: 'minimal-flat', note: '一条发丝线，零装饰' },
  { k: 'swiss', term: 'Swiss', zh: '瑞士国际', lex: 'swiss-intl', note: '网格线 + 无衬线左对齐' },
  { k: 'editorial', term: 'Editorial', zh: '杂志编辑', lex: 'editorial', note: '衬线大标题 + 细分割线' },
  { k: 'terminal', term: 'Terminal', zh: '终端机能', lex: 'terminal', note: '等宽 + 磷光绿 + 扫描线' },
  { k: 'aurora', term: 'Aurora', zh: '极光渐变', lex: 'aurora-gradient', note: '多色 mesh 缓慢流动' },
  { k: 'skeuo', term: 'Skeuomorphism', zh: '拟物', lex: 'skeuomorphism', note: '纵向渐变 + 高光 + 描边' },
  { k: 'y2k', term: 'Y2K Chrome', zh: '千禧铬', lex: 'y2k-chrome', note: '金属渐变 + 强高光' },
  { k: 'pixel', term: 'Pixel Retro', zh: '像素复古', lex: 'pixel-retro', note: '硬像素边 + 无抗锯齿' },
]

/* ================================================================
   2 · frame —— 骨架通道（同一批内容块，10 种排法）
   ================================================================ */
const FRAME = [
  { k: 'bento', term: 'Bento Grid', zh: '便当格', lex: 'bento-grid', note: '不等分，主块跨 2×2' },
  { k: 'masonry', term: 'Masonry', zh: '瀑布流', lex: 'masonry', note: '等宽不定高，按列堆' },
  { k: 'split', term: 'Split Screen', zh: '分屏', lex: 'split-screen', note: '50/50 中轴分界' },
  { k: 'grail', term: 'Holy Grail', zh: '圣杯', lex: 'holy-grail', note: '头/三栏/脚' },
  { k: 'sidebar', term: 'Sidebar Shell', zh: '侧栏壳', lex: 'sidebar-shell', note: '定宽侧栏 + 弹性主区' },
  { k: 'stack', term: 'Card Stack', zh: '卡片堆', lex: 'card-stack', note: 'z 轴叠放，顶层可操作' },
  { k: 'timeline', term: 'Timeline', zh: '时间轴', lex: 'timeline', note: '单轴串联事件' },
  { k: 'kanban', term: 'Kanban', zh: '看板', lex: 'kanban', note: '按状态分列' },
  { k: 'sticky', term: 'Sticky Sections', zh: '粘性章节', lex: 'sticky-scroll', note: '左钉右滚' },
  { k: 'dock', term: 'Floating Dock', zh: '浮动坞', lex: 'dock', note: '底部浮层，近大远小' },
]

/* ================================================================
   3 · ease —— 时间通道（同一段 0→100% 位移，12 条曲线）
   ================================================================ */
const EASE = [
  { k: 'linear', term: 'linear', zh: '匀速', note: 'cubic-bezier(0,0,1,1)', css: 'linear', dur: 1200 },
  { k: 'ease-out', term: 'ease-out', zh: '减速', note: '(0,0,.2,1) — UI 默认解', css: 'cubic-bezier(0,0,.2,1)', dur: 1200 },
  { k: 'ease-in-out', term: 'ease-in-out', zh: '两端缓', note: '(.4,0,.2,1)', css: 'cubic-bezier(.4,0,.2,1)', dur: 1200 },
  { k: 'expo-out', term: 'expo-out', zh: '指数出', note: '(.16,1,.3,1) — 起手极快', css: 'cubic-bezier(.16,1,.3,1)', dur: 1200 },
  { k: 'back-out', term: 'back-out', zh: '回退出', note: '(.34,1.56,.64,1) 小过冲', css: 'cubic-bezier(.34,1.56,.64,1)', dur: 1200 },
  { k: 'anticipate', term: 'anticipate', zh: '预备', note: '(.68,-.6,.32,1) 先反向蓄力', css: 'cubic-bezier(.68,-.6,.32,1)', dur: 1200 },
  { k: 'spring-soft', term: 'spring soft', zh: '软弹', lex: 'spring', note: 'k 120 · c 26 · 无明显过冲', css: 'cubic-bezier(.25,1.1,.4,1)', dur: 1200 },
  { k: 'spring-snap', term: 'spring snappy', zh: '脆弹', lex: 'spring', note: 'k 320 · c 24 · 一次回弹', css: 'cubic-bezier(.2,1.35,.35,1)', dur: 900 },
  { k: 'spring-bouncy', term: 'spring bouncy', zh: '强弹', lex: 'spring', note: 'k 380 · c 12 · 多次衰减', css: 'cubic-bezier(.18,1.8,.3,1)', dur: 1400 },
  { k: 'elastic', term: 'elastic', zh: '橡皮筋', note: '尾部长振荡，慎用于常规 UI', css: 'cubic-bezier(.12,2.2,.25,1)', dur: 1600 },
  { k: 'step', term: 'steps(6)', zh: '阶跃', note: '离散帧，机械/像素风专用', css: 'steps(6,end)', dur: 1200 },
  { k: 'slow-mo', term: 'ease-out 600ms', zh: '长减速', note: '同曲线拉长时长 = 完全不同性格', css: 'cubic-bezier(0,0,.2,1)', dur: 2400 },
]

/* ================================================================
   4 · reveal —— 入场通道（同一个词，10 种揭示）
   ================================================================ */
const REVEAL = [
  { k: 'fade', term: 'Fade', zh: '淡入', note: 'opacity 0→1，最保守' },
  { k: 'blur', term: 'Blur In', zh: '虚焦入', lex: 'blur-in', note: 'blur(10px)→0 同步淡入' },
  { k: 'rise', term: 'Slide Up', zh: '上浮', note: 'translateY 16px→0' },
  { k: 'side', term: 'Slide In', zh: '侧滑', lex: 'slide-swap', note: 'translateX −24px→0' },
  { k: 'scale', term: 'Scale In', zh: '缩放入', note: 'scale .92→1，origin center' },
  { k: 'clip', term: 'Clip Wipe', zh: '裁切揭示', note: 'clip-path inset 由下而上' },
  { k: 'mask', term: 'Mask Rise', zh: '遮罩升起', note: '整行在遮罩内上移，出版级' },
  { k: 'stagger', term: 'Stagger', zh: '逐字错峰', lex: 'stagger-reveal', note: '每字 +40ms' },
  { k: 'type', term: 'Typewriter', zh: '打字机', lex: 'typewriter', note: '逐字符 + 光标' },
  { k: 'scramble', term: 'Scramble', zh: '乱码解码', lex: 'text-scramble', note: '随机字符收敛到目标' },
]

/* ================================================================
   5 · hover —— 指针通道（同一个按钮，10 种反馈）
   ================================================================ */
const HOVER = [
  { k: 'lift', term: 'Lift', zh: '抬升', lex: 'hover-lift', note: 'translateY −4 + 影变深' },
  { k: 'tilt', term: 'Tilt', zh: '倾斜', lex: 'hover-tilt', note: 'rotateX/Y ≤12°，跟随指针' },
  { k: 'magnetic', term: 'Magnetic', zh: '磁吸', lex: 'magnetic-button', note: '向指针位移，松开 spring 回位' },
  { k: 'spotlight', term: 'Spotlight', zh: '聚光', lex: 'spotlight-card', note: '径向高光跟指针' },
  { k: 'sweep', term: 'Fill Sweep', zh: '填充扫过', note: '背景从一侧扫满' },
  { k: 'underline', term: 'Underline', zh: '下划线生长', lex: 'link-underline', note: 'scaleX 0→1，origin 左' },
  { k: 'shimmer', term: 'Shimmer', zh: '流光', lex: 'shimmer', note: '斜向高光带扫过一次' },
  { k: 'glow', term: 'Glow Ring', zh: '光环', note: 'box-shadow 扩散彩环' },
  { k: 'press', term: 'Press', zh: '下压', note: 'scale .97 + 影收紧，触感反馈' },
  { k: 'arrow', term: 'Icon Shift', zh: '图标位移', note: '箭头右移 4px，暗示去向' },
]

/* ================================================================
   6 · morph —— 形变通道（容器变形，二维 from × to）
   ================================================================ */
const SHAPES = [
  { k: 'circle', zh: '圆', note: 'FAB / 头像' },
  { k: 'pill', zh: '胶囊', note: '搜索条 / 标签' },
  { k: 'card', zh: '卡片', note: '列表项 / 磁贴' },
  { k: 'sheet', zh: '底片', note: '半屏面板' },
]
const MORPH_CHANNELS = [
  {
    k: 'corner', label: '圆角通道',
    opts: [
      { k: 'linear', label: '线性插值', note: '两端半径直接补间，最常见' },
      { k: 'continuous', label: '连续曲率', note: 'iOS 超椭圆，转折无断点' },
      { k: 'step', label: '先方后圆', note: '半径分段跳变，机械感' },
    ],
  },
  {
    k: 'content', label: '内容通道',
    opts: [
      { k: 'crossfade', label: '交叉淡化', note: '新旧同时在场' },
      { k: 'through', label: '先出后入', note: 'fade-through，Material 正解' },
      { k: 'reflow', label: '重排', note: '内容跟着容器重新流动' },
      { k: 'clip', label: '裁切显露', note: '内容不动，容器开口变大' },
    ],
  },
  {
    k: 'origin', label: '原点通道',
    opts: [
      { k: 'center', label: '原地', note: 'transform-origin center' },
      { k: 'tap', label: '触点生长', note: '从手指落点长出' },
      { k: 'edge', label: '贴边', note: '沿一侧展开' },
    ],
  },
]

export const FAMILIES = {
  surface: { id: 'surface', title: '材质通道', en: 'SURFACE', axis: 'aesthetic', cells: SURFACE, unit: '同一张卡片', cols: 4, blurb: '内容、字号、间距全部锁死，只换一层材质——「高级感」到底差在哪，横过来一看就明白。' },
  frame: { id: 'frame', title: '骨架通道', en: 'FRAME', axis: 'layout', cells: FRAME, unit: '同一批内容块', cols: 5, blurb: '同样六块内容，十种排法。骨架决定信息优先级，先选骨架再谈气质。' },
  ease: { id: 'ease', title: '时间通道', en: 'EASING', axis: 'motion', cells: EASE, unit: '同一段位移', cols: 4, blurb: '位移距离完全相同，只有曲线在换。所有格子同步起跑——性格差异是可以被并排看见的。' },
  reveal: { id: 'reveal', title: '入场通道', en: 'REVEAL', axis: 'motion', cells: REVEAL, unit: '同一行文字', cols: 5, blurb: '同一句话进场十次。选哪一种，决定了页面的第一印象是稳重还是聒噪。' },
  hover: { id: 'hover', title: '指针通道', en: 'POINTER', axis: 'interaction', cells: HOVER, unit: '同一个按钮', cols: 5, blurb: '默认全部自动演示；把指针放上去可单独触发。微反馈是「高级感」藏得最深的一半。' },
  morph: { id: 'morph', title: '形变通道', en: 'MORPH', axis: 'motion', cells: [], unit: '同一个容器', cols: 4, blurb: '容器变形是组合爆炸的典型：from × to 已是 16 种，再乘圆角/内容/原点三条修饰通道 = 576 种可命名实现。词条不该枚举它们，该给出坐标系。', matrix2d: true },
}

/* ================================================================
   标本渲染器
   ================================================================ */

function SurfaceCell({ k }) {
  return (
    <div className={`vs vs-surface s-${k}`}>
      {k === 'aurora' && <span className="vs-aurora-bg" data-loop />}
      {k === 'terminal' && <span className="vs-scanline" data-loop />}
      <Unit />
    </div>
  )
}

const BLOCKS = ['A', 'B', 'C', 'D', 'E', 'F']
function FrameCell({ k }) {
  return (
    <div className={`vs vs-frame f-${k}`}>
      {BLOCKS.map((b, i) => <i key={b} className={`vf b${i + 1}`}><em>{b}</em></i>)}
    </div>
  )
}

function EaseCell({ cell, beat }) {
  return (
    <div className="vs vs-ease">
      <span className="ve-track">
        <i className="ve-ghost" />
        <i
          key={beat}
          className="ve-ball"
          style={{ animationTimingFunction: cell.css, animationDuration: `${cell.dur}ms` }}
          data-loop
        />
      </span>
      <span className="ve-scale"><i /><i /><i /><i /><i /></span>
    </div>
  )
}

const REVEAL_WORD = '视觉词典'
function RevealCell({ k, beat }) {
  const chars = [...REVEAL_WORD]
  return (
    <div className={`vs vs-reveal r-${k}`} key={beat}>
      <span className="vr-mask">
        {k === 'stagger' || k === 'type' || k === 'scramble' ? (
          chars.map((c, i) => (
            <i key={i} className="vr-ch" style={{ animationDelay: `${i * (k === 'type' ? 0.16 : 0.09)}s` }} data-loop>
              {k === 'scramble' ? <s data-c={c}>{c}</s> : c}
            </i>
          ))
        ) : (
          <i className="vr-word" data-loop>{REVEAL_WORD}</i>
        )}
        {k === 'type' && <i className="vr-caret" data-loop />}
      </span>
      <span className="vr-sub">{k}</span>
    </div>
  )
}

function HoverCell({ k, forced }) {
  return (
    <div className={`vs vs-hover h-${k} ${forced ? 'forced' : ''}`}>
      <span className="vh-btn">
        <b>Get started</b>
        <em className="vh-arrow">→</em>
        <i className="vh-fx" />
      </span>
    </div>
  )
}

function MorphCell({ from, to, mods, beat }) {
  return (
    <div
      className="vs vs-morph"
      key={beat}
      data-from={from}
      data-to={to}
      data-corner={mods.corner}
      data-content={mods.content}
      data-origin={mods.origin}
    >
      <span className="vm-box" data-loop>
        <i className="vm-old" data-loop />
        <i className="vm-new" data-loop>
          <s /><s /><s />
        </i>
      </span>
    </div>
  )
}

/* ================================================================
   矩阵组件
   ================================================================ */
export function VariantMatrix({ famId, self, onPick }) {
  const fam = FAMILIES[famId]
  const wrapRef = useRef(null)
  const [live, setLive] = useState(false)
  const [beat, setBeat] = useState(0)
  const [forced, setForced] = useState(true)
  const [mods, setMods] = useState({ corner: 'continuous', content: 'through', origin: 'center' })
  const [from, setFrom] = useState('circle')

  /* 视口外不跑动画：几十个活标本同屏的性能保险（完整方案 §11.2） */
  useEffect(() => {
    const el = wrapRef.current
    if (!el || typeof IntersectionObserver === 'undefined') { setLive(true); return undefined }
    const io = new IntersectionObserver((es) => setLive(es[0].isIntersecting), { rootMargin: '200px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  if (!fam) return null

  const replay = () => setBeat((b) => b + 1)

  /* ---- 二维矩阵：morph ---- */
  if (fam.matrix2d) {
    return (
      <div className={`vmx ${live ? 'live' : ''}`} ref={wrapRef}>
        <MatrixHead fam={fam} count={SHAPES.length * SHAPES.length} onReplay={replay} />

        <div className="vmx-channels">
          {MORPH_CHANNELS.map((ch) => (
            <div className="vmx-ch" key={ch.k}>
              <span className="vmx-ch-l">{ch.label}</span>
              <div className="vmx-ch-opts">
                {ch.opts.map((o) => (
                  <button
                    type="button"
                    key={o.k}
                    title={o.note}
                    className={`vmx-opt ${mods[ch.k] === o.k ? 'on' : ''}`}
                    onClick={() => { setMods({ ...mods, [ch.k]: o.k }); replay() }}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="vmx-2d">
          <div className="vmx-2d-corner x-mono">from ↓ / to →</div>
          {SHAPES.map((t) => (
            <div className="vmx-2d-colh" key={t.k}>
              <b>{t.zh}</b><em>{t.k}</em>
            </div>
          ))}
          {SHAPES.map((f) => (
            <ThroughRow key={f.k}>
              <div className={`vmx-2d-rowh ${from === f.k ? 'on' : ''}`} onClick={() => setFrom(f.k)}>
                <b>{f.zh}</b><em>{f.note}</em>
              </div>
              {SHAPES.map((t) => (
                <button
                  type="button"
                  key={t.k}
                  className={`vmx-cell cell2d ${f.k === t.k ? 'idle' : ''}`}
                  onClick={() => { setFrom(f.k); onPick?.(`CT[${f.k}→${t.k}] · corner:${mods.corner} · content:${mods.content} · origin:${mods.origin}`) }}
                >
                  {live && <MorphCell from={f.k} to={t.k} mods={mods} beat={beat} />}
                  <span className="vmx-cap">
                    <b className="x-mono">{f.k}→{t.k}</b>
                  </span>
                </button>
              ))}
            </ThroughRow>
          ))}
        </div>

        <p className="vmx-foot">
          当前坐标 <code className="x-mono">CT[{from}→…] · corner:{mods.corner} · content:{mods.content} · origin:{mods.origin}</code>
          ——记谱法把这一格压成一行，Agent 可解引用；换任意一个修饰通道，十六格全体重演。
        </p>
      </div>
    )
  }

  /* ---- 一维矩阵：surface / frame / ease / reveal / hover ---- */
  return (
    <div className={`vmx ${live ? 'live' : ''}`} ref={wrapRef}>
      <MatrixHead
        fam={fam}
        count={fam.cells.length}
        onReplay={replay}
        extra={famId === 'hover' && (
          <button type="button" className={`vmx-opt ${forced ? 'on' : ''}`} onClick={() => setForced(!forced)}>
            {forced ? '自动演示中' : '仅 hover 触发'}
          </button>
        )}
      />
      <div className="vmx-grid" style={{ '--vmx-cols': fam.cols }}>
        {fam.cells.map((c) => {
          const isSelf = c.k === self || (c.lex && c.lex === self)
          return (
            <div key={c.k} className={`vmx-cell ${isSelf ? 'self' : ''}`}>
              <div className="vmx-stage">
                {live && (
                  famId === 'surface' ? <SurfaceCell k={c.k} />
                    : famId === 'frame' ? <FrameCell k={c.k} />
                      : famId === 'ease' ? <EaseCell cell={c} beat={beat} />
                        : famId === 'reveal' ? <RevealCell k={c.k} beat={beat} />
                          : <HoverCell k={c.k} forced={forced} />
                )}
                {isSelf && <span className="vmx-self-flag x-mono">本词条</span>}
              </div>
              <div className="vmx-cap">
                <b>{c.term}</b>
                <span>{c.zh}</span>
                <em>{c.note}</em>
                <button
                  type="button"
                  className="vmx-pick x-mono"
                  onClick={() => onPick?.(`${fam.en}[${c.k}]${c.lex ? ` · lex:${c.lex}` : ''}`)}
                >
                  选取此坐标
                </button>
                {c.lex && (
                  <a className="vmx-jump x-mono" href={`#/entry/${c.lex}`}>lex:{c.lex} ↗</a>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ThroughRow({ children }) {
  return <>{children}</>
}

function MatrixHead({ fam, count, onReplay, extra }) {
  return (
    <header className="vmx-head">
      <div className="vmx-head-t">
        <span className="vmx-badge x-mono">{fam.en}</span>
        <b>{fam.title}</b>
        <em>{fam.unit} × {count} 种实现</em>
      </div>
      <p className="vmx-blurb">{fam.blurb}</p>
      <div className="vmx-head-a">
        {extra}
        <button type="button" className="vmx-opt" onClick={onReplay}>↻ 同步重演</button>
      </div>
    </header>
  )
}

/* 供词典页的「族入口」卡片用 */
export const FAMILY_LIST = Object.values(FAMILIES)

/* ================================================================
   词条 → 变体族的映射
   规则集中在这里，词条数据本身不必知道呈现层的存在。
   ================================================================ */
const EXPLICIT = {
  'container-transform': ['morph', null],
  'view-transition': ['morph', null],
  'path-morph': ['morph', null],

  'hover-tilt': ['hover', 'tilt'],
  'magnetic-button': ['hover', 'magnetic'],
  'spotlight-card': ['hover', 'spotlight'],
  'hover-lift': ['hover', 'lift'],
  'link-underline': ['hover', 'underline'],
  shimmer: ['hover', 'shimmer'],

  'text-scramble': ['reveal', 'scramble'],
  typewriter: ['reveal', 'type'],
  'blur-in': ['reveal', 'blur'],
  'slide-swap': ['reveal', 'side'],
  'stagger-reveal': ['reveal', 'stagger'],
  'scroll-reveal': ['reveal', 'rise'],

  spring: ['ease', 'spring-snap'],
  'image-compare': ['frame', 'split'],
}
const BY_AXIS = { layout: 'frame', aesthetic: 'surface', component: 'surface', interaction: 'hover', motion: 'ease' }

export function matrixFor(entry) {
  if (!entry) return null
  const hit = EXPLICIT[entry.id]
  if (hit) return { fam: hit[0], self: hit[1] }
  const famId = BY_AXIS[entry.axis]
  if (!famId) return null
  const fam = FAMILIES[famId]
  const self = fam.cells.find((c) => c.lex === entry.id)?.k || null
  return { fam: famId, self }
}

/* 词条能被并排比较到的实现数量——词典卡片上直接显示，让「繁」是可量化的 */
export function variantCount(entry) {
  const m = matrixFor(entry)
  if (!m) return 0
  const fam = FAMILIES[m.fam]
  return fam.matrix2d ? SHAPES.length * SHAPES.length : fam.cells.length
}
