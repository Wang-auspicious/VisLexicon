import { makeNodeBinder } from '../node.js'

/* 导航台。一整屏应用外壳，把各层级的导航部件按它们真实的位置摆出来——
 * 层级关系是这一族最难口头讲清的东西，位置本身就是解释。
 * journey 变体切换成一条完整的服务路径，说明"导航"也可以指流程而不是部件。
 */

const STEPS = ['选择工作区', '确认权限', '填写用途', '提交', '结果']

export default function NavigationStage({ stage, variant, values, activeNode, hoverNode, onHover }) {
  const preset = variant?.render?.preset || 'shell'
  const { railWidth = 168, navGap = 14, radius = 8 } = values
  const node = makeNodeBinder({ activeNode, hoverNode, onHover })

  const style = {
    '--nv-rail': `${railWidth}px`,
    '--nv-gap': `${navGap}px`,
    '--nv-radius': `${radius}px`,
  }

  if (preset === 'journey') {
    return (
      <div className="nv nv-journey" style={style}>
        <p className="nv-journey-h">服务导航是一条路径，不是一个部件。下面每一格都可能由不同的导航部件承载。</p>
        <div className="nv-steps">
          {STEPS.map((s, i) => (
            <div key={s} className={`nv-step ${i === 2 ? 'on' : ''}`}>
              <i>{i + 1}</i>
              <span>{s}</span>
            </div>
          ))}
        </div>
        <div className="nv-branch">
          <em>分支：没有权限 → 申请页</em>
          <em>返回：回到上一层级，不是回到上一页</em>
        </div>
      </div>
    )
  }

  return (
    <div className="nv" style={style}>
      <span {...node('nav.skip', 'nv-skip')}>跳转到主内容</span>

      <div {...node('nav.service', 'nv-service')}>
        <b>视元</b>
        <span>控制台</span>
        <span>文档</span>
        <span className="nv-spacer" />
        <span {...node('nav.lang', 'nv-lang')}>中文 / EN</span>
      </div>

      <div className="nv-body">
        <aside className="nv-rail">
          <div {...node('nav.menubar', 'nv-menubar')}>
            <i className="on">概览</i><i>运行</i><i>成员</i><i>设置</i>
          </div>
          <div {...node('nav.anchor', 'nv-anchor')}>
            <em>本页</em><i>· 基本信息</i><i>· 配额</i><i>· 危险操作</i>
          </div>
        </aside>

        <main className="nv-main">
          <div {...node('nav.breadcrumb', 'nv-breadcrumb')}>
            <span>组织</span><i>/</i><span>视元</span><i>/</i><span>运行</span>
          </div>

          <div className="nv-toprow">
            <span {...node('nav.back', 'nv-back')}>← 返回运行列表</span>
            <span className="nv-spacer" />
            <div {...node('nav.toolbar', 'nv-toolbar')}>
              <i>⟳</i><i>⤓</i><i>⧉</i>
            </div>
            <span {...node('nav.menubtn', 'nv-menubtn')}>更多 ⌄</span>
            <div {...node('nav.menu', 'nv-menu')}>
              <i>重新运行</i><i>下载日志</i><i className="nv-danger">删除</i>
            </div>
          </div>

          <div {...node('nav.tabs', 'nv-tabs')}>
            <i className="on">概要</i><i>日志</i><i>产物</i>
          </div>

          <div className="nv-content">
            {[94, 72, 88, 61, 79].map((w, i) => <i key={i} style={{ width: `${w}%` }} />)}
          </div>

          <div {...node('nav.pagination', 'nv-pagination')}>
            <i>‹</i><i className="on">1</i><i>2</i><i>3</i><i>…</i><i>9</i><i>›</i>
          </div>
        </main>
      </div>

      <span {...node('nav.scrollbtn', 'nv-scrollbtn')} aria-label="回到顶部">↑</span>
      <p className="nv-note x-mono">{stage.specimen.app} · 悬停任意一块看它在哪一层</p>
    </div>
  )
}
