/* ============ 术语面板（方案 §5.3 第 5 条，Laws of UX 的节奏） ============
 * 顺序是有理由的：全站唯一别人没有的内容是编辑批注，所以它排第二，
 * 不再像旧右栏那样排到第七位。往下才是定义、来源、两套标签、去处。
 *
 * 三条诚实纪律写在这一个面板里：
 *   · 机器译名与人工订正分开说，不含糊；
 *   · 两套正交标签都显示，「人工复核于」没有就是空，不拿采集时间顶替；
 *   · 「真实网站里长这样」区分编辑标注与域名反查，草稿标成草稿。
 * 没有导出代码按钮：图鉴的定位是看懂与比较，不出包。
 */

function SourceList({ term }) {
  const sources = term.sourceEvidence || []
  if (!sources.length) {
    return <p className="axt-empty">这条没有来源证据，所以术语地位判为「待定」。</p>
  }
  return (
    <ul className="axt-sources">
      {sources.map((evidence) => (
        <li key={`${evidence.sourceId}-${evidence.sourceRecordId}`}>
          <a href={evidence.url} target="_blank" rel="noreferrer">
            <b>{evidence.sourceName}</b>
            <em className="x-mono">{evidence.license || '许可未知'} · 采集于 {evidence.retrievedAt || '未知'}</em>
          </a>
          {evidence.sourceDefinition && <p className="axt-srcdef">{evidence.sourceDefinition}</p>}
        </li>
      ))}
    </ul>
  )
}

export default function TermPanel({
  term, claim, status, siteLinks, neighbors, zone, crossStage, onSelectTerm, onClose,
}) {
  if (!term) return null
  const machine = term.translationQuality === 'machine' && !claim?.termZhFix

  return (
    <article className="axt" aria-label={`术语 ${term.termEn}`}>
      <div className="axt-bar">
        <span className="axt-kicker x-mono">术语</span>
        <button type="button" className="axt-close" onClick={onClose} aria-label="关闭术语面板">✕</button>
      </div>

      {/* ① 正名与中文名 */}
      <header className="axt-head">
        <h2>{term.termEn}</h2>
        <p className="axt-zh">{claim?.displayZh || term.termZh}</p>
        {claim?.termZhFix && (
          <p className="axt-zh-note x-mono">语料原译「{term.termZh}」已在台上订正</p>
        )}
        {machine && (
          <p className="axt-zh-note axt-warn x-mono">中文名为机器翻译，未经人工校对</p>
        )}
      </header>

      {/* ② 编辑批注：全站唯一别人没有的内容，所以排第二 */}
      <section className="axt-sec axt-note-sec">
        <h3>编辑批注</h3>
        {claim?.noteZh
          ? <p className="axt-note">{claim.noteZh}</p>
          : <p className="axt-empty">这一条还没有写批注。空着，不拿定义顶替。</p>}
      </section>

      {/* ③ 定义与来源 */}
      <section className="axt-sec">
        <h3>定义</h3>
        <p className="axt-def">{term.definitionZh || '语料里没有中文定义。'}</p>
        {term.sourceDefinition && <p className="axt-def-en">{term.sourceDefinition}</p>}
        {term.aliases?.length > 0 && (
          <p className="axt-aliases">
            <span className="axt-aliases-h">别名</span>
            {term.aliases.map((alias) => <em key={alias}>{alias}</em>)}
          </p>
        )}
        <h3 className="axt-sub-h">来源</h3>
        <SourceList term={term} />
      </section>

      {/* ④ 两套正交标签 + 人工复核 */}
      <section className="axt-sec">
        <h3>成色</h3>
        <div className="axt-tags">
          <span className="axt-tag">建档深度 · {status.depthLabelZh}</span>
          <span className="axt-tag">术语地位 · {status.termStatusLabelZh}</span>
        </div>
        <p className="axt-review x-mono">人工复核于：{status.reviewedAt || '—'}</p>
      </section>

      {/* ⑤ 真实网站里长这样（导流点 L6） */}
      <section className="axt-sec">
        <h3>真实网站里长这样</h3>
        {siteLinks.length ? (
          <ul className="axt-sites">
            {siteLinks.map((site) => (
              <li key={site.entryId}>
                <a href={`#/site/${site.entryId}`}>
                  <b>{site.name}</b>
                  <em className="x-mono">{site.domain}</em>
                </a>
                <span className="axt-site-how x-mono">
                  {site.matchedBy === 'annotation' ? '编辑标注' : '按来源域名反查'}
                  {site.matchedBy === 'annotation' && site.atlasTermsStatus === 'editor-draft' && ' · 编辑草稿'}
                </span>
                {site.noteZh && <p className="axt-site-note">{site.noteZh}</p>}
                {site.evidenceUrl && (
                  <a className="axt-site-ev x-mono" href={site.evidenceUrl} target="_blank" rel="noreferrer">
                    出处页 ↗
                  </a>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="axt-empty">尚未有已核验站点示范此术语。</p>
        )}
      </section>

      {/* ⑥ 同一分区里的邻居 */}
      {neighbors.length > 0 && (
        <section className="axt-sec">
          <h3>同一区里还有</h3>
          <p className="axt-zone-name">{zone?.labelZh}</p>
          <ul className="axt-neighbors">
            {neighbors.map((member) => (
              <li key={member.termId}>
                <button type="button" onClick={() => onSelectTerm(member.termId)}>
                  <em className="x-mono">{member.n}</em>
                  <b>{member.termEn}</b>
                  <span>{member.displayZh}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {crossStage.length > 0 && (
        <section className="axt-sec">
          <h3>也出现在</h3>
          <ul className="axt-xrefs">
            {crossStage.map((ref) => (
              <li key={ref.stageId}>
                <a href={`#/atlas/${ref.stageId}/${term.id}`}>{ref.titleZh} ↗</a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
