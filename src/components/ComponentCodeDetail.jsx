import { useCallback, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { navigate } from '../router.js'
import { addComponentToPlayground } from '../lib/playground-component-adapter.js'
import { highlightCode } from '../lib/component-code-highlight.js'
import { readComponentDetail } from '../lib/component-code-details.js'
import { readComponentSaves, toggleComponentSave } from '../lib/local-component-saves.js'
import { useStore } from '../store.js'
import '../styles/component-detail-bencho.css'

const controlsOf = item => (item.preview?.controls ?? item.controls ?? []).map(control => ({ ...control, kind: control.kind ?? ({ select: 'segmented', boolean: 'toggle', number: 'number' }[control.control] ?? control.control ?? 'text') }))
const defaultsOf = controls => Object.fromEntries(controls.map(control => [control.key, control.default ?? (control.kind === 'toggle' ? false : '')]))
const localized = (value, en) => typeof value === 'string' ? value : value?.[en ? 'en' : 'zh'] ?? value?.en ?? value?.zh ?? ''
const previewOf = item => {
  if ((item.preview?.status ?? item.previewStatus) !== 'verified') return null
  const url = item.preview?.url ?? item.previewUrl
  if (/^\/data\/component-code\/previews\/[a-zA-Z0-9_.-]+\/index\.html$/.test(url ?? '')) return url
  return /^\/component-bench\/\?solo=[a-zA-Z0-9_-]+(?:&embed=1)?$/.test(url ?? '') ? url + (url.includes('embed=1') ? '' : '&embed=1') : null
}
const readLocal = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback } }
const writeLocal = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* Session state still works without storage. */ } }
const decimals = step => String(step ?? 1).split('.')[1]?.length ?? 0
const numberText = (value, control) => `${Number(value).toFixed(decimals(control.step))}${control.unit ?? ''}`

function Glyph({ name, size = 18, ...props }) {
  const shapes = {
    box: <><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/></>,
    code: <><path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/></>,
    bookmark: <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>,
    close: <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>,
    volume: <><path d="m11 5-6 4H2v6h3l6 4V5Z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/></>,
    mute: <><path d="m11 5-6 4H2v6h3l6 4V5Z"/><path d="m23 9-6 6m0-6 6 6"/></>,
    play: <path d="M9 5a2 2 0 0 1 3.008-1.728l9.997 5.998a2 2 0 0 1 .003 3.458l-10 6A2 2 0 0 1 9 17z" fill="currentColor" stroke="none"/>,
    link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>,
    copy: <><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></>,
    check: <path d="m20 6-11 11-5-5"/>,
    chevron: <path d="m9 18 6-6-6-6"/>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{shapes[name]}</svg>
}

let audio = null, lastCue = 0
function cue(enabled) {
  if (!enabled || !audio || audio.state !== 'running' || performance.now() - lastCue < 90) return
  lastCue = performance.now()
  try {
    const oscillator = audio.createOscillator(), gain = audio.createGain(), now = audio.currentTime
    oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(650, now); oscillator.frequency.exponentialRampToValueAtTime(360, now + .025)
    gain.gain.setValueAtTime(.025, now); gain.gain.exponentialRampToValueAtTime(.0001, now + .035)
    oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(now); oscillator.stop(now + .04)
  } catch { /* Browser may block audio; no remote service or authentication is involved. */ }
}

function enableAudio() {
  // Only the explicit sound action may pay the browser's audio-device startup cost.
  // Let its visual state paint first; slider/keyboard cues never create or resume audio.
  requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(() => {
    try { const Audio = window.AudioContext ?? window.webkitAudioContext; audio ??= new Audio(); if (audio.state === 'suspended') void audio.resume() } catch { /* Audio may be unavailable in this browser. */ }
  }, 0)))
}

