import { useEffect, useMemo, useRef, useState } from 'react'
import FacetChips from '../components/FacetChips.jsx'
import SiteCard from '../components/SiteCard.jsx'
import { latestCheckedAt } from '../lib/counts.js'
import {
  SORTS,
  exclusionBreakdown,
  filterSites,
  formatCheckedAt,
  loadSiteIndex,
  readSitesState,
  sortSites,
  toggleSelection,
  writeSitesHash,
} from '../lib/site-browser.js'
import { useLocale, useT } from '../i18n.js'

/* ============ 全部站点（方案 §3.7 / §4.5） ============
 * 编辑策划的入口没有覆盖保证，所以必须有一格保证「每个条目都能被够到」。
 * 这一格 = 单一列表 + 切面 chips + 两种排序 + 一个搜索框，状态全部写进 hash，
 * 于是任何一次收口都可分享、可后退、可被 Agent 引用。
 */

/* 骨架格的数量取上一次的结果数，不写死；第一次进来没有上一次，就只说一句人话。 */
let lastResultCount = null

/* 一屏先画这么多张卡，剩下的滚到跟前再画。
 *
 * 语料从 236 条长到近万条之后，一次把九千张卡塞进 DOM 会把浏览器直接冻住——
 * 不是慢，是不回来。这里不换分页控件、不改卡片、不改栅格：卡还是同一张卡、
 * 顺序还是同一个顺序，只是「还没滚到的先不建节点」。视觉与交互和以前完全一致。 */
const PAGE_SIZE = 60

/**
 * 滚到底部哨兵出现时再放一屏出来。
 * 用 IntersectionObserver 而不是滚动监听：不占主线程，也不会在筛选变化时抖。
 */
