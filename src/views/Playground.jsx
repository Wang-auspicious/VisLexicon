import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocale } from '../i18n.js'
import { useRoute } from '../router.js'
import { composeWithSourceComponents, loadPlaygroundComponents } from '../lib/playground-component-adapter.js'
import '../styles/playground.css'

// Playground：把图鉴里的可调单元摆到一张桌面尺寸的画布上，调参数，导出 DesignSpec / 双语提示词。
// 单元定义与图鉴、MCP 共用 /effects-atlas/units/，这里不重复写任何组件。
const UNITS_URL = '/effects-atlas/units/index.js'
const SPEC_URL = '/effects-atlas/units/spec.js'
const STORE_KEY = 'vl-playground-v1'
const SIZES = [[1280, 800], [1440, 900], [1920, 1080]]
const GRID = 8
const EMPTY = {}

const load = () => { try { return JSON.parse(localStorage.getItem(STORE_KEY) || 'null') } catch { return null } }
const save = (s) => { try { localStorage.setItem(STORE_KEY, JSON.stringify(s)) } catch { /* 隐私模式下不保存 */ } }
const snap = (n) => Math.round(n / GRID) * GRID
const uid = () => Math.random().toString(36).slice(2, 9)

const INITIAL = {
  title: '', intent: '', theme: 'light', size: 1,
  parts: [
    { id: 'p1', unitId: 'segmented', values: { count: 3 }, x: 584, y: 304, note: '' },
    { id: 'p2', unitId: 'switch', values: {}, x: 696, y: 384, note: '' },
    { id: 'p3', unitId: 'slide-confirm', values: {}, x: 576, y: 448, note: '' },
    { id: 'p4', unitId: 'button', values: { variant: 'tinted' }, x: 656, y: 544, note: '' },
  ],
}

/** 一个单元实例：host 挂 shadow root，参数变化时只 update 不重建。 */
function UnitHost({ unit, values, theme, lang, complete, onSize }) {
  const ref = useRef(null)
  const ctl = useRef(null)
  const merged = useMemo(() => complete(unit, { ...values, ...(unit.sourceComponent ? { __canvasTheme: theme } : { fill: theme }) }), [complete, unit, values, theme])
  useEffect(() => {
    const host = ref.current
    if (!host || !unit) return undefined
    host.setAttribute('data-bare', '')
    ctl.current = unit.mount(host, merged, { lang })
    const ro = onSize ? new ResizeObserver(() => onSize(host.offsetWidth, host.offsetHeight)) : null
    ro?.observe(host)
    return () => { ro?.disconnect(); ctl.current?.destroy(); ctl.current = null }
    // 只在换单元/换语言时重建
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit, lang])
  useEffect(() => { ctl.current?.update(merged) }, [merged])
  return <div ref={ref} className="pg-host" />
}

function Bar({ p, value, onChange, en }) {
  const pct = ((value - p.min) / ((p.max - p.min) || 1)) * 100
  return <label className="pg-bar" style={{ '--pct': `${pct}%` }}>
    <span className="pg-bar-label">{en ? p.en : p.zh}</span>
    <span className="pg-bar-val">{value}{p.unit}</span>
    <input type="range" min={p.min} max={p.max} step={p.step} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-label={en ? p.en : p.zh} />
  </label>
}

function Seg({ label, opts, value, onChange, en }) {
  return <div className="pg-seg-row">
    {label && <span className="pg-seg-label">{label}</span>}
    <div className="pg-seg" role="group" aria-label={label}>
      {opts.map(o => <button key={o.v} type="button" aria-pressed={o.v === value} onClick={() => onChange(o.v)}>{en ? o.en : o.zh}</button>)}
    </div>
  </div>
}

