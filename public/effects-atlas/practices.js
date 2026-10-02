// Generated content stays separate from the existing effect modules.
// Entries are produced by scripts/build-creative-practices.mjs and carry the same
// flat {zh,en,dz,de,pz,pe} shape the hand-written effect modules use.
const STUDIES = [
  ['type-study', '文字编排', 'Typography studies', '用字级、字形和字面关系组织信息。', 'Organize information with type scale, letterform and optical size.'],
  ['composition-study', '平面构成', 'Composition studies', '从对齐、分组和阅读方向建立画面秩序。', 'Build order from alignment, grouping and reading direction.'],
  ['grid-study', '网格与比例', 'Grid studies', '先确定边界与分区，再安排文字和图像。', 'Set the bounds and divisions first, then place text and image.'],
  ['light-study', '布光与材质', 'Lighting studies', '观察明暗如何描述形态与表面。', 'Read how light and shade describe form and surface.'],
  ['space-study', '空间层次', 'Depth studies', '用遮挡、起伏和阴影解释前后关系。', 'Explain front-to-back order with occlusion, relief and shadow.'],
].map(([id, zh, en, dz, de]) => ({ id, zh, en, dz, de }));

// A record missing any of these would throw deep inside the renderer, and one
// throw blanks the whole atlas, so drop incomplete records at the edge instead.
const isComplete = (p) => p && typeof p.id === 'string' && ['zh', 'en', 'dz', 'de', 'pz', 'pe'].every(k => typeof p[k] === 'string' && p[k].trim()) && p.practice && typeof p.practice === 'object';

export async function addPractices(categories) {
  const response = await fetch('/data/creative-practices.json');
  if (!response.ok) throw new Error('Creative practice data could not be loaded');
  const entries = (await response.json()).filter(isComplete);
  const used = entries.filter(p => p.category === 'atlas').map(p => p.atlasCategory);
  const known = new Set(STUDIES.map(s => s.id));
  const named = STUDIES.filter(s => used.includes(s.id));
  // A study the data introduces but this list does not know still gets a slot,
  // so a new category is never silently dropped from the wall.
  const extra = [...new Set(used)].filter(id => id && !known.has(id))
    .map(id => { const first = entries.find(p => p.atlasCategory === id); return { id, zh: first.atlasCategoryZh || id, en: first.atlasCategoryEn || id, dz: first.atlasCategoryDz || '', de: first.atlasCategoryDe || '' }; });
  const studies = [...named, ...extra].map(s => ({ ...s, items: [] }));
  categories = [...studies, ...categories];
  for (const category of categories) {
    const additions = entries.filter(p => p.category === 'atlas' && p.atlasCategory === category.id).map(p => ({
      id: p.id, zh: p.zh, en: p.en, dz: p.dz, de: p.de,
      pz: p.pz, pe: p.pe, demo: 'practice', params: [],
      kz: p.kz || [], kw: p.kw || [],
      practice: { ...p.practice, preview: p.preview, images: p.source && p.source.images || [] },
    }));
    category.items = [...additions, ...category.items.filter(item => !additions.some(p => p.id === item.id))];
  }
  return categories;
}
