// Serialise preview props as JSX attributes for the Usage snippet.
export function attrs(props) {
  return Object.entries(props).filter(([, v]) => v !== undefined).map(([k, v]) =>
    typeof v === 'string' ? `${k}="${v}"` : v === true ? k : `${k}={${JSON.stringify(v)}}`).join(' ')
}
export function tag(name, props, children, indent = '') {
  const a = attrs(props)
  const open = `${indent}<${name}${a ? ' ' + a : ''}`
  if (children == null) return `${open} />`
  return `${open}>\n${children}\n${indent}</${name}>`
}
