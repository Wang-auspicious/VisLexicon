function unique(values) {
  return [...new Set((values ?? []).filter(Boolean))].sort((left, right) =>
    String(left).localeCompare(String(right), 'en'),
  )
}

export function normalizeTerm(value) {
  const normalized = String(value).normalize('NFKC').trim()
  const functional = normalized.endsWith('()')
  const base = functional ? normalized.slice(0, -2) : normalized
  const namespaced = base.startsWith('::')
    ? `pseudo-element ${base.slice(2)}`
    : base.startsWith(':')
      ? `pseudo-class ${base.slice(1)}`
      : base.startsWith('@')
        ? `at-rule ${base.slice(1)}`
        : base

  return `${namespaced}${functional ? ' function' : ''}`
    .toLocaleLowerCase('en-US')
    .replaceAll('&', ' and ')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9\u3400-\u9fff]+/gu, '-')
    .replace(/^-+|-+$/g, '')
}

export function duplicateKey(record) {
  return [normalizeTerm(record.termEn), record.recordType, record.axis].join('|')
}

export function stableAtlasId(record) {
  return `atlas-${record.axis}-${record.recordType}-${normalizeTerm(record.termEn)}`
}

function evidenceKey(evidence) {
  return `${evidence.sourceId}\u0000${evidence.sourceRecordId}`
}

function mergeEvidence(left = [], right = []) {
  const evidence = new Map()
  for (const item of [...left, ...right]) evidence.set(evidenceKey(item), structuredClone(item))
  return [...evidence.values()].sort((a, b) => evidenceKey(a).localeCompare(evidenceKey(b), 'en'))
}

export function mergeCandidates(records) {
  const merged = new Map()

  for (const input of records) {
    const record = structuredClone(input)
    const key = duplicateKey(record)
    const current = merged.get(key)

    if (!current) {
      merged.set(key, {
        ...record,
        id: stableAtlasId(record),
        aliases: unique(record.aliases),
        scenes: unique(record.scenes),
        mediaBindings: unique(record.mediaBindings),
        sourceEvidence: mergeEvidence([], record.sourceEvidence),
      })
      continue
    }

    current.aliases = unique([...current.aliases, ...(record.aliases ?? [])])
    current.scenes = unique([...current.scenes, ...(record.scenes ?? [])])
    current.mediaBindings = unique([
      ...current.mediaBindings,
      ...(record.mediaBindings ?? []),
    ])
    current.sourceEvidence = mergeEvidence(current.sourceEvidence, record.sourceEvidence)
  }

  return [...merged.values()].sort((left, right) => left.id.localeCompare(right.id, 'en'))
}
