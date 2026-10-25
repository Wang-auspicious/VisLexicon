import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { Controls } from './Controls.jsx'
import { Live, useUsage } from './Live.jsx'
import { CodeView } from './CodeView.jsx'
import { LANES, categoryById, copyPrompt, defaults, nameOf, summaryOf } from '../lib/model.js'
import { Icon } from './Icon.jsx'
import { SourceDetail } from './SourceDetail.jsx'

export function useCopy() {
  const [copied, setCopied] = useState(null)
  const copy = useCallback(async (key, text) => {
    try { await navigator.clipboard.writeText(text) } catch { setCopied('clipboard-error'); return }
    setCopied(key); setTimeout(() => setCopied(c => (c === key ? null : c)), 1400)
  }, [])
  return [copied, copy]
}

export function LaneBadge({ entry, lang }) {
  const tone = entry.lane === 'screenshot' ? 'bg-amber-400/12 text-amber-200 ring-amber-300/20' : entry.lane === 'github' ? 'bg-sky-400/12 text-sky-200 ring-sky-300/20' : 'bg-violet-400/12 text-violet-200 ring-violet-300/20'
  const reference = entry.remote && !entry.sourceAvailable && entry.lane !== 'screenshot'
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ring-1 ${tone}`}>{reference ? (lang === 'en' ? 'Original listing' : '原站条目') : LANES[entry.lane].short[lang]}</span>
}
export function LicenseBadge({ entry, lang }) {
  const text = entry.source.license ?? (lang === 'en' ? 'License unverified' : '许可未核验')
  return <span className="rounded-full bg-white/6 px-2 py-0.5 text-[11px] text-zinc-300 ring-1 ring-white/10">{text}</span>
}

function IconButton({ label, onClick, active, children }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} aria-pressed={active}
      className={`grid size-9 place-items-center rounded-full transition-colors ${active ? 'bg-zinc-950 text-white ring-1 ring-white/10' : 'text-zinc-400 hover:bg-white/8 hover:text-white'}`}>
      {children}
    </button>
  )
}

function LiveDetail({ entry, lang, onClose }) {
  const [values, setValues] = useState(() => defaults(entry))
  const [mode, setMode] = useState('preview')
  const [fill, setFill] = useState('dark')
  const [replay, setReplay] = useState(0)
  const [copied, copy] = useCopy()
  // Sliders stay smooth: the preview renders the deferred values.
  const shown = useDeferredValue(values)
  const usage = useUsage(entry.id, values)
  const change = useCallback((key, value) => setValues(v => ({ ...v, [key]: value })), [])
  const remount = (entry.remountOn ?? []).map(k => shown[k]).join('|')
  const changed = entry.controls.some(c => values[c.key] !== c.default)

  return (
    <>
      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[28px] bg-[var(--bench-panel)] ring-1 ring-white/8">
        <header className="flex items-center justify-between gap-2 p-3">
          <div className="flex rounded-full bg-black/40 p-1">
            <IconButton label={lang === 'en' ? 'Preview' : '预览'} active={mode === 'preview'} onClick={() => setMode('preview')}><Icon name="cube" /></IconButton>
            <IconButton label={lang === 'en' ? 'Code' : '代码'} active={mode === 'code'} onClick={() => setMode('code')}><Icon name="code" /></IconButton>
          </div>
          <div className="flex items-center gap-1">
            {mode === 'code'
              ? <button type="button" onClick={() => copy('prompt', copyPrompt(entry, values, usage, lang))} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200">{copied === 'prompt' ? (lang === 'en' ? 'Copied' : '已复制') : (lang === 'en' ? 'Copy prompt' : '复制提示词')}</button>
              : <>
                <IconButton label={lang === 'en' ? 'Light stage' : '浅色舞台'} active={fill === 'light'} onClick={() => setFill(f => (f === 'light' ? 'dark' : 'light'))}><Icon name="sun" /></IconButton>
                <IconButton label={lang === 'en' ? 'Replay' : '重播'} onClick={() => setReplay(r => r + 1)}><Icon name="replay" /></IconButton>
              </>}
          </div>
        </header>
        {mode === 'preview'
          ? <div className="bench-stage relative m-2 mt-0 grid min-h-0 flex-1 place-items-center overflow-hidden rounded-[22px]" data-fill={fill}>
              <Live key={`${replay}|${remount}`} id={entry.id} values={shown} resetKey={JSON.stringify(shown)} />
            </div>
          : <CodeView entry={entry} values={values} usage={usage} lang={lang} copy={copy} copied={copied} />}
      </section>
      <aside className="flex w-full shrink-0 flex-col overflow-hidden rounded-[28px] bg-[var(--bench-panel)] ring-1 ring-white/8 md:w-[380px]">
        <div className="flex items-start justify-between gap-3 px-6 pt-6">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-white">{nameOf(entry, lang)}</h2>
            <div className="mt-2 flex flex-wrap gap-1.5"><LaneBadge entry={entry} lang={lang} /><LicenseBadge entry={entry} lang={lang} /><span className="rounded-full bg-white/6 px-2 py-0.5 text-[11px] text-zinc-400">{categoryById[entry.category][lang]}</span></div>
          </div>
          <IconButton label={lang === 'en' ? 'Close' : '关闭'} onClick={onClose}><Icon name="close" /></IconButton>
        </div>
        <p className="px-6 pt-4 text-sm leading-6 text-zinc-400">{summaryOf(entry, lang)}</p>
        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-3 flex items-center justify-between text-xs text-zinc-500">
            <span>{lang === 'en' ? `${entry.controls.filter(c => !c.demo).length} props from the component's types` : `${entry.controls.filter(c => !c.demo).length} 个参数取自组件自己的类型定义`}</span>
            {changed && <button type="button" onClick={() => setValues(defaults(entry))} className="text-zinc-400 hover:text-white">{lang === 'en' ? 'Reset' : '重置'}</button>}
          </div>
          <Controls controls={entry.controls} values={values} onChange={change} lang={lang} />
        </div>
        <div className="space-y-2 p-6 pt-2">
          <button type="button" onClick={() => copy('install', entry.source.install)} className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm text-zinc-200 ring-1 ring-white/12 hover:bg-white/5">
            <Icon name="terminal" />{copied === 'install' ? (lang === 'en' ? 'Copied' : '已复制') : <span className="truncate font-mono text-xs">{entry.source.install}</span>}
          </button>
          <a href={entry.source.page ?? entry.source.home} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-medium text-black hover:bg-zinc-200">
            {lang === 'en' ? `Open on ${entry.source.site}` : `在 ${entry.source.site} 打开`}<Icon name="external" />
          </a>
        </div>
      </aside>
    </>
  )
}

