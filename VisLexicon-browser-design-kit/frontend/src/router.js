import { useEffect, useState } from 'react'

/* 极简 hash router：默认进入策展；词典与专业频道使用显式 hash 路径。 */
function parse() {
  const raw = window.location.hash.replace(/^#\/?/, '')
  const [seg, ...rest] = raw.split('/')
  return { view: seg || 'index', id: rest[0], a: rest[0], b: rest[1] }
}

export function useRoute() {
  const [route, setRoute] = useState(parse)

  useEffect(() => {
    const on = () => {
      setRoute(parse())
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  return route
}

export function go(path) {
  window.location.hash = path ? `#/${path}` : '/'
}

export function url(path) {
  return `#/${path}`
}
