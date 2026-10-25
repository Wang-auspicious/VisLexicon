import { useEffect, useMemo, useRef, useState } from 'react'
import { categoryById, nameOf, queryLang, summaryOf } from './model.js'

// Chinese and English words that mean the same thing. A query that names one
// member searches for all of them, so "按钮" finds "button" tags and back.
const SYNONYMS = [
  ['按钮', 'button', 'cta'], ['背景', 'background', '底纹', 'pattern'], ['边框', 'border', '描边', 'outline'],
  ['数字', 'number', 'counter', '计数', 'stat', '统计'], ['进度', 'progress', 'gauge', '百分比'],
  ['导航', 'nav', 'navigation', 'menu', '菜单', '侧栏', 'sidebar'], ['加载', 'loading', 'loader', 'spinner', '等待'],
  ['图表', 'chart', '柱状图', 'bar', 'graph', '可视化'], ['流程', 'flow', '节点', 'node', 'workflow', 'dag', '工作流', 'diagram'],
  ['拖拽', 'drag', '拖动', 'resizable', '调整大小'], ['布局', 'layout', '网格', 'grid', '分栏', 'split'],
  ['日期', 'date', 'calendar', '日历', '时间', 'time'], ['文档', 'markdown', 'md', '富文本', 'docs'],
  ['定价', 'pricing', 'price', '价格', '套餐', 'plan'], ['首屏', 'hero', '英雄区', 'landing', '主视觉'],
  ['头像', 'avatar'], ['标签栏', 'tabs', 'tab', '选项卡'], ['动画', 'animation', 'motion', '动效', '动'],
  ['发光', 'glow', '流光', 'shimmer', 'shine', '光'], ['放大', 'magnify', 'dock', '程序坞'], ['地球', 'globe', 'world'],
]
const norm = s => s.toLowerCase().normalize('NFKC')

function expand(query) {
  const q = norm(query)
  const words = q.split(/[\s,，、/|]+/).filter(Boolean)
  const terms = new Set(words)
  for (const group of SYNONYMS) if (group.some(w => q.includes(w))) group.forEach(w => terms.add(w))
  return { q, terms: [...terms] }
}

/** Every searchable token of an entry, built once. */
export function indexEntry(e) {
  const category = categoryById[e.category]
  const tokens = [...(e.tags ?? []), e.zh, e.en, category?.zh ?? '', category?.en ?? '', e.source.site ?? ''].map(v => norm(String(v)))
  return { e, tokens, text: norm([e.zh, e.en, e.summaryZh, e.summaryEn, ...e.tags].join(' ')) }
}

/** Score one entry: a token named in the query, or a query word inside a token. */
export function score(row, { q, terms }) {
  let s = 0
  for (const token of row.tokens) {
    if (token.length >= 2 && q.includes(token)) s += 3
    else for (const term of terms) if (term.length >= 2 && token.includes(term)) { s += 2; break }
  }
  if (s === 0) for (const term of terms) if (term.length >= 2 && row.text.includes(term)) s += 1
  return s
}
// Weak overlap, used only to choose which candidates Jev looks at when nothing matched.
const overlap = (row, q) => [...new Set(q)].filter(ch => ch.trim() && row.text.includes(ch)).length

export function localSearch(rows, query) {
  const parsed = expand(query)
  const scored = rows.map(row => ({ row, s: score(row, parsed), w: overlap(row, parsed.q) }))
  const hits = scored.filter(x => x.s > 0).sort((a, b) => b.s - a.s || a.row.e.index - b.row.e.index)
  const rest = scored.filter(x => x.s === 0).sort((a, b) => b.w - a.w || a.row.e.index - b.row.e.index)
  return { hits: hits.map(x => x.row.e), ranked: [...hits, ...rest].map(x => x.row.e) }
}

const JEV_LIMIT = 8
const SETTLE_MS = 650

/**
 * Search inside the current scope. Every keystroke narrows locally at once.
 * When typing settles, Jev judges at most eight candidates in one request.
 * A query that extends the previous one keeps Jev inside the previous matches.
 */
export function useBenchSearch(scope, query) {
  const rows = useMemo(() => scope.map(indexEntry), [scope])
  const trimmed = query.trim()
  const [jev, setJev] = useState(null)
  const settled = useRef(null)
  const scopeKey = useMemo(() => scope.map(e => e.id).join(','), [scope])
  const local = useMemo(() => {
    if (!trimmed) return null
    const previous = settled.current
    const refine = Boolean(previous && previous.scopeKey === scopeKey && trimmed.startsWith(previous.query) && trimmed !== previous.query)
    const ids = refine ? new Set(previous.matches) : null
    return { ...localSearch(ids ? rows.filter(row => ids.has(row.e.id)) : rows, trimmed), refine }
  }, [rows, trimmed, scopeKey])
  const refine = local?.refine ?? false

  useEffect(() => {
    if (trimmed.length < 2 || !local) return
    const lang = queryLang(trimmed)
    const candidates = local.ranked.slice(0, JEV_LIMIT)
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      if (!candidates.length) {
        setJev({ query: trimmed, scopeKey, state: 'done', candidates: [], matches: [], refine, lang, latencyMs: 0, cached: true })
        return
      }
      setJev({ query: trimmed, scopeKey, state: 'running', candidates: candidates.map(e => e.id), refine: Boolean(refine), lang })
      try {
        const response = await fetch('/api/jev/rank', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
          body: JSON.stringify({ query: trimmed, lang, candidates: candidates.map(e => ({ id: e.id, name: nameOf(e, lang), category: categoryById[e.category][lang], summary: summaryOf(e, lang), tags: e.tags })) }),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'JEV_UNAVAILABLE')
        const scores = Object.fromEntries(data.rows.map(r => [r.id, r.score]))
        const matches = data.rows.filter(r => r.score >= 1.5).sort((a, b) => b.score - a.score).map(r => r.id)
        settled.current = { query: trimmed, scopeKey, matches }
        setJev({ query: trimmed, scopeKey, state: 'done', scores, matches, candidates: candidates.map(e => e.id), refine: Boolean(refine), lang, latencyMs: data.latencyMs, cached: Boolean(data.cached), model: data.model })
      } catch (error) {
        if (controller.signal.aborted) return
        setJev({ query: trimmed, scopeKey, state: 'error', error: error.message, candidates: candidates.map(e => e.id), lang })
      }
    }, SETTLE_MS)
    return () => { clearTimeout(timer); controller.abort() }
  }, [trimmed, scopeKey, local])

  if (!trimmed) return { items: scope, lang: 'zh', jev: null, localCount: scope.length }
  const lang = queryLang(trimmed)
  const current = jev && jev.query === trimmed && jev.scopeKey === scopeKey ? jev : null
  let items = local.hits
  if (current?.state === 'done') {
    // Jev's matches first, then local hits Jev did not see; candidates Jev rejected drop out.
    const judged = new Set(current.candidates)
    items = [...current.matches.map(id => scope.find(e => e.id === id)), ...local.hits.filter(e => !judged.has(e.id))]
  }
  return { items, lang, jev: current ?? (trimmed.length >= 2 ? { state: 'waiting', lang } : null), localCount: local.hits.length }
}
