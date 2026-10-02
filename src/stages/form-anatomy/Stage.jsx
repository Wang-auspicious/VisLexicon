import { makeNodeBinder } from '../node.js'

/* 表单解剖台。与 Agent 界面台同构：每个控件过 node()，悬停报名、点术语描边。
 * 刻意把单个控件和控件组分开摆（checkbox / checkboxes、radio / radio group），
 * 因为它们在界面上和键盘行为上都是不同的东西。
 */
export default function FormAnatomyStage({ stage, values, activeNode, hoverNode, onHover }) {
  const { fieldGap = 16, controlRadius = 9, controlHeight = 36 } = values
  const node = makeNodeBinder({ activeNode, hoverNode, onHover })

  const style = {
    '--fm-gap': `${fieldGap}px`,
    '--fm-radius': `${controlRadius}px`,
    '--fm-h': `${controlHeight}px`,
  }

  return (
    <div className="fm" style={style}>
      <div className="fm-head">
        <b>{stage.specimen.title}</b>
        <span {...node('form.search', 'fm-search')} data-zone="text-entry">⌕ 搜索模板</span>
      </div>

      <div className="fm-cols">
        <div className="fm-col">
          <label className="fm-field">
            <span className="fm-label">工作区名称</span>
            <span {...node('form.text', 'fm-control')} data-zone="text-entry">视元</span>
          </label>

          <label className="fm-field">
            <span className="fm-label">访问口令</span>
            <span {...node('form.password', 'fm-control')} data-zone="text-entry">••••••••</span>
          </label>

          <div className="fm-pair">
            <label className="fm-field">
              <span className="fm-label">席位</span>
              <span {...node('form.number', 'fm-control fm-narrow')} data-zone="text-entry">4 <i>⌃⌄</i></span>
            </label>
            <label className="fm-field">
              <span className="fm-label">启用日期</span>
              <span {...node('form.date', 'fm-control fm-narrow')} data-zone="text-entry">2026-09-03</span>
            </label>
          </div>

          <div {...node('form.date.picker', 'fm-picker')} data-zone="text-entry">
            <div className="fm-picker-h">2026 年 9 月</div>
            <div className="fm-picker-grid">
              {Array.from({ length: 21 }, (_, i) => (
                <i key={i} className={i === 2 ? 'on' : ''}>{i + 1}</i>
              ))}
            </div>
          </div>

          <label className="fm-field">
            <span className="fm-label">套餐</span>
            <span {...node('form.select', 'fm-control')} data-zone="choice-pickers">标准版 ⌄</span>
          </label>

          <div className="fm-field">
            <span className="fm-label">区域</span>
            <div {...node('form.dropdown', 'fm-dropdown')} data-zone="choice-pickers">
              <span className="fm-dropdown-v">亚太 · 东京 ⌄</span>
              <div className="fm-dropdown-list"><i className="on">亚太 · 东京</i><i>欧洲 · 法兰克福</i></div>
            </div>
          </div>

          <label className="fm-field">
            <span className="fm-label">负责人</span>
            <span {...node('form.combobox', 'fm-control')} data-zone="choice-pickers">陈<i className="fm-cb-caret">|</i><em className="fm-cb-hint">陈以宁</em></span>
          </label>
        </div>

        <div className="fm-col">
          <fieldset {...node('form.fieldset', 'fm-fieldset')} data-zone="submit-feedback">
            <legend>通知方式</legend>

            <div {...node('form.checkbox.group', 'fm-group')} data-zone="multi-single-select">
              <label {...node('form.checkbox', 'fm-check')} data-zone="multi-single-select"><i className="on" />邮件</label>
              <label className="fm-check"><i />站内信</label>
            </div>

            <div {...node('form.radio.group', 'fm-group')} data-zone="multi-single-select">
              <label {...node('form.radio', 'fm-radio')} data-zone="multi-single-select"><i className="on" />实时</label>
              <label className="fm-radio"><i />每日汇总</label>
            </div>
          </fieldset>

          <div className="fm-field fm-inline">
            <span className="fm-label">公开工作区</span>
            <span {...node('form.switch', 'fm-switch')} data-zone="multi-single-select"><i /></span>
          </div>

          <div className="fm-field">
            <span className="fm-label">并发上限</span>
            <span {...node('form.slider', 'fm-slider')} data-zone="range-longform"><i className="fm-track" /><i className="fm-thumb" /></span>
          </div>

          <div className="fm-field">
            <span className="fm-label">活跃时段</span>
            <span {...node('form.slider.multi', 'fm-slider')} data-zone="range-longform">
              <i className="fm-track" /><i className="fm-thumb" /><i className="fm-thumb fm-thumb-b" />
            </span>
          </div>

          <div className="fm-field">
            <span className="fm-label">简介</span>
            <span {...node('form.textarea', 'fm-textarea')} data-zone="range-longform">给团队的一句话说明。</span>
            <span {...node('form.charcount', 'fm-charcount')} data-zone="range-longform">还可输入 88 字</span>
          </div>

          <div {...node('form.upload', 'fm-upload')} data-zone="submit-feedback">
            <b>拖拽文件到此</b>
            <span>或点击选择 · 单个不超过 20 MB</span>
          </div>

          <p {...node('form.error', 'fm-error')} data-zone="submit-feedback">工作区名称已被占用，换一个。</p>
        </div>
      </div>
    </div>
  )
}
