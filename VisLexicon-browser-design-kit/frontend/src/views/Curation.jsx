import { useEffect, useId, useMemo, useState } from 'react'
import COLLECTIONS, { validateCollections } from '../data/collections.js'
import { MANIFESTS } from '../stages/manifests.js'
import { siteWideCounts } from '../lib/counts.js'
import { formatCheckedAt, loadSiteIndex } from '../lib/site-browser.js'
import SiteCard from '../components/SiteCard.jsx'
import { useT, useLocale } from '../i18n.js'

/* ============ 策展首页 ============
 * 策展就是罗列。首页 = 承诺句 + 一行真实数字 + 若干编辑分组的卡片墙。
 * 每组：标题 + 一句说明 + 一排卡片。卡片就是全站同一种卡（五项）。
 * 不做跨站比较、不设共同轴、不横滑、不做表格。
 *
 * 首屏不放：分类 pill 行、下拉、搜索大输入框、候选池数字、任何 `+` 结尾的数字。
 */

/** 数字位没算出来就显示破折号，不显示占位数字。 */
function Num({ value }) {
  return Number.isFinite(value) ? <strong className="vl-num">{value}</strong> : <span className="vl-num is-empty">—</span>
}

export default function Curation() {
  const t = useT()
  const locale = useLocale()
  const [state, setState] = useState({ status: 'loading', index: null, error: null })
  const [atlas, setAtlas] = useState(null)

  useEffect(() => {
    let alive = true
    loadSiteIndex()
      .then((index) => alive && setState({ status: 'ready', index, error: null }))
      .catch((error) => alive && setState({ status: 'error', index: null, error }))
    return () => {
      alive = false
    }
  }, [])

  /* 图鉴语料有 1MB，异步取：首屏不为一个数字等它。取不到就是「—」。 */
  useEffect(() => {
    let alive = true
    import('../data/visual-atlas.json')
      .then((module) => alive && setAtlas(module.default))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  const items = useMemo(() => state.index?.items ?? [], [state.index])
  const counts = siteWideCounts({ items, atlas, manifests: MANIFESTS })
  const itemsById = useMemo(() => new Map(items.map((item) => [item.entryId, item])), [items])
  const checked = formatCheckedAt(counts.latestCheckedAt)

  /* 分组引用的条目必须真的在语料里。校验不过不该让首页白屏——
   * 记一条控制台错误，渲染时缺席的成员自然被过滤掉。 */
  useEffect(() => {
    if (state.status !== 'ready') return
    try {
      validateCollections(COLLECTIONS, items)
    } catch (error) {
      console.error(error)
    }
  }, [state.status, items])

  return (
    <div className="vl-curation">
      <section className="vl-promise" aria-labelledby="vl-promise-title">
        <h1 className="vl-promise-title" id="vl-promise-title">{t('promise')}</h1>
        <p className="vl-promise-line">
          <span className="vl-promise-part">
            <Num value={counts.approvedEntries} /> {t('promiseSites')}
          </span>
          <span className="vl-promise-part">
            <Num value={counts.atlasTermsOnStage} /> {t('promiseTerms')} <Num value={counts.stages} /> {t('promiseStages')}
          </span>
          <span className="vl-promise-part">
            {t('promiseChecked')}{' '}
            {checked ? (
              <time className="x-mono" dateTime={checked}>{checked}</time>
            ) : (
              <span className="vl-num is-empty">—</span>
            )}
          </span>
          <span className="vl-promise-part">
            <a className="vl-quiet-link" href="#/about">{t('promiseCounts')}<span aria-hidden="true"> →</span></a>
          </span>
        </p>
      </section>

      {state.status === 'error' ? (
        <p className="vl-alert" role="alert">
          {t('loadFail')}
          <button type="button" onClick={() => window.location.reload()}>{t('retry')}</button>
        </p>
      ) : null}

      {state.status === 'loading' ? <GroupSkeleton /> : null}

      {state.status === 'ready'
        ? COLLECTIONS.map((group, index) => (
            <CollectionGroup
              key={group.id}
              group={group}
              itemsById={itemsById}
              priority={index === 0}
              locale={locale}
            />
          ))
        : null}

      <section className="vl-allsites-entry">
        <a className="vl-allsites-link" href="#/sites">
          {t('allSites')} <Num value={counts.approvedEntries} /><span aria-hidden="true"> →</span>
        </a>
        <p className="vl-allsites-note">
          {t('allSitesSort')}
        </p>
      </section>
    </div>
  )
}

/* 一组 = 标题 + 一句说明 + 一排卡片。成员在语料里缺席就直接不渲染它，
 * 整组一个都没剩下就整组不出现——不留空壳。 */
function CollectionGroup({ group, itemsById, priority = false, locale = 'zh' }) {
  const titleId = useId()
  const members = group.entryIds.map((id) => itemsById.get(id)).filter(Boolean)
  if (!members.length) return null
  const title = locale === 'en' && group.titleEn ? group.titleEn : group.titleZh
  const blurb = locale === 'en' && group.blurbEn ? group.blurbEn : group.blurbZh

  return (
    <section className="vl-group" aria-labelledby={titleId}>
      <header className="vl-group-head">
        <h2 className="vl-group-title" id={titleId}>{title}</h2>
        <p className="vl-group-blurb">{blurb}</p>
      </header>
      <div className="vl-group-grid">
        {members.map((item, index) => (
          <SiteCard key={item.entryId} item={item} priority={priority && index < 3} />
        ))}
      </div>
    </section>
  )
}

/* 骨架：灰块，无流光。先占住一组的形状，免得数据到位时整页跳一下。 */
function GroupSkeleton() {
  return (
    <section className="vl-group vl-group--skeleton" aria-hidden="true">
      <header className="vl-group-head">
        <p className="vl-skel vl-skel-title" />
        <p className="vl-skel vl-skel-line is-short" />
      </header>
      <div className="vl-group-grid">
        {[0, 1, 2].map((cell) => (
          <div className="vl-card vl-card--skeleton" key={cell}>
            <span className="vl-skel vl-skel-shot" />
            <span className="vl-skel vl-skel-line" />
            <span className="vl-skel vl-skel-line is-short" />
          </div>
        ))}
      </div>
    </section>
  )
}
