/* ============ 参数侧板（方案 §5.3 第 1–3 条） ============
 * 三件事和旧的底部横条不同：
 *   1. 贴边纵向面板，每控件一行 —— 横条容量上限 3–4，而指针台有 26 个控件；
 *      纵向面板还天然容得下 enum 下拉与 boolean 开关（旧横条里三台全是滑块）。
 *   2. param 与 knob 视觉分开 —— param 有正名，可点进术语面板；knob 没有，
 *      明确标「无正名」且不可路由。项目把「不伪造术语 id」当原则，界面就得让它可见。
 *   3. 每个连续量给预设档位（MDN Try it 范式）—— 清单里写了预设就用清单的，
 *      没写就给 最小 / 默认 / 最大 三档，标签直接是数值本身，不替它编名字。
 */

function presetsFor(spec) {
  if (Array.isArray(spec.presets) && spec.presets.length) {
    return spec.presets.map((preset) => ({
      key: String(preset.value),
      labelZh: preset.labelZh ?? `${preset.value}${spec.unit || ''}`,
      value: preset.value,
    }))
  }
  if ((spec.type || 'range') !== 'range') return []
  const unit = spec.unit || ''
  const raw = [
    { key: 'min', labelZh: `${spec.min}${unit}`, value: spec.min },
    { key: 'default', labelZh: `${spec.default}${unit}`, value: spec.default },
    { key: 'max', labelZh: `${spec.max}${unit}`, value: spec.max },
  ]
  /* 默认值恰好落在端点时不重复出一档。 */
  const seen = new Set()
  return raw.filter((preset) => {
    if (seen.has(preset.value)) return false
    seen.add(preset.value)
    return true
  })
}

function readout(spec, value) {
  const type = spec.type || 'range'
  if (type === 'boolean') return value ? '开' : '关'
  return `${value}${spec.unit || ''}`
}

function Control({ spec, value, onChange, labelledBy }) {
  const type = spec.type || 'range'
  if (type === 'boolean') {
    return (
      <span className="axc-switchwrap">
        <input
          type="checkbox"
          className="axc-switch"
          checked={Boolean(value)}
          aria-labelledby={labelledBy}
          onChange={(event) => onChange(event.target.checked)}
        />
      </span>
    )
  }
  if (type === 'enum') {
    return (
      <select
        className="axc-select"
        value={value}
        aria-labelledby={labelledBy}
        onChange={(event) => onChange(event.target.value)}
      >
        {spec.choices.map((choice) => <option key={choice} value={choice}>{choice}</option>)}
      </select>
    )
  }
  return (
    <input
      type="range"
      className="axc-range"
      min={spec.min}
      max={spec.max}
      step={spec.step}
      value={value}
      aria-labelledby={labelledBy}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  )
}

function Row({ id, spec, value, onChange, head, hint }) {
  const presets = presetsFor(spec)
  return (
    <li className="axc-row">
      <div className="axc-head">
        {head}
        <em className="axc-value x-mono">{readout(spec, value)}</em>
      </div>
      {hint}
      <Control spec={spec} value={value} onChange={onChange} labelledBy={id} />
      {presets.length > 0 && (
        <div className="axc-presets" role="group" aria-labelledby={id}>
          {presets.map((preset) => (
            <button
              key={preset.key}
              type="button"
              className={`axc-preset ${value === preset.value ? 'on' : ''}`}
              onClick={() => onChange(preset.value)}
            >
              {preset.labelZh}
            </button>
          ))}
        </div>
      )}
    </li>
  )
}

export default function ParamPanel({
  params, knobs, values, onChange, onSelectTerm, selectedTermId, idPrefix = 'axc',
}) {
  if (!params.length && !knobs.length) {
    return <p className="axc-empty">这一台没有可调参数，也没有微调旋钮。</p>
  }

  return (
    <div className="axc">
      <section className="axc-group">
        <h3 className="axc-group-h">
          术语参数
          <em className="x-mono">{params.length}</em>
        </h3>
        <p className="axc-group-sub">
          每一条都有正名，是图鉴里的一条术语。点名字进术语面板。
        </p>
        {params.length ? (
          <ul className="axc-list">
            {params.map((item) => {
              const id = `${idPrefix}-p-${item.param.key}`
              return (
                <Row
                  key={item.termId}
                  id={id}
                  spec={item.param}
                  value={values[item.param.key] ?? item.param.default}
                  onChange={(next) => onChange(item.param.key, next)}
                  head={(
                    <button
                      type="button"
                      id={id}
                      className={`axc-name ${item.termId === selectedTermId ? 'on' : ''}`}
                      onClick={() => onSelectTerm(item.termId)}
                    >
                      <em className="axc-n x-mono">{item.n}</em>
                      {item.param.label}
                      <span className="axc-termen x-mono">{item.termEn}</span>
                    </button>
                  )}
                />
              )
            })}
          </ul>
        ) : (
          <p className="axc-empty">本台没有带正名的参数。</p>
        )}
      </section>

      <section className="axc-group axc-knobs">
        <h3 className="axc-group-h">
          微调
          <em className="x-mono">{knobs.length}</em>
          <span className="axc-noname">无正名</span>
        </h3>
        <p className="axc-group-sub">
          这些只是把标本调得好看一点的旋钮，行业里没有对应术语，我们也不替它们编一个，所以点不进术语面板。
        </p>
        {knobs.length ? (
          <ul className="axc-list">
            {knobs.map((knob) => {
              const id = `${idPrefix}-k-${knob.key}`
              return (
                <Row
                  key={knob.key}
                  id={id}
                  spec={knob}
                  value={values[knob.key] ?? knob.default}
                  onChange={(next) => onChange(knob.key, next)}
                  head={<span className="axc-name axc-name-plain" id={id}>{knob.label}</span>}
                />
              )
            })}
          </ul>
        ) : (
          <p className="axc-empty">本台没有微调旋钮。</p>
        )}
      </section>
    </div>
  )
}
