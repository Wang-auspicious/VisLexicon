import { useState } from 'react'
import GridLayout, { useContainerWidth } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'

const CARDS = [
  { i: 'revenue', label: 'Revenue', value: '$48.2k', color: '#a78bfa' },
  { i: 'users', label: 'Active users', value: '3,904', color: '#60a5fa' },
  { i: 'churn', label: 'Churn', value: '1.8%', color: '#f87171' },
  { i: 'nps', label: 'NPS', value: '62', color: '#34d399' },
  { i: 'tickets', label: 'Open tickets', value: '17', color: '#fbbf24' },
]
// Pack cards left to right for the current column count, wrapping rows.
function initial(cols) {
  let x = 0, y = 0
  return CARDS.map((card, n) => {
    const w = Math.min(cols, n === 0 ? 3 : 2), h = n === 0 ? 2 : 1
    if (x + w > cols) { x = 0; y += 1 }
    const item = { i: card.i, x, y, w, h }
    x += w
    return item
  })
}

export default function Preview({ p }) {
  const { width, containerRef, mounted } = useContainerWidth()
  const [layouts, setLayouts] = useState({})
  const layout = layouts[p.cols] ?? initial(p.cols)
  return (
    <div ref={containerRef} className="h-full w-[92%] overflow-auto py-4">
      {mounted && (
        <GridLayout width={width} layout={layout} onLayoutChange={next => setLayouts(all => ({ ...all, [p.cols]: next }))}
          gridConfig={{ cols: p.cols, rowHeight: p.rowHeight, margin: [p.margin, p.margin] }}
          dragConfig={{ enabled: p.dragEnabled }} resizeConfig={{ enabled: p.resizeEnabled }}>
          {CARDS.map(card => (
            <div key={card.i} className="flex cursor-grab flex-col justify-between overflow-hidden rounded-xl bg-zinc-900 px-3 py-2.5 ring-1 ring-white/10 active:cursor-grabbing">
              <div className="flex items-center gap-2 text-xs text-zinc-400"><span className="size-2 rounded-full" style={{ background: card.color }} />{card.label}</div>
              <div className="text-lg font-semibold leading-none tabular-nums text-white">{card.value}</div>
            </div>
          ))}
        </GridLayout>
      )}
    </div>
  )
}
export const usage = p => `import GridLayout, { useContainerWidth } from "react-grid-layout"
import "react-grid-layout/css/styles.css"

const { width, containerRef, mounted } = useContainerWidth()

<div ref={containerRef}>
  {mounted && (
    <GridLayout
      width={width}
      layout={layout}
      gridConfig={{ cols: ${p.cols}, rowHeight: ${p.rowHeight}, margin: [${p.margin}, ${p.margin}] }}
      dragConfig={{ enabled: ${p.dragEnabled} }}
      resizeConfig={{ enabled: ${p.resizeEnabled} }}
    >
      {items.map(item => <div key={item.i}>{item.label}</div>)}
    </GridLayout>
  )}
</div>`
