#!/usr/bin/env node
/**
 * WP-B：文字 token 对比度实测（方案 §9.3 WP-B、§7.4 第 3 条）。
 *
 * 从 src/styles/tokens.css 解析三套声明块的 hex：
 *   :root（浅色）、:root:not([data-theme='light'])（跟随系统的深色）、
 *   :root[data-theme='dark']（显式深色）
 * 然后按 WCAG 2.1 相对亮度公式算 --vl-ink / --vl-ink-2 / --vl-ink-3 与
 * --vl-verify / --vl-caution / --vl-danger 在各自 --vl-bg 与 --vl-surface 上的对比度。
 *
 * 判定：正文/元数据 ≥ 4.5:1 通过。有任一未通过则退出码 1。
 * 用法：node scripts/contrast-check.mjs [--json]
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const tokensPath = path.join(rootDir, 'src', 'styles', 'tokens.css')
const AA = 4.5

function parseBlocks(css) {
  // 逐块扫描：记录选择器 → { token: hex }
  const blocks = []
  const re = /([^{}]+)\{([^{}]*)\}/g
  let m
  while ((m = re.exec(css)) !== null) {
    const selector = m[1].trim().replace(/\s+/g, ' ')
    const body = m[2]
    const vars = {}
    const vre = /(--vl-[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g
    let vm
    while ((vm = vre.exec(body)) !== null) vars[vm[1]] = vm[2].toLowerCase()
    if (Object.keys(vars).length) blocks.push({ selector, vars })
  }
  return blocks
}

function pickTheme(blocks, matcher) {
  const out = {}
  for (const b of blocks) {
    if (!matcher(b.selector)) continue
    Object.assign(out, b.vars)
  }
  return out
}

function toRgb(hex) {
  let h = hex.slice(1)
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
}

function luminance(hex) {
  const [r, g, b] = toRgb(hex).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a, b) {
  const l1 = luminance(a)
  const l2 = luminance(b)
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (hi + 0.05) / (lo + 0.05)
}

const css = fs.readFileSync(tokensPath, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const blocks = parseBlocks(css)

const light = pickTheme(blocks, (s) => s === ':root')
const darkSystem = { ...light, ...pickTheme(blocks, (s) => s.includes(":not([data-theme='light'])")) }
const darkExplicit = { ...light, ...pickTheme(blocks, (s) => s.includes("[data-theme='dark']")) }

const FG = ['--vl-ink', '--vl-ink-2', '--vl-ink-3', '--vl-verify', '--vl-caution', '--vl-danger']
const BG = ['--vl-bg', '--vl-surface']
const THEMES = [
  ['浅色 :root', light],
  ["深色 prefers-color-scheme", darkSystem],
  ["深色 [data-theme='dark']", darkExplicit],
]

const rows = []
for (const [themeName, vars] of THEMES) {
  for (const bg of BG) {
    for (const fg of FG) {
      if (!vars[fg] || !vars[bg]) continue
      const ratio = contrast(vars[fg], vars[bg])
      rows.push({
        theme: themeName,
        fg,
        fgHex: vars[fg],
        bg,
        bgHex: vars[bg],
        ratio: Math.round(ratio * 100) / 100,
        pass: ratio >= AA,
      })
    }
  }
}

const failed = rows.filter((r) => !r.pass)

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ threshold: AA, rows, failed }, null, 2))
} else {
  let theme = ''
  for (const r of rows) {
    if (r.theme !== theme) {
      theme = r.theme
      console.log(`\n== ${theme} ==`)
    }
    console.log(
      `  ${r.fg.padEnd(14)} ${r.fgHex}  on ${r.bg.padEnd(12)} ${r.bgHex}  ` +
      `${String(r.ratio).padStart(6)}:1  ${r.pass ? '通过' : '不通过'}`,
    )
  }
  console.log(`\n共 ${rows.length} 组，未达 ${AA}:1 的 ${failed.length} 组。`)
}

process.exit(failed.length ? 1 : 0)