function saveFile(name, content, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function useMobilePull(closeAction) {
  const [pull, setPull] = useState(0), [sheeting, setSheeting] = useState(false)
  const sheeted = useRef(false), drag = useRef(null)
  return { pull, sheeting, sheeted, bind: {
    onPointerDown: event => {
      if (!matchMedia('(max-width:760px) and (orientation:portrait)').matches || !event.isTrusted || event.target.closest('.dtl-stage, .dtl-ctls, button, input, textarea, a')) return
      const now = performance.now()
      drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, live: false, y0: event.clientY, y1: event.clientY, t0: now, t1: now }
    },
    onPointerMove: event => {
      const current = drag.current
      if (!current || current.id !== event.pointerId) return
      const y = event.clientY - current.y, x = event.clientX - current.x
      if (!current.live) {
        if (y < 6 || Math.abs(y) <= Math.abs(x)) { if (Math.abs(x) > 10) drag.current = null; return }
        current.live = true
        try { event.currentTarget.setPointerCapture(event.pointerId) } catch { /* Pointer may already be released. */ }
      }
      current.y0 = current.y1; current.t0 = current.t1; current.y1 = event.clientY; current.t1 = performance.now(); setPull(Math.max(0, y))
    },
    onPointerUp: finish,
    onPointerCancel: finish,
  } }
  function finish(event) {
    const current = drag.current; drag.current = null
    if (!current) return
    try { event.currentTarget.releasePointerCapture(event.pointerId) } catch { /* Pointer may already be released. */ }
    if (!current.live) return
    const distance = event.clientY - current.y, velocity = (current.y1 - current.y0) / Math.max(1, current.t1 - current.t0)
    if (distance > 108 || distance > 34 && velocity > .55) {
      const box = event.currentTarget.getBoundingClientRect()
      sheeted.current = true; setSheeting(true); setPull(distance + innerHeight - box.top + 24); closeAction.current?.()
    } else setPull(0)
  }
}