export default function Playground() {
  const en = useLocale() === 'en'
  const { query } = useRoute()
  const lang = en ? 'en' : 'zh'
  const [mods, setMods] = useState(null)
  const [state, setState] = useState(() => load() || INITIAL)
  const [selected, setSelected] = useState(() => query.part ?? null)
  const [mode, setMode] = useState('edit')
  const [tab, setTab] = useState('props')
  const [promptLang, setPromptLang] = useState(lang)
  const [toast, setToast] = useState('')
  const [scale, setScale] = useState(0.6)
  const [dims, setDims] = useState({})
  const viewport = useRef(null)
  const drag = useRef(null)

  useEffect(() => {
    let live = true
    // 单元放在 public/ 下供图鉴 iframe、MCP 共用；用绝对地址导入，开发服务器才不会把它当成源码改写。
    const at = (u) => new URL(u, window.location.origin).href
    Promise.all([import(/* @vite-ignore */ at(UNITS_URL)), import(/* @vite-ignore */ at(SPEC_URL)), loadPlaygroundComponents(state.parts)])
      .then(([u, s, sources]) => { if (live) {
        const registry = { ...u.UNIT_BY_ID, ...sources }
        setMods({ ...u, UNIT_BY_ID: registry, withDefaults: (unit, values) => unit.sourceComponent ? unit.complete(values) : u.withDefaults(unit, values), compose: args => composeWithSourceComponents(s.composeDesignSpec, registry, args) })
      } })
      .catch(() => setToast(en ? 'Could not load units' : '单元加载失败'))
    return () => { live = false }
    // State is read once on entry; adding through native detail navigates here anew.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [en])
  useEffect(() => { save(state) }, [state])

  const [W, H] = SIZES[state.size] || SIZES[1]
  useEffect(() => {
    const el = viewport.current
    if (!el) return undefined
    const fit = () => setScale(Math.min(1, (el.clientWidth - 96) / W, (el.clientHeight - 96) / H))
    fit()
    const ro = new ResizeObserver(fit); ro.observe(el)
    return () => ro.disconnect()
  }, [W, H])

  const patch = useCallback((fn) => setState(s => ({ ...s, ...fn(s) })), [])
  const setPart = useCallback((id, fn) => patch(s => ({ parts: s.parts.map(p => (p.id === id ? { ...p, ...fn(p) } : p)) })), [patch])
  const add = (unitId) => {
    const id = uid()
    patch(s => ({ parts: [...s.parts, { id, unitId, values: {}, x: snap(W / 2 - 120 + (s.parts.length % 5) * 24), y: snap(H / 2 - 60 + (s.parts.length % 5) * 24), note: '' }] }))
    setSelected(id); setMode('edit'); setTab('props')
  }
  const remove = (id) => { patch(s => ({ parts: s.parts.filter(p => p.id !== id) })); setSelected(null) }
  const duplicate = (id) => {
    const nid = uid()
    patch(s => { const p = s.parts.find(x => x.id === id); return p ? { parts: [...s.parts, { ...p, id: nid, x: p.x + 24, y: p.y + 24 }] } : {} })
    setSelected(nid)
  }

  useEffect(() => {
    const onKey = (e) => {
      if (/input|textarea|select/i.test(e.target.tagName) || e.target.isContentEditable) return
      if (e.key === 'Escape') setSelected(null)
      if (!selected || mode !== 'edit') return
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); remove(selected) }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') { e.preventDefault(); duplicate(selected) }
      const step = e.shiftKey ? GRID : 1
      const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key]
      if (d) { e.preventDefault(); setPart(selected, p => ({ x: p.x + d[0], y: p.y + d[1] })) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const startDrag = (e, part) => {
    e.preventDefault(); e.stopPropagation()
    setSelected(part.id)
    drag.current = { id: part.id, sx: e.clientX, sy: e.clientY, x: part.x, y: part.y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const moveDrag = (e) => {
    const d = drag.current; if (!d) return
    const x = d.x + (e.clientX - d.sx) / scale, y = d.y + (e.clientY - d.sy) / scale
    setPart(d.id, () => ({ x: e.altKey ? Math.round(x) : snap(x), y: e.altKey ? Math.round(y) : snap(y) }))
  }
  const endDrag = () => { drag.current = null }

  const spec = useMemo(() => {
    if (!mods) return null
    try {
      return mods.compose({
        title: state.title || (en ? 'Untitled screen' : '未命名界面'), intent: state.intent, theme: state.theme, width: W, height: H,
        parts: [...state.parts].sort((a, b) => a.y - b.y || a.x - b.x).map(p => ({ unitId: p.unitId, values: p.values, note: p.note, frame: { x: p.x, y: p.y, w: dims[p.id]?.[0], h: dims[p.id]?.[1] } })),
      })
    } catch (err) { return { error: String(err.message || err) } }
  }, [mods, state, W, H, en, dims])

  const flash = (t) => { setToast(t); setTimeout(() => setToast(''), 1600) }
  const copyPrompt = async () => {
    if (!spec?.prompt) return
    try { await navigator.clipboard.writeText(spec.prompt[promptLang]); flash(en ? 'Prompt copied' : '提示词已复制') } catch { setTab('prompt'); flash(en ? 'Select the text to copy' : '请在“提示词”里手动复制') }
  }
  const exportSpec = () => {
    if (!spec || spec.error) return
    const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = `${(state.title || 'design-spec').replace(/[^\w一-鿿-]+/g, '-')}.json`; a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
    flash(en ? 'Design Spec exported' : '设计规格已导出')
  }

  const sel = state.parts.find(p => p.id === selected)
  const selUnit = sel && mods?.UNIT_BY_ID[sel.unitId]
  const selValues = selUnit ? mods.withDefaults(selUnit, sel.values) : null

  if (!mods) return <div className="pg pg-loading" role="status">{toast || (en ? 'Loading the bench…' : '正在准备画布…')}</div>

  return <div className={`pg pg-mode-${mode}`}>
    <header className="pg-toolbar">
      <input className="pg-title" value={state.title} placeholder={en ? 'Untitled screen' : '未命名界面'} onChange={(e) => patch(() => ({ title: e.target.value }))} aria-label={en ? 'Screen title' : '界面名称'} />
      <div className="pg-seg pg-mode" role="group" aria-label={en ? 'Mode' : '模式'}>
        <button type="button" aria-pressed={mode === 'edit'} onClick={() => setMode('edit')}>{en ? 'Arrange' : '摆放'}</button>
        <button type="button" aria-pressed={mode === 'preview'} onClick={() => { setMode('preview'); setSelected(null) }}>{en ? 'Try it' : '试用'}</button>
      </div>
      <div className="pg-actions">
        <span className="pg-zoom">{Math.round(scale * 100)}%</span>
        <div className="pg-seg" role="group" aria-label={en ? 'Prompt language' : '提示词语言'}>
          <button type="button" aria-pressed={promptLang === 'zh'} onClick={() => setPromptLang('zh')}>中</button>
          <button type="button" aria-pressed={promptLang === 'en'} onClick={() => setPromptLang('en')}>EN</button>
        </div>
        <button type="button" className="pg-btn" onClick={copyPrompt}>{en ? 'Copy prompt' : '复制提示词'}</button>
        <button type="button" className="pg-btn pg-btn-primary" onClick={exportSpec}>{en ? 'Export spec' : '导出规格'}</button>
      </div>
    </header>

    <aside className="pg-parts" aria-label={en ? 'Parts' : '部件'}>
      <h2>{en ? 'Parts' : '部件'}</h2>
      <p className="pg-hint">{en ? 'Click to drop onto the canvas. Every part is a tunable unit from the atlas.' : '点一下放到画布上。每个部件都是图鉴里的可调单元。'}</p>
      <div className="pg-part-list">
        {mods.UNITS.map(u => <button key={u.id} type="button" className="pg-part" onClick={() => add(u.id)}>
          <span className="pg-part-preview" aria-hidden="true" style={{ '--pv': Math.min(0.72, 196 / (u.size?.w || 200)) }}><UnitHost unit={u} values={EMPTY} theme="light" lang={lang} complete={mods.withDefaults} /></span>
          <span className="pg-part-name">{en ? u.en : u.zh}<small>{en ? u.de : u.dz}</small></span>
        </button>)}
      </div>
      <a className="pg-more" href="#/atlas/unit">{en ? 'Open in the atlas →' : '在图鉴里看全部 →'}</a>
    </aside>

    <main className="pg-viewport" ref={viewport} onPointerDown={(e) => { if (e.target === e.currentTarget) setSelected(null) }}>
      <div className={`pg-board pg-board-${state.theme}`} style={{ width: W, height: H, transform: `scale(${scale})` }} onPointerDown={(e) => { if (e.target === e.currentTarget) setSelected(null) }}>
        {state.parts.map(p => {
          const unit = mods.UNIT_BY_ID[p.unitId]
          if (!unit) return null
          return <div key={p.id} className={`pg-item${p.id === selected ? ' is-selected' : ''}`} style={{ left: p.x, top: p.y }}>
            <UnitHost unit={unit} values={p.values} theme={state.theme} lang={lang} complete={mods.withDefaults} onSize={(w, h) => setDims(d => (d[p.id]?.[0] === w && d[p.id]?.[1] === h ? d : { ...d, [p.id]: [w, h] }))} />
            {mode === 'edit' && <div className="pg-grab" role="button" tabIndex={0} aria-label={`${en ? unit.en : unit.zh} — ${en ? 'drag to move' : '拖动移动'}`}
              onPointerDown={(e) => startDrag(e, p)} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}
              onFocus={() => setSelected(p.id)}>
              <span className="pg-chip">{en ? unit.en : unit.zh} · {p.x}, {p.y}</span>
            </div>}
          </div>
        })}
        {!state.parts.length && <div className="pg-empty">{en ? 'Pick a part on the left to start' : '从左边挑一个部件开始'}</div>}
      </div>
      {toast && <div className="pg-toast" role="status">{toast}</div>}
    </main>

    <aside className="pg-inspector" aria-label={en ? 'Inspector' : '检查器'}>
      <div className="pg-seg pg-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'props'} aria-pressed={tab === 'props'} onClick={() => setTab('props')}>{sel ? (en ? 'Part' : '部件') : (en ? 'Canvas' : '画布')}</button>
        <button type="button" role="tab" aria-selected={tab === 'prompt'} aria-pressed={tab === 'prompt'} onClick={() => setTab('prompt')}>{en ? 'Prompt' : '提示词'}</button>
        <button type="button" role="tab" aria-selected={tab === 'spec'} aria-pressed={tab === 'spec'} onClick={() => setTab('spec')}>Spec</button>
      </div>

      {tab === 'props' && sel && selUnit && <div className="pg-panel">
        <h3>{en ? selUnit.en : selUnit.zh}</h3>
        <p className="pg-feel">{en ? selUnit.de : selUnit.dz}</p>
        {selUnit.params.filter(p => selUnit.sourceComponent || p.k !== 'fill').map(p => (p.kind === 'range'
          ? <Bar key={p.k} p={p} en={en} value={selValues[p.k]} onChange={(v) => setPart(sel.id, q => ({ values: { ...q.values, [p.k]: v } }))} />
          : p.kind === 'seg' ? <Seg key={p.k} label={en ? p.en : p.zh} opts={p.opts} en={en} value={selValues[p.k]} onChange={(v) => setPart(sel.id, q => ({ values: { ...q.values, [p.k]: v } }))} />
            : <label className="pg-field" key={p.k}><span>{en ? p.en : p.zh}</span><textarea rows={p.kind === 'textarea' ? 5 : 1} aria-label={en ? p.en : p.zh} value={selValues[p.k]} onChange={event => { const value = p.kind === 'number' ? Number(event.target.value) : event.target.value; if (typeof value !== 'number' || Number.isFinite(value)) setPart(sel.id, part => ({ values: { ...part.values, [p.k]: value } })) }}/></label>))}
        <label className="pg-field"><span>{en ? 'What it does (goes into the prompt)' : '它在这里做什么（会写进提示词）'}</span>
          <textarea rows={2} value={sel.note} onChange={(e) => setPart(sel.id, () => ({ note: e.target.value }))} placeholder={en ? 'e.g. toggles notifications' : '例如：开关推送通知'} /></label>
        <div className="pg-row">
          <button type="button" className="pg-btn" onClick={() => duplicate(sel.id)}>{en ? 'Duplicate' : '复制一份'}</button>
          <button type="button" className="pg-btn pg-btn-danger" onClick={() => remove(sel.id)}>{en ? 'Delete' : '删除'}</button>
        </div>
      </div>}

      {tab === 'props' && !sel && <div className="pg-panel">
        <h3>{en ? 'Canvas' : '画布'}</h3>
        <Seg label={en ? 'Theme' : '主题'} en={en} value={state.theme} onChange={(v) => patch(() => ({ theme: v }))} opts={[{ v: 'light', zh: '浅', en: 'Light' }, { v: 'dark', zh: '深', en: 'Dark' }]} />
        <Seg label={en ? `Size · ${W}×${H}` : `尺寸 · ${W}×${H}`} en={en} value={String(state.size)} onChange={(v) => patch(() => ({ size: Number(v) }))} opts={SIZES.map(([w], i) => ({ v: String(i), zh: String(w), en: String(w) }))} />
        <label className="pg-field"><span>{en ? 'What are you making?' : '要做什么？'}</span>
          <textarea rows={3} value={state.intent} onChange={(e) => patch(() => ({ intent: e.target.value }))} placeholder={en ? 'e.g. a calm settings panel for a desktop app' : '例如：一个安静的桌面端设置面板'} /></label>
        <h4>{en ? 'Layers' : '图层'}</h4>
        <ol className="pg-layers">{state.parts.map(p => <li key={p.id}><button type="button" onClick={() => { setSelected(p.id); setMode('edit') }}>{en ? mods.UNIT_BY_ID[p.unitId]?.en : mods.UNIT_BY_ID[p.unitId]?.zh}<span>{p.x}, {p.y}</span></button></li>)}</ol>
        <p className="pg-hint">{en ? 'Drag to move · Shift+arrows nudge 8px · ⌫ delete · Ctrl+D duplicate · hold Alt to skip the grid' : '拖动移动 · Shift+方向键 8px · ⌫ 删除 · Ctrl+D 复制 · 按住 Alt 不吸附网格'}</p>
        <button type="button" className="pg-btn" onClick={() => { patch(() => INITIAL); setSelected(null) }}>{en ? 'Reset to example' : '恢复示例'}</button>
      </div>}

      {tab === 'prompt' && <div className="pg-panel">
        <textarea className="pg-code" readOnly value={spec?.error || spec?.prompt?.[promptLang] || ''} aria-label={en ? 'Prompt' : '提示词'} />
      </div>}
      {tab === 'spec' && <div className="pg-panel">
        <textarea className="pg-code" readOnly value={spec ? JSON.stringify(spec, null, 2) : ''} aria-label="Design Spec JSON" />
        <p className="pg-hint">{en ? 'Same shape the MCP tool compose_design_spec returns (Spec v1).' : '与 MCP 工具 compose_design_spec 返回的结构完全相同（Spec v1）。'}</p>
      </div>}
    </aside>
  </div>
}
