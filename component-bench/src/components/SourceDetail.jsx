import { useDeferredValue, useEffect, useRef, useState } from 'react'
import { Controls } from './Controls.jsx'
import { readDetail } from '../lib/remote-catalog.js'
import { defaults, nameOf } from '../lib/model.js'
import { Icon } from './Icon.jsx'
import { LaneBadge, useCopy } from './Detail.jsx'
import { Description } from './Description.jsx'

function download(name, content, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a'); link.href = url; link.download = name; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function SourceDetail({ entry, lang, onClose }) {
  const [view, setView] = useState({ entry, loading: true, error: null })
  const [retry, setRetry] = useState(0)
  const [mode, setMode] = useState(entry.previewUrl || entry.lane === 'screenshot' ? 'preview' : 'source')
  const [active, setActive] = useState(0)
  const [frame, setFrame] = useState(0)
  const [values, setValues] = useState(() => defaults(entry))
  const [copied, copy] = useCopy()
  const iframe = useRef(null)
  const shown = useDeferredValue(values)
  const item = view.entry
  const t = (zh, en) => lang === 'en' ? en : zh
  const files = item.files ?? []
  const file = files[active]
  const license = item.licenseRecord ?? {}
  const availabilityNote = !item.sourceAvailable
    ? t('此项未归档可分发的源码文件，保留原站入口与许可信息。', 'Redistributable source files are not archived for this entry. Open the original listing and license information.')
    : item.supportResource
      ? t('这是源码依赖或工具文件，完整保留，但不作为独立组件预览。', 'This is a source dependency or utility file. It is preserved in full and is not rendered as a standalone component.')
      : item.framework && item.framework !== 'react'
        ? t(`这份源码使用 ${item.framework}，当前尚未提供本地交互预览。`, `This source uses ${item.framework}; a local interactive preview is not available yet.`)
        : t('完整源码已收录，此项尚未通过本地交互预览验证。', 'Complete source is indexed; a local interactive preview has not passed verification yet.')
  const post = () => iframe.current?.contentWindow?.postMessage({ type: 'vislexicon:props', values: shown }, '*')
  useEffect(() => {
    const controller = new AbortController()
    readDetail(entry, controller.signal)
      .then(data => { setView({ entry: data, loading: false, error: null }); setValues(defaults(data)) })
      .catch(error => { if (!controller.signal.aborted) setView({ entry, loading: false, error: error.message }) })
    return () => controller.abort()
  }, [entry, retry])
  useEffect(post, [shown, item.previewUrl])
  const bundle = () => download(`${item.id}.json`, JSON.stringify({ ...item, files, license }, null, 2), 'application/json;charset=utf-8')
  const prompt = [t(`使用 ${item.source.site} 的 ${item.name ?? item.en}。`, `Use ${item.name ?? item.en} from ${item.source.site}.`), item.source.page, item.source.install, `${t('许可', 'License')}: ${license.spdx ?? 'unknown'} ${license.url ?? ''}`, item.previewUrl ? `${t('当前参数', 'Current props')}: ${JSON.stringify(values)}` : '', t('请保留完整版权与许可声明，并按原始文件依赖接入。', 'Retain the full copyright and license notices and resolve the original file dependencies.')].filter(Boolean).join('\n')
  return <>
    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[28px] bg-[var(--bench-panel)] ring-1 ring-white/8">
      <header className="flex flex-wrap items-center justify-between gap-2 p-3">
        <div className="flex rounded-full bg-black/40 p-1">
          {[(item.previewUrl || item.poster || item.frames?.length) && ['preview', t('预览', 'Preview')], ['source', item.sourceAvailable ? t('源码', 'Source') : t('原站条目', 'Original listing')], ['license', t('来源与许可', 'Source & license')]].filter(Boolean).map(([id, label]) => <button key={id} type="button" aria-pressed={mode === id} onClick={() => setMode(id)} className={`rounded-full px-3 py-1.5 text-[13px] ${mode === id ? 'bg-zinc-950 text-white ring-1 ring-white/10' : 'text-zinc-400 hover:text-white'}`}>{label}</button>)}
        </div>
        <button type="button" onClick={() => copy('prompt', prompt)} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black">{copied === 'prompt' ? t('已复制', 'Copied') : t('复制提示词', 'Copy prompt')}</button>
      </header>
      {view.loading && <p className="px-5 text-xs text-zinc-500" role="status">{t('正在读取完整文件…', 'Loading full files…')}</p>}
      {view.error && <p className="px-5 py-3 text-sm text-amber-200" role="alert">{t('完整文件读取失败。', 'Full files could not load.')} <button type="button" onClick={() => setRetry(n => n + 1)} className="underline">{t('重试', 'Retry')}</button></p>}
      {mode === 'preview' && <div className="relative m-2 mt-0 min-h-0 flex-1 overflow-hidden rounded-[22px] bg-[#101012]">
        {item.previewUrl ? <iframe ref={iframe} title={nameOf(item, lang)} src={item.previewUrl} sandbox="allow-scripts" referrerPolicy="no-referrer" onLoad={post} className="h-full w-full border-0 bg-white" /> : item.poster ? <img src={item.frames?.[frame]?.src ?? item.poster} alt={nameOf(item, lang)} className="h-full w-full object-contain p-5" /> : null}
        {item.frames?.length > 1 && <div className="absolute bottom-3 left-3 flex gap-2">{item.frames.map((f, i) => <button key={i} type="button" onClick={() => setFrame(i)} aria-pressed={frame === i} className={`rounded-full px-3 py-1 text-xs ${frame === i ? 'bg-white text-black' : 'bg-black/80 text-zinc-300'}`}>{f.label ?? f.kind ?? i + 1}</button>)}</div>}
      </div>}
      {mode === 'source' && <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex shrink-0 gap-1 overflow-x-auto px-3 pb-2">{files.map((f, i) => <button key={`${f.path}-${i}`} type="button" onClick={() => setActive(i)} className={`whitespace-nowrap rounded-lg px-2.5 py-1 font-mono text-xs ${i === active ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>{f.path}</button>)}</div>
        {file ? <><div className="flex shrink-0 justify-end gap-3 px-5 text-xs text-zinc-400"><button type="button" onClick={() => copy('file', file.content)}>{copied === 'file' ? t('已复制', 'Copied') : t('复制文件', 'Copy file')}</button><button type="button" onClick={() => download(file.path.split('/').pop(), file.content)}>{t('下载文件', 'Download file')}</button></div><pre className="bench-code scrollbar-thin m-2 min-h-0 flex-1 overflow-auto rounded-[22px] bg-black/30 p-5 text-xs leading-6 text-zinc-300"><code>{file.content}</code></pre></> : !view.loading && <div className="space-y-4 p-6 text-sm leading-6 text-zinc-400"><p>{availabilityNote}</p>{item.source.page && <a className="text-violet-300 underline" href={item.source.page} target="_blank" rel="noreferrer">{t('打开原始来源', 'Open original source')}</a>}</div>}
      </div>}
      {mode === 'license' && <div className="scrollbar-thin min-h-0 flex-1 space-y-4 overflow-auto p-5 text-sm leading-6 text-zinc-300">
        <dl className="space-y-2"><div><dt className="text-zinc-500">{t('来源', 'Source')}</dt><dd><a className="break-all text-violet-300 underline" href={item.source.page} target="_blank" rel="noreferrer">{item.source.page}</a></dd></div>{item.registryUrl && <div><dt className="text-zinc-500">registry</dt><dd><a className="break-all text-violet-300 underline" href={item.registryUrl} target="_blank" rel="noreferrer">{item.registryUrl}</a></dd></div>}{item.commit && <div><dt className="text-zinc-500">{t('固定提交', 'Pinned commit')}</dt><dd className="break-all font-mono text-xs">{item.commit}</dd></div>}<div><dt className="text-zinc-500">{t('许可证', 'License')}</dt><dd>{license.url ? <a className="text-violet-300 underline" href={license.url} target="_blank" rel="noreferrer">{license.spdx ?? t('未识别', 'Unidentified')}</a> : license.spdx ?? t('待核验', 'Unverified')}{license.verifiedAt && <span className="ml-2 text-xs text-zinc-500">{license.verifiedAt}</span>}</dd></div></dl>
        {license.text && <><button type="button" className="text-xs text-violet-300" onClick={() => download('LICENSE.txt', license.text)}>{t('下载完整许可证', 'Download full license')}</button><pre className="whitespace-pre-wrap rounded-xl bg-black/30 p-4 font-mono text-xs leading-5 text-zinc-400">{license.text}</pre></>}
        {!!item.dependencies?.length && <div><h3 className="mb-2 text-zinc-500">{t('依赖', 'Dependencies')}</h3><pre className="whitespace-pre-wrap font-mono text-xs">{item.dependencies.join('\n')}</pre></div>}
        {!!item.registryDependencies?.length && <div><h3 className="mb-2 text-zinc-500">registry dependencies</h3><pre className="whitespace-pre-wrap font-mono text-xs">{item.registryDependencies.join('\n')}</pre></div>}
      </div>}
    </section>
    <aside className="scrollbar-thin flex w-full shrink-0 flex-col overflow-y-auto rounded-[28px] bg-[var(--bench-panel)] p-6 ring-1 ring-white/8 md:w-[340px]">
      <div className="flex items-start justify-between gap-3"><h2 className="min-w-0 break-words text-xl font-semibold text-white">{nameOf(item, lang)}</h2><button type="button" onClick={onClose} aria-label={t('关闭', 'Close')} className="shrink-0 text-zinc-400"><Icon name="close" /></button></div>
      <div className="mt-3 flex flex-wrap gap-2"><LaneBadge entry={item} lang={lang} /><span className="rounded-full bg-white/6 px-2 py-0.5 text-[11px] text-zinc-300">{license.spdx ?? t('许可待核验', 'License unverified')}</span><span className="rounded-full bg-white/6 px-2 py-0.5 text-[11px] text-zinc-300">{item.previewUrl ? t('实时预览', 'Interactive') : item.lane === 'screenshot' ? t('原站截图', 'Original screenshot') : item.sourceAvailable ? t('源码资源', 'Source resource') : t('未归档源码', 'Source not archived')}</span></div>
      <div className="mt-4"><Description text={lang === 'en' ? item.summaryEn : item.summaryZh} /></div>
      {item.controls.length > 0 && <div className="mt-5"><p className="mb-3 text-xs text-zinc-500">{t('组件源码中提取的参数', 'Props extracted from the component source')}</p><Controls controls={item.controls} values={values} lang={lang} onChange={(key, value) => setValues(old => ({ ...old, [key]: value }))} /></div>}
      {!item.previewUrl && item.lane !== 'screenshot' && <p className="mt-5 rounded-xl bg-amber-400/8 p-3 text-xs leading-5 text-amber-100/80 ring-1 ring-amber-300/15">{availabilityNote}</p>}
      <div className="mt-auto space-y-3 pt-6">
        {files.length > 0 && <button type="button" onClick={bundle} className="w-full rounded-full py-3 text-sm text-zinc-200 ring-1 ring-white/12">{t('下载全部源码与许可', 'Download source & license')}</button>}
        {item.source.install && <button type="button" onClick={() => copy('install', item.source.install)} className="w-full break-all rounded-xl p-3 text-left font-mono text-xs text-zinc-300 ring-1 ring-white/12">{copied === 'install' ? t('已复制安装命令', 'Install command copied') : item.source.install}</button>}
        {item.source.page && <a href={item.source.page} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-medium text-black">{t('打开原始来源', 'Open original source')}<Icon name="external" /></a>}
      </div>
    </aside>
  </>
}
