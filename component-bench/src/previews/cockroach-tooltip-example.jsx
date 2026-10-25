import { Tooltip } from '../vendor/cockroachdb/ui/ee6b0f0d614499fe1d9c74b849d58eb3983c5a54/packages/ui-components/src/Tooltip/Tooltip.tsx'

// Keep the original Example story's centered stage, label, content and top placement.
export default function CockroachTooltipExample({ p = {} } = {}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: 300 }}>
      <Tooltip placement={p.placement ?? 'top'} content={p.content ?? 'Hello, world'}>
        Hover me
      </Tooltip>
    </div>
  )
}
