import { FlickeringGrid } from '../vendor/magicui/flickering-grid'
import { tag } from '../lib/jsx'

const props = p => ({ squareSize: p.squareSize, gridGap: p.gridGap, flickerChance: p.flickerChance, color: p.color, maxOpacity: p.maxOpacity })
export default function Preview({ p }) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <FlickeringGrid {...props(p)} className="absolute inset-0 size-full" />
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="rounded-full bg-black/60 px-5 py-2 text-sm text-white ring-1 ring-white/15 backdrop-blur">Flickering grid</div>
      </div>
    </div>
  )
}
export const usage = p => `import { FlickeringGrid } from "@/components/ui/flickering-grid"\n\n<div className="relative h-[400px] w-full overflow-hidden">\n${tag('FlickeringGrid', { ...props(p), className: 'absolute inset-0 size-full' }, null, '  ')}\n</div>`
