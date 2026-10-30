/** Shared by the React column inputs and the existing atlas iframe input.
 * A displayed page is never the candidate universe. The server owns that set;
 * tokens bind pagination and refinements to one immutable search snapshot. */
export const DISCOVERY_INPUT_DELAY = 220
const abortError = () => new DOMException('Search cancelled', 'AbortError')
export function waitForSearch(ms, signal) {
  if (signal?.aborted) return Promise.reject(abortError())
  return new Promise((resolve, reject) => {
    const done = () => { signal?.removeEventListener('abort', stop); resolve() }
    const timer = setTimeout(done, ms)
    const stop = () => { clearTimeout(timer); signal?.removeEventListener('abort', stop); reject(abortError()) }
    signal?.addEventListener('abort', stop, { once: true })
  })
}
export async function discoveryRequest(path, payload, signal, fetchImpl = fetch) {
  for (let attempt = 0; ; attempt++) {
    signal?.throwIfAborted()
    const response = await fetchImpl(path, { ...(payload ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) } : {}), signal })
    if ([404,405,501].includes(response.status)) throw Error('API_UNAVAILABLE')
    const data = await response.json()
    if (response.status === 429 && data.error === 'MODEL_BUSY' && attempt < 4) { await waitForSearch(250 * (attempt + 1), signal); continue }
    if (!response.ok) throw Error(data.error || 'MODEL_UNAVAILABLE')
    return data
  }
}

/** Candidate storage remains complete; presentation switches to confirmed rows
 * as soon as review begins, so unrelated pending rows cannot look like matches. */
export function displayDiscoveryResponse(response) {
  if (!response) return null
  if (!(response.judgedCount > 0)) return response
  return { ...response, units: (response.units || []).filter(unit => unit.matchStatus === 'confirmed'), matchCount: response.confirmedCount || 0 }
}
export function atlasDiscoveryId(category, item) {
  return category.hasPractices && category.file === null ? `study--${item.id}` : `atlas-term--${category.id}--${item.id}`
}

export function discoveryStatus(state, en = false) {
  const data = state.response
  const old = data && data.query !== state.query.trim()
  if (!state.query.trim()) return ''
  if (state.status === 'error' && old) return en ? 'This update failed; showing the previous results.' : '本次检索未完成，仍显示上次结果。'
  if (state.status === 'error' && !data) return en ? 'Could not update results.' : '暂时无法更新检索结果。'
  // Public site: the shared rank function declined; the first-pass order stays.
  if (state.status === 'error' && /^RANK_/.test(state.error || '')) {
    const reason = state.error === 'RANK_DAILY_LIMIT' ? (en ? "Today's AI ranking quota is used up" : '今日 AI 精排额度已用完')
      : state.error === 'RANK_RATE_LIMITED' ? (en ? 'Too many requests, AI ranking resumes shortly' : '请求太频繁，AI 精排稍后恢复')
      : (en ? 'AI ranking is unavailable' : 'AI 精排暂不可用')
    return en ? `${reason} · sorted by keyword match` : `${reason} · 已按关键词相关度排序`
  }
  if (state.composing) return en ? 'Finish typing to update results.' : '输入完成后更新结果。'
  if (state.status === 'waiting' || state.status === 'preparing') return old ? (en ? 'Updating… Previous results remain until ready.' : '正在更新，暂保留上次结果…') : (en ? 'Finding candidates in this topic…' : '正在当前主题里筛选候选…')
  const judged = data?.judgedCount ?? data?.candidateCount ?? 0
  const confirmed = data?.confirmedCount ?? (data?.mode === 'jev' ? data?.matchCount : 0) ?? 0
  const remaining = data?.remainingCount ?? 0
  const count = data?.eligibleCount ?? data?.matchCount ?? 0
  const prefix = data?.refinement === 'refined' ? (en ? 'Refined · ' : '已继续筛选 · ') : data?.refinement === 'reset' ? (en ? 'Searched this topic again · ' : '已重新检索当前主题 · ') : ''
  if (data) return prefix + (!(data.judgedCount > 0) ? (en ? 'Awaiting Jev review · ' : '待 Jev 判断 · ') : '') + (en ? `${count} preliminary candidates · Jev reviewed ${judged}, confirmed ${confirmed}${remaining ? ` · ${remaining} awaiting review` : ''}` : `${count} 个初筛候选 · Jev 已判断 ${judged} 个，确认 ${confirmed} 个${remaining ? ` · ${remaining} 个待判断` : ''}`)
  return en ? 'Finding candidates in this topic…' : '正在当前主题里筛选候选…'
}

