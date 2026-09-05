import { useEffect, useRef, useState } from 'react'
import { deltaE2000, rgbToLab, summarizeDiff } from '../lib/color-diff.js'
import { CopyBtn } from '../ui.jsx'

/* 部署相对端点：dev server / 任何静态托管下都真实可访问 */
const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

/* ============ 客户端测量（测量在前，VLM 在后） ============ */

const TAILWIND = [
  ['#0f172a', 'slate-900'], ['#1e293b', 'slate-800'], ['#334155', 'slate-700'], ['#64748b', 'slate-500'],
  ['#f8fafc', 'slate-50'], ['#111827', 'gray-900'], ['#f9fafb', 'gray-50'], ['#18181b', 'zinc-900'],
  ['#fafafa', 'zinc-50'], ['#09090b', 'neutral-950'], ['#b91c1c', 'red-700'], ['#ef4444', 'red-500'],
  ['#f97316', 'orange-500'], ['#eab308', 'yellow-500'], ['#16a34a', 'green-600'], ['#22c55e', 'green-500'],
  ['#0d9488', 'teal-600'], ['#0ea5e9', 'sky-500'], ['#2563eb', 'blue-600'], ['#3b82f6', 'blue-500'],
  ['#6d28d9', 'violet-700'], ['#6E56CF', 'violet-500'], ['#7c3aed', 'violet-600'], ['#db2777', 'pink-600'],
  ['#ec4899', 'pink-500'], ['#f43f5e', 'rose-500'],
]

function nearestTailwind([r, g, b]) {
  let best = TAILWIND[0]
  let bd = Infinity
  for (const [hh, name] of TAILWIND) {
    const rr = parseInt(hh.slice(1, 3), 16)
    const gg = parseInt(hh.slice(3, 5), 16)
    const bb = parseInt(hh.slice(5, 7), 16)
    const d = (rr - r) ** 2 + (gg - g) ** 2 + (bb - b) ** 2
    if (d < bd) { bd = d; best = [hh, name] }
  }
  return best[1]
}

function hex(r, g, b) {
  return '#' + [r, g, b].map((v) => Math.min(255, Math.max(0, Math.round(v))).toString(16).padStart(2, '0')).join('')
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('无法解码图片'))
    }
    img.src = url
  })
}

function extractPalette(img) {
  const W = 128
  const H = Math.max(1, Math.round((img.height / img.width) * W))
  const cv = document.createElement('canvas')
  cv.width = W
  cv.height = H
  const cx = cv.getContext('2d')
  cx.drawImage(img, 0, 0, W, H)
  const data = cx.getImageData(0, 0, W, H).data

  const px = []
  for (let i = 0; i < data.length; i += 8) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]
    if (a < 64) continue
    if (r > 245 && g > 245 && b > 245) continue
    px.push([r, g, b])
  }
  if (px.length < 4) return []

  const K = 6
  const cents = [
    [0.05, 0.05, 0.05], [0.93, 0.93, 0.93], [0.5, 0.25, 0.7],
    [0.9, 0.4, 0.2], [0.2, 0.5, 0.9], [0.1, 0.7, 0.4],
  ].map((c) => [c[0] * 255, c[1] * 255, c[2] * 255])
  const assign = new Array(px.length)
  for (let it = 0; it < 10; it++) {
    px.forEach((p, idx) => {
      let bi = 0
      let bd = Infinity
      cents.forEach((c, ci) => {
        const d = (c[0] - p[0]) ** 2 + (c[1] - p[1]) ** 2 + (c[2] - p[2]) ** 2
        if (d < bd) { bd = d; bi = ci }
      })
      assign[idx] = bi
    })
    for (let k = 0; k < K; k++) {
      let n = 0
      let sr = 0, sg = 0, sb = 0
      assign.forEach((a, idx) => { if (a === k) { n++; sr += px[idx][0]; sg += px[idx][1]; sb += px[idx][2] } })
      if (n > 0) cents[k] = [sr / n, sg / n, sb / n]
    }
  }
  const counts = []
  for (let k = 0; k < K; k++) {
    const n = assign.filter((a) => a === k).length
    if (n > 2) counts.push({ rgb: cents[k], n, pct: n / px.length })
  }
  return counts.sort((x, y) => y.n - x.n).slice(0, 6)
}

