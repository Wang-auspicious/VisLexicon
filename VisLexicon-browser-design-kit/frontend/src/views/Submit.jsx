import { useEffect, useMemo, useState } from 'react'
import { go } from '../router.js'
import {
  applySubmissionUpdate,
  EMPTY_SUBMISSION,
  preflightSiteSubmission,
  SUBMISSION_TYPES,
  validateSubmission,
} from '../lib/submission-form.js'

const DRAFT_KEY = 'vl-submission-draft'

function loadDraft() {
  try {
    const parsed = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null')
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return EMPTY_SUBMISSION
    return {
      type: SUBMISSION_TYPES.has(parsed.type) ? parsed.type : EMPTY_SUBMISSION.type,
      name: typeof parsed.name === 'string' ? parsed.name : '',
      zh: typeof parsed.zh === 'string' ? parsed.zh : '',
      url: typeof parsed.url === 'string' ? parsed.url : '',
      note: typeof parsed.note === 'string' ? parsed.note : '',
    }
  } catch {
    return EMPTY_SUBMISSION
  }
}

function Track({ n, title, desc, children, done = false }) {
  return (
    <div className={`submit-track ${done ? 'done' : ''}`}>
      <span className="track-n x-mono">{n}</span>
      <h3>{title}</h3>
      <p>{desc}</p>
      <div className="track-body">{children}</div>
    </div>
  )
}

