import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { buildSearchIndex, searchAll, siteHref, termHref } from '../lib/search-index.js'
import { navigate } from '../router.js'

/* ============ 顶栏全站搜索（方案 §3.6） ============
 * 全站唯一的搜索框，跨「图鉴术语」与「站点库」两份语料，结果分两组，
 * 每组最多 6 条，组尾一条「查看全部 →」跳到该语料的列表页（导流表 L10）。
 * ⌘K / Ctrl+K 聚焦本框——旧的独立命令面板已删除，键盘入口收在这里。
 *
 * 无障碍：input 是 role="combobox"，下拉是 role="listbox"，
 * 高亮项用 aria-activedescendant 指过去（焦点始终留在输入框）。
 */

/* 每组下拉里最多显示几条。这是版面参数，不是统计量。 */
const GROUP_LIMIT = 6

export default function GlobalSearch() {
  const [open, setOpen] = useState(false)      /* 移动端：搜索框是否展开 */
  const [keyword, setKeyword] = useState('')
  const [active, setActive] = useState(0)
  const [index, setIndex] = useState(null)
  const [loadState, setLoadState] = useState('idle')   /* idle | loading | ready | error */
  const inputRef = useRef(null)
  const rootRef = useRef(null)
  const domId = useId()

  /* 语料在第一次聚焦时才加载：图鉴语料有 220 条，没必要进首屏包。 */
  const ensureIndex = useCallback(() => {
    if (loadState !== 'idle') return
    setLoadState('loading')
    Promise.all([
      import('../data/visual-atlas.json').then((mod) => mod.default),
      import('../stages/manifests.js').then((mod) => mod.MANIFESTS),
      fetch('/data/site-index.json').then((res) => (res.ok ? res.json() : null)).catch(() => null),
    ]).then(([atlas, manifests, siteIndex]) => {
      setIndex(buildSearchIndex({ atlas, manifests, siteIndex }))
      setLoadState('ready')
    }).catch(() => setLoadState('error'))
  }, [loadState])

  /* ⌘K / Ctrl+K：展开并聚焦。Esc 在输入框内部处理，这里不抢。 */
  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen(true)
        ensureIndex()
        window.setTimeout(() => inputRef.current?.focus(), 0)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ensureIndex])

  /* 点到框外收起下拉（移动端连搜索框一起收起）。 */
  useEffect(() => {
    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setKeyword('')
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  const results = useMemo(
    () => (index ? searchAll(index, keyword, GROUP_LIMIT) : { terms: [], sites: [], termTotal: 0, siteTotal: 0 }),
    [index, keyword],
  )

  /* 可用方向键走的扁平列表：两组结果 + 各组的「查看全部」。 */
  const options = useMemo(() => {
    const trimmed = keyword.trim()
    if (!trimmed) return []
    const list = []
    for (const record of results.terms) {
      list.push({ key: `term:${record.id}`, group: 'term', href: termHref(record, trimmed), record })
    }
    if (results.termTotal > 0) {
      list.push({ key: 'term:all', group: 'term', href: `#/atlas?q=${encodeURIComponent(trimmed)}`, all: results.termTotal })
    }
    for (const record of results.sites) {
      list.push({ key: `site:${record.id}`, group: 'site', href: siteHref(record), record })
    }
    if (results.siteTotal > 0) {
      list.push({ key: 'site:all', group: 'site', href: `#/sites?q=${encodeURIComponent(trimmed)}`, all: results.siteTotal })
    }
    return list
  }, [keyword, results])

  const listOpen = keyword.trim().length > 0
  const listId = `${domId}-listbox`
  const activeId = options[active] ? `${domId}-opt-${active}` : undefined

  const closeAll = () => {
    setKeyword('')
    setOpen(false)
  }

  const runOption = (option) => {
    if (!option) return
    navigate(option.href)
    setKeyword('')
    setOpen(false)
    inputRef.current?.blur()
  }

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      if (keyword) setKeyword('')
      else closeAll()
      return
    }
    if (!listOpen || options.length === 0) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((current) => (current + 1) % options.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((current) => (current - 1 + options.length) % options.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      runOption(options[active])
    }
  }

  const renderGroup = (group, headingZh, headingCount) => {
    const members = options.filter((option) => option.group === group)
    if (members.length === 0) return null
    const headingId = `${domId}-${group}-heading`
    return (
      <div className="gs-group" role="group" aria-labelledby={headingId}>
        <p id={headingId} className="gs-group-h">
          <span>{headingZh}</span>
          <em className="x-mono">{headingCount}</em>
        </p>
        {members.map((option) => {
          const position = options.indexOf(option)
          return (
            <a
              key={option.key}
              id={`${domId}-opt-${position}`}
              className={`gs-opt ${position === active ? 'on' : ''}`}
              role="option"
              aria-selected={position === active}
              href={option.href}
              tabIndex={-1}
              onMouseEnter={() => setActive(position)}
              onClick={(event) => { event.preventDefault(); runOption(option) }}
            >
              {option.all !== undefined ? (
                <span className="gs-opt-all">查看全部 {option.all} 条 →</span>
              ) : option.group === 'term' ? (
                <>
                  <b>{option.record.termZhFix || option.record.termZh || option.record.termEn}</b>
                  <code className="x-mono">{option.record.termEn}</code>
                  <em>{option.record.stageTitleZh ? `${option.record.stageTitleZh} · 已入台` : '未入台'}</em>
                </>
              ) : (
                <>
                  <b>{option.record.name}</b>
                  <code className="x-mono">{option.record.domain || '域名未知'}</code>
                  <em>{option.record.takeawayZh || '未写'}</em>
                </>
              )}
            </a>
          )
        })}
      </div>
    )
  }

  return (
    <div className={`gs ${open ? 'open' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="gs-toggle"
        aria-label={open ? '收起搜索' : '打开搜索'}
        aria-expanded={open}
        onClick={() => {
          const next = !open
          setOpen(next)
          if (next) { ensureIndex(); window.setTimeout(() => inputRef.current?.focus(), 0) }
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="5.25" stroke="currentColor" strokeWidth="1.4" />
          <path d="M12 12L16 16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>

      <div className="gs-field">
        <span className="gs-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
            <circle cx="8" cy="8" r="5.25" stroke="currentColor" strokeWidth="1.4" />
            <path d="M12 12L16 16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="text"
          className="gs-input"
          role="combobox"
          aria-label="搜索站点与术语"
          aria-expanded={listOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          autoComplete="off"
          placeholder="搜站点与术语"
          value={keyword}
          onFocus={ensureIndex}
          onChange={(event) => { setKeyword(event.target.value); setActive(0) }}
          onKeyDown={onKeyDown}
        />
        <kbd className="gs-kbd x-mono">⌘K</kbd>
      </div>

      <div
        id={listId}
        className="gs-list"
        role="listbox"
        aria-label="搜索结果"
        hidden={!listOpen}
      >
        {loadState === 'loading' && <p className="gs-note">正在加载语料…</p>}
        {loadState === 'error' && <p className="gs-note" role="alert">语料没能加载，搜索暂不可用。</p>}
        {loadState === 'ready' && options.length === 0 && (
          <p className="gs-note">没有命中。图鉴与站点库都没有包含这个词的条目。</p>
        )}
        {renderGroup('term', '图鉴里的', results.termTotal)}
        {renderGroup('site', '站点库里的', results.siteTotal)}
      </div>
    </div>
  )
}
