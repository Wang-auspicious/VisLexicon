// Curated foundational patterns
export default {
  "id": "fintech",
  "zh": "金融与数据产品",
  "en": "Fintech and data products",
  "dz": "金融界面统一金额、风险、时间、权限和可审计反馈。",
  "de": "Fintech interfaces unify amounts, risk, time, permissions, and auditable feedback.",
  "items": [
    {
      "id": "money-format",
      "zh": "金额格式",
      "en": "Money formatting",
      "dz": "金额按货币、小数和本地化规则格式化，避免浮点误读。",
      "de": "Format by currency, precision, and locale without floating-point ambiguity.",
      "pz": "金额按货币、小数和本地化规则格式化，避免浮点误读。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Format by currency, precision, and locale without floating-point ambiguity. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      cells: ["¥1,204.50"], "css": `.fx{width:186px;height:64px;border-radius:10px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #c5d0c8;color:#202824;font:600 18px/1 var(--fx-mono);font-variant-numeric:tabular-nums;position:relative;overflow:hidden;animation:mf3 4.4s ease-in-out infinite}@keyframes mf3{0%,100%{letter-spacing:0}50%{letter-spacing:.06em}}`
    },
    {
      "id": "decimal-input",
      "zh": "小数输入",
      "en": "Decimal input",
      "dz": "金额输入允许合法小数并拒绝不完整提交。",
      "de": "Accept valid decimals and reject incomplete submissions.",
      "pz": "金额输入允许合法小数并拒绝不完整提交。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Accept valid decimals and reject incomplete submissions. Validate real data, failure recovery, and locale switching.",
      "demo": "field",
      cells: [""], "css": `.fxfield .fx{width:180px;height:42px;border-radius:9px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #c5d0c8;position:relative;overflow:visible}.fx::after{content:'0.00';position:absolute;right:14px;top:50%;transform:translateY(-50%);color:#b0b3a9;font:600 14px/1 var(--fx-mono);animation:di4 3.8s steps(6,end) infinite}@keyframes di4{0%{content:'0.00'}16%{content:'1'}33%{content:'1.'}50%{content:'1.2'}66%{content:'1.25'}100%{content:'1.25'}}`
    },
    {
      "id": "currency-switch",
      "zh": "货币切换",
      "en": "Currency switch",
      "dz": "货币切换同时更新符号、汇率时间和金额解释。",
      "de": "Update symbol, rate timestamp, and explanation together.",
      "pz": "货币切换同时更新符号、汇率时间和金额解释。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Update symbol, rate timestamp, and explanation together. Validate real data, failure recovery, and locale switching.",
      "demo": "pill",
      cells: ["CNY","USD","EUR"], "css": `.fxpill{gap:6px;padding:4px;border-radius:11px;background:linear-gradient(#eef1ec,#e4e7e0);border:1px solid #dfe3db}.fx{width:auto;min-width:52px;height:32px;border-radius:8px;background:transparent;color:#5d6b57;font:600 11px/1 var(--fx-mono);padding:0 10px;animation:cs12 4.2s ease-in-out infinite;animation-delay:calc(var(--i) * .3s)}.fx:nth-child(2){animation-name:cs12b}@keyframes cs12{0%,100%{background:transparent;color:#5d6b57}38%,68%{background:#fff;color:#202824;box-shadow:0 4px 10px -6px #2b3a4466}}@keyframes cs12b{0%,100%{background:#fff;color:#202824;box-shadow:0 4px 10px -6px #2b3a4466}38%,68%{background:transparent;color:#5d6b57;box-shadow:none}}`
    },
    {
      "id": "rate-stale",
      "zh": "汇率过期",
      "en": "Stale rate",
      "dz": "汇率显示更新时间和过期状态，不伪装实时。",
      "de": "Show rate timestamp and stale state instead of implying real time.",
      "pz": "汇率显示更新时间和过期状态，不伪装实时。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Show rate timestamp and stale state instead of implying real time. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      cells: ["汇率 12 分钟前"], "css": `.fx{width:190px;height:62px;border-radius:10px;background:linear-gradient(#fdf7ee,#f9eeda);border:1px solid #e0a35c;color:#8a4a1e;font:600 11.5px/1 var(--fx-sans);position:relative;overflow:hidden;animation:rs8 4s ease-in-out infinite}@keyframes rs8{0%,100%{opacity:.68}48%,76%{opacity:1}}`
    },
    {
      "id": "risk-label",
      "zh": "风险标签",
      "en": "Risk label",
      "dz": "风险标签说明等级、依据和更新时间，不只使用红黄绿。",
      "de": "Explain level, basis, and timestamp beyond red-yellow-green.",
      "pz": "风险标签说明等级、依据和更新时间，不只使用红黄绿。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Explain level, basis, and timestamp beyond red-yellow-green. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      cells: ["中等风险"], "css": `.fx{width:170px;height:58px;border-radius:10px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #c5d0c8;color:#202824;font:600 12px/1 var(--fx-sans);position:relative;overflow:hidden;padding-left:44px;justify-content:flex-start}.fx::before{content:'';position:absolute;left:14px;top:50%;width:18px;height:18px;margin-top:-9px;border-radius:5px;background:linear-gradient(#e0a35c,#c08a2e);animation:rl3 3.8s ease-in-out infinite}@keyframes rl3{0%,100%{transform:rotate(0)}50%{transform:rotate(45deg)}}`
    },
    {
      "id": "transaction-row",
      "zh": "交易行",
      "en": "Transaction row",
      "dz": "交易行显示状态、金额、对手方和时间，长文本可展开。",
      "de": "Show state, amount, counterparty, and time with expandable long text.",
      "pz": "交易行显示状态、金额、对手方和时间，长文本可展开。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Show state, amount, counterparty, and time with expandable long text. Validate real data, failure recovery, and locale switching.",
      "demo": "list",
      n: 4, cells: ["咖啡 · −¥32","工资 · +¥18,400","房租 · −¥5,200","退款 · +¥199"], "css": `.fxcol{gap:0;width:196px;border:1px solid #dfe3db;border-radius:10px;overflow:hidden;background:#fff}.fx{height:32px;border-radius:0;background:#fff;border-bottom:1px solid #eef1ec;color:#202824;font:600 10.5px/1 var(--fx-mono);justify-content:space-between;padding:0 12px;position:relative}.fx:nth-child(1),.fx:nth-child(3){color:#8e2a1f}.fx:nth-child(2),.fx:nth-child(4){color:#2f6440}.fx{animation:tr4 4s ease-in-out infinite;animation-delay:calc(var(--i) * .14s)}@keyframes tr4{0%,100%{opacity:.75}46%,74%{opacity:1}}`
    },
    {
      "id": "pending-state",
      "zh": "处理中",
      "en": "Pending transaction",
      "dz": "处理中状态可取消或追踪，不把等待显示成成功。",
      "de": "Pending actions can be cancelled or tracked, never shown as success.",
      "pz": "处理中状态可取消或追踪，不把等待显示成成功。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Pending actions can be cancelled or tracked, never shown as success. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      cells: ["交易处理中"], "css": `.fx{width:180px;height:62px;border-radius:10px;background:linear-gradient(#fdf7ee,#f9eeda);border:1px solid #e0a35c;color:#8a4a1e;font:600 11.5px/1 var(--fx-sans);position:relative;overflow:hidden}.fx::after{content:'';position:absolute;left:14px;right:14px;bottom:12px;height:5px;border-radius:3px;background:repeating-linear-gradient(90deg,#e0a35c 0 12px,transparent 12px 22px);transform-origin:left;animation:ps5 3.4s linear infinite}@keyframes ps5{0%{transform:scaleX(.15)}100%{transform:scaleX(1)}}`
    },
    {
      "id": "failed-payment",
      "zh": "支付失败",
      "en": "Failed payment",
      "dz": "失败说明原因和下一步，保留用户输入且不重复扣款。",
      "de": "Explain failure, preserve input, and avoid duplicate charges.",
      "pz": "失败说明原因和下一步，保留用户输入且不重复扣款。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Explain failure, preserve input, and avoid duplicate charges. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      cells: ["支付失败 · 重试"], "css": `.fx{width:186px;height:62px;border-radius:10px;background:linear-gradient(#fff6f6,#fdecec);border:1px solid #c0392b;color:#8e2a1f;font:600 11.5px/1 var(--fx-sans);position:relative;overflow:hidden;animation:fp2 3.6s ease-in-out infinite}@keyframes fp2{0%,100%{transform:translateX(0)}18%{transform:translateX(-5px)}36%{transform:translateX(5px)}54%,100%{transform:translateX(0)}}`
    },
    {
      "id": "confirmation-step",
      "zh": "确认步骤",
      "en": "Confirmation step",
      "dz": "高风险操作在确认页总结金额、对象和不可逆性。",
      "de": "Summarize amount, target, and irreversibility before high-risk actions.",
      "pz": "高风险操作在确认页总结金额、对象和不可逆性。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Summarize amount, target, and irreversibility before high-risk actions. Validate real data, failure recovery, and locale switching.",
      "demo": "dots",
      n: 3, cells: ["1","2","3"], "css": `.fxdots{gap:0;position:relative}.fx{width:30px;height:30px;border-radius:50%;background:linear-gradient(#fff,#f2f4f0);border:1px solid #c5d0c8;color:#8b8d84;font:700 11px/29px var(--fx-mono);text-align:center;animation:cs13 4.4s steps(1,end) infinite;animation-delay:calc(var(--i) * 1.1s)}.fxdots::after{content:'';position:absolute;left:24px;right:24px;top:50%;height:1.5px;background:#dfe3db;z-index:-1}@keyframes cs13{0%,24%{background:linear-gradient(#3f6f92,#31597a);color:#fff;border-color:#31597a}25%,100%{background:linear-gradient(#fff,#f2f4f0);color:#8b8d84;border-color:#c5d0c8}}`
    },
    {
      "id": "audit-log",
      "zh": "审计日志",
      "en": "Audit log",
      "dz": "审计日志按时间、操作者和字段差异记录关键变更。",
      "de": "Record key changes by time, actor, and field diff.",
      "pz": "审计日志按时间、操作者和字段差异记录关键变更。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Record key changes by time, actor, and field diff. Validate real data, failure recovery, and locale switching.",
      "demo": "list",
      n: 4, cells: ["09:02 登录","09:14 转账 ¥200","09:15 短信验证","09:16 成功"], "css": `.fxcol{gap:0;width:186px;padding-left:14px;position:relative}.fx{height:28px;border-left:1.5px solid #dfe3db;border-radius:0;background:transparent;color:#5d6b57;font:500 10px/1 var(--fx-mono);justify-content:flex-start;padding-left:12px;position:relative;animation:al3 4s ease-in-out infinite;animation-delay:calc(var(--i) * .16s)}.fx::before{content:'';position:absolute;left:-4.5px;top:50%;width:8px;height:8px;margin-top:-4px;border-radius:50%;background:#c5d0c8}.fx:nth-child(4)::before{background:#3d7a52}@keyframes al3{0%,100%{opacity:.6}46%,74%{opacity:1}}`
    },
    {
      "id": "data-density",
      "zh": "数据密度",
      "en": "Data density",
      "dz": "密集数据保留扫描层级，重要异常不被表格噪声淹没。",
      "de": "Keep scanning hierarchy so anomalies are not lost in dense data.",
      "pz": "密集数据保留扫描层级，重要异常不被表格噪声淹没。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Keep scanning hierarchy so anomalies are not lost in dense data. Validate real data, failure recovery, and locale switching.",
      "demo": "list",
      n: 4, cells: ["一","二","三","四"], "css": `.fxcol{gap:6px;width:160px;animation:dd4 4.4s ease-in-out infinite}.fx{height:26px;border-radius:6px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #dfe3db;color:#5d6b57;font:600 10px/1 var(--fx-mono);background-image:repeating-linear-gradient(90deg,#3f6f9255 0 30% ,transparent 30%);animation:dd5 4s ease-in-out infinite;animation-delay:calc(var(--i) * .12s)}@keyframes dd4{0%,32%{gap:6px}52%,80%{gap:14px}100%{gap:6px}}@keyframes dd5{0%,100%{opacity:.65}46%,74%{opacity:1}}`
    },
    {
      "id": "chart-tooltip",
      "zh": "图表提示",
      "en": "Chart tooltip",
      "dz": "提示显示单位、时间和精确值，键盘也能访问。",
      "de": "Show unit, time, and exact value with keyboard access.",
      "pz": "提示显示单位、时间和精确值，键盘也能访问。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Show unit, time, and exact value with keyboard access. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      cells: [""], "css": `.fx{width:190px;height:104px;border-radius:11px;background:linear-gradient(#fff,#f4f6f2);border:1px solid #e0e4dc;position:relative;overflow:visible}.fx::before{content:'';position:absolute;left:14px;right:14px;bottom:14px;height:56px;background:repeating-linear-gradient(90deg,#3f6f9244 0 10px,transparent 10px 20px)}.fx::after{content:'09-10 · −¥32';position:absolute;right:0;top:14px;padding:6px 9px;border-radius:7px;background:linear-gradient(#252a33,#1a1e25);color:#e7ecf1;font:600 9.5px/1 var(--fx-mono);white-space:nowrap;animation:ct5 4s ease-in-out infinite}@keyframes ct5{0%,100%{opacity:.15;transform:translateY(6px)}46%,74%{opacity:1;transform:none}}`
    },
    {
      "id": "balance-card",
      "zh": "余额卡片",
      "en": "Balance card",
      "dz": "余额卡片区分可用、冻结和待入账金额。",
      "de": "Separate available, held, and pending balances.",
      "pz": "余额卡片区分可用、冻结和待入账金额。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Separate available, held, and pending balances. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      cells: ["¥ 24,880.00"], "css": `.fx{width:190px;height:104px;border-radius:14px;background:linear-gradient(140deg,#3f6f92,#22405a 62%,#1b2f42);color:#fff;font:600 20px/1 var(--fx-mono);font-variant-numeric:tabular-nums;position:relative;overflow:hidden;box-shadow:0 22px 36px -24px #22405a}@keyframes bc3{to{opacity:1}}.fx::after{content:'';position:absolute;left:-30%;top:-40%;width:80%;height:180%;background:linear-gradient(90deg,transparent,#ffffff33,transparent);animation:bc3sheen 5s ease-in-out infinite}@keyframes bc3sheen{0%{transform:translateX(0)}100%{transform:translateX(240%)}}`
    },
    {
      "id": "limit-warning",
      "zh": "限额提示",
      "en": "Limit warning",
      "dz": "接近限额时提前说明剩余额度和调整路径。",
      "de": "Explain remaining limit and adjustment path before reaching it.",
      "pz": "接近限额时提前说明剩余额度和调整路径。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Explain remaining limit and adjustment path before reaching it. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      cells: ["接近限额 92%"], "css": `.fx{width:186px;height:70px;border-radius:10px;background:linear-gradient(#fff6f6,#fdecec);border:1px solid #e0a8a0;color:#8e2a1f;font:600 11.5px/1 var(--fx-sans);position:relative;overflow:hidden}.fx::after{content:'';position:absolute;left:16px;right:16px;bottom:14px;height:7px;border-radius:4px;background:linear-gradient(90deg,#e0a35c 0 72%,#c0392b 72% 92%,#e6cdc8 92%);animation:lw 3.8s ease-in-out infinite}@keyframes lw{0%,100%{transform:scaleX(.9);transform-origin:left}50%{transform:scaleX(1);transform-origin:left}}`
    },
    {
      "id": "consent-payment",
      "zh": "支付同意",
      "en": "Payment consent",
      "dz": "支付同意说明金额、商户、周期和撤销方式。",
      "de": "State amount, merchant, cadence, and cancellation path.",
      "pz": "支付同意说明金额、商户、周期和撤销方式。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "State amount, merchant, cadence, and cancellation path. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      cells: ["☑ 我已阅读授权条款"], "css": `.fx{width:200px;height:62px;border-radius:10px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #c5d0c8;color:#202824;font:600 11px/1 var(--fx-sans);position:relative;overflow:visible;padding-left:38px;justify-content:flex-start;animation:cp5 3.8s ease-in-out infinite}@keyframes cp5{0%,100%{border-color:#c5d0c8}48%,76%{border-color:#3f6f92;background:linear-gradient(#eef4f8,#e2ebf1)}}.fx::before{content:'';position:absolute;left:14px;top:50%;width:14px;height:14px;margin-top:-7px;border-radius:4px;background:#3f6f92}`
    },
    {
      "id": "statement-filter",
      "zh": "账单筛选",
      "en": "Statement filter",
      "dz": "账单筛选支持时间、状态、金额和导出范围。",
      "de": "Filter statements by time, status, amount, and export scope.",
      "pz": "账单筛选支持时间、状态、金额和导出范围。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Filter statements by time, status, amount, and export scope. Validate real data, failure recovery, and locale switching.",
      "demo": "pill",
      cells: ["本月","上月","自定义"], "css": `.fxpill{gap:8px}.fx{width:auto;height:32px;border-radius:999px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #dfe3db;color:#5d6b57;font:600 10.5px/1 var(--fx-sans);padding:0 14px;animation:sf2 4s ease-in-out infinite;animation-delay:calc(var(--i) * .16s)}.fx:nth-child(1){background:linear-gradient(#3f6f92,#31597a);border-color:#31597a;color:#fff}@keyframes sf2{0%,100%{opacity:.7}46%,74%{opacity:1}}`
    },
    {
      "id": "tax-breakdown",
      "zh": "税费拆分",
      "en": "Tax breakdown",
      "dz": "税费拆分显示计算基础和舍入规则。",
      "de": "Show tax basis and rounding rules.",
      "pz": "税费拆分显示计算基础和舍入规则。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Show tax basis and rounding rules. Validate real data, failure recovery, and locale switching.",
      "demo": "list",
      n: 3, cells: ["小计 · ¥1,100.00","税 9% · ¥99.00","合计 · ¥1,199.00"], "css": `.fxcol{gap:0;width:186px;border:1px solid #dfe3db;border-radius:10px;overflow:hidden;background:#fff}.fx{height:32px;border-radius:0;background:#fff;border-bottom:1px solid #eef1ec;color:#202824;font:600 10.5px/1 var(--fx-mono);justify-content:space-between;padding:0 12px;font-variant-numeric:tabular-nums}.fx:nth-child(3){background:linear-gradient(#eef4f8,#e2ebf1);color:#26485c;font-weight:700;border-bottom:0}.fx:nth-child(3){animation:tb3 3.8s ease-in-out infinite}@keyframes tb3{0%,100%{opacity:.75}48%,76%{opacity:1}}`
    },
    {
      "id": "fintech-locale",
      "zh": "金融语言",
      "en": "Fintech locale",
      "dz": "金额、日期、错误和风险说明完全跟随全局语言。",
      "de": "Amounts, dates, errors, and risk copy follow the global locale.",
      "pz": "金额、日期、错误和风险说明完全跟随全局语言。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Amounts, dates, errors, and risk copy follow the global locale. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      cells: ["¥1,204.50 · $168.20"], "css": `.fx{width:200px;height:64px;border-radius:10px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #c5d0c8;color:#202824;font:600 13px/1 var(--fx-mono);font-variant-numeric:tabular-nums;animation:fl5 4.4s steps(1,end) infinite}@keyframes fl5{0%,49%{letter-spacing:0}50%,100%{letter-spacing:.06em}}`
    },
    {
      "id": "fintech-a11y",
      "zh": "金融无障碍",
      "en": "Fintech accessibility",
      "dz": "金融数据提供文本等价物和清晰的焦点顺序。",
      "de": "Provide text equivalents and clear focus order for financial data.",
      "pz": "金融数据提供文本等价物和清晰的焦点顺序。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Provide text equivalents and clear focus order for financial data. Validate real data, failure recovery, and locale switching.",
      "demo": "list",
      n: 4, cells: ["金额可读屏","涨跌不只靠色","输入有格式提示","确认可回退"], "css": `.fxcol{gap:6px;width:180px}.fx{height:28px;border-radius:7px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #dfe3db;color:#202824;font:500 10.5px/1 var(--fx-sans);justify-content:flex-start;padding:0 28px 0 11px;position:relative;animation:fa5 4s ease-in-out infinite;animation-delay:calc(var(--i) * .14s)}.fx::after{content:'✓';position:absolute;right:10px;color:#3d7a52;font-family:var(--fx-mono);opacity:0;animation:fa5c 4s ease-in-out infinite;animation-delay:calc(var(--i) * .14s)}@keyframes fa5{0%,100%{opacity:.55}42%,66%{opacity:1}}@keyframes fa5c{0%,100%{opacity:0}45%,72%{opacity:1}}`
    },
    {
      "id": "fintech-audit",
      "zh": "金融审查",
      "en": "Fintech audit",
      "dz": "发布前检查金额、权限、隐私、审计和失败恢复。",
      "de": "Audit amounts, permissions, privacy, logs, and recovery.",
      "pz": "发布前检查金额、权限、隐私、审计和失败恢复。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Audit amounts, permissions, privacy, logs, and recovery. Validate real data, failure recovery, and locale switching.",
      "demo": "list",
      n: 4, cells: ["金额精度一致","失败可重试","限额有预警","流水可追溯"], "css": `.fxcol{gap:6px;width:180px}.fx{height:28px;border-radius:7px;background:linear-gradient(#fff,#f2f4f0);border:1px solid #dfe3db;color:#202824;font:500 10.5px/1 var(--fx-sans);justify-content:flex-start;padding:0 28px 0 11px;position:relative;animation:fa6 4s ease-in-out infinite;animation-delay:calc(var(--i) * .14s)}.fx::after{content:'✓';position:absolute;right:10px;color:#3d7a52;font-family:var(--fx-mono);opacity:0;animation:fa6c 4s ease-in-out infinite;animation-delay:calc(var(--i) * .14s)}@keyframes fa6{0%,100%{opacity:.55}42%,66%{opacity:1}}@keyframes fa6c{0%,100%{opacity:0}45%,72%{opacity:1}}`
    }
  ]
};
