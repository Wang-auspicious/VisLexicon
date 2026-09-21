export const DISCOVERY_SCOPES = {
  curation: { zh:'策展', en:'Websites', promptZh:'描述你需要的网站、组件库或资源，也可以补充免费、源码等条件。', promptEn:'Describe the website, library or resource you need. Add cost or source-code requirements.' },
  atlas: { zh:'图鉴', en:'Atlas', promptZh:'描述形状、颜色、尺寸或动效。找到效果后，可以查看已核实包含它的原网站。', promptEn:'Describe a shape, color, size or motion. Matching effects can link to verified original examples.' },
  skills: { zh:'Skill', en:'Skills', promptZh:'描述你想交给 Agent 的设计规则或生图方法。', promptEn:'Describe the design rules or image-making method your agent needs.' },
  ppt: { zh:'PPT 制作', en:'Presentations', promptZh:'描述这一页要表达的内容、构图和排版感觉。', promptEn:'Describe the content, composition and typographic feel of your slide.' },
  science: { zh:'科研绘图', en:'Scientific figures', promptZh:'描述数据、方法或关系，以及需要的图形形式。', promptEn:'Describe the data, method or relationship and the figure you need.' },
}

export function queryRequirements(query) {
  const q=String(query).normalize('NFKC').toLowerCase()
  // Remove relaxed / negative requirements before interpreting positive filters.
  const relaxed=q.replace(/不免费(?:也|都)?可以|不免费也行|收费也(?:行|可以)|免费与否不限/gu,'').replace(/(?:不要求|不需要|无需|不必|不要|不用|不限|无所谓)[^，。;；]{0,5}(?:免费|开源|源码|源代码|商用)/gu,'').replace(/(?:need not|don'?t need|no need for|not necessarily)\s+(?:free|open[- ]source|source code|commercial)/gu,'')
  const result={
    free: /免费|不花钱|不收费|零成本|\bfree\b|no[- ]cost/u.test(relaxed),
    source: /源码|源代码|开源|能改代码|source[- ]?code|open[- ]source/u.test(relaxed),
    commercial: /商用|商业使用|commercial/u.test(relaxed),
    openSource: /开源|open[- ]source/u.test(relaxed),
  }
  if(/(?:源码|源代码|代码)(?:也|是|则)?(?:可以|可|允许|接受|能)(?:是)?(?:收费|付费)|source(?: code)?\s+(?:can|may)\s+(?:be paid|cost)/u.test(q))result.allowPaidSource=true
  return result
}
export function offerMatches(requirements, offer) {
  if(!offer || offer.verified!==true || !offer.checkedAt || !offer.evidenceUrls?.length) return false
  if(requirements.source && !(offer.sourceAvailable===true && offer.sourceUrl))return false
  if(requirements.free && (requirements.source&&!requirements.allowPaidSource ? offer.sourceCost!=='free' : offer.access!=='free' && offer.access!=='partial-free'))return false
  if(requirements.openSource && offer.openSource!==true)return false
  if(requirements.commercial && offer.commercialUse!==true)return false
  return true
}
export function matchesRequirements(query, unit) {
  const r=queryRequirements(query)
  if(!Object.values(r).some(Boolean))return true
  // All requested conditions must describe ONE offer. Never join free viewing to paid source code.
  return (unit.offers||[]).some(offer=>offerMatches(r,offer)) || (unit.relatedSites||[]).some(site=>(site.offers||[]).some(offer=>offerMatches(r,offer)))
}
export function inTheme(unit, theme) { return !theme || unit.theme===theme || unit.themes?.includes(theme) }
export function scopeUnits(index, theme='') { return index.units.filter(unit=>unit.scope===index.scope && inTheme(unit,theme)) }

export function descriptionSections(text) {
  // Split only editorial headings, never decimals, abbreviations, CSS values or URLs.
  const value=String(text||'').trim()
  const heading=/(?:^|\n|(?<=[。.!?；;]))\s*(结构|尺寸与布局|色彩与质感|运动与状态|响应与范围|尺寸|几何|布局|间距|色彩与层次|色彩|颜色|材质|字体|文字|阴影|交互|动效|响应|响应式|用途|范围|说明|Structure|Size and layout|Colors? and material|Motion and states?|Responsive scope|Dimensions|Geometry|Layout|Spacing|Colors?(?: and layers)?|Typography|Material|Shadows?|Interaction|Motion|Responsive(?: behavior)?|Purpose|Scope|Notes?)\s*[:：]/giu
  const marks=[...value.matchAll(heading)]
  if(!marks.length)return value?[{label:'',text:value}]:[]
  const rows=[]
  if(marks[0].index>0)rows.push({label:'',text:value.slice(0,marks[0].index).trim()})
  marks.forEach((match,i)=>rows.push({label:match[1],text:value.slice(match.index+match[0].length,marks[i+1]?.index??value.length).trim()}))
  return rows.filter(row=>row.text)
}
export function colorSegments(text) {
  return String(text).split(/(#[a-f\d]{8}\b|#[a-f\d]{6}\b|#[a-f\d]{4}\b|#[a-f\d]{3}\b)/giu).filter(Boolean).map(text=>({text,color:/^#(?:[a-f\d]{3}|[a-f\d]{4}|[a-f\d]{6}|[a-f\d]{8})$/iu.test(text)?text:null}))
}
