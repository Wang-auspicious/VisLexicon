import { useState } from 'react'
import { RESOURCE_SECTIONS } from '../../lib/creative-resources.js'
import { useLocale } from '../../i18n.js'
import { englishText } from '../../lib/localized-content.js'

// 科研绘图等“作品”条目的详情：示例、做法、示例文件、检查项与边界。
export default function PracticeDetail({ item, back }) {
  const [copied, setCopied] = useState(false)
  const en = useLocale() === 'en'
  const practice = item.practice
  const section = RESOURCE_SECTIONS[item.category]
  const copy = en ? item.en : item.zh
  const caption = en ? practice.caption.en : practice.caption.zh
  const codeUrl = item.source?.localCodeUrl || item.source?.codeUrl
  const downloadUrl = item.source?.downloadUrl
  const demoUrl = item.demoUrl?.startsWith('/resource-demos/') ? item.demoUrl : null
  const exampleLabel = item.demoLabel?.[en ? 'en' : 'zh'] || (item.previewKind === 'source-document' ? (en ? 'Source text and code' : '来源原文与代码') : item.previewOrigin === 'source' ? (en ? 'Source example' : '来源示例') : (en ? 'Worked example' : '制作示例'))
  const extraFiles = item.source?.extraFiles || []
  return <article className="rl-detail">
    <div className="rl-breadcrumb"><button type="button" onClick={back}>{en ? '← All entries' : '← 返回作品'}</button><span>{en ? section.titleEn : section.titleZh} / {(en ? item.kw : item.kz)[0]}</span></div>
    <div className="rl-detail-layout"><div>
      {item.preview && <figure className="rl-stage">{demoUrl ? <iframe src={`${demoUrl}${demoUrl.includes('?') ? '&' : '?'}lang=${en ? 'en' : 'zh'}`} title={copy} sandbox="allow-scripts allow-same-origin allow-popups allow-downloads" loading="lazy" style={{ width: '100%', aspectRatio: '16 / 10', border: 0, display: 'block' }} /> : <img src={item.preview} alt={caption} />}<figcaption>{exampleLabel} · {caption}</figcaption></figure>}
      <h1>{copy}</h1><p className="rl-lead">{en ? item.de : item.dz}</p>
      <section><h2>{en ? 'How it works' : '方法与用途'}</h2><p>{en ? item.pe : item.pz}</p></section>
      <section><h2>{en ? 'Make this example' : '具体做法'}</h2><ol className="rl-steps">{(en ? practice.steps.en : practice.steps.zh).map((step, i) => <li key={i}>{step}</li>)}</ol></section>
      <section><h2>{en ? 'Practise on another subject' : '换一个题目练习'}</h2><p>{en ? practice.exercise.en : practice.exercise.zh}</p></section>
    </div><aside className="rl-detail-notes">
      {(codeUrl || downloadUrl || demoUrl || extraFiles.length > 0) && <section><h2>{en ? 'Example files' : '示例文件'}</h2>{demoUrl && <p><a href={`${demoUrl}${demoUrl.includes('?') ? '&' : '?'}lang=${en ? 'en' : 'zh'}`} target="_blank" rel="noreferrer">{en ? 'Open the working example' : '打开完整演示'} ↗</a></p>}{codeUrl && <p><a href={codeUrl} target="_blank" rel="noreferrer" download={item.source?.localCodeUrl ? '' : undefined}>{en ? 'Read or download the example code' : '查看或下载示例代码'} ↗</a></p>}{downloadUrl && downloadUrl !== codeUrl && <p><a href={downloadUrl} download={downloadUrl.startsWith('/') ? '' : undefined} target="_blank" rel="noreferrer">{en ? 'Download the example files' : '下载示例文件'} ↓</a></p>}{extraFiles.map(file => <p key={file.url}><a href={file.url} target="_blank" rel="noreferrer" download={file.url.startsWith('/') ? '' : undefined}>{en ? file.labelEn : file.labelZh} ↓</a></p>)}</section>}
      <section><h2>{en ? 'Check the result' : '检查画面'}</h2><ul>{(en ? practice.checklist.en : practice.checklist.zh).map((check) => <li key={check}>{check}</li>)}</ul></section>
      <section><h2>{en ? 'Where it stops working' : '使用边界'}</h2><p>{en ? practice.caution.en : practice.caution.zh}</p></section>
      <section><h2>{en ? 'What was observed' : '观察来源'}</h2><p>{en ? practice.observation.en : practice.observation.zh}</p>{item.sourceUrl && <p><a href={item.sourceUrl} target="_blank" rel="noreferrer">{en ? englishText(item.sourceName, 'Original source') : item.sourceName || '原始来源'}</a></p>}{item.source?.images?.length > 0 && <p className="rl-source-pages">{en ? 'Pages' : '图页'} {item.source.images.join('、')}</p>}{item.sourceLicenseUrl && <p><a href={item.sourceLicenseUrl} target="_blank" rel="noreferrer">{en ? 'Source license' : '来源许可'}</a></p>}</section>
      <button className="rl-copy" type="button" onClick={async () => { try { await navigator.clipboard.writeText(en ? practice.prompt.en : practice.prompt.zh); setCopied(true) } catch { setCopied(false) } }}>{copied ? (en ? 'Copied' : '已复制') : (en ? 'Copy prompt' : '复制提示词')}</button>
    </aside></div>
  </article>
}
