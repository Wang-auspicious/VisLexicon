import { AnimatedCircularProgressBar } from '../vendor/magicui/animated-circular-progress-bar'
import { tag } from '../lib/jsx'

const props = p => ({ value: Math.min(p.value, p.max), max: p.max, min: 0, gaugePrimaryColor: p.gaugePrimaryColor, gaugeSecondaryColor: p.gaugeSecondaryColor })
export default function Preview({ p }) {
  return <AnimatedCircularProgressBar {...props(p)} className="text-white" />
}
export const usage = p => `import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar"\n\n${tag('AnimatedCircularProgressBar', props(p))}`
