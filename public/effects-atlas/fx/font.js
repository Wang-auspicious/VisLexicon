export default {
  id: 'font',
  zh: '字体选型与黑白名单',
  en: 'Typefaces & Font Matrix',
  dz: 'AI-Native 时代排版指南：远离 Inter 滥用，掌握高质量字体中英数字混排',
  de: 'Typography guide for AI builders: reject generic AI-slop fonts, adopt crafted typefaces',
  items: [
    {
      id: 'font-anthropic-tiempos',
      zh: 'Anthropic 官方人文衬线 (Tiempos & Instrument Serif)',
      en: 'Anthropic / Claude Editorial Serif',
      dz: '【白名单 · 殿堂】Claude 标志性作家质感，打破科技冰冷的人文温度',
      de: '[Whitelist] The iconic Anthropic/Claude voice: essayist authority and warmth',
      pz: '【Anthropic 官方心智解构】：\nClaude 与 Anthropic 官网之所以能在一众冰冷科技公司中脱颖而出，核心就在于其放弃了无衬线套路，选用 Klim Type Foundry 的 Tiempos 衬线体作为回答正文，搭配 Styrene 几何 UI 字符，铺在暖米纸色（Warm Cream #fbf9f4）画卷上。\n【免费与开源替代】：Instrument Serif、Newsreader、Source Serif 4。\n【适用场景】：AI 思考界面、深度长文阅读、哲学/人文/研究型产品。\n【混排准则】：西文用 Instrument Serif，中文回落至“思源宋体 / Songti SC”。',
      pe: 'Anthropic identity: Tiempos Serif by Klim on warm cream paper (#fbf9f4). Free web alternatives: Instrument Serif, Newsreader, Source Serif 4.',
      demo: 'chat',
      css: '.fxchat{gap:10px;background:#fbf9f4;padding:18px;border-radius:12px;border:1px solid #ece6db;box-shadow:0 4px 16px -2px rgba(0,0,0,.04)}.fx{background:transparent;border:0;padding:0;color:#1c1917;font-family:\'Instrument Serif\',\'Newsreader\',Georgia,\'Songti SC\',\'Noto Serif SC\',serif;max-width:100%}.fx:nth-child(1){font-size:24px;line-height:1.2;font-weight:400;color:#1c1917}.fx:nth-child(1)::before{content:\'✦ ANTHROPIC CLAUDE STYLE · 白名单\';display:block;font-family:\'JetBrains Mono\',monospace;font-size:10.5px;font-weight:700;color:#c2410c;letter-spacing:.12em;margin-bottom:6px}.fx:nth-child(1)::after{content:\'永字八法 · Crafted Intelligence\';display:block;font-size:16px;color:#78716c;margin-top:2px}.fx:nth-child(2){font-size:14.5px;line-height:1.65;color:#44403c;font-family:\'Newsreader\',Georgia,\'Songti SC\',serif}.fx:nth-child(3){font-family:\'JetBrains Mono\',monospace;font-size:11px;color:#9a3412;border-top:1px dashed #e7e0d4;padding-top:8px}'
    },
    {
      id: 'font-geist-sans',
      zh: 'Vercel Geist Sans（极客理性无衬线）',
      en: 'Vercel Geist Sans (Modern Dev-Tool)',
      dz: '【白名单 · 推荐】Vercel 官方出品，专为硬核工具与高密度开发平台打造',
      de: '[Whitelist] Vercel\'s flagship Swiss-style typeface for developer platforms',
      pz: '【核心亮点】：\n新瑞士国际主义排版典范。高精度几何骨架、严格对齐的基线、微量负字距优化。在中文字体（苹方 / 鸿蒙黑体）混排时衔接极度舒适，是 Next.js、Supabase 生态的招牌。\n【适用场景】：开发者控制台、技术文档、现代云平台 SaaS、高密度数据看板。\n【CSS 声明】：font-family: "Geist Sans", "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif;',
      pe: 'Geist Sans: Swiss-style precision engineered by Vercel for technical interfaces, documentation, and dense developer tooling.',
      demo: 'chat',
      css: '.fxchat{gap:8px;background:#ffffff;padding:16px;border-radius:12px;border:1px solid #e2e8f0;box-shadow:0 4px 12px -2px rgba(0,0,0,.05)}.fx{background:transparent;border:0;padding:0;color:#0f172a;font-family:\'Hanken Grotesk\',-apple-system,\'PingFang SC\',\'Noto Sans SC\',sans-serif;max-width:100%}.fx:nth-child(1){font-weight:800;font-size:21px;letter-spacing:-.03em;color:#0f172a}.fx:nth-child(1)::before{content:\'✓ VERCEL GEIST SANS · 白名单\';display:block;font-size:10px;font-weight:700;color:#0284c7;letter-spacing:.1em;margin-bottom:4px}.fx:nth-child(1)::after{content:\'AaBbCcDd 0123456789 视元界面引擎\';display:block;font-size:14px;font-weight:600;color:#64748b;letter-spacing:0;margin-top:2px}.fx:nth-child(2){font-size:13.5px;line-height:1.55;color:#334155;font-weight:500}.fx:nth-child(3){font-family:\'JetBrains Mono\',monospace;font-size:11px;color:#0284c7;background:#f0f9ff;padding:6px 10px;border-radius:6px;border:1px solid #e0f2fe}'
    },
    {
      id: 'font-plus-jakarta',
      zh: 'Plus Jakarta Sans（当代 B2B/Fintech 标杆）',
      en: 'Plus Jakarta Sans (Fintech & SaaS Standard)',
      dz: '【白名单 · 推荐】挺拔自信的现代几何，大字张力与小字清晰兼备',
      de: '[Whitelist] The gold standard for clean, premium B2B SaaS and fintech',
      pz: '【核心亮点】：\n极具活力的现代几何无衬线，字身挺拔、转折干脆。被众多顶级独角兽与 Web3/Fintech 落地页选为主字体，高级感立竿见影。\n【字阶搭配】：标题 semibold/extrabold 带 -0.02em 字距，正文 regular 保持默认。\n【CSS 声明】：font-family: "Plus Jakarta Sans", "Manrope", -apple-system, "PingFang SC", sans-serif;',
      pe: 'Plus Jakarta Sans: crisp geometric grotesque favored by contemporary fintech, modern dashboards, and high-conversion landing pages.',
      demo: 'chat',
      css: '.fxchat{gap:8px;background:#ffffff;padding:16px;border-radius:12px;border:1px solid #e2e8f0;box-shadow:0 4px 14px -2px rgba(0,0,0,.06)}.fx{background:transparent;border:0;padding:0;color:#0f172a;font-family:\'Plus Jakarta Sans\',system-ui,\'PingFang SC\',sans-serif;max-width:100%}.fx:nth-child(1){font-weight:800;font-size:20px;letter-spacing:-.03em;color:#0f172a}.fx:nth-child(1)::before{content:\'✓ PLUS JAKARTA SANS · 白名单\';display:block;font-size:10px;font-weight:700;color:#059669;letter-spacing:.1em;margin-bottom:4px}.fx:nth-child(1)::after{content:\'Fintech & Capital · 资产数字化并列陈列\';display:block;font-size:14px;font-weight:600;color:#059669;margin-top:2px}.fx:nth-child(2){font-size:13.5px;line-height:1.55;color:#475569;font-weight:500}.fx:nth-child(3){font-size:11px;color:#64748b;font-weight:600;border-top:1px solid #f1f5f9;padding-top:6px}'
    },
    {
      id: 'font-manrope',
      zh: 'Manrope（亲和几何现代体）',
      en: 'Manrope (Warm Modern Geometric)',
      dz: '【白名单 · 推荐】开放字腔与圆润终端，科技感与温润亲和并存',
      de: '[Whitelist] Open apertures and softened terminals for human-centric tech',
      pz: '【核心亮点】：\n半封闭字腔极其开阔，大字号下有独特的雕塑感，小字号下可读性极佳，非常适合从标题到正文一用到底的单一字体家族项目。\n【适用场景】：生活方式、协同工具、消费级科技、设计工作室官网。\n【CSS 声明】：font-family: "Manrope", -apple-system, "PingFang SC", sans-serif;',
      pe: 'Manrope: warm geometric sans with open counters and gentle terminals. Ideal for single-font-family web applications.',
      demo: 'chat',
      css: '.fxchat{gap:8px;background:#ffffff;padding:16px;border-radius:12px;border:1px solid #e2e8f0}.fx{background:transparent;border:0;padding:0;color:#0f172a;font-family:\'Manrope\',system-ui,\'PingFang SC\',sans-serif;max-width:100%}.fx:nth-child(1){font-weight:800;font-size:20px;letter-spacing:-.02em;color:#0f172a}.fx:nth-child(1)::before{content:\'✓ MANROPE · 白名单\';display:block;font-size:10px;font-weight:700;color:#6366f1;letter-spacing:.1em;margin-bottom:4px}.fx:nth-child(1)::after{content:\'Friendly Innovation · 充满呼吸感的现代字形\';display:block;font-size:14px;font-weight:600;color:#6366f1;margin-top:2px}.fx:nth-child(2){font-size:13.5px;line-height:1.6;color:#475569;font-weight:500}.fx:nth-child(3){font-size:11.5px;color:#64748b}'
    },
    {
      id: 'font-poppins',
      zh: 'Poppins（强几何张力大标题）',
      en: 'Poppins (Geometric Display Power)',
      dz: '【白名单 · 推荐】纯圆纯直的包豪斯几何韵律，大标题吸睛力极强',
      de: '[Whitelist] Pure geometric Bauhaus circles and lines for punchy heroes',
      pz: '【核心亮点】：\n基于纯圆与直线的几何体，大字号标题（44px+）视觉冲击力巨大，具有浓郁的国际化视觉张力。\n【注意点】：因为大写字母极度几何化，小字正文长篇阅读容易视觉疲劳，建议“大标题用 Poppins，正文配 Manrope 或系统无衬线”。',
      pe: 'Poppins: geometric sans with circular curves, powerful for heroes and branding headlines.',
      demo: 'chat',
      css: '.fxchat{gap:8px;background:#ffffff;padding:16px;border-radius:12px;border:1px solid #e2e8f0}.fx{background:transparent;border:0;padding:0;color:#0f172a;font-family:\'Hanken Grotesk\',system-ui,sans-serif;max-width:100%}.fx:nth-child(1){font-weight:900;font-size:24px;letter-spacing:-.03em;color:#0f172a;text-transform:uppercase}.fx:nth-child(1)::before{content:\'✓ POPPINS / GEOMETRIC · 白名单\';display:block;font-size:10px;font-weight:700;color:#ec4899;letter-spacing:.1em;margin-bottom:4px;text-transform:none}.fx:nth-child(1)::after{content:\'SHAPING THE FUTURE · 视觉重锤\';display:block;font-size:14px;font-weight:700;color:#ec4899;margin-top:2px}.fx:nth-child(2){font-size:13px;line-height:1.5;color:#475569}.fx:nth-child(3){font-size:11px;color:#94a3b8}'
    },
    {
      id: 'font-newsreader',
      zh: 'Newsreader（长文深度阅读衬线）',
      en: 'Newsreader (Deep Long-form Serif)',
      dz: '【白名单 · 推荐】Google 出品专业新闻与深度电子出版物字体',
      de: '[Whitelist] Crafted specifically for long-form narrative reading',
      pz: '【核心亮点】：\n专为长篇阅读设计的光学字阶衬线体，笔画粗细过渡极其克制，在暗色背景或电子纸质感背景下长时间阅读不刺眼、不疲劳。\n【适用场景】：博客长文、深度研报、知识库、电子杂志。',
      pe: 'Newsreader: optical-size serif tailored for continuous reading, articles, and long-form digital publishing.',
      demo: 'chat',
      css: '.fxchat{gap:10px;background:#f7f6f2;padding:18px;border-radius:12px;border:1px solid #e5e4de}.fx{background:transparent;border:0;padding:0;color:#27272a;font-family:\'Newsreader\',Georgia,\'Songti SC\',serif;max-width:100%}.fx:nth-child(1){font-size:22px;line-height:1.25;font-weight:600;color:#18181b}.fx:nth-child(1)::before{content:\'✓ NEWSREADER · 深度阅读白名单\';display:block;font-family:\'JetBrains Mono\',monospace;font-size:10px;font-weight:700;color:#4f46e5;letter-spacing:.12em;margin-bottom:4px}.fx:nth-child(1)::after{content:\'The Epoch of Digital Craft · 墨香沉淀\';display:block;font-size:14px;font-weight:400;color:#4f46e5;margin-top:2px}.fx:nth-child(2){font-size:14px;line-height:1.7;color:#3f3f46}.fx:nth-child(3){font-family:\'JetBrains Mono\',monospace;font-size:11px;color:#71717a}'
    },
    {
      id: 'font-playfair',
      zh: 'Playfair Display（高对比度轻奢衬线）',
      en: 'Playfair Display (High-Contrast Editorial)',
      dz: '【白名单 · 推荐】极细发丝线与饱满笔画，浓郁杂志刊物封面感',
      de: '[Whitelist] Transitional serif with high contrast for editorial luxury',
      pz: '【核心亮点】：\n18 世纪末启蒙运动时期的过渡衬线风格，主笔画饱满，发丝衬线极细，粗细对比鲜明。适合文化、时尚、深度策展或高端杂志风格的落地页大标题。',
      pe: 'Playfair Display: high-contrast transitional serif perfect for fashion, culture, and editorial covers.',
      demo: 'chat',
      css: '.fxchat{gap:8px;background:#ffffff;padding:16px;border-radius:12px;border:1px solid #e4e4e7;box-shadow:0 6px 20px -4px rgba(0,0,0,.06)}.fx{background:transparent;border:0;padding:0;color:#18181b;font-family:\'Instrument Serif\',Georgia,serif;max-width:100%}.fx:nth-child(1){font-size:26px;line-height:1.15;font-weight:400;color:#09090b}.fx:nth-child(1)::before{content:\'✓ PLAYFAIR / EDITORIAL · 杂志白名单\';display:block;font-family:\'JetBrains Mono\',monospace;font-size:10px;font-weight:700;color:#b45309;letter-spacing:.1em;margin-bottom:4px}.fx:nth-child(1)::after{content:\'Editorial Excellence · 典雅刊物风骨\';display:block;font-size:15px;color:#b45309;margin-top:2px}.fx:nth-child(2){font-size:13.5px;line-height:1.6;color:#52525b;font-family:system-ui}.fx:nth-child(3){font-size:11px;color:#a1a1aa}'
    },
    {
      id: 'font-jetbrains-mono',
      zh: 'JetBrains Mono（极客编码与连字神器）',
      en: 'JetBrains Mono (Developer Favorite)',
      dz: '【白名单 · 推荐】扩大的小写字母高度，专为阅读代码与 Terminal 设计',
      de: '[Whitelist] Generous x-height and distinctive symbols engineered for code',
      pz: '【核心亮点】：\n字母形式高度区分（0 与 O、1 与 l 泾渭分明），内置极优秀的编程连字（ligatures：=> != === !==），是现代代码编辑器与终端高亮界面的行业天花板。',
      pe: 'JetBrains Mono: engineered for code comprehension with large x-height and expressive ligatures.',
      demo: 'chat',
      css: '.fxchat{gap:6px;background:#0d1117;padding:16px;border-radius:12px;border:1px solid #30363d}.fx{background:transparent;border:0;padding:0;color:#e6edf3;font-family:\'JetBrains Mono\',monospace;max-width:100%}.fx:nth-child(1){color:#58a6ff;font-size:15px;font-weight:700}.fx:nth-child(1)::before{content:\'✓ JETBRAINS MONO · 极客代码白名单\';display:block;color:#8b949e;font-size:10px;margin-bottom:4px}.fx:nth-child(1)::after{content:\'const ready = true => !error; 0O1lI|\';display:block;color:#7ee787;font-size:13px;margin-top:2px}.fx:nth-child(2){color:#c9d1d9;font-size:12.5px;line-height:1.6}.fx:nth-child(3){color:#79c0ff;font-size:11px}'
    },
    {
      id: 'font-geist-mono-tabular',
      zh: 'Geist Mono & 表格防抖（Tabular Figures）',
      en: 'Geist Mono & Tabular Figures',
      dz: '【白名单 · 推荐】font-variant-numeric: tabular-nums 数据面板基石',
      de: '[Whitelist] Strict tabular figure alignment to eliminate jitter in live data',
      pz: '【核心准则】：\n等宽字体切勿滥用于正文长篇。但在数字跳动的场景，必须加上 font-variant-numeric: tabular-nums，确保 0 到 9 宽度恒定，彻底终结数值跳动时容器抽搐的业余表现。\n【CSS 声明】：font-family: "Geist Mono", "JetBrains Mono", monospace; font-variant-numeric: tabular-nums;',
      pe: 'Geist Mono paired with font-variant-numeric: tabular-nums prevents horizontal shaking when counters or metrics update in real time.',
      demo: 'chat',
      css: '.fxchat{gap:6px;background:#090d16;padding:16px;border-radius:12px;border:1px solid #1e293b}.fx{background:transparent;border:0;padding:0;color:#f8fafc;font-family:\'JetBrains Mono\',monospace;font-variant-numeric:tabular-nums;max-width:100%}.fx:nth-child(1){color:#38bdf8;font-size:14px;font-weight:700}.fx:nth-child(1)::before{content:\'✓ TABULAR FIGURES · 数据防抖白名单\';display:block;color:#94a3b8;font-size:10px;margin-bottom:4px}.fx:nth-child(1)::after{content:\'[LIVE] 1,489,203.45 TPS · 恒宽无抖动\';display:block;color:#4ade80;font-size:13px;margin-top:2px}.fx:nth-child(2){color:#cbd5e1;font-size:12px;line-height:1.6}.fx:nth-child(3){color:#38bdf8;font-size:11px}'
    },
    {
      id: 'font-chinese-pingfang',
      zh: '中文字体现代无衬线栈（PingFang & HarmonyOS）',
      en: 'Modern Chinese Sans Stack',
      dz: '【白名单 · 推荐】苹方 / 鸿蒙黑体 / 思源黑体西文无缝搭配',
      de: '[Whitelist] Balanced CJK sans stack with optimal Latin proportion',
      pz: '【排版准则】：\n中文显示以苹果苹方（PingFang SC）和华为鸿蒙黑体（HarmonyOS Sans SC）为第一梯队，开源以思源黑体（Noto Sans SC）保底。\n混排法则：永远在 font-family 声明中把西文字体写在前面、中文字体写在后面，利用浏览器字体回退机制，实现“西文用 Geist/Plus Jakarta，汉字用苹方”的完美融合。',
      pe: 'Chinese sans stack: PingFang SC, HarmonyOS Sans, Noto Sans SC. Always declare Latin fonts before CJK fallbacks.',
      demo: 'chat',
      css: '.fxchat{gap:8px;background:#ffffff;padding:16px;border-radius:12px;border:1px solid #e2e8f0}.fx{background:transparent;border:0;padding:0;color:#0f172a;font-family:\'Plus Jakarta Sans\',-apple-system,\'PingFang SC\',\'HarmonyOS Sans SC\',\'Noto Sans SC\',sans-serif;max-width:100%}.fx:nth-child(1){font-weight:700;font-size:19px;letter-spacing:-.02em;color:#0f172a}.fx:nth-child(1)::before{content:\'✓ CJK SANS STACK · 中文无衬线白名单\';display:block;font-size:10px;font-weight:700;color:#0284c7;letter-spacing:.1em;margin-bottom:4px}.fx:nth-child(1)::after{content:\'视元架构 · 同类条目并列陈列 236 站点\';display:block;font-size:14px;color:#0284c7;margin-top:2px}.fx:nth-child(2){font-size:13.5px;line-height:1.65;color:#334155}.fx:nth-child(3){font-size:11px;color:#64748b}'
    },
    {
      id: 'font-chinese-songti',
      zh: '中文人文宋体栈（Songti & Source Han Serif）',
      en: 'Chinese Editorial Serif Stack',
      dz: '【白名单 · 推荐】宋体 / 思源宋体，东方文人墨客的清雅风骨',
      de: '[Whitelist] Refined Chinese Song/Mincho serif typography',
      pz: '【排版准则】：\n思源宋体（Source Han Serif / Noto Serif SC）与苹果苹方宋体（Songti SC）。与西文 Tiempos / Instrument Serif 混排时，呈现出顶级的学术、人文、出版物高级质感。\n【适用场景】：传统文化数字化、哲学思考、精致美学策展。',
      pe: 'Chinese serif stack: Songti SC and Source Han Serif paired with classic editorial English serifs for literary resonance.',
      demo: 'chat',
      css: '.fxchat{gap:10px;background:#fdfcf9;padding:18px;border-radius:12px;border:1px solid #e8e5dc}.fx{background:transparent;border:0;padding:0;color:#1c1917;font-family:\'Instrument Serif\',\'Songti SC\',\'Noto Serif SC\',STSong,serif;max-width:100%}.fx:nth-child(1){font-size:22px;line-height:1.25;font-weight:500;color:#1c1917}.fx:nth-child(1)::before{content:\'✓ CJK SERIF STACK · 中文宋体白名单\';display:block;font-family:\'JetBrains Mono\',monospace;font-size:10px;font-weight:700;color:#b45309;letter-spacing:.12em;margin-bottom:4px}.fx:nth-child(1)::after{content:\'格物致知 · 人文科技与典籍质感\';display:block;font-size:15px;color:#b45309;margin-top:2px}.fx:nth-child(2){font-size:14px;line-height:1.75;color:#44403c}.fx:nth-child(3){font-family:\'JetBrains Mono\',monospace;font-size:11px;color:#78716c}'
    },
    {
      id: 'font-inter',
      zh: 'Inter 字体（AI 泛滥重灾区）',
      en: 'Inter (AI Slop Default)',
      dz: '【❌ 黑名单】v0/Cursor 默认泛滥，全网 90% 页面撞脸的冷淡灰字',
      de: '[Blacklist] The default for v0 & Cursor. Ubiquitous, soulless, and generic',
      pz: '【为什么进黑名单】：\n自 2023 年 AI 生成代码爆发以来，90% 的前端 Agent 默认都输出 Inter。铺天盖地的 Inter 搭配灰底黑卡片，成为当今最具辨识度的“AI 生成廉价感（AI Slop）”。做真正有品牌的现代 Web，第一步就是废黜默认 Inter，换用 Geist、Manrope 或 Plus Jakarta Sans。',
      pe: 'Inter is the universal tell of an AI-generated template. Swap it immediately for Geist, Manrope, or Plus Jakarta Sans.',
      demo: 'chat',
      css: '.fxchat{gap:8px;background:#f8fafc;padding:16px;border-radius:12px;border:1.5px solid #ef4444}.fx{background:transparent;border:0;padding:0;color:#64748b;font-family:Inter,sans-serif;max-width:100%}.fx:nth-child(1){font-weight:700;font-size:18px;color:#334155}.fx:nth-child(1)::before{content:\'⚠️ AI 典型滥用：Inter 字体 · 黑名单\';display:block;font-size:10.5px;font-weight:800;color:#ef4444;letter-spacing:.08em;margin-bottom:4px}.fx:nth-child(1)::after{content:\'撞脸成灾：全网模板一成不变的冷漠\';display:block;font-size:13px;color:#ef4444;margin-top:2px}.fx:nth-child(2){font-size:13px;line-height:1.5;color:#64748b}.fx:nth-child(3){font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:6px}'
    },
    {
      id: 'font-roboto',
      zh: 'Roboto（过时 Android 机械感）',
      en: 'Roboto (Dated System Sans)',
      dz: '【❌ 黑名单】十年前 Material Design 残留，缺乏现代 Web 呼吸感',
      de: '[Blacklist] Relic of 2014 Material Design. Rigid, cold, and dated',
      pz: '【为什么进黑名单】：\n早期安卓系统默认字体，在当下现代审美下笔画骨架过紧、缺乏字腔舒展度，常被旧代码库和缺乏审美的旧脚手架沿用。',
      pe: 'Roboto carries dated 2014 Android aesthetics with cramped counters. Replace with contemporary grotesque families.',
      demo: 'chat',
      css: '.fxchat{gap:8px;background:#f8fafc;padding:16px;border-radius:12px;border:1px solid #cbd5e1}.fx{background:transparent;border:0;padding:0;color:#64748b;font-family:Roboto,sans-serif;max-width:100%}.fx:nth-child(1){font-weight:700;font-size:18px;color:#334155}.fx:nth-child(1)::before{content:\'⚠️ 过时机械感：Roboto 字体 · 黑名单\';display:block;font-size:10px;font-weight:700;color:#f97316;letter-spacing:.08em;margin-bottom:4px}.fx:nth-child(1)::after{content:\'十年前安卓系统标配，字腔收紧缺乏呼吸\';display:block;font-size:13px;color:#f97316;margin-top:2px}.fx:nth-child(2){font-size:13px;line-height:1.5;color:#64748b}.fx:nth-child(3){font-size:11px;color:#94a3b8}'
    },
    {
      id: 'font-arial-helvetica',
      zh: 'Arial / Helvetica（生硬系统无个性降级）',
      en: 'Arial / Helvetica (Cold Fallback)',
      dz: '【❌ 黑名单】毫无温度的操作系统保底，数字与小写字母呆滞',
      de: '[Blacklist] The sterile system fallback with zero brand warmth',
      pz: '【为什么进黑名单】：\n粗暴的系统默认回退，标点与字距在现代屏幕显示中极端生硬。高质感产品必须指定专门调校过的现代 Web 字体。',
      pe: 'Arial is a default fallback that damages brand credibility on modern display screens.',
      demo: 'chat',
      css: '.fxchat{gap:8px;background:#f8fafc;padding:16px;border-radius:12px;border:1px solid #cbd5e1}.fx{background:transparent;border:0;padding:0;color:#64748b;font-family:Arial,Helvetica,sans-serif;max-width:100%}.fx:nth-child(1){font-weight:700;font-size:18px;color:#334155}.fx:nth-child(1)::before{content:\'⚠️ 生硬降级：Arial 字体 · 黑名单\';display:block;font-size:10px;font-weight:700;color:#f97316;letter-spacing:.08em;margin-bottom:4px}.fx:nth-child(1)::after{content:\'字距机械呆滞，毫无现代设计调性\';display:block;font-size:13px;color:#f97316;margin-top:2px}.fx:nth-child(2){font-size:13px;line-height:1.5;color:#64748b}.fx:nth-child(3){font-size:11px;color:#94a3b8}'
    },
    {
      id: 'font-open-sans',
      zh: 'Open Sans（早期陈旧博客风）',
      en: 'Open Sans (Stale Web 2.0)',
      dz: '【❌ 黑名单】2012 年 Bootstrap / WordPress 泛滥时代产物',
      de: '[Blacklist] Reminiscent of 2012 corporate WordPress blogs',
      pz: '【为什么进黑名单】：\n过大的 x 高与圆钝弧形在今天看起来迟钝沉重，已被新一代几何与新瑞士主义无衬线全面取代。',
      pe: 'Open Sans looks dated and heavy compared to modern tight-grotesque typefaces.',
      demo: 'chat',
      css: '.fxchat{gap:8px;background:#f8fafc;padding:16px;border-radius:12px;border:1px solid #cbd5e1}.fx{background:transparent;border:0;padding:0;color:#64748b;font-family:"Open Sans",sans-serif;max-width:100%}.fx:nth-child(1){font-weight:700;font-size:18px;color:#334155}.fx:nth-child(1)::before{content:\'⚠️ 陈旧企业风：Open Sans · 黑名单\';display:block;font-size:10px;font-weight:700;color:#f97316;letter-spacing:.08em;margin-bottom:4px}.fx:nth-child(1)::after{content:\'WordPress 时代臃肿弧度，已被新时代超越\';display:block;font-size:13px;color:#f97316;margin-top:2px}.fx:nth-child(2){font-size:13px;line-height:1.5;color:#64748b}.fx:nth-child(3){font-size:11px;color:#94a3b8}'
    }
  ]
};
