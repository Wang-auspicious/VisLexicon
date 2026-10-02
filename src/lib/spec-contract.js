export const DESIGN_SPEC_VERSION = 'vislexicon.design-spec.v1'

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const asArray = (value) => (Array.isArray(value) ? value : [])
const asText = (value, fallback = 'unknown') => (typeof value === 'string' && value.trim() ? value.trim() : fallback)

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function requireObject(value, path) {
  if (!isPlainObject(value)) throw new Error(`${path} must be an object`)
  return value
}

function requireArray(value, path) {
  if (!Array.isArray(value)) throw new Error(`${path} must be an array`)
  return value
}

export function createDesignSpec(input = {}) {
  const source = isPlainObject(input.source) ? input.source : {}
  const rights = isPlainObject(source.rights) ? source.rights : {}
  const spec = {
    schema: DESIGN_SPEC_VERSION,
    createdAt: asText(input.createdAt, new Date().toISOString()),
    releaseId: asText(input.releaseId),
    selection: {
      objectId: asText(input.selection?.objectId, asText(input.stageId, 'unknown')),
      revision: asText(input.selection?.revision),
      stageId: asText(input.selection?.stageId, asText(input.stageId)),
      termId: asText(input.selection?.termId, asText(input.termId)),
      label: asText(input.selection?.label, asText(input.label, 'unknown')),
    },
    source: {
      urls: asArray(source.urls).map((url) => asText(url, '')).filter(Boolean),
      releaseId: asText(source.releaseId, asText(input.releaseId)),
      revision: asText(source.revision, asText(input.selection?.revision)),
      rights: {
        license: asText(rights.license),
        sourceUrl: asText(rights.sourceUrl, 'unknown'),
        evidence: asText(rights.evidence, 'unknown'),
        reuseability: asText(rights.reuseability),
      },
    },
    capabilities: {
      required: asArray(input.capabilities?.required).map(asText).filter(Boolean),
      verified: asArray(input.capabilities?.verified).map(asText).filter(Boolean),
      toImplement: asArray(input.capabilities?.toImplement).map(asText).filter(Boolean),
      unknown: asArray(input.capabilities?.unknown).map(asText).filter(Boolean),
    },
    parameters: isPlainObject(input.parameters) ? clone(input.parameters) : {},
    environment: isPlainObject(input.environment) ? clone(input.environment) : { framework: 'unknown' },
    acceptance: asArray(input.acceptance).map((check) => (
      isPlainObject(check)
        ? { id: asText(check.id, 'unknown'), statement: asText(check.statement), status: asText(check.status, 'unknown') }
        : { id: 'unknown', statement: asText(check), status: 'unknown' }
    )),
  }
  return validateDesignSpec(spec)
}

export function validateDesignSpec(value) {
  const spec = requireObject(value, '$')
  if (spec.schema !== DESIGN_SPEC_VERSION) throw new Error('$.schema is unsupported')
  if (typeof spec.createdAt !== 'string' || !spec.createdAt.trim()) throw new Error('$.createdAt is required')
  if (typeof spec.releaseId !== 'string' || !spec.releaseId.trim()) throw new Error('$.releaseId is required')
  const selection = requireObject(spec.selection, '$.selection')
  for (const key of ['objectId', 'revision', 'stageId', 'termId', 'label']) {
    if (typeof selection[key] !== 'string' || !selection[key].trim()) throw new Error(`$.selection.${key} is required`)
  }
  const source = requireObject(spec.source, '$.source')
  requireArray(source.urls, '$.source.urls')
  if (typeof source.releaseId !== 'string' || !source.releaseId.trim()) throw new Error('$.source.releaseId is required')
  if (typeof source.revision !== 'string' || !source.revision.trim()) throw new Error('$.source.revision is required')
  const rights = requireObject(source.rights, '$.source.rights')
  for (const key of ['license', 'sourceUrl', 'evidence', 'reuseability']) {
    if (typeof rights[key] !== 'string' || !rights[key].trim()) throw new Error(`$.source.rights.${key} is required`)
  }
  if (rights.license === 'unknown' && rights.reuseability === 'allowed') {
    throw new Error('$.source.rights.reuseability cannot be allowed when license is unknown')
  }
  const capabilities = requireObject(spec.capabilities, '$.capabilities')
  for (const key of ['required', 'verified', 'toImplement', 'unknown']) requireArray(capabilities[key], `$.capabilities.${key}`)
  requireObject(spec.parameters, '$.parameters')
  requireObject(spec.environment, '$.environment')
  requireArray(spec.acceptance, '$.acceptance')
  return spec
}

export function serializeDesignSpec(value) {
  return `${JSON.stringify(validateDesignSpec(value), null, 2)}\n`
}

export function parseDesignSpec(text) {
  if (typeof text !== 'string' || !text.trim()) throw new Error('Design Spec 文件为空')
  let value
  try {
    value = JSON.parse(text)
  } catch (error) {
    throw new Error(`Design Spec 不是有效 JSON：${error.message}`)
  }
  return validateDesignSpec(value)
}
