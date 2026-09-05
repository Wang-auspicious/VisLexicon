/* ============ 卡片模板判定（方案 §4.1） ============
 * 三种模板里本轮只实现 A（资源型）与 C（知识 / 工具型）：
 * 12 条语料里没有一条 single-site-showcase，造一个用不上的 B 模板
 * 就是「用结构性的壳替代还没做完的编辑工作」。
 *
 * 判定只读真实字段，不读任何人工分档。
 */

/* 索引层（site-index.json）把 primaryCategory 放在条目顶层，
 * 详情层（site/<id>.json）把它放在 classification 下。两种都接。 */
function primaryCategoryOf(entry) {
  return entry?.primaryCategory ?? entry?.classification?.primaryCategory ?? null
}

export function templateFor(entry) {
  const org = new Set(entry?.facets?.contentOrganization ?? [])
  const del = new Set(entry?.facets?.deliverables ?? [])
  /* C：拿走的是理解，不是文件 */
  if (org.has('standards-documentation') || del.has('glossary') || del.has('standard')) return 'C'
  /* B：站点自身就是被研究的样本。本轮语料里为空，规格留在方案里备查 */
  if (primaryCategoryOf(entry) === 'single-site-showcase') return 'B'
  /* A：有可复制 / 可安装的交付物（默认） */
  return 'A'
}

/* 模板差异只落在主图的取景比例上，于是「同宽、两档高度」（方案 §4.1 末句）：
 * A 型是宽幅整页取景——要看清它给的是什么东西；
 * C 型的首屏多半是长文，取景略高一档，少切掉一段正文。
 * 名称、一句拿走什么、权利微标、核验于四项在两种模板上完全一致，
 * 卡片墙的节奏不被模板打断。 */
export const TEMPLATE_ASPECT = {
  A: '16 / 10',
  C: '3 / 2',
}

export function aspectFor(entry) {
  return TEMPLATE_ASPECT[templateFor(entry)] ?? TEMPLATE_ASPECT.A
}
