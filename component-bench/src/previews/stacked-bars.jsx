import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../vendor/shadcn/chart'

const config = {
  direct: { label: 'Direct', color: '#a78bfa' },
  search: { label: 'Search', color: '#60a5fa' },
  social: { label: 'Social', color: '#93c5fd' },
  referral: { label: 'Referral', color: '#fbbf24' },
}
const KEYS = Object.keys(config)
// The isolated design canvas is 800×500: 560px card minus 2×24px padding.
// Match the real first layout instead of drawing the default 320×200 chart.
const INITIAL_DIMENSION = { width: 512, height: 220 }
// Deterministic sample traffic so posters and live previews agree.
function series(days) {
  const start = new Date(2026, 8, 22)
  const dayFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
  return Array.from({ length: days }, (_, i) => {
    const wave = n => Math.round(n * (0.55 + 0.45 * Math.abs(Math.sin(i * 0.9 + n))))
    const date = new Date(start); date.setDate(start.getDate() + i)
    return { day: dayFormatter.format(date), direct: wave(584), search: wave(502), social: wave(260), referral: wave(180) }
  })
}
const SERIES = series(40)
export default function Preview({ p }) {
  const data = useMemo(() => SERIES.slice(0, p.days), [p.days])
  const total = useMemo(() => data.reduce((sum, row) => sum + KEYS.reduce((s, k) => s + row[k], 0), 0), [data])
  const vertical = p.layout === 'vertical'
  const roundedTop = useMemo(() => vertical ? [0, p.radius, p.radius, 0] : [p.radius, p.radius, 0, 0], [vertical, p.radius])
  return (
    <div className="w-[min(560px,94%)] rounded-3xl bg-zinc-900/80 p-6 ring-1 ring-white/10">
      <div className="text-sm font-medium text-white">Traffic</div>
      <div className="text-xs text-zinc-400">Last {p.days} days</div>
      <div className="mt-3 text-4xl font-semibold tabular-nums text-white">{total.toLocaleString('en-US')} <span className="text-base font-normal text-zinc-400">visits</span></div>
      <ChartContainer config={config} initialDimension={INITIAL_DIMENSION} className="mt-4 aspect-auto h-[220px] w-full">
        <BarChart data={data} layout={p.layout} barCategoryGap={`${p.barCategoryGap}%`} accessibilityLayer>
          <CartesianGrid vertical={vertical} horizontal={!vertical} strokeOpacity={0.12} />
          {vertical
            ? <><YAxis dataKey="day" type="category" tickLine={false} axisLine={false} width={48} /><XAxis type="number" hide /></>
            : <XAxis dataKey="day" tickLine={false} axisLine={false} minTickGap={24} />}
          <ChartTooltip cursor={{ fillOpacity: 0.06 }} content={<ChartTooltipContent />} />
          {KEYS.map((key, i) => (
            <Bar key={key} dataKey={key} stackId={p.stacked ? 'traffic' : undefined} fill={`var(--color-${key})`}
              isAnimationActive={false}
              radius={p.stacked ? (i === KEYS.length - 1 ? roundedTop : 0) : p.radius} />
          ))}
        </BarChart>
      </ChartContainer>
    </div>
  )
}
export const usage = p => `import { Bar, BarChart, XAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartConfig = {
  direct: { label: "Direct", color: "#a78bfa" },
  search: { label: "Search", color: "#60a5fa" },
  social: { label: "Social", color: "#93c5fd" },
  referral: { label: "Referral", color: "#fbbf24" },
}

<ChartContainer config={chartConfig} initialDimension={{ width: 512, height: 220 }} className="h-[220px] w-full">
  <BarChart data={data} layout="${p.layout}" barCategoryGap="${p.barCategoryGap}%">
    <XAxis dataKey="day" tickLine={false} axisLine={false} />
    <ChartTooltip content={<ChartTooltipContent />} />
${Object.keys(config).map(k => `    <Bar dataKey="${k}"${p.stacked ? ' stackId="traffic"' : ''} fill="var(--color-${k})" radius={${p.radius}} isAnimationActive={false} />`).join('\n')}
  </BarChart>
</ChartContainer>`
