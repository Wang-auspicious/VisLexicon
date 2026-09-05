import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import '../atlas.css'
import atlas from '../data/visual-atlas.json'
import catalog from '../data/site-catalog.json'
import { MANIFESTS, componentFor } from '../stages/registry.js'
import {
  buildStageIndex, stageById, defaultValuesFor, crossRefs, coverageOf, matchTerm, SLOT_LABEL,
  MASTER_DOMAINS, getDomainForStage,
} from '../lib/stage-index.js'
import { buildDomainIndex, catalogMatchesFor } from '../lib/atlas-source-link.js'
import { getCuratedResourcesForTerm } from '../lib/curated-resources.js'
import CodeExportModal from '../components/CodeExportModal.jsx'
import { go } from '../router.js'

/* ============ 图鉴 · 旗舰级视窗演示舞台 ============
 * 沉浸式视窗架构：
 * 1. 默认全屏纯净态：左右侧栏默认完全隐藏，将 100% 视界聚焦中央互动舞台；
 * 2. 悬浮胶囊控制坞：顶栏切换变体、底栏微调物理参数，不遮挡核心标本；
 * 3. 抽屉式毛玻璃浮层：随时平滑呼出左侧知识本体树与右侧术语规范详情。
 */

const INDEX = buildStageIndex(MANIFESTS, atlas)
const DOMAINS = buildDomainIndex(catalog)
const COVERAGE = coverageOf(INDEX, atlas)
const UNROUTED = '__unrouted'

function Chip({ children }) {
  return <em className="ax-chip">{children}</em>
}

