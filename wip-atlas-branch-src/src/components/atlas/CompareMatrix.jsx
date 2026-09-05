import { useEffect, useMemo, useRef } from 'react'
import { COMPARE_AXES } from '../../lib/stage-zones.js'

/* ============ 活体歧义对照（方案 §3.3 / §5.2 态四） ============
 * 竞品的歧义对照全是静态图配文字。这里的两到五个术语是活的，而且共用同一份
 * 参数值——同一个旋钮同时作用在全部对照项上，差别才是差别，不是各调各的。
 *
 * 变体族：一族浮层就并排开几台，每台钉住一个变体；
 * 部件族：同一张标本只渲染一次，被比较的那几个部件同时描边。
 *
 * 判据只能来自清单批注或语料定义，写不出来就是 null，渲染成「—」，不编。
 * 整列都是 null 的轴整列不显示——一条信息都没有的列只会稀释真有判据的那几列。
 */

export default function CompareMatrix({
  set, stage, StageComponent, values, model, replayKey, onSelectTerm, selectedTermId,
}) {
  const hostRef = useRef(null)

  const members = useMemo(
    () => set.termIds.map((termId) => model.byTerm.get(termId)).filter(Boolean),
    [set, model],
  )
  const variantMembers = members.filter((member) => member.slot === 'variant')
  const hotspotMembers = members.filter((member) => member.slot === 'hotspot')

  /* 整列为 null 的轴不显示：轴顺序用五轴常量，不用对照组自己的书写顺序。 */
  const axes = useMemo(() => {
    const declared = new Set((set.axes || []).map((axis) => axis.id))
    return COMPARE_AXES.filter((axis) => declared.has(axis.id)
      && set.termIds.some((termId) => set.cells?.[termId]?.[axis.id]))
  }, [set])

  /* 部件族：把被比较的那几个部件同时描边。舞台组件零改动。 */
  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined
    const nodes = hotspotMembers.map((member) => member.node).filter(Boolean)
    for (const el of host.querySelectorAll('[data-node]')) {
      el.classList.toggle('axs-cmp', nodes.includes(el.getAttribute('data-node')))
    }
    return () => {
      for (const el of host.querySelectorAll('[data-node]')) el.classList.remove('axs-cmp')
    }
  }, [hotspotMembers, values, replayKey])

  return (
    <section className="axm" aria-label={set.titleZh}>
      <h2 className="axm-title">{set.titleZh}</h2>
      <p className="axm-sub">
        {members.length} 条同屏，共用同一份参数值：调一个旋钮，它们同时变。
        判据写的是「会改变实现的那条需求」，不是长得像不像；写不出来的格子是「—」。
      </p>

      {variantMembers.length > 0 && (
        <div className="axm-live">
          {variantMembers.map((member) => (
            <figure className="axm-cell" key={member.termId}>
              <figcaption>
                <button type="button" onClick={() => onSelectTerm(member.termId)}>
                  <em className="x-mono">{member.n}</em>
                  <b>{member.termEn}</b>
                  <span>{member.displayZh}</span>
                </button>
              </figcaption>
              <div className="axm-stage">
                <StageComponent
                  stage={stage}
                  variant={member.claim}
                  values={values}
                  activeNode={null}
                  hoverNode={null}
                  onHover={undefined}
                  replayKey={replayKey}
                />
              </div>
            </figure>
          ))}
        </div>
      )}

      {hotspotMembers.length > 0 && (
        <div className="axm-live axm-live-single" ref={hostRef}>
          <div className="axm-stage">
            <StageComponent
              stage={stage}
              variant={null}
              values={values}
              activeNode={null}
              hoverNode={null}
              onHover={undefined}
              replayKey={replayKey}
            />
          </div>
        </div>
      )}

      <div className="axm-scroll">
        <table className="axm-table">
          <caption className="axm-caption">
            行是五轴判据，列是被比较的术语。
          </caption>
          <thead>
            <tr>
              <th scope="col">判据</th>
              {members.map((member) => (
                <th scope="col" key={member.termId}>
                  <button
                    type="button"
                    className={member.termId === selectedTermId ? 'on' : ''}
                    onClick={() => onSelectTerm(member.termId)}
                  >
                    <em className="x-mono">{member.n}</em>
                    <b>{member.termEn}</b>
                    <span>{member.displayZh}</span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {axes.map((axis) => (
              <tr key={axis.id}>
                <th scope="row">{axis.labelZh}</th>
                {members.map((member) => {
                  const cell = set.cells?.[member.termId]?.[axis.id]
                  return (
                    <td key={member.termId} className={cell ? '' : 'axm-null'}>
                      {cell || '—'}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
