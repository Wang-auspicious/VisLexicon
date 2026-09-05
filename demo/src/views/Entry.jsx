import { useMemo, useState } from 'react'
import { map } from '../entries.js'
import { FAMILIES, matrixFor, variantCount } from '../variants.jsx'
import { go } from '../router.js'
import { saveBoardItem } from '../store.js'
import { Autopsy } from '../autopsy.jsx'
import { Sliders, Notation, AxisBadge, CopyBtn, HotTag } from '../ui.jsx'
import { useStore } from '../store.js'

/* 部署相对端点：dev server / 任何静态托管下都真实可访问 */
const API_BASE = `${import.meta.env.BASE_URL.replace(/\/$/, '')}`

const AGENT_COPY = (e) =>
  [
    `请按 VisLexicon 词条实现「${e.term}（${e.zh}）」。`,
    '',
    `- 词条端点：GET ${location.origin}${API_BASE}/lexicon/${e.id}.json`,
    `- 定义：${e.def}`,
    `- 演示：交互式剖解台（关键帧 + 参数）`,
    `- 最小实现见端点内 minimal_code 字段`,
    '',
    `验收标准：`,
    ...(e.pair.length ? e.pair.slice(0, 3).map((id) => `  - [ ] 与 lex:${id} 的搭配关系符合词条页说明`) : []),
    '  - [ ] 参数范围在演示允许值内',
    '  - [ ] 对比度满足 WCAG AA',
  ].join('\n')

