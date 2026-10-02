import { useEffect, useState } from 'react'
import { makeNodeBinder } from '../node.js'

/* 浮层台。
 * 底页固定不动，换的是浮在它上面的那一层。每种浮层除了长相，
 * 还标出它真正的分界：有没有遮罩、抢不抢焦点、点外面关不关、要不要回应。
 */

const OVERLAYS = {
  tooltip: {
    place: 'anchor', backdrop: false, width: 148,
    body: '导出为 JSON',
    behavior: '悬停/聚焦出现 · 不抢焦点 · 不可交互',
  },
  'popover-hint': {
    place: 'anchor', backdrop: false, width: 232,
    title: '同步说明', body: '改动会在 30 秒内推送到你的其他设备。',
    behavior: '不抢焦点 · 不与 auto 浮层互斥',
  },
  'popover-auto': {
    place: 'anchor', backdrop: false, width: 232,
    title: '同步范围', body: '当前工作区的全部成员。',
    actions: ['仅我自己', '全部成员'],
    behavior: '点外面自动关 · Esc 关 · 同层互斥',
  },
  dialog: {
    place: 'center', backdrop: false, width: 340,
    title: '重命名工作区', body: '底页仍然可以滚动和点击。',
    actions: ['取消', '保存'],
    behavior: '非模态 · 无遮罩 · 底页仍可用',
  },
  'dialog-modal': {
    place: 'center', backdrop: true, width: 340,
    title: '重命名工作区', body: '底页被遮罩挡住，焦点锁在这一层里。',
    actions: ['取消', '保存'],
    behavior: '模态 · 焦点陷阱 · 底页惰性',
  },
  alert: {
    place: 'inline', backdrop: false,
    title: '同步已暂停', body: '网络恢复后会自动继续。',
    behavior: '页面内状态条 · 不打断 · 不要求回应',
  },
  alertdialog: {
    place: 'center', backdrop: true, width: 348, tone: 'danger',
    title: '删除工作区？', body: '这一步不可撤销，其中 12 个文件会一并删除。',
    actions: ['取消', '删除'],
    behavior: '模态 · 要求即时回应 · 读屏会打断',
  },
  banner: {
    place: 'top', backdrop: false,
    title: '计划将于 3 天后到期', body: '续费后不影响协作。',
    behavior: '常驻页顶 · 与内容同流 · 可关闭',
  },
  toast: {
    place: 'corner', backdrop: false, width: 268,
    title: '已保存', body: '3 秒后自动消失。',
    behavior: '自动消失 · 不抢焦点 · 不承载决策',
  },
  'search-dialog': {
    place: 'center-top', backdrop: true, width: 420, kind: 'search',
    title: '搜索', placeholder: '搜索文件与成员…',
    rows: ['spec-v3.md', '导航栏命名', '陈以宁'],
    behavior: '模态 · 检索"有什么"',
  },
  'command-palette': {
    place: 'center-top', backdrop: true, width: 420, kind: 'command',
    title: '命令', placeholder: '输入命令…',
    rows: ['新建工作区  ⌘N', '切换深色模式  ⌘D', '导出设计规格  ⌘E'],
    behavior: '模态 · 检索"能做什么"',
  },
  'assistant-modal': {
    place: 'corner', backdrop: false, width: 300, kind: 'assistant',
    title: '助手', body: '要我把这份设置导出成规格吗？',
    actions: ['以后再说', '好'],
    behavior: '常驻角落 · 可折叠 · 不遮挡主任务',
  },
  'feedback-dialog': {
    place: 'center', backdrop: true, width: 348, kind: 'feedback',
    title: '这次改动好用吗？', body: '你的评价只用于改进本页。',
    actions: ['一般', '好用'],
    behavior: '模态 · 可跳过 · 不阻断主流程',
  },
}

export default function OverlayStage({ variant, values, activeNode, hoverNode, onHover, replayKey }) {
  const preset = variant?.render?.preset
  const conf = preset ? OVERLAYS[preset] : null
  const { backdrop = 42, overlayRadius = 12, offset = 8 } = values
  const node = makeNodeBinder({ activeNode, hoverNode, onHover })

  /* toast 会自己消失，重演按钮把它叫回来。 */
  const [gone, setGone] = useState(false)
  useEffect(() => {
    setGone(false)
    if (preset !== 'toast') return undefined
    const timer = setTimeout(() => setGone(true), 3000)
    return () => clearTimeout(timer)
  }, [preset, replayKey])

  const style = {
    '--ov-backdrop': backdrop / 100,
    '--ov-radius': `${overlayRadius}px`,
    '--ov-offset': `${offset}px`,
  }

  const panel = conf && !gone && (
    <div
      className={`ov-panel ov-${conf.place} ${conf.tone === 'danger' ? 'ov-danger' : ''}`}
      style={{ width: conf.width }}
      key={`${preset}-${replayKey}`}
    >
      {conf.title && <b className="ov-title">{conf.title}</b>}
      {conf.kind === 'search' || conf.kind === 'command' ? (
        <>
          <div className="ov-field">{conf.placeholder}</div>
          <ul className="ov-rows">{conf.rows.map((r) => <li key={r}>{r}</li>)}</ul>
        </>
      ) : (
        conf.body && <p className="ov-body">{conf.body}</p>
      )}
      {conf.actions && (
        <div className="ov-actions">
          {conf.actions.map((a, i) => (
            <em key={a} className={i === conf.actions.length - 1 ? 'ov-primary' : ''}>{a}</em>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="ov" style={style}>
      {conf?.place === 'top' && <div className="ov-banner-slot">{panel}</div>}

      <div className="ov-page">
        <div className="ov-page-h">
          <b>账户设置</b>
          <span className="ov-anchor-wrap">
            <span {...node('page.iconbtn', 'ov-iconbtn')} data-zone="non-modal-hints" aria-label="导出">⤓</span>
            {(conf?.place === 'anchor') && panel}
          </span>
        </div>

        {conf?.place === 'inline' && <div className="ov-inline-slot">{panel}</div>}

        <div className="ov-row"><span>工作区名称</span><em>视元</em></div>
        <div className="ov-row"><span>同步</span><em>开</em></div>
        <div className="ov-row"><span>成员</span><em>4 人</em></div>
        <div className="ov-lines">
          {[92, 78, 86, 64].map((w, i) => <i key={i} style={{ width: `${w}%` }} />)}
        </div>
      </div>

      {conf?.backdrop && <div className="ov-backdrop" />}
      {(conf?.place === 'center' || conf?.place === 'center-top' || conf?.place === 'corner') && panel}

      {conf && (
        <div className="ov-behavior">
          <em>行为</em>
          <span>{conf.behavior}</span>
        </div>
      )}
    </div>
  )
}
