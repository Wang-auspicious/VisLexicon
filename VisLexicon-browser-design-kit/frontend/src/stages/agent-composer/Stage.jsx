import { useEffect, useState } from 'react'
import { makeNodeBinder } from '../node.js'

/* 旗舰级 Agent 智能体交互界面舞台
 * 彻底优化自适应布局，消除拥挤断行与折叠变形：
 * - 侧栏自适应伸缩（图标坞 / 展开列表）
 * - 思考流光、思维链步骤与工具瀑布流严格防挤压布局
 * - Composer HUD 浮动吸底卡片
 * - 协同产物画布自适应分栏
 */

const SAMPLE_STREAM = '已根据您的设计规范完成三步拆解：\n1. 采用 OKLCH 感知均匀色盘重构表面对比阶梯；\n2. 为输入区注入 0.5px 发丝级微光描边与平滑连续圆角；\n3. 激活右侧独立产物协同画布，支持即时代码审查。'
const THREADS = [
  { id: 't1', title: 'Agent UI 视元重塑', time: '刚刚', active: true, icon: '✦' },
  { id: 't2', title: 'OKLCH 调色板校准', time: '10m', active: false, icon: '🎨' },
  { id: 't3', title: 'Spring 弹簧物理参数', time: '1h', active: false, icon: '⚡' },
  { id: 't4', title: 'Bento Grid 响应式断点', time: '昨天', active: false, icon: '🍱' },
]

