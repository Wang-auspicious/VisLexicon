import { discoveryCorrectionClauses } from './discovery-query.js'
// Match explicit visual requirements against measured properties, not words in a name.
export function colorFacts(value) {
  const named={white:'#ffffff',black:'#000000',blue:'#0000ff',purple:'#800080',red:'#ff0000',green:'#008000',yellow:'#ffff00',orange:'#ffa500',pink:'#ffc0cb',gray:'#808080',grey:'#808080'}
  const input=String(value||'').trim().toLowerCase()
  const css=named[input]||input
  if(css==='transparent')return {white:false,black:false,blue:false,paleBlue:false,purple:false,red:false,orange:false,yellow:false,green:false,pink:false,gray:false,transparent:true}
  const values=css.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/g)?.map(Number)
  if(!values&&!/^#[0-9a-f]{3}(?:[0-9a-f]|[0-9a-f]{3}|[0-9a-f]{5})?$/i.test(css))return null
  if(/^okl(?:ab|ch)\(/.test(css)) {
    const [l,a,b,alpha=1]=values
    const c=css.startsWith('oklch')?a:Math.hypot(a,b)
    const h=css.startsWith('oklch')?b:(Math.atan2(b,a)*180/Math.PI+360)%360
    return {white:l>=0.9&&c<=0.04&&alpha>=0.9,black:l<=0.3&&alpha>=0.9,blue:c>0.035&&h>=210&&h<265&&alpha>=0.9,paleBlue:l>=0.88&&c>0.01&&h>=190&&h<265&&alpha>=0.9,purple:c>0.06&&h>=265&&h<=340&&alpha>=0.9,red:c>0.04&&(h<40||h>350)&&alpha>=0.9,orange:c>0.04&&h>=40&&h<80&&alpha>=0.9,yellow:c>0.04&&h>=80&&h<120&&alpha>=0.9,green:c>0.035&&h>=120&&h<200&&alpha>=0.9,pink:c>0.035&&h>=320&&l>0.55&&alpha>=0.9,gray:c<=0.04&&l>0.3&&l<0.9&&alpha>=0.9,transparent:alpha<0.05}
  }
  let rgb
  if(/^rgba?\(/.test(css))rgb=values
  else if(/^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(css)){const hex=css.slice(1);const full=hex.length<5?[...hex].map(c=>c+c).join(''):hex;rgb=[0,2,4].map(i=>parseInt(full.slice(i,i+2),16));if(full.length===8)rgb.push(parseInt(full.slice(6,8),16)/255)}
  else return null
  const [r,g,b,alpha=1]=rgb,min=Math.min(r,g,b),max=Math.max(r,g,b),delta=max-min
  let hue=0
  if(delta)hue=((max===r?(g-b)/delta:max===g?(b-r)/delta+2:(r-g)/delta+4)*60+360)%360
  return {white:min>=225&&max-min<=40&&alpha>=0.9,black:max<=65&&alpha>=0.9,blue:delta>=20&&hue>=190&&hue<255&&alpha>=0.9,paleBlue:min>=225&&delta>=7&&hue>=190&&hue<255&&alpha>=0.9,purple:delta>=20&&hue>=255&&hue<=335&&alpha>=0.9,red:delta>=20&&(hue<15||hue>=345)&&alpha>=0.9,orange:delta>=20&&hue>=15&&hue<45&&alpha>=0.9,yellow:delta>=20&&hue>=45&&hue<75&&alpha>=0.9,green:delta>=20&&hue>=75&&hue<190&&alpha>=0.9,pink:delta>=20&&hue>=315&&max>=180&&min>=80&&alpha>=0.9,gray:delta<20&&max>65&&min<225&&alpha>=0.9,transparent:alpha<0.05}
}
export function visualConstraints(query,{splitStates=true}={}) {
  let q=String(query).normalize('NFKC').toLowerCase()
  const corrections=discoveryCorrectionClauses(q)
  q=corrections.join('改成')
  if(corrections.length>1) {
    let active=[]
    for(const clause of corrections) {
      const next=visualConstraints(clause,{splitStates})
      const overwritten=new Set(next.map(constraint=>constraint.role))
      active=[...active.filter(constraint=>!overwritten.has(constraint.role)),...next]
    }
    return active
  }
  const alternatives=q.split(/(?:或者|或是|或|\bor\b)/iu)
  if(alternatives.length>1)return [{role:'alternative',anyOf:alternatives.map(clause=>visualConstraints(clause,{splitStates}))}]
  const constraints=[]
  // State clauses must not become requirements for the resting appearance.
  // Keep the source color parser for hover phrases, then bind their roles to hover.
  if(splitStates)q=q.replace(/(?:(?:不要|不用|without|no)\s*)?(?:悬停|\bhover\b)[^，。；,;\n]*/gu,clause=>{
    const excluded=/^(?:不要|不用|without|no)/u.test(clause)
    for(const c of visualConstraints(clause,{splitStates:false}))constraints.push({...c,role:c.role.startsWith('hover')?c.role:{background:'hoverBackground',style:'hoverStyle',text:'hoverColor',stroke:'hoverStroke',border:'hoverBorder',borderStyle:'hoverBorderStyle',iconColor:'hoverIconColor',icon:'hoverIcon'}[c.role]||`hover${c.role[0].toUpperCase()}${c.role.slice(1)}`,excluded:excluded||c.excluded})
    return ' '.repeat(clause.length)
  })
  const textPattern=/(白|黑|蓝|紫|红|绿|黄|橙|粉|灰)(?:色)?(?:的)?(?:文字|字体|字)|(?:文字|字体)(?:是|为|要|用)?(白|黑|蓝|紫|红|绿|黄|橙|粉|灰)(?:色)?|\b(white|black|blue|purple|red|green|yellow|orange|pink|gray|grey)\s+(?:text|font|lettering)\b/gu
  const strokePattern=/(白|黑|蓝|紫|红|绿|黄|橙|粉|灰)(?:色)?(?:的)?(?:虚线|实线)?(?:描边|边框|线框|轮廓)|(?:描边|边框|线框|轮廓)(?:是|为|要|用)?(白|黑|蓝|紫|红|绿|黄|橙|粉|灰)(?:色)?|\b(white|black|blue|purple|red|green|yellow|orange|pink|gray|grey)\s+(?:(?:solid|dashed)\s+)?(?:outline(?:d)?|border|stroke)\b|\b(?:outline(?:d)?|border(?:ed)?|stroke)\s+(white|black|blue|purple|red|green|yellow|orange|pink|gray|grey)\b/gu
  const backgroundPattern=/(白|黑|蓝|紫|红|绿|黄|橙|粉|灰)(?:色)?(?:的)?(?:背景|底色|底|填充)|(?:背景|底色|填充)(?:是|为|要|用)?(白|黑|蓝|紫|红|绿|黄|橙|粉|灰)(?:色)?|\b(white|black|blue|purple|red|green|yellow|orange|pink|gray|grey)\s+(?:background|fill)\b/gu
  const iconPattern=/(白|黑|蓝|紫|红|绿|黄|橙|粉|灰)(?:色)?(?:的)?(?:图标|箭头)|(?:图标|箭头)(?:是|为|要|用)?(白|黑|蓝|紫|红|绿|黄|橙|粉|灰)(?:色)?|\b(white|black|blue|purple|red|green|yellow|orange|pink|gray|grey)\s+(?:icon|arrow)\b/gu
  const paleBlueBackgroundPattern=/浅蓝(?:色)?(?:的)?(?:背景|底色|底|填充)|(?:背景|底色|填充)(?:是|为|要|用)?浅蓝(?:色)?|\b(?:pale|light)\s+blue\s+(?:background|fill)\b/gu
  const hoverPaleBluePattern=/(?:悬停|hover)(?:时|后|态|状态)?(?:的|变为|变成|变|是|为|呈|成|\s){0,5}浅蓝(?:色)?|\bhover\s+(?:pale|light)\s+blue\b|\b(?:pale|light)\s+blue\s+hover\b/gu
  const hoverPattern=/(?:悬停|hover)(?:时|后|态|状态)?(?:的|变为|变成|变|是|为|呈|成|浅|深|\s){0,5}(白|黑|蓝|紫|红|绿|黄|橙|粉|灰)(?:色)?|\bhover\s+(white|black|blue|purple|red|green|yellow|orange|pink|gray|grey)\b/gu
  const colors={白:'white',黑:'black',蓝:'blue',紫:'purple',红:'red',绿:'green',黄:'yellow',橙:'orange',粉:'pink',灰:'gray',grey:'gray'}
  const excludedAt=offset=>/(?:不要|不用|非|不带|without|no)\s*$/u.test(q.slice(Math.max(0,offset-8),offset))
  const extract=(input,pattern,role,{implicit=false}={})=>input.replace(pattern,(...args)=>{
    const match=args[0],offset=args.at(-2),groups=args.slice(1,-2)
    constraints.push({role,color:colors[groups.find(Boolean)]||groups.find(Boolean),excluded:excludedAt(offset),...(implicit?{implicit:true}:{})})
    return ' '.repeat(match.length)
  })
  let remaining=extract(q,textPattern,'text')
  remaining=extract(remaining,strokePattern,'stroke')
  remaining=remaining.replace(paleBlueBackgroundPattern,(match,offset)=>{constraints.push({role:'background',color:'paleBlue',excluded:excludedAt(offset)});return ' '.repeat(match.length)})
  remaining=remaining.replace(hoverPaleBluePattern,(match,offset)=>{constraints.push({role:'hoverBackground',color:'paleBlue',excluded:excludedAt(offset)});return ' '.repeat(match.length)})
  remaining=extract(remaining,iconPattern,'iconColor')
  remaining=extract(remaining,backgroundPattern,'background')
  remaining=extract(remaining,hoverPattern,'hoverBackground',{implicit:true})
  for(const [pattern,negative,color] of [
    [/蓝|\bblue\b/u,/(?:不要|不用|非|without|no)\s*(?:浅|深|light |dark )?蓝|\b(?:no|without)\s+blue/u,'blue'],
    [/紫|\bpurple\b/u,/(?:不要|不用|非|without|no)\s*(?:浅|深|light |dark )?紫|\b(?:no|without)\s+purple/u,'purple'],
    ...[['红','red'],['绿','green'],['黄','yellow'],['橙','orange'],['粉','pink'],['灰','gray']].map(([zh,en])=>[new RegExp(zh+'|\\b'+en+'\\b','u'),new RegExp('(?:不要|不用|非|without|no)\\s*(?:浅|深|light |dark )?'+zh+'|\\b(?:no|without)\\s+'+en,'u'),en]),
  ])if(pattern.test(remaining)&&!constraints.some(constraint=>constraint.color===color&&!constraint.implicit))constraints.push({role:'surface',color,implicit:true,...(negative.test(remaining)?{excluded:true}:{})})
  if(/透明(?:背景|底色|填充|底|按钮)|\btransparent\s+(?:background|fill|buttons?)\b/u.test(q))constraints.push({role:'background',color:'transparent'})
  // 实心 / 描边 / 幽灵是同一轴上的三个取值，三个都要能约束。
  // 只认实心的话，「描边按钮」会把实心按钮一并召回——反例挡不住。
  const negated=(word)=>new RegExp(`(?:不要|不用|非|不是|不带)${word}|(?:no|not|without)\\s+(?:an?\\s+)?${word}`,'u').test(q)
  const fillQuery=q.replace(/\bsolid\s+(?:(?:white|black|blue|purple)\s+)?(?:border|stroke|outline)\b/gu,(match,offset)=>{constraints.push({role:'borderStyle',value:'solid',excluded:excludedAt(offset)});return ' '.repeat(match.length)})
  if(/实心|(?:背景|底色)(?:是|要|有|为)?填充|填充(?:式|型|的)?(?:按钮|组件)|\b(?:solid|filled)\b/u.test(fillQuery)&&!negated('(?:实心|solid|filled)'))constraints.push({role:'style',value:'solid'})
  if(/描边|空心|线框|镂空|\b(?:outline|outlined|hollow)\b/u.test(q)&&!negated('(?:描边|空心|线框|镂空|outline|outlined|hollow)')){
    // An explicit opaque base with a visible stroke is a bordered surface.
    // Bare “outline” still means transparent fill.
    if(constraints.some(c=>c.role==='background'&&c.color!=='transparent'))constraints.push({role:'border',value:'present'})
    else constraints.push({role:'style',value:'outline'})
  }
  if(negated('(?:实心|solid|filled)'))constraints.push({role:'style',value:'solid',excluded:true})
  if(negated('(?:描边|空心|线框|镂空|outline|outlined|hollow)'))constraints.push({role:'style',value:'outline',excluded:true})
  if(/幽灵按钮|\bghost\s+buttons?\b/u.test(q)&&!negated('(?:幽灵|ghost)'))constraints.push({role:'style',value:'ghost'})
  if(/虚线|\bdashed\b/u.test(q)&&!negated('(?:虚线|dashed)'))constraints.push({role:'borderStyle',value:'dashed'})
  // 「带图标的按钮」是正向要求，不是否定。没有这条约束，无图标按钮会被一并召回。
  if(/(?:带|有|含)图标|图标按钮|\bwith an icon\b|\bicon\s+buttons?\b/u.test(q)&&!negated('(?:图标|icon)'))constraints.push({role:'icon',value:'present'})
  const explicitStyle=constraints.find(constraint=>constraint.role==='style'&&!constraint.excluded)?.value
  return constraints.map(constraint=>constraint.role==='surface'&&constraint.implicit&&['solid','outline'].includes(explicitStyle)
    ?{...constraint,role:explicitStyle==='solid'?'background':'stroke'}:constraint)
}
export function visualConflicts(query,unit,constraints=visualConstraints(query)) {
  if(unit.kind!=='website-component')return []
  // An unqualified color on a Link or Text request may describe resting or
  // hover text. Keep it for Jev to judge using the measured state description.
  const textLike=(unit.componentType==='link'&&/链接|超链接|\b(?:links?|hyperlinks?)\b/iu.test(query))
    ||(unit.componentType==='text'&&/文字|文本|\btext\b/iu.test(query))
  const computed=unit.visual?.computed
  const visibleBorder=parseFloat(computed?.borderWidth)>0&&computed?.borderStyle!=='none'
    &&colorFacts(computed?.borderColor)?.transparent===false
  return constraints.flatMap(constraint=>{
    if(constraint.anyOf)return constraint.anyOf.some(branch=>visualConflicts(query,unit,branch).length===0)?[]:['缺少符合任一可选外观的实测属性']
    if(textLike&&constraint.implicit&&['background','hoverBackground'].includes(constraint.role))return []
    const surfaceColors=[colorFacts(computed?.background)?.[constraint.color],colorFacts(computed?.color)?.[constraint.color],visibleBorder===true?colorFacts(computed?.borderColor)?.[constraint.color]:visibleBorder===false?false:undefined]
    const measured=constraint.role==='surface'?(surfaceColors.some(value=>value===true)?true:surfaceColors.every(value=>value===false)?false:undefined)
      :constraint.role==='style'?unit.visual?.style===undefined?undefined:unit.visual.style===constraint.value
      :constraint.role==='hoverStyle'?constraint.value==='solid'&&colorFacts(computed?.hoverBackground)?colorFacts(computed.hoverBackground).transparent===false:undefined
      :constraint.role==='borderStyle'?visibleBorder&&computed?.borderStyle===constraint.value
      :constraint.role==='border'?visibleBorder
      :constraint.role==='icon'?computed?.icon===undefined||computed?.icon===null?undefined:Boolean(computed.icon)&&computed.icon!=='none'
      :constraint.role==='stroke'?visibleBorder&&colorFacts(computed?.borderColor)?.[constraint.color]
      :colorFacts(computed?.[{text:'color',iconColor:'iconColor',background:'background',hoverBackground:'hoverBackground',hoverColor:'hoverColor',hoverStroke:'hoverBorderColor',hoverBorderStyle:'hoverBorderStyle',hoverBorder:'hoverBorderWidth'}[constraint.role]])?.[constraint.color]
    // Missing structured visual measurements are unresolved candidates, not
    // measured contradictions. Jev may use an explicit recorded description;
    // otherwise the candidate must remain unconfirmed. Rights remain strict.
    if(measured===undefined||measured===null)return []
    const matches=constraint.excluded?measured===false:measured===true
    return matches?[]:[`缺少符合 ${constraint.role}:${constraint.color||constraint.value} 的实测属性`]
  })
}
