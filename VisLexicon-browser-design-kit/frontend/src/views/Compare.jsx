import { useState } from 'react'
import { map } from '../entries.js'
import { go } from '../router.js'
import { saveBoardItem, useStore } from '../store.js'
import { DemoFrame, Sliders } from '../ui.jsx'
import { describeComparison } from '../lib/lexicon-integrity.js'

/* 两种实现并排查看；参数差异按真实数据说明，不伪称严格单变量实验。 */
export default function Compare({ a, b }) {
  const A = map[a]
  const B = map[b]
  const [pa, setPa] = useState({})
  const [pb, setPb] = useState({})
  const board = useStore().board

  const merged = (e, p) => {
    const o = {}
    ;(e?.params || []).forEach((q) => { o[q.k] = p[q.k] ?? Number(q.def) })
    return o
  }

  const bad = !A || !B
  if (bad) {
    return (
      <main className="grid-wrap">
        <p className="no-hit">对比组合不存在。回 <button type="button" className="btn-ghost" onClick={() => go('atlas')}>图鉴</button></p>
      </main>
    )
  }

  return (
    <main className="compare-page">
      <header className="page-head">
        <em className="x-mono">IMPLEMENTATION COMPARISON</em>
        <h1>{A.zh} vs {B.zh}</h1>
        <p>
          并排运行两种实现，分别调参，再依据实际轴与参数说明差异。不同词条可能同时改变多项，不把它包装成严格单变量实验。
        </p>
      </header>

      <div className="compare-row">
        {[A, B].map((e, i) => {
          const p = i === 0 ? merged(A, pa) : merged(B, pb)
          const set = i === 0 ? setPa : setPb
          const saved = board.some((item) => item.id === e.id)
          return (
            <div key={e.id} className="compare-col">
              <div className="compare-head">
                <code className="x-mono">lex:{e.id}</code>
                <b>{e.term}</b>
                <em>{e.zh}</em>
              </div>
              <div className="compare-demo">
                <DemoFrame entry={{ ...e, p }} active />
              </div>
              <Sliders entry={e} value={i === 0 ? pa : pb} onChange={set} />
              <p className="compare-def">{e.def}</p>
              <div className="compare-btns">
                <button type="button" className="btn-ghost" onClick={() => go(`entry/${e.id}`)}>剖解台 ↗</button>
                <button type="button" className={`btn-pick ${saved ? 'on' : ''}`} onClick={() => saveBoardItem(e.id, p)}>
                  {saved ? '更新 Spec 参数' : '+ 入 Spec'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="diff-note x-mono">
        △ 实际差异：{describeComparison(A, B, pa, pb)}
        — 怀疑识别错词条？走 <button type="button" className="btn-ghost" onClick={() => go('key')}>检索表</button> 重新鉴定
      </div>
    </main>
  )
}