export default function Submit() {
  const [form, setForm] = useState(loadDraft)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('')
  const [preflight, setPreflight] = useState({ status: 'idle', result: null })
  const payload = useMemo(() => ({
    submission_version: '1.0',
    delivery: 'local-draft',
    contribution: form,
  }), [form])
  const payloadJson = JSON.stringify(payload, null, 2)

  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(form)) } catch { /* save is confirmed on submit */ }
  }, [form])

  useEffect(() => {
    if (form.type !== 'site' || !form.url.trim()) {
      return undefined
    }

    let cancelled = false
    const timer = window.setTimeout(async () => {
      setPreflight({ status: 'loading', result: null })
      try {
        const manifestResponse = await fetch('/data/curation/manifest.json', { cache: 'no-store' })
        if (!manifestResponse.ok) throw new Error(`manifest request failed (${manifestResponse.status})`)
        const manifest = await manifestResponse.json()
        if (typeof manifest.resolverUrl !== 'string' || !manifest.resolverUrl.startsWith('/data/curation/resolver.')) {
          throw new Error('resolver URL is not a published immutable revision')
        }
        const resolverResponse = await fetch(manifest.resolverUrl, { cache: 'force-cache' })
        if (!resolverResponse.ok) throw new Error(`resolver request failed (${resolverResponse.status})`)
        const resolver = await resolverResponse.json()
        const result = preflightSiteSubmission(form.url, resolver)
        if (!cancelled) setPreflight({ status: 'ready', result })
      } catch (error) {
        if (!cancelled) {
          setPreflight({
            status: 'error',
            result: {
              kind: 'unverifiable',
              message: '暂时无法读取公开查重索引；草稿仍只保存在本机，尚未发送。',
              reason: error instanceof Error ? error.message : 'resolver unavailable',
              canExportDraft: true,
              requiresEvidence: true,
            },
          })
        }
      }
    }, 250)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [form.type, form.url])

  const update = (field, value) => {
    const next = applySubmissionUpdate(form, errors, field, value)
    setForm(next.form)
    setErrors(next.errors)
    setStatus('')
  }

  const saveDraft = (e) => {
    e.preventDefault()
    const nextErrors = validateSubmission(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setStatus('请修正表单后再保存。')
      return
    }
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form))
      setStatus('已保存在本机，尚未发送')
    } catch {
      setStatus('浏览器未能保存草稿；请复制或下载 JSON。尚未发送。')
    }
  }

  const copyJson = async () => {
    if (!navigator.clipboard?.writeText) {
      setStatus('此浏览器不支持自动复制；请使用下载 JSON。尚未发送。')
      return
    }
    try {
      await navigator.clipboard.writeText(payloadJson)
      setStatus('JSON 已复制到剪贴板；尚未发送。')
    } catch {
      setStatus('复制失败；请使用下载 JSON。尚未发送。')
    }
  }

  const downloadJson = () => {
    try {
      const blob = new Blob([payloadJson], { type: 'application/json;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'vislexicon-submission.json'
      document.body.append(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 0)
      setStatus('已生成 JSON 下载；尚未发送。')
    } catch {
      setStatus('无法生成下载；请手动复制表单内容。尚未发送。')
    }
  }

  return (
    <main className="submit-page">
      <header className="page-head">
        <em className="x-mono">COMMUNITY · GITHUB-FIRST</em>
        <h1>提交</h1>
        <p>
          本站当前没有接收或审核后端。你可以先在本机整理贡献草稿，再复制或下载 JSON，交给实际维护者确认。
          只有维护者明确接收后，才算完成提交。
        </p>
      </header>

      <div className="submit-tracks">
        <Track n="01" title="开发者 · 手工交付" desc="导出 JSON 后，在你确认存在的仓库或沟通渠道中手工提交。">
          <ol className="gh-steps">
            <li>填写并检查下方草稿。</li>
            <li>复制或下载 <code className="x-mono">vislexicon-submission.json</code>。</li>
            <li>在真实存在的目标仓库或维护渠道中提交，由维护者反馈结果。</li>
          </ol>
        </Track>

        <Track n="02" title="本机草稿" desc="表单内容自动保存在当前浏览器；本站不会把它发送到服务器。">
          <form className="submit-form" onSubmit={saveDraft} noValidate>
            <label>
              <span className="x-mono">类型</span>
              <select value={form.type} onChange={(e) => update('type', e.target.value)}>
                <option value="term">词条 / 效果名</option>
                <option value="component">组件 / 库</option>
                <option value="wild">野外目击线索</option>
                <option value="site">收录链接</option>
              </select>
            </label>
            <label>
              <span className="x-mono">你的名称 *</span>
              <input value={form.name} aria-invalid={Boolean(errors.name)} placeholder="GitHub 或昵称（仅用于草稿署名）" onChange={(e) => update('name', e.target.value)} />
              {errors.name && <small role="alert">{errors.name}</small>}
            </label>
            <label>
              <span className="x-mono">中/英术语（与链接至少填一项）</span>
              <input value={form.zh} aria-invalid={Boolean(errors.content)} placeholder="如：磁吸按钮 / magnetic button" onChange={(e) => update('zh', e.target.value)} />
              {errors.content && <small role="alert">{errors.content}</small>}
            </label>
            <label>
              <span className="x-mono">链接</span>
              <input type="url" value={form.url} aria-invalid={Boolean(errors.url)} placeholder="https://…" onChange={(e) => update('url', e.target.value)} />
              {errors.url && <small role="alert">{errors.url}</small>}
            </label>
            <label><span className="x-mono">一句说明</span><textarea rows={3} value={form.note} placeholder="为什么值得收录？" onChange={(e) => update('note', e.target.value)} /></label>
            {form.type === 'site' && form.url.trim() && preflight.status === 'loading' ? (
              <p className="submit-preflight" role="status">正在读取公开查重索引…</p>
            ) : null}
            {form.type === 'site' && form.url.trim() && preflight.result ? (
              <p className="submit-preflight" role={preflight.status === 'error' ? 'alert' : 'status'}>
                {preflight.result.message}
              </p>
            ) : null}
            <button type="submit" className="btn-pick wide">保存草稿到本机</button>
            <button type="button" className="btn-pick wide" onClick={copyJson}>复制 JSON</button>
            <button type="button" className="btn-pick wide" onClick={downloadJson}>下载 JSON</button>
            <button type="button" className="btn-ghost wide" disabled title="本站尚未接入审核服务">真实审核发送暂不可用</button>
            {status && <p className="submit-ok x-mono" role="status">{status}</p>}
          </form>
        </Track>
      </div>

      <div className="flow-line">
        <span className="x-mono">当前工作流</span>
        <div className="flow-chips">
          <code className="flow-chip q">本机草稿</code>
          <i>→</i>
          <code className="flow-chip l">手工交付</code>
          <i>→</i>
          <code className="flow-chip f">维护者确认</code>
          <span className="x-mono mono-note">前两步可在本站完成；最终结果须由真实维护渠道确认。</span>
        </div>
      </div>

      <p className="coda">
        草稿不会自动公开，本站也不会代你联系维护者。导出前请检查链接和署名中是否含有不宜分享的信息。
        <button type="button" className="btn-ghost" onClick={() => go('atlas')}>← 先逛逛图鉴</button>
      </p>
    </main>
  )
}
