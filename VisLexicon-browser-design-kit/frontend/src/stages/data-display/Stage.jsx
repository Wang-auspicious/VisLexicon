import { makeNodeBinder } from '../node.js'

/* 数据展示台。四种表格类部件刻意摆在同一屏里对照，
 * 因为它们的差别不在长相而在交互模型，分开看永远分不清。
 */

const ROWS = [
  ['构建 #482', '成功', '1,284'],
  ['构建 #481', '失败', '318'],
  ['构建 #480', '成功', '9,047'],
]

export default function DataDisplayStage({ stage, values, activeNode, hoverNode, onHover }) {
  const { rowHeight = 30, cardGap = 14, radius = 10 } = values
  const node = makeNodeBinder({ activeNode, hoverNode, onHover })

  const style = {
    '--dd-row': `${rowHeight}px`,
    '--dd-gap': `${cardGap}px`,
    '--dd-radius': `${radius}px`,
  }

  return (
    <div className="dd" style={style}>
      <div className="dd-head"><b>{stage.specimen.title}</b></div>

      <div className="dd-grid">
        <div className="dd-card dd-span2">
          <span className="dd-card-h">可交互数据表</span>
          <div {...node('data.table', 'dd-table')}>
            <div className="dd-tr dd-th"><span>运行</span><span>状态</span><span {...node('data.numcol', 'dd-num')}>耗时 ms ⌃</span></div>
            {ROWS.map((r) => (
              <div key={r[0]} className="dd-tr">
                <span>{r[0]}</span><span>{r[1]}</span><span className="dd-num-cell">{r[2]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dd-card">
          <span className="dd-card-h">静态表格</span>
          <table {...node('data.table.static', 'dd-static')}>
            <tbody>
              <tr><td>区域</td><td>东京</td></tr>
              <tr><td>副本</td><td>3</td></tr>
            </tbody>
          </table>
        </div>

        <div className="dd-card">
          <span className="dd-card-h">Grid</span>
          <div {...node('data.grid', 'dd-cells')}>
            {['A1', 'B1', 'C1', 'A2', 'B2', 'C2'].map((c, i) => (
              <i key={c} className={i === 1 ? 'on' : ''}>{c}</i>
            ))}
          </div>
        </div>

        <div className="dd-card">
          <span className="dd-card-h">树形表格</span>
          <div {...node('data.treegrid', 'dd-treegrid')}>
            <div className="dd-tg-row"><i>▾</i><span>api</span><em>4</em></div>
            <div className="dd-tg-row dd-tg-sub"><span>auth.ts</span><em>1</em></div>
            <div className="dd-tg-row dd-tg-sub"><span>index.ts</span><em>3</em></div>
          </div>
        </div>

        <div className="dd-card">
          <span className="dd-card-h">列表 / 列表选择框</span>
          <ul {...node('data.list', 'dd-list')}>
            <li>东京</li><li>法兰克福</li>
          </ul>
          <ul {...node('data.listbox', 'dd-listbox')}>
            <li className="on">东京</li><li>法兰克福</li>
          </ul>
        </div>

        <div className="dd-card">
          <span className="dd-card-h">树 / 文件树</span>
          <div {...node('data.tree', 'dd-tree')}>
            <div>▾ 组织</div><div className="dd-in">团队</div><div className="dd-in">成员</div>
          </div>
          <div {...node('data.filetree', 'dd-tree dd-filetree')}>
            <div>▾ src</div><div className="dd-in">App.jsx</div>
          </div>
        </div>

        <div className="dd-card">
          <span className="dd-card-h">标记</span>
          <div className="dd-chips">
            <span {...node('data.avatar', 'dd-avatar')}>宁</span>
            <span {...node('data.badge', 'dd-badge')}>12</span>
            <span {...node('data.badge.disclosure', 'dd-disclosure')}>▾ 3 项</span>
            <span {...node('data.tag', 'dd-tag')}>生产 ×</span>
          </div>
          <div {...node('data.timeline', 'dd-timeline')}>
            <div><i />提交</div><div><i />构建</div><div><i />发布</div>
          </div>
        </div>

        <div className="dd-card">
          <span className="dd-card-h">图</span>
          <div {...node('data.chart', 'dd-chart')}>
            {[38, 62, 44, 80, 55, 71].map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}
          </div>
          <div {...node('data.activity', 'dd-activity')}>
            {Array.from({ length: 35 }, (_, i) => <i key={i} className={`lv${i % 4}`} />)}
          </div>
        </div>

        <div className="dd-card">
          <span className="dd-card-h">热力 / 流程</span>
          <div {...node('data.heat', 'dd-heat')}>
            {Array.from({ length: 16 }, (_, i) => <i key={i} className={`lv${(i * 5) % 4}`} />)}
          </div>
          <div {...node('data.flow', 'dd-flow')}>
            <em>拉取</em><i>→</i><em>构建</em><i>→</i><em>发布</em>
          </div>
        </div>

        <div className="dd-card dd-span2">
          <span className="dd-card-h">代码块</span>
          <pre {...node('data.code', 'dd-code')}><code>{'const stage = registry.get("data-display")\nstage.claims.filter((c) => c.slot === "hotspot")'}</code></pre>
        </div>
      </div>
    </div>
  )
}
