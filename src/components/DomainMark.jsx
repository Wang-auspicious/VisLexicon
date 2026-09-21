import { useState } from 'react'

/* 域名首字母块：列表卡、截图空位用。详情头部改用站点 favicon。 */
export default function DomainMark({ url, name, className = '', variant = 'letter' }) {
  if (variant === 'favicon') {
    return <SiteFavicon url={url} name={name} className={className} />
  }

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

function hostOf(url) {
  try {
    return new URL(url).hostname
  } catch {
    return ''
  }
}

function originOf(url) {
  try {
    return new URL(url).origin
  } catch {
    return ''
  }
}

function faviconCandidates(url) {
  const host = hostOf(url)
  const origin = originOf(url)
  const list = []
  if (origin) list.push(`${origin}/favicon.ico`)
  if (host) list.push(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`)
  return list
}

function SiteFavicon({ url, name, className = '' }) {
  const host = hostOf(url)
  const candidates = faviconCandidates(url)
  const [index, setIndex] = useState(0)
  const src = candidates[index] || ''

  return (
    <span className={`vl-site-favicon ${className}`.trim()} aria-hidden="true">
      {src ? (
        <img
          src={src}
          alt=""
          width="18"
          height="18"
          decoding="async"
          onError={() => setIndex((current) => current + 1)}
        />
      ) : (
        <span className="vl-site-favicon-fallback">
          {(name || host || '·').trim().charAt(0).toUpperCase() || '·'}
        </span>
      )}
    </span>
  )
}
