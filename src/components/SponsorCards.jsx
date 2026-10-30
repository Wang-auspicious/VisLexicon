import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../i18n.js'
import { CONTACT_EMAIL, SPONSOR_AMOUNTS, SPONSOR_FAQ } from '../data/site-info.js'
import '../styles/sponsor.css'

/* 赞助卡片，嵌在列表里（对照 designeer.xyz：不单独成页，也不分包月档位）。
 * 有赞助者时轮流显示他们的卡片；没有时显示一张空位卡。
 * 点“成为赞助者”打开小窗（地址加 #sponsor，可分享），选金额后发邮件。
 * 赞助者名单在 public/sponsors.json。 */

let sponsorRequest = null
function loadSponsors() {
  sponsorRequest ??= fetch('/sponsors.json').then((r) => (r.ok ? r.json() : { sponsors: [] })).then((d) => (Array.isArray(d.sponsors) ? d.sponsors : [])).catch(() => [])
  return sponsorRequest
}
export function useSponsors() {
  const [sponsors, setSponsors] = useState([])
  useEffect(() => { let live = true; loadSponsors().then((list) => { if (live) setSponsors(list) }); return () => { live = false } }, [])
  return sponsors
}

/** 网格里的一格。`slot` 决定轮到哪位赞助者，同一页多格时各不相同。 */
export function SponsorTile({ slot = 0 }) {
  const en = useLocale() === 'en'
  const sponsors = useSponsors()
  const sponsor = sponsors.length ? sponsors[(slot + new Date().getDate()) % sponsors.length] : null
  if (sponsor) return (
    <article className="vl-sponsor-card">
      <p className="vl-sponsor-label">{en ? 'Sponsored' : '赞助'}</p>
      <div className="vl-sponsor-head">
        {sponsor.logo ? <img src={sponsor.logo} alt="" width="36" height="36" loading="lazy" /> : <span className="vl-sponsor-mark" aria-hidden="true">{sponsor.name?.[0]}</span>}
        <h3>{sponsor.name}</h3>
      </div>
      <p className="vl-sponsor-line">{en && sponsor.lineEn ? sponsor.lineEn : sponsor.line}</p>
      <a className="library-button" href={sponsor.url} target="_blank" rel="noopener sponsored">{en ? 'Visit site' : '访问网站'} ↗</a>
    </article>
  )
  return (
    <article className="vl-sponsor-card is-open">
      <p className="vl-sponsor-label">{en ? 'Open slot' : '空位'}</p>
      <div className="vl-sponsor-head"><span className="vl-sponsor-mark" aria-hidden="true">+</span><h3>{en ? 'Your product here' : '你的产品可以在这里'}</h3></div>
      <p className="vl-sponsor-line">{en ? 'Put your product in front of people who design and build for the web. One-time, from $10.' : '让做设计、写界面的人看到你的产品。一次性赞助，$10 起。'}</p>
      <a className="library-button" href="#sponsor">{en ? 'Become a sponsor' : '成为赞助者'}</a>
    </article>
  )
}

/** 小窗：选一个金额 → 打开邮件。没有包月、没有档位。 */
export function SponsorDialog({ open, onClose }) {
  const en = useLocale() === 'en'
  const ref = useRef(null)
  const sponsors = useSponsors()
  const [amount, setAmount] = useState(SPONSOR_AMOUNTS[1])
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])
  const subject = encodeURIComponent(`VisLexicon sponsorship: $${amount} one-time`)
  const body = encodeURIComponent(en
    ? `Product name:\nOne-line description:\nURL:\n(Attach a square logo)\n`
    : `产品名：\n一句话介绍：\n链接：\n（请附一个方形标志）\n`)
  return (
    <dialog ref={ref} className="vl-sponsor-dialog" aria-labelledby="sponsor-title" onClose={onClose} onClick={(event) => { if (event.target === ref.current) onClose() }}>
      <div className="vl-sponsor-dialog-in">
        <button className="vl-sponsor-close" type="button" onClick={onClose} aria-label={en ? 'Close' : '关闭'}>×</button>
        <p className="vl-sponsor-label">{en ? 'Sponsor' : '赞助'}</p>
        <h2 id="sponsor-title">{en ? 'Sponsor VisLexicon once' : '赞助一次视元'}</h2>
        <p className="vl-sponsor-line">{en ? 'No subscription. Pick an amount; your product appears as a card labelled Sponsored in the listings, rotating with other sponsors.' : '不是包月，赞助一次就好。选个金额，你的产品会以带“赞助”标签的卡片出现在列表里，和其他赞助者轮流展示。'}</p>
        <div className="vl-sponsor-amounts" role="radiogroup" aria-label={en ? 'Amount' : '金额'}>
          {SPONSOR_AMOUNTS.map((value) => (
            <button key={value} type="button" role="radio" aria-checked={amount === value} className={amount === value ? 'is-on' : ''} onClick={() => setAmount(value)}>${value}</button>
          ))}
        </div>
        <a className="library-button is-primary" href={`mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`}>{en ? `Sponsor $${amount} by email` : `发邮件赞助 $${amount}`}</a>
        <p className="vl-sponsor-note">{en ? 'We reply with payment details and put your card live after a quick check.' : '我们回信告诉你付款方式，简单核对后卡片上线。'} {CONTACT_EMAIL}</p>
        <dl className="vl-sponsor-faq">{SPONSOR_FAQ.map((item) => <div key={item.qZh}><dt>{en ? item.qEn : item.qZh}</dt><dd>{en ? item.aEn : item.aZh}</dd></div>)}</dl>
        {sponsors.length > 0 && <p className="vl-sponsor-note">{en ? 'Thank you to ' : '感谢赞助者：'}{sponsors.map((s) => s.name).join('、')}</p>}
      </div>
    </dialog>
  )
}