function useIncrementalReveal(total, resetKey) {
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [lastKey, setLastKey] = useState(resetKey)
  const sentinel = useRef(null)

  /* 换了筛选条件就从头开始，否则用户改一个 chip 会停在「已经翻了 4000 条」的地方。
   * 在渲染期直接改状态是 React 官方的「props 变了就调整 state」写法；
   * 放进 effect 会多渲染一轮，也会让列表先闪一下旧长度。 */
  if (lastKey !== resetKey) {
    setLastKey(resetKey)
    setVisible(PAGE_SIZE)
  }

  useEffect(() => {
    if (visible >= total) return undefined
    const node = sentinel.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      /* 没有 IntersectionObserver 就退化成「都画出来」，宁可慢也不要空列表。 */
      setVisible(total)
      return undefined
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible((current) => Math.min(current + PAGE_SIZE, total))
        }
      },
      { rootMargin: '600px 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [visible, total])

  return { visible, sentinel }
}

export default function AllSites() {
  const t = useT()
  const locale = useLocale()
  const [state, setState] = useState({ status: 'loading', index: null, error: null })
  const [browse, setBrowse] = useState(() => readSitesState())

  useEffect(() => {
    let alive = true
    loadSiteIndex()
      .then((index) => alive && setState({ status: 'ready', index, error: null }))
      .catch((error) => alive && setState({ status: 'error', index: null, error }))
    return () => {
      alive = false
    }
  }, [])

  /* 地址栏是筛选状态的真源：后退键、深链、外部粘进来的地址都从这里进。 */
  useEffect(() => {
    const onHashChange = () => setBrowse(readSitesState())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  /* 反过来：状态变了就改写地址，但用 replaceState——每点一个 chip 就往
   * 历史里塞一条，后退键会变成「逐个撤销筛选」，那不是用户按后退时想要的。 */
  const update = (next) => {
    setBrowse(next)
    window.history.replaceState(window.history.state, '', writeSitesHash(next))
  }

  const items = useMemo(() => state.index?.items ?? [], [state.index])
  /* 先排一次序，再筛。
   *
   * 顺序调换是因为代价不一样：排序是 O(n log n) 次比较、每次都要跑 collator；
   * 筛选是 O(n) 次字符串包含。近万条语料下，用户每敲一个字符都要重排一次全量，
   * 实测一个「react」要 3 秒。而筛选不会改变相对顺序——先排后筛的最终结果和
   * 先筛后排完全一致，但敲键时只剩 O(n) 的筛选。 */
  const ordered = useMemo(() => sortSites(items, browse.sort), [items, browse.sort])
  const results = useMemo(() => filterSites(ordered, browse), [ordered, browse])

  useEffect(() => {
    if (state.status === 'ready') lastResultCount = results.length
  }, [state.status, results.length])

  const worst = results.length === 0 ? exclusionBreakdown(items, browse)[0] : null
  const latest = formatCheckedAt(latestCheckedAt(items))
  /* 筛选条件变了就重新从第一屏开始画。 */
  const { visible, sentinel } = useIncrementalReveal(
    results.length,
    `${browse.q}|${browse.sort}|${JSON.stringify(browse.selections)}`,
  )

  const clearOne = (row) => {
    if (!row) return
    if (row.kind === 'q') update({ ...browse, q: '' })
    else {
      update({ ...browse, selections: toggleSelection(browse.selections, row.axis, row.value) })
    }
  }

  return (
    <div className="vl-allsites">
      <header className="vl-page-head">
        <a className="vl-back" href="#/">
          <span aria-hidden="true">← </span>{t('backCuration')}
        </a>
        <h1 className="vl-page-title">{t('allSites')}</h1>
        <p className="vl-page-meta">
          {state.status === 'ready' ? items.length : '—'}
          {latest ? (
            <>
              <span className="vl-sep" aria-hidden="true">·</span>
              {t('promiseChecked')} <time className="x-mono" dateTime={latest}>{latest}</time>
            </>
          ) : null}
        </p>
      </header>

      <div className="vl-tools">
        <div className="vl-search">
          <label className="sr-only" htmlFor="vl-sites-q">{t('searchSitesLabel')}</label>
          <input
            id="vl-sites-q"
            type="search"
            value={browse.q}
            placeholder={t('searchSites')}
            onChange={(event) => update({ ...browse, q: event.target.value })}
          />
        </div>
        <label className="vl-sort">
          <span>{t('sort')}</span>
          <select
            value={browse.sort}
            onChange={(event) => update({ ...browse, sort: event.target.value })}
          >
            {SORTS.map((sort) => (
              <option key={sort.id} value={sort.id}>
                {locale === 'en' ? sort.labelEn : sort.labelZh}
              </option>
            ))}
          </select>
        </label>
      </div>

      {state.status === 'ready' ? (
        <FacetChips
          items={items}
          selections={browse.selections}
          onToggle={(axis, value) =>
            update({ ...browse, selections: toggleSelection(browse.selections, axis, value) })
          }
          onClear={() => update({ ...browse, selections: {}, sort: browse.sort })}
        />
      ) : null}

      <p className="vl-result-count" aria-live="polite">
        {state.status === 'ready'
          ? t('resultCount').replace('{n}', String(results.length)).replace('{total}', String(items.length))
          : ' '}
      </p>

      {state.status === 'error' ? (
        <p className="vl-alert" role="alert">
          {t('loadFail')}
          <button type="button" onClick={() => window.location.reload()}>{t('retry')}</button>
        </p>
      ) : null}

      {state.status === 'loading' ? <GridSkeleton count={lastResultCount} /> : null}

      {state.status === 'ready' && results.length > 0 ? (
        <>
          <div className="vl-grid">
            {results.slice(0, visible).map((item, index) => (
              <SiteCard key={item.entryId} item={item} priority={index < 3} />
            ))}
          </div>
          {visible < results.length ? (
            <div ref={sentinel} className="vl-grid-sentinel" aria-hidden="true" />
          ) : null}
        </>
      ) : null}

      {state.status === 'ready' && results.length === 0 ? (
        <div className="vl-empty" role="status">
          <h2>{t('emptySites')}</h2>
          {worst ? (
            <button type="button" className="vl-empty-action" onClick={() => clearOne(worst)}>
              {t('clearFilters')}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function GridSkeleton({ count }) {
  const t = useT()
  if (!count) return <p className="vl-result-count">{t('loadingIndex')}</p>
  return (
    <div className="vl-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div className="vl-card vl-card--skeleton" key={index}>
          <span className="vl-skel vl-skel-shot" />
          <span className="vl-skel vl-skel-line" />
          <span className="vl-skel vl-skel-line is-short" />
        </div>
      ))}
    </div>
  )
}
