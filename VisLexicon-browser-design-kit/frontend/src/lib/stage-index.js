/* ============ 舞台索引 ============
 * 把手写的舞台清单（stage manifest）与生成态图鉴语料 visual-atlas.json 对齐。
 *
 * 认领关系一律写在 manifest 侧：visual-atlas.json 带 generatedAt / revision，
 * 是采集流水线的产物，手改的字段下次重跑就没了。人写的归人，机器生成的归机器。
 *
 * 一条术语通过三种挂法之一落到舞台上：
 *   variant  可切换变体 —— 点它，中间换一种演法
 *   hotspot  部件热区   —— 悬停它，中间对应部件描边高亮
 *   param    连续参数   —— 拖它，中间实时跟着变
 * 另有 knobs：没有对应术语的纯微调旋钮（距底几像素这类），不参与术语路由。
 */

export const SLOTS = ['variant', 'hotspot', 'param']

export const SLOT_LABEL = {
  variant: '变体',
  hotspot: '部件',
  param: '参数',
}

export const PARAM_TYPES = ['range', 'boolean', 'enum']

/* 参数不只有连续量。手势库的配置项里，threshold 是连续的、filterTaps 是开关、
 * axis 是枚举——把后两者硬塞成滑杆就是在扭曲事实，所以 param 带类型。 */
function validateParam(stageId, claim, errors) {
  const p = claim.param
  if (!p || typeof p !== 'object') {
    errors.push(`舞台 ${stageId} 的 ${claim.termId} 声明为 param 却没有 param 描述`)
    return false
  }
  if (!p.key) errors.push(`舞台 ${stageId} 的 ${claim.termId} 缺少 param.key`)
  const type = p.type || 'range'
  if (!PARAM_TYPES.includes(type)) {
    errors.push(`舞台 ${stageId} 的 ${p.key} 使用了未知参数类型：${type}`)
    return true
  }
  if (type === 'range') {
    if (!(p.min < p.max)) errors.push(`舞台 ${stageId} 的 ${p.key} 区间非法：min 必须小于 max`)
    if (!(p.step > 0)) errors.push(`舞台 ${stageId} 的 ${p.key} step 必须为正数`)
    if (p.default < p.min || p.default > p.max) {
      errors.push(`舞台 ${stageId} 的 ${p.key} 默认值 ${p.default} 落在区间外`)
    }
  }
  if (type === 'boolean' && typeof p.default !== 'boolean') {
    errors.push(`舞台 ${stageId} 的 ${p.key} 是开关型，默认值必须是布尔`)
  }
  if (type === 'enum') {
    if (!Array.isArray(p.choices) || p.choices.length < 2) {
      errors.push(`舞台 ${stageId} 的 ${p.key} 是枚举型，至少要给两个可选值`)
    } else if (!p.choices.includes(p.default)) {
      errors.push(`舞台 ${stageId} 的 ${p.key} 默认值不在可选值里`)
    }
  }
  return true
}

/* manifests + atlas → 正向分组、反向索引、未建档余量。
 * strict 下任何认领错误直接抛，让构建期和测试挡住写错的术语 id，
 * 避免一个手滑的 id 让某条术语在界面上悄无声息地消失。 */
