// Interactive detail-stage behaviors. Gallery tiles retain their authored CSS previews.
// No network requests besides the same-origin, attributed image used by pixel sampling.
const PHOTO = '/effects-atlas/assets/mask-20260928/fronalpstock.jpg';
const labels = {
  zh: { scratch: '拖动刮开照片；也可使用下方按钮', reveal: '全部揭开', reset: '重新覆盖', done: '照片已全部揭开', partial: '已擦开局部，可继续拖动', canvas: '照片刮擦区域，拖动鼠标或手指；按 Enter 全部揭开', spotlight: '照片探照区域。移动指针或用方向键移动窗口', crop: '切换照片的完整取景', scroll: '可滚动的地点清单', progress: '资料准备进度', image: '弗罗纳尔普施托克山谷照片的像素采样演示', imageFailure: '照片暂未加载，请重播重试' },
  en: { scratch: 'Drag to scratch the photo, or use the buttons', reveal: 'Reveal all', reset: 'Reset coating', done: 'The full photograph is revealed', partial: 'Partly revealed; keep dragging', canvas: 'Scratch area. Drag a pointer or finger; press Enter to reveal all', spotlight: 'Photo spotlight. Move the pointer or use arrow keys', crop: 'Toggle the full photograph crop', scroll: 'Scrollable destination list', progress: 'Preparation progress', image: 'Pixel-sampling study of the Fronalpstock landscape photograph', imageFailure: 'The photo could not load. Replay to retry' },
};

function listen(target, name, handler, controller, options = {}) {
  target.addEventListener(name, handler, { ...options, signal: controller.signal });
}

function scratch(host, L, controller) {
  const coating = host.querySelector('i');
  const canvas = document.createElement('canvas');
  canvas.tabIndex = 0;
  canvas.setAttribute('aria-label', L.canvas);
  canvas.setAttribute('role', 'img');
  coating.replaceChildren(canvas);
  const actions = document.createElement('div');
  actions.className = 'mask-actions';
  const status = document.createElement('span');
  status.className = 'mask-status';
  status.setAttribute('role', 'status');
  status.textContent = L.scratch;
  const reveal = document.createElement('button');
  const reset = document.createElement('button');
  reveal.type = reset.type = 'button';
  reveal.textContent = L.reveal;
  reset.textContent = L.reset;
  actions.append(reveal, reset);
  host.append(actions, status);
  const context = canvas.getContext('2d');
  let width = 0, height = 0, current = null, points = [], fullyRevealed = false;
  const stroke = (a, b) => {
    context.globalCompositeOperation = 'destination-out';
    context.lineWidth = 34;
    context.lineCap = context.lineJoin = 'round';
    context.beginPath();
    context.moveTo(a.x * width, a.y * height);
    context.lineTo(b.x * width + .01, b.y * height + .01);
    context.stroke();
  };
  const draw = () => {
    const bounds = coating.getBoundingClientRect();
    width = bounds.width; height = bounds.height;
    if (!width || !height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);
    if (fullyRevealed) return;
    context.globalCompositeOperation = 'source-over';
    const finish = context.createLinearGradient(0, 0, width, height);
    finish.addColorStop(0, '#d8e0dc'); finish.addColorStop(.5, '#a6b7af'); finish.addColorStop(1, '#d0dbd6');
    context.fillStyle = finish; context.fillRect(0, 0, width, height);
    context.strokeStyle = '#edf2ee'; context.lineWidth = 1;
    for (let x = -height; x < width; x += 14) {
      context.beginPath(); context.moveTo(x, 0); context.lineTo(x + height, height); context.stroke();
    }
    // A small initial opening shows that a real image, not an empty rectangle, is underneath.
    stroke({ x: .37, y: .53 }, { x: .63, y: .47 });
    for (const [a, b] of points) stroke(a, b);
  };
  const revealAll = () => {
    fullyRevealed = true; context.clearRect(0, 0, width, height); status.textContent = L.done;
    canvas.dataset.revealed = 'all';
  };
  const point = event => {
    const rect = canvas.getBoundingClientRect();
    return { x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)), y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)) };
  };
  listen(canvas, 'pointerdown', event => {
    if (event.button !== 0 || fullyRevealed) return;
    event.preventDefault(); canvas.setPointerCapture(event.pointerId); canvas.focus({ preventScroll: true });
    current = { id: event.pointerId, point: point(event) };
    points.push([current.point, current.point]); stroke(current.point, current.point);
    status.textContent = L.partial; canvas.dataset.revealed = 'partial';
  }, controller);
  listen(canvas, 'pointermove', event => {
    if (!current || current.id !== event.pointerId) return;
    const next = point(event); points.push([current.point, next]); stroke(current.point, next); current.point = next;
  }, controller);
  const release = event => {
    if (current?.id !== event.pointerId) return;
    current = null;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  };
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) listen(canvas, event, release, controller);
  listen(canvas, 'keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); revealAll(); }
  }, controller);
  listen(reveal, 'click', revealAll, controller);
  listen(reset, 'click', () => { points = []; current = null; fullyRevealed = false; canvas.dataset.revealed = 'initial'; status.textContent = L.scratch; draw(); }, controller);
  const observer = new ResizeObserver(draw); observer.observe(coating); draw();
  return { update() {}, destroy() { observer.disconnect(); actions.remove(); status.remove(); coating.replaceChildren(); } };
}

