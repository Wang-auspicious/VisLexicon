import { useMemo, useRef, useState } from 'react'
import { map } from './entries.js'
import { useStore, removeBoardItem, clearBoard } from './store.js'
import { useModalFocus } from './lib/use-modal-focus.js'
import { focusRemovalNeighbor } from './lib/modal-focus.js'

const TARGETS = {
  framework: ['react', 'next.js', 'vue', 'svelte'],
  style: ['tailwind', 'vanilla-css', 'css-in-js'],
  motion: ['css', 'framer-motion', 'gsap', 'motion'],
  pageType: ['landing', 'dashboard', 'app', 'blog'],
  theme: ['dark', 'light'],
}

const CONFLICTS = [
  { pair: ['neo-brutalism', 'glassmorphism'], msg: '新粗野与毛玻璃美学互斥：建议二选一，或分区使用（硬边框放工具区，玻璃放浮层）。' },
  { pair: ['glassmorphism', 'claymorphism'], msg: '毛玻璃与黏土拟物都是「材质」，同时出现会没有主材质；保留一个即可。' },
  { pair: ['terminal', 'editorial'], msg: '终端机能风与杂志编辑风的字体系统矛盾（等宽 vs 衬线 display）；明确主次或分开页面。' },
  { pair: ['neo-brutalism', 'claymorphism'], msg: '硬边高饱和与软陶圆润的体块语言相反，同屏会显得风格不稳。' },
  { pair: ['masonry', 'bento-grid'], msg: '瀑布流与便当格都是网格，但前者乱、后者规；建议按区块分开用。' },
]

