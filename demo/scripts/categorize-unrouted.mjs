import atlas from "../src/data/visual-atlas.json" with { type: "json" };
import { MANIFESTS } from "../src/stages/manifests.js";
import { buildStageIndex } from "../src/lib/stage-index.js";

const index = buildStageIndex(MANIFESTS, atlas);

const domains = {
  agentic: [],
  colorSurface: [],
  geometry: [],
  layout: [],
  motion: [],
  controls: [],
  typography: []
};

index.unrouted.forEach(u => {
  const en = u.termEn.toLowerCase();
  const zh = u.termZh;

  if (/agent|plan|approval|thinking|thought|stream|prompt|token|model|chat|thread|citation|bot/i.test(en) || /代理|智能体|提示|模型|会话|引用/.test(zh)) {
    domains.agentic.push(u);
  } else if (/color|shadow|light|glow|blur|gradient|glass|surface|mesh|ambient|specular|alpha|hue|theme/i.test(en) || /色|光|阴影|模糊|渐变|表面|透明/.test(zh)) {
    domains.colorSurface.push(u);
  } else if (/border|corner|radius|squircle|clip|mask|shape|circle|divider|hairline|pill|badge|dot/i.test(en) || /边框|圆角|遮罩|形状|分隔|胶囊|徽标|点/.test(zh)) {
    domains.geometry.push(u);
  } else if (/grid|layout|stack|flex|column|row|masonry|bento|split|center|align|space|gap/i.test(en) || /网格|布局|对齐|列|行|间距|分栏/.test(zh)) {
    domains.layout.push(u);
  } else if (/animate|transition|spring|move|flow|fade|slide|scroll|drag|swipe|gesture/i.test(en) || /动画|过渡|弹簧|滑动|手势|滚动/.test(zh)) {
    domains.motion.push(u);
  } else if (/text|font|type|letter|line|char|title|heading/i.test(en) || /字|文本|行|标题/.test(zh)) {
    domains.typography.push(u);
  } else {
    domains.controls.push(u);
  }
});

for (const [d, list] of Object.entries(domains)) {
  console.log(`Domain [${d}]: ${list.length} unrouted terms`);
  if (list.length > 0 && list.length <= 25) {
    list.forEach(t => console.log(`   - [${t.id}] ${t.termEn} (${t.termZh})`));
  } else if (list.length > 25) {
    list.slice(0, 15).forEach(t => console.log(`   - [${t.id}] ${t.termEn} (${t.termZh})`));
    console.log(`   ... and ${list.length - 15} more`);
  }
}
