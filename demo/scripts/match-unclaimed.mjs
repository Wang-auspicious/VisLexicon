import atlas from "../src/data/visual-atlas.json" with { type: "json" };
import { MANIFESTS } from "../src/stages/manifests.js";
import { buildStageIndex } from "../src/lib/stage-index.js";

const index = buildStageIndex(MANIFESTS, atlas);

console.log("=== UNCLAIMED TERMS IN VISUAL ATLAS ===");

const stageCandidates = {
  typography: [],
  agentic: [],
  navigation: [],
  dataDisplay: [],
  formAnatomy: [],
  overlayLayers: [],
  stateLoading: [],
  surfaceTransition: [],
  pointerGestures: [],
};

index.unrouted.forEach(u => {
  const en = u.termEn.toLowerCase();
  const zh = u.termZh;

  if (/agent|plan|approval|bot|prompt|chat|thread|stream|citation|model|message/i.test(en) || /智能体|代理|会话|提示|模型|消息/.test(zh)) {
    stageCandidates.agentic.push(u);
  } else if (/text|font|typography|letter|line|metric|baseline|title|caption|heading/i.test(en) || /字|文本|排版|标题/.test(zh)) {
    stageCandidates.typography.push(u);
  } else if (/nav|menu|tab|breadcrumb|header|bar|dock|rail|stepper|sidebar/i.test(en) || /导航|菜单|标签|面包屑|栏|侧栏|步骤/.test(zh)) {
    stageCandidates.navigation.push(u);
  } else if (/chart|table|data|grid|kpi|stat|meter|gauge|tree|view/i.test(en) || /图表|表格|数据|网格|树|视图/.test(zh)) {
    stageCandidates.dataDisplay.push(u);
  } else if (/input|field|form|select|checkbox|radio|switch|slider|picker|combobox/i.test(en) || /输入|表单|选择|开关|滑块/.test(zh)) {
    stageCandidates.formAnatomy.push(u);
  } else if (/modal|dialog|drawer|sheet|popover|tooltip|toast|alert|banner/i.test(en) || /模态|对话框|抽屉|浮层|气泡|提示|警告/.test(zh)) {
    stageCandidates.overlayLayers.push(u);
  } else if (/loading|skeleton|spin|progress|shimmer|placeholder|empty|state/i.test(en) || /加载|骨架|进度|流光|占位|空|状态/.test(zh)) {
    stageCandidates.stateLoading.push(u);
  } else if (/transition|flip|morph|tumble|fade|slide|zoom|collapse|expand/i.test(en) || /过渡|形变|翻转|淡入|折叠|展开/.test(zh)) {
    stageCandidates.surfaceTransition.push(u);
  } else if (/gesture|drag|drop|swipe|pinch|press|hover|cursor|pointer|touch/i.test(en) || /手势|拖拽|滑动|按|悬停|光标|指针|触摸/.test(zh)) {
    stageCandidates.pointerGestures.push(u);
  }
});

for (const [st, list] of Object.entries(stageCandidates)) {
  console.log(`\nStage candidate group [${st}]: ${list.length} terms`);
  list.slice(0, 10).forEach(t => console.log(`  - [${t.id}] ${t.termEn} (${t.termZh})`));
}
