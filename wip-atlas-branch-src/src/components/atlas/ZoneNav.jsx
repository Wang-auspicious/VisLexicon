import { SLOT_LABEL } from '../../lib/stage-index.js'

/* ============ 分区导航（方案 §5.2 态二 / research/03 §6.4 第三条） ============
 * 按**空间或功能**列，不按 slot 类型列：用户不会想「我要找一个 hotspot」，
 * 他会想「我要找输入框旁边那个东西」。编号与舞台上的角标是同一套。
 *
 * 总览态：全部分区展开，这就是解剖图的图例。
 * 分区态：只展开当前分区，其余折起但一点就开。
 * 手机：一律手风琴（总览态在 <768 自动降级为这份列表）。
 */

export default function ZoneNav({
  zones, activeZoneId, selectedTermId, onSelectZone, onSelectTerm, accordion,
}) {
  return (
    <nav className="axz" aria-label="分区与术语">
      {zones.map((zone) => {
        const open = activeZoneId ? zone.id === activeZoneId : !accordion
        return (
          <section className={`axz-zone ${open ? 'open' : ''}`} key={zone.id}>
            <h3 className="axz-h">
              <button
                type="button"
                className="axz-toggle"
                aria-expanded={open}
                onClick={() => onSelectZone(open && activeZoneId === zone.id ? null : zone.id)}
              >
                <span className="axz-title">{zone.labelZh}</span>
                <em className="x-mono">{zone.members.length}</em>
                <span className="axz-caret" aria-hidden="true">{open ? '▾' : '▸'}</span>
              </button>
            </h3>
            <p className="axz-desc">{zone.descriptionZh}</p>
            <ul className="axz-list" hidden={!open}>
              {zone.members.map((member) => (
                <li key={member.termId}>
                  <button
                    type="button"
                    className={`axz-term ${member.termId === selectedTermId ? 'on' : ''}`}
                    onClick={() => onSelectTerm(member.termId)}
                  >
                    <em className="axz-n x-mono">{member.n}</em>
                    <span className="axz-en">{member.termEn}</span>
                    <span className="axz-zh">{member.displayZh}</span>
                    {member.slot !== 'hotspot' && (
                      <span className="axz-slot x-mono">{SLOT_LABEL[member.slot]}</span>
                    )}
                    {member.underVariantZh && (
                      <span className="axz-under">需切到「{member.underVariantZh}」才看得见</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </nav>
  )
}
