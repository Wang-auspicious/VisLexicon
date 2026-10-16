// Pure style contract used by both local review tooling and the production build gate.
// No browser, network, local credentials or capture files are loaded here.
import fs from 'node:fs';
const VOCAB = JSON.parse(fs.readFileSync(new URL('../../public/spec/v1/vocab.json', import.meta.url), 'utf8'));
const STYLE_IDS = VOCAB.styles.map(style => style.id);

/* 互斥对：同一个主体不可能同时是这两种。出现就让模型重答。 */
export const CONFLICTS = [
  ['minimal', 'brutal'], ['minimal', 'y2k'], ['minimal', 'playful'], ['apple-like', 'brutal'], ['apple-like', 'pixel'],
  ['monochrome', 'dark-neon'], ['monochrome', 'gradient-mesh'], ['monochrome', 'playful'], ['monochrome', 'y2k'],
  ['terminal', 'clay'], ['terminal', 'soft-3d'], ['terminal', 'gradient-mesh'], ['skeuomorphic', 'minimal'],
  ['corporate', 'brutal'], ['corporate', 'y2k'], ['swiss', 'hand-drawn'],
];

/* v3 分类 → 这一行看谁（Spec §2.8 的映射，只取风格相关的部分）。null = 不打风格。 */
export function subjectOf(item) {
  if ((item.subcategory || item.classification?.subcategory) === 'headless-accessible-primitives') return 'headless';
  const explicit = item.kind || item.classification?.kind;
  if (explicit) return ({'component-source': 'components', 'design-system': 'design-system', 'assets': 'assets', 'work': 'page'})[explicit] || null;
  const c = item.primaryCategory;
  const s = item.subcategory;
  if (c === 'ui-implementation' && s === 'headless-accessible-primitives') return 'headless';
  if (c === 'ui-implementation') return s === 'design-system-suites' ? 'design-system' : 'components';
  /* 动效代码里既有可复制的动效组件（看长相），也有 anime.js 这类引擎（给的是能力）：按“交付物”分。 */
  const deliverables = item.facets?.deliverables || [];
  if (c === 'visual-implementation' && (deliverables.includes('component') || deliverables.includes('block'))) return 'components';
  if (c === 'templates-design-files') return 'page';
  if (c === 'visual-assets') return 'assets';
  if (c === 'single-site-showcase') return 'page';
  if (c === 'reference-standards' && (item.facets?.deliverables || []).includes('component')) return 'design-system';
  return null;
}

/* 能用像素否决的词：引用的那张图必须满足这些下限 / 上限。 */
export const PIXEL_RULES = {
  'dark-neon': (p) => (p.region === 'subject' && p.shellExcluded === true && p.backgroundLuma < 0.3 && p.luma < 0.3 && p.vivid >= 0.003) || 'needs a verified subject crop with dark component background and bright saturated accents; page chrome is not evidence',
  monochrome: (p) => p.sat < 0.12 || `cited image is colourful (saturation ${p.sat.toFixed(2)})`,
  'gradient-mesh': (p) => p.sat >= 0.12 || `cited image is nearly colourless (saturation ${p.sat.toFixed(2)})`,
  playful: (p) => p.sat >= 0.15 || `cited image is low-saturation (saturation ${p.sat.toFixed(2)})`,
  y2k: (p) => p.sat >= 0.12 || `cited image is nearly colourless (saturation ${p.sat.toFixed(2)})`,
};

/* 像素量不出来的词：出处里必须说出它的定义特征，否则就是凭印象。 */
export const EVIDENCE_RULES = {
  terminal: /等宽|字符画|ASCII|命令行|终端/,
  editorial: /衬线/,
  brutal: /粗(黑)?描边|硬投影|粗黑|撞色/,
  glass: /模糊|半透明|毛玻璃/,
  pixel: /像素/,
  'hand-drawn': /手绘|手写|涂鸦|抖动/,
  bento: /大小不一|拼成|格子|便当/,
};

/** 程序检查。返回问题列表；空 = 通过。stats[i] 是第 i+1 张图的像素统计。 */
/* 只有多作者社区 / 市场才可能“风格多样”；单一团队的库不许用 mixed 绕开“至少两张图”的规则。 */
export function mixedAllowed(item) {
  const organization = item.facets?.contentOrganization || [];
  return organization.includes('community-feed') || organization.includes('marketplace');
}

