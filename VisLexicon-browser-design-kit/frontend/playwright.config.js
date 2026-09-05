/**
 * WP-0 验收工装共享配置。
 *
 * 说明：本仓未安装 @playwright/test（测试运行器），只装了 playwright-core。
 * 因此本文件不是 test-runner 的配置文件，而是 scripts/shots.mjs 与
 * scripts/a11y-check.mjs 共用的一份普通 ESM 配置：视口档位、默认路由、
 * 浏览器可执行文件定位、预览服务端口。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const rootDir = path.dirname(fileURLToPath(import.meta.url))

/** 三档验收视口（方案 §9.0 第 4 条）。 */
export const viewports = [
  { width: 390, height: 844, label: '390' },
  { width: 768, height: 1024, label: '768' },
  { width: 1440, height: 900, label: '1440' },
]

/** 默认路由集（方案 §9.2 冻结的路由段名）。尚未实现的路由也照样截图。 */
export const defaultRoutes = [
  '#/',
  '#/sites',
  '#/site/shadcn-ui',
  '#/atlas',
  '#/atlas/form-anatomy',
  '#/about',
]

/** vite preview 端口。可用 --port 覆盖。 */
export const previewPort = 4183

/** 产物根目录。 */
export const verificationDir = path.join(rootDir, 'docs', 'verification')

/**
 * 定位已预装的 Chromium。浏览器由镜像预置在 PLAYWRIGHT_BROWSERS_PATH，
 * 不执行 `playwright install`。
 */
export function resolveChromium() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers'
  const candidates = []
  let entries = []
  try {
    entries = fs.readdirSync(base)
  } catch {
    entries = []
  }
  // 优先完整 chromium，其次 headless shell。
  const ordered = [
    ...entries.filter((e) => /^chromium-/.test(e)),
    ...entries.filter((e) => /^chromium_headless_shell-/.test(e)),
    ...entries.filter((e) => e === 'chromium'),
  ]
  for (const dir of ordered) {
    candidates.push(path.join(base, dir, 'chrome-linux', 'chrome'))
    candidates.push(path.join(base, dir, 'chrome-linux', 'headless_shell'))
  }
  for (const c of candidates) {
    if (fs.existsSync(c)) return c
  }
  throw new Error(
    `未在 ${base} 找到 Chromium 可执行文件。请设置 PLAYWRIGHT_BROWSERS_PATH，不要运行 playwright install。`,
  )
}

/** 把 hash 路由转成文件名片段：'#/' → 'home'，'#/site/x' → 'site--x'。 */
export function routeSlug(route) {
  const raw = String(route).replace(/^#\/?/, '').replace(/\/+$/, '')
  if (!raw) return 'home'
  return raw.replace(/[^a-zA-Z0-9_-]+/g, '--')
}

/** 极简参数解析：--k v / --k=v / --flag。 */
export function parseArgs(argv) {
  const out = { _: [] }
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i]
    if (!a.startsWith('--')) {
      out._.push(a)
      continue
    }
    const eq = a.indexOf('=')
    if (eq > -1) {
      out[a.slice(2, eq)] = a.slice(eq + 1)
      continue
    }
    const next = argv[i + 1]
    if (next && !next.startsWith('--')) {
      out[a.slice(2)] = next
      i += 1
    } else {
      out[a.slice(2)] = true
    }
  }
  return out
}

/**
 * 起一个 `vite preview` 静态服务并等待端口就绪。
 * 返回 { origin, stop }。调用方负责 stop()。
 */
export async function startPreview({ port = previewPort, quiet = true } = {}) {
  const { spawn } = await import('node:child_process')
  const bin = path.join(rootDir, 'node_modules', '.bin', 'vite')
  const child = spawn(bin, ['preview', '--port', String(port), '--strictPort'], {
    cwd: rootDir,
    stdio: quiet ? ['ignore', 'pipe', 'pipe'] : 'inherit',
  })
  let log = ''
  if (quiet) {
    child.stdout.on('data', (d) => {
      log += d.toString()
    })
    child.stderr.on('data', (d) => {
      log += d.toString()
    })
  }
  const origin = `http://127.0.0.1:${port}`
  const deadline = Date.now() + 30000
  for (;;) {
    if (child.exitCode !== null) {
      throw new Error(`vite preview 退出（code ${child.exitCode}）：\n${log}`)
    }
    try {
      const res = await fetch(`${origin}/`)
      if (res.ok) break
    } catch {
      /* 还没起来 */
    }
    if (Date.now() > deadline) {
      child.kill('SIGKILL')
      throw new Error(`等待 ${origin} 超时。请先 npm run build。\n${log}`)
    }
    await new Promise((r) => setTimeout(r, 250))
  }
  return {
    origin,
    stop() {
      try {
        child.kill('SIGTERM')
      } catch {
        /* ignore */
      }
    },
  }
}

export default { viewports, defaultRoutes, previewPort, resolveChromium, startPreview }

