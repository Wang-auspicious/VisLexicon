/* 站点卡片三图预览：1 大 2 小三联实物视窗；无截图时用域名首字母占位。 */
export function ShotTrio({ shots, name, url }) {
  const usable = (shots ?? []).filter((shot) => shot?.src)
  if (usable.length === 0) {
    let initial = '?'
    try {
      initial = new URL(url).hostname.replace(/^www\./, '').charAt(0).toUpperCase()
    } catch { /* keep fallback */ }
    return (
      <div className="site-trio site-trio-empty" aria-hidden="true">
        <span>{initial}</span>
      </div>
    )
  }
  return (
    <div className="site-trio" aria-hidden="true">
      <div className="site-trio-main">
        <img
          src={usable[0].src}
          alt=""
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="site-trio-subs">
        {usable.slice(1, 3).map((shot) => (
          <div className="site-trio-sub" key={shot.src}>
            <img src={shot.src} alt="" loading="lazy" decoding="async" />
          </div>
        ))}
      </div>
    </div>
  )
}
