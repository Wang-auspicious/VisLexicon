const fs = require('fs');
let css = fs.readFileSync('demo/src/atlas.css', 'utf-8');

const newCSS = `
/* 全息镭射字 (Holo Foil) */
.tr-holo {
  background: linear-gradient(110deg, #ff7b00, #ff0055, #bf00ff, #00d4ff, #00ff88, #ff7b00);
  background-size: 300% auto;
  -webkit-background-clip: text; background-clip: text; color: transparent;
  animation: trHolo 4s linear infinite;
  filter: drop-shadow(0 0 16px rgba(191, 0, 255, 0.4));
}
@keyframes trHolo { 0% { background-position: 0% 50%; } 100% { background-position: 300% 50%; } }

/* 洗色揭示 (Scrub Wipe) */
.tr-scrub {
  background: linear-gradient(90deg, var(--text-h) 0%, var(--text-h) 50%, var(--text-2) 50%, var(--text-2) 100%);
  background-size: 250% 100%;
  background-position: 100% 0;
  -webkit-background-clip: text; background-clip: text; color: transparent;
  animation: trScrub 2.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes trScrub { 0% { background-position: 100% 0; } 100% { background-position: 0 0; } }

/* 3D 翻转浮现 (Tumble) */
.tr-tumble .tr-ch {
  transform-origin: 50% 100%;
  animation-name: trTumble;
  perspective: 1000px;
}
@keyframes trTumble {
  0% { opacity: 0; transform: translateY(calc(var(--tr-travel) * 1.5)) rotateX(-80deg); }
  100% { opacity: 1; transform: none; }
}

/* 故障干扰 (Glitch) */
.tr-glitch-box { position: relative; display: inline-block; }
.tr-glitch { position: relative; color: var(--text-h); animation: trGlitchAnim 2.5s infinite; }
.tr-glitch::before, .tr-glitch::after {
  content: attr(data-text); position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  opacity: 0.8;
}
.tr-glitch::before {
  left: 2px; text-shadow: -2px 0 #ff0055; clip-path: inset(10% 0 30% 0);
  animation: trGlitchAnim2 2.2s infinite linear alternate-reverse;
}
.tr-glitch::after {
  left: -2px; text-shadow: -2px 0 #00d4ff; clip-path: inset(60% 0 10% 0);
  animation: trGlitchAnim3 2.8s infinite linear alternate-reverse;
}
@keyframes trGlitchAnim {
  0%, 10%, 100% { transform: skewX(0); }
  11% { transform: skewX(8deg); }
  12% { transform: skewX(-8deg); }
  13% { transform: skewX(0); }
}
@keyframes trGlitchAnim2 {
  0%, 100% { clip-path: inset(10% 0 30% 0); }
  25% { clip-path: inset(40% 0 10% 0); }
  50% { clip-path: inset(20% 0 60% 0); }
}
@keyframes trGlitchAnim3 {
  0%, 100% { clip-path: inset(60% 0 10% 0); }
  35% { clip-path: inset(10% 0 80% 0); }
  65% { clip-path: inset(80% 0 10% 0); }
}
`;

css = css.replace('/* ============ 舞台 · 旗舰级 Agent 智能体交互界面 ============ */', newCSS + '\n/* ============ 舞台 · 旗舰级 Agent 智能体交互界面 ============ */');

fs.writeFileSync('demo/src/atlas.css', css, 'utf-8');
