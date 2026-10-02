// 电商与交易：从看见商品到付完钱，每一步都有专有词汇
const E = 'cubic-bezier(.22,1,.36,1)';
const I = (id, zh, en, dz, de, pz, pe, demo, css) => ({ id, zh, en, dz, de, pz, pe, demo, css });

export default {
  id: 'commerce', zh: '电商与交易', en: 'Commerce & checkout',
  dz: '商品图、规格选择、加购动效、购物车、结算步骤、定价套餐——从看见到付完钱的全套词汇',
  de: 'Galleries, variant pickers, add-to-cart motion, carts, checkout steps and pricing tiers — from browsing to paid',
  items: [
    I('productgallery', '商品图廊', 'Product gallery', '主图加一排缩略图', 'A hero image with a thumbnail rail',
      '缩略图当前项要有边框而不只是变亮；切换时主图淡入而不是滑动，避免误以为可横滑。',
      'Mark the active thumbnail with a border, and cross-fade the hero rather than sliding it.',
      'media', `@keyframes fxk{0%,100%{filter:hue-rotate(0)}50%{filter:hue-rotate(24deg)}}.fxmedia{width:min(300px,74%)}.fx{animation:fxk 5s ${E} infinite}`),

    I('zoomhover', '悬停放大镜', 'Hover zoom', '鼠标停在图上局部放大', 'A loupe follows the pointer',
      '2–3× 局部放大在旁边显示，移动端改为点击进全屏缩放；不要在原位放大遮住选项。',
      'Show a 2–3× loupe beside the image, and switch to a full-screen zoom on touch.',
      'media', `@keyframes fxk{0%,100%{transform:scale(1);transform-origin:30% 30%}50%{transform:scale(2)}}.fxmedia{width:min(260px,66%)}.fx{animation:fxk 4.4s ${E} infinite}`),

    I('variantpicker', '规格选择', 'Variant picker', '颜色、尺码、容量', 'Colour, size, capacity',
      '缺货组合要置灰而不是隐藏（让人知道存在），色板用真实色块加名称；只剩一种规格时不显示选择器。',
      'Grey out unavailable combinations rather than hiding them, label every swatch, and hide the picker when only one option exists.',
      'pill', `.fx{font-size:12px}.fx:nth-child(2){border-color:#23232f;border-width:1.5px;font-weight:600}.fx:nth-child(4){opacity:.36;text-decoration:line-through}`),

    I('swatchcolor', '颜色色板', 'Colour swatches', '色块要能对上实物', 'The swatch must match the object',
      '用产品实拍取色而不是品牌色；深色色块要加浅描边，白色要加深描边，选中用外环。',
      'Sample the colour from the product photo. Outline dark swatches light, white swatches dark, and select with a ring.',
      'loader', `.fxload{gap:12px}.fx{width:30px;height:30px;border-radius:50%;box-shadow:0 0 0 1px rgba(0,0,0,.12)}.fx:nth-child(1){background:#2f4a3c;box-shadow:0 0 0 2px #fff,0 0 0 3.5px #23232f}.fx:nth-child(2){background:#c9b79a}.fx:nth-child(3){background:#fff}`),

    I('sizeguide', '尺码指引', 'Size guide', '在选之前就能查', 'Available before they choose',
      '尺码表就地展开而不是跳走，支持按身高体重推荐；退货率主要由这一步决定。',
      'Expand the chart in place rather than navigating away, and recommend from height and weight. This step drives your return rate.',
      'table', `.fxtable{width:min(340px,84%)}.fx{height:34px;font-size:12px}.fx:first-child{background:#eef4f8;font-weight:600}.fx>i{display:none}`),

    I('stocklevel', '库存提示', 'Stock level', '"仅剩 3 件"要是真的', '"Only 3 left" must be true',
      '真实库存低于阈值才显示，且不要跳动；假造紧迫感一旦被发现就会毁掉信任。',
      'Show it only below a real threshold and keep it stable. Fabricated urgency destroys trust once noticed.',
      'card', `.fx{padding:13px;border-color:#e0d7c4}.fx>b,.fx>u,.fx>i{display:none}.fx::after{content:'\u4ec5\u5269 3 \u4ef6 \u00b7 \u4eca\u65e5\u4e0b\u5355\u660e\u65e5\u53d1\u8d27';font:500 12px var(--fx-sans,system-ui);color:#c07a3a}`),

    I('addtocart', '加购动效', 'Add to cart', '让商品飞进购物车', 'The item flies into the cart',
      '克隆商品图沿曲线飞向购物车图标 + 图标弹一下 + 数字变化；总时长不超过 500ms。',
      'Clone the thumbnail along an arc into the cart icon, bump the icon and change the count — under 500ms total.',
      'panel', `@keyframes fxk{0%{left:14%;top:60%;width:52px;height:52px;opacity:1}100%{left:80%;top:12%;width:16px;height:16px;opacity:0}}.fxstack{width:min(320px,84%);height:min(200px,32vh)}.fxa{background:#fcfcfb;color:#c4c6bd}.fxa::after{content:''}.fxb{position:absolute;inset:auto;border-radius:8px;background:linear-gradient(150deg,#7cb6c8,#3f6f92);animation:fxk 2.4s ${E} infinite}.fxb::after{content:''}`),

    I('cartdrawer', '购物车抽屉', 'Cart drawer', '从右边滑出，不用离开页面', 'Slides in from the right without leaving',
      '加购后自动打开 3 秒再收起，或只弹提示；抽屉里要能改数量与删除，并显示运费门槛。',
      'Auto-open briefly or just toast. The drawer must allow quantity edits and show the free-shipping threshold.',
      'panel', `@keyframes fxk{0%,45%{transform:translateX(100%)}55%,100%{transform:none}}.fxstack{width:min(320px,84%);overflow:hidden}.fxa{background:#f4f5f1;color:#a5a79e}.fxa::after{content:''}.fxb{inset:0 0 0 42%;background:#fff;color:#23232f;box-shadow:-10px 0 26px -12px rgba(45,72,98,.34);animation:fxk 4.4s ${E} infinite}.fxb::after{content:'\u8d2d\u7269\u8f66 \u00b7 2 \u4ef6';font:600 12px var(--fx-sans,system-ui)}`),

    I('freeshipbar', '免运费进度', 'Free-shipping bar', '再买 28 元就免运费', '¥28 more for free shipping',
      '进度条 + 差额 + 推荐凑单商品；达成后要有明确的达成反馈而不是静默消失。',
      'A bar, the gap, and suggested add-ons — with a clear celebration when it is met, not a silent disappearance.',
      'loader', `@keyframes fxk{0%{width:36%}100%{width:82%}}.fxload{flex-direction:column;gap:8px;width:min(300px,72%);align-items:stretch}.fx{width:auto;height:8px;border-radius:4px;background:#eceef1;position:relative;overflow:hidden}.fx::after{content:'';position:absolute;inset:0 auto 0 0;background:#4d8ba6;animation:fxk 3s ${E} infinite alternate}.fx:nth-child(n+2){display:none}`),

    I('stickybuybar', '吸底购买条', 'Sticky buy bar', '价格和按钮永远在手边', 'Price and button always at hand',
      '滚过主图后出现，含缩略图、价格、规格摘要与主按钮；不要重复整个规格选择器。',
      'Appears past the hero with a thumbnail, price, variant summary and the button — not a duplicate picker.',
      'nav', `.fxnav{width:min(320px,86%);border-radius:0;border:0;border-top:1px solid #e6e7ea;padding:10px;align-items:center}.fx{padding:0;font-size:12px}.fx:nth-child(1)::after{content:'\u00a5 128'}.fx:nth-child(1){font:700 15px var(--fx-mono,monospace);color:#23232f}.fx:nth-child(2)::after{content:'\u9ed1 \u00b7 M'}.fx:nth-child(2){color:#8b8d84}.fx:nth-child(3){margin-left:auto;background:#23232f;color:#fff;padding:9px 16px;border-radius:8px;font-weight:600}.fx:nth-child(3)::after{content:'\u52a0\u5165\u8d2d\u7269\u8f66'}.fx:nth-child(n+4){display:none}`),

    I('pricedisplay', '价格显示', 'Price display', '现价、原价、单价、税', 'Now, was, per-unit, tax',
      '现价最大，原价删除线且较小，折扣率单独标；单价（每 100g）对比购是刚需，含税与否要写明。',
      'Now price largest, was price struck and smaller, discount as its own tag. Unit price aids comparison; tax inclusion must be stated.',
      'num', `.fx{font-size:clamp(28px,5vw,50px);color:#23232f}.fxnum::after{content:'\u00a5168  \u00b7  \u76846\u6298  \u00b7  \u00a51.68/100g';font:500 12px var(--fx-mono,monospace);color:#8b8d84;text-decoration-line:none}`),

    I('strikethrough', '划线价', 'Struck-through price', '别拿虚构原价划线', 'Do not strike a price that never existed',
      '原价要是真实成交过的价格，并标注参考期；多地法规已强制要求"30 天内最低价"。',
      'The was-price must be a real prior price with a stated window. Many jurisdictions now require the 30-day low.',
      'pill', `.fx{font:600 13px var(--fx-mono,monospace)}.fx:nth-child(1){border:0;background:transparent;color:#23232f;font-size:18px}.fx:nth-child(1)::after{content:'\u00a5168'}.fx:nth-child(2){border:0;background:transparent;color:#a5a79e;text-decoration:line-through}.fx:nth-child(2)::after{content:'\u00a5280'}.fx:nth-child(3){background:#c04a63;color:#fff;border:0}.fx:nth-child(3)::after{content:'-40%'}.fx:nth-child(n+4){display:none}`),

    I('reviewsummary', '评价摘要', 'Review summary', '星级分布比平均分有用', 'The distribution beats the average',
      '给 1–5 星各自的条形分布、带图评价优先、按关键词聚合（"偏小 32 人提到"）。',
      'Show the per-star distribution, surface reviews with photos, and cluster by keyword.',
      'chart', `.fxchart{height:min(140px,26vh);gap:8px;align-items:flex-end}.fx{width:26px;border-radius:3px}.fx:nth-child(1){height:88%;background:#4d8ba6}.fx:nth-child(2){height:46%;background:#7cb6c8}.fx:nth-child(3){height:20%;background:#c9d3d8}.fx:nth-child(4){height:11%;background:#c9d3d8}.fx:nth-child(5){height:16%;background:#e5a68f}.fx:nth-child(n+6){display:none}`),

    I('ratingstars', '星级', 'Star rating', '半星要真的表示半星', 'A half star means a half',
      '用渐变裁切显示小数星级并同时给数字（4.3）；只有一条评价时显示数量而不是星级。',
      'Clip the fill for fractional stars and always show the number too. With one review, show the count rather than the stars.',
      'loader', `.fxload{gap:3px}.fx{width:16px;height:16px;border-radius:0;background:#e5a68f;clip-path:polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)}.fx:nth-child(3){background:linear-gradient(90deg,#e5a68f 60%,#e4e5e0 60%)}`),

    I('filterfacet', '分面筛选', 'Facets', '每个条件后面带数量', 'Every option carries its count',
      '显示每个选项的结果数，选中项置顶并可一键清除；筛选后为空要给"清除"而不是空白。',
      'Show counts, pin the selected options, and offer a clear-all. An empty result needs an exit, not a blank.',
      'list', `.fxcol{width:min(300px,80%);gap:5px}.fx{height:38px;font-size:12.5px}.fx>u{display:none}.fx>i{width:15px;height:15px;border-radius:4px;border:1.5px solid #c9cbc0;background:#fff}.fx:nth-child(1)>i,.fx:nth-child(3)>i{background:#23232f;border-color:#23232f}.fx::after{content:'128';margin-left:auto;font:500 11px var(--fx-mono,monospace);color:#a5a79e}`),

    I('sortcontrol', '排序控件', 'Sort control', '默认排序要说清是什么', 'Name the default order',
      '"推荐排序"要能解释依据；价格排序要标明含不含运费。默认永远不该是"随机"。',
      'Explain what "recommended" means, and say whether price sorting includes shipping. Never default to random.',
      'pill', `.fx{font-size:12px}.fx:nth-child(1){background:#23232f;color:#fff;border-color:#23232f;font-weight:600}.fx:nth-child(1)::after{content:' \u25be'}`),

    I('quickview', '快速查看', 'Quick view', '不离开列表就能看细节', 'Details without leaving the list',
      '弹层里放图、规格、价格与加购，但不放完整详情；一定要给"查看完整详情"出口。',
      'The overlay carries images, variants, price and add-to-cart — never the full page. Always link out to it.',
      'panel', `@keyframes fxk{0%{opacity:0;transform:scale(.96)}100%{opacity:1;transform:none}}.fxstack{width:min(340px,86%)}.fxa{background:#f4f5f1;color:#c4c6bd}.fxa::after{content:''}.fxb{inset:14%;border-radius:14px;background:#fff;color:#23232f;box-shadow:0 22px 48px -22px rgba(45,72,98,.4);animation:fxk .6s ${E} both}.fxb::after{content:'\u5feb\u901f\u67e5\u770b';font:600 13px var(--fx-sans,system-ui)}`),

    I('wishlist', '收藏', 'Wishlist', '心跳一下，然后记住', 'It beats once, then remembers',
      '未登录也要能收藏（本地存），登录后合并；图标要有明确的已收藏态而不是仅变色。',
      'Allow it before login with local storage and merge later. The saved state needs a shape change, not only colour.',
      'loader', `@keyframes fxk{0%,100%{transform:scale(1)}40%{transform:scale(1.35)}60%{transform:scale(.94)}}.fxload{gap:0}.fx{width:30px;height:30px;border-radius:0;background:#e8879c;clip-path:polygon(50% 92%,12% 52%,12% 26%,30% 12%,50% 26%,70% 12%,88% 26%,88% 52%);animation:fxk 2.8s ${E} infinite}.fx:nth-child(n+2){display:none}`),

    I('comparetable', '对比表', 'Comparison table', '并排看差异，相同的收起来', 'Side by side, with the identical rows folded',
      '默认只显示有差异的行，提供"显示全部"；列头吸顶，最多同时比 4 项。',
      'Show only differing rows by default with a reveal-all. Sticky column headers, four items maximum.',
      'table', `.fxtable{width:min(340px,84%)}.fx{height:36px;font-size:12px}.fx:first-child{background:#eef4f8;font-weight:600}.fx:nth-child(3){background:#fdfaf4}.fx>i{display:none}`),

    I('checkoutsteps', '结算步骤', 'Checkout steps', '地址、配送、支付、确认', 'Address, shipping, payment, review',
      '步骤条显示进度且可回退；每步只问必要信息，总价与运费在每一步都可见。',
      'A reversible progress indicator, only essential fields per step, and the total visible throughout.',
      'nav', `.fxnav{gap:0;width:min(340px,86%)}.fx{flex:1;text-align:center;font-size:11px;position:relative}.fx:nth-child(-n+2){color:#3f6f92;font-weight:600}.fx:nth-child(-n+2)::after{content:'';position:absolute;left:6px;right:6px;bottom:0;height:2px;background:#3f6f92}.fx:nth-child(n+5){display:none}`),

    I('guestcheckout', '游客结算', 'Guest checkout', '别在付款前逼人注册', 'Do not force an account before payment',
      '先结算、付完再提供"一键创建账号"；强制注册是转化率最大的单点损失。',
      'Let them pay, then offer one-tap account creation. A forced signup is the single largest conversion loss.',
      'card', `.fxcard{width:min(300px,80%)}.fx{padding:16px;text-align:center}.fx>b,.fx>u,.fx>i{display:none}.fx::after{content:'\u4ee5\u6e38\u5ba2\u8eab\u4efd\u7ed3\u7b97\\A \u4ed8\u6b3e\u540e\u53ef\u4e00\u952e\u521b\u5efa\u8d26\u53f7';white-space:pre-line;font:400 12.5px/1.8 var(--fx-sans,system-ui);color:#65675f}`),

    I('addressautofill', '地址自动填充', 'Address autofill', '打两个字就能选到', 'Two characters and it is found',
      '接地址联想 API + 完整的 autocomplete 语义；手填要能纠正，不要因格式校验挡住真实地址。',
      'Wire an address lookup and the full autocomplete tokens. Keep manual entry editable and never block a real address on format.',
      'field', `@keyframes fxk{0%,55%{opacity:0}70%,100%{opacity:1}}.fxfield{position:relative}.fx{color:#23232f}.fxfield::after{content:'\u4e91\u5357\u7701\u6606\u660e\u5e02\u2026 \u00b7 3 \u6761\u5efa\u8bae';position:absolute;left:0;right:0;top:56px;padding:10px 14px;border:1px solid #e4e5e0;border-radius:8px;background:#fff;font:500 12px var(--fx-sans,system-ui);color:#65675f;animation:fxk 3s steps(1,end) infinite}`),

    I('cardinput', '卡号输入', 'Card input', '四位一组，自动识别卡种', 'Grouped in fours, brand detected',
      '自动分组、自动跳到有效期、卡种图标就地出现；不要禁止粘贴，也不要在失焦前报错。',
      'Auto-group, auto-advance, and show the brand inline. Never block paste, never validate before blur.',
      'field', `.fx{font-family:var(--fx-mono,monospace);color:#23232f;letter-spacing:.06em}.fx::before{content:'4242 4242 4242 '}.fx::after{content:'VISA';margin-left:auto;padding:3px 6px;border-radius:4px;background:#eef4f8;font:700 9px var(--fx-sans,system-ui);color:#3f6f92;letter-spacing:0}.fx>u{display:none}`),

    I('walletpay', '钱包支付', 'Wallet payment', '一键付掉，跳过所有表单', 'One tap, no forms at all',
      'Apple/Google Pay 按钮放在表单最上方而不是最下方；样式必须用官方按钮规范。',
      'Put the wallet button above the form, not below it, and use the official button styling.',
      'pill', `.fx{border:0;font-weight:600}.fx:nth-child(1){background:#23232f;color:#fff;padding:12px 22px}.fx:nth-child(1)::after{content:' Pay'}.fx:nth-child(n+2){display:none}`),

    I('installment', '分期与先买后付', 'Instalments & BNPL', '把总价拆成月付', 'Split the total into monthly',
      '同时显示总额与分期额，标明利率与总利息；只显示月付额是误导性定价。',
      'Show both the total and the instalment with the rate and total interest. Monthly-only is deceptive pricing.',
      'card', `.fxcard{width:min(300px,80%)}.fx{padding:14px}.fx>b,.fx>u,.fx>i{display:none}.fx::after{content:'\u00a5 128 \u00b7 \u6216 \u00a544/\u6708 \u00d7 3 \u671f\\A \u5e74\u5229\u7387 0% \u00b7 \u603b\u5229\u606f \u00a50';white-space:pre-line;font:500 12px/1.8 var(--fx-mono,monospace);color:#65675f}`),

    I('coupon', '优惠码', 'Coupon field', '折叠起来，别提醒所有人去找券', 'Fold it away — do not send everyone hunting',
      '优惠码入口默认折叠；失败要说清原因（过期/不适用/最低门槛），成功要显示抵扣行。',
      'Collapse it by default. Failures name the reason; successes add a visible discount line.',
      'field', `.fxfield{display:flex;flex-direction:column;gap:6px}.fx::after{content:'\u5e94\u7528';margin-left:auto;padding:5px 11px;border-radius:6px;background:#23232f;color:#fff;font:600 11px var(--fx-sans,system-ui)}.fx>u{display:none}.fxfield::after{content:'\u5df2\u62b5\u6263 \u2212\u00a520.00';font:600 11px var(--fx-mono,monospace);color:#4d8ba6}`),

    I('ordersummary', '订单摘要', 'Order summary', '每一笔钱都要能对上', 'Every line must reconcile',
      '商品小计、运费、税、优惠、总计逐行列出；总计要加粗且与上方有分隔线。',
      'Itemise subtotal, shipping, tax, discounts and total, with the total ruled off and bold.',
      'list', `.fxcol{width:min(300px,80%);gap:2px}.fx{height:30px;border:0;background:transparent;font:500 12px var(--fx-mono,monospace);color:#65675f}.fx>i,.fx>u{display:none}.fx:nth-child(1)::after{content:'\u5c0f\u8ba1\u3000\u3000\u00a5148.00'}.fx:nth-child(2)::after{content:'\u8fd0\u8d39\u3000\u3000\u00a50.00'}.fx:nth-child(3)::after{content:'\u4f18\u60e0\u3000\u2212\u00a520.00'}.fx:nth-child(4){border-top:1px solid #e4e5e0;color:#23232f;font-weight:700;font-size:14px;margin-top:5px}.fx:nth-child(4)::after{content:'\u603b\u8ba1\u3000\u3000\u00a5128.00'}.fx:nth-child(n+5){display:none}`),

    I('paybutton', '支付按钮状态', 'Pay button states', '按下之后绝不能能再按一次', 'It must never be pressable twice',
      '点击立刻禁用并转为加载态，按钮文案带金额（"支付 ¥128"）；失败后才恢复可点。',
      'Disable and switch to loading on the first press, label it with the amount, and only re-enable on failure.',
      'pill', `@keyframes fxk{0%,40%{background:#23232f}50%,100%{background:#65675f}}.fxpill{max-width:240px}.fx:nth-child(1){border:0;color:#fff;padding:13px 26px;font-weight:700;animation:fxk 3s steps(1,end) infinite}.fx:nth-child(1)::after{content:'\u652f\u4ed8 \u00a5128'}.fx:nth-child(n+2){display:none}`),

    I('paypending', '支付处理中', 'Payment pending', '几秒钟不能让人以为失败了', 'A few seconds must not read as failure',
      '全屏遮罩 + 明确"正在处理，请不要关闭页面" + 超时后给查询入口；绝不允许重复提交。',
      'A blocking overlay saying do not close the page, plus a lookup path on timeout. Never allow a resubmit.',
      'panel', `@keyframes fxk{to{transform:rotate(1turn)}}.fxstack{width:min(320px,84%);height:min(200px,32vh)}.fxa{background:rgba(45,72,98,.42);color:#fff;font:600 12px var(--fx-sans,system-ui)}.fxa::after{content:'\u6b63\u5728\u5904\u7406\uff0c\u8bf7\u4e0d\u8981\u5173\u95ed\u9875\u9762'}.fxb{inset:auto;left:50%;top:32%;margin-left:-14px;width:28px;height:28px;border-radius:50%;background:none;border:3px solid rgba(255,255,255,.3);border-top-color:#fff;animation:fxk .9s linear infinite}.fxb::after{content:''}`),

    I('orderconfirm', '下单成功页', 'Order confirmation', '订单号、时间、下一步', 'Number, time, what happens next',
      '订单号可复制、预计到货区间、跟踪入口与联系方式；这一页是客服工单量的主要变量。',
      'A copyable order number, a delivery window, a tracking link and support contact. This page decides your ticket volume.',
      'card', `.fxcard{width:min(300px,80%)}.fx{padding:18px;text-align:center;border-color:#cfe0d4}.fx>b,.fx>u,.fx>i{display:none}.fx::after{content:'\u5df2\u4e0b\u5355 \u00b7 SV-20260908-4471\\A \u9884\u8ba1 9 \u6708 12\u201314 \u65e5\u9001\u8fbe\\A [\u67e5\u770b\u7269\u6d41]';white-space:pre-line;font:400 12px/1.9 var(--fx-sans,system-ui);color:#3f6f92}`),

    I('ordertracking', '物流跟踪', 'Order tracking', '一条时间线，当前节点高亮', 'A timeline with the current node lit',
      '节点写清"发生了什么"而不是内部状态码；预计时间变化要主动通知。',
      'Nodes describe what happened, not internal codes — and proactively notify when the estimate changes.',
      'list', `.fxcol{width:min(300px,80%);gap:0}.fx{border:0;background:transparent;height:44px;position:relative;padding-left:26px;font-size:12px}.fx>i{position:absolute;left:0;width:11px;height:11px;border-radius:50%;background:#e4e5e0}.fx>u{display:none}.fx:nth-child(-n+2)>i{background:#3f6f92}.fx:nth-child(2){font-weight:600;color:#23232f}.fx::before{content:'';position:absolute;left:5px;top:16px;bottom:-6px;width:1px;background:#e4e5e0}.fx:last-child::before{display:none}.fx:nth-child(n+5){display:none}`),

    I('returnflow', '退货流程', 'Return flow', '选商品、选原因、拿标签', 'Pick items, pick a reason, get a label',
      '原因选项要能反哺商品页（"偏小"多就调尺码指引）；自助退货比客服退货便宜十倍。',
      'Feed the reasons back into the product page. Self-service returns cost a tenth of a support ticket.',
      'list', `.fxcol{width:min(300px,80%);gap:5px}.fx{height:40px;font-size:12.5px}.fx>u{display:none}.fx>i{width:15px;height:15px;border-radius:50%;border:1.5px solid #c9cbc0;background:#fff}.fx:nth-child(2)>i{background:#23232f;border-color:#23232f}.fx:nth-child(1)::after{content:'\u5c3a\u7801\u504f\u5927'}.fx:nth-child(2)::after{content:'\u5c3a\u7801\u504f\u5c0f'}.fx:nth-child(3)::after{content:'\u4e0e\u63cf\u8ff0\u4e0d\u7b26'}.fx:nth-child(n+4){display:none}`),

    I('pricingtier', '定价套餐卡', 'Pricing tiers', '三档，中间那档被推荐', 'Three tiers, the middle one recommended',
      '推荐档要在视觉上升起（描边 + 徽标 + 略高），功能列表用"包含上一档全部"减少重复。',
      'Lift the recommended tier with a border, a badge and extra height, and say "everything in the previous tier".',
      'cards', `.fx{justify-content:flex-start;padding-top:18px;font:600 13px var(--fx-sans,system-ui)}.fx>b{display:none}.fx:nth-child(2){transform:translateY(-10px);border-color:#23232f;border-width:1.5px;box-shadow:0 14px 30px -16px rgba(45,72,98,.3)}.fx:nth-child(2)::before{content:'\u63a8\u8350';display:block;margin-bottom:8px;padding:3px 8px;border-radius:999px;background:#23232f;color:#fff;font:700 9px var(--fx-mono,monospace);width:fit-content}`),

    I('billingtoggle', '月付年付切换', 'Billing period toggle', '切到年付要立刻看到省多少', 'Switching shows the saving at once',
      '价格数字要滚动过渡而不是瞬变，并显示"省两个月"徽标；默认选年付要诚实标注。',
      'Roll the numbers rather than swapping them, and show the saving. If annual is preselected, label it plainly.',
      'num', `@keyframes fxk{0%,45%{content:'\u00a599/\u6708'}55%,100%{content:'\u00a582/\u6708'}}.fx{font-size:clamp(26px,4.6vw,44px);color:#23232f}.fx::after{content:'\u00a599/\u6708';animation:fxk 3.4s steps(1,end) infinite}.fxnum::after{content:'\u5e74\u4ed8\u7701\u4e24\u4e2a\u6708';font:600 11px var(--fx-mono,monospace);color:#4d8ba6}`),

    I('usagemeter', '用量计费', 'Usage-based billing', '让人算得出这个月要花多少', 'They must be able to predict the bill',
      '实时用量 + 已产生费用 + 预计月末费用 + 上限设置；超额规则必须在超额前就展示过。',
      'Live usage, cost so far, projected month-end and a cap. The overage rule must be shown before any overage.',
      'chart', `.fxchart{height:min(140px,26vh);gap:6px}.fx{width:20px;border-radius:3px;background:#7cb6c8}.fx:nth-child(6),.fx:nth-child(7){background:#dbe4ea}`),

    I('upsell', '加价购与搭配', 'Upsell & bundles', '推荐要真的相关', 'The recommendation must be relevant',
      '"经常一起买"用真实共购数据；加价购要在加购后而不是详情页打断决策。',
      'Base "bought together" on real co-purchase data, and place add-ons after the add-to-cart, not before the decision.',
      'cards', `.fx{font:500 11px var(--fx-sans,system-ui)}.fx>b{height:52px}.fx:nth-child(1){border-color:#23232f}.fx:nth-child(2)::before,.fx:nth-child(3)::before{content:'+';position:absolute;margin-left:-22px;font:300 20px var(--fx-sans,system-ui);color:#a5a79e}.fxrow{position:relative}`),

    I('recentlyviewed', '最近浏览', 'Recently viewed', '帮人找回刚看过的那个', 'Help them find the one they just saw',
      '横滑轨放最近 8 件，可删除单项；这是转化率性价比最高的模块之一。',
      'A rail of the last eight with per-item removal. One of the highest-yield modules there is.',
      'cards', `.fxrow{max-width:290px;overflow-x:auto;gap:10px}.fx{flex:none;width:96px;height:126px;padding:8px;font-size:10px}.fx>b{height:62px}`),

    I('inventoryreserve', '库存占用倒计时', 'Reservation timer', '给你 10 分钟，别用假倒计时', 'Ten real minutes — no fake clocks',
      '只在真的锁库存时显示倒计时；到期要真的释放并明确告知，而不是刷新后重新开始。',
      'Only show it when stock is truly held, and really release it — do not restart on refresh.',
      'card', `@keyframes fxk{0%,100%{border-color:#e0d7c4}50%{border-color:#c07a3a}}.fxcard{width:min(280px,78%)}.fx{padding:12px;text-align:center;animation:fxk 2.4s ease-in-out infinite}.fx>b,.fx>u,.fx>i{display:none}.fx::after{content:'\u5e93\u5b58\u4e3a\u4f60\u4fdd\u7559 09:24';font:600 13px var(--fx-mono,monospace);color:#c07a3a}`),

    I('taxdisclosure', '税费披露', 'Tax disclosure', '结算时才冒出来的税最伤转化', 'A tax that appears at checkout kills conversion',
      '在商品页就写明含税或另计与大致税率；跨境要标关税责任方。',
      'State tax inclusion and the approximate rate on the product page, and name who pays duty on cross-border orders.',
      'card', `.fxcard{width:min(300px,80%)}.fx{padding:12px}.fx>b,.fx>u,.fx>i{display:none}.fx::after{content:'\u4ef7\u683c\u542b\u589e\u503c\u7a0e \u00b7 \u8fdb\u53e3\u5173\u7a0e\u7531\u4e70\u5bb6\u627f\u62c5';font:400 11.5px/1.6 var(--fx-sans,system-ui);color:#8b8d84}`),

    I('trustbadge', '信任标识', 'Trust signals', '退货政策比安全徽标有用', 'A return policy beats a security badge',
      '把退货天数、发货地、客服响应时间写成文字放在按钮附近；泛泛的"安全支付"图标没人信。',
      'Put the return window, origin and support response near the button as words. Generic padlock badges convince nobody.',
      'pill', `.fx{font:500 11px var(--fx-sans,system-ui);border-color:#dbe4ea;color:#4d5c66}.fx:nth-child(1)::after{content:'30 \u5929\u65e0\u7531\u9000\u8d27'}.fx:nth-child(2)::after{content:'\u4ece\u666e\u56fe\u9a6c\u7ea6\u53d1\u51fa'}.fx:nth-child(3)::after{content:'\u5ba2\u670d 4 \u5c0f\u65f6\u5185\u56de\u590d'}.fx:nth-child(n+4){display:none}`),

    I('abandonrecover', '弃单挽回', 'Cart recovery', '回来的时候东西还在', 'The cart is still there when they return',
      '购物车跨设备持久化，回访时提示"你有 2 件未结算"；邮件挽回要带商品图与直达链接。',
      'Persist the cart across devices and greet returners with it. Recovery email carries the images and a direct link.',
      'card', `.fxcard{width:min(300px,80%)}.fx{padding:14px;display:flex;align-items:center;gap:10px;border-color:#dbe4ea}.fx>b{width:34px;height:34px;border-radius:7px;margin:0;background:linear-gradient(150deg,#c6d3da,#9fb3bf)}.fx>u,.fx>i{display:none}.fx::after{content:'\u4f60\u6709 2 \u4ef6\u672a\u7ed3\u7b97 \u00b7 \u7ee7\u7eed';font:500 12px var(--fx-sans,system-ui);color:#23232f}`),

    I('subscriptionmanage', '订阅管理', 'Subscription management', '取消要和订阅一样容易', 'Cancelling is as easy as subscribing',
      '一个页面看到下次扣费日、金额、暂停与取消；把取消藏进客服流程在多地已属违法。',
      'One page with the next charge date, amount, pause and cancel. Hiding cancellation behind support is illegal in several jurisdictions.',
      'list', `.fxcol{width:min(320px,84%);gap:6px}.fx{font-size:12.5px}.fx>u{display:none}.fx:nth-child(1)::after{content:'\u4e0b\u6b21\u6263\u8d39 10\u670811\u65e5 \u00b7 \u00a599';color:#23232f;font:500 12px var(--fx-mono,monospace)}.fx:nth-child(2)::after{content:'\u6682\u505c\u4e00\u4e2a\u6708';color:#3f6f92;font-weight:600}.fx:nth-child(3)::after{content:'\u53d6\u6d88\u8ba2\u9605';color:#c04a63;font-weight:600}.fx:nth-child(n+4){display:none}`),

    I('giftoption', '礼品选项', 'Gift options', '不显示价格、带贺卡、分开发货', 'Hide the price, add a note, ship separately',
      '礼品模式要贯穿到发票与包裹（收件人看不到金额）；贺卡字数限制要在输入时提示。',
      'Gift mode must reach the invoice and the parcel, and the note needs a live character limit.',
      'field', `.fxfield{display:flex;flex-direction:column;gap:7px}.fxfield::before{content:'\u8d3a\u5361\uff08\u53ef\u9009\uff09';font:500 12px var(--fx-sans,system-ui);color:#23232f}.fxfield::after{content:'32 / 120';margin-left:auto;font:500 10px var(--fx-mono,monospace);color:#a5a79e}`),

    I('b2bquote', '询价与批量', 'Quote & bulk', '不是所有交易都能一键下单', 'Not every deal ends in a tap',
      'B2B 要有阶梯价、询价单、采购单号字段与账期支付；把它硬塞进 C 端结算流程一定会漏。',
      'B2B needs tiered pricing, a quote request, a PO number field and terms. Forcing it through a consumer checkout always breaks.',
      'table', `.fxtable{width:min(320px,84%)}.fx{height:34px;font-size:12px;font-family:var(--fx-mono,monospace)}.fx:first-child{background:#eef4f8;font-weight:600}.fx>i{display:none}`)
  ]
};
