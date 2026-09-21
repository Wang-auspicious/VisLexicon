// 状态设计：一个界面至少有十几种状态，只画"有数据"那一种是最常见的交付缺口
const E = 'cubic-bezier(.22,1,.36,1)';
const I = (id, zh, en, dz, de, pz, pe, demo, css) => ({ id, zh, en, dz, de, pz, pe, demo, css });

export default {
  id: 'state', zh: '状态与反馈', en: 'States & feedback',
  dz: '零一多、错误、离线、过期、配额、通知——只画"有数据"那一种，是交付里最常见的缺口',
  de: 'Zero-one-many, errors, offline, stale, quota, notifications — shipping only the happy path is the most common gap of all',
  items: [
    I('zerostate', '首次为空', 'First-run empty', '还没有任何东西的时候', 'Before anything exists',
      '一句说明它是什么 + 一个主动作 + 可选的示例数据；别只画一张插画。',
      'One sentence saying what this is, one primary action, and optionally sample data. Not just an illustration.',
      'card', `.fx{padding:22px;text-align:center}.fx>b{width:52px;height:52px;border-radius:12px;margin:0 auto 14px;background:#eef0f2}.fx>u,.fx>i{display:none}.fx::after{content:'\u8fd8\u6ca1\u6709\u9879\u76ee\u3002\u9879\u76ee\u628a\u519c\u6237\u3001\u5730\u5757\u4e0e\u51ed\u8bc1\u7ec4\u5728\u4e00\u8d77\u3002\\A [\u65b0\u5efa\u9879\u76ee]  \u6216 [\u5bfc\u5165\u793a\u4f8b]';white-space:pre-line;font:400 12.5px/1.7 var(--fx-sans,system-ui);color:#65675f}`),

    I('emptysearch', '搜索无结果', 'No search results', '搜不到要给下一步', 'A dead end needs an exit',
      '回显搜索词、给拼写建议与放宽条件的按钮、列出热门项；不要只写"无结果"。',
      'Echo the query, offer spelling suggestions and a broaden-search action, and list popular items. Never a bare "no results".',
      'card', `.fx{padding:20px}.fx>b,.fx>u,.fx>i{display:none}.fx::after{content:'\u201c\u78b3\u51ed\u8bc1\u4ea4\u6613\u201d \u6ca1\u6709\u5339\u914d\u9879\\A \u8bd5\u8bd5\uff1a\u78b3\u51ed\u8bc1 \u00b7 \u4ea4\u6613 \u00b7 \u6e05\u9664\u7b5b\u9009';white-space:pre-line;font:400 12.5px/1.9 var(--fx-sans,system-ui);color:#65675f}`),

    I('emptyfiltered', '筛选后为空', 'Empty after filtering', '是筛没了，不是真没有', 'Filtered out, not absent',
      '明确说"当前筛选下无结果"，并给"清除筛选"一键回到全集；两种空状态文案必须不同。',
      'Say it is the filter, and offer a one-tap clear. These two empty states must never share copy.',
      'card', `.fx{padding:20px;border-color:#e0d7c4}.fx>b,.fx>u,.fx>i{display:none}.fx::after{content:'\u5f53\u524d 3 \u4e2a\u7b5b\u9009\u6761\u4ef6\u4e0b\u65e0\u7ed3\u679c\\A [\u6e05\u9664\u5168\u90e8\u7b5b\u9009]';white-space:pre-line;font:400 12.5px/1.9 var(--fx-sans,system-ui);color:#65675f}`),

    I('emptycleared', '成功的空', 'Empty as success', '收件箱清空是好事', 'An empty inbox is a win',
      '任务型列表清空要庆祝而不是道歉；语气与首次为空完全相反。',
      'Celebrate a cleared task list instead of apologising. The tone is the opposite of first-run empty.',
      'card', `.fx{padding:22px;text-align:center;border-color:#cfe0d4}.fx>b,.fx>u,.fx>i{display:none}.fx::after{content:'\u5168\u90e8\u5904\u7406\u5b8c\u4e86\u3002\\A \u4eca\u5929\u8fd8\u6709 4 \u4efd\u5ba1\u6279\u5c06\u5230\u3002';white-space:pre-line;font:500 13px/1.8 var(--fx-sans,system-ui);color:#3f6f92}`),

    I('onestate', '只有一条', 'The one-item case', '一条数据也要看起来是设计过的', 'One row must still look designed',
      '网格里只有一张卡时不要拉满整行；列表只有一条时隐藏排序与分页。',
      'Do not stretch a single card across the whole row, and hide sorting and pagination for a single row.',
      'grid', `.fxgrid{grid-template-columns:repeat(3,92px)}.fx:nth-child(n+2){opacity:0}.fx:nth-child(1){background:linear-gradient(160deg,#fff,#f7f8f5)}`),

    I('manystate', '大量', 'The many case', '一千条和十条不是同一个界面', 'A thousand rows is a different screen',
      '出现搜索、筛选、批量操作、虚拟滚动与"跳到"；密度也要跟着变紧。',
      'Search, filters, bulk actions, virtual scrolling and a jump-to appear — and the density tightens.',
      'table', `.fx{height:32px;font-size:12px}.fx:first-child{background:#eef4f8}.fx>i{width:16px;height:16px}`),

    I('toomanystate', '超出上限', 'Over the limit', '超过 10000 条就别再说"共 N 条"', 'Past ten thousand, stop counting',
      '显示"10,000+"而不是精确总数（精确 count 很贵），并强制引导到筛选与搜索。',
      'Show "10,000+" rather than an exact count — counting is expensive — and push people into search.',
      'num', `.fx{font-size:clamp(30px,5.4vw,54px);color:#23232f}.fxnum::after{content:'+  \u00b7  \u8bf7\u7f29\u5c0f\u8303\u56f4';font:600 12px var(--fx-mono,monospace);color:#9b9d92}`),

    I('loadingfirst', '首次加载', 'Initial load', '结构已知就用骨架', 'Known structure means skeleton',
      '骨架块与真实内容同尺寸；同时预留操作栏位置，否则加载完会整页下移。',
      'Match the real geometry, and reserve the toolbar row too or the page shifts down on arrival.',
      'list', `@keyframes fxk{to{background-position:200% 0}}.fx>i,.fx>u{background:linear-gradient(100deg,#eceef1 30%,#f6f7f4 50%,#eceef1 70%);background-size:200% 100%;animation:fxk 1.6s linear infinite}`),

    I('loadingmore', '加载更多', 'Loading more', '追加时不要动已有内容', 'Appending must not move what is there',
      '新内容加在下方，滚动位置保持不动；底部占位高度要在请求前就撑住。',
      'Append below and keep the scroll anchored. Reserve the footer height before the request.',
      'scroll', `@keyframes fxk{0%,100%{opacity:.3}50%{opacity:1}}.fx:nth-child(n+5){opacity:.3;animation:fxk 1.4s ease-in-out infinite}.fx:nth-child(6){animation-delay:.2s}`),

    I('refreshing', '刷新中', 'Refreshing', '旧数据还在，只是在更新', 'The old data stays while it updates',
      '保留现有内容 + 顶部细进度条或轻微降透明度；千万不要清空再重载。',
      'Keep the content and add a hairline progress bar or a slight dim. Never blank and reload.',
      'list', `@keyframes fxk{0%{left:-30%;width:30%}100%{left:100%;width:30%}}.fxcol{position:relative;padding-top:6px;opacity:.72}.fxcol::before{content:'';position:absolute;left:0;top:0;height:2px;background:#4d8ba6;border-radius:2px;animation:fxk 1.3s ${E} infinite}`),

    I('staledata', '数据已过期', 'Stale data', '这是 3 分钟前的数字', 'These numbers are three minutes old',
      '标注数据时间戳与"刷新"入口；金融、库存、监控类界面缺了它就是误导。',
      'Stamp the data time and offer a refresh. In finance, inventory and monitoring, omitting it is misinformation.',
      'num', `.fx{font-size:clamp(28px,5vw,50px);color:#23232f}.fxnum::after{content:'\u00b7 3 \u5206\u949f\u524d \u00b7 [\u5237\u65b0]';font:600 11px var(--fx-mono,monospace);color:#c07a3a}`),

    I('partialfail', '部分失败', 'Partial failure', '批量操作里有几条挂了', 'A few of the batch failed',
      '说清成功几条、失败几条、失败原因分组，并只对失败项提供重试；别整批回滚。',
      'Report the counts, group the reasons and retry only the failures. Do not roll back the batch.',
      'card', `.fx{padding:16px}.fx>b,.fx>u,.fx>i{display:none}.fx::after{content:'\u5bfc\u5165 148 \u6210\u529f \u00b7 6 \u5931\u8d25\\A 4 \u6761\u7f3a\u5c11\u9762\u79ef \u00b7 2 \u6761\u91cd\u590d\u7f16\u53f7\\A [\u4ec5\u91cd\u8bd5\u5931\u8d25\u9879]';white-space:pre-line;font:400 12px/1.8 var(--fx-sans,system-ui);color:#65675f}`),

    I('errorfull', '整页错误', 'Full-page error', '整个页面拿不到数据', 'Nothing on the page loaded',
      '给出发生了什么、能做什么、以及一个可上报的错误码；不要显示堆栈。',
      'What happened, what to do, and a reportable code. Never a stack trace.',
      'card', `.fx{padding:22px;text-align:center;border-color:#e9cdd4}.fx>b,.fx>u,.fx>i{display:none}.fx::after{content:'\u6ca1\u80fd\u52a0\u8f7d\u8fd9\u4e2a\u9875\u9762\u3002\\A [\u91cd\u8bd5]  [\u8fd4\u56de\u9996\u9875]\\A \u9519\u8bef\u7f16\u53f7 SV-4093';white-space:pre-line;font:400 12.5px/1.9 var(--fx-sans,system-ui);color:#65675f}`),

    I('errorinline', '局部错误', 'Inline error', '一个卡片挂了不该拖垮整页', 'One broken card must not take the page',
      '每个数据区块自己承担错误边界，就地显示重试；容器高度保持不变。',
      'Give each block its own error boundary with a local retry, and keep the container height.',
      'grid', `.fx:nth-child(5){border-color:#e9cdd4;background:#fdf6f7;display:flex;align-items:center;justify-content:center;font:600 10px var(--fx-mono,monospace);color:#c04a63}.fx:nth-child(5)::after{content:'\u91cd\u8bd5'}`),

    I('offline', '离线横幅', 'Offline banner', '断网要说，恢复也要说', 'Announce the drop and the recovery',
      '常驻一条低干扰横幅说明当前离线与哪些功能不可用；恢复时短暂提示后自动消失。',
      'A persistent low-noise bar naming what is unavailable, and a brief self-dismissing note on recovery.',
      'card', `.fx{background:#3a3f47;border:0;color:#eef1f4;padding:11px 14px}.fx>b,.fx>u,.fx>i{display:none}.fx::after{content:'\u5f53\u524d\u79bb\u7ebf \u00b7 \u7f16\u8f91\u4f1a\u5728\u8054\u7f51\u540e\u540c\u6b65';font:600 12px var(--fx-sans,system-ui)}`),

    I('reconnecting', '重连中', 'Reconnecting', '别让指数退避看起来像卡死', 'Backoff must not look frozen',
      '显示尝试次数与下次重试倒计时，并给"立即重试"；静默重连会让用户以为坏了。',
      'Show the attempt count, the next retry countdown, and a retry-now button. Silent backoff reads as broken.',
      'card', `@keyframes fxk{to{transform:rotate(1turn)}}.fx{padding:14px;display:flex;align-items:center;gap:10px}.fx>b{width:16px;height:16px;border-radius:50%;margin:0;background:none;border:2px solid #e4e5e0;border-top-color:#4d8ba6;animation:fxk .9s linear infinite}.fx>u,.fx>i{display:none}.fx::after{content:'\u91cd\u8fde\u4e2d\u00b7\u7b2c 3 \u6b21\u00b7 8s \u540e\u91cd\u8bd5';font:500 12px var(--fx-sans,system-ui);color:#65675f}`),

    I('permissiondenied', '无权限', 'Permission denied', '说清缺什么权限、找谁要', 'Name the permission and who grants it',
      '"没有权限"要具体到角色与资源，并给出申请入口；不要伪装成 404。',
      'Name the role and the resource, and provide the request path. Do not disguise it as a 404.',
      'card', `.fx{padding:20px;border-color:#e0d7c4}.fx>b,.fx>u,.fx>i{display:none}.fx::after{content:'\u4f60\u7684\u89d2\u8272\uff08\u67e5\u770b\u8005\uff09\u4e0d\u80fd\u7f16\u8f91\u65b9\u6cd5\u5b66\\A [\u5411\u5de5\u4f5c\u533a\u7ba1\u7406\u5458\u7533\u8bf7]';white-space:pre-line;font:400 12.5px/1.9 var(--fx-sans,system-ui);color:#65675f}`),

    I('notfound', '找不到', 'Not found', '404 也要能继续走', 'A 404 still needs a next step',
      '给搜索框、上一级链接与最近访问；纯插画 404 是在给用户添堵。',
      'Offer search, a parent link and recent items. A purely decorative 404 wastes their time.',
      'card', `.fx{padding:22px;text-align:center}.fx>b,.fx>u,.fx>i{display:none}.fx::after{content:'404 \u00b7 \u8fd9\u4e2a\u9875\u9762\u4e0d\u5b58\u5728\\A [\u6362\u4e2a\u8bcd\u641c\u7d22]  [\u56de\u9879\u76ee\u5217\u8868]';white-space:pre-line;font:400 12.5px/1.9 var(--fx-sans,system-ui);color:#65675f}`),

    I('gone', '已删除', 'Gone', '东西曾经在这里', 'It used to be here',
      '410 与 404 语气不同：说明它被谁在何时删除，是否能恢复；链接分享场景尤其重要。',
      'A 410 is not a 404: say who removed it, when, and whether it can be restored. Shared links depend on this.',
      'card', `.fx{padding:20px;text-align:center;opacity:.9}.fx>b,.fx>u,.fx>i{display:none}.fx::after{content:'\u8fd9\u4efd\u62a5\u544a\u5df2\u4e8e 9 \u6708 2 \u65e5\u5220\u9664\\A 30 \u5929\u5185\u53ef\u4ece\u56de\u6536\u7ad9\u6062\u590d';white-space:pre-line;font:400 12.5px/1.9 var(--fx-sans,system-ui);color:#8b8d84}`),

    I('ratelimit', '频率限制', 'Rate limited', '告诉他等多久', 'Tell them how long',
      '给出剩余等待秒数（Retry-After）与配额窗口，倒计时可视；不要只说"请稍后再试"。',
      'Surface Retry-After as a visible countdown with the quota window. "Try again later" is not information.',
      'loader', `@keyframes fxk{0%{width:100%}100%{width:0}}.fxload{width:min(300px,70%)}.fx{width:100%;height:8px;border-radius:4px;background:#eceef1;position:relative;overflow:hidden}.fx::after{content:'';position:absolute;inset:0 auto 0 0;background:#c07a3a;animation:fxk 6s linear infinite}.fx:nth-child(n+2){display:none}`),

    I('maintenance', '维护中', 'Maintenance', '计划内停机要提前通知', 'Planned downtime is announced in advance',
      '提前 3 天站内横幅 + 停机页给出预计恢复时间与状态页链接；时间要带时区。',
      'A banner three days ahead, and a downtime page with an ETA in a named time zone plus a status-page link.',
      'card', `.fx{background:#23232f;border:0;color:#eef1f4;padding:16px;text-align:center}.fx>b,.fx>u,.fx>i{display:none}.fx::after{content:'\u7ef4\u62a4\u4e2d \u00b7 \u9884\u8ba1 14:00 (UTC-5) \u6062\u590d\\A status.savimbo.com';white-space:pre-line;font:500 12px/1.8 var(--fx-sans,system-ui)}`),

    I('degraded', '降级运行', 'Degraded mode', '一部分功能暂时不可用', 'Part of it is temporarily off',
      '把不可用功能就地置灰并说明原因，其余照常；整站下线是最后手段。',
      'Grey out the affected features in place with a reason and keep the rest working. A full outage is the last resort.',
      'nav', `.fx:nth-child(3),.fx:nth-child(4){opacity:.38;text-decoration:line-through}.fxnav::after{content:'\u5bfc\u51fa\u6682\u4e0d\u53ef\u7528';margin-left:8px;align-self:center;font:600 10px var(--fx-mono,monospace);color:#c07a3a}`),

    I('successtoast', '成功轻提示', 'Success toast', '成功要说，但不该挡路', 'Say it, but do not block',
      '底部或角落 3–4 秒自动消失，带撤销；不要用需要点确定的弹窗宣布成功。',
      'Bottom or corner, three to four seconds, with undo. Never a modal to announce success.',
      'card', `@keyframes fxk{0%{opacity:0;transform:translateY(14px)}14%,80%{opacity:1;transform:none}100%{opacity:0}}.fx{background:#23232f;border:0;color:#fff;animation:fxk 4.4s ${E} infinite}.fx>b,.fx>u,.fx>i{display:none}.fx::after{content:'\u5df2\u4fdd\u5b58\u3002\u3000\u6492\u9500';display:flex;justify-content:space-between;font:600 12px var(--fx-sans,system-ui)}`),

    I('successinline', '就地成功', 'Inline success', '按钮自己变成"已保存"', 'The button becomes "saved"',
      '在触发点就地反馈比飘出提示更好定位；保持 1.5s 后恢复，宽度不能跳。',
      'Feedback at the point of action beats a floating toast. Revert after 1.5s and keep the width stable.',
      'pill', `@keyframes fxk{0%,40%{background:#23232f;color:#fff}50%,90%{background:#3f6f92;color:#fff}100%{background:#23232f;color:#fff}}.fx:nth-child(2){border:0;min-width:82px;text-align:center;animation:fxk 3.4s steps(1,end) infinite}`),

    I('undostrip', '撤销条', 'Undo strip', '比"确定要删除吗"好得多', 'Far better than "are you sure?"',
      '执行后停留 5–8 秒的撤销条，堆叠时合并成"已删除 3 项"；撤销必须真的能还原顺序与位置。',
      'A five-to-eight second strip, merged when stacked, and the undo must restore order and position exactly.',
      'card', `@keyframes fxk{0%{width:100%}100%{width:0}}.fx{background:#23232f;border:0;color:#fff;padding:12px 14px;position:relative;overflow:hidden}.fx>b,.fx>u,.fx>i{display:none}.fx::before{content:'';position:absolute;left:0;bottom:0;height:2px;background:#7cb6c8;animation:fxk 6s linear infinite}.fx::after{content:'\u5df2\u5220\u9664 3 \u9879\u3000\u6492\u9500';display:flex;justify-content:space-between;font:600 12px var(--fx-sans,system-ui)}`),

    I('progressmulti', '多步进度', 'Multi-step progress', '第几步、还有几步、能不能退', 'Which step, how many, can I go back',
      '步骤条显示当前、已完成与未来；允许回退且保留已填数据，禁止把校验错误藏在上一步。',
      'Show current, done and upcoming. Allow going back with data intact, and never hide a validation error on a previous step.',
      'nav', `.fxnav{gap:0}.fx{position:relative;font-size:12px}.fx:nth-child(1),.fx:nth-child(2){color:#3f6f92;font-weight:600}.fx:nth-child(2)::after{content:'';position:absolute;left:8px;right:8px;bottom:2px;height:2px;background:#3f6f92}.fx:nth-child(n+4){opacity:.4}`),

    I('queuedstate', '排队中', 'Queued', '还没开始跑，在等位置', 'Not started — waiting in line',
      '区分"排队中 / 处理中 / 已完成"三态，排队要给位次或预计开始时间。',
      'Distinguish queued, running and done — and give a position or an ETA for queued.',
      'list', `.fxcol{width:min(400px,88%)}.fx>u{display:none}.fx:nth-child(1)::after{content:'\u6392\u961f\u4e2d \u00b7 \u7b2c 4 \u4f4d';color:#8b8d84;font:500 12px var(--fx-mono,monospace)}.fx:nth-child(2)::after{content:'\u5904\u7406\u4e2d \u00b7 62%';color:#3f6f92;font:500 12px var(--fx-mono,monospace)}.fx:nth-child(3)::after{content:'\u5df2\u5b8c\u6210';color:#4d8ba6;font:500 12px var(--fx-mono,monospace)}.fx:nth-child(n+4){display:none}`),

    I('processingasync', '后台处理中', 'Background job', '这事要跑十分钟，别让他干等', 'It takes ten minutes — let them leave',
      '允许离开页面，完成后用通知或邮件告知；进度可在通知中心查询，别用 modal 锁住。',
      'Let them navigate away and notify on completion. Progress lives in the notification centre, not a blocking modal.',
      'card', `.fx{padding:14px;display:flex;align-items:center;gap:11px}.fx>b{width:26px;height:26px;border-radius:7px;margin:0;background:#eef4f8}.fx>u,.fx>i{display:none}.fx::after{content:'\u6b63\u5728\u751f\u6210\u62a5\u544a \u00b7 \u5b8c\u6210\u540e\u901a\u77e5\u4f60';font:500 12px var(--fx-sans,system-ui);color:#65675f}`),

    I('expiring', '即将过期', 'Expiring soon', '在还能补救的时候提醒', 'Warn while it can still be fixed',
      '按剩余时间分级（30 天低干扰 / 7 天显眼 / 24 小时强提示），每级给不同动作。',
      'Escalate by time remaining — quiet at thirty days, prominent at seven, urgent at one — with a different action at each level.',
      'list', `.fxcol{width:min(400px,88%)}.fx>u{display:none}.fx:nth-child(1)::after{content:'30 \u5929 \u00b7 \u4ec5\u63d0\u793a';color:#8b8d84;font:500 12px var(--fx-mono,monospace)}.fx:nth-child(2){border-color:#e0d7c4}.fx:nth-child(2)::after{content:'7 \u5929 \u00b7 \u5efa\u8bae\u7eed\u671f';color:#c07a3a;font:600 12px var(--fx-mono,monospace)}.fx:nth-child(3){border-color:#e9cdd4}.fx:nth-child(3)::after{content:'24 \u5c0f\u65f6 \u00b7 \u7acb\u5373\u5904\u7406';color:#c04a63;font:600 12px var(--fx-mono,monospace)}.fx:nth-child(n+4){display:none}`),

    I('draftsaved', '草稿已保存', 'Draft saved', '安静但可见', 'Quiet, but visible',
      '低对比小字 + 时间戳，写入时短暂变化；不要每次按键都闪一下"保存中"。',
      'Small low-contrast text with a timestamp that changes briefly on write. Do not flash "saving" on every keystroke.',
      'field', `@keyframes fxk{0%,70%{content:'\u5df2\u4fdd\u5b58 \u00b7 \u521a\u521a'}80%,100%{content:'\u4fdd\u5b58\u4e2d\u2026'}}.fxfield{position:relative}.fx{color:#23232f}.fxfield::after{content:'\u5df2\u4fdd\u5b58 \u00b7 \u521a\u521a';position:absolute;right:2px;top:56px;font:400 11px var(--fx-sans,system-ui);color:#a5a79e;animation:fxk 4s steps(1,end) infinite}`),

    I('conflictstate', '冲突', 'Conflict', '两个人改了同一处', 'Two people changed the same thing',
      '并排显示两版并让用户选，或提供合并；绝不静默覆盖，也不要只说"保存失败"。',
      'Show both versions side by side and let them choose, or offer a merge. Never overwrite silently.',
      'panel', `.fxstack{width:min(460px,88%);height:min(200px,32vh)}.fxa{inset:0 50% 0 0;background:#f4f5f1;color:#23232f;font:600 12px var(--fx-sans,system-ui);border-right:1px solid #e4e5e0}.fxa::after{content:'\u4f60\u7684\u7248\u672c'}.fxb{inset:0 0 0 50%;background:#eef4f8;color:#3f6f92;font:600 12px var(--fx-sans,system-ui)}.fxb::after{content:'\u670d\u52a1\u5668\u7248\u672c'}`),

    I('readonlystate', '只读', 'Read-only', '看得见但改不了，要一眼看出来', 'Visibly not editable',
      '去掉输入框边框、光标变默认、隐藏操作按钮，并说明为什么只读；不要只 disabled 一片。',
      'Drop field borders, use the default cursor, hide the actions, and say why. Do not just disable everything.',
      'field', `.fxfield{display:flex;flex-direction:column;gap:6px}.fx{border-color:transparent;background:#f4f5f1;color:#65675f;cursor:default}.fx>u{display:none}.fxfield::after{content:'\u5df2\u5f52\u6863 \u00b7 \u4e0d\u53ef\u7f16\u8f91';font:500 11px var(--fx-mono,monospace);color:#8b8d84}`),

    I('lockedstate', '被他人锁定', 'Locked by another', '谁在改、什么时候能改', 'Who has it, and when it frees',
      '显示占用者头像与开始时间，给"请求接管"；锁要有超时，别永久卡住。',
      'Show the holder and since when, offer a takeover request, and always expire the lock.',
      'card', `.fx{padding:13px;display:flex;align-items:center;gap:10px;border-color:#e0d7c4}.fx>b{width:26px;height:26px;border-radius:50%;margin:0;background:#e5a68f}.fx>u,.fx>i{display:none}.fx::after{content:'\u5f20\u5a67\u6b63\u5728\u7f16\u8f91 \u00b7 6 \u5206\u949f\u524d';font:500 12px var(--fx-sans,system-ui);color:#65675f}`),

    I('betaflag', '实验特性', 'Beta flag', '标清楚这是会变的', 'Mark what is still moving',
      '角标 + 一句"可能变化/可关闭"，并给反馈入口；不要把 beta 当免责声明用。',
      'A badge plus one line saying it may change, with a feedback path. Beta is not a disclaimer.',
      'pill', `.fx:nth-child(2)::after{content:' BETA';font:700 9px var(--fx-mono,monospace);color:#c07a3a;margin-left:5px}.fx:nth-child(2){border-color:#e0d7c4}`),

    I('deprecated', '即将下线', 'Deprecated', '给迁移路径和最后期限', 'A migration path and a date',
      '标注下线日期、替代方案链接与影响范围；下线前 30 天升级为阻断式提示。',
      'State the sunset date, the replacement, and the blast radius — escalating to a blocking notice thirty days out.',
      'card', `.fx{padding:14px;border-color:#e0d7c4;background:#fdfaf4}.fx>b,.fx>u,.fx>i{display:none}.fx::after{content:'v1 \u63a5\u53e3\u5c06\u4e8e 12 \u6708 1 \u65e5\u505c\u7528\\A \u2192 \u8fc1\u79fb\u5230 v2 \u00b7 \u5f71\u54cd 3 \u4e2a\u96c6\u6210';white-space:pre-line;font:400 12px/1.8 var(--fx-sans,system-ui);color:#65675f}`),

    I('quotameter', '配额用量', 'Quota meter', '快用完了要提前知道', 'See it coming, not after',
      '进度条 + 剩余量 + 重置时间，80% 与 95% 两个阈值变色并提示升级；超限行为要写清楚。',
      'A bar, the remainder and the reset time, with colour shifts at 80% and 95% — and a stated over-limit behaviour.',
      'loader', `.fxload{flex-direction:column;gap:8px;width:min(320px,74%);align-items:stretch}.fx{width:auto;height:9px;border-radius:5px;background:#eceef1;position:relative;overflow:hidden}.fx::after{content:'';position:absolute;inset:0 auto 0 0}.fx:nth-child(1)::after{width:42%;background:#4d8ba6}.fx:nth-child(2)::after{width:82%;background:#c07a3a}.fx:nth-child(3)::after{width:97%;background:#c04a63}`),

    I('notifbadge', '未读角标', 'Unread badge', '数字要有上限，也要能清零', 'Cap the number and let it clear',
      '99+ 封顶；只对需要行动的事计数，纯资讯用圆点。进入列表即视为已读要谨慎。',
      'Cap at 99+. Count only actionable items and use a plain dot for informational ones. Auto-read on open is a risky default.',
      'nav', `.fx{position:relative}.fx:nth-child(2)::after{content:'12';position:absolute;top:2px;right:2px;min-width:16px;height:16px;padding:0 4px;border-radius:8px;background:#e8879c;color:#fff;font:700 9.5px/16px var(--fx-mono,monospace);text-align:center}.fx:nth-child(4)::after{content:'';position:absolute;top:7px;right:7px;width:6px;height:6px;border-radius:50%;background:#4d8ba6}`),

    I('notifcenter', '通知中心', 'Notification centre', '未读、已读、按来源分组', 'Unread, read, grouped by source',
      '分组 + 批量已读 + 逐条静音；不要只做一个倒序列表，那会在第二周变成垃圾堆。',
      'Grouping, mark-all-read and per-source mute. A plain reverse-chronological list becomes landfill by week two.',
      'list', `.fxcol{width:min(400px,88%);gap:6px}.fx:nth-child(-n+2){background:#f6f9fb;border-color:#dbe8ef}.fx:nth-child(-n+2)::before{content:'';width:6px;height:6px;border-radius:50%;background:#3f6f92;flex:none}.fx>u{width:52%}`),

    I('digestbatch', '合并通知', 'Digest batching', '同一件事别推十条', 'Ten pushes for one event is spam',
      '按实体与时间窗合并（"张娇等 3 人评论了"），并提供每日/每周摘要；夜间静默。',
      'Collapse by entity and time window, offer a daily or weekly digest, and stay quiet at night.',
      'card', `.fx{padding:13px;display:flex;align-items:center;gap:10px}.fx>b{width:26px;height:26px;border-radius:50%;margin:0;background:#e5a68f;box-shadow:14px 0 0 #7cb6c8,28px 0 0 #c9d76a}.fx>u,.fx>i{display:none}.fx::after{content:'\u5f20\u5a67\u7b49 3 \u4eba\u8bc4\u8bba\u4e86\u8fd9\u4efd\u62a5\u544a';margin-left:36px;font:500 12px var(--fx-sans,system-ui);color:#23232f}`)
  ]
};
