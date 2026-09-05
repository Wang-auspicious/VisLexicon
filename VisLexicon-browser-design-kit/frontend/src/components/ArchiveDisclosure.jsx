import { useCallback, useEffect, useState } from 'react'
import FactRow from './FactRow.jsx'
import {
  FACET_AXIS_LABELS,
  facetLabel,
  isoDate,
} from '../lib/site-detail-labels.js'

/**
 * 折叠档案区（方案 §4.6 第 ⑤ 段）。
 * 判断在前、字段在后：页面上半部分是编辑判断与证据，字段全部收在这里。
 * **标签只活在这里**——切面值不出现在详情页的任何其它位置。
 *
 * 折叠时子树整体不渲染（不是 display:none），所以关闭状态下浮窗里的
 * 焦点陷阱不会把 Tab 送进看不见的链接（方案 §7.4 第 2 条）。
 */

function absoluteUrl(path) {
  try {
    return new URL(path, window.location.origin).href
  } catch {
    return path
  }
}

function AgentContextButton({ name, designMdUrl, registryUrl, designMd }) {
  const [status, setStatus] = useState(null)

  const copy = useCallback(async () => {
    const lines = [
      `VisLexicon · ${name}`,
      designMdUrl ? `DESIGN.md: ${absoluteUrl(designMdUrl)}` : null,
      registryUrl ? `Registry JSON: ${absoluteUrl(registryUrl)}` : null,
    ].filter(Boolean)
    const body = designMd ? `${lines.join('\n')}\n\n${designMd}` : lines.join('\n')
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard unavailable')
      await navigator.clipboard.writeText(body)
      setStatus(
        designMd
          ? '已复制：两个链接 + DESIGN.md 正文'
          : '已复制两个链接（DESIGN.md 正文这次没读到）',
      )
    } catch {
      setStatus('复制失败，请手动打开下面两个链接')
    }
  }, [name, designMdUrl, registryUrl, designMd])

  return (
    <div className="sd-agent-copy">
      <button type="button" className="sd-btn-ghost" onClick={copy}>
        复制为 Agent 上下文
      </button>
      <span className="sd-copy-status" role="status" aria-live="polite">
        {status}
      </span>
    </div>
  )
}

export default function ArchiveDisclosure({ data }) {
  const [open, setOpen] = useState(false)
  const [designMd, setDesignMd] = useState(null)
  const designMdUrl = data.designMdUrl

  /* 档案区展开时把 DESIGN.md 正文取回来，让「复制」按钮点下去就能写剪贴板
     （先 await fetch 再写会丢掉用户手势）。取不到就只复制链接，并如实说明。 */
  useEffect(() => {
    if (!open || !designMdUrl || designMd !== null) return undefined
    const controller = new AbortController()
    fetch(designMdUrl, { signal: controller.signal })
      .then((res) => (res.ok ? res.text() : null))
      .then((text) => { if (text) setDesignMd(text) })
      .catch(() => {})
    return () => controller.abort()
  }, [open, designMdUrl, designMd])

  const facts = Array.isArray(data.facts) ? data.facts : []
  const facets = data.facets || {}
  const checked = isoDate(data.official?.checkedAt)
  const axes = Object.keys(FACET_AXIS_LABELS).filter(
    (axis) => Array.isArray(facets[axis]) && facets[axis].length > 0,
  )

  return (
    <details
      className="sd-archive"
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className="sd-archive-summary">
        <span className="sd-archive-title">档案</span>
        <span className="sd-archive-hint">
          {facts.length} 条事实、来源与核验记录
        </span>
      </summary>

      {open ? (
        <div className="sd-archive-body">
          <dl className="sd-facts">
            {/* 正式简介：完整、书面、可引用。页面上半部分给的是编辑手记，
                两者不互相顶替，所以正式那份收在档案区第一行。 */}
            {data.editorial?.descriptionZh ? (
              <div className="sd-fact">
                <dt className="sd-fact-field">正式简介</dt>
                <dd className="sd-fact-body">
                  <p className="sd-fact-desc">{data.editorial.descriptionZh}</p>
                </dd>
              </div>
            ) : null}
            {facts.map((fact, index) => (
              <FactRow key={`${fact.field}-${index}`} fact={fact} />
            ))}
            <div className="sd-fact">
              <dt className="sd-fact-field">核验于</dt>
              <dd className="sd-fact-body">
                <p className="sd-fact-line">
                  <span className="sd-fact-value">{checked || '未知'}</span>
                </p>
                {data.official?.checkedAt ? (
                  <p className="sd-fact-evidence x-mono">{data.official.checkedAt}</p>
                ) : null}
              </dd>
            </div>
            <div className="sd-fact">
              <dt className="sd-fact-field">独立复核</dt>
              <dd className="sd-fact-body">
                <p className="sd-fact-line">
                  <span className="sd-fact-value">
                    {data.classification?.independentlyReviewed
                      ? '是 · 整理与复核不是同一人'
                      : '否 · 同一人完成整理与复核'}
                  </span>
                </p>
              </dd>
            </div>
          </dl>

          {axes.length > 0 ? (
            <div className="sd-facets">
              <h4 className="sd-sub-title">切面标签</h4>
              <dl className="sd-facet-list">
                {axes.map((axis) => (
                  <div className="sd-facet-axis" key={axis}>
                    <dt>{FACET_AXIS_LABELS[axis]}</dt>
                    <dd>
                      {facets[axis].map((value) => (
                        <span className="sd-tag" key={value}>{facetLabel(axis, value)}</span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          <div className="sd-agent">
            <h4 className="sd-sub-title">给 Agent 的两个入口</h4>
            <ul className="sd-agent-links">
              {designMdUrl ? (
                <li>
                  <a href={designMdUrl} target="_blank" rel="noopener noreferrer">
                    DESIGN.md <span aria-hidden="true">↗</span>
                  </a>
                  <span className="sd-agent-note x-mono">{designMdUrl}</span>
                </li>
              ) : null}
              {data.registryUrl ? (
                <li>
                  <a href={data.registryUrl} target="_blank" rel="noopener noreferrer">
                    Registry JSON <span aria-hidden="true">↗</span>
                  </a>
                  <span className="sd-agent-note x-mono">{data.registryUrl}</span>
                </li>
              ) : null}
            </ul>
            <AgentContextButton
              name={data.editorial?.name || data.entryId}
              designMdUrl={designMdUrl}
              registryUrl={data.registryUrl}
              designMd={designMd}
            />
          </div>
        </div>
      ) : null}
    </details>
  )
}