function roleOf(pct, idx) {
  if (idx === 0 && pct > 0.4) return '背景'
  if (pct < 0.04) return '点缀'
  if (idx < 3) return '表面'
  return '强调'
}

function sample(img, S) {
  const cv = document.createElement('canvas')
  cv.width = S
  cv.height = S
  const cx = cv.getContext('2d')
  cx.imageSmoothingEnabled = true
  cx.imageSmoothingQuality = 'high'
  cx.drawImage(img, 0, 0, S, S)
  const d = cx.getImageData(0, 0, S, S).data
  const out = []
  for (let i = 0; i < d.length; i += 4) out.push([d[i], d[i + 1], d[i + 2]])
  return out
}

function DropTarget({ label, value, onPick }) {
  const ref = useRef(null)
  return (
    <div>
      <input ref={ref} type="file" accept="image/*" hidden onChange={(ev) => { const file = ev.target.files[0]; ev.target.value = ''; if (file) onPick(file) }} />
      <div className="drop-zone sm" onClick={() => ref.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) onPick(file) }}>
        {value?.url ? <img src={value.url} alt={label} /> : <span className="x-mono">{label} ↗</span>}
      </div>
    </div>
  )
}

/* ============ 工具一：Spec 提取器 ============ */
function Extractor() {
  const inputRef = useRef(null)
  const previewUrlRef = useRef(null)
  const loadRequestRef = useRef(0)
  const [state, setState] = useState('idle')
  const [error, setError] = useState('')
  const [imgUrl, setImgUrl] = useState(null)
  const [pal, setPal] = useState([])
  const [size, setSize] = useState([0, 0])

  useEffect(() => () => {
    loadRequestRef.current += 1
    const url = previewUrlRef.current
    previewUrlRef.current = null
    if (url) URL.revokeObjectURL(url)
  }, [])

  const onFile = async (file) => {
    if (!file) return
    const request = ++loadRequestRef.current
    const previousUrl = previewUrlRef.current
    previewUrlRef.current = null
    if (previousUrl) URL.revokeObjectURL(previousUrl)

    setState('busy')
    setError('')
    setImgUrl(null)
    setPal([])
    setSize([0, 0])

    try {
      const img = await loadImage(file)
      if (request !== loadRequestRef.current) return

      const nextPalette = extractPalette(img)
      const url = URL.createObjectURL(file)
      previewUrlRef.current = url
      setImgUrl(url)
      setSize([img.naturalWidth, img.naturalHeight])
      setPal(nextPalette)
      setState('done')
    } catch {
      if (request !== loadRequestRef.current) return
      setState('error')
      setError('图片加载失败，请选择有效的 PNG、JPEG、WebP 或 GIF 文件后重试。')
    }
  }

  const sheet = {
    measurement_sheet: {
      caliber: '正文 16px（相对单位换算中）',
      colors: pal.map((c, i) => ({ role: roleOf(c.pct, i), hex: hex(...c.rgb), tailwind: nearestTailwind(c.rgb), coverage_pct: +(c.pct * 100).toFixed(1) })),
    },
    note: '几何 / 文字 / 布局 → 交给 VLM 语义命名；颜色等可测量量已由确定性算法算出',
  }

  return (
    <div className="tool-card">
      <div className="tool-h">
        <span className="x-mono">TOOL 01</span>
        <h3>Spec 提取器</h3>
        <em>截图 → 测量单（色板 / 角色 / Tailwind 映射）</em>
      </div>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={(ev) => { const file = ev.target.files[0]; ev.target.value = ''; onFile(file) }} />
      <div className={`drop-zone ${imgUrl ? 'has-img' : ''}`} onClick={() => inputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]) }}>
        {imgUrl ? (
          <img src={imgUrl} alt="参考截图" />
        ) : (
          <p role={state === 'error' ? 'alert' : undefined}>
            {state === 'busy'
              ? '测量中…'
              : state === 'error'
                ? error
                : '点击或拖入参考截图。V1 定位「干净的产品 UI」，效果最佳。'}
          </p>
        )}
      </div>
      {state === 'done' && (
        <>
          <div className="measure-bar x-mono">
            <span>标定基准：正文 16px</span>
            <span>{size[0]}×{size[1]}px</span>
            <span>置信度：颜色高 / 布局中 / 艺术字低</span>
          </div>
          <div className="palette-sw">
            {pal.map((c, i) => (
              <div key={i} className="swatch" style={{ '--sw': `rgb(${c.rgb[0] | 0},${c.rgb[1] | 0},${c.rgb[2] | 0})` }}>
                <i />
                <strong className="x-mono">{hex(c.rgb[0], c.rgb[1], c.rgb[2])}</strong>
                <span className="x-mono">~{nearestTailwind(c.rgb)}</span>
                <em>{roleOf(c.pct, i)} · {(c.pct * 100).toFixed(0)}%</em>
              </div>
            ))}
          </div>
          <div className="tool-out">
            <pre><code>{JSON.stringify(sheet, null, 2)}</code></pre>
            <CopyBtn text={JSON.stringify(sheet, null, 2)} label="复制测量单" done="✓" />
          </div>
        </>
      )}
    </div>
  )
}