export default function Atlas({ stage: routeStage, term: routeTerm }) {
  const stageId = routeStage && (routeStage === UNROUTED || stageById(INDEX, routeStage))
    ? routeStage
    : INDEX.stages[0].id
  const stage = stageById(INDEX, stageId)

  const [values, setValues] = useState(() => defaultValuesFor(stage))
  const [hoverNode, setHoverNode] = useState(null)
  const [replayKey, setReplayKey] = useState(0)
  const [exportOpen, setExportOpen] = useState(false)
  const [q, setQ] = useState('')
  const [tip, setTip] = useState(null)
  const [leftOpen, setLeftOpen] = useState(false)
  const [rightOpen, setRightOpen] = useState(false)
  const viewportRef = useRef(null)

  useEffect(() => {
    setValues(defaultValuesFor(stageId === UNROUTED ? null : stageById(INDEX, stageId)))
    setQ('')
  }, [stageId])

  const claims = useMemo(() => (stage ? stage.claims : []), [stage])
  const selected = routeTerm
    ? claims.find((c) => c.termId === routeTerm) || null
    : null
  const unroutedTerm = stageId === UNROUTED && routeTerm
    ? INDEX.unrouted.find((e) => e.id === routeTerm) || null
    : null

  const variantClaim = selected?.slot === 'variant'
    ? selected
    : (selected?.underVariant
      ? claims.find((c) => c.termId === selected.underVariant) || null
      : null)
  const activeNode = selected?.slot === 'hotspot' ? selected.node : null

  const select = useCallback((termId) => {
    go(termId ? `atlas/${stageId}/${termId}` : `atlas/${stageId}`)
    setReplayKey((k) => k + 1)
  }, [stageId])

  /* 快捷键：←/→ 切换术语，ESC 退出浮动侧栏 */
  const flow = stageId === UNROUTED ? INDEX.unrouted.map((e) => e.id) : claims.map((c) => c.termId)
  useEffect(() => {
    const onKey = (ev) => {
      if (ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA') return
      if (ev.key === 'Escape') {
        if (leftOpen || rightOpen) {
          setLeftOpen(false)
          setRightOpen(false)
        }
        return
      }
      if (ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight') return
      if (!flow.length) return
      const at = flow.indexOf(routeTerm)
      const next = flow[(at + (ev.key === 'ArrowRight' ? 1 : -1) + flow.length) % flow.length]
      select(next)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [flow, routeTerm, select, leftOpen, rightOpen])

  /* 悬停部件 → 量出它的相对位置，浮标精准贴附 */
  useEffect(() => {
    const name = hoverNode || activeNode
    if (!name || !viewportRef.current) { setTip(null); return }
    const el = viewportRef.current.querySelector(`[data-node="${name}"]`)
    const host = viewportRef.current.getBoundingClientRect()
    if (!el) { setTip(null); return }
    const rect = el.getBoundingClientRect()
    const claim = claims.find((c) => c.node === name)
    if (!claim) { setTip(null); return }
    const above = rect.top - host.top
    const below = above < 26
    setTip({ top: below ? rect.bottom - host.top : above, left: rect.left - host.left, below, claim })
  }, [hoverNode, activeNode, claims, values, variantClaim, replayKey])

  const StageComponent = stageId === UNROUTED ? null : componentFor(stageId)

  const filtered = useMemo(() => {
    if (stageId === UNROUTED) return INDEX.unrouted.filter((e) => matchTerm(e, q))
    return claims.filter((c) => matchTerm(c.term, q, c.displayZh))
  }, [stageId, claims, q])

  const groups = ['variant', 'hotspot', 'param']
    .map((slot) => ({ slot, items: filtered.filter((c) => c.slot === slot) }))
    .filter((g) => g.items.length)

  const detailTerm = selected?.term || unroutedTerm
  const params = claims.filter((c) => c.slot === 'param')
  const knobs = stage?.knobs || []
  const domain = getDomainForStage(stageId)

  return (
    <div className="ax-mac-desktop">
      <div className="ax-mac-window">
        {/* ===== Mac 视窗顶级控制条 (Window Titlebar) ===== */}
        <header className="ax-mac-titlebar">
          <div className="ax-mac-dots" aria-hidden="true">
            <span className="mac-dot close" />
            <span className="mac-dot min" />
            <span className="mac-dot max" />
          </div>

          <div className="ax-mac-title-wrap">
            {domain && <span className="ax-title-domain-badge">{domain.num} · {domain.titleZh}</span>}
            <span className="ax-title-sep">/</span>
            <span className="ax-title-main">{stageId === UNROUTED ? '待建档资源池' : stage?.titleZh}</span>
            <span className="ax-title-sub x-mono">{stageId === UNROUTED ? '09 / Unrouted' : stage?.titleEn}</span>
          </div>

          <div className="ax-mac-actions">
            <button
              type="button"
              className={`ax-mac-btn ${leftOpen ? 'on' : ''}`}
              onClick={() => { setLeftOpen(!leftOpen); if (!leftOpen) setRightOpen(false) }}
              title="切换全域视觉本体目录 (大纲)"
              aria-label="切换大纲目录"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="9" y1="3" x2="9" y2="21"/>
              </svg>
              <span>大纲</span>
            </button>

            <button
              type="button"
              className="ax-mac-btn"
              onClick={() => setReplayKey((k) => k + 1)}
              title="重新播放舞台动效 (Replay)"
              aria-label="重演动效"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2v6h-6"/>
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              </svg>
            </button>

            {stageId !== UNROUTED && (
              <button
                type="button"
                className="ax-mac-btn-export"
                onClick={() => setExportOpen(true)}
                title="导出本舞台生产级交互代码"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6"/>
                  <polyline points="8 6 2 12 8 18"/>
                </svg>
                <span>导出代码</span>
              </button>
            )}

            <button
              type="button"
              className={`ax-mac-btn ${rightOpen ? 'on' : ''}`}
              onClick={() => { setRightOpen(!rightOpen); if (!rightOpen) setLeftOpen(false) }}
              title="切换术语规范与来源详情"
              aria-label="切换术语详情"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="15" y1="3" x2="15" y2="21"/>
              </svg>
              <span>详情</span>
            </button>
          </div>
        </header>

        {/* ===== Mac 视窗主体舞台区域 ===== */}
        <div className="ax-mac-body">
          {/* 抽屉打开时的平滑阻断背景蒙层 */}
          {(leftOpen || rightOpen) && (
            <div
              className="ax-drawer-backdrop"
              onClick={() => { setLeftOpen(false); setRightOpen(false) }}
              aria-hidden="true"
            />
          )}

          {/* ===== 核心互动演示台 (Center Main Stage) ===== */}
          <main className="ax-main-stage">
            {/* 顶栏悬浮胶囊切片栏 (Top Floating Variant Dock) */}
            {stageId !== UNROUTED && (
              <div className="ax-variants-dock">
                <div className="ax-variants-scroller">
                  <button
                    type="button"
                    className={`ax-vchip ${!variantClaim ? 'on' : ''}`}
                    onClick={() => select(null)}
                  >
                    {stage?.baseVariantZh || '静止'}
                  </button>
                  {claims.filter((c) => c.slot === 'variant').map((c) => (
                    <button
                      key={c.termId}
                      type="button"
                      className={`ax-vchip ${variantClaim?.termId === c.termId ? 'on' : ''}`}
                      onClick={() => select(c.termId)}
                    >
                      {c.displayZh}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 中央活态舞台呈现画布 (Full Viewport Stage) */}
            <div className="ax-viewport-mac" ref={viewportRef}>
              {StageComponent ? (
                <StageComponent
                  stage={stage}
                  variant={variantClaim}
                  values={values}
                  activeNode={activeNode}
                  hoverNode={hoverNode}
                  onHover={setHoverNode}
                  replayKey={replayKey}
                />
              ) : (
                <div className="ax-todo-note-mac">
                  <div className="ax-mac-folder-icon">🗂️</div>
                  <h3>待建档资源池</h3>
                  <p className="x-mono">The stage for this term is yet to be constructed.</p>
                </div>
              )}

              {tip && (
                <div className={`ax-tip-mac ${tip.below ? 'below' : ''}`} style={{ top: tip.top, left: tip.left }}>
                  <b>{tip.claim.term.termEn}</b>
                  <span>{tip.claim.term.termZh}</span>
                </div>
              )}
            </div>

            {/* 底栏悬浮参数微调舱 (Bottom Floating Controls Dock) */}
            {(params.length > 0 || knobs.length > 0) && (
              <div className="ax-knobs-dock">
                <div className="ax-knobs-scroller">
                  {params.map((c) => {
                    const type = c.param.type || 'range'
                    const value = values[c.param.key] ?? c.param.default
                    return (
                      <label key={c.termId} className={`ax-knob ${selected?.termId === c.termId ? 'on' : ''}`}>
                        <span className="ax-knob-h">
                          <button type="button" onClick={() => select(c.termId)}>{c.param.label}</button>
                          <em className="x-mono">
                            {type === 'boolean' ? (value ? '开' : '关') : `${value}${c.param.unit || ''}`}
                          </em>
                        </span>
                        {type === 'range' && (
                          <input type="range" min={c.param.min} max={c.param.max} step={c.param.step} value={value} onChange={(e) => setValues((v) => ({ ...v, [c.param.key]: Number(e.target.value) }))} />
                        )}
                        {type === 'boolean' && (
                          <input type="checkbox" className="ax-knob-switch" checked={Boolean(value)} onChange={(e) => setValues((v) => ({ ...v, [c.param.key]: e.target.checked }))} />
                        )}
                        {type === 'enum' && (
                          <select className="ax-knob-enum" value={value} onChange={(e) => setValues((v) => ({ ...v, [c.param.key]: e.target.value }))}>
                            {c.param.choices.map((choice) => <option key={choice} value={choice}>{choice}</option>)}
                          </select>
                        )}
                      </label>
                    )
                  })}
                  {knobs.map((k) => (
                    <label key={k.key} className="ax-knob ax-knob-plain">
                      <span className="ax-knob-h">
                        <span>{k.label}</span>
                        <em className="x-mono">{values[k.key] ?? k.default}{k.unit || ''}</em>
                      </span>
                      {k.type === 'boolean' ? (
                        <input type="checkbox" className="ax-knob-switch" checked={Boolean(values[k.key] ?? k.default)} onChange={(e) => setValues((v) => ({ ...v, [k.key]: e.target.checked }))} />
                      ) : (
                        <input type="range" min={k.min} max={k.max} step={k.step} value={values[k.key] ?? k.default} onChange={(e) => setValues((v) => ({ ...v, [k.key]: Number(e.target.value) }))} />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* ===== 左侧滑出抽屉：本体谱系大纲 (Left Outline Drawer) ===== */}
          <aside className={`ax-rail ax-glass-drawer ${leftOpen ? 'open' : 'closed'}`}>
            <div className="ax-drawer-head">
              <div className="ax-drawer-title-wrap">
                <span className="ax-drawer-badge">本体树</span>
                <h3>视觉图鉴目录</h3>
              </div>
              <button
                type="button"
                className="ax-drawer-close-btn"
                onClick={() => setLeftOpen(false)}
                aria-label="关闭大纲"
              >✕</button>
            </div>

            <div className="ax-drawer-body">
              <div className="ax-stages">
                {MASTER_DOMAINS.map((dom) => {
                  const domainStages = INDEX.stages.filter((s) => dom.stageIds.includes(s.id))
                  const isActiveDomain = domainStages.some((s) => s.id === stageId)
                  return (
                    <div key={dom.id} className={`ax-domain-group ${isActiveDomain ? 'active' : ''}`}>
                      <div className="ax-domain-h">
                        <span className="ax-domain-num">{dom.num}</span>
                        <span className="ax-domain-title">{dom.titleZh}</span>
                        {!domainStages.length && <span className="ax-domain-soon">规划中</span>}
                      </div>
                      {domainStages.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          className={`ax-stage-tab ${s.id === stageId ? 'on' : ''}`}
                          onClick={() => { go(`atlas/${s.id}`); setLeftOpen(false) }}
                        >
                          <b>{s.titleZh}</b>
                          <em className="x-mono">{s.claims.length}</em>
                        </button>
                      ))}
                    </div>
                  )
                })}
                <div className="ax-domain-group">
                  <button
                    type="button"
                    className={`ax-stage-tab ax-stage-todo ${stageId === UNROUTED ? 'on' : ''}`}
                    onClick={() => { go(`atlas/${UNROUTED}`); setLeftOpen(false) }}
                    title="已收录但还没有舞台演示的术语"
                  >
                    <b>09 · 待建档资源池</b>
                    <em className="x-mono">{INDEX.unrouted.length}</em>
                  </button>
                </div>
              </div>

              <div className="ax-search">
                <span aria-hidden="true">⌕</span>
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜当前舞台术语 / 别名…" />
              </div>

              <nav className="ax-flow">
                {stageId === UNROUTED ? (
                  <div className="ax-group">
                    <div className="ax-group-h">
                      <span>待建档</span>
                      <em className="x-mono">{filtered.length}</em>
                    </div>
                    {filtered.map((e) => (
                      <button
                        key={e.id}
                        type="button"
                        className={`ax-term ax-term-todo ${e.id === routeTerm ? 'on' : ''}`}
                        onClick={() => select(e.id)}
                      >
                        <span className="ax-term-en">{e.termEn}</span>
                        <span className="ax-term-zh">{e.termZh}</span>
                      </button>
                    ))}
                  </div>
                ) : groups.map((g) => (
                  <div key={g.slot} className="ax-group">
                    <div className="ax-group-h">
                      <span>{SLOT_LABEL[g.slot]}</span>
                      <em className="x-mono">{g.items.length}</em>
                    </div>
                    {g.items.map((c) => (
                      <button
                        key={c.termId}
                        type="button"
                        className={`ax-term ${c.termId === routeTerm ? 'on' : ''} ${hoverNode && hoverNode === c.node ? 'hot' : ''}`}
                        onClick={() => select(c.termId)}
                        onMouseEnter={() => c.slot === 'hotspot' && setHoverNode(c.node)}
                        onMouseLeave={() => c.slot === 'hotspot' && setHoverNode(null)}
                      >
                        <span className="ax-term-en">{c.term.termEn}</span>
                        <span className="ax-term-zh">{c.displayZh}</span>
                      </button>
                    ))}
                  </div>
                ))}
                {!filtered.length && <p className="ax-empty">这台里没有匹配的术语。</p>}
              </nav>
            </div>

            <div className="ax-rail-foot x-mono">
              已入台 {COVERAGE.routed} / {COVERAGE.total} · {COVERAGE.stages} 台
            </div>
          </aside>

          {/* ===== 右侧滑出抽屉：术语详情与规范 (Right Inspector Drawer) ===== */}
          <aside className={`ax-panel ax-glass-drawer ${rightOpen ? 'open' : 'closed'}`}>
            <div className="ax-drawer-head">
              <div className="ax-drawer-title-wrap">
                <span className="ax-drawer-badge">{detailTerm ? '术语规范' : '舞台总览'}</span>
                <h3>{detailTerm ? detailTerm.termEn : (stage?.titleZh || '舞台总览')}</h3>
              </div>
              <button
                type="button"
                className="ax-drawer-close-btn"
                onClick={() => setRightOpen(false)}
                aria-label="关闭详情"
              >✕</button>
            </div>

            <div className="ax-drawer-body">
              {detailTerm ? (
                <TermPanel term={detailTerm} claim={selected} stageId={stageId} />
              ) : (
                <div className="ax-panel-idle">
                  <StageOverviewPanel stage={stage} stageId={stageId} />
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      <CodeExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        stage={stage}
        variant={variantClaim}
        values={values}
        activeTerm={detailTerm}
      />
    </div>
  )
}

function TermPanel({ term, claim, stageId }) {
  const refs = crossRefs(INDEX, term.id, stageId)
  const sites = catalogMatchesFor(term, DOMAINS)
  const curated = getCuratedResourcesForTerm(term, stageId)

  return (
    <div className="ax-detail">
      <div className="ax-detail-h">
        <h2>{term.termEn}</h2>
        <p>{claim?.displayZh || term.termZh}</p>
        {claim?.zhFixed && (
          <p className="ax-zh-origin x-mono">语料原译「{term.termZh}」已在台上订正</p>
        )}
        <div className="ax-chips">
          {[...new Set([term.axis, term.recordType])].map((tag) => <Chip key={tag}>{tag}</Chip>)}
          {claim && <Chip>{SLOT_LABEL[claim.slot]}</Chip>}
          {term.translationQuality === 'machine' && !claim?.zhFixed && <Chip>机器译名 · 待校</Chip>}
        </div>
      </div>

      <p className="ax-def">{term.definitionZh}</p>
      {term.sourceDefinition && <p className="ax-def-en">{term.sourceDefinition}</p>}

      {claim?.noteZh && <p className="ax-note">{claim.noteZh}</p>}

      {term.aliases?.length > 0 && (
        <section className="ax-sec">
          <h3>别名</h3>
          <div className="ax-chips">{term.aliases.map((a) => <Chip key={a}>{a}</Chip>)}</div>
        </section>
      )}

      {term.mediaBindings?.length > 0 && (
        <section className="ax-sec">
          <h3>媒介绑定</h3>
          <div className="ax-chips">{term.mediaBindings.map((m) => <Chip key={m}>{m}</Chip>)}</div>
        </section>
      )}

      {refs.length > 0 && (
        <section className="ax-sec">
          <h3>也出现在</h3>
          {refs.map((r) => (
            <button key={r.stageId} type="button" className="ax-xref" onClick={() => go(`atlas/${r.stageId}/${term.id}`)}>
              {r.titleZh} · {SLOT_LABEL[r.slot]} ↗
            </button>
          ))}
        </section>
      )}

      {curated.length > 0 && (
        <section className="ax-sec ax-curated-sec">
          <h3>专精领域标杆库与工具</h3>
          <div className="ax-curated-list">
            {curated.map((c) => (
              <a key={c.url} className="ax-curated-item" href={c.url} target="_blank" rel="noreferrer">
                <div className="ax-curated-item-h">
                  <b>{c.name}</b>
                  <span className="ax-curated-tag">{c.tag}</span>
                </div>
                <p>{c.desc}</p>
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="ax-sec">
        <h3>来源</h3>
        {(term.sourceEvidence || []).map((ev) => (
          <a key={`${ev.sourceId}-${ev.sourceRecordId}`} className="ax-src" href={ev.url} target="_blank" rel="noreferrer">
            <b>{ev.sourceName}</b>
            <em className="x-mono">{ev.license} · {ev.retrievedAt}</em>
          </a>
        ))}
      </section>

      {sites.length > 0 && (
        <section className="ax-sec">
          <h3>网站库已收录</h3>
          {sites.map((s) => (
            <div key={s.host} className="ax-site">
              <b>{s.entry.name}</b>
              <em className="x-mono">{s.entry.category}</em>
              <p>{s.entry.descriptionZh}</p>
            </div>
          ))}
          <button type="button" className="ax-xref" onClick={() => go('index')}>去网站库 ↗</button>
        </section>
      )}
    </div>
  )
}

function StageOverviewPanel({ stage, stageId }) {
  const domain = getDomainForStage(stageId)
  const curated = getCuratedResourcesForTerm(null, stageId)

  return (
    <div className="ax-overview-card">
      <div className="ax-detail-h">
        {domain && (
          <span className="ax-domain-pill">
            {domain.num} · {domain.titleZh}
          </span>
        )}
        <h2>{stage?.titleZh || '视元舞台'}</h2>
        <p className="ax-overview-sub">{stage?.titleEn}</p>
      </div>

      <p className="ax-def">{stage?.summaryZh || '已收录但还没有归入舞台的视元资源池。'}</p>

      {curated.length > 0 && (
        <section className="ax-sec ax-curated-sec">
          <h3>专精领域标杆库与工具</h3>
          <div className="ax-curated-list">
            {curated.map((c) => (
              <a key={c.url} className="ax-curated-item" href={c.url} target="_blank" rel="noreferrer">
                <div className="ax-curated-item-h">
                  <b>{c.name}</b>
                  <span className="ax-curated-tag">{c.tag}</span>
                </div>
                <p>{c.desc}</p>
              </a>
            ))}
          </div>
        </section>
      )}

      <div className="ax-note">
        <p>💡 鼠标扫过中央舞台的任一部件，或在左栏点选一条术语，即可在此展开其结构正名、代码规范与来源证据。</p>
      </div>
    </div>
  )
}
