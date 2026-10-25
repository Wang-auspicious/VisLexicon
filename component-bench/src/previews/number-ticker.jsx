import { NumberTicker } from '../vendor/magicui/number-ticker'
import { tag } from '../lib/jsx'

const props = p => ({ value: p.value, startValue: p.startValue, direction: p.direction, delay: p.delay, decimalPlaces: p.decimalPlaces })
export default function Preview({ p }) {
  return (
    <div className="w-[min(420px,90%)] rounded-3xl bg-zinc-900/80 p-7 ring-1 ring-white/10">
      <div className="text-sm text-zinc-400">Visits · last 20 days</div>
      <div className="mt-3 flex items-baseline gap-2">
        <NumberTicker {...props(p)} className="text-6xl font-semibold tracking-tight text-white tabular-nums" />
        <span className="text-zinc-400">visits</span>
      </div>
    </div>
  )
}
export const usage = p => `import { NumberTicker } from "@/components/ui/number-ticker"\n\n${tag('NumberTicker', { ...props(p), className: 'text-6xl font-semibold tabular-nums' })}`