function ShotDetail({ entry, lang, onClose }) {
  const shot = entry.shot
  const [frame, setFrame] = useState(0)
  const [copied, copy] = useCopy()
  const why = lang === 'en'
    ? 'A local source preview is not connected for this entry. The bench keeps the original screenshots and links straight to the live component.'
    : '此项尚未接入本地源码演示。这里保留原站截图，并直接跳到原站看实时效果。'
  return (
    <>
      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[28px] bg-[var(--bench-panel)] ring-1 ring-white/8">
        <header className="flex items-center justify-between gap-2 p-3">
          <div className="flex rounded-full bg-black/40 p-1">
            {shot.frames.map((f, i) => (
              <button key={f.kind} type="button" onClick={() => setFrame(i)} aria-pressed={frame === i}
                className={`rounded-full px-3.5 py-1.5 text-[13px] ${frame === i ? 'bg-zinc-950 text-white ring-1 ring-white/10' : 'text-zinc-400 hover:text-white'}`}>
                {f.kind === 'hover' ? (lang === 'en' ? 'Hover' : '悬停态') : f.kind === 'frame2' ? (lang === 'en' ? 'Frame 2' : '第二帧') : (lang === 'en' ? 'Default' : '默认')}
              </button>
            ))}
          </div>
          <span className="pr-2 text-xs text-zinc-500">{lang === 'en' ? 'Screenshot' : '原站截图'} · {shot.size.w}×{shot.size.h}</span>
        </header>
        <div className="relative m-2 mt-0 grid min-h-0 flex-1 place-items-center overflow-hidden rounded-[22px] bg-[#101012] p-6">
          <img src={shot.frames[frame].src} alt={nameOf(entry, lang)} decoding="async" className="max-h-full max-w-full rounded-xl object-contain shadow-2xl" />
          <a href={shot.page} target="_blank" rel="noreferrer" className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-black shadow-xl hover:bg-zinc-200">
            {lang === 'en' ? 'See it live on the original site' : '去原站看实时效果'}<Icon name="external" />
          </a>
        </div>
      </section>
      <aside className="flex w-full shrink-0 flex-col overflow-hidden rounded-[28px] bg-[var(--bench-panel)] ring-1 ring-white/8 md:w-[380px]">
        <div className="flex items-start justify-between gap-3 px-6 pt-6">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-white">{nameOf(entry, lang)}</h2>
            <div className="mt-2 flex flex-wrap gap-1.5"><LaneBadge entry={entry} lang={lang} /><LicenseBadge entry={entry} lang={lang} /><span className="rounded-full bg-white/6 px-2 py-0.5 text-[11px] text-zinc-400">{categoryById[entry.category][lang]}</span></div>
          </div>
          <IconButton label={lang === 'en' ? 'Close' : '关闭'} onClick={onClose}><Icon name="close" /></IconButton>
        </div>
        <div className="scrollbar-thin min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5 text-sm leading-6">
          <p className="text-zinc-300">{lang === 'en' ? shot.summaryEn : shot.summaryZh}</p>
          <dl className="space-y-3">
            <div><dt className="text-xs text-zinc-500">{lang === 'en' ? 'Motion' : '动态'}</dt><dd className="text-zinc-300">{lang === 'en' ? shot.motionEn : shot.motionZh}</dd></div>
            <div><dt className="text-xs text-zinc-500">{lang === 'en' ? 'Use' : '适用'}</dt><dd className="text-zinc-300">{lang === 'en' ? shot.useEn : shot.useZh}</dd></div>
            <div><dt className="text-xs text-zinc-500">{lang === 'en' ? 'Source' : '来源'}</dt><dd><a href={shot.page} target="_blank" rel="noreferrer" className="break-all text-violet-300 hover:underline">{shot.page}</a></dd></div>
          </dl>
          <div className="flex flex-wrap gap-1.5">{shot.style.map(s => <span key={s} className="rounded-full bg-white/6 px-2 py-0.5 text-[11px] text-zinc-400">{s}</span>)}</div>
          <p className="rounded-xl bg-amber-400/8 p-3 text-xs leading-5 text-amber-100/80 ring-1 ring-amber-300/15">{why}</p>
        </div>
        <div className="space-y-2 p-6 pt-2">
          <button type="button" onClick={() => copy('prompt', copyPrompt(entry, null, null, lang))} className="w-full rounded-full py-3 text-sm text-zinc-200 ring-1 ring-white/12 hover:bg-white/5">
            {copied === 'prompt' ? (lang === 'en' ? 'Copied' : '已复制') : (lang === 'en' ? 'Copy rebuild prompt' : '复制复刻提示词')}
          </button>
          <a href={shot.page} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-medium text-black hover:bg-zinc-200">
            {lang === 'en' ? `Open ${shot.host}` : `打开 ${shot.host}`}<Icon name="external" />
          </a>
        </div>
      </aside>
    </>
  )
}

