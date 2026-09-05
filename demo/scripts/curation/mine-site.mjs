#!/usr/bin/env node
// 单站深挖跑一次：Tier 1（静态 CSS）+ Tier 2（浏览器探针，经 OpenCLI Browser Bridge）。
// 规格：docs/superpowers/specs/2026-09-02-routed-deep-mining-and-threshold-design.md
//
//   node scripts/curation/mine-site.mjs <url> [--session name] [--out file.json] [--settle ms]
//
// 浏览器层是 adapter：这里用 OpenCLI，换 CDP 或 Playwright 只需替换 runProbe。

import { execFile } from 'node:child_process'
import { writeFile } from 'node:fs/promises'
import { promisify } from 'node:util'
import process from 'node:process'

import { analyze } from '@projectwallace/css-analyzer'
import { probeExpression } from '../../src/lib/mining-extractor/browser-probe.js'
import { mergeProbeReadings } from '../../src/lib/mining-extractor/dom-metrics.js'
import { extractMetrics } from '../../src/lib/mining-extractor/index.js'
import { vetoReasons } from '../../src/lib/mining-threshold.js'

const execFileAsync = promisify(execFile)

const MAX_CSS_BYTES = 3_000_000
const FETCH_TIMEOUT_MS = 20_000
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36'

function parseArgs(argv) {
  const [url, ...rest] = argv
  const options = { url, session: 'vislex', out: null, settle: 2500 }
  for (let index = 0; index < rest.length; index += 1) {
    const flag = rest[index]
    if (flag === '--session') options.session = rest[++index]
    else if (flag === '--out') options.out = rest[++index]
    else if (flag === '--settle') options.settle = Number.parseInt(rest[++index], 10)
  }
  return options
}

async function fetchText(url, signal) {
  const response = await fetch(url, {
    signal,
    redirect: 'follow',
    headers: { 'user-agent': USER_AGENT, accept: '*/*' },
  })
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
  return { text: await response.text(), finalUrl: response.url, status: response.status }
}

/**
 * Tier 1 的 CSS 来源：内联 <style> 与 <link rel=stylesheet>。
 * Node 侧取样表没有跨域限制，因此比页面内 document.styleSheets 拿得更全。
 */
