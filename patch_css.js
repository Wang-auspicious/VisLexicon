const fs = require('fs');
let css = fs.readFileSync('demo/src/atlas.css', 'utf-8');

// Replace `.ax` block and `.ax-rail`, `.ax-main`, `.ax-panel` styles
const newStyles = `
/* ============ 图鉴 · 旗舰级 Mac 视窗排版 ============
 * 提供沉浸式的高端演示环境，剥离死板的传统三栏布局。
 * 左右浮动面板支持毛玻璃特效（Ethereal Glass）。
 */
.ax-mac-desktop {
  position: relative; width: 100%; height: calc(100vh - 72px); 
  display: flex; align-items: center; justify-content: center;
  padding: 16px 20px 24px; box-sizing: border-box;
}

.ax-mac-window {
  position: relative; width: 100%; height: 100%; max-width: 1600px;
  background: var(--bg-2); border-radius: 12px;
  border: 1px solid var(--line);
  box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.05);
  display: flex; flex-direction: column; overflow: hidden;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.ax-mac-titlebar {
  flex: none; display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px; background: var(--bg-3);
  border-bottom: 1px solid var(--line); z-index: 10;
}

.ax-mac-dots {
  display: flex; gap: 6px; width: 80px;
}
.mac-dot {
  width: 10px; height: 10px; border-radius: 50%;
}
.mac-dot.close { background: #ff5f56; }
.mac-dot.min { background: #ffbd2e; }
.mac-dot.max { background: #27c93f; }

.ax-mac-title {
  flex: 1; text-align: center; font-size: 13px; font-weight: 600; color: var(--text-h);
  display: flex; flex-direction: column; line-height: 1.2;
}
.ax-mac-subtitle {
  font-size: 10px; color: var(--text-2); font-weight: 400; opacity: 0.8;
}

.ax-mac-actions {
  display: flex; gap: 8px; width: 80px; justify-content: flex-end;
}
.ax-mac-btn {
  display: grid; place-items: center; width: 26px; height: 26px;
  border: 1px solid transparent; border-radius: 6px;
  background: transparent; color: var(--text-2); cursor: pointer;
  transition: all 0.2s;
}
.ax-mac-btn:hover { background: var(--bg-2); color: var(--text-h); border-color: var(--line); }
.ax-mac-btn.on { background: var(--acc-bg); color: var(--acc); border-color: var(--acc-line); }

.ax-mac-body {
  position: relative; flex: 1; min-height: 0; display: flex; overflow: hidden;
}

/* 悬浮面板基础属性 */
.ax-glass-panel {
  position: absolute; top: 12px; bottom: 12px; z-index: 20;
  background: color-mix(in srgb, var(--bg-2) 75%, transparent);
  backdrop-filter: blur(24px) saturate(180%); -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--line); box-shadow: var(--shadow);
  border-radius: 12px;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
}

/* 左侧栏 */
.ax-rail {
  left: 12px; width: 280px; display: flex; flex-direction: column; gap: 10px;
  padding-top: 12px;
}
.ax-rail.closed { transform: translateX(-110%) scale(0.95); opacity: 0; pointer-events: none; }
.ax-rail.open { transform: translateX(0) scale(1); opacity: 1; pointer-events: auto; }

/* 右侧栏 */
.ax-panel {
  right: 12px; width: 340px; overflow-y: auto; scrollbar-width: thin;
  padding: 18px 20px;
}
.ax-panel.closed { transform: translateX(110%) scale(0.95); opacity: 0; pointer-events: none; }
.ax-panel.open { transform: translateX(0) scale(1); opacity: 1; pointer-events: auto; }

/* 中央演示舞台 */
.ax-main-stage {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  background: var(--bg-2); padding: 16px 24px; gap: 12px;
}
.ax-stage-actions {
  display: flex; align-items: center; justify-content: center; z-index: 2; pointer-events: none;
}
.ax-variants-glass {
  pointer-events: auto; display: flex; flex-wrap: wrap; gap: 6px; justify-content: center;
  padding: 6px 12px; border-radius: 999px; background: color-mix(in srgb, var(--bg-3) 60%, transparent);
  backdrop-filter: blur(12px); border: 1px solid var(--line);
}

.ax-viewport-mac {
  position: relative; flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--line); border-radius: 16px; background: var(--bg-3);
  box-shadow: inset 0 2px 12px rgba(0,0,0,0.02); overflow: hidden;
}

.ax-todo-note-mac { text-align: center; color: var(--text-2); }
.ax-mac-folder-icon { font-size: 32px; margin-bottom: 8px; opacity: 0.8; }
.ax-todo-note-mac p { margin: 4px 0; }

.ax-tip-mac {
  position: absolute; transform: translateY(-100%); margin-top: -12px; z-index: 50; pointer-events: none;
  display: flex; align-items: baseline; gap: 7px; padding: 6px 12px; border-radius: 8px;
  background: color-mix(in srgb, var(--acc) 90%, black); color: #fff; font-size: 12px; white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.1);
}
.ax-tip-mac.below { transform: none; margin-top: 12px; }
.ax-tip-mac span { opacity: 0.8; font-size: 11px; }

.ax-knobs-glass {
  flex: none; display: flex; justify-content: center; z-index: 2; pointer-events: none;
}
.ax-knobs-scroller {
  pointer-events: auto; display: flex; gap: 16px; overflow-x: auto; padding: 12px 20px;
  background: color-mix(in srgb, var(--bg-3) 60%, transparent); backdrop-filter: blur(16px);
  border: 1px solid var(--line); border-radius: 12px; box-shadow: var(--shadow);
  max-width: 100%;
}
.ax-export-btn-glass {
  display: flex; align-items: center; gap: 6px; padding: 8px 14px; width: 100%; justify-content: center;
  border: 1px solid var(--acc-line); border-radius: 8px; margin-bottom: 16px;
  background: var(--acc-bg); color: var(--acc); font-size: 12.5px; font-weight: 600;
  cursor: pointer; transition: all 0.15s;
}
.ax-export-btn-glass:hover { background: var(--acc); color: var(--bg-2); }

`;

// Let's replace the .ax block up to the .ax-stages block
const startIdx = css.indexOf('.ax {');
const endIdx = css.indexOf('.ax-stages {');

if(startIdx !== -1 && endIdx !== -1) {
    const original = css.substring(startIdx, endIdx);
    css = css.replace(original, newStyles);
    
    // Also remove the old middle/right column layout styles that might conflict
    css = css.replace(/\.ax-main \{[\s\S]*?\.ax-main-actions \{[\s\S]*?\}/, '');
    css = css.replace(/\.ax-export-btn \{[\s\S]*?\.ax-export-btn:hover \{[\s\S]*?\}/, '');
    css = css.replace(/\.ax-replay \{[\s\S]*?\.ax-replay:hover \{[\s\S]*?\}/, '');
    css = css.replace(/\.ax-panel \{[\s\S]*?padding-left: 18px; \}/, '');
    
    fs.writeFileSync('demo/src/atlas.css', css, 'utf-8');
    console.log("CSS Patched successfully.");
} else {
    console.log("Could not find blocks");
}

