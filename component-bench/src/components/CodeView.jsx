import { useEffect, useState } from 'react'
import { Icon } from './Icon.jsx'

// Original source files, loaded only when the Source section opens.
const sources = import.meta.glob('../vendor/**/*.{tsx,ts,css}', { query: '?raw', import: 'default' })

function Section({ title, open, onToggle, onCopy, copied, children, meta }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-black/60 ring-1 ring-white/6">
      <div className="flex items-center gap-2 px-4 py-3">
        <button type="button" onClick={onToggle} className="flex flex-1 items-center gap-2 text-left text-sm font-medium text-white" aria-expanded={open}>
          <span className={`text-zinc-500 transition-transform ${open ? 'rotate-90' : ''}`}><Icon name="chevron" /></span>{title}
          {meta && <span className="text-xs font-normal text-zinc-500">{meta}</span>}
        </button>
        {onCopy && <button type="button" onClick={onCopy} className="rounded-md p-1.5 text-zinc-400 hover:bg-white/8 hover:text-white" title="Copy">{copied ? <Icon name="check" /> : <Icon name="copy" />}</button>}
      </div>
      {open && <div className="border-t border-white/6">{children}</div>}
    </div>
  )
}

function Code({ text }) {
  const lines = text.replace(/\n$/, '').split('\n')
  return (
    <pre className="bench-code scrollbar-thin max-h-[420px] overflow-auto p-4 text-zinc-200">
      {lines.map((line, i) => (
        <div key={i} className="flex"><span className="w-10 shrink-0 select-none pr-4 text-right text-zinc-600">{i + 1}</span><span className="whitespace-pre">{line || ' '}</span></div>
      ))}
    </pre>
  )
}