export function buildStageIndex(manifests, atlas, { strict = true } = {}) {
  const entries = Array.isArray(atlas?.entries) ? atlas.entries : []
  const entryById = new Map(entries.map((entry) => [entry.id, entry]))
  const errors = []
  const byTerm = new Map()

  const stages = manifests.map((manifest) => {
    const claims = []
    const seen = new Set()

    for (const claim of manifest.claims || []) {
      const term = entryById.get(claim.termId)
      if (!term) {
        errors.push(`舞台 ${manifest.id} 认领了不存在的术语：${claim.termId}`)
        continue
      }
      if (!SLOTS.includes(claim.slot)) {
        errors.push(`舞台 ${manifest.id} 的 ${claim.termId} 使用了未知挂法：${claim.slot}`)
        continue
      }
      if (seen.has(claim.termId)) {
        errors.push(`舞台 ${manifest.id} 重复认领术语：${claim.termId}`)
        continue
      }
      if (claim.slot === 'param' && !validateParam(manifest.id, claim, errors)) continue
      if (claim.slot === 'hotspot' && !claim.node) {
        errors.push(`舞台 ${manifest.id} 的 ${claim.termId} 声明为 hotspot 却没有 node`)
        continue
      }

      if (claim.termZhFix && claim.termZhFix === term.termZh) {
        errors.push(`舞台 ${manifest.id} 的 ${claim.termId} 订正译名与语料原译相同，删掉它`)
        continue
      }

      seen.add(claim.termId)
      const zhFixed = Boolean(claim.termZhFix)
      const resolved = {
        ...claim,
        stageId: manifest.id,
        term,
        /* 上了台的条目用订正名显示。语料里的机器译名不改也改不动
         * （visual-atlas.json 是流水线产物），订正只落在舞台侧。 */
        displayZh: zhFixed ? claim.termZhFix : term.termZh,
        zhFixed,
      }
      claims.push(resolved)
      if (!byTerm.has(claim.termId)) byTerm.set(claim.termId, [])
      byTerm.get(claim.termId).push(resolved)
    }

    /* 有些部件只在某个变体下才存在（骨架屏只在加载态里）。
     * 声明 underVariant 后，点这条术语会先把舞台切到那个变体，再描边。 */
    for (const claim of claims) {
      if (!claim.underVariant) continue
      const host = claims.find((c) => c.termId === claim.underVariant && c.slot === 'variant')
      if (!host) errors.push(`舞台 ${manifest.id} 的 ${claim.termId} 依附于不存在的变体：${claim.underVariant}`)
    }

    const groups = SLOTS.map((slot) => ({
      slot,
      label: SLOT_LABEL[slot],
      claims: claims.filter((claim) => claim.slot === slot),
    })).filter((group) => group.claims.length)

    return {
      id: manifest.id,
      titleZh: manifest.titleZh,
      titleEn: manifest.titleEn,
      summaryZh: manifest.summaryZh,
      specimen: manifest.specimen || {},
      baseVariantZh: manifest.baseVariantZh || '默认',
      knobs: manifest.knobs || [],
      claims,
      groups,
    }
  })

  if (errors.length && strict) {
    throw new Error(`舞台认领校验失败：\n- ${errors.join('\n- ')}`)
  }

  const unrouted = entries.filter((entry) => !byTerm.has(entry.id))
  return { stages, byTerm, unrouted, errors }
}

export function stageById(index, stageId) {
  return index.stages.find((stage) => stage.id === stageId) || null
}

/* 参数与旋钮的初值。变体/热区是离散选择，不进这里。 */
export function defaultValuesFor(stage) {
  const values = {}
  if (!stage) return values
  for (const claim of stage.claims) {
    if (claim.slot === 'param') values[claim.param.key] = claim.param.default
  }
  for (const knob of stage.knobs) values[knob.key] = knob.default
  return values
}

/* 同一条术语可以被多台认领（stagger 在文字浮现台和列表入场台都成立）。
 * 这不算冲突，而是跨台互引：右栏据此显示"也出现在 X 台"。 */
export function crossRefs(index, termId, exceptStageId) {
  const claims = index.byTerm.get(termId) || []
  return claims
    .filter((claim) => claim.stageId !== exceptStageId)
    .map((claim) => ({
      stageId: claim.stageId,
      slot: claim.slot,
      titleZh: stageById(index, claim.stageId)?.titleZh || claim.stageId,
    }))
}

export function coverageOf(index, atlas) {
  const total = Array.isArray(atlas?.entries) ? atlas.entries.length : 0
  const routed = index.byTerm.size
  return { total, routed, unrouted: total - routed, stages: index.stages.length }
}

