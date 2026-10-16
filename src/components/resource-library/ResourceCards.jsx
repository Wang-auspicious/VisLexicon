import ResourcePreview from './ResourcePreview.jsx'
import { resourceRuntime } from '../../lib/usable-resource-topics.js'

/** 文件型卡片：设计规范 Markdown，或没有预览图的 PPT / 图像处理资源。 */
export function DocumentCard({ item, en, onOpen }) {
  const kind = item.document?.fileName || resourceRuntime(item, en) || item.outputFormat
  const size = item.document ? `${item.document.lines.toLocaleString()} ${en ? 'lines' : '行'}` : item.execution?.filename || item.resourceKind
  return <button type="button" className="rl-study rl-document-card" onClick={onOpen}>
    <div className="rl-document-card-file"><span>{kind}</span><span>{size}</span></div>
    <h2>{en ? item.en : item.zh}</h2>
    <p className="rl-document-card-description">{en ? item.de : item.dz}</p>
    <div className="rl-document-card-footer">
      <span>{item.sourceName}</span>
      <span>{item.document?.license || item.license?.software || item.outputFormat} ↗</span>
    </div>
  </button>
}

/** 图片型卡片：带序号和两个关键词；PPT / 图像处理额外显示一句简介。 */
export function StudyCard({ item, index, en, showSummary, onOpen }) {
  return <button type="button" className="rl-study" onClick={onOpen}>
    <div className="rl-study-image"><ResourcePreview item={item} en={en} priority={index < 12} /></div>
    <div className="rl-study-caption">
      <span className="rl-study-number">{String(index + 1).padStart(2, '0')}</span>
      <div><h2>{en ? item.en : item.zh}</h2><p>{(en ? item.kw : item.kz).slice(0, 2).join(' / ')}</p></div>
      <span aria-hidden="true">↗</span>
    </div>
    {showSummary && <p className="rl-resource-summary">{en ? item.de : item.dz}</p>}
  </button>
}

/** 空列表：有条目但没匹配时引导回全部；栏目本身为空时引导去图鉴。 */
export function EmptyState({ hasEntries, en, allPath }) {
  return <div className="rl-empty">
    <span className="rl-empty-mark" aria-hidden="true">＋</span>
    <h2>{hasEntries ? (en ? 'Nothing matches' : '没有匹配的作品') : (en ? 'Nothing here yet' : '这里还没有收录作品')}</h2>
    <p>{hasEntries ? (en ? 'Try another keyword, or go back to all topics.' : '试试其他关键词，或回到全部分类。') : (en ? 'Browse the atlas for more visual references.' : '可以先到图鉴浏览已有视觉素材。')}</p>
    <a href={hasEntries ? allPath : '#/atlas'}>{hasEntries ? (en ? 'View all' : '查看全部') : (en ? 'Open the atlas' : '去看图鉴')} →</a>
  </div>
}
