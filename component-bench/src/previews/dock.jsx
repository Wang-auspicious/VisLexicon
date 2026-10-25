import { Dock, DockIcon } from '../vendor/magicui/dock'
import { tag } from '../lib/jsx'

const ICONS = [
  ['Home', 'M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z'],
  ['Search', 'M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm9 16-4.3-4.3'],
  ['Mail', 'M3 6h18v12H3zM3 7l9 6 9-6'],
  ['Calendar', 'M4 5h16v15H4zM4 9h16M9 3v4M15 3v4'],
  ['Music', 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm11-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0z'],
  ['Camera', 'M3 8h4l2-3h6l2 3h4v11H3zM12 10a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z'],
]
const props = p => ({ iconSize: p.iconSize, iconMagnification: p.iconMagnification, iconDistance: p.iconDistance, disableMagnification: p.disableMagnification, direction: p.direction })
export default function Preview({ p }) {
  return (
    <Dock {...props(p)} className="border-white/10 bg-zinc-900/80">
      {ICONS.map(([label, d]) => (
        <DockIcon key={label} className="bg-zinc-800 text-zinc-100" aria-label={label}>
          <svg viewBox="0 0 24 24" className="size-1/2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
        </DockIcon>
      ))}
    </Dock>
  )
}
export const usage = p => `import { Dock, DockIcon } from "@/components/ui/dock"\n\n${tag('Dock', props(p), '  <DockIcon><HomeIcon /></DockIcon>\n  <DockIcon><SearchIcon /></DockIcon>\n  <DockIcon><MailIcon /></DockIcon>')}`
