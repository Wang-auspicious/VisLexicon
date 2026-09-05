import { useEffect, useMemo, useState } from 'react'
import { makeNodeBinder } from '../node.js'

/* 文字与排版工坊舞台 (Typography & Kinetic Text)
 * 深度融合排版学标尺、艺术字材质（80s金属镀铬、活版压凹、流光）与时间动力学。
 * 支持用户自定义标本语句、双语字形解剖与字体族切换。
 */

const PRESETS = [
  { label: 'Kinetics', text: 'Typographic Kinetics' },
  { label: '万物皆有形', text: '万物皆有其形 · 视觉即修辞' },
  { label: 'Pangram', text: 'Sphinx of black quartz, judge my vow' },
  { label: 'Glyph Ag', text: 'Aa Bb Gg Qq 89' },
]

const FONTS = [
  { id: 'sans', label: 'Sans 无衬线', style: 'var(--display)' },
  { id: 'serif', label: 'Serif 衬线', style: 'var(--serif)' },
  { id: 'mono', label: 'Mono 等宽', style: 'var(--mono)' },
]

const ALT_TEXT = 'FORM FOLLOWS FUNCTION'

const PER_CHAR = new Set(['typewriter', 'streaming', 'fade', 'blur', 'morph', 'tumble'])

export default function TextRevealStage({
  stage,
  variant,
  values,
  activeNode,
  hoverNode,
  onHover,
  replayKey,
}) {
  const preset = variant?.render?.preset || 'idle'
  const defaultText = stage.specimen?.text || 'Typographic Kinetics'
  const [customText, setCustomText] = useState('Typographic Kinetics')
  const [selectedFont, setSelectedFont] = useState('sans')
  const [isEditing, setIsEditing] = useState(false)

  const {
    stagger = 40,
    duration = 620,
    fontSize = 64,
    travel = 18,
    letterSpacing = 0,
    baselineGuide = false,
  } = values

  const node = makeNodeBinder({ activeNode, hoverNode, onHover })
  const showGuides = baselineGuide || activeNode === 'typo.metrics' || hoverNode === 'typo.metrics'

  const [swapped, setSwapped] = useState(false)
  useEffect(() => {
    if (preset !== 'crossfade' && preset !== 'morph') return undefined
    setSwapped(false)
    const timer = setInterval(() => setSwapped((v) => !v), Math.max(1000, duration * 2.2))
    return () => clearInterval(timer)
  }, [preset, duration, replayKey])

  const currentFont = FONTS.find((f) => f.id === selectedFont)?.style || 'var(--display)'
  const text = customText || defaultText
  const shown = (preset === 'crossfade' || preset === 'morph') && swapped ? ALT_TEXT : text
  const chars = useMemo(() => Array.from(shown), [shown])

  const style = {
    '--tr-dur': `${duration}ms`,
    '--tr-stagger': `${stagger}ms`,
    '--tr-size': `${fontSize}px`,
    '--tr-travel': `${travel}px`,
    '--tr-spacing': `${letterSpacing}px`,
    '--tr-font': currentFont,
  }

  /* 排版基线与度量标尺覆盖层 */
  const guideLines = showGuides && (
    <div {...node('typo.metrics', 'tr-metrics-overlay')} aria-hidden="true">
      <div className="tr-guide tr-guide-cap">
        <span className="tr-guide-badge">Cap Height</span>
        <em className="tr-guide-val x-mono">{Math.round(fontSize * 0.72)}px</em>
      </div>
      <div className="tr-guide tr-guide-x">
        <span className="tr-guide-badge">x-Height</span>
        <em className="tr-guide-val x-mono">{Math.round(fontSize * 0.52)}px</em>
      </div>
      <div className="tr-guide tr-guide-base">
        <span className="tr-guide-badge">Baseline</span>
        <em className="tr-guide-val x-mono">0.0</em>
      </div>
      <div className="tr-guide tr-guide-desc">
        <span className="tr-guide-badge">Descender</span>
        <em className="tr-guide-val x-mono">-{Math.round(fontSize * 0.22)}px</em>
      </div>
    </div>
  )

  /* 标本快捷微调坞 */
  const specimenToolbar = (
    <div className="tr-specimen-toolbar">
      <div className="tr-preset-chips">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            className={`tr-chip-btn ${customText === p.text ? 'on' : ''}`}
            onClick={() => setCustomText(p.text)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="tr-font-chips">
        {FONTS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`tr-font-btn ${selectedFont === f.id ? 'on' : ''}`}
            onClick={() => setSelectedFont(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  )

  const renderContent = () => {
    if (preset === 'idle') {
      return (
        <div className="tr-specimen-wrap">
          {guideLines}
          {isEditing ? (
            <input
              type="text"
              className="tr-specimen-input"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              onBlur={() => setIsEditing(false)}
              autoFocus
            />
          ) : (
            <p
              className="tr-line tr-idle"
              onClick={() => setIsEditing(true)}
              title="点击编辑自定义测试文本"
            >
              {text}
            </p>
          )}
        </div>
      )
    }

    if (preset === 'chrome') {
      return (
        <div className="tr-specimen-wrap" key={`${preset}-${replayKey}-${text}`}>
          {guideLines}
          <p className="tr-line tr-chrome" data-text={text}>{text}</p>
        </div>
      )
    }

    if (preset === 'deboss') {
      return (
        <div className="tr-specimen-wrap" key={`${preset}-${replayKey}-${text}`}>
          {guideLines}
          <p className="tr-line tr-deboss">{text}</p>
        </div>
      )
    }

    if (preset === 'mask') {
      return (
        <div className="tr-specimen-wrap" key={`${preset}-${replayKey}-${text}`}>
          {guideLines}
          <p className="tr-line tr-mask">{text}</p>
        </div>
      )
    }

    if (preset === 'scrub') {
      return (
        <div className="tr-specimen-wrap" key={`${preset}-${replayKey}-${text}`}>
          {guideLines}
          <p className="tr-line tr-scrub">{text}</p>
        </div>
      )
    }

    if (preset === 'shimmer') {
      return (
        <div className="tr-specimen-wrap" key={`${preset}-${replayKey}-${text}`}>
          {guideLines}
          <p className="tr-line tr-shimmer" data-text={text}>{text}</p>
        </div>
      )
    }

    if (preset === 'marquee') {
      return (
        <div className="tr-specimen-wrap">
          {guideLines}
          <div className="tr-marquee-vp">
            <div className="tr-marquee-track">
              {[0, 1, 2].map((copy) => (
                <span key={copy} className="tr-line tr-marquee-item" aria-hidden={copy > 0}>
                  {text}&nbsp;·&nbsp;
                </span>
              ))}
            </div>
          </div>
        </div>
      )
    }

    if (preset === 'crossfade') {
      return (
        <div className="tr-specimen-wrap">
          {guideLines}
          <div className="tr-stack">
            <p className={`tr-line tr-cross ${swapped ? '' : 'on'}`}>{text}</p>
            <p className={`tr-line tr-cross ${swapped ? 'on' : ''}`}>{ALT_TEXT}</p>
          </div>
        </div>
      )
    }

    if (!PER_CHAR.has(preset)) {
      return (
        <div className="tr-specimen-wrap">
          {guideLines}
          <p className="tr-line">{text}</p>
        </div>
      )
    }

    return (
      <div className="tr-specimen-wrap" key={`${preset}-${replayKey}-${shown}`}>
        {guideLines}
        <p className={`tr-line tr-chars tr-${preset}`}>
          {chars.map((ch, i) => (
            <span
              key={`${ch}-${i}`}
              className="tr-ch"
              style={{
                '--tr-delay': preset === 'typewriter'
                  ? `${i * 55}ms`
                  : `${i * stagger}ms`,
              }}
            >
              {ch}
            </span>
          ))}
          {preset === 'typewriter' && <span className="tr-caret" aria-hidden="true" />}
        </p>
      </div>
    )
  }

  return (
    <div className="tr" style={style}>
      {specimenToolbar}
      <div className="tr-stage-canvas">
        {renderContent()}
      </div>
      <p className="tr-hint">
        {preset === 'idle'
          ? '💡 点击文本可直接修改输入内容，或通过上方预设快速测试不同排版语料与字族。'
          : `正在演示：${variant?.displayZh || '文字动效'} · 可在下方微调参数或点击右上角 ↺ 重演。`}
      </p>
    </div>
  )
}