export default function AgentComposerStage({ stage, variant, values, activeNode, hoverNode, onHover, replayKey }) {
  const preset = variant?.render?.preset || 'desktop'
  const {
    streamMs = 70,
    composerInset = 18,
    radius = 14,
    gap = 16,
    glowIntensity = 75,
    showArtifact = true,
  } = values

  const node = makeNodeBinder({ activeNode, hoverNode, onHover })
  const [streamProgress, setStreamProgress] = useState(0)
  const [thinkingOpen, setThinkingOpen] = useState(true)
  const [artifactTab, setArtifactTab] = useState('preview')
  const [sidebarExpanded, setSidebarExpanded] = useState(false)

  useEffect(() => {
    setStreamProgress(0)
    let idx = 0
    const interval = Math.max(16, streamMs)
    const timer = setInterval(() => {
      idx += 2
      setStreamProgress(idx)
      if (idx >= SAMPLE_STREAM.length) clearInterval(timer)
    }, interval)
    return () => clearInterval(timer)
  }, [streamMs, replayKey, preset])

  const stageStyle = {
    '--ac-inset': `${composerInset}px`,
    '--ac-radius': `${radius}px`,
    '--ac-gap': `${gap}px`,
    '--ac-glow': `${glowIntensity / 100}`,
  }

  /* 提示词输入区 (Composer HUD Surface) */
  const composerElement = (
    <div {...node('composer.root', 'ac-composer ac-composer-surface')}>
      {preset !== 'mobile' && (
        <div {...node('composer.suggestions', 'ac-suggestions-bar')}>
          {['采纳全部修改', '切换深色模式', '导出生产代码'].map((s) => (
            <button key={s} type="button" className="ac-suggestion-chip">
              <span className="ac-chip-spark">✦</span> {s}
            </button>
          ))}
        </div>
      )}

      <div className="ac-composer-card">
        {/* 附件与上下文指示胶囊 */}
        <div className="ac-composer-topline">
          <div {...node('composer.attachment', 'ac-attachment-pill')}>
            <span className="ac-file-icon">◧</span>
            <span className="ac-file-name">design-tokens.json</span>
            <span className="ac-file-size">4.2 KB</span>
            <b className="ac-file-remove" aria-hidden="true">×</b>
          </div>

          <div {...node('composer.tokens', 'ac-token-meter')}>
            <span className="ac-token-bar"><i style={{ width: '42%' }} /></span>
            <em>14.2k / 200k tokens</em>
          </div>
        </div>

        {/* 核心提示词输入体 */}
        <textarea {...node('composer.input', 'ac-prompt-textarea')} placeholder="输入指令、粘贴设计图，或键入 / 唤起智能体指令库…" defaultValue={preset === 'editing' ? '请帮我把 Composer 输入区的内阴影调柔和，并为思维链添加微光呼吸动效' : ''} />

        {/* 底部工具栏 */}
        <div {...node('composer.toolbar', 'ac-composer-dock')}>
          <div {...node('composer.model', 'ac-model-capsule')}>
            <span className="ac-model-dot" />
            <span className="ac-model-name">{stage.specimen.model}</span>
            <span className="ac-model-caret">▾</span>
          </div>

          <div className="ac-dock-spacer" />

          {preset !== 'mobile' && (
            <button {...node('composer.mic', 'ac-icon-button')} type="button" aria-label="语音指令">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
            </button>
          )}

          <button className="ac-send-button" type="button" aria-label="发送指令">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
          </button>
        </div>
      </div>

      {preset === 'editing' && (
        <div className="ac-edit-footer">
          <span className="ac-edit-hint">ESC 取消</span>
          <button type="button" className="ac-btn-ghost">取消</button>
          <button type="button" className="ac-btn-primary">保存并重新生成</button>
        </div>
      )}
    </div>
  )

  return (
    <div className={`ac-stage-root ac-${preset}`} style={stageStyle}>
      {/* 桌面端极简图标/会话侧栏 */}
      {preset !== 'mobile' && (
        <aside
          {...node('shell.sidebar', `ac-sidebar-pane ${sidebarExpanded ? 'expanded' : 'collapsed'}`)}
          onMouseEnter={() => setSidebarExpanded(true)}
          onMouseLeave={() => setSidebarExpanded(false)}
        >
          <div className="ac-side-brand">
            <span className="ac-brand-logo">◈</span>
            {sidebarExpanded && <b>AI Workspace</b>}
          </div>

          <button type="button" className="ac-side-new-btn" title="新建会话">
            <span>＋</span>
            {sidebarExpanded && <span>新建会话</span>}
          </button>

          <div className="ac-side-list">
            {sidebarExpanded && <div className="ac-side-section-title">最近会话</div>}
            {THREADS.map((t) => (
              <div key={t.id} className={`ac-thread-tab ${t.active ? 'active' : ''}`} title={t.title}>
                <span className="ac-thread-icon">{t.icon}</span>
                {sidebarExpanded && (
                  <div className="ac-thread-info">
                    <span className="ac-thread-title">{t.title}</span>
                    <span className="ac-thread-time">{t.time}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>
      )}

      {/* 聊天主界面 */}
      <div className="ac-center-pane">
        <header {...node('shell.header', 'ac-top-header')}>
          <div className="ac-header-meta">
            <b>Agent UI 视元重塑</b>
            <span className="ac-badge-session">主动执行态</span>
          </div>
          <div {...node('thread.msg.effort', 'ac-effort-capsule')}>
            <span className="ac-effort-gauge">●●●</span>
            <span>深度思考 · xHigh</span>
          </div>
        </header>

        <div className="ac-thread-scroll">
          {/* 用户提问卡片 */}
          <div className="ac-msg-row ac-msg-user">
            <div className="ac-user-bubble">
              <p>请帮我将 Agent UI 升级为世界第一流的现代设计审美，包含思考流光、工具瀑布流和产物画布。</p>
            </div>
          </div>

          {/* 智能体回复卡片 */}
          <div className="ac-msg-row ac-msg-assistant">
            <div {...node('thread.msg.avatar', 'ac-bot-avatar')}>
              <span>✦</span>
            </div>

            <div className="ac-msg-content">
              {/* 思考过程展开块 (Thinking / Chain of Thought) */}
              <div {...node('thread.msg.reasoning', 'ac-thinking-card')}>
                <div
                  className="ac-thinking-header"
                  onClick={() => setThinkingOpen(!thinkingOpen)}
                  role="button"
                  tabIndex={0}
                >
                  <span className="ac-thinking-sparkle" />
                  <span className="ac-thinking-title">深度推理与推演过程</span>
                  <span className="ac-thinking-time">1.84s · 482 tokens</span>
                  <span className="ac-thinking-chevron">{thinkingOpen ? '▴' : '▾'}</span>
                </div>

                {thinkingOpen && (
                  <div {...node('thread.msg.cot', 'ac-thinking-body')}>
                    <p>正在分析当前界面的视觉层级：</p>
                    <div className="ac-cot-step">
                      <em>01</em>
                      <span>解构 Composer 边框：注入 0.5px 发丝级微光内描边与 16px G2 平滑倒角。</span>
                    </div>
                    <div className="ac-cot-step">
                      <em>02</em>
                      <span>编排 Tool Call 序列：参数对象折叠收敛，状态指示灯与耗时显式展示。</span>
                    </div>
                    <div className="ac-cot-step">
                      <em>03</em>
                      <span>拉起独立 Artifact 画布：将生成的设计规范与代码隔离于右侧协同面板。</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 工具调用瀑布流 (Tool Call Waterfall) */}
              <div {...node('thread.waterfall', 'ac-waterfall-card')}>
                <div className="ac-waterfall-header">
                  <span className="ac-waterfall-dot" />
                  <span>执行工具链 (2/2 步已就绪)</span>
                </div>

                <div {...node('thread.toolcall', 'ac-tool-item')}>
                  <span className="ac-tool-status success">✓</span>
                  <code className="ac-tool-name">measure_viewport_metrics</code>
                  <span className="ac-tool-param">&#123; mode: "retina", dpr: 2 &#125;</span>
                  <span className="ac-tool-time">32ms</span>
                </div>

                <div className="ac-tool-item">
                  <span className="ac-tool-status success">✓</span>
                  <code className="ac-tool-name">compile_design_tokens</code>
                  <span className="ac-tool-param">&#123; format: "tailwind-v4" &#125;</span>
                  <span className="ac-tool-time">84ms</span>
                </div>
              </div>

              {/* 智能体流式输出正文 */}
              <div {...node('thread.msg.stream', 'ac-stream-body')}>
                <p>
                  {SAMPLE_STREAM.slice(0, streamProgress)}
                  {streamProgress < SAMPLE_STREAM.length && (
                    <span className="ac-stream-cursor" aria-hidden="true" />
                  )}
                  <sup {...node('thread.msg.citation', 'ac-citation-badge')}>[1]</sup>
                </p>
              </div>

              {/* 消息底部悬浮操作坞 (Message Actions) */}
              <div {...node('thread.msg.actions', 'ac-message-actions-dock')}>
                <button type="button" title="复制文本">⧉</button>
                <button type="button" title="分支重试">↻</button>
                <button type="button" title="点赞有益">△</button>
                <span className="ac-action-divider" />
                <button type="button" className="ac-action-branch">&lt; 1 / 3 &gt;</button>
              </div>

              {/* 紧接着的后续建议引导 */}
              <div {...node('thread.followups', 'ac-followups-row')}>
                <span className="ac-followups-label">推荐追问：</span>
                {['查看代码差异', '调节微光参数'].map((item) => (
                  <button key={item} type="button" className="ac-followup-pill">{item}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 输入区挂载点 */}
        {preset === 'popover' ? (
          <div className="ac-popover-wrapper">
            <div className="ac-popover-hud">⌘K 唤起轻量 Composer</div>
            <div className="ac-popover-box">{composerElement}</div>
          </div>
        ) : (
          composerElement
        )}
      </div>

      {/* 右侧协同产物画布 (Artifact Split Canvas) */}
      {showArtifact && preset !== 'mobile' && (
        <aside {...node('workspace.artifact', 'ac-artifact-pane')}>
          <div className="ac-artifact-header">
            <div className="ac-artifact-title">
              <span className="ac-artifact-icon">❖</span>
              <b>DesignSpec.tsx</b>
              <span className="ac-artifact-tag">React + Tailwind</span>
            </div>
            <div className="ac-artifact-tabs">
              <button
                type="button"
                className={`ac-tab-btn ${artifactTab === 'preview' ? 'on' : ''}`}
                onClick={() => setArtifactTab('preview')}
              >
                组件预览
              </button>
              <button
                type="button"
                className={`ac-tab-btn ${artifactTab === 'diff' ? 'on' : ''}`}
                onClick={() => setArtifactTab('diff')}
              >
                代码差异
              </button>
            </div>
          </div>

          <div className="ac-artifact-content">
            {artifactTab === 'preview' ? (
              <div className="ac-preview-surface">
                <div className="ac-preview-card">
                  <div className="ac-preview-hero">
                    <span className="ac-preview-badge">Live Token Component</span>
                    <h3>OKLCH Dynamic Surface</h3>
                    <p>随光影与视口自动补偿的现代晶体材质卡片</p>
                    <button type="button" className="ac-preview-cta">Inspect Primitive →</button>
                  </div>
                </div>
              </div>
            ) : (
              <div {...node('artifact.diff', 'ac-diff-viewer')}>
                <div className="ac-diff-line normal"><span>1</span><code>const COMPOSER_TOKENS = &#123;</code></div>
                <div className="ac-diff-line remove"><span>2</span><code>-  border: "1px solid #ddd",</code></div>
                <div className="ac-diff-line remove"><span>3</span><code>-  borderRadius: "4px",</code></div>
                <div className="ac-diff-line add"><span>4</span><code>+  border: "0.5px solid var(--laser-rim)",</code></div>
                <div className="ac-diff-line add"><span>5</span><code>+  borderRadius: "16px",</code></div>
                <div className="ac-diff-line add"><span>6</span><code>+  backdropFilter: "blur(16px)",</code></div>
                <div className="ac-diff-line normal"><span>7</span><code>&#125;</code></div>
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  )
}
