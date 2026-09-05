import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import atlas from '../data/visual-atlas.json'
import { MANIFESTS, componentFor } from '../stages/registry.js'
import {
  buildStageIndex, stageById, defaultValuesFor, crossRefs, getDomainForStage,
} from '../lib/stage-index.js'
import { zoneMemberIds } from '../lib/stage-zones.js'
import { statusLabelsOf } from '../lib/atlas-status.js'
import { buildSiteLinkIndexes, sitesForTerm } from '../lib/atlas-source-link.js'
import { useRoute, navigate } from '../router.js'
import StageOverview from '../components/atlas/StageOverview.jsx'
import ZoneNav from '../components/atlas/ZoneNav.jsx'
import ParamPanel from '../components/atlas/ParamPanel.jsx'
import TermPanel from '../components/atlas/TermPanel.jsx'
import CompareMatrix from '../components/atlas/CompareMatrix.jsx'

/* ============ 舞台页 · 三态结构（方案 §5.2） ============
 *   总览态  全部热区同时编号标注，右下是编号图例。默认态。
 *   分区态  只亮一个分区的 3–7 条，其余降对比。
 *   对照态  有 compareSets 的台才出现：同屏活体 + 五轴判据矩阵。
 * 选中一条术语时叠加「单词态」：面板打开，该部件描边。
 *
 * 态写在 hash query 上（`?zone=…` / `?view=compare`），所以每一态都能被链接、
 * 被后退键还原、被截图。路由段名仍是冻结的三段，没有新增段。
 *
 * 数字全部由 stage-index / manifest 现算，本文件没有统计量字面量。
 */

const INDEX = buildStageIndex(MANIFESTS, atlas)

/** 一台的编号模型：编号沿分区顺序连排，舞台角标与图例共用同一套号。 */
function buildModel(stage) {
  const claimByTerm = new Map(stage.claims.map((claim) => [claim.termId, claim]))
  const byTerm = new Map()
  let n = 0
  const zones = stage.zones.map((zone) => {
    const members = zoneMemberIds(zone).map((termId) => {
      const claim = claimByTerm.get(termId)
      n += 1
      const under = claim.underVariant ? claimByTerm.get(claim.underVariant) : null
      const member = {
        n,
        termId,
        claim,
        slot: claim.slot,
        node: claim.node ?? null,
        param: claim.param ?? null,
        termEn: claim.term.termEn,
        displayZh: claim.displayZh,
        zoneId: zone.id,
        underVariantZh: under ? under.displayZh : null,
      }
      byTerm.set(termId, member)
      return member
    })
    return {
      id: zone.id, labelZh: zone.labelZh, descriptionZh: zone.descriptionZh, members,
    }
  })
  return { zones, byTerm, members: [...byTerm.values()] }
}

/** 只在客户端问一次 matchMedia，SSR/首帧按窄屏算（移动优先）。 */
function useWide() {
  const [wide, setWide] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const onChange = () => setWide(mq.matches)
    mq.addEventListener('change', onChange)
    onChange()
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return wide
}

function hashFor(stageId, { termId, zone, view, set } = {}) {
  const query = new URLSearchParams()
  if (zone) query.set('zone', zone)
  if (view) query.set('view', view)
  if (set) query.set('set', set)
  const search = query.toString()
  return `#/atlas/${stageId}${termId ? `/${termId}` : ''}${search ? `?${search}` : ''}`
}

