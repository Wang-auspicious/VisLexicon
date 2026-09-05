const fs = require('fs');
let css = fs.readFileSync('demo/src/atlas.css', 'utf-8');

const newAC = `
/* ============ 舞台 · 旗舰级 Agent 智能体交互界面 ============ */
.ac-stage-root {
  display: flex; width: 100%; align-self: stretch; min-height: 560px; font-size: 14px; text-align: left;
  background: var(--bg-1); border-radius: var(--r); overflow: hidden;
  box-shadow: inset 0 0 0 1px var(--line-soft);
}

/* 侧栏：极简沉浸 */
.ac-sidebar-pane {
  flex: none; width: 60px; border-right: 1px solid var(--line-soft); padding: 16px 8px;
  background: var(--bg-2); display: flex; flex-direction: column; gap: 16px;
  transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1); overflow: hidden;
}
.ac-sidebar-pane:hover, .ac-sidebar-pane.expanded { width: 220px; }
.ac-side-brand { display: flex; align-items: center; gap: 12px; font-size: 14px; color: var(--text-h); font-weight: 500; padding: 4px 8px; }
.ac-brand-logo { color: var(--text-h); font-size: 18px; flex-shrink: 0; }
.ac-side-new-btn {
  display: flex; align-items: center; justify-content: flex-start; gap: 12px;
  padding: 8px 10px; border: 1px solid var(--line); border-radius: 10px;
  background: var(--bg-1); color: var(--text-h); font-size: 13px; font-weight: 500;
  cursor: pointer; transition: all 0.2s; white-space: nowrap; overflow: hidden;
}
.ac-side-new-btn span:first-child { font-size: 16px; font-weight: 300; }
.ac-side-new-btn:hover { background: var(--bg-raise); }
.ac-side-list { display: flex; flex-direction: column; gap: 4px; flex: 1; overflow: hidden; margin-top: 12px; }
.ac-side-section-title { font-size: 11px; color: var(--text-2); padding: 4px 10px; white-space: nowrap; font-weight: 500; }
.ac-thread-tab {
  display: flex; align-items: center; gap: 12px; padding: 8px 10px; border-radius: 8px;
  color: var(--text-2); cursor: pointer; transition: background 0.15s; white-space: nowrap;
}
.ac-thread-tab:hover { background: var(--bg-raise); color: var(--text-h); }
.ac-thread-tab.active { background: var(--bg-raise); color: var(--text-h); font-weight: 500; }
.ac-thread-icon { font-size: 14px; flex-shrink: 0; }
.ac-thread-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; overflow: hidden; }
.ac-thread-title { font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ac-thread-time { font-size: 10px; color: var(--text-2); opacity: 0.8; }

/* 聊天中心主舞台 */
.ac-center-pane { flex: 1; min-width: 0; display: flex; flex-direction: column; background: var(--bg-1); }
.ac-top-header {
  display: flex; align-items: center; justify-content: center;
  padding: 16px; background: transparent;
}
.ac-header-meta { display: flex; align-items: center; gap: 8px; }
.ac-header-meta b { font-size: 14px; color: var(--text-h); font-weight: 500; }
.ac-effort-capsule { display: none; } /* Simplified away for Claude desktop clean look */

/* 消息流转动线 */
.ac-thread-scroll {
  flex: 1; min-height: 0; overflow-y: auto; scrollbar-width: none;
  padding: 24px max(24px, calc(50% - 340px)); display: flex; flex-direction: column; gap: 32px;
}
.ac-msg-row { display: flex; gap: 16px; width: 100%; max-width: 680px; margin: 0 auto; }
.ac-msg-user { justify-content: flex-end; }
.ac-user-bubble {
  max-width: 85%; padding: 12px 18px; border-radius: 20px;
  background: var(--bg-raise); color: var(--text-h); font-size: 15px; line-height: 1.5;
}
.ac-bot-avatar {
  flex: none; width: 28px; height: 28px; border-radius: 6px;
  background: var(--bg-raise); border: 1px solid var(--line);
  color: var(--text-h); display: grid; place-items: center; font-size: 14px;
}
.ac-msg-content { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding-top: 2px; }

/* 思考过程卡片 */
.ac-thinking-card {
  border-left: 2px solid var(--line); padding-left: 16px; margin-bottom: 8px;
}
.ac-thinking-header {
  display: flex; align-items: center; gap: 8px;
  cursor: pointer; user-select: none; font-size: 13px; color: var(--text-2); font-weight: 500;
}
.ac-thinking-sparkle {
  width: 14px; height: 14px; border-radius: 50%; border: 2px solid var(--text-2);
  border-top-color: transparent; animation: slSpin 1s linear infinite;
}
.ac-thinking-body {
  padding-top: 12px; font-size: 13px; color: var(--text-2); line-height: 1.6;
}
.ac-cot-step { margin-top: 6px; }

/* 工具链瀑布流 */
.ac-waterfall-card {
  border: 1px solid var(--line); border-radius: 12px; background: var(--bg-2);
  padding: 12px; display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px;
}
.ac-waterfall-header { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-2); font-weight: 500; }
.ac-waterfall-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--text-2); }
.ac-tool-item {
  display: flex; align-items: center; gap: 8px; padding: 8px 12px;
  border-radius: 8px; background: var(--bg-1); font-size: 12px; border: 1px solid var(--line-soft);
}
.ac-tool-status.success { color: var(--text-h); }
.ac-tool-name { font-family: var(--mono); color: var(--text-h); font-weight: 500; }
.ac-tool-param { color: var(--text-2); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: var(--mono); }
.ac-tool-time { font-size: 11px; color: var(--text-2); font-family: var(--mono); }

/* 流式正文 */
.ac-stream-body { color: var(--text-h); line-height: 1.65; font-size: 15px; }

/* 提示词输入区 */
.ac-composer-surface {
  padding: 0 max(24px, calc(50% - 340px)) 24px; background: transparent;
}
.ac-composer-card {
  border: 1px solid var(--line); border-radius: 24px; background: var(--bg-2);
  padding: 12px 16px; box-shadow: 0 4px 24px -6px rgba(0, 0, 0, 0.05);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.ac-composer-card:focus-within { border-color: var(--text-2); }
.ac-composer-topline { display: flex; gap: 8px; margin-bottom: 8px; }
.ac-attachment-pill {
  display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px;
  border: 1px solid var(--line); border-radius: 8px; background: var(--bg-1);
  font-size: 12px; color: var(--text-h);
}
.ac-file-icon { color: var(--text-h); opacity: 0.7; }
.ac-prompt-textarea {
  display: block; width: 100%; border: none; background: transparent;
  min-height: 24px; color: var(--text-h); font-size: 15px; line-height: 1.5;
  padding: 4px 0; outline: none; resize: none; font-family: inherit;
}

.ac-composer-dock { display: flex; align-items: center; gap: 12px; margin-top: 12px; }
.ac-icon-button {
  width: 32px; height: 32px; border: 0; border-radius: 8px;
  background: transparent; color: var(--text-2); display: grid; place-items: center; cursor: pointer;
}
.ac-icon-button:hover { background: var(--bg-raise); color: var(--text-h); }
.ac-send-button {
  width: 32px; height: 32px; border: 0; border-radius: 50%;
  background: var(--text-h); color: var(--bg-1); display: grid; place-items: center; cursor: pointer;
  transition: transform 0.15s;
}
.ac-send-button:hover { opacity: 0.9; transform: scale(1.05); }

/* 右侧协同产物画布 */
.ac-artifact-pane {
  flex: none; width: 380px; border-left: 1px solid var(--line);
  background: var(--bg-1); display: flex; flex-direction: column;
}
.ac-artifact-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid var(--line-soft); background: var(--bg-2);
}
.ac-artifact-title { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text-h); font-weight: 500; }
.ac-artifact-icon { color: var(--text-2); }
.ac-tab-btn {
  padding: 4px 10px; border: 0; border-radius: 6px; font-size: 12px;
  background: none; color: var(--text-2); cursor: pointer;
}
.ac-tab-btn.on { background: var(--bg-raise); color: var(--text-h); font-weight: 500; }

.ac-artifact-content { flex: 1; padding: 20px; overflow-y: auto; background: var(--bg-1); }
.ac-preview-surface {
  height: 100%; border: 1px solid var(--line); border-radius: 12px;
  background: var(--bg-2); padding: 24px; display: grid; place-items: center; text-align: center;
}
.ac-diff-viewer {
  font-family: var(--mono); font-size: 12px; line-height: 1.6;
  border-radius: 8px; background: var(--bg-2); border: 1px solid var(--line); overflow: hidden;
}
`;

const startIdx = css.indexOf("/* ============ 舞台 · 旗舰级 Agent 智能体交互界面 ============ */");
const endIdx = css.indexOf("/* ============ 舞台 · 浮层 ============ */");

if(startIdx !== -1 && endIdx !== -1) {
    const original = css.substring(startIdx, endIdx);
    css = css.replace(original, newAC + "\n");
    fs.writeFileSync('demo/src/atlas.css', css, 'utf-8');
    console.log("AgentUI CSS Patched.");
} else {
    console.log("Could not find AgentUI blocks");
}