function SourceFiles({ entry, lang }) {
  const files = entry.source.files ?? []
  const [active, setActive] = useState(0)
  const [text, setText] = useState('')
  const file = files[active]
  useEffect(() => {
    if (!file) return
    let live = true
    const load = sources[`../${file.replace(/^src\//, '')}`]
    if (load) load().then(t => live && setText(t))
    else setText('')
    return () => { live = false }
  }, [file])
  if (!files.length) {
    const s = entry.source
    return (
      <div className="space-y-2 p-4 text-sm text-zinc-400">
        <p>{lang === 'en' ? `Published as the npm package ${s.packages.join(', ')}; the bench imports it as installed.` : `以 npm 包 ${s.packages.join('、')} 发布，演示台直接引用安装后的包。`}</p>
        <a className="inline-flex items-center gap-1 text-violet-300 hover:underline" href={`https://github.com/${s.repo}/tree/${s.commit}`} target="_blank" rel="noreferrer">{s.repo}@{s.commit.slice(0, 7)}<Icon name="external" /></a>
      </div>
    )
  }
  return (
    <div>
      {files.length > 1 && (
        <div className="flex gap-1 overflow-x-auto px-3 pt-3">
          {files.map((f, i) => <button key={f} type="button" onClick={() => setActive(i)} className={`whitespace-nowrap rounded-lg px-2.5 py-1 font-mono text-xs ${i === active ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>{f.split('/').pop()}</button>)}
        </div>
      )}
      <Code text={text || '…'} />
    </div>
  )
}

function ApiTable({ entry, values, lang }) {
  const [all, setAll] = useState(false)
  const [api, setApi] = useState(null)
  useEffect(() => { if (all && !api) import('../generated/api.json').then(m => setApi(m.default[entry.id])) }, [all, api, entry.id])
  const exposed = entry.controls.filter(c => !c.demo)
  const own = api ? Object.entries(api).flatMap(([name, e]) => e.props.map(p => ({ ...p, owner: name }))) : []
  const exposedProps = new Set(exposed.map(c => c.prop))
  const total = Object.values(entry.apiCounts).reduce((s, n) => s + n, 0)
  return (
    <div className="p-4 text-xs">
      <table className="w-full">
        <thead className="text-left text-zinc-500"><tr><th className="pb-2 font-normal">prop</th><th className="pb-2 font-normal">type</th><th className="pb-2 font-normal">{lang === 'en' ? 'default' : '源码默认'}</th><th className="pb-2 font-normal">{lang === 'en' ? 'now' : '当前'}</th></tr></thead>
        <tbody className="font-mono">
          {exposed.map(c => (
            <tr key={c.key} className="border-t border-white/5 align-top">
              <td className="py-1.5 pr-3 text-violet-200">{c.prop}</td>
              <td className="py-1.5 pr-3 text-zinc-400">{c.type}</td>
              <td className="py-1.5 pr-3 text-zinc-400">{c.sourceDefault === undefined ? '—' : typeof c.sourceDefault === 'object' ? c.sourceDefault.expression : JSON.stringify(c.sourceDefault)}</td>
              <td className="py-1.5 text-white">{JSON.stringify(values[c.key])}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" onClick={() => setAll(a => !a)} className="mt-3 text-zinc-400 hover:text-white">
        {lang === 'en' ? `${all ? 'Hide' : 'Show'} all ${total} own props` : `${all ? '收起' : '展开'}全部 ${total} 个自有 props（演示台开放 ${exposed.length} 个）`}
      </button>
      {all && (
        <ul className="mt-2 max-h-64 space-y-1 overflow-auto font-mono text-zinc-400">
          {own.map(p => <li key={`${p.owner}.${p.name}`} className={exposedProps.has(`${p.owner}.${p.name}`) ? 'text-violet-200' : ''}>{p.owner}.{p.name}{p.optional ? '?' : ''}: <span className="text-zinc-500">{p.type}</span></li>)}
        </ul>
      )}
    </div>
  )
}

export function CodeView({ entry, values, usage, lang, copy, copied }) {
  const [open, setOpen] = useState({ install: true, usage: true })
  const toggle = key => setOpen(o => ({ ...o, [key]: !o[key] }))
  const s = entry.source
  const t = (zh, en) => (lang === 'en' ? en : zh)
  return (
    <div className="scrollbar-thin m-2 mt-0 min-h-0 flex-1 space-y-2 overflow-y-auto">
      <Section title={t('安装', 'Install')} open={open.install} onToggle={() => toggle('install')} onCopy={() => copy('c-install', s.install)} copied={copied === 'c-install'}>
        <Code text={s.install} />
        {s.note && <p className="px-4 pb-3 text-xs text-amber-200/80">{s.note[lang]}</p>}
      </Section>
      <Section title={t('用法', 'Usage')} meta={t('随右侧参数实时更新', 'follows the panel')} open={open.usage} onToggle={() => toggle('usage')} onCopy={() => copy('c-usage', usage)} copied={copied === 'c-usage'}>
        <Code text={usage || '…'} />
      </Section>
      <Section title={t('源码', 'Source')} meta={s.files ? `${s.files.length} ${t('个文件', 'files')}` : 'npm'} open={open.source} onToggle={() => toggle('source')}>
        {open.source && <SourceFiles entry={entry} lang={lang} />}
      </Section>
      <Section title="API" meta={t('从类型定义提取', 'from the type definitions')} open={open.api} onToggle={() => toggle('api')}>
        <ApiTable entry={entry} values={values} lang={lang} />
      </Section>
      <Section title={t('来源与许可', 'Source & license')} open={open.license ?? true} onToggle={() => setOpen(o => ({ ...o, license: !(o.license ?? true) }))}>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 p-4 text-sm">
          <dt className="text-zinc-500">{t('路线', 'Lane')}</dt><dd className="text-zinc-200">{entry.lane === 'registry' ? t('站点公开的 shadcn registry，直接返回源码', 'Public shadcn registry on the site, serving full source') : t('GitHub 仓库，固定到提交', 'GitHub repository, pinned to a commit')}</dd>
          <dt className="text-zinc-500">{t('仓库', 'Repo')}</dt><dd><a className="text-violet-300 hover:underline" href={`https://github.com/${s.repo}/tree/${s.commit}${s.path ? `/${s.path}` : ''}`} target="_blank" rel="noreferrer">{s.repo}@{s.commit.slice(0, 7)}</a></dd>
          {s.registryItem && <><dt className="text-zinc-500">registry</dt><dd><a className="break-all text-violet-300 hover:underline" href={s.registryItem} target="_blank" rel="noreferrer">{s.registryItem}</a></dd></>}
          <dt className="text-zinc-500">{t('许可', 'License')}</dt><dd><a className="text-violet-300 hover:underline" href={s.licenseUrl} target="_blank" rel="noreferrer">{s.license}</a> <span className="text-zinc-500">{t('（上游 LICENSE 已核对）', '(upstream LICENSE checked)')}</span></dd>
        </dl>
      </Section>
    </div>
  )
}
