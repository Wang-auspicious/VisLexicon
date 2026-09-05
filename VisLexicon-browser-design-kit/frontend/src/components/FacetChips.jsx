import { useId, useState } from 'react'
import { chipAxes } from '../lib/facet-chips.js'
import { countSelections } from '../lib/site-browser.js'
import { useLocale, useT } from '../i18n.js'

/* ============ 切面 chips（方案 §3.4） ============
 * 只在已经有结果集之后出现，首页零筛选器。
 * 显示哪些值由 lib/facet-chips.js 的准入规则算出：命中 < 2 的死值、命中率 > 60%
 * 的废值、剩不下两个值的整条轴，一律不出现。计数就写在值旁边——用户点之前
 * 知道深度，编辑部一眼看见哪个值已经死了。
 */
export default function FacetChips({ items, selections, onToggle, onClear }) {
  const t = useT()
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const groups = chipAxes(items, selections, locale)
  const chosen = countSelections(selections)

  if (!groups.length) return null

  /* 手机上面板是收起的，按钮要自己说清收了什么条件——只写「已选 2 项」
     等于让用户点开才知道自己筛了什么。 */
  const chosenLabels = groups
    .flatMap((group) => group.values.filter((chip) => chip.selected).map((chip) => chip.label))
  const toggleLabel = chosenLabels.length
    ? `${t('filter')} · ${chosenLabels.slice(0, 2).join(' / ')}${chosenLabels.length > 2 ? ` · ${chosenLabels.length}` : ''}`
    : t('filter')

  return (
    <section className={`vl-chips${open ? ' is-open' : ''}`} aria-label={t('filter')} >
      <button
        type="button"
        className="vl-chips-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {toggleLabel}
      </button>

      <div className="vl-chips-groups" id={panelId}>
        {groups.map((group) => (
          <div className="vl-chips-row" key={group.axis} role="group" aria-label={group.label}>
            <span className="vl-chips-label">{group.label}</span>
            <div className="vl-chips-values">
              {group.values.map((chip) => (
                <button
                  key={chip.value}
                  type="button"
                  className={`vl-chip${chip.selected ? ' is-on' : ''}`}
                  aria-pressed={chip.selected}
                  onClick={() => onToggle(group.axis, chip.value)}
                >
                  {chip.label}
                  <span className="vl-chip-count">{chip.count}</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {chosen ? (
          <button type="button" className="vl-chips-clear" onClick={onClear}>
            {t('clearFilters')}
          </button>
        ) : null}
      </div>
    </section>
  )
}
