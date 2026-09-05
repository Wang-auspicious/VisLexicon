#!/usr/bin/env node
/**
 * WP-0：设计 token 门禁（方案 §7.3 第 4 步）。
 *
 * 扫描 src/**\/*.{css,jsx,js}，在 src/styles/tokens.css 之外记为违规的四类：
 *   hex        —— #rgb / #rgba / #rrggbb / #rrggbbaa 颜色字面量
 *   colorfn    —— rgb( / rgba( / hsl( / hsla( 字面量
 *   fontsize   —— font-size: <数字>px 或 fontSize: '<数字>px'
 *   breakpoint —— @media 中非 768 / 1280 / 1440 的 min-width，以及任何 max-width
 *
 * 三种模式：
 *   --baseline  生成快照 docs/token-baseline.json（记录当前全部违规），退出 0
 *   （默认）     只对 baseline 之外的**新增**违规退出 1
 *   --strict    全量违规退出 1
 *
 * 老代码存量很大（方案 §7.3 起点：469 个硬编码 hex），默认模式的作用是
 * 「不许再新增」，让 WP-B 的收敛可以分批进行。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = path.join(rootDir, 'src')
const baselinePath = path.join(rootDir, 'docs', 'token-baseline.json')
/** token 定义文件本身豁免（未来路径，允许当前不存在）。 */
const EXEMPT = ['src/styles/tokens.css']
const ALLOWED_MIN_WIDTHS = [768, 1280, 1440]

const args = process.argv.slice(2)
const mode = args.includes('--baseline') ? 'baseline' : args.includes('--strict') ? 'strict' : 'guard'
const jsonOut = args.includes('--json')

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.git') continue
      walk(p, out)
    } else if (/\.(css|jsx|js)$/.test(e.name)) {
      out.push(p)
    }
  }
  return out
}

/** 去掉 CSS/JS 注释，避免把注释里的示例色当违规（但保留行数）。 */
function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
}