async function collectCss(pageUrl) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  const notes = []
  let html = ''
  let finalUrl = pageUrl
  let status = 0
  try {
    const page = await fetchText(pageUrl, controller.signal)
    html = page.text
    finalUrl = page.finalUrl
    status = page.status
  } catch (error) {
    clearTimeout(timer)
    const cause = error.cause?.code ?? error.cause?.message ?? error.name
    return {
      css: '',
      notes: [`html fetch failed: ${error.message}${cause ? ` (${cause})` : ''}`],
      finalUrl,
      status: 0,
      sheets: 0,
    }
  }
  clearTimeout(timer)

  const chunks = []
  for (const match of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/giu)) {
    chunks.push(match[1])
  }

  const hrefs = []
  for (const match of html.matchAll(/<link\b[^>]*>/giu)) {
    const tag = match[0]
    if (!/rel\s*=\s*["']?[^"'>]*stylesheet/iu.test(tag)) continue
    const href = /href\s*=\s*["']([^"']+)["']/iu.exec(tag)
    if (href) hrefs.push(href[1])
  }

  let bytes = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  let sheets = 0
  for (const href of hrefs) {
    if (bytes >= MAX_CSS_BYTES) {
      notes.push(`css budget ${MAX_CSS_BYTES} bytes reached; ${hrefs.length - sheets} sheet(s) skipped`)
      break
    }
    let absolute
    try {
      absolute = new URL(href, finalUrl).href
    } catch {
      notes.push(`unresolvable stylesheet href: ${href}`)
      continue
    }
    const sheetController = new AbortController()
    const sheetTimer = setTimeout(() => sheetController.abort(), FETCH_TIMEOUT_MS)
    try {
      const sheet = await fetchText(absolute, sheetController.signal)
      chunks.push(sheet.text)
      bytes += sheet.text.length
      sheets += 1
    } catch (error) {
      notes.push(`stylesheet fetch failed (${absolute}): ${error.message}`)
    } finally {
      clearTimeout(sheetTimer)
    }
  }

  return { css: chunks.join('\n'), notes, finalUrl, status, sheets }
}

// OpenCLI 会在输出里混入更新提示和 undici 警告，需要剥掉再解析。
function parseCliJson(stdout) {
  const cleaned = stdout
    .split(/\r?\n/u)
    .filter((line) => !/Update available|npm install -g|UNDICI-EHPA|trace-warnings/u.test(line))
    .join('\n')
    .trim()
  const start = cleaned.search(/[[{]/u)
  if (start === -1) throw new Error(`no JSON in CLI output: ${cleaned.slice(0, 200)}`)
  const opener = cleaned[start]
  const closer = opener === '{' ? '}' : ']'
  const end = cleaned.lastIndexOf(closer)
  if (end <= start) throw new Error(`unbalanced JSON in CLI output: ${cleaned.slice(0, 200)}`)
  return JSON.parse(cleaned.slice(start, end + 1))
}

// 直接调 opencli 的 node 入口，不经 shell。
// Windows 的 cmd.exe 命令行上限是 8191 字符，而探针表达式接近 9 KB，
// 走 .cmd 包装必然报 "The command line is too long"。CreateProcess 的上限是 32767，够用。
const OPENCLI_ENTRY = process.env.OPENCLI_ENTRY ??
  `${process.env.APPDATA ?? ''}/npm/node_modules/@jackwener/opencli/dist/src/main.js`

async function opencli(session, args) {
  const { stdout } = await execFileAsync(
    process.execPath,
    [OPENCLI_ENTRY, 'browser', session, ...args],
    { maxBuffer: 32 * 1024 * 1024, windowsHide: true },
  )
  return stdout
}

async function runProbe(url, { session, settle }) {
  await opencli(session, ['open', url])
  await new Promise((resolve) => { setTimeout(resolve, settle) })
  const expression = probeExpression({ label: 'browser-window', primary: true })
  const stdout = await opencli(session, ['eval', expression])
  return parseCliJson(stdout)
}

function summarise(result, context) {
  const lines = []
  lines.push(`URL            ${context.url}`)
  if (context.veto.length > 0) {
    lines.push('')
    lines.push('*** VETOED — this reading is not the target site ***')
    for (const reason of context.veto) lines.push(`  ! ${reason}`)
    lines.push('')
  }
  lines.push(`final URL      ${context.finalUrl}`)
  lines.push(`http status    ${context.status}`)
  lines.push(`stylesheets    ${context.sheets} linked + inline`)
  lines.push(`css bytes      ${context.cssBytes}`)
  lines.push(`tiers run      ${result.tiersRun.join(', ') || 'none'}`)
  lines.push('')

  lines.push('METRICS')
  for (const name of Object.keys(result.metrics).sort()) {
    const value = result.metrics[name]
    const shown = typeof value === 'number' ? Number(value.toFixed(4)) : value
    lines.push(`  ${result.provenance[name].padEnd(4)} ${name.padEnd(32)} ${shown}`)
  }

  lines.push('')
  lines.push(`SUPPORTED TAGS (${result.signalTags.length})`)
  for (const entry of result.signalTags) {
    lines.push(`  + ${entry.tag}`)
    lines.push(`      ${JSON.stringify(entry.evidence)}`)
  }

  lines.push('')
  lines.push(`REFUTED (${result.refutedTags.length})  ${result.refutedTags.join(', ') || '—'}`)

  lines.push('')
  lines.push(`UNDECIDABLE (${result.undecidableTags.length})`)
  for (const entry of result.undecidableTags) {
    lines.push(`  ? ${entry.tag.padEnd(30)} missing: ${entry.missingMetrics.join(', ')}`)
  }

  if (result.conflicts.length > 0) {
    lines.push('')
    lines.push('TIER CONFLICTS')
    for (const conflict of result.conflicts) lines.push(`  ! ${JSON.stringify(conflict)}`)
  }

  const notes = [...context.notes, ...result.notes]
  if (notes.length > 0) {
    lines.push('')
    lines.push('NOTES')
    for (const note of notes) lines.push(`  - ${note}`)
  }

  return lines.join('\n')
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  if (!options.url) {
    process.stdout.write('usage: mine-site.mjs <url> [--session name] [--out file.json] [--settle ms]\n')
    process.exitCode = 1
    return
  }

  const collected = await collectCss(options.url)
  const cssAnalysis = collected.css.trim() === '' ? null : analyze(collected.css)

  let probe = null
  const notes = [...collected.notes]
  try {
    const reading = await runProbe(options.url, options)
    const merged = mergeProbeReadings([reading], {
      url: options.url,
      finalUrl: collected.finalUrl,
    })
    probe = merged.payload
    for (const note of merged.notes) notes.push(`merge: ${note}`)
  } catch (error) {
    notes.push(`browser probe failed: ${error.message}`)
  }

  // 硬否决先跑：错误页、空壳、死链的读数不能进入标签判定。
  const veto = vetoReasons({
    fetch: { finalStatus: collected.status, timeoutProbes: 0 },
    robots: { disallowed: false },
    page: probe?.page ?? {},
    flags: { parkedDomain: false, prohibitedContent: [] },
    routeSignals: { channelA: ['R2'], channelB: 'R2', channelBDesignRelevant: true },
  })

  const result = veto.length > 0
    ? {
      extractorVersion: 'mining-extractor-v1',
      tiersRun: [],
      metrics: {},
      provenance: {},
      conflicts: [],
      signalTags: [],
      refutedTags: [],
      undecidableTags: [],
      notes: ['vetoed before tag evaluation'],
    }
    : extractMetrics({ cssAnalysis, probe })

  const context = {
    url: options.url,
    finalUrl: collected.finalUrl,
    status: collected.status,
    sheets: collected.sheets,
    cssBytes: collected.css.length,
    veto,
    notes,
  }

  process.stdout.write(`${summarise(result, context)}\n`)

  if (options.out) {
    await writeFile(options.out, `${JSON.stringify({ context, probe, result }, null, 2)}\n`, 'utf8')
    process.stdout.write(`\nwrote ${options.out}\n`)
  }
}

await main()
