import { factFieldLabel, isHttpUrl, isUnknown, UNKNOWN_ZH } from '../lib/site-detail-labels.js'

/**
 * 档案区的一条事实：字段 / 值 / 来源 ↗（L5）/ 原句证据。
 * 规则：值为空 → 整行不渲染；值为 unknown → 显示「未知」并保留来源链接，不隐藏该行。
 */
export default function FactRow({ fact }) {
  const value = typeof fact?.value === 'string' ? fact.value.trim() : ''
  if (!value) return null

  const unknown = isUnknown(value)
  const confidence = typeof fact.confidence === 'number' ? fact.confidence : null

  return (
    <div className="sd-fact">
      <dt className="sd-fact-field">{factFieldLabel(fact.field)}</dt>
      <dd className="sd-fact-body">
        <p className="sd-fact-line">
          {unknown ? (
            <span className="sd-unknown">{UNKNOWN_ZH}</span>
          ) : isHttpUrl(value) ? (
            <a className="sd-fact-value" href={value} target="_blank" rel="noopener noreferrer">
              {value.replace(/^https?:\/\/(www\.)?/, '')} <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <span className="sd-fact-value">{value}</span>
          )}
          {fact.sourceUrl ? (
            <a
              className="sd-src"
              href={fact.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`在新标签打开「${factFieldLabel(fact.field)}」这条事实的来源`}
            >
              来源 <span aria-hidden="true">↗</span>
            </a>
          ) : null}
          {confidence !== null && confidence < 1 ? (
            <span className="sd-conf">置信度 {confidence}</span>
          ) : null}
        </p>
        {fact.evidence ? <p className="sd-fact-evidence">{fact.evidence}</p> : null}
      </dd>
    </div>
  )
}
