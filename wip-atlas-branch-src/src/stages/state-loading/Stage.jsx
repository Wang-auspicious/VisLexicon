import { useEffect, useState } from 'react'
import { makeNodeBinder } from '../node.js'

/* 状态与加载台。同一块面板四种状态。
 * 就绪态里摆着三种"还在忙"的部件（转圈、任务进度、连接状态），
 * 加载态里才有骨架屏和流光——所以那两条术语声明了 underVariant。
 */
export default function StateLoadingStage({ stage, variant, values, activeNode, hoverNode, onHover, replayKey }) {
  const preset = variant?.render?.preset || 'ready'
  const { skeletonRows = 4, radius = 10, shimmerMs = 1600 } = values
  const node = makeNodeBinder({ activeNode, hoverNode, onHover })

  /* 数字滚动：值真的在变，才看得出它跟直接跳的区别。 */
  const [n, setN] = useState(9047)
  useEffect(() => {
    if (preset !== 'ready') return undefined
    const timer = setInterval(() => setN((v) => v + Math.floor(Math.random() * 40) + 3), 900)
    return () => clearInterval(timer)
  }, [preset, replayKey])

  const style = {
    '--sl-radius': `${radius}px`,
    '--sl-shimmer': `${shimmerMs}ms`,
  }

  return (
    <div className={`sl sl-${preset}`} style={style}>
      <div className="sl-head">
        <b>{stage.specimen.title}</b>
        <span {...node('state.conn', 'sl-conn')} data-zone="outcome"><i />已连接</span>
      </div>

      {preset === 'loading' && (
        <div {...node('state.skeleton', 'sl-skeleton')} data-zone="placeholder" key={`sk-${replayKey}`}>
          {Array.from({ length: skeletonRows }, (_, i) => (
            <div key={i} className="sl-sk-row">
              <i className="sl-sk-dot" />
              <i className="sl-sk-line" style={{ width: `${74 - i * 9}%` }} />
              <i className="sl-sk-num" />
            </div>
          ))}
          <div {...node('state.shimmer', 'sl-shimmer')} data-zone="placeholder" aria-hidden="true" />
        </div>
      )}

      {preset === 'empty' && (
        <div className="sl-blank">
          <b>还没有运行记录</b>
          <p>连上仓库后，这里会列出每一次构建。</p>
          <em className="sl-cta">连接仓库</em>
        </div>
      )}

      {preset === 'error' && (
        <div className="sl-blank sl-blank-err">
          <b>没能取到运行记录</b>
          <p>服务端返回 503。这是我们这边的问题，不是你的操作。</p>
          <em className="sl-cta">重试</em>
        </div>
      )}

      {preset === 'ready' && (
        <div className="sl-rows">
          {['构建 #482', '构建 #481', '构建 #480'].map((r, i) => (
            <div key={r} className="sl-row">
              <span>{r}</span>
              {i === 0
                ? <span {...node('state.loader', 'sl-loader')} data-zone="busy" aria-label="进行中"><i /></span>
                : <span className="sl-ok">成功</span>}
              {i === 0
                ? <span {...node('state.ticker', 'sl-ticker')} data-zone="busy">{n.toLocaleString()}</span>
                : <span className="sl-plain">318</span>}
            </div>
          ))}

          <div {...node('state.job', 'sl-job')} data-zone="busy">
            <div className="sl-job-h"><span>索引仓库</span><em>62%</em></div>
            <div className="sl-job-bar"><i style={{ width: '62%' }} /></div>
          </div>
        </div>
      )}
    </div>
  )
}
