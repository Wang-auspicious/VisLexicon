import { useEffect, useState } from 'react'
import SubmitCheck from './SubmitCheck.jsx'

/* ============ 全站页脚（方案 §4.3 线框最后一行） ============
 * 口径说明 · 核验日志 · Agent 端点 · 查重框。
 * 三条链接都指向关于页的具体锚点，不指向不存在的页面。
 */

export default function SiteFooter() {
  const [items, setItems] = useState(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let alive = true
    fetch('/data/site-index.json')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('site-index 不可用'))))
      .then((data) => { if (alive) setItems(Array.isArray(data?.items) ? data.items : []) })
      .catch(() => { if (alive) setLoadError(true) })
    return () => { alive = false }
  }, [])

  return (
    <footer className="site-foot">
      <div className="site-foot-in">
        <nav className="site-foot-nav" aria-label="页脚导航">
          <a className="inline-link" href="#/about#counts">数字口径</a>
          <a className="inline-link" href="#/about#method">我们怎么核验</a>
          <a className="inline-link" href="#/about#endpoints">Agent 端点</a>
          <a className="inline-link" href="#/about#removed">我们删掉了什么</a>
        </nav>
        <SubmitCheck items={items} loadError={loadError} />
      </div>
    </footer>
  )
}
