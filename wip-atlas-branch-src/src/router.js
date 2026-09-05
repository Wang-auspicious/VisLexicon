import { useEffect, useState } from 'react'

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
 * | 其它（含 `#/tools` `#/submit` 等旧路径） | notfound   | —                 |
 *
 * 旧版任何未知路径都静默落回首页；本版一律给真 404（方案 §9.3 WP-C）。
 * query 写在 hash 内：`#/sites?q=mit&licenses=MIT`；
 * 锚点片段写在 query 之后：`#/about#submit`。
 */

const LIST_ROUTES = ['curation', 'sites']

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
  if (head === 'site' && segments.length === 2 && first) return { name: 'site', params: { entryId: first } }
  if (head === 'about' && segments.length === 1) return { name: 'about', params: {} }
  if (head === 'atlas' && segments.length <= 3) {
    return { name: 'atlas', params: { stageId: first, termId: second } }
  }
  return { name: 'notfound', params: {} }
}

/** 解析当前 location.hash。导出给非组件代码用（App 的底层路由记忆）。 */
export function parseRoute(rawHash = typeof window === 'undefined' ? '' : window.location.hash) {
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
  if (normalized === window.location.hash) {
    if (state !== undefined) window.history.replaceState(state, '', normalized)
    return
  }
  if (state === undefined) {
    window.location.hash = normalized
    return
  }
  window.history.pushState(state, '', normalized)
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
