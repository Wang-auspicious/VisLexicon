const asArray = (value) => (Array.isArray(value) ? value : [])
const asText = (value) => (typeof value === 'string' ? value : '')

export function normalizeQuery(text) {
  return asText(text)
    .toLowerCase()
    .replace(/[\u3000\s]+/gu, ' ')
    .replace(/[，。！？、；：,.!?;:/\\()[\]{}]+/gu, ' ')
    .trim()
}

function phraseMatches(query, phrase) {
  const normalizedPhrase = normalizeQuery(phrase)
  return normalizedPhrase.length > 0 && query.includes(normalizedPhrase)
}

export function extractQuerySignals(text, aliases = []) {
  const query = normalizeQuery(text)
  const matched = []
  for (const alias of asArray(aliases)) {
    const phrase = asArray(alias?.phrases).find((candidate) => phraseMatches(query, candidate))
    if (!phrase) continue
    matched.push({
      id: asText(alias.id),
      phrase,
      tokens: asArray(alias.tokens).map(normalizeQuery).filter(Boolean),
      targetIds: asArray(alias.targetIds).map(asText).filter(Boolean),
      reasonZh: asText(alias.reasonZh),
    })
  }
  return matched
}

export function scoreSemanticCandidate(record, signals) {
  const id = asText(record?.id)
  const text = normalizeQuery(record?.text)
  let score = 0
  const reasons = []
  for (const signal of asArray(signals)) {
    const targetHit = asArray(signal.targetIds).includes(id)
    const tokenHits = asArray(signal.tokens).filter((token) => text.includes(token))
    if (!targetHit && tokenHits.length === 0) continue
    score += targetHit ? 12 : 4
    score += tokenHits.length
    if (signal.reasonZh) reasons.push(signal.reasonZh)
  }
  return { score, reasons: [...new Set(reasons)] }
}

export function rankQueryCandidates(records, query, options = {}) {
  const list = asArray(records)
  const normalized = normalizeQuery(query)
  const aliases = asArray(options.aliases)
  const signals = extractQuerySignals(normalized, aliases)
  const rows = list
    .map((record) => {
      const text = normalizeQuery(record?.text)
      const lexical = normalized && text.includes(normalized) ? 5 : 0
      const semantic = scoreSemanticCandidate(record, signals)
      return {
        record: semantic.reasons.length
          ? { ...record, matchReasons: semantic.reasons }
          : record,
        score: lexical + semantic.score,
      }
    })
    .filter((row) => row.score > 0)
    .sort((left, right) => right.score - left.score || String(left.record.id).localeCompare(String(right.record.id), 'en'))
  const best = rows[0]?.score ?? 0
  const tied = best > 0 && rows.filter((row) => row.score === best).length > 1
  const uncertain = signals.length > 0 && (best === 0 || tied)
  const limit = Number.isFinite(options.limit) ? options.limit : undefined
  return {
    records: limit === undefined ? rows.map((row) => row.record) : rows.slice(0, limit).map((row) => row.record),
    total: rows.length,
    signals,
    uncertain,
  }
}
