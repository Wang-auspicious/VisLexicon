import DomainMark from './DomainMark.jsx'
import { pageRoleLabel } from '../lib/site-detail-labels.js'

/**
 * 三张证据图（方案 §4.6 第 ② 段）。
 * 主角是 selectionRationale——「为什么选这一页」，不是图本身。
 * 每张图各有自己的 sourceUrl（L4），三条链接不共用一个地址。
 */

/* shot.alt 缺失时按 role 生成，避免三张图拿到同一个 alt（方案 §7.4 第 7 条）。 */
function altFor(page, name) {
  if (page?.shot?.alt) return page.shot.alt
  return `${name} 的${pageRoleLabel(page?.role)}页截图`
}

function EvidenceCard({ page, name, homepage }) {
  const shot = page?.shot
  const roleLabel = pageRoleLabel(page?.role)
  return (
    <figure className="sd-ev">
      <span className="sd-ev-role">{roleLabel}</span>
      <div className="sd-ev-frame">
        {shot?.src ? (
          <img
            src={shot.src}
            alt={altFor(page, name)}
            width={shot.width || undefined}
            height={shot.height || undefined}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="sd-ev-empty">
            <DomainMark url={page?.sourceUrl || homepage} name={name} />
            <span>该页面暂无法直接预览</span>
          </div>
        )}
      </div>
      <figcaption className="sd-ev-why">{page?.selectionRationale}</figcaption>
      {page?.sourceUrl ? (
        <a
          className="sd-ev-link"
          href={page.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`在新标签打开 ${name} 的${roleLabel}页原页`}
        >
          看原页 <span aria-hidden="true">↗</span>
        </a>
      ) : null}
    </figure>
  )
}

export default function EvidenceTrio({ pages, name, homepage }) {
  const list = (pages ?? []).filter(Boolean)
  if (list.length === 0) {
    return <p className="sd-empty-note">这条记录没有登记证据页。</p>
  }
  return (
    <div className="sd-ev-row">
      {list.map((page) => (
        <EvidenceCard
          key={page.sourceUrl || page.role}
          page={page}
          name={name}
          homepage={homepage}
        />
      ))}
    </div>
  )
}
