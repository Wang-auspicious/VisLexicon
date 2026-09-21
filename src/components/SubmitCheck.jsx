import { useState } from 'react'

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
        <label className="subcheck-label" htmlFor={SUBMIT_CHECK_INPUT_ID}>粘一个 URL，看我们收没收</label>
        <div className="subcheck-row">
          <input
            id={SUBMIT_CHECK_INPUT_ID}
            className="subcheck-input"
            type="text"
            inputMode="url"
            autoComplete="off"
            placeholder="example.com 或 https://example.com/ui"
            value={value}
            onChange={(event) => { setValue(event.target.value); setResult(null) }}
          />
          <button type="submit" className="btn-primary">查一下</button>
        </div>
      </form>

      <div className="subcheck-out" role="status">
        {result?.kind === 'invalid' && <p className="subcheck-msg">这不像一个网址。写成 example.com 或带 https:// 的完整地址。</p>}
        {result?.kind === 'no-index' && (
          <p className="subcheck-msg" role="alert">
            {loadError ? '站点索引没能加载，现在查不了。' : '站点索引还没加载完，稍后再试。'}
          </p>
        )}
        {result?.kind === 'hit' && (
          <p className="subcheck-msg">
            已收录：<a className="inline-link" href={`#/site/${result.item.entryId}`}>{result.item.name} →</a>
            <span className="x-mono"> {result.item.domain || '域名未知'}</span>
          </p>
        )}
        {result?.kind === 'miss' && (
          <div className="subcheck-miss">
            <p className="subcheck-msg">
              没收录 <span className="x-mono">{result.host}</span>。
              <strong>本站当前没有接收后端</strong>——这个框只在本地比对已发布的索引，不会把你输入的东西发到任何地方。
              你可以复制下面这段 JSON 发给我们。
            </p>
            <pre className="subcheck-json"><code className="x-mono">{snippet}</code></pre>
            <div className="subcheck-actions">
              <button type="button" className="copy-btn" onClick={copy}>复制这段 JSON</button>
              {copyState === 'ok' && <span className="subcheck-ok">已复制到剪贴板</span>}
              {copyState === 'fail' && <span className="subcheck-fail">浏览器拒绝了剪贴板权限，请手动选中复制。</span>}
            </div>
            <p className="subcheck-note">
              收录标准与我们怎么核验，写在<a className="inline-link" href="#/about#submit">关于页的提交说明</a>里。
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
