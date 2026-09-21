// 页面级设计语言：整页风格流派，而不是单个动效。
// 每条 = 术语 + 定义 + 做法 + 关键词 + 一张会动的样张 + 真实参考站点。
// refs 里的站点是真实存在的、可点开的原站；样张是同语言的原创演绎（不复刻他人品牌）。
// 若 assets/ref/<id>.png 存在，详情页会用真截图替换样张。
const SERIF = "Georgia,'Times New Roman',serif";
const MONO = "var(--fx-mono,ui-monospace,monospace)";
const SANS = "var(--fx-sans,system-ui)";
const E = 'cubic-bezier(.22,1,.36,1)';

const R = (...p) => p.map(x => ({ n: x[0], u: x[1] }));
// cells: [chrome, nav, headline, deck, cta, art]
const C = (brand, nav, head, sub, cta) => ['', brand + '      ' + nav, head, sub, cta, ''];
const I = (id, zh, en, dz, de, pz, pe, kz, kw, cells, css, refs) =>
  ({ id, zh, en, dz, de, pz, pe, kz, kw, demo: 'page', cells, css, refs: refs || [] });

export default {
  id: 'pagestyle', zh: '页面设计语言', en: 'Page design languages',
  view: 'lang',
  dz: '整页级的风格流派：从瑞士网格到深空中文排版。每条都给了定义、做法、关键词，和真实可点开的参考原站',
  de: 'Whole-page style movements, from Swiss grids to deep-space CJK type. Each one carries a definition, a recipe, keywords, and real reference sites you can open',
  items: [

    /* ── 一、克制与秩序 ─────────────────────────────── */

    I('minimalism', '极简主义', 'Minimalism',
      '把东西拿掉，直到只剩必须的那一句', 'Remove until only the necessary sentence is left',
      '一个视觉焦点、一种字体两个字重、大面积留白当版面元素用；对比靠字号级差而不是颜色。首屏拒绝把自己填满。',
      'One focal point, one typeface in two weights, white space treated as a component. Contrast comes from scale, not colour — and the hero refuses to fill itself.',
      ['更少', '更好', '专注于真正重要的内容'], ['LESS', 'BUT BETTER', 'FOCUS ON WHAT MATTERS'],
      C('LUMO', 'Product   About   Support', 'A calmer\ndigital life', '简洁的工具，成就更专注的你。', '立即体验'),
      `@keyframes fxk{0%,100%{opacity:.62;transform:translateY(5px)}42%,72%{opacity:1;transform:none}}
.fxpage{background:#fff}
.fxhead{font:400 31px/1.08 ${SERIF};letter-spacing:-.012em;animation:fxk 7s ${E} infinite}
.fxart{background:radial-gradient(120% 110% at 30% 20%,#fdfdfc,#f0f0ec 58%,#e6e6e0)}
.fxcta{background:#23232f}`,
      R(['iA', 'ia.net'], ['Dieter Rams 原则', 'vitsoe.com/us/about/good-design'], ['Apple', 'apple.com'])),

    I('swiss', '瑞士国际主义', 'Swiss / International Typographic',
      '网格、无衬线、一条红斜线', 'Grid, grotesque, one red rule',
      '严格模块网格 + Helvetica 类字体 + 齐左不齐右；单一强调色只出现在一个几何元素上，绝不铺满。',
      'A strict modular grid, a grotesque face, flush-left ragged-right text, and a single accent colour on exactly one geometric element.',
      ['网格', '清晰', '有力的表达'], ['GRID', 'CLARITY', 'IMPACT'],
      C('VERTEX', 'Work   Studio   Approach', 'IDEAS\nBUILD\nTOMORROW', '用设计构建更好的未来。', '探索项目'),
      `@keyframes fxk{0%{transform:scaleY(0)}58%,100%{transform:scaleY(1)}}
.fxpage{background:#fff;border-radius:0}.fxbar{border-radius:0}
.fxhead{font:800 31px/.92 ${SANS};letter-spacing:-.042em;text-transform:uppercase;position:relative}
.fxhead::after{content:'';position:absolute;right:8px;top:2px;bottom:0;width:5px;background:#e0342f;transform-origin:bottom;animation:fxk 4.6s ${E} infinite}
.fxart{background:linear-gradient(196deg,#e8433c,#c9241f 62%,#a81a16);box-shadow:inset 0 0 60px rgba(0,0,0,.16)}
.fxcta{background:#111;border-radius:0}`,
      R(['Swissted', 'swissted.com'], ['Lars Müller Publishers', 'lars-mueller-publishers.com'], ['Josef Müller-Brockmann', 'museum-gestaltung.ch'])),

    I('bauhaus', '包豪斯风', 'Bauhaus',
      '圆方三角与三原色', 'Circle, square, triangle, primaries',
      '基本几何形 + 红黄蓝 + 无衬线全大写；形体承担全部装饰，绝不加纹理与阴影。构成要能拆成尺规能画出来的元素。',
      'Primitive geometry, red/yellow/blue, uppercase sans. Form carries all decoration — no texture, no shadow. Everything drawable with compass and rule.',
      ['几何构成', '原色运用', '少即是多'], ['GEOMETRIC', 'PRIMARY COLOURS', 'LESS IS MORE'],
      C('bauhaus.', 'Home   Works   News', 'GOOD DESIGN\nFOR A BETTER\nTOMORROW', '用简单的形状，创造更美好的世界。', '探索作品'),
      `@keyframes fxk{to{transform:rotate(360deg)}}
.fxpage{background:#faf7f0;border-radius:0}.fxbar{border-radius:0;background:#f1ede2}
.fxhead{font:800 25px/1.06 ${SANS};letter-spacing:-.024em;text-transform:uppercase;color:#161616}
.fxart{background:#faf7f0;position:relative;overflow:hidden;border-left:1px solid #e7e1d2}
.fxart::before{content:'';position:absolute;left:14%;top:16%;width:46%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 34% 30%,#e8574c,#c62a22 70%);animation:fxk 26s linear infinite}
.fxart::after{content:'';position:absolute;right:11%;bottom:14%;width:0;height:0;border-left:35px solid transparent;border-right:35px solid transparent;border-bottom:58px solid #1f52ad}
.fxcta{background:#161616;border-radius:0}`,
      R(['Bauhaus Dessau', 'bauhaus-dessau.de/en'], ['Bauhaus Kooperation', 'bauhauskooperation.com'])),

    I('scientific', '科学图表风', 'Scientific / research',
      '像一篇论文的图，而不是营销页', 'Figures from a paper, not a marketing page',
      '白底细线 + 等宽数字 + 真坐标轴与图例 + 单一强调色；不要渐变、不要入场动画。数字自己会说话。',
      'White ground, hairlines, tabular numerals, real axes and legends, one accent. No gradients, no entrance animation — the numbers carry it.',
      ['朴素', '可验证', '一个强调色'], ['PLAIN', 'VERIFIABLE', 'ONE ACCENT'],
      C('CARBON LAB', 'Methods   Data   Papers', 'Unutterably\nsimple graphics', '3,425 ha · 87% primary forest · n = 81', 'View dataset'),
      `@keyframes fxk{0%,100%{opacity:.55}50%{opacity:1}}
.fxpage{background:#fff;border-radius:2px}
.fxbar{background:#fafaf8}
.fxnav2{font-family:${MONO};font-size:9px;letter-spacing:.05em;color:#5a5c55}
.fxhead{font:400 26px/1.18 ${SERIF};color:#111;letter-spacing:-.008em}
.fxsub{font-family:${MONO};font-size:10px;color:#5a5c55}
.fxart{background:#fff;border-left:1px solid #eceee8;position:relative}
.fxart::before{content:'';position:absolute;left:15%;right:11%;bottom:26%;height:1px;background:#111;box-shadow:0 -34px 0 -.5px #eceee8,0 -68px 0 -.5px #eceee8}
.fxart::after{content:'';position:absolute;left:15%;bottom:26.5%;width:0;height:0;border-left:74px solid transparent;border-bottom:54px solid #fe2c55;animation:fxk 5s ease-in-out infinite}
.fxcta{background:#111;border-radius:2px;font-family:${MONO}}`,
      R(['CarbonPlan', 'carbonplan.org'], ['Our World in Data', 'ourworldindata.org'], ['Distill', 'distill.pub'])),

    I('blueprint', '工程蓝图风', 'Blueprint / technical',
      '像一张施工图', 'Reads like a construction drawing',
      '蓝底白线或白底细蓝线 + 尺寸标注 + 剖面符号 + 等宽标签；线宽严格分级（0.25 / 0.5 / 1pt），标注比图形更重要。',
      'Blue ground with white lines, dimension callouts, section marks, monospace labels. Line weights strictly graded — the annotation matters more than the drawing.',
      ['技术图纸', '精确标注', '结构透明'], ['TECHNICAL', 'ANNOTATED', 'PRECISE'],
      C('DRAFT.CO', 'Specs   Process   Docs', 'BUILT TO\nSPECIFICATION', '每一处尺寸都可被验证。', 'VIEW SPEC'),
      `@keyframes fxk{0%,100%{opacity:.35}50%{opacity:1}}
.fxpage{background:#123156;border-color:#1d4478;border-radius:0}
.fxbar{background:#0d2542;border-bottom-color:#1d4478;border-radius:0}
.fxnav2{border-bottom-color:#1d4478;color:#a8c8ee;font-family:${MONO};letter-spacing:.07em}
.fxhead{font:400 23px/1.28 ${MONO};color:#eaf2fb;letter-spacing:.01em}
.fxsub{color:#9fbde0;font-family:${MONO};font-size:10px}
.fxart{background:radial-gradient(140% 120% at 70% 10%,#1a4272,#0e2748 70%);border-left:1px solid #1d4478;position:relative}
.fxart::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,.13) 0 1px,transparent 1px 15px),repeating-linear-gradient(90deg,rgba(255,255,255,.13) 0 1px,transparent 1px 15px)}
.fxart::after{content:'';position:absolute;left:23%;top:25%;width:54%;height:46%;border:1px dashed #eaf2fb;animation:fxk 4s ease-in-out infinite}
.fxcta{background:#eaf2fb;color:#123156;border-radius:0;font-family:${MONO}}`,
      R(['Dimensions.com', 'dimensions.com'], ['NASA Graphics Standards Manual', 'standardsmanual.com'])),

    /* ── 二、阅读与编辑 ─────────────────────────────── */

    I('editorial', '杂志编辑风', 'Editorial',
      '像一本杂志的内页，而不是一个落地页', 'A magazine spread, not a landing page',
      '衬线大标题 + 多栏正文 + 图注小字；靠栏宽变化与首字下沉建立阅读节奏，导航退成一行细字。',
      'Serif display, multi-column body, small captions. Rhythm comes from varying measure and a drop cap; the nav shrinks to one thin line.',
      ['用故事', '连接人与世界', '看见更大的可能'], ['STORIES', 'PEOPLE', 'A WIDER VIEW'],
      C('The Paper Room', 'Column   Life   Travel', 'Good Life\nin Small Things', '在细微处，发现更好的生活。', '阅读更多'),
      `@keyframes fxk{0%,100%{letter-spacing:0}50%{letter-spacing:.014em}}
.fxpage{background:#fcfbf7}
.fxhead{font:400 italic 30px/1.06 ${SERIF};animation:fxk 8s ease-in-out infinite}
.fxsub{font-family:${SERIF};font-size:11px}
.fxart{background:linear-gradient(148deg,#efebe0,#dcd5c4 56%,#c8c0ac);box-shadow:inset 0 0 50px rgba(90,80,60,.12)}
.fxcta{background:transparent;color:#23232f;border-bottom:1px solid #23232f;border-radius:0;padding:4px 0}`,
      R(['It’s Nice That', 'itsnicethat.com'], ['The New Yorker', 'newyorker.com'], ['Kinfolk', 'kinfolk.com'])),

    I('newspaper', '报纸风', 'Newspaper',
      '报头、栏线、通栏大标题', 'A masthead, column rules, a banner headline',
      '衬线报头 + 多栏细分栏线 + 报纸灰纸底 + 图注小字；标题层级用字号跨度而不是颜色，双线分隔是签名动作。',
      'A serif masthead, hairline column rules, newsprint grey, small captions. Hierarchy by size jumps, never colour; the double rule is the signature.',
      ['报头', '栏线', '通栏标题'], ['MASTHEAD', 'COLUMN RULES', 'BANNER HEAD'],
      C('THE DAILY GRID', 'World   Design   Opinion', 'DESIGN\nMOVES FIRST', '本报讯——版式仍然是最快的媒介。', 'Read on'),
      `@keyframes fxk{0%,100%{opacity:.9}50%{opacity:1}}
.fxpage{background:#f3f0e7;border-radius:0;border-color:#151515}
.fxbar{background:#e9e5d8;border-radius:0;border-bottom:1px solid #151515}
.fxnav2{border-bottom:3px double #151515;font-family:${SERIF};letter-spacing:.05em;text-transform:uppercase;font-weight:400}
.fxhead{font:900 28px/.96 ${SERIF};letter-spacing:-.024em;text-transform:uppercase;color:#151515}
.fxsub{font-family:${SERIF};color:#3a3a3a;column-count:2;column-gap:13px;column-rule:1px solid #d2ccba;font-size:9.5px}
.fxart{background:linear-gradient(148deg,#ddd8c9,#8a8477 50%,#4f4a41);filter:grayscale(1) contrast(1.08);border-left:1px solid #151515;animation:fxk 8s ease-in-out infinite}
.fxcta{background:transparent;color:#151515;border:1px solid #151515;border-radius:0;font-family:${SERIF}}`,
      R(['The Guardian', 'theguardian.com'], ['NYT', 'nytimes.com'], ['Newspaper Club', 'newspaperclub.com'])),

    I('docsproduct', '文档产品风', 'Docs-native product',
      '产品长得像一份文档', 'The product looks like a document',
      '左侧目录 + 单栏正文 + 行内块编辑 + 极浅分隔线；字体层级少，靠间距分节，光标是唯一的动效。',
      'A sidebar outline, one text column, inline blocks, near-invisible rules. Few type levels; spacing does the sectioning and the caret is the only motion.',
      ['文档感', '块编辑', '安静的界面'], ['DOCUMENT', 'BLOCKS', 'QUIET UI'],
      C('Slate', 'Docs   Templates   Pricing', '把想法写\n成结构', '一个块一个想法，结构自己长出来。', '新建文档'),
      `@keyframes fxk{0%,49%{opacity:1}50%,100%{opacity:0}}
.fxpage{background:#fff}
.fxbar{background:#fbfbfa}.fxnav2{border-bottom-color:#f0efec;color:#6b6a65}
.fxhead{font:700 26px/1.22 ${SANS};letter-spacing:-.024em;color:#37352f}
.fxhead::after{content:'|';color:#37352f;font-weight:300;animation:fxk 1.1s steps(1,end) infinite}
.fxsub{color:#787670}
.fxart{background:linear-gradient(170deg,#fcfcfb,#f7f6f3);border-left:1px solid #f0efec;position:relative}
.fxart::after{content:'';position:absolute;left:13%;right:13%;top:22%;height:8px;border-radius:4px;background:#e9e7e1;box-shadow:0 23px 0 #e9e7e1,0 46px 0 #f0eee9,0 69px 0 #f0eee9,0 92px 0 -2px #f4f2ee}
.fxcta{background:#37352f;border-radius:4px}`,
      R(['Notion', 'notion.so'], ['Obsidian', 'obsidian.md'], ['Craft', 'craft.do'])),

    I('cjktype', '中文排版主义', 'CJK typographic',
      '把汉字当成版面主体，不是英文版式的填空', 'Han characters as the subject, not filler in a Latin layout',
      '大字号中文标题 + 字重只用两级 + 行高 1.5 以上 + 标点挤压；英文降为辅助行，字距靠字号而不是 letter-spacing。',
      'Large Han display type, only two weights, line-height above 1.5, punctuation kerned. Latin drops to a support line; rhythm from size, not letter-spacing.',
      ['汉字为主', '呼吸感', '克制的对比'], ['HAN FIRST', 'BREATHING ROOM', 'RESTRAINED'],
      C('拾光', '产品   关于   加入我们', '把复杂的事\n讲得简单', 'Make the complex feel simple.', '了解更多'),
      `@keyframes fxk{0%,100%{opacity:.72;letter-spacing:.02em}48%{opacity:1;letter-spacing:0}}
.fxpage{background:#fcfbf8}
.fxnav2{letter-spacing:.06em;color:#3a3a35}
.fxhead{font:600 30px/1.5 ${SANS};letter-spacing:.01em;color:#1c1c1a;animation:fxk 9s ease-in-out infinite}
.fxsub{font-family:${SERIF};font-style:italic;color:#8a877c;letter-spacing:.02em}
.fxart{background:radial-gradient(130% 110% at 24% 18%,#f6f4ee,#e8e4d8 60%,#d8d3c3)}
.fxcta{background:#1c1c1a;border-radius:2px;letter-spacing:.08em}`,
      R(['Justfont 字型故事', 'justfont.com/blog'], ['Type is Beautiful', 'typeisbeautiful.com'], ['Hanyi 汉仪', 'hanyi.com.cn'])),

    I('deepspace', '深空品牌页', 'Deep-space brand page',
      '近黑的夜空里挂着一颗会呼吸的球', 'A breathing orb hung in a near-black sky',
      '近黑冷底 + 一颗大尺寸发光球体（月/星/环）+ 极简中文大字 + 一条细高光；渐变必须细，球体只有一个光源。',
      'A near-black cool ground, one oversized luminous orb, minimal large CJK type, one hairline specular. Faint gradients; the orb takes exactly one light.',
      ['深空', '一颗光源', '克制的科技感'], ['DEEP SPACE', 'ONE LIGHT SOURCE', 'QUIET TECH'],
      C('暗面', '产品   研究   加入我们', '探索\n能量与智能', '把能源转化为智能的最佳方案。', '查看职位'),
      `@keyframes fxk{0%,100%{transform:translateY(4px) scale(.99);filter:brightness(.94)}50%{transform:translateY(-6px) scale(1.02);filter:brightness(1.1)}}
.fxpage{background:#08090c;border-color:#191c22}
.fxbar{background:#0c0e12;border-bottom-color:#191c22}
.fxnav2{border-bottom-color:#191c22;color:#8d939e;letter-spacing:.06em}
.fxhead{font:500 30px/1.42 ${SANS};letter-spacing:.015em;color:#f0f1f4}
.fxsub{color:#7e848f}
.fxart{background:radial-gradient(150% 120% at 84% 6%,#1c2231,#0a0b0f 62%);position:relative;overflow:hidden}
.fxart::before{content:'';position:absolute;left:22%;top:24%;width:56%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 34% 28%,#f2f3f7,#b9bfd0 34%,#535c72 66%,#20242f);box-shadow:0 0 60px rgba(150,170,215,.34),inset -14px -18px 40px rgba(8,9,12,.7);animation:fxk 9s ease-in-out infinite}
.fxart::after{content:'';position:absolute;inset:0;background:radial-gradient(1.2px 1.2px at 14% 22%,#fff,transparent),radial-gradient(1.2px 1.2px at 82% 74%,#e6ebff,transparent),radial-gradient(1px 1px at 34% 82%,#fff,transparent),radial-gradient(1px 1px at 66% 16%,#dfe6ff,transparent);opacity:.7}
.fxcta{background:#f0f1f4;color:#08090c;border-radius:999px}`,
      R(['月之暗面 Moonshot AI', 'moonshot.cn'], ['Kimi', 'kimi.com'], ['Anthropic', 'anthropic.com'])),

    /* ── 三、材质与拟态 ─────────────────────────────── */

    I('glass', '玻璃拟态', 'Glassmorphism',
      '半透明面板浮在彩色背景上', 'Frosted panels floating over colour',
      'backdrop-filter:blur + 8–16% 白底 + 1px 高光描边；必须有彩色或图像背景才成立，且要盯住正文对比度。',
      'backdrop-filter blur, an 8–16% white fill, a 1px light border. It only works over colour or imagery — and body contrast needs watching.',
      ['通透', '层次', '轻盈'], ['TRANSPARENT', 'LAYERED', 'LIGHT'],
      C('Aurora', 'Product   Plans   Pricing', '让灵感\n自然流动', '在灵感与现实之间，创造更短的距离。', '免费开始'),
      `@keyframes fxk{0%,100%{transform:translateY(-5px)}50%{transform:translateY(5px)}}
.fxpage{background:linear-gradient(148deg,#c8d5ee,#e4d8ec 44%,#d2e2ea 78%,#e8e2f0)}
.fxbar{background:rgba(255,255,255,.46);border-bottom-color:rgba(255,255,255,.55)}
.fxnav2{border-bottom-color:rgba(255,255,255,.44);color:#2f3143}
.fxhead{font:700 28px/1.14 ${SANS};letter-spacing:-.03em;color:#262838}
.fxsub{color:#5a5d72}
.fxart{background:rgba(255,255,255,.3);backdrop-filter:blur(9px);border-left:1px solid rgba(255,255,255,.62);box-shadow:inset 0 1px 0 rgba(255,255,255,.8);animation:fxk 7s ease-in-out infinite}
.fxcta{background:rgba(255,255,255,.74);color:#262838;border:1px solid rgba(255,255,255,.9);box-shadow:0 6px 18px rgba(60,70,110,.16)}`,
      R(['Microsoft Fluent', 'microsoft.com/design/fluent'], ['Apple Human Interface', 'developer.apple.com/design'])),

    I('neumorphism', '新拟态', 'Neumorphism',
      '控件像从同色表面顶出来的', 'Controls extruded from a same-colour surface',
      '同色底 + 一对相反方向的柔和内外阴影；对比天生偏低，交互态必须再加边框或色彩兜底，否则不可用。',
      'One surface colour with paired soft light/dark shadows. Contrast is inherently low — back every interaction state with a border or colour or it fails accessibility.',
      ['柔和', '可触感', '单色极简'], ['SOFT', 'TACTILE', 'MONOCHROME'],
      C('Mellow', 'Product   Solutions   About', '让专注\n成为一种日常', '简洁的工具，安静的体验。', '立即体验'),
      `@keyframes fxk{0%,100%{box-shadow:9px 9px 20px rgba(158,166,174,.6),-9px -9px 20px rgba(255,255,255,.96)}50%{box-shadow:inset 7px 7px 15px rgba(158,166,174,.55),inset -7px -7px 15px rgba(255,255,255,.92)}}
.fxpage{background:#e9ecef;border-color:#dfe3e6}.fxbar{background:#e9ecef;border-bottom-color:#dfe3e6}
.fxnav2{border-bottom-color:#dfe3e6;color:#5a6472}
.fxhead{font:700 26px/1.16 ${SANS};letter-spacing:-.03em;color:#3d4550}
.fxsub{color:#7b8492}
.fxart{background:#e9ecef;position:relative}
.fxart::after{content:'';position:absolute;left:50%;top:50%;width:104px;height:104px;margin:-52px 0 0 -52px;border-radius:50%;background:#e9ecef;animation:fxk 5s ease-in-out infinite}
.fxcta{background:#e9ecef;color:#3d4550;box-shadow:5px 5px 12px rgba(158,166,174,.55),-5px -5px 12px #fff}`,
      R(['Neumorphism.io', 'neumorphism.io'], ['Michal Malewicz 的批评文', 'medium.com/@michalmalewicz'])),

    I('claymorphism', '黏土拟物风', 'Claymorphism',
      '一切都像捏出来的软陶', 'Everything looks moulded from clay',
      '超大圆角 + 双层柔和内外阴影 + 低饱和粉彩；形体要"胖"，描边为零，投影要软到看不出边界。',
      'Huge radii, layered soft inner and outer shadows, pastel fills. Forms are chubby, strokes are zero, shadows soft enough to have no edge.',
      ['柔软质感', '立体圆润', '亲和友好'], ['SOFT', 'ROUNDED', 'FRIENDLY'],
      C('Pomo', 'Product   Templates   Pricing', 'Focus Brings\nGood Things', '专注，让美好的事情发生。', '开始专注'),
      `@keyframes fxk{0%,100%{transform:translateY(-5px) scale(1)}50%{transform:translateY(5px) scale(1.035)}}
.fxpage{background:#eef4fb;border-radius:22px;border-color:#dde8f5}
.fxbar{background:#e4eefa;border-bottom-color:#dde8f5}
.fxnav2{border-bottom-color:#e0eaf7;color:#5f6d88}
.fxhead{font:800 26px/1.16 ${SANS};letter-spacing:-.026em;color:#485878}
.fxsub{color:#7e8ca8}
.fxart{background:linear-gradient(160deg,#e6f0fb,#dae7f6);position:relative}
.fxart::after{content:'';position:absolute;left:23%;top:23%;width:54%;height:54%;border-radius:42%;background:linear-gradient(150deg,#f9d8de,#efbcc8);box-shadow:inset -9px -11px 18px rgba(255,255,255,.95),inset 9px 11px 18px rgba(168,132,145,.3),0 16px 28px rgba(120,140,170,.32);animation:fxk 6s ease-in-out infinite}
.fxcta{background:linear-gradient(#f6b0be,#eb95a7);color:#4d353c;border-radius:999px;box-shadow:0 9px 18px rgba(180,120,140,.36)}`,
      R(['Icons8 Clay', 'icons8.com/illustrations/style--clayity'], ['Craftwork', 'craftwork.design'])),

    I('skeuomorphism', '拟物主义', 'Skeuomorphism',
      '界面模仿真实材质', 'The interface imitates real material',
      '材质贴图、缝线、金属高光、真实投影；隐喻必须一致，别一半木纹一半扁平。光源方向全站统一。',
      'Textures, stitching, metal speculars, real shadows. Keep the metaphor consistent — no half wood-grain, half flat — and one light direction site-wide.',
      ['真实材质', '熟悉感', '物理质感'], ['REALISTIC', 'FAMILIAR', 'PHYSICAL'],
      C('Daily Goods', 'Product   Story   Store', '好物，\n让生活更真实', '从真实的材料出发。', '探索系列'),
      `@keyframes fxk{0%,100%{background-position:0 0}50%{background-position:15px 0}}
.fxpage{background:#f0e7d9;border-color:#d9ccb6}
.fxbar{background:linear-gradient(#f9f4ea,#e7dbc7);border-bottom-color:#d3c5ae}
.fxnav2{border-bottom-color:#e2d5bf;color:#6a5942}
.fxhead{font:700 26px/1.18 ${SERIF};color:#4a3a26;text-shadow:0 1px 0 rgba(255,255,255,.6)}
.fxsub{color:#7d6a51}
.fxart{background:repeating-linear-gradient(93deg,#c9a877 0 8px,#b6936a 8px 16px);box-shadow:inset 0 0 34px rgba(70,52,32,.4),inset 0 2px 0 rgba(255,255,255,.22);animation:fxk 7s ease-in-out infinite}
.fxcta{background:linear-gradient(#bd8c4d,#956630);border:1px solid #7b5423;box-shadow:inset 0 1px 0 rgba(255,255,255,.45),0 2px 4px rgba(70,52,32,.3)}`,
      R(['Panic', 'panic.com'], ['Iconfactory', 'iconfactory.com'], ['Skeuocard 归档', 'kenkeiter.com/skeuocard'])),

    I('japandi', '日式侘寂风', 'Japandi / wabi-sabi',
      '素材本身就是装饰', 'The material is the decoration',
      '米白与灰褐 + 天然材质留痕 + 大量负空间 + 细字重；不对称构图，禁止纯黑与高饱和，动效慢到几乎察觉不到。',
      'Off-white and taupe, visible material grain, deep negative space, light weights. Asymmetric; no pure black, no saturation, motion slow to the edge of perception.',
      ['自然质感', '宁静平和', '温暖的生活方式'], ['NATURAL', 'CALM', 'WARMTH'],
      C('KOMOREBI', 'Home   Life   About', '让生活\n回归本真', '在简单的日常里，发现更大的幸福。', '探索系列'),
      `@keyframes fxk{0%,100%{opacity:.84;transform:scale(1)}50%{opacity:1;transform:scale(1.022)}}
.fxpage{background:#f5f1e9;border-color:#e4ddce}
.fxbar{background:#efeade;border-bottom-color:#e4ddce}
.fxnav2{border-bottom-color:#e9e3d6;color:#6b6355;letter-spacing:.09em}
.fxhead{font:300 27px/1.36 ${SERIF};color:#43403a;letter-spacing:.02em}
.fxsub{color:#8a8377}
.fxart{background:radial-gradient(130% 110% at 26% 20%,#e8dfcd,#cfc2a9 62%,#b8ab92);animation:fxk 11s ease-in-out infinite}
.fxcta{background:#43403a;border-radius:2px}`,
      R(['MUJI', 'muji.com'], ['Kinfolk', 'kinfolk.com'], ['Analogue Life', 'analoguelife.com'])),

    I('luxury', '奢华极简风', 'Luxury minimal',
      '克制、高级、留白买不起', 'Restrained, expensive, space you can’t afford',
      '暗色或米色底 + 细衬线大写标题 + 宽字距 + 金铜色细节；动效必须慢，任何弹跳都掉价。CTA 只用描边。',
      'Dark or ivory ground, light serif caps, wide tracking, brass details. Motion must be slow — any bounce cheapens it. CTAs are outline only.',
      ['高级感', '精致细节', '永恒的品牌气质'], ['PREMIUM', 'ELEGANCE', 'TIMELESS'],
      C('AURUM', 'Collections   Journal   Stores', 'EXCEPTIONAL\nBY NATURE', '时间，见证更好的自己。', 'EXPLORE'),
      `@keyframes fxk{0%,100%{letter-spacing:.15em;opacity:.88}50%{letter-spacing:.19em;opacity:1}}
.fxpage{background:#15130f;border-color:#2b2620}
.fxbar{background:#1b1813;border-bottom-color:#2b2620}
.fxnav2{border-bottom-color:#2b2620;color:#b8ab94;letter-spacing:.11em;text-transform:uppercase;font-weight:400}
.fxhead{font:400 22px/1.42 ${SERIF};letter-spacing:.15em;color:#ece3d0;text-transform:uppercase;animation:fxk 10s ease-in-out infinite}
.fxsub{color:#9a9080}
.fxart{background:radial-gradient(120% 100% at 68% 18%,#4a4136,#211d17 64%,#141109);position:relative}
.fxart::after{content:'';position:absolute;left:33%;top:28%;width:34%;height:44%;background:linear-gradient(148deg,#e0c483,#c9a961 34%,#8a6f32 72%,#c9a961);border-radius:2px;box-shadow:0 14px 34px rgba(0,0,0,.5)}
.fxcta{background:transparent;color:#c9a961;border:1px solid #c9a961;border-radius:0;letter-spacing:.13em}`,
      R(['Aesop', 'aesop.com'], ['Loro Piana', 'loropiana.com'], ['Byredo', 'byredo.com'])),

    /* ── 四、粗野与反叛 ─────────────────────────────── */

    I('brutalism', '粗野主义', 'Brutalism',
      '不修饰，硬碰硬', 'Unfinished on purpose, hard against hard',
      '默认字体、纯黑白、无圆角无阴影、超大字号压满版；把 HTML 的结构本身暴露出来当装饰。',
      'System type, pure black and white, no radius, no shadow, headline pushed to the edges. The raw HTML structure is the decoration.',
      ['原始粗犷', '强烈对比', '去修饰'], ['RAW', 'HIGH CONTRAST', 'NO FRILLS'],
      C('STUDIO VOID', 'Work   About   News', 'GOOD\nIDEAS\nNO LIMITS.', '一家独立的创意工作室。', '查看作品'),
      `@keyframes fxk{0%,100%{transform:none}50%{transform:translate(-2px,1px)}}
.fxpage{background:#fff;border:2px solid #000;border-radius:0}
.fxbar{background:#fff;border-bottom:2px solid #000;border-radius:0}.fxbar::before{background:#000;box-shadow:9px 0 0 #000,18px 0 0 #000}
.fxbar::after{border-color:#000;border-radius:0;background:#fff}
.fxnav2{border-bottom:2px solid #000;font-weight:700;text-transform:uppercase;color:#000}
.fxhead{font:900 33px/.9 ${SANS};letter-spacing:-.052em;text-transform:uppercase;color:#000;animation:fxk 3.4s steps(2,end) infinite}
.fxsub{color:#000}
.fxart{background:#000;border-left:2px solid #000}
.fxcta{background:#000;border-radius:0;text-transform:uppercase}`,
      R(['Brutalist Websites', 'brutalistwebsites.com'], ['Craigslist', 'craigslist.org'], ['Bloomberg 图形', 'bloomberg.com/graphics'])),

    I('neobrutalism', '新粗野主义', 'Neo-brutalism',
      '粗黑描边 + 硬投影 + 高饱和色块', 'Thick outlines, hard offset shadows, loud blocks',
      '2–3px 纯黑描边、4–6px 无模糊位移阴影、荧光色块；圆角可有可无，但阴影必须是硬的，按下时位移要真。',
      'A 2–3px black outline, a 4–6px zero-blur offset shadow, fluorescent fills. Radius optional; the shadow must stay hard and the press must really move.',
      ['鲜明色块', '粗黑描边', '趣味表达'], ['BOLD BLOCKS', 'THICK OUTLINES', 'PLAYFUL'],
      C('PlayLab', 'Project   Service   About', '好的创意\n让世界更有趣。', '我们用设计和技术创造有温度的体验。', '一起创造'),
      `@keyframes fxk{0%,100%{transform:none;box-shadow:6px 6px 0 #1b1b22}50%{transform:translate(3px,3px);box-shadow:3px 3px 0 #1b1b22}}
.fxpage{background:#fdf5e0;border:2.5px solid #1b1b22;box-shadow:8px 8px 0 #1b1b22}
.fxbar{background:#ffdf49;border-bottom:2.5px solid #1b1b22}.fxbar::before{background:#1b1b22;box-shadow:9px 0 0 #1b1b22,18px 0 0 #1b1b22}
.fxbar::after{border:2px solid #1b1b22;border-radius:0;background:#fdf5e0}
.fxnav2{border-bottom:2.5px solid #1b1b22;font-weight:700;color:#1b1b22}
.fxhead{font:800 27px/1.1 ${SANS};letter-spacing:-.022em;color:#1b1b22}
.fxhead::before{content:'';display:block;width:78px;height:12px;background:#ffdf49;border:2px solid #1b1b22;margin-bottom:9px}
.fxsub{color:#3a3a44}
.fxart{background:#4fc6da;border-left:2.5px solid #1b1b22;position:relative}
.fxart::after{content:'';position:absolute;left:21%;top:23%;width:58%;height:54%;background:#ff74b3;border:2.5px solid #1b1b22;animation:fxk 3.4s ${E} infinite}
.fxcta{background:#ff74b3;color:#1b1b22;border:2.5px solid #1b1b22;border-radius:0;box-shadow:4px 4px 0 #1b1b22}`,
      R(['Gumroad', 'gumroad.com'], ['Neobrutalism components', 'neobrutalism.dev'], ['Figma 社区页', 'figma.com/community'])),

    I('zine', '复印小样风', 'Zine / punk xerox',
      '像复印机印坏的小册子', 'A photocopier having a bad day',
      '高对比二值化图 + 复印噪点 + 手写与打字机混排 + 歪斜贴纸；不对齐才是对的，边缘要有脏。',
      'Hard-threshold images, copier noise, typewriter and handwriting mixed, skewed stickers. Misalignment is the point, and the edges must be dirty.',
      ['复印质感', '地下气质', '自己动手'], ['XEROX', 'UNDERGROUND', 'DIY'],
      C('RIOT ZINE', 'issues   shows   mail', 'CUT IT OUT\nAND PASTE IT', '自己印，自己发。', 'SUBSCRIBE'),
      `@keyframes fxk{0%,100%{transform:rotate(-1.4deg)}50%{transform:rotate(1.4deg)}}
.fxpage{background:#eae8e1;border:2px solid #151515;border-radius:0}
.fxbar{background:#dedbd2;border-bottom:2px solid #151515;border-radius:0}
.fxbar::after{border:1px solid #151515;border-radius:0;background:#eae8e1}
.fxnav2{border-bottom:2px solid #151515;font-family:${MONO};text-transform:uppercase;color:#151515}
.fxhead{font:900 26px/1.04 ${MONO};letter-spacing:-.022em;text-transform:uppercase;background:#151515;color:#eae8e1;display:inline;padding:2px 0;box-shadow:5px 0 0 #151515,-5px 0 0 #151515}
.fxsub{font-family:${MONO};color:#333}
.fxart{background:repeating-conic-gradient(#151515 0 25%,#eae8e1 0 50%) 50%/5px 5px;filter:contrast(1.35);border-left:2px solid #151515;animation:fxk 5s steps(2,end) infinite}
.fxcta{background:#151515;border-radius:0;font-family:${MONO}}`,
      R(['Printed Matter', 'printedmatter.org'], ['Zine Libraries', 'zinelibraries.info'])),

    I('antidesign', '反设计', 'Anti-design',
      '故意打破所有惯例', 'Every convention broken on purpose',
      '错位网格、冲突字体、诡异配色、非常规交互；必须留一条清晰的主动线，否则只是坏设计而不是反设计。',
      'Off-grid, clashing faces, awkward colour, unconventional interaction. Keep one clear path through — otherwise it is merely bad design.',
      ['打破常规', '不适感', '态度先行'], ['UNCONVENTIONAL', 'AWKWARD', 'ATTITUDE FIRST'],
      C('n0n-site', '???   maybe   later', 'RULES\nare\noptional', '我们知道它不舒服，这就是重点。', 'click ?'),
      `@keyframes fxk{0%,100%{transform:rotate(-3deg) translateX(0)}50%{transform:rotate(4deg) translateX(8px)}}
.fxpage{background:#dfe6c8;border:3px solid #6f28e0;border-radius:0}
.fxbar{background:#f24aa8;border-bottom:3px solid #6f28e0}
.fxbar::after{border:2px solid #6f28e0;border-radius:0;background:#dfe6c8}
.fxnav2{border-bottom:3px solid #6f28e0;font-family:${MONO};color:#6f28e0}
.fxhead{font:400 27px/1.06 ${SERIF};color:#6f28e0;animation:fxk 5.4s ease-in-out infinite;transform-origin:left}
.fxsub{font-family:${MONO};color:#2b2b2b;font-size:9px}
.fxart{background:repeating-linear-gradient(45deg,#f24aa8 0 13px,#dfe6c8 13px 26px);border-left:3px solid #6f28e0}
.fxcta{background:#6f28e0;border-radius:0;font-family:${MONO};transform:rotate(-4deg)}`,
      R(['Cameron’s World', 'cameronsworld.net'], ['Yesterweb 归档', 'yesterweb.org'])),

    I('exptype', '实验字体风', 'Experimental typography',
      '字本身就是图像', 'The letterform is the image',
      '可变字体极端轴值 + 字形变形拉伸叠印 + 破格网格；可读性只保住一个层级即可，其余交给张力。',
      'Extreme variable-font axes, distorted and overprinted glyphs, a broken grid. Only one level needs to stay legible; the rest is tension.',
      ['大胆字体', '图形化布局', '重新想象网页'], ['BOLD TYPE', 'GRAPHIC LAYOUT', 'RETHINK'],
      C('TYPELAB', 'Work   Playground   About', 'GOOD IDEAS\nMAKE NOISE', '好创意需要一点噪音。', '在实验中'),
      `@keyframes fxk{0%,100%{transform:scaleX(1) skewX(0)}50%{transform:scaleX(1.16) skewX(-7deg)}}
.fxpage{background:#f3f3ef;border-radius:0}
.fxhead{font:900 29px/.94 ${SANS};letter-spacing:-.052em;text-transform:uppercase;color:#111;transform-origin:left;animation:fxk 4.8s ${E} infinite}
.fxsub{color:#4a4a44}
.fxart{background:#f3f3ef;position:relative;overflow:hidden;border-left:1px solid #111}
.fxart::before{content:'✳';position:absolute;left:20%;top:14%;font-size:118px;line-height:1;color:#111}
.fxart::after{content:'';position:absolute;left:7%;bottom:15%;width:58%;height:28px;background:#d6ff3d;mix-blend-mode:multiply}
.fxcta{background:#111;border-radius:0}`,
      R(['Typewolf', 'typewolf.com'], ['Fonts In Use', 'fontsinuse.com'], ['Dinamo', 'abcdinamo.com'])),

    /* ── 五、怀旧与未来 ─────────────────────────────── */

    I('retroweb', '复古互联网', 'Retro web / Web 1.0',
      '像 1998 年的网页', 'A page from 1998',
      '系统窗口边框、蓝色带下划线的超链接、表格布局、访客计数器；克制地怀旧，不要真的用 <blink>。',
      'System window chrome, blue underlined links, table layout, a hit counter. Nostalgic on purpose — skip the actual <blink>.',
      ['经典界面', '超链接感', '怀旧氛围'], ['CLASSIC', 'HYPERLINKS', 'NOSTALGIC'],
      C('GoodOldNet', 'Home   Projects   Guestbook', 'Welcome to\nGoodOldNet!', '这是一个关于互联网早期记忆的空间。', '进入站点'),
      `@keyframes fxk{0%,49%{opacity:1}50%,100%{opacity:.22}}
.fxpage{background:#d4d0c8;border:2px solid #808080;border-radius:0;font-family:${SANS}}
.fxbar{background:linear-gradient(#0a246a,#3a6ea5);border-bottom:1px solid #808080;border-radius:0}
.fxbar::before{background:#d4d0c8;box-shadow:9px 0 0 #d4d0c8,18px 0 0 #d4d0c8;border-radius:0;width:8px;height:8px}
.fxbar::after{background:#d4d0c8;border:1px solid #6a6a6a;border-radius:0}
.fxnav2{background:#d4d0c8;border-bottom:1px solid #808080;color:#00007f;text-decoration:underline;font-weight:400}
.fxhead{font:700 23px/1.2 'Times New Roman',${SERIF};color:#00007f;text-decoration:underline}
.fxsub{color:#000;font-size:11px}
.fxart{background:#fff;border-left:2px solid #808080;position:relative}
.fxart::before{content:'';position:absolute;inset:14px;border:1px solid #c0c0c0;background:linear-gradient(160deg,#eef2f7,#dfe6ee)}
.fxart::after{content:'★ under construction';position:absolute;left:22px;bottom:24px;font:400 10px ${MONO};color:#c00;animation:fxk 1.2s steps(1,end) infinite}
.fxcta{background:#d4d0c8;color:#000;border:2px outset #fff;border-radius:0}`,
      R(['Space Jam 1996', 'spacejam.com/1996'], ['Web Design Museum', 'webdesignmuseum.org'], ['Berkshire Hathaway', 'berkshirehathaway.com'])),

    I('y2k', '千禧未来主义', 'Y2K futurism',
      '镀铬、半透明、液态形体', 'Chrome, translucency, liquid forms',
      '金属渐变文字 + 亚克力质感 + 气泡与光晕；冷色高光要有明确的光源方向，斜体是必需的。',
      'Metallic gradient type, acrylic surfaces, bubbles and bloom. Give the cool speculars one consistent light direction — and italics are mandatory.',
      ['镀铬质感', '半透明', '千禧未来感'], ['CHROME', 'TRANSLUCENT', 'LIQUID FORM'],
      C('NOVA', 'Home   Product   Community', 'Good\nThings\nAhead', '更好的未来，正在加载。', '探索未来'),
      `@keyframes fxk{to{background-position:240px 0}}
.fxpage{background:linear-gradient(158deg,#e9f1fc,#dce5f8 48%,#f0e6fb)}
.fxnav2{color:#5c6480}
.fxhead{font:800 italic 30px/1.02 ${SANS};letter-spacing:-.032em;background:linear-gradient(100deg,#78849e,#fff 20%,#95a3c2 40%,#fff 60%,#8895b3);background-size:240px 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:fxk 3.8s linear infinite}
.fxsub{color:#5c6480}
.fxart{background:radial-gradient(circle at 32% 28%,#fff,#d3e2f9 32%,#c4b6ee 64%,#9ed6e8);box-shadow:inset 0 0 50px rgba(255,255,255,.7),inset 0 -20px 46px rgba(90,80,160,.24)}
.fxcta{background:linear-gradient(#96abe0,#5f72ad);border:1px solid #fff;box-shadow:0 3px 10px rgba(70,90,150,.32)}`,
      R(['Web Design Museum · Y2K', 'webdesignmuseum.org/gallery'], ['Poolsuite', 'poolsuite.net'])),

    I('retrofuturism', '复古未来主义', 'Retrofuturism',
      '上世纪想象的未来', 'The future as the last century imagined it',
      '太空时代插画 + 橙棕配色 + 圆角科技造型；字体用宽体几何无衬线，别用现代科技风的窄体。',
      'Space-age illustration, burnt-orange palette, rounded techno forms, wide geometric sans. Never a modern narrow tech face.',
      ['复古科幻', '太空时代', '永不过时的想象'], ['VINTAGE FUTURE', 'SPACE AGE', 'TIMELESS'],
      C('ORBITAL', 'Mission   Technology   Shop', 'A BRIGHTER\nTOMORROW\nTOGETHER', '跨越时代，抵达更好的世界。', '开启旅程'),
      `@keyframes fxk{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-7px) rotate(1deg)}}
.fxpage{background:#2c1e1a;border-color:#4a332b}
.fxbar{background:#3b2822;border-bottom-color:#4a332b}
.fxbar::after{background:#4a332b;border-color:#5c4034}
.fxnav2{border-bottom-color:#4a332b;color:#e8cdae}
.fxhead{font:800 26px/1.06 ${SANS};letter-spacing:.012em;color:#f2dcb8;text-transform:uppercase}
.fxsub{color:#c0a184}
.fxart{background:radial-gradient(circle at 62% 32%,#eb9550,#b4543a 42%,#5c2a24 76%,#3a1c18);position:relative}
.fxart::after{content:'';position:absolute;left:23%;top:21%;width:58px;height:23px;border-radius:50%;background:#f7e8cd;box-shadow:0 0 28px rgba(247,232,205,.7);animation:fxk 5.4s ease-in-out infinite}
.fxcta{background:linear-gradient(#eb9550,#d97b3c);color:#2c1e1a;border-radius:999px}`,
      R(['NASA Graphics Standards Manual', 'standardsmanual.com'], ['Atomic Ranch', 'atomic-ranch.com'])),

    I('vaporwave', '蒸汽波', 'Vaporwave',
      '粉紫落日与网格地平线', 'A magenta sunset over a grid horizon',
      '粉紫青三色 + 透视网格地面 + 全角标题 + 石膏像；刻意的 VHS 噪点与色偏，标题要有 RGB 分离。',
      'Magenta/cyan/violet, a perspective grid floor, full-width type, plaster busts, deliberate VHS noise and an RGB-split headline.',
      ['粉紫落日', '复古电子', '梦核'], ['SUNSET', 'RETRO ELECTRONIC', 'DREAMCORE'],
      C('ＮＥＷ ＷＡＶＥ', 'mall   radio   about', 'ＦＵＴＵＲＥ\nＮＯＳＴＡＬＧＩＡ', '一段没有发生过的记忆。', 'ＥＮＴＥＲ'),
      `@keyframes fxk{to{background-position:0 42px}}
.fxpage{background:linear-gradient(180deg,#281746,#5c2a6b 58%,#c94f8a)}
.fxbar{background:#1f1338;border-bottom-color:#4a2a6b}
.fxbar::after{background:#2d1b4d;border-color:#4a2a6b}
.fxnav2{border-bottom-color:#4a2a6b;color:#8ee6f0}
.fxhead{font:700 25px/1.32 ${SANS};letter-spacing:.06em;color:#ffe9f6;text-shadow:2px 0 #ff4fa3,-2px 0 #4fe6ff}
.fxsub{color:#d9bdea}
.fxart{background:linear-gradient(180deg,#ffa8d6 0 44%,#2a1a4a 44%),repeating-linear-gradient(0deg,rgba(142,230,240,.68) 0 1px,transparent 1px 21px);background-blend-mode:screen;animation:fxk 2.6s linear infinite}
.fxcta{background:linear-gradient(#ff5ba9,#e0357f);border-radius:0;letter-spacing:.1em}`,
      R(['Poolsuite', 'poolsuite.net'], ['Aesthetics Wiki', 'aesthetics.fandom.com/wiki/Vaporwave'])),

    I('pixel', '像素游戏风', 'Pixel art',
      '每个像素都是手放的', 'Every pixel placed by hand',
      '固定像素网格 + image-rendering:pixelated + 有限调色板；缩放必须整数倍，动画走 steps() 不走补间。',
      'A fixed pixel grid, image-rendering: pixelated, a limited palette. Scale by whole integers, and animate with steps() — never tween.',
      ['复古', '有趣', '按下开始键'], ['RETRO', 'PLAYFUL', 'PRESS START'],
      C('PIXELER', 'Start   Map   Shop', 'SMALL PIXELS\nBIG DREAMS', '像素不只是复古，更是一种想象力。', 'START GAME'),
      `@keyframes fxk{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
.fxpage{background:#191930;border:3px solid #f4f4f2;border-radius:0;image-rendering:pixelated}
.fxbar{background:#f4f4f2;border-radius:0;border-bottom:3px solid #191930}.fxbar::before{background:#191930;box-shadow:9px 0 0 #191930,18px 0 0 #191930;border-radius:0}
.fxbar::after{background:#191930;border:0;border-radius:0}
.fxnav2{border-bottom:3px solid #f4f4f2;color:#f9d84a;font-family:${MONO};text-transform:uppercase}
.fxhead{font:700 22px/1.24 ${MONO};color:#f9d84a;letter-spacing:.02em;text-shadow:3px 3px 0 #d1372f}
.fxsub{color:#9ad1f5;font-family:${MONO};font-size:10px}
.fxart{background:linear-gradient(180deg,#4bb3e8 0 60%,#4a9f3f 60%);border-left:3px solid #f4f4f2;position:relative}
.fxart::after{content:'';position:absolute;left:42%;bottom:32%;width:18px;height:18px;background:#f4f4f2;box-shadow:0 -18px 0 #d1372f,18px 0 0 #f9d84a,-18px 18px 0 #4a9f3f;animation:fxk 1.2s steps(2,end) infinite}
.fxcta{background:#d1372f;border-radius:0;font-family:${MONO}}`,
      R(['Lospec', 'lospec.com'], ['Pixel Joint', 'pixeljoint.com'])),

    I('memphis', '孟菲斯风', 'Memphis',
      '折线、圆点、撞色几何', 'Squiggles, dots, clashing geometry',
      '80 年代孟菲斯派：饱和撞色 + 波浪与网格图案 + 随机散布几何；构图故意不对称，但底色必须统一。',
      'The 80s Memphis school — clashing saturated colour, squiggle and grid patterns, scattered geometry, deliberately asymmetric over one unifying ground.',
      ['趣味活泼', '大胆配色', '打破常规'], ['PLAYFUL', 'BOLD COLOURS', 'BREAK THE RULES'],
      C('MEMPHIS', 'Home   Inspiration   Community', 'MAKE\nCREATIVE\nFUN AGAIN', '让创意再次变得有趣！', '发现更多'),
      `@keyframes fxk{0%,100%{transform:translate(0,0)}50%{transform:translate(6px,-6px)}}
.fxpage{background:#fae0e9}
.fxnav2{color:#3a2028}
.fxhead{font:900 26px/1.02 ${SANS};letter-spacing:-.032em;text-transform:uppercase;color:#1c1c1c}
.fxsub{color:#4a2b38}
.fxart{background:#fae0e9;position:relative;overflow:hidden}
.fxart::before{content:'';position:absolute;inset:13% 11%;background:repeating-linear-gradient(90deg,#3ec5c9 0 3px,transparent 3px 13px),repeating-linear-gradient(0deg,#3ec5c9 0 3px,transparent 3px 13px);animation:fxk 5.4s ease-in-out infinite}
.fxart::after{content:'';position:absolute;right:13%;top:16%;width:0;height:0;border-left:27px solid transparent;border-right:27px solid transparent;border-bottom:46px solid #ffd23f;transform:rotate(18deg)}
.fxcta{background:#ffd23f;color:#1c1c1c;border-radius:999px}`,
      R(['Memphis Milano', 'memphis-milano.com'], ['Ettore Sottsass 档案', 'sottsass.it'])),

    /* ── 六、科技与产品 ─────────────────────────────── */

    I('darktech', '黑色科技极简', 'Dark tech minimal',
      '黑底、细渐变、一条发光的线', 'Black ground, subtle gradients, one glowing line',
      '近黑背景 + 极低饱和文字 + 单一冷光焦点；渐变必须细，一旦浓就变成廉价科技感。边框用 1px 微亮。',
      'Near-black ground, desaturated text, one cold light focus. Keep gradients faint — heavy ones read as cheap tech. Borders are 1px, barely lit.',
      ['深色极简', '细腻渐变', '现代科技感'], ['DARK MINIMAL', 'SUBTLE GRADIENT', 'MODERN TECH'],
      C('MindFlow', 'Product   Plans   Pricing', '让思考\n更进一步', '从灵感到成果，助你创造更多可能。', '免费体验'),
      `@keyframes fxk{0%,100%{opacity:.3;transform:scaleX(.55)}50%{opacity:1;transform:scaleX(1)}}
.fxpage{background:#0b0c0e;border-color:#1c1e23}
.fxbar{background:#0f1114;border-bottom-color:#1c1e23}
.fxbar::after{background:#15181c;border-color:#22252b}
.fxnav2{border-bottom-color:#1c1e23;color:#9aa0a8}
.fxhead{font:600 27px/1.16 ${SANS};letter-spacing:-.032em;color:#f2f3f5}
.fxsub{color:#82878f}
.fxart{background:radial-gradient(130% 95% at 62% 112%,#1e2d3a,#0b0c0e 62%);position:relative;overflow:hidden}
.fxart::before{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.045),transparent 40%)}
.fxart::after{content:'';position:absolute;left:13%;right:13%;top:44%;height:2px;border-radius:2px;background:linear-gradient(90deg,transparent,#84dcee,transparent);box-shadow:0 0 26px #84dcee;animation:fxk 5s ease-in-out infinite}
.fxcta{background:#f2f3f5;color:#0b0c0e}`,
      R(['Linear', 'linear.app'], ['Vercel', 'vercel.com'], ['Resend', 'resend.com'])),

    I('bento', '便当盒布局', 'Bento grid',
      '大小不一的方块拼满一屏', 'Unequal tiles tiling the whole screen',
      '一套统一圆角与间距的模块网格，每格一个信息单元；格子跨列跨行制造节奏，禁止格内再分栏。',
      'A modular grid with one radius and one gap; one idea per tile. Rhythm comes from spans — never sub-divide a tile.',
      ['模块化', '灵活', '一览无余'], ['MODULAR', 'FLEXIBLE', 'ALL IN ONE PLACE'],
      C('Tasko', 'Product   Templates   Pricing', '高效生活\n从有序开始', '让每一天都更专注、更有意义。', '开始使用'),
      `@keyframes fxk{0%{opacity:0;transform:scale(.94)}100%{opacity:1;transform:none}}
.fxpage{background:#f2f3ef}
.fxhead{font:700 26px/1.16 ${SANS};letter-spacing:-.03em}
.fxart{background:#eeefe9;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:9px;padding:13px}
.fxart::before,.fxart::after{content:'';border-radius:11px;background:linear-gradient(160deg,#fff,#fafaf7);border:1px solid #e6e7e0;box-shadow:0 1px 2px rgba(40,50,35,.05);animation:fxk 1.5s ${E} both}
.fxart::before{grid-column:1/3;animation-delay:.1s}.fxart::after{animation-delay:.3s}
.fxcta{background:#23232f}`,
      R(['Bento Grids 集合', 'bentogrids.com'], ['Raycast', 'raycast.com'])),

    I('dashboard', '数据看板风', 'Dashboard',
      '一屏之内看完全部指标', 'Every metric on one screen',
      '卡片化 KPI + 图表网格 + 状态色（升/降）；密度高但要有明确的视觉层级与对齐基线，数字用等宽。',
      'KPI cards, a chart grid, semantic up/down colour. High density still needs one hierarchy, one baseline, and tabular numerals.',
      ['数据分析', '数据驱动', '清晰洞察'], ['ANALYTICS', 'DATA-DRIVEN', 'CLEAR INSIGHTS'],
      C('DataView', 'Product   Cases   Pricing', '用数据\n驱动更好的决策', '从数据中发现机会，提升业务增长。', '免费试用'),
      `@keyframes fxk{0%{transform:scaleY(.18)}100%{transform:scaleY(1)}}
.fxpage{background:#f7f8fa}
.fxbar{background:#fff}.fxnav2{background:#fff;border-bottom-color:#eceef2;color:#101828}
.fxhead{font:700 26px/1.18 ${SANS};letter-spacing:-.03em;color:#101828}
.fxsub{color:#667085}
.fxart{background:#fff;border-left:1px solid #eceef2;display:flex;align-items:flex-end;gap:8px;padding:24px 20px}
.fxart::before,.fxart::after{content:'';flex:1;border-radius:4px 4px 2px 2px;transform-origin:bottom;animation:fxk 2.6s ${E} infinite alternate}
.fxart::before{height:56%;background:linear-gradient(#4f8bf7,#2e6ff2)}
.fxart::after{height:88%;background:linear-gradient(#a9c6fb,#7aa5f8);animation-delay:.26s}
.fxcta{background:#2e6ff2;border-radius:6px}`,
      R(['Grafana', 'grafana.com'], ['Tremor', 'tremor.so'], ['Observable', 'observablehq.com'])),

    I('material', '材料设计风', 'Material design',
      '纸片有厚度，光从上方来', 'Sheets with elevation, light from above',
      '海拔阴影体系 + 主色/次色/表面色 token + 涟漪反馈；阴影只表示层级，不当装饰。',
      'An elevation shadow system, primary/secondary/surface tokens, ripple feedback. Shadows encode depth, never decoration.',
      ['简洁清晰', '组件化系统', '以人为本'], ['CLEAN', 'COMPONENTS', 'PEOPLE FIRST'],
      C('MaterialX', 'Product   Solutions   Docs', '更好的产品\n从清晰开始', '现代化的设计系统，帮团队更快构建产品。', '立即体验'),
      `@keyframes fxk{0%,100%{box-shadow:0 1px 3px rgba(26,35,126,.16)}50%{box-shadow:0 10px 24px rgba(26,35,126,.24)}}
.fxpage{background:#f5f6fb}
.fxbar{background:#fff}.fxnav2{background:#fff;border-bottom-color:#e8eaf6;color:#1a237e}
.fxhead{font:600 26px/1.2 ${SANS};letter-spacing:-.022em;color:#1a237e}
.fxsub{color:#5c6bc0}
.fxart{background:linear-gradient(165deg,#f1f4fd,#e6ebfa);position:relative}
.fxart::after{content:'';position:absolute;left:15%;top:22%;right:15%;height:54%;border-radius:12px;background:#fff;animation:fxk 5s ease-in-out infinite}
.fxcta{background:#3949ab;border-radius:20px}`,
      R(['Material 3', 'm3.material.io'], ['Material Symbols', 'fonts.google.com/icons'])),

    I('terminalui', '程序员终端风', 'Terminal UI',
      '整站像一个终端会话', 'The whole site is a terminal session',
      '等宽字体 + 命令行提示符 + 光标 + 制表符边框；配色沿用 solarized / gruvbox / nord 这类既成主题，别自创。',
      'Monospace, a prompt, a cursor, box-drawing frames. Borrow an established scheme — solarized, gruvbox, nord — never invent one.',
      ['代码氛围', '极简高效', '为创造者而生'], ['CODE', 'MINIMAL', 'FOR BUILDERS'],
      C('> DevTerminal', 'docs   pricing   community', 'Build\nSomething\nAmazing_', '面向现代开发者的终端工具集。', '$ npm i'),
      `@keyframes fxk{0%,49%{opacity:1}50%,100%{opacity:0}}
.fxpage{background:#10161a;border-color:#22303a}
.fxbar{background:#151d23;border-bottom-color:#22303a}
.fxbar::after{background:#0d1317;border-color:#22303a}
.fxnav2{border-bottom-color:#22303a;color:#7d8f9c;font-family:${MONO}}
.fxhead{font:700 25px/1.3 ${MONO};color:#a9da6e;letter-spacing:-.012em}
.fxhead::after{content:'▊';color:#a9da6e;animation:fxk 1.06s steps(1,end) infinite}
.fxsub{color:#8b9aa6;font-family:${MONO};font-size:10px}
.fxart{background:linear-gradient(160deg,#0d1216,#0a0f13);border-left:1px solid #22303a;position:relative;font-family:${MONO}}
.fxart::after{content:'1  $ npm create app\\A 2  ✓ resolving deps\\A 3  ✓ ready on :3000\\A 4  $ _';white-space:pre;position:absolute;left:16px;top:20px;font:400 9px/2.05 ${MONO};color:#6f8a9a}
.fxcta{background:#a9da6e;color:#10161a;border-radius:4px;font-family:${MONO}}`,
      R(['Charm', 'charm.sh'], ['Warp', 'warp.dev'], ['Ghostty', 'ghostty.org'])),

    I('gradientmesh', '渐变网格风', 'Gradient mesh',
      '几团颜色互相渗透', 'Colour blooms bleeding into each other',
      '多个 radial-gradient 叠加 + 大半径柔化 + 缓慢位移；颜色数控制在 3–4 个，超了就变脏。',
      'Stack radial gradients, soften them wide, drift slowly. Three or four hues maximum — more turns muddy.',
      ['丰富色彩', '沉浸氛围', '富有表现力'], ['COLOURFUL', 'IMMERSIVE', 'EXPRESSIVE'],
      C('Nova', 'Product   Use cases   Company', 'Create\nWithout Limits', '用 AI，释放更多可能。', '免费开始'),
      `@keyframes fxk{0%,100%{background-position:0% 50%,100% 18%,38% 100%}50%{background-position:42% 18%,58% 82%,8% 38%}}
.fxpage{background:#fbfaff}
.fxhead{font:700 28px/1.14 ${SANS};letter-spacing:-.032em;color:#2f2a48}
.fxsub{color:#6d668f}
.fxart{background:radial-gradient(closest-side,#f2acd2,transparent),radial-gradient(closest-side,#a9c5f2,transparent),radial-gradient(closest-side,#cbb2f7,transparent);background-size:152% 152%,142% 142%,162% 162%;background-repeat:no-repeat;background-color:#f6f2fc;animation:fxk 13s ease-in-out infinite}
.fxcta{background:linear-gradient(#7d5ce8,#6440d8);border-radius:8px;box-shadow:0 6px 18px rgba(100,64,216,.3)}`,
      R(['Stripe', 'stripe.com'], ['Mesh Gradient 工具', 'meshgradient.in'])),

    I('immersive3d', '3D 沉浸式', '3D immersive',
      '整页就是一个可进入的场景', 'The page is a scene you enter',
      'WebGL 场景 + 滚动驱动相机 + DOM 只放少量文字；必须给静态首帧与降级路径，否则弱设备直接白屏。',
      'A WebGL scene with a scroll-driven camera and very little DOM text. Always ship a static first frame and a fallback, or weak devices see white.',
      ['三维视角', '沉浸式体验', '交互感'], ['THREE DIMENSION', 'IMMERSIVE', 'INTERACTIVE'],
      C('HORIZON', 'Explore   Worlds   Pricing', '走进\n更大的世界', '3D 沉浸式体验，让想象触手可及。', '开启探索'),
      `@keyframes fxk{0%,100%{transform:perspective(620px) rotateY(-10deg) translateZ(0)}50%{transform:perspective(620px) rotateY(10deg) translateZ(16px)}}
.fxpage{background:linear-gradient(180deg,#eaeff6,#f7f3ed)}
.fxhead{font:300 29px/1.14 ${SANS};letter-spacing:.008em;color:#2c3440}
.fxsub{color:#6a7280}
.fxart{background:linear-gradient(170deg,#cfdeec,#f0e8d9 58%,#cbdac7);position:relative;perspective:620px}
.fxart::after{content:'';position:absolute;left:25%;top:28%;width:48%;height:42%;border-radius:14px;background:linear-gradient(140deg,#fff,#cbd7c6);box-shadow:0 22px 36px rgba(44,52,64,.3),inset 0 1px 0 #fff;animation:fxk 7.5s ease-in-out infinite}
.fxcta{background:#2c3440;border-radius:999px}`,
      R(['Bruno Simon', 'bruno-simon.com'], ['Lusion', 'lusion.co'], ['Three.js 示例', 'threejs.org/examples'])),

    I('lowpoly', '低多边形 3D 风', 'Low-poly 3D',
      '看得见每一个三角面', 'Every triangle stays visible',
      '刻意保留低面数 + 平面着色（flat shading）+ 明确的面间明暗差；绝不开平滑法线，那会毁掉整个语言。',
      'Keep the poly count low, use flat shading, let adjacent faces differ clearly. Never smooth the normals — that kills the whole language.',
      ['趣味感', '现代感', '互动体验'], ['PLAYFUL', 'MODERN', 'INTERACTIVE'],
      C('ECO PLANET', 'Explore   Animals   About', 'SMALL ACTIONS\nBIG CHANGE', '小小行动，让地球更好。', '探索星球'),
      `@keyframes fxk{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
.fxpage{background:#eaf4fb}
.fxhead{font:800 25px/1.1 ${SANS};letter-spacing:-.022em;color:#1c3a52;text-transform:uppercase}
.fxsub{color:#5d7f97}
.fxart{background:linear-gradient(180deg,#93d3f2 0 56%,#71b165 56%);position:relative;overflow:hidden}
.fxart::before{content:'';position:absolute;left:17%;bottom:30%;width:0;height:0;border-left:42px solid transparent;border-right:42px solid transparent;border-bottom:60px solid #eef4f7;filter:drop-shadow(3px 2px 0 rgba(30,60,80,.14));animation:fxk 5.4s ease-in-out infinite}
.fxart::after{content:'';position:absolute;right:15%;bottom:28%;width:0;height:0;border-left:31px solid transparent;border-right:31px solid transparent;border-bottom:46px solid #4f8f68}
.fxcta{background:#2b7a4b;border-radius:999px}`,
      R(['Sketchfab', 'sketchfab.com'], ['Poly Pizza', 'poly.pizza'])),

    I('isometric', '等距插画风', 'Isometric illustration',
      '30° 斜轴上的小世界', 'A small world on a 30° axis',
      '固定 30° 等轴投影、无透视收缩、三面明暗固定；所有物件共用一套光照与网格，一处破轴全盘就散。',
      'A fixed 30° axonometric projection, no perspective convergence, three constant face values. One light and one grid for everything — one broken axis ruins it.',
      ['结构清晰', '信息有序', '适合复杂内容'], ['STRUCTURE', 'SYSTEMATIC', 'SCALABLE'],
      C('Hexo', 'Product   Solutions   Docs', 'Build\nSmarter\nTogether.', '用更好的工具，构建更高效的团队。', '免费开始'),
      `@keyframes fxk{0%,100%{transform:rotateX(58deg) rotateZ(42deg) translateZ(0)}50%{transform:rotateX(58deg) rotateZ(48deg) translateZ(12px)}}
.fxpage{background:#f3f6fc}
.fxhead{font:800 26px/1.1 ${SANS};letter-spacing:-.03em;color:#1f2a44}
.fxsub{color:#63708c}
.fxart{background:linear-gradient(165deg,#eef2fa,#e2e9f6);position:relative;perspective:820px;overflow:hidden}
.fxart::after{content:'';position:absolute;left:26%;top:28%;width:50%;height:46%;background:linear-gradient(140deg,#9cbdf7,#4a6fd0);transform-style:preserve-3d;box-shadow:0 24px 0 -4px rgba(31,42,68,.14);animation:fxk 6.4s ease-in-out infinite}
.fxcta{background:#2f5bd8;border-radius:8px}`,
      R(['Isoflow', 'isoflow.io'], ['Icons8 Isometric', 'icons8.com/illustrations'])),

    I('cyberpunk', '赛博朋克', 'Cyberpunk',
      '霓虹、高密度信息、雨夜都市', 'Neon, dense information, a wet city at night',
      '深色底 + 两种霓虹色（品红/青）+ 扫描线与故障；信息要"过载"，但正文仍需 4.5:1 对比。',
      'Dark ground, two neon hues (magenta/cyan), scanlines and glitch. Overload the information — but keep body text at 4.5:1.',
      ['霓虹都市', '高密度信息', '未来都市感'], ['NEON CITY', 'DENSE INFO', 'TECH-NOIR'],
      C('NEONGRID', 'City   Products   Solutions', '连接\n下一个现实', '技术让更多可能发生。', '进入系统'),
      `@keyframes fxk{0%,100%{text-shadow:0 0 12px #ff2e8a,0 0 26px rgba(255,46,138,.45)}47%{text-shadow:0 0 4px #ff2e8a}53%{text-shadow:none}}
.fxpage{background:#0a0912;border-color:#241d3a}
.fxbar{background:#110e1e;border-bottom-color:#241d3a}
.fxbar::after{background:#171331;border-color:#2e2450}
.fxnav2{border-bottom-color:#241d3a;color:#7de3f4}
.fxhead{font:800 27px/1.12 ${SANS};letter-spacing:-.022em;color:#ff2e8a;animation:fxk 4.4s steps(1,end) infinite}
.fxsub{color:#a3adc8}
.fxart{background:radial-gradient(120% 90% at 76% 8%,#2a1a52,#0a0912 66%);border-left:1px solid #241d3a;position:relative}
.fxart::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(180deg,rgba(125,227,244,.15) 0 1px,transparent 1px 4px)}
.fxart::after{content:'';position:absolute;left:18%;right:18%;bottom:24%;height:1px;background:#7de3f4;box-shadow:0 0 22px #7de3f4,0 -46px 0 #ff2e8a,0 -46px 26px #ff2e8a}
.fxcta{background:transparent;color:#7de3f4;border:1px solid #7de3f4;border-radius:0}`,
      R(['Cyberpunk 2077', 'cyberpunk.net'], ['Ghost in the Shell 档案', 'production-ig.co.jp'])),

    /* ── 七、图像与叙事 ─────────────────────────────── */

    I('monophoto', '黑白摄影排版风', 'Monochrome photography',
      '照片去色，字压上去', 'Desaturate the photo, set type over it',
      '全站灰度 + 一张主图占 60% 以上 + 大衬线标题压图；只允许一个彩色元素破局，那就是 CTA。',
      'Full greyscale, one image over 60% of the frame, a serif headline across it. Exactly one colour element may break it — the CTA.',
      ['强烈视觉', '情绪表达', '永不过时'], ['BOLD', 'EXPRESSIVE', 'EDITORIAL'],
      C('NULL', 'Work   About   Journal', 'PEOPLE\nSTORIES\nALWAYS', 'Photography for a more human world.', 'EXPLORE'),
      `@keyframes fxk{0%,100%{filter:grayscale(1) contrast(1.02)}50%{filter:grayscale(1) contrast(1.24)}}
.fxpage{background:#fcfcfc;border-radius:0}.fxbar{border-radius:0;background:#f3f3f3}
.fxnav2{letter-spacing:.09em;text-transform:uppercase;font-size:9px;color:#333}
.fxhead{font:700 28px/1.02 ${SERIF};letter-spacing:-.022em;color:#111;text-transform:uppercase}
.fxsub{color:#6b6b6b;font-size:10px;letter-spacing:.04em}
.fxart{background:radial-gradient(130% 110% at 34% 22%,#e4e4e4,#8f8f8f 52%,#2e2e2e);animation:fxk 9s ease-in-out infinite}
.fxcta{background:transparent;color:#111;border:1px solid #111;border-radius:0;letter-spacing:.1em}`,
      R(['Magnum Photos', 'magnumphotos.com'], ['Aperture', 'aperture.org'])),

    I('fashion', '时尚大片风', 'Fashion editorial',
      '像时装杂志的封面', 'A fashion cover, not a homepage',
      '超大细衬线标题压人像 + 极少 UI + 大量出血图；导航退成一行小字，CTA 只是一条下划线。',
      'An oversized light serif over a portrait, almost no UI, full-bleed imagery. The nav shrinks to one small line; the CTA is just an underline.',
      ['优雅气质', '强烈视觉', '现代态度'], ['ELEGANCE', 'VISUAL IMPACT', 'MODERN ATTITUDE'],
      C('VELVET', 'Fashion   Beauty   Culture', 'MODERN\nBEAUTY', '当代女性的多重可能。', 'READ'),
      `@keyframes fxk{0%,100%{transform:scale(1.02)}50%{transform:scale(1.07)}}
.fxpage{background:#f0ede8;border-radius:0}
.fxbar{border-radius:0;background:#e7e3dd}
.fxnav2{letter-spacing:.11em;text-transform:uppercase;font-size:9px;font-weight:400;color:#3a352e}
.fxhead{font:300 31px/1.02 ${SERIF};letter-spacing:-.008em;color:#1a1a1a;text-transform:uppercase}
.fxsub{color:#6f6a63;font-size:10px;letter-spacing:.05em}
.fxart{background:radial-gradient(120% 100% at 40% 18%,#ddd4c9,#9a9186 54%,#464038);animation:fxk 10s ease-in-out infinite}
.fxcta{background:transparent;color:#1a1a1a;border-bottom:1px solid #1a1a1a;border-radius:0;padding:3px 0;letter-spacing:.13em}`,
      R(['SSENSE', 'ssense.com'], ['Vogue', 'vogue.com'], ['Dazed', 'dazeddigital.com'])),

    I('collage', '拼贴风', 'Collage / cut-paste',
      '像手撕纸片贴出来的版面', 'Torn paper, taped down',
      '纸质纹理 + 撕边遮罩 + 轻微旋转与投影 + 手写标注；每片素材角度不同才有拼贴感，白色缝隙要清脆。',
      'Paper texture, torn-edge masks, slight rotations with shadows, handwritten notes. Vary every angle and keep the white gutters crisp.',
      ['剪贴', '拼合', '发现新的视角'], ['CUT', 'PASTE', 'A NEW PERSPECTIVE'],
      C('Paper&Co.', 'Story   Product   Journal', '在平凡的日子里\n收集美好', '用拼贴的方式，记录生活里的确幸。', '浏览故事'),
      `@keyframes fxk{0%,100%{transform:rotate(-2.4deg)}50%{transform:rotate(1.4deg)}}
.fxpage{background:#f1e9dc}
.fxhead{font:700 25px/1.24 ${SERIF};color:#2f2a22}
.fxsub{color:#6b6252}
.fxart{background:#e4dac8;position:relative;overflow:hidden}
.fxart::before{content:'';position:absolute;left:11%;top:15%;width:54%;height:46%;background:linear-gradient(140deg,#c1cbaf,#8d9c7c);box-shadow:0 7px 16px rgba(47,42,34,.26);animation:fxk 6.4s ease-in-out infinite}
.fxart::after{content:'';position:absolute;right:9%;bottom:13%;width:42%;height:40%;background:#fcf8f0;border:1px solid #ded3bf;transform:rotate(4deg);box-shadow:0 6px 14px rgba(47,42,34,.22)}
.fxcta{background:#2f2a22}`,
      R(['Mailchimp', 'mailchimp.com'], ['NOWNESS', 'nowness.com'])),

    I('scrollytelling', '叙事滚动风', 'Scrollytelling',
      '滚动就是翻页', 'Scrolling is turning the page',
      '滚动位置驱动章节切换：sticky 画面 + 递进文字；每屏只推进一个信息，进度必须可见。',
      'Scroll position drives chapters — a sticky visual with advancing text. One idea per screen, and always show progress.',
      ['故事性', '沉浸感', '向下探索更多'], ['STORY', 'IMMERSION', 'SCROLL FURTHER'],
      C('HORIZON', 'Story   Places   People', 'A Wider\nTomorrow', '每一次出发，都是为了与更大的自己相遇。', 'SCROLL'),
      `@keyframes fxk{0%{transform:translateY(14px);opacity:0}28%,72%{transform:none;opacity:1}100%{transform:translateY(-14px);opacity:0}}
.fxpage{background:#0e1316;border-color:#232b30}
.fxbar{background:#131a1e;border-bottom-color:#232b30}
.fxbar::after{background:#182126;border-color:#28323a}
.fxnav2{border-bottom-color:#232b30;color:#a8b2b8}
.fxhead{font:400 28px/1.16 ${SERIF};color:#f1f3f4;animation:fxk 6.4s ${E} infinite}
.fxsub{color:#8e989e}
.fxart{background:linear-gradient(180deg,#526c7c,#1a2226 72%);position:relative}
.fxart::before{content:'';position:absolute;inset:0;background:radial-gradient(80% 50% at 50% 6%,rgba(255,255,255,.22),transparent 70%)}
.fxart::after{content:'';position:absolute;left:50%;bottom:18px;width:1px;height:38px;background:linear-gradient(#f1f3f4,transparent)}
.fxcta{background:transparent;color:#f1f3f4;border:1px solid #4d5f69;border-radius:999px;letter-spacing:.1em}`,
      R(['The Pudding', 'pudding.cool'], ['NYT Interactive', 'nytimes.com/interactive'], ['Reuters Graphics', 'reuters.com/graphics'])),

    I('splitscreen', '分屏构成风', 'Split screen',
      '一半字，一半图，中缝就是版式', 'Half type, half image — the seam is the layout',
      '50/50 或 40/60 硬分割 + 两侧独立滚动或对比材质；分割线位置全站保持一致，缝隙不加圆角。',
      'A hard 50/50 or 40/60 split, each side its own material or scroll. Keep the seam in the same place site-wide, and never round it.',
      ['对比构成', '双重视角', '平衡布局'], ['CONTRAST', 'DUAL PERSPECTIVE', 'BALANCE'],
      C('BORDER', 'Work   Studio   News', 'IDEAS\nWITHOUT\nBORDERS', '打破边界的创意。', "Let's talk"),
      `@keyframes fxk{0%,100%{transform:translateX(0)}50%{transform:translateX(-6px)}}
.fxpage{background:#f5f3ee;border-radius:0;grid-template-columns:1fr 50%}
.fxbar{border-radius:0;background:#eae7e0}
.fxhead{font:800 27px/1.02 ${SANS};letter-spacing:-.042em;text-transform:uppercase;color:#1c1c1c}
.fxsub{color:#55524b}
.fxart{background:radial-gradient(120% 100% at 30% 16%,#c6c2b9,#84817a 56%,#4f4c46);border-left:1px solid #1c1c1c;animation:fxk 7.4s ease-in-out infinite}
.fxcta{background:#1c1c1c;border-radius:0}`,
      R(['Sennep', 'sennep.com'], ['Awwwards 分屏合集', 'awwwards.com/websites/split-screen'])),

    I('abstractgeo', '抽象几何风', 'Abstract geometry',
      '几何形当图像用', 'Geometry standing in for imagery',
      '大块几何形 + 一个饱和色 + 图形与字重叠；形体裁切要跨出容器边界才有张力。',
      'Big geometric masses, one saturated hue, shapes overlapping the type. Let forms bleed past the container edge or the tension dies.',
      ['创意表达', '几何美学', '新的视角'], ['CREATIVE', 'GEOMETRIC', 'NEW PERSPECTIVES'],
      C('SHAPE', 'Work   Studio   Services', 'GOOD IDEAS\nSHAPE\nTOMORROW', '用设计，创造更好的可能。', "LET'S TALK"),
      `@keyframes fxk{to{transform:rotate(360deg)}}
.fxpage{background:#f8f8f6;border-radius:0}
.fxhead{font:800 27px/1.02 ${SANS};letter-spacing:-.042em;text-transform:uppercase;color:#111}
.fxsub{color:#4d4d47}
.fxart{background:#f8f8f6;position:relative;overflow:hidden;border-left:1px solid #ebebe7}
.fxart::before{content:'';position:absolute;left:-12%;top:15%;width:64%;aspect-ratio:1;border-radius:50%;background:linear-gradient(140deg,#2f6bd0,#12459c);clip-path:inset(0 0 0 50%);animation:fxk 28s linear infinite}
.fxart::after{content:'';position:absolute;right:7%;bottom:-8%;width:46%;height:58%;background:linear-gradient(160deg,#d2d2cd,#b9b9b3)}
.fxcta{background:#111;border-radius:0}`,
      R(['Pentagram', 'pentagram.com'], ['Bureau Borsche', 'bureauborsche.com'])),

    I('kineticposter', '动态海报风', 'Kinetic poster',
      '一张会动的海报当首页', 'A poster that moves, used as a homepage',
      '整屏一张海报构图 + 循环动效（字距/位移/遮罩）+ 极少导航；所有节奏对齐同一个循环长度。',
      'One poster composition filling the viewport, a looping motion (tracking, shift, mask), almost no nav. All timing on one loop length.',
      ['海报构图', '循环动效', '一个视觉事件'], ['POSTER', 'LOOPING MOTION', 'ONE EVENT'],
      C('KINETIC', 'index   info', 'MOTION\nIS THE\nMESSAGE', '一个循环，说完一件事。', 'PLAY'),
      `@keyframes fxk{0%,100%{letter-spacing:-.05em;transform:translateY(0)}50%{letter-spacing:.06em;transform:translateY(-6px)}}
.fxpage{background:#111;border-radius:0;border-color:#111}
.fxbar{background:#191919;border-bottom-color:#262626;border-radius:0}
.fxbar::after{background:#232323;border-color:#333}
.fxnav2{border-bottom-color:#262626;color:#8f8f8f;font-family:${MONO};text-transform:uppercase}
.fxhead{font:900 29px/.94 ${SANS};text-transform:uppercase;color:#f5f5f2;animation:fxk 4.4s ${E} infinite}
.fxsub{color:#9a9a96}
.fxart{background:radial-gradient(120% 110% at 30% 18%,#e4ff5c,#c7f01f 62%,#a8cf12);position:relative;overflow:hidden}
.fxart::after{content:'';position:absolute;left:50%;top:50%;width:66%;aspect-ratio:1;margin:-33% 0 0 -33%;border-radius:50%;background:#111}
.fxcta{background:#d6ff3d;color:#111;border-radius:0;letter-spacing:.1em}`,
      R(['Dinamo', 'abcdinamo.com'], ['Pentagram 动态识别', 'pentagram.com'])),

    I('motionfirst', '动效主导', 'Motion-first',
      '动效是主角，不是点缀', 'Motion is the subject, not the garnish',
      '入场/滚动/悬停三层动效编排成一条线，用统一的缓动与时长阶梯；必须尊重 reduced-motion。',
      'Entrance, scroll and hover choreographed as one line with a shared easing and duration ladder. Honour reduced-motion.',
      ['动态', '交互', '充满生命力'], ['DYNAMIC', 'INTERACTIVE', 'ALIVE'],
      C('Motionly', 'Product   Cases   Pricing', 'IDEAS\nIN MOTION', '动态交互，让每一次浏览成为一种体验。', '探索演示'),
      `@keyframes fxk{0%{transform:translateX(-15px);opacity:.18}52%{transform:none;opacity:1}100%{transform:translateX(15px);opacity:.18}}
.fxpage{background:#121220;border-color:#26263a}
.fxbar{background:#181826;border-bottom-color:#26263a}
.fxbar::after{background:#20203a;border-color:#2e2e4a}
.fxnav2{border-bottom-color:#26263a;color:#a9abc4}
.fxhead{font:800 29px/1;letter-spacing:-.032em;color:#efeffa;text-transform:uppercase;animation:fxk 3.6s ${E} infinite}
.fxsub{color:#9698b4}
.fxart{background:linear-gradient(122deg,#2b2350,#4d3d94 50%,#9070ea);position:relative}
.fxart::before{content:'';position:absolute;inset:0;background:radial-gradient(70% 50% at 74% 14%,rgba(255,255,255,.28),transparent 68%)}
.fxcta{background:#cbb8ff;color:#1a1730;border-radius:999px}`,
      R(['Awwwards', 'awwwards.com'], ['Active Theory', 'activetheory.net'], ['Codrops', 'tympanus.net/codrops'])),

    /* ── 八、亲和与自然 ─────────────────────────────── */

    I('organic', '有机曲线风', 'Organic shapes',
      '没有一条直线', 'Not a single straight line',
      'blob 形状 + 不规则圆角 + 柔和低饱和色；用 border-radius 四值或 SVG 路径造形，别用对称椭圆。',
      'Blob forms, asymmetric radii, soft muted colour. Shape with four-value radii or SVG paths — symmetric ellipses read as clip-art.',
      ['自然流动', '柔和曲线', '舒适放松'], ['NATURAL', 'FLUID', 'RELAXED'],
      C('Flowly', 'Product   Mindfulness   About', 'A Calmer\nBrighter You', '让生活回归平衡与美好。', '开启旅程'),
      `@keyframes fxk{0%,100%{border-radius:58% 42% 44% 56%/52% 46% 54% 48%;transform:rotate(-3deg)}50%{border-radius:42% 58% 56% 44%/46% 54% 46% 54%;transform:rotate(3deg)}}
.fxpage{background:#fcf9f3}
.fxhead{font:400 italic 28px/1.14 ${SERIF};color:#3b4436}
.fxsub{color:#7b8474}
.fxart{background:linear-gradient(165deg,#f6f2e8,#ece6d8);position:relative;overflow:hidden}
.fxart::after{content:'';position:absolute;left:15%;top:17%;width:68%;height:64%;background:linear-gradient(150deg,#cfdcba,#adc094);box-shadow:0 12px 30px rgba(90,110,70,.2);animation:fxk 9s ease-in-out infinite}
.fxcta{background:#5c7048;border-radius:999px}`,
      R(['Calm', 'calm.com'], ['Headspace', 'headspace.com'])),

    I('handdrawn', '手绘插画风', 'Hand-drawn',
      '线条有抖动，颜色出框', 'Wobbling strokes, colour outside the lines',
      '不规则手绘线 + 蜡笔质感填色 + 手写体标注；线宽要有粗细变化，否则像矢量描边而不是手绘。',
      'Irregular strokes, crayon fills, handwritten notes. Vary stroke weight — even weight reads as vector outline, not hand.',
      ['画下想法', '做自己', '更温暖的网络'], ['DRAW', 'IMAGINE', 'A KINDER WEB'],
      C('Little Beans', 'Home   Works   Course', '把想法画出来\n让生活更可爱！', '用手绘记录灵感，点亮日常。', '开始探索'),
      `@keyframes fxk{0%,100%{transform:translate(0,0) rotate(-1deg)}50%{transform:translate(2px,-2px) rotate(1deg)}}
.fxpage{background:#fffbf2;border:2px solid #3a3227;border-radius:16px}
.fxbar{background:#fff4dc;border-bottom:2px solid #3a3227}.fxbar::before{background:#3a3227;box-shadow:9px 0 0 #3a3227,18px 0 0 #3a3227}
.fxbar::after{background:#fffbf2;border:1.5px solid #3a3227}
.fxnav2{border-bottom:2px dashed #cbbfa6;color:#3a3227}
.fxhead{font:700 25px/1.3 ${SERIF};color:#3a3227}
.fxsub{color:#7a6b52}
.fxart{background:#ebf5e3;border-left:2px dashed #cbbfa6;position:relative}
.fxart::after{content:'';position:absolute;left:25%;top:25%;width:50%;height:48%;border:3px solid #3a3227;border-radius:46% 54% 52% 48%;background:linear-gradient(150deg,#ffdfb4,#ffc98a);animation:fxk 4.6s ease-in-out infinite}
.fxcta{background:#5aa469;border:2px solid #3a3227;border-radius:999px}`,
      R(['Excalidraw', 'excalidraw.com'], ['Rough.js', 'roughjs.com'], ['Basecamp', 'basecamp.com'])),

    I('monoline', '线描插画风', 'Monoline illustration',
      '统一线宽的插画', 'Illustration at one stroke weight',
      '全站插画同一线宽（1.5–2px）与同一端点形状；填色只作为线稿背后的色块，绝不替代线。',
      'One stroke weight (1.5–2px) and one cap style everywhere. Colour sits behind the line, never replaces it.',
      ['简洁线条', '清晰易懂', '贴近日常'], ['SIMPLE', 'CLEAN', 'EVERYDAY'],
      C('MealBuddy', 'Recipes   Plans   Blog', 'Good Food\nHappier Days', '用美味，点亮每一天。', '开始计划'),
      `@keyframes fxk{0%,100%{transform:translate(0,0)}50%{transform:translate(-3px,-3px)}}
.fxpage{background:#fffdf7}
.fxhead{font:700 26px/1.18 ${SANS};letter-spacing:-.022em;color:#2f2a22}
.fxsub{color:#7c7466}
.fxart{background:linear-gradient(165deg,#fff8e8,#fdf0d8);position:relative}
.fxart::after{content:'';position:absolute;left:21%;top:23%;width:58%;height:52%;border:2px solid #2f2a22;border-radius:50% 50% 46% 54%;background:transparent;box-shadow:13px 13px 0 -6px #ffcf7a;animation:fxk 6s ease-in-out infinite}
.fxcta{background:#ff9330;border-radius:999px}`,
      R(['Streamline', 'streamlinehq.com'], ['unDraw', 'undraw.co'])),

    I('eco', '自然生态风', 'Eco / nature',
      '真实的绿，不是品牌绿', 'Real green, not brand green',
      '实景摄影 + 森林绿与土色 + 手写点缀；关键是照片真实，避免图库式"可持续插画"和柔焦绿。',
      'Documentary photography, forest greens and earth tones, one handwritten accent. Real photos — skip stock sustainability art and soft-focus green.',
      ['可持续', '自然友好', '更美好的未来'], ['SUSTAINABLE', 'CONSCIOUS', 'A BRIGHTER TOMORROW'],
      C('EarthKind', 'Product   Story   News', '与自然共生\n创造可持续的未来', '从今天开始，选择更好的生活方式。', '探索行动'),
      `@keyframes fxk{0%,100%{transform:scale(1.02) translateY(0)}50%{transform:scale(1.06) translateY(-4px)}}
.fxpage{background:#fcfcf8}
.fxhead{font:700 25px/1.28 ${SANS};letter-spacing:-.022em;color:#20381d}
.fxsub{color:#5d6b57}
.fxart{background:linear-gradient(168deg,#9cba85,#3f6a37 48%,#20381d);overflow:hidden;position:relative;animation:fxk 11s ease-in-out infinite}
.fxart::before{content:'';position:absolute;inset:0;background:radial-gradient(60% 40% at 72% 12%,rgba(224,205,78,.4),transparent 70%)}
.fxcta{background:#365c31;border-radius:999px}`,
      R(['Patagonia', 'patagonia.com'], ['Savimbo', 'savimbo.com'], ['CarbonPlan', 'carbonplan.org'])),

    I('solarpunk', '太阳朋克', 'Solarpunk',
      '乐观的绿色未来', 'An optimistic green future',
      '植物 + 明亮金绿 + 装饰性新艺术曲线 + 通透玻璃；和赛博朋克相反：明亮、有机、可持续。',
      'Plants, bright gold-greens, art-nouveau curves, clear glass. The inverse of cyberpunk — bright, organic, sustainable.',
      ['明亮乐观', '有机技术', '可持续未来'], ['OPTIMISTIC', 'ORGANIC TECH', 'SUSTAINABLE'],
      C('SOLARIA', 'Energy   Community   Stories', 'Grow\nsomething\ngreat', '技术可以站在自然这一边。', '加入我们'),
      `@keyframes fxk{0%,100%{transform:rotate(-2deg) scale(1)}50%{transform:rotate(2deg) scale(1.04)}}
.fxpage{background:#fcfbf2;border-color:#e5e6d4}
.fxbar{background:#f4f5e4;border-bottom-color:#e5e6d4}
.fxnav2{border-bottom-color:#eceedd;color:#4f5c49}
.fxhead{font:400 28px/1.16 ${SERIF};color:#20381d;letter-spacing:-.008em}
.fxsub{color:#5d6b57}
.fxart{background:radial-gradient(circle at 70% 24%,#e6d768,transparent 46%),linear-gradient(168deg,#c4dd25,#3f6a37 70%,#20381d);position:relative;overflow:hidden}
.fxart::after{content:'';position:absolute;left:19%;bottom:-14%;width:62%;height:64%;border-radius:50% 50% 8% 8%;background:rgba(255,255,255,.36);box-shadow:inset 0 2px 0 rgba(255,255,255,.6);animation:fxk 8.5s ease-in-out infinite}
.fxcta{background:#8ea604;color:#20381d;border-radius:999px}`,
      R(['Low-tech Magazine', 'solar.lowtechmagazine.com'], ['Solarpunk 档案', 'solarpunkstories.com'])),

    I('maximalism', '极繁主义', 'Maximalism',
      '填满、堆叠、喧闹但有序', 'Full, stacked, loud — and still ordered',
      '多色多字体多图层，但用一套网格与一个统一底色收住；阅读焦点仍然只留一个。',
      'Many colours, faces and layers held by one grid and one ground colour. Still exactly one reading focus.',
      ['更多元素', '更多色彩', '更丰富的表达'], ['MORE ELEMENTS', 'MORE COLOURS', 'RICHER'],
      C('MAXIMO', 'Work   Shop   About', 'GOOD IDEAS\nEVERYWHERE', '让创意动起来，填满生活。', '加入我们'),
      `@keyframes fxk{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
.fxpage{background:#f8ead2}
.fxhead{font:900 26px/1.04 ${SANS};letter-spacing:-.032em;color:#1c1c1c;background:#ffe14d;box-shadow:6px 0 0 #ffe14d,-6px 0 0 #ffe14d;display:inline;padding:1px 0}
.fxsub{color:#4a2c1a}
.fxart{background:conic-gradient(from 20deg,#e8574c,#ffd23f 25%,#3ec5c9 50%,#8a6ce0 75%,#e8574c);position:relative}
.fxart::after{content:'';position:absolute;left:27%;top:27%;width:46%;height:46%;background:repeating-conic-gradient(#fff 0 25%,#1c1c1c 0 50%) 50%/17px 17px;box-shadow:0 8px 22px rgba(0,0,0,.28);animation:fxk 4.4s ease-in-out infinite}
.fxcta{background:#e8574c;border-radius:999px}`,
      R(['Moooi', 'moooi.com'], ['Camille Walala', 'camillewalala.com']))
  ]
};
