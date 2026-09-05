import { useEffect, useState } from 'react'
import './App.css'
import { useRoute } from './router.js'
import { loadStored } from './store.js'
import Palette from './Palette.jsx'
import SpecPanel from './SpecPanel.jsx'
import Atlas from './views/Atlas.jsx'
import Entry from './views/Entry.jsx'
import IndexView from './views/IndexView.jsx'
import Tools from './views/Tools.jsx'
import Submit from './views/Submit.jsx'
import KeyView from './views/KeyView.jsx'
import Compare from './views/Compare.jsx'
import Variants from './views/Variants.jsx'

loadStored()

/* 顶层导航四个词：名站策展、视觉图鉴、专业工具、社区提交 */
const NAV = [
  { to: 'index', label: '策展', match: (v) => v === 'index' },
  { to: 'atlas', label: '图鉴', match: (v) => ['atlas', 'lexicon', 'entry', 'key', 'compare', 'matrix'].includes(v) },
  { to: 'tools', label: '工具', match: (v) => v === 'tools' },
  { to: 'submit', label: '提交', match: (v) => v === 'submit' },
]

export default function App() {
  const route = useRoute()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [specOpen, setSpecOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
      if (e.key === 'Escape') {
        setPaletteOpen(false)
        setMobileMenuOpen(false)
      }
      if (e.key === '?' && !paletteOpen) { setPaletteOpen(true) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [paletteOpen])

  useEffect(() => {
    const onRouteChange = () => setMobileMenuOpen(false)
    window.addEventListener('hashchange', onRouteChange)
    return () => window.removeEventListener('hashchange', onRouteChange)
  }, [])

  /* 图鉴内部自己管舞台与术语切换：整段路由都算同一个挂载，
   * 否则每点一条术语就重挂一次，参数微调全被重置。 */
  const routeKey = route.view === 'atlas' || route.view === 'lexicon'
    ? 'atlas'
    : `${route.view}:${route.id || ''}:${route.a || ''}:${route.b || ''}`

  return (
    <div className="site" data-view={route.view}>
      <a className="skip-link" href="#main-content">跳到主要内容</a>
      <div className="grain" aria-hidden="true" />

      <nav className="nav" aria-label="全站导航">
        <div className="nav-left">
          <a
            className="nav-brand"
            href="#/index"
            aria-label="VisLexicon 视元"
            onClick={() => setMobileMenuOpen(false)}
          >VisLexicon</a>

          <div className="nav-links" aria-label="主频道">
            {NAV.map((n) => {
              const active = n.match(route.view)
              return (
                <a
                  key={n.to}
                  className={`nav-link ${active ? 'on' : ''}`}
                  href={`#/${n.to}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {n.label}
                </a>
              )
            })}
          </div>
        </div>

        <button
          type="button"
          className={`nav-hamburger ${mobileMenuOpen ? 'open' : ''}`}
          aria-label={mobileMenuOpen ? '关闭导航菜单' : '打开导航菜单'}
          aria-controls="mobile-menu"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>

        {mobileMenuOpen && (
          <div id="mobile-menu" className="mobile-menu" aria-label="移动端主频道">
            {NAV.map((n) => {
              const active = n.match(route.view)
              return (
                <a
                  key={n.to}
                  className={`mobile-nav-link ${active ? 'on' : ''}`}
                  href={`#/${n.to}`}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {n.label}
                </a>
              )
            })}
          </div>
        )}
      </nav>

      <main id="main-content" className="route" key={routeKey} tabIndex="-1">
        {(route.view === 'atlas' || route.view === 'lexicon') && <Atlas stage={route.a} term={route.b} />}
        {route.view === 'entry' && <Entry id={route.id} />}
        {route.view === 'index' && <IndexView />}
        {route.view === 'tools' && <Tools />}
        {route.view === 'submit' && <Submit />}
        {route.view === 'key' && <KeyView />}
        {route.view === 'compare' && <Compare a={route.a} b={route.b} />}
        {route.view === 'matrix' && <Variants fam={route.id} self={route.b} />}
        {!['atlas', 'lexicon', 'entry', 'index', 'tools', 'submit', 'key', 'compare', 'matrix'].includes(route.view) && (
          <IndexView />
        )}
      </main>

      <Palette open={paletteOpen} onClose={() => setPaletteOpen(false)} onOpenSpec={() => { setPaletteOpen(false); setSpecOpen(true) }} />
      <SpecPanel open={specOpen} onClose={() => setSpecOpen(false)} />
    </div>
  )
}