export default function Entry({ id }) {
  const e = map[id]
  const store = useStore()
  const [p, setP] = useState({})
  const merged = useMemo(() => {
    const o = {}
    ;(e?.params || []).forEach((q) => { o[q.k] = p[q.k] ?? Number(q.def) })
    return o
  }, [e, p])

  if (!e) {
    return (
      <main className="grid-wrap">
        <p className="no-hit">词条不存在。返回 <button type="button" className="btn-ghost" onClick={() => go('atlas')}>图鉴</button></p>
      </main>
    )
  }

  const on = store.board.some((b) => b.id === e.id)
  const related = e.pair.map((id) => map[id]).filter(Boolean)
  const contrasts = e.contrast?.map((id) => map[id]).filter(Boolean) || []
  const mx = matrixFor(e)
  const vc = variantCount(e)

  return (
    <main className="entry-page">
      <nav className="entry-crumb x-mono">
        <button type="button" onClick={() => go('atlas')}>图鉴</button>
        <i>／</i>
        <AxisBadge axisId={e.axis} small />
        <span className="crumb-now">lex:{e.id}</span>
      </nav>

      <header className="entry-head">
        <div className="entry-title">
          <HotTag on={e.hot} />
          <h1>{e.term} <em>{e.zh}</em></h1>
          <p className="entry-def">{e.def}</p>
          <div className="entry-idline">
            <code>lex:{e.id}</code>
            <span className="x-mono">{e.used}</span>
          </div>
        </div>
        <div className="entry-actions">
          <div className="entry-alias">
            {e.alias.map((a) => <em key={a}>{a}</em>)}
          </div>
          <div className="entry-btns">
            <CopyBtn
              text={AGENT_COPY(e)}
              label="复制给 Agent"
              done="✓ 已带上参数与验收"
            />
            <button
              type="button"
              className={`btn-pick wide ${on ? 'on' : ''}`}
              onClick={() => saveBoardItem(e.id, merged)}
            >
              {on ? '更新 Spec 参数' : '+ 加入 Spec 板'}
            </button>
          </div>
        </div>
      </header>

      <section className="entry-section" id="demo">
        <div className="section-kicker x-mono">
          <span>01</span> 动效解剖台 <em>scrub · X光 · 缓动同步</em>
        </div>
        <Autopsy entry={e} params={merged} />
        {e.params?.length > 0 && (
          <div className="param-strip">
            <span className="param-title x-mono">参数可玩 — 拖动即改 Spec</span>
            <Sliders entry={e} value={p} onChange={(np) => setP(np)} />
          </div>
        )}
      </section>

      <section className="entry-section" id="notation">
        <div className="section-kicker x-mono"><span>02</span> 记谱法 <em>一行无损压缩的动效规格，Agent 可解引用</em></div>
        <div className="notation-big">
          <Notation entry={e} />
          <CopyBtn text={e.notation || e.id} label="复制记谱" done="✓" />
        </div>
        {e.genes?.length > 0 && (
          <div className="genes">
            {e.genes.map((g, i) => (
              <div key={g.g} className="gene-row">
                <span className="gene-k">{String(i + 1).padStart(2, '0')}</span>
                <b>{g.g}</b>
                <code>{g.v}</code>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="entry-two">
        <section className="entry-section" id="code">
          <div className="section-kicker x-mono"><span>03</span> 最小实现 <em>MIT，复制即运行</em></div>
          <div className="code-block">
            <div className="code-h">
              <span className="x-mono">{e.id}.css</span>
              <CopyBtn text={e.code} />
            </div>
            <pre><code>{e.code}</code></pre>
          </div>
          <div className="code-foot">
            <span className="x-mono">也可让 Agent 直接安装组件实现：</span>
            <button type="button" className="inline-link" onClick={() => go('index')}>索引页 · 组件级映射 ↗</button>
          </div>
        </section>

        {e.wild?.length > 0 && (
          <section className="entry-section" id="wild">
            <div className="section-kicker x-mono"><span>04</span> 野外目击 <em>In the Wild</em></div>
            <ul className="wild-list">
              {e.wild.map((w) => (
                <li key={w.what}>
                  <b>{w.what}</b>
                  <code className="x-mono">{w.src}</code>
                  <p>{w.note}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {e.tech && (
        <section className="entry-section" id="tech">
          <div className="section-kicker x-mono"><span>05</span> 工程要点 <em>兼容性 · 性能 · 无障碍</em></div>
          <p className="tech-p">{e.tech}</p>
        </section>
      )}

      {e.anti && (
        <section className="entry-section" id="anti">
          <div className="section-kicker x-mono warn"><span>⚠</span> 反模式 <em>什么时候不该用</em></div>
          <p className="anti-p">{e.anti}</p>
        </section>
      )}

      {contrasts.length > 0 && (
        <section className="entry-section" id="contrast">
          <div className="section-kicker x-mono"><span>06</span> 同属对比 <em>实现对照 — 实际差异逐项说明</em></div>
          <div className="contrast-row">
            {contrasts.map((c) => (
              <button
                type="button"
                key={c.id}
                className="contrast-card"
                onClick={() => go(`compare/${e.id}/${c.id}`)}
              >
                <i>{AXG(c.axis)}</i>
                <b>{c.term}</b>
                <span>{c.zh}</span>
                <em className="x-mono">与 {e.zh} 对比 · 疑难点在此</em>
              </button>
            ))}
          </div>
        </section>
      )}

      {mx && (
        <section className="entry-section" id="matrix">
          <div className="section-kicker x-mono"><span>06.5</span> 同源矩阵 <em>恒定标本 × {vc} 种实现 — 本词条只是其中一个坐标</em></div>
          <div className="matrix-jump">
            <div className="mj-text">
              <b>{FAMILIES[mx.fam].title} <em className="x-mono">{FAMILIES[mx.fam].en}</em></b>
              <p>{FAMILIES[mx.fam].blurb}</p>
            </div>
            <div className="mj-acts">
              <code className="x-mono">×{vc} 实现</code>
              <button type="button" className="btn-primary" onClick={() => go(`matrix/${mx.fam}/${e.id}`)}>并排对照 →</button>
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="entry-section" id="related">
          <div className="section-kicker x-mono"><span>07</span> 常见搭配 <em>这些词条常与它同场出现</em></div>
          <div className="pair-row">
            {related.map((r) => (
              <button type="button" key={r.id} className="pair-chip" onClick={() => go(`entry/${r.id}`)}>
                <code>lex:{r.id}</code>
                <b>{r.term}</b>
                <span>{r.zh}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="entry-section" id="agent">
        <div className="section-kicker x-mono"><span>08</span> Agent 端点 <em>L4 分发 —— 稳定 JSON，无鉴权可读</em></div>
        <div className="agent-block">
          <div className="agent-url">
            <a className="x-mono agent-url-link" href={`${API_BASE}/lexicon/${e.id}.json`} target="_blank" rel="noreferrer">
              GET {location.origin}{API_BASE}/lexicon/{e.id}.json ↗
            </a>
            <CopyBtn text={`${location.origin}${API_BASE}/lexicon/${e.id}.json`} label="复制端点" done="✓" />
          </div>
          <pre className="agent-json"><code>{JSON.stringify(entryJson(e), null, 2)}</code></pre>
        </div>
      </section>

      <div className="entry-nav">
        <button type="button" className="btn-ghost" onClick={() => go('key')}>← 认不出？走鉴定树</button>
        <button type="button" className="btn-primary" onClick={() => go('atlas')}>回图鉴 ↗</button>
      </div>
    </main>
  )
}

const AXG = (ax) => ({ layout: '◧', interaction: '✦', aesthetic: '◐', motion: '➤', component: '▣' }[ax] || '·')

function entryJson(e) {
  return {
    lever: 'lexicon',
    id: e.id,
    term_en: e.term,
    term_zh: e.zh,
    axis: e.axis,
    aliases: e.alias,
    definition_zh: e.def,
    notation: e.notation,
    genes: (e.genes || []).map((g) => ({ gene: g.g, value: g.v })),
    minimal_code: { css: e.code },
    params: (e.params || []).map((q) => ({ key: q.k, label: q.label, min: q.min, max: q.max, step: q.step, unit: q.unit, default: q.def })),
    anti_patterns: [e.anti],
    tech_notes: [e.tech],
    common_pairings: e.pair,
    related: e.contrast || [],
    media: { poster: `cdn://lexicon/${e.id}/poster@2x.png`, keyframes: ['f0.png', 'f1.png', 'f2.png', 'f3.png'] },
    endpoint: `${API_BASE}/lexicon/${e.id}.json`,
    license: 'CC BY-SA 4.0 (词条数据)',
  }
}
