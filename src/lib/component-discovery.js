// Evidence retrieval is independent from the model. Model output can only reorder known IDs.
import { matchesRequirements } from './discovery-scopes.js'
export const DISCOVERY_INDEX_URL = '/data/discovery/index.json'
const ALIASES = [
  [/按钮|button|cta/iu,['按钮','button']], [/虚线|dash/iu,['虚线','dashed']],
  [/描边|空心|outline/iu,['描边','outline']], [/浅底|轻染|soft.tint/iu,['浅底','soft tinted']],
  [/透明|ghost/iu,['透明','transparent','ghost']], [/圆形|圆的|circle|circular/iu,['circle','圆形']],
  [/黑|black|monochrome/iu,['black','近黑','黑底']], [/蓝|blue|indigo/iu,['blue','靛蓝','天蓝']],
  [/粉|玫红|pink|magenta/iu,['pink','玫红']], [/绿|green|teal/iu,['green','绿色','青绿']],
  [/登录|登入|login|sign.in/iu,['login','登录']], [/卡片|card/iu,['card','卡片']],
  [/悬停|鼠标放上|鼠标移上|hover/iu,['hover','悬停']], [/抬起|浮起|上浮|lift/iu,['lift','抬起']],
  [/硬.{0,3}阴影|粗野|brutal|hard.shadow/iu,['hard shadow','硬阴影','neobrutalism']],
  [/柔和.{0,3}阴影|轻.{0,3}投影|soft.shadow|subtle.shadow/iu,['soft shadow','轻微','克制']],
  [/瀑布|pinterest|masonry/iu,['masonry','瀑布流']], [/便当|bento/iu,['bento','便当盒']],
  [/杂志|拼贴|editorial|montage/iu,['editorial','montage','拼贴']],
  [/骨架|skeleton/iu,['skeleton','骨架屏']], [/进度|progress/iu,['progress','进度条']],
  [/等待|加载|loading|spinner/iu,['loading','加载']], [/逐字|letter/iu,['逐字','letter reveal']],
  [/逐词|word.by.word/iu,['逐词','word reveal']], [/文字|标题|字体|typography|headline/iu,['typography','文字']],
  [/模糊|聚焦|对焦|blur/iu,['blur','模糊']], [/箭头|arrow/iu,['arrow','箭头']],
]
export function queryTerms(query) {
  const q=String(query).normalize('NFKC').toLowerCase()
  const words=q.match(/[a-z0-9]+(?:[-'][a-z0-9]+)*|[\p{Script=Han}]+/gu)||[]
  const terms=new Set(words.filter(x=>x.length>1))
  for(const word of words.filter(x=>/\p{Script=Han}/u.test(x))) for(let i=0;i<word.length-1;i++) terms.add(word.slice(i,i+2))
  for(const [pattern,values] of ALIASES) if(pattern.test(q)) values.forEach(x=>terms.add(x))
  return [...terms]
}
export function wantsComponentInstance(query) {
  const q=String(query).normalize('NFKC').toLowerCase()
  if(/组件库|网站|站点|资源库|(?:component|ui)\s+librar|\b(?:website|websites|libraries|library)\b/u.test(q))return false
  return /组件|按钮|卡片|输入框|开关|加载圈|导航栏|\b(?:buttons?|cards?|components?|inputs?|toggles?|spinners?)\b/u.test(q)
}
export function explicitConflicts(query, unit) {
  const q=query.toLowerCase(), conflicts=[]
  if(wantsComponentInstance(query)&&unit.kind==='curated-site')conflicts.push('需要具体组件实例，不能用整站代替')
  if(!matchesRequirements(query,unit))conflicts.push('缺少满足费用或源码条件的同一份资源证据')
  if(/(?:不要|不用|无|别)[^，。,.]{0,4}(?:发光|光晕|光效)|(?:no|without)\s+(?:glow|glowing)/u.test(q) && /hover--(?:glow|gradborder)$/.test(unit.id)) conflicts.push('要求无光效')
  if(/(?:不要|不用|无|别)[^，。,.]{0,3}(?:动画|动效)|(?:no|without)\s+animation|完全静止/u.test(q) && (unit.interaction?.activeMotion===true||unit.interaction?.trigger==='autoplay'||unit.interaction?.capturedState==='loading-demo')) conflicts.push('要求静止')
  if(/不要[^，。,.]{0,3}虚线|no\s+dashed/u.test(q) && unit.visual?.style==='dash') conflicts.push('排除虚线')
  if(/不要[^，。,.]{0,3}圆形|no\s+circular/u.test(q) && unit.visual?.shape==='circle') conflicts.push('排除圆形')
  return conflicts
}
export function lexicalCandidates(query, units, { limit=32, includeZero=false }={}) {
  const terms=queryTerms(query)
  const wantsButton=/按钮|\bbutton\b/i.test(query), wantsCard=/卡片|\bcard\b/i.test(query)
  return units.map(unit=>{
    const key=[unit.nameZh,unit.nameEn,unit.componentType,...unit.tags].join(' ').toLowerCase()
    const text=[unit.descriptionZh,unit.descriptionEn,unit.prompt,...(unit.offers||[]).map(x=>x.scope)].join(' ').toLowerCase()
    const matched=terms.filter(t=>key.includes(t)||text.includes(t))
    let score=matched.reduce((v,t)=>v+(key.includes(t)?3:0.55),0)
    if(wantsButton && unit.componentType==='button')score+=7
    if(wantsCard && unit.componentType==='card')score+=7
    if(unit.dimension==='state'&&!/禁用|加载|激活|disabled|loading|active/i.test(query))score-=3
    if(unit.dimension==='size'&&!/尺寸|大小|small|large|size/i.test(query))score-=2
    const conflicts=explicitConflicts(query,unit)
    return {unit,score,matched:matched.slice(0,5),conflicts}
  }).filter(x=>!x.conflicts.length&&(includeZero||x.score>0)).sort((a,b)=>b.score-a.score||a.unit.id.localeCompare(b.unit.id)).slice(0,limit)
}
export function rerankPool(query, units, limit=32) {
  const ranked=lexicalCandidates(query,units,{limit:units.length,includeZero:true})
  // Broaden weak lexical recall: unfamiliar prose is accepted and evaluated semantically.
  const selected=ranked.slice(0,Math.floor(limit*.75))
  const seen=new Set(selected.map(x=>x.unit.id)), families=new Set()
  for(const item of ranked) {
    const family=`${item.unit.componentType}/${item.unit.visual?.style||item.unit.interaction?.trigger}`
    if(!seen.has(item.unit.id)&&!families.has(family)) {selected.push(item);seen.add(item.unit.id);families.add(family)}
    if(selected.length>=limit) break
  }
  for(const item of ranked) {if(selected.length>=limit)break;if(!seen.has(item.unit.id)){selected.push(item);seen.add(item.unit.id)}}
  return selected
}
export function applyModelRanking(query, units, modelRows) {
  const byId=new Map(units.map(x=>[x.id,x])), seen=new Set()
  return modelRows.filter(row=>byId.has(row.id)&&!seen.has(row.id)&&seen.add(row.id)&&Number.isFinite(row.score)&&row.score>=0&&row.score<=3&&!explicitConflicts(query,byId.get(row.id)).length)
    .sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).map(row=>({unit:byId.get(row.id),score:row.score,confidence:row.confidence,matched:[],conflicts:[]}))
}
