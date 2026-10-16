// 资源卡片的预览区：有图显示图，Skill 显示原文节选，都没有时提示去原文看。
export default function ResourcePreview({ item, en, priority = false }) {
  if (item.preview) return <img src={item.preview} width={item.previewWidth || 1280} height={item.previewHeight || 800} alt={en ? (item.practice?.caption?.en || item.en) : (item.practice?.caption?.zh || item.zh)} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'low'} decoding="async" />
  if (item.originalDocument) return <pre className="rl-document-excerpt" aria-label={en ? 'Excerpt from the original SKILL.md' : '原始 SKILL.md 节选'} style={{ margin: 0, padding: '20px', textAlign: 'left', whiteSpace: 'pre-wrap', overflow: 'hidden', height: '100%', fontSize: '12px', lineHeight: 1.6 }}><strong>SKILL.md · {item.originalDocument.lines} {en ? 'lines' : '行'}{'\n\n'}</strong>{item.originalDocument.excerpt}</pre>
  return <span className="rl-study-source-only">{en ? 'View examples at the source' : '到原文查看效果'}</span>
}
