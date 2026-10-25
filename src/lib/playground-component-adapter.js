import { readComponentDetail } from './component-code-details.js'

const STORE_KEY = 'vl-playground-v1'
const controlsOf = item => item.preview?.controls ?? item.controls ?? []
const kindOf = control => control.kind ?? ({ select: 'segmented', boolean: 'toggle' }[control.control] ?? control.control ?? 'text')
const localText = (text, lang) => typeof text === 'string' ? text : text?.[lang] ?? text?.en ?? text?.zh ?? ''
const primitive = value => ['string', 'number', 'boolean'].includes(typeof value) && (typeof value !== 'number' || Number.isFinite(value))

export function verifiedComponentPreview(item) {
  if (item.preview?.status !== 'verified') return null
  const url = item.preview.url ?? item.previewUrl
  if (/^\/data\/component-code\/previews\/[\w.-]+\/index\.html$/.test(url ?? '')) return url
  if (/^\/component-bench\/\?solo=[\w-]+(?:&embed=1)?$/.test(url ?? '')) return url + (url.includes('embed=1') ? '' : '&embed=1')
  return null
}

export function componentValues(item, values = {}) {
  return Object.fromEntries(controlsOf(item).map(control => {
    let value = primitive(values[control.key]) ? values[control.key] : control.default ?? ''
    const kind = kindOf(control)
    if (kind === 'toggle') value = Boolean(value)
    if (kind === 'slider' || kind === 'number') {
      value = Number(value)
      if (!Number.isFinite(value)) value = Number(control.default) || 0
      if (Number.isFinite(control.min)) value = Math.max(control.min, value)
      if (Number.isFinite(control.max)) value = Math.min(control.max, value)
    }
    if (kind === 'segmented' && !control.options?.includes(value)) value = control.default ?? control.options?.[0] ?? ''
    return [control.key, value]
  }))
}