export function checkStyle(out, stats = [], subject = 'components', allowMixed = false) {
  const issues = [];
  if (!out || typeof out !== 'object') return ['not-object'];
  const styles = Array.isArray(out.styles) ? out.styles : [];
  if (styles.length > 3) issues.push('more-than-3');
  for (const s of styles) {
    if (!STYLE_IDS.includes(s?.id)) issues.push(`not-in-vocab:${s?.id}`);
    const images = Array.isArray(s?.images) ? [...new Set(s.images)] : [];
    if (!images.length || images.some((i) => ![1, 2, 3].includes(i))) issues.push(`no-image:${s?.id}`);
    if (['components', 'design-system'].includes(subject) && !out.mixed && images.length < 2) issues.push(`seen-in-one-image-only:${s?.id}`);
    if (typeof s?.evidenceZh !== 'string' || s.evidenceZh.trim().length < 4) issues.push(`no-evidence:${s?.id}`);
    else if (EVIDENCE_RULES[s.id] && !EVIDENCE_RULES[s.id].test(s.evidenceZh)) issues.push(`evidence-lacks-defining-trait:${s.id}`);
    const rule = PIXEL_RULES[s?.id];
    for (const i of images) {
      const stat = stats[i - 1];
      if (s.id === 'dark-neon' && !stat) issues.push(`missing-subject-pixels:dark-neon@${i}`);
      if (rule && stat) { const verdict = rule(stat); if (verdict !== true) issues.push(`pixels-contradict:${s.id}@${i}: ${verdict}`); }
    }
  }
  const ids = styles.map((s) => s?.id);
  if (new Set(ids).size !== ids.length) issues.push('duplicate-id');
  for (const [a, b] of CONFLICTS) if (ids.includes(a) && ids.includes(b)) issues.push(`conflict:${a}+${b}`);
  if (out.subjectVisible === false && ids.length) issues.push('invisible-subject-with-styles');
  if (out.mixed && !allowMixed) issues.push('mixed-not-allowed-for-single-author-site');
  if (out.mixed && ids.length > 2) issues.push('mixed-with-more-than-2');
  const sig = String(out.signatureZh || '');
  if (out.subjectVisible !== false && (sig.length < 8 || sig.length > 48)) issues.push('signature-length');
  if (/精美|高级感|现代感|极致/.test(sig) || /\d/.test(sig.replace(/[23]D/g, ''))) issues.push('signature-filler-or-number');
  return issues;
}

/** 第二次仍不过时的收尾：逐个词修剪，而不是整份作废。返回 {out, dropped}；修剪后没有可用内容则 out = null。 */
export function salvage(out, stats, subject, allowMixed) {
  if (!out || typeof out !== 'object') return {out: null, dropped: ['invalid']};
  const dropped = [];
  const mixed = Boolean(out.mixed) && allowMixed;
  const needTwo = ['components', 'design-system'].includes(subject) && !mixed;
  const kept = [];
  for (const style of Array.isArray(out.styles) ? out.styles : []) {
    if (!STYLE_IDS.includes(style?.id) || typeof style?.evidenceZh !== 'string' || style.evidenceZh.trim().length < 4) { dropped.push(`${style?.id}:invalid`); continue; }
    if (EVIDENCE_RULES[style.id] && !EVIDENCE_RULES[style.id].test(style.evidenceZh)) { dropped.push(`${style.id}:evidence-lacks-defining-trait`); continue; }
    const rule = PIXEL_RULES[style.id];
    const images = [...new Set(Array.isArray(style.images) ? style.images : [])].filter((i) => [1, 2, 3].includes(i))
      .filter((i) => !rule || (style.id !== 'dark-neon' && !stats[i - 1]) || (stats[i - 1] && rule(stats[i - 1]) === true));
    if (!images.length || (needTwo && images.length < 2)) { dropped.push(`${style.id}:not-recurring-after-pixel-check`); continue; }
    if (kept.some((k) => CONFLICTS.some(([a, b]) => (a === k.id && b === style.id) || (b === k.id && a === style.id)))) { dropped.push(`${style.id}:conflicts-with-higher-ranked`); continue; }
    if (kept.some((k) => k.id === style.id)) continue;
    kept.push({...style, images});
  }
  const limited = kept.slice(0, mixed ? 2 : 3);
  if (kept.length > limited.length) dropped.push(...kept.slice(limited.length).map((k) => `${k.id}:over-limit`));
  const sig = String(out.signatureZh || '').trim();
  const sigOk = sig.length >= 8 && sig.length <= 48 && !/精美|高级感|现代感|极致/.test(sig) && !/\d/.test(sig.replace(/[23]D/g, ''));
  if (out.subjectVisible === false) return {out: {subjectVisible: false, mixed: false, styles: [], signatureZh: ''}, dropped};
  if (!limited.length) return {out: null, dropped};
  return {out: {subjectVisible: true, mixed, styles: limited, signatureZh: sigOk ? sig : ''}, dropped};
}