function spotlight(host, L, controller) {
  host.tabIndex = 0; host.setAttribute('role', 'img'); host.setAttribute('aria-label', L.spotlight);
  let x = 50, y = 50;
  const set = () => { host.style.setProperty('--spot-x', `${x}%`); host.style.setProperty('--spot-y', `${y}%`); };
  listen(host, 'pointermove', event => { const r = host.getBoundingClientRect(); x = Math.max(0, Math.min(100, (event.clientX - r.left) / r.width * 100)); y = Math.max(0, Math.min(100, (event.clientY - r.top) / r.height * 100)); set(); }, controller);
  listen(host, 'pointerdown', event => { if (event.pointerType === 'touch') { host.setPointerCapture(event.pointerId); host.focus({ preventScroll: true }); } }, controller);
  listen(host, 'keydown', event => {
    const move = { ArrowLeft: [-5, 0], ArrowRight: [5, 0], ArrowUp: [0, -5], ArrowDown: [0, 5] }[event.key];
    if (!move) return;
    event.preventDefault(); event.stopPropagation(); x = Math.max(0, Math.min(100, x + move[0])); y = Math.max(0, Math.min(100, y + move[1])); set();
  }, controller);
  return { update() {}, destroy() { host.removeAttribute('tabindex'); host.removeAttribute('role'); host.removeAttribute('aria-label'); host.style.removeProperty('--spot-x'); host.style.removeProperty('--spot-y'); } };
}

function pixelate(host, L) {
  const layer = host.querySelector('b');
  const canvas = document.createElement('canvas');
  canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', L.image);
  layer.append(canvas);
  const photo = new Image();
  const buffer = document.createElement('canvas');
  let samples = 32, loaded = false, alive = true;
  const paint = () => {
    if (!loaded || !alive) return;
    const rect = host.getBoundingClientRect(), ratio = rect.width / rect.height;
    if (!Number.isFinite(ratio)) return;
    canvas.width = Math.max(1, Math.round(rect.width)); canvas.height = Math.max(1, Math.round(rect.height));
    buffer.width = Math.max(1, Math.min(canvas.width, samples)); buffer.height = Math.max(1, Math.round(buffer.width / ratio));
    const photoRatio = photo.naturalWidth / photo.naturalHeight;
    const cropWidth = photoRatio > ratio ? photo.naturalHeight * ratio : photo.naturalWidth;
    const cropHeight = photoRatio > ratio ? photo.naturalHeight : photo.naturalWidth / ratio;
    buffer.getContext('2d').drawImage(photo, (photo.naturalWidth - cropWidth) / 2, (photo.naturalHeight - cropHeight) / 2, cropWidth, cropHeight, 0, 0, buffer.width, buffer.height);
    const ctx = canvas.getContext('2d'); ctx.imageSmoothingEnabled = false; ctx.drawImage(buffer, 0, 0, canvas.width, canvas.height);
    canvas.dataset.samples = String(buffer.width);
  };
  photo.onload = () => { loaded = true; paint(); };
  photo.onerror = () => { if (alive) { canvas.setAttribute('aria-label', L.imageFailure); canvas.hidden = true; } };
  photo.src = PHOTO;
  const observer = new ResizeObserver(paint); observer.observe(host);
  return { update(params) { samples = Number(params.samples ?? 32); paint(); }, destroy() { alive = false; photo.onload = photo.onerror = null; observer.disconnect(); canvas.remove(); } };
}

