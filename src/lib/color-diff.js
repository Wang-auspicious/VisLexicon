const D65 = [0.95047, 1, 1.08883]
const DELTA = 6 / 29
const POW_25_7 = 25 ** 7

function linearizeSrgb(channel) {
  const value = channel / 255
  return value <= 0.04045
    ? value / 12.92
    : ((value + 0.055) / 1.055) ** 2.4
}

function labCurve(value) {
  return value > DELTA ** 3
    ? Math.cbrt(value)
    : value / (3 * DELTA ** 2) + 4 / 29
}

/** Convert an 8-bit sRGB triplet to CIE Lab using the D65 reference white. */
export function rgbToLab([red, green, blue]) {
  const r = linearizeSrgb(red)
  const g = linearizeSrgb(green)
  const b = linearizeSrgb(blue)

  const x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / D65[0]
  const y = (0.2126729 * r + 0.7151522 * g + 0.072175 * b) / D65[1]
  const z = (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / D65[2]

  const fx = labCurve(x)
  const fy = labCurve(y)
  const fz = labCurve(z)

  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}

const degrees = (radians) => radians * 180 / Math.PI
const radians = (angle) => angle * Math.PI / 180
const cosDegrees = (angle) => Math.cos(radians(angle))
const sinDegrees = (angle) => Math.sin(radians(angle))

function hueDegrees(a, b) {
  if (a === 0 && b === 0) return 0
  const angle = degrees(Math.atan2(b, a))
  return angle >= 0 ? angle : angle + 360
}

/** CIEDE2000 color difference for two [L, a, b] values (kL = kC = kH = 1). */
export function deltaE2000([l1, a1, b1], [l2, a2, b2]) {
  const c1 = Math.hypot(a1, b1)
  const c2 = Math.hypot(a2, b2)
  const meanC = (c1 + c2) / 2
  const meanC7 = meanC ** 7
  const g = 0.5 * (1 - Math.sqrt(meanC7 / (meanC7 + POW_25_7)))

  const a1Prime = (1 + g) * a1
  const a2Prime = (1 + g) * a2
  const c1Prime = Math.hypot(a1Prime, b1)
  const c2Prime = Math.hypot(a2Prime, b2)
  const h1Prime = hueDegrees(a1Prime, b1)
  const h2Prime = hueDegrees(a2Prime, b2)

  const deltaLPrime = l2 - l1
  const deltaCPrime = c2Prime - c1Prime
  let deltaHAngle = 0
  if (c1Prime * c2Prime !== 0) {
    deltaHAngle = h2Prime - h1Prime
    if (deltaHAngle > 180) deltaHAngle -= 360
    else if (deltaHAngle < -180) deltaHAngle += 360
  }
  const deltaHPrime = 2 * Math.sqrt(c1Prime * c2Prime) * sinDegrees(deltaHAngle / 2)

  const meanLPrime = (l1 + l2) / 2
  const meanCPrime = (c1Prime + c2Prime) / 2
  let meanHPrime
  if (c1Prime * c2Prime === 0) {
    meanHPrime = h1Prime + h2Prime
  } else if (Math.abs(h1Prime - h2Prime) <= 180) {
    meanHPrime = (h1Prime + h2Prime) / 2
  } else if (h1Prime + h2Prime < 360) {
    meanHPrime = (h1Prime + h2Prime + 360) / 2
  } else {
    meanHPrime = (h1Prime + h2Prime - 360) / 2
  }

  const t = 1
    - 0.17 * cosDegrees(meanHPrime - 30)
    + 0.24 * cosDegrees(2 * meanHPrime)
    + 0.32 * cosDegrees(3 * meanHPrime + 6)
    - 0.2 * cosDegrees(4 * meanHPrime - 63)
  const deltaTheta = 30 * Math.exp(-(((meanHPrime - 275) / 25) ** 2))
  const meanCPrime7 = meanCPrime ** 7
  const rc = 2 * Math.sqrt(meanCPrime7 / (meanCPrime7 + POW_25_7))
  const lightnessOffset = meanLPrime - 50
  const sl = 1 + (0.015 * lightnessOffset ** 2) / Math.sqrt(20 + lightnessOffset ** 2)
  const sc = 1 + 0.045 * meanCPrime
  const sh = 1 + 0.015 * meanCPrime * t
  const rt = -sinDegrees(2 * deltaTheta) * rc

  const lightnessTerm = deltaLPrime / sl
  const chromaTerm = deltaCPrime / sc
  const hueTerm = deltaHPrime / sh
  return Math.sqrt(
    lightnessTerm ** 2
    + chromaTerm ** 2
    + hueTerm ** 2
    + rt * chromaTerm * hueTerm,
  )
}

/** Summarize per-cell differences and rank significant cells by descending ΔE. */
export function summarizeDiff(cells, hotspotThreshold = 10) {
  if (cells.length === 0) {
    return { mean: 0, p95: 0, max: 0, hotspots: [], ranked: [] }
  }

  const ranked = [...cells].sort((a, b) => b.d - a.d)
  const ascending = [...ranked].sort((a, b) => a.d - b.d)
  const total = cells.reduce((sum, cell) => sum + cell.d, 0)
  const p95Index = Math.ceil(ascending.length * 0.95) - 1

  return {
    mean: total / cells.length,
    p95: ascending[p95Index].d,
    max: ranked[0].d,
    hotspots: ranked.filter((cell) => cell.d >= hotspotThreshold),
    ranked,
  }
}
