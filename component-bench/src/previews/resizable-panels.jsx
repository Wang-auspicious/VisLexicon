import { Group, Panel, Separator } from 'react-resizable-panels'

const NAMES = ['Explorer', 'Editor', 'Preview', 'Terminal']
export default function Preview({ p }) {
  const vertical = p.orientation === 'vertical'
  const count = p.panels
  return (
    <div className="h-[78%] w-[88%] overflow-hidden rounded-2xl bg-zinc-950 ring-1 ring-white/10">
      {/* Remount when the panel count or orientation changes so default sizes reapply. */}
      <Group key={`${p.orientation}-${count}`} orientation={p.orientation} className="h-full w-full">
        {NAMES.slice(0, count).flatMap((name, i) => [
          i > 0 && <Separator key={`s${i}`} className={`${vertical ? 'h-1.5' : 'w-1.5'} bg-zinc-800 transition-colors hover:bg-violet-500 data-[separator=active]:bg-violet-500`} />,
          <Panel key={name} minSize={`${p.minSize}%`} defaultSize={`${100 / count}%`} className="grid place-items-center">
            <div className="text-center">
              <div className="text-sm font-medium text-zinc-100">{name}</div>
              <div className="mt-1 text-xs text-zinc-500">min {p.minSize}%</div>
            </div>
          </Panel>,
        ].filter(Boolean))}
      </Group>
    </div>
  )
}
export const usage = p => `import { Group, Panel, Separator } from "react-resizable-panels"

<Group orientation="${p.orientation}">
${['Explorer', 'Editor', 'Preview', 'Terminal'].slice(0, p.panels).map((n, i) => `${i ? '  <Separator />\n' : ''}  <Panel minSize="${p.minSize}%">${n}</Panel>`).join('\n')}
</Group>`
