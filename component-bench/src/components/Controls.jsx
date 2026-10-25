import { memo } from 'react'

const label = (c, lang) => lang === 'en' ? c.labelEn : c.labelZh
const fmt = (v, c) => `${Number.isInteger(c.step ?? 1) ? v : Number(v).toFixed(String(c.step).split('.')[1]?.length ?? 2)}${c.unit ? (c.unit === '%' ? '%' : ` ${c.unit}`) : ''}`

function Title({ c, lang }) {
  const tip = [c.prop ? `prop: ${c.prop}` : (lang === 'en' ? 'demo content, not a prop' : '演示内容，不是组件参数'), c.type && `type: ${c.type}`, c.sourceDefault !== undefined && `default: ${JSON.stringify(c.sourceDefault)}`, c.doc].filter(Boolean).join('\n')
  return (
    <span title={tip} className="flex items-center gap-1.5">
      <span>{label(c, lang)}</span>
      {c.demo && <span className="rounded bg-white/8 px-1 text-[10px] text-zinc-400">{lang === 'en' ? 'demo' : '演示'}</span>}
    </span>
  )
}

function Segmented({ options, value, onChange, render = o => o }) {
  return (
    <div className="flex rounded-full bg-[var(--bench-panel-2)] p-1">
      {options.map(o => (
        <button key={String(o)} type="button" onClick={() => onChange(o)} aria-pressed={value === o}
          className={`rounded-full px-3 py-1.5 text-[13px] transition-colors ${value === o ? 'bg-zinc-950 text-white shadow ring-1 ring-white/10' : 'text-zinc-400 hover:text-zinc-200'}`}>
          {render(o)}
        </button>
      ))}
    </div>
  )
}

function Control({ c, value, onChange, lang }) {
  if (c.kind === 'slider') {
    const pct = ((value - c.min) / (c.max - c.min)) * 100
    return (
      <label className="bench-range block">
        <span className="fill" style={{ width: `${pct}%` }} />
        <input type="range" min={c.min} max={c.max} step={c.step ?? 1} value={value} aria-label={label(c, lang)}
          onChange={e => onChange(Number(e.target.value))} />
        <span className="row"><span className="text-zinc-300"><Title c={c} lang={lang} /></span><span className="font-medium tabular-nums text-white">{fmt(value, c)}</span></span>
      </label>
    )
  }
  if (c.kind === 'toggle' || c.kind === 'segmented') {
    const options = c.kind === 'toggle' ? [false, true] : c.options
    const render = c.kind === 'toggle' ? o => (o ? (lang === 'en' ? 'On' : '开') : (lang === 'en' ? 'Off' : '关')) : o => o
    return (
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-zinc-300"><Title c={c} lang={lang} /></span>
        <Segmented options={options} value={value} onChange={onChange} render={render} />
      </div>
    )
  }
  if (c.kind === 'color') {
    return (
      <label className="flex h-11 items-center justify-between rounded-xl bg-[var(--bench-panel-2)] px-3.5 text-sm">
        <span className="text-zinc-300"><Title c={c} lang={lang} /></span>
        <span className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase text-zinc-300">{value}</span>
          <span className="relative size-6 overflow-hidden rounded-md ring-1 ring-white/20" style={{ background: value }}>
            <input type="color" value={value} onChange={e => onChange(e.target.value)} className="absolute inset-0 size-full cursor-pointer opacity-0" aria-label={label(c, lang)} />
          </span>
        </span>
      </label>
    )
  }
  if (c.kind === 'textarea') {
    return (
      <label className="block text-sm">
        <span className="mb-1.5 block text-zinc-300"><Title c={c} lang={lang} /></span>
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={7} spellCheck={false}
          className="bench-code scrollbar-thin w-full resize-y rounded-xl bg-[var(--bench-panel-2)] p-3 text-zinc-200 outline-none focus:ring-2 focus:ring-violet-500/60" />
      </label>
    )
  }
  return (
    <label className="flex h-11 items-center justify-between gap-3 rounded-xl bg-[var(--bench-panel-2)] px-3.5 text-sm">
      <span className="shrink-0 text-zinc-300"><Title c={c} lang={lang} /></span>
      <input type={c.kind === 'number' ? 'number' : 'text'} step={c.kind === 'number' ? c.step ?? 'any' : undefined} min={c.min} max={c.max} value={value} onChange={e => { const next = c.kind === 'number' ? e.target.valueAsNumber : e.target.value; if (typeof next !== 'number' || Number.isFinite(next)) onChange(next) }} className="min-w-0 flex-1 bg-transparent text-right text-white outline-none" />
    </label>
  )
}

export const Controls = memo(function Controls({ controls, values, onChange, lang }) {
  return (
    <div className="space-y-2.5">
      {controls.map(c => <Control key={c.key} c={c} value={values[c.key]} lang={lang} onChange={v => onChange(c.key, v)} />)}
    </div>
  )
})
