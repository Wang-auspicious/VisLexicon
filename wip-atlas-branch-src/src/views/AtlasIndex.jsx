import { useEffect, useMemo, useState } from 'react'
import atlas from '../data/visual-atlas.json'
import { MANIFESTS } from '../stages/manifests.js'
import { buildStageIndex, MASTER_DOMAINS } from '../lib/stage-index.js'
import { positionIndex } from '../lib/stage-zones.js'
import {
  DEPTHS, DEPTH_LABEL, DEPTH_DEFINITION,
  TERM_STATUSES, TERM_STATUS_LABEL, TERM_STATUS_DEFINITION,
  statusDistribution,
} from '../lib/atlas-status.js'
import { buildTermIndex, searchRecords, termHref } from '../lib/search-index.js'
import { useRoute, navigate } from '../router.js'
import PositionMap from '../components/atlas/PositionMap.jsx'

/* ============ 图鉴索引页（方案 §5.1） ============
 * `#/atlas` 不落到任何一台。四个中立入口并列，服务四种不同的来意：
 *   ① 我知道名称，或能描述  → 搜索
 *   ② 我知道自己在做什么    → 九台
 *   ③ 我知道它在页面哪里    → 位置索引
 *   ④ 我想补全见识          → 两套正交标签的分布
 *
 * 纪律：这一页上每个数字都由 stage-index / stage-zones / atlas-status 现算，
 * 本文件内没有任何表示统计量的字面量。
 */

const INDEX = buildStageIndex(MANIFESTS, atlas)
const POSITIONS = positionIndex(MANIFESTS)
const TERM_RECORDS = buildTermIndex(atlas, MANIFESTS)

/* 搜索结果一次显示多少条。这是版面参数，不是统计量。 */
const SEARCH_LIMIT = 12

function stageCard(stage) {
  const zones = stage.zones.length
  const compare = stage.compareSets.length
  return { stage, zones, compare }
}

