import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
// The atlas uses this same browser module so cancellation, refinement and
// pagination cannot drift between the iframe and the React column inputs.
const moduleUrl = '/discovery-search-session.js'
let runtimePromise
const loadRuntime = () => runtimePromise ||= import(/* @vite-ignore */ new URL(moduleUrl, window.location.origin).href)
const initialState = { query: '', response: null, status: 'idle', composing: false, loadingMore: false, pageError: null, error: null }
export function useDiscoverySearch({ query, scope, theme = '', indexVersion, allowedIds, filters, composing = false, onIndexMismatch, pageSize = 12 }) {
  const [state, setState] = useState(initialState)
  const current = useRef({ query, composing, onIndexMismatch })
  useLayoutEffect(() => { current.current = { query, composing, onIndexMismatch } }, [query, composing, onIndexMismatch])
  const controller = useRef(null)
  const [runtime, setRuntime] = useState(null)
  const contextKey = JSON.stringify({ scope, theme, indexVersion, allowedIds, filters, pageSize })
  useEffect(() => {
    let live = true
    setState({ ...initialState, query: current.current.query, status: current.current.query.trim() ? 'waiting' : 'idle' })
    loadRuntime().then(module => {
      if (!live) return
      setRuntime(module)
      const search = module.createDiscoverySearch({ ...JSON.parse(contextKey), active: !document.hidden, onChange: setState, onIndexMismatch: () => current.current.onIndexMismatch?.() })
      controller.current = search
      search.setQuery(current.current.query, { composing: current.current.composing })
    }).catch(error => { if (live) setState({ ...initialState, query: current.current.query, status: 'error', error: error.message }) })
    const onVisibility = () => controller.current?.setActive(!document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => { live = false; controller.current?.destroy(); controller.current = null; document.removeEventListener('visibilitychange', onVisibility) }
  }, [contextKey])
  useEffect(() => { controller.current?.setQuery(query, { composing }) }, [query, composing])
  const loadMore=useCallback(()=>controller.current?.loadMore(),[])
  return {
    ...state,
    displayResponse: runtime?.displayDiscoveryResponse(state.response) || null,
    // Calling from input handlers cancels before the next React effect runs.
    updateQuery: (value, options) => controller.current?.setQuery(value, options),
    setComposing: value => controller.current?.setComposing(value),
    loadMore,
    retry: () => controller.current?.retry(),
    statusText: en => runtime?.discoveryStatus({ ...state, query }, en) || '',
  }
}