function Control({ control, value, en, onChange, onHint }) {
  const node = useRef(null), timer = useRef(0), frame = useRef(0), pending = useRef(null)
  useEffect(() => () => { clearTimeout(timer.current); cancelAnimationFrame(frame.current) }, [])
  const hint = [control.prop, control.type, control.doc, control.demo && (en ? 'Demo content, not a component prop.' : '演示内容，不是组件参数。')].filter(Boolean).join(' · ')
  const enter = () => { if (hint) timer.current = setTimeout(() => { const box = node.current?.getBoundingClientRect(); if (box) onHint({ text: hint, left: box.left, top: box.top < 92 ? box.bottom + 12 : box.top - 8, width: box.width, under: box.top < 92 }) }, 420) }
  const leave = () => { clearTimeout(timer.current); onHint(null) }
  const label = (en ? control.labelEn : control.labelZh) ?? control.key
  const bar = control.kind === 'slider' && Number.isFinite(control.min) && Number.isFinite(control.max)
  const atX = (element, x, immediate) => {
    const box = element.getBoundingClientRect(), step = control.step ?? 1
    const ratio = Math.min(1, Math.max(0, (x - box.left) / box.width))
    const next = Number(Math.min(control.max, Math.max(control.min, Math.round((control.min + ratio * (control.max - control.min)) / step) * step)).toFixed(decimals(step)))
    if (immediate) { onChange(next); return }
    pending.current = next
    if (!frame.current) frame.current = requestAnimationFrame(() => { frame.current = 0; if (pending.current !== null) onChange(pending.current); pending.current = null })
  }
  return <div className="dtl-ctl" data-bar={bar ? 'true' : undefined} ref={node} onPointerEnter={enter} onPointerLeave={leave} onFocusCapture={enter} onBlurCapture={leave}>
    {bar ? <div className="dtl-bar" style={{ '--fill': `${(Number(value) - control.min) / (control.max - control.min || 1) * 100}%` }} onPointerDown={event => { event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId); if (event.pointerType !== 'touch') event.currentTarget.querySelector('input')?.focus(); atX(event.currentTarget, event.clientX, true) }} onPointerMove={event => { if (event.buttons) atX(event.currentTarget, event.clientX, false) }} onPointerUp={event => event.currentTarget.releasePointerCapture(event.pointerId)} onPointerCancel={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId) }}>
      <span className="dtl-bar-label">{label}{control.demo && <small className="dtl-demo">{en ? 'demo' : '演示'}</small>}</span><span className="dtl-bar-val">{numberText(value, control)}</span><input className="dtl-range" type="range" min={control.min} max={control.max} step={control.step ?? 1} value={value} aria-label={label} onChange={event => onChange(Number(event.target.value))}/>
    </div> : <><span className="dtl-ctl-label">{label}{control.demo && <small className="dtl-demo">{en ? 'demo' : '演示'}</small>}</span>
      {control.kind === 'toggle' ? <button className="dtl-switch" type="button" role="switch" aria-label={label} aria-checked={Boolean(value)} data-on={value ? 'true' : undefined} onClick={() => onChange(!value)}><span className="dtl-switch-knob"/></button>
        : control.kind === 'segmented' ? <div className="dtl-seg">{(control.options ?? []).map(option => <button className="dtl-seg-btn" type="button" key={String(option)} data-on={value === option ? 'true' : undefined} aria-pressed={value === option} onClick={() => onChange(option)}>{typeof option === 'boolean' ? option ? (en ? 'On' : '开') : (en ? 'Off' : '关') : option}</button>)}</div>
          : control.kind === 'color' ? <input className="dtl-color" type="color" value={value} aria-label={label} onChange={event => onChange(event.target.value)}/>
            : control.kind === 'textarea' ? <textarea className="dtl-text" value={value} aria-label={label} rows={5} onChange={event => onChange(event.target.value)}/>
              : <input className="dtl-text" type={control.kind === 'number' ? 'number' : 'text'} step={control.step ?? (control.kind === 'number' ? 'any' : undefined)} min={control.min} max={control.max} value={value} aria-label={label} onChange={event => { const next = control.kind === 'number' ? event.target.valueAsNumber : event.target.value; if (typeof next !== 'number' || Number.isFinite(next)) onChange(next) }}/>}</>}
  </div>
}

function CodeSection({ id, title, content, open, setOpen, children, tools, copied, copy }) {
  const [visited, setVisited] = useState(open)
  const enabled = visited || open
  const numbered = id !== 'install'
  const highlighted = useMemo(() => enabled ? highlightCode(String(content ?? '')).map((token, index) => token.kind ? <span className={`hl-${token.kind}`} key={index}>{token.text}</span> : token.text) : null, [content, enabled])
  const lineNumbers = useMemo(() => enabled ? Array.from({ length: String(content ?? '').split('\n').length }, (_, index) => index + 1).join('\n') : '', [content, enabled])
  return <section className="cv-sec" data-open={open ? 'true' : undefined}><header className="cv-bar"><button className="cv-toggle" type="button" aria-expanded={open} onClick={() => { setVisited(true); setOpen(open ? null : id) }}><Glyph className="cv-chev" name="chevron" size={15}/><h3 className="cv-h">{title}</h3></button><div className="cv-tools">{open && tools}<button className="cv-copy" type="button" title={copied === id ? 'Copied' : 'Copy'} aria-label={`Copy ${title}`} onClick={() => copy(id, content)}><Glyph name={copied === id ? 'check' : 'copy'} size={16}/></button></div></header><div className="cv-body" aria-hidden={!open}><div className="cv-inner"><div className="cv-box" data-numbered={numbered ? 'true' : undefined}>{numbered && <pre className="cv-lines" aria-hidden="true">{lineNumbers}</pre>}<pre className="cv-src"><code>{highlighted}</code></pre></div>{children}</div></div></section>
}

