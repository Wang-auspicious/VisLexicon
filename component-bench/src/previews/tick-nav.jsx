import { useState } from 'react'
import { TickNav } from '../vendor/fancy/react/src/components/tick-nav'
import { tag } from '../lib/jsx'

const ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'components', label: 'Components', badge: 'New' },
  { id: 'patterns', label: 'Patterns' },
  { id: 'tokens', label: 'Design tokens' },
  { id: 'motion', label: 'Motion' },
  { id: 'changelog', label: 'Changelog' },
  { id: 'archive', label: 'Archive', disabled: true },
]
const props = p => ({ reach: p.reach, minorTicks: p.minorTicks, variant: p.variant, hdr: p.hdr, sound: p.sound })
export default function Preview({ p }) {
  const [value, setValue] = useState('components')
  return <div className="w-[min(320px,90%)] text-zinc-100"><TickNav items={ITEMS} value={value} onValueChange={setValue} {...props(p)} /></div>
}
export const usage = p => `import { TickNav } from "@/components/ui/fancy/components/tick-nav"\n\nconst items = [\n  { id: "overview", label: "Overview" },\n  { id: "components", label: "Components", badge: "New" },\n]\n\n${tag('TickNav', props(p)).replace('<TickNav', '<TickNav items={items}')}`
