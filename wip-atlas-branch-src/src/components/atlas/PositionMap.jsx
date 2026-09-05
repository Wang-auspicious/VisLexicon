import { useMemo, useState } from 'react'

/* ============ 位置索引（方案 §3.2 机制二） ============
 * 一张抽象版面图：七个固定区域 + 一格「主内容区·通用 / 无固定位置」，
 * 装的是七个格子装不下的那些术语（三个变体台，加导航台主区里的面包屑之类）。
 * 缺口显式给出，不隐藏；命中 0 条的区域照样占一格。
 *
 * 数字全部来自 positionIndex(manifests) 与 manifest 自身，本文件无统计量字面量。
 */

const UNPLACED = 'unplaced'

/* 版面图上每格贴在哪。CSS 用 grid-template-areas 摆位，这里只给区域名。 */
const AREA_OF = {
  header: 'header',
  sidebar: 'sidebar',
  'main-table': 'table',
  'main-form': 'form',
  overlay: 'overlay',
  composer: 'composer',
  state: 'state',
  [UNPLACED]: 'unplaced',
}

/** termId → 显示用的名字（英文正名 + 台上订正后的中文名）。 */
function buildTermNames(index) {
  const map = new Map()
  for (const stage of index.stages) {
    for (const claim of stage.claims) {
      if (!map.has(claim.termId)) {
        map.set(claim.termId, { termEn: claim.term.termEn, displayZh: claim.displayZh })
      }
    }
  }
  return map
}

/** 七个区域都没收走的那些术语，按台分组。总数即 positionIndex 的 unplaced。 */
function buildUnplaced(manifests, index) {
  const stages = []
  for (const manifest of manifests) {
    const placed = new Set()
    for (const region of manifest.positionRegions || []) {
      for (const termId of region.termIds || []) placed.add(termId)
    }
    const termIds = (manifest.claims || [])
      .map((claim) => claim.termId)
      .filter((termId) => !placed.has(termId))
    if (!termIds.length) continue
    stages.push({
      stageId: manifest.id,
      titleZh: manifest.titleZh,
      termIds,
      count: termIds.length,
      /* 为什么没位置：变体台整台都不长在固定版面上，其余是零散的几条。 */
      reasonZh: termIds.length === (manifest.claims || []).length
        ? '整台不长在固定版面位置上'
        : '这几条在主内容区里没有固定归属',
    })
  }
  return {
    region: UNPLACED,
    labelZh: '主内容区 · 通用 / 无固定位置',
    stages,
    count: stages.reduce((sum, stage) => sum + stage.count, 0),
  }
}

export default function PositionMap({ positions, index, manifests }) {
  const [open, setOpen] = useState(null)
  const names = useMemo(() => buildTermNames(index), [index])
  const unplaced = useMemo(() => buildUnplaced(manifests, index), [manifests, index])
  const cells = useMemo(() => [...positions.regions, unplaced], [positions, unplaced])
  const active = cells.find((cell) => cell.region === open) || null

  return (
    <div className="axp">
      <div className="axp-map">
        {cells.map((cell) => {
          const on = cell.region === open
          return (
            <button
              key={cell.region}
              type="button"
              className={`axp-cell axp-area-${AREA_OF[cell.region]} ${on ? 'on' : ''} ${cell.count ? '' : 'zero'}`}
              aria-expanded={on}
              aria-controls="axp-detail"
              onClick={() => setOpen(on ? null : cell.region)}
            >
              <b>{cell.labelZh}</b>
              <em className="x-mono">
                {cell.count ? `${cell.count} 条` : '这一区还没有台'}
              </em>
            </button>
          )
        })}
      </div>

      <p className="axp-sum x-mono">
        九台共认领 {positions.claimed} 条挂点：落进版面区域 {positions.placed} 条，
        没有固定位置 {positions.unplaced} 条。
      </p>

      <div className="axp-detail" id="axp-detail" hidden={!active} inert={!active}>
        {active && (
          <>
            <h3>{active.labelZh}</h3>
            {active.stages.length ? (
              active.stages.map((stage) => (
                <div className="axp-stage" key={stage.stageId}>
                  <h4>
                    <a href={`#/atlas/${stage.stageId}`}>{stage.titleZh}</a>
                    <em className="x-mono">{stage.count} 条</em>
                    {stage.reasonZh && <span className="axp-reason">{stage.reasonZh}</span>}
                  </h4>
                  <ul className="axp-terms">
                    {stage.termIds.map((termId) => {
                      const name = names.get(termId)
                      return (
                        <li key={termId}>
                          <a href={`#/atlas/${stage.stageId}/${termId}`}>
                            <b>{name?.termEn || termId}</b>
                            <span>{name?.displayZh || ''}</span>
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))
            ) : (
              <p className="axp-empty">
                这一区还没有任何一台认领术语。不是打不开，是确实还没做。
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