export default function ComponentCodeDetail({ unit, en, onClose }) {
  const { theme } = useStore()
  const initial = unit.codeResource?.initialItem ?? unit.codeResource ?? unit
  const [item, setItem] = useState(initial), [values, setValues] = useState(() => defaultsOf(controlsOf(initial)))
  const [mode, setMode] = useState('preview'), [section, setSection] = useState('install'), [fileIndex, setFileIndex] = useState(0)
  const [active, setActive] = useState(false), [ready, setReady] = useState(false), [previewError, setPreviewError] = useState(false)
  const [morph, setMorph] = useState('380ms')
  const [loading, setLoading] = useState(!unit.codeResource?.initialItem), [loadError, setLoadError] = useState(false)
  const [usage, setUsage] = useState(''), [copied, setCopied] = useState(null), [hint, setHint] = useState(null), [shotIndex, setShotIndex] = useState(0)
  const [saved, setSaved] = useState(() => readComponentSaves().some(row => row.id === unit.id))
  const [addError, setAddError] = useState('')
  const [sound, setSound] = useState(() => readLocal('vl-component-sound', false))
  const [systemDark, setSystemDark] = useState(() => matchMedia('(prefers-color-scheme: dark)').matches)
  const root = useRef(null), shell = useRef(null), block = useRef(null), iframe = useRef(null), ctls = useRef(null), closing = useRef(false), closeTimer = useRef(0)
  const closeAction = useRef(null)
  const mobilePull = useMobilePull(closeAction)
  const origin = useRef(document.activeElement?.closest('.discovery-card')?.querySelector('.discovery-preview') ?? null)
  const shown = useDeferredValue(values), t = (zh, english) => en ? english : zh
  const frameState = useRef(null)
  const controls = useMemo(() => controlsOf(item), [item])
  const previewUrl = previewOf(item), shot = item.lane === 'screenshot' || (!previewUrl && unit.previewKind === 'image' && !unit.codeResource?.sourceAvailable)
  const rawLicense = typeof item.license === 'object' ? item.license : { spdx: item.license ?? item.source?.license, url: item.source?.licenseUrl }
  const license = rawLicense ?? {}
  const files = useMemo(() => [...(item.files ?? []), ...(typeof item.license === 'object' && item.license?.text ? [{ path: 'LICENSE', content: item.license.text }] : [])], [item])
  const file = files[Math.min(fileIndex, Math.max(0, files.length - 1))]
  const frames = item.frames?.length ? item.frames : [{ kind: 'default', src: item.poster ?? unit.previewUrl }]
  const poster = item.preview?.posterUrl ?? item.poster ?? unit.previewUrl
  const sourceUrl = item.sourceUrl ?? item.source?.page ?? unit.sourceUrl
  const title = (en ? unit.nameEn : unit.nameZh) ?? localized(item.title ?? item.name, en)
  const description = localized(item.description ?? (en ? unit.descriptionEn : unit.descriptionZh), en)
  const brief = shot ? ((en ? unit.sectionsEn : unit.sectionsZh)?.[0]?.text ?? description.split(/\n|[。!?]\s*/)[0]) : description
  const install = item.install ?? item.source?.install ?? (item.registryUrl ? `npx shadcn@latest add "${item.registryUrl}"` : '')
  const effectiveTheme = theme === 'system' ? systemDark ? 'dark' : 'light' : theme
  const detailUrl = unit.codeResource?.detailUrl ?? unit.codeDetailUrl ?? `/data/component-code/items/${encodeURIComponent(unit.codeResource?.id ?? unit.id)}.json`
  const groups = useMemo(() => [{ group: 'Switches', controls: controls.filter(control => control.kind !== 'slider') }, { group: 'Levels', controls: controls.filter(control => control.kind === 'slider') }].filter(group => group.controls.length), [controls])
  const send = useCallback((type, extra = {}) => iframe.current?.contentWindow?.postMessage({ type, ...extra }, '*'), [])
  const copy = useCallback(async (key, text) => { try { await navigator.clipboard.writeText(String(text ?? '')); cue(sound); setCopied(key); setTimeout(() => setCopied(current => current === key ? null : current), 1800) } catch { setCopied('error') } }, [sound])
  const close = useCallback(() => {
    if (closing.current) return
    closing.current = true; cue(sound); setMorph('300ms'); setActive(false); setHint(null)
    const from = origin.current?.isConnected ? origin.current.getBoundingClientRect() : null, to = shell.current?.getBoundingClientRect()
    if (!mobilePull.sheeted.current && from && to && block.current) Object.assign(block.current.style, { left: `${from.left - to.left}px`, top: `${from.top - to.top}px`, width: `${from.width}px`, height: `${from.height}px`, borderRadius: '28px' })
    closeTimer.current = setTimeout(onClose, 340)
  }, [onClose, sound, mobilePull.sheeted])
  useLayoutEffect(() => { closeAction.current = close }, [close])
  useLayoutEffect(() => {
    const from = origin.current?.getBoundingClientRect(), to = shell.current?.getBoundingClientRect()
    if (from && to && block.current) { Object.assign(block.current.style, { left: `${from.left - to.left}px`, top: `${from.top - to.top}px`, width: `${from.width}px`, height: `${from.height}px`, borderRadius: '28px' }); block.current.getBoundingClientRect() }
    const tick = requestAnimationFrame(() => { if (block.current) Object.assign(block.current.style, { left: '', top: '', width: '', height: '', borderRadius: '' }); setActive(true) })
    return () => { cancelAnimationFrame(tick); clearTimeout(closeTimer.current) }
  }, [])
  useEffect(() => {
    if (unit.codeResource?.initialItem) return undefined
    let live = true
    readComponentDetail(detailUrl).then(data => { if (live) { setItem(data); setValues(current => ({ ...defaultsOf(controlsOf(data)), ...current })); setLoading(false) } }).catch(() => { if (live) { setLoadError(true); setLoading(false) } })
    return () => { live = false }
  }, [detailUrl, unit.codeResource?.initialItem])
  useEffect(() => { const media = matchMedia('(prefers-color-scheme: dark)'), update = () => setSystemDark(media.matches); media.addEventListener('change', update); return () => media.removeEventListener('change', update) }, [])
  useEffect(() => {
    const element = ctls.current
    if (!element) return undefined
    let frame = 0
    const measure = () => { frame = 0; const top = element.scrollTop > 2, bottom = element.scrollTop + element.clientHeight < element.scrollHeight - 2; element.dataset.over = top && bottom ? 'both' : top ? 'top' : bottom ? 'bottom' : 'none' }
    const scroll = () => { frame ||= requestAnimationFrame(measure) }
    measure(); element.addEventListener('scroll', scroll, { passive: true })
    const observer = new ResizeObserver(measure); observer.observe(element); for (const child of element.children) observer.observe(child)
    return () => { element.removeEventListener('scroll', scroll); observer.disconnect(); cancelAnimationFrame(frame) }
  }, [groups, shot])
  useEffect(() => { send('vislexicon:props', { values: shown }) }, [send, shown])
  useEffect(() => { send('vislexicon:theme', { theme: effectiveTheme }) }, [send, effectiveTheme])
  useEffect(() => { send('vislexicon:sound', { enabled: sound }) }, [send, sound])
  useEffect(() => { send('vislexicon:view', { mode }) }, [send, mode])
  useLayoutEffect(() => { frameState.current = { values: shown, theme: effectiveTheme, enabled: sound, mode } }, [shown, effectiveTheme, sound, mode])
  useEffect(() => {
    if (!ready) return
    const latest = frameState.current
    send('vislexicon:props', { values: latest.values }); send('vislexicon:theme', { theme: latest.theme }); send('vislexicon:sound', { enabled: latest.enabled }); send('vislexicon:view', { mode: latest.mode })
  }, [send, ready])
  useEffect(() => {
    const receive = event => {
      if (event.source !== iframe.current?.contentWindow) return
      if (event.data?.type === 'vislexicon:usage' && typeof event.data.usage === 'string' && event.data.usage.length < 100000) setUsage(event.data.usage)
      if (event.data?.type === 'vislexicon:ready') { setReady(true); setPreviewError(false) }
      if (event.data?.type === 'vislexicon:error') { setPreviewError(true); setReady(false) }
      if (event.data?.type === 'vislexicon:escape') closeAction.current?.()
    }
    addEventListener('message', receive); return () => removeEventListener('message', receive)
  }, [])
  useEffect(() => {
    const previous = document.activeElement, overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'; shell.current?.querySelector('.dtl-x')?.focus({ preventScroll: true, focusVisible: false })
    const key = event => {
      if (event.key === 'Escape') { closeAction.current?.(); return }
      if (event.key !== 'Tab') return
      const focusable = [...(shell.current?.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),textarea:not(:disabled),select:not(:disabled),iframe,[tabindex="0"]') ?? [])].filter(element => element.offsetWidth || element.offsetHeight)
      const first = focusable[0], last = focusable.at(-1)
      if (event.shiftKey && (document.activeElement === first || !shell.current?.contains(document.activeElement))) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown', key)
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', key); if (previous?.isConnected) previous.focus?.() }
  }, [])
  const change = (key, value) => { cue(sound); setValues(current => ({ ...current, [key]: value })) }
  const toggleSaved = () => { try { setSaved(toggleComponentSave({ ...unit, nameZh: localized(item.title, false) || unit.nameZh, nameEn: localized(item.title, true) || unit.nameEn, descriptionZh: localized(item.description, false) || unit.descriptionZh, descriptionEn: localized(item.description, true) || unit.descriptionEn, previewUrl: poster, sourceUrl })); cue(sound) } catch { setCopied('error') } }
  const addToBench = () => { try { const part = addComponentToPlayground({ item, unit, values }); cue(sound); navigate(`#/playground?part=${encodeURIComponent(part.id)}`) } catch (error) { setAddError(String(error.message ?? error)) } }
  const share = () => { const url = new URL(location.href), params = new URLSearchParams(url.hash.split('?')[1] ?? ''); params.set('component', item.id ?? unit.id); url.hash = '#/components?' + params; void copy('share', url.href) }
  const download = () => saveFile(`${item.id ?? unit.id}.json`, JSON.stringify({ sourceUrl, sourceName: item.sourceName ?? item.source?.site, commit: item.commit ?? item.source?.commit, license, dependencies: item.dependencies ?? [], registryDependencies: item.registryDependencies ?? [], files: item.files ?? [], reconstructionPrompt: item.reconstructionPrompt ?? unit.reconstructionPrompt }, null, 2), 'application/json;charset=utf-8')
  const prompt = [t(`使用「${title}」，保留来源与许可。`, `Use “${title}” and preserve its source and license.`), sourceUrl, install, usage, shot && (item.reconstructionPrompt ?? unit.reconstructionPrompt), ...files.map(source => `--- ${source.path} ---\n${source.content}`)].filter(Boolean).join('\n\n')
  const actualUsage = usage || JSON.stringify(Object.fromEntries(controls.filter(control => !control.demo).map(control => [control.key, values[control.key]])), null, 2)
  return createPortal(<div className="vl-component-detail dtl" ref={root} data-on={active ? 'true' : 'false'} data-theme={effectiveTheme} style={{ '--morph': morph }}>
    <button className="dtl-scrim" type="button" tabIndex={-1} aria-hidden="true" onClick={close}/>
    <div className="dtl-shell" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={shell} data-pull={mobilePull.pull && !mobilePull.sheeting ? '' : undefined} data-sheet={mobilePull.sheeting ? '' : undefined} style={mobilePull.pull ? { transform: `translateY(${mobilePull.pull.toFixed(1)}px)` } : undefined} {...mobilePull.bind}>
      <div className="dtl-block" data-tone="light" data-view={mode} ref={block}>
        <div className="dtl-stage" data-ready={ready ? 'true' : undefined}>
          {previewUrl && <>{poster && <img className="dtl-poster" src={poster} alt=""/>}<iframe ref={iframe} title={title} sandbox="allow-scripts" referrerPolicy="no-referrer" src={previewUrl} onLoad={() => { send('vislexicon:props', { values: shown }); send('vislexicon:theme', { theme: effectiveTheme }); send('vislexicon:sound', { enabled: sound }); send('vislexicon:view', { mode }) }}/></>}
          {shot && frames[shotIndex]?.src && <img className="dtl-shot" src={frames[shotIndex].src} alt={title}/>}
          {previewError && <p className="dtl-error">{t('实时预览未能运行，当前保留实际预览图，可前往原站。', 'The live preview could not run. The actual poster remains available; open the original source.')}</p>}
        </div>
        <div className="dtl-view" role="tablist" aria-label="View"><button type="button" role="tab" data-on={mode === 'preview' ? 'true' : undefined} aria-selected={mode === 'preview'} aria-label="Preview" title={t('预览', 'Preview')} onClick={() => { cue(sound); if (mode !== 'preview') setReady(false); setMode('preview') }}><Glyph name="box" size={16}/></button><button type="button" role="tab" data-on={mode === 'code' ? 'true' : undefined} aria-selected={mode === 'code'} aria-label="Code" title={t('代码', 'Code')} onClick={() => { cue(sound); setMode('code') }}><Glyph name="code" size={16}/></button></div>
        {mode === 'code' && <><div className="cv-ai"><button className="cv-ai-btn" type="button" onClick={() => copy('prompt', prompt)}>{copied === 'prompt' ? t('已复制，可粘贴给 Agent', 'Copied, paste it into your agent') : t('复制提示词', 'Copy prompt')}</button></div><div className="cv" aria-busy={loading}>
          {shot ? <><CodeSection id="observation" title={t('观察记录', 'Observation')} content={description || localized(en ? unit.descriptionEn : unit.descriptionZh, en)} open={section === 'install' || section === 'observation'} setOpen={setSection} copy={copy} copied={copied}/><CodeSection id="prompt" title={t('重建提示词', 'Rebuild prompt')} content={item.reconstructionPrompt ?? unit.reconstructionPrompt ?? ''} open={section === 'prompt'} setOpen={setSection} copy={copy} copied={copied}/></> : <><CodeSection id="install" title={t('安装', 'Install')} content={install || (loading ? t('正在读取原始文件…', 'Reading original files…') : t('参见原始来源', 'See original source'))} open={section === 'install'} setOpen={setSection} copy={copy} copied={copied}/><CodeSection id="usage" title={t('用法', 'Usage')} content={actualUsage} open={section === 'usage'} setOpen={setSection} copy={copy} copied={copied}/><CodeSection id="code" title={t('代码', 'Code')} content={file?.content ?? ''} open={section === 'code'} setOpen={setSection} copy={copy} copied={copied} tools={files.length > 1 && <div className="cv-files" role="tablist" aria-label="File">{files.map((source, index) => <button type="button" role="tab" aria-selected={fileIndex === index} data-on={fileIndex === index ? 'true' : undefined} key={`${source.path}-${index}`} onClick={() => { cue(sound); setFileIndex(index) }}>{source.path.split('/').pop()}</button>)}</div>}/><CodeSection id="how" title={t('工作原理', 'How it works')} content={description} open={section === 'how'} setOpen={setSection} copy={copy} copied={copied}/></>}
          <p className="cv-note"><a href={sourceUrl} target="_blank" rel="noreferrer">{item.sourceName ?? item.source?.site ?? unit.source?.name ?? t('原始来源', 'Original source')} ↗</a>{license.spdx && <> · <a href={license.url} target="_blank" rel="noreferrer">{license.spdx}</a></>}{files.length > 0 && <> · <button className="cv-download" type="button" onClick={download}>{t('下载完整文件', 'Download files')}</button></>}</p>
          {(loadError || copied === 'error') && <p className="cv-note">{loadError ? t('原始文件暂未读到，可直接打开来源。', 'Original files are unavailable; open the source directly.') : t('浏览器未允许复制，可选择文本或下载文件。', 'Clipboard access was blocked; select the text or download the files.')}</p>}
        </div></>}
        {mode === 'preview' && <><div className="dtl-tools"><button className="dtl-tool" type="button" data-on={saved ? 'true' : undefined} aria-pressed={saved} aria-label={saved ? 'Remove from saved' : 'Save'} title={t(saved ? '已保存' : '保存', saved ? 'Saved' : 'Save')} onClick={toggleSaved}><Glyph name="bookmark" fill={saved ? 'currentColor' : 'none'}/></button><button className="dtl-tool" type="button" data-on={sound ? 'true' : undefined} aria-pressed={sound} aria-label={sound ? 'Turn sound off' : 'Turn sound on'} title={t(sound ? '关闭界面音效' : '开启界面音效', sound ? 'Sound on' : 'Sound off')} onClick={() => { writeLocal('vl-component-sound', !sound); setSound(!sound); if (!sound) enableAudio() }}><Glyph name={sound ? 'volume' : 'mute'}/></button></div>{previewUrl && <button className="rh-play" type="button" aria-label="Replay" title={t('重播', 'Replay')} onClick={() => { cue(sound); send('vislexicon:replay') }}><Glyph name="play" size={15}/></button>}</>}
      </div>
      <aside className="dtl-side"><header className="dtl-head"><div className="dtl-id"><h2 className="dtl-title">{title}</h2></div><div className="dtl-acts"><button className="dtl-x" type="button" aria-label="Close" title={t('关闭，返回组件列表', 'Close and return to components')} onClick={close}><Glyph name="close"/></button></div>{brief && <p className="dtl-say">{brief}</p>}</header>
        <div className="dtl-ctls" ref={ctls}>
          {shot ? <div className="dtl-group"><div className="dtl-ctl"><span className="dtl-ctl-label">{t('状态', 'State')}</span><div className="dtl-seg">{frames.map((entry, index) => <button className="dtl-seg-btn" type="button" data-on={shotIndex === index ? 'true' : undefined} aria-pressed={shotIndex === index} key={entry.src} onClick={() => { cue(sound); setShotIndex(index) }}>{entry.kind === 'hover' ? t('悬停', 'Hover') : entry.kind === 'frame2' ? t('第二帧', 'Frame 2') : t('默认', 'Default')}</button>)}</div></div></div> : groups.map(group => <div className="dtl-group" key={group.group}><span className="dtl-group-name">{group.group}</span>{group.controls.map(control => <Control key={control.key} control={control} value={values[control.key] ?? control.default ?? ''} en={en} onChange={value => change(control.key, value)} onHint={setHint}/>)}</div>)}
        </div>
        <div className="dtl-foot"><button className="dtl-share" type="button" data-done={copied === 'share' ? 'true' : 'false'} aria-label="Copy a link to this component" onClick={share}><Glyph name={copied === 'share' ? 'check' : 'link'} size={15}/>{copied === 'share' ? t('已复制链接', 'Copied') : t('分享', 'Share')}</button>{shot ? <a className="dtl-put" href={sourceUrl} target="_blank" rel="noreferrer">{t('打开原站', 'Open original source')} ↗</a> : <button className="dtl-put" type="button" title={addError || undefined} onClick={addToBench}>{addError ? t('保存失败，请重试', 'Could not save — retry') : t('加入工作台', 'Add to bench')}</button>}</div>
      </aside>
    </div>
    {hint && <span className="dtl-tip" role="tooltip" data-under={hint.under ? 'true' : undefined} style={{ left: hint.left, top: hint.top, width: hint.width }}>{hint.text}</span>}
  </div>, document.body)
}
