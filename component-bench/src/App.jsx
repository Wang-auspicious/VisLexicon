import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Gallery } from './components/Gallery.jsx'
import { Detail } from './components/Detail.jsx'
import { Icon } from './components/Icon.jsx'
import { CATEGORIES, ENTRIES, LANES, byId } from './lib/model.js'
import { useBenchSearch } from './lib/search.js'
import { availabilityOf, mergeCatalog, readCatalog, readCatalogShards } from './lib/remote-catalog.js'

// ?stress=20000 repeats the catalogue to check scrolling at ingest scale.
const params = new URLSearchParams(location.search)
const STRESS = Math.min(Number(params.get('stress')) || 0, 50000)
const resolve = e => (e.base ? byId[e.base] : e)

function JevChip() {
  const [status, setStatus] = useState(null)
  useEffect(() => {
    let live = true
    const read = () => fetch('/api/jev/status').then(r => r.json()).then(s => live && setStatus(s)).catch(() => live && setStatus({ configured: false }))
    read()
    const timer = setInterval(read, 15000)
    return () => { live = false; clearInterval(timer) }
  }, [])
  if (!status) return null
  const ok = status.configured && !status.lastError
  return (
    <span title={status.configured ? `${status.model} · ${status.requests ?? 0} 次请求，${status.cached ?? 0} 次命中缓存` : '未配置 Jev'}
      className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ring-1 md:inline-flex ${ok ? 'text-emerald-200 ring-emerald-300/20' : 'text-amber-200 ring-amber-300/20'}`}>
      <span className={`size-1.5 rounded-full ${ok ? 'bg-emerald-400' : 'bg-amber-400'}`} />
      Jev {status.configured ? (status.lastError ? (status.lastError === 'JEV_HTTP_429' ? '额度用完' : '暂不可用') : '就绪') : '未配置'} · {status.requests ?? 0} req
    </span>
  )
}

function SearchStatus({ result, query, scopeSize }) {
  const { jev, lang, localCount } = result
  if (!query.trim()) return null
  const t = (zh, en) => (lang === 'en' ? en : zh)
  let text = t(`本地命中 ${localCount} 个`, `${localCount} local matches`)
  if (jev?.state === 'waiting') text += t(' · 停顿后交给 Jev 判断', ' · Jev judges when you pause')
  if (jev?.state === 'running') text += t(` · Jev 正在判断 ${jev.candidates.length} 个候选${jev.refine ? '（在上次结果里缩小）' : ''}…`, ` · Jev is judging ${jev.candidates.length} candidates${jev.refine ? ' (inside the last matches)' : ''}…`)
  if (jev?.state === 'done') text += t(` · Jev 判断 ${jev.candidates.length} 个候选，${jev.matches.length} 个符合 · ${jev.cached ? '缓存' : `${(jev.latencyMs / 1000).toFixed(1)}s`}`, ` · Jev judged ${jev.candidates.length}, ${jev.matches.length} fit · ${jev.cached ? 'cached' : `${(jev.latencyMs / 1000).toFixed(1)}s`}`)
  if (jev?.state === 'error') text += jev.error === 'JEV_HTTP_429' ? t(' · Jev 免费额度用完，先用本地结果', ' · Jev free quota used up; showing local results') : t(' · Jev 暂不可用，先用本地结果', ' · Jev unavailable; showing local results')
  return <p className="text-xs text-zinc-500" aria-live="polite">{text}<span className="text-zinc-600"> · {t(`范围 ${scopeSize} 个`, `scope ${scopeSize}`)}</span></p>
}

export default function App() {
  const [category, setCategory] = useState('all')
  const [lane, setLane] = useState('all')
  const [library, setLibrary] = useState('all')
  const [availability, setAvailability] = useState('usable')
  const [catalog, setCatalog] = useState(ENTRIES)
  const [catalogState, setCatalogState] = useState('loading')
  const [catalogProgress, setCatalogProgress] = useState({ loaded: 0, total: 0, failed: 0 })
  const [catalogRevision, setCatalogRevision] = useState(0)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(() => params.get('c'))
  const input = useRef(null)
  useEffect(() => {
    const controller = new AbortController()
    let manifestLoaded = false
    setCatalogState('loading')
    readCatalog(controller.signal).then(async data => {
      if (controller.signal.aborted) return
      manifestLoaded = true
      setCatalog(current => mergeCatalog(current, data))
      setCatalogState(data.shards?.length ? 'indexing' : 'ready')
      const result = await readCatalogShards(data, { signal: controller.signal, onChunk: rows => { if (!controller.signal.aborted) startTransition(() => setCatalog(current => mergeCatalog(current, rows))) }, onProgress: progress => { if (!controller.signal.aborted) setCatalogProgress(progress) } })
      if (!controller.signal.aborted) setCatalogState(result.failed.length ? 'partial' : 'ready')
    }).catch(() => { if (!controller.signal.aborted) setCatalogState(manifestLoaded ? 'partial' : 'unavailable') })
    return () => controller.abort()
  }, [catalogRevision])
  const all = useMemo(() => STRESS ? Array.from({ length: STRESS }, (_, i) => ({ ...ENTRIES[i % ENTRIES.length], id: `${ENTRIES[i % ENTRIES.length].id}~${i}`, base: ENTRIES[i % ENTRIES.length].id })) : catalog, [catalog])
  const allById = useMemo(() => Object.fromEntries(catalog.map(e => [e.id, e])), [catalog])
  const libraries = useMemo(() => [...new Set(all.map(e => e.source.site))].filter(Boolean).sort((a, b) => a.localeCompare(b)), [all])

  // Filters narrow the scope first; search and Jev work only inside it.
  const available = useMemo(() => all.filter(e => availability === 'all' || (availability === 'usable' ? availabilityOf(e) !== 'reference' : availabilityOf(e) === availability)), [all, availability])
  const laneScope = useMemo(() => available.filter(e => (lane === 'all' || e.lane === lane) && (library === 'all' || e.source.site === library)), [available, lane, library])
  const scope = useMemo(() => laneScope.filter(e => category === 'all' || e.category === category), [laneScope, category])
  const result = useBenchSearch(scope, query)
  const lang = result.lang
  const judged = result.jev?.state === 'done' ? new Set(result.jev.matches) : null

  const openEntry = useCallback(id => {
    setOpen(id)
    const url = new URL(location.href); url.searchParams.set('c', id); history.pushState(null, '', url)
  }, [])
  const close = useCallback(() => {
    setOpen(null)
    const url = new URL(location.href); url.searchParams.delete('c'); history.pushState(null, '', url)
  }, [])
  useEffect(() => {
    const pop = () => setOpen(new URLSearchParams(location.search).get('c'))
    addEventListener('popstate', pop)
    const key = e => {
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !e.target.closest('input, textarea'))) { e.preventDefault(); input.current?.focus() }
    }
    addEventListener('keydown', key)
    return () => { removeEventListener('popstate', pop); removeEventListener('keydown', key) }
  }, [])
  const list = useMemo(() => [...new Map(result.items.map(resolve).map(e => [e.id, e])).values()], [result.items])
  const step = useCallback(delta => {
    const ids = list.length ? list.map(e => e.id) : ENTRIES.map(e => e.id)
    const at = ids.indexOf(open)
    openEntry(ids[(at + delta + ids.length) % ids.length])
  }, [list, open, openEntry])

  const counts = useMemo(() => Object.fromEntries(CATEGORIES.map(c => [c.id, laneScope.filter(e => e.category === c.id).length])), [laneScope])
  const scopeName = category === 'all' ? (lang === 'en' ? 'all' : '全部') : CATEGORIES.find(c => c.id === category)[lang]
  const current = open && allById[open]

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-40 border-b border-white/6 bg-[color-mix(in_srgb,var(--bench-bg)_86%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 py-3 md:px-6">
          <div className="shrink-0">
            <div className="text-[15px] font-semibold text-white">VisLexicon <span className="text-zinc-500">组件台</span></div>
            <div className="text-[11px] text-zinc-500">{all.length.toLocaleString()} {lang === 'en' ? 'resources' : '项资源'}{STRESS ? (lang === 'en' ? ' (stress test)' : '（压力测试）') : ''}</div>
          </div>
          <label className="relative flex min-w-0 flex-1 items-center">
            <span className="pointer-events-none absolute left-3.5 text-zinc-500"><Icon name="search" /></span>
            <input ref={input} value={query} onChange={e => setQuery(e.target.value)} type="search"
              placeholder={lang === 'en' ? `Search ${scopeName} (${scope.length}) — describe look, behaviour or use` : `在「${scopeName}」${scope.length} 个里搜：说外观、行为或用途都行`}
              className="h-11 w-full rounded-full bg-[var(--bench-panel)] pl-11 pr-16 text-[15px] text-white outline-none ring-1 ring-white/8 placeholder:text-zinc-500 focus:ring-violet-400/60" />
            <kbd className="pointer-events-none absolute right-4 hidden rounded border border-white/10 px-1.5 text-[11px] text-zinc-500 md:block">Ctrl K</kbd>
          </label>
          <JevChip />
          <a href="/#/components" className="shrink-0 text-xs text-zinc-400 hover:text-white">{lang === 'en' ? 'Back to site' : '返回网站'}</a>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-5 md:px-6">
        <nav className="sticky top-[84px] hidden h-fit w-52 shrink-0 space-y-6 md:block" aria-label="筛选">
          <div>
            <div className="mb-2 px-2 text-[11px] uppercase tracking-wide text-zinc-500">{lang === 'en' ? 'Source' : '来源'}</div>
            {[['all', lang === 'en' ? 'All sources' : '全部来源'], ...Object.entries(LANES).map(([id, l]) => [id, l[lang]])].map(([id, text]) => (
              <button key={id} type="button" onClick={() => setLane(id)} aria-pressed={lane === id}
                className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm ${lane === id ? 'bg-white/8 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}>
                {text}<span className="text-xs text-zinc-600">{(id === 'all' ? all : all.filter(e => e.lane === id)).length}</span>
              </button>
            ))}
          </div>
          <div>
            <div className="mb-2 px-2 text-[11px] uppercase tracking-wide text-zinc-500">{lang === 'en' ? 'Category' : '分类'}</div>
            {[{ id: 'all', zh: '全部', en: 'All' }, ...CATEGORIES].map(c => (
              <button key={c.id} type="button" onClick={() => setCategory(c.id)} aria-pressed={category === c.id} disabled={c.id !== 'all' && !counts[c.id]}
                className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm disabled:opacity-30 ${category === c.id ? 'bg-white/8 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}>
                {c[lang]}<span className="text-xs text-zinc-600">{c.id === 'all' ? laneScope.length : counts[c.id]}</span>
              </button>
            ))}
          </div>
        </nav>

        <main className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
            <label className="flex items-center gap-2">{lang === 'en' ? 'Available as' : '资源内容'}<select value={availability} onChange={e => setAvailability(e.target.value)} className="max-w-[220px] rounded-lg bg-[var(--bench-panel)] px-2 py-2 text-zinc-300 ring-1 ring-white/10">{[['usable', '预览、源码与截图', 'Previews, source & screenshots'], ['live', '实时预览', 'Interactive previews'], ['source', '完整源码（未验证预览）', 'Full source (preview unverified)'], ['screenshot', '原站截图', 'Original screenshots'], ['reference', '原站条目（未归档源码）', 'Original listings (no archived source)'], ['all', '全部条目', 'All entries']].map(([value, zh, en]) => <option key={value} value={value}>{lang === 'en' ? en : zh}</option>)}</select></label>
            <label className="flex items-center gap-2">{lang === 'en' ? 'Library' : '组件库'}<select value={library} onChange={e => setLibrary(e.target.value)} className="max-w-[240px] rounded-lg bg-[var(--bench-panel)] px-2 py-2 text-zinc-300 ring-1 ring-white/10"><option value="all">{lang === 'en' ? 'All libraries' : '全部组件库'}</option>{libraries.map(name => <option key={name} value={name}>{name}</option>)}</select></label>
            <label className="flex items-center gap-2 md:hidden">{lang === 'en' ? 'Source' : '来源'}<select value={lane} onChange={e => setLane(e.target.value)} className="max-w-[190px] rounded-lg bg-[var(--bench-panel)] px-2 py-2 text-zinc-300 ring-1 ring-white/10"><option value="all">{lang === 'en' ? 'All sources' : '全部来源'}</option>{Object.entries(LANES).map(([id, value]) => <option key={id} value={id}>{value[lang]}</option>)}</select></label>
            <span>{lang === 'en' ? 'Interactive previews, source resources and original screenshots are labeled separately.' : '实时预览、源码资源和原站截图分别标明。'}</span>
          </div>
          {catalogState === 'loading' && <p role="status" className="text-xs text-zinc-500">{lang === 'en' ? 'Loading source catalog…' : '正在读取源码目录…'}</p>}
          {catalogState === 'indexing' && <p role="status" className="text-xs text-zinc-500">{lang === 'en' ? `Loading catalog ${catalogProgress.loaded.toLocaleString()} / ${catalogProgress.total.toLocaleString()}; search covers loaded entries.` : `目录读取中 ${catalogProgress.loaded.toLocaleString()} / ${catalogProgress.total.toLocaleString()}；当前搜索覆盖已加载条目。`}</p>}
          {['unavailable', 'partial'].includes(catalogState) && <p role="status" className="text-xs text-amber-200/80">{catalogState === 'partial' ? (lang === 'en' ? `Some catalog batches could not load; showing loaded entries (${catalogProgress.loaded.toLocaleString()} / ${catalogProgress.total.toLocaleString()}).` : `部分目录未能加载，当前显示已读条目（${catalogProgress.loaded.toLocaleString()} / ${catalogProgress.total.toLocaleString()}）。`) : (lang === 'en' ? 'Source catalog is unavailable; showing loaded examples.' : '全量源码目录暂不可用，当前显示已加载的样例。')} <button type="button" onClick={() => setCatalogRevision(value => value + 1)} className="underline">{lang === 'en' ? 'Retry' : '重试'}</button></p>}
          {/* Narrow screens keep every filter reachable in a scrollable strip. */}
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:hidden">
            {[{ id: 'all', zh: '全部', en: 'All' }, ...CATEGORIES.filter(c => counts[c.id])].map(c => (
              <button key={c.id} type="button" onClick={() => setCategory(c.id)} className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${category === c.id ? 'bg-white text-black' : 'bg-white/6 text-zinc-300'}`}>{c[lang]}</button>
            ))}
          </div>
          <SearchStatus result={result} query={query} scopeSize={scope.length} />
          {list.length
            ? <Gallery items={result.items} lang={lang} onOpen={openEntry} resolve={resolve} judged={judged} />
            : <div className="grid h-64 place-items-center rounded-3xl text-sm text-zinc-500 ring-1 ring-white/6">{['loading', 'indexing', 'partial'].includes(catalogState) ? (lang === 'en' ? 'No match in the loaded entries; the catalog is not fully loaded.' : '已加载条目中暂无匹配，目录尚未完整读取。') : (lang === 'en' ? 'Nothing in this scope matches yet.' : '这个范围里还没有符合的组件。')}</div>}
        </main>
      </div>
      {current && <Detail entry={current} lang={lang} onClose={close} onStep={step} />}
    </div>
  )
}
