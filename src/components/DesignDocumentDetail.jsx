import { useEffect, useState } from 'react'
import { useLocale } from '../i18n.js'
import '../styles/design-documents.css'

export default function DesignDocumentDetail({ item, back }) {
  const en = useLocale() === 'en'
  const [loaded, setLoaded] = useState(null)
  const [failedSha, setFailedSha] = useState(null)
  const [copyState, setCopyState] = useState('idle')
  const doc = item.document
  const text = loaded?.sha === doc.sha256 ? loaded.text : null
  const error = failedSha === doc.sha256
  useEffect(() => {
    const controller = new AbortController()
    fetch(doc.asset, { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error('Document unavailable')
      const bytes = await response.arrayBuffer()
      const sha = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(n => n.toString(16).padStart(2, '0')).join('')
      if (sha !== doc.sha256) throw new Error('Document integrity mismatch')
      if (!controller.signal.aborted) { setLoaded({ sha: doc.sha256, text: new TextDecoder().decode(bytes) }); setCopyState('idle') }
    }).catch(reason => { if (reason.name !== 'AbortError' && !controller.signal.aborted) setFailedSha(doc.sha256) })
    return () => controller.abort()
  }, [doc.asset, doc.sha256])
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopyState('copied') } catch { setCopyState('failed') }
  }
  return <article className="rl-detail rl-markdown-detail">
    <div className="rl-breadcrumb"><button type="button" onClick={back}>{en ? '← All documents' : '← 返回文档'}</button><span>{en ? 'Design documents' : '设计规范'} / {doc.fileName}</span></div>
    <div className="rl-document-layout">
      <div className="rl-document-intro">
        <p className="rl-document-kind">{doc.kind === 'project-spec' ? (en ? 'PROJECT DESIGN SPEC' : '项目设计规范') : doc.kind === 'design-reference' ? (en ? 'DESIGN REFERENCE' : '设计参考') : 'DESIGN SKILL'}</p>
        <h1>{en ? item.en : item.zh}</h1>
        <p className="rl-lead">{en ? item.de : item.dz}</p>
        <div className="rl-document-links"><a href={item.sourceUrl} target="_blank" rel="noreferrer">{item.sourceName || doc.repository} ↗</a><a href={item.sourceLicenseUrl} target="_blank" rel="noreferrer">{doc.license}</a></div>
        <p className="rl-document-origin">{en ? 'Complete original file. Its language and contents are preserved.' : '完整原始文件，保留原文语言与内容。'}</p>
      </div>
      <div className="rl-document-file" aria-busy={text === null && !error}>
        <div className="rl-document-toolbar"><div><strong>{doc.fileName}</strong><span>{doc.lines.toLocaleString()} {en ? 'lines' : '行'}</span></div><div className="rl-document-actions"><button type="button" disabled={text === null} onClick={copy}>{copyState === 'copied' ? (en ? 'Copied' : '已复制') : (en ? 'Copy full Markdown' : '复制完整 MD')}</button><a href={doc.asset} download={doc.fileName}>{en ? 'Download .md' : '下载 .md'} <span aria-hidden="true">↓</span></a></div></div>
        {text !== null ? <pre className="rl-markdown-body" tabIndex={0} aria-label={en ? 'Complete original Markdown' : '完整 Markdown 原文'}><code>{text}</code></pre> : <p className="rl-document-message" role="status">{error ? (en ? 'Unable to load this file. Open the original source above.' : '文件加载失败，请打开左侧原始来源。') : (en ? 'Loading the original file…' : '正在读取原始文件…')}</p>}
        <span className="rl-document-copy-status" role="status">{copyState === 'failed' ? (en ? 'Select the document to copy it, or download the Markdown file.' : '可选中原文手动复制，或直接下载 Markdown 文件。') : copyState === 'copied' ? (en ? 'The complete original Markdown was copied.' : '已复制完整 Markdown 原文。') : ''}</span>
      </div>
    </div>
  </article>
}
