#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const FRONTEND = path.resolve(HERE, '..')
const SHOTS = path.join(FRONTEND, 'public', 'shots')
const JOBS_FILE = process.argv[2] || path.join(HERE, 'capture-jobs.json')
const CHROME =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

const jobs = JSON.parse(fs.readFileSync(JOBS_FILE, 'utf8'))

function runChrome(url, outFile) {
  return new Promise((resolve, reject) => {
    const args = [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--timeout=15000',
      '--window-size=1280,900',
      `--screenshot=${outFile}`,
      '--virtual-time-budget=5000',
      url,
    ]
    const child = spawn(CHROME, args, { windowsHide: true })
    let err = ''
    child.stderr.on('data', (chunk) => {
      err += chunk
    })
    const timer = setTimeout(() => {
      child.kill('SIGKILL')
      reject(new Error(`timeout ${url}`))
    }, 20000)
    child.on('error', (e) => {
      clearTimeout(timer)
      reject(e)
    })
    child.on('close', (code) => {
      clearTimeout(timer)
      if (fs.existsSync(outFile) && fs.statSync(outFile).size > 1000) resolve()
      else reject(new Error(`chrome ${code} ${url} ${err.slice(0, 400)}`))
    })
  })
}

const report = []
for (const job of jobs) {
  const dir = path.join(SHOTS, job.entryId)
  fs.mkdirSync(dir, { recursive: true })
  for (const role of ['identity', 'breadth', 'proof']) {
    const url = job[role]
    if (!url) continue
    const outFile = path.join(dir, `v2-${role}.png`)
    if (fs.existsSync(outFile) && fs.statSync(outFile).size > 1000) {
      const buf = fs.readFileSync(outFile)
      report.push({
        entryId: job.entryId,
        role,
        url,
        src: `/shots/${job.entryId}/v2-${role}.png`,
        width: 1280,
        height: 900,
        bytes: buf.length,
        sha256: createHash('sha256').update(buf).digest('hex'),
        skippedExisting: true,
      })
      process.stdout.write(`exists ${job.entryId} ${role}\n`)
      continue
    }
    process.stdout.write(`capturing ${job.entryId} ${role}\n`)
    try {
      await runChrome(url, outFile)
    } catch (error) {
      process.stdout.write(`SKIP ${job.entryId} ${role}: ${error.message}\n`)
      continue
    }
    const buf = fs.readFileSync(outFile)
    report.push({
      entryId: job.entryId,
      role,
      url,
      src: `/shots/${job.entryId}/v2-${role}.png`,
      width: 1280,
      height: 900,
      bytes: buf.length,
      sha256: createHash('sha256').update(buf).digest('hex'),
    })
  }
}

const out = path.join(HERE, 'capture-report.json')
fs.writeFileSync(out, JSON.stringify(report, null, 2))
process.stdout.write(`wrote ${out} (${report.length} shots)\n`)
