import { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { tag } from '../lib/jsx'

const props = p => ({ monthsShown: p.monthsShown, showWeekNumbers: p.showWeekNumbers, showTimeSelect: p.showTimeSelect, calendarStartDay: p.calendarStartDay })
export default function Preview({ p }) {
  const [date, setDate] = useState(() => new Date(2026, 9, 23, 14, 30))
  return (
    <div className="bench-datepicker">
      <DatePicker inline selected={date} onChange={setDate} {...props(p)} />
    </div>
  )
}
export const usage = p => `import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

${tag('DatePicker', { inline: true, ...props(p) }).replace('<DatePicker', '<DatePicker selected={date} onChange={setDate}')}`
