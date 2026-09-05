import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import {
  catalogFacets,
  catalogMetaLabels,
  catalogPage,
  filterCatalogEntries,
  prepareCatalogEntries,
} from './lib/site-catalog-browser.js'
import { ShotTrio } from './components/SiteShotTrio.jsx'
import SiteDetailModal from './components/SiteDetailModal.jsx'

const PAGE_SIZE = 60
const ALL_FACET = 'all'
const EMPTY_ENTRIES = Object.freeze([])
const EMPTY_COUNTS = Object.freeze({})

const PRICING_LABELS = {
  free: '免费',
  freemium: '免费增值',
  trial: '可试用',
  paid: '付费',
  beta: '测试中',
  unknown: '价格待核验',
}

const SOURCE_LABELS = {
  'toools-design': 'Toools.design',
  'design-resources-for-developers': 'GitHub 设计目录',
  saaslandingpage: 'SaaS Landing Page',
  'npm-resources': 'npm 资源搜索',
  'ecosystem-repos': 'Ecosyste.ms 仓库',
}

function domainFor(value) {
  try {
    return new URL(value).hostname.replace(/^www\./, '')
  } catch {
    return value
  }
}

function CatalogPager({ pageData, onPage, position }) {
  return (
    <nav className="catalog-pager" aria-label={position === 'top' ? '目录顶部分页' : '目录底部分页'}>
      <p>
        第 {pageData.page} / {pageData.pageCount} 页 · {pageData.from.toLocaleString('en-US')}–
        {pageData.to.toLocaleString('en-US')} / {pageData.total.toLocaleString('en-US')}
      </p>
      <div>
        <button type="button" disabled={pageData.page <= 1} onClick={() => onPage(pageData.page - 1)}>上一页</button>
        <label>
          <span className="sr-only">跳转到目录页</span>
          <select value={pageData.page} onChange={(event) => onPage(Number(event.target.value))}>
            {Array.from({ length: pageData.pageCount }, (_, index) => (
              <option value={index + 1} key={index + 1}>第 {index + 1} 页</option>
            ))}
          </select>
        </label>
        <button type="button" disabled={pageData.page >= pageData.pageCount} onClick={() => onPage(pageData.page + 1)}>下一页</button>
      </div>
    </nav>
  )
}

