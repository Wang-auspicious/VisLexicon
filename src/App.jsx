import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { useRoute, parseRoute, navigate } from './router.js'
import { INFO_ROUTES } from './data/site-info.js'
import { loadStored } from './store.js'
import GlobalSearch from './components/GlobalSearch.jsx'
import ChannelNavigation from './components/ChannelNavigation.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import LangToggle from './components/LangToggle.jsx'
import SiteFooter from './components/SiteFooter.jsx'
import { useT } from './i18n.js'
import About from './views/About.jsx'
import ComponentDiscovery from './components/ComponentDiscovery.jsx'
import RouteErrorBoundary from './components/RouteErrorBoundary.jsx'

/* 视图按路由分包：图鉴要载 1MB 语料，策展要载站点索引，
 * 谁也不该出现在别人的首屏包里。 */
import Curation from './views/Curation.jsx'
const AllSites = lazy(() => import('./views/AllSites.jsx'))
const SiteDetail = lazy(() => import('./views/SiteDetail.jsx'))
const loadAtlas = () => import('./views/Atlas.jsx')
const Atlas = lazy(loadAtlas)
const Favorites = lazy(() => import('./views/Favorites.jsx'))
const Components = lazy(() => import('./views/Components.jsx'))
const Playground = lazy(() => import('./views/Playground.jsx'))
const ResourceLibrary = lazy(() => import('./views/ResourceLibrary.jsx'))
const CurationReview = lazy(() => import('./views/CurationReview.jsx'))
const ResourceKit = lazy(() => import('./views/ResourceKit.jsx'))
const InfoPages = lazy(() => import('./views/InfoPages.jsx'))
const SponsorDialog = lazy(() => import('./components/SponsorCards.jsx').then((m) => ({ default: m.SponsorDialog })))

loadStored()

/* 创作资源是独立内容单元，不计入已核验站点。 */
const CHANNELS = [
  { hash: '#/', key: 'curation', match: (name) => ['curation', 'sites', 'site', 'components'].includes(name) },
  { hash: '#/atlas', key: 'atlas', match: (name) => name === 'atlas' },
  { hash: '#/playground', key: 'playground', match: (name) => name === 'playground' },
  { hash: '#/skills', key: 'skills', match: (name) => name === 'skills' },
  { hash: '#/ppt', key: 'ppt', match: (name) => name === 'ppt' },
  { hash: '#/graphics', key: 'graphics', match: (name) => name === 'graphics' },
  { hash: '#/science', key: 'science', match: (name) => name === 'science' },
  { hash: '#/about', key: 'about', match: (name) => name === 'about' },
  { hash: '#/favorites', key: 'favorites', match: (name) => name === 'favorites' },
]

function NotFound({ hash }) {
  const t = useT()
  return (
    <section className="notfound">
      <p className="x-mono">404</p>
      <h1>{t('notFoundTitle')}</h1>
      <p>
        <span className="x-mono">{hash}</span> {t('notFoundBody')}
      </p>
      <nav className="notfound-links" aria-label={t('nav')}>
        <a className="btn-primary" href="#/">{t('backHome')}</a>
        <a className="btn-ghost" href="#/atlas">{t('goAtlas')}</a>
        <a className="btn-ghost" href="#/about">{t('goAbout')}</a>
      </nav>
    </section>
  )
}

function RouteFallback() {
  const t = useT()
  return <p className="route-loading" role="status">{t('loading')}</p>
}