export default function SpecPanel({ open, onClose }) {
  const store = useStore()
  const [t, setT] = useState({
    framework: 'react', style: 'tailwind', motion: 'css', pageType: 'landing', theme: 'dark',
  })
  const [status, setStatus] = useState('')
  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  const handleModalKey = useModalFocus({ open, dialogRef, initialFocusRef: closeRef, onClose })

  const board = store.board
  const ids = board.map((b) => b.id)

  const conflicts = useMemo(() => {
    return CONFLICTS.filter((c) => c.pair.every((id) => ids.includes(id)))
  }, [ids])

  const spec = useMemo(() => {
    const byAxis = {}
    board.forEach((b) => {
      const e = map[b.id]
      if (!e) return
      ;(byAxis[e.axis] = byAxis[e.axis] || []).push({
        lex: `lex:${e.id}`,
        params: b.params && Object.keys(b.params).length ? b.params : undefined,
      })
    })
    const acc = []
    board.forEach((b) => {
      const e = map[b.id]
      if (!e) return
      if (e.params?.length) {
        const vals = (e.params || []).map((q) => `${q.label}${b.params?.[q.k] ?? q.def}${q.unit}`).join('，')
        acc.push(`lex:${e.id} 的参数：${vals}，与演示一致`)
      } else {
        acc.push(`lex:${e.id} 的实现与词条演示一致`)
      }
    })
    const accent = '#6E56CF'
    return {
      spec_version: '1.0',
      spec_id: store.specId,
      intent: `${t.pageType} page, ${t.theme}, dev-tool vibe`,
      target: { framework: t.framework, style: t.style, motion: t.motion },
      aesthetic: (byAxis.aesthetic || []).map((x) => x.lex),
      layout: (byAxis.layout || []).map((x) => x.lex),
      interactions: (byAxis.interaction || []).map((x) => ({ pattern: x.lex, params: x.params })),
      tokens: {
        colors: { bg: t.theme === 'dark' ? '#0B0B0E' : '#FAFAF8', accent },
        radius: '14px',
        font: { heading: 'Geist Sans', body: 'Inter' },
      },
      acceptance: acc,
      conflict_warnings: conflicts.map((c) => c.msg),
    }
  }, [board, t, conflicts, store.specId])

  const specJson = JSON.stringify(spec, null, 2)
  const agentPrompt = `请根据下面的 VisLexicon Design Spec 实现界面。逐项满足 acceptance，并先处理 conflict_warnings；不要假设存在额外端点。\n\n${specJson}`

  if (!open) return null

  const copyText = async (text, label) => {
    if (!navigator.clipboard?.writeText) {
      setStatus('此浏览器不支持自动复制；请从上方手动复制。尚未发送。')
      return
    }
    try {
      await navigator.clipboard.writeText(text)
      setStatus(`${label}已复制到剪贴板，尚未发送。`)
    } catch {
      setStatus('复制失败；请从上方手动复制。尚未发送。')
    }
  }

  const downloadJson = () => {
    try {
      const blob = new Blob([specJson], { type: 'application/json;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${store.specId}.json`
      document.body.append(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 0)
      setStatus('已生成 JSON 下载，尚未发送。')
    } catch {
      setStatus('无法生成下载；请复制 JSON 后手动保存。尚未发送。')
    }
  }

  const removeItem = (id, index) => {
    const removeButtons = dialogRef.current?.querySelectorAll('[data-spec-remove]')
    focusRemovalNeighbor(removeButtons, index, closeRef.current)
    removeBoardItem(id)
  }

  return (
    <div className="spec-veil" onClick={onClose}>
      <aside ref={dialogRef} className="spec" role="dialog" aria-modal="true" aria-labelledby="spec-title" tabIndex={-1} onKeyDown={handleModalKey} onClick={(ev) => ev.stopPropagation()}>
        <header className="spec-head">
          <div>
            <strong id="spec-title">Design Spec</strong>
            <code className="x-mono">{store.specId}</code>
          </div>
          <div className="spec-head-btns">
            <button type="button" className="btn-ghost" onClick={clearBoard}>清空板</button>
            <button ref={closeRef} type="button" className="drawer-x" onClick={onClose} aria-label="关闭 Design Spec">×</button>
          </div>
        </header>

        {board.length === 0 && (
          <p className="spec-empty">
            板子空。从词典/词条页/鉴定树把词条加入 Spec 板——「挑」的结果就是一份 Agent 可执行的规格。
          </p>
        )}

        {/* 目标配置 */}
        <div className="spec-config">
          {Object.entries(TARGETS).map(([k, opts]) => (
            <label key={k} className="spec-config-row">
              <span className="x-mono">{k}</span>
              <select value={t[k]} onChange={(e) => setT({ ...t, [k]: e.target.value })}>
                {opts.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
          ))}
        </div>

        {/* 板内词条 */}
        <ul className="spec-list">
          {board.map((b, index) => {
            const e = map[b.id]
            return (
              <li key={b.id}>
                <code className="x-mono">lex:{b.id}</code>
                <span>{e?.zh}</span>
                {b.params && Object.keys(b.params).length > 0 && (
                  <em className="x-mono">
                    {(e?.params || []).map((q) => `${q.label} ${b.params[q.k]}${q.unit}`).join(' · ')}
                  </em>
                )}
                <button
                  type="button"
                  className="spec-x"
                  data-spec-remove
                  aria-label={`从 Spec 板移除 ${e?.zh || b.id}`}
                  onClick={() => removeItem(b.id, index)}
                >×</button>
              </li>
            )
          })}
        </ul>

        {conflicts.length > 0 && (
          <div className="spec-conflicts">
            {conflicts.map((c, i) => <p key={i}>⚠ 冲突：{c.msg}</p>)}
          </div>
        )}

        {board.length > 0 && (
          <>
            <h4 className="spec-h">Spec JSON</h4>
            <pre className="spec-json"><code>{specJson}</code></pre>
          </>
        )}

        <div className="spec-actions">
          <button type="button" className="btn-pick" onClick={() => copyText(specJson, 'JSON')} disabled={!board.length}>
            复制 JSON
          </button>
          <button type="button" className="btn-pick" onClick={downloadJson} disabled={!board.length}>下载 JSON</button>
          <button type="button" className="btn-primary" onClick={() => copyText(agentPrompt, 'Agent prompt')} disabled={!board.length}>复制 Agent prompt</button>
        </div>
        <p className="spec-note x-mono">本站没有 Agent 服务端。Spec 板会保存在本机；请复制或下载文件后自行交给 Agent，当前尚未发送。</p>
        {status && <p className="spec-sent x-mono" role="status">{status}</p>}
      </aside>
    </div>
  )
}
