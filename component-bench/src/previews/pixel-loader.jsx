import { PixelLoader } from '../vendor/fancy/react/src/components/pixel-loader'
import { tag } from '../lib/jsx'

const props = p => ({ cols: p.cols, rows: p.rows, cellSize: p.cellSize, gap: p.gap, color: p.color, speed: p.speed })
export default function Preview({ p }) {
  return (
    <div className="flex flex-col items-center gap-5">
      <PixelLoader {...props(p)} />
      <span className="text-sm text-zinc-400">Generating preview…</span>
    </div>
  )
}
export const usage = p => `import { PixelLoader } from "@/components/ui/fancy/components/pixel-loader"\n\n${tag('PixelLoader', props(p))}`