export function addComponentToPlayground({ item, unit, values }, storage = globalThis.localStorage) {
  if (!item?.id || !verifiedComponentPreview(item)) throw Error('This component has no verified live renderer.')
  let state = null
  try { state = JSON.parse(storage.getItem(STORE_KEY) ?? 'null') } catch { throw Error('The saved canvas could not be read.') }
  if (state !== null && (!Array.isArray(state.parts) || typeof state !== 'object')) throw Error('The saved canvas could not be read.')
  state ??= { title: '', intent: '', theme: 'light', size: 1, parts: [] }
  const detailUrl = unit.codeResource?.detailUrl ?? `/data/component-code/items/${encodeURIComponent(item.id)}.json`
  const component = {
    id: item.id, detailUrl, nameZh: unit.nameZh ?? localText(item.title ?? item.name, 'zh'), nameEn: unit.nameEn ?? localText(item.title ?? item.name, 'en'),
    sourceUrl: item.sourceUrl ?? item.source?.page ?? unit.sourceUrl,
    license: { spdx: item.license?.spdx ?? item.source?.license, url: item.license?.url ?? item.source?.licenseUrl },
    commit: item.commit ?? item.source?.commit,
    poster: item.preview?.posterUrl ?? item.poster,
    controls: controlsOf(item).map(control => Object.fromEntries(['key', 'kind', 'control', 'labelZh', 'labelEn', 'default', 'min', 'max', 'step', 'unit', 'options'].filter(key => control[key] !== undefined).map(key => [key, control[key]]))),
  }
  const existing = state.parts.find(part => part.component?.id === item.id)
  const id = existing?.id ?? `source-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
  const part = { id, unitId: `source:${item.id}`, component, values: componentValues(item, values), x: existing?.x ?? 520, y: existing?.y ?? 320, note: existing?.note ?? '' }
  const next = { ...state, parts: existing ? state.parts.map(previous => previous.id === id ? part : previous) : [...state.parts, part] }
  const serialized = JSON.stringify(next)
  storage.setItem(STORE_KEY, serialized)
  if (storage.getItem(STORE_KEY) !== serialized) throw Error('The canvas could not be saved.')
  return part
}

function sourceUnit(item, snapshot, loadError) {
  const previewUrl = verifiedComponentPreview(item)
  const controls = controlsOf(item)
  const title = lang => snapshot[lang === 'en' ? 'nameEn' : 'nameZh'] || localText(item.title ?? item.name, lang) || item.id
  const params = controls.map(control => {
    const kind = kindOf(control)
    return { k: control.key, zh: control.labelZh ?? control.key, en: control.labelEn ?? control.key, def: control.default ?? '', kind: kind === 'slider' ? 'range' : kind === 'segmented' || kind === 'toggle' ? 'seg' : kind,
      min: control.min, max: control.max, step: control.step, unit: control.unit,
      opts: (kind === 'toggle' ? [true, false] : control.options ?? []).map(value => ({ v: value, zh: typeof value === 'boolean' ? value ? '开' : '关' : String(value), en: typeof value === 'boolean' ? value ? 'On' : 'Off' : String(value) })) }
  })
  const source = { componentId: item.id, detailUrl: snapshot.detailUrl, url: item.sourceUrl ?? snapshot.sourceUrl, commit: item.commit ?? snapshot.commit,
    license: { spdx: item.license?.spdx ?? snapshot.license?.spdx, url: item.license?.url ?? snapshot.license?.url } }
  return {
    id: `source:${item.id}`, zh: title('zh'), en: title('en'), sourceComponent: true, source, params, size: { w: 400, h: 250 },
    dz: localText(item.description, 'zh'), de: localText(item.description, 'en'), componentTypes: [item.type ?? 'component'],
    complete: values => ({ ...componentValues(item, values), __canvasTheme: values?.__canvasTheme ?? 'light' }),
    prompt(values, lang) {
      const params = JSON.stringify(componentValues(item, values), null, 2)
      return [title(lang), `${lang === 'zh' ? '原始来源' : 'Original source'}: ${source.url}`, source.commit && `Commit: ${source.commit}`,
        source.license.spdx && `License: ${source.license.spdx} — ${source.license.url ?? ''}`, `Original files: ${source.detailUrl}`,
        item.install, `${lang === 'zh' ? '当前真实参数' : 'Current actual props'}:\n${params}`].filter(Boolean).join('\n\n')
    },
    mount(host, initial) {
      const root = host.shadowRoot ?? host.attachShadow({ mode: 'open' })
      root.replaceChildren()
      const wrapper = document.createElement('div')
      wrapper.style.cssText = 'position:relative;width:400px;height:250px;overflow:hidden;'
      host.style.cssText = 'display:inline-block;width:400px;height:250px;'
      root.append(wrapper)
      let current = initial, frame = null, poster = null, ready = false
      const posterUrl = item.preview?.posterUrl ?? item.poster
      if (posterUrl?.startsWith('/') && !posterUrl.startsWith('//')) {
        poster = document.createElement('img'); poster.src = posterUrl; poster.alt = title('en'); poster.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;'; wrapper.append(poster)
      }
      const send = () => {
        frame?.contentWindow?.postMessage({ type: 'vislexicon:props', values: componentValues(item, current) }, '*')
        frame?.contentWindow?.postMessage({ type: 'vislexicon:theme', theme: current.__canvasTheme }, '*')
        frame?.contentWindow?.postMessage({ type: 'vislexicon:sound', enabled: false }, '*')
      }
      const failure = () => {
        if (frame) frame.style.opacity = '0'
        if (poster) poster.style.opacity = '1'
        const message = document.createElement('p'); message.textContent = 'Live source unavailable · 原始实时预览暂不可用'; message.style.cssText = 'position:absolute;bottom:4px;left:8px;font:12px system-ui;color:#777'; wrapper.append(message)
      }
      const receive = event => {
        if (event.source !== frame?.contentWindow) return
        if (event.data?.type === 'vislexicon:ready') { if (!ready) { ready = true; send() }; frame.style.opacity = '1'; if (poster) poster.style.opacity = '0' }
        if (event.data?.type === 'vislexicon:error') failure()
      }
      if (previewUrl && !loadError) {
        frame = document.createElement('iframe'); frame.src = previewUrl; frame.title = title('en'); frame.setAttribute('sandbox', 'allow-scripts'); frame.referrerPolicy = 'no-referrer'; frame.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;background:transparent;opacity:0'; frame.addEventListener('load', send); window.addEventListener('message', receive); wrapper.append(frame)
      } else failure()
      return { update(values) { current = values; send() }, destroy() { window.removeEventListener('message', receive); frame?.removeEventListener('load', send); frame?.remove(); root.replaceChildren() } }
    },
  }
}

export async function loadPlaygroundComponents(parts, read = readComponentDetail) {
  const snapshots = [...new Map(parts.filter(part => part.component?.id).map(part => [part.component.id, part.component])).values()]
  const units = await Promise.all(snapshots.map(async snapshot => {
    try { return sourceUnit(await read(snapshot.detailUrl), snapshot, false) }
    catch { return sourceUnit({ id: snapshot.id, controls: snapshot.controls, poster: snapshot.poster }, snapshot, true) }
  }))
  return Object.fromEntries(units.map(unit => [unit.id, unit]))
}

export function composeWithSourceComponents(compose, registry, args) {
  const native = args.parts.filter(part => !registry[part.unitId]?.sourceComponent)
  const result = compose({ ...args, parts: native })
  const sources = args.parts.filter(part => registry[part.unitId]?.sourceComponent)
  if (!sources.length) return result
  let nativeIndex = 0
  result.parts = args.parts.map(part => {
    const unit = registry[part.unitId]
    if (!unit?.sourceComponent) return result.parts[nativeIndex++]
    return { unitId: unit.id, renderer: 'verified-source', source: unit.source, values: Object.fromEntries(Object.entries(unit.complete(part.values)).filter(([key]) => key !== '__canvasTheme')), frame: part.frame, note: part.note }
  })
  for (const lang of ['zh', 'en']) result.prompt[lang] += sources.map(part => { const unit = registry[part.unitId]; return `\n\n## ${unit[lang]} (${Math.round(part.frame?.x ?? 0)}, ${Math.round(part.frame?.y ?? 0)})\n${unit.prompt(part.values, lang)}` }).join('')
  result.references = [...result.references, ...sources.map(part => ({ url: registry[part.unitId].source.url, why: 'Original component source and license' }))]
  return result
}
