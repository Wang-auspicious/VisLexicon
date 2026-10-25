const LABEL = /(?:^|\s)(样式|动效|适用|色彩|规格|结构|尺寸与布局|色彩与质感|字体与图标|运动与状态|响应与范围|Style|Motion|Use|Color|Specs|Structure|Size and layout|Color and material|Typography|Motion and states|Responsive scope)\s*[:：]/g
const HEX = /(#[\da-f]{8}|#[\da-f]{6}|#[\da-f]{4}|#[\da-f]{3})(?![\da-f])/gi

function Swatches({ text }) {
  const pieces = [], pattern = new RegExp(HEX), matches = [...text.matchAll(pattern)]
  let from = 0
  for (const match of matches) {
    pieces.push(text.slice(from, match.index), <span key={match.index} className="whitespace-nowrap">{match[0]}<span aria-hidden="true" className="ml-1 inline-block size-2.5 rounded-sm border border-white/25 align-middle" style={{ background: match[0] }} /></span>)
    from = match.index + match[0].length
  }
  pieces.push(text.slice(from))
  return pieces
}

export function Description({ text = '' }) {
  const matches = [...text.matchAll(new RegExp(LABEL))]
  if (!matches.length) return <p className="text-sm leading-6 text-zinc-400"><Swatches text={text} /></p>
  const sections = matches.map((match, i) => ({ label: match[1], text: text.slice(match.index + match[0].length, matches[i + 1]?.index ?? text.length).trim() }))
  const prefix = text.slice(0, matches[0].index).trim()
  return <div className="space-y-3 text-[13px] leading-6 text-zinc-400">{prefix && <p><Swatches text={prefix} /></p>}{sections.map((section, i) => <p key={i}><strong className="text-sm font-semibold text-zinc-300">{section.label}：</strong><Swatches text={section.text} /></p>)}</div>
}
