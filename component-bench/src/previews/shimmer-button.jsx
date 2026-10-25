import { ShimmerButton } from '../vendor/magicui/shimmer-button'
import { tag } from '../lib/jsx'

// The component takes CSS strings; the panel edits numbers and adds the unit here.
const props = p => ({ shimmerColor: p.shimmerColor, shimmerDuration: `${p.shimmerDuration}s`, shimmerSize: `${p.shimmerSize}em`, borderRadius: `${p.borderRadius}px`, background: p.background })
export default function Preview({ p }) {
  return <ShimmerButton {...props(p)}><span className="px-2 text-base font-medium text-white">{p.label}</span></ShimmerButton>
}
export const usage = p => `import { ShimmerButton } from "@/components/ui/shimmer-button"\n\n${tag('ShimmerButton', props(p), `  ${p.label}`)}`
