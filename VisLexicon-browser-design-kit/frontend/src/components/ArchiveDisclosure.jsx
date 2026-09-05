import { useCallback, useEffect, useState } from 'react'
import FactRow from './FactRow.jsx'
import {
  FACET_AXIS_LABELS,
  facetLabel,
  isoDate,
} from '../lib/site-detail-labels.js'

/**
 * 档案正文：正式简介、事实、切面、Agent 入口。
 * 详情页把它作为主阅读区，不再折叠。
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
  const [designMd, setDesignMd] = useState(null)
  const designMdUrl = data.designMdUrl

  useEffect(() => {
    if (!designMdUrl || designMd !== null) return undefined
    const controller = new AbortController()
    fetch(designMdUrl, { signal: controller.signal })
      .then((res) => (res.ok ? res.text() : null))
      .then((text) => { if (text) setDesignMd(text) })
      .catch(() => {})
    return () => controller.abort()
  }, [designMdUrl, designMd])

  const facts = Array.isArray(data.facts) ? data.facts : []
  const facets = data.facets || {}
  const checked = isoDate(data.official?.checkedAt)
  const axes = Object.keys(FACET_AXIS_LABELS).filter(
    (axis) => Array.isArray(facets[axis]) && facets[axis].length > 0,
  )

  return (
    <section className="sd-archive">
      <h3 className="sd-archive-title">档案</h3>
      <div className="sd-archive-body">
        <dl className="sd-facts">
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
        </dl>

        {axes.length > 0 ? (
          <div className="sd-facets">
            <h4 className="sd-sub-title">切面</h4>
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
          <h4 className="sd-sub-title">给 Agent 的入口</h4>
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
    </section>
  )
}
