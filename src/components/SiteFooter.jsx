import { useEffect, useState } from 'react'
import SubmitCheck from './SubmitCheck.jsx'
import { useLocale } from '../i18n.js'
import { loadPublicSiteCards } from '../lib/public-data.js'
import { CONTACT_EMAIL, LEGAL_PAGES } from '../data/site-info.js'

/* ============ 全站页脚（方案 §4.3 线框最后一行） ============
 * 口径说明 · 核验日志 · Agent 端点 · 查重框。
 * 三条链接都指向关于页的具体锚点，不指向不存在的页面。
 */

export default function SiteFooter() {
  const en = useLocale() === 'en'
  const [items, setItems] = useState(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let alive = true
    loadPublicSiteCards()
      .then((data) => { if (alive) setItems(Array.isArray(data?.items) ? data.items : []) })
      .catch(() => { if (alive) setLoadError(true) })
    return () => { alive = false }
  }, [])

  return (
    <footer className="site-foot">
      <div className="site-foot-in">
        <nav className="site-foot-nav" aria-label={en ? 'Footer navigation' : '页脚导航'}>
          <a className="inline-link" href="#/about#counts">{en ? 'About the library' : '关于内容库'}</a>
          <a className="inline-link" href="#/about#method">{en ? 'Editorial standards' : '收录标准'}</a>
          <a className="inline-link" href="#/about#endpoints">{en ? 'For agents' : 'Agent 接口'}</a>
          <a className="inline-link" href="#/components">{en ? 'All components' : '全部组件'}</a>
          <a className="inline-link" href="#/submit">{en ? 'Submit a site' : '投稿'}</a>
          <a className="inline-link" href="#sponsor">{en ? 'Sponsor' : '赞助'}</a>
        </nav>
        <nav className="site-foot-nav site-foot-legal" aria-label={en ? 'Legal' : '法务'}>
          {Object.entries(LEGAL_PAGES).map(([id, page]) => <a className="inline-link" key={id} href={`#/${id}`}>{(en ? page.en : page.zh).title}</a>)}
          <a className="inline-link" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </nav>
        <SubmitCheck items={items} loadError={loadError} />
      </div>
    </footer>
  )
}
