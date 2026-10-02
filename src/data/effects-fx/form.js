// Curated foundational patterns
const _atlasExpansion20260927_form = {
  "id": "form",
  "zh": "表单与输入",
  "en": "Forms & input",
  "dz": "填写是最容易被放弃的一步",
  "de": "Filling things in is where people give up",
  "items": [
    {
      "id": "floatlabel",
      "zh": "浮动标签",
      "en": "Floating label",
      "dz": "标签上移变小",
      "de": "The label rises and shrinks",
      "pz": "标签上移 + 缩小 0.78，160ms；空值时回落。",
      "pe": "Rise and scale to 0.78 in 160ms; fall back when empty.",
      "demo": "field",
      "css": "@keyframes fxk{0%,35%{transform:none;font-size:15px;color:#9a9ca6}55%,100%{transform:translateY(-22px) translateX(-2px);font-size:11px;color:var(--fx-accent,#e8879c)}}.fx{position:relative;overflow:visible;color:transparent}.fx::before{content:'Email';position:absolute;left:14px;background:#fcfcfb;padding:0 4px;animation:fxk 3s cubic-bezier(.22,1,.36,1) infinite alternate}"
    },
    {
      "id": "labelabove",
      "zh": "标签常驻",
      "en": "Persistent label",
      "dz": "标签永远在上面",
      "de": "The label never moves",
      "pz": "可访问性最好的方案：标签不动、不遮挡、不猜。",
      "pe": "The most accessible option: never moves, never hides.",
      "demo": "field",
      "css": ".fxfield{position:relative;padding-top:22px}.fxfield::before{content:'Farm name';position:absolute;top:0;left:0;font:600 11.5px/1 var(--fx-sans,system-ui);color:#5a5c67}"
    },
    {
      "id": "focusborder",
      "zh": "聚焦边框",
      "en": "Focus border",
      "dz": "边框变色变粗",
      "de": "The border sharpens",
      "pz": "聚焦色和错误色必须不同，且都不是唯一提示。",
      "pe": "Focus and error colours must differ — and never be the only cue.",
      "demo": "field",
      "css": ".fx{transition:border-color .16s,box-shadow .16s}.fx:hover{border-color:#23232f;box-shadow:0 0 0 3px rgba(48,66,92,.08)}"
    },
    {
      "id": "focusfill",
      "zh": "聚焦底色",
      "en": "Focus fill",
      "dz": "聚焦时底色变白",
      "de": "The field brightens on focus",
      "pz": "未聚焦浅灰、聚焦纯白，比只改边框更明显。",
      "pe": "Grey at rest, white on focus — clearer than a border change.",
      "demo": "field",
      "css": ".fx{background:#f4f5f7;border-color:transparent;transition:background .18s,border-color .18s}.fx:hover{background:#fcfcfb;border-color:#23232f}"
    },
    {
      "id": "caretsmooth",
      "zh": "光标平滑移动",
      "en": "Smooth caret",
      "dz": "光标滑过去而不是跳",
      "de": "The caret glides",
      "pz": "caret-animation 或自绘光标，注意输入延迟感。",
      "pe": "caret-animation, or a custom caret — mind the latency.",
      "demo": "field",
      "css": "@keyframes fxk{0%{transform:translateX(0)}100%{transform:translateX(88px)}}.fx>u{animation:fxk 2s cubic-bezier(.22,1,.36,1) infinite alternate;background:var(--fx-accent,#e8879c)}"
    },
    {
      "id": "placeholderfade",
      "zh": "占位符淡出",
      "en": "Placeholder fades",
      "dz": "开始输入就淡掉",
      "de": "It fades as you type",
      "pz": "占位符不能承担标签职责，只放示例格式。",
      "pe": "A placeholder is an example, never a label.",
      "demo": "field",
      "css": "@keyframes fxk{0%,40%{opacity:1}60%,100%{opacity:0}}.fx{animation:fxk 3s cubic-bezier(.22,1,.36,1) infinite alternate}"
    },
    {
      "id": "inputmask",
      "zh": "输入格式化",
      "en": "Input mask",
      "dz": "边输边分组",
      "de": "It groups as you type",
      "pz": "格式化不要打断光标位置，删除时也要正确回退。",
      "pe": "Never lose the caret — and handle backspace properly.",
      "demo": "field",
      "css": "@keyframes fxk{0%{content:'4242'}33%{content:'4242 4242'}66%{content:'4242 4242 42'}100%{content:'4242 4242 4242 4242'}}.fx{color:#23232f;font-family:var(--sv-font-mono,monospace);letter-spacing:.06em}.fx::after{content:'4242';animation:fxk 3.2s steps(1,end) infinite}"
    },
    {
      "id": "charcount",
      "zh": "字数统计",
      "en": "Character count",
      "dz": "快超了才提醒",
      "de": "It only speaks up near the limit",
      "pz": "剩余 20% 才显示计数，超限变红并阻止提交。",
      "pe": "Show the count in the last 20%; block submit past the cap.",
      "demo": "field",
      "css": ".fxfield{position:relative}.fxfield::after{content:'118 / 140';position:absolute;right:0;bottom:-20px;font:500 11px/1 var(--sv-font-mono,monospace);color:#a8aab3}"
    },
    {
      "id": "validsuccess",
      "zh": "校验通过",
      "en": "Valid state",
      "dz": "右侧一个绿勾",
      "de": "A green tick appears",
      "pz": "成功提示要即时（失焦时），不要每敲一下就跳。",
      "pe": "Validate on blur, not on every keystroke.",
      "demo": "field",
      "css": "@keyframes fxk{0%,50%{opacity:0;transform:scale(.6)}70%,100%{opacity:1;transform:none}}.fx{border-color:#cbe3c1;justify-content:space-between}.fx>u{width:18px;height:18px;border-radius:50%;background:#2f5c26;animation:fxk 2.4s cubic-bezier(.22,1,.36,1) infinite alternate}"
    },
    {
      "id": "validerror",
      "zh": "校验错误",
      "en": "Error state",
      "dz": "红边加一行说明",
      "de": "A red edge and one line of help",
      "pz": "错误文案说“怎么改”，不是“输入无效”。",
      "pe": "Tell them how to fix it, not that it is invalid.",
      "demo": "field",
      "css": ".fxfield{position:relative}.fx{border-color:#e0879b;background:#fffafb}.fxfield::after{content:'请填写完整的邮箱地址';position:absolute;left:0;bottom:-20px;font:500 11.5px/1 var(--fx-sans,system-ui);color:#a11734}"
    },
    {
      "id": "shakeerror",
      "zh": "错误抖动",
      "en": "Error shake",
      "dz": "轻轻摇一下",
      "de": "A small shake",
      "pz": "幅度 ≤6px、两个来回、总时长 300ms，别做成抽风。",
      "pe": "Under 6px, two cycles, 300ms total.",
      "demo": "field",
      "css": "@keyframes fxk{0%,72%,100%{transform:translateX(0)}78%{transform:translateX(-6px)}84%{transform:translateX(5px)}90%{transform:translateX(-3px)}95%{transform:translateX(2px)}}.fx{border-color:#e0879b;animation:fxk 3s cubic-bezier(.22,1,.36,1) infinite}"
    },
    {
      "id": "inlinehelp",
      "zh": "行内帮助",
      "en": "Inline help",
      "dz": "规则提前告知",
      "de": "Rules stated up front",
      "pz": "把要求写在输入前，而不是错了才说。",
      "pe": "State the requirement before they type, not after they fail.",
      "demo": "field",
      "css": ".fxfield{position:relative}.fxfield::after{content:'至少 8 位，含一个数字';position:absolute;left:0;bottom:-20px;font:400 11.5px/1 var(--fx-sans,system-ui);color:#8b8e99}"
    },
    {
      "id": "passwordstrength",
      "zh": "密码强度",
      "en": "Password strength",
      "dz": "一条分段的强度条",
      "de": "A segmented strength bar",
      "pz": "给出具体缺什么，而不是只显示“弱”。",
      "pe": "Say what is missing — not just “weak”.",
      "demo": "list",
      "css": ".fx>u{background:transparent;display:flex;gap:4px;height:5px}.fx:nth-child(1)>u{background:linear-gradient(90deg,#e8879c 0 25%,#eceef1 25%)}.fx:nth-child(2)>u{background:linear-gradient(90deg,#f4dcb8 0 50%,#eceef1 50%)}.fx:nth-child(3)>u{background:linear-gradient(90deg,#e5a68f 0 75%,#eceef1 75%)}.fx:nth-child(4)>u{background:#2f5c26}"
    },
    {
      "id": "revealpassword",
      "zh": "显示密码",
      "en": "Reveal password",
      "dz": "眼睛图标切换明文",
      "de": "The eye reveals it",
      "pz": "默认隐藏，切换即时；不要因为切换清空输入。",
      "pe": "Toggle instantly and never clear the value.",
      "demo": "field",
      "css": "@keyframes fxk{0%,45%{letter-spacing:.3em}55%,100%{letter-spacing:0}}.fx{color:#23232f;animation:fxk 3s steps(1,end) infinite}.fx::after{content:'••••••••';margin-left:2px}"
    },
    {
      "id": "autocomplete",
      "zh": "自动补全",
      "en": "Autocomplete",
      "dz": "下面浮出候选",
      "de": "Suggestions drop below",
      "pz": "高亮匹配片段，键盘上下要能选。",
      "pe": "Highlight the matched span; arrow keys must work.",
      "demo": "card",
      "css": "@keyframes fxk{0%,25%{opacity:0;transform:translateY(-6px)}45%,100%{opacity:1;transform:none}}.fx{padding:8px;animation:fxk 3s cubic-bezier(.22,1,.36,1) infinite alternate}.fx>b{height:40px;background:#f4f5f7;border-radius:6px;margin-bottom:6px}.fx>u{height:34px;width:100%;background:#f4f5f1;border-radius:6px}.fx>i{height:34px;width:100%;background:#fcfcfb;border:1px solid #eceef1;border-radius:6px;margin-top:4px}"
    },
    {
      "id": "combobox",
      "zh": "可搜索下拉",
      "en": "Combobox",
      "dz": "边打字边筛选选项",
      "de": "Type to filter the options",
      "pz": "空结果要给“创建新的…”出口。",
      "pe": "Empty results need a “create new…” escape.",
      "demo": "list",
      "css": ".fx{font-size:13px;height:42px}.fx:nth-child(1){background:#f4f5f7;border-color:#dcdee3}.fx:nth-child(3){background:#f2f3f5}.fx>u{height:7px;width:64%;flex:none}"
    },
    {
      "id": "tagsinput",
      "zh": "标签输入",
      "en": "Tags input",
      "dz": "回车把词变成标签",
      "de": "Enter turns a word into a chip",
      "pz": "退格删除最后一个标签，粘贴要能批量拆分。",
      "pe": "Backspace removes the last chip; paste should split.",
      "demo": "field",
      "css": ".fx{gap:6px;padding-left:8px}.fx>u{width:auto;height:24px;background:#f2f3f5;border-radius:6px;flex:none;padding:0 10px;display:flex;align-items:center;font:500 12px/1 var(--fx-sans,system-ui);color:#23232f}.fx>u::after{content:'putumayo ×'}.fx>b{display:block;width:2px;height:18px;background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2);border-radius:1px}"
    },
    {
      "id": "searchclear",
      "zh": "搜索清除",
      "en": "Clear search",
      "dz": "有内容才出现叉号",
      "de": "The cross appears only when there is text",
      "pz": "清除按钮点击区 ≥32px，清空后保持聚焦。",
      "pe": "A ≥32px hit area, and keep focus after clearing.",
      "demo": "field",
      "css": "@keyframes fxk{0%,40%{opacity:0;transform:scale(.7)}55%,100%{opacity:1;transform:none}}.fx{justify-content:space-between;color:#23232f}.fx>u{width:18px;height:18px;border-radius:50%;background:#dcdee3;animation:fxk 3s cubic-bezier(.22,1,.36,1) infinite alternate}"
    },
    {
      "id": "searchloading",
      "zh": "搜索中",
      "en": "Searching",
      "dz": "右侧转一个小圈",
      "de": "A small spinner on the right",
      "pz": "搜索建议要有防抖（250–350ms），否则闪烁。",
      "pe": "Debounce 250–350ms or it flickers.",
      "demo": "field",
      "css": "@keyframes fxk{to{transform:rotate(360deg)}}.fx{justify-content:space-between}.fx>u{width:16px;height:16px;border:2px solid #e3e5ea;border-top-color:#23232f;border-radius:50%;background:transparent;animation:fxk .8s linear infinite}"
    },
    {
      "id": "textareagrow",
      "zh": "文本域自增高",
      "en": "Textarea grows",
      "dz": "内容多了自动变高",
      "de": "It grows with the content",
      "pz": "用隐藏镜像元素测高，别用 scrollHeight 循环。",
      "pe": "Measure with a hidden mirror element.",
      "demo": "field",
      "css": "@keyframes fxk{0%,30%{height:48px}70%,100%{height:110px}}.fx{align-items:flex-start;padding-top:14px;animation:fxk 3.4s cubic-bezier(.22,1,.36,1) infinite alternate}"
    },
    {
      "id": "stepform",
      "zh": "分步表单",
      "en": "Multi-step form",
      "dz": "一步只问一件事",
      "de": "One question per step",
      "pz": "顶部进度 + 可返回；每步都能保存草稿。",
      "pe": "Progress at the top, back allowed, drafts saved.",
      "demo": "panel",
      "css": "@keyframes fxk{0%,25%{transform:translateX(0)}55%,100%{transform:translateX(-100%)}}.fxstack{overflow:hidden}.fxa,.fxb{width:100%;animation:fxk 3s cubic-bezier(.22,1,.36,1) infinite alternate}.fxb{left:100%}"
    },
    {
      "id": "fieldsetgroup",
      "zh": "字段分组",
      "en": "Fieldset grouping",
      "dz": "相关字段抱在一起",
      "de": "Related fields sit together",
      "pz": "分组标题用小号大写，组间距是组内的 2 倍。",
      "pe": "Small caps for the group title; double the gap between groups.",
      "demo": "list",
      "css": ".fxcol{gap:8px}.fx:nth-child(1),.fx:nth-child(4){border:0;background:transparent;height:24px;font:600 10.5px/1 var(--sv-font-mono,monospace);color:#a8aab3;letter-spacing:.14em;padding:0}.fx:nth-child(1)>i,.fx:nth-child(1)>u,.fx:nth-child(4)>i,.fx:nth-child(4)>u{display:none}.fx:nth-child(4){margin-top:14px}"
    },
    {
      "id": "requiredmark",
      "zh": "必填标记",
      "en": "Required marker",
      "dz": "标出必填而不是选填",
      "de": "Mark what is required",
      "pz": "必填项少时标必填，多时反过来标“选填”。",
      "pe": "Mark the minority — required or optional, whichever is fewer.",
      "demo": "field",
      "css": ".fxfield{position:relative;padding-top:22px}.fxfield::before{content:'Email *';position:absolute;top:0;left:0;font:600 11.5px/1 var(--fx-sans,system-ui);color:#5a5c67}"
    },
    {
      "id": "submitloading",
      "zh": "提交加载",
      "en": "Submitting",
      "dz": "按钮变成加载态",
      "de": "The button becomes a loader",
      "pz": "按钮宽度锁死，文字换成 spinner，避免布局跳。",
      "pe": "Lock the width and swap the label for a spinner.",
      "demo": "pill",
      "css": "@keyframes fxk{to{transform:rotate(360deg)}}.fx:nth-child(1){background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2);color:transparent;border-color:#23232f;position:relative;min-width:96px}.fx:nth-child(1)::after{content:'';position:absolute;left:50%;top:50%;width:15px;height:15px;margin:-8px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:fxk .8s linear infinite}"
    },
    {
      "id": "submitsuccess",
      "zh": "提交成功",
      "en": "Submit success",
      "dz": "按钮变成对勾",
      "de": "The button becomes a tick",
      "pz": "成功状态停留 1.2s 再跳转，让人看见结果。",
      "pe": "Hold the success state 1.2s before navigating.",
      "demo": "pill",
      "css": "@keyframes fxk{0%,45%{background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2);border-color:#23232f}55%,100%{background:#2f5c26;border-color:#2f5c26}}.fx:nth-child(1){color:#fff;animation:fxk 3s cubic-bezier(.22,1,.36,1) infinite;font-weight:600}"
    },
    {
      "id": "disabledsubmit",
      "zh": "禁用提交",
      "en": "Disabled submit",
      "dz": "没填完不能点",
      "de": "Not until it is complete",
      "pz": "禁用时要说明还缺什么，别让人猜。",
      "pe": "Say what is missing — never let them guess.",
      "demo": "pill",
      "css": ".fx:nth-child(1){background:#f2f3f5;color:#b0b2ba;border-color:#eceef1;cursor:not-allowed}"
    },
    {
      "id": "autosave",
      "zh": "自动保存",
      "en": "Autosave",
      "dz": "悄悄保存并告知",
      "de": "Saved quietly, and said so",
      "pz": "状态三态：保存中、已保存、保存失败可重试。",
      "pe": "Three states: saving, saved, failed with retry.",
      "demo": "num",
      "css": "@keyframes fxk{0%,40%{content:'保存中…';color:#8b8e99}50%,100%{content:'已保存';color:#2f5c26}}.fxnum .fx{font:500 15px/1 var(--fx-sans,system-ui);letter-spacing:0;color:transparent}.fx::after{content:'已保存';animation:fxk 3s steps(1,end) infinite}"
    },
    {
      "id": "dateinput",
      "zh": "日期输入",
      "en": "Date input",
      "dz": "三段分开但连着走",
      "de": "Three segments, one flow",
      "pz": "填满一段自动跳下一段，退格能回上一段。",
      "pe": "Auto-advance on fill; backspace returns.",
      "demo": "field",
      "css": ".fx{gap:10px;color:#23232f;font-family:var(--sv-font-mono,monospace)}.fx::after{content:'2026 / 09 / 07'}.fx>u{display:none}"
    },
    {
      "id": "datepicker",
      "zh": "日历选择",
      "en": "Date picker",
      "dz": "弹出一个月历",
      "de": "A month pops out",
      "pz": "今天、选中、区间三种状态要能区分。",
      "pe": "Today, selected and in-range must all read differently.",
      "demo": "grid",
      "css": ".fxgrid{grid-template-columns:repeat(7,32px);gap:4px}.fx{height:32px;border:0;border-radius:8px;background:transparent;font:500 12px/32px var(--fx-sans,system-ui);color:#5a5c67;text-align:center}.fx:nth-child(3){background:#f2f3f5}.fx:nth-child(5){background:linear-gradient(150deg,#6ba9bd,#3f7796 36%,#3b5f92 68%,#4a58a2);color:#fff}.fx:nth-child(6),.fx:nth-child(7){background:color-mix(in oklab,#23232f 8%,#fff)}"
    },
    {
      "id": "timepicker",
      "zh": "时间滚轮",
      "en": "Time wheel",
      "dz": "滚轮吸附到整刻",
      "de": "The wheel snaps to the slot",
      "pz": "scroll-snap + 中间高亮带，选中项放大。",
      "pe": "scroll-snap plus a highlight band; scale the centre item.",
      "demo": "scroll",
      "css": ".fxscroll{height:180px;scroll-snap-type:y mandatory;padding:60px 22px}.fx{height:44px;scroll-snap-align:center;font:600 18px/44px var(--sv-font-mono,monospace);color:#b0b2ba;background:transparent}.fx::after{content:'09:30'}.fx:nth-child(2){color:#23232f;background:#f2f3f5}"
    },
    {
      "id": "fileupload",
      "zh": "文件上传",
      "en": "File upload",
      "dz": "拖拽或点击选择",
      "de": "Drag in, or click to choose",
      "pz": "写清支持格式与大小上限，上传中可取消。",
      "pe": "State formats and limits; allow cancel mid-upload.",
      "demo": "surface",
      "css": ".fx{inset:16px;border:2px dashed #c9ccd3;border-radius:12px;background:#fafbfc}.fxsurface:hover .fx{border-color:var(--fx-accent,#e8879c);border-style:solid}"
    },
    {
      "id": "uploadprogress",
      "zh": "上传进度",
      "en": "Upload progress",
      "dz": "每个文件一条进度",
      "de": "One bar per file",
      "pz": "显示已传/总大小与速度，失败项可单独重试。",
      "pe": "Show bytes and rate; retry per file.",
      "demo": "list",
      "css": "@keyframes fxk{from{transform:scaleX(.1)}to{transform:scaleX(1)}}.fx>u{background:#eceef1;position:relative;overflow:hidden}.fx>u::after{content:'';position:absolute;inset:0;background:var(--fx-accent,#e5a68f);transform-origin:left;animation:fxk 2.4s cubic-bezier(.22,1,.36,1) infinite alternate;animation-delay:calc(var(--i)*-.4s)}"
    },
    {
      "id": "otpinput",
      "zh": "验证码输入",
      "en": "OTP input",
      "dz": "六个格子逐个填",
      "de": "Six boxes, one digit each",
      "pz": "支持整段粘贴，填满自动提交。",
      "pe": "Accept a pasted code and auto-submit when full.",
      "demo": "loader",
      "css": "@keyframes fxk{0%,20%{border-color:#dcdee3}30%,100%{border-color:#23232f}}.fxload{gap:8px}.fx{width:42px;height:52px;border-radius:8px;border:1.5px solid #dcdee3;background:#fcfcfb;animation:fxk 3s steps(1,end) infinite;animation-delay:calc(var(--i)*.4s)}"
    },
    {
      "id": "phoneprefix",
      "zh": "国际号码前缀",
      "en": "Phone prefix",
      "dz": "左侧一个国家选择",
      "de": "A country selector on the left",
      "pz": "前缀与号码同一控件，别拆成两个字段。",
      "pe": "One control, not two fields.",
      "demo": "field",
      "css": ".fx{padding-left:0;gap:0}.fx>u{display:block;width:auto;height:100%;background:#f4f5f7;border-radius:7px 0 0 7px;padding:0 12px;display:flex;align-items:center;font:500 14px/1 var(--sv-font-mono,monospace);color:#23232f}.fx>u::after{content:'+57'}.fx>b{display:block;margin-left:12px;color:#9a9ca6}"
    },
    {
      "id": "currencyinput",
      "zh": "金额输入",
      "en": "Amount input",
      "dz": "符号固定、数字右对齐",
      "de": "Symbol fixed, digits right-aligned",
      "pz": "金额右对齐并用等宽数字，符号不参与输入。",
      "pe": "Right-align with tabular digits; the symbol is not typed.",
      "demo": "field",
      "css": ".fx{justify-content:space-between;font-family:var(--sv-font-mono,monospace)}.fx::before{content:'$';color:#9a9ca6}.fx::after{content:'1,280.00';color:#23232f;font-variant-numeric:tabular-nums}.fx>u{display:none}"
    },
    {
      "id": "selectnative",
      "zh": "原生下拉",
      "en": "Native select",
      "dz": "移动端最稳的选择器",
      "de": "The safest picker on mobile",
      "pz": "选项多于 8 个就用原生 select，别自造。",
      "pe": "Past eight options, use the native control.",
      "demo": "field",
      "css": ".fx{justify-content:space-between;color:#23232f}.fx>u{width:0;height:0;border:5px solid transparent;border-top-color:#8b8e99;border-radius:0;margin-top:4px}"
    },
    {
      "id": "inlineedit",
      "zh": "就地编辑",
      "en": "Inline edit",
      "dz": "点一下文字就能改",
      "de": "Click the text to change it",
      "pz": "编辑态与展示态位置完全一致，切换零跳动。",
      "pe": "The edit state must sit exactly where the text was.",
      "demo": "field",
      "css": "@keyframes fxk{0%,45%{border-color:transparent;background:transparent}55%,100%{border-color:#23232f;background:#fcfcfb}}.fx{animation:fxk 3s cubic-bezier(.22,1,.36,1) infinite;color:#23232f}"
    },
    {
      "id": "formsummary",
      "zh": "错误汇总",
      "en": "Error summary",
      "dz": "顶部列出所有问题",
      "de": "All problems listed at the top",
      "pz": "汇总项可点击定位到字段，并给 aria-live。",
      "pe": "Each entry links to its field, announced via aria-live.",
      "demo": "card",
      "css": ".fx{border-color:#e0879b;background:#fffafb}.fx>b{background:#fdedf0;height:52px}.fx>u{background:#f6c9d3;width:80%}.fx>i{background:#f6c9d3;width:56%}"
    },
    {
      "id": "stickysubmit",
      "zh": "吸底提交条",
      "en": "Sticky submit bar",
      "dz": "长表单的提交永远在手边",
      "de": "On a long form, submit stays reachable",
      "pz": "吸底条要有上边界阴影，并避开输入法。",
      "pe": "Give it a top shadow and keep clear of the keyboard.",
      "demo": "scroll",
      "css": ".fxscroll{padding-bottom:0}.fx:last-child{position:sticky;bottom:0;height:60px;background:#fcfcfb;box-shadow:0 -8px 18px rgba(48,66,92,.08);z-index:2}"
    },
    {
      "id": "keyboardhint",
      "zh": "快捷键提示",
      "en": "Keyboard hint",
      "dz": "角落里的键位提示",
      "de": "A key hint in the corner",
      "pz": "快捷键用 kbd 样式的小方块，别用纯文字。",
      "pe": "Render keys as small kbd blocks, not plain text.",
      "demo": "field",
      "css": ".fx{justify-content:space-between}.fx>u{width:auto;height:20px;background:#f2f3f5;border:1px solid #e3e5ea;border-radius:5px;padding:0 6px;display:flex;align-items:center;font:600 10.5px/1 var(--sv-font-mono,monospace);color:#8b8e99}.fx>u::after{content:'⌘K'}"
    },
    {
      "id": "form-draft",
      "zh": "表单草稿",
      "en": "Form draft",
      "dz": "长表单自动保留草稿，离开后可以恢复或清除。",
      "de": "Retain long-form drafts and offer restore or discard.",
      "pz": "长表单自动保留草稿，离开后可以恢复或清除。 在键盘、移动端、失败提交和中英文切换下复核。",
      "pe": "Retain long-form drafts and offer restore or discard. Validate keyboard, mobile, failed submit, and locale switching.",
      "demo": "box",
      "cells": ["草稿 · 未提交"],
      "css": ".fx{width:186px;height:76px;border-radius:10px;background:linear-gradient(#fff,#f4f6f2);border:1px dashed #9fb0a0;color:#8b8d84;font:600 11.5px/1 var(--fx-sans);position:relative;overflow:hidden}.fx::after{content:'';position:absolute;left:16px;right:16px;bottom:16px;height:6px;border-radius:3px;background:#dfe3db;animation:fd4 3.8s ease-in-out infinite}@keyframes fd4{0%,100%{background:#dfe3db;transform:scaleX(.5);transform-origin:left}48%,76%{background:#3f6f92;transform:scaleX(1);transform-origin:left}}"
    },
    {
      "id": "field-dependency",
      "zh": "字段依赖",
      "en": "Field dependency",
      "dz": "字段依赖变化时清理无效值并解释被重置的原因。",
      "de": "Clear invalid dependent values and explain resets.",
      "pz": "字段依赖变化时清理无效值并解释被重置的原因。 在键盘、移动端、失败提交和中英文切换下复核。",
      "pe": "Clear invalid dependent values and explain resets. Validate keyboard, mobile, failed submit, and locale switching.",
      "demo": "list",
      "n": 3,
      "cells": ["☑ 需要发票","→ 公司名称","→ 税号"],
      "css": ".fxcol{gap:7px;width:164px}.fx{height:30px;border-radius:8px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #dfe3db;color:#202824;font:500 11px/1 var(--fx-sans);justify-content:flex-start;padding-left:11px;animation:fd5 4.2s ease-in-out infinite;animation-delay:calc(var(--i) * .3s)}.fx:nth-child(n+2){margin-left:14px;width:150px}@keyframes fd5{0%,100%{opacity:.25;transform:translateY(-4px)}46%,76%{opacity:1;transform:none}}"
    },
    {
      "id": "conditional-field",
      "zh": "条件字段",
      "en": "Conditional field",
      "dz": "条件字段出现和隐藏不会改变用户已填的无关内容。",
      "de": "Conditional fields do not disturb unrelated input.",
      "pz": "条件字段出现和隐藏不会改变用户已填的无关内容。 在键盘、移动端、失败提交和中英文切换下复核。",
      "pe": "Conditional fields do not disturb unrelated input. Validate keyboard, mobile, failed submit, and locale switching.",
      "demo": "field",
      "cells": [""],
      "css": ".fxfield{flex-direction:column;gap:14px}.fx{width:180px;height:38px;border-radius:9px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #c5d0c8;position:relative;overflow:visible}.fx::after{content:'';position:absolute;left:0;right:0;top:52px;height:38px;border-radius:9px;background:linear-gradient(#eef3f7,#e2ebf1);border:1px solid #8fb6ce;animation:cf2 3.8s ease-in-out infinite}@keyframes cf2{0%,100%{opacity:0;transform:translateY(-8px)}46%,76%{opacity:1;transform:none}}"
    },
    {
      "id": "field-array",
      "zh": "字段数组",
      "en": "Field array",
      "dz": "动态字段数组支持添加、删除、重排和最小数量约束。",
      "de": "Dynamic field arrays support add, remove, reorder, and minimum counts.",
      "pz": "动态字段数组支持添加、删除、重排和最小数量约束。 在键盘、移动端、失败提交和中英文切换下复核。",
      "pe": "Dynamic field arrays support add, remove, reorder, and minimum counts. Validate keyboard, mobile, failed submit, and locale switching.",
      "demo": "list",
      "n": 4,
      "cells": ["成员 1   ×","成员 2   ×","成员 3   ×","+ 添加一行"],
      "css": ".fxcol{gap:6px;width:172px}.fx{height:30px;border-radius:8px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #dfe3db;color:#202824;font:500 10.5px/1 var(--fx-sans);justify-content:flex-start;padding-left:11px;animation:fa3 4s ease-in-out infinite;animation-delay:calc(var(--i) * .14s)}.fx:nth-child(4){background:transparent;border-style:dashed;color:#5d6b57}@keyframes fa3{0%,100%{opacity:.6}46%,74%{opacity:1}}"
    },
    {
      "id": "step-validation",
      "zh": "步骤校验",
      "en": "Step validation",
      "dz": "步骤校验只阻止当前无法继续的错误，不提前阻塞未访问字段。",
      "de": "Block only errors that prevent continuing without validating unseen fields.",
      "pz": "步骤校验只阻止当前无法继续的错误，不提前阻塞未访问字段。 在键盘、移动端、失败提交和中英文切换下复核。",
      "pe": "Block only errors that prevent continuing without validating unseen fields. Validate keyboard, mobile, failed submit, and locale switching.",
      "demo": "list",
      "n": 3,
      "cells": ["✓ 账号","✓ 资料","✗ 支付"],
      "css": ".fxcol{gap:7px;width:148px}.fx{height:32px;border-radius:8px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #dfe3db;color:#3d7a52;font:700 11px/1 var(--fx-mono);animation:sv 4s ease-in-out infinite;animation-delay:calc(var(--i) * .2s)}.fx:nth-child(3){color:#c0392b;background:linear-gradient(#fdf3f2,#f9e9e7);border-color:#e0a8a0;animation-name:sv3}@keyframes sv{0%,100%{opacity:.6}46%,74%{opacity:1}}@keyframes sv3{0%,100%{transform:translateX(0)}16%{transform:translateX(-4px)}32%{transform:translateX(4px)}48%,100%{transform:translateX(0)}}"
    },
    {
      "id": "form-summary",
      "zh": "表单摘要",
      "en": "Form summary",
      "dz": "提交前摘要列出关键值和修改入口，避免用户反复返回。",
      "de": "Summarize key values with edit paths before submission.",
      "pz": "提交前摘要列出关键值和修改入口，避免用户反复返回。 在键盘、移动端、失败提交和中英文切换下复核。",
      "pe": "Summarize key values with edit paths before submission. Validate keyboard, mobile, failed submit, and locale switching.",
      "demo": "list",
      "n": 4,
      "cells": ["账号 · wang@…","套餐 · 团队","席位 · 12","合计 · ¥1,440"],
      "css": ".fxcol{gap:0;width:186px;border:1px solid #dfe3db;border-radius:10px;overflow:hidden;background:#fff}.fx{height:30px;border-radius:0;background:#fff;border-bottom:1px solid #eef1ec;color:#202824;font:500 11px/1 var(--fx-sans);justify-content:flex-start;padding-left:12px}.fx:nth-child(4){font-weight:700;color:#26485c;background:#f2f6f8;border-bottom:0}.fx:nth-child(4){animation:fsu 3.8s ease-in-out infinite}@keyframes fsu{0%,100%{opacity:.6}46%,74%{opacity:1}}"
    },
    {
      "id": "form-reset",
      "zh": "表单重置",
      "en": "Form reset",
      "dz": "重置说明影响范围，支持撤销或恢复草稿。",
      "de": "State reset scope and offer undo or draft restore.",
      "pz": "重置说明影响范围，支持撤销或恢复草稿。 在键盘、移动端、失败提交和中英文切换下复核。",
      "pe": "State reset scope and offer undo or draft restore. Validate keyboard, mobile, failed submit, and locale switching.",
      "demo": "box",
      "cells": ["重置表单"],
      "css": ".fx{width:172px;height:54px;border-radius:9px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #c5d0c8;color:#202824;font:600 11.5px/1 var(--fx-sans);position:relative;overflow:hidden;animation:fr2 3.6s ease-in-out infinite}@keyframes fr2{0%,100%{background:linear-gradient(#fff,#f2f4f0)}30%{background:linear-gradient(#f4f6f2,#eceee8);color:#8b8d84}60%,100%{background:linear-gradient(#fff,#f2f4f0);color:#202824}}"
    },
    {
      "id": "input-mode",
      "zh": "输入模式",
      "en": "Input mode",
      "dz": "移动端根据数据类型选择合适键盘，但不牺牲手动输入。",
      "de": "Choose an appropriate mobile keyboard without blocking manual input.",
      "pz": "移动端根据数据类型选择合适键盘，但不牺牲手动输入。 在键盘、移动端、失败提交和中英文切换下复核。",
      "pe": "Choose an appropriate mobile keyboard without blocking manual input. Validate keyboard, mobile, failed submit, and locale switching.",
      "demo": "box",
      "cells": ["1234567890"],
      "css": ".fx{width:186px;height:56px;border-radius:9px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #c5d0c8;color:#202824;font:600 14px/1 var(--fx-mono);letter-spacing:.08em;position:relative;overflow:visible}.fx::after{content:'inputmode=numeric';position:absolute;left:0;bottom:-20px;font:600 9.5px/1 var(--fx-mono);color:#3f6f92;white-space:nowrap;opacity:0;animation:im 3.8s ease-in-out infinite}@keyframes im{0%,100%{opacity:0}46%,74%{opacity:1}}"
    },
    {
      "id": "autocomplete-off",
      "zh": "关闭自动完成",
      "en": "Disable autocomplete",
      "dz": "敏感字段不使用浏览器或第三方自动完成，并说明原因。",
      "de": "Disable autocomplete for sensitive fields and state why.",
      "pz": "敏感字段不使用浏览器或第三方自动完成，并说明原因。 在键盘、移动端、失败提交和中英文切换下复核。",
      "pe": "Disable autocomplete for sensitive fields and state why. Validate keyboard, mobile, failed submit, and locale switching.",
      "demo": "field",
      "cells": [""],
      "css": ".fxfield .fx{width:180px;height:42px;border-radius:9px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #c5d0c8;position:relative;overflow:hidden}.fx::after{content:'';position:absolute;left:0;right:0;top:100%;height:64px;background:repeating-linear-gradient(180deg,#f6f8f4 0 22px,#eef1ec 22px 23px);border-top:1px solid #e0e4dc;animation:ao 3.8s ease-in-out infinite}@keyframes ao{0%,100%{top:100%}46%,76%{top:100%}}"
    },
    {
      "id": "format-mask",
      "zh": "格式掩码",
      "en": "Format mask",
      "dz": "格式掩码帮助输入但不把占位符写入真实值。",
      "de": "Use masks as guidance without storing placeholder characters.",
      "pz": "格式掩码帮助输入但不把占位符写入真实值。 在键盘、移动端、失败提交和中英文切换下复核。",
      "pe": "Use masks as guidance without storing placeholder characters. Validate keyboard, mobile, failed submit, and locale switching.",
      "demo": "box",
      "cells": ["(021) 5555-0134"],
      "css": ".fx{width:196px;height:56px;border-radius:9px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #c5d0c8;color:#202824;font:600 14px/1 var(--fx-mono);letter-spacing:.02em;position:relative;overflow:visible}.fx::after{content:'__-____-____';position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);color:#dfe3db;font:600 14px/1 var(--fx-mono);z-index:-1}@keyframes fm2{to{opacity:1}}"
    },
    {
      "id": "parse-format",
      "zh": "解析格式化",
      "en": "Parse and format",
      "dz": "显示格式与内部值分离，提交时使用明确解析规则。",
      "de": "Separate display format from internal value with explicit parsing.",
      "pz": "显示格式与内部值分离，提交时使用明确解析规则。 在键盘、移动端、失败提交和中英文切换下复核。",
      "pe": "Separate display format from internal value with explicit parsing. Validate keyboard, mobile, failed submit, and locale switching.",
      "demo": "panel",
      "n": 2,
      "css": ".fxstack{flex-direction:row;gap:12px;align-items:center}.fx:nth-child(1){width:88px;height:42px;border-radius:9px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #c5d0c8;color:#202824;font:600 11px/1 var(--fx-mono)}.fx:nth-child(2){width:92px;height:42px;border-radius:9px;background:linear-gradient(#252a33,#1a1e25);border:1px solid #39404a;color:#bfe4ef;font:600 11px/1 var(--fx-mono);animation:pf 3.8s ease-in-out infinite}@keyframes pf{0%,100%{opacity:.35;transform:translateX(-6px)}46%,76%{opacity:1;transform:none}}"
    },
    {
      "id": "numeric-stepper",
      "zh": "数字步进",
      "en": "Numeric stepper",
      "dz": "数字步进支持键盘、长按和最小最大边界。",
      "de": "Support keyboard, hold, and min/max boundaries.",
      "pz": "数字步进支持键盘、长按和最小最大边界。 在键盘、移动端、失败提交和中英文切换下复核。",
      "pe": "Support keyboard, hold, and min/max boundaries. Validate keyboard, mobile, failed submit, and locale switching.",
      "demo": "panel",
      "n": 3,
      "css": ".fxstack{flex-direction:row;gap:0;align-items:center}.fx:nth-child(1),.fx:nth-child(3){width:38px;height:42px;border-radius:9px 0 0 9px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #c5d0c8;color:#202824;font:700 15px/1 var(--fx-mono)}.fx:nth-child(3){border-radius:0 9px 9px 0}.fx:nth-child(2){width:62px;height:42px;border-radius:0;border-left:0;border-right:0;background:linear-gradient(#fff,#f6f8f4);border:1px solid #c5d0c8;color:#202824;font:600 15px/1 var(--fx-mono);animation:ns 3.6s ease-in-out infinite}@keyframes ns{0%,100%{background:linear-gradient(#fff,#f6f8f4)}30%{background:linear-gradient(#eef3f7,#e2ebf1)}}"
    },
    {
      "id": "range-input",
      "zh": "范围输入",
      "en": "Range input",
      "dz": "范围输入同时显示当前值和可调区间，精度可解释。",
      "de": "Show current value and adjustable range with clear precision.",
      "pz": "范围输入同时显示当前值和可调区间，精度可解释。 在键盘、移动端、失败提交和中英文切换下复核。",
      "pe": "Show current value and adjustable range with clear precision. Validate keyboard, mobile, failed submit, and locale switching.",
      "demo": "box",
      "cells": ["64"],
      "css": ".fx{width:190px;height:64px;border-radius:10px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #c5d0c8;color:#202824;font:700 16px/1 var(--fx-mono);position:relative;overflow:hidden}.fx::before{content:'';position:absolute;left:18px;right:18px;bottom:16px;height:3px;border-radius:2px;background:#dfe3db}.fx::after{content:'';position:absolute;left:18px;bottom:15px;width:46%;height:5px;border-radius:2px;background:#3f6f92;animation:ri 4s ease-in-out infinite}@keyframes ri{0%,100%{width:18%}50%{width:74%}}"
    },
    {
      "id": "file-input",
      "zh": "文件输入",
      "en": "File input",
      "dz": "文件输入显示类型、大小、数量和删除入口。",
      "de": "Show type, size, count, and removal.",
      "pz": "文件输入显示类型、大小、数量和删除入口。 在键盘、移动端、失败提交和中英文切换下复核。",
      "pe": "Show type, size, count, and removal. Validate keyboard, mobile, failed submit, and locale switching.",
      "demo": "box",
      "cells": ["选择文件"],
      "css": ".fx{width:184px;height:92px;border-radius:11px;border:1.5px dashed #9fb0a0;background:repeating-linear-gradient(135deg,#fbfcf9 0 9px,#f3f5f0 9px 18px);color:#5d6b57;font:600 11.5px/1 var(--fx-sans);position:relative;overflow:hidden;animation:fi2 3.8s ease-in-out infinite}@keyframes fi2{0%,100%{border-color:#9fb0a0}48%,74%{border-color:#3f6f92;background-color:#eef4f8}}"
    },
    {
      "id": "file-validation",
      "zh": "文件校验",
      "en": "File validation",
      "dz": "文件校验在选择后立即说明失败原因，不等待提交。",
      "de": "Explain file rejection immediately instead of at submit.",
      "pz": "文件校验在选择后立即说明失败原因，不等待提交。 在键盘、移动端、失败提交和中英文切换下复核。",
      "pe": "Explain file rejection immediately instead of at submit. Validate keyboard, mobile, failed submit, and locale switching.",
      "demo": "list",
      "n": 3,
      "cells": ["report.pdf  1.2MB  ✓","logo.ai  48MB  ✗","notes.txt  2KB  ✓"],
      "css": ".fxcol{gap:6px;width:196px}.fx{height:30px;border-radius:8px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #dfe3db;color:#202824;font:600 10px/1 var(--fx-mono);justify-content:flex-start;padding-left:11px}.fx:nth-child(2){background:linear-gradient(#fdf3f2,#f9e9e7);border-color:#e0a8a0;color:#a8412f}.fx{animation:fv2 4s ease-in-out infinite;animation-delay:calc(var(--i) * .16s)}@keyframes fv2{0%,100%{opacity:.65}46%,74%{opacity:1}}"
    },
    {
      "id": "upload-recovery",
      "zh": "上传恢复",
      "en": "Upload recovery",
      "dz": "网络中断后保留已上传部分并从断点恢复。",
      "de": "Resume from a checkpoint after interruption.",
      "pz": "网络中断后保留已上传部分并从断点恢复。 在键盘、移动端、失败提交和中英文切换下复核。",
      "pe": "Resume from a checkpoint after interruption. Validate keyboard, mobile, failed submit, and locale switching.",
      "demo": "box",
      "cells": ["续传 62%"],
      "css": ".fx{width:184px;height:66px;border-radius:10px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #c5d0c8;color:#202824;font:600 12px/1 var(--fx-sans);position:relative;overflow:hidden}.fx::after{content:'';position:absolute;left:16px;right:16px;bottom:14px;height:6px;border-radius:3px;background:linear-gradient(90deg,#3f6f92,#8fb6ce);transform-origin:left;animation:ur 4.2s ease-in-out infinite}@keyframes ur{0%,100%{transform:scaleX(.62)}46%{transform:scaleX(.62);background:linear-gradient(90deg,#e0a35c,#f0c89a)}70%,100%{transform:scaleX(1);background:linear-gradient(90deg,#3d7a52,#7fc4a0)}}"
    },
    {
      "id": "rich-text-input",
      "zh": "富文本输入",
      "en": "Rich text input",
      "dz": "富文本输入保留纯文本回退和明确的格式语义。",
      "de": "Provide plain-text fallback and explicit formatting semantics.",
      "pz": "富文本输入保留纯文本回退和明确的格式语义。 在键盘、移动端、失败提交和中英文切换下复核。",
      "pe": "Provide plain-text fallback and explicit formatting semantics. Validate keyboard, mobile, failed submit, and locale switching.",
      "demo": "box",
      "cells": ["粗体 斜体 链接"],
      "css": ".fx{width:192px;height:96px;border-radius:10px;background:linear-gradient(#fff,#f6f8f4);border:1px solid #c5d0c8;color:#202824;font:600 11px/1 var(--fx-sans);position:relative;overflow:hidden;align-items:flex-start;justify-content:flex-start;padding:14px}.fx::after{content:'';position:absolute;left:14px;right:14px;top:40px;height:34px;border-radius:5px;background:repeating-linear-gradient(180deg,#eef1ec 0 6px,transparent 6px 14px);animation:rti 4s ease-in-out infinite}@keyframes rti{0%,100%{opacity:.5}48%,74%{opacity:1}}"
    },
    {
      "id": "password-reveal",
      "zh": "密码显示",
      "en": "Password reveal",
      "dz": "显示密码按钮有状态和安全提示，不改变提交值。",
      "de": "Expose password visibility state without changing submitted value.",
      "pz": "显示密码按钮有状态和安全提示，不改变提交值。 在键盘、移动端、失败提交和中英文切换下复核。",
      "pe": "Expose password visibility state without changing submitted value. Validate keyboard, mobile, failed submit, and locale switching.",
      "demo": "field",
      "cells": [""],
      "css": ".fxfield .fx{width:184px;height:42px;border-radius:9px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #c5d0c8;position:relative;overflow:visible;padding-left:14px;justify-content:flex-start;color:#202824;font:600 15px/1 var(--fx-mono);letter-spacing:.18em}.fx::after{content:'••••••••';position:absolute;left:14px;top:50%;transform:translateY(-50%);animation:pr2 3.4s steps(1,end) infinite}@keyframes pr2{0%,49%{content:'••••••••';letter-spacing:.18em}50%,100%{content:'design26';letter-spacing:.02em}}"
    },
    {
      "id": "search-input",
      "zh": "搜索输入",
      "en": "Search input",
      "dz": "搜索输入区分清除、提交、建议和加载状态。",
      "de": "Separate clear, submit, suggestion, and loading states.",
      "pz": "搜索输入区分清除、提交、建议和加载状态。 在键盘、移动端、失败提交和中英文切换下复核。",
      "pe": "Separate clear, submit, suggestion, and loading states. Validate keyboard, mobile, failed submit, and locale switching.",
      "demo": "field",
      "cells": [""],
      "css": ".fxfield .fx{width:190px;height:42px;border-radius:999px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #c5d0c8;position:relative;overflow:hidden;padding-left:36px;justify-content:flex-start}.fx::before{content:'⌕';position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#8b8d84;font-size:15px}.fx::after{content:'design';position:absolute;left:36px;top:50%;transform:translateY(-50%);color:#202824;font:600 12px/1 var(--fx-sans);white-space:nowrap;animation:si 3.4s steps(6,end) infinite}@keyframes si{0%{content:''}16%{content:'d'}33%{content:'des'}50%{content:'desig'}66%{content:'design'}100%{content:'design'}}"
    },
    {
      "id": "date-picker-field",
      "zh": "日期字段",
      "en": "Date picker field",
      "dz": "日期字段支持键盘直接输入和日历选择，两者保持同一值。",
      "de": "Keep direct keyboard entry and picker selection in sync.",
      "pz": "日期字段支持键盘直接输入和日历选择，两者保持同一值。 在键盘、移动端、失败提交和中英文切换下复核。",
      "pe": "Keep direct keyboard entry and picker selection in sync. Validate keyboard, mobile, failed submit, and locale switching.",
      "demo": "field",
      "cells": [""],
      "css": ".fxfield .fx{width:180px;height:42px;border-radius:9px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #c5d0c8;position:relative;overflow:visible}.fx::after{content:'2026-09-10';position:absolute;left:12px;top:50%;transform:translateY(-50%);font:600 12px/1 var(--fx-mono);color:#202824}.fx::before{content:'';position:absolute;left:0;top:52px;width:180px;height:96px;border-radius:10px;background:linear-gradient(#fff,#f6f8f4);border:1px solid #c5d0c8;box-shadow:0 20px 32px -22px #2b3a4488;animation:dpf 3.8s ease-in-out infinite}@keyframes dpf{0%,100%{opacity:0;transform:translateY(-8px)}46%,76%{opacity:1;transform:none}}"
    },
    {
      "id": "error-focus",
      "zh": "错误焦点",
      "en": "Error focus",
      "dz": "提交失败后焦点到摘要或第一个错误，并可逐项导航。",
      "de": "Move focus to summary or first error with item navigation.",
      "pz": "提交失败后焦点到摘要或第一个错误，并可逐项导航。 在键盘、移动端、失败提交和中英文切换下复核。",
      "pe": "Move focus to summary or first error with item navigation. Validate keyboard, mobile, failed submit, and locale switching.",
      "demo": "field",
      "cells": [""],
      "css": ".fxfield .fx{width:180px;height:42px;border-radius:9px;background:linear-gradient(#fff6f6,#fdecec);border:1.5px solid #c0392b;position:relative;overflow:visible;animation:ef2 3.6s ease-in-out infinite}@keyframes ef2{0%,100%{box-shadow:none}30%,72%{box-shadow:0 0 0 4px #c0392b1f}}.fx::after{content:'请填写邮箱';position:absolute;left:0;bottom:-20px;font:600 10.5px/1 var(--fx-sans);color:#c0392b;white-space:nowrap}"
    },
    {
      "id": "server-validation",
      "zh": "服务端校验",
      "en": "Server validation",
      "dz": "服务端校验映射到字段且不覆盖用户刚修改的值。",
      "de": "Map server errors without overwriting newly edited values.",
      "pz": "服务端校验映射到字段且不覆盖用户刚修改的值。 在键盘、移动端、失败提交和中英文切换下复核。",
      "pe": "Map server errors without overwriting newly edited values. Validate keyboard, mobile, failed submit, and locale switching.",
      "demo": "box",
      "cells": ["校验中…"],
      "css": ".fx{width:176px;height:56px;border-radius:9px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #c5d0c8;color:#5d6b57;font:600 11.5px/1 var(--fx-sans);position:relative;overflow:visible;animation:srv 3.8s ease-in-out infinite}@keyframes srv{0%,100%{border-color:#c5d0c8;color:#8b8d84}30%{border-color:#e0a35c;color:#8a4a1e}76%,100%{border-color:#3d7a52;color:#2f6440}}.fx::after{content:'';position:absolute;right:14px;top:50%;width:12px;height:12px;margin-top:-6px;border-radius:50%;border:2px solid transparent;border-top-color:currentColor;animation:srvr 1.2s linear infinite}@keyframes srvr{to{transform:rotate(1turn)}}"
    },
    {
      "id": "autosave-field",
      "zh": "字段自动保存",
      "en": "Field autosave",
      "dz": "字段自动保存显示状态并避免每次按键都发送请求。",
      "de": "Show field save state without a request per keystroke.",
      "pz": "字段自动保存显示状态并避免每次按键都发送请求。 在键盘、移动端、失败提交和中英文切换下复核。",
      "pe": "Show field save state without a request per keystroke. Validate keyboard, mobile, failed submit, and locale switching.",
      "demo": "field",
      "cells": [""],
      "css": ".fxfield .fx{width:184px;height:42px;border-radius:9px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #c5d0c8;position:relative;overflow:visible}.fx::after{content:'已保存';position:absolute;right:0;bottom:-20px;font:600 10px/1 var(--fx-mono);color:#3d7a52;animation:asf 3.4s ease-in-out infinite}@keyframes asf{0%,100%{opacity:0}46%,76%{opacity:1}}"
    },
    {
      "id": "form-locale",
      "zh": "表单语言",
      "en": "Form locale",
      "dz": "标签、帮助、错误、日期和提交状态统一跟随语言。",
      "de": "Labels, help, errors, dates, and submit states follow locale.",
      "pz": "标签、帮助、错误、日期和提交状态统一跟随语言。 在键盘、移动端、失败提交和中英文切换下复核。",
      "pe": "Labels, help, errors, dates, and submit states follow locale. Validate keyboard, mobile, failed submit, and locale switching.",
      "demo": "box",
      "cells": ["群组 12 · 席 位 8"],
      "css": ".fx{width:192px;height:64px;border-radius:10px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #c5d0c8;color:#202824;font:600 12.5px/1 var(--fx-sans);animation:fl2 4s ease-in-out infinite}@keyframes fl2{0%,100%{letter-spacing:0;word-spacing:0}50%{letter-spacing:.1em;word-spacing:.3em}}"
    },
    {
      "id": "form-audit",
      "zh": "表单审查",
      "en": "Form audit",
      "dz": "发布前检查键盘、输入法、错误恢复、隐私和移动端。",
      "de": "Audit keyboard, IME, recovery, privacy, and mobile behavior.",
      "pz": "发布前检查键盘、输入法、错误恢复、隐私和移动端。 在键盘、移动端、失败提交和中英文切换下复核。",
      "pe": "Audit keyboard, IME, recovery, privacy, and mobile behavior. Validate keyboard, mobile, failed submit, and locale switching.",
      "demo": "list",
      "n": 4,
      "cells": ["每个输入有标签","错误就地提示","可键盘走完","提交有回执"],
      "css": ".fxcol{gap:6px;width:196px}.fx{height:28px;border-radius:7px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #dfe3db;color:#202824;font:500 10.5px/1 var(--fx-sans);justify-content:flex-start;padding:0 28px 0 11px;position:relative;animation:fa4 4s ease-in-out infinite;animation-delay:calc(var(--i) * .14s)}.fx::after{content:'✓';position:absolute;right:10px;color:#3d7a52;font-family:var(--fx-mono);opacity:0;animation:fa4c 4s ease-in-out infinite;animation-delay:calc(var(--i) * .14s)}@keyframes fa4{0%,100%{opacity:.55}42%,66%{opacity:1}}@keyframes fa4c{0%,100%{opacity:0}45%,72%{opacity:1}}"
    }
  ]
};