const RULES = [
  {
    kind: 'hex',
    // 3/4/6/8 位十六进制，后面不能再跟标识符字符（排除 #root、#/site 等）
    re: /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![0-9a-zA-Z_-])/g,
    value: (m) => m[0].toLowerCase(),
  },
  {
    kind: 'colorfn',
    re: /\b(rgba?|hsla?)\s*\(/g,
    value: (m) => `${m[1].toLowerCase()}(`,
  },
  {
    kind: 'fontsize',
    re: /(?:font-size\s*:\s*|fontSize\s*:\s*['"`])(\d*\.?\d+)px/g,
    value: (m) => `${m[1]}px`,
  },
]

function scanFile(abs) {
  const rel = path.relative(rootDir, abs).split(path.sep).join('/')
  const raw = fs.readFileSync(abs, 'utf8')
  const text = stripComments(raw)
  const lineStarts = []
  for (let i = 0, l = 0; i <= text.length; i += 1) {
    if (i === 0 || text[i - 1] === '\n') lineStarts[l++] = i
  }
  const lineOf = (idx) => {
    let lo = 0
    let hi = lineStarts.length - 1
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (lineStarts[mid] <= idx) lo = mid
      else hi = mid - 1
    }
    return lo + 1
  }
  const found = []
  for (const rule of RULES) {
    rule.re.lastIndex = 0
    let m
    while ((m = rule.re.exec(text)) !== null) {
      found.push({ file: rel, line: lineOf(m.index), kind: rule.kind, value: rule.value(m), text: m[0] })
    }
  }
  // 断点：只看 @media 里的 min-width / max-width
  const mediaRe = /@media[^{]+/g
  let mm
  while ((mm = mediaRe.exec(text)) !== null) {
    const block = mm[0]
    const q = /\((min|max)-width\s*:\s*(\d*\.?\d+)(px|rem|em)\)/g
    let qm
    while ((qm = q.exec(block)) !== null) {
      const [, dir, num, unit] = qm
      const px = unit === 'px' ? Number(num) : Number(num) * 16
      const bad = dir === 'max' || !ALLOWED_MIN_WIDTHS.includes(px)
      if (bad) {
        found.push({
          file: rel,
          line: lineOf(mm.index + qm.index),
          kind: 'breakpoint',
          value: `${dir}-width:${num}${unit}`,
          text: qm[0],
        })
      }
    }
  }
  return found
}

function collect() {
  if (!fs.existsSync(srcDir)) return []
  const files = walk(srcDir).filter((f) => {
    const rel = path.relative(rootDir, f).split(path.sep).join('/')
    return !EXEMPT.includes(rel)
  })
  const all = []
  for (const f of files) all.push(...scanFile(f))
  all.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.kind.localeCompare(b.kind))
  return all
}

/**
 * baseline 用「kind|value 的出现次数」而不是「文件:行号」做键：
 * WP-B 会把 App.css 拆成多个文件、大段搬运，行号与文件名都会变，
 * 用计数才不会把搬家误报成新增。代价是「删一个 #fff 又加一个 #fff」不报。
 */
function tally(list) {
  const map = {}
  for (const v of list) {
    const key = `${v.kind}|${v.value}`
    map[key] = (map[key] || 0) + 1
  }
  return map
}

const violations = collect()
const counts = tally(violations)
const byKind = violations.reduce((acc, v) => {
  acc[v.kind] = (acc[v.kind] || 0) + 1
  return acc
}, {})

function printList(list, limit = 60) {
  for (const v of list.slice(0, limit)) {
    console.log(`  ${v.file}:${v.line}  [${v.kind}] ${v.text}`)
  }
  if (list.length > limit) console.log(`  …… 另有 ${list.length - limit} 条`)
}

if (mode === 'baseline') {
  fs.mkdirSync(path.dirname(baselinePath), { recursive: true })
  const snapshot = {
    generatedAt: new Date().toISOString(),
    note: '设计 token 门禁基线：记录生成时刻已存在的违规。默认模式只对超出这份基线的新增违规报错。',
    exempt: EXEMPT,
    allowedMinWidths: ALLOWED_MIN_WIDTHS,
    totals: { all: violations.length, byKind },
    counts,
    occurrences: violations,
  }
  fs.writeFileSync(baselinePath, `${JSON.stringify(snapshot, null, 2)}\n`)
  console.log(`已写入基线：${path.relative(process.cwd(), baselinePath)}`)
  console.log(`存量违规 ${violations.length} 条：${JSON.stringify(byKind)}`)
  process.exit(0)
}

if (mode === 'strict') {
  if (jsonOut) console.log(JSON.stringify({ mode, totals: byKind, violations }, null, 2))
  else {
    console.log(`[strict] 全量违规 ${violations.length} 条：${JSON.stringify(byKind)}`)
    printList(violations)
  }
  process.exit(violations.length ? 1 : 0)
}

// guard（默认）
if (!fs.existsSync(baselinePath)) {
  console.error(`缺少基线文件 ${path.relative(process.cwd(), baselinePath)}。先运行：npm run tokens:baseline`)
  process.exit(1)
}
const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'))
const baseCounts = baseline.counts || {}
const overflowKeys = Object.keys(counts).filter((k) => counts[k] > (baseCounts[k] || 0))
const newOccurrences = violations.filter((v) => overflowKeys.includes(`${v.kind}|${v.value}`))

if (jsonOut) {
  console.log(JSON.stringify({ mode, overflowKeys, newOccurrences, totals: byKind }, null, 2))
} else {
  const shrunk = Object.keys(baseCounts).filter((k) => (counts[k] || 0) < baseCounts[k]).length
  console.log(`当前违规 ${violations.length} 条（基线 ${baseline.totals ? baseline.totals.all : '?'} 条）：${JSON.stringify(byKind)}`)
  if (shrunk) console.log(`已收敛的字面量种类：${shrunk}`)
  if (overflowKeys.length) {
    console.log(`\n新增违规（超出基线）${overflowKeys.length} 种：`)
    for (const k of overflowKeys) {
      console.log(`  ${k}  基线 ${baseCounts[k] || 0} → 现在 ${counts[k]}`)
    }
    console.log('出现位置：')
    printList(newOccurrences)
    console.log('\n请改用 src/styles/tokens.css 中的 --vl-* token（方案 §7.2）。')
  } else {
    console.log('无新增违规。')
  }
}
process.exit(overflowKeys.length ? 1 : 0)