/* 左栏搜索：英文名、中文名、别名都命中。订正名与语料原译都能搜到，
 * 因为用户可能记住的是任意一个。 */
export function matchTerm(term, keyword, displayZh) {
  const kw = keyword.trim().toLowerCase()
  if (!kw) return true
  if ((term.termEn || '').toLowerCase().includes(kw)) return true
  if ((term.termZh || '').includes(keyword.trim())) return true
  if (displayZh && displayZh.includes(keyword.trim())) return true
  return (term.aliases || []).some((alias) => String(alias).toLowerCase().includes(kw))
}

/* ============ 八大一级本体领域 (Master Taxonomy Domains) ============
 * 确立数字视觉传达、图形学、排版学、动效物理与交互实战的权威全局树。
 */
export const MASTER_DOMAINS = [
  {
    id: 'd1-typography',
    num: '01',
    titleZh: '文字与排版体系',
    titleEn: 'Typography & Kinetic Text',
    desc: '微观字形解剖、Modular Scale 字阶、艺术字材质修辞与字体动力学',
    stageIds: ['text-reveal'],
  },
  {
    id: 'd2-color-surface',
    num: '02',
    titleZh: '色彩、光影与材质',
    titleEn: 'Color, Light & Surface',
    desc: 'OKLCH 均匀色空间、分层漫反射微光与毛玻璃/新拟态深度模型',
    stageIds: [],
  },
  {
    id: 'd3-geometry',
    num: '03',
    titleZh: '几何、轮廓与装饰',
    titleEn: 'Geometry, Contours & Motifs',
    desc: '苹果 G2 平滑连续超椭圆圆角、发丝微描边与有机裁剪形态',
    stageIds: [],
  },
  {
    id: 'd4-layout',
    num: '04',
    titleZh: '空间拓扑与布局',
    titleEn: 'Spatial Layout & Grids',
    desc: '4pt/8pt 间距韵律、CSS Subgrid、Bento Grid 便当盒与应用导航外壳',
    stageIds: ['navigation'],
  },
  {
    id: 'd5-controls',
    num: '05',
    titleZh: '交互控件与原语',
    titleEn: 'Controls & Primitives',
    desc: '表单解剖、数据表格矩阵、浮层上下文与骨架流光反馈',
    stageIds: ['form-anatomy', 'data-display', 'overlay-layers', 'state-loading'],
  },
  {
    id: 'd6-motion',
    num: '06',
    titleZh: '动力学与微动效',
    titleEn: 'Motion Physics & Choreography',
    desc: '物理弹簧动力学、悬停微抬反馈、FLIP 共享形变与视差滚动',
    stageIds: ['surface-transition'],
  },
  {
    id: 'd7-gestures',
    num: '07',
    titleZh: '输入模态与手势',
    titleEn: 'Modality, Gestures & Haptics',
    desc: '指针捕获、连续手势、橡皮筋阻尼越界回弹与无障碍键盘流转',
    stageIds: ['pointer-gestures'],
  },
  {
    id: 'd8-scenarios',
    num: '08',
    titleZh: '复合场景与智能体',
    titleEn: 'Composite Scenarios & Agentic UI',
    desc: '现代工作台、落地页范式与旗舰级 AI Composer / 思维链 / 产物画布',
    stageIds: ['agent-composer'],
  },
]

export function getDomainForStage(stageId) {
  return MASTER_DOMAINS.find((d) => d.stageIds.includes(stageId)) || null
}

/* 台上有多少条还挂着未订正的机器译名。用来盯译名欠账，不是装饰。 */
export function machineNameDebt(index) {
  let pending = 0
  let fixed = 0
  for (const stage of index.stages) {
    for (const claim of stage.claims) {
      if (claim.zhFixed) fixed += 1
      else if (claim.term.translationQuality === 'machine') pending += 1
    }
  }
  return { pending, fixed }
}