;
// Reviewed original-source references, 2026-09-27. Existing entries remain unchanged.
_atlasExpansion20260927_form.items.push(...[
  {
    "id": "input-adornment",
    "zh": "输入框前后缀附加项",
    "en": "Input adornment",
    "dz": "在输入内容旁放置单位、货币符号或操作入口，同时保持它与用户输入值的边界。",
    "de": "Place a unit, currency sign or action beside input content while keeping it distinct from the entered value.",
    "pz": "原站近景示例在输入框前端保留 kg 单位。附加项可放在前端或末端，也可承载按钮；它不替代字段标签。单位文本和输入字符应分开处理，不能因视觉相邻就一起写入数值。 预览为原站静态截图；交互范围见原站示例。",
    "pe": "The close-up example retains a leading kg unit. Adornments may be leading, trailing or actionable, and do not replace the field label. A displayed unit should remain distinct from the user's numeric text. Preview: a static screenshot of the original example; follow the source link for interaction.",
    "kz": [
      "输入后缀",
      "单位前缀",
      "字段附加项"
    ],
    "kw": [
      "input adornment",
      "prefix",
      "suffix"
    ],
    "demo": "surface",
    "n": 1,
    "cells": [
      ""
    ],
    "css": ".fxwrap{animation:none!important}.fxsurface{width:min(760px,94%);height:min(420px,52vh);border:0;border-radius:0;background:transparent;box-shadow:none;overflow:visible}.fx{position:absolute;inset:0;border:0;border-radius:0;box-shadow:none;background:transparent url('/effects-atlas/assets/expansion-20260927/input-adornment.png') center/contain no-repeat;animation:none!important;transition:none!important}.fx>b,.fx>i,.fx>u{display:none!important}",
    "refs": [
      {
        "n": "React Text Field component - Material UI",
        "u": "mui.com/material-ui/react-text-field/#input-adornments"
      }
    ],
    "previewKind": "image",
    "previewUrl": "/effects-atlas/assets/expansion-20260927/input-adornment.png",
    "previewOrigin": "source",
    "sourceUrl": "https://mui.com/material-ui/react-text-field/#input-adornments",
    "checkedAt": "2026-09-27T01:38:15.956Z",
    "sourceEvidence": {
      "sourceId": "mui-text-field",
      "previewSha256": "d95b8e207ad1acfc1052d93ca69d89b0cd86d8357597662a50d83009d536902a",
      "method": "original-site-browser-screenshot"
    },
    "offers": [],
    "author": "atlas-expansion-curator"
  },
  {
    "id": "free-solo-autocomplete",
    "zh": "允许自由值的自动补全",
    "en": "Free-value autocomplete",
    "dz": "既显示建议选项，也允许提交建议列表中没有的文字值。",
    "de": "Offer suggestions while allowing text values that are absent from the option list.",
    "pz": "原站 freeSolo 示例允许保留自定义文字；本次输入并确认了 Azure coast。自由输入得到的是字符串，即使已有选项以对象保存，也要明确处理两种值形状。它与只能选中既有项的组合框不同。 预览为原站静态截图；交互范围见原站示例。",
    "pe": "The freeSolo demo retained the entered value Azure coast. Typed values are strings even when existing options are objects, so value handling must account for both. This differs from a combo box limited to existing options. Preview: a static screenshot of the original example; follow the source link for interaction.",
    "kz": [
      "自由输入",
      "建议列表",
      "自定义值"
    ],
    "kw": [
      "free solo",
      "arbitrary value",
      "autocomplete"
    ],
    "demo": "surface",
    "n": 1,
    "cells": [
      ""
    ],
    "css": ".fxwrap{animation:none!important}.fxsurface{width:min(760px,94%);height:min(420px,52vh);border:0;border-radius:0;background:transparent;box-shadow:none;overflow:visible}.fx{position:absolute;inset:0;border:0;border-radius:0;box-shadow:none;background:transparent url('/effects-atlas/assets/expansion-20260927/free-solo-autocomplete.png') center/contain no-repeat;animation:none!important;transition:none!important}.fx>b,.fx>i,.fx>u{display:none!important}",
    "refs": [
      {
        "n": "React Autocomplete component - Material UI",
        "u": "mui.com/material-ui/react-autocomplete/#free-solo"
      }
    ],
    "previewKind": "image",
    "previewUrl": "/effects-atlas/assets/expansion-20260927/free-solo-autocomplete.png",
    "previewOrigin": "source",
    "sourceUrl": "https://mui.com/material-ui/react-autocomplete/#free-solo",
    "checkedAt": "2026-09-27T01:37:50.782Z",
    "sourceEvidence": {
      "sourceId": "mui-autocomplete",
      "previewSha256": "cf1855db1fcd70bdf1d86613063a652dff5e9ceee0c46b2a536b0288e5bbde99",
      "method": "original-site-browser-screenshot"
    },
    "offers": [],
    "author": "atlas-expansion-curator"
  },
  {
    "id": "creatable-autocomplete",
    "zh": "可创建选项的自动补全",
    "en": "Creatable autocomplete",
    "dz": "当搜索文字不在选项中时，提供明确的新增入口，把自由文字转成可选择对象。",
    "de": "Expose an explicit add option when the search text is absent from the option collection.",
    "pz": "原站示例在候选菜单里显示 Add 加输入文字，也提供通过对话框补充新项的变体。本次只输入了新名称并查看新增候选，未执行持久化操作。新增动作与直接把任意字符串当作值需要区别表达。 预览为原站静态截图；交互范围见原站示例。",
    "pe": "The demo exposes an Add option containing the typed text, with a dialog-based alternative also documented. Here only the new candidate was inspected. Explicit creation differs from simply accepting an arbitrary string as the value. Preview: a static screenshot of the original example; follow the source link for interaction.",
    "kz": [
      "创建选项",
      "自动补全新增",
      "可创建组合框"
    ],
    "kw": [
      "creatable autocomplete",
      "add option"
    ],
    "demo": "surface",
    "n": 1,
    "cells": [
      ""
    ],
    "css": ".fxwrap{animation:none!important}.fxsurface{width:min(760px,94%);height:min(420px,52vh);border:0;border-radius:0;background:transparent;box-shadow:none;overflow:visible}.fx{position:absolute;inset:0;border:0;border-radius:0;box-shadow:none;background:transparent url('/effects-atlas/assets/expansion-20260927/creatable-autocomplete.png') center/contain no-repeat;animation:none!important;transition:none!important}.fx>b,.fx>i,.fx>u{display:none!important}",
    "refs": [
      {
        "n": "React Autocomplete component - Material UI",
        "u": "mui.com/material-ui/react-autocomplete/#creatable"
      }
    ],
    "previewKind": "image",
    "previewUrl": "/effects-atlas/assets/expansion-20260927/creatable-autocomplete.png",
    "previewOrigin": "source",
    "sourceUrl": "https://mui.com/material-ui/react-autocomplete/#creatable",
    "checkedAt": "2026-09-27T01:37:50.782Z",
    "sourceEvidence": {
      "sourceId": "mui-autocomplete",
      "previewSha256": "2474fc11d95788c1d837f0de99898d5410031b86fcc7953fd9c3b4ca7026b7c2",
      "method": "original-site-browser-screenshot"
    },
    "offers": [],
    "author": "atlas-expansion-curator"
  },
  {
    "id": "grouped-autocomplete",
    "zh": "分组候选自动补全",
    "en": "Grouped autocomplete options",
    "dz": "在自动补全菜单中用组标题分隔候选项，帮助用户识别选项所属范围。",
    "de": "Separate autocomplete options with group headings that identify each option's category.",
    "pz": "原站示例按电影标题的首字母组织候选，菜单内保留独立组标题。分组字段和排序维度需一致，否则同一组标题可能重复出现。这里的组标题不是可选结果，也不是页面级导航分类。 预览为原站静态截图；交互范围见原站示例。",
    "pe": "The example groups film options by their first letter and keeps headings inside the popup. Sorting must agree with grouping to avoid repeated headings. A group heading is neither a selectable result nor a page navigation category. Preview: a static screenshot of the original example; follow the source link for interaction.",
    "kz": [
      "分组候选",
      "组合框分组",
      "字母分组"
    ],
    "kw": [
      "grouped options",
      "autocomplete groups"
    ],
    "demo": "surface",
    "n": 1,
    "cells": [
      ""
    ],
    "css": ".fxwrap{animation:none!important}.fxsurface{width:min(760px,94%);height:min(420px,52vh);border:0;border-radius:0;background:transparent;box-shadow:none;overflow:visible}.fx{position:absolute;inset:0;border:0;border-radius:0;box-shadow:none;background:transparent url('/effects-atlas/assets/expansion-20260927/grouped-autocomplete.png') center/contain no-repeat;animation:none!important;transition:none!important}.fx>b,.fx>i,.fx>u{display:none!important}",
    "refs": [
      {
        "n": "React Autocomplete component - Material UI",
        "u": "mui.com/material-ui/react-autocomplete/#grouped"
      }
    ],
    "previewKind": "image",
    "previewUrl": "/effects-atlas/assets/expansion-20260927/grouped-autocomplete.png",
    "previewOrigin": "source",
    "sourceUrl": "https://mui.com/material-ui/react-autocomplete/#grouped",
    "checkedAt": "2026-09-27T01:37:50.782Z",
    "sourceEvidence": {
      "sourceId": "mui-autocomplete",
      "previewSha256": "32ac2cd6822844bab87158782ffbc9b97e071ab923f3cc9a19d43423bb9dd682",
      "method": "original-site-browser-screenshot"
    },
    "offers": [],
    "author": "atlas-expansion-curator"
  },
  {
    "id": "fixed-selected-tags",
    "zh": "不可移除的已选标签",
    "en": "Fixed selected tags",
    "dz": "在多值输入中保留必须存在的选中项，同时允许用户编辑其他选中项。",
    "de": "Retain required selections in a multi-value field while letting users edit the other selected items.",
    "pz": "原站示例同时显示固定项和普通已选标签，固定项通过禁用的 chip 保留。它锁定的是指定成员，不等于整个输入框只读；需要让用户看懂哪些项不能删除。 预览为原站静态截图；交互范围见原站示例。",
    "pe": "The example shows fixed and ordinary selected chips together, disabling the fixed chip. This locks specific members rather than making the entire field read-only. The distinction must remain understandable to users. Preview: a static screenshot of the original example; follow the source link for interaction.",
    "kz": [
      "固定标签",
      "不可移除",
      "多值选择"
    ],
    "kw": [
      "fixed tags",
      "locked option",
      "multi-value"
    ],
    "demo": "surface",
    "n": 1,
    "cells": [
      ""
    ],
    "css": ".fxwrap{animation:none!important}.fxsurface{width:min(760px,94%);height:min(420px,52vh);border:0;border-radius:0;background:transparent;box-shadow:none;overflow:visible}.fx{position:absolute;inset:0;border:0;border-radius:0;box-shadow:none;background:transparent url('/effects-atlas/assets/expansion-20260927/fixed-selected-tags.png') center/contain no-repeat;animation:none!important;transition:none!important}.fx>b,.fx>i,.fx>u{display:none!important}",
    "refs": [
      {
        "n": "React Autocomplete component - Material UI",
        "u": "mui.com/material-ui/react-autocomplete/#fixed-options"
      }
    ],
    "previewKind": "image",
    "previewUrl": "/effects-atlas/assets/expansion-20260927/fixed-selected-tags.png",
    "previewOrigin": "source",
    "sourceUrl": "https://mui.com/material-ui/react-autocomplete/#fixed-options",
    "checkedAt": "2026-09-27T01:37:50.782Z",
    "sourceEvidence": {
      "sourceId": "mui-autocomplete",
      "previewSha256": "af292c85f2f55cdd3bc7d5466c70f96019a6f69e7d35737f0e44235e8bc56b2b",
      "method": "original-site-browser-screenshot"
    },
    "offers": [],
    "author": "atlas-expansion-curator"
  },
  {
    "id": "collapsed-selected-tags",
    "zh": "已选标签数量折叠",
    "en": "Collapsed selected tags",
    "dz": "多值输入失焦后只显示部分已选标签，并用数量提示其余已选内容。",
    "de": "Show only some selected tags while the multi-value field is unfocused, with a count for the remainder.",
    "pz": "原站 limitTags 示例显示前两项和 +1，缩短未编辑时的字段长度。被折叠的项仍在已选集合中；这是显示限制，不是选择上限，也不是结果被删除。 预览为原站静态截图；交互范围见原站示例。",
    "pe": "The limitTags example shows two items and +1 to reduce the field's unfocused footprint. Hidden tags remain selected. This is a presentation limit, not a selection cap or removal of values. Preview: a static screenshot of the original example; follow the source link for interaction.",
    "kz": [
      "标签折叠",
      "已选数量",
      "多值输入"
    ],
    "kw": [
      "limit tags",
      "overflow count",
      "selected tags"
    ],
    "demo": "surface",
    "n": 1,
    "cells": [
      ""
    ],
    "css": ".fxwrap{animation:none!important}.fxsurface{width:min(760px,94%);height:min(420px,52vh);border:0;border-radius:0;background:transparent;box-shadow:none;overflow:visible}.fx{position:absolute;inset:0;border:0;border-radius:0;box-shadow:none;background:transparent url('/effects-atlas/assets/expansion-20260927/collapsed-selected-tags.png') center/contain no-repeat;animation:none!important;transition:none!important}.fx>b,.fx>i,.fx>u{display:none!important}",
    "refs": [
      {
        "n": "React Autocomplete component - Material UI",
        "u": "mui.com/material-ui/react-autocomplete/#limit-tags"
      }
    ],
    "previewKind": "image",
    "previewUrl": "/effects-atlas/assets/expansion-20260927/collapsed-selected-tags.png",
    "previewOrigin": "source",
    "sourceUrl": "https://mui.com/material-ui/react-autocomplete/#limit-tags",
    "checkedAt": "2026-09-27T01:37:50.782Z",
    "sourceEvidence": {
      "sourceId": "mui-autocomplete",
      "previewSha256": "723f3f631b2d41ce09a194e695415ee259f7dcb37b3e494c57d3186cd52ee9e9",
      "method": "original-site-browser-screenshot"
    },
    "offers": [],
    "author": "atlas-expansion-curator"
  },
  {
    "id": "slider-number-input",
    "zh": "滑块与数值框联动",
    "en": "Slider with numeric input",
    "dz": "让拖动滑块和直接输入数字共享同一数值，兼顾粗调与精确输入。",
    "de": "Bind a slider and a number field to one value for coarse adjustment and exact entry.",
    "pz": "原站 Volume 示例把滑块、音量图标和数字输入放在同一行。两个控件需要同步状态与有效范围，输入结束时还需处理超界值；并排摆放而没有共享值，不能称作联动。 预览为原站静态截图；交互范围见原站示例。",
    "pe": "The Volume example places a slider, icon and numeric field in one row. They must share state and valid bounds, including handling out-of-range input on completion. Mere side-by-side placement does not establish synchronization. Preview: a static screenshot of the original example; follow the source link for interaction.",
    "kz": [
      "滑块联动",
      "精确数值",
      "粗调精调"
    ],
    "kw": [
      "slider input",
      "synchronized value",
      "exact entry"
    ],
    "demo": "surface",
    "n": 1,
    "cells": [
      ""
    ],
    "css": ".fxwrap{animation:none!important}.fxsurface{width:min(760px,94%);height:min(420px,52vh);border:0;border-radius:0;background:transparent;box-shadow:none;overflow:visible}.fx{position:absolute;inset:0;border:0;border-radius:0;box-shadow:none;background:transparent url('/effects-atlas/assets/expansion-20260927/slider-number-input.png') center/contain no-repeat;animation:none!important;transition:none!important}.fx>b,.fx>i,.fx>u{display:none!important}",
    "refs": [
      {
        "n": "React Slider component - Material UI",
        "u": "mui.com/material-ui/react-slider/#slider-with-input-field"
      }
    ],
    "previewKind": "image",
    "previewUrl": "/effects-atlas/assets/expansion-20260927/slider-number-input.png",
    "previewOrigin": "source",
    "sourceUrl": "https://mui.com/material-ui/react-slider/#slider-with-input-field",
    "checkedAt": "2026-09-27T01:38:09.057Z",
    "sourceEvidence": {
      "sourceId": "mui-slider",
      "previewSha256": "d8729a152b06d5574aa456938eb75f2831d0719b499d575812042cf7bab1bdab",
      "method": "original-site-browser-screenshot"
    },
    "offers": [],
    "author": "atlas-expansion-curator"
  }
]);
const _atlasExpansion_f1dd93589e91ef8f_form = _atlasExpansion20260927_form;

