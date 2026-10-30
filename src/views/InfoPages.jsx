import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../i18n.js'
import { loadPublicSiteCards } from '../lib/public-data.js'
import SubmitCheck from '../components/SubmitCheck.jsx'
import { CONTACT_EMAIL, LEGAL_PAGES, LEGAL_UPDATED, SUBMIT_KINDS } from '../data/site-info.js'
import '../styles/library-pages.css'
import '../styles/info-pages.css'

/* 投稿与法务页（2026-10-29 站长授权新增，对照 designeer.xyz 的同类页面）。
 * 赞助不单独成页：卡片嵌在列表里，见 components/SponsorCards.jsx。
 * 文字都在 src/data/site-info.js，静态页生成脚本读同一份。 */

function LegalFooter({ en }) {
  return <nav className="info-legal-nav" aria-label={en ? 'Legal' : '法务'}>
    {Object.entries(LEGAL_PAGES).map(([id, page]) => <a key={id} href={`#/${id}`}>{(en ? page.en : page.zh).title}</a>)}
    <a href="#sponsor">{en ? 'Sponsor' : '赞助'}</a>
    <a href="#/submit">{en ? 'Submit' : '投稿'}</a>
  </nav>
}

function LegalPage({ id, en }) {
  const page = en ? LEGAL_PAGES[id].en : LEGAL_PAGES[id].zh
  return <article className="library-page info-page">
    <header className="library-head about-head">
      <div><p className="library-eyebrow">VISLEXICON</p><h1>{page.title}</h1></div>
      <div className="about-intro"><p>{page.intro}</p><p className="library-note">{en ? 'Last updated' : '更新于'} {LEGAL_UPDATED}</p></div>
    </header>
    {page.sections.map((section) => <section className="about-section" key={section.h}>
      <h2>{section.h}</h2>
      <div className="info-prose">{section.p.map((text) => <p key={text}>{text}</p>)}</div>
    </section>)}
    <LegalFooter en={en} />
  </article>
}

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || ''

function useTurnstile(container) {
  const [token, setToken] = useState('')
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !container.current) return
    let widget
    const render = () => { widget = window.turnstile?.render(container.current, { sitekey: TURNSTILE_SITE_KEY, callback: setToken, 'expired-callback': () => setToken('') }) }
    if (window.turnstile) render()
    else {
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.onload = render
      document.head.append(script)
    }
    return () => { if (widget !== undefined) window.turnstile?.remove(widget) }
  }, [container])
  return token
}

function SubmitPage({ en }) {
  const [items, setItems] = useState(null)
  const [loadError, setLoadError] = useState(false)
  const [state, setState] = useState({ status: 'idle', message: '' })
  const captcha = useRef(null)
  const token = useTurnstile(captcha)
  useEffect(() => { let live = true; loadPublicSiteCards().then((d) => { if (live) setItems(d.items || []) }).catch(() => { if (live) setLoadError(true) }); return () => { live = false } }, [])
  const onSubmit = async (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const body = Object.fromEntries(form.entries())
    if (TURNSTILE_SITE_KEY && !token) { setState({ status: 'error', message: en ? 'Please complete the check above the button.' : '请先完成按钮上方的人机验证。' }); return }
    setState({ status: 'sending', message: '' })
    try {
      const response = await fetch('/api/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, turnstileToken: token }) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'SUBMIT_UNAVAILABLE')
      event.target.reset()
      setState({ status: 'done', message: en ? 'Thanks. Every submission is reviewed by hand; if you left an email we will write when it is decided.' : '收到了，谢谢。每条投稿都会人工审核；留了邮箱的话，有结果会写信告诉你。' })
    } catch (error) {
      const fallback = en ? `The form could not be sent right now. You can email the link to ${CONTACT_EMAIL}.` : `表单暂时发不出去，可以把链接发到 ${CONTACT_EMAIL}。`
      setState({ status: 'error', message: error.message === 'INVALID_URL' ? (en ? 'Please enter a full web address starting with https://.' : '请填写以 https:// 开头的完整网址。') : error.message === 'SUBMIT_RATE_LIMITED' ? (en ? 'Too many submissions from here today. Please try tomorrow.' : '今天从这里提交的次数太多了，请明天再试。') : fallback })
    }
  }
  return <article className="library-page info-page">
    <header className="library-head about-head">
      <div><p className="library-eyebrow">{en ? 'SUBMIT' : '投稿'}</p><h1>{en ? 'Suggest a site\nworth keeping.' : '推荐一个\n值得收录的网站。'}</h1></div>
      <div className="about-intro"><p>{en ? 'Websites, component libraries, tools, assets or resources. Submitting is free and needs no account. Every submission is reviewed against the editorial standards; not every one is accepted.' : '网站、组件库、工具、素材或资源都可以。投稿免费，不用注册。每条都按收录标准人工审核，不保证一定收录。'}</p></div>
    </header>
    <section className="about-section">
      <div><h2>{en ? 'Check first' : '先查一下'}</h2><p className="library-note">{en ? 'It may already be listed.' : '它可能已经收录了。'}</p></div>
      <SubmitCheck items={items} loadError={loadError} />
    </section>
    <section className="about-section">
      <h2>{en ? 'Submit' : '提交'}</h2>
      <form className="info-form" onSubmit={onSubmit}>
        <label><span>{en ? 'Web address' : '网址'} *</span><input name="url" type="url" required placeholder="https://" maxLength={500} /></label>
        <label><span>{en ? 'Type' : '类型'}</span><select name="kind" defaultValue="site">{SUBMIT_KINDS.map((k) => <option key={k.id} value={k.id}>{en ? k.en : k.zh}</option>)}</select></label>
        <label><span>{en ? 'Why it is worth listing' : '推荐理由'}</span><textarea name="note" rows={4} maxLength={1000} placeholder={en ? 'What stands out: a technique, a component, a style…' : '它哪里好：某个做法、某个组件、某种风格……'} /></label>
        <div className="info-form-row">
          <label><span>{en ? 'Your name' : '你的称呼'}</span><input name="name" maxLength={80} /></label>
          <label><span>{en ? 'Email (optional, for the result)' : '邮箱（可不填，用来告诉你结果）'}</span><input name="email" type="email" maxLength={200} /></label>
        </div>
        <label className="info-honeypot" aria-hidden="true"><span>Leave empty</span><input name="website" tabIndex={-1} autoComplete="off" /></label>
        {TURNSTILE_SITE_KEY && <div ref={captcha} />}
        <div className="info-form-actions">
          <button className="library-button is-primary" type="submit" disabled={state.status === 'sending'}>{state.status === 'sending' ? (en ? 'Sending…' : '提交中…') : (en ? 'Submit' : '提交')}</button>
          <p className="library-note">{en ? 'By submitting you agree to the ' : '提交即表示同意'}<a className="inline-link" href="#/terms">{en ? 'terms' : '使用条款'}</a>{en ? ' and ' : '和'}<a className="inline-link" href="#/privacy">{en ? 'privacy policy' : '隐私说明'}</a>{en ? '.' : '。'}</p>
        </div>
        {state.message && <p className={`info-form-status is-${state.status}`} role="status">{state.message}</p>}
      </form>
    </section>
    <LegalFooter en={en} />
  </article>
}

export default function InfoPages({ name }) {
  const en = useLocale() === 'en'
  if (name === 'submit') return <SubmitPage en={en} />
  return <LegalPage id={name} en={en} />
}