export function Detail({ entry, lang, onClose, onStep }) {
  const dialog = useRef(null)
  useEffect(() => {
    const previous = document.activeElement
    dialog.current?.querySelector('button, a[href], input, select, textarea')?.focus()
    return () => previous?.isConnected && previous.focus?.()
  }, [entry.id])
  useEffect(() => {
    const key = e => {
      if (e.key === 'Tab') {
        const nodes = [...(dialog.current?.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),textarea:not(:disabled),select:not(:disabled),iframe,[tabindex="0"]') ?? [])].filter(el => el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0)
        const first = nodes[0], last = nodes.at(-1)
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus() }
        return
      }
      if (e.target.closest?.('input, textarea, select, [contenteditable="true"]')) return
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') onStep(1)
      else if (e.key === 'ArrowLeft') onStep(-1)
    }
    window.addEventListener('keydown', key)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', key); document.body.style.overflow = overflow }
  }, [onClose, onStep])
  const body = useMemo(() => entry.remote ? <SourceDetail key={entry.id} entry={entry} lang={lang} onClose={onClose} /> : entry.lane === 'screenshot'
    ? <ShotDetail key={entry.id} entry={entry} lang={lang} onClose={onClose} />
    : <LiveDetail key={entry.id} entry={entry} lang={lang} onClose={onClose} />, [entry, lang, onClose])
  return (
    <div ref={dialog} className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/70 p-3 backdrop-blur-md md:p-8" onMouseDown={e => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true" aria-label={nameOf(entry, lang)}>
      <div className="bench-modal flex h-full max-h-[860px] w-full max-w-[1380px] flex-col gap-3 self-center md:flex-row" onMouseDown={e => e.target === e.currentTarget && onClose()}>
        {body}
      </div>
    </div>
  )
}
