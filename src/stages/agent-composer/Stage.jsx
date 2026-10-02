import { useEffect, useState } from 'react'
import { makeNodeBinder } from '../node.js'

/* Agent 对话界面台。
 * 一整屏中性的 Agent 界面：会话侧栏、消息与思考块、输入区 composer、产物画布。
 * 标本不复刻任何一家产品，文本与命名一律中性——这台要教的是每一块叫什么。
 */

/* 标本文本一律中性：不出现真实产品名、模型名与营销词（方案 §7.1 第 4、5 条）。
 * 这是教学标本，要看的是信息节奏，不是某一家产品的界面。 */
const SAMPLE_STREAM = '已把这次改动拆成三步：\n1. 统一表面层级，让相邻两层的对比可辨；\n2. 输入区改用一致的描边与圆角；\n3. 生成的文件放进右侧画布，可以逐行看改了什么。'
const THREADS = [
  { id: 't1', title: '示例会话 · 界面调整', time: '刚刚', active: true },
  { id: 't2', title: '示例会话 · 配色校准', time: '10m', active: false },
  { id: 't3', title: '示例会话 · 动效参数', time: '1h', active: false },
  { id: 't4', title: '示例会话 · 断点整理', time: '昨天', active: false },
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
    <div {...node('composer.root', 'ac-composer ac-composer-surface')} data-zone="composer">
      {preset !== 'mobile' && (
        <div {...node('composer.suggestions', 'ac-suggestions-bar')} data-zone="composer">
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
          <div {...node('composer.attachment', 'ac-attachment-pill')} data-zone="composer">
            <span className="ac-file-icon">◧</span>
            <span className="ac-file-name">design-tokens.json</span>
            <span className="ac-file-size">4.2 KB</span>
            <b className="ac-file-remove" aria-hidden="true">×</b>
          </div>

          <div {...node('composer.tokens', 'ac-token-meter')} data-zone="composer-toolbar">
            <span className="ac-token-bar"><i style={{ width: '42%' }} /></span>
            <em>14.2k / 200k tokens</em>
          </div>
        </div>

        {/* 核心提示词输入体 */}
        <textarea {...node('composer.input', 'ac-prompt-textarea')} data-zone="composer" placeholder="输入指令、粘贴设计图，或键入 / 唤起智能体指令库…" defaultValue={preset === 'editing' ? '把输入区的内阴影调柔和一点，思考块加一个展开动效' : ''} />

        {/* 底部工具栏 */}
        <div {...node('composer.toolbar', 'ac-composer-dock')} data-zone="composer-toolbar">
          <div {...node('composer.model', 'ac-model-capsule')} data-zone="composer-toolbar">
            <span className="ac-model-dot" />
            <span className="ac-model-name">{stage.specimen.model}</span>
            <span className="ac-model-caret">▾</span>
          </div>

          <div className="ac-dock-spacer" />

          {preset !== 'mobile' && (
            <button {...node('composer.mic', 'ac-icon-button')} data-zone="composer-toolbar" type="button" aria-label="语音指令">
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
          {...node('shell.sidebar', `ac-sidebar-pane ${sidebarExpanded ? 'expanded' : 'collapsed'}`)} data-zone="shell"
          onMouseEnter={() => setSidebarExpanded(true)}
          onMouseLeave={() => setSidebarExpanded(false)}
        >
          <div className="ac-side-brand">
            <span className="ac-brand-logo">◈</span>
            {sidebarExpanded && <b>示例工作台</b>}
          </div>

          <button type="button" className="ac-side-new-btn" title="新建会话">
            <span>＋</span>
            {sidebarExpanded && <span>新建会话</span>}
          </button>

          <div className="ac-side-list">
            {sidebarExpanded && <div className="ac-side-section-title">最近会话</div>}
            {THREADS.map((t, i) => (
              <div key={t.id} className={`ac-thread-tab ${t.active ? 'active' : ''}`} title={t.title}>
                {/* 会话序号，不用 emoji 当图标（方案 §7.1 第 2 条）。 */}
                <span className="ac-thread-icon" aria-hidden="true">{i + 1}</span>
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
        <header {...node('shell.header', 'ac-top-header')} data-zone="shell">
          <div className="ac-header-meta">
            <b>示例会话 · 界面调整</b>
            <span className="ac-badge-session">执行中</span>
          </div>
          <div {...node('thread.msg.effort', 'ac-effort-capsule')} data-zone="shell">
            <span className="ac-effort-gauge">●●●</span>
            <span>推理强度 · 高</span>
          </div>
        </header>

        <div className="ac-thread-scroll">
          {/* 用户提问卡片 */}
          <div className="ac-msg-row ac-msg-user">
            <div className="ac-user-bubble">
              <p>把这个界面的层级理一遍：说明块要能折叠，工具调用要能看到耗时，生成的文件单独放一栏。</p>
            </div>
          </div>

          {/* 智能体回复卡片 */}
          <div className="ac-msg-row ac-msg-assistant">
            <div {...node('thread.msg.avatar', 'ac-bot-avatar')} data-zone="message">
              <span>✦</span>
            </div>

            <div className="ac-msg-content">
              {/* 思考过程展开块 (Thinking / Chain of Thought) */}
              <div {...node('thread.msg.reasoning', 'ac-thinking-card')} data-zone="message">
                <div
                  className="ac-thinking-header"
                  onClick={() => setThinkingOpen(!thinkingOpen)}
                  role="button"
                  tabIndex={0}
                >
                  <span className="ac-thinking-sparkle" />
                  <span className="ac-thinking-title">思考过程</span>
                  <span className="ac-thinking-time">1.84s · 482 tokens</span>
                  <span className="ac-thinking-chevron">{thinkingOpen ? '▴' : '▾'}</span>
                </div>

                {thinkingOpen && (
                  <div {...node('thread.msg.cot', 'ac-thinking-body')} data-zone="message">
                    <p>正在分析当前界面的层级：</p>
                    <div className="ac-cot-step">
                      <em>01</em>
                      <span>输入区的描边与圆角与其余控件对齐。</span>
                    </div>
                    <div className="ac-cot-step">
                      <em>02</em>
                      <span>工具调用按顺序列出，参数默认折叠，耗时显式给出。</span>
                    </div>
                    <div className="ac-cot-step">
                      <em>03</em>
                      <span>生成的文件放进右侧画布，与对话分开。</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 工具调用瀑布流 (Tool Call Waterfall) */}
              <div {...node('thread.waterfall', 'ac-waterfall-card')} data-zone="execution-artifact">
                <div className="ac-waterfall-header">
                  <span className="ac-waterfall-dot" />
                  <span>执行工具链 (2/2 步已就绪)</span>
                </div>

                <div {...node('thread.toolcall', 'ac-tool-item')} data-zone="execution-artifact">
                  <span className="ac-tool-status success">✓</span>
                  <code className="ac-tool-name">measure_viewport_metrics</code>
                  <span className="ac-tool-param">&#123; mode: "retina", dpr: 2 &#125;</span>
                  <span className="ac-tool-time">32ms</span>
                </div>

                <div className="ac-tool-item">
                  <span className="ac-tool-status success">✓</span>
                  <code className="ac-tool-name">compile_design_tokens</code>
                  <span className="ac-tool-param">&#123; format: "json" &#125;</span>
                  <span className="ac-tool-time">84ms</span>
                </div>
              </div>

              {/* 智能体流式输出正文 */}
              <div {...node('thread.msg.stream', 'ac-stream-body')} data-zone="message">
                <p>
                  {SAMPLE_STREAM.slice(0, streamProgress)}
                  {streamProgress < SAMPLE_STREAM.length && (
                    <span className="ac-stream-cursor" aria-hidden="true" />
                  )}
                  <sup {...node('thread.msg.citation', 'ac-citation-badge')} data-zone="message">[1]</sup>
                </p>
              </div>

              {/* 消息底部悬浮操作坞 (Message Actions) */}
              <div {...node('thread.msg.actions', 'ac-message-actions-dock')} data-zone="message">
                <button type="button" title="复制文本">⧉</button>
                <button type="button" title="分支重试">↻</button>
                <button type="button" title="点赞有益">△</button>
                <span className="ac-action-divider" />
                <button type="button" className="ac-action-branch">&lt; 1 / 3 &gt;</button>
              </div>

              {/* 紧接着的后续建议引导 */}
              <div {...node('thread.followups', 'ac-followups-row')} data-zone="message">
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
            <div className="ac-popover-hud">⌘K 唤起 composer</div>
            <div className="ac-popover-box">{composerElement}</div>
          </div>
        ) : (
          composerElement
        )}
      </div>

      {/* 右侧协同产物画布 (Artifact Split Canvas) */}
      {showArtifact && preset !== 'mobile' && (
        <aside {...node('workspace.artifact', 'ac-artifact-pane')} data-zone="execution-artifact">
          <div className="ac-artifact-header">
            <div className="ac-artifact-title">
              <span className="ac-artifact-icon">❖</span>
              <b>panel.tsx</b>
              <span className="ac-artifact-tag">组件源码</span>
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
                    <span className="ac-preview-badge">预览</span>
                    <h3>示例卡片</h3>
                    <p>这里显示产物画布渲染出的组件本身。</p>
                    <button type="button" className="ac-preview-cta">查看结构 →</button>
                  </div>
                </div>
              </div>
            ) : (
              <div {...node('artifact.diff', 'ac-diff-viewer')} data-zone="execution-artifact">
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
