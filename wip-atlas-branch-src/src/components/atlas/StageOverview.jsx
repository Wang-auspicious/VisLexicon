import { useMemo, useRef } from 'react'
import AnnotationLayer from './AnnotationLayer.jsx'

/* ============ 舞台视口 ============
 * 舞台组件本身只认 { stage, variant, values, activeNode, hoverNode, onHover, replayKey }，
 * 这一层负责它周围的三件事：
 *   1. 变体切片条 —— 变体台的「热区」是切片本身，所以编号角标贴在切片上；
 *   2. 标注层     —— 部件热区的编号角标，位置从真实 DOM 量出来；
 *   3. 分区降对比 —— 分区态下非本区部件打上 axs-dim。
 * 舞台组件零改动，这是它能被三种态复用的前提。
 */

export default function StageOverview({
  StageComponent, stage, variant, values, activeNode, hoverNode, onHover, replayKey,
  items, hotspotItems, variantItems, activeZoneId, selectedTermId, onSelect, annotate = true,
}) {
  const hostRef = useRef(null)

  /* 舞台内容变了就重新量：参数、变体、重演、分区、成员集合任一改变都算。 */
  const signature = useMemo(
    () => JSON.stringify([values, variant?.termId ?? null, replayKey, activeZoneId, items.length]),
    [values, variant, replayKey, activeZoneId, items],
  )

  return (
    <div className="axs-stagewrap">
      {variantItems.length > 0 && (
        <div className="axs-variants" role="group" aria-label="切换变体">
          <button
            type="button"
            className={`axs-vchip ${variant ? '' : 'on'}`}
            onClick={() => onSelect(null)}
          >
            {stage.baseVariantZh}
          </button>
          {variantItems.map((item) => (
            <button
              key={item.termId}
              type="button"
              data-annotation={item.n}
              className={`axs-vchip ${variant?.termId === item.termId ? 'on' : ''}`}
              onClick={() => onSelect(item.termId)}
            >
              <em className="x-mono">{item.n}</em>
              {item.displayZh}
            </button>
          ))}
        </div>
      )}

      <div className="axs-stage" ref={hostRef}>
        <div className="axs-stage-inner">
          <StageComponent
            stage={stage}
            variant={variant}
            values={values}
            activeNode={activeNode}
            hoverNode={hoverNode}
            onHover={onHover}
            replayKey={replayKey}
          />
        </div>
        {annotate && (
          <AnnotationLayer
            hostRef={hostRef}
            items={hotspotItems}
            activeZoneId={activeZoneId}
            selectedTermId={selectedTermId}
            onSelect={onSelect}
            onHover={onHover}
            signature={signature}
          />
        )}
      </div>

      <p className="axs-rm-note">
        系统开启了「减少动态效果」，舞台上的动效已停用。每条术语的行为差别写在下方的编辑批注与对照判据里，不依赖动画才能读懂。
      </p>
    </div>
  )
}
