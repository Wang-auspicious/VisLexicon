import { useMemo, useState } from 'react'
import { CURATED_SITES } from '../data/curated-sites.js'
import { curationFacets, filterCuratedSites } from '../lib/curation.js'
import SiteDetailModal from '../components/SiteDetailModal.jsx'
import SiteCatalog from '../SiteCatalog.jsx'

const ALL_FILTER = 'all'

function toModalSite(site) {
  return {
    name: site.name,
    url: site.site,
    shots: site.shots,
    descriptionZh: site.about,
    about: site.about,
    authorName: site.author,
    repo: site.repo,
    github: site.repo,
    tags: site.themes,
    pricing: site.pricing,
    domain: site.site,
  }
}

export default function IndexView() {
  const [activeCategory, setActiveCategory] = useState(ALL_FILTER)
  const [activeStack, setActiveStack] = useState(ALL_FILTER)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)

  const facets = useMemo(() => curationFacets(CURATED_SITES), [])
  const filteredSites = useMemo(
    () =>
      filterCuratedSites(CURATED_SITES, {
        category: activeCategory,
        stack: activeStack,
        query,
      }),
    [activeCategory, activeStack, query],
  )

  function resetFilters() {
    setActiveCategory(ALL_FILTER)
    setActiveStack(ALL_FILTER)
    setQuery('')
  }

  return (
    <div className="oreo-outer-canvas">
      <div className="oreo-curation-shell">
        <header className="oreo-frame-header">
          <div className="oreo-brand">
            <p className="oreo-kicker">CURATED WEB INDEX</p>
            <div className="oreo-title-line">
              <h1 className="oreo-logo-text">外部网站策展</h1>
              <span className="oreo-count-badge" aria-live="polite">
                {filteredSites.length} / {CURATED_SITES.length} 个已核验站点
              </span>
            </div>
            <p className="oreo-deck">三张真实画面先看清一个站，再决定要不要打开。</p>
          </div>

          <div className="oreo-controls" aria-label="策展筛选">
            <div className="oreo-filter-primary">
              <div className="oreo-search-field">
                <label className="sr-only" htmlFor="curation-search">
                  搜索策展站点
                </label>
                <input
                  id="curation-search"
                  type="search"
                  placeholder="搜索站点、用途、技术栈或主题"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                {query ? (
                  <button type="button" className="clear-ico" onClick={() => setQuery('')}>
                    清除
                  </button>
                ) : null}
              </div>

              <label className="oreo-stack-filter">
                <span className="oreo-filter-label">技术栈</span>
                <select value={activeStack} onChange={(event) => setActiveStack(event.target.value)}>
                  <option value={ALL_FILTER}>全部技术栈</option>
                  {facets.stacks.map((stack) => (
                    <option key={stack} value={stack}>
                      {stack}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="oreo-category-row">
              <span className="oreo-filter-label">用途</span>
              <div className="oreo-category-pills" aria-label="用途分类">
                <button
                  type="button"
                  className={`oreo-cat-item ${activeCategory === ALL_FILTER ? 'active' : ''}`}
                  aria-pressed={activeCategory === ALL_FILTER}
                  onClick={() => setActiveCategory(ALL_FILTER)}
                >
                  全部
                </button>
                {facets.categories.map((category) => (
                  <button
                    type="button"
                    key={category}
                    className={`oreo-cat-item ${activeCategory === category ? 'active' : ''}`}
                    aria-pressed={activeCategory === category}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <section className="oreo-board-frame" aria-label="已核验站点">
          {filteredSites.length > 0 ? (
            <div className="oreo-cards-grid">
              {filteredSites.map((site, siteIndex) => (
                <button
                  key={site.id}
                  type="button"
                  className="oreo-specimen-card oreo-specimen-card-btn"
                  onClick={() => setSelected(site)}
                  aria-label={`查看 ${site.name} 详情`}
                >
                <div className="oreo-trio-stage">
                  <div className="oreo-trio-main">
                    <img
                      src={site.shots[0].src}
                      alt={site.shots[0].alt}
                      className="oreo-real-img"
                      loading={siteIndex < 3 ? 'eager' : 'lazy'}
                      fetchPriority={siteIndex < 3 ? 'high' : undefined}
                      decoding="async"
                    />
                  </div>
                  <div className="oreo-trio-sub-row">
                    {site.shots.slice(1).map((shot) => (
                      <div className="oreo-trio-sub-box" key={shot.src}>
                        <img
                          src={shot.src}
                          alt={shot.alt}
                          className="oreo-real-img"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="oreo-meta-block">
                  <div className="oreo-meta-row1">
                    <span className="oreo-card-title">{site.name}</span>
                    <div className="oreo-row1-right">
                      <span className="oreo-instance-counter">{site.scale}</span>
                      <span className="oreo-free-chip">{site.pricing}</span>
                    </div>
                  </div>

                  <div className="oreo-meta-row2">
                    {site.stacks.map((stack) => (
                      <span key={stack} className="oreo-stack-pill">
                        {stack}
                      </span>
                    ))}
                  </div>

                  <div className="oreo-meta-row3-marquee">
                    <div className="oreo-marquee-track">
                      {[...site.themes, ...site.themes].map((theme, index) => (
                        <span
                          key={`${theme}-${index}`}
                          className="oreo-green-theme-pill"
                          aria-hidden={index >= site.themes.length ? 'true' : undefined}
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="oreo-empty-state" role="status">
              <h2>没有匹配的已核验站点</h2>
              <p>试试减少搜索词，或清除用途与技术栈筛选。</p>
              <button type="button" onClick={resetFilters}>
                重置筛选
              </button>
            </div>
          )}
        </section>
        <SiteCatalog />
      </div>

      <SiteDetailModal
        site={selected ? toModalSite(selected) : null}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}