/* ============ 工具二：Diff 描述器 ============ */
const DIFF_GRID_SIZE = 24
const HOTSPOT_DELTA_E = 10

function DiffTool() {
  const [a, setA] = useState(null)
  const [b, setB] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const previewUrls = useRef({ a: null, b: null })
  const pickRequests = useRef({ a: 0, b: 0 })

  useEffect(() => () => {
    pickRequests.current.a += 1
    pickRequests.current.b += 1
    for (const url of Object.values(previewUrls.current)) {
      if (url) URL.revokeObjectURL(url)
    }
  }, [])

  const pick = async (file, side) => {
    if (!file) return
    const request = ++pickRequests.current[side]
    setError('')
    setResult(null)

    try {
      const img = await loadImage(file)
      if (request !== pickRequests.current[side]) return

      const url = URL.createObjectURL(file)
      const previousUrl = previewUrls.current[side]
      previewUrls.current[side] = url
      if (side === 'a') setA({ url, img })
      else setB({ url, img })
      if (previousUrl) URL.revokeObjectURL(previousUrl)
    } catch {
      if (request === pickRequests.current[side]) {
        setError(`${side === 'a' ? '参考图 A' : '你的图 B'}加载失败，请选择有效的图片文件。`)
      }
    }
  }

  const run = () => {
    if (!a?.img || !b?.img) return
    setError('')

    try {
      const cellsA = sample(a.img, DIFF_GRID_SIZE)
      const cellsB = sample(b.img, DIFF_GRID_SIZE)
      const differences = cellsA.map((rgbA, i) => ({
        i,
        d: deltaE2000(rgbToLab(rgbA), rgbToLab(cellsB[i])),
      }))
      setResult({
        cellsA,
        cellsB,
        differences,
        summary: summarizeDiff(differences, HOTSPOT_DELTA_E),
      })
    } catch {
      setResult(null)
      setError('无法读取图片像素，请尝试转换为 PNG 或 JPEG 后重试。')
    }
  }

  const summary = result?.summary
  const hotCells = summary?.hotspots ?? []
  const diffSheet = summary ? {
    metrics: {
      mean_deltaE_2000: +summary.mean.toFixed(2),
      p95_deltaE_2000: +summary.p95.toFixed(2),
      max_deltaE_2000: +summary.max.toFixed(2),
      hotspots_deltaE_gte_10: hotCells.length,
    },
    diff_instructions: [
      `[颜色] CIEDE2000 平均 ${summary.mean.toFixed(2)} / P95 ${summary.p95.toFixed(2)} / 最大 ${summary.max.toFixed(2)}`,
      ...hotCells.slice(0, 5).map((c) => {
        const row = Math.floor(c.i / DIFF_GRID_SIZE) + 1
        const column = c.i % DIFF_GRID_SIZE + 1
        return `[网格 ${row},${column}] ΔE=${c.d.toFixed(2)}，优先对齐此处`
      }),
      '[层级] 参考图主次对比若强于你的图，先调字号层级再动颜色',
    ],
    ordering: '感知权重：层级/对齐/间距 > 颜色偏差 > 圆角细节',
  } : null

  return (
    <div className="tool-card">
      <div className="tool-h">
        <span className="x-mono">TOOL 02</span>
        <h3>Diff 描述器</h3>
        <em>参考图 vs 你的图 → ΔE 热图 + 按感知权重排序的修改指令</em>
      </div>
      <div className="diff-inputs">
        <DropTarget label="参考图 A" value={a} onPick={(f) => pick(f, 'a')} />
        <span className="x-mono diff-vs">vs</span>
        <DropTarget label="你的图 B" value={b} onPick={(f) => pick(f, 'b')} />
      </div>
      <button type="button" className="btn-primary" onClick={run} disabled={!a || !b}>跑 ΔE 差异 →</button>
      {error && <div className="measure-bar x-mono" role="alert"><span>{error}</span></div>}

      {result && summary && (
        <>
          <div className="heat-row">
            <Heatmap cells={result.cellsA} S={DIFF_GRID_SIZE} label="参考 · 重采样" />
            <Heatmap cells={result.cellsB} S={DIFF_GRID_SIZE} label="你的 · 重采样" />
            <DiffHeatmap cells={result.differences} S={DIFF_GRID_SIZE} max={summary.max} />
          </div>
          <div className="measure-bar x-mono">
            <span>平均 ΔE₀₀ = {summary.mean.toFixed(2)}</span>
            <span>P95 = {summary.p95.toFixed(2)}</span>
            <span>最大 = {summary.max.toFixed(2)}</span>
            <span>热点（ΔE₀₀ ≥ {HOTSPOT_DELTA_E}）{hotCells.length} 格</span>
          </div>
          <p className="loop-note">
            浏览器 Canvas 会把两图分别重采样到同一 {DIFF_GRID_SIZE}×{DIFF_GRID_SIZE} 固定网格；不同浏览器的插值可能略有差异，且锐度、文字边缘和高频细节会被弱化。本结果适合比较颜色与大区域，不等同于原始分辨率逐像素验证。
          </p>
          <div className="tool-out">
            <pre><code>{JSON.stringify(diffSheet, null, 2)}</code></pre>
            <CopyBtn text={JSON.stringify(diffSheet, null, 2)} label="复制差异单" done="✓" />
          </div>
        </>
      )}
    </div>
  )
}