;
// Reviewed original-source references, 2026-09-27. Existing entries remain unchanged.
_atlasExpansion_f1dd93589e91ef8f_form.items.push(...[
  {
    "id": "cascading-select",
    "zh": "级联选择器",
    "en": "Cascader",
    "dz": "沿父子关系逐级展开相邻选项列，把完整层级路径作为一个字段值。",
    "de": "Expand linked option columns level by level and return the complete hierarchical path as one field value.",
    "pz": "原例按 Zhejiang、Hangzhou、West Lake 展开三列；本次完成叶子选择并核对回填路径。适合省市区等逐级缩小范围的选择，需明确是否允许停在父级。 预览为原站静态截图；交互示例见来源链接。",
    "pe": "The source expands Zhejiang, Hangzhou and West Lake across three columns. Selecting the leaf was verified to fill the complete path. Define whether choosing a parent level is allowed when using this pattern. Preview: a static screenshot of the original example; use the source link for interaction.",
    "kz": [
      "层级选择",
      "省市区",
      "路径值"
    ],
    "kw": [
      "Hierarchical selection",
      "Region picker",
      "Path value"
    ],
    "demo": "surface",
    "n": 1,
    "cells": [
      ""
    ],
    "css": ".fxwrap{animation:none!important}.fxsurface{width:min(760px,94%);height:min(420px,52vh);border:0;border-radius:0;background:transparent;box-shadow:none;overflow:visible}.fx{position:absolute;inset:0;border:0;border-radius:0;box-shadow:none;background:transparent url('/effects-atlas/assets/expansion-20260927-second/cascading-select.png') center/contain no-repeat;animation:none!important;transition:none!important}.fx>b,.fx>i,.fx>u{display:none!important}",
    "refs": [
      {
        "n": "Cascader · Ant Design",
        "u": "ant.design/components/cascader-cn#cascader-demo-basic"
      }
    ],
    "previewKind": "image",
    "previewOrigin": "source",
    "previewUrl": "/effects-atlas/assets/expansion-20260927-second/cascading-select.png",
    "sourceUrl": "https://ant.design/components/cascader-cn#cascader-demo-basic",
    "checkedAt": "2026-09-27T04:00:16.070Z",
    "sourceEvidence": {
      "sourceId": "antd-cascader",
      "previewSha256": "565809e6326e54ace2e758e609f079158e373c1e6c13293bd44cccacf538905f",
      "method": "original-site-browser-screenshot"
    },
    "offers": [],
    "author": "atlas-second-source-curator"
  },
  {
    "id": "tree-select",
    "zh": "树选择器",
    "en": "Tree select",
    "dz": "在选择字段的弹层内展开缩进树，从层级集合中选取节点值。",
    "de": "Open an indented tree inside a selection field’s popup and choose a value from hierarchical nodes.",
    "pz": "原站基础例子的弹层同时展示 parent 与 leaf 层级；本次核实了打开弹层和树结构。选中节点后作为表单值使用，需要区分分支展开与节点选择。 预览为原站静态截图；交互示例见来源链接。",
    "pe": "The original basic popup exposes parent and leaf levels. Opening it and its tree structure were checked. Keep branch expansion distinct from choosing the node that becomes the form value. Preview: a static screenshot of the original example; use the source link for interaction.",
    "kz": [
      "树形数据",
      "选择字段",
      "分支与叶子"
    ],
    "kw": [
      "Tree data",
      "Selection field",
      "Branches and leaves"
    ],
    "demo": "surface",
    "n": 1,
    "cells": [
      ""
    ],
    "css": ".fxwrap{animation:none!important}.fxsurface{width:min(760px,94%);height:min(420px,52vh);border:0;border-radius:0;background:transparent;box-shadow:none;overflow:visible}.fx{position:absolute;inset:0;border:0;border-radius:0;box-shadow:none;background:transparent url('/effects-atlas/assets/expansion-20260927-second/tree-select.png') center/contain no-repeat;animation:none!important;transition:none!important}.fx>b,.fx>i,.fx>u{display:none!important}",
    "refs": [
      {
        "n": "TreeSelect · Ant Design",
        "u": "ant.design/components/tree-select-cn#tree-select-demo-basic"
      }
    ],
    "previewKind": "image",
    "previewOrigin": "source",
    "previewUrl": "/effects-atlas/assets/expansion-20260927-second/tree-select.png",
    "sourceUrl": "https://ant.design/components/tree-select-cn#tree-select-demo-basic",
    "checkedAt": "2026-09-27T04:00:29.372Z",
    "sourceEvidence": {
      "sourceId": "antd-tree-select",
      "previewSha256": "84ec2c4ab5d85bb8ff45dcb210306eef5886fec1207c26dd573845da6bee1787",
      "method": "original-site-browser-screenshot"
    },
    "offers": [],
    "author": "atlas-second-source-curator"
  },
  {
    "id": "grid-popup-combobox",
    "zh": "网格弹出组合框",
    "en": "Combobox with a grid popup",
    "dz": "把候选项及其上下文放进多列网格，让输入与单元格导航协同工作。",
    "de": "Present suggestions and their context in a multi-column grid while coordinating text input with cell navigation.",
    "pz": "原例的两列分别显示名称和类型。本次输入 c、按方向键移动活动单元格，并验证 DOM 焦点仍在输入框、Escape 关闭弹层。APG 教学示例的读屏器兼容性需另行验证。 预览为原站静态截图；交互示例见来源链接。",
    "pe": "The two columns show a name and its type. Typing c, moving the active cell with arrow keys, retaining DOM focus in the input and dismissing with Escape were checked. Screen-reader compatibility of this APG teaching example was not tested. Preview: a static screenshot of the original example; use the source link for interaction.",
    "kz": [
      "多列候选",
      "键盘导航",
      "活动单元格"
    ],
    "kw": [
      "Multi-column suggestions",
      "Keyboard navigation",
      "Active cell"
    ],
    "demo": "surface",
    "n": 1,
    "cells": [
      ""
    ],
    "css": ".fxwrap{animation:none!important}.fxsurface{width:min(760px,94%);height:min(420px,52vh);border:0;border-radius:0;background:transparent;box-shadow:none;overflow:visible}.fx{position:absolute;inset:0;border:0;border-radius:0;box-shadow:none;background:transparent url('/effects-atlas/assets/expansion-20260927-second/grid-popup-combobox.png') center/contain no-repeat;animation:none!important;transition:none!important}.fx>b,.fx>i,.fx>u{display:none!important}",
    "refs": [
      {
        "n": "Editable Combobox with Grid Popup · W3C APG",
        "u": "www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/grid-combo/#ex1"
      }
    ],
    "previewKind": "image",
    "previewOrigin": "source",
    "previewUrl": "/effects-atlas/assets/expansion-20260927-second/grid-popup-combobox.png",
    "sourceUrl": "https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/grid-combo/#ex1",
    "checkedAt": "2026-09-27T04:05:39.970Z",
    "sourceEvidence": {
      "sourceId": "apg-grid-combobox",
      "previewSha256": "0d7747a2677fb87308caf16fd4e313913a141f098656d9d2c2d6551830d59241",
      "method": "original-site-browser-screenshot"
    },
    "offers": [],
    "author": "atlas-second-source-curator"
  },
  {
    "id": "task-list-workflow",
    "zh": "任务清单式流程",
    "en": "Task-list workflow",
    "dz": "把长流程分为带状态的任务入口，让用户规划完成顺序并返回总览。",
    "de": "Break a long service into task links with statuses so users can plan their order and return to an overview.",
    "pz": "GOV.UK 把它用于可自定任务顺序、可能跨多次访问完成的服务；固定顺序的流程不宜直接套用。原例按组展示完成状态，但链接为占位，本次未验证保存与恢复。 预览为原站静态截图；交互示例见来源链接。",
    "pe": "GOV.UK uses this for services where users choose task order and may return across sessions, not strictly ordered flows. The example groups completion statuses, but its links are placeholders; saving and resuming were not tested. Preview: a static screenshot of the original example; use the source link for interaction.",
    "kz": [
      "多任务流程",
      "任务状态",
      "非线性顺序"
    ],
    "kw": [
      "Multiple tasks",
      "Task statuses",
      "Nonlinear order"
    ],
    "demo": "surface",
    "n": 1,
    "cells": [
      ""
    ],
    "css": ".fxwrap{animation:none!important}.fxsurface{width:min(760px,94%);height:min(420px,52vh);border:0;border-radius:0;background:transparent;box-shadow:none;overflow:visible}.fx{position:absolute;inset:0;border:0;border-radius:0;box-shadow:none;background:transparent url('/effects-atlas/assets/expansion-20260927-second/task-list-workflow.png') center/contain no-repeat;animation:none!important;transition:none!important}.fx>b,.fx>i,.fx>u{display:none!important}",
    "refs": [
      {
        "n": "Complete multiple tasks example · GOV.UK",
        "u": "design-system.service.gov.uk/patterns/complete-multiple-tasks/default/index.html"
      }
    ],
    "previewKind": "image",
    "previewOrigin": "source",
    "previewUrl": "/effects-atlas/assets/expansion-20260927-second/task-list-workflow.png",
    "sourceUrl": "https://design-system.service.gov.uk/patterns/complete-multiple-tasks/default/index.html",
    "checkedAt": "2026-09-27T03:06:06.529Z",
    "sourceEvidence": {
      "sourceId": "govuk-task-list-live",
      "previewSha256": "0e3b2855222eb67bb155fff3baa4d2520def6d3d680305477d1114ecc67913ac",
      "method": "original-site-browser-screenshot"
    },
    "offers": [],
    "author": "atlas-second-source-curator"
  }
]);
export default _atlasExpansion_f1dd93589e91ef8f_form;
