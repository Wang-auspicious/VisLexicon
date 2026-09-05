import { useEffect, useMemo, useRef, useState } from 'react'
import { ENTRIES } from './entries.js'
import { COMPONENTS } from './index.js'
import { go } from './router.js'
import { useModalFocus } from './lib/use-modal-focus.js'
import { handlePaletteNavigationKey } from './lib/palette-keyboard.js'

const ACTIONS = [
  { id: 'k:key', label: '检索表 · 说不清时的鉴定树', hint: 'dichotomous key', kind: 'action', run: () => go('key') },
  { id: 'k:matrix', label: '变体矩阵 · 同一标本 × N 种实现', hint: 'variant matrix', kind: 'action', run: () => go('matrix/surface') },
  { id: 'k:index', label: '组件索引 · 开源生态', hint: 'ecosystem index', kind: 'action', run: () => go('index') },
  { id: 'k:tools', label: '测量工具 · Spec 提取 / Diff', hint: 'measurement', kind: 'action', run: () => go('tools') },
  { id: 'k:submit', label: '提交 · 收录词条 / 库', hint: 'community', kind: 'action', run: () => go('submit') },
]

export default function Palette({ open, onClose, onOpenSpec }) {
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const boxRef = useRef(null)
  const listRef = useRef(null)
  const dialogRef = useRef(null)
  const handleModalKey = useModalFocus({ open, dialogRef, initialFocusRef: boxRef, onClose })

  const items = useMemo(() => {
    const kw = q.trim().toLowerCase()
    const src = [
      ...ENTRIES.map((e) => ({
        id: e.id, label: `${e.term} · ${e.zh}`, hint: `lex:${e.id}`,
        kind: 'term', sub: e.def,
      })),
      ...COMPONENTS.map((c) => ({
        id: c.id, label: c.title, hint: c.id, kind: 'component', sub: c.note, site: c.site,
      })),
      ...ACTIONS.map((a) => ({ ...a })),
    ]
    if (!kw) return src
    return src.filter((s) =>
      (s.label + ' ' + s.hint + ' ' + (s.sub || '')).toLowerCase().includes(kw),
    )
  }, [q])
  const visibleItems = items.slice(0, 18)

  useEffect(() => {
    if (!open) return undefined
    const resetTimer = window.setTimeout(() => {
      setQ('')
      setSel(0)
    }, 10)
    return () => window.clearTimeout(resetTimer)
  }, [open])

  useEffect(() => {
    if (open && visibleItems.length > 0) {
      listRef.current?.children[sel]?.scrollIntoView({ block: 'nearest' })
    }
  }, [sel, open, visibleItems.length])

  if (!open) return null

  const run = (item) => {
    if (!item) return
    if (item.kind === 'action') item.run()
    else if (item.kind === 'component') window.open(item.site, '_blank', 'noreferrer')
    else go(`entry/${item.id}`)
    onClose()
  }

  const onKey = (e) => {
    handleModalKey(e)
    if (e.defaultPrevented) return
    if (!open) return
    handlePaletteNavigationKey(e, {
      searchInput: boxRef.current,
      itemCount: visibleItems.length,
      selectedIndex: sel,
      onSelect: setSel,
      onOpenSelected: (index) => run(visibleItems[index]),
    })
  }

  const onVeilClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="pal-veil" onClick={onVeilClick}>
      <div ref={dialogRef} className="palette" role="dialog" aria-modal="true" aria-labelledby="palette-title" tabIndex={-1} onKeyDown={onKey}>
        <div className="pal-input">
          <span id="palette-title" className="x-mono">⌕ 搜索</span>
          <input ref={boxRef} value={q} placeholder="搜词条 / 组件 / 口语别名 / 工具…"
            onFocus={() => setSel((current) => current < 0 && visibleItems.length > 0 ? 0 : current)}
            onChange={(e) => { setQ(e.target.value); setSel(0) }} />
          <kbd className="x-mono">ESC</kbd>
        </div>
        <div className="pal-list" ref={listRef}>
          {items.length === 0 && <p className="pal-empty">没命中。试试「毛玻璃」「磁吸」。</p>}
          {visibleItems.map((item, i) => (
            <button
              type="button"
              key={item.id + i}
              className={`pal-item ${i === sel ? 'on' : ''}`}
              onFocus={() => setSel(i)}
              onClick={() => run(item)}
            >
              <span className="pal-kind x-mono">{item.kind === 'term' ? '词条' : item.kind === 'component' ? '组件' : '工具'}</span>
              <b>{item.label}</b>
              <code className="x-mono">{item.hint}</code>
              <em>{item.sub}</em>
            </button>
          ))}
        </div>
        <div className="pal-foot x-mono">
          <span>↑↓ 选择</span><span>↵ 打开</span><span>⌘K 呼出/关闭</span>
          <button type="button" onFocus={() => setSel(-1)} onClick={onOpenSpec} className="pal-foot-spec" style={{ padding: 0 }}>Spec 板 →</button>
        </div>
      </div>
    </div>
  )
}
