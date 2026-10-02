import { useState } from 'react'
import { useLocale } from '../i18n.js'
import { displayName } from '../lib/localized-content.js'

/* ============ 页脚查重框（方案 §2.1、§6.1、§8 第 15 条） ============
 * 旧的提交频道有五态查重，但它的预检 `fetch('/data/curation/manifest.json')`
 * 恒 404，所以五态永远只走 error 分支。本版只做两件真的能做到的事：
 *   1. 本地比对已发布索引（domain / homepage）——命中就直接给那条站点详情；
 *   2. 未命中就说清「本站当前没有接收后端」，并给一段可复制的 JSON。
 * 不给「已在候选处理中」这类没有后端支撑的状态。
 */

/* 固定 id：全部站点空结果态要把焦点送到这里（导流表 L8）。 */
export const SUBMIT_CHECK_INPUT_ID = 'submit-check-url'

function hostOf(raw) {
  const text = String(raw || '').trim()
  if (!text) return null
  try {
    return new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`)
      .hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return null
  }
}

/** 命中判定：域名相等，或域名是索引里某条 homepage 的主机名。 */
function findMatch(items, raw) {
  const host = hostOf(raw)
  if (!host) return null
  return items.find((item) => {
    const domain = String(item?.domain || '').replace(/^www\./, '').toLowerCase()
    const homepageHost = hostOf(item?.homepage)
    return domain === host || homepageHost === host
  }) ?? null
}

export default function SubmitCheck({ items, loadError }) {
  const locale = useLocale(), en = locale === 'en'
  const [value, setValue] = useState('')
  const [result, setResult] = useState(null)
  const [copyState, setCopyState] = useState('idle')   /* idle | ok | fail */

  const submit = (event) => {
    event.preventDefault()
    setCopyState('idle')
    const host = hostOf(value)
    if (!host) {
      setResult({ kind: 'invalid' })
      return
    }
    if (!items) {
      setResult({ kind: 'no-index' })
      return
    }
    const hit = findMatch(items, value)
    setResult(hit ? { kind: 'hit', item: hit } : { kind: 'miss', host })
  }

  const snippet = result?.kind === 'miss'
    ? JSON.stringify({ url: value.trim(), domain: result.host, note: '' }, null, 2)
    : ''

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet)
      setCopyState('ok')
    } catch {
      setCopyState('fail')
    }
  }

  return (
    <div className="subcheck" id="submit-check">
      <form className="subcheck-form" onSubmit={submit}>
        <label className="subcheck-label" htmlFor={SUBMIT_CHECK_INPUT_ID}>{en ? 'Find a website by URL' : '通过网址查找网站'}</label>
        <div className="subcheck-row">
          <input
            id={SUBMIT_CHECK_INPUT_ID}
            className="subcheck-input"
            type="text"
            inputMode="url"
            autoComplete="off"
            placeholder={en ? 'example.com or https://example.com/ui' : 'example.com 或 https://example.com/ui'}
            value={value}
            onChange={(event) => { setValue(event.target.value); setResult(null) }}
          />
          <button type="submit" className="btn-primary">{en ? 'Look up' : '查询'}</button>
        </div>
      </form>

      <div className="subcheck-out" role="status">
        {result?.kind === 'invalid' && <p className="subcheck-msg">{en ? 'Enter a domain or a complete URL.' : '请输入域名或完整网址。'}</p>}
        {result?.kind === 'no-index' && (
          <p className="subcheck-msg" role="alert">
            {loadError ? (en ? 'The website index could not load.' : '站点索引未能加载。') : (en ? 'The index is still loading. Try again shortly.' : '索引加载中，请稍后重试。')}
          </p>
        )}
        {result?.kind === 'hit' && (
          <p className="subcheck-msg">
            {en ? 'In the library: ' : '已收录：'}<a className="inline-link" href={`#/site/${result.item.entryId}`}>{displayName(result.item, locale)} →</a>
            <span className="x-mono"> {result.item.domain || (en ? 'Unknown domain' : '域名未知')}</span>
          </p>
        )}
        {result?.kind === 'miss' && (
          <div className="subcheck-miss">
            <p className="subcheck-msg">
              {en ? 'Not in the library: ' : '尚未收录：'}<span className="x-mono">{result.host}</span>.
              {en ? ' This lookup does not submit a website. You can copy its details below.' : ' 本次查询不会提交网站，可复制下方信息。'}
            </p>
            <pre className="subcheck-json"><code className="x-mono">{snippet}</code></pre>
            <div className="subcheck-actions">
              <button type="button" className="copy-btn" onClick={copy}>{en ? 'Copy details' : '复制信息'}</button>
              {copyState === 'ok' && <span className="subcheck-ok">{en ? 'Copied' : '已复制'}</span>}
              {copyState === 'fail' && <span className="subcheck-fail">{en ? 'Select the text to copy it manually.' : '请选中文字手动复制。'}</span>}
            </div>
            <p className="subcheck-note">
              <a className="inline-link" href="#/about#method">{en ? 'Read our editorial standards' : '查看收录标准'}</a>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