function Heatmap({ cells, S, label }) {
  const size = 168
  const cell = size / S
  return (
    <div className="heat-block">
      <span className="x-mono heat-label">{label}</span>
      <div className="heat-grid" style={{ width: size, height: size, gridTemplateColumns: `repeat(${S}, ${cell}px)` }}>
        {cells.map((c, i) => (
          <i key={i} style={{ width: cell, height: cell, background: `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})` }} />
        ))}
      </div>
    </div>
  )
}

function DiffHeatmap({ cells, S, max }) {
  const size = 168
  const cell = size / S
  return (
    <div className="heat-block">
      <span className="x-mono heat-label">ΔE₀₀ · 完整热图</span>
      <div className="heat-grid" style={{ width: size, height: size, gridTemplateColumns: `repeat(${S}, ${cell}px)` }}>
        {cells.map(({ d, i }) => {
          const intensity = max === 0 ? 0 : Math.min(1, d / max)
          return (
            <i
              key={i}
              title={`网格 ${Math.floor(i / S) + 1},${i % S + 1} · ΔE₀₀ ${d.toFixed(2)}`}
              style={{
                width: cell,
                height: cell,
                background: `hsl(${220 - intensity * 220} 90% ${94 - intensity * 46}%)`,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

/* ============ 工具页 ============ */
export default function Tools() {
  return (
    <main className="tools-page">
      <header className="page-head">
        <em className="x-mono">L3 · MEASUREMENT</em>
        <h1>测量工具</h1>
        <p>
          弱模型做不好设计，不是因为看不懂图，而是图里的「数」它拿不准。这里的原则是：
          <b>测量在前，VLM 在后</b>——颜色、间距、圆角由确定性算法算出来，VLM 只负责命名与结构。
        </p>
      </header>

      <div className="tools-grid">
        <Extractor />
        <DiffTool />
      </div>

      <section className="tool-section">
        <div className="section-kicker x-mono"><span>⇄</span> 收敛循环 <em>把 Diff 做成 MCP 工具后，Agent 自己跑循环</em></div>
        <ol className="loop-steps">
          <li><b>改</b><span>Agent 按差异指令修改</span></li>
          <li><b>截</b><span>重新截图（统一规格）</span></li>
          <li><b>测</b><span>再跑 ΔE 差异</span></li>
          <li><b>判</b><span>低于阈值 → 停；否则回到 1</span></li>
        </ol>
        <p className="loop-note">
          用户只在循环外做「味道对不对」的终审。词表是工具的输出语言——差异单里的 <code>lex:hover-lift</code>
          之所以有效，是因为 Agent 可解引用到词条拿实现。
        </p>
      </section>

      <section className="tool-section">
        <div className="section-kicker x-mono"><span>⌘</span> 协议安装 <em>全部为真实可用的开放协议与端点</em></div>
        <div className="proto-grid">
          <div className="proto-card">
            <h4>MCP Server <a className="proto-ext" href="https://ui.shadcn.com/docs/mcp" target="_blank" rel="noreferrer">文档 ↗</a></h4>
            <pre><code className="x-mono">npx shadcn@latest mcp</code></pre>
            <p>
              shadcn 官方 MCP：Agent 装一次即可搜索/安装全生态 Registry 组件（Magic UI · Origin UI · Aceternity 均<nobr>兼容</nobr>）。配置见
              <a href="https://modelcontextprotocol.io" target="_blank" rel="noreferrer"> modelcontextprotocol.io</a>。
            </p>
            <CopyBtn text="npx shadcn@latest mcp" label="复制安装" done="✓" />
          </div>
          <div className="proto-card">
            <h4>JSON API</h4>
            <pre><code className="x-mono">GET {location.origin}{API_BASE}/lexicon/glassmorphism.json</code></pre>
            <p>本站每个词条/组件/Spec 都是真实存在的静态端点——点开即验证，无鉴权可读，静态托管即生效。</p>
            <CopyBtn text={`curl ${location.origin}${API_BASE}/lexicon/glassmorphism.json`} label="复制 curl" done="✓" />
          </div>
          <div className="proto-card">
            <h4>llms.txt <a className="proto-ext" href="https://llmstxt.org" target="_blank" rel="noreferrer">标准 ↗</a></h4>
            <pre><code className="x-mono">GET {location.origin}{API_BASE}/llms.txt</code></pre>
            <p>遵循 llmstxt.org 约定的机器可读索引；llms-full.txt 为全库数据。Agent 抓这一个文件即建立设计上下文。</p>
            <a className="btn-ghost" href={`${API_BASE}/llms.txt`} target="_blank" rel="noreferrer">打开本站 llms.txt ↗</a>
          </div>
        </div>
      </section>
    </main>
  )
}
