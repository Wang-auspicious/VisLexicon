// Content specimens for the fixed b/u/i card scaffold. Existing dimensions and
// effect CSS remain authoritative. Business values below are fictional examples.
export const SAMPLE_VERSION = '2026-09-28';
const PHOTO = '/effects-atlas/assets/mask-20260928/fronalpstock.jpg';
const photoRefs = [
  { n: 'Photo · Hannes Röst · CC BY-SA 3.0', u: 'commons.wikimedia.org/wiki/File:Fronalpstock_big.jpg' },
  { n: 'Image license · CC BY-SA 3.0', u: 'creativecommons.org/licenses/by-sa/3.0/' },
];
const photoCategories = new Set(['cursor', 'filter', 'gesture', 'gradient', 'gsap', 'media', 'physics', 'react', 'shader', 'shadow', 'simlib', 'svg', 'threed']);
const textCategories = {
  a11y: ['季度报告\n下载内容摘要', 'Quarterly report\nDownload summary', '可访问内容', 'Accessible content'],
  agent: ['整理照片来源\n等待人工确认', 'Organize image sources\nAwaiting review', '待确认操作', 'Review an action'],
  ai: ['已找到相关资料\n阅读原文后再引用', 'Related sources found\nRead before citing', '研究手记草稿', 'Research note draft'],
  commerce: ['山地摄影手册\n纸质版 · 一册', 'Mountain field guide\nOne printed copy', '订单摘要', 'Order summary'],
  form: ['目的地\nFronalpstock', 'Destination\nFronalpstock', '旅行信息草稿', 'Travel details draft'],
  gui: ['照片资料\n添加标题与作者', 'Image details\nAdd title and author', '编辑图片信息', 'Edit image details'],
  i18n: ['照片档案\n文字方向与语言', 'Photo archive\nLanguage and direction', '多语言内容', 'Localized content'],
  mobile: ['旅行手记已保存\n离线时也可阅读', 'Field notes saved\nAvailable offline', '山地手记', 'Mountain field notes'],
  nav: ['照片\n手记\n来源', 'Photos\nNotes\nCredits', '资料导航', 'Archive navigation'],
  number: ['12 / 20\n照片已整理', '12 / 20\nPhotos organized', '整理进度', 'Organization progress'],
  overlay: ['照片说明已更新\n可撤销这次修改', 'Photo caption updated\nThis change can be undone', '更改已保存', 'Change saved'],
  perf: ['标题先显示\n随后补充照片与图注', 'Title available first\nPhoto and caption follow', '渐进内容示例', 'Progressive content'],
  responsive: ['山地摄影档案\n在窄屏继续阅读', 'Mountain photo archive\nReadable on small screens', '响应式内容', 'Responsive content'],
  state: ['照片资料\n当前状态与下一步', 'Photo archive\nStatus and next step', '资料状态', 'Archive status'],
  theme: ['阅读与记录\n保持文字可辨认', 'Read and annotate\nKeep text legible', '阅读面板', 'Reading panel'],
  toggle: ['照片已加入收藏\n再次操作可取消', 'Photo saved to favorites\nThe action is reversible', '收藏状态', 'Saved state'],
  wapi: ['山地摄影档案\n按容器尺寸调整内容', 'Mountain photo archive\nContent adapts to its container', '浏览器能力示例', 'Browser feature sample'],
};
const rows = {
  'agent/toolcall': ['读取照片元数据\n正在解析 EXIF', 'Read image metadata\nParsing EXIF'],
  'agent/memorywrite': ['记住偏好：保留原片\n仅应用于本工作区', 'Remember: keep originals\nFor this workspace only'],
  'agent/runcodecell': ['const files = ["ridge.jpg"];\nfiles.map(readMetadata);', 'const files = ["ridge.jpg"];\nfiles.map(readMetadata);'],
  'agent/longrunnotify': ['资料整理仍在继续\n完成后显示结果', 'Archive preparation continues\nResults appear when ready'],
  'agent/rollback': ['将恢复上一版图注\n原照片保持不变', 'Restore the previous caption\nKeep the original photograph'],
  'agent/guardrail': ['这项操作需要确认\n发布前检查来源与授权', 'Review required\nCheck sources before publishing'],
  'agent/proactivenudge': ['照片缺少作者信息\n补充来源后再发布', 'The photo has no author credit\nAdd a source before publishing'],
  'ai/toolprogress': ['读取 2 / 3 份资料\n正在整理引用', 'Reading 2 / 3 sources\nOrganizing citations'],
  'ai/citationhover': ['来源 01\n原文、作者与发布日期', 'Source 01\nOriginal, author, and date'],
  'ai/codeblock': ['const crop = { x: 50, y: 50 };\nimage.style.objectFit = "cover";', 'const crop = { x: 50, y: 50 };\nimage.style.objectFit = "cover";'],
  'ai/humanreview': ['发布前请确认\n照片来源和许可均已填写', 'Review before publication\nCheck photo source and license'],
  'ai/progressivedisclosure': ['结论摘要\n展开后查看证据与过程', 'Conclusion summary\nExpand for evidence and process'],
  'gui/emptystate': ['还没有照片\n从第一张图片开始整理', 'No photos yet\nStart with the first image'],
  'gui/snackbar': ['图注已保存', 'Caption saved'],
  'gui/bannerinline': ['原照片不会被覆盖', 'Original photographs are preserved'],
  'gui/callout': ['使用照片前保留作者署名', 'Keep the author credit with the photo'],
  'gui/dropzone': ['将照片放到这里\nJPEG / PNG', 'Drop a photo here\nJPEG / PNG'],
  'gui/undosnack': ['已移除一张照片 · 可撤销', 'Photo removed · Undo available'],
  'state/zerostate': ['还没有项目\n先创建一个摄影档案', 'No projects yet\nCreate a photo archive'],
  'state/reconnecting': ['正在重新连接\n本地修改已保留', 'Reconnecting\nLocal changes are preserved'],
  'state/processingasync': ['照片处理中\n可以继续整理图注', 'Photo processing continues\nYou can keep editing captions'],
  'state/lockedstate': ['此档案为只读\n请向所有者申请编辑权限', 'This archive is read-only\nAsk its owner for edit access'],
  'state/digestbatch': ['本次导入摘要\n请检查重复与缺失来源', 'Import summary\nReview duplicates and missing sources'],
  'overlay/confirmdanger': ['移除这张照片？\n原文件仍保留在本机', 'Remove this photo?\nThe original file remains on disk'],
  'overlay/emptystate': ['还没有收藏\n选择一张照片开始', 'No saved photos\nChoose a photo to begin'],
  'overlay/errorstate': ['照片加载失败\n保留图注并提供重试', 'The photo could not load\nKeep the caption and allow retry'],
  'overlay/progressnotify': ['正在保存图注\n请稍候', 'Saving the caption\nPlease wait'],
  'overlay/exitintent': ['还有未保存的图注\n先保存，再离开', 'A caption is unsaved\nSave before leaving'],
  'mobile/permissionprime': ['允许读取你选择的照片\n用于创建本地摄影档案', 'Read the photos you select\nBuild a local photo archive'],
  'mobile/appclip': ['预览山地摄影手记\n无需先创建账号', 'Preview mountain field notes\nNo account required for the preview'],
  'form/formsummary': ['请补充照片作者\n请填写来源网址', 'Add a photo author\nEnter the source URL'],
};
// These originals use a text-bearing ::after and intentionally hide b/u/i.
const inlineRows = {
  'a11y/textspacing': ['这段文字用于检查放大后的行距、字距和自动换行。内容不能被固定高度截掉。', 'Use this paragraph to inspect line height, spacing, and wrapping. A fixed height must not cut off the text.'],
  'a11y/timeoutwarn': ['会话将在 60 秒后过期。继续停留可以保留编辑状态。', 'The session expires in 60 seconds. Staying extends the editing session.'],
  'a11y/undoable': ['已移除一张照片 · 撤销', 'Photo removed · Undo'],
  'commerce/stocklevel': ['库存示例：剩余 3 册\n配送时间在确认地址后展示', 'Inventory example: 3 copies left\nDelivery depends on the address'],
  'commerce/guestcheckout': ['以游客身份结算\n付款后可选择创建账号', 'Check out as a guest\nCreate an account after payment if needed'],
  'commerce/installment': ['总价 ¥120 · ¥40 × 3 期\n总利息 ¥0 · 不含额外费用', 'Total ¥120 · 3 payments of ¥40\nInterest ¥0 · no additional fees'],
  'commerce/orderconfirm': ['订单 SAMPLE-001 已创建\n配送时间尚待确认', 'Order SAMPLE-001 created\nDelivery date awaiting confirmation'],
  'commerce/inventoryreserve': ['演示倒计时 09:24\n此处不会实际预留库存', 'Timer specimen 09:24\nNo inventory is actually reserved'],
  'commerce/taxdisclosure': ['示例价格已含税\n其他费用在确认订单前列出', 'Sample price includes tax\nOther fees appear before order confirmation'],
  'i18n/truncatecjk': ['从山顶向远方眺望，云层在山脊上留下层次。这段图注用于检查两行截断后，读者还能否理解主要信息。', 'Clouds add depth above the distant ridge. This caption checks whether a two-line truncation still communicates the main point.'],
  'i18n/translationkey': ['photo.caption.save\n按钮文案：保存图注', 'photo.caption.save\nButton label: Save caption'],
  'mobile/toastmobile': ['已加入收藏 · 撤销', 'Added to favorites · Undo'],
  'mobile/offlinemobile': ['网络较慢 · 仅显示文字', 'Slow connection · Text-only view'],
  'state/emptysearch': ['没有找到“雪山夜景”\n试试更短的关键词：雪山', 'No matches for “snowy mountain at night”\nTry a shorter query: mountain'],
  'state/emptyfiltered': ['当前筛选条件下没有照片\n清除筛选后查看全部内容', 'No photos match these filters\nClear filters to view the full archive'],
  'state/emptycleared': ['全部整理完了\n可以开始下一组照片', 'All photos are organized\nYou can begin the next collection'],
  'state/partialfail': ['示例导入：12 张成功，2 张失败\n失败原因：文件格式不支持', 'Sample import: 12 succeeded, 2 failed\nReason: unsupported file format'],
  'state/errorfull': ['照片暂时无法加载\n重试，或返回摄影档案', 'The photo cannot load right now\nRetry or return to the archive'],
  'state/offline': ['当前离线 · 图注会在联网后同步', 'Offline · Captions sync after reconnection'],
  'state/permissiondenied': ['查看者不能修改图注\n向档案所有者申请编辑权限', 'Viewers cannot edit captions\nAsk the archive owner for access'],
  'state/notfound': ['404 · 找不到这张照片\n返回摄影档案', '404 · Photo not found\nReturn to the photo archive'],
  'state/gone': ['这张照片已移入回收站\n可以在保留期内恢复', 'This photo is in the trash\nRestore it during the retention period'],
  'state/maintenance': ['摄影档案暂时维护中\n已保存的原文件不受影响', 'The photo archive is under maintenance\nSaved original files are unchanged'],
  'state/successtoast': ['图注已保存 · 撤销', 'Caption saved · Undo'],
  'state/undostrip': ['已移除三张照片 · 撤销', 'Three photos removed · Undo'],
  'state/deprecated': ['旧版导出方式即将停用\n请切换到新版导出', 'The old export format is being retired\nSwitch to the new export format'],
};
const retain = {
  'gui/skeletonshape': 'Intentional loading skeleton; replacing its blocks with content would remove the subject being demonstrated.',
  'theme/codetheme': 'Existing code-token specimen, not an empty media card.',
};
const targeted = {
  layered: ['把同一张照片卡放在多层阴影上，观察近边缘的接触影与远处的柔影如何分工。', 'Compare the tight contact shadow and the wider soft shadow beneath the same photo card.', '每层分别控制偏移、模糊与透明度；靠近物体的层更紧。照片、边框和卡片尺寸保持一致，比较才有意义。', 'Tune offset, blur, and opacity per layer. Keep the photo, border, and dimensions fixed so the shadow comparison remains meaningful.'],
  softsingle: ['用一层短柔影把照片卡与白色背景分开，适合低层级内容卡，不会把它抬成浮窗。', 'A single short shadow separates the photo card from its background without suggesting a floating dialog.', '示例偏移 1px、模糊 2px；这些数值只对应当前尺寸，不是所有界面的通用处方。浅底色下还要检查边界能否被看见。', 'This specimen uses a 1px offset and 2px blur. Those values fit this size, not every interface; check whether the boundary remains visible.'],
  tinted: ['让照片卡的投影带一点强调色，适合暖色背景或品牌色面；照片本身保持原色，便于比较。', 'Tint the card shadow with the accent color while keeping the photograph unchanged for comparison.', '颜色参与阴影透明度混合；先控制饱和度和不透明度，再调整模糊半径。带色并不天然更高级，过饱和会像发光。', 'Control saturation and opacity before blur radius. A tinted shadow is not inherently better; excessive saturation reads as a glow.'],
  hardshadow: ['给完整照片卡加零模糊的偏移投影，边缘像印刷错版一样清楚。它适合强图形边界和海报式卡片。', 'A zero-blur offset shadow gives the complete photo card a crisp, print-like edge for graphic layouts.', 'box-shadow 的第三个长度是模糊半径，这里为 0。8px 偏移不会占据布局空间；相邻卡片仍需预留可见投影的位置。', 'The third box-shadow length is blur radius, set to zero here. The 8px offset occupies no layout space, so neighboring cards need clearance.'],
  hoverlift: ['悬停后照片卡抬高并出现更宽的阴影，表示这张卡可以进一步查看。标题随卡片一起移动。', 'Hover lifts the photo card and broadens its shadow, suggesting that the card can be explored further.', '位移与阴影同时过渡，照片不单独缩放。当前演示是 CSS 悬停反馈；实际产品还需真实链接和键盘焦点反馈。', 'Transition the offset and shadow together without zooming the photograph separately. Production use also needs a real link and keyboard focus feedback.'],
  dropdownshadow: ['较深的双层阴影把内容卡从背景中提起，可用于比较菜单或浮层的视觉层级。', 'A deeper two-layer shadow lifts content above the background for a popover or menu elevation study.', '近层收紧接触边缘，远层表现悬浮距离。本例是一张视觉样本卡，不包含菜单的焦点、定位和关闭逻辑。', 'A tight layer anchors the edge; a wide layer suggests distance. This is a visual specimen, not a menu with focus, positioning, or dismissal behavior.'],
  raise: ['照片卡在取起、悬浮、放回三个状态间循环，阴影随距离变化，而照片内容持续保持可辨认。', 'The photo card cycles through rest, lift, and settle while its changing shadow communicates distance.', '缩放、轻微旋转和阴影必须在同一关键帧序列对齐。减少动态时停在静态内容，不能留下透明空卡。', 'Align scale, rotation, and shadow in one keyframe sequence. Reduced motion should keep a visible resting card.'],
  cardstackshadow: ['两道实心阴影模拟照片卡后面的纸张堆叠，不额外复制正文，也不会造成多份可读内容。', 'Two solid shadows suggest stacked paper behind a photo card without duplicating readable content.', '用正 Y 偏移和负扩散半径产生逐层缩小的薄片。它只暗示数量，不能用于表示真实可翻阅的卡片堆。', 'Positive Y offsets and negative spread make the thin layers progressively smaller. They imply a stack, not an actual set of browsable cards.'],
  shadowtransition: ['悬停时只让预先画好的柔影逐渐出现，照片与标题保持静止，便于观察阴影透明度的作用。', 'Fade in a prepainted shadow on hover while keeping the photograph and title still.', '阴影放在独立伪元素上，动画改变 opacity。伪元素要 pointer-events:none，否则可能挡住卡片内的真实控件。', 'Put the shadow on a pseudo-element and animate opacity. Use pointer-events:none so it cannot cover actual card controls.'],
  shadowbleed: ['深色照片卡周围透出一圈扩散色光，强调选中或活动状态；卡内文字需要保持足够对比。', 'A colored halo around a dark photo card can mark an active state while its caption stays legible.', '模糊伪元素位于卡片后方，外容器不能把光晕裁掉。光晕属于强调光，不应当作自然投影或唯一选中提示。', 'Keep the blurred layer behind the card and allow its halo outside the container. It is an accent glow, not a natural shadow or a sole selection cue.'],
  shadowcorner: ['阴影主要落在卡片右下角，帮助比较有方向的光照与居中的柔影。', 'A shadow concentrated below the right corner makes directional lighting easier to compare with centered elevation.', 'X/Y 偏移确定光源反方向，负扩散半径收窄投影。整组卡片应共享方向，避免每张卡有不同的“太阳”。', 'Offsets define the direction and negative spread narrows the shadow. Use one direction across a group of cards.'],
  toastshadow: ['带照片的通知卡从下方进入，较宽阴影让它与背景内容分层；通知内容在停留时仍要读得清。', 'A photo notification enters from below with a broad shadow separating it from the background.', '这里只展示通知的视觉入场，生产实现还需停留时长、关闭入口和读屏播报策略。动画不要替代状态文案。', 'This shows visual entry only. Production notifications still need timing, dismissal, and an announcement strategy.'],
};
const otherNotes = {
  'filter/bright': ['用真实照片和图注一起测试亮度，观察提亮后云层细节是否丢失，文字是否也被过度提亮。', 'Test brightness on a real photograph and its caption, watching for lost cloud detail or overbright text.', 'filter:brightness() 作用于整张卡及其子元素。若只想处理照片，应把 filter 放到照片层；提亮不能恢复原图已经丢失的高光。', 'brightness() affects the whole card and its descendants. Apply it only to the photo layer when captions should stay unchanged. It cannot recover clipped highlights.'],
  'filter/holo': ['在真实照片上叠加移动的彩色反光，模拟纪念卡片的彩虹箔效果，照片细节仍然能够辨认。', 'A moving color reflection over a real photograph suggests a foil collector card while preserving recognizable image detail.', '同一背景包含彩色渐变与照片，使用 background-blend-mode:color-dodge 混合；移动渐变位置。它是二维反光样本，不包含真实视角或物理材质计算。', 'Blend a gradient and photograph with background-blend-mode:color-dodge and move the gradient. This is a 2D reflection specimen, not a view-dependent physical material.'],
  'filter/filtertransition': ['卡片从黑白变成彩色，山体、天空和图注的位置都保持不变，便于比较选中前后的视觉强调。', 'The same card moves from grayscale to color without changing its composition, making the emphasis easy to compare.', '两端都列出 grayscale、brightness、saturate，并保持函数顺序。滤镜覆盖整卡，包括文字；真正交互控件还需要键盘焦点反馈。', 'List grayscale, brightness, and saturate in the same order at both ends. Filters also affect the caption; actual controls need keyboard feedback.'],
  'media/imgcaptionoverlap': ['将真实地点标题放到照片下沿的纸色标签上，让图注与照片产生明确关联，而不直接压在复杂山纹上。', 'Place the destination title in a paper-colored label overlapping the photo edge instead of directly over busy mountain detail.', '标签保留实色底与小阴影，再用负 margin 形成叠层；文字仍是独立内容。改成多行标题时必须检查高度，不能让下一段内容被覆盖。', 'An opaque label, small shadow, and negative margin form the overlap while the caption remains separate text. Test multi-line captions for collisions.'],
  'media/imgcolorextract': ['用这张山地照片中实际采样出的蓝灰色设置卡片背景与色条，比较图像和界面色彩之间的连续性。', 'Use blue-gray colors sampled from this mountain photograph for the card and its swatches.', '此调色板由原图缩至 160×72 后进行五色中位切分量化得到，使用 #8babbf 与 #2b5876。演示预存结果，换图不会自动重新采样；动态实现需读取同源或允许 CORS 的像素。', 'The photo was resized to 160×72 and median-cut into five colors; this uses #8babbf and #2b5876. The palette is precomputed. Dynamic extraction needs same-origin or CORS-enabled pixels.'],
};
const sampleCss = kind => `.fx.fx-sample>u,.fx.fx-sample>i{background:none;color:var(--sample-ink,#29423e);border-radius:0;font-style:normal;text-decoration:none;white-space:nowrap;overflow:visible;font:400 10px/9px system-ui}.fx.fx-sample>u{font:600 12px/9px system-ui}.fx.fx-sample>u::after{content:attr(data-sample-title)}.fx.fx-sample>i::after{content:attr(data-sample-meta)}.fx.fx-sample>b{position:relative;overflow:hidden}` + (kind === 'photo' ? `.fx.fx-sample>b{background-image:url('${PHOTO}');background-size:cover;background-position:center}` : kind === 'labels' ? '' : `.fx.fx-sample>b::before{content:attr(data-sample-body);position:absolute;inset:12px;white-space:pre-line;font:500 13px/1.5 ${kind === 'code' ? 'ui-monospace,monospace' : 'system-ui'};color:var(--sample-ink,#29423e);display:flex;align-items:center}`);

