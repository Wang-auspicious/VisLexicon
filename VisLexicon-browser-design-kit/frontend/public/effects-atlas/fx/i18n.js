// 国际化：RTL 镜像、CJK 排版、文本膨胀——这一类问题上线前几乎没人测
const E = 'cubic-bezier(.22,1,.36,1)';
const I = (id, zh, en, dz, de, pz, pe, demo, css) => ({ id, zh, en, dz, de, pz, pe, demo, css });

export default {
  id: 'i18n', zh: '国际化与多语言', en: 'Internationalisation',
  dz: 'RTL 镜像、CJK 断行标点、文本膨胀、历法与排序——这类问题上线前几乎没人测',
  de: 'RTL mirroring, CJK line breaking, text expansion, calendars and collation — the class of bugs nobody tests before launch',
  items: [
    I('rtlmirror', 'RTL 镜像', 'RTL mirroring', '整个界面照镜子', 'The whole interface reflects',
      'dir="rtl" 翻转布局、对齐、缩进、进度方向；返回箭头要翻，播放键和时钟不翻。',
      'dir="rtl" flips layout, alignment, indent and progress direction. Back arrows flip; play buttons and clocks do not.',
      'list', `.fxcol{direction:rtl;width:min(400px,88%)}.fx{flex-direction:row}.fx::after{content:'\u0627\u0644\u0645\u0634\u0631\u0648\u0639';font-size:13px;color:#65675f;margin-inline-start:auto}`),

    I('logicalprops', '逻辑属性', 'Logical properties', 'margin-left 换成 margin-inline-start', 'Swap left/right for inline-start/end',
      'padding-inline / margin-block / inset-inline / text-align:start；一次改写就同时支持 LTR 与 RTL。',
      'padding-inline, margin-block, inset-inline, text-align:start — one rewrite covers both directions.',
      'card', `.fx{padding-inline:16px;padding-block:14px;border-inline-start:3px solid #4d8ba6}.fx>u{margin-inline-end:auto}.fx>b{margin-block-end:12px}`),

    I('bidiisolate', '双向隔离', 'Bidi isolation', '阿拉伯语里插英文会乱序', 'Latin inside Arabic scrambles',
      '用 <bdi> 或 unicode-bidi:isolate 包住用户名、文件名等不可控片段；纯靠 dir 不够。',
      'Wrap usernames, filenames and any untrusted run in bdi or unicode-bidi:isolate. dir alone will not save you.',
      'chat', `.fxchat{direction:rtl}.fx{font-size:13px}.fx:nth-child(1)::after{content:' \u2014 \u0645\u0631\u062d\u0628\u0627 api_v2.json'}.fx:nth-child(2)::after{content:' \u2014 <bdi> \u0645\u0631\u062d\u0628\u0627'}.fx:nth-child(3){display:none}`),

    I('rtlicon', '图标翻不翻', 'Which icons flip', '有方向语义的翻，有物理形态的不翻', 'Directional icons flip; physical objects do not',
      '前进/后退/缩进/引号/进度要翻；播放、时钟、放大镜、勾选、logo 不翻；括号与斜杠按语义判断。',
      'Flip next/back, indent, quotes and progress. Never flip play, clocks, magnifiers, checkmarks or logos.',
      'pill', `.fxpill{max-width:320px;gap:8px}.fx{font-size:14px;padding:8px 13px}.fx:nth-child(1)::after{content:'\u2192 \u7ffb'}.fx:nth-child(2)::after{content:'\u25b6 \u4e0d\u7ffb'}.fx:nth-child(3)::after{content:'\u2713 \u4e0d\u7ffb'}.fx:nth-child(4)::after{content:'\u21b7 \u7ffb'}.fx:nth-child(5){display:none}`),

    I('cjkbreak', 'CJK 断行', 'CJK line breaking', '中文可以任意断，但不能断在标点前', 'Han breaks anywhere — except before punctuation',
      'line-break:strict + word-break:normal；中英混排时给 overflow-wrap:anywhere 防长网址顶破。',
      'line-break:strict with word-break:normal. Add overflow-wrap:anywhere for long URLs in mixed text.',
      'text', `.fx{white-space:normal;max-width:16ch;font-size:clamp(19px,3vw,28px);line-height:1.7;line-break:strict;text-wrap:pretty}`),

    I('cjkpunct', '标点挤压', 'Punctuation compression', '两个句号之间的空要收掉', 'Squeeze the gap between stacked marks',
      'text-spacing-trim:space-first 收行首标点，font-feature-settings 用全角/半角变体；专业中文排版的分水岭。',
      'text-spacing-trim:space-first trims leading marks, and font features pick full- or half-width variants. This is where Chinese typesetting gets serious.',
      'text', `.fx{white-space:normal;max-width:18ch;font-size:clamp(17px,2.6vw,24px);line-height:1.8;text-spacing-trim:space-first}`),

    I('cjknoitalic', '中文不用斜体', 'No CJK italics', '汉字倾斜就是变形', 'Slanted Han is just distortion',
      '强调改用字重、字号、颜色、着重号（text-emphasis）或方头括号；浏览器的假斜体会毁掉字形。',
      'Emphasise with weight, size, colour, text-emphasis dots or bracket marks. Synthetic obliquing wrecks the glyphs.',
      'text', `.fx{white-space:normal;max-width:14ch;font-size:clamp(20px,3vw,30px);line-height:1.7;text-emphasis:filled dot #e8879c;text-emphasis-position:under}`),

    I('cjkfauxbold', '假粗体', 'Faux bold', '没有粗体字重就会被"描一圈"', 'Without a bold cut the browser strokes it',
      '中文字体家族常只有 Regular/Medium；缺字重时浏览器合成加粗会糊。要么装真字重，要么只用 400/500。',
      'CJK families often ship only Regular and Medium. Synthetic bold blurs — install the real weight or stay at 400/500.',
      'list', `.fxcol{width:min(380px,88%);gap:6px}.fx{height:auto;padding:8px 14px;border:0;background:transparent}.fx>i,.fx>u{display:none}.fx:nth-child(1)::after{content:'\u771f\u5b57\u91cd 500 \u00b7 \u6e05\u695a';font-weight:500;font-size:17px;color:#23232f}.fx:nth-child(2)::after{content:'\u5408\u6210 900 \u00b7 \u53d1\u7cca';font-weight:900;font-size:17px;color:#c04a63}.fx:nth-child(n+3){display:none}`),

    I('verticalwriting', '竖排', 'Vertical writing', '日文书籍与中文题词会竖着走', 'Japanese books and Chinese inscriptions run vertically',
      'writing-mode:vertical-rl + text-orientation:upright；数字与拉丁要用 text-combine-upright 做"纵中横"。',
      'writing-mode:vertical-rl with text-orientation:upright, and text-combine-upright for numerals and Latin runs.',
      'text', `.fx{writing-mode:vertical-rl;text-orientation:upright;white-space:normal;height:200px;font-size:22px;line-height:1.9;letter-spacing:.06em}`),

    I('rubytext', '注音与旁注', 'Ruby annotation', '汉字上面那一行小字', 'The small line above the characters',
      '<ruby> + <rt>，ruby-position 控制上下；行高要预留注音空间，否则会压到上一行。',
      'ruby with rt, positioned by ruby-position. Reserve line height or the annotation collides with the line above.',
      'text', `.fx{font-size:clamp(22px,3.4vw,34px);line-height:2.2;padding-top:12px}.fx::after{content:'\u306f\u306a';display:block;font-size:.4em;color:#8b8d84;letter-spacing:.4em;margin-top:-1.1em}`),

    I('textexpand', '文本膨胀', 'Text expansion', '德语能把按钮撑破', 'German bursts your button',
      '德/俄/芬兰比英文长 30–40%，日韩更短；按钮与标签要能换行或截断，绝不写死宽度。',
      'German, Russian and Finnish run 30–40% longer than English; CJK runs shorter. Let buttons wrap or truncate — never fix their width.',
      'pill', `.fxpill{max-width:330px;gap:8px}.fx{font-size:12px;white-space:normal;text-align:center}.fx:nth-child(1)::after{content:'Save'}.fx:nth-child(2)::after{content:'\u4fdd\u5b58'}.fx:nth-child(3)::after{content:'Speichern'}.fx:nth-child(4)::after{content:'\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c'}.fx:nth-child(5)::after{content:'Tallenna muutokset'}`),

    I('nostringconcat', '别拼字符串', 'Never concatenate', '"你有" + n + "条消息"在别的语言里语序不同', 'Word order differs elsewhere',
      '整句作为一个可翻译单元，变量用占位符；语序、量词、介词位置都由译文自己决定。',
      'Make the whole sentence one translatable unit with placeholders. Word order, measure words and prepositions belong to the translation.',
      'chat', `.fx{font:400 12.5px/1.6 var(--fx-mono,monospace)}.fx:nth-child(1)::after{content:' \u2717 "\u4f60\u6709" + n + "\u6761"'}.fx:nth-child(2)::after{content:' \u2713 t("inbox.count", {n})'}.fx:nth-child(3){display:none}`),

    I('pluralrules', '复数规则', 'Plural rules', '不是"1 个"和"n 个"两种', 'It is not just one and many',
      '阿拉伯语 6 类、俄语 4 类、中文 1 类；用 Intl.PluralRules 与 ICU MessageFormat，别写 n>1 的三目。',
      'Arabic has six categories, Russian four, Chinese one. Use Intl.PluralRules and ICU MessageFormat, never n>1 ternaries.',
      'num', `.fx{font-size:clamp(30px,5.4vw,54px);color:#3f6f92}.fxnum::after{content:'zero \u00b7 one \u00b7 two \u00b7 few \u00b7 many \u00b7 other';font:600 11px var(--fx-mono,monospace);color:#9b9d92}`),

    I('gendercase', '语法性别与格', 'Gender & case', '同一个词在句中要变形', 'The same word inflects in place',
      '斯拉夫语系有格变化，罗曼语系有性；UI 里避免把人名塞进有格变化的句式，或让译者提供多个变体。',
      'Slavic languages inflect for case, Romance for gender. Avoid slotting names into inflected sentences, or let translators supply variants.',
      'list', `.fxcol{width:min(380px,88%);gap:6px}.fx{height:auto;padding:8px 14px;border:0;background:transparent;font:400 13px var(--fx-mono,monospace)}.fx>i,.fx>u{display:none}.fx:nth-child(1)::after{content:'\u0410\u043d\u043d\u0430 \u2192 \u0410\u043d\u043d\u0435 (dative)';color:#3f6f92}.fx:nth-child(2)::after{content:'le dossier / la facture';color:#4d8ba6}.fx:nth-child(n+3){display:none}`),

    I('datetimeformat', '日期时间格式', 'Date & time format', '03/04 到底是三月四日还是四月三日', 'Is 03/04 March or April?',
      '一律用 Intl.DateTimeFormat 与 locale；日志与 API 用 ISO 8601，界面上写月份名避免歧义。',
      'Always Intl.DateTimeFormat with a locale. Use ISO 8601 in logs and APIs, and spell the month in UI.',
      'list', `.fxcol{width:min(380px,88%);gap:6px}.fx{height:auto;padding:8px 14px;border:0;background:transparent;font:400 13px var(--fx-mono,monospace);color:#65675f}.fx>i,.fx>u{display:none}.fx:nth-child(1)::after{content:'en-US \u00b7 Sep 8, 2026'}.fx:nth-child(2)::after{content:'en-GB \u00b7 8 Sep 2026'}.fx:nth-child(3)::after{content:'zh-CN \u00b7 2026\u5e749\u67088\u65e5'}.fx:nth-child(4)::after{content:'ja-JP \u00b7 2026/09/08'}.fx:nth-child(n+5){display:none}`),

    I('numberformat', '数字格式', 'Number format', '1,234.56 在德国写成 1.234,56', 'Germany writes 1.234,56',
      '千分位与小数点因地而异，印度用 lakh/crore 分组；Intl.NumberFormat 处理，永远不要手写正则。',
      'Separators differ, and India groups by lakh and crore. Use Intl.NumberFormat and never hand-roll a regex.',
      'num', `.fx{font-size:clamp(26px,4.6vw,44px);color:#23232f}.fxnum::after{content:'de-DE 1.234,56 \u00b7 en-IN 1,23,456';font:600 11px var(--fx-mono,monospace);color:#9b9d92}`),

    I('currencyformat', '货币格式', 'Currency format', '符号在前在后、有没有空格都不同', 'Symbol before, after, spaced or not',
      'Intl.NumberFormat 的 currency 样式；金额存整数最小单位（分），显示时才格式化，避免浮点误差。',
      'Use the currency style, store amounts as integer minor units, and format only at display time to dodge float errors.',
      'list', `.fxcol{width:min(380px,88%);gap:6px}.fx{height:auto;padding:8px 14px;border:0;background:transparent;font:500 14px var(--fx-mono,monospace);color:#23232f}.fx>i,.fx>u{display:none}.fx:nth-child(1)::after{content:'$1,234.56'}.fx:nth-child(2)::after{content:'1.234,56\u00a0\u20ac'}.fx:nth-child(3)::after{content:'\u00a51,235'}.fx:nth-child(4)::after{content:'CHF\u00a01\u2019234.55'}.fx:nth-child(n+5){display:none}`),

    I('unitformat', '单位与度量', 'Units & measures', '公顷、英亩、平方公里', 'Hectares, acres, square kilometres',
      'Intl.NumberFormat 的 unit 样式；同时给主单位与括号换算，别只给一个体系的人看得懂的数。',
      'Use the unit style, and show a converted value in parentheses. Do not publish a number only one measurement system understands.',
      'num', `.fx{font-size:clamp(24px,4.2vw,40px);color:#3f6f92}.fxnum::after{content:'3,425 ha (8,463 acres)';font:600 11px var(--fx-mono,monospace);color:#9b9d92}`),

    I('collation', '排序规则', 'Collation', '按 Unicode 码点排序等于乱排', 'Code-point order is not alphabetical order',
      'Intl.Collator 按 locale 排；瑞典语 Å 在 Z 后，德语 ä 视作 a，中文可按拼音或笔画。',
      'Intl.Collator sorts per locale — Swedish Å follows Z, German ä sorts as a, Chinese by pinyin or stroke count.',
      'list', `.fxcol{width:min(380px,88%);gap:6px}.fx{height:auto;padding:8px 14px;border:0;background:transparent;font:500 13px var(--fx-mono,monospace);color:#65675f}.fx>i,.fx>u{display:none}.fx:nth-child(1)::after{content:'sv \u00b7 Z \u2192 \u00c5 \u2192 \u00c4 \u2192 \u00d6'}.fx:nth-child(2)::after{content:'de \u00b7 \u00e4 = a'}.fx:nth-child(3)::after{content:'zh \u00b7 \u62fc\u97f3 / \u7b14\u753b'}.fx:nth-child(n+4){display:none}`),

    I('namefield', '姓名字段', 'Name fields', '不是所有人都有"名"和"姓"', 'Not everyone has a first and last name',
      '优先一个"全名"字段 + 可选"显示名"；需要拆分时标清顺序，并支持单名、多姓、非拉丁字符。',
      'Prefer one full-name field plus an optional display name. If you must split, label the order and allow mononyms and non-Latin scripts.',
      'field', `.fxfield{display:flex;flex-direction:column;gap:6px}.fxfield::before{content:'\u5168\u540d';font:500 12px var(--fx-sans,system-ui);color:#23232f}.fxfield::after{content:'\u6309\u4f60\u5e0c\u671b\u88ab\u79f0\u547c\u7684\u65b9\u5f0f\u586b\u5199';font:400 11px var(--fx-sans,system-ui);color:#8b8d84}`),

    I('addressform', '地址表单', 'Address forms', '省市区不是全球通用结构', 'State and ZIP are not universal',
      '先选国家，再按国家渲染字段集与顺序；邮编不一定存在、不一定是数字、不一定必填。',
      'Pick the country first, then render that country\'s field set and order. Postcodes may not exist, may not be numeric, may be optional.',
      'field', `.fxfield{display:flex;flex-direction:column;gap:9px}.fx:nth-child(1)::after{content:'\u56fd\u5bb6 / \u5730\u533a \u2193';margin-left:auto;color:#4d8ba6;font-weight:600}`),

    I('phoneformat', '电话号码', 'Phone numbers', '别做长度和格式校验', 'Do not validate length or shape',
      '存 E.164（+ 国家码），显示时按 locale 分组；输入框给国家选择器而不是正则拦人。',
      'Store E.164 with the country code and group for display. Offer a country picker instead of a regex that rejects real numbers.',
      'field', `.fxfield{position:relative}.fx::before{content:'+57 \u25be';margin-inline-end:10px;padding-inline-end:10px;border-inline-end:1px solid #d9dbe0;color:#23232f;font-weight:600}`),

    I('calendarsystem', '历法', 'Calendar systems', '不是所有人都用公历', 'Not everyone uses the Gregorian calendar',
      '伊斯兰历、佛历、和历、希伯来历都在用；Intl 支持 calendar 选项，日期选择器要能切换。',
      'Islamic, Buddhist, Japanese-era and Hebrew calendars are all in daily use. Intl supports a calendar option; your date picker should too.',
      'grid', `.fxgrid{grid-template-columns:repeat(3,minmax(0,1fr));width:min(320px,86%)}.fx{height:56px;display:flex;align-items:center;justify-content:center;font:600 11px var(--fx-mono,monospace);color:#65675f}.fx:nth-child(1)::after{content:'2026'}.fx:nth-child(2)::after{content:'\u4ee4\u548c8'}.fx:nth-child(3)::after{content:'1448 AH'}.fx:nth-child(4)::after{content:'2569 BE'}.fx:nth-child(5)::after{content:'5786'}.fx:nth-child(6)::after{content:'1405 SH'}.fx:nth-child(n+7){display:none}`),

    I('timezone', '时区', 'Time zones', 'UTC 存储，本地显示，还要说清是哪个时区', 'Store UTC, show local, name the zone',
      '存 UTC 时间戳 + 事件的 IANA 时区名；跨时区会议要显示两个时区，并标 DST 变更。',
      'Store a UTC instant plus the event\'s IANA zone. Cross-zone meetings show both, and flag DST transitions.',
      'list', `.fxcol{width:min(380px,88%);gap:6px}.fx{height:auto;padding:8px 14px;border:0;background:transparent;font:500 13px var(--fx-mono,monospace);color:#65675f}.fx>i,.fx>u{display:none}.fx:nth-child(1)::after{content:'14:00 America/Bogota'}.fx:nth-child(2)::after{content:'03:00+1 Asia/Shanghai';color:#c07a3a}.fx:nth-child(n+3){display:none}`),

    I('firstdayweek', '周首日', 'First day of week', '周一开始还是周日开始', 'Monday or Sunday',
      '中国与欧洲多为周一、美国与日本多为周日、部分中东为周六；用 locale 的 weekInfo，不要写死。',
      'Monday in Europe and China, Sunday in the US and Japan, Saturday in parts of the Middle East. Read locale weekInfo.',
      'grid', `.fxgrid{grid-template-columns:repeat(7,minmax(0,1fr));width:min(340px,88%);gap:4px}.fx{height:34px;display:flex;align-items:center;justify-content:center;font:600 11px var(--fx-mono,monospace);color:#65675f}.fx:nth-child(1){background:#eef4f8;color:#3f6f92}.fx:nth-child(1)::after{content:'\u4e00'}.fx:nth-child(2)::after{content:'\u4e8c'}.fx:nth-child(3)::after{content:'\u4e09'}.fx:nth-child(4)::after{content:'\u56db'}.fx:nth-child(5)::after{content:'\u4e94'}.fx:nth-child(6)::after{content:'\u516d'}.fx:nth-child(7)::after{content:'\u65e5'}.fx:nth-child(n+8){display:none}`),

    I('fontfallback', '字体回退栈', 'Font fallback stack', '缺字会跳到一个完全不同的字体', 'A missing glyph jumps to another face',
      '按语言给不同栈（CJK 要显式列思源/苹方/微软雅黑），用 unicode-range 分片，避免一句话里三种字形。',
      'Give each script its own stack, split with unicode-range, and avoid three different faces inside one sentence.',
      'text', `.fx{white-space:normal;max-width:20ch;font-size:clamp(18px,2.8vw,26px);line-height:1.7;font-family:var(--fx-sans,system-ui),"PingFang SC","Noto Sans SC",sans-serif}`),

    I('langattr', 'lang 属性', 'The lang attribute', '不写 lang，读屏会用错发音', 'Without lang, the reader mispronounces',
      '<html lang> 必写，段落内换语言要在元素上标 lang；它还影响断行规则、连字与引号形状。',
      'Set html lang, and mark inline language switches on the element. It also drives line breaking, ligatures and quote shapes.',
      'card', `.fx{padding:14px}.fx>b{display:none}.fx>u,.fx>i{display:none}.fx::after{content:'<html lang="zh-Hans"> \u2192 <span lang="en">';display:block;font:400 11px var(--fx-mono,monospace);color:#4d8ba6;word-break:break-all}`),

    I('localefont', '按语言调字重字号', 'Per-locale type tuning', '同一个字号，中文看起来更小', 'The same size reads smaller in Han',
      'CJK 通常要比拉丁大 1–2px、行高再高 0.1–0.2；用 :lang() 选择器分别微调，而不是一套值全局用。',
      'CJK usually needs 1–2px more size and 0.1–0.2 more line height. Tune per :lang() rather than one global value.',
      'list', `.fxcol{width:min(380px,88%);gap:6px}.fx{height:auto;padding:8px 14px;border:0;background:transparent}.fx>i,.fx>u{display:none}.fx:nth-child(1)::after{content:'Latin 15px / 1.5';font-size:15px;line-height:1.5;color:#23232f}.fx:nth-child(2)::after{content:'\u4e2d\u6587 16px / 1.7';font-size:16px;line-height:1.7;color:#3f6f92}.fx:nth-child(n+3){display:none}`),

    I('lineheightcjk', 'CJK 行高', 'CJK leading', '汉字方块密，行高要更松', 'Dense square glyphs need looser leading',
      '中文正文 1.7–1.9，拉丁 1.5–1.6；标题可以收到 1.3，但绝不能像拉丁标题那样压到 1.0。',
      'Chinese body text wants 1.7–1.9 against 1.5–1.6 for Latin. Headings can tighten to 1.3, never to 1.0.',
      'text', `.fx{white-space:normal;max-width:17ch;font-size:clamp(16px,2.4vw,22px);line-height:1.85;color:#4c4e46;text-wrap:pretty}`),

    I('mixedscript', '中英混排间距', 'Mixed-script spacing', '汉字和拉丁之间要有一点气', 'A hair of space between Han and Latin',
      'text-autospace 或在构建期插入 1/4 空；数字与单位之间也要，"5GB" 不如 "5 GB"。',
      'Use text-autospace, or insert a quarter space at build time. Numerals and units want it too — 5 GB, not 5GB.',
      'text', `.fx{white-space:normal;max-width:19ch;font-size:clamp(17px,2.6vw,24px);line-height:1.8;text-autospace:normal}`),

    I('truncatecjk', '截断与省略', 'Truncation', '省略号在不同语言里不一样宽', 'The ellipsis is not the same width everywhere',
      '优先多行截断（line-clamp）而不是单行；CJK 按字截断没问题，拉丁要按词，且要给 title 或展开。',
      'Prefer line-clamp to single-line truncation. CJK may break mid-run; Latin must break on words — and always offer the full text.',
      'card', `.fx{padding:14px}.fx>b,.fx>u,.fx>i{display:none}.fx::after{content:'\u8fd9\u662f\u4e00\u6bb5\u4f1a\u88ab\u622a\u65ad\u7684\u8bf4\u660e\u6587\u5b57\uff0c\u5b83\u5728\u7b2c\u4e8c\u884c\u672b\u5c3e\u88ab\u4f18\u96c5\u5730\u6536\u4f4f\u800c\u4e0d\u662f\u786c\u751f\u751f\u5207\u65ad\u3002';display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font:400 13px/1.7 var(--fx-sans,system-ui);color:#4c4e46}`),

    I('numeralsystem', '数字系统', 'Numeral systems', '阿拉伯语区用的是另一套数字', 'Arabic locales use different digits',
      '阿拉伯-印度数字（٠١٢）、天城体数字都在用；Intl 的 numberingSystem 控制，表格对齐要用等宽数字。',
      'Eastern Arabic and Devanagari digits are in real use. Control it with numberingSystem, and align tables with tabular figures.',
      'num', `.fx{font-size:clamp(28px,5vw,50px);color:#3f6f92}.fxnum::after{content:'\u0661\u0662\u0663\u0664 \u00b7 \u0967\u0968\u0969\u096a';font:600 13px var(--fx-mono,monospace);color:#9b9d92}`),

    I('searchtransliterate', '音译检索', 'Transliterated search', '打拼音也要能搜到汉字', 'Pinyin should find Han characters',
      '索引时同时存原文、拼音全拼与首字母；日文要存假名读音，阿拉伯语要去变音符号。',
      'Index the original plus full and initial pinyin. Japanese needs kana readings, Arabic needs diacritics stripped.',
      'field', `.fxfield{position:relative}.fx{color:#23232f}.fxfield::after{content:'"sm" \u2192 \u6c99\u9a6c \u00b7 \u53f8\u9a6c \u00b7 \u5c71\u8109';position:absolute;left:0;top:56px;font:500 11.5px var(--fx-mono,monospace);color:#4d8ba6}`),

    I('imecompose', '输入法组合态', 'IME composition', '拼音还没上屏就别去搜索', 'Do not search while the IME is composing',
      '监听 compositionstart / compositionend，组合期间不触发查询与校验；否则每敲一个字母都发请求。',
      'Listen for compositionstart and compositionend and suppress queries in between, or every keystroke fires a request.',
      'field', `@keyframes fxk{0%,60%{opacity:1}70%,100%{opacity:0}}.fxfield{position:relative}.fx{color:#23232f}.fxfield::before{content:'sha\u02c8ma \u00b7 \u7ec4\u5408\u4e2d';position:absolute;left:14px;top:-20px;font:500 11px var(--fx-mono,monospace);color:#c07a3a;animation:fxk 2.6s steps(1,end) infinite}`),

    I('currencyposition', '货币与百分号位置', 'Symbol placement', '% 前面有没有空格也是本地习惯', 'Even the space before % is local',
      '法语 12 % 有空格、英语 12% 没有；负号位置、括号表负也因地区与会计习惯而异。',
      'French writes 12 %, English 12%. Minus placement and parenthesised negatives vary by locale and accounting convention.',
      'list', `.fxcol{width:min(380px,88%);gap:6px}.fx{height:auto;padding:8px 14px;border:0;background:transparent;font:500 14px var(--fx-mono,monospace);color:#23232f}.fx>i,.fx>u{display:none}.fx:nth-child(1)::after{content:'en \u00b7 12%  \u2212$40.00'}.fx:nth-child(2)::after{content:'fr \u00b7 12 %  \u221240,00\u00a0\u20ac'}.fx:nth-child(3)::after{content:'acct \u00b7 (40.00)'}.fx:nth-child(n+4){display:none}`),

    I('translationkey', '文案键设计', 'Translation keys', '键名要说明"在哪、干什么"', 'A key says where and what',
      '用 area.component.action 这类层级键，不要用英文原文当键；带上下文注释与最大长度约束给译者。',
      'Use hierarchical keys like area.component.action, never the English string. Ship translator notes and a max length.',
      'card', `.fx{padding:14px}.fx>b,.fx>u,.fx>i{display:none}.fx::after{content:'checkout.summary.applyCoupon\\A  \u2014 \u6309\u94ae\uff0c\u6700\u957f 14 \u5b57\u7b26';white-space:pre;display:block;font:400 11px/1.7 var(--fx-mono,monospace);color:#65675f}`),

    I('pseudoloc', '伪本地化', 'Pseudo-localisation', '上线前先用假语言把界面撑一遍', 'Stress the UI with a fake language first',
      '把文案自动加长 40%、加变音符号、两端加方括号：一眼看出硬编码字符串与撑破的容器。',
      'Auto-expand strings 40%, add accents and wrap in brackets. Hard-coded strings and burst containers reveal themselves instantly.',
      'pill', `.fxpill{max-width:330px;gap:8px}.fx{font-size:12px;white-space:normal}.fx:nth-child(1)::after{content:'[\u0160\u00e0\u0177\u1ebd \u010b\u0125\u00e0\u0148\u011d\u1ebd\u015d \u2013\u2013]'}.fx:nth-child(2)::after{content:'[\u010b\u00e0\u0148\u010b\u1ebd\u013a \u2013\u2013]'}.fx:nth-child(3)::after{content:'Save'}.fx:nth-child(n+4){display:none}`),

    I('locregression', '本地化回归', 'Localisation regression', '每次改文案都可能撑破别的语言', 'Every copy change can burst another locale',
      '把最长语言（德/俄/芬）与 RTL 各截一版进视觉回归；CI 里跑一次比上线后修十次便宜。',
      'Snapshot the longest locales and one RTL build in visual regression. One CI pass beats ten post-launch patches.',
      'grid', `.fxgrid{grid-template-columns:repeat(3,minmax(0,1fr));width:min(330px,86%)}.fx{height:62px;display:flex;align-items:center;justify-content:center;font:600 10px var(--fx-mono,monospace);color:#65675f}.fx:nth-child(1)::after{content:'en \u2713'}.fx:nth-child(2)::after{content:'de \u2713'}.fx:nth-child(3)::after{content:'ru \u2713'}.fx:nth-child(4)::after{content:'ja \u2713'}.fx:nth-child(5)::after{content:'ar-RTL \u2713'}.fx:nth-child(6){color:#c04a63}.fx:nth-child(6)::after{content:'fi \u2717'}.fx:nth-child(n+7){display:none}`)
  ]
};