export default function App() {
  const route = useRoute()
  const t = useT()
  const [menuOpen, setMenuOpen] = useState(false)
  const [atlasMounted, setAtlasMounted] = useState(route.name === 'atlas')
  const prewarmAtlas = () => { void loadAtlas(); setAtlasMounted(true) }

  // Idle work only fetches the small host chunk. The document starts on intent
  // (hover/focus) so the home page does not download the atlas in the background.
  useEffect(() => {
    if (!window.requestIdleCallback) return undefined
    const idle = window.requestIdleCallback(() => { void loadAtlas() })
    return () => window.cancelIdleCallback(idle)
  }, [])
  useEffect(() => { if (route.name === 'atlas') setAtlasMounted(true) }, [route.name])

  /* 站点详情是叠层：底下继续渲染点进来的那个列表路由。
   * 「从哪来」写在 history.state.from 上（波次 3 接口文档），
   * 深链直接打开时没有这个字段 → 底层落到策展首页。 */
  const overlayOpen = route.name === 'site'
  const cameFrom = overlayOpen && typeof window !== 'undefined'
    ? String(window.history.state?.from ?? '')
    : ''
  const baseRoute = overlayOpen
    ? (['atlas', 'sites', 'favorites', 'components'].includes(parseRoute(cameFrom).name) ? parseRoute(cameFrom).name : 'curation')
    : route.name
  const atlasRoute = overlayOpen && baseRoute === 'atlas' ? parseRoute(cameFrom) : route

  /* 汉堡展开时锁背景；路由一变就收起。 */
  useEffect(() => { setMenuOpen(false) }, [route.hash])

  useEffect(() => {
    if (!menuOpen) return undefined
    const onKey = (event) => { if (event.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  /* 换页回到顶部；带锚点（如 `#/about#submit`）则滚到那一节。
   * 叠层开合不动滚动位置——关掉浮窗要回到列表原来的地方。
   *
   * 只判断 `overlayOpen` 不够：浮窗关闭时 `route.name` 也从 `site` 变回列表路由，
   * 这一轮的 effect 会被当成「换页」而把列表滚回顶部。所以要记住上一轮是不是叠层，
   * 叠层刚关掉就整段跳过。 */
  const wasOverlayRef = useRef(overlayOpen)
  const sponsorClosedRef = useRef(false)
  useEffect(() => {
    const closedOverlay = wasOverlayRef.current && !overlayOpen
    wasOverlayRef.current = overlayOpen
    if (overlayOpen || closedOverlay) return
    /* #sponsor 只开关赞助小窗，不动页面位置。 */
    if (route.fragment === 'sponsor' || sponsorClosedRef.current) { sponsorClosedRef.current = route.fragment === 'sponsor'; return }
    if (route.fragment) {
      const target = document.getElementById(route.fragment)
      if (target) {
        target.scrollIntoView({ block: 'start' })
        return
      }
    }
    window.scrollTo({ top: 0 })
  }, [route.name, route.fragment, overlayOpen])

  /* 叠层关闭：从列表点进来的用后退键还原，深链进来的落到列表页。 */
  const closeOverlay = () => {
    if (window.history.state?.from) window.history.back()
    else navigate('#/')
  }

  const backgroundLocked = menuOpen || overlayOpen

  return (
    <div className="site" data-view={baseRoute}>
      <a className="skip-link" href="#main-content">{t('skip')}</a>

      <nav className="nav" aria-label={t('nav')} inert={overlayOpen}>
        <div className="nav-left">
          <a className="nav-brand" href="#/" aria-label={`VisLexicon · ${t('backHome')}`}>VisLexicon</a>
          <ChannelNavigation channels={CHANNELS} activeName={route.name} t={t} onAtlasIntent={prewarmAtlas} />
        </div>

        <div className="nav-right">
          <GlobalSearch />
          <LangToggle />
          <ThemeToggle />
          <button
            type="button"
            className={`nav-hamburger ${menuOpen ? 'open' : ''}`}
            aria-label={menuOpen ? t('menuClose') : t('menuOpen')}
            aria-controls="mobile-menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>

        {/* 用 hidden 而不是条件渲染：关闭态在 DOM 里但不可 Tab 进入（方案 §7.4 第 2 条） */}
        <div id="mobile-menu" className="mobile-menu" hidden={!menuOpen} inert={!menuOpen}>
          {CHANNELS.map((channel) => {
            const active = channel.match(route.name)
            return (
              <a
                key={channel.hash}
                className={`mobile-nav-link ${active ? 'on' : ''}`}
                href={channel.hash}
                aria-current={active ? 'page' : undefined}
                onClick={() => setMenuOpen(false)}
                onPointerEnter={channel.key === 'atlas' ? prewarmAtlas : undefined}
                onFocus={channel.key === 'atlas' ? prewarmAtlas : undefined}
              >
                {t(channel.key)}
              </a>
            )
          })}
        </div>
      </nav>

      <div className="site-body" inert={backgroundLocked}>
        <main id="main-content" className="route" tabIndex="-1">
          {/* Resource columns already have their own bounded search and topic
              navigation. Keeping the component discovery surface mounted here
              duplicated the index fetch and made every resource route wait on a
              second search surface before its first cards could paint. */}
          {['curation', 'sites'].includes(baseRoute) && <ComponentDiscovery initialQuery={route.query.q||''} key={baseRoute === 'sites' ? 'curation' : baseRoute} scope="curation" />}
          <RouteErrorBoundary key={`route:${baseRoute}:${route.params.resourceType || ''}`}>
          <Suspense fallback={<RouteFallback />}>
            {baseRoute === 'curation' && <Curation />}
            {baseRoute === 'sites' && <AllSites />}
            {baseRoute === 'about' && <About />}
            {INFO_ROUTES.includes(baseRoute) && <InfoPages name={baseRoute} />}
            {baseRoute === 'favorites' && <Favorites />}
            {baseRoute === 'components' && <Components />}
            {baseRoute === 'playground' && <Playground />}
            {baseRoute === 'curation-review' && <CurationReview />}
            {['ppt', 'science', 'graphics'].includes(baseRoute) && route.query.kit && (
              <ResourceKit channel={baseRoute} kitId={route.query.kit} />
            )}
            {['skills', 'ppt', 'science', 'graphics'].includes(baseRoute) && !route.query.kit && (
              <ResourceLibrary channel={baseRoute} resourceType={route.params.resourceType} query={route.query} />
            )}
            {baseRoute === 'notfound' && <NotFound hash={route.hash} />}
          </Suspense>
          </RouteErrorBoundary>
          {(atlasMounted || baseRoute === 'atlas') && (
            <div style={{ display: baseRoute === 'atlas' ? 'contents' : 'none' }} inert={baseRoute !== 'atlas'} aria-hidden={baseRoute !== 'atlas'}>
              <Suspense fallback={baseRoute === 'atlas' ? <RouteFallback /> : null}>
                <Atlas active={baseRoute === 'atlas' && !overlayOpen} stage={baseRoute === 'atlas' ? atlasRoute.params.stageId : undefined} term={baseRoute === 'atlas' ? atlasRoute.params.termId : undefined} query={baseRoute === 'atlas' ? atlasRoute.query : undefined} />
              </Suspense>
            </div>
          )}
        </main>
        {!['atlas', 'playground'].includes(baseRoute) && <SiteFooter />}
        {route.fragment === 'sponsor' && <Suspense fallback={null}><SponsorDialog open onClose={() => navigate(route.hash.replace(/#sponsor$/, ''))} /></Suspense>}
      </div>

      {overlayOpen && (
        <Suspense fallback={null}>
          <SiteDetail entryId={route.params.entryId} onClose={closeOverlay} />
        </Suspense>
      )}
    </div>
  )
}
