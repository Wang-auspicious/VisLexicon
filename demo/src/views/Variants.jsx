import { useState } from 'react'
import { FAMILIES, VariantMatrix } from '../variants.jsx'
import { go } from '../router.js'
import { CopyBtn } from '../ui.jsx'

const FAMILY_META = [
  { id: 'surface', glyph: '◐', count: '×12' },
  { id: 'frame', glyph: '◧', count: '×10' },
  { id: 'ease', glyph: '➤', count: '×12' },
  { id: 'reveal', glyph: '✦', count: '×10' },
  { id: 'hover', glyph: '☞', count: '×10' },
  { id: 'morph', glyph: '⇄', count: '4×4' },
]

/* 变体矩阵：同一个标本 × N 种实现 —— 「同一个设计分成十几种做法」的坐标.answer */
export default function Variants({ fam: famId, self = null }) {
  const fam = FAMILIES[famId] ? famId : 'surface'
  const [picked, setPicked] = useState('')

  return (
    <div className="matrix-page">
      <header className="page-head">
        <em className="x-mono">VARIANT MATRIX · 同一标本 × N 种实现</em>
        <h1>变体矩阵</h1>
        <p>
          「同一个设计，能分成十几种实现」——枚举写不完，<b>给坐标系</b>。
          每条通道锁死标本内容、只动一位基因：材质、骨架、时间、入场、指针、形变。
          格子全是活代码，单变量对照，差在哪一眼看见。
        </p>
      </header>

      <div className="matrix-wrap">
        <aside className="matrix-rail">
          <span className="rail-h">基因通道</span>
          {FAMILY_META.map((m) => {
            const f = FAMILIES[m.id]
            return (
              <button
                type="button"
                key={m.id}
                className={`rail-item ${m.id === fam ? 'on' : ''}`}
                onClick={() => go(`matrix/${m.id}`)}
              >
                <i>{m.glyph}</i>
                <span className="mr-t"><b>{f.title}</b><em>{f.en}</em></span>
                <b>{m.count}</b>
              </button>
            )
          })}
          <span className="rail-h">用法</span>
          <span className="wall-note">
            选中词条会以「本词条」标出它在通道里的位置；形变通道是 from × to
            的二维矩阵，可再乘三条修饰通道。点的每一格都可以直接抄走。
          </span>
        </aside>

        <div className="matrix-body">
          <VariantMatrix famId={fam} self={self} onPick={setPicked} />
          {picked && (
            <div className="matrix-selection" role="status">
              <span className="x-mono">当前坐标</span>
              <code>{picked}</code>
              <CopyBtn text={picked} label="复制坐标" done="✓ 已复制" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
