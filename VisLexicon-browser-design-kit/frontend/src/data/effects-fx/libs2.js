// Curated foundational patterns
export default {
  "id": "libs2",
  "zh": "高级前端库模式",
  "en": "Advanced frontend library patterns",
  "dz": "高级库模式覆盖数据缓存、状态机、虚拟化、测试和错误边界。",
  "de": "Advanced library patterns cover data caching, state machines, virtualization, testing, and error boundaries.",
  "items": [
    {
      "id": "query-cache",
      "zh": "查询缓存",
      "en": "Query cache",
      "dz": "查询缓存按 key、过期和失效策略管理数据，而不是全局混存。",
      "de": "Manage cache by key, expiry, and invalidation instead of one global bag.",
      "pz": "查询缓存按 key、过期和失效策略管理数据，而不是全局混存。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Manage cache by key, expiry, and invalidation instead of one global bag. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#fff7f1;color:#4a2b18;border:1px solid #e3c1a3;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    },
    {
      "id": "mutation-state",
      "zh": "变更状态",
      "en": "Mutation state",
      "dz": "变更状态统一 idle、pending、success 和 error。",
      "de": "Unify idle, pending, success, and error mutation states.",
      "pz": "变更状态统一 idle、pending、success 和 error。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Unify idle, pending, success, and error mutation states. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#fff7f1;color:#4a2b18;border:1px solid #e3c1a3;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    },
    {
      "id": "optimistic-update",
      "zh": "乐观更新",
      "en": "Optimistic update",
      "dz": "乐观更新保留回滚快照并在失败时解释恢复。",
      "de": "Keep rollback snapshots and explain recovery after failure.",
      "pz": "乐观更新保留回滚快照并在失败时解释恢复。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Keep rollback snapshots and explain recovery after failure. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#fff7f1;color:#4a2b18;border:1px solid #e3c1a3;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    },
    {
      "id": "state-machine",
      "zh": "状态机",
      "en": "State machine",
      "dz": "复杂交互用状态机限制非法迁移和竞态。",
      "de": "Use state machines to restrict illegal transitions and races.",
      "pz": "复杂交互用状态机限制非法迁移和竞态。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Use state machines to restrict illegal transitions and races. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#fff7f1;color:#4a2b18;border:1px solid #e3c1a3;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    },
    {
      "id": "event-sourcing",
      "zh": "事件记录",
      "en": "Event sourcing",
      "dz": "关键变更记录事件和版本，便于审查与恢复。",
      "de": "Record events and versions for audit and recovery.",
      "pz": "关键变更记录事件和版本，便于审查与恢复。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Record events and versions for audit and recovery. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#fff7f1;color:#4a2b18;border:1px solid #e3c1a3;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    },
    {
      "id": "error-boundary",
      "zh": "错误边界",
      "en": "Error boundary",
      "dz": "局部错误边界隔离失败组件，保留页面其他功能。",
      "de": "Isolate failed components while preserving the rest of the page.",
      "pz": "局部错误边界隔离失败组件，保留页面其他功能。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Isolate failed components while preserving the rest of the page. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#fff7f1;color:#4a2b18;border:1px solid #e3c1a3;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    },
    {
      "id": "retry-boundary",
      "zh": "重试边界",
      "en": "Retry boundary",
      "dz": "重试只作用于失败请求，不重新执行用户已确认的副作用。",
      "de": "Retry failed requests without repeating confirmed side effects.",
      "pz": "重试只作用于失败请求，不重新执行用户已确认的副作用。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Retry failed requests without repeating confirmed side effects. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#fff7f1;color:#4a2b18;border:1px solid #e3c1a3;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    },
    {
      "id": "virtual-list",
      "zh": "虚拟列表",
      "en": "Virtual list",
      "dz": "虚拟列表保留测量、焦点和滚动锚点。",
      "de": "Virtual lists preserve measurement, focus, and scroll anchors.",
      "pz": "虚拟列表保留测量、焦点和滚动锚点。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Virtual lists preserve measurement, focus, and scroll anchors. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#fff7f1;color:#4a2b18;border:1px solid #e3c1a3;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    },
    {
      "id": "suspense-boundary",
      "zh": "加载边界",
      "en": "Suspense boundary",
      "dz": "加载边界只替换对应区域，不清空已可用内容。",
      "de": "Replace only the pending region instead of blanking usable content.",
      "pz": "加载边界只替换对应区域，不清空已可用内容。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Replace only the pending region instead of blanking usable content. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#fff7f1;color:#4a2b18;border:1px solid #e3c1a3;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    },
    {
      "id": "worker-offload",
      "zh": "Worker 卸载",
      "en": "Worker offload",
      "dz": "昂贵计算移到 worker，主线程优先响应输入。",
      "de": "Move expensive work to a worker and prioritize input.",
      "pz": "昂贵计算移到 worker，主线程优先响应输入。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Move expensive work to a worker and prioritize input. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#fff7f1;color:#4a2b18;border:1px solid #e3c1a3;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    },
    {
      "id": "request-dedup",
      "zh": "请求去重",
      "en": "Request deduplication",
      "dz": "相同查询共享请求并在最后一个订阅者离开时清理。",
      "de": "Share identical requests and clean up after the last subscriber leaves.",
      "pz": "相同查询共享请求并在最后一个订阅者离开时清理。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Share identical requests and clean up after the last subscriber leaves. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#fff7f1;color:#4a2b18;border:1px solid #e3c1a3;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    },
    {
      "id": "abort-signal",
      "zh": "取消信号",
      "en": "Abort signal",
      "dz": "组件卸载和新查询通过 AbortSignal 取消旧工作。",
      "de": "Cancel stale work on unmount or new query with AbortSignal.",
      "pz": "组件卸载和新查询通过 AbortSignal 取消旧工作。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Cancel stale work on unmount or new query with AbortSignal. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#fff7f1;color:#4a2b18;border:1px solid #e3c1a3;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    },
    {
      "id": "schema-parse",
      "zh": "数据解析",
      "en": "Schema parsing",
      "dz": "外部数据进入界面前经过 schema 校验和可解释错误。",
      "de": "Validate external data with schemas and explain errors before rendering.",
      "pz": "外部数据进入界面前经过 schema 校验和可解释错误。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Validate external data with schemas and explain errors before rendering. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#fff7f1;color:#4a2b18;border:1px solid #e3c1a3;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    },
    {
      "id": "feature-flag",
      "zh": "功能开关",
      "en": "Feature flag",
      "dz": "功能开关可回退、可审计，不让隐藏代码永久漂移。",
      "de": "Feature flags have rollback and audit paths.",
      "pz": "功能开关可回退、可审计，不让隐藏代码永久漂移。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Feature flags have rollback and audit paths. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#fff7f1;color:#4a2b18;border:1px solid #e3c1a3;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    },
    {
      "id": "telemetry-boundary",
      "zh": "遥测边界",
      "en": "Telemetry boundary",
      "dz": "遥测脱敏并与核心业务失败隔离。",
      "de": "Redact telemetry and isolate it from core failures.",
      "pz": "遥测脱敏并与核心业务失败隔离。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Redact telemetry and isolate it from core failures. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#fff7f1;color:#4a2b18;border:1px solid #e3c1a3;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    },
    {
      "id": "test-fixture",
      "zh": "测试夹具",
      "en": "Test fixture",
      "dz": "夹具表达真实状态和边界，不复制实现细节。",
      "de": "Fixtures model real states and boundaries without mirroring internals.",
      "pz": "夹具表达真实状态和边界，不复制实现细节。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Fixtures model real states and boundaries without mirroring internals. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#fff7f1;color:#4a2b18;border:1px solid #e3c1a3;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    },
    {
      "id": "contract-test",
      "zh": "契约测试",
      "en": "Contract test",
      "dz": "接口契约测试保护字段、错误和版本兼容。",
      "de": "Contract tests protect fields, errors, and version compatibility.",
      "pz": "接口契约测试保护字段、错误和版本兼容。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Contract tests protect fields, errors, and version compatibility. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#fff7f1;color:#4a2b18;border:1px solid #e3c1a3;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    },
    {
      "id": "e2e-flow",
      "zh": "端到端流程",
      "en": "End-to-end flow",
      "dz": "端到端测试覆盖真实用户路径和恢复，而不是只点按钮。",
      "de": "Cover real user paths and recovery, not button clicks alone.",
      "pz": "端到端测试覆盖真实用户路径和恢复，而不是只点按钮。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Cover real user paths and recovery, not button clicks alone. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#fff7f1;color:#4a2b18;border:1px solid #e3c1a3;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    },
    {
      "id": "bundle-split",
      "zh": "包拆分",
      "en": "Bundle splitting",
      "dz": "按路由和功能拆分包，首屏不加载未使用库。",
      "de": "Split by route and feature so first load avoids unused libraries.",
      "pz": "按路由和功能拆分包，首屏不加载未使用库。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Split by route and feature so first load avoids unused libraries. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#fff7f1;color:#4a2b18;border:1px solid #e3c1a3;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    },
    {
      "id": "library-audit",
      "zh": "库审查",
      "en": "Library audit",
      "dz": "发布前检查缓存、并发、错误边界、性能、隐私和测试。",
      "de": "Audit caching, concurrency, boundaries, performance, privacy, and tests.",
      "pz": "发布前检查缓存、并发、错误边界、性能、隐私和测试。 在真实数据、失败恢复和中英文切换下复核。",
      "pe": "Audit caching, concurrency, boundaries, performance, privacy, and tests. Validate real data, failure recovery, and locale switching.",
      "demo": "box",
      "css": ".fx{background:#fff7f1;color:#4a2b18;border:1px solid #e3c1a3;border-radius:10px;box-shadow:0 5px 16px #00000012}"
    }
  ]
};
