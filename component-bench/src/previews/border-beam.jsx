import { BorderBeam } from '../vendor/magicui/border-beam'
import { tag } from '../lib/jsx'

const props = p => ({ size: p.size, duration: p.duration, colorFrom: p.colorFrom, colorTo: p.colorTo, borderWidth: p.borderWidth, reverse: p.reverse })
export default function Preview({ p }) {
  return (
    <div className="relative w-[min(340px,90%)] overflow-hidden rounded-2xl bg-zinc-900 p-6 ring-1 ring-white/10">
      <div className="text-lg font-semibold text-white">Sign in</div>
      <div className="mt-1 text-sm text-zinc-400">Continue to your workspace</div>
      <div className="mt-5 space-y-3">
        <div className="h-10 rounded-lg bg-zinc-800 px-3 text-sm leading-10 text-zinc-500">you@company.com</div>
        <div className="h-10 rounded-lg bg-zinc-800 px-3 text-sm leading-10 text-zinc-500">••••••••</div>
        <div className="h-10 rounded-lg bg-white text-center text-sm font-medium leading-10 text-black">Continue</div>
      </div>
      <BorderBeam {...props(p)} />
    </div>
  )
}
export const usage = p => `import { BorderBeam } from "@/components/ui/border-beam"\n\n<div className="relative overflow-hidden rounded-2xl">\n  {/* card content */}\n${tag('BorderBeam', props(p), null, '  ')}\n</div>`
