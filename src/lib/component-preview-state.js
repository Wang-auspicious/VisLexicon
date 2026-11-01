// Contradictory legacy screenshot metadata must not grant source or license claims.
// Keep the original records untouched for later identity and license review.
export function guardLegacyScreenshot(unit) {
  const code = unit?.codeResource
  if (!String(unit?.id ?? '').startsWith('v4-') || !code) return unit
  const contradictory = code.previewStatus === 'verified' && !code.previewUrl && code.sourceAvailable
  const legacySlim = code.previewStatus === undefined && code.sourceAvailable === undefined && unit.offers?.some(offer => offer.sourceAvailable === true)
  if (!contradictory && !legacySlim) return unit
  return { ...unit, offers: [], codeResource: { ...code, previewStatus: contradictory ? 'screenshot' : 'unverified', sourceAvailable: false, license: null, controls: [] } }
}

export function isScreenshotPreview(item, unit, previewUrl) {
  if (previewUrl) return false
  return item?.preview?.status === 'screenshot' || item?.previewStatus === 'screenshot' || item?.lane === 'screenshot' || (!previewUrl && unit?.previewKind === 'image' && !unit?.codeResource?.sourceAvailable)
}
