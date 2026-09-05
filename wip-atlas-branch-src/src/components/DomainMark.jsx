/* 域名首字母块：站点没有可用截图时的占位标识，也用于详情头部的身份块。
   纯装饰（信息由相邻的站名与域名承担），故 aria-hidden。 */
export default function DomainMark({ url, name, className = '' }) {
  let initial = ''
  try {
    initial = new URL(url).hostname.replace(/^www\./, '').charAt(0).toUpperCase()
  } catch {
    initial = (name || '').trim().charAt(0).toUpperCase()
  }
  if (!initial) initial = '·'
  return (
    <span className={`vl-domain-mark ${className}`.trim()} aria-hidden="true">
      {initial}
    </span>
  )
}
