import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Live, ScaledStage, loadPreview } from './Live.jsx'
import { LaneBadge } from './Detail.jsx'
import { defaults, nameOf } from '../lib/model.js'

const GAP = 16
const MIN_CARD = 300
const FOOTER = 58
const finePointer = typeof matchMedia === 'function' && matchMedia('(hover: hover) and (pointer: fine)').matches

// Only one card plays its live preview at a time; the rest show static posters.
let setLiveCard = () => {}

const Card = memo(function Card({ entry, base, lang, live, onOpen, judged }) {
  const [posterFailed, setPosterFailed] = useState(false)
  const timer = useRef(0)
  const isLive = !base.remote && base.lane !== 'screenshot' && live
  const enter = () => {
    if (!finePointer || base.remote || base.lane === 'screenshot') return
    loadPreview(base.id) // start fetching the chunk while the pointer settles
    timer.current = setTimeout(() => setLiveCard(entry.id), 160)
  }
  const leave = () => { clearTimeout(timer.current); setLiveCard(id => (id === entry.id ? null : id)) }
  return (
    <div role="button" tabIndex={0} aria-label={nameOf(base, lang)} onClick={() => onOpen(base.id)} onPointerEnter={enter} onPointerLeave={leave}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(base.id) } }}
      className="group flex cursor-pointer h-full w-full flex-col overflow-hidden rounded-[22px] bg-[var(--bench-panel)] text-left ring-1 ring-white/8 transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:ring-white/20 focus-visible:ring-2 focus-visible:ring-violet-400">
      <div className="relative min-h-0 flex-1 overflow-hidden bg-[#101012]">
        {base.poster && !posterFailed && (
          <img src={base.poster} alt="" loading="lazy" decoding="async" onError={() => setPosterFailed(true)} draggable={false}
            className={`absolute inset-0 size-full ${base.lane === 'screenshot' ? 'object-contain p-3' : 'object-cover'} transition-opacity duration-300 ${isLive ? 'opacity-0' : ''}`} />
        )}
        {(!base.poster || posterFailed) && !isLive && (
          <div className="absolute inset-0 flex flex-col gap-3 overflow-hidden p-5 text-zinc-400">
            <div className="flex items-center justify-between text-[11px]"><span>{base.source.site}</span><span>{base.framework ?? base.source.license ?? ''}</span></div>
            {(base.codeExcerpt || base.sourceExcerpt) ? <pre className="bench-code min-h-0 flex-1 overflow-hidden whitespace-pre-wrap text-[11px] leading-5 text-zinc-300">{base.codeExcerpt ?? base.sourceExcerpt}</pre> : <div className="flex min-h-0 flex-1 flex-col justify-center gap-2"><span className="break-all font-mono text-sm text-zinc-200">{base.name ?? base.en}</span><span className="text-xs">{base.remote ? base.sourceAvailable ? (lang === 'en' ? 'Open the complete source files' : '打开查看完整源码文件') : (lang === 'en' ? 'Original listing · open source link' : '原站条目 · 查看来源链接') : (lang === 'en' ? 'Open the interactive example' : '打开交互示例')}</span></div>}
            <span className="text-[11px] text-zinc-500">{base.previewUrl ? (lang === 'en' ? 'Interactive preview verified' : '实时预览已验证') : base.lane === 'screenshot' ? (lang === 'en' ? 'Original-site screenshot' : '原站截图') : base.sourceAvailable ? (lang === 'en' ? 'Source resource · preview not verified' : '源码资源 · 预览未验证') : (lang === 'en' ? 'Source not archived' : '未归档源码')}</span>
          </div>
        )}
        {isLive && (
          <ScaledStage className="absolute inset-0">
            <Live id={base.id} values={defaults(base)} />
          </ScaledStage>
        )}
        {judged && <span className="absolute left-3 top-3 rounded-full bg-violet-500/90 px-2 py-0.5 text-[11px] font-medium text-white shadow">Jev ✓</span>}
      </div>
      <div className="flex items-center justify-between gap-2 px-4" style={{ height: FOOTER }}>
        <span className="truncate text-[15px] font-medium text-zinc-100">{nameOf(base, lang)}</span>
        <LaneBadge entry={base} lang={lang} />
      </div>
    </div>
  )
})

/**
 * A virtualized grid: rows are a fixed height, and only rows near the viewport
 * mount. Scrolling a 20,000-card catalogue renders about thirty cards.
 */
export function Gallery({ items, lang, onOpen, resolve, judged }) {
  const ref = useRef(null)
  const [width, setWidth] = useState(1200)
  const [range, setRange] = useState([0, 4])
  const [liveCard, setLive] = useState(null)
  useEffect(() => { setLiveCard = setLive; return () => { setLiveCard = () => {} } }, [])

  const cols = Math.max(1, Math.floor((width + GAP) / (MIN_CARD + GAP)))
  const cardW = (width - (cols - 1) * GAP) / cols
  const cardH = Math.round(cardW * 0.625) + FOOTER
  const rowH = cardH + GAP
  const rows = Math.ceil(items.length / cols)

  useLayoutEffect(() => {
    const el = ref.current
    const observer = new ResizeObserver(() => setWidth(el.clientWidth))
    observer.observe(el)
    setWidth(el.clientWidth)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const top = ref.current.getBoundingClientRect().top
      const first = Math.max(0, Math.floor(-top / rowH) - 2)
      const last = Math.min(rows, Math.ceil((innerHeight - top) / rowH) + 2)
      setRange(r => (r[0] === first && r[1] === last ? r : [first, last]))
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    addEventListener('scroll', schedule, { passive: true })
    addEventListener('resize', schedule)
    return () => { removeEventListener('scroll', schedule); removeEventListener('resize', schedule); cancelAnimationFrame(frame) }
  }, [rowH, rows])

  const cards = []
  for (let row = range[0]; row < range[1]; row++) {
    for (let col = 0; col < cols; col++) {
      const index = row * cols + col
      const entry = items[index]
      if (!entry) break
      const base = resolve(entry)
      cards.push(
        <div key={entry.id} className="absolute" style={{ width: cardW, height: cardH, transform: `translate(${col * (cardW + GAP)}px, ${row * rowH}px)` }}>
          <Card entry={entry} base={base} lang={lang} live={liveCard === entry.id} onOpen={onOpen} judged={judged?.has(base.id)} />
        </div>,
      )
    }
  }
  return <div ref={ref} className="relative" style={{ height: rows * rowH - GAP }}>{cards}</div>
}
