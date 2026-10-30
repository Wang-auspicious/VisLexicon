import { useEffect, useState } from 'react'
import { INFO_ROUTES } from './data/site-info.js'

/* ============ hash 路由（方案 §9.2 冻结的路由段名） ============
 *
 * | hash                                  | name       | params            |
 * |---------------------------------------|------------|-------------------|
 * | `#/`（含空 hash）                      | curation   | —                 |
 * | `#/sites`                             | sites      | —                 |
 * | `#/site/<entryId>`                    | site       | entryId           |
 * | `#/atlas`                             | atlas      | —                 |
 * | `#/atlas/<stageId>`                   | atlas      | stageId           |
 * | `#/atlas/<stageId>/<termId>`          | atlas      | stageId, termId   |
 * | `#/about`（可带 `#submit` 片段）        | about      | —                 |
 * | `#/skills` / `#/skills/design|image`    | skills     | resourceType      |
 * | `#/ppt` / `#/science`                  | ppt/science| —                 |
 * | `#/sponsor` `#/submit` `#/privacy` `#/terms` `#/licence` `#/refunds` | 同名 | — |
 * | 其它（含 `#/tools` 等旧路径）            | notfound   | —                 |
 *
 * 旧版任何未知路径都静默落回首页；本版一律给真 404（方案 §9.3 WP-C）。
 * query 写在 hash 内：`#/sites?q=mit&licenses=MIT`；
 * 锚点片段写在 query 之后：`#/about#submit`。
 *
 * 2026-10-29 起地址栏用真网址（`/site/<id>`、`/sites?q=mit`、`/about#submit`），
 * 方便搜索引擎收录和分享。代码里仍然用上表的 `#/…` 写法：
 * - currentHash() 把真网址还原成 `#/…`，parseRoute 和读 query 的地方照旧；
 * - history.pushState/replaceState 收到 `#/…` 时自动改写成真网址；
 * - 点 `<a href="#/…">`、打开旧的 `#/…` 链接，都会被换成对应的真网址。
 */

const LIST_ROUTES = ['curation', 'sites', 'components', 'favorites']

