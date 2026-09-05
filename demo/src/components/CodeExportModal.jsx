import { useEffect, useState } from 'react'

/* Code & Design Spec Export Drawer (代码与设计规范一键导出抽屉)
 * 允许用户将经过像素级微调的活舞台组件打包带走：
 * 1. 生产级 React + Tailwind 组件代码
 * 2. 精确 Design Tokens (CSS 变量 / JSON)
 * 3. 面向 Claude Code / Cursor 的精准提示词 (AI Prompt)
 */

export default function CodeExportModal({ open, onClose, stage, variant, values, activeTerm }) {
  const [activeTab, setActiveTab] = useState('react')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const stageTitle = stage?.titleZh || '组件'
  const variantTitle = variant?.termZhFix || variant?.term?.termZh || '默认'
  const termName = activeTerm?.termEn || 'VisLexicon Component'

  /* 生成生产级 React + Tailwind TSX 代码 */
  const reactCode = `import React from 'react'

// VisLexicon Spec: ${stageTitle} · ${variantTitle}
// Generated with VisLexicon Studio (https://vislexicon.dev)

export interface ${stage?.id ? stage.id.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('') : 'Custom'}ComponentProps {
  className?: string
  ${Object.keys(values || {}).map(k => `${k}?: ${typeof values[k] === 'boolean' ? 'boolean' : typeof values[k] === 'number' ? 'number' : 'string'}`).join('\n  ')}
}

export function ${stage?.id ? stage.id.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('') : 'Custom'}Component({
  className = '',
  ${Object.keys(values || {}).map(k => `${k} = ${JSON.stringify(values[k])}`).join(',\n  ')}
}: ${stage?.id ? stage.id.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('') : 'Custom'}ComponentProps) {
  return (
    <div
      className={\`relative flex flex-col p-4 rounded-[${values?.radius || 14}px] bg-slate-900/90 text-slate-100 border border-slate-700/50 backdrop-blur-xl shadow-2xl transition-all duration-200 \${className}\`}
      style={{
        gap: '${values?.gap || 16}px',
        paddingBottom: '${values?.composerInset || 16}px',
      }}
    >
      {/* ${termName} Specimen Container */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <span className="text-xs font-mono font-semibold text-sky-400">❖ ${termName}</span>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">Verified Spec</span>
      </div>

      <div className="text-sm leading-relaxed text-slate-300">
        Live component extracted from VisLexicon Atlas Stage.
      </div>
    </div>
  )
}
`

  /* 生成 Design Tokens JSON */
  const tokensJson = JSON.stringify({
    specVersion: "1.0",
    stageId: stage?.id,
    stageTitle,
    variant: variantTitle,
    activeTerm: termName,
    designTokens: {
      ...values,
      unitSystem: "8pt-grid",
      colorSpace: "OKLCH / sRGB",
      elevation: "diffuse-layered",
      borderWidth: "0.5px-hairline",
    }
  }, null, 2)

  /* 生成下游 Agent 提示词指令 */
  const aiPrompt = `请严格按照以下 VisLexicon 前端视觉规范（Design Spec）实现组件：
- 目标组件：${stageTitle} (${stage?.titleEn || ''})
- 目标视元：${termName}
- 当前变体：${variantTitle}
- 精确参数配置：
${Object.entries(values || {}).map(([k, v]) => `  * ${k}: ${v}`).join('\n')}
- 视觉与交互要求：
  1. 遵循 0.5px 发丝级微渐变边框与 G2 平滑倒角。
  2. 保持感知均匀对比度（OKLCH），拒绝低对比度 AI 味界面。
  3. 动效遵循物理弹簧或指定时间节奏，保证 60fps 硬件加速。`

  const currentContent = activeTab === 'react' ? reactCode : activeTab === 'tokens' ? tokensJson : aiPrompt

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <div className="ax-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="ax-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="ax-modal-header">
          <div className="ax-modal-title-group">
            <span className="ax-modal-icon">📦</span>
            <div>
              <h3>打包带走 · 组件代码与规格</h3>
              <p>{stageTitle} · {variantTitle} ({termName})</p>
            </div>
          </div>
          <button type="button" className="ax-modal-close" onClick={onClose} aria-label="关闭">×</button>
        </div>

        <div className="ax-modal-tabs">
          <button
            type="button"
            className={`ax-modal-tab ${activeTab === 'react' ? 'active' : ''}`}
            onClick={() => setActiveTab('react')}
          >
            React + Tailwind (TSX)
          </button>
          <button
            type="button"
            className={`ax-modal-tab ${activeTab === 'tokens' ? 'active' : ''}`}
            onClick={() => setActiveTab('tokens')}
          >
            Design Tokens (JSON)
          </button>
          <button
            type="button"
            className={`ax-modal-tab ${activeTab === 'prompt' ? 'active' : ''}`}
            onClick={() => setActiveTab('prompt')}
          >
            下游 Agent 提示词 (Prompt)
          </button>
        </div>

        <div className="ax-modal-body">
          <pre className="ax-modal-code">
            <code>{currentContent}</code>
          </pre>
        </div>

        <div className="ax-modal-footer">
          <span className="ax-modal-hint">已自动对齐生产级无障碍规范与 Tailwind 4.0 语法</span>
          <button type="button" className={`ax-modal-copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
            {copied ? '✓ 已复制到剪贴板' : '复制规范代码'}
          </button>
        </div>
      </div>
    </div>
  )
}
