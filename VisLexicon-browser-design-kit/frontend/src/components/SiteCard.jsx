import { useState } from 'react'
import { aspectFor, templateFor } from '../lib/site-card-template.js'
import { valueLabel } from '../lib/facet-chips.js'
import { formatCheckedAt, isModifiedClick, licenseValues, navigateTo } from '../lib/site-browser.js'
import { useT, useLocale } from '../i18n.js'
import { voiceText } from '../lib/entry-voice.js'

/* 域名首字母块：主图缺失或加载失败时的替身。
 * WP-E 会把同名组件提到 components/DomainMark.jsx，本轮两个包各留一份最小实现，
 * 波次结束后合并——不互相 import 尚不存在的文件（波次 3 接口约定）。 */
function DomainMark({ label }) {
  const initial = String(label ?? '').replace(/^www\./, '').trim().charAt(0).toUpperCase()
  return (
    <span className="vl-domain-mark" aria-hidden="true">
      {initial || '·'}
    </span>
  )
}

function CardShot({ item, aspect, priority }) {
  const [failed, setFailed] = useState(false)
  const shot = item?.shot
  const showImage = Boolean(shot?.src) && !failed
  return (
    <span className="vl-card-shot" style={{ aspectRatio: aspect }}>
      {showImage ? (
        <img
          src={shot.src}
          alt={shot.alt ?? ''}
          width={shot.width || undefined}
          height={shot.height || undefined}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <DomainMark label={item?.domain ?? item?.name} />
      )}
    </span>
  )
}

/** 许可微标。unknown 用 caution 色标出来——空值本身是差异化，不是缺陷。 */
export function LicenseMark({ item }) {
  const locale = useLocale()
  const values = licenseValues(item)
  const unknown = values.includes('unknown')
  const code = values.some((value) => value !== 'custom' && value !== 'unknown')
  return (
    <span className={`vl-license${unknown ? ' is-unknown' : ''}${code ? ' is-code' : ''}`}>
      {values.map((value) => valueLabel(value, locale)).join(' · ')}
    </span>
  )
}

/** 核验于：日期用等宽，前面一个方点——绿色全站只表示「已核验」这一件事。 */
export function CheckedAt({ item, prefix = true }) {
  const t = useT()
  const date = formatCheckedAt(item?.checkedAt)
  if (!date) return null
  return (
    <span className="vl-checked">
      <span className="vl-checked-dot" aria-hidden="true" />
      {prefix ? <span className="vl-checked-label">{t('checked')}</span> : null}
      <time className="x-mono" dateTime={date}>{date}</time>
    </span>
  )
}

/** 一句「拿走什么」。没写就说没写，不用简介截断冒充（数据契约 takeawayZh 一栏）。 */
export function Takeaway({ item }) {
  const t = useT()
  const locale = useLocale()
  const voiced = voiceText(item?.entryId, 'lede', locale)
  const text = voiced || (locale === 'zh' && typeof item?.takeawayZh === 'string' ? item.takeawayZh.trim() : '')
  if (text) return <span className="vl-take">{text}</span>
  return (
    <span className="vl-take is-unwritten">
      <span className="vl-unwritten">{t('unwritten')}</span>
    </span>
  )
}

/**
 * 站点卡。卡上恰好五项：主图 / 名称 / 一句拿走什么 / 权利微标 / 核验于。
 * 不上卡：技术栈 pill、主题跑马灯、分类标签、计数徽章（方案 §4.2）。
 *
 * 策展首页的分组和「全部站点」用的是同一张卡：整卡是一个 <a>（拉伸链接），
 * 右下角另有「去源站」，两个出口都画出来，不靠隐藏手势（方案 §4.5）。
 */
export default function SiteCard({ item, priority = false }) {
  const t = useT()
  if (!item) return null
  const href = `#/site/${item.entryId}`
  const aspect = aspectFor(item)

  const onClick = (event) => {
    if (isModifiedClick(event)) return
    event.preventDefault()
    navigateTo(href)
  }

  return (
    <article className="vl-card vl-card--grid" data-template={templateFor(item)}>
      <CardShot item={item} aspect={aspect} priority={priority} />
      <h3 className="vl-card-name">
        <a className="vl-card-link" href={href} onClick={onClick}>
          {item.name}
        </a>
      </h3>
      <Takeaway item={item} />
      <div className="vl-card-foot">
        <LicenseMark item={item} />
        <CheckedAt item={item} prefix={false} />
        {item.homepage ? (
          <a
            className="vl-card-source"
            href={item.homepage}
            target="_blank"
            rel="noreferrer"
          >
            {t('visitCard')}<span aria-hidden="true"> ↗</span>
            <span className="sr-only">（{item.name} {t('visitCardSr')}）</span>
          </a>
        ) : null}
      </div>
    </article>
  )
}