/** 把 `#/sites?q=a#frag` 拆成 { path, query, fragment }。 */
function splitHash(rawHash) {
  const raw = String(rawHash || '').replace(/^#/, '')
  const hashAt = raw.indexOf('#')
  const beforeFragment = hashAt < 0 ? raw : raw.slice(0, hashAt)
  const fragment = hashAt < 0 ? '' : raw.slice(hashAt + 1)
  const queryAt = beforeFragment.indexOf('?')
  return {
    path: (queryAt < 0 ? beforeFragment : beforeFragment.slice(0, queryAt)).replace(/^\//, ''),
    search: queryAt < 0 ? '' : beforeFragment.slice(queryAt + 1),
    fragment,
  }
}

function parseQuery(search) {
  const query = {}
  if (!search) return query
  for (const [key, value] of new URLSearchParams(search)) query[key] = value
  return query
}

function matchPath(path) {
  const segments = path.split('/').filter(Boolean).map(decodeURIComponent)
  if (segments.length === 0) return { name: 'curation', params: {} }

  const [head, first, second] = segments
  if (head === 'sites' && segments.length === 1) return { name: 'sites', params: {} }
  if (head === 'curation-review' && segments.length === 1) return { name: 'curation-review', params: {} }
  if (head === 'components' && segments.length === 1) return { name: 'components', params: {} }
  if (head === 'playground' && segments.length === 1) return { name: 'playground', params: {} }
  if (head === 'favorites' && segments.length === 1) return { name: 'favorites', params: {} }
  if (head === 'skills' && (segments.length === 1 || (segments.length === 2 && ['design', 'image'].includes(first)))) {
    return { name: 'skills', params: { resourceType: first || 'design' } }
  }
  if (['ppt', 'science', 'graphics'].includes(head) && segments.length === 1) return { name: head, params: {} }
  if (head === 'site' && segments.length === 2 && first) return { name: 'site', params: { entryId: first } }
  if (head === 'about' && segments.length === 1) return { name: 'about', params: {} }
  if (INFO_ROUTES.includes(head) && segments.length === 1) return { name: head, params: {} }
  if (head === 'atlas' && segments.length <= 3) {
    return { name: 'atlas', params: { stageId: first, termId: second } }
  }
  return { name: 'notfound', params: {} }
}

/** `#/sites?q=a#frag` → `/sites?q=a#frag`。 */
export function hashToPath(hash) {
  const { path, search, fragment } = splitHash(hash)
  return `/${path}${search ? `?${search}` : ''}${fragment ? `#${fragment}` : ''}`
}

/** 当前地址对应的 `#/…` 写法。仍兼容地址栏里残留的旧 hash 路由。 */
export function currentHash() {
  if (typeof window === 'undefined') return ''
  const { pathname, search, hash } = window.location
  if (hash.startsWith('#/')) return hash
  const path = pathname.replace(/\/+$/, '').replace(/\.html$/, '')
  return `#${path || '/'}${search}${hash && hash !== '#' ? hash : ''}`
}

/* 真网址桥：其余代码继续写 `#/…`，地址栏得到的是真路径。 */
if (typeof window !== 'undefined' && !window.__vislexiconPathRouting) {
  window.__vislexiconPathRouting = true
  for (const method of ['pushState', 'replaceState']) {
    const original = window.history[method].bind(window.history)
    window.history[method] = (state, title, url) => original(state, title, typeof url === 'string' && url.startsWith('#/') ? hashToPath(url) : url)
  }
  const normalize = () => {
    if (window.location.hash.startsWith('#/')) window.history.replaceState(window.history.state, '', window.location.hash)
  }
  normalize()
  window.addEventListener('hashchange', normalize)
  /* 前进/后退在真路径之间不会触发 hashchange；转发一次，让所有监听者照旧工作。 */
  window.addEventListener('popstate', () => window.dispatchEvent(new HashChangeEvent('hashchange')))
  document.addEventListener('click', (event) => {
    const link = event.target instanceof Element ? event.target.closest('a[href^="#/"]') : null
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || (link.target && link.target !== '_self')) return
    event.preventDefault()
    navigate(link.getAttribute('href'))
  })
}

/** 解析当前地址。导出给非组件代码用（App 的底层路由记忆）。 */
export function parseRoute(rawHash = currentHash()) {
  const { path, search, fragment } = splitHash(rawHash)
  const matched = matchPath(path)
  return {
    ...matched,
    query: parseQuery(search),
    fragment,
    hash: `#/${path}${search ? `?${search}` : ''}${fragment ? `#${fragment}` : ''}`,
  }
}

/** 这条路由是不是「列表页」——站点详情叠层要在它上面渲染。 */
export function isListRoute(name) {
  return LIST_ROUTES.includes(name)
}

/** 返回 { name, params, query, hash, fragment }，随 hashchange 更新。 */
export function useRoute() {
  const [route, setRoute] = useState(() => parseRoute())

  useEffect(() => {
    const onChange = () => setRoute(parseRoute())
    window.addEventListener('hashchange', onChange)
    /* 挂载与首次事件之间 hash 可能已被改过（深链 + 重定向） */
    onChange()
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}

/** 只要 hash 上的 query 部分。切面 chips 与搜索结果页用它读 `?q=`。 */
export function useHashQuery() {
  return useRoute().query
}

/**
 * 跳转。`state` 非空时走 history.pushState + 手动派发 hashchange，
 * 这样 `history.state.from` 能记住「从哪个列表点进来的」，返回键才知道回哪。
 * @param {string} hash 完整 hash，如 `#/site/shadcn-ui`
 * @param {object} [state] 写进 history.state 的对象
 */
export function navigate(hash, state) {
  const target = String(hash || '#/')
  const normalized = target.startsWith('#') ? target : `#${target.startsWith('/') ? '' : '/'}${target}`
  if (typeof window === 'undefined') return
  if (normalized === currentHash()) {
    if (state !== undefined) window.history.replaceState(state, '', normalized)
    return
  }
  window.history.pushState(state ?? null, '', normalized)
  window.dispatchEvent(new HashChangeEvent('hashchange'))
}

/**
 * 兼容出口：`views/Atlas.jsx` 仍在用旧的 `go('atlas/...')` 形式（WP-F 下一波重写）。
 * 旧的 `go('index')`（「去网站库」）在新路由表里对应策展首页。
 */
export function go(path) {
  const cleaned = String(path || '').replace(/^\/+/, '')
  navigate(cleaned === 'index' || cleaned === '' ? '#/' : `#/${cleaned}`)
}
