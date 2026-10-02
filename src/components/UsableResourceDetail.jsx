import { useState } from 'react'
import OriginalSkillDocument from './OriginalSkillDocument.jsx'
import { resourceRuntime } from '../lib/usable-resource-topics.js'
import { useLocale } from '../i18n.js'

const MODE = {
  'local-code': ['本地代码', 'Local code'],
  'local-model': ['本地模型', 'Local model'],
  'browser-service': ['浏览器服务', 'Browser service'],
}

export default function UsableResourceDetail({ item, back }) {
  const en = useLocale() === 'en'
  const [copied, setCopied] = useState('')
  const doc = item.document || item.originalDocument
  const execution = item.execution
  const code = execution?.code
  const run = en && execution?.run?.startsWith('在浏览器打开 ') ? `Open ${execution.run.slice(7)} in a browser` : execution?.run
  const copyCode = async () => {
    try { await navigator.clipboard.writeText(code); setCopied('copied') }
    catch { setCopied('failed') }
  }
  const downloadCode = () => {
    const url = URL.createObjectURL(new Blob([code], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = execution.filename || 'effect.txt'
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const inputs = en ? (item.inputsEn || item.inputs) : item.inputs
  const outputs = en ? (item.outputsEn || item.outputs) : item.outputs
  const limits = en ? (item.limitationsEn || item.limitations) : item.limitations
  return <article className="rl-detail rl-usable-detail">
    <div className="rl-breadcrumb"><button type="button" onClick={back}>{en ? '← All resources' : '← 返回资源'}</button><span>{item.sourceName}</span></div>
    <div className="rl-detail-layout"><div>
      <h1>{en ? item.en : item.zh}</h1><p className="rl-lead">{en ? item.de : item.dz}</p>
      {item.preview && <figure className="rl-stage"><img src={item.preview} alt={en ? item.en : item.zh} /><figcaption>{en ? (item.previewCaptionEn || (item.previewOrigin === 'source' ? 'Source example' : 'Locally rendered code example')) : (item.previewCaptionZh || (item.previewOrigin === 'source' ? '原始来源示例' : '本站代码渲染示例'))}</figcaption></figure>}
      {code && <section>
        <div className="rl-document-toolbar"><strong>{execution.filename}</strong><div className="rl-document-actions"><button type="button" onClick={copyCode}>{copied === 'copied' ? (en ? 'Copied' : '已复制') : (en ? 'Copy code' : '复制代码')}</button><button type="button" onClick={downloadCode}>{en ? 'Download' : '下载文件'} ↓</button></div></div>
        <pre className="rl-markdown-body" tabIndex={0} aria-label={en ? 'Complete executable code' : '完整执行代码'}><code>{code}</code></pre>
        <span role="status">{copied === 'failed' ? (en ? 'Select the code to copy, or download the file.' : '可选中代码复制，或直接下载文件。') : copied === 'copied' ? (en ? 'Code copied.' : '代码已复制。') : ''}</span>
      </section>}
      {doc && <OriginalSkillDocument key={doc.sha256} document={doc} en={en} />}
    </div><aside className="rl-detail-notes">
      {!!item.files?.length && <section><h2>{en ? 'Get the files' : '直接取用'}</h2>{item.files.map(file => <p key={file.url}><a href={file.url} download={file.url.startsWith('/') ? '' : undefined} target="_blank" rel="noreferrer">{en ? file.labelEn : file.labelZh} ↓</a></p>)}</section>}
      {item.repository?.archiveUrl && <p><a href={item.repository.archiveUrl} target="_blank" rel="noreferrer">{en ? 'Complete repository ZIP' : '完整原仓库 ZIP'} ↓</a></p>}
      {execution && <section><h2>{en ? 'Run' : '运行'}</h2><p>{MODE[execution.mode]?.[en ? 1 : 0] || execution.mode} · {resourceRuntime(item, en)}</p>{execution.install && <pre className="rl-command"><code>{execution.install}</code></pre>}{run && <pre className="rl-command"><code>{run}</code></pre>}<p>{execution.status === 'verified' ? (en ? 'Example executed and checked.' : '示例已实际运行核验。') : (en ? 'Based on official documentation; not executed here yet.' : '依据官方文档整理，尚未在本站运行核验。')}</p></section>}
      {!!inputs?.length && <section><h2>{en ? 'Input → output' : '输入 → 输出'}</h2>{inputs.map(value => <p key={value}>{value}</p>)}{outputs?.map(value => <p key={value}>→ {value}</p>)}</section>}
      {(item.noteZh || limits?.length) && <section><h2>{en ? 'Before using' : '适用范围'}</h2>{item.noteZh && <p>{en ? item.noteEn : item.noteZh}</p>}{limits?.map(value => <p key={value}>{value}</p>)}</section>}
      <section><h2>{en ? 'Original source' : '原始来源'}</h2><p><a href={item.sourceUrl} target="_blank" rel="noreferrer">{item.sourceName} ↗</a></p>{item.sourceLicenseUrl && <a href={item.sourceLicenseUrl} target="_blank" rel="noreferrer">{en ? 'Source license' : '来源许可'}</a>}{item.license?.software && <p><a href={item.license.softwareUrl} target="_blank" rel="noreferrer">{item.license.software}</a></p>}{item.license?.asset && <p>{en ? (item.license.assetEn || 'Input assets and model weights have their own licenses.') : item.license.asset}</p>}</section>
    </aside></div>
  </article>
}
