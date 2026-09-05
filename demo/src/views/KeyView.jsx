import { useState } from 'react'
import { KEY } from '../key.js'
import { map } from '../entries.js'
import { go } from '../router.js'
import { saveBoardItem, useStore } from '../store.js'
import { DemoFrame } from '../ui.jsx'

/* 交互式二叉鉴定树 */
export default function KeyView() {
  const [branch, setBranch] = useState([]) // 已走过的 [题目, 答案]
  const [nodeId, setNodeId] = useState(KEY.root)
  const board = useStore().board

  const node = KEY.nodes[nodeId]
  const isLeaf = nodeId.startsWith('result:')

  const reset = () => { setNodeId(KEY.root); setBranch([]) }
  const back = () => {
    if (nodeId === KEY.root) return
    if (isLeaf) { setNodeId(branch[branch.length - 1][0]); setBranch((b) => b.slice(0, -1)) }
    else { setNodeId(branch[branch.length - 1][0] || KEY.root); setBranch((b) => b.slice(0, -1)) }
  }
  const choose = (opt) => {
    setBranch((b) => [...b, [nodeId, opt.t]])
    setNodeId(opt.next)
  }

  const result = isLeaf ? map[nodeId.replace('result:', '')] : null
  const boardItem = result ? board.find((item) => item.id === result.id) : null

  return (
    <main className="key-page">
      <header className="page-head">
        <em className="x-mono">DICHOTOMOUS KEY · 像鉴定植物一样鉴定动效</em>
        <h1>检索表</h1>
        <p>说不清？不需要词汇量，只需要会做选择题。每步两个对比分支——点哪个像你要的。</p>
      </header>

      <div className="key-board">
        <div className="key-path">
          {branch.map((b, i) => (
            <span key={i} className="key-step x-mono">
              <i>{b[0].replace('k-', '')}</i> {b[1]} <b>›</b>
            </span>
          ))}
          <span className="key-now x-mono">{isLeaf ? 'RESULT' : nodeId.replace('k-', '').toUpperCase()}</span>
        </div>

        {!isLeaf ? (
          <div className="key-question">
            <h2>{node.q}</h2>
            <div className="key-opts">
              {node.opts.map((opt, i) => (
                <button type="button" key={i} className="key-opt" onClick={() => choose(opt)}>
                  <b>{String(i + 1).padStart(2, '0')}</b>
                  <span>{opt.t}</span>
                  <i>→</i>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="key-result">
            <div className="key-result-demo">
              <DemoFrame entry={result} active />
            </div>
            <div className="key-result-side">
              <code className="x-mono">lex:{result.id}</code>
              <h2>{result.term} <em>{result.zh}</em></h2>
              <p>{result.def}</p>
              <div className="key-result-btns">
                <button type="button" className="btn-primary" onClick={() => go(`entry/${result.id}`)}>
                  剖解台 ↗
                </button>
                <button
                  type="button"
                  className={`btn-pick ${boardItem ? 'on' : ''}`}
                  onClick={() => saveBoardItem(result.id, boardItem?.params ?? {})}
                  disabled={Boolean(boardItem)}
                >
                  {boardItem ? '✓ 已在 Spec 板' : '+ 加入 Spec'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="key-nav">
          <button type="button" className="btn-ghost" onClick={back} disabled={nodeId === KEY.root && branch.length === 0}>← 上一步</button>
          <button type="button" className="btn-ghost" onClick={reset}>↺ 重来</button>
        </div>
      </div>
    </main>
  )
}
