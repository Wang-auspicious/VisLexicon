import { TextField } from '../vendor/paradise-ui/packages/components/TextField/src/TextField.tsx'
import { tailwindTextFieldElementClass } from '../vendor/paradise-ui/packages/components/TextField/src/elementClass.ts'

// Preserve the original Basic story's label, placeholder and Tailwind element-class renderer.
export default function ParadiseTextFieldBasic({ p = {} } = {}) {
  return (
    <form style={{ width: '100%', maxWidth: '500px', margin: 'auto' }}>
      <TextField {...p} elementClass={tailwindTextFieldElementClass} />
    </form>
  )
}
