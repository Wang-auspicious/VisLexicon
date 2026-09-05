import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const router = readFileSync(new URL('../src/router.js', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/App.css', import.meta.url), 'utf8')
const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const indexView = readFileSync(new URL('../src/views/IndexView.jsx', import.meta.url), 'utf8')
const entry = readFileSync(new URL('../src/views/Entry.jsx', import.meta.url), 'utf8')
const compare = readFileSync(new URL('../src/views/Compare.jsx', import.meta.url), 'utf8')
const submit = readFileSync(new URL('../src/views/Submit.jsx', import.meta.url), 'utf8')

test('the empty route opens curation', () => {
  assert.match(router, /seg \|\| 'index'/)
  assert.doesNotMatch(app, /loadTheme\(\)/)
})

test('dictionary navigation remains explicit after curation becomes the default', () => {
  assert.match(app, /to:\s*'atlas',\s*label:\s*'图鉴'/)
  for (const source of [entry, compare, submit]) assert.doesNotMatch(source, /go\(''\)/)
})

test('the old lexicon hash still lands on the atlas instead of falling through to curation', () => {
  assert.match(app, /route\.view === 'atlas' \|\| route\.view === 'lexicon'/)
  assert.match(app, /<Atlas stage=\{route\.a\} term=\{route\.b\} \/>/)
})

test('the shell mirrors the measured Oreo desktop header', () => {
  assert.match(app, /<nav className="nav" aria-label="全站导航">[\s\S]*?<div className="nav-left">[\s\S]*?<a[\s\S]*?className="nav-brand"[\s\S]*?>VisLexicon<\/a>[\s\S]*?<div className="nav-links"[\s\S]*?>[\s\S]*?<\/div>[\s\S]*?<\/div>/)
  assert.doesNotMatch(app, /className="nav-right"/)
  assert.doesNotMatch(app, /className="nav-(?:cmdk|theme|spec)"/)
  assert.match(app, /const active = n\.match\(route\.view\)/)
  assert.doesNotMatch(app, /route\.view !== 'index' && n\.match/)

  assert.match(css, /@font-face\s*{[\s\S]*?font-family:\s*'Inter Variable'[\s\S]*?url\('\/fonts\/inter-variable-latin\.woff2'\)[\s\S]*?font-weight:\s*100 900/)
  assert.match(css, /--shell-header-height:\s*80px/)
  assert.match(css, /--shell-gutter:\s*36px/)
  assert.match(css, /\.nav\s*{[\s\S]*?position:\s*fixed[\s\S]*?left:\s*0;\s*right:\s*0[\s\S]*?width:\s*auto[\s\S]*?height:\s*var\(--shell-header-height\)[\s\S]*?padding:\s*0 var\(--shell-gutter\)[\s\S]*?justify-content:\s*space-between[\s\S]*?background:\s*#f9f9f8d9[\s\S]*?z-index:\s*100[\s\S]*?-webkit-backdrop-filter:\s*blur\(16px\)[\s\S]*?font-family:\s*'Inter Variable',\s*system-ui,\s*-apple-system,\s*sans-serif/)
  assert.match(css, /\.nav-left\s*{[\s\S]*?gap:\s*48px;\s*flex-shrink:\s*0/)
  assert.match(css, /\.nav-brand\s*{[\s\S]*?width:\s*95\.328px[\s\S]*?font-size:\s*16px[\s\S]*?line-height:\s*20px[\s\S]*?font-weight:\s*600/)
  assert.match(css, /\.nav-links\s*{[\s\S]*?gap:\s*36px/)
  assert.match(css, /\.nav-link\s*{[\s\S]*?font-size:\s*14px[\s\S]*?line-height:\s*18px[\s\S]*?font-weight:\s*400[\s\S]*?opacity:\s*\.4/)
  assert.match(css, /\.nav-link:nth-child\(1\)\s*{\s*width:\s*44\.0234px/)
  assert.match(css, /\.nav-link:nth-child\(2\)\s*{\s*width:\s*75\.9531px/)
  assert.match(css, /\.nav-link:nth-child\(3\)\s*{\s*width:\s*35\.8203px/)
  assert.match(css, /\.nav-link:nth-child\(4\)\s*{\s*width:\s*39\.4844px/)
  assert.match(css, /\.nav-link:hover\s*{[\s\S]*?opacity:\s*\.7 !important/)
  assert.match(css, /\.nav-link\.on\s*{[\s\S]*?font-weight:\s*600[\s\S]*?opacity:\s*1/)
  assert.match(css, /@media \(max-width:\s*1024px\)\s*{[\s\S]*?--shell-gutter:\s*24px/)
  assert.match(css, /@media \(max-width:\s*1024px\)\s*{[\s\S]*?\.nav-left\s*{\s*gap:\s*32px[\s\S]*?\.nav-links\s*{\s*gap:\s*24px/)
  assert.doesNotMatch(css, /nav-fade-down/)
  assert.match(css, /\.route\s*{[\s\S]*?padding-top:\s*80px/)
  assert.doesNotMatch(css, /\.nav\s*{[^}]*[^-]backdrop-filter:/s)
})

test('the shell exposes the measured Oreo mobile menu', () => {
  assert.match(app, /const \[mobileMenuOpen, setMobileMenuOpen\] = useState\(false\)/)
  assert.match(app, /className={`nav-hamburger \$\{mobileMenuOpen \? 'open' : ''\}`}/)
  assert.match(app, /aria-expanded={mobileMenuOpen}/)
  assert.match(app, /className="mobile-menu"/)
  assert.match(app, /setMobileMenuOpen\(false\)/)

  assert.match(css, /@media \(max-width:\s*768px\)\s*{[\s\S]*?--shell-header-height:\s*60px[\s\S]*?--shell-gutter:\s*20px/)
  assert.match(css, /@media \(max-width:\s*768px\)\s*{[\s\S]*?\.nav-links\s*{\s*display:\s*none/)
  assert.match(css, /\.nav-hamburger\s*{[\s\S]*?display:\s*none/)
  assert.match(css, /@media \(max-width:\s*768px\)\s*{[\s\S]*?\.nav-hamburger\s*{[\s\S]*?display:\s*flex[\s\S]*?width:\s*36px[\s\S]*?height:\s*24px[\s\S]*?padding:\s*8px[\s\S]*?gap:\s*5px/)
  assert.match(css, /\.nav-hamburger span\s*{[\s\S]*?width:\s*20px[\s\S]*?height:\s*1\.5px[\s\S]*?transition:\s*transform \.25s,\s*opacity \.25s/)
  assert.match(css, /\.nav-hamburger\.open span:first-child\s*{\s*transform:\s*rotate\(45deg\) translate\(2px,\s*2px\)/)
  assert.match(css, /\.mobile-menu\s*{[\s\S]*?position:\s*absolute[\s\S]*?top:\s*60px[\s\S]*?left:\s*0;\s*right:\s*0[\s\S]*?background:\s*#f9f9f8f7[\s\S]*?border-bottom:\s*1px solid #00000014[\s\S]*?-webkit-backdrop-filter:\s*blur\(16px\)[\s\S]*?padding:\s*12px 20px 20px/)
  assert.match(css, /\.mobile-nav-link\s*{[\s\S]*?width:\s*100%[\s\S]*?padding:\s*12px 0[\s\S]*?font-size:\s*15px[\s\S]*?line-height:\s*20px[\s\S]*?font-weight:\s*400/)
  assert.match(css, /\.mobile-nav-link\s*{[\s\S]*?border-bottom:\s*1px solid #0000000f[\s\S]*?opacity:\s*1/)
  assert.match(css, /\.mobile-nav-link:last-child\s*{\s*border-bottom:\s*0/)
  assert.doesNotMatch(css, /\.mobile-nav-link\.on\s*{/)
  assert.match(css, /@media \(max-width:\s*768px\)\s*{[\s\S]*?\.route\s*{[\s\S]*?padding-top:\s*60px/)
})

test('the curation surface materializes the measured Oreo geometry', () => {
  assert.match(css, /--oreo-page:\s*#f9f9f8/)
  assert.match(css, /--oreo-board-radius:\s*32px/)
  assert.match(css, /--oreo-card-radius:\s*24px/)
  assert.match(css, /--oreo-column-gap:\s*9px/)
  assert.match(css, /--oreo-row-gap:\s*8px/)

  assert.match(
    indexView,
    /<div className="oreo-curation-shell">[\s\S]*?<header className="oreo-frame-header">[\s\S]*?<\/header>[\s\S]*?<section className="oreo-board-frame" aria-label="已核验站点">/,
  )
  assert.doesNotMatch(indexView, /<main\b/)
  assert.match(
    css,
    /CURATION PRODUCTION SURFACE[\s\S]*?\.oreo-curation-shell\s*{[\s\S]*?padding:\s*72px 20px 96px/,
  )
  assert.match(
    css,
    /CURATION PRODUCTION SURFACE[\s\S]*?\.oreo-board-frame\s*{[\s\S]*?width:\s*min\(1174px,\s*100%\)[\s\S]*?padding:\s*8px[\s\S]*?border-radius:\s*var\(--oreo-board-radius\)/,
  )
  assert.match(
    css,
    /CURATION PRODUCTION SURFACE[\s\S]*?\.oreo-cards-grid\s*{[\s\S]*?grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*380px\)\)[\s\S]*?gap:\s*var\(--oreo-row-gap\) var\(--oreo-column-gap\)/,
  )
  assert.match(
    css,
    /CURATION PRODUCTION SURFACE[\s\S]*?\.oreo-specimen-card\s*{[\s\S]*?height:\s*330px[\s\S]*?background:\s*var\(--oreo-page\)[\s\S]*?border:\s*1px solid #e4e4e4/,
  )
  assert.match(
    css,
    /CURATION PRODUCTION SURFACE[\s\S]*?\.oreo-trio-stage\s*{[\s\S]*?mask-image:\s*none[\s\S]*?-webkit-mask-image:\s*none/,
  )
  assert.match(
    css,
    /CURATION PRODUCTION SURFACE[\s\S]*?\.sr-only\s*{[\s\S]*?position:\s*absolute[\s\S]*?width:\s*1px[\s\S]*?clip:\s*rect\(0,\s*0,\s*0,\s*0\)/,
  )
  assert.match(
    css,
    /CURATION PRODUCTION SURFACE[\s\S]*?\.oreo-category-pills\s*{[\s\S]*?flex-wrap:\s*nowrap[\s\S]*?overflow-x:\s*auto/,
  )
  assert.match(
    css,
    /CURATION PRODUCTION SURFACE[\s\S]*?\.oreo-category-pills\s*{[\s\S]*?mask-image:\s*linear-gradient/,
  )
  assert.match(css, /html\s*{\s*overflow-x:\s*clip/)
  assert.match(
    css,
    /CURATION PRODUCTION SURFACE[\s\S]*?\.oreo-instance-counter\s*{[\s\S]*?color:\s*#64645f[\s\S]*?font-size:\s*10\.5px/,
  )
  assert.match(
    css,
    /CURATION PRODUCTION SURFACE[\s\S]*?\.oreo-stack-pill\s*{[\s\S]*?font-size:\s*10\.5px/,
  )
  assert.match(
    css,
    /CURATION PRODUCTION SURFACE[\s\S]*?\.oreo-green-theme-pill\s*{[\s\S]*?font-size:\s*10px/,
  )
  assert.match(
    css,
    /CURATION PRODUCTION SURFACE[\s\S]*?\.oreo-filter-label\s*{[\s\S]*?color:\s*#6f6f69[\s\S]*?font-size:\s*10px/,
  )
  assert.match(
    css,
    /CURATION PRODUCTION SURFACE[\s\S]*?\.oreo-kicker\s*{[\s\S]*?color:\s*#64645f[\s\S]*?\.oreo-count-badge\s*{[\s\S]*?color:\s*#64645f/,
  )
  assert.match(
    css,
    /CURATION PRODUCTION SURFACE[\s\S]*?\.oreo-cat-item\s*{[\s\S]*?color:\s*#696963/,
  )
  assert.match(
    css,
    /\.oreo-stack-filter select:focus-visible[\s\S]*?\.catalog-category select:focus-visible[\s\S]*?outline:\s*2px solid #111/,
  )
  assert.match(css, /\.oreo-search-field input::placeholder\s*{\s*color:\s*#6f6f69/)
  assert.match(css, /\.catalog-search input::placeholder\s*{\s*color:\s*#6f6f69/)
  assert.match(
    css,
    /\.oreo-specimen-card:focus-visible \.oreo-marquee-track\s*{\s*animation-play-state:\s*paused/,
  )
  assert.match(
    css,
    /@media \(max-width:\s*600px\)\s*{[\s\S]*?\.site\[data-view='index'\] \.oreo-curation-shell\s*{\s*padding:\s*32px 14px 56px[\s\S]*?\.site\[data-view='index'\] \.oreo-cat-item\s*{\s*height:\s*44px/,
  )
  assert.match(
    css,
    /@media \(max-width:\s*360px\)\s*{[\s\S]*?\.site\[data-view='index'\] \.oreo-row1-right\s*{[\s\S]*?max-width:\s*62%[\s\S]*?\.oreo-instance-counter\s*{[\s\S]*?font-size:\s*9\.5px[\s\S]*?\.oreo-free-chip\s*{[\s\S]*?font-size:\s*9px/,
  )
  assert.match(css, /\.oreo-trio-stage::after\s*{[\s\S]*?width:\s*149px/)
  assert.match(css, /\.oreo-trio-stage::before\s*{[\s\S]*?height:\s*171px/)
})