export function mountMaskDemo(stage, item, lang = 'zh') {
  const L = labels[lang] || labels.zh;
  const host = stage.querySelector('.fx');
  if (!host || !item.interactive) return null;
  const controller = new AbortController();
  host.dataset.enhanced = 'true';
  let demo;
  if (item.interactive === 'scratch') demo = scratch(host, L, controller);
  else if (item.interactive === 'spotlight') demo = spotlight(host, L, controller);
  else if (item.interactive === 'pixelate') demo = pixelate(host, L);
  else if (item.interactive === 'crop-toggle') {
    host.tabIndex = 0; host.setAttribute('role', 'button'); host.setAttribute('aria-label', L.crop); host.setAttribute('aria-pressed', 'false');
    const toggle = () => { const open = host.dataset.open !== 'true'; host.dataset.open = String(open); host.setAttribute('aria-pressed', String(open)); };
    listen(host, 'focus', () => { if (host.matches(':focus-visible')) { host.dataset.open = 'true'; host.setAttribute('aria-pressed', 'true'); } }, controller);
    listen(host, 'click', toggle, controller);
    listen(host, 'keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); toggle(); } }, controller);
    demo = { update() {}, destroy() { for (const name of ['tabindex', 'role', 'aria-label', 'aria-pressed', 'data-open']) host.removeAttribute(name); } };
  } else if (item.interactive === 'progress') {
    host.setAttribute('role', 'progressbar'); host.setAttribute('aria-label', L.progress); host.setAttribute('aria-valuemin', '0'); host.setAttribute('aria-valuemax', '100');
    demo = { update(params) { const n = Number(params.p ?? 68); host.querySelector('i').textContent = `${n}%`; host.setAttribute('aria-valuenow', String(n)); }, destroy() { host.querySelector('i').textContent = ''; for (const name of ['role', 'aria-label', 'aria-valuemin', 'aria-valuemax', 'aria-valuenow']) host.removeAttribute(name); } };
  } else if (item.interactive === 'onboarding') {
    const rows = [...stage.querySelectorAll('.fx')];
    demo = { update(params) { rows.forEach((row, index) => { row.dataset.active = String(index + 1 === Number(params.target ?? 3)); }); }, destroy() { rows.forEach(row => delete row.dataset.active); } };
  } else if (item.interactive === 'scroll-edges' || item.interactive === 'manual-scroll') {
    const scroll = stage.querySelector('.fxscroll');
    scroll.dataset.manualScroll = 'true'; scroll.tabIndex = 0; scroll.setAttribute('aria-label', L.scroll);
    const update = () => {
      const remaining = scroll.scrollHeight - scroll.clientHeight - scroll.scrollTop;
      scroll.style.setProperty('--top-fade', scroll.scrollTop > 1 ? '32px' : '0px');
      scroll.style.setProperty('--bottom-fade', remaining > 1 ? '32px' : '0px');
    };
    listen(scroll, 'scroll', update, controller, { passive: true });
    listen(scroll, 'keydown', event => { if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].includes(event.key)) event.stopPropagation(); }, controller);
    const observer = new ResizeObserver(update); observer.observe(scroll); update();
    demo = { update, destroy() { observer.disconnect(); delete scroll.dataset.manualScroll; scroll.removeAttribute('tabindex'); scroll.removeAttribute('aria-label'); } };
  }
  if (!demo) { controller.abort(); delete host.dataset.enhanced; return null; }
  return { host, update: demo.update, destroy() { controller.abort(); demo.destroy(); delete host.dataset.enhanced; } };
}
