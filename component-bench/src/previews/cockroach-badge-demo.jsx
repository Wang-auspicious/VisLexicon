import { Badge } from '../vendor/cockroachdb/ui/ee6b0f0d614499fe1d9c74b849d58eb3983c5a54/packages/ui-components/src/Badge/Badge.tsx'

// Keep the original Badge.Demo story's single badge and its knob-backed values.
export default function CockroachBadgeDemo({ p = {} } = {}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: 300 }}>
      <Badge intent={p.intent ?? 'neutral'} transformCase={p.transformCase ?? 'uppercase'}>
        {p.text ?? 'badge'}
      </Badge>
    </div>
  )
}
