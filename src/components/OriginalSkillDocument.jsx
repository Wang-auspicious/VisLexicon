import { useEffect, useState } from 'react'

/** Read the original bytes; never substitute an authored invocation for a Skill. */
export default function OriginalSkillDocument({ document: doc, en }) {
  const fileName = doc.fileName || 'SKILL.md'
  const [state, setState] = useState({ sha: null, text: null, error: false })
  const [copied, setCopied] = useState('')
  const text = state.sha === doc.sha256 ? state.text : null
  useEffect(() => {
    const controller = new AbortController()
    fetch(doc.asset, { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error('Original file unavailable')
      const bytes = await response.arrayBuffer()
      const sha = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(n => n.toString(16).padStart(2, '0')).join('')
      if (sha !== doc.sha256) throw new Error('Original file integrity mismatch')
      if (!controller.signal.aborted) setState({ sha, text: new TextDecoder().decode(bytes), error: false })
    }).catch(error => {
      if (error.name !== 'AbortError' && !controller.signal.aborted) setState({ sha: doc.sha256, text: null, error: true })
    })
    return () => controller.abort()
  }, [doc.asset, doc.sha256])
  return <section className="rl-original-skill">
    <h2>{en ? `Complete original ${fileName}` : `完整原始 ${fileName}`}</h2>
    <p>{en ? 'The original file is preserved in its source language. Download the repository for referenced scripts and supporting files.' : '原文件保留原文语言；引用的脚本和配套文件请从原仓库一并获取。'}</p>
    <div className="rl-document-file">
      <div className="rl-document-toolbar"><strong>{fileName} · {doc.lines.toLocaleString()} {en ? 'lines' : '行'}</strong><div className="rl-document-actions"><button type="button" disabled={text === null} onClick={async () => { try { await navigator.clipboard.writeText(text); setCopied('copied') } catch { setCopied('failed') } }}>{en ? 'Copy full Markdown' : '复制完整 MD'}</button><a href={doc.asset} download={fileName}>{en ? 'Download .md' : '下载 .md'} ↓</a></div></div>
      {text !== null ? <pre className="rl-markdown-body" tabIndex={0} aria-label={en ? 'Complete original Skill' : '完整 Skill 原文'}><code>{text}</code></pre> : <p role="status">{state.error ? (en ? 'Unable to verify this file. Use the original source link below.' : '原文校验失败，请使用下方原始来源。') : (en ? 'Loading the original file…' : '正在读取完整原文…')}</p>}
    </div>
    <p><a href={doc.sourceUrl} target="_blank" rel="noreferrer">{en ? doc.repository : doc.attribution}</a> · <a href={doc.licenseAsset} target="_blank" rel="noreferrer">{doc.license}</a></p>
    <span role="status">{copied === 'copied' ? (en ? 'Complete original Markdown copied.' : '已复制完整原文。') : copied === 'failed' ? (en ? 'Select the text to copy it, or download the file.' : '可选中原文复制，或直接下载文件。') : ''}</span>
  </section>
}
