import { CATALOG, CATEGORIES, LANES } from '../catalog.js'
import PROPS from '../generated/props.json' with { type: 'json' }
import SHOTS from '../generated/shots.json' with { type: 'json' }
import POSTERS from '../generated/posters.json' with { type: 'json' }

export { CATEGORIES, LANES }
export const categoryById = Object.fromEntries(CATEGORIES.map(c => [c.id, c]))

const primitive = v => ['string', 'number', 'boolean'].includes(typeof v)
const hex = v => typeof v === 'string' && /^#[0-9a-f]{3,8}$/i.test(v)

/** Merge a catalog parameter with what the type extractor found for that prop. */
function control(entry, param) {
  const info = param.demo ? null : PROPS[entry.id]?.params[param.key]
  const options = param.options ?? (info?.kind === 'enum' ? info.options : undefined)
  const kind = param.control ?? (options ? 'segmented' : info?.kind === 'boolean' ? 'toggle' : info?.kind === 'number' || param.min !== undefined ? 'slider' : 'text')
  let value = param.default ?? (primitive(info?.default) ? info.default : undefined)
  if (kind === 'color' && !hex(value)) value = param.default ?? '#ffffff'
  if (value === undefined) value = kind === 'slider' ? param.min ?? 0 : kind === 'toggle' ? false : options?.[0] ?? ''
  if (kind === 'segmented' && options && !options.includes(value)) value = options.find(o => String(value).toLowerCase().endsWith(o)) ?? options[0]
  return {
    key: param.key, kind, options, min: param.min, max: param.max, step: param.step, unit: param.unit, default: value,
    labelZh: param.labelZh ?? param.key, labelEn: param.labelEn ?? param.key,
    prop: param.demo ? null : param.prop, demo: Boolean(param.demo),
    type: info?.type, doc: info?.doc, sourceDefault: info?.default, declaredIn: info?.declaredIn,
  }
}

export const ENTRIES = CATALOG.map((entry, index) => {
  if (entry.lane === 'screenshot') {
    const shot = SHOTS[entry.shotId]
    return {
      ...entry, index, zh: shot.zh, en: shot.en, summaryZh: shot.summaryZh, summaryEn: shot.summaryEn, shot,
      source: { site: shot.site, home: `https://${shot.host}`, page: shot.page, license: null },
      poster: shot.frames[0].src, controls: [],
    }
  }
  const controls = entry.params.map(param => control(entry, param))
  return { ...entry, index, controls, apiCounts: PROPS[entry.id]?.counts ?? {}, poster: POSTERS[entry.id]?.url ?? `posters/${entry.id}.jpg` }
})
export const byId = Object.fromEntries(ENTRIES.map(e => [e.id, e]))
export const defaults = entry => Object.fromEntries(entry.controls.map(c => [c.key, c.default]))

/** Detect the language of what the user typed; empty input keeps Chinese. */
export const queryLang = q => !q.trim() ? 'zh' : /[㐀-鿿]/.test(q) ? 'zh' : /[a-z]/i.test(q) ? 'en' : 'zh'
export const nameOf = (e, lang) => lang === 'en' ? e.en : e.zh
export const summaryOf = (e, lang) => lang === 'en' ? e.summaryEn : e.summaryZh

export function copyPrompt(entry, values, usage, lang = 'zh') {
  const s = entry.source
  if (entry.lane === 'screenshot') {
    return lang === 'en'
      ? `Recreate this component from ${s.page} (source is not archived here; use the screenshot only as a visual reference).\n\n${entry.shot.prompt}`
      : `参考 ${s.page} 的这个组件（此处未归档源码，截图只作视觉参考），实现一个同样效果的组件：\n\n${entry.shot.prompt}`
  }
  const where = s.repo ? `${s.repo}@${s.commit.slice(0, 7)}${s.path ? ` ${s.path}` : ''}` : s.home
  return lang === 'en'
    ? `Add the "${entry.en}" component from ${s.site} (${s.license}, ${where}).\n\nInstall:\n${s.install}\n\nUse it with these settings:\n${usage}\n`
    : `在项目里加入 ${s.site} 的「${entry.zh}」组件（${s.license} 许可，来源 ${where}）。\n\n安装：\n${s.install}\n\n按下面的参数使用：\n${usage}\n`
}