export default function AtlasIndex() {
  const route = useRoute()
  const [q, setQ] = useState(route.query.q ?? '')

  /* 从别处深链过来（全站搜索对未入台术语给的是 `#/atlas?q=…`）时同步一次。 */
  useEffect(() => { setQ(route.query.q ?? '') }, [route.query.q])

  const hits = useMemo(
    () => (q.trim() ? searchRecords(TERM_RECORDS, q, SEARCH_LIMIT) : []),
    [q],
  )
  const hitTotal = useMemo(
    () => (q.trim() ? searchRecords(TERM_RECORDS, q).length : 0),
    [q],
  )

  const dist = useMemo(() => statusDistribution(atlas.entries, INDEX), [])
  const cards = useMemo(() => INDEX.stages.map(stageCard), [])
  const byStage = useMemo(
    () => new Map(cards.map((card) => [card.stage.id, card])),
    [cards],
  )

  return (
    <div className="axi">
      <header className="axi-head">
        <p className="axi-kicker x-mono">图鉴</p>
        <h1>
          {INDEX.stages.length} 个活舞台，{dist.depth.staged} 条术语在台上可调
        </h1>
        <p className="axi-lede">
          图鉴不是一份完整词表，也不打算是。样本库里 {dist.total} 条大多只是带来源的采集记录；
          真正被摆上台、能调、能高亮的是 {dist.depth.staged} 条。
          我们把 {dist.depth.staged} 当成资产，不把 {dist.total} 当成规模。
          <a className="axi-lede-link" href="#/about">口径怎么算 →</a>
        </p>
      </header>

      <div className="axi-grid">
        {/* ① 我知道名称 / 能描述 */}
        <section className="axi-card axi-search-card" aria-labelledby="axi-h-search">
          <h2 id="axi-h-search"><span className="axi-num x-mono">01</span>我知道名称，或者能描述它</h2>
          <p className="axi-sub">吃正名、中文名、台上订正名、别名与定义前段。只搜术语，不搜站点。</p>
          <form
            className="axi-search"
            role="search"
            onSubmit={(event) => {
              event.preventDefault()
              navigate(q.trim() ? `#/atlas?q=${encodeURIComponent(q.trim())}` : '#/atlas')
            }}
          >
            <label className="axi-search-label" htmlFor="axi-q">搜索图鉴术语</label>
            <input
              id="axi-q"
              type="search"
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="打字，或说个大概…"
              autoComplete="off"
            />
          </form>

          {q.trim() ? (
            <div className="axi-hits">
              <p className="axi-hits-h x-mono">
                {hitTotal ? `命中 ${hitTotal} 条` : '没有命中'}
                {hitTotal > hits.length && `，先列前 ${hits.length} 条`}
              </p>
              <ul className="axi-hit-list">
                {hits.map((hit) => (
                  <li key={hit.id}>
                    <a className="axi-hit" href={termHref(hit, q)}>
                      <b>{hit.termEn}</b>
                      <span>{hit.termZhFix || hit.termZh}</span>
                      <em className="x-mono">
                        {hit.stageTitleZh ? hit.stageTitleZh : '还没有台'}
                      </em>
                    </a>
                  </li>
                ))}
              </ul>
              {!hitTotal && (
                <p className="axi-empty">
                  换个说法试试：这里只认术语的名字、别名和定义前段，不认整句提问。
                </p>
              )}
            </div>
          ) : (
            <p className="axi-empty">
              还没有输入。也可以用顶栏那个搜索框，它同时搜术语和站点。
            </p>
          )}
        </section>

        {/* ④ 补全见识：两套正交标签 */}
        <section className="axi-card axi-status-card" aria-labelledby="axi-h-status">
          <h2 id="axi-h-status"><span className="axi-num x-mono">04</span>我想知道这批词的成色</h2>
          <p className="axi-sub">
            两套标签互不替代：一套说我们做到哪一步，一套说这个词在行业里算什么。
          </p>

          <div className="axi-dist">
            <h3>建档深度 · 我们做到哪一步</h3>
            <ul className="axi-bars">
              {DEPTHS.map((key) => (
                <li key={key}>
                  <span className="axi-bar-label">{DEPTH_LABEL[key]}</span>
                  <span className="axi-bar-track" aria-hidden="true">
                    <i style={{ inlineSize: `${(dist.depth[key] / dist.total) * 100}%` }} />
                  </span>
                  <em className="x-mono">{dist.depth[key]}</em>
                  <p className="axi-bar-def">{DEPTH_DEFINITION[key]}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="axi-dist">
            <h3>术语地位 · 这个词在行业里算什么</h3>
            <ul className="axi-bars">
              {TERM_STATUSES.map((key) => (
                <li key={key}>
                  <span className="axi-bar-label">{TERM_STATUS_LABEL[key]}</span>
                  <span className="axi-bar-track" aria-hidden="true">
                    <i style={{ inlineSize: `${(dist.termStatus[key] / dist.total) * 100}%` }} />
                  </span>
                  <em className="x-mono">{dist.termStatus[key]}</em>
                  <p className="axi-bar-def">{TERM_STATUS_DEFINITION[key]}</p>
                </li>
              ))}
            </ul>
          </div>

          <p className="axi-review">
            人工复核：目前 {dist.reviewed} 条。
            采集时间不算复核——机器抓到的时刻和有人看过并认可，是两件事。
          </p>
        </section>

        {/* ② 我知道自己在做什么 */}
        <section className="axi-card axi-stages-card" aria-labelledby="axi-h-stages">
          <h2 id="axi-h-stages"><span className="axi-num x-mono">02</span>我知道自己在做什么</h2>
          <p className="axi-sub">一台 = 一族术语活体同屏。按八大领域排，没有台的领域也列出来。</p>

          {MASTER_DOMAINS.map((domain) => {
            const list = domain.stageIds.map((id) => byStage.get(id)).filter(Boolean)
            return (
              <div className="axi-domain" key={domain.id}>
                <h3>
                  <em className="x-mono">{domain.num}</em>
                  {domain.titleZh}
                  <span className="x-mono axi-domain-count">
                    {list.length} 台 · {list.reduce((sum, card) => sum + card.stage.claims.length, 0)} 条
                  </span>
                </h3>
                {list.length ? (
                  <ul className="axi-stage-list">
                    {list.map(({ stage, zones, compare }) => (
                      <li key={stage.id}>
                        <a className="axi-stage" href={`#/atlas/${stage.id}`}>
                          <b>{stage.titleZh}</b>
                          <span className="axi-stage-en x-mono">{stage.titleEn}</span>
                          <p>{stage.summaryZh}</p>
                          <span className="axi-stage-meta x-mono">
                            <em>{stage.claims.length} 条认领</em>
                            <em>{zones} 个分区</em>
                            <em>{compare ? `${compare} 组对照` : '无对照组'}</em>
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="axi-domain-empty">
                    还没有台。本轮语料没有按这个领域标注，所以也给不出「语料里有几条」——
                    不写「规划中」三个字了事。
                  </p>
                )}
              </div>
            )
          })}
        </section>

        {/* ③ 我知道它在页面哪里 */}
        <section className="axi-card axi-position-card" aria-labelledby="axi-h-pos">
          <h2 id="axi-h-pos"><span className="axi-num x-mono">03</span>我知道它在页面的哪个位置</h2>
          <p className="axi-sub">
            按版面位置检索，而不是按名字。为 0 的区域也留着——「这一区还没有台」比藏起来诚实。
          </p>
          <PositionMap positions={POSITIONS} index={INDEX} manifests={MANIFESTS} />
        </section>
      </div>
    </div>
  )
}