export default function SiteCatalog() {
  const [status, setStatus] = useState('idle')
  const [catalog, setCatalog] = useState(null)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(ALL_FACET)
  const [subcategory, setSubcategory] = useState(ALL_FACET)
  const [tag, setTag] = useState(ALL_FACET)
  const [pricing, setPricing] = useState(ALL_FACET)
  const [source, setSource] = useState(ALL_FACET)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const searchRef = useRef(null)
  const resultsRef = useRef(null)
  const pendingPageFocusRef = useRef(false)
  const pendingLoadFocusRef = useRef(false)

  const entries = catalog?.entries ?? EMPTY_ENTRIES
  const total = catalog?.total ?? entries.length
  const categoryCounts = catalog?.categoryCounts ?? EMPTY_COUNTS
  const categories = useMemo(
    () => Object.entries(categoryCounts).sort((left, right) => right[1] - left[1]),
    [categoryCounts],
  )
  const deferredQuery = useDeferredValue(query)
  const facets = useMemo(() => catalogFacets(entries, { category }), [category, entries])
  const filteredEntries = useMemo(
    () => filterCatalogEntries(entries, { category, subcategory, tag, pricing, source, query: deferredQuery }),
    [category, deferredQuery, entries, pricing, source, subcategory, tag],
  )
  const pageData = useMemo(
    () => catalogPage(filteredEntries, page, PAGE_SIZE),
    [filteredEntries, page],
  )
  const hasActiveFilters = Boolean(
    query ||
      category !== ALL_FACET ||
      subcategory !== ALL_FACET ||
      tag !== ALL_FACET ||
      pricing !== ALL_FACET ||
      source !== ALL_FACET,
  )
  const displayedTotal = status === 'ready' ? total.toLocaleString('en-US') : '5,000+'
  const displayedCategoryCount = status === 'ready' ? categories.length : 9

  useEffect(() => {
    if (!pendingPageFocusRef.current) return
    pendingPageFocusRef.current = false
    const results = resultsRef.current
    if (!results) return
    results.focus({ preventScroll: true })
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    results.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  }, [page])

  useEffect(() => {
    if (status !== 'ready' || !pendingLoadFocusRef.current) return
    pendingLoadFocusRef.current = false
    searchRef.current?.focus()
  }, [status])

  async function loadCatalog() {
    if (status === 'loading') return
    setStatus('loading')
    setError('')

    try {
      const response = await fetch('/data/site-catalog-index.json', { cache: 'no-store' })
      if (!response.ok) throw new Error(`目录请求失败（${response.status}）`)
      const payload = await response.json()
      if (!Array.isArray(payload.entries)) throw new Error('目录数据格式不正确')
      pendingLoadFocusRef.current = true
      setCatalog({ ...payload, entries: prepareCatalogEntries(payload.entries) })
      setStatus('ready')
      setPage(1)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '目录暂时无法加载')
      setStatus('error')
    }
  }

  function updateCategory(value) {
    setCategory(value)
    setSubcategory(ALL_FACET)
    setTag(ALL_FACET)
    setPricing(ALL_FACET)
    setSource(ALL_FACET)
    setPage(1)
  }

  function goToPage(nextPage) {
    setSelected(null)
    pendingPageFocusRef.current = true
    setPage(nextPage)
  }

  function updateFacet(setter, value) {
    setter(value)
    setPage(1)
  }

  function resetFilters() {
    setQuery('')
    setCategory(ALL_FACET)
    setSubcategory(ALL_FACET)
    setTag(ALL_FACET)
    setPricing(ALL_FACET)
    setSource(ALL_FACET)
    setPage(1)
  }

  function openDetail(entry) {
    setSelected(entry)
  }

  return (
    <section className="catalog-directory" id="catalog-directory" aria-labelledby="catalog-directory-title">
      <header className="catalog-directory-head">
        <div>
          <p className="catalog-kicker">COMPLETE RESOURCE CATALOG</p>
          <h2 id="catalog-directory-title">完整资源目录</h2>
          <p className="catalog-summary">
            多来源目录已规范化、去重并补齐中文简介；目录候选不等于视觉核验上线。点击卡片查看作者、源码与三图预览。
          </p>
        </div>
        <div className="catalog-directory-stat" aria-label={`目录包含 ${displayedTotal} 条候选资源`}>
          <strong>{displayedTotal}</strong>
          <span>条候选 · {displayedCategoryCount} 个一级分类</span>
        </div>
      </header>

      {status === 'idle' ? (
        <button type="button" className="catalog-load" onClick={loadCatalog}>
          浏览 {displayedTotal} 条完整目录
          <span>按需加载索引，不拖慢上方策展</span>
        </button>
      ) : null}

      {status === 'loading' ? <div className="catalog-status" role="status">正在载入完整目录…</div> : null}

      {status === 'error' ? (
        <div className="catalog-status catalog-status-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={loadCatalog}>重试</button>
        </div>
      ) : null}

      {status === 'ready' ? (
        <div className="catalog-browser">
          <div className="catalog-browser-controls">
            <label className="catalog-search">
              <span className="sr-only">搜索完整资源目录</span>
              <input
                type="search"
                ref={searchRef}
                placeholder={`搜索全部 ${total.toLocaleString('en-US')} 条目录资源`}
                value={query}
                onChange={(event) => updateFacet(setQuery, event.target.value)}
              />
            </label>

            <div className="catalog-facet-grid">
              <label className="catalog-category">
                <span>一级分类</span>
                <select value={category} onChange={(event) => updateCategory(event.target.value)}>
                  <option value={ALL_FACET}>全部（{total.toLocaleString('en-US')}）</option>
                  {categories.map(([name, count]) => (
                    <option value={name} key={name}>{name}（{count}）</option>
                  ))}
                </select>
              </label>

              <label className="catalog-category">
                <span>细分类</span>
                <select value={subcategory} onChange={(event) => updateFacet(setSubcategory, event.target.value)}>
                  <option value={ALL_FACET}>全部细分类（{facets.subcategories.length}）</option>
                  {facets.subcategories.map(([name, count]) => (
                    <option value={name} key={name}>{name}（{count}）</option>
                  ))}
                </select>
              </label>

              <label className="catalog-category">
                <span>标签</span>
                <select value={tag} onChange={(event) => updateFacet(setTag, event.target.value)}>
                  <option value={ALL_FACET}>全部标签（{facets.tags.length}）</option>
                  {facets.tags.map(([name, count]) => (
                    <option value={name} key={name}>{name}（{count}）</option>
                  ))}
                </select>
              </label>

              <label className="catalog-category">
                <span>价格</span>
                <select value={pricing} onChange={(event) => updateFacet(setPricing, event.target.value)}>
                  <option value={ALL_FACET}>全部价格</option>
                  {facets.pricing.map(([name, count]) => (
                    <option value={name} key={name}>{PRICING_LABELS[name] ?? name}（{count}）</option>
                  ))}
                </select>
              </label>

              <label className="catalog-category">
                <span>来源</span>
                <select value={source} onChange={(event) => updateFacet(setSource, event.target.value)}>
                  <option value={ALL_FACET}>全部来源</option>
                  {facets.sources.map(([name, count]) => (
                    <option value={name} key={name}>{SOURCE_LABELS[name] ?? name}（{count}）</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="catalog-browser-summary">
              <p className="catalog-result-count" aria-live="polite">
                {filteredEntries.length.toLocaleString('en-US')} 条匹配 · 每页 {PAGE_SIZE} 条
              </p>
              {hasActiveFilters ? <button type="button" onClick={resetFilters}>清除全部筛选</button> : null}
            </div>
          </div>

          {pageData.items.length > 0 ? (
            <>
              <CatalogPager pageData={pageData} onPage={goToPage} position="top" />
              <div
                className="catalog-results catalog-results-grid"
                ref={resultsRef}
                tabIndex={-1}
                role="region"
                aria-label={`目录结果，第 ${pageData.page} 页`}
              >
                {pageData.items.map((entry) => (
                  <button
                    type="button"
                    className="catalog-result-card"
                    key={entry.id}
                    onClick={() => openDetail(entry)}
                    aria-label={`查看 ${entry.name} 详情`}
                  >
                    <div className="catalog-card-trio">
                      <ShotTrio shots={entry.shots} name={entry.name} url={entry.canonicalUrl} />
                    </div>
                    <div className="catalog-card-body">
                      <div className="catalog-card-topline">
                        <h3>{entry.name}</h3>
                        <span className="catalog-card-domain">{domainFor(entry.canonicalUrl)}</span>
                      </div>
                      <p className="catalog-card-desc">{entry.descriptionZh}</p>
                      <div className="catalog-card-meta">
                        {catalogMetaLabels(entry).map((label) => <span key={label}>{label}</span>)}
                        <em>{PRICING_LABELS[entry.pricing?.model] ?? PRICING_LABELS.unknown}</em>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <CatalogPager pageData={pageData} onPage={goToPage} position="bottom" />
            </>
          ) : (
            <div className="catalog-status" role="status">没有匹配的目录资源。</div>
          )}
        </div>
      ) : null}

      <SiteDetailModal site={selected} onClose={() => setSelected(null)} />
    </section>
  )
}
