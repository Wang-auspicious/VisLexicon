import { Suspense, lazy, useEffect, useState } from 'react'
import { useRoute } from './router.js'
import { loadStored } from './store.js'
import GlobalSearch from './components/GlobalSearch.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import SiteFooter from './components/SiteFooter.jsx'
import About from './views/About.jsx'

/* 视图按路由分包：图鉴要载 1MB 语料，策展要载站点索引，
 * 谁也不该出现在别人的首屏包里。 */
const Curation = lazy(() => import('./views/Curation.jsx'))
const AllSites = lazy(() => import('./views/AllSites.jsx'))
const SiteDetail = lazy(() => import('./views/SiteDetail.jsx'))
const AtlasIndex = lazy(() => import('./views/AtlasIndex.jsx'))
const AtlasStage = lazy(() => import('./views/AtlasStage.jsx'))

loadStored()

/* 三个频道。旧版是四个（策展 / 图鉴 / 工具 / 提交）：
 * 工具降级成关于页里的一个演示，提交降级成页脚一个框（方案 §2.1）。 */
const CHANNELS = [
  { hash: '#/', labelZh: '策展', match: (name) => name === 'curation' || name === 'sites' || name === 'site' },
  { hash: '#/atlas', labelZh: '图鉴', match: (name) => name === 'atlas' },
  { hash: '#/about', labelZh: '关于', match: (name) => name === 'about' },
]

function NotFound({ hash }) {
  return (
    <section className="notfound">
      <p className="x-mono">404</p>
      <h1>这个地址上没有东西</h1>
      <p>
        <span className="x-mono">{hash}</span> 不是本站的路径。
        旧版的工具页、提交页与 62 条旧词典（<span className="x-mono">#/entry/…</span>、
        <span className="x-mono">#/key</span>、<span className="x-mono">#/compare</span>、
        <span className="x-mono">#/matrix</span>）已经删除，不是暂时打不开。
        为什么删、删掉的东西去了哪里，写在关于页。
      </p>
      <nav className="notfound-links" aria-label="回到主要频道">
        <a className="btn-primary" href="#/">回策展首页</a>
        <a className="btn-ghost" href="#/atlas">去图鉴</a>
        <a className="btn-ghost" href="#/about">看关于页</a>
      </nav>
    </section>
  )
}

function RouteFallback() {
  return <p className="route-loading" role="status">加载中…</p>
}

export default function App() {
  const route = useRoute()
  const [menuOpen, setMenuOpen] = useState(false)

  /* 站点详情是叠层：底下继续渲染点进来的那个列表路由。
   * 「从哪来」写在 history.state.from 上（波次 3 接口文档），
   * 深链直接打开时没有这个字段 → 底层落到策展首页。 */
  const overlayOpen = route.name === 'site'
  const cameFrom = overlayOpen && typeof window !== 'undefined'
    ? String(window.history.state?.from ?? '')
    : ''
  const baseRoute = overlayOpen
    ? (cameFrom.startsWith('#/sites') ? 'sites' : 'curation')
    : route.name

  /* 汉堡展开时锁背景；路由一变就收起。 */
  useEffect(() => { setMenuOpen(false) }, [route.hash])

  useEffect(() => {
    if (!menuOpen) return undefined
    const onKey = (event) => { if (event.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  /* 换页回到顶部；带锚点（如 `#/about#submit`）则滚到那一节。
   * 叠层开合不动滚动位置——关掉浮窗要回到列表原来的地方。 */
  useEffect(() => {
    if (overlayOpen) return
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
    else window.location.hash = '#/'
  }

  const backgroundLocked = menuOpen || overlayOpen

  return (
    <div className="site" data-view={baseRoute}>
      <a className="skip-link" href="#main-content">跳到主要内容</a>

      <nav className="nav" aria-label="全站导航" inert={overlayOpen}>
        <div className="nav-left">
          <a className="nav-brand" href="#/" aria-label="VisLexicon 首页">VisLexicon</a>
          <div className="nav-links">
            {CHANNELS.map((channel) => {
              const active = channel.match(route.name)
              return (
                <a
                  key={channel.hash}
                  className={`nav-link ${active ? 'on' : ''}`}
                  href={channel.hash}
                  aria-current={active ? 'page' : undefined}
                >
                  {channel.labelZh}
                </a>
              )
            })}
          </div>
        </div>

        <div className="nav-right">
          <GlobalSearch />
          <ThemeToggle />
          <button
            type="button"
            className={`nav-hamburger ${menuOpen ? 'open' : ''}`}
            aria-label={menuOpen ? '关闭导航菜单' : '打开导航菜单'}
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
              >
                {channel.labelZh}
              </a>
            )
          })}
        </div>
      </nav>

      <div className="site-body" inert={backgroundLocked}>
        <main id="main-content" className="route" tabIndex="-1">
          <Suspense fallback={<RouteFallback />}>
            {baseRoute === 'curation' && <Curation />}
            {baseRoute === 'sites' && <AllSites />}
            {baseRoute === 'atlas' && (route.params.stageId
              ? <AtlasStage stageId={route.params.stageId} termId={route.params.termId} />
              : <AtlasIndex />)}
            {baseRoute === 'about' && <About />}
            {baseRoute === 'notfound' && <NotFound hash={route.hash} />}
          </Suspense>
        </main>
        <SiteFooter />
      </div>

      {overlayOpen && (
        <Suspense fallback={null}>
          <SiteDetail entryId={route.params.entryId} onClose={closeOverlay} />
        </Suspense>
      )}
    </div>
  )
}