export default function AtlasStage({ stageId, termId }) {
  const route = useRoute()
  const wide = useWide()
  const stage = stageById(INDEX, stageId)
  const [values, setValues] = useState(() => defaultValuesFor(stage))
  const [replayKey, setReplayKey] = useState(0)
  const [hoverNode, setHoverNode] = useState(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sites, setSites] = useState(null)
  const panelRef = useRef(null)

  useEffect(() => {
    setValues(defaultValuesFor(stage))
    setSheetOpen(false)
  }, [stage])

  /* 站点索引只在舞台页用得上一次：术语面板的「真实网站里长这样」。 */
  useEffect(() => {
    let alive = true
    fetch('/data/site-index.json')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (alive) setSites(data) })
      .catch(() => { if (alive) setSites(null) })
    return () => { alive = false }
  }, [])

  const siteIndexes = useMemo(() => buildSiteLinkIndexes(sites), [sites])
  const model = useMemo(() => (stage ? buildModel(stage) : null), [stage])

  const compareSets = stage?.compareSets ?? []
  const viewParam = route.query.view === 'compare' && compareSets.length ? 'compare' : null
  const zoneParam = model?.zones.some((zone) => zone.id === route.query.zone)
    ? route.query.zone
    : null

  const selected = termId && model ? model.byTerm.get(termId) ?? null : null
  const activeZoneId = zoneParam
  const mode = viewParam ? 'compare' : (activeZoneId ? 'zone' : 'overview')
  /* 手机上的总览态降级为分区列表：21 个角标在 390px 宽的表单上会互相压住。 */
  const annotate = mode !== 'compare' && (wide || mode === 'zone')

  const compareSet = useMemo(() => {
    if (mode !== 'compare') return null
    return compareSets.find((set) => set.id === route.query.set) || compareSets[0]
  }, [mode, compareSets, route.query.set])

  const setParam = route.query.set
  const go = useCallback((next) => {
    const view = 'view' in next ? next.view : viewParam
    navigate(hashFor(stageId, {
      termId: 'termId' in next ? next.termId : termId,
      zone: 'zone' in next ? next.zone : zoneParam,
      view,
      set: view ? ('set' in next ? next.set : setParam) : undefined,
    }))
  }, [stageId, termId, zoneParam, viewParam, setParam])

  const selectTerm = useCallback((nextTerm) => {
    go({ termId: nextTerm || undefined })
    setReplayKey((key) => key + 1)
  }, [go])

  /* 键盘：←/→ 在本台术语间移动。只在焦点不在录入控件上时生效
   * （方案 §7.4 第 4 条：旧版没排除 select，用键盘操作枚举下拉会同时切术语）。 */
  const onKeyDown = useCallback((event) => {
    const el = event.target
    const tag = el?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
    if (el?.isContentEditable || el?.getAttribute?.('role') === 'slider') return
    if (event.key === 'Escape' && termId) {
      go({ termId: undefined })
      return
    }
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    if (!model?.members.length) return
    const flow = model.members.map((member) => member.termId)
    const at = flow.indexOf(termId)
    const step = event.key === 'ArrowRight' ? 1 : -1
    event.preventDefault()
    selectTerm(flow[(at + step + flow.length) % flow.length])
  }, [model, termId, go, selectTerm])

  /* 面板打开时把焦点交给它，关掉时不抢焦点。 */
  useEffect(() => {
    if (!termId || !panelRef.current) return
    panelRef.current.focus({ preventScroll: true })
  }, [termId])

  if (!stage || !model) {
    return (
      <section className="axs-missing">
        <h1>没有这一台</h1>
        <p>
          <span className="x-mono">{stageId}</span> 不是九个舞台之一。
          <a href="#/atlas">回图鉴索引 →</a>
        </p>
      </section>
    )
  }

  const StageComponent = componentFor(stage.id)
  const domain = getDomainForStage(stage.id)
  const zonesInView = activeZoneId
    ? model.zones.filter((zone) => zone.id === activeZoneId)
    : model.zones
  const membersInView = zonesInView.flatMap((zone) => zone.members)
  const hotspotItems = membersInView.filter((member) => member.slot === 'hotspot')
  const variantItems = membersInView.filter((member) => member.slot === 'variant')
  const paramItems = membersInView.filter((member) => member.slot === 'param')

  const variantClaim = selected?.slot === 'variant'
    ? selected.claim
    : (selected?.claim?.underVariant
      ? model.byTerm.get(selected.claim.underVariant)?.claim ?? null
      : null)
  const activeNode = selected?.slot === 'hotspot' ? selected.node : null

  const term = selected?.claim.term ?? null
  const status = term ? statusLabelsOf(term, INDEX) : null
  const siteLinks = term ? sitesForTerm(term, siteIndexes) : []
  const zoneOfSelected = selected
    ? model.zones.find((zone) => zone.id === selected.zoneId)
    : null
  const neighbors = zoneOfSelected
    ? zoneOfSelected.members.filter((member) => member.termId !== selected.termId)
    : []

  const paramCount = paramItems.length + stage.knobs.length
  const renderParams = (idPrefix) => (
    <ParamPanel
      idPrefix={idPrefix}
      params={paramItems}
      knobs={stage.knobs}
      values={values}
      selectedTermId={termId}
      onSelectTerm={selectTerm}
      onChange={(key, value) => setValues((prev) => ({ ...prev, [key]: value }))}
    />
  )

  return (
    <div className="axs" onKeyDown={onKeyDown}>
      <header className="axs-head">
        <p className="axs-crumb x-mono">
          <a href="#/atlas">图鉴</a>
          {domain && <span> / {domain.num} {domain.titleZh}</span>}
        </p>
        <div className="axs-headline">
          <h1>{stage.titleZh}</h1>
          <span className="axs-en x-mono">{stage.titleEn}</span>
          <span className="axs-count x-mono">
            {stage.claims.length} 条术语 · {model.zones.length} 个分区
          </span>
        </div>
        <p className="axs-summary">{stage.summaryZh}</p>
      </header>

      <div className="axs-tabs" role="group" aria-label="舞台视图">
        <button
          type="button"
          className={`axs-tab ${mode === 'overview' ? 'on' : ''}`}
          aria-pressed={mode === 'overview'}
          onClick={() => go({ zone: undefined, view: undefined })}
        >
          总览
          <em className="x-mono">{stage.claims.length}</em>
        </button>
        <div className="axs-zonetabs">
          {model.zones.map((zone) => (
            <button
              key={zone.id}
              type="button"
              className={`axs-tab ${activeZoneId === zone.id ? 'on' : ''}`}
              aria-pressed={activeZoneId === zone.id}
              onClick={() => go({ zone: zone.id, view: undefined })}
            >
              {zone.labelZh}
              <em className="x-mono">{zone.members.length}</em>
            </button>
          ))}
        </div>
        {compareSets.length > 0 && (
          <button
            type="button"
            className={`axs-tab axs-tab-compare ${mode === 'compare' ? 'on' : ''}`}
            aria-pressed={mode === 'compare'}
            onClick={() => go({ view: 'compare', zone: undefined })}
          >
            对照
            <em className="x-mono">{compareSets.length}</em>
          </button>
        )}
        <button
          type="button"
          className="axs-tab axs-replay"
          onClick={() => setReplayKey((key) => key + 1)}
        >
          重演动效
        </button>
      </div>

      <div className="axs-body">
        <div className="axs-main">
          {mode === 'compare' && compareSet ? (
            <>
              {compareSets.length > 1 && (
                <div className="axs-setpicker" role="group" aria-label="选择对照组">
                  {compareSets.map((set) => (
                    <button
                      key={set.id}
                      type="button"
                      className={`axs-tab ${set.id === compareSet.id ? 'on' : ''}`}
                      onClick={() => go({ view: 'compare', zone: undefined, set: set.id })}
                    >
                      {set.titleZh}
                    </button>
                  ))}
                </div>
              )}
              <CompareMatrix
                set={compareSet}
                stage={stage}
                StageComponent={StageComponent}
                values={values}
                model={model}
                replayKey={replayKey}
                selectedTermId={termId}
                onSelectTerm={selectTerm}
              />
            </>
          ) : (
            <StageOverview
              StageComponent={StageComponent}
              stage={stage}
              variant={variantClaim}
              values={values}
              activeNode={activeNode}
              hoverNode={hoverNode}
              onHover={setHoverNode}
              replayKey={replayKey}
              items={membersInView}
              hotspotItems={hotspotItems}
              variantItems={variantItems}
              activeZoneId={activeZoneId}
              selectedTermId={termId}
              onSelect={selectTerm}
              annotate={annotate}
            />
          )}

          {mode !== 'compare' && (
            <div className="axs-legend">
              <h2 className="axs-legend-h">
                {activeZoneId ? '本区的术语' : '这一屏上一共这些名字'}
                <em className="x-mono">{membersInView.length}</em>
              </h2>
              {!annotate && (
                <p className="axs-legend-note">
                  屏幕太窄，编号角标会互相压住，所以总览态在这里换成分区列表。点一个分区，舞台只亮那一区。
                </p>
              )}
              <ZoneNav
                zones={model.zones}
                activeZoneId={activeZoneId}
                selectedTermId={termId}
                accordion={!wide}
                onSelectZone={(zoneId) => go({ zone: zoneId || undefined, view: undefined })}
                onSelectTerm={selectTerm}
              />
            </div>
          )}
        </div>

        <div className="axs-side">
          <section className="axs-sidecard axs-params" aria-labelledby="axs-params-h">
            <h2 id="axs-params-h" className="axs-sidecard-h">
              参数
              <em className="x-mono">{paramCount}</em>
            </h2>
            {renderParams('side')}
          </section>
        </div>

        {/* 手机：参数从底部升起；关闭态 inert，Tab 进不去 */}
        <button
          type="button"
          className="axs-sheet-open"
          onClick={() => setSheetOpen(true)}
          aria-expanded={sheetOpen}
          aria-controls="axs-sheet"
        >
          调参数 {paramCount} 项
        </button>
        <div
          className={`axs-sheet ${sheetOpen ? 'open' : ''}`}
          id="axs-sheet"
          hidden={!sheetOpen}
          inert={!sheetOpen}
          aria-label="参数"
        >
          <div className="axs-sheet-bar">
            <span className="x-mono">参数 {paramCount} 项</span>
            <button type="button" onClick={() => setSheetOpen(false)} aria-label="关闭参数面板">✕</button>
          </div>
          <div className="axs-sheet-body">{renderParams('sheet')}</div>
        </div>
      </div>

      {/* 术语面板：桌面在右栏，手机从底部升起；关闭态 hidden + inert */}
      <div
        className={`axs-termpanel ${termId ? 'open' : ''}`}
        hidden={!termId}
        inert={!termId}
        tabIndex={-1}
        ref={panelRef}
      >
        {term && (
          <TermPanel
            term={term}
            claim={selected.claim}
            status={status}
            siteLinks={siteLinks}
            neighbors={neighbors}
            zone={zoneOfSelected}
            crossStage={crossRefs(INDEX, term.id, stage.id)}
            onSelectTerm={selectTerm}
            onClose={() => go({ termId: undefined })}
          />
        )}
      </div>

    </div>
  )
}