export function enrichCardSamples(categories) {
  return categories.map(category => ({ ...category, items: category.items.map(original => {
    if (original.demo !== 'card' || category.id === 'mask' || original.cardSample) return original;
    const key = `${category.id}/${original.id}`;
    if (retain[key]) return { ...original, sampleDisposition: { status: 'intentional', reason: retain[key] } };
    const photo = photoCategories.has(category.id) || key === 'gui/placeholderghost';
    const defaults = textCategories[category.id];
    if (!photo && !defaults) return { ...original, sampleDisposition: { status: 'remaining', reason: 'No reviewed specimen for this category.' } };
    const inline = inlineRows[key];
    const body = inline || rows[key] || (defaults && defaults.slice(0, 2)) || ['', ''];
    const code = key === 'agent/runcodecell' || key === 'ai/codeblock';
    const tinyBody = [...original.css.matchAll(/\.fx>b\{([^}]*)\}/g)].some(match => { const h = match[1].match(/height:(\d+)px/); const w = match[1].match(/width:(\d+)px/); return (h && Number(h[1]) < 50) || (w && Number(w[1]) < 100); });
    const kind = inline ? 'inline' : photo ? 'photo' : code ? 'code' : tinyBody ? 'labels' : 'text';
    const title = photo ? ['Fronalpstock · 摄影档案', 'Fronalpstock · Photo archive'] : [body[0].split('\n')[0], body[1].split('\n')[0]];
    const cardSample = { kind, zh: { body: `${inline ? '〔示例〕\n' : ''}${body[0]}`, title: title[0], meta: photo ? '示例 · Hannes Röst' : '示例内容 · 非实时数据' }, en: { body: `${inline ? '[Sample]\n' : ''}${body[1]}`, title: title[1], meta: photo ? 'Sample · Hannes Röst' : 'Sample · not live data' } };
    if (code) cardSample.zh.title = cardSample.en.title = key.startsWith('agent/') ? 'read-metadata.js' : 'caption-preview.js';
    let css = original.css + (inline ? '.fx.fx-sample::after{content:attr(data-sample-body)}' : sampleCss(kind));
    if (['shadow/shadowbleed', 'theme/darkshadow', 'theme/emailtheme', 'gui/snackbar', 'gui/undosnack'].includes(key)) css += '.fx{--sample-ink:#e5eee8}';
    if (key === 'theme/lightdarkfn') css += '.fx{--sample-ink:light-dark(#29423e,#e5eee8)}';
    if (key === 'ai/codeblock') css += '.fx{--sample-ink:#e5eee8}.fx.fx-sample>b{background:#26313d}';
    if (key === 'filter/holo') css += `.fx.fx-sample>b{background-image:linear-gradient(100deg,#ff2d95,#f4dcb8,#75c4d4,#e5a68f,#ff2d95),url('${PHOTO}');background-size:300% 100%,cover;background-blend-mode:color-dodge;mix-blend-mode:normal}.fx{--sample-ink:#e5eee8}`;
    if (key === 'media/imgcaptionoverlap') css += '.fx.fx-sample>u{background:#fcfcfb;display:flex;align-items:center;padding-left:9px}';
    if (key === 'media/imgcolorextract') css += '.fx{background:linear-gradient(#d6e2e9,#fff);border-color:#8babbf}.fx.fx-sample>u{background:#8babbf}.fx.fx-sample>i{background:#2b5876;color:white}';
    if (key === 'react/mskeletontoreal') css += '@keyframes sampleReveal{0%,45%{opacity:1}50%,100%{opacity:0}}.fx{animation:none}.fx>u,.fx>i{position:relative}.fx>b::after,.fx>u::before,.fx>i::before{content:"";position:absolute;inset:0;background:#dfe5df;z-index:2;opacity:0;animation:sampleReveal 3s ease-in-out infinite alternate}';
    css += '.fxwrap{animation:none!important}@media(prefers-reduced-motion:reduce){.fx,.fx>b,.fx>u,.fx>i,.fx::before,.fx::after,.fx-sample *::before,.fx-sample *::after{animation:none!important;transition:none!important}}';
    const next = { ...original, css, cardSample, sampleDisposition: { status: 'enriched', kind, sampleOnly: !photo, behavior: 'Existing visual effect retained; content does not create a real business workflow.' } };
    if (photo) next.refs = [...(next.refs || []).filter(ref => !photoRefs.some(p => p.u === ref.u)), ...photoRefs];
    if (category.id === 'shadow' && targeted[original.id]) {
      [next.dz, next.de, next.pz, next.pe] = targeted[original.id];
      next.refs = [{ n: 'MDN · box-shadow', u: 'developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/box-shadow' }, ...next.refs];
    }
    if (otherNotes[key]) {
      [next.dz, next.de, next.pz, next.pe] = otherNotes[key];
      const property = category.id === 'filter' ? key.endsWith('/holo') ? 'background-blend-mode' : 'filter' : 'background-image';
      next.refs = [{ n: `MDN · ${property}`, u: `developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/${property}` }, ...next.refs];
    }
    if (key === 'react/mskeletontoreal') {
      next.pz = '相同尺寸的骨架层放在真实照片与文字上方，在 150ms 内淡出；低动态模式直接显示内容。本例用 CSS 演示视觉交接，不触发真实网络加载或 React Suspense。';
      next.pe = 'An equal-sized skeleton layer fades out over the photograph and text in 150ms. Reduced motion reveals content immediately. This CSS specimen does not trigger network loading or React Suspense.';
    }
    if (inline) {
      next.pz += ' 当前画面是示例文案，括号中的操作不执行真实业务。';
      next.pe += ' This is sample copy; named actions do not perform real business operations.';
    }
    return next;
  }) }));
}

export function cardSampleInventory(categories) {
  return enrichCardSamples(categories).flatMap(category => category.items.filter(item => item.demo === 'card').map(item => ({ id: `${category.id}/${item.id}`, ...item.sampleDisposition, ...(category.id === 'mask' ? { status: 'authored', reason: 'Individually rebuilt and browser-checked mask study.' } : {}) })));
}
