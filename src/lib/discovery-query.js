// Resolve explicit edits without treating rejected text as another AND clause.
// The original request is still sent to Jev; these clauses only govern safe
// deterministic constraints and the effective object supplied alongside it.
export function discoveryCorrectionClauses(query) {
  const normalized=String(query).normalize('NFKC').toLowerCase()
    .replace(/\b(?:instead of|rather than)\s+[^,.;，。；]+/gu,' ')
    .replace(/\b(?:now|actually)\s+(?:i\s+)?(?:want|need|would like)\s+/gu,'改成')
  return normalized.split(/(?:改成|换成|改为|换为|而是|而要|(?:后来|现在|其实)(?:又)?(?:想要|想换(?:成)?|想改(?:成)?|要|换(?:成)?)|\binstead\b)/u)
}

export function discoveryEntityKind(query) {
  let kind=null
  for(const clause of discoveryCorrectionClauses(query)) {
    const positive=clause.replace(/(?:不要|不用|不是|不再|非|no|not|without)\s*(?:组件库|网站|站点|资源库|websites?|libraries|library|组件|按钮|卡片|输入框|开关|components?|buttons?|cards?|inputs?)/gu,' ')
    if(/组件库|网站|站点|资源库|(?:component|ui)\s+librar|\b(?:website|websites|libraries|library)\b/u.test(positive))kind='site'
    else if(/组件|按钮|卡片|输入框|开关|加载圈|导航栏|链接|超链接|\b(?:buttons?|cards?|components?|inputs?|toggles?|spinners?|links?|hyperlinks?)\b/u.test(positive))kind='component'
  }
  return kind
}
export function discoveryFeatureConstraints(query) {
  const clauses=discoveryCorrectionClauses(query)
  const features={}
  for(const [key,mention,negative] of [
    ['motion',/动画|动效|弹簧|静止|\banimation\b|\bspring\b|\bstatic\b/u,/(?:不要|不用|不带|无|别).{0,3}(?:动画|动效)|(?:no|without)\s+animation|静止|\bstatic\b/u],
    ['glow',/发光|光晕|光效|\bglow(?:ing)?\b/u,/(?:不要|不用|不带|无|别).{0,4}(?:发光|光晕|光效)|(?:no|without)\s+(?:glow|glowing)/u],
    ['blur',/模糊|虚化|\bblur(?:ring)?\b/u,/(?:不要|不用|不带|别|无)\s*(?:模糊|虚化)|(?:no|without)\s+(?:blur|blurring)/u],
  ])for(const clause of clauses)if(mention.test(clause))features[key]=negative.test(clause)?'excluded':'required'
  return features
}
