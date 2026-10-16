export const DISCOVERY_INDEX_URL = '/data/discovery/index.json'
// Evidence retrieval is independent from the model. Model output can only reorder known IDs.
import { queryRequirements, offerMatches } from './discovery-scopes.js'
import { visualConflicts, visualConstraints } from './component-constraints.js'
import { discoveryCorrectionClauses, discoveryEntityKind, discoveryFeatureConstraints } from './discovery-query.js'
const ALIASES = [
  [/按钮|button|cta/iu,['按钮','button']], [/虚线|dash/iu,['虚线','dashed']],
  [/描边|空心|outline/iu,['描边','outline']], [/浅底|轻染|soft.tint/iu,['浅底','soft tinted']],
  [/透明|ghost/iu,['透明','transparent','ghost']], [/圆形|圆的|circle|circular/iu,['circle','圆形']],
  [/黑|black|monochrome/iu,['black','近黑','黑底']], [/蓝|blue|indigo/iu,['blue','靛蓝','天蓝']],
  [/紫|purple|violet/iu,['purple','紫色','violet']],
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
export function wantsComponentInstance(query) { return discoveryEntityKind(query)==='component' }
const COMPONENT_TYPES = [
  ['button', /按钮|\bbuttons?\b|\bcta\b/iu], ['card', /卡片|\bcards?\b/iu],
  ['input', /输入框|\binputs?\b|\btext fields?\b/iu], ['toggle', /开关|\b(?:toggles?|switch(?:es)?)\b/iu],
  ['spinner', /加载圈|\bspinners?\b/iu], ['link', /超链接|链接|\b(?:links?|hyperlinks?)\b/iu],
]
export function requestedComponentTypes(query) {
  if(!wantsComponentInstance(query))return []
  // A correction/alternative is evaluated as new prose by Jev, never an
  // impossible conjunction of both the old and the replacement noun.
  const clauses=discoveryCorrectionClauses(query)
  let types=[]
  for(const clause of clauses) {
    const positive=clause.replace(/(?:不要|不用|不是|不再|非|no|not|without)\s*(?:buttons?|cards?|按钮|卡片|输入框|开关|加载圈|超链接|链接)/giu,' ')
    const next=COMPONENT_TYPES.filter(([,pattern])=>pattern.test(positive)).map(([type])=>type)
    if(next.length)types=next
  }
  return types
}
const analysisCache=new Map()
function analyzeQuery(query) {
  if(analysisCache.has(query))return analysisCache.get(query)
  const value={visual:visualConstraints(query),types:requestedComponentTypes(query),instance:wantsComponentInstance(query),
    wantsSite:discoveryEntityKind(query)==='site',features:discoveryFeatureConstraints(query),requirements:queryRequirements(query)}
  analysisCache.set(query,value)
  if(analysisCache.size>128)analysisCache.delete(analysisCache.keys().next().value)
  return value
}
export function explicitConflicts(query, unit) {
  const q=query.toLowerCase(), conflicts=[]
  const analyzed=analyzeQuery(query)
  conflicts.push(...visualConflicts(query,unit,analyzed.visual))
  const requestedTypes=analyzed.types,wantsSite=analyzed.wantsSite
  if(wantsSite&&unit.kind==='website-component')conflicts.push('需要网站或组件库入口')
  if(requestedTypes.length&&unit.kind==='website-component') {
    const actual=String(unit.componentType||'').toLowerCase()
    const compatible={input:['input','text-field','textfield','input-field','textarea'],toggle:['toggle','switch','checkbox'],spinner:['spinner','loading','loader']}
    if(!requestedTypes.some(type=>(compatible[type]||[type]).includes(actual)))conflicts.push('不属于请求的组件类型')
  }
  if(analyzed.instance&&unit.kind==='curated-site')conflicts.push('需要具体组件实例，不能用整站代替')
  const requirements=analyzed.requirements
  if(Object.values(requirements).some(Boolean)&&!(unit.offers||[]).some(offer=>offerMatches(requirements,offer))&&!(unit.relatedSites||[]).some(site=>(site.offers||[]).some(offer=>offerMatches(requirements,offer))))conflicts.push('缺少满足费用或源码条件的同一份资源证据')
  if(analyzed.features.motion==='required'&&unit.interaction?.activeMotion===false)conflicts.push('要求运动，实测实例为静态')
  if(analyzed.features.glow==='excluded'&&/hover--(?:glow|gradborder)$/.test(unit.id))conflicts.push('要求无光效')
  if(analyzed.features.motion==='excluded'&&(unit.interaction?.activeMotion===true||unit.interaction?.trigger==='autoplay'||unit.interaction?.capturedState==='loading-demo'))conflicts.push('要求静止')
  if(/不要[^，。,.]{0,3}虚线|no\s+dashed/u.test(q) && (unit.visual?.style==='dash'||unit.visual?.computed?.borderStyle==='dashed')) conflicts.push('排除虚线')
  if(/不要[^，。,.]{0,3}圆形|no\s+circular/u.test(q) && unit.visual?.shape==='circle') conflicts.push('排除圆形')
  return conflicts
}
export function lexicalCandidates(query, units, { limit=32, includeZero=false }={}) {
  const terms=queryTerms(query)
  const wantsButton=/按钮|\bbutton\b/i.test(query), wantsCard=/卡片|\bcard\b/i.test(query)
  return units.map(unit=>{
    const key=[unit.nameZh,unit.nameEn,unit.componentType,...(unit.tags||[])].join(' ').toLowerCase()
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
// This complete pool is the refinement boundary. A model batch or visible
// page must never replace it. Zero lexical overlap stays eligible for semantic
// judgment; the UI labels those entries as preliminary, not confirmed matches.
export function discoveryCandidatePool(query, units) {
  return lexicalCandidates(query, units, {limit:units.length,includeZero:true})
}
export function canRefineQuery(previous, query) {
  if(typeof previous!=='string'||!query.startsWith(previous)||query.length<=previous.length)return false
  const appended=query.slice(previous.length)
  if(/(?:不要|不用|不是|不再|取消|去掉|移除|改成|改为|换成|换为|而是|而要|后来|现在|其实|或者|或是|也可以|不限|\b(?:not|no|without|instead|rather|or|remove|any)\b)/iu.test(appended))return false
  // Completing a noun can change its kind (按钮 → 按钮组件库) or a partial
  // English token. Recompute in the full topic unless the boundary is clear.
  if(requestedComponentTypes(previous).join()!==requestedComponentTypes(query).join())return false
  if(discoveryEntityKind(query)!==discoveryEntityKind(previous))return false
  if(/[a-z0-9]$/iu.test(previous)&&/^[a-z0-9]/iu.test(appended))return false
  const constraintKey=constraint=>JSON.stringify({role:constraint.role,color:constraint.color,value:constraint.value,excluded:Boolean(constraint.excluded),anyOf:constraint.anyOf?.map(branch=>branch.map(constraintKey).sort()).sort()})
  const later=new Set(visualConstraints(query).map(constraintKey))
  const nextConstraints=visualConstraints(query)
  if(visualConstraints(previous).some(constraint=>!later.has(constraintKey(constraint))&&!(constraint.role==='surface'&&!constraint.excluded&&nextConstraints.some(next=>['background','stroke','text'].includes(next.role)&&!next.excluded&&next.color===constraint.color))))return false
  const beforeFeatures=discoveryFeatureConstraints(previous),afterFeatures=discoveryFeatureConstraints(query)
  if(Object.entries(beforeFeatures).some(([key,value])=>afterFeatures[key]!==value))return false
  const beforeRights=queryRequirements(previous),afterRights=queryRequirements(query)
  if(Object.entries(beforeRights).some(([key,value])=>value&&afterRights[key]!==value))return false
  // Allowing paid source relaxes an earlier free-source requirement even
  // though the individual free and source booleans remain true.
  if(!beforeRights.allowPaidSource&&afterRights.allowPaidSource&&beforeRights.free&&beforeRights.source)return false
  return true
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
// Public discovery receives only the published index. Private capture drafts
// stay in the local ledger and never become search cards.
export function discoveryResults(query, units, response, {limit=12}={}) {
  return (response?applyModelRanking(query,units,response.rows).filter(row=>row.score>=1.4):lexicalCandidates(query,units,{limit})).slice(0,limit)
}