export function createDiscoverySearch({ scope, theme = '', indexVersion, allowedIds, filters, onChange = () => {}, onIndexMismatch = () => {}, request = discoveryRequest, delay = DISCOVERY_INPUT_DELAY, pageSize = 12, active = true, sessionId = globalThis.crypto.randomUUID() }) {
  let state = { query: '', response: null, status: 'idle', composing: false, loadingMore: false, pageError: null, error: null }
  let version = 0, controller, pageController, timer, destroyed = false, enabled = active, shown = pageSize
  const emit = patch => { if (!destroyed) { state = { ...state, ...patch }; onChange(state) } }
  const valid = (id, signal) => !destroyed && id === version && !signal.aborted
  const stop = () => { clearTimeout(timer); controller?.abort(); pageController?.abort(); version++ }
  const check = data => {
    if (data.scope !== scope || (data.theme || '') !== theme) throw Error('SCOPE_MISMATCH')
    if (indexVersion && data.indexVersion !== indexVersion) { onIndexMismatch(); throw Error('INDEX_CHANGED') }
  }
  const payload = (query, id, token, reviewMore = false) => ({ query, scope, theme, sessionId, requestId: id, refineToken: token || undefined, reviewMore, limit: Math.min(240, shown), ...(allowedIds ? { allowedIds } : {}), ...(filters ? { filters } : {}) })
  const run = async () => {
    const id = version, query = state.query.trim()
    if (!query || state.composing || !enabled || destroyed) return
    const ctl = new AbortController(); controller = ctl
    emit({ status: 'preparing', error: null })
    try {
      const prepared = await request('/api/discovery/prepare', payload(query, id, state.response?.refineToken), ctl.signal)
      if (!valid(id, ctl.signal)) return
      check(prepared); emit({ response: { ...prepared, query }, status: prepared.remainingCount ? 'ranking' : 'ready' })
      let snapshot = prepared, reviewMore = false
      while (snapshot.remainingCount > 0 && valid(id, ctl.signal) && enabled) {
        // Let a user-requested page settle before changing its immutable token.
        while (state.loadingMore && valid(id, ctl.signal)) await waitForSearch(40, ctl.signal)
        const next = await request('/api/discovery/search', payload(query, id, snapshot.refineToken, reviewMore), ctl.signal)
        if (!valid(id, ctl.signal)) return
        check(next)
        // Static site: the capped rank function declined; keep the first-pass results and say why.
        if (next.rankError) throw Error(next.rankError)
        // A user may have expanded beyond the response's 240-card limit while
        // the model was working. Refill that window from the new immutable
        // token before swapping it in; never collapse the user's loaded rows.
        while (state.loadingMore && valid(id, ctl.signal)) await waitForSearch(40, ctl.signal)
        const target = Math.min(shown, next.matchCount)
        while (next.units.length < target && valid(id, ctl.signal)) {
          const offset = next.units.length
          const params = new URLSearchParams({ scope, theme, token: next.refineToken, offset: String(offset), limit: String(Math.min(24, target-offset)) })
          const page = await request(`/api/discovery/page?${params}`, null, ctl.signal)
          if (!valid(id, ctl.signal)) return
          check(page)
          if (page.offset !== offset || !page.units?.length) throw Error('PAGE_UNAVAILABLE')
          next.units = [...new Map([...next.units, ...page.units].map(unit => [unit.id, unit])).values()]
          if (next.units.length <= offset) throw Error('PAGE_UNAVAILABLE')
        }
        const stalled = next.remainingCount > 0 && next.judgedCount <= (snapshot.judgedCount || 0)
        snapshot = next
        emit({ response: { ...next, query }, status: next.remainingCount ? 'ranking' : 'ready' })
        if (stalled) throw Error('MODEL_NO_PROGRESS')
        reviewMore = true
        if (next.remainingCount) await waitForSearch(50, ctl.signal)
      }
      if (valid(id, ctl.signal)) emit({ status: 'ready' })
    } catch (error) {
      if (valid(id, ctl.signal)) emit({ status: 'error', error: error.message })
    }
  }
  const schedule = () => {
    if (!state.query.trim() || state.composing || !enabled) return
    timer = setTimeout(run, delay)
  }
  return {
    getState: () => state,
    setQuery(query, { composing = state.composing } = {}) {
      if (query === state.query && composing === state.composing) return
      stop(); shown = pageSize
      emit({ query, composing, status: query.trim() ? 'waiting' : 'idle', ...(!query.trim() ? { response: null } : {}), error: null, loadingMore: false, pageError: null })
      schedule()
    },
    setComposing(composing) { this.setQuery(state.query, { composing }) },
    retry() { stop(); emit({ status: 'waiting', error: null, pageError: null, loadingMore: false }); schedule() },
    setActive(value) { if (enabled === value) return; enabled = value; stop(); emit({ loadingMore: false }); if (enabled) schedule() },
    async loadMore() {
      // The observer stops on pageError. A deliberate retry of an expired
      // snapshot must refresh its token rather than repeat the same 410.
      if (state.pageError === 'SEARCH_EXPIRED') { this.retry(); return }
      if (['waiting','preparing'].includes(state.status)) return
      if (state.loadingMore || !state.response || state.response.query !== state.query.trim() || state.response.units.length >= state.response.matchCount) return
      const id = version, ctl = new AbortController(); pageController = ctl
      emit({ loadingMore: true, pageError: null })
      try {
        // A review already in flight may finish during the page request. Retry
        // against its new token rather than appending an obsolete page.
        for (let attempt = 0; attempt < 3; attempt++) {
          const snapshot = state.response, offset = snapshot.units.length
          const params = new URLSearchParams({ scope, theme, token: snapshot.refineToken, offset: String(offset), limit: String(Math.min(24, pageSize)) })
          const data = await request(`/api/discovery/page?${params}`, null, ctl.signal)
          if (!valid(id, ctl.signal)) return
          check(data)
          if (state.response.refineToken !== snapshot.refineToken) continue
          if (data.offset !== offset) throw Error('PAGE_UNAVAILABLE')
          const units = [...new Map([...snapshot.units, ...data.units].map(unit => [unit.id, unit])).values()]
          shown = units.length
          emit({ response: { ...snapshot, units } }); return
        }
        throw Error('PAGE_UNAVAILABLE')
      } catch (error) { if (valid(id, ctl.signal)) emit({ pageError: error.message }) }
      finally { if (valid(id, ctl.signal)) emit({ loadingMore: false }) }
    },
    destroy() { stop(); destroyed = true },
  }
}
