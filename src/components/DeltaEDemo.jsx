import { useState } from 'react'
import { deltaE2000, rgbToLab, summarizeDiff } from '../lib/color-diff.js'

/* ============ ΔE 差异描述器演示（方案 §2.1 工具去处第一条） ============
 * 旧「工具」频道里唯一有价值的那件东西：CIEDE2000 色差。它是确定性测量，
 * 不是模型推测，所以留下来——但它是编辑部复核用的工具，不是一个用户频道，
 * 于是降级成关于页里一个默认收起的演示。
 *
 * 用的是站内 public/shots/ 下已有的核验图，不要求你自带截图。
 * 演示说明里写清楚它真正的用途（同一页面新旧两次抓取的比对），
 * 以及这里为什么只能拿两张不同的图演示计算本身。
 */

/* 两张图各自重采样到 24×24 的固定网格再逐格比。这是采样参数，不是统计量。 */
const GRID = 24
/* ΔE ≥ 10 记为热点：粗略对应「不用并排也能一眼看出不同」的量级。 */
const HOTSPOT = 10

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`图片加载失败：${src}`))
    image.src = src
  })
}

/** 把一张图重采样到 GRID×GRID，返回每格的 [r,g,b]。 */
function sample(image) {
  const canvas = document.createElement('canvas')
  canvas.width = GRID
  canvas.height = GRID
  const context = canvas.getContext('2d')
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(image, 0, 0, GRID, GRID)
  const data = context.getImageData(0, 0, GRID, GRID).data
  const cells = []
  for (let i = 0; i < data.length; i += 4) cells.push([data[i], data[i + 1], data[i + 2]])
  return cells
}

export default function DeltaEDemo({ items }) {
  const options = (items ?? []).filter((item) => item?.shot?.src)
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  /* 默认给一对：语料里的 origin-ui（Coss UI）与 shadcn-ui，都是站内已有的身份页图。 */
  const leftId = left || options.find((item) => item.entryId === 'origin-ui')?.entryId || options[0]?.entryId || ''
  const rightId = right || options.find((item) => item.entryId === 'shadcn-ui')?.entryId || options[1]?.entryId || ''
  const leftItem = options.find((item) => item.entryId === leftId) ?? null
  const rightItem = options.find((item) => item.entryId === rightId) ?? null

  const run = async () => {
    if (!leftItem || !rightItem) return
    setBusy(true)
    setError('')
    setResult(null)
    try {
      const [imageA, imageB] = await Promise.all([
        loadImage(leftItem.shot.src),
        loadImage(rightItem.shot.src),
      ])
      const cellsA = sample(imageA)
      const cellsB = sample(imageB)
      const differences = cellsA.map((rgb, i) => ({ i, d: deltaE2000(rgbToLab(rgb), rgbToLab(cellsB[i])) }))
      setResult({ differences, summary: summarizeDiff(differences, HOTSPOT) })
    } catch {
      setError('两张图里至少有一张没能读出像素，演示这次跑不了。')
    } finally {
      setBusy(false)
    }
  }

  const summary = result?.summary
  const max = summary?.max || 1

  return (
    <details className="de">
      <summary className="de-sum">ΔE 差异描述器 · 展开看这台工具怎么用</summary>
      <div className="de-body">
        <p>
          CIEDE2000 把两个颜色之间「人眼看起来差多少」算成一个数。复核时真正的用法是：
          下次重新核验同一个页面，把新旧两张抓图放进来，色差大的格子就是这段时间里变掉的地方。
          <strong>站内每个页面目前只有一次抓取</strong>，所以这里只能拿两张不同的图演示计算本身——
          两个不同站点之间的色差没有产品含义，别把下面这个数当成结论。
        </p>

        {options.length === 0 ? (
          <p className="de-note">站点索引还没加载完，暂时没有可选的图。</p>
        ) : (
          <>
            <div className="de-pickers">
              <label className="de-pick">
                <span>图 A</span>
                <select value={leftId} onChange={(event) => { setLeft(event.target.value); setResult(null) }}>
                  {options.map((item) => <option key={item.entryId} value={item.entryId}>{item.name}</option>)}
                </select>
              </label>
              <label className="de-pick">
                <span>图 B</span>
                <select value={rightId} onChange={(event) => { setRight(event.target.value); setResult(null) }}>
                  {options.map((item) => <option key={item.entryId} value={item.entryId}>{item.name}</option>)}
                </select>
              </label>
              <button type="button" className="btn-primary" onClick={run} disabled={busy} aria-busy={busy}>
                {busy ? '正在算…' : '算一次'}
              </button>
            </div>

            <div className="de-shots">
              {[leftItem, rightItem].map((item, position) => (
                item ? (
                  <figure key={`${item.entryId}-${position}`} className="de-shot">
                    <img src={item.shot.src} alt={item.shot.alt || `${item.name} 的身份页截图`} loading="lazy" />
                    <figcaption className="x-mono">{position === 0 ? 'A' : 'B'} · {item.name}</figcaption>
                  </figure>
                ) : null
              ))}
            </div>

            {error && <p className="de-note" role="alert">{error}</p>}

            {summary && (
              <div className="de-out">
                <dl className="de-metrics">
                  <div><dt>平均 ΔE</dt><dd>{summary.mean.toFixed(2)}</dd></div>
                  <div><dt>P95</dt><dd>{summary.p95.toFixed(2)}</dd></div>
                  <div><dt>最大</dt><dd>{summary.max.toFixed(2)}</dd></div>
                  <div><dt>ΔE ≥ {HOTSPOT} 的格子</dt><dd>{summary.hotspots.length}</dd></div>
                </dl>
                <div
                  className="de-grid"
                  style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)` }}
                  role="img"
                  aria-label={`${GRID} 乘 ${GRID} 色差热力图，越深表示这一格差得越多`}
                >
                  {result.differences.map((cell) => (
                    <i key={cell.i} style={{ opacity: Math.min(cell.d / max, 1) }} />
                  ))}
                </div>
                <p className="de-note">
                  浏览器 Canvas 会把两张图分别重采样到同一个 {GRID}×{GRID} 网格，
                  不同浏览器的插值略有差异，锐度与文字边缘会被抹掉。
                  这个结果适合比较颜色和大块区域，不等同于原分辨率逐像素比对。
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </details>
  )
}
