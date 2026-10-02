// Match explicit visual requirements against measured properties, not words in a name.
export function colorFacts(value) {
  const css=String(value||'').trim().toLowerCase()
  const values=css.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/g)?.map(Number)
  if(!values&&!/^#[0-9a-f]{6}$/i.test(css))return null
  if(/^okl(?:ab|ch)\(/.test(css)) {
    const [l,a,b,alpha=1]=values
    const c=css.startsWith('oklch')?a:Math.hypot(a,b)
    const h=css.startsWith('oklch')?b:(Math.atan2(b,a)*180/Math.PI+360)%360
    return {white:l>=0.9&&c<=0.04&&alpha>=0.9,black:l<=0.3&&alpha>=0.9,blue:c>0.035&&h>=210&&h<=270&&alpha>=0.9}
  }
  let rgb
  if(/^rgba?\(/.test(css))rgb=values
  else if(/^#[0-9a-f]{6}$/i.test(css))rgb=[1,3,5].map(i=>parseInt(css.slice(i,i+2),16))
  else return null
  const [r,g,b,alpha=1]=rgb,min=Math.min(r,g,b),max=Math.max(r,g,b),delta=max-min
  let hue=0
  if(delta)hue=((max===r?(g-b)/delta:max===g?(b-r)/delta+2:(r-g)/delta+4)*60+360)%360
  return {white:min>=225&&max-min<=40&&alpha>=0.9,black:max<=65&&alpha>=0.9,blue:delta>=20&&hue>=190&&hue<=255&&alpha>=0.9}
}
export function visualConstraints(query) {
  const q=String(query).normalize('NFKC').toLowerCase()
  const constraints=[]
  const textPattern=/(白|黑|蓝)(?:色)?(?:的)?(?:文字|字体|字)|(?:文字|字体)(?:是|为|要|用)?(白|黑|蓝)(?:色)?|\b(white|black|blue)\s+(?:text|font|lettering)\b/gu
  const colors={白:'white',黑:'black',蓝:'blue'}
  const remaining=q.replace(textPattern,(match,a,b,c,offset)=>{
    const excluded=/(?:不要|不用|非|不带|without|no)\s*$/u.test(q.slice(Math.max(0,offset-8),offset))
    constraints.push({role:'text',color:colors[a||b]||c,excluded})
    return ' '.repeat(match.length)
  })
  if(/蓝|\bblue\b/u.test(remaining)&&!/(?:不要|不用|非|without|no)\s*(?:浅|深|light |dark )?蓝|\b(?:no|without)\s+blue/u.test(remaining))constraints.push({role:'background',color:'blue'})
  if(/实心|\b(?:solid|filled)\b/u.test(q)&&!/(?:不要|不用|非)实心|\b(?:no|not|without)\s+(?:solid|filled)/u.test(q))constraints.push({role:'style',value:'solid'})
  return constraints
}
export function visualConflicts(query,unit) {
  if(unit.kind!=='website-component')return []
  return visualConstraints(query).flatMap(constraint=>{
    const measured=constraint.role==='style'?unit.visual?.style===constraint.value:colorFacts(unit.visual?.computed?.[constraint.role==='text'?'color':'background'])?.[constraint.color]
    const matches=constraint.excluded?measured===false:measured===true
    return matches?[]:[`缺少符合 ${constraint.role}:${constraint.color||constraint.value} 的实测属性`]
  })
}
