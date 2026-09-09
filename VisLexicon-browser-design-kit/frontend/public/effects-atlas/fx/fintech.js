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
      "css": ".fx{background:#f4faf4;color:#1e3a28;border:1px solid #b8d6bd;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    },
    {
      "id": "decimal-input",
      "zh": "小数输入",
      "en": "Decimal input",
      "dz": "金额输入允许合法小数并拒绝不完整提交。",
      "de": "Accept valid decimals and reject incomplete submissions.",
      "pz": "金额输入允许合法小数并拒绝不完整提交。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Accept valid decimals and reject incomplete submissions. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f4faf4;color:#1e3a28;border:1px solid #b8d6bd;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    },
    {
      "id": "currency-switch",
      "zh": "货币切换",
      "en": "Currency switch",
      "dz": "货币切换同时更新符号、汇率时间和金额解释。",
      "de": "Update symbol, rate timestamp, and explanation together.",
      "pz": "货币切换同时更新符号、汇率时间和金额解释。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Update symbol, rate timestamp, and explanation together. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f4faf4;color:#1e3a28;border:1px solid #b8d6bd;border-radius:10px;box-shadow:0 5px 16px #00000012}"
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
      "css": ".fx{background:#f4faf4;color:#1e3a28;border:1px solid #b8d6bd;border-radius:10px;box-shadow:0 5px 16px #00000012}"
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
      "css": ".fx{background:#f4faf4;color:#1e3a28;border:1px solid #b8d6bd;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    },
    {
      "id": "transaction-row",
      "zh": "交易行",
      "en": "Transaction row",
      "dz": "交易行显示状态、金额、对手方和时间，长文本可展开。",
      "de": "Show state, amount, counterparty, and time with expandable long text.",
      "pz": "交易行显示状态、金额、对手方和时间，长文本可展开。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Show state, amount, counterparty, and time with expandable long text. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f4faf4;color:#1e3a28;border:1px solid #b8d6bd;border-radius:10px;box-shadow:0 5px 16px #00000012}"
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
      "css": ".fx{background:#f4faf4;color:#1e3a28;border:1px solid #b8d6bd;border-radius:10px;box-shadow:0 5px 16px #00000012}"
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
      "css": ".fx{background:#f4faf4;color:#1e3a28;border:1px solid #b8d6bd;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    },
    {
      "id": "confirmation-step",
      "zh": "确认步骤",
      "en": "Confirmation step",
      "dz": "高风险操作在确认页总结金额、对象和不可逆性。",
      "de": "Summarize amount, target, and irreversibility before high-risk actions.",
      "pz": "高风险操作在确认页总结金额、对象和不可逆性。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Summarize amount, target, and irreversibility before high-risk actions. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f4faf4;color:#1e3a28;border:1px solid #b8d6bd;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    },
    {
      "id": "audit-log",
      "zh": "审计日志",
      "en": "Audit log",
      "dz": "审计日志按时间、操作者和字段差异记录关键变更。",
      "de": "Record key changes by time, actor, and field diff.",
      "pz": "审计日志按时间、操作者和字段差异记录关键变更。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Record key changes by time, actor, and field diff. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f4faf4;color:#1e3a28;border:1px solid #b8d6bd;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    },
    {
      "id": "data-density",
      "zh": "数据密度",
      "en": "Data density",
      "dz": "密集数据保留扫描层级，重要异常不被表格噪声淹没。",
      "de": "Keep scanning hierarchy so anomalies are not lost in dense data.",
      "pz": "密集数据保留扫描层级，重要异常不被表格噪声淹没。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Keep scanning hierarchy so anomalies are not lost in dense data. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f4faf4;color:#1e3a28;border:1px solid #b8d6bd;border-radius:10px;box-shadow:0 5px 16px #00000012}"
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
      "css": ".fx{background:#f4faf4;color:#1e3a28;border:1px solid #b8d6bd;border-radius:10px;box-shadow:0 5px 16px #00000012}"
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
      "css": ".fx{background:#f4faf4;color:#1e3a28;border:1px solid #b8d6bd;border-radius:10px;box-shadow:0 5px 16px #00000012}"
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
      "css": ".fx{background:#f4faf4;color:#1e3a28;border:1px solid #b8d6bd;border-radius:10px;box-shadow:0 5px 16px #00000012}"
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
      "css": ".fx{background:#f4faf4;color:#1e3a28;border:1px solid #b8d6bd;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    },
    {
      "id": "statement-filter",
      "zh": "账单筛选",
      "en": "Statement filter",
      "dz": "账单筛选支持时间、状态、金额和导出范围。",
      "de": "Filter statements by time, status, amount, and export scope.",
      "pz": "账单筛选支持时间、状态、金额和导出范围。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Filter statements by time, status, amount, and export scope. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f4faf4;color:#1e3a28;border:1px solid #b8d6bd;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    },
    {
      "id": "tax-breakdown",
      "zh": "税费拆分",
      "en": "Tax breakdown",
      "dz": "税费拆分显示计算基础和舍入规则。",
      "de": "Show tax basis and rounding rules.",
      "pz": "税费拆分显示计算基础和舍入规则。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Show tax basis and rounding rules. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f4faf4;color:#1e3a28;border:1px solid #b8d6bd;border-radius:10px;box-shadow:0 5px 16px #00000012}"
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
      "css": ".fx{background:#f4faf4;color:#1e3a28;border:1px solid #b8d6bd;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    },
    {
      "id": "fintech-a11y",
      "zh": "金融无障碍",
      "en": "Fintech accessibility",
      "dz": "金融数据提供文本等价物和清晰的焦点顺序。",
      "de": "Provide text equivalents and clear focus order for financial data.",
      "pz": "金融数据提供文本等价物和清晰的焦点顺序。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Provide text equivalents and clear focus order for financial data. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f4faf4;color:#1e3a28;border:1px solid #b8d6bd;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    },
    {
      "id": "fintech-audit",
      "zh": "金融审查",
      "en": "Fintech audit",
      "dz": "发布前检查金额、权限、隐私、审计和失败恢复。",
      "de": "Audit amounts, permissions, privacy, logs, and recovery.",
      "pz": "发布前检查金额、权限、隐私、审计和失败恢复。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Audit amounts, permissions, privacy, logs, and recovery. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#f4faf4;color:#1e3a28;border:1px solid #b8d6bd;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    }
  ]
};
